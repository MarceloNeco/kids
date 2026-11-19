/* FRUTA PODRE — telas (começo, jogo, fim, Como jogar), câmera, controles (dedo, mouse, teclado e controle da TV),
   partículas, pontos que sobem, garotos e o laço do jogo. A física e o turno ficam em mundo.js (FrutaMundo), as regras em
   regras.js (FrutaRegras), as fases em fases.js (FrutaFases), o desenho em arte.js (FrutaArte) e os sons em som.js (FrutaSom).
   Com ?teste aparece window.FrutaDebug (usado pelos testes no navegador).
   Versão: APP_VERSION aqui = VERSAO no sw.js = primeira entrada do versoes.json. */
(function () {
  'use strict';
  var APP_VERSION = '0.1.0', APP_DATA = '19/Nov/2026';
  var R = window.FrutaRegras, F = window.FrutaFases, MUNDO = window.FrutaMundo, A = window.FrutaArte, Som = window.FrutaSom;
  var $ = function (id) { return document.getElementById(id); };
  var TESTE = /[?&]teste\b/.test(location.search);
  var calmo = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  // trilha: músicas travessas que já moram na Rabiscolândia e na Bagunçolândia (créditos em CREDITOS.md); nada de som de
  // videogame (regra da música: Spazzmatica Polka e Pixel Peeker Polka ficam de fora, vigia teste/regra-musica.test.js)
  var RB = '../rabiscolandia/musicas/', B = '../baguncolandia/musicas/', KM = 'Kevin MacLeod', CC = 'CC BY 4.0', CC0 = 'CC0 1.0 (FreePD)';
  var MUSICAS = [
    { a: RB + 'sneaky-snitch.mp3', t: 'Sneaky Snitch', au: KM, lic: CC },
    { a: RB + 'fluffing-a-duck.mp3', t: 'Fluffing a Duck', au: KM, lic: CC },
    { a: RB + 'batty-mcfaddin.mp3', t: 'Batty McFaddin', au: KM, lic: CC },
    { a: RB + 'mariachi-snooze.mp3', t: 'Mariachi Snooze', au: KM, lic: CC },
    { a: RB + 'scheming-weasel.mp3', t: 'Scheming Weasel', au: KM, lic: CC },
    { a: RB + 'investigations.mp3', t: 'Investigations', au: KM, lic: CC },
    { a: B + 'happy-whistling-ukulele.mp3', t: 'Happy Whistling Ukulele', au: 'Rafael Krux', lic: CC0 },
    { a: B + 'silly-boy.mp3', t: 'Silly Boy', au: 'Rafael Krux', lic: CC0 },
    { a: B + 'llama-in-pajama.mp3', t: 'Llama in Pajama', au: 'Rafael Krux', lic: CC0 },
    { a: B + 'ukulele-song.mp3', t: 'Ukulele Song', au: 'Rafael Krux', lic: CC0 },
    { a: B + 'my-giant-bunny-friend.mp3', t: 'My Giant Bunny Friend', au: 'Bryan Teoh', lic: CC0 },
    { a: B + 'funshine.mp3', t: 'Funshine', au: KM, lic: CC0 }
  ];
  var FASES = F.FASES, CHAO = R.CHAO;

  /* ---------- preferências e progresso (no aparelho) ---------- */
  var CH_PREF = 'bolinho:fruta-podre:pref', CH_PROG = 'bolinho:fruta-podre:progresso';
  function lerJSON(k, pad) { try { var v = JSON.parse(localStorage.getItem(k)); return v && typeof v === 'object' ? v : pad; } catch (e) { return pad; } }
  function gravarJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var pref = lerJSON(CH_PREF, {});
  if (!R.NIVEIS[pref.nivel]) pref.nivel = 'facil';
  if (typeof pref.som !== 'boolean') pref.som = true;
  var prog = lerJSON(CH_PROG, {});
  prog.estrelas = prog.estrelas || {}; prog.recorde = prog.recorde || {};
  function salvarPref() { gravarJSON(CH_PREF, pref); }
  function salvarProg() { gravarJSON(CH_PROG, prog); }
  function destravada(n) { return n === 1 || (prog.estrelas[n - 1] || 0) > 0; }
  function proxima() {
    for (var n = 1; n <= FASES.length; n++) if (destravada(n) && !prog.estrelas[n]) return n;
    return FASES.length;
  }

  /* ---------- idioma (vem da estante: ../idioma.js) ---------- */
  var lingua = window.BolinhoIdioma ? BolinhoIdioma.atual() : 'pt';
  var IDX = { pt: 0, en: 1, es: 2 };
  function t(pt, en, es) { return lingua === 'en' ? en : lingua === 'es' ? es : pt; }
  function tx(o) { return o[lingua] || o.pt; }
  function num(n) { return R.formatar(n, lingua); }
  function dataVersao() {   // PT 19/Nov/2026 · EN Nov/19/2026 · ES 19/nov/2026
    var p = APP_DATA.split('/');
    return t(APP_DATA, p[1] + '/' + p[0] + '/' + p[2], p[0] + '/' + p[1].toLowerCase() + '/' + p[2]);
  }
  function traduzir() {
    document.documentElement.lang = t('pt-BR', 'en-US', 'es-ES');
    function parte(el, at) { var p = el.getAttribute(at).split('|'); return p[IDX[lingua]] != null ? p[IDX[lingua]] : p[0]; }
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = parte(el, 'data-t'); });
    document.querySelectorAll('[data-rotulo]').forEach(function (el) { el.setAttribute('aria-label', parte(el, 'data-rotulo')); });
    $('versao').textContent = t('Versão ', 'Version ', 'Versión ') + APP_VERSION + ' · ' + dataVersao();
    montarLogo(); pintarMenu(); pintarHud(true);
    listasProntas = false;
  }
  if (window.BolinhoIdioma) BolinhoIdioma.aoMudar(function (c) { lingua = c; traduzir(); });
  // o letreiro: uma letra de cada cor, como frutas na banca
  function montarLogo() {
    var nome = t('FRUTA PODRE', 'ROTTEN FRUIT', 'FRUTA PODRIDA').split(' '), h = $('logo'), k = 0;
    var cores = ['#e8433a', '#ffb000', '#7b3aa6', '#3f9a3a', '#ff7b2e', '#d8342c', '#8bc34a', '#f5b83d', '#9c5bd1', '#e2261c', '#5fae3f', '#ffcf2e', '#c0392b'];
    h.textContent = '';
    nome.forEach(function (pal) {
      var s = document.createElement('span'); s.className = 'palavra';
      for (var i = 0; i < pal.length; i++) {
        var l = document.createElement('span'); l.className = 'l'; l.textContent = pal[i];
        l.style.color = cores[k % cores.length]; l.style.animationDelay = (k * 0.13) + 's'; k++;
        s.appendChild(l);
      }
      h.appendChild(s);
    });
  }

  /* ---------- telas ---------- */
  var tela = 'menu', empurrado = false;
  function mostrar(id) {
    document.querySelectorAll('.tela').forEach(function (s) { s.classList.toggle('ativa', s.id === id); });
    tela = id;
  }
  function entrar(id) { if (!empurrado) { try { history.pushState({ frutaPodre: id }, ''); empurrado = true; } catch (e) {} } mostrar(id); }
  function irMenu() {
    fecharFim(); S = null; mira = null; Som.soltarElastico(true);
    $('contagem').hidden = true; $('faixa').hidden = true; $('avisoDeitar').hidden = true;
    mostrar('menu'); pintarMenu(); medidas();
  }
  window.addEventListener('popstate', function () { empurrado = false; if (tela !== 'menu') irMenu(); });
  function voltarMenu() { if (empurrado) history.back(); else irMenu(); }
  if (window.BolinhoNav) BolinhoNav.iniciar({ jogo: 'fruta-podre', noInicio: function () { return tela === 'menu'; }, irParaInicio: voltarMenu,
    emAndamento: function () { return tela === 'jogo' && !!S && !S.resultado && S.tiros > 0; } });

  /* ---------- menu ---------- */
  var SVG_ESTRELA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.8l3 6.4 7 .9-5.1 4.8 1.3 6.9L12 17.4l-6.2 3.4 1.3-6.9L2 9.1l7-.9z" ';
  function estrelaSvg(cheia, classe) {
    return SVG_ESTRELA.replace('<svg', '<svg class="' + (classe || '') + '"') + (cheia ? 'fill="#ffd23f" stroke="#2a160b"' : 'fill="#efe2c4" stroke="#9c8c70"') + ' stroke-width="1.8" stroke-linejoin="round"/></svg>';
  }
  function pintarMenu() {
    document.querySelectorAll('[data-nivel]').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-nivel') === pref.nivel)); });
    var m = $('mapa'), px = proxima();
    m.textContent = '';
    FASES.forEach(function (f, i) {
      var n = i + 1, b = document.createElement('button'), livre = destravada(n), e = prog.estrelas[n] || 0;
      b.type = 'button'; b.className = 'fase-bt' + (livre ? '' : ' trancada') + (n === px ? ' escolhida' : '');
      b.setAttribute('data-fase', n);
      b.setAttribute('aria-label', t('Fase ', 'Level ', 'Fase ') + n + ' · ' + tx(f.title) + (livre ? ' · ' + e + t(' estrelas', ' stars', ' estrellas') : ' · ' + t('trancada', 'locked', 'bloqueada')));
      b.innerHTML = '<span class="n">' + (livre ? n : '🔒') + '</span>' + (livre ? '<span class="e">' + estrelaSvg(e > 0) + estrelaSvg(e > 1) + estrelaSvg(e > 2) + '</span>' : '');
      if (!livre) b.disabled = true;
      b.addEventListener('click', function () { Som.acordar(); Som.clique(); comecar(n); });
      m.appendChild(b);
    });
    $('btJogar').textContent = '▶ ' + t('Jogar fase ', 'Play level ', 'Jugar fase ') + px;
    pintarSom();
  }
  document.querySelectorAll('[data-nivel]').forEach(function (b) {
    b.addEventListener('click', function () { pref.nivel = b.getAttribute('data-nivel'); salvarPref(); pintarMenu(); Som.acordar(); Som.clique(); });
  });
  function pintarSom() {
    ['btSom', 'btSomJogo'].forEach(function (id) { $(id).textContent = pref.som ? '🔊' : '🔇'; $(id).setAttribute('aria-pressed', String(pref.som)); });
    Som.ligar(pref.som);
  }
  function trocarSom() { pref.som = !pref.som; salvarPref(); pintarSom(); Som.acordar(); Som.clique(); }
  $('btSom').addEventListener('click', trocarSom);
  $('btSomJogo').addEventListener('click', trocarSom);
  $('btJogar').addEventListener('click', function () { Som.acordar(); comecar(proxima()); });
  $('btRecomecar').addEventListener('click', function () { Som.clique(); comecar(faseAtual); });

  // Como jogar: figurinhas desenhadas na hora em que abre
  var listasProntas = false;
  function montarListas() {
    if (listasProntas) return;
    listasProntas = true;
    function item(lista, id, nome, dica) {
      var li = document.createElement('li'), c = document.createElement('canvas'), d = document.createElement('div'), b = document.createElement('b'), s = document.createElement('span');
      c.width = 108; c.height = 108; b.textContent = nome; s.textContent = dica;
      d.appendChild(b); d.appendChild(s); li.appendChild(c); li.appendChild(d); lista.appendChild(li);
      A.retrato(c, id);
    }
    var lf = $('listaFrutas'), lp = $('listaPragas');
    lf.textContent = ''; lp.textContent = '';
    R.ORDEM_FRUTAS.forEach(function (id) { item(lf, id, tx(R.FRUTAS[id].nome), tx(R.FRUTAS[id].dica)); });
    item(lp, 'mosca_zumbidora', tx(R.PRAGAS.mosca_zumbidora.nome), t('Fraquinha: cai com qualquer encostada.', 'Weak: any little bump knocks it out.', 'Flojita: cae con cualquier roce.'));
    item(lp, 'barata_cascuda', tx(R.PRAGAS.barata_cascuda.nome), t('Casca dura: precisa de pancada forte ou de um bloco caindo em cima.', 'Hard shell: needs a big hit or a block falling on it.', 'Caparazón duro: hace falta un buen golpe o que le caiga un bloque encima.'));
    item(lp, 'rato_ladrao', tx(R.PRAGAS.rato_ladrao.nome), t('Capacete de tampinha: aguenta 2 golpes.', 'Bottle-cap helmet: takes 2 hits.', 'Casco de chapa: aguanta 2 golpes.'));
    item(lp, 'galao', t('Galão de Vinagre', 'Vinegar Jug', 'Garrafa de Vinagre'), t('Explode com pancada e faz explodir os outros perto!', 'Blows up when hit and sets off the others nearby!', '¡Explota con un golpe y hace explotar a los de al lado!'));
  }
  $('btAjuda').addEventListener('click', function () { Som.acordar(); Som.clique(); montarListas(); $('ajuda').hidden = false; $('btFecharAjuda').focus(); });
  $('btFecharAjuda').addEventListener('click', function () { $('ajuda').hidden = true; $('btAjuda').focus(); });
  $('ajuda').addEventListener('click', function (e) { if (e.target === this) this.hidden = true; });

  /* ---------- canvas e câmera ---------- */
  var cv = $('cena'), ctx = cv.getContext('2d'), dpr = 1, cw = 1, ch = 1;
  var cam = { x0: -160, z: 0.6, gy: 500, livre: false, intro: 0, foco: null, tremor: 0 };
  var M = { chao: 60, zMira: 0.6, zTudo: 0.4, xMira: -160 };
  var camada = null;
  function retrato() { return ch > cw; }
  function medidas() {
    var W = S ? S.W : 1800, topo = 64;
    M.chao = retrato() ? ch * 0.17 : Math.max(46, ch * 0.11);
    M.zMira = retrato() ? Math.min(1.15, cw / 700, (ch - M.chao - topo) / 600) : Math.min(1.15, cw / 1300, (ch - M.chao - topo) / 520);
    M.zTudo = Math.min(M.zMira, cw / (W + 350), (ch - M.chao - topo) / 650);
    M.xMira = retrato() ? -110 : -230;
  }
  function tamanho() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cw = Math.max(1, innerWidth); ch = Math.max(1, innerHeight);
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    medidas();
    if (camada && Math.abs(escalaCamada() - camada.s) > 0.2) camada = null;
  }
  var esperaResize = 0;
  addEventListener('resize', function () { clearTimeout(esperaResize); esperaResize = setTimeout(tamanho, 80); });
  function paraMundo(sx, sy) { return { x: sx / cam.z + cam.x0, y: (sy - cam.gy) / cam.z + CHAO }; }
  function paraTela(wx, wy) { return { x: (wx - cam.x0) * cam.z, y: cam.gy + (wy - CHAO) * cam.z }; }
  // cenário parado (casas, barraca, calçada) pintado uma vez numa camada guardada
  function escalaCamada() { return Math.max(0.5, Math.min(1.3, M.zMira * dpr)); }
  function montarCamada(W) {
    var s = escalaCamada(), X0 = -700, Y0 = 170, w = W + 1400, h = 620;
    s = Math.min(s, 4000 / w);
    var c = document.createElement('canvas');
    c.width = Math.ceil(w * s); c.height = Math.ceil(h * s);
    var g = c.getContext('2d');
    g.setTransform(s, 0, 0, s, -X0 * s, -Y0 * s);
    A.cenario(g, W);
    camada = { c: c, s: s, X0: X0, Y0: Y0, w: w, h: h, W: W };
  }

  /* ---------- jogo ---------- */
  var S = null, faseAtual = 1, mira = null, teclado = null, particulas = [], textos = [], manchas = [], poses = { teo: 'parado', duda: 'parado', ate: 0 };
  var ai = {}, ultimoKabum = -9, carregaT = 0, impactos = 0, ultimaContagem = 0, quebrasRecentes = [], faixaTimer = 0, avisoTimer = 0, fimTimer = 0;
  var SX = 180;   // x do estilingue (todas as fases)
  function comecar(n) {
    n = Math.max(1, Math.min(FASES.length, n || 1));
    if (!destravada(n) && !TESTE) n = proxima();
    fecharFim(); $('ajuda').hidden = true;
    faseAtual = n;
    S = MUNDO.criar(FASES[n - 1], { nivel: pref.nivel });
    SX = S.estilingue.x;
    particulas = []; textos = []; manchas = []; mira = null; teclado = null; ai = {}; impactos = 0; ultimaContagem = 0; quebrasRecentes = [];
    poses = { teo: 'parado', duda: 'parado', ate: 0 };
    medidas();
    if (!camada || camada.W !== S.W) camada = null;
    cam.livre = false; cam.foco = null; cam.tremor = 0;
    // começa mostrando a fortaleza e desliza até o estilingue
    var fx = 0; S.blocos.forEach(function (b) { fx += b.body.position.x; }); fx /= Math.max(1, S.blocos.length);
    cam.z = M.zMira; cam.x0 = calmo ? M.xMira : fx - cw / M.zMira * 0.55; cam.gy = ch - M.chao; cam.intro = calmo ? 0 : 1.3;
    entrar('jogo');
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    $('contagem').hidden = true;
    $('avisoDeitar').hidden = !retrato(); avisoTimer = 7;
    pintarHud(true);
    faixa(t('Fase ', 'Level ', 'Fase ') + n + ': ' + tx(FASES[n - 1].title) + ' — ' + t('derrube todas as pragas!', 'knock out every pest!', '¡derriba todas las plagas!'), 3.2);
    if (window.Trilha) Trilha.volume(null);
  }
  var hudCache = '';
  function pintarHud(forcar) {
    if (!S) return;
    var f = t('Fase ', 'Level ', 'Fase ') + faseAtual + ' · ' + tx(FASES[faseAtual - 1].title), p = num(S.pontos);
    if (forcar || hudCache !== f + p) { $('hudFase').textContent = f; $('hudPontos').textContent = p; hudCache = f + p; }
  }
  function faixa(txt, seg) {
    var el = $('faixa');
    el.hidden = true; void el.offsetWidth;
    el.textContent = txt; el.hidden = false; faixaTimer = seg || 2.5;
  }
  function dicaFruta(id) {
    var d = R.FRUTAS[id];
    faixa(tx(d.nome) + ': ' + tx(d.dica), 3);
  }

  /* ---------- mira, lançamento e poder ---------- */
  var PUXO = 74;   // o máximo que o elástico estica (px do mundo)
  function bolsaRepouso() { return { x: SX, y: S.estilingue.y }; }
  function puxoAtual() {   // { x, y, forca, vx, vy } ou null
    if (!S || S.estado !== 'mira' || !S.atual) return null;
    var p = mira || teclado;
    if (!p) return null;
    var ang = p.ang * Math.PI / 180, f = p.forca, rep = bolsaRepouso();
    var v = R.velocidade(p.ang, f);
    return { x: rep.x - Math.cos(ang) * PUXO * f, y: rep.y + Math.sin(ang) * PUXO * f, forca: f, vx: v.vx, vy: v.vy };
  }
  function lancar(ang, forca) {
    if (!S || S.estado !== 'mira' || !S.atual || cam.intro > 0.3) return false;
    var v = R.velocidade(ang, forca);
    var ok = S.lancar(v.vx, v.vy);
    if (ok) { mira = null; teclado = null; cam.livre = false; cam.intro = 0; }
    return ok;
  }
  function usarPoder() { return !!(S && S.estado === 'voo' && S.poder()); }
  function tocarPoder() { if (S && S.podePoder()) usarPoder(); }

  var toques = {}, gesto = null;
  function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  cv.addEventListener('pointerdown', function (e) {
    if (tela !== 'jogo' || !S) return;
    Som.acordar();
    var p = pos(e);
    toques[e.pointerId] = p;
    try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    var ids = Object.keys(toques);
    if (ids.length === 2 && S.estado === 'mira' && !mira) {   // pinça: aproximar e afastar antes do tiro
      var a = toques[ids[0]], b = toques[ids[1]];
      gesto = { tipo: 'pinca', d: Math.max(20, Math.hypot(a.x - b.x, a.y - b.y)), z: cam.z, mx: (a.x + b.x) / 2, wx: paraMundo((a.x + b.x) / 2, 0).x };
      cam.livre = true; return;
    }
    if (S.estado === 'voo') { tocarPoder(); return; }
    if (S.estado !== 'mira' || !S.atual || ids.length > 1) return;
    if (cam.intro > 0) { cam.intro = 0; return; }   // um toque pula a apresentação da fortaleza
    var bolsa = paraTela(SX, S.estilingue.y), d = Math.hypot(p.x - bolsa.x, p.y - bolsa.y);
    if (d < Math.max(56, R.FRUTAS[S.atual].r * cam.z * 2.4) && cam.intro <= 0.3) {
      cam.livre = false; cam.intro = 0;
      mira = { id: e.pointerId, ang: 30, forca: 0, x0: bolsa.x, y0: bolsa.y };
      teclado = null;
      Som.elastico(0);
      return;
    }
    gesto = { tipo: 'arrasta', x: p.x, y: p.y, x0: cam.x0, andou: false };
  });
  cv.addEventListener('pointermove', function (e) {
    if (!toques[e.pointerId]) return;
    var p = pos(e); toques[e.pointerId] = p;
    if (mira && e.pointerId === mira.id) {
      var dx = p.x - mira.x0, dy = p.y - mira.y0, len = Math.hypot(dx, dy), max = Math.max(80, Math.min(cw, ch) * 0.2);
      mira.forca = Math.min(1, len / max);
      if (len > 4) mira.ang = Math.atan2(dy, -dx) * 180 / Math.PI;
      Som.elastico(mira.forca);
      return;
    }
    if (!gesto) return;
    if (gesto.tipo === 'pinca') {
      var ids = Object.keys(toques); if (ids.length < 2) return;
      var a = toques[ids[0]], b = toques[ids[1]], d = Math.max(20, Math.hypot(a.x - b.x, a.y - b.y));
      cam.z = Math.max(M.zTudo * 0.85, Math.min(M.zMira * 1.7, gesto.z * d / gesto.d));
      cam.x0 = gesto.wx - gesto.mx / cam.z;
      prenderCamera();
    } else if (gesto.tipo === 'arrasta') {
      if (Math.abs(p.x - gesto.x) > 8) gesto.andou = true;
      if (gesto.andou && S && (S.estado === 'mira' || S.estado === 'espera')) { cam.livre = true; cam.intro = 0; cam.x0 = gesto.x0 - (p.x - gesto.x) / cam.z; prenderCamera(); }
    }
  });
  function soltar(e) {
    if (!toques[e.pointerId]) return;
    delete toques[e.pointerId];
    if (mira && e.pointerId === mira.id) {
      var m = mira; mira = null;
      if (m.forca > 0.15 && lancar(m.ang, m.forca)) return;
      Som.soltarElastico(true);
      return;
    }
    if (gesto && gesto.tipo === 'arrasta' && !gesto.andou && cam.livre) cam.livre = false;   // um toque solto volta para o estilingue
    if (!Object.keys(toques).length) gesto = null;
  }
  cv.addEventListener('pointerup', soltar);
  cv.addEventListener('pointercancel', soltar);
  cv.addEventListener('wheel', function (e) {
    if (tela !== 'jogo' || !S || S.estado !== 'mira') return;
    e.preventDefault();
    var p = pos(e), wx = paraMundo(p.x, p.y).x;
    cam.z = Math.max(M.zTudo * 0.85, Math.min(M.zMira * 1.7, cam.z * (e.deltaY > 0 ? 0.9 : 1.1)));
    cam.x0 = wx - p.x / cam.z; cam.livre = true; prenderCamera();
  }, { passive: false });
  function prenderCamera() {
    var W = S ? S.W : 1800, vis = cw / cam.z;
    cam.x0 = Math.max(-450, Math.min(W + 350 - vis, cam.x0));
  }
  // teclado e controle da TV: ⬆⬇ ângulo, ⬅➡ força, OK lança / usa o poder
  document.addEventListener('keydown', function (e) {
    if (tela !== 'jogo' || !S || !$('fim').hidden || !$('ajuda').hidden) return;
    var k = e.key, alvo = e.target && e.target.tagName;
    var ok = k === 'Enter' || k === ' ' || k === 'Spacebar' || e.keyCode === 13 || e.keyCode === 23;
    if (ok && (alvo === 'BUTTON' || alvo === 'A')) return;
    if (/^Arrow/.test(k) && S.estado === 'mira' && S.atual) {
      if (!teclado) teclado = { ang: 35, forca: 0.7 };
      if (k === 'ArrowUp') teclado.ang = Math.min(80, teclado.ang + 3);
      else if (k === 'ArrowDown') teclado.ang = Math.max(-10, teclado.ang - 3);
      else if (k === 'ArrowLeft') teclado.forca = Math.min(1, teclado.forca + 0.05);
      else if (k === 'ArrowRight') teclado.forca = Math.max(0.2, teclado.forca - 0.05);
      cam.livre = false; Som.acordar(); Som.elastico(teclado.forca);
      setTimeout(function () { if (!mira) Som.soltarElastico(true); }, 160);
      e.preventDefault(); return;
    }
    if (ok) {
      e.preventDefault(); Som.acordar();
      if (S.estado === 'mira' && S.atual) { var q = teclado || { ang: 35, forca: 0.7 }; if (!teclado) { teclado = q; return; } lancar(q.ang, q.forca); }
      else if (S.estado === 'voo') tocarPoder();
    }
  });

  /* ---------- efeitos: partículas, pontos que sobem e manchas de suco ---------- */
  var COR_MAT = { glass: ['#bfefff', '#e6fbff', '#7fd0ef'], wood: ['#d6955a', '#a8652d', '#eab27a'], stone: ['#aaa59c', '#7f7a71', '#c9c4ba'] };
  function pedacos(e) {
    var n = calmo ? 4 : 7, cores = COR_MAT[e.mat] || COR_MAT.wood;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.28, v = 80 + Math.random() * 220, s = 5 + Math.random() * Math.min(18, Math.max(e.w, e.h) / 5);
      var pts = []; for (var k = 0; k < 4; k++) { var b = k * 1.57 + Math.random() * 0.8; pts.push([Math.cos(b) * s * (0.5 + Math.random() * 0.6), Math.sin(b) * s * (0.5 + Math.random() * 0.6)]); }
      particulas.push({ tipo: 'caco', x: e.x + (Math.random() - 0.5) * e.w * 0.6, y: e.y + (Math.random() - 0.5) * e.h * 0.6, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 140,
        ang: Math.random() * 6, va: (Math.random() - 0.5) * 14, vida: 1.1 + Math.random() * 0.5, max: 1.6, cor: cores[i % cores.length], pts: pts, vidro: e.mat === 'glass' });
    }
    if (e.mat === 'glass') for (var j = 0; j < (calmo ? 4 : 9); j++) particulas.push({ tipo: 'brilho', x: e.x, y: e.y, vx: (Math.random() - 0.5) * 300, vy: -Math.random() * 260, vida: 0.7, max: 0.7, r: 3 + Math.random() * 4 });
    else poeira(e.x, e.y, e.mat === 'stone' ? '#cfc8bb' : '#e7c79c', calmo ? 3 : 6, 1);
  }
  function poeira(x, y, cor, n, esc) {
    for (var i = 0; i < n; i++) particulas.push({ tipo: 'nuvem', x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 20, vx: (Math.random() - 0.5) * 90, vy: -20 - Math.random() * 50,
      r: (10 + Math.random() * 14) * (esc || 1), vida: 0.9, max: 0.9, cor: cor });
  }
  function suco(x, y, cor, n, forca) {
    for (var i = 0; i < n; i++) { var a = -Math.PI * Math.random(), v = (60 + Math.random() * 200) * (forca || 1);
      particulas.push({ tipo: 'gota', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 3 + Math.random() * 5, vida: 0.9, max: 0.9, cor: cor }); }
  }
  function texto(txt, x, y, cor, tam) { textos.push({ t: txt, x: x, y: y, cor: cor || '#fff', tam: tam || 30, vida: 1.3, max: 1.3 }); }
  function mancha(x, y, r, cor) {
    var pts = []; for (var i = 0; i < 9; i++) { var a = i / 9 * 6.28, q = r * (0.7 + Math.random() * 0.6); pts.push([Math.cos(a) * q, Math.sin(a) * q * 0.45]); }
    manchas.push({ x: x, y: Math.min(y, CHAO + 2), pts: pts, cor: cor });
    if (manchas.length > 14) manchas.shift();
  }
  function reagir(pose, seg) { if (poses.teo === 'triste') return; poses.teo = poses.duda = pose; poses.ate = seg; }

  function tratar(ev) {
    for (var i = 0; i < ev.length; i++) {
      var e = ev[i], F2 = e.fruta ? R.FRUTAS[e.fruta] : null;
      if (e.tipo === 'carrega') { carregaT = 0.45; if (S.tiros > 0) cam.livre = false; dicaFruta(e.fruta); }
      else if (e.tipo === 'lanca') { Som.lanca(e.fruta); poeira(SX - 10, CHAO - 4, '#e7d6b8', 4, 0.8); cam.foco = null; reagir('parado', 0); }
      else if (e.tipo === 'bate') { impactos++; Som.toque('fruta', e.forca); suco(e.x, e.y, F2.suco, calmo ? 4 : 8, Math.min(1.4, e.forca / 10)); }
      else if (e.tipo === 'toque') { Som.toque(e.mat, e.forca); if (e.forca > 5 && e.mat !== 'fruta') poeira(e.x, e.y, e.mat === 'glass' ? '#e6fbff' : '#e7c79c', 1, 0.6); }
      else if (e.tipo === 'quebra') {
        Som.quebra(e.mat); pedacos(e); texto('+' + num(e.pontos), e.x, e.y - 10, e.mat === 'glass' ? '#7fe3ff' : e.mat === 'stone' ? '#e8e2d6' : '#ffd23f', 24);
        quebrasRecentes.push(agoraS); quebrasRecentes = quebrasRecentes.filter(function (q) { return agoraS - q < 0.8; });
        if (quebrasRecentes.length >= 2 && poses.teo !== 'torce') reagir('torce', 1.4);
      }
      else if (e.tipo === 'ko') { Som.ko(); texto('+' + num(e.pontos), e.x, e.y - 30, '#ffd23f', 38); reagir('torce', 1.6); }
      else if (e.tipo === 'puf') {
        Som.puf();
        for (var k = 0; k < (calmo ? 4 : 8); k++) { var a = k / 8 * 6.28; particulas.push({ tipo: 'nuvem', x: e.x, y: e.y, vx: Math.cos(a) * 70, vy: Math.sin(a) * 50 - 20, r: 14, vida: 0.7, max: 0.7, cor: '#ffffff' }); }
        texto(t('PUF!', 'POOF!', '¡PUF!'), e.x, e.y - 6, '#ffffff', 22);
      }
      else if (e.tipo === 'capacete') {
        Som.capacete(); texto(t('PLIM!', 'CLINK!', '¡CLINC!'), e.x, e.y - 14, '#ffe14d', 22);
        particulas.push({ tipo: 'tampa', x: e.x, y: e.y, vx: -60 + Math.random() * 120, vy: -320, ang: 0, va: 12, vida: 1.4, max: 1.4 });
      }
      else if (e.tipo === 'ai') { if (agoraS - (ai[e.praga + '@'] || -9) > 0.6) Som.ai(); ai[e.praga + '@'] = agoraS; }
      else if (e.tipo === 'explosao') {
        var abacaxi = e.de === 'abacaxi_azedo';
        if (!abacaxi) Som.explosao();
        particulas.push({ tipo: 'onda', x: e.x, y: e.y, r: 10, rmax: e.raio, vida: 0.45, max: 0.45 });
        for (var j = 0; j < (calmo ? 8 : 16); j++) { var b = Math.random() * 6.28, v = 150 + Math.random() * 380;
          particulas.push({ tipo: 'fogo', x: e.x, y: e.y, vx: Math.cos(b) * v, vy: Math.sin(b) * v - 100, r: 10 + Math.random() * 16, vida: 0.6, max: 0.6, cor: abacaxi ? (j % 2 ? '#ffe066' : '#ff9f1c') : (j % 2 ? '#ffb347' : '#c8682a') }); }
        poeira(e.x, e.y, '#d8d0c2', calmo ? 4 : 9, 1.6);
        if (abacaxi) for (var s2 = 0; s2 < 8; s2++) { var c2 = s2 / 8 * 6.28; particulas.push({ tipo: 'espinho', x: e.x, y: e.y, vx: Math.cos(c2) * 420, vy: Math.sin(c2) * 420, ang: c2, vida: 0.5, max: 0.5 }); }
        if (agoraS - ultimoKabum > 0.4) texto(t('KABUM!', 'KABOOM!', '¡BUUM!'), e.x, e.y - 40, '#ff7b2e', 46);
        ultimoKabum = agoraS;
        if (!calmo) cam.tremor = 0.35;
        mancha(e.x, CHAO, 46, abacaxi ? 'rgba(240,200,60,.55)' : 'rgba(200,104,42,.5)');
      }
      else if (e.tipo === 'grito') {
        particulas.push({ tipo: 'onda', x: e.x, y: e.y, r: 10, rmax: 160, vida: 0.5, max: 0.5, verde: true });
        particulas.push({ tipo: 'onda', x: e.x, y: e.y, r: 10, rmax: 110, vida: 0.4, max: 0.4, verde: true });
        texto(t('IIIIH!', 'EEEEK!', '¡IIIIH!'), e.x, e.y - 40, '#c8f56b', 34);
      }
      else if (e.tipo === 'poder') {
        Som.poder(e.fruta);
        if (e.fruta === 'trio_uva') { poeira(e.x, e.y, '#d9b8ef', 4, 0.6); texto('×3', e.x, e.y - 34, '#d9a3ff', 30); }
        else if (e.fruta === 'pimenta_jato') texto(t('FIUUU!', 'WHOOSH!', '¡FIUUU!'), e.x, e.y - 34, '#ff7b2e', 30);
        else if (e.fruta === 'melancia_passada') texto(t('LÁ VAI!', 'LOOK OUT!', '¡AHÍ VA!'), e.x, e.y - 40, '#7ee081', 30);
      }
      else if (e.tipo === 'some') { Som.splat(); suco(e.x, e.y, R.FRUTAS[e.fruta].suco, calmo ? 4 : 9, 0.8); mancha(e.x, e.y + e.r * 0.6, e.r * 1.3, R.FRUTAS[e.fruta].suco); }
      else if (e.tipo === 'turno') { if (e.kos === 0 && e.quebras === 0 && e.danos < 40) reagir('ops', 1.8); }
      else if (e.tipo === 'ultima') { reagir('torce', 99); faixa(t('Todas as pragas fora! 🎉', 'All the pests are out! 🎉', '¡Todas las plagas fuera! 🎉'), 2.6); }
      else if (e.tipo === 'contagem') { ultimaContagem = 0; faixa(t('Acabaram as frutas…', 'Out of fruit…', 'Se acabaron las frutas…'), 2); }
      else if (e.tipo === 'vitoria') { fimTimer = 0.35; }
      else if (e.tipo === 'derrota') { poses.teo = poses.duda = 'triste'; poses.ate = 99; fimTimer = 0.2; }
    }
    ev.length = 0;
  }

  /* ---------- fim de fase ---------- */
  function mostrarFim() {
    var r = S.resultado, n = faseAtual, venceu = r.venceu, caixa = document.querySelector('#fim .caixa');
    var recorde = false;
    if (venceu) {
      var antes = prog.recorde[n] || 0;
      recorde = antes > 0 && r.pontos > antes;
      prog.estrelas[n] = Math.max(prog.estrelas[n] || 0, r.estrelas);
      prog.recorde[n] = Math.max(antes, r.pontos);
      salvarProg();
      Som.vitoria();
      for (var i = 0; i < r.estrelas; i++) (function (k) { setTimeout(function () { Som.estrela(k); }, 500 + k * 450); })(i);
    } else Som.derrota();
    caixa.classList.toggle('perdeu', !venceu);
    var ultima = n === FASES.length;
    $('fimTitulo').textContent = venceu ? (ultima ? t('🏆 Quitanda limpinha!', '🏆 The stand is pest-free!', '🏆 ¡Frutería limpita!') : t('Fase limpa!', 'Level cleared!', '¡Fase superada!'))
      : t('As pragas venceram!', 'The pests won!', '¡Ganaron las plagas!');
    var est = venceu ? r.estrelas : 0;
    $('fimEstrelas').innerHTML = estrelaSvg(est > 0, 'est' + (est > 0 ? ' ganhou' : '')) + estrelaSvg(est > 1, 'est' + (est > 1 ? ' ganhou' : '')) + estrelaSvg(est > 2, 'est' + (est > 2 ? ' ganhou' : ''));
    $('fimPontos').textContent = t('Pontos: ', 'Score: ', 'Puntos: ') + num(r.pontos);
    $('fimBonus').textContent = venceu
      ? (r.sobra ? '🍎 × ' + r.sobra + ' ' + t('fruta(s) sobrando', 'fruit left over', 'fruta(s) de sobra') + ': +' + num(r.bonus) : (ultima ? t('Mundos novos chegando em breve!', 'New worlds coming soon!', '¡Pronto llegan mundos nuevos!') : ''))
      : t('Dica: acerte a base das torres para tudo desabar!', 'Tip: hit the bottom of the towers to bring it all down!', 'Consejo: ¡dale a la base de las torres para que se venga todo abajo!');
    $('fimRecorde').hidden = !recorde;
    $('btProxima').hidden = ultima || !destravada(n + 1);
    $('btDeNovo').textContent = venceu ? t('🔄 Jogar de novo', '🔄 Play again', '🔄 Jugar otra vez') : t('🔄 Tentar de novo', '🔄 Try again', '🔄 Intentar otra vez');
    $('fim').hidden = false;
    var foco = !$('btProxima').hidden ? $('btProxima') : $('btDeNovo');
    try { foco.focus({ preventScroll: true }); } catch (e) { foco.focus(); }
    if (window.Trilha) Trilha.volume(0.5);
  }
  function fecharFim() { $('fim').hidden = true; if (window.Trilha) Trilha.volume(null); }
  $('btProxima').addEventListener('click', function () { Som.clique(); comecar(faseAtual + 1); });
  $('btDeNovo').addEventListener('click', function () { Som.clique(); comecar(faseAtual); });
  $('btFimMenu').addEventListener('click', function () { Som.clique(); voltarMenu(); });

  /* ---------- desenho ---------- */
  var agoraS = 0;
  function noAr(p) { return !p.bateu; }
  function desenharMundo(tm) {
    var W = S ? S.W : 1800;
    if (!camada) montarCamada(W);
    var tr = cam.tremor > 0 ? cam.tremor * 22 : 0, ox = tr ? (Math.random() - 0.5) * tr : 0, oy = tr ? (Math.random() - 0.5) * tr : 0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    A.ceu(ctx, cw, ch, calmo ? 0 : tm, cam.x0 * cam.z);
    var z = cam.z;
    ctx.setTransform(dpr * z, 0, 0, dpr * z, dpr * (-cam.x0 * z + ox), dpr * (cam.gy - CHAO * z + oy));
    var vx0 = cam.x0 - 80, vx1 = cam.x0 + cw / z + 80;
    ctx.drawImage(camada.c, camada.X0, camada.Y0, camada.w, camada.h);
    ctx.fillStyle = '#6b5d52'; ctx.fillRect(vx0, camada.Y0 + camada.h - 2, vx1 - vx0, 2000);
    // manchas de suco no chão
    for (var i = 0; i < manchas.length; i++) {
      var m = manchas[i]; ctx.beginPath();
      for (var k = 0; k < m.pts.length; k++) ctx.lineTo(m.x + m.pts[k][0], m.y + m.pts[k][1]);
      ctx.closePath(); ctx.fillStyle = m.cor; ctx.globalAlpha = 0.75; ctx.fill(); ctx.globalAlpha = 1;
    }
    var tt = calmo ? tm * 0.3 : tm;
    if (S) desenharFase(tt, vx0, vx1);
    else desenharEnfeite(tt);
  }
  function rastro(lista, alfa, r) {
    if (!lista || !lista.length) return;
    for (var i = 0; i < lista.length; i += 2) {
      ctx.beginPath(); ctx.arc(lista[i].x, lista[i].y, r + 1.6, 0, 6.2832); ctx.fillStyle = 'rgba(42,22,11,' + (alfa * 0.45) + ')'; ctx.fill();
      ctx.beginPath(); ctx.arc(lista[i].x, lista[i].y, r, 0, 6.2832); ctx.fillStyle = 'rgba(255,255,255,' + alfa + ')'; ctx.fill();
    }
  }
  function linhaMira(p) {
    var pts = R.prever(SX, S.estilingue.y, p.vx, p.vy, 420), fim = pts.length;
    // até onde a parábola encosta na primeira peça (para o fácil, a linha vai até o impacto)
    var caixas = [];
    S.blocos.forEach(function (b) { if (!b.quebrado) caixas.push(b.body.bounds); });
    S.pragas.forEach(function (q) { if (!q.ko) caixas.push(q.body.bounds); });
    S.galoes.forEach(function (g) { if (!g.explodiu) caixas.push(g.body.bounds); });
    for (var i = 4; i < pts.length; i++) {
      var q = pts[i], bateu = false;
      for (var k = 0; k < caixas.length; k++) { var c = caixas[k]; if (q.x > c.min.x && q.x < c.max.x && q.y > c.min.y && q.y < c.max.y) { bateu = true; break; } }
      if (bateu) { fim = i + 1; break; }
    }
    var n = Math.max(6, Math.round(fim * R.NIVEIS[S.nivel].linha));
    for (var j = 2; j < n; j += 3) {
      var a = 1 - j / (n + 6) * 0.55, rr = 5.5 - j / n * 2.5;
      ctx.beginPath(); ctx.arc(pts[j].x, pts[j].y, rr + 2, 0, 6.2832); ctx.fillStyle = 'rgba(42,22,11,' + (a * 0.6) + ')'; ctx.fill();
      ctx.beginPath(); ctx.arc(pts[j].x, pts[j].y, rr, 0, 6.2832); ctx.fillStyle = 'rgba(255,255,255,' + a + ')'; ctx.fill();
    }
  }
  function desenharFase(tm, vx0, vx1) {
    var i, rep = bolsaRepouso(), puxo = puxoAtual();
    var bolsa = puxo ? { x: puxo.x, y: puxo.y } : rep;
    // rastro fantasma do tiro anterior e o do tiro de agora
    rastro(S.rastroAnterior, 0.4, 4);
    rastro(S.rastro, 0.85, 3);
    // estilingue (parte de trás), Duda atrás e Téo puxando
    var tensao = puxo ? puxo.forca : 0;
    A.estilingueTras(ctx, SX, rep.y, bolsa, tensao);
    var pT = poses.teo, pD = poses.duda;
    if (puxo) { pT = pD = 'puxa'; }
    A.garoto(ctx, 'duda', SX - 150, CHAO, pD, tm, { x: SX - 114, y: CHAO - 50 });
    A.garoto(ctx, 'teo', SX - 100, CHAO, pT, tm, bolsa);
    // fruta no estilingue (pulando da fila para a bolsa)
    if (S.estado === 'mira' && S.atual) {
      var F1 = R.FRUTAS[S.atual], fx = bolsa.x, fy = bolsa.y;
      if (carregaT > 0) { var u = carregaT / 0.45, de = { x: SX - 200, y: CHAO - F1.r }; fx = de.x + (rep.x - de.x) * (1 - u); fy = de.y + (rep.y - de.y) * (1 - u) - Math.sin((1 - u) * Math.PI) * 90; }
      A.fruta(ctx, S.atual, fx, fy, F1.r, S.atual === 'pimenta_jato' ? -0.4 - tensao * 0.3 : 0, tm, puxo ? 'mira' : 'fila', { aceso: S.atual === 'abacaxi_azedo' && !!puxo, fase: 0.3 });
      if (!puxo && !calmo) A.moscasZonzas(ctx, fx, fy, F1.r, tm, 2);
    }
    A.estilingueFrente(ctx, SX, rep.y, bolsa, tensao);
    // fila de frutas esperando no chão
    for (i = 0; i < S.fila.length; i++) {
      var tipo = S.fila[i], r = R.FRUTAS[tipo].r * 0.9, qx = SX - 200 - i * 50;
      if (qx < vx0) break;
      A.fruta(ctx, tipo, qx, CHAO - r - (tipo === 'abacaxi_azedo' ? 4 : 0), r, tipo === 'pimenta_jato' ? -0.5 : 0, tm, 'fila', { fase: i * 1.3 });
      if (i < 2 && !calmo) A.moscasZonzas(ctx, qx, CHAO - r, r, tm + i, 1);
    }
    // a fortaleza
    for (i = 0; i < S.blocos.length; i++) {
      var b = S.blocos[i]; if (b.quebrado) continue;
      var bp = b.body.position; if (bp.x < vx0 - 200 || bp.x > vx1 + 200) continue;
      A.bloco(ctx, b.tipo, bp.x, bp.y, b.w, b.h, b.body.angle, 1 - b.vida / b.vidaMax, b.semente, b.estatico);
    }
    for (i = 0; i < S.galoes.length; i++) { var g = S.galoes[i]; if (!g.explodiu) A.galao(ctx, g.body.position.x, g.body.position.y, g.body.angle, tm, g.pavio >= 0); }
    for (i = 0; i < S.pragas.length; i++) {
      var p = S.pragas[i]; if (p.sumiu) continue;
      var d = R.PRAGAS[p.tipo], px = p.body.position.x, py = p.body.position.y;
      if (p.tipo === 'mosca_zumbidora' && !p.ko) { px += Math.sin(tm * 1.7 + p.fase) * 6; py += Math.sin(tm * 3.1 + p.fase) * 5; }
      if (p.tipo === 'mosca_zumbidora' && p.ko) py += Math.min(40, (S.passos - p.koT) * 0.8);
      A.praga(ctx, p.tipo, px, py, d.r, tm, { ko: p.ko, capacete: p.capacete, semCapacete: p.tipo === 'rato_ladrao' && !p.capacete, ai: agoraS - (ai[p.tipo + '@'] || -9) < 0.35, fase: p.fase });
    }
    // frutas voando
    for (i = 0; i < S.projeteis.length; i++) {
      var f = S.projeteis[i]; if (f.sumiu || f.explodiu) continue;
      var c = f.body, ang = c.angle;
      if (f.tipo === 'pimenta_jato' && c.speed > 1) ang = Math.atan2(c.velocity.y, c.velocity.x);
      else if (f.tipo === 'pimenta_jato') ang = c.angle;
      else if (noAr(f)) ang = Math.atan2(c.velocity.y, c.velocity.x) * 0.15;
      A.fruta(ctx, f.tipo, c.position.x, c.position.y, c.circleRadius || f.r, ang, tm, noAr(f) ? 'voo' : 'bateu',
        { uma: f.uma, jato: f.jato > 0, aceso: f.tipo === 'abacaxi_azedo' && (f.pavio >= 0 || noAr(f)), amassa: f.bigorna && noAr(f) ? -0.12 : 0 });
    }
    // partículas
    desenharParticulas();
    if (puxo) linhaMira(puxo);
    desenharTextos();
  }
  // tela de começo: os garotos, o estilingue e a turma das pragas posando
  var enfeiteX = 600;
  function desenharEnfeite(tm) {
    var rep = { x: 180, y: 470 };
    A.estilingueTras(ctx, 180, 470, rep, 0);
    A.garoto(ctx, 'duda', 30, CHAO, 'parado', tm, null);
    A.garoto(ctx, 'teo', 80, CHAO, 'parado', tm, null);
    A.fruta(ctx, 'maca_podre', 180, 470, 22, 0, tm, 'fila', { fase: 0.3 });
    if (!calmo) A.moscasZonzas(ctx, 180, 470, 22, tm, 2);
    A.estilingueFrente(ctx, 180, 470, rep, 0);
    ['trio_uva', 'pimenta_jato', 'melancia_passada', 'abacaxi_azedo'].forEach(function (id, i) {
      var r = R.FRUTAS[id].r * 0.9; A.fruta(ctx, id, -20 - i * 52, CHAO - r - (id === 'abacaxi_azedo' ? 4 : 0), r, id === 'pimenta_jato' ? -0.5 : 0, tm, 'fila', { fase: i * 1.3 });
    });
    if (enfeiteX == null) return;
    var x = enfeiteX;
    A.bloco(ctx, 'wood_crate', x, 570, 60, 60, 0, 0, 3, false);
    A.bloco(ctx, 'glass_jar', x, 515, 36, 50, 0, 0, 5, false);
    A.praga(ctx, 'rato_ladrao', x, 467, 23, tm, { capacete: true, fase: 1 });
    A.praga(ctx, 'barata_cascuda', x + 56, 582, 18, tm, { fase: 2 });
    A.galao(ctx, x - 62, 571, 0, tm, false);
    A.praga(ctx, 'mosca_zumbidora', x - 70 + Math.sin(tm * 1.7) * 8, 480 + Math.sin(tm * 3.1) * 6, 15, tm, { fase: 0 });
  }
  function desenharParticulas() {
    for (var i = 0; i < particulas.length; i++) {
      var p = particulas[i], a = Math.max(0, p.vida / p.max);
      if (p.tipo === 'caco') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.ang); ctx.globalAlpha = Math.min(1, a * 2);
        ctx.beginPath(); for (var k = 0; k < p.pts.length; k++) ctx.lineTo(p.pts[k][0], p.pts[k][1]); ctx.closePath();
        ctx.fillStyle = p.cor; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = p.vidro ? '#24566e' : A.OUT; ctx.stroke();
        ctx.restore();
      } else if (p.tipo === 'gota') {
        ctx.globalAlpha = Math.min(1, a * 1.5); ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fillStyle = p.cor; ctx.fill();
        ctx.lineWidth = 1.5; ctx.strokeStyle = A.OUT; ctx.stroke();
      } else if (p.tipo === 'nuvem') {
        ctx.globalAlpha = a * 0.85; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1.6 - a * 0.6), 0, 6.2832); ctx.fillStyle = p.cor; ctx.fill();
      } else if (p.tipo === 'brilho') {
        ctx.globalAlpha = a; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.vida * 6);
        ctx.beginPath(); ctx.moveTo(0, -p.r * 1.6); ctx.lineTo(p.r * 0.4, 0); ctx.lineTo(0, p.r * 1.6); ctx.lineTo(-p.r * 0.4, 0); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
      } else if (p.tipo === 'fogo') {
        ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.4 + a * 0.8), 0, 6.2832); ctx.fillStyle = p.cor; ctx.fill();
      } else if (p.tipo === 'onda') {
        ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, p.rmax * (1 - a) + p.r, 0, 6.2832);
        ctx.lineWidth = 8 * a + 2; ctx.strokeStyle = p.verde ? '#c8f56b' : '#fff3b0'; ctx.stroke();
      } else if (p.tipo === 'espinho') {
        ctx.globalAlpha = a; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.ang);
        ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-6, -4); ctx.lineTo(-6, 4); ctx.closePath(); ctx.fillStyle = '#3f9a3a'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = A.OUT; ctx.stroke(); ctx.restore();
      } else if (p.tipo === 'tampa') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.ang); ctx.globalAlpha = Math.min(1, a * 2);
        ctx.beginPath(); ctx.arc(0, 0, 13, Math.PI, 0); ctx.closePath(); ctx.fillStyle = '#d7262e'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = A.OUT; ctx.stroke(); ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }
  function desenharTextos() {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    for (var i = 0; i < textos.length; i++) {
      var x = textos[i], a = x.vida / x.max, s = x.tam * (a > 0.85 ? 1 + (a - 0.85) * 3 : 1) / Math.max(0.55, Math.min(1.2, cam.z));
      ctx.globalAlpha = Math.min(1, a * 2.5);
      ctx.font = '700 ' + Math.round(s) + 'px Fredoka, system-ui, sans-serif';
      ctx.lineWidth = s * 0.22; ctx.strokeStyle = A.OUT; ctx.strokeText(x.t, x.x, x.y); ctx.fillStyle = x.cor; ctx.fillText(x.t, x.x, x.y);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- câmera ---------- */
  function lider() {
    var l = null;
    if (!S) return null;
    for (var i = 0; i < S.projeteis.length; i++) { var p = S.projeteis[i]; if (p.sumiu || p.explodiu) continue; if (!l || (p.principal && !l.principal) || (!p.feito && l.feito)) l = p; }
    return l;
  }
  function camera(dt) {
    var alvoX = cam.x0, alvoZ = cam.z;
    if (tela !== 'jogo' || !S) {   // começo: o chão logo acima do painel (em pé) ou embaixo (deitado)
      var painel = document.querySelector('#menu .painel'), pr = painel ? painel.getBoundingClientRect() : null;
      if (retrato()) { cam.gy = pr ? pr.top + 6 : ch * 0.6; cam.z = Math.max(0.3, Math.min(1, cw / 760)); cam.x0 = -170; enfeiteX = (cw * 0.74) / cam.z + cam.x0; }
      else {
        cam.gy = ch - Math.max(30, ch * 0.08); cam.z = Math.max(0.3, Math.min(1.1, (ch - 30) / 520, cw / 1300)); cam.x0 = -230;
        var livre = pr ? pr.left : cw;   // a turma das pragas fica entre o estilingue e o painel, se couber
        enfeiteX = livre / cam.z + cam.x0 - 90;
        if (enfeiteX < 380) enfeiteX = null;
      }
      return;
    }
    cam.gy = ch - M.chao;
    if (cam.tremor > 0) cam.tremor = Math.max(0, cam.tremor - dt);
    var l = lider();
    if (cam.intro > 0) { cam.intro -= dt; if (cam.intro > 0) return; }
    if (S.estado === 'voo' && l) {
      var fx = l.body.position.x, fy = l.body.position.y;
      alvoZ = Math.max(M.zTudo * 0.8, Math.min(M.zMira, (ch - M.chao - 80) / (CHAO - fy + 160)));
      alvoX = fx - cw / alvoZ * 0.42;
      cam.foco = { x: fx, z: alvoZ };
    } else if (S.estado === 'espera' || S.estado === 'contagem' || S.vitoriaT != null || S.resultado) {
      if (cam.livre) return;
      if (cam.foco) { alvoZ = Math.max(M.zTudo, Math.min(M.zMira, cam.foco.z * 1.05)); alvoX = cam.foco.x - cw / alvoZ * 0.5; }
    } else if (S.estado === 'mira') {
      if (cam.livre) return;
      alvoZ = M.zMira; alvoX = M.xMira;
    }
    var W = S.W;
    alvoX = Math.max(-450, Math.min(W + 350 - cw / alvoZ, alvoX));
    var k = 1 - Math.exp(-dt * (S.estado === 'voo' ? 5 : 3));
    cam.z += (alvoZ - cam.z) * k;
    cam.x0 += (alvoX - cam.x0) * k;
  }

  /* ---------- laço ---------- */
  var ultimoT = 0, acum = 0, pausado = false, t0 = 0;
  document.addEventListener('visibilitychange', function () { pausado = document.hidden; ultimoT = 0; });
  function quadro(agora) {
    requestAnimationFrame(quadro);
    if (!t0) t0 = agora;
    var dt = ultimoT ? Math.min(0.1, (agora - ultimoT) / 1000) : 0;
    ultimoT = agora;
    if (pausado) dt = 0;
    agoraS = (agora - t0) / 1000;
    if (tela === 'jogo' && S) {
      acum += dt;
      var n = 0;
      while (acum >= 1 / 60 && n < 3) { S.passo(); tratar(S.eventos); acum -= 1 / 60; n++; }
      if (n === 3) acum = 0;   // aparelho lento: o jogo fica um pouco mais devagar em vez de travar
      if (carregaT > 0) carregaT -= dt;
      if (poses.ate > 0) { poses.ate -= dt; if (poses.ate <= 0) poses.teo = poses.duda = 'parado'; }
      if (faixaTimer > 0) { faixaTimer -= dt; if (faixaTimer <= 0) $('faixa').hidden = true; }
      if (avisoTimer > 0) { avisoTimer -= dt; if (avisoTimer <= 0 || !retrato()) $('avisoDeitar').hidden = true; }
      if (S.estado === 'contagem') {
        var sobra = Math.ceil(S.contagemT / 60), el = $('contagem');
        if (sobra !== ultimaContagem && sobra > 0) { ultimaContagem = sobra; el.textContent = sobra; el.hidden = false; el.classList.remove('pulsa'); void el.offsetWidth; el.classList.add('pulsa'); Som.tique(); }
      } else if (!$('contagem').hidden) $('contagem').hidden = true;
      if (fimTimer > 0) { fimTimer -= dt; if (fimTimer <= 0 && S.resultado && $('fim').hidden) mostrarFim(); }
      pintarHud();
    }
    // partículas e textos
    for (var i = particulas.length - 1; i >= 0; i--) {
      var p = particulas[i];
      p.vida -= dt;
      if (p.vida <= 0) { particulas.splice(i, 1); continue; }
      if (p.vx != null) { p.x += p.vx * dt; p.y += p.vy * dt; }
      if (p.tipo === 'caco' || p.tipo === 'gota' || p.tipo === 'tampa') { p.vy += 900 * dt; if (p.y > CHAO + 20 && p.vy > 0) { p.y = CHAO + 20; p.vy *= -0.3; p.vx *= 0.6; } }
      if (p.tipo === 'fogo' || p.tipo === 'espinho') { p.vx *= 0.9; p.vy *= 0.9; }
      if (p.ang != null && p.va) p.ang += p.va * dt;
    }
    if (particulas.length > 260) particulas.splice(0, particulas.length - 260);
    for (var j = textos.length - 1; j >= 0; j--) { textos[j].vida -= dt; textos[j].y -= 40 * dt; if (textos[j].vida <= 0) textos.splice(j, 1); }
    camera(dt);
    desenharMundo(agoraS);
  }

  /* ---------- começo ---------- */
  var pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); pedidoInstalar = e; $('btInstalar').hidden = false; });
  $('btInstalar').addEventListener('click', function () { if (!pedidoInstalar) return; pedidoInstalar.prompt(); pedidoInstalar.userChoice.then(function () { pedidoInstalar = null; $('btInstalar').hidden = true; }); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !TESTE) navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });

  if (window.SolverRecursos && !SolverRecursos.ligado('fruta-podre', true)) { document.querySelectorAll('.tela').forEach(function (s) { s.classList.remove('ativa'); }); $('desligado').hidden = false; traduzir(); return; }
  traduzir();
  tamanho();
  if (window.Trilha && !TESTE) Trilha.iniciar({ jogo: 'fruta-podre', musicas: MUSICAS, creditos: 'CREDITOS.md' });
  // a cena só começa a se mexer quando a página terminou de abrir e a tela "Carregando…" (../carregando.js) saiu:
  // no tablet Fire velho, animar desde o começo não deixava a página terminar de carregar
  (function esperar(n) {
    if (document.readyState === 'complete' && (!document.documentElement.classList.contains('bc-carregando') || n > 150)) {
      document.querySelectorAll('canvas[data-retrato]').forEach(function (c) { A.retrato(c, c.getAttribute('data-retrato')); });
      requestAnimationFrame(quadro); return;
    }
    setTimeout(function () { esperar(n + 1); }, 100);
  })(0);

  if (TESTE) window.FrutaDebug = {
    pronto: true, versao: APP_VERSION, MUSICAS: MUSICAS,
    jogar: function (n, nivel) { if (nivel && R.NIVEIS[nivel]) pref.nivel = nivel; comecar(n || 1); },
    estado: function () {
      if (!S) return { tela: tela, fase: null };
      var l = lider();
      return { tela: tela, fase: faseAtual, nivel: S.nivel, turno: S.estado, atual: S.atual, frutas: S.fila.length + (S.atual ? 1 : 0),
        projeteis: S.projeteis.length, lider: l ? { x: l.body.position.x, y: l.body.position.y, tipo: l.tipo } : null,
        pragas: S.vivas(), quebrados: S.blocos.filter(function (b) { return b.quebrado; }).length, impactos: impactos, pontos: S.pontos,
        resultado: S.resultado, fim: !$('fim').hidden, intro: cam.intro > 0, camera: { x0: cam.x0, z: cam.z } };
    },
    lancar: function (angulo, forca) { cam.intro = 0; return lancar(angulo, forca); },
    poder: function () { return usarPoder(); },
    vencer: function () { if (S) S.vencer(); },
    semFrutas: function () { if (S) S.semFrutas(); },
    irMenu: function () { irMenu(); },
    ondeNaTela: function (x, y) { return paraTela(x, y); }
  };
})();

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer jogar não baixa nada a mais. */
(function () {
  if (!/[?&]instalar\b/.test(location.search) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.src = '../instalar.js';
  s.setAttribute('data-nome', 'FRUTA PODRE'); s.setAttribute('data-icone', 'icone-192.png');
  s.setAttribute('data-so-com', 'instalar'); s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
  document.body.appendChild(s);
})();
