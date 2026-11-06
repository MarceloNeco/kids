/* Batalha Naval — "📶 Jogar pertinho (sem internet)": dois aparelhos na mesma rede Wi-Fi (por exemplo, um celular com o
   Roteador Wi-Fi / Ponto de acesso ligado, mesmo em modo avião, e o outro conectado nele), sem servidor nenhum.

   COMO OS DOIS SE ACHAM: WebRTC (RTCPeerConnection + RTCDataChannel) sem servidor de ICE (iceServers: []), então só os
   endereços da própria rede local. Sem servidor, a "apresentação" (oferta e resposta do WebRTC) vai por QR code:
     1. quem cria  → oferta  → mostra o QR (BN1O…)
     2. quem entra → lê a oferta, cria a resposta → mostra o QR (BN1R…)
     3. quem cria  → lê a resposta → conectados. Daí o jogo corre pelo canal de dados com as MESMAS mensagens do jogo
        pela internet (rede.js: BNRede.abrir(..., conexao) valida tudo do mesmo jeito).

   O CÓDIGO (curto, para o QR ficar pequeno e fácil de ler da tela de outro celular): do SDP só vai o que importa —
   ice-ufrag, ice-pwd, a impressão digital (fingerprint) do DTLS, o setup (papel no DTLS), o mid e os endereços (host,
   UDP) — em bytes, e os bytes viram texto num alfabeto de 43 letras que cabe no modo "alfanumérico" do QR (3 letras
   a cada 2 bytes, quase sem desperdício). Do outro lado o SDP é remontado inteiro.
     texto = "BN" + versão do código ("1") + tipo ("O" oferta, "R" resposta) + bytes em base 43
     bytes = setup · ufrag (tamanho + 6 bits por letra) · pwd (idem) · algoritmo + fingerprint · mid (tamanho + letras)
             · endereços (quantos; cada um: tipo 0 IPv4 / 1 IPv6 / 2 nome mDNS ".local", o endereço e a porta) · conferência
   Versão diferente → erro "versao" (aviso amigável: atualizem os dois aparelhos); qualquer outra coisa → "lixo".

   BNPertinho.paraCodigo({ type, sdp }) → texto      BNPertinho.deCodigo(texto) → { type, sdp }  (erro.codigo: versao | lixo)
   BNPertinho.criar(op)  → Promise<{ codigo, aceitar(textoResposta) → Promise, aberta: Promise<conexao>, fechar() }>
   BNPertinho.entrar(textoOferta, op) → Promise<{ codigo, aberta: Promise<conexao>, fechar() }>
     op.camera: true = pede a câmera um instante antes de juntar os endereços (com a câmera liberada o navegador mostra
     o endereço de verdade do aparelho na rede, em vez de um nome ".local" que alguns roteadores de celular não resolvem).
   conexao = { enviar(texto), ouvir(aoChegar, aoCair), fechar() }  (o que chega antes de alguém ouvir fica guardado) */
(function (raiz) {
  'use strict';
  var VERSAO = '1';
  var ALFA = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$%+-./:';           // 43 letras do modo alfanumérico do QR (sem espaço e sem *)
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; // letras permitidas em ice-ufrag/ice-pwd
  var SETUP = ['actpass', 'active', 'passive'];
  var HASH = [['sha-256', 32], ['sha-384', 48], ['sha-512', 64], ['sha-1', 20]];
  var MAX_END = 6, ESPERA_ENDERECOS = 5000, CALMA = 700;

  function erro(codigo, msg) { var e = new Error(msg || codigo); e.codigo = codigo; return e; }

  // ---------- base 43: 2 bytes → 3 letras ----------
  function base43(bytes) {
    var s = '';
    for (var i = 0; i + 1 < bytes.length; i += 2) {
      var v = bytes[i] * 256 + bytes[i + 1];
      s += ALFA[v % 43] + ALFA[Math.floor(v / 43) % 43] + ALFA[Math.floor(v / 1849)];
    }
    if (bytes.length % 2) { var u = bytes[bytes.length - 1]; s += ALFA[u % 43] + ALFA[Math.floor(u / 43)]; }
    return s;
  }
  function de43(s) {
    if (s.length % 3 === 1) throw erro('lixo');
    var out = [];
    for (var i = 0; i < s.length; i += 3) {
      var a = ALFA.indexOf(s[i]), b = ALFA.indexOf(s[i + 1]), c = i + 2 < s.length ? ALFA.indexOf(s[i + 2]) : -2;
      if (a < 0 || b < 0 || c === -1) throw erro('lixo');
      if (c === -2) { var u = a + b * 43; if (u > 255) throw erro('lixo'); out.push(u); }
      else { var v = a + b * 43 + c * 1849; if (v > 65535) throw erro('lixo'); out.push(v >> 8, v & 255); }
    }
    return out;
  }
  function conferencia(bytes, tipo) {           // CRC-8 (polinômio 0x07) dos bytes e do tipo
    var c = tipo.charCodeAt(0);
    for (var i = 0; i < bytes.length; i++) { c ^= bytes[i]; for (var k = 0; k < 8; k++) c = c & 0x80 ? ((c << 1) ^ 7) & 255 : (c << 1) & 255; }
    return c;
  }

  // ---------- ler o SDP ----------
  function campo(sdp, nome) { var m = new RegExp('^a=' + nome + ':(.*)$', 'm').exec(sdp); return m ? m[1].trim() : null; }
  function enderecos(sdp) {
    var l = [], vistos = {};
    sdp.split(/\r?\n/).forEach(function (ln) {
      var m = /^a=candidate:\S+ (\d+) (\S+) \d+ (\S+) (\d+) typ host\b/i.exec(ln.trim());
      if (!m || m[1] !== '1' || m[2].toLowerCase() !== 'udp') return;
      var end = m[3].toLowerCase(), porta = +m[4], tipo;
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(end)) tipo = 0;
      else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.local$/.test(end)) tipo = 2;
      else if (end.indexOf(':') >= 0 && ip6(end)) tipo = 1;
      else return;
      if (porta < 1 || porta > 65535 || vistos[end + ' ' + porta]) return;
      vistos[end + ' ' + porta] = 1; l.push({ tipo: tipo, end: end, porta: porta });
    });
    l.sort(function (a, b) { return [0, 2, 1][a.tipo] - [0, 2, 1][b.tipo]; });   // IPv4, depois nome .local, depois IPv6
    return l.slice(0, MAX_END);
  }
  function ip6(s) {                              // "fe80::1" → 16 bytes (null se não for)
    if (s.indexOf('%') >= 0 || s.indexOf('.') >= 0) return null;
    var partes = s.split('::'); if (partes.length > 2) return null;
    var a = partes[0] ? partes[0].split(':') : [], b = partes.length > 1 && partes[1] ? partes[1].split(':') : [];
    var falta = 8 - a.length - b.length; if (partes.length === 1 ? falta !== 0 : falta < 1) return null;
    var g = a.concat(new Array(partes.length > 1 ? falta : 0).fill('0'), b), out = [];
    for (var i = 0; i < 8; i++) { if (!/^[0-9a-f]{1,4}$/.test(g[i])) return null; var v = parseInt(g[i], 16); out.push(v >> 8, v & 255); }
    return out;
  }
  function seis(txt) {                           // letras de ice-ufrag/pwd → 6 bits cada
    var out = [txt.length], acc = 0, n = 0;
    for (var i = 0; i < txt.length; i++) {
      var v = B64.indexOf(txt[i]); if (v < 0) throw erro('sdp', 'letra fora do ICE: ' + txt[i]);
      acc = (acc << 6) | v; n += 6;
      while (n >= 8) { n -= 8; out.push((acc >> n) & 255); }
    }
    if (n) out.push((acc << (8 - n)) & 255);
    return out;
  }
  function deSeis(b, p) {                        // → [texto, nova posição]
    var len = b[p.i++], bytes = Math.ceil(len * 6 / 8), acc = 0, n = 0, s = '';
    if (len === undefined || len < 4 || len > 256 || p.i + bytes > b.length) throw erro('lixo');
    for (var i = 0; i < bytes; i++) { acc = ((acc << 8) | b[p.i++]) & 0xffff; n += 8; while (n >= 6 && s.length < len) { n -= 6; s += B64[(acc >> n) & 63]; } }
    return s;
  }

  // { type: 'offer' | 'answer', sdp } → "BN1O…" / "BN1R…"
  function paraCodigo(desc) {
    var sdp = desc.sdp, tipo = desc.type === 'offer' ? 'O' : desc.type === 'answer' ? 'R' : null;
    if (!tipo) throw erro('sdp', 'tipo');
    var ufrag = campo(sdp, 'ice-ufrag'), pwd = campo(sdp, 'ice-pwd'), fp = campo(sdp, 'fingerprint'), setup = campo(sdp, 'setup'), mid = campo(sdp, 'mid');
    var sctp = campo(sdp, 'sctp-port');
    if (!ufrag || !pwd || !fp || !setup || mid === null || !/^m=application /m.test(sdp)) throw erro('sdp', 'faltou parte do SDP');
    if (sctp && sctp !== '5000') throw erro('sdp', 'sctp-port ' + sctp);
    var b = [SETUP.indexOf(setup)]; if (b[0] < 0) throw erro('sdp', 'setup ' + setup);
    b = b.concat(seis(ufrag), seis(pwd));
    var f = /^(\S+) ([0-9A-Fa-f:]+)$/.exec(fp), h = -1;
    if (f) HASH.forEach(function (x, i) { if (x[0] === f[1].toLowerCase()) h = i; });
    var fb = f ? f[2].split(':').map(function (x) { return parseInt(x, 16); }) : [];
    if (h < 0 || fb.length !== HASH[h][1]) throw erro('sdp', 'fingerprint');
    b.push(h); b = b.concat(fb);
    if (mid.length > 16 || !/^[A-Za-z0-9_-]*$/.test(mid)) throw erro('sdp', 'mid');
    b.push(mid.length); for (var i = 0; i < mid.length; i++) b.push(mid.charCodeAt(i));
    var ends = enderecos(sdp);
    b.push(ends.length);
    ends.forEach(function (e) {
      b.push(e.tipo);
      if (e.tipo === 0) e.end.split('.').forEach(function (x) { b.push(+x & 255); });
      else if (e.tipo === 1) b = b.concat(ip6(e.end));
      else e.end.slice(0, 36).replace(/-/g, '').match(/../g).forEach(function (x) { b.push(parseInt(x, 16)); });
      b.push(e.porta >> 8, e.porta & 255);
    });
    b.push(conferencia(b, tipo));
    return 'BN' + VERSAO + tipo + base43(b);
  }

  // texto lido (QR ou colado) → { type, sdp }; erro.codigo: 'versao' (código de outra versão do jogo) ou 'lixo'
  function deCodigo(texto) {
    var t = String(texto == null ? '' : texto).replace(/\s+/g, '').toUpperCase();
    var m = /^BN(\d+)([A-Z])(.*)$/.exec(t);
    if (!m) throw erro('lixo');
    if (m[1] !== VERSAO) throw erro('versao');
    var tipo = m[2]; if (tipo !== 'O' && tipo !== 'R') throw erro('lixo');
    var b = de43(m[3]);
    if (b.length < 40 || conferencia(b.slice(0, -1), tipo) !== b[b.length - 1]) throw erro('lixo');
    b = b.slice(0, -1);
    var p = { i: 0 }, setup = SETUP[b[p.i++]]; if (!setup) throw erro('lixo');
    var ufrag = deSeis(b, p), pwd = deSeis(b, p), h = HASH[b[p.i++]]; if (!h || p.i + h[1] > b.length) throw erro('lixo');
    var fp = b.slice(p.i, p.i + h[1]).map(function (x) { return (x < 16 ? '0' : '') + x.toString(16).toUpperCase(); }).join(':'); p.i += h[1];
    var ml = b[p.i++]; if (ml === undefined || ml > 16 || p.i + ml > b.length) throw erro('lixo');
    var mid = String.fromCharCode.apply(null, b.slice(p.i, p.i + ml)); p.i += ml;
    if (!/^[A-Za-z0-9_-]*$/.test(mid)) throw erro('lixo');
    var n = b[p.i++]; if (n === undefined || n > MAX_END) throw erro('lixo');
    var cands = [];
    for (var k = 0; k < n; k++) {
      var tp = b[p.i++], tam = [4, 16, 16][tp]; if (!tam || p.i + tam + 2 > b.length) throw erro('lixo');
      var a = b.slice(p.i, p.i + tam), end; p.i += tam;
      if (tp === 0) end = a.join('.');
      else if (tp === 1) { end = []; for (var j = 0; j < 16; j += 2) end.push(((a[j] << 8) | a[j + 1]).toString(16)); end = end.join(':'); }
      else { var hx = a.map(function (x) { return (x < 16 ? '0' : '') + x.toString(16); }).join(''); end = hx.slice(0, 8) + '-' + hx.slice(8, 12) + '-' + hx.slice(12, 16) + '-' + hx.slice(16, 20) + '-' + hx.slice(20) + '.local'; }
      var porta = (b[p.i] << 8) | b[p.i + 1]; p.i += 2;
      if (!porta) throw erro('lixo');
      cands.push('a=candidate:' + (k + 1) + ' 1 udp ' + (2122260223 - k * 256) + ' ' + end + ' ' + porta + ' typ host generation 0');
    }
    if (p.i !== b.length) throw erro('lixo');
    var linhas = ['v=0', 'o=- ' + (Math.floor(Math.random() * 9e15) + 1e15) + ' 2 IN IP4 127.0.0.1', 's=-', 't=0 0',
      'a=group:BUNDLE ' + mid, 'a=msid-semantic: WMS', 'm=application 9 UDP/DTLS/SCTP webrtc-datachannel', 'c=IN IP4 0.0.0.0']
      .concat(cands, cands.length ? ['a=end-of-candidates'] : [],
        ['a=ice-ufrag:' + ufrag, 'a=ice-pwd:' + pwd, 'a=ice-options:trickle', 'a=fingerprint:' + h[0] + ' ' + fp,
          'a=setup:' + setup, 'a=mid:' + mid, 'a=sctp-port:5000', 'a=max-message-size:262144']);
    return { type: tipo === 'O' ? 'offer' : 'answer', sdp: linhas.join('\r\n') + '\r\n', enderecos: n };
  }

  // ======================= no navegador: WebRTC =======================
  // espera os endereços: terminou, ou ficou quieto um pouquinho depois do último, ou no máximo 5 s
  function juntarEnderecos(pc) {
    return new Promise(function (ok) {
      var calma = null, feito = false;
      function fim() { if (feito) return; feito = true; clearTimeout(calma); clearTimeout(teto); ok(pc.localDescription); }
      var teto = setTimeout(fim, ESPERA_ENDERECOS);
      pc.addEventListener('icecandidate', function (e) { clearTimeout(calma); if (!e.candidate) fim(); else calma = setTimeout(fim, CALMA); });
      pc.addEventListener('icegatheringstatechange', function () { if (pc.iceGatheringState === 'complete') fim(); });
      if (pc.iceGatheringState === 'complete') fim();
    });
  }
  // a câmera ligada (ou liberada) faz o navegador mostrar o endereço de verdade do aparelho; sem câmera, segue igual
  function talvezCamera(querer) {
    if (!querer || !raiz.navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.resolve(null);
    return Promise.race([
      navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }).catch(function () { return null; }),
      new Promise(function (ok) { setTimeout(function () { ok(null); }, 6000); })
    ]);
  }
  function pararCamera(st) { if (st && st.getTracks) st.getTracks().forEach(function (t) { try { t.stop(); } catch (e) { /* ok */ } }); }

  // o canal aberto, do jeito que o rede.js usa
  function conexao(pc, dc) {
    var fila = [], aoChegar = null, aoCair = null, caiu = false, tDesc = null;
    function cair() {
      if (caiu) return; caiu = true; clearTimeout(tDesc);
      if (aoCair) { try { aoCair(); } catch (e) { /* ok */ } }
    }
    dc.onmessage = function (ev) { if (typeof ev.data !== 'string') return; if (aoChegar) aoChegar(ev.data); else if (fila.length < 200) fila.push(ev.data); };
    dc.onclose = cair;
    pc.addEventListener('connectionstatechange', function () {
      var st = pc.connectionState;
      if (st === 'failed' || st === 'closed') cair();
      else if (st === 'disconnected') { clearTimeout(tDesc); tDesc = setTimeout(function () { if (pc.connectionState !== 'connected') cair(); }, 15000); }
      else if (st === 'connected') clearTimeout(tDesc);
    });
    return {
      enviar: function (txt) { if (dc.readyState === 'open') dc.send(txt); },
      ouvir: function (chegar, queda) { aoChegar = chegar; aoCair = queda; var f = fila; fila = []; f.forEach(function (x) { chegar(x); }); if (caiu) cair(); },
      fechar: function () { caiu = true; try { dc.close(); } catch (e) { /* ok */ } try { pc.close(); } catch (e) { /* ok */ } },
      pc: pc
    };
  }
  // aberta: resolve quando o canal abre; rejeita se a conexão falhar antes
  function esperarAbrir(pc, dcPromessa) {
    return new Promise(function (ok, falha) {
      pc.addEventListener('connectionstatechange', function () { if (pc.connectionState === 'failed') falha(erro('falhou')); });
      dcPromessa.then(function (dc) {
        var abriu = function () { ok(conexao(pc, dc)); };
        if (dc.readyState === 'open') abriu(); else dc.addEventListener('open', abriu, { once: true });
      });
    });
  }
  function novoPc() { return new RTCPeerConnection({ iceServers: [] }); }
  function semEndereco(desc) { return !/^a=candidate:/m.test(desc.sdp); }

  // quem cria: oferta → mostra o código; depois aceitar(resposta lida)
  function criar(op) {
    op = op || {};
    return talvezCamera(op.camera).then(function (st) {
      var pc = novoPc(), dc = pc.createDataChannel('batalha-naval', { ordered: true });
      var aberta = esperarAbrir(pc, Promise.resolve(dc));
      aberta.catch(function () { /* quem usa trata */ });
      return pc.createOffer().then(function (o) { return pc.setLocalDescription(o); }).then(function () { return juntarEnderecos(pc); }).then(function (desc) {
        pararCamera(st);
        if (semEndereco(desc)) { pc.close(); throw erro('semrede'); }
        var aceito = false;
        return {
          codigo: paraCodigo(desc), aberta: aberta,
          aceitar: function (texto) {
            var r = deCodigo(texto);
            if (r.type !== 'answer') return Promise.reject(erro('tipo'));
            if (aceito) return Promise.resolve();
            aceito = true;
            return pc.setRemoteDescription({ type: 'answer', sdp: r.sdp }).catch(function (e) { aceito = false; throw erro('lixo', e.message); });
          },
          fechar: function () { try { pc.close(); } catch (e) { /* ok */ } }
        };
      }, function (e) { pararCamera(st); try { pc.close(); } catch (x) { /* ok */ } throw e; });
    });
  }
  // quem entra: lê a oferta → resposta → mostra o código; abre quando o outro ler
  function entrar(texto, op) {
    op = op || {};
    var r;
    try { r = deCodigo(texto); } catch (e) { return Promise.reject(e); }
    if (r.type !== 'offer') return Promise.reject(erro('tipo'));
    return talvezCamera(op.camera).then(function (st) {
      var pc = novoPc(), recebido = new Promise(function (ok) { pc.addEventListener('datachannel', function (e) { ok(e.channel); }); });
      var aberta = esperarAbrir(pc, recebido);
      aberta.catch(function () { /* quem usa trata */ });
      return pc.setRemoteDescription({ type: 'offer', sdp: r.sdp }).catch(function (e) { throw erro('lixo', e.message); })
        .then(function () { return pc.createAnswer(); }).then(function (a) { return pc.setLocalDescription(a); })
        .then(function () { return juntarEnderecos(pc); }).then(function (desc) {
          pararCamera(st);
          if (semEndereco(desc)) { pc.close(); throw erro('semrede'); }
          return { codigo: paraCodigo(desc), aberta: aberta, fechar: function () { try { pc.close(); } catch (e) { /* ok */ } } };
        }, function (e) { pararCamera(st); try { pc.close(); } catch (x) { /* ok */ } throw e; });
    });
  }

  var API = { VERSAO: VERSAO, ALFA: ALFA, paraCodigo: paraCodigo, deCodigo: deCodigo, criar: criar, entrar: entrar,
    temWebRTC: function () { return typeof raiz.RTCPeerConnection === 'function'; } };
  raiz.BNPertinho = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : this);
