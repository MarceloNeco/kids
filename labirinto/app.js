/* Labirinto — telas, câmera 3D, cachorrinho, desenhar o caminho, missão, festa e recordes.
   O gerador (gerador.js) faz o labirinto, as regras (regras.js) dizem por onde pode passar, o desenho (desenho.js)
   pinta. Aqui só junta tudo. Com ?teste aparece window.LabirintoDebug (usado pelos testes no navegador).
   Versão: APP_VERSION aqui = VERSAO no sw.js = primeira entrada do versoes.json. */
(function () {
  'use strict';
  var APP_VERSION = '0.2.4', APP_DATA = '07/Nov/2026';
  var $ = function (id) { return document.getElementById(id); };
  var BUSCA = location.search;
  var TESTE = /[?&]teste\b/.test(BUSCA);
  var SEMENTE_URL = (BUSCA.match(/[?&]semente=(\d+)/) || [])[1];
  var MISSAO_URL = (BUSCA.match(/[?&]missao=([01])/) || [])[1];
  var calmo = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var VEL = 3.5;                                                   // casas por segundo do cachorrinho (sempre igual, casa a casa)
  var LARGURA_RISCO = { quadrado: 0.26, redondo: 0.26, colmeia: 0.18 };
  var PAD = { x: 8, cima: 60, baixo: 58 };                         // folgas da tela (em cima a faixa da missão, embaixo o zoom e a música)
  // trilha: músicas animadas e "de aventura" que já moram na Purpurina e na Peluqueria (créditos em CREDITOS.md)
  var KM = 'Kevin MacLeod', CC = 'CC BY 4.0';
  var MUSICAS = [
    { a: '../purpurina/musicas/voxel-revolution.mp3', t: 'Voxel Revolution', au: KM, lic: CC },
    { a: '../peluqueria/musicas/digital-lemonade.mp3', t: 'Digital Lemonade', au: KM, lic: CC },
    { a: '../purpurina/musicas/shiny-tech.mp3', t: 'Shiny Tech', au: KM, lic: CC },
    { a: '../purpurina/musicas/neon-laser-horizon.mp3', t: 'Neon Laser Horizon', au: KM, lic: CC },
    { a: '../peluqueria/musicas/brightly-fancy.mp3', t: 'Brightly Fancy', au: KM, lic: CC },
    { a: '../purpurina/musicas/cloud-dancer.mp3', t: 'Cloud Dancer', au: KM, lic: CC },
    { a: '../peluqueria/musicas/getting-it-done.mp3', t: 'Getting it Done', au: KM, lic: CC },
    { a: '../purpurina/musicas/moonlight-beach.mp3', t: 'Moonlight Beach', au: KM, lic: CC },
    { a: '../purpurina/musicas/newer-wave.mp3', t: 'Newer Wave', au: KM, lic: CC },
    { a: '../peluqueria/musicas/beachfront-celebration.mp3', t: 'Beachfront Celebration', au: KM, lic: CC },
    // 0.2.1: saíram Pookatori and Friends e Laserpack (som de videogame, "Atari"); entraram duas de instrumentos de verdade
    { a: '../peluqueria/musicas/funky-chunk.mp3', t: 'Funky Chunk', au: KM, lic: CC },
    { a: '../peluqueria/musicas/stringed-disco.mp3', t: 'Stringed Disco', au: KM, lic: CC }
  ];

  /* ---------- preferências e recordes (no aparelho) ---------- */
  var CH_PREF = 'bolinho:labirinto:pref', CH_REC = 'bolinho:labirinto:recordes';
  function lerJSON(k, pad) { try { var v = JSON.parse(localStorage.getItem(k)); return v && typeof v === 'object' ? v : pad; } catch (e) { return pad; } }
  function gravarJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var pref = Object.assign({ forma: 'quadrado', nivel: 'facil', modo: 'andar', lingua: /^en/i.test(navigator.language || '') ? 'en' : 'pt', efeitos: true, surpresa: 0 }, lerJSON(CH_PREF, {}));
  if (window.BolinhoIdioma && !BolinhoIdioma.ingles()) pref.lingua = 'pt';   // só português sem o interruptor "ingles" (../idioma.js)
  function salvarPref() { gravarJSON(CH_PREF, pref); }
  var recordes = lerJSON(CH_REC, {});

  function t(pt, en) { return pref.lingua === 'en' ? en : pt; }
  function traduzir() {
    document.documentElement.lang = pref.lingua === 'en' ? 'en' : 'pt-BR';
    document.querySelectorAll('[data-t]').forEach(function (el) { var p = el.getAttribute('data-t').split('|'); el.textContent = pref.lingua === 'en' ? p[1] : p[0]; });
    $('btLingua').textContent = pref.lingua === 'en' ? 'PT' : 'EN';
    $('versao').textContent = t('Versão ', 'Version ') + APP_VERSION + ' · ' + APP_DATA;
    pintarRecordes();
    if (jogo) atualizarMissao();
  }

  var telaAtual = 'menu';
  function mostrar(id) { document.querySelectorAll('.tela').forEach(function (s) { s.classList.toggle('ativa', s.id === id); }); telaAtual = id; }

  /* ---------- menu ---------- */
  function marcar(grupo, attr, valor) {
    document.querySelectorAll('#' + grupo + ' [' + attr + ']').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute(attr) === valor)); });
  }
  function estrelasTexto(n) { return n ? '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n) : ''; }
  function pintarRecordes() {
    Gerador.NIVEIS.forEach(function (nv) {
      var formas = pref.forma === 'surpresa' ? Gerador.FORMAS : [pref.forma], melhor = 0;
      formas.forEach(function (f) { var r = recordes[f + '-' + nv]; if (r && r.e > melhor) melhor = r.e; });
      var el = document.querySelector('[data-rec="' + nv + '"]');
      el.textContent = estrelasTexto(melhor);
      el.setAttribute('aria-label', melhor ? t(melhor + ' estrelas', melhor + ' stars') : '');
    });
  }
  function pintarMenu() { marcar('formas', 'data-forma', pref.forma); marcar('niveis', 'data-nivel', pref.nivel); marcar('modos', 'data-modo', pref.modo); pintarRecordes(); }
  document.querySelectorAll('#formas [data-forma]').forEach(function (b) { b.addEventListener('click', function () { pref.forma = b.getAttribute('data-forma'); salvarPref(); pintarMenu(); Som.toque(); }); });
  document.querySelectorAll('#niveis [data-nivel]').forEach(function (b) { b.addEventListener('click', function () { pref.nivel = b.getAttribute('data-nivel'); salvarPref(); pintarMenu(); Som.toque(); }); });
  document.querySelectorAll('#modos [data-modo]').forEach(function (b) { b.addEventListener('click', function () { pref.modo = b.getAttribute('data-modo'); salvarPref(); pintarMenu(); Som.toque(); }); });
  $('btLingua').addEventListener('click', function () { pref.lingua = pref.lingua === 'en' ? 'pt' : 'en'; salvarPref(); traduzir(); });
  function pintarEfeitos() {
    $('btEfeitos').textContent = pref.efeitos ? '🔊' : '🔈';
    $('btEfeitos').setAttribute('aria-pressed', String(!!pref.efeitos));
    Som.ligar(pref.efeitos);
  }
  $('btEfeitos').addEventListener('click', function () { pref.efeitos = !pref.efeitos; salvarPref(); pintarEfeitos(); Som.toque(); });
  $('btAjuda').addEventListener('click', function () { var a = $('ajuda'); a.hidden = !a.hidden; $('btAjuda').setAttribute('aria-expanded', String(!a.hidden)); });
  $('btJogar').addEventListener('click', function () {
    Som.acordar();
    try {   // tela cheia no celular e no tablet (no botão de começar, como os outros jogos)
      var el = document.documentElement, pedir = el.requestFullscreen || el.webkitRequestFullscreen;
      if (pedir && matchMedia('(pointer: coarse)').matches && !document.fullscreenElement) { var p = pedir.call(el); if (p && p.catch) p.catch(function () {}); }
    } catch (e) {}
    entrarNoJogo();
  });

  /* ---------- telas do jogo e Voltar do celular ---------- */
  var empurrado = false;
  function entrarNoJogo() {
    mostrar('jogo');
    if (!empurrado) { try { history.pushState({ labirinto: 1 }, ''); empurrado = true; } catch (e) {} }
    novoJogo();
  }
  function irMenu() {
    fecharFim(); jogo = null; acao = null; dedos.clear(); pinca = null;
    if (window.Trilha) Trilha.volume(null);
    mostrar('menu'); pintarMenu();
  }
  window.addEventListener('popstate', function () { empurrado = false; if (telaAtual === 'jogo') irMenu(); });
  function voltarMenu() { if (empurrado) history.back(); else irMenu(); }
  // navegação padrão (../navegacao.js): 🏠 Início = voltar ao menu (o mesmo do Voltar do celular), 🚪 Saída
  if (window.BolinhoNav) BolinhoNav.iniciar({ jogo: 'labirinto', noInicio: function () { return telaAtual !== 'jogo'; }, irParaInicio: voltarMenu,
    emAndamento: function () { return telaAtual === 'jogo' && !!jogo && !jogo.venceu; } });
  $('btFimMenu').addEventListener('click', voltarMenu);
  $('btNovo').addEventListener('click', function () { Som.toque(); novoJogo(); });
  $('btDeNovo').addEventListener('click', function () { fecharFim(); novoJogo(); });
  $('btMaisDificil').addEventListener('click', function () {
    var i = Gerador.NIVEIS.indexOf(jogo ? jogo.L.nivel : pref.nivel);
    pref.nivel = Gerador.NIVEIS[Math.min(2, i + 1)]; salvarPref(); fecharFim(); novoJogo();
  });
  $('btModo').addEventListener('click', function () {
    pref.modo = pref.modo === 'andar' ? 'desenhar' : 'andar'; salvarPref(); Som.toque();
    novoJogo(true);   // o mesmo labirinto, do começo, no outro jeito
  });
  $('btDesfazer').addEventListener('click', function () { desfazer(false); });
  $('btApagar').addEventListener('click', function () { desfazer(true); });
  $('btMais').addEventListener('click', function () { zoomEm(1.35); });
  $('btMenos').addEventListener('click', function () { zoomEm(1 / 1.35); });
  $('btTudo').addEventListener('click', function () { if (!jogo) return; jogo.cam.z = jogo.zFit; prenderCam(); jogo.pausaSeguir = agora() + 4000; });

  /* ---------- canvas e câmera ---------- */
  var cvChao = $('chao'), cvAtores = $('atores'), gChao = cvChao.getContext('2d'), gAt = cvAtores.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  function medir() {
    var r = $('palco').getBoundingClientRect();
    PAD.cima = $('missao').offsetHeight + 14;   // a faixa da missão fica por cima do palco: o labirinto começa abaixo dela
    W = Math.max(1, r.width); H = Math.max(1, r.height); dpr = Math.min(window.devicePixelRatio || 1, 2);
    [cvChao, cvAtores].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    if (jogo) { jogo.cam.W = W; jogo.cam.H = H; jogo.zFit = zEncaixe(jogo.L); limitesZoom(); prenderCam(); jogo.chaoSujo = true; }
  }
  function agora() { return performance.now(); }
  function zEncaixe(L) {
    var l = L.limites;
    return Math.max(4, Math.min((W - 2 * PAD.x) / (l.x1 - l.x0 + 1.6), (H - PAD.cima - PAD.baixo) / (l.y1 - l.y0 + 1.6)));
  }
  function limitesZoom() { jogo.zMin = jogo.zFit * 0.85; jogo.zMax = Math.max(jogo.zFit * 1.6, 110); }
  function zDeJogo() { return jogo.zFit < 34 ? Math.min(jogo.zMax, 42) : jogo.zFit; }
  function prenderCam(cam) {
    cam = cam || jogo.cam;
    var l = jogo.L.limites, m = 0.8;   // folga para a setinha da entrada e a bandeira da saída
    cam.z = Math.max(jogo.zMin, Math.min(jogo.zMax, cam.z));
    var xmin = l.x0 - m + (W / 2 - PAD.x) / cam.z, xmax = l.x1 + m - (W / 2 - PAD.x) / cam.z;
    var ymin = l.y0 - m + (H / 2 - PAD.cima) / cam.z, ymax = l.y1 + m - (H / 2 - PAD.baixo) / cam.z;
    cam.cx = xmin > xmax ? (xmin + xmax) / 2 : Math.max(xmin, Math.min(xmax, cam.cx));
    cam.cy = ymin > ymax ? (ymin + ymax) / 2 : Math.max(ymin, Math.min(ymax, cam.cy));
    return cam;
  }
  function paraMundo(clientX, clientY) {
    var r = cvAtores.getBoundingClientRect(), cam = jogo.cam;
    return [(clientX - r.left - W / 2) / cam.z + cam.cx, (clientY - r.top - H / 2) / cam.z + cam.cy];
  }
  function paraTela(x, y) { var r = cvAtores.getBoundingClientRect(), p = Desenho.tela(jogo.cam, x, y); return [p[0] + r.left, p[1] + r.top]; }
  function zoomEm(f, sx, sy) {
    if (!jogo || jogo.intro) return;
    var cam = jogo.cam; sx = sx == null ? W / 2 : sx; sy = sy == null ? H / 2 : sy;
    var wx = (sx - W / 2) / cam.z + cam.cx, wy = (sy - H / 2) / cam.z + cam.cy;
    cam.z = Math.max(jogo.zMin, Math.min(jogo.zMax, cam.z * f));
    cam.cx = wx - (sx - W / 2) / cam.z; cam.cy = wy - (sy - H / 2) / cam.z;
    prenderCam(); jogo.glide = null; jogo.pausaSeguir = agora() + 2500;
  }

  /* ---------- partida ---------- */
  var jogo = null, contador = 0;
  function novoJogo(mesmo) {
    fecharFim();
    medir();
    var forma, nivel, semente;
    if (mesmo && jogo) { forma = jogo.L.forma; nivel = jogo.L.nivel; semente = jogo.L.semente; }
    else {
      forma = pref.forma; nivel = pref.nivel;
      if (forma === 'surpresa') { forma = Gerador.FORMAS[(pref.surpresa || 0) % 3]; pref.surpresa = (pref.surpresa || 0) + 1; salvarPref(); }
      semente = SEMENTE_URL ? (+SEMENTE_URL + contador) >>> 0 : (Math.random() * 4294967295) >>> 0;
      contador++;
    }
    var retrato = H >= W * 0.9, missao = MISSAO_URL == null ? undefined : MISSAO_URL === '1';
    if (mesmo && jogo) { missao = jogo.L.item >= 0; if (jogo.L.forma === 'quadrado') retrato = jogo.L.cols <= jogo.L.linhas; }
    var L = Gerador.criar({ forma: forma, nivel: nivel, semente: semente, retrato: retrato, missao: missao });
    Desenho.preparar(L);
    var ini = L.celulas[L.inicio];
    jogo = {
      L: L, P: Regras.partida(L), C: Regras.colisor(L, Regras.RAIO[L.forma]), modo: pref.modo,
      cam: { cx: 0, cy: 0, z: 10, W: W, H: H }, zFit: 1, chaoSujo: true, ultCam: '',
      cao: { de: L.inicio, para: -1, u: 0, fila: [], x: ini.x, y: ini.y, dir: 1, puloT: -1e9, saida: null, fase: 0, incl: 0, mx: 0, my: 0, hmmT: -1e9 },
      visao: null, poeira: [],
      risco: [[ini.x, ini.y]], tracos: [], bloqueado: false, ultimaCasa: L.inicio,
      intro: null, glide: null, relogio0: 0, tempo: 0, venceu: false, portaT: L.item < 0 ? -1e9 : null, voo: null,
      trancadaT: -1e9, bateT: -1e9, dicaPontaT: -1e9, pausaSeguir: 0, part: new Desenho.Particulas(), fogos: []
    };
    atualizarMissao(); PAD.cima = $('missao').offsetHeight + 14;
    jogo.zFit = zEncaixe(L); limitesZoom();
    jogo.cam.z = jogo.zFit; jogo.cam.cx = (L.limites.x0 + L.limites.x1) / 2; jogo.cam.cy = (L.limites.y0 + L.limites.y1) / 2; prenderCam();
    var fundo = Desenho.TEMAS[L.forma].fundo;
    $('jogo').style.background = 'radial-gradient(circle at 50% 45%, ' + fundo[0] + ', ' + fundo[1] + ')';
    $('jogo').classList.toggle('desenho', jogo.modo === 'desenhar');
    $('btModo').textContent = jogo.modo === 'andar' ? '✏️' : '🐶';
    $('btModo').setAttribute('aria-label', jogo.modo === 'andar' ? t('Trocar para desenhar o caminho', 'Switch to drawing the path') : t('Trocar para levar o cachorrinho', 'Switch to walking the puppy'));
    $('relogio').textContent = '0:00';
    comecarIntro();
    if (jogo.modo === 'desenhar') dica(t('Arraste o cachorrinho pelo caminho ✏️', 'Drag the puppy along the path ✏️'), 3500);
    else dica(t('Toque onde o cachorrinho consegue ver, em linha reta 🐶', 'Tap where the puppy can see in a straight line 🐶'), 3500);
  }

  // abertura em 3D: a câmera vem do alto, girando e chegando perto, e as paredes sobem de dentro para fora
  function comecarIntro() {
    var dur = calmo ? 0 : 1700, mundo = $('mundo');
    jogo.intro = { t0: agora(), dur: dur };
    if (mundo.animate) {
      if (calmo) mundo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: 'ease-out' });
      else mundo.animate([
        { transform: 'perspective(900px) translateY(-8%) rotateX(62deg) rotateZ(-28deg) scale(.38)', opacity: 0 },
        { opacity: 1, offset: 0.2 },
        { transform: 'perspective(900px) translateY(0) rotateX(0deg) rotateZ(0deg) scale(1)', opacity: 1 }
      ], { duration: dur, easing: 'cubic-bezier(.2,.75,.25,1)' });
    }
  }
  function fimDaIntro() {
    jogo.intro = null; jogo.chaoSujo = true;
    var z = zDeJogo();
    if (Math.abs(z - jogo.cam.z) > 0.5) {   // labirinto grande: a câmera desce até o cachorrinho
      var ini = jogo.L.celulas[jogo.L.inicio], para = prenderCam({ cx: ini.x, cy: ini.y, z: z });
      if (calmo) { jogo.cam.cx = para.cx; jogo.cam.cy = para.cy; jogo.cam.z = para.z; }
      else jogo.glide = { t0: agora(), dur: 800, de: { cx: jogo.cam.cx, cy: jogo.cam.cy, z: jogo.cam.z }, para: para };
    }
  }
  function ligarRelogio() { if (!jogo.relogio0 && !jogo.venceu) jogo.relogio0 = agora(); }
  document.addEventListener('visibilitychange', function () {
    if (!jogo || !jogo.relogio0 || jogo.venceu) return;
    if (document.hidden) jogo.escondidoEm = agora(); else if (jogo.escondidoEm) { jogo.relogio0 += agora() - jogo.escondidoEm; jogo.escondidoEm = 0; }
  });
  function relogioTexto(seg) { seg = Math.floor(seg); return Math.floor(seg / 60) + ':' + ('0' + seg % 60).slice(-2); }

  function itemInfo() { return Desenho.ITENS[jogo.L.tipoItem]; }
  function atualizarMissao() {
    var L = jogo.L, it = itemInfo(), el = $('missao'), txt;
    if (jogo.venceu) txt = t('🎉 Você conseguiu!', '🎉 You did it!');
    else if (L.item >= 0 && !jogo.P.pegouItem) txt = t('Missão: pegue ' + it.pt + ' ' + it.em + ' no meio e depois ache a saída!', 'Mission: grab ' + it.en + ' ' + it.em + ' in the middle, then find the exit!');
    else if (L.item >= 0) txt = t('A saída abriu! Corra para lá 🚪✨', 'The exit is open! Run there 🚪✨');
    else if (L.bordaSaida < 0) txt = t('Chegue até a bandeira no meio 🏁', 'Reach the flag in the middle 🏁');
    else txt = t('Ache a saída 🏁', 'Find the exit 🏁');
    el.textContent = txt;
    el.classList.toggle('pronta', L.item >= 0 && jogo.P.pegouItem);
  }
  var dicaTimer = 0;
  function dica(txt, ms) {
    var el = $('dica'); el.textContent = txt; el.hidden = false;
    clearTimeout(dicaTimer); dicaTimer = setTimeout(function () { el.hidden = true; }, ms || 2500);
  }
  function pulsarMissao() { var el = $('missao'); el.classList.remove('pulso'); void el.offsetWidth; el.classList.add('pulso'); }

  /* ---------- eventos da missão ---------- */
  function evento(ev, mudo) {
    if (!ev) return;
    if (ev === 'item') { if (mudo) jogo.portaT = -1e9; else festaItem(); }
    else if (ev === 'trancada') { if (!mudo) trancada(); }
    else if (ev === 'venceu') vitoria();
    atualizarMissao();
  }
  function centroTela(c) { var p = jogo.L.celulas[c]; return Desenho.tela(jogo.cam, p.x, p.y); }
  function festaItem() {
    Som.item(); pulsarMissao();
    jogo.cao.puloT = agora();
    var it = itemInfo();
    dica(t('Você pegou ' + it.pt + '! ' + it.em + ' A saída abriu!', 'You got ' + it.en + '! ' + it.em + ' The exit is open!'), 2600);
    if (calmo) { jogo.portaT = agora() - 2000; return; }
    var s = centroTela(jogo.L.item);
    jogo.part.explosao(s[0], s[1], 70, 320);
    jogo.voo = { t0: agora(), dur: 1000 };   // uma estrelinha voa do item até a porta, e a porta abre brilhando
  }
  function trancada() {
    if (agora() - jogo.trancadaT < 1200) return;
    jogo.trancadaT = agora(); Som.trancada();
    var it = itemInfo();
    dica(t('🔒 A saída está trancada! Pegue primeiro ' + it.pt + ' ' + it.em, '🔒 The exit is locked! First grab ' + it.en + ' ' + it.em), 2600);
  }
  function vitoria() {
    var g = jogo; g.venceu = true; acao = null;
    if (!g.relogio0) g.relogio0 = agora();
    g.tempo = (agora() - g.relogio0) / 1000;
    $('relogio').textContent = relogioTexto(g.tempo);
    var casas = Regras.casasDoCaminho(g.L), e = Regras.estrelas(g.tempo, casas), k = g.L.forma + '-' + g.L.nivel, r = recordes[k] || {}, novo = false;
    if (!r.t || g.tempo < r.t) { r.t = Math.round(g.tempo * 10) / 10; novo = !!recordes[k]; }
    r.e = Math.max(r.e || 0, e); r.vezes = (r.vezes || 0) + 1; recordes[k] = r; gravarJSON(CH_REC, recordes);
    g.resultado = { estrelas: e, tempo: g.tempo, novo: novo };
    Som.vitoria(); if (window.Trilha) { Trilha.volume(0.35); setTimeout(function () { Trilha.volume(null); }, 3000); }
    g.cao.puloT = agora(); g.cao.festa = true;
    var bs = g.L.bordaSaida;
    if (bs >= 0 && !calmo) {   // o cachorrinho sai pela porta
      var pts = g.L.arestas[bs].pts, m = pts[Math.floor(pts.length / 2)], c = g.L.celulas[g.L.saida], nx = m[0] - c.x, ny = m[1] - c.y, d = Math.hypot(nx, ny) || 1;
      g.cao.saida = { t0: agora(), dur: 700, de: [g.cao.x, g.cao.y], para: [m[0] + nx / d * 0.7, m[1] + ny / d * 0.7] };
    }
    if (!calmo) { g.part.chuva(W, 140); for (var i = 0; i < 6; i++) g.fogos.push(agora() + i * 380); }
    setTimeout(function () { if (jogo === g) mostrarFim(); }, calmo ? 400 : 1700);
  }
  function mostrarFim() {
    var r = jogo.resultado, el = $('fimEstrelas');
    el.innerHTML = '';
    for (var i = 0; i < 3; i++) { var s = document.createElement('span'); s.textContent = '⭐'; if (i >= r.estrelas) s.className = 'apagada'; el.appendChild(s); }
    el.setAttribute('aria-label', t(r.estrelas + ' de 3 estrelas', r.estrelas + ' of 3 stars'));
    $('fimTexto').textContent = t('Tempo: ', 'Time: ') + relogioTexto(r.tempo) + (r.novo ? t(' · Novo recorde! 🏆', ' · New record! 🏆') : '');
    $('btMaisDificil').hidden = jogo.L.nivel === 'dificil';
    $('fim').hidden = false; traduzirFim();
    $('btDeNovo').focus();
  }
  function traduzirFim() { document.querySelectorAll('#fim [data-t]').forEach(function (el) { var p = el.getAttribute('data-t').split('|'); el.textContent = pref.lingua === 'en' ? p[1] : p[0]; }); }
  function fecharFim() { $('fim').hidden = true; }

  /* ---------- cachorrinho andando ---------- */
  function destinoFinal() { var c = jogo.cao; return c.fila.length ? c.fila[c.fila.length - 1] : c.para >= 0 ? c.para : c.de; }
  // toque (ou dedo arrastando) numa casa: ele só vai se ENXERGA a casa em linha reta, sem virar; se tem parede no meio,
  // anda até a parede e para. Andando, olha a partir da casa para onde está indo (ou volta, se o alvo ficou para trás).
  // calado = dedo arrastando ou chegando numa casa: se não enxerga, só segue o que já ia fazer (sem o "hmm?")
  function mirar(alvo, calado) {
    var c = jogo.cao, L = jogo.L, olho = c.para >= 0 ? c.para : c.de;
    if (alvo === olho) { c.fila = []; return; }
    var r = Regras.reta(L, olho, alvo);
    if (c.para >= 0 && (!r || r.caminho.length < 2)) {   // atrás dele, a partir da casa de onde saiu?
      var r2 = Regras.reta(L, c.de, alvo);
      if (alvo === c.de || (r2 && r2.caminho.length > 1 && r2.caminho[1] !== c.para)) {
        var x = c.de; c.de = c.para; c.para = x; c.u = 1 - c.u;   // meia-volta no meio do corredor
        c.fila = alvo === c.para ? [] : r2.caminho.slice(1);
        return;
      }
    }
    if (r && r.caminho.length > 1) {
      if (jogo.visao) { jogo.visao = null; $('dica').hidden = true; }   // achou onde ir: apaga a dica do "hmm?"
      if (c.para >= 0 && r.caminho[1] === c.de) { var y = c.de; c.de = c.para; c.para = y; c.u = 1 - c.u; c.fila = r.caminho.slice(2); }
      else c.fila = r.caminho.slice(1);
      return;
    }
    if (r) c.fila = [];   // a reta bate logo na parede: fica onde está (ou termina o passo)
    if (!calado) hmm(olho);
  }
  // dedo arrastando: o cachorrinho segue o rastro do dedo, sempre em linha reta: vai para a casa MAIS RECENTE do rastro
  // que ele enxerga daqui (assim dobra as esquinas por onde o dedo passou, nunca por conta própria)
  function seguirDedo() {
    var c = jogo.cao, tr = acao.trilha, olho = c.para >= 0 ? c.para : c.de;
    for (var k = tr.length - 1; k >= 0; k--) {
      var r = tr[k] === olho ? null : Regras.reta(jogo.L, olho, tr[k]);
      if (tr[k] === olho || (r && r.chegou)) { if (r) mirar(tr[k], true); tr.splice(0, k); return; }
    }
    mirar(tr[tr.length - 1], true);   // nada do rastro à vista: a regra do toque (em linha reta, até a parede)
  }
  // "hmm?": não enxerga até lá. Inclina a cabeça, faz um somzinho e as casas que ele VÊ brilham um pouco
  function hmm(olho) {
    var g = jogo, ag = agora();
    g.visao = { t0: ag, casas: Regras.visiveis(g.L, olho) };
    if (ag - g.cao.hmmT < 700) return;
    g.cao.hmmT = ag; Som.hmm();
    dica(t('Hmm? Daqui ele não vê até lá. Toque onde brilhar ✨', 'Hmm? He can\'t see that far from here. Tap where it glows ✨'), 2200);
  }
  function posEntre(a, b, u) {
    var A = jogo.L.celulas[a], B = jogo.L.celulas[b];
    if (jogo.L.forma === 'redondo' && A.anel > 0 && B.anel > 0) {   // no redondo anda pela curva
      var da = B.ang - A.ang; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      var r = A.raio + (B.raio - A.raio) * u, an = A.ang + da * u;
      return [r * Math.cos(an), r * Math.sin(an)];
    }
    return [A.x + (B.x - A.x) * u, A.y + (B.y - A.y) * u];
  }
  function passoCao(dt, ag) {
    var c = jogo.cao, L = jogo.L;
    if (c.saida) {
      var k = Math.min(1, (ag - c.saida.t0) / c.saida.dur);
      c.x = c.saida.de[0] + (c.saida.para[0] - c.saida.de[0]) * k; c.y = c.saida.de[1] + (c.saida.para[1] - c.saida.de[1]) * k;
      if (c.saida.para[0] !== c.saida.de[0]) c.dir = c.saida.para[0] > c.saida.de[0] ? 1 : -1;
      c.fase += dt * VEL * Math.PI * 2;
      return;
    }
    c.incl += ((c.para >= 0 ? c.my * 0.22 : 0) - c.incl) * Math.min(1, dt * 10);   // subindo: focinho para cima; descendo: para baixo
    if (jogo.modo !== 'andar' || jogo.venceu) return;
    var pausa = calmo ? 200 : 850;
    if (ag - c.puloT < pausa) return;   // parado comemorando
    if (c.para < 0) { if (!c.fila.length) return; c.para = c.fila.shift(); c.u = 0; }
    var du = dt * VEL * (jogo.vel || 1), f0 = c.fase;
    c.u += du; c.fase += du * Math.PI * 2;   // uma passada inteira (as quatro patas) por casa
    if (!calmo && Math.floor(c.fase / Math.PI) !== Math.floor(f0 / Math.PI)) poeira();
    if (c.u >= 1) {
      var sobra = c.u - 1, B = L.celulas[c.para];
      c.de = c.para; c.para = -1; c.u = 0; c.x = B.x; c.y = B.y;
      Som.passo();
      evento(jogo.P.chegou(c.de));
      if (acao && acao.trilha && acao.trilha.length && jogo.modo === 'andar') seguirDedo();   // dedo ainda na tela: olha de novo para ele
      if (jogo.venceu || !c.fila.length || agora() - c.puloT < pausa) return;
      c.para = c.fila.shift(); c.u = Math.min(sobra, 0.99);   // segue sem parar entre as casas
    }
    var p = posEntre(c.de, c.para, c.u), mx = p[0] - c.x, my = p[1] - c.y, md = Math.hypot(mx, my);
    if (md > 1e-5) {
      c.mx = mx / md; c.my = my / md;
      if (Math.abs(mx) > Math.abs(my) * 0.35) c.dir = mx > 0 ? 1 : -1;   // subindo ou descendo reto: continua virado para o mesmo lado
    }
    c.x = p[0]; c.y = p[1];
  }
  function poeira() {   // nuvenzinha de poeira atrás das patas
    var c = jogo.cao;
    jogo.poeira.push({ x: c.x - c.mx * 0.22 + (Math.random() - 0.5) * 0.1, y: c.y + 0.22 - c.my * 0.1, t0: agora() });
    if (jogo.poeira.length > 24) jogo.poeira.shift();
  }

  /* ---------- desenhar o caminho ---------- */
  function ponta() { return jogo.risco[jogo.risco.length - 1]; }
  function pertoDaPonta(w) { var p = ponta(); return Math.hypot(w[0] - p[0], w[1] - p[1]) <= Math.max(0.7, 34 / jogo.cam.z); }
  function visitar(a, b, mudo) {   // casas por onde o risco a→b passou (o risco é livre de parede, então são vizinhas)
    var n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.08));
    for (var k = 1; k <= n; k++) {
      var c = Regras.celulaEm(jogo.L, a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n);
      if (c >= 0 && c !== jogo.ultimaCasa) { jogo.ultimaCasa = c; if (!mudo) Som.passo(); evento(jogo.P.chegou(c), mudo); if (jogo.venceu) return; }
    }
  }
  function estender(w) {
    if (jogo.venceu) return;
    var p = ponta(), r = jogo.C.avancar(p, w);
    if (Math.hypot(r.pt[0] - p[0], r.pt[1] - p[1]) > 0.004) {
      if (acao && acao.novoTraco) { jogo.tracos.push(jogo.risco.length); acao.novoTraco = false; }
      jogo.risco.push(r.pt);
      if (Math.abs(r.pt[0] - p[0]) > 0.01) jogo.cao.dir = r.pt[0] > p[0] ? 1 : -1;
      visitar(p, r.pt, false);
    }
    if (r.bateu && !jogo.venceu) {
      if (!jogo.bloqueado) { jogo.bateT = agora(); Som.bate(); if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) {} dica(t('Ops, parede! Volte o dedo até a ponta da linha ✨', 'Oops, a wall! Bring your finger back to the tip of the line ✨'), 2400); }
      jogo.bloqueado = true;
    }
  }
  function desfazer(tudo) {
    if (!jogo || jogo.venceu || jogo.modo !== 'desenhar') return;
    if (tudo) { jogo.risco.length = 1; jogo.tracos = []; }
    else if (jogo.tracos.length) jogo.risco.length = Math.max(1, jogo.tracos.pop());
    else return;
    Som.toque(); jogo.bloqueado = false;
    // refaz a missão pelo que sobrou da linha (se apagou o trecho do item, o item volta e a porta fecha)
    var tinha = jogo.P.pegouItem;
    jogo.P = Regras.partida(jogo.L); jogo.ultimaCasa = jogo.L.inicio;
    for (var k = 1; k < jogo.risco.length; k++) visitar(jogo.risco[k - 1], jogo.risco[k], true);
    if (tinha && !jogo.P.pegouItem) { jogo.portaT = null; jogo.voo = null; }
    atualizarMissao();
  }
  // setas no modo desenhar: a ponta vai até a casa vizinha aberta, passando pelo meio da passagem
  function setaDesenho(dx, dy) {
    var c = Regras.celulaEm(jogo.L, ponta()[0], ponta()[1]), v = c < 0 ? -1 : Regras.vizinhoNaDirecao(jogo.L, c, dx, dy);
    if (v < 0) { Som.bate(); return; }
    var pts = jogo.L.arestas[Regras.arestaEntre(jogo.L, c, v)].pts, meio = pts[Math.floor(pts.length / 2)];
    if (pts.length === 2) meio = [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2];
    var C = jogo.L.celulas[c], V = jogo.L.celulas[v];
    acao = { novoTraco: true, teclado: true };
    jogo.bloqueado = false;
    estender([C.x, C.y]); estender(meio); estender([V.x, V.y]);
    acao = null; jogo.bloqueado = false;
  }

  /* ---------- toques, mouse e pinça ---------- */
  var dedos = new Map(), pinca = null, acao = null;
  function comecarPinca() {
    var ps = Array.from(dedos.values()), a = ps[0], b = ps[1], r = cvAtores.getBoundingClientRect();
    pinca = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: jogo.cam.z, mx: (a.x + b.x) / 2 - r.left, my: (a.y + b.y) / 2 - r.top, cx0: jogo.cam.cx, cy0: jogo.cam.cy };
    acao = null; jogo.glide = null;
  }
  function moverPinca() {
    var ps = Array.from(dedos.values()); if (ps.length < 2) return;
    var a = ps[0], b = ps[1], r = cvAtores.getBoundingClientRect(), cam = jogo.cam;
    var d = Math.hypot(a.x - b.x, a.y - b.y) || 1, mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
    var wx = (pinca.mx - W / 2) / pinca.z0 + pinca.cx0, wy = (pinca.my - H / 2) / pinca.z0 + pinca.cy0;
    cam.z = Math.max(jogo.zMin, Math.min(jogo.zMax, pinca.z0 * d / pinca.d0));
    cam.cx = wx - (mx - W / 2) / cam.z; cam.cy = wy - (my - H / 2) / cam.z;
    prenderCam(); jogo.pausaSeguir = agora() + 2500;
  }
  function podeMexer() { return jogo && !jogo.intro && !jogo.glide && !jogo.venceu && $('fim').hidden; }
  cvAtores.addEventListener('pointerdown', function (e) {
    if (!jogo || jogo.intro || jogo.venceu) return;
    e.preventDefault();
    try { cvAtores.setPointerCapture(e.pointerId); } catch (er) {}
    dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    Som.acordar();
    if (dedos.size === 2) { comecarPinca(); return; }
    if (dedos.size > 2 || !podeMexer()) return;
    var w = paraMundo(e.clientX, e.clientY);
    if (jogo.modo === 'andar') {
      acao = { id: e.pointerId, alvo: -1, sx: e.clientX, sy: e.clientY, trilha: [] };
      var c = Regras.celulaEm(jogo.L, w[0], w[1]);
      if (c >= 0) { ligarRelogio(); acao.alvo = c; acao.trilha.push(c); mirar(c, false); }
    } else {
      acao = { id: e.pointerId, novoTraco: true, esperando: !pertoDaPonta(w), sx: e.clientX, sy: e.clientY };
      if (acao.esperando) { jogo.dicaPontaT = agora(); dica(t('Comece pela ponta da linha, onde está o cachorrinho 🐶', 'Start from the tip of the line, where the puppy is 🐶'), 2400); }
      else { jogo.bloqueado = false; ligarRelogio(); estender(w); }
    }
  });
  function moverAcao(clientX, clientY) {
    if (!acao || !podeMexer()) return;
    var w = paraMundo(clientX, clientY);
    if (jogo.modo === 'andar') {
      var c = Regras.celulaEm(jogo.L, w[0], w[1]);
      if (c >= 0 && c !== acao.alvo) {   // arrastando: a mesma regra, casa a casa, seguindo o rastro do dedo
        ligarRelogio(); acao.alvo = c; acao.trilha.push(c); if (acao.trilha.length > 300) acao.trilha.shift(); seguirDedo();
      }
      return;
    }
    if (acao.esperando || jogo.bloqueado) {
      if (!pertoDaPonta(w)) return;
      acao.esperando = false; jogo.bloqueado = false; ligarRelogio();
    }
    estender(w);
  }
  cvAtores.addEventListener('pointermove', function (e) {
    if (!dedos.has(e.pointerId)) return;
    dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinca) { moverPinca(); return; }
    if (acao && acao.id === e.pointerId) {
      acao.sx = e.clientX; acao.sy = e.clientY;
      var lista = e.getCoalescedEvents ? e.getCoalescedEvents() : null;   // todos os pontinhos do dedo rápido
      if (lista && lista.length > 1) lista.forEach(function (q) { moverAcao(q.clientX, q.clientY); });
      else moverAcao(e.clientX, e.clientY);
    }
  });
  function soltar(e) {
    dedos.delete(e.pointerId);
    if (pinca && dedos.size < 2) pinca = null;
    if (acao && acao.id === e.pointerId) acao = null;
  }
  cvAtores.addEventListener('pointerup', soltar);
  cvAtores.addEventListener('pointercancel', soltar);
  cvAtores.addEventListener('wheel', function (e) {
    if (!jogo) return; e.preventDefault();
    var r = cvAtores.getBoundingClientRect();
    zoomEm(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });

  document.addEventListener('keydown', function (e) {
    if (!$('fim').hidden && (e.key === 'Escape' || e.key === 'GoBack' || e.keyCode === 461)) { e.preventDefault(); voltarMenu(); return; }
    if (telaAtual !== 'jogo' || !jogo) return;
    if (e.key === 'Escape' || e.key === 'GoBack' || e.keyCode === 461) { e.preventDefault(); voltarMenu(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); desfazer(false); return; }
    var dir = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[e.key];
    if (!dir || !podeMexer()) return;
    e.preventDefault(); Som.acordar(); ligarRelogio();
    if (jogo.modo === 'andar') {
      var c = jogo.cao; if (c.fila.length > 1) return;
      var v = Regras.vizinhoNaDirecao(jogo.L, destinoFinal(), dir[0], dir[1]);
      if (v >= 0) c.fila.push(v); else Som.bate();
    } else setaDesenho(dir[0], dir[1]);
  });

  /* ---------- quadro a quadro ---------- */
  var antes = agora();
  function quadro() {
    var ag = agora(), dt = Math.min(0.05, (ag - antes) / 1000); antes = ag;
    if (telaAtual === 'jogo' && jogo) passoJogo(ag, dt);
    else if (telaAtual === 'menu') mascote(ag);
    requestAnimationFrame(quadro);
  }
  function passoJogo(ag, dt) {
    var g = jogo, cam = g.cam, alt = 1, rev = 1;
    if (g.intro) {
      var p = g.intro.dur ? Math.min(1, (ag - g.intro.t0) / g.intro.dur) : 1;
      alt = 1 - Math.pow(1 - p, 3); rev = p; g.chaoSujo = true;
      if (p >= 1) fimDaIntro();
    } else if (g.glide) {
      var k = Math.min(1, (ag - g.glide.t0) / g.glide.dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      cam.cx = g.glide.de.cx + (g.glide.para.cx - g.glide.de.cx) * e; cam.cy = g.glide.de.cy + (g.glide.para.cy - g.glide.de.cy) * e; cam.z = g.glide.de.z + (g.glide.para.z - g.glide.de.z) * e;
      if (k >= 1) g.glide = null;
    }
    passoCao(dt, ag);
    if (g.modo === 'desenhar' && !g.cao.saida) { var tp = ponta(); g.cao.x = tp[0]; g.cao.y = tp[1]; }
    // câmera segue o cachorrinho quando o labirinto não cabe inteiro na tela
    if (!g.intro && !g.glide && !pinca && ag > g.pausaSeguir && cam.z > g.zFit * 1.08) {
      if (g.modo === 'andar' || g.cao.saida) {
        var f = 1 - Math.exp(-dt * 3.5);
        cam.cx += (g.cao.x - cam.cx) * f; cam.cy += (g.cao.y - cam.cy) * f; prenderCam();
      } else if (acao && acao.sx != null) {   // desenhando perto da borda: a tela anda devagar para aquele lado
        var r = cvAtores.getBoundingClientRect(), sx = acao.sx - r.left, sy = acao.sy - r.top, m = 56, vx = 0, vy = 0;
        if (sx < m) vx = -(m - sx); else if (sx > W - m) vx = sx - (W - m);
        if (sy < m + PAD.cima) vy = -(m + PAD.cima - sy); else if (sy > H - m) vy = sy - (H - m);
        if (vx || vy) { cam.cx += vx * dt * 6 / cam.z; cam.cy += vy * dt * 6 / cam.z; prenderCam(); moverAcao(acao.sx, acao.sy); }
      } else if (!acao) {   // dedo fora da tela e a ponta da linha sumiu da vista: a câmera volta para ela
        var pt = Desenho.tela(cam, g.cao.x, g.cao.y);
        if (pt[0] < 40 || pt[0] > W - 40 || pt[1] < 40 || pt[1] > H - 70) {
          var f2 = 1 - Math.exp(-dt * 3);
          cam.cx += (g.cao.x - cam.cx) * f2; cam.cy += (g.cao.y - cam.cy) * f2; prenderCam();
        }
      }
    }
    if (g.relogio0 && !g.venceu) $('relogio').textContent = relogioTexto((ag - g.relogio0) / 1000);
    // estrelinha voando do item até a porta
    if (g.voo && ag - g.voo.t0 >= g.voo.dur) {
      g.voo = null; g.portaT = ag; Som.porta();
      var bs = g.L.bordaSaida;
      if (bs >= 0) { var pts = g.L.arestas[bs].pts, mm = pts[Math.floor(pts.length / 2)], st = Desenho.tela(cam, mm[0], mm[1]); g.part.explosao(st[0], st[1], 50, 260, 'brilho'); }
    }
    while (g.fogos.length && g.fogos[0] <= ag) { g.fogos.shift(); g.part.explosao(W * (0.2 + Math.random() * 0.6), H * (0.15 + Math.random() * 0.4), 45, 300); }
    g.part.passo(dt);
    var chave = cam.cx.toFixed(3) + ',' + cam.cy.toFixed(3) + ',' + cam.z.toFixed(3) + ',' + W + ',' + H;
    if (g.chaoSujo || chave !== g.ultCam) { Desenho.chao(gChao, g.L, cam, dpr, { altura: alt, revela: rev }); g.chaoSujo = !!g.intro; g.ultCam = chave; }
    atores(ag);
  }

  function atores(ag) {
    var g = jogo, L = g.L, cam = g.cam, ctx = gAt, T = Desenho.TEMAS[L.forma], s = ag / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    if (g.intro && g.intro.dur && ag - g.intro.t0 < g.intro.dur * 0.6) return;
    Desenho.mundoParaTela(ctx, cam, dpr);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    var px = 1 / cam.z;
    // entrada: setinha verde apontando para dentro
    var e0 = L.arestas[L.bordaInicio].pts, a0 = e0[0], b0 = e0[e0.length - 1], m0 = e0[Math.floor(e0.length / 2)];
    if (e0.length === 2) m0 = [(a0[0] + b0[0]) / 2, (a0[1] + b0[1]) / 2];
    var ci = L.celulas[L.inicio], nx = m0[0] - ci.x, ny = m0[1] - ci.y, nd = Math.hypot(nx, ny) || 1; nx /= nd; ny /= nd;
    var ax = m0[0] + nx * (0.35 + Math.sin(s * 4) * 0.05), ay = m0[1] + ny * (0.35 + Math.sin(s * 4) * 0.05);
    ctx.fillStyle = '#c6ff3d'; ctx.beginPath();
    ctx.moveTo(ax - nx * 0.22, ay - ny * 0.22); ctx.lineTo(ax + nx * 0.12 - ny * 0.2, ay + ny * 0.12 + nx * 0.2); ctx.lineTo(ax + nx * 0.12 + ny * 0.2, ay + ny * 0.12 - nx * 0.2); ctx.closePath(); ctx.fill();
    // saída: porta trancada (cadeado) ou aberta (brilho) e a bandeira
    var aberta = g.P.saidaAberta() && g.portaT != null, kp = aberta ? Math.min(1, (ag - g.portaT) / 800) : 0;
    if (L.bordaSaida >= 0) {
      var ps = L.arestas[L.bordaSaida].pts, ms = ps.length === 2 ? [(ps[0][0] + ps[1][0]) / 2, (ps[0][1] + ps[1][1]) / 2] : ps[Math.floor(ps.length / 2)];
      var cs = L.celulas[L.saida], ox = ms[0] - cs.x, oy = ms[1] - cs.y, od = Math.hypot(ox, oy) || 1; ox /= od; oy /= od;
      var linhaPorta = function () { ctx.beginPath(); ctx.moveTo(ps[0][0], ps[0][1]); for (var i = 1; i < ps.length; i++) ctx.lineTo(ps[i][0], ps[i][1]); };
      if (kp < 1) {
        ctx.globalAlpha = 1 - kp; ctx.strokeStyle = '#ff5d73'; ctx.lineWidth = 0.2; linhaPorta(); ctx.stroke();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.06; ctx.setLineDash([0.12, 0.12]); linhaPorta(); ctx.stroke(); ctx.setLineDash([]);
        var bal = ag - g.trancadaT < 600 ? Math.sin((ag - g.trancadaT) / 30) * 0.3 : 0;
        Desenho.cadeado(ctx, ms[0] + ox * 0.32, ms[1] + oy * 0.32 - kp * 0.6, 0.55, bal);
        ctx.globalAlpha = 1;
      }
      if (aberta) {
        var brilho = 0.5 + 0.5 * Math.sin(s * 5);
        ctx.save(); ctx.shadowColor = '#ffe066'; ctx.shadowBlur = 18 * kp;
        ctx.strokeStyle = 'rgba(255,224,102,' + (0.55 + 0.45 * brilho) * kp + ')'; ctx.lineWidth = 0.16; linhaPorta(); ctx.stroke();
        ctx.restore();
        if (!calmo) {
          ctx.strokeStyle = 'rgba(255,240,170,' + 0.5 * kp + ')'; ctx.lineWidth = 0.05; ctx.beginPath();
          for (var rr = 0; rr < 7; rr++) { var an = s * 0.8 + rr * Math.PI * 2 / 7, l0 = 0.35, l1 = 0.6 + 0.15 * Math.sin(s * 3 + rr); ctx.moveTo(ms[0] + Math.cos(an) * l0, ms[1] + Math.sin(an) * l0); ctx.lineTo(ms[0] + Math.cos(an) * l1, ms[1] + Math.sin(an) * l1); }
          ctx.stroke();
        }
      }
      Desenho.bandeira(ctx, ms[0] + ox * 0.62, ms[1] + oy * 0.62, 0.7, s);
    } else {
      var cc = L.celulas[L.saida];
      ctx.fillStyle = 'rgba(198,255,61,' + (0.25 + 0.15 * Math.sin(s * 4)) + ')'; ctx.beginPath(); ctx.arc(cc.x, cc.y, 0.6, 0, Math.PI * 2); ctx.fill();
      Desenho.bandeira(ctx, cc.x + 0.05, cc.y, 0.8, s);
    }
    // item da missão
    if (L.item >= 0 && !g.P.pegouItem) { var it = L.celulas[L.item]; Desenho.item(ctx, L.tipoItem, it.x, it.y, 0.75, s); }
    // a linha desenhada
    if (g.modo === 'desenhar' && g.risco.length > 1) {
      var lw = Math.max(LARGURA_RISCO[L.forma], 5 * px);
      ctx.beginPath(); ctx.moveTo(g.risco[0][0], g.risco[0][1]); for (var q = 1; q < g.risco.length; q++) ctx.lineTo(g.risco[q][0], g.risco[q][1]);
      ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = lw + 3 * px; ctx.stroke();
      ctx.strokeStyle = T.risco; ctx.lineWidth = lw; ctx.stroke();
    }
    // ponta da linha: anel que pisca (forte quando bateu na parede) e pontilhado do dedo até ela
    if (g.modo === 'desenhar' && !g.venceu) {
      var tp = ponta(), forte = g.bloqueado || (acao && acao.esperando) || ag - g.dicaPontaT < 1500, raio = 0.5 + 0.08 * Math.sin(s * 8);
      if (forte || !acao) {
        ctx.strokeStyle = forte ? '#ffd166' : 'rgba(255,255,255,.6)'; ctx.lineWidth = forte ? 0.09 : 0.05;
        ctx.beginPath(); ctx.arc(tp[0], tp[1], raio, 0, Math.PI * 2); ctx.stroke();
      }
      if (acao && (acao.esperando || g.bloqueado) && acao.sx != null) {
        var wd = paraMundo(acao.sx, acao.sy);
        ctx.strokeStyle = 'rgba(255,209,102,.8)'; ctx.lineWidth = 0.06; ctx.setLineDash([0.12, 0.14]);
        ctx.beginPath(); ctx.moveTo(wd[0], wd[1]); ctx.lineTo(tp[0], tp[1]); ctx.stroke(); ctx.setLineDash([]);
      }
      if (ag - g.bateT < 400) { ctx.fillStyle = 'rgba(255,93,115,' + (1 - (ag - g.bateT) / 400) + ')'; ctx.beginPath(); ctx.arc(tp[0], tp[1], 0.35, 0, Math.PI * 2); ctx.fill(); }
    }
    // casas que o cachorrinho enxerga, brilhando de leve por ~1 s depois de um toque onde ele não vê
    if (g.visao && ag - g.visao.t0 < 1200) {
      var kv0 = (ag - g.visao.t0) / 1200, av = 0.5 * Math.min(1, kv0 * 6) * (1 - kv0 * kv0);
      ctx.fillStyle = 'rgba(255,246,170,' + av + ')'; ctx.beginPath();
      g.visao.casas.forEach(function (k) { var vc = L.celulas[k]; ctx.moveTo(vc.x + 0.34, vc.y); ctx.arc(vc.x, vc.y, 0.34, 0, Math.PI * 2); });
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,' + av * 0.9 + ')'; ctx.lineWidth = Math.max(0.04, 2 * px); ctx.stroke();
    } else g.visao = null;
    // poeira das patas
    for (var pi = g.poeira.length - 1; pi >= 0; pi--) {
      var pz = g.poeira[pi], kz = (ag - pz.t0) / 550;
      if (kz >= 1) { g.poeira.splice(pi, 1); continue; }
      ctx.fillStyle = T.poeira.replace('A', (0.45 * (1 - kz)).toFixed(3));
      ctx.beginPath(); ctx.arc(pz.x, pz.y - kz * 0.12, 0.06 + kz * 0.12, 0, Math.PI * 2); ctx.fill();
    }
    // cachorrinho
    var c = g.cao, pulo = 0, dtp = (ag - c.puloT) / 1000;
    if (!calmo) {
      if (c.festa) pulo = Math.abs(Math.sin(dtp * 7)) * 0.7;
      else if (dtp < 0.85) pulo = Math.abs(Math.sin(dtp / 0.85 * Math.PI * 2));
    }
    var andando = (g.modo === 'andar' && c.para >= 0) || !!c.saida || (g.modo === 'desenhar' && acao && !g.bloqueado && !acao.esperando);
    var tam = Math.max(0.9, 24 * px);
    if (ag - g.bateT < 300 && !calmo) ctx.translate(Math.sin((ag - g.bateT) / 20) * 0.05, 0);
    var kh = (ag - c.hmmT) / 900;
    Desenho.cachorro(ctx, c.x, c.y - tam * 0.1, tam, { t: s, dir: c.dir, andando: andando, fase: g.modo === 'andar' || c.saida ? c.fase : s * VEL * Math.PI * 2,
      incl: c.incl, pulo: pulo, feliz: c.festa || dtp < 1.2, hmm: kh >= 0 && kh < 1 ? kh : -1, calmo: calmo });
    // estrelinha voando
    if (g.voo) {
      var kv = (ag - g.voo.t0) / g.voo.dur, de = L.celulas[L.item], pa = de;
      if (L.bordaSaida >= 0) { var p2 = L.arestas[L.bordaSaida].pts; pa = { x: p2[Math.floor(p2.length / 2)][0], y: p2[Math.floor(p2.length / 2)][1] }; }
      var mx = (de.x + pa.x) / 2, my = (de.y + pa.y) / 2 - Math.hypot(pa.x - de.x, pa.y - de.y) * 0.4;
      var u = kv, vx = (1 - u) * (1 - u) * de.x + 2 * (1 - u) * u * mx + u * u * pa.x, vy = (1 - u) * (1 - u) * de.y + 2 * (1 - u) * u * my + u * u * pa.y;
      ctx.fillStyle = '#ffe066'; ctx.save(); ctx.shadowColor = '#fff3b0'; ctx.shadowBlur = 16; Desenho.estrela(ctx, vx, vy, 0.35, 5); ctx.fill(); ctx.restore();
      if (Math.random() < 0.6) { var sv = Desenho.tela(cam, vx, vy); g.part.add({ x: sv[0], y: sv[1], vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40, g: 20, vida: 0, max: 0.6, cor: '#fff3b0', tipo: 'brilho', rot: 0, vr: 3, tam: 4 }); }
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.part.desenhar(ctx);
  }

  /* ---------- cachorrinho do menu ---------- */
  var gMasc = $('mascote').getContext('2d'), mascDpr = 0;
  function mascote(ag) {
    var cv = $('mascote');
    if (!mascDpr) { mascDpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = 160 * mascDpr; cv.height = 120 * mascDpr; }
    var s = ag / 1000;
    if (calmo && mascote.feito) return;
    mascote.feito = true;
    gMasc.setTransform(mascDpr, 0, 0, mascDpr, 0, 0); gMasc.clearRect(0, 0, 160, 120);
    Desenho.item(gMasc, Math.floor(s / 3) % 4, 128, 70, 34, s);
    Desenho.cachorro(gMasc, 62, 66, 92, { t: s, dir: 1, andando: false, pulo: calmo ? 0 : Math.max(0, Math.sin(s * 2.2)) * 0.25, feliz: true });
  }

  /* ---------- instalar, service worker e começo ---------- */
  var pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); pedidoInstalar = e; $('btInstalar').hidden = false; });
  $('btInstalar').addEventListener('click', function () { if (!pedidoInstalar) return; pedidoInstalar.prompt(); pedidoInstalar.userChoice.then(function () { pedidoInstalar = null; $('btInstalar').hidden = true; }); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !TESTE) navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });
  window.addEventListener('resize', function () { if (telaAtual === 'jogo') medir(); });
  if (window.ResizeObserver) new ResizeObserver(function () { if (telaAtual === 'jogo' && jogo) medir(); }).observe($('palco'));

  if (window.SolverRecursos && !SolverRecursos.ligado('labirinto', true)) { mostrar('desligado'); $('desligado').hidden = false; traduzir(); return; }
  pintarEfeitos(); pintarMenu(); traduzir();
  if (window.Trilha) Trilha.iniciar({ jogo: 'labirinto', creditos: 'CREDITOS.md', volume: 0.45, musicas: MUSICAS });
  requestAnimationFrame(quadro);

  if (TESTE) window.LabirintoDebug = {
    pronto: true, versao: APP_VERSION,
    estado: function () {
      if (!jogo) return { tela: telaAtual };
      return { tela: telaAtual, forma: jogo.L.forma, nivel: jogo.L.nivel, modo: jogo.modo, item: jogo.L.item, inicio: jogo.L.inicio, saida: jogo.L.saida,
        pegouItem: jogo.P.pegouItem, venceu: jogo.venceu, risco: jogo.risco.length, ponta: ponta(), bloqueado: jogo.bloqueado, casaCao: jogo.cao.de,
        casaPonta: Regras.celulaEm(jogo.L, ponta()[0], ponta()[1]), andando: jogo.cao.para >= 0, fila: jogo.cao.fila.length, hmm: agora() - jogo.cao.hmmT < 1000,
        brilhando: jogo.visao ? jogo.visao.casas.length : 0, dir: jogo.cao.dir, intro: !!jogo.intro, glide: !!jogo.glide, fim: !$('fim').hidden, z: jogo.cam.z, zFit: jogo.zFit, portaAberta: jogo.portaT != null };
    },
    tela: function (x, y) { return paraTela(x, y); },
    centro: function (c) { var p = jogo.L.celulas[c]; return paraTela(p.x, p.y); },
    cao: function () { return paraTela(jogo.cao.x, jogo.cao.y); },
    caminho: function (a, b) { return Regras.caminho(jogo.L, a, b); },
    reta: function (a, b) { return Regras.reta(jogo.L, a, b); },
    visiveis: function (a) { return Regras.visiveis(jogo.L, a); },
    passagem: function (a, b) { var pts = jogo.L.arestas[Regras.arestaEntre(jogo.L, a, b)].pts; return pts.length === 2 ? [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2] : pts[Math.floor(pts.length / 2)]; },
    parede: function () { for (var i = 0; i < jogo.L.arestas.length; i++) { var e = jogo.L.arestas[i]; if (!e.aberta && e.b >= 0 && (e.a === jogo.L.inicio || e.b === jogo.L.inicio)) return { a: e.a, b: e.b }; } return null; },
    furou: function () { for (var k = 1; k < jogo.risco.length; k++) if (jogo.C.cruzaParede(jogo.risco[k - 1], jogo.risco[k])) return true; return false; },
    avancar: function (p, q) { return jogo.C.avancar(p, q); },
    distParede: function (x, y) { return jogo.C.distParede(x, y); },
    velocidade: function (v) { jogo.vel = v; },
    zoom: function (z) { jogo.cam.z = z; prenderCam(); }
  };
})();

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer jogar não baixa nada a mais. */
(function () {
  if (!/[?&]instalar\b/.test(location.search) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.src = '../instalar.js';
  s.setAttribute('data-nome', 'Labirinto'); s.setAttribute('data-icone', 'icone-192.png');
  s.setAttribute('data-so-com', 'instalar'); s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
  document.body.appendChild(s);
})();
