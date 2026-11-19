/* TIJOLAÇO — desenho em canvas, estilo "canteiro de obra ensolarado, fim de tarde".
   O cenário fixo (terra batida, tapume, andaimes, cones, fita zebrada, areia, paletes, a canaleta, as manilhas e o trilho do
   andaime) é pintado UMA vez num canvas fora da tela (preparar) e copiado a cada quadro; por cima vão só as coisas que
   mexem (tijolos, rolo, tiros, lançador, caçamba, portões, capacete, partículas e textos).
   Tijolos: três figurinhas prontas por cor (sombra, material com símbolo que gira, brilho fixo do sol).
   Sol baixo vindo da esquerda, em cima: sombras longas para a direita e para baixo.
   TijolacoArte.preparar(E, lay) · quadro(ctx, E, lay, tm, extra) · capa(ctx, lay) · tijoloDOM(c, px) */
(function (raiz) {
  'use strict';
  var RG = raiz.TijolacoRegras, R = RG.R, CORES = RG.CORES;
  var SOMBRA = { x: 0.82, y: 0.57 };   // direção da sombra (sol na esquerda, em cima)
  var cache = { k: 0, tex: [], giros: [], brilho: null, sombra: null, poder: {}, ouro: null, chao: null, cacamba: {} };
  var fundo = null, fundoChave = '', bocas = [], galhos = [], dpr = 1;

  function novoCanvas(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
  function sorteio(semente) { var s = semente % 2147483647 || 1; return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  function clarear(hex, f) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function m(v) { return Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)))); }
    return 'rgb(' + m(r) + ',' + m(g) + ',' + m(b) + ')';
  }
  function rr(g, x, y, w, h, r) {   // retângulo arredondado
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  /* ---------- figurinhas dos tijolos ---------- */
  // material + símbolo gravado (gira com o tijolo). r = raio em pixels
  function texturaMaterial(c, r) {
    var S = Math.ceil(r * 2 + 2), cv = novoCanvas(S, S), g = cv.getContext('2d'), m = S / 2, cor = CORES[c].cor, id = CORES[c].id;
    g.translate(m, m);
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fillStyle = cor; g.fill(); g.clip();
    var rnd = sorteio(17 + c * 31), i, j;
    g.lineCap = 'round'; g.lineJoin = 'round';
    function salpicar(n, claro, escuro, tam) {
      for (i = 0; i < n; i++) { g.fillStyle = rnd() < 0.5 ? claro : escuro; g.beginPath(); g.arc((rnd() * 2 - 1) * r, (rnd() * 2 - 1) * r, r * tam * (0.4 + rnd()), 0, 7); g.fill(); }
    }
    if (id === 'tijolo') {
      salpicar(26, 'rgba(255,190,150,.25)', 'rgba(90,20,10,.25)', 0.05);
      g.strokeStyle = 'rgba(246,222,196,.9)'; g.lineWidth = r * 0.11;
      for (j = -1; j <= 1; j++) { g.beginPath(); g.moveTo(-r, j * r * 0.52); g.lineTo(r, j * r * 0.52); g.stroke(); }
      for (j = -2; j <= 1; j++) {
        var y0 = j * r * 0.52, y1 = y0 + r * 0.52, off = (j % 2 === 0) ? 0 : r * 0.5;
        for (i = -2; i <= 2; i++) { var x = i * r + off; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); }
      }
    } else if (id === 'azulejo') {
      g.strokeStyle = 'rgba(235,245,255,.95)'; g.lineWidth = r * 0.1;
      g.beginPath(); g.moveTo(-r, 0); g.lineTo(r, 0); g.moveTo(0, -r); g.lineTo(0, r); g.stroke();
      // flor de azulejo português em cada quarto + losango no centro
      g.fillStyle = 'rgba(240,248,255,.92)';
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) {
        var cx = q[0] * r * 0.5, cy = q[1] * r * 0.5;
        for (var p = 0; p < 4; p++) { g.beginPath(); g.ellipse(cx + Math.cos(p * Math.PI / 2) * r * 0.15, cy + Math.sin(p * Math.PI / 2) * r * 0.15, r * 0.11, r * 0.06, p * Math.PI / 2, 0, 7); g.fill(); }
        g.fillStyle = '#1b4f99'; g.beginPath(); g.arc(cx, cy, r * 0.06, 0, 7); g.fill(); g.fillStyle = 'rgba(240,248,255,.92)';
      });
      g.beginPath(); g.moveTo(0, -r * 0.24); g.lineTo(r * 0.24, 0); g.lineTo(0, r * 0.24); g.lineTo(-r * 0.24, 0); g.closePath(); g.fill();
      g.fillStyle = '#1b4f99'; g.beginPath(); g.arc(0, 0, r * 0.09, 0, 7); g.fill();
    } else if (id === 'tinta') {
      // escorridos de tinta + gota grande no centro
      g.fillStyle = 'rgba(255,255,255,.18)';
      for (i = 0; i < 5; i++) { var xx = (i - 2) * r * 0.42; g.beginPath(); g.moveTo(xx - r * 0.12, -r); g.lineTo(xx - r * 0.12, -r * (0.25 + rnd() * 0.4)); g.arc(xx, -r * (0.25 + rnd() * 0.1), r * 0.12, Math.PI, 0, true); g.lineTo(xx + r * 0.12, -r); g.fill(); }
      g.fillStyle = 'rgba(232,255,226,.95)';
      g.beginPath(); g.moveTo(0, -r * 0.55); g.bezierCurveTo(r * 0.12, -r * 0.3, r * 0.4, -r * 0.02, r * 0.4, r * 0.18);
      g.arc(0, r * 0.18, r * 0.4, 0, Math.PI); g.bezierCurveTo(-r * 0.4, -r * 0.02, -r * 0.12, -r * 0.3, 0, -r * 0.55); g.fill();
      g.fillStyle = '#2a7f37'; g.beginPath(); g.arc(-r * 0.1, r * 0.22, r * 0.12, 0, 7); g.fill();
    } else if (id === 'telha') {
      // telhas colonial: fileiras de "ondas"
      g.strokeStyle = 'rgba(150,70,0,.75)'; g.lineWidth = r * 0.1;
      for (j = -2; j <= 2; j++) {
        g.beginPath();
        for (i = -3; i <= 3; i++) { var cx2 = i * r * 0.5 + (j % 2 ? r * 0.25 : 0), cy2 = j * r * 0.42; g.moveTo(cx2 - r * 0.25, cy2); g.arc(cx2, cy2, r * 0.25, Math.PI, 0, true); }
        g.stroke();
      }
      g.fillStyle = 'rgba(255,236,190,.35)';
      for (j = -2; j <= 2; j++) for (i = -3; i <= 3; i++) { g.beginPath(); g.arc(i * r * 0.5 + (j % 2 ? r * 0.25 : 0) - r * 0.08, j * r * 0.42 + r * 0.1, r * 0.06, 0, 7); g.fill(); }
    } else if (id === 'madeira') {
      // veio da madeira em arcos e um nó
      g.strokeStyle = 'rgba(60,32,10,.55)'; g.lineWidth = r * 0.07;
      for (i = 0; i < 7; i++) { g.beginPath(); g.ellipse(r * 0.25, r * 0.15, r * (0.22 + i * 0.22), r * (0.12 + i * 0.13), 0.35, 0, 7); g.stroke(); }
      g.strokeStyle = 'rgba(214,160,100,.45)'; g.lineWidth = r * 0.05;
      for (i = 0; i < 6; i++) { g.beginPath(); g.ellipse(r * 0.25, r * 0.15, r * (0.33 + i * 0.22), r * (0.18 + i * 0.13), 0.35, 0, 7); g.stroke(); }
      g.fillStyle = '#4a2708'; g.beginPath(); g.ellipse(r * 0.25, r * 0.15, r * 0.14, r * 0.09, 0.35, 0, 7); g.fill();
    } else {   // pedra: grão salpicado e um seixo no centro
      salpicar(70, 'rgba(255,255,255,.35)', 'rgba(40,46,52,.35)', 0.045);
      g.fillStyle = '#c9cfd4'; g.strokeStyle = 'rgba(50,56,62,.75)'; g.lineWidth = r * 0.08;
      g.beginPath();
      for (i = 0; i < 9; i++) { var an = i / 9 * Math.PI * 2, rd = r * (0.32 + (i % 3) * 0.04); g[i ? 'lineTo' : 'moveTo'](Math.cos(an) * rd, Math.sin(an) * rd * 0.85); }
      g.closePath(); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(-r * 0.1, -r * 0.1, r * 0.07, 0, 7); g.fill();
    }
    return cv;
  }
  // brilho do sol: fixo, por cima do material (não gira)
  function brilho(r) {
    var S = Math.ceil(r * 2 + 2), cv = novoCanvas(S, S), g = cv.getContext('2d'), m = S / 2;
    g.translate(m, m);
    var gr = g.createRadialGradient(-r * 0.1, -r * 0.1, r * 0.35, 0, 0, r);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.75, 'rgba(30,10,0,.18)'); gr.addColorStop(1, 'rgba(25,8,0,.55)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
    var h = g.createRadialGradient(-r * 0.38, -r * 0.42, 0, -r * 0.38, -r * 0.42, r * 0.62);
    h.addColorStop(0, 'rgba(255,255,255,.75)'); h.addColorStop(0.35, 'rgba(255,250,235,.28)'); h.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = h; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(-r * 0.4, -r * 0.46, r * 0.16, r * 0.1, -0.7, 0, 7); g.fill();
    g.strokeStyle = 'rgba(40,16,4,.55)'; g.lineWidth = Math.max(1, r * 0.06); g.beginPath(); g.arc(0, 0, r - g.lineWidth / 2, 0, 7); g.stroke();
    return cv;
  }
  function sombraTijolo(r) {
    var S = Math.ceil(r * 3.2), cv = novoCanvas(S, S), g = cv.getContext('2d'), m = S / 2;
    var gr = g.createRadialGradient(m, m, r * 0.2, m, m, r * 1.35);
    gr.addColorStop(0, 'rgba(45,18,4,.45)'); gr.addColorStop(1, 'rgba(45,18,4,0)');
    g.fillStyle = gr; g.beginPath(); g.ellipse(m, m, r * 1.45, r * 1.05, 0.55, 0, 7); g.fill();
    return cv;
  }
  function iconePoder(nome, r) {
    var S = Math.ceil(r * 2 + 2), cv = novoCanvas(S, S), g = cv.getContext('2d'), m = S / 2, u = r / 16;
    g.translate(m, m);
    g.fillStyle = 'rgba(20,14,8,.78)'; g.beginPath(); g.arc(0, 0, r * 0.62, 0, 7); g.fill();
    g.strokeStyle = '#ffd23f'; g.lineWidth = 1.6 * u; g.stroke();
    g.fillStyle = '#ffd23f'; g.strokeStyle = '#ffd23f'; g.lineCap = 'round'; g.lineJoin = 'round';
    if (nome === 'marreta') {
      g.save(); g.rotate(-0.6);
      g.fillStyle = '#c98b4a'; g.fillRect(-1.2 * u, -2 * u, 2.4 * u, 9 * u);
      g.fillStyle = '#e6e9ec'; rr(g, -5.5 * u, -6 * u, 11 * u, 5 * u, 1.2 * u); g.fill();
      g.restore();
    } else if (nome === 're') {
      g.lineWidth = 2.2 * u; g.beginPath(); g.arc(0, 0.5 * u, 5 * u, -Math.PI * 0.15, Math.PI * 1.25); g.stroke();
      g.beginPath(); g.moveTo(-6.8 * u, -2.6 * u); g.lineTo(-3.6 * u, -4.8 * u); g.lineTo(-2.4 * u, -0.8 * u); g.closePath(); g.fill();
    } else if (nome === 'devagar') {
      g.fillStyle = '#2b2b2b'; rr(g, -3.6 * u, -7 * u, 7.2 * u, 14 * u, 2 * u); g.fill();
      g.fillStyle = '#ff3b30'; g.beginPath(); g.arc(0, -3.6 * u, 2.3 * u, 0, 7); g.fill();
      g.fillStyle = '#5a4a1a'; g.beginPath(); g.arc(0, 0.2 * u, 2 * u, 0, 7); g.fill(); g.beginPath(); g.arc(0, 3.9 * u, 2 * u, 0, 7); g.fill();
    } else {   // prumo
      g.lineWidth = 1.2 * u; g.strokeStyle = '#fff'; g.beginPath(); g.moveTo(0, -7.5 * u); g.lineTo(0, -2.5 * u); g.stroke();
      g.beginPath(); g.moveTo(0, 7 * u); g.lineTo(-3.6 * u, -0.5 * u); g.arc(0, -0.8 * u, 3.6 * u, Math.PI, 0); g.closePath(); g.fill();
    }
    return cv;
  }
  function ouroSprite(r) {
    var S = Math.ceil(r * 2 + 2), cv = novoCanvas(S, S), g = cv.getContext('2d'), m = S / 2;
    g.translate(m, m);
    var gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
    gr.addColorStop(0, '#fff6c4'); gr.addColorStop(0.35, '#ffd23f'); gr.addColorStop(0.8, '#d18a00'); gr.addColorStop(1, '#7a4a00');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,248,210,.85)'; g.lineWidth = r * 0.1;
    for (var j = -1; j <= 1; j++) { g.beginPath(); g.moveTo(-r * 0.8, j * r * 0.5); g.lineTo(r * 0.8, j * r * 0.5); g.stroke(); }
    return cv;
  }
  function figurinhas(k) {
    if (cache.k === k) return;
    var r = R * k;
    cache.k = k; cache.tex = CORES.map(function (c, i) { return texturaMaterial(i, r); }); cache.giros = []; cache.cacamba = {};
    cache.brilho = brilho(r); cache.sombra = sombraTijolo(r); cache.ouro = ouroSprite(r);
    cache.poder = {}; RG.PODERES.forEach(function (p) { cache.poder[p] = iconePoder(p, r); });
  }

  /* ---------- chão de terra batida (azulejo de textura, feito uma vez) ---------- */
  function chao() {
    if (cache.chao) return cache.chao;
    var S = 256, cv = novoCanvas(S, S), g = cv.getContext('2d'), rnd = sorteio(4242), i;
    g.fillStyle = '#c4905e'; g.fillRect(0, 0, S, S);
    for (i = 0; i < 1600; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(255,226,180,' + (0.05 + rnd() * 0.12) + ')' : 'rgba(92,52,24,' + (0.05 + rnd() * 0.12) + ')'; g.fillRect(rnd() * S, rnd() * S, 1 + rnd() * 2, 1 + rnd() * 2); }
    for (i = 0; i < 40; i++) {   // manchas
      var x = rnd() * S, y = rnd() * S, rd = 8 + rnd() * 26, gr = g.createRadialGradient(x, y, 0, x, y, rd);
      gr.addColorStop(0, rnd() < 0.5 ? 'rgba(120,70,34,.12)' : 'rgba(240,200,150,.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - rd, y - rd, rd * 2, rd * 2);
    }
    for (i = 0; i < 26; i++) {   // pedrinhas com sombra
      var px = rnd() * S, py = rnd() * S, pr = 1.2 + rnd() * 2.6;
      g.fillStyle = 'rgba(70,38,16,.35)'; g.beginPath(); g.ellipse(px + pr * 0.7, py + pr * 0.5, pr, pr * 0.7, 0, 0, 7); g.fill();
      g.fillStyle = ['#d9c3a2', '#a98b6a', '#8d7b6a', '#e4d2b4'][i % 4]; g.beginPath(); g.ellipse(px, py, pr, pr * 0.75, rnd() * 3, 0, 7); g.fill();
    }
    g.strokeStyle = 'rgba(90,50,22,.22)'; g.lineWidth = 1;   // rachaduras
    for (i = 0; i < 6; i++) { var cx = rnd() * S, cy = rnd() * S; g.beginPath(); g.moveTo(cx, cy); for (var k = 0; k < 4; k++) { cx += (rnd() - 0.5) * 22; cy += (rnd() - 0.5) * 22; g.lineTo(cx, cy); } g.stroke(); }
    cache.chao = cv;
    return cv;
  }

  /* ---------- objetos do canteiro (em unidades do campo; sombra comprida para a direita/baixo) ---------- */
  function sombraCaixa(g, x, y, w, h, alto) {   // sombra de um volume w×h no chão, esticada pelo sol baixo
    var dx = SOMBRA.x * alto * 1.6, dy = SOMBRA.y * alto * 1.6;
    g.fillStyle = 'rgba(60,26,6,.28)';
    g.beginPath(); g.moveTo(x, y + h); g.lineTo(x + w, y + h); g.lineTo(x + w + dx, y + h + dy); g.lineTo(x + w + dx, y + dy); g.lineTo(x + w, y); g.lineTo(x + dx, y + dy); g.closePath(); g.fill();
    g.fillRect(x, y, w, h);
  }
  function caixa3d(g, x, y, w, h, alto, topo, frente, lado) {   // volume visto de cima e de frente (3/4)
    g.fillStyle = frente; g.fillRect(x, y + h - alto, w, alto);
    g.fillStyle = topo; g.fillRect(x, y - alto, w, h);
    if (lado) { g.fillStyle = lado; g.fillRect(x + w - 2, y - alto, 2, h + alto); }
  }
  var OBJETOS = {
    palete: { r: 34, f: function (g, x, y) {
      sombraCaixa(g, x - 30, y - 22, 60, 44, 26);
      g.fillStyle = '#9c6b37'; g.fillRect(x - 32, y + 14, 64, 8); g.fillStyle = '#7b5026'; for (var i = 0; i < 4; i++) g.fillRect(x - 32 + i * 20, y + 14, 4, 8);
      for (var c = 0; c < 3; c++) for (var l = 0; l < 3; l++) {
        var bx = x - 30 + (c % 2 ? 6 : 0) + l * 19, by = y + 12 - c * 9;
        if (bx > x + 22) continue;
        caixa3d(g, bx, by - 14, 18, 14, 8, '#d0623f', '#a5432a');
        g.strokeStyle = 'rgba(240,210,180,.6)'; g.lineWidth = 1; g.strokeRect(bx + 0.5, by - 21.5, 17, 13);
      }
    } },
    areia: { r: 38, f: function (g, x, y) {
      g.fillStyle = 'rgba(60,26,6,.26)'; g.beginPath(); g.ellipse(x + 26, y + 18, 46, 20, 0.45, 0, 7); g.fill();
      var gr = g.createRadialGradient(x - 14, y - 16, 4, x, y, 44);
      gr.addColorStop(0, '#fbe3a8'); gr.addColorStop(0.55, '#e3b56a'); gr.addColorStop(1, '#b5803e');
      g.fillStyle = gr; g.beginPath(); g.moveTo(x - 42, y + 14); g.quadraticCurveTo(x - 20, y - 34, x, y - 30); g.quadraticCurveTo(x + 22, y - 32, x + 42, y + 14); g.quadraticCurveTo(x, y + 26, x - 42, y + 14); g.fill();
      var rnd = sorteio(Math.round(x * 7 + y)); g.fillStyle = 'rgba(140,90,40,.35)';
      for (var i = 0; i < 30; i++) g.fillRect(x - 30 + rnd() * 60, y - 14 + rnd() * 30, 1.5, 1.5);
      g.strokeStyle = '#6b4a2a'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 6, y - 22); g.lineTo(x + 30, y - 52); g.stroke();   // pá fincada
      g.fillStyle = '#9aa2a8'; g.beginPath(); g.moveTo(x + 2, y - 30); g.lineTo(x + 12, y - 18); g.lineTo(x + 4, y - 10); g.lineTo(x - 6, y - 22); g.closePath(); g.fill();
    } },
    cones: { r: 40, f: function (g, x, y) {
      cone(g, x - 26, y + 6); cone(g, x + 26, y - 6);
      fita(g, x - 26, y - 10, x + 26, y - 22);
    } },
    cimento: { r: 30, f: function (g, x, y) {
      sombraCaixa(g, x - 26, y - 14, 52, 30, 14);
      [[-26, -4, 26], [0, -4, 26], [-13, -16, 26]].forEach(function (s) {
        g.fillStyle = '#e8e2d6'; rr(g, x + s[0], y + s[1], s[2], 18, 5); g.fill();
        g.fillStyle = '#c9c1b0'; rr(g, x + s[0], y + s[1] + 12, s[2], 6, 3); g.fill();
        g.fillStyle = '#2f6db5'; g.fillRect(x + s[0] + 5, y + s[1] + 5, s[2] - 10, 4);
      });
    } },
    carrinho: { r: 34, f: function (g, x, y) {
      g.fillStyle = 'rgba(60,26,6,.28)'; g.beginPath(); g.ellipse(x + 20, y + 14, 38, 14, 0.4, 0, 7); g.fill();
      g.strokeStyle = '#3a3a3a'; g.lineWidth = 3.5; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x - 10, y + 4); g.lineTo(x + 34, y + 16); g.moveTo(x - 10, y - 8); g.lineTo(x + 34, y - 18); g.stroke();
      g.fillStyle = '#2e8b57'; g.beginPath(); g.moveTo(x - 30, y - 16); g.lineTo(x + 8, y - 20); g.lineTo(x + 4, y + 12); g.lineTo(x - 24, y + 10); g.closePath(); g.fill();
      g.fillStyle = '#3fb36f'; g.beginPath(); g.moveTo(x - 28, y - 14); g.lineTo(x + 5, y - 17); g.lineTo(x + 2, y - 4); g.lineTo(x - 26, y - 2); g.closePath(); g.fill();
      g.fillStyle = '#7a6a5a'; g.beginPath(); g.ellipse(x - 12, y - 10, 12, 5, -0.1, 0, 7); g.fill();
      g.fillStyle = '#222'; g.beginPath(); g.ellipse(x - 34, y - 2, 6, 9, 0, 0, 7); g.fill(); g.fillStyle = '#777'; g.beginPath(); g.arc(x - 34, y - 2, 2.4, 0, 7); g.fill();
    } },
    tabuas: { r: 40, f: function (g, x, y) {
      for (var i = 0; i < 3; i++) {
        var yy = y - 14 + i * 9, xx = x - 42 + i * 4;
        g.fillStyle = 'rgba(60,26,6,.25)'; g.fillRect(xx + 6, yy + 8, 82, 7);
        g.fillStyle = i % 2 ? '#d9a868' : '#c99556'; g.fillRect(xx, yy, 82, 7);
        g.fillStyle = 'rgba(120,70,30,.35)'; g.fillRect(xx, yy + 5, 82, 2); g.fillRect(xx + 20 + i * 9, yy + 2, 6, 2);
      }
    } },
    poca: { r: 30, f: function (g, x, y) {
      var gr = g.createLinearGradient(x - 30, y - 16, x + 30, y + 16);
      gr.addColorStop(0, 'rgba(150,190,220,.85)'); gr.addColorStop(0.5, 'rgba(255,200,140,.75)'); gr.addColorStop(1, 'rgba(110,140,170,.85)');
      g.fillStyle = 'rgba(90,50,20,.35)'; g.beginPath(); g.ellipse(x, y + 2, 34, 18, 0.15, 0, 7); g.fill();
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, 31, 15, 0.15, 0, 7); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x - 6, y - 3, 14, 5, 0.15, 3.6, 5.2); g.stroke();
    } },
    balde: { r: 18, f: function (g, x, y) {
      g.fillStyle = 'rgba(60,26,6,.3)'; g.beginPath(); g.ellipse(x + 12, y + 9, 18, 10, 0.5, 0, 7); g.fill();
      g.fillStyle = '#4b5258'; g.beginPath(); g.arc(x, y, 14, 0, 7); g.fill();
      g.fillStyle = '#9da3a8'; g.beginPath(); g.arc(x, y, 11.5, 0, 7); g.fill();
      g.fillStyle = '#b8b2a8'; g.beginPath(); g.arc(x, y, 9.5, 0, 7); g.fill();
      g.strokeStyle = '#2b2f33'; g.lineWidth = 1.6; g.beginPath(); g.arc(x - 2, y - 2, 16, 3.4, 5.6); g.stroke();
    } },
    vergalhoes: { r: 44, f: function (g, x, y) {
      g.lineCap = 'round';
      for (var i = 0; i < 7; i++) {
        var yy = y - 9 + i * 3;
        g.strokeStyle = 'rgba(60,26,6,.25)'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(x - 40 + 6, yy + 7); g.lineTo(x + 40 + 6, yy + 7 - 6); g.stroke();
        g.strokeStyle = i % 2 ? '#8a4b2a' : '#a65d34'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x - 40, yy); g.lineTo(x + 40, yy - 6); g.stroke();
      }
      g.strokeStyle = '#333'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 20, y - 14); g.lineTo(x - 20, y + 10); g.moveTo(x + 18, y - 17); g.lineTo(x + 18, y + 6); g.stroke();
    } },
    andaime: { r: 56, f: function (g, x, y) {
      var w = 104, h = 58, x0 = x - w / 2, y0 = y - h / 2;
      g.fillStyle = 'rgba(60,26,6,.22)'; g.beginPath(); g.moveTo(x0, y0 + h); g.lineTo(x0 + w, y0 + h); g.lineTo(x0 + w + 70, y0 + h + 48); g.lineTo(x0 + 70, y0 + h + 48); g.closePath(); g.fill();
      g.strokeStyle = '#7e8790'; g.lineWidth = 3.4; g.lineCap = 'round';
      g.beginPath();
      [0, w / 2, w].forEach(function (d) { g.moveTo(x0 + d, y0 - 28); g.lineTo(x0 + d, y0 + h); });
      g.moveTo(x0, y0 + h * 0.45); g.lineTo(x0 + w, y0 + h * 0.45); g.moveTo(x0, y0 - 28); g.lineTo(x0 + w, y0 - 28);
      g.moveTo(x0, y0 + h); g.lineTo(x0 + w / 2, y0 - 28); g.moveTo(x0 + w / 2, y0 + h); g.lineTo(x0 + w, y0 - 28);
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1; g.beginPath(); [0, w / 2, w].forEach(function (d) { g.moveTo(x0 + d - 1, y0 - 28); g.lineTo(x0 + d - 1, y0 + h); }); g.stroke();
      g.fillStyle = '#c99556'; g.fillRect(x0 - 4, y0 + h * 0.45 - 6, w + 8, 7); g.fillRect(x0 - 4, y0 - 34, w + 8, 7);
      g.fillStyle = 'rgba(110,60,20,.4)'; g.fillRect(x0 - 4, y0 + h * 0.45, w + 8, 2); g.fillRect(x0 - 4, y0 - 28, w + 8, 2);
      g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(x0 + 20, y0 - 40, 6, Math.PI, 0); g.fill(); g.fillRect(x0 + 12, y0 - 41, 16, 3);   // capacete esquecido
    } }
  };
  function cone(g, x, y) {
    g.fillStyle = 'rgba(60,26,6,.3)'; g.beginPath(); g.moveTo(x - 8, y + 8); g.lineTo(x + 34, y + 30); g.lineTo(x + 8, y + 8); g.closePath(); g.fill();
    g.fillStyle = '#2b2b2b'; rr(g, x - 11, y + 4, 22, 7, 2); g.fill();
    g.fillStyle = '#ff6a13'; g.beginPath(); g.moveTo(x - 8, y + 6); g.lineTo(x - 2.2, y - 20); g.lineTo(x + 2.2, y - 20); g.lineTo(x + 8, y + 6); g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x - 6.3, y - 1); g.lineTo(x - 4.6, y - 8); g.lineTo(x + 4.6, y - 8); g.lineTo(x + 6.3, y - 1); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(x - 5, y + 5); g.lineTo(x - 1.5, y - 19); g.lineTo(x - 0.5, y - 19); g.lineTo(x - 2, y + 5); g.fill();
  }
  function fita(g, x1, y1, x2, y2) {   // fita zebrada amarela e preta, caída no meio
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + 8;
    g.lineCap = 'butt'; g.lineWidth = 3.4;
    g.strokeStyle = '#ffd400'; g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mx, my, x2, y2); g.stroke();
    g.setLineDash([5, 5]); g.strokeStyle = '#1d1d1d'; g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mx, my, x2, y2); g.stroke(); g.setLineDash([]);
  }

  /* ---------- canaleta, manilhas e pontes ---------- */
  function caminhoPoli(g, tab, de, ate, passo) {
    g.beginPath();
    var a = Math.max(0, Math.floor(de)), b = Math.min(tab.L, Math.ceil(ate));
    g.moveTo(tab.x[a], tab.y[a]);
    for (var s = a + passo; s < b; s += passo) g.lineTo(tab.x[s], tab.y[s]);
    g.lineTo(tab.x[b], tab.y[b]);
  }
  function canaleta(g, tabs, camada) {
    var W = R * 2;
    tabs.forEach(function (tab) {
      g.lineJoin = 'round'; g.lineCap = 'round';
      if (camada === 'sombra') {
        g.save(); g.translate(SOMBRA.x * 7, SOMBRA.y * 7); caminhoPoli(g, tab, 0, tab.L, 3);
        g.strokeStyle = 'rgba(60,26,6,.32)'; g.lineWidth = W + 22; g.stroke(); g.restore();
      } else if (camada === 'borda') {
        caminhoPoli(g, tab, 0, tab.L, 3);
        g.strokeStyle = '#9d968b'; g.lineWidth = W + 20; g.stroke();
        g.strokeStyle = '#d6d0c4'; g.lineWidth = W + 15; g.stroke();
        // últimos 15 %: zebrado de perigo na borda
        caminhoPoli(g, tab, tab.L * 0.85, tab.L, 3); g.lineCap = 'butt';
        g.strokeStyle = '#ffcc00'; g.lineWidth = W + 15; g.stroke();
        g.setLineDash([9, 9]); g.strokeStyle = '#222'; g.stroke(); g.setLineDash([]); g.lineCap = 'round';
      } else if (camada === 'fundo') {
        caminhoPoli(g, tab, 0, tab.L, 3);
        g.strokeStyle = '#5b554d'; g.lineWidth = W + 7; g.stroke();
        g.strokeStyle = '#757068'; g.lineWidth = W + 1; g.stroke();
        g.save(); g.translate(-1.6, -1.6); g.strokeStyle = 'rgba(40,34,28,.45)'; g.lineWidth = W - 3; g.stroke(); g.restore();
        g.save(); g.translate(1.4, 1.4); g.strokeStyle = 'rgba(160,154,144,.45)'; g.lineWidth = W - 8; g.stroke(); g.restore();
        // juntas das placas de concreto
        g.strokeStyle = 'rgba(55,48,40,.55)'; g.lineWidth = 1.4; g.beginPath();
        for (var s = 40; s < tab.L; s += 64) {
          var a = tab.a[s], nx = -Math.sin(a), ny = Math.cos(a), h = W / 2 + 9;
          g.moveTo(tab.x[s] + nx * h, tab.y[s] + ny * h); g.lineTo(tab.x[s] - nx * h, tab.y[s] - ny * h);
        }
        g.stroke();
      }
    });
  }
  function manilha(g, m) {   // cano de concreto por cima do caminho
    var ax = m[0][0], ay = m[0][1], bx = m[1][0], by = m[1][1], an = Math.atan2(by - ay, bx - ax), len = Math.hypot(bx - ax, by - ay), r = R + 12;
    g.save(); g.translate(ax, ay); g.rotate(an);
    g.fillStyle = 'rgba(60,26,6,.35)'; g.save(); g.rotate(-an); g.translate(SOMBRA.x * 14, SOMBRA.y * 14); g.rotate(an); rr(g, -4, -r, len + 8, r * 2, r); g.fill(); g.restore();
    var gr = g.createLinearGradient(0, -r, 0, r);
    gr.addColorStop(0, '#e9e5dc'); gr.addColorStop(0.3, '#cfc9bd'); gr.addColorStop(0.75, '#9b948a'); gr.addColorStop(1, '#6f695f');
    g.fillStyle = gr; g.fillRect(0, -r, len, r * 2);
    g.fillStyle = 'rgba(0,0,0,.06)'; for (var i = 0; i < len; i += 7) g.fillRect(i, -r, 1, r * 2);
    g.strokeStyle = 'rgba(70,64,56,.55)'; g.lineWidth = 3;
    for (var j = 30; j < len - 10; j += 50) { g.beginPath(); g.moveTo(j, -r); g.lineTo(j, r); g.stroke(); }
    g.restore();
  }
  function bocaDoCano(g, x, y, a, r) {   // a boca redonda (anel) onde a fila entra ou sai
    g.save(); g.translate(x, y); g.rotate(a);
    var gr = g.createLinearGradient(0, -r, 0, r);
    gr.addColorStop(0, '#f1ede4'); gr.addColorStop(0.5, '#c9c2b6'); gr.addColorStop(1, '#7c766c');
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, r * 0.42, r, 0, 0, 7); g.fill();
    g.fillStyle = '#2c2621'; g.beginPath(); g.ellipse(0, 0, r * 0.28, r * 0.74, 0, 0, 7); g.fill();
    g.restore();
  }

  /* ---------- cenário fixo: pintado uma vez ---------- */
  // galhos: tabelas de todos os ramos (portões curtos e longos), para pintar a canaleta inteira
  function ramos(E) {
    var lista = [];
    galhos = [];
    E.trilhos.forEach(function (T) {
      var tem = T.pecas.some(function (p) { return p.idx != null; });
      if (!tem) { lista.push(T.tab); return; }
      [false, true].forEach(function (longo) {
        var c = { pecas: T.pecas, portoes: E.portoes.map(function () { return { longo: longo }; }) };
        var mp = RG.montarPontos(c), tab = RG.tabela(mp.pts, E.manilhas);
        lista.push(tab);
        mp.faixas.forEach(function (fx, idx) { if (fx) galhos.push({ idx: idx, longo: longo, tab: tab, de: tab.marcas[fx[0]], ate: tab.marcas[fx[1]] }); });
      });
    });
    return lista;
  }
  function livre(E, tabs, x, y, r, postos) {
    for (var t = 0; t < tabs.length; t++) {
      var tab = tabs[t], lim = r + R + 22;
      for (var s = 0; s <= tab.L; s += 10) { var dx = tab.x[s] - x, dy = tab.y[s] - y; if (dx * dx + dy * dy < lim * lim) return false; }
    }
    var L = E.lanc;
    if (L.trilho) { if (Math.abs(y - L.trilho[0][1]) < r + 46 && x > L.trilho[0][0] - r - 46 && x < L.trilho[1][0] + r + 46) return false; if (Math.abs(x - L.trilho[0][0]) < r + 46 && y > L.trilho[0][1] - r - 46 && y < L.trilho[1][1] + r + 46) return false; }
    else if (Math.hypot(x - L.x, y - L.y) < r + 62) return false;
    for (var p = 0; p < postos.length; p++) if (Math.hypot(postos[p].x - x, postos[p].y - y) < postos[p].r + r + 6) return false;
    return true;
  }
  function preparar(E, lay) {
    dpr = lay.dpr;
    var k = lay.esc * dpr, W = Math.round(lay.cw * dpr), H = Math.round(lay.ch * dpr);
    figurinhas(k);
    var chave = [E.fase.id, E.retrato, W, H, k.toFixed(4), lay.ox, lay.oy].join(':');
    if (fundo && fundoChave === chave) return;
    fundoChave = chave;
    fundo = novoCanvas(W, H);
    var g = fundo.getContext('2d');
    // terra batida
    g.fillStyle = g.createPattern(chao(), 'repeat'); g.fillRect(0, 0, W, H);
    g.setTransform(k, 0, 0, k, lay.ox * dpr, lay.oy * dpr);
    var vx0 = -lay.ox / lay.esc, vy0 = -lay.oy / lay.esc, vx1 = (lay.cw - lay.ox) / lay.esc, vy1 = (lay.ch - lay.oy) / lay.esc;
    var tabs = ramos(E), rnd = sorteio(E.fase.id * 977 + (E.retrato ? 7 : 3)), i;
    // marcas de pneu no chão
    g.strokeStyle = 'rgba(95,55,25,.16)'; g.lineWidth = 7; g.setLineDash([4, 6]);
    for (i = 0; i < 2; i++) {
      var y0 = vy0 + (vy1 - vy0) * (0.3 + i * 0.4);
      for (var d = -9; d <= 9; d += 18) { g.beginPath(); g.moveTo(vx0 - 20, y0 + d); g.bezierCurveTo(vx0 + (vx1 - vx0) * 0.3, y0 + d - 120, vx0 + (vx1 - vx0) * 0.6, y0 + d + 140, vx1 + 20, y0 + d - 30); g.stroke(); }
    }
    g.setLineDash([]);
    // objetos do canteiro nos espaços livres (dentro e fora do campo)
    var postos = [], nomes = ['palete', 'areia', 'cones', 'cimento', 'andaime', 'tabuas', 'poca', 'carrinho', 'vergalhoes', 'balde', 'cones', 'palete', 'tabuas', 'areia', 'cimento', 'cones'];
    var fimDe = E.trilhos.map(function (T) { return { x: T.tab.x[T.tab.L], y: T.tab.y[T.tab.L], r: 60 }; });
    fimDe.forEach(function (p) { postos.push(p); });
    E.portoes.forEach(function (gp) { postos.push({ x: gp.botao[0], y: gp.botao[1], r: 36 }); });
    E.trilhos.forEach(function (T) { postos.push({ x: T.tab.x[0], y: T.tab.y[0], r: 40 }); });
    var qtd = Math.round(Math.min(16, 6 + (vx1 - vx0) * (vy1 - vy0) / 60000));
    for (i = 0; i < qtd * 8 && postos.length < qtd + fimDe.length + E.portoes.length + E.trilhos.length; i++) {
      var nome = nomes[(postos.length + i) % nomes.length], ob = OBJETOS[nome];
      var x = vx0 + 40 + rnd() * (vx1 - vx0 - 80), y = vy0 + 70 + rnd() * (vy1 - vy0 - 110);
      if (!livre(E, tabs, x, y, ob.r, postos)) continue;
      postos.push({ x: x, y: y, r: ob.r, nome: nome });
    }
    postos.filter(function (p) { return p.nome; }).sort(function (a, b) { return a.y - b.y; }).forEach(function (p) { OBJETOS[p.nome].f(g, p.x, p.y); });
    // trilho do andaime (lançador que anda)
    if (E.lanc.trilho) trilhoAndaime(g, E.lanc.trilho);
    // a canaleta: sombra, borda, fundo (todos os ramos)
    canaleta(g, tabs, 'sombra'); canaleta(g, tabs, 'borda'); canaleta(g, tabs, 'fundo');
    // manilhas e pontes por cima delas
    E.manilhas.forEach(function (m) { manilha(g, m); });
    if (E.manilhas.length) tabs.forEach(function (tab) { ponte(g, tab, E.manilhas); });
    // tapume no alto da tela
    tapume(g, vx0, vy0, vx1);
    // luz do fim de tarde e vinheta
    g.setTransform(1, 0, 0, 1, 0, 0);
    var luz = g.createLinearGradient(0, 0, W, H);
    luz.addColorStop(0, 'rgba(255,214,150,.28)'); luz.addColorStop(0.55, 'rgba(255,170,90,.06)'); luz.addColorStop(1, 'rgba(70,24,40,.24)');
    g.fillStyle = luz; g.fillRect(0, 0, W, H);
    var sol = g.createRadialGradient(0, 0, 0, 0, 0, Math.max(W, H) * 0.55);
    sol.addColorStop(0, 'rgba(255,236,170,.45)'); sol.addColorStop(1, 'rgba(255,236,170,0)');
    g.fillStyle = sol; g.fillRect(0, 0, W, H);
    var vin = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.78);
    vin.addColorStop(0, 'rgba(0,0,0,0)'); vin.addColorStop(1, 'rgba(40,14,0,.32)');
    g.fillStyle = vin; g.fillRect(0, 0, W, H);
    // bocas: a entrada de cada trilho e as pontas das manilhas (desenhadas por cima dos tijolos a cada quadro)
    bocas = [];
    E.trilhos.forEach(function (T) { bocas.push({ x: T.tab.x[0], y: T.tab.y[0], a: T.tab.a[0], r: R + 14, entrada: true }); });
    E.manilhas.forEach(function (m) {
      var an = Math.atan2(m[1][1] - m[0][1], m[1][0] - m[0][0]);
      bocas.push({ x: m[0][0], y: m[0][1], a: an, r: R + 12 }); bocas.push({ x: m[1][0], y: m[1][1], a: an, r: R + 12 });
    });
  }
  function ponte(g, tab, mans) {   // trecho que passa por cima de uma manilha: tábuas e guarda-corpo
    for (var s = 0; s <= tab.L; s += 2) {
      if (tab.oculto[s]) continue;
      var x = tab.x[s], y = tab.y[s], perto = false;
      for (var m = 0; m < mans.length && !perto; m++) {
        var a = mans[m][0], b = mans[m][1], dx = b[0] - a[0], dy = b[1] - a[1], u = ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy);
        if (u > -0.05 && u < 1.05 && Math.abs(Math.cos(tab.a[s] - Math.atan2(dy, dx))) < 0.6) { var px = a[0] + dx * u - x, py = a[1] + dy * u - y; if (px * px + py * py < (R + 16) * (R + 16)) perto = true; }
      }
      if (!perto) continue;
      var e = s; while (e < tab.L && !tab.oculto[e + 1] && e - s < 140) e++;
      var ini = Math.max(0, s - 26), fim = Math.min(tab.L, s + 70);
      g.lineCap = 'butt';
      caminhoPoli(g, tab, ini, fim, 2);
      g.strokeStyle = 'rgba(60,26,6,.35)'; g.lineWidth = R * 2 + 26; g.stroke();
      g.strokeStyle = '#8c5a2b'; g.lineWidth = R * 2 + 18; g.stroke();
      g.strokeStyle = '#c99556'; g.lineWidth = R * 2 + 10; g.stroke();
      g.strokeStyle = '#757068'; g.lineWidth = R * 2 + 1; g.stroke();
      g.strokeStyle = '#a7743d'; g.lineWidth = 1.2;   // tábuas
      g.beginPath();
      for (var q = ini + 4; q < fim; q += 8) { var an = tab.a[q], nx = -Math.sin(an), ny = Math.cos(an), h = R + 9; g.moveTo(tab.x[q] + nx * h, tab.y[q] + ny * h); g.lineTo(tab.x[q] + nx * (R + 4), tab.y[q] + ny * (R + 4)); g.moveTo(tab.x[q] - nx * h, tab.y[q] - ny * h); g.lineTo(tab.x[q] - nx * (R + 4), tab.y[q] - ny * (R + 4)); }
      g.stroke();
      g.lineCap = 'round';
      s = fim + 40;
    }
  }
  function trilhoAndaime(g, tr) {
    var a = tr[0], b = tr[1], an = Math.atan2(b[1] - a[1], b[0] - a[0]), len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    g.save(); g.translate(a[0], a[1]); g.rotate(an);
    g.fillStyle = 'rgba(60,26,6,.28)'; g.fillRect(-30 + 10, -26 + 12, len + 60, 52);
    g.fillStyle = '#c99556'; g.fillRect(-34, -22, len + 68, 44);
    g.fillStyle = 'rgba(120,70,30,.35)'; for (var i = -34; i < len + 34; i += 34) g.fillRect(i, -22, 2, 44);
    g.strokeStyle = '#7e8790'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-40, -20); g.lineTo(len + 40, -20); g.moveTo(-40, 20); g.lineTo(len + 40, 20); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-40, -21.5); g.lineTo(len + 40, -21.5); g.moveTo(-40, 18.5); g.lineTo(len + 40, 18.5); g.stroke();
    g.fillStyle = '#4c5258'; [-40, len + 40].forEach(function (x) { g.beginPath(); g.arc(x, -20, 5, 0, 7); g.arc(x, 20, 5, 0, 7); g.fill(); });
    g.restore();
  }
  function tapume(g, x0, y0, x1) {   // tapume de obra no topo, com placa e luzinhas
    var h = 24, y = y0;
    g.fillStyle = 'rgba(60,26,6,.3)'; g.fillRect(x0, y + h, x1 - x0, 14);
    for (var x = x0 - 2, i = 0; x < x1; x += 46, i++) {
      g.fillStyle = i % 2 ? '#2f6f5b' : '#357a64'; g.fillRect(x, y, 46, h);
      g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x, y, 46, 3);
      g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x + 44, y, 2, h);
    }
    g.fillStyle = '#ffcc00'; g.fillRect(x0, y + h - 5, x1 - x0, 5);
    g.fillStyle = '#1d1d1d'; for (x = x0; x < x1; x += 14) { g.beginPath(); g.moveTo(x, y + h); g.lineTo(x + 7, y + h - 5); g.lineTo(x + 12, y + h - 5); g.lineTo(x + 5, y + h); g.fill(); }
  }

  /* ---------- coisas que mexem ---------- */
  // cada material tem 24 quadros já girados, com o brilho do sol por cima: um tijolo = uma cópia reta, sem girar na hora
  // (girar figurinha a cada quadro pesava no tablet velho)
  var GIROS = 24;
  function quadroGirado(c, f) {
    var q = cache.giros[c] || (cache.giros[c] = []);
    if (q[f]) return q[f];
    var t = cache.tex[c], b = cache.brilho, S = Math.max(t.width, b.width), cv = novoCanvas(S, S), g = cv.getContext('2d');
    g.translate(S / 2, S / 2); g.rotate(f / GIROS * Math.PI * 2); g.drawImage(t, -t.width / 2, -t.height / 2);
    g.setTransform(1, 0, 0, 1, S / 2, S / 2); g.drawImage(b, -b.width / 2, -b.height / 2);
    q[f] = cv;
    return cv;
  }
  function desenharTijolo(ctx, c, x, y, rot, esc, k, ox, oy) {
    var f = Math.round(rot / (Math.PI * 2) * GIROS) % GIROS; if (f < 0) f += GIROS;
    var spr = quadroGirado(c, f), ex = ox + x * k, ey = oy + y * k;
    if (esc === 1) { ctx.setTransform(1, 0, 0, 1, Math.round(ex), Math.round(ey)); ctx.drawImage(spr, -spr.width / 2, -spr.height / 2); return; }
    ctx.setTransform(esc, 0, 0, esc, ex, ey);
    ctx.drawImage(spr, -spr.width / 2, -spr.height / 2);
  }
  function sombraEm(ctx, x, y, k, ox, oy) {
    var s = cache.sombra;
    ctx.setTransform(1, 0, 0, 1, Math.round(ox + (x + SOMBRA.x * 6) * k), Math.round(oy + (y + SOMBRA.y * 6) * k));
    ctx.drawImage(s, -s.width / 2, -s.height / 2);
  }

  function lancador(g, E, tm, k) {
    var L = E.lanc, a = L.ang, recuo = L.espera > 0 ? L.espera * 18 : 0;
    g.save(); g.translate(L.x, L.y);
    // sombra
    g.fillStyle = 'rgba(50,20,4,.35)'; g.beginPath(); g.ellipse(SOMBRA.x * 14, SOMBRA.y * 14, 46, 40, 0.5, 0, 7); g.fill();
    if (L.trilho) {   // carrinho com rodas no andaime
      g.fillStyle = '#3a3f44'; [-26, 26].forEach(function (dx) { g.beginPath(); g.arc(dx, -20, 7, 0, 7); g.arc(dx, 20, 7, 0, 7); g.fill(); });
    }
    // base giratória com faixa zebrada
    g.fillStyle = '#2d3136'; g.beginPath(); g.arc(0, 0, 40, 0, 7); g.fill();
    g.lineWidth = 6; g.strokeStyle = '#ffcc00'; g.beginPath(); g.arc(0, 0, 36, 0, 7); g.stroke();
    g.setLineDash([7, 7]); g.strokeStyle = '#1b1b1b'; g.stroke(); g.setLineDash([]);
    g.fillStyle = '#474d54'; g.beginPath(); g.arc(0, 0, 32, 0, 7); g.fill();
    g.fillStyle = '#868d94'; for (var i = 0; i < 8; i++) { var an = i * Math.PI / 4; g.beginPath(); g.arc(Math.cos(an) * 28, Math.sin(an) * 28, 1.8, 0, 7); g.fill(); }
    // corpo da betoneira (gira com a mira)
    g.rotate(a); g.translate(-recuo, 0);
    // funil de trás com o próximo tijolo
    g.fillStyle = '#5b636b'; g.beginPath(); g.moveTo(-18, -14); g.lineTo(-40, -19); g.lineTo(-40, 19); g.lineTo(-18, 14); g.closePath(); g.fill();
    g.fillStyle = '#3a4046'; g.beginPath(); g.ellipse(-40, 0, 6, 19, 0, 0, 7); g.fill();
    // tambor
    var gr = g.createLinearGradient(0, -24, 0, 24);
    gr.addColorStop(0, '#ff9a6b'); gr.addColorStop(0.35, '#ef5a2c'); gr.addColorStop(0.8, '#b8361a'); gr.addColorStop(1, '#7e2410');
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(-22, -22); g.bezierCurveTo(-8, -28, 14, -22, 30, -14); g.lineTo(30, 14); g.bezierCurveTo(14, 22, -8, 28, -22, 22); g.quadraticCurveTo(-30, 0, -22, -22); g.closePath(); g.fill();
    // aletas em espiral (giram devagar: a betoneira está sempre girando)
    g.save(); g.clip();
    g.strokeStyle = 'rgba(255,240,220,.65)'; g.lineWidth = 4;
    var fase = (tm * 22) % 18;
    for (var x = -40 + fase; x < 40; x += 18) { g.beginPath(); g.moveTo(x, -26); g.lineTo(x + 12, 26); g.stroke(); }
    g.restore();
    g.strokeStyle = 'rgba(60,14,4,.6)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(-22, -22); g.bezierCurveTo(-8, -28, 14, -22, 30, -14); g.lineTo(30, 14); g.bezierCurveTo(14, 22, -8, 28, -22, 22); g.quadraticCurveTo(-30, 0, -22, -22); g.stroke();
    // boca
    g.fillStyle = '#3a3f44'; g.beginPath(); g.ellipse(31, 0, 6, 17, 0, 0, 7); g.fill();
    g.fillStyle = '#1e2226'; g.beginPath(); g.ellipse(32, 0, 3.5, 13, 0, 0, 7); g.fill();
    g.restore();
    // o tijolo da vez, na boca, e o próximo, no funil
    var bx = L.x + Math.cos(a) * (36 - recuo), by = L.y + Math.sin(a) * (36 - recuo);
    var ox = fundoOx, oy = fundoOy;
    sombraEm(g, bx, by, k, ox, oy);
    desenharTijolo(g, L.cor, bx, by, 0, 1, k, ox, oy);
    var px = L.x - Math.cos(a) * 40, py = L.y - Math.sin(a) * 40;
    desenharTijolo(g, L.prox, px, py, 0, 0.62, k, ox, oy);
    g.setTransform(k, 0, 0, k, ox, oy);
    // cubo central
    g.fillStyle = '#ffcc00'; g.beginPath(); g.arc(L.x, L.y, 8, 0, 7); g.fill();
    g.fillStyle = '#7a5c00'; g.beginPath(); g.arc(L.x, L.y, 3, 0, 7); g.fill();
  }
  var fundoOx = 0, fundoOy = 0;

  var CW = 84, CH = 54;
  function corpoCacamba(i, k) {   // a caixa com o entulho, pintada uma vez por trilho
    var chave = i + ':' + k;
    if (cache.cacamba[chave]) return cache.cacamba[chave];
    var w = CW, h = CH, M = 70, cv = novoCanvas((w + M * 2) * k, (h + M * 2) * k), g = cv.getContext('2d');
    g.setTransform(k, 0, 0, k, (w / 2 + M) * k, (h / 2 + M) * k);
    g.fillStyle = 'rgba(55,20,4,.35)'; g.beginPath(); g.moveTo(-w / 2, h / 2); g.lineTo(w / 2, h / 2); g.lineTo(w / 2 + 52, h / 2 + 36); g.lineTo(-w / 2 + 52, h / 2 + 36); g.closePath(); g.fill();
    var gr = g.createLinearGradient(0, -h / 2, 0, h / 2 + 14);
    gr.addColorStop(0, '#ffbe2e'); gr.addColorStop(1, '#c97c00');
    g.fillStyle = gr; g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(w / 2, -h / 2); g.lineTo(w / 2 - 8, h / 2 + 14); g.lineTo(-w / 2 + 8, h / 2 + 14); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(120,60,0,.6)'; g.lineWidth = 2;
    for (var j = -2; j <= 2; j++) { g.beginPath(); g.moveTo(j * 15, -h / 2 + 4); g.lineTo(j * 13, h / 2 + 12); g.stroke(); }
    g.fillStyle = '#3b2c22'; rr(g, -w / 2 + 5, -h / 2 + 4, w - 10, h - 18, 5); g.fill();
    var rnd = sorteio(i * 13 + 5);
    for (j = 0; j < 12; j++) { g.fillStyle = ['#8d8378', '#a5432a', '#6b625a', '#c3b8a8'][j % 4]; g.fillRect(-w / 2 + 10 + rnd() * (w - 26), -h / 2 + 8 + rnd() * (h - 30), 6 + rnd() * 6, 4 + rnd() * 4); }
    cv.meio = { x: (w / 2 + M) * k, y: (h / 2 + M) * k };
    cache.cacamba[chave] = cv;
    return cv;
  }
  function cacamba(g, T, tm) {
    var tab = T.tab, x = tab.x[tab.L], y = tab.y[tab.L], a = tab.a[tab.L], p = T.perigo;
    var cx = x + Math.cos(a) * 26, cy = y + Math.sin(a) * 26, k = cache.k, corpo = corpoCacamba(T.i, k), w = CW, h = CH;
    g.setTransform(1, 0, 0, 1, Math.round(fundoOx + cx * k - corpo.meio.x), Math.round(fundoOy + cy * k - corpo.meio.y));
    g.drawImage(corpo, 0, 0);
    g.setTransform(k, 0, 0, k, fundoOx, fundoOy);
    g.save(); g.translate(cx, cy);
    // tampa: fechada cobre a metade de trás; no perigo ela levanta (e aparece em pé, atrás)
    var abre = Math.min(1, p * 1.6), fundoT = (h - 14) * 0.55 * (1 - abre);
    g.fillStyle = '#2f6f5b'; g.fillRect(-w / 2 - 2, -h / 2, w + 4, fundoT);
    if (abre > 0) { g.fillStyle = '#245848'; g.fillRect(-w / 2 - 2, -h / 2 - 22 * abre, w + 4, 22 * abre); g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(-w / 2 - 2, -h / 2 - 22 * abre, w + 4, 3); }
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(-w / 2 - 2, -h / 2, w + 4, 3);
    // giroflex amarelo
    var lx = w / 2 - 8, ly = -h / 2 - 6;
    if (p > 0) {
      var ang = tm * 7, raio = 120;
      g.save(); g.translate(lx, ly); g.rotate(ang);
      var fx = g.createRadialGradient(0, 0, 4, 0, 0, raio);
      fx.addColorStop(0, 'rgba(255,200,40,' + (0.55 * p + 0.15) + ')'); fx.addColorStop(1, 'rgba(255,200,40,0)');
      g.fillStyle = fx; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, raio, -0.32, 0.32); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, raio, Math.PI - 0.32, Math.PI + 0.32); g.closePath(); g.fill();
      g.restore();
    }
    g.fillStyle = '#333'; g.fillRect(lx - 7, ly + 2, 14, 5);
    g.fillStyle = p > 0 && Math.sin(tm * 14) > -0.3 ? '#ffe14d' : '#c99a1a';
    g.beginPath(); g.arc(lx, ly + 2, 7, Math.PI, 0); g.fill();
    if (p > 0) { g.fillStyle = 'rgba(255,240,140,.55)'; g.beginPath(); g.arc(lx, ly, 13, 0, 7); g.fill(); }
    g.restore();
  }

  function rolo(g, T) {   // rolo compressor de brinquedo empurrando a fila
    var B = T.bolas; if (!B.length) return;
    var s = B[B.length - 1].s - RG.D * 1.15;
    if (!RG.visivel(T.tab, s) || s < 6) return;
    var p = RG.ponto(T.tab, s);
    g.save(); g.translate(p.x, p.y); g.rotate(p.a);
    g.fillStyle = 'rgba(50,20,4,.3)'; g.fillRect(-26 + 6, -18 + 6, 34, 36);
    g.fillStyle = '#ffbf1f'; rr(g, -30, -14, 22, 28, 5); g.fill();   // cabine
    g.fillStyle = '#e09c00'; rr(g, -30, -14, 22, 6, 3); g.fill();
    g.fillStyle = '#333'; g.beginPath(); g.arc(-20, 0, 5, 0, 7); g.fill();   // banco
    var gr = g.createLinearGradient(-8, -19, -8, 19);
    gr.addColorStop(0, '#dfe3e6'); gr.addColorStop(0.5, '#8d959c'); gr.addColorStop(1, '#4f565c');
    g.fillStyle = gr; rr(g, -10, -19, 13, 38, 5); g.fill();   // cilindro
    g.fillStyle = '#ffbf1f'; g.fillRect(-12, -21, 17, 4); g.fillRect(-12, 17, 17, 4);
    g.restore();
  }

  function portoes(g, E, tm, sel) {
    galhos.forEach(function (gh) {
      var gp = E.portoes[gh.idx];
      if (gp.longo === gh.longo) return;   // ramo ativo: nada por cima
      // ramo fechado: escurecido, com cancela listrada na entrada
      caminhoPoli(g, gh.tab, gh.de + 30, gh.ate - 10, 6);
      g.strokeStyle = 'rgba(40,22,8,.42)'; g.lineWidth = R * 2 + 8; g.lineCap = 'round'; g.stroke();
      var s = Math.min(gh.de + 46, gh.ate), p = RG.ponto(gh.tab, s);
      g.save(); g.translate(p.x, p.y); g.rotate(p.a + Math.PI / 2);
      g.fillStyle = 'rgba(50,20,4,.35)'; g.fillRect(-R - 8 + 4, -4 + 6, R * 2 + 16, 8);
      g.fillStyle = '#fff'; g.fillRect(-R - 10, -4, R * 2 + 20, 8);
      g.fillStyle = '#e8322b'; for (var x = -R - 10; x < R + 10; x += 10) g.fillRect(x, -4, 5, 8);
      g.fillStyle = '#3a3f44'; g.beginPath(); g.arc(-R - 12, 0, 5, 0, 7); g.fill();
      g.restore();
    });
    E.portoes.forEach(function (gp, i) {
      var x = gp.botao[0], y = gp.botao[1], trav = gp.travado, pulso = 1 + (trav ? 0 : 0.06 * Math.sin(tm * 4));
      g.save(); g.translate(x, y); g.scale(pulso, pulso);
      g.fillStyle = 'rgba(50,20,4,.35)'; g.beginPath(); g.ellipse(SOMBRA.x * 8, SOMBRA.y * 8, 24, 22, 0, 0, 7); g.fill();
      if (sel === i) { g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 29, 0, 7); g.stroke(); }
      g.fillStyle = '#1e2226'; g.beginPath(); g.arc(0, 0, 24, 0, 7); g.fill();
      g.fillStyle = trav ? '#d93a2f' : '#2fae4f'; g.beginPath(); g.arc(0, 0, 20, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(-5, -8, 10, 6, -0.4, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.font = '700 18px Fredoka, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      if (trav) {   // cadeado
        g.strokeStyle = '#fff'; g.lineWidth = 2.6; g.beginPath(); g.arc(0, -3, 5, Math.PI, 0); g.stroke(); g.fillRect(-7, -3, 14, 10);
      } else {
        g.save(); g.rotate(gp.longo ? -0.5 : 0); g.fillRect(-11, -3, 22, 5); g.fillStyle = '#e8322b'; g.fillRect(-6, -3, 4, 5); g.fillRect(2, -3, 4, 5); g.restore();
        g.fillStyle = '#fff'; g.fillRect(-12, 2, 3, 9);
      }
      g.fillStyle = '#ffcc00'; g.beginPath(); g.arc(17, -17, 9, 0, 7); g.fill();
      g.fillStyle = '#1e2226'; g.font = '700 13px Fredoka, system-ui, sans-serif'; g.fillText(String(i + 1), 17, -16.5);
      g.restore();
    });
  }

  function capacete(g, cp, tm) {
    var y = cp.y + Math.sin(tm * 3) * 4, pisca = cp.vida < 2 ? (Math.sin(tm * 18) > 0 ? 1 : 0.35) : 1;
    g.save(); g.globalAlpha = pisca; g.translate(cp.x, y);
    var gl = g.createRadialGradient(0, 0, 4, 0, 0, 46);
    gl.addColorStop(0, 'rgba(255,230,120,.55)'); gl.addColorStop(1, 'rgba(255,230,120,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 46, 0, 7); g.fill();
    g.fillStyle = 'rgba(50,20,4,.3)'; g.beginPath(); g.ellipse(14, 22, 22, 7, 0.3, 0, 7); g.fill();
    var gr = g.createLinearGradient(-20, -20, 18, 12);
    gr.addColorStop(0, '#fff4b8'); gr.addColorStop(0.4, '#ffd23f'); gr.addColorStop(1, '#b97800');
    g.fillStyle = gr;
    g.beginPath(); g.ellipse(0, 8, 26, 7, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(-18, 6); g.bezierCurveTo(-18, -22, 18, -22, 18, 6); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(-3, -16, 6, 20);
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(-8, -8, 4, 7, 0.4, 0, 7); g.fill();
    for (var i = 0; i < 3; i++) {   // brilhinhos
      var an = tm * 2 + i * 2.1, rx = Math.cos(an) * 30, ry = Math.sin(an) * 22 - 4, s = 3 + 2 * Math.sin(tm * 6 + i);
      g.fillStyle = '#fffbe0'; g.beginPath(); g.moveTo(rx, ry - s); g.lineTo(rx + s * 0.3, ry); g.lineTo(rx, ry + s); g.lineTo(rx - s * 0.3, ry); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(rx - s, ry); g.lineTo(rx, ry + s * 0.3); g.lineTo(rx + s, ry); g.lineTo(rx, ry - s * 0.3); g.closePath(); g.fill();
    }
    g.restore();
  }

  /* ---------- quadro ---------- */
  function quadro(ctx, E, lay, tm, ex) {
    ex = ex || {};
    var k = lay.esc * dpr, ox = lay.ox * dpr, oy = lay.oy * dpr, i, j;
    fundoOx = ox; fundoOy = oy;
    var tremX = ex.tremor ? (Math.random() - 0.5) * ex.tremor * dpr : 0, tremY = ex.tremor ? (Math.random() - 0.5) * ex.tremor * dpr : 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (fundo) ctx.drawImage(fundo, tremX, tremY);
    ox += tremX; oy += tremY; fundoOx = ox; fundoOy = oy;
    if (!E) return;
    ctx.setTransform(k, 0, 0, k, ox, oy);
    portoes(ctx, E, tm, ex.portaoSel);
    E.trilhos.forEach(function (T) { cacamba(ctx, T, tm); });
    // linha de mira
    if (!E.fim && !E.perdendo && !E.ganhando) {
      var L = E.lanc, a = L.ang, mx = L.x + Math.cos(a) * 40, my = L.y + Math.sin(a) * 40;
      var max = E.efeitos.prumo > 0 ? 2000 : E.N.mira, alc = RG.alcance(E, a, 2000), comp = Math.min(max, Math.max(0, alc - 40));
      var corM = CORES[L.cor].cor;
      ctx.fillStyle = corM; ctx.globalAlpha = 0.85;
      for (var d = 14; d < comp; d += 16) { ctx.globalAlpha = 0.85 * (1 - d / (Math.min(comp, 700) + 60)); if (ctx.globalAlpha <= 0.05) break; ctx.beginPath(); ctx.arc(mx + Math.cos(a) * d, my + Math.sin(a) * d, 3.2, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
      if (max >= alc && alc < 1990) { ctx.strokeStyle = corM; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(L.x + Math.cos(a) * alc, L.y + Math.sin(a) * alc, 9, 0, 7); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.2; ctx.stroke(); }
    }
    // sombras e tijolos
    E.trilhos.forEach(function (T) {
      var B = T.bolas, tab = T.tab;
      for (i = B.length - 1; i >= 0; i--) { var b = B[i]; if (RG.visivel(tab, b.s)) sombraEm(ctx, b.x, b.y, k, ox, oy); }
      for (i = B.length - 1; i >= 0; i--) {
        b = B[i];
        if (!RG.visivel(tab, b.s)) continue;
        var bx = b.x, by = b.y, esc = 1;
        if (b.de) { var t = b.t; bx = b.de.x + (b.x - b.de.x) * t; by = b.de.y + (b.y - b.de.y) * t; }
        if (b.s > tab.L - RG.D) esc = Math.max(0.3, (tab.L - b.s) / RG.D * 0.5 + 0.5);
        desenharTijolo(ctx, b.c, bx, by, b.s / R, esc, k, ox, oy);
        if (b.poder) {
          var pc = cache.poder[b.poder], pul = 0.9 + 0.12 * Math.sin(tm * 8);
          ctx.setTransform(pul, 0, 0, pul, ox + bx * k, oy + by * k); ctx.drawImage(pc, -pc.width / 2, -pc.height / 2);
          if (b.tPoder < 3 && Math.sin(tm * 16) > 0) { ctx.setTransform(k, 0, 0, k, ox, oy); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, by, R + 2, 0, 7); ctx.stroke(); }
        }
      }
      ctx.setTransform(k, 0, 0, k, ox, oy);
      rolo(ctx, T);
      if (T.ouro && T.ouro.s < tab.L) {
        var o = T.ouro, gl = ctx.createRadialGradient(o.x, o.y, 2, o.x, o.y, 44);
        gl.addColorStop(0, 'rgba(255,220,90,.7)'); gl.addColorStop(1, 'rgba(255,220,90,0)');
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(o.x, o.y, 44, 0, 7); ctx.fill();
        ctx.setTransform(1, 0, 0, 1, ox + o.x * k, oy + o.y * k); ctx.rotate(o.s / R); ctx.drawImage(cache.ouro, -cache.ouro.width / 2, -cache.ouro.height / 2);
        ctx.setTransform(k, 0, 0, k, ox, oy);
      }
    });
    // bocas das manilhas por cima
    ctx.setTransform(k, 0, 0, k, ox, oy);
    bocas.forEach(function (bc) { bocaDoCano(ctx, bc.x, bc.y, bc.a, bc.r); });
    // tiros
    E.tiros.forEach(function (tr) {
      sombraEm(ctx, tr.x, tr.y, k, ox, oy);
      desenharTijolo(ctx, tr.cor, tr.x, tr.y, Math.atan2(tr.vy, tr.vx), 1, k, ox, oy);
    });
    ctx.setTransform(k, 0, 0, k, ox, oy);
    if (E.capacete) capacete(ctx, E.capacete, tm);
    lancador(ctx, E, tm, k);
    // partículas e textos
    ctx.setTransform(k, 0, 0, k, ox, oy);
    var P = ex.particulas || [];
    for (i = 0; i < P.length; i++) {
      var p = P[i], v = p.vida / p.max;
      if (p.tipo === 'poeira') { ctx.globalAlpha = 0.45 * v; ctx.fillStyle = '#e9cfa6'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1.8 - v), 0, 7); ctx.fill(); }
      else if (p.tipo === 'brilho') { ctx.globalAlpha = v; ctx.fillStyle = '#fff3b0'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * v, 0, 7); ctx.fill(); }
      else {
        ctx.globalAlpha = Math.min(1, v * 2); ctx.fillStyle = p.cor;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.beginPath(); ctx.moveTo(-p.r, -p.r * 0.5); ctx.lineTo(p.r * 0.8, -p.r * 0.7); ctx.lineTo(p.r * 0.5, p.r * 0.7); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    var X = ex.textos || [];
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    for (j = 0; j < X.length; j++) {
      var tx = X[j], vv = tx.vida / tx.max, sub = (1 - vv) * 46, sz = tx.grande ? 34 : 24, pop = Math.min(1, (1 - vv) * 8);
      ctx.globalAlpha = Math.min(1, vv * 2.5);
      ctx.font = '700 ' + Math.round(sz * (0.6 + 0.4 * pop)) + 'px Fredoka, system-ui, sans-serif';
      ctx.strokeStyle = 'rgba(40,16,0,.85)'; ctx.lineWidth = 6; ctx.strokeText(tx.txt, tx.x, tx.y - sub);
      ctx.fillStyle = tx.cor || '#fff'; ctx.fillText(tx.txt, tx.x, tx.y - sub);
    }
    ctx.globalAlpha = 1;
  }

  // fundo da tela de começo (só o cenário da fase, sem a fila)
  function capa(ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); if (fundo) ctx.drawImage(fundo, 0, 0); }

  // um tijolo redondo pronto, para os cartões e ícones da página (canvas de px × px)
  function tijoloDOM(c, px) {
    var cv = novoCanvas(px, px), g = cv.getContext('2d'), r = px / 2 - 1, t = texturaMaterial(c, r), b = brilho(r);
    g.drawImage(t, px / 2 - t.width / 2, px / 2 - t.height / 2); g.drawImage(b, px / 2 - b.width / 2, px / 2 - b.height / 2);
    return cv;
  }

  raiz.TijolacoArte = { preparar: preparar, quadro: quadro, capa: capa, tijoloDOM: tijoloDOM };
})(this);
