/* Vruuum! — duelo, cada um no seu celular (dono, 16/Nov/2026: "2 no mesmo celular não funciona no celular").

   O CANAL: o mesmo dos outros jogos do Bolinho que jogam em aparelhos diferentes (Batalha Naval, Rabiscolândia):
   Supabase Realtime "broadcast" num canal "vruuum-<código>" (código de 4 letras), com a URL e a chave publishable da
   plataforma — públicas por desenho, não dão acesso a tabela nenhuma. O supabase-js é o da Bagunçolândia, carregado
   só quando alguém joga em rede. Com ?teste (ou ?local) o canal é um BroadcastChannel do navegador (testes sem internet).
   A sala é pública (quem tem o código manda mensagem): TODA mensagem passa por validar() antes de ser usada, e a tela
   só usa textContent com o que veio de fora.

   AS MENSAGENS (t = tipo):
     oi     { id, nome, veic, cor, pers, h }   estou aqui (a cada 2 s na sala; h = 1 se sou quem criou o duelo)
     largar { id, rid, sem, niv, mun, riv }    quem criou começa a corrida: semente, nível, cenários e os rivais do
                                               computador ([{ id, veic, cor, vel, curva }], vazio = sem rivais)
     pos    { id, rid, z, x, v, tu, pu, c, tm, pt }   onde eu estou (10 por segundo durante a corrida)
     riv    { id, rid, r: [[z, x, tu, c, tm], ...] }  onde estão os rivais do computador (só quem criou manda)
     tchau  { id }                              saí do duelo
   CELULAR COMO CONTROLE DA TV (canal "vruuum-tv-<código>"; a TV mostra o código, cada celular vira um controle):
     ctl    { id, d, p, g }   do celular: direção (-1 a 1), quantos pulos já pediu, quantas vezes tocou em Começar
     vaga   { id, alvo, j }   da TV: o celular "alvo" é o jogador j (0 ou 1; -1 = já tem dois controles)
   Cada aparelho corre a SUA corrida (mesma semente = mesma pista); o outro aparece como mais um corredor, movido pelo
   que chega do canal (com um pouquinho de atraso, que o dono aceitou). Os rivais do computador quem move é quem criou.

   VruuumDuelo.abrir(codigo, aoReceber, aoCair) → Promise<{ mandar(msg), fechar() }>
   VruuumDuelo.validar(msg) → a mensagem limpa, ou null */
(function (raiz) {
  'use strict';
  var SUPABASE_URL = 'https://qvdvkqydhnadhewcidia.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_oRJmeUwlBbOP_HoOXf0xLw_4O8v43EA';
  var LIB = '../baguncolandia/libs/supabase.js';
  var LOCAL = /[?&](teste|local)\b/.test((raiz.location && raiz.location.search) || '');
  var LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';   // sem I e O (parecem 1 e 0)

  function codigoNovo() { var s = ''; for (var k = 0; k < 4; k++) s += LETRAS[Math.floor(Math.random() * LETRAS.length)]; return s; }
  function idNovo() { var s = '', a = 'abcdefghijklmnopqrstuvwxyz0123456789'; for (var k = 0; k < 8; k++) s += a[Math.floor(Math.random() * a.length)]; return s; }
  function codigo(v) { v = typeof v === 'string' ? v.trim().toUpperCase() : ''; return /^[A-Z]{4}$/.test(v) ? v : null; }

  // ---------- validar o que chega ----------
  function id8(v) { return typeof v === 'string' && /^[a-z0-9]{8}$/.test(v) ? v : null; }
  function nome(v) { return typeof v === 'string' ? v.replace(/[<>&"'`\\\u0000-\u001f\u007f]/g, '').trim().slice(0, 14) : ''; }
  function palavra(v) { return typeof v === 'string' && /^[a-z0-9-]{1,24}$/i.test(v) ? v : null; }
  function cor(v) { return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : null; }
  function num(v, min, max) { return typeof v === 'number' && isFinite(v) && v >= min && v <= max ? v : null; }
  var Z = 1e8;
  function validar(m) {
    if (!m || typeof m !== 'object' || typeof m.t !== 'string') return null;
    var id = id8(m.id); if (!id) return null;
    if (m.t === 'oi') {
      var o = { t: 'oi', id: id, nome: nome(m.nome), veic: palavra(m.veic), cor: cor(m.cor), pers: palavra(m.pers), h: m.h === 1 ? 1 : 0 };
      return o.veic && o.cor ? o : null;
    }
    if (m.t === 'largar') {
      var rid = id8(m.rid), sem = num(m.sem, 1, 2147483647), niv = ['crianca', 'normal', 'turbo'].indexOf(m.niv) >= 0 ? m.niv : null;
      if (!rid || sem === null || !niv || !Array.isArray(m.mun) || m.mun.length > 4 || !Array.isArray(m.riv) || m.riv.length > 8) return null;
      var mun = m.mun.map(palavra); if (mun.some(function (x) { return !x; })) return null;
      var riv = [];
      for (var k = 0; k < m.riv.length; k++) {
        var r = m.riv[k]; if (!r || typeof r !== 'object') return null;
        var rr = { id: palavra(r.id), veic: palavra(r.veic), cor: cor(r.cor), vel: num(r.vel, 0.5, 1.5), curva: num(r.curva, 0.5, 1.5) };
        if (!rr.id || !rr.veic || !rr.cor || rr.vel === null || rr.curva === null) return null;
        riv.push(rr);
      }
      return { t: 'largar', id: id, rid: rid, sem: sem, niv: niv, mun: mun, riv: riv };
    }
    if (m.t === 'pos') {
      var p = { t: 'pos', id: id, rid: id8(m.rid), z: num(m.z, -Z, Z), x: num(m.x, -5, 5), v: num(m.v, -1e5, 1e5), tu: num(m.tu, 0, 60), pu: num(m.pu, 0, 60), c: m.c === 1 ? 1 : 0, tm: num(m.tm, 0, 1e5), pt: num(m.pt, 0, 1e7) };
      for (var c in p) if (p[c] === null) return null;
      return p;
    }
    if (m.t === 'riv') {
      var rd = id8(m.rid); if (!rd || !Array.isArray(m.r) || m.r.length > 8) return null;
      var lista = [];
      for (var q = 0; q < m.r.length; q++) {
        var a = m.r[q]; if (!Array.isArray(a) || a.length !== 5) return null;
        var l = [num(a[0], -Z, Z), num(a[1], -5, 5), num(a[2], 0, 60), a[3] === 1 ? 1 : 0, num(a[4], 0, 1e5)];
        if (l.indexOf(null) >= 0) return null;
        lista.push(l);
      }
      return { t: 'riv', id: id, rid: rd, r: lista };
    }
    if (m.t === 'tchau') return { t: 'tchau', id: id };
    if (m.t === 'ctl') { var cl = { t: 'ctl', id: id, d: num(m.d, -1, 1), p: num(m.p, 0, 1e6), g: num(m.g, 0, 1e6) }; return cl.d === null || cl.p === null || cl.g === null ? null : cl; }
    if (m.t === 'vaga') { var al = id8(m.alvo), jv = [-1, 0, 1].indexOf(m.j) >= 0 ? m.j : null; return al && jv !== null ? { t: 'vaga', id: id, alvo: al, j: jv } : null; }
    return null;
  }

  // ---------- o canal ----------
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
  function abrirLocal(cod, aoReceber) {
    var bc = new BroadcastChannel('vruuum-' + cod), r = entregar(aoReceber);   // cod já vem com "tv-" na frente quando é controle
    bc.onmessage = function (ev) { r(ev.data); };
    return Promise.resolve({ mandar: function (m) { try { bc.postMessage(JSON.parse(JSON.stringify(m))); } catch (e) { /* fechado */ } }, fechar: function () { try { bc.close(); } catch (e) { /* ok */ } } });
  }
  function abrirSupabase(cod, aoReceber, aoCair) {
    return carregarLib().then(function () {
      if (!sb) sb = raiz.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 30 } }, auth: { persistSession: false, autoRefreshToken: false } });
      return new Promise(function (ok, falha) {
        var pronto = false, fechado = false, r = entregar(aoReceber), canal = sb.channel('vruuum-' + cod, { config: { broadcast: { self: false } } });
        canal.on('broadcast', { event: 'm' }, function (x) { r(x.payload); });
        var limite = setTimeout(function () { if (!pronto) { pronto = true; try { sb.removeChannel(canal); } catch (e) { /* ok */ } falha(new Error('TIMED_OUT')); } }, 15000);
        canal.subscribe(function (st) {
          if (st === 'SUBSCRIBED' && !pronto) {
            pronto = true; clearTimeout(limite);
            ok({ mandar: function (m) { try { canal.send({ type: 'broadcast', event: 'm', payload: m }); } catch (e) { /* sem rede: a próxima posição cuida */ } }, fechar: function () { fechado = true; try { sb.removeChannel(canal); } catch (e) { /* ok */ } } });
          } else if ((st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') && !pronto) { pronto = true; clearTimeout(limite); falha(new Error(st)); }
          else if ((st === 'CHANNEL_ERROR' || st === 'TIMED_OUT' || st === 'CLOSED') && pronto && !fechado && aoCair) { fechado = true; try { aoCair(); } catch (e) { /* ok */ } }
        });
      });
    });
  }

  var API = {
    validar: validar, codigoNovo: codigoNovo, idNovo: idNovo, codigo: codigo, nome: nome, LOCAL: LOCAL,
    abrir: function (cod, aoReceber, aoCair, tv) { cod = (tv ? 'tv-' : '') + cod; return LOCAL ? abrirLocal(cod, aoReceber) : abrirSupabase(cod, aoReceber, aoCair); }
  };
  raiz.VruuumDuelo = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : this);
