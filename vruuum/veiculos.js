/* Vruuum! — a garagem: 12 veículos, todos desenhados em código, vistos de trás (como na corrida).
   Terra: Clássico, GT (traseira redonda), Superesportivo (largo, aerofólio grande), Kart, Monstrão,
   Moto, Skate (animado: a perna empurra o chão, em quadros), Cavalo (galopando, em 3D: cavalo.js). Céu: Aviãozinho, Jato, Helicóptero — esses voam (desenho.js troca a estrada por uma rota no
   ar e os obstáculos por pássaros, nuvens de tempestade, anéis e correntes de ar).
   Estilos inspirados em carros esportivos famosos, mas sem marca, logotipo ou nome de fabricante.
   vel e curva: pequenas diferenças (até ~10%) para cada um ter seu jeito sem desequilibrar a corrida. */
(function (raiz) {
  'use strict';
  var S = raiz.VruuumSprites || { util: {} }, U = S.util, EMOJI = S.EMOJI, FONTE = S.FONTE;   // no Node (testes) só a lista importa
  var CAV = raiz.VruuumCavalo || (typeof require === 'function' ? require('./cavalo.js') : null);
  var circ = U.circ, oval = U.oval, caixa = U.caixa, poli = U.poli, linha = U.linha, sombra = U.sombra, brilho = U.brilho;

  function tom(cor, f) {   // f > 0 clareia, f < 0 escurece
    var n = parseInt(cor.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function m(v) { return Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f)); }
    return 'rgb(' + m(r) + ',' + m(g) + ',' + m(b) + ')';
  }
  function grad(c, y0, y1, a, b) { var g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
  function pneu(c, x, y, w, h) {
    caixa(c, x, y, w, h, Math.min(w, h) * 0.3, '#15151b');
    c.fillStyle = 'rgba(255,255,255,.08)'; for (var k = 1; k < 4; k++) c.fillRect(x + w * 0.1, y + h * k / 4, w * 0.8, h * 0.04);
  }
  function piloto(c, emoji, x, y, tam, clipFn) {
    if (!emoji) return;   // na corrida o piloto é desenhado por cima, animado (cabeca.js)
    c.save(); if (clipFn) { c.beginPath(); clipFn(); c.clip(); }
    c.font = Math.round(tam) + 'px ' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(emoji, x, y);
    c.restore();
  }
  function lanterna(c, x, y, w, h, r) { brilho(c, '#ff2a2a', w * 0.6); caixa(c, x, y, w, h, r, '#ff2a2a'); c.shadowBlur = 0; caixa(c, x + w * 0.15, y + h * 0.2, w * 0.7, h * 0.25, r * 0.5, 'rgba(255,220,220,.7)'); }
  function lanternaRedonda(c, x, y, r) { brilho(c, '#ff2a2a', r * 1.2); circ(c, x, y, r, '#ff2a2a'); c.shadowBlur = 0; circ(c, x - r * 0.25, y - r * 0.25, r * 0.35, 'rgba(255,230,230,.8)'); }
  function placa(c, x, y, w, h, txt) {
    caixa(c, x, y, w, h, h * 0.2, '#fff'); c.fillStyle = '#1a1446'; c.font = '700 ' + Math.round(h * 0.7) + 'px ' + FONTE;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, x + w / 2, y + h * 0.55);
  }
  function escape(c, x, y, r) { circ(c, x, y, r, '#9aa0a6'); circ(c, x, y, r * 0.6, '#2a2a30'); }

  // ---------- terra ----------
  function gt(c, W, H, cor, emoji) {   // traseira redonda e baixa, lanterna em faixa, rabinho de pato
    sombra(c, W, H, 0.48);
    pneu(c, W * 0.03, H * 0.68, W * 0.2, H * 0.32); pneu(c, W * 0.77, H * 0.68, W * 0.2, H * 0.32);
    c.fillStyle = grad(c, H * 0.1, H * 0.85, tom(cor, 0.25), tom(cor, -0.25));
    c.beginPath(); c.moveTo(W * 0.04, H * 0.8); c.bezierCurveTo(W * 0.0, H * 0.45, W * 0.15, H * 0.42, W * 0.28, H * 0.4);
    c.bezierCurveTo(W * 0.33, H * 0.1, W * 0.67, H * 0.1, W * 0.72, H * 0.4); c.bezierCurveTo(W * 0.85, H * 0.42, W * 1.0, H * 0.45, W * 0.96, H * 0.8); c.closePath(); c.fill();
    // vidro traseiro estreito e inclinado
    c.save(); c.beginPath(); c.moveTo(W * 0.34, H * 0.4); c.bezierCurveTo(W * 0.37, H * 0.17, W * 0.63, H * 0.17, W * 0.66, H * 0.4); c.closePath();
    c.fillStyle = grad(c, H * 0.17, H * 0.4, '#bfe6ff', '#4a7fa8'); c.fill(); c.clip();
    piloto(c, emoji, W * 0.5, H * 0.33, H * 0.26); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(W * 0.34, H * 0.17, W * 0.08, H * 0.23); c.restore();
    caixa(c, W * 0.22, H * 0.4, W * 0.56, H * 0.035, H * 0.017, tom(cor, -0.4));   // rabinho de pato
    // faixa de luz de ponta a ponta
    brilho(c, '#ff2a2a', W * 0.04); caixa(c, W * 0.08, H * 0.5, W * 0.84, H * 0.05, H * 0.025, '#d81b1b'); c.shadowBlur = 0;
    lanternaRedonda(c, W * 0.14, H * 0.525, H * 0.05); lanternaRedonda(c, W * 0.86, H * 0.525, H * 0.05);
    c.fillStyle = 'rgba(255,255,255,.85)'; c.font = '700 ' + Math.round(H * 0.06) + 'px ' + FONTE; c.textAlign = 'center'; c.fillText('G T', W * 0.5, H * 0.63);
    placa(c, W * 0.38, H * 0.67, W * 0.24, H * 0.08, 'VRUUM');
    caixa(c, W * 0.06, H * 0.78, W * 0.88, H * 0.06, H * 0.03, '#222');
    escape(c, W * 0.44, H * 0.82, H * 0.03); escape(c, W * 0.56, H * 0.82, H * 0.03);
  }
  function superesportivo(c, W, H, cor, emoji) {   // largo e baixo, aerofólio, 4 lanternas redondas
    sombra(c, W, H, 0.5);
    pneu(c, W * 0.02, H * 0.66, W * 0.2, H * 0.34); pneu(c, W * 0.78, H * 0.66, W * 0.2, H * 0.34);
    c.fillStyle = grad(c, H * 0.25, H * 0.85, tom(cor, 0.3), tom(cor, -0.3));
    c.beginPath(); c.moveTo(W * 0.03, H * 0.82); c.lineTo(W * 0.04, H * 0.5); c.quadraticCurveTo(W * 0.1, H * 0.4, W * 0.3, H * 0.38);
    c.lineTo(W * 0.36, H * 0.22); c.lineTo(W * 0.64, H * 0.22); c.lineTo(W * 0.7, H * 0.38); c.quadraticCurveTo(W * 0.9, H * 0.4, W * 0.96, H * 0.5); c.lineTo(W * 0.97, H * 0.82); c.closePath(); c.fill();
    c.save(); c.beginPath(); c.moveTo(W * 0.38, H * 0.37); c.lineTo(W * 0.41, H * 0.25); c.lineTo(W * 0.59, H * 0.25); c.lineTo(W * 0.62, H * 0.37); c.closePath();
    c.fillStyle = grad(c, H * 0.25, H * 0.37, '#a9dcff', '#2c5b80'); c.fill(); c.clip(); piloto(c, emoji, W * 0.5, H * 0.33, H * 0.2); c.restore();
    // entradas de ar laterais
    poli(c, [W * 0.08, H * 0.48, W * 0.26, H * 0.44, W * 0.24, H * 0.5, W * 0.1, H * 0.53], '#1b1b22'); poli(c, [W * 0.92, H * 0.48, W * 0.74, H * 0.44, W * 0.76, H * 0.5, W * 0.9, H * 0.53], '#1b1b22');
    // aerofólio grande em dois pés
    c.fillStyle = '#1b1b22'; c.fillRect(W * 0.25, H * 0.12, W * 0.025, H * 0.28); c.fillRect(W * 0.725, H * 0.12, W * 0.025, H * 0.28);
    caixa(c, W * 0.12, H * 0.06, W * 0.76, H * 0.08, H * 0.03, tom(cor, -0.35)); caixa(c, W * 0.12, H * 0.06, W * 0.76, H * 0.025, H * 0.012, tom(cor, 0.3));
    // grade de colmeia no meio
    caixa(c, W * 0.3, H * 0.55, W * 0.4, H * 0.13, H * 0.03, '#141418');
    c.strokeStyle = '#33333c'; c.lineWidth = H * 0.008; for (var k = 0; k < 9; k++) { c.beginPath(); c.moveTo(W * (0.32 + k * 0.045), H * 0.56); c.lineTo(W * (0.32 + k * 0.045), H * 0.67); c.stroke(); }
    lanternaRedonda(c, W * 0.12, H * 0.6, H * 0.045); lanternaRedonda(c, W * 0.21, H * 0.6, H * 0.045);
    lanternaRedonda(c, W * 0.79, H * 0.6, H * 0.045); lanternaRedonda(c, W * 0.88, H * 0.6, H * 0.045);
    // difusor com aletas e 4 escapes
    caixa(c, W * 0.1, H * 0.74, W * 0.8, H * 0.1, H * 0.03, '#1b1b22');
    c.fillStyle = '#2f2f38'; for (k = 0; k < 6; k++) c.fillRect(W * (0.3 + k * 0.08), H * 0.74, W * 0.012, H * 0.1);
    escape(c, W * 0.18, H * 0.79, H * 0.035); escape(c, W * 0.26, H * 0.79, H * 0.035); escape(c, W * 0.74, H * 0.79, H * 0.035); escape(c, W * 0.82, H * 0.79, H * 0.035);
  }
  function kart(c, W, H, cor, emoji) {
    sombra(c, W, H, 0.5);
    pneu(c, W * 0.0, H * 0.58, W * 0.24, H * 0.42); pneu(c, W * 0.76, H * 0.58, W * 0.24, H * 0.42);
    caixa(c, W * 0.2, H * 0.78, W * 0.6, H * 0.06, H * 0.03, '#9aa0a6');   // eixo
    // piloto de capacete grande
    caixa(c, W * 0.3, H * 0.34, W * 0.4, H * 0.36, W * 0.08, tom(cor, -0.2));   // macacão
    circ(c, W * 0.5, H * 0.24, W * 0.2, '#f5f5f5'); circ(c, W * 0.5, H * 0.24, W * 0.2 * 0.92, cor);
    caixa(c, W * 0.47, H * 0.04, W * 0.06, H * 0.4, W * 0.03, '#ffffff'); circ(c, W * 0.44, H * 0.17, W * 0.03, 'rgba(255,255,255,.5)');   // listra do capacete (nuca)
    piloto(c, emoji, W * 0.5, H * 0.26, H * 0.26);
    caixa(c, W * 0.18, H * 0.6, W * 0.64, H * 0.18, H * 0.05, cor);    // banco/carenagem
    caixa(c, W * 0.18, H * 0.6, W * 0.64, H * 0.05, H * 0.025, tom(cor, 0.35));
    caixa(c, W * 0.34, H * 0.66, W * 0.32, H * 0.1, H * 0.02, '#fff');
    c.fillStyle = '#1a1446'; c.font = '700 ' + Math.round(H * 0.09) + 'px ' + FONTE; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('7', W * 0.5, H * 0.715);
    caixa(c, W * 0.6, H * 0.5, W * 0.14, H * 0.14, H * 0.02, '#3a3a44'); escape(c, W * 0.7, H * 0.52, H * 0.025);   // motorzinho
    lanterna(c, W * 0.22, H * 0.62, W * 0.08, H * 0.04, H * 0.01);
  }
  function monstrao(c, W, H, cor, emoji) {
    sombra(c, W, H, 0.5);
    pneu(c, W * 0.0, H * 0.48, W * 0.3, H * 0.52); pneu(c, W * 0.7, H * 0.48, W * 0.3, H * 0.52);
    // molas da suspensão
    c.strokeStyle = '#ffd166'; c.lineWidth = W * 0.015;
    [0.33, 0.62].forEach(function (x) { c.beginPath(); for (var k = 0; k <= 8; k++) c.lineTo(W * (x + (k % 2 ? 0.05 : 0)), H * (0.42 + k * 0.03)); c.stroke(); });
    caixa(c, W * 0.18, H * 0.66, W * 0.64, H * 0.05, H * 0.02, '#555');
    // caçamba e cabine bem altas
    c.fillStyle = grad(c, H * 0.08, H * 0.45, tom(cor, 0.25), tom(cor, -0.25));
    caixa(c, W * 0.12, H * 0.25, W * 0.76, H * 0.22, H * 0.04, c.fillStyle);
    caixa(c, W * 0.24, H * 0.04, W * 0.52, H * 0.24, H * 0.05, tom(cor, -0.1));
    caixa(c, W * 0.29, H * 0.07, W * 0.42, H * 0.15, H * 0.03, '#9fdcff'); piloto(c, emoji, W * 0.5, H * 0.15, H * 0.15, function () { c.rect(W * 0.29, H * 0.07, W * 0.42, H * 0.15); });
    // chamas pintadas
    [['#ffd166', 0], ['#ff7b00', 0.03]].forEach(function (p) { c.fillStyle = p[0]; c.beginPath(); c.moveTo(W * 0.14, H * (0.45 - p[1])); for (var k = 0; k < 6; k++) { c.lineTo(W * (0.2 + k * 0.11), H * (0.3 + p[1])); c.lineTo(W * (0.25 + k * 0.11), H * (0.42 - p[1])); } c.lineTo(W * 0.86, H * 0.45); c.closePath(); c.fill(); });
    lanterna(c, W * 0.14, H * 0.28, W * 0.08, H * 0.05, H * 0.01); lanterna(c, W * 0.78, H * 0.28, W * 0.08, H * 0.05, H * 0.01);
    placa(c, W * 0.4, H * 0.48, W * 0.2, H * 0.07, 'MONSTRO');
    caixa(c, W * 0.26, H * 0.0, W * 0.48, H * 0.03, H * 0.01, '#1b1b22'); [0.32, 0.44, 0.56, 0.68].forEach(function (x) { brilho(c, '#fff3a0', W * 0.03); circ(c, W * x, H * 0.015, H * 0.014, '#fff3a0'); }); c.shadowBlur = 0;
  }
  function moto(c, W, H, cor, emoji) {
    sombra(c, W, H, 0.3);
    pneu(c, W * 0.38, H * 0.62, W * 0.24, H * 0.38);
    caixa(c, W * 0.34, H * 0.56, W * 0.32, H * 0.1, H * 0.03, tom(cor, -0.3));   // para-lama
    // piloto: jaqueta, braços no guidão, capacete
    c.fillStyle = grad(c, H * 0.2, H * 0.6, tom(cor, 0.15), tom(cor, -0.3));
    c.beginPath(); c.moveTo(W * 0.34, H * 0.6); c.quadraticCurveTo(W * 0.26, H * 0.32, W * 0.38, H * 0.25); c.lineTo(W * 0.62, H * 0.25); c.quadraticCurveTo(W * 0.74, H * 0.32, W * 0.66, H * 0.6); c.closePath(); c.fill();
    linha(c, [W * 0.3, H * 0.34, W * 0.06, H * 0.42], tom(cor, -0.2), W * 0.08); linha(c, [W * 0.7, H * 0.34, W * 0.94, H * 0.42], tom(cor, -0.2), W * 0.08);
    circ(c, W * 0.05, H * 0.43, W * 0.05, '#222'); circ(c, W * 0.95, H * 0.43, W * 0.05, '#222');   // luvas
    linha(c, [W * 0.02, H * 0.44, W * 0.98, H * 0.44], '#3a3a44', W * 0.025);   // guidão
    circ(c, W * 0.5, H * 0.14, W * 0.2, '#f5f5f5'); circ(c, W * 0.5, H * 0.14, W * 0.18, cor);
    caixa(c, W * 0.46, H * 0.01, W * 0.08, H * 0.26, W * 0.04, '#ffffff'); circ(c, W * 0.43, H * 0.09, W * 0.035, 'rgba(255,255,255,.5)');
    piloto(c, emoji, W * 0.5, H * 0.16, H * 0.17);
    caixa(c, W * 0.4, H * 0.5, W * 0.2, H * 0.03, H * 0.01, '#fff');   // listra da jaqueta
    lanterna(c, W * 0.42, H * 0.58, W * 0.16, H * 0.04, H * 0.015);
    placa(c, W * 0.4, H * 0.65, W * 0.2, H * 0.06, '7');
    escape(c, W * 0.72, H * 0.7, W * 0.05); linha(c, [W * 0.66, H * 0.66, W * 0.72, H * 0.7], '#9aa0a6', W * 0.04);
  }

  /* menino de skate visto de trás, como num jogo de skate: o pé da frente em cima do shape e o de trás
     empurrando o chão. fase (0 a 1) é um ciclo da remada: 0–0.45 o pé de trás empurra a rua (vai para
     trás, mais perto de quem olha), 0.45–0.65 levanta (aparece a sola) e volta, 0.65–1 descansa no
     tail (deslizando). Desenhado em vários quadros (quadros: 12) que a corrida troca conforme a velocidade.
     A cabeça é desenhada viva por cima (cabeca.js): aqui fica só uma cabeça neutra para quando está longe. */
  var PELE = '#f2c9a0', PELE_SOMBRA = '#d9a57a', SHORT = '#2a2d3a';
  function mistura(a, b, f) { return a + (b - a) * f; }
  function suave(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  // perna em dois pedaços (coxa e canela) com o joelho dobrando para fora (lado = -1 esquerda, 1 direita)
  function joelho(hx, hy, fx, fy, comp, lado) {
    var dx = fx - hx, dy = fy - hy, d = Math.sqrt(dx * dx + dy * dy) || 1, meio = Math.max(comp, d) / 2;
    var alt = Math.sqrt(Math.max(0, meio * meio - (d / 2) * (d / 2)));
    return [hx + dx / 2 - dy / d * alt * -lado, hy + dy / 2 + dx / d * alt * -lado];
  }
  function membro(c, a, b, l1, l2, cor, sombraCor) {   // pedaço de braço ou perna afinando, com sombra de um lado
    var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / d, ny = dx / d;
    poli(c, [a[0] + nx * l1, a[1] + ny * l1, b[0] + nx * l2, b[1] + ny * l2, b[0] - nx * l2, b[1] - ny * l2, a[0] - nx * l1, a[1] - ny * l1], cor);
    circ(c, a[0], a[1], l1, cor); circ(c, b[0], b[1], l2, cor);
    if (sombraCor) poli(c, [a[0] + nx * l1 * 0.3, a[1] + ny * l1 * 0.3, b[0] + nx * l2 * 0.3, b[1] + ny * l2 * 0.3, b[0] + nx * l2 * 0.95, b[1] + ny * l2 * 0.95, a[0] + nx * l1 * 0.95, a[1] + ny * l1 * 0.95], sombraCor);
  }
  function tenis(c, x, y, w, sola, cor) {   // tênis visto de trás (calcanhar); sola > 0 = pé levantado mostrando a sola
    var h = w * 0.62;
    if (sola > 0) {
      c.save(); c.translate(x, y); c.rotate(-0.25 * sola);
      oval(c, 0, -h * 0.1, w * 0.52, h * (0.55 + sola * 0.6), '#e9e4ee');
      oval(c, 0, -h * 0.1, w * 0.4, h * (0.42 + sola * 0.5), '#c95d7a');
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = Math.max(1, w * 0.04);
      for (var k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(-w * 0.3, -h * 0.1 + k * h * 0.18 * (0.6 + sola)); c.lineTo(w * 0.3, -h * 0.1 + k * h * 0.18 * (0.6 + sola)); c.stroke(); }
      c.restore(); return;
    }
    caixa(c, x - w / 2, y - h, w, h, w * 0.3, '#f6f6f8');
    caixa(c, x - w / 2, y - h * 0.22, w, h * 0.22, w * 0.1, '#d8d8de');   // sola
    caixa(c, x - w * 0.14, y - h * 0.95, w * 0.28, h * 0.6, w * 0.08, cor);   // reforço do calcanhar
  }
  function shape(c, W, H, cor) {
    // sombra no chão, rodinhas da frente (lá adiante), o shape indo para longe em perspectiva e o tail perto da gente
    oval(c, W * 0.47, H * 0.905, W * 0.21, H * 0.02, 'rgba(0,0,0,.3)');
    [0.415, 0.525].forEach(function (x) { caixa(c, W * (x - 0.022), H * 0.728, W * 0.044, H * 0.028, W * 0.01, '#e8e2d0'); });
    linha(c, [W * 0.415, H * 0.742, W * 0.525, H * 0.742], '#9aa0a6', H * 0.007);
    function deck(dy) {
      c.beginPath(); c.moveTo(W * 0.415, H * (0.708 + dy)); c.quadraticCurveTo(W * 0.47, H * (0.69 + dy), W * 0.525, H * (0.708 + dy));
      c.lineTo(W * 0.585, H * (0.848 + dy)); c.quadraticCurveTo(W * 0.47, H * (0.876 + dy), W * 0.355, H * (0.848 + dy)); c.closePath();
    }
    deck(0.016); c.fillStyle = cor; c.fill();   // a borda do shape (madeira pintada)
    deck(0.009); c.fillStyle = '#e9c48a'; c.fill();
    deck(0); c.fillStyle = grad(c, H * 0.69, H * 0.87, '#2a2a33', '#3b3b46'); c.fill();   // lixa
    c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = Math.max(1, H * 0.003); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.07)'; for (var k = 0; k < 22; k++) c.fillRect(W * (0.39 + (k * 37 % 17) / 100), H * (0.72 + (k * 13 % 12) / 100), 2, 2);
    linha(c, [W * 0.385, H * 0.885, W * 0.555, H * 0.885], '#9aa0a6', H * 0.011);   // truck de trás
    [0.37, 0.57].forEach(function (x) { caixa(c, W * (x - 0.038), H * 0.868, W * 0.076, H * 0.038, W * 0.02, '#f1ead6'); caixa(c, W * (x - 0.038), H * 0.868, W * 0.076, H * 0.011, W * 0.01, 'rgba(255,255,255,.75)'); });
  }
  function skatista(c, W, H, cor, emoji, fase, corpo) {   // corpo: 'menina' (saia, blusinha com coração) ou 'menino'
    var menina = corpo === 'menina';   // sem corpo informado (código antigo): menino, como antes da escolha existir
    fase = ((fase || 0) % 1 + 1) % 1;
    var escura = tom(cor, -0.35), clara = tom(cor, 0.2), g = giroCorpo(fase), cg = Math.cos(g), sg = Math.sin(g);
    // pé de trás: onde está em cada momento da remada
    var px, py, sola = 0, noChao = false, perto = 1, deitado = 0;
    if (fase < 0.45) { var a = suave(fase / 0.45); px = mistura(0.63, 0.7, a); py = mistura(0.84, 0.975, a); noChao = true; perto = mistura(1, 1.18, a); }
    else if (fase < 0.65) { var b = (fase - 0.45) / 0.2; px = mistura(0.7, 0.5, suave(b)); py = mistura(0.975, 0.835, suave(b)) - Math.sin(Math.PI * b) * 0.07; sola = Math.sin(Math.PI * Math.min(1, b * 1.3)); perto = mistura(1.18, 1, b); }
    else { var d = suave((fase - 0.65) / 0.08); px = mistura(0.5, 0.485, d); py = 0.845; deitado = d; }
    shape(c, W, H, tom(cor, 0.1));
    if (noChao) oval(c, W * px, H * (py + 0.005), W * 0.06 * perto, H * 0.012, 'rgba(0,0,0,.3)');
    // quadris giram com o corpo: o direito (de trás) fica mais perto de quem olha
    var mq = 0.055 * cg + 0.01;
    // perna de trás (direita): quadril -> joelho -> pé
    var qd = [W * (0.5 + mq), H * 0.55], pd = [W * px, H * (py - 0.045 * perto)], jd = joelho(qd[0], qd[1], pd[0], pd[1], H * 0.27, 1);
    membro(c, qd, jd, W * 0.062, W * 0.05, PELE, PELE_SOMBRA); membro(c, jd, pd, W * 0.05, W * 0.036 * perto, PELE, PELE_SOMBRA);
    caixa(c, pd[0] - W * 0.038 * perto, pd[1] - H * 0.012, W * 0.076 * perto, H * 0.022, W * 0.01, '#fdfdfd');   // meia
    // perna da frente (esquerda): pé em cima do shape, perto do bico
    var qe = [W * (0.5 - mq), H * 0.55], pe = [W * 0.455, H * 0.765], je = joelho(qe[0], qe[1], pe[0], pe[1], H * 0.222, -1);
    membro(c, qe, je, W * 0.062, W * 0.05, PELE, PELE_SOMBRA); membro(c, je, pe, W * 0.05, W * 0.036, PELE, PELE_SOMBRA);
    caixa(c, pe[0] - W * 0.038, pe[1] - H * 0.012, W * 0.076, H * 0.022, W * 0.01, '#fdfdfd');
    // tênis: remando, o da frente aponta para a frente (calcanhar); deslizando, os dois ficam de lado no shape
    if (deitado > 0.5) tenisLado(c, W * 0.455, H * 0.8, W * 0.15, tom(cor, -0.2)); else tenis(c, W * 0.455, H * 0.8, W * 0.11, 0, tom(cor, -0.2));
    if (deitado > 0.5) tenisLado(c, W * px, H * py, W * 0.16, tom(cor, -0.2)); else tenis(c, W * px, H * py, W * 0.11 * perto, sola, tom(cor, -0.2));
    // bermuda (menino) ou saia rodada com pregas (menina), estreitando com o giro
    var lb = 0.14 * (0.62 + 0.38 * cg);
    if (menina) {
      var saia = tom(cor, -0.3), lb2 = lb + 0.06;
      c.fillStyle = saia; c.beginPath();
      c.moveTo(W * (0.5 - lb + 0.01), H * 0.47); c.lineTo(W * (0.5 + lb - 0.01), H * 0.47);
      c.lineTo(W * (0.5 + lb2), H * 0.6); c.quadraticCurveTo(W * 0.5, H * 0.615, W * (0.5 - lb2), H * 0.6); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = Math.max(1, W * 0.007);
      for (var pq = -2; pq <= 2; pq++) { c.beginPath(); c.moveTo(W * (0.5 + pq * lb * 0.35), H * 0.48); c.lineTo(W * (0.5 + pq * lb2 * 0.4), H * 0.605); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.moveTo(W * (0.5 - lb2), H * 0.597); c.quadraticCurveTo(W * 0.5, H * 0.612, W * (0.5 + lb2), H * 0.597);
      c.lineTo(W * (0.5 + lb2), H * 0.604); c.quadraticCurveTo(W * 0.5, H * 0.619, W * (0.5 - lb2), H * 0.604); c.closePath(); c.fill();
    } else {
    c.fillStyle = SHORT; c.beginPath();
    c.moveTo(W * (0.5 - lb), H * 0.47); c.lineTo(W * (0.5 + lb), H * 0.47); c.lineTo(W * (0.5 + lb - 0.005), H * 0.585);
    c.lineTo(W * 0.505, H * 0.6); c.lineTo(W * 0.5, H * 0.545); c.lineTo(W * 0.495, H * 0.6); c.lineTo(W * (0.5 - lb + 0.005), H * 0.585); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(W * (0.5 - lb + 0.02), H * 0.48, W * (lb * 2 - 0.04), H * 0.015);
    }
    // camiseta: o tronco gira de lado (pé esquerdo na frente): as costas ficam à esquerda e o lado direito do
    // corpo aparece à direita, mais escuro
    var A = 0.13, B = 0.085, meia = Math.sqrt(A * A * cg * cg + B * B * sg * sg), esp = -B * sg * 0.9;   // largura vista e a coluna
    c.save(); c.translate(W * 0.5, 0); c.scale(meia / A, 1); c.translate(-W * 0.5, 0);
    c.fillStyle = grad(c, H * 0.22, H * 0.52, clara, escura); c.beginPath();
    var cint = menina ? 0.025 : 0;   // blusinha mais acinturada
    c.moveTo(W * (0.385 + cint), H * 0.505); c.quadraticCurveTo(W * (0.36 + cint * 1.6), H * 0.4, W * 0.37, H * 0.3);
    c.lineTo(W * 0.37, H * 0.3); c.quadraticCurveTo(W * 0.39, H * 0.225, W * 0.43, H * 0.215);
    c.quadraticCurveTo(W * 0.5, H * 0.232, W * 0.57, H * 0.215); c.quadraticCurveTo(W * 0.61, H * 0.225, W * 0.63, H * 0.3);
    c.quadraticCurveTo(W * (0.64 - cint * 1.6), H * 0.4, W * (0.615 - cint), H * 0.505);
    c.quadraticCurveTo(W * 0.5, H * 0.52, W * (0.385 + cint), H * 0.505); c.closePath(); c.fill();
    c.save(); c.clip();
    var xc = 0.5 + esp * (A / meia);   // a coluna, em coordenadas antes do "scale"
    c.fillStyle = 'rgba(0,0,0,' + (0.28 * sg).toFixed(3) + ')'; c.fillRect(W * (xc + 0.06), H * 0.2, W * 0.3, H * 0.35);   // lado direito, virado
    c.restore();
    c.strokeStyle = 'rgba(0,0,0,.16)'; c.lineWidth = Math.max(1, W * 0.008); c.lineCap = 'round';
    [[xc - 0.05, 0.3, xc - 0.07, 0.46], [xc + 0.07, 0.32, xc + 0.085, 0.47], [xc, 0.38, xc - 0.01, 0.5]].forEach(function (q) { c.beginPath(); c.moveTo(W * q[0], H * q[1]); c.quadraticCurveTo(W * (q[0] + 0.02), H * (q[1] + q[3]) / 2, W * q[2], H * q[3]); c.stroke(); });
    c.save(); c.translate(W * xc, H * 0.33); c.scale(Math.max(0.35, cg), 1);
    c.fillStyle = 'rgba(255,255,255,.85)'; c.font = '800 ' + Math.round(H * 0.045) + 'px ' + FONTE; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(menina ? '♥' : '7', 0, 0);
    c.restore(); c.restore();
    // pescoço e cabeça neutra (cabelo), coberta pelo piloto vivo
    caixa(c, W * 0.455, H * 0.17, W * 0.09, H * 0.06, W * 0.03, PELE_SOMBRA);
    circ(c, W * 0.5, H * 0.105, H * 0.072, '#3a2a20');   // menor que a cabeça viva, para não aparecer na borda quando ela vira
    piloto(c, emoji, W * 0.5, H * 0.105, H * 0.2);
  }
  function tenisLado(c, x, y, w, cor) {   // tênis visto de lado, atravessado no shape (bico para a direita)
    var h = w * 0.36;
    caixa(c, x - w / 2, y - h, w, h, h * 0.45, '#f6f6f8');
    caixa(c, x - w / 2, y - h * 0.28, w, h * 0.28, h * 0.12, '#d8d8de');
    caixa(c, x - w * 0.12, y - h * 0.85, w * 0.3, h * 0.45, h * 0.15, cor);
  }
  // quanto o corpo está virado de lado (rad): remando fica mais de frente, deslizando fica de lado
  function giroCorpo(fase) {
    fase = ((fase || 0) % 1 + 1) % 1;
    if (fase < 0.45) return 0.35;
    if (fase < 0.7) return 0.35 + 0.55 * suave((fase - 0.45) / 0.25);
    if (fase < 0.9) return 0.9;
    return 0.9 - 0.55 * suave((fase - 0.9) / 0.1);
  }
  /* braços do skatista, desenhados ao vivo (seguem a curva). lado: -1 virando à esquerda, 1 à direita.
     Cada braço tem dois ângulos, o do ombro (braço) e o do cotovelo (antebraço), medidos a partir de "reto
     para baixo", para fora do corpo. Andando reto: braços um pouco abertos e cotovelos dobrados, antebraço para a
     frente, prontos para equilibrar. Na curva o corpo inclina para dentro e os braços fazem o contrapeso: o de
     DENTRO se estica para o lado da curva, mais baixo, quase reto; o de FORA sobe, com o cotovelo bem dobrado e a
     mão no alto (virando à esquerda: esquerdo baixo e esticado, direito alto e dobrado). Remando, balançam ao
     contrário das pernas. qual: 'longe' (o esquerdo, atrás do corpo: desenhar ANTES do boneco) ou 'perto' (o
     direito, na frente: desenhar DEPOIS). x0, y0, W, H: onde o boneco está desenhado. */
  var POSE = {   // [ombro, cotovelo (absoluto), tamanho do antebraço visto]
    reto: [32, 82, 0.86],
    fora: [72, 128, 0.92],
    dentro: [26, 42, 1]
  };
  function bracosSkate(c, x0, y0, W, H, cor, fase, lado, qual) {
    fase = ((fase || 0) % 1 + 1) % 1; lado = Math.max(-1, Math.min(1, lado || 0));
    var g = giroCorpo(fase), cg = Math.cos(g), s = qual === 'longe' ? -1 : 1;
    var bal = fase < 0.65 ? Math.sin(fase / 0.65 * Math.PI * 2) : 0;
    var esq = Math.max(0, -lado), dir = Math.max(0, lado);
    var dentro = s < 0 ? esq : dir, fora = s < 0 ? dir : esq;   // este braço está do lado de dentro ou de fora da curva?
    var r = POSE.reto, f = POSE.fora, d = POSE.dentro;
    function mix(k) { return r[k] + (f[k] - r[k]) * fora + (d[k] - r[k]) * dentro; }
    var aU = (mix(0) + 12 * bal * s) * Math.PI / 180, aF = (mix(1) + 16 * bal * s) * Math.PI / 180, kF = mix(2);
    var k = s < 0 ? 0.86 : 1, Lu = H * 0.125 * k, Lf = H * 0.115 * k * kF;   // o de trás parece um pouco menor
    var om = [x0 + W * (0.5 + s * 0.13 * cg * (s < 0 ? 0.9 : 1.05)), y0 + H * (s < 0 ? 0.24 : 0.25)];
    var co = [om[0] + s * Math.sin(aU) * Lu, om[1] + Math.cos(aU) * Lu];
    var mao = [co[0] + s * Math.sin(aF) * Lf, co[1] + Math.cos(aF) * Lf];
    membro(c, om, co, W * 0.046 * k, W * 0.04 * k, PELE, PELE_SOMBRA);
    membro(c, co, mao, W * 0.04 * k, W * 0.031 * k, PELE, PELE_SOMBRA);
    circ(c, co[0], co[1], W * 0.041 * k, PELE);                                   // cotovelo
    oval(c, mao[0], mao[1], W * 0.037 * k, W * 0.032 * k, PELE);                  // mão
    circ(c, mao[0] - s * W * 0.022 * k, mao[1] - W * 0.012 * k, W * 0.014 * k, PELE_SOMBRA);   // polegar
    // manga curta da camiseta
    var mx = om[0] + (co[0] - om[0]) * 0.45, my = om[1] + (co[1] - om[1]) * 0.45;
    membro(c, om, [mx, my], W * 0.06 * k, W * 0.052 * k, tom(cor, s < 0 ? -0.25 : 0.05), null);
  }

  // conversível rosa: capota abaixada, a piloto aparece por inteiro; lanternas de coração, pneus de faixa branca,
  // laço no porta-malas. Desenho próprio, sem marca. A carroceria é sempre rosa; a cor escolhida vira o friso.
  function coracao(c, x, y, r, cor) {
    c.fillStyle = cor; c.beginPath(); c.moveTo(x, y + r * 0.9);
    c.bezierCurveTo(x - r * 1.4, y - r * 0.1, x - r * 0.6, y - r * 1.1, x, y - r * 0.35);
    c.bezierCurveTo(x + r * 0.6, y - r * 1.1, x + r * 1.4, y - r * 0.1, x, y + r * 0.9); c.fill();
  }
  function conversivel(c, W, H, cor, emoji) {
    var rosa = '#ff6fb5';
    sombra(c, W, H, 0.48);
    [0.05, 0.77].forEach(function (x) { pneu(c, W * x, H * 0.66, W * 0.18, H * 0.34); oval(c, W * (x + 0.09), H * 0.83, W * 0.05, H * 0.1, '#f4f4f4'); oval(c, W * (x + 0.09), H * 0.83, W * 0.03, H * 0.06, '#15151b'); });
    // para-brisa lá na frente (só o aro) e os encostos dos bancos
    linha(c, [W * 0.3, H * 0.42, W * 0.33, H * 0.17, W * 0.67, H * 0.17, W * 0.7, H * 0.42], '#e9e4f2', W * 0.014);
    c.globalAlpha = 0.18; poli(c, [W * 0.31, H * 0.42, W * 0.335, H * 0.18, W * 0.665, H * 0.18, W * 0.69, H * 0.42], '#bfe6ff'); c.globalAlpha = 1;
    // carroceria arredondada
    c.fillStyle = grad(c, H * 0.4, H * 0.86, tom(rosa, 0.25), tom(rosa, -0.25));
    c.beginPath(); c.moveTo(W * 0.06, H * 0.62); c.quadraticCurveTo(W * 0.06, H * 0.43, W * 0.2, H * 0.42); c.lineTo(W * 0.8, H * 0.42);
    c.quadraticCurveTo(W * 0.94, H * 0.43, W * 0.94, H * 0.62); c.lineTo(W * 0.94, H * 0.76); c.quadraticCurveTo(W * 0.5, H * 0.84, W * 0.06, H * 0.76); c.closePath(); c.fill();
    caixa(c, W * 0.24, H * 0.4, W * 0.52, H * 0.05, H * 0.025, tom(rosa, -0.35));   // borda do habitáculo
    caixa(c, W * 0.08, H * 0.52, W * 0.84, H * 0.035, H * 0.017, cor);               // friso na cor escolhida
    coracao(c, W * 0.17, H * 0.6, W * 0.055, '#ff2a55'); coracao(c, W * 0.83, H * 0.6, W * 0.055, '#ff2a55');
    circ(c, W * 0.155, H * 0.575, W * 0.012, 'rgba(255,255,255,.8)'); circ(c, W * 0.815, H * 0.575, W * 0.012, 'rgba(255,255,255,.8)');
    // laço no porta-malas
    poli(c, [W * 0.5, H * 0.5, W * 0.43, H * 0.46, W * 0.43, H * 0.55], '#ffffff'); poli(c, [W * 0.5, H * 0.5, W * 0.57, H * 0.46, W * 0.57, H * 0.55], '#ffffff'); circ(c, W * 0.5, H * 0.505, W * 0.02, '#ffd6ea');
    caixa(c, W * 0.07, H * 0.72, W * 0.86, H * 0.05, H * 0.025, '#e9e9f0');   // para-choque cromado
    placa(c, W * 0.4, H * 0.62, W * 0.2, H * 0.065, '♥');
    escape(c, W * 0.27, H * 0.79, W * 0.03);
    piloto(c, emoji, W * 0.5, H * 0.33, H * 0.22);
  }

  // ---------- 1.11.0: veículos novos (desenhos próprios, sem marca) ----------
  function espiral(c, x, y, r, cor, lw) { c.strokeStyle = cor; c.lineWidth = lw; c.lineCap = 'round'; c.beginPath(); for (var k = 0; k <= 40; k++) { var a = k / 40 * Math.PI * 5, rr = r * k / 40; if (k) c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else c.moveTo(x, y); } c.stroke(); }
  function brilhoX(c, x, y, r) { c.fillStyle = 'rgba(255,255,255,.95)'; poli(c, [x, y - r, x + r * 0.2, y - r * 0.2, x + r, y, x + r * 0.2, y + r * 0.2, x, y + r, x - r * 0.2, y + r * 0.2, x - r, y, x - r * 0.2, y - r * 0.2], 'rgba(255,255,255,.95)'); }
  function rodaBranca(c, x, y, w, h) { pneu(c, x, y, w, h); oval(c, x + w / 2, y + h * 0.5, w * 0.36, h * 0.3, '#f4f4f4'); oval(c, x + w / 2, y + h * 0.5, w * 0.2, h * 0.17, '#9aa0a6'); }
  // furgão de surfe: degradê azul-verde-laranja, espirais, brilhos, prancha no teto e luzes coloridas
  function furgao(c, W, H, cor, emoji) {
    sombra(c, W, H, 0.46);
    [0.07, 0.75].forEach(function (x) { pneu(c, W * x, H * 0.72, W * 0.18, H * 0.28); });
    // prancha de surfe no rack (vista de trás: a ponta da prancha)
    linha(c, [W * 0.2, H * 0.1, W * 0.2, H * 0.05, W * 0.8, H * 0.05, W * 0.8, H * 0.1], '#3a3a44', W * 0.02);
    c.fillStyle = grad(c, 0, H * 0.06, '#ffd166', '#ff4fa3'); c.beginPath(); if (c.ellipse) c.ellipse(W * 0.5, H * 0.035, W * 0.36, H * 0.03, 0, 0, Math.PI * 2); else c.arc(W * 0.5, H * 0.035, W * 0.36, 0, Math.PI * 2); c.fill();
    linha(c, [W * 0.18, H * 0.035, W * 0.82, H * 0.035], '#ffffff', H * 0.008);
    // carroceria quadradona em degradê (laranja em cima, verde no meio, azul embaixo)
    var g = c.createLinearGradient(0, H * 0.08, 0, H * 0.84); g.addColorStop(0, '#ff5a36'); g.addColorStop(0.3, '#ffb627'); g.addColorStop(0.5, '#7bd03a'); g.addColorStop(0.75, '#2f8fe0'); g.addColorStop(1, '#1d5fc4');
    caixa(c, W * 0.06, H * 0.08, W * 0.88, H * 0.74, W * 0.07, g);
    caixa(c, W * 0.03, H * 0.06, W * 0.94, H * 0.06, H * 0.02, '#ff5a36');   // aerofólio
    // vidros de trás (o piloto aparece no do meio)
    poli(c, [W * 0.24, H * 0.42, W * 0.24, H * 0.17, W * 0.76, H * 0.17, W * 0.76, H * 0.42], '#1b2433');
    linha(c, [W * 0.5, H * 0.17, W * 0.5, H * 0.42], tom('#2f8fe0', -0.2), W * 0.012);
    piloto(c, emoji, W * 0.5, H * 0.33, H * 0.2, function () { c.rect(W * 0.24, H * 0.17, W * 0.52, H * 0.25); });
    // espirais, brilhos e o SURF grafitado
    espiral(c, W * 0.14, H * 0.3, W * 0.05, '#ffffff', W * 0.008); espiral(c, W * 0.86, H * 0.52, W * 0.05, cor, W * 0.01); espiral(c, W * 0.16, H * 0.66, W * 0.04, '#e63946', W * 0.008);
    [[0.12, 0.47, 0.025], [0.84, 0.25, 0.03], [0.62, 0.48, 0.02], [0.3, 0.72, 0.022], [0.9, 0.7, 0.02]].forEach(function (b) { brilhoX(c, W * b[0], H * b[1], W * b[2]); });
    c.save(); c.translate(W * 0.5, H * 0.56); c.rotate(-0.06);
    c.font = 'italic 700 ' + Math.round(H * 0.13) + 'px ' + FONTE; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.lineWidth = H * 0.025; c.strokeStyle = '#b5121b'; c.strokeText('SURF', 0, 0); c.fillStyle = grad(c, -H * 0.06, H * 0.06, '#fff3a0', '#ff8c1a'); c.fillText('SURF', 0, 0);
    c.restore();
    // luzes de LED (rosa e verde) e para-choque
    [[0.13, '#ff4fd8'], [0.87, '#3dff9e']].forEach(function (l) { brilho(c, l[1], W * 0.05); circ(c, W * l[0], H * 0.72, W * 0.045, l[1]); c.shadowBlur = 0; circ(c, W * l[0], H * 0.72, W * 0.018, '#ffffff'); });
    caixa(c, W * 0.04, H * 0.8, W * 0.92, H * 0.05, H * 0.02, '#c9ced6');
    placa(c, W * 0.39, H * 0.71, W * 0.22, H * 0.06, 'SURF');
  }
  // ônibus escolar amarelo gigante: luzes vermelhas piscando, placa de PARE que abre, crianças nas janelas
  function onibusEscolar(c, W, H, cor, emoji, fase) {
    fase = fase || 0; var pisca = fase % 0.5 < 0.25, abre = Math.max(0, Math.sin(fase * Math.PI * 2));
    sombra(c, W, H, 0.48);
    [0.06, 0.76].forEach(function (x) { pneu(c, W * x, H * 0.76, W * 0.18, H * 0.24); });
    var am = '#ffc20e';
    caixa(c, W * 0.05, H * 0.06, W * 0.9, H * 0.78, W * 0.06, grad(c, H * 0.06, H * 0.84, tom(am, 0.15), tom(am, -0.12)));
    caixa(c, W * 0.05, H * 0.04, W * 0.9, H * 0.06, W * 0.04, tom(am, 0.3));   // teto
    // luzes de parada piscando lá em cima
    [[0.16, pisca], [0.84, !pisca]].forEach(function (l) { if (l[1]) brilho(c, '#ff2a2a', W * 0.06); circ(c, W * l[0], H * 0.13, W * 0.04, l[1] ? '#ff3b3b' : '#7a1a1a'); c.shadowBlur = 0; });
    [[0.3, !pisca], [0.7, pisca]].forEach(function (l) { if (l[1]) brilho(c, '#ffb703', W * 0.05); circ(c, W * l[0], H * 0.13, W * 0.03, l[1] ? '#ffb703' : '#7a5a10'); c.shadowBlur = 0; });
    c.fillStyle = '#1a1a1a'; c.font = '700 ' + Math.round(H * 0.05) + 'px ' + FONTE; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ESCOLAR', W * 0.5, H * 0.13);
    // janelas de trás: as duas dos lados com crianças, a porta de emergência no meio com o piloto
    [[0.1, '🧒'], [0.71, '👧']].forEach(function (jn, k) {
      caixa(c, W * jn[0], H * 0.2, W * 0.19, H * 0.2, W * 0.02, '#26313f');
      c.font = Math.round(H * 0.1) + 'px ' + EMOJI; c.fillText(jn[1], W * (jn[0] + 0.095), H * (0.32 - (k ? abre : 1 - abre) * 0.02));
    });
    caixa(c, W * 0.34, H * 0.18, W * 0.32, H * 0.5, W * 0.02, tom(am, -0.2));
    caixa(c, W * 0.37, H * 0.21, W * 0.26, H * 0.22, W * 0.02, '#26313f');
    piloto(c, emoji, W * 0.5, H * 0.33, H * 0.18, function () { c.rect(W * 0.37, H * 0.21, W * 0.26, H * 0.22); });
    caixa(c, W * 0.37, H * 0.46, W * 0.26, H * 0.19, W * 0.02, '#26313f');
    linha(c, [W * 0.4, H * 0.55, W * 0.47, H * 0.55], '#c9ced6', H * 0.015);   // maçaneta
    // faixas pretas e lanternas
    [0.47, 0.56, 0.66].forEach(function (y) { c.fillStyle = '#1a1a1a'; c.fillRect(W * 0.05, H * y, W * 0.29, H * 0.012); c.fillRect(W * 0.66, H * y, W * 0.29, H * 0.012); });
    lanternaRedonda(c, W * 0.14, H * 0.74, W * 0.035); lanternaRedonda(c, W * 0.86, H * 0.74, W * 0.035);
    caixa(c, W * 0.03, H * 0.8, W * 0.94, H * 0.05, H * 0.02, '#2a2a30');
    placa(c, W * 0.4, H * 0.71, W * 0.2, H * 0.06, 'BUS');
    // a placa de PARE do lado esquerdo, abrindo e fechando
    c.save(); c.translate(W * 0.06, H * 0.42); c.rotate(-Math.PI / 2 * abre);
    linha(c, [0, 0, -W * 0.06, 0], '#c9ced6', H * 0.012);
    var r = W * 0.06, px = -W * 0.11, pts = []; for (var k = 0; k < 8; k++) { var a = Math.PI / 8 + k * Math.PI / 4; pts.push(px + Math.cos(a) * r, Math.sin(a) * r); }
    poli(c, pts, '#e63946'); c.fillStyle = '#ffffff'; c.font = '700 ' + Math.round(r * 0.55) + 'px ' + FONTE; c.fillText('PARE', px, r * 0.04);
    c.restore();
  }
  // caminhão rosa de máquina de pegar bichinho: a garra passeia e as pelúcias balançam no vidro (o piloto vai lá dentro)
  var PELUCIAS = [['#ffd23f', 'leão'], ['#7cc8ff', 'uni'], ['#ff8fcf', 'uni'], ['#ffffff', 'uni'], ['#c08552', 'urso'], ['#8be28b', 'sapo'], ['#ffd23f', 'leão'], ['#b388eb', 'uni'], ['#7cc8ff', 'uni']];
  function pelucia(c, x, y, r, p) {
    if (p[1] === 'uni') poli(c, [x - r * 0.12, y - r * 0.85, x, y - r * 1.5, x + r * 0.12, y - r * 0.85], '#ffd166');
    if (p[1] === 'leão') circ(c, x, y, r * 1.25, '#ff9f1c');
    if (p[1] === 'urso') { circ(c, x - r * 0.7, y - r * 0.75, r * 0.32, p[0]); circ(c, x + r * 0.7, y - r * 0.75, r * 0.32, p[0]); }
    circ(c, x, y, r, p[0]);
    circ(c, x - r * 0.35, y - r * 0.1, r * 0.14, '#1b1b22'); circ(c, x + r * 0.35, y - r * 0.1, r * 0.14, '#1b1b22');
    oval(c, x, y + r * 0.35, r * 0.3, r * 0.2, p[1] === 'sapo' ? '#e85d75' : 'rgba(0,0,0,.12)');
  }
  function caminhaoPelucia(c, W, H, cor, emoji, fase) {
    fase = fase || 0;
    var rosa = '#ff3d8b';
    sombra(c, W, H, 0.48);
    // chaminés cromadas de bolinhas (lá na frente, aparecem dos dois lados)
    [0.02, 0.9].forEach(function (x) { caixa(c, W * x, H * 0.0, W * 0.08, H * 0.6, W * 0.04, '#d6dbe2'); for (var k = 0; k < 7; k++) circ(c, W * (x + 0.04), H * (0.1 + k * 0.07), W * 0.012, '#1b1b22'); });
    [0.08, 0.74].forEach(function (x) { rodaBranca(c, W * x, H * 0.74, W * 0.18, H * 0.26); });
    caixa(c, W * 0.07, H * 0.1, W * 0.86, H * 0.74, W * 0.04, grad(c, H * 0.1, H * 0.84, tom(rosa, 0.2), tom(rosa, -0.2)));
    // toldo listrado
    for (var k = 0; k < 9; k++) { c.fillStyle = k % 2 ? '#ffffff' : '#e8336f'; c.fillRect(W * (0.05 + k * 0.1), H * 0.08, W * 0.1, H * 0.07); }
    // a máquina: vidro, pelúcias balançando, a garra passeando
    var vx = W * 0.15, vy = H * 0.19, vw = W * 0.7, vh = H * 0.42;
    c.fillStyle = '#f6e9ff'; c.fillRect(vx, vy, vw, vh);
    c.save(); c.beginPath(); c.rect(vx, vy, vw, vh); c.clip();
    for (var p = 0; p < 9; p++) {
      var col = p % 5, lin = Math.floor(p / 5), bal = Math.sin(fase * Math.PI * 2 + p * 1.7) * H * 0.012;
      pelucia(c, vx + vw * (0.12 + col * 0.19 + lin * 0.09), vy + vh * (0.88 - lin * 0.25) + bal, W * 0.06, PELUCIAS[p]);
    }
    var gx = vx + vw * (0.5 + 0.35 * Math.sin(fase * Math.PI * 2)), gy = vy + vh * 0.32;
    linha(c, [gx, vy, gx, gy], '#9aa0a6', W * 0.008);
    linha(c, [gx - W * 0.04, gy + H * 0.06, gx - W * 0.03, gy, gx + W * 0.03, gy, gx + W * 0.04, gy + H * 0.06], '#c9ced6', W * 0.012);
    circ(c, gx, gy, W * 0.018, '#c9ced6');
    c.restore();
    c.fillStyle = 'rgba(255,255,255,.22)'; poli(c, [vx + vw * 0.08, vy, vx + vw * 0.22, vy, vx + vw * 0.06, vy + vh, vx, vy + vh], 'rgba(255,255,255,.22)');
    caixa(c, vx - W * 0.01, vy + vh * 0.48, vw + W * 0.02, H * 0.012, 0, rosa);   // divisória
    piloto(c, emoji, W * 0.5, H * 0.33, H * 0.18, function () { c.rect(vx, vy, vw, vh); });
    // luzes verdes, lanternas, para-choque, faixa de chamas
    [0.25, 0.5, 0.75].forEach(function (x) { brilho(c, '#3dff6e', W * 0.03); caixa(c, W * x - W * 0.04, H * 0.155, W * 0.08, H * 0.03, H * 0.008, '#3dff6e'); c.shadowBlur = 0; });
    c.fillStyle = cor; for (k = 0; k < 6; k++) poli(c, [W * (0.12 + k * 0.13), H * 0.74, W * (0.17 + k * 0.13), H * 0.64, W * (0.2 + k * 0.13), H * 0.74], cor);
    lanternaRedonda(c, W * 0.13, H * 0.69, W * 0.03); lanternaRedonda(c, W * 0.87, H * 0.69, W * 0.03);
    caixa(c, W * 0.04, H * 0.8, W * 0.92, H * 0.05, H * 0.02, '#c9ced6');
    placa(c, W * 0.38, H * 0.705, W * 0.24, H * 0.06, '🧸');
  }
  // trenó voador com as renas (a do nariz vermelho na frente) e o Papai Noel junto
  function rena(c, x, y, s, fase, nariz) {
    var pata = Math.sin(fase * Math.PI * 2) * s * 0.25;
    oval(c, x, y, s * 0.42, s * 0.3, '#8b5a2b');   // corpo (de trás)
    linha(c, [x - s * 0.22, y + s * 0.2, x - s * 0.25, y + s * 0.55 + pata], '#6b4220', s * 0.12); linha(c, [x + s * 0.22, y + s * 0.2, x + s * 0.25, y + s * 0.55 - pata], '#6b4220', s * 0.12);
    circ(c, x, y + s * 0.18, s * 0.12, '#fff3e0');   // rabinho
    circ(c, x, y - s * 0.38, s * 0.22, '#9a6a3a');   // cabeça
    [-1, 1].forEach(function (l) { linha(c, [x + l * s * 0.1, y - s * 0.55, x + l * s * 0.3, y - s * 0.85, x + l * s * 0.42, y - s * 0.8], '#c9a06a', s * 0.06); linha(c, [x + l * s * 0.22, y - s * 0.72, x + l * s * 0.18, y - s * 0.9], '#c9a06a', s * 0.05); });
    if (nariz) { brilho(c, '#ff2a2a', s * 0.6); circ(c, x, y - s * 0.62, s * 0.09, '#ff2a2a'); c.shadowBlur = 0; }
    linha(c, [x - s * 0.3, y - s * 0.05, x + s * 0.3, y - s * 0.05], '#e63946', s * 0.08);   // arreio
  }
  function treno(c, W, H, cor, emoji, fase) {
    fase = fase || 0;
    // as renas lá na frente (mais acima e menores), em pares, e a do nariz vermelho puxando
    var rd = [[0.5, 0.1, 0.09, true], [0.4, 0.22, 0.11], [0.6, 0.22, 0.11], [0.37, 0.36, 0.13], [0.63, 0.36, 0.13]];
    rd.forEach(function (r, k) { linha(c, [W * r[0], H * (r[1] + 0.03), W * 0.5, H * 0.62], 'rgba(230,57,70,.7)', W * 0.004); rena(c, W * r[0], H * r[1], W * r[2], fase + k * 0.17, r[3]); });
    // o trenó: vermelho com dourado, esquis curvados embaixo
    linha(c, [W * 0.18, H * 0.95, W * 0.82, H * 0.95], '#ffd166', H * 0.025); circ(c, W * 0.18, H * 0.91, H * 0.04, '#ffd166'); circ(c, W * 0.82, H * 0.91, H * 0.04, '#ffd166');
    linha(c, [W * 0.3, H * 0.86, W * 0.3, H * 0.95], '#ffd166', H * 0.015); linha(c, [W * 0.7, H * 0.86, W * 0.7, H * 0.95], '#ffd166', H * 0.015);
    // saco de presentes atrás
    c.fillStyle = grad(c, H * 0.5, H * 0.88, '#e63946', '#9d0208');
    c.beginPath(); c.moveTo(W * 0.16, H * 0.88); c.quadraticCurveTo(W * 0.12, H * 0.58, W * 0.24, H * 0.56); c.lineTo(W * 0.76, H * 0.56); c.quadraticCurveTo(W * 0.88, H * 0.58, W * 0.84, H * 0.88); c.closePath(); c.fill();
    linha(c, [W * 0.18, H * 0.6, W * 0.82, H * 0.6], '#ffd166', H * 0.02);
    for (var k = 0; k < 5; k++) espiral(c, W * (0.26 + k * 0.12), H * 0.74, W * 0.025, '#ffd166', W * 0.004);
    // Papai Noel sentado do lado direito (de costas): gorro vermelho com pompom e casaco
    oval(c, W * 0.64, H * 0.5, W * 0.1, H * 0.1, '#d62828'); caixa(c, W * 0.54, H * 0.52, W * 0.2, H * 0.03, H * 0.01, '#1b1b22');
    circ(c, W * 0.64, H * 0.36, W * 0.065, '#f4f4f4');   // barba de lado / cabelo branco
    poli(c, [W * 0.58, H * 0.35, W * 0.7, H * 0.35, W * 0.66, H * 0.22], '#d62828'); circ(c, W * 0.66, H * 0.21, W * 0.02, '#ffffff'); caixa(c, W * 0.575, H * 0.34, W * 0.13, H * 0.03, H * 0.01, '#ffffff');
    // o piloto senta do lado esquerdo (corpo; a cabeça é desenhada viva)
    oval(c, W * 0.38, H * 0.5, W * 0.09, H * 0.09, tom(cor, -0.2));
    piloto(c, emoji, W * 0.38, H * 0.36, H * 0.16);
  }
  // arara gigante voadora (vermelha, amarela e azul), batendo as asas, com quem monta nas costas
  function arara(c, W, H, cor, emoji, fase) {
    fase = fase || 0;
    var bat = Math.sin(fase * Math.PI * 2), pena = function (x0, y0, x1, y1, w0, cores) { var g = c.createLinearGradient(x0, y0, x1, y1); cores.forEach(function (cc, k) { g.addColorStop(k / (cores.length - 1), cc); }); c.strokeStyle = g; c.lineWidth = w0; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
    // asas (sobem e descem), com penas azuis e amarelas na ponta
    [-1, 1].forEach(function (l) {
      var bx = W * (0.5 + l * 0.1), by = H * 0.48, tx = W * (0.5 + l * 0.48), ty = H * (0.42 - bat * 0.28);
      c.fillStyle = '#e63946'; c.beginPath(); c.moveTo(bx, by - H * 0.06); c.quadraticCurveTo((bx + tx) / 2, ty - H * 0.08, tx, ty); c.quadraticCurveTo((bx + tx) / 2, ty + H * 0.12, bx, by + H * 0.08); c.closePath(); c.fill();
      for (var k = 0; k < 5; k++) { var f = 0.55 + k * 0.1, px = bx + (tx - bx) * f, py = by + (ty - by) * f; pena(px, py, px + l * W * 0.02, py + H * (0.1 + k * 0.012), W * 0.035, ['#ffd23f', '#2f8fe0', '#1d3fa0']); }
    });
    // cauda comprida (vermelha e azul) caindo para perto de quem olha
    [-1, 0, 1].forEach(function (k) { pena(W * 0.5, H * 0.6, W * (0.5 + k * 0.06), H * 0.98, W * 0.06, ['#e63946', '#e63946', '#2f8fe0']); });
    // corpo, cabeça lá na frente e o bico
    oval(c, W * 0.5, H * 0.52, W * 0.13, H * 0.13, '#e63946'); oval(c, W * 0.5, H * 0.57, W * 0.09, H * 0.08, '#ffd23f');
    linha(c, [W * 0.5, H * 0.45, W * 0.5, H * 0.16], '#e63946', W * 0.07);   // pescoço comprido: a cabeça aparece por cima de quem monta
    circ(c, W * 0.5, H * 0.13, W * 0.06, '#e63946'); oval(c, W * 0.5, H * 0.07, W * 0.026, H * 0.022, '#2a2a30');
    [-1, 1].forEach(function (l) { oval(c, W * (0.5 + l * 0.045), H * 0.13, W * 0.022, H * 0.03, '#ffffff'); circ(c, W * (0.5 + l * 0.05), H * 0.13, W * 0.009, '#1b1b22'); });
    // listras que brilham (pássaro de um mundo fantástico)
    brilho(c, '#7cf9ff', W * 0.03); linha(c, [W * 0.42, H * 0.47, W * 0.58, H * 0.47], '#7cf9ff', H * 0.008); linha(c, [W * 0.44, H * 0.55, W * 0.56, H * 0.55], '#7cf9ff', H * 0.008); c.shadowBlur = 0;
    // quem monta: corpo nas costas da arara (a cabeça é viva)
    oval(c, W * 0.5, H * 0.41, W * 0.075, H * 0.07, tom(cor, -0.1));
    [-1, 1].forEach(function (l) { linha(c, [W * (0.5 + l * 0.06), H * 0.4, W * (0.5 + l * 0.09), H * 0.47], PELE, W * 0.025); });
    piloto(c, emoji, W * 0.5, H * 0.32, H * 0.13);
  }

  // ---------- 1.11.1: galinha, morcego/Drácula, pipoca, sorvete e hambúrguer (desenhos próprios) ----------
  // galinha branca gigante, de costas, correndo (pernas amarelas alternando); quem monta vai nas costas
  function galinha(c, W, H, cor, emoji, fase) {
    fase = fase || 0;
    var passo = Math.sin(fase * Math.PI * 2);
    oval(c, W * 0.5, H * 0.97, W * 0.3, H * 0.03, 'rgba(0,0,0,.22)');
    // pernas e pés (de trás: dois palitos amarelos com os dedos abertos)
    [-1, 1].forEach(function (l) {
      var sobe = Math.max(0, l * passo) * H * 0.09, x = W * (0.5 + l * 0.12);
      linha(c, [x, H * 0.7, x + l * W * 0.01, H * 0.94 - sobe], '#f4a300', W * 0.035);
      linha(c, [x - W * 0.05, H * 0.95 - sobe, x + l * W * 0.01, H * 0.93 - sobe, x + W * 0.05, H * 0.95 - sobe], '#f4a300', W * 0.022);
    });
    // corpo branco fofo e o rabo de penas apontando para cima (perto de quem olha)
    c.fillStyle = grad(c, H * 0.3, H * 0.78, '#ffffff', '#dcdcea'); c.beginPath(); if (c.ellipse) c.ellipse(W * 0.5, H * 0.56, W * 0.32, H * 0.22, 0, 0, Math.PI * 2); else c.arc(W * 0.5, H * 0.56, W * 0.32, 0, Math.PI * 2); c.fill();
    [[-0.12, 0.3], [0, 0.26], [0.12, 0.3]].forEach(function (p, k) { c.fillStyle = k === 1 ? '#ffffff' : '#ececf4'; c.beginPath(); if (c.ellipse) c.ellipse(W * (0.5 + p[0]), H * p[1] + H * 0.12, W * 0.07, H * 0.16, p[0] * 2, 0, Math.PI * 2); c.fill(); });
    // asas dobradas dos lados
    [-1, 1].forEach(function (l) { c.fillStyle = '#f0f0f8'; c.beginPath(); if (c.ellipse) c.ellipse(W * (0.5 + l * 0.3), H * 0.55, W * 0.07, H * 0.14, l * 0.3, 0, Math.PI * 2); c.fill(); linha(c, [W * (0.5 + l * 0.29), H * 0.47, W * (0.5 + l * 0.32), H * 0.63], '#d2d2e0', W * 0.01); });
    // a cabeça lá na frente, com a crista vermelha aparecendo por cima de quem monta
    circ(c, W * 0.5, H * 0.17, W * 0.08, '#ffffff');
    [-0.04, 0, 0.04].forEach(function (d) { circ(c, W * (0.5 + d), H * 0.09, W * 0.035, '#e63946'); });
    // quem monta: o corpo (a cabeça é desenhada viva)
    oval(c, W * 0.5, H * 0.38, W * 0.1, H * 0.08, tom(cor, -0.1));
    [-1, 1].forEach(function (l) { linha(c, [W * (0.5 + l * 0.08), H * 0.37, W * (0.5 + l * 0.14), H * 0.45], PELE, W * 0.03); });
    piloto(c, emoji, W * 0.5, H * 0.27, H * 0.15);
  }
  // asas abertas batendo (ao vivo, quando a galinha pula): desenhadas por cima das dobradas
  function asasGalinha(c, x0, y0, W, H, tt) {
    var bat = Math.sin(tt * 26);
    [-1, 1].forEach(function (l) {
      var bx = x0 + W * (0.5 + l * 0.22), by = y0 + H * 0.5, tx = x0 + W * (0.5 + l * 0.66), ty = y0 + H * (0.42 - bat * 0.22);
      c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(bx, by - H * 0.08); c.quadraticCurveTo((bx + tx) / 2, ty - H * 0.1, tx, ty); c.quadraticCurveTo((bx + tx) / 2, ty + H * 0.1, bx, by + H * 0.08); c.closePath(); c.fill();
      c.strokeStyle = '#d2d2e0'; c.lineWidth = W * 0.008; for (var k = 1; k < 4; k++) { var f = k / 4; c.beginPath(); c.moveTo(bx + (tx - bx) * f, by + (ty - by) * f - H * 0.02); c.lineTo(bx + (tx - bx) * f + l * W * 0.02, by + (ty - by) * f + H * 0.07); c.stroke(); }
    });
  }
  // morcego gigante (de costas, asas batendo) com quem monta; perto das coisas ele vira o Conde Drácula
  function morcego(c, W, H, cor, emoji, fase) {
    fase = fase || 0; var bat = Math.sin(fase * Math.PI * 2);
    [-1, 1].forEach(function (l) {
      var bx = W * (0.5 + l * 0.08), by = H * 0.5, tx = W * (0.5 + l * 0.49), ty = H * (0.4 - bat * 0.26);
      c.fillStyle = '#2b1d3a'; c.beginPath(); c.moveTo(bx, by - H * 0.1);
      c.quadraticCurveTo((bx + tx) / 2, ty - H * 0.12, tx, ty);
      for (var k = 3; k >= 1; k--) { var px = bx + (tx - bx) * (k / 4), py = by + (ty - by) * (k / 4) + H * 0.12; c.quadraticCurveTo(bx + (tx - bx) * ((k + 0.5) / 4), by + (ty - by) * ((k + 0.5) / 4) + H * 0.04, px, py); }
      c.lineTo(bx, by + H * 0.08); c.closePath(); c.fill();
      c.strokeStyle = '#5a3f78'; c.lineWidth = W * 0.008; for (k = 1; k < 4; k++) { c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + (tx - bx) * (k / 4), by + (ty - by) * (k / 4) + H * 0.1); c.stroke(); }
    });
    oval(c, W * 0.5, H * 0.53, W * 0.11, H * 0.15, '#3a2850'); oval(c, W * 0.5, H * 0.58, W * 0.06, H * 0.08, '#4b3466');
    // cabeça com orelhas pontudas lá na frente
    circ(c, W * 0.5, H * 0.2, W * 0.06, '#3a2850');
    [-1, 1].forEach(function (l) { poli(c, [W * (0.5 + l * 0.02), H * 0.16, W * (0.5 + l * 0.06), H * 0.05, W * (0.5 + l * 0.07), H * 0.18], '#3a2850'); });
    oval(c, W * 0.5, H * 0.38, W * 0.07, H * 0.06, tom(cor, -0.15));
    piloto(c, emoji, W * 0.5, H * 0.29, H * 0.13);
  }
  // o Conde Drácula (personagem de Bram Stoker, 1897, domínio público; desenho próprio), voando de costas com a capa
  // aberta (preta por fora, vermelha por dentro) e quem monta sentado nos ombros dele
  function dracula(c, W, H, cor, emoji) {
    [-1, 1].forEach(function (l) {
      c.fillStyle = '#12101a'; c.beginPath(); c.moveTo(W * 0.5, H * 0.42); c.quadraticCurveTo(W * (0.5 + l * 0.3), H * 0.3, W * (0.5 + l * 0.48), H * 0.36);
      c.lineTo(W * (0.5 + l * 0.42), H * 0.55); c.lineTo(W * (0.5 + l * 0.46), H * 0.72); c.lineTo(W * (0.5 + l * 0.3), H * 0.68); c.lineTo(W * (0.5 + l * 0.26), H * 0.9); c.lineTo(W * 0.5, H * 0.8); c.closePath(); c.fill();
      c.fillStyle = '#b5121b'; c.beginPath(); c.moveTo(W * (0.5 + l * 0.06), H * 0.48); c.quadraticCurveTo(W * (0.5 + l * 0.3), H * 0.38, W * (0.5 + l * 0.44), H * 0.4); c.lineTo(W * (0.5 + l * 0.38), H * 0.55); c.lineTo(W * (0.5 + l * 0.2), H * 0.6); c.closePath(); c.fill();
    });
    caixa(c, W * 0.4, H * 0.48, W * 0.2, H * 0.32, W * 0.05, '#1b1b26');   // costas do terno
    poli(c, [W * 0.36, H * 0.45, W * 0.64, H * 0.45, W * 0.6, H * 0.36, W * 0.4, H * 0.36], '#b5121b');   // gola alta
    circ(c, W * 0.5, H * 0.42, W * 0.07, '#15131a'); poli(c, [W * 0.47, H * 0.36, W * 0.5, H * 0.41, W * 0.53, H * 0.36], '#15131a');   // cabelo penteado com o bico
    [-1, 1].forEach(function (l) { oval(c, W * (0.5 + l * 0.075), H * 0.43, W * 0.015, H * 0.03, '#e9e4f2'); });   // orelhas pálidas
    // quem monta, sentado nos ombros dele
    [-1, 1].forEach(function (l) { linha(c, [W * (0.5 + l * 0.04), H * 0.35, W * (0.5 + l * 0.1), H * 0.44], '#3a3a50', W * 0.03); });
    oval(c, W * 0.5, H * 0.33, W * 0.07, H * 0.06, tom(cor, -0.15));
    piloto(c, emoji, W * 0.5, H * 0.29, H * 0.13);
  }
  // carrinho de pipoca: máquina de vidro cheia de pipoca estourando, toldo listrado e rodinhas
  function carrinhoPipoca(c, W, H, cor, emoji, fase) {
    fase = fase || 0;
    sombra(c, W, H, 0.42);
    [0.12, 0.72].forEach(function (x) { rodaBranca(c, W * x, H * 0.76, W * 0.16, H * 0.24); });
    caixa(c, W * 0.1, H * 0.5, W * 0.8, H * 0.34, W * 0.03, grad(c, H * 0.5, H * 0.84, '#ff3b4f', '#c2102a'));
    for (var k = 0; k < 8; k++) if (k % 2) c.fillStyle = '#ffffff', c.fillRect(W * (0.1 + k * 0.1), H * 0.5, W * 0.1, H * 0.34);
    caixa(c, W * 0.22, H * 0.6, W * 0.56, H * 0.13, W * 0.02, '#ffd166');
    c.fillStyle = '#c2102a'; c.font = '700 ' + Math.round(H * 0.08) + 'px ' + FONTE; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PIPOCA', W * 0.5, H * 0.665);
    // máquina de vidro (atrás do piloto) com pipocas pulando
    caixa(c, W * 0.2, H * 0.12, W * 0.6, H * 0.36, W * 0.02, '#e9e4f2');
    c.fillStyle = 'rgba(255,240,200,.85)'; c.fillRect(W * 0.23, H * 0.15, W * 0.54, H * 0.31);
    for (k = 0; k < 26; k++) { var px = W * (0.25 + ((k * 37) % 50) / 100), py = H * (0.44 - ((k * 13) % 9) / 50) - Math.abs(Math.sin(fase * Math.PI * 2 + k)) * H * 0.06 * (k % 3 === 0 ? 1 : 0.2); circ(c, px, py, W * 0.022, '#fffaf0'); circ(c, px + W * 0.01, py - W * 0.008, W * 0.014, '#ffffff'); }
    poli(c, [W * 0.14, H * 0.12, W * 0.86, H * 0.12, W * 0.78, H * 0.02, W * 0.22, H * 0.02], '#ff3b4f');   // telhadinho
    for (k = 0; k < 6; k++) poli(c, [W * (0.18 + k * 0.12), H * 0.12, W * (0.24 + k * 0.12), H * 0.12, W * (0.24 + k * 0.1), H * 0.02, W * (0.21 + k * 0.1), H * 0.02], '#ffffff');
    piloto(c, emoji, W * 0.5, H * 0.33, H * 0.17);
  }
  // carrinho de sorvete: guarda-sol listrado, casquinha gigante e potes de sorvete coloridos
  function carrinhoSorvete(c, W, H, cor, emoji, fase) {
    fase = fase || 0;
    sombra(c, W, H, 0.42);
    [0.12, 0.72].forEach(function (x) { rodaBranca(c, W * x, H * 0.76, W * 0.16, H * 0.24); });
    caixa(c, W * 0.1, H * 0.5, W * 0.8, H * 0.34, W * 0.05, grad(c, H * 0.5, H * 0.84, '#a8e6ff', '#5cc8f0'));
    [['#ff8fab', 0.25], ['#fff3b0', 0.5], ['#b388eb', 0.75]].forEach(function (b) { circ(c, W * b[1], H * 0.6, W * 0.07, b[0]); circ(c, W * b[1] - W * 0.02, H * 0.585, W * 0.02, 'rgba(255,255,255,.7)'); });
    c.fillStyle = '#ff4fa3'; c.font = '700 ' + Math.round(H * 0.07) + 'px ' + FONTE; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SORVETE', W * 0.5, H * 0.76);
    // guarda-sol listrado (gira devagar) e a casquinha gigante lá no alto
    linha(c, [W * 0.5, H * 0.08, W * 0.5, H * 0.5], '#e9e4f2', W * 0.015);
    for (var k = 0; k < 8; k++) { var a0 = Math.PI + (k / 8) * Math.PI, a1 = Math.PI + ((k + 1) / 8) * Math.PI; poli(c, [W * 0.5, H * 0.06, W * 0.5 + Math.cos(a0) * W * 0.44, H * 0.16, W * 0.5 + Math.cos(a1) * W * 0.44, H * 0.16], (k + Math.floor(fase * 8)) % 2 ? '#ffffff' : '#ff4fa3'); }
    poli(c, [W * 0.8, H * 0.44, W * 0.88, H * 0.44, W * 0.84, H * 0.58], '#e9b56a');
    circ(c, W * 0.84, H * 0.41, W * 0.045, '#ff8fab'); circ(c, W * 0.84, H * 0.36, W * 0.035, '#fff3b0'); circ(c, W * 0.84, H * 0.32, W * 0.015, '#e63946');
    piloto(c, emoji, W * 0.5, H * 0.33, H * 0.17);
  }
  // carro-hambúrguer: o pão de cima (com gergelim) é o teto, e embaixo carne, queijo e alface
  function carroHamburguer(c, W, H, cor, emoji) {
    sombra(c, W, H, 0.46);
    [0.05, 0.77].forEach(function (x) { pneu(c, W * x, H * 0.7, W * 0.18, H * 0.3); });
    caixa(c, W * 0.06, H * 0.68, W * 0.88, H * 0.12, H * 0.06, grad(c, H * 0.68, H * 0.8, '#e9a54a', '#c07a28'));   // pão de baixo
    c.fillStyle = '#4caf50'; c.beginPath(); c.moveTo(W * 0.05, H * 0.66); for (var k = 0; k <= 12; k++) c.lineTo(W * (0.05 + k * 0.075), H * (0.66 + (k % 2 ? 0.035 : -0.005))); c.lineTo(W * 0.95, H * 0.7); c.lineTo(W * 0.05, H * 0.7); c.closePath(); c.fill();   // alface
    caixa(c, W * 0.07, H * 0.56, W * 0.86, H * 0.1, H * 0.05, grad(c, H * 0.56, H * 0.66, '#7a4a2a', '#4e2c16'));   // carne
    c.fillStyle = '#ffd23f'; c.beginPath(); c.moveTo(W * 0.06, H * 0.55); c.lineTo(W * 0.94, H * 0.55); c.lineTo(W * 0.9, H * 0.6); c.lineTo(W * 0.8, H * 0.64); c.lineTo(W * 0.72, H * 0.59); c.lineTo(W * 0.3, H * 0.59); c.lineTo(W * 0.2, H * 0.65); c.lineTo(W * 0.12, H * 0.59); c.closePath(); c.fill();   // queijo derretendo
    c.fillStyle = grad(c, H * 0.12, H * 0.56, '#f4b860', '#d2862e'); c.beginPath(); c.moveTo(W * 0.05, H * 0.55); c.quadraticCurveTo(W * 0.05, H * 0.12, W * 0.5, H * 0.12); c.quadraticCurveTo(W * 0.95, H * 0.12, W * 0.95, H * 0.55); c.closePath(); c.fill();   // pão de cima
    poli(c, [W * 0.27, H * 0.46, W * 0.3, H * 0.24, W * 0.7, H * 0.24, W * 0.73, H * 0.46], '#26313f');   // janela de trás (no pão)
    piloto(c, emoji, W * 0.5, H * 0.36, H * 0.18, function () { c.moveTo(W * 0.27, H * 0.46); c.lineTo(W * 0.3, H * 0.24); c.lineTo(W * 0.7, H * 0.24); c.lineTo(W * 0.73, H * 0.46); c.closePath(); });
    [[0.16, 0.36], [0.22, 0.22], [0.8, 0.3], [0.86, 0.44], [0.42, 0.17], [0.6, 0.18], [0.12, 0.48], [0.88, 0.5]].forEach(function (g) { oval(c, W * g[0], H * g[1], W * 0.012, H * 0.008, '#fff7e0'); });   // gergelim
    lanternaRedonda(c, W * 0.12, H * 0.61, W * 0.025); lanternaRedonda(c, W * 0.88, H * 0.61, W * 0.025);
    placa(c, W * 0.4, H * 0.7, W * 0.2, H * 0.06, '🍔');
  }

  // ---------- céu ----------
  function aviao(c, W, H, cor, emoji) {   // aviãozinho de hélice, visto de trás
    linha(c, [W * 0.3, H * 0.66, W * 0.3, H * 0.86], '#333', W * 0.012); linha(c, [W * 0.7, H * 0.66, W * 0.7, H * 0.86], '#333', W * 0.012);
    circ(c, W * 0.3, H * 0.88, H * 0.05, '#15151b'); circ(c, W * 0.7, H * 0.88, H * 0.05, '#15151b');
    // asas
    c.fillStyle = grad(c, H * 0.5, H * 0.66, tom(cor, 0.3), tom(cor, -0.2));
    c.beginPath(); c.moveTo(W * 0.02, H * 0.56); c.lineTo(W * 0.4, H * 0.54); c.lineTo(W * 0.6, H * 0.54); c.lineTo(W * 0.98, H * 0.56); c.lineTo(W * 0.98, H * 0.62); c.lineTo(W * 0.02, H * 0.62); c.closePath(); c.fill();
    caixa(c, W * 0.0, H * 0.55, W * 0.06, H * 0.08, H * 0.02, '#fff'); caixa(c, W * 0.94, H * 0.55, W * 0.06, H * 0.08, H * 0.02, '#fff');
    brilho(c, '#ff3b3b', W * 0.02); circ(c, W * 0.01, H * 0.59, H * 0.02, '#ff3b3b'); brilho(c, '#4cd964', W * 0.02); circ(c, W * 0.99, H * 0.59, H * 0.02, '#4cd964'); c.shadowBlur = 0;
    // corpo, cauda vertical e estabilizador
    oval(c, W * 0.5, H * 0.56, W * 0.12, H * 0.16, tom(cor, -0.1));
    poli(c, [W * 0.47, H * 0.5, W * 0.5, H * 0.06, W * 0.53, H * 0.06, W * 0.54, H * 0.5], cor);
    poli(c, [W * 0.47, H * 0.5, W * 0.5, H * 0.06, W * 0.505, H * 0.06, W * 0.5, H * 0.5], tom(cor, 0.35));
    caixa(c, W * 0.3, H * 0.36, W * 0.4, H * 0.035, H * 0.015, tom(cor, -0.25));
    // cabine com o piloto
    c.save(); c.beginPath(); c.ellipse ? c.ellipse(W * 0.5, H * 0.44, W * 0.075, H * 0.1, 0, 0, Math.PI * 2) : c.arc(W * 0.5, H * 0.44, W * 0.075, 0, Math.PI * 2);
    c.fillStyle = '#a9dcff'; c.fill(); c.clip(); piloto(c, emoji, W * 0.5, H * 0.46, H * 0.16); c.restore();
    circ(c, W * 0.5, H * 0.67, W * 0.025, '#2a2a30');
  }
  function jato(c, W, H, cor, emoji) {
    // asas em flecha
    c.fillStyle = grad(c, H * 0.45, H * 0.7, tom(cor, 0.2), tom(cor, -0.35));
    c.beginPath(); c.moveTo(W * 0.5, H * 0.46); c.lineTo(W * 0.98, H * 0.66); c.lineTo(W * 0.96, H * 0.7); c.lineTo(W * 0.5, H * 0.62); c.lineTo(W * 0.04, H * 0.7); c.lineTo(W * 0.02, H * 0.66); c.closePath(); c.fill();
    // duas caudas inclinadas
    poli(c, [W * 0.4, H * 0.5, W * 0.33, H * 0.1, W * 0.37, H * 0.1, W * 0.45, H * 0.5], tom(cor, -0.15));
    poli(c, [W * 0.6, H * 0.5, W * 0.67, H * 0.1, W * 0.63, H * 0.1, W * 0.55, H * 0.5], tom(cor, -0.15));
    oval(c, W * 0.5, H * 0.56, W * 0.13, H * 0.15, cor);
    c.save(); c.beginPath(); c.ellipse ? c.ellipse(W * 0.5, H * 0.43, W * 0.06, H * 0.09, 0, 0, Math.PI * 2) : c.arc(W * 0.5, H * 0.43, W * 0.06, 0, Math.PI * 2);
    c.fillStyle = '#ffd98a'; c.fill(); c.clip(); piloto(c, emoji, W * 0.5, H * 0.45, H * 0.14); c.restore();
    circ(c, W * 0.5, H * 0.62, W * 0.065, '#3a3a44'); circ(c, W * 0.5, H * 0.62, W * 0.045, '#15151b');   // bocal do motor
    brilho(c, '#ff2a2a', W * 0.02); circ(c, W * 0.04, H * 0.68, H * 0.02, '#ff3b3b'); circ(c, W * 0.96, H * 0.68, H * 0.02, '#4cd964'); c.shadowBlur = 0;
    c.fillStyle = '#fff'; c.font = '700 ' + Math.round(H * 0.06) + 'px ' + FONTE; c.textAlign = 'center'; c.fillText('★', W * 0.25, H * 0.64); c.fillText('★', W * 0.75, H * 0.64);
  }
  function helicoptero(c, W, H, cor, emoji) {
    // esquis
    linha(c, [W * 0.18, H * 0.95, W * 0.42, H * 0.95], '#333', H * 0.025); linha(c, [W * 0.58, H * 0.95, W * 0.82, H * 0.95], '#333', H * 0.025);
    linha(c, [W * 0.32, H * 0.78, W * 0.28, H * 0.95], '#333', H * 0.02); linha(c, [W * 0.68, H * 0.78, W * 0.72, H * 0.95], '#333', H * 0.02);
    // cabine-bolha
    c.fillStyle = grad(c, H * 0.2, H * 0.85, tom(cor, 0.3), tom(cor, -0.3));
    c.beginPath(); c.ellipse ? c.ellipse(W * 0.5, H * 0.55, W * 0.24, H * 0.27, 0, 0, Math.PI * 2) : c.arc(W * 0.5, H * 0.55, W * 0.24, 0, Math.PI * 2); c.fill();
    c.save(); c.beginPath(); c.ellipse ? c.ellipse(W * 0.5, H * 0.48, W * 0.16, H * 0.15, 0, 0, Math.PI * 2) : c.arc(W * 0.5, H * 0.48, W * 0.16, 0, Math.PI * 2);
    c.fillStyle = '#a9dcff'; c.fill(); c.clip(); piloto(c, emoji, W * 0.5, H * 0.5, H * 0.18); c.restore();
    // cauda vindo para a frente (vista de trás) e rotor de cauda
    circ(c, W * 0.5, H * 0.7, W * 0.06, tom(cor, -0.35)); circ(c, W * 0.5, H * 0.7, W * 0.035, tom(cor, -0.15));
    poli(c, [W * 0.5, H * 0.64, W * 0.56, H * 0.6, W * 0.57, H * 0.8, W * 0.5, H * 0.76], tom(cor, -0.3));   // aleta da cauda
    c.globalAlpha = 0.5; oval(c, W * 0.6, H * 0.7, W * 0.02, H * 0.11, '#e0e0e8'); c.globalAlpha = 1;   // rotor de cauda girando
    // mastro do rotor principal (as pás são desenhadas girando na corrida)
    caixa(c, W * 0.46, H * 0.22, W * 0.08, H * 0.08, H * 0.02, '#3a3a44'); caixa(c, W * 0.49, H * 0.12, W * 0.02, H * 0.12, H * 0.01, '#3a3a44');
    brilho(c, '#ff2a2a', W * 0.03); circ(c, W * 0.5, H * 0.84, H * 0.02, '#ff3b3b'); c.shadowBlur = 0;
  }

  var LISTA = [
    { id: 'classico', janela: { poli: [0.24, 0.43, 0.31, 0.16, 0.69, 0.16, 0.76, 0.43] }, cab: [0.5, 0.37, 0.3], grupo: 'terra', nome: ['Clássico', 'Classic'], w: 800, h: 640, vel: 1, curva: 1, desenhar: function (c, W, H, cor, e) { S.carroTras(c, W, H, cor, e, true); } },
    { id: 'conversivel', janela: { poli: [0.2, 0.44, 0.2, 0, 0.8, 0, 0.8, 0.44] }, cab: [0.5, 0.27, 0.24], semVidro: true, grupo: 'terra', nome: ['Conversível Rosa', 'Pink Convertible'], w: 820, h: 600, vel: 1.02, curva: 1.04, desenhar: conversivel },
    { id: 'gt', janela: { poli: [0.34, 0.4, 0.37, 0.25, 0.44, 0.19, 0.56, 0.19, 0.63, 0.25, 0.66, 0.4] }, cab: [0.5, 0.36, 0.23], grupo: 'terra', nome: ['GT Redondo', 'Round GT'], w: 820, h: 600, vel: 1.04, curva: 1.03, desenhar: gt },
    { id: 'super', janela: { poli: [0.38, 0.37, 0.41, 0.25, 0.59, 0.25, 0.62, 0.37] }, cab: [0.5, 0.35, 0.18], grupo: 'terra', nome: ['Superesportivo', 'Supercar'], w: 920, h: 560, vel: 1.08, curva: 0.95, desenhar: superesportivo },
    { id: 'kart', janela: { elipse: [0.5, 0.24, 0.184, 0.221] }, cab: [0.5, 0.25, 0.34], capacete: true, grupo: 'terra', nome: ['Kart', 'Kart'], w: 720, h: 600, vel: 0.96, curva: 1.12, desenhar: kart },
    { id: 'monstrao', janela: { poli: [0.29, 0.07, 0.71, 0.07, 0.71, 0.22, 0.29, 0.22] }, cab: [0.5, 0.17, 0.14], grupo: 'terra', nome: ['Monstrão', 'Monster Truck'], w: 960, h: 920, vel: 0.95, curva: 0.98, desenhar: monstrao },
    { id: 'moto', janela: { elipse: [0.5, 0.14, 0.18, 0.123] }, cab: [0.5, 0.15, 0.22], capacete: true, grupo: 'moto', nome: ['Moto', 'Motorbike'], w: 520, h: 760, vel: 1.03, curva: 1.1, desenhar: moto },
    { id: 'skate', semMotor: true, janela: { elipse: [0.5, 0.1, 0.3, 0.2] }, cab: [0.5, 0.1, 0.2], aberto: true, quadros: 12, bracos: true, grupo: 'moto', nome: ['Skate', 'Skateboard'], w: 560, h: 780, vel: 0.94, curva: 1.15, desenhar: skatista },
    { id: 'cavalo', semMotor: true, voz: 'cavalo', janela: { elipse: [0.5, 0.16, 0.3, 0.2] }, cab: [0.5, 0.16, 0.132], aberto: true, quadros: 12, cavalo: true, grupo: 'moto', nome: ['Cavalo', 'Horse'], w: 720, h: 1050, vel: 0.97, curva: 1.12, desenhar: function (c, W, H, cor, e, f, corpo) { CAV.desenhar(c, W, H, cor, e, f, corpo); } },
    { id: 'dino', semMotor: true, voz: 'dino', janela: { elipse: [0.5, 0.16, 0.3, 0.2] }, cab: [0.5, 0.16, 0.132], aberto: true, quadros: 12, cavalo: true, bicho: 'dino', grupo: 'moto', nome: ['Dinossauro', 'Dinosaur'], w: 720, h: 1050, vel: 0.98, curva: 1.08, desenhar: function (c, W, H, cor, e, f, corpo) { CAV.desenhar(c, W, H, cor, e, f, corpo, 'dino'); } },
    { id: 'galinha', janela: { elipse: [0.5, 0.27, 0.2, 0.2] }, cab: [0.5, 0.27, 0.15], aberto: true, quadros: 8, galinha: true, semMotor: true, voz: 'galo', grupo: 'moto', nome: ['Galinha', 'Hen'], w: 760, h: 900, vel: 0.95, curva: 1.12, desenhar: galinha },
    { id: 'pipoca', janela: { poli: [0.23, 0.46, 0.23, 0.15, 0.77, 0.15, 0.77, 0.46] }, cab: [0.5, 0.33, 0.17], aberto: true, quadros: 6, grupo: 'terra', nome: ['Carrinho de Pipoca', 'Popcorn Cart'], w: 760, h: 820, vel: 0.95, curva: 1.08, desenhar: carrinhoPipoca },
    { id: 'sorvete', janela: { poli: [0.2, 0.48, 0.2, 0.18, 0.8, 0.18, 0.8, 0.48] }, cab: [0.5, 0.33, 0.17], aberto: true, quadros: 8, grupo: 'terra', nome: ['Carrinho de Sorvete', 'Ice Cream Cart'], w: 760, h: 820, vel: 0.95, curva: 1.08, desenhar: carrinhoSorvete },
    { id: 'hamburguer', janela: { poli: [0.27, 0.46, 0.3, 0.24, 0.7, 0.24, 0.73, 0.46] }, cab: [0.5, 0.36, 0.18], grupo: 'terra', nome: ['Carro-Hambúrguer', 'Burger Car'], w: 840, h: 680, vel: 1.0, curva: 1.0, desenhar: carroHamburguer },
    { id: 'furgao', janela: { poli: [0.24, 0.42, 0.24, 0.17, 0.76, 0.17, 0.76, 0.42] }, cab: [0.5, 0.33, 0.2], grupo: 'terra', nome: ['Furgão de Surfe', 'Surf Van'], w: 860, h: 900, vel: 0.99, curva: 1.0, desenhar: furgao },
    { id: 'escolar', janela: { poli: [0.37, 0.43, 0.37, 0.21, 0.63, 0.21, 0.63, 0.43] }, cab: [0.5, 0.33, 0.17], quadros: 8, grupo: 'terra', nome: ['Ônibus Escolar', 'School Bus'], w: 980, h: 1000, vel: 0.95, curva: 0.96, desenhar: onibusEscolar },
    { id: 'pelucias', janela: { poli: [0.15, 0.61, 0.15, 0.19, 0.85, 0.19, 0.85, 0.61] }, cab: [0.5, 0.33, 0.17], quadros: 8, grupo: 'terra', nome: ['Caminhão de Pelúcias', 'Plush Claw Truck'], w: 960, h: 960, vel: 0.96, curva: 0.98, desenhar: caminhaoPelucia },
    { id: 'aviao', janela: { elipse: [0.5, 0.44, 0.075, 0.1] }, cab: [0.5, 0.47, 0.16], grupo: 'ar', nome: ['Aviãozinho', 'Little Plane'], w: 1500, h: 760, vel: 1, curva: 1.05, desenhar: aviao, helice: true },
    { id: 'jato', janela: { elipse: [0.5, 0.43, 0.06, 0.09] }, cab: [0.5, 0.46, 0.14], grupo: 'ar', nome: ['Jato', 'Jet'], w: 1300, h: 700, vel: 1.1, curva: 0.92, desenhar: jato, fogo: true },
    { id: 'treno', semMotor: true, janela: { elipse: [0.38, 0.36, 0.2, 0.2] }, cab: [0.38, 0.36, 0.17], aberto: true, quadros: 8, grupo: 'ar', nome: ['Trenó do Papai Noel', "Santa's Sleigh"], w: 1300, h: 1000, vel: 1.0, curva: 1.05, desenhar: treno },
    { id: 'arara', semMotor: true, voz: 'arara', janela: { elipse: [0.5, 0.32, 0.2, 0.2] }, cab: [0.5, 0.32, 0.14], aberto: true, quadros: 8, grupo: 'ar', nome: ['Arara Gigante', 'Giant Macaw'], w: 1300, h: 1000, vel: 1.04, curva: 1.08, desenhar: arara },
    { id: 'morcego', janela: { elipse: [0.5, 0.29, 0.2, 0.2] }, cab: [0.5, 0.29, 0.13], aberto: true, quadros: 8, dracula: true, abobora: true, semMotor: true, voz: 'morcego', grupo: 'ar', nome: ['Morcego (vira Drácula!)', 'Bat (turns into Dracula!)'], w: 1300, h: 1000, vel: 1.02, curva: 1.1, desenhar: morcego },
    { id: 'heli', janela: { elipse: [0.5, 0.48, 0.16, 0.15] }, cab: [0.5, 0.52, 0.21], grupo: 'ar', nome: ['Helicóptero', 'Helicopter'], w: 1100, h: 900, vel: 0.95, curva: 1.12, desenhar: helicoptero, rotor: true }
  ];
  var GRUPOS = [
    { id: 'terra', nome: ['🚗 Carros', '🚗 Cars'] },
    { id: 'moto', nome: ['🏍️ Moto, skate e montarias', '🏍️ Bike, skateboard and rides'] },
    { id: 'ar', nome: ['✈️ No céu (voa!)', '✈️ In the sky (flies!)'] }
  ];
  function achar(id) { for (var k = 0; k < LISTA.length; k++) if (LISTA[k].id === id) return LISTA[k]; return null; }
  function voa(id) { var v = achar(id); return !!(v && v.grupo === 'ar'); }

  var VruuumVeiculos = { LISTA: LISTA, GRUPOS: GRUPOS, achar: achar, voa: voa, tom: tom, bracosSkate: bracosSkate, giroCorpo: giroCorpo, asasGalinha: asasGalinha, dracula: dracula };
  if (typeof module !== 'undefined' && module.exports) module.exports = VruuumVeiculos;
  else raiz.VruuumVeiculos = VruuumVeiculos;
})(this);
