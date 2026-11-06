/* Batalha Naval — jogar em aparelhos diferentes (2 a 4 jogadores).

   O CANAL: Supabase Realtime "broadcast" num canal "batalha-naval-<código>" (código de 4 letras), com a URL e a chave
   publishable da plataforma — públicas por desenho, não dão acesso a tabela nenhuma (a mesma da Rabiscolândia).
   O supabase-js é o da Bagunçolândia (../baguncolandia/libs/supabase.js), carregado só quando alguém joga em rede.
   Com ?teste (ou ?local) o canal é um BroadcastChannel do próprio navegador (testes sem internet: várias abas).
   No "📶 Jogar pertinho" (sem internet) o canal é um RTCDataChannel direto entre os dois aparelhos (pertinho.js).
   A sala é pública (quem tem o código manda mensagem): TODA mensagem que chega passa por validar() antes de ser usada,
   e a tela só usa textContent com o que veio de fora.

   O SEGREDO DE CADA UM: a frota fica só no aparelho do dono. Quem atira manda só o tiro (alvo, x, y); o dono do
   tabuleiro responde água / acerto / afundou (e, quando afunda, onde estava aquele navio). No fim, cada um mostra a frota.

   QUEM MANDA: o anfitrião (quem criou a partida) guarda a ordem dos jogadores, de quem é a vez e o diário de tiros, e
   manda o "estado" para todos a cada mudança e a cada 3 s (o estado serve também de "estou aqui").
     oi      quero entrar / voltei (recarreguei a página)      → o anfitrião põe na lista e manda o estado
     pulso   estou aqui (a cada 3 s)                            → sem notícia por 12 s = "saiu da conexão"
     pronto  minha frota está arrumada (ok: true/false)
     tiro    { alvo, x, y, n }  (n = número do tiro na partida)  → repetido a cada 1,5 s até virar diário
     resp    { a, x, y, n, r, nv }  (r: 0 água, 1 acerto, 2 afundou; nv = navio afundado [x, y, tam, h])
     estado  { era, ep, h, fase, nivel, j, vez, seq, log, venc }  (só o anfitrião)
     tchau   saí de vez (a vez pula a pessoa; numa dupla, o outro ganha)
     frota   no fim: minha frota, para todos verem onde estava
     nao     { para, motivo } — a partida já começou ou a sala está cheia
   Recarregar a página: o aparelho guarda tudo (localStorage) e volta pelo mesmo código, com o mesmo id.
   Anfitrião sumiu (15 s sem estado): o primeiro da lista que ainda está aqui vira anfitrião ("era" nova); se o antigo
   voltar, vê a era maior e passa a ser jogador. Anfitrião que sai pelo botão passa o comando antes de sair.

   BNRede.criar(op) → partida (sem tela: roda no Node para os testes). op = { id, nome, codigo, host, nivel,
     mandar(msg), salvar(dados), aoMudar(), agora(), rnd(), dados (para voltar de onde parou) }
   BNRede.abrir(codigo, aoReceber, aoCair, conexao) → Promise<{ mandar(msg), fechar() }>  (o canal de verdade; aoCair = caiu
     depois de conectado). Com "conexao" (canal direto do pertinho.js, sem internet) o código não é usado. */
(function (raiz) {
  'use strict';
  var L = raiz.BNLogica || (typeof require === 'function' ? require('./logica.js') : null);
  var SUPABASE_URL = 'https://qvdvkqydhnadhewcidia.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_oRJmeUwlBbOP_HoOXf0xLw_4O8v43EA';
  var LIB = '../baguncolandia/libs/supabase.js';
  var LOCAL = /[?&](teste|local)\b/.test((raiz.location && raiz.location.search) || '');
  var TEMPO = { pulso: 3000, estado: 3000, oi: 2000, tiro: 1500, ausente: 12000, anfitriao: 15000 };
  var MAX = 4, MAXSEQ = 2000, FASES = ['sala', 'jogo', 'fim'];

  // ======================= validar o que chega =======================
  function id8(v) { return typeof v === 'string' && /^[a-z0-9]{8}$/.test(v) ? v : null; }
  function nome(v) { return typeof v === 'string' ? v.replace(/[<>&"'`\\\u0000-\u001f\u007f]/g, '').trim().slice(0, 16) : ''; }
  function int(v, min, max) { return L.inteiro(v, min, max) ? v : null; }
  function navio(a, n) {
    if (!Array.isArray(a) || a.length !== 4) return null;
    var x = int(a[0], 0, n - 1), y = int(a[1], 0, n - 1), tam = int(a[2], 2, 5), h = a[3] === 1 ? 1 : a[3] === 0 ? 0 : null;
    if (x === null || y === null || tam === null || h === null || !L.dentro({ x: x, y: y, tam: tam, h: h === 1 }, n)) return null;
    return [x, y, tam, h];
  }
  function validarEstado(m, r) {
    var cfg = L.NIVEIS[m.nivel];
    if (!cfg || FASES.indexOf(m.fase) < 0 || !Array.isArray(m.j) || m.j.length < 1 || m.j.length > MAX) return null;
    var n = cfg.n, ids = {}, j = [];
    for (var i = 0; i < m.j.length; i++) {
      var p = m.j[i]; if (!p || typeof p !== 'object') return null;
      var pid = id8(p.id); if (!pid || ids[pid]) return null; ids[pid] = 1;
      j.push({ id: pid, nome: nome(p.nome), p: p.p === 1 ? 1 : 0, f: p.f === 1 ? 1 : 0, au: p.au === 1 ? 1 : 0, s: p.s === 1 ? 1 : 0 });
    }
    var k = j.length;
    r.era = int(m.era, 1, 1e6); r.ep = int(m.ep, 0, 1e9); r.h = int(m.h, 0, k - 1); r.vez = int(m.vez, -1, k - 1);
    r.seq = int(m.seq, 0, MAXSEQ); r.venc = int(m.venc, -1, k - 1);
    if (r.era === null || r.ep === null || r.h === null || r.vez === null || r.seq === null || r.venc === null) return null;
    if (!Array.isArray(m.log) || m.log.length !== r.seq) return null;
    var log = [], vistos = {};
    for (var q = 0; q < m.log.length; q++) {
      var e = m.log[q]; if (!Array.isArray(e) || (e.length !== 5 && e.length !== 9)) return null;
      var a = int(e[0], 0, k - 1), b = int(e[1], 0, k - 1), x = int(e[2], 0, n - 1), y = int(e[3], 0, n - 1), rc = int(e[4], 0, 2);
      if (a === null || b === null || a === b || x === null || y === null || rc === null) return null;
      var ch = b + ':' + x + ',' + y; if (vistos[ch]) return null; vistos[ch] = 1;   // ninguém atira duas vezes no mesmo lugar
      var ent = [a, b, x, y, rc];
      if (rc === 2) { if (e.length !== 9) return null; var nv = navio(e.slice(5), n); if (!nv) return null; ent = ent.concat(nv); }
      else if (e.length !== 5) return null;
      log.push(ent);
    }
    r.fase = m.fase; r.nivel = m.nivel; r.j = j; r.log = log;
    return r;
  }
  function validar(m) {
    if (!m || typeof m !== 'object' || Array.isArray(m)) return null;
    var de = id8(m.de); if (!de) return null;
    var r = { t: m.t, de: de };
    switch (m.t) {
      case 'oi': r.nome = nome(m.nome); return r;
      case 'pulso': case 'tchau': return r;
      case 'pronto': r.ok = m.ok === true; return r;
      case 'nao':
        r.para = id8(m.para); r.motivo = m.motivo === 'cheia' || m.motivo === 'comecou' ? m.motivo : null;
        return r.para && r.motivo ? r : null;
      case 'tiro':
        r.alvo = int(m.alvo, 0, MAX - 1); r.x = int(m.x, 0, 11); r.y = int(m.y, 0, 11); r.n = int(m.n, 0, MAXSEQ);
        return r.alvo === null || r.x === null || r.y === null || r.n === null ? null : r;
      case 'resp':
        r.a = int(m.a, 0, MAX - 1); r.x = int(m.x, 0, 11); r.y = int(m.y, 0, 11); r.n = int(m.n, 0, MAXSEQ); r.r = int(m.r, 0, 2);
        if (r.a === null || r.x === null || r.y === null || r.n === null || r.r === null) return null;
        if (r.r === 2) { r.nv = navio(m.nv, 12); if (!r.nv) return null; }
        return r;
      case 'frota':
        if (!Array.isArray(m.navios) || m.navios.length < 1 || m.navios.length > 7) return null;
        r.navios = [];
        for (var i = 0; i < m.navios.length; i++) { var nv = navio(m.navios[i], 12); if (!nv) return null; r.navios.push(nv); }
        return r;
      case 'estado': return validarEstado(m, r);
      default: return null;
    }
  }

  function codigoNovo(rnd) { rnd = rnd || Math.random; var A = 'ABCDEFGHJKLMNPRSTUVWXYZ', c = ''; for (var i = 0; i < 4; i++) c += A[Math.floor(rnd() * A.length)]; return c; }
  function idNovo() { var c = ''; while (c.length < 8) c += Math.random().toString(36).slice(2).replace(/[^a-z0-9]/g, ''); return c.slice(0, 8); }

  // ======================= a partida (sem tela) =======================
  function criar(op) {
    var agora = op.agora || Date.now, rnd = op.rnd || Math.random;
    var s = op.dados ? JSON.parse(JSON.stringify(op.dados)) : {
      codigo: op.codigo, id: op.id, nome: nome(op.nome), host: !!op.host,
      era: op.host ? 1 : 0, ep: 0, h: 0, fase: 'sala', nivel: op.nivel || 'medio',
      j: op.host ? [{ id: op.id, nome: nome(op.nome), p: 0, f: 0, au: 0, s: 0 }] : [],
      vez: -1, seq: 0, log: [], venc: -1,
      frota: null, querPronto: false, pend: null, foram: {}, revel: {}, revelei: 0, nao: null, saiu: false
    };
    var t0 = agora();
    var vistos = {}, ultEstado = t0, ultEnvio = 0, ultPulso = 0, ultOi = 0, ultRevel = 0, tiroAtual = null, fila = [], sujo = false, ocupado = false;
    function zerarVistos() { s.j.forEach(function (p) { vistos[p.id] = agora(); }); }
    zerarVistos();

    function meu() { for (var i = 0; i < s.j.length; i++) if (s.j[i].id === s.id) return i; return -1; }
    function idxDe(id) { for (var i = 0; i < s.j.length; i++) if (s.j[i].id === id) return i; return -1; }
    function ativo(i) { var p = s.j[i]; return !!p && !p.f && !p.s; }
    function ativos() { var l = []; for (var i = 0; i < s.j.length; i++) if (ativo(i)) l.push(i); return l; }
    function jaNoLog(b, x, y) { return s.log.some(function (e) { return e[1] === b && e[2] === x && e[3] === y; }); }
    function alvoValido(b, a) { return b !== a && ativo(b); }
    function mexeu() { sujo = true; }
    function enviar(m) { try { op.mandar(JSON.parse(JSON.stringify(m))); } catch (e) { /* sem rede: o reenvio cuida */ } fila.push(m); }

    // tudo o que entra (de fora ou do próprio aparelho) passa por aqui; no fim, salva e avisa a tela uma vez só
    function rodar(fn) {
      if (ocupado) { fn(); return; }
      ocupado = true;
      try { fn(); while (fila.length) processar(fila.shift()); }
      finally { ocupado = false; }
      if (sujo) { sujo = false; try { if (op.salvar) op.salvar(exportar()); } catch (e) { /* sem espaço */ } if (op.aoMudar) op.aoMudar(); }
    }
    function exportar() { return JSON.parse(JSON.stringify(s)); }

    // ---------- anfitrião ----------
    function difundir() {
      s.ep++; s.seq = s.log.length; ultEnvio = agora(); conferirPend();
      enviar({ t: 'estado', de: s.id, era: s.era, ep: s.ep, h: s.h, fase: s.fase, nivel: s.nivel, j: s.j, vez: s.vez, seq: s.seq, log: s.log, venc: s.venc });
      mexeu();
    }
    function proximo(v) {
      var k = s.j.length, i, d;
      for (d = 1; d <= k; d++) { i = (v + d) % k; if (ativo(i) && !s.j[i].au) return i; }
      for (d = 1; d <= k; d++) { i = (v + d) % k; if (ativo(i)) return i; }
      return v;
    }
    function verificarFim() {
      var a = ativos();
      if (s.fase === 'jogo' && a.length <= 1) { s.fase = 'fim'; s.venc = a.length ? a[0] : -1; s.vez = -1; tiroAtual = null; }
    }
    function afundados(b) { return s.log.filter(function (e) { return e[1] === b && e[4] === 2; }).length; }
    function tirar(i) {                 // jogador saiu de vez
      if (i < 0 || i >= s.j.length) return;
      if (s.fase === 'sala') { s.j.splice(i, 1); if (s.h > i) s.h--; return; }
      s.j[i].s = 1;
      if (tiroAtual && tiroAtual.alvo === i) tiroAtual = null;
      verificarFim();
      if (s.fase === 'jogo' && s.vez === i) { s.vez = proximo(i); tiroAtual = null; }
    }
    function comoAnfitriao(m) {
      var i = idxDe(m.de);
      if (m.de !== s.id) vistos[m.de] = agora();
      if (m.t === 'oi') {
        if (i >= 0) { s.j[i].au = 0; if (m.nome) s.j[i].nome = m.nome; difundir(); }
        else if (s.fase === 'sala' && s.j.length < MAX) { s.j.push({ id: m.de, nome: m.nome, p: 0, f: 0, au: 0, s: 0 }); difundir(); }
        else enviar({ t: 'nao', de: s.id, para: m.de, motivo: s.fase === 'sala' ? 'cheia' : 'comecou' });
      } else if (m.t === 'pulso') {
        if (i >= 0 && s.j[i].au) { s.j[i].au = 0; difundir(); }
      } else if (m.t === 'pronto') {
        if (i >= 0 && s.fase === 'sala' && s.j[i].p !== (m.ok ? 1 : 0)) { s.j[i].p = m.ok ? 1 : 0; difundir(); }
      } else if (m.t === 'tiro') {
        if (s.fase === 'jogo' && i === s.vez && m.n === s.log.length && m.alvo < s.j.length && alvoValido(m.alvo, i) && !jaNoLog(m.alvo, m.x, m.y) && m.x < L.NIVEIS[s.nivel].n && m.y < L.NIVEIS[s.nivel].n)
          tiroAtual = { alvo: m.alvo, x: m.x, y: m.y, n: m.n };
      } else if (m.t === 'resp') {
        var ta = tiroAtual;
        if (s.fase !== 'jogo' || !ta || m.n !== s.log.length || ta.n !== m.n || s.j[ta.alvo].id !== m.de || m.x !== ta.x || m.y !== ta.y || m.a !== s.vez) return;
        var e = [s.vez, ta.alvo, m.x, m.y, m.r];
        if (m.r === 2) { if (!m.nv || !L.dentro(L.deLista(m.nv), L.NIVEIS[s.nivel].n)) return; e = e.concat(m.nv); }
        s.log.push(e); tiroAtual = null;
        if (m.r === 2 && afundados(ta.alvo) >= L.NIVEIS[s.nivel].frota.length) s.j[ta.alvo].f = 1;
        verificarFim();
        if (s.fase === 'jogo') s.vez = proximo(s.vez);
        difundir();
      } else if (m.t === 'tchau') {
        if (i >= 0 && m.de !== s.id && (s.fase === 'sala' || !s.j[i].s)) { tirar(i); difundir(); }
      }
    }

    // ---------- todo mundo ----------
    // meu tiro esperando resposta: some quando virou diário, quando a vez mudou ou quando o alvo saiu
    // (alvo fora da conexão: se tiver outro adversário presente, deixo escolher outro)
    function conferirPend() {
      if (!s.pend) return;
      var eu = meu(), alvo = s.j[s.pend.alvo], outros = ativos().filter(function (i) { return i !== eu && i !== s.pend.alvo && !s.j[i].au; });
      if (s.fase !== 'jogo' || s.log.length > s.pend.n || s.vez !== eu || !alvoValido(s.pend.alvo, eu) || (alvo.au && outros.length)) s.pend = null;
    }
    function aceitarEstado(m) {
      // só vale o estado do anfitrião que ele mesmo diz (ou do anfitrião atual passando o comando)
      if (m.j[m.h].id !== m.de && !(s.j[s.h] && s.j[s.h].id === m.de)) return;
      // já estou numa partida: só vale estado de alguém dela e que ainda me tenha na lista (estranho na sala não manda)
      if (meu() >= 0 && (idxDe(m.de) < 0 || !m.j.some(function (p) { return p.id === s.id; }))) return;
      var aceita = m.era > s.era || (m.era === s.era && (m.h === s.h ? m.ep > s.ep : m.h < s.h));
      if (!aceita) return;
      var antes = s.fase, eraHost = s.host;
      s.era = m.era; s.ep = m.ep; s.h = m.h; s.fase = m.fase; s.nivel = m.nivel; s.j = m.j; s.vez = m.vez; s.seq = m.seq; s.log = m.log; s.venc = m.venc;
      ultEstado = agora(); s.nao = null;
      var eu = meu();
      s.host = eu >= 0 && eu === s.h;
      if (s.host && !eraHost) { zerarVistos(); tiroAtual = null; aplicarSaidas(); }
      if (s.fase === 'sala' && antes !== 'sala') { s.pend = null; s.revel = {}; s.revelei = 0; s.querPronto = false; }
      conferirPend();
      mexeu();
    }
    // levei um tiro: só respondo com o meu diário em dia (n = tiros já anotados) e calculo só por ele — assim a resposta
    // nunca sai de um diário velho. Tiro repetido (a resposta se perdeu) = mesma conta, mesma resposta.
    function comoAlvo(m) {
      var eu = meu(), a = idxDe(m.de), n = L.NIVEIS[s.nivel].n;
      if (m.alvo !== eu || eu < 0 || a < 0 || s.fase !== 'jogo' || !s.frota || s.j[eu].s) return;
      if (m.n !== s.log.length || a !== s.vez || m.x >= n || m.y >= n || jaNoLog(eu, m.x, m.y)) return;
      var tiros = {};
      s.log.forEach(function (e) { if (e[1] === eu) tiros[L.chave(e[2], e[3])] = 1; });
      var res = L.resolver(s.frota, tiros, m.x, m.y);
      var r = { t: 'resp', de: s.id, a: a, x: m.x, y: m.y, n: m.n, r: L.R[res.r] };
      if (res.navio) r.nv = L.paraLista(res.navio);
      enviar(r);
    }
    // quem disse tchau fica anotado por todos: se o tchau chegou antes de alguém virar anfitrião, ele vale do mesmo jeito
    function aplicarSaidas() {
      var mudou = false;
      Object.keys(s.foram).forEach(function (id) { var i = idxDe(id); if (i >= 0 && i !== meu() && (s.fase === 'sala' || !s.j[i].s)) { tirar(i); mudou = true; } });
      if (mudou) difundir();
    }
    function processar(m) {
      if (s.saiu) return;
      if (m.de !== s.id) vistos[m.de] = agora();
      if (m.t === 'tchau' && m.de !== s.id) { s.foram[m.de] = 1; mexeu(); }
      if (m.t === 'oi' && s.foram[m.de]) { delete s.foram[m.de]; mexeu(); }
      if (m.t === 'estado') { if (m.de !== s.id) aceitarEstado(m); return; }
      if (m.t === 'nao') { if (m.para === s.id && meu() < 0) { s.nao = m.motivo; mexeu(); } return; }
      if (m.t === 'frota') { var i = idxDe(m.de); if (i >= 0 && s.fase === 'fim') { s.revel[i] = m.navios; mexeu(); } return; }
      if (s.host) comoAnfitriao(m);
      if (m.t === 'tiro') comoAlvo(m);
    }

    function assumir() {               // o anfitrião sumiu: eu passo a mandar
      var velho = s.h, eu = meu();
      s.host = true; s.era++; s.h = eu; if (s.j[velho]) s.j[velho].au = 1;
      zerarVistos(); if (s.j[velho]) vistos[s.j[velho].id] = 0; tiroAtual = null;
      if (s.fase === 'jogo' && s.vez === velho && ativos().filter(function (i) { return !s.j[i].au; }).length >= 2) s.vez = proximo(velho);
      difundir(); aplicarSaidas();
    }

    function tique() {
      if (s.saiu) return;
      var t = agora(), eu = meu();
      // no fim, cada um mostra a frota (3 vezes, caso uma se perca)
      if (s.fase === 'fim' && s.frota && eu >= 0 && s.revelei < 3 && t - ultRevel >= 2000) {
        s.revelei++; ultRevel = t; mexeu(); enviar({ t: 'frota', de: s.id, navios: s.frota.map(L.paraLista) });
      }
      if (s.pend && t - (s.pend.ultimo || 0) >= TEMPO.tiro) { s.pend.ultimo = t; enviar({ t: 'tiro', de: s.id, alvo: s.pend.alvo, x: s.pend.x, y: s.pend.y, n: s.pend.n }); }
      if (s.host) {
        var mudou = false;
        s.j.forEach(function (p, i) {
          if (i === eu || p.s) return;
          var visto = vistos[p.id] || 0;
          if (!p.au && t - visto > TEMPO.ausente) { p.au = 1; mudou = true; if (tiroAtual && tiroAtual.alvo === i) tiroAtual = null; }
        });
        if (s.fase === 'jogo' && s.vez >= 0 && s.j[s.vez].au) {
          var outros = ativos().filter(function (i) { return i !== s.vez && !s.j[i].au; });
          if (outros.length >= 2) { s.vez = proximo(s.vez); tiroAtual = null; mudou = true; }
        }
        if (s.querPronto !== !!(eu >= 0 && s.j[eu].p) && s.fase === 'sala' && eu >= 0) { s.j[eu].p = s.querPronto ? 1 : 0; mudou = true; }
        if (mudou || t - ultEnvio >= TEMPO.estado) difundir();
        return;
      }
      if (s.nao) return;
      if (eu < 0) { if (t - ultOi >= TEMPO.oi) { ultOi = t; enviar({ t: 'oi', de: s.id, nome: s.nome }); } return; }
      if (s.fase === 'sala' && !!s.j[eu].p !== s.querPronto && t - ultOi >= TEMPO.oi) { ultOi = t; enviar({ t: 'pronto', de: s.id, ok: s.querPronto }); }
      if (t - ultPulso >= TEMPO.pulso) { ultPulso = t; enviar({ t: 'pulso', de: s.id }); }
      if (s.fase !== 'fim' && t - ultEstado > TEMPO.anfitriao) {
        var cand = -1;
        for (var i = 0; i < s.j.length; i++) {
          if (i === s.h || s.j[i].s) continue;
          if (i === eu || t - (vistos[s.j[i].id] || 0) < TEMPO.ausente) { cand = i; break; }
        }
        if (cand === eu) assumir();
      }
    }

    var API = {
      estado: function () { return s; },
      meu: meu, ativo: ativo, ativos: ativos, jaNoLog: jaNoLog, exportar: exportar,
      tamanho: function () { return L.NIVEIS[s.nivel].n; },
      souHost: function () { return s.host; },
      // há quanto tempo não chega notícia do anfitrião (para a tela avisar)
      semAnfitriao: function () { return s.host ? 0 : agora() - ultEstado; },
      entrar: function () { rodar(function () { ultEstado = agora(); if (s.host) { zerarVistos(); difundir(); } else { ultOi = agora(); enviar({ t: 'oi', de: s.id, nome: s.nome }); } }); },
      receber: function (bruto) { var m = validar(bruto); if (m) rodar(function () { processar(m); }); },
      tique: function () { rodar(tique); },
      definirFrota: function (frota) {
        if (s.fase !== 'sala' || !L.frotaValida(frota, s.nivel)) return false;
        rodar(function () { s.frota = frota.map(function (nv) { return { x: nv.x, y: nv.y, tam: nv.tam, h: nv.h }; }); mexeu(); });
        return true;
      },
      pronto: function (ok) {
        if (s.fase !== 'sala' || (ok && !s.frota)) return false;
        rodar(function () { s.querPronto = !!ok; ultOi = agora(); enviar({ t: 'pronto', de: s.id, ok: !!ok }); mexeu(); });
        return true;
      },
      podeComecar: function () { return s.host && s.fase === 'sala' && s.j.length >= 2 && s.j.every(function (p) { return p.p; }); },
      comecar: function () {
        if (!API.podeComecar()) return false;
        rodar(function () { s.fase = 'jogo'; s.log = []; s.venc = -1; s.vez = Math.floor(rnd() * s.j.length); tiroAtual = null; s.j.forEach(function (p) { p.f = 0; }); difundir(); });
        return true;
      },
      atirar: function (b, x, y) {
        var eu = meu(), n = L.NIVEIS[s.nivel].n;
        if (s.fase !== 'jogo' || eu < 0 || s.vez !== eu || s.pend || !alvoValido(b, eu) || x < 0 || y < 0 || x >= n || y >= n || jaNoLog(b, x, y)) return false;
        rodar(function () { s.pend = { alvo: b, x: x, y: y, n: s.log.length, ultimo: agora() }; enviar({ t: 'tiro', de: s.id, alvo: b, x: x, y: y, n: s.pend.n }); mexeu(); });
        return true;
      },
      sair: function () {
        rodar(function () {
          var eu = meu();
          if (s.host && eu >= 0) {
            var novo = -1;
            for (var i = 0; i < s.j.length; i++) if (i !== eu && !s.j[i].s && !s.j[i].au) { novo = i; break; }
            if (novo < 0) for (i = 0; i < s.j.length; i++) if (i !== eu && !s.j[i].s) { novo = i; break; }
            if (novo >= 0) {
              var idNovoHost = s.j[novo].id;
              tirar(eu); s.h = idxDe(idNovoHost); s.era++; difundir(); difundir(); difundir();
            }
          }
          enviar({ t: 'tchau', de: s.id }); enviar({ t: 'tchau', de: s.id }); enviar({ t: 'tchau', de: s.id });
          s.saiu = true; s.host = false; mexeu();
        });
      },
      continuarSem: function (i) { if (!s.host || i === meu() || !s.j[i]) return; rodar(function () { tirar(i); difundir(); }); },
      revanche: function () {
        if (!s.host || s.fase !== 'fim') return false;
        rodar(function () {
          var meuId = s.id;
          s.j = s.j.filter(function (p) { return !p.s; }).map(function (p) { return { id: p.id, nome: p.nome, p: 0, f: 0, au: p.au, s: 0 }; });
          s.h = idxDe(meuId); s.fase = 'sala'; s.log = []; s.vez = -1; s.venc = -1;
          s.pend = null; s.revel = {}; s.revelei = 0; s.querPronto = false;
          difundir();
        });
        return true;
      },
      // mar do jogador b como todos veem (ver BNLogica.vista)
      vista: function (b) { return L.vista(s.log, b, L.NIVEIS[s.nivel].n); }
    };
    return API;
  }

  // ======================= o canal de verdade =======================
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
  function entregar(aoReceber) { return function (dado) { var m = validar(dado); if (m) { try { aoReceber(m); } catch (e) { if (raiz.console) console.warn(e); } } }; }
  function abrirLocal(codigo, aoReceber) {
    var bc = new BroadcastChannel('batalha-naval-' + codigo), r = entregar(aoReceber);
    bc.onmessage = function (ev) { r(ev.data); };
    return Promise.resolve({ mandar: function (m) { try { bc.postMessage(JSON.parse(JSON.stringify(m))); } catch (e) { /* fechado */ } }, fechar: function () { try { bc.close(); } catch (e) { /* ok */ } } });
  }
  // aoCair(): o canal caiu depois de conectado (celular travou a tela, Wi-Fi caiu) — a tela abre outro
  function abrirSupabase(codigo, aoReceber, aoCair) {
    return carregarLib().then(function () {
      if (!sb) sb = raiz.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 20 } }, auth: { persistSession: false, autoRefreshToken: false } });
      return new Promise(function (ok, falha) {
        var pronto = false, fechado = false, r = entregar(aoReceber), canal = sb.channel('batalha-naval-' + codigo, { config: { broadcast: { self: false } } });
        canal.on('broadcast', { event: 'm' }, function (x) { r(x.payload); });
        var limite = setTimeout(function () { if (!pronto) { pronto = true; try { sb.removeChannel(canal); } catch (e) { /* ok */ } falha(new Error('TIMED_OUT')); } }, 15000);
        canal.subscribe(function (st) {
          if (st === 'SUBSCRIBED' && !pronto) {
            pronto = true; clearTimeout(limite);
            ok({ mandar: function (m) { try { canal.send({ type: 'broadcast', event: 'm', payload: m }); } catch (e) { /* sem rede: o reenvio cuida */ } }, fechar: function () { fechado = true; try { sb.removeChannel(canal); } catch (e) { /* ok */ } } });
          } else if ((st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') && !pronto) { pronto = true; clearTimeout(limite); falha(new Error(st)); }
          else if ((st === 'CHANNEL_ERROR' || st === 'TIMED_OUT' || st === 'CLOSED') && pronto && !fechado && aoCair) { fechado = true; try { aoCair(); } catch (e) { /* ok */ } }
        });
      });
    });
  }

  // "📶 Jogar pertinho": canal de dados direto entre os dois aparelhos (pertinho.js), sem servidor nenhum.
  // As mensagens são as mesmas; chegam como texto JSON e passam pelo mesmo validar().
  function abrirDireto(conexao, aoReceber, aoCair) {
    var r = entregar(aoReceber), fechado = false;
    conexao.ouvir(function (txt) {
      if (typeof txt !== 'string' || txt.length > 200000) return;
      var m; try { m = JSON.parse(txt); } catch (e) { return; }
      r(m);
    }, function () { if (!fechado && aoCair) { fechado = true; try { aoCair(); } catch (e) { /* ok */ } } });
    return Promise.resolve({ mandar: function (m) { try { conexao.enviar(JSON.stringify(m)); } catch (e) { /* fechado: o reenvio cuida */ } }, fechar: function () { fechado = true; conexao.fechar(); } });
  }

  // o transporte é trocável; todos devolvem Promise<{ mandar(msg), fechar() }> e entregam só mensagens validadas:
  //   conexao (do pertinho.js) → canal direto · ?teste → BroadcastChannel · senão → Supabase Realtime
  var API = {
    criar: criar, validar: validar, codigoNovo: codigoNovo, idNovo: idNovo, nome: nome, TEMPO: TEMPO, LOCAL: LOCAL,
    abrir: function (codigo, aoReceber, aoCair, conexao) {
      if (conexao) return abrirDireto(conexao, aoReceber, aoCair);
      return LOCAL ? abrirLocal(codigo, aoReceber) : abrirSupabase(codigo, aoReceber, aoCair);
    }
  };
  raiz.BNRede = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : this);
