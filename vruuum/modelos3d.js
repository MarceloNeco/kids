/* Vruuum! — veículos em 3D de verdade (1.13.0): o dono reclamou que os veículos novos eram "só uma imagem": na curva
   não aparecia a lateral e no morro não dava para ver o teto. Aqui cada veículo é montado com peças 3D simples —
   caixas (6 faces, cada uma com a sua luz), rodas (cilindros de 12 lados), bolas esticadas — e visto por uma câmera
   que gira em volta dele (lado: -1 a 1, curva) e sobe ou desce (inclina: morro). As faces mais longe são pintadas
   primeiro e as de costas para a câmera nem são pintadas. Desenhos de cada face (vidro, letreiro, lanterna, listras)
   são feitos num quadrado de 100×100 que é esticado em cima da face.
   O piloto (cabeca.js) entra na lista no lugar do banco: vidro e teto que ficam na frente cobrem ele direitinho.
   Também mora aqui o Ovo correndo (Humpty Dumpty, cantiga inglesa do séc. XVIII, domínio público; desenho próprio). */
(function (raiz) {
  'use strict';
  var PI = Math.PI, LUZ = norm([-0.45, 0.8, -0.4]);
  function norm(v) { var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function hexRgb(h) { var n = parseInt(String(h).slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgb(c) { return 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')'; }
  function luzDe(cor, n) {   // a cor da face conforme ela olha para a luz (de cima, à esquerda, de trás)
    var k = 0.62 + 0.42 * Math.max(0, dot(n, LUZ)), c = hexRgb(cor);
    return rgb([Math.min(255, c[0] * k), Math.min(255, c[1] * k), Math.min(255, c[2] * k)]);
  }
  function tom(cor, f) { var c = hexRgb(cor); return '#' + c.map(function (v) { v = Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f)); return ('0' + v.toString(16)).slice(-2); }).join(''); }

  /* câmera em volta do veículo: atrás, um pouco acima (elev), girada de "gira" (curva) e mais alta ou baixa (morro).
     alt: quantas unidades cabem na altura do quadro; o chão debaixo do meio do veículo fica em CHAO da altura */
  function camera(x0, y0, W, H, gira, elev, alt, alvoY, alvoZ) {
    var D = 9, ce = Math.cos(elev), alvo = [0, alvoY, alvoZ || 0];   // alvoZ: veículo comprido gira em volta da parte de trás (onde está o piloto)
    var pos = [Math.sin(gira) * D * ce, alvoY + Math.sin(elev) * D, (alvoZ || 0) - Math.cos(gira) * D * ce];
    var f = norm(sub(alvo, pos)), r = norm(cross([0, 1, 0], f)), u = cross(f, r), k = H / alt * D;
    var c0 = { x: x0 + W / 2, y: y0 + H * 0.93 - alvoY * H / alt };
    return {
      pos: pos,
      pt: function (p) { var q = sub(p, pos), z = dot(q, f); return { x: c0.x + dot(q, r) / z * k, y: c0.y - dot(q, u) / z * k + (alvoY * H / alt) * 0, d: z, s: k / z }; },
      ve: function (centro, normal) { return dot(sub(pos, centro), normal) > 0; }
    };
  }
  // pinta um polígono (pontos já na tela) e, se tiver, o desenho da face esticado por cima
  function poligono(c, q, cor, desenho, alfa) {
    c.save(); if (alfa != null) c.globalAlpha = alfa;
    c.fillStyle = cor; c.beginPath(); q.forEach(function (p, k) { if (k) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); }); c.closePath(); c.fill();
    c.globalAlpha = 1;   // o desenho da face (crianças na janela, letreiro) sai inteiro mesmo em vidro
    if (desenho && q.length === 4) {   // quadrado 100×100 -> face (q0 = canto de cima à esquerda, q1 = de cima à direita, q3 = de baixo à esquerda)
      c.clip();
      c.transform((q[1].x - q[0].x) / 100, (q[1].y - q[0].y) / 100, (q[3].x - q[0].x) / 100, (q[3].y - q[0].y) / 100, q[0].x, q[0].y);
      desenho(c);
    }
    c.restore();
  }
  // caixa: centro, tamanho [largura, altura, comprimento], cor, desenhos por face (tras, frente, esq, dir, cima) e quais faces pular
  function caixa(cam, L, cen, tam, cor, des, op) {
    des = des || {}; op = op || {};
    var w = tam[0] / 2, h = tam[1] / 2, l = tam[2] / 2, P = function (x, y, z) { return [cen[0] + x * w, cen[1] + y * h, cen[2] + z * l]; };
    // cada face: normal e os 4 cantos na ordem (cima-esq, cima-dir, baixo-dir, baixo-esq) vistos de fora
    [['tras', [0, 0, -1], [P(-1, 1, -1), P(1, 1, -1), P(1, -1, -1), P(-1, -1, -1)]],
     ['frente', [0, 0, 1], [P(1, 1, 1), P(-1, 1, 1), P(-1, -1, 1), P(1, -1, 1)]],
     ['esq', [-1, 0, 0], [P(-1, 1, 1), P(-1, 1, -1), P(-1, -1, -1), P(-1, -1, 1)]],
     ['dir', [1, 0, 0], [P(1, 1, -1), P(1, 1, 1), P(1, -1, 1), P(1, -1, -1)]],
     ['cima', [0, 1, 0], [P(-1, 1, 1), P(1, 1, 1), P(1, 1, -1), P(-1, 1, -1)]],
     ['baixo', [0, -1, 0], [P(-1, -1, -1), P(1, -1, -1), P(1, -1, 1), P(-1, -1, 1)]]].forEach(function (fc) {
      if (op.sem && op.sem.indexOf(fc[0]) >= 0) return;
      var centro = mul(fc[2].reduce(function (a, b) { return add(a, b); }, [0, 0, 0]), 0.25);
      if (!cam.ve(centro, fc[1])) return;
      var q = fc[2].map(cam.pt), dm = (q[0].d + q[1].d + q[2].d + q[3].d) / 4;
      var corF = (op.cores && op.cores[fc[0]]) || cor;
      var alfaF = op.alfa != null && typeof op.alfa === 'object' ? op.alfa[fc[0]] : op.alfa;
      L.push({ d: dm + (op.vies || 0), f: function (c) { poligono(c, q, luzDe(corF, fc[1]), des[fc[0]], alfaF); } });
    });
  }
  // roda: cilindro de 12 lados deitado no eixo x (pneu escuro e calota clara virada para fora)
  function roda(cam, L, cen, r, larg, calota) {
    var N = 12, lado = cen[0] >= 0 ? 1 : -1, fora = [], dentro = [];
    for (var k = 0; k < N; k++) { var a = k / N * PI * 2; fora.push([cen[0] + lado * larg / 2, cen[1] + Math.cos(a) * r, cen[2] + Math.sin(a) * r]); dentro.push([cen[0] - lado * larg / 2, cen[1] + Math.cos(a) * r, cen[2] + Math.sin(a) * r]); }
    for (k = 0; k < N; k++) {
      var a2 = (k + 0.5) / N * PI * 2, n = [0, Math.cos(a2), Math.sin(a2)], quad = [fora[k], fora[(k + 1) % N], dentro[(k + 1) % N], dentro[k]];
      var cq = mul(quad.reduce(function (a, b) { return add(a, b); }, [0, 0, 0]), 0.25);
      if (!cam.ve(cq, n)) continue;
      (function (qd, nn) { var q = qd.map(cam.pt); L.push({ d: (q[0].d + q[2].d) / 2, f: function (c) { poligono(c, q, luzDe('#1d1d24', nn)); } }); })(quad, n);
    }
    var nf = [lado, 0, 0], cf = [cen[0] + lado * larg / 2, cen[1], cen[2]];
    if (cam.ve(cf, nf)) {
      var qf = fora.map(cam.pt), qc = fora.map(function (p) { return cam.pt(add(cf, mul(sub(p, cf), 0.55))); });
      L.push({ d: cam.pt(cf).d - 0.01, f: function (c) { poligono(c, qf, luzDe('#26262e', nf)); poligono(c, qc, luzDe(calota || '#c9ced6', nf)); } });
    }
  }
  // bola esticada (raios rx, ry, rz), com sombreado redondo
  function bola(cam, L, p, rx, ry, rz, cores, vies) {
    var q = cam.pt(p), e = [cam.pt(add(p, [rx, 0, 0])), cam.pt(add(p, [0, ry, 0])), cam.pt(add(p, [0, 0, rz]))];
    var ax = e.map(function (m) { return [m.x - q.x, m.y - q.y]; });
    var m11 = 0, m12 = 0, m22 = 0; ax.forEach(function (a) { m11 += a[0] * a[0]; m12 += a[0] * a[1]; m22 += a[1] * a[1]; });
    var tr = (m11 + m22) / 2, disc = Math.sqrt(Math.max(0, tr * tr - (m11 * m22 - m12 * m12)));
    var r1 = Math.sqrt(tr + disc), r2 = Math.sqrt(Math.max(0.01, tr - disc)), ang = 0.5 * Math.atan2(2 * m12, m11 - m22);
    L.push({ d: q.d + (vies || 0), f: function (c) {
      if (r1 < 0.3) return;
      c.save(); c.translate(q.x, q.y); c.rotate(ang); c.scale(r1, Math.max(0.3, r2));
      var g = c.createRadialGradient(-0.35, -0.45, 0.05, 0, 0, 1.02); g.addColorStop(0, cores[0]); g.addColorStop(0.6, cores[1]); g.addColorStop(1, cores[2]);
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, PI * 2); c.fill(); c.restore();
    } });
  }
  function tres(cor) { return [tom(cor, 0.35), cor, tom(cor, -0.4)]; }
  // pedaço de "cano" (braço, perna, cabo): uma sequência de bolinhas cobriria mal; aqui um quadrilátero afinando
  function cano(cam, L, a, b, ra, rb, cor, vies) {
    var p = cam.pt(a), q = cam.pt(b);
    L.push({ d: (p.d + q.d) / 2 + (vies || 0), f: function (c) {
      var dx = q.x - p.x, dy = q.y - p.y, d = Math.sqrt(dx * dx + dy * dy) || 0.001, nx = -dy / d, ny = dx / d, r1 = ra * p.s, r2 = rb * q.s;
      c.fillStyle = cor; c.beginPath(); c.moveTo(p.x + nx * r1, p.y + ny * r1); c.lineTo(q.x + nx * r2, q.y + ny * r2); c.lineTo(q.x - nx * r2, q.y - ny * r2); c.lineTo(p.x - nx * r1, p.y - ny * r1); c.closePath(); c.fill();
      c.beginPath(); c.arc(p.x, p.y, Math.max(0.3, r1), 0, PI * 2); c.arc(q.x, q.y, Math.max(0.3, r2), 0, PI * 2); c.fill();
    } });
  }
  // o piloto: entra na lista na altura do banco (o que estiver na frente dele cobre); r = raio da cabeça
  function piloto(cam, L, p, r, op) {
    var q = cam.pt(p), onde = { x: q.x, y: q.y, r: r * q.s };
    if (op.aqui) op.aqui(onde);
    L.push({ d: q.d, f: function (c) { if (op.cabeca) op.cabeca(c, q.x, q.y, r * q.s); } });
    return onde;
  }
  function sombra(cam, L, larg, comp) {
    var cs = [[-larg, 0, -comp], [larg, 0, -comp], [larg, 0, comp], [-larg, 0, comp]].map(cam.pt);
    L.push({ d: 1e9, f: function (c) { c.save(); c.globalAlpha = 0.3; c.fillStyle = '#000'; c.beginPath(); cs.forEach(function (p, k) { if (k) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); }); c.closePath(); c.fill(); c.restore(); } });
  }

  // ---------- desenhos das faces (num quadrado 100×100) ----------
  function texto(c, t, x, y, tam, cor, contorno) { c.font = '700 ' + tam + 'px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; if (contorno) { c.lineWidth = tam * 0.18; c.strokeStyle = contorno; c.lineJoin = 'round'; c.strokeText(t, x, y); } c.fillStyle = cor; c.fillText(t, x, y); }
  function emojiEm(c, e, x, y, tam) { c.font = tam + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, x, y); }
  function retangulo(c, x, y, w, h, cor) { c.fillStyle = cor; c.fillRect(x, y, w, h); }
  function circulo(c, x, y, r, cor) { c.fillStyle = cor; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); }
  function lanternas(c, cor) { [12, 88].forEach(function (x) { circulo(c, x, 72, 7, cor || '#ff2a2a'); circulo(c, x - 2, 70, 2.5, 'rgba(255,255,255,.7)'); }); }
  function placa(c, t) { retangulo(c, 38, 74, 24, 11, '#ffffff'); texto(c, t, 50, 80, 8, '#1a1446'); }
  function degrade(c, cores) { var g = c.createLinearGradient(0, 0, 0, 100); cores.forEach(function (cc, k) { g.addColorStop(k / (cores.length - 1), cc); }); c.fillStyle = g; c.fillRect(0, 0, 100, 100); }
  function espiral(c, x, y, r, cor) { c.strokeStyle = cor; c.lineWidth = 1.8; c.beginPath(); for (var k = 0; k <= 30; k++) { var a = k / 30 * PI * 5, rr = r * k / 30; if (k) c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else c.moveTo(x, y); } c.stroke(); }
  function brilhos(c, pts) { c.fillStyle = 'rgba(255,255,255,.95)'; pts.forEach(function (p) { c.beginPath(); c.moveTo(p[0], p[1] - 4); c.lineTo(p[0] + 1, p[1] - 1); c.lineTo(p[0] + 4, p[1]); c.lineTo(p[0] + 1, p[1] + 1); c.lineTo(p[0], p[1] + 4); c.lineTo(p[0] - 1, p[1] + 1); c.lineTo(p[0] - 4, p[1]); c.lineTo(p[0] - 1, p[1] - 1); c.closePath(); c.fill(); }); }

  // ---------- os modelos ----------
  var SURF = ['#ff5a36', '#ffb627', '#7bd03a', '#2f8fe0', '#1d5fc4'];
  var MODELOS = {
    furgao: { alt: 3.6, y: 1.05, larg: 1.05, comp: 2.3, montar: function (cam, L, cor, f, op) {
      var pintura = function (c) { degrade(c, SURF.slice(1)); };
      caixa(cam, L, [0, 0.8, 0], [2.0, 1.0, 4.4], '#2f8fe0', {   // parte de baixo, pintada
        tras: function (c) { pintura(c); texto(c, 'SURF', 50, 34, 30, '#ffd166', '#b5121b'); circulo(c, 12, 55, 8, '#ff4fd8'); circulo(c, 88, 55, 8, '#3dff9e'); retangulo(c, 36, 66, 28, 18, '#ffffff'); texto(c, 'SURF', 50, 75, 12, '#1a1446'); brilhos(c, [[20, 20], [82, 18]]); },
        esq: function (c) { pintura(c); texto(c, 'SURF', 62, 48, 34, '#2f8fe0', '#ffffff'); espiral(c, 18, 45, 12, '#ffffff'); brilhos(c, [[85, 20], [35, 80]]); },
        dir: function (c) { pintura(c); texto(c, 'SURF', 38, 48, 34, '#2f8fe0', '#ffffff'); espiral(c, 82, 45, 12, cor); brilhos(c, [[15, 20], [65, 80]]); }
      });
      // em cima: as janelas são vidro de verdade (dá para ver o piloto lá dentro), com as colunas pintadas
      caixa(cam, L, [0, 1.75, 0], [2.0, 0.9, 4.4], '#1b2433', { tras: function (c) { retangulo(c, 0, 0, 8, 100, '#ff8a2e'); retangulo(c, 92, 0, 8, 100, '#ff8a2e'); }, esq: function (c) { [0, 30, 70, 96].forEach(function (x) { retangulo(c, x, 0, 4, 100, '#ff8a2e'); }); }, dir: function (c) { [0, 26, 66, 96].forEach(function (x) { retangulo(c, x, 0, 4, 100, '#ff8a2e'); }); } }, { alfa: { tras: 0.4, esq: 0.55, dir: 0.55, frente: 0.55 }, sem: ['cima', 'baixo'] });
      caixa(cam, L, [0, 2.25, 0], [2.04, 0.12, 4.44], '#ff5a36', { cima: function (c) { degrade(c, ['#ff5a36', '#ffb627']); espiral(c, 30, 50, 12, '#ffffff'); } });   // teto
      piloto(cam, L, [0, 1.85, -0.4], 0.42, op);
      caixa(cam, L, [0, 0.38, -2.25], [2.1, 0.22, 0.2], '#c9ced6');   // para-choque
      [[-0.65, 2.36], [0.65, 2.36]].forEach(function (b) { caixa(cam, L, [b[0], b[1], 0], [0.08, 0.1, 3.2], '#3a3a44'); });   // rack
      bola(cam, L, [0, 2.48, 0], 0.42, 0.07, 2.4, tres('#ff4fa3'));   // prancha
      [[-1, -1.4], [1, -1.4], [-1, 1.4], [1, 1.4]].forEach(function (w) { roda(cam, L, [w[0] * 0.95, 0.42, w[1]], 0.42, 0.32); });
    } },
    escolar: { alt: 4.2, y: 1.2, z: -2.2, larg: 1.15, comp: 3.6, montar: function (cam, L, cor, f, op) {
      var am = '#ffc20e', pisca = f % 0.5 < 0.25;
      var listras = function (c) { retangulo(c, 0, 0, 100, 100, am); [18, 40].forEach(function (y) { retangulo(c, 0, y, 100, 5, '#1a1a1a'); }); };
      caixa(cam, L, [0, 0.95, 0], [2.4, 1.2, 7.4], am, {   // parte de baixo, amarela com faixas pretas
        tras: function (c) { listras(c); retangulo(c, 36, 0, 28, 100, '#d9a400'); lanternas(c); retangulo(c, 38, 72, 24, 14, '#ffffff'); texto(c, 'BUS', 50, 79, 10, '#1a1446'); },
        esq: function (c) { listras(c); texto(c, 'ESCOLAR', 50, 72, 18, '#1a1a1a'); }, dir: function (c) { listras(c); texto(c, 'ESCOLAR', 50, 72, 18, '#1a1a1a'); }
      });
      var janelas = function (c) { for (var k = 0; k < 6; k++) { retangulo(c, k * 16.6, 0, 3, 100, am); emojiEm(c, ['🧒', '👧', '👦', '🧒', '👧', '👦'][k], 9 + k * 16.6, 58 + Math.sin(f * PI * 2 + k) * 6, 24); } retangulo(c, 0, 0, 100, 8, am); retangulo(c, 0, 92, 100, 8, am); };
      caixa(cam, L, [0, 2.0, 0], [2.4, 0.9, 7.4], '#26313f', { esq: janelas, dir: janelas, tras: function (c) { retangulo(c, 0, 0, 14, 100, am); retangulo(c, 86, 0, 14, 100, am); retangulo(c, 34, 0, 4, 100, am); retangulo(c, 62, 0, 4, 100, am); retangulo(c, 0, 0, 100, 8, am); emojiEm(c, '🧒', 24, 58, 30); emojiEm(c, '👧', 76, 58, 30); } }, { alfa: { tras: 0.45, esq: 0.6, dir: 0.6, frente: 0.6 }, sem: ['cima', 'baixo'] });
      caixa(cam, L, [0, 2.5, 0], [2.44, 0.14, 7.44], '#ffd84a', { tras: function (c) { texto(c, 'ESCOLAR', 50, 50, 70, '#1a1a1a'); } });   // teto
      piloto(cam, L, [0, 2.05, -2.9], 0.42, op);   // no último banco, olhando pela janela de trás
      caixa(cam, L, [0, 0.42, -3.75], [2.5, 0.26, 0.18], '#2a2a30');
      [[-0.85, pisca], [0.85, !pisca]].forEach(function (l) { bola(cam, L, [l[0], 2.62, -3.65], 0.16, 0.16, 0.08, l[1] ? ['#ffb3b3', '#ff2a2a', '#a00'] : ['#7a3a3a', '#4a1a1a', '#2a0a0a'], -0.05); });
      var abre = Math.max(0, Math.sin(f * PI * 2));   // placa de PARE abrindo do lado esquerdo
      caixa(cam, L, [-1.25 - abre * 0.45, 1.45, 2.2], [0.06 + abre * 0.9, 0.62, 0.62 * (1 - abre * 0.9) + 0.06], '#e63946', { esq: function (c) { texto(c, 'PARE', 50, 52, 24, '#ffffff'); }, tras: function (c) { texto(c, 'PARE', 50, 52, 24, '#ffffff'); } });
      [[-1, -2.5], [1, -2.5], [-1, 2.3], [1, 2.3]].forEach(function (w) { roda(cam, L, [w[0] * 1.05, 0.48, w[1]], 0.48, 0.36); });
    } },
    pelucias: { alt: 4.0, y: 1.2, z: -1.0, larg: 1.15, comp: 3.2, montar: function (cam, L, cor, f, op) {
      var rosa = '#ff3d8b';
      caixa(cam, L, [0, 0.7, 0], [2.3, 0.6, 6.0], rosa, { esq: function (c) { for (var k = 0; k < 8; k++) { c.fillStyle = cor; c.beginPath(); c.moveTo(6 + k * 12, 100); c.lineTo(11 + k * 12, 20); c.lineTo(16 + k * 12, 100); c.fill(); } }, dir: function (c) { for (var k = 0; k < 8; k++) { c.fillStyle = cor; c.beginPath(); c.moveTo(6 + k * 12, 100); c.lineTo(11 + k * 12, 20); c.lineTo(16 + k * 12, 100); c.fill(); } }, tras: function (c) { lanternas(c); placa(c, '🧸'); } });
      caixa(cam, L, [0, 1.6, 1.9], [2.3, 1.2, 2.0], rosa, { frente: function (c) { retangulo(c, 10, 10, 80, 50, '#26313f'); } });   // cabine lá na frente
      // a vitrine (máquina de pegar bichinho): vidro, as pelúcias balançando, a garra passeando
      var CORES_P = ['#ffd23f', '#7cc8ff', '#ff8fab', '#ffffff', '#c08552', '#8be28b', '#b388eb', '#7cc8ff', '#ffd23f'];
      for (var k = 0; k < 9; k++) { var px = -0.7 + (k % 3) * 0.7, pz = -2.2 + Math.floor(k / 3) * 1.1, bal = Math.sin(f * PI * 2 + k * 1.7) * 0.06; bola(cam, L, [px, 1.3 + bal, pz], 0.32, 0.32, 0.32, tres(CORES_P[k])); bola(cam, L, [px, 1.68 + bal, pz], 0.2, 0.2, 0.2, tres(CORES_P[k])); }
      var gx = Math.sin(f * PI * 2) * 0.7; caixa(cam, L, [gx, 2.45, -1.2], [0.05, 0.6, 0.05], '#9aa0a6'); bola(cam, L, [gx, 2.12, -1.2], 0.14, 0.1, 0.14, tres('#c9ced6'));
      piloto(cam, L, [0, 2.0, -0.2], 0.4, op);
      caixa(cam, L, [0, 1.85, -1.1], [2.3, 1.7, 4.0], '#dff4ff', null, { alfa: 0.28, sem: ['baixo'], vies: -0.2 });   // o vidro (transparente)
      caixa(cam, L, [0, 2.78, -1.1], [2.5, 0.16, 4.2], '#ffffff', { cima: function (c) { for (var q = 0; q < 10; q++) retangulo(c, q * 10, 0, 5, 100, '#e8336f'); }, tras: function (c) { for (var q = 0; q < 10; q++) retangulo(c, q * 10, 0, 5, 100, '#e8336f'); }, esq: function (c) { for (var q = 0; q < 10; q++) retangulo(c, q * 10, 0, 5, 100, '#e8336f'); }, dir: function (c) { for (var q = 0; q < 10; q++) retangulo(c, q * 10, 0, 5, 100, '#e8336f'); } });   // toldo listrado
      [-1, 1].forEach(function (l) { caixa(cam, L, [l * 1.25, 2.3, 2.6], [0.18, 2.2, 0.18], '#d6dbe2', { tras: function (c) { for (var q = 0; q < 6; q++) circulo(c, 50, 10 + q * 16, 12, '#1b1b22'); } }); });   // chaminés de bolinha
      [[-1, -2.2], [1, -2.2], [-1, 2.1], [1, 2.1]].forEach(function (w) { roda(cam, L, [w[0] * 1.08, 0.45, w[1]], 0.45, 0.34, '#f4f4f4'); });
    } },
    pipoca: { alt: 3.3, y: 0.9, larg: 0.9, comp: 1.4, montar: function (cam, L, cor, f, op) {
      var listras = function (c) { for (var k = 0; k < 10; k++) retangulo(c, k * 10, 0, 5, 100, k % 2 ? '#ffffff' : '#ff3b4f'); };
      caixa(cam, L, [0, 0.85, 0], [1.6, 0.9, 2.4], '#ff3b4f', { tras: function (c) { listras(c); retangulo(c, 15, 30, 70, 30, '#ffd166'); texto(c, 'PIPOCA', 50, 46, 15, '#c2102a'); }, esq: function (c) { listras(c); texto(c, 'PIPOCA', 50, 50, 18, '#c2102a', '#ffd166'); }, dir: function (c) { listras(c); texto(c, 'PIPOCA', 50, 50, 18, '#c2102a', '#ffd166'); } });
      for (var k = 0; k < 14; k++) { var pul = Math.abs(Math.sin(f * PI * 2 + k)) * (k % 3 ? 0.04 : 0.22); bola(cam, L, [-0.5 + (k % 4) * 0.33, 1.45 + Math.floor(k / 4) * 0.12 + pul, 0.2 + ((k * 7) % 5) * 0.15], 0.11, 0.1, 0.11, ['#ffffff', '#fff6dc', '#e8d9b0']); }
      caixa(cam, L, [0, 1.75, 0.55], [1.3, 0.95, 1.1], '#fff5e0', null, { alfa: 0.3, sem: ['baixo'], vies: -0.2 });   // vidro da máquina
      caixa(cam, L, [0, 2.28, 0.55], [1.5, 0.1, 1.3], '#ff3b4f', { cima: listras, tras: listras });
      piloto(cam, L, [0, 1.75, -0.75], 0.4, op);
      [[-1, -0.8], [1, -0.8], [-1, 0.8], [1, 0.8]].forEach(function (w) { roda(cam, L, [w[0] * 0.82, 0.32, w[1]], 0.32, 0.2, '#f4f4f4'); });
    } },
    sorvete: { alt: 3.6, y: 0.9, larg: 0.9, comp: 1.4, montar: function (cam, L, cor, f, op) {
      var lado = function (c) { degrade(c, ['#c4eeff', '#5cc8f0']); [['#ff8fab', 25], ['#fff3b0', 50], ['#b388eb', 75]].forEach(function (b) { circulo(c, b[1], 40, 10, b[0]); }); texto(c, 'SORVETE', 50, 76, 14, '#ff4fa3'); };
      caixa(cam, L, [0, 0.85, 0], [1.6, 0.9, 2.4], '#5cc8f0', { tras: lado, esq: lado, dir: lado });
      cano(cam, L, [0, 1.3, 0.3], [0, 2.6, 0.3], 0.03, 0.03, '#e9e4f2');
      for (var k = 0; k < 8; k++) {   // guarda-sol de 8 gomos, listrado
        var a0 = k / 8 * PI * 2 + f * PI, a1 = (k + 1) / 8 * PI * 2 + f * PI, topo = [0, 2.75, 0.3], p0 = [Math.cos(a0) * 1.25, 2.35, 0.3 + Math.sin(a0) * 1.25], p1 = [Math.cos(a1) * 1.25, 2.35, 0.3 + Math.sin(a1) * 1.25];
        (function (t0, q0, q1, cc) { var q = [t0, q0, q1].map(cam.pt); L.push({ d: (q[1].d + q[2].d) / 2 - 0.4, f: function (c) { poligono(c, q, cc); } }); })(topo, p0, p1, k % 2 ? '#ffffff' : '#ff4fa3');
      }
      cano(cam, L, [0.55, 1.3, 0.8], [0.55, 1.8, 0.8], 0.02, 0.14, '#e9b56a');   // casquinha gigante
      bola(cam, L, [0.55, 1.95, 0.8], 0.2, 0.18, 0.2, tres('#ff8fab')); bola(cam, L, [0.55, 2.2, 0.8], 0.16, 0.15, 0.16, tres('#fff3b0')); bola(cam, L, [0.55, 2.38, 0.8], 0.06, 0.06, 0.06, tres('#e63946'));
      piloto(cam, L, [0, 1.7, -0.7], 0.4, op);
      [[-1, -0.8], [1, -0.8], [-1, 0.8], [1, 0.8]].forEach(function (w) { roda(cam, L, [w[0] * 0.82, 0.32, w[1]], 0.32, 0.2, '#f4f4f4'); });
    } },
    hamburguer: { alt: 3.2, y: 0.9, larg: 1.1, comp: 2.0, montar: function (cam, L, cor, f, op) {
      bola(cam, L, [0, 0.62, 0], 1.25, 0.28, 1.9, tres('#e0a04a'));   // pão de baixo
      bola(cam, L, [0, 0.9, 0], 1.32, 0.12, 1.98, tres('#4caf50'), -0.02);   // alface
      bola(cam, L, [0, 1.02, 0], 1.28, 0.2, 1.92, tres('#6b3a1e'), -0.04);   // carne
      bola(cam, L, [0, 1.16, 0], 1.35, 0.06, 2.0, tres('#ffd23f'), -0.06);   // queijo
      bola(cam, L, [0, 1.32, 0], 1.3, 0.85, 1.95, tres('#f0b05a'), -0.08);   // pão de cima (teto)
      [[-0.5, 1.95, -0.6], [0.4, 2.0, -0.3], [0, 2.1, 0.4], [-0.6, 1.85, 0.6], [0.7, 1.8, 0.5], [0.2, 1.9, -0.9], [-0.9, 1.6, -0.2], [0.9, 1.65, -0.7]].forEach(function (g) { bola(cam, L, g, 0.07, 0.03, 0.1, ['#ffffff', '#fff3d6', '#e0cfa0'], -0.12); });
      piloto(cam, L, [0, 2.15, -0.3], 0.42, op);   // o piloto aparece numa escotilha no alto do pão
      bola(cam, L, [0, 2.0, -0.3], 0.5, 0.08, 0.5, tres('#26313f'), 0.02);
      [[-1, -1.25], [1, -1.25], [-1, 1.25], [1, 1.25]].forEach(function (w) { roda(cam, L, [w[0] * 1.05, 0.42, w[1]], 0.42, 0.3); });
    } },
    // o Ovo correndo, sem carro (Humpty Dumpty, cantiga antiga; desenho próprio): corpo de ovo, gravata-borboleta,
    // bracinhos balançando, perninhas correndo e tênis. Ele mesmo é o piloto (vira para olhar com a cara dele).
    ovo: { alt: 3.4, y: 1.3, larg: 0.7, comp: 0.7, semPiloto: true, montar: function (cam, L, cor, f, op) {
      var a = Math.sin(f * PI * 2), pulo = Math.abs(Math.cos(f * PI * 2)) * 0.12;
      [-1, 1].forEach(function (l) {
        var quad = [l * 0.3, 1.0 + pulo, 0], pe = [l * 0.32, 0.12 + Math.max(0, l * a) * 0.35, l * a * 0.55];
        cano(cam, L, quad, pe, 0.09, 0.07, '#f4f1e8');
        caixa(cam, L, [pe[0], pe[1] - 0.02, pe[2] + 0.1], [0.3, 0.2, 0.5], '#ff4fa3', { tras: function (c) { retangulo(c, 0, 60, 100, 40, '#ffffff'); } });
        var omb = [l * 0.62, 1.95 + pulo, 0], mao = [l * 0.85, 1.45 + pulo, -l * a * 0.5];
        cano(cam, L, omb, mao, 0.07, 0.06, '#f4f1e8'); bola(cam, L, mao, 0.12, 0.12, 0.12, ['#ffffff', '#f0f0f0', '#c8c8c8']);
      });
      bola(cam, L, [0, 1.75 + pulo, 0], 0.72, 0.95, 0.72, ['#fffdf5', '#f6ecd0', '#d6c69c']);   // o ovo
      if (op.giro && Math.cos(op.giro) < 0.2) {   // virou para olhar: a carinha (olhos, sorrisão)
        var ang = op.giro, fx = Math.sin(ang) * 0.68, fz = Math.cos(ang) * 0.68;
        [-0.2, 0.2].forEach(function (d) { bola(cam, L, [fx * 0.9 + d * Math.cos(ang), 2.0 + pulo, fz * 0.9 - d * Math.sin(ang)], 0.1, 0.13, 0.05, ['#ffffff', '#ffffff', '#ddd'], -0.3); bola(cam, L, [fx * 0.95 + d * Math.cos(ang), 2.0 + pulo, fz * 0.95 - d * Math.sin(ang)], 0.05, 0.07, 0.03, ['#333', '#111', '#000'], -0.32); });
        bola(cam, L, [fx * 0.95, 1.7 + pulo, fz * 0.95], 0.22, 0.08, 0.04, ['#e85d75', '#c2304a', '#801a2a'], -0.31);
      }
      bola(cam, L, [0, 1.32 + pulo, -0.05], 0.7, 0.12, 0.7, tres('#3a86ff'), -0.05);   // cinto
      [-1, 1].forEach(function (l) { bola(cam, L, [l * 0.14, 1.12 + pulo, -0.62], 0.13, 0.08, 0.04, tres('#e63946'), -0.1); });   // gravata-borboleta (aparece de lado)
    } },
    // galinha branca em 3D: corpo fofo, rabo de penas, asas (abertas e batendo quando pula), pescoço, crista e bico, perninhas correndo
    galinha: { alt: 3.6, y: 1.2, larg: 0.8, comp: 1.0, montar: function (cam, L, cor, f, op) {
      var a = Math.sin(f * PI * 2), voo = op.voo || 0, bat = Math.sin((op.t || 0) * 26), BR = ['#ffffff', '#f2f2f8', '#c9c9d8'];
      [-1, 1].forEach(function (l) {
        var quad = [l * 0.28, 0.85, 0.05], pe = [l * 0.3, 0.08 + (voo ? 0.35 : Math.max(0, l * a) * 0.3), (voo ? -0.2 : l * a * 0.5)];
        cano(cam, L, quad, pe, 0.06, 0.05, '#f4a300');
        [-0.5, 0, 0.5].forEach(function (d) { cano(cam, L, pe, add(pe, [d * 0.18, 0, 0.22]), 0.035, 0.02, '#f4a300'); });
      });
      bola(cam, L, [0, 1.25, 0], 0.78, 0.62, 0.95, BR);   // corpo
      [[-0.3, 0.12], [0, 0], [0.3, 0.12]].forEach(function (r) { bola(cam, L, [r[0], 1.65 + r[1], -0.85], 0.17, 0.45, 0.14, BR, -0.05); });   // rabo
      [-1, 1].forEach(function (l) {   // asas: dobradas de lado; pulando, abertas e batendo
        if (voo) { var ponta = [l * 1.6, 1.55 + bat * 0.45, -0.1]; cano(cam, L, [l * 0.6, 1.4, 0], ponta, 0.3, 0.1, '#f7f7fb', -0.1); cano(cam, L, [l * 0.6, 1.3, -0.2], add(ponta, [0, -0.15, -0.25]), 0.25, 0.08, '#e8e8f0', -0.08); }
        else bola(cam, L, [l * 0.72, 1.3, -0.05], 0.12, 0.38, 0.6, BR, -0.05);
      });
      cano(cam, L, [0, 1.6, 0.6], [0, 2.2, 0.9], 0.3, 0.24, '#ffffff');   // pescoço
      bola(cam, L, [0, 2.32, 0.95], 0.3, 0.3, 0.32, BR);   // cabeça
      [-0.12, 0, 0.12].forEach(function (d, k) { bola(cam, L, [0, 2.66 - Math.abs(d) * 0.4, 0.92 + d], 0.06, 0.13, 0.08, tres('#e63946'), -0.02); });   // crista
      bola(cam, L, [0, 2.3, 1.28], 0.08, 0.06, 0.16, tres('#f4a300'), -0.02);   // bico
      bola(cam, L, [0, 2.12, 1.15], 0.06, 0.12, 0.05, tres('#e63946'), -0.01);   // barbela
      [-1, 1].forEach(function (l) { bola(cam, L, [l * 0.24, 2.4, 1.08], 0.05, 0.06, 0.04, ['#333', '#111', '#000'], -0.02); });
      bola(cam, L, [0, 1.95, -0.05], 0.22, 0.24, 0.17, tres(cor), -0.2);   // quem monta: o corpo
      piloto(cam, L, [0, 2.38, -0.1], 0.36, op);
    } }
  };

  function montar(id, x0, y0, W, H, cor, fase, lado, inclina, op) {
    var m = MODELOS[id], L = [], giro = Math.max(-1.2, Math.min(1.2, lado || 0)) * 0.62 + (op.orbita || 0);
    var cam = camera(x0, y0, W, H, giro, 0.3 - (inclina || 0) * 0.6, m.alt, m.y, m.z);
    sombra(cam, L, m.larg, m.comp);
    var o = { cabeca: op.cabeca, giro: op.giroCabeca, aqui: op.aqui, voo: op.voo, t: op.t };
    m.montar(cam, L, cor || '#ff4fa3', ((fase || 0) % 1 + 1) % 1, o);
    L.sort(function (a, b) { return b.d - a.d; });
    return L;
  }
  // ao vivo (corrida e garagem): lado = curva, inclina = morro (> 0 subindo); op.cabeca(c, x, y, r) desenha o piloto
  function vivo(c, id, x0, y0, W, H, cor, fase, lado, inclina, op) {
    var L = montar(id, x0, y0, W, H, cor, fase, lado, inclina, op || {});
    for (var k = 0; k < L.length; k++) L[k].f(c);
  }
  // quadro parado de costas (rivais e miniatura da garagem)
  function desenhar(id) { return function (c, W, H, cor, emoji, fase) { vivo(c, id, 0, 0, W, H, cor, fase, 0, 0, {}); }; }

  // onde fica a cabeça do piloto (para os quadros parados dos rivais e da garagem)
  function cabeca(id, x0, y0, W, H, fase, lado, inclina) { var onde = null; montar(id, x0, y0, W, H, '#ff4fa3', fase, lado, inclina, { aqui: function (o) { onde = o; } }); return onde; }

  var VruuumModelos = { MODELOS: MODELOS, vivo: vivo, desenhar: desenhar, montar: montar, cabeca: cabeca };
  if (typeof module !== 'undefined' && module.exports) module.exports = VruuumModelos;
  else raiz.VruuumModelos = VruuumModelos;
})(this);
