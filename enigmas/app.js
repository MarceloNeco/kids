/* Enigmatic — telas, lousa, risco de giz, toque e arraste, sons, voz, estrelas e progresso.
   As regras ficam no jogo.js (Enigmas) e as rodadas no rodadas.js (EnigmasRodadas).
   Guarda só neste aparelho (localStorage, sempre com try/catch): preferências em "bolinho:enigmas:pref" e o
   progresso de cada nível em "bolinho:enigmas:progresso". Nada vai para a internet. */
(function () {
  'use strict';
  var APP_VERSION = '0.3.4';
  var $ = function (id) { return document.getElementById(id); };
  var J = window.Enigmas, R = window.EnigmasRodadas;
  var CALMO = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var TESTE = /[?&]teste\b/.test(location.search);
  var SVGNS = 'http://www.w3.org/2000/svg';

  function ler(k, padrao) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem espaço ou modo privado: segue sem lembrar */ } }
  var CH_PREF = 'bolinho:enigmas:pref', CH_PROG = 'bolinho:enigmas:progresso';
  var pref = ler(CH_PREF, null) || {};
  // idioma: o escolhido na estante (../idioma.js: português, inglês ou espanhol); o jogo não guarda mais o seu
  var lingua = window.BolinhoIdioma ? BolinhoIdioma.atual() : 'pt';
  delete pref.lingua;
  if (typeof pref.efeitos !== 'boolean') pref.efeitos = true;
  if (typeof pref.voz !== 'boolean') pref.voz = true;
  if (typeof pref.palavras !== 'boolean') pref.palavras = true;   // 🔤 desligado = só os desenhos
  function salvarPref() { gravar(CH_PREF, pref); }
  var prog = ler(CH_PROG, null) || {};
  R.NIVEIS.forEach(function (n) {
    var p = prog[n] = prog[n] || {};
    if (!Array.isArray(p.feitas)) p.feitas = [];
    if (typeof p.estrelas !== 'number') p.estrelas = 0;
    if (typeof p.rodadas !== 'number') p.rodadas = 0;
  });
  function salvarProg() { gravar(CH_PROG, prog); }
  if (J.migrar(prog, R)) salvarProg();   // v0.3.0: o Difícil antigo foi para o Médio (as estrelas vão junto)

  // ---------- idioma ----------
  function t(pt, en, es) { return lingua === 'en' ? en : lingua === 'es' && es != null ? es : pt; }
  function w(it) { return t(it.pt, it.en, it.es); }
  var NOME_NIVEL = { facil: ['Fácil', 'Easy', 'Fácil'], medio: ['Médio', 'Medium', 'Medio'], dificil: ['Difícil', 'Hard', 'Difícil'] };
  function traduzir() {
    document.documentElement.lang = lingua === 'en' ? 'en' : lingua === 'es' ? 'es' : 'pt-BR';
    Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (el) {
      var p = el.getAttribute('data-t').split('|'); el.textContent = t(p[0], p[1], p[2]);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-rotulo]'), function (el) {
      var p = el.getAttribute('data-rotulo').split('|'); el.setAttribute('aria-label', t(p[0], p[1], p[2]));
    });
    pintarPrefs(); pintarProgresso();
    if (partida) { montarCartas(); pintarTopo(); }
  }

  function pintarPrefs() {
    $('btEfeitos').textContent = pref.efeitos ? '🔔' : '🔕';
    $('btEfeitos').setAttribute('aria-pressed', String(pref.efeitos));
    $('btEfeitos').setAttribute('aria-label', pref.efeitos ? t('Sons ligados', 'Sounds on', 'Sonidos activados') : t('Sons desligados', 'Sounds off', 'Sonidos desactivados'));
    $('btVoz').setAttribute('aria-pressed', String(pref.voz));
    $('btVoz').classList.toggle('desligado', !pref.voz);
    $('btVoz').setAttribute('aria-label', pref.voz ? t('Voz ligada: lê as palavras', 'Voice on: reads the words', 'Voz activada: lee las palabras') : t('Voz desligada', 'Voice off', 'Voz desactivada'));
    $('btPalavras').setAttribute('aria-pressed', String(pref.palavras));
    $('btPalavras').classList.toggle('desligado', !pref.palavras);
    $('btPalavras').setAttribute('aria-label', t('Mostrar palavras', 'Show words', 'Mostrar palabras'));
    $('btPalavras').title = t('Mostrar palavras', 'Show words', 'Mostrar palabras');
    $('lousa').classList.toggle('so-desenhos', !pref.palavras);
  }

  function listaNivel(n) { return J.lista(R, n, lingua); }
  function feitasNoCiclo(n) { var ids = listaNivel(n).map(function (r) { return r.id; }); return prog[n].feitas.filter(function (id) { return ids.indexOf(id) >= 0; }).length; }
  function pintarProgresso() {
    R.NIVEIS.forEach(function (n) {
      var el = $('prog' + n.charAt(0).toUpperCase() + n.slice(1));
      el.textContent = '⭐ ' + prog[n].estrelas + ' · ' + feitasNoCiclo(n) + '/' + listaNivel(n).length;
      el.setAttribute('aria-label', t(prog[n].estrelas + ' estrelas, ' + feitasNoCiclo(n) + ' de ' + listaNivel(n).length + ' enigmas',
        prog[n].estrelas + ' stars, ' + feitasNoCiclo(n) + ' of ' + listaNivel(n).length + ' puzzles',
        prog[n].estrelas + ' estrellas, ' + feitasNoCiclo(n) + ' de ' + listaNivel(n).length + ' enigmas'));
    });
  }

  // ---------- sons (feitos aqui, no WebAudio) ----------
  var ctx = null;
  function audio() {
    if (!pref.efeitos) return null;
    try {
      if (!ctx) { var A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { return null; }
    return ctx;
  }
  function nota(f, ini, dur, tipo, vol) {
    var c = audio(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + ini;
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t0);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  var Som = {
    certo: function () { nota(660, 0, 0.18, 'triangle'); nota(990, 0.1, 0.3, 'triangle'); },
    errado: function () { nota(330, 0, 0.16, 'sine', 0.1); nota(262, 0.12, 0.22, 'sine', 0.1); },
    escolher: function () { nota(520, 0, 0.08, 'sine', 0.06); },
    vitoria: function () { [523, 659, 784, 1047, 784, 1047].forEach(function (f, i) { nota(f, i * 0.11, 0.25, 'triangle', 0.16); }); }
  };

  // ---------- voz: lê a palavra tocada (ajuda quem ainda não lê), no idioma escolhido na estante ----------
  function vozDoIdioma(lang) {
    var vs = []; try { vs = speechSynthesis.getVoices() || []; } catch (e) { /* sem lista de vozes */ }
    var norm = function (l) { return String(l || '').replace('_', '-').toLowerCase(); }, quer = norm(lang), base = quer.slice(0, 2);
    var lista = vs.filter(function (v) { return norm(v.lang).indexOf(base) === 0; });
    lista.sort(function (a, b) { return (norm(b.lang) === quer) - (norm(a.lang) === quer); });
    return lista[0] || null;
  }
  function falar(txt) {
    if (!pref.voz || !txt || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(txt);
      u.lang = window.BolinhoIdioma ? BolinhoIdioma.voz() : 'pt-BR'; u.rate = 0.95;
      var v = vozDoIdioma(u.lang); if (v) u.voice = v;   // nunca uma voz de outro idioma lendo a palavra
      u.onstart = function () { if (window.Trilha) Trilha.volume(0.35); };
      u.onend = u.onerror = function () { if (window.Trilha) Trilha.volume(null); };
      speechSynthesis.speak(u);
    } catch (e) { /* sem voz neste aparelho */ }
  }

  // ---------- telas ----------
  var naPilha = false;
  function mostrar(id) {
    Array.prototype.forEach.call(document.querySelectorAll('.tela'), function (s) { s.classList.toggle('ativa', s.id === id); });
    document.documentElement.classList.toggle('jogando', id === 'jogo');
  }
  function voltarInicio() {
    fecharFesta(); partida = null; sel = null; limparArraste(); esconderBalao();
    try { speechSynthesis.cancel(); } catch (e) { /* ok */ }
    mostrar('inicio'); pintarProgresso();
    var b = $('bt' + (nivel ? nivel.charAt(0).toUpperCase() + nivel.slice(1) : 'Facil')); if (b) b.focus();
  }
  window.addEventListener('popstate', function () { naPilha = false; if ($('jogo').classList.contains('ativa')) voltarInicio(); });
  function sair() { if (naPilha) { history.back(); } else voltarInicio(); }
  // navegação padrão (../navegacao.js): 🏠 Início = voltar aos níveis (o mesmo do Voltar do celular), 🚪 Saída
  if (window.BolinhoNav) BolinhoNav.iniciar({ jogo: 'enigmas', noInicio: function () { return !$('jogo').classList.contains('ativa'); }, irParaInicio: sair,
    emAndamento: function () { return !!partida && $('jogo').classList.contains('ativa'); } });

  function telaCheia() {
    var d = document, el = d.documentElement;
    if (!(window.matchMedia && matchMedia('(pointer: coarse)').matches)) return;
    try { if (!(d.fullscreenElement || d.webkitFullscreenElement)) { var p = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : (el.webkitRequestFullscreen && el.webkitRequestFullscreen()); if (p && p.catch) p.catch(function () {}); } } catch (e) { /* sem tela cheia */ }
  }

  // ---------- partida ----------
  var nivel = null, partida = null, rodada = null, sel = null, reiniciou = false;
  // uma cor de giz por par, bem diferentes entre si (v0.3.0: as de antes eram claras e parecidas demais)
  var CORES = ['#ffec70', '#ff9fd2', '#8fd0ff', '#9ef08a', '#ffad66', '#c9a6ff', '#f4f1e6'];

  function comecar(n) {
    nivel = n; telaCheia();
    if (!naPilha) { try { history.pushState({ enigmas: 1 }, ''); naPilha = true; } catch (e) { /* sem histórico */ } }
    mostrar('jogo'); novaRodada();
  }

  function novaRodada() {
    fecharFesta(); sel = null; limparArraste(); esconderBalao();
    var lista = listaNivel(nivel), r = J.escolher(lista, prog[nivel].feitas);
    reiniciou = r.reiniciou;
    if (reiniciou) { var ids = lista.map(function (x) { return x.id; }); prog[nivel].feitas = prog[nivel].feitas.filter(function (id) { return ids.indexOf(id) < 0; }); salvarProg(); }
    rodada = r.rodada; partida = J.Partida(rodada);
    montarCartas(); pintarTopo();
    $('status').textContent = '';
    falar(t(rodada.dica.pt, rodada.dica.en, rodada.dica.es));
    var primeira = $('colEsq').querySelector('.carta'); if (primeira && !('ontouchstart' in window)) primeira.focus({ preventScroll: true });
  }

  function pintarTopo() {
    $('nomeNivel').textContent = t(NOME_NIVEL[nivel][0], NOME_NIVEL[nivel][1], NOME_NIVEL[nivel][2]);
    var total = listaNivel(nivel).length;
    $('contador').textContent = t('Enigma ', 'Puzzle ', 'Enigma ') + Math.min(feitasNoCiclo(nivel) + 1, total) + t(' de ', ' of ', ' de ') + total;
    $('estrelasTopo').textContent = '⭐ ' + prog[nivel].estrelas;
    $('pista').textContent = t(rodada.dica.pt, rodada.dica.en, rodada.dica.es);
  }

  function carta(lado, i) {
    var it = rodada.pares[i][lado === 'e' ? 0 : 1], b = document.createElement('button');
    b.type = 'button'; b.className = 'carta'; b.setAttribute('data-lado', lado); b.setAttribute('data-par', i);
    b.setAttribute('aria-label', w(it));
    if (it.e) {
      var em = document.createElement('span'); em.className = 'emo'; em.setAttribute('aria-hidden', 'true'); em.textContent = it.e;
      b.appendChild(em);
    } else b.classList.add('texto');
    // cada palavra num <span> que não quebra: a linha só pula nos espaços, nunca no meio da palavra
    var pl = document.createElement('span'); pl.className = 'pal';
    w(it).split(' ').forEach(function (p, k) {
      if (k) pl.appendChild(document.createTextNode(' '));
      var s = document.createElement('span'); s.className = 'w'; s.textContent = p; pl.appendChild(s);
    });
    b.appendChild(pl);
    if (partida.ligado(lado, i)) { b.classList.add('ligada'); b.disabled = true; }
    return b;
  }
  function montarCartas() {
    var ce = $('colEsq'), cd = $('colDir');
    ce.innerHTML = ''; cd.innerHTML = '';
    partida.esquerda.forEach(function (i) { ce.appendChild(carta('e', i)); });
    partida.direita.forEach(function (i) { cd.appendChild(carta('d', i)); });
    sel = null;
    ajustarTudo();
    requestAnimationFrame(redesenhar);
  }

  // ---------- tamanho do desenho e das letras, carta por carta ----------
  // O desenho fica grande (cabe na largura e em ~metade da altura); as letras começam grandes e diminuem até tudo
  // caber dentro da carta, até LETRA_MIN. Se nem assim couber, o desenho encolhe um pouco e mede de novo.
  var LETRA_MIN = 12;
  function px(v) { return parseFloat(v) || 0; }
  function ajustarCarta(b) {
    var cs = getComputedStyle(b), em = b.querySelector('.emo'), pl = b.querySelector('.pal');
    var W = b.clientWidth - px(cs.paddingLeft) - px(cs.paddingRight), H = b.clientHeight - px(cs.paddingTop) - px(cs.paddingBottom);
    if (W <= 0 || H <= 0) return;
    var deitada = cs.flexDirection === 'row', comPal = getComputedStyle(pl).display !== 'none', palavras = pl.querySelectorAll('.w');
    function dentro() {
      var r = b.getBoundingClientRect(), c = { l: r.left + b.clientLeft + px(cs.paddingLeft) - 0.5, t: r.top + b.clientTop + px(cs.paddingTop) - 0.5 };
      c.r = c.l + W + 1; c.b = c.t + H + 1;
      var els = [em, comPal ? pl : null].concat(comPal ? Array.prototype.slice.call(palavras) : []);
      return els.every(function (x) { if (!x) return true; var q = x.getBoundingClientRect(); return q.left >= c.l && q.right <= c.r && q.top >= c.t && q.bottom <= c.b; });
    }
    var emo = 0;
    if (em) {
      em.style.fontSize = '40px';
      var porLargura = 40 * W / (em.getBoundingClientRect().width || 40) * (deitada && comPal ? 0.45 : 0.95);
      emo = Math.min(porLargura, comPal ? (deitada ? H * 0.8 : H * 0.55) : H * 0.85, comPal ? 64 : 88);
    }
    if (!comPal) { em.style.fontSize = Math.floor(emo) + 'px'; return; }
    var maxL = Math.floor(Math.max(LETRA_MIN, Math.min(em ? 24 : 22, deitada ? H * 0.5 : (em ? H * 0.3 : H * 0.4))));
    for (;;) {
      if (em) em.style.fontSize = Math.floor(emo) + 'px';
      var lo = LETRA_MIN, hi = maxL;   // maior tamanho de letra que cabe (busca binária)
      pl.style.fontSize = hi + 'px';
      if (!dentro()) {
        while (hi - lo > 1) { var m = (lo + hi) >> 1; pl.style.fontSize = m + 'px'; if (dentro()) lo = m; else hi = m; }
        pl.style.fontSize = lo + 'px';
      }
      if (!em || emo <= 18 || dentro()) return;
      emo = Math.max(18, emo * 0.85);
    }
  }
  function ajustarTudo() {
    if (!partida || !$('jogo').classList.contains('ativa')) return;
    Array.prototype.forEach.call(document.querySelectorAll('#lousa .carta'), ajustarCarta);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ajustarTudo(); redesenhar(); });

  // ---------- balão com a palavra (🔤 desligado: só desenhos; ao tocar, a palavra aparece por 2 s) ----------
  var balaoT = 0;
  function esconderBalao() { clearTimeout(balaoT); $('balao').hidden = true; }
  function mostrarBalao(b) {
    if (pref.palavras || !b || b.classList.contains('texto')) return;
    var el = $('balao'); el.textContent = b.getAttribute('aria-label'); el.hidden = false;
    var r = b.getBoundingClientRect(), bw = el.offsetWidth, bh = el.offsetHeight;
    var y = r.top - bh - 6; if (y < 4) y = r.bottom + 6;
    el.style.left = Math.max(4, Math.min(innerWidth - bw - 4, r.left + r.width / 2 - bw / 2)) + 'px';
    el.style.top = Math.max(4, Math.min(innerHeight - bh - 4, y)) + 'px';
    clearTimeout(balaoT); balaoT = setTimeout(function () { el.hidden = true; }, 2000);
  }

  // ---------- giz ----------
  // Cada ligação é uma curva suave (bezier cúbica) que sai de cada carta na horizontal, como um S deitado, para dar
  // para seguir cada risco com o olho mesmo com quase tudo ligado (v0.3.0; antes era quase reta e grossa e virava um
  // emaranhado). Três cuidados: (1) cada par tem a sua "faixa": o ponto onde o S vira muda de par para par, então as
  // curvas não passam todas pelo mesmo lugar e os cruzamentos se espalham; (2) embaixo de cada traço vai um contorno
  // escuro da cor da lousa ("halo"), então onde duas se cruzam a de cima abre um vãozinho na de baixo e dá para ver
  // qual passa por cima; (3) um balanço bem lento e pequeno (desligado com "reduzir movimento").
  var svg = $('giz'), riscos = {}, faixa = {}, fase = {};
  var BALANCO_PX = 2.5, BALANCO_VEL = 2 * Math.PI / 6.5;   // 2,5 px para cada lado, uma ida e volta a cada 6,5 s
  // ponta do risco: logo depois da bolinha de giz da carta (a bolinha fica à vista), medida a partir do próprio SVG
  // (ele fica dentro da moldura da lousa; medir pela lousa deslocava o risco a largura da moldura)
  var FORA = 8;
  function ponto(el) {
    var L = svg.getBoundingClientRect(), r = el.getBoundingClientRect(), esq = el.getAttribute('data-lado') === 'e';
    return { x: (esq ? r.right + FORA : r.left - FORA) - L.left, y: r.top + r.height / 2 - L.top };
  }
  // a = ponta da esquerda, b = ponta da direita; f (0 a 1) = faixa do par; onda = deslocamento do balanço em px
  function caminho(a, b, f, onda) {
    // k1 + k2 = dx: a curva nunca volta para trás nem invade as cartas; o meio dela cai entre 25% e 75% do vão
    var dx = Math.max(24, Math.abs(b.x - a.x)), k1 = dx * (0.15 + 0.7 * f), k2 = dx - k1, o = onda || 0;
    var n = function (v) { return v.toFixed(1); };
    return 'M' + n(a.x) + ' ' + n(a.y) + ' C' + n(a.x + k1) + ' ' + n(a.y + o) + ' ' + n(b.x - k2) + ' ' + n(b.y - o) + ' ' + n(b.x) + ' ' + n(b.y);
  }
  // Faixa de cada par (0 = o trecho do meio da curva corre perto da coluna da esquerda, 1 = perto da direita), uma
  // diferente para cada par da rodada. Ordem que não cria cruzamento a mais: os riscos que descem ficam nas faixas da
  // esquerda e, entre eles, quem sai mais alto fica mais à direita; os que sobem ficam nas faixas da direita e, entre
  // eles, quem sai mais baixo fica mais à direita. Assim dois riscos "paralelos" nunca correm colados um no outro.
  function faixaDe(par) {
    var n = partida.n; if (n < 2) return 0.5;
    function chave(p) { var i = partida.esquerda.indexOf(p), j = partida.direita.indexOf(p); return j > i ? -i : n + i; }
    var ordem = partida.esquerda.slice().sort(function (x, y) { return chave(x) - chave(y); });
    return ordem.indexOf(+par) / (n - 1);
  }
  function ondaDe(i, agora) { return CALMO ? 0 : Math.sin(fase[i] + agora / 1000 * BALANCO_VEL) * BALANCO_PX; }
  function novoRisco(classe, cor) {
    var g = document.createElementNS(SVGNS, 'g'); g.setAttribute('class', 'risco ' + classe);
    ['halo', 'po', 'traco'].forEach(function (c) {
      var p = document.createElementNS(SVGNS, 'path'); p.setAttribute('class', c);
      if (cor && c !== 'halo') p.style.stroke = cor;
      g.appendChild(p);
    });
    svg.appendChild(g);
    return g;
  }
  function riscar(g, d) { Array.prototype.forEach.call(g.querySelectorAll('path'), function (p) { p.setAttribute('d', d); }); }
  function cartaDe(lado, i) { return document.querySelector('.carta[data-lado="' + lado + '"][data-par="' + i + '"]'); }
  function redesenhar(agora) {
    if (!partida) return;
    if (typeof agora !== 'number') agora = window.performance ? performance.now() : Date.now();
    var L = svg.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + L.width + ' ' + L.height);
    Object.keys(riscos).forEach(function (i) {
      var a = cartaDe('e', i), b = cartaDe('d', i);
      if (a && b) riscar(riscos[i], caminho(ponto(a), ponto(b), faixa[i], ondaDe(i, agora)));
    });
  }
  // balanço: redesenha umas 20 vezes por segundo enquanto há risco na lousa; para sozinho fora do jogo
  var balancoId = 0, balancoUlt = 0;
  function balancar(agora) {
    balancoId = 0;
    if (CALMO || !partida || !Object.keys(riscos).length || !$('jogo').classList.contains('ativa')) return;
    if (agora - balancoUlt >= 50) { balancoUlt = agora; redesenhar(agora); }
    balancoId = requestAnimationFrame(balancar);
  }
  function ligarBalanco() { if (!CALMO && !balancoId) balancoId = requestAnimationFrame(balancar); }
  function limparRiscos() { Object.keys(riscos).forEach(function (k) { riscos[k].remove(); }); riscos = {}; faixa = {}; fase = {}; }
  function remedir() { ajustarTudo(); redesenhar(); }
  if (window.ResizeObserver) new ResizeObserver(remedir).observe($('lousa'));
  window.addEventListener('resize', remedir);

  // ---------- ligar ----------
  function escolher(b) {
    if (sel) sel.classList.remove('escolhida'), sel.setAttribute('aria-pressed', 'false');
    sel = b;
    if (b) {
      b.classList.add('escolhida'); b.setAttribute('aria-pressed', 'true'); Som.escolher();
      falar(b.getAttribute('aria-label')); mostrarBalao(b);
      $('status').textContent = t(b.getAttribute('aria-label') + ' escolhido. Agora toque no outro lado.', b.getAttribute('aria-label') + ' picked. Now tap the other side.', b.getAttribute('aria-label') + ' elegido. Ahora toca el otro lado.');
    }
  }
  function tentar(a, b, gTemp) {
    var esq = a.getAttribute('data-lado') === 'e' ? a : b, dir = esq === a ? b : a;
    var ie = +esq.getAttribute('data-par'), id = +dir.getAttribute('data-par');
    var res = partida.ligar(ie, id);
    escolher(null);
    var g = gTemp || novoRisco('', null), f = faixaDe(ie);
    if (res === 'certo' || res === 'fim') {
      g.setAttribute('class', 'risco certo' + (gTemp ? '' : ' desenhando'));
      Array.prototype.forEach.call(g.querySelectorAll('path'), function (p) { if (p.getAttribute('class') !== 'halo') p.style.stroke = CORES[ie % CORES.length]; if (!gTemp) p.setAttribute('pathLength', '1'); });
      riscos[ie] = g; faixa[ie] = f; fase[ie] = Math.random() * 2 * Math.PI;
      riscar(g, caminho(ponto(esq), ponto(dir), f, ondaDe(ie, window.performance ? performance.now() : Date.now())));
      ligarBalanco();
      [esq, dir].forEach(function (c) { c.classList.add('ligada', 'pulo'); c.disabled = true; });
      Som.certo();
      $('status').textContent = t('Isso! ' + w(rodada.pares[ie][0]) + ' com ' + w(rodada.pares[ie][1]) + '.', 'Yes! ' + w(rodada.pares[ie][0]) + ' with ' + w(rodada.pares[ie][1]) + '.', '¡Eso es! ' + w(rodada.pares[ie][0]) + ' con ' + w(rodada.pares[ie][1]) + '.');
      if (res === 'fim') setTimeout(terminar, CALMO ? 300 : 900);
      else { var prox = document.querySelector('.carta:not(:disabled)'); if (prox && document.activeElement && document.activeElement.disabled) prox.focus({ preventScroll: true }); }
    } else if (res === 'errado') {
      g.setAttribute('class', 'risco errado'); riscar(g, caminho(ponto(esq), ponto(dir), f, 0));
      [esq, dir].forEach(function (c) { c.classList.remove('treme'); void c.offsetWidth; c.classList.add('treme'); setTimeout(function () { c.classList.remove('treme'); }, 600); });
      Som.errado();
      setTimeout(function () { g.classList.add('apagando'); }, 350);
      setTimeout(function () { g.remove(); }, CALMO ? 400 : 1000);
      $('status').textContent = t('Ainda não. Tente outro!', 'Not yet. Try another one!', 'Todavía no. ¡Prueba con otro!');
    } else g.remove();
  }

  // toque (e teclado: Enter e espaço viram clique)
  var semClique = false;
  function aoTocar(e) {
    var b = e.target.closest && e.target.closest('.carta');
    if (!b || b.disabled || !partida) return;
    if (semClique) return;
    if (!sel) escolher(b);
    else if (sel === b) { escolher(null); $('status').textContent = ''; }
    else if (sel.getAttribute('data-lado') === b.getAttribute('data-lado')) escolher(b);
    else tentar(sel, b);
  }
  $('lousa').addEventListener('click', aoTocar);

  // arrastar com o dedo (ou o mouse) de um desenho até o outro
  var arr = null;
  function limparArraste() {
    if (arr && arr.g) arr.g.remove();
    if (arr && arr.mira) arr.mira.classList.remove('mira');
    arr = null;
  }
  function cartaNoPonto(x, y) {
    var el = document.elementFromPoint(x, y), b = el && el.closest ? el.closest('.carta') : null;
    return b && !b.disabled ? b : null;
  }
  $('lousa').addEventListener('pointerdown', function (e) {
    if (e.button > 0 || !partida) return;
    var b = e.target.closest && e.target.closest('.carta');
    if (!b || b.disabled) return;
    limparArraste(); mostrarBalao(b);
    arr = { de: b, x0: e.clientX, y0: e.clientY, ativo: false, id: e.pointerId, g: null, mira: null };
    try { b.releasePointerCapture && b.releasePointerCapture(e.pointerId); } catch (x) { /* ok */ }
  });
  document.addEventListener('pointermove', function (e) {
    if (!arr || e.pointerId !== arr.id) return;
    var dx = e.clientX - arr.x0, dy = e.clientY - arr.y0;
    if (!arr.ativo) {
      if (dx * dx + dy * dy < 144) return;
      arr.ativo = true; escolher(null); arr.de.classList.add('escolhida');
      falar(arr.de.getAttribute('aria-label'));
      arr.g = novoRisco('solto', CORES[+arr.de.getAttribute('data-par') % CORES.length]);
    }
    e.preventDefault();
    // o risco solto também é curva: sai da carta na horizontal e chega no dedo
    var L = svg.getBoundingClientRect(), dedo = { x: e.clientX - L.left, y: e.clientY - L.top }, de = ponto(arr.de);
    riscar(arr.g, arr.de.getAttribute('data-lado') === 'e' ? caminho(de, dedo, 0.5, 0) : caminho(dedo, de, 0.5, 0));
    var alvo = cartaNoPonto(e.clientX, e.clientY);
    if (alvo && alvo.getAttribute('data-lado') === arr.de.getAttribute('data-lado')) alvo = null;
    if (alvo !== arr.mira) { if (arr.mira) arr.mira.classList.remove('mira'); arr.mira = alvo; if (alvo) alvo.classList.add('mira'); }
  }, { passive: false });
  function soltar(e) {
    if (!arr || e.pointerId !== arr.id) return;
    var a = arr; arr = null;
    if (!a.ativo) return;   // foi só um toque: o clique cuida
    semClique = true; setTimeout(function () { semClique = false; }, 80);
    a.de.classList.remove('escolhida');
    if (a.mira) a.mira.classList.remove('mira');
    var alvo = e.type === 'pointerup' ? cartaNoPonto(e.clientX, e.clientY) : null;
    if (alvo && alvo.getAttribute('data-lado') !== a.de.getAttribute('data-lado')) tentar(a.de, alvo, a.g);
    else { a.g.classList.add('apagando'); setTimeout(function () { a.g.remove(); }, 400); }
  }
  document.addEventListener('pointerup', soltar);
  document.addEventListener('pointercancel', soltar);

  // setas do teclado e do controle da TV: sobe e desce na coluna, troca de lado com ← →
  $('lousa').addEventListener('keydown', function (e) {
    var b = e.target.closest && e.target.closest('.carta'); if (!b) return;
    var col = b.parentNode, cartas = Array.prototype.slice.call(col.querySelectorAll('.carta')), i = cartas.indexOf(b), alvo = null;
    function livre(lista, de, passo) { for (var k = de; k >= 0 && k < lista.length; k += passo) if (!lista[k].disabled) return lista[k]; return null; }
    if (e.key === 'ArrowDown') alvo = livre(cartas, i + 1, 1);
    else if (e.key === 'ArrowUp') alvo = livre(cartas, i - 1, -1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      var outra = Array.prototype.slice.call((col.id === 'colEsq' ? $('colDir') : $('colEsq')).querySelectorAll('.carta'));
      if ((e.key === 'ArrowRight') === (col.id === 'colEsq')) alvo = livre(outra, Math.min(i, outra.length - 1), 1) || livre(outra, Math.min(i, outra.length - 1), -1);
    }
    if (alvo) { e.preventDefault(); alvo.focus(); }
  });

  // 💡 mostra um par que falta (conta como um erro nas estrelas)
  $('btDica').addEventListener('click', function () {
    if (!partida || partida.completa()) return;
    for (var i = 0; i < partida.n; i++) if (!partida.ligado('e', i)) break;
    partida.erros++;
    [cartaDe('e', i), cartaDe('d', i)].forEach(function (c) { c.classList.remove('brilha'); void c.offsetWidth; c.classList.add('brilha'); setTimeout(function () { c.classList.remove('brilha'); }, 1600); });
    falar(w(rodada.pares[i][0]) + ', ' + w(rodada.pares[i][1]));
  });

  // ---------- fim da rodada: janela de festa (SolverJanela: Esc, Voltar e tocar fora = próximo enigma) ----------
  var TITULOS = [['Muito bem!', 'Well done!', '¡Muy bien!'], ['Que esperto!', 'So clever!', '¡Qué ingenio!'], ['Mandou bem!', 'Great job!', '¡Genial!'], ['Isso aí!', 'You did it!', '¡Lo has conseguido!'], ['Uau, acertou tudo!', 'Wow, all done!', '¡Hala, lo has acertado todo!']];
  var festa = null;
  function el(tag, classe, texto) { var n = document.createElement(tag); if (classe) n.className = classe; if (texto != null) n.textContent = texto; return n; }
  function terminar() {
    if (!partida || festa) return;
    var est = partida.estrelas();
    prog[nivel].estrelas += est; prog[nivel].rodadas++;
    if (prog[nivel].feitas.indexOf(rodada.id) < 0) prog[nivel].feitas.push(rodada.id);
    salvarProg(); pintarTopo();
    var tt = TITULOS[Math.floor(Math.random() * TITULOS.length)];
    var total = listaNivel(nivel).length, feitas = feitasNoCiclo(nivel);
    var txt = t('Você ganhou ' + est + (est > 1 ? ' estrelas!' : ' estrela!'), 'You earned ' + est + (est > 1 ? ' stars!' : ' star!'), '¡Has ganado ' + est + (est > 1 ? ' estrellas!' : ' estrella!'));
    if (feitas >= total) txt += ' ' + t('Você fez todos os ' + total + ' enigmas deste nível! Agora eles voltam misturados.', 'You solved all ' + total + ' puzzles on this level! Now they come back mixed up.', '¡Has resuelto los ' + total + ' enigmas de este nivel! Ahora vuelven mezclados.');
    else txt += ' ' + t('Faltam ' + (total - feitas) + ' enigmas neste nível.', (total - feitas) + ' puzzles left on this level.', (total - feitas === 1 ? 'Queda 1 enigma' : 'Quedan ' + (total - feitas) + ' enigmas') + ' en este nivel.');
    var caixa = el('div', 'festa-caixa'), h = el('h2', null, t(tt[0], tt[1], tt[2]));
    var ee = el('p', 'festa-estrelas', '⭐'.repeat(est) + '☆'.repeat(3 - est)); ee.setAttribute('aria-label', t(est + ' estrelas', est + ' stars', est + ' estrellas'));
    var bP = el('button', 'grande', t('Próximo enigma ▶', 'Next puzzle ▶', 'Siguiente enigma ▶')), bN = el('button', 'mini largo', t('🏠 Níveis', '🏠 Levels', '🏠 Niveles'));
    bP.type = bN.type = 'button'; bP.id = 'btProxima'; bN.id = 'btNiveis';
    var bts = el('div', 'festa-bts'); bts.appendChild(bP); bts.appendChild(bN);
    [h, ee, el('p', 'festa-texto', txt), bts].forEach(function (n) { caixa.appendChild(n); });
    var conf = el('div', 'confete'); conf.setAttribute('aria-hidden', 'true'); confete(conf);
    var tudo = el('div', 'festa-dentro'); tudo.appendChild(conf); tudo.appendChild(caixa);
    Som.vitoria(); falar(t(tt[0], tt[1], tt[2]));
    var abrir = window.SolverJanela ? SolverJanela.abrir : null;
    if (!abrir) { novaRodada(); return; }
    festa = abrir({ conteudo: tudo, classe: 'festa', focar: bP, aoFechar: function (motivo) {
      festa = null;
      if (motivo === 'niveis') SolverJanela.quandoQuieto(sair);
      else if (motivo !== 'sair') SolverJanela.quandoQuieto(novaRodada);
    } });
    bP.addEventListener('click', function () { if (festa) festa.fechar('proxima'); });
    bN.addEventListener('click', function () { if (festa) festa.fechar('niveis'); });
  }
  function fecharFesta() { if (festa) { var f = festa; festa = null; f.fechar('sair'); } limparRiscos(); }
  function confete(c) {
    if (CALMO) return;
    var E = ['⭐', '✨', '🎉', '🌟', '💛', '🎈'];
    for (var i = 0; i < 26; i++) {
      var s = document.createElement('span'); s.textContent = E[i % E.length];
      s.style.left = (Math.random() * 100) + '%'; s.style.animationDelay = (Math.random() * 0.8) + 's';
      s.style.animationDuration = (1.8 + Math.random() * 1.4) + 's'; s.style.fontSize = (1.2 + Math.random() * 1.4) + 'rem';
      c.appendChild(s);
    }
  }
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.key === 'GoBack' || e.keyCode === 461) && $('jogo').classList.contains('ativa')) { e.preventDefault(); sair(); }
  });

  // ---------- início ----------
  R.NIVEIS.forEach(function (n) { $('bt' + n.charAt(0).toUpperCase() + n.slice(1)).addEventListener('click', function () { comecar(n); }); });
  // trocaram o idioma na estante (noutra aba): traduz a tela (e, no jogo, as cartas)
  if (window.BolinhoIdioma) BolinhoIdioma.aoMudar(function (c) { lingua = c; traduzir(); });
  $('btEfeitos').addEventListener('click', function () { pref.efeitos = !pref.efeitos; salvarPref(); pintarPrefs(); if (pref.efeitos) Som.escolher(); });
  $('btPalavras').addEventListener('click', function () { pref.palavras = !pref.palavras; salvarPref(); pintarPrefs(); esconderBalao(); ajustarTudo(); redesenhar(); });
  $('btVoz').addEventListener('click', function () { pref.voz = !pref.voz; salvarPref(); pintarPrefs(); if (pref.voz) falar(t('Voz ligada', 'Voice on', 'Voz activada')); else { try { speechSynthesis.cancel(); } catch (e) { /* ok */ } } });
  $('btZerar').addEventListener('click', function () {
    if (!window.SolverJanela) return;
    var caixa = el('div', 'festa-caixa pergunta'), bS = el('button', 'grande perigo', t('Apagar', 'Erase', 'Borrar')), bC = el('button', 'mini largo', t('Cancelar', 'Cancel', 'Cancelar'));
    bS.type = bC.type = 'button';
    caixa.appendChild(el('h2', null, t('Começar do zero?', 'Start over?', '¿Empezar de cero?')));
    caixa.appendChild(el('p', 'festa-texto', t('Apaga as estrelas e o progresso dos três níveis neste aparelho.', 'Erases the stars and progress of all three levels on this device.', 'Borra las estrellas y el progreso de los tres niveles en este dispositivo.')));
    var bts = el('div', 'festa-bts'); bts.appendChild(bS); bts.appendChild(bC); caixa.appendChild(bts);
    var j = SolverJanela.abrir({ conteudo: caixa, classe: 'festa', papel: 'alertdialog', focar: bC, aoFechar: function (motivo) {
      if (motivo !== 'apagar') return;
      R.NIVEIS.forEach(function (n) { prog[n] = { feitas: [], estrelas: 0, rodadas: 0 }; }); salvarProg(); pintarProgresso();
    } });
    bS.addEventListener('click', function () { j.fechar('apagar'); });
    bC.addEventListener('click', function () { j.fechar('cancelar'); });
  });
  $('versao').textContent = APP_VERSION;

  // música de fundo (trilha comum do Bolinho de Chuva), mais baixinha: a criança está pensando
  var M = '../baguncolandia/musicas/', FREEPD = 'CC0 (FreePD)';
  if (window.Trilha) Trilha.iniciar({ jogo: 'enigmas', volume: 0.22, creditos: 'CREDITOS.md', musicas: [
    { a: M + 'happy-whistling-ukulele.mp3', t: 'Happy Whistling Ukulele', au: 'Rafael Krux', lic: FREEPD },
    { a: M + 'ukulele-song.mp3', t: 'Ukulele Song', au: 'Rafael Krux', lic: FREEPD },
    { a: M + 'llama-in-pajama.mp3', t: 'Llama in Pajama', au: 'Rafael Krux', lic: FREEPD },
    { a: M + 'silly-boy.mp3', t: 'Silly Boy', au: 'Rafael Krux', lic: FREEPD },
    { a: M + 'funshine.mp3', t: 'Funshine', au: 'Kevin MacLeod', lic: FREEPD },
    { a: M + 'city-sunshine.mp3', t: 'City Sunshine', au: 'Kevin MacLeod', lic: FREEPD },
    { a: M + 'my-giant-bunny-friend.mp3', t: 'My Giant Bunny Friend', au: 'Bryan Teoh', lic: FREEPD },
    { a: M + 'spring-chicken.mp3', t: 'Spring Chicken', au: 'Bryan Teoh', lic: FREEPD },
    { a: M + 'going-bananas.mp3', t: 'Going Bananas', au: 'Bryan Teoh', lic: FREEPD },
    { a: M + 'wakka-wakka.mp3', t: 'Wakka Wakka', au: 'Bryan Teoh', lic: FREEPD },
    { a: M + 'hippety-hop.mp3', t: 'Hippety Hop', au: 'Alexander Nakarada', lic: FREEPD }
  ] });

  // ---------- instalar e service worker ----------
  var pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); pedidoInstalar = e; $('btInstalar').hidden = false; });
  $('btInstalar').addEventListener('click', function () { if (!pedidoInstalar) return; pedidoInstalar.prompt(); pedidoInstalar.userChoice.then(function () { pedidoInstalar = null; $('btInstalar').hidden = true; }); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });

  traduzir();

  // para os testes automáticos (só com ?teste no endereço)
  if (TESTE) window.EnigmasDebug = {
    pronto: true, versao: APP_VERSION,
    estado: function () { return { tela: $('jogo').classList.contains('ativa') ? 'jogo' : 'inicio', nivel: nivel, id: rodada && rodada.id, n: partida && partida.n, acertos: partida && partida.acertos, erros: partida && partida.erros, festa: !!festa, riscos: svg.querySelectorAll('.risco').length }; },
    progresso: function () { return JSON.parse(JSON.stringify(prog)); },
    // abre uma rodada exata (para o teste conferir o desenho de TODAS as rodadas, não só a sorteada)
    ids: function (n) { return listaNivel(n).map(function (r) { return r.id; }); },
    abrir: function (n, id) {
      var r = listaNivel(n).filter(function (x) { return x.id === id; })[0]; if (!r) return false;
      nivel = n; mostrar('jogo'); fecharFesta(); sel = null; limparArraste();
      rodada = r; partida = J.Partida(rodada);
      montarCartas(); pintarTopo(); return true;
    }
  };
})();

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer jogar não baixa nada a mais. */
(function () {
  if (!/[?&]instalar\b/.test(location.search) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.src = '../instalar.js';
  s.setAttribute('data-nome', 'Enigmatic'); s.setAttribute('data-icone', 'icone-192.png');
  s.setAttribute('data-so-com', 'instalar'); s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
  document.body.appendChild(s);
})();
