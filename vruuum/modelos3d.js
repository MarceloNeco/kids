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
    var w = tam[0] / 2, h = tam[1] / 2, l = tam[2] / 2;
    solido(cam, L, function (x, y, z) { return [cen[0] + x * w, cen[1] + y * h, cen[2] + z * l]; }, cor, des, op);
  }
  /* tronco (1.15.0): caixa com o topo menor que a base e empurrado para a frente ou para trás — cabine de carro com
     vidros inclinados, capô e para-brisa deitados. base [largura, comprimento], topo [largura, comprimento, avanço] */
  function tronco(cam, L, cen, base, topo, alt, cor, des, op) {
    solido(cam, L, function (x, y, z) {
      var t = y > 0, w = (t ? topo[0] : base[0]) / 2, l = (t ? topo[1] : base[1]) / 2;
      return [cen[0] + x * w, cen[1] + y * alt / 2, cen[2] + z * l + (t ? topo[2] || 0 : 0)];
    }, cor, des, op);
  }
  // sólido de 8 cantos P(±1, ±1, ±1); a luz de cada face vem da sua inclinação de verdade
  function solido(cam, L, P, cor, des, op) {
    des = des || {}; op = op || {};
    // cada face: normal e os 4 cantos na ordem (cima-esq, cima-dir, baixo-dir, baixo-esq) vistos de fora
    [['tras', [0, 0, -1], [P(-1, 1, -1), P(1, 1, -1), P(1, -1, -1), P(-1, -1, -1)]],
     ['frente', [0, 0, 1], [P(1, 1, 1), P(-1, 1, 1), P(-1, -1, 1), P(1, -1, 1)]],
     ['esq', [-1, 0, 0], [P(-1, 1, 1), P(-1, 1, -1), P(-1, -1, -1), P(-1, -1, 1)]],
     ['dir', [1, 0, 0], [P(1, 1, -1), P(1, 1, 1), P(1, -1, 1), P(1, -1, -1)]],
     ['cima', [0, 1, 0], [P(-1, 1, 1), P(1, 1, 1), P(1, 1, -1), P(-1, 1, -1)]],
     ['baixo', [0, -1, 0], [P(-1, -1, -1), P(1, -1, -1), P(1, -1, 1), P(-1, -1, 1)]]].forEach(function (fc) {
      if (op.sem && op.sem.indexOf(fc[0]) >= 0) return;
      var centro = mul(fc[2].reduce(function (a, b) { return add(a, b); }, [0, 0, 0]), 0.25), p = fc[2];
      var nr = norm(cross(sub(p[1], p[0]), sub(p[3], p[0])));
      if (dot(nr, nr) > 0.5) fc[1] = nr;   // face inclinada (tronco): a normal de verdade
      if (!cam.ve(centro, fc[1])) return;
      var q = fc[2].map(cam.pt), dm = (q[0].d + q[1].d + q[2].d + q[3].d) / 4;
      var corF = (op.cores && op.cores[fc[0]]) || cor;
      var alfaF = op.alfa != null && typeof op.alfa === 'object' ? op.alfa[fc[0]] : op.alfa;
      L.push({ d: dm + (op.vies || 0), f: function (c) { poligono(c, q, luzDe(corF, fc[1]), des[fc[0]], alfaF); } });
    });
  }
  /* casco (1.16.0): carroceria arredondada feita de fatias ao longo do carro (como as cavernas de um barco). Cada fatia
     { z, y (meio), w e h (meia largura e meia altura), n (quanto mais alto, mais quadrada) } vira um anel de 16 pontos;
     anéis vizinhos são ligados por faces pequenas, cada uma com a sua luz e um brilho de verniz. pinta(k, p) pode
     trocar a cor de uma face (faixa, friso); as pontas (trás e frente) são tampadas. */
  function casco(cam, L, fatias, cor, op) {
    op = op || {};
    var M = 16, an = fatias.map(function (f) {
      var r = [], n = f.n || 3;
      for (var k = 0; k < M; k++) { var a = k / M * PI * 2, cs = Math.cos(a), sn = Math.sin(a); r.push([(f.x || 0) + f.w * (cs < 0 ? -1 : 1) * Math.pow(Math.abs(cs), 2 / n), f.y + f.h * (sn < 0 ? -1 : 1) * Math.pow(Math.abs(sn), 2 / n), f.z]); }
      return r;
    });
    function face(q, centro, eixo, corF) {
      var nr = norm(cross(sub(q[1], q[0]), sub(q[q.length - 1], q[0])));
      if (dot(nr, sub(centro, eixo)) < 0) nr = mul(nr, -1);
      if (!cam.ve(centro, nr)) return;
      var pt = q.map(cam.pt), dm = 0; pt.forEach(function (p) { dm += p.d; }); dm /= pt.length;
      var vista = norm(sub(cam.pos, centro)), meio = norm(add(vista, LUZ)), brilho = Math.pow(Math.max(0, dot(nr, meio)), 24) * 0.55;
      var base = hexRgb(luzHex(corF, nr)), c3 = rgb(base.map(function (v) { return Math.min(255, v + (255 - v) * brilho); }));
      L.push({ d: dm + (op.vies || 0), f: function (c) { poligono(c, pt, c3, null, op.alfa); } });
    }
    for (var i = 0; i < an.length - 1; i++) for (var k = 0; k < M; k++) {
      var q = [an[i][k], an[i][(k + 1) % M], an[i + 1][(k + 1) % M], an[i + 1][k]];
      var cq = mul(q.reduce(function (a, b) { return add(a, b); }, [0, 0, 0]), 0.25);
      var f0 = fatias[i], f1 = fatias[i + 1], eixo = [((f0.x || 0) + (f1.x || 0)) / 2, (f0.y + f1.y) / 2, cq[2]];
      face(q, cq, eixo, (op.pinta && op.pinta(k, cq)) || cor);
    }
    [0, an.length - 1].forEach(function (i) {   // tampas
      var ft = fatias[i], centro = [ft.x || 0, ft.y, ft.z], fora = add(centro, [0, 0, i ? 1 : -1]);
      face(an[i].slice(), centro, sub(centro, sub(fora, centro)), (op.tampa && op.tampa(i)) || cor);
    });
  }
  /* chapa (1.16.0): peça fina dos dois lados (asa, cauda, capa, pá de hélice). verso: a cor do outro lado (capa
     preta por fora e vermelha por dentro) */
  function chapa(cam, L, pts, cor, op) {
    op = op || {};
    var centro = mul(pts.reduce(function (a, b) { return add(a, b); }, [0, 0, 0]), 1 / pts.length);
    var nr = norm(cross(sub(pts[1], pts[0]), sub(pts[pts.length - 1], pts[0]))), frente = cam.ve(centro, nr);
    if (!frente) nr = mul(nr, -1);
    var q = pts.map(cam.pt), dm = 0; q.forEach(function (p) { dm += p.d; }); dm /= q.length;
    var c3 = luzDe(!frente && op.verso ? op.verso : cor, nr);
    L.push({ d: dm + (op.vies || 0), f: function (c) { poligono(c, q, c3, null, op.alfa); } });
  }
  // disco girando (hélice, rotor): um borrão claro e transparente
  function disco(cam, L, centro, ex, ey, cor, alfa, vies) {
    var pts = []; for (var k = 0; k < 16; k++) { var a = k / 16 * PI * 2; pts.push(add(centro, add(mul(ex, Math.cos(a)), mul(ey, Math.sin(a))))); }
    chapa(cam, L, pts, cor, { alfa: alfa, vies: vies });
  }
  function luzHex(cor, n) { var k = 0.62 + 0.42 * Math.max(0, dot(n, LUZ)), c = hexRgb(cor); return '#' + c.map(function (v) { return ('0' + Math.min(255, Math.round(v * k)).toString(16)).slice(-2); }).join(''); }
  // roda: cilindro de 12 lados deitado no eixo x (pneu escuro e calota clara virada para fora)
  var emBarco = false;   // no rio (1.17.0) as rodas recolhem e entram as boias (montar)
  function roda(cam, L, cen, r, larg, calota) {
    if (emBarco) return;
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
  function piloto(cam, L, p, r, op, vies) {   // vies < 0: pinta depois (carro baixo: a tampa de trás não tapa)
    var q = cam.pt(p), onde = { x: q.x, y: q.y, r: r * q.s };
    if (op.aqui) op.aqui(onde);
    L.push({ d: q.d + (vies || 0), f: function (c) { if (op.cabeca) op.cabeca(c, q.x, q.y, r * q.s); } });
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
    } },

    // ---------- 1.15.0: os carros antigos e o trenó também em 3D (dono: "o trenó e os carros também podiam aparecer a lateral") ----------
    classico: { alt: 3.3, y: 0.95, larg: 1.05, comp: 2.25, montar: function (cam, L, cor, f, op) {
      var esc = tom(cor, -0.35), cla = tom(cor, 0.3);
      var lado = function (c) { retangulo(c, 0, 30, 100, 6, cla); retangulo(c, 44, 8, 2, 70, esc); retangulo(c, 34, 44, 8, 3, '#e9e9f0'); };
      caixa(cam, L, [0, 0.72, 0], [2.0, 0.66, 4.3], cor, {
        tras: function (c) { [6, 78].forEach(function (x) { retangulo(c, x, 22, 16, 22, '#e01e1e'); retangulo(c, x + 2, 24, 12, 6, '#ffb3b3'); }); placa(c, 'VRUUM'); retangulo(c, 30, 30, 40, 4, cla); },
        frente: function (c) { [16, 84].forEach(function (x) { circulo(c, x, 32, 11, '#fff7c2'); }); retangulo(c, 34, 24, 32, 20, '#2a2a30'); },
        esq: lado, dir: lado
      });
      var pil = function (c) { retangulo(c, 0, 0, 7, 100, cor); retangulo(c, 93, 0, 7, 100, cor); };
      tronco(cam, L, [0, 1.45, -0.3], [1.86, 2.5], [1.56, 1.6, -0.1], 0.8, '#8fcbec', { tras: pil, frente: pil, esq: pil, dir: pil, cima: function (c) { retangulo(c, 0, 0, 100, 100, cor); retangulo(c, 0, 0, 100, 12, cla); } }, { alfa: { tras: 0.45, frente: 0.45, esq: 0.5, dir: 0.5 }, sem: ['baixo'] });
      piloto(cam, L, [0, 1.42, -0.45], 0.4, op);
      [-2.2, 2.2].forEach(function (z) { caixa(cam, L, [0, 0.45, z], [2.08, 0.18, 0.14], '#d9dde3'); });   // para-choques cromados
      [[-1, -1.35], [1, -1.35], [-1, 1.35], [1, 1.35]].forEach(function (w) { roda(cam, L, [w[0] * 0.95, 0.4, w[1]], 0.4, 0.3); });
    } },
    gt: { alt: 3.1, y: 0.8, larg: 1.1, comp: 2.3, montar: function (cam, L, cor, f, op) {
      var esc = tom(cor, -0.4), cla = tom(cor, 0.3);
      tronco(cam, L, [0, 0.62, 0], [2.14, 4.5], [2.0, 4.2, 0], 0.62, cor, {
        tras: function (c) { retangulo(c, 6, 30, 88, 12, '#d81b1b'); circulo(c, 12, 36, 8, '#ff2a2a'); circulo(c, 88, 36, 8, '#ff2a2a'); texto(c, 'G T', 50, 58, 14, 'rgba(255,255,255,.9)'); placa(c, 'VRUUM'); circulo(c, 42, 92, 4, '#9aa0a6'); circulo(c, 58, 92, 4, '#9aa0a6'); },
        frente: function (c) { [14, 86].forEach(function (x) { circulo(c, x, 34, 9, '#fff7c2'); }); },
        esq: function (c) { retangulo(c, 0, 40, 100, 5, cla); circulo(c, 22, 30, 10, '#ffffff'); texto(c, '7', 22, 31, 14, '#1a1446'); },
        dir: function (c) { retangulo(c, 0, 40, 100, 5, cla); circulo(c, 78, 30, 10, '#ffffff'); texto(c, '7', 78, 31, 14, '#1a1446'); },
        cima: function (c) { retangulo(c, 40, 0, 7, 100, '#ffffff'); retangulo(c, 53, 0, 7, 100, '#ffffff'); }
      });
      var pil = function (c) { retangulo(c, 0, 0, 8, 100, cor); retangulo(c, 92, 0, 8, 100, cor); };
      tronco(cam, L, [0, 1.28, 0.1], [1.8, 2.3], [1.3, 1.0, -0.25], 0.7, '#8fcbec', { tras: pil, frente: pil, esq: pil, dir: pil, cima: function (c) { retangulo(c, 0, 0, 100, 100, cor); retangulo(c, 40, 0, 7, 100, '#ffffff'); retangulo(c, 53, 0, 7, 100, '#ffffff'); } }, { alfa: { tras: 0.45, frente: 0.45, esq: 0.5, dir: 0.5 }, sem: ['baixo'] });
      piloto(cam, L, [0, 1.25, -0.05], 0.36, op, -0.4);
      caixa(cam, L, [0, 0.97, -2.1], [1.9, 0.08, 0.32], esc);   // rabinho de pato
      [[-1, -1.4, 0.44], [1, -1.4, 0.44], [-1, 1.4, 0.4], [1, 1.4, 0.4]].forEach(function (w) { roda(cam, L, [w[0] * 1.0, w[2], w[1]], w[2], 0.34); });
    } },
    super: { alt: 3.0, y: 0.75, larg: 1.2, comp: 2.4, montar: function (cam, L, cor, f, op) {
      var esc = tom(cor, -0.4), cla = tom(cor, 0.3);
      var lado = function (c) { c.fillStyle = '#1b1b22'; c.beginPath(); c.moveTo(20, 30); c.lineTo(48, 26); c.lineTo(44, 70); c.lineTo(24, 74); c.closePath(); c.fill(); retangulo(c, 0, 82, 100, 6, cla); };
      tronco(cam, L, [0, 0.55, 0], [2.36, 4.7], [2.2, 4.3, -0.05], 0.52, cor, {
        tras: function (c) { [10, 24, 76, 90].forEach(function (x) { circulo(c, x, 36, 7, '#ff2a2a'); circulo(c, x - 2, 34, 2.5, 'rgba(255,230,230,.8)'); }); retangulo(c, 34, 26, 32, 22, '#141418'); for (var k = 0; k < 6; k++) retangulo(c, 36 + k * 5.5, 27, 1.5, 20, '#33333c'); retangulo(c, 8, 64, 84, 30, '#1b1b22'); [16, 28, 72, 84].forEach(function (x) { circulo(c, x, 78, 5, '#9aa0a6'); circulo(c, x, 78, 3, '#2a2a30'); }); },
        frente: function (c) { [16, 84].forEach(function (x) { retangulo(c, x - 10, 24, 20, 8, '#fff7c2'); }); },
        esq: lado, dir: lado
      });
      var pil = function (c) { retangulo(c, 0, 0, 6, 100, cor); retangulo(c, 94, 0, 6, 100, cor); };
      tronco(cam, L, [0, 1.08, 0.25], [1.7, 2.1], [1.2, 0.9, -0.2], 0.56, '#7fbde6', { tras: pil, frente: pil, esq: pil, dir: pil, cima: function (c) { retangulo(c, 0, 0, 100, 100, cor); } }, { alfa: { tras: 0.45, frente: 0.45, esq: 0.5, dir: 0.5 }, sem: ['baixo'] });
      piloto(cam, L, [0, 1.0, 0.05], 0.34, op, -0.6);
      [-0.75, 0.75].forEach(function (x) { caixa(cam, L, [x, 0.9, -2.0], [0.08, 0.2, 0.1], '#1b1b22'); });   // pés do aerofólio (baixinho: o piloto aparece por cima)
      caixa(cam, L, [0, 1.02, -2.05], [2.3, 0.07, 0.55], esc, { cima: function (c) { retangulo(c, 0, 0, 100, 30, cla); } });   // aerofólio
      [[-1, -1.45, 0.42], [1, -1.45, 0.42], [-1, 1.5, 0.38], [1, 1.5, 0.38]].forEach(function (w) { roda(cam, L, [w[0] * 1.08, w[2], w[1]], w[2], 0.4, '#3a3a44'); });
    } },
    kart: { alt: 2.6, y: 0.65, larg: 1.0, comp: 1.5, montar: function (cam, L, cor, f, op) {
      var esc = tom(cor, -0.3);
      caixa(cam, L, [0, 0.3, 0], [1.3, 0.1, 2.6], '#3a3a44');   // chassi
      tronco(cam, L, [0, 0.45, 1.05], [1.2, 0.8], [0.7, 0.5, -0.1], 0.3, cor, { cima: function (c) { circulo(c, 50, 50, 22, '#ffffff'); texto(c, '7', 50, 52, 30, '#1a1446'); } });   // bico
      [-1, 1].forEach(function (l) { caixa(cam, L, [l * 0.62, 0.45, 0], [0.22, 0.26, 1.2], cor, { esq: function (c) { texto(c, '7', 50, 50, 50, '#ffffff'); }, dir: function (c) { texto(c, '7', 50, 50, 50, '#ffffff'); } }); });   // laterais
      caixa(cam, L, [0, 0.42, -1.25], [1.5, 0.22, 0.18], cor, { tras: function (c) { retangulo(c, 34, 10, 32, 80, '#ffffff'); texto(c, '7', 50, 52, 60, '#1a1446'); retangulo(c, 4, 30, 18, 40, '#ff2a2a'); } });   // para-choque de trás com o número
      caixa(cam, L, [0, 0.66, -0.6], [0.75, 0.34, 0.12], esc);   // encosto do banco
      caixa(cam, L, [0.45, 0.62, -0.85], [0.4, 0.38, 0.45], '#3a3a44'); cano(cam, L, [0.55, 0.55, -1.05], [0.6, 0.6, -1.35], 0.06, 0.07, '#9aa0a6');   // motorzinho e escape
      bola(cam, L, [0, 1.0, -0.35], 0.34, 0.36, 0.26, tres(esc));   // o corpo de quem pilota (macacão)
      [-1, 1].forEach(function (l) { cano(cam, L, [l * 0.3, 1.1, -0.3], [l * 0.22, 0.85, 0.35], 0.09, 0.07, esc); });   // braços no volante
      cano(cam, L, [0, 0.55, 0.2], [0, 0.85, 0.42], 0.04, 0.04, '#3a3a44'); bola(cam, L, [0, 0.88, 0.45], 0.24, 0.24, 0.05, tres('#26262e'));   // volante
      piloto(cam, L, [0, 1.5, -0.3], 0.4, op);
      [[-1, -0.95, 0.4, 0.5], [1, -0.95, 0.4, 0.5], [-1, 0.95, 0.32, 0.36], [1, 0.95, 0.32, 0.36]].forEach(function (w) { roda(cam, L, [w[0] * 0.92, w[2], w[1]], w[2], w[3], '#ffd166'); });
    } },
    monstrao: { alt: 5.6, y: 1.9, larg: 1.55, comp: 2.5, montar: function (cam, L, cor, f, op) {
      var esc = tom(cor, -0.3);
      var chamas = function (c) { retangulo(c, 0, 0, 100, 100, cor); [['#ffd166', 0], ['#ff7b00', 8]].forEach(function (p) { c.fillStyle = p[0]; c.beginPath(); c.moveTo(0, 100 - p[1]); for (var k = 0; k < 6; k++) { c.lineTo(8 + k * 16, 20 + p[1]); c.lineTo(16 + k * 16, 75 - p[1]); } c.lineTo(100, 100 - p[1]); c.closePath(); c.fill(); }); };
      caixa(cam, L, [0, 1.15, 0], [1.4, 0.18, 3.6], '#555');   // chassi
      [[-1, -1.5], [1, -1.5], [-1, 1.5], [1, 1.5]].forEach(function (w) {   // molas amarelas
        var pts = []; for (var k = 0; k <= 6; k++) pts.push([w[0] * (0.7 + (k % 2 ? 0.12 : 0)), 1.1 + k * 0.1, w[1]]);
        for (k = 0; k < 6; k++) cano(cam, L, pts[k], pts[k + 1], 0.05, 0.05, '#ffd166');
      });
      caixa(cam, L, [0, 2.0, 0], [2.3, 0.6, 4.4], cor, { esq: chamas, dir: chamas, tras: function (c) { chamas(c); lanternas(c); placa(c, 'MONSTRO'); }, frente: function (c) { [16, 84].forEach(function (x) { circulo(c, x, 40, 10, '#fff7c2'); }); } });
      caixa(cam, L, [0, 2.7, 0.3], [1.95, 0.8, 1.9], '#8fd3ff', { tras: function (c) { retangulo(c, 0, 0, 10, 100, cor); retangulo(c, 90, 0, 10, 100, cor); }, esq: function (c) { retangulo(c, 0, 0, 8, 100, cor); retangulo(c, 92, 0, 8, 100, cor); }, dir: function (c) { retangulo(c, 0, 0, 8, 100, cor); retangulo(c, 92, 0, 8, 100, cor); } }, { alfa: { tras: 0.45, frente: 0.45, esq: 0.5, dir: 0.5 }, sem: ['cima', 'baixo'] });
      caixa(cam, L, [0, 3.15, 0.3], [2.0, 0.1, 1.95], esc);   // teto
      piloto(cam, L, [0, 2.8, 0.1], 0.42, op);
      [-0.6, -0.2, 0.2, 0.6].forEach(function (x) { bola(cam, L, [x, 3.3, 0.9], 0.12, 0.12, 0.08, ['#ffffff', '#fff3a0', '#e0c050'], -0.05); });   // faróis no teto
      [[-1, -1.5], [1, -1.5], [-1, 1.5], [1, 1.5]].forEach(function (w) { roda(cam, L, [w[0] * 1.25, 0.95, w[1]], 0.95, 0.75, '#9aa0a6'); });
    } },
    moto: { alt: 3.4, y: 1.0, larg: 0.45, comp: 1.4, montar: function (cam, L, cor, f, op) {
      var esc = tom(cor, -0.35);
      roda(cam, L, [0, 0.42, -0.95], 0.42, 0.26, '#3a3a44'); roda(cam, L, [0, 0.42, 1.05], 0.42, 0.2, '#3a3a44');
      caixa(cam, L, [0, 0.82, -1.0], [0.34, 0.08, 0.7], esc, { tras: function (c) { retangulo(c, 10, 20, 80, 60, '#ff2a2a'); } });   // para-lama
      caixa(cam, L, [0, 0.62, -1.3], [0.3, 0.22, 0.04], '#ffffff', { tras: function (c) { texto(c, '7', 50, 55, 70, '#1a1446'); } });   // placa
      cano(cam, L, [0.22, 0.45, -0.2], [0.26, 0.6, -1.15], 0.07, 0.08, '#9aa0a6');   // escape
      caixa(cam, L, [0, 0.62, 0.1], [0.4, 0.4, 0.9], '#3a3a44');   // motor
      tronco(cam, L, [0, 1.02, 0.35], [0.5, 0.9], [0.36, 0.6, -0.05], 0.36, cor, { cima: function (c) { retangulo(c, 44, 0, 12, 100, '#ffffff'); } });   // tanque
      caixa(cam, L, [0, 0.98, -0.45], [0.42, 0.14, 0.8], '#1b1b22');   // banco
      cano(cam, L, [0, 0.75, 0.95], [0, 1.25, 0.75], 0.05, 0.05, '#9aa0a6'); cano(cam, L, [-0.5, 1.3, 0.72], [0.5, 1.3, 0.72], 0.035, 0.035, '#3a3a44');   // garfo e guidão
      bola(cam, L, [0, 1.48, -0.25], 0.32, 0.42, 0.26, tres(cor));   // jaqueta
      caixa(cam, L, [0, 1.3, -0.5], [0.4, 0.06, 0.02], '#ffffff');   // listra da jaqueta
      [-1, 1].forEach(function (l) {
        cano(cam, L, [l * 0.3, 1.7, -0.15], [l * 0.48, 1.32, 0.7], 0.09, 0.07, esc); bola(cam, L, [l * 0.5, 1.3, 0.72], 0.08, 0.08, 0.08, tres('#222'));   // braços e luvas
        cano(cam, L, [l * 0.18, 1.15, -0.4], [l * 0.3, 0.95, 0.15], 0.11, 0.09, '#2a2d3a'); cano(cam, L, [l * 0.3, 0.95, 0.15], [l * 0.3, 0.45, -0.1], 0.09, 0.08, '#2a2d3a');   // pernas
      });
      piloto(cam, L, [0, 2.0, -0.12], 0.36, op);
    } },
    // conversível esportivo (1.16.0, dono: "mais arredondado, mais esportivo, mais fino, mais chique", sem ser de marca):
    // carroceria baixa e comprida de casco arredondado, para-lamas de trás mais largos, capô comprido, duas lanternas
    // redondas de cada lado, corcovas atrás dos bancos, para-brisa baixo de moldura cromada e um friso na cor escolhida
    conversivel: { alt: 2.9, y: 0.8, larg: 1.05, comp: 2.3, montar: function (cam, L, cor, f, op) {
      var rosa = '#ff5aa8', CROMO = '#e9edf2';
      casco(cam, L, [
        { z: -2.25, y: 0.66, w: 0.8, h: 0.22, n: 2.5 }, { z: -2.05, y: 0.69, w: 0.97, h: 0.3, n: 2.6 }, { z: -1.55, y: 0.72, w: 1.06, h: 0.35, n: 2.7 },
        { z: -0.95, y: 0.7, w: 1.04, h: 0.34, n: 2.7 }, { z: -0.2, y: 0.66, w: 0.96, h: 0.31, n: 2.6 }, { z: 0.6, y: 0.64, w: 0.98, h: 0.3, n: 2.6 },
        { z: 1.35, y: 0.63, w: 1.02, h: 0.3, n: 2.6 }, { z: 1.95, y: 0.57, w: 0.92, h: 0.24, n: 2.8 }, { z: 2.3, y: 0.5, w: 0.62, h: 0.15, n: 2.4 }
      ], rosa, { pinta: function (k, p) { return (k === 3 || k === 4 || k === 5) && Math.abs(p[0]) < 0.32 ? cor : (k === 8 || k === 0) ? tom(rosa, -0.12) : null; } });
      // o habitáculo (fundo escuro em cima do casco), bancos de couro claro e as corcovas atrás dos bancos
      var hab = [[-0.82, 1.0, -1.05], [0.82, 1.0, -1.05], [0.78, 0.98, 0.45], [-0.78, 0.98, 0.45]].map(cam.pt);
      L.push({ d: (hab[0].d + hab[2].d) / 2 - 0.15, f: function (c) { poligono(c, hab, '#3b1630'); } });
      bola(cam, L, [0, 1.06, -0.8], 0.36, 0.17, 0.1, ['#fff8ee', '#f2dcc6', '#c9a98a'], -0.2);   // encosto de couro, baixinho
      bola(cam, L, [0, 0.98, -1.45], 0.26, 0.13, 0.55, tres(rosa), -0.1);   // corcova atrás do banco
      caixa(cam, L, [0, 1.0, -1.1], [0.12, 0.06, 0.04], CROMO, null, { vies: -0.15 });
      // para-brisa baixo e inclinado, com moldura cromada
      var pb = [[-0.8, 1.38, 0.38], [0.8, 1.38, 0.38], [0.86, 0.98, 0.62], [-0.86, 0.98, 0.62]];
      var pbT = pb.map(cam.pt); L.push({ d: (pbT[0].d + pbT[2].d) / 2 - 0.1, f: function (c) { poligono(c, pbT, '#bfe6ff', null, 0.32); } });
      cano(cam, L, pb[0], pb[1], 0.025, 0.025, CROMO, -0.12); cano(cam, L, pb[0], pb[3], 0.02, 0.02, CROMO, -0.12); cano(cam, L, pb[1], pb[2], 0.02, 0.02, CROMO, -0.12);
      [-1, 1].forEach(function (l) { bola(cam, L, [l * 1.0, 1.05, 0.5], 0.08, 0.06, 0.05, tres(rosa), -0.05); });   // retrovisores
      // traseira: 4 lanternas redondas, escapes duplos cromados e a placa
      [[-0.56, 0.72], [-0.3, 0.74], [0.3, 0.74], [0.56, 0.72]].forEach(function (l) { bola(cam, L, [l[0], l[1], -2.24], 0.09, 0.09, 0.04, ['#ffd0d0', '#ff2a2a', '#9a0010'], -0.02); });
      [-0.5, -0.36, 0.36, 0.5].forEach(function (x) { bola(cam, L, [x, 0.45, -2.12], 0.06, 0.06, 0.06, [CROMO, '#9aa0a6', '#3a3a44'], -0.02); });
      caixa(cam, L, [0, 0.58, -2.21], [0.5, 0.14, 0.02], '#ffffff', { tras: function (c2) { texto(c2, '♥', 50, 52, 70, '#ff2a55'); } });
      // frente: faróis redondos e a grade pequena
      [-0.55, 0.55].forEach(function (x) { bola(cam, L, [x, 0.62, 2.12], 0.13, 0.1, 0.08, ['#ffffff', '#fff7c2', '#c9b870'], -0.02); });
      // quem dirige
      bola(cam, L, [0, 1.28, -0.5], 0.3, 0.28, 0.2, tres(cor), -0.25);
      piloto(cam, L, [0, 1.72, -0.5], 0.36, op, -0.3);
      [[-1, -1.35, 0.38], [1, -1.35, 0.38], [-1, 1.45, 0.36], [1, 1.45, 0.36]].forEach(function (w) { roda(cam, L, [w[0] * 0.9, w[2], w[1]], w[2], 0.3, CROMO); });
    } },
    // trenó do Papai Noel voando, com as renas na frente (a do nariz vermelho puxando) e o Papai Noel do lado
    treno: { alt: 4.2, y: 1.3, z: 0.6, larg: 0, comp: 0, semSombra: true, montar: function (cam, L, cor, f, op) {
      var VERM = '#d62828', OURO = '#ffd166', a = f * PI * 2;
      [-1, 1].forEach(function (l) {   // esquis dourados com a ponta enrolada na frente
        cano(cam, L, [l * 0.85, 0.12, -1.3], [l * 0.85, 0.12, 1.2], 0.06, 0.06, OURO);
        cano(cam, L, [l * 0.85, 0.12, 1.2], [l * 0.85, 0.42, 1.55], 0.06, 0.06, OURO); cano(cam, L, [l * 0.85, 0.42, 1.55], [l * 0.85, 0.62, 1.3], 0.06, 0.05, OURO);
        [-0.7, 0.7].forEach(function (z) { cano(cam, L, [l * 0.85, 0.12, z], [l * 0.8, 0.5, z], 0.04, 0.04, OURO); });
      });
      var enfeite = function (c) { retangulo(c, 0, 0, 100, 10, OURO); retangulo(c, 0, 90, 100, 10, OURO); for (var k = 0; k < 4; k++) espiral(c, 14 + k * 24, 52, 9, OURO); };
      tronco(cam, L, [0, 0.95, 0], [1.9, 2.6], [2.1, 2.9, -0.05], 0.9, VERM, { tras: enfeite, esq: enfeite, dir: enfeite, frente: enfeite, cima: function (c) { retangulo(c, 0, 0, 100, 100, '#7a0d14'); retangulo(c, 0, 0, 100, 5, OURO); retangulo(c, 0, 95, 100, 5, OURO); } });
      caixa(cam, L, [0, 1.48, -1.25], [2.0, 0.3, 0.2], VERM, { tras: enfeite });   // encosto atrás
      bola(cam, L, [0, 1.75, 0.95], 0.75, 0.55, 0.42, tres('#8b5a2b'));   // saco de presentes na frente (quem vai atrás aparece)
      [['#3a86ff', -0.35], ['#2ec27e', 0.3], ['#ffd23f', 0]].forEach(function (p, k) { caixa(cam, L, [p[1], 2.3 + k * 0.05, 0.95], [0.32, 0.32, 0.32], p[0], { tras: function (c) { retangulo(c, 42, 0, 16, 100, '#ffffff'); retangulo(c, 0, 42, 100, 16, '#ffffff'); }, cima: function (c) { retangulo(c, 42, 0, 16, 100, '#ffffff'); retangulo(c, 0, 42, 100, 16, '#ffffff'); } }); });
      // o Papai Noel sentado do lado direito: casaco, cinto, barba, gorro com pompom
      bola(cam, L, [0.5, 1.75, -0.4], 0.4, 0.45, 0.35, tres(VERM)); caixa(cam, L, [0.5, 1.55, -0.4], [0.82, 0.1, 0.72], '#1b1b22');
      bola(cam, L, [0.5, 2.3, -0.35], 0.26, 0.27, 0.26, ['#ffe0c8', '#f2c9a0', '#c8946a']); bola(cam, L, [0.5, 2.2, -0.2], 0.27, 0.24, 0.2, ['#ffffff', '#f4f4f4', '#cfcfd8'], -0.02);
      cano(cam, L, [0.5, 2.48, -0.35], [0.62, 2.95, -0.5], 0.27, 0.04, VERM); bola(cam, L, [0.64, 2.98, -0.52], 0.1, 0.1, 0.1, tres('#ffffff')); caixa(cam, L, [0.5, 2.47, -0.35], [0.58, 0.1, 0.56], '#ffffff');
      cano(cam, L, [0.3, 1.9, -0.25], [0.1, 1.85, 0.5], 0.09, 0.07, VERM);   // segurando as rédeas
      // quem pilota, do lado esquerdo
      bola(cam, L, [-0.5, 1.65, -0.4], 0.3, 0.34, 0.26, tres(cor)); piloto(cam, L, [-0.5, 2.12, -0.4], 0.4, op);
      // as renas: 2 pares e a do nariz vermelho na frente, galopando no ar
      [[-0.55, 2.6, 0], [0.55, 2.6, 0.3], [-0.55, 4.1, 0.55], [0.55, 4.1, 0.85], [0, 5.6, 1.1]].forEach(function (r, k) {
        var x = r[0], z = r[1], pa = Math.sin(a + r[2] * PI * 2), y = 1.7 + k * 0.12 + Math.sin(a + r[2] * PI * 2 + 1) * 0.08, MARROM = ['#b07a45', '#8b5a2b', '#5a3a1a'];
        cano(cam, L, [x * 0.6, 1.4, 1.4], [x, y + 0.1, z - 0.45], 0.025, 0.025, '#e63946');   // rédea
        [-1, 1].forEach(function (s) { [-0.3, 0.3].forEach(function (dz) { var q = s * (dz < 0 ? pa : -pa); cano(cam, L, [x + s * 0.13, y - 0.1, z + dz], [x + s * 0.13, y - 0.55, z + dz + q * 0.25], 0.05, 0.04, '#6b4220'); }); });
        bola(cam, L, [x, y, z], 0.26, 0.24, 0.5, MARROM);   // corpo
        bola(cam, L, [x, y + 0.05, z - 0.5], 0.08, 0.08, 0.06, tres('#fff3e0'), -0.02);   // rabinho
        cano(cam, L, [x, y + 0.1, z + 0.38], [x, y + 0.45, z + 0.55], 0.12, 0.09, '#8b5a2b');   // pescoço
        bola(cam, L, [x, y + 0.52, z + 0.62], 0.14, 0.14, 0.2, MARROM);   // cabeça
        [-1, 1].forEach(function (s) { cano(cam, L, [x + s * 0.06, y + 0.62, z + 0.58], [x + s * 0.25, y + 0.95, z + 0.5], 0.025, 0.02, '#c9a06a'); cano(cam, L, [x + s * 0.17, y + 0.82, z + 0.53], [x + s * 0.32, y + 0.88, z + 0.62], 0.02, 0.015, '#c9a06a'); });   // chifres
        if (k === 4) bola(cam, L, [x, y + 0.48, z + 0.83], 0.07, 0.07, 0.07, ['#ffb3b3', '#ff2a2a', '#a00000'], -0.03);   // o nariz vermelho
      });
    } },

    // ---------- 1.16.0: os que voam em 3D (dono: "todos os veículos girarem") ----------
    aviao: { alt: 2.8, y: 1.0, larg: 0, comp: 0, semSombra: true, montar: function (cam, L, cor, f, op) {
      var esc = tom(cor, -0.3), cla = tom(cor, 0.35), t = op.t || 0;
      [-1, 1].forEach(function (l) { cano(cam, L, [l * 0.35, 0.75, 0.6], [l * 0.55, 0.3, 0.7], 0.04, 0.04, '#3a3a44'); roda(cam, L, [l * 0.6, 0.25, 0.7], 0.2, 0.12); });   // trem de pouso
      casco(cam, L, [
        { z: -2.5, y: 1.3, w: 0.1, h: 0.12, n: 2 }, { z: -1.7, y: 1.12, w: 0.28, h: 0.3, n: 2 }, { z: -0.7, y: 1.0, w: 0.46, h: 0.47, n: 2.2 },
        { z: 0.6, y: 1.0, w: 0.5, h: 0.5, n: 2.2 }, { z: 1.35, y: 1.0, w: 0.42, h: 0.42, n: 2.2 }, { z: 1.65, y: 1.0, w: 0.3, h: 0.3, n: 2 }
      ], cor, { pinta: function (k, p) { return Math.abs(p[1] - 0.95) < 0.12 ? '#ffffff' : null; } });
      chapa(cam, L, [[-2.6, 0.82, 0.85], [2.6, 0.82, 0.85], [2.6, 0.82, 0.05], [-2.6, 0.82, 0.05]], cor);   // asa
      chapa(cam, L, [[-2.6, 0.83, 0.85], [-2.25, 0.83, 0.85], [-2.25, 0.83, 0.05], [-2.6, 0.83, 0.05]], '#ffffff', { vies: -0.01 });
      chapa(cam, L, [[2.25, 0.83, 0.85], [2.6, 0.83, 0.85], [2.6, 0.83, 0.05], [2.25, 0.83, 0.05]], '#ffffff', { vies: -0.01 });
      bola(cam, L, [-2.62, 0.82, 0.45], 0.07, 0.07, 0.07, ['#ffb3b3', '#ff3b3b', '#a00'], -0.02); bola(cam, L, [2.62, 0.82, 0.45], 0.07, 0.07, 0.07, ['#c8ffd0', '#4cd964', '#1a7a30'], -0.02);
      chapa(cam, L, [[-0.85, 1.28, -1.9], [0.85, 1.28, -1.9], [0.85, 1.28, -2.45], [-0.85, 1.28, -2.45]], esc);   // estabilizador
      chapa(cam, L, [[0, 1.3, -1.8], [0, 2.1, -2.3], [0, 2.1, -2.6], [0, 1.3, -2.5]], cla);   // leme
      piloto(cam, L, [0, 1.62, -0.25], 0.36, op);
      chapa(cam, L, [[-0.36, 1.45, 0.28], [0.36, 1.45, 0.28], [0.3, 1.85, 0.12], [-0.3, 1.85, 0.12]], '#bfe6ff', { alfa: 0.35 });   // para-brisa
      bola(cam, L, [0, 1.0, 1.75], 0.16, 0.16, 0.2, tres('#d9dde3'));   // bico da hélice
      disco(cam, L, [0, 1.0, 1.8], [0.9, 0, 0], [0, 0.9, 0], '#e8e8f0', 0.25, -0.05);
      var a = t * 40; cano(cam, L, [Math.cos(a) * 0.9, 1.0 + Math.sin(a) * 0.9, 1.82], [-Math.cos(a) * 0.9, 1.0 - Math.sin(a) * 0.9, 1.82], 0.05, 0.05, '#3a3a44', -0.06);
    } },
    jato: { alt: 2.75, y: 1.0, larg: 0, comp: 0, semSombra: true, montar: function (cam, L, cor, f, op) {
      var esc = tom(cor, -0.3), t = op.t || 0, chama = 0.85 + Math.sin(t * 50) * 0.15;
      bola(cam, L, [0, 1.0, -2.75 - chama * 0.25], 0.22 * chama, 0.22 * chama, 0.45 * chama, ['#ffffff', '#ffd166', 'rgba(255,90,0,0.4)'], 0.1);   // fogo do motor
      bola(cam, L, [0, 1.0, -2.5], 0.26, 0.26, 0.08, ['#555', '#2a2a30', '#111'], 0.05);   // bocal
      casco(cam, L, [
        { z: -2.5, y: 1.0, w: 0.32, h: 0.3, n: 2.2 }, { z: -1.4, y: 1.02, w: 0.48, h: 0.4, n: 2.4 }, { z: 0.2, y: 1.05, w: 0.46, h: 0.42, n: 2.3 },
        { z: 1.4, y: 1.02, w: 0.32, h: 0.3, n: 2 }, { z: 2.3, y: 0.98, w: 0.12, h: 0.12, n: 2 }, { z: 2.7, y: 0.96, w: 0.02, h: 0.02, n: 2 }
      ], cor);
      [-1, 1].forEach(function (l) {
        chapa(cam, L, [[l * 0.4, 0.95, 0.9], [l * 2.4, 0.9, -1.2], [l * 2.4, 0.9, -1.65], [l * 0.4, 0.95, -1.5]], cor);   // asa em flecha
        caixa(cam, L, [l * 1.75, 0.92, -1.0], [0.1, 0.04, 0.5], '#ffffff', { cima: function (c) { texto(c, '★', 50, 50, 70, '#ffffff'); } });
        bola(cam, L, [l * 2.42, 0.9, -1.4], 0.06, 0.06, 0.06, l < 0 ? ['#ffb3b3', '#ff3b3b', '#a00'] : ['#c8ffd0', '#4cd964', '#1a7a30'], -0.02);
        chapa(cam, L, [[l * 0.3, 1.25, -1.5], [l * 0.75, 2.1, -2.2], [l * 0.75, 2.1, -2.55], [l * 0.3, 1.25, -2.45]], esc);   // as duas caudas
        chapa(cam, L, [[l * 0.3, 1.0, -1.9], [l * 1.1, 0.98, -2.35], [l * 1.1, 0.98, -2.6], [l * 0.3, 1.0, -2.5]], esc);   // estabilizador
      });
      piloto(cam, L, [0, 1.48, 0.6], 0.34, op);
      casco(cam, L, [{ z: -0.1, y: 1.35, w: 0.1, h: 0.08, n: 2 }, { z: 0.4, y: 1.4, w: 0.36, h: 0.4, n: 2 }, { z: 0.9, y: 1.38, w: 0.34, h: 0.36, n: 2 }, { z: 1.4, y: 1.3, w: 0.08, h: 0.06, n: 2 }], '#ffd98a', { alfa: 0.35, vies: -0.05 });   // cúpula de vidro dourado
    } },
    heli: { alt: 4.1, y: 1.2, larg: 0, comp: 0, semSombra: true, montar: function (cam, L, cor, f, op) {
      var esc = tom(cor, -0.35), t = op.t || 0;
      [-1, 1].forEach(function (l) {   // esquis
        cano(cam, L, [l * 0.75, 0.15, -1.0], [l * 0.75, 0.15, 1.1], 0.05, 0.05, '#333'); cano(cam, L, [l * 0.75, 0.15, 1.1], [l * 0.75, 0.3, 1.35], 0.05, 0.05, '#333');
        [-0.5, 0.6].forEach(function (z) { cano(cam, L, [l * 0.75, 0.15, z], [l * 0.5, 0.75, z], 0.035, 0.035, '#333'); });
      });
      casco(cam, L, [{ z: -1.1, y: 1.15, w: 0.45, h: 0.45, n: 2 }, { z: -0.6, y: 1.05, w: 0.85, h: 0.55, n: 2.4 }, { z: 0.6, y: 1.0, w: 0.85, h: 0.5, n: 2.4 }, { z: 1.2, y: 0.95, w: 0.55, h: 0.35, n: 2 }], cor);   // corpo
      piloto(cam, L, [0, 1.75, 0.15], 0.4, op);
      casco(cam, L, [{ z: -0.7, y: 1.6, w: 0.5, h: 0.12, n: 2 }, { z: -0.3, y: 1.7, w: 0.8, h: 0.45, n: 2 }, { z: 0.6, y: 1.65, w: 0.8, h: 0.45, n: 2 }, { z: 1.25, y: 1.25, w: 0.45, h: 0.15, n: 2 }], '#a9dcff', { alfa: 0.32, vies: -0.05 });   // bolha de vidro
      casco(cam, L, [{ z: -1.0, y: 1.3, w: 0.2, h: 0.2, n: 2 }, { z: -3.2, y: 1.45, w: 0.08, h: 0.08, n: 2 }], esc);   // cauda
      chapa(cam, L, [[0, 1.45, -2.9], [0, 2.05, -3.3], [0, 2.05, -3.55], [0, 1.4, -3.3]], esc);   // aleta
      var ac = t * 30; disco(cam, L, [0.14, 1.6, -3.3], [0, 0.4, 0], [0, 0, 0.4], '#e0e0e8', 0.4, -0.02);
      cano(cam, L, [0.15, 1.6 + Math.cos(ac) * 0.4, -3.3 + Math.sin(ac) * 0.4], [0.15, 1.6 - Math.cos(ac) * 0.4, -3.3 - Math.sin(ac) * 0.4], 0.03, 0.03, '#3a3a44', -0.03);
      cano(cam, L, [0, 2.0, 0], [0, 2.3, 0], 0.08, 0.06, '#3a3a44');   // mastro
      disco(cam, L, [0, 2.32, 0], [2.4, 0, 0], [0, 0, 2.4], '#dcdce6', 0.18);
      var a = t * 18; [0, PI / 2].forEach(function (d) { cano(cam, L, [Math.cos(a + d) * 2.4, 2.33, Math.sin(a + d) * 2.4], [-Math.cos(a + d) * 2.4, 2.33, -Math.sin(a + d) * 2.4], 0.06, 0.06, '#2a2a30', -0.01); });
      bola(cam, L, [0, 0.95, -1.1], 0.06, 0.06, 0.06, ['#ffb3b3', '#ff3b3b', '#a00'], -0.02);
    } },
    // arara gigante (de um mundo fantástico): asas de 3 pedaços batendo, penas vermelhas, amarelas e azuis, cauda comprida
    arara: { alt: 4.1, y: 1.2, larg: 0, comp: 0, semSombra: true, montar: function (cam, L, cor, f, op) {
      var bat = Math.sin(f * PI * 2), VERM = '#e63946';
      [-0.2, 0, 0.2].forEach(function (d, k) { chapa(cam, L, [[d - 0.12, 1.2, -0.8], [d + 0.12, 1.2, -0.8], [d * 4 + 0.2, 1.15, -2.1], [d * 4 - 0.2, 1.15, -2.1]], k === 1 ? VERM : '#2f8fe0'); });   // cauda (penas compridas para trás)
      bola(cam, L, [0, 1.2, 0], 0.55, 0.5, 1.0, tres(VERM));   // corpo
      bola(cam, L, [0, 0.95, 0.1], 0.38, 0.3, 0.7, tres('#ffd23f'), -0.02);   // barriga
      [-1, 1].forEach(function (l) {   // asas: ombro -> cotovelo -> ponta, subindo e descendo
        var o = [l * 0.45, 1.35, 0.3], m = [l * 1.4, 1.45 + bat * 0.55, 0.25], p = [l * 2.5, 1.5 + bat * 1.15, -0.1];
        chapa(cam, L, [o, m, add(m, [0, 0, -0.85]), [l * 0.45, 1.3, -0.6]], VERM);
        chapa(cam, L, [m, p, add(p, [0, -0.05, -0.55]), add(m, [0, 0, -0.85])], '#ffd23f', { vies: -0.01 });
        chapa(cam, L, [add(m, [l * 0.5, 0.05 + bat * 0.25, -0.3]), p, add(p, [l * 0.1, -0.1, -0.6]), add(m, [l * 0.5, 0.0 + bat * 0.25, -0.85])], '#2f8fe0', { vies: -0.02 });
      });
      cano(cam, L, [0, 1.45, 0.75], [0, 2.15, 1.25], 0.3, 0.22, VERM);   // pescoço
      bola(cam, L, [0, 2.3, 1.35], 0.3, 0.3, 0.32, tres(VERM));   // cabeça
      [-1, 1].forEach(function (l) { bola(cam, L, [l * 0.18, 2.38, 1.45], 0.1, 0.12, 0.06, ['#ffffff', '#f4f4f4', '#ddd'], -0.02); bola(cam, L, [l * 0.2, 2.38, 1.5], 0.04, 0.05, 0.03, ['#333', '#111', '#000'], -0.03); });
      bola(cam, L, [0, 2.2, 1.7], 0.12, 0.16, 0.18, tres('#2a2a30'), -0.02);   // bico
      [-0.25, 0.25].forEach(function (x) { bola(cam, L, [x, 1.42, -0.35], 0.05, 0.05, 0.05, ['#e8ffff', '#7cf9ff', '#1aa0b0'], -0.05); });   // pintas que brilham
      bola(cam, L, [0, 1.85, -0.1], 0.28, 0.28, 0.2, tres(cor), -0.1);   // quem monta
      piloto(cam, L, [0, 2.28, -0.1], 0.38, op);
    } },
    // morcego gigante de Halloween: asas de pele com dedos, orelhas pontudas; perto das coisas vira o Conde Drácula
    morcego: { alt: 4.2, y: 1.2, larg: 0, comp: 0, semSombra: true, montar: function (cam, L, cor, f, op) {
      var bat = Math.sin(f * PI * 2), ROXO = '#3a2850', PELE = '#2b1d3a';
      [-1, 1].forEach(function (l) {
        var o = [l * 0.35, 1.35, 0.3], tr = [l * 0.3, 1.2, -0.6], dedos = [0, 1, 2, 3].map(function (k) { var ang = k / 3; return [l * (1.0 + ang * 1.6), 1.45 + bat * (0.4 + ang * 0.7), 0.35 - ang * 0.9]; });
        var pts = [o].concat(dedos).concat([[l * 1.7, 1.2 + bat * 0.6, -0.9], [l * 0.9, 1.15 + bat * 0.3, -0.85], tr]);
        chapa(cam, L, pts, PELE, { verso: '#4b3466' });
        dedos.forEach(function (d) { cano(cam, L, o, d, 0.03, 0.015, '#5a3f78', -0.01); });
      });
      bola(cam, L, [0, 1.25, 0], 0.45, 0.48, 0.8, tres(ROXO));   // corpo
      bola(cam, L, [0, 1.75, 0.85], 0.32, 0.3, 0.3, tres(ROXO));   // cabeça
      [-1, 1].forEach(function (l) {
        chapa(cam, L, [[l * 0.08, 1.95, 0.85], [l * 0.32, 2.5, 0.8], [l * 0.3, 1.95, 0.75]], ROXO);   // orelhas
        bola(cam, L, [l * 0.13, 1.82, 1.12], 0.07, 0.07, 0.04, ['#fff3a0', '#ffd23f', '#a07a00'], -0.02);
      });
      bola(cam, L, [0, 1.75, -0.15], 0.28, 0.28, 0.2, tres(tom(cor, -0.15)), -0.1);   // quem monta
      piloto(cam, L, [0, 2.17, -0.15], 0.38, op);
    } },
    // o Conde Drácula (Bram Stoker, 1897, domínio público; desenho próprio), voando com a capa aberta (preta por fora,
    // vermelha por dentro) e quem monta sentado nos ombros dele
    dracula: { alt: 4.2, y: 1.2, larg: 0, comp: 0, semSombra: true, montar: function (cam, L, cor, f, op) {
      var ond = Math.sin(f * PI * 2) * 0.18, PRETO = '#14121c', VERM = '#b5121b', TERNO = '#1b1b26';
      // voando deitado, como quem nada no ar: a capa abre para os lados e para trás, em pontas
      [-1, 1].forEach(function (l) {
        chapa(cam, L, [[l * 0.3, 1.45, 0.55], [l * 1.5, 1.6 + ond, 0.2], [l * 2.2, 1.45 - ond, -0.3], [l * 1.9, 1.35 + ond, -0.8], [l * 2.0, 1.3, -1.4], [l * 1.2, 1.25 - ond, -1.2], [l * 0.9, 1.2, -1.9], [l * 0.25, 1.3, -1.3]], PRETO, { verso: VERM });
        cano(cam, L, [l * 0.15, 1.15, -0.6], [l * 0.2, 1.1 + (l > 0 ? ond : -ond) * 0.5, -1.7], 0.11, 0.09, TERNO);   // pernas esticadas para trás
        bola(cam, L, [l * 0.2, 1.1 + (l > 0 ? ond : -ond) * 0.5, -1.8], 0.09, 0.08, 0.14, tres('#0c0c10'));   // sapatos
        cano(cam, L, [l * 0.32, 1.3, 0.45], [l * 0.45, 1.2, 1.2], 0.09, 0.07, TERNO);   // braços para a frente
        bola(cam, L, [l * 0.45, 1.2, 1.25], 0.08, 0.08, 0.08, ['#f4f1f8', '#e2dcea', '#b8b0c8']);   // mãos pálidas
      });
      caixa(cam, L, [0, 1.25, -0.05], [0.7, 0.38, 1.3], TERNO);   // terno (de bruços)
      chapa(cam, L, [[-0.45, 1.35, 0.6], [0.45, 1.35, 0.6], [0.4, 1.95, 0.45], [-0.4, 1.95, 0.45]], VERM, { verso: PRETO });   // gola alta
      bola(cam, L, [0, 1.62, 0.95], 0.26, 0.3, 0.26, ['#f4f1f8', '#e2dcea', '#b8b0c8']);   // rosto pálido, olhando para a frente
      bola(cam, L, [0, 1.74, 0.88], 0.27, 0.24, 0.26, tres('#15131a'), -0.01);   // cabelo penteado
      bola(cam, L, [-0.4, 1.66, -0.35], 0.26, 0.24, 0.2, tres(tom(cor, -0.15)), -0.1);   // quem monta, nas costas (de lado, para ver o rosto dele)
      piloto(cam, L, [-0.4, 2.05, -0.35], 0.38, op);
    } }
  };

  /* virou barco: duas boias compridas (amarelas, com faixa vermelha e bico) dos lados, presas por hastes; ficam
     um pouco para dentro da água (a espuma é desenhada por baixo, no desenho.js) */
  function boias(cam, L, m) {
    var x = m.larg + 0.12, c0 = -m.comp - 0.1, c1 = m.comp + 0.35, r = 0.28;
    [-1, 1].forEach(function (l) {
      casco(cam, L, [{ x: l * x, z: c0, y: 0.2, w: r * 0.75, h: r * 0.75, n: 2 }, { x: l * x, z: c0 + 0.4, y: 0.22, w: r, h: r, n: 2 }, { x: l * x, z: c1 - 0.6, y: 0.22, w: r, h: r, n: 2 }, { x: l * x, z: c1, y: 0.32, w: r * 0.25, h: r * 0.25, n: 2 }],
        '#ffb703', { pinta: function (k) { return k === 4 || k === 12 ? '#e63946' : null; } });
      [c0 * 0.55, c1 * 0.55].forEach(function (z) { cano(cam, L, [l * x, 0.4, z], [l * (x - 0.3), Math.max(0.75, m.y * 0.7), z], 0.05, 0.05, '#9aa0a6'); });
    });
  }
  function montar(id, x0, y0, W, H, cor, fase, lado, inclina, op) {
    var m = MODELOS[id], L = [], giro = Math.max(-1.2, Math.min(1.2, lado || 0)) * 0.62 + (op.orbita || 0);
    var cam = camera(x0, y0, W, H, giro, 0.3 - (inclina || 0) * 0.6, m.alt, m.y, m.z);
    if (!m.semSombra) sombra(cam, L, m.larg, m.comp);
    var o = { cabeca: op.cabeca, giro: op.giroCabeca, aqui: op.aqui, voo: op.voo, t: op.t };
    emBarco = !!op.barco && m.larg > 0;
    m.montar(cam, L, cor || '#ff4fa3', ((fase || 0) % 1 + 1) % 1, o);
    if (emBarco) boias(cam, L, m);
    emBarco = false;
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
