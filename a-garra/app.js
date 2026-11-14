/* A Garra — telas, controles, desenho a cada quadro, fichas, coleção e fim da partida.
   A máquina por dentro é a maquina.js; o desenho, a desenho.js; os efeitos, a som.js. Aqui só junta tudo.
   Com ?teste aparece window.GarraDebug (usado pelos testes no navegador); ?semente=N repete a mesma máquina.
   Versão: APP_VERSION aqui = VERSAO no sw.js = primeira entrada do versoes.json. */
(function () {
  'use strict';
  var APP_VERSION = '0.1.0', APP_DATA = '14/Nov/2026';
  var $ = function (id) { return document.getElementById(id); };
  var BUSCA = location.search;
  var TESTE = /[?&]teste\b/.test(BUSCA);
  var SEMENTE_URL = (BUSCA.match(/[?&]semente=(\d+)/) || [])[1];
  var calmo = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var E = Desenho.ESPACO, MED = Maquina.medidas;
  var TEMAS = ['cabine', 'neon', 'estrelas'], NIVEIS = ['facil', 'medio', 'dificil'];
  var TODOS = Maquina.TIPOS.concat([Maquina.RARO]);
  // trilha: músicas alegres de instrumentos de verdade que já moram na Bagunçolândia e na Purpurina (créditos em CREDITOS.md)
  var KM = 'Kevin MacLeod', CC = 'CC BY 4.0', PD = 'domínio público (CC0)';
  var MUSICAS = [
    { a: '../baguncolandia/musicas/my-giant-bunny-friend.mp3', t: 'My Giant Bunny Friend', au: 'Bryan Teoh', lic: PD },
    { a: '../baguncolandia/musicas/spring-chicken.mp3', t: 'Spring Chicken', au: 'Bryan Teoh', lic: PD },
    { a: '../baguncolandia/musicas/funshine.mp3', t: 'Funshine', au: KM, lic: PD },
    { a: '../baguncolandia/musicas/city-sunshine.mp3', t: 'City Sunshine', au: KM, lic: PD },
    { a: '../baguncolandia/musicas/silly-boy.mp3', t: 'Silly Boy', au: 'Rafael Krux', lic: PD },
    { a: '../baguncolandia/musicas/llama-in-pajama.mp3', t: 'Llama in Pajama', au: 'Rafael Krux', lic: PD },
    { a: '../baguncolandia/musicas/ukulele-song.mp3', t: 'Ukulele Song', au: 'Rafael Krux', lic: PD },
    { a: '../purpurina/musicas/boogie-party.mp3', t: 'Boogie Party', au: KM, lic: CC },
    { a: '../purpurina/musicas/got-funk.mp3', t: 'Got Funk', au: KM, lic: CC },
    { a: '../purpurina/musicas/c-funk.mp3', t: 'C-Funk', au: KM, lic: CC },
    { a: '../purpurina/musicas/club-seamus.mp3', t: 'Club Seamus', au: KM, lic: CC },
    { a: '../purpurina/musicas/funky-one.mp3', t: 'Funky One', au: KM, lic: CC }
  ];

  /* ---------- preferências, coleção e recordes (no aparelho) ---------- */
  var CH_PREF = 'bolinho:a-garra:pref', CH_COL = 'bolinho:a-garra:colecao', CH_REC = 'bolinho:a-garra:recordes';
  function lerJSON(k, pad) { try { var v = JSON.parse(localStorage.getItem(k)); return v && typeof v === 'object' ? v : pad; } catch (e) { return pad; } }
  function gravarJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var pref = Object.assign({ tema: 'cabine', nivel: 'facil', lingua: /^en/i.test(navigator.language || '') ? 'en' : 'pt', efeitos: true }, lerJSON(CH_PREF, {}));
  if (TEMAS.indexOf(pref.tema) < 0) pref.tema = 'cabine';
  if (NIVEIS.indexOf(pref.nivel) < 0) pref.nivel = 'facil';
  if (window.BolinhoIdioma && !BolinhoIdioma.ingles()) pref.lingua = 'pt';   // só português sem o interruptor "ingles" (../idioma.js)
  function salvarPref() { gravarJSON(CH_PREF, pref); }
  var colecao = lerJSON(CH_COL, {}), recordes = lerJSON(CH_REC, {});

  function t(pt, en) { return pref.lingua === 'en' ? en : pt; }
  function nome(tipo) { var n = Desenho.NOMES[tipo] || [tipo, tipo]; return t(n[0], n[1]); }
  function traduzir() {
    document.documentElement.lang = pref.lingua === 'en' ? 'en' : 'pt-BR';
    document.querySelectorAll('[data-t]').forEach(function (el) { var p = el.getAttribute('data-t').split('|'); el.textContent = pref.lingua === 'en' ? p[1] : p[0]; });
    $('btLingua').textContent = pref.lingua === 'en' ? 'PT' : 'EN';
    $('versao').textContent = t('Versão ', 'Version ') + APP_VERSION + ' · ' + APP_DATA;
    pintarMenu();
    if (telaAtual === 'colecao') pintarColecao();
  }

  var telaAtual = 'menu';
  function mostrar(id) {
    document.querySelectorAll('.tela').forEach(function (s) { s.classList.toggle('ativa', s.id === id); });
    telaAtual = id;
    document.body.classList.toggle('jogando', id === 'jogo');
  }

  /* ---------- menu ---------- */
  function marcar(grupo, attr, valor) {
    document.querySelectorAll('#' + grupo + ' [' + attr + ']').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute(attr) === valor)); });
  }
  function quantosTipos() { return TODOS.filter(function (k) { return colecao[k] > 0; }).length; }
  function pintarMenu() {
    marcar('temas', 'data-tema', pref.tema); marcar('niveis', 'data-nivel', pref.nivel);
    NIVEIS.forEach(function (nv) {
      var el = document.querySelector('[data-rec="' + nv + '"]'), r = recordes[nv] || 0;
      el.textContent = r ? '🧸 ' + r : '';
      el.setAttribute('aria-label', r ? t('recorde: ' + r + ' bichinhos', 'record: ' + r + ' plushies') : '');
    });
    var n = quantosTipos();
    $('colecaoConta').textContent = n ? n + '/' + TODOS.length : '';
  }
  document.querySelectorAll('#temas [data-tema]').forEach(function (b) { b.addEventListener('click', function () { pref.tema = b.getAttribute('data-tema'); salvarPref(); pintarMenu(); Som.toque(); }); });
  document.querySelectorAll('#niveis [data-nivel]').forEach(function (b) { b.addEventListener('click', function () { pref.nivel = b.getAttribute('data-nivel'); salvarPref(); pintarMenu(); Som.toque(); }); });
  $('btLingua').addEventListener('click', function () { pref.lingua = pref.lingua === 'en' ? 'pt' : 'en'; salvarPref(); traduzir(); });
  function pintarEfeitos() {
    $('btEfeitos').textContent = pref.efeitos ? '🔊' : '🔈';
    $('btEfeitos').setAttribute('aria-pressed', String(!!pref.efeitos));
    Som.ligar(pref.efeitos);
  }
  $('btEfeitos').addEventListener('click', function () { pref.efeitos = !pref.efeitos; salvarPref(); pintarEfeitos(); Som.toque(); });
  $('btAjuda').addEventListener('click', function () { var a = $('ajuda'); a.hidden = !a.hidden; $('btAjuda').setAttribute('aria-expanded', String(!a.hidden)); });
  function telaCheia() {   // tela cheia no celular e no tablet (no botão de começar, como os outros jogos)
    try {
      var el = document.documentElement, pedir = el.requestFullscreen || el.webkitRequestFullscreen;
      if (pedir && matchMedia('(pointer: coarse)').matches && !document.fullscreenElement) { var p = pedir.call(el); if (p && p.catch) p.catch(function () {}); }
    } catch (e) {}
  }
  $('btJogar').addEventListener('click', function () { Som.acordar(); telaCheia(); entrar('jogo'); novaPartida(); });
  $('btColecao').addEventListener('click', function () { Som.toque(); entrar('colecao'); pintarColecao(); });
  $('btColecaoJogar').addEventListener('click', function () { Som.acordar(); mostrar('jogo'); novaPartida(); });

  /* ---------- telas de dentro e Voltar do celular ---------- */
  var empurrado = false;
  function entrar(id) {
    mostrar(id);
    if (!empurrado) { try { history.pushState({ garra: 1 }, ''); empurrado = true; } catch (e) {} }
  }
  function irMenu() {
    fecharFim(); parar(); m = null;
    mostrar('menu'); pintarMenu();
  }
  window.addEventListener('popstate', function () { empurrado = false; if (telaAtual !== 'menu') irMenu(); });
  function voltarMenu() { if (empurrado) history.back(); else irMenu(); }
  // navegação padrão (../navegacao.js): 🏠 Início = voltar ao menu (o mesmo do Voltar do celular), 🚪 Saída
  if (window.BolinhoNav) BolinhoNav.iniciar({ jogo: 'a-garra', noInicio: function () { return telaAtual === 'menu'; }, irParaInicio: voltarMenu,
    emAndamento: function () { return telaAtual === 'jogo' && !!m && m.fase !== 'fim' && m.fichas < m.cfg.fichas; } });

  /* ---------- a partida ---------- */
  var m = null, particulas = [], porta = null, avisoT = 0, ultimoQuadro = 0, fichasIni = 0, fimT = null;
  function novaPartida() {
    fecharFim();
    var sem = SEMENTE_URL ? +SEMENTE_URL : undefined;
    m = Maquina.nova({ nivel: pref.nivel, tema: pref.tema, semente: sem });
    fichasIni = m.fichas; particulas = []; porta = null; fimT = null;
    $('infoTempo').hidden = !m.cfg.tempo;
    pintarBarra(); medir();
    aviso(t('Leve a garra e aperte PEGAR!', 'Move the claw and press GRAB!'), 2.2);
  }
  function parar() { Som.motor(false); if (m) { m.mover(0); m.irPara(null); } }
  function pintarBarra() {
    if (!m) return;
    $('fichas').textContent = m.fichas;
    $('ganhos').textContent = m.ganhos.length;
    var s = Math.ceil(m.tempo);
    $('tempo').textContent = s;
    $('infoTempo').classList.toggle('pouco', !!m.cfg.tempo && m.fase === 'mirar' && s <= 5);
    $('btPegar').disabled = m.fase !== 'mirar';
  }
  function aviso(txt, seg) { $('aviso').textContent = txt; $('aviso').classList.add('ver'); avisoT = seg || 1.6; }

  /* ---------- controles: ⬅ ➡ seguram, PEGAR, dedo na máquina, teclado ---------- */
  function segurar(bt, dir) {
    function solta() { bt.classList.remove('apertado'); if (m) m.mover(0); }
    bt.addEventListener('pointerdown', function (e) {
      e.preventDefault(); if (!m || m.fase !== 'mirar') return;
      try { bt.setPointerCapture(e.pointerId); } catch (x) {}
      bt.classList.add('apertado'); Som.acordar(); m.mover(dir);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { bt.addEventListener(ev, solta); });
    bt.addEventListener('click', function (e) { if (e.detail === 0 && m && m.fase === 'mirar') m.irPara(m.garra.x + dir * 24); });   // teclado: um passinho
    bt.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  segurar($('btEsq'), -1); segurar($('btDir'), 1);
  function pegar() { if (m && m.pegar()) { Som.motor(false); pintarBarra(); } }
  $('btPegar').addEventListener('click', function () { Som.acordar(); pegar(); });
  var cv = $('tela'), g = cv.getContext('2d'), W = 1, H = 1, dpr = 1, esc = 1, ox = 0, oy = 0;
  function xMaquina(ev) { var r = cv.getBoundingClientRect(); return (ev.clientX - r.left - ox) / esc - E.OX; }
  var dedo = null;
  cv.addEventListener('pointerdown', function (e) {
    if (!m || m.fase !== 'mirar') return;
    e.preventDefault(); dedo = e.pointerId; try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    Som.acordar(); m.irPara(xMaquina(e));
  });
  cv.addEventListener('pointermove', function (e) { if (dedo === e.pointerId && m && m.fase === 'mirar') m.irPara(xMaquina(e)); });
  ['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function (e) { if (dedo === e.pointerId) dedo = null; }); });
  var teclas = {};
  window.addEventListener('keydown', function (e) {
    if (telaAtual !== 'jogo' || !m || !$('fim').hidden) return;
    var d = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
    if (d) { e.preventDefault(); if (!teclas[e.key] && m.fase === 'mirar') m.mover(d); teclas[e.key] = true; return; }
    if (e.key === ' ' || e.key === 'ArrowDown' || (e.key === 'Enter' && document.activeElement === document.body)) { e.preventDefault(); pegar(); }
  });
  window.addEventListener('keyup', function (e) { if (teclas[e.key]) { teclas[e.key] = false; if (m) m.mover(0); } });

  /* ---------- o que a máquina contou ---------- */
  function eventos() {
    while (m.eventos.length) {
      var ev = m.eventos.shift();
      if (ev.tipo === 'ficha') { Som.ficha(); setTimeout(function () { Som.descer(); }, 120); }
      else if (ev.tipo === 'tique') Som.tique();
      else if (ev.tipo === 'pegou') { Som.fechar(); Som.pegou(); aviso(ev.premio === Maquina.RARO ? t('⭐ Pegou a estrela!', '⭐ Got the star!') : t('Pegou!', 'Got it!'), 1.2); }
      else if (ev.tipo === 'raspou') { Som.fechar(); Som.errou(); aviso(t('Quase! Mire no meio.', 'So close! Aim at the middle.'), 1.8); }
      else if (ev.tipo === 'errou') { Som.fechar(); Som.errou(); aviso(t('Não pegou nada…', 'Nothing this time…'), 1.6); }
      else if (ev.tipo === 'escorregou') { Som.escorregou(); aviso(t('Ih, escorregou!', 'Oops, it slipped!'), 1.8); }
      else if (ev.tipo === 'ganhou') ganhou(ev.premio);
      else if (ev.tipo === 'fim') { Som.motor(false); fimT = 0.9; }
    }
  }
  function ganhou(tipo) {
    var raro = tipo === Maquina.RARO;
    Som.ganhou(raro);
    colecao[tipo] = (colecao[tipo] || 0) + 1; gravarJSON(CH_COL, colecao);
    porta = { tipo: tipo, t: 0 };
    confete(E.OX + MED.BURACO / 2, E.OY + MED.A + 30, raro ? 70 : 40);
    var c = $('ganhouBicho'), gg = c.getContext('2d');
    gg.clearRect(0, 0, 200, 200); Desenho.bichinho(gg, tipo, 100, 104, 62, 0, { brilho: true });
    $('ganhouNome').textContent = (raro ? '⭐ ' : '🎉 ') + nome(tipo) + '!';
    var gb = $('ganhou'); gb.hidden = false; gb.style.animation = 'none'; void gb.offsetWidth; gb.style.animation = '';
    clearTimeout(ganhou.tm); ganhou.tm = setTimeout(function () { gb.hidden = true; }, 1600);
    if (window.Trilha) { Trilha.volume(0.35); setTimeout(function () { Trilha.volume(null); }, 2200); }
  }
  function confete(x, y, n) {
    if (calmo) return;
    var cores = ['#ff4f7b', '#ffd166', '#39ff6a', '#7ef9ff', '#cfa8ff', '#ff9f43'];
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, v = 160 + Math.random() * 260;
      particulas.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 1.6 + Math.random(), cor: cores[i % cores.length], giro: Math.random() * 6, tam: 3 + Math.random() * 4 });
    }
  }

  /* ---------- fim da partida ---------- */
  function estrelasDe(ganhos) { var f = ganhos / fichasIni; return ganhos === 0 ? 0 : f >= 0.5 ? 3 : f >= 0.3 ? 2 : 1; }
  function abrirFim() {
    var n = m.ganhos.length, e = estrelasDe(n);
    if (n > (recordes[m.nivel] || 0)) { recordes[m.nivel] = n; gravarJSON(CH_REC, recordes); }
    $('fimTitulo').textContent = m.esvaziou ? t('Você esvaziou a máquina!', 'You emptied the machine!') : n ? t('Acabaram as fichas!', 'Out of tokens!') : t('Quase!', 'So close!');
    $('fimEstrelas').textContent = '★★★'.slice(0, e) + '☆☆☆'.slice(0, 3 - e);
    $('fimEstrelas').setAttribute('aria-label', t(e + ' estrelas', e + ' stars'));
    var caixa = $('fimPremios'); caixa.textContent = '';
    m.ganhos.forEach(function (tipo) {
      var c = document.createElement('canvas'); c.width = 108; c.height = 108; c.setAttribute('aria-label', nome(tipo));
      Desenho.bichinho(c.getContext('2d'), tipo, 54, 58, 36, 0, {}); caixa.appendChild(c);
    });
    var usadas = fichasIni - m.fichas;
    $('fimTexto').textContent = n
      ? t('Você pegou ' + n + (n === 1 ? ' bichinho' : ' bichinhos') + ' com ' + usadas + (usadas === 1 ? ' ficha.' : ' fichas.'), 'You got ' + n + (n === 1 ? ' plush' : ' plushies') + ' with ' + usadas + (usadas === 1 ? ' token.' : ' tokens.'))
      : t('Mire bem no meio do bichinho e tente de novo!', 'Aim right at the middle of a plush and try again!');
    $('btMaisDificil').hidden = m.nivel === 'dificil';
    $('fim').hidden = false;
    Som.fim(e);
    if (e === 3) confete(E.CW / 2, E.CH / 3, 90);
    setTimeout(function () { $('btDeNovo').focus(); }, 50);
  }
  function fecharFim() { $('fim').hidden = true; }
  $('btDeNovo').addEventListener('click', function () { novaPartida(); });
  $('btMaisDificil').addEventListener('click', function () { pref.nivel = NIVEIS[Math.min(2, NIVEIS.indexOf(pref.nivel) + 1)]; salvarPref(); novaPartida(); });
  $('btFimColecao').addEventListener('click', function () { fecharFim(); m = null; mostrar('colecao'); pintarColecao(); });
  $('btFimMenu').addEventListener('click', voltarMenu);

  /* ---------- coleção ---------- */
  function pintarColecao() {
    var p = $('prateleira'); p.textContent = '';
    TODOS.forEach(function (tipo) {
      var q = colecao[tipo] || 0, d = document.createElement('div');
      d.className = 'item' + (q ? '' : ' falta');
      var c = document.createElement('canvas'); c.width = 168; c.height = 168;
      Desenho.bichinho(c.getContext('2d'), tipo, 84, 92, 52, 0, { semEtiqueta: !q });
      var n = document.createElement('div'); n.className = 'nome'; n.textContent = q ? nome(tipo) : '?';
      var k = document.createElement('div'); k.className = 'qtd'; k.textContent = q ? '× ' + q : '';
      d.appendChild(c); d.appendChild(n); d.appendChild(k); p.appendChild(d);
    });
    var n = quantosTipos();
    $('colecaoResumo').textContent = n === TODOS.length ? t('Coleção completa! 🎉', 'Collection complete! 🎉') : t('Você tem ' + n + ' de ' + TODOS.length, 'You have ' + n + ' of ' + TODOS.length);
  }

  /* ---------- desenho a cada quadro ---------- */
  function medir() {
    var r = $('palco').getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    esc = Math.min(W / E.CW, H / E.CH); ox = (W - E.CW * esc) / 2; oy = (H - E.CH * esc) / 2;
  }
  function desenhar(seg) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    g.setTransform(dpr * esc, 0, 0, dpr * esc, dpr * ox, dpr * oy);
    Desenho.fundo(g, m.tema, seg);
    g.save(); g.translate(E.OX, E.OY);
    g.beginPath(); g.rect(0, 0, MED.L, MED.A); g.clip();
    var preso = null;
    m.premios.forEach(function (p) { if (p.ganho) return; if (p.preso) { preso = p; return; } Desenho.bichinho(g, p.tipo, p.x, p.y, p.r, p.ang, { brilho: p.tipo === Maquina.RARO }); });
    // mira: uma linha tracejada mostra onde a garra vai descer
    if (m.fase === 'mirar') {
      g.save(); g.setLineDash([6, 8]); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(m.garra.x, m.garra.y + MED.PERNA + 4); g.lineTo(m.garra.x, MED.A); g.stroke(); g.restore();
    }
    Desenho.trilho(g, m.garra.x, m.tema);
    if (preso) Desenho.bichinho(g, preso.tipo, preso.x, preso.y, preso.r, preso.ang + m.garra.balanco * 0.2, { brilho: preso.tipo === Maquina.RARO });
    Desenho.garra(g, m.garra.x + m.garra.balanco * 2, m.garra.y, m.garra.abertura, m.tema);
    g.restore();
    Desenho.frente(g, m.tema, seg, t('PRÊMIO', 'PRIZE'), { fichas: m.fichas, ganhos: m.ganhos.length, tempo: m.cfg.tempo ? Math.ceil(m.tempo) : null });
    if (porta) {   // o bichinho aparece na portinha
      var k = Math.min(1, porta.t / 0.35), pul = Math.abs(Math.sin(porta.t * 7)) * Math.max(0, 1 - porta.t / 1.5) * 8;
      Desenho.bichinho(g, porta.tipo, E.OX + 44, E.OY + MED.A + 44 - pul, 20 * k + 2, 0, {});
    }
    particulas.forEach(function (p) {
      g.save(); g.translate(p.x, p.y); g.rotate(p.giro); g.globalAlpha = Math.min(1, p.vida);
      g.fillStyle = p.cor; g.fillRect(-p.tam / 2, -p.tam / 4, p.tam, p.tam / 2); g.restore();
    });
  }
  function quadro(agora) {
    requestAnimationFrame(quadro);
    var dt = Math.min(0.05, ultimoQuadro ? (agora - ultimoQuadro) / 1000 : 0.016); ultimoQuadro = agora;
    var seg = agora / 1000;
    if (telaAtual === 'menu') { desenharMascote(seg); return; }
    if (telaAtual !== 'jogo' || !m) return;
    if (!$('fim').hidden) dt = Math.min(dt, 0.016);
    m.passo(dt * (TESTE ? velocidade : 1));
    eventos();
    var anda = (m.fase === 'mirar' && Math.abs(m.garra.vx) > 1) || m.fase === 'levar';
    Som.motor(anda);
    if (avisoT > 0) { avisoT -= dt; if (avisoT <= 0) $('aviso').classList.remove('ver'); }
    if (porta) { porta.t += dt; if (porta.t > 2.2) porta = null; }
    particulas = particulas.filter(function (p) { p.vida -= dt; p.vy += 600 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.giro += dt * 8; return p.vida > 0; });
    if (fimT != null) { fimT -= dt; if (fimT <= 0) { fimT = null; abrirFim(); } }
    pintarBarra();
    desenhar(seg);
  }
  var velocidade = 1;

  // mascote do menu: a garra balançando com um ursinho
  var cm = $('mascote'), gm = cm.getContext('2d');
  function desenharMascote(s) {
    gm.setTransform(1, 0, 0, 1, 0, 0); gm.clearRect(0, 0, cm.width, cm.height);
    var bal = calmo ? 0 : Math.sin(s * 1.8) * 0.18;
    gm.save(); gm.translate(100, 0); gm.rotate(bal);
    Desenho.bichinho(gm, ['urso', 'coelho', 'pintinho', 'unicornio'][Math.floor(s / 4) % 4], 0, 104, 34, 0, {});
    Desenho.garra(gm, 0, 50, 0.25, 'cabine');
    gm.restore();
  }

  /* ---------- instalar, service worker e começo ---------- */
  var pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); pedidoInstalar = e; $('btInstalar').hidden = false; });
  $('btInstalar').addEventListener('click', function () { if (!pedidoInstalar) return; pedidoInstalar.prompt(); pedidoInstalar.userChoice.then(function () { pedidoInstalar = null; $('btInstalar').hidden = true; }); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !TESTE) navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });
  window.addEventListener('resize', function () { if (telaAtual === 'jogo') medir(); });
  if (window.ResizeObserver) new ResizeObserver(function () { if (telaAtual === 'jogo') medir(); }).observe($('palco'));
  document.addEventListener('visibilitychange', function () { if (document.hidden) parar(); });

  if (window.SolverRecursos && !SolverRecursos.ligado('a-garra', true)) { mostrar('desligado'); $('desligado').hidden = false; traduzir(); return; }
  pintarEfeitos(); traduzir();
  if (window.Trilha) Trilha.iniciar({ jogo: 'a-garra', creditos: 'CREDITOS.md', volume: 0.45, musicas: MUSICAS });
  requestAnimationFrame(quadro);

  if (TESTE) window.GarraDebug = {
    pronto: true, versao: APP_VERSION,
    estado: function () {
      if (!m) return { tela: telaAtual };
      return { tela: telaAtual, fase: m.fase, fichas: m.fichas, tempo: m.tempo, nivel: m.nivel, tema: m.tema, x: m.garra.x, ganhos: m.ganhos.slice(),
        premios: m.premios.filter(function (p) { return !p.ganho; }).map(function (p) { return { tipo: p.tipo, x: p.x, y: p.y, r: p.r }; }), fim: !$('fim').hidden };
    },
    // ponto da tela (px da página) de um x da máquina, na altura do meio do vidro
    tela: function (x) { var r = cv.getBoundingClientRect(); return { x: r.left + ox + (E.OX + x) * esc, y: r.top + oy + (E.OY + MED.A / 2) * esc }; },
    maisAlto: function () { var l = m.premios.filter(function (p) { return !p.ganho && p.x > MED.BURACO; }).sort(function (a, b) { return (a.y - a.r) - (b.y - b.r); }); return l[0] && { x: l[0].x, tipo: l[0].tipo }; },
    velocidade: function (v) { velocidade = v; },
    colecao: function () { return Object.assign({}, colecao); }
  };
})();

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer jogar não baixa nada a mais. */
(function () {
  if (!/[?&]instalar\b/.test(location.search) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.src = '../instalar.js';
  s.setAttribute('data-nome', 'A Garra'); s.setAttribute('data-icone', 'icone-192.png');
  s.setAttribute('data-so-com', 'instalar'); s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
  document.body.appendChild(s);
})();
