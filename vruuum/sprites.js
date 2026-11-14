/* Vruuum! — os desenhos (tudo feito aqui em código, nenhum arquivo de imagem): enfeites de cada
   mundo, estrela, cone, lama, turbo, rampa, carrinhos do trânsito, o carro de cada jogador, portais,
   largada, chegada e o fundo (morros, mar, cidade). Cada desenho é feito uma vez num canvas
   escondido e depois só é copiado na tela, do tamanho certo (rápido até em TV). */
(function (raiz) {
  'use strict';
  var EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  var FONTE = 'Fredoka, system-ui, sans-serif';

  // w e h: tamanho no mundo (a estrada tem 4000 de largura)
  function fazer(w, h, desenha, px) {
    var pw = px || 200, ph = Math.max(2, Math.round(pw * h / w));
    var cv = document.createElement('canvas'); cv.width = pw; cv.height = ph;
    desenha(cv.getContext('2d'), pw, ph);
    return { w: w, h: h, img: cv };
  }
  function circ(c, x, y, r, cor) { c.fillStyle = cor; c.beginPath(); c.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2); c.fill(); }
  function oval(c, x, y, rx, ry, cor) { c.fillStyle = cor; c.beginPath(); c.save(); c.translate(x, y); c.scale(1, ry / rx); c.arc(0, 0, rx, 0, Math.PI * 2); c.restore(); c.fill(); }
  function caixa(c, x, y, w, h, r, cor) {
    c.fillStyle = cor; c.beginPath();
    c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath(); c.fill();
  }
  function poli(c, pts, cor) { c.fillStyle = cor; c.beginPath(); c.moveTo(pts[0], pts[1]); for (var i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); }
  function linha(c, pts, cor, larg) { c.strokeStyle = cor; c.lineWidth = larg; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (var i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); }
  function sombra(c, W, H, larg) { oval(c, W / 2, H - H * 0.03, W * (larg || 0.4), H * 0.03, 'rgba(0,0,0,.22)'); }

  // ---------- enfeites ----------
  function coqueiro(c, W, H) {
    sombra(c, W, H, 0.3);
    var tx = W * 0.58, ty = H * 0.28;
    for (var k = 0; k < 10; k++) {
      var p0 = k / 10, p1 = (k + 1) / 10;
      var x0 = W * 0.48 + (tx - W * 0.48) * p0 * p0, y0 = H - (H - ty) * p0, x1 = W * 0.48 + (tx - W * 0.48) * p1 * p1, y1 = H - (H - ty) * p1;
      linha(c, [x0, y0, x1, y1], k % 2 ? '#a0682f' : '#8a5524', W * 0.09 * (1 - p0 * 0.4));
    }
    var folhas = [-2.9, -2.4, -1.9, -1.3, -0.7, -0.2, 0.3, 2.6];
    folhas.forEach(function (a, n) {
      var ex = tx + Math.cos(a) * W * 0.46, ey = ty + Math.sin(a) * H * 0.14 + H * 0.1;
      c.strokeStyle = n % 2 ? '#1f9d55' : '#2ec46b'; c.lineWidth = W * 0.07; c.lineCap = 'round';
      c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo((tx + ex) / 2, ty + Math.sin(a) * H * 0.12 - H * 0.04, ex, ey); c.stroke();
    });
    circ(c, tx - W * 0.04, ty + H * 0.03, W * 0.05, '#6b3d12'); circ(c, tx + W * 0.04, ty + H * 0.035, W * 0.05, '#7a4716');
  }
  function guardasol(c, W, H) {
    sombra(c, W, H, 0.35);
    linha(c, [W * 0.5, H, W * 0.5, H * 0.22], '#ececec', W * 0.04);
    var cores = ['#ff4d6d', '#ffffff'];
    for (var k = 0; k < 6; k++) {
      c.fillStyle = cores[k % 2]; c.beginPath(); c.moveTo(W * 0.5, H * 0.36);
      c.ellipse ? c.ellipse(W * 0.5, H * 0.36, W * 0.48, H * 0.26, 0, Math.PI + k * Math.PI / 6, Math.PI + (k + 1) * Math.PI / 6) : c.arc(W * 0.5, H * 0.36, W * 0.48, Math.PI + k * Math.PI / 6, Math.PI + (k + 1) * Math.PI / 6);
      c.closePath(); c.fill();
    }
    caixa(c, W * 0.15, H * 0.82, W * 0.7, H * 0.1, W * 0.03, '#3ee8ff');
  }
  function castelo(c, W, H) {
    sombra(c, W, H, 0.45);
    var a = '#f2c46d', b = '#e0ae52';
    c.fillStyle = a; c.fillRect(W * 0.1, H * 0.45, W * 0.8, H * 0.55);
    c.fillStyle = b; c.fillRect(W * 0.1, H * 0.85, W * 0.8, H * 0.15);
    [0.1, 0.62].forEach(function (x) { c.fillStyle = a; c.fillRect(W * x, H * 0.22, W * 0.28, H * 0.3); for (var k = 0; k < 3; k++) c.fillRect(W * (x + k * 0.1), H * 0.14, W * 0.07, H * 0.1); });
    caixa(c, W * 0.42, H * 0.62, W * 0.16, H * 0.38, W * 0.08, '#b07a2a');
    linha(c, [W * 0.24, H * 0.14, W * 0.24, H * 0.0], '#6b4b1a', W * 0.015); poli(c, [W * 0.24, H * 0.0, W * 0.36, H * 0.04, W * 0.24, H * 0.08], '#ff4d6d');
  }
  function pinheiro(c, W, H, neve) {
    sombra(c, W, H, 0.35);
    c.fillStyle = '#7a4b1e'; c.fillRect(W * 0.44, H * 0.8, W * 0.12, H * 0.2);
    var cores = neve ? ['#1d6b4a', '#24805a', '#2a9468'] : ['#167a3e', '#1e9a4e', '#27b45e'];
    for (var k = 0; k < 3; k++) {
      var topo = H * (0.02 + k * 0.22), base = H * (0.42 + k * 0.2), larg = W * (0.3 + k * 0.1);
      poli(c, [W * 0.5, topo, W * 0.5 + larg, base, W * 0.5 - larg, base], cores[k]);
      if (neve) poli(c, [W * 0.5, topo, W * 0.5 + larg * 0.38, topo + (base - topo) * 0.38, W * 0.5, topo + (base - topo) * 0.3, W * 0.5 - larg * 0.38, topo + (base - topo) * 0.38], '#ffffff');
    }
    if (neve) oval(c, W * 0.5, H * 0.97, W * 0.45, H * 0.04, '#ffffff');
  }
  function arvore(c, W, H) {
    sombra(c, W, H, 0.38);
    poli(c, [W * 0.44, H, W * 0.56, H, W * 0.54, H * 0.5, W * 0.46, H * 0.5], '#7a4b1e');
    [[0.5, 0.3, 0.3, '#1e9a4e'], [0.28, 0.42, 0.22, '#1a8a45'], [0.72, 0.42, 0.22, '#1a8a45'], [0.5, 0.5, 0.25, '#22a854'], [0.38, 0.22, 0.18, '#2bbf62'], [0.62, 0.25, 0.18, '#2bbf62']].forEach(function (b) { circ(c, W * b[0], H * b[1], W * b[2], b[3]); });
    [[0.35, 0.4], [0.62, 0.33], [0.5, 0.55], [0.7, 0.5], [0.3, 0.55]].forEach(function (m) { circ(c, W * m[0], H * m[1], W * 0.04, '#ff3b3b'); });
  }
  function cogumelo(c, W, H) {
    sombra(c, W, H, 0.3);
    caixa(c, W * 0.36, H * 0.45, W * 0.28, H * 0.55, W * 0.1, '#fff3e0');
    c.fillStyle = '#ff3b3b'; c.beginPath(); c.arc(W * 0.5, H * 0.52, W * 0.46, Math.PI, 0); c.closePath(); c.fill();
    [[0.32, 0.36, 0.07], [0.55, 0.22, 0.08], [0.72, 0.42, 0.06], [0.45, 0.44, 0.05]].forEach(function (d) { circ(c, W * d[0], H * d[1], W * d[2], '#ffffff'); });
    circ(c, W * 0.44, H * 0.72, W * 0.03, '#333'); circ(c, W * 0.56, H * 0.72, W * 0.03, '#333');
  }
  function flor(c, W, H) {
    linha(c, [W * 0.5, H, W * 0.5, H * 0.35], '#2a9d50', W * 0.06);
    oval(c, W * 0.36, H * 0.7, W * 0.14, W * 0.07, '#2ec46b');
    for (var k = 0; k < 6; k++) { var a = k * Math.PI / 3; circ(c, W * 0.5 + Math.cos(a) * W * 0.2, H * 0.3 + Math.sin(a) * W * 0.2, W * 0.15, k % 2 ? '#ff7ac6' : '#ff9ad5'); }
    circ(c, W * 0.5, H * 0.3, W * 0.13, '#ffd166');
  }
  function pirulito(c, W, H) {
    sombra(c, W, H, 0.25);
    linha(c, [W * 0.5, H, W * 0.5, H * 0.3], '#f5f5f5', W * 0.08);
    var R = W * 0.46, cx = W * 0.5, cy = R + H * 0.01;
    circ(c, cx, cy, R, '#ff4fa3');
    c.strokeStyle = '#ffffff'; c.lineWidth = R * 0.18; c.lineCap = 'round'; c.beginPath();
    for (var t = 0; t <= 1; t += 0.01) { var a = t * Math.PI * 6, r = t * R * 0.9; if (t === 0) c.moveTo(cx, cy); else c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    c.stroke();
    c.strokeStyle = '#c2185b'; c.lineWidth = W * 0.02; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
  }
  function bengala(c, W, H) {
    sombra(c, W, H, 0.25);
    var pts = function () { c.beginPath(); c.moveTo(W * 0.62, H * 0.98); c.lineTo(W * 0.62, H * 0.28); c.arc(W * 0.42, H * 0.28, W * 0.2, 0, Math.PI, true); c.lineTo(W * 0.22, H * 0.36); };
    c.lineCap = 'round'; c.lineWidth = W * 0.2; c.strokeStyle = '#ffffff'; pts(); c.stroke();
    if (c.setLineDash) { c.setLineDash([W * 0.16, W * 0.16]); c.strokeStyle = '#e63946'; pts(); c.stroke(); c.setLineDash([]); }
  }
  function cupcake(c, W, H) {
    sombra(c, W, H, 0.4);
    poli(c, [W * 0.18, H * 0.5, W * 0.82, H * 0.5, W * 0.7, H * 0.98, W * 0.3, H * 0.98], '#3ee8ff');
    for (var k = 0; k < 5; k++) linha(c, [W * (0.26 + k * 0.12), H * 0.52, W * (0.32 + k * 0.09), H * 0.96], '#22b5cc', W * 0.03);
    oval(c, W * 0.5, H * 0.48, W * 0.4, H * 0.12, '#ff9ad5'); oval(c, W * 0.5, H * 0.36, W * 0.32, H * 0.11, '#ffb3e0'); oval(c, W * 0.5, H * 0.25, W * 0.22, H * 0.09, '#ffc9ea');
    circ(c, W * 0.5, H * 0.13, W * 0.09, '#e63946');
    [['#ffd166', 0.3, 0.42], ['#c6ff3d', 0.62, 0.38], ['#ffffff', 0.45, 0.3], ['#3a86ff', 0.7, 0.47], ['#ffd166', 0.56, 0.24]].forEach(function (s) { caixa(c, W * s[1], H * s[2], W * 0.06, H * 0.02, W * 0.01, s[0]); });
  }
  function algodao(c, W, H) {
    linha(c, [W * 0.5, H, W * 0.5, H * 0.45], '#f5f5f5', W * 0.06);
    [[0.5, 0.3, 0.32, '#ffb3e0'], [0.3, 0.38, 0.22, '#a9def9'], [0.7, 0.36, 0.22, '#ffc9ea'], [0.42, 0.18, 0.2, '#d0f0ff'], [0.62, 0.2, 0.2, '#ff9ad5']].forEach(function (b) { circ(c, W * b[0], H * b[1], W * b[2], b[3]); });
  }
  function boneco(c, W, H) {
    sombra(c, W, H, 0.38);
    circ(c, W * 0.5, H * 0.76, W * 0.36, '#ffffff'); circ(c, W * 0.5, H * 0.46, W * 0.27, '#f6f9ff'); circ(c, W * 0.5, H * 0.22, W * 0.2, '#ffffff');
    linha(c, [W * 0.25, H * 0.45, W * 0.04, H * 0.32], '#6b4b1a', W * 0.035); linha(c, [W * 0.75, H * 0.45, W * 0.96, H * 0.32], '#6b4b1a', W * 0.035);
    caixa(c, W * 0.26, H * 0.32, W * 0.48, H * 0.06, W * 0.03, '#e63946'); caixa(c, W * 0.58, H * 0.34, W * 0.1, H * 0.16, W * 0.03, '#e63946');
    circ(c, W * 0.43, H * 0.19, W * 0.03, '#222'); circ(c, W * 0.57, H * 0.19, W * 0.03, '#222');
    poli(c, [W * 0.5, H * 0.22, W * 0.5, H * 0.26, W * 0.68, H * 0.245], '#ff8c1a');
    c.fillStyle = '#222'; c.fillRect(W * 0.3, H * 0.05, W * 0.4, H * 0.025); c.fillRect(W * 0.36, H * -0.02, W * 0.28, H * 0.08);
    [0.44, 0.52, 0.6].forEach(function (y) { circ(c, W * 0.5, H * y, W * 0.025, '#222'); });
  }
  function presente(c, W, H) {
    sombra(c, W, H, 0.45);
    caixa(c, W * 0.1, H * 0.3, W * 0.8, H * 0.68, W * 0.04, '#9b5de5'); caixa(c, W * 0.05, H * 0.22, W * 0.9, H * 0.14, W * 0.04, '#b57bff');
    c.fillStyle = '#ffd166'; c.fillRect(W * 0.44, H * 0.22, W * 0.12, H * 0.76);
    oval(c, W * 0.36, H * 0.14, W * 0.14, H * 0.08, '#ffd166'); oval(c, W * 0.64, H * 0.14, W * 0.14, H * 0.08, '#ffd166');
  }
  function brilho(c, cor, n) { c.shadowColor = cor; c.shadowBlur = n; }
  function poste(c, W, H) {
    c.fillStyle = '#2b2350'; c.fillRect(W * 0.44, H * 0.12, W * 0.12, H * 0.88);
    brilho(c, '#2bf4ff', W * 0.3); c.fillStyle = '#2bf4ff'; c.fillRect(W * 0.47, H * 0.2, W * 0.06, H * 0.75);
    brilho(c, '#ff2bd6', W * 0.6); circ(c, W * 0.5, H * 0.1, W * 0.3, '#ff7ae6'); circ(c, W * 0.5, H * 0.1, W * 0.16, '#ffffff');
  }
  function predio(c, W, H) {
    var cores = ['#ffd166', '#2bf4ff', '#ff7ae6', '#3a2f73'];
    caixa(c, W * 0.06, H * 0.08, W * 0.88, H * 0.92, W * 0.04, '#241a55');
    c.strokeStyle = '#ff2bd6'; c.lineWidth = W * 0.02; brilho(c, '#ff2bd6', W * 0.08); c.strokeRect(W * 0.07, H * 0.09, W * 0.86, H * 0.9); c.shadowBlur = 0;
    var s = 7;
    for (var y = 0; y < 10; y++) for (var x = 0; x < 4; x++) { s = (s * 9301 + 49297) % 233280; c.fillStyle = cores[Math.floor(s / 233280 * 4.6) % 4]; c.fillRect(W * (0.16 + x * 0.19), H * (0.14 + y * 0.083), W * 0.11, H * 0.05); }
    linha(c, [W * 0.5, H * 0.08, W * 0.5, 0], '#888', W * 0.02); circ(c, W * 0.5, H * 0.01, W * 0.03, '#ff3b3b');
  }
  function palmeiraNeon(c, W, H) {
    brilho(c, '#c6ff3d', W * 0.12);
    var tx = W * 0.56, ty = H * 0.28;
    c.strokeStyle = '#ff7ae6'; c.lineWidth = W * 0.05; c.lineCap = 'round'; c.beginPath(); c.moveTo(W * 0.48, H); c.quadraticCurveTo(W * 0.46, H * 0.6, tx, ty); c.stroke();
    c.strokeStyle = '#c6ff3d'; c.lineWidth = W * 0.04;
    [-2.8, -2.2, -1.6, -1, -0.4, 0.2].forEach(function (a) { var ex = tx + Math.cos(a) * W * 0.44, ey = ty + Math.sin(a) * H * 0.12 + H * 0.1; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo((tx + ex) / 2, ty - H * 0.05, ex, ey); c.stroke(); });
  }

  // ---------- 1.11.0: mundos fantásticos (desenhos próprios) ----------
  function grad(c, y0, y1, a, b) { return gradV(c, y0, y1, a, b); }
  function gradV(c, y0, y1, a, b) { var g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
  // cânion do deserto
  function cacto(c, W, H) {
    sombra(c, W, H, 0.3);
    var verde = '#3f9d4a', claro = '#5cc06a';
    caixa(c, W * 0.4, H * 0.08, W * 0.2, H * 0.92, W * 0.1, verde);
    caixa(c, W * 0.12, H * 0.32, W * 0.16, H * 0.3, W * 0.08, verde); caixa(c, W * 0.12, H * 0.52, W * 0.34, H * 0.12, W * 0.06, verde);
    caixa(c, W * 0.72, H * 0.22, W * 0.16, H * 0.28, W * 0.08, verde); caixa(c, W * 0.54, H * 0.42, W * 0.34, H * 0.12, W * 0.06, verde);
    c.fillStyle = claro; c.fillRect(W * 0.46, H * 0.12, W * 0.04, H * 0.85);
    for (var k = 0; k < 14; k++) linha(c, [W * (0.4 + (k % 2) * 0.2), H * (0.12 + k * 0.06), W * (0.37 + (k % 2) * 0.26), H * (0.11 + k * 0.06)], '#fff7d6', W * 0.012);
    circ(c, W * 0.5, H * 0.07, W * 0.07, '#ff4fa3'); circ(c, W * 0.5, H * 0.07, W * 0.03, '#ffd166');
  }
  function rochedo(c, W, H) {
    sombra(c, W, H, 0.45);
    poli(c, [W * 0.08, H, W * 0.16, H * 0.3, W * 0.3, H * 0.12, W * 0.7, H * 0.1, W * 0.86, H * 0.28, W * 0.94, H], '#c2703d');
    poli(c, [W * 0.5, H, W * 0.56, H * 0.16, W * 0.7, H * 0.1, W * 0.86, H * 0.28, W * 0.94, H], '#9c5530');
    c.fillStyle = gradV(c, H * 0.08, H * 0.2, '#f0b27a', '#c2703d'); c.fillRect(W * 0.2, H * 0.1, W * 0.62, H * 0.07);
    for (var k = 1; k < 6; k++) linha(c, [W * 0.12, H * (0.25 + k * 0.13), W * 0.92, H * (0.25 + k * 0.13)], 'rgba(90,40,20,.35)', W * 0.012);
  }
  function placa(c, W, H) {
    sombra(c, W, H, 0.25);
    c.fillStyle = '#6b4a2a'; c.fillRect(W * 0.2, H * 0.4, W * 0.06, H * 0.6); c.fillRect(W * 0.74, H * 0.4, W * 0.06, H * 0.6);
    caixa(c, W * 0.06, H * 0.06, W * 0.88, H * 0.42, W * 0.03, '#f4f1e8'); caixa(c, W * 0.06, H * 0.06, W * 0.88, H * 0.1, W * 0.03, '#e63946');
    c.fillStyle = '#1a1446'; c.font = '700 ' + Math.round(H * 0.12) + 'px ' + FONTE + ',' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('⚠️ 🦖', W * 0.5, H * 0.3);
  }
  // templo na selva
  function pilar(c, W, H) {
    sombra(c, W, H, 0.35);
    c.fillStyle = gradV(c, 0, H, '#9fb3ae', '#6f837e'); c.fillRect(W * 0.22, H * 0.12, W * 0.56, H * 0.88);
    caixa(c, W * 0.12, H * 0.04, W * 0.76, H * 0.1, W * 0.02, '#b6c8c3'); caixa(c, W * 0.16, H * 0.9, W * 0.68, H * 0.1, W * 0.02, '#8a9e99');
    for (var k = 1; k < 8; k++) linha(c, [W * 0.22, H * (0.12 + k * 0.1), W * 0.78, H * (0.12 + k * 0.1)], 'rgba(40,60,55,.35)', W * 0.015);
    c.fillStyle = '#3ef0d0'; brilho(c, '#3ef0d0', W * 0.2); c.fillRect(W * 0.46, H * 0.3, W * 0.08, H * 0.12); circ(c, W * 0.5, H * 0.52, W * 0.06, '#3ef0d0'); c.shadowBlur = 0;
    c.strokeStyle = '#2f8a5a'; c.lineWidth = W * 0.04; c.lineCap = 'round';   // cipós
    [[0.25, 0.1], [0.62, 0.14], [0.75, 0.08]].forEach(function (v) { c.beginPath(); c.moveTo(W * v[0], H * v[1]); c.quadraticCurveTo(W * (v[0] + 0.1), H * (v[1] + 0.3), W * (v[0] - 0.02), H * (v[1] + 0.55)); c.stroke(); circ(c, W * (v[0] + 0.05), H * (v[1] + 0.25), W * 0.05, '#4cc35a'); });
  }
  function cabecaPedra(c, W, H) {
    sombra(c, W, H, 0.42);
    caixa(c, W * 0.12, H * 0.08, W * 0.76, H * 0.92, W * 0.1, '#8a9e99');
    caixa(c, W * 0.12, H * 0.08, W * 0.76, H * 0.2, W * 0.1, '#a7bab5');
    c.fillStyle = '#4b5d59'; c.fillRect(W * 0.24, H * 0.36, W * 0.18, H * 0.08); c.fillRect(W * 0.58, H * 0.36, W * 0.18, H * 0.08);
    brilho(c, '#3ef0d0', W * 0.15); circ(c, W * 0.33, H * 0.4, W * 0.05, '#3ef0d0'); circ(c, W * 0.67, H * 0.4, W * 0.05, '#3ef0d0'); c.shadowBlur = 0;
    poli(c, [W * 0.44, H * 0.48, W * 0.56, H * 0.48, W * 0.6, H * 0.66, W * 0.4, H * 0.66], '#6f837e');
    c.fillStyle = '#4b5d59'; c.fillRect(W * 0.3, H * 0.76, W * 0.4, H * 0.06);
    [[0.15, 0.2], [0.8, 0.5], [0.2, 0.8]].forEach(function (m) { circ(c, W * m[0], H * m[1], W * 0.08, '#3e9a5a'); });
  }
  function samambaia(c, W, H) {
    sombra(c, W, H, 0.4);
    for (var k = 0; k < 9; k++) {
      var a = Math.PI * (1.08 + k * 0.105), ex = W * 0.5 + Math.cos(a) * W * 0.48, ey = H * 0.95 + Math.sin(a) * H * 0.9;
      c.strokeStyle = k % 2 ? '#2a9d50' : '#3fbf6a'; c.lineWidth = W * 0.05; c.lineCap = 'round';
      c.beginPath(); c.moveTo(W * 0.5, H * 0.98); c.quadraticCurveTo(W * 0.5 + Math.cos(a) * W * 0.2, H * 0.4 + Math.sin(a) * H * 0.2, ex, ey); c.stroke();
    }
  }
  function tocha(c, W, H) {
    sombra(c, W, H, 0.25);
    c.fillStyle = '#5a3b22'; c.fillRect(W * 0.44, H * 0.3, W * 0.12, H * 0.7);
    caixa(c, W * 0.34, H * 0.24, W * 0.32, H * 0.1, W * 0.03, '#8a9e99');
    brilho(c, '#ff9f1c', W * 0.5);
    c.fillStyle = '#ff6a00'; c.beginPath(); c.moveTo(W * 0.5, H * 0.02); c.quadraticCurveTo(W * 0.82, H * 0.18, W * 0.6, H * 0.25); c.lineTo(W * 0.4, H * 0.25); c.quadraticCurveTo(W * 0.18, H * 0.16, W * 0.5, H * 0.02); c.fill();
    c.fillStyle = '#ffd166'; c.beginPath(); c.moveTo(W * 0.5, H * 0.09); c.quadraticCurveTo(W * 0.66, H * 0.2, W * 0.56, H * 0.24); c.lineTo(W * 0.44, H * 0.24); c.quadraticCurveTo(W * 0.34, H * 0.2, W * 0.5, H * 0.09); c.fill();
    c.shadowBlur = 0;
  }
  // vulcão de lava
  function rachaduras(c, W, H, y0, n) {
    brilho(c, '#ff6a00', W * 0.08); c.strokeStyle = '#ffb703'; c.lineWidth = W * 0.025; c.lineCap = 'round';
    var s = 5;
    for (var k = 0; k < n; k++) { s = (s * 9301 + 49297) % 233280; var x = W * (0.2 + s / 233280 * 0.6), y = H * (y0 + (k / n) * (0.9 - y0)); c.beginPath(); c.moveTo(x, y); c.lineTo(x + W * 0.08, y + H * 0.05); c.lineTo(x + W * 0.02, y + H * 0.1); c.stroke(); }
    c.shadowBlur = 0;
  }
  function rochaLava(c, W, H) {
    sombra(c, W, H, 0.45);
    poli(c, [W * 0.05, H, W * 0.18, H * 0.35, W * 0.42, H * 0.08, W * 0.66, H * 0.2, W * 0.86, H * 0.4, W * 0.96, H], '#2b1a1a');
    poli(c, [W * 0.5, H, W * 0.66, H * 0.2, W * 0.86, H * 0.4, W * 0.96, H], '#1d1111');
    rachaduras(c, W, H, 0.3, 6);
  }
  function pocoLava(c, W, H) {
    brilho(c, '#ff6a00', W * 0.12);
    oval(c, W * 0.5, H * 0.55, W * 0.48, H * 0.4, '#3a1a12');
    var g = c.createRadialGradient(W * 0.5, H * 0.55, 1, W * 0.5, H * 0.55, W * 0.42); g.addColorStop(0, '#fff3a0'); g.addColorStop(0.4, '#ffb703'); g.addColorStop(1, '#e85d04');
    c.fillStyle = g; c.save(); c.translate(W * 0.5, H * 0.55); c.scale(1, 0.7); c.beginPath(); c.arc(0, 0, W * 0.4, 0, Math.PI * 2); c.restore(); c.fill();
    c.shadowBlur = 0;
    [[0.35, 0.5], [0.62, 0.62], [0.5, 0.42]].forEach(function (b) { circ(c, W * b[0], H * b[1], W * 0.04, '#fff3a0'); });
  }
  function cristal(c, W, H) {
    sombra(c, W, H, 0.3);
    brilho(c, '#ff4d6d', W * 0.15);
    [[0.5, 0.02, 0.14, '#ff4d6d'], [0.3, 0.3, 0.1, '#e5383b'], [0.7, 0.25, 0.1, '#ff758f']].forEach(function (k) {
      poli(c, [W * k[0], H * k[1], W * (k[0] + k[2]), H * (k[1] + 0.2), W * (k[0] + k[2] * 0.7), H, W * (k[0] - k[2] * 0.7), H, W * (k[0] - k[2]), H * (k[1] + 0.2)], k[3]);
      poli(c, [W * k[0], H * k[1], W * (k[0] + k[2]), H * (k[1] + 0.2), W * k[0], H * 0.95], 'rgba(255,255,255,.25)');
    });
    c.shadowBlur = 0;
  }
  function fumaca(c, W, H) {
    sombra(c, W, H, 0.3);
    poli(c, [W * 0.2, H, W * 0.38, H * 0.62, W * 0.62, H * 0.62, W * 0.8, H], '#2b1a1a');
    brilho(c, '#ff6a00', W * 0.2); oval(c, W * 0.5, H * 0.63, W * 0.12, H * 0.03, '#ffb703'); c.shadowBlur = 0;
    [[0.5, 0.48, 0.16], [0.42, 0.34, 0.2], [0.58, 0.2, 0.22], [0.48, 0.07, 0.18]].forEach(function (b, k) { c.globalAlpha = 0.85 - k * 0.15; circ(c, W * b[0], H * b[1], W * b[2], '#8d8d96'); });
    c.globalAlpha = 1;
  }
  // ilhas flutuantes (floresta que brilha)
  function arvoreLuz(c, W, H) {
    sombra(c, W, H, 0.3);
    c.strokeStyle = '#3b2a5a'; c.lineWidth = W * 0.09; c.lineCap = 'round';
    c.beginPath(); c.moveTo(W * 0.5, H); c.bezierCurveTo(W * 0.4, H * 0.7, W * 0.62, H * 0.5, W * 0.5, H * 0.32); c.stroke();
    brilho(c, '#7cf9ff', W * 0.15);
    [[0.5, 0.2, 0.3, '#2ec4b6'], [0.3, 0.3, 0.2, '#1fa3a0'], [0.72, 0.28, 0.2, '#1fa3a0'], [0.5, 0.36, 0.22, '#36d6c6']].forEach(function (b) { circ(c, W * b[0], H * b[1], W * b[2], b[3]); });
    c.shadowBlur = 0;
    brilho(c, '#ff7ae6', W * 0.1);
    [[0.35, 0.22], [0.6, 0.14], [0.68, 0.34], [0.42, 0.36], [0.24, 0.32], [0.55, 0.28]].forEach(function (p, k) { circ(c, W * p[0], H * p[1], W * 0.035, k % 2 ? '#ff7ae6' : '#c6ff3d'); });
    c.shadowBlur = 0;
    c.strokeStyle = 'rgba(124,249,255,.8)'; c.lineWidth = W * 0.015;   // cipós de luz pendurados
    [0.3, 0.45, 0.7].forEach(function (x) { c.beginPath(); c.moveTo(W * x, H * 0.36); c.lineTo(W * (x + 0.02), H * 0.62); c.stroke(); circ(c, W * (x + 0.02), H * 0.63, W * 0.02, '#7cf9ff'); });
  }
  function cogumeloLuz(c, W, H) {
    sombra(c, W, H, 0.3);
    caixa(c, W * 0.4, H * 0.45, W * 0.2, H * 0.55, W * 0.08, '#e9e4ff');
    brilho(c, '#3effd8', W * 0.25);
    c.fillStyle = '#3effd8'; c.beginPath(); c.arc(W * 0.5, H * 0.5, W * 0.45, Math.PI, 0); c.closePath(); c.fill();
    c.shadowBlur = 0;
    [[0.32, 0.38], [0.55, 0.22], [0.72, 0.4], [0.45, 0.42]].forEach(function (d) { circ(c, W * d[0], H * d[1], W * 0.05, '#ffffff'); });
  }
  function florLanterna(c, W, H) {
    linha(c, [W * 0.5, H, W * 0.5, H * 0.32], '#2a9d8f', W * 0.07);
    oval(c, W * 0.34, H * 0.75, W * 0.16, W * 0.07, '#2ec4b6'); oval(c, W * 0.66, H * 0.62, W * 0.16, W * 0.07, '#2ec4b6');
    brilho(c, '#ff4fd8', W * 0.4);
    oval(c, W * 0.5, H * 0.22, W * 0.26, H * 0.16, '#ff4fd8'); oval(c, W * 0.5, H * 0.22, W * 0.14, H * 0.09, '#ffd1f5');
    c.shadowBlur = 0;
  }
  function ilhaVoando(c, W, H) {   // pedaço de montanha flutuando, com cachoeira e árvores de luz
    var cy = H * 0.3;
    c.fillStyle = gradV(c, cy, H * 0.75, '#6b5b95', '#2e2450');
    c.beginPath(); c.moveTo(W * 0.05, cy); c.lineTo(W * 0.95, cy); c.lineTo(W * 0.7, H * 0.55); c.lineTo(W * 0.55, H * 0.75); c.lineTo(W * 0.4, H * 0.6); c.lineTo(W * 0.25, H * 0.5); c.closePath(); c.fill();
    oval(c, W * 0.5, cy, W * 0.46, H * 0.05, '#2ec4b6');
    c.fillStyle = 'rgba(190,240,255,.75)'; c.fillRect(W * 0.62, cy, W * 0.05, H * 0.62);   // cachoeira caindo
    oval(c, W * 0.645, H * 0.93, W * 0.1, H * 0.03, 'rgba(190,240,255,.6)');
    brilho(c, '#7cf9ff', W * 0.06);
    [[0.25, 0.18, 0.1], [0.45, 0.12, 0.13], [0.75, 0.2, 0.09]].forEach(function (a) { linha(c, [W * a[0], cy, W * a[0], H * a[1] + W * a[2] * 0.5], '#3b2a5a', W * 0.03); circ(c, W * a[0], H * a[1], W * a[2], '#36d6c6'); });
    c.shadowBlur = 0;
  }
  // ---------- 1.11.1: comidas gigantes, mundo dos blocos e balões de emoji ----------
  function chocolate(c, W, H) {   // barra de chocolate em pé, meio desembrulhada (papel prateado e rótulo)
    sombra(c, W, H, 0.35);
    caixa(c, W * 0.15, H * 0.05, W * 0.7, H * 0.95, W * 0.05, '#5a3218');
    for (var y = 0; y < 4; y++) for (var x = 0; x < 2; x++) { caixa(c, W * (0.2 + x * 0.32), H * (0.08 + y * 0.11), W * 0.28, H * 0.09, W * 0.03, '#6e3f20'); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(W * (0.21 + x * 0.32), H * (0.085 + y * 0.11), W * 0.26, H * 0.015); }
    poli(c, [W * 0.13, H * 0.5, W * 0.87, H * 0.47, W * 0.87, H, W * 0.13, H], '#c9ced6');   // papel prateado
    poli(c, [W * 0.13, H * 0.5, W * 0.3, H * 0.44, W * 0.45, H * 0.52, W * 0.62, H * 0.45, W * 0.87, H * 0.47, W * 0.87, H * 0.53, W * 0.13, H * 0.55], '#e9edf2');
    caixa(c, W * 0.13, H * 0.62, W * 0.74, H * 0.3, W * 0.02, '#b5121b');
    c.fillStyle = '#ffd166'; c.font = '700 ' + Math.round(W * 0.2) + 'px ' + FONTE; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CHOCO', W * 0.5, H * 0.77);
  }
  function pudim(c, W, H) {   // pudim de leite com calda de caramelo escorrendo, no prato
    oval(c, W * 0.5, H * 0.92, W * 0.48, H * 0.07, '#e9e4f2'); oval(c, W * 0.5, H * 0.9, W * 0.4, H * 0.05, '#ffffff');
    c.fillStyle = grad(c, H * 0.3, H * 0.9, '#ffe7a0', '#f4c860'); c.beginPath(); c.moveTo(W * 0.14, H * 0.88); c.lineTo(W * 0.24, H * 0.32); c.lineTo(W * 0.76, H * 0.32); c.lineTo(W * 0.86, H * 0.88); c.closePath(); c.fill();
    oval(c, W * 0.5, H * 0.32, W * 0.26, H * 0.06, '#9c4a10');
    c.fillStyle = '#b5651d'; [0.3, 0.42, 0.56, 0.68].forEach(function (x, k) { c.beginPath(); c.moveTo(W * (x - 0.03), H * 0.33); c.lineTo(W * (x + 0.03), H * 0.33); c.lineTo(W * (x + 0.02), H * (0.45 + k % 2 * 0.12)); c.arc(W * x, H * (0.45 + k % 2 * 0.12), W * 0.02, 0, Math.PI); c.closePath(); c.fill(); });
    oval(c, W * 0.42, H * 0.3, W * 0.08, H * 0.02, 'rgba(255,255,255,.4)');
  }
  function tacaSorvete(c, W, H) {   // taça de sorvete com 3 bolas, calda, chantili e cereja
    oval(c, W * 0.5, H * 0.96, W * 0.25, H * 0.03, '#d6e6f2'); linha(c, [W * 0.5, H * 0.95, W * 0.5, H * 0.66], '#d6e6f2', W * 0.06);
    c.fillStyle = 'rgba(214,230,242,.85)'; c.beginPath(); c.moveTo(W * 0.12, H * 0.45); c.quadraticCurveTo(W * 0.2, H * 0.7, W * 0.5, H * 0.7); c.quadraticCurveTo(W * 0.8, H * 0.7, W * 0.88, H * 0.45); c.closePath(); c.fill();
    [['#ff8fab', 0.32, 0.4], ['#fff3b0', 0.68, 0.4], ['#8b5a2b', 0.5, 0.3]].forEach(function (b) { circ(c, W * b[1], H * b[2], W * 0.19, b[0]); circ(c, W * (b[1] - 0.06), H * (b[2] - 0.05), W * 0.05, 'rgba(255,255,255,.5)'); });
    c.fillStyle = '#5a2a0a'; c.beginPath(); c.moveTo(W * 0.32, H * 0.17); c.quadraticCurveTo(W * 0.5, H * 0.1, W * 0.68, H * 0.17); c.lineTo(W * 0.66, H * 0.24); c.lineTo(W * 0.6, H * 0.21); c.lineTo(W * 0.5, H * 0.28); c.lineTo(W * 0.4, H * 0.21); c.closePath(); c.fill();
    circ(c, W * 0.5, H * 0.1, W * 0.1, '#ffffff'); circ(c, W * 0.5, H * 0.03, W * 0.05, '#e63946'); linha(c, [W * 0.5, H * 0.0, W * 0.56, H * -0.02], '#2a9d50', W * 0.015);
  }
  function hamburguer(c, W, H) {   // hambúrguer gigante com gergelim, queijo, alface e tomate
    sombra(c, W, H, 0.45);
    caixa(c, W * 0.08, H * 0.78, W * 0.84, H * 0.18, H * 0.08, '#e9a54a');
    caixa(c, W * 0.06, H * 0.62, W * 0.88, H * 0.16, H * 0.08, '#6b3a1e');
    poli(c, [W * 0.05, H * 0.62, W * 0.95, H * 0.62, W * 0.88, H * 0.7, W * 0.76, H * 0.75, W * 0.66, H * 0.66, W * 0.3, H * 0.66, W * 0.18, H * 0.74, W * 0.1, H * 0.67], '#ffd23f');
    caixa(c, W * 0.1, H * 0.55, W * 0.8, H * 0.07, H * 0.03, '#e63946');
    c.fillStyle = '#4caf50'; c.beginPath(); c.moveTo(W * 0.04, H * 0.55); for (var k = 0; k <= 12; k++) c.lineTo(W * (0.04 + k * 0.077), H * (0.55 + (k % 2 ? 0.05 : -0.01))); c.lineTo(W * 0.96, H * 0.5); c.lineTo(W * 0.04, H * 0.5); c.closePath(); c.fill();
    c.fillStyle = grad(c, H * 0.04, H * 0.52, '#f6c46e', '#d2862e'); c.beginPath(); c.moveTo(W * 0.05, H * 0.52); c.quadraticCurveTo(W * 0.05, H * 0.04, W * 0.5, H * 0.04); c.quadraticCurveTo(W * 0.95, H * 0.04, W * 0.95, H * 0.52); c.closePath(); c.fill();
    [[0.25, 0.2], [0.4, 0.12], [0.55, 0.1], [0.7, 0.16], [0.82, 0.3], [0.18, 0.34], [0.5, 0.26], [0.65, 0.3], [0.35, 0.3]].forEach(function (g) { oval(c, W * g[0], H * g[1], W * 0.018, H * 0.01, '#fff7e0'); });
    oval(c, W * 0.32, H * 0.14, W * 0.12, H * 0.04, 'rgba(255,255,255,.3)');
  }
  function batata(c, W, H) {   // caixinha de batata frita
    for (var k = 0; k < 9; k++) caixa(c, W * (0.22 + k * 0.065), H * (0.05 + (k % 3) * 0.05), W * 0.06, H * 0.5, W * 0.02, k % 2 ? '#ffd23f' : '#f4b400');
    c.fillStyle = '#e63946'; c.beginPath(); c.moveTo(W * 0.15, H * 0.4); c.lineTo(W * 0.85, H * 0.4); c.lineTo(W * 0.75, H); c.lineTo(W * 0.25, H); c.closePath(); c.fill();
    c.fillStyle = '#ffd23f'; c.font = '700 ' + Math.round(W * 0.28) + 'px ' + FONTE; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('M', W * 0.5, H * 0.7);
  }
  function milkshake(c, W, H) {
    c.fillStyle = 'rgba(230,240,250,.9)'; c.beginPath(); c.moveTo(W * 0.2, H * 0.3); c.lineTo(W * 0.8, H * 0.3); c.lineTo(W * 0.68, H); c.lineTo(W * 0.32, H); c.closePath(); c.fill();
    c.fillStyle = '#ff8fab'; c.beginPath(); c.moveTo(W * 0.22, H * 0.36); c.lineTo(W * 0.78, H * 0.36); c.lineTo(W * 0.67, H * 0.96); c.lineTo(W * 0.33, H * 0.96); c.closePath(); c.fill();
    circ(c, W * 0.35, H * 0.27, W * 0.16, '#ffffff'); circ(c, W * 0.6, H * 0.25, W * 0.18, '#ffffff'); circ(c, W * 0.5, H * 0.14, W * 0.14, '#ffffff'); circ(c, W * 0.52, H * 0.03, W * 0.07, '#e63946');
    linha(c, [W * 0.65, H * 0.3, W * 0.78, H * -0.05], '#ff4fa3', W * 0.05);
  }
  // mundo dos blocos (estilo de construir com cubos; desenho próprio)
  function cubo(c, x, y, l, cima, frente, lado) {   // cubo em perspectiva simples: topo, frente e lado
    poli(c, [x, y, x + l, y, x + l * 1.25, y - l * 0.25, x + l * 0.25, y - l * 0.25], cima);
    c.fillStyle = frente; c.fillRect(x, y, l, l);
    poli(c, [x + l, y, x + l * 1.25, y - l * 0.25, x + l * 1.25, y + l * 0.75, x + l, y + l], lado);
  }
  function arvoreBloco(c, W, H) {
    sombra(c, W, H, 0.35);
    var l = W * 0.18;
    for (var k = 0; k < 3; k++) cubo(c, W * 0.38, H - l * (k + 1), l, '#8a5a36', '#6b4226', '#4e2e18');
    [[0.12, 0.35], [0.3, 0.35], [0.48, 0.35], [0.66, 0.35], [0.21, 0.2], [0.39, 0.2], [0.57, 0.2], [0.3, 0.05], [0.48, 0.05]].forEach(function (p) { cubo(c, W * p[0], H * p[1], l, '#5fd068', '#3fa34d', '#2c7d38'); });
  }
  function blocoGrama(c, W, H) {
    sombra(c, W, H, 0.4);
    var l = W * 0.3;
    [[0.08, 2], [0.38, 1], [0.38, 2], [0.38, 3]].forEach(function (p) { var y = H - l * p[1]; cubo(c, W * p[0], y, l, '#5fd068', '#8a5a36', '#6b4226'); c.fillStyle = '#4caf50'; c.fillRect(W * p[0], y, l, l * 0.22); });
  }
  function bauBloco(c, W, H) {
    sombra(c, W, H, 0.4);
    cubo(c, W * 0.1, H * 0.35, W * 0.65, '#c08552', '#a0662f', '#7a4a20');
    c.fillStyle = '#3a2410'; c.fillRect(W * 0.1, H * 0.55, W * 0.65, W * 0.03); caixa(c, W * 0.38, H * 0.5, W * 0.09, W * 0.1, W * 0.01, '#c9ced6');
  }
  function blocoOuro(c, W, H) {
    sombra(c, W, H, 0.35);
    brilho(c, '#ffd166', W * 0.2); cubo(c, W * 0.15, H * 0.35, W * 0.6, '#fff3a0', '#ffd23f', '#e0a800'); c.shadowBlur = 0;
    [[0.25, 0.45], [0.55, 0.6], [0.35, 0.75]].forEach(function (p) { c.fillStyle = '#fffbe0'; c.fillRect(W * p[0], H * p[1], W * 0.08, W * 0.08); });
  }
  // balão de emoji (um rosto grande e redondo, preso por um fio)
  var EMOJIS_BALAO = ['😀', '😎', '🤩', '🥳', '😜', '🤖', '👽', '🦄', '🐸', '🍕', '🌈', '⭐'];
  function balaoEmoji(emo) { return function (c, W, H) { linha(c, [W * 0.5, H * 0.55, W * 0.48, H], '#ffffff', W * 0.02); c.font = Math.round(W * 0.9) + 'px ' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(emo, W * 0.5, H * 0.3); }; }

  // ---------- coisas da pista ----------
  function estrela(c, W, H) {
    var cx = W / 2, cy = H / 2, R = W * 0.46, r = R * 0.48, pts = [];
    for (var k = 0; k < 10; k++) { var a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r : R; pts.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.98 + H * 0.03); }
    brilho(c, '#ffd166', W * 0.15); poli(c, pts, '#ff9f1c'); c.shadowBlur = 0;
    var p2 = pts.map(function (v, i) { return i % 2 ? cy + (v - cy) * 0.82 : cx + (v - cx) * 0.82; });
    poli(c, p2, '#ffd93d');
    oval(c, cx - W * 0.12, cy - H * 0.14, W * 0.08, H * 0.05, 'rgba(255,255,255,.8)');
    circ(c, cx - W * 0.09, cy + H * 0.02, W * 0.04, '#5a3300'); circ(c, cx + W * 0.09, cy + H * 0.02, W * 0.04, '#5a3300');
    c.strokeStyle = '#5a3300'; c.lineWidth = W * 0.03; c.beginPath(); c.arc(cx, cy + H * 0.08, W * 0.07, 0.2, Math.PI - 0.2); c.stroke();
  }
  function cone(c, W, H) {
    sombra(c, W, H, 0.48);
    caixa(c, W * 0.04, H * 0.86, W * 0.92, H * 0.12, W * 0.04, '#d95d00');
    poli(c, [W * 0.4, H * 0.02, W * 0.6, H * 0.02, W * 0.86, H * 0.88, W * 0.14, H * 0.88], '#ff7b00');
    poli(c, [W * 0.32, H * 0.3, W * 0.68, H * 0.3, W * 0.74, H * 0.46, W * 0.26, H * 0.46], '#ffffff');
    poli(c, [W * 0.22, H * 0.6, W * 0.78, H * 0.6, W * 0.82, H * 0.74, W * 0.18, H * 0.74], '#ffffff');
  }
  function lama(c, W, H) {
    oval(c, W * 0.5, H * 0.55, W * 0.48, H * 0.42, '#6b3e1f');
    oval(c, W * 0.3, H * 0.5, W * 0.2, H * 0.3, '#7d4a26'); oval(c, W * 0.68, H * 0.6, W * 0.22, H * 0.3, '#7d4a26');
    circ(c, W * 0.4, H * 0.42, H * 0.12, '#9a6235'); circ(c, W * 0.62, H * 0.5, H * 0.09, '#9a6235'); oval(c, W * 0.32, H * 0.36, W * 0.06, H * 0.08, 'rgba(255,255,255,.35)');
  }
  var ARCO = ['#ff3b3b', '#ff9f1c', '#ffd93d', '#4cd964', '#3ee8ff', '#3a86ff', '#9b5de5'];
  function turbo(c, W, H) {
    var cx = W / 2, cy = H, larg = W * 0.055;
    brilho(c, '#ffffff', W * 0.05);
    ARCO.forEach(function (cor, k) { c.strokeStyle = cor; c.lineWidth = larg; c.beginPath(); c.arc(cx, cy, W * 0.47 - k * larg, Math.PI, 0); c.stroke(); });
    c.shadowBlur = 0;
    poli(c, [cx - W * 0.1, H * 0.92, cx, H * 0.7, cx + W * 0.1, H * 0.92, cx, H * 0.84], '#ffffff');
  }
  function rampa(c, W, H) {
    poli(c, [W * 0.02, H, W * 0.98, H, W * 0.84, H * 0.06, W * 0.16, H * 0.06], '#ffd166');
    poli(c, [W * 0.16, H * 0.06, W * 0.84, H * 0.06, W * 0.82, 0, W * 0.18, 0], '#ffe9a8');
    for (var k = 0; k < 3; k++) { var y = H * (0.85 - k * 0.28); poli(c, [W * 0.5, y - H * 0.2, W * 0.66, y, W * 0.58, y, W * 0.5, y - H * 0.1, W * 0.42, y, W * 0.34, y], '#e63946'); }
    poli(c, [W * 0.02, H, W * 0.16, H * 0.06, W * 0.12, H * 0.06, W * -0.02, H], '#c79a2e');
  }

  // ---------- carros (vistos de trás) ----------
  function carroTras(c, W, H, cor, emoji, especial) {
    sombra(c, W, H, 0.48);
    caixa(c, W * 0.06, H * 0.7, W * 0.2, H * 0.3, W * 0.05, '#1b1b22'); caixa(c, W * 0.74, H * 0.7, W * 0.2, H * 0.3, W * 0.05, '#1b1b22');
    // cabine e vidro
    poli(c, [W * 0.17, H * 0.46, W * 0.27, H * 0.1, W * 0.73, H * 0.1, W * 0.83, H * 0.46], cor);
    poli(c, [W * 0.24, H * 0.43, W * 0.31, H * 0.16, W * 0.69, H * 0.16, W * 0.76, H * 0.43], '#9fdcff');
    if (emoji) {
      c.save(); c.beginPath(); c.moveTo(W * 0.24, H * 0.43); c.lineTo(W * 0.31, H * 0.16); c.lineTo(W * 0.69, H * 0.16); c.lineTo(W * 0.76, H * 0.43); c.closePath(); c.clip();
      c.font = Math.round(H * 0.34) + 'px ' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(emoji, W * 0.5, H * 0.33); c.restore();
    }
    poli(c, [W * 0.31, H * 0.16, W * 0.42, H * 0.16, W * 0.3, H * 0.43, W * 0.25, H * 0.43], 'rgba(255,255,255,.35)');
    // carroceria
    caixa(c, W * 0.03, H * 0.42, W * 0.94, H * 0.38, W * 0.08, cor);
    caixa(c, W * 0.03, H * 0.42, W * 0.94, H * 0.08, W * 0.04, 'rgba(255,255,255,.25)');
    caixa(c, W * 0.06, H * 0.74, W * 0.88, H * 0.08, W * 0.04, 'rgba(0,0,0,.35)');
    brilho(c, '#ff3b3b', W * 0.05);
    caixa(c, W * 0.07, H * 0.52, W * 0.18, H * 0.1, W * 0.03, '#ff3b3b'); caixa(c, W * 0.75, H * 0.52, W * 0.18, H * 0.1, W * 0.03, '#ff3b3b');
    c.shadowBlur = 0;
    caixa(c, W * 0.37, H * 0.56, W * 0.26, H * 0.11, W * 0.02, '#ffffff');
    c.fillStyle = '#1a1446'; c.font = '700 ' + Math.round(H * 0.08) + 'px ' + FONTE; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(especial ? 'VRUUM' : 'BIBI', W * 0.5, H * 0.62);
    if (especial) {
      caixa(c, W * 0.08, H * 0.04, W * 0.84, H * 0.06, W * 0.02, '#1b1b22'); c.fillStyle = '#1b1b22'; c.fillRect(W * 0.2, H * 0.08, W * 0.04, H * 0.06); c.fillRect(W * 0.76, H * 0.08, W * 0.04, H * 0.06);
      circ(c, W * 0.3, H * 0.83, W * 0.035, '#9aa0a6'); circ(c, W * 0.38, H * 0.83, W * 0.035, '#9aa0a6');
    }
  }
  function onibus(c, W, H) {
    sombra(c, W, H, 0.48);
    caixa(c, W * 0.08, H * 0.84, W * 0.18, H * 0.16, W * 0.05, '#1b1b22'); caixa(c, W * 0.74, H * 0.84, W * 0.18, H * 0.16, W * 0.05, '#1b1b22');
    caixa(c, W * 0.04, H * 0.02, W * 0.92, H * 0.86, W * 0.08, '#ffc300');
    caixa(c, W * 0.12, H * 0.1, W * 0.34, H * 0.3, W * 0.04, '#2b3a55'); caixa(c, W * 0.54, H * 0.1, W * 0.34, H * 0.3, W * 0.04, '#2b3a55');
    c.font = Math.round(H * 0.2) + 'px ' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🐻', W * 0.29, H * 0.3); c.fillText('🐵', W * 0.71, H * 0.3);
    c.fillStyle = '#1a1446'; c.font = '700 ' + Math.round(H * 0.08) + 'px ' + FONTE; c.fillText('ESCOLAR', W * 0.5, H * 0.5);
    brilho(c, '#ff3b3b', W * 0.05); circ(c, W * 0.14, H * 0.62, W * 0.05, '#ff3b3b'); circ(c, W * 0.86, H * 0.62, W * 0.05, '#ff3b3b'); c.shadowBlur = 0;
    caixa(c, W * 0.04, H * 0.76, W * 0.92, H * 0.08, W * 0.03, '#1b1b22');
  }

  // ---------- portais e faixas ----------
  function faixa(c, W, H, texto, cor1, cor2, xadrez) {
    var pil = W * 0.035, esq = W * 0.5 - W * 0.43, dir = W * 0.5 + W * 0.43;
    [esq, dir].forEach(function (x) { caixa(c, x - pil / 2, H * 0.1, pil, H * 0.9, pil * 0.3, cor2); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x, H * 0.1, pil / 2, H * 0.9); });
    var top = H * 0.04, alt = H * 0.24;
    if (xadrez) {
      var n = 24, q = (dir - esq) / n;
      for (var i = 0; i < n; i++) for (var k = 0; k < 2; k++) { c.fillStyle = (i + k) % 2 ? '#111' : '#fff'; c.fillRect(esq + i * q, top + k * alt / 2, q + 1, alt / 2 + 1); }
      caixa(c, W * 0.3, top + alt * 0.12, W * 0.4, alt * 0.76, alt * 0.2, cor1);
    } else caixa(c, esq - pil, top, dir - esq + pil * 2, alt, alt * 0.25, cor1);
    c.fillStyle = '#ffffff'; c.font = '700 ' + Math.round(alt * 0.55) + 'px ' + FONTE + ',' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = alt * 0.08; c.strokeStyle = 'rgba(0,0,0,.35)'; c.strokeText(texto, W / 2, top + alt / 2); c.fillText(texto, W / 2, top + alt / 2);
    for (var b = 0; b < 14; b++) circ(c, esq + (dir - esq) * b / 13, top + alt + H * 0.015, H * 0.012, b % 2 ? '#ffd166' : '#ff4fa3');
  }

  // ---------- fundos (morros, mar, cidade) que se repetem lado a lado ----------
  function serra(c, W, H, base, amp, ondas, cor, pico) {
    c.fillStyle = cor; c.beginPath(); c.moveTo(0, H);
    for (var x = 0; x <= W; x += 4) {
      var t = x / W * Math.PI * 2, y = 0;
      ondas.forEach(function (o) { y += Math.sin(t * o[0] + o[1]) * o[2]; });
      if (pico) y = -Math.abs(y) * 1.4;
      c.lineTo(x, H * base - y * amp * H);
    }
    c.lineTo(W, H); c.closePath(); c.fill();
  }
  var FUNDOS = {
    lanche: function (c, W, H) {   // a cidade do lanche: prédios em forma de copo, batata e hambúrguer
      serra(c, W, H, 0.7, 0.1, [[3, 0, 1], [7, 1, 0.4]], '#ffb4a8');
      [[0.08, 0.22, '#e63946'], [0.3, 0.16, '#ffd23f'], [0.55, 0.26, '#ff8fab'], [0.8, 0.18, '#4cc35a']].forEach(function (p, k) {
        var x = W * p[0], w = W * 0.12, y = H * p[1];
        c.fillStyle = p[2]; c.fillRect(x, y, w, H * 0.72 - y);
        for (var q = 0; q < 4; q++) { c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(x + w * 0.2, y + H * (0.08 + q * 0.12), w * 0.2, H * 0.06); c.fillRect(x + w * 0.6, y + H * (0.08 + q * 0.12), w * 0.2, H * 0.06); }
        if (k % 2) { c.fillStyle = '#d2862e'; c.beginPath(); c.arc(x + w / 2, y, w * 0.6, Math.PI, 0); c.fill(); } else { c.fillStyle = '#ffffff'; c.fillRect(x + w * 0.45, y - H * 0.1, w * 0.1, H * 0.1); }
      });
      c.fillStyle = '#ffffff'; c.fillRect(0, H * 0.72, W, H * 0.28);
      for (var x = 0; x < W; x += 32) for (var y = 0; y < 3; y++) if ((x / 32 + y) % 2 < 1) { c.fillStyle = '#e63946'; c.fillRect(x, H * (0.72 + y * 0.093), 32, H * 0.093); }
    },
    blocos: function (c, W, H) {   // morros de blocos em degraus e nuvens quadradas
      c.fillStyle = 'rgba(255,255,255,.9)'; [[0.1, 0.12], [0.45, 0.06], [0.75, 0.15]].forEach(function (n) { c.fillRect(W * n[0], H * n[1], W * 0.12, H * 0.06); c.fillRect(W * n[0] + W * 0.03, H * n[1] - H * 0.04, W * 0.06, H * 0.05); });
      var s = 9, l = 16;
      for (var x = 0; x < W; x += l) {
        var alt = 0.42 + 0.22 * Math.sin(x / W * Math.PI * 4) + 0.08 * Math.sin(x / W * Math.PI * 10);
        var y0 = Math.round(H * alt / l) * l;
        c.fillStyle = '#4caf50'; c.fillRect(x, y0, l, l);
        c.fillStyle = '#8a5a36'; c.fillRect(x, y0 + l, l, H - y0 - l);
        s = (s * 9301 + 49297) % 233280; if (s % 5 === 0) { c.fillStyle = '#9e9e9e'; c.fillRect(x, y0 + l * 3, l, l); }
        c.strokeStyle = 'rgba(0,0,0,.12)'; c.strokeRect(x, y0, l, l);
      }
      for (x = 0; x < W; x += 96) { c.fillStyle = '#6b4226'; c.fillRect(x + 40, H * 0.62, l, H * 0.12); c.fillStyle = '#3fa34d'; c.fillRect(x + 24, H * 0.5, l * 3, l * 2); }
    },
    canion: function (c, W, H) {   // paredões de pedra vermelha em degraus (mesas) e a planície
      serra(c, W, H, 0.6, 0.3, [[2, 0, 1], [5, 1.3, 0.35]], '#d07a45');
      var s = 3;
      for (var k = 0; k < 7; k++) { s = (s * 9301 + 49297) % 233280; var x = (k / 7 + s / 233280 * 0.08) * W, lw = W * (0.06 + (k % 3) * 0.03), ht = H * (0.28 + (k % 2) * 0.14);
        c.fillStyle = '#b5552e'; c.fillRect(x, H * 0.66 - ht, lw, ht); c.fillStyle = '#e8945a'; c.fillRect(x, H * 0.66 - ht, lw, H * 0.03); c.fillStyle = '#8f3f22'; c.fillRect(x + lw * 0.65, H * 0.66 - ht, lw * 0.35, ht); }
      c.fillStyle = '#e8b36a'; c.fillRect(0, H * 0.66, W, H * 0.34);
      for (k = 0; k < 24; k++) { var x2 = (k * 89) % W, y2 = H * (0.72 + (k % 4) * 0.06); linha(c, [x2, y2, x2, y2 - 14], '#3f9d4a', 6); }
    },
    templo: function (c, W, H) {   // selva, a pirâmide do templo e cachoeira
      serra(c, W, H, 0.5, 0.22, [[2, 0.4, 1], [6, 2, 0.4]], '#2c6e57');
      var px = W * 0.62, py = H * 0.7;
      for (var k = 0; k < 5; k++) { var lw = W * (0.22 - k * 0.04), ht = H * 0.08; c.fillStyle = k % 2 ? '#7d918c' : '#8fa3a0'; c.fillRect(px - lw / 2, py - ht * (k + 1), lw, ht); }
      c.fillStyle = '#3ef0d0'; c.fillRect(px - W * 0.012, py - H * 0.4, W * 0.024, H * 0.05);
      c.fillStyle = 'rgba(190,240,255,.7)'; c.fillRect(W * 0.2, H * 0.3, W * 0.03, H * 0.42);
      serra(c, W, H, 0.74, 0.12, [[5, 1, 1], [11, 0, 0.4]], '#1f5e44');
      for (k = 0; k < 26; k++) { var x = (k * 61) % W, y = H * (0.8 + (k % 3) * 0.06); circ(c, x, y, 16, k % 2 ? '#2a7d51' : '#3e9a5a'); }
    },
    lava: function (c, W, H) {   // o vulcão soltando fumaça, rios de lava e rochas escuras
      var g = c.createLinearGradient(0, H * 0.15, 0, H * 0.7); g.addColorStop(0, '#3a1a1a'); g.addColorStop(1, '#1d0f0f');
      c.fillStyle = g; c.beginPath(); c.moveTo(W * 0.25, H * 0.75); c.lineTo(W * 0.45, H * 0.18); c.lineTo(W * 0.55, H * 0.18); c.lineTo(W * 0.78, H * 0.75); c.closePath(); c.fill();
      c.fillStyle = '#ff6a00'; c.beginPath(); c.moveTo(W * 0.47, H * 0.2); c.lineTo(W * 0.53, H * 0.2); c.lineTo(W * 0.56, H * 0.45); c.lineTo(W * 0.5, H * 0.75); c.lineTo(W * 0.46, H * 0.5); c.closePath(); c.fill();
      oval(c, W * 0.5, H * 0.18, W * 0.05, H * 0.03, '#ffd166');
      [[0.5, 0.08, 40], [0.46, 0.0, 30], [0.56, -0.04, 36]].forEach(function (b) { c.globalAlpha = 0.6; circ(c, W * b[0], H * b[1], b[2], '#5c4a4a'); }); c.globalAlpha = 1;
      serra(c, W, H, 0.72, 0.12, [[3, 0.5, 1], [9, 1, 0.4]], '#2b1a1a');
      c.strokeStyle = '#ff8c1a'; c.lineWidth = 5; c.lineCap = 'round';
      for (var k = 0; k < 6; k++) { var x = (k * 173) % W; c.beginPath(); c.moveTo(x, H * 0.78); c.quadraticCurveTo(x + 30, H * 0.88, x - 10, H); c.stroke(); }
    },
    flutuante: function (c, W, H) {   // ilhas de pedra flutuando com cachoeiras, e montanhas lá longe
      serra(c, W, H, 0.7, 0.18, [[2, 1, 1], [7, 0, 0.3]], '#4b3f7a');
      [[0.12, 0.25, 0.08], [0.38, 0.12, 0.11], [0.66, 0.3, 0.07], [0.86, 0.15, 0.09]].forEach(function (a) {
        var x = W * a[0], y = H * a[1], r = W * a[2];
        c.fillStyle = '#5a4a8a'; c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r, y); c.lineTo(x + r * 0.3, y + r * 1.4); c.lineTo(x - r * 0.4, y + r * 0.9); c.closePath(); c.fill();
        oval(c, x, y, r, r * 0.18, '#2ec4b6');
        c.fillStyle = 'rgba(190,240,255,.6)'; c.fillRect(x + r * 0.2, y, 4, H * 0.7 - y);
        circ(c, x - r * 0.3, y - r * 0.25, r * 0.25, '#36d6c6'); circ(c, x + r * 0.35, y - r * 0.2, r * 0.2, '#ff7ae6');
      });
      serra(c, W, H, 0.82, 0.08, [[4, 2, 1], [10, 0, 0.4]], '#1d8a7a');
    },
    praia: function (c, W, H) {
      serra(c, W, H, 0.55, 0.12, [[3, 0, 1], [7, 1, 0.4]], '#7fd3a8');
      var g = c.createLinearGradient(0, H * 0.62, 0, H); g.addColorStop(0, '#1fa3e0'); g.addColorStop(1, '#0d6fb8'); c.fillStyle = g; c.fillRect(0, H * 0.62, W, H * 0.38);
      for (var k = 0; k < 40; k++) linha(c, [(k * 97) % W, H * (0.7 + (k % 5) * 0.06), (k * 97) % W + 18, H * (0.7 + (k % 5) * 0.06)], 'rgba(255,255,255,.6)', 3);
      [[0.2, 0.62], [0.7, 0.66]].forEach(function (b) { poli(c, [W * b[0], H * b[1], W * b[0] + 30, H * b[1], W * b[0] + 24, H * b[1] + 8, W * b[0] + 6, H * b[1] + 8], '#fff'); poli(c, [W * b[0] + 15, H * b[1] - 30, W * b[0] + 15, H * b[1] - 2, W * b[0] + 32, H * b[1] - 4], '#ff4d6d'); });
    },
    floresta: function (c, W, H) {
      serra(c, W, H, 0.5, 0.2, [[2, 0, 1], [5, 2, 0.5], [11, 1, 0.2]], '#3f8f6b');
      serra(c, W, H, 0.72, 0.14, [[3, 1, 1], [8, 0, 0.4]], '#2e7d4f');
      for (var k = 0; k < 30; k++) { var x = (k * 53) % W, y = H * (0.78 + (k % 3) * 0.06); poli(c, [x, y - 26, x + 10, y, x - 10, y], '#1f6b3e'); }
    },
    doces: function (c, W, H) {
      serra(c, W, H, 0.5, 0.18, [[2, 0.5, 1], [6, 0, 0.4]], '#c77dff');
      serra(c, W, H, 0.7, 0.12, [[3, 2, 1], [9, 1, 0.3]], '#ff8fcf');
      c.fillStyle = '#ffffff';
      for (var x = 0; x < W; x += 26) { var t = x / W * Math.PI * 2, y = H * 0.7 - (Math.sin(t * 3 + 2) + Math.sin(t * 9 + 1) * 0.3) * 0.12 * H; c.beginPath(); c.arc(x, y + 4, 9, 0, Math.PI); c.fill(); c.fillRect(x - 9, y - 2, 18, 6); }
      [[0.15, 0.3], [0.55, 0.25], [0.85, 0.35]].forEach(function (p) { linha(c, [W * p[0], H * p[1], W * p[0], H * 0.7], '#fff', 6); circ(c, W * p[0], H * p[1], 26, '#ffd166'); circ(c, W * p[0], H * p[1], 14, '#ff4fa3'); });
    },
    neve: function (c, W, H) {
      serra(c, W, H, 0.65, 0.35, [[3, 0, 1], [7, 1, 0.5], [13, 2, 0.2]], '#7d94c4', true);
      c.save(); c.beginPath(); c.rect(0, 0, W, H * 0.42); c.clip(); serra(c, W, H, 0.65, 0.35, [[3, 0, 1], [7, 1, 0.5], [13, 2, 0.2]], '#ffffff', true); c.restore();
      serra(c, W, H, 0.82, 0.1, [[4, 1, 1], [9, 0, 0.4]], '#c9d8f2');
    },
    neon: function (c, W, H) {
      var sx = W * 0.5, sy = H * 0.62, R = H * 0.42, g = c.createLinearGradient(0, sy - R, 0, sy); g.addColorStop(0, '#ffd166'); g.addColorStop(1, '#ff2bd6');
      c.fillStyle = g; c.beginPath(); c.arc(sx, sy, R, Math.PI, 0); c.fill();
      c.fillStyle = '#2a1660'; for (var k = 0; k < 6; k++) c.fillRect(sx - R, sy - R * 0.5 + k * R * 0.1, R * 2, R * 0.03 + k * 1.5);
      var s = 3;
      for (var x = 0; x < W; x += 34) {
        s = (s * 9301 + 49297) % 233280; var alt = H * (0.25 + s / 233280 * 0.45);
        c.fillStyle = '#1c1048'; c.fillRect(x, H - alt, 30, alt);
        for (var y = H - alt + 8; y < H - 8; y += 14) for (var wx = 4; wx < 26; wx += 9) { s = (s * 9301 + 49297) % 233280; if (s % 3 === 0) { c.fillStyle = s % 2 ? '#2bf4ff' : '#ff7ae6'; c.fillRect(x + wx, y, 4, 6); } }
      }
    }
  };
  function nuvens(c, W, H) {
    for (var k = 0; k < 7; k++) {
      var x = (k * 151 + 40) % W, y = H * (0.25 + (k % 3) * 0.2), r = 18 + (k % 4) * 6;
      [[0, 0, 1], [-1, 0.3, 0.7], [1, 0.3, 0.75], [0.5, -0.3, 0.8], [-0.5, -0.2, 0.7]].forEach(function (b) { circ(c, x + b[0] * r * 1.3, y + b[1] * r, r * b[2], 'rgba(255,255,255,.92)'); });
    }
  }
  function estrelas(c, W, H) {
    for (var k = 0; k < 90; k++) circ(c, (k * 137) % W, (k * 71) % H, k % 7 ? 1.3 : 2.4, k % 5 ? 'rgba(255,255,255,.85)' : '#ffd166');
  }

  // ---------- céu (para quem voa): obstáculos, trânsito aéreo e enfeites ----------
  function passaros(c, W, H) {   // bando de 3 passarinhos fofos de asas abertas
    [[0.5, 0.45, 1], [0.2, 0.7, 0.7], [0.8, 0.68, 0.75]].forEach(function (p) {
      var x = W * p[0], y = H * p[1], r = W * 0.13 * p[2];
      c.fillStyle = '#ff9f1c'; c.beginPath(); c.moveTo(x - r * 2.3, y - r * 0.9); c.quadraticCurveTo(x - r, y - r * 1.4, x, y); c.quadraticCurveTo(x + r, y - r * 1.4, x + r * 2.3, y - r * 0.9); c.quadraticCurveTo(x + r, y - r * 0.2, x, y + r * 0.3); c.quadraticCurveTo(x - r, y - r * 0.2, x - r * 2.3, y - r * 0.9); c.fill();
      circ(c, x, y, r, '#3a86ff'); circ(c, x, y + r * 0.25, r * 0.6, '#a9dcff');
      circ(c, x - r * 0.35, y - r * 0.25, r * 0.16, '#fff'); circ(c, x + r * 0.35, y - r * 0.25, r * 0.16, '#fff');
      circ(c, x - r * 0.33, y - r * 0.22, r * 0.08, '#111'); circ(c, x + r * 0.37, y - r * 0.22, r * 0.08, '#111');
      poli(c, [x - r * 0.18, y + r * 0.05, x + r * 0.18, y + r * 0.05, x, y + r * 0.35], '#ffd166');
    });
  }
  function nuvemRaio(c, W, H) {   // nuvem de tempestade: balança e segura
    [[0.5, 0.45, 0.3], [0.28, 0.55, 0.22], [0.72, 0.55, 0.23], [0.38, 0.35, 0.2], [0.62, 0.34, 0.21]].forEach(function (b) { circ(c, W * b[0], H * b[1], W * b[2], '#4b4f66'); });
    [[0.45, 0.4, 0.15], [0.62, 0.42, 0.12]].forEach(function (b) { circ(c, W * b[0], H * b[1], W * b[2], '#5d6280'); });
    brilho(c, '#ffe066', W * 0.08);
    poli(c, [W * 0.52, H * 0.6, W * 0.4, H * 0.82, W * 0.5, H * 0.82, W * 0.42, H * 1.0, W * 0.62, H * 0.74, W * 0.52, H * 0.74, W * 0.6, H * 0.6], '#ffe066');
    c.shadowBlur = 0;
    circ(c, W * 0.42, H * 0.5, W * 0.03, '#fff'); circ(c, W * 0.58, H * 0.5, W * 0.03, '#fff'); circ(c, W * 0.42, H * 0.51, W * 0.015, '#222'); circ(c, W * 0.58, H * 0.51, W * 0.015, '#222');
    c.strokeStyle = '#222'; c.lineWidth = W * 0.012; c.beginPath(); c.arc(W * 0.5, H * 0.6, W * 0.05, Math.PI + 0.4, -0.4); c.stroke();
  }
  function anel(c, W, H) {   // anel dourado de turbo, em pé, com brilho de arco-íris por dentro
    var cx = W / 2, cy = H / 2, R = W * 0.44;
    brilho(c, '#ffd166', W * 0.12);
    c.strokeStyle = '#ffb703'; c.lineWidth = W * 0.09; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
    c.shadowBlur = 0; c.strokeStyle = '#fff3a0'; c.lineWidth = W * 0.03; c.beginPath(); c.arc(cx, cy, R, Math.PI * 1.1, Math.PI * 1.6); c.stroke();
    ARCO.forEach(function (cor, k) { c.strokeStyle = cor; c.globalAlpha = 0.35; c.lineWidth = W * 0.025; c.beginPath(); c.arc(cx, cy, R * (0.86 - k * 0.04), 0, Math.PI * 2); c.stroke(); });
    c.globalAlpha = 1;
    for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4; poli(c, [cx + Math.cos(a) * R * 1.12, cy + Math.sin(a) * R * 1.12 - W * 0.03, cx + Math.cos(a) * R * 1.12 + W * 0.02, cy + Math.sin(a) * R * 1.12, cx + Math.cos(a) * R * 1.12, cy + Math.sin(a) * R * 1.12 + W * 0.03, cx + Math.cos(a) * R * 1.12 - W * 0.02, cy + Math.sin(a) * R * 1.12], '#fff'); }
  }
  function corrente(c, W, H) {   // corrente de ar para cima: espiral clara com setas
    c.globalAlpha = 0.55;
    for (var k = 0; k < 3; k++) { c.strokeStyle = k % 2 ? '#bdeaff' : '#ffffff'; c.lineWidth = W * 0.05; c.beginPath(); for (var t = 0; t <= 1; t += 0.02) { var x = W * (0.5 + Math.sin(t * Math.PI * 4 + k * 2) * 0.35 * (1 - t * 0.3)), y = H * (1 - t); if (t === 0) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke(); }
    c.globalAlpha = 1;
    [0.3, 0.6].forEach(function (y) { poli(c, [W * 0.5, H * (y - 0.14), W * 0.68, H * y, W * 0.57, H * y, W * 0.57, H * (y + 0.1), W * 0.43, H * (y + 0.1), W * 0.43, H * y, W * 0.32, H * y], '#3ee8ff'); });
  }
  function aviaoTrafego(c, W, H, cor) {   // aviãozinho do trânsito do céu (mais simples)
    poli(c, [W * 0.02, H * 0.6, W * 0.98, H * 0.6, W * 0.98, H * 0.68, W * 0.02, H * 0.68], cor);
    caixa(c, W * 0.3, H * 0.34, W * 0.4, H * 0.06, H * 0.02, cor);
    poli(c, [W * 0.47, H * 0.56, W * 0.5, H * 0.1, W * 0.53, H * 0.1, W * 0.54, H * 0.56], cor);
    oval(c, W * 0.5, H * 0.62, W * 0.12, H * 0.16, '#f5f5f5'); circ(c, W * 0.5, H * 0.62, W * 0.05, '#9fdcff');
    brilho(c, '#ff2a2a', W * 0.03); circ(c, W * 0.03, H * 0.64, H * 0.03, '#ff3b3b'); circ(c, W * 0.97, H * 0.64, H * 0.03, '#4cd964'); c.shadowBlur = 0;
  }
  function balao(c, W, H) {   // balão de ar quente listrado
    var cores = ['#ff4d6d', '#ffd166', '#3ee8ff', '#c6ff3d', '#ff9f1c', '#9b5de5'];
    c.save(); c.beginPath(); c.ellipse ? c.ellipse(W * 0.5, H * 0.36, W * 0.46, H * 0.34, 0, 0, Math.PI * 2) : c.arc(W * 0.5, H * 0.36, W * 0.46, 0, Math.PI * 2); c.clip();
    for (var k = 0; k < 6; k++) { c.fillStyle = cores[k]; c.beginPath(); c.ellipse ? c.ellipse(W * 0.5, H * 0.36, W * 0.46 * (1 - k / 6), H * 0.36, 0, 0, Math.PI * 2) : c.arc(W * 0.5, H * 0.36, W * 0.46 * (1 - k / 6), 0, Math.PI * 2); c.fill(); }
    c.restore();
    poli(c, [W * 0.3, H * 0.62, W * 0.7, H * 0.62, W * 0.58, H * 0.74, W * 0.42, H * 0.74], '#ff4d6d');
    linha(c, [W * 0.42, H * 0.74, W * 0.4, H * 0.85], '#6b4b1a', W * 0.01); linha(c, [W * 0.58, H * 0.74, W * 0.6, H * 0.85], '#6b4b1a', W * 0.01);
    caixa(c, W * 0.38, H * 0.85, W * 0.24, H * 0.13, W * 0.02, '#a0682f'); c.fillStyle = '#7a4b1e'; c.fillRect(W * 0.38, H * 0.9, W * 0.24, H * 0.015);
    c.font = Math.round(H * 0.08) + 'px ' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🐻', W * 0.5, H * 0.84);
  }
  function nuvemFofa(c, W, H, noite) {
    var cor = noite ? 'rgba(70,62,140,.42)' : 'rgba(255,255,255,.95)', sombraCor = noite ? 'rgba(30,24,70,.35)' : 'rgba(200,220,240,.9)';
    [[0.5, 0.62, 0.26], [0.28, 0.7, 0.2], [0.72, 0.7, 0.21], [0.4, 0.5, 0.2], [0.6, 0.48, 0.22], [0.16, 0.78, 0.13], [0.84, 0.78, 0.14]].forEach(function (b) { circ(c, W * b[0], H * b[1] + H * 0.04, W * b[2], sombraCor); });
    [[0.5, 0.62, 0.26], [0.28, 0.7, 0.2], [0.72, 0.7, 0.21], [0.4, 0.5, 0.2], [0.6, 0.48, 0.22], [0.16, 0.78, 0.13], [0.84, 0.78, 0.14]].forEach(function (b) { circ(c, W * b[0], H * b[1], W * b[2], cor); });
  }

  // ---------- visual neon: itens mais sóbrios, que brilham ----------
  function estrelaNeon(c, W, H) {   // estrela de luz, sem carinha
    var cx = W / 2, cy = H / 2 + H * 0.03, R = W * 0.4, r = R * 0.45, pts = [];
    for (var k = 0; k < 10; k++) { var a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r : R; pts.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    var tracar = function () { c.beginPath(); c.moveTo(pts[0], pts[1]); for (var i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); };
    c.lineJoin = 'round';
    brilho(c, '#ffd166', W * 0.18); c.fillStyle = 'rgba(255,209,102,.18)'; tracar(); c.fill();
    c.strokeStyle = '#ffd166'; c.lineWidth = W * 0.07; tracar(); c.stroke();
    c.shadowBlur = 0; c.strokeStyle = '#fff6d8'; c.lineWidth = W * 0.025; tracar(); c.stroke();
    circ(c, cx, cy, W * 0.05, '#fff6d8');
  }
  function turboNeon(c, W, H) {   // portal de setas de neon
    var cx = W / 2;
    c.lineCap = 'round'; c.lineJoin = 'round';
    brilho(c, '#2bf4ff', W * 0.06); c.strokeStyle = '#2bf4ff'; c.lineWidth = W * 0.035;
    c.beginPath(); c.moveTo(W * 0.04, H); c.lineTo(W * 0.04, H * 0.12); c.quadraticCurveTo(W * 0.04, H * 0.02, W * 0.14, H * 0.02); c.lineTo(W * 0.86, H * 0.02); c.quadraticCurveTo(W * 0.96, H * 0.02, W * 0.96, H * 0.12); c.lineTo(W * 0.96, H); c.stroke();
    brilho(c, '#ff2bd6', W * 0.06); c.strokeStyle = '#ff2bd6'; c.lineWidth = W * 0.045;
    [0.32, 0.55, 0.78].forEach(function (y) { c.beginPath(); c.moveTo(cx - W * 0.22, H * (y + 0.12)); c.lineTo(cx, H * (y - 0.06)); c.lineTo(cx + W * 0.22, H * (y + 0.12)); c.stroke(); });
    c.shadowBlur = 0; c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = W * 0.012;
    [0.32, 0.55, 0.78].forEach(function (y) { c.beginPath(); c.moveTo(cx - W * 0.22, H * (y + 0.12)); c.lineTo(cx, H * (y - 0.06)); c.lineTo(cx + W * 0.22, H * (y + 0.12)); c.stroke(); });
  }
  function oleo(c, W, H) {   // mancha de óleo com reflexo de arco-íris
    oval(c, W * 0.5, H * 0.55, W * 0.48, H * 0.42, '#07070c');
    var g = c.createLinearGradient(W * 0.1, 0, W * 0.9, 0);
    g.addColorStop(0, 'rgba(43,244,255,.35)'); g.addColorStop(0.5, 'rgba(255,43,214,.35)'); g.addColorStop(1, 'rgba(198,255,61,.3)');
    c.fillStyle = g; c.beginPath(); c.save(); c.translate(W * 0.48, H * 0.48); c.scale(1, 0.35); c.arc(0, 0, W * 0.3, 0, Math.PI * 2); c.restore(); c.fill();
    oval(c, W * 0.66, H * 0.62, W * 0.12, H * 0.14, 'rgba(255,255,255,.12)');
  }
  // cópia escurecida de um desenho (a paisagem à noite, só as luzes acesas)
  var escuros = {};
  function escurecido(nome, spr, forca) {
    if (escuros[nome]) return escuros[nome];
    var cv = document.createElement('canvas'); cv.width = spr.img.width; cv.height = spr.img.height;
    var c = cv.getContext('2d'); c.drawImage(spr.img, 0, 0);
    c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(6,6,24,' + (forca || 0.62) + ')'; c.fillRect(0, 0, cv.width, cv.height);
    escuros[nome] = { w: spr.w, h: spr.h, img: cv };
    return escuros[nome];
  }

  // ---------- montagem ----------
  var base = null;
  function basicos() {
    if (base) return base;
    var b = {
      coqueiro: fazer(1500, 2700, coqueiro), guardasol: fazer(1400, 1500, guardasol), castelo: fazer(1300, 1000, castelo),
      pinheiro: fazer(1300, 2400, function (c, W, H) { pinheiro(c, W, H, false); }), pinheiroNeve: fazer(1300, 2400, function (c, W, H) { pinheiro(c, W, H, true); }),
      arvore: fazer(1700, 2100, arvore), cogumelo: fazer(800, 800, cogumelo), flor: fazer(500, 800, flor, 120),
      pirulito: fazer(900, 2200, pirulito), bengala: fazer(800, 2000, bengala), cupcake: fazer(1000, 1100, cupcake), algodao: fazer(1000, 1800, algodao),
      boneco: fazer(1000, 1500, boneco), presente: fazer(800, 800, presente, 140),
      poste: fazer(500, 2800, poste, 120),
      cacto: fazer(1000, 2000, cacto, 140), rochedo: fazer(2400, 2200, rochedo, 220), placa: fazer(1100, 1100, placa, 160),
      pilar: fazer(900, 2600, pilar, 140), cabecaPedra: fazer(1400, 1700, cabecaPedra, 180), samambaia: fazer(1400, 1100, samambaia, 160), tocha: fazer(500, 1700, tocha, 100),
      rochaLava: fazer(2000, 1600, rochaLava, 200), pocoLava: fazer(1800, 500, pocoLava, 200), cristal: fazer(1000, 1600, cristal, 140), fumaca: fazer(1100, 2200, fumaca, 140),
      chocolate: fazer(900, 1800, chocolate, 140), pudim: fazer(1400, 1100, pudim, 160), taca: fazer(1100, 1700, tacaSorvete, 150), hamburguer: fazer(1700, 1500, hamburguer, 180),
      batata: fazer(1000, 1400, batata, 140), milkshake: fazer(900, 1700, milkshake, 140),
      arvoreBloco: fazer(1600, 2200, arvoreBloco, 180), blocoGrama: fazer(1500, 1500, blocoGrama, 160), bauBloco: fazer(1100, 1000, bauBloco, 140), blocoOuro: fazer(1000, 1000, blocoOuro, 140),
      arvoreLuz: fazer(1800, 2600, arvoreLuz, 200), cogumeloLuz: fazer(1000, 1100, cogumeloLuz, 140), florLanterna: fazer(700, 1300, florLanterna, 110), ilhaVoando: fazer(2600, 3800, ilhaVoando, 220), predio: fazer(2200, 3800, predio, 220), palmeiraNeon: fazer(1500, 2600, palmeiraNeon),
      estrela: fazer(520, 520, estrela, 128), cone: fazer(420, 560, cone, 100), lama: fazer(1100, 280, lama, 180), turbo: fazer(1250, 640, turbo, 220), rampa: fazer(1100, 520, rampa, 180),
      onibus: fazer(1050, 1250, onibus, 200),
      passaro: fazer(900, 600, passaros, 200), nuvemRaio: fazer(1300, 1100, nuvemRaio, 220), anel: fazer(1300, 1300, anel, 240), corrente: fazer(900, 1300, corrente, 160),
      balao: fazer(1300, 1800, balao, 220), estrelaNeon: fazer(560, 560, estrelaNeon, 128), turboNeon: fazer(1250, 900, turboNeon, 220), oleo: fazer(1100, 280, oleo, 180), nuvemFofa: fazer(3200, 1500, function (c, W, H) { nuvemFofa(c, W, H, false); }, 320), nuvemNoite: fazer(3200, 1500, function (c, W, H) { nuvemFofa(c, W, H, true); }, 320)
    };
    ['#e63946', '#2a9d8f', '#f4a261', '#457b9d', '#8ac926'].forEach(function (cor, k) { b['carro' + k] = fazer(800, 640, function (c, W, H) { carroTras(c, W, H, cor, null, false); }, 180); });
    ['#e63946', '#2a9d8f', '#f4a261', '#457b9d', '#8ac926'].forEach(function (cor, k) { b['aviaoTrafego' + k] = fazer(1300, 650, function (c, W, H) { aviaoTrafego(c, W, H, cor); }, 200); });
    b.fundos = {}; Object.keys(FUNDOS).forEach(function (k) { var cv = document.createElement('canvas'); cv.width = 1024; cv.height = 256; FUNDOS[k](cv.getContext('2d'), 1024, 256); b.fundos[k] = cv; });
    var n = document.createElement('canvas'); n.width = 1024; n.height = 200; nuvens(n.getContext('2d'), 1024, 200); b.nuvens = n;
    var e = document.createElement('canvas'); e.width = 1024; e.height = 300; estrelas(e.getContext('2d'), 1024, 300); b.estrelasCeu = e;
    EMOJIS_BALAO.forEach(function (emo, k) { b['emoji' + k] = fazer(1100, 2400, balaoEmoji(emo), 160); });
    base = b;
    return b;
  }
  // carro (ou moto, avião...) de cada jogador: o desenho vem do veiculos.js; sem ele, o carro clássico
  function carroJogador(cor, emoji, tipo, px, corpo) {   // corpo: 'menina' ou 'menino' (skate)
    var V = raiz.VruuumVeiculos, v = V && V.achar(tipo);
    if (!v) return fazer(800, 640, function (c, W, H) { carroTras(c, W, H, cor, emoji, true); }, px || 256);
    if (!v.quadros) return fazer(v.w, v.h, function (c, W, H) { v.desenhar(c, W, H, cor, emoji); }, px || 256);
    var qs = [];   // animado (skate): um desenho para cada momento do movimento
    for (var k = 0; k < v.quadros; k++) qs.push(fazer(v.w, v.h, (function (f) { return function (c, W, H) { v.desenhar(c, W, H, cor, emoji, f, corpo); }; })(k / v.quadros), px || 256));
    return { w: v.w, h: v.h, img: qs[0].img, quadros: qs };
  }
  // o quadro certo de um desenho animado (fase de 0 a 1); os parados voltam eles mesmos
  function quadro(spr, fase) { return spr.quadros ? spr.quadros[Math.floor((((fase || 0) % 1 + 1) % 1) * spr.quadros.length) % spr.quadros.length] : spr; }
  function arco(texto, cor1, cor2, xadrez) { return fazer(5600, 3400, function (c, W, H) { faixa(c, W, H, texto, cor1, cor2, xadrez); }, 640); }

  raiz.VruuumSprites = { basicos: basicos, carroJogador: carroJogador, quadro: quadro, arco: arco, fazer: fazer, escurecido: escurecido, carroTras: carroTras, ARCO: ARCO, EMOJI: EMOJI, FONTE: FONTE,
    util: { circ: circ, oval: oval, caixa: caixa, poli: poli, linha: linha, sombra: sombra, brilho: brilho } };
})(this);
