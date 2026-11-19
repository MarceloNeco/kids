/* TIJOLAÇO — telas (começo, jogo, fim, como jogar), botões, placar, Barra da Obra, controles e o laço do jogo.
   Regras em regras.js (TijolacoRegras), fases em fases.js (TijolacoFases), desenho em arte.js (TijolacoArte),
   efeitos em som.js (TijolacoSom). Com ?teste aparece window.TijolacoDebug (usado pelos testes no navegador).
   Versão: APP_VERSION aqui = VERSAO no sw.js = primeira entrada do versoes.json. */
(function () {
  'use strict';
  var APP_VERSION = '0.1.0', APP_DATA = '19/Nov/2026';
  var R = window.TijolacoRegras, F = window.TijolacoFases, A = window.TijolacoArte, Som = window.TijolacoSom;
  var $ = function (id) { return document.getElementById(id); };
  var TESTE = /[?&]teste\b/.test(location.search);
  var calmo = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  // trilha: rock, funk e groove de obra, com instrumentos de verdade, que já moram no Vruuum! e na Purpurina (créditos em CREDITOS.md)
  var VR = '../vruuum/musicas/', P = '../purpurina/musicas/', KM = 'Kevin MacLeod', CC = 'CC BY 4.0';
  var MUSICAS = [
    { a: VR + 'anthem-rock-this-house.mp3', t: 'Rock This House', au: 'Anthem of Rain', lic: CC },
    { a: VR + 'holizna-jams.mp3', t: 'Rock Montage: Jams', au: 'HoliznaCC0', lic: 'CC0 1.0' },
    { a: VR + 'holizna-americana.mp3', t: 'Rock Montage: Americana', au: 'HoliznaCC0', lic: 'CC0 1.0' },
    { a: VR + 'bet-you-can.mp3', t: 'Bet You Can', au: KM, lic: CC },
    { a: VR + 'cool-hard-facts.mp3', t: 'Cool Hard Facts', au: KM, lic: CC },
    { a: VR + 'exhilarate.mp3', t: 'Exhilarate', au: KM, lic: CC },
    { a: VR + 'what-you-want.mp3', t: 'What You Want', au: KM, lic: CC },
    { a: VR + 'gearhead.mp3', t: 'Gearhead', au: KM, lic: CC },
    { a: P + 'got-funk.mp3', t: 'Got Funk', au: KM, lic: CC },
    { a: P + 'funky-one.mp3', t: 'Funky One', au: KM, lic: CC },
    { a: P + 'c-funk.mp3', t: 'C-Funk', au: KM, lic: CC },
    { a: P + 'boogie-party.mp3', t: 'Boogie Party', au: KM, lic: CC }
  ];

  /* ---------- guardado no aparelho ---------- */
  var CH_PREF = 'bolinho:tijolaco:pref', CH_PROG = 'bolinho:tijolaco:progresso';
  function lerJSON(k, pad) { try { var v = JSON.parse(localStorage.getItem(k)); return v && typeof v === 'object' ? v : pad; } catch (e) { return pad; } }
  function gravarJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var pref = Object.assign({ nivel: 'facil', efeitos: true, fase: 0 }, lerJSON(CH_PREF, {}));
  if (!R.NIVEIS[pref.nivel]) pref.nivel = 'facil';
  var prog = Object.assign({ estrelas: [], recorde: [] }, lerJSON(CH_PROG, {}));
  function salvarPref() { gravarJSON(CH_PREF, pref); }
  function salvarProg() { gravarJSON(CH_PROG, prog); }
  function destravadas() { var n = 1; for (var i = 0; i < F.length - 1; i++) if (prog.estrelas[i] > 0) n = i + 2; return Math.min(F.length, n); }
  function proxima() { for (var i = 0; i < destravadas(); i++) if (!(prog.estrelas[i] > 0)) return i; return destravadas() - 1; }

  /* ---------- idioma ---------- */
  var lingua = window.BolinhoIdioma ? BolinhoIdioma.atual() : 'pt';
  var IDX = { pt: 0, en: 1, es: 2 };
  function t(pt, en, es) { return lingua === 'en' ? en : lingua === 'es' ? es : pt; }
  function nomeJogo() { return t('TIJOLAÇO', 'BRICKFREAK', 'LADRILLOLÍO'); }
  function nomeFase(i) { var n = F[i].nome; return n[lingua] || n.pt; }
  function dataVersao() {   // PT 19/Nov/2026 · EN Nov/19/2026 · ES 19/nov/2026
    var p = APP_DATA.split('/');
    return t(APP_DATA, p[1] + '/' + p[0] + '/' + p[2], p[0] + '/' + p[1].toLowerCase() + '/' + p[2]);
  }
  function traduzir() {
    document.documentElement.lang = t('pt-BR', 'en-US', 'es-ES');
    document.title = t('TIJOLAÇO', 'BrickFreak', 'Ladrillolío') + ' — ' + t('Bolinho de Chuva', 'Rainy Day Donuts', 'Buñuelos de Lluvia') + ' · SolverONE';
    function parte(el, at) { var p = el.getAttribute(at).split('|'); return p[IDX[lingua]] != null ? p[IDX[lingua]] : p[0]; }
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = parte(el, 'data-t'); });
    document.querySelectorAll('[data-rotulo]').forEach(function (el) { el.setAttribute('aria-label', parte(el, 'data-rotulo')); });
    $('versao').textContent = t('Versão ', 'Version ', 'Versión ') + APP_VERSION + ' · ' + dataVersao();
    montarLetreiro(); montarFases(); pintarMenu();
  }
  if (window.BolinhoIdioma) BolinhoIdioma.aoMudar(function (c) { lingua = c; traduzir(); pintarHud(true); });

  /* ---------- começo ---------- */
  function montarLetreiro() {
    var h = $('letreiro'), nome = nomeJogo();
    h.textContent = ''; h.setAttribute('aria-label', t('TIJOLAÇO', 'BrickFreak', 'Ladrillolío'));
    h.style.setProperty('--n', nome.length);
    for (var i = 0; i < nome.length; i++) { var s = document.createElement('span'); s.className = 'tj'; s.setAttribute('aria-hidden', 'true'); s.textContent = nome[i]; h.appendChild(s); }
  }
  var faseSel = Math.min(pref.fase || 0, destravadas() - 1);
  function montarFases() {
    var box = $('fases'), lib = destravadas();
    box.textContent = '';
    F.forEach(function (f, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'fase'; b.setAttribute('role', 'radio'); b.dataset.fase = String(i);
      b.setAttribute('aria-checked', String(i === faseSel));
      var est = prog.estrelas[i] || 0;
      if (i >= lib) { b.disabled = true; b.innerHTML = '<b>🔒</b><span class="st"><i>★</i><i>★</i><i>★</i></span>'; }
      else b.innerHTML = '<b>' + (i + 1) + '</b><span class="st"><i' + (est > 0 ? ' class="on"' : '') + '>★</i><i' + (est > 1 ? ' class="on"' : '') + '>★</i><i' + (est > 2 ? ' class="on"' : '') + '>★</i></span>';
      b.setAttribute('aria-label', t('Fase ', 'Level ', 'Fase ') + (i + 1) + ': ' + nomeFase(i) + (i >= lib ? t(' (trancada)', ' (locked)', ' (bloqueada)') : ' · ' + est + ' ★'));
      b.title = (i + 1) + ' · ' + nomeFase(i);
      b.addEventListener('click', function () { if (b.disabled) return; faseSel = i; pref.fase = i; salvarPref(); Som.toque(); montarFases(); pintarMenu(); });
      box.appendChild(b);
    });
  }
  function pintarMenu() {
    document.querySelectorAll('[data-nivel]').forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.nivel === pref.nivel)); });
    $('btJogar').textContent = t('▶ Jogar · fase ', '▶ Play · level ', '▶ Jugar · fase ') + (faseSel + 1);
    $('btEfeitos').textContent = pref.efeitos ? '🔊' : '🔇';
  }
  document.querySelectorAll('[data-nivel]').forEach(function (b) {
    b.addEventListener('click', function () { pref.nivel = b.dataset.nivel; salvarPref(); Som.toque(); pintarMenu(); });
  });
  $('mdLinto').addEventListener('click', function () { Som.toque(); });
  $('btJogar').addEventListener('click', function () { Som.acordar(); jogar(faseSel, pref.nivel); });
  $('btEfeitos').addEventListener('click', function () { pref.efeitos = !pref.efeitos; Som.ligar(pref.efeitos); salvarPref(); pintarMenu(); Som.toque(); });
  $('btAjuda').addEventListener('click', function () { $('ajuda').hidden = false; $('btFecharAjuda').focus(); });
  $('btFecharAjuda').addEventListener('click', function () { $('ajuda').hidden = true; $('btAjuda').focus(); });
  Som.ligar(pref.efeitos);

  /* ---------- telas e histórico ---------- */
  var tela = 'menu', empurrado = false, E = null, faseAtual = 0;
  function mostrar(id) {
    document.querySelectorAll('.tela').forEach(function (s) { s.classList.toggle('ativa', s.id === id); });
    tela = id; document.body.classList.toggle('jogando', id === 'jogo');
  }
  function entrar(id) { if (!empurrado) { try { history.pushState({ tijolaco: id }, ''); empurrado = true; } catch (e) {} } mostrar(id); }
  function irMenu() {
    fecharFim(); E = null; particulas = []; textos = [];
    $('faixa').hidden = true;
    mostrar('menu'); montarFases(); pintarMenu(); prepararCapa();
  }
  window.addEventListener('popstate', function () { empurrado = false; if (tela !== 'menu') irMenu(); });
  function voltarMenu() { if (empurrado) history.back(); else irMenu(); }
  if (window.BolinhoNav) BolinhoNav.iniciar({ jogo: 'tijolaco', noInicio: function () { return tela === 'menu'; }, irParaInicio: voltarMenu,
    emAndamento: function () { return tela === 'jogo' && !!E && !E.fim; } });

  /* ---------- canvas e encaixe do campo na tela ---------- */
  var cv = $('cena'), ctx = cv.getContext('2d'), lay = null, sujo = true;
  function px(v, pad) { var n = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(v)); return isNaN(n) ? pad : n; }
  function medir(retrato) {
    var cw = cv.clientWidth || innerWidth, ch = cv.clientHeight || innerHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    var deitadoTela = cw > ch * 1.05, ax, ay, aw, ah;
    if (deitadoTela) { var esq = Math.max(px('--nav-largo', 100), 96); ax = esq; ay = 4; aw = cw - esq - 6; ah = ch - 8; document.documentElement.style.setProperty('--campo-esq', esq + 'px'); }
    else { var top = Math.max(px('--nav-alto', 56), 52); ax = 4; ay = top; aw = cw - 8; ah = ch - top - 6; }
    if (retrato == null) retrato = aw < ah;
    var FW = retrato ? 620 : 1000, FH = retrato ? 1000 : 620, esc = Math.min(aw / FW, ah / FH);
    document.body.classList.toggle('deitado', deitadoTela);
    return { cw: cw, ch: ch, dpr: dpr, esc: esc, ox: Math.round(ax + (aw - FW * esc) / 2), oy: Math.round(ay + (ah - FH * esc) / 2), retrato: retrato, deitado: deitadoTela };
  }
  function ajustarCanvas() {
    var l = medir(E ? E.retrato : null), W = Math.round(l.cw * l.dpr), H = Math.round(l.ch * l.dpr);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    lay = l; sujo = true;
    if (E) A.preparar(E, lay); else prepararCapa();
  }
  var capaE = null;
  function prepararCapa() {   // o cenário da próxima fase, parado, atrás da placa do começo
    if (!lay) return;
    capaE = R.novo(F[faseSel], pref.nivel, { retrato: lay.retrato });
    A.preparar(capaE, lay); sujo = true;
  }
  var ultimoTam = '';
  function conferirTamanho() {   // a barra 🏠 🚪 muda de largura, a tela gira: o campo se ajusta
    var k = cv.clientWidth + 'x' + cv.clientHeight + ':' + px('--nav-largo', 0) + ':' + px('--nav-alto', 0) + ':' + (window.devicePixelRatio || 1);
    if (k !== ultimoTam) { ultimoTam = k; ajustarCanvas(); }
  }
  window.addEventListener('resize', conferirTamanho);

  /* ---------- partida ---------- */
  function jogar(i, nivel) {
    fecharFim();
    faseAtual = i; faseSel = i; pref.fase = i; pref.nivel = nivel; salvarPref();
    particulas = []; textos = []; tremor = 0; portaoSel = -1; teclas = {};
    entrar('jogo');
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    lay = medir(null);
    E = R.novo(F[i], nivel, { retrato: lay.retrato });
    ajustarCanvas();
    pintarHud(true);
    faixa(t('Fase ', 'Level ', 'Fase ') + (i + 1) + ' · ' + nomeFase(i), 2200);
    Som.apito();
  }
  var faixaAte = 0;
  function faixa(txt, ms) { var f = $('faixa'); f.textContent = txt; f.hidden = false; faixaAte = performance.now() + (ms || 1800); }
  var hudCache = '';
  function pintarHud(forcar) {
    if (!E) return;
    var pc = Math.min(100, Math.round(E.estourados / E.meta * 100));
    var ef = [];
    if (E.efeitos.re > 0) ef.push('⏪ ' + t('Ré', 'Reverse', 'Atrás'));
    if (E.efeitos.devagar > 0) ef.push('🔴 ' + t('Devagar', 'Slow', 'Despacio'));
    if (E.efeitos.prumo > 0) ef.push('📏 ' + t('Prumo', 'Plumb', 'Plomada'));
    var k = E.pontos + ':' + pc + ':' + ef.join(',') + ':' + lingua;
    if (!forcar && k === hudCache) return;
    hudCache = k;
    $('hudFase').textContent = t('Fase ', 'Level ', 'Fase ') + (faseAtual + 1) + ' · ' + nomeFase(faseAtual);
    $('hudPontos').textContent = E.pontos.toLocaleString(t('pt-BR', 'en-US', 'es-ES'));
    var en = $('barraEnche');
    if (document.body.classList.contains('deitado')) { en.style.height = pc + '%'; en.style.width = ''; } else { en.style.width = pc + '%'; en.style.height = ''; }
    $('barra').setAttribute('aria-valuenow', String(pc));
    $('barra').classList.toggle('cheia', E.obraPronta);
    $('hudEfeitos').innerHTML = ef.map(function (s) { return '<span>' + s + '</span>'; }).join('');
  }

  /* ---------- efeitos na tela ---------- */
  var particulas = [], textos = [], tremor = 0;
  function poeira(x, y, n, forte) {
    for (var i = 0; i < n && particulas.length < 260; i++) {
      var a = Math.random() * 6.283, v = (forte ? 60 : 30) + Math.random() * 60;
      particulas.push({ tipo: 'poeira', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 10, r: 7 + Math.random() * 8, vida: 0.7, max: 0.7 });
    }
  }
  function cacos(x, y, cor, n) {
    for (var i = 0; i < n && particulas.length < 260; i++) {
      var a = Math.random() * 6.283, v = 120 + Math.random() * 220;
      particulas.push({ tipo: 'caco', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, r: 3 + Math.random() * 4, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 18, cor: cor, vida: 0.75, max: 0.75, g: 520 });
    }
  }
  function brilhos(x, y, n) {
    for (var i = 0; i < n && particulas.length < 260; i++) {
      var a = Math.random() * 6.283, v = 40 + Math.random() * 140;
      particulas.push({ tipo: 'brilho', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 3 + Math.random() * 3, vida: 0.6, max: 0.6 });
    }
  }
  function texto(txt, x, y, cor, grande) {
    // dentro do campo e sem cair em cima de outro texto (o combo em cadeia estoura quase no mesmo lugar)
    var meia = Math.min(E ? E.W / 2 - 10 : 200, txt.length * (grande ? 10 : 7) + 10);
    if (E) { x = Math.max(meia, Math.min(E.W - meia, x)); y = Math.max(50, Math.min(E.H - 10, y)); }
    for (var k = 0; k < 6; k++) {
      var bate = textos.some(function (o) { return o.vida > o.max * 0.35 && Math.abs(o.x - x) < 150 && Math.abs(o.y - y) < 32; });
      if (!bate) break;
      y -= 36;
    }
    textos.push({ txt: txt, x: x, y: y, cor: cor, grande: !!grande, vida: grande ? 1.3 : 1, max: grande ? 1.3 : 1 }); if (textos.length > 12) textos.shift();
  }
  function andarEfeitos(dt) {
    for (var i = particulas.length - 1; i >= 0; i--) {
      var p = particulas[i];
      p.vida -= dt; if (p.vida <= 0) { particulas.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; if (p.g) p.vy += p.g * dt; else { p.vx *= 0.94; p.vy *= 0.94; }
      if (p.vr) p.rot += p.vr * dt;
    }
    for (i = textos.length - 1; i >= 0; i--) { textos[i].vida -= dt; if (textos[i].vida <= 0) textos.splice(i, 1); }
    if (tremor > 0) tremor = Math.max(0, tremor - dt * 30);
  }
  function tremer(v) { if (!calmo) tremor = Math.max(tremor, v); }
  var NOME_PODER = {
    marreta: function () { return t('MARRETA!', 'SLEDGEHAMMER!', '¡MAZO!'); },
    re: function () { return t('RÉ DO ROLO!', 'REVERSE!', '¡MARCHA ATRÁS!'); },
    devagar: function () { return t('SINAL VERMELHO!', 'RED LIGHT!', '¡SEMÁFORO ROJO!'); },
    prumo: function () { return t('FIO DE PRUMO!', 'PLUMB LINE!', '¡PLOMADA!'); }
  };
  var ultimoCai = 0;
  function tratar(ev) {
    ev.forEach(function (e) {
      var C = R.CORES;
      if (e.tipo === 'encaixe') { Som.choque(1); poeira(e.x, e.y, calmo ? 1 : 3); }
      else if (e.tipo === 'estouro') {
        Som.estouro(e.combo);
        e.bolas.forEach(function (b) { cacos(b.x, b.y, C[b.c].cor, calmo ? 2 : 5); poeira(b.x, b.y, calmo ? 1 : 2, true); });
        texto('+' + e.pontos, e.x, e.y - 8, '#fff');
        if (e.combo > 1) { texto(t('COMBO x' + e.combo + '!', 'COMBO x' + e.combo + '!', '¡COMBO x' + e.combo + '!'), e.x, e.y - 44, '#ffd23f', true); tremer(4 + e.combo * 1.5); }
        if (e.marreta) tremer(8);
      }
      else if (e.tipo === 'combo') { /* já festejado no estouro */ }
      else if (e.tipo === 'junta') Som.choque(1);
      else if (e.tipo === 'brecha') { Som.brecha(); texto(t('TIRO NA BRECHA +' + e.pontos + '!', 'GAP SHOT +' + e.pontos + '!', '¡TIRO AL HUECO +' + e.pontos + '!'), Math.max(120, Math.min(E.W - 120, e.x)), Math.max(60, Math.min(E.H - 30, e.y)), '#7fe3ff', true); }
      else if (e.tipo === 'capacete') { Som.capacete(); brilhos(e.x, e.y, 18); texto('+' + e.pontos, e.x, e.y - 10, '#ffd23f', true); }
      else if (e.tipo === 'capaceteSurge') Som.toque();
      else if (e.tipo === 'poder') { Som.poder(); brilhos(e.x, e.y, 14); texto(NOME_PODER[e.poder](), e.x, e.y - 30, '#fff3b0', true); }
      else if (e.tipo === 'obraPronta') { Som.obraPronta(); faixa('🏗️ ' + t('Obra pronta! Quebre o resto!', 'Job done! Break the rest!', '¡Obra lista! ¡Rompe el resto!'), 2600); }
      else if (e.tipo === 'perdendo') { Som.apito(); faixa('🚨 ' + t('A fila chegou na caçamba!', 'The line reached the dumpster!', '¡La fila llegó al contenedor!'), 2200); tremer(6); }
      else if (e.tipo === 'cai') { var ag = performance.now(); if (ag - ultimoCai > 70) { ultimoCai = ag; Som.cai(); } poeira(e.x, e.y, 1, true); }
      else if (e.tipo === 'ouro') { faixa('✨ ' + t('Tijolo de ouro!', 'Golden brick!', '¡Ladrillo de oro!'), 1800); Som.capacete(); }
      else if (e.tipo === 'vitoria') { Som.vitoria(); setTimeout(function () { mostrarFim(true); }, 250); }
      else if (e.tipo === 'derrota') { Som.derrota(); setTimeout(function () { mostrarFim(false); }, 250); }
    });
  }

  /* ---------- fim da fase ---------- */
  var SVG_ESTRELA = '<path d="M50 6l13 28 30 3-23 20 7 30-27-16-27 16 7-30L7 37l30-3z" stroke-linejoin="round"/>';
  function mostrarFim(venceu) {
    if (!E) return;
    var est = venceu ? R.estrelas(E) : 0, i = faseAtual, ultima = i >= F.length - 1;
    if (venceu) {
      prog.estrelas[i] = Math.max(prog.estrelas[i] || 0, est);
      prog.recorde[i] = Math.max(prog.recorde[i] || 0, E.pontos);
      salvarProg();
    }
    $('fimEstrelas').innerHTML = [0, 1, 2].map(function (k) {
      var on = k < est;
      return '<svg viewBox="0 0 100 100" class="' + (on ? 'on' : '') + '"><g fill="' + (on ? '#ffcc00' : 'rgba(255,255,255,.14)') + '" stroke="' + (on ? '#9a6a00' : 'rgba(255,255,255,.25)') + '" stroke-width="5">' + SVG_ESTRELA + '</g></svg>';
    }).join('');
    $('fimTitulo').textContent = venceu ? (ultima ? t('Todas as obras prontas!', 'Every job done!', '¡Todas las obras listas!') : t('Obra entregue!', 'Job done!', '¡Obra terminada!')) : t('A caçamba encheu!', 'The dumpster filled up!', '¡Se llenó el contenedor!');
    $('fimTexto').textContent = venceu ? (nomeFase(i) + ' · ' + t('recorde ', 'best ', 'récord ') + (prog.recorde[i] || 0).toLocaleString(t('pt-BR', 'en-US', 'es-ES')))
      : t('Tente de novo: troque o tijolo, use o ímã e abra os portões.', 'Try again: swap bricks, use the magnet and open the gates.', 'Inténtalo otra vez: cambia el ladrillo, usa el imán y abre las puertas.');
    $('fimPontos').textContent = E.pontos.toLocaleString(t('pt-BR', 'en-US', 'es-ES'));
    $('fimCombo').textContent = 'x' + Math.max(1, E.maiorCombo);
    $('fimOuro').textContent = '+' + E.bonusOuro;
    $('fimOuroBox').hidden = !venceu;
    $('btProxima').hidden = !venceu || ultima;
    $('btDeNovo').textContent = venceu ? t('🔄 Jogar de novo', '🔄 Play again', '🔄 Jugar otra vez') : t('🔄 Tentar de novo', '🔄 Try again', '🔄 Reintentar');
    $('fim').hidden = false; $('faixa').hidden = true; faixaAte = 0;
    $('fim').dataset.resultado = venceu ? 'vitoria' : 'derrota';
    var foco = venceu && !ultima ? $('btProxima') : $('btDeNovo');
    setTimeout(function () { try { foco.focus(); } catch (e) {} }, 30);
  }
  function fecharFim() { $('fim').hidden = true; }
  $('btProxima').addEventListener('click', function () { jogar(Math.min(F.length - 1, faseAtual + 1), pref.nivel); });
  $('btDeNovo').addEventListener('click', function () { jogar(faseAtual, pref.nivel); });
  $('btFimMenu').addEventListener('click', voltarMenu);

  /* ---------- controles: toque, mouse, teclado e TV ---------- */
  function noCampo(ev) { return { x: (ev.clientX - lay.ox) / lay.esc, y: (ev.clientY - lay.oy) / lay.esc }; }
  function mirarEm(p) {
    var L = E.lanc;
    if (L.trilho) {   // no andaime: o carrinho vai até o dedo e a mira fica para dentro do campo (até 70° de cada lado)
      var a = L.trilho[0], b = L.trilho[1], dx = b[0] - a[0], dy = b[1] - a[1];
      L.alvoU = Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.y - a[1]) * dy) / (dx * dx + dy * dy)));
      var ang = Math.atan2(p.y - L.y, p.x - L.x), d = Math.atan2(Math.sin(ang - L.base), Math.cos(ang - L.base));
      L.ang = L.base + Math.max(-1.2, Math.min(1.2, d));
    } else L.ang = Math.atan2(p.y - L.y, p.x - L.x);
  }
  function portaoEm(p) {
    for (var i = 0; i < E.portoes.length; i++) { var g = E.portoes[i]; if (Math.hypot(g.botao[0] - p.x, g.botao[1] - p.y) < 42) return i; }
    return -1;
  }
  function mexerPortao(i) {
    if (!E || E.fim || i < 0 || i >= E.portoes.length) return;
    if (R.portao(E, i)) { Som.portao(); var g = E.portoes[i]; texto(g.longo ? t('Desvio!', 'Detour!', '¡Desvío!') : t('Atalho', 'Shortcut', 'Atajo'), g.botao[0], g.botao[1] - 34, '#fff'); }
    else { Som.toque(); texto('🔒', E.portoes[i].botao[0], E.portoes[i].botao[1] - 34, '#fff'); }
  }
  var toqueIni = null;
  cv.addEventListener('pointerdown', function (ev) {
    if (tela !== 'jogo' || !E || E.fim) return;
    Som.acordar();
    var p = noCampo(ev); toqueIni = { x: p.x, y: p.y, id: ev.pointerId };
    if (ev.pointerType !== 'mouse') mirarEm(p);
    try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
  });
  cv.addEventListener('pointermove', function (ev) {
    if (tela !== 'jogo' || !E || E.fim) return;
    if (ev.pointerType === 'mouse' || toqueIni) mirarEm(noCampo(ev));
  });
  cv.addEventListener('pointerup', function (ev) {
    if (tela !== 'jogo' || !E || E.fim || !toqueIni) { toqueIni = null; return; }
    var p = noCampo(ev), ini = toqueIni; toqueIni = null;
    var L = E.lanc, perto = Math.hypot(ini.x - L.x, ini.y - L.y) < 54 && Math.hypot(p.x - L.x, p.y - L.y) < 60;
    if (perto) { R.trocar(E); Som.betoneira(); return; }
    var gi = portaoEm(ini);
    if (gi >= 0 && portaoEm(p) === gi) { mexerPortao(gi); return; }
    mirarEm(p);
    if (R.atirar(E)) Som.tiro();
  });
  cv.addEventListener('pointercancel', function () { toqueIni = null; });
  var teclas = {}, portaoSel = -1;
  window.addEventListener('keydown', function (ev) {
    if (tela !== 'jogo' || !E || !$('fim').hidden || !$('ajuda').hidden) return;
    var k = ev.key, c = ev.keyCode;
    if (k === 'ArrowLeft' || k === 'Left' || c === 37) { teclas.esq = true; ev.preventDefault(); }
    else if (k === 'ArrowRight' || k === 'Right' || c === 39) { teclas.dir = true; ev.preventDefault(); }
    else if (k === 'Enter' || k === 'OK' || c === 13) { ev.preventDefault(); Som.acordar(); if (R.atirar(E)) Som.tiro(); }
    else if (k === ' ' || k === 'ArrowUp' || k === 'Up' || c === 32 || c === 38) { ev.preventDefault(); R.trocar(E); Som.betoneira(); }
    else if (k === 'Tab') { ev.preventDefault(); if (E.portoes.length) portaoSel = (portaoSel + 1) % E.portoes.length; }
    else if (k === 'ArrowDown' || k === 'Down' || c === 40) { ev.preventDefault(); if (E.portoes.length) { if (portaoSel < 0) portaoSel = 0; mexerPortao(portaoSel); } }
    else if (/^[1-9]$/.test(k)) { ev.preventDefault(); portaoSel = +k - 1; mexerPortao(portaoSel); }
  });
  window.addEventListener('keyup', function (ev) {
    var k = ev.key, c = ev.keyCode;
    if (k === 'ArrowLeft' || k === 'Left' || c === 37) teclas.esq = false;
    if (k === 'ArrowRight' || k === 'Right' || c === 39) teclas.dir = false;
  });
  function teclado(dt) {
    var d = (teclas.dir ? 1 : 0) - (teclas.esq ? 1 : 0);
    if (!d || !E) return;
    var L = E.lanc;
    if (L.trilho) { L.alvoU = Math.max(0, Math.min(1, L.u + d * 0.9 * dt + d * 0.02)); L.ang = L.base; }
    else L.ang += d * 2.6 * dt;
  }

  /* ---------- laço ---------- */
  var ultimoT = 0, pausado = false, proxEstaca = 0;
  document.addEventListener('visibilitychange', function () { pausado = document.hidden; ultimoT = 0; });
  function quadro(agora) {
    requestAnimationFrame(quadro);
    conferirTamanho();
    var tm = agora / 1000, dt = ultimoT ? Math.min(0.05, (agora - ultimoT) / 1000) : 0;
    ultimoT = agora;
    if (pausado) dt = 0;
    if (faixaAte && agora > faixaAte) { faixaAte = 0; $('faixa').hidden = true; }
    if (tela !== 'jogo' || !E) {
      if (sujo) { sujo = false; A.capa(ctx, lay); }
      return;
    }
    if (dt) {
      teclado(dt);
      tratar(R.passo(E, dt));
      andarEfeitos(dt);
      pintarHud();
      // bate-estaca e luz na zona de perigo: cada vez mais rápido
      var perigo = 0; E.trilhos.forEach(function (T) { perigo = Math.max(perigo, T.perigo); });
      if (perigo > 0 && !E.fim && !E.perdendo && agora > proxEstaca) { Som.bateEstaca(perigo); proxEstaca = agora + 700 - 480 * perigo; }
    }
    A.quadro(ctx, E, lay, calmo ? 0 : tm, { particulas: particulas, textos: textos, tremor: tremor, portaoSel: portaoSel });
  }

  /* ---------- começo ---------- */
  var pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); pedidoInstalar = e; $('btInstalar').hidden = false; });
  $('btInstalar').addEventListener('click', function () { if (!pedidoInstalar) return; pedidoInstalar.prompt(); pedidoInstalar.userChoice.then(function () { pedidoInstalar = null; $('btInstalar').hidden = true; }); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !TESTE) navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });

  if (window.SolverRecursos && !SolverRecursos.ligado('tijolaco', true)) { document.querySelectorAll('.tela').forEach(function (s) { s.classList.remove('ativa'); }); $('desligado').hidden = false; traduzir(); return; }
  faseSel = proxima();
  traduzir();
  // fila de tijolos de enfeite no cartão do TijoLinto (pequena, feita uma vez)
  (function () { var box = $('filaDemo'); [0, 1, 2, 3, 4].forEach(function (c) { box.appendChild(A.tijoloDOM(c, 60)); }); })();
  if (window.Trilha && !TESTE) Trilha.iniciar({ jogo: 'tijolaco', musicas: MUSICAS, creditos: 'CREDITOS.md' });
  // o canteiro só é pintado e animado depois que a página terminou de abrir e a tela "Carregando…" (../carregando.js)
  // saiu: no tablet Fire velho, desenhar e animar desde o começo segurava a página no "Carregando…" (como no GLUB GLUB)
  var pronto = false;
  (function esperar(n) {
    if (document.readyState === 'complete' && (!document.documentElement.classList.contains('bc-carregando') || n > 150)) { pronto = true; conferirTamanho(); requestAnimationFrame(quadro); return; }
    setTimeout(function () { esperar(n + 1); }, 100);
  })(0);

  if (TESTE) window.TijolacoDebug = {
    pronto: true, versao: APP_VERSION, MUSICAS: MUSICAS,
    jogar: function (fase, nivel) { jogar((fase || 1) - 1, nivel || 'facil'); if (!lay) ajustarCanvas(); },
    estado: function () {
      return { tela: tela, animando: pronto, fim: $('fim').hidden ? null : $('fim').dataset.resultado, fase: faseAtual + 1, nivel: E ? E.nivel : pref.nivel,
        pontos: E ? E.pontos : 0, estourados: E ? E.estourados : 0, meta: E ? E.meta : 0, obraPronta: E ? E.obraPronta : false, resultado: E ? E.fim : null,
        bolas: E ? E.trilhos.reduce(function (s, T) { return s + T.bolas.length; }, 0) : 0,
        visiveis: E ? E.trilhos.reduce(function (s, T) { return s + T.bolas.filter(function (b) { return R.visivel(T.tab, b.s); }).length; }, 0) : 0,
        tiros: E ? E.tiros.length : 0, portoes: E ? E.portoes.map(function (g) { return { longo: g.longo, travado: g.travado, x: g.botao[0], y: g.botao[1] }; }) : [],
        lanc: E ? { x: E.lanc.x, y: E.lanc.y, cor: E.lanc.cor, prox: E.lanc.prox, ang: E.lanc.ang } : null,
        estrelas: prog.estrelas.slice(), retrato: E ? E.retrato : null };
    },
    atirar: function (ang) { if (!E) return false; E.lanc.espera = 0; var ok = R.atirar(E, ang); if (ok) Som.tiro(); return ok; },
    // ângulo do lançador até o i-ésimo tijolo à vista (0 = o mais perto da caçamba) do trilho 0
    mirarNo: function (i) {
      var T = E.trilhos[0], vis = T.bolas.filter(function (b) { return R.visivel(T.tab, b.s); }), b = vis[i || 0];
      return b ? Math.atan2(b.y - E.lanc.y, b.x - E.lanc.x) : null;
    },
    // monta uma fila conhecida no trilho 0 (cores da frente para trás), parada, e a cor do lançador
    fila: function (cores, cor, s0, prox) {
      var T = E.trilhos[0]; E.semNovos = true; E.fase = Object.assign({}, E.fase, { vel: 0.001, poder: 0 }); E.capacete = null; E.proxCapacete = 1e9;
      E.trilhos.forEach(function (o) { o.bolas = []; o.gerados = 999; });
      var s = s0 || Math.round(T.tab.L * 0.45);
      T.bolas = cores.map(function (c, k) { return R.novaBola(E, c, s - k * R.D); });
      E.lanc.cor = cor; E.lanc.prox = prox != null ? prox : cor; R.passo(E, 0.001);
    },
    avancar: function (seg) { for (var s = 0; s < seg; s += 1 / 60) tratar(R.passo(E, 1 / 60)); pintarHud(true); },
    vencer: function () {
      E.trilhos.forEach(function (T) { T.bolas = []; T.gerados = 999; }); E.estourados = E.meta; E.obraPronta = true;
      for (var s = 0; s < 12 && !E.fim; s += 1 / 30) tratar(R.passo(E, 1 / 30));
    },
    perder: function () {
      var T = E.trilhos[0];
      if (!T.bolas.length) T.bolas.push(R.novaBola(E, 0, 0));
      var d = T.tab.L + 1 - T.bolas[0].s;
      T.bolas.forEach(function (b) { b.s += d; });   // a fila inteira anda até a caçamba
      for (var s = 0; s < 20 && !E.fim; s += 1 / 30) tratar(R.passo(E, 1 / 30));
    },
    E: function () { return E; },
    // quanto custa desenhar um quadro (ms), para medir o peso no tablet velho
    medirQuadro: function (n) {
      var t0 = performance.now(), tm = performance.now() / 1000;
      for (var i = 0; i < n; i++) A.quadro(ctx, E, lay, tm + i / 60, { particulas: particulas, textos: textos, tremor: 0, portaoSel: -1 });
      ctx.getImageData(0, 0, 1, 1);
      return (performance.now() - t0) / n;
    },
    medirPasso: function (n) { var t0 = performance.now(); for (var i = 0; i < n; i++) R.passo(E, 1 / 600); return (performance.now() - t0) / n; },
    naTela: function (x, y) { return { x: lay.ox + x * lay.esc, y: lay.oy + y * lay.esc }; },
    irMenu: function () { irMenu(); }
  };
})();

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer jogar não baixa nada a mais. */
(function () {
  if (!/[?&]instalar\b/.test(location.search) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.src = '../instalar.js';
  s.setAttribute('data-nome', 'TIJOLAÇO'); s.setAttribute('data-icone', 'icone-192.png');
  s.setAttribute('data-so-com', 'instalar'); s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
  document.body.appendChild(s);
})();
