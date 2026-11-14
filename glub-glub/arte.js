/* GLUB GLUB — desenho em canvas, tudo feito no código (nenhuma imagem de fora).

   O mundo é o das regras (regras.js): altura 1000, largura 1000 × aspecto; o canvas é escalado para desenhar em unidades
   do mundo. O que não mexe (céu, morros, água em camadas, fundo com pedras e corais) é pintado uma vez por tamanho de tela
   num canvas fora da tela. Cada bicho vira uma tira de 6 quadros (o rabo e as nadadeiras mexendo), também pintada uma vez
   por tamanho. A cada quadro só entram as coisas vivas: nuvens, raios de luz, plantas, bolhas, bichos, personagens e linha.

   GlubArte.preparar(canvas, larguraCss, alturaCss, dpr)  → { s } (pixels de tela por unidade do mundo)
   GlubArte.quadro(ctx, E, t)            desenha o estado E das regras no instante t (segundos)
   GlubArte.bicho(ctx, id, x, y, comp, dir, k)   um bicho solto (álbum, capa): comp = comprimento em px do ctx atual
   GlubArte.icone(ctx, tam)              o ícone do jogo num quadrado de tam px */
(function (raiz) {
  'use strict';
  var H = 1000, QUADROS = 6;
  var R = raiz.GlubRegras;
  var A = { W: 1, sup: 270, s: 1, dpr: 1, fundo: null, nuvens: [], sprites: {}, persona: {}, raios: null };

  function tela(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
  function rnd(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function grad(c, x0, y0, x1, y1, paradas) { var g = c.createLinearGradient(x0, y0, x1, y1); paradas.forEach(function (p) { g.addColorStop(p[0], p[1]); }); return g; }
  function radial(c, x, y, r0, r1, paradas) { var g = c.createRadialGradient(x, y, r0, x, y, r1); paradas.forEach(function (p) { g.addColorStop(p[0], p[1]); }); return g; }
  function elipse(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, Math.PI * 2); }
  function escala() { return A.W >= H ? 1.25 : Math.max(0.62, Math.min(1, A.W / 900)); }   // deitado, maiores; em pé, menores

  /* =================================================================== cenário fixo */
  function nuvem(c, x, y, k) {
    c.save(); c.translate(x, y); c.scale(k, k);
    var g = grad(c, 0, -40, 0, 30, [[0, '#ffffff'], [1, '#d9eefb']]);
    c.fillStyle = g;
    [[0, 0, 42, 26], [-38, 8, 30, 20], [38, 6, 34, 22], [-12, -18, 30, 24], [18, -14, 26, 22]].forEach(function (b) { elipse(c, b[0], b[1], b[2], b[3]); c.fill(); });
    c.fillStyle = 'rgba(160,200,230,0.35)'; elipse(c, 0, 20, 62, 8); c.fill();
    c.restore();
  }
  function coqueiro(c, x, y, alt, inclina, escuro) {
    c.save(); c.translate(x, y);
    var topo = { x: inclina * alt, y: -alt };
    c.strokeStyle = escuro ? '#5b4a2e' : '#8a6a3a'; c.lineWidth = alt * 0.07; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(inclina * alt * 0.2, -alt * 0.6, topo.x, topo.y); c.stroke();
    c.strokeStyle = escuro ? 'rgba(0,0,0,0.25)' : 'rgba(60,40,15,0.45)'; c.lineWidth = alt * 0.012;
    for (var i = 1; i < 9; i++) { var f = i / 9, px = inclina * alt * f * f * 0.9, py = -alt * f; c.beginPath(); c.moveTo(px - alt * 0.03, py); c.lineTo(px + alt * 0.03, py + alt * 0.012); c.stroke(); }
    for (var k = 0; k < 7; k++) {
      var ang = -Math.PI / 2 + (k - 3) * 0.48, comp = alt * (0.42 + (k % 2) * 0.08);
      var ex = topo.x + Math.cos(ang) * comp, ey = topo.y + Math.sin(ang) * comp * 0.55 + comp * 0.25;
      c.fillStyle = escuro ? '#2f6b3a' : (k % 2 ? '#3fae4b' : '#2f9440');
      c.beginPath(); c.moveTo(topo.x, topo.y);
      c.quadraticCurveTo((topo.x + ex) / 2 + Math.sin(ang) * comp * 0.18, (topo.y + ey) / 2 - comp * 0.3, ex, ey);
      c.quadraticCurveTo((topo.x + ex) / 2, (topo.y + ey) / 2 - comp * 0.05, topo.x, topo.y); c.fill();
    }
    if (!escuro) { c.fillStyle = '#7a4a1e'; [[-6, 6], [5, 8], [0, 12]].forEach(function (p) { elipse(c, topo.x + p[0] * alt / 120, topo.y + p[1] * alt / 120, alt * 0.04, alt * 0.04); c.fill(); }); }
    c.restore();
  }
  function casinha(c, x, y, k) {
    c.save(); c.translate(x, y); c.scale(k, k);
    c.fillStyle = '#f4ecd8'; c.fillRect(-26, -26, 52, 26);
    c.fillStyle = '#b8462e'; c.beginPath(); c.moveTo(-32, -24); c.lineTo(0, -48); c.lineTo(32, -24); c.closePath(); c.fill();
    c.fillStyle = '#6e3b22'; c.fillRect(-6, -16, 12, 16);
    c.fillStyle = '#4fa3d8'; c.fillRect(12, -20, 9, 8); c.fillRect(-21, -20, 9, 8);
    c.fillStyle = '#8b5a3c'; c.fillRect(14, -52, 6, 14);
    c.restore();
  }
  function pintarFundo() {
    var W = A.W, sup = A.sup, px = A.s * A.dpr, cv = tela(W * px, H * px), c = cv.getContext('2d'), r = rnd(11);
    c.scale(px, px);
    // céu
    c.fillStyle = grad(c, 0, 0, 0, sup, [[0, '#4bb8f2'], [0.65, '#9fe0ff'], [1, '#d8f6ff']]); c.fillRect(0, 0, W, sup);
    c.fillStyle = radial(c, W * 0.5, sup * 0.28, 0, sup * 0.9, [[0, 'rgba(255,250,210,0.95)'], [0.12, 'rgba(255,240,160,0.75)'], [0.35, 'rgba(255,236,170,0.18)'], [1, 'rgba(255,236,170,0)']]);
    c.fillRect(0, 0, W, sup);
    c.fillStyle = '#fff6c9'; elipse(c, W * 0.5, sup * 0.28, 22, 22); c.fill();
    // morros: longe (azulado), perto (verde), barranco com capim
    var linha = sup - 6;
    function morro(cor, base, alturas, seed) {
      var rr = rnd(seed); c.fillStyle = cor; c.beginPath(); c.moveTo(0, linha);
      var n = Math.max(4, Math.round(W / 260));
      for (var i = 0; i <= n; i++) { var x = i / n * W, h = alturas[0] + rr() * alturas[1]; c.quadraticCurveTo(x - W / n / 2, base - h, x, base - h * 0.55); }
      c.lineTo(W, linha); c.closePath(); c.fill();
    }
    morro('#9cd3b0', linha, [45, 55], 3);
    morro('#6cbf6a', linha, [22, 34], 7);
    casinha(c, W * 0.58, linha - 30, 0.75);
    coqueiro(c, W * 0.38, linha - 4, 70, 0.12, true);
    coqueiro(c, W * 0.64, linha - 6, 58, -0.1, true);
    c.fillStyle = grad(c, 0, linha - 12, 0, sup + 2, [[0, '#4fae4f'], [1, '#2f7d3a']]);
    c.beginPath(); c.moveTo(0, sup + 2);
    for (var x = 0; x <= W; x += 40) c.lineTo(x, linha - 6 - Math.sin(x * 0.03) * 4);
    c.lineTo(W, sup + 2); c.closePath(); c.fill();
    // água: clara em cima, escura e mágica embaixo
    c.fillStyle = grad(c, 0, sup, 0, H, [[0, '#3fc4ee'], [0.1, '#239fdc'], [0.42, '#126bb1'], [0.72, '#0b3f82'], [1, '#05173f']]);
    c.fillRect(0, sup, W, H - sup);
    // brilhos mágicos no fundo
    [[0.2, 0.86, 160, 'rgba(120,90,255,0.16)'], [0.75, 0.9, 200, 'rgba(40,220,200,0.12)'], [0.5, 0.97, 260, 'rgba(255,120,220,0.08)']].forEach(function (g) {
      c.fillStyle = radial(c, W * g[0], H * g[1], 0, g[2], [[0, g[3]], [1, 'rgba(0,0,0,0)']]); c.fillRect(0, sup, W, H - sup);
    });
    // fundo: areia escura, pedras e corais
    c.fillStyle = grad(c, 0, 930, 0, H, [[0, '#1b3f6b'], [1, '#0b1e3d']]);
    c.beginPath(); c.moveTo(0, H);
    for (var x2 = 0; x2 <= W; x2 += 30) c.lineTo(x2, 958 + Math.sin(x2 * 0.011) * 12 + Math.sin(x2 * 0.037) * 5);
    c.lineTo(W, H); c.closePath(); c.fill();
    for (var p = 0; p < W / 70; p++) {
      var px2 = r() * W, py = 950 + r() * 40, pr = 14 + r() * 30;
      c.fillStyle = grad(c, px2, py - pr, px2, py + pr * 0.4, [[0, '#4d6f97'], [1, '#18304f']]);
      elipse(c, px2, py, pr, pr * 0.6); c.fill();
      c.fillStyle = 'rgba(160,210,255,0.18)'; elipse(c, px2 - pr * 0.25, py - pr * 0.3, pr * 0.45, pr * 0.18); c.fill();
    }
    for (var k = 0; k < W / 160; k++) coral(c, r() * W, 965 + r() * 20, 26 + r() * 26, ['#ff6fa8', '#ff9a52', '#c77dff', '#5ee6c8'][k % 4], r);
    return cv;
  }
  function coral(c, x, y, h, cor, r) {
    c.save(); c.translate(x, y); c.strokeStyle = cor; c.lineCap = 'round'; c.globalAlpha = 0.75;
    (function galho(len, ang, larg, n) {
      if (n > 3 || len < 4) return;
      c.lineWidth = larg; c.beginPath(); c.moveTo(0, 0); var ex = Math.sin(ang) * len, ey = -Math.cos(ang) * len; c.lineTo(ex, ey); c.stroke();
      c.save(); c.translate(ex, ey); galho(len * 0.68, ang - 0.5 - r() * 0.2, larg * 0.7, n + 1); galho(len * 0.68, ang + 0.45 + r() * 0.2, larg * 0.7, n + 1); c.restore();
    })(h * 0.45, 0, h * 0.14, 0);
    c.restore();
  }

  /* =================================================================== personagens */
  function vara(c, de, para, t) {
    // bambu: do par de mãos até a ponta (a ponta é a das regras), com nós
    var mx = (de.x + para.x) / 2, my = (de.y + para.y) / 2 - 10 + Math.sin(t * 1.7) * 1.5;
    c.lineCap = 'round';
    c.strokeStyle = '#7a5a20'; c.lineWidth = 6.5; c.beginPath(); c.moveTo(de.x, de.y); c.quadraticCurveTo(mx, my, para.x, para.y); c.stroke();
    c.strokeStyle = '#d8b45a'; c.lineWidth = 4.2; c.beginPath(); c.moveTo(de.x, de.y); c.quadraticCurveTo(mx, my, para.x, para.y); c.stroke();
    c.strokeStyle = 'rgba(255,255,230,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(de.x, de.y - 1.2); c.quadraticCurveTo(mx, my - 1.2, para.x, para.y - 1); c.stroke();
    c.fillStyle = '#8a6420';
    for (var i = 1; i < 5; i++) {
      var f = i / 5, ax = (1 - f) * (1 - f) * de.x + 2 * (1 - f) * f * mx + f * f * para.x, ay = (1 - f) * (1 - f) * de.y + 2 * (1 - f) * f * my + f * f * para.y;
      elipse(c, ax, ay, 2.6, 2.6); c.fill();
    }
    // carretilha perto das mãos
    var rx = de.x + (para.x - de.x) * 0.12, ry = de.y + (para.y - de.y) * 0.12 + 6;
    c.fillStyle = '#5b6770'; elipse(c, rx, ry, 6.5, 6.5); c.fill();
    c.fillStyle = '#c9d3da'; elipse(c, rx, ry, 4, 4); c.fill();
    c.strokeStyle = '#2b3237'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx + 5 * Math.cos(t * 6), ry + 5 * Math.sin(t * 6)); c.stroke();
  }
  function rosto(c, x, y, r, pele, olhaDir) {
    c.fillStyle = pele; elipse(c, x, y, r, r * 1.02); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.08)'; elipse(c, x - olhaDir * r * 0.25, y + r * 0.2, r * 0.75, r * 0.7); c.fill();
    elipse(c, x - olhaDir * r * 0.95, y + r * 0.05, r * 0.22, r * 0.28); c.fillStyle = pele; c.fill();   // orelha
    var ox = x + olhaDir * r * 0.28;
    [[-0.32, 0], [0.32, 0]].forEach(function (o) {
      var ex = ox + o[0] * r, ey = y - r * 0.08;
      c.fillStyle = '#2a1a12'; elipse(c, ex, ey, r * 0.13, r * 0.17); c.fill();
      c.fillStyle = '#fff'; elipse(c, ex + r * 0.04, ey - r * 0.06, r * 0.05, r * 0.05); c.fill();
    });
    c.fillStyle = 'rgba(255,110,110,0.45)'; elipse(c, ox - r * 0.5, y + r * 0.28, r * 0.17, r * 0.1); c.fill(); elipse(c, ox + r * 0.5, y + r * 0.28, r * 0.17, r * 0.1); c.fill();
    c.strokeStyle = '#6b2f1c'; c.lineWidth = r * 0.08; c.lineCap = 'round';
    c.beginPath(); c.arc(ox, y + r * 0.22, r * 0.3, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
    c.fillStyle = '#6b2f1c'; elipse(c, ox + olhaDir * r * 0.06, y + r * 0.1, r * 0.06, r * 0.045); c.fill();   // narizinho
  }
  function juca(c, t) {
    // origem: centro do barquinho na linha da água; o menino olha para a direita
    var bob = Math.sin(t * 1.6) * 2.5, rot = Math.sin(t * 1.3) * 0.025;
    c.save(); c.rotate(rot); c.translate(0, bob);
    // sombra na água
    c.fillStyle = 'rgba(0,40,80,0.25)'; elipse(c, 0, 10, 105, 9); c.fill();
    // menino (atrás da borda do barco)
    var pele = '#d79b6c';
    // pernas dobradas e pés descalços
    c.fillStyle = '#2f5d8a'; c.beginPath(); c.moveTo(-34, -32); c.quadraticCurveTo(-2, -58, 18, -40); c.lineTo(22, -26); c.quadraticCurveTo(-6, -40, -30, -18); c.closePath(); c.fill();
    c.fillStyle = '#244a70'; c.fillRect(14, -44, 10, 8);
    c.fillStyle = pele; elipse(c, 27, -28, 9, 6, 0.3); c.fill();
    // tronco com camisa xadrez
    c.save(); c.beginPath(); c.moveTo(-50, -26); c.quadraticCurveTo(-58, -78, -30, -92); c.quadraticCurveTo(-6, -98, 4, -80); c.quadraticCurveTo(10, -50, -8, -26); c.closePath();
    c.fillStyle = '#d9473d'; c.fill(); c.clip();
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 3;
    for (var i = -70; i < 20; i += 9) { c.beginPath(); c.moveTo(i, -100); c.lineTo(i, -20); c.stroke(); c.beginPath(); c.moveTo(-70, i - 30); c.lineTo(20, i - 30); c.stroke(); }
    c.strokeStyle = 'rgba(120,20,20,0.35)'; c.lineWidth = 1.5;
    for (var j = -66; j < 20; j += 9) { c.beginPath(); c.moveTo(j, -100); c.lineTo(j, -20); c.stroke(); }
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(-60, -60, 80, 40);
    c.restore();
    // braços até as mãos (onde a vara começa)
    c.strokeStyle = '#c23d34'; c.lineWidth = 11; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-20, -80); c.quadraticCurveTo(4, -70, 22, -66); c.stroke();
    c.fillStyle = pele; elipse(c, 26, -66, 7.5, 7); c.fill();
    // cabeça
    rosto(c, -24, -118, 25, pele, 1);
    c.fillStyle = '#6a3b1e'; elipse(c, -38, -128, 14, 10, -0.3); c.fill();   // cabelo saindo do chapéu
    c.fillStyle = 'rgba(150,80,40,0.55)'; [[-14, -112], [-8, -114], [-11, -108], [-30, -112]].forEach(function (p) { elipse(c, p[0], p[1], 1.4, 1.4); c.fill(); });   // sardas
    // chapéu de palha
    c.save(); c.translate(-22, -136); c.rotate(-0.08);
    c.fillStyle = grad(c, 0, -30, 0, 8, [[0, '#f6dc8a'], [1, '#c99a3e']]);
    c.beginPath(); c.ellipse(0, 4, 50, 11, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(-26, 2); c.quadraticCurveTo(-24, -30, 0, -32); c.quadraticCurveTo(24, -30, 26, 2); c.closePath(); c.fill();
    c.fillStyle = '#c0392b'; c.fillRect(-26, -6, 52, 7);
    c.strokeStyle = 'rgba(140,95,30,0.45)'; c.lineWidth = 1;
    for (var k = -44; k <= 44; k += 7) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k * 1.08, 9); c.stroke(); }
    for (var m = -22; m <= 22; m += 6) { c.beginPath(); c.moveTo(m, -28 + Math.abs(m) * 0.2); c.lineTo(m * 1.1, -7); c.stroke(); }
    c.restore();
    // capim no canto da boca
    c.strokeStyle = '#8fbf4a'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-10, -108); c.quadraticCurveTo(4, -112, 14, -104 + Math.sin(t * 3) * 2); c.stroke();
    // barquinho de madeira (na frente do menino)
    c.fillStyle = grad(c, 0, -34, 0, 14, [[0, '#b97536'], [0.5, '#8d5226'], [1, '#5b3215']]);
    c.beginPath(); c.moveTo(-104, -32); c.quadraticCurveTo(-96, 12, -40, 14); c.lineTo(46, 14); c.quadraticCurveTo(98, 8, 112, -38); c.quadraticCurveTo(10, -22, -104, -32); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(60,30,10,0.55)'; c.lineWidth = 1.6;
    [-14, -3].forEach(function (yy) { c.beginPath(); c.moveTo(-96, yy - 10); c.quadraticCurveTo(0, yy + 4, 104, yy - 16); c.stroke(); });
    c.fillStyle = '#d99a55'; c.beginPath(); c.moveTo(-106, -34); c.quadraticCurveTo(10, -24, 114, -40); c.lineTo(112, -34); c.quadraticCurveTo(10, -18, -104, -28); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.moveTo(-90, -24); c.quadraticCurveTo(0, -14, 96, -30); c.lineTo(96, -27); c.quadraticCurveTo(0, -10, -90, -20); c.closePath(); c.fill();
    c.restore();
    return { x: 26, y: -66 + bob };   // onde a vara começa
  }
  function lili(c, t) {
    // origem: centro da ilhota na linha da água; a menina senta na beira esquerda e olha para a esquerda
    var bob = Math.sin(t * 1.1) * 1.2;
    c.save();
    c.fillStyle = 'rgba(0,40,80,0.25)'; elipse(c, 20, 10, 125, 10); c.fill();
    // ilhota de areia
    c.fillStyle = grad(c, 0, -40, 0, 10, [[0, '#f8e1a6'], [1, '#d4a75c']]);
    c.beginPath(); c.moveTo(-100, 6); c.quadraticCurveTo(-70, -40, 20, -42); c.quadraticCurveTo(110, -40, 140, 6); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.35)'; elipse(c, 10, -34, 60, 5); c.fill();
    c.fillStyle = '#4aa84a'; [[60, -40], [90, -30], [-40, -32]].forEach(function (p) { for (var i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(p[0] + i * 3, p[1]); c.lineTo(p[0] + i * 5, p[1] - 12 - Math.abs(i) * -2); c.lineTo(p[0] + i * 3 + 2, p[1]); c.fill(); } });
    c.fillStyle = '#ffd1dc'; elipse(c, 108, -8, 4, 3); c.fill(); c.fillStyle = '#fff3c4'; elipse(c, -58, -6, 3.5, 2.5); c.fill();
    coqueiro(c, 92, -36, 140, -0.2, false);
    // menina
    c.translate(0, bob);
    var pele = '#9a5b34';
    // pernas balançando para a água
    var bal = Math.sin(t * 2.2) * 0.25;
    [[-46, 0], [-34, 1]].forEach(function (p, i) {
      c.save(); c.translate(p[0], -34); c.rotate(0.35 + (i ? -bal : bal));
      c.fillStyle = pele; c.fillRect(-4, 0, 9, 30); elipse(c, -3, 31, 8, 5); c.fill(); c.restore();
    });
    // vestido de chita
    c.save(); c.beginPath(); c.moveTo(-64, -30); c.quadraticCurveTo(-60, -84, -36, -94); c.quadraticCurveTo(-12, -90, -6, -66); c.quadraticCurveTo(-2, -40, 4, -30); c.quadraticCurveTo(-30, -24, -64, -30); c.closePath();
    c.fillStyle = '#e23d55'; c.fill(); c.clip();
    for (var fx = -70; fx < 10; fx += 13) for (var fy = -100; fy < -20; fy += 13) {
      var ox = fx + ((fy / 13) % 2 ? 6 : 0);
      c.fillStyle = '#ffd23f'; elipse(c, ox, fy, 2.3, 2.3); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.85)'; for (var pt = 0; pt < 5; pt++) { var a = pt / 5 * Math.PI * 2; elipse(c, ox + Math.cos(a) * 3.4, fy + Math.sin(a) * 3.4, 1.8, 1.8); c.fill(); }
      c.fillStyle = '#2e9e57'; elipse(c, ox + 5, fy + 4, 2, 1); c.fill();
    }
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(-70, -60, 30, 40);
    c.restore();
    // braço até as mãos (a vara vai para a esquerda)
    c.strokeStyle = pele; c.lineWidth = 9; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-40, -82); c.quadraticCurveTo(-58, -74, -70, -66); c.stroke();
    c.fillStyle = '#e23d55'; elipse(c, -40, -84, 9, 7); c.fill();   // manguinha bufante
    c.fillStyle = pele; elipse(c, -73, -65, 7, 6.5); c.fill();
    // cabeça e cabelo: tranças com fita, flor
    c.fillStyle = '#1d120d'; elipse(c, -30, -122, 27, 27); c.fill();
    rosto(c, -36, -118, 23, pele, -1);
    c.fillStyle = '#1d120d';
    c.beginPath(); c.moveTo(-58, -128); c.quadraticCurveTo(-40, -152, -10, -136); c.quadraticCurveTo(-30, -138, -58, -122); c.closePath(); c.fill();   // franja
    [[-6, -110, 1], [-14, -104, -1]].forEach(function (tr, i) {
      c.save(); c.translate(tr[0], tr[1]); c.rotate(0.15 + Math.sin(t * 1.5 + i) * 0.06);
      for (var g = 0; g < 4; g++) { c.fillStyle = '#24160f'; elipse(c, 0, g * 9, 5.5 - g * 0.5, 6); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-4, g * 9 - 2); c.lineTo(4, g * 9 + 3); c.stroke(); }
      c.fillStyle = '#ffd23f'; elipse(c, -4, 38, 5, 3, -0.4); c.fill(); elipse(c, 4, 38, 5, 3, 0.4); c.fill();
      c.restore();
    });
    c.fillStyle = '#ff5fa2'; for (var p2 = 0; p2 < 5; p2++) { var a2 = p2 / 5 * Math.PI * 2; elipse(c, -18 + Math.cos(a2) * 5, -142 + Math.sin(a2) * 5, 4.2, 4.2); c.fill(); }
    c.fillStyle = '#ffe066'; elipse(c, -18, -142, 3, 3); c.fill();
    c.restore();
    return { x: -73, y: -65 + bob };
  }
  // posição de cada personagem: o barquinho à esquerda da ponta da vara, a ilhota à direita
  function lugar(E, j) {
    var pt = R.ponta(E, j), e = escala(), dir = E.j[j].lado === 'dir';
    return { x: pt.x + (dir ? 150 : -122) * e * (A.W >= H ? 1 : 0.85), y: E.sup, e: e, dir: dir };
  }
  function personagem(c, E, j, t) {
    var L = lugar(E, j), pt = R.ponta(E, j);
    c.save(); c.translate(L.x, L.y); c.scale(L.e, L.e);
    var mao = L.dir ? lili(c, t) : juca(c, t);
    c.restore();
    vara(c, { x: L.x + mao.x * L.e, y: L.y + mao.y * L.e }, pt, t);
  }

  /* =================================================================== bichos */
  // Cada desenho fica num espaço de comprimento 100, centrado em (0, 0), de frente para a direita. k = fase do nado (0..1).
  function peixeBase(c, p, k) {
    var w = Math.sin(k * Math.PI * 2), a = p.alt * 50;
    // rabo
    c.save(); c.translate(-38, 0); c.rotate(w * 0.32);
    c.fillStyle = p.rabo; c.globalAlpha = 0.92;
    c.beginPath(); c.moveTo(4, -a * 0.18); c.quadraticCurveTo(-10, -a * 0.6, -22, -a * 0.95 - 4); c.quadraticCurveTo(-14, -a * 0.2, -12, 0); c.quadraticCurveTo(-14, a * 0.2, -22, a * 0.95 + 4); c.quadraticCurveTo(-10, a * 0.6, 4, a * 0.18); c.closePath(); c.fill();
    c.globalAlpha = 1; c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 0.8;
    for (var i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(2, i * a * 0.05); c.lineTo(-18, i * a * 0.28); c.stroke(); }
    c.restore();
    // nadadeira de cima e de baixo
    c.fillStyle = p.nad; c.globalAlpha = 0.85;
    c.beginPath(); c.moveTo(-14, -a * 0.82); c.quadraticCurveTo(-4 + w * 2, -a - 14, 14, -a * 0.96); c.quadraticCurveTo(4, -a * 0.75, -14, -a * 0.6); c.fill();
    c.beginPath(); c.moveTo(-22, a * 0.6); c.quadraticCurveTo(-18 - w * 2, a + 8, -6, a * 0.86); c.closePath(); c.fill();
    c.globalAlpha = 1;
    // corpo
    function corpo() { c.beginPath(); c.moveTo(50, 2); c.bezierCurveTo(44, -a * 0.9, 0, -a * 1.12, -38, -a * 0.2); c.lineTo(-38, a * 0.2); c.bezierCurveTo(0, a * 1.12, 44, a * 0.95, 50, 2); c.closePath(); }
    corpo(); c.fillStyle = grad(c, 0, -a, 0, a, [[0, p.dorso], [0.55, p.meio], [1, p.ventre]]); c.fill();
    c.save(); corpo(); c.clip();
    // escamas
    for (var x = -34; x < 26; x += 6) for (var y = -a; y < a; y += 6) {
      var yy = y + ((x / 6) % 2 ? 3 : 0);
      c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 0.7; c.beginPath(); c.arc(x, yy, 4, -0.9, 0.9); c.stroke();
      c.strokeStyle = 'rgba(0,20,40,0.08)'; c.beginPath(); c.arc(x - 1, yy, 4, -0.9, 0.9); c.stroke();
    }
    if (p.desenho) p.desenho(c, a);
    c.fillStyle = 'rgba(255,255,255,0.28)'; elipse(c, 6, -a * 0.52, 30, a * 0.18); c.fill();
    c.fillStyle = 'rgba(0,10,30,0.18)'; elipse(c, -2, a * 0.85, 46, a * 0.3); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(24, -a * 0.1); c.quadraticCurveTo(-5, -a * 0.2, -34, 0); c.stroke();
    c.restore();
    corpo(); c.strokeStyle = p.contorno || 'rgba(0,25,55,0.6)'; c.lineWidth = 1.5; c.stroke();
    // guelra
    c.strokeStyle = 'rgba(0,20,40,0.35)'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(25, -a * 0.62); c.quadraticCurveTo(18, 0, 25, a * 0.62); c.stroke();
    // nadadeira do peito
    c.save(); c.translate(16, a * 0.25); c.rotate(0.5 + w * 0.25);
    c.fillStyle = p.nad; c.globalAlpha = 0.75; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-12, 4, -16, 12); c.quadraticCurveTo(-6, 9, 0, 3); c.fill(); c.restore();
    // olho
    var ex = 36, ey = -a * 0.18, er = Math.max(5, a * 0.24);
    c.fillStyle = '#fff'; elipse(c, ex, ey, er, er); c.fill();
    c.fillStyle = p.iris || '#e8a317'; elipse(c, ex + 0.6, ey, er * 0.72, er * 0.72); c.fill();
    c.fillStyle = '#111'; elipse(c, ex + 1, ey, er * 0.42, er * 0.42); c.fill();
    c.fillStyle = '#fff'; elipse(c, ex - er * 0.2, ey - er * 0.32, er * 0.24, er * 0.24); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 0.8; elipse(c, ex, ey, er, er); c.stroke();
    // boca
    if (p.boca) p.boca(c, a); else { c.strokeStyle = 'rgba(40,10,10,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(50, 4); c.quadraticCurveTo(46, 7, 42, 6); c.stroke(); }
  }
  function tubaraoBase(c, p, k) {
    var w = Math.sin(k * Math.PI * 2), a = p.alt * 50;
    // rabo de tubarão: lobo de cima maior
    c.save(); c.translate(-40, -2); c.rotate(w * 0.22);
    c.fillStyle = p.dorso; c.beginPath(); c.moveTo(6, -a * 0.25); c.quadraticCurveTo(-10, -a * 0.9, -20, -a * 1.7); c.quadraticCurveTo(-14, -a * 0.4, -8, 0); c.quadraticCurveTo(-12, a * 0.5, -16, a * 0.9); c.quadraticCurveTo(-4, a * 0.4, 6, a * 0.25); c.closePath(); c.fill();
    c.restore();
    // barbatana de cima
    c.fillStyle = p.dorso; c.beginPath(); c.moveTo(-6, -a * 0.85); c.quadraticCurveTo(0, -a * 1.8, 6, -a * 2.05); c.quadraticCurveTo(10, -a * 1.3, 18, -a * 0.88); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-28, -a * 0.4); c.lineTo(-24, -a * 0.95); c.lineTo(-20, -a * 0.4); c.fill();
    function corpo() { c.beginPath(); c.moveTo(52, 2); c.bezierCurveTo(46, -a * 0.9, 10, -a * 1.02, -42, -a * 0.25); c.lineTo(-42, a * 0.2); c.bezierCurveTo(6, a * 1.05, 40, a * 0.7, 52, 2); c.closePath(); }
    corpo(); c.fillStyle = grad(c, 0, -a, 0, a, [[0, p.dorso], [0.5, p.meio], [0.56, p.ventre], [1, p.ventre]]); c.fill();
    c.save(); corpo(); c.clip();
    if (p.desenho) p.desenho(c, a);
    c.fillStyle = 'rgba(255,255,255,0.22)'; elipse(c, 4, -a * 0.55, 34, a * 0.16); c.fill();
    c.restore();
    corpo(); c.strokeStyle = 'rgba(10,25,45,0.6)'; c.lineWidth = 1.5; c.stroke();
    // guelras
    c.strokeStyle = 'rgba(10,25,45,0.45)'; c.lineWidth = 1.1;
    for (var g = 0; g < 4; g++) { c.beginPath(); c.moveTo(24 - g * 4, -a * 0.35); c.quadraticCurveTo(21 - g * 4, 0, 24 - g * 4, a * 0.3); c.stroke(); }
    // nadadeira do peito comprida
    c.save(); c.translate(14, a * 0.45); c.rotate(0.55 + w * 0.12);
    c.fillStyle = p.dorso; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-10, 10, -26, 22); c.quadraticCurveTo(-10, 6, 6, 0); c.fill(); c.restore();
    if (p.cabeca) p.cabeca(c, a);
    else {
      c.fillStyle = '#0b0f14'; elipse(c, 38, -a * 0.25, 3.2, 3.2); c.fill(); c.fillStyle = '#fff'; elipse(c, 37.2, -a * 0.33, 1.1, 1.1); c.fill();
      c.strokeStyle = 'rgba(20,10,10,0.6)'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(48, a * 0.25); c.quadraticCurveTo(38, a * 0.45, 28, a * 0.35); c.stroke();
    }
  }
  function sereia(c, k) {
    var w = Math.sin(k * Math.PI * 2), pele = '#b87342';
    // cabelo comprido em mechas, flutuando para trás
    c.strokeStyle = '#140c08'; c.lineCap = 'round';
    for (var i = 0; i < 6; i++) {
      c.lineWidth = 3.4 - i * 0.3;
      c.beginPath(); c.moveTo(32, -22 + i * 1.6);
      c.bezierCurveTo(20, -27 + i * 2 + w * 2, 6, -18 + i * 2 - w * 3, -8 - i * 2, -20 + i * 3 + w * 5);
      c.stroke();
    }
    c.strokeStyle = 'rgba(140,110,200,0.35)'; c.lineWidth = 0.8;
    for (var i2 = 0; i2 < 3; i2++) { c.beginPath(); c.moveTo(30, -22 + i2 * 3); c.bezierCurveTo(18, -26 + i2 * 3 + w * 2, 6, -17 + i2 * 3 - w * 3, -6 - i2 * 2, -18 + i2 * 3 + w * 5); c.stroke(); }
    // cauda de peixe com escamas
    c.save(); c.translate(0, 2);
    function cauda() { c.beginPath(); c.moveTo(4, -9); c.bezierCurveTo(-16, -12, -32, -4 + w * 3, -42, -2 + w * 5); c.lineTo(-42, 4 + w * 5); c.bezierCurveTo(-30, 6 + w * 3, -16, 12, 4, 9); c.closePath(); }
    cauda(); c.fillStyle = grad(c, 0, -10, 0, 10, [[0, '#0fa58c'], [0.5, '#2ee6b8'], [1, '#0b7a73']]); c.fill();
    c.save(); cauda(); c.clip();
    for (var x = -42; x < 6; x += 4) for (var y = -12; y < 12; y += 4) { c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 0.6; c.beginPath(); c.arc(x, y + ((x / 4) % 2 ? 2 : 0), 3, 0.6, 2.5); c.stroke(); }
    c.restore();
    c.save(); c.translate(-42, 1 + w * 5); c.rotate(w * 0.35);
    c.fillStyle = 'rgba(126,240,208,0.85)'; c.beginPath(); c.moveTo(2, 0); c.quadraticCurveTo(-8, -18, -18, -22); c.quadraticCurveTo(-10, -4, -12, 0); c.quadraticCurveTo(-10, 4, -18, 22); c.quadraticCurveTo(-8, 18, 2, 0); c.fill();
    c.restore();
    c.restore();
    // tronco, braços e top de conchinhas
    c.fillStyle = pele; c.beginPath(); c.moveTo(2, -9); c.quadraticCurveTo(14, -14, 26, -10); c.quadraticCurveTo(30, 0, 24, 8); c.quadraticCurveTo(12, 12, 2, 10); c.closePath(); c.fill();
    [[15, -5], [19, -1]].forEach(function (q) { c.fillStyle = '#ffa0c0'; c.beginPath(); c.moveTo(q[0], q[1] + 2.6); c.lineTo(q[0] - 2.8, q[1] - 1.4); c.quadraticCurveTo(q[0], q[1] - 3.6, q[0] + 2.8, q[1] - 1.4); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(160,50,90,0.6)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(q[0], q[1] + 2.4); c.lineTo(q[0], q[1] - 2.6); c.moveTo(q[0], q[1] + 2.4); c.lineTo(q[0] - 1.6, q[1] - 2); c.moveTo(q[0], q[1] + 2.4); c.lineTo(q[0] + 1.6, q[1] - 2); c.stroke(); });
    c.strokeStyle = pele; c.lineWidth = 3.6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(22, -8); c.quadraticCurveTo(34, -10 + w * 2, 46, -4 + w * 3); c.stroke();
    c.beginPath(); c.moveTo(20, 6); c.quadraticCurveTo(30, 12, 40, 10 - w * 2); c.stroke();
    // cabeça
    c.fillStyle = pele; elipse(c, 36, -16, 10.5, 10); c.fill();
    c.fillStyle = '#140c08'; c.beginPath(); c.moveTo(27, -18); c.quadraticCurveTo(32, -30, 44, -22); c.quadraticCurveTo(38, -24, 30, -12); c.closePath(); c.fill();
    c.strokeStyle = '#2a1a12'; c.lineWidth = 1.2; c.beginPath(); c.arc(40, -16, 2.2, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();   // olho fechadinho, feliz
    c.fillStyle = 'rgba(255,110,120,0.5)'; elipse(c, 41, -11.5, 2.4, 1.4); c.fill();
    c.strokeStyle = '#7a2a20'; c.lineWidth = 1; c.beginPath(); c.arc(42, -10, 2, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
    c.fillStyle = '#fff'; for (var f = 0; f < 5; f++) { var a = f / 5 * Math.PI * 2; elipse(c, 30 + Math.cos(a) * 2.6, -24 + Math.sin(a) * 2.6, 2.1, 2.1); c.fill(); }
    c.fillStyle = '#ffcf33'; elipse(c, 30, -24, 1.6, 1.6); c.fill();
  }

  var PINTA = {
    lambari: function (c, k) { peixeBase(c, { alt: 0.42, dorso: '#5f8fa6', meio: '#c7d8e2', ventre: '#f6fbff', nad: '#ff9b2f', rabo: '#ffc21a', iris: '#d9a21b',
      desenho: function (c, a) { c.fillStyle = 'rgba(15,20,30,0.85)'; elipse(c, -26, 0, 5, a * 0.32); c.fill(); elipse(c, 14, -a * 0.1, 3.5, a * 0.22); c.fill();
        c.fillStyle = 'rgba(255,180,40,0.35)'; c.fillRect(-36, -2, 60, 3); } }, k); },
    pacu: function (c, k) { peixeBase(c, { alt: 0.72, dorso: '#4c5b62', meio: '#9aa5a8', ventre: '#ff7a45', nad: '#f2683a', rabo: '#e0582f', iris: '#e4c35a',
      desenho: function (c, a) { c.fillStyle = 'rgba(255,90,40,0.35)'; elipse(c, 10, a * 0.7, 40, a * 0.35); c.fill(); },
      boca: function (c, a) { c.fillStyle = '#5a1e14'; elipse(c, 47, 6, 4.5, 3.4); c.fill(); c.fillStyle = '#fffbea'; c.fillRect(46, 3, 2.6, 3.4); c.fillRect(48.8, 3.3, 2.4, 3.2); } }, k); },
    martelo: function (c, k) { tubaraoBase(c, { alt: 0.38, dorso: '#53708f', meio: '#7d98b2', ventre: '#eef4f8',
      cabeca: function (c, a) {
        // a "cabeça de martelo": uma barra larga na frente, com um olho em cada ponta
        var top = -a * 1.75, bot = a * 1.45;
        c.fillStyle = grad(c, 44, 0, 62, 0, [[0, '#4a6584'], [1, '#6a87a6']]);
        c.beginPath(); c.moveTo(42, -a * 0.45); c.quadraticCurveTo(44, top, 52, top - 2); c.quadraticCurveTo(62, top, 62, top + 6);
        c.quadraticCurveTo(64, 0, 61, bot - 6); c.quadraticCurveTo(60, bot + 2, 52, bot + 1); c.quadraticCurveTo(46, bot, 44, a * 0.4); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(10,25,45,0.65)'; c.lineWidth = 1.4; c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.moveTo(50, top + 2); c.quadraticCurveTo(58, top + 1, 58, top + 8); c.lineTo(55, -a * 0.2); c.closePath(); c.fill();
        [top + 5, bot - 5].forEach(function (yy) { c.fillStyle = '#fff'; elipse(c, 58, yy, 3, 3); c.fill(); c.fillStyle = '#0b0f14'; elipse(c, 58.8, yy, 1.9, 1.9); c.fill(); c.fillStyle = '#fff'; elipse(c, 58.2, yy - 0.8, 0.7, 0.7); c.fill(); });
        c.strokeStyle = 'rgba(20,10,10,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(52, a * 0.5); c.quadraticCurveTo(46, a * 0.62, 40, a * 0.48); c.stroke();
      } }, k); },
    sereia: sereia
  };
  // bicho ainda sem desenho próprio: um peixe colorido com a cor da faixa (para a vitrine nunca ficar em branco)
  var COR_FAIXA = { 0: ['#7a8a99', '#c9d2da'], 1: ['#3f86c6', '#cfe8ff'], 2: ['#5b7a3a', '#e8f0c0'], 3: ['#8a6a3a', '#f0dcb0'], 4: ['#6a3fa0', '#e5d4ff'], 5: ['#24496e', '#d6e6f5'], 6: ['#c98a10', '#fff0b0'] };
  function pintarBicho(c, id, k) {
    if (PINTA[id]) { PINTA[id](c, k); return; }
    var d = R.POR_ID[id] || { faixa: 1, alt: 0.5 }, cor = COR_FAIXA[d.faixa] || COR_FAIXA[1];
    peixeBase(c, { alt: d.alt, dorso: cor[0], meio: cor[1], ventre: '#ffffff', nad: cor[0], rabo: cor[0] }, k);
  }
  // a tira de quadros de um bicho, num tamanho (px de comprimento)
  function sprite(id, comp) {
    var chave = id + ':' + Math.round(comp), sp = A.sprites[chave];
    if (sp) return sp;
    var d = R.POR_ID[id] || { alt: 0.5 }, w = comp * 1.5, h = comp * Math.max(0.9, d.alt * 2.2), cv = tela(w * QUADROS, h), c = cv.getContext('2d');
    for (var q = 0; q < QUADROS; q++) { c.save(); c.translate(w * q + w / 2, h / 2); c.scale(comp / 100, comp / 100); pintarBicho(c, id, q / QUADROS); c.restore(); }
    sp = A.sprites[chave] = { cv: cv, w: w, h: h };
    return sp;
  }
  function desenharBicho(c, id, x, y, comp, dir, k, giro) {
    var px = A.s * A.dpr, sp = sprite(id, comp * px), q = Math.floor(((k % 1) + 1) % 1 * QUADROS);
    c.save(); c.translate(x, y); if (giro) c.rotate(giro); if (dir < 0) c.scale(-1, 1);
    c.drawImage(sp.cv, sp.w * q, 0, sp.w, sp.h, -sp.w / px / 2, -sp.h / px / 2, sp.w / px, sp.h / px);
    c.restore();
  }

  /* =================================================================== coisas vivas */
  var vivos = null;
  function prepararVivos() {
    var r = rnd(29), W = A.W;
    vivos = { bolhas: [], luzes: [], plantas: [], nuvens: [] };
    for (var i = 0; i < 26; i++) vivos.bolhas.push({ x: r() * W, y: A.sup + r() * (H - A.sup), r: 2 + r() * 5, v: 20 + r() * 40, f: r() * 6 });
    for (var j = 0; j < 34; j++) vivos.luzes.push({ x: r() * W, y: A.sup + (0.45 + r() * 0.5) * (H - A.sup), r: 1 + r() * 2.2, f: r() * 6, cor: ['#9ff', '#f9f', '#ff9', '#9f9'][j % 4] });
    for (var k = 0; k < W / 110; k++) vivos.plantas.push({ x: r() * W, h: 50 + r() * 90, f: r() * 6, cor: ['#2fae6a', '#1f8f5e', '#45c48a', '#7c5cd6'][k % 4] });
    for (var n = 0; n < 4; n++) vivos.nuvens.push({ x: r() * W, y: 30 + r() * (A.sup * 0.45), k: 0.6 + r() * 0.6, v: 4 + r() * 6 });
  }
  function desenharVivosAtras(c, t) {
    var W = A.W, sup = A.sup;
    vivos.nuvens.forEach(function (n) { var x = ((n.x + t * n.v) % (W + 200)) - 100; nuvem(c, x, n.y, n.k); });
    // raios de luz
    c.save(); c.globalCompositeOperation = 'lighter';
    for (var i = 0; i < 6; i++) {
      var x0 = (i + 0.5) / 6 * W + Math.sin(t * 0.2 + i) * 30, al = 0.05 + 0.035 * Math.sin(t * 0.6 + i * 1.7);
      c.fillStyle = grad(c, 0, sup, 0, sup + 520, [[0, 'rgba(220,250,255,' + al.toFixed(3) + ')'], [1, 'rgba(220,250,255,0)']]);
      c.beginPath(); c.moveTo(x0 - 26, sup); c.lineTo(x0 + 26, sup); c.lineTo(x0 + 130, sup + 520); c.lineTo(x0 + 30, sup + 520); c.closePath(); c.fill();
    }
    vivos.luzes.forEach(function (l) { var a = 0.35 + 0.35 * Math.sin(t * 2 + l.f); c.fillStyle = l.cor; c.globalAlpha = a; elipse(c, l.x, l.y + Math.sin(t + l.f) * 6, l.r, l.r); c.fill(); });
    c.restore();
    // plantas que balançam
    vivos.plantas.forEach(function (p) {
      c.strokeStyle = p.cor; c.lineCap = 'round';
      for (var f = 0; f < 3; f++) {
        var x = p.x + f * 7 - 7, s = Math.sin(t * 1.2 + p.f + f) * 14;
        c.lineWidth = 5 - f; c.beginPath(); c.moveTo(x, 985); c.bezierCurveTo(x + s * 0.3, 985 - p.h * 0.35, x - s * 0.6, 985 - p.h * 0.7, x + s, 985 - p.h * (0.85 + f * 0.08)); c.stroke();
      }
    });
  }
  function desenharVivosFrente(c, t) {
    var W = A.W, sup = A.sup;
    vivos.bolhas.forEach(function (b) {
      var y = H - ((H - b.y + t * b.v) % (H - sup - 10)), x = b.x + Math.sin(t * 1.5 + b.f) * 6;
      c.strokeStyle = 'rgba(220,250,255,0.55)'; c.lineWidth = 1.2; elipse(c, x, y, b.r, b.r); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.55)'; elipse(c, x - b.r * 0.35, y - b.r * 0.35, b.r * 0.3, b.r * 0.3); c.fill();
    });
    // superfície: brilho e ondinhas
    c.fillStyle = 'rgba(210,248,255,0.55)'; c.beginPath(); c.moveTo(0, sup - 3);
    for (var x = 0; x <= W; x += 16) c.lineTo(x, sup - 3 + Math.sin(x * 0.045 + t * 2.2) * 2.4);
    for (var x2 = W; x2 >= 0; x2 -= 16) c.lineTo(x2, sup + 4 + Math.sin(x2 * 0.05 + t * 1.7) * 2);
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.8)';
    for (var s = 0; s < W / 90; s++) { var sx = (s * 97.3 + t * 18) % W, a = Math.max(0, Math.sin(t * 3 + s)); if (a > 0.6) { elipse(c, sx, sup - 1, 6 * a, 1.2); c.fill(); } }
  }

  /* =================================================================== linha, anzol, bolhas de poder */
  function linhaEAnzol(c, E, j, t) {
    var pt = R.ponta(E, j), a = E.j[j].anzol;
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(pt.x, pt.y); c.lineTo(a.x, a.y); c.stroke();
    var ang = a.fase === 'balanca' ? a.ang : a.dirAng;
    c.save(); c.translate(a.x, a.y); c.rotate(-ang);
    // minhoca
    if (!a.presos.length) { c.strokeStyle = '#ff7d9c'; c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-5, 10); c.bezierCurveTo(-11, 14 + Math.sin(t * 6) * 3, -4, 20, -8, 24 + Math.sin(t * 5) * 2); c.stroke(); }
    c.strokeStyle = '#dfe6ec'; c.lineWidth = 2.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 16); c.arc(-5, 16, 5, 0, Math.PI, false); c.lineTo(-10, 12); c.stroke();
    c.strokeStyle = '#7b8a96'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(1, 2); c.lineTo(1, 15); c.stroke();
    c.restore();
  }
  var ICONE_PODER = { rede: '🕸️', ligeiro: '⚡', minhoca: '🪱' };
  function bolhaPoder(c, b, t) {
    var r = 26 + Math.sin(t * 3) * 1.5;
    c.fillStyle = radial(c, b.x - r * 0.3, b.y - r * 0.3, 2, r, [[0, 'rgba(255,255,255,0.65)'], [0.5, 'rgba(160,230,255,0.25)'], [1, 'rgba(120,200,255,0.45)']]);
    elipse(c, b.x, b.y, r, r); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1.6; c.stroke();
    c.font = Math.round(r * 1.05) + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(ICONE_PODER[b.id] || '✨', b.x, b.y + 1);
  }

  /* =================================================================== API */
  function preparar(canvas, larg, alt, dpr) {
    A.dpr = Math.min(2, dpr || 1); A.s = alt / H; A.W = H * larg / alt; A.sup = A.W >= H ? 270 : 230;
    canvas.width = Math.round(larg * A.dpr); canvas.height = Math.round(alt * A.dpr);
    A.sprites = {}; A.fundo = pintarFundo(); prepararVivos();
    return { s: A.s, W: A.W };
  }
  function quadro(c, E, t) {
    var px = A.s * A.dpr;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(A.fundo, 0, 0);
    c.setTransform(px, 0, 0, px, 0, 0);
    desenharVivosAtras(c, t);
    var lista = E.bichos.slice().sort(function (p, q) { return (q.faixa - p.faixa) || (p.n - q.n); });
    lista.forEach(function (o) {
      if (o.preso != null) return;
      desenharBicho(c, o.id, o.x, o.y, o.tam * H * E.esc, o.dir, t * (o.v ? 1.6 : 0.4) + o.fase, 0);
    });
    E.bolhas.forEach(function (b) { bolhaPoder(c, b, t); });
    desenharVivosFrente(c, t);
    for (var j = 0; j < E.j.length; j++) {
      E.j[j].anzol.presos.forEach(function (o) { desenharBicho(c, o.id, o.x, o.y, o.tam * H * E.esc, 1, t * 5 + o.fase, -Math.PI / 2 + Math.sin(t * 14 + o.fase) * 0.35); });
      personagem(c, E, j, t);
      linhaEAnzol(c, E, j, t);
    }
  }
  function bicho(c, id, x, y, comp, dir, k) {
    c.save(); c.translate(x, y); if (dir < 0) c.scale(-1, 1); c.scale(comp / 100, comp / 100); pintarBicho(c, id, k || 0); c.restore();
  }
  function icone(c, tam) {
    c.save(); c.scale(tam / 100, tam / 100);
    c.fillStyle = grad(c, 0, 0, 0, 100, [[0, '#3fc4ee'], [0.55, '#126bb1'], [1, '#0b3f82']]); c.fillRect(0, 0, 100, 100);
    c.fillStyle = 'rgba(255,255,255,0.5)'; [[20, 22, 6], [30, 12, 4], [80, 18, 5], [86, 32, 3]].forEach(function (b) { elipse(c, b[0], b[1], b[2], b[2]); c.fill(); });
    c.restore();
    bicho(c, 'pacu', tam * 0.5, tam * 0.58, tam * 0.78, 1, 0.2);
  }

  raiz.GlubArte = { preparar: preparar, quadro: quadro, bicho: bicho, icone: icone, lugar: lugar };
})(this);
