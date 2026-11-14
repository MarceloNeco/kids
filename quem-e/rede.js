/* Quem é? — Duelo de Caras em dois aparelhos (cada um no seu celular), sem tela: roda no Node para os testes.

   O CANAL: o mesmo jeito da Batalha Naval (batalha-naval/rede.js). Supabase Realtime "broadcast" no canal
   "quem-e-<código>" (código de 4 letras), com a URL e a chave publishable da plataforma, públicas por desenho (não dão
   acesso a tabela nenhuma). O supabase-js é o da Bagunçolândia, carregado só quando alguém joga em rede.
   Com ?teste o canal é um BroadcastChannel do navegador (testes com duas abas, sem internet).
   A sala é pública (quem tem o código manda mensagem): TODA mensagem que chega passa por validar(), e a tela só usa
   textContent com o que veio de fora.

   O SEGREDO: fica só no aparelho do dono. Quem pergunta manda só o id da pergunta; quem responde confere no próprio
   aparelho (resposta errada não sai dele) e manda Sim/Não. No palpite, o aparelho do outro diz se acertou. No fim,
   cada um mostra o seu ("revelar").

   QUEM ESTÁ PRONTO: escolher o segredo acontece ao mesmo tempo nos dois aparelhos, então não entra no diário: a
   mensagem "pronto" (repetida no pulso) diz só que o outro já escolheu.
   O DIÁRIO: depois disso a vez é de um só por vez. Tudo o que muda a partida é um evento numerado { n, j (jogador 0 ou 1), k (tipo), ... }. Os dois aparelhos
   guardam o mesmo diário e aplicam os eventos na mesma ordem na sua QEPartida. Cada aparelho só cria eventos dele
   (j = eu) e só aceita de fora eventos do outro (j = outro). Perdeu mensagem? O "pulso" (a cada 3 s) diz quantos
   eventos cada um tem, e quem tem mais reenvia o que falta. Não há anfitrião depois do começo.
     tipos: pergunta { p } · resposta { r } · fimvez · palpite { c } ·
            veredito { ok }
   Mensagens: oi (quero entrar, repetido a cada 2 s até chegar a "sala") · sala { para, nivel, semente } (só quem criou)
     · nao { para, motivo: 'cheia' } · pronto · ev { e } · pulso { n, p } · revelar { c } (só depois do fim) · tchau.
   Recarregar a página: o aparelho guarda tudo (salvar) e volta pelo mesmo código, com o mesmo id; o diário é aplicado
   de novo do começo.

   QERede.criar({ id, codigo, host, nivel, semente, mandar, salvar, aoMudar, agora, dados }) → sala
   QERede.abrir(codigo, aoReceber, aoCair, conexao) → Promise<{ mandar, fechar }> */
(function (raiz) {
  'use strict';
  var L = raiz.QELogica || (typeof require === 'function' ? require('./logica.js') : null);
  var QP = raiz.QEPartida || (typeof require === 'function' ? require('./partida.js') : null);
  var SUPABASE_URL = 'https://qvdvkqydhnadhewcidia.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_oRJmeUwlBbOP_HoOXf0xLw_4O8v43EA';
  var LIB = '../baguncolandia/libs/supabase.js';
  var LOCAL = /[?&](teste|local)\b/.test((raiz.location && raiz.location.search) || '');
  var TEMPO = { pulso: 3000, oi: 2000, ausente: 12000 };
  var MAXN = 2000, TIPOS = ['pergunta', 'resposta', 'fimvez', 'palpite', 'veredito'];

  // ======================= validar o que chega =======================
  function id8(v) { return typeof v === 'string' && /^[a-z0-9]{8}$/.test(v) ? v : null; }
  function int(v, min, max) { return typeof v === 'number' && v === Math.floor(v) && v >= min && v <= max ? v : null; }
  function evento(e) {
    if (!e || typeof e !== 'object' || Array.isArray(e)) return null;
    var r = { n: int(e.n, 0, MAXN), j: int(e.j, 0, 1), k: TIPOS.indexOf(e.k) >= 0 ? e.k : null };
    if (r.n === null || r.j === null || r.k === null) return null;
    if (r.k === 'pergunta') { r.p = typeof e.p === 'string' && /^[a-z-]{2,24}$/.test(e.p) ? e.p : null; if (!r.p) return null; }
    if (r.k === 'resposta') { if (typeof e.r !== 'boolean') return null; r.r = e.r; }
    if (r.k === 'palpite') { r.c = int(e.c, 0, 63); if (r.c === null) return null; }
    if (r.k === 'veredito') { if (typeof e.ok !== 'boolean') return null; r.ok = e.ok; }
    return r;
  }
  function validar(m) {
    if (!m || typeof m !== 'object' || Array.isArray(m)) return null;
    var de = id8(m.de); if (!de) return null;
    var r = { t: m.t, de: de };
    switch (m.t) {
      case 'oi': case 'tchau': case 'pronto': return r;
      case 'pulso': r.n = int(m.n, 0, MAXN); r.p = m.p === true; return r.n === null ? null : r;
      case 'sala':
        r.para = id8(m.para); r.nivel = L.NIVEIS[m.nivel] ? m.nivel : null; r.semente = int(m.semente, 0, 4294967295);
        return r.para && r.nivel && r.semente !== null ? r : null;
      case 'nao': r.para = id8(m.para); return r.para && m.motivo === 'cheia' ? (r.motivo = 'cheia', r) : null;
      case 'ev': r.e = evento(m.e); return r.e ? r : null;
      case 'revelar': r.c = int(m.c, 0, 63); return r.c === null ? null : r;
      default: return null;
    }
  }

  function codigoNovo(rnd) { rnd = rnd || Math.random; var A = 'ABCDEFGHJKLMNPRSTUVWXYZ', c = ''; for (var i = 0; i < 4; i++) c += A[Math.floor(rnd() * A.length)]; return c; }
  function idNovo() { var c = ''; while (c.length < 8) c += Math.random().toString(36).slice(2).replace(/[^a-z0-9]/g, ''); return c.slice(0, 8); }

  // ======================= a sala (sem tela) =======================
  function criar(op) {
    var agora = op.agora || Date.now;
    var s = op.dados ? JSON.parse(JSON.stringify(op.dados)) : {
      codigo: op.codigo, id: op.id, host: !!op.host, eu: op.host ? 0 : 1, outro: null,
      nivel: op.host ? op.nivel : null, semente: op.host ? op.semente >>> 0 : null,
      segredo: null, outroPronto: false, log: [], revelado: null, cheia: false, saiu: false
    };
    var partida = null, ultimo = agora(), ultPulso = 0, ultOi = 0, aplicando = false;

    function salvar() { try { if (op.salvar) op.salvar(JSON.parse(JSON.stringify(s))); } catch (e) { /* sem espaço */ } }
    function avisar() { if (op.aoMudar) try { op.aoMudar(); } catch (e) { /* tela */ } }
    function mandar(m) { m.de = s.id; try { op.mandar(m); } catch (e) { /* sem rede: o pulso reenvia */ } }

    // aplica um evento na QEPartida; devolve false se a regra não deixa (o evento então não entra no diário)
    function aplicar(e) {
      var p = partida;
      try {
        if (e.k === 'pergunta') p.perguntar(e.j, e.p);
        else if (e.k === 'resposta') { if (!p.responder(e.j, e.r).ok) return false; }
        else if (e.k === 'fimvez') p.pronto(e.j);
        else if (e.k === 'palpite') p.palpite(e.j, e.c);
        else if (e.k === 'veredito') { if (p.estado.passo === 'veredito') p.veredito(e.ok); else if (p.estado.ultima && p.estado.ultima.palpite === undefined) return false; }
        return true;
      } catch (err) { return false; }
    }
    function montar() {
      partida = QP.criar({ modo: 'rede', nivel: s.nivel, semente: s.semente, eu: s.eu });
      if (s.segredo !== null) partida.escolherSegredo(s.eu, s.segredo);
      if (s.outroPronto) partida.marcarPronto(1 - s.eu);
      aplicando = true;
      s.log.forEach(function (e) { aplicar(e); });
      aplicando = false;
    }
    if (s.nivel) montar();

    // um evento meu: confere com a regra, guarda no diário e manda
    function registrar(e) {
      e.n = s.log.length; e.j = s.eu;
      if (!aplicar(e)) return false;
      s.log.push(e); mandar({ t: 'ev', e: e }); salvar(); avisar();
      return true;
    }

    function receberEvento(e) {
      if (e.j === s.eu || e.n !== s.log.length) return;   // meu (já tenho) ou fora de ordem (o pulso resolve)
      if (!aplicar(e)) return;
      s.log.push(e);
      // palpite do outro no MEU segredo: eu já sei se acertou, e digo a ele
      if (e.k === 'palpite' && !aplicando) {
        var ultimo2 = partida.estado;
        registrar({ k: 'veredito', ok: ultimo2.fase === 'fim' && ultimo2.vencedor === e.j });
      }
      salvar(); avisar();
    }

    var sala = {
      get id() { return s.id; }, get eu() { return s.eu; }, get partida() { return partida; }, codigo: s.codigo,
      diario: function () { return s.log.map(function (e) { return JSON.stringify(e, Object.keys(e).sort()); }); },
      revelado: function () { return s.revelado; },
      cheia: function () { return s.cheia; },
      outroAqui: function () { return !!s.outro && agora() - ultimo < TEMPO.ausente; },
      esperando: function () { return !partida; },
      temOutro: function () { return !!s.outro; },

      // a tela pede: 'segredo' { c } · 'pergunta' { p } · 'resposta' { r } · 'fimvez' · 'palpite' { c }
      agir: function (k, d) {
        d = d || {};
        if (!partida) return { ok: false };
        if (k === 'segredo') {
          if (s.segredo !== null) return { ok: false };
          try { partida.escolherSegredo(s.eu, d.c); } catch (e) { return { ok: false }; }
          s.segredo = d.c; mandar({ t: 'pronto' }); salvar(); avisar(); return { ok: true };
        }
        if (k === 'resposta') {
          var e = partida.estado;
          if (e.passo !== 'responder' || !L.conferir(partida.tabuleiro.caras[s.segredo], e.ultima.pergunta, d.r)) return { ok: false };
          return { ok: registrar({ k: 'resposta', r: !!d.r }) };
        }
        if (k === 'pergunta') return { ok: registrar({ k: 'pergunta', p: d.p }) };
        if (k === 'fimvez') return { ok: registrar({ k: 'fimvez' }) };
        if (k === 'palpite') return { ok: registrar({ k: 'palpite', c: d.c }) };
        return { ok: false };
      },

      receber: function (bruto) {
        var m = validar(bruto); if (!m || m.de === s.id) return;
        if (m.t === 'oi') {
          if (!s.host) return;
          if (!s.outro || s.outro === m.de) { s.outro = m.de; ultimo = agora(); mandar({ t: 'sala', para: m.de, nivel: s.nivel, semente: s.semente }); salvar(); avisar(); }
          else mandar({ t: 'nao', para: m.de, motivo: 'cheia' });
          return;
        }
        if (m.t === 'sala') {
          if (s.host || m.para !== s.id || (s.outro && s.outro !== m.de)) return;
          var novo = !s.nivel;
          s.outro = m.de; s.nivel = m.nivel; s.semente = m.semente; ultimo = agora();
          if (novo) { montar(); salvar(); avisar(); }
          return;
        }
        if (m.t === 'nao') { if (m.para === s.id && !s.outro) { s.cheia = true; avisar(); } return; }
        if (m.de !== s.outro) return;   // daqui para baixo, só o outro jogador desta sala
        var antes = s.outro && agora() - ultimo >= TEMPO.ausente;
        ultimo = agora();
        if ((m.t === 'pronto' || (m.t === 'pulso' && m.p)) && !s.outroPronto) {
          s.outroPronto = true; if (partida && partida.estado.fase === 'segredo') partida.marcarPronto(1 - s.eu); salvar(); avisar();
        }
        if (m.t === 'ev' && partida) receberEvento(m.e);
        else if (m.t === 'pulso') { if (m.n < s.log.length) for (var i = m.n; i < s.log.length; i++) mandar({ t: 'ev', e: s.log[i] }); }
        else if (m.t === 'revelar') { if (partida && partida.estado.fase === 'fim' && s.revelado === null) { s.revelado = m.c; salvar(); avisar(); } }
        else if (m.t === 'tchau') { ultimo = 0; avisar(); }
        if (antes) avisar();
      },

      // relógio: chamar a cada meio segundo
      tique: function () {
        var t = agora();
        if (!s.host && !s.nivel && !s.cheia && t - ultOi >= TEMPO.oi) { ultOi = t; mandar({ t: 'oi' }); }
        if (s.outro && t - ultPulso >= TEMPO.pulso) {
          ultPulso = t; mandar({ t: 'pulso', n: s.log.length, p: s.segredo !== null });
          if (partida && partida.estado.fase === 'fim' && s.segredo !== null) mandar({ t: 'revelar', c: s.segredo });
        }
        if (s.outro && t - ultimo >= TEMPO.ausente && t - ultimo < TEMPO.ausente + 600) avisar();
      },
      sair: function () { mandar({ t: 'tchau' }); s.saiu = true; salvar(); }
    };
    return sala;
  }

  // ======================= o canal =======================
  var sb = null, carregando = null;
  function carregarLib() {
    if (raiz.supabase) return Promise.resolve();
    if (carregando) return carregando;
    carregando = new Promise(function (ok, falha) {
      var sc = document.createElement('script'); sc.src = LIB;
      sc.onload = function () { ok(); }; sc.onerror = function () { carregando = null; falha(new Error('supabase-js não carregou')); };
      document.head.appendChild(sc);
    });
    return carregando;
  }
  function entregar(aoReceber) { return function (dado) { if (validar(dado)) { try { aoReceber(dado); } catch (e) { if (raiz.console) console.warn(e); } } }; }
  function abrirLocal(codigo, aoReceber) {
    var bc = new BroadcastChannel('quem-e-' + codigo), r = entregar(aoReceber);
    bc.onmessage = function (ev) { r(ev.data); };
    return Promise.resolve({ mandar: function (m) { try { bc.postMessage(JSON.parse(JSON.stringify(m))); } catch (e) { /* fechado */ } }, fechar: function () { try { bc.close(); } catch (e) { /* ok */ } } });
  }
  function abrirSupabase(codigo, aoReceber, aoCair) {
    return carregarLib().then(function () {
      if (!sb) sb = raiz.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 20 } }, auth: { persistSession: false, autoRefreshToken: false } });
      return new Promise(function (ok, falha) {
        var pronto = false, fechado = false, r = entregar(aoReceber), canal = sb.channel('quem-e-' + codigo, { config: { broadcast: { self: false } } });
        canal.on('broadcast', { event: 'm' }, function (x) { r(x.payload); });
        var limite = setTimeout(function () { if (!pronto) { pronto = true; try { sb.removeChannel(canal); } catch (e) { /* ok */ } falha(new Error('TIMED_OUT')); } }, 15000);
        canal.subscribe(function (st) {
          if (st === 'SUBSCRIBED' && !pronto) {
            pronto = true; clearTimeout(limite);
            ok({ mandar: function (m) { try { canal.send({ type: 'broadcast', event: 'm', payload: m }); } catch (e) { /* sem rede: o pulso reenvia */ } }, fechar: function () { fechado = true; try { sb.removeChannel(canal); } catch (e) { /* ok */ } } });
          } else if ((st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') && !pronto) { pronto = true; clearTimeout(limite); falha(new Error(st)); }
          else if ((st === 'CHANNEL_ERROR' || st === 'TIMED_OUT' || st === 'CLOSED') && pronto && !fechado && aoCair) { fechado = true; try { aoCair(); } catch (e) { /* ok */ } }
        });
      });
    });
  }
  // "📶 Jogar pertinho": canal de dados direto entre os dois aparelhos (../batalha-naval/pertinho.js), sem servidor
  function abrirDireto(conexao, aoReceber, aoCair) {
    var r = entregar(aoReceber), fechado = false;
    conexao.ouvir(function (txt) {
      if (typeof txt !== 'string' || txt.length > 20000) return;
      var m; try { m = JSON.parse(txt); } catch (e) { return; }
      r(m);
    }, function () { if (!fechado && aoCair) { fechado = true; try { aoCair(); } catch (e) { /* ok */ } } });
    return Promise.resolve({ mandar: function (m) { try { conexao.enviar(JSON.stringify(m)); } catch (e) { /* fechado */ } }, fechar: function () { fechado = true; conexao.fechar(); } });
  }

  var API = {
    criar: criar, validar: validar, codigoNovo: codigoNovo, idNovo: idNovo, TEMPO: TEMPO, LOCAL: LOCAL,
    abrir: function (codigo, aoReceber, aoCair, conexao) {
      if (conexao) return abrirDireto(conexao, aoReceber, aoCair);
      return LOCAL ? abrirLocal(codigo, aoReceber) : abrirSupabase(codigo, aoReceber, aoCair);
    }
  };
  raiz.QERede = API;
  if (typeof module === 'object' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
