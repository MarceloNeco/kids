/* Vruuum! — desenha a corrida: céu, fundo, a estrada em 3D (curvas e morros), enfeites, coisas da
   pista, trânsito, o carro de cada jogador, efeitos (confete, +1, turbo) e o placar.
   Com 2 jogadores a tela divide: lado a lado (tela deitada) ou um em cima do outro (em pé). */
(function (raiz) {
  'use strict';
  var P = raiz.VruuumPista, S = raiz.VruuumSprites;
  var SEG = P.SEG, LARG = P.LARGURA;
  var ALTURA_CAM = 1000;
  var PROF = 1 / Math.tan(50 * Math.PI / 180);   // campo de visão de 100°
  var JOG_Z = ALTURA_CAM * PROF;                 // distância da câmera até o carro
  var EMOJI = S.EMOJI, FONTE = S.FONTE;

  var TEMAS = {
    praia: { ceu: ['#38b6ff', '#c9f0ff'], grama: ['#f3d27a', '#ebc868'], borda: ['#ff4d6d', '#ffffff'], pista: ['#8d929c', '#868b95'], faixa: '#ffffff', sol: '#fff1a6', nome: ['Praia', 'Beach', 'Playa'], emoji: '🏖️', cor: '#1fa3e0' },
    floresta: { ceu: ['#5cc8ff', '#dcf7ff'], grama: ['#4cc35a', '#44b552'], borda: ['#ffffff', '#ff9f1c'], pista: ['#6e737b', '#686d75'], faixa: '#ffffff', sol: '#fff1a6', nome: ['Floresta', 'Forest', 'Bosque'], emoji: '🌲', cor: '#1e9a4e' },
    doces: { ceu: ['#ff9ad5', '#ffe3f3'], grama: ['#ffb6e1', '#ffa8da'], borda: ['#ffffff', '#ff3d8b'], pista: ['#7a4a33', '#734530'], faixa: '#fff7c2', sol: '#fff7c2', nome: ['Terra dos Doces', 'Candy Land', 'Tierra de las Chuches'], emoji: '🍭', cor: '#ff4fa3' },
    neve: { ceu: ['#8fb8ff', '#eef4ff'], grama: ['#f4f8ff', '#e4ecfb'], borda: ['#3a86ff', '#ffffff'], pista: ['#7d8590', '#77808a'], faixa: '#ffd166', sol: '#ffffff', nome: ['Montanha de Neve', 'Snow Mountain', 'Montaña Nevada'], emoji: '❄️', cor: '#3a86ff' },
    neon: { ceu: ['#0d0630', '#4b1a7a'], grama: ['#1b1250', '#160f45'], borda: ['#ff2bd6', '#2bf4ff'], pista: ['#2a2550', '#25204a'], faixa: '#2bf4ff', sol: null, nome: ['Cidade Neon', 'Neon City', 'Ciudad Neón'], emoji: '🌃', cor: '#9b5de5', noite: true },
    // 1.11.0: mundos fantásticos
    canion: { ceu: ['#4aa8ff', '#ffe0a8'], grama: ['#e8b36a', '#dfa75c'], borda: ['#ff6b35', '#ffffff'], pista: ['#7a7f87', '#737880'], faixa: '#ffd166', sol: '#fff1a6', nome: ['Cânion do Deserto', 'Desert Canyon', 'Cañón del Desierto'], emoji: '🏜️', cor: '#e07a2f' },
    templo: { ceu: ['#3fa7b5', '#bfeee0'], grama: ['#2f8a5a', '#2a7d51'], borda: ['#e9c46a', '#2a9d8f'], pista: ['#8fa3a0', '#879b98'], faixa: '#e9f5db', sol: '#fff1a6', nome: ['Templo na Selva', 'Jungle Temple', 'Templo en la Selva'], emoji: '🗿', cor: '#2a9d8f' },
    lava: { ceu: ['#ff7b54', '#ffd3a5'], grama: ['#4a1d14', '#3f1811'], borda: ['#ff6a00', '#ffd166'], pista: ['#4a3b3f', '#443539'], faixa: '#ffb703', sol: '#ffe0a0', nome: ['Vulcão de Lava', 'Lava Volcano', 'Volcán de Lava'], emoji: '🌋', cor: '#e85d04' },
    lanche: { ceu: ['#ffb36b', '#ffe9c2'], grama: ['#e63946', '#ffffff'], borda: ['#ffd23f', '#e63946'], pista: ['#5a5a66', '#53535e'], faixa: '#ffd23f', sol: '#fff1a6', nome: ['Cidade do Lanche', 'Burger Town', 'Ciudad Hamburguesa'], emoji: '🍔', cor: '#e63946' },
    blocos: { ceu: ['#5aa9ff', '#cfe8ff'], grama: ['#5fd068', '#4caf50'], borda: ['#8a5a36', '#c9ced6'], pista: ['#8d8d8d', '#858585'], faixa: '#ffffff', sol: '#fff7c2', nome: ['Mundo dos Blocos', 'Block World', 'Mundo de Bloques'], emoji: '🧱', cor: '#4caf50' },
    flutuante: { ceu: ['#6a7bff', '#c8b6ff'], grama: ['#1d8a7a', '#18806f'], borda: ['#ff4fd8', '#7cf9ff'], pista: ['#6b5b95', '#64558c'], faixa: '#c6ff3d', sol: '#fff7c2', nome: ['Ilhas Flutuantes', 'Floating Islands', 'Islas Flotantes'], emoji: '✨', cor: '#7b2cbf' }
  };
  // visual NEON (padrão): os mesmos mundos à noite, estrada escura com bordas de neon
  var NEON = {
    praia: { ceu: ['#040714', '#1b1150'], grama: ['#0f1e36', '#182b4d'], pista: ['#15161f', '#121319'], borda: ['#00e5ff', '#ff3df0'], faixa: '#00e5ff' },
    floresta: { ceu: ['#020a08', '#0e2a22'], grama: ['#0b1d14', '#132b1f'], pista: ['#131614', '#101311'], borda: ['#39ff88', '#ffd166'], faixa: '#39ff88' },
    doces: { ceu: ['#0f0316', '#3a0d3f'], grama: ['#1f0b23', '#2d1133'], pista: ['#1a1219', '#161015'], borda: ['#ff4fd8', '#7cf9ff'], faixa: '#ff4fd8' },
    neve: { ceu: ['#030714', '#142650'], grama: ['#18213a', '#232f4f'], pista: ['#151a24', '#12161f'], borda: ['#7cc8ff', '#ffffff'], faixa: '#7cc8ff' },
    neon: { ceu: ['#05010f', '#2a0b55'], grama: ['#130a30', '#1e1146'], pista: ['#120d24', '#0f0b1f'], borda: ['#ff2bd6', '#2bf4ff'], faixa: '#2bf4ff' },
    canion: { ceu: ['#0b0612', '#3b1a2a'], grama: ['#2a160f', '#341c12'], pista: ['#1a1514', '#161210'], borda: ['#ff8c1a', '#ffd166'], faixa: '#ff8c1a' },
    templo: { ceu: ['#02100f', '#0b3a3a'], grama: ['#062018', '#0a2c21'], pista: ['#122422', '#0f1f1d'], borda: ['#3ef0d0', '#ffd166'], faixa: '#3ef0d0' },
    lava: { ceu: ['#120204', '#4a0c0c'], grama: ['#240806', '#2e0b08'], pista: ['#1d1213', '#180f10'], borda: ['#ff4d00', '#ffd000'], faixa: '#ff7b00' },
    lanche: { ceu: ['#120606', '#4a1a12'], grama: ['#3a0e14', '#2a2a36'], pista: ['#16141c', '#121018'], borda: ['#ffd23f', '#ff3b4f'], faixa: '#ffd23f' },
    blocos: { ceu: ['#020814', '#0e2448'], grama: ['#123a1a', '#0f3016'], pista: ['#1c1c22', '#18181e'], borda: ['#5fd068', '#ffd166'], faixa: '#5fd068' },
    flutuante: { ceu: ['#030218', '#1a0b4a'], grama: ['#04241f', '#062e28'], pista: ['#160f2a', '#120c24'], borda: ['#3effd8', '#ff4fd8'], faixa: '#c6ff3d' }
  };
  Object.keys(NEON).forEach(function (k) { var a = NEON[k], b = TEMAS[k]; a.nome = b.nome; a.emoji = b.emoji; a.cor = b.cor; a.noite = true; a.sol = null; });
  // visual: 'neon' (noite), 'colorido' (dia) ou 'misto' (alterna dia e noite a cada BLOCO pedaços da pista)
  var ESTILO = 'misto', BLOCO = 260, TRANSICAO = 150;   // a troca dia/noite dura 150 pedaços: 75 antes e 75 depois da virada
  function ehNeon(i) { return ESTILO === 'neon' || (ESTILO === 'misto' && Math.floor(i / BLOCO) % 2 === 1); }
  // quanto de noite no pedaço i (0 a 1), com o céu escurecendo/clareando aos poucos na troca
  function noiteEm(i) {
    if (ESTILO !== 'misto') return ESTILO === 'neon' ? 1 : 0;
    var b = Math.floor(i / BLOCO), p = i - b * BLOCO, meio = TRANSICAO / 2, v = b % 2 === 1 ? 1 : 0;
    function sv(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
    if (p < meio && b > 0) return (1 - v) + (v - (1 - v)) * sv(0.5 + p / TRANSICAO);              // começo do bloco: ainda vindo do anterior
    if (BLOCO - p < meio) return v + ((1 - v) - v) * sv(0.5 - (BLOCO - p) / TRANSICAO);          // fim do bloco: já indo para o próximo
    return v;
  }
  function tema(nome, i) { return (i == null ? ESTILO !== 'colorido' : ehNeon(i)) ? NEON[nome] : TEMAS[nome]; }
  // ---------- cores da pista misturadas aos poucos ----------
  /* A cor do chão, da pista, das bordas e das faixas de cada pedaço vem da mistura de 4 paletas: o mundo de antes e o
     de agora (troca devagar, 85 pedaços antes e depois do portal) e o dia e a noite (TRANSICAO pedaços em volta da
     virada). Cada pedaço tem a sua mistura: andando para a frente, o piso vai mudando de cor aos poucos.
     Assim a estrada não muda de marrom para cinza (ou de clara para neon) de uma vez. */
  var cachePal = [], inicioMundo = [], mundosPal = [];
  function hexRgb(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mixRgb(a, b, f) { return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; }
  function hexDe(c) { var t = '#'; for (var k = 0; k < 3; k++) t += ('0' + Math.round(c[k]).toString(16)).slice(-2); return t; }
  function css(c) { return 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')'; }
  function suaveT(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function paleta(t) { return { grama: t.grama.map(hexRgb), pista: t.pista.map(hexRgb), borda: t.borda.map(hexRgb), faixa: hexRgb(t.faixa) }; }
  function mixPal(a, b, f) {
    if (f <= 0) return a; if (f >= 1) return b;
    return { grama: [0, 1].map(function (k) { return mixRgb(a.grama[k], b.grama[k], f); }), pista: [0, 1].map(function (k) { return mixRgb(a.pista[k], b.pista[k], f); }),
      borda: [0, 1].map(function (k) { return mixRgb(a.borda[k], b.borda[k], f); }), faixa: mixRgb(a.faixa, b.faixa, f) };
  }
  function prepararPaletas(pista) {
    cachePal = []; inicioMundo = [0]; mundosPal = pista.mundos.map(function (m) { return { dia: paleta(TEMAS[m]), noite: paleta(NEON[m]) }; });
    for (var i = 1; i < pista.segs.length; i++) if (pista.segs[i].mundo !== pista.segs[i - 1].mundo) inicioMundo[pista.segs[i].mundo] = i;
  }
  // paleta do pedaço i: { grama, pista, borda, faixa (já em texto css), noite: 0 a 1 }
  function corPedaco(pista, s) {
    var i = s.i, c = cachePal[i];
    if (c && c.estilo === ESTILO) return c;
    var noite = noiteEm(i), m = s.mundo, MEIO = 85;
    function doMundo(k) { var p = mundosPal[k] || mundosPal[0]; return mixPal(p.dia, p.noite, noite); }
    var pal = doMundo(m);
    // perto de um portal: mistura com o mundo vizinho
    if (m > 0 && i - inicioMundo[m] < MEIO) pal = mixPal(doMundo(m - 1), pal, suaveT((i - inicioMundo[m] + MEIO) / (2 * MEIO)));
    else if (inicioMundo[m + 1] && inicioMundo[m + 1] - i <= MEIO) pal = mixPal(pal, doMundo(m + 1), suaveT((i - inicioMundo[m + 1] + MEIO) / (2 * MEIO)));
    c = { estilo: ESTILO, noite: noite, num: pal, grama: pal.grama.map(css), pista: pal.pista.map(css), borda: pal.borda.map(css), faixa: css(pal.faixa),
      bordaNoite: css(mixRgb(pal.borda[0], [255, 255, 255], 0.05)) };
    cachePal[i] = c;
    return c;
  }
  function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function luz(c, x, y, r, hex, a) {   // brilho redondo somando luz (fica bonito no escuro)
    if (r < 0.8) return;
    var g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(hex, a)); g.addColorStop(0.35, rgba(hex, a * 0.45)); g.addColorStop(1, rgba(hex, 0));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }
  var fundosNoite = {};
  function fundoNoite(nome) {
    if (fundosNoite[nome]) return fundosNoite[nome];
    var o = base.fundos[nome], cv = document.createElement('canvas'); cv.width = o.width; cv.height = o.height;
    var c = cv.getContext('2d'); c.drawImage(o, 0, 0); c.globalCompositeOperation = 'source-atop'; c.fillStyle = nome === 'neon' ? 'rgba(6,4,24,.35)' : 'rgba(6,6,24,.72)'; c.fillRect(0, 0, cv.width, cv.height);
    // janelinhas acesas nos morros/cidade
    c.globalCompositeOperation = 'source-atop'; var s0 = 11;
    for (var k = 0; k < 70; k++) { s0 = (s0 * 9301 + 49297) % 233280; var x = s0 / 233280 * cv.width; s0 = (s0 * 9301 + 49297) % 233280; var y = cv.height * (0.55 + s0 / 233280 * 0.45); c.fillStyle = k % 3 ? 'rgba(255,209,102,.8)' : 'rgba(43,244,255,.7)'; c.fillRect(x, y, 2, 2); }
    fundosNoite[nome] = cv; return cv;
  }
  var NAO_ESCURECE = { blocoOuro: 1, poste: 1, predio: 1, palmeiraNeon: 1, tocha: 1, pocoLava: 1, cristal: 1, arvoreLuz: 1, cogumeloLuz: 1, florLanterna: 1 };
  function enfeiteSpr(tipo, nS) { var b = base[tipo]; if (!b || !nS || NAO_ESCURECE[tipo]) return b; return S.escurecido(tipo, b, 0.6); }
  var ITEM_NEON = { estrela: 'estrelaNeon', turbo: 'turboNeon', lama: 'oleo' };

  var CORES = ['#ff3b5c', '#ffb703', '#3a86ff', '#2ec4b6', '#9b5de5', '#ff7ac6'];
  var PILOTOS = ['🐱', '🐶', '🦄', '🐼', '🐸', '🐰', '🦊', '🐯'];

  var lingua = 'pt', base = null, carrosJog = [], portais = [], largada = null, chegada = null;
  var ALT_VOO = 6500;               // altura do voo acima da estrada (quem vai de avião, jato ou helicóptero)
  var VOA = [], VEIC = [], INFO = [], RIV = [], porSegR = {};   // RIV: desenho, ficha e piloto de cada rival   // por jogador: voa?, a ficha do veículo e o piloto (bichinho ou selfie)
  var Cab = function () { return raiz.VruuumCabeca; };
  function infoPiloto(cor, piloto, foto, pers) {
    var P2 = raiz.VruuumPersonagens, p = pers && P2 ? P2.achar(pers) : null;
    return { emoji: piloto, foto: p ? null : (foto || null), personagem: p, cor: cor, camisa: V() ? V().tom(cor, -0.4) : '#3a2f73' };
  }
  // o piloto vivo: de costas, e de vez em quando vira, olha e sorri
  function pilotoVivo(c, vv, x0, y0, cw, ch, info, semente, periodo, onde) { if (Cab()) Cab().desenhar(c, vv, x0, y0, cw, ch, info, Date.now() / 1000, semente, periodo, onde); }
  var CAV = function () { return raiz.VruuumCavalo; };
  var MOD = function () { return raiz.VruuumModelos; };
  // veículo em 3D (modelos3d.js) ao vivo: gira de lado na curva, inclina no morro e no pulo; o piloto vai dentro, na ordem certa
  function modeloVivo(c, vv, x0, y0, cw, ch, info, fase, lado, inclina, semente, periodo, voo, orbita, barco) {
    var tt = Date.now() / 1000, est = Cab() && Cab().estado ? Cab().estado(tt, semente, periodo) : { giro: 0 };
    MOD().vivo(c, vv.modelo, x0, y0, cw, ch, info.cor, fase, lado, inclina, { t: tt, voo: voo, giroCabeca: est.giro, orbita: orbita || 0, barco: !!barco,
      cabeca: vv.semPiloto ? null : function (c2, x, y, r) { if (Cab()) Cab().desenhar(c2, vv, x0, y0, cw, ch, info, tt, semente, periodo, { x: x, y: y, r: r }); } });
  }
  // onde fica a cabeça de quem monta o cavalo (sobe e desce com o galope); nos outros veículos, a do desenho
  function ondeCabeca(vv, x0, y0, cw, ch, fase) { return vv && vv.cavalo && CAV() ? CAV().cabeca(x0, y0, cw, ch, fase, 0, vv.bicho) : null; }
  var V = function () { return raiz.VruuumVeiculos; };
  // o que aparece no lugar de cada coisa quando se está voando
  var NO_CEU = { cone: 'passaro', lama: 'nuvemRaio', turbo: 'anel', rampa: 'corrente', onibus: 'balao' };
  // no rio (1.18.0): o cone vira boia, a lama vira redemoinho, o turbo vira setas e o trânsito vira lancha
  var NA_AGUA = { cone: 'boia', lama: 'redemoinho', turbo: 'setas' };
  function sprAgua(tipo) { if (NA_AGUA[tipo]) return NA_AGUA[tipo]; if (tipo.indexOf('carro') === 0) return 'lancha' + tipo.slice(5); if (tipo === 'onibus') return 'lancha3'; return tipo; }
  var AGUA = [[30, 159, 214], [42, 176, 228]], AGUA_NOITE = [12, 52, 98], MARGEM = [[214, 186, 128], [190, 160, 104]];
  // espuma branca em volta de quem está boiando
  function espuma(c, x, y, dw) {
    c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.ellipse ? c.ellipse(x, y, dw * 0.55, dw * 0.08, 0, 0, Math.PI * 2) : c.arc(x, y, dw * 0.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(170,230,255,.8)'; c.beginPath(); c.ellipse ? c.ellipse(x, y, dw * 0.42, dw * 0.05, 0, 0, Math.PI * 2) : c.arc(x, y, dw * 0.4, 0, Math.PI * 2); c.fill();
  }
  function sprCeu(tipo) { if (NO_CEU[tipo]) return NO_CEU[tipo]; if (tipo.indexOf('carro') === 0) return 'aviaoTrafego' + tipo.slice(5); return tipo; }
  function hash(i) { return ((i * 9301 + 49297) % 233280) / 233280; }
  var VS = [];   // estado de cada vista (fundo andando, inclinação, partículas, faixas de texto)
  var porSeg = {};

  function ordinalEn(n) { return n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'; }
  function milhar(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, lingua === 'en' ? ',' : '.'); }
  function t(pt, en, es) { return lingua === 'en' ? en : lingua === 'es' && es != null ? es : pt; }   // pt, en, es (o idioma vem da estante)
  function misturar(a, b, f) {
    var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
    var r = Math.round(((x >> 16) & 255) * (1 - f) + ((y >> 16) & 255) * f), g = Math.round(((x >> 8) & 255) * (1 - f) + ((y >> 8) & 255) * f), bl = Math.round((x & 255) * (1 - f) + (y & 255) * f);
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }

  function preparar(estado, jogadores, lang, visual) {
    lingua = lang || 'pt';
    ESTILO = visual === 'colorido' || visual === 'neon' ? visual : 'misto';
    base = S.basicos();
    carrosJog = jogadores.map(function (j) { return S.carroJogador(j.cor, null, j.veic, undefined, j.corpo); });
    INFO = jogadores.map(function (j) { var inf = infoPiloto(j.cor, j.piloto, j.foto, j.personagem); inf.corpo = j.corpo; return inf; });
    VEIC = jogadores.map(function (j) { return V() ? V().achar(j.veic) : null; });
    VOA = jogadores.map(function (j) { return !!(V() && V().voa(j.veic)); });
    RIV = (estado.rivais || []).map(function (r) { var P3 = raiz.VruuumPersonagens; return { spr: S.carroJogador(r.cor, null, r.veic, undefined, (P3 && P3.corpoDe(r.id)) || (r.r % 2 ? 'menino' : 'menina')), veic: V() ? V().achar(r.veic) : null, voa: !!(V() && V().voa(r.veic)), info: infoPiloto(r.cor, '', null, r.id) }; });
    prepararPaletas(estado.pista);
    portais = estado.pista.mundos.map(function (m) { var tm = TEMAS[m]; return S.arco(tm.emoji + ' ' + t(tm.nome[0], tm.nome[1], tm.nome[2]), tm.cor, '#ffffff', false); });
    largada = S.arco(t('🚦 VAI! 🚦', '🚦 GO! 🚦', '🚦 ¡YA! 🚦'), '#ff4fa3', '#ffffff', false);
    chegada = S.arco(t('🏁 CHEGADA 🏁', '🏁 FINISH 🏁', '🏁 META 🏁'), '#1a1446', '#ffffff', true);
    VS = jogadores.map(function () { return { fundoX: 0, nuvemX: 0, lado: 0, parts: [], faixa: null, chegouT: -1 }; });
  }

  function vistas(W, H, n) {
    if (n < 2) return [{ x: 0, y: 0, w: W, h: H }];
    var g = Math.max(2, Math.round(Math.min(W, H) * 0.006));
    if (W >= H) return [{ x: 0, y: 0, w: Math.floor((W - g) / 2), h: H }, { x: Math.ceil((W + g) / 2), y: 0, w: Math.floor((W - g) / 2), h: H }];
    return [{ x: 0, y: 0, w: W, h: Math.floor((H - g) / 2) }, { x: 0, y: Math.ceil((H + g) / 2), w: W, h: Math.floor((H - g) / 2) }];
  }

  // bordas seguras (recorte da câmera, cantos arredondados, barra de gestos): só valem para a
  // vista que encosta naquela borda da tela
  function margemLocal(v, W, H, m) {
    m = m || {};
    return { t: v.y <= 0 ? (m.t || 0) : 0, r: v.x + v.w >= W - 1 ? (m.r || 0) : 0, b: v.y + v.h >= H - 1 ? (m.b || 0) : 0, l: v.x <= 0 ? (m.l || 0) : 0 };
  }
  function tamU(v) { return Math.max(12, Math.min(v.w, v.h) / 18); }
  // botão PULAR (toque): acima da seta da direita, longe do carro; coordenadas da tela inteira
  function botaoPulo(v, ml) {
    var u = tamU(v), r = u * 1.7;
    return { x: v.x + v.w - ml.r - u * 2.6, y: v.y + v.h - ml.b - u * 7.6, r: r };
  }

  // ---------- efeitos ----------
  // horizonte a ~30% da altura e o veículo com a base a 90%: a tela fica cheia, em pé ou deitado.
  // K: escala de tamanho e largura; KY: escala da altura (em pé, a estrada se estica para cima, como uma câmera mais alta)
  function geom(v) {
    var empe = v.h > v.w, cy = v.h * (empe ? 0.28 : 0.3), KY = v.h * 0.9 - cy;
    var K = Math.min(empe ? v.w * 0.62 : v.w * 0.5, KY * 1.1);
    return { K: K, KY: KY, cx: v.w / 2, cy: cy };
  }
  function texto(vs, txt, cor, tam) { vs.parts.push({ tipo: 'txt', txt: txt, cor: cor, tam: tam || 1, x: 0, y: 0, vx: 0, vy: -1.2, vida: 1.1, max: 1.1 }); }
  function confete(vs, n, lugar) {
    for (var k = 0; k < n; k++) vs.parts.push({ tipo: 'conf', cor: S.ARCO[k % 7], x: (Math.random() - 0.5) * 0.3, y: lugar === 'cima' ? -1.6 : -0.3, vx: (Math.random() - 0.5) * 2.2, vy: lugar === 'cima' ? Math.random() * 0.5 : -1.5 - Math.random() * 1.5, vida: 2 + Math.random(), max: 3, giro: Math.random() * 6 });
  }
  function evento(ev, estado) {
    var vs = VS[ev.j];
    if (ev.tipo === 'vai') { var tm0 = TEMAS[estado.pista.mundos[0]]; VS.forEach(function (v) { v.faixa = { txt: tm0.emoji + ' ' + t(tm0.nome[0], tm0.nome[1], tm0.nome[2]), ate: 2.6, cor: tm0.cor }; }); return; }
    if (ev.tipo === 'mundo') { VS.forEach(function (v, k) { if (k === ev.j && !(v.faixa && v.faixaCheck > 0)) { var tm = TEMAS[ev.nome]; v.faixa = { txt: tm.emoji + ' ' + t(tm.nome[0], tm.nome[1], tm.nome[2]) + '!', ate: 2.6, cor: tm.cor }; } }); return; }
    if (!vs) return;
    if (ev.tipo === 'lugar') { texto(vs, (ev.subiu ? '⬆ ' : '⬇ ') + ev.lugar + (lingua === 'en' ? ordinalEn(ev.lugar) : 'º'), ev.subiu ? '#c6ff3d' : '#ff9f1c', 1.2); return; }
    if (ev.tipo === 'pontos') { if (ev.motivo !== 'checkpoint' && ev.motivo !== 'chegada') texto(vs, (ev.p > 0 ? '+' : '') + ev.p, ev.p > 0 ? '#ffd93d' : '#ff6b6b', ev.p >= 200 ? 1.3 : 1); return; }
    if (ev.tipo === 'checkpoint') { var tmC = TEMAS[estado.pista.mundos[ev.numero]]; vs.faixa = { txt: 'CHECKPOINT +' + milhar(500 + ev.bonus) + ' · ' + tmC.emoji + ' ' + t(tmC.nome[0], tmC.nome[1], tmC.nome[2]), ate: 2.8, cor: '#c6ff3d' }; confete(vs, 30, 'cima'); fogos(vs, 3); vs.faixaCheck = 2.6; return; }
    if (ev.tipo === 'estrela') { brilhinhos(vs, 6); if (ev.ar) confete(vs, 8); }
    else if (ev.tipo === 'faisca') texto(vs, ['', t('Derrapando!', 'Drifting!', '¡Derrapando!'), t('Derrapagem!!', 'Super drift!!', '¡Súper derrape!!'), t('DERRAPAGEM MÁXIMA!', 'MAX DRIFT!', '¡DERRAPE MÁXIMO!')][ev.nivel], COR_FAISCA[ev.nivel], 1 + ev.nivel * 0.15);
    else if (ev.tipo === 'miniturbo') { texto(vs, ev.nivel === 3 ? 'ULTRA TURBO!' : 'MINI TURBO!', COR_FAISCA[ev.nivel], 1.3 + ev.nivel * 0.15); brilhinhos(vs, 8 * ev.nivel, COR_FAISCA[ev.nivel]); if (ev.nivel === 3) fogos(vs, 1); }
    else if (ev.tipo === 'caixa') { if (ev.nova) texto(vs, '❓', '#ffffff', 1.4); brilhinhos(vs, 10, '#7cf9ff'); }
    else if (ev.tipo === 'poder') texto(vs, ev.poder === 'escudo' ? t('🛡️ Bolha!', '🛡️ Bubble!', '🛡️ ¡Burbuja!') : ev.poder === 'foguete' ? t('🚀 Foguete!', '🚀 Rocket!', '🚀 ¡Cohete!') : t('🟢 Gosma!', '🟢 Goo!', '🟢 ¡Baba!'), ev.poder === 'escudo' ? '#c6ff3d' : ev.poder === 'foguete' ? '#ff9f1c' : '#7ae03d', 1.5);
    else if (ev.tipo === 'escudoBate') texto(vs, t('Bóing!', 'Boing!', '¡Boing!'), '#c6ff3d', 1.3);
    else if (ev.tipo === 'splat') { texto(vs, ev.abobora ? t('🎃 Abóbora!', '🎃 Pumpkin!', '🎃 ¡Calabaza!') : 'SPLAT!', ev.abobora ? '#ff8c1a' : '#7ae03d', 1.6); }
    else if (ev.tipo === 'vira' && ev.dracula) texto(vs, t('🧛 Conde Drácula!', '🧛 Count Dracula!', '🧛 ¡Conde Drácula!'), '#ff4d6d', 1.3);
    else if (ev.tipo === 'pulo' && VEIC[ev.j] && VEIC[ev.j].galinha) texto(vs, t('Cocoricóóó!', 'Cock-a-doodle-doo!', '¡Quiquiriquííí!'), '#ffffff', 1.4);
    else if (ev.tipo === 'looping') texto(vs, 'LOOPING!', '#ff4fd8', 1.8);
    else if (ev.tipo === 'agua') { var vA = VEIC[ev.j] || {}; texto(vs, vA.cavalo || vA.galinha || vA.id === 'ovo' ? t('🌊 Nadando!', '🌊 Swimming!', '🌊 ¡A nadar!') : vA.bracos ? t('🏄 Surfando!', '🏄 Surfing!', '🏄 ¡A surfear!') : t('🌊 Virou barco!', '🌊 Boat mode!', '🌊 ¡Ahora eres un barco!'), '#7cf9ff', 1.6); for (k = 0; k < 16; k++) vs.parts.push({ tipo: 'gota', cor: k % 2 ? '#ffffff' : '#7cd6ff', x: (Math.random() - 0.5) * 0.6, y: -0.1, vx: (Math.random() - 0.5) * 2.6, vy: -1.8 - Math.random(), vida: 0.9, max: 0.9 }); }
    else if (ev.tipo === 'terra') texto(vs, t('🚗 De volta à estrada!', '🚗 Back on the road!', '🚗 ¡De vuelta a la carretera!'), '#ffffff', 1.1);
    else if (ev.tipo === 'loopFeito') { texto(vs, t('Que looping!', 'What a loop!', '¡Menudo looping!'), '#c6ff3d', 1.5); fogos(vs, 2); confete(vs, 25, 'cima'); }
    else if (ev.tipo === 'perdeu') { for (var k = 0; k < Math.min(ev.q, 6); k++) vs.parts.push({ tipo: 'est', x: 0, y: -0.2, vx: (Math.random() - 0.5) * 2.4, vy: -1.8 - Math.random(), vida: 1.2, max: 1.2 }); }
    else if (ev.tipo === 'batida') texto(vs, t('Opa!', 'Oops!', '¡Uy!'), '#ffffff', 1.4);
    else if (ev.tipo === 'cone' && VOA[ev.j]) texto(vs, t('Piu piu!', 'Tweet!', '¡Pío pío!'), '#ff9f1c', 1.2);
    else if (ev.tipo === 'lama' && VOA[ev.j]) texto(vs, t('Turbulência!', 'Turbulence!', '¡Turbulencia!'), '#dfe6ff', 1.2);
    else if (ev.tipo === 'pulo' && VOA[ev.j]) texto(vs, ev.manual ? t('Subindo!', 'Climb!', '¡Subiendo!') : t('Corrente de ar!', 'Updraft!', '¡Corriente de aire!'), '#c6ff3d', 1.3);
    else if (ev.tipo === 'cone') texto(vs, t('Ops!', 'Oops!', '¡Ups!'), '#ff9f1c', 1.2);
    else if (ev.tipo === 'lama') { texto(vs, t('Splash!', 'Splash!', '¡Splash!'), '#c98a4b', 1.2); for (k = 0; k < 10; k++) vs.parts.push({ tipo: 'gota', cor: '#6b3e1f', x: (Math.random() - 0.5) * 0.4, y: -0.1, vx: (Math.random() - 0.5) * 2, vy: -1.5 - Math.random(), vida: 0.8, max: 0.8 }); }
    else if (ev.tipo === 'turbo') texto(vs, 'TURBO!', '#3ee8ff', 1.6);
    else if (ev.tipo === 'pulo') texto(vs, ev.manual ? t('Hop!', 'Hop!', '¡Hop!') : t('Uhuuu!', 'Wheee!', '¡Yujuuu!'), '#c6ff3d', ev.manual ? 1.1 : 1.5);
    else if (ev.tipo === 'buzina') { var vz = VEIC[ev.j] && VEIC[ev.j].voz, BZ = { galo: t('Cocoricó!', 'Cock-a-doodle-doo!', '¡Quiquiriquí!'), cavalo: t('Iiirrrí!', 'Neigh!', '¡Hiiiii!'), dino: t('ROOOAR!', 'ROOOAR!', '¡ROOOAR!'), arara: t('Cráá!', 'Squawk!', '¡Craaa!'), morcego: t('Iiiik!', 'Eeek!', '¡Iiiik!') }; texto(vs, BZ[vz] || t('Bi-bi!', 'Beep-beep!', '¡Bip-bip!'), '#ff7ac6', 1.1); }
    else if (ev.tipo === 'chegou') { vs.chegouT = 0; vs.lugar = ev.lugar; confete(vs, 70, 'cima'); fogos(vs, 8); }
  }
  function passo(dt, estado, entradas) {
    estado.jogadores.forEach(function (j, k) {
      var vs = VS[k]; if (!vs) return;
      var seg = P.achar(estado.pista, j.z), pct = j.vel / estado.pista.cfg.velMax;
      vs.fundoX = (vs.fundoX + seg.curva * pct * dt * 0.015 + 10) % 1;
      vs.nuvemX = (vs.nuvemX + seg.curva * pct * dt * 0.007 + dt * 0.004 + 10) % 1;
      var alvo = (entradas && entradas[k] && entradas[k].dir) || 0;
      vs.lado += (alvo - vs.lado) * Math.min(1, dt * 8);
      if (vs.faixa) { vs.faixa.ate -= dt; if (vs.faixa.ate <= 0) vs.faixa = null; }
      if (vs.chegouT >= 0) { vs.chegouT += dt; if (vs.chegouT < 2.5 && Math.random() < dt * 6) confete(vs, 6, 'cima'); if (vs.chegouT < 3 && Math.random() < dt * 2.5) fogos(vs, 1); }
      var novos = [];
      vs.parts = vs.parts.filter(function (p) {
        p.vida -= dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.tipo === 'brasa') { p.vy += 0.9 * dt; p.vx *= 0.985; }
        else if (p.tipo === 'rojao') { p.vy += 1.2 * dt; if (p.vida <= 0) novos.push(p); }
        else if (p.tipo !== 'txt') p.vy += 3 * dt;
        if (p.tipo === 'conf') { p.vy = Math.min(p.vy, 0.8); p.giro += dt * 8; }
        return p.vida > 0;
      });
      novos.forEach(function (p) { estourar(vs, p); });
    });
  }

  // ---------- desenho ----------
  // sombra no chão debaixo de quem anda (e, à noite, um brilho fraco): sem ela, no neon, carro e rival pareciam flutuar
  function sombraChao(c, x, y, dw, noite, cor) {
    if (dw < 3) return;
    c.fillStyle = 'rgba(0,0,0,' + (0.28 + 0.2 * noite).toFixed(2) + ')';
    c.beginPath(); if (c.ellipse) c.ellipse(x, y, dw * 0.46, Math.max(1, dw * 0.075), 0, 0, Math.PI * 2); else c.arc(x, y, dw * 0.4, 0, Math.PI * 2); c.fill();
    if (noite > 0.3 && cor) { c.save(); c.globalCompositeOperation = 'lighter'; c.translate(x, y); c.scale(1, 0.22); luz(c, 0, 0, dw * 0.6, cor, 0.45 * noite); c.restore(); }
  }
  function poligono(c, x1, y1, x2, y2, x3, y3, x4, y4, cor) { c.fillStyle = cor; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.lineTo(x4, y4); c.closePath(); c.fill(); }
  function sprite(c, spr, esc, x, y, clip, w) {
    var dw = spr.w * esc, dh = spr.h * esc, dx = x - dw / 2, dy = y - dh;
    if (dw < 1 || dx > w || dx + dw < 0) return;
    var corte = clip ? Math.max(0, dy + dh - clip) : 0;
    if (corte >= dh) return;
    var ih = spr.img.height * (1 - corte / dh);
    if (ih < 1) return;
    c.drawImage(spr.img, 0, 0, spr.img.width, ih, dx, dy, dw, dh - corte);
  }
  function camada(c, img, w, yBase, alt, desloc, alfa) {
    var lw = img.width * alt / img.height, x0 = -((desloc % 1 + 1) % 1) * lw;
    c.globalAlpha = alfa;
    for (var x = x0; x < w; x += lw) c.drawImage(img, x, yBase - alt, lw + 1, alt);
    c.globalAlpha = 1;
  }

  var aX = new Float64Array(640), aY = new Float64Array(640), aS = new Float64Array(640), aClip = new Float64Array(640), aZ = new Float64Array(640);

  function desenharVista(c, v, e, ji, op) {
    var j = e.jogadores[ji], pista = e.pista, segs = pista.segs, vs = VS[ji];
    var w = v.w, h = v.h, g = geom(v), K = g.K, KY = g.KY, cx = g.cx, cy = g.cy;
    c.save(); c.beginPath(); c.rect(v.x, v.y, w, h); c.clip(); c.translate(v.x, v.y);
    if (j.tremor > 0 || j.rodando > 0) c.translate((Math.random() - 0.5) * K * 0.025, (Math.random() - 0.5) * K * 0.025);
    else if (j.turbo > 0) c.translate((Math.random() - 0.5) * K * 0.008, (Math.random() - 0.5) * K * 0.008);   // turbo: tremidinha

    var camZ = Math.max(0, j.z - JOG_Z);
    var baseI = Math.floor(camZ / SEG), basePct = (camZ % SEG) / SEG;
    var jSeg = P.achar(pista, j.z), jPct = (j.z % SEG) / SEG;
    var jY = jSeg.p1.y + (jSeg.p2.y - jSeg.p1.y) * jPct;
    var voa = !!VOA[ji], camY = jY + ALTURA_CAM + (voa ? ALT_VOO : 0), camX = j.x * LARG;
    var lpV = voa ? null : loopDaCamera(pista, j.z), orb = voa || lpV ? null : orbitaAtiva(e, j, VEIC[ji]);
    if (lpV) vistaLoop(c, e, ji, lpV, g, w, h, vs);   // dentro do looping: a câmera gira junto (cena toda em 3D)
    else if (orb) vistaOrbita(c, e, ji, g, w, h, vs, orb);   // volta de 360° na largada e na chegada
    else {

    // céu e fundo: misturam com o mundo anterior logo depois do portal
    var neon = ehNeon(jSeg.i), noiteAqui = noiteEm(jSeg.i);
    var m = jSeg.mundo, tm = tema(pista.mundos[m], jSeg.i), antes = m > 0 ? tema(pista.mundos[m - 1], jSeg.i) : tm;
    var f = m > 0 ? Math.min(1, (jSeg.i - Math.round(pista.chegada / 4 * m)) / 90) : 1;
    // céu: dia e noite misturados conforme noiteAqui (no Misto, escurece e clareia aos poucos)
    var desenhaCeu = function (T, A) {
      var cg = c.createLinearGradient(0, 0, 0, cy), tA = T[pista.mundos[m]], tB = m > 0 ? T[pista.mundos[m - 1]] : tA;
      cg.addColorStop(0, misturar(tB.ceu[0], tA.ceu[0], f)); cg.addColorStop(1, misturar(tB.ceu[1], tA.ceu[1], f));
      c.globalAlpha = A; c.fillStyle = cg; c.fillRect(0, 0, w, h); c.globalAlpha = 1;
    };
    if (noiteAqui < 1) desenhaCeu(TEMAS, 1);
    if (noiteAqui > 0) desenhaCeu(NEON, noiteAqui);
    // névoa da distância: o chão lá longe vai virando a cor do pé do céu (assim o trecho de noite que vem lá na
    // frente não aparece como uma faixa escura embaixo de um céu ainda claro)
    var corCeuDia = mixRgb(hexRgb(TEMAS[pista.mundos[m > 0 ? m - 1 : m]].ceu[1]), hexRgb(TEMAS[pista.mundos[m]].ceu[1]), f);
    var corCeuNoite = mixRgb(hexRgb(NEON[pista.mundos[m > 0 ? m - 1 : m]].ceu[1]), hexRgb(NEON[pista.mundos[m]].ceu[1]), f);
    var nevoa = mixRgb(corCeuDia, corCeuNoite, noiteAqui);
    var diaN = (TEMAS[pista.mundos[m]].noite ? 1 : 0), noite = Math.max(noiteAqui, diaN);
    if (noite > 0) camada(c, base.estrelasCeu, w, cy, cy, vs.nuvemX * 0.5, noite);
    var solCor = TEMAS[pista.mundos[m]].sol;
    if (solCor && noite < 1) { c.globalAlpha = 1 - noite; c.shadowColor = solCor; c.shadowBlur = K * 0.2; c.fillStyle = solCor; c.beginPath(); c.arc(w * 0.78, cy * 0.35, K * 0.1, 0, Math.PI * 2); c.fill(); c.shadowBlur = 0; c.globalAlpha = 1; }
    if (noite < 1) camada(c, base.nuvens, w, cy * 0.75, cy * 0.5, vs.nuvemX, 1 - noite);
    if (noiteAqui > 0) {   // lua com halo
      c.globalAlpha = noiteAqui;
      luz(c, w * 0.8, cy * 0.3, K * 0.32, '#bfd4ff', 0.35);
      c.fillStyle = '#eef3ff'; c.beginPath(); c.arc(w * 0.8, cy * 0.3, K * 0.055, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(180,195,230,.5)'; c.beginPath(); c.arc(w * 0.8 + K * 0.015, cy * 0.3 - K * 0.01, K * 0.014, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
    }
    var altF = Math.min(K * (noiteAqui > 0.5 ? 0.85 : 0.6), cy * (noiteAqui > 0.5 ? 1.0 : 0.9));
    var camadaFundo = function (nome, alfa) {
      if (noiteAqui < 1) camada(c, base.fundos[nome], w, cy + 2, altF, vs.fundoX, alfa * (1 - noiteAqui));
      if (noiteAqui > 0) camada(c, fundoNoite(nome), w, cy + 2, altF, vs.fundoX, alfa * noiteAqui);
    };
    if (f < 1) camadaFundo(pista.mundos[m - 1], 1);
    camadaFundo(pista.mundos[m], f);

    // estrada, do perto para o longe
    var maxy = h, x = 0, dx = -(segs[baseI].curva * basePct), n, cnt = op.dist, s;
    // neon: grade no chão dos dois lados da estrada (linhas que correm para o horizonte + linhas atravessadas)
    var GRADE = [1.8, 2.7, 3.9, 5.6, 8], grade = ESTILO !== 'colorido' ? GRADE.map(function () { return [[], []]; }) : null, corGrade = null;
    // looping lá na frente: os pedaços dele não são estrada reta (o arco é desenhado à parte, em 3D) e a estrada que sai
    // dele fica fisicamente logo depois da entrada, LOOP_DESVIO para o lado: por isso o z volta e o x anda
    var loopsF = voa ? [] : (pista.loops || []).filter(function (l) { return l.ini >= baseI && l.ini < baseI + op.dist; });
    var lim = op.dist + loopsF.length * P.LOOP_N, pulados = 0;
    cnt = lim;
    for (n = 0; n < lim; n++) {
      var i = baseI + n;
      if (i >= segs.length) { cnt = n; break; }
      s = segs[i];
      var dzL = 0, dxL = 0;
      for (var lq = 0; lq < loopsF.length; lq++) if (i >= loopsF[lq].fim) { dzL -= (loopsF[lq].fim - loopsF[lq].ini) * SEG; dxL += loopsF[lq].desvio; }
      var naFita = s.loop && !voa;
      var z1 = s.p1.z - camZ + dzL, z2 = s.p2.z - camZ + dzL;
      var sc1 = PROF / z1, sc2 = PROF / z2;
      var X1 = cx + sc1 * (x + dxL - camX) * K, Y1 = cy - sc1 * (s.p1.y - camY) * KY, W1 = sc1 * LARG * K;
      var X2 = cx + sc2 * (x + dxL + (naFita ? 0 : dx) - camX) * K, Y2 = cy - sc2 * (s.p2.y - camY) * KY, W2 = sc2 * LARG * K;
      aX[n] = X1; aY[n] = Y1; aS[n] = sc1; aClip[n] = maxy; aZ[n] = z1;
      if (naFita) { pulados++; continue; }
      x += dx; dx += s.curva;
      if (z1 <= PROF || Y2 >= Y1 || Y2 >= maxy) continue;
      var nS = ehNeon(s.i), ts = tema(pista.mundos[s.mundo], s.i), par = s.listra, pc = corPedaco(pista, s), nt = pc.noite;
      var nF = n - pulados, cntF = op.dist, fn = Math.max(0, (nF - cntF * 0.4) / (cntF * 0.6)), fog = Math.min(0.8, Math.pow(fn, 1.4) * 0.8);
      if (fog > 0.01) {   // longe: mistura com a névoa
        var pn = pc.num;
        pc = { noite: nt * (1 - fog), num: pn, grama: [css(mixRgb(pn.grama[0], nevoa, fog)), css(mixRgb(pn.grama[1], nevoa, fog))], pista: [css(mixRgb(pn.pista[0], nevoa, fog)), css(mixRgb(pn.pista[1], nevoa, fog))],
          borda: [css(mixRgb(pn.borda[0], nevoa, fog)), css(mixRgb(pn.borda[1], nevoa, fog))], faixa: css(mixRgb(pn.faixa, nevoa, fog)), bordaNoite: pc.bordaNoite };
        nt = pc.noite;
      }
      c.fillStyle = pc.grama[par]; c.fillRect(0, Y2, w, Y1 - Y2 + 1);
      if (s.agua && !voa) {   // rio: margem de areia, água azul com ondinhas de espuma (andam junto com a pista)
        var nta = Math.min(1, nt), corA = css(mixRgb(mixRgb(AGUA[par], AGUA_NOITE, nta * 0.8), nevoa, fog)), corM = css(mixRgb(mixRgb(MARGEM[par], [40, 34, 60], nta * 0.7), nevoa, fog));
        var m1 = W1 / 4, m2 = W2 / 4;
        poligono(c, X1 - W1 - m1, Y1 + 1, X1 + W1 + m1, Y1 + 1, X2 + W2 + m2, Y2, X2 - W2 - m2, Y2, corM);
        poligono(c, X1 - W1, Y1 + 1, X1 + W1, Y1 + 1, X2 + W2, Y2, X2 - W2, Y2, corA);
        if (s.i % 2 === 0) {
          c.globalAlpha = 0.55 * (1 - fog);
          for (var oq = 0; oq < 3; oq++) { var ox = -0.85 + hash(s.i * 3 + oq) * 1.7, ol1 = W1 * 0.09, ol2 = W2 * 0.09; poligono(c, X1 + W1 * ox - ol1, Y1, X1 + W1 * ox + ol1, Y1, X2 + W2 * ox + ol2, Y2, X2 + W2 * ox - ol2, Y2, '#e8fbff'); }
          c.globalAlpha = 1;
        }
        c.globalAlpha = 0.8 * (1 - fog);   // espuma batendo na margem
        poligono(c, X1 - W1 - W1 * 0.04, Y1 + 1, X1 - W1 + W1 * 0.04, Y1 + 1, X2 - W2 + W2 * 0.04, Y2, X2 - W2 - W2 * 0.04, Y2, '#ffffff');
        poligono(c, X1 + W1 - W1 * 0.04, Y1 + 1, X1 + W1 + W1 * 0.04, Y1 + 1, X2 + W2 + W2 * 0.04, Y2, X2 + W2 - W2 * 0.04, Y2, '#ffffff');
        c.globalAlpha = 1;
        if (grade) for (var gw = 0; gw < GRADE.length; gw++) { grade[gw][0].push(null); grade[gw][1].push(null); }
        maxy = Y2; continue;
      }
      var r1 = W1 / 7, r2 = W2 / 7;
      Y1 += 1;   // 1 pixel de sobra: sem risquinhos entre um pedaço e outro
      // de dia: zebra nas bordas; de noite: a zebra some no asfalto escuro e acende o fio de neon (troca aos poucos)
      if (nt < 1) {
        c.globalAlpha = 1 - nt;
        poligono(c, X1 - W1 - r1, Y1, X1 - W1, Y1, X2 - W2, Y2, X2 - W2 - r2, Y2, pc.borda[par]);
        poligono(c, X1 + W1 + r1, Y1, X1 + W1, Y1, X2 + W2, Y2, X2 + W2 + r2, Y2, pc.borda[par]);
        c.globalAlpha = 1;
      }
      var lp = 1 + 0.06 * nt;
      poligono(c, X1 - W1 * lp, Y1, X1 + W1 * lp, Y1, X2 + W2 * lp, Y2, X2 - W2 * lp, Y2, pc.pista[par]);
      if (nt > 0) {
        var e1 = W1 * 0.025, e2 = W2 * 0.025, cor0 = pc.bordaNoite;
        c.globalAlpha = 0.22 * nt;
        poligono(c, X1 - W1 - e1 * 4, Y1, X1 - W1 + e1 * 4, Y1, X2 - W2 + e2 * 4, Y2, X2 - W2 - e2 * 4, Y2, cor0);
        poligono(c, X1 + W1 - e1 * 4, Y1, X1 + W1 + e1 * 4, Y1, X2 + W2 + e2 * 4, Y2, X2 + W2 - e2 * 4, Y2, cor0);
        c.globalAlpha = nt;
        poligono(c, X1 - W1 - e1, Y1, X1 - W1 + e1, Y1, X2 - W2 + e2, Y2, X2 - W2 - e2, Y2, cor0);
        poligono(c, X1 + W1 - e1, Y1, X1 + W1 + e1, Y1, X2 + W2 + e2, Y2, X2 + W2 - e2, Y2, cor0);
        c.globalAlpha = 1;
      }
      if (s.xadrez) {
        for (var q = 0; q < 8; q++) {
          var a = -1 + q / 4, b = a + 0.25;
          poligono(c, X1 + W1 * a, Y1, X1 + W1 * b, Y1, X2 + W2 * b, Y2, X2 + W2 * a, Y2, (q + s.i) % 2 ? '#111' : '#fff');
        }
      } else if (!par) {
        var l1 = W1 / 32, l2 = W2 / 32;
        c.globalAlpha = 1 - 0.15 * nt;
        for (var fx = -1 / 3; fx < 0.5; fx += 2 / 3) poligono(c, X1 + W1 * fx - l1, Y1, X1 + W1 * fx + l1, Y1, X2 + W2 * fx + l2, Y2, X2 + W2 * fx - l2, Y2, pc.faixa);
        c.globalAlpha = 1;
      }
      if (grade && nt > 0.02 && !s.tunel) {   // a grade do chão acende aos poucos, junto com a noite
        corGrade = corGrade || ts.borda[0];
        if (s.i % 2 === 0) { c.fillStyle = rgba(NEON[pista.mundos[s.mundo]].borda[0], 0.2 * nt); c.fillRect(0, Y1 - 1, Math.max(0, X1 - W1 * 1.12), 1.2); c.fillRect(X1 + W1 * 1.12, Y1 - 1, Math.max(0, w - X1 - W1 * 1.12), 1.2); }
        for (var gk = 0; gk < GRADE.length; gk++) { grade[gk][0].push([X1 - W1 * GRADE[gk], Y1, nt]); grade[gk][1].push([X1 + W1 * GRADE[gk], Y1, nt]); }
      } else if (grade) for (var gq = 0; gq < GRADE.length; gq++) { grade[gq][0].push(null); grade[gq][1].push(null); }   // sem grade aqui: corta a linha
      maxy = Y2;
    }
    if (grade) {   // linhas da grade em 4 níveis de brilho (mais apagadas onde ainda é dia)
      c.lineWidth = 1.2;
      for (var nv = 1; nv <= 4; nv++) {
        c.strokeStyle = rgba(corGrade || '#2bf4ff', 0.28 * nv / 4); c.beginPath(); var tem = false;
        grade.forEach(function (par2) { par2.forEach(function (pts) {
          for (var q = 1; q < pts.length; q++) { var a = pts[q - 1], b2 = pts[q]; if (!a || !b2) continue;
            if (Math.max(1, Math.ceil(Math.min(a[2], b2[2]) * 4 - 0.001)) !== nv) continue;
            c.moveTo(a[0], a[1]); c.lineTo(b2[0], b2[1]); tem = true; }
        }); });
        if (tem) c.stroke();
      }
    }

    // quem voa: névoa sobre o chão lá embaixo (dá a sensação de altura) e a rota no ar, um caminho de luz
    if (voa) {
      var hz0 = Math.max(0, Math.min(h, cy)), nev = c.createLinearGradient(0, hz0, 0, h);
      if (neon) { nev.addColorStop(0, 'rgba(24,16,70,.55)'); nev.addColorStop(1, 'rgba(10,8,36,.12)'); }   // à noite, névoa escura
      else { nev.addColorStop(0, 'rgba(255,255,255,.55)'); nev.addColorStop(1, 'rgba(220,240,255,.22)'); }
      c.fillStyle = nev; c.fillRect(0, hz0, w, h - hz0);
      var trilhos = [[], []];
      for (n = cnt - 2; n >= 0; n--) {
        if (aZ[n] <= PROF) continue;
        var la = aS[n] * ALT_VOO * KY, lb = aS[n + 1] * ALT_VOO * KY, LY1 = aY[n] - la, LY2 = aY[n + 1] - lb;
        var LW1 = aS[n] * LARG * K, LW2 = aS[n + 1] * LARG * K, sg = segs[baseI + n];
        if (LY2 > h + 40) continue;
        trilhos[0].push(aX[n] - LW1, LY1); trilhos[1].push(aX[n] + LW1, LY1);
        c.globalAlpha = sg.xadrez ? 0.8 : (sg.listra ? 0.2 : 0.11);
        poligono(c, aX[n] - LW1, LY1, aX[n] + LW1, LY1, aX[n + 1] + LW2, LY2, aX[n + 1] - LW2, LY2, sg.xadrez ? ((baseI + n) % 2 ? '#111' : '#fff') : '#bfe9ff');
        c.globalAlpha = 1;
        if ((baseI + n) % 4 === 0) {
          var rl = Math.max(1.5, LW1 * 0.035), corL = (baseI + n) % 8 ? '#ffd166' : '#ff4fa3';
          c.shadowColor = corL; c.shadowBlur = rl * 3; c.fillStyle = corL;
          c.beginPath(); c.arc(aX[n] - LW1, LY1, rl, 0, Math.PI * 2); c.arc(aX[n] + LW1, LY1, rl, 0, Math.PI * 2); c.fill(); c.shadowBlur = 0;
        }
      }
      // trilhos brilhantes nas duas bordas da rota
      c.lineJoin = 'round'; c.lineCap = 'round';
      trilhos.forEach(function (tr) {
        if (tr.length < 4) return;
        c.strokeStyle = 'rgba(62,232,255,.85)'; c.lineWidth = Math.max(2, K * 0.012); c.shadowColor = '#3ee8ff'; c.shadowBlur = K * 0.03;
        c.beginPath(); c.moveTo(tr[0], tr[1]); for (var q = 2; q < tr.length; q += 2) c.lineTo(tr[q], tr[q + 1]); c.stroke(); c.shadowBlur = 0;
      });
    }

    // quem anda (trânsito, rivais, o outro jogador) fica no ponto exato dentro do pedaço da estrada, e não
    // grudado no começo do pedaço: senão pula de um pedaço para o outro e parece tremer
    function noPonto(n, z) {
      var f = n + 1 < cnt && aZ[n + 1] > PROF ? Math.max(0, Math.min(1, z / SEG - (baseI + n))) : 0;
      var sc = aS[n] + (aS[n + 1] - aS[n]) * f;
      return { x: aX[n] + (aX[n + 1] - aX[n]) * f, y: aY[n] + (aY[n + 1] - aY[n]) * f, esc: sc * K, escY: sc * KY };
    }
    // enfeites, coisas, trânsito e o outro jogador, do longe para o perto
    var outro = e.jogadores.length === 2 ? e.jogadores[1 - ji] : null, oSeg = outro ? Math.floor(outro.z / SEG) : -1;
    var primeiro = 0; while (primeiro < cnt && aZ[primeiro] <= PROF) primeiro++;
    var dentroTunel = !!segs[baseI].tunel;
    var arcoFeito = {};
    for (n = cnt - 1; n >= 0; n--) {
      var idx = baseI + n; s = segs[idx];
      if (s.loop && !voa) {   // o looping lá na frente: desenhado uma vez, inteiro, quando a passada chega nele
        var lA = pista.loops[s.loop - 1], n0 = lA.ini - baseI;
        if (!arcoFeito[s.loop] && n0 >= 0 && aZ[n0] > PROF) {
          arcoFeito[s.loop] = 1;
          var xw0 = (aX[n0] - cx) / (aS[n0] * K) + camX;
          arcoDeLonge(c, e, ji, lA, [camX - xw0, camY - segs[lA.ini].p1.y, camZ - lA.ini * SEG], g);
        }
        continue;
      }
      if (aZ[n] <= PROF) continue;
      var esc = aS[n] * K, escY = aS[n] * KY, sx = aX[n], sy = aY[n], clip = aClip[n], k2;
      var syAr = sy - escY * ALT_VOO;   // a altura do voo neste pedaço
      var nS2 = ehNeon(idx), tsN = tema(pista.mundos[s.mundo], idx), ntS = noiteEm(idx);   // ntS: quanto de noite aqui (0 a 1)
      if (s.tunel) {
        var temB = n + 1 < cnt && aZ[n + 1] > PROF && segs[idx + 1] && segs[idx + 1].tunel === s.tunel;
        tunel(c, s, idx, { x: sx, y: sy, e: esc, eY: escY }, temB ? { x: aX[n + 1], y: aY[n + 1], e: aS[n + 1] * K, eY: aS[n + 1] * KY } : (segs[idx + 1] && !segs[idx + 1].tunel && n + 1 < cnt ? { x: aX[n + 1], y: aY[n + 1], e: aS[n + 1] * K, eY: aS[n + 1] * KY } : null), w, h, voa, NEON[pista.mundos[s.mundo]], pista, nevoa, n === primeiro && dentroTunel);
      }
      // postes e pórticos de neon acendem aos poucos com a noite (e somem aos poucos de dia)
      if (ntS > 0.02 && !s.tunel && n > 2 && idx % 8 === 0) { c.globalAlpha = ntS; postesNeon(c, idx, sx, sy, esc, clip, NEON[pista.mundos[s.mundo]], w, escY); c.globalAlpha = 1; }
      if (ntS > 0.02 && !s.tunel && n > 3 && idx % 48 === 24) { c.globalAlpha = ntS; portico(c, idx, sx, voa ? syAr : sy, esc, voa ? 0 : clip, NEON[pista.mundos[s.mundo]], w, escY, voa); c.globalAlpha = 1; }
      for (k2 = 0; n > 3 && k2 < s.enfeites.length; k2++) {   // enfeite colado na câmera taparia a tela
        var en = s.enfeites[k2], arco = en.tipo === 'portal' || en.tipo === 'chegada' || en.tipo === 'largada', spr = en.tipo === 'portal' ? portais[en.mundo] : en.tipo === 'chegada' ? chegada : en.tipo === 'largada' ? largada : enfeiteSpr(en.tipo, ntS >= 0.5);
        if (!spr) continue;
        if (voa && arco) sprite(c, spr, esc, sx + esc * en.x * LARG, syAr + escY * 1900, 0, w);   // no céu, o portal fica na altura do voo
        else if (!arco && ntS > 0.02 && ntS < 0.98) {   // na troca dia/noite: o enfeite claro e o escurecido se misturam
          var claro = enfeiteSpr(en.tipo, false), escuro = enfeiteSpr(en.tipo, true);
          c.globalAlpha = 1 - ntS; sprite(c, claro, esc, sx + esc * en.x * LARG, sy, clip, w);
          c.globalAlpha = ntS; sprite(c, escuro, esc, sx + esc * en.x * LARG, sy, clip, w); c.globalAlpha = 1;
        }
        else sprite(c, spr, esc, sx + esc * en.x * LARG, sy, clip, w);
      }
      if (voa && n > 3 && idx % 6 === 0) {   // nuvens dos lados, em alturas diferentes
        var hz = hash(idx), lado = hz < 0.5 ? -1 : 1, tm2 = tema(pista.mundos[s.mundo], idx);
        var nN = tm2.noite ? 1 : ntS, nxC = sx + esc * lado * (2.2 + hash(idx + 7) * 1.6) * LARG, nyC = syAr + escY * (hash(idx + 3) - 0.35) * 2600;
        if (nN < 0.98) { c.globalAlpha = 1 - nN; sprite(c, base.nuvemFofa, esc, nxC, nyC, 0, w); }
        if (nN > 0.02) { c.globalAlpha = nN; sprite(c, base.nuvemNoite, esc, nxC, nyC, 0, w); }
        c.globalAlpha = 1;
      }
      for (k2 = 0; k2 < s.coisas.length; k2++) {
        var co = s.coisas[k2];
        if (co.pego[ji]) continue;
        var alt = co.alt;
        if (co.tipo === 'estrela') alt += Math.sin(e.t * 5 + idx) * 80;
        // itens com versão de neon (estrela, turbo, lama...): misturam as duas versões na troca dia/noite
        var naAguaS = !voa && s.agua, nomeDia = voa ? sprCeu(co.tipo) : naAguaS ? sprAgua(co.tipo) : co.tipo, nomeNoite = voa ? (co.tipo === 'estrela' ? 'estrelaNeon' : nomeDia) : naAguaS ? (co.tipo === 'estrela' ? 'estrelaNeon' : nomeDia) : (ITEM_NEON[co.tipo] || co.tipo);
        var ix = sx + esc * co.x * LARG, iy = voa ? syAr - escY * (alt + (co.tipo === 'anel' || co.tipo === 'turbo' ? -150 : 0)) : sy - escY * alt, icl = voa ? 0 : clip;
        if (co.tipo === 'caixa') { caixaSurpresa(c, ix, voa ? iy : sy, esc, e.t, idx + k2, icl); continue; }
        if (co.tipo === 'estrela' && (!icl || iy <= icl + 2)) brilhoEstrela(c, ix, iy, esc, e.t, idx);
        if (nomeNoite === nomeDia || ntS <= 0.02) sprite(c, base[ntS >= 0.98 ? nomeNoite : nomeDia], esc, ix, iy, icl, w);
        else if (ntS >= 0.98) sprite(c, base[nomeNoite], esc, ix, iy, icl, w);
        else { c.globalAlpha = 1 - ntS; sprite(c, base[nomeDia], esc, ix, iy, icl, w); c.globalAlpha = ntS; sprite(c, base[nomeNoite], esc, ix, iy, icl, w); c.globalAlpha = 1; }
      }
      var cs = porSeg[idx];
      if (cs) for (k2 = 0; k2 < cs.length; k2++) {
        var pc = noPonto(n, cs[k2].z), tx = pc.x + pc.esc * cs[k2].x * LARG, tyA = pc.y - pc.escY * (ALT_VOO + 200);
        var luzT = s.tunel ? 1 : ntS;   // lanternas acesas: à noite e no túnel (acendendo aos poucos)
        if (voa) { sprite(c, base[sprCeu(cs[k2].tipo)], pc.esc, tx, tyA, 0, w); if (luzT > 0.02) { c.globalAlpha = luzT; luzesAviao(c, tx, tyA, pc.esc, idx); c.globalAlpha = 1; } }
        else {
          var tipoT = s.agua ? sprAgua(cs[k2].tipo) : cs[k2].tipo;
          if (pc.y <= clip + 2 && !s.agua) sombraChao(c, tx, pc.y, base[tipoT].w * pc.esc, corPedaco(pista, s).noite, '#ff3b6b');
          sprite(c, base[tipoT], pc.esc, tx, pc.y, clip, w); if (luzT > 0.02 && pc.y <= clip + 2 && !s.agua) { c.globalAlpha = luzT; lanternasTransito(c, cs[k2].tipo, tx, pc.y, pc.esc); c.globalAlpha = 1; }
        }
      }
      (e.tiros || []).forEach(function (tr) { if (Math.floor(tr.z / SEG) !== idx) return; var pt = noPonto(n, tr.z); (tr.tipo === 'abobora' ? aboboraVoando : bolaGosma)(c, pt.x + pt.esc * tr.x * LARG, voa ? pt.y - pt.escY * ALT_VOO : pt.y, pt.esc, e.t); });
      var rs = porSegR[idx];   // rivais neste pedaço (no céu se forem de avião)
      if (rs) for (k2 = 0; k2 < rs.length; k2++) {
        var rv = e.rivais[rs[k2]], rd = RIV[rs[k2]]; if (!rd || rv.z < j.z - JOG_Z * 0.6) continue;
        var pr = noPonto(n, rv.z), rX = pr.x + pr.esc * rv.x * LARG, rY = rd.voa ? pr.y - pr.escY * ALT_VOO : pr.y, rW = rd.spr.w * pr.esc, rH = rd.spr.h * pr.esc;
        var faseR = rd.spr.quadros ? faseSkate(rd, rv, e, rd.veic) : 0, vivo = rW > 24 && (rd.voa || voa || rY <= clip);
        rd.lado = (rd.lado || 0) + (Math.max(-1, Math.min(1, (rv.faixa - rv.x) * 4)) - (rd.lado || 0)) * 0.15;   // vira para onde está indo
        if (!rd.voa && !voa && rY <= clip + 2) { if (s.agua) espuma(c, rX, rY, rW); else sombraChao(c, rX, rY, rW, corPedaco(pista, s).noite, rd.info.cor); }
        if (vivo) bracos(c, rd.veic, rX - rW / 2, rY - rH, rW, rH, rd.info.cor, faseR, rd.lado, 'longe');
        sprite(c, S.quadro(rd.spr, faseR), pr.esc, rX, rY, rd.voa || voa ? 0 : clip, w);
        if (vivo) { bracos(c, rd.veic, rX - rW / 2, rY - rH, rW, rH, rd.info.cor, faseR, rd.lado, 'perto'); pilotoVivo(c, rd.veic, rX - rW / 2, rY - rH, rW, rH, rd.info, 10 + rs[k2] * 2.1, 6, ondeCabeca(rd.veic, rX - rW / 2, rY - rH, rW, rH, faseR)); }
        if (rv.turbo > 0 && !rd.voa && rW > 6) { c.save(); c.translate(rX, rY); fogoEscape(c, rW, rH, Math.min(1, rv.turbo), false); c.restore(); }
        if (rv.gosma > 0 && rW > 6) gosmaEm(c, rX - rW / 2, rY - rH, rW, rH, rv.gosma, rv.gosmaCor);
        var luzR = s.tunel ? 1 : ntS;
        if (!rd.voa && luzR > 0.02 && rY <= clip + 2) { c.save(); c.globalCompositeOperation = 'lighter'; luz(c, rX - rW * 0.36, rY - rH * 0.4, rW * 0.25, '#ff2a2a', 0.7 * luzR); luz(c, rX + rW * 0.36, rY - rH * 0.4, rW * 0.25, '#ff2a2a', 0.7 * luzR); c.restore(); }
      }
      if (idx === oSeg && outro.z > j.z - JOG_Z * 0.6) {
        var lift = outro.pulo > 0 ? Math.sin(Math.PI * (1 - outro.pulo / (outro.puloMax || raiz.VruuumMotor.PULO))) * 1400 * (outro.puloMax || 1.1) / 1.1 : 0;
        var oVoa = !!VOA[outro.n];   // o outro pode estar voando enquanto eu vou de carro (e vice-versa)
        var po = noPonto(n, outro.z), oSpr = carrosJog[outro.n], oX = po.x + po.esc * outro.x * LARG, oY = (oVoa ? po.y - po.escY * ALT_VOO : po.y) - po.escY * lift;
        var faseO = VS[outro.n] && VS[outro.n].fPe != null ? VS[outro.n].fPe : 0.8, ladoO = VS[outro.n] ? VS[outro.n].lado : 0, oW = oSpr.w * po.esc, oH = oSpr.h * po.esc, oVivo = oW > 24 && (oVoa || voa || oY <= clip);
        if (!oVoa && !voa && po.y <= clip + 2) { if (s.agua) espuma(c, oX, po.y, oW); else sombraChao(c, oX, po.y, oW, corPedaco(pista, s).noite, INFO[outro.n].cor); }
        if (oVivo) bracos(c, VEIC[outro.n], oX - oW / 2, oY - oH, oW, oH, INFO[outro.n].cor, faseO, ladoO, 'longe');
        sprite(c, S.quadro(oSpr, faseO), po.esc, oX, oY, oVoa || voa ? 0 : clip, w);
        if (oVivo) { bracos(c, VEIC[outro.n], oX - oW / 2, oY - oH, oW, oH, INFO[outro.n].cor, faseO, ladoO, 'perto'); pilotoVivo(c, VEIC[outro.n], oX - oW / 2, oY - oH, oW, oH, INFO[outro.n], outro.n * 3.3, 7, ondeCabeca(VEIC[outro.n], oX - oW / 2, oY - oH, oW, oH, faseO)); }
      }
    }

    }
    if (!orb) desenharCarro(c, j, vs, g, h, w, e);
    linhasVelocidade(c, g, w, h, Math.min(1, j.turbo * 0.9) * (voa ? 0.6 : 1));
    desenharEfeitos(c, vs, g, w, h);
    if (!op.semPlacar) desenharPlacar(c, e, j, ji, w, h, K, op, v);
    c.restore();
  }

  // ---------- 1.11.0: caixa surpresa, poderes, derrapagem, turbo, fogos ----------
  var M2 = function () { return raiz.VruuumMotor; };
  var COR_FAISCA = ['#d8d8e0', '#3ee8ff', '#ff9f1c', '#c77dff'];   // derrapagem: cinza (começando), azul, laranja, roxa
  // caixa ❓ girando dentro de uma bolha, como nos fliperamas
  function caixaSurpresa(c, x, y, esc, t, idx, clip) {
    var r = esc * 330; if (r < 1.5 || (clip && y > clip + 2)) return;
    y -= r * 1.3 + Math.sin(t * 3 + idx) * r * 0.15;
    var gb = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r * 1.3);
    gb.addColorStop(0, 'rgba(255,255,255,.7)'); gb.addColorStop(0.55, 'rgba(170,230,255,.12)'); gb.addColorStop(1, 'rgba(170,230,255,.55)');
    c.fillStyle = gb; c.beginPath(); c.arc(x, y, r * 1.3, 0, Math.PI * 2); c.fill();
    var gira = Math.cos(t * 2.2 + idx), hue = (t * 90 + idx * 47) % 360;
    c.save(); c.translate(x, y); c.scale(0.3 + 0.7 * Math.abs(gira), 1);
    var gc = c.createLinearGradient(0, -r * 0.75, 0, r * 0.75); gc.addColorStop(0, 'hsl(' + hue + ',95%,68%)'); gc.addColorStop(1, 'hsl(' + ((hue + 60) % 360) + ',90%,48%)');
    c.fillStyle = gc; c.beginPath(); c.moveTo(-r * 0.75, -r * 0.55); c.quadraticCurveTo(-r * 0.75, -r * 0.75, -r * 0.55, -r * 0.75); c.lineTo(r * 0.55, -r * 0.75); c.quadraticCurveTo(r * 0.75, -r * 0.75, r * 0.75, -r * 0.55);
    c.lineTo(r * 0.75, r * 0.55); c.quadraticCurveTo(r * 0.75, r * 0.75, r * 0.55, r * 0.75); c.lineTo(-r * 0.55, r * 0.75); c.quadraticCurveTo(-r * 0.75, r * 0.75, -r * 0.75, r * 0.55); c.closePath(); c.fill();
    c.lineWidth = Math.max(1, r * 0.08); c.strokeStyle = '#ffffff'; c.stroke();
    if (Math.abs(gira) > 0.25) { c.fillStyle = '#ffffff'; c.font = '700 ' + Math.round(r * 1.1) + 'px ' + FONTE; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 0, r * 0.06); }
    c.restore();
    c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.arc(x - r * 0.55, y - r * 0.6, r * 0.14, 0, Math.PI * 2); c.fill();
  }
  // bola de gosma voando (poder da caixa)
  function bolaGosma(c, x, y, esc, t) {
    var r = esc * 300; if (r < 1) return;
    y -= r * 1.5 + Math.abs(Math.sin(t * 9)) * r * 0.6;
    var g = c.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r); g.addColorStop(0, '#eaffb0'); g.addColorStop(0.5, '#7ae03d'); g.addColorStop(1, '#2f8f1c');
    c.fillStyle = g; c.beginPath();
    for (var k = 0; k <= 12; k++) { var a = k / 12 * Math.PI * 2, rr = r * (1 + 0.12 * Math.sin(a * 3 + t * 14)); if (k) c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.fill();
    c.fillStyle = '#1b1b22'; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.1, r * 0.13, 0, Math.PI * 2); c.arc(x + r * 0.3, y - r * 0.1, r * 0.13, 0, Math.PI * 2); c.fill();   // carinha
  }
  // abóbora de Halloween voando (o Drácula joga nos rivais): laranja, com gomos, carinha e cabinho
  function aboboraVoando(c, x, y, esc, t) {
    var r = esc * 320; if (r < 1) return;
    y -= r * 1.6 + Math.abs(Math.sin(t * 8)) * r * 0.7;
    c.save(); c.translate(x, y); c.rotate(t * 6);
    var g = c.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); g.addColorStop(0, '#ffb04a'); g.addColorStop(1, '#d2600a');
    c.fillStyle = g; c.beginPath(); if (c.ellipse) c.ellipse(0, 0, r * 1.15, r, 0, 0, Math.PI * 2); else c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(140,60,0,.5)'; c.lineWidth = Math.max(1, r * 0.08); [-0.5, 0, 0.5].forEach(function (k) { c.beginPath(); if (c.ellipse) c.ellipse(k * r * 0.5, 0, r * 0.35, r * 0.95, 0, 0, Math.PI * 2); c.stroke(); });
    c.fillStyle = '#2a1400'; poli3a(c, [[-0.45, -0.2], [-0.2, -0.45], [-0.1, -0.15]], r); poli3a(c, [[0.45, -0.2], [0.2, -0.45], [0.1, -0.15]], r);
    c.beginPath(); c.moveTo(-r * 0.55, r * 0.2); c.lineTo(-r * 0.3, r * 0.45); c.lineTo(-r * 0.1, r * 0.3); c.lineTo(r * 0.1, r * 0.45); c.lineTo(r * 0.3, r * 0.3); c.lineTo(r * 0.55, r * 0.2); c.lineTo(r * 0.3, r * 0.55); c.lineTo(-r * 0.3, r * 0.55); c.closePath(); c.fill();
    c.fillStyle = '#3f7a1e'; c.fillRect(-r * 0.1, -r * 1.25, r * 0.2, r * 0.35);
    c.restore();
  }
  function poli3a(c, pts, r) { c.beginPath(); pts.forEach(function (p, k) { if (k) c.lineTo(p[0] * r, p[1] * r); else c.moveTo(p[0] * r, p[1] * r); }); c.closePath(); c.fill(); }
  // gosma grudada no rival atingido (verde; laranja quando foi abóbora)
  function gosmaEm(c, x0, y0, w, h, resta, cor) {
    c.save(); c.globalAlpha = Math.min(1, resta);
    c.fillStyle = cor || '#7ae03d';
    [[0.3, 0.3, 0.18], [0.55, 0.22, 0.2], [0.72, 0.4, 0.14], [0.45, 0.5, 0.16]].forEach(function (b) { c.beginPath(); c.arc(x0 + w * b[0], y0 + h * b[1], w * b[2], 0, Math.PI * 2); c.fill(); });
    [0.32, 0.5, 0.68].forEach(function (x, k) { c.fillRect(x0 + w * x - w * 0.03, y0 + h * 0.4, w * 0.06, h * (0.2 + k * 0.08)); c.beginPath(); c.arc(x0 + w * x, y0 + h * (0.6 + k * 0.08), w * 0.045, 0, Math.PI * 2); c.fill(); });
    c.restore();
  }
  // bolha de escudo verde em volta do veículo (pisca quando está acabando)
  function bolhaEscudo(c, cw, ch, resta, tt) {
    if (resta < 1.5 && Math.sin(tt * 30) < 0) return;
    var r = Math.max(cw, ch) * 0.6, cy0 = -ch * 0.5;
    c.save(); c.globalCompositeOperation = 'lighter';
    var g = c.createRadialGradient(0, cy0, r * 0.6, 0, cy0, r); g.addColorStop(0, 'rgba(198,255,61,0)'); g.addColorStop(1, 'rgba(198,255,61,.45)');
    c.fillStyle = g; c.beginPath(); c.arc(0, cy0, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(198,255,61,.9)'; c.lineWidth = Math.max(1.5, r * 0.035); c.stroke();
    c.lineWidth = Math.max(1, r * 0.012); c.strokeStyle = 'rgba(230,255,150,.55)';   // gomos de colmeia girando
    for (var k = 0; k < 14; k++) {
      var a = k / 14 * Math.PI * 2 + tt * 0.6, px = Math.cos(a) * r * 0.82, py = cy0 + Math.sin(a) * r * 0.82, hr = r * 0.12;
      c.beginPath(); for (var q = 0; q <= 6; q++) { var b = q / 6 * Math.PI * 2; if (q) c.lineTo(px + Math.cos(b) * hr, py + Math.sin(b) * hr); else c.moveTo(px + Math.cos(b) * hr, py + Math.sin(b) * hr); } c.stroke();
    }
    c.restore();
  }
  // fogo saindo do escapamento (turbo, foguete): rodas de trás em -0.3 e +0.3 da largura
  function fogoEscape(c, cw, ch, forca, foguete) {
    c.save(); c.globalCompositeOperation = 'lighter';
    [-1, 1].forEach(function (l) {
      var x = l * cw * 0.26, y = -ch * 0.16, L = ch * (foguete ? 0.75 : 0.42) * forca * (0.8 + Math.random() * 0.4), r = cw * (foguete ? 0.11 : 0.08);
      var g = c.createLinearGradient(0, y, 0, y + L); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.25, foguete ? 'rgba(255,209,102,.9)' : 'rgba(124,232,255,.9)'); g.addColorStop(0.6, foguete ? 'rgba(255,90,0,.6)' : 'rgba(58,134,255,.55)'); g.addColorStop(1, 'rgba(255,60,0,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(x - r, y); c.quadraticCurveTo(x - r * 0.8, y + L * 0.6, x, y + L); c.quadraticCurveTo(x + r * 0.8, y + L * 0.6, x + r, y); c.closePath(); c.fill();
      luz(c, x, y, r * 2.2, foguete ? '#ff9f1c' : '#3ee8ff', 0.6 * forca);
    });
    c.restore();
  }
  // derrapagem: faíscas saindo das rodas de trás, na cor do nível, e fumacinha
  function faiscasDerrapa(c, cw, ch, nivel, lado) {
    var cor = COR_FAISCA[nivel];
    c.save(); c.globalCompositeOperation = 'lighter';
    [-1, 1].forEach(function (l) {
      var x = l * cw * 0.34, y = -ch * 0.04;
      if (nivel) luz(c, x, y, cw * 0.16, cor, 0.85);
      c.strokeStyle = cor; c.lineCap = 'round';
      for (var k = 0; k < (nivel ? 9 : 4); k++) {
        var a = -Math.PI / 2 - lado * 0.6 + (Math.random() - 0.5) * 2.2, d = cw * (0.08 + Math.random() * 0.22);
        c.lineWidth = Math.max(1, cw * 0.012); c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * d, y - Math.sin(a) * d * 0.6 + ch * 0.02); c.stroke();
      }
    });
    c.restore();
    c.fillStyle = 'rgba(230,230,240,.35)';
    for (var k = 0; k < 3; k++) { c.beginPath(); c.arc((Math.random() - 0.5) * cw * 0.9, -ch * 0.02 + Math.random() * ch * 0.06, cw * (0.05 + Math.random() * 0.06), 0, Math.PI * 2); c.fill(); }
  }
  // marcas de pneu: duas faixas escuras da roda até o pé da tela, entortadas para o lado da derrapagem
  // no rio: a esteira de espuma abrindo em V para trás (até a beira da tela) e os borrifos dos lados
  function esteira(c, x, y, cw, ch, h, tt, vel) {
    c.save(); c.globalAlpha = 0.35 + 0.35 * vel; c.fillStyle = '#ffffff';
    [-1, 1].forEach(function (l) { c.beginPath(); c.moveTo(x + l * cw * 0.3, y); c.lineTo(x + l * cw * (0.95 + vel * 0.3), h); c.lineTo(x + l * cw * (0.7 + vel * 0.2), h); c.lineTo(x + l * cw * 0.18, y); c.closePath(); c.fill(); });
    c.globalAlpha = 0.5; c.beginPath(); c.moveTo(x - cw * 0.12, y); c.lineTo(x + cw * 0.12, y); c.lineTo(x + cw * 0.3, h); c.lineTo(x - cw * 0.3, h); c.closePath(); c.fill();
    c.restore();
    espuma(c, x, y, cw * 1.1);
  }
  function borrifos(c, cw, ch, tt, vel) {
    for (var k = 0; k < 14; k++) {
      var ph = (tt * (1.6 + vel) + k / 14) % 1, l = k % 2 ? 1 : -1, px = l * cw * (0.3 + ph * (0.45 + vel * 0.3)), py = -ch * 0.04 - Math.sin(ph * Math.PI) * ch * (0.18 + vel * 0.2);
      c.globalAlpha = 0.85 * (1 - ph); c.fillStyle = k % 3 ? '#ffffff' : '#bfefff';
      c.beginPath(); c.arc(px, py, Math.max(1, cw * 0.035 * (1 - ph * 0.5)), 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }
  function marcasPneu(c, g, h, cw, lado, lift) {
    var y0 = g.cy + g.KY - lift;
    c.save(); c.strokeStyle = 'rgba(20,16,30,.35)'; c.lineWidth = cw * 0.07; c.lineCap = 'round';
    [-1, 1].forEach(function (l) { var x0 = g.cx + l * cw * 0.34; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 - lado * cw * 0.15, (y0 + h) / 2, x0 - lado * cw * 0.45, h + 10); c.stroke(); });
    c.restore();
  }
  // linhas de velocidade saindo do horizonte (turbo, foguete, mini-turbo) e uma moldura azul nas beiradas
  function linhasVelocidade(c, g, w, h, forca) {
    if (forca <= 0.02) return;
    var ox = g.cx, oy = g.cy + g.KY * 0.15, R = Math.sqrt(w * w + h * h);
    c.save(); c.globalCompositeOperation = 'lighter';
    for (var k = 0; k < 34; k++) {
      var a = Math.random() * Math.PI * 2, r0 = R * (0.18 + Math.random() * 0.3), r1 = r0 + R * (0.12 + Math.random() * 0.35);
      c.globalAlpha = forca * (0.25 + Math.random() * 0.45); c.strokeStyle = k % 5 ? '#ffffff' : '#7cf9ff'; c.lineWidth = 1 + Math.random() * 2.5;
      c.beginPath(); c.moveTo(ox + Math.cos(a) * r0, oy + Math.sin(a) * r0); c.lineTo(ox + Math.cos(a) * r1, oy + Math.sin(a) * r1); c.stroke();
    }
    c.globalAlpha = 1;
    var gv = c.createRadialGradient(ox, oy, R * 0.25, ox, oy, R * 0.6); gv.addColorStop(0, 'rgba(60,140,255,0)'); gv.addColorStop(1, 'rgba(60,140,255,' + (0.3 * forca).toFixed(3) + ')');
    c.fillStyle = gv; c.fillRect(0, 0, w, h);
    c.restore();
  }
  // fogos de artifício: um foguete sobe (partícula 'rojao') e estoura em brasas coloridas
  function fogos(vs, n) {
    for (var k = 0; k < n; k++) vs.parts.push({ tipo: 'rojao', cor: S.ARCO[Math.floor(Math.random() * 7)], x: (Math.random() - 0.5) * 2.2, y: 0.5, vx: (Math.random() - 0.5) * 0.4, vy: -2.4 - Math.random() * 0.8, vida: 0.55 + Math.random() * 0.35 + k * 0.12, max: 1.4 });
  }
  function estourar(vs, p) {
    for (var k = 0; k < 26; k++) { var a = k / 26 * Math.PI * 2, v = 0.9 + Math.random() * 0.5; vs.parts.push({ tipo: 'brasa', cor: k % 4 ? p.cor : '#ffffff', x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 1 + Math.random() * 0.4, max: 1.4 }); }
    if (raiz.VruuumSom) raiz.VruuumSom.tocar('fogos');
  }
  function brilhinhos(vs, n, cor) { for (var k = 0; k < n; k++) { var a = Math.random() * Math.PI * 2, v = 0.5 + Math.random() * 0.8; vs.parts.push({ tipo: 'brasa', cor: cor || '#ffd166', x: 0, y: -0.25, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.6, vida: 0.6, max: 0.6 }); } }
  // brilho em volta da estrela da pista (pisca devagar, com uma cruzinha de luz girando)
  function brilhoEstrela(c, x, y, esc, t, idx) {
    var r = esc * 520; if (r < 2) return;
    c.save(); c.globalCompositeOperation = 'lighter';
    var p = 0.5 + 0.5 * Math.sin(t * 4 + idx);
    luz(c, x, y - esc * 260, r, '#ffd166', 0.25 + 0.25 * p);
    if (p > 0.75) { c.translate(x + esc * 140, y - esc * 420); c.rotate(t * 2); c.fillStyle = 'rgba(255,255,255,' + ((p - 0.75) * 4).toFixed(2) + ')'; c.fillRect(-r * 0.35, -r * 0.03, r * 0.7, r * 0.06); c.fillRect(-r * 0.03, -r * 0.35, r * 0.06, r * 0.7); }
    c.restore();
  }

  // morcego <-> Drácula (1.16.0: os dois em 3D): um some enquanto o outro aparece, com um puf de fumaça roxa.
  // vivo3d(id) desenha o modelo 3D com esse nome no lugar do veículo
  function morcegoDracula(c, obj, virado, cw, ch, tt, vivo3d) {
    var dt = obj.tMorf ? Math.min(0.1, tt - obj.tMorf) : 0; obj.tMorf = tt;
    obj.morf = (obj.morf || 0) + ((virado ? 1 : 0) - (obj.morf || 0)) * Math.min(1, dt * 7);
    var m = obj.morf;
    if (m < 0.98) { c.globalAlpha = 1 - m; vivo3d('morcego'); }
    if (m > 0.02) { c.globalAlpha = m; vivo3d('dracula'); }
    c.globalAlpha = 1;
    if (m > 0.08 && m < 0.92) {   // puf! fumaça roxa
      var f = Math.sin(m * Math.PI);
      for (var k = 0; k < 9; k++) { var a = k / 9 * Math.PI * 2 + tt; c.fillStyle = 'rgba(' + (k % 2 ? '120,90,160' : '200,190,220') + ',' + (0.55 * f).toFixed(2) + ')'; c.beginPath(); c.arc(Math.cos(a) * cw * 0.3 * f, -ch * 0.5 + Math.sin(a) * ch * 0.25 * f, cw * 0.12 * (0.6 + f), 0, Math.PI * 2); c.fill(); }
    }
  }
  // ---------- looping (360°) ----------
  /* O looping é desenhado em 3D de verdade: uma fita de estrada que sobe, passa de cabeça para baixo e desce ao lado
     da entrada (a saída fica LOOP_DESVIO para o lado). Coordenadas do looping: (0,0,0) = começo, no meio da estrada;
     x para a direita, y para cima, z para a frente. De longe ele aparece na estrada como um arco enorme; quando o
     carro entra, a câmera vai junto (o carro fica parado na tela e o mundo gira em volta: céu e chão trocam de lugar). */
  var FATIAS = 60, PERTO = 40;
  function loopCentro(l, f) { return [l.desvio * (f - Math.sin(f)) / (2 * Math.PI), l.R * (1 - Math.cos(f)), l.R * Math.sin(f)]; }
  function loopCima(f) { return [0, Math.cos(f), -Math.sin(f)]; }
  function loopFrente(f) { return [0, Math.sin(f), Math.cos(f)]; }
  function mais(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
  // câmera: posição p e eixos d (direita), u (cima), f (frente)
  function noCam(cam, p) { var x = p[0] - cam.p[0], y = p[1] - cam.p[1], z = p[2] - cam.p[2]; return [x * cam.d[0] + y * cam.d[1] + z * cam.d[2], x * cam.u[0] + y * cam.u[1] + z * cam.u[2], x * cam.f[0] + y * cam.f[1] + z * cam.f[2]]; }
  function naTela(q, g) { return [g.cx + q[0] / q[2] * PROF * g.K, g.cy - q[1] / q[2] * PROF * g.KY]; }
  // polígono em 3D: corta o que fica atrás da câmera e pinta
  function poli3(c, cam, g, pts, cor) {
    var q = pts.map(function (p) { return noCam(cam, p); }), out = [];
    for (var i = 0; i < q.length; i++) {
      var a = q[i], b = q[(i + 1) % q.length], aD = a[2] >= PERTO, bD = b[2] >= PERTO;
      if (aD) out.push(a);
      if (aD !== bD) { var t = (PERTO - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, PERTO]); }
    }
    if (out.length < 3) return;
    c.fillStyle = cor; c.beginPath();
    out.forEach(function (p, k) { var s = naTela(p, g); if (k) c.lineTo(s[0], s[1]); else c.moveTo(s[0], s[1]); });
    c.closePath(); c.fill();
  }
  function profundidade(cam, pts) { var d = 0; pts.forEach(function (p) { d += noCam(cam, p)[2]; }); return d / pts.length; }
  // a fita do looping em fatias (estrada, beiradas com mureta, faixas), cada uma com a sua distância
  function fitaLoop(l, cam, g, pc, lista) {
    var W = LARG, dF = Math.PI * 2 / FATIAS, nt = pc.noite;
    for (var k = 0; k < FATIAS; k++) {
      var fa = k * dF, fb = (k + 1.06) * dF, fm = (k + 0.5) * dF, ca = loopCentro(l, fa), cb = loopCentro(l, Math.min(Math.PI * 2, fb)), up = loopCima(fm);
      var meio = loopCentro(l, fm), olha = [cam.p[0] - meio[0], cam.p[1] - meio[1], cam.p[2] - meio[2]];
      var deCima = olha[0] * 0 + olha[1] * up[1] + olha[2] * up[2] > 0, par = k % 2;
      (function (ca, cb, up, deCima, par, k, fm) {
        var pista = [mais(ca, [1, 0, 0], -W), mais(ca, [1, 0, 0], W), mais(cb, [1, 0, 0], W), mais(cb, [1, 0, 0], -W)];
        lista.push({ d: profundidade(cam, pista), f: function (c) {
          var cor = deCima ? pc.pista[par] : css(mixRgb(pc.num.pista[par], [10, 8, 20], 0.55));
          poli3(c, cam, g, [mais(ca, [1, 0, 0], -W * 1.13), mais(ca, [1, 0, 0], W * 1.13), mais(cb, [1, 0, 0], W * 1.13), mais(cb, [1, 0, 0], -W * 1.13)], pc.borda[par]);
          poli3(c, cam, g, pista, cor);
          if (deCima && !par) [-1 / 3, 1 / 3].forEach(function (fx) { poli3(c, cam, g, [mais(ca, [1, 0, 0], W * fx - W / 32), mais(ca, [1, 0, 0], W * fx + W / 32), mais(cb, [1, 0, 0], W * fx + W / 32), mais(cb, [1, 0, 0], W * fx - W / 32)], pc.faixa); });
          // muretas dos dois lados (dão a grossura da fita) e luzinhas acesas à noite
          [-1, 1].forEach(function (lado) {
            var a1 = mais(ca, [1, 0, 0], lado * W * 1.13), b1 = mais(cb, [1, 0, 0], lado * W * 1.13);
            poli3(c, cam, g, [a1, b1, mais(b1, up, 380), mais(a1, up, 380)], css(mixRgb(pc.num.borda[par], [0, 0, 0], 0.35)));
            if (nt > 0.1 && k % 3 === 0) { var qq = noCam(cam, mais(a1, up, 420)); if (qq[2] > PERTO) { var s = naTela(qq, g); c.save(); c.globalCompositeOperation = 'lighter'; luz(c, s[0], s[1], PROF / qq[2] * g.K * 500, hexDe(pc.num.borda[0]), 0.9 * nt); c.restore(); } }
          });
        } });
      })(ca, cb, up, deCima, par, k, fm);
    }
  }
  // um boneco/veículo em pé num ponto do looping (ou da estrada perto dele), virado para o "cima" de onde está
  function emPe(c, cam, g, base, up, spr, desenhaMais) {
    var q = noCam(cam, base); if (q[2] < PERTO * 4) return;
    var a = naTela(q, g), b = naTela(noCam(cam, mais(base, up, 600)), g), esc = PROF / q[2] * g.K;
    c.save(); c.translate(a[0], a[1]); c.rotate(Math.atan2(b[0] - a[0], -(b[1] - a[1])));
    var dw = spr.w * esc, dh = spr.h * esc;
    c.drawImage(spr.img, -dw / 2, -dh, dw, dh);
    if (desenhaMais) desenhaMais(c, -dw / 2, -dh, dw, dh);
    c.restore();
  }
  // onde está (em coordenadas do looping) quem anda em z, no looping l: no looping, na estrada de antes ou na de depois
  function noLooping(l, z, x) {
    var z0 = l.ini * SEG, z1 = l.fim * SEG;
    if (z < z0) return { p: [x * LARG, 0, z - z0], up: [0, 1, 0] };
    if (z >= z1) return { p: [l.desvio + x * LARG, 0, z - z1], up: [0, 1, 0] };
    var f = (z - z0) / l.R;
    return { p: mais(loopCentro(l, f), [1, 0, 0], x * LARG), up: loopCima(f), f: f };
  }
  // os rivais (e o outro jogador) que estão no looping ou perto dele, para entrar na lista de desenho
  function quemNoLoop(e, l, ji, cam, g, lista, soNoLoop) {
    var z0 = l.ini * SEG - 120 * SEG, z1 = l.fim * SEG + 150 * SEG;
    e.rivais.forEach(function (rv, k) {
      var rd = RIV[k]; if (!rd || rd.voa || rv.z < z0 || rv.z > z1) return;
      var o = noLooping(l, rv.z, rv.x); if (soNoLoop && o.f == null) return;
      lista.push({ d: noCam(cam, o.p)[2], f: function (c) {
        var fr = rd.spr.quadros ? faseSkate(rd, rv, e, rd.veic) : 0;
        emPe(c, cam, g, o.p, o.up, S.quadro(rd.spr, fr), function (c2, x0, y0, dw, dh) { if (dw > 24) pilotoVivo(c2, rd.veic, x0, y0, dw, dh, rd.info, 10 + k * 2.1, 6, ondeCabeca(rd.veic, x0, y0, dw, dh, fr)); });
      } });
    });
    var outro = e.jogadores.length === 2 ? e.jogadores[1 - ji] : null;
    if (outro && !VOA[outro.n] && outro.z > z0 && outro.z < z1) {
      var o2 = noLooping(l, outro.z, outro.x);
      if (!(soNoLoop && o2.f == null)) lista.push({ d: noCam(cam, o2.p)[2], f: function (c) {
        var vsO = VS[outro.n], fr = vsO && vsO.fPe != null ? vsO.fPe : 0.8;
        emPe(c, cam, g, o2.p, o2.up, S.quadro(carrosJog[outro.n], fr), function (c2, x0, y0, dw, dh) { if (dw > 24) pilotoVivo(c2, VEIC[outro.n], x0, y0, dw, dh, INFO[outro.n], outro.n * 3.3, 7, ondeCabeca(VEIC[outro.n], x0, y0, dw, dh, fr)); });
      } });
    }
  }
  function pintarLista(c, lista) { lista.sort(function (a, b) { return b.d - a.d; }); for (var k = 0; k < lista.length; k++) lista[k].f(c); }
  // de longe (câmera normal, ainda antes do looping): só o arco, no lugar certo da estrada (x0: onde a estrada está na tela)
  function arcoDeLonge(c, e, ji, l, camLocal, g) {
    var cam = { p: camLocal, d: [1, 0, 0], u: [0, 1, 0], f: [0, 0, 1] }, lista = [], pc = corPedaco(e.pista, e.pista.segs[l.ini]);
    fitaLoop(l, cam, g, pc, lista);
    quemNoLoop(e, l, ji, cam, g, lista, true);
    pintarLista(c, lista);
  }
  // o looping em que está a câmera de quem joga (o carro já entrou e a câmera ainda não saiu)
  function loopDaCamera(pista, z) {
    var l = pista.loops || [];
    for (var k = 0; k < l.length; k++) if (z >= l[k].ini * SEG && z < l[k].fim * SEG + JOG_Z) return l[k];
    return null;
  }
  // a cena inteira de dentro do looping: céu e chão girando, estradas de antes e depois, a fita, os rivais e os enfeites
  // ---------- volta de 360° pelo cenário (1.13.0): na largada (durante o 3-2-1) e na chegada ----------
  /* A câmera sai de trás do veículo, dá uma volta inteira em volta dele (mostrando a pista, os enfeites e os rivais
     de todos os lados) e termina exatamente na câmera do jogo. Quem é 3D (modelos3d.js, cavalo, dinossauro) gira de
     verdade; os outros dão uma meia-volta curtinha (desenho de costas). */
  function suaveO(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function eh3d(vv) { return !!(vv && (vv.modelo || vv.cavalo)); }
  function orbitaAtiva(e, j, vv) {
    var M = raiz.VruuumMotor, p = -1, zoom = 0;
    if (e.fase === 'contagem') { p = (1 - e.contagem / M.CONTAGEM) / 0.85; zoom = 1 - suaveO(p); }
    else if (j.chegou && e.t - j.tempo < M.DEPOIS_DO_FIM) { p = (e.t - j.tempo) / M.DEPOIS_DO_FIM; zoom = Math.sin(Math.PI * Math.min(1, p)) * 0.9; }
    if (p < 0 || p >= 1) return null;
    var th = eh3d(vv) ? suaveO(p) * Math.PI * 2 : Math.sin(Math.PI * suaveO(p)) * 0.45;
    return { th: th, zoom: zoom };
  }
  function norm3(v) { var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function cruz(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  // desenha quem corre num ponto da cena: 3D (gira com a câmera) ou o desenho de costas
  function corredorNaCena(c, cam, g, p, vv, spr, info, fase, th, semente, voa) {
    var q = noCam(cam, p); if (q[2] < PERTO * 4) return;
    var b = naTela(q, g), esc = PROF / q[2] * g.K, W = spr.w * esc, H = spr.h * esc;
    if (vv && vv.modelo && MOD()) modeloVivo(c, vv, b[0] - W / 2, b[1] - H * 0.93, W, H, info, fase, 0, 0, semente, 6, 0, th);
    else if (vv && vv.cavalo && CAV()) { var on = CAV().vivo(c, b[0] - W / 2, b[1] - H * 0.93, W, H, info.cor, fase, { yaw: th }, info.corpo, Date.now() / 1000, vv.bicho); pilotoVivo(c, vv, b[0] - W / 2, b[1] - H, W, H, info, semente, 6, on); }
    else { emPe(c, cam, g, p, [0, 1, 0], S.quadro(spr, fase), function (c2, x0, y0, dw, dh) { if (dw > 24) pilotoVivo(c2, vv, x0, y0, dw, dh, info, semente, 6, ondeCabeca(vv, x0, y0, dw, dh, fase)); }); }
  }
  function vistaOrbita(c, e, ji, g, w, h, vs, orb) {
    var j = e.jogadores[ji], pista = e.pista, segs = pista.segs, i0 = Math.floor(j.z / SEG), dz0 = j.z - i0 * SEG;
    var P = [j.x * LARG, 0, 0], Dc = JOG_Z * (1 + orb.zoom * 1.3), Hc = ALTURA_CAM * (1 + orb.zoom * 0.25), th = orb.th;
    // a câmera olha na horizontal (como a do jogo), na direção de quem joga: o veículo fica embaixo, o céu e o cenário em cima
    var pos = [P[0] + Math.sin(th) * Dc, Hc, -Math.cos(th) * Dc];
    var f = norm3([-Math.sin(th), 0, Math.cos(th)]), r = norm3(cruz([0, 1, 0], f)), u = [0, 1, 0];
    var cam = { p: pos, d: r, u: u, f: f };
    var pc = corPedaco(pista, segs[i0]), m = segs[i0].mundo, nomeM = pista.mundos[m], nt = pc.noite;
    // céu, montanhas (correm de lado conforme a câmera gira) e chão
    var ceuA = mixRgb(hexRgb(TEMAS[nomeM].ceu[0]), hexRgb(NEON[nomeM].ceu[0]), nt), ceuB = mixRgb(hexRgb(TEMAS[nomeM].ceu[1]), hexRgb(NEON[nomeM].ceu[1]), nt);
    var yh = g.cy + f[1] * PROF * g.KY / Math.max(0.2, u[1]), gr = c.createLinearGradient(0, yh, 0, yh - h);
    gr.addColorStop(0, css(ceuB)); gr.addColorStop(1, css(ceuA)); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    if (nt > 0.3) camada(c, base.estrelasCeu, w, yh, yh, vs.nuvemX + th / (Math.PI * 2), nt);
    camada(c, nt > 0.5 ? fundoNoite(nomeM) : base.fundos[nomeM], w, yh + 2, Math.min(g.K * 0.6, g.cy * 0.9), vs.fundoX + th / (Math.PI * 2) * 3, 1);
    c.fillStyle = css(pc.num.grama[0]); c.fillRect(0, Math.max(0, yh), w, h);
    var F = 1600;
    for (var z = 40000; z > -24000; z -= F) poli3(c, cam, g, [[-50000, 0, z], [50000, 0, z], [50000, 0, z - F], [-50000, 0, z - F]], (Math.floor((z + i0 * SEG) / F) & 1) ? pc.grama[0] : pc.grama[1]);
    var Ls = LARG, S2 = 800, zb = Math.floor(-20000 / S2) * S2 - dz0 % S2;
    for (var zz = 40000; zz > -20000; zz -= S2) {
      var par = (Math.floor((zz + j.z) / S2) & 1);
      poli3(c, cam, g, [[-Ls * 1.13, 0, zz], [Ls * 1.13, 0, zz], [Ls * 1.13, 0, zz - S2], [-Ls * 1.13, 0, zz - S2]], pc.borda[par]);
      poli3(c, cam, g, [[-Ls, 0, zz], [Ls, 0, zz], [Ls, 0, zz - S2], [-Ls, 0, zz - S2]], pc.pista[par]);
      if (par) [-1 / 3, 1 / 3].forEach(function (fx) { poli3(c, cam, g, [[Ls * fx - Ls / 32, 0, zz], [Ls * fx + Ls / 32, 0, zz], [Ls * fx + Ls / 32, 0, zz - S2], [Ls * fx - Ls / 32, 0, zz - S2]], pc.faixa); });
    }
    // enfeites, rivais, o outro jogador e quem joga, do mais longe para o mais perto
    var lista = [];
    for (var i = Math.max(0, i0 - 80); i < Math.min(segs.length, i0 + 160); i++) segs[i].enfeites.forEach(function (en) {
      if (en.tipo === 'portal' || en.tipo === 'chegada' || en.tipo === 'largada') return;
      var sp = enfeiteSpr(en.tipo, nt >= 0.5); if (!sp) return;
      var p = [en.x * LARG, 0, i * SEG - j.z];
      lista.push({ d: noCam(cam, p)[2], f: function (c2) { emPe(c2, cam, g, p, [0, 1, 0], sp); } });
    });
    e.rivais.forEach(function (rv, k) {
      var rd = RIV[k]; if (!rd || Math.abs(rv.z - j.z) > SEG * 120) return;
      var p = [rv.x * LARG, 0, rv.z - j.z], fr = rd.spr.quadros ? (Date.now() / 1000 * 0.8) % 1 : 0;
      lista.push({ d: noCam(cam, p)[2], f: function (c2) { corredorNaCena(c2, cam, g, p, rd.veic, rd.spr, rd.info, fr, th, 10 + k * 2.1); } });
    });
    e.jogadores.forEach(function (o) {
      var p = [o.x * LARG, 0, o.z - j.z], fr = VS[o.n] && VS[o.n].fPe != null ? Math.max(0, VS[o.n].fPe) : (Date.now() / 1000 * 0.8) % 1;
      lista.push({ d: noCam(cam, p)[2], f: function (c2) { corredorNaCena(c2, cam, g, p, VEIC[o.n], carrosJog[o.n], INFO[o.n], fr, th, o.n * 3.3); } });
    });
    pintarLista(c, lista);
  }

  function vistaLoop(c, e, ji, l, g, w, h, vs) {
    var j = e.jogadores[ji], pista = e.pista, segs = pista.segs, o = noLooping(l, j.z, j.x);
    var fr = o.f == null ? [0, 0, 1] : loopFrente(o.f), up = o.up;
    var cam = { p: mais(mais(o.p, fr, -JOG_Z), up, ALTURA_CAM), d: [1, 0, 0], u: up, f: fr };
    var pc = corPedaco(pista, segs[l.ini]), m = segs[l.ini].mundo, nomeM = pista.mundos[m], nt = pc.noite;
    // céu e chão: a linha do horizonte depende de quanto a câmera está inclinada (de cabeça para baixo, o céu fica embaixo)
    var uy = up[1], uz = fr[1], ceuA = mixRgb(hexRgb(TEMAS[nomeM].ceu[0]), hexRgb(NEON[nomeM].ceu[0]), nt), ceuB = mixRgb(hexRgb(TEMAS[nomeM].ceu[1]), hexRgb(NEON[nomeM].ceu[1]), nt);
    var chao = css(pc.num.grama[0]);
    if (Math.abs(uy) < 1e-3) { c.fillStyle = uz > 0 ? css(ceuB) : chao; c.fillRect(0, 0, w, h); }
    else {
      var yh = g.cy + uz * PROF * g.KY / uy, sobe = uy > 0, gr = c.createLinearGradient(0, yh, 0, sobe ? yh - h : yh + h);
      gr.addColorStop(0, css(ceuB)); gr.addColorStop(1, css(ceuA));
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
      if (sobe && uy > 0.3 && yh > 0 && yh < h + g.cy) {   // de pé: as montanhas lá no fundo
        c.globalAlpha = Math.min(1, (uy - 0.3) * 2);
        camada(c, nt > 0.5 ? fundoNoite(nomeM) : base.fundos[nomeM], w, yh + 2, Math.min(g.K * 0.6, g.cy * 0.9), vs.fundoX, 1);
        c.globalAlpha = 1;
      }
      c.fillStyle = chao; c.beginPath();
      if (sobe) c.rect(0, Math.max(-10, yh), w, h + 20); else c.rect(0, -10, w, Math.max(0, yh + 10));
      c.fill();
    }
    // chão em faixas (de longe para perto)
    var F = 1600, Z0 = -40000, Z1 = 64000;
    for (var z = Z1; z > Z0; z -= F) poli3(c, cam, g, [[-60000, 0, z], [60000, 0, z], [60000, 0, z - F], [-60000, 0, z - F]], (Math.floor(z / F) & 1) ? pc.grama[0] : pc.grama[1]);
    // as estradas de antes (x = 0) e de depois (x = desvio)
    var Ls = LARG, S2 = 800;
    function estrada(x0, za, zb) {
      for (var zz = zb; zz > za; zz -= S2) {
        var par = (Math.floor(zz / S2) & 1);
        poli3(c, cam, g, [[x0 - Ls * 1.13, 0, zz], [x0 + Ls * 1.13, 0, zz], [x0 + Ls * 1.13, 0, zz - S2], [x0 - Ls * 1.13, 0, zz - S2]], pc.borda[par]);
        poli3(c, cam, g, [[x0 - Ls, 0, zz], [x0 + Ls, 0, zz], [x0 + Ls, 0, zz - S2], [x0 - Ls, 0, zz - S2]], pc.pista[par]);
        if (par) [-1 / 3, 1 / 3].forEach(function (fx) { poli3(c, cam, g, [[x0 + Ls * fx - Ls / 32, 0, zz], [x0 + Ls * fx + Ls / 32, 0, zz], [x0 + Ls * fx + Ls / 32, 0, zz - S2], [x0 + Ls * fx - Ls / 32, 0, zz - S2]], pc.faixa); });
      }
    }
    estrada(0, -36000, 0);
    estrada(l.desvio, 0, 60000);
    // fita, rivais e enfeites, do mais longe para o mais perto
    var lista = [];
    fitaLoop(l, cam, g, pc, lista);
    quemNoLoop(e, l, ji, cam, g, lista, false);
    for (var i = Math.max(0, l.ini - 150); i < Math.min(segs.length, l.fim + 200); i++) {
      if (segs[i].loop) continue;
      segs[i].enfeites.forEach(function (en) {
        var sp = enfeiteSpr(en.tipo, nt >= 0.5); if (!sp || en.tipo === 'portal' || en.tipo === 'chegada' || en.tipo === 'largada') return;
        var p = i < l.ini ? [en.x * LARG, 0, (i - l.ini) * SEG] : [l.desvio + en.x * LARG, 0, (i - l.fim) * SEG];
        lista.push({ d: noCam(cam, p)[2], f: function (c2) { emPe(c2, cam, g, p, [0, 1, 0], sp); } });
      });
    }
    pintarLista(c, lista);
  }

  // ---------- túnel ----------
  // no chão: molduras encaixadas uma na frente da outra (cada pedaço pinta tudo FORA da sua abertura),
  // com faixas de luz correndo; na entrada, uma parede grande em volta da boca. No céu: anéis de luz.
  // ---------- túnel ----------
  /* No chão o túnel é um corredor em 3D: paredes e teto ligando um pedaço ao seguinte (como a pista), uma boca em
     forma de arco na entrada (rocha, areia, doce, gelo ou prédio, conforme o mundo) e luz de fora clareando as
     paredes perto da entrada e da saída. As cores misturam dia e noite aos poucos, como o resto. No céu, um tubo de
     anéis de luz em volta da rota. A: este pedaço (perto); B: o seguinte (longe), ou null. */
  // boca do túnel por mundo: [cor de dia, cor de noite, cobertura no topo (dia), cobertura (noite)]
  var BOCA = { praia: ['#b98a52', '#2a2238', '#e9cf94', '#3a2f4a'], floresta: ['#6e6a5e', '#1a2420', '#4cc35a', '#163a24'], doces: ['#7a4a33', '#2a1426', '#ffb6e1', '#5a2050'], neve: ['#7d8aa3', '#1e2638', '#f4f8ff', '#3a4a6a'], neon: ['#2c2752', '#15122e', '#ff2bd6', '#ff2bd6'], canion: ['#c2703d', '#3a1e14', '#e8b36a', '#4a2a18'], templo: ['#6f7f7a', '#162420', '#2f8a5a', '#123a28'], lava: ['#3a2a2a', '#1a0c0c', '#ff6a00', '#ff4d00'], flutuante: ['#4b3f7a', '#1a1440', '#1d8a7a', '#3effd8'], lanche: ['#d2862e', '#3a1e10', '#f6c46e', '#ffd23f'], blocos: ['#8d8d8d', '#26262e', '#5fd068', '#5fd068'] };
  function tunel(c, s, idx, A, B, w, h, voa, ts, pista, nevoa, cobrirTela) {
    var nt = noiteEm(idx), tt = Date.now() / 1000, sx = A.x, sy = A.y, esc = A.e, escY = A.eY;
    var meia = esc * LARG * 1.32, x1 = sx - meia, x2 = sx + meia;
    var aceso = ((idx - tt * 26) % 18 + 18) % 18 < 3;   // luz que corre pelo túnel
    var corLuzNoite = hexRgb(ts.borda[(Math.floor(idx / 3)) % 2] || '#2bf4ff'), corLuz = css(mixRgb([255, 209, 102], corLuzNoite, nt));
    c.save();
    if (voa) {
      if (idx % 3 === 0) {
        var yT = A.y - escY * ALT_VOO - escY * 2400, yB = A.y - escY * ALT_VOO + escY * 900, lw = Math.max(1.2, esc * 60);
        c.globalCompositeOperation = 'lighter';
        c.strokeStyle = 'rgba(255,255,255,0)';
        c.globalAlpha = aceso ? 0.35 : 0.14; c.strokeStyle = corLuz; c.lineWidth = lw * 4; c.strokeRect(x1, yT, x2 - x1, yB - yT);
        c.globalAlpha = aceso ? 1 : 0.55; c.lineWidth = lw; c.strokeRect(x1, yT, x2 - x1, yB - yT);
      }
      c.restore(); return;
    }
    var t = pista.tuneis[s.tunel - 1] || [idx, idx + 1], ini = t[0], fim = t[1] - 1;
    // cor das paredes: dia (cinza) / noite (quase preto), mais clara perto das bocas (luz de fora entrando)
    var par = idx % 2, base0 = mixRgb(par ? [74, 79, 92] : [69, 74, 87], par ? [14, 12, 32] : [11, 10, 25], nt);
    var luzFora = Math.max(suaveT(1 - (fim - idx) / 16), suaveT(1 - (idx - ini) / 10)) * (0.6 - 0.35 * nt);
    var parede = mixRgb(base0, nevoa, luzFora), teto = mixRgb(parede, [255, 255, 255], 0.07), lado2 = mixRgb(parede, [0, 0, 0], 0.12);
    var alto = escY * 2700, yC = sy - alto, yF = sy + 1;
    if (B) {
      var meiaB = B.e * LARG * 1.32, xL2 = B.x - meiaB, xR2 = B.x + meiaB, yC2 = B.y - B.eY * 2700, yF2 = B.y + 1;
      poligono(c, x1, yF, x1, yC, xL2, yC2, xL2, yF2, css(parede));       // parede esquerda
      poligono(c, x2, yF, x2, yC, xR2, yC2, xR2, yF2, css(lado2));        // parede direita (um pouco mais escura)
      poligono(c, x1, yC, x2, yC, xR2, yC2, xL2, yC2, css(teto));         // teto
      if (idx % 3 === 0) {   // lâmpada no teto e filetes de luz nos cantos
        c.globalCompositeOperation = 'lighter';
        poligono(c, sx - meia * 0.14, yC, sx + meia * 0.14, yC, B.x + meiaB * 0.14, yC2, B.x - meiaB * 0.14, yC2, corLuz);
        c.globalAlpha = aceso ? 0.9 : 0.35; c.strokeStyle = corLuz; c.lineWidth = Math.max(1, esc * 40);
        c.beginPath(); c.moveTo(x1, yC); c.lineTo(xL2, yC2); c.moveTo(x2, yC); c.lineTo(xR2, yC2); c.stroke();
        c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      }
    }
    if (cobrirTela) {   // dentro do túnel: o pedaço mais perto cobre o resto da tela com parede e teto
      c.fillStyle = css(parede); c.beginPath(); c.rect(-10, -10, w + 20, yF + 10); c.rect(x1, yC, x2 - x1, yF - yC);
      try { c.fill('evenodd'); } catch (e2) { c.fill(); }
    }
    if (idx === fim && B) {   // saída: a luz lá de fora espalha um pouco em volta da boca
      c.globalCompositeOperation = 'lighter';
      var gl = c.createRadialGradient(B.x, (yC2 + yF2) / 2, meiaB * 0.6, B.x, (yC2 + yF2) / 2, meiaB * 2.2);
      gl.addColorStop(0, 'rgba(255,255,255,' + (0.28 * (1 - 0.6 * nt)).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = gl; c.fillRect(B.x - meiaB * 2.3, yC2 - meiaB * 1.5, meiaB * 4.6, (yF2 - yC2) + meiaB * 3);
      c.globalCompositeOperation = 'source-over';
    }
    if (idx === ini) {   // boca do túnel: um morro (ou prédio) com abertura em arco
      var bc = BOCA[pista.mundos[s.mundo]] || BOCA.floresta, cor = mixRgb(hexRgb(bc[0]), hexRgb(bc[1]), nt);
      var L = meia * 4.2, topo = sy - escY * 6200, r = meia;
      c.fillStyle = css(cor); c.beginPath();
      c.moveTo(sx - L, yF); c.lineTo(sx - L, topo + escY * 1800); c.quadraticCurveTo(sx - L * 0.7, topo, sx, topo); c.quadraticCurveTo(sx + L * 0.7, topo, sx + L, topo + escY * 1800); c.lineTo(sx + L, yF); c.closePath();
      c.moveTo(x1, yF); c.lineTo(x1, yC + r * 0.55); c.quadraticCurveTo(x1, yC - r * 0.15, sx, yC - r * 0.15); c.quadraticCurveTo(x2, yC - r * 0.15, x2, yC + r * 0.55); c.lineTo(x2, yF); c.closePath();
      try { c.fill('evenodd'); } catch (e3) { c.fill(); }
      // cobertura no alto do morro (neve, grama, areia clara, glacê de doce; no neon, um fio de luz)
      c.save(); c.beginPath(); c.moveTo(sx - L, topo + escY * 1800); c.quadraticCurveTo(sx - L * 0.7, topo, sx, topo); c.quadraticCurveTo(sx + L * 0.7, topo, sx + L, topo + escY * 1800);
      c.lineTo(sx + L, topo + escY * 2500); c.quadraticCurveTo(sx + L * 0.7, topo + escY * 700, sx, topo + escY * 700); c.quadraticCurveTo(sx - L * 0.7, topo + escY * 700, sx - L, topo + escY * 2500); c.closePath();
      c.fillStyle = css(mixRgb(hexRgb(bc[2]), hexRgb(bc[3]), nt)); c.fill(); c.restore();
      // sombra por dentro da boca e contorno de luz (amarelo de dia, neon à noite)
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = Math.max(1, esc * 160);
      c.beginPath(); c.moveTo(x1, yF); c.lineTo(x1, yC + r * 0.55); c.quadraticCurveTo(x1, yC - r * 0.15, sx, yC - r * 0.15); c.quadraticCurveTo(x2, yC - r * 0.15, x2, yC + r * 0.55); c.lineTo(x2, yF); c.stroke();
      c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.55 + 0.35 * nt; c.strokeStyle = corLuz; c.lineWidth = Math.max(1.5, esc * 70); c.stroke();
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    }
    c.restore();
  }
  // postes de neon dos dois lados da estrada, piscando devagar
  function postesNeon(c, idx, sx, sy, esc, clip, ts, w, escY) {
    var tt = Date.now() / 1000;
    [-1, 1].forEach(function (lado, k) {
      var px = sx + esc * lado * 1.28 * LARG, topo = sy - escY * 2600;
      if (px < -50 || px > w + 50 || sy > clip + 4) return;
      var cor = ts.borda[(idx / 8 + k) % 2], pisca = 0.55 + 0.45 * Math.sin(tt * 3 + idx * 0.7 + k);
      c.fillStyle = '#1b1830'; c.fillRect(px - Math.max(0.6, esc * 20), topo, Math.max(1.2, esc * 40), sy - topo);
      c.save(); c.globalCompositeOperation = 'lighter';
      c.fillStyle = rgba(cor, pisca); c.fillRect(px - Math.max(0.5, esc * 14), topo + escY * 150, Math.max(1, esc * 28), escY * 1500);
      luz(c, px, topo + escY * 800, esc * 1100, cor, 0.35 * pisca);
      c.fillStyle = '#1b1830'; c.fillRect(px - lado * esc * 420, topo, esc * 420, Math.max(1, escY * 50));   // braço por cima da estrada
      luz(c, px - lado * esc * 400, topo + escY * 40, esc * 380, '#fff2cc', 0.5 * pisca);
      luz(c, px, sy, esc * 700, cor, 0.18 * pisca);   // reflexo no chão
      c.restore();
    });
  }
  // pórtico de neon atravessando a estrada (no céu, um aro de luz na rota) — enche a parte de cima da tela
  function portico(c, idx, sx, base0, esc, clip, ts, w, escY, voa) {
    var meia = esc * LARG * 1.4, x1 = sx - meia, x2 = sx + meia, tt = Date.now() / 1000;
    var topo = voa ? base0 - escY * 3000 : base0 - escY * 3400, fundo = voa ? base0 + escY * 1000 : base0;
    if (x2 < -20 || x1 > w + 20 || (!voa && base0 > clip + 4)) return;
    var cor = ts.borda[(idx / 48 | 0) % 2], outra = ts.borda[((idx / 48 | 0) + 1) % 2], pul = 0.6 + 0.4 * Math.sin(tt * 4 + idx);
    var lw = Math.max(1.2, esc * 70);
    c.save();
    if (!voa) { c.fillStyle = '#17142c'; c.fillRect(x1 - lw, topo, lw * 2, fundo - topo); c.fillRect(x2 - lw, topo, lw * 2, fundo - topo); c.fillRect(x1, topo, x2 - x1, Math.max(2, escY * 260)); }
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = rgba(cor, 0.25 * pul); c.lineWidth = lw * 5;
    c.beginPath(); c.moveTo(x1, fundo); c.lineTo(x1, topo); c.lineTo(x2, topo); c.lineTo(x2, fundo); if (voa) c.closePath(); c.stroke();
    c.strokeStyle = rgba(cor, 0.95 * pul); c.lineWidth = lw;
    c.beginPath(); c.moveTo(x1, fundo); c.lineTo(x1, topo); c.lineTo(x2, topo); c.lineTo(x2, fundo); if (voa) c.closePath(); c.stroke();
    // luzinhas correndo na barra de cima
    for (var k = 0; k < 9; k++) { var acesa = ((k + Math.floor(tt * 8)) % 3) === 0; luz(c, x1 + (x2 - x1) * (k + 0.5) / 9, topo + escY * 130, esc * 160, acesa ? outra : cor, acesa ? 0.9 : 0.3); }
    c.restore();
  }

  // lanternas vermelhas acesas nos carrinhos do trânsito (e luzes piscando nos aviões)
  function lanternasTransito(c, tipo, x, y, esc) {
    var spr = base[tipo]; if (!spr) return;
    var dw = spr.w * esc, dh = spr.h * esc, yl = y - dh * (tipo === 'onibus' ? 0.38 : 0.43), dx = dw * (tipo === 'onibus' ? 0.36 : 0.34);
    c.save(); c.globalCompositeOperation = 'lighter';
    luz(c, x - dx, yl, dw * 0.28, '#ff2a2a', 0.8); luz(c, x + dx, yl, dw * 0.28, '#ff2a2a', 0.8);
    c.restore();
  }
  function luzesAviao(c, x, y, esc, idx) {
    var liga = Math.sin(Date.now() / 160 + idx) > 0.3, dw = 1300 * esc;
    c.save(); c.globalCompositeOperation = 'lighter';
    luz(c, x - dw * 0.47, y - dw * 0.18, dw * 0.12, '#ff3b3b', liga ? 0.9 : 0.25); luz(c, x + dw * 0.47, y - dw * 0.18, dw * 0.12, '#4cd964', liga ? 0.9 : 0.25);
    c.restore();
  }

  // braços do skatista (desenhados ao vivo, seguem a curva): o de trás antes do boneco, o da frente depois
  function bracos(c, vv, x0, y0, w, h, cor, fase, lado, qual) { if (vv && vv.bracos && V()) V().bracosSkate(c, x0, y0, w, h, cor || '#7b2cbf', fase, lado, qual); }
  // em que momento da remada está o skatista (obj guarda o ritmo): mais rápido, rema mais depressa;
  // pulando ou parado, os dois pés ficam no shape
  // (no cavalo é a passada do galope: mais ligeira; pulando, as 4 patas ficam juntas no ar; parado, fica em pé)
  function faseSkate(obj, cor, e, vv) {
    var tt = Date.now() / 1000, dt = obj.tPe ? Math.min(0.1, Math.max(0, tt - obj.tPe)) : 0, rap = Math.min(1, (cor.vel || 0) / e.pista.cfg.velMax), cav = vv && vv.cavalo;
    obj.tPe = tt;
    if (cav && cor.pulo > 0) { obj.fPe = 0.93; return 0.93; }
    if (cav && rap < 0.03) { obj.fPe = -1; return -1; }
    if (cor.pulo > 0 || rap < 0.03) { obj.fPe = 0.8; return 0.8; }
    obj.fPe = ((obj.fPe == null || obj.fPe < 0 ? 0.8 : obj.fPe) + dt * (cav ? 1.0 + 1.3 * rap : 0.6 + 0.5 * rap)) % 1;
    return obj.fPe;
  }

  function desenharCarro(c, j, vs, g, h, w, e) {
    var K = g.K, esc = K / ALTURA_CAM, spr = carrosJog[j.n], cw = spr.w * esc, ch = spr.h * esc;
    var chao = g.cy + g.KY, lift = j.pulo > 0 ? Math.sin(Math.PI * (1 - j.pulo / (j.puloMax || raiz.VruuumMotor.PULO))) * K * 0.42 * (j.puloMax || 1.1) / 1.1 : 0;
    if (j.fora && j.vel > 100) lift += Math.random() * K * 0.012;
    if (j.turbo > 0) {
      var tr = Math.min(1, j.turbo), lw = cw * 0.8 / 7;
      for (var k = 0; k < 7; k++) {
        var gr = c.createLinearGradient(0, chao - lift, 0, h); gr.addColorStop(0, ESTILO !== 'colorido' ? (k % 2 ? '#ff2bd6' : '#2bf4ff') : S.ARCO[k]); gr.addColorStop(1, 'rgba(255,255,255,0)');
        c.globalAlpha = 0.75 * tr; c.fillStyle = gr; c.fillRect(g.cx - cw * 0.4 + k * lw, chao - lift - ch * 0.15, lw + 1, h);
      }
      c.globalAlpha = 1;
    }
    var vv = VEIC[j.n], voa = !!VOA[j.n], tt = Date.now() / 1000;
    if (voa) lift += Math.sin(tt * 2.2) * K * 0.012;   // flutuando no ar
    if (lift > 0 && !voa) { c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse ? c.ellipse(g.cx, chao, cw * 0.45 * (1 - lift / K), ch * 0.06, 0, 0, Math.PI * 2) : c.arc(g.cx, chao, cw * 0.4, 0, Math.PI * 2); c.fill(); }
    var segAqui = P.achar(e.pista, j.z), forcaLuz = segAqui.tunel ? 1 : noiteEm(segAqui.i), acesas = forcaLuz > 0.02;   // faróis acendem aos poucos ao anoitecer
    var naAgua = !voa && !!segAqui.agua && !j.loop;
    if (naAgua) { lift += (0.5 + 0.5 * Math.sin(tt * 5)) * K * 0.008; esteira(c, g.cx, chao, cw, ch, h, tt, Math.min(1, j.vel / e.pista.cfg.velMax)); }
    if (acesas) {
      c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = forcaLuz;
      // faróis iluminando a estrada à frente
      var yF = chao - lift - ch * 0.25, yL = g.cy + g.KY * 0.3;
      [-1, 1].forEach(function (l) {
        var gr2 = c.createLinearGradient(0, yF, 0, yL); gr2.addColorStop(0, 'rgba(255,244,214,.32)'); gr2.addColorStop(1, 'rgba(255,244,214,0)');
        c.fillStyle = gr2; c.beginPath(); c.moveTo(g.cx + l * cw * 0.18, yF); c.lineTo(g.cx + l * cw * 0.34, yF); c.lineTo(g.cx + l * cw * 0.7 + vs.lado * K * 0.2, yL); c.lineTo(g.cx + l * cw * 0.05 + vs.lado * K * 0.2, yL); c.fill();
      });
      if (!voa) {   // luz neon por baixo do veículo, na cor dele
        var corV = (INFO[j.n] && INFO[j.n].cor) || '#2bf4ff', pul = 0.75 + Math.sin(tt * 4) * 0.15;
        c.save(); c.translate(g.cx, chao - lift); c.scale(1, 0.22); luz(c, 0, 0, cw * 0.75, corV, 0.75 * pul); c.restore();
      }
      // rastro de luz das lanternas quando está rápido
      var rap = Math.min(1, j.vel / e.pista.cfg.velMax);
      if (!voa && rap > 0.5) [-1, 1].forEach(function (l) {
        var gr3 = c.createLinearGradient(0, chao - lift - ch * 0.4, 0, h); gr3.addColorStop(0, 'rgba(255,40,40,' + (0.5 * rap) + ')'); gr3.addColorStop(1, 'rgba(255,40,40,0)');
        c.fillStyle = gr3; c.fillRect(g.cx + l * cw * 0.36 - cw * 0.03, chao - lift - ch * 0.4, cw * 0.06, h);
      });
      c.restore();
    }
    c.save();
    c.translate(g.cx, chao - lift);
    // avião inclina bem nas curvas; moto deita um pouco; carro quase nada
    var inclina = voa ? 0.3 : (vv && (vv.id === 'moto' || vv.id === 'skate') ? 0.22 : vv && vv.cavalo ? 0.04 : 0.07);
    var derr = j.derrapa > 0 && !voa, nivD = derr ? M2().nivelDerrapa(j.derrapa) : 0;
    if (derr && !naAgua && !(vv && vv.cavalo)) { c.restore(); marcasPneu(c, g, h, cw, j.ladoDerrapa, lift); c.save(); c.translate(g.cx, chao - lift); }
    c.rotate(vs.lado * inclina + (derr ? j.ladoDerrapa * 0.14 : 0) + (j.rodando > 0 ? Math.sin(j.rodando * 22) * 0.25 : 0));
    if (j.rodando > 0) c.scale(Math.max(0.25, Math.abs(Math.cos(j.rodando * 9))) * (Math.cos(j.rodando * 9) < 0 ? -1 : 1), 1);
    var faseQ = spr.quadros ? faseSkate(vs, j, e, vv) : 0, corJ = INFO[j.n] && INFO[j.n].cor, onde = null;
    bracos(c, vv, -cw / 2, -ch, cw, ch, corJ, faseQ, vs.lado, 'longe');
    if (vv && vv.cavalo && CAV()) onde = CAV().vivo(c, -cw / 2, -ch, cw, ch, corJ, faseQ, vs.lado, INFO[j.n].corpo, tt, vv.bicho);   // ao vivo: de lado nas curvas
    else if (vv && vv.dracula) morcegoDracula(c, vs, j.dracula, cw, ch, tt, function (id) { var v2 = Object.create(vv); v2.modelo = id; modeloVivo(c, v2, -cw / 2, -ch, cw, ch, INFO[j.n], faseQ, vs.lado, 0, j.n * 3.3, 7, 0); });
    else if (vv && vv.modelo && MOD()) {   // 3D: no morro inclina (subindo mostra a traseira de baixo, descendo mostra o teto) e no pulo empina
      var sg = P.achar(e.pista, j.z), alvoI = Math.atan((sg.p2.y - sg.p1.y) / SEG) * 1.4 + (j.pulo > 0 ? Math.sin(Math.PI * 2 * (1 - j.pulo / (j.puloMax || 1))) * 0.25 : 0);
      vs.incl = (vs.incl || 0) + (alvoI - (vs.incl || 0)) * 0.15;
      modeloVivo(c, vv, -cw / 2, -ch, cw, ch, INFO[j.n], spr.quadros ? faseQ : tt * 0.5, vs.lado + (derr ? j.ladoDerrapa * 0.5 : 0), vs.incl, j.n * 3.3, 7, j.pulo > 0 ? 1 : 0, 0, naAgua);
    }
    else c.drawImage((spr.quadros ? S.quadro(spr, faseQ) : spr).img, -cw / 2, -ch, cw, ch);
    bracos(c, vv, -cw / 2, -ch, cw, ch, corJ, faseQ, vs.lado, 'perto');
    if (!(vv && (vv.modelo || vv.semPiloto))) pilotoVivo(c, vv, -cw / 2, -ch, cw, ch, INFO[j.n], j.n * 3.3, 7, onde);
    if (naAgua) borrifos(c, cw, ch, tt, Math.min(1, j.vel / e.pista.cfg.velMax));
    if (j.turbo > 0 && !voa && !naAgua && !(vv && (vv.cavalo || vv.bracos))) fogoEscape(c, cw, ch, Math.min(1, j.turbo), j.foguete > 0);
    if (derr) faiscasDerrapa(c, cw, ch, nivD, j.ladoDerrapa);
    if (j.escudo > 0) bolhaEscudo(c, cw, ch, j.escudo, tt);
    if (acesas && !voa) {   // lanternas brilhando
      c.globalCompositeOperation = 'lighter';
      luz(c, -cw * 0.36, -ch * 0.4, cw * 0.22, '#ff2a2a', 0.75 * forcaLuz); luz(c, cw * 0.36, -ch * 0.4, cw * 0.22, '#ff2a2a', 0.75 * forcaLuz);
      c.globalCompositeOperation = 'source-over';
    }
    c.restore();
  }

  // partes que se mexem, desenhadas por cima do veículo (origem: meio da base do desenho)

  function desenharEfeitos(c, vs, g, w, h) {
    var K = g.K, ox = g.cx, oy = g.cy + g.KY * 0.72;
    vs.parts.forEach(function (p) {
      var px = ox + p.x * K, py = oy + p.y * K, f = Math.min(1, p.vida / (p.max * 0.4));
      c.globalAlpha = Math.max(0, f);
      if (p.tipo === 'txt') {
        var ft = K * 0.16 * p.tam; c.font = '700 ' + Math.round(ft) + 'px ' + FONTE + ',' + EMOJI;
        var lt = c.measureText(p.txt).width; if (lt > w * 0.92) { ft *= w * 0.92 / lt; c.font = '700 ' + Math.round(ft) + 'px ' + FONTE + ',' + EMOJI; }
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.lineWidth = K * 0.025; c.strokeStyle = 'rgba(26,20,70,.85)'; c.strokeText(p.txt, px, py - K * 0.35); c.fillStyle = p.cor; c.fillText(p.txt, px, py - K * 0.35);
      } else if (p.tipo === 'est') sprite(c, base.estrela, K / 1400, px, py, 0, w);
      else if (p.tipo === 'gota') { c.fillStyle = p.cor; c.beginPath(); c.arc(px, py, K * 0.025, 0, Math.PI * 2); c.fill(); }
      else if (p.tipo === 'rojao' || p.tipo === 'brasa') {
        c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.max(0, Math.min(1, p.vida / (p.max * 0.5)));
        c.strokeStyle = p.cor; c.lineWidth = Math.max(1, K * (p.tipo === 'rojao' ? 0.012 : 0.008)); c.beginPath(); c.moveTo(px, py); c.lineTo(px - p.vx * K * 0.06, py - p.vy * K * 0.06); c.stroke();
        luz(c, px, py, K * 0.04, p.cor.length === 7 ? p.cor : '#ffffff', 0.8); c.restore();
      }
      else { c.save(); c.translate(px, py); c.rotate(p.giro); c.fillStyle = p.cor; c.fillRect(-K * 0.02, -K * 0.01, K * 0.04, K * 0.02); c.restore(); }
    });
    c.globalAlpha = 1;
  }

  function pilula(c, x, y, txt, tam, cor, alinhar) {
    c.font = '700 ' + Math.round(tam) + 'px ' + FONTE + ',' + EMOJI; c.textBaseline = 'middle'; c.textAlign = 'left';
    var lw = c.measureText(txt).width + tam * 0.9, hh = tam * 1.5, x0 = alinhar === 'dir' ? x - lw : alinhar === 'meio' ? x - lw / 2 : x;
    c.fillStyle = 'rgba(26,20,70,.72)'; c.beginPath(); c.moveTo(x0 + hh / 2, y); c.lineTo(x0 + lw - hh / 2, y); c.arc(x0 + lw - hh / 2, y + hh / 2, hh / 2, -Math.PI / 2, Math.PI / 2); c.lineTo(x0 + hh / 2, y + hh); c.arc(x0 + hh / 2, y + hh / 2, hh / 2, Math.PI / 2, Math.PI * 1.5); c.fill();
    c.fillStyle = cor || '#fff'; c.fillText(txt, x0 + tam * 0.45, y + hh / 2 + tam * 0.04);
    return lw;
  }

  // ---------- placar de fliperama (1.11.0) ----------
  // velocímetro de ponteiro: arco colorido, ponteiro e o número no meio
  function velocimetro(c, x, y, r, pct, turbo, u) {
    var a0 = Math.PI * 0.85, a1 = Math.PI * 2.15, p = Math.max(0, Math.min(1.25, pct)) / 1.25, aP = a0 + (a1 - a0) * p;
    c.save();
    c.fillStyle = 'rgba(26,20,70,.72)'; c.beginPath(); c.arc(x, y, r * 1.12, Math.PI * 0.8, Math.PI * 2.2); c.closePath(); c.fill();
    c.lineCap = 'round'; c.lineWidth = r * 0.16; c.strokeStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(x, y, r * 0.9, a0, a1); c.stroke();
    var gr = c.createLinearGradient(x - r, y, x + r, y); gr.addColorStop(0, '#c6ff3d'); gr.addColorStop(0.6, '#ffd166'); gr.addColorStop(1, turbo ? '#3ee8ff' : '#ff4d6d');
    c.strokeStyle = gr; c.beginPath(); c.arc(x, y, r * 0.9, a0, aP); c.stroke();
    c.strokeStyle = '#ffffff'; c.lineWidth = r * 0.07; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(aP) * r * 0.78, y + Math.sin(aP) * r * 0.78); c.stroke();
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, r * 0.1, 0, Math.PI * 2); c.fill();
    c.font = '700 ' + Math.round(r * 0.48) + 'px ' + FONTE; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = turbo ? '#3ee8ff' : '#ffffff';
    c.fillText(String(Math.round(pct * 120)), x, y - r * 0.38);
    c.font = '700 ' + Math.round(r * 0.22) + 'px ' + FONTE; c.fillText('km/h', x, y + r * 0.02);
    c.restore();
  }
  // rostinhos de quem corre (personagem, bichinho ou selfie), guardados prontos
  var retratos = {};
  function retrato(info) {
    var k = info.personagem ? 'p' + info.personagem.id : info.foto ? 'f' + (info.foto._vr || 0) : 'e' + info.emoji;
    if (retratos[k]) return retratos[k];
    var cv = document.createElement('canvas'); cv.width = cv.height = 72; var c = cv.getContext('2d');
    c.fillStyle = info.cor || '#3a2f73'; c.beginPath(); c.arc(36, 36, 34, 0, Math.PI * 2); c.fill();
    c.save(); c.beginPath(); c.arc(36, 36, 31, 0, Math.PI * 2); c.clip(); c.fillStyle = '#efe9ff'; c.fillRect(0, 0, 72, 72);
    if (info.personagem) info.personagem.frente(c, 36, 40, 24);
    else if (info.foto && info.foto.img && info.foto.img.complete) c.drawImage(info.foto.img, 5, 5, 62, 62);
    else { c.font = '44px ' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(info.emoji || '🐱', 36, 39); }
    c.restore();
    retratos[k] = cv; return cv;
  }
  // a lista de posições, como no fliperama: rostinho de cada um, na ordem da corrida, com o número
  function listaPosicoes(c, e, ji, op, x, y, u, yMax) {
    var todos = e.jogadores.map(function (o) { return { z: o.z, fim: o.chegou ? o.tempo : Infinity, info: INFO[o.n], eu: o.n === ji, outro: o.n !== ji }; })
      .concat(e.rivais.map(function (r, k) { return { z: r.z, fim: r.chegou ? r.tempo : Infinity, info: RIV[k] && RIV[k].info }; }));
    todos.sort(function (a, b) { return a.fim !== b.fim ? a.fim - b.fim : b.z - a.z; });
    var tam = Math.min(u * 1.25, (yMax - y) / Math.max(1, todos.length) - u * 0.15);
    if (tam < u * 0.6) return;
    todos.forEach(function (o, k) {
      if (!o.info) return;
      var yy = y + k * (tam + u * 0.15), cx0 = x + tam / 2;
      if (o.eu) { c.fillStyle = 'rgba(255,209,102,.95)'; c.beginPath(); c.arc(cx0, yy + tam / 2, tam * 0.62, 0, Math.PI * 2); c.fill(); }
      c.drawImage(retrato(o.info), x, yy, tam, tam);
      c.font = '700 ' + Math.round(tam * 0.5) + 'px ' + FONTE; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineWidth = tam * 0.14; c.strokeStyle = '#1a1446'; c.strokeText(String(k + 1), x + tam * 0.1, yy + tam * 0.82); c.fillStyle = o.eu ? '#ffd166' : '#ffffff'; c.fillText(String(k + 1), x + tam * 0.1, yy + tam * 0.82);
    });
  }
  // o poder da caixa surpresa: a roleta girando e depois o poder que saiu (com o tempo que falta)
  var ICONE_PODER = { escudo: '🛡️', foguete: '🚀', gosma: '🟢' };
  function slotPoder(c, j, x, y, u) {
    var icone = null, resta = 0;
    if (j.roleta > 0) icone = ['🛡️', '🚀', '🟢'][Math.floor(j.roleta * 14) % 3];
    else if (j.escudo > 0) { icone = '🛡️'; resta = j.escudo / M2().ESCUDO; }
    else if (j.foguete > 0) { icone = '🚀'; resta = j.foguete / M2().FOGUETE; }
    else if (j.poder && j.poderT > 0) { j.poderT -= 1 / 60; icone = ICONE_PODER[j.poder]; }
    if (!icone) return;
    var L = u * 2.1;
    c.save();
    c.fillStyle = 'rgba(26,20,70,.8)'; c.strokeStyle = j.roleta > 0 ? 'hsl(' + ((Date.now() / 3) % 360) + ',90%,65%)' : '#c6ff3d'; c.lineWidth = u * 0.16;
    c.beginPath(); c.arc(x, y + L / 2, L / 2, 0, Math.PI * 2); c.fill(); c.stroke();
    if (resta > 0) { c.strokeStyle = '#ffffff'; c.lineWidth = u * 0.12; c.beginPath(); c.arc(x, y + L / 2, L / 2 + u * 0.22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * resta); c.stroke(); }
    c.font = Math.round(L * 0.55) + 'px ' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(icone, x, y + L / 2 + u * 0.05);
    c.restore();
  }
  // largada: semáforo com 3 luzes (vermelha, amarela, verde) e a frase grande chegando aos pedaços
  function semaforo(c, e, w, h, K, u, topo) {
    var contando = e.fase === 'contagem', vai = !contando && e.t < 1.1;
    if (!contando && !vai) return;
    var n = contando ? Math.ceil(e.contagem) : 0, acesas = contando ? 4 - n : 3, tt = Date.now() / 1000;
    var L = Math.min(u * 2.3, w * 0.09), bx = w / 2 - L * 1.75, by = topo + u * 2.6;
    c.save();
    c.fillStyle = '#1b1830'; c.strokeStyle = '#3a3360'; c.lineWidth = u * 0.15;
    c.beginPath(); if (c.roundRect) c.roundRect(bx, by, L * 3.5, L * 1.25, L * 0.3); else c.rect(bx, by, L * 3.5, L * 1.25); c.fill(); c.stroke();
    ['#ff3b3b', '#ffd166', '#3dff6e'].forEach(function (cor, k) {
      var x = bx + L * (0.62 + k * 1.13), y = by + L * 0.62, ligada = vai ? k === 2 || Math.sin(tt * 20) > 0 : k < acesas;
      if (vai) ligada = true;
      c.fillStyle = ligada ? (vai ? '#3dff6e' : cor) : '#2a2540'; c.beginPath(); c.arc(x, y, L * 0.45, 0, Math.PI * 2); c.fill();
      if (ligada) { c.globalCompositeOperation = 'lighter'; luz(c, x, y, L * 1.1, vai ? '#3dff6e' : cor, 0.7); c.globalCompositeOperation = 'source-over'; }
    });
    // a frase: chega uma parte a cada segundo, crescendo; no VAI! some e entra o VAI! enorme
    var partes = [t('PRONTO', 'READY', '¿LISTOS'), t('PRA SENTIR', 'TO FEEL', 'PARA SENTIR'), t('A VELOCIDADE?', 'THE SPEED?', 'LA VELOCIDAD?')], qtas = contando ? 4 - n : 3;
    var txt = vai ? t('VAI!', 'GO!', '¡YA!') : partes.slice(0, qtas).join(' '), fr = contando ? 1 - (e.contagem % 1 || 1) : e.t / 1.1;
    var tam = vai ? K * (0.42 + 0.25 * (1 - fr)) : Math.min(K * 0.2, w * 0.95 / Math.max(6, txt.length * 0.62));
    if (!vai && fr < 0.2) tam *= 1 + (0.2 - fr) * 2;
    c.font = 'italic 700 ' + Math.round(tam) + 'px ' + FONTE; c.textAlign = 'center'; c.textBaseline = 'middle';
    var ty = h * (vai ? 0.42 : 0.47);
    c.lineJoin = 'round'; c.lineWidth = tam * 0.22; c.strokeStyle = '#7b2cbf'; c.strokeText(txt, w / 2, ty);
    c.lineWidth = tam * 0.1; c.strokeStyle = '#2bf4ff'; c.strokeText(txt, w / 2, ty);
    c.fillStyle = vai ? '#3dff6e' : '#d8ff3d'; c.fillText(txt, w / 2, ty);
    c.restore();
  }

  /* mapinha redondo (1.18.0, vídeo do dono): o desenho da pista visto de cima, calculado uma vez das curvas
     (cada curva vira um pouco o rumo), com os rios em azul, a largada e a chegada; por cima, as bolinhas de quem corre */
  var MAPA_PASSO = 6;
  function mapaDaPista(pista) {
    if (pista.mapa) return pista.mapa;
    var ang = 0, x = 0, y = 0, pts = [], minX = 0, maxX = 0, minY = 0, maxY = 0;
    for (var i = 0; i <= pista.chegada; i++) {
      var sg = pista.segs[i]; if (!sg.loop) { ang += sg.curva * 0.0042; x += Math.sin(ang); y -= Math.cos(ang); }
      if (i % MAPA_PASSO === 0) { pts.push([x, y, !!sg.agua]); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    }
    var cxm = (minX + maxX) / 2, cym = (minY + maxY) / 2, esc = 1 / Math.max(1, Math.max(maxX - minX, maxY - minY) / 2);
    pista.mapa = pts.map(function (p) { return [(p[0] - cxm) * esc, (p[1] - cym) * esc, p[2]]; });
    return pista.mapa;
  }
  function miniMapa(c, e, ji, op, x, y, r, u) {
    var m = mapaDaPista(e.pista), R = r * 0.78, pt = function (z) { var k = Math.max(0, Math.min(m.length - 1, Math.round(z / SEG / MAPA_PASSO))); return [x + m[k][0] * R, y + m[k][1] * R]; };
    c.save();
    c.fillStyle = 'rgba(26,20,70,.55)'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.lineWidth = Math.max(1.5, u * 0.08); c.strokeStyle = 'rgba(255,255,255,.7)'; c.stroke();
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.lineWidth = Math.max(3, u * 0.32); c.strokeStyle = 'rgba(255,255,255,.9)'; c.beginPath();
    m.forEach(function (p, k) { if (k) c.lineTo(x + p[0] * R, y + p[1] * R); else c.moveTo(x + p[0] * R, y + p[1] * R); }); c.stroke();
    c.lineWidth = Math.max(2, u * 0.18); c.strokeStyle = '#4cc9f0';
    for (var k = 1; k < m.length; k++) if (m[k][2]) { c.beginPath(); c.moveTo(x + m[k - 1][0] * R, y + m[k - 1][1] * R); c.lineTo(x + m[k][0] * R, y + m[k][1] * R); c.stroke(); }
    var fim = m[m.length - 1]; c.font = Math.round(u * 0.7) + 'px ' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🏁', x + fim[0] * R, y + fim[1] * R - u * 0.2);
    (e.rivais || []).forEach(function (rv) { var p = pt(rv.z); c.beginPath(); c.arc(p[0], p[1], Math.max(2, u * 0.2), 0, Math.PI * 2); c.fillStyle = rv.cor || '#fff'; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(0,0,0,.6)'; c.stroke(); });
    e.jogadores.forEach(function (o) { if (o.n === ji) return; var p = pt(o.z); c.beginPath(); c.arc(p[0], p[1], Math.max(3, u * 0.3), 0, Math.PI * 2); c.fillStyle = op.jogadores[o.n].cor; c.fill(); c.lineWidth = 2; c.strokeStyle = '#fff'; c.stroke(); });
    var eu = pt(e.jogadores[ji].z), pis = 1 + 0.15 * Math.sin(Date.now() / 150);
    c.beginPath(); c.arc(eu[0], eu[1], Math.max(4, u * 0.4) * pis, 0, Math.PI * 2); c.fillStyle = op.jogadores[ji].cor; c.fill(); c.lineWidth = Math.max(2, u * 0.12); c.strokeStyle = '#fff'; c.stroke();
    c.restore();
  }
  function desenharPlacar(c, e, j, ji, w, h, K, op, v) {
    var u = tamU(v), pista = e.pista, piloto = op.jogadores[ji].piloto, ml = margemLocal(v, op.W, op.H, op.margem);
    var topo = u * 0.5 + ml.t;
    // barra do caminho até a chegada, com os carrinhos
    var fimPilula = u * 0.5 + ml.l + pilula(c, u * 0.5 + ml.l, topo, (e.jogadores.length === 2 ? piloto + ' ' : '') + '⭐ ' + j.estrelas + '  ' + milhar(j.pontos || 0) + ' pts', u * 1.0, '#ffd93d');
    var reserva = v.y <= 0 && v.x + v.w >= op.W - 1 ? Math.max(u * 2.6, (op.botoes || 0) + u * 0.6) : 0;   // na vista do canto de cima à direita ficam os botões
    var bx = Math.max(w * 0.3, fimPilula + u * 1.2), bw = Math.min(w * 0.4, w - ml.r - bx - u * 1.6 - reserva), by = topo + u * 0.55, bh = u * 0.45;
    c.fillStyle = 'rgba(26,20,70,.6)'; c.fillRect(bx, by, bw, bh);
    for (var mm = 0; mm < 4; mm++) { c.fillStyle = TEMAS[pista.mundos[mm]].cor; c.fillRect(bx + bw * mm / 4, by, bw / 4 - 1, bh); }
    c.font = Math.round(u * 0.9) + 'px ' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🏁', bx + bw + u * 0.6, by + bh / 2);
    e.jogadores.forEach(function (o) {
      var p = Math.min(1, o.z / pista.zChegada), px = bx + bw * p;
      c.beginPath(); c.arc(px, by + bh / 2, u * 0.55, 0, Math.PI * 2); c.fillStyle = op.jogadores[o.n].cor; c.fill(); c.lineWidth = o.n === ji ? u * 0.14 : u * 0.06; c.strokeStyle = '#fff'; c.stroke();
      c.font = Math.round(u * 0.62) + 'px ' + EMOJI; c.fillStyle = '#000'; c.fillText(op.jogadores[o.n].piloto, px, by + bh / 2 + u * 0.03);
    });
    (e.rivais || []).forEach(function (rv, k) {   // rivais na barra do caminho
      var pr = Math.min(1, rv.z / pista.zChegada), rx = bx + bw * pr;
      c.beginPath(); c.arc(rx, by + bh / 2, u * 0.28, 0, Math.PI * 2); c.fillStyle = rv.cor || '#fff'; c.fill(); c.lineWidth = u * 0.05; c.strokeStyle = 'rgba(0,0,0,.6)'; c.stroke();
    });
    if (e.total > 1 && j.lugar) pilula(c, u * 0.5 + ml.l, topo + u * 1.9, '🏁 ' + j.lugar + (lingua === 'en' ? ordinalEn(j.lugar) : 'º') + ' / ' + e.total, u * 0.95, j.lugar === 1 ? '#c6ff3d' : '#ffffff');
    velocimetro(c, ml.l + u * 2.1, h - ml.b - u * 0.9, u * 1.45, j.vel / pista.cfg.velMax, j.turbo > 0, u);
    if (e.total > 1 && j.lugar) listaPosicoes(c, e, ji, op, u * 0.5 + ml.l, topo + u * 3.6, u, h - ml.b - u * (op.toque ? 5.4 : 3.2));
    slotPoder(c, j, w / 2, topo + u * 1.5, u);
    var rMapa = u * 2.3; miniMapa(c, e, ji, op, w - ml.r - reserva - rMapa - u * 0.4, topo + u * 2.3 + rMapa, rMapa, u);
    semaforo(c, e, w, h, K, u, topo);
    var vs = VS[ji];
    if (vs.faixa) {
      c.globalAlpha = Math.min(1, vs.faixa.ate * 2);
      pilula(c, w / 2, h * 0.2, vs.faixa.txt, u * 1.3, '#ffffff', 'meio');
      c.globalAlpha = 1;
    }
    if (vs.chegouT >= 0) {
      var tc = K * 0.2 * Math.min(1, vs.chegouT * 3);
      c.font = '700 ' + Math.round(tc) + 'px ' + FONTE + ',' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle';
      var tx = (e.total || 1) < 2 ? t('🏁 Chegou!', '🏁 Finished!', '🏁 ¡Has llegado!') : vs.lugar === 1 ? t('🥇 1º lugar!', '🥇 1st place!', '🥇 ¡Primer puesto!') : vs.lugar === 2 ? t('🥈 2º lugar!', '🥈 2nd place!', '🥈 ¡Segundo puesto!') : vs.lugar === 3 ? t('🥉 3º lugar!', '🥉 3rd place!', '🥉 ¡Tercer puesto!') : t('🏁 Chegou em ', '🏁 Finished ', '🏁 ¡Has llegado ') + vs.lugar + (lingua === 'en' ? ordinalEn(vs.lugar) : 'º') + '!';
      c.lineWidth = tc * 0.1; c.strokeStyle = '#1a1446'; c.strokeText(tx, w / 2, h * 0.32); c.fillStyle = '#ffd166'; c.fillText(tx, w / 2, h * 0.32);
    }
    // setas de toque
    if (op.toque && !j.chegou) {
      // no começo (3-2-1 e primeiros segundos) as setas e o botão de pular acendem, com a explicação
      var guia = e.fase === 'contagem' || (e.fase === 'corrida' && e.t < 4), dois = e.jogadores.length > 1, pis = 0.6 + 0.4 * Math.sin(Date.now() / 180);
      c.globalAlpha = guia ? 0.55 + 0.4 * pis : (dois ? 0.42 : 0.28); c.fillStyle = '#ffffff';
      var ay = h - ml.b - u * 3.4, as = u * 1.3, xl = ml.l + u * 1.2, xr = w - ml.r - u * 1.2;
      poligono(c, xl, ay, xl + as, ay - as, xl + as, ay + as, xl, ay, '#fff');
      poligono(c, xr, ay, xr - as, ay - as, xr - as, ay + as, xr, ay, '#fff');
      c.globalAlpha = 1;
      if (guia) {
        var fs = Math.round(u * 0.62), bpg = botaoPulo(v, ml);
        c.font = '700 ' + fs + 'px ' + FONTE + ',' + EMOJI; c.textBaseline = 'middle'; c.lineWidth = fs * 0.22; c.strokeStyle = '#1a1446'; c.fillStyle = '#ffffff';
        c.textAlign = 'left'; c.strokeText(t('segure: virar', 'hold: steer', 'mantén: girar'), xl, ay - as - fs * 0.7); c.fillText(t('segure: virar', 'hold: steer', 'mantén: girar'), xl, ay - as - fs * 0.7);
        c.textAlign = 'right'; c.strokeText(t('segure: virar', 'hold: steer', 'mantén: girar'), xr, ay - as - fs * 0.7); c.fillText(t('segure: virar', 'hold: steer', 'mantén: girar'), xr, ay - as - fs * 0.7);
        c.textAlign = 'center'; c.strokeText(t('toque: pular', 'tap: jump', 'toca: saltar'), bpg.x - v.x, bpg.y - v.y - bpg.r - fs * 0.8); c.fillText(t('toque: pular', 'tap: jump', 'toca: saltar'), bpg.x - v.x, bpg.y - v.y - bpg.r - fs * 0.8);
        if (dois) {   // de quem é cada metade da tela
          var tj = (op.jogadores && op.jogadores[ji] ? (op.jogadores[ji].piloto || '') + ' ' : '') + t('Jogador ', 'Player ', 'Jugador ') + (ji + 1), fj = Math.round(Math.min(u * 0.95, w / 11));
          c.font = '700 ' + fj + 'px ' + FONTE + ',' + EMOJI; c.lineWidth = fj * 0.22;
          c.strokeText(tj, w / 2, h * 0.6); c.fillStyle = ji ? '#7cf9ff' : '#ffd166'; c.fillText(tj, w / 2, h * 0.6);
          var t2 = t('esta metade da tela é sua', 'this half of the screen is yours', 'esta mitad de la pantalla es tuya'), f2 = Math.round(fj * 0.6);
          c.font = '700 ' + f2 + 'px ' + FONTE; c.lineWidth = f2 * 0.22; c.fillStyle = '#ffffff';
          c.strokeText(t2, w / 2, h * 0.6 + fj * 0.95); c.fillText(t2, w / 2, h * 0.6 + fj * 0.95);
        }
      }
      var bp = botaoPulo(v, ml), bx2 = bp.x - v.x, by2 = bp.y - v.y, pronto = j.recarga <= 0 && j.pulo <= 0;
      c.globalAlpha = pronto ? 0.85 : 0.45;
      c.fillStyle = 'rgba(26,20,70,.55)'; c.beginPath(); c.arc(bx2, by2, bp.r, 0, Math.PI * 2); c.fill();
      c.lineWidth = u * 0.22; c.strokeStyle = 'rgba(255,255,255,.35)'; c.stroke();
      if (!pronto) { c.strokeStyle = '#c6ff3d'; c.beginPath(); c.arc(bx2, by2, bp.r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - j.recarga / raiz.VruuumMotor.RECARGA)); c.stroke(); }
      else { c.strokeStyle = '#c6ff3d'; c.stroke(); }
      c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = '700 ' + Math.round(u * 1.3) + 'px ' + FONTE; c.fillText('⬆', bx2, by2 - u * 0.25);
      c.font = '700 ' + Math.round(u * 0.55) + 'px ' + FONTE; c.fillText(t('PULAR', 'JUMP', 'SALTAR'), bx2, by2 + u * 0.8);
      c.globalAlpha = 1;
    }
  }

  function desenhar(c, W, H, estado, op) {
    porSeg = {}; porSegR = {};
    (estado.rivais || []).forEach(function (r, k) { var i = Math.floor(r.z / SEG); (porSegR[i] || (porSegR[i] = [])).push(k); });
    estado.carros.forEach(function (car) { var i = Math.floor(car.z / SEG); (porSeg[i] || (porSeg[i] = [])).push(car); });
    var vv = op.so != null ? [{ x: 0, y: 0, w: W, h: H }] : vistas(W, H, estado.jogadores.length);   // so: só a vista de um (demonstração)
    c.fillStyle = '#0b0a1f'; c.fillRect(0, 0, W, H);
    op.dist = op.dist || (vv.length > 1 ? 110 : 160); op.W = W; op.H = H;
    vv.forEach(function (v, k) { desenharVista(c, v, estado, op.so != null ? op.so : k, op); });
    return vv;
  }

  // ---------- pódio no fim da corrida (1.11.0) ----------
  /* Estádio com torcida e holofotes, os 3 primeiros nos degraus (o veículo de cada um, com o piloto virando para
     sorrir), confete e fogos, e os pontos subindo. tA: segundos desde que a tela abriu. */
  var podioFx = null;
  function podio(cv, e, tA) {
    var c = cv.getContext('2d'), W = cv.width, H = cv.height, tt = Date.now() / 1000;
    if (!podioFx || tA < 0.05) podioFx = { parts: [], fogo: 0 };
    var todos = e.jogadores.map(function (o) { return { z: o.z, fim: o.chegou ? o.tempo : Infinity, spr: carrosJog[o.n], vv: VEIC[o.n], info: INFO[o.n], eu: true, j: o, sem: o.n * 3.3 }; })
      .concat(e.rivais.map(function (r, k) { var rd = RIV[k]; return rd && { z: r.z, fim: r.chegou ? r.tempo : Infinity, spr: rd.spr, vv: rd.veic, info: rd.info, eu: false, sem: 10 + k * 2.1 }; }).filter(Boolean));
    todos.sort(function (a, b) { return a.fim !== b.fim ? a.fim - b.fim : b.z - a.z; });
    // céu, arquibancadas com a torcida pulando e as bandeirinhas
    var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1d1450'); g.addColorStop(0.55, '#3a2f73'); g.addColorStop(1, '#2a2160');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (var fila = 0; fila < 6; fila++) {
      var y = H * (0.12 + fila * 0.07); c.fillStyle = fila % 2 ? '#2b2257' : '#33296a'; c.fillRect(0, y, W, H * 0.07);
      for (var x = 8 + (fila % 2) * 10; x < W; x += 20) {
        var pula = Math.max(0, Math.sin(tt * 6 + x * 0.05 + fila)) * H * 0.012;
        c.fillStyle = S.ARCO[(x / 20 + fila) % 7 | 0]; c.beginPath(); c.arc(x, y + H * 0.045 - pula, H * 0.016, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#f2c9a0'; c.beginPath(); c.arc(x, y + H * 0.022 - pula, H * 0.011, 0, Math.PI * 2); c.fill();
      }
    }
    for (var b = 0; b < 14; b++) { var bx = W * b / 13; c.fillStyle = S.ARCO[b % 7]; c.beginPath(); c.moveTo(bx - W * 0.03, H * 0.1); c.lineTo(bx + W * 0.03, H * 0.1); c.lineTo(bx, H * 0.15 + Math.sin(tt * 3 + b) * H * 0.006); c.fill(); }
    // holofotes cruzando o estádio
    c.save(); c.globalCompositeOperation = 'lighter';
    [-1, 1].forEach(function (l) {
      var a = Math.sin(tt * 0.9 + l) * 0.35, ox = W / 2 + l * W * 0.55, oy = -H * 0.05, tx = W / 2 + Math.sin(a) * W * 0.6, ty = H * 0.9;
      var gl = c.createLinearGradient(ox, oy, tx, ty); gl.addColorStop(0, 'rgba(255,255,220,.45)'); gl.addColorStop(1, 'rgba(255,255,220,0)');
      c.fillStyle = gl; c.beginPath(); c.moveTo(ox, oy); c.lineTo(tx - W * 0.12, ty); c.lineTo(tx + W * 0.12, ty); c.closePath(); c.fill();
    });
    c.restore();
    // chão e os degraus: 2º à esquerda, 1º no meio (o mais alto), 3º à direita
    c.fillStyle = '#4caf50'; c.fillRect(0, H * 0.78, W, H * 0.22);
    var DEG = [[0.5, 0.26, '#ffd166', 1], [0.25, 0.17, '#d9dee8', 2], [0.75, 0.11, '#e0a06a', 3]], larg = W * 0.24;
    DEG.forEach(function (d) {
      var x0 = W * d[0] - larg / 2, topo = H * (0.84 - d[1]);
      c.fillStyle = d[2]; c.fillRect(x0, topo, larg, H * 0.84 - topo + H * 0.16);
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x0, topo, larg, H * 0.02);
      c.fillStyle = '#1a1446'; c.font = '700 ' + Math.round(H * 0.08) + 'px ' + FONTE; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(d[3]), W * d[0], topo + H * 0.09);
      var o = todos[d[3] - 1]; if (!o || !o.spr) return;
      // o veículo em cima do degrau (pulando de alegria de vez em quando)
      var pulo = Math.max(0, Math.sin(tt * 4 + d[3])) * H * (d[3] === 1 ? 0.03 : 0.012), esc = Math.min(larg * 0.95 / o.spr.w, H * 0.4 / o.spr.h), cw = o.spr.w * esc, ch = o.spr.h * esc;
      var x1 = W * d[0] - cw / 2, y1 = topo - ch - pulo, fr = (tt * 0.8) % 1, onde = null;
      if (o.eu) { c.save(); c.globalCompositeOperation = 'lighter'; luz(c, W * d[0], topo, larg * 0.6, '#ffd166', 0.6); c.restore(); }
      if (o.vv && o.vv.cavalo && CAV()) onde = CAV().vivo(c, x1, y1, cw, ch, o.info.cor, fr, Math.sin(tt * 0.8) * 0.6, o.info.corpo, tt, o.vv.bicho);
      else c.drawImage(S.quadro(o.spr, fr).img, x1, y1, cw, ch);
      pilotoVivo(c, o.vv, x1, y1, cw, ch, o.info, o.sem, 2.5, onde || ondeCabeca(o.vv, x1, y1, cw, ch, fr));
      if (o.eu) { c.font = '700 ' + Math.round(H * 0.05) + 'px ' + FONTE + ',' + EMOJI; c.fillStyle = '#ffd166'; c.fillText(t('VOCÊ', 'YOU', 'TÚ'), W * d[0], y1 - H * 0.03); }
    });
    // quem joga e não ficou entre os 3: aparece embaixo, com o lugar
    todos.forEach(function (o, k) { if (!o.eu || k < 3) return; c.drawImage(retrato(o.info), W * 0.04, H * 0.8, H * 0.16, H * 0.16); c.font = '700 ' + Math.round(H * 0.06) + 'px ' + FONTE; c.fillStyle = '#ffffff'; c.textAlign = 'left'; c.fillText((k + 1) + (lingua === 'en' ? ordinalEn(k + 1) : 'º'), W * 0.04 + H * 0.18, H * 0.88); });
    // título com louros e os pontos subindo
    var eu = todos.findIndex ? todos.findIndex(function (o) { return o.eu; }) : 0, lugar = eu + 1;
    var titulo = todos.length < 2 ? t('🏁 CHEGOU!', '🏁 FINISHED!', '🏁 ¡HAS LLEGADO!') : lugar === 1 ? t('🏆 CAMPEÃO!', '🏆 CHAMPION!', '🏆 ¡CAMPEÓN!') : lugar === 2 ? t('🥈 VICE-CAMPEÃO!', '🥈 RUNNER-UP!', '🥈 ¡SUBCAMPEÓN!') : lugar === 3 ? t('🥉 3º LUGAR!', '🥉 3RD PLACE!', '🥉 ¡TERCER PUESTO!') : t('👏 MUITO BEM!', '👏 WELL DONE!', '👏 ¡MUY BIEN!');
    var ts = H * 0.09 * (1 + Math.max(0, 0.3 - tA) * 2);
    c.font = 'italic 700 ' + Math.round(ts) + 'px ' + FONTE + ',' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.lineWidth = ts * 0.2; c.strokeStyle = '#7b2cbf'; c.strokeText(titulo, W / 2, H * 0.07); c.lineWidth = ts * 0.08; c.strokeStyle = '#2bf4ff'; c.strokeText(titulo, W / 2, H * 0.07);
    c.fillStyle = '#d8ff3d'; c.fillText(titulo, W / 2, H * 0.07);
    var j0 = e.jogadores[0], conta = Math.min(1, tA / 2.2), pts = Math.round((j0.pontos || 0) * conta), est = Math.round(j0.estrelas * conta);
    c.font = '700 ' + Math.round(H * 0.06) + 'px ' + FONTE + ',' + EMOJI; c.fillStyle = 'rgba(26,20,70,.75)';
    var txt = '⭐ ' + est + '   ' + milhar(pts) + ' ' + t('pontos', 'points', 'puntos') + (j0.loopings ? '   🌀 ' + j0.loopings : '');
    var tw = c.measureText(txt).width + H * 0.08; c.fillRect(W * 0.98 - tw, H * 0.86, tw, H * 0.1);
    c.fillStyle = '#ffd166'; c.textAlign = 'right'; c.fillText(txt, W * 0.98 - H * 0.04, H * 0.91);
    // confete caindo e fogos estourando
    var fx = podioFx;
    if (Math.random() < 0.5) fx.parts.push({ x: Math.random() * W, y: -10, vx: (Math.random() - 0.5) * 40, vy: 60 + Math.random() * 60, cor: S.ARCO[Math.floor(Math.random() * 7)], giro: Math.random() * 6, vida: 6, tipo: 'c' });
    fx.fogo -= 1 / 60;
    if (fx.fogo <= 0 && tA < 12) {
      fx.fogo = 0.7 + Math.random() * 0.8; var cx = W * (0.15 + Math.random() * 0.7), cy = H * (0.15 + Math.random() * 0.25), cor = S.ARCO[Math.floor(Math.random() * 7)];
      for (var q = 0; q < 30; q++) { var a = q / 30 * Math.PI * 2, v = 80 + Math.random() * 60; fx.parts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, cor: cor, vida: 1.2, tipo: 'f' }); }
      if (raiz.VruuumSom) raiz.VruuumSom.tocar('fogos');
    }
    c.save();
    fx.parts = fx.parts.filter(function (p) {
      p.vida -= 1 / 60; p.x += p.vx / 60; p.y += p.vy / 60; if (p.tipo === 'f') { p.vy += 60 / 60; c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.max(0, p.vida / 1.2); luz(c, p.x, p.y, H * 0.02, p.cor, 0.9); }
      else { p.giro += 0.15; c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.save(); c.translate(p.x, p.y); c.rotate(p.giro); c.fillStyle = p.cor; c.fillRect(-H * 0.012, -H * 0.006, H * 0.024, H * 0.012); c.restore(); }
      return p.vida > 0 && p.y < H + 20;
    });
    c.restore();
  }

  // prévia da garagem: o veículo grande, animado (hélice, rotor, fogo), na estrada ou no céu
  var cachePrevia = {};
  function spritePrevia(cor, veic, corpo) {
    var k = cor + '|' + veic + '|' + (corpo || '');
    if (!cachePrevia[k]) cachePrevia[k] = S.carroJogador(cor, null, veic, 360, corpo);
    return cachePrevia[k];
  }
  function previa(cv, cor, piloto, veic, foto, pers, corpo) {
    var c = cv.getContext('2d'), W = cv.width, H = cv.height, vv = V() ? V().achar(veic) : null, voa = !!(V() && V().voa(veic)), tt = Date.now() / 1000;
    var spr = spritePrevia(cor, veic, corpo);
    var g = c.createLinearGradient(0, 0, 0, H), neon = ESTILO !== 'colorido';
    if (neon) { g.addColorStop(0, '#05030f'); g.addColorStop(1, voa ? '#1d1450' : '#160f35'); }
    else if (voa) { g.addColorStop(0, '#38b6ff'); g.addColorStop(1, '#c9f0ff'); } else { g.addColorStop(0, '#2a2160'); g.addColorStop(1, '#3a2f73'); }
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    if (neon) {   // garagem à noite: estrelas, estrada escura com bordas de neon e luz por baixo do veículo
      base = base || S.basicos();
      c.globalAlpha = 0.8; c.drawImage(base.estrelasCeu, 0, 0, W, H * 0.6); c.globalAlpha = 1;
      if (!voa) {
        c.fillStyle = '#121320'; c.beginPath(); c.moveTo(W * 0.4, H * 0.32); c.lineTo(W * 0.6, H * 0.32); c.lineTo(W * 1.05, H); c.lineTo(-W * 0.05, H); c.fill();
        c.save(); c.globalCompositeOperation = 'lighter'; c.lineWidth = 3;
        c.strokeStyle = 'rgba(43,244,255,.9)'; c.beginPath(); c.moveTo(W * 0.4, H * 0.32); c.lineTo(-W * 0.05, H); c.stroke();
        c.strokeStyle = 'rgba(255,43,214,.9)'; c.beginPath(); c.moveTo(W * 0.6, H * 0.32); c.lineTo(W * 1.05, H); c.stroke();
        for (var q = 0; q < 5; q++) { var pq = ((tt * 1.5 + q / 5) % 1), yq = H * 0.32 + (H * 0.68) * pq * pq; c.fillStyle = 'rgba(43,244,255,.8)'; c.fillRect(W / 2 - 1.5 - pq * 4, yq, 3 + pq * 8, 4 + pq * 14); }
        c.translate(W / 2, H * 0.94); c.scale(1, 0.2); luz(c, 0, 0, W * 0.35, cor, 0.7);
        c.restore();
      }
    } else if (voa) {
      base = base || S.basicos();
      var nx = ((tt * 40) % (W * 1.6)) - W * 0.3;
      c.drawImage(base.nuvemFofa.img, W - nx, H * 0.08, W * 0.5, W * 0.23); c.drawImage(base.nuvemFofa.img, W * 1.5 - nx * 0.6, H * 0.45, W * 0.4, W * 0.19);
    }
    if (!neon && !voa) {
      c.fillStyle = '#6e737b'; c.beginPath(); c.moveTo(W * 0.4, H * 0.32); c.lineTo(W * 0.6, H * 0.32); c.lineTo(W * 1.05, H); c.lineTo(-W * 0.05, H); c.fill();
      c.fillStyle = '#ffffff'; for (var k = 0; k < 5; k++) { var p = ((tt * 1.5 + k / 5) % 1), y = H * 0.32 + (H * 0.68) * p * p; c.fillRect(W / 2 - 1.5 - p * 4, y, 3 + p * 8, 4 + p * 14); }
    }
    var esc = Math.min(W * 0.78 / spr.w, H * 0.8 / spr.h), cw = spr.w * esc, ch = spr.h * esc;
    c.save(); c.translate(W / 2, H * 0.94 + (voa ? Math.sin(tt * 2.2) * H * 0.02 - H * 0.06 : Math.sin(tt * 9) * 1.2));
    if (voa) c.rotate(Math.sin(tt * 0.9) * 0.08);
    var cav = vv && vv.cavalo && CAV(), faseP = tt * (cav ? 1.7 : 0.8), ladoP = vv && (vv.bracos || vv.cavalo) ? Math.sin(tt * 0.9) * 0.9 : 0, onde = null;
    if (vv && vv.modelo) ladoP = 0;   // o 3D gira sozinho (o canvas não inclina)   // na garagem o skatista e o cavalo fazem curvas para os dois lados
    if (ladoP) c.rotate(ladoP * (cav ? 0.04 : 0.12));
    bracos(c, vv, -cw / 2, -ch, cw, ch, cor, faseP, ladoP, 'longe');
    if (cav) onde = CAV().vivo(c, -cw / 2, -ch, cw, ch, cor, faseP % 1, ladoP, corpo, tt, vv.bicho);
    else if (vv && vv.dracula) morcegoDracula(c, cachePrevia, Math.sin(tt * 1.6) > 0.3, cw, ch, tt, function (id) { var v2 = Object.create(vv); v2.modelo = id; modeloVivo(c, v2, -cw / 2, -ch, cw, ch, infoPiloto(cor, piloto, foto, pers), faseP % 1, Math.sin(tt * 0.7) * 1.4, Math.sin(tt * 0.5) * 0.25, 1.2, 4.5, 0); });   // na garagem ele vira e desvira
    else if (vv && vv.modelo && MOD()) modeloVivo(c, vv, -cw / 2, -ch, cw, ch, infoPiloto(cor, piloto, foto, pers), faseP % 1, Math.sin(tt * 0.7) * 1.4, Math.sin(tt * 0.5) * 0.25, 1.2, 4.5, vv.galinha && Math.sin(tt * 1.3) > 0.7 ? 1 : 0);   // na garagem gira bem para mostrar os lados e o teto
    else c.drawImage(S.quadro(spr, faseP).img, -cw / 2, -ch, cw, ch);
    bracos(c, vv, -cw / 2, -ch, cw, ch, cor, faseP, ladoP, 'perto');
    if (!(vv && (vv.modelo || vv.semPiloto))) pilotoVivo(c, vv, -cw / 2, -ch, cw, ch, infoPiloto(cor, piloto, foto, pers), 1.2, 4.5, onde);   // na garagem vira mais vezes
    c.restore();
  }
  // miniatura parada (cartões da garagem)
  function miniatura(cv, cor, piloto, veic, foto, pers, corpo) {
    var c = cv.getContext('2d'), spr = spritePrevia(cor, veic, corpo), W = cv.width, H = cv.height;
    c.clearRect(0, 0, W, H);
    var esc = Math.min(W * 0.9 / spr.w, H * 0.9 / spr.h), cw = spr.w * esc, ch = spr.h * esc;
    var vvM = V() ? V().achar(veic) : null;
    bracos(c, vvM, (W - cw) / 2, H * 0.95 - ch, cw, ch, cor, 0.3, 0, 'longe');
    c.drawImage(S.quadro(spr, 0.3).img, (W - cw) / 2, H * 0.95 - ch, cw, ch);   // o skate aparece empurrando
    bracos(c, vvM, (W - cw) / 2, H * 0.95 - ch, cw, ch, cor, 0.3, 0, 'perto');
    if (Cab()) Cab().desenhar(c, V().achar(veic), (W - cw) / 2, H * 0.95 - ch, cw, ch, infoPiloto(cor, piloto, foto, pers), 50, 0, 1000);   // parado, de costas
  }

  function definirEstilo(v) { ESTILO = v === 'colorido' || v === 'neon' ? v : 'misto'; cachePal = []; }
  raiz.VruuumDesenho = { podio: podio, definirEstilo: definirEstilo, preparar: preparar, desenhar: desenhar, passo: passo, evento: evento, vistas: vistas, margemLocal: margemLocal, botaoPulo: botaoPulo, previa: previa, miniatura: miniatura, milhar: milhar, ALT_VOO: ALT_VOO, TEMAS: TEMAS, CORES: CORES, PILOTOS: PILOTOS };
})(this);
