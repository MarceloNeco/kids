/* FRUTA PODRE — toda a arte, desenhada em canvas (nada de imagem): estilo desenho animado de sábado de manhã, com
   contorno grosso marrom-escuro e caras exageradas. Feito para este jogo (nada copiado de outro jogo).
   FrutaArte.ceu(ctx, w, h, t, camX) · cenario(ctx, W) (pintado uma vez numa camada guardada) · fruta(ctx, tipo, x, y, r,
   ang, t, humor, op) · praga(ctx, tipo, x, y, r, t, est) · bloco(ctx, tipo, x, y, w, h, ang, dano, semente, estatico) ·
   galao(ctx, x, y, ang, t, aceso) · estilingueTras/Frente(ctx, x, y, bolsa, tensao) · garoto(ctx, quem, x, y, pose, t, alvo)
   · retrato(canvas, id) (figurinhas do menu e do Como jogar). */
(function (raiz) {
  'use strict';
  var OUT = '#2a160b', TAU = Math.PI * 2, CHAO = 600;

  function linha(c, w, cor) { c.lineWidth = w; c.strokeStyle = cor || OUT; c.lineJoin = 'round'; c.lineCap = 'round'; }
  function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); }
  function oval(c, x, y, rx, ry, rot) {
    c.beginPath();
    if (c.ellipse) c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, TAU);
    else { c.save(); c.translate(x, y); c.rotate(rot || 0); c.scale(Math.max(0.1, rx), Math.max(0.1, ry)); c.arc(0, 0, 1, 0, TAU); c.restore(); }
  }
  function rret(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function encher(c, cor, lw) { c.fillStyle = cor; c.fill(); if (lw) { linha(c, lw); c.stroke(); } }
  function aleat(s) { return function () { s = (s * 16807 + 11) % 2147483647; return s / 2147483647; }; }

  /* ---------- olhos e bocas (coordenadas locais, r = raio do personagem) ---------- */
  function olho(c, x, y, rx, ry, px, py, lw, tampa) {
    oval(c, x, y, rx, ry); encher(c, '#fff', lw);
    circ(c, x + px * rx * 0.45, y + py * ry * 0.45, Math.min(rx, ry) * 0.5); c.fillStyle = '#1a0d05'; c.fill();
    circ(c, x + px * rx * 0.45 - rx * 0.18, y + py * ry * 0.45 - ry * 0.2, Math.min(rx, ry) * 0.17); c.fillStyle = '#fff'; c.fill();
    if (tampa) {   // pálpebra caída (sono, malandragem)
      c.save(); oval(c, x, y, rx, ry); c.clip();
      c.fillStyle = tampa; c.fillRect(x - rx - 2, y - ry - 2, rx * 2 + 4, ry * 0.95 + 2);
      c.restore();
      c.beginPath(); c.moveTo(x - rx, y - ry * 0.05); c.lineTo(x + rx, y - ry * 0.05); linha(c, lw); c.stroke();
      oval(c, x, y, rx, ry); linha(c, lw); c.stroke();
    }
  }
  function olhoTonto(c, x, y, s, t, lw) {   // espiral
    c.beginPath();
    for (var i = 0; i < 26; i++) { var a = i * 0.55 + t * 9, rr = s * i / 26; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    oval(c, x, y, s, s); c.fillStyle = '#fff'; c.fill(); linha(c, lw); c.stroke();
    c.beginPath();
    for (var j = 0; j < 26; j++) { var b = j * 0.55 + t * 9, q = s * 0.9 * j / 26; c.lineTo(x + Math.cos(b) * q, y + Math.sin(b) * q); }
    linha(c, lw * 0.7); c.stroke();
  }
  function olhoX(c, x, y, s, lw) { c.beginPath(); c.moveTo(x - s, y - s); c.lineTo(x + s, y + s); c.moveTo(x + s, y - s); c.lineTo(x - s, y + s); linha(c, lw); c.stroke(); }
  function sobrancelha(c, x, y, w, inc, lw) { c.beginPath(); c.moveTo(x - w, y - inc); c.lineTo(x + w, y + inc); linha(c, lw); c.stroke(); }
  // humor: fila (nervosa), mira (brava), voo (gritando), bateu (tonta), feliz
  function rosto(c, r, humor, t, op) {
    op = op || {};
    var lw = Math.max(1.6, r * 0.075), ex = op.ex != null ? op.ex : 0.34, ey = op.ey != null ? op.ey : -0.1, er = op.er || 0.27, my = op.my != null ? op.my : 0.42, dx = op.dx || 0;
    var piscou = humor === 'fila' && ((t + (op.fase || 0)) % 3.7) < 0.12;
    if (humor === 'bateu') { olhoTonto(c, dx - ex * r, ey * r, er * r, t, lw); olhoTonto(c, dx + ex * r, ey * r, er * r, -t, lw); }
    else if (humor === 'feliz') {
      [-1, 1].forEach(function (s) { c.beginPath(); c.arc(dx + s * ex * r, ey * r + er * r * 0.3, er * r * 0.7, Math.PI * 1.1, Math.PI * 1.9); linha(c, lw * 1.2); c.stroke(); });
    } else if (piscou) {
      [-1, 1].forEach(function (s) { c.beginPath(); c.moveTo(dx + s * ex * r - er * r, ey * r); c.lineTo(dx + s * ex * r + er * r, ey * r); linha(c, lw); c.stroke(); });
    } else {
      var grande = humor === 'voo' ? 1.25 : 1, px = humor === 'fila' ? 0.5 : 0.75, py = humor === 'fila' ? -0.7 : humor === 'voo' ? 0 : 0.1;
      olho(c, dx - ex * r, ey * r, er * r * 0.92 * grande, er * r * 1.1 * grande, px, py, lw, op.tampa);
      olho(c, dx + ex * r, ey * r, er * r * 0.92 * grande, er * r * 1.1 * grande, px, py, lw, op.tampa);
      if (humor === 'mira') { sobrancelha(c, dx - ex * r, (ey - er * 1.35) * r, er * r, -er * r * 0.45, lw * 1.3); sobrancelha(c, dx + ex * r, (ey - er * 1.35) * r, er * r, er * r * 0.45, lw * 1.3); }
      if (humor === 'fila') { sobrancelha(c, dx - ex * r, (ey - er * 1.4) * r, er * r * 0.8, er * r * 0.35, lw); sobrancelha(c, dx + ex * r, (ey - er * 1.4) * r, er * r * 0.8, -er * r * 0.35, lw); }
    }
    // boca
    var bx = dx + (op.bx || 0) * r, by = my * r;
    if (humor === 'voo') {
      oval(c, bx, by + r * 0.05, r * 0.2, r * 0.24); encher(c, '#5a1010', lw);
      oval(c, bx, by + r * 0.2, r * 0.11, r * 0.07); c.fillStyle = '#ff7a8a'; c.fill();
    } else if (humor === 'mira') {
      rret(c, bx - r * 0.24, by - r * 0.08, r * 0.48, r * 0.17, r * 0.06); encher(c, '#fff', lw);
      c.beginPath(); c.moveTo(bx - r * 0.24, by); c.lineTo(bx + r * 0.24, by);
      for (var k = -1; k <= 1; k++) { c.moveTo(bx + k * r * 0.08, by - r * 0.08); c.lineTo(bx + k * r * 0.08, by + r * 0.09); }
      linha(c, lw * 0.6); c.stroke();
    } else if (humor === 'feliz') {
      c.beginPath(); c.arc(bx, by - r * 0.08, r * 0.24, 0.15 * Math.PI, 0.85 * Math.PI); c.closePath(); encher(c, '#5a1010', lw);
    } else if (humor === 'bateu') {
      c.beginPath(); c.moveTo(bx - r * 0.22, by);
      for (var w = 1; w <= 6; w++) c.lineTo(bx - r * 0.22 + w * r * 0.074, by + (w % 2 ? -1 : 1) * r * 0.06);
      linha(c, lw); c.stroke();
    } else {   // fila: boquinha preocupada
      c.beginPath(); c.moveTo(bx - r * 0.15, by + r * 0.03); c.quadraticCurveTo(bx - r * 0.05, by - r * 0.07, bx, by + r * 0.01); c.quadraticCurveTo(bx + r * 0.07, by + r * 0.08, bx + r * 0.15, by - r * 0.02);
      linha(c, lw); c.stroke();
    }
  }

  /* ---------- frutas ---------- */
  function sombraLuz(c, r, escuro) {   // dentro de um clip: sombra embaixo à direita e brilho em cima à esquerda
    oval(c, r * 0.45, r * 0.5, r * 1.05, r * 0.95); c.fillStyle = escuro; c.globalAlpha = 0.55; c.fill(); c.globalAlpha = 1;
    oval(c, -r * 0.42, -r * 0.45, r * 0.32, r * 0.2, -0.6); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill();
  }
  function maca(c, r, humor, t, op) {
    var lw = Math.max(2, r * 0.13);
    // cabinho e folha
    c.beginPath(); c.moveTo(0, -r * 0.72); c.quadraticCurveTo(r * 0.05, -r * 1.1, r * 0.22, -r * 1.25); linha(c, lw * 1.5); c.stroke();
    linha(c, lw * 0.6, '#6b4a1e'); c.stroke();
    c.beginPath(); c.moveTo(r * 0.12, -r * 1.02); c.quadraticCurveTo(r * 0.55, -r * 1.35, r * 0.85, -r * 1.05); c.quadraticCurveTo(r * 0.5, -r * 0.82, r * 0.12, -r * 1.02);
    encher(c, '#7cb342', lw * 0.8);
    function corpo() {
      c.beginPath(); c.moveTo(0, -r * 0.74);
      c.bezierCurveTo(r * 0.5, -r * 1.08, r * 1.1, -r * 0.72, r * 1.02, r * 0.05);
      c.bezierCurveTo(r * 0.96, r * 0.76, r * 0.46, r * 1.02, 0, r * 0.92);
      c.bezierCurveTo(-r * 0.46, r * 1.02, -r * 0.96, r * 0.76, -r * 1.02, r * 0.05);
      c.bezierCurveTo(-r * 1.1, -r * 0.72, -r * 0.5, -r * 1.08, 0, -r * 0.74); c.closePath();
    }
    corpo(); c.fillStyle = '#d8342c'; c.fill();
    c.save(); corpo(); c.clip();
    sombraLuz(c, r, '#8f1d17');
    // manchas de podre
    oval(c, r * 0.5, r * 0.32, r * 0.34, r * 0.27, 0.4); c.fillStyle = '#8b5a2b'; c.fill();
    oval(c, -r * 0.42, r * 0.62, r * 0.25, r * 0.17, -0.3); c.fill();
    c.fillStyle = '#5e3a18'; circ(c, r * 0.56, r * 0.3, r * 0.08); c.fill(); circ(c, r * 0.36, r * 0.4, r * 0.05); c.fill(); circ(c, -r * 0.38, r * 0.6, r * 0.06); c.fill();
    // a mordida (polpa à mostra)
    circ(c, r * 1.08, -r * 0.3, r * 0.42); c.fillStyle = '#f8e7b5'; c.fill(); linha(c, lw * 0.8); c.stroke();
    c.fillStyle = '#5e3a18'; oval(c, r * 0.78, -r * 0.4, r * 0.05, r * 0.09, 0.3); c.fill(); oval(c, r * 0.8, -r * 0.18, r * 0.05, r * 0.09, -0.2); c.fill();
    c.restore();
    corpo(); linha(c, lw); c.stroke();
    // buraco do verme com o vermezinho de capacete
    var hx = -r * 0.72, hy = -r * 0.12, w = Math.sin(t * 5) * 0.12;
    oval(c, hx, hy, r * 0.2, r * 0.16); encher(c, '#3b1d0c', lw * 0.6);
    c.save(); c.translate(hx - r * 0.06, hy - r * 0.08); c.rotate(-0.5 + w);
    rret(c, -r * 0.13, -r * 0.42, r * 0.26, r * 0.45, r * 0.13); encher(c, '#ff9bb3', lw * 0.6);
    c.beginPath(); c.moveTo(-r * 0.12, -r * 0.12); c.lineTo(r * 0.12, -r * 0.12); linha(c, lw * 0.4, '#c25a78'); c.stroke();
    circ(c, -r * 0.045, -r * 0.3, r * 0.05); encher(c, '#fff'); circ(c, -r * 0.045, -r * 0.3, r * 0.025); encher(c, '#111');
    circ(c, r * 0.06, -r * 0.3, r * 0.05); encher(c, '#fff'); circ(c, r * 0.06, -r * 0.3, r * 0.025); encher(c, '#111');
    if (humor === 'voo' || op.grito) { oval(c, r * 0.01, -r * 0.2, r * 0.05, r * 0.06); encher(c, '#5a1010'); }
    // capacete amarelo de obra
    c.beginPath(); c.arc(0, -r * 0.38, r * 0.17, Math.PI, 0); c.closePath(); encher(c, '#ffcf2e', lw * 0.55);
    c.beginPath(); c.moveTo(-r * 0.22, -r * 0.37); c.lineTo(r * 0.22, -r * 0.37); linha(c, lw * 0.9); c.stroke(); linha(c, lw * 0.45, '#ffcf2e'); c.stroke();
    c.restore();
    rosto(c, r, humor, t, { dx: r * 0.0, ex: 0.3, ey: -0.12, er: 0.25, my: 0.45, bx: 0.02, fase: op.fase });
  }
  function uvaBola(c, x, y, r, humor, t, fase, lw, rostoSim) {
    circ(c, x, y, r); c.fillStyle = '#7b3aa6'; c.fill();
    c.save(); circ(c, x, y, r); c.clip();
    circ(c, x + r * 0.35, y + r * 0.4, r * 0.95); c.fillStyle = '#4e1f6e'; c.globalAlpha = 0.5; c.fill(); c.globalAlpha = 1;
    oval(c, x - r * 0.4, y - r * 0.42, r * 0.28, r * 0.17, -0.6); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill();
    c.beginPath(); c.arc(x + r * 0.15, y + r * 0.62, r * 0.45, 3.6, 5.2); c.moveTo(x - r * 0.75, y + r * 0.1); c.arc(x - r * 0.4, y + r * 0.35, r * 0.4, 3.4, 4.6);
    c.moveTo(x + r * 0.5, y - r * 0.6); c.arc(x + r * 0.95, y - r * 0.2, r * 0.5, 3.5, 4.5);
    linha(c, lw * 0.55, '#3d1257'); c.stroke();
    c.restore();
    circ(c, x, y, r); linha(c, lw); c.stroke();
    if (rostoSim) { c.save(); c.translate(x, y); rosto(c, r, humor, t, { ex: 0.36, er: 0.28, ey: -0.12, my: 0.45, fase: fase }); c.restore(); }
  }
  function uva(c, r, humor, t, op) {
    var lw = Math.max(2, r * 0.12);
    if (op.uma) { uvaBola(c, 0, 0, r, humor, t, op.fase, lw, true); return; }
    var b = r * 0.6;
    c.beginPath(); c.moveTo(0, -r * 0.62); c.quadraticCurveTo(r * 0.1, -r * 1.05, -r * 0.2, -r * 1.25); linha(c, lw * 1.6); c.stroke(); linha(c, lw * 0.7, '#8a6a3a'); c.stroke();
    uvaBola(c, 0, -r * 0.38, b, humor, t, (op.fase || 0) + 1, lw, true);
    uvaBola(c, -r * 0.44, r * 0.3, b, humor, t, (op.fase || 0) + 2, lw, true);
    uvaBola(c, r * 0.44, r * 0.3, b, humor, t, op.fase, lw, true);
  }
  function pimenta(c, r, humor, t, op) {
    var lw = Math.max(2, r * 0.13);
    if (op.jato) {   // jato de fogo atrás
      for (var i = 0; i < 3; i++) {
        var f = (t * 14 + i * 0.33) % 1, l = r * (1.4 + i * 0.5) * (0.8 + f * 0.4);
        c.beginPath(); c.moveTo(-r * 1.0, -r * 0.35); c.quadraticCurveTo(-r * 1.0 - l * 0.6, -r * 0.6 * (1 - f), -r * 1.0 - l, 0); c.quadraticCurveTo(-r * 1.0 - l * 0.6, r * 0.6 * (1 - f), -r * 1.0, r * 0.35);
        c.fillStyle = ['#ff3d00', '#ff9100', '#ffe04a'][i]; c.fill();
      }
    }
    function corpo() {
      c.beginPath(); c.moveTo(-r * 0.85, -r * 0.62);
      c.bezierCurveTo(r * 0.2, -r * 0.78, r * 1.05, -r * 0.45, r * 1.55, r * 0.28);
      c.bezierCurveTo(r * 0.95, r * 0.2, r * 0.15, r * 0.78, -r * 0.85, r * 0.62);
      c.bezierCurveTo(-r * 1.18, r * 0.42, -r * 1.18, -r * 0.42, -r * 0.85, -r * 0.62); c.closePath();
    }
    corpo(); c.fillStyle = '#e2261c'; c.fill();
    c.save(); corpo(); c.clip();
    oval(c, r * 0.2, r * 0.55, r * 1.4, r * 0.45); c.fillStyle = '#9c1209'; c.globalAlpha = 0.5; c.fill(); c.globalAlpha = 1;
    c.beginPath(); c.moveTo(-r * 0.55, -r * 0.42); c.quadraticCurveTo(r * 0.3, -r * 0.58, r * 0.95, -r * 0.18); linha(c, r * 0.13, 'rgba(255,255,255,.55)'); c.stroke();
    c.restore();
    corpo(); linha(c, lw); c.stroke();
    // cabinho verde
    c.beginPath(); c.moveTo(-r * 0.8, -r * 0.55);
    for (var k = 0; k <= 4; k++) { var a = -1.25 + k * 0.62; c.lineTo(-r * 0.95 + Math.cos(a) * r * 0.28, Math.sin(a) * r * 0.62); c.lineTo(-r * 0.78 + Math.cos(a + 0.3) * r * 0.08, Math.sin(a + 0.3) * r * 0.42); }
    c.closePath(); encher(c, '#3fa34d', lw * 0.8);
    c.beginPath(); c.moveTo(-r * 1.1, 0); c.quadraticCurveTo(-r * 1.4, -r * 0.1, -r * 1.45, -r * 0.45); linha(c, lw * 1.5); c.stroke(); linha(c, lw * 0.6, '#3fa34d'); c.stroke();
    // fumaça saindo pelas "orelhas"
    for (var j = 0; j < 2; j++) {
      var u = (t * 1.3 + j * 0.5) % 1;
      circ(c, -r * 0.35 - u * r * 0.4, -r * 0.75 - u * r * 1.1, r * (0.12 + u * 0.22)); c.fillStyle = 'rgba(220,220,220,' + (0.8 - u * 0.75) + ')'; c.fill();
      circ(c, -r * 0.1 + u * r * 0.2, r * 0.75 + u * r * 0.9, r * (0.1 + u * 0.18)); c.fill();
    }
    rosto(c, r, humor === 'fila' ? 'voo' : humor, t, { dx: -r * 0.12, ex: 0.27, ey: -0.14, er: 0.27, my: 0.32, fase: op.fase });
  }
  function melancia(c, r, humor, t, op) {
    var lw = Math.max(2, r * 0.1);
    function corpo() { oval(c, 0, 0, r * 1.08, r * 0.96); }
    corpo(); c.fillStyle = '#74c94e'; c.fill();
    c.save(); corpo(); c.clip();
    c.fillStyle = '#2f7a2b';
    for (var i = -3; i <= 3; i++) {
      c.beginPath(); var x0 = i * r * 0.33;
      c.moveTo(x0 - r * 0.07, -r);
      for (var y = -r; y <= r; y += r * 0.2) c.lineTo(x0 + Math.sin(y / r * 6 + i) * r * 0.06 - r * 0.07 + (y / r) * i * r * 0.08, y);
      for (var y2 = r; y2 >= -r; y2 -= r * 0.2) c.lineTo(x0 + Math.sin(y2 / r * 6 + i) * r * 0.06 + r * 0.07 + (y2 / r) * i * r * 0.08, y2);
      c.fill();
    }
    oval(c, r * 0.45, r * 0.5, r * 1.1, r * 0.95); c.fillStyle = '#1d4d1a'; c.globalAlpha = 0.4; c.fill(); c.globalAlpha = 1;
    oval(c, -r * 0.5, -r * 0.5, r * 0.32, r * 0.18, -0.6); c.fillStyle = 'rgba(255,255,255,.45)'; c.fill();
    // rachadura com a polpa vermelha
    c.beginPath(); c.moveTo(r * 0.15, -r * 1); c.lineTo(r * 0.35, -r * 0.62); c.lineTo(r * 0.2, -r * 0.42); c.lineTo(r * 0.5, -r * 0.18); c.lineTo(r * 0.7, -r * 0.35); c.lineTo(r * 0.62, -r * 0.62); c.lineTo(r * 0.75, -r * 1); c.closePath();
    encher(c, '#ff4d6d', lw * 0.8);
    c.fillStyle = '#1a0d05'; oval(c, r * 0.42, -r * 0.6, r * 0.03, r * 0.06, 0.4); c.fill(); oval(c, r * 0.56, -r * 0.42, r * 0.03, r * 0.06, -0.3); c.fill(); oval(c, r * 0.6, -r * 0.75, r * 0.03, r * 0.06); c.fill();
    c.restore();
    corpo(); linha(c, lw); c.stroke();
    // caldo escorrendo
    var g = (t * 0.6) % 1;
    c.beginPath(); c.moveTo(r * 0.55, -r * 0.25); c.quadraticCurveTo(r * 0.6, r * 0.1, r * 0.58, r * 0.25 + g * r * 0.2); linha(c, r * 0.1, '#ff6d86'); c.stroke();
    circ(c, r * 0.58, r * 0.3 + g * r * 0.25, r * 0.07); c.fillStyle = '#ff6d86'; c.fill();
    rosto(c, r, humor, t, { dx: -r * 0.18, ex: 0.3, ey: -0.05, er: 0.24, my: 0.42, tampa: humor === 'fila' ? '#5fae3f' : null, fase: op.fase });
  }
  function abacaxi(c, r, humor, t, op) {
    var lw = Math.max(2, r * 0.12);
    // coroa (o do meio é o pavio)
    var folhas = [[-0.55, 0.55], [-0.28, 0.75], [0.28, 0.75], [0.55, 0.55]];
    folhas.forEach(function (f) {
      c.beginPath(); c.moveTo(f[0] * r * 0.6 - r * 0.12, -r * 0.82); c.quadraticCurveTo(f[0] * r * 1.2, -r * (0.95 + f[1] * 0.6), f[0] * r * 1.35, -r * (1.05 + f[1] * 0.8)); c.quadraticCurveTo(f[0] * r * 0.7, -r * 1.05, f[0] * r * 0.6 + r * 0.12, -r * 0.82);
      encher(c, '#3f9a3a', lw * 0.8);
    });
    c.beginPath(); c.moveTo(-r * 0.12, -r * 0.85); c.quadraticCurveTo(r * 0.05, -r * 1.4, r * 0.15, -r * 1.8); c.quadraticCurveTo(r * 0.12, -r * 1.3, r * 0.14, -r * 0.85); encher(c, '#57b84a', lw * 0.8);
    if (op.aceso) {   // faísca na ponta do pavio
      var s = r * (0.22 + 0.08 * Math.sin(t * 30));
      c.save(); c.translate(r * 0.15, -r * 1.85); c.rotate(t * 8);
      c.beginPath(); for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4, q = k % 2 ? s * 0.45 : s; c.lineTo(Math.cos(a) * q, Math.sin(a) * q); } c.closePath();
      c.fillStyle = '#ffe04a'; c.fill(); linha(c, lw * 0.4, '#ff6d00'); c.stroke();
      c.restore();
    }
    function corpo() { oval(c, 0, r * 0.05, r * 0.86, r * 0.98); }
    corpo(); c.fillStyle = '#f5b83d'; c.fill();
    c.save(); corpo(); c.clip();
    linha(c, lw * 0.5, '#b86f0e');
    c.beginPath();
    for (var i = -6; i <= 6; i++) { c.moveTo(i * r * 0.3 - r, -r); c.lineTo(i * r * 0.3 + r, r * 1.1); c.moveTo(i * r * 0.3 + r, -r); c.lineTo(i * r * 0.3 - r, r * 1.1); }
    c.stroke();
    oval(c, r * 0.4, r * 0.5, r * 0.95, r * 0.95); c.fillStyle = '#b5650a'; c.globalAlpha = 0.4; c.fill(); c.globalAlpha = 1;
    oval(c, -r * 0.4, -r * 0.45, r * 0.25, r * 0.15, -0.6); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill();
    c.restore();
    corpo(); linha(c, lw); c.stroke();
    // bochechas cheias de gás e bolhas
    oval(c, -r * 0.48, r * 0.3, r * 0.17, r * 0.12); c.fillStyle = 'rgba(255,110,90,.6)'; c.fill();
    oval(c, r * 0.48, r * 0.3, r * 0.17, r * 0.12); c.fill();
    for (var j = 0; j < 3; j++) {
      var u = (t * 0.9 + j * 0.33) % 1;
      circ(c, -r * 0.6 + j * r * 0.55, -r * 0.6 - u * r * 0.9, r * (0.07 + u * 0.06)); c.fillStyle = 'rgba(230,255,180,' + (0.9 - u * 0.8) + ')'; c.fill(); linha(c, 1, 'rgba(90,120,40,' + (0.8 - u * 0.7) + ')'); c.stroke();
    }
    rosto(c, r, humor === 'fila' ? 'mira' : humor, t, { ex: 0.3, ey: -0.12, er: 0.24, my: 0.44, fase: op.fase });
  }
  var FRUTA = { maca_podre: maca, trio_uva: uva, pimenta_jato: pimenta, melancia_passada: melancia, abacaxi_azedo: abacaxi };
  function fruta(c, tipo, x, y, r, ang, t, humor, op) {
    c.save(); c.translate(x, y); if (ang) c.rotate(ang);
    if (op && op.amassa) c.scale(1 + op.amassa, 1 - op.amassa);
    FRUTA[tipo](c, r, humor || 'fila', t, op || {});
    c.restore();
  }
  // moscas zonzas voando em volta da fruta podre
  function moscasZonzas(c, x, y, r, t, n) {
    for (var i = 0; i < (n || 2); i++) {
      var a = t * (2.2 + i * 0.7) + i * 2.1, px = x + Math.cos(a) * r * 1.5, py = y - r * 0.9 + Math.sin(a * 1.7) * r * 0.5;
      oval(c, px - 2, py - 3, 3, 2, -0.5); c.fillStyle = 'rgba(200,235,255,.8)'; c.fill();
      oval(c, px + 2, py - 3, 3, 2, 0.5); c.fill();
      circ(c, px, py, 2.4); c.fillStyle = '#222'; c.fill();
    }
    c.beginPath(); c.arc(x - r * 0.2, y - r * 1.25, r * 0.25, 0.5, 2.6); c.moveTo(x + r * 0.35, y - r * 1.15); c.arc(x + r * 0.2, y - r * 1.4, r * 0.18, 0.4, 2.7);
    linha(c, 1.4, 'rgba(110,140,60,.6)'); c.stroke();
  }

  /* ---------- pragas (olham para a esquerda, para o estilingue) ---------- */
  function estrelinhas(c, x, y, r, t) {
    for (var i = 0; i < 3; i++) {
      var a = t * 5 + i * TAU / 3, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.35;
      c.save(); c.translate(px, py); c.rotate(t * 4 + i);
      c.beginPath(); for (var k = 0; k < 10; k++) { var b = -Math.PI / 2 + k * Math.PI / 5, q = k % 2 ? 2.6 : 6.2; c.lineTo(Math.cos(b) * q, Math.sin(b) * q); } c.closePath();
      encher(c, '#ffe04a', 1.6); c.restore();
    }
  }
  function mosca(c, r, t, est) {
    var lw = Math.max(1.8, r * 0.13), bate = est.ko ? 0.3 : Math.abs(Math.sin(t * 38));
    // asas
    c.globalAlpha = 0.75;
    oval(c, r * 0.25, -r * 0.75, r * 0.55, r * 0.32 * (0.4 + bate * 0.6), -0.5); encher(c, '#cdeeff', lw * 0.6);
    oval(c, r * 0.7, -r * 0.6, r * 0.5, r * 0.3 * (0.4 + bate * 0.6), 0.4); encher(c, '#cdeeff', lw * 0.6);
    c.globalAlpha = 1;
    // perninhas
    c.beginPath(); for (var i = 0; i < 3; i++) { c.moveTo(-r * 0.2 + i * r * 0.35, r * 0.45); c.lineTo(-r * 0.35 + i * r * 0.4, r * 0.95); } linha(c, lw * 0.8); c.stroke();
    // corpo listrado
    oval(c, r * 0.35, r * 0.1, r * 0.7, r * 0.52); c.fillStyle = '#4b5a4b'; c.fill();
    c.save(); oval(c, r * 0.35, r * 0.1, r * 0.7, r * 0.52); c.clip();
    c.fillStyle = '#2b352b'; c.fillRect(r * 0.3, -r, r * 0.16, r * 2); c.fillRect(r * 0.62, -r, r * 0.16, r * 2);
    c.restore();
    oval(c, r * 0.35, r * 0.1, r * 0.7, r * 0.52); linha(c, lw); c.stroke();
    // cabeça com olhões vermelhos
    circ(c, -r * 0.35, -r * 0.05, r * 0.55); encher(c, '#3c4a3e', lw);
    if (est.ko) { olhoTonto(c, -r * 0.62, -r * 0.2, r * 0.3, t, lw * 0.7); olhoTonto(c, -r * 0.12, -r * 0.25, r * 0.3, -t, lw * 0.7); }
    else {
      oval(c, -r * 0.62, -r * 0.2, r * 0.32, r * 0.38); encher(c, '#e53935', lw * 0.8);
      oval(c, -r * 0.12, -r * 0.25, r * 0.32, r * 0.38); encher(c, '#e53935', lw * 0.8);
      circ(c, -r * 0.7, -r * 0.32, r * 0.1); c.fillStyle = '#fff'; c.fill(); circ(c, -r * 0.2, -r * 0.37, r * 0.1); c.fill();
      c.fillStyle = 'rgba(0,0,0,.25)'; circ(c, -r * 0.55, -r * 0.1, r * 0.06); c.fill(); circ(c, -r * 0.05, -r * 0.15, r * 0.06); c.fill();
    }
    // tromba e sorrisinho
    c.beginPath(); c.moveTo(-r * 0.6, r * 0.3); c.quadraticCurveTo(-r * 0.85, r * 0.55, -r * 0.75, r * 0.7); linha(c, lw * 0.9); c.stroke();
    c.beginPath(); c.arc(-r * 0.32, r * 0.22, r * 0.14, 0.2, 2.6); linha(c, lw * 0.6); c.stroke();
  }
  function barata(c, r, t, est) {
    var lw = Math.max(2, r * 0.12), w = Math.sin(t * 3) * 0.15;
    // antenas
    c.beginPath(); c.moveTo(-r * 0.75, -r * 0.35); c.quadraticCurveTo(-r * 1.3, -r * (1.3 + w), -r * 0.6, -r * (1.7 - w));
    c.moveTo(-r * 0.55, -r * 0.45); c.quadraticCurveTo(-r * 0.7, -r * (1.6 - w), r * 0.1, -r * (1.75 + w)); linha(c, lw * 0.8); c.stroke();
    // perninhas
    c.beginPath();
    for (var i = 0; i < 3; i++) { var x = -r * 0.45 + i * r * 0.5; c.moveTo(x, r * 0.3); c.lineTo(x - r * 0.25, r * 0.75); c.lineTo(x - r * 0.05, r * 0.98); }
    linha(c, lw * 0.9); c.stroke();
    // casco
    function casco() { oval(c, r * 0.15, 0, r * 0.95, r * 0.7); }
    casco(); c.fillStyle = '#7a3e17'; c.fill();
    c.save(); casco(); c.clip();
    oval(c, r * 0.5, r * 0.45, r * 1.0, r * 0.6); c.fillStyle = '#4a2108'; c.globalAlpha = 0.5; c.fill(); c.globalAlpha = 1;
    oval(c, -r * 0.05, -r * 0.35, r * 0.45, r * 0.16, -0.25); c.fillStyle = 'rgba(255,200,140,.6)'; c.fill();
    c.beginPath(); c.moveTo(r * 0.15, -r * 0.7); c.lineTo(r * 0.2, r * 0.7); linha(c, lw * 0.6, '#3a1806'); c.stroke();
    c.restore();
    casco(); linha(c, lw); c.stroke();
    // cabeça
    oval(c, -r * 0.62, -r * 0.05, r * 0.42, r * 0.38); encher(c, '#5a2a0c', lw);
    var h = est.ko ? 'bateu' : est.ai ? 'bateu' : 'mira';
    c.save(); c.translate(-r * 0.68, -r * 0.08);
    if (h === 'bateu') { olhoTonto(c, -r * 0.16, -r * 0.08, r * 0.15, t, lw * 0.5); olhoTonto(c, r * 0.14, -r * 0.1, r * 0.15, -t, lw * 0.5); }
    else { olho(c, -r * 0.16, -r * 0.08, r * 0.14, r * 0.17, -0.8, 0, lw * 0.6, '#5a2a0c'); olho(c, r * 0.14, -r * 0.1, r * 0.14, r * 0.17, -0.8, 0, lw * 0.6, '#5a2a0c'); }
    c.beginPath(); c.moveTo(-r * 0.2, r * 0.16); c.quadraticCurveTo(-r * 0.05, r * 0.28, r * 0.12, r * 0.12); linha(c, lw * 0.6); c.stroke();
    c.restore();
  }
  function rato(c, r, t, est) {
    var lw = Math.max(2, r * 0.11), bal = Math.sin(t * 2.5) * 0.15;
    // rabo
    c.beginPath(); c.moveTo(r * 0.8, r * 0.4); c.bezierCurveTo(r * 1.6, r * 0.5, r * 1.3, -r * (0.6 + bal), r * 1.8, -r * (0.4 - bal)); linha(c, lw * 1.6); c.stroke(); linha(c, lw * 0.7, '#f4a7b9'); c.stroke();
    // orelhas
    [[-0.55, -0.82], [0.25, -0.88]].forEach(function (o) { circ(c, o[0] * r, o[1] * r, r * 0.36); encher(c, '#9aa0a6', lw); circ(c, o[0] * r, o[1] * r, r * 0.2); c.fillStyle = '#f4a7b9'; c.fill(); });
    // corpo e barriga
    oval(c, 0, 0, r, r * 0.92); c.fillStyle = '#9aa0a6'; c.fill();
    c.save(); oval(c, 0, 0, r, r * 0.92); c.clip();
    oval(c, r * 0.45, r * 0.5, r, r * 0.8); c.fillStyle = '#5f646a'; c.globalAlpha = 0.45; c.fill(); c.globalAlpha = 1;
    oval(c, -r * 0.1, r * 0.55, r * 0.5, r * 0.4); c.fillStyle = '#d6d8db'; c.fill();
    c.restore();
    oval(c, 0, 0, r, r * 0.92); linha(c, lw); c.stroke();
    // máscara de ladrão
    rret(c, -r * 0.92, -r * 0.42, r * 1.25, r * 0.36, r * 0.16); c.fillStyle = '#1d1d22'; c.fill();
    c.beginPath(); c.moveTo(r * 0.3, -r * 0.3); c.lineTo(r * 0.6, -r * 0.42); c.moveTo(r * 0.3, -r * 0.18); c.lineTo(r * 0.62, -r * 0.12); linha(c, lw * 0.9, '#1d1d22'); c.stroke();
    if (est.ko || est.ai) { olhoTonto(c, -r * 0.55, -r * 0.25, r * 0.15, t, lw * 0.5); olhoTonto(c, -r * 0.12, -r * 0.25, r * 0.15, -t, lw * 0.5); }
    else { olho(c, -r * 0.55, -r * 0.25, r * 0.15, r * 0.14, -0.9, 0, lw * 0.5); olho(c, -r * 0.12, -r * 0.25, r * 0.15, r * 0.14, -0.9, 0, lw * 0.5); }
    // focinho, bigode e dentões
    circ(c, -r * 0.95, r * 0.05, r * 0.13); encher(c, '#ff7f9e', lw * 0.6);
    c.beginPath(); c.moveTo(-r * 0.8, r * 0.1); c.lineTo(-r * 1.3, -r * 0.05); c.moveTo(-r * 0.8, r * 0.16); c.lineTo(-r * 1.32, r * 0.2); c.moveTo(-r * 0.2, r * 0.1); c.lineTo(r * 0.25, 0); linha(c, lw * 0.4); c.stroke();
    rret(c, -r * 0.72, r * 0.2, r * 0.22, r * 0.2, 2); encher(c, '#fff', lw * 0.5);
    c.beginPath(); c.moveTo(-r * 0.61, r * 0.2); c.lineTo(-r * 0.61, r * 0.4); linha(c, lw * 0.4); c.stroke();
    if (est.capacete) {   // capacete de tampinha de garrafa
      c.save(); c.translate(-r * 0.1, -r * 0.72); c.rotate(-0.12);
      c.beginPath(); c.arc(0, 0, r * 0.55, Math.PI, 0);
      for (var k = 0; k <= 12; k++) c.lineTo(r * 0.55 - k * r * 1.1 / 12, (k % 2 ? r * 0.16 : r * 0.04));
      c.closePath(); encher(c, '#d7262e', lw);
      c.beginPath(); c.arc(0, 0, r * 0.4, Math.PI * 1.15, Math.PI * 1.55); linha(c, lw * 0.7, 'rgba(255,255,255,.7)'); c.stroke();
      c.beginPath(); for (var s = 0; s < 10; s++) { var b = -Math.PI / 2 + s * Math.PI / 5, q = s % 2 ? r * 0.08 : r * 0.18; c.lineTo(Math.cos(b) * q, Math.sin(b) * q - r * 0.22); } c.closePath();
      c.fillStyle = '#fff'; c.fill();
      c.restore();
    } else if (est.semCapacete) {   // galo com curativo
      oval(c, -r * 0.15, -r * 0.88, r * 0.22, r * 0.16); encher(c, '#c0868f', lw * 0.6);
      c.save(); c.translate(-r * 0.15, -r * 0.92); c.rotate(0.6); rret(c, -r * 0.25, -r * 0.07, r * 0.5, r * 0.14, 2); encher(c, '#f6d7a7', lw * 0.5); c.restore();
    }
  }
  var PRAGA = { mosca_zumbidora: mosca, barata_cascuda: barata, rato_ladrao: rato };
  function praga(c, tipo, x, y, r, t, est) {
    est = est || {};
    c.save(); c.translate(x, y);
    if (est.ko) c.rotate(Math.sin(t * 8) * 0.25);
    if (est.ang) c.rotate(est.ang);
    var ag = est.ko ? 0 : Math.sin(t * 3 + (est.fase || 0)) * 0.04;
    c.scale(1 + ag, 1 - ag);
    PRAGA[tipo](c, r, t, est);
    c.restore();
    if (est.ko) estrelinhas(c, x, y - r * 1.25, r * 1.05, t);
  }

  /* ---------- blocos ---------- */
  function racha(c, w, h, dano, semente, cor, lw) {
    if (dano < 0.3) return;
    var rn = aleat(semente + 3), n = dano > 0.65 ? 3 : 1;
    c.beginPath();
    for (var i = 0; i < n; i++) {
      var x = (rn() - 0.5) * w * 0.8, y = (rn() < 0.5 ? -1 : 1) * h / 2;
      c.moveTo(x, y);
      for (var k = 0; k < 4; k++) { x += (rn() - 0.5) * w * 0.35; y *= 0.55; y += (rn() - 0.5) * h * 0.2; c.lineTo(x, y); }
    }
    linha(c, lw, cor); c.stroke();
  }
  function madeira(c, w, h, dano, semente, escura) {
    var lw = 3, x = -w / 2, y = -h / 2, deitada = w >= h;
    rret(c, x, y, w, h, 3); c.fillStyle = escura ? '#9c6233' : '#d6955a'; c.fill();
    c.save(); rret(c, x, y, w, h, 3); c.clip();
    c.fillStyle = escura ? '#b47640' : '#eab27a';
    if (deitada) c.fillRect(x, y, w, Math.max(3, h * 0.22)); else c.fillRect(x, y, Math.max(3, w * 0.22), h);
    c.fillStyle = 'rgba(80,40,10,.25)';
    if (deitada) c.fillRect(x, y + h * 0.78, w, h * 0.22); else c.fillRect(x + w * 0.78, y, w * 0.22, h);
    var rn = aleat(semente + 1);
    c.beginPath();
    for (var i = 0; i < 2; i++) {
      var f = 0.35 + i * 0.3;
      if (deitada) { c.moveTo(x + 4, y + h * f); for (var k = 1; k <= 6; k++) c.lineTo(x + w * k / 6, y + h * f + (rn() - 0.5) * h * 0.18); }
      else { c.moveTo(x + w * f, y + 4); for (var j = 1; j <= 6; j++) c.lineTo(x + w * f + (rn() - 0.5) * w * 0.18, y + h * j / 6); }
    }
    linha(c, 1.5, escura ? '#6e3f1a' : '#a8652d'); c.stroke();
    if (Math.max(w, h) > 60) { oval(c, deitada ? x + w * (0.3 + rn() * 0.4) : 0, deitada ? 0 : y + h * (0.3 + rn() * 0.4), 3, 2); c.fillStyle = '#8a4e20'; c.fill(); }
    c.restore();
    // pregos nas pontas
    c.fillStyle = '#4a4a4a';
    if (deitada) { circ(c, x + 6, 0, 1.8); c.fill(); circ(c, x + w - 6, 0, 1.8); c.fill(); }
    else { circ(c, 0, y + 6, 1.8); c.fill(); circ(c, 0, y + h - 6, 1.8); c.fill(); }
    racha(c, w, h, dano, semente, '#4a2508', 2);
    rret(c, x, y, w, h, 3); linha(c, lw); c.stroke();
  }
  function caixote(c, w, h, dano, semente) {
    var x = -w / 2, y = -h / 2, b = Math.min(w, h) * 0.16;
    rret(c, x, y, w, h, 3); c.fillStyle = '#c98546'; c.fill();
    c.fillStyle = '#9a5d2a'; c.fillRect(x + b, y + b, w - b * 2, h - b * 2);
    c.fillStyle = '#b2723a'; c.fillRect(x + b, y + h * 0.45, w - b * 2, h * 0.1);
    c.save(); c.beginPath(); c.rect(x + b, y + b, w - b * 2, h - b * 2); c.clip();
    c.beginPath(); c.moveTo(x + b, y + h - b); c.lineTo(x + w - b, y + b); linha(c, b * 1.2, '#e3a565'); c.stroke();
    c.beginPath(); c.moveTo(x + b, y + h - b); c.lineTo(x + w - b, y + b); linha(c, 1.2, '#7a4518'); c.stroke();
    c.restore();
    c.strokeStyle = OUT; c.lineWidth = 2; c.strokeRect(x + b, y + b, w - b * 2, h - b * 2);
    c.fillStyle = '#4a4a4a'; [[x + b / 2, y + b / 2], [x + w - b / 2, y + b / 2], [x + b / 2, y + h - b / 2], [x + w - b / 2, y + h - b / 2]].forEach(function (p) { circ(c, p[0], p[1], 1.8); c.fill(); });
    racha(c, w, h, dano, semente, '#4a2508', 2);
    rret(c, x, y, w, h, 3); linha(c, 3); c.stroke();
  }
  function vidro(c, w, h, dano, semente, pote) {
    var x = -w / 2, y = -h / 2;
    if (pote) {
      rret(c, x, y + 6, w, h - 6, 7); c.fillStyle = 'rgba(185,238,255,.55)'; c.fill();
      // conserva lá dentro (azeitonas)
      c.save(); rret(c, x, y + 6, w, h - 6, 7); c.clip();
      c.fillStyle = 'rgba(160,200,90,.55)'; c.fillRect(x, y + h * 0.45, w, h);
      c.fillStyle = '#6b8e23'; oval(c, x + w * 0.3, y + h * 0.78, w * 0.13, h * 0.09); c.fill(); oval(c, x + w * 0.65, y + h * 0.72, w * 0.13, h * 0.09, 0.4); c.fill(); oval(c, x + w * 0.5, y + h * 0.9, w * 0.13, h * 0.09); c.fill();
      c.restore();
      rret(c, x + 3, y + 10, w * 0.16, h - 22, 3); c.fillStyle = 'rgba(255,255,255,.75)'; c.fill();
      racha(c, w, h, dano, semente, '#fff', 1.8);
      rret(c, x, y + 6, w, h - 6, 7); linha(c, 3, '#24566e'); c.stroke();
      rret(c, x + 2, y, w - 4, 9, 2); encher(c, '#e8b938', 2.5);
      c.beginPath(); c.moveTo(x + 6, y + 3); c.lineTo(x + w - 6, y + 3); linha(c, 1.2, '#fff3b0'); c.stroke();
    } else {
      rret(c, x, y, w, h, 2); c.fillStyle = 'rgba(185,238,255,.6)'; c.fill();
      c.save(); rret(c, x, y, w, h, 2); c.clip();
      c.beginPath(); var deitada = w >= h;
      for (var i = 0; i < 2; i++) { var p = 0.2 + i * 0.35; if (deitada) { c.moveTo(x + w * p, y + h); c.lineTo(x + w * p + h, y); } else { c.moveTo(x, y + h * p + w); c.lineTo(x + w, y + h * p); } }
      linha(c, 3, 'rgba(255,255,255,.85)'); c.stroke();
      c.restore();
      racha(c, w, h, dano, semente, '#fff', 1.8);
      rret(c, x, y, w, h, 2); linha(c, 3, '#24566e'); c.stroke();
    }
  }
  function pedra(c, w, h, dano, semente) {
    var x = -w / 2, y = -h / 2;
    rret(c, x, y, w, h, 4); c.fillStyle = '#aaa59c'; c.fill();
    c.save(); rret(c, x, y, w, h, 4); c.clip();
    c.fillStyle = '#c9c4ba'; c.fillRect(x, y, w, Math.max(3, h * 0.18));
    c.fillStyle = '#7f7a71'; c.fillRect(x, y + h * 0.84, w, h * 0.16);
    var rn = aleat(semente + 5); c.fillStyle = '#8c877e';
    for (var i = 0; i < w * h / 160; i++) { circ(c, x + rn() * w, y + rn() * h, 1 + rn() * 1.6); c.fill(); }
    if (w > h * 2) { c.beginPath(); for (var k = 40; k < w; k += 40) { c.moveTo(x + k, y); c.lineTo(x + k, y + h); } linha(c, 2, '#6d685f'); c.stroke(); }
    c.restore();
    racha(c, w, h, dano, semente, '#3f3b35', 2.2);
    rret(c, x, y, w, h, 4); linha(c, 3); c.stroke();
  }
  function bloco(c, tipo, x, y, w, h, ang, dano, semente, estatico) {
    c.save(); c.translate(x, y); if (ang) c.rotate(ang);
    if (tipo === 'wood_crate') caixote(c, w, h, dano, semente);
    else if (tipo === 'glass_jar') vidro(c, w, h, dano, semente, true);
    else if (tipo === 'glass_pane') vidro(c, w, h, dano, semente, false);
    else if (tipo === 'stone_slab' || tipo === 'stone_block') pedra(c, w, h, dano, semente);
    else madeira(c, w, h, dano, semente, estatico);
    c.restore();
  }
  // galão de vinagre fermentado: explode com pancada
  function galao(c, x, y, ang, t, aceso) {
    var w = 44, h = 58;
    c.save(); c.translate(x, y); if (ang) c.rotate(ang);
    var X = -w / 2, Y = -h / 2;
    c.beginPath(); c.moveTo(X + w * 0.55, Y + 8); c.quadraticCurveTo(X + w * 0.75, Y - 6, X + w - 4, Y + 10); linha(c, 9); c.stroke(); linha(c, 4.5, '#fff7e6'); c.stroke();
    rret(c, X + 6, Y - 4, 14, 10, 2); encher(c, '#d32f2f', 2.5);
    rret(c, X, Y + 4, w, h - 4, 9); c.fillStyle = '#fff7e6'; c.fill();
    c.save(); rret(c, X, Y + 4, w, h - 4, 9); c.clip();
    var onda = Math.sin(t * 3) * 2;
    c.beginPath(); c.moveTo(X, Y + 20 + onda); c.quadraticCurveTo(0, Y + 15 - onda, X + w, Y + 20 + onda); c.lineTo(X + w, Y + h); c.lineTo(X, Y + h); c.closePath();
    c.fillStyle = aceso && Math.floor(t * 10) % 2 ? '#ff5a2a' : '#c8682a'; c.fill();
    for (var i = 0; i < 3; i++) { var u = (t * 0.8 + i * 0.33) % 1; circ(c, X + 9 + i * 12, Y + h - 6 - u * 30, 2 + u * 1.5); c.fillStyle = 'rgba(255,230,180,' + (1 - u) + ')'; c.fill(); }
    c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(X + 4, Y + 8, 5, h - 18);
    c.restore();
    rret(c, X, Y + 4, w, h - 4, 9); linha(c, 3); c.stroke();
    // rótulo com o aviso
    rret(c, X + 7, Y + 24, w - 14, 22, 3); encher(c, '#ffe14d', 2);
    c.beginPath(); c.moveTo(0, Y + 27); c.lineTo(8, Y + 42); c.lineTo(-8, Y + 42); c.closePath(); encher(c, '#e53935', 1.5);
    c.fillStyle = '#fff'; c.fillRect(-1.2, Y + 31, 2.4, 6); c.fillRect(-1.2, Y + 38.5, 2.4, 2);
    c.restore();
  }

  /* ---------- estilingue (forquilha de árvore com câmara de pneu) ---------- */
  function forquilha(c, x, y, lado) {
    c.save(); c.translate(x, y);
    if (lado === 'tras') {
      c.beginPath(); c.moveTo(-8, CHAO - y); c.lineTo(-7, 60); c.quadraticCurveTo(-10, 30, -22, -12); c.lineTo(-10, -16); c.quadraticCurveTo(-2, 20, 7, 52); c.lineTo(8, CHAO - y); c.closePath();
      encher(c, '#8a5a2e', 4);
      c.beginPath(); c.moveTo(-3, CHAO - y - 10); c.lineTo(-2, 70); c.moveTo(3, CHAO - y - 30); c.lineTo(3, 90); linha(c, 2, '#5e3a18'); c.stroke();
      // folhinha brotando
      c.beginPath(); c.moveTo(-5, 70); c.quadraticCurveTo(-24, 60, -30, 70); c.quadraticCurveTo(-20, 78, -5, 70); encher(c, '#7cb342', 2.5);
      rret(c, -26, -16, 18, 12, 4); encher(c, '#2b2b2b', 2.5);
    } else {
      c.beginPath(); c.moveTo(4, 54); c.quadraticCurveTo(12, 28, 24, -6); c.lineTo(34, -2); c.quadraticCurveTo(22, 30, 14, 62); c.closePath();
      encher(c, '#9c6a38', 4);
      rret(c, 21, -8, 16, 12, 4); encher(c, '#2b2b2b', 2.5);
    }
    c.restore();
  }
  function elastico(c, de, ate, tensao) {
    c.beginPath(); c.moveTo(de.x, de.y); c.lineTo(ate.x, ate.y);
    linha(c, 9 - tensao * 3.5); c.stroke(); linha(c, 6 - tensao * 3, '#3a3a3a'); c.stroke();
    linha(c, 1.5, 'rgba(255,255,255,.25)'); c.stroke();
  }
  function estilingueTras(c, x, y, bolsa, tensao) {
    forquilha(c, x, y, 'tras');
    elastico(c, { x: x - 17, y: y - 10 }, bolsa, tensao);
  }
  function estilingueFrente(c, x, y, bolsa, tensao) {
    elastico(c, { x: x + 29, y: y - 4 }, bolsa, tensao);
    oval(c, bolsa.x, bolsa.y, 10, 15, 0); encher(c, '#7a4a22', 3);
    forquilha(c, x, y, 'frente');
  }

  /* ---------- os garotos ---------- */
  var GAROTOS = {
    duda: { pele: '#c68642', camisa: '#ffd23f', faixa: '#e8433a', calca: '#3b6fd8', tenis: '#ffffff', cabelo: '#3a2414' },
    nina: { pele: '#8d5524', camisa: '#ff8fab', faixa: '#ffffff', calca: '#2fae7a', tenis: '#ffe14d', cabelo: '#1f130b' }
  };
  function braco(c, de, ate, cor, pele) {
    var mx = (de.x + ate.x) / 2, my = (de.y + ate.y) / 2 + 8;
    c.beginPath(); c.moveTo(de.x, de.y); c.quadraticCurveTo(mx, my, ate.x, ate.y);
    linha(c, 10); c.stroke(); linha(c, 5.5, pele); c.stroke();
    c.beginPath(); c.moveTo(de.x, de.y); c.lineTo(de.x + (mx - de.x) * 0.35, de.y + (my - de.y) * 0.35); linha(c, 9, cor); c.stroke();
    circ(c, ate.x, ate.y, 5.5); encher(c, pele, 2.5);
  }
  // pose: parado | puxa | torce | ops | triste ; alvo = onde as mãos seguram (puxa), em coordenadas do mundo
  function garoto(c, quem, x, y, pose, t, alvo) {
    var k = GAROTOS[quem], f = quem === 'duda' ? 0 : 1.7;
    var pulo = pose === 'torce' ? -Math.abs(Math.sin(t * 7 + f)) * 18 : 0;
    var inclina = pose === 'puxa' ? -0.24 : pose === 'triste' ? 0.12 : 0, bob = pose === 'parado' ? Math.sin(t * 2.2 + f) * 1.2 : 0;
    c.save(); c.translate(x, y + pulo);
    // pernas (ficam no chão) e tênis
    var pe = pose === 'puxa' ? [[-16, 0], [14, 0]] : pulo < -3 ? [[-8, -4], [10, -2]] : [[-8, 0], [9, 0]];
    [[-6, pe[0]], [6, pe[1]]].forEach(function (p) {
      c.beginPath(); c.moveTo(p[0], -32); c.lineTo(p[1][0], p[1][1] - 6); linha(c, 11); c.stroke(); linha(c, 6.5, k.pele); c.stroke();
      oval(c, p[1][0] + 4, p[1][1] - 4, 9, 5); encher(c, k.tenis, 2.5);
    });
    // corpo inclinado a partir do quadril
    c.translate(0, -32 + bob); c.rotate(inclina);
    rret(c, -13, -4, 26, 14, 4); encher(c, k.calca, 2.5);
    rret(c, -14, -36, 28, 36, 9); encher(c, k.camisa, 3);
    c.fillStyle = k.faixa; c.fillRect(-12.5, -22, 25, 5);
    if (quem === 'nina') { rret(c, -10, -18, 20, 18, 4); encher(c, k.calca, 2.5); c.fillStyle = '#ffe14d'; circ(c, -6, -14, 2); c.fill(); circ(c, 6, -14, 2); c.fill(); }
    // braços
    var omb = [{ x: -10, y: -30 }, { x: 10, y: -30 }], maos;
    if (pose === 'torce') maos = [{ x: -26, y: -70 + Math.sin(t * 14) * 4 }, { x: 26, y: -70 - Math.sin(t * 14) * 4 }];
    else if (pose === 'ops') maos = [{ x: -18, y: -64 }, { x: 18, y: -64 }];
    else if (pose === 'puxa' && alvo) {
      var gx = alvo.x - x, gy = alvo.y - (y + pulo) + 32 - bob, ca = Math.cos(-inclina), sa = Math.sin(-inclina);
      var lx = gx * ca - gy * sa, ly = gx * sa + gy * ca;
      maos = [{ x: lx - 3, y: ly - 4 }, { x: lx + 3, y: ly + 4 }];
    } else maos = [{ x: -16, y: -4 }, { x: 16, y: -4 }];
    braco(c, omb[0], maos[0], k.camisa, k.pele);
    // cabeça
    var cy = -54, inc = pose === 'triste' ? 0.25 : 0;
    c.save(); c.translate(0, cy); c.rotate(inc);
    if (quem === 'nina') { circ(c, -17, -14, 11); encher(c, k.cabelo, 2.5); circ(c, 17, -14, 11); encher(c, k.cabelo, 2.5); }
    circ(c, -19, 2, 5); encher(c, k.pele, 2.5);
    circ(c, 0, 0, 19); encher(c, k.pele, 3);
    if (quem === 'duda') {
      c.beginPath(); c.arc(0, -3, 19, Math.PI * 1.05, Math.PI * 1.95); c.closePath(); encher(c, k.faixa, 3);   // boné virado para trás
      rret(c, -27, -10, 14, 6, 3); encher(c, k.faixa, 2.5);
      circ(c, 0, -21, 2.5); encher(c, '#fff', 1.5);
    } else {
      c.beginPath(); c.arc(0, -2, 19, Math.PI * 1.08, Math.PI * 1.92); c.quadraticCurveTo(6, -6, -2, -10); c.quadraticCurveTo(-8, -4, -17, -8); c.closePath(); encher(c, k.cabelo, 2.5);
      c.fillStyle = '#5e3216'; [[6, 4], [9, 6], [12, 3]].forEach(function (s) { circ(c, s[0], s[1], 1.1); c.fill(); });
    }
    // rosto (olhando para a direita)
    var ox = 6, oy = -2;
    if (pose === 'puxa') {
      c.beginPath(); c.moveTo(ox - 9, oy - 3); c.lineTo(ox - 4, oy); c.lineTo(ox - 9, oy + 3); c.moveTo(ox + 9, oy - 3); c.lineTo(ox + 4, oy); c.lineTo(ox + 9, oy + 3); linha(c, 2.5); c.stroke();
      rret(c, ox - 7, oy + 7, 14, 7, 2); encher(c, '#fff', 2); c.beginPath(); c.moveTo(ox - 7, oy + 10.5); c.lineTo(ox + 7, oy + 10.5); linha(c, 1.2); c.stroke();
      c.beginPath(); c.moveTo(-14, -12); c.quadraticCurveTo(-18, -6, -14, -4); c.quadraticCurveTo(-10, -6, -14, -12); encher(c, '#9fe1ff', 1.5);   // gota de suor
    } else if (pose === 'torce') {
      c.beginPath(); c.arc(ox - 6, oy + 1, 3.5, Math.PI * 1.1, Math.PI * 1.9); c.moveTo(ox + 9.5, oy + 1); c.arc(ox + 6, oy + 1, 3.5, Math.PI * 1.1, Math.PI * 1.9); linha(c, 2.5); c.stroke();
      c.beginPath(); c.arc(ox, oy + 7, 7, 0.1, Math.PI - 0.1); c.closePath(); encher(c, '#7a1a1a', 2);
    } else if (pose === 'ops') {
      olho(c, ox - 6, oy - 1, 4.5, 5.5, 0.4, -0.4, 1.8); olho(c, ox + 6, oy - 1, 4.5, 5.5, 0.4, -0.4, 1.8);
      oval(c, ox, oy + 10, 3.5, 4.5); encher(c, '#7a1a1a', 2);
    } else if (pose === 'triste') {
      c.beginPath(); c.moveTo(ox - 9, oy); c.lineTo(ox - 3, oy + 1); c.moveTo(ox + 3, oy + 1); c.lineTo(ox + 9, oy); linha(c, 2.5); c.stroke();
      c.beginPath(); c.arc(ox, oy + 13, 5, Math.PI * 1.15, Math.PI * 1.85); linha(c, 2.2); c.stroke();
    } else {
      var pisca = ((t + f) % 4) < 0.12;
      if (pisca) { c.beginPath(); c.moveTo(ox - 9, oy); c.lineTo(ox - 3, oy); c.moveTo(ox + 3, oy); c.lineTo(ox + 9, oy); linha(c, 2.2); c.stroke(); }
      else { olho(c, ox - 6, oy - 1, 3.8, 4.8, 0.7, 0, 1.8); olho(c, ox + 6, oy - 1, 3.8, 4.8, 0.7, 0, 1.8); }
      c.beginPath(); c.arc(ox + 1, oy + 7, 5, 0.2, Math.PI - 0.4); linha(c, 2.2); c.stroke();
    }
    c.restore();
    braco(c, omb[1], maos[1], k.camisa, k.pele);
    c.restore();
  }

  /* ---------- céu e cenário da quitanda ---------- */
  var gradCeu = null, gradH = 0;
  function nuvem(c, x, y, s) {
    c.beginPath();
    c.arc(x, y, 26 * s, Math.PI * 0.5, Math.PI * 1.5); c.arc(x + 30 * s, y - 22 * s, 30 * s, Math.PI, Math.PI * 1.85);
    c.arc(x + 70 * s, y - 14 * s, 26 * s, Math.PI * 1.2, Math.PI * 1.95); c.arc(x + 92 * s, y + 4 * s, 22 * s, Math.PI * 1.5, Math.PI * 0.5);
    c.closePath(); c.fillStyle = '#fff'; c.fill(); linha(c, 3 * s, 'rgba(70,120,160,.5)'); c.stroke();
  }
  function ceu(c, w, h, t, camX) {
    if (!gradCeu || gradH !== h) {
      gradCeu = c.createLinearGradient(0, 0, 0, h); gradCeu.addColorStop(0, '#39b4ec'); gradCeu.addColorStop(0.55, '#9fe0fa'); gradCeu.addColorStop(1, '#ffeec2'); gradH = h;
    }
    c.fillStyle = gradCeu; c.fillRect(0, 0, w, h);
    // sol
    var sx = w * 0.84, sy = Math.min(90, h * 0.14), sr = Math.min(48, h * 0.07);
    c.save(); c.translate(sx, sy); c.rotate(t * 0.05);
    c.beginPath(); for (var i = 0; i < 24; i++) { var a = i * TAU / 24, q = i % 2 ? sr * 1.25 : sr * 1.75; c.lineTo(Math.cos(a) * q, Math.sin(a) * q); } c.closePath();
    c.fillStyle = 'rgba(255,214,64,.45)'; c.fill();
    c.restore();
    circ(c, sx, sy, sr); c.fillStyle = '#ffd640'; c.fill(); linha(c, 3, '#e8a317'); c.stroke();
    var s = Math.max(0.55, Math.min(1, h / 700));
    for (var k = 0; k < 4; k++) {
      var nx = ((k * 420 + t * 8 - camX * 0.15) % (w + 400) + w + 400) % (w + 400) - 200;
      nuvem(c, nx, h * (0.12 + (k % 3) * 0.09), s * (0.8 + (k % 2) * 0.3));
    }
  }
  function casa(c, x, larg, alt, cor, rn) {
    var y = 600 - alt;
    c.fillStyle = cor; c.fillRect(x, y, larg, alt);
    c.strokeStyle = OUT; c.lineWidth = 3; c.strokeRect(x, y, larg, alt);
    // telhado de telha
    c.beginPath(); c.moveTo(x - 12, y + 2); c.lineTo(x + larg * 0.5, y - alt * 0.22); c.lineTo(x + larg + 12, y + 2); c.closePath(); encher(c, '#c4572e', 3);
    c.beginPath(); for (var k = 1; k < 5; k++) { var f = k / 5; c.moveTo(x - 12 + (larg * 0.5 + 12) * f, y + 2 - alt * 0.22 * f); c.lineTo(x + larg + 12 - (larg * 0.5 + 12) * f, y + 2 - alt * 0.22 * f); } linha(c, 1.5, '#8e3a1c'); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x, y, larg, 8);
    // janelas com venezianas
    var cols = Math.max(1, Math.floor(larg / 70)), cor2 = ['#2f7fbf', '#2f9e6f', '#c0392b'][Math.floor(rn() * 3)];
    for (var i = 0; i < cols; i++) for (var j = 0; j < 2; j++) {
      var wx = x + (i + 0.5) * larg / cols - 14, wy = y + 22 + j * alt * 0.4;
      if (wy + 40 > 600 - 50) continue;
      c.fillStyle = '#fff6df'; c.fillRect(wx - 4, wy - 4, 36, 44);
      c.fillStyle = '#1e3d59'; c.fillRect(wx, wy, 28, 36);
      c.fillStyle = cor2; c.fillRect(wx - 12, wy, 11, 36); c.fillRect(wx + 29, wy, 11, 36);
      c.strokeStyle = OUT; c.lineWidth = 2; c.strokeRect(wx - 12, wy, 11, 36); c.strokeRect(wx + 29, wy, 11, 36); c.strokeRect(wx, wy, 28, 36);
      if (rn() < 0.4) { c.fillStyle = '#e8433a'; circ(c, wx + 6, wy + 40, 4); c.fill(); circ(c, wx + 16, wy + 41, 4); c.fill(); c.fillStyle = '#4caf50'; c.fillRect(wx, wy + 42, 28, 4); }
    }
    // porta
    var px = x + larg * 0.5 - 16;
    c.beginPath(); c.moveTo(px, 600); c.lineTo(px, 552); c.arc(px + 16, 552, 16, Math.PI, 0); c.lineTo(px + 32, 600); c.closePath(); encher(c, '#7a4a22', 2.5);
  }
  function bandeirinhas(c, x1, x2, y, rn) {
    var cores = ['#e8433a', '#ffd23f', '#2f9e6f', '#3b6fd8', '#ff8fab', '#ff9f1c'];
    var meio = y + 26;
    c.beginPath(); c.moveTo(x1, y); c.quadraticCurveTo((x1 + x2) / 2, meio + 20, x2, y); linha(c, 2, '#4a3a2a'); c.stroke();
    var n = Math.floor((x2 - x1) / 34);
    for (var i = 1; i < n; i++) {
      var f = i / n, px = x1 + (x2 - x1) * f, py = (1 - f) * (1 - f) * y + 2 * (1 - f) * f * (meio + 20) + f * f * y;
      c.beginPath(); c.moveTo(px - 11, py); c.lineTo(px + 11, py); c.lineTo(px, py + 24); c.closePath(); encher(c, cores[Math.floor(rn() * cores.length)], 2);
    }
  }
  function caixaDeFrutas(c, x, y, cor, rn) {   // caixote de feira cheio (enfeite do fundo)
    for (var i = 0; i < 6; i++) { circ(c, x + 10 + (i % 3) * 18 + (i > 2 ? 9 : 0), y - (i > 2 ? 16 : 6), 10); encher(c, cor, 2); }
    rret(c, x, y - 4, 66, 30, 3); encher(c, '#c98546', 2.5);
    c.beginPath(); c.moveTo(x, y + 6); c.lineTo(x + 66, y + 6); c.moveTo(x, y + 15); c.lineTo(x + 66, y + 15); linha(c, 1.5, '#7a4518'); c.stroke();
  }
  // tudo o que não se mexe atrás da fase: casas, bandeirinhas, a barraca de toldo listrado, caixotes, balança e calçada
  function cenario(c, W) {
    var rn = aleat(42), x, i;
    var cores = ['#f4c27a', '#9ed4c8', '#f29e8e', '#c7b6e8', '#fbe08a', '#a8d5f2'];
    for (x = -700, i = 0; x < W + 700; i++) { var l = 170 + Math.floor(rn() * 90), a = 230 + Math.floor(rn() * 110); casa(c, x, l, a, cores[i % cores.length], rn); x += l + 6; }
    c.fillStyle = 'rgba(255,240,210,.32)'; c.fillRect(-700, 200, W + 1400, 400);   // névoa: o fundo fica mais clarinho que a fase
    for (x = -650; x < W + 600; x += 520) bandeirinhas(c, x, x + 520, 230 + rn() * 30, rn);
    // a barraca da Quitanda do Seu Zé, atrás da fortaleza
    var b0 = 780, b1 = Math.min(W - 60, 1700);
    c.fillStyle = 'rgba(90,60,30,.18)'; c.fillRect(b0, 320, b1 - b0, 280);
    [b0, (b0 + b1) / 2, b1].forEach(function (px) { rret(c, px - 7, 300, 14, 300, 3); encher(c, '#8a5a2e', 3); });
    var listra = 46, n = Math.ceil((b1 - b0 + 60) / listra);
    for (var k = 0; k < n; k++) {
      var lx = b0 - 30 + k * listra;
      c.beginPath(); c.moveTo(lx, 262); c.lineTo(lx + listra, 262); c.lineTo(lx + listra, 312); c.arc(lx + listra / 2, 312, listra / 2, 0, Math.PI); c.closePath();
      c.fillStyle = k % 2 ? '#fff4dc' : '#e8433a'; c.fill();
    }
    c.beginPath(); c.moveTo(b0 - 30, 262); c.lineTo(b0 - 30 + n * listra, 262); linha(c, 4); c.stroke();
    for (var m = 0; m < n; m++) { var mx = b0 - 30 + m * listra; c.beginPath(); c.moveTo(mx, 262); c.lineTo(mx, 312); c.arc(mx + listra / 2, 312, listra / 2, Math.PI, 0, true); linha(c, 3); c.stroke(); }
    // placa
    var cx = (b0 + b1) / 2;
    rret(c, cx - 170, 196, 340, 58, 10); encher(c, '#fff4dc', 4);
    rret(c, cx - 162, 204, 324, 42, 7); linha(c, 2, '#e8433a'); c.stroke();
    c.fillStyle = '#c0392b'; c.font = '700 30px Fredoka, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('QUITANDA DO SEU ZÉ', cx, 227);
    c.fillStyle = '#2f9e6f'; circ(c, cx - 150, 225, 7); c.fill(); circ(c, cx + 150, 225, 7); c.fill();
    // prateleira de caixotes no fundo
    var fr = ['#ff9f1c', '#ffd23f', '#e8433a', '#7cb342', '#ff8fab'];
    for (x = b0 + 30; x < b1 - 70; x += 96) { caixaDeFrutas(c, x, 440, fr[Math.floor(rn() * fr.length)], rn); if (rn() < 0.6) caixaDeFrutas(c, x + 12, 404, fr[Math.floor(rn() * fr.length)], rn); }
    c.fillStyle = 'rgba(255,240,210,.28)'; c.fillRect(b0 - 30, 320, b1 - b0 + 60, 280);
    // balança antiga em cima de um caixote, à esquerda da barraca
    var bx = b0 - 90;
    rret(c, bx - 34, 540, 68, 60, 3); encher(c, '#c98546', 3);
    rret(c, bx - 20, 500, 40, 40, 6); encher(c, '#3a7bd5', 3);
    circ(c, bx, 520, 13); encher(c, '#fff', 2.5); c.beginPath(); c.moveTo(bx, 520); c.lineTo(bx + 7, 513); linha(c, 2, '#e8433a'); c.stroke();
    oval(c, bx, 496, 30, 6); encher(c, '#c0c4c8', 3);
    circ(c, bx - 8, 484, 10); encher(c, '#ff9f1c', 2); circ(c, bx + 9, 486, 9); encher(c, '#7cb342', 2);
    // poste de luz perto do estilingue
    rret(c, -205, 330, 10, 270, 3); encher(c, '#3d4a57', 3);
    c.beginPath(); c.moveTo(-200, 336); c.quadraticCurveTo(-200, 312, -176, 314); linha(c, 7); c.stroke(); linha(c, 3, '#3d4a57'); c.stroke();
    c.beginPath(); c.moveTo(-186, 314); c.lineTo(-166, 314); c.lineTo(-160, 330); c.lineTo(-192, 330); c.closePath(); encher(c, '#ffe9a0', 2.5);
    // calçada de ondas (preto e branco), meio-fio e rua
    c.fillStyle = '#f3ead7'; c.fillRect(-700, 600, W + 1400, 44);
    c.save(); c.beginPath(); c.rect(-700, 600, W + 1400, 44); c.clip();
    c.beginPath();
    for (var o = -700; o < W + 700; o += 80) { c.moveTo(o, 622); c.bezierCurveTo(o + 20, 600, o + 40, 600, o + 40, 622); c.bezierCurveTo(o + 40, 644, o + 60, 644, o + 80, 622); }
    linha(c, 9, '#2d2a26'); c.stroke();
    c.restore();
    c.beginPath(); c.moveTo(-700, 600); c.lineTo(W + 700, 600); linha(c, 4); c.stroke();
    c.fillStyle = '#c9c2b4'; c.fillRect(-700, 644, W + 1400, 12);
    c.beginPath(); c.moveTo(-700, 644); c.lineTo(W + 700, 644); c.moveTo(-700, 656); c.lineTo(W + 700, 656); linha(c, 3); c.stroke();
    c.fillStyle = '#6b5d52'; c.fillRect(-700, 656, W + 1400, 120);
    c.fillStyle = '#7d6e62';
    for (x = -700; x < W + 700; x += 34) for (var r2 = 0; r2 < 3; r2++) { rret(c, x + (r2 % 2) * 17, 664 + r2 * 30, 30, 24, 5); c.fill(); }
  }

  /* ---------- figurinhas (menu, Como jogar e ícone) ---------- */
  function retrato(cv, id, t) {
    var c = cv.getContext('2d'), w = cv.width, h = cv.height;
    c.clearRect(0, 0, w, h);
    var r = Math.min(w, h) * 0.3;
    if (FRUTA[id]) {
      var rr = id === 'melancia_passada' ? r * 0.92 : id === 'pimenta_jato' ? r * 0.82 : id === 'abacaxi_azedo' ? r * 0.85 : r;
      fruta(c, id, w * 0.5 - (id === 'pimenta_jato' ? r * 0.15 : 0), h * 0.56 + (id === 'abacaxi_azedo' ? r * 0.25 : 0), rr, id === 'pimenta_jato' ? -0.35 : 0, t || 0.6, 'mira', { aceso: id === 'abacaxi_azedo' });
    } else if (PRAGA[id]) praga(c, id, w * 0.5, h * 0.58, r * 0.95, t || 0.6, { capacete: id === 'rato_ladrao' });
    else if (id === 'galao') { c.save(); c.translate(w / 2, h / 2 + 4); c.scale(h / 80, h / 80); galao(c, 0, 0, 0, 0.5, false); c.restore(); }
  }

  raiz.FrutaArte = { ceu: ceu, cenario: cenario, fruta: fruta, moscasZonzas: moscasZonzas, praga: praga, bloco: bloco, galao: galao,
    estilingueTras: estilingueTras, estilingueFrente: estilingueFrente, garoto: garoto, retrato: retrato, estrelinhas: estrelinhas,
    oval: oval, circ: circ, rret: rret, linha: linha, OUT: OUT };
})(this);
