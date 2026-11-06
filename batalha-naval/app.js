/* Batalha Naval — telas, arrumar a frota, as partidas (contra o computador, passar o aparelho, em rede e pertinho) e os efeitos.
   As regras ficam no logica.js; o jogo em rede (mensagens, vez, voltar depois de recarregar) no rede.js; os sons no som.js;
   o desenho dos navios no navios.js; míssil, explosões, respingos e bolhas no efeitos.js.
   Guarda só neste aparelho (localStorage): preferências em "batalha-naval.pref" e a partida em rede em "batalha-naval.rede"
   (para voltar se a página recarregar). Nada de dado pessoal: só o apelido que a pessoa digitar. */
(function () {
  'use strict';
  var APP_VERSION = '0.3.0';
  var L = window.BNLogica, R = window.BNRede;
  var Som = window.BNSom || { iniciar: function () {}, ligar: function () {}, efeito: function () {} };
  var Nav = window.BNNavios;
  var Fx = window.BNFx || { ativo: function () { return false; }, tiro: function (a, b, c, fn) { fn(); }, agua: function () {}, explosao: function () {}, bolhas: function () {}, tremer: function () {} };
  var $ = function (id) { return document.getElementById(id); };
  var TESTE = /[?&]teste\b/.test(location.search);
  var RAPIDO = TESTE ? 0.05 : 1;                    // nos testes as esperas ficam curtinhas
  var CORES = ['#ffd23f', '#3ee8ff', '#ff6fb5', '#9cff57'];
  var CH_PREF = 'batalha-naval.pref', CH_REDE = 'batalha-naval.rede';
  var MUSICAS = [
    ['heroic-age', 'Heroic Age', 'Kevin MacLeod', 'CC BY 4.0'], ['take-the-lead', 'Take the Lead', 'Kevin MacLeod', 'CC BY 4.0'],
    ['ready-aim-fire', 'Ready Aim Fire', 'Kevin MacLeod', 'CC BY 4.0'], ['el-magicia', 'El Magicia', 'Kevin MacLeod', 'CC BY 4.0'],
    ['las-dunas-champions', 'Las Dunas Champions', 'ALBatross (SuperTuxKart)', 'CC BY-SA 4.0'], ['exhilarate', 'Exhilarate', 'Kevin MacLeod', 'CC BY 4.0'],
    ['bet-you-can', 'Bet You Can', 'Kevin MacLeod', 'CC BY 4.0'], ['cool-hard-facts', 'Cool Hard Facts', 'Kevin MacLeod', 'CC BY 4.0'],
    ['kart-grand-prix', 'Kart Grand Prix', 'Weirwood (SuperTuxKart)', 'CC BY-SA 3.0'], ['summon-the-rawk', 'Summon the Rawk', 'Kevin MacLeod', 'CC BY 4.0'],
    ['holizna-way-of-the-samurai', 'Way of the Samurai', 'HoliznaCC0', 'CC0'], ['holizna-americana', 'Americana', 'HoliznaCC0', 'CC0'],
    ['retrofuture-clean', 'RetroFuture Clean', 'Kevin MacLeod', 'CC BY 4.0'], ['zap-beat', 'Zap Beat', 'Kevin MacLeod', 'CC BY 4.0']
  ].map(function (m) { return { a: '../vruuum/musicas/' + m[0] + '.mp3', t: m[1], au: m[2], lic: m[3] }; });

  function ler(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function gravar(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem espaço */ } }
  var pref = ler(CH_PREF) || {};
  if (pref.lingua !== 'en' && pref.lingua !== 'pt') pref.lingua = /^pt/i.test(navigator.language || 'pt') ? 'pt' : 'en';
  if (typeof pref.efeitos !== 'boolean') pref.efeitos = true;
  if (typeof pref.nome !== 'string') pref.nome = '';
  function salvarPref() { gravar(CH_PREF, pref); }

  // ---------- idioma ----------
  function t(pt, en) { return pref.lingua === 'en' ? en : pt; }
  function N(x) { return x ? (pref.lingua === 'en' ? x.en : x.pt) : ''; }
  function traduzir() {
    document.documentElement.lang = pref.lingua === 'en' ? 'en' : 'pt-BR';
    Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (el) { var p = el.getAttribute('data-t').split('|'); el.textContent = pref.lingua === 'en' ? p[1] : p[0]; });
    $('btLingua').textContent = pref.lingua === 'en' ? 'PT' : 'EN';
    $('versao').textContent = t('Versão ', 'Version ') + APP_VERSION + ' · ' + t('06/Nov/2026', 'Nov/06/2026');
    if (jogo && (atual === 'jogo' || atual === 'sala')) desenhar();
    if (atual === 'arrumar' && arr) pintarArr();
    atualizarInicio();
  }
  function aplicarSom() { Som.ligar(pref.efeitos); $('btEfeitos').textContent = pref.efeitos ? '🔊' : '🔈'; $('btEfeitos').setAttribute('aria-pressed', pref.efeitos ? 'true' : 'false'); }

  // ---------- altura da tela (celular: barra do navegador entra e sai) ----------
  function ajustarAltura() { document.documentElement.style.setProperty('--vh', (window.innerHeight / 100) + 'px'); }
  ajustarAltura(); window.addEventListener('resize', ajustarAltura);

  // ---------- telas e o Voltar do celular ----------
  var atual = 'inicio', noHistorico = false, nivelPara = 'pc';
  function mostrar(id) {
    Array.prototype.forEach.call(document.querySelectorAll('.tela'), function (s) { s.classList.toggle('ativa', s.id === id); });
    atual = id; window.scrollTo(0, 0);
    if (id !== 'inicio' && !noHistorico) { try { history.pushState({ bn: 1 }, ''); noHistorico = true; } catch (e) { /* sem histórico */ } }
    if (id === 'inicio') atualizarInicio();
  }
  window.addEventListener('popstate', function () {
    noHistorico = false;
    aoVoltar();
    if (atual !== 'inicio') { try { history.pushState({ bn: 1 }, ''); noHistorico = true; } catch (e) { /* ok */ } }
  });
  function aoVoltar() {
    if (!$('janela').hidden) { fecharJanela(); return; }
    if (!$('cortina').hidden) return;
    if (atual === 'nivel') mostrar(nivelPara === 'criar' ? 'amigos' : nivelPara === 'perto' ? 'perto' : 'inicio');
    else if (atual === 'amigos' || atual === 'perto') mostrar('inicio');
    else if (atual === 'pertoCodigo' || atual === 'pertoLer') cancelarPerto();
    else if (atual === 'arrumar') { if (jogo && jogo.modo === 'rede') mostrar('sala'); else confirmarSair(); }
    else if (atual === 'sala' || atual === 'jogo') confirmarSair();
  }
  Array.prototype.forEach.call(document.querySelectorAll('.voltar'), function (b) { b.addEventListener('click', aoVoltar); });
  document.addEventListener('keydown', function (e) { if ((e.key === 'Escape' || e.key === 'GoBack' || e.keyCode === 461) && atual !== 'inicio') { e.preventDefault(); aoVoltar(); } });

  // ---------- aviso, estouro, janela, cortina, confete ----------
  var tAviso = null;
  function aviso(txt, ms) { var a = $('aviso'); a.textContent = txt; a.hidden = false; clearTimeout(tAviso); tAviso = setTimeout(function () { a.hidden = true; }, ms || 2400); }
  var tEstouro = null;
  // y = altura (na tela) de onde foi o tiro: a faixa aparece longe dali, para não tapar a explosão
  function estouro(txt, sub, classe, nome, y) {
    var el = $('estouro'); el.hidden = true; el.className = 'estouro ' + (classe || ''); el.textContent = txt;
    el.style.top = y == null ? '' : y < window.innerHeight / 2 ? '74%' : '26%';
    if (nome) { var nm = document.createElement('span'); nm.className = 'nome-navio'; nm.textContent = nome; el.appendChild(nm); }
    if (sub) { var s = document.createElement('small'); s.textContent = sub; el.appendChild(s); }
    void el.offsetWidth; el.hidden = false;
    clearTimeout(tEstouro); tEstouro = setTimeout(function () { el.hidden = true; }, classe === 'afundou' ? 2450 : 1450);
  }
  var janelaFn = null;
  function abrirJanela(o) {
    $('janelaTitulo').textContent = o.titulo || ''; $('janelaTexto').textContent = o.texto || ''; $('janelaTexto').hidden = !o.texto;
    var caixa = $('janelaBotoes'); caixa.innerHTML = '';
    (o.botoes || [{ t: 'OK' }]).forEach(function (b, i) {
      var bt = document.createElement('button'); bt.type = 'button'; bt.className = b.classe || (i === 0 ? 'medio' : 'medio cinza'); bt.textContent = b.t;
      bt.addEventListener('click', function () { fecharJanela(); if (b.fn) b.fn(); });
      caixa.appendChild(bt);
    });
    $('janela').hidden = false;
    setTimeout(function () { var p = caixa.querySelector('button'); if (p) p.focus(); }, 30);
  }
  function fecharJanela() { $('janela').hidden = true; }
  function cortina(titulo, texto, fn) {
    $('cortinaTitulo').textContent = titulo; $('cortinaTexto').textContent = texto || '';
    $('cortina').hidden = false; janelaFn = fn;
    setTimeout(function () { $('btCortina').focus(); }, 30);
  }
  $('btCortina').addEventListener('click', function () { $('cortina').hidden = true; var fn = janelaFn; janelaFn = null; if (fn) fn(); });
  function confete() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var c = $('confete');
    for (var i = 0; i < 70; i++) {
      var p = document.createElement('i');
      p.style.left = (Math.random() * 100) + '%'; p.style.background = CORES[i % 4];
      p.style.animationDuration = (2 + Math.random() * 2.5) + 's'; p.style.animationDelay = (Math.random() * 0.8) + 's';
      c.appendChild(p);
    }
    setTimeout(function () { c.innerHTML = ''; }, 5500);
  }
  function vibrar(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* sem vibrar */ } }

  // ---------- botões de cima ----------
  $('btLingua').addEventListener('click', function () { pref.lingua = pref.lingua === 'en' ? 'pt' : 'en'; salvarPref(); traduzir(); });
  $('btEfeitos').addEventListener('click', function () { pref.efeitos = !pref.efeitos; salvarPref(); aplicarSom(); Som.efeito('toque'); });
  $('btAjuda').addEventListener('click', function () {
    if (atual !== 'inicio') mostrar('inicio');
    var a = $('ajuda'); a.hidden = !a.hidden; this.setAttribute('aria-expanded', a.hidden ? 'false' : 'true');
    if (!a.hidden) a.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('btCasa').addEventListener('click', function (e) {
    if (jogo && (jogo.modo === 'rede' ? jogo.p.estado().fase !== 'fim' : jogo.fase === 'jogo')) {
      e.preventDefault();
      abrirJanela({ titulo: t('Sair da Batalha Naval?', 'Leave Sea Battle?'), texto: t('A partida em andamento vai acabar para você.', 'The game in progress will end for you.'),
        botoes: [{ t: t('🚪 Sim, sair', '🚪 Yes, leave'), fn: function () { sairDoJogo(); location.href = '../'; } }, { t: t('Continuar jogando', 'Keep playing') }] });
    }
  });
  // som liberado no primeiro toque
  document.addEventListener('pointerup', function () { Som.iniciar(); }, { once: true, capture: true });
  document.addEventListener('keydown', function () { Som.iniciar(); }, { once: true, capture: true });
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('button') && !e.target.closest('.tab')) Som.efeito('toque'); }, true);

  if (window.SolverRecursos && !SolverRecursos.ligado('batalha-naval', true)) {
    traduzir(); mostrar('desligado'); $('desligado').hidden = false; return;
  }

  // ---------- início ----------
  // a partida em rede fica guardada na aba (sessionStorage: duas abas no mesmo computador não se misturam) e no aparelho
  // (localStorage: para o botão "Voltar para a partida" depois de fechar o navegador)
  function lerSessao() { try { var v = sessionStorage.getItem(CH_REDE); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function guardarRede(d) { gravar(CH_REDE, d); try { if (d == null) sessionStorage.removeItem(CH_REDE); else sessionStorage.setItem(CH_REDE, JSON.stringify(d)); } catch (e) { /* ok */ } }
  function salvoRede(daAba) { var d = daAba ? lerSessao() : (lerSessao() || ler(CH_REDE)); return d && d.codigo && d.id && !d.saiu ? d : null; }
  function enderecoSala(c) { try { history.replaceState(history.state, '', location.pathname + (c ? '?sala=' + c + (TESTE ? '&teste' : '') : (TESTE ? '?teste' : ''))); } catch (e) { /* ok */ } }
  function atualizarInicio() {
    var d = salvoRede(), b = $('btVoltarRede');
    b.hidden = !d || !!jogo; if (d) b.textContent = t('⚓ Voltar para a partida ', '⚓ Back to game ') + d.codigo;
    $('avisoSemNet').hidden = navigator.onLine !== false;
  }
  window.addEventListener('online', atualizarInicio); window.addEventListener('offline', atualizarInicio);
  $('btVoltarRede').addEventListener('click', function () { var d = salvoRede(); if (d) conectar({ dados: d }); });
  $('btPC').addEventListener('click', function () { escolherNivel('pc'); });
  $('btPassa').addEventListener('click', function () { escolherNivel('passa'); });
  $('btAmigos').addEventListener('click', function () { abrirAmigos(''); });
  function escolherNivel(para) {
    nivelPara = para;
    $('nivelTitulo').textContent = para === 'criar' || para === 'perto' ? t('Escolha o nível da partida', 'Pick the game level') : t('Escolha o nível', 'Pick the level');
    Array.prototype.forEach.call(document.querySelectorAll('.so-pc'), function (el) { el.hidden = para !== 'pc'; });
    mostrar('nivel');
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-nivel]'), function (b) {
    b.addEventListener('click', function () {
      var nv = b.getAttribute('data-nivel');
      if (nivelPara === 'criar') criarRede(nv); else if (nivelPara === 'perto') pertoCriar(nv); else novoLocal(nivelPara, nv);
    });
  });

  // ======================= ARRUMAR A FROTA =======================
  var arr = null;
  function abrirArrumar(o) {
    var cfg = L.NIVEIS[o.nivel];
    arr = { nivel: o.nivel, n: cfg.n, tams: cfg.frota.slice(), frota: cfg.frota.map(function () { return null; }), sel: 0, h: true, aoPronto: o.aoPronto, drag: null, prev: null };
    if (o.frota && L.frotaValida(o.frota, o.nivel)) {
      o.frota.forEach(function (nv) { for (var i = 0; i < arr.tams.length; i++) if (arr.tams[i] === nv.tam && !arr.frota[i]) { arr.frota[i] = { x: nv.x, y: nv.y, tam: nv.tam, h: nv.h }; break; } });
      arr.sel = -1;
    }
    $('arrTitulo').textContent = o.titulo;
    montar($('arrTab'), arr.n, false);
    mostrar('arrumar'); pintarArr();
  }
  function ajustar(nv) {
    var n = arr.n, x = nv.x, y = nv.y;
    if (nv.h) { x = Math.max(0, Math.min(n - nv.tam, x)); y = Math.max(0, Math.min(n - 1, y)); }
    else { y = Math.max(0, Math.min(n - nv.tam, y)); x = Math.max(0, Math.min(n - 1, x)); }
    return { x: x, y: y, tam: nv.tam, h: nv.h };
  }
  function navioEm(x, y) {
    for (var i = 0; i < arr.frota.length; i++) { var nv = arr.frota[i]; if (!nv) continue; var cs = L.celulas(nv); for (var k = 0; k < cs.length; k++) if (cs[k][0] === x && cs[k][1] === y) return { i: i, k: k }; }
    return null;
  }
  function proximoLivre() { for (var i = 0; i < arr.frota.length; i++) if (!arr.frota[i]) return i; return -1; }
  function por(i, nv) {
    if (!L.cabe(arr.frota, arr.n, nv, i)) { Som.efeito('erro'); aviso(t('Não cabe aí: tem outro navio no caminho.', "It doesn't fit there: another ship is in the way.")); return false; }
    arr.frota[i] = nv; Som.efeito('por'); vibrar(15);
    arr.sel = proximoLivre();
    return true;
  }
  function girar(i) {
    var nv = arr.frota[i]; if (!nv) return;
    var novo = ajustar({ x: nv.x, y: nv.y, tam: nv.tam, h: !nv.h });
    if (L.cabe(arr.frota, arr.n, novo, i)) { arr.frota[i] = novo; Som.efeito('girar'); }
    else { Som.efeito('erro'); aviso(t('Não dá para girar aí. Arraste para outro lugar.', "Can't turn it there. Drag it somewhere else.")); }
  }
  function celulaDoPonto(cx, cy) {
    // pela posição real das casas (A1 e B2), para o dedo cair na casa certa em qualquer tamanho de tela
    var c = $('arrTab')._c, a = c[0][0].getBoundingClientRect(), b = c[1][1].getBoundingClientRect();
    var px = b.left - a.left, py = b.top - a.top, gx = (px - a.width) / 2, gy = (py - a.height) / 2;
    var x = Math.floor((cx - a.left + gx) / px), y = Math.floor((cy - a.top + gy) / py);
    return x >= 0 && y >= 0 && x < arr.n && y < arr.n ? { x: x, y: y } : null;
  }
  function inicioArraste(e, fonte, i, k) {
    arr.drag = { fonte: fonte, i: i, k: k, x0: e.clientX, y0: e.clientY, moveu: false, id: e.pointerId };
  }
  $('arrTab').addEventListener('pointerdown', function (e) {
    if (!arr) return;
    var c = celulaDoPonto(e.clientX, e.clientY); if (!c) return;
    e.preventDefault();
    var achou = navioEm(c.x, c.y);
    if (achou) inicioArraste(e, 'mar', achou.i, achou.k);
    else arr.drag = { fonte: 'vazio', c: c, x0: e.clientX, y0: e.clientY, moveu: false, id: e.pointerId };
  });
  document.addEventListener('pointermove', function (e) {
    var d = arr && arr.drag; if (!d || d.id !== e.pointerId || d.fonte === 'vazio') return;
    if (!d.moveu && Math.abs(e.clientX - d.x0) + Math.abs(e.clientY - d.y0) < 10) return;
    d.moveu = true; e.preventDefault();
    var c = celulaDoPonto(e.clientX, e.clientY), tam = arr.tams[d.i], atualNv = arr.frota[d.i], h = atualNv ? atualNv.h : arr.h;
    if (!c) { arr.prev = null; pintarArr(); return; }
    var nv = ajustar({ x: h ? c.x - d.k : c.x, y: h ? c.y : c.y - d.k, tam: tam, h: h });
    arr.prev = { nv: nv, ok: L.cabe(arr.frota, arr.n, nv, d.i), i: d.i };
    pintarArr();
  }, { passive: false });
  function fimArraste(e) {
    var d = arr && arr.drag; if (!d || d.id !== e.pointerId) return;
    arr.drag = null;
    if (d.moveu) {
      var p = arr.prev; arr.prev = null;
      if (p && p.ok) { arr.frota[p.i] = p.nv; Som.efeito('por'); vibrar(15); if (arr.sel === p.i || arr.sel < 0) arr.sel = proximoLivre(); }
      else if (p) Som.efeito('erro');
    } else if (d.fonte === 'mar') girar(d.i);
    else if (d.fonte === 'peca') arr.sel = d.i;
    else if (d.fonte === 'vazio' && arr.sel >= 0) {
      var tam = arr.tams[arr.sel], velho = arr.frota[arr.sel];
      por(arr.sel, ajustar({ x: d.c.x, y: d.c.y, tam: tam, h: velho ? velho.h : arr.h }));
    } else if (d.fonte === 'vazio') aviso(t('Escolha um navio aqui embaixo primeiro.', 'Pick a ship below first.'));
    pintarArr();
  }
  document.addEventListener('pointerup', fimArraste);
  document.addEventListener('pointercancel', function (e) { if (arr && arr.drag && arr.drag.id === e.pointerId) { arr.drag = null; arr.prev = null; pintarArr(); } });
  $('arrPecas').addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.peca'); if (!b || !arr) return;
    e.preventDefault();
    inicioArraste(e, 'peca', +b.getAttribute('data-i'), 0);
  });
  $('btGirar').addEventListener('click', function () {
    if (arr.sel >= 0 && arr.frota[arr.sel]) girar(arr.sel); else { arr.h = !arr.h; Som.efeito('girar'); }
    pintarArr();
  });
  $('btSortear').addEventListener('click', function () { arr.frota = L.aleatoria(arr.nivel); arr.sel = -1; Som.efeito('por'); pintarArr(); });
  $('btLimpar').addEventListener('click', function () { arr.frota = arr.tams.map(function () { return null; }); arr.sel = 0; pintarArr(); });
  $('btPronto').addEventListener('click', function () {
    if (proximoLivre() >= 0) return;
    var f = arr.frota.map(function (nv) { return { x: nv.x, y: nv.y, tam: nv.tam, h: nv.h }; }), fn = arr.aoPronto;
    Som.efeito('pronto'); fn(f);
  });
  function pintarArr() {
    if (!arr) return;
    var el = $('arrTab'), n = arr.n, cls = [], y, x;
    for (y = 0; y < n; y++) { cls.push([]); for (x = 0; x < n; x++) cls[y].push('c'); }
    var navios = [];
    arr.frota.forEach(function (nv, i) {
      if (!nv) return;
      var arrastando = arr.drag && arr.drag.moveu && arr.drag.i === i;
      L.celulas(nv).forEach(function (c, k) { cls[c[1]][c[0]] += classesNavio(nv, k) + (i === arr.sel ? ' sel' : '') + (arrastando ? ' arrastando' : ''); });
      navios.push({ nv: nv, tipo: Nav.tipo(arr.tams, i), cls: (i === arr.sel ? 'sel' : '') + (arrastando ? ' arrastando' : '') });
    });
    if (arr.prev) {
      L.celulas(arr.prev.nv).forEach(function (c) { if (c[0] < n && c[1] < n) cls[c[1]][c[0]] += ' prev' + (arr.prev.ok ? '' : ' ruim'); });
      navios.push({ nv: arr.prev.nv, tipo: Nav.tipo(arr.tams, arr.prev.i), cls: 'previa' + (arr.prev.ok ? '' : ' ruim'), extra: 'p' });
    }
    for (y = 0; y < n; y++) for (x = 0; x < n; x++) { var cel = el._c[y][x]; if (cel.className !== cls[y][x]) cel.className = cls[y][x]; }
    pintarFrota(el, navios);
    refazer($('arrPecas'), JSON.stringify([arr.tams, arr.sel, arr.frota.map(Boolean)]), function (pecas) { arr.tams.forEach(function (tam, i) {
      var b = document.createElement('button'), tipo = Nav.tipo(arr.tams, i); b.type = 'button';
      b.className = 'peca' + (i === arr.sel ? ' sel' : '') + (arr.frota[i] ? ' posto' : ''); b.setAttribute('data-i', i);
      var casco = document.createElement('div'); casco.className = 'casco'; casco.style.setProperty('--t', tam); casco.appendChild(Nav.svg(tipo, true));
      var nm = document.createElement('span'); nm.textContent = N(Nav.TIPOS[tipo]);
      var sm = document.createElement('small'); sm.textContent = tam + t(' casas', ' squares'); nm.appendChild(sm);
      b.appendChild(casco); b.appendChild(nm);
      b.setAttribute('aria-label', N(Nav.TIPOS[tipo]) + ', ' + tam + t(' casas', ' squares') + (arr.frota[i] ? t(', no mar', ', placed') : ''));
      pecas.appendChild(b);
    }); });
    var selPosto = arr.sel >= 0 && arr.frota[arr.sel], h = selPosto ? arr.frota[arr.sel].h : arr.h;
    $('btGirar').textContent = '🔄 ' + t('Girar', 'Turn') + (h ? ' ↔' : ' ↕');
    $('btPronto').disabled = proximoLivre() >= 0;
  }

  // ======================= TABULEIRO (desenho) =======================
  function classesNavio(nv, k) { return ' nv ' + (nv.h ? 'h' : 'v') + (k === 0 ? ' ini' : '') + (k === nv.tam - 1 ? ' fim' : ''); }
  function montar(el, n, botoes) {
    if (el._n === n && el._b === botoes) return;
    el.innerHTML = ''; el.style.setProperty('--n1', n + 1); el._n = n; el._b = botoes; el._c = []; el._anim = {}; el._animT = {}; el._navios = {}; el._fxNavio = {};
    var mar = document.createElement('div'); mar.className = 'mar-fundo'; el.appendChild(mar);
    var canto = document.createElement('span'); canto.className = 'rot'; el.appendChild(canto);
    for (var x = 0; x < n; x++) { var r = document.createElement('span'); r.className = 'rot'; r.textContent = L.LETRAS.charAt(x); el.appendChild(r); }
    for (var y = 0; y < n; y++) {
      var rn = document.createElement('span'); rn.className = 'rot'; rn.textContent = String(y + 1); el.appendChild(rn);
      el._c.push([]);
      for (x = 0; x < n; x++) {
        var c = document.createElement(botoes ? 'button' : 'span'); c.className = 'c';
        if (botoes) { c.type = 'button'; c.setAttribute('data-x', x); c.setAttribute('data-y', y); }
        el.appendChild(c); el._c[y].push(c);
      }
    }
  }
  // o: { vista, frota (navios inteiros que eu conheço), fantasma (navios revelados no fim), pode, pend, ultimo }
  function pintar(el, n, o) {
    var cls = [], y, x, v = o.vista.v;
    for (y = 0; y < n; y++) { cls.push([]); for (x = 0; x < n; x++) cls[y].push('c'); }
    (o.fantasma || []).forEach(function (nv) { L.celulas(nv).forEach(function (c, k) { if (!v[c[1]][c[0]]) cls[c[1]][c[0]] += classesNavio(nv, k) + ' fantasma'; }); });
    (o.frota || []).forEach(function (nv) { L.celulas(nv).forEach(function (c, k) { cls[c[1]][c[0]] = 'c' + classesNavio(nv, k); }); });
    o.vista.afundados.forEach(function (nv) { L.celulas(nv).forEach(function (c, k) { cls[c[1]][c[0]] = 'c' + classesNavio(nv, k); }); });
    var NOME_EST = ['', t('água', 'water'), t('acerto', 'hit'), t('afundado', 'sunk')];
    for (y = 0; y < n; y++) for (x = 0; x < n; x++) {
      var st = v[y][x];
      if (st === 1) cls[y][x] = 'c agua'; else if (st === 2) cls[y][x] += ' acerto'; else if (st === 3) cls[y][x] += ' afundado';
      if (st) cls[y][x] += ' ja';
      if (o.pend && o.pend.x === x && o.pend.y === y) cls[y][x] += ' mira';
      if (o.ultimo && o.ultimo[0] === x && o.ultimo[1] === y) cls[y][x] += ' ultimo';
      var an = el._anim[x + ',' + y]; if (an) cls[y][x] += ' ' + an;
      var cel = el._c[y][x];
      if (cel.className !== cls[y][x]) cel.className = cls[y][x];
      if (el._b) {
        var des = !o.pode || !!st;
        if (cel.disabled !== des) cel.disabled = des;
        var lab = L.coord(x, y) + (st ? ', ' + NOME_EST[st] : '');
        if (cel.getAttribute('aria-label') !== lab) cel.setAttribute('aria-label', lab);
      }
    }
    el.classList.toggle('pode', !!o.pode);
    if (o.navios) pintarFrota(el, o.navios);
  }
  // uma classe passageira numa casa (chegando, boom, splash), que sobrevive aos redesenhos até acabar o tempo
  function animar(el, x, y, classe, ms) {
    if (!el._anim) return;
    var k = x + ',' + y, cel = el._c && el._c[y] && el._c[y][x], velho = el._anim[k];
    if (velho && cel) cel.classList.remove(velho);
    el._anim[k] = classe; if (cel) cel.classList.add(classe);
    clearTimeout(el._animT[k]);
    el._animT[k] = setTimeout(function () { if (el._anim[k] !== classe) return; delete el._anim[k]; if (cel) cel.classList.remove(classe); }, ms || 900);
  }

  // ======================= NAVIOS (desenho por cima das casas) =======================
  // lista: [{ nv, tipo, cls, extra }] — um <svg> por navio, posto no grid do tabuleiro ocupando exatamente as casas dele;
  // só cria o que é novo e só troca classes (o redesenho em rede a cada segundo fica barato)
  function chaveNavio(tipo, nv, extra) { return tipo + ':' + nv.x + ',' + nv.y + ',' + nv.tam + (nv.h ? 'h' : 'v') + (extra || ''); }
  function pintarFrota(el, lista) {
    var vistos = {};
    lista.forEach(function (o) {
      var k = chaveNavio(o.tipo, o.nv, o.extra), s = el._navios[k];
      vistos[k] = 1;
      if (!s) {
        s = Nav.svg(o.tipo, o.nv.h);
        s.style.gridColumn = (o.nv.x + 2) + ' / span ' + (o.nv.h ? o.nv.tam : 1);
        s.style.gridRow = (o.nv.y + 2) + ' / span ' + (o.nv.h ? 1 : o.nv.tam);
        s._hv = o.nv.h ? 'h' : 'v'; el.appendChild(s); el._navios[k] = s;
      }
      s._base = o.cls || ''; classeNavio(el, k);
    });
    Object.keys(el._navios).forEach(function (k) { if (!vistos[k]) { var s = el._navios[k]; if (s.parentNode) s.parentNode.removeChild(s); delete el._navios[k]; } });
  }
  function classeNavio(el, k) {
    var s = el._navios[k]; if (!s) return;
    var fx = el._fxNavio[k] || '', base = fx === 'intacto' ? s._base.replace('afundado', '') : s._base;
    var c = ('navio-svg ' + s._hv + ' ' + base + ' ' + (fx === 'intacto' ? '' : fx)).replace(/\s+/g, ' ').trim();
    if (s.getAttribute('class') !== c) s.setAttribute('class', c);
  }
  // efeito passageiro num navio: 'escondido' (o míssil ainda voa), 'intacto' (meu navio, antes do impacto), 'afundando'
  function fxNavio(el, k, classe) { if (!el._fxNavio) return; if (classe) el._fxNavio[k] = classe; else delete el._fxNavio[k]; classeNavio(el, k); }
  // de que tipo é um navio do mar de b (quem atira em rede só sabe o tamanho do que afundou: o 1º daquele tamanho
  // ganha o 1º nome, o 2º o 2º — no fim, com as frotas mostradas, vale o nome de verdade)
  function tipoNoMar(d, b, nv) {
    if (b === d.eu && d.frota) return Nav.daFrota(d.frota, nv);
    if (jogo.modo !== 'rede') return Nav.daFrota(jogo.frotas[b], nv);
    if (d.revel[b]) return Nav.daFrota(d.revel[b], nv);
    var ord = 0;
    for (var i = 0; i < d.log.length; i++) { var e = d.log[i]; if (e[1] !== b || e[4] !== 2 || e[7] !== nv.tam) continue; if (e[5] === nv.x && e[6] === nv.y) break; ord++; }
    return Nav.porOrdem(nv.tam, ord);
  }
  function centroCasa(el, x, y) { var r = el._c[y][x].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, tam: r.width }; }
  // de onde sai o míssil: do meu mar quando eu atiro; de cima (do mar do outro) quando atiram em mim
  function origemTiro(el) {
    var outro = el.id === 'tabAlvo' ? $('tabMeu') : $('tabAlvo'), H = window.innerHeight, W = window.innerWidth;
    var vis = outro && !outro.parentNode.hidden && outro.getClientRects().length;
    if (!vis) return { x: W / 2, y: el.id === 'tabAlvo' ? H + 30 : -30 };
    var r = outro.getBoundingClientRect();
    return { x: Math.max(0, Math.min(W, r.left + r.width / 2)), y: Math.max(-40, Math.min(H + 40, r.top + r.height / 2)) };
  }

  // ======================= A PARTIDA (todas) =======================
  var jogo = null;        // { modo: 'pc' | 'passa' | 'rede', ... }
  var alvoSel = -1;
  function nomeJ(j, i) { return (j[i] && j[i].nome) || t('Jogador ', 'Player ') + (i + 1); }
  // tudo o que a tela precisa, do mesmo jeito nos três modos
  function dados() {
    var g = jogo;
    if (g.modo === 'rede') {
      var s = g.p.estado(), revel = {};
      Object.keys(s.revel || {}).forEach(function (k) { revel[k] = s.revel[k].map(L.deLista); });
      return { nivel: s.nivel, j: s.j, eu: g.p.meu(), vez: s.vez, fase: s.fase, venc: s.venc, log: s.log, frota: s.frota, revel: revel, pend: s.pend, host: g.p.souHost(), h: s.h };
    }
    var rv = {};
    if (g.fase === 'fim') g.frotas.forEach(function (f, i) { rv[i] = f; });
    return { nivel: g.nivel, j: g.j, eu: g.eu, vez: g.vez, fase: g.fase, venc: g.venc, log: g.log, frota: g.frotas[g.eu], revel: rv, pend: null, host: true, h: 0 };
  }
  function ativoJ(p) { return p && !p.f && !p.s; }
  function podeAtirar(d) {
    if (d.fase !== 'jogo' || d.eu < 0 || d.vez !== d.eu || d.pend || !ativoJ(d.j[d.eu])) return false;
    if (jogo.modo !== 'rede' && jogo.ocupado) return false;
    var a = d.j[alvoSel]; return alvoSel !== d.eu && ativoJ(a) && !a.au;
  }
  function escolherAlvo(d) {
    var opos = [], i;
    for (i = 0; i < d.j.length; i++) if (i !== d.eu) opos.push(i);
    var bons = opos.filter(function (k) { return ativoJ(d.j[k]) && !d.j[k].au; });
    if (opos.indexOf(alvoSel) < 0) alvoSel = bons.length ? bons[0] : opos[0];
    if (d.fase === 'jogo' && bons.length && bons.indexOf(alvoSel) < 0) alvoSel = bons[0];
    return opos;
  }
  function restantes(d, b) { var total = L.NIVEIS[d.nivel].frota.length, afund = d.log.filter(function (e) { return e[1] === b && e[4] === 2; }).length; return total - afund; }

  function desenhar() {
    if (!jogo || jogo.religando) return;           // pertinho: trocando os QR codes de novo, a tela é a do QR
    if (jogo.modo === 'rede') { desenharRede(); return; }
    desenharJogo();
  }
  // refaz um pedaço da tela só quando o conteúdo muda (refazer botões toda hora perde o toque de quem está apertando)
  function refazer(el, chave, fn) { chave = pref.lingua + '|' + chave; if (el._chave === chave) return; el._chave = chave; el.innerHTML = ''; fn(el); }
  function desenharJogo() {
    var g = jogo, d = dados(), n = L.NIVEIS[d.nivel].n, opos = escolherAlvo(d), eu = d.eu;
    // banner (de quem é a vez, sempre grande)
    var b = textoBanner(d), ban = $('banner');
    ban.className = 'banner ' + b.classe; ban.style.setProperty('--cor', b.cor || '');
    ban.textContent = b.txt; if (b.sub) { var sm = document.createElement('small'); sm.textContent = b.sub; ban.appendChild(sm); }
    // ordem das vezes
    refazer($('fila'), JSON.stringify([d.j, d.vez, d.fase, eu, g.modo]), function (fila) { d.j.forEach(function (p, i) {
      var c = document.createElement('span'); c.style.setProperty('--cor', CORES[i]);
      c.className = (i === d.vez && d.fase === 'jogo' ? 'vez' : '') + (p.f ? ' fora' : '') + (p.s ? ' saiu' : '');
      c.textContent = (i === d.vez && d.fase === 'jogo' ? '▶ ' : '') + nomeJ(d.j, i) + (i === eu && g.modo === 'rede' ? t(' (você)', ' (you)') : '') + (p.f ? ' 💀' : p.s ? ' 🚪' : p.au ? ' 📡' : '');
      fila.appendChild(c);
    }); });
    // anfitrião: continuar sem quem sumiu
    var ausentes = g.modo === 'rede' && d.host && d.fase === 'jogo' ? d.j.map(function (p, i) { return i !== eu && ativoJ(p) && p.au ? i : -1; }).filter(function (i) { return i >= 0; }) : [];
    $('semEle').hidden = !ausentes.length;
    refazer($('semEle'), JSON.stringify(ausentes) + d.j.map(function (p) { return p.nome; }).join(), function (sem) { ausentes.forEach(function (i) {
      var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'medio';
      bt.textContent = t('➡️ Continuar sem ', '➡️ Go on without ') + nomeJ(d.j, i);
      bt.addEventListener('click', function () { if (jogo === g) g.p.continuarSem(i); });
      sem.appendChild(bt);
    }); });
    // em quem atirar (3 ou 4 jogadores)
    $('alvos').hidden = opos.length < 2;
    refazer($('alvos'), JSON.stringify([opos.map(function (i) { var p = d.j[i]; return [p.nome, p.f, p.s, p.au, restantes(d, i)]; }), alvoSel]), function (alvos) { if (opos.length > 1) opos.forEach(function (i) {
      var p = d.j[i], bt = document.createElement('button'); bt.type = 'button'; bt.setAttribute('role', 'tab');
      bt.style.setProperty('--cor', CORES[i]); bt.setAttribute('aria-selected', i === alvoSel ? 'true' : 'false');
      bt.textContent = '🎯 ' + nomeJ(d.j, i) + ' · 🚢' + restantes(d, i) + (p.f ? ' 💀' : p.s ? ' 🚪' : p.au ? ' 📡' : '');
      bt.addEventListener('click', function () { alvoSel = i; desenhar(); });
      alvos.appendChild(bt);
    }); });
    // mares
    montar($('tabAlvo'), n, true); montar($('tabMeu'), n, false);
    var ult = d.log.length ? d.log[d.log.length - 1] : null;
    $('tituloAlvo').textContent = (g.modo === 'pc' ? '🤖 ' + t('Mar do computador', "Computer's sea") : '🎯 ' + t('Mar de ', "Sea of ") + nomeJ(d.j, alvoSel)) + ' · 🚢 ' + restantes(d, alvoSel);
    var va = L.vista(d.log, alvoSel, n), navA = va.afundados.map(function (nv) { return { nv: nv, tipo: tipoNoMar(d, alvoSel, nv), cls: 'afundado' }; });
    (d.revel[alvoSel] || []).forEach(function (nv) {      // no fim: os navios que sobraram, clarinhos
      if (!L.celulas(nv).every(function (c) { return va.v[c[1]][c[0]] === 3; })) navA.push({ nv: nv, tipo: Nav.daFrota(d.revel[alvoSel], nv), cls: 'fantasma' });
    });
    pintar($('tabAlvo'), n, { vista: va, fantasma: d.revel[alvoSel], pode: podeAtirar(d), pend: d.pend && d.pend.alvo === alvoSel ? d.pend : null, ultimo: ult && ult[1] === alvoSel ? [ult[2], ult[3]] : null, navios: navA });
    var mostraMeu = eu >= 0;
    $('tabMeu').parentNode.hidden = !mostraMeu;
    if (mostraMeu) {
      $('tituloMeu').textContent = '🛡️ ' + (g.modo === 'passa' ? t('Mar de ', 'Sea of ') + nomeJ(d.j, eu) : t('Seu mar', 'Your sea'));
      var vm = L.vista(d.log, eu, n), minha = d.frota || [], tams = minha.map(function (nv) { return nv.tam; });
      var afund = minha.map(function (nv) { return L.celulas(nv).every(function (c) { return vm.v[c[1]][c[0]] === 3; }); });
      pintar($('tabMeu'), n, { vista: vm, frota: minha, pode: false, ultimo: ult && ult[1] === eu ? [ult[2], ult[3]] : null,
        navios: minha.map(function (nv, k) { return { nv: nv, tipo: Nav.tipo(tams, k), cls: afund[k] ? 'afundado' : '' }; }) });
      refazer($('frotaInfo'), JSON.stringify([d.frota, afund]), function (info) { minha.forEach(function (nv, k) {
        var s = document.createElement('span'); s.textContent = (afund[k] ? '💀 ' : '🚢 ') + N(Nav.TIPOS[Nav.tipo(tams, k)]); if (afund[k]) s.style.textDecoration = 'line-through';
        info.appendChild(s);
      }); });
    }
    $('ultimo').textContent = ult ? nomeJ(d.j, ult[0]) + ' → ' + nomeJ(d.j, ult[1]) + ' ' + L.coord(ult[2], ult[3]) + ': ' + ['💦 ' + t('água', 'water'), '💥 ' + t('acertou', 'hit'), '🚢 ' + t('afundou', 'sunk')][ult[4]] : '';
    // tiros novos: animação, som e o estouro no meio da tela
    if (g.vistos == null || g.vistos > d.log.length) g.vistos = d.log.length;
    if (d.log.length > g.vistos) { var novo = d.log[d.log.length - 1]; g.vistos = d.log.length; mostrarTiro(d, novo); }
    // fim
    var fc = $('fimCaixa');
    if (d.fase === 'fim') {
      fc.hidden = false;
      var ganhei = d.venc === eu, nomeV = d.venc >= 0 ? nomeJ(d.j, d.venc) : '';
      $('fimTitulo').textContent = g.modo === 'pc' ? (ganhei ? t('🏆 Você venceu!', '🏆 You won!') : t('🤖 O computador venceu desta vez!', '🤖 The computer won this time!'))
        : g.modo === 'rede' && ganhei ? t('🏆 Você venceu!', '🏆 You won!') : '🏆 ' + nomeV + t(' venceu!', ' won!');
      $('fimTexto').textContent = t('Partida de ', 'Game of ') + d.log.length + t(' tiros. As frotas que sobraram aparecem clarinhas no mar.', ' shots. The fleets left afloat show up faded in the sea.');
      var bt = $('btDeNovo');
      if (g.modo === 'rede') { bt.hidden = !d.host; bt.textContent = t('🔁 Jogar de novo (mesma turma)', '🔁 Play again (same group)'); if (!d.host) $('fimTexto').textContent += ' ' + t('Quem criou a sala pode começar outra partida.', 'Whoever created the room can start another game.'); }
      else { bt.hidden = false; bt.textContent = t('🔁 Jogar de novo', '🔁 Play again'); }
      if (!g.fimMostrado) {
        g.fimMostrado = true;
        var festa = g.modo === 'passa' || ganhei;
        // espera o último navio terminar de afundar na tela
        setTimeout(function () { if (jogo !== g) return; fc.scrollIntoView({ behavior: 'smooth', block: 'center' }); Som.efeito(festa ? 'vitoria' : 'derrota'); if (festa) confete(); }, 2300 * RAPIDO);
      }
    } else { fc.hidden = true; g.fimMostrado = false; }
  }
  function textoBanner(d) {
    var g = jogo, eu = d.eu, nv = nomeJ(d.j, d.vez);
    if (d.fase === 'fim') {
      if (d.venc < 0) return { txt: t('Fim da partida', 'Game over'), classe: 'fim' };
      return { txt: d.venc === eu && g.modo !== 'passa' ? t('🏆 Você venceu!', '🏆 You won!') : g.modo === 'pc' ? t('🤖 O computador venceu!', '🤖 The computer won!') : '🏆 ' + nomeJ(d.j, d.venc) + t(' venceu!', ' won!'), classe: 'fim' };
    }
    if (g.modo === 'rede') {
      var semAnf = g.p.semAnfitriao();
      if (!g.conectado && g.perto) return { txt: t('📡 Sem conexão com o outro aparelho', '📡 Not connected to the other device'), sub: t('Liguem de novo trocando os códigos.', 'Link again by swapping the codes.'), classe: 'alerta' };
      if (!g.conectado) return { txt: t('📡 Conectando…', '📡 Connecting…'), classe: 'alerta' };
      if (semAnf > 8000) return { txt: t('📡 Procurando o anfitrião…', '📡 Looking for the host…'), sub: t('A partida continua sozinha quando a conexão voltar.', 'The game goes on by itself when the connection is back.'), classe: 'alerta' };
      if (eu >= 0 && !ativoJ(d.j[eu])) return { txt: t('💀 Sua frota afundou!', '💀 Your fleet sank!'), sub: t('Torça pelos outros 👀 · vez de ', 'Cheer for the others 👀 · turn: ') + nv, classe: 'fora' };
    }
    if (d.vez === eu) {
      if (d.pend) return { txt: '💣 ' + t('Tiro em ', 'Shot at ') + L.coord(d.pend.x, d.pend.y) + '…', sub: t('esperando ', 'waiting for ') + nomeJ(d.j, d.pend.alvo) + t(' responder', ' to answer'), classe: 'espera' };
      if (g.modo !== 'rede' && g.ocupado) return { txt: t('👀 Veja o que aconteceu…', '👀 See what happened…'), classe: 'espera' };
      var outros = d.j.filter(function (p, i) { return i !== eu && ativoJ(p); }).length;
      var alvoAus = d.j[alvoSel] && d.j[alvoSel].au;
      if (alvoAus) return { txt: '📡 ' + nomeJ(d.j, alvoSel) + t(' saiu da conexão', ' lost connection'), sub: t('Esperando voltar…', 'Waiting for them to come back…'), classe: 'alerta' };
      return { txt: (g.modo === 'passa' ? '🎯 ' + nv + t(', sua vez!', ', your turn!') : t('🎯 Sua vez!', '🎯 Your turn!')),
        sub: outros > 1 ? t('Escolha um adversário e toque no mar dele', "Pick an opponent and tap their sea") : t('Toque num quadradinho do mar de ', 'Tap a square in the sea of ') + nomeJ(d.j, alvoSel), classe: 'minha' };
    }
    if (g.modo === 'pc') return { txt: t('🤖 O computador está mirando…', '🤖 The computer is aiming…'), classe: 'outro', cor: CORES[1] };
    if (d.j[d.vez] && d.j[d.vez].au) return { txt: '📡 ' + nv + t(' saiu da conexão', ' lost connection'), sub: t('Esperando voltar…', 'Waiting for them to come back…'), classe: 'alerta' };
    return { txt: '⏳ ' + t('Vez de ', 'Turn: ') + nv, sub: t('Espere a sua vez 🙂', 'Wait for your turn 🙂'), classe: 'outro', cor: CORES[d.vez] };
  }
  // um tiro novo: o míssil voa até a casa (o resultado só aparece quando ele chega), depois respingo, explosão ou o
  // navio afundando, o som, o tremor e a faixa no meio da tela. Com "menos movimento" no aparelho: só a marca e o som.
  function mostrarTiro(d, e) {
    var g = jogo, a = e[0], b = e[1], x = e[2], y = e[3], rc = e[4], eu = d.eu, c = L.coord(x, y);
    var noAlvo = b === alvoSel && b !== eu, emMim = b === eu;
    var tab = noAlvo ? $('tabAlvo') : emMim && !$('tabMeu').parentNode.hidden ? $('tabMeu') : null;
    var navio = rc === 2 ? L.deLista(e.slice(5)) : null, tipo = navio ? tipoNoMar(d, b, navio) : null, kN = navio ? chaveNavio(tipo, navio) : null;
    var nomeNavio = tipo ? N(Nav.TIPOS[tipo]) : '', quem = nomeJ(d.j, a), deQuem = nomeJ(d.j, b), meu = a === eu;
    var anima = !!tab && Fx.ativo();
    if (anima) { animar(tab, x, y, 'chegando', 3000); if (kN) fxNavio(tab, kN, noAlvo ? 'escondido' : 'intacto'); }
    function impacto() {
      if (jogo !== g) return;
      if (tab) {
        animar(tab, x, y, rc ? 'boom' : 'splash');
        var p = centroCasa(tab, x, y), mares = tab.closest('.mares') || tab;
        if (rc === 0) Fx.agua(p, p.tam);
        else if (rc === 1) { Fx.explosao(p, p.tam, false); Fx.tremer(mares, false); }
        else {
          L.celulas(navio).forEach(function (cc, i) {
            setTimeout(function () { if (jogo !== g) return; var q = centroCasa(tab, cc[0], cc[1]); Fx.explosao(q, q.tam, true); Fx.bolhas(q, q.tam, 1800); }, i * 170);
          });
          Fx.tremer(mares, true);
          if (anima) { fxNavio(tab, kN, 'afundando'); setTimeout(function () { fxNavio(tab, kN, null); }, 2400); }
        }
      }
      var yc = tab ? centroCasa(tab, x, y).y : null;
      if (rc === 0) estouro('💦 ' + t('Água!', 'Water!'), quem + ' → ' + c, 'agua', '', yc);
      else if (rc === 1) estouro('💥 ' + t('Acertou!', 'Hit!'), emMim && jogo.modo !== 'passa' ? quem + t(' acertou seu navio em ', ' hit your ship at ') + c : quem + ' → ' + c, 'acerto', '', yc);
      else estouro('💥 ' + t('AFUNDOU!', 'SUNK!'), quem + ' → ' + c, 'afundou',
        emMim && jogo.modo !== 'passa' ? (Nav.TIPOS[tipo].fem ? t('Sua ', 'Your ') : t('Seu ', 'Your ')) + nomeNavio : jogo.modo === 'pc' ? nomeNavio : t(nomeNavio + ' de ' + deQuem, deQuem + '’s ' + nomeNavio), yc);
      Som.efeito(['agua', 'acerto', 'afundou'][rc]);
      if (rc && (meu || emMim)) vibrar(rc === 2 ? [90, 50, 140, 50, 240] : 80);
    }
    if (anima) { Som.efeito(meu || !emMim ? 'disparo' : 'assobio'); Fx.tiro(origemTiro(tab), centroCasa(tab, x, y), 650, impacto); }
    else impacto();
  }

  // ---------- clicar no mar do adversário ----------
  $('tabAlvo').addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('button.c'); if (!c || c.disabled || !jogo) return;
    var x = +c.getAttribute('data-x'), y = +c.getAttribute('data-y');
    var d = dados(); if (!podeAtirar(d)) return;
    if (jogo.modo === 'rede') { if (jogo.p.atirar(alvoSel, x, y)) { Som.efeito('toque'); desenhar(); } }
    else atirarLocal(alvoSel, x, y);
  });
  // setas andam pelo mar (teclado e controle)
  $('tabAlvo').addEventListener('keydown', function (e) {
    var dir = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[e.key];
    var c = e.target.closest && e.target.closest('button.c'); if (!dir || !c) return;
    var el = $('tabAlvo'), n = el._n, x = +c.getAttribute('data-x'), y = +c.getAttribute('data-y');
    x = Math.max(0, Math.min(n - 1, x + dir[0])); y = Math.max(0, Math.min(n - 1, y + dir[1]));
    e.preventDefault(); el._c[y][x].focus();
  });

  // ======================= LOCAL: contra o computador e passar o aparelho =======================
  function novoLocal(modo, nivel) {
    sairDoJogo();
    var j = modo === 'pc' ? [{ nome: t('Você', 'You') }, { nome: t('Computador', 'Computer') }] : [{ nome: t('Jogador 1', 'Player 1') }, { nome: t('Jogador 2', 'Player 2') }];
    jogo = { modo: modo, nivel: nivel, j: j, frotas: [null, null], log: [], vez: 0, eu: 0, fase: 'arrumar', venc: -1, ocupado: false, vistos: null };
    alvoSel = 1;
    if (modo === 'pc') {
      jogo.ia = L.IA(nivel); jogo.frotas[1] = L.aleatoria(nivel);
      abrirArrumar({ nivel: nivel, titulo: t('⚓ Arrume sua frota', '⚓ Place your fleet'), aoPronto: function (f) { jogo.frotas[0] = f; comecarLocal(); } });
      return;
    }
    var g = jogo;
    cortina(t('Jogador 1: arrume sua frota', 'Player 1: place your fleet'), t('O Jogador 2 não pode olhar! 🙈', 'Player 2, no peeking! 🙈'), function () {
      abrirArrumar({ nivel: nivel, titulo: t('⚓ Frota do Jogador 1', '⚓ Player 1 fleet'), aoPronto: function (f) {
        g.frotas[0] = f;
        cortina(t('Passe o aparelho para o Jogador 2', 'Pass the device to Player 2'), t('Jogador 2: arrume sua frota. O Jogador 1 não pode olhar! 🙈', 'Player 2: place your fleet. Player 1, no peeking! 🙈'), function () {
          abrirArrumar({ nivel: nivel, titulo: t('⚓ Frota do Jogador 2', '⚓ Player 2 fleet'), aoPronto: function (f2) {
            g.frotas[1] = f2;
            cortina(t('Passe o aparelho para o Jogador 1', 'Pass the device to Player 1'), t('O Jogador 1 começa atirando.', 'Player 1 fires first.'), comecarLocal);
          } });
        });
      } });
    });
  }
  function comecarLocal() {
    var g = jogo; g.fase = 'jogo'; g.vez = 0; g.eu = 0; alvoSel = 1; g.vistos = 0;
    mostrar('jogo'); desenhar();
    estouro(t('⚔️ Começou!', '⚔️ Battle on!'), '', 'vez');
    setTimeout(function () { if (jogo === g) Som.efeito('comecou'); }, 700 * RAPIDO);
  }
  function atirarLocal(b, x, y) {
    var g = jogo;
    if (g.fase !== 'jogo' || g.ocupado) return null;
    var tiros = {};
    g.log.forEach(function (e) { if (e[1] === b) tiros[L.chave(e[2], e[3])] = 1; });
    if (tiros[L.chave(x, y)]) return null;
    var res = L.resolver(g.frotas[b], tiros, x, y), a = g.vez;
    var e = [a, b, x, y, L.R[res.r]]; if (res.navio) e = e.concat(L.paraLista(res.navio));
    g.log.push(e);
    if (res.fim) { g.fase = 'fim'; g.venc = a; g.j[b].f = 1; }
    g.ocupado = g.fase === 'jogo';
    desenhar();
    if (g.fase !== 'jogo') return e;
    setTimeout(function () {
      if (jogo !== g) return;
      g.ocupado = false; g.vez = b;
      if (g.modo === 'pc') { desenhar(); if (g.vez === 1) setTimeout(function () { if (jogo === g) vezDoComputador(); }, 700 * RAPIDO); else Som.efeito('vez'); }
      else {
        cortina(t('Passe o aparelho para ', 'Pass the device to ') + nomeJ(g.j, b), t('Vez de ', 'Turn: ') + nomeJ(g.j, b) + t('. Quem atirou agora não olha! 🙈', '. The other player, no peeking! 🙈'), function () {
          if (jogo !== g) return;
          g.eu = b; alvoSel = a; desenhar(); Som.efeito('vez');
        });
      }
    }, (res.r === 'afundou' ? 2700 : 1700) * RAPIDO);
    return e;
  }
  function vezDoComputador() {
    var g = jogo; if (!g || g.fase !== 'jogo' || g.vez !== 1) return;
    var c = g.ia.escolher(), e = atirarLocal(0, c[0], c[1]);
    if (e) g.ia.anotar(e[2], e[3], L.RN[e[4]], e[4] === 2 ? L.deLista(e.slice(5)) : null);
  }

  // ======================= EM REDE =======================
  function abrirAmigos(codigo) {
    $('nome').value = pref.nome || '';
    $('codigo').value = codigo || '';
    $('amigosMsg').textContent = navigator.onLine === false ? t('📡 Sem internet agora. Conecte no Wi-Fi ou nos dados para jogar com amigos.', '📡 No internet right now. Connect to Wi-Fi or data to play with friends.') : '';
    mostrar('amigos');
    // no computador o cursor já vai para o nome; no celular não (o teclado subiria antes de escolher criar ou entrar)
    if (!(('ontouchstart' in window) || navigator.maxTouchPoints > 0)) $('nome').focus();
  }
  function guardarNome() { pref.nome = R.nome($('nome').value); salvarPref(); return pref.nome; }
  $('btCriar').addEventListener('click', function () { guardarNome(); escolherNivel('criar'); });
  $('codigo').addEventListener('input', function () { this.value = this.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); });
  $('formEntrar').addEventListener('submit', function (e) {
    e.preventDefault();
    var c = $('codigo').value.trim().toUpperCase();
    if (!/^[A-Z]{4}$/.test(c)) { $('amigosMsg').textContent = t('O código tem 4 letras (quem criou a partida vê na tela).', 'The code has 4 letters (whoever created the game sees it on screen).'); $('codigo').focus(); return; }
    var nome = guardarNome();
    conectar({ id: R.idNovo(), nome: nome, codigo: c, host: false });
  });
  function criarRede(nivel) { conectar({ id: R.idNovo(), nome: pref.nome, codigo: R.codigoNovo(), host: true, nivel: nivel }); }

  // op.conexao (Jogar pertinho): canal direto já aberto com o outro aparelho — nada é guardado para voltar depois de
  // recarregar (o canal não sobrevive; ligar de novo = trocar os QR codes de novo) e o endereço não ganha ?sala=
  function conectar(op) {
    sairDoJogo(true);
    var d = op.dados, g = { modo: 'rede', codigo: d ? d.codigo : op.codigo, canal: null, timer: null, conectado: false, desde: Date.now(), vistos: null, ultimaFase: null,
      perto: !!op.conexao, conexao: op.conexao || null, papelPerto: op.papelPerto };
    jogo = g; alvoSel = -1;
    g.p = R.criar({ id: d ? d.id : op.id, nome: op.nome, codigo: g.codigo, host: op.host, nivel: op.nivel, dados: d,
      mandar: function (m) { if (g.canal) g.canal.mandar(m); },
      salvar: function (x) { if (jogo === g && !g.perto) guardarRede(x.saiu ? null : x); },
      aoMudar: function () { if (jogo === g) desenhar(); } });
    if (g.perto) manterTelaAcesa(true);
    else {
      guardarRede(g.p.exportar());
      enderecoSala(g.codigo);      // recarregar a página volta direto para esta partida
    }
    mostrar('sala'); desenhar();
    abrirCanal(g).then(function () {
      g.p.entrar();
      var vez = 0;
      g.timer = setInterval(function () { g.p.tique(); if (++vez % 2 === 0) desenhar(); }, 500);
      desenhar();
    }).catch(function () {
      if (jogo !== g) return;
      abrirJanela({ titulo: t('📡 Não consegui conectar', "📡 Couldn't connect"),
        texto: t('Jogar com amigos em aparelhos diferentes precisa de internet. Confira o Wi-Fi ou os dados e tente de novo. Sem internet, dá para jogar pertinho (📶, no mesmo Wi-Fi), contra o computador ou passando o aparelho.', 'Playing with friends on different devices needs internet. Check Wi-Fi or data and try again. Offline, you can play nearby (📶, same Wi-Fi), against the computer or pass the device.'),
        botoes: [{ t: t('🔄 Tentar de novo', '🔄 Try again'), fn: function () { conectar({ dados: g.p.exportar() }); } }, { t: t('Voltar', 'Back'), fn: function () { sairDoJogo(true); mostrar('inicio'); } }] });
    });
  }
  function abrirCanal(g) {
    var cx = g.conexao; g.conexao = null;
    return R.abrir(g.codigo, function (m) { if (jogo === g) g.p.receber(m); }, function () { if (jogo === g) { if (g.perto) caiuPerto(g); else reabrir(g); } }, cx).then(function (canal) {
      if (jogo !== g) { canal.fechar(); throw new Error('saiu'); }
      g.canal = canal; g.conectado = true;
    });
  }
  // o canal caiu (tela travada, Wi-Fi): abre outro em silêncio, tentando de novo a cada poucos segundos;
  // a partida não perde nada — os tiros esperando são repetidos e o estado chega no próximo aviso do anfitrião
  function reabrir(g) {
    if (g.reabrindo || jogo !== g || g.perto) return;
    g.reabrindo = true; g.conectado = false;
    var velho = g.canal; g.canal = null; if (velho) velho.fechar();
    desenhar();
    abrirCanal(g).then(function () { g.reabrindo = false; g.p.entrar(); desenhar(); })
      .catch(function () { g.reabrindo = false; if (jogo === g) setTimeout(function () { reabrir(g); }, 4000); });
  }
  var escondidoEm = 0;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { escondidoEm = Date.now(); return; }
    if (jogo && jogo.perto) manterTelaAcesa(true);
    if (jogo && jogo.modo === 'rede' && escondidoEm && Date.now() - escondidoEm > 8000) reabrir(jogo);
  });
  window.addEventListener('online', function () { if (jogo && jogo.modo === 'rede' && !R.LOCAL) reabrir(jogo); });
  // fechar a partida atual (manter = guardar a partida em rede para voltar depois, sem avisar os outros)
  function sairDoJogo(manter) {
    var g = jogo; if (!g) return;
    jogo = null; arr = null;
    if (g.modo === 'rede') {
      clearInterval(g.timer);
      if (!manter) { g.p.sair(); if (!g.perto) { guardarRede(null); enderecoSala(null); } }
      if (g.perto) manterTelaAcesa(false);
      var c = g.canal; if (c) setTimeout(function () { c.fechar(); }, manter ? 0 : 800);
    }
  }
  function confirmarSair() {
    var g = jogo; if (!g) { mostrar('inicio'); return; }
    var fim = g.modo === 'rede' ? g.p.estado().fase === 'fim' : g.fase === 'fim';
    if (fim) { sairDoJogo(); mostrar('inicio'); return; }
    abrirJanela({ titulo: t('Sair da partida?', 'Leave the game?'),
      texto: g.modo === 'rede' ? t('Os outros continuam sem você.', 'The others go on without you.') : t('A partida vai acabar.', 'The game will end.'),
      botoes: [{ t: t('🚪 Sim, sair', '🚪 Yes, leave'), fn: function () { sairDoJogo(); mostrar('inicio'); } }, { t: t('Continuar jogando', 'Keep playing') }] });
  }
  $('btSairJogo').addEventListener('click', confirmarSair);
  $('btSairSala').addEventListener('click', confirmarSair);
  $('btInicioFim').addEventListener('click', function () { sairDoJogo(); mostrar('inicio'); });
  $('btDeNovo').addEventListener('click', function () {
    var g = jogo; if (!g) return;
    if (g.modo === 'rede') { g.p.revanche(); return; }
    novoLocal(g.modo, g.nivel);
  });

  function linkConvite(c) { return location.origin + location.pathname + '?sala=' + c; }
  $('btCompartilhar').addEventListener('click', function () {
    if (!jogo || jogo.modo !== 'rede') return;
    var url = linkConvite(jogo.codigo), txt = t('Vem jogar Batalha Naval comigo! Código: ', 'Come play Sea Battle with me! Code: ') + jogo.codigo;
    if (navigator.share) navigator.share({ title: t('Batalha Naval', 'Sea Battle'), text: txt, url: url }).catch(function () { /* cancelou */ });
    else copiar(url);
  });
  $('btCopiar').addEventListener('click', function () { if (jogo && jogo.modo === 'rede') copiar(linkConvite(jogo.codigo)); });
  function copiar(url) {
    var ok = function () { aviso(t('🔗 Link copiado! Cole na conversa com quem vai jogar.', '🔗 Link copied! Paste it in a chat with the other players.')); };
    var manual = function () { var s = window.getSelection(), r = document.createRange(); r.selectNodeContents($('salaLink')); s.removeAllRanges(); s.addRange(r); aviso(t('Copie o link que ficou marcado.', 'Copy the highlighted link.')); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, manual); else manual();
  }

  function desenharRede() {
    var g = jogo, p = g.p, s = p.estado(), eu = p.meu();
    if (s.nao) {
      sairDoJogo(true); guardarRede(null); enderecoSala(null); mostrar('inicio');
      abrirJanela({ titulo: s.nao === 'cheia' ? t('A sala está cheia', 'The room is full') : t('Essa partida já começou', 'That game already started'),
        texto: s.nao === 'cheia' ? t('Cabem até 4 jogadores por partida. Crie outra partida para vocês.', 'Up to 4 players per game. Create another game for your group.') : t('Espere acabar e peça para quem criou tocar em Jogar de novo — ou crie outra partida.', 'Wait for it to end and ask the creator to tap Play again — or create another game.') });
      return;
    }
    if (s.saiu) return;
    if (s.fase === 'sala') {
      if (g.ultimaFase && g.ultimaFase !== 'sala') { g.vistos = null; $('fimCaixa').hidden = true; }
      if (atual !== 'arrumar' && atual !== 'sala') mostrar('sala');
      desenharSala();
    } else {
      if (atual !== 'jogo') {
        mostrar('jogo');
        if (g.ultimaFase === 'sala') { setTimeout(function () { estouro(t('⚔️ Começou!', '⚔️ Battle on!'), '', 'vez'); Som.efeito('comecou'); }, 50); }
      }
      var antesVez = g.ultimaVez;
      desenharJogo();
      if (s.fase === 'jogo' && s.vez === eu && antesVez !== eu && g.ultimaFase) {
        setTimeout(function () { if (jogo === g && g.p.estado().vez === eu && !g.p.estado().pend) { estouro(t('🎯 Sua vez!', '🎯 Your turn!'), '', 'vez'); Som.efeito('vez'); vibrar(60); } }, 1500 * RAPIDO);
      }
      g.ultimaVez = s.vez;
    }
    g.ultimaFase = s.fase;
  }
  function desenharSala() {
    var g = jogo, p = g.p, s = p.estado(), eu = p.meu();
    $('salaConvite').hidden = !!g.perto; $('salaPerto').hidden = !g.perto;
    $('salaCodigo').textContent = g.codigo; $('salaLink').textContent = linkConvite(g.codigo);
    var lista = $('salaLista'); lista.innerHTML = '';
    s.j.forEach(function (pj, i) {
      var li = document.createElement('li'); li.style.setProperty('--cor', CORES[i]);
      var nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = (i === s.h ? '👑 ' : '') + nomeJ(s.j, i) + (i === eu ? t(' (você)', ' (you)') : '');
      var st = document.createElement('span'); st.className = 'st';
      st.textContent = pj.au ? t('📡 sem conexão', '📡 offline') : pj.p ? t('✅ pronto', '✅ ready') : t('⚓ arrumando', '⚓ placing');
      li.appendChild(nm); li.appendChild(st); lista.appendChild(li);
    });
    var status = $('salaStatus'), bA = $('btArrumar'), bC = $('btComecar');
    bA.hidden = eu < 0; bC.hidden = !p.souHost();
    if (!g.conectado) status.textContent = g.perto ? t('📡 Sem conexão com o outro aparelho.', '📡 Not connected to the other device.') : t('📡 Conectando…', '📡 Connecting…');
    else if (eu < 0) status.textContent = Date.now() - g.desde > 10000 ? t('🤔 Ninguém respondeu nesse código ainda. Confira as 4 letras com quem criou a partida (ela precisa estar com o jogo aberto).', '🤔 No one answered on that code yet. Check the 4 letters with whoever created the game (they need the game open).') : t('Entrando na sala…', 'Joining the room…');
    else if (p.semAnfitriao() > 8000) status.textContent = t('📡 Sem notícias de quem criou a sala…', '📡 No news from the room creator…');
    else if (p.souHost()) {
      var prontos = s.j.filter(function (x) { return x.p; }).length;
      status.textContent = s.j.length < 2 ? t('Esperando mais alguém entrar (mínimo 2 jogadores).', 'Waiting for someone else to join (at least 2 players).')
        : prontos < s.j.length ? t('Esperando todos arrumarem a frota (', 'Waiting for everyone to place their fleet (') + prontos + t(' de ', ' of ') + s.j.length + ').'
        : t('Todos prontos! Toque em Começar a batalha.', 'Everyone is ready! Tap Start the battle.');
    } else status.textContent = s.j[eu].p ? t('✅ Sua frota está pronta. Quando todos estiverem prontos, ', '✅ Your fleet is ready. When everyone is ready, ') + nomeJ(s.j, s.h) + t(' começa a batalha.', ' starts the battle.') : t('Arrume sua frota e toque em Pronto.', 'Place your fleet and tap Ready.');
    bA.textContent = eu >= 0 && s.j[eu].p ? t('✏️ Mudar minha frota', '✏️ Change my fleet') : t('⚓ Arrumar minha frota', '⚓ Place my fleet');
    bC.disabled = !p.podeComecar();
  }
  $('btArrumar').addEventListener('click', function () {
    var g = jogo; if (!g || g.modo !== 'rede') return;
    var s = g.p.estado(), eu = g.p.meu(); if (eu < 0) return;
    if (s.j[eu].p) g.p.pronto(false);
    abrirArrumar({ nivel: s.nivel, frota: s.frota, titulo: '⚓ ' + t('Sua frota', 'Your fleet') + ' · ' + N(L.NIVEIS[s.nivel]) + ' ' + L.NIVEIS[s.nivel].n + '×' + L.NIVEIS[s.nivel].n,
      aoPronto: function (f) { if (jogo !== g) return; g.p.definirFrota(f); g.p.pronto(true); mostrar('sala'); desenhar(); } });
  });
  $('btComecar').addEventListener('click', function () { if (jogo && jogo.modo === 'rede') jogo.p.comecar(); });

  // ======================= JOGAR PERTINHO (sem internet, por QR code) =======================
  // Quem cria: oferta (QR) → lê a resposta do outro → conectados. Quem entra: lê a oferta → mostra a resposta (QR).
  // A conexão e os códigos ficam no pertinho.js; desenhar e ler QR no qr.js; a partida é a mesma do jogo em rede.
  var P = window.BNPertinho, Q = window.BNQR;
  var perto = null;                 // { papel: 'criar' | 'entrar', nivel, g (reconectar uma partida), ses, leitor, codigo, qr, etapa, tempo }
  var ESPERA_ABRIR = TESTE ? 4000 : 20000, ESPERA_DICA = TESTE ? 4000 : 45000;
  var trava = null;
  function manterTelaAcesa(liga) {    // tela apagada derruba a conexão direta; enquanto joga pertinho, a tela fica acesa
    if (!liga) { if (trava) { try { trava.release(); } catch (e) { /* ok */ } } trava = null; return; }
    if (trava || document.hidden || !navigator.wakeLock) return;
    navigator.wakeLock.request('screen').then(function (w) { trava = w; w.addEventListener('release', function () { if (trava === w) trava = null; }); }).catch(function () { /* sem trava */ });
  }
  function abrirPerto() {
    $('nomePerto').value = pref.nome || '';
    $('pertoMsg').textContent = P.temWebRTC() ? '' : t('😕 Este navegador não consegue ligar dois aparelhos direto. Use o Chrome (Android) ou o Safari (iPhone) atualizados.', "😕 This browser can't link two devices directly. Use an up-to-date Chrome (Android) or Safari (iPhone).");
    mostrar('perto');
  }
  function nomePerto() { pref.nome = R.nome($('nomePerto').value); salvarPref(); return pref.nome; }
  $('btPerto').addEventListener('click', abrirPerto);
  $('btPertoCriar').addEventListener('click', function () { if (!P.temWebRTC()) return; nomePerto(); escolherNivel('perto'); });
  $('btPertoEntrar').addEventListener('click', function () { if (!P.temWebRTC()) return; nomePerto(); pertoEntrar(null); });

  function limparPerto(s) {
    if (!s) return;
    clearTimeout(s.tempo); clearTimeout(s.dica);
    if (s.leitor) { s.leitor.parar(); s.leitor = null; }
    if (s.ses && !s.conectou) s.ses.fechar();
  }
  // cancelar (ou o botão Voltar): fecha tudo e volta para onde estava
  function cancelarPerto() {
    var s = perto; perto = null; limparPerto(s);
    if (s && s.g && jogo === s.g) { s.g.religando = false; mostrar(s.g.p.estado().fase === 'sala' ? 'sala' : 'jogo'); desenhar(); caiuPerto(s.g, true); return; }
    mostrar('perto');
  }
  $('btPertoCancelar1').addEventListener('click', cancelarPerto);
  $('btPertoCancelar2').addEventListener('click', cancelarPerto);
  $('btPertoDeNovo').addEventListener('click', function () { var s = perto; if (!s) return; if (s.papel === 'criar') pertoCriar(s.nivel, s.g); else pertoEntrar(s.g); });

  function telaCodigo(s, titulo, dica) {
    $('pertoCodTitulo').textContent = titulo; $('pertoCodDica').textContent = dica;
    $('pertoCodStatus').textContent = t('⏳ Preparando o código…', '⏳ Getting the code ready…');
    $('pertoCodTexto').textContent = ''; $('btPertoLerResposta').hidden = true; $('btPertoDeNovo').hidden = true;
    var cv = $('pertoQR'); cv.width = cv.height = 1; cv.hidden = true;
    mostrar('pertoCodigo');
  }
  function mostrarQR(s, codigo, status) {
    s.codigo = codigo; $('pertoCodTexto').textContent = codigo; $('pertoCodStatus').textContent = status;
    return Q.desenhar($('pertoQR'), codigo).then(function (info) { if (perto !== s) return; s.qr = info; $('pertoQR').hidden = false; },
      function () { if (perto === s) $('pertoCodStatus').textContent = t('😕 Não consegui desenhar o QR. Use o código em texto aqui embaixo.', "😕 Couldn't draw the QR. Use the text code below."); });
  }
  $('btPertoCopiar').addEventListener('click', function () {
    var txt = $('pertoCodTexto').textContent; if (!txt) return;
    var ok = function () { aviso(t('📋 Código copiado!', '📋 Code copied!')); };
    var manual = function () { var sel = window.getSelection(), r = document.createRange(); r.selectNodeContents($('pertoCodTexto')); sel.removeAllRanges(); sel.addRange(r); aviso(t('Copie o código que ficou marcado.', 'Copy the highlighted code.')); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, manual); else manual();
  });

  // quem cria: g = partida que caiu (reconectar sem perder nada)
  function pertoCriar(nivel, g) {
    limparPerto(perto);
    var s = perto = { papel: 'criar', nivel: nivel, g: g || null, etapa: 'oferta' };
    if (g) g.religando = true;
    telaCodigo(s, t('1️⃣ Mostre este código para o outro aparelho', '1️⃣ Show this code to the other device'),
      t('No outro aparelho: 📶 Jogar pertinho → 📷 Entrar pertinho, e aponte a câmera para este quadrado.', 'On the other device: 📶 Play nearby → 📷 Join nearby, and point the camera at this square.'));
    $('pertoCodStatus').textContent = t('⏳ Preparando o código… (se pedir a câmera, toque em Permitir)', '⏳ Getting the code ready… (if it asks for the camera, tap Allow)');
    P.criar({ camera: true }).then(function (ses) {
      if (perto !== s) { ses.fechar(); return; }
      s.ses = ses;
      ses.aberta.then(function (cx) { conectou(s, cx); }, function () { falhouPerto(s); });
      mostrarQR(s, ses.codigo, t('Quando o outro aparelho mostrar o código dele, toque no botão aqui embaixo.', 'When the other device shows its code, tap the button below.'));
      $('btPertoLerResposta').hidden = false;
    }, function (e) { erroPerto(s, e); });
  }
  $('btPertoLerResposta').addEventListener('click', function () {
    var s = perto; if (!s || s.papel !== 'criar' || !s.ses) return;
    s.etapa = 'lerResposta';
    abrirLeitor(s, t('3️⃣ Leia o código do outro aparelho', "3️⃣ Scan the other device's code"), t('Aponte a câmera para o quadrado que apareceu no outro aparelho.', 'Point the camera at the square on the other device.'));
  });
  // quem entra
  function pertoEntrar(g) {
    limparPerto(perto);
    var s = perto = { papel: 'entrar', g: g || null, etapa: 'lerOferta' };
    if (g) g.religando = true;
    abrirLeitor(s, t('2️⃣ Leia o código de quem criou', '2️⃣ Scan the creator’s code'), t('Aponte a câmera para o quadrado preto e branco na tela do outro aparelho.', 'Point the camera at the black and white square on the other device.'));
  }
  function abrirLeitor(s, titulo, dica) {
    $('pertoLerTitulo').textContent = titulo; $('pertoLerDica').textContent = dica;
    $('pertoLerStatus').textContent = t('📷 Abrindo a câmera…', '📷 Opening the camera…');
    $('pertoColar').value = ''; $('pertoVideo').hidden = false;
    mostrar('pertoLer');
    Q.ler($('pertoVideo'), lerCodigo).then(function (leitor) {
      if (perto !== s) { leitor.parar(); return; }
      s.leitor = leitor; if (!s.avisou && (s.etapa === 'lerOferta' || s.etapa === 'lerResposta')) $('pertoLerStatus').textContent = t('🔎 Procurando o código…', '🔎 Looking for the code…');
    }, function (e) {
      if (perto !== s) return;
      $('pertoLerStatus').textContent = e.codigo === 'negado'
        ? t('📷 A câmera não foi liberada. Libere a câmera para este site (no cadeado ao lado do endereço) ou cole o código em texto aqui embaixo.', '📷 The camera was not allowed. Allow the camera for this site (padlock next to the address) or paste the text code below.')
        : t('📷 Não achei a câmera. Cole o código em texto aqui embaixo.', "📷 Couldn't find a camera. Paste the text code below.");
      $('pertoColarCaixa').open = true;
    });
  }
  $('btPertoUsar').addEventListener('click', function () { lerCodigo($('pertoColar').value); });

  // um código lido pela câmera (ou colado) — o mesmo caminho para os dois
  function lerCodigo(texto) {
    var s = perto; if (!s || (s.etapa !== 'lerOferta' && s.etapa !== 'lerResposta')) return false;
    var r;
    try { r = P.deCodigo(texto); } catch (e) { avisoCodigo(e.codigo); return false; }
    var quero = s.etapa === 'lerOferta' ? 'offer' : 'answer';
    if (r.type !== quero) { avisoCodigo(quero === 'offer' ? 'resposta' : 'oferta'); return false; }
    Som.efeito('por'); vibrar(40);
    if (s.etapa === 'lerResposta') {
      s.etapa = 'conectando';
      if (s.leitor) { s.leitor.parar(); s.leitor = null; }
      $('pertoVideo').hidden = true;
      $('pertoLerStatus').textContent = t('🔗 Código lido! Ligando os dois aparelhos…', '🔗 Code scanned! Linking the two devices…');
      s.ses.aceitar(texto).then(function () {
        if (perto !== s) return;
        s.tempo = setTimeout(function () { if (perto === s && !s.conectou) falhouPerto(s); }, ESPERA_ABRIR);
      }, function () { if (perto === s) { s.etapa = 'lerResposta'; avisoCodigo('lixo'); } });
      return true;
    }
    s.etapa = 'resposta';
    $('pertoLerStatus').textContent = t('✅ Código lido! Preparando a resposta…', '✅ Code scanned! Getting the answer ready…');
    // a câmera continua ligada enquanto o aparelho junta os endereços (assim ele mostra o endereço de verdade na rede)
    P.entrar(texto, { camera: !s.leitor }).then(function (ses) {
      if (s.leitor) { s.leitor.parar(); s.leitor = null; }
      if (perto !== s) { ses.fechar(); return; }
      s.ses = ses;
      ses.aberta.then(function (cx) { conectou(s, cx); }, function () { falhouPerto(s); });
      telaCodigo(s, t('4️⃣ Agora mostre este código para quem criou', '4️⃣ Now show this code to the creator'),
        t('Quem criou toca em "📷 Agora ler o código do outro celular" e aponta a câmera para cá.', 'The creator taps "📷 Now scan the other phone\'s code" and points the camera here.'));
      mostrarQR(s, ses.codigo, t('⏳ Esperando o outro aparelho ler este código…', '⏳ Waiting for the other device to scan this code…'));
      s.dica = setTimeout(function () {
        if (perto !== s || s.conectou) return;
        $('pertoCodStatus').textContent = t('🤔 Ainda não ligou. Confira: os dois estão no MESMO Wi-Fi (o do celular-roteador)? Wi-Fi de avião, hotel ou loja costuma não deixar um aparelho ver o outro. Se quem criou já leu este código, toque em Começar de novo nos dois.', "🤔 Not linked yet. Check: are both on the SAME Wi-Fi (the hotspot phone's)? Plane, hotel or shop Wi-Fi often doesn't let devices see each other. If the creator already scanned this code, tap Start over on both.");
        $('btPertoDeNovo').hidden = false;
      }, ESPERA_DICA);
    }, function (e) { if (s.leitor) { s.leitor.parar(); s.leitor = null; } erroPerto(s, e); });
    return true;
  }
  function avisoCodigo(cod) {
    if (perto) perto.avisou = true;          // a câmera terminando de abrir não apaga este aviso
    $('pertoLerStatus').textContent = cod === 'versao' ? t('⚠️ Esse código é de outra versão da Batalha Naval. Abram o jogo com internet nos dois aparelhos para atualizar e tentem de novo.', '⚠️ That code is from another version of Sea Battle. Open the game with internet on both devices to update, then try again.')
      : cod === 'resposta' ? t('⚠️ Esse é o código de resposta. Leia o código que aparece no aparelho de quem criou a partida.', "⚠️ That's an answer code. Scan the code on the device of whoever created the game.")
      : cod === 'oferta' ? t('⚠️ Esse é o código de criar partida. Leia o código que o OUTRO aparelho mostra depois de ler o seu.', "⚠️ That's a create-game code. Scan the code the OTHER device shows after scanning yours.")
      : t('⚠️ Esse não é um código da Batalha Naval. Aponte para o quadrado preto e branco na tela do outro aparelho.', "⚠️ That's not a Sea Battle code. Point at the black and white square on the other device.");
  }
  function erroPerto(s, e) {
    if (perto !== s) return;
    perto = null; limparPerto(s);
    var semRede = e && e.codigo === 'semrede';
    abrirJanela({ titulo: semRede ? t('📶 Este aparelho não está em nenhum Wi-Fi', '📶 This device is not on any Wi-Fi') : t('😕 Não deu para preparar a ligação', "😕 Couldn't prepare the link"),
      texto: semRede ? t('Ligue o Roteador Wi-Fi (Ponto de acesso) neste celular, ou conecte no Wi-Fi do outro, e tente de novo.', "Turn on this phone's Wi-Fi hotspot, or join the other one's Wi-Fi, and try again.")
        : e && e.codigo === 'lixo' ? t('O código lido não funcionou. Tentem de novo do começo.', "The scanned code didn't work. Try again from the start.") : t('Tente de novo. Se continuar, feche e abra o jogo de novo.', 'Try again. If it keeps happening, close and reopen the game.'),
      botoes: [{ t: t('🔄 Tentar de novo', '🔄 Try again'), fn: function () { if (s.papel === 'criar') pertoCriar(s.nivel, s.g); else pertoEntrar(s.g); } },
        { t: t('Voltar', 'Back'), fn: function () { perto = s; cancelarPerto(); } }] });
  }
  // não abriu a tempo (ou falhou): dizer o que costuma ser e deixar tentar de novo
  function falhouPerto(s) {
    if (perto !== s || s.conectou) return;
    perto = null; limparPerto(s);
    abrirJanela({ titulo: t('📡 Os aparelhos não se acharam', "📡 The devices couldn't find each other"),
      texto: t('O que costuma ser: 1) os dois não estão no MESMO Wi-Fi — o outro precisa estar conectado no Roteador Wi-Fi deste celular (ou os dois no mesmo Wi-Fi); 2) Wi-Fi de avião, hotel, loja ou escola costuma não deixar um aparelho ver o outro — use o Roteador de um dos celulares; 3) o código lido era de uma tentativa anterior. Toque em Tentar de novo nos dois aparelhos.',
        'Usually: 1) the two are not on the SAME Wi-Fi — the other one must be joined to this phone\'s hotspot (or both on the same Wi-Fi); 2) plane, hotel, shop or school Wi-Fi often stops devices from seeing each other — use one phone\'s hotspot; 3) the scanned code was from an earlier try. Tap Try again on both devices.'),
      botoes: [{ t: t('🔄 Tentar de novo', '🔄 Try again'), fn: function () { if (s.papel === 'criar') pertoCriar(s.nivel, s.g); else pertoEntrar(s.g); } },
        { t: t('Voltar', 'Back'), fn: function () { perto = s; cancelarPerto(); } }] });
  }
  function conectou(s, cx) {
    if (perto !== s) { cx.fechar(); return; }
    s.conectou = true; perto = null; limparPerto(s);
    fecharJanela(); Som.efeito('comecou'); vibrar([40, 40, 40]);
    var g = s.g;
    if (g && jogo === g) {                 // reconectou: a mesma partida continua de onde parou
      g.religando = false;
      g.conexao = cx;
      abrirCanal(g).then(function () { g.p.entrar(); manterTelaAcesa(true); mostrar(g.p.estado().fase === 'sala' ? 'sala' : 'jogo'); desenhar(); aviso(t('📶 Ligados de novo!', '📶 Linked again!')); });
      return;
    }
    conectar({ id: R.idNovo(), nome: pref.nome, codigo: 'PERTO', host: s.papel === 'criar', nivel: s.nivel, conexao: cx, papelPerto: s.papel });
  }
  // a conexão direta caiu no meio: mostrar e oferecer reconectar (precisa trocar os códigos de novo)
  function caiuPerto(g, deNovo) {
    if (jogo !== g) return;
    if (!deNovo) { g.conectado = false; var velho = g.canal; g.canal = null; if (velho) velho.fechar(); desenhar(); }
    if (g.p.estado().fase === 'fim' || g.p.estado().saiu) return;
    var criei = g.papelPerto === 'criar';
    abrirJanela({ titulo: t('📡 A ligação com o outro aparelho caiu', '📡 The link to the other device dropped'),
      texto: (criei ? t('Para continuar de onde parou, toque em Ligar de novo e mostre o código novo; no outro aparelho, tocar em Ligar de novo e ler o código.', 'To go on where you stopped, tap Link again and show the new code; on the other device, tap Link again and scan it.')
        : t('Para continuar de onde parou, toque em Ligar de novo e leia o código novo que vai aparecer no aparelho de quem criou a partida (lá também tocam em Ligar de novo).', "To go on where you stopped, tap Link again and scan the new code that will show on the creator's device (they tap Link again too)."))
        + ' ' + t('Os dois precisam continuar no mesmo Wi-Fi.', 'Both need to stay on the same Wi-Fi.'),
      botoes: [{ t: t('🔁 Ligar de novo', '🔁 Link again'), fn: function () { if (jogo !== g) return; if (criei) pertoCriar(g.p.estado().nivel, g); else pertoEntrar(g); } },
        { t: t('🚪 Sair da partida', '🚪 Leave game'), fn: function () { sairDoJogo(); mostrar('inicio'); } }] });
  }

  // ---------- instalar e service worker ----------
  var pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); pedidoInstalar = e; $('btInstalar').hidden = false; });
  $('btInstalar').addEventListener('click', function () { if (!pedidoInstalar) return; pedidoInstalar.prompt(); pedidoInstalar.userChoice.then(function () { pedidoInstalar = null; $('btInstalar').hidden = true; }); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });

  // ---------- começar ----------
  traduzir(); aplicarSom();
  if (window.Trilha) Trilha.iniciar({ jogo: 'batalha-naval', musicas: MUSICAS, creditos: 'CREDITOS.md' });
  (function () {
    var m = /[?&]sala=([A-Za-z]{4})\b/.exec(location.search);
    if (m) {
      var c = m[1].toUpperCase(), d = salvoRede(true) || salvoRede();
      if (d && d.codigo === c) { conectar({ dados: d }); return; }     // recarregou a página: volta para a mesma partida
      enderecoSala(null); abrirAmigos(c); return;                       // link de convite: só falta o nome
    }
  })();

  // para os testes (e para quem quiser olhar no console)
  window.BNApp = { versao: APP_VERSION, jogo: function () { return jogo; }, dados: function () { return jogo ? dados() : null; }, MUSICAS: MUSICAS, alvo: function () { return alvoSel; },
    // Jogar pertinho: o mesmo caminho da câmera quando ela lê um código; e o que está na tela agora
    lerCodigo: function (txt) { return lerCodigo(txt); }, perto: function () { return perto ? { papel: perto.papel, codigo: perto.codigo || null, qr: perto.qr || null, etapa: perto.etapa } : null; } };
})();

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer jogar não baixa nada a mais. */
(function () {
  if (!/[?&]instalar\b/.test(location.search) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.src = '../instalar.js';
  s.setAttribute('data-nome', 'Batalha Naval'); s.setAttribute('data-icone', 'icone-192.png');
  s.setAttribute('data-so-com', 'instalar'); s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
  document.body.appendChild(s);
})();
