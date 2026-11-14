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
  var H = 1000, QUADROS = 16;
  var R = raiz.GlubRegras;
  var A = { W: 1, sup: 270, s: 1, dpr: 1, fundo: null, nuvens: [], sprites: {}, persona: {}, raios: null, per: null, cen: 'roca' };
  // horas do dia: as cores do céu, das serras, dos morros, da água e da luz
  var PERIODOS = {
    dia:   { ceu: ['#4bb8f2', '#9fe0ff', '#d8f6ff'], astro: '#fff6c9', brilho: [255, 245, 190], astroY: 0.28, serra: ['#a9c8e8', '#8fb8cf'], morro: ['#86c99a', '#5fb35f'],
             barranco: ['#4fae4f', '#2f7d3a'], agua: '#4fd0f4', agua2: '#28a8e2', luz: [235, 255, 255], nuvem: ['#ffffff', '#d9eefb'], veu: null, estrelas: false },
    tarde: { ceu: ['#ff7a59', '#ffae73', '#ffe0a8'], astro: '#fff0b0', brilho: [255, 190, 110], astroY: 0.66, serra: ['#d98b86', '#b9706e'], morro: ['#9c8a52', '#76703a'],
             barranco: ['#6f8a3a', '#4c5e26'], agua: '#5ab8d8', agua2: '#3a90c0', luz: [255, 225, 175], nuvem: ['#ffd9c0', '#f59a8a'], veu: 'rgba(255,140,70,0.10)', estrelas: false },
    noite: { ceu: ['#08142f', '#15295c', '#2d4680'], astro: '#f4f6ff', brilho: [190, 210, 255], astroY: 0.16, serra: ['#22335e', '#1b2a50'], morro: ['#17403f', '#123533'],
             barranco: ['#123a2e', '#0c2a20'], agua: '#1d5a96', agua2: '#164a82', luz: [190, 215, 255], nuvem: ['#3a4a78', '#26345e'], veu: 'rgba(5,10,45,0.38)', estrelas: true }
  };

  function tela(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
  function rnd(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function grad(c, x0, y0, x1, y1, paradas) { var g = c.createLinearGradient(x0, y0, x1, y1); paradas.forEach(function (p) { g.addColorStop(p[0], p[1]); }); return g; }
  function radial(c, x, y, r0, r1, paradas) { var g = c.createRadialGradient(x, y, r0, x, y, r1); paradas.forEach(function (p) { g.addColorStop(p[0], p[1]); }); return g; }
  function elipse(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, Math.PI * 2); }
  function escala() { return A.W >= H ? 1.25 : Math.max(0.62, Math.min(1, A.W / 900)); }   // deitado, maiores; em pé, menores

  /* =================================================================== cenário fixo */
  function nuvem(c, x, y, k) {
    c.save(); c.translate(x, y); c.scale(k, k);
    var nc = (A.per || PERIODOS.dia).nuvem, g = grad(c, 0, -40, 0, 30, [[0, nc[0]], [1, nc[1]]]);
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
    var P = A.per, S0 = sol(), b = P.brilho.join(',');
    c.fillStyle = grad(c, 0, 0, 0, sup, [[0, P.ceu[0]], [0.65, P.ceu[1]], [1, P.ceu[2]]]); c.fillRect(0, 0, W, sup);
    if (P.estrelas) { for (var st = 0; st < W / 6; st++) { c.fillStyle = 'rgba(255,255,255,' + (0.3 + r() * 0.7).toFixed(2) + ')'; elipse(c, r() * W, r() * sup * 0.8, 0.6 + r() * 1.2, 0.6 + r() * 1.2); c.fill(); } }
    c.fillStyle = radial(c, S0.x, S0.y, 0, sup * 0.9, [[0, 'rgba(' + b + ',0.95)'], [0.12, 'rgba(' + b + ',0.7)'], [0.35, 'rgba(' + b + ',0.18)'], [1, 'rgba(' + b + ',0)']]);
    c.fillRect(0, 0, W, sup);
    c.fillStyle = P.astro; elipse(c, S0.x, S0.y, P.estrelas ? 18 : 22, P.estrelas ? 18 : 22); c.fill();
    if (P.estrelas) { c.fillStyle = 'rgba(160,170,200,0.45)'; [[-5, -4, 4], [6, 3, 3], [-2, 7, 2.4]].forEach(function (q) { elipse(c, S0.x + q[0], S0.y + q[1], q[2], q[2]); c.fill(); }); }
    // morros: longe (azulado), perto (verde), barranco com capim
    var linha = sup - 6;
    function morro(cor, base, alturas, seed) {
      var rr = rnd(seed); c.fillStyle = cor; c.beginPath(); c.moveTo(0, linha);
      var n = Math.max(4, Math.round(W / 260));
      for (var i = 0; i <= n; i++) { var x = i / n * W, h = alturas[0] + rr() * alturas[1]; c.quadraticCurveTo(x - W / n / 2, base - h, x, base - h * 0.55); }
      c.lineTo(W, linha); c.closePath(); c.fill();
    }
    function serra(cor, base, alt, varia, seed, pontas) {
      var rr = rnd(seed); c.fillStyle = cor; c.beginPath(); c.moveTo(0, base);
      var n = Math.max(5, Math.round(W / (pontas || 140))), x = 0;
      for (var i = 0; i <= n; i++) { var nx = i / n * W, h = alt + rr() * varia; c.lineTo((x + nx) / 2, base - h); c.lineTo(nx, base - h * (0.55 + rr() * 0.2)); x = nx; }
      c.lineTo(W, base); c.closePath(); c.fill();
    }
    if (A.cen === 'mar') {   // mar aberto: a linha do mar ao longe, com uma ilha
      c.fillStyle = P.serra[0]; elipse(c, W * 0.78, linha + 2, 90, 26); c.fill(); elipse(c, W * 0.74, linha + 2, 50, 34); c.fill();
      coqueiro(c, W * 0.76, linha - 22, 40, 0.1, true);
      c.fillStyle = grad(c, 0, linha - 20, 0, sup, [[0, P.agua2], [1, P.agua]]); c.fillRect(0, linha - 14, W, sup - linha + 16);
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1.2; for (var o2 = 0; o2 < W / 30; o2++) { var wx = r() * W, wy = linha - 10 + r() * 14; c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + 10 + r() * 16, wy); c.stroke(); }
    } else if (A.cen === 'serra') {   // serra: montanhas grandes em camadas
      serra(P.serra[0], linha, 120, 80, 31, 260);
      serra(P.serra[1], linha, 80, 60, 33, 180);
      morro(P.morro[0], linha, [30, 30], 5);
      coqueiro(c, W * 0.3, linha - 4, 60, 0.1, true);
    } else {   // roça: serra longe, morros, casinha e cerquinha
      serra(P.serra[0], linha, 70, 60, 21, 170);
      serra(P.serra[1], linha, 46, 40, 23, 120);
      morro(P.morro[0], linha, [34, 40], 3);
      morro(P.morro[1], linha, [16, 26], 7);
      casinha(c, W * 0.58, linha - 26, 0.75);
      c.strokeStyle = '#8a6a3a'; c.lineWidth = 1.6;
      for (var fz = 0; fz < 8; fz++) { var fxp = W * 0.53 + fz * 9; c.beginPath(); c.moveTo(fxp, linha - 12); c.lineTo(fxp, linha - 22); c.stroke(); }
      c.beginPath(); c.moveTo(W * 0.53, linha - 18); c.lineTo(W * 0.53 + 63, linha - 18); c.stroke();
      coqueiro(c, W * 0.38, linha - 4, 70, 0.12, true);
      coqueiro(c, W * 0.66, linha - 6, 58, -0.1, true);
    }
    var rm = rnd(41);
    for (var mt = 0; mt < (A.cen === 'mar' ? 0 : W / 60); mt++) { var mx = rm() * W, mr = 10 + rm() * 14; c.fillStyle = ['#3f9a46', '#4fae4f', '#2f8a3e'][mt % 3]; elipse(c, mx, linha - 4, mr, mr * 0.6); c.fill(); elipse(c, mx + mr * 0.6, linha - 2, mr * 0.7, mr * 0.45); c.fill(); }
    if (A.cen !== 'mar') {
      c.fillStyle = grad(c, 0, linha - 12, 0, sup + 2, [[0, P.barranco[0]], [1, P.barranco[1]]]);
      c.beginPath(); c.moveTo(0, sup + 2);
      for (var x = 0; x <= W; x += 40) c.lineTo(x, linha - 6 - Math.sin(x * 0.03) * 4);
      c.lineTo(W, sup + 2); c.closePath(); c.fill();
    }
    for (var tb = 0; tb < (A.cen === 'mar' ? 0 : W / 50); tb++) { var tx = rm() * W, th = 18 + rm() * 16; c.strokeStyle = '#3d7a2e'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(tx, sup + 1); c.lineTo(tx + 2, sup - th); c.stroke(); if (tb % 2) { c.fillStyle = '#6b3e1e'; elipse(c, tx + 2, sup - th + 4, 2.2, 5); c.fill(); } }   // taboas
    // água: clara em cima, escura e mágica embaixo
    c.fillStyle = grad(c, 0, sup, 0, H, [[0, P.agua], [0.1, P.agua2], [0.45, '#1478c0'], [0.75, '#0c4f98'], [1, '#0a3a78']]);
    c.fillRect(0, sup, W, H - sup);
    // brilhos mágicos no fundo
    [[0.2, 0.86, 160, 'rgba(120,90,255,0.16)'], [0.75, 0.9, 200, 'rgba(40,220,200,0.12)'], [0.5, 0.97, 260, 'rgba(255,120,220,0.08)']].forEach(function (g) {
      c.fillStyle = radial(c, W * g[0], H * g[1], 0, g[2], [[0, g[3]], [1, 'rgba(0,0,0,0)']]); c.fillRect(0, sup, W, H - sup);
    });
    // longe: pedras e corais em silhueta (azulados pela água), e paredões de pedra emoldurando os lados
    silhuetas(c, W, r);
    // chão de areia clara, com luz
    c.fillStyle = grad(c, 0, 930, 0, H, [[0, '#d8cf9a'], [0.5, '#bfb27c'], [1, '#8f8458']]);
    c.beginPath(); c.moveTo(0, H);
    for (var x2 = 0; x2 <= W; x2 += 30) c.lineTo(x2, 958 + Math.sin(x2 * 0.011) * 12 + Math.sin(x2 * 0.037) * 5);
    c.lineTo(W, H); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,230,0.35)'; c.lineWidth = 1.5;
    for (var o = 0; o < W / 40; o++) { var ox = r() * W, oy = 975 + r() * 20; c.beginPath(); c.moveTo(ox - 14, oy); c.quadraticCurveTo(ox, oy - 4, ox + 14, oy); c.stroke(); }
    c.fillStyle = 'rgba(40,90,140,0.35)'; c.fillRect(0, 930, W, 70);   // a água por cima da areia (fica azulada)
    for (var p = 0; p < W / 120; p++) {
      var px2 = r() * W, py = 962 + r() * 30, pr = 12 + r() * 24;
      c.fillStyle = grad(c, px2, py - pr, px2, py + pr * 0.4, [[0, '#6a8aa8'], [1, '#2a4560']]);
      elipse(c, px2, py, pr, pr * 0.6); c.fill();
      c.fillStyle = 'rgba(200,235,255,0.25)'; elipse(c, px2 - pr * 0.25, py - pr * 0.3, pr * 0.45, pr * 0.18); c.fill();
    }
    // recife colorido: corais de galho, de tubo, cérebro e leques
    var tipos = ['galho', 'tubo', 'cerebro', 'leque', 'galho', 'tubo'], cores = ['#ff8a4a', '#ff6fa8', '#b58cff', '#ffcf4a', '#ff5f7a', '#5ec8ff', '#ff9ad0'];
    for (var k = 0; k < W / 70; k++) {
      var cx = (k + r() * 0.8) / (W / 70) * W, cy = 968 + r() * 18, tam = 26 + r() * 30, cor = cores[Math.floor(r() * cores.length)];
      recife(c, tipos[Math.floor(r() * tipos.length)], cx, cy, tam, cor, r);
    }
    // estrelas-do-mar, conchas e o tesouro aberto no fundo
    for (var e = 0; e < W / 260; e++) { var ex = r() * W, ey = 970 + r() * 18; c.fillStyle = ['#ff8a5a', '#ffcf5a', '#ff6fa8'][e % 3]; c.beginPath(); for (var pp = 0; pp < 10; pp++) { var an = pp / 10 * Math.PI * 2 - Math.PI / 2, rr = pp % 2 ? 4 : 10; c.lineTo(ex + Math.cos(an) * rr, ey + Math.sin(an) * rr * 0.6); } c.closePath(); c.fill(); }
    for (var cc = 0; cc < W / 300; cc++) { var cx2 = r() * W, cy2 = 977 + r() * 14; c.fillStyle = '#f5e6d0'; c.beginPath(); c.moveTo(cx2 - 8, cy2 + 3); c.quadraticCurveTo(cx2, cy2 - 10, cx2 + 8, cy2 + 3); c.closePath(); c.fill(); c.strokeStyle = 'rgba(160,120,90,0.6)'; c.lineWidth = 0.8; for (var l = -2; l <= 2; l++) { c.beginPath(); c.moveTo(cx2, cy2 + 3); c.lineTo(cx2 + l * 3.4, cy2 - 5 + Math.abs(l)); c.stroke(); } }
    tesouro(c, W * (W >= H ? 0.86 : 0.75), 962);
    if (P.veu) { c.fillStyle = P.veu; c.fillRect(0, 0, W, H); }
    return cv;
  }
  function silhuetas(c, W, r) {
    // corais e pedras de longe, em azul, sem detalhe (dão profundidade)
    c.fillStyle = 'rgba(20,80,140,0.45)';
    for (var i = 0; i < W / 90; i++) {
      var x = r() * W, base = 940 + r() * 20, h = 40 + r() * 90;
      if (i % 3 === 0) { elipse(c, x, base, 40 + r() * 50, h * 0.6); c.fill(); }
      else { c.save(); c.translate(x, base); c.strokeStyle = 'rgba(20,80,140,0.45)'; c.lineCap = 'round';
        (function g(len, ang, larg, n) { if (n > 3) return; c.lineWidth = larg; c.beginPath(); c.moveTo(0, 0); var ex = Math.sin(ang) * len, ey = -Math.cos(ang) * len; c.lineTo(ex, ey); c.stroke(); c.save(); c.translate(ex, ey); g(len * 0.7, ang - 0.5, larg * 0.7, n + 1); g(len * 0.7, ang + 0.45, larg * 0.7, n + 1); c.restore(); })(h * 0.4, 0, 9, 0);
        c.restore(); }
    }
    // paredões de pedra nos lados, do meio da água até o fundo
    [[0, 1], [W, -1]].forEach(function (lado) {
      var x0 = lado[0], d = lado[1], topo = A.sup + (H - A.sup) * (0.38 + r() * 0.1), larg = Math.min(260, W * 0.16);
      c.fillStyle = grad(c, x0, 0, x0 + d * larg, 0, [[0, '#0a2d55'], [1, 'rgba(14,60,110,0.75)']]);
      c.beginPath(); c.moveTo(x0, topo - 40);
      c.quadraticCurveTo(x0 + d * larg * 0.7, topo - 30, x0 + d * larg * 0.55, topo + 60);
      c.quadraticCurveTo(x0 + d * larg * 1.1, topo + 160, x0 + d * larg * 0.8, topo + 260);
      c.quadraticCurveTo(x0 + d * larg * 1.3, H - 60, x0 + d * larg * 1.4, H);
      c.lineTo(x0, H); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(120,200,255,0.18)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, topo - 40); c.quadraticCurveTo(x0 + d * larg * 0.7, topo - 30, x0 + d * larg * 0.55, topo + 60); c.stroke();
    });
  }
  function recife(c, tipo, x, y, tam, cor, r) {
    c.save(); c.translate(x, y);
    var claro = 'rgba(255,255,255,0.35)', escuro = 'rgba(40,10,40,0.3)';
    if (tipo === 'galho') {
      c.strokeStyle = cor; c.lineCap = 'round';
      (function g(len, ang, larg, n) {
        if (n > 3) { c.fillStyle = cor; elipse(c, 0, 0, larg * 0.8, larg * 0.8); c.fill(); return; }
        c.lineWidth = larg; c.beginPath(); c.moveTo(0, 0); var ex = Math.sin(ang) * len, ey = -Math.cos(ang) * len; c.lineTo(ex, ey); c.stroke();
        c.strokeStyle = claro; c.lineWidth = larg * 0.3; c.beginPath(); c.moveTo(-larg * 0.2, 0); c.lineTo(ex - larg * 0.2, ey); c.stroke(); c.strokeStyle = cor;
        c.save(); c.translate(ex, ey); g(len * 0.72, ang - 0.45 - r() * 0.3, larg * 0.75, n + 1); g(len * 0.72, ang + 0.4 + r() * 0.3, larg * 0.75, n + 1); c.restore();
      })(tam * 0.42, (r() - 0.5) * 0.4, tam * 0.2, 0);
    } else if (tipo === 'tubo') {
      for (var i = 0; i < 4; i++) { var tx = (i - 1.5) * tam * 0.24, th = tam * (0.6 + r() * 0.7), tw = tam * 0.11;
        c.fillStyle = grad(c, tx - tw, 0, tx + tw, 0, [[0, cor], [0.5, '#ffffff'], [1, cor]]); c.globalAlpha = 0.95; c.fillRect(tx - tw, -th, tw * 2, th); c.globalAlpha = 1;
        c.fillStyle = cor; c.fillRect(tx - tw, -th, tw * 2, th); c.fillStyle = claro; c.fillRect(tx - tw * 0.6, -th, tw * 0.4, th);
        c.fillStyle = escuro; elipse(c, tx, -th, tw, tw * 0.45); c.fill(); c.fillStyle = 'rgba(255,255,200,0.5)'; elipse(c, tx, -th + 1, tw * 0.6, tw * 0.25); c.fill(); }
    } else if (tipo === 'cerebro') {
      c.fillStyle = grad(c, 0, -tam * 0.5, 0, 0, [[0, '#fff0b0'], [1, cor]]); elipse(c, 0, -tam * 0.18, tam * 0.5, tam * 0.36); c.fill();
      c.strokeStyle = escuro; c.lineWidth = 1.6; for (var l = 0; l < 6; l++) { c.beginPath(); for (var q = 0; q <= 12; q++) { var xx = -tam * 0.42 + q / 12 * tam * 0.84, yy = -tam * 0.36 + l * tam * 0.06 + Math.sin(q * 1.6 + l) * 2.4; if (q) c.lineTo(xx, yy); else c.moveTo(xx, yy); } c.stroke(); }
    } else {   // leque-do-mar: uma rede em forma de leque
      c.strokeStyle = cor; c.lineWidth = 2.4; c.lineCap = 'round';
      for (var f = 0; f < 9; f++) { var an = -0.9 + f / 8 * 1.8; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(Math.sin(an) * tam * 0.5, -tam * 0.5, Math.sin(an) * tam * 0.85, -Math.cos(an) * tam * 0.95); c.stroke(); }
      c.lineWidth = 1.2; for (var a2 = 1; a2 < 5; a2++) { c.beginPath(); c.arc(0, 0, a2 * tam * 0.2, -Math.PI / 2 - 0.9, -Math.PI / 2 + 0.9); c.stroke(); }
    }
    c.restore();
  }
  function tesouro(c, x, y) {
    c.save(); c.translate(x, y);
    c.fillStyle = '#e8b830'; for (var m = 0; m < 14; m++) { elipse(c, -34 + (m * 13) % 70, 18 - (m % 3) * 3, 6, 2.6); c.fill(); }
    c.fillStyle = grad(c, 0, -14, 0, 18, [[0, '#8a5222'], [1, '#4a2a0e']]); c.fillRect(-26, -12, 52, 28); c.strokeStyle = '#2a1608'; c.lineWidth = 1.5; c.strokeRect(-26, -12, 52, 28);
    c.fillStyle = '#d9a52a'; [-26, -4, 18].forEach(function (bx) { c.fillRect(bx, -12, 8, 28); });
    c.fillStyle = '#ffd34a'; for (var o = 0; o < 9; o++) { elipse(c, -18 + o * 4.5, -13 - (o % 2) * 3, 4, 2.2); c.fill(); }
    c.fillStyle = '#ff4a6a'; elipse(c, -6, -16, 3, 3); c.fill(); c.fillStyle = '#4ad0ff'; elipse(c, 8, -15, 2.6, 2.6); c.fill();
    c.save(); c.translate(-26, -12); c.rotate(-0.9); c.fillStyle = grad(c, 0, -14, 0, 0, [[0, '#a06a2e'], [1, '#5a3010']]); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(26, -22, 52, 0); c.closePath(); c.fill(); c.strokeStyle = '#2a1608'; c.stroke(); c.restore();
    c.restore();
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
  function rosto(c, x, y, r, pele, olhaDir, sardas) {
    c.fillStyle = pele; elipse(c, x - olhaDir * r * 0.93, y + r * 0.08, r * 0.2, r * 0.27); c.fill();   // orelha
    c.fillStyle = 'rgba(160,70,40,0.35)'; elipse(c, x - olhaDir * r * 0.93, y + r * 0.08, r * 0.1, r * 0.15); c.fill();
    c.fillStyle = pele; elipse(c, x, y, r, r * 0.97); c.fill();
    c.fillStyle = 'rgba(120,40,10,0.12)'; elipse(c, x - olhaDir * r * 0.2, y + r * 0.45, r * 0.8, r * 0.45); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.2)'; elipse(c, x + olhaDir * r * 0.15, y - r * 0.45, r * 0.55, r * 0.28); c.fill();
    var ox = x + olhaDir * r * 0.24, oy = y - r * 0.02;
    olhoFofo(c, ox - r * 0.34, oy, r * 0.25); olhoFofo(c, ox + r * 0.34, oy, r * 0.25);
    c.strokeStyle = 'rgba(60,25,10,0.8)'; c.lineWidth = r * 0.07; c.lineCap = 'round';
    [-1, 1].forEach(function (s) { c.beginPath(); c.moveTo(ox + s * r * 0.2, oy - r * 0.38); c.quadraticCurveTo(ox + s * r * 0.36, oy - r * 0.48, ox + s * r * 0.52, oy - r * 0.38); c.stroke(); });
    bochecha(c, ox - r * 0.58, y + r * 0.34, r * 0.17); bochecha(c, ox + r * 0.58, y + r * 0.34, r * 0.17);
    if (sardas) { c.fillStyle = 'rgba(140,70,30,0.6)'; [[-0.62, 0.22], [-0.5, 0.3], [-0.68, 0.32], [0.5, 0.22], [0.62, 0.3], [0.56, 0.36]].forEach(function (p) { elipse(c, ox + p[0] * r, y + p[1] * r, r * 0.035, r * 0.035); c.fill(); }); }
    c.fillStyle = 'rgba(120,50,20,0.45)'; elipse(c, ox, y + r * 0.2, r * 0.07, r * 0.05); c.fill();   // narizinho
    c.fillStyle = '#7a2218'; c.beginPath(); c.moveTo(ox - r * 0.22, y + r * 0.38); c.quadraticCurveTo(ox, y + r * 0.72, ox + r * 0.22, y + r * 0.38); c.quadraticCurveTo(ox, y + r * 0.44, ox - r * 0.22, y + r * 0.38); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(ox - r * 0.17, y + r * 0.41); c.quadraticCurveTo(ox, y + r * 0.47, ox + r * 0.17, y + r * 0.41); c.lineTo(ox + r * 0.15, y + r * 0.47); c.quadraticCurveTo(ox, y + r * 0.5, ox - r * 0.15, y + r * 0.47); c.closePath(); c.fill();
    c.fillStyle = '#ff7f8f'; elipse(c, ox, y + r * 0.58, r * 0.09, r * 0.05); c.fill();
  }
  function remendo(c, x, y, w, h, cor) {
    c.fillStyle = cor; c.fillRect(x, y, w, h);
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.9; c.setLineDash([1.6, 1.4]); c.strokeRect(x + 1.2, y + 1.2, w - 2.4, h - 2.4); c.setLineDash([]);
  }
  function chapeu(c, x, y, k, rot, enfeite) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k);
    c.fillStyle = grad(c, 0, -30, 0, 10, [[0, '#f6dc8a'], [1, '#c99a3e']]);
    c.beginPath(); c.ellipse(0, 4, 52, 12, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#c99a3e'; c.lineWidth = 1.2;   // palha desfiada na aba
    for (var a = 0; a < 26; a++) { var an = a / 26 * Math.PI * 2, ex = Math.cos(an) * 52, ey = 4 + Math.sin(an) * 12; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex * 1.08, ey + (Math.sin(an) > 0 ? 3 : -1)); c.stroke(); }
    c.fillStyle = grad(c, 0, -34, 0, 4, [[0, '#f8e2a0'], [1, '#d4a84c']]);
    c.beginPath(); c.moveTo(-27, 2); c.quadraticCurveTo(-25, -32, 0, -34); c.quadraticCurveTo(25, -32, 27, 2); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(140,95,30,0.45)'; c.lineWidth = 1;
    for (var kx = -46; kx <= 46; kx += 6) { c.beginPath(); c.moveTo(kx, 0); c.lineTo(kx * 1.08, 10); c.stroke(); }
    for (var m = -22; m <= 22; m += 5) { c.beginPath(); c.moveTo(m, -30 + Math.abs(m) * 0.2); c.lineTo(m * 1.1, -6); c.stroke(); }
    c.fillStyle = '#c0392b'; c.fillRect(-27, -7, 54, 7);
    if (enfeite === 'remendo') remendo(c, 6, -26, 11, 10, '#3a7bd5');
    if (enfeite === 'flores') [[-14, -6, '#ff5fa2'], [-4, -9, '#ffd23f'], [6, -6, '#ffffff']].forEach(function (f) { for (var p = 0; p < 5; p++) { var an = p / 5 * Math.PI * 2; c.fillStyle = f[2]; elipse(c, f[0] + Math.cos(an) * 3.4, f[1] + Math.sin(an) * 3.4, 2.8, 2.8); c.fill(); } c.fillStyle = '#ff9f1c'; elipse(c, f[0], f[1], 2, 2); c.fill(); });
    c.restore();
  }
  function juca(c, t) {
    // origem: centro do barquinho na linha da água; o menino olha para a direita
    var bob = Math.sin(t * 1.6) * 2.5, rot = Math.sin(t * 1.3) * 0.025;
    c.save(); c.rotate(rot); c.translate(0, bob);
    c.fillStyle = 'rgba(0,40,80,0.25)'; elipse(c, 0, 10, 105, 9); c.fill();
    if (IMG.juca) { barco(c); c.restore(); return null; }   // com a imagem 3D, aqui só o barquinho
    var pele = '#e0a87a';
    // pernas da jardineira dobradas, pés descalços
    c.fillStyle = '#3d6fb0'; c.beginPath(); c.moveTo(-34, -32); c.quadraticCurveTo(-2, -60, 18, -42); c.lineTo(22, -28); c.quadraticCurveTo(-6, -42, -30, -18); c.closePath(); c.fill();
    remendo(c, -6, -48, 9, 8, '#e8b830');
    c.fillStyle = '#2f5a92'; c.fillRect(14, -46, 10, 8);
    c.fillStyle = pele; elipse(c, 28, -30, 9, 6, 0.3); c.fill();
    // camisa xadrez
    c.save(); c.beginPath(); c.moveTo(-50, -26); c.quadraticCurveTo(-58, -80, -30, -94); c.quadraticCurveTo(-6, -100, 4, -82); c.quadraticCurveTo(10, -50, -8, -26); c.closePath();
    c.fillStyle = '#d9473d'; c.fill(); c.clip();
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 3;
    for (var i = -70; i < 20; i += 9) { c.beginPath(); c.moveTo(i, -100); c.lineTo(i, -20); c.stroke(); c.beginPath(); c.moveTo(-70, i - 30); c.lineTo(20, i - 30); c.stroke(); }
    c.strokeStyle = 'rgba(120,20,20,0.35)'; c.lineWidth = 1.5;
    for (var j = -66; j < 20; j += 9) { c.beginPath(); c.moveTo(j, -100); c.lineTo(j, -20); c.stroke(); }
    // peito da jardineira, alças e botões
    c.fillStyle = '#3d6fb0'; c.fillRect(-44, -66, 40, 44); c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(-42, -64, 6, 40);
    c.strokeStyle = '#2f5a92'; c.lineWidth = 6; c.beginPath(); c.moveTo(-40, -66); c.lineTo(-34, -94); c.moveTo(-8, -66); c.lineTo(-14, -94); c.stroke();
    c.fillStyle = '#ffd23f'; elipse(c, -38, -64, 2.6, 2.6); c.fill(); elipse(c, -10, -64, 2.6, 2.6); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.9; c.setLineDash([2, 1.6]); c.strokeRect(-36, -56, 22, 14); c.setLineDash([]);
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(-60, -40, 80, 20);
    c.restore();
    // braços até as mãos
    c.strokeStyle = '#c23d34'; c.lineWidth = 11; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-20, -82); c.quadraticCurveTo(4, -72, 22, -68); c.stroke();
    c.fillStyle = pele; elipse(c, 26, -68, 8, 7.5); c.fill();
    // lencinho amarelo no pescoço
    c.fillStyle = '#ffc21a'; c.beginPath(); c.moveTo(-40, -96); c.lineTo(-6, -96); c.lineTo(-20, -80); c.closePath(); c.fill(); c.fillStyle = '#e09a00'; elipse(c, -22, -95, 5, 3.5); c.fill();
    // cabeça grande, cabelo castanho, chapéu
    c.fillStyle = '#5a3418'; elipse(c, -26, -124, 31, 26); c.fill();
    rosto(c, -20, -122, 30, pele, 1, true);
    c.fillStyle = '#5a3418'; c.beginPath(); c.moveTo(-50, -132); c.quadraticCurveTo(-30, -152, 0, -140); c.quadraticCurveTo(-6, -132, -14, -134); c.quadraticCurveTo(-24, -128, -32, -134); c.quadraticCurveTo(-40, -128, -50, -124); c.closePath(); c.fill();
    chapeu(c, -20, -146, 1.08, -0.1, 'remendo');
    c.strokeStyle = '#8fbf4a'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-6, -104); c.quadraticCurveTo(8, -108, 18, -100 + Math.sin(t * 3) * 2); c.stroke();
    barco(c);
    c.restore();
    return { x: 26, y: -68 + bob };
  }
  function barco(c) {
    c.fillStyle = grad(c, 0, -34, 0, 14, [[0, '#b97536'], [0.5, '#8d5226'], [1, '#5b3215']]);
    c.beginPath(); c.moveTo(-104, -32); c.quadraticCurveTo(-96, 12, -40, 14); c.lineTo(46, 14); c.quadraticCurveTo(98, 8, 112, -38); c.quadraticCurveTo(10, -22, -104, -32); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(60,30,10,0.55)'; c.lineWidth = 1.6;
    [-14, -3].forEach(function (yy) { c.beginPath(); c.moveTo(-96, yy - 10); c.quadraticCurveTo(0, yy + 4, 104, yy - 16); c.stroke(); });
    c.fillStyle = '#d99a55'; c.beginPath(); c.moveTo(-106, -34); c.quadraticCurveTo(10, -24, 114, -40); c.lineTo(112, -34); c.quadraticCurveTo(10, -18, -104, -28); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.moveTo(-90, -24); c.quadraticCurveTo(0, -14, 96, -30); c.lineTo(96, -27); c.quadraticCurveTo(0, -10, -90, -20); c.closePath(); c.fill();
    c.fillStyle = '#ffd23f'; c.font = 'bold 13px sans-serif'; c.textAlign = 'center'; c.fillText('JUCA', 40, -2);
  }
  function lili(c, t) {
    // origem: centro da ilhota na linha da água; a menina senta na beira esquerda e olha para a esquerda
    var bob = Math.sin(t * 1.1) * 1.2;
    c.save();
    c.fillStyle = 'rgba(0,40,80,0.25)'; elipse(c, 20, 10, 125, 10); c.fill();
    c.fillStyle = grad(c, 0, -40, 0, 10, [[0, '#f8e1a6'], [1, '#d4a75c']]);
    c.beginPath(); c.moveTo(-100, 6); c.quadraticCurveTo(-70, -40, 20, -42); c.quadraticCurveTo(110, -40, 140, 6); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.35)'; elipse(c, 10, -34, 60, 5); c.fill();
    c.fillStyle = '#4aa84a'; [[60, -40], [90, -30], [-40, -32]].forEach(function (p) { for (var i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(p[0] + i * 3, p[1]); c.lineTo(p[0] + i * 5, p[1] - 12 + Math.abs(i) * 2); c.lineTo(p[0] + i * 3 + 2, p[1]); c.fill(); } });
    c.fillStyle = '#ffd1dc'; elipse(c, 108, -8, 4, 3); c.fill(); c.fillStyle = '#fff3c4'; elipse(c, -58, -6, 3.5, 2.5); c.fill();
    coqueiro(c, 92, -36, 140, -0.2, false);
    if (IMG.lili) { c.fillStyle = '#8a5a20'; c.font = 'bold 13px sans-serif'; c.textAlign = 'center'; c.fillText('LILI', 30, -6); c.restore(); return null; }   // com a imagem 3D, aqui só a ilhota
    c.translate(0, bob);
    var pele = '#9a5b34', bal = Math.sin(t * 2.2) * 0.25;
    [[-46, 0], [-34, 1]].forEach(function (p, i) { c.save(); c.translate(p[0], -34); c.rotate(0.35 + (i ? -bal : bal)); c.fillStyle = pele; c.fillRect(-4, 0, 9, 30); c.fillStyle = '#c0392b'; elipse(c, -3, 31, 8, 5); c.fill(); c.restore(); });   // sapatilhas vermelhas
    // vestido de festa junina com babados
    c.save(); c.beginPath(); c.moveTo(-70, -28); c.quadraticCurveTo(-60, -84, -36, -94); c.quadraticCurveTo(-12, -90, -6, -66); c.quadraticCurveTo(0, -42, 8, -28); c.quadraticCurveTo(-30, -20, -70, -28); c.closePath();
    c.fillStyle = '#e23d55'; c.fill(); c.clip();
    for (var fx = -76; fx < 14; fx += 12) for (var fy = -100; fy < -20; fy += 12) {
      var ox = fx + ((fy / 12) % 2 ? 6 : 0);
      c.fillStyle = 'rgba(255,255,255,0.9)'; for (var pt = 0; pt < 5; pt++) { var a = pt / 5 * Math.PI * 2; elipse(c, ox + Math.cos(a) * 3.2, fy + Math.sin(a) * 3.2, 1.7, 1.7); c.fill(); }
      c.fillStyle = '#ffd23f'; elipse(c, ox, fy, 2, 2); c.fill(); c.fillStyle = '#2e9e57'; elipse(c, ox + 5, fy + 4, 2, 1); c.fill();
    }
    [['#ffd23f', -46], ['#3a9bd8', -38]].forEach(function (b) { c.fillStyle = b[0]; c.beginPath(); c.moveTo(-80, b[1]); for (var x = -80; x <= 14; x += 7) c.quadraticCurveTo(x + 3.5, b[1] + 6, x + 7, b[1]); c.lineTo(14, b[1] + 3); c.lineTo(-80, b[1] + 3); c.fill(); });
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(-76, -60, 30, 40);
    c.restore();
    c.fillStyle = '#fff'; for (var rd = -68; rd < 8; rd += 5) { elipse(c, rd, -27 - (rd + 30) * 0.02, 2.6, 2); c.fill(); }   // rendinha
    c.strokeStyle = pele; c.lineWidth = 9; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-40, -82); c.quadraticCurveTo(-58, -74, -70, -66); c.stroke();
    c.fillStyle = '#ffd23f'; elipse(c, -40, -84, 10, 7.5); c.fill(); c.fillStyle = '#e23d55'; elipse(c, -40, -84, 6, 4); c.fill();
    c.fillStyle = pele; elipse(c, -73, -65, 7.5, 7); c.fill();
    // cabeça grande, tranças, chapéu com flores
    c.fillStyle = '#1d120d'; elipse(c, -30, -124, 32, 30); c.fill();
    [[-2, -112], [-56, -112]].forEach(function (tr, i) {
      c.save(); c.translate(tr[0], tr[1]); c.rotate((i ? 0.25 : -0.05) + Math.sin(t * 1.5 + i) * 0.06);
      for (var g = 0; g < 5; g++) { c.fillStyle = '#24160f'; elipse(c, 0, g * 9, 6 - g * 0.5, 6.4); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.14)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-4, g * 9 - 2); c.lineTo(4, g * 9 + 3); c.stroke(); }
      c.fillStyle = '#ffd23f'; elipse(c, -4, 46, 5, 3, -0.4); c.fill(); elipse(c, 4, 46, 5, 3, 0.4); c.fill();
      c.restore();
    });
    rosto(c, -34, -120, 28, pele, -1, false);
    c.fillStyle = '#1d120d'; c.beginPath(); c.moveTo(-62, -128); c.quadraticCurveTo(-44, -156, -6, -136); c.quadraticCurveTo(-26, -140, -40, -132); c.quadraticCurveTo(-50, -132, -62, -122); c.closePath(); c.fill();
    chapeu(c, -32, -146, 1.0, 0.08, 'flores');
    c.fillStyle = '#8a5a20'; c.font = 'bold 13px sans-serif'; c.textAlign = 'center'; c.fillText('LILI', 30, -6);
    c.restore();
    return { x: -73, y: -65 + bob };
  }
  // posição de cada personagem: o barquinho à esquerda da ponta da vara, a ilhota à direita
  function lugar(E, j) {
    var pt = R.ponta(E, j), e = escala(), dir = E.j[j].lado === 'dir';
    return { x: pt.x + (dir ? 150 : -122) * e * (A.W >= H ? 1 : 0.85), y: E.sup, e: e, dir: dir };
  }
  // onde fica a ponta da vara em cada imagem 3D (fração da largura e da altura): a imagem é posta de modo que essa ponta
  // caia exatamente na ponta das regras, de onde o anzol balança
  var PONTAS = { juca: [0.985, 0.15], lili: [0.012, 0.12] };
  function personagem(c, E, j, t) {
    var L = lugar(E, j), pt = R.ponta(E, j), id = L.dir ? 'lili' : 'juca', im = IMG[id];
    if (im) {
      var P = PONTAS[id], base = L.dir ? E.sup - 22 : E.sup + 14, alt = (base - pt.y) / (1 - P[1]), larg = alt * im.naturalWidth / im.naturalHeight;
      var x0 = pt.x - P[0] * larg, y0 = pt.y - P[1] * alt, e = alt / 175;
      if (L.dir) { c.save(); c.translate(x0 + larg * 0.62, E.sup); c.scale(e, e); lili(c, t); c.restore(); c.drawImage(im, x0, y0, larg, alt); }
      else { c.drawImage(im, x0, y0, larg, alt); c.save(); c.translate(x0 + larg * 0.42, E.sup); c.scale(e * 1.1, e); juca(c, t); c.restore(); }
      return;
    }
    c.save(); c.translate(L.x, L.y); c.scale(L.e, L.e);
    var mao = L.dir ? lili(c, t) : juca(c, t);
    c.restore();
    vara(c, { x: L.x + mao.x * L.e, y: L.y + mao.y * L.e }, pt, t);
  }

  /* =================================================================== bichos */
  // Cada desenho: comprimento 100, centrado em (0, 0), de frente para a direita; k = fase do nado (0..1).
  // As nadadeiras mexem aqui; o corpo ondula na hora de montar a tira de quadros (sprite(), mais abaixo).
  var TAU = Math.PI * 2;
  function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function leque(base, de, ate, n) { var r = []; for (var i = 0; i <= n; i++) { var f = i / n; r.push([de[0] + (ate[0] - de[0]) * f, de[1] + (ate[1] - de[1]) * f]); } return r; }
  // nadadeira: contorno(), transparente da base para a ponta, varetas e borda
  function nad(c, contorno, base, ponta, cor, alfa, raios, borda) {
    contorno(); c.fillStyle = grad(c, base[0], base[1], ponta[0], ponta[1], [[0, rgba(cor, alfa)], [1, rgba(cor, alfa * 0.45)]]); c.fill();
    c.save(); contorno(); c.clip(); c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 0.75;
    (raios || []).forEach(function (r) { c.beginPath(); c.moveTo(base[0], base[1]); c.lineTo(r[0], r[1]); c.stroke(); });
    if (borda) { contorno(); c.strokeStyle = borda; c.lineWidth = 2.6; c.stroke(); }
    c.restore();
    contorno(); c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 0.7; c.stroke();
  }
  function olho(c, x, y, r, iris) {
    c.fillStyle = 'rgba(0,0,0,0.18)'; elipse(c, x - r * 0.1, y + r * 0.15, r * 1.25, r * 1.2); c.fill();
    c.fillStyle = radial(c, x - r * 0.3, y - r * 0.3, 0, r * 1.2, [[0, '#ffffff'], [1, '#d8dde3']]); elipse(c, x, y, r, r); c.fill();
    c.fillStyle = radial(c, x + r * 0.1, y, r * 0.1, r * 0.75, [[0, '#fff3c0'], [0.5, iris], [1, '#3a2205']]); elipse(c, x + r * 0.12, y, r * 0.74, r * 0.74); c.fill();
    c.fillStyle = '#0a0a0a'; elipse(c, x + r * 0.18, y, r * 0.42, r * 0.44); c.fill();
    c.fillStyle = '#fff'; elipse(c, x - r * 0.18, y - r * 0.32, r * 0.26, r * 0.22); c.fill(); elipse(c, x + r * 0.32, y + r * 0.3, r * 0.1, r * 0.1); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 0.9; elipse(c, x, y, r, r); c.stroke();
  }
  function olhoFofo(c, x, y, r) {   // olhão brilhante dos bichos fofos
    c.fillStyle = 'rgba(0,0,0,0.15)'; elipse(c, x, y + r * 0.12, r * 1.08, r * 1.12); c.fill();
    c.fillStyle = '#fff'; elipse(c, x, y, r, r * 1.05); c.fill();
    c.fillStyle = radial(c, x + r * 0.05, y + r * 0.25, r * 0.1, r * 0.9, [[0, '#5a3a20'], [0.6, '#1d120c'], [1, '#050302']]); elipse(c, x + r * 0.08, y + r * 0.06, r * 0.82, r * 0.88); c.fill();
    c.fillStyle = '#fff'; elipse(c, x - r * 0.18, y - r * 0.3, r * 0.34, r * 0.3); c.fill(); elipse(c, x + r * 0.35, y + r * 0.35, r * 0.14, r * 0.14); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.5)'; elipse(c, x + r * 0.3, y - r * 0.4, r * 0.1, r * 0.1); c.fill();
  }
  function bochecha(c, x, y, r) { c.fillStyle = 'rgba(255,110,140,0.45)'; elipse(c, x, y, r, r * 0.6); c.fill(); }
  function sorriso(c, x, y, r, cor) { c.strokeStyle = cor || '#4a1a10'; c.lineWidth = Math.max(1, r * 0.25); c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
  function volume(c, a, comprido) {   // luz de cima, sombra embaixo, brilho colorido
    c.fillStyle = radial(c, 8, -a * 0.55, 2, comprido * 0.55, [[0, 'rgba(255,255,255,0.5)'], [0.35, 'rgba(255,255,255,0.12)'], [1, 'rgba(255,255,255,0)']]); c.fillRect(-60, -a - 10, 120, a * 2 + 20);
    c.fillStyle = grad(c, 0, a * 0.2, 0, a * 1.05, [[0, 'rgba(0,10,30,0)'], [1, 'rgba(0,10,30,0.35)']]); c.fillRect(-60, 0, 120, a + 10);
  }
  function escamas(c, a, de, ate, tam) {
    for (var x = de; x < ate; x += tam) for (var y = -a; y < a; y += tam) {
      var yy = y + ((Math.round(x / tam)) % 2 ? tam / 2 : 0);
      c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 0.7; c.beginPath(); c.arc(x, yy, tam * 0.7, -1, 1); c.stroke();
      c.strokeStyle = 'rgba(0,15,35,0.12)'; c.beginPath(); c.arc(x - 0.8, yy, tam * 0.7, -1, 1); c.stroke();
    }
  }
  // peixe comum: p = { alt, dorso, meio, ventre, nad, rabo, iris, raboForma: garfo | redondo | reto, dorsal: normal | alta | espinhos,
  //   borda (cor da borda das nadadeiras), lisa (sem escamas), irisado, desenho(c, a, k), boca(c, a), cabeca(c, a, k) }
  function peixe(c, p, k) {
    var w = Math.sin(k * TAU), w2 = Math.sin(k * TAU + 1.4), w3 = Math.sin(k * TAU * 2), a = p.alt * 50, rf = p.raboForma || 'garfo';
    // nadadeira do peito do lado de lá
    c.save(); c.translate(16, a * 0.28); c.rotate(0.95 - w2 * 0.55);
    nad(c, function () { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-6, 12, -15, 15); c.quadraticCurveTo(-8, 6, 0, 3); c.closePath(); }, [0, 1], [-14, 14], p.nad, 0.5, leque(0, [-15, 15], [-9, 6], 3));
    c.restore();
    // rabo: varre de um lado para o outro (a largura muda, como se virasse)
    c.save(); c.translate(-37, 0); c.rotate(w * 0.28); c.scale(1 - Math.abs(w) * 0.18, 1 + w3 * 0.04);
    var rt = -a * 0.95 - 6, rb = a * 0.95 + 6;
    nad(c, function () {
      c.beginPath(); c.moveTo(4, -a * 0.2);
      if (rf === 'redondo') { c.bezierCurveTo(-8, -a * 0.9, -26, -a * 0.8, -26, 0); c.bezierCurveTo(-26, a * 0.8, -8, a * 0.9, 4, a * 0.2); }
      else if (rf === 'reto') { c.quadraticCurveTo(-8, -a * 0.6, -22, rt * 0.85); c.quadraticCurveTo(-19, 0, -22, rb * 0.85); c.quadraticCurveTo(-8, a * 0.6, 4, a * 0.2); }
      else { c.quadraticCurveTo(-8, -a * 0.6, -24 - w2 * 2, rt); c.quadraticCurveTo(-15, -a * 0.25, -12, 0); c.quadraticCurveTo(-15, a * 0.25, -24 + w2 * 2, rb); c.quadraticCurveTo(-8, a * 0.6, 4, a * 0.2); }
      c.closePath();
    }, [2, 0], [-22, 0], p.rabo, 0.95, leque(0, [-24, rt], [-24, rb], 9), p.borda);
    c.restore();
    // nadadeira de cima: ondula
    var dt = p.dorsal || 'normal', alto = dt === 'alta' ? 1.5 : 1;
    nad(c, function () {
      c.beginPath(); c.moveTo(-20, -a * 0.72);
      if (dt === 'espinhos') { for (var i = 0; i <= 6; i++) { var x = -20 + i * 6; c.lineTo(x + 2, -a * 0.95 - 10 - Math.sin(k * TAU + i) * 2.5); c.lineTo(x + 5, -a * 0.9 - 2); } }
      else c.bezierCurveTo(-14, -a - 12 * alto - w2 * 2.5, 2, -a - 15 * alto + w2 * 3, 18, -a * 0.88);
      c.quadraticCurveTo(0, -a * 0.72, -20, -a * 0.62); c.closePath();
    }, [0, -a * 0.75], [0, -a - 14 * alto], p.nad, 0.88, leque(0, [-18, -a - 10 * alto], [16, -a - 2], 7), p.borda);
    // nadadeira de baixo (anal) e pélvica: batem
    nad(c, function () { c.beginPath(); c.moveTo(-24, a * 0.55); c.quadraticCurveTo(-20 - w2 * 3, a + 9, -6, a * 0.85); c.closePath(); }, [-14, a * 0.65], [-18, a + 7], p.nad, 0.85, leque(0, [-22, a + 6], [-8, a + 4], 4), p.borda);
    c.save(); c.translate(6, a * 0.78); c.rotate(0.6 + w * 0.35);
    nad(c, function () { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-4, 8, -11, 10); c.quadraticCurveTo(-5, 3, 3, 0); c.closePath(); }, [0, 1], [-10, 9], p.nad, 0.8, leque(0, [-11, 10], [-4, 4], 3), p.borda);
    c.restore();
    // corpo
    function corpo() { c.beginPath(); c.moveTo(50, 3); c.bezierCurveTo(46, -a * 0.95, 4, -a * 1.12, -38, -a * 0.2); c.lineTo(-38, a * 0.2); c.bezierCurveTo(2, a * 1.12, 46, a * 0.98, 50, 3); c.closePath(); }
    corpo(); c.fillStyle = grad(c, 0, -a, 0, a, [[0, p.dorso], [0.5, p.meio], [1, p.ventre]]); c.fill();
    c.save(); corpo(); c.clip();
    if (!p.lisa) escamas(c, a, -34, 24, Math.max(4, a * 0.22));
    if (p.desenho) p.desenho(c, a, k);
    if (p.irisado) { c.fillStyle = grad(c, -30, -a, 30, a, [[0, 'rgba(255,120,200,0.18)'], [0.5, 'rgba(120,255,240,0.16)'], [1, 'rgba(255,240,120,0.16)']]); c.fillRect(-60, -a - 5, 120, a * 2 + 10); }
    volume(c, a, 100);
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1; c.setLineDash([1.6, 2.2]); c.beginPath(); c.moveTo(26, -a * 0.18); c.quadraticCurveTo(-4, -a * 0.3, -36, 0); c.stroke(); c.setLineDash([]);
    // opérculo (a "bochecha" da guelra)
    c.fillStyle = 'rgba(0,0,0,0.1)'; c.beginPath(); c.moveTo(26, -a * 0.75); c.quadraticCurveTo(16, 0, 26, a * 0.8); c.lineTo(60, a); c.lineTo(60, -a); c.closePath(); c.fill();
    c.restore();
    corpo(); c.strokeStyle = 'rgba(10,20,35,0.75)'; c.lineWidth = 1.6; c.stroke();
    c.strokeStyle = 'rgba(10,20,35,0.45)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(26, -a * 0.72); c.quadraticCurveTo(17, 0, 26, a * 0.75); c.stroke();
    // nadadeira do peito do lado de cá: bate como asinha
    c.save(); c.translate(20, a * 0.12); c.rotate(0.55 + w2 * 0.6); c.scale(0.55 + 0.45 * Math.abs(Math.cos(k * TAU + 1.4)), 1);
    nad(c, function () { c.beginPath(); c.moveTo(0, -2); c.quadraticCurveTo(-8, 4, -18, 12); c.quadraticCurveTo(-14, 16, -8, 13); c.quadraticCurveTo(-2, 8, 2, 2); c.closePath(); }, [0, 0], [-16, 13], p.nad, 0.8, leque(0, [-18, 12], [-6, 13], 4), p.borda);
    c.restore();
    if (p.cabeca) p.cabeca(c, a, k);
    if (p.fofo) { olhoFofo(c, 33, -a * 0.18, Math.max(6, a * 0.36)); bochecha(c, 36, a * 0.32, a * 0.18); sorriso(c, 44, a * 0.12, a * 0.14); return; }
    olho(c, 36, -a * 0.2, Math.max(5, a * (p.olhao ? 0.34 : 0.26)), p.iris || '#e8a317');
    if (p.boca) p.boca(c, a); else { c.strokeStyle = 'rgba(40,10,10,0.7)'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(50, 4); c.quadraticCurveTo(46, 8, 41, 7); c.stroke(); }
  }
  function tubarao(c, p, k) {
    var w = Math.sin(k * TAU), w2 = Math.sin(k * TAU + 1.4), a = p.alt * 50;
    c.save(); c.translate(-41, -2); c.rotate(w * 0.24);
    c.fillStyle = grad(c, 0, -a * 1.7, 0, a, [[0, p.dorso], [1, p.meio]]);
    c.beginPath(); c.moveTo(6, -a * 0.25); c.quadraticCurveTo(-8, -a * 0.9, -21, -a * 1.75); c.quadraticCurveTo(-13, -a * 0.4, -9, 0); c.quadraticCurveTo(-12, a * 0.5, -17, a * 0.95); c.quadraticCurveTo(-4, a * 0.45, 6, a * 0.25); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(5,10,25,0.7)'; c.lineWidth = 1.4; c.stroke();
    c.restore();
    c.fillStyle = grad(c, 0, -a * 2, 0, -a * 0.8, [[0, p.dorso], [1, p.meio]]);
    c.beginPath(); c.moveTo(-6, -a * 0.85); c.quadraticCurveTo(0, -a * 1.8, 7 + w2, -a * 2.1); c.quadraticCurveTo(10, -a * 1.3, 18, -a * 0.88); c.closePath(); c.fill(); c.strokeStyle = 'rgba(5,10,25,0.6)'; c.lineWidth = 1.3; c.stroke();
    c.beginPath(); c.moveTo(-29, -a * 0.38); c.lineTo(-25, -a * 0.95); c.lineTo(-21, -a * 0.4); c.fill();
    c.beginPath(); c.moveTo(-24, a * 0.4); c.lineTo(-22, a * 0.85 + w2); c.lineTo(-16, a * 0.45); c.fill();
    function corpo() { c.beginPath(); c.moveTo(53, 2); c.bezierCurveTo(47, -a * 0.95, 10, -a * 1.04, -43, -a * 0.25); c.lineTo(-43, a * 0.2); c.bezierCurveTo(6, a * 1.06, 41, a * 0.72, 53, 2); c.closePath(); }
    corpo(); c.fillStyle = grad(c, 0, -a, 0, a, [[0, p.dorso], [0.48, p.meio], [0.56, p.ventre], [1, p.ventre]]); c.fill();
    c.save(); corpo(); c.clip();
    if (p.desenho) p.desenho(c, a, k);
    volume(c, a, 110);
    for (var i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,255,255,0.06)'; elipse(c, -40 + (i * 37) % 90, -a + (i * 13) % (a * 1.2), 1, 1); c.fill(); }
    c.restore();
    corpo(); c.strokeStyle = 'rgba(5,10,25,0.75)'; c.lineWidth = 1.6; c.stroke();
    c.strokeStyle = 'rgba(5,10,25,0.55)'; c.lineWidth = 1.1;
    for (var g = 0; g < 5; g++) { c.beginPath(); c.moveTo(26 - g * 3.6, -a * 0.35); c.quadraticCurveTo(23 - g * 3.6, 0, 26 - g * 3.6, a * 0.32); c.stroke(); }
    c.save(); c.translate(14, a * 0.45); c.rotate(0.5 + w2 * 0.3); c.scale(0.6 + 0.4 * Math.abs(Math.cos(k * TAU + 1.4)), 1);
    c.fillStyle = grad(c, 0, 0, -22, 22, [[0, p.meio], [1, p.dorso]]); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-10, 10, -27, 24); c.quadraticCurveTo(-10, 7, 7, 0); c.closePath(); c.fill(); c.strokeStyle = 'rgba(5,10,25,0.6)'; c.lineWidth = 1.2; c.stroke();
    c.restore();
    if (p.cabeca) p.cabeca(c, a, k);
    else {
      c.fillStyle = '#05080c'; elipse(c, 39, -a * 0.27, 3.4, 3.2); c.fill(); c.fillStyle = '#fff'; elipse(c, 38.2, -a * 0.36, 1.2, 1.2); c.fill();
      c.strokeStyle = 'rgba(15,5,5,0.75)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(49, a * 0.28); c.quadraticCurveTo(39, a * 0.5, 28, a * 0.38); c.stroke();
      c.fillStyle = '#fff'; for (var d = 0; d < 5; d++) { c.beginPath(); c.moveTo(46 - d * 3.6, a * 0.33 + d * 0.5); c.lineTo(44.6 - d * 3.6, a * 0.48 + d * 0.5); c.lineTo(43.2 - d * 3.6, a * 0.35 + d * 0.5); c.fill(); }
    }
  }
  var neon = function (cor1, cor2) {
    return function (c, a, k) {
      c.globalCompositeOperation = 'lighter';
      c.strokeStyle = rgba(cor1, 0.55 + 0.25 * Math.sin(k * TAU)); c.lineWidth = 2.2;
      c.beginPath(); c.moveTo(34, -a * 0.5); c.bezierCurveTo(14, -a * 0.75, -12, -a * 0.2, -40, -a * 0.35); c.stroke();
      c.strokeStyle = rgba(cor2, 0.5); c.lineWidth = 1.4;
      [[20, -0.2], [6, 0.1], [-10, -0.05], [-24, 0.15]].forEach(function (m) { c.beginPath(); c.moveTo(m[0], -a * 0.5); c.lineTo(m[0] - 6, a * m[1]); c.stroke(); });
      c.globalCompositeOperation = 'source-over';
    };
  };

  var PINTA = {
    lambari: function (c, k) { peixe(c, { alt: 0.42, dorso: '#4d7f99', meio: '#c4d6e0', ventre: '#f7fbff', nad: '#ff8f2a', rabo: '#ffc21a', iris: '#d9a21b', irisado: true,
      desenho: function (c, a) { c.fillStyle = 'rgba(15,20,30,0.85)'; elipse(c, -27, 0, 5, a * 0.32); c.fill(); elipse(c, 14, -a * 0.1, 3.5, a * 0.22); c.fill(); c.fillStyle = 'rgba(255,190,60,0.35)'; c.fillRect(-36, -2, 62, 3); } }, k); },
    piaba: function (c, k) { peixe(c, { alt: 0.4, dorso: '#6a7f8c', meio: '#dbe7ee', ventre: '#ffffff', nad: '#ff4f3a', rabo: '#ff4f3a', iris: '#d9a21b', lisa: true,
      desenho: function (c, a, k) { c.globalCompositeOperation = 'lighter'; c.fillStyle = grad(c, -36, 0, 36, 0, [[0, 'rgba(40,220,255,0.0)'], [0.3, 'rgba(40,230,255,' + (0.75 + 0.2 * Math.sin(k * TAU)) + ')'], [1, 'rgba(40,230,255,0.9)']]); c.fillRect(-30, -a * 0.32, 62, a * 0.28); c.globalCompositeOperation = 'source-over';
        c.fillStyle = 'rgba(255,60,50,0.75)'; c.fillRect(-40, a * 0.05, 40, a * 0.9); } }, k); },
    palhaco: function (c, k) { peixe(c, { alt: 0.6, dorso: '#ff6a00', meio: '#ff8c1a', ventre: '#ffb04a', nad: '#ff7a10', rabo: '#ff7a10', iris: '#ff8a1a', raboForma: 'redondo', borda: '#111', olhao: true,
      desenho: function (c, a) {
        [[30, 9, 1.05], [2, 10, 1.15], [-28, 7, 0.8]].forEach(function (f) {
          c.fillStyle = '#111'; c.beginPath(); c.moveTo(f[0] - f[1] / 2 - 2.2, -a * 1.2); c.quadraticCurveTo(f[0] + 6 - 2.2, 0, f[0] - f[1] / 2 - 2.2, a * 1.2); c.lineTo(f[0] + f[1] / 2 + 2.2, a * 1.2); c.quadraticCurveTo(f[0] + 6 + 2.2 + f[1] * 0.2, 0, f[0] + f[1] / 2 + 2.2, -a * 1.2); c.closePath(); c.fill();
          c.fillStyle = '#fbfbf6'; c.beginPath(); c.moveTo(f[0] - f[1] / 2, -a * 1.2); c.quadraticCurveTo(f[0] + 6, 0, f[0] - f[1] / 2, a * 1.2); c.lineTo(f[0] + f[1] / 2, a * 1.2); c.quadraticCurveTo(f[0] + 6 + f[1] * 0.2, 0, f[0] + f[1] / 2, -a * 1.2); c.closePath(); c.fill();
        }); } }, k); },
    cirurgiao: function (c, k) { peixe(c, { alt: 0.66, dorso: '#1238b8', meio: '#2a62f0', ventre: '#5a92ff', nad: '#1a46d0', rabo: '#ffd21f', iris: '#1a1a1a', raboForma: 'reto', borda: '#0a0a1a', lisa: true,
      desenho: function (c, a) {
        c.fillStyle = '#0b0b14'; c.beginPath(); c.moveTo(34, -a * 0.35); c.bezierCurveTo(20, -a * 1.1, -26, -a * 0.9, -34, -a * 0.1); c.bezierCurveTo(-26, a * 0.2, -10, -a * 0.2, -4, -a * 0.28); c.bezierCurveTo(-18, a * 0.15, -26, a * 0.5, -32, a * 0.25);
        c.bezierCurveTo(-20, a * 0.9, 10, a * 0.2, 8, -a * 0.15); c.bezierCurveTo(18, -a * 0.55, 28, -a * 0.2, 34, -a * 0.35); c.closePath(); c.fill();
        c.fillStyle = '#ffd21f'; c.beginPath(); c.moveTo(-38, -a * 0.18); c.lineTo(-30, 0); c.lineTo(-38, a * 0.18); c.fill(); } }, k); },
    tilapia: function (c, k) { peixe(c, { alt: 0.55, dorso: '#4d5c4b', meio: '#a3b19a', ventre: '#eef3e6', nad: '#8a7c6a', rabo: '#9a7c6a', iris: '#c9462b', dorsal: 'espinhos', irisado: true,
      desenho: function (c, a) { c.fillStyle = 'rgba(30,40,30,0.18)'; for (var i = 0; i < 6; i++) c.fillRect(-32 + i * 10, -a, 4, a * 2); c.fillStyle = 'rgba(255,80,80,0.18)'; elipse(c, 6, a * 0.5, 30, a * 0.3); c.fill(); } }, k); },
    baiacu: function (c, k) {
      var s = 1 + Math.sin(k * TAU) * 0.04; c.save(); c.scale(s, s);
      peixe(c, { alt: 0.82, dorso: '#e0a810', meio: '#ffd84a', ventre: '#fff6c8', nad: '#ffc21a', rabo: '#ffb000', iris: '#2a8f4a', raboForma: 'redondo', lisa: true, fofo: true,
        desenho: function (c, a) { c.fillStyle = 'rgba(70,45,10,0.65)'; for (var i = 0; i < 18; i++) { elipse(c, -30 + (i * 23) % 60, -a * 0.85 + (i * 17) % (a * 1.1), 2.6, 2.2); c.fill(); } },
        cabeca: function (c, a) { c.fillStyle = '#fff8de'; for (var i = 0; i < 16; i++) { var an = -Math.PI * 0.95 + i / 15 * Math.PI * 1.9, x = Math.cos(an) * 42, y = Math.sin(an) * a; c.beginPath(); c.moveTo(x * 0.92, y * 0.92); c.lineTo(x * 1.08, y * 1.1); c.lineTo(x * 0.96 + 2, y * 0.95); c.fill(); } } }, k);
      c.restore(); },
    traira: function (c, k) { peixe(c, { alt: 0.4, dorso: '#36402a', meio: '#7c8350', ventre: '#d9d5a8', nad: '#5c6038', rabo: '#5c6038', iris: '#e0b020', raboForma: 'redondo',
      desenho: function (c, a) { c.fillStyle = 'rgba(20,25,10,0.45)'; for (var i = 0; i < 9; i++) { elipse(c, -30 + i * 7, (i % 2 ? -1 : 1) * a * 0.2, 4, a * 0.4, i); c.fill(); } },
      boca: function (c, a) { c.fillStyle = '#3a1010'; c.beginPath(); c.moveTo(51, 0); c.lineTo(36, a * 0.35); c.lineTo(51, a * 0.3); c.fill(); c.fillStyle = '#fff'; for (var i = 0; i < 4; i++) { c.beginPath(); c.moveTo(48 - i * 3.4, a * 0.05); c.lineTo(47 - i * 3.4, a * 0.22); c.lineTo(46 - i * 3.4, a * 0.05); c.fill(); } } }, k); },
    pacu: function (c, k) { peixe(c, { alt: 0.74, dorso: '#3f4c52', meio: '#98a3a6', ventre: '#ff6a35', nad: '#f05a2a', rabo: '#e0502a', iris: '#e4c35a', irisado: true, olhao: true,
      desenho: function (c, a) { c.fillStyle = 'rgba(255,80,30,0.38)'; elipse(c, 8, a * 0.75, 42, a * 0.4); c.fill(); },
      boca: function (c, a) { c.fillStyle = '#5a1e14'; elipse(c, 47.5, 7, 4.8, 3.6); c.fill(); c.fillStyle = '#fffbea'; c.fillRect(46, 3.6, 2.8, 3.6); c.fillRect(49, 3.8, 2.6, 3.4); c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 0.4; c.strokeRect(46, 3.6, 2.8, 3.6); c.strokeRect(49, 3.8, 2.6, 3.4); } }, k); },
    bagre: function (c, k) { var w = Math.sin(k * TAU);
      peixe(c, { alt: 0.42, dorso: '#4a4038', meio: '#8a7c6c', ventre: '#ece2d2', nad: '#6a5c50', rabo: '#6a5c50', iris: '#c9a020', lisa: true,
        desenho: function (c, a) { c.fillStyle = 'rgba(30,20,10,0.25)'; for (var i = 0; i < 14; i++) { elipse(c, -34 + (i * 29) % 66, -a * 0.6 + (i * 11) % (a * 0.8), 2.2, 1.8); c.fill(); } },
        boca: function (c, a) { c.strokeStyle = '#2a201a'; c.lineWidth = 1.3; c.lineCap = 'round';
          [[0, -0.1, 22], [1, 0.2, 18], [2, 0.35, 14]].forEach(function (b, i) { c.beginPath(); c.moveTo(48, a * b[1]); c.quadraticCurveTo(56 + b[2] * 0.4, a * b[1] + 4 + w * 3 * (i % 2 ? 1 : -1), 50 + b[2], a * b[1] + 10 + w * 4); c.stroke(); });
          c.beginPath(); c.moveTo(50, 5); c.quadraticCurveTo(46, 8, 40, 7); c.stroke(); } }, k); },
    'cavalo-marinho': function (c, k) {
      var w = Math.sin(k * TAU * 3), cor = '#ffa51f', esc = '#d97a0a';
      c.save(); c.translate(-4, 0);
      // nadadeira das costas: bate bem rápido (é assim que ele nada)
      nad(c, function () { c.beginPath(); c.moveTo(-12, -6); c.quadraticCurveTo(-24 - w * 4, 2, -13, 14); c.closePath(); }, [-12, 4], [-22, 4], '#ffe08a', 0.85, leque(0, [-22 - w * 3, -2], [-15, 13], 5));
      // rabo enroladinho
      c.strokeStyle = esc; c.lineCap = 'round'; c.lineWidth = 7; c.beginPath(); c.moveTo(-4, 22); c.quadraticCurveTo(-2, 40, 8, 40); c.quadraticCurveTo(16, 38, 12, 31); c.quadraticCurveTo(8, 27, 6, 32); c.stroke();
      c.strokeStyle = cor; c.lineWidth = 4.5; c.stroke();
      // corpo em anéis
      c.fillStyle = grad(c, -14, 0, 14, 0, [[0, esc], [0.5, cor], [1, '#ffd27a']]);
      c.beginPath(); c.moveTo(4, -30); c.bezierCurveTo(-16, -24, -16, 4, -6, 24); c.lineTo(2, 24); c.bezierCurveTo(14, 8, 16, -12, 12, -22); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(120,60,0,0.5)'; c.lineWidth = 0.9; for (var i = -22; i < 24; i += 4) { c.beginPath(); c.moveTo(-12 + Math.abs(i) * 0.1, i); c.quadraticCurveTo(0, i + 2, 12 - Math.abs(i + 10) * 0.12, i - 1); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,0.35)'; elipse(c, 6, -10, 3, 12, 0.2); c.fill();
      // cabeça com focinho de tubinho e coroa
      c.fillStyle = grad(c, 0, -46, 0, -20, [[0, '#ffd27a'], [1, cor]]); elipse(c, 6, -34, 11, 9, 0.2); c.fill();
      c.fillStyle = cor; c.beginPath(); c.moveTo(12, -38); c.lineTo(32, -33); c.lineTo(32, -28); c.lineTo(12, -28); c.closePath(); c.fill(); c.fillStyle = esc; elipse(c, 32, -30.5, 2.4, 3); c.fill();
      c.fillStyle = esc; [[0, -44], [5, -46], [10, -44]].forEach(function (p) { c.beginPath(); c.moveTo(p[0] - 2, p[1] + 4); c.lineTo(p[0], p[1] - 2); c.lineTo(p[0] + 2, p[1] + 4); c.fill(); });
      c.strokeStyle = 'rgba(80,40,0,0.7)'; c.lineWidth = 1.2; elipse(c, 6, -34, 11, 9, 0.2); c.stroke();
      olhoFofo(c, 9, -35, 5.6); bochecha(c, 13, -28, 3);
      c.restore(); },
    'agua-viva': function (c, k) {
      var w = Math.sin(k * TAU), sx = 1 + w * 0.12, sy = 1 - w * 0.1;
      c.save(); c.rotate(-Math.PI / 2 + 0.25);   // nada "de pé", com a cúpula para a frente
      c.globalCompositeOperation = 'lighter';
      // tentáculos
      for (var i = 0; i < 7; i++) { var x0 = -20 + i * 6.6; c.strokeStyle = 'rgba(255,150,220,0.5)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x0 * sx, 4); c.bezierCurveTo(x0 + Math.sin(k * TAU + i) * 6, 20, x0 - Math.sin(k * TAU + i + 1) * 7, 32, x0 + Math.sin(k * TAU + i) * 4, 46); c.stroke(); }
      for (var j = 0; j < 3; j++) { var x1 = -6 + j * 6; c.strokeStyle = 'rgba(255,220,255,0.55)'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(x1, 2); c.bezierCurveTo(x1 + Math.sin(k * TAU + j) * 5, 14, x1 - 4, 22, x1 + Math.sin(k * TAU + j) * 4, 34); c.stroke(); }
      c.globalCompositeOperation = 'source-over';
      // cúpula que pulsa
      c.save(); c.scale(sx, sy);
      c.fillStyle = radial(c, 0, -12, 2, 30, [[0, 'rgba(255,230,250,0.95)'], [0.5, 'rgba(240,120,220,0.65)'], [1, 'rgba(160,60,220,0.5)']]);
      c.beginPath(); c.moveTo(-26, 4); c.bezierCurveTo(-28, -34, 28, -34, 26, 4);
      for (var f = 0; f <= 8; f++) c.quadraticCurveTo(26 - f * 6.5 - 3.2, 8, 26 - (f + 1) * 6.5 + 0.0, 4);
      c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1; c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.45)'; elipse(c, -8, -18, 8, 4, -0.4); c.fill();
      c.strokeStyle = 'rgba(255,180,240,0.5)'; for (var m = -2; m <= 2; m++) { c.beginPath(); c.moveTo(m * 8, 2); c.quadraticCurveTo(m * 5, -12, 0, -20); c.stroke(); }
      c.restore(); c.restore(); },
    tartaruga: function (c, k) {
      var w = Math.sin(k * TAU), pele = '#6fa04a';
      c.save(); c.translate(-30, 10); c.rotate(0.6 - w * 0.5); c.fillStyle = pele; elipse(c, -6, 4, 11, 5, 0.3); c.fill(); c.restore();   // pata de trás
      c.save(); c.translate(14, 6); c.rotate(-0.2 + w * 0.7);   // nadadeira da frente: rema
      c.fillStyle = grad(c, 0, 0, -30, 20, [[0, pele], [1, '#4f8030']]); c.beginPath(); c.moveTo(4, -2); c.quadraticCurveTo(-14, 10, -32, 26); c.quadraticCurveTo(-20, 12, -2, 6); c.closePath(); c.fill(); c.strokeStyle = 'rgba(20,50,10,0.5)'; c.lineWidth = 1; c.stroke(); c.restore();
      // cabeça
      c.fillStyle = grad(c, 30, -12, 30, 8, [[0, '#86b85c'], [1, pele]]); elipse(c, 40, -2, 12, 9); c.fill();
      c.strokeStyle = 'rgba(20,50,10,0.6)'; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = 'rgba(40,80,20,0.35)'; [[38, -6], [44, 2], [34, 2]].forEach(function (p) { elipse(c, p[0], p[1], 2.4, 1.8); c.fill(); });
      olhoFofo(c, 42, -5, 5.2); bochecha(c, 46, 2, 2.6); sorriso(c, 47, -1, 3, '#2a3a12');
      // casco com placas
      function casco() { c.beginPath(); c.moveTo(-36, 6); c.bezierCurveTo(-34, -30, 26, -32, 30, 4); c.quadraticCurveTo(0, 14, -36, 6); c.closePath(); }
      casco(); c.fillStyle = grad(c, 0, -28, 0, 10, [[0, '#8a6a2a'], [0.5, '#6b5220'], [1, '#3e2f12']]); c.fill();
      c.save(); casco(); c.clip(); c.strokeStyle = 'rgba(240,210,140,0.55)'; c.lineWidth = 1.5;
      [[-12, -12], [6, -14], [-24, -2], [18, -2], [-4, 0]].forEach(function (h) { c.beginPath(); for (var i = 0; i <= 6; i++) { var an = i / 6 * TAU; c[i ? 'lineTo' : 'moveTo'](h[0] + Math.cos(an) * 8, h[1] + Math.sin(an) * 6.5); } c.stroke(); });
      c.fillStyle = 'rgba(255,255,255,0.22)'; elipse(c, -4, -20, 22, 5); c.fill(); c.restore();
      casco(); c.strokeStyle = 'rgba(30,20,5,0.8)'; c.lineWidth = 1.6; c.stroke();
      c.fillStyle = '#c8b070'; c.beginPath(); c.moveTo(-34, 6); c.quadraticCurveTo(0, 15, 29, 4); c.quadraticCurveTo(0, 10, -34, 6); c.fill(); },
    polvo: function (c, k) {
      var w = Math.sin(k * TAU), cor = '#c8366e', esc = '#7a1a48';
      // oito braços para trás, ondulando, com ventosas
      for (var i = 0; i < 8; i++) {
        var y0 = -8 + i * 3, fa = k * TAU + i * 0.8, cx = -20, cy = y0 + Math.sin(fa) * 10, ex = -48 - (i % 3) * 3, ey = y0 * 1.6 + Math.sin(fa + 1.5) * 12;
        c.strokeStyle = i % 2 ? esc : cor; c.lineCap = 'round'; c.lineWidth = 6 - (i % 3); c.beginPath(); c.moveTo(-2, y0 * 0.6); c.quadraticCurveTo(cx, cy, ex, ey); c.stroke();
        c.fillStyle = 'rgba(255,220,230,0.8)'; for (var v = 1; v < 4; v++) { var f = v / 4.2; elipse(c, (1 - f) * (1 - f) * -2 + 2 * (1 - f) * f * cx + f * f * ex, (1 - f) * (1 - f) * y0 * 0.6 + 2 * (1 - f) * f * cy + f * f * ey + 1.6, 1.1, 1.1); c.fill(); }
      }
      // cabeça (manto) que pulsa
      var s = 1 + w * 0.05;
      c.save(); c.scale(s, 1 / s);
      c.fillStyle = grad(c, 0, -28, 0, 14, [[0, '#ff6fa6'], [0.6, cor], [1, esc]]); elipse(c, 10, -10, 26, 19, -0.15); c.fill();
      c.fillStyle = 'rgba(255,190,220,0.55)'; for (var p = 0; p < 9; p++) { elipse(c, -6 + (p * 13) % 30, -22 + (p * 7) % 18, 2.4, 2); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,0.35)'; elipse(c, 6, -20, 12, 5, -0.3); c.fill();
      c.strokeStyle = 'rgba(60,5,30,0.7)'; c.lineWidth = 1.5; elipse(c, 10, -10, 26, 19, -0.15); c.stroke();
      c.restore();
      olhoFofo(c, 28, -8, 7); olhoFofo(c, 16, -5, 6); bochecha(c, 30, 3, 3.5); sorriso(c, 24, 0, 3.4); },
    lagosta: function (c, k) {
      var w = Math.sin(k * TAU), cor = '#d8432b', esc = '#8a1f12';
      c.strokeStyle = '#e8705a'; c.lineWidth = 1.2; c.lineCap = 'round';   // antenas compridas
      c.beginPath(); c.moveTo(30, -6); c.quadraticCurveTo(60, -30 + w * 4, 70, -10 + w * 6); c.stroke(); c.beginPath(); c.moveTo(30, -4); c.quadraticCurveTo(58, -18 - w * 3, 72, 4 - w * 4); c.stroke();
      c.strokeStyle = esc; c.lineWidth = 2; for (var l = 0; l < 4; l++) { var ph = Math.sin(k * TAU * 2 + l * 1.2) * 3; c.beginPath(); c.moveTo(4 - l * 6, 6); c.lineTo(2 - l * 6 + ph, 16); c.lineTo(-1 - l * 6 + ph, 20); c.stroke(); }
      // pinças
      [[1, -8], [-1, 8]].forEach(function (pp) { c.save(); c.translate(26, pp[1] * 0.6); c.rotate(pp[0] * -0.25 + w * 0.12);
        c.strokeStyle = cor; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(14, pp[1] * 0.8); c.stroke();
        c.fillStyle = grad(c, 14, -6, 14, 6, [[0, '#ff6a4a'], [1, esc]]); elipse(c, 22, pp[1] * 0.9, 10, 5.5, pp[0] * -0.2); c.fill(); c.strokeStyle = 'rgba(60,5,0,0.7)'; c.lineWidth = 1; c.stroke();
        var ab = 0.2 + Math.max(0, Math.sin(k * TAU * 2)) * 0.25; c.save(); c.translate(30, pp[1] * 0.9); c.rotate(pp[0] * -ab); c.fillStyle = cor; elipse(c, 5, -pp[0] * 1.5, 6, 2.6); c.fill(); c.restore(); c.restore(); });
      // rabo em gomos e leque
      for (var g = 0; g < 5; g++) { var x = -8 - g * 7.5, y = Math.sin(k * TAU + g * 0.6) * 1.5 * g / 4; c.fillStyle = grad(c, x, -8, x, 8, [[0, '#ff6a4a'], [1, esc]]); elipse(c, x, y, 5.5, 8 - g * 0.6); c.fill(); c.strokeStyle = 'rgba(60,5,0,0.6)'; c.lineWidth = 0.9; c.stroke(); }
      c.save(); c.translate(-44, 0); c.rotate(Math.sin(k * TAU) * 0.15); c.fillStyle = '#ff7a5a'; c.beginPath(); c.moveTo(4, 0); c.lineTo(-10, -9); c.lineTo(-12, 0); c.lineTo(-10, 9); c.closePath(); c.fill(); c.restore();
      // carapaça
      c.fillStyle = grad(c, 0, -12, 0, 10, [[0, '#ff7a5a'], [0.5, cor], [1, esc]]); elipse(c, 12, 0, 18, 10); c.fill();
      c.strokeStyle = 'rgba(60,5,0,0.75)'; c.lineWidth = 1.3; c.stroke(); c.fillStyle = 'rgba(255,255,255,0.3)'; elipse(c, 10, -5, 10, 2.5); c.fill();
      c.fillStyle = 'rgba(255,220,120,0.6)'; for (var s = 0; s < 6; s++) { elipse(c, 2 + s * 4, (s % 2 ? 3 : -3), 1, 1); c.fill(); }
      olho(c, 27, -6, 2.8, '#111'); },
    caranguejo: function (c, k) {
      var w = Math.sin(k * TAU * 2), cor = '#e2572d', esc = '#8a2510';
      c.strokeStyle = esc; c.lineWidth = 3; c.lineCap = 'round';   // patinhas andando
      for (var i = 0; i < 4; i++) [-1, 1].forEach(function (lado) { var ph = Math.sin(k * TAU * 2 + i + (lado > 0 ? 0 : Math.PI)) * 4; c.beginPath(); c.moveTo(lado * (10 + i * 3), 6); c.lineTo(lado * (22 + i * 5) + ph, 12 - i); c.lineTo(lado * (26 + i * 5) + ph, 24 - i * 2); c.stroke(); });
      [-1, 1].forEach(function (lado) {   // pinças grandes, abrem e fecham
        c.save(); c.translate(lado * 18, -8); c.strokeStyle = cor; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 0); c.lineTo(lado * 10, -14); c.stroke();
        c.translate(lado * 12, -20); c.fillStyle = grad(c, 0, -10, 0, 8, [[0, '#ff8a5a'], [1, esc]]); elipse(c, 0, 0, 9, 8); c.fill(); c.strokeStyle = 'rgba(60,5,0,0.7)'; c.lineWidth = 1.2; c.stroke();
        var ab = 0.25 + Math.max(0, w) * 0.4; c.save(); c.rotate(-lado * ab - (lado < 0 ? Math.PI : 0)); c.fillStyle = cor; c.beginPath(); c.moveTo(4, -3); c.quadraticCurveTo(14, -8, 15, -2); c.quadraticCurveTo(10, -1, 4, 1); c.fill(); c.restore();
        c.restore(); });
      c.fillStyle = grad(c, 0, -18, 0, 12, [[0, '#ff8a5a'], [0.55, cor], [1, esc]]); elipse(c, 0, 0, 24, 15); c.fill();
      c.strokeStyle = 'rgba(60,5,0,0.75)'; c.lineWidth = 1.6; c.stroke(); c.fillStyle = 'rgba(255,255,255,0.3)'; elipse(c, -4, -8, 14, 3.5); c.fill();
      c.fillStyle = 'rgba(255,230,150,0.55)'; [[-10, -2], [8, -4], [0, 4], [14, 3], [-16, 4]].forEach(function (p) { elipse(c, p[0], p[1], 1.6, 1.4); c.fill(); });
      [-7, 7].forEach(function (x) { c.strokeStyle = esc; c.lineWidth = 2; c.beginPath(); c.moveTo(x, -12); c.lineTo(x, -18); c.stroke(); olhoFofo(c, x, -22, 5); });
      bochecha(c, -12, 2, 3); bochecha(c, 12, 2, 3); sorriso(c, 0, -2, 4.4, '#5a1208'); },
    morsa: function (c, k) {
      var w = Math.sin(k * TAU), cor = '#9a7660', esc = '#5e4434';
      c.save(); c.translate(-42, 0); c.rotate(w * 0.3); c.fillStyle = esc; c.beginPath(); c.moveTo(6, 0); c.quadraticCurveTo(-8, -14, -14, -12); c.quadraticCurveTo(-8, 0, -14, 12); c.quadraticCurveTo(-8, 14, 6, 0); c.fill(); c.restore();
      function corpo() { c.beginPath(); c.moveTo(-40, 0); c.bezierCurveTo(-30, -26, 20, -32, 40, -14); c.bezierCurveTo(52, -4, 50, 16, 34, 20); c.bezierCurveTo(10, 26, -30, 18, -40, 0); c.closePath(); }
      corpo(); c.fillStyle = grad(c, 0, -30, 0, 24, [[0, '#b8927a'], [0.55, cor], [1, esc]]); c.fill();
      c.save(); corpo(); c.clip(); c.fillStyle = 'rgba(80,50,35,0.25)'; for (var i = 0; i < 6; i++) { c.beginPath(); c.arc(-20 + i * 9, -6, 14, 0.3, 1.2); c.strokeStyle = 'rgba(80,50,35,0.3)'; c.lineWidth = 1; c.stroke(); } volume(c, 25, 90); c.restore();
      corpo(); c.strokeStyle = 'rgba(40,25,15,0.75)'; c.lineWidth = 1.6; c.stroke();
      c.save(); c.translate(14, 14); c.rotate(0.3 + w * 0.6); c.fillStyle = esc; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-6, 14, -18, 18); c.quadraticCurveTo(-6, 6, 4, 2); c.fill(); c.restore();   // nadadeira que rema
      // focinho com bigode e presas
      c.fillStyle = '#c8a890'; elipse(c, 42, 6, 9, 7); c.fill(); elipse(c, 34, 7, 9, 7); c.fill();
      c.fillStyle = 'rgba(60,40,30,0.6)'; for (var p = 0; p < 10; p++) { elipse(c, 32 + (p * 5) % 16, 4 + (p * 3) % 7, 0.7, 0.7); c.fill(); }
      c.strokeStyle = '#f2ecdc'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(34, 12); c.quadraticCurveTo(35, 22, 32, 30); c.stroke(); c.beginPath(); c.moveTo(42, 12); c.quadraticCurveTo(44, 22, 42, 30); c.stroke();
      c.strokeStyle = 'rgba(120,100,80,0.6)'; c.lineWidth = 0.8; c.stroke();
      c.fillStyle = '#1a120c'; elipse(c, 36, -6, 2.4, 2.6); c.fill(); c.fillStyle = '#fff'; elipse(c, 35.4, -6.8, 0.8, 0.8); c.fill();
      c.fillStyle = 'rgba(255,140,140,0.35)'; elipse(c, 30, 0, 4, 2.4); c.fill(); },
    tubarao: function (c, k) { tubarao(c, { alt: 0.4, dorso: '#24335a', meio: '#3e5a8c', ventre: '#c8d4e6', desenho: neon('#b07bff', '#6ad7ff') }, k); },
    martelo: function (c, k) { tubarao(c, { alt: 0.38, dorso: '#2a4c6a', meio: '#4f7898', ventre: '#d6e4ee', desenho: neon('#3fe0ff', '#7affd0'),
      cabeca: function (c, a) {
        var top = -a * 1.75, bot = a * 1.45;
        c.fillStyle = grad(c, 44, 0, 62, 0, [[0, '#2a4c6a'], [1, '#4f7898']]);
        c.beginPath(); c.moveTo(42, -a * 0.45); c.quadraticCurveTo(44, top, 52, top - 2); c.quadraticCurveTo(62, top, 62, top + 6);
        c.quadraticCurveTo(64, 0, 61, bot - 6); c.quadraticCurveTo(60, bot + 2, 52, bot + 1); c.quadraticCurveTo(46, bot, 44, a * 0.4); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(5,10,25,0.75)'; c.lineWidth = 1.4; c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.moveTo(50, top + 2); c.quadraticCurveTo(58, top + 1, 58, top + 8); c.lineTo(55, -a * 0.2); c.closePath(); c.fill();
        [top + 5, bot - 5].forEach(function (yy) { olho(c, 58, yy, 2.9, '#e0b020'); });
        c.strokeStyle = 'rgba(20,10,10,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(52, a * 0.5); c.quadraticCurveTo(46, a * 0.62, 40, a * 0.48); c.stroke();
      } }, k); },
    'tubarao-baleia': function (c, k) { tubarao(c, { alt: 0.42, dorso: '#1d3a5a', meio: '#3a6a90', ventre: '#d8e6f0',
      desenho: function (c, a) { c.fillStyle = 'rgba(230,245,255,0.75)'; for (var x = -40; x < 46; x += 6) for (var y = -a; y < a * 0.2; y += 6) { elipse(c, x + (y % 12 ? 3 : 0), y, 1.4, 1.4); c.fill(); }
        c.strokeStyle = 'rgba(230,245,255,0.35)'; c.lineWidth = 1; for (var i = 0; i < 9; i++) { c.beginPath(); c.moveTo(-38 + i * 10, -a); c.lineTo(-38 + i * 10, a * 0.1); c.stroke(); } },
      cabeca: function (c, a) { c.fillStyle = '#0b1420'; c.beginPath(); c.moveTo(53, 2); c.quadraticCurveTo(46, a * 0.4, 36, a * 0.3); c.quadraticCurveTo(46, a * 0.15, 53, 2); c.fill(); olho(c, 38, -a * 0.15, 2.6, '#c9a020'); } }, k); },
    lanterna: function (c, k) {
      var w = Math.sin(k * TAU), luz = 0.6 + 0.4 * Math.sin(k * TAU * 2);
      peixe(c, { alt: 0.75, dorso: '#141826', meio: '#262c44', ventre: '#3a3550', nad: '#3fffd0', rabo: '#20c0a0', iris: '#ffe24a', raboForma: 'redondo', lisa: true, olhao: true,
        desenho: function (c, a) { c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(60,255,210,0.5)'; for (var i = 0; i < 7; i++) { elipse(c, -26 + i * 8, a * 0.3 + (i % 2) * 4, 1.4, 1.4); c.fill(); } c.globalCompositeOperation = 'source-over'; },
        cabeca: function (c, a) {
          // a varinha com a luz na ponta
          c.strokeStyle = '#2b3350'; c.lineWidth = 2; c.beginPath(); c.moveTo(24, -a * 0.85); c.quadraticCurveTo(40, -a * 1.7, 58 + w * 2, -a * 1.1); c.stroke();
          c.globalCompositeOperation = 'lighter';
          c.fillStyle = radial(c, 58 + w * 2, -a * 1.1, 0, 16, [[0, 'rgba(160,255,240,' + luz + ')'], [0.3, 'rgba(60,255,210,' + luz * 0.6 + ')'], [1, 'rgba(60,255,210,0)']]); elipse(c, 58 + w * 2, -a * 1.1, 16, 16); c.fill();
          c.globalCompositeOperation = 'source-over';
          c.fillStyle = '#eaffff'; elipse(c, 58 + w * 2, -a * 1.1, 3, 3); c.fill();
        },
        boca: function (c, a) { c.fillStyle = '#05050a'; c.beginPath(); c.moveTo(52, -a * 0.1); c.quadraticCurveTo(40, a * 0.7, 22, a * 0.45); c.quadraticCurveTo(40, a * 0.3, 52, -a * 0.1); c.fill();
          c.fillStyle = '#f4f0e0'; for (var i = 0; i < 6; i++) { var x = 48 - i * 4.4; c.beginPath(); c.moveTo(x, a * 0.02 + i * 0.4); c.lineTo(x - 1.4, a * 0.28 + i); c.lineTo(x - 2.8, a * 0.06 + i * 0.4); c.fill(); c.beginPath(); c.moveTo(x - 1, a * 0.56 - i * 0.2); c.lineTo(x - 2.2, a * 0.36); c.lineTo(x - 3.4, a * 0.55 - i * 0.2); c.fill(); } } }, k); },
    baleia: function (c, k) {
      // baleia fofa: cabeçona redonda, sorriso e brilhinhos; a cauda sobe e desce, a nadadeira rema
      var w = Math.sin(k * TAU), w2 = Math.sin(k * TAU + 1.3), cor = '#4a6fa8', esc = '#2c4778', clara = '#b8cbe6';
      c.save(); c.translate(-36, -6); c.rotate(-0.35 + w * 0.3);
      c.fillStyle = grad(c, 0, -20, 0, 10, [[0, cor], [1, esc]]); c.beginPath(); c.moveTo(4, 2); c.quadraticCurveTo(-8, -8, -10, -22); c.quadraticCurveTo(-18, -24, -26, -18 - w * 3); c.quadraticCurveTo(-16, -14, -12, -6); c.quadraticCurveTo(-22, -4, -28, 4 + w * 3); c.quadraticCurveTo(-14, 6, 4, 8); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(10,20,45,0.6)'; c.lineWidth = 1.3; c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.45)'; [[-16, -18], [-22, -10], [-12, -12]].forEach(function (q) { elipse(c, q[0], q[1], 1.2, 1.2); c.fill(); }); c.restore();
      function corpo() { c.beginPath(); c.moveTo(-40, 2); c.bezierCurveTo(-34, -14, -10, -18, 10, -26); c.bezierCurveTo(44, -36, 56, -10, 52, 6); c.bezierCurveTo(50, 22, 30, 26, 6, 22); c.bezierCurveTo(-16, 18, -34, 14, -40, 2); c.closePath(); }
      corpo(); c.fillStyle = grad(c, 0, -34, 0, 24, [[0, '#6a90c8'], [0.45, cor], [1, esc]]); c.fill();
      c.save(); corpo(); c.clip();
      c.fillStyle = grad(c, 0, 4, 0, 24, [[0, clara], [1, '#e6eef8']]); c.beginPath(); c.moveTo(54, 4); c.bezierCurveTo(40, 12, 10, 10, -10, 16); c.lineTo(-10, 30); c.lineTo(60, 30); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(80,100,140,0.35)'; c.lineWidth = 0.9; for (var i = 0; i < 6; i++) { c.beginPath(); c.moveTo(46 - i * 6, 10 + i); c.quadraticCurveTo(30 - i * 6, 16, 14 - i * 6, 18); c.stroke(); }
      c.fillStyle = radial(c, 24, -22, 2, 40, [[0, 'rgba(255,255,255,0.5)'], [1, 'rgba(255,255,255,0)']]); c.fillRect(-40, -40, 100, 50);
      c.restore();
      corpo(); c.strokeStyle = 'rgba(10,20,45,0.7)'; c.lineWidth = 1.6; c.stroke();
      // sorriso grande com boquinha rosa
      c.fillStyle = '#7a1a2a'; c.beginPath(); c.moveTo(52, 4); c.quadraticCurveTo(40, 14, 22, 8); c.quadraticCurveTo(40, 9, 52, 4); c.fill();
      c.fillStyle = '#ff8aa0'; elipse(c, 40, 9, 5, 1.5); c.fill();
      c.save(); c.translate(10, 14); c.rotate(0.6 + w2 * 0.45); c.scale(0.6 + 0.4 * Math.abs(Math.cos(k * TAU + 1.3)), 1);
      c.fillStyle = grad(c, 0, 0, -16, 16, [[0, cor], [1, esc]]); c.beginPath(); c.moveTo(0, -2); c.quadraticCurveTo(-8, 8, -18, 14); c.quadraticCurveTo(-12, 18, -6, 12); c.quadraticCurveTo(0, 6, 4, 2); c.closePath(); c.fill(); c.restore();
      olhoFofo(c, 28, -8, 5.2); bochecha(c, 32, 1, 3.4);
      c.fillStyle = '#fff'; [[6, -24], [-14, -10], [40, -24]].forEach(function (q, n) { var b = 0.5 + 0.5 * Math.sin(k * TAU + n * 2); c.globalAlpha = b; c.beginPath(); c.moveTo(q[0], q[1] - 3); c.lineTo(q[0] + 0.8, q[1] - 0.8); c.lineTo(q[0] + 3, q[1]); c.lineTo(q[0] + 0.8, q[1] + 0.8); c.lineTo(q[0], q[1] + 3); c.lineTo(q[0] - 0.8, q[1] + 0.8); c.lineTo(q[0] - 3, q[1]); c.lineTo(q[0] - 0.8, q[1] - 0.8); c.closePath(); c.fill(); }); c.globalAlpha = 1; },
    orca: function (c, k) {
      var w = Math.sin(k * TAU), w2 = Math.sin(k * TAU + 1.3);
      c.save(); c.translate(-42, 0); c.rotate(w * 0.28);
      c.fillStyle = '#14161c'; c.beginPath(); c.moveTo(6, -3); c.quadraticCurveTo(-6, -6, -12, -18 - w * 2); c.quadraticCurveTo(-8, -4, -14, 0); c.quadraticCurveTo(-8, 4, -12, 18 + w * 2); c.quadraticCurveTo(-6, 6, 6, 3); c.closePath(); c.fill(); c.restore();
      c.fillStyle = '#14161c'; c.beginPath(); c.moveTo(-6, -16); c.quadraticCurveTo(2, -38, 6 + w2, -42); c.quadraticCurveTo(8, -28, 14, -17); c.closePath(); c.fill();
      function corpo() { c.beginPath(); c.moveTo(52, 3); c.bezierCurveTo(48, -20, 10, -22, -44, -4); c.lineTo(-44, 4); c.bezierCurveTo(-6, 18, 34, 20, 52, 3); c.closePath(); }
      corpo(); c.fillStyle = grad(c, 0, -20, 0, 18, [[0, '#262a34'], [1, '#0e1016']]); c.fill();
      c.save(); corpo(); c.clip();
      c.fillStyle = '#f4f6fa'; c.beginPath(); c.moveTo(54, 6); c.bezierCurveTo(36, 8, 20, 10, 6, 14); c.bezierCurveTo(-6, 6, -18, 8, -24, 14); c.lineTo(-30, 30); c.lineTo(60, 30); c.closePath(); c.fill();
      c.fillStyle = '#f4f6fa'; elipse(c, 30, -7, 8, 3.6, -0.15); c.fill();   // a mancha branca atrás do olho
      c.fillStyle = 'rgba(200,210,225,0.55)'; elipse(c, -4, -12, 10, 3, 0.1); c.fill();
      volume(c, 20, 100); c.restore();
      corpo(); c.strokeStyle = 'rgba(0,0,0,0.85)'; c.lineWidth = 1.5; c.stroke();
      c.save(); c.translate(12, 10); c.rotate(0.6 + w2 * 0.4); c.scale(0.6 + 0.4 * Math.abs(Math.cos(k * TAU + 1.3)), 1); c.fillStyle = '#14161c'; elipse(c, -8, 6, 11, 5, 0.6); c.fill(); c.restore();
      olhoFofo(c, 38, -4, 3.4); bochecha(c, 42, 2, 2.4);
      c.strokeStyle = '#5a1a1a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(52, 4); c.quadraticCurveTo(44, 8, 34, 6); c.stroke(); },
    sereia: function (c, k) {
      var w = Math.sin(k * TAU), pele = '#b87342';
      c.strokeStyle = '#140c08'; c.lineCap = 'round';   // cabelo em mechas
      for (var i = 0; i < 7; i++) { c.lineWidth = 3.6 - i * 0.3; c.beginPath(); c.moveTo(32, -22 + i * 1.5); c.bezierCurveTo(20, -27 + i * 2 + w * 2, 6, -18 + i * 2 - w * 3, -10 - i * 2, -20 + i * 3 + w * 5); c.stroke(); }
      c.strokeStyle = 'rgba(160,120,220,0.4)'; c.lineWidth = 0.8; for (var i2 = 0; i2 < 3; i2++) { c.beginPath(); c.moveTo(30, -22 + i2 * 3); c.bezierCurveTo(18, -26 + i2 * 3 + w * 2, 6, -17 + i2 * 3 - w * 3, -6 - i2 * 2, -18 + i2 * 3 + w * 5); c.stroke(); }
      c.save(); c.translate(0, 2);
      function cauda() { c.beginPath(); c.moveTo(4, -9); c.bezierCurveTo(-16, -12, -32, -4, -42, -2); c.lineTo(-42, 4); c.bezierCurveTo(-30, 6, -16, 12, 4, 9); c.closePath(); }
      cauda(); c.fillStyle = grad(c, 0, -10, 0, 10, [[0, '#0d9a86'], [0.5, '#2ee6b8'], [1, '#0a6e6a']]); c.fill();
      c.save(); cauda(); c.clip(); for (var x = -42; x < 6; x += 4) for (var y = -12; y < 12; y += 4) { c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 0.6; c.beginPath(); c.arc(x, y + ((x / 4) % 2 ? 2 : 0), 3, 0.6, 2.5); c.stroke(); }
      c.globalCompositeOperation = 'lighter'; c.fillStyle = grad(c, -40, -8, 4, 8, [[0, 'rgba(255,120,220,0.25)'], [1, 'rgba(120,255,255,0.25)']]); c.fillRect(-44, -12, 50, 24); c.globalCompositeOperation = 'source-over';
      c.restore();
      cauda(); c.strokeStyle = 'rgba(0,50,50,0.6)'; c.lineWidth = 1; c.stroke();
      c.save(); c.translate(-42, 1); c.rotate(w * 0.4);
      nad(c, function () { c.beginPath(); c.moveTo(2, 0); c.quadraticCurveTo(-8, -18, -20, -23); c.quadraticCurveTo(-11, -5, -13, 0); c.quadraticCurveTo(-11, 5, -20, 23); c.quadraticCurveTo(-8, 18, 2, 0); c.closePath(); }, [0, 0], [-18, 0], '#7ef0d0', 0.9, leque(0, [-20, -22], [-20, 22], 8));
      c.restore(); c.restore();
      c.fillStyle = pele; c.beginPath(); c.moveTo(2, -9); c.quadraticCurveTo(14, -14, 26, -10); c.quadraticCurveTo(30, 0, 24, 8); c.quadraticCurveTo(12, 12, 2, 10); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.2)'; elipse(c, 14, -7, 9, 2.4); c.fill();
      [[15, -5], [19, -1]].forEach(function (q) { c.fillStyle = '#ffa0c0'; c.beginPath(); c.moveTo(q[0], q[1] + 2.6); c.lineTo(q[0] - 2.8, q[1] - 1.4); c.quadraticCurveTo(q[0], q[1] - 3.6, q[0] + 2.8, q[1] - 1.4); c.closePath(); c.fill(); });
      c.strokeStyle = pele; c.lineWidth = 3.6; c.lineCap = 'round';   // braços nadando
      c.beginPath(); c.moveTo(22, -8); c.quadraticCurveTo(34, -10 + w * 4, 46, -4 + w * 6); c.stroke();
      c.beginPath(); c.moveTo(20, 6); c.quadraticCurveTo(30, 12 - w * 3, 40, 10 - w * 5); c.stroke();
      c.fillStyle = pele; elipse(c, 36, -16, 10.5, 10); c.fill();
      c.fillStyle = '#140c08'; c.beginPath(); c.moveTo(26, -18); c.quadraticCurveTo(32, -31, 45, -22); c.quadraticCurveTo(38, -25, 29, -11); c.closePath(); c.fill();
      c.strokeStyle = '#2a1a12'; c.lineWidth = 1.2; c.beginPath(); c.arc(40, -16, 2.2, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
      c.fillStyle = 'rgba(255,110,120,0.5)'; elipse(c, 41, -11.5, 2.4, 1.4); c.fill();
      c.strokeStyle = '#7a2a20'; c.lineWidth = 1; c.beginPath(); c.arc(42, -10, 2, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
      c.fillStyle = '#fff'; for (var f = 0; f < 5; f++) { var an = f / 5 * TAU; elipse(c, 30 + Math.cos(an) * 2.6, -24 + Math.sin(an) * 2.6, 2.1, 2.1); c.fill(); }
      c.fillStyle = '#ffcf33'; elipse(c, 30, -24, 1.6, 1.6); c.fill(); },
    abissal: function (c, k) { peixe(c, { alt: 0.6, dorso: '#0c0c10', meio: '#1c1a22', ventre: '#2a2430', nad: '#3a4a40', rabo: '#33443a', iris: '#ffd23f', lisa: true, olhao: true,
      desenho: function (c, a, k) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,40,30,' + (0.55 + 0.25 * Math.sin(k * TAU)) + ')'; c.lineWidth = 2.2;
        for (var i = 0; i < 4; i++) { c.beginPath(); c.moveTo(14 - i * 5, -a * 0.6); c.lineTo(4 - i * 5, a * 0.5); c.stroke(); } c.globalCompositeOperation = 'source-over'; },
      boca: function (c, a) { c.fillStyle = '#050505'; c.beginPath(); c.moveTo(51, -2); c.quadraticCurveTo(44, a * 0.35, 38, a * 0.25); c.quadraticCurveTo(46, a * 0.1, 51, -2); c.fill(); c.fillStyle = '#eee'; for (var i = 0; i < 4; i++) { c.beginPath(); c.moveTo(49 - i * 3, 1 + i); c.lineTo(48 - i * 3, a * 0.2 + i); c.lineTo(47 - i * 3, 1 + i); c.fill(); } } }, k); },
    pirarucu: function (c, k) { peixe(c, { alt: 0.36, dorso: '#8a5410', meio: '#e8b23a', ventre: '#fff2b8', nad: '#d8761a', rabo: '#e0401a', iris: '#ffdd55', raboForma: 'redondo', irisado: true,
      desenho: function (c, a, k) { c.fillStyle = 'rgba(230,50,20,0.6)'; for (var x = -36; x < -4; x += 5) for (var y = -a; y < a; y += 5) { c.beginPath(); c.arc(x, y + ((x / 5) % 2 ? 2.5 : 0), 3, -1, 1); c.fill(); }
        c.globalCompositeOperation = 'lighter'; for (var i = 0; i < 5; i++) { var b = Math.max(0, Math.sin(k * TAU + i * 1.3)); c.fillStyle = 'rgba(255,240,160,' + b * 0.8 + ')'; elipse(c, -24 + i * 12, -a * 0.4 + (i % 2) * 6, 2 * b + 0.2, 2 * b + 0.2); c.fill(); } c.globalCompositeOperation = 'source-over'; } }, k); },
    // prêmios
    bota: function (c) {
      c.save(); c.rotate(0.15);
      c.fillStyle = grad(c, 0, -30, 0, 20, [[0, '#8a5a32'], [1, '#4a2c14']]);
      c.beginPath(); c.moveTo(-14, -32); c.lineTo(8, -32); c.lineTo(8, 4); c.quadraticCurveTo(30, 4, 34, 14); c.lineTo(34, 20); c.lineTo(-16, 20); c.closePath(); c.fill(); c.strokeStyle = '#2a1608'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#2a1a0c'; c.fillRect(-17, 17, 52, 6);
      c.strokeStyle = '#e8d8b0'; c.lineWidth = 1.2; for (var i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-6, -24 + i * 7); c.lineTo(6, -20 + i * 7); c.moveTo(6, -24 + i * 7); c.lineTo(-6, -20 + i * 7); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,0.18)'; elipse(c, -4, -10, 4, 18); c.fill();
      c.strokeStyle = '#2f9e57'; c.lineWidth = 2; c.beginPath(); c.moveTo(-10, -32); c.quadraticCurveTo(-16, -44, -8, -50); c.stroke();
      c.restore(); },
    garrafa: function (c, k) {
      c.save(); c.rotate(-0.5 + Math.sin(k * TAU) * 0.1);
      c.fillStyle = 'rgba(80,200,170,0.55)'; c.beginPath(); c.moveTo(-30, -11); c.lineTo(14, -11); c.quadraticCurveTo(22, -11, 26, -5); c.lineTo(36, -5); c.lineTo(36, 5); c.lineTo(26, 5); c.quadraticCurveTo(22, 11, 14, 11); c.lineTo(-30, 11); c.quadraticCurveTo(-34, 0, -30, -11); c.fill();
      c.strokeStyle = 'rgba(220,255,250,0.85)'; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = '#f2e6c0'; c.save(); c.translate(-6, 0); c.rotate(0.05); c.fillRect(-16, -5, 30, 10); c.fillStyle = '#c8a870'; elipse(c, -16, 0, 2.5, 5); c.fill(); elipse(c, 14, 0, 2.5, 5); c.fill(); c.strokeStyle = 'rgba(120,80,30,0.5)'; c.lineWidth = 0.6; for (var l = -10; l < 10; l += 4) { c.beginPath(); c.moveTo(l, -3); c.lineTo(l + 3, -3); c.stroke(); } c.restore();
      c.fillStyle = '#b08850'; c.fillRect(36, -4, 7, 8);
      c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(-26, -8, 34, 2.4);
      c.restore(); },
    bau: function (c, k) {
      var ab = 0.18 + Math.max(0, Math.sin(k * TAU)) * 0.12;
      c.globalCompositeOperation = 'lighter'; c.fillStyle = radial(c, 0, -10, 0, 40, [[0, 'rgba(255,220,90,0.55)'], [1, 'rgba(255,200,60,0)']]); elipse(c, 0, -8, 40, 30); c.fill(); c.globalCompositeOperation = 'source-over';
      c.fillStyle = grad(c, 0, -10, 0, 24, [[0, '#9a5e26'], [1, '#5a3010']]); c.fillRect(-30, -8, 60, 30); c.strokeStyle = '#2a1608'; c.lineWidth = 1.5; c.strokeRect(-30, -8, 60, 30);
      c.strokeStyle = 'rgba(40,20,5,0.5)'; c.lineWidth = 1; for (var y = 0; y < 22; y += 7) { c.beginPath(); c.moveTo(-30, y); c.lineTo(30, y); c.stroke(); }
      c.fillStyle = '#ffd34a'; [-30, -4, 22].forEach(function (x) { c.fillRect(x, -8, 8, 30); }); c.fillStyle = '#c99a1a'; c.fillRect(-4, 4, 8, 8);
      c.fillStyle = '#ffd34a'; for (var m = 0; m < 6; m++) { elipse(c, -18 + m * 7, -9 - (m % 2) * 3, 4.5, 2.4); c.fill(); }
      c.save(); c.translate(-30, -8); c.rotate(-ab); c.fillStyle = grad(c, 0, -16, 0, 0, [[0, '#b06c2e'], [1, '#6a3a14']]); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(30, -26, 60, 0); c.closePath(); c.fill(); c.strokeStyle = '#2a1608'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#ffd34a'; c.fillRect(0, -6, 8, 6); c.fillRect(26, -14, 8, 14); c.fillRect(52, -6, 8, 6); c.restore();
      c.fillStyle = '#fff'; elipse(c, -14, -12, 1.5, 1.5); c.fill(); elipse(c, 10, -14, 1.2, 1.2); c.fill(); },
    // lixo do "Limpa o Rio!"
    pet: function (c) {
      c.save(); c.rotate(0.4); c.fillStyle = 'rgba(170,220,255,0.6)'; c.beginPath(); c.moveTo(-30, -12); c.lineTo(16, -12); c.quadraticCurveTo(26, -10, 30, -5); c.lineTo(38, -4); c.lineTo(38, 4); c.lineTo(30, 5); c.quadraticCurveTo(26, 10, 16, 12); c.lineTo(-30, 12); c.quadraticCurveTo(-34, 0, -30, -12); c.fill();
      c.strokeStyle = 'rgba(230,250,255,0.9)'; c.lineWidth = 1.2; c.stroke(); c.fillStyle = '#2f9e57'; c.fillRect(-14, -12, 20, 24); c.fillStyle = '#e23d55'; c.fillRect(38, -5, 6, 10); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(-26, -8, 40, 2); c.restore(); },
    lata: function (c) {
      c.save(); c.rotate(-0.3); c.fillStyle = grad(c, 0, -18, 0, 18, [[0, '#ff5a4a'], [0.5, '#c8231a'], [1, '#7a120c']]); c.fillRect(-14, -20, 28, 40);
      c.fillStyle = grad(c, -14, 0, 14, 0, [[0, '#9aa4ad'], [0.5, '#e8eef2'], [1, '#8a949c']]); c.fillRect(-14, -23, 28, 4); c.fillRect(-14, 19, 28, 4);
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-10, -4); c.quadraticCurveTo(0, -12, 10, -4); c.quadraticCurveTo(0, 2, -10, -4); c.fill(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-9, -18, 4, 36); c.restore(); },
    sacola: function (c, k) {
      var w = Math.sin(k * TAU);
      c.fillStyle = 'rgba(245,245,250,0.75)'; c.beginPath(); c.moveTo(-22, -10); c.quadraticCurveTo(-26 + w * 3, 20, -14, 28); c.quadraticCurveTo(0, 32 + w * 3, 14, 28); c.quadraticCurveTo(26 - w * 3, 20, 22, -10); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(200,210,220,0.9)'; c.lineWidth = 1.2; c.stroke();
      c.strokeStyle = 'rgba(240,240,248,0.85)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-22, -10); c.quadraticCurveTo(-18, -30, -10, -10); c.moveTo(22, -10); c.quadraticCurveTo(18, -30, 10, -10); c.stroke();
      c.strokeStyle = 'rgba(180,190,200,0.6)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-8, 0); c.lineTo(-4, 22); c.moveTo(6, 2); c.lineTo(8, 20); c.stroke(); },
    chinelo: function (c) {
      c.save(); c.rotate(-0.2); c.fillStyle = '#1e88e5'; c.beginPath(); c.moveTo(-36, 0); c.bezierCurveTo(-36, -14, 0, -16, 10, -10); c.bezierCurveTo(26, -14, 38, -8, 38, 0); c.bezierCurveTo(38, 10, 20, 14, 10, 10); c.bezierCurveTo(0, 16, -36, 14, -36, 0); c.fill();
      c.fillStyle = '#ffd23f'; c.beginPath(); c.moveTo(-34, 0); c.bezierCurveTo(-34, -10, 0, -12, 10, -7); c.bezierCurveTo(24, -10, 35, -6, 35, 0); c.bezierCurveTo(35, 7, 20, 10, 10, 7); c.bezierCurveTo(0, 12, -34, 10, -34, 0); c.fill();
      c.strokeStyle = '#2f9e57'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(18, 0); c.lineTo(4, -8); c.moveTo(18, 0); c.lineTo(4, 8); c.stroke(); c.restore(); },
    // estrela-do-mar dourada da "Chuva de Estrelas" (desenhada no código)
    estrela: function (c, k) {
      var pulso = 1 + 0.04 * Math.sin(k * TAU);
      c.save(); c.scale(pulso, pulso); c.rotate(Math.sin(k * TAU) * 0.08);
      function forma(R, r) { c.beginPath(); for (var i = 0; i < 10; i++) { var an = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; c[i ? 'lineTo' : 'moveTo'](Math.cos(an) * rr, Math.sin(an) * rr); } c.closePath(); }
      c.lineJoin = 'round'; c.lineWidth = 9; c.strokeStyle = '#e09a10'; forma(46, 21); c.stroke();
      c.fillStyle = radial(c, -8, -10, 2, 50, [[0, '#fff6b0'], [0.45, '#ffd23f'], [1, '#f0a010']]); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.75)'; [[0, -26], [22, -8], [14, 20], [-14, 20], [-22, -8]].forEach(function (q) { elipse(c, q[0] * 0.8, q[1] * 0.8, 2.4, 2.4); c.fill(); });
      olhoFofo(c, -8, -2, 6); olhoFofo(c, 8, -2, 6); bochecha(c, -14, 7, 4); bochecha(c, 14, 7, 4); sorriso(c, 0, 6, 5);
      c.restore();
    },
    pneu: function (c) {
      c.fillStyle = '#1b1d22'; elipse(c, 0, 0, 34, 34); c.fill(); c.fillStyle = '#2f3540'; elipse(c, 0, 0, 30, 30); c.fill();
      c.strokeStyle = '#0c0d10'; c.lineWidth = 3; for (var i = 0; i < 20; i++) { var an = i / 20 * TAU; c.beginPath(); c.moveTo(Math.cos(an) * 28, Math.sin(an) * 28); c.lineTo(Math.cos(an + 0.1) * 34, Math.sin(an + 0.1) * 34); c.stroke(); }
      c.fillStyle = '#0a3f82'; elipse(c, 0, 0, 16, 16); c.fill(); c.strokeStyle = '#555c66'; c.lineWidth = 2; c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.15)'; elipse(c, -12, -16, 10, 4, -0.5); c.fill(); c.strokeStyle = '#2f9e57'; c.lineWidth = 2; c.beginPath(); c.moveTo(10, -26); c.quadraticCurveTo(18, -40, 8, -46); c.stroke(); }
  };
  // quanto o corpo ondula ao nadar (fração do comprimento) e o brilho em volta dos bichos do fundo
  var ONDA = { tartaruga: 0, polvo: 0, 'agua-viva': 0, 'cavalo-marinho': 0, lagosta: 0.01, caranguejo: 0, morsa: 0.02, baleia: 0.025, orca: 0.04, bota: 0, garrafa: 0, bau: 0, pet: 0, lata: 0, sacola: 0, chinelo: 0, pneu: 0,
    menino: 0, menina: 0, filhote: 0, estrela: 0, 'agua-viva-gigante': 0, 'lula-gigante': 0.03, gigante: 0.02, 'peixe-dragao': 0.05 };
  var BRILHO = { abissal: '#ff4a3a', orca: '#9fd0ff', tubarao: '#9a6bff', martelo: '#3fe0ff', 'tubarao-baleia': '#5ad1ff', lanterna: '#3fffd0', baleia: '#6aa8ff', sereia: '#7effe0', pirarucu: '#ffd84a',
    polvo: '#ff5fa2', lagosta: '#ff8a3a', caranguejo: '#ff6a3a', morsa: '#9fd0ff', bau: '#ffcc33', garrafa: '#9ff7ff', 'agua-viva': '#ff9ff0',
    'lula-gigante': '#4aa8ff', 'agua-viva-gigante': '#c08bff', 'peixe-dragao': '#3fffe0', gigante: '#5ad1ff', estrela: '#ffd84a' };
  var ALTURA = { orca: 0.95, 'cavalo-marinho': 1.05, 'agua-viva': 1.1, polvo: 1.0, caranguejo: 1.0, lagosta: 0.9, tartaruga: 0.9, morsa: 1.0, baleia: 0.9, lanterna: 1.25, sereia: 0.8, baleia: 1.0, bota: 1.0, bau: 0.9, pneu: 0.9, sacola: 0.9 };
  PINTA.filhote = PINTA.tartaruga;
  var IMG_DE = { filhote: 'tartaruga' };   // o filhote é a tartaruga pequenininha
  function pintarBicho(c, id, k) { (PINTA[id] || PINTA.lambari)(c, k); }
  // imagens 3D geradas com IA (img/<id>.webp, ver CREDITOS.md): quando carregam, tomam o lugar do desenho feito no código;
  // sem elas (arquivo que não abriu), o jogo continua com o desenho do código
  var IMG = {};
  function carregarImagens(base) {
    if (typeof Image === 'undefined') return;
    R.BICHOS.map(function (b) { return b.id; }).concat(['juca', 'lili', 'mergulhador']).filter(function (id) { return ['sacola', 'estrela', 'filhote'].indexOf(id) < 0; }).forEach(function (id) {   // a sacolinha continua desenhada no código
      var im = new Image(); im.onload = function () { IMG[id] = im; esquecer(id + ':'); if (id === 'tartaruga') esquecer('filhote:'); }; im.src = base + id + '.webp';
    });
  }
  // a tira de quadros de um bicho num tamanho (px de comprimento): cada quadro com as nadadeiras numa fase, o corpo
  // ondulando (colunas de 1 px deslocadas por uma onda que corre da cabeça para o rabo) e o brilho dos bichos do fundo
  // tiras guardadas: quando uma imagem chega, só as tiras daquele bicho são refeitas (antes, todas eram jogadas fora a
  // cada imagem, e o celular simples engasgava); as telas que saem são zeradas na hora (o iPhone demora a soltar a memória)
  var feitas = 0, rascunho = [null, null];
  function esquecer(prefixo) {
    Object.keys(A.sprites).forEach(function (k) { if (!prefixo || k.indexOf(prefixo) === 0) { A.sprites[k].cv.width = 0; delete A.sprites[k]; } });
  }
  function rascunhoDe(i, w, h) {
    var c = rascunho[i];
    if (!c) c = rascunho[i] = tela(w, h);
    if (c.width < w || c.height < h) { c.width = Math.max(c.width, Math.ceil(w)); c.height = Math.max(c.height, Math.ceil(h)); }
    return c;
  }
  function sprite(id, comp) {
    var chave = id + ':' + Math.round(comp), sp = A.sprites[chave];
    if (sp) return sp;
    feitas++;
    var d = R.POR_ID[id] || { alt: 0.5 }, im = IMG[IMG_DE[id] || id], prop = im ? im.naturalHeight / im.naturalWidth : 1, iw = comp * 1.08 / Math.max(1, prop), ih = iw * prop;   // em pé (cavalo-marinho, água-viva): a altura é que vale o comprimento
    var w = Math.ceil(comp * 1.6), h = Math.ceil(im ? Math.max(ih * 1.3, comp * 0.5) : comp * (ALTURA[id] || Math.max(0.95, d.alt * 1.9)));
    var cv = tela(w * QUADROS, h), c = cv.getContext('2d'), b1 = rascunhoDe(0, w, h), c1 = b1.getContext('2d'), b2 = rascunhoDe(1, w, h), c2 = b2.getContext('2d');
    var onda = (ONDA[id] != null ? ONDA[id] : 0.045) * (im ? 1.25 : 1), brilho = BRILHO[id], cabeca = w / 2 + comp * 0.5;
    for (var q = 0; q < QUADROS; q++) {
      c1.clearRect(0, 0, b1.width, b1.height); c1.save(); c1.translate(w / 2, h / 2);
      if (im) { var resp = 1 + 0.03 * Math.sin(q / QUADROS * TAU); c1.scale(1, resp); c1.drawImage(im, -iw / 2, -ih / 2, iw, ih); }   // a imagem 3D "respira" e ondula
      else { c1.scale(comp / 100, comp / 100); pintarBicho(c1, id, q / QUADROS); }
      c1.restore();
      var fonte = b1;
      if (brilho) { c2.clearRect(0, 0, b2.width, b2.height); c2.shadowColor = brilho; c2.shadowBlur = Math.max(4, comp * 0.07); c2.drawImage(b1, 0, 0, w, h, 0, 0, w, h); c2.shadowBlur = 0; fonte = b2; }
      if (!onda) { c.drawImage(fonte, 0, 0, w, h, w * q, 0, w, h); continue; }
      var fase = q / QUADROS * TAU;
      for (var x = 0; x < w; x++) {
        var tt = Math.max(0, Math.min(1.25, (cabeca - x) / comp));
        c.drawImage(fonte, x, 0, 1, h, w * q + x, onda * comp * Math.pow(tt, 1.6) * Math.sin(fase - tt * 2.8), 1, h);
      }
    }
    sp = A.sprites[chave] = { cv: cv, w: w, h: h };
    return sp;
  }
  function desenharBicho(c, id, x, y, comp, dir, k, giro) {
    var px = A.s * Math.min(A.dpr, 1.5), sp = sprite(id, comp * px), q = Math.floor(((k % 1) + 1) % 1 * QUADROS);
    c.save(); c.translate(x, y); if (giro) c.rotate(giro); if (dir < 0) c.scale(-1, 1);
    c.drawImage(sp.cv, sp.w * q, 0, sp.w, sp.h, -sp.w / px / 2, -sp.h / px / 2, sp.w / px, sp.h / px);
    c.restore();
  }

  /* =================================================================== coisas vivas */
  var vivos = null;
  function prepararVivos() {
    var r = rnd(29), W = A.W;
    vivos = { bolhas: [], luzes: [], plantas: [], nuvens: [], plancton: [], colunas: [], anemonas: [], cardumes: [] };
    for (var i = 0; i < 46; i++) vivos.bolhas.push({ x: r() * W, y: A.sup + r() * (H - A.sup), r: 1.5 + Math.pow(r(), 2) * 7, v: 25 + r() * 45, f: r() * 6 });
    for (var c2 = 0; c2 < Math.max(2, W / 500); c2++) vivos.colunas.push({ x: (0.1 + r() * 0.8) * W, f: r() * 6 });   // filetes de bolhas saindo do fundo
    for (var j = 0; j < 40; j++) vivos.luzes.push({ x: r() * W, y: A.sup + (0.45 + r() * 0.5) * (H - A.sup), r: 1 + r() * 2.4, f: r() * 6, cor: ['#9ff', '#f9f', '#ff9', '#9f9'][j % 4] });
    for (var p = 0; p < 60; p++) vivos.plancton.push({ x: r() * W, y: A.sup + r() * (H - A.sup), f: r() * 6, v: 3 + r() * 8 });
    for (var k = 0; k < W / 95; k++) vivos.plantas.push({ x: r() * W, h: 60 + r() * 110, f: r() * 6, cor: ['#2fae6a', '#1f8f5e', '#45c48a', '#7c5cd6'][k % 4] });
    for (var a = 0; a < Math.max(3, W / 200); a++) vivos.anemonas.push({ x: r() * W, f: r() * 6, cor: ['#ff7ab8', '#ffb347', '#b58cff', '#ff5f5f', '#5ee6c8'][a % 5], g: 0.8 + r() * 0.6 });
    for (var n = 0; n < 4; n++) vivos.nuvens.push({ x: r() * W, y: 30 + r() * (A.sup * 0.45), k: 0.6 + r() * 0.6, v: 4 + r() * 6 });
    for (var s2 = 0; s2 < 2; s2++) vivos.cardumes.push({ y: A.sup + (0.3 + s2 * 0.3) * (H - A.sup), v: (s2 ? -1 : 1) * (14 + r() * 8), x0: r() * W, f: r() * 6 });
    vivos.mergulhador = { prox: 6 + r() * 6, ini: -1, y: 0, dir: 1 };
  }
  function sol() { return { x: A.W * 0.5, y: A.sup * (A.per || PERIODOS.dia).astroY }; }
  function desenharVivosAtras(c, t, E) {
    var W = A.W, sup = A.sup, S = sol(), D = H - sup;
    vivos.nuvens.forEach(function (n) { var x = ((n.x + t * n.v) % (W + 200)) - 100; nuvem(c, x, n.y, n.k); });
    c.save(); c.beginPath(); c.rect(0, sup, W, D); c.clip();
    c.globalCompositeOperation = 'lighter';
    // o sol entrando: brilho forte na superfície, logo embaixo do sol
    c.fillStyle = radial(c, S.x, sup, 0, Math.max(W, D) * 0.7, [[0, 'rgba(' + A.per.luz.join(',') + ',' + (A.per.estrelas ? 0.25 : 0.55) + ')'], [0.25, 'rgba(' + A.per.luz.join(',') + ',0.18)'], [1, 'rgba(' + A.per.luz.join(',') + ',0)']]); c.fillRect(0, sup, W, D);
    // raios de sol: saem da superfície em leque, balançam e piscam devagar
    var n = Math.round(W / 110) + 6;
    for (var i = 0; i < n; i++) {
      var f = (i + 0.5) / n, x0 = f * W + Math.sin(t * 0.25 + i * 1.7) * 26, larg = 18 + (i % 3) * 16 + Math.sin(t * 0.4 + i) * 6;
      var al = (0.1 + 0.07 * Math.sin(t * 0.55 + i * 2.3)) * (A.per.estrelas ? 0.45 : 1), compr = D * (0.55 + (i % 4) * 0.12), abre = (x0 - S.x) * 0.55;
      c.fillStyle = grad(c, 0, sup, 0, sup + compr, [[0, 'rgba(' + A.per.luz.join(',') + ',' + al.toFixed(3) + ')'], [0.6, 'rgba(' + A.per.luz.join(',') + ',' + (al * 0.4).toFixed(3) + ')'], [1, 'rgba(' + A.per.luz.join(',') + ',0)']]);
      c.beginPath(); c.moveTo(x0 - larg * 0.4, sup); c.lineTo(x0 + larg * 0.4, sup); c.lineTo(x0 + abre + larg * 1.6, sup + compr); c.lineTo(x0 + abre - larg * 0.6, sup + compr); c.closePath(); c.fill();
    }
    // a luz dançando logo abaixo da superfície
    c.lineWidth = 2; for (var L = 0; L < 7; L++) {
      var yy = sup + 14 + L * 16; c.strokeStyle = 'rgba(230,255,255,' + (0.16 - L * 0.018).toFixed(3) + ')';
      c.beginPath(); for (var x = 0; x <= W; x += 14) { var y = yy + Math.sin(x * 0.035 + t * 1.6 + L) * 5 + Math.sin(x * 0.09 - t * 2.1 + L * 2) * 3; if (x) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke();
    }
    vivos.luzes.forEach(function (l) { var a = (0.35 + 0.35 * Math.sin(t * 2 + l.f)) * (A.per.estrelas ? 1.6 : 1); c.fillStyle = l.cor; c.globalAlpha = a; elipse(c, l.x, l.y + Math.sin(t + l.f) * 6, l.r, l.r); c.fill(); });
    c.globalAlpha = 1; c.fillStyle = 'rgba(220,250,255,0.5)';
    vivos.plancton.forEach(function (p) { var x = (p.x + t * p.v) % W, y = p.y + Math.sin(t * 0.7 + p.f) * 10; c.globalAlpha = 0.25 + 0.25 * Math.sin(t * 1.3 + p.f); elipse(c, x, y, 1.1, 1.1); c.fill(); });
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    // cardumes ao longe (silhuetas)
    vivos.cardumes.forEach(function (s) {
      var bx = ((s.x0 + t * s.v) % (W + 400) + W + 400) % (W + 400) - 200;
      c.fillStyle = 'rgba(10,40,90,0.35)';
      for (var p = 0; p < 9; p++) { var px = bx + (p % 3) * 22 + (p > 5 ? 10 : 0), py = s.y + Math.floor(p / 3) * 14 + Math.sin(t * 2 + p + s.f) * 3, d = s.v > 0 ? 1 : -1;
        c.beginPath(); c.moveTo(px + 8 * d, py); c.quadraticCurveTo(px, py - 4, px - 6 * d, py); c.lineTo(px - 11 * d, py - 4); c.lineTo(px - 11 * d, py + 4); c.lineTo(px - 6 * d, py); c.quadraticCurveTo(px, py + 4, px + 8 * d, py); c.fill(); }
    });
    mergulhador(c, t);
    var tx = W * (W >= H ? 0.86 : 0.75); for (var bb = 0; bb < 4; bb++) { var b = Math.max(0, Math.sin(t * 2.2 + bb * 1.7)); c.fillStyle = 'rgba(255,240,170,' + (b * 0.9).toFixed(2) + ')'; elipse(c, tx - 20 + bb * 13, 945 - (bb % 2) * 8, 3 * b + 0.3, 3 * b + 0.3); c.fill(); }
    c.fillStyle = radial(c, tx, 950, 0, 60, [[0, 'rgba(255,220,100,' + (0.18 + 0.08 * Math.sin(t * 1.5)).toFixed(3) + ')'], [1, 'rgba(255,220,100,0)']]); c.fillRect(tx - 60, 890, 120, 110);
    c.restore();
    // plantas que balançam e anêmonas
    vivos.plantas.forEach(function (p, n) {
      if (n % 2) {   // capim do mar: fios que balançam
        c.strokeStyle = p.cor; c.lineCap = 'round';
        for (var f = 0; f < 4; f++) { var x = p.x + f * 6 - 9, s = Math.sin(t * 1.1 + p.f + f) * 16; c.lineWidth = 4 - f * 0.6; c.beginPath(); c.moveTo(x, 985); c.bezierCurveTo(x + s * 0.3, 985 - p.h * 0.3, x - s * 0.6, 985 - p.h * 0.6, x + s, 985 - p.h * (0.7 + f * 0.08)); c.stroke(); }
        return;
      }
      // alga comprida de folhas: o caule ondula e cada folha acompanha
      var hh = p.h * 1.6, pts = [];
      for (var i = 0; i <= 10; i++) { var f2 = i / 10; pts.push([p.x + Math.sin(t * 0.9 + p.f + f2 * 2.6) * 22 * f2, 985 - hh * f2]); }
      c.strokeStyle = '#1f7a4a'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); pts.forEach(function (q, i) { if (i) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); }); c.stroke();
      for (var i2 = 1; i2 < 10; i2++) {
        var q = pts[i2], lado = i2 % 2 ? 1 : -1, ang = lado * (0.9 + Math.sin(t * 1.3 + p.f + i2) * 0.25), comp = 26 - i2 * 1.2;
        c.save(); c.translate(q[0], q[1]); c.rotate(ang);
        c.fillStyle = grad(c, 0, 0, 0, -comp, [[0, '#2fae6a'], [1, '#8be29a']]); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(7, -comp * 0.5, 0, -comp); c.quadraticCurveTo(-7, -comp * 0.5, 0, 0); c.fill();
        c.strokeStyle = 'rgba(20,80,40,0.5)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -comp * 0.9); c.stroke(); c.restore();
      }
    });
    vivos.anemonas.forEach(function (a) {
      c.save(); c.translate(a.x, 978); c.scale(a.g, a.g);
      c.fillStyle = grad(c, 0, -10, 0, 10, [[0, a.cor], [1, 'rgba(60,20,60,0.9)']]); c.fillRect(-10, -8, 20, 14); elipse(c, 0, -8, 12, 5); c.fill();
      c.lineCap = 'round';
      for (var i = 0; i < 15; i++) {   // tentáculos: balançam com a água, ponta clarinha
        var an = -Math.PI + 0.25 + i / 14 * (Math.PI - 0.5), sx = Math.sin(t * 1.4 + a.f + i * 0.5) * 6, comp = 22 + (i % 3) * 5;
        var ex = Math.cos(an) * comp + sx, ey = -8 + Math.sin(an) * comp;
        c.strokeStyle = a.cor; c.lineWidth = 3.4; c.beginPath(); c.moveTo(Math.cos(an) * 8, -8); c.quadraticCurveTo(Math.cos(an) * comp * 0.6 + sx * 0.4, -8 + Math.sin(an) * comp * 0.7, ex, ey); c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.75)'; elipse(c, ex, ey, 1.8, 1.8); c.fill();
      }
      c.restore();
    });
  }
  // o mergulhador passa nadando de vez em quando, com a lanterna acesa (só enfeite: o anzol não pega)
  function mergulhador(c, t) {
    var M = vivos.mergulhador, W = A.W;
    if (M.ini < 0) { if (t < M.prox) return; M.ini = t; M.dir = Math.random() < 0.5 ? 1 : -1; M.y = A.sup + (H - A.sup) * (0.45 + Math.random() * 0.3); }
    var dur = (W + 300) / 45, f = (t - M.ini) / dur;
    if (f > 1) { M.ini = -1; M.prox = t + 18 + Math.random() * 14; return; }
    var x = M.dir > 0 ? -150 + f * (W + 300) : W + 150 - f * (W + 300), y = M.y + Math.sin(t * 0.9) * 10, e = escala() * 0.9, k = t * 1.4;
    c.save(); c.translate(x, y); c.scale(M.dir * e, e);
    if (IMG.mergulhador) {   // a imagem já vem com o facho da lanterna
      var im = IMG.mergulhador, lw = 150, lh = lw * im.naturalHeight / im.naturalWidth;
      c.rotate(Math.sin(t * 1.4) * 0.05); c.drawImage(im, -lw / 2, -lh / 2, lw, lh);
      c.restore();
      return;
    }
    c.globalCompositeOperation = 'lighter';   // facho da lanterna
    c.fillStyle = grad(c, 40, 0, 200, 0, [[0, 'rgba(255,250,200,0.35)'], [1, 'rgba(255,250,200,0)']]); c.beginPath(); c.moveTo(40, 2); c.lineTo(210, -50); c.lineTo(210, 60); c.closePath(); c.fill();
    c.globalCompositeOperation = 'source-over';
    // pernas com pés de pato batendo
    [0, 1].forEach(function (p) { var b = Math.sin(k * TAU * 0.6 + p * Math.PI) * 0.35; c.save(); c.translate(-26, 4 + p * 4); c.rotate(b);
      c.fillStyle = '#ffb000'; c.fillRect(-30, -4, 30, 8); c.fillStyle = '#20c0a0'; c.beginPath(); c.moveTo(-28, -2); c.lineTo(-52, -12); c.lineTo(-52, 12); c.lineTo(-28, 4); c.closePath(); c.fill(); c.restore(); });
    // corpo com roupa de mergulho, cilindro e máscara
    c.fillStyle = '#c8ccd2'; c.fillRect(-20, -18, 30, 9); c.fillStyle = '#9aa0a8'; c.fillRect(-20, -18, 30, 3);
    c.fillStyle = grad(c, 0, -10, 0, 12, [[0, '#ffc93a'], [1, '#e08a00']]); elipse(c, -6, 0, 24, 10); c.fill(); c.strokeStyle = 'rgba(80,40,0,0.5)'; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = '#2b2b33'; c.fillRect(-14, -3, 18, 4);
    c.strokeStyle = '#e8a33a'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(8, -2); c.lineTo(30, 2 + Math.sin(k * 2) * 2); c.stroke();
    c.fillStyle = '#3a3a44'; c.fillRect(28, -2, 12, 7); c.fillStyle = '#fff6b0'; elipse(c, 40, 1.5, 2.4, 3.4); c.fill();
    c.fillStyle = '#d79b6c'; elipse(c, 24, -10, 10, 9.5); c.fill(); c.fillStyle = '#5a3a20'; elipse(c, 20, -17, 9, 4); c.fill();
    c.fillStyle = 'rgba(160,230,255,0.75)'; c.fillRect(24, -16, 10, 8); c.strokeStyle = '#20c0a0'; c.lineWidth = 2; c.strokeRect(24, -16, 10, 8);
    c.fillStyle = '#20c0a0'; c.fillRect(30, -24, 3, 10);
    c.restore();
    // bolhinhas do mergulhador
    for (var b = 0; b < 4; b++) { var by = y - 20 - ((t * 40 + b * 18) % 70); c.strokeStyle = 'rgba(220,250,255,0.6)'; c.lineWidth = 1; elipse(c, x + M.dir * 30 * e + Math.sin(t * 3 + b) * 3, by, 2 + b * 0.6, 2 + b * 0.6); c.stroke(); }
  }
  function desenharVivosFrente(c, t) {
    var W = A.W, sup = A.sup;
    function bolha(x, y, r) {
      c.fillStyle = radial(c, x - r * 0.3, y - r * 0.3, 0, r, [[0, 'rgba(255,255,255,0.35)'], [0.7, 'rgba(180,240,255,0.08)'], [1, 'rgba(200,245,255,0.35)']]); elipse(c, x, y, r, r); c.fill();
      c.strokeStyle = 'rgba(225,250,255,0.65)'; c.lineWidth = 0.9; c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.85)'; elipse(c, x - r * 0.35, y - r * 0.38, r * 0.28, r * 0.2); c.fill();
    }
    vivos.bolhas.forEach(function (b) { var y = H - ((H - b.y + t * b.v) % (H - sup - 10)), x = b.x + Math.sin(t * 1.5 + b.f) * 6; bolha(x, y, b.r); });
    vivos.colunas.forEach(function (cl) { for (var i = 0; i < 9; i++) { var y = 960 - ((t * 55 + i * 70 + cl.f * 40) % (H - sup - 40)); bolha(cl.x + Math.sin(t * 2 + i + cl.f) * 5, y, 1.8 + (i % 3)); } });
    // reflexo do sol tremendo na água
    var S = sol(); c.save(); c.globalCompositeOperation = 'lighter';
    for (var rf = 0; rf < 7; rf++) { var ry = sup + 4 + rf * 6, rw = 60 - rf * 6 + Math.sin(t * 3 + rf) * 8; c.fillStyle = 'rgba(' + A.per.brilho.join(',') + ',' + (0.35 - rf * 0.04).toFixed(2) + ')'; elipse(c, S.x + Math.sin(t * 2 + rf * 1.3) * 6, ry, rw, 1.6); c.fill(); }
    c.restore();
    // superfície: brilho e ondinhas
    c.fillStyle = 'rgba(220,250,255,0.6)'; c.beginPath(); c.moveTo(0, sup - 3);
    for (var x = 0; x <= W; x += 16) c.lineTo(x, sup - 3 + Math.sin(x * 0.045 + t * 2.2) * 2.4);
    for (var x2 = W; x2 >= 0; x2 -= 16) c.lineTo(x2, sup + 5 + Math.sin(x2 * 0.05 + t * 1.7) * 2);
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.85)';
    for (var s = 0; s < W / 70; s++) { var sx = (s * 97.3 + t * 18) % W, a = Math.max(0, Math.sin(t * 3 + s)); if (a > 0.5) { elipse(c, sx, sup - 1, 7 * a, 1.3); c.fill(); } }
  }

  /* =================================================================== linha, anzol, bolhas de poder */
  function linhaEAnzol(c, E, j, t) {
    var pt = R.ponta(E, j), a = E.j[j].anzol;
    var px1 = 1 / A.s;   // 1 px de tela, em unidades do mundo
    c.lineCap = 'round';
    if (a.fase === 'cortada') {   // as piranhas cortaram: só um toco de linha, enquanto amarra outro anzol
      c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 2.2 * px1;
      c.beginPath(); c.moveTo(pt.x, pt.y); c.lineTo(pt.x + Math.sin(t * 3) * 4, pt.y + 26); c.stroke();
      c.font = (26 / A.s).toFixed(1) + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('✂️', pt.x + 18, pt.y + 40 + Math.sin(t * 5) * 4);
      return;
    }
    c.strokeStyle = 'rgba(10,25,45,0.55)'; c.lineWidth = 4.5 * px1;   // contorno escuro: aparece no céu claro e na água
    c.beginPath(); c.moveTo(pt.x, pt.y); c.lineTo(a.x, a.y); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 2.2 * px1;
    c.beginPath(); c.moveTo(pt.x, pt.y); c.lineTo(a.x, a.y); c.stroke();
    var ang = a.fase === 'balanca' ? a.ang : a.dirAng, rod = E.bonus && E.bonus.tipo;
    if (rod === 'socorro' || a.fase === 'joga' || a.fase === 'puxa') { desenharImagem(c, 'boia', a.x, a.y + 14, 58, Math.sin(t * 4) * 0.2); return; }
    if (rod === 'limpa') { desenharImagem(c, 'rede', a.x, a.y + 4, 96 * E.esc, -ang * 0.5); return; }
    if (a.levando) desenharBicho(c, 'filhote', a.x, a.y + 26, R.POR_ID.filhote.tam * H * E.esc, 1, t * 4, -Math.PI / 2 + Math.sin(t * 9) * 0.3);
    c.save(); c.translate(a.x, a.y); c.rotate(-ang);
    // minhoca
    if (!a.presos.length && !a.levando) { c.strokeStyle = '#ff7d9c'; c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-5, 10); c.bezierCurveTo(-11, 14 + Math.sin(t * 6) * 3, -4, 20, -8, 24 + Math.sin(t * 5) * 2); c.stroke(); }
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
  function preparar(canvas, larg, alt, dpr, op) {
    op = op || {}; A.per = PERIODOS[op.periodo] || PERIODOS.dia; A.cen = op.cenario || 'roca';
    if (!A.carregou) { A.carregou = true; carregarImagens(op.imagens || 'img/'); }
    A.dpr = Math.min(2, dpr || 1); A.s = alt / H; A.W = H * larg / alt; A.sup = A.W >= H ? 270 : 230;
    canvas.width = Math.round(larg * A.dpr); canvas.height = Math.round(alt * A.dpr);
    esquecer(); A.fundo = pintarFundo(); prepararVivos();
    return { s: A.s, W: A.W };
  }
  function quadro(c, E, t) {
    var px = A.s * A.dpr;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(A.fundo, 0, 0);
    c.setTransform(px, 0, 0, px, 0, 0);
    desenharVivosAtras(c, t, E);
    var lista = E.bichos.slice().sort(function (p, q) { return (q.faixa - p.faixa) || (p.n - q.n); });
    lista.forEach(function (o) {
      if (o.preso != null) return;
      var comp = o.tam * H * E.esc;
      if (o.tipo === 'banhista') { banhista(c, E, o, comp, t); return; }
      if (o.tipo === 'chefe' && o.piscou && t >= 0 && E.t - o.piscou < 0.5) c.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin((E.t - o.piscou) * 25));   // levou um acerto: pisca
      desenharBicho(c, o.id, o.x, o.y, comp, o.dir, t * (o.v ? 1.1 : 0.5) + o.fase, 0);
      c.globalAlpha = 1;
    });
    // os pontos de cada bicho, em cima dele (para quem já lê; o tamanho e o brilho contam para quem ainda não lê)
    var fs = 15 / A.s; c.font = '700 ' + fs.toFixed(1) + 'px Fredoka, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.lineJoin = 'round';
    lista.forEach(function (o) {
      if (o.preso != null || !o.pontos || o.entregue || o.salvo != null || o.vencido) return;
      var y = o.y - o.tam * H * E.esc * Math.max(0.3, o.alt * 0.55) - 2, txt = String(o.pontos);
      if (o.tipo === 'chefe') txt = '🎯 ' + (o.acertos || 0) + '/3 · ' + o.pontos;   // o dragão precisa de 3 acertos
      c.lineWidth = fs * 0.28; c.strokeStyle = 'rgba(40,15,0,0.85)'; c.strokeText(txt, o.x, y);
      c.fillStyle = o.pontos >= 100 ? '#7ff0ff' : '#ffd23f'; c.fillText(txt, o.x, y);
    });
    E.bolhas.forEach(function (b) { bolhaPoder(c, b, t); });
    desenharVivosFrente(c, t);
    for (var j = 0; j < E.j.length; j++) {
      E.j[j].anzol.presos.forEach(function (o) { desenharBicho(c, o.id, o.x, o.y, o.tam * H * E.esc, 1, t * 5 + o.fase, -Math.PI / 2 + Math.sin(t * 14 + o.fase) * 0.35); });
      personagem(c, E, j, t);
      linhaEAnzol(c, E, j, t);
    }
  }
  // banhista: só a parte de cima fica fora da água; salvo, ganha a boia e vai sorrindo para a margem
  function banhista(c, E, o, comp, t) {
    var salvo = o.salvo != null;
    c.save();
    c.beginPath(); c.rect(o.x - comp * 2, 0, comp * 4, E.sup + comp * (salvo ? 0.28 : 0.12)); c.clip();
    desenharBicho(c, o.id, o.x, o.y - comp * 0.18, comp, salvo ? o.dir : 1, 0, salvo ? Math.sin(t * 2 + o.fase) * 0.08 : Math.sin(t * 5 + o.fase) * 0.12);
    c.restore();
    c.strokeStyle = 'rgba(230,250,255,0.75)'; c.lineWidth = 2;   // a água mexendo em volta
    var k = (t * 0.8 + o.fase) % 1;
    elipse(c, o.x, E.sup + 4, comp * (0.4 + k * 0.5), comp * (0.07 + k * 0.06)); c.globalAlpha = 1 - k; c.stroke(); c.globalAlpha = 1;
    if (salvo) desenharImagem(c, 'boia', o.x, E.sup + comp * 0.06, comp * 0.95);
  }
  function desenharImagem(c, id, x, y, larg, giro) {
    var im = IMG[id];
    c.save(); c.translate(x, y); if (giro) c.rotate(giro);
    if (im) { var a = larg * im.naturalHeight / im.naturalWidth; c.drawImage(im, -larg / 2, -a / 2, larg, a); }
    else if (id === 'boia') {   // boia salva-vidas: anel vermelho com quatro faixas brancas e a corda
      var R0 = larg * 0.36, esp = larg * 0.2;
      c.lineWidth = esp + 3; c.strokeStyle = 'rgba(80,10,10,0.55)'; elipse(c, 0, 0, R0, R0 * 0.62); c.stroke();
      for (var q = 0; q < 8; q++) { c.strokeStyle = q % 2 ? '#ffffff' : '#e53935'; c.lineWidth = esp; c.beginPath(); c.ellipse(0, 0, R0, R0 * 0.62, 0, q * Math.PI / 4, (q + 1) * Math.PI / 4); c.stroke(); }
      c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = esp * 0.25; c.beginPath(); c.ellipse(0, -esp * 0.15, R0, R0 * 0.62, 0, Math.PI * 1.1, Math.PI * 1.6); c.stroke();
      c.strokeStyle = '#f3e3b0'; c.lineWidth = 1.6; c.setLineDash([5, 4]); elipse(c, 0, 0, R0 + esp * 0.55, (R0 + esp * 0.55) * 0.62); c.stroke(); c.setLineDash([]);
    } else if (id === 'rede') {   // rede: aro de madeira e o saco de malha pendurado
      var rx = larg / 2, ry = larg * 0.13, fundo = larg * 0.75;
      c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 1.4;
      for (var m = -4; m <= 4; m++) { c.beginPath(); c.moveTo(m / 4 * rx, ry * Math.sqrt(1 - m * m / 16)); c.quadraticCurveTo(m / 4 * rx * 0.7, fundo * 0.6, m / 4 * rx * 0.25, fundo); c.stroke(); }
      for (var n = 1; n <= 4; n++) { var f = n / 5, yy = ry + (fundo - ry) * f, ww = rx * (1 - f * 0.72); c.beginPath(); c.ellipse(0, yy, ww, ry * (1 - f * 0.6), 0, 0, Math.PI); c.stroke(); }
      c.strokeStyle = '#8a5a2b'; c.lineWidth = 6; elipse(c, 0, 0, rx, ry); c.stroke();
      c.strokeStyle = '#c08a50'; c.lineWidth = 2; elipse(c, 0, -1.5, rx, ry); c.stroke();
    }
    c.restore();
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

  raiz.GlubArte = { estatisticas: function () { return { feitas: feitas, guardadas: Object.keys(A.sprites).length, imagens: Object.keys(IMG).length }; }, PERIODOS: Object.keys(PERIODOS), CENARIOS: ['roca', 'mar', 'serra'], preparar: preparar, quadro: quadro, bicho: bicho, icone: icone, lugar: lugar };
})(this);
