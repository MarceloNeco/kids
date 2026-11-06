/* Campo Minado — a tela: níveis, tabuleiro, toques (abrir, bandeirinha, acorde), zoom, cronômetro, recordes,
   dica do Fácil (gramas seguras piscam depois de uns segundos parado), sons, fim de jogo e instalar. O jogo em si (minas, números, enchente, vitória) é do motor campo.js.
   Guarda só neste aparelho (localStorage "campo-minado.pref"): idioma, sons e o melhor tempo de cada nível. */
(function () {
  'use strict';
  var APP_VERSION = '0.2.2';
  var APP_DATA = '06/Nov/2026';
  var CM = window.CampoMinado;
  var $ = function (id) { return document.getElementById(id); };
  var CALMO = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var TESTE = /[?&]teste\b/.test(location.search);
  var TOQUE = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;

  function ler(k, padrao) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  var pref = ler('campo-minado.pref', null) || {};
  if (pref.lingua !== 'en' && pref.lingua !== 'pt') pref.lingua = (navigator.language || 'pt').slice(0, 2) === 'pt' ? 'pt' : 'en';
  if (window.BolinhoIdioma && !BolinhoIdioma.ingles()) pref.lingua = 'pt';   // só português sem o interruptor "ingles" (../idioma.js)
  if (typeof pref.efeitos !== 'boolean') pref.efeitos = true;
  if (!pref.recordes || typeof pref.recordes !== 'object') pref.recordes = {};
  function salvarPref() { gravar('campo-minado.pref', pref); }

  // ---------- idioma ----------
  function t(pt, en) { return pref.lingua === 'en' ? en : pt; }
  function traduzir() {
    document.documentElement.lang = pref.lingua === 'en' ? 'en' : 'pt-BR';
    Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (el) { var p = el.getAttribute('data-t').split('|'); el.textContent = pref.lingua === 'en' ? p[1] : p[0]; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-rotulo]'), function (el) { var p = el.getAttribute('data-rotulo').split('|'); var r = pref.lingua === 'en' ? p[1] : p[0]; el.setAttribute('aria-label', r); el.title = r; });
    $('btLingua').textContent = pref.lingua === 'en' ? 'PT' : 'EN';
    $('versao').textContent = t('Versão ', 'Version ') + APP_VERSION + ' · ' + (pref.lingua === 'en' ? 'Nov/06/2026' : APP_DATA) +
      t(' · Músicas: Kevin MacLeod (incompetech.com), CC BY', ' · Music: Kevin MacLeod (incompetech.com), CC BY');
    $('tabuleiro').setAttribute('aria-label', t('Jardim', 'Garden'));
    mostrarRecordes(); pintarModo();
    if (est) desenharTudo();
  }
  $('btLingua').addEventListener('click', function () { pref.lingua = pref.lingua === 'en' ? 'pt' : 'en'; salvarPref(); traduzir(); });
  $('btAjuda').addEventListener('click', function () {
    var aj = $('ajuda'); aj.hidden = !aj.hidden; this.setAttribute('aria-expanded', String(!aj.hidden));
    if (!aj.hidden) aj.scrollIntoView({ block: 'nearest', behavior: CALMO ? 'auto' : 'smooth' });
  });

  // ---------- sons (feitos na hora, sem arquivo) ----------
  var ctxAudio = null;
  function bip(freq, dur, tipo, quando, vol) {
    if (!pref.efeitos) return;
    try {
      if (!ctxAudio) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctxAudio = new AC(); }
      if (ctxAudio.state === 'suspended') ctxAudio.resume();
      var t0 = ctxAudio.currentTime + (quando || 0), o = ctxAudio.createOscillator(), g = ctxAudio.createGain();
      o.type = tipo || 'sine'; o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(ctxAudio.destination); o.start(t0); o.stop(t0 + dur + 0.02);
    } catch (e) { /* sem som */ }
  }
  var Som = {
    abrir: function (n) { bip(n > 8 ? 520 : 660, 0.09, 'triangle'); if (n > 8) { bip(780, 0.1, 'triangle', 0.07); bip(1040, 0.12, 'triangle', 0.14); } },
    bandeira: function (pos) { bip(pos ? 880 : 440, 0.07, 'square', 0, 0.07); },
    perdeu: function () { [392, 330, 262, 196].forEach(function (f, k) { bip(f, 0.2, 'sawtooth', k * 0.14, 0.08); }); },
    ganhou: function () { [523, 659, 784, 1047, 784, 1047].forEach(function (f, k) { bip(f, 0.18, 'triangle', k * 0.12, 0.16); }); }
  };
  function pintarEfeitos() { var b = $('btEfeitos'); b.textContent = pref.efeitos ? '🔊' : '🔈'; b.setAttribute('aria-pressed', String(pref.efeitos)); b.title = pref.efeitos ? t('Sons ligados', 'Sounds on') : t('Sons desligados', 'Sounds off'); }
  $('btEfeitos').addEventListener('click', function () { pref.efeitos = !pref.efeitos; salvarPref(); pintarEfeitos(); Som.bandeira(true); });

  // ---------- recordes ----------
  var REC_ID = { facil: 'recFacil', medio: 'recMedio', dificil: 'recDificil' };
  function relogio(s) { var m = Math.floor(s / 60), r = s % 60; return m ? m + ':' + (r < 10 ? '0' : '') + r : r + 's'; }
  function mostrarRecordes() {
    CM.ORDEM.forEach(function (n) { var r = pref.recordes[n]; $(REC_ID[n]).textContent = r ? t('🏆 Melhor tempo: ', '🏆 Best time: ') + relogio(r) : t('Ainda sem recorde', 'No best time yet'); });
  }

  // ---------- telas e o botão Voltar do celular ----------
  var atual = 'menu', dentro = false;
  function mostrar(id) {
    Array.prototype.forEach.call(document.querySelectorAll('.tela'), function (s) { s.classList.toggle('ativa', s.id === id); });
    atual = id; window.scrollTo(0, 0);
  }
  function irParaJogo() {
    if (!dentro) { dentro = true; try { history.pushState({ campo: 1 }, ''); } catch (e) { /* sem histórico */ } }
    mostrar('jogo');
  }
  function voltarAoMenu() { if (dentro) { try { history.back(); } catch (e) { aoVoltar(); } } else aoVoltar(); }
  function aoVoltar() { dentro = false; fecharFim(); pararRelogio(); apagarDica(); limparFesta(); mostrar('menu'); mostrarRecordes(); setTimeout(function () { var b = $(nivelBotao()); if (b) b.focus(); }, 30); }
  window.addEventListener('popstate', function () { if (dentro) aoVoltar(); });
  function nivelBotao() { return { facil: 'btFacil', medio: 'btMedio', dificil: 'btDificil' }[nivel]; }

  Array.prototype.forEach.call(document.querySelectorAll('.nivel'), function (b) {
    b.addEventListener('click', function () { nivel = b.getAttribute('data-nivel'); irParaJogo(); novoJogo(); telaCheia(); });
  });
  $('btVoltar').addEventListener('click', voltarAoMenu);
  $('btNovo').addEventListener('click', function () { novoJogo(); });
  $('btDeNovo').addEventListener('click', function () { novoJogo(); });
  $('btNiveis').addEventListener('click', voltarAoMenu);

  function telaCheia() {
    var d = document, el = d.documentElement, toque = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (!toque || TESTE) return;
    try { if (!(d.fullscreenElement || d.webkitFullscreenElement)) { var p = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : (el.webkitRequestFullscreen && el.webkitRequestFullscreen()); if (p && p.catch) p.catch(function () {}); } } catch (e) { /* sem tela cheia */ }
  }

  // ---------- o jogo ----------
  var nivel = 'facil', est = null, casas = [], rng = TESTE ? CM.semente(42) : Math.random;
  var modoBandeira = false, t0 = 0, seg = 0, cronometro = null, zoom = 1, base = 40, vao = 2;
  var tab = $('tabuleiro'), area = $('area');

  function novoJogo() {
    fecharFim(); limparFesta(); pararRelogio(); apagarDica(); seg = 0; $('tempo').textContent = '0';
    var r = area.getBoundingClientRect();
    est = CM.doNivel(nivel, r.width > r.height * 1.15);
    zoom = 1; modoBandeira = false; pintarModo();
    tab.className = 'tabuleiro'; tab.style.gridTemplateColumns = 'repeat(' + est.colunas + ', var(--cel))';
    tab.innerHTML = ''; casas = [];
    var frag = document.createDocumentFragment();
    for (var i = 0; i < est.cel.length; i++) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'casa'; b.setAttribute('data-i', i);
      if ((Math.floor(i / est.colunas) + i % est.colunas) % 2) b.classList.add('xadrez');
      b.tabIndex = i === 0 ? 0 : -1;
      frag.appendChild(b); casas.push(b);
    }
    tab.appendChild(frag);
    desenharTudo(); ajustar(); $('btNovo').textContent = '🙂';
    area.scrollTop = 0; area.scrollLeft = 0;
  }

  function rotulo(i) {
    var c = est.cel[i], l = Math.floor(i / est.colunas) + 1, co = i % est.colunas + 1, s;
    if (c.aberta && c.mina) s = t('ouriço acordado', 'awake hedgehog');
    else if (c.errada) s = t('bandeirinha errada', 'wrong flag');
    else if (c.bandeira) s = t('bandeirinha', 'flag');
    else if (est.fim === 'perdeu' && c.mina) s = t('ouriço dormindo', 'sleeping hedgehog');
    else if (c.aberta) s = c.n ? String(c.n) : t('vazia', 'empty');
    else s = t('grama', 'grass');
    return t('Linha ', 'Row ') + l + t(', coluna ', ', column ') + co + ': ' + s;
  }
  function desenhar(i) {
    var c = est.cel[i], b = casas[i];
    b.classList.toggle('aberta', c.aberta);
    b.classList.toggle('bandeira', c.bandeira && !c.errada);
    b.classList.toggle('errada', c.errada);
    b.classList.toggle('mina', c.mina && (c.aberta || est.fim === 'perdeu') && !c.bandeira);
    b.classList.toggle('estourou', est.explodiu === i);
    b.textContent = c.aberta && !c.mina && c.n ? String(c.n) : '';
    if (c.aberta && !c.mina && c.n) b.setAttribute('data-n', c.n); else b.removeAttribute('data-n');
    b.setAttribute('aria-label', rotulo(i));
  }
  function desenharTudo() { for (var i = 0; i < casas.length; i++) desenhar(i); $('restam').textContent = String(CM.restantes(est)); $('placaRestam').setAttribute('aria-label', t('Ouriços que faltam marcar: ', 'Hedgehogs left to flag: ') + CM.restantes(est)); }

  function iniciarRelogio() {
    if (cronometro) return;
    t0 = Date.now(); seg = 0;
    cronometro = setInterval(function () { seg = Math.floor((Date.now() - t0) / 1000); $('tempo').textContent = String(seg); }, 250);
  }
  function pararRelogio() {
    if (cronometro) { clearInterval(cronometro); cronometro = null; }
    if (t0 && est && est.fim) { seg = Math.max(1, Math.round((Date.now() - t0) / 1000)); $('tempo').textContent = String(seg); }
  }

  function resultado(r) {
    if (!est.plantado) return;
    iniciarRelogio();
    if (r.abertas.length) { r.abertas.forEach(desenhar); Som.abrir(r.abertas.length); }
    if (r.abertas.length > 1 && !CALMO) r.abertas.forEach(function (k, n) { var b = casas[k]; b.style.animationDelay = Math.min(n * 6, 400) + 'ms'; b.classList.add('brota'); });
    $('restam').textContent = String(CM.restantes(est));
    if (est.fim) terminar(); else armarDica();
  }
  function tocarCasa(i) {
    if (!est || est.fim) return;
    var c = est.cel[i];
    if (c.aberta) { resultado(CM.acorde(est, i)); return; }
    if (modoBandeira) { marcar(i); return; }
    if (c.bandeira) return;
    resultado(CM.abrir(est, i, rng));
  }
  function marcar(i) {
    if (!est || est.fim) return;
    var c = est.cel[i];
    if (c.aberta) { resultado(CM.acorde(est, i)); return; }
    if (CM.bandeira(est, i)) { desenhar(i); Som.bandeira(c.bandeira); try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) { /* sem vibrar */ } $('restam').textContent = String(CM.restantes(est)); armarDica(); }
  }

  function pintarModo() {
    var b = $('btModo'); b.setAttribute('aria-pressed', String(modoBandeira));
    document.documentElement.classList.toggle('modo-bandeira', modoBandeira);
    // texto inteiro e texto curto (celular estreito): o CSS mostra um dos dois, sempre numa linha só
    var txt = modoBandeira ? [t('🚩 Modo bandeirinha: cada toque põe ou tira uma bandeirinha.', '🚩 Flag mode: each tap puts or removes a flag.'), t('🚩 Cada toque põe ou tira 🚩', '🚩 Each tap adds or removes 🚩')]
      : TOQUE ? [t('👆 Toque para abrir · segure o dedo para pôr 🚩', '👆 Tap to open · hold your finger to place a 🚩'), t('👆 Toque abre · segure põe 🚩', '👆 Tap opens · hold for 🚩')]
        : [t('🖱 Clique para abrir · botão direito põe 🚩', '🖱 Click to open · right-click places a 🚩'), t('🖱 Clique abre · botão direito põe 🚩', '🖱 Click opens · right-click for 🚩')];
    var d = $('dicaModo'); d.textContent = '';
    ['dica-longa', 'dica-curta'].forEach(function (cl, k) { var s = document.createElement('span'); s.className = cl; s.textContent = txt[k]; d.appendChild(s); });
  }
  $('btModo').addEventListener('click', function () { modoBandeira = !modoBandeira; pintarModo(); Som.bandeira(modoBandeira); });

  // ---------- toques no tabuleiro: tocar abre, segurar marca, botão direito marca, dois dedos aproximam ----------
  var segurar = null, inicioToque = null, foiLongo = false, tipoPonteiro = '', pinca = null, fimPinca = 0;
  function casaDe(e) { var b = e.target && e.target.closest ? e.target.closest('.casa') : null; return b ? +b.getAttribute('data-i') : -1; }
  function cancelarSegurar() { if (segurar) { clearTimeout(segurar); segurar = null; } }
  tab.addEventListener('pointerdown', function (e) {
    foiLongo = false; tipoPonteiro = e.pointerType || 'mouse';
    if (e.button === 2) return;
    var i = casaDe(e); if (i < 0 || pinca) return;
    inicioToque = { x: e.clientX, y: e.clientY };
    cancelarSegurar();
    if (est && !est.fim && !est.cel[i].aberta) segurar = setTimeout(function () { segurar = null; foiLongo = true; casas[i].classList.add('segurou'); setTimeout(function () { casas[i].classList.remove('segurou'); }, 250); marcar(i); }, 420);
    if (est && !est.fim) $('btNovo').textContent = '😮';
  });
  tab.addEventListener('pointermove', function (e) { if (inicioToque && Math.abs(e.clientX - inicioToque.x) + Math.abs(e.clientY - inicioToque.y) > 12) { cancelarSegurar(); inicioToque = null; } });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (k) { tab.addEventListener(k, function () { cancelarSegurar(); inicioToque = null; if (est && !est.fim) $('btNovo').textContent = '🙂'; }); });
  tab.addEventListener('click', function (e) {
    var i = casaDe(e); if (i < 0) return;
    if (foiLongo) { foiLongo = false; return; }
    if (Date.now() - fimPinca < 350) return;
    tocarCasa(i);
  });
  tab.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    var i = casaDe(e); if (i < 0) return;
    if (tipoPonteiro === 'touch' || tipoPonteiro === 'pen') return;   // no toque quem marca é o "segurar"
    marcar(i);
  });
  area.addEventListener('touchstart', function (e) {
    if (e.touches.length === 2) { cancelarSegurar(); inicioToque = null; pinca = { d: distancia(e.touches), z: zoom, m: meio(e.touches) }; }
  }, { passive: true });
  area.addEventListener('touchmove', function (e) {
    if (!pinca || e.touches.length !== 2) return;
    e.preventDefault();
    aplicarZoom(pinca.z * distancia(e.touches) / pinca.d, pinca.m);
  }, { passive: false });
  area.addEventListener('touchend', function (e) { if (pinca && e.touches.length < 2) { pinca = null; fimPinca = Date.now(); } });
  function distancia(ts) { return Math.max(1, Math.hypot(ts[0].clientX - ts[1].clientX, ts[0].clientY - ts[1].clientY)); }
  function meio(ts) { return { x: (ts[0].clientX + ts[1].clientX) / 2, y: (ts[0].clientY + ts[1].clientY) / 2 }; }

  // ---------- tamanho das casas e zoom ----------
  // Ao começar, o jardim inteiro cabe na tela: a casa sai da largura E da altura que sobram para a área (a barra de
  // cima, a dica e o espaço do tocador de música embaixo já ficaram de fora, no CSS). O 🔍 e os dois dedos aproximam.
  function ajustar() {
    if (!est) return;
    var r = area.getBoundingClientRect();
    // sobra para o miolo e a moldura do jardim (4 + 4 de cada lado) e os vãos entre as casas
    function cabe(v) { return Math.floor(Math.min((r.width - 16 - v * (est.colunas - 1)) / est.colunas, (r.height - 16 - v * (est.linhas - 1)) / est.linhas)); }
    vao = 2; base = cabe(vao);
    if (base < 32) { vao = 1; base = cabe(vao); }   // casa pequena: vão de 1 px, sobra mais para a casa
    base = Math.max(16, Math.min(72, base));
    tab.style.setProperty('--vao', vao + 'px');
    aplicarZoom(zoom);
  }
  function aplicarZoom(z, centro) {
    var antes = base * zoom;
    zoom = Math.max(1, Math.min(2.6, z));
    var cel = Math.round(base * zoom);
    if (centro) {
      var r = area.getBoundingClientRect(), fx = centro.x - r.left, fy = centro.y - r.top, k = cel / antes;
      tab.style.setProperty('--cel', cel + 'px');
      area.scrollLeft = (area.scrollLeft + fx) * k - fx; area.scrollTop = (area.scrollTop + fy) * k - fy;
    } else tab.style.setProperty('--cel', cel + 'px');
    $('btZoom').setAttribute('aria-pressed', String(zoom > 1.01));
  }
  function centroArea() { var r = area.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  // 🔍: um toque chega perto, outro toque volta a mostrar o jardim todo
  $('btZoom').addEventListener('click', function () { if (zoom > 1.01) aplicarZoom(1, centroArea()); else aplicarZoom(2, centroArea()); });
  // o jardim se ajusta sempre que o espaço muda (girar o aparelho, barra que quebra linha, abinha da tela inteira)
  var esperaAjuste = null;
  function pedirAjuste() { clearTimeout(esperaAjuste); esperaAjuste = setTimeout(ajustar, 120); }
  if (window.ResizeObserver) new ResizeObserver(pedirAjuste).observe(area); else window.addEventListener('resize', pedirAjuste);

  // ---------- teclado (e controle da TV): setas andam entre as casas, Enter abre, B ou F marca ----------
  tab.addEventListener('keydown', function (e) {
    var i = casaDe(e); if (i < 0 || !est) return;
    var l = Math.floor(i / est.colunas), c = i % est.colunas;
    var dir = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] }[e.key];
    if (dir) {
      e.preventDefault();
      var nl = Math.max(0, Math.min(est.linhas - 1, l + dir[0])), nc = Math.max(0, Math.min(est.colunas - 1, c + dir[1])), j = nl * est.colunas + nc;
      casas[i].tabIndex = -1; casas[j].tabIndex = 0; casas[j].focus(); casas[j].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    } else if (/^[bfBF]$/.test(e.key)) { e.preventDefault(); marcar(i); }
  });
  tab.addEventListener('focusin', function (e) { var i = casaDe(e); if (i >= 0) casas.forEach(function (b, k) { b.tabIndex = k === i ? 0 : -1; }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'GoBack' || e.keyCode === 461) { if (atual === 'jogo') { e.preventDefault(); voltarAoMenu(); } }
  });

  // ---------- dica do Fácil: parado uns segundos, as gramas que com certeza não têm ouriço piscam ----------
  // Só o que os números abertos garantem (CM.deduzir); se não dá para garantir nada, nada pisca. Qualquer toque apaga.
  var ESPERA_DICA = 4000, esperaDica = null;
  function apagarDica() {
    clearTimeout(esperaDica); esperaDica = null;
    Array.prototype.forEach.call(tab.querySelectorAll('.casa.dica'), function (b) { b.classList.remove('dica'); });
  }
  function armarDica() {
    apagarDica();
    if (nivel === 'facil' && est && est.plantado && !est.fim) esperaDica = setTimeout(mostrarDica, ESPERA_DICA);
  }
  function mostrarDica() {
    esperaDica = null;
    if (nivel !== 'facil' || !est || est.fim || atual !== 'jogo') return;
    CM.deduzir(est).seguras.forEach(function (k) { casas[k].classList.add('dica'); });
  }
  ['pointerdown', 'keydown'].forEach(function (k) { document.addEventListener(k, armarDica, true); });

  // ---------- fim de jogo ----------
  function terminar() {
    pararRelogio(); apagarDica(); desenharTudo();
    var ganhou = est.fim === 'ganhou', novoRec = false;
    $('btNovo').textContent = ganhou ? '😎' : '😵';
    if (ganhou) {
      var r = pref.recordes[nivel];
      if (!r || seg < r) { pref.recordes[nivel] = seg; salvarPref(); novoRec = true; }
      Som.ganhou(); florir(); festa();
    } else {
      Som.perdeu();
      if (!CALMO) {
        tab.classList.add('tremeu');
        var e0 = est.explodiu, l0 = Math.floor(e0 / est.colunas), c0 = e0 % est.colunas;
        est.cel.forEach(function (c, k) { if (c.mina && k !== e0) { var d = Math.hypot(Math.floor(k / est.colunas) - l0, k % est.colunas - c0); casas[k].style.animationDelay = Math.round(d * 70) + 'ms'; } });
      }
    }
    var at = est;
    setTimeout(function () { if (est === at) abrirFim(ganhou, novoRec); }, CALMO || TESTE ? 50 : ganhou ? 1400 : 1300);
  }
  function florir() {
    tab.classList.add('florido');
    if (CALMO) return;
    var n = 0; est.cel.forEach(function (c, k) { if (c.aberta) { casas[k].style.setProperty('--d', Math.min(n++ * 12, 1100) + 'ms'); } });
  }
  function festa() {
    if (CALMO) return;
    var f = $('festa'), cores = ['#ff7bb0', '#ffd23f', '#9ee7ff', '#c6ff3d', '#ff8a3d', '#b98bff'];
    f.innerHTML = '';
    for (var k = 0; k < 36; k++) {
      var p = document.createElement('i');
      p.style.left = (Math.random() * 100) + '%'; p.style.background = cores[k % cores.length];
      p.style.animationDelay = (Math.random() * 0.9) + 's'; p.style.animationDuration = (2.2 + Math.random() * 1.6) + 's';
      f.appendChild(p);
    }
  }
  function limparFesta() { $('festa').innerHTML = ''; }
  var focoAntes = null;
  function abrirFim(ganhou, novoRec) {
    $('fimDesenho').src = ganhou ? 'flor.svg' : 'ourico.svg';
    $('fimDesenho').className = 'fim-desenho ' + (ganhou ? 'feliz' : 'acordado');
    $('fimTitulo').textContent = ganhou ? t('Uhuu! Jardim todo aberto! 🌼', 'Hooray! The whole garden is open! 🌼') : t('Ops! Um ouriço acordou! 🦔', 'Oops! A hedgehog woke up! 🦔');
    $('fimTexto').textContent = ganhou ? t('Você achou todos os ' + est.minas + ' ouriços em ' + relogio(seg) + ' e eles continuam dormindo. 💤', 'You found all ' + est.minas + ' hedgehogs in ' + relogio(seg) + ' and they are still asleep. 💤')
      : t('Ele só queria dormir mais um pouquinho. Vamos tentar de novo?', 'It just wanted to sleep a little longer. Shall we try again?');
    var rec = $('fimRecorde'); rec.hidden = !(ganhou && novoRec);
    rec.textContent = t('🏆 Novo recorde neste nível!', '🏆 New best time for this level!');
    $('btDeNovo').textContent = ganhou ? t('🔄 Jogar de novo', '🔄 Play again') : t('🔄 Tentar de novo', '🔄 Try again');
    focoAntes = document.activeElement;
    $('fim').hidden = false; $('btDeNovo').focus();
  }
  // tocar fora do cartão fecha a janela para ver o jardim (o 🙂 começa de novo)
  $('fim').addEventListener('click', function (e) { if (e.target === this) fecharFim(); });
  function fecharFim() { if ($('fim').hidden) return; $('fim').hidden = true; if (focoAntes && focoAntes.focus && document.contains(focoAntes)) try { focoAntes.focus(); } catch (e) { /* tanto faz */ } }
  // dentro da janela de fim, o Tab não sai dela
  $('fim').addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var a = $('btDeNovo'), b = $('btNiveis');
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); } else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
  });

  // ---------- música (trilha comum dos jogos) ----------
  var M = '../rabiscolandia/musicas/', AU = 'Kevin MacLeod', LIC = 'CC BY';
  // 0.2.1: saíram Pixel Peeker Polka (som de videogame) e Spazzmatica Polka (synth retrô); a lista é de instrumentos de verdade
  var MUSICAS = [
    { a: M + 'scheming-weasel.mp3', t: 'Scheming Weasel', au: AU, lic: LIC },
    { a: M + 'music-to-delight.mp3', t: 'Music to Delight', au: AU, lic: LIC },
    { a: M + 'batty-mcfaddin.mp3', t: 'Batty McFaddin', au: AU, lic: LIC },
    { a: M + 'life-of-riley.mp3', t: 'Life of Riley', au: AU, lic: 'CC BY 4.0' },
    { a: M + 'carpe-diem.mp3', t: 'Carpe Diem', au: AU, lic: LIC },
    { a: M + 'mariachi-snooze.mp3', t: 'Mariachi Snooze', au: AU, lic: LIC },
    { a: M + 'sneaky-snitch.mp3', t: 'Sneaky Snitch', au: AU, lic: LIC },
    { a: M + 'airport-lounge.mp3', t: 'Airport Lounge', au: AU, lic: LIC },
    { a: M + 'street-party.mp3', t: 'Street Party', au: AU, lic: 'CC BY 4.0' },
    { a: M + 'sunflower-dance-party.mp3', t: 'Sunflower Dance Party', au: AU, lic: 'CC BY 4.0' },
    { a: M + 'beachfront-celebration.mp3', t: 'Beachfront Celebration', au: AU, lic: 'CC BY 4.0' }
  ];
  if (window.Trilha) window.Trilha.iniciar({ jogo: 'campo-minado', musicas: MUSICAS, creditos: 'CREDITOS.md' });

  // ---------- instalar e service worker ----------
  var pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); pedidoInstalar = e; $('btInstalar').hidden = false; });
  $('btInstalar').addEventListener('click', function () { if (!pedidoInstalar) return; pedidoInstalar.prompt(); pedidoInstalar.userChoice.then(function () { pedidoInstalar = null; $('btInstalar').hidden = true; }); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });

  traduzir(); pintarEfeitos();

  // usado pelos testes
  window.CampoDebug = {
    estado: function () { return est; }, nivel: function () { return nivel; }, versao: APP_VERSION, MUSICAS: MUSICAS,
    casa: function (i) { return casas[i]; }, tocar: tocarCasa, marcar: marcar, espera: ESPERA_DICA, pronto: true
  };
})();

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer jogar não baixa nada a mais. */
(function () {
  if (!/[?&]instalar\b/.test(location.search) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.src = '../instalar.js';
  s.setAttribute('data-nome', 'Campo Minado'); s.setAttribute('data-icone', 'icone-192.png');
  s.setAttribute('data-so-com', 'instalar'); s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
  document.body.appendChild(s);
})();
