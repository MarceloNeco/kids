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
  var ASP = 1;   // altura/largura da face cujo desenho está sendo pintado (letra e emoji sem esticar)
  function poligono(c, q, cor, desenho, alfa, asp) {
    c.save(); if (alfa != null) c.globalAlpha = alfa;
    c.fillStyle = cor; c.beginPath(); q.forEach(function (p, k) { if (k) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); }); c.closePath(); c.fill();
    c.globalAlpha = 1;   // o desenho da face (crianças na janela, letreiro) sai inteiro mesmo em vidro
    if (desenho && q.length === 4) {   // quadrado 100×100 -> face (q0 = canto de cima à esquerda, q1 = de cima à direita, q3 = de baixo à esquerda)
      c.clip();
      c.transform((q[1].x - q[0].x) / 100, (q[1].y - q[0].y) / 100, (q[3].x - q[0].x) / 100, (q[3].y - q[0].y) / 100, q[0].x, q[0].y);
      ASP = asp || 1; desenho(c); ASP = 1;
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
  /* sólido de 8 cantos P(±1, ±1, ±1); a luz de cada face vem da sua inclinação de verdade.
     1.25.0 (dono: "acabamentos quadrados, deveriam ser arredondados nas pontas"): as quinas são chanfradas — cada face
     encolhe um pouco e, entre elas, entram faixas e cantinhos inclinados, cada um com a sua luz e o brilho do verniz.
     op.chanfro: tamanho (padrão 0,16; nunca mais que 30% da aresta mais curta; caixa fininha fica sem). */
  var FACES = [['tras', 2, -1, [[-1, 1, -1], [1, 1, -1], [1, -1, -1], [-1, -1, -1]]], ['frente', 2, 1, [[1, 1, 1], [-1, 1, 1], [-1, -1, 1], [1, -1, 1]]],
    ['esq', 0, -1, [[-1, 1, 1], [-1, 1, -1], [-1, -1, -1], [-1, -1, 1]]], ['dir', 0, 1, [[1, 1, -1], [1, 1, 1], [1, -1, 1], [1, -1, -1]]],
    ['cima', 1, 1, [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]]], ['baixo', 1, -1, [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]]]];
  var NOME_FACE = [['esq', 'dir'], ['baixo', 'cima'], ['tras', 'frente']];
  function solido(cam, L, P, cor, des, op) {
    des = des || {}; op = op || {};
    var sem = op.sem || [], pt = {}, centro = [0, 0, 0], minA = 1e9;
    function k3(s) { return s.join(','); }
    function canto(s) { var k = k3(s); return pt[k] || (pt[k] = P(s[0], s[1], s[2])); }
    function viz(s, a) { var t = s.slice(); t[a] = -t[a]; return t; }
    [-1, 1].forEach(function (x) { [-1, 1].forEach(function (y) { [-1, 1].forEach(function (z) { var p = canto([x, y, z]); centro = add(centro, mul(p, 0.125)); [0, 1, 2].forEach(function (a) { var d = sub(canto(viz([x, y, z], a)), p), l = Math.sqrt(dot(d, d)); if (l > 1e-6) minA = Math.min(minA, l); }); }); }); });
    var b = Math.min(op.chanfro != null ? op.chanfro : 0.16, minA * 0.3); if (b < 0.015) b = 0;
    function e(s, a) { var d = sub(canto(viz(s, a)), canto(s)), l = Math.sqrt(dot(d, d)) || 1; return mul(d, 1 / l); }
    function dentro(s, a1, a2) { return add(canto(s), mul(add(e(s, a1), e(s, a2)), b)); }
    function alfaDe(nome) { return op.alfa != null && typeof op.alfa === 'object' ? op.alfa[nome] : op.alfa; }
    function pedaco(pts, corF, desenho, alfaF, vies) {
      var cc = mul(pts.reduce(function (a2, p) { return add(a2, p); }, [0, 0, 0]), 1 / pts.length), n = [0, 0, 0];
      for (var k = 0; k < pts.length; k++) n = add(n, cross(pts[k], pts[(k + 1) % pts.length]));
      n = norm(n); if (dot(n, n) < 0.5) return; if (dot(n, sub(cc, centro)) < 0) n = mul(n, -1);
      if (!cam.ve(cc, n)) return;
      var q = pts.map(cam.pt), dm = 0; q.forEach(function (p) { dm += p.d; }); dm /= q.length;
      var asp = 1;
      if (desenho) { var dw = sub(pts[1], pts[0]), dh = sub(pts[3], pts[0]); asp = Math.sqrt(dot(dh, dh)) / (Math.sqrt(dot(dw, dw)) || 1); }
      var corL = verniz(luzDe(corF, n), n, cc, cam);
      L.push({ d: dm + (op.vies || 0) + (vies || 0), f: function (c) { poligono(c, q, corL, desenho, alfaF, asp); } });
    }
    FACES.forEach(function (fc) {   // as 6 faces (encolhidas pelo chanfro), com o desenho de cada uma
      if (sem.indexOf(fc[0]) >= 0) return;
      var outros = [0, 1, 2].filter(function (a) { return a !== fc[1]; });
      var pts = fc[3].map(function (s) { return b ? dentro(s, outros[0], outros[1]) : canto(s); });
      pedaco(pts, (op.cores && op.cores[fc[0]]) || cor, des[fc[0]], alfaDe(fc[0]));
    });
    if (!b) return;
    [0, 1, 2].forEach(function (a) {   // as 12 faixas das arestas
      var o = [0, 1, 2].filter(function (x) { return x !== a; }), ba = o[0], ca = o[1];
      [-1, 1].forEach(function (sb) { [-1, 1].forEach(function (sc) {
        var f1 = NOME_FACE[ba][sb > 0 ? 1 : 0], f2 = NOME_FACE[ca][sc > 0 ? 1 : 0];
        if (sem.indexOf(f1) >= 0 || sem.indexOf(f2) >= 0) return;
        var s0 = [0, 0, 0], s1; s0[a] = -1; s0[ba] = sb; s0[ca] = sc; s1 = viz(s0, a);
        var a1 = alfaDe(f1), a2 = alfaDe(f2);
        pedaco([dentro(s0, a, ca), dentro(s0, a, ba), dentro(s1, a, ba), dentro(s1, a, ca)], cor, null, a1 != null && a2 != null ? Math.max(a1, a2) : undefined, 0.001);
      }); });
    });
    [-1, 1].forEach(function (x) { [-1, 1].forEach(function (y) { [-1, 1].forEach(function (z) {   // os 8 cantinhos
      var s = [x, y, z], fs = [NOME_FACE[0][x > 0 ? 1 : 0], NOME_FACE[1][y > 0 ? 1 : 0], NOME_FACE[2][z > 0 ? 1 : 0]];
      if (fs.some(function (f) { return sem.indexOf(f) >= 0; })) return;
      var al = fs.map(alfaDe), alfaC = al.every(function (v) { return v != null; }) ? Math.max.apply(null, al) : undefined;
      pedaco([dentro(s, 1, 2), dentro(s, 0, 2), dentro(s, 0, 1)], cor, null, alfaC, 0.002);
    }); }); });
  }
  // brilho de verniz (1.21.0): a face que reflete a luz para a câmera fica mais clara, como pintura de carro
  function verniz(rgbCor, n, centro, cam) {
    var meio = norm(add(norm(sub(cam.pos, centro)), LUZ)), b = Math.pow(Math.max(0, dot(n, meio)), 18) * 0.42;
    if (b < 0.01) return rgbCor;
    var v = rgbCor.match(/\d+/g).map(Number);
    return rgb(v.map(function (x) { return x + (255 - x) * b; }));
  }
  // luz acesa (lanterna, farol, giroflex): um brilho redondo somado por cima
  function luzinha(cam, L, p, r, cor, forca) {
    var q = cam.pt(p);
    L.push({ d: q.d - 0.3, f: function (c) {
      var R = r * q.s; if (R < 0.5) return;
      c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = forca == null ? 0.55 : forca;
      var g = c.createRadialGradient(q.x, q.y, 0, q.x, q.y, R); g.addColorStop(0, cor); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.beginPath(); c.arc(q.x, q.y, R, 0, PI * 2); c.fill(); c.restore();
    } });
  }
  // fumacinha do escapamento: três baforadas indo para trás, crescendo e sumindo
  function fumaca(cam, L, p) {
    for (var k = 0; k < 3; k++) {
      var f = (relogio * 1.6 + k / 3) % 1, q = cam.pt(add(p, [Math.sin(k * 2.1 + relogio) * 0.1 * f, 0.15 * f, -1.1 * f]));
      (function (q, f) { L.push({ d: q.d + 0.05, f: function (c) {
        var R = (0.08 + f * 0.28) * q.s; if (R < 0.5) return;
        c.globalAlpha = 0.45 * (1 - f); c.fillStyle = '#d8dbe6'; c.beginPath(); c.arc(q.x, q.y, R, 0, PI * 2); c.fill(); c.globalAlpha = 1;
      } }); })(q, f);
    }
  }
  // rastro no céu (1.23.0): bolinhas ficando para trás e sumindo (fumaça branca das asas, purpurina do trenó)
  function rastro(cam, L, p, cor, tam, comp) {
    for (var k = 0; k < 7; k++) {
      var f = ((relogio * 2.2 + k / 7) % 1), q = cam.pt(add(p, [0, -f * 0.1, -f * (comp || 3)]));
      (function (q, f) { L.push({ d: q.d + 0.1, f: function (c) {
        var R = (tam || 0.07) * (1 + f * 1.8) * q.s; if (R < 0.4) return;
        c.globalAlpha = 0.6 * (1 - f); c.fillStyle = cor; c.beginPath(); c.arc(q.x, q.y, R, 0, PI * 2); c.fill(); c.globalAlpha = 1;
      } }); })(q, f);
    }
  }
  var relogio = 0;   // segundos (op.t), para rodas, fumaça e luzes andarem
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
  // rede (1.28.0, pula-pula): tela vermelha quase transparente com a malha em losangos; cantos: cima-esq, cima-dir, baixo-dir, baixo-esq
  function rede(cam, L, pts) {
    var q = pts.map(cam.pt), dm = 0; q.forEach(function (p) { dm += p.d; }); dm /= q.length;
    L.push({ d: dm, f: function (c) { poligono(c, q, '#d62828', function (g) {
      g.strokeStyle = 'rgba(150,16,24,.6)'; g.lineWidth = 0.55; g.beginPath();
      for (var k = -100; k <= 100; k += 10) { g.moveTo(k, 0); g.lineTo(k + 100, 100); g.moveTo(k + 100, 0); g.lineTo(k, 100); }
      g.stroke();
    }, 0.12); } });
  }
  /* painel (1.29.0): quadro plano com desenho (janelas, letreiro), cantos na ordem cima-esq, cima-dir, baixo-dir,
     baixo-esq vistos de fora; de dentro só aparece se tiver op.verso (a cor do lado de dentro, sem desenho) */
  function painel(cam, L, pts, cor, desenho, op) {
    op = op || {};
    var centro = mul(pts.reduce(function (a, b) { return add(a, b); }, [0, 0, 0]), 1 / pts.length), n = norm(cross(sub(pts[1], pts[0]), sub(pts[3], pts[0]))), fora = cam.ve(centro, n);
    if (!fora && !op.verso) return;
    var q = pts.map(cam.pt), dm = 0; q.forEach(function (p) { dm += p.d; }); dm /= q.length;
    var dw = sub(pts[1], pts[0]), dh = sub(pts[3], pts[0]), asp = Math.sqrt(dot(dh, dh)) / (Math.sqrt(dot(dw, dw)) || 1);
    var c3 = fora ? verniz(luzDe(cor, n), n, centro, cam) : luzDe(op.verso, mul(n, -1));
    L.push({ d: dm + (op.vies || 0), f: function (c) { poligono(c, q, c3, fora ? desenho : null, op.alfa, asp); } });
  }
  // o mesmo painel, cortado em n pedaços ao longo do comprimento (a ordem de pintura acerta com o que está perto)
  function painelEmPartes(cam, L, pts, n, cor, desenho, op) {
    for (var j = 0; j < n; j++) {
      var a = j / n, b = (j + 1) / n, lerp = function (p, q, t) { return add(p, mul(sub(q, p), t)); };
      painel(cam, L, [lerp(pts[0], pts[1], a), lerp(pts[0], pts[1], b), lerp(pts[3], pts[2], b), lerp(pts[3], pts[2], a)], cor, desenho ? (function (j) { return function (c) { var asp = ASP; ASP = asp / n; c.scale(n, 1); c.translate(-j * 100 / n, 0); desenho(c); ASP = asp; }; })(j) : null, op);
    }
  }
  // disco girando (hélice, rotor): um borrão claro e transparente
  function disco(cam, L, centro, ex, ey, cor, alfa, vies) {
    var pts = []; for (var k = 0; k < 16; k++) { var a = k / 16 * PI * 2; pts.push(add(centro, add(mul(ex, Math.cos(a)), mul(ey, Math.sin(a))))); }
    chapa(cam, L, pts, cor, { alfa: alfa, vies: vies });
  }
  function luzHex(cor, n) { var k = 0.62 + 0.42 * Math.max(0, dot(n, LUZ)), c = hexRgb(cor); return '#' + c.map(function (v) { return ('0' + Math.min(255, Math.round(v * k)).toString(16)).slice(-2); }).join(''); }
  // roda: cilindro de 12 lados deitado no eixo x (pneu escuro e calota clara virada para fora)
  var emBarco = false;   // no rio (1.18.0) as rodas recolhem e entram as boias (montar)
  function roda(cam, L, cen, r, larg, calota, dosDois) {   // dosDois: veículo aberto (carrinho de bebê) mostra o lado de dentro também
    if (emBarco) return;
    var N = 12, lado = cen[0] >= 0 ? 1 : -1, fora = [], dentro = [];
    for (var k = 0; k < N; k++) { var a = k / N * PI * 2; fora.push([cen[0] + lado * larg / 2, cen[1] + Math.cos(a) * r, cen[2] + Math.sin(a) * r]); dentro.push([cen[0] - lado * larg / 2, cen[1] + Math.cos(a) * r, cen[2] + Math.sin(a) * r]); }
    for (k = 0; k < N; k++) {
      var a2 = (k + 0.5) / N * PI * 2, n = [0, Math.cos(a2), Math.sin(a2)], quad = [fora[k], fora[(k + 1) % N], dentro[(k + 1) % N], dentro[k]];
      var cq = mul(quad.reduce(function (a, b) { return add(a, b); }, [0, 0, 0]), 0.25);
      if (!cam.ve(cq, n)) continue;
      var sulco = (k + Math.floor(relogio * 9)) % 2;   // os sulcos do pneu andam: a roda está girando
      (function (qd, nn, sc) { var q = qd.map(cam.pt); L.push({ d: (q[0].d + q[2].d) / 2, f: function (c) { poligono(c, q, luzDe(sc ? '#2a2a33' : '#16161c', nn)); } }); })(quad, n, sulco);
    }
    if (dosDois) { var nd = [-lado, 0, 0], cd = [cen[0] - lado * larg / 2, cen[1], cen[2]]; if (cam.ve(cd, nd)) { var qd = dentro.map(cam.pt), qdc = dentro.map(function (p) { return cam.pt(add(cd, mul(sub(p, cd), 0.55))); }); L.push({ d: cam.pt(cd).d - 0.01, f: function (c) { poligono(c, qd, luzDe('#26262e', nd)); poligono(c, qdc, luzDe(calota || '#c9ced6', nd)); } }); } }
    var nf = [lado, 0, 0], cf = [cen[0] + lado * larg / 2, cen[1], cen[2]];
    if (cam.ve(cf, nf)) {
      var qf = fora.map(cam.pt), qc = fora.map(function (p) { return cam.pt(add(cf, mul(sub(p, cf), 0.55))); });
      var giroR = -relogio * 9 * lado, raios = [0, 1, 2, 3, 4].map(function (k) { var a = giroR + k / 5 * PI * 2; return cam.pt(add(cf, [lado * 0.005, Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5])); }), c0 = cam.pt(add(cf, [lado * 0.005, 0, 0]));
      var corC = luzDe(calota || '#c9ced6', nf);
      L.push({ d: cam.pt(cf).d - 0.01, f: function (c) {
        poligono(c, qf, luzDe('#26262e', nf)); poligono(c, qc, corC);
        c.strokeStyle = 'rgba(40,40,52,.55)'; c.lineWidth = Math.max(1, r * c0.s * 0.12); c.lineCap = 'round';
        c.beginPath(); raios.forEach(function (p) { c.moveTo(c0.x, c0.y); c.lineTo(p.x, p.y); }); c.stroke();
        c.fillStyle = 'rgba(40,40,52,.7)'; c.beginPath(); c.arc(c0.x, c0.y, Math.max(1, r * c0.s * 0.12), 0, PI * 2); c.fill();
      } });
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
  function texto(c, t, x, y, tam, cor, contorno) { c.save(); c.translate(x, y); c.scale(ASP, 1); c.font = '700 ' + tam + 'px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; if (contorno) { c.lineWidth = tam * 0.18; c.strokeStyle = contorno; c.lineJoin = 'round'; c.strokeText(t, 0, 0); } c.fillStyle = cor; c.fillText(t, 0, 0); c.restore(); }
  function emojiEm(c, e, x, y, tam) { c.save(); c.translate(x, y); c.scale(ASP, 1); c.font = tam + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, 0, 0); c.restore(); }
  function retangulo(c, x, y, w, h, cor) { c.fillStyle = cor; c.fillRect(x, y, w, h); }
  function circulo(c, x, y, r, cor) { c.fillStyle = cor; c.beginPath(); if (c.ellipse) c.ellipse(x, y, r * ASP, r, 0, 0, PI * 2); else c.arc(x, y, r, 0, PI * 2); c.fill(); }
  function lanternas(c, cor) { [12, 88].forEach(function (x) { circulo(c, x, 72, 7, cor || '#ff2a2a'); circulo(c, x - 2, 70, 2.5, 'rgba(255,255,255,.7)'); }); }
  function placa(c, t) { retangulo(c, 38, 74, 24, 11, '#ffffff'); texto(c, t, 50, 80, 8, '#1a1446'); }
  /* polícia (1.38.0, dono: "carro e moto de polícia com sirene vermelha e azul piscando"): o letreiro no idioma da
     estante e a sirene. Pisca como as de verdade: dois flashes do azul, dois do vermelho. Na corrida segue o relógio
     (op.t); nos quadros parados dos rivais, a fase (8 quadros = uma volta da sirene) */
  function policia() { var B = raiz.BolinhoIdioma, l = B && B.atual ? B.atual() : 'pt'; return l === 'en' ? 'POLICE' : l === 'es' ? 'POLICÍA' : 'POLÍCIA'; }
  // 1.38.0 (dono: "tem que ter sirene piscando"): sempre um lado aceso (azul, depois vermelho), com dois flashes fortes em cada vez
  function sirene(f, op) { var p = ((op.t ? op.t * 1.6 : f) % 1 + 1) % 1, sub = Math.floor((p % 0.5) / 0.5 * 4); return { azul: p < 0.5, verm: p >= 0.5, forte: sub % 2 === 0 }; }
  function luzSirene(cam, L, p, tam, aceso, cores, brilho, forte) {   // cores: [clara, viva, escura]; apagada fica escura
    bola(cam, L, p, tam[0], tam[1], tam[2], aceso ? (forte ? ['#ffffff', cores[0], cores[1]] : cores) : [cores[2], tom(cores[2], -0.3), tom(cores[2], -0.6)], -0.02);
    if (aceso) { luzinha(cam, L, p, brilho * (forte ? 1.5 : 1), cores[1], forte ? 0.95 : 0.7); luzinha(cam, L, p, brilho * (forte ? 3.2 : 2.2), cores[1], forte ? 0.35 : 0.2); luzinha(cam, L, p, brilho * 0.35, '#ffffff', forte ? 0.8 : 0.4); }
  }
  var AZUL = ['#bfe0ff', '#1f7bff', '#0b2f7a'], VERMELHO = ['#ffd0d0', '#ff2a2a', '#7a0a10'];
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
      [-0.85, 0.85].forEach(function (x) { luzinha(cam, L, [x, 0.95, -2.22], 0.5, '#ff4fd8', 0.45); }); fumaca(cam, L, [0.6, 0.35, -2.3]);
      [[-1, -1.4], [1, -1.4], [-1, 1.4], [1, 1.4]].forEach(function (w) { roda(cam, L, [w[0] * 0.95, 0.42, w[1]], 0.42, 0.32); });
    } },
    escolar: { alt: 4.2, y: 1.2, z: -2.2, larg: 1.15, comp: 3.6, montar: function (cam, L, cor, f, op) {
      var am = '#ffc20e', pisca = f % 0.5 < 0.25;
      var listras = function (c) { retangulo(c, 0, 0, 100, 100, am); [18, 40].forEach(function (y) { retangulo(c, 0, y, 100, 5, '#1a1a1a'); }); };
      caixa(cam, L, [0, 0.95, 0], [2.4, 1.2, 7.4], am, {   // parte de baixo, amarela com faixas pretas
        tras: function (c) { listras(c); retangulo(c, 36, 0, 28, 100, '#d9a400'); lanternas(c); retangulo(c, 38, 72, 24, 14, '#ffffff'); texto(c, 'BUS', 50, 79, 10, '#1a1446'); },
        esq: function (c) { listras(c); texto(c, 'ESCOLAR', 50, 74, 40, '#1a1a1a'); }, dir: function (c) { listras(c); texto(c, 'ESCOLAR', 50, 74, 40, '#1a1a1a'); }
      });
      var janelas = function (c) { for (var k = 0; k < 6; k++) { retangulo(c, k * 16.6, 0, 3, 100, am); emojiEm(c, ['🧒', '👧', '👦', '🧒', '👧', '👦'][k], 9 + k * 16.6, 56 + Math.sin(f * PI * 2 + k) * 5, 64); } retangulo(c, 0, 0, 100, 8, am); retangulo(c, 0, 92, 100, 8, am); };
      caixa(cam, L, [0, 2.0, 0], [2.4, 0.9, 7.4], '#26313f', { esq: janelas, dir: janelas, tras: function (c) { retangulo(c, 0, 0, 14, 100, am); retangulo(c, 86, 0, 14, 100, am); retangulo(c, 34, 0, 4, 100, am); retangulo(c, 62, 0, 4, 100, am); retangulo(c, 0, 0, 100, 8, am); emojiEm(c, '🧒', 24, 56, 62); emojiEm(c, '👧', 76, 56, 62); } }, { alfa: { tras: 0.45, esq: 0.6, dir: 0.6, frente: 0.6 }, sem: ['cima', 'baixo'] });
      caixa(cam, L, [0, 2.5, 0], [2.44, 0.14, 7.44], '#ffd84a', { tras: function (c) { texto(c, 'ESCOLAR', 50, 50, 70, '#1a1a1a'); } });   // teto
      piloto(cam, L, [0, 2.05, -2.9], 0.42, op);   // no último banco, olhando pela janela de trás
      caixa(cam, L, [0, 0.42, -3.75], [2.5, 0.26, 0.18], '#2a2a30');
      [[-0.85, pisca], [0.85, !pisca]].forEach(function (l) { bola(cam, L, [l[0], 2.62, -3.65], 0.16, 0.16, 0.08, l[1] ? ['#ffb3b3', '#ff2a2a', '#a00'] : ['#7a3a3a', '#4a1a1a', '#2a0a0a'], -0.05); });
      var abre = Math.max(0, Math.sin(f * PI * 2));   // placa de PARE abrindo do lado esquerdo
      caixa(cam, L, [-1.25 - abre * 0.45, 1.45, 2.2], [0.06 + abre * 0.9, 0.62, 0.62 * (1 - abre * 0.9) + 0.06], '#e63946', { esq: function (c) { texto(c, 'PARE', 50, 52, 24, '#ffffff'); }, tras: function (c) { texto(c, 'PARE', 50, 52, 24, '#ffffff'); } });
      [-0.85, 0.85].forEach(function (l, k) { if (k ? !pisca : pisca) luzinha(cam, L, [l, 2.62, -3.7], 0.6, '#ff3030', 0.6); }); fumaca(cam, L, [0.8, 0.35, -3.8]);
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
      fumaca(cam, L, [-1.25, 3.4, 2.6]); fumaca(cam, L, [1.25, 3.4, 2.6]);
      [[-1, -2.2], [1, -2.2], [-1, 2.1], [1, 2.1]].forEach(function (w) { roda(cam, L, [w[0] * 1.08, 0.45, w[1]], 0.45, 0.34, '#f4f4f4'); });
    } },
    pipoca: { alt: 3.3, y: 0.9, larg: 0.9, comp: 1.4, montar: function (cam, L, cor, f, op) {
      var listras = function (c) { for (var k = 0; k < 10; k++) retangulo(c, k * 10, 0, 5, 100, k % 2 ? '#ffffff' : '#ff3b4f'); };
      caixa(cam, L, [0, 0.85, 0], [1.6, 0.9, 2.4], '#ff3b4f', { tras: function (c) { listras(c); retangulo(c, 15, 30, 70, 30, '#ffd166'); texto(c, 'PIPOCA', 50, 46, 15, '#c2102a'); }, esq: function (c) { listras(c); texto(c, 'PIPOCA', 50, 50, 42, '#c2102a', '#ffd166'); }, dir: function (c) { listras(c); texto(c, 'PIPOCA', 50, 50, 42, '#c2102a', '#ffd166'); } });
      for (var k = 0; k < 14; k++) { var pul = Math.abs(Math.sin(f * PI * 2 + k)) * (k % 3 ? 0.04 : 0.22); bola(cam, L, [-0.5 + (k % 4) * 0.33, 1.45 + Math.floor(k / 4) * 0.12 + pul, 0.2 + ((k * 7) % 5) * 0.15], 0.11, 0.1, 0.11, ['#ffffff', '#fff6dc', '#e8d9b0']); }
      caixa(cam, L, [0, 1.75, 0.55], [1.3, 0.95, 1.1], '#fff5e0', null, { alfa: 0.3, sem: ['baixo'], vies: -0.2 });   // vidro da máquina
      caixa(cam, L, [0, 2.28, 0.55], [1.5, 0.1, 1.3], '#ff3b4f', { cima: listras, tras: listras });
      piloto(cam, L, [0, 1.75, -0.75], 0.4, op);
      [[-1, -0.8], [1, -0.8], [-1, 0.8], [1, 0.8]].forEach(function (w) { roda(cam, L, [w[0] * 0.82, 0.32, w[1]], 0.32, 0.2, '#f4f4f4'); });
    } },
    sorvete: { alt: 3.6, y: 0.9, larg: 0.9, comp: 1.4, montar: function (cam, L, cor, f, op) {
      var lado = function (c) { degrade(c, ['#c4eeff', '#5cc8f0']); [['#ff8fab', 25], ['#fff3b0', 50], ['#b388eb', 75]].forEach(function (b) { circulo(c, b[1], 40, 10, b[0]); }); texto(c, 'SORVETE', 50, 76, 26, '#ff4fa3'); };
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
      fumaca(cam, L, [0, 0.45, -2.0]);
      [[-1, -1.25], [1, -1.25], [-1, 1.25], [1, 1.25]].forEach(function (w) { roda(cam, L, [w[0] * 1.05, 0.42, w[1]], 0.42, 0.3); });
    } },
    // o Ovo correndo, sem carro (Humpty Dumpty, cantiga antiga; desenho próprio): corpo de ovo, gravata-borboleta,
    // bracinhos balançando, perninhas correndo e tênis. Ele mesmo é o piloto (vira para olhar com a cara dele).
    ovo: { alt: 3.4, y: 1.3, larg: 0.7, comp: 0.7, semPiloto: true, montar: function (cam, L, cor, f, op) {
      // 1.25.0 (dono): correndo, as pernas giram super rápido (com o borrão da roda de pernas, como nos desenhos
      // animados); pulando, faz a pose do pulo: uma perna esticada para a frente, a outra para trás, braços para cima
      var voo = op.voo || 0, a = voo ? 0 : Math.sin(relogio * 34), pulo = voo ? 0.15 : Math.abs(Math.cos(relogio * 34)) * 0.06;
      [-1, 1].forEach(function (l) {
        var quad = [l * 0.3, 1.0 + pulo, 0], pe = voo ? [l * 0.3, 0.45 + (l > 0 ? 0.25 : 0), l > 0 ? 0.6 : -0.55] : [l * 0.32, 0.12 + Math.max(0, l * a) * 0.4, l * a * 0.6];
        if (!voo) disco(cam, L, [l * 0.32, 0.55, 0.02], [0, 0.42, 0], [0, 0, 0.62], '#ffffff', 0.45, 0.05);   // o borrão das pernas girando
        cano(cam, L, quad, pe, 0.09, 0.07, '#f4f1e8');
        caixa(cam, L, [pe[0], pe[1] - 0.02, pe[2] + 0.1], [0.3, 0.2, 0.5], '#ff4fa3', { tras: function (c) { retangulo(c, 0, 60, 100, 40, '#ffffff'); } });
        var omb = [l * 0.62, 1.95 + pulo, 0], mao = voo ? [l * 1.0, 2.6 + pulo, 0.1] : [l * 0.85, 1.45 + pulo, -l * a * 0.5];
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
      var a = Math.sin(relogio * 20), voo = op.voo || 0, bat = Math.sin((op.t || 0) * 26), BR = ['#ffffff', '#f2f2f8', '#c9c9d8'];   // 1.25.0: perninhas bem rápidas
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
      if (voo) for (var pk = 0; pk < 5; pk++) {   // pulando: penas soltas voando em volta (1.22.0)
        var pf = (relogio * 0.9 + pk / 5) % 1, pa = pk * 1.3 + relogio * 2, pp = [Math.cos(pa) * (0.6 + pf), 1.2 + pf * 1.4, Math.sin(pa) * 0.6 - pf * 1.2];
        chapa(cam, L, [pp, add(pp, [0.12 * Math.cos(pa * 3), 0.04, 0.05]), add(pp, [0.1, -0.08, 0.02])], '#ffffff', { alfa: 1 - pf });
      }
      bola(cam, L, [0, 1.95, -0.05], 0.22, 0.24, 0.17, tres(cor), -0.2);   // quem monta: o corpo
      piloto(cam, L, [0, 2.38, -0.1], 0.36, op);
    } },

    // ---------- 1.15.0: os carros antigos e o trenó também em 3D (dono: "o trenó e os carros também podiam aparecer a lateral") ----------
    classico: { alt: 3.3, y: 0.95, larg: 1.05, comp: 2.25, montar: function (cam, L, cor, f, op) {
      var esc = tom(cor, -0.35), cla = tom(cor, 0.3);
      // 1.21.0: carroceria arredondada (casco), com friso claro dos lados
      casco(cam, L, [
        { z: -2.2, y: 0.72, w: 0.9, h: 0.28, n: 3 }, { z: -1.9, y: 0.74, w: 1.0, h: 0.34, n: 3.4 }, { z: -0.5, y: 0.75, w: 1.0, h: 0.35, n: 3.6 },
        { z: 1.0, y: 0.73, w: 1.0, h: 0.34, n: 3.6 }, { z: 1.9, y: 0.69, w: 0.98, h: 0.3, n: 3.2 }, { z: 2.25, y: 0.63, w: 0.85, h: 0.22, n: 2.8 }
      ], cor, { pinta: function (k) { return k === 0 || k === 8 ? cla : null; } });
      var pil = function (c) { retangulo(c, 0, 0, 7, 100, cor); retangulo(c, 93, 0, 7, 100, cor); };
      tronco(cam, L, [0, 1.45, -0.3], [1.86, 2.5], [1.56, 1.6, -0.1], 0.8, '#8fcbec', { tras: pil, frente: pil, esq: pil, dir: pil, cima: function (c) { retangulo(c, 0, 0, 100, 100, cor); retangulo(c, 0, 0, 100, 12, cla); } }, { alfa: { tras: 0.45, frente: 0.45, esq: 0.5, dir: 0.5 }, sem: ['baixo'] });
      piloto(cam, L, [0, 1.42, -0.45], 0.4, op);
      [-0.62, 0.62].forEach(function (x) { bola(cam, L, [x, 0.8, -2.22], 0.16, 0.1, 0.04, ['#ffd0d0', '#ff2a2a', '#9a0010'], -0.02); luzinha(cam, L, [x, 0.8, -2.25], 0.5, '#ff3030'); });
      caixa(cam, L, [0, 0.66, -2.24], [0.5, 0.15, 0.02], '#ffffff', { tras: function (c) { texto(c, 'VRUUM', 50, 52, 34, '#1a1446'); } });
      [-2.22, 2.22].forEach(function (z) { caixa(cam, L, [0, 0.45, z], [2.08, 0.16, 0.12], '#d9dde3'); });   // para-choques cromados
      [-0.6, 0.6].forEach(function (x) { bola(cam, L, [x, 0.7, 2.25], 0.15, 0.12, 0.05, ['#ffffff', '#fff7c2', '#c9b870'], -0.02); });
      bola(cam, L, [0.55, 0.38, -2.25], 0.06, 0.06, 0.06, ['#e9edf2', '#9aa0a6', '#3a3a44'], -0.03); fumaca(cam, L, [0.55, 0.38, -2.3]);
      [[-1, -1.35], [1, -1.35], [-1, 1.35], [1, 1.35]].forEach(function (w) { roda(cam, L, [w[0] * 0.95, 0.4, w[1]], 0.4, 0.3); });
    } },
    /* viatura de polícia (1.38.0; dono: "realista, nada de caixa quadrada, formato parecido com um SUV compacto", sem marca):
       SUV alto e arredondado — carroceria de casco com a faixa preta de plástico embaixo e nos para-lamas, portas brancas
       com POLÍCIA, cabine com vidro de trás deitado, colunas pretas, teto branco com rack, aerofólio, lanternas finas
       deitadas e rodas grandes. Em cima, a barra da sirene: azul de um lado e vermelho do outro, sempre piscando */
    policia: { alt: 3.7, y: 1.2, larg: 1.05, comp: 2.3, montar: function (cam, L, cor, f, op) {
      var esc = tom(cor, -0.55), BR = '#f4f6fa', PR = '#25272c', s = sirene(f, op), nome = policia();
      casco(cam, L, [
        { z: -2.25, y: 1.02, w: 0.86, h: 0.36, n: 3 }, { z: -2.05, y: 1.04, w: 0.95, h: 0.47, n: 3.6 }, { z: -1.2, y: 1.04, w: 0.99, h: 0.5, n: 4 },
        { z: 0.6, y: 1.0, w: 0.99, h: 0.49, n: 4 }, { z: 1.7, y: 0.93, w: 0.97, h: 0.41, n: 3.4 }, { z: 2.3, y: 0.85, w: 0.86, h: 0.3, n: 2.8 }
      ], esc, { pinta: function (k, p) {
        if (p[1] < 0.7) return PR;   // faixa de plástico preto embaixo
        return p[2] > -1.7 && p[2] < 0.9 && (k <= 2 || k >= 14 || (k >= 6 && k <= 10)) ? BR : null;   // portas brancas
      } });
      var col = function (c) { retangulo(c, 0, 0, 9, 100, PR); retangulo(c, 91, 0, 9, 100, PR); };
      var lat = function (c) { retangulo(c, 0, 0, 7, 100, PR); retangulo(c, 46, 0, 5, 100, PR); retangulo(c, 93, 0, 7, 100, PR); };
      tronco(cam, L, [0, 1.84, -0.45], [1.86, 3.1], [1.56, 1.95, -0.15], 0.66, '#7fb6d6', { tras: col, frente: col, esq: lat, dir: lat, cima: function (c) { retangulo(c, 0, 0, 100, 100, BR); } }, { alfa: { tras: 0.5, frente: 0.45, esq: 0.55, dir: 0.55 }, sem: ['baixo'] });
      piloto(cam, L, [0, 1.8, -0.55], 0.4, op);
      [-1, 1].forEach(function (l) { caixa(cam, L, [l * 0.6, 2.21, -0.55], [0.06, 0.06, 1.8], '#b8bec6'); });   // rack do teto
      caixa(cam, L, [0, 2.15, -1.48], [1.5, 0.05, 0.32], PR);   // aerofólio
      var porta = function (c) { texto(c, nome, 50, 54, 64, '#1a1446'); };
      painelEmPartes(cam, L, [[1.0, 1.32, -1.55], [1.0, 1.32, 0.55], [1.0, 0.92, 0.55], [1.0, 0.92, -1.55]], 5, BR, porta, { vies: -0.4 });
      painelEmPartes(cam, L, [[-1.0, 1.32, 0.55], [-1.0, 1.32, -1.55], [-1.0, 0.92, -1.55], [-1.0, 0.92, 0.55]], 5, BR, porta, { vies: -0.4 });
      // barra da sirene no teto: base preta, azul de um lado e vermelho do outro
      caixa(cam, L, [0, 2.24, -0.4], [1.4, 0.08, 0.38], PR);
      caixa(cam, L, [0, 2.34, -0.4], [0.18, 0.13, 0.32], '#d9dde3');
      luzSirene(cam, L, [-0.4, 2.34, -0.4], [0.32, 0.12, 0.18], s.azul, AZUL, 1.7, s.forte);
      luzSirene(cam, L, [0.4, 2.34, -0.4], [0.32, 0.12, 0.18], s.verm, VERMELHO, 1.7, s.forte);
      // traseira: lanternas finas deitadas, placa, para-choque preto
      [-1, 1].forEach(function (l) {
        caixa(cam, L, [l * 0.58, 1.3, -2.2], [0.6, 0.13, 0.06], '#c1121f', { tras: function (c) { degrade(c, ['#ff7b7b', '#d62828', '#7a0a10']); retangulo(c, l < 0 ? 70 : 0, 30, 30, 40, '#ffe3e3'); } });
        luzinha(cam, L, [l * 0.62, 1.3, -2.26], 0.55, '#ff3030', 0.55);
      });
      caixa(cam, L, [0, 0.95, -2.3], [0.78, 0.17, 0.02], '#ffffff', { tras: function (c) { retangulo(c, 0, 0, 100, 18, '#1f4fbf'); texto(c, nome, 50, 60, 42, '#1a1446'); } });
      caixa(cam, L, [0, 0.66, -2.2], [1.95, 0.26, 0.16], PR);
      [-0.6, 0.6].forEach(function (x) { bola(cam, L, [x, 1.0, 2.3], 0.17, 0.08, 0.05, ['#ffffff', '#e8f4ff', '#a8b8c8'], -0.02); });
      bola(cam, L, [0.55, 0.55, -2.25], 0.06, 0.06, 0.06, ['#e9edf2', '#9aa0a6', '#3a3a44'], -0.03); fumaca(cam, L, [0.55, 0.55, -2.3]);
      [[-1, -1.45], [1, -1.45], [-1, 1.45], [1, 1.45]].forEach(function (w) { roda(cam, L, [w[0] * 0.95, 0.5, w[1]], 0.5, 0.34, '#d0d5dc'); });
    } },
    gt: { alt: 3.1, y: 0.8, larg: 1.1, comp: 2.3, montar: function (cam, L, cor, f, op) {
      var esc = tom(cor, -0.4);
      // 1.21.0: traseira redonda e baixa (casco), duas faixas brancas por cima
      casco(cam, L, [
        { z: -2.25, y: 0.62, w: 0.9, h: 0.22, n: 2.4 }, { z: -1.9, y: 0.66, w: 1.07, h: 0.32, n: 2.6 }, { z: -1.0, y: 0.67, w: 1.1, h: 0.33, n: 2.8 },
        { z: 0.5, y: 0.63, w: 1.02, h: 0.3, n: 2.8 }, { z: 1.6, y: 0.6, w: 1.05, h: 0.3, n: 2.6 }, { z: 2.25, y: 0.52, w: 0.8, h: 0.18, n: 2.2 }
      ], cor, { pinta: function (k, p) { return (k === 3 || k === 4) && Math.abs(p[0]) > 0.06 && Math.abs(p[0]) < 0.32 ? '#ffffff' : null; } });
      var pil = function (c) { retangulo(c, 0, 0, 8, 100, cor); retangulo(c, 92, 0, 8, 100, cor); };
      tronco(cam, L, [0, 1.28, 0.1], [1.8, 2.3], [1.3, 1.0, -0.25], 0.7, '#8fcbec', { tras: pil, frente: pil, esq: pil, dir: pil, cima: function (c) { retangulo(c, 0, 0, 100, 100, cor); retangulo(c, 40, 0, 7, 100, '#ffffff'); retangulo(c, 53, 0, 7, 100, '#ffffff'); } }, { alfa: { tras: 0.45, frente: 0.45, esq: 0.5, dir: 0.5 }, sem: ['baixo'] });
      piloto(cam, L, [0, 1.25, -0.05], 0.36, op, -0.4);
      caixa(cam, L, [0, 0.93, -2.05], [1.85, 0.07, 0.3], esc);   // rabinho de pato
      for (var k = 0; k < 7; k++) bola(cam, L, [-0.66 + k * 0.22, 0.7, -2.22], 0.11, 0.05, 0.03, ['#ffb3b3', '#e01e1e', '#8a0010'], -0.02);   // lanterna em faixa
      [-0.68, 0.68].forEach(function (x) { luzinha(cam, L, [x, 0.7, -2.26], 0.45, '#ff3030'); });
      caixa(cam, L, [0, 0.52, -2.22], [0.5, 0.14, 0.02], '#ffffff', { tras: function (c) { texto(c, 'G T', 50, 52, 50, '#1a1446'); } });
      [-0.16, 0.16].forEach(function (x) { bola(cam, L, [x, 0.4, -2.2], 0.06, 0.06, 0.06, ['#e9edf2', '#9aa0a6', '#3a3a44'], -0.03); });
      fumaca(cam, L, [0, 0.4, -2.3]);
      [[-1, -1.4, 0.44], [1, -1.4, 0.44], [-1, 1.4, 0.4], [1, 1.4, 0.4]].forEach(function (w) { roda(cam, L, [w[0] * 1.0, w[2], w[1]], w[2], 0.34); });
    } },
    super: { alt: 3.0, y: 0.75, larg: 1.2, comp: 2.4, montar: function (cam, L, cor, f, op) {
      var esc = tom(cor, -0.4), cla = tom(cor, 0.3);
      // 1.21.0: cunha arredondada (casco), entradas de ar pretas dos lados
      casco(cam, L, [
        { z: -2.35, y: 0.6, w: 1.0, h: 0.24, n: 3 }, { z: -2.0, y: 0.62, w: 1.18, h: 0.3, n: 3.2 }, { z: -0.8, y: 0.6, w: 1.18, h: 0.3, n: 3.2 },
        { z: 0.6, y: 0.52, w: 1.1, h: 0.26, n: 3 }, { z: 1.7, y: 0.44, w: 1.05, h: 0.2, n: 2.6 }, { z: 2.35, y: 0.36, w: 0.85, h: 0.12, n: 2.2 }
      ], cor, { pinta: function (k, p) { return (k === 0 || k === 8 || k === 1 || k === 7) && p[2] > -1.5 && p[2] < -0.3 ? '#1b1b22' : null; } });
      var pil = function (c) { retangulo(c, 0, 0, 6, 100, cor); retangulo(c, 94, 0, 6, 100, cor); };
      tronco(cam, L, [0, 1.08, 0.25], [1.7, 2.1], [1.2, 0.9, -0.2], 0.56, '#7fbde6', { tras: pil, frente: pil, esq: pil, dir: pil, cima: function (c) { retangulo(c, 0, 0, 100, 100, cor); } }, { alfa: { tras: 0.45, frente: 0.45, esq: 0.5, dir: 0.5 }, sem: ['baixo'] });
      piloto(cam, L, [0, 1.0, 0.05], 0.34, op, -0.6);
      [-0.75, 0.75].forEach(function (x) { caixa(cam, L, [x, 0.9, -2.0], [0.08, 0.2, 0.1], '#1b1b22'); });   // pés do aerofólio
      caixa(cam, L, [0, 1.02, -2.05], [2.3, 0.07, 0.55], esc, { cima: function (c) { retangulo(c, 0, 0, 100, 30, cla); } });   // aerofólio
      [-0.82, -0.55, 0.55, 0.82].forEach(function (x) { bola(cam, L, [x, 0.66, -2.34], 0.09, 0.09, 0.03, ['#ffd0d0', '#ff2a2a', '#9a0010'], -0.02); luzinha(cam, L, [x, 0.66, -2.37], 0.35, '#ff3030', 0.4); });
      caixa(cam, L, [0, 0.42, -2.3], [1.7, 0.14, 0.12], '#1b1b22');   // difusor
      [-0.5, -0.32, 0.32, 0.5].forEach(function (x) { bola(cam, L, [x, 0.42, -2.37], 0.06, 0.06, 0.04, ['#e9edf2', '#9aa0a6', '#3a3a44'], -0.03); });
      fumaca(cam, L, [-0.41, 0.42, -2.4]); fumaca(cam, L, [0.41, 0.42, -2.4]);
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
      fumaca(cam, L, [0.6, 0.6, -1.4]);
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
      [-0.95, 0.95].forEach(function (x) { luzinha(cam, L, [x, 2.0, -2.25], 0.6, '#ff3030'); }); fumaca(cam, L, [0.7, 1.2, -2.3]); fumaca(cam, L, [-0.7, 1.2, -2.3]);
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
    // moto de polícia (1.38.0): branca, carenagem com para-brisa na frente, malas dos lados e baú atrás com POLÍCIA;
    // em cima do baú, a sirene azul e vermelha piscando
    motopolicia: { alt: 3.5, y: 1.0, larg: 0.5, comp: 1.45, montar: function (cam, L, cor, f, op) {
      var BR = '#f4f6fa', CZ = '#2a2d3a', s = sirene(f, op), nome = policia();
      roda(cam, L, [0, 0.42, -0.95], 0.42, 0.26, '#3a3a44'); roda(cam, L, [0, 0.42, 1.05], 0.42, 0.2, '#3a3a44');
      caixa(cam, L, [0, 0.82, -1.0], [0.34, 0.08, 0.7], BR);   // para-lama
      caixa(cam, L, [0, 0.62, -1.38], [0.3, 0.22, 0.04], '#ffffff', { tras: function (c) { texto(c, '190', 50, 55, 48, '#1a1446'); } });   // placa
      cano(cam, L, [0.22, 0.45, -0.2], [0.26, 0.6, -1.15], 0.07, 0.08, '#9aa0a6');   // escape
      caixa(cam, L, [0, 0.62, 0.1], [0.4, 0.4, 0.9], CZ);   // motor
      tronco(cam, L, [0, 1.02, 0.35], [0.5, 0.9], [0.36, 0.6, -0.05], 0.36, BR, { cima: function (c) { retangulo(c, 40, 0, 20, 100, '#1f4fbf'); } });   // tanque
      tronco(cam, L, [0, 1.05, 0.95], [0.7, 0.4], [0.5, 0.2, 0.05], 0.5, BR, { tras: function (c) { retangulo(c, 0, 70, 100, 30, '#1f4fbf'); } });   // carenagem
      chapa(cam, L, [[-0.26, 1.3, 0.9], [0.26, 1.3, 0.9], [0.2, 1.72, 0.8], [-0.2, 1.72, 0.8]], '#bfe4f7', { alfa: 0.45 });   // para-brisa
      caixa(cam, L, [0, 0.98, -0.45], [0.42, 0.14, 0.8], '#1b1b22');   // banco
      [-1, 1].forEach(function (l) {   // malas dos lados, com o letreiro
        var lado = function (c) { retangulo(c, 0, 0, 100, 100, BR); retangulo(c, 0, 62, 100, 16, '#1f4fbf'); texto(c, nome, 50, 36, 22, '#1a1446'); };
        caixa(cam, L, [l * 0.38, 0.78, -0.95], [0.26, 0.38, 0.62], BR, { esq: lado, dir: lado, tras: function (c) { circulo(c, 50, 30, 12, '#ff2a2a'); } });
      });
      caixa(cam, L, [0, 1.25, -1.2], [0.58, 0.42, 0.42], BR, { tras: function (c) { retangulo(c, 0, 60, 100, 20, '#1f4fbf'); texto(c, nome, 50, 34, 20, '#1a1446'); } });   // baú
      [-1, 1].forEach(function (l) {   // duas hastes atrás do baú, bem altas (aparecem dos lados do piloto): azul e vermelha
        cano(cam, L, [l * 0.24, 1.45, -1.32], [l * 0.3, 2.3, -1.32], 0.025, 0.02, '#9aa0a6');
        luzSirene(cam, L, [l * 0.3, 2.38, -1.32], [0.11, 0.13, 0.11], l < 0 ? s.azul : s.verm, l < 0 ? AZUL : VERMELHO, 1.3, s.forte);
      });
      cano(cam, L, [0, 0.75, 0.95], [0, 1.25, 0.75], 0.05, 0.05, '#9aa0a6'); cano(cam, L, [-0.5, 1.3, 0.72], [0.5, 1.3, 0.72], 0.035, 0.035, '#3a3a44');   // garfo e guidão
      bola(cam, L, [0, 1.48, -0.25], 0.32, 0.42, 0.26, tres(cor));   // jaqueta
      caixa(cam, L, [0, 1.3, -0.5], [0.4, 0.06, 0.02], '#ffffff');   // listra da jaqueta
      [-1, 1].forEach(function (l) {
        cano(cam, L, [l * 0.3, 1.7, -0.15], [l * 0.48, 1.32, 0.7], 0.09, 0.07, tom(cor, -0.35)); bola(cam, L, [l * 0.5, 1.3, 0.72], 0.08, 0.08, 0.08, tres('#222'));   // braços e luvas
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
      [-0.56, 0.56].forEach(function (x) { luzinha(cam, L, [x, 0.73, -2.27], 0.45, '#ff3030', 0.45); }); fumaca(cam, L, [0.43, 0.45, -2.2]);
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
      [-0.85, 0.85].forEach(function (x) { rastro(cam, L, [x, 0.15, -1.3], '#fff3a0', 0.06, 3.5); });   // purpurina mágica dos esquis
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
        if (k === 4) { bola(cam, L, [x, y + 0.48, z + 0.83], 0.07, 0.07, 0.07, ['#ffb3b3', '#ff2a2a', '#a00000'], -0.03); luzinha(cam, L, [x, y + 0.48, z + 0.86], 0.5, '#ff3030', 0.6 + 0.3 * Math.sin(relogio * 6)); }   // o nariz vermelho, brilhando
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
      var pisca = (relogio * 1.5) % 1 < 0.25;
      luzinha(cam, L, [-2.62, 0.82, 0.45], 0.45, '#ff3b3b', pisca ? 0.9 : 0.35); luzinha(cam, L, [2.62, 0.82, 0.45], 0.45, '#4cd964', pisca ? 0.9 : 0.35);
      rastro(cam, L, [-2.62, 0.82, 0.05], '#ffffff'); rastro(cam, L, [2.62, 0.82, 0.05], '#ffffff');
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
      luzinha(cam, L, [0, 1.0, -2.75], 1.1, '#ffb347', 0.5 * chama);   // clarão do motor
      [-1, 1].forEach(function (l) { rastro(cam, L, [l * 2.4, 0.9, -1.65], '#ffffff', 0.05); luzinha(cam, L, [l * 2.42, 0.9, -1.4], 0.4, l < 0 ? '#ff3b3b' : '#4cd964', (relogio * 1.5) % 1 < 0.25 ? 0.9 : 0.3); });
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
      luzinha(cam, L, [0, 0.95, -1.12], 0.6, '#ff3b3b', (relogio * 1.2) % 1 < 0.2 ? 0.95 : 0.15); luzinha(cam, L, [0, 2.4, 0], 0.5, '#ffffff', (relogio * 1.2 + 0.5) % 1 < 0.12 ? 0.9 : 0);
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
      [-0.25, 0.25].forEach(function (x) { bola(cam, L, [x, 1.42, -0.35], 0.05, 0.05, 0.05, ['#e8ffff', '#7cf9ff', '#1aa0b0'], -0.05); luzinha(cam, L, [x, 1.42, -0.37], 0.3, '#7cf9ff', 0.5 + 0.3 * Math.sin(relogio * 4 + x * 9)); });   // pintas que brilham
      rastro(cam, L, [0, 1.1, -2.1], '#7cf9ff', 0.05, 2.5);
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
        bola(cam, L, [l * 0.13, 1.82, 1.12], 0.07, 0.07, 0.04, ['#fff3a0', '#ffd23f', '#a07a00'], -0.02); luzinha(cam, L, [l * 0.13, 1.82, 1.15], 0.3, '#ffd23f', 0.6);
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
    } },

    // ---------- 1.20.0 ----------
    /* patins de 4 rodinhas (dono, 14/Nov/2026): uma pessoa de capacete patinando de verdade. A passada: uma perna
       empurra para o lado e para trás enquanto a outra desliza; o corpo vai para cima da perna que desliza,
       inclinado para a frente, e os braços balançam ao contrário das pernas. fase: um ciclo = uma passada de cada lado */
    patins: { alt: 3.6, y: 1.2, larg: 0.5, comp: 0.6, montar: function (cam, L, cor, f, op) {
      var s = Math.sin(f * PI * 2), sway = -s * 0.12, bob = Math.abs(s) * 0.05, ROUPA = tom(cor, -0.35), PELE = '#f2c9a0', BOTA = '#f4f4f8';
      var hipC = [sway, 1.12 - bob, 0];
      [-1, 1].forEach(function (l) {
        var p = l < 0 ? s : -s, empurra = Math.max(0, p), volta = Math.max(0, -p);
        var quadril = [l * 0.15 + sway, 1.12 - bob, 0];
        var pe = [l * (0.2 + empurra * 0.42) + sway * 0.3, 0.2 + volta * 0.14, -empurra * 0.38 + volta * 0.1];
        var joelho = [(quadril[0] + pe[0]) / 2 + l * 0.04, 0.66 + volta * 0.1, Math.max(quadril[2], pe[2]) + 0.26];
        cano(cam, L, quadril, joelho, 0.13, 0.1, op.corpo === 'menina' ? PELE : '#2a2d3a');   // coxa (de saia, a perna aparece)
        bola(cam, L, joelho, 0.11, 0.1, 0.1, tres(cor), -0.01);   // joelheira
        cano(cam, L, joelho, add(pe, [0, 0.12, 0.02]), 0.085, 0.07, PELE);   // canela
        // o patins: bota, base, freio na frente e 4 rodinhas
        caixa(cam, L, [pe[0], pe[1] + 0.1, pe[2] + 0.06], [0.22, 0.26, 0.44], BOTA, { tras: function (c) { retangulo(c, 0, 0, 100, 18, cor); }, esq: function (c) { retangulo(c, 0, 0, 100, 18, cor); retangulo(c, 30, 45, 40, 10, cor); }, dir: function (c) { retangulo(c, 0, 0, 100, 18, cor); retangulo(c, 30, 45, 40, 10, cor); } });
        caixa(cam, L, [pe[0], pe[1] - 0.06, pe[2] + 0.06], [0.2, 0.05, 0.48], '#9aa0a6');
        bola(cam, L, [pe[0], pe[1] - 0.08, pe[2] + 0.33], 0.06, 0.06, 0.06, tres('#e63946'));
        [-1, 1].forEach(function (lx) { [-0.1, 0.22].forEach(function (dz) { roda(cam, L, [pe[0] + lx * 0.1, pe[1] - 0.12, pe[2] + dz], 0.075, 0.07, '#ffd166'); }); });
        // braço: balança ao contrário da perna e abre um pouco para o lado quando ela empurra
        var ombro = [l * 0.27 + sway * 0.8, 1.78 - bob, 0.2], mao = [l * (0.42 + empurra * 0.18) + sway * 0.6, 1.3 - bob, 0.2 - p * 0.42];
        var cotovelo = [(ombro[0] + mao[0]) / 2 + l * 0.08, (ombro[1] + mao[1]) / 2 - 0.02, (ombro[2] + mao[2]) / 2 - 0.05];
        cano(cam, L, ombro, cotovelo, 0.08, 0.07, cor); cano(cam, L, cotovelo, mao, 0.065, 0.055, PELE);
        bola(cam, L, cotovelo, 0.08, 0.08, 0.08, tres(ROUPA), -0.01);   // cotoveleira
        bola(cam, L, mao, 0.07, 0.07, 0.07, tres(PELE));
      });
      if (op.corpo === 'menina') tronco(cam, L, [hipC[0], hipC[1] - 0.04, hipC[2]], [0.6, 0.5], [0.36, 0.3, 0], 0.3, tom(cor, 0.25));   // saia rodada
      else bola(cam, L, hipC, 0.22, 0.16, 0.16, tres('#2a2d3a'));   // bermuda
      bola(cam, L, [sway * 0.85, 1.5 - bob, 0.12], 0.25, 0.36, 0.19, tres(cor));   // tronco (camiseta), inclinado para a frente
      caixa(cam, L, [sway * 0.85, 1.5 - bob, -0.08], [0.24, 0.08, 0.02], '#ffffff');   // listra nas costas
      piloto(cam, L, [sway * 0.8, 2.12 - bob, 0.22], 0.34, op);
    } },
    /* caminhão guincho: cabine alta lá na frente (o piloto aparece pelo vidro de trás), carroceria com faixas de
       atenção, braço do guincho em "A" (dois braços amarelos) com o cabo e o gancho balançando, giroflex piscando no
       teto, chaminés cromadas e rodas grandes (duplas atrás) */
    guincho: { alt: 4.6, y: 1.4, z: 0.4, larg: 1.25, comp: 3.0, montar: function (cam, L, cor, f, op) {
      var AM = '#ffc20e', pisca = f % 0.5 < 0.25, bal = Math.sin(f * PI * 2) * 0.18;
      var atencao = function (c) { retangulo(c, 0, 0, 100, 100, '#1b1b22'); c.fillStyle = AM; for (var k = -2; k < 8; k++) { c.beginPath(); c.moveTo(k * 16, 100); c.lineTo(k * 16 + 8, 100); c.lineTo(k * 16 + 28, 0); c.lineTo(k * 16 + 20, 0); c.closePath(); c.fill(); } };
      caixa(cam, L, [0, 0.95, -0.9], [2.3, 0.5, 4.0], '#3a3a44', { tras: function (c) { atencao(c); lanternas(c); placa(c, 'GUINCHO'); }, esq: function (c) { retangulo(c, 0, 0, 100, 30, AM); }, dir: function (c) { retangulo(c, 0, 0, 100, 30, AM); } });   // carroceria
      caixa(cam, L, [0, 1.75, 1.75], [2.4, 1.1, 1.5], cor, { esq: function (c) { texto(c, 'GUINCHO', 50, 66, 34, '#ffffff', '#1a1446'); }, dir: function (c) { texto(c, 'GUINCHO', 50, 66, 34, '#ffffff', '#1a1446'); }, tras: function (c) { retangulo(c, 0, 0, 100, 12, tom(cor, -0.3)); } });   // cabine (parte de baixo)
      caixa(cam, L, [0, 2.65, 1.75], [2.4, 0.7, 1.5], '#26313f', { tras: function (c) { retangulo(c, 0, 0, 8, 100, cor); retangulo(c, 92, 0, 8, 100, cor); }, esq: function (c) { retangulo(c, 0, 0, 8, 100, cor); retangulo(c, 92, 0, 8, 100, cor); }, dir: function (c) { retangulo(c, 0, 0, 8, 100, cor); retangulo(c, 92, 0, 8, 100, cor); } }, { alfa: { tras: 0.45, frente: 0.5, esq: 0.55, dir: 0.55 }, sem: ['cima', 'baixo'] });   // vidros
      caixa(cam, L, [0, 3.06, 1.75], [2.44, 0.12, 1.54], tom(cor, -0.2));   // teto
      piloto(cam, L, [0, 2.6, 1.5], 0.45, op);
      caixa(cam, L, [0, 1.35, 3.0], [2.3, 0.9, 1.1], cor, { frente: function (c) { retangulo(c, 15, 20, 70, 50, '#c9ced6'); [12, 88].forEach(function (x) { circulo(c, x, 40, 9, '#fff7c2'); }); } });   // capô
      [-1, 1].forEach(function (l) {   // chaminés cromadas atrás da cabine
        cano(cam, L, [l * 1.05, 1.3, 0.85], [l * 1.05, 3.5, 0.85], 0.09, 0.09, '#d9dde3');
        bola(cam, L, [l * 1.05, 3.55, 0.85], 0.1, 0.05, 0.1, tres('#2a2a30'), -0.02);
      });
      [-0.6, 0, 0.6].forEach(function (x, k) { bola(cam, L, [x, 3.22, 1.9], 0.16, 0.1, 0.12, (pisca ? k !== 1 : k === 1) ? ['#fff3c0', '#ffb703', '#a06000'] : ['#8a6a30', '#5a4420', '#3a2a10'], -0.02); });   // giroflex
      // braço do guincho em A: dos dois lados da carroceria até a ponta lá atrás, com o cabo e o gancho
      var base = -0.2, ponta = [0, 2.9, -3.0];
      [-1, 1].forEach(function (l) { cano(cam, L, [l * 0.75, 1.25, base], [l * 0.25, ponta[1], ponta[2]], 0.13, 0.09, AM); cano(cam, L, [l * 0.75, 1.25, base - 1.2], [l * 0.45, 2.1, -2.2], 0.07, 0.06, '#9aa0a6'); });
      cano(cam, L, [-0.3, ponta[1], ponta[2]], [0.3, ponta[1], ponta[2]], 0.1, 0.1, AM);
      bola(cam, L, ponta, 0.16, 0.16, 0.12, tres('#3a3a44'), -0.02);   // roldana
      var gancho = [Math.sin(bal) * 0.9, ponta[1] - 1.25, ponta[2] - Math.abs(bal) * 0.3];
      cano(cam, L, ponta, gancho, 0.025, 0.025, '#222');
      bola(cam, L, add(gancho, [0, -0.08, 0]), 0.1, 0.12, 0.1, tres('#e63946'), -0.01);
      cano(cam, L, add(gancho, [0, -0.15, 0]), add(gancho, [0.12, -0.38, 0]), 0.04, 0.04, '#9aa0a6');
      cano(cam, L, add(gancho, [0.12, -0.38, 0]), add(gancho, [-0.06, -0.42, 0]), 0.04, 0.035, '#9aa0a6');
      [-0.6, 0, 0.6].forEach(function (x, k) { if (pisca ? k !== 1 : k === 1) luzinha(cam, L, [x, 3.25, 1.9], 0.9, '#ffb703', 0.6); });   // giroflex acendendo em volta
      [-1.05, 1.05].forEach(function (x) { fumaca(cam, L, [x, 3.6, 0.85]); });
      [[-1, -2.2], [1, -2.2], [-1, -1.1], [1, -1.1], [-1, 2.7], [1, 2.7]].forEach(function (w) { roda(cam, L, [w[0] * 1.08, 0.6, w[1]], 0.6, 0.48, '#c9ced6'); });
    } },
    /* skate em 3D (1.22.0; antes era um desenho de costas em quadros): o pé da frente fica no shape e o de trás rema.
       fase (como o faseSkate do desenho.js): 0 a 0,45 o pé de trás empurra o chão (vai para trás); 0,45 a 0,65 levanta
       e volta; 0,65 a 1 descansa no tail, deslizando. Os braços abrem para equilibrar. Menina de saia, menino de bermuda */
    skate: { alt: 3.6, y: 1.15, larg: 0.4, comp: 0.9, montar: function (cam, L, cor, f, op) {
      var PELE = '#f2c9a0', esc = tom(cor, -0.35), pe2, agacha, u;
      if (f < 0.45) { u = f / 0.45; pe2 = [0.3, 0.07, 0.2 - u * 0.95]; agacha = 0.14; }
      else if (f < 0.65) { u = (f - 0.45) / 0.2; pe2 = [0.3 - u * 0.12, 0.07 + Math.sin(u * PI) * 0.22 + u * 0.24, -0.75 + u * 0.2]; agacha = 0.1; }
      else { pe2 = [0.14, 0.31, -0.55]; agacha = 0.03; }
      // o shape: lixa preta em cima, desenho na cor por baixo, tails levantados, eixos e 4 rodinhas
      caixa(cam, L, [0, 0.24, 0], [0.5, 0.05, 1.4], '#222228', { cima: function (c) { retangulo(c, 0, 0, 100, 100, '#1b1b22'); }, baixo: function (c) { retangulo(c, 0, 0, 100, 100, cor); for (var k = 0; k < 5; k++) circulo(c, 50, 10 + k * 20, 8, '#ffffff'); }, tras: function (c) { retangulo(c, 0, 0, 100, 100, esc); } });
      [-1, 1].forEach(function (l) {
        chapa(cam, L, [[-0.25, 0.265, l * 0.7], [0.25, 0.265, l * 0.7], [0.23, 0.36, l * 0.88], [-0.23, 0.36, l * 0.88]], '#1b1b22', { verso: cor });   // tail
        caixa(cam, L, [0, 0.16, l * 0.5], [0.42, 0.05, 0.08], '#b8bec8');
        [-1, 1].forEach(function (lx) { roda(cam, L, [lx * 0.21, 0.09, l * 0.5], 0.085, 0.08, cor); });
      });
      var quadril = [0, 1.02 - agacha, -0.05];
      [[-1, [-0.08, 0.31, 0.38]], [1, pe2]].forEach(function (pl) {
        var l = pl[0], pe = pl[1], q = [l * 0.13, quadril[1], quadril[2]];
        var joelho = [(q[0] + pe[0]) / 2 + l * 0.05, (q[1] + pe[1]) / 2 + 0.02, Math.max(q[2], pe[2]) + 0.2 + agacha * 0.8];
        cano(cam, L, q, joelho, 0.11, 0.09, op.corpo === 'menina' ? PELE : '#2a2d3a');
        cano(cam, L, joelho, add(pe, [0, 0.1, 0]), 0.085, 0.07, PELE);
        caixa(cam, L, add(pe, [0, 0.05, 0.05]), [0.2, 0.12, 0.34], '#f4f4f8', { esq: function (c) { retangulo(c, 0, 55, 100, 14, cor); }, dir: function (c) { retangulo(c, 0, 55, 100, 14, cor); }, tras: function (c) { retangulo(c, 0, 70, 100, 30, '#c9ced6'); } });   // tênis
      });
      if (op.corpo === 'menina') tronco(cam, L, [0, quadril[1] - 0.05, quadril[2]], [0.62, 0.5], [0.38, 0.32, 0], 0.32, tom(cor, 0.25), { tras: function (c) { retangulo(c, 0, 80, 100, 20, '#ffffff'); } });   // saia rodada
      else bola(cam, L, quadril, 0.24, 0.17, 0.17, tres('#2a2d3a'));   // bermuda
      var corpoY = 1.45 - agacha;
      bola(cam, L, [0, corpoY, 0.04], 0.25, 0.34, 0.18, tres(cor));   // camiseta
      [-1, 1].forEach(function (l) {   // braços abertos para equilibrar, balançando com a remada
        var bal = Math.sin(f * PI * 2) * l, om = [l * 0.24, corpoY + 0.24, 0.05], mao = [l * (0.62 + Math.max(0, bal) * 0.08), corpoY - 0.05 + bal * 0.08, 0.1 + bal * 0.22];
        var cot = [(om[0] + mao[0]) / 2, (om[1] + mao[1]) / 2 - 0.08, (om[2] + mao[2]) / 2];
        cano(cam, L, om, cot, 0.075, 0.065, cor); cano(cam, L, cot, mao, 0.06, 0.05, PELE); bola(cam, L, mao, 0.065, 0.065, 0.065, tres(PELE));
      });
      piloto(cam, L, [0, corpoY + 0.6, 0.1], 0.34, op);
    } },

    // ---------- 1.28.0 (dono, 19/Nov/2026: "um desses pula-pula como transporte e carrinhos de passeio de neném") ----------
    /* bruxinha na vassoura (1.33.0; 1.34.0, dono 21/Nov/2026, com uma figura de referência: "deixa ela mais ou menos com
       um estilo assim, bem bonito"): ela é a própria personagem (como o Ovo e o Ursão), com rosto e cabelo dela — cabelo
       castanho comprido e ondulado, olhos grandes roxos, sardinhas e sorriso; chapéu roxo de aba larga e ondulada, com a
       ponta enrolada para o lado, faixa escura e fivela cor de bronze; vestido roxo-escuro rodado, mangas compridas,
       botinhas. Vassoura de cabo torto com a palha abrindo, gato preto na garupa e purpurina roxa. A cor escolhida
       aparece no laço do cabelo e na fita da vassoura. Voa e anda no chão (motor.js). */
    bruxa: { alt: 4.5, y: 1.55, larg: 0, comp: 0, semSombra: true, montar: function (cam, L, cor, f, op) {
      var Y = Math.sin(relogio * 2.6) * 0.07, ROXO = '#6b3fa0', ROXO_E = '#3e2560', VEST = '#3a2a52', BOTA = '#2a1f36', PELE = '#e3a877',
        CAB = '#5b3a24', CAB2 = '#7a5034', PALHA = ['#e0b04a', '#c08a2e', '#d9a03c'];
      function vy(z) { return 1.0 + Y + (z + 1.2) * 0.09; }   // o cabo sobe um pouquinho para a frente
      cano(cam, L, [0, vy(-1.25), -1.25], [0.02, vy(0.6), 0.6], 0.065, 0.06, '#7a4a24');
      cano(cam, L, [0.02, vy(0.6), 0.6], [-0.03, vy(1.65) + 0.04, 1.65], 0.06, 0.05, '#6b3f1d');   // cabo torto na ponta
      for (var k = 0; k < 16; k++) {   // a palha abrindo para trás, balançando com o vento
        var a = k / 16 * PI * 2, onda = Math.sin(relogio * 9 + k) * 0.04;
        cano(cam, L, [Math.cos(a) * 0.08, vy(-1.2) + Math.sin(a) * 0.08, -1.2], [Math.cos(a) * (0.36 + onda), vy(-1.2) - 0.05 + Math.sin(a) * (0.3 + onda), -2.15 - (k % 3) * 0.08], 0.05, 0.02, PALHA[k % 3]);
      }
      bola(cam, L, [0, vy(-1.2), -1.2], 0.13, 0.13, 0.1, tres(cor), -0.05);   // fita amarrando a palha (na cor escolhida)
      rastro(cam, L, [0, vy(-1.2), -2.2], '#c77dff', 0.07, 3);
      // o gato preto na garupa
      var gz = -0.85, gy = vy(gz);
      bola(cam, L, [0, gy + 0.2, gz], 0.17, 0.2, 0.19, tres('#26222e'));
      bola(cam, L, [0, gy + 0.45, gz + 0.03], 0.14, 0.13, 0.13, tres('#26222e'), -0.01);
      [-1, 1].forEach(function (l) { cano(cam, L, [l * 0.07, gy + 0.53, gz + 0.03], [l * 0.1, gy + 0.68, gz], 0.045, 0.01, '#26222e', -0.02); });
      var r0 = [0, gy + 0.08, gz - 0.16], r1 = [Math.sin(relogio * 3) * 0.12, gy + 0.32, gz - 0.32], r2 = [Math.sin(relogio * 3 + 1) * 0.2, gy + 0.5, gz - 0.24];
      cano(cam, L, r0, r1, 0.035, 0.03, '#26222e', -0.03); cano(cam, L, r1, r2, 0.03, 0.02, '#26222e', -0.03);   // rabo enrolado
      [-1, 1].forEach(function (l) { bola(cam, L, [l * 0.05, gy + 0.47, gz + 0.15], 0.03, 0.035, 0.01, ['#fff7a0', '#ffd23f', '#a07a00'], -0.04); });   // olhinhos (de frente)
      // a bruxinha: botinhas, vestido rodado caindo dos dois lados da vassoura, mangas compridas
      var bz = -0.05, by = vy(bz);
      [-1, 1].forEach(function (l) {
        var q = [l * 0.18, by + 0.1, bz], pe = [l * 0.3, by - 0.48 + Math.sin(relogio * 4 + l) * 0.03, bz + 0.34];
        cano(cam, L, q, pe, 0.08, 0.075, BOTA);
        cano(cam, L, pe, add(pe, [0, -0.02, 0.24]), 0.1, 0.08, BOTA); bola(cam, L, add(pe, [0, -0.02, 0.24]), 0.08, 0.07, 0.08, tres(BOTA));
      });
      tronco(cam, L, [0, by - 0.05, bz - 0.02], [1.05, 0.85], [0.5, 0.42, 0], 0.5, VEST, { tras: function (c) { retangulo(c, 0, 0, 100, 100, VEST); c.fillStyle = 'rgba(255,255,255,.08)'; for (var x = 8; x < 100; x += 18) c.fillRect(x, 0, 5, 100); } }, { chanfro: 0.08 });   // saia rodada, com as pregas
      bola(cam, L, [0, by + 0.5, bz], 0.27, 0.34, 0.22, tres(VEST));   // corpinho
      [-1, 1].forEach(function (l) {   // braços segurando o cabo
        var omb = [l * 0.24, by + 0.72, bz], mao = [l * 0.1, vy(0.55) + 0.06, 0.55];
        cano(cam, L, omb, mao, 0.08, 0.075, VEST); bola(cam, L, mao, 0.07, 0.07, 0.07, tres(PELE));
      });
      // a cabeça: rosto (de frente), cabelo comprido e ondulado (de costas aparece todo), laço na cor escolhida
      var cab = [0, by + 1.18, bz + 0.02], vento = Math.sin(relogio * 5);
      bola(cam, L, add(cab, [0, -0.28, 0]), 0.09, 0.1, 0.09, tres(PELE));   // pescoço
      bola(cam, L, cab, 0.36, 0.38, 0.34, tres(PELE));
      [-1, 1].forEach(function (l) {   // olhos grandes roxos, com cílios e brilho
        bola(cam, L, add(cab, [l * 0.13, 0.03, 0.31]), 0.085, 0.1, 0.03, ['#ffffff', '#ffffff', '#ddd'], -0.03);
        bola(cam, L, add(cab, [l * 0.13, 0.02, 0.335]), 0.058, 0.07, 0.02, ['#c9a0ff', '#7a3fc4', '#3a1470'], -0.04);
        bola(cam, L, add(cab, [l * 0.13, 0.02, 0.345]), 0.03, 0.036, 0.01, ['#222', '#000', '#000'], -0.05);
        bola(cam, L, add(cab, [l * 0.13 - 0.02, 0.05, 0.35]), 0.014, 0.014, 0.01, ['#fff', '#fff', '#fff'], -0.06);
        cano(cam, L, add(cab, [l * 0.07, 0.13, 0.31]), add(cab, [l * 0.2, 0.15, 0.3]), 0.012, 0.012, CAB, -0.05);   // sobrancelha
        for (var s2 = 0; s2 < 3; s2++) bola(cam, L, add(cab, [l * (0.1 + s2 * 0.04), -0.08 - (s2 % 2) * 0.02, 0.32]), 0.009, 0.009, 0.005, ['#c2703e', '#b0612f', '#8a4a22'], -0.05);   // sardinhas
        bola(cam, L, add(cab, [l * 0.35, -0.02, 0.02]), 0.05, 0.07, 0.04, tres(PELE), 0.01);   // orelha
      });
      bola(cam, L, add(cab, [0, -0.05, 0.36]), 0.03, 0.025, 0.02, tres('#d38a5c'), -0.05);   // narizinho
      cano(cam, L, add(cab, [-0.08, -0.15, 0.32]), add(cab, [0, -0.19, 0.33]), 0.016, 0.016, '#a8323c', -0.05); cano(cam, L, add(cab, [0, -0.19, 0.33]), add(cab, [0.09, -0.14, 0.32]), 0.016, 0.016, '#a8323c', -0.05);   // sorriso
      bola(cam, L, add(cab, [0, 0.12, 0.05]), 0.4, 0.3, 0.37, tres(CAB), -0.01);   // cabelo em cima
      bola(cam, L, add(cab, [0, 0.0, -0.12]), 0.44, 0.42, 0.34, tres(CAB), -0.02);   // cabelo atrás da cabeça
      [-1, 0, 1].forEach(function (l) {   // mechas compridas e onduladas caindo pelas costas, voando com o vento
        for (var m = 0; m < 3; m++) {
          var p = add(cab, [l * (0.22 + m * 0.05) + Math.sin(m * 1.9 + vento + l) * 0.06, -0.26 - m * 0.27, -0.22 - m * 0.06 - Math.abs(vento) * 0.04 * m]);
          bola(cam, L, p, (l ? 0.16 : 0.19) - m * 0.02, 0.24, 0.13, tres(m === 1 ? CAB2 : CAB), -0.03 - m * 0.002);
        }
        bola(cam, L, add(cab, [l * 0.34 + Math.sin(vento + l) * 0.06, -0.98, -0.42]), 0.07, 0.06, 0.06, tres(CAB2), -0.05);   // cachinho na ponta
      });
      [-1, 1].forEach(function (l) { bola(cam, L, add(cab, [l * 0.33, -0.25, 0.08]), 0.1, 0.22, 0.1, tres(CAB), -0.02); });   // mechas do lado do rosto
      [-1, 1].forEach(function (l) { bola(cam, L, add(cab, [l * 0.1, 0.06, -0.42]), 0.09, 0.06, 0.04, tres(cor), -0.08); }); bola(cam, L, add(cab, [0, 0.06, -0.44]), 0.04, 0.04, 0.03, tres(tom(cor, -0.2)), -0.09);   // laço no cabelo
      // o chapéu roxo: aba larga e ondulada (roxo-escuro por baixo), cone torto com a ponta enrolada, faixa e fivela
      var topo = add(cab, [0, 0.3, 0]), N = 20, aba = [];
      for (var i = 0; i <= N; i++) { var an = i / N * PI * 2, rr = 0.82 + Math.sin(an * 5 + 0.6) * 0.06; aba.push([Math.cos(an) * rr, topo[1] - 0.02 + Math.sin(an * 4) * 0.05 - (Math.sin(an) < 0 ? 0.05 : 0), topo[2] + Math.sin(an) * rr * 0.92]); }
      for (i = 0; i < N; i++) {
        var a0 = i / N * PI * 2, a1 = (i + 1) / N * PI * 2;
        chapa(cam, L, [[Math.cos(a0) * 0.3, topo[1] + 0.04, topo[2] + Math.sin(a0) * 0.28], [Math.cos(a1) * 0.3, topo[1] + 0.04, topo[2] + Math.sin(a1) * 0.28], aba[i + 1], aba[i]], ROXO, { verso: ROXO_E, vies: -0.5 });
      }
      var bal = Math.sin(relogio * 3.2) * 0.05;
      var h0 = add(topo, [0, 0.02, 0]), h1 = add(topo, [0.03, 0.42, -0.04]), h2 = add(topo, [0.1 + bal, 0.78, -0.12]), h3 = add(topo, [-0.05 + bal, 1.02, -0.2]), h4 = add(topo, [-0.32 + bal * 1.5, 1.08, -0.18]), h5 = add(topo, [-0.5 + bal * 2, 0.95, -0.1]);
      cano(cam, L, h0, h1, 0.31, 0.22, ROXO, -0.52); cano(cam, L, h1, h2, 0.22, 0.14, ROXO, -0.53); cano(cam, L, h2, h3, 0.14, 0.08, ROXO, -0.54); cano(cam, L, h3, h4, 0.08, 0.04, ROXO, -0.55); cano(cam, L, h4, h5, 0.04, 0.015, ROXO, -0.56);
      bola(cam, L, add(topo, [0, 0.1, 0]), 0.31, 0.07, 0.3, tres(ROXO_E), -0.535);   // faixa
      caixa(cam, L, add(topo, [0.27, 0.1, 0.12]), [0.03, 0.13, 0.16], '#b07a3a', { dir: function (c) { retangulo(c, 0, 0, 100, 100, '#b07a3a'); retangulo(c, 25, 25, 50, 50, ROXO_E); } }, { chanfro: 0, vies: -0.6 });   // fivela cor de bronze
    } },
    /* Ursão de Pelúcia gigante (1.30.0, dono 20/Nov/2026): ursinho de pelúcia enorme, marrom, com laço no pescoço (na
       cor escolhida), costura nas costas, rabinho redondo e solas das patas mais claras (aparecem quando o pé vai para
       trás). Corre gingando de um lado para o outro, como pelúcia; no ar (saltitando) encolhe as pernas e abre os
       braços; dando risada, joga a cabeça para trás, a barriga treme e as patas vão para a barriga. */
    urso: { alt: 5.3, y: 2.0, larg: 1.25, comp: 0.9, semPiloto: true, montar: function (cam, L, cor, f, op) {
      var PELO = '#a8703f', CLARO = '#ecc9a0', ESC = tom(PELO, -0.35), voo = op.voo || 0, ri = op.ri || 0;
      var passo = Math.sin(relogio * 9 + f * PI * 2), ginga = voo ? 0 : passo * 0.12, Y = voo ? 0.2 : Math.abs(passo) * 0.1;
      var treme = ri > 0 ? Math.sin(relogio * 32) * 0.05 : 0;
      [-1, 1].forEach(function (l) {   // pernas gordinhas e patas, com a sola clara
        var p = voo ? 0 : l * passo, quadril = [l * 0.55 + ginga, 1.2 + Y, 0];
        var pe = voo ? [l * 0.8, 0.6 + Y, 0.2] : [l * 0.6 + ginga * 0.5, 0.34 + Math.max(0, -p) * 0.4, p * 0.55];
        cano(cam, L, quadril, pe, 0.42, 0.36, PELO);
        bola(cam, L, add(pe, [0, -0.02, 0.12]), 0.38, 0.3, 0.46, tres(PELO));
        bola(cam, L, add(pe, [0, 0.02, -0.28]), 0.27, 0.23, 0.05, tres(CLARO), -0.03);
      });
      var corpo = [ginga, 2.05 + Y + treme, 0];
      bola(cam, L, corpo, 1.08, 1.18, 0.92, tres(PELO));   // o corpo
      bola(cam, L, add(corpo, [0, -0.15, 0.64]), 0.7, 0.78, 0.32, tres(CLARO), -0.05);   // barriga clara (na frente)
      for (var k = 0; k < 9; k++) {   // costura nas costas, tracejada
        var y0 = -0.75 + k * 0.19, y1 = y0 + 0.11, z0 = -0.93 * Math.sqrt(Math.max(0, 1 - Math.pow(y0 / 1.18, 2))) - 0.01, z1 = -0.93 * Math.sqrt(Math.max(0, 1 - Math.pow(y1 / 1.18, 2))) - 0.01;
        cano(cam, L, add(corpo, [0, y0, z0]), add(corpo, [0, y1, z1]), 0.025, 0.025, ESC, -0.1);
      }
      bola(cam, L, [ginga, 1.3 + Y, -0.86], 0.24, 0.22, 0.2, tres(CLARO), -0.12);   // rabinho
      [-1, 1].forEach(function (l) {   // braços: balançam correndo, abrem no pulo, vão para a barriga na risada
        var omb = [l * 0.95 + ginga, 2.6 + Y + treme, 0.05];
        var mao = ri > 0 ? [l * 0.55 + ginga, 1.95 + Y + treme, 0.82] : voo ? [l * 1.6, 3.1 + Y, 0.1] : [l * 1.25 + ginga, 1.75 + Y, -l * passo * 0.5];
        cano(cam, L, omb, mao, 0.32, 0.27, PELO);
        bola(cam, L, mao, 0.3, 0.3, 0.3, tres(PELO));
      });
      // laço no pescoço, na cor escolhida (a gola e o laço grande nas costas)
      bola(cam, L, [ginga, 3.0 + Y + treme, 0], 0.78, 0.13, 0.66, tres(cor), -0.15);
      [-1, 1].forEach(function (l) {
        bola(cam, L, [ginga + l * 0.3, 3.02 + Y + treme, -0.66], 0.3, 0.2, 0.1, tres(cor), -0.4);
        cano(cam, L, [ginga + l * 0.06, 2.95 + Y + treme, -0.68], [ginga + l * 0.22, 2.55 + Y + treme + Math.sin(relogio * 7 + l) * 0.04, -0.72], 0.07, 0.05, tom(cor, -0.15), -0.38);
      });
      bola(cam, L, [ginga, 3.0 + Y + treme, -0.7], 0.12, 0.12, 0.08, tres(tom(cor, -0.2)), -0.42);
      // a cabeça (vai para trás rindo), orelhas, focinho, nariz, olhos de botão e a boca
      var tras = ri > 0 ? 0.35 + Math.sin(relogio * 32) * 0.05 : 0, fd = [0, Math.sin(tras), Math.cos(tras)];
      var cab = [ginga * 1.2, 3.62 + Y + treme * 1.5, 0.08 - tras * 0.2];
      function rosto(dx, dy, a) { return add(add(cab, [dx, dy, 0]), mul(fd, a)); }
      [-1, 1].forEach(function (l) {
        bola(cam, L, add(cab, [l * 0.66, 0.62, -0.05]), 0.33, 0.31, 0.16, tres(PELO), -0.32);
        bola(cam, L, add(cab, [l * 0.66, 0.6, 0.06]), 0.2, 0.19, 0.06, tres(CLARO), -0.34);
      });
      bola(cam, L, cab, 0.98, 0.86, 0.86, tres(PELO), -0.3);
      bola(cam, L, rosto(0, -0.2, 0.72), 0.4, 0.31, 0.24, tres(CLARO), -0.36);   // focinho
      bola(cam, L, rosto(0, -0.06, 0.98), 0.15, 0.11, 0.08, ['#6b4a3a', '#3a2418', '#1a0e08'], -0.4);   // nariz
      [-1, 1].forEach(function (l) {
        bola(cam, L, rosto(l * 0.33, 0.2, 0.74), 0.11, 0.11 * (ri > 0 ? 0.35 : 1), 0.05, ['#555', '#151515', '#000'], -0.38);   // olhos de botão (rindo, fechadinhos)
      });
      if (ri > 0) bola(cam, L, rosto(0, -0.38, 0.86), 0.17, 0.14, 0.05, ['#ff8fa3', '#c2304a', '#6a0f1e'], -0.42);   // boca aberta, gargalhando
      else { cano(cam, L, rosto(-0.16, -0.3, 0.88), rosto(0, -0.38, 0.92), 0.025, 0.025, '#3a2418', -0.42); cano(cam, L, rosto(0, -0.38, 0.92), rosto(0.16, -0.3, 0.88), 0.025, 0.025, '#3a2418', -0.42); }   // sorrisinho
    } },
    /* ônibus de turismo de 2 andares (dono, 19/Nov/2026: "aquele ônibus hop-on hop-off vermelho de 2 andares de
       turismo, com qualidade, nada de muito quadradão"): carroceria de baixo arredondada (casco) com faixa amarela e
       janelas com gente; andar de cima aberto, de cantos redondos, corrimão cromado, bancos azuis e turistas (um
       acenando, uma tirando foto, de chapéu e de boné); cobertura de vidro só na frente. O piloto vai no último banco
       lá em cima, de onde a câmera vê. */
    turismo: { alt: 5.3, y: 1.75, z: -2.6, larg: 1.3, comp: 4.1, montar: function (cam, L, cor, f, op) {
      var VERM = '#d71920', CROMO = '#d9dde3', AZ = '#1f5fbf', AM = '#ffd23f', CREME = '#f3ead8', VIDRO = '#9fd3f5', Y1 = 2.28, TOPO = 3.0, TETO = 3.56;
      var PELE = ['#f2c9a0', '#8d5524', '#e0ac69', '#c68642', '#ffdbac', '#5c3a1e'], CAB = ['#2b1d14', '#e8c35a', '#7a3b12', '#1a1a1a', '#b9b9b9', '#d1542a'];
      casco(cam, L, [
        { z: -4.0, y: 1.32, w: 1.02, h: 0.84, n: 3 }, { z: -3.9, y: 1.32, w: 1.2, h: 0.93, n: 4 }, { z: -3.6, y: 1.32, w: 1.26, h: 0.96, n: 5 }]
        .concat([1, 2, 3, 4, 5, 6].map(function (k) { return -3.6 + k * 6.5 / 6; }).map(function (z) { return { z: z, y: 1.32, w: 1.26, h: 0.96, n: 5 }; }), [
        { z: 3.6, y: 1.32, w: 1.26, h: 0.96, n: 5 }, { z: 3.9, y: 1.32, w: 1.2, h: 0.93, n: 4 }, { z: 4.0, y: 1.32, w: 1.02, h: 0.84, n: 3 }
      ]), VERM, { pinta: function (k) { return k === 14 || k === 9 ? AM : k >= 10 && k <= 13 ? '#2a2a30' : null; } });
      // janelas de baixo, com os passageiros (cabeça e ombros redondos, sem esticar)
      function janelas(semente) { return function (c) {
        degrade(c, ['#4d6f91', '#1b2838']);
        for (var k = 0; k < 9; k++) {
          var x = 6 + k * 11.2, s = (k * 5 + semente) % 6;
          if ((k + semente) % 3) { circulo(c, x, 112, 34, ['#e63946', '#2ec4b6', '#ffbe0b', '#8338ec', '#3a86ff', '#06d6a0'][s]); circulo(c, x, 52 + Math.sin(f * PI * 2 + k) * 3, 21, PELE[s]); circulo(c, x, 40 + Math.sin(f * PI * 2 + k) * 3, 17, CAB[s]); }
          retangulo(c, x + 4.6, 0, 1.4, 100, '#14181f');
        }
        c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(8, 0); c.lineTo(30, 0); c.lineTo(18, 100); c.lineTo(-4, 100); c.closePath(); c.fill();
      }; }
      painelEmPartes(cam, L, [[1.275, 1.98, -3.6], [1.275, 1.98, 2.9], [1.275, 1.4, 2.9], [1.275, 1.4, -3.6]], 6, '#2b3a4c', janelas(1), { vies: -0.03 });
      painelEmPartes(cam, L, [[-1.275, 1.98, 2.9], [-1.275, 1.98, -3.6], [-1.275, 1.4, -3.6], [-1.275, 1.4, 2.9]], 6, '#2b3a4c', janelas(4), { vies: -0.03 });
      [-1, 1].forEach(function (l) { painel(cam, L, l > 0 ? [[1.27, 1.98, 3.0], [1.27, 1.98, 3.5], [1.27, 0.6, 3.5], [1.27, 0.6, 3.0]] : [[-1.27, 1.98, 3.5], [-1.27, 1.98, 3.0], [-1.27, 0.6, 3.0], [-1.27, 0.6, 3.5]], '#2b3a4c', function (c) { degrade(c, ['#4d6f91', '#1b2838']); retangulo(c, 46, 0, 8, 100, '#14181f'); }, { vies: -0.03 }); });   // porta
      // traseira de baixo: grade do motor, letreiro, lanternas e placa
      painel(cam, L, [[-0.8, 1.95, -4.03], [0.8, 1.95, -4.03], [0.8, 0.72, -4.03], [-0.8, 0.72, -4.03]], VERM, function (c) {
        texto(c, 'CITY TOUR', 50, 18, 20, '#ffffff', '#7a0a10'); texto(c, 'HOP ON · HOP OFF', 50, 38, 10, AM);
        retangulo(c, 12, 50, 76, 34, '#2a2a30'); for (var y = 54; y < 82; y += 5) retangulo(c, 14, y, 72, 2.2, '#5a5f6a');
        retangulo(c, 38, 88, 24, 10, '#ffffff'); texto(c, 'TOUR', 50, 93, 7, '#1a1446');
      });
      [[-0.98, 0.78], [-0.98, 1.05], [0.98, 0.78], [0.98, 1.05]].forEach(function (l, k) { bola(cam, L, [l[0], l[1], -3.97], 0.1, 0.1, 0.05, k % 2 ? ['#ffe0a0', '#ffb703', '#a06a00'] : ['#ffd0d0', '#ff2a2a', '#9a0010'], -0.02); if (!(k % 2)) luzinha(cam, L, [l[0], l[1], -4.02], 0.45, '#ff3030', 0.45); });
      caixa(cam, L, [0, 0.42, -3.98], [2.3, 0.2, 0.16], '#2a2a30');   // para-choque
      // frente: para-brisa grande, letreiro de destino, faróis e grade
      painel(cam, L, [[1.0, 2.12, 4.03], [-1.0, 2.12, 4.03], [-1.0, 1.15, 4.03], [1.0, 1.15, 4.03]], '#2b3a4c', function (c) { degrade(c, ['#6d93b8', '#22344a']); retangulo(c, 0, 0, 100, 18, '#111'); texto(c, 'CITY TOUR', 50, 9, 13, '#ffb703'); retangulo(c, 49, 18, 2, 82, '#14181f'); });
      [-0.82, 0.82].forEach(function (x) { bola(cam, L, [x, 0.78, 3.98], 0.14, 0.11, 0.06, ['#ffffff', '#fff7c2', '#c9b870'], -0.02); });
      caixa(cam, L, [0, 0.42, 3.98], [2.3, 0.2, 0.16], '#2a2a30');
      [-1, 1].forEach(function (l) { cano(cam, L, [l * 1.2, 2.0, 3.8], [l * 1.48, 2.05, 3.95], 0.025, 0.025, '#2a2a30'); bola(cam, L, [l * 1.5, 1.88, 3.95], 0.07, 0.17, 0.05, tres('#2a2a30')); });   // retrovisores
      // o andar de cima: contorno de cantos redondos (vista de cima)
      var A = 1.24, B = 3.98, RC = 0.6, borda = [];
      [[1, 1, 0], [-1, 1, 1], [-1, -1, 2], [1, -1, 3]].forEach(function (cn) { for (var s = 0; s <= 4; s++) { var a = (cn[2] + s / 4) * PI / 2; borda.push([cn[0] * (A - RC) + Math.cos(a) * RC, cn[1] * (B - RC) + Math.sin(a) * RC]); } });
      chapa(cam, L, borda.map(function (p) { return [p[0], Y1, p[1]]; }), '#4a5262');   // piso
      var horizonte = function (c) {   // lateral de fora: prédios da cidade em amarelo e o letreiro
        retangulo(c, 0, 0, 100, 100, VERM);
        c.fillStyle = 'rgba(255,210,63,.55)'; [[2, 40], [7, 25], [11, 50], [16, 30], [21, 15], [24, 45], [30, 35], [70, 30], [74, 50], [79, 20], [84, 40], [89, 28], [94, 45]].forEach(function (b) { c.fillRect(b[0], b[1], 4.2, 100 - b[1]); });
        texto(c, 'CITY TOUR', 50, 52, 52, '#ffffff', '#7a0a10');
      };
      for (var i = 0; i < borda.length; i++) {
        var p = borda[i], q = borda[(i + 1) % borda.length], lg = Math.hypot(q[0] - p[0], q[1] - p[1]);
        var pts = [[p[0], TOPO, p[1]], [q[0], TOPO, q[1]], [q[0], Y1 - 0.02, q[1]], [p[0], Y1 - 0.02, p[1]]];
        var reto = lg > 1, traseira = reto && p[1] < -B + 0.01;
        var des = reto ? (traseira ? function (c) { retangulo(c, 0, 0, 100, 100, VERM); texto(c, 'CITY TOUR', 50, 52, 28, '#ffffff', '#7a0a10'); } : Math.abs(p[0]) > A - 0.01 ? horizonte : null) : null;
        painelEmPartes(cam, L, pts, lg > 3 ? 7 : 1, VERM, des, { verso: CREME });
        cano(cam, L, [p[0], TOPO + 0.03, p[1]], [q[0], TOPO + 0.03, q[1]], 0.04, 0.04, CROMO, -0.01);   // corrimão
      }
      // cobertura de vidro na frente: colunas, vidros dos lados e da frente, teto vermelho por fora e branco por dentro
      var ZC = 1.9, frente = borda.filter(function (p) { return p[1] > ZC; });
      [[A, ZC], [-A, ZC]].concat(frente.filter(function (p, k) { return k % 2 === 0; })).forEach(function (p) { cano(cam, L, [p[0], TOPO, p[1]], [p[0], TETO, p[1]], 0.045, 0.045, '#2a2a30'); });
      painel(cam, L, [[A + 0.005, TETO, ZC], [A + 0.005, TETO, B - RC], [A + 0.005, TOPO, B - RC], [A + 0.005, TOPO, ZC]], VIDRO, null, { alfa: 0.28, verso: VIDRO });
      painel(cam, L, [[-A - 0.005, TETO, B - RC], [-A - 0.005, TETO, ZC], [-A - 0.005, TOPO, ZC], [-A - 0.005, TOPO, B - RC]], VIDRO, null, { alfa: 0.28, verso: VIDRO });
      for (i = 0; i < frente.length - 1; i++) chapa(cam, L, [[frente[i][0], TETO, frente[i][1]], [frente[i + 1][0], TETO, frente[i + 1][1]], [frente[i + 1][0], TOPO, frente[i + 1][1]], [frente[i][0], TOPO, frente[i][1]]], VIDRO, { alfa: 0.3 });
      var teto = [[A, TETO, ZC]].concat(frente.map(function (p) { return [p[0], TETO, p[1]]; }), [[-A, TETO, ZC]]);
      chapa(cam, L, teto, VERM, { verso: '#f6f6f8' });
      for (i = 0; i < teto.length - 1; i++) cano(cam, L, teto[i], teto[i + 1], 0.05, 0.05, tom(VERM, -0.2), -0.01);
      cano(cam, L, teto[0], teto[teto.length - 1], 0.05, 0.05, tom(VERM, -0.2), -0.01);
      // bancos azuis (dois de cada lado do corredor) e os turistas
      var FILAS = [-2.45, -1.7, -0.95, -0.2, 0.55, 1.3, 2.05, 2.8];
      FILAS.forEach(function (z) { [-0.64, 0.64].forEach(function (x) {
        caixa(cam, L, [x, Y1 + 0.3, z], [0.92, 0.1, 0.42], AZ, null, { chanfro: 0 });
        caixa(cam, L, [x, Y1 + 0.5, z - 0.2], [0.92, 0.42, 0.1], AZ, { tras: function (c) { retangulo(c, 0, 0, 100, 100, AZ); retangulo(c, 0, 0, 100, 18, '#ffffff'); } }, { chanfro: 0 });
      }); });
      caixa(cam, L, [0, Y1 + 0.42, -3.35], [2.1, 0.12, 0.5], AZ, null, { chanfro: 0 });   // banco do fundo, mais alto, inteiro
      caixa(cam, L, [0, Y1 + 0.6, -3.62], [2.1, 0.42, 0.1], AZ, { tras: function (c) { retangulo(c, 0, 0, 100, 100, AZ); retangulo(c, 0, 0, 100, 18, '#ffffff'); } }, { chanfro: 0 });
      [[-0.86, -1.7, '#2ec4b6', 0, 1, 'acena'], [0.42, -1.7, '#ff9f1c', 2, 0, 'chapeu'], [0.86, -0.95, '#e71d36', 1, 3, ''], [-0.42, -0.2, '#8338ec', 4, 4, 'foto'],
        [0.42, 0.55, '#3a86ff', 3, 2, 'acena'], [-0.86, 0.55, '#ffbe0b', 5, 3, 'bone'], [0.86, 1.3, '#06d6a0', 0, 5, ''], [-0.42, -2.45, '#fb5607', 2, 1, 'chapeu'], [0.42, 2.8, '#ff5aa8', 4, 2, 'bone']].forEach(function (t, k) {
        var x = t[0], z = t[1], y = Y1 + 0.62 + Math.sin(f * PI * 2 + k * 1.7) * 0.015, pele = PELE[t[3]];
        bola(cam, L, [x, y, z], 0.2, 0.2, 0.15, tres(t[2]));   // ombros
        bola(cam, L, [x, y + 0.32, z + 0.02], 0.15, 0.17, 0.15, tres(pele));   // cabeça
        bola(cam, L, [x, y + 0.38, z - 0.02], 0.15, 0.13, 0.14, tres(CAB[t[4]]), -0.01);   // cabelo
        if (t[5] === 'chapeu') { bola(cam, L, [x, y + 0.47, z], 0.3, 0.03, 0.3, tres('#f1d58a'), -0.02); bola(cam, L, [x, y + 0.53, z], 0.14, 0.08, 0.14, tres('#f1d58a'), -0.03); }
        if (t[5] === 'bone') { bola(cam, L, [x, y + 0.47, z], 0.16, 0.08, 0.16, tres(t[2]), -0.02); caixa(cam, L, [x, y + 0.44, z + 0.18], [0.2, 0.025, 0.16], t[2], null, { chanfro: 0, vies: -0.02 }); }
        if (t[5] === 'acena') {   // braço levantado, mão balançando
          var om = [x + 0.17 * (x > 0 ? 1 : -1), y + 0.08, z], mao = [om[0] + (x > 0 ? 0.12 : -0.12) + Math.sin(f * PI * 4) * 0.1, y + 0.55, z + 0.05];
          cano(cam, L, om, mao, 0.055, 0.045, t[2], -0.02); bola(cam, L, mao, 0.06, 0.07, 0.05, tres(pele), -0.03);
        }
        if (t[5] === 'foto') {   // as duas mãos para cima segurando a câmera na frente do rosto
          [-1, 1].forEach(function (l) { cano(cam, L, [x + l * 0.16, y + 0.08, z], [x + l * 0.1, y + 0.36, z + 0.22], 0.05, 0.04, t[2]); });
          caixa(cam, L, [x, y + 0.38, z + 0.24], [0.24, 0.15, 0.08], '#26262e', null, { chanfro: 0.02 }); bola(cam, L, [x, y + 0.38, z + 0.3], 0.05, 0.05, 0.03, tres('#6d93b8'), -0.01);
          if (f % 0.5 < 0.06) luzinha(cam, L, [x + 0.08, y + 0.44, z + 0.3], 0.5, '#ffffff', 0.9);   // flash
        }
      });
      // o piloto, no meio do banco do fundo
      bola(cam, L, [0, Y1 + 0.78, -3.32], 0.28, 0.26, 0.18, tres(cor));
      piloto(cam, L, [0, Y1 + 1.15, -3.3], 0.42, op);
      fumaca(cam, L, [0.9, 0.4, -4.05]);
      [[-1, -2.5], [1, -2.5], [-1, 2.65], [1, 2.65]].forEach(function (w) { roda(cam, L, [w[0] * 1.1, 0.52, w[1]], 0.52, 0.36, '#c9ced6'); });
    } },
    /* pula-pula de rede: armação octogonal de aço com pernas em "U" (e rodinhas, para andar na pista), espuma vermelha
       cobrindo as molas, lona preta que afunda quando a criança cai, 8 postes com espuma vermelha e a rede em volta.
       fase: um ciclo = um pulo (sobe, no alto abre braços e pernas em estrela, desce e dobra os joelhos na lona) */
    /* van verde de passeio (1.38.0, dono, com fotos de uma van de aluguel de carros): van alta e comprida, verde, com
       faixas verde-limão e uma seta branca do lado, faixa cinza embaixo com refletivos, "calombo" do ar no teto, janelas
       escuras com a família dentro dando tchau e as lanternas vermelhas altas atrás. Sem nome nem logotipo de empresa */
    van: { alt: 4.6, y: 1.35, z: -2.0, larg: 1.15, comp: 3.2, montar: function (cam, L, cor, f, op) {
      var VD = '#27a645', VDE = '#1b7a35', LIMA = '#b6f04a', CINZA = '#5d646c';
      var PELE = ['#f2c9a0', '#8d5524', '#e0ac69', '#c68642', '#ffdbac'], CAB = ['#5b3a24', '#e8c35a', '#2b1d14', '#b9b9b9', '#7a3b12'], ROUPA = ['#7b2d5e', '#c9b6e6', '#1a1a1a', '#a0263a', '#3a86ff'];
      var listras = function (c, vira) {   // faixas finas verde-limão em diagonal e a seta branca
        c.save(); if (vira) { c.translate(100, 0); c.scale(-1, 1); }
        c.strokeStyle = LIMA; c.lineWidth = 1.6; c.beginPath(); c.moveTo(8, 100); c.lineTo(40, 0); c.moveTo(55, 100); c.lineTo(85, 0); c.stroke();
        c.fillStyle = 'rgba(182,240,74,.55)'; c.beginPath(); c.moveTo(60, 100); c.lineTo(78, 40); c.lineTo(96, 100); c.closePath(); c.fill();
        c.strokeStyle = '#ffffff'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(22, 0); c.lineTo(30, 40); c.lineTo(20, 100); c.stroke();
        c.restore();
      };
      var baixo = function (vira) { return function (c) {
        retangulo(c, 0, 0, 100, 100, VD); listras(c, vira);
        retangulo(c, 0, 58, 100, 20, CINZA);   // faixa cinza
        for (var k = 0; k < 6; k++) { retangulo(c, 5 + k * 16, 50, 4, 5, '#ffffff'); retangulo(c, 9 + k * 16, 50, 4, 5, '#e63946'); }   // refletivos
        circulo(c, 30, 70, 2, '#ff9f1c'); circulo(c, 70, 70, 2, '#ff9f1c');
      }; };
      caixa(cam, L, [0, 0.9, 0], [2.3, 1.0, 6.4], VD, {   // parte de baixo
        esq: baixo(false), dir: baixo(true),
        tras: function (c) { retangulo(c, 0, 0, 100, 100, VD); retangulo(c, 0, 66, 100, 16, CINZA); retangulo(c, 49, 0, 2, 66, VDE); retangulo(c, 36, 30, 28, 14, '#ffffff'); texto(c, 'VAN', 50, 38, 10, '#1a1446'); }
      });
      var gente = function (semente, n) { return function (c) {   // janelas escuras com a família dando tchau
        degrade(c, ['#2e4a3a', '#13241b']);
        for (var k = 0; k < n; k++) {
          var x = (k + 0.5) * 100 / n, s = (k + semente) % 5, tch = Math.sin(f * PI * 2 * 2 + k * 1.7);
          circulo(c, x, 112, 30, ROUPA[s]); circulo(c, x, 58, 17, PELE[s]); circulo(c, x, 47, 14, CAB[s]);
          if ((k + semente) % 2 === 0) { var mx = x + 16 + tch * 5; c.strokeStyle = PELE[s]; c.lineWidth = 6; c.beginPath(); c.moveTo(x + 10, 90); c.lineTo(mx, 40); c.stroke(); circulo(c, mx, 36, 7, PELE[s]); }   // a mão abanando
        }
        c.fillStyle = 'rgba(255,255,255,.16)'; c.beginPath(); c.moveTo(10, 0); c.lineTo(30, 0); c.lineTo(18, 100); c.lineTo(-2, 100); c.closePath(); c.fill();
      }; };
      var cima = function (vira, semente) { return function (c) {
        retangulo(c, 0, 0, 100, 100, VD);
        c.save(); c.beginPath(); c.rect(6, 18, 88, 62); c.clip(); c.translate(6, 18); c.scale(0.88, 0.62); gente(semente, 5)(c); c.restore();
        [36, 64].forEach(function (x) { retangulo(c, x, 18, 1.5, 62, VDE); });
      }; };
      caixa(cam, L, [0, 2.05, 0], [2.3, 1.3, 6.4], VD, { esq: cima(false, 0), dir: cima(true, 2) }, { sem: ['tras'] });
      // atrás em cima: moldura verde e o vidro de trás de verdade (dá para ver o piloto no último banco)
      var Z = -3.205, X = 1.15, J = 0.82, T = 2.7, B = 1.4, JT = 2.45, JB = 1.62;
      [[[-X, T], [X, JT]], [[-X, JB], [X, B]], [[-X, JT], [-J, JB]], [[J, JT], [X, JB]]].forEach(function (r) {
        painel(cam, L, [[r[0][0], r[0][1], Z], [r[1][0], r[0][1], Z], [r[1][0], r[1][1], Z], [r[0][0], r[1][1], Z]], VD);
      });
      painel(cam, L, [[-J, JT, Z], [J, JT, Z], [J, JB, Z], [-J, JB, Z]], '#2e4a3a', function (c) { retangulo(c, 49, 0, 2, 100, VDE); c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.moveTo(6, 0); c.lineTo(20, 0); c.lineTo(10, 100); c.lineTo(-4, 100); c.closePath(); c.fill(); }, { alfa: 0.4, vies: -0.02 });
      caixa(cam, L, [0, 2.75, 0], [2.26, 0.1, 6.36], VDE);   // teto
      tronco(cam, L, [0, 2.95, -0.6], [1.7, 3.2], [1.4, 2.9, 0], 0.3, VD, { cima: function (c) { retangulo(c, 0, 0, 100, 100, VD); retangulo(c, 0, 0, 100, 8, '#3cc25e'); } });   // calombo do ar
      piloto(cam, L, [0, 2.12, -2.6], 0.46, op);   // no último banco, olhando pela janela de trás
      // frente baixa (capô) e para-brisa
      caixa(cam, L, [0, 0.85, 3.6], [2.2, 0.9, 0.8], VD);
      tronco(cam, L, [0, 1.75, 3.35], [2.2, 0.5], [2.1, 0.2, -0.15], 0.9, '#2b3a4c', null, { alfa: { frente: 0.5, esq: 0.5, dir: 0.5 }, sem: ['baixo', 'tras'] });
      [-1, 1].forEach(function (l) {   // lanternas altas vermelhas nos cantos de trás
        caixa(cam, L, [l * 1.07, 1.35, -3.2], [0.18, 0.7, 0.06], '#d62828', { tras: function (c) { degrade(c, ['#ff6b6b', '#c1121f', '#7a0a10']); } });
        luzinha(cam, L, [l * 1.07, 1.35, -3.25], 0.55, '#ff3030', 0.5);
      });
      caixa(cam, L, [0, 0.45, -3.25], [2.36, 0.26, 0.16], '#2a2d33');   // para-choque
      caixa(cam, L, [0, 0.72, -3.22], [0.6, 0.18, 0.02], '#ffffff', { tras: function (c) { retangulo(c, 0, 0, 100, 22, '#1f4fbf'); texto(c, 'VRU 2026', 50, 62, 40, '#1a1446'); } });   // placa
      fumaca(cam, L, [0.8, 0.35, -3.3]);
      [[-1, -2.2], [1, -2.2], [-1, 2.6], [1, 2.6]].forEach(function (w) { roda(cam, L, [w[0] * 1.08, 0.5, w[1]], 0.5, 0.4); });
    } },
    /* bolha gigante (1.38.0, dono: "aquelas bolas gigantes transparentes que entra uma pessoa dentro e fica andando"):
       a bola de plástico transparente rola (as costuras giram para a frente) e a criança anda dentro, como na rodinha
       do hamster, com os braços abertos encostando na parede. Fundo da bola, criança, depois a frente com o brilho */
    bolha: { alt: 3.5, y: 1.25, larg: 0.85, comp: 0.85, montar: function (cam, L, cor, f, op) {
      var R = 1.2, C = [0, R + 0.02, 0], q = cam.pt(C), a = op.t ? op.t * 2.4 : f * PI * 2, passo = Math.sin(f * PI * 2), esc = tom(cor, -0.35);
      var costuras = [0, 1, 2].map(function (k) {   // costuras: círculos em volta do eixo x, girando = rolando para a frente
        var fi = a + k * PI / 3, pts = [];
        for (var j = 0; j <= 32; j++) { var th = j / 32 * PI * 2; pts.push(cam.pt(add(C, [R * Math.cos(th), R * Math.sin(th) * Math.cos(fi), R * Math.sin(th) * Math.sin(fi)]))); }
        return pts;
      });
      L.push({ d: q.d + R, f: function (c) {   // o fundo da bola (do lado de lá): azulado bem clarinho
        var Rp = R * q.s; if (Rp < 1) return;
        c.save(); var g = c.createRadialGradient(q.x, q.y, Rp * 0.3, q.x, q.y, Rp); g.addColorStop(0, 'rgba(200,235,255,.10)'); g.addColorStop(1, 'rgba(160,215,255,.38)');
        c.fillStyle = g; c.beginPath(); c.arc(q.x, q.y, Rp, 0, PI * 2); c.fill(); c.restore();
      } });
      // a criança andando lá dentro: pernas alternando, corpo um pouco para a frente, braços abertos na parede
      var quadril = [0, 0.95, 0.05];
      [-1, 1].forEach(function (l) {
        var ps = l * passo, joelho = [l * 0.16, 0.6, 0.05 + ps * 0.25], pe = [l * 0.17, 0.2 + Math.max(0, -ps) * 0.15, ps * 0.45];
        cano(cam, L, add(quadril, [l * 0.14, 0, 0]), joelho, 0.11, 0.09, '#2a2d3a'); cano(cam, L, joelho, pe, 0.09, 0.08, '#2a2d3a');
        bola(cam, L, add(pe, [0, -0.02, 0.06]), 0.1, 0.07, 0.15, tres('#f4f4f8'));   // tênis
        cano(cam, L, [l * 0.28, 1.5, 0.05], [l * 0.85, 1.6 - l * passo * 0.05, 0.35], 0.09, 0.07, esc); bola(cam, L, [l * 0.88, 1.62 - l * passo * 0.05, 0.37], 0.08, 0.08, 0.08, tres('#f2c9a0'));   // braços e mãos
      });
      bola(cam, L, [0, 1.3, 0.05], 0.32, 0.42, 0.24, tres(cor));   // camiseta
      piloto(cam, L, [0, 1.92, 0.08], 0.36, op);
      L.push({ d: q.d - R - 0.2, f: function (c) {   // a frente: borda, costuras e o brilho do plástico
        var Rp = R * q.s; if (Rp < 1) return;
        c.save();
        c.fillStyle = 'rgba(210,240,255,.12)'; c.beginPath(); c.arc(q.x, q.y, Rp, 0, PI * 2); c.fill();
        c.lineWidth = Math.max(1, Rp * 0.012); c.strokeStyle = 'rgba(255,255,255,.4)';
        costuras.forEach(function (pts) { c.beginPath(); pts.forEach(function (p, j) { if (j) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); }); c.stroke(); });
        c.lineWidth = Math.max(1.5, Rp * 0.035); c.strokeStyle = 'rgba(190,230,255,.85)'; c.beginPath(); c.arc(q.x, q.y, Rp, 0, PI * 2); c.stroke();
        var g = c.createRadialGradient(q.x - Rp * 0.42, q.y - Rp * 0.45, 0, q.x - Rp * 0.42, q.y - Rp * 0.45, Rp * 0.42); g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g; c.beginPath(); c.arc(q.x - Rp * 0.42, q.y - Rp * 0.45, Rp * 0.42, 0, PI * 2); c.fill();
        c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(q.x + Rp * 0.55, q.y + Rp * 0.5, Rp * 0.1, Rp * 0.05, -0.7, 0, PI * 2); c.fill();
        c.restore();
      } });
    } },
    /* palhaço de bicicleta (1.38.0, dono: "um palhacinho andando de bicicleta, pedalando sem parar, bem realista"):
       bicicleta de quadro fino (na cor escolhida) com rodas de aro e raios girando, corrente, selim e guidão; o palhaço
       pedala o tempo todo — pés presos nos pedais, joelho calculado (as pernas acompanham o pedal de verdade) —, com
       macacão de bolinhas, gola de babados, luvas brancas, sapatões vermelhos, peruca laranja encaracolada, chapeuzinho
       e o nariz vermelho. Na corrida pedala pelo relógio (nunca para); nos quadros dos rivais, pela fase */
    palhaco: { alt: 3.5, y: 1.15, larg: 0.4, comp: 1.0, semPiloto: true, montar: function (cam, L, cor, f, op) {
      var a = op.t ? op.t * 7 : f * PI * 2, esc = tom(cor, -0.35), PELE = '#f8ece2', LARANJA = '#ff7a1a', MAC = '#ffcf33', MAC2 = '#2f6fe0';
      var R = 0.37, tras = [0, R, -0.58], frente = [0, R, 0.62], mov = [0, 0.38, -0.04], selim = [0, 1.0, -0.26], cabeca = [0, 1.02, 0.43];
      function aro(cen, giro) {   // roda de bicicleta: pneu fino, aro prateado e raios girando
        var pts = [], ptsA = [], raios = [];
        for (var k = 0; k <= 24; k++) { var t = k / 24 * PI * 2; pts.push(cam.pt(add(cen, [0, Math.cos(t) * R, Math.sin(t) * R]))); ptsA.push(cam.pt(add(cen, [0, Math.cos(t) * R * 0.86, Math.sin(t) * R * 0.86]))); }
        for (k = 0; k < 8; k++) { var t2 = giro + k / 8 * PI * 2; raios.push(cam.pt(add(cen, [0, Math.cos(t2) * R * 0.86, Math.sin(t2) * R * 0.86]))); }
        var q = cam.pt(cen);
        L.push({ d: q.d, f: function (c) {
          var k0 = q.s; if (k0 * R < 2) return;
          c.save(); c.lineJoin = 'round';
          c.strokeStyle = '#1d1d22'; c.lineWidth = Math.max(1.5, k0 * 0.07); c.beginPath(); pts.forEach(function (p, j) { if (j) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); }); c.stroke();
          c.strokeStyle = '#c9ced6'; c.lineWidth = Math.max(1, k0 * 0.025); c.beginPath(); ptsA.forEach(function (p, j) { if (j) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); }); c.stroke();
          c.strokeStyle = 'rgba(220,224,230,.85)'; c.lineWidth = Math.max(0.6, k0 * 0.008); c.beginPath(); raios.forEach(function (p) { c.moveTo(q.x, q.y); c.lineTo(p.x, p.y); }); c.stroke();
          c.fillStyle = '#9aa0a6'; c.beginPath(); c.arc(q.x, q.y, Math.max(1, k0 * 0.035), 0, PI * 2); c.fill();
          c.restore();
        } });
      }
      aro(tras, a * 1.6); aro(frente, a * 1.6);   // rodando para a frente
      // quadro: tubos finos na cor escolhida
      [[mov, selim], [mov, cabeca], [selim, cabeca], [mov, tras], [selim, tras]].forEach(function (t) { cano(cam, L, t[0], t[1], 0.035, 0.035, cor); });
      cano(cam, L, cabeca, frente, 0.03, 0.026, '#c9ced6');   // garfo
      cano(cam, L, cabeca, [0, 1.18, 0.38], 0.03, 0.03, '#9aa0a6'); cano(cam, L, [-0.3, 1.2, 0.36], [0.3, 1.2, 0.36], 0.025, 0.025, '#2a2a30');   // guidão
      [-1, 1].forEach(function (l) { cano(cam, L, [l * 0.3, 1.2, 0.36], [l * 0.36, 1.19, 0.33], 0.035, 0.035, '#1d1d22'); });   // manoplas
      bola(cam, L, [-0.2, 1.24, 0.38], 0.06, 0.06, 0.06, tres('#ff4fa3'));   // buzina de palhaço (fon-fon)
      bola(cam, L, add(selim, [0, 0.03, 0]), 0.1, 0.04, 0.17, tres('#1b1b22'));   // selim
      cano(cam, L, add(mov, [0.05, 0, 0]), add(tras, [0.05, 0, 0]), 0.012, 0.012, '#5a5f66');   // corrente
      bola(cam, L, add(mov, [0.06, 0, 0]), 0.02, 0.11, 0.11, ['#d9dde3', '#9aa0a6', '#5a5f66']);   // coroa
      // pernas: o pé fica no pedal; o joelho é calculado (duas partes de mesmo tamanho), sempre para a frente
      var COXA = 0.42, CANELA = 0.44;
      [-1, 1].forEach(function (l) {
        var ang = -a + (l > 0 ? 0 : PI), pedal = add(mov, [l * 0.13, Math.sin(ang) * 0.16, Math.cos(ang) * 0.16]);
        cano(cam, L, add(mov, [l * 0.07, 0, 0]), pedal, 0.022, 0.022, '#9aa0a6');   // pedivela
        var quadril = [l * 0.12, 1.1, -0.22], d = sub(pedal, quadril), dl = Math.min(COXA + CANELA - 0.005, Math.sqrt(dot(d, d))), dir = norm(d);
        var cosA = (COXA * COXA + dl * dl - CANELA * CANELA) / (2 * COXA * dl), sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
        var fr = norm(sub([0, 0, 1], mul(dir, dot([0, 0, 1], dir)))), joelho = add(quadril, add(mul(dir, COXA * cosA), mul(fr, COXA * sinA)));
        var calca = l < 0 ? MAC2 : MAC;
        cano(cam, L, quadril, joelho, 0.12, 0.1, calca); bola(cam, L, joelho, 0.1, 0.1, 0.1, tres(calca));
        cano(cam, L, joelho, add(pedal, [0, 0.07, -0.02]), 0.1, 0.08, calca);
        bola(cam, L, add(pedal, [0, 0.03, 0.06]), 0.08, 0.065, 0.19, tres('#e01e37'));   // sapatão
      });
      // corpo: macacão de duas cores com bolinhas, gola de babados
      bola(cam, L, [-0.09, 1.38, -0.14], 0.18, 0.33, 0.2, tres(MAC2)); bola(cam, L, [0.09, 1.38, -0.14], 0.18, 0.33, 0.2, tres(MAC));
      [[-0.14, 1.5], [-0.06, 1.27], [0.08, 1.45], [0.15, 1.24], [0.02, 1.6], [-0.16, 1.18]].forEach(function (b, k) { bola(cam, L, [b[0], b[1], -0.35], 0.035, 0.035, 0.015, k % 2 ? ['#ffffff', '#ff4fa3', '#c0306f'] : ['#ffffff', '#3ee8a0', '#1f9a6a'], -0.04); });
      [-1, 1].forEach(function (l) {   // braços até o guidão, luvas brancas
        var ombro = [l * 0.24, 1.6, -0.12], mao = [l * 0.31, 1.22, 0.33], cot = [l * 0.36, 1.38, 0.08];
        cano(cam, L, ombro, cot, 0.08, 0.07, l < 0 ? MAC2 : MAC); cano(cam, L, cot, mao, 0.07, 0.06, l < 0 ? MAC2 : MAC);
        bola(cam, L, mao, 0.07, 0.065, 0.07, tres('#ffffff'));
      });
      for (var k = 0; k < 10; k++) { var g = k / 10 * PI * 2; bola(cam, L, [Math.cos(g) * 0.19, 1.74, -0.1 + Math.sin(g) * 0.16], 0.075, 0.05, 0.075, tres(k % 2 ? '#ffffff' : '#ff4fa3')); }   // gola de babados
      // cabeça: rosto branco, nariz vermelho, peruca laranja encaracolada e chapeuzinho
      var C = [0, 1.98, -0.08];
      bola(cam, L, C, 0.2, 0.23, 0.2, [PELE, '#efdccd', '#cbb3a0']);
      bola(cam, L, add(C, [0, -0.01, 0.2]), 0.065, 0.065, 0.065, ['#ff9a9a', '#e3001b', '#8a0010'], -0.05);   // nariz
      [-1, 1].forEach(function (l) { bola(cam, L, add(C, [l * 0.075, 0.07, 0.17]), 0.03, 0.035, 0.015, ['#5a6cff', '#1a1446', '#000'], -0.04); });   // olhos
      bola(cam, L, add(C, [0, -0.1, 0.16]), 0.09, 0.035, 0.03, ['#ff6b81', '#e3001b', '#8a0010'], -0.04);   // boca vermelha, sorrindo
      [[-0.2, 0.04, -0.1], [0.2, 0.04, -0.1], [-0.15, 0.12, -0.16], [0.15, 0.12, -0.16], [-0.06, 0.15, -0.2], [0.06, 0.15, -0.2], [0, 0.04, -0.22], [-0.21, -0.07, -0.12], [0.21, -0.07, -0.12], [-0.1, -0.06, -0.21], [0.1, -0.06, -0.21]].forEach(function (b) {   // só dos lados e atrás: o rosto aparece de lado
        bola(cam, L, add(C, b), 0.095, 0.09, 0.095, ['#ffb066', LARANJA, '#c4460a']);
      });
      cano(cam, L, add(C, [0, 0.2, -0.02]), add(C, [0, 0.34, -0.02]), 0.11, 0.1, '#2a1f3a');   // chapeuzinho
      bola(cam, L, add(C, [0, 0.2, -0.02]), 0.2, 0.025, 0.2, tres('#2a1f3a'));   // aba
      bola(cam, L, add(C, [0.09, 0.3, -0.02]), 0.05, 0.05, 0.05, tres('#ffd166'));   // florzinha do chapéu
    } },
    pulapula: { alt: 4.7, y: 1.55, larg: 1.2, comp: 1.2, montar: function (cam, L, cor, f, op) {
      var R = 1.0, Y0 = 0.62, N = 8, VERM = '#d62828', ACO = '#a9b0b8', PELE = '#f2c9a0';
      var h = Math.abs(Math.sin(f * PI)), dip = Math.max(0, 1 - h / 0.16) * 0.3, agacha = Math.max(0, 1 - h / 0.3), estrela = Math.max(0, (h - 0.7) / 0.3);
      function v(k, r, y) { var a = (k + 0.5) / N * PI * 2; return [Math.sin(a) * r, y, -Math.cos(a) * r]; }   // o lado 7–0 fica de frente para a câmera
      function meio(a, b, t) { return add(a, mul(sub(b, a), t)); }
      for (var k = 0; k < N; k += 2) {   // 4 pernas em "U", cada uma com uma rodinha
        var b0 = v(k, R, 0.24), b1 = v(k + 1, R, 0.24);
        cano(cam, L, v(k, R, Y0 - 0.05), b0, 0.045, 0.045, ACO); cano(cam, L, v(k + 1, R, Y0 - 0.05), b1, 0.045, 0.045, ACO); cano(cam, L, b0, b1, 0.045, 0.045, ACO);
        var rm = meio(b0, b1, 0.5); roda(cam, L, [rm[0], 0.12, rm[2]], 0.12, 0.09, '#e9edf2', true);
      }
      for (k = 0; k < N; k++) cano(cam, L, v(k, R, Y0 - 0.04), v(k + 1, R, Y0 - 0.04), 0.045, 0.045, ACO);   // aro de aço
      // a lona: afunda no meio quando a criança cai
      var Rl = R - 0.1, yl = Y0 + 0.03, anel = [], dentro = [], centro = [0, yl - dip, 0];
      for (k = 0; k < N; k++) { anel.push(v(k, Rl, yl)); dentro.push(v(k, Rl * 0.5, yl - dip * 0.55)); }
      for (k = 0; k < N; k++) {
        chapa(cam, L, [anel[k], anel[(k + 1) % N], dentro[(k + 1) % N], dentro[k]], '#1d1d24');
        chapa(cam, L, [dentro[k], dentro[(k + 1) % N], centro], '#24242c');
      }
      bola(cam, L, add(centro, [0, 0.015, 0]), 0.42 - h * 0.18, 0.01, 0.42 - h * 0.18, ['rgba(0,0,0,.45)', 'rgba(0,0,0,.3)', 'rgba(0,0,0,0)'], -0.06);   // sombra da criança na lona
      for (k = 0; k < N; k++) {   // espuma vermelha por cima das molas (em cima e a saia de fora)
        chapa(cam, L, [v(k, R - 0.1, Y0 + 0.07), v(k + 1, R - 0.1, Y0 + 0.07), v(k + 1, R + 0.22, Y0 + 0.03), v(k, R + 0.22, Y0 + 0.03)], VERM);
        chapa(cam, L, [v(k, R + 0.22, Y0 + 0.03), v(k + 1, R + 0.22, Y0 + 0.03), v(k + 1, R + 0.22, Y0 - 0.15), v(k, R + 0.22, Y0 - 0.15)], tom(VERM, -0.2));
      }
      var TOPO = 2.55;
      for (k = 0; k < N; k++) {   // postes: aço embaixo, espuma vermelha em cima, tampinha preta
        cano(cam, L, v(k, R + 0.16, Y0 - 0.12), v(k, R + 0.16, Y0 + 0.3), 0.04, 0.04, ACO);
        cano(cam, L, v(k, R + 0.16, Y0 + 0.3), v(k, R + 0.16, TOPO), 0.075, 0.075, VERM);
        bola(cam, L, v(k, R + 0.16, TOPO + 0.03), 0.08, 0.05, 0.08, tres('#2a2a30'), -0.01);
        // a rede (de cima, meio caída entre os postes, até a borda da lona) e a corda de cima
        var c0 = v(k, R + 0.12, TOPO - 0.08), c1 = v(k + 1, R + 0.12, TOPO - 0.08), cm = add(meio(c0, c1, 0.5), [0, -0.12, 0]);
        cano(cam, L, c0, cm, 0.022, 0.022, VERM); cano(cam, L, cm, c1, 0.022, 0.022, VERM);
        rede(cam, L, [c0, c1, v(k + 1, R - 0.06, Y0 + 0.1), v(k, R - 0.06, Y0 + 0.1)]);
      }
      // a criança pulando (de meia, para não escorregar)
      var pe = yl - dip + 0.06 + h * 1.15, quadril = pe + 0.86 - agacha * 0.3, abre = 0.12 + estrela * 0.3;
      [-1, 1].forEach(function (l) {
        var q = [l * 0.13, quadril, 0], p = [l * abre, pe, 0.02 + agacha * 0.06];
        var joelho = [(q[0] + p[0]) / 2 + l * 0.03, (q[1] + p[1]) / 2 + 0.02 + agacha * 0.08, 0.08 + agacha * 0.26 + (1 - estrela) * h * 0.08];
        cano(cam, L, q, joelho, 0.12, 0.095, op.corpo === 'menina' ? PELE : '#2a2d3a');
        cano(cam, L, joelho, add(p, [0, 0.08, 0]), 0.085, 0.07, PELE);
        bola(cam, L, add(p, [0, 0.03, 0.06]), 0.09, 0.07, 0.15, tres('#ffffff'));   // meia antiderrapante
        bola(cam, L, add(p, [0, 0.08, 0]), 0.08, 0.03, 0.08, tres(cor), -0.01);
      });
      if (op.corpo === 'menina') tronco(cam, L, [0, quadril - 0.04, 0], [0.6, 0.5], [0.36, 0.3, 0], 0.3, tom(cor, 0.25));   // saia rodada
      else bola(cam, L, [0, quadril, 0], 0.22, 0.16, 0.16, tres('#2a2d3a'));   // bermuda
      var peito = quadril + 0.38, ombroY = peito + 0.24;
      bola(cam, L, [0, peito, 0.02], 0.25, 0.34, 0.18, tres(cor));   // camiseta
      [-1, 1].forEach(function (l) {   // braços: para trás na lona, sobem no pulo e abrem em estrela lá no alto
        var om = [l * 0.24, ombroY, 0.03], mao = [l * (0.36 + estrela * 0.38 + h * 0.06), ombroY - 0.45 + h * 0.95 - estrela * 0.1, -0.12 + h * 0.2];
        var cot = [(om[0] + mao[0]) / 2 + l * 0.08, (om[1] + mao[1]) / 2, (om[2] + mao[2]) / 2 - 0.04];
        cano(cam, L, om, cot, 0.075, 0.065, cor); cano(cam, L, cot, mao, 0.06, 0.05, PELE); bola(cam, L, mao, 0.065, 0.065, 0.065, tres(PELE));
      });
      piloto(cam, L, [0, ombroY + 0.36, 0.06], 0.34, op);
    } },
    /* carrinho de bebê de 3 rodas (de corrida): rodas grandes atrás com raios, uma roda na frente no garfo, quadro
       preto, assento de tecido na cor escolhida (encosto deitado com bolso e faixa refletiva), capota em gomos aberta
       atrás (dá para ver o piloto) e forrada de cinza por dentro, barra de proteção na frente, cestinha embaixo,
       guidão de espuma com a alça de pulso balançando, mamadeira no porta-copo e um chocalho pendurado */
    bebe: { alt: 3.4, y: 1.05, larg: 0.9, comp: 1.55, montar: function (cam, L, cor, f, op) {
      var esc = tom(cor, -0.35), cla = tom(cor, 0.3), PRETO = '#26262e', PRATA = '#c9ced6', bal = Math.sin(f * PI * 2);
      [-1, 1].forEach(function (l) {   // o quadro
        var ombro = [l * 0.56, 1.32, -0.55];
        cano(cam, L, [l * 0.15, 0.88, 1.25], ombro, 0.05, 0.05, PRETO);   // tubo de baixo (do garfo até em cima da roda)
        cano(cam, L, ombro, [l * 0.5, 1.74, -1.2], 0.05, 0.05, PRETO);   // sobe para o guidão
        cano(cam, L, ombro, [l * 0.64, 0.56, -0.55], 0.045, 0.045, PRATA);   // desce até o eixo de trás
        cano(cam, L, [l * 0.15, 0.88, 1.25], [l * 0.1, 0.42, 1.6], 0.04, 0.035, PRATA);   // garfo da frente
      });
      cano(cam, L, [-0.7, 0.56, -0.55], [0.7, 0.56, -0.55], 0.04, 0.04, PRATA);   // eixo de trás
      cano(cam, L, [-0.53, 1.74, -1.2], [0.53, 1.74, -1.2], 0.07, 0.07, '#1b1b20');   // guidão de espuma
      caixa(cam, L, [0.36, 1.69, -1.12], [0.06, 0.06, 0.16], PRATA);   // manete do freio
      cano(cam, L, [0.2, 1.72, -1.22], [0.2 + bal * 0.06, 1.42, -1.26 - Math.abs(bal) * 0.04], 0.022, 0.022, cor);   // alça de pulso
      caixa(cam, L, [-0.38, 1.62, -1.28], [0.18, 0.16, 0.18], PRETO, null, { chanfro: 0.04 });   // porta-copo com a mamadeira
      cano(cam, L, [-0.38, 1.62, -1.28], [-0.38, 1.92, -1.28], 0.07, 0.065, '#f4f8ff'); caixa(cam, L, [-0.38, 1.95, -1.28], [0.15, 0.06, 0.15], '#8fd3ff', null, { chanfro: 0.03 }); bola(cam, L, [-0.38, 2.03, -1.28], 0.04, 0.06, 0.04, tres('#f5c9a0'));
      caixa(cam, L, [0, 0.62, -0.05], [0.82, 0.3, 0.95], '#2b2b33', { tras: function (c) { retangulo(c, 0, 0, 100, 100, '#2b2b33'); c.strokeStyle = '#555'; c.lineWidth = 3; for (var x = 10; x < 100; x += 14) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 100); c.stroke(); } }, cima: function (c) { retangulo(c, 0, 0, 100, 100, '#3a3a44'); } }, { chanfro: 0.06 });   // cestinha
      // o assento: encosto deitado para trás, laterais de tecido, apoio dos pés
      [-1, 1].forEach(function (l) { chapa(cam, L, [[l * 0.47, 0.82, -0.42], [l * 0.47, 1.42, -0.68], [l * 0.47, 1.28, 0.05], [l * 0.47, 1.12, 0.45], [l * 0.42, 0.62, 0.72]], esc, { verso: cla }); });
      chapa(cam, L, [[-0.45, 0.85, -0.4], [0.45, 0.85, -0.4], [0.45, 0.85, 0.45], [-0.45, 0.85, 0.45]], esc);
      chapa(cam, L, [[-0.42, 0.85, 0.45], [0.42, 0.85, 0.45], [0.38, 0.6, 0.74], [-0.38, 0.6, 0.74]], esc);
      tronco(cam, L, [0, 1.12, -0.52], [0.92, 0.16], [0.88, 0.14, -0.22], 0.6, cor, {
        tras: function (c) { retangulo(c, 0, 0, 100, 100, cor); retangulo(c, 18, 45, 64, 40, esc); retangulo(c, 18, 45, 64, 6, cla); retangulo(c, 0, 20, 100, 6, '#e9edf2'); circulo(c, 50, 64, 7, '#ffd166'); }
      }, { chanfro: 0.06 });
      cano(cam, L, [-0.5, 1.22, 0.48], [0.5, 1.22, 0.48], 0.055, 0.055, '#1b1b20');   // barra de proteção
      // a capota: 4 gomos em volta do eixo das articulações, aberta atrás, cinza por dentro, com a viseira na frente
      var HUB = [0, 1.62, -0.42], RX = 0.56, RR = 0.52, gomos = [-0.2, 0.35, 0.85, 1.3], M = 8;
      function ponto(th, ph) { var u = Math.cos(ph) * RX, w = Math.sin(ph) * RR; return [u, HUB[1] + w * Math.cos(th), HUB[2] + w * Math.sin(th)]; }
      for (var j = 0; j < gomos.length - 1; j++) for (var i = 0; i < M; i++) {
        var p0 = i / M * PI, p1 = (i + 1) / M * PI;
        chapa(cam, L, [ponto(gomos[j], p0), ponto(gomos[j], p1), ponto(gomos[j + 1], p1), ponto(gomos[j + 1], p0)], j === 2 ? esc : cor, { verso: '#9aa0aa' });
      }
      for (j = 0; j < gomos.length; j++) for (i = 0; i < M; i++) cano(cam, L, ponto(gomos[j], i / M * PI), ponto(gomos[j], (i + 1) / M * PI), 0.014, 0.014, j ? esc : '#e9edf2', -0.005);   // costuras (a de trás refletiva)
      [-1, 1].forEach(function (l) { bola(cam, L, [l * RX, HUB[1], HUB[2]], 0.06, 0.09, 0.09, tres(PRETO)); });   // articulações
      var bc = ponto(1.3, PI / 2); cano(cam, L, bc, add(bc, [bal * 0.05, -0.3, 0.05]), 0.01, 0.01, '#ffffff'); bola(cam, L, add(bc, [bal * 0.05, -0.36, 0.05]), 0.07, 0.07, 0.07, tres('#ff8fab'));   // chocalho
      piloto(cam, L, [0, 1.6, -0.22], 0.36, op, -0.25);
      roda(cam, L, [0, 0.42, 1.6], 0.42, 0.13, PRATA, true);
      [-1, 1].forEach(function (l) { roda(cam, L, [l * 0.8, 0.56, -0.55], 0.56, 0.14, PRATA, true); });
    } },
    /* carrinho de empurrar (de passeio, para bebê): carrinho redondinho de brinquedo, branco com friso na cor, para-lamas
       redondos, faróis de olhinho, banco com encosto na cor, volante com buzina, e atrás o cabo de empurrar com a
       bandejinha */
    empurrar: { alt: 3.3, y: 0.95, larg: 0.85, comp: 1.45, montar: function (cam, L, cor, f, op) {
      var BR = '#f4f5f8', cla = tom(cor, 0.3);
      casco(cam, L, [
        { z: -1.15, y: 0.6, w: 0.5, h: 0.2, n: 2.4 }, { z: -1.0, y: 0.64, w: 0.68, h: 0.32, n: 2.8 }, { z: -0.3, y: 0.68, w: 0.74, h: 0.36, n: 3 },
        { z: 0.5, y: 0.68, w: 0.74, h: 0.36, n: 3 }, { z: 1.05, y: 0.62, w: 0.66, h: 0.3, n: 2.6 }, { z: 1.32, y: 0.55, w: 0.46, h: 0.18, n: 2.2 }
      ], BR, { pinta: function (k) { return k === 1 || k === 7 ? cor : null; } });   // friso dos dois lados
      [-1, 1].forEach(function (l) { [-0.72, 0.72].forEach(function (z) { bola(cam, L, [l * 0.6, 0.6, z], 0.2, 0.22, 0.34, tres(BR), -0.02); }); });   // para-lamas
      [-1, 1].forEach(function (l) {
        bola(cam, L, [l * 0.38, 0.8, 1.22], 0.15, 0.15, 0.08, ['#ffffff', '#fffbe0', '#c9c0a0'], -0.02); bola(cam, L, [l * 0.38, 0.8, 1.29], 0.06, 0.06, 0.03, tres('#1a1446'), -0.03);   // faróis de olhinho
        bola(cam, L, [l * 0.42, 0.72, -1.13], 0.09, 0.07, 0.04, ['#ffd0d0', '#ff2a2a', '#9a0010'], -0.02);   // lanternas
      });
      caixa(cam, L, [0, 0.6, -1.15], [0.42, 0.14, 0.02], '#ffffff', { tras: function (c) { texto(c, 'BEBÊ', 50, 52, 30, '#1a1446'); } });
      caixa(cam, L, [0, 1.08, -0.25], [0.9, 0.14, 0.8], cor, { cima: function (c) { retangulo(c, 0, 0, 100, 100, cor); retangulo(c, 46, 0, 8, 100, cla); } }, { chanfro: 0.06 });   // banco
      tronco(cam, L, [0, 1.36, -0.62], [0.9, 0.16], [0.82, 0.14, -0.1], 0.46, cor, { tras: function (c) { retangulo(c, 0, 0, 100, 100, cor); circulo(c, 38, 45, 12, '#ffffff'); circulo(c, 62, 45, 12, '#ffffff'); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(27, 52); c.lineTo(73, 52); c.lineTo(50, 80); c.closePath(); c.fill(); } }, { chanfro: 0.06 });   // encosto com coração
      cano(cam, L, [0, 0.98, 0.42], [0, 1.25, 0.28], 0.04, 0.04, '#9aa0a6');   // coluna e volante
      for (var k = 0; k < 10; k++) { var a0 = k / 10 * PI * 2, a1 = (k + 1) / 10 * PI * 2; cano(cam, L, [Math.cos(a0) * 0.2, 1.27 + Math.sin(a0) * 0.17, 0.27 - Math.sin(a0) * 0.1], [Math.cos(a1) * 0.2, 1.27 + Math.sin(a1) * 0.17, 0.27 - Math.sin(a1) * 0.1], 0.035, 0.035, '#2a2a30'); }
      bola(cam, L, [0, 1.27, 0.27], 0.08, 0.08, 0.05, tres(cor));   // buzina
      piloto(cam, L, [0, 1.6, -0.3], 0.38, op);
      [-1, 1].forEach(function (l) { cano(cam, L, [l * 0.32, 0.88, -1.0], [l * 0.32, 2.2, -1.6], 0.045, 0.045, '#d9dde3'); });   // cabo de empurrar
      cano(cam, L, [-0.4, 2.2, -1.6], [0.4, 2.2, -1.6], 0.065, 0.065, cor);   // pegador
      caixa(cam, L, [0, 1.3, -1.22], [0.7, 0.07, 0.36], cor, { cima: function (c) { retangulo(c, 0, 0, 100, 100, cor); circulo(c, 28, 50, 16, tom(cor, -0.35)); circulo(c, 72, 50, 16, tom(cor, -0.35)); } }, { chanfro: 0.03 });   // bandejinha com porta-copos
      [[-1, -0.72], [1, -0.72], [-1, 0.72], [1, 0.72]].forEach(function (w) { roda(cam, L, [w[0] * 0.62, 0.25, w[1]], 0.25, 0.16, '#ffffff'); });
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
    var o = { cabeca: op.cabeca, giro: op.giroCabeca, aqui: op.aqui, voo: op.voo, t: op.t, corpo: op.corpo, ri: op.ri };
    relogio = op.t || 0;
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
  function desenhar(id) { return function (c, W, H, cor, emoji, fase, corpo) { vivo(c, id, 0, 0, W, H, cor, fase, 0, 0, { corpo: corpo }); }; }

  // onde fica a cabeça do piloto (para os quadros parados dos rivais e da garagem)
  function cabeca(id, x0, y0, W, H, fase, lado, inclina) { var onde = null; montar(id, x0, y0, W, H, '#ff4fa3', fase, lado, inclina, { aqui: function (o) { onde = o; } }); return onde; }

  var VruuumModelos = { MODELOS: MODELOS, vivo: vivo, desenhar: desenhar, montar: montar, cabeca: cabeca };
  if (typeof module !== 'undefined' && module.exports) module.exports = VruuumModelos;
  else raiz.VruuumModelos = VruuumModelos;
})(this);
