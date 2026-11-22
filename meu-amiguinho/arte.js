/* Meu Pequeno Amiguinho — todo o desenho, em SVG feito em código (nenhuma imagem de fora; tudo original).
   AmiguinhoArte.svg(amigo, op) devolve o <svg> da pelúcia montada, em camadas:
     sombra → apoio de trás (cadeira) → asinhas → costas (mochila; a bolsa vai no corpo, na mão ou por cima dos braços) → cauda → pernas e pés → corpo → roupa → sapatos →
     braços e mangas → pescoço → cabeça (orelhas, focinho, olhos, nariz, bochechas) → capuz → laços e chapéus → óculos →
     o que vai na mãozinha → apoio da frente (muletas).
   Cada bichinho (base) tem a sua geometria e os seus PONTOS DE ANCORAGEM (topo da cabeça, olhos, pescoço, mãos, pés,
   costas, colo…): roupas e acessórios são desenhados a partir desses pontos, por isso encaixam em todas as bases,
   em pé (duas patas) e de 4 patas. AmiguinhoArte.geo(base, corpo, pose) devolve a geometria (usada nos testes).
   op: { id (prefixo dos ids internos; cada SVG da página precisa do seu), anim (classes de respirar/piscar/dançar),
         vista ('inteiro' | 'cabeca' | 'roupa' | 'acess:<id>'), lang (pt|en|es), pose ('pendurada'), fofura (sobrepõe) }
   Também desenha a caixinha-casinha, a máquina de fofura, o cabide das roupas e a certidão. */
(function (raiz) {
  'use strict';
  var D = raiz.AmiguinhoDados || (typeof require === 'function' ? require('./dados.js') : null);
  var A = {};

  /* ---------- ajudantes ---------- */
  function n(v) { return Math.round(v * 10) / 10; }
  function rgb(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function mistura(a, b, t) {
    var x = rgb(a), y = rgb(b);
    return '#' + [0, 1, 2].map(function (i) { var v = Math.round(x[i] + (y[i] - x[i]) * t); v = Math.max(0, Math.min(255, v)); return (v < 16 ? '0' : '') + v.toString(16); }).join('');
  }
  function escuro(h, t) { return mistura(h, '#2a1a24', t); }
  function claro(h, t) { return mistura(h, '#ffffff', t); }
  function luz(h) { var c = rgb(h); return (c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11) / 255; }
  function at(o) { var s = ''; for (var k in o) if (o[k] !== undefined && o[k] !== null && o[k] !== false) s += ' ' + k + '="' + o[k] + '"'; return s; }
  function p(d, o) { return '<path d="' + d + '"' + at(o || {}) + '/>'; }
  function circ(cx, cy, r, o) { return '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '"' + at(o || {}) + '/>'; }
  function elip(cx, cy, rx, ry, o) { return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '"' + at(o || {}) + '/>'; }
  function ret(x, y, w, h, o) { return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '"' + at(o || {}) + '/>'; }
  function lin(x1, y1, x2, y2, o) { return '<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) + '"' + at(o || {}) + '/>'; }
  function gr(s, o) { return s ? '<g' + at(o || {}) + '>' + s + '</g>' : ''; }
  function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function txt(x, y, s, o) { return '<text x="' + n(x) + '" y="' + n(y) + '"' + at(o || {}) + '>' + esc(s) + '</text>'; }
  function rad(g) { return g * Math.PI / 180; }
  function coracaoD(x, y, s) {   // coração com a ponta para baixo, centro (x, y), largura ~ 2s
    return 'M' + n(x) + ',' + n(y + s * 0.95) + ' C' + n(x - s * 1.25) + ',' + n(y + s * 0.15) + ' ' + n(x - s * 1.05) + ',' + n(y - s * 0.95) + ' ' + n(x) + ',' + n(y - s * 0.35) +
      ' C' + n(x + s * 1.05) + ',' + n(y - s * 0.95) + ' ' + n(x + s * 1.25) + ',' + n(y + s * 0.15) + ' ' + n(x) + ',' + n(y + s * 0.95) + 'Z';
  }
  function estrelaD(x, y, R, r, pontas) {
    pontas = pontas || 5; var s = '';
    for (var i = 0; i < pontas * 2; i++) { var a = -Math.PI / 2 + i * Math.PI / pontas, q = i % 2 ? r : R; s += (i ? 'L' : 'M') + n(x + Math.cos(a) * q) + ',' + n(y + Math.sin(a) * q); }
    return s + 'Z';
  }
  function brilhoD(x, y, r) { return 'M' + n(x) + ',' + n(y - r) + ' Q' + n(x) + ',' + n(y) + ' ' + n(x + r) + ',' + n(y) + ' Q' + n(x) + ',' + n(y) + ' ' + n(x) + ',' + n(y + r) + ' Q' + n(x) + ',' + n(y) + ' ' + n(x - r) + ',' + n(y) + ' Q' + n(x) + ',' + n(y) + ' ' + n(x) + ',' + n(y - r) + 'Z'; }
  function sorteio(s) { s = s >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function fam(id) { var b = D.base[id]; return (b && b.familia) || id; }
  function corHex(id, pad) { var c = D.CORES[id]; return c ? c.hex : (pad || '#cccccc'); }
  A.util = { mistura: mistura, escuro: escuro, claro: claro, coracaoD: coracaoD, estrelaD: estrelaD, esc: esc };

  /* ---------- contexto de um desenho: ids únicos, gradientes, recortes e estampas ---------- */
  function Ctx(id) { this.id = id || 'ma'; this.defs = []; this.k = 0; this.cache = {}; }
  Ctx.prototype.uid = function (nome) { return this.id + '-' + nome + (++this.k); };
  Ctx.prototype.lin = function (stops, x1, y1, x2, y2, user) {
    var chave = 'l' + stops.join() + x1 + y1 + x2 + y2 + user; if (this.cache[chave]) return this.cache[chave];
    var id = this.uid('l'), s = stops.map(function (c, i) { var o = Array.isArray(c) ? c : [c, 1]; return '<stop offset="' + n(i / Math.max(1, stops.length - 1)) + '" stop-color="' + o[0] + '"' + (o[1] < 1 ? ' stop-opacity="' + o[1] + '"' : '') + '/>'; }).join('');
    this.defs.push('<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' + (user ? ' gradientUnits="userSpaceOnUse"' : '') + '>' + s + '</linearGradient>');
    return (this.cache[chave] = 'url(#' + id + ')');
  };
  Ctx.prototype.radial = function (stops, cx, cy, r) {
    var chave = 'r' + stops.join() + cx + cy + r; if (this.cache[chave]) return this.cache[chave];
    var id = this.uid('r'), s = stops.map(function (o) { return '<stop offset="' + o[0] + '" stop-color="' + o[1] + '" stop-opacity="' + (o[2] == null ? 1 : o[2]) + '"/>'; }).join('');
    this.defs.push('<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + s + '</radialGradient>');
    return (this.cache[chave] = 'url(#' + id + ')');
  };
  Ctx.prototype.corte = function (d) {   // clipPath a partir de um caminho
    if (this.cache['c' + d]) return this.cache['c' + d];
    var id = this.uid('c'); this.defs.push('<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>');
    return (this.cache['c' + d] = 'url(#' + id + ')');
  };
  Ctx.prototype.faixa = function (y0, y1) { return this.corte('M-60,' + n(y0) + 'H360V' + n(y1) + 'H-60Z'); };
  // volume da pelúcia: luz no alto à esquerda, sombra embaixo à direita (um só para tudo)
  Ctx.prototype.volume = function () { return this.radial([[0, '#ffffff', 0.42], [0.45, '#ffffff', 0], [0.78, '#3a1830', 0], [1, '#3a1830', 0.2]], 0.36, 0.3, 0.8); };
  // pelo: fiozinhos curtos (textura de pelúcia)
  Ctx.prototype.pelo = function (cor, forte) {
    var chave = 'pelo' + cor + forte; if (this.cache[chave]) return this.cache[chave];
    var id = this.uid('pelo'), r = sorteio(7), s = '';
    for (var i = 0; i < 9; i++) { var x = r() * 16, y = r() * 16, a = r() * 6.28; s += p('M' + n(x) + ',' + n(y) + ' q' + n(Math.cos(a) * 2.5) + ',' + n(Math.sin(a) * 2.5) + ' ' + n(Math.cos(a + 0.6) * 4.5) + ',' + n(Math.sin(a + 0.6) * 4.5), { stroke: i % 3 ? cor : '#ffffff', 'stroke-opacity': i % 3 ? (forte ? 0.22 : 0.1) : (forte ? 0.3 : 0.14), 'stroke-width': 1.1, fill: 'none', 'stroke-linecap': 'round' }); }
    this.defs.push('<pattern id="' + id + '" width="16" height="16" patternUnits="userSpaceOnUse">' + s + '</pattern>');
    return (this.cache[chave] = 'url(#' + id + ')');
  };
  // estampas de tecido (em cima da cor da roupa)
  Ctx.prototype.estampa = function (tipo, cor) {
    if (!tipo || tipo === 'lisa' || tipo === 'controle') return null;
    var chave = 'est' + tipo + cor; if (this.cache[chave]) return this.cache[chave];
    var id = this.uid('e'), cl = luz(cor) > 0.72, tinta = cl ? escuro(cor, 0.45) : '#ffffff', s = '', w = 22, h = 22;
    if (tipo === 'bolinhas') { s = circ(5, 5, 2.6, { fill: tinta, opacity: 0.85 }) + circ(16, 16, 2.6, { fill: tinta, opacity: 0.85 }); }
    else if (tipo === 'listras') { w = 12; h = 12; s = p('M-3,3 L3,-3 M-3,15 L15,-3 M9,15 L15,9', { stroke: tinta, 'stroke-width': 3, opacity: 0.7 }); }
    else if (tipo === 'estrelas') { s = p(estrelaD(6, 6, 3.6, 1.6), { fill: cl ? '#f2c14e' : '#fff6c8' }) + p(estrelaD(17, 16, 2.6, 1.1), { fill: tinta, opacity: 0.8 }) + circ(16, 5, 1, { fill: tinta }); }
    else if (tipo === 'coracoes') { s = p(coracaoD(6, 6, 3.4), { fill: cl ? '#f06292' : '#ffd1e3' }) + p(coracaoD(17, 16, 2.6), { fill: tinta, opacity: 0.75 }); }
    else if (tipo === 'esportes') {
      w = 30; h = 30;
      s = circ(8, 8, 5, { fill: '#fff', stroke: '#2e2a33', 'stroke-width': 0.8 }) + p('M8,5.3 l2.2,1.6 -0.8,2.6 h-2.8 l-0.8,-2.6z', { fill: '#2e2a33' }) +
        circ(23, 22, 5, { fill: '#f08a3c', stroke: '#7a3a10', 'stroke-width': 0.8 }) + p('M18,22 h10 M23,17 v10 M19.5,18.5 q3.5,3.5 0,7 M26.5,18.5 q-3.5,3.5 0,7', { stroke: '#7a3a10', 'stroke-width': 0.7, fill: 'none' }) +
        p(estrelaD(24, 7, 2.6, 1.1), { fill: '#ffd447' }) + circ(8, 24, 1.4, { fill: tinta });
    }
    else if (tipo === 'nuvens') { w = 28; h = 24; s = p('M4,14 a4,4 0 0 1 6,-4 a5,5 0 0 1 9,1 a3.5,3.5 0 0 1 1,7 h-14 a3,3 0 0 1 -2,-4z', { fill: '#fff', opacity: 0.9 }) + p(estrelaD(22, 4, 2.4, 1), { fill: '#ffe27a' }); }
    else if (tipo === 'praia') {
      w = 34; h = 30;
      s = p('M6,26 q-2,-10 2,-20 q4,10 2,20z', { fill: '#ffb347', stroke: '#c46a1a', 'stroke-width': 0.6 }) + lin(8, 8, 8, 25, { stroke: '#fff', 'stroke-width': 0.8 }) +
        p('M24,27 q1,-8 -1,-14', { stroke: '#8a5a3c', 'stroke-width': 1.6, fill: 'none' }) + p('M23,13 q-6,-2 -9,2 M23,13 q-2,-6 -7,-6 M23,13 q3,-6 8,-4 M23,13 q6,0 8,5', { stroke: '#3aa35a', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' });
    }
    else if (tipo === 'bichinhos') {
      w = 30; h = 28;
      s = circ(8, 9, 5, { fill: '#f2c48c' }) + circ(4.5, 5, 2, { fill: '#f2c48c' }) + circ(11.5, 5, 2, { fill: '#f2c48c' }) + circ(6.5, 9, 0.8, { fill: '#3a2a2a' }) + circ(9.5, 9, 0.8, { fill: '#3a2a2a' }) +
        circ(22, 21, 4.6, { fill: '#f7b6cf' }) + p('M18.5,17 l1.5,-4 2,3.4z M25.5,17 l-1.5,-4 -2,3.4z', { fill: '#f7b6cf' }) + circ(20.6, 21, 0.8, { fill: '#3a2a2a' }) + circ(23.4, 21, 0.8, { fill: '#3a2a2a' }) + p(coracaoD(24, 6, 2), { fill: tinta, opacity: 0.7 });
    }
    else if (tipo === 'doces') {
      w = 30; h = 30;
      s = circ(8, 8, 4.4, { fill: '#ff8fbf' }) + p('M8,4 a4,4 0 0 1 0,8 a2.2,2.2 0 0 1 0,-4.4', { fill: 'none', stroke: '#fff', 'stroke-width': 1 }) + lin(8, 12.4, 8, 18, { stroke: '#fff', 'stroke-width': 1.2 }) +
        p(coracaoD(23, 21, 3.4), { fill: '#b78cf2' }) + p('M16,27 a6,6 0 0 1 12,0', { fill: 'none', stroke: '#7fc8f8', 'stroke-width': 1.4 }) + p('M18,27 a4,4 0 0 1 8,0', { fill: 'none', stroke: '#ffe27a', 'stroke-width': 1.4 }) + circ(24, 6, 1.2, { fill: tinta });
    }
    else if (tipo === 'camuflado') { w = 26; h = 26; s = p('M2,4 q6,-3 9,2 q-4,5 -9,2z M14,14 q6,-4 10,1 q-3,6 -10,2z M3,18 q4,-3 7,1 q-3,4 -7,1z', { fill: '#5a6b3a' }) + p('M14,3 q5,0 6,4 q-4,2 -6,-1z M8,10 q3,-1 4,2 q-2,2 -4,0z', { fill: '#3a3226' }); }
    else if (tipo === 'glitter') { w = 14; h = 14; s = circ(3, 3, 1, { fill: '#fff' }) + circ(10, 8, 0.8, { fill: '#fff8d0' }) + circ(6, 11, 0.6, { fill: '#fff' }); }
    else if (tipo === 'bolinhas-mini') { w = 9; h = 9; s = circ(2.5, 2.5, 1.7, { fill: tinta, opacity: 0.9 }) + circ(7, 7, 1.7, { fill: tinta, opacity: 0.9 }); }
    else if (tipo === 'xadrez') { w = 8; h = 8; s = ret(0, 0, 4, 8, { fill: cl ? escuro(cor, 0.35) : '#ffffff', opacity: 0.35 }) + ret(0, 0, 8, 4, { fill: cl ? escuro(cor, 0.35) : '#ffffff', opacity: 0.35 }); }
    else if (tipo === 'lantejoula') { w = 10; h = 9; s = circ(2.5, 2.5, 2.4, { fill: claro(cor, 0.2), stroke: escuro(cor, 0.25), 'stroke-width': 0.5 }) + circ(7.5, 7, 2.4, { fill: claro(cor, 0.5), stroke: escuro(cor, 0.25), 'stroke-width': 0.5 }) + circ(2, 2, 0.6, { fill: '#fff' }) + circ(7, 6.4, 0.5, { fill: '#fff' }); }
    else if (tipo === 'paete') { w = 10; h = 9; s = circ(2.5, 2.5, 2.4, { fill: '#ff9ed0', stroke: '#e0559a', 'stroke-width': 0.5 }) + circ(7.5, 7, 2.4, { fill: '#ffc2e2', stroke: '#e0559a', 'stroke-width': 0.5 }) + circ(2, 2, 0.6, { fill: '#fff' }); }
    else return null;
    this.defs.push('<pattern id="' + id + '" width="' + w + '" height="' + h + '" patternUnits="userSpaceOnUse">' + s + '</pattern>');
    return (this.cache[chave] = 'url(#' + id + ')');
  };

  /* ---------- a turma: geometria de cada bichinho ---------- */
  // Em pé: cabeça grande, corpo de pera, braços e pernas curtinhos (pelúcia). 4 patas: cabeça de frente, corpo de lado.
  var GEO_PE = function () {
    return { corpo: 'pe', cab: { x: 150, y: 128, rx: 80, ry: 70 }, t: { y0: 186, y1: 296, wt: 44, wb: 62 },
      omb: [[110, 206], [190, 206]], mao: [[84, 262], [216, 262]], rb: 18,
      qua: [[127, 288], [173, 288]], pe: [[121, 336], [179, 336]], rp: 21, peRx: 25, peRy: 15, chao: 354, olhoDx: 31, olhoR: 13.5 };
  };
  // a cabeça encosta na frente do corpo (dono, 22/Nov/2026: "corpo separado da cabeça"); o conjunto fica dentro dos
  // 300 de largura, com o rabo nascendo por dentro do corpo (dono, 22/Nov/2026: "não pode deixar nada desalinhado")
  var GEO_Q = function () {
    return { corpo: 'q', cab: { x: 110, y: 156, rx: 74, ry: 64 }, b: { x: 172, y: 262, rx: 90, ry: 58 },
      // pernas: [topo, pé]; as duas de longe primeiro (frente, trás), mais escuras; depois as de perto (frente, trás)
      pernas: [[[148, 282], [148, 334]], [[228, 282], [228, 334]], [[116, 292], [116, 342]], [[200, 292], [200, 342]]],
      rp: 21, peRx: 22, peRy: 13, chao: 356, olhoDx: 28, olhoR: 13, cauda: [254, 242] };
  };
  var AJUSTE = {
    elefante: function (g) { g.cab.rx += 4; if (g.corpo === 'q') g.cab.x += 22; },   // 4 patas: as orelhonas cabem na imagem
    capivara: function (g) { g.cab.rx += 6; g.cab.ry -= 6; g.cab.y += 4; g.olhoR -= 1.5; if (g.corpo === 'q') g.cab.x += 4; },
    girafa: function (g) { g.cab.y -= g.corpo === 'q' ? 34 : 10; g.cab.rx -= 6; g.pescocoLongo = g.corpo === 'q' ? 34 : 10; },
    braquio: function (g) { g.cab.y -= 58; g.cab.x += 6; g.cab.rx -= 10; g.cab.ry -= 8; g.pescocoLongo = 60; g.olhoR -= 1; g.olhoDx -= 3; },
    preguica: function (g) { if (g.corpo === 'pe') { g.mao = [[70, 300], [230, 300]]; g.bracoLongo = true; } },
    pinguim: function (g) { if (g.corpo === 'pe') { g.t.wb += 6; g.t.wt += 4; } },
    unicornio: function (g) { g.cab.ry += 2; },
    porquinho: function (g) { g.cab.rx += 2; },
    coala: function (g) { g.cab.rx += 2; }
  };
  A.geo = function (base, corpo, pose, a) {
    var b = D.base[base] || D.BASES[0];
    corpo = b.corpos.indexOf(corpo) >= 0 ? corpo : b.corpos[0];
    var g = corpo === 'q' ? GEO_Q() : GEO_PE();
    g.base = b.id;
    if (AJUSTE[b.id]) AJUSTE[b.id](g);
    var c = g.cab, temColo = a && a.acess && a.acess.colo;
    if (corpo === 'pe') {
      if (a && a.acess && a.acess.apoio === 'cadeira') { g.sentado = true; g.pe = [[124, 312], [176, 312]]; g.qua = [[127, 286], [173, 286]]; }
      if (pose === 'pendurada') { g.pendurada = true; g.mao = [[104, 14], [196, 14]]; }
      else if (temColo) { g.mao = [[118, 266], [182, 266]]; g.abraco = true; }
      g.pescoco = [150, g.t.y0 + 8]; g.peito = [150, g.t.y0 + 44]; g.colo = [150, g.t.y1 - 36];
      g.costas = [150, g.t.y0 + 46]; g.pulso = g.mao[0]; g.maoItem = g.mao[1];
      g.pes = g.pe.slice();
    } else {
      g.pescoco = [c.x + 6, c.y + c.ry - 4]; g.peito = [g.b.x - 6, g.b.y - 6]; g.colo = [g.b.x + 6, g.b.y - g.b.ry - 4];
      g.costas = [g.b.x + 14, g.b.y - g.b.ry + 6]; g.pulso = [g.pernas[2][1][0], g.pernas[2][1][1] - 16]; g.maoItem = [c.x - 22, c.y + c.ry + 18];
      g.pes = g.pernas.map(function (l) { return l[1]; });
      if (a && a.acess && a.acess.apoio === 'cadeira') g.carrinho = true;
    }
    g.topo = [c.x, c.y - c.ry];
    g.olhoY = c.y + 4;
    g.focinho = [c.x, c.y + c.ry * 0.42];
    // laços: em cima, perto da orelha (esquerda e direita)
    var ang = [-128, -52];
    g.laco = ang.map(function (d) { return [c.x + Math.cos(rad(d)) * c.rx * 0.9, c.y + Math.sin(rad(d)) * c.ry * 0.9]; });
    return g;
  };

  /* ---------- cores do pelo ---------- */
  function tintas(c, a) {
    var pe = D.pelo[a.pelo] || D.PELOS[0], T = {};
    if (pe.grad) {
      T.f = c.lin(pe.grad, 30, 20, 270, 370, true);
      T.base = pe.grad[Math.floor(pe.grad.length / 2)];
      T.grad = pe.grad;
    } else { T.f = pe.cor; T.base = pe.cor; }
    T.s = escuro(T.base, luz(T.base) > 0.5 ? 0.38 : 0.5);
    T.cl = claro(T.base, 0.62);           // focinho, barriga, parte de dentro da orelha
    T.esc = escuro(T.base, 0.22);         // orelhas de cachorro, sombras
    T.tex = c.pelo(escuro(T.base, 0.5), /preguica|ovelha|coala|poodle|lulu/.test(a.base));
    T.vol = c.volume();
    T.boca = luz(T.base) < 0.3 ? '#f4d9de' : '#5a3440';
    var cr = D.coracao[a.coracao] || D.CORACOES[1];
    T.coracao = cr.grad ? c.lin(cr.grad, 0, 0, 1, 1) : cr.cor;
    // segunda cor de cada bicho (manchas, membros, crina)
    var b = a.base;
    if (b === 'panda') T.m = luz(T.base) < 0.35 ? '#f3efe8' : '#39333d';
    else if (b === 'girafa' || b === 'braquio') T.m = mistura(T.base, b === 'braquio' ? '#2f7a55' : '#b0662c', 0.55);
    else if (b === 'preguica') T.m = luz(T.base) > 0.62 && pe.cor && /#c|#b/.test(pe.cor) && a.pelo === 'cinza' ? '#7a5a44' : escuro(T.base, 0.32);
    else if (b === 'leao') T.m = mistura(T.base, '#b8601e', 0.55);
    else if (b === 'raposa') T.m = '#3a2a2e';
    else if (b === 'pinguim') T.m = '#ffa53a';
    else if (b === 'dino') T.m = mistura(T.base, '#f5a3c0', 0.6);
    else T.m = T.esc;
    if (pe.brilho) T.brilho = true;
    return T;
  }

  /* ---------- corpo em pé ---------- */
  function troncoD(g, k) {
    var t = g.t, x = 150, a = t.wt + k, b = t.wb + k, y0 = t.y0 - k * 0.5, y1 = t.y1 + k * 0.6;
    return 'M' + n(x - a) + ',' + n(y0 + 6) + ' C' + n(x - a - 6) + ',' + n(y0 + 40) + ' ' + n(x - b) + ',' + n(y1 - 56) + ' ' + n(x - b) + ',' + n(y1 - 26) +
      ' C' + n(x - b) + ',' + n(y1 + 2) + ' ' + n(x - b * 0.5) + ',' + n(y1 + 10) + ' ' + x + ',' + n(y1 + 10) +
      ' C' + n(x + b * 0.5) + ',' + n(y1 + 10) + ' ' + n(x + b) + ',' + n(y1 + 2) + ' ' + n(x + b) + ',' + n(y1 - 26) +
      ' C' + n(x + b) + ',' + n(y1 - 56) + ' ' + n(x + a + 6) + ',' + n(y0 + 40) + ' ' + n(x + a) + ',' + n(y0 + 6) +
      ' C' + n(x + a * 0.5) + ',' + n(y0 - 8) + ' ' + n(x - a * 0.5) + ',' + n(y0 - 8) + ' ' + n(x - a) + ',' + n(y0 + 6) + 'Z';
  }
  A.troncoD = troncoD;
  function capsula(x1, y1, x2, y2, r, cor, contorno, extra) {
    return lin(x1, y1, x2, y2, { stroke: contorno, 'stroke-width': n(r * 2 + 4.6), 'stroke-linecap': 'round' }) +
      lin(x1, y1, x2, y2, Object.assign({ stroke: cor, 'stroke-width': n(r * 2), 'stroke-linecap': 'round' }, extra || {}));
  }
  function pePelucia(x, y, g, cor, T, sentado, sola) {
    if (sentado) {   // sentadinho de frente: a sola redonda aparece, com almofadinhas
      return circ(x, y, 19, { fill: cor, stroke: T.s, 'stroke-width': 2.3 }) + circ(x, y + 3, 11.5, { fill: sola || T.cl }) +
        circ(x - 8, y - 9, 3.4, { fill: sola || T.cl }) + circ(x, y - 12, 3.4, { fill: sola || T.cl }) + circ(x + 8, y - 9, 3.4, { fill: sola || T.cl });
    }
    return elip(x, y + 3, g.peRx, g.peRy, { fill: cor, stroke: T.s, 'stroke-width': 2.3 }) + elip(x, y + 7, g.peRx * 0.55, g.peRy * 0.42, { fill: sola || T.cl, opacity: 0.85 });
  }
  function pernasPe(c, a, g, T) {
    var s = '', cor = T.membro || T.f;
    for (var i = 0; i < 2; i++) {
      var q = g.qua[i], pe = g.pe[i];
      s += capsula(q[0], q[1], pe[0], pe[1] - (g.sentado ? 0 : 6), g.rp, cor, T.s);
      s += pePelucia(pe[0], pe[1], g, T.pe || cor, T, g.sentado, T.sola);
    }
    return s;
  }
  function troncoPe(c, a, g, T) {
    var d = troncoD(g, 0), t = g.t, s = '';
    s += p(d, { fill: T.f, stroke: T.s, 'stroke-width': 2.4 });
    s += p(d, { fill: T.tex }) + p(d, { fill: T.vol, opacity: 0.9 });
    var by = t.y0 + (t.y1 - t.y0) * 0.6, bw = t.wb * 0.6, bh = (t.y1 - t.y0) * 0.36;
    if (a.base === 'pinguim') { bw = t.wb * 0.82; bh = (t.y1 - t.y0) * 0.5; by -= 6; }
    var corB = a.base === 'pinguim' ? '#fbfaf7' : T.cl;
    s += elip(150, by, bw, bh, { fill: corB, opacity: a.base === 'pinguim' ? 1 : 0.8 }) + elip(150, by, bw - 3, bh - 3, { fill: 'none', stroke: T.s, 'stroke-width': 1.2, 'stroke-dasharray': '3 3', opacity: 0.5 });
    if (a.base === 'dino') for (var k = -2; k <= 2; k++) s += p('M' + n(150 - bw * 0.8) + ',' + n(by + k * bh * 0.34) + ' Q150,' + n(by + k * bh * 0.34 + 5) + ' ' + n(150 + bw * 0.8) + ',' + n(by + k * bh * 0.34), { stroke: T.s, 'stroke-width': 1, fill: 'none', opacity: 0.35 });
    if (a.base === 'girafa') s += manchas(g, T, [[124, 220, 9], [176, 236, 11], [130, 268, 8], [172, 282, 7]]);
    if (a.base === 'robo') s += ret(124, t.y0 + 40, 52, 40, { rx: 10, fill: '#dfe4ec', stroke: '#8a94a4', 'stroke-width': 2 }) + circ(138, t.y0 + 60, 5, { fill: '#ff8fb3' }) + circ(150, t.y0 + 60, 5, { fill: '#ffd447' }) + circ(162, t.y0 + 60, 5, { fill: '#6ff0c8' });
    // o coraçãozinho bordado no peito (fica por baixo da roupa)
    s += p(coracaoD(168, t.y0 + 30, 7), { fill: T.coracao, stroke: '#ffffff', 'stroke-width': 1.2, 'stroke-dasharray': '2 1.6' });
    return s;
  }
  function manchas(g, T, lista) {
    return lista.map(function (m) {
      var x = m[0], y = m[1], r = m[2];
      return p('M' + n(x - r) + ',' + n(y) + ' q' + n(r * 0.2) + ',' + n(-r * 1.1) + ' ' + n(r * 1.1) + ',' + n(-r * 0.9) + ' q' + n(r * 1.1) + ',' + n(r * 0.3) + ' ' + n(r * 0.8) + ',' + n(r * 1.2) + ' q' + n(-r * 0.4) + ',' + n(r * 0.9) + ' ' + n(-r * 1.2) + ',' + n(r * 0.7) + ' q' + n(-r * 0.8) + ',' + n(-r * 0.2) + ' ' + n(-r * 0.7) + ',' + n(-r) + 'z', { fill: T.m, opacity: 0.9 });
    }).join('');
  }
  function bracoPe(c, a, g, T, i) {
    var s = '', cor = T.membro || T.f, o = g.omb[i], m = g.mao[i];
    s += capsula(o[0], o[1], m[0], m[1], g.rb, cor, T.s);
    s += circ(m[0], m[1] + (g.pendurada ? -3 : 3), g.rb * 0.55, { fill: T.palma || T.cl, opacity: 0.9 });
    if (a.base === 'preguica' || a.base === 'coala') {   // garrinhas macias
      for (var k = -1; k <= 1; k++) s += p('M' + n(m[0] + k * 6) + ',' + n(m[1] + (g.pendurada ? -14 : 14)) + ' q' + n(k * 1.5) + ',' + n(g.pendurada ? -7 : 7) + ' ' + n(k * 3) + ',' + n(g.pendurada ? -10 : 10), { stroke: '#f3ead8', 'stroke-width': 3.4, 'stroke-linecap': 'round', fill: 'none' });
    }
    return s;
  }

  /* ---------- corpo de 4 patas ---------- */
  // uma pata de 4 patas, com a roupa e o sapato dela, num grupo com pivô no alto (para andar)
  function pataQ(c, a, g, T, i, extra) {
    var l = g.pernas[i], top = l[0], pe = l[1], longe = i < 2, cor = T.membro || T.f, cl = escuro(T.base, 0.12), r = '';
    var corP = longe && !T.grad ? cl : cor;
    r += capsula(top[0], top[1], pe[0], pe[1] - 4, g.rp, corP, T.s);
    r += elip(pe[0], pe[1] + 2, g.peRx, g.peRy, { fill: longe && !T.grad ? cl : (T.pe || cor), stroke: T.s, 'stroke-width': 2.2 });
    r += elip(pe[0], pe[1] + 6, g.peRx * 0.55, g.peRy * 0.4, { fill: T.sola || T.cl, opacity: 0.85 });
    r += extra || '';
    if (longe) r += lin(top[0], top[1] - 6, pe[0], pe[1] + 4, { stroke: '#2a1a24', 'stroke-width': g.rp * 2 + 6, opacity: 0.1, 'stroke-linecap': 'round' });
    return gr(r, { 'class': 'ma-pata', 'data-i': i, 'data-px': top[0], 'data-py': top[1] - 8 });
  }
  function corpoQ(c, a, g, T, roupa, patas) {
    var s = '', b = g.b;
    s += patas[0] + patas[1];
    var d = 'M' + n(b.x - b.rx) + ',' + n(b.y) + ' a' + b.rx + ',' + b.ry + ' 0 1 0 ' + n(b.rx * 2) + ',0 a' + b.rx + ',' + b.ry + ' 0 1 0 ' + n(-b.rx * 2) + ',0z';
    s += p(d, { fill: T.f, stroke: T.s, 'stroke-width': 2.4 }) + p(d, { fill: T.tex }) + p(d, { fill: T.vol, opacity: 0.85 });
    s += elip(b.x - 10, b.y + b.ry * 0.5, b.rx * 0.6, b.ry * 0.32, { fill: T.cl, opacity: 0.6 });
    if (a.base === 'girafa' || a.base === 'braquio') s += manchas(g, T, [[b.x - 26, 235, 10], [b.x + 14, 248, 12], [b.x + 50, 232, 9], [b.x + 36, 278, 8], [b.x - 6, 280, 7]]);
    if (a.base === 'braquio') for (var k = 0; k < 5; k++) { var ex = b.x + 4 + k * 16, ey = b.y - b.ry * Math.sqrt(1 - Math.pow((ex + 7 - b.x) / b.rx, 2)) + 4;   // espinho nasce na linha das costas
      s += p('M' + n(ex) + ',' + n(ey) + ' l7,-12 l7,12z', { fill: T.m, stroke: T.s, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }); }
    if (a.base === 'gato-rajado') s += listras(b.x, b.y - b.ry + 6, T);
    if (roupa) s += roupa;
    s += patas[2] + patas[3];
    return s;
  }
  function listras(x, y, T) { var s = ''; for (var i = -2; i <= 2; i++) s += p('M' + n(x + i * 22 - 6) + ',' + n(y) + ' q6,14 2,26', { stroke: escuro(T.base, 0.3), 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', opacity: 0.55 }); return s; }

  /* ---------- caudas ---------- */
  function cauda(c, a, g, T) {
    var b = fam(a.base), id = a.base, q = g.corpo === 'q', x = q ? g.cauda[0] : 196, y = q ? g.cauda[1] : 276, s = '';
    if ((b === 'gato' || b === 'gata-preta') && id !== 'lulu' && id !== 'husky') s = p('M' + x + ',' + y + ' c26,-6 30,-40 18,-62 c-4,-8 8,-12 12,-2 c12,26 4,66 -26,72z', { fill: T.f, stroke: T.s, 'stroke-width': 2.2 });
    else if (b === 'raposa') s = p('M' + x + ',' + y + ' c12,-10 30,-32 26,-68 c-1,-8 14,-6 16,6 c6,40 -14,72 -42,70z', { fill: T.f, stroke: T.s, 'stroke-width': 2.2 }) + p('M' + n(x + 26) + ',' + n(y - 68) + ' c-1,-8 14,-6 16,6 c1,10 -2,18 -6,24 c-2,-12 -6,-22 -10,-30z', { fill: '#fbf6ee' });
    else if ((b === 'dino' || b === 'braquio') && q) s = p('M' + n(x - 10) + ',' + n(y - 10) + ' c20,4 36,14 44,40 c-18,-10 -30,-12 -44,-6z', { fill: T.f, stroke: T.s, 'stroke-width': 2.2 }) + p('M' + n(x + 6) + ',' + n(y - 4) + ' l7,-11 6,13z M' + n(x + 20) + ',' + n(y + 6) + ' l8,-9 3,12z', { fill: T.m, stroke: T.s, 'stroke-width': 1.2 });
    else if (b === 'dino' || b === 'braquio') s = p('M' + n(x - 10) + ',' + n(y - 10) + ' c30,4 56,10 78,34 c-26,-4 -52,-6 -78,8z', { fill: T.f, stroke: T.s, 'stroke-width': 2.2 }) + p('M' + n(x + 14) + ',' + n(y - 6) + ' l6,-11 5,13z M' + n(x + 34) + ',' + n(y + 2) + ' l6,-9 5,11z', { fill: T.m, stroke: T.s, 'stroke-width': 1.2 });
    else if (b === 'unicornio') s = arcoCauda(c, x, y);
    else if (b === 'leao') s = p('M' + x + ',' + y + ' c18,0 22,-26 28,-44', { stroke: T.s, 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }) + p('M' + x + ',' + y + ' c18,0 22,-26 28,-44', { stroke: T.f, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }) + circ(x + 30, y - 48, 10, { fill: T.m, stroke: T.s, 'stroke-width': 1.8 });
    else if (b === 'porquinho') s = p('M' + x + ',' + y + ' c12,-4 16,-16 8,-20 c-8,-4 -12,8 -2,10 c10,2 16,-8 18,-14', { stroke: T.s, 'stroke-width': 6.5, fill: 'none', 'stroke-linecap': 'round' }) + p('M' + x + ',' + y + ' c12,-4 16,-16 8,-20 c-8,-4 -12,8 -2,10 c10,2 16,-8 18,-14', { stroke: T.f, 'stroke-width': 3.6, fill: 'none', 'stroke-linecap': 'round' });
    else if (id === 'poodle') s = circ(x + 10, y - 16, 16, { fill: T.f, stroke: T.s, 'stroke-width': 2 }) + lin(x, y, x + 8, y - 10, { stroke: T.s, 'stroke-width': 5 });
    else if (id === 'lulu' || id === 'husky') s = p('M' + x + ',' + y + ' c2,-30 28,-42 32,-20 c3,14 -12,22 -22,14', { stroke: T.s, 'stroke-width': 18, fill: 'none', 'stroke-linecap': 'round' }) + p('M' + x + ',' + y + ' c2,-30 28,-42 32,-20 c3,14 -12,22 -22,14', { stroke: id === 'lulu' ? T.f : '#fbf8f4', 'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round' });
    else if (b === 'cachorro') s = p('M' + x + ',' + y + ' c10,-8 18,-26 30,-30 c6,-2 8,6 2,8 c-10,4 -16,18 -26,30z', { fill: T.f, stroke: T.s, 'stroke-width': 2.2 });
    else if (b === 'girafa' || b === 'elefante' || b === 'capivara') s = p('M' + x + ',' + y + ' q14,10 12,30', { stroke: T.s, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }) + p('M' + x + ',' + y + ' q14,10 12,30', { stroke: T.f, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }) + (b === 'capivara' ? '' : elip(x + 12, y + 34, 5, 8, { fill: b === 'girafa' ? T.m : T.s }));
    else if ((b === 'ovelha' || b === 'coelha' || b === 'urso' || b === 'panda' || b === 'coala') && q) s = circ(x, y - 4, 14, { fill: b === 'coelha' ? '#fbfaf7' : T.f, stroke: T.s, 'stroke-width': 2 });
    return s;
  }
  function arcoCauda(c, x, y) {
    var cores = ['#f9a8c4', '#ffd08a', '#fff09a', '#a8e8c0', '#a8d0f8', '#cdb0f4'], s = '';
    cores.forEach(function (cor, i) { s += p('M' + x + ',' + n(y - 4 + i * 2) + ' c' + n(20 + i * 2) + ',' + n(-10 + i * 4) + ' ' + n(34 - i) + ',' + n(10 + i * 6) + ' ' + n(24 - i * 2) + ',' + n(40 + i * 3), { stroke: cor, 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }); });
    return s;
  }

  /* ---------- cabeça ---------- */
  function cabecaForma(g, a) {
    var c = g.cab;
    if (a.base === 'capivara') {
      var x0 = c.x - c.rx, x1 = c.x + c.rx, y0 = c.y - c.ry, y1 = c.y + c.ry;
      return 'M' + n(x0 + 20) + ',' + n(y0 + 4) + ' Q' + c.x + ',' + n(y0 - 8) + ' ' + n(x1 - 20) + ',' + n(y0 + 4) + ' Q' + n(x1 + 2) + ',' + n(y0 + 18) + ' ' + n(x1) + ',' + n(c.y + 10) +
        ' Q' + n(x1 - 4) + ',' + n(y1) + ' ' + c.x + ',' + n(y1 + 2) + ' Q' + n(x0 + 4) + ',' + n(y1) + ' ' + n(x0) + ',' + n(c.y + 10) + ' Q' + n(x0 - 2) + ',' + n(y0 + 18) + ' ' + n(x0 + 20) + ',' + n(y0 + 4) + 'Z';
    }
    return 'M' + n(c.x - c.rx) + ',' + c.y + ' a' + c.rx + ',' + c.ry + ' 0 1 0 ' + n(c.rx * 2) + ',0 a' + c.rx + ',' + c.ry + ' 0 1 0 ' + n(-c.rx * 2) + ',0z';
  }
  function orelhaRedonda(x, y, r, T, dentro) { return circ(x, y, r, { fill: T.orelha || T.f, stroke: T.s, 'stroke-width': 2.3 }) + circ(x, y, r * 0.58, { fill: dentro || T.cl, opacity: 0.9 }) + circ(x, y, r, { fill: T.vol, opacity: 0.6 }); }
  function orelhas(c, a, g, T) {
    var cb = g.cab, b = fam(a.base), id = a.base, s = '';
    var ox = function (sgn, f) { return cb.x + sgn * cb.rx * f; }, oy = function (f) { return cb.y - cb.ry * f; };
    if (b === 'urso' || b === 'panda' || b === 'leao') { var cor = b === 'panda' ? { orelha: T.m } : {}; [-1, 1].forEach(function (k) { s += orelhaRedonda(ox(k, 0.7), oy(0.76), 23, Object.assign({}, T, cor), b === 'panda' ? escuro(T.m, 0.1) : null); }); }
    else if (b === 'coala') [-1, 1].forEach(function (k) {
      var x = ox(k, 0.86), y = oy(0.5), fofo = '';
      for (var i = 0; i < 9; i++) { var an = rad(i * 40); fofo += circ(x + Math.cos(an) * 26, y + Math.sin(an) * 26, 9, { fill: T.f, stroke: T.s, 'stroke-width': 1.8 }); }
      s += fofo + circ(x, y, 28, { fill: T.f }) + circ(x + k * 3, y + 2, 17, { fill: '#f6f2ee' }) + circ(x + k * 3, y + 2, 17, { fill: T.tex });
    });
    else if (b === 'capivara') [-1, 1].forEach(function (k) { s += orelhaRedonda(ox(k, 0.62), oy(0.86), 11, T); });
    else if (b === 'coelha') [-1, 1].forEach(function (k) {
      var x = cb.x + k * 28, y = cb.y - cb.ry - 34;
      s += '<g transform="rotate(' + (k * 9) + ' ' + x + ' ' + n(y + 40) + ')">' + elip(x, y, 17, 46, { fill: T.f, stroke: T.s, 'stroke-width': 2.3 }) + elip(x, y + 4, 9, 34, { fill: '#f8c6d6' }) + elip(x, y, 17, 46, { fill: T.vol, opacity: 0.6 }) + '</g>';
    });
    else if (b === 'cachorro') [-1, 1].forEach(function (k) {
      var x0 = ox(k, 0.56), y0 = oy(0.82), corO = id === 'poodle' ? escuro(T.base, 0.08) : luz(T.base) > 0.6 ? '#8a5a3c' : escuro(T.base, 0.35);
      if (id === 'poodle') { for (var q2 = 0; q2 < 6; q2++) s += circ(x0 + k * (14 + (q2 % 2) * 12), y0 + 12 + q2 * 12, 13, { fill: corO, stroke: escuro(corO, 0.35), 'stroke-width': 1.8 }); return; }
      s += p('M' + n(x0) + ',' + n(y0) + ' C' + n(x0 + k * 40) + ',' + n(y0 - 6) + ' ' + n(x0 + k * 52) + ',' + n(cb.y + 30) + ' ' + n(x0 + k * 34) + ',' + n(cb.y + 44) + ' C' + n(x0 + k * 22) + ',' + n(cb.y + 52) + ' ' + n(x0 + k * 6) + ',' + n(cb.y + 20) + ' ' + n(x0 - k * 6) + ',' + n(y0 + 18) + 'Z', { fill: corO, stroke: escuro(corO, 0.35), 'stroke-width': 2.2, 'data-fica': 'frente' });
    });
    else if (b === 'gato' || b === 'gata-preta' || b === 'raposa') [-1, 1].forEach(function (k) {
      var bx = ox(k, 0.62), by = oy(0.68), tx = ox(k, 0.86), ty = oy(1.32);
      s += p('M' + n(bx - 26 * k) + ',' + n(by + 4) + ' Q' + n(tx - 4 * k) + ',' + n(ty - 6) + ' ' + n(tx) + ',' + n(ty) + ' Q' + n(tx + 6 * k) + ',' + n(ty + 8) + ' ' + n(bx + 22 * k) + ',' + n(by + 22) + 'Z', { fill: T.f, stroke: T.s, 'stroke-width': 2.3, 'stroke-linejoin': 'round' });
      s += p('M' + n(bx - 14 * k) + ',' + n(by + 4) + ' Q' + n(tx - 3 * k) + ',' + n(ty + 4) + ' ' + n(tx - 1 * k) + ',' + n(ty + 12) + ' Q' + n(tx + 2 * k) + ',' + n(ty + 18) + ' ' + n(bx + 14 * k) + ',' + n(by + 16) + 'Z', { fill: b === 'raposa' || id === 'husky' ? '#fbf3ea' : '#f6b9cc' });
      if (id === 'raposa') s += p('M' + n(tx - 8 * k) + ',' + n(ty + 14) + ' Q' + n(tx) + ',' + n(ty - 4) + ' ' + n(tx + 6 * k) + ',' + n(ty + 12) + 'Z', { fill: '#3a2a2e' });
    });
    else if (b === 'ovelha' || b === 'girafa' || b === 'braquio' || b === 'pinguim' || b === 'preguica' || b === 'dino') {
      if (b === 'ovelha' || b === 'girafa') [-1, 1].forEach(function (k) {
        var x = cb.x + k * (cb.rx + 6), y = cb.y - cb.ry * 0.25;
        s += '<g transform="rotate(' + (k * 28) + ' ' + n(x) + ' ' + n(y) + ')">' + elip(x, y, 24, 10, { fill: id === 'ovelha-preta' ? '#3e3842' : b === 'ovelha' ? T.cl : T.f, stroke: T.s, 'stroke-width': 2 }) + elip(x + k * 3, y, 14, 5, { fill: '#f6b9cc' }) + '</g>';
      });
      if (b === 'girafa' || b === 'braquio') {
        if (b === 'girafa') [-1, 1].forEach(function (k) { var x = cb.x + k * 22, y = cb.y - cb.ry; s += lin(x, y + 8, x + k * 4, y - 22, { stroke: T.s, 'stroke-width': 11, 'stroke-linecap': 'round' }) + lin(x, y + 8, x + k * 4, y - 22, { stroke: T.f, 'stroke-width': 7, 'stroke-linecap': 'round' }) + circ(x + k * 4, y - 24, 8, { fill: T.m, stroke: T.s, 'stroke-width': 2 }); });
      }
      if (b === 'dino') for (var i = -1; i <= 1; i++) { var x = cb.x + i * 30, y = cb.y - cb.ry * (i === 0 ? 1.02 : 0.9); s += p('M' + n(x - 13) + ',' + n(y + 8) + ' Q' + n(x - 2) + ',' + n(y - 26) + ' ' + n(x + 2) + ',' + n(y - 24) + ' Q' + n(x + 8) + ',' + n(y - 10) + ' ' + n(x + 13) + ',' + n(y + 8) + 'Z', { fill: T.m, stroke: T.s, 'stroke-width': 2, 'stroke-linejoin': 'round' }); }
    }
    else if (b === 'elefante') [-1, 1].forEach(function (k) {
      var x = cb.x + k * (cb.rx + (g.corpo === 'q' ? 4 : 14)), y = cb.y + 6;
      s += elip(x, y, 46, 56, { fill: T.f, stroke: T.s, 'stroke-width': 2.4 }) + elip(x + k * 6, y + 4, 30, 40, { fill: '#f3c3d0', opacity: 0.85 }) + elip(x, y, 46, 56, { fill: T.vol, opacity: 0.6 });
    });
    else if (b === 'unicornio') [-1, 1].forEach(function (k) {
      var x = ox(k, 0.55), y = oy(0.98);
      s += '<g transform="rotate(' + (k * 24) + ' ' + n(x) + ' ' + n(y + 20) + ')">' + p('M' + n(x - 14) + ',' + n(y + 16) + ' Q' + n(x - 12) + ',' + n(y - 22) + ' ' + x + ',' + n(y - 30) + ' Q' + n(x + 12) + ',' + n(y - 22) + ' ' + n(x + 14) + ',' + n(y + 16) + 'Z', { fill: T.f, stroke: T.s, 'stroke-width': 2.2 }) + p('M' + n(x - 7) + ',' + n(y + 10) + ' Q' + n(x - 6) + ',' + n(y - 12) + ' ' + x + ',' + n(y - 20) + ' Q' + n(x + 6) + ',' + n(y - 12) + ' ' + n(x + 7) + ',' + n(y + 10) + 'Z', { fill: '#f8c6d6' }) + '</g>';
    });
    else if (b === 'porquinho') [-1, 1].forEach(function (k) {
      var x = ox(k, 0.6), y = oy(0.8);
      s += p('M' + n(x - 18 * k) + ',' + n(y + 8) + ' L' + n(x + 22 * k) + ',' + n(y - 24) + ' L' + n(x + 20 * k) + ',' + n(y + 22) + 'Z', { fill: T.f, stroke: T.s, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }) + p('M' + n(x - 6 * k) + ',' + n(y + 6) + ' L' + n(x + 16 * k) + ',' + n(y - 12) + ' L' + n(x + 14 * k) + ',' + n(y + 14) + 'Z', { fill: escuro(T.base, 0.12) });
    });
    return s;
  }
  function juba(g, T) {   // leão: juba fofa em volta da cabeça
    var cb = g.cab, s = '';
    for (var i = 0; i < 16; i++) { var an = rad(i * 22.5); s += circ(cb.x + Math.cos(an) * (cb.rx + 6), cb.y + Math.sin(an) * (cb.ry + 6), 22, { fill: T.m, stroke: escuro(T.m, 0.35), 'stroke-width': 2 }); }
    return s + elip(cb.x, cb.y, cb.rx + 14, cb.ry + 14, { fill: T.m });
  }
  function crina(c, g, frente) {   // unicórnio: topete arco-íris
    var cb = g.cab, cores = ['#f9a8c4', '#ffd08a', '#a8e8c0', '#a8d0f8', '#cdb0f4'], s = '';
    if (!frente) {
      cores.forEach(function (cor, i) { s += circ(cb.x + cb.rx * 0.55 + i * 3, cb.y - cb.ry * 0.7 + i * 18, 16, { fill: cor, stroke: escuro(cor, 0.25), 'stroke-width': 1.4 }); });
      return s;
    }
    cores.forEach(function (cor, i) { var x = cb.x - 26 + i * 12, y = cb.y - cb.ry + 10 + Math.abs(i - 2) * 4; s += p('M' + n(x - 12) + ',' + n(y - 4) + ' q' + 8 + ',-16 ' + 22 + ',-6 q-2,14 -8,22 q-4,-10 -14,-16z', { fill: cor, stroke: escuro(cor, 0.25), 'stroke-width': 1.3 }); });
    return s;
  }
  function chifre(g) {
    var cb = g.cab, x = cb.x, y = cb.y - cb.ry + 6;
    return p('M' + n(x - 11) + ',' + n(y) + ' L' + x + ',' + n(y - 48) + ' L' + n(x + 11) + ',' + n(y) + 'Z', { fill: '#ffd86b', stroke: '#c9962a', 'stroke-width': 2, 'stroke-linejoin': 'round' }) +
      p('M' + n(x - 8) + ',' + n(y - 9) + ' L' + n(x + 8) + ',' + n(y - 15) + ' M' + n(x - 6) + ',' + n(y - 21) + ' L' + n(x + 6) + ',' + n(y - 27) + ' M' + n(x - 4) + ',' + n(y - 33) + ' L' + n(x + 4) + ',' + n(y - 38), { stroke: '#c9962a', 'stroke-width': 1.6 }) +
      p(brilhoD(x + 14, y - 40, 5), { fill: '#fff8c8', 'class': 'ma-efeito' });   // brilhinho no ar, de propósito
  }
  function la(g, T, cb) {   // ovelha: topete de lã cacheada
    var s = '', pts = [[-34, -0.86], [-18, -1.02], [0, -1.08], [18, -1.02], [34, -0.86], [-24, -0.82], [0, -0.88], [24, -0.82]];
    pts.forEach(function (q) { s += circ(cb.x + q[0], cb.y + cb.ry * q[1] + 6, 15, { fill: T.f, stroke: T.s, 'stroke-width': 1.8 }); });
    pts.forEach(function (q) { s += circ(cb.x + q[0] - 3, cb.y + cb.ry * q[1] + 2, 5, { fill: '#ffffff', opacity: 0.35 }); });
    return s;
  }
  function rosto(c, a, g, T) {
    var cb = g.cab, b = fam(a.base), id = a.base, s = '', fx = cb.x, fy = g.focinho[1];
    // máscaras e manchas do rosto
    if (b === 'panda') [-1, 1].forEach(function (k) { s += '<g transform="rotate(' + (k * -28) + ' ' + n(fx + k * g.olhoDx) + ' ' + n(g.olhoY + 2) + ')">' + elip(fx + k * g.olhoDx, g.olhoY + 3, 21, 26, { fill: T.m }) + '</g>'; });
    if (b === 'preguica') {
      s += elip(fx, cb.y + 10, cb.rx * 0.8, cb.ry * 0.68, { fill: T.cl });
      [-1, 1].forEach(function (k) { s += '<g transform="rotate(' + (k * -18) + ' ' + n(fx + k * g.olhoDx) + ' ' + n(g.olhoY + 4) + ')">' + elip(fx + k * (g.olhoDx + 4), g.olhoY + 6, 26, 15, { fill: T.m }) + '</g>'; });
    }
    if (b === 'raposa' || id === 'lulu') s += p('M' + n(cb.x - cb.rx + 6) + ',' + n(cb.y + 4) + ' Q' + n(cb.x - 30) + ',' + n(cb.y - 6) + ' ' + cb.x + ',' + n(cb.y + 22) + ' Q' + n(cb.x + 30) + ',' + n(cb.y - 6) + ' ' + n(cb.x + cb.rx - 6) + ',' + n(cb.y + 4) + ' Q' + n(cb.x + cb.rx - 10) + ',' + n(cb.y + cb.ry) + ' ' + cb.x + ',' + n(cb.y + cb.ry) + ' Q' + n(cb.x - cb.rx + 10) + ',' + n(cb.y + cb.ry) + ' ' + n(cb.x - cb.rx + 6) + ',' + n(cb.y + 4) + 'Z', { fill: '#fbf6ee' });
    if (b === 'pinguim') s += p('M' + cb.x + ',' + n(cb.y - 24) + ' C' + n(cb.x - 20) + ',' + n(cb.y - 50) + ' ' + n(cb.x - cb.rx + 2) + ',' + n(cb.y - 30) + ' ' + n(cb.x - cb.rx + 10) + ',' + n(cb.y + 10) + ' C' + n(cb.x - cb.rx + 18) + ',' + n(cb.y + 50) + ' ' + n(cb.x + cb.rx - 18) + ',' + n(cb.y + 50) + ' ' + n(cb.x + cb.rx - 10) + ',' + n(cb.y + 10) + ' C' + n(cb.x + cb.rx - 2) + ',' + n(cb.y - 30) + ' ' + n(cb.x + 20) + ',' + n(cb.y - 50) + ' ' + cb.x + ',' + n(cb.y - 24) + 'Z', { fill: '#fbfaf7' });
    if (id === 'husky') s += p('M' + n(cb.x - cb.rx + 8) + ',' + n(cb.y + 2) + ' Q' + n(cb.x - 40) + ',' + n(cb.y - 22) + ' ' + n(cb.x - 12) + ',' + n(cb.y - 14) + ' L' + cb.x + ',' + n(cb.y - cb.ry + 18) + ' L' + n(cb.x + 12) + ',' + n(cb.y - 14) + ' Q' + n(cb.x + 40) + ',' + n(cb.y - 22) + ' ' + n(cb.x + cb.rx - 8) + ',' + n(cb.y + 2) + ' Q' + n(cb.x + cb.rx - 6) + ',' + n(cb.y + cb.ry) + ' ' + cb.x + ',' + n(cb.y + cb.ry) + ' Q' + n(cb.x - cb.rx + 6) + ',' + n(cb.y + cb.ry) + ' ' + n(cb.x - cb.rx + 8) + ',' + n(cb.y + 2) + 'Z', { fill: '#fbf8f4' });
    if (id === 'gato-rajado') s += p('M' + n(cb.x - 30) + ',' + n(cb.y - cb.ry + 14) + ' q4,10 0,18 M' + n(cb.x + 30) + ',' + n(cb.y - cb.ry + 14) + ' q-4,10 0,18', { stroke: escuro(T.base, 0.3), 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', opacity: 0.5 });
    if (id === 'ovelha-preta') s += elip(cb.x, cb.y + 12, cb.rx * 0.8, cb.ry * 0.72, { fill: '#3e3842' });
    if (b === 'cachorro' && id !== 'poodle') s += p('M' + n(cb.x - 9) + ',' + n(cb.y - cb.ry + 4) + ' Q' + cb.x + ',' + n(cb.y - cb.ry - 2) + ' ' + n(cb.x + 9) + ',' + n(cb.y - cb.ry + 4) + ' L' + n(cb.x + 15) + ',' + n(fy - 8) + ' L' + n(cb.x - 15) + ',' + n(fy - 8) + 'Z', { fill: '#fbf6ee' });
    if (b === 'girafa' || b === 'braquio') s += manchas(g, T, [[cb.x - 34, cb.y - 34, 8], [cb.x + 36, cb.y - 28, 7], [cb.x + 4, cb.y - 48, 6]]);
    // focinho
    if (b === 'urso' || b === 'cachorro' || b === 'panda' || b === 'leao' || b === 'coala' || b === 'ovelha' || b === 'preguica') {
      var rx = b === 'coala' ? 30 : 31, ry = b === 'preguica' ? 18 : 23;
      if (b === 'ovelha') { rx = 0; }
      if (rx) s += elip(fx, fy, rx, ry, { fill: b === 'panda' || b === 'cachorro' ? '#fbf6ee' : T.cl, stroke: T.s, 'stroke-width': 1.2, opacity: b === 'preguica' ? 0 : 1 }) + (b === 'preguica' ? '' : elip(fx, fy, rx - 3.5, ry - 3.5, { fill: 'none', stroke: T.s, 'stroke-width': 1.1, 'stroke-dasharray': '2.6 2.6', opacity: 0.55 }));
      if (b === 'cachorro') [-1, 1].forEach(function (k) { s += circ(fx + k * 15, fy + 6, 1.8, { fill: '#8a6a5a' }) + circ(fx + k * 20, fy + 1, 1.6, { fill: '#8a6a5a' }) + circ(fx + k * 21, fy + 9, 1.6, { fill: '#8a6a5a' }); });
    } else if (b === 'coelha' || b === 'gato' || b === 'gata-preta') {
      [-1, 1].forEach(function (k) { s += elip(fx + k * 11, fy + 4, 14, 11, { fill: b === 'gata-preta' ? escuro(T.base, -0.1) : id === 'husky' || id === 'lulu' ? '#fffaf4' : T.cl }); });
      if (b !== 'coelha' && id !== 'lulu' && id !== 'husky') [-1, 1].forEach(function (k) { for (var w = -1; w <= 1; w++) s += lin(fx + k * 20, fy + 2 + w * 5, fx + k * 46, fy - 2 + w * 9, { stroke: b === 'gata-preta' ? '#d8d2e0' : T.s, 'stroke-width': 1.4, 'stroke-linecap': 'round', opacity: 0.8 }); });
    } else if (b === 'unicornio' || b === 'girafa' || b === 'braquio' || b === 'dino') {
      s += elip(fx, fy + 4, b === 'dino' ? 38 : 34, b === 'dino' ? 24 : 25, { fill: b === 'dino' ? T.cl : (b === 'unicornio' ? '#fbe3ec' : '#f7e6c4'), stroke: T.s, 'stroke-width': 1.4 });
      [-1, 1].forEach(function (k) { s += elip(fx + k * 11, fy + 2, 3.4, 4.6, { fill: escuro(T.base, 0.5), opacity: 0.7 }); });
    } else if (b === 'capivara') {
      s += p('M' + n(fx - 38) + ',' + n(fy - 10) + ' Q' + fx + ',' + n(fy - 22) + ' ' + n(fx + 38) + ',' + n(fy - 10) + ' Q' + n(fx + 44) + ',' + n(fy + 22) + ' ' + fx + ',' + n(fy + 24) + ' Q' + n(fx - 44) + ',' + n(fy + 22) + ' ' + n(fx - 38) + ',' + n(fy - 10) + 'Z', { fill: escuro(T.base, 0.12), stroke: T.s, 'stroke-width': 1.4 });
    } else if (b === 'porquinho') {
      s += elip(fx, fy + 2, 26, 18, { fill: escuro(T.base, 0.12), stroke: T.s, 'stroke-width': 1.8 }) + elip(fx - 8, fy + 2, 4, 6, { fill: escuro(T.base, 0.45) }) + elip(fx + 8, fy + 2, 4, 6, { fill: escuro(T.base, 0.45) });
    } else if (b === 'raposa') {
      s += elip(fx, fy + 4, 22, 16, { fill: '#fbf6ee' });
    }
    // olhos
    s += olhos(c, a, g, T);
    // nariz e boca
    s += narizBoca(c, a, g, T, fx, fy);
    // bochechas
    s += bochechas(c, a, g, T);
    return s;
  }
  function olhos(c, a, g, T) {
    var cor = (D.olho[a.olhos] || D.OLHOS[0]).cor, est = a.estiloOlho || 'brilho', r = g.olhoR, s = '';
    [-1, 1].forEach(function (k) {
      var x = g.cab.x + k * g.olhoDx, y = g.olhoY;
      if (est === 'bordado') { s += p('M' + n(x - r * 0.9) + ',' + n(y + 3) + ' Q' + x + ',' + n(y - r * 1.2) + ' ' + n(x + r * 0.9) + ',' + n(y + 3), { stroke: '#2a1e28', 'stroke-width': 4.2, fill: 'none', 'stroke-linecap': 'round' }); return; }
      var iris = c.radial([[0, '#120c16'], [0.42, '#120c16'], [0.5, escuro(cor, 0.25)], [0.8, cor], [1, escuro(cor, 0.45)]], 0.5, 0.55, 0.55);
      var o = elip(x, y, r, r * 1.12, { fill: '#1a1220' }) + elip(x, y + 1, r * 0.84, r * 0.94, { fill: iris }) +
        elip(x + r * 0.32, y - r * 0.42, r * 0.36, r * 0.4, { fill: '#ffffff' }) + circ(x - r * 0.34, y + r * 0.44, r * 0.16, { fill: '#ffffff', opacity: 0.85 }) +
        p(brilhoD(x - r * 0.42, y - r * 0.2, r * 0.18), { fill: '#ffffff', opacity: 0.7 });
      if (est === 'cilios') o += p('M' + n(x + k * r * 0.55) + ',' + n(y - r * 0.85) + ' q' + n(k * 4) + ',-4 ' + n(k * 9) + ',-3 M' + n(x + k * r * 0.85) + ',' + n(y - r * 0.55) + ' q' + n(k * 5) + ',-2 ' + n(k * 10) + ',1 M' + n(x + k * r * 1.0) + ',' + n(y - r * 0.15) + ' q' + n(k * 5) + ',0 ' + n(k * 9) + ',4', { stroke: '#1a1220', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' });
      s += gr(o, { 'class': 'ma-olho' });
    });
    return s;
  }
  function narizBoca(c, a, g, T, fx, fy) {
    var b = fam(a.base), id = a.base, s = '', ny = fy - 6, boca = T.boca;
    if (b === 'ovelha') s += p(coracaoD(fx, g.olhoY + 30, 6.5), { fill: '#f28bb0', stroke: '#d9628e', 'stroke-width': 1, 'stroke-dasharray': '1.6 1.2' });
    else if ((b === 'coelha' || b === 'gato' || b === 'gata-preta' || b === 'unicornio' || b === 'girafa' || b === 'braquio') && id !== 'lulu' && id !== 'husky') { if (b !== 'unicornio' && b !== 'girafa' && b !== 'braquio') s += p('M' + n(fx - 6) + ',' + n(ny) + ' Q' + fx + ',' + n(ny - 3) + ' ' + n(fx + 6) + ',' + n(ny) + ' Q' + n(fx + 1) + ',' + n(ny + 7) + ' ' + fx + ',' + n(ny + 7) + ' Q' + n(fx - 1) + ',' + n(ny + 7) + ' ' + n(fx - 6) + ',' + n(ny) + 'Z', { fill: '#f28bb0' }); }
    else if (b === 'coala') s += elip(fx, ny + 2, 15, 18, { fill: '#4a4652' }) + elip(fx - 5, ny - 6, 4, 5, { fill: '#ffffff', opacity: 0.35 });
    else if (b === 'capivara') s += p('M' + n(fx - 16) + ',' + n(ny - 2) + ' Q' + fx + ',' + n(ny - 8) + ' ' + n(fx + 16) + ',' + n(ny - 2) + ' Q' + n(fx + 14) + ',' + n(ny + 10) + ' ' + fx + ',' + n(ny + 10) + ' Q' + n(fx - 14) + ',' + n(ny + 10) + ' ' + n(fx - 16) + ',' + n(ny - 2) + 'Z', { fill: '#4a3226' });
    else if (b === 'pinguim') s += p('M' + n(fx - 11) + ',' + n(ny - 2) + ' Q' + fx + ',' + n(ny - 8) + ' ' + n(fx + 11) + ',' + n(ny - 2) + ' L' + fx + ',' + n(ny + 12) + 'Z', { fill: '#ffa53a', stroke: '#d9771a', 'stroke-width': 1.4, 'stroke-linejoin': 'round' });
    else if (b === 'elefante') {
      var t0 = g.olhoY + 14;
      s += p('M' + n(fx - 14) + ',' + n(t0) + ' C' + n(fx - 16) + ',' + n(t0 + 40) + ' ' + n(fx - 10) + ',' + n(t0 + 62) + ' ' + n(fx + 14) + ',' + n(t0 + 66) + ' C' + n(fx + 24) + ',' + n(t0 + 66) + ' ' + n(fx + 26) + ',' + n(t0 + 52) + ' ' + n(fx + 18) + ',' + n(t0 + 50) + ' C' + n(fx + 8) + ',' + n(t0 + 48) + ' ' + n(fx + 12) + ',' + n(t0 + 30) + ' ' + n(fx + 14) + ',' + n(t0) + 'Z', { fill: T.f, stroke: T.s, 'stroke-width': 2.2 });
      for (var i = 1; i < 5; i++) s += p('M' + n(fx - 13) + ',' + n(t0 + i * 11) + ' q' + 12 + ',4 ' + 24 + ',0', { stroke: T.s, 'stroke-width': 1.1, fill: 'none', opacity: 0.45 });
      s += p('M' + n(fx - 22) + ',' + n(g.olhoY + 30) + ' q-6,8 2,12', { stroke: boca, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' });
      return s;
    }
    else if (b === 'porquinho') { ny = fy + 14; }
    else if (b === 'dino' || b === 'raposa') s += b === 'raposa' ? elip(fx, ny - 2, 9, 7, { fill: '#2e2228' }) : '';
    else s += p('M' + n(fx - 11) + ',' + n(ny - 4) + ' Q' + fx + ',' + n(ny - 9) + ' ' + n(fx + 11) + ',' + n(ny - 4) + ' Q' + n(fx + 9) + ',' + n(ny + 6) + ' ' + fx + ',' + n(ny + 7) + ' Q' + n(fx - 9) + ',' + n(ny + 6) + ' ' + n(fx - 11) + ',' + n(ny - 4) + 'Z', { fill: b === 'urso' || b === 'leao' ? '#5a3a34' : '#2e2228' }) + elip(fx - 3, ny - 3, 3, 1.8, { fill: '#ffffff', opacity: 0.55 });
    // boquinha
    var my = ny + (b === 'coala' ? 22 : b === 'ovelha' ? 0 : 8);
    if (b === 'ovelha') { my = g.olhoY + 38; s += p('M' + n(fx - 8) + ',' + n(my) + ' Q' + fx + ',' + n(my + 5) + ' ' + n(fx + 8) + ',' + n(my), { stroke: id === 'ovelha-preta' ? '#f4d9de' : '#7a4a52', 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round' }); return s; }
    if (b === 'capivara') my += 6;
    if (b === 'dino' || b === 'unicornio' || b === 'girafa' || b === 'braquio') { s += p('M' + n(fx - 14) + ',' + n(fy + 14) + ' Q' + fx + ',' + n(fy + 22) + ' ' + n(fx + 14) + ',' + n(fy + 14), { stroke: boca, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }); return s; }
    if (b === 'pinguim') { return s; }
    s += p('M' + fx + ',' + n(my - 2) + ' L' + fx + ',' + n(my + 2) + ' M' + n(fx - 9) + ',' + n(my + 1) + ' Q' + n(fx - 4.5) + ',' + n(my + 8) + ' ' + fx + ',' + n(my + 2) + ' Q' + n(fx + 4.5) + ',' + n(my + 8) + ' ' + n(fx + 9) + ',' + n(my + 1), { stroke: boca, 'stroke-width': 2.1, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    if (b === 'coelha') s += ret(fx - 4.5, my + 4.5, 4, 5.5, { rx: 1, fill: '#ffffff', stroke: '#c9b8c0', 'stroke-width': 0.8 }) + ret(fx + 0.5, my + 4.5, 4, 5.5, { rx: 1, fill: '#ffffff', stroke: '#c9b8c0', 'stroke-width': 0.8 });
    return s;
  }
  function bochechas(c, a, g, T) {
    var tipo = a.bochecha || 'rosa', s = '', y = g.olhoY + 24, dx = g.olhoDx + 18;
    if (tipo === 'nenhuma') return '';
    [-1, 1].forEach(function (k) {
      var x = g.cab.x + k * dx;
      if (tipo === 'rosa') s += elip(x, y, 12, 7.5, { fill: '#ff8fb3', opacity: 0.5 });
      else if (tipo === 'pessego') s += elip(x, y, 12, 7.5, { fill: '#ffae7a', opacity: 0.5 });
      else if (tipo === 'coracao') s += p(coracaoD(x, y, 6), { fill: '#ff7aa6', opacity: 0.75 });
      else if (tipo === 'sardas') s += circ(x - 5, y - 2, 1.7, { fill: '#b0703a', opacity: 0.7 }) + circ(x + 2, y - 4, 1.5, { fill: '#b0703a', opacity: 0.7 }) + circ(x + 6, y + 2, 1.7, { fill: '#b0703a', opacity: 0.7 }) + circ(x - 1, y + 3, 1.4, { fill: '#b0703a', opacity: 0.7 });
    });
    return s;
  }
  function cabeca(c, a, g, T, capuzAtras) {
    var cb = g.cab, b = fam(a.base), id = a.base, s = '', d = cabecaForma(g, a);
    if (g.pescocoLongo) {   // girafa e pescoçudo: o pescoço liga a cabeça ao corpo
      var x0 = cb.x, y0 = cb.y + cb.ry * 0.5, x1 = g.corpo === 'q' ? g.b.x - g.b.rx * 0.6 : 150, y1 = g.corpo === 'q' ? g.b.y - 10 : g.t.y0 + 10;
      s += lin(x0, y0, x1, y1, { stroke: T.s, 'stroke-width': 50, 'stroke-linecap': 'round' }) + lin(x0, y0, x1, y1, { stroke: T.f, 'stroke-width': 45.4, 'stroke-linecap': 'round' }) + manchas(g, T, [[n((x0 + x1) / 2 - 6), n((y0 + y1) / 2), 7], [n((x0 * 0.3 + x1 * 0.7) + 6), n(y0 * 0.3 + y1 * 0.7), 6]]);
    }
    if (id === 'robo') return cabecaRobo(c, a, g, T, capuzAtras);
    if (b === 'leao') s += juba(g, T);
    if (id === 'lulu') s += juba(g, Object.assign({}, T, { m: claro(T.base, 0.2), s: T.s }));
    if (b === 'unicornio') s += crina(c, g, false);
    s += capuzAtras || '';
    s += gr(orelhas(c, a, g, T), { 'class': 'ma-orelhas', 'data-px': n(cb.x), 'data-py': n(cb.y) });
    s += p(d, { fill: T.f, stroke: T.s, 'stroke-width': 2.5 }) + p(d, { fill: T.tex }) + p(d, { fill: T.vol });
    if (b === 'ovelha' && id !== 'ovelha-preta') s += elip(cb.x, cb.y + 12, cb.rx * 0.78, cb.ry * 0.7, { fill: T.cl, opacity: 0.85 });
    if (b === 'gato' || b === 'gata-preta') s += p('M' + n(cb.x - 10) + ',' + n(cb.y - cb.ry + 6) + ' l4,16 M' + cb.x + ',' + n(cb.y - cb.ry + 4) + ' l0,18 M' + n(cb.x + 10) + ',' + n(cb.y - cb.ry + 6) + ' l-4,16', { stroke: escuro(T.base, 0.3), 'stroke-width': 3.4, 'stroke-linecap': 'round', opacity: 0.5 });
    s += rosto(c, a, g, T);
    if (b === 'ovelha' || id === 'poodle') s += la(g, T, cb);
    if (b === 'unicornio') s += crina(c, g, true);
    if (T.brilho) s += brilhos(cb.x, cb.y, cb.rx, cb.ry, 7);
    return s;
  }
  // robozinho de pelúcia: cabeça arredondada, telinha escura com olhos e boca de LED (pontinhos), antena que brilha
  var EXPRESSOES = ['feliz', 'piscando', 'coracao', 'estrela', 'surpresa', 'dormindo'];
  A.EXPRESSOES = EXPRESSOES;
  function mapaLed(expr) {   // grade de 15 x 7: '#' acende
    var M = {
      feliz: ['...............', '..#.......#....', '.#.#.....#.#...', '...............', '...............', '....#.....#....', '.....#####.....'],
      piscando: ['...............', '..#.......###..', '.#.#...........', '...............', '...............', '....#.....#....', '.....#####.....'],
      sorriso: ['...............', '.##.......##...', '.##.......##...', '...............', '...#.......#...', '....#######....', '.....#####.....'],
      coracao: ['.##.##...##.##.', '#######.#######', '.#####...#####.', '..###.....###..', '...#.......#...', '.....#####.....', '...............'],
      estrela: ['..#........#...', '.###......###..', '#####....#####.', '.#.#......#.#..', '...............', '.....#####.....', '......###......'],
      surpresa: ['.###.....###...', '#...#...#...#..', '.###.....###...', '...............', '......###......', '.....#...#.....', '......###......'],
      dormindo: ['...............', '...............', '.###.....###...', '...............', '...............', '......###......', '...............'],
      girando1: ['.###.....###...', '#.#.#...#.#.#..', '.###.....###...', '...............', '...............', '.....#####.....', '...............'],
      girando2: ['.###.....###...', '#..##...#..##..', '.###.....###...', '...............', '...............', '.....#####.....', '...............'],
      fala: ['...............', '..#.......#....', '.#.#.....#.#...', '...............', '.....#####.....', '....#.....#....', '.....#####.....'],
      eq1: ['...............', '..#.......#....', '.#.#.....#.#...', '...............', '....#..#..#....', '...##.###.##...', '..###########..'],
      eq2: ['...............', '..#.......#....', '.#.#.....#.#...', '...............', '......#....#...', '..#..###..###..', '..###########..'],
      eq3: ['...............', '..#.......#....', '.#.#.....#.#...', '...............', '..#.....#......', '..##.#..##.#...', '..###########..']
    };
    return M[expr] || M.feliz;
  }
  var CORES_LED = { feliz: '#5fb8ff', piscando: '#5fb8ff', sorriso: '#6ff0c8', coracao: '#ff4f7a', estrela: '#ffd447', surpresa: '#7fe0ff', dormindo: '#9aa8ff', girando1: '#b98cff', girando2: '#b98cff', fala: '#6ff0c8', eq1: '#6ff0c8', eq2: '#ffd447', eq3: '#ff8fb3' };
  A.telaLed = function (expr, g, onda) {
    var cb = g.cab, w = cb.rx * 1.36, h = cb.ry * 0.9, x0 = cb.x - w / 2, y0 = cb.y - h / 2 + 8, m = mapaLed(expr), s = '', luz = '', passo = w / 15.5, r = passo * 0.38;
    var cc = CORES_LED[expr] || '#6ff0c8';
    for (var l = 0; l < 7; l++) for (var k = 0; k < 15; k++) {
      var on = m[l].charAt(k) === '#', cx = x0 + passo * (k + 0.75), cy = y0 + h * 0.12 + l * (h * 0.76 / 6.5);
      if (on) { luz += circ(cx, cy, r * 1.9, { fill: cc, opacity: 0.28 }); s += circ(cx, cy, r, { fill: cc, 'class': 'led on', style: onda === false ? null : 'animation-delay:' + n((k * 0.6 + l) * 0.03) + 's' }); }
      else s += circ(cx, cy, r * 0.8, { fill: '#2a3346', opacity: 0.6 });
    }
    return gr(luz, { 'class': 'led-luz' }) + s;
  };
  function cabecaRobo(c, a, g, T, capuzAtras) {
    var cb = g.cab, s = '';
    s += capuzAtras || '';
    // anteninha
    s += lin(cb.x, cb.y - cb.ry + 6, cb.x + 6, cb.y - cb.ry - 30, { stroke: '#9aa6b8', 'stroke-width': 5, 'stroke-linecap': 'round' }) + circ(cb.x + 6, cb.y - cb.ry - 34, 10, { fill: '#ff8fb3', stroke: '#d0507a', 'stroke-width': 2, 'class': 'ma-antena' }) + circ(cb.x + 3, cb.y - cb.ry - 37, 3, { fill: '#ffffff', opacity: 0.8 });
    // "orelhas": discos prateados dos lados
    s += gr([-1, 1].map(function (k) { var x = cb.x + k * (cb.rx + 2); return elip(x, cb.y + 2, 14, 24, { fill: '#c9d0dc', stroke: '#7a8494', 'stroke-width': 2 }) + elip(x, cb.y + 2, 6, 12, { fill: '#e8ecf2' }); }).join(''), { 'class': 'ma-orelhas', 'data-px': n(cb.x), 'data-py': n(cb.y) });
    var d = 'M' + n(cb.x - cb.rx) + ',' + n(cb.y - cb.ry + 34) + ' Q' + n(cb.x - cb.rx) + ',' + n(cb.y - cb.ry) + ' ' + n(cb.x - cb.rx + 34) + ',' + n(cb.y - cb.ry) + ' L' + n(cb.x + cb.rx - 34) + ',' + n(cb.y - cb.ry) + ' Q' + n(cb.x + cb.rx) + ',' + n(cb.y - cb.ry) + ' ' + n(cb.x + cb.rx) + ',' + n(cb.y - cb.ry + 34) + ' L' + n(cb.x + cb.rx) + ',' + n(cb.y + cb.ry - 30) + ' Q' + n(cb.x + cb.rx) + ',' + n(cb.y + cb.ry) + ' ' + n(cb.x + cb.rx - 34) + ',' + n(cb.y + cb.ry) + ' L' + n(cb.x - cb.rx + 34) + ',' + n(cb.y + cb.ry) + ' Q' + n(cb.x - cb.rx) + ',' + n(cb.y + cb.ry) + ' ' + n(cb.x - cb.rx) + ',' + n(cb.y + cb.ry - 30) + 'Z';
    s += p(d, { fill: T.f, stroke: T.s, 'stroke-width': 2.5 }) + p(d, { fill: T.tex }) + p(d, { fill: T.vol });
    var w = cb.rx * 1.5, h = cb.ry * 1.06;
    s += ret(cb.x - w / 2, cb.y - h / 2 + 8, w, h, { rx: 26, fill: '#1c2232', stroke: '#c9d0dc', 'stroke-width': 4 }) + ret(cb.x - w / 2 + 6, cb.y - h / 2 + 14, w * 0.4, 8, { rx: 4, fill: '#ffffff', opacity: 0.12 });
    s += gr(A.telaLed(a.expressao || 'feliz', g, false), { 'class': 'ma-tela' });
    for (var sl = 0; sl < 9; sl++) s += lin(cb.x - w / 2 + 8, cb.y - h / 2 + 14 + sl * (h / 9), cb.x + w / 2 - 8, cb.y - h / 2 + 14 + sl * (h / 9), { stroke: '#ffffff', 'stroke-width': 0.8, opacity: 0.06 });
    s += p('M' + n(cb.x + w / 2 - 30) + ',' + n(cb.y - h / 2 + 12) + ' L' + n(cb.x + w / 2 - 12) + ',' + n(cb.y - h / 2 + 12) + ' L' + n(cb.x + w / 2 - 40) + ',' + n(cb.y + h / 2) + ' L' + n(cb.x + w / 2 - 58) + ',' + n(cb.y + h / 2) + 'Z', { fill: '#ffffff', opacity: 0.06 });
    return s;
  }
  function brilhos(x, y, rx, ry, k) {
    var r = sorteio(k + 3), s = '';
    for (var i = 0; i < k; i++) { var an = r() * 6.28, d = Math.sqrt(r()) * 0.85; s += p(brilhoD(x + Math.cos(an) * rx * d, y + Math.sin(an) * ry * d, 2.5 + r() * 2.5), { fill: '#ffffff', opacity: 0.85, 'class': 'ma-brilha' }); }
    return s;
  }

  /* ---------- roupas: cada uma é feita de peças (blusa, parte de baixo, jardineira, jaqueta, capuz…) ---------- */
  var JEANS = '#5b7fb8', JEANS_CL = '#8fb0dc';
  function especRoupa(a) {
    var id = a.roupa || 'nenhuma', cor = D.CORES[a.corRoupa] ? D.CORES[a.corRoupa].hex : null, est = a.estampa;
    var R = D.roupa[id] || D.ROUPAS[0], pad = R.padrao || {};
    if (!cor || !R.cores) cor = corHex(pad.cor, '#f59ac0');
    if (!R.estampa) est = pad.estampa || 'lisa';
    var S = {
      pijama: { top: { cor: cor, est: est, mangas: 'longa', gola: 'pijama', botoes: 1 }, baixo: { tipo: 'calca', cor: cor, est: est } },
      macacao: { top: { cor: cor, est: est, mangas: 'longa', gola: 'redonda', ziper: 1, comp: 1 }, baixo: { tipo: 'calca', cor: cor, est: est, pezinho: 1 }, capuz: { tipo: 'touca', cor: cor, est: est } },
      vestido: { top: { cor: cor, est: est, mangas: 'bufante', gola: 'boneca' }, baixo: { tipo: 'saia', cor: cor, est: est } },
      'vestido-unicornio': { top: { cor: '#c7a8ee', mangas: 'alcinha', gola: 'reta', lacinhos: 1, emblema: 'unicornio' }, baixo: { tipo: 'tutu', cor: '#f7a8cc', glitter: ['#6fa8f0', '#f06aa8'] } },
      'vestido-nuvens': { top: { cor: '#d9c8f5', est: 'estrelas', mangas: 'curta', gola: 'redonda' }, baixo: { tipo: 'nuvens' } },
      tule: { top: { cor: '#fde3ef', mangas: 'alcinha', gola: 'reta', glitter: 1 }, baixo: { tipo: 'arco' } },
      'jardineira-saia': { top: { cor: cor, mangas: 'bufante', gola: 'redonda', tule: 1 }, bib: { cor: JEANS }, baixo: { tipo: 'babado', cor: JEANS } },
      jardineira: { top: { cor: cor, mangas: 'curta', gola: 'redonda' }, bib: { cor: JEANS }, baixo: { tipo: 'calca', cor: JEANS, costura: 1 } },
      'jardineira-curta': { top: { cor: cor, mangas: 'curta', gola: 'redonda' }, bib: { cor: JEANS }, baixo: { tipo: 'bermuda', cor: JEANS, costura: 1 } },
      camiseta: { top: { cor: cor, mangas: 'curta', gola: 'redonda', texto: 'amigos' }, baixo: { tipo: 'bermuda', cor: '#3c5c94' } },
      'camiseta-lisa': { top: { cor: cor, mangas: 'curta', gola: 'redonda' }, baixo: { tipo: 'bermuda', cor: JEANS, desfiado: 1, costura: 1 } },
      play: { top: { cor: cor, mangas: 'curta', gola: 'redonda', texto: 'PLAY' }, baixo: { tipo: 'bermuda', cor: '#3a3944' } },
      moletom: { top: { cor: cor, est: est === 'controle' ? 'lisa' : est, mangas: 'longa', gola: 'capuz', bolso: 1, cordao: 1, controle: est === 'controle' }, baixo: { tipo: 'bermuda', cor: '#2e2a33' } },
      'corta-vento': { top: { cor: cor, mangas: 'longa', gola: 'alta', ziper: 1, faixa: '#ffffff' }, baixo: { tipo: 'calca', cor: '#2f3f6e' } },
      'jaqueta-prata': { top: { cor: '#f4f1ec', mangas: 'curta', gola: 'redonda' }, jaqueta: { cor: '#cfd5e0', metal: 1 }, baixo: { tipo: 'calca', cor: '#3a3f52' } },
      'jaqueta-couro': { top: { cor: '#ece6de', mangas: 'curta', gola: 'redonda' }, jaqueta: { cor: '#2b272f', couro: 1 }, baixo: { tipo: 'calca', cor: JEANS, costura: 1 } },
      social: { top: { cor: '#a9cdf0', mangas: 'longa', gola: 'social', botoes: 1, gravata: '#d8434f' }, baixo: { tipo: 'calca', cor: '#2f3f6e' } },
      polo: { top: { cor: cor, mangas: 'curta', gola: 'polo' }, baixo: { tipo: 'bermuda', cor: '#c8b48a' } },
      futebol: { top: { cor: cor, mangas: 'curta', gola: 'v', numero: '10' }, baixo: { tipo: 'calcao', cor: '#fbfaf7' }, meias: { cor: cor } },
      tutu: { top: { cor: cor, mangas: 'nenhuma', gola: 'redonda' }, baixo: { tipo: 'tutu', cor: claro(cor, 0.25) } },
      skatista: { top: { cor: cor, mangas: 'curta', gola: 'redonda', texto: 'UAU', controle: 1 }, colete: { cor: JEANS_CL }, baixo: { tipo: 'bermuda', cor: JEANS_CL, desfiado: 1, costura: 1 } },
      'vestido-doces': { top: { cor: cor, est: 'doces', mangas: 'bufante', gola: 'boneca' }, baixo: { tipo: 'tule', cor: claro(cor, 0.2), est: 'doces' } },
      neve: { top: { cor: cor, mangas: 'longa', gola: 'alta', ziper: 1, comp: 1, gomos: 1 }, baixo: { tipo: 'calca', cor: cor, gomos: 1 }, capuz: { tipo: 'capuz', cor: cor, pelucia: '#f6f1ea' } },
      dino: { top: { cor: cor, mangas: 'longa', gola: 'redonda', comp: 1, barriga: 1 }, baixo: { tipo: 'calca', cor: cor }, capuz: { tipo: 'dino', cor: cor } },
      noel: { top: { cor: '#d92f3a', mangas: 'longa', gola: 'redonda', barra: '#fbf8f2', cinto: '#2a2228', ziper: 1 }, capuz: { tipo: 'capuz', cor: '#d92f3a', pelucia: '#fbf8f2' } },
      abobora: { abobora: 1, capuz: { tipo: 'abobora' } },
      pinguim: { capa: { cor: '#2b2a36', forro: '#fbfaf7' }, capuz: { tipo: 'pinguim' } },
      'heroi-raio': heroi('#2ec4b6', '#ffd447', 'raio'), 'heroi-estrela': heroi('#8a5cd6', '#ffd447', 'estrela'), 'heroi-coracao': heroi('#ff7a59', '#ffffff', 'coracao'),
      'heroi-gota': heroi('#4fb3f0', '#e8f7ff', 'gota'), 'heroi-folha': heroi('#5fbf5a', '#fff09a', 'folha'), 'heroi-lua': heroi('#3a3f7a', '#f2e6ff', 'lua'),
      duende: { top: { cor: '#2fa37a', mangas: 'longa', gola: 'redonda', barra: '#f4e6c8', cinto: '#5a3418', bolinhas: 1 }, baixo: { tipo: 'calca', cor: '#d8435f' }, capuz: { tipo: 'gorro-duende', cor: '#2fa37a' }, sapatoPonta: '#d8435f' },
      'boneco-neve': { capa: { cor: '#f7f7fa', forro: '#dfe6f2', botoes: 1 }, capuz: { tipo: 'neve' }, cachecol: '#d8434f' }
    }[id];
    return S || null;
  }
  // heróis e heroínas deste jogo: macacão, capa, máscara de olhos, símbolo no peito, luvas e botas (cores e símbolos próprios)
  function heroi(cor, cor2, simbolo) {
    return { top: { cor: cor, mangas: 'longa', gola: 'redonda', comp: 1, simbolo: simbolo, cor2: cor2 }, baixo: { tipo: 'calca', cor: cor }, capa: null, heroi: { cor: cor, cor2: cor2, simbolo: simbolo, capa: escuro(cor2 === '#ffffff' ? '#ffd447' : cor2, 0.05) } };
  }
  function simboloD(tipo, x, y, r, cor) {
    if (tipo === 'raio') return p('M' + n(x + r * 0.2) + ',' + n(y - r) + ' L' + n(x - r * 0.55) + ',' + n(y + r * 0.1) + ' L' + n(x - r * 0.02) + ',' + n(y + r * 0.1) + ' L' + n(x - r * 0.3) + ',' + n(y + r) + ' L' + n(x + r * 0.6) + ',' + n(y - r * 0.2) + ' L' + n(x + r * 0.05) + ',' + n(y - r * 0.2) + 'Z', { fill: cor, stroke: escuro(cor, 0.4), 'stroke-width': 1.2, 'stroke-linejoin': 'round' });
    if (tipo === 'estrela') return p(estrelaD(x, y + 1, r, r * 0.45), { fill: cor, stroke: escuro(cor, 0.4), 'stroke-width': 1.2, 'stroke-linejoin': 'round' });
    if (tipo === 'coracao') return p(coracaoD(x, y, r * 0.8), { fill: cor, stroke: escuro(cor, 0.3), 'stroke-width': 1.2 });
    if (tipo === 'gota') return p('M' + x + ',' + n(y - r) + ' Q' + n(x + r * 0.9) + ',' + n(y + r * 0.1) + ' ' + n(x + r * 0.6) + ',' + n(y + r * 0.6) + ' A' + n(r * 0.66) + ',' + n(r * 0.66) + ' 0 0 1 ' + n(x - r * 0.6) + ',' + n(y + r * 0.6) + ' Q' + n(x - r * 0.9) + ',' + n(y + r * 0.1) + ' ' + x + ',' + n(y - r) + 'Z', { fill: cor, stroke: escuro(cor, 0.4), 'stroke-width': 1.2 });
    if (tipo === 'folha') return p('M' + n(x - r * 0.8) + ',' + n(y + r * 0.8) + ' Q' + n(x - r) + ',' + n(y - r) + ' ' + n(x + r * 0.9) + ',' + n(y - r * 0.9) + ' Q' + n(x + r) + ',' + n(y + r * 0.9) + ' ' + n(x - r * 0.8) + ',' + n(y + r * 0.8) + 'Z M' + n(x - r * 0.8) + ',' + n(y + r * 0.8) + ' L' + n(x + r * 0.5) + ',' + n(y - r * 0.5), { fill: cor, stroke: escuro(cor, 0.45), 'stroke-width': 1.4 });
    if (tipo === 'lua') return p('M' + n(x + r * 0.3) + ',' + n(y - r) + ' A' + r + ',' + r + ' 0 1 0 ' + n(x + r * 0.3) + ',' + n(y + r) + ' A' + n(r * 0.75) + ',' + n(r * 0.75) + ' 0 1 1 ' + n(x + r * 0.3) + ',' + n(y - r) + 'Z', { fill: cor, stroke: escuro(cor, 0.4), 'stroke-width': 1.2 }) + p(estrelaD(x + r * 0.6, y - r * 0.2, r * 0.3, r * 0.13), { fill: cor });
    return '';
  }
  function emblemaHeroi(H, x, y, r) {
    return p('M' + n(x - r) + ',' + n(y - r * 0.8) + ' Q' + x + ',' + n(y - r * 1.2) + ' ' + n(x + r) + ',' + n(y - r * 0.8) + ' Q' + n(x + r) + ',' + n(y + r * 0.5) + ' ' + x + ',' + n(y + r * 1.1) + ' Q' + n(x - r) + ',' + n(y + r * 0.5) + ' ' + n(x - r) + ',' + n(y - r * 0.8) + 'Z', { fill: H.cor2, stroke: escuro(H.cor, 0.35), 'stroke-width': 2 }) + simboloD(H.simbolo, x, y, r * 0.62, H.cor === '#3a3f7a' ? '#ffd447' : H.cor);
  }
  function capaHeroi(g, H) {
    if (g.corpo === 'q') { var b = g.b; return p('M' + n(b.x - b.rx + 30) + ',' + n(b.y - b.ry + 4) + ' Q' + n(b.x + 40) + ',' + n(b.y - b.ry - 20) + ' ' + n(b.x + b.rx + 26) + ',' + n(b.y - b.ry + 30) + ' Q' + n(b.x + b.rx + 34) + ',' + n(b.y + 10) + ' ' + n(b.x + b.rx + 18) + ',' + n(b.y + 30) + ' Q' + n(b.x + 10) + ',' + n(b.y - 6) + ' ' + n(b.x - b.rx + 30) + ',' + n(b.y - b.ry + 4) + 'Z', { fill: H.capa, stroke: escuro(H.capa, 0.35), 'stroke-width': 2 }); }
    var t = g.t;
    return p('M' + n(150 - t.wt - 6) + ',' + n(t.y0 + 2) + ' Q' + n(150 - t.wb - 34) + ',' + n(t.y1 - 10) + ' ' + n(150 - t.wb - 40) + ',' + n(t.y1 + 34) + ' Q150,' + n(t.y1 + 20) + ' ' + n(150 + t.wb + 40) + ',' + n(t.y1 + 34) + ' Q' + n(150 + t.wb + 34) + ',' + n(t.y1 - 10) + ' ' + n(150 + t.wt + 6) + ',' + n(t.y0 + 2) + 'Z', { fill: H.capa, stroke: escuro(H.capa, 0.35), 'stroke-width': 2 });
  }
  function mascara(g, H) {
    var y = g.olhoY + 1, dx = g.olhoDx, x = g.cab.x, r = g.olhoR + 9;
    var d = 'M' + n(x - dx - r - 6) + ',' + n(y - 4) + ' Q' + n(x - dx) + ',' + n(y - r - 6) + ' ' + x + ',' + n(y - 8) + ' Q' + n(x + dx) + ',' + n(y - r - 6) + ' ' + n(x + dx + r + 6) + ',' + n(y - 4) + ' Q' + n(x + dx + r) + ',' + n(y + r) + ' ' + n(x + dx) + ',' + n(y + r - 2) + ' Q' + n(x + 8) + ',' + n(y + r - 4) + ' ' + x + ',' + n(y + 4) + ' Q' + n(x - 8) + ',' + n(y + r - 4) + ' ' + n(x - dx) + ',' + n(y + r - 2) + ' Q' + n(x - dx - r) + ',' + n(y + r) + ' ' + n(x - dx - r - 6) + ',' + n(y - 4) + 'Z';
    var furos = ' M' + n(x - dx - r + 7) + ',' + y + ' a' + n(r - 7) + ',' + n(r - 6) + ' 0 1 0 ' + n((r - 7) * 2) + ',0 a' + n(r - 7) + ',' + n(r - 6) + ' 0 1 0 ' + n(-(r - 7) * 2) + ',0z M' + n(x + dx - r + 7) + ',' + y + ' a' + n(r - 7) + ',' + n(r - 6) + ' 0 1 0 ' + n((r - 7) * 2) + ',0 a' + n(r - 7) + ',' + n(r - 6) + ' 0 1 0 ' + n(-(r - 7) * 2) + ',0z';
    return p(d + furos, { fill: H.cor, 'fill-rule': 'evenodd', stroke: escuro(H.cor, 0.4), 'stroke-width': 2 });
  }
  A.especRoupa = especRoupa;
  function tecido(c, d, cor, est, extra) {   // um pedaço de pano: cor + estampa + sombra suave + contorno
    var s = p(d, Object.assign({ fill: cor, stroke: escuro(cor, 0.35), 'stroke-width': 2, 'stroke-linejoin': 'round' }, extra || {}));
    var e = c.estampa(est, cor); if (e) s += p(d, { fill: e, 'clip-path': extra && extra['clip-path'] });
    s += p(d, { fill: c.volume(), opacity: 0.55, 'clip-path': extra && extra['clip-path'] });
    return s;
  }
  function mangaPe(c, g, k, M, comp) {   // manga sobre o braço k: comp = fração do braço
    var o = g.omb[k], m = g.mao[k], x2 = o[0] + (m[0] - o[0]) * comp, y2 = o[1] + (m[1] - o[1]) * comp;
    var r = g.rb + 3.5, s = capsula(o[0], o[1], x2, y2, r, M.cor, escuro(M.cor, 0.35));
    var e = c.estampa(M.est, M.cor); if (e) s += lin(o[0], o[1], x2, y2, { stroke: e, 'stroke-width': r * 2, 'stroke-linecap': 'round' });
    // punho
    var dx = (m[0] - o[0]), dy = (m[1] - o[1]), L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L;
    if (M.barra) s += lin(x2 - uy * r, y2 + ux * r, x2 + uy * r, y2 - ux * r, { stroke: M.barra, 'stroke-width': 9, 'stroke-linecap': 'round' });
    else if (comp > 0.6) s += lin(x2 - uy * (r - 1), y2 + ux * (r - 1), x2 + uy * (r - 1), y2 - ux * (r - 1), { stroke: escuro(M.cor, 0.18), 'stroke-width': 4, 'stroke-linecap': 'round' });
    return s;
  }
  function roupaPeCorpo(c, a, g, S) {
    var s = '', t = g.t, x = 150, top = S.top, cintura = t.y1 - 30;
    if (S.capa) {   // capa: cai por trás e abre na frente (desenhada aqui na frente: as abas)
      s += p('M' + n(x - t.wt - 6) + ',' + n(t.y0 + 2) + ' Q' + n(x - t.wb - 26) + ',' + n(t.y1 - 20) + ' ' + n(x - t.wb - 18) + ',' + n(t.y1 + 18) + ' L' + n(x - t.wb + 8) + ',' + n(t.y1 + 14) + ' Q' + n(x - t.wb + 2) + ',' + n(t.y0 + 60) + ' ' + n(x - 20) + ',' + n(t.y0 + 4) + 'Z', { fill: S.capa.cor, stroke: escuro(S.capa.cor, 0.3), 'stroke-width': 2 });
      s += p('M' + n(x + t.wt + 6) + ',' + n(t.y0 + 2) + ' Q' + n(x + t.wb + 26) + ',' + n(t.y1 - 20) + ' ' + n(x + t.wb + 18) + ',' + n(t.y1 + 18) + ' L' + n(x + t.wb - 8) + ',' + n(t.y1 + 14) + ' Q' + n(x + t.wb - 2) + ',' + n(t.y0 + 60) + ' ' + n(x + 20) + ',' + n(t.y0 + 4) + 'Z', { fill: S.capa.cor, stroke: escuro(S.capa.cor, 0.3), 'stroke-width': 2 });
      if (S.capa.botoes) for (var bi = 0; bi < 3; bi++) s += circ(x, t.y0 + 40 + bi * 22, 4.5, { fill: '#2e2a33' });
      if (S.cachecol) s += cachecol(g, S.cachecol);
      return s;
    }
    if (S.abobora) {
      var ab = 'M' + n(x - t.wb - 18) + ',' + n(t.y0 + 60) + ' C' + n(x - t.wb - 24) + ',' + n(t.y0 + 4) + ' ' + n(x + t.wb + 24) + ',' + n(t.y0 + 4) + ' ' + n(x + t.wb + 18) + ',' + n(t.y0 + 60) + ' C' + n(x + t.wb + 22) + ',' + n(t.y1 + 20) + ' ' + n(x - t.wb - 22) + ',' + n(t.y1 + 20) + ' ' + n(x - t.wb - 18) + ',' + n(t.y0 + 60) + 'Z';
      s += p(ab, { fill: '#f7922e', stroke: '#c0601a', 'stroke-width': 2.4 }) + p(ab, { fill: c.volume(), opacity: 0.7 });
      [-34, -12, 12, 34].forEach(function (dx) { s += p('M' + n(x + dx * 0.7) + ',' + n(t.y0 + 20) + ' Q' + n(x + dx * 1.35) + ',' + n(t.y0 + 66) + ' ' + n(x + dx * 0.7) + ',' + n(t.y1 + 10), { stroke: '#d0701f', 'stroke-width': 2, fill: 'none', opacity: 0.8 }); });
      s += p('M' + n(x - 30) + ',' + n(t.y0 + 4) + ' q10,12 30,6 q20,6 30,-6 q-8,16 -30,16 q-22,0 -30,-16z', { fill: '#5fae4a', stroke: '#3c7a2e', 'stroke-width': 1.6 });
      return s;
    }
    // parte de baixo (calça, bermuda, saias)
    var B = S.baixo;
    if (B) {
      var cinto = troncoD(g, 3.5), corteB = c.faixa(cintura, 420);
      if (B.tipo === 'calca' || B.tipo === 'bermuda' || B.tipo === 'calcao') {
        var compP = B.tipo === 'calca' ? 1 : B.tipo === 'bermuda' ? 0.5 : 0.36;
        for (var k = 0; k < 2; k++) {
          var q = g.qua[k], pe = g.pe[k], x2 = q[0] + (pe[0] - q[0]) * compP, y2 = q[1] + (pe[1] - 8 - q[1]) * compP;
          if (B.pezinho) { x2 = pe[0]; y2 = pe[1] - 6; }
          s += capsula(q[0], q[1] - 4, x2, y2, g.rp + 4, B.cor, escuro(B.cor, 0.35));
          var e = c.estampa(B.est, B.cor); if (e) s += lin(q[0], q[1] - 4, x2, y2, { stroke: e, 'stroke-width': (g.rp + 4) * 2, 'stroke-linecap': 'round' });
          if (B.pezinho) s += pePelucia(pe[0], pe[1], g, B.cor, { s: escuro(B.cor, 0.35), cl: claro(B.cor, 0.4) }, g.sentado, claro(B.cor, 0.5));
          else if (B.desfiado) for (var f = -3; f <= 3; f++) s += lin(x2 + f * 5, y2 + g.rp - 2, x2 + f * 5 + 1, y2 + g.rp + 4, { stroke: '#e8eef8', 'stroke-width': 1.4, 'stroke-linecap': 'round' });
          else s += lin(x2 - g.rp - 2, y2 + 3, x2 + g.rp + 2, y2 + 3, { stroke: escuro(B.cor, 0.2), 'stroke-width': 3 });
          if (S.heroi) s += p('M' + n(pe[0] - g.peRx - 3) + ',' + n(pe[1] + 6) + ' L' + n(pe[0] - g.rp - 3) + ',' + n(pe[1] - 30) + ' L' + n(pe[0] + g.rp + 3) + ',' + n(pe[1] - 30) + ' L' + n(pe[0] + g.peRx + 3) + ',' + n(pe[1] + 6) + ' Q' + pe[0] + ',' + n(pe[1] + 22) + ' ' + n(pe[0] - g.peRx - 3) + ',' + n(pe[1] + 6) + 'Z', { fill: S.heroi.cor2, stroke: escuro(S.heroi.cor2, 0.35), 'stroke-width': 1.8 });
          if (B.gomos) s += lin(q[0], q[1] + 14, x2, y2 - 6, { stroke: escuro(B.cor, 0.2), 'stroke-width': 1.4, 'stroke-dasharray': '1 8' });
        }
        s += tecido(c, cinto, B.cor, B.est, { 'clip-path': corteB });
        if (B.costura) s += p('M' + n(x) + ',' + n(cintura + 4) + ' L' + x + ',' + n(t.y1 + 6), { stroke: '#f2c14e', 'stroke-width': 1.3, 'stroke-dasharray': '3 2', fill: 'none' });
      }
      if (S.sapatoPonta) for (var sk = 0; sk < 2; sk++) { var pp = g.pe[sk], kk = sk ? 1 : -1; s += p('M' + n(pp[0] - g.peRx) + ',' + n(pp[1] + 8) + ' Q' + n(pp[0] - g.peRx) + ',' + n(pp[1] - 14) + ' ' + pp[0] + ',' + n(pp[1] - 14) + ' Q' + n(pp[0] + kk * 30) + ',' + n(pp[1] - 12) + ' ' + n(pp[0] + kk * 36) + ',' + n(pp[1] - 22) + ' Q' + n(pp[0] + kk * 34) + ',' + n(pp[1] + 8) + ' ' + n(pp[0] + g.peRx * kk) + ',' + n(pp[1] + 8) + 'Z', { fill: S.sapatoPonta, stroke: escuro(S.sapatoPonta, 0.35), 'stroke-width': 1.8 }) + circ(pp[0] + kk * 36, pp[1] - 24, 4.5, { fill: '#f2c14e', stroke: '#a8801e', 'stroke-width': 1 }); }
      if (S.meias) for (var mk = 0; mk < 2; mk++) { var pe2 = g.pe[mk]; s += capsula(pe2[0], pe2[1] - 30, pe2[0], pe2[1] - 8, g.rp + 2, S.meias.cor, escuro(S.meias.cor, 0.35)) + lin(pe2[0] - g.rp, pe2[1] - 26, pe2[0] + g.rp, pe2[1] - 26, { stroke: '#ffffff', 'stroke-width': 3 }); }
    }
    // blusa
    if (top) {
      var hem = S.bib || B && B.tipo !== 'calca' && B.tipo !== 'bermuda' && B.tipo !== 'calcao' ? cintura + 4 : (top.comp ? t.y1 + 20 : t.y1 - 12);
      var corpoT = troncoD(g, 3), corteT;
      if (top.mangas === 'alcinha' || top.mangas === 'nenhuma' && top.gola === 'reta') corteT = c.faixa(t.y0 + 26, hem);
      else corteT = c.faixa(0, hem);
      s += tecido(c, corpoT, top.cor, top.est, { 'clip-path': corteT });
      if (top.comp && B && B.tipo === 'calca') s += tecido(c, troncoD(g, 3.5), top.cor, top.est, { 'clip-path': c.faixa(cintura, 420) });
      if (top.glitter) s += p(corpoT, { fill: c.estampa('glitter', top.cor), 'clip-path': corteT });
      // barra
      if (top.barra) s += lin(x - t.wb - 6, hem - 2, x + t.wb + 6, hem - 2, { stroke: top.barra, 'stroke-width': 12, 'stroke-linecap': 'round', 'clip-path': c.corte(troncoD(g, 6)) }) + lin(x, t.y0 + 4, x, hem - 4, { stroke: top.barra, 'stroke-width': 10 });
      else if (!S.bib && !(B && (B.tipo === 'saia' || B.tipo === 'tutu' || B.tipo === 'tule' || B.tipo === 'babado' || B.tipo === 'nuvens' || B.tipo === 'arco'))) s += lin(x - t.wb - 2, hem - 2, x + t.wb + 2, hem - 2, { stroke: escuro(top.cor, 0.2), 'stroke-width': 3, 'clip-path': c.corte(troncoD(g, 3)) });
      if (top.cinto) s += ret(x - t.wb - 6, cintura - 10, (t.wb + 6) * 2, 14, { fill: top.cinto, 'clip-path': c.corte(troncoD(g, 4)) }) + ret(x - 10, cintura - 13, 20, 20, { rx: 3, fill: 'none', stroke: '#f2c14e', 'stroke-width': 3.2 });
      if (top.alcinha) {}
      s += gola(c, g, top);
      if (top.ziper && !top.barra) s += lin(x, t.y0 + 4, x, hem - 2, { stroke: escuro(top.cor, 0.4), 'stroke-width': 2.4 }) + ret(x - 3, t.y0 + 14, 6, 10, { rx: 2, fill: '#d8dbe2', stroke: '#8a909c' });
      if (top.ziper && top.barra) s += ret(x - 3, t.y0 + 14, 6, 10, { rx: 2, fill: '#d8dbe2', stroke: '#8a909c' });
      if (top.botoes) for (var b2 = 0; b2 < 3; b2++) s += circ(x + (top.gola === 'pijama' ? 0 : 0), t.y0 + 30 + b2 * 22, 3.2, { fill: '#ffffff', stroke: escuro(top.cor, 0.4), 'stroke-width': 1 });
      if (top.faixa) s += lin(x - t.wt - 10, t.y0 + 46, x + t.wt + 10, t.y0 + 46, { stroke: top.faixa, 'stroke-width': 6, 'clip-path': c.corte(troncoD(g, 3)) });
      if (top.gomos) for (var gy = t.y0 + 40; gy < hem; gy += 26) s += p('M' + n(x - t.wb) + ',' + n(gy) + ' Q' + x + ',' + n(gy + 6) + ' ' + n(x + t.wb) + ',' + n(gy), { stroke: escuro(top.cor, 0.22), 'stroke-width': 1.6, fill: 'none', 'clip-path': c.corte(troncoD(g, 3)) });
      if (top.bolso) s += p('M' + n(x - 30) + ',' + n(t.y1 - 46) + ' L' + n(x + 30) + ',' + n(t.y1 - 46) + ' L' + n(x + 40) + ',' + n(t.y1 - 18) + ' L' + n(x - 40) + ',' + n(t.y1 - 18) + 'Z', { fill: escuro(top.cor, 0.06), stroke: escuro(top.cor, 0.3), 'stroke-width': 1.6 });
      if (top.cordao) s += p('M' + n(x - 8) + ',' + n(t.y0 + 10) + ' l-2,26 M' + n(x + 8) + ',' + n(t.y0 + 10) + ' l2,26', { stroke: '#ffffff', 'stroke-width': 2.4, 'stroke-linecap': 'round' }) + circ(x - 10, t.y0 + 37, 2.6, { fill: '#ffffff' }) + circ(x + 10, t.y0 + 37, 2.6, { fill: '#ffffff' });
      if (top.texto) s += textoRoupa(g, top, a);
      if (top.numero) s += txt(x + 22, t.y0 + 60, top.numero, { 'font-family': 'Fredoka, Arial Rounded MT Bold, sans-serif', 'font-weight': 700, 'font-size': 24, fill: luz(top.cor) > 0.6 ? '#2f3f6e' : '#ffffff', 'text-anchor': 'middle' });
      if (top.controle) s += controle(x + (top.texto ? 0 : -18), t.y0 + (top.texto ? 66 : 44), top.texto ? 0.7 : 1);
      if (top.barriga) s += elip(x, t.y0 + 64, t.wb * 0.6, 40, { fill: claro(top.cor, 0.55), 'clip-path': corteT }) + [0, 1, 2].map(function (i) { return lin(x - 22, t.y0 + 44 + i * 18, x + 22, t.y0 + 44 + i * 18, { stroke: escuro(top.cor, 0.2), 'stroke-width': 1.4 }); }).join('');
      if (top.emblema === 'unicornio') s += emblemaUnicornio(c, x, t.y0 + 46);
      if (S.heroi) s += lin(x - t.wb - 4, cintura - 2, x + t.wb + 4, cintura - 2, { stroke: S.heroi.cor2, 'stroke-width': 8, 'clip-path': c.corte(troncoD(g, 4)) }) + emblemaHeroi(S.heroi, x, t.y0 + 46, 22);
      if (top.lacinhos) [-1, 1].forEach(function (k) { s += lacoD(x + k * (t.wt - 4), t.y0 + 26, '#c7a8ee', 0.42); });
    }
    if (B && (B.tipo === 'saia' || B.tipo === 'babado' || B.tipo === 'tutu' || B.tipo === 'tule' || B.tipo === 'nuvens' || B.tipo === 'arco')) s += saia(c, g, B, cintura);
    if (S.bib) s += jardineira(c, g, S, cintura);
    if (S.jaqueta) s += jaqueta(c, g, S.jaqueta);
    if (S.colete) s += colete(c, g, S.colete);
    if (top && top.gravata) s += lacoD(x, t.y0 + 10, top.gravata, 0.5);
    if (S.cachecol) s += cachecol(g, S.cachecol);
    if (a.patch && a.patch !== 'nenhum' && !S.capa && !S.abobora) s += patch(c, a.patch, S.bib ? x : x - 22, S.bib ? cintura - 34 : t.y0 + 46, 13);
    return s;
  }
  function textoRoupa(g, top, a) {
    var x = 150, y = g.t.y0 + 46, cor = luz(top.cor) > 0.6 ? '#2f3f6e' : '#ffffff', L = a && a.lang ? a.lang : 'pt';
    if (top.texto === 'amigos') {
      var palavra = { pt: 'AMIGOS', en: 'BUDDIES', es: 'AMIGOS' }[L] || 'AMIGOS';
      return p(coracaoD(x, y - 6, 9), { fill: '#f06292' }) + txt(x, y + 18, palavra, { 'font-family': 'Fredoka, Arial Rounded MT Bold, sans-serif', 'font-weight': 700, 'font-size': 12, fill: cor, 'text-anchor': 'middle', 'letter-spacing': 0.5 });
    }
    var cores = ['#e5404f', '#ff9a4d', '#3aa35a', '#4f8fe0', '#8a5cd6'], s = '';
    top.texto.split('').forEach(function (l, i, arr) { s += txt(x - (arr.length - 1) * 8 + i * 16, y + (top.controle ? 0 : 6), l, { 'font-family': 'Fredoka, Arial Rounded MT Bold, sans-serif', 'font-weight': 700, 'font-size': 19, fill: cores[i % cores.length], 'text-anchor': 'middle', stroke: '#ffffff', 'stroke-width': 0.6 }); });
    return s;
  }
  function controle(x, y, e) {
    e = e || 1;
    return '<g transform="translate(' + n(x) + ' ' + n(y) + ') scale(' + e + ')">' +
      p('M-15,-6 Q-15,-10 -10,-10 H10 Q15,-10 15,-6 L18,6 Q19,11 14,11 Q11,11 9,6 H-9 Q-11,11 -14,11 Q-19,11 -18,6Z', { fill: '#2e2a33', stroke: '#ffffff', 'stroke-width': 1.4, 'stroke-dasharray': '2 1.5' }) +
      p('M-10,-3 h6 M-7,-6 v6', { stroke: '#ffffff', 'stroke-width': 2, 'stroke-linecap': 'round' }) + circ(7, -5, 1.8, { fill: '#4f8fe0' }) + circ(11, -2, 1.8, { fill: '#e5404f' }) + circ(7, 1, 1.8, { fill: '#ffd447' }) + circ(3, -2, 1.8, { fill: '#4fae6a' }) + '</g>';
  }
  function emblemaUnicornio(c, x, y) {   // coração de glitter com uma carinha de unicórnio (desenho deste jogo)
    return p(coracaoD(x, y, 20), { fill: '#f58cc0', stroke: '#e0559a', 'stroke-width': 1.4 }) + p(coracaoD(x, y, 20), { fill: c.estampa('glitter', '#f58cc0') }) +
      circ(x, y + 2, 10, { fill: '#fffafc', stroke: '#e0a8c8', 'stroke-width': 1 }) + p('M' + n(x - 2) + ',' + n(y - 7) + ' L' + x + ',' + n(y - 17) + ' L' + n(x + 2) + ',' + n(y - 7) + 'Z', { fill: '#ffd86b' }) +
      circ(x - 7, y - 6, 4, { fill: '#a8d0f8' }) + circ(x - 9, y - 1, 3.6, { fill: '#cdb0f4' }) + circ(x + 6, y - 7, 3.4, { fill: '#ffd08a' }) +
      circ(x - 3.5, y + 2, 1.6, { fill: '#2a1e28' }) + circ(x + 3.5, y + 2, 1.6, { fill: '#2a1e28' }) + elip(x - 7, y + 6, 2.4, 1.4, { fill: '#ff8fb3', opacity: 0.7 }) + elip(x + 7, y + 6, 2.4, 1.4, { fill: '#ff8fb3', opacity: 0.7 });
  }
  function gola(c, g, top) {
    var x = 150, y = g.t.y0 + 2, cor = escuro(top.cor, 0.12), s = '';
    if (top.gola === 'redonda' || top.gola === 'pijama') s = p('M' + n(x - 24) + ',' + n(y + 2) + ' Q' + x + ',' + n(y + 20) + ' ' + n(x + 24) + ',' + n(y + 2), { stroke: cor, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' });
    if (top.gola === 'pijama') s += p('M' + n(x - 24) + ',' + n(y + 2) + ' L' + n(x - 6) + ',' + n(y + 28) + ' L' + n(x - 2) + ',' + n(y + 12) + 'Z M' + n(x + 24) + ',' + n(y + 2) + ' L' + n(x + 6) + ',' + n(y + 28) + ' L' + n(x + 2) + ',' + n(y + 12) + 'Z', { fill: claro(top.cor, 0.5), stroke: cor, 'stroke-width': 1.4 });
    if (top.gola === 'boneca') s = p('M' + n(x - 26) + ',' + n(y) + ' Q' + n(x - 28) + ',' + n(y + 22) + ' ' + n(x - 2) + ',' + n(y + 16) + ' Z M' + n(x + 26) + ',' + n(y) + ' Q' + n(x + 28) + ',' + n(y + 22) + ' ' + n(x + 2) + ',' + n(y + 16) + ' Z', { fill: '#ffffff', stroke: '#e0d6de', 'stroke-width': 1.4 });
    if (top.gola === 'v') s = p('M' + n(x - 18) + ',' + n(y) + ' L' + x + ',' + n(y + 22) + ' L' + n(x + 18) + ',' + n(y), { stroke: '#ffffff', 'stroke-width': 5, fill: 'none', 'stroke-linejoin': 'round' });
    if (top.gola === 'polo') s = p('M' + n(x - 26) + ',' + n(y - 2) + ' L' + n(x - 4) + ',' + n(y + 18) + ' L' + n(x - 14) + ',' + n(y + 22) + ' Z M' + n(x + 26) + ',' + n(y - 2) + ' L' + n(x + 4) + ',' + n(y + 18) + ' L' + n(x + 14) + ',' + n(y + 22) + ' Z', { fill: top.cor, stroke: '#ffffff', 'stroke-width': 2.4 }) + lin(x, y + 14, x, y + 34, { stroke: escuro(top.cor, 0.3), 'stroke-width': 1.6 }) + circ(x, y + 22, 2, { fill: '#ffffff' }) + circ(x, y + 30, 2, { fill: '#ffffff' });
    if (top.gola === 'social') s = p('M' + n(x - 24) + ',' + n(y - 2) + ' L' + n(x - 2) + ',' + n(y + 14) + ' L' + n(x - 18) + ',' + n(y + 22) + ' Z M' + n(x + 24) + ',' + n(y - 2) + ' L' + n(x + 2) + ',' + n(y + 14) + ' L' + n(x + 18) + ',' + n(y + 22) + ' Z', { fill: claro(top.cor, 0.3), stroke: escuro(top.cor, 0.3), 'stroke-width': 1.4 }) + lin(x, y + 14, x, g.t.y1 - 10, { stroke: escuro(top.cor, 0.25), 'stroke-width': 1.4 });
    if (top.gola === 'alta') s = p('M' + n(x - 26) + ',' + n(y - 4) + ' Q' + x + ',' + n(y + 8) + ' ' + n(x + 26) + ',' + n(y - 4) + ' L' + n(x + 24) + ',' + n(y + 10) + ' Q' + x + ',' + n(y + 20) + ' ' + n(x - 24) + ',' + n(y + 10) + 'Z', { fill: escuro(top.cor, 0.08), stroke: escuro(top.cor, 0.35), 'stroke-width': 1.6 });
    if (top.gola === 'capuz') s = p('M' + n(x - 40) + ',' + n(y - 2) + ' Q' + n(x - 44) + ',' + n(y + 26) + ' ' + x + ',' + n(y + 26) + ' Q' + n(x + 44) + ',' + n(y + 26) + ' ' + n(x + 40) + ',' + n(y - 2) + ' Q' + x + ',' + n(y + 12) + ' ' + n(x - 40) + ',' + n(y - 2) + 'Z', { fill: escuro(top.cor, 0.1), stroke: escuro(top.cor, 0.35), 'stroke-width': 1.6 });
    if (top.gola === 'reta') s = lin(x - g.t.wt - 4, g.t.y0 + 26, x + g.t.wt + 4, g.t.y0 + 26, { stroke: escuro(top.cor, 0.15), 'stroke-width': 3, 'clip-path': c.corte(troncoD(g, 3)) });
    if (top.mangas === 'alcinha') [-1, 1].forEach(function (k) { s += lin(x + k * (g.t.wt - 8), g.t.y0 + 26, x + k * (g.t.wt - 2), g.t.y0 + 2, { stroke: top.cor, 'stroke-width': 4, 'stroke-linecap': 'round' }); });
    return s;
  }
  function saia(c, g, B, cintura) {
    var x = 150, t = g.t, y0 = cintura - 2, y1 = t.y1 + 30, w0 = t.wb + 2, w1 = t.wb + 26, s = '';
    if (B.tipo === 'saia' || B.tipo === 'babado') {
      var d = 'M' + n(x - w0) + ',' + n(y0) + ' L' + n(x + w0) + ',' + n(y0) + ' L' + n(x + w1) + ',' + n(y1);
      var onda = 9, k = Math.round(w1 * 2 / 18);
      for (var i = 0; i < k; i++) { var xa = x + w1 - i * (w1 * 2 / k), xb = xa - w1 * 2 / k; d += ' Q' + n((xa + xb) / 2) + ',' + n(y1 + onda) + ' ' + n(xb) + ',' + n(y1); }
      d += ' Z';
      s += tecido(c, d, B.cor, B.est);
      if (B.tipo === 'babado') {
        var d2 = 'M' + n(x - w1 + 2) + ',' + n(y1 - 4), kk = 12;
        for (var j = 0; j < kk; j++) { var xx = x - w1 + 2 + (j + 1) * ((w1 * 2 - 4) / kk); d2 += ' Q' + n(xx - (w1 * 2 - 4) / kk / 2) + ',' + n(y1 + 18) + ' ' + n(xx) + ',' + n(y1 - 4); }
        d2 += ' L' + n(x + w1 - 2) + ',' + n(y1 - 10) + ' L' + n(x - w1 + 2) + ',' + n(y1 - 10) + 'Z';
        s += p(d2, { fill: '#2b3a5c', stroke: '#1d2740', 'stroke-width': 1.6 });
      }
      return s;
    }
    if (B.tipo === 'tutu' || B.tipo === 'tule' || B.tipo === 'nuvens' || B.tipo === 'arco') {
      var camadas = B.tipo === 'arco' ? ['#f9a8c4', '#ffd08a', '#fff09a', '#a8e8c0', '#a8d0f8', '#cdb0f4'] :
        B.tipo === 'nuvens' ? ['#f9b4d0', '#fde08a', '#a8e0f8', '#c8b0f4'] : [escuro(B.cor, 0.08), B.cor, claro(B.cor, 0.3)];
      var larg = B.tipo === 'tutu' ? 44 : 30, alto = B.tipo === 'tutu' ? 26 : 46;
      camadas.forEach(function (cor, i) {
        var yy = y0 + i * (alto / camadas.length) + 6, ww = w0 + larg - i * 4, d3 = 'M' + n(x - w0) + ',' + n(y0) + ' L' + n(x + w0) + ',' + n(y0) + ' L' + n(x + ww) + ',' + n(yy + alto * 0.5);
        var dentes = B.tipo === 'nuvens' ? 7 : 14;
        for (var q = 0; q < dentes; q++) { var xa = x + ww - q * (ww * 2 / dentes), xb = xa - ww * 2 / dentes; d3 += B.tipo === 'nuvens' ? ' Q' + n((xa + xb) / 2) + ',' + n(yy + alto * 0.5 + 16) + ' ' + n(xb) + ',' + n(yy + alto * 0.5) : ' L' + n((xa + xb) / 2) + ',' + n(yy + alto * 0.5 + 8) + ' L' + n(xb) + ',' + n(yy + alto * 0.5); }
        d3 += 'Z';
        s += p(d3, { fill: cor, opacity: B.tipo === 'nuvens' ? 1 : 0.88, stroke: escuro(cor, 0.2), 'stroke-width': 1 });
      });
      var ultima = 'M' + n(x - w0 - 30) + ',' + n(y0) + 'H' + n(x + w0 + 30) + 'V' + n(y1 + 40) + 'H' + n(x - w0 - 30) + 'Z';
      if (B.tipo === 'nuvens' || B.glitter || B.tipo === 'tule') {
        var r = sorteio(11);
        for (var z = 0; z < 26; z++) { var gx = x + (r() - 0.5) * (w0 + larg) * 1.8, gy = y0 + 8 + r() * alto * 0.95; if (Math.abs(gx - x) < w0 + larg - 6 - (gy - y0) * 0.2 + 8) s += circ(gx, gy, 1.2 + r() * 1.6, { fill: B.glitter ? B.glitter[z % 2] : '#ffffff', opacity: 0.9 }); }
      }
      if (B.est === 'doces') s += p('M' + n(x - w0) + ',' + n(y0) + ' L' + n(x + w0) + ',' + n(y0) + ' L' + n(x + w0 + 22) + ',' + n(y0 + 30) + ' L' + n(x - w0 - 22) + ',' + n(y0 + 30) + 'Z', { fill: c.estampa('doces', B.cor), opacity: 0.9 });
      s += lin(x - w0, y0 + 1, x + w0, y0 + 1, { stroke: escuro(camadas[0], 0.25), 'stroke-width': 4, 'stroke-linecap': 'round' });
      void ultima;
      return s;
    }
    return s;
  }
  function jardineira(c, g, S, cintura) {
    var x = 150, t = g.t, cor = S.bib.cor, s = '';
    var peito = 'M' + n(x - 30) + ',' + n(t.y0 + 34) + ' L' + n(x + 30) + ',' + n(t.y0 + 34) + ' L' + n(x + 34) + ',' + n(cintura + 4) + ' L' + n(x - 34) + ',' + n(cintura + 4) + 'Z';
    s += p(peito, { fill: cor, stroke: escuro(cor, 0.35), 'stroke-width': 2 }) + p(peito, { fill: c.volume(), opacity: 0.5 });
    s += ret(x - 16, t.y0 + 46, 32, 22, { rx: 4, fill: 'none', stroke: '#f2c14e', 'stroke-width': 1.3, 'stroke-dasharray': '3 2' });
    [-1, 1].forEach(function (k) {
      s += p('M' + n(x + k * 26) + ',' + n(t.y0 + 36) + ' L' + n(x + k * (t.wt + 2)) + ',' + n(t.y0 + 2), { stroke: cor, 'stroke-width': 9, 'stroke-linecap': 'round' }) + p('M' + n(x + k * 26) + ',' + n(t.y0 + 36) + ' L' + n(x + k * (t.wt + 2)) + ',' + n(t.y0 + 2), { stroke: '#f2c14e', 'stroke-width': 1, 'stroke-dasharray': '2 2' });
      s += circ(x + k * 25, t.y0 + 38, 3.6, { fill: '#e8c060', stroke: '#9a7a30', 'stroke-width': 1 });
    });
    return s;
  }
  function jaqueta(c, g, J) {
    var x = 150, t = g.t, s = '', cor = J.metal ? c.lin(['#eef1f6', '#b8c0ce', '#f4f6fa', '#a9b2c2', '#dfe4ec'], 0, 0, 1, 1) : J.cor, cont = escuro(J.cor, 0.4);
    [-1, 1].forEach(function (k) {
      var d = 'M' + n(x + k * 6) + ',' + n(t.y0 + 4) + ' L' + n(x + k * 14) + ',' + n(t.y1 - 8) + ' L' + n(x + k * (t.wb + 5)) + ',' + n(t.y1 - 12) + ' C' + n(x + k * (t.wb + 5)) + ',' + n(t.y1 - 56) + ' ' + n(x + k * (t.wt + 9)) + ',' + n(t.y0 + 40) + ' ' + n(x + k * (t.wt + 4)) + ',' + n(t.y0 + 4) + 'Z';
      s += p(d, { fill: cor, stroke: cont, 'stroke-width': 2, 'stroke-linejoin': 'round' });
      s += p('M' + n(x + k * 6) + ',' + n(t.y0 + 4) + ' L' + n(x + k * 26) + ',' + n(t.y0 + 4) + ' L' + n(x + k * 14) + ',' + n(t.y0 + 34) + 'Z', { fill: J.couro ? '#3a353f' : '#e6eaf2', stroke: cont, 'stroke-width': 1.4 });
      if (J.couro) s += lin(x + k * 12, t.y0 + 40, x + k * 15, t.y1 - 14, { stroke: '#c9ced8', 'stroke-width': 1.6, 'stroke-dasharray': '2 1.5' });
      if (J.metal) s += p(brilhoD(x + k * 30, t.y0 + 50, 4), { fill: '#ffffff' });
    });
    return s;
  }
  function colete(c, g, C) {
    var x = 150, t = g.t, s = '';
    [-1, 1].forEach(function (k) {
      var d = 'M' + n(x + k * 10) + ',' + n(t.y0 + 6) + ' L' + n(x + k * 18) + ',' + n(t.y1 - 16) + ' L' + n(x + k * (t.wb + 4)) + ',' + n(t.y1 - 18) + ' C' + n(x + k * (t.wb + 4)) + ',' + n(t.y1 - 56) + ' ' + n(x + k * (t.wt + 8)) + ',' + n(t.y0 + 40) + ' ' + n(x + k * (t.wt + 2)) + ',' + n(t.y0 + 4) + 'Z';
      s += p(d, { fill: C.cor, stroke: escuro(C.cor, 0.35), 'stroke-width': 2 }) + p(d, { fill: c.volume(), opacity: 0.4 });
      for (var f = 0; f < 5; f++) s += lin(x + k * (22 + f * 7), t.y1 - 16, x + k * (22 + f * 7), t.y1 - 10, { stroke: '#eef3fa', 'stroke-width': 1.3 });
      s += lin(x + k * 20, t.y0 + 20, x + k * (t.wb - 6), t.y0 + 26, { stroke: '#f2c14e', 'stroke-width': 1, 'stroke-dasharray': '2 2' });
    });
    return s;
  }
  function cachecol(g, cor) {
    var x = 150, y = g.corpo === 'q' ? g.pescoco[1] : g.t.y0 + 6;
    var cx = g.corpo === 'q' ? g.pescoco[0] : x;
    return p('M' + n(cx - 40) + ',' + n(y - 4) + ' Q' + cx + ',' + n(y + 16) + ' ' + n(cx + 40) + ',' + n(y - 4) + ' L' + n(cx + 40) + ',' + n(y + 8) + ' Q' + cx + ',' + n(y + 28) + ' ' + n(cx - 40) + ',' + n(y + 8) + 'Z', { fill: cor, stroke: escuro(cor, 0.35), 'stroke-width': 1.6 }) +
      p('M' + n(cx + 18) + ',' + n(y + 14) + ' l6,40 l12,-2 l-6,-38z', { fill: cor, stroke: escuro(cor, 0.35), 'stroke-width': 1.6 }) + lin(cx + 21, y + 50, cx + 33, y + 48, { stroke: '#ffffff', 'stroke-width': 2.4 });
  }
  function mangaLado(c, a, g, S, k) {
    if (!S || S.abobora || S.capa) return '';
    var s = '', top = S.top;
    if (top && top.mangas && top.mangas !== 'nenhuma' && top.mangas !== 'alcinha') {
      var comp = top.mangas === 'longa' ? (g.bracoLongo ? 0.8 : 0.72) : top.mangas === 'bufante' ? 0.36 : 0.42;
      s += mangaPe(c, g, k, { cor: top.cor, est: top.est, barra: top.barra }, comp);
      if (top.mangas === 'bufante') { var o = g.omb[k]; s += circ(o[0] + (k ? 6 : -6), o[1] + 8, 19, { fill: top.tule ? claro(top.cor, 0.3) : top.cor, stroke: escuro(top.cor, 0.3), 'stroke-width': 1.6, opacity: top.tule ? 0.9 : 1 }) + (top.tule ? circ(o[0] + (k ? 6 : -6), o[1] + 8, 19, { fill: c.estampa('glitter', top.cor) }) : ''); }
      if (S.heroi) { var m = g.mao[k]; s += circ(m[0], m[1] + 2, g.rb + 3, { fill: S.heroi.cor2, stroke: escuro(S.heroi.cor2, 0.35), 'stroke-width': 1.8 }); }
    }
    if (S.jaqueta) s += mangaPe(c, g, k, { cor: S.jaqueta.metal ? '#c9d0dc' : S.jaqueta.cor }, 0.74);
    return s;
  }
  function mangasPe(c, a, g, S) { return mangaLado(c, a, g, S, 0) + mangaLado(c, a, g, S, 1); }
  // capuz / touca: parte de trás (antes da cabeça) e de frente (depois)
  function capuz(c, a, g, S, frente) {
    if (!S || !S.capuz) return '';
    var C = S.capuz, cb = g.cab, s = '';
    var cor = C.cor || (C.tipo === 'pinguim' ? '#2b2a36' : C.tipo === 'neve' ? '#f7f7fa' : C.tipo === 'abobora' ? '#f7922e' : '#d92f3a');
    var rx = cb.rx + 12, ry = cb.ry + 12;
    if (!frente) {
      if (C.tipo === 'touca' || C.tipo === 'abobora' || C.tipo === 'gorro-duende') return '';
      return elip(cb.x, cb.y + 2, rx, ry, { fill: cor, stroke: escuro(cor, 0.35), 'stroke-width': 2.2 }) + elip(cb.x, cb.y + 2, rx, ry, { fill: c.volume(), opacity: 0.6 });
    }
    if (C.tipo === 'touca') {   // touca combinando
      var d = 'M' + n(cb.x - cb.rx + 2) + ',' + n(cb.y - cb.ry * 0.28) + ' C' + n(cb.x - cb.rx + 6) + ',' + n(cb.y - cb.ry - 30) + ' ' + n(cb.x + cb.rx - 6) + ',' + n(cb.y - cb.ry - 30) + ' ' + n(cb.x + cb.rx - 2) + ',' + n(cb.y - cb.ry * 0.28) + ' Z';
      s += tecido(c, d, C.cor, C.est);
      s += p('M' + n(cb.x - cb.rx + 2) + ',' + n(cb.y - cb.ry * 0.28) + ' Q' + cb.x + ',' + n(cb.y - cb.ry * 0.5) + ' ' + n(cb.x + cb.rx - 2) + ',' + n(cb.y - cb.ry * 0.28), { stroke: escuro(C.cor, 0.2), 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' });
      s += circ(cb.x, cb.y - cb.ry - 18, 11, { fill: claro(C.cor, 0.5), stroke: escuro(C.cor, 0.3), 'stroke-width': 1.6 });
      return s;
    }
    if (C.tipo === 'gorro-duende') {
      var gx = cb.x, gy = cb.y - cb.ry * 0.36;
      s += p('M' + n(gx - cb.rx * 0.86) + ',' + n(gy) + ' C' + n(gx - cb.rx * 0.7) + ',' + n(gy - 70) + ' ' + n(gx + 20) + ',' + n(gy - 110) + ' ' + n(gx + cb.rx + 30) + ',' + n(gy - 70) + ' C' + n(gx + 40) + ',' + n(gy - 80) + ' ' + n(gx + cb.rx * 0.6) + ',' + n(gy - 30) + ' ' + n(gx + cb.rx * 0.86) + ',' + n(gy) + 'Z', { fill: C.cor, stroke: escuro(C.cor, 0.35), 'stroke-width': 2.2 });
      s += p('M' + n(gx - cb.rx * 0.9) + ',' + n(gy) + ' Q' + gx + ',' + n(gy - 22) + ' ' + n(gx + cb.rx * 0.9) + ',' + n(gy), { stroke: '#f4e6c8', 'stroke-width': 13, fill: 'none', 'stroke-linecap': 'round' });
      s += circ(gx + cb.rx + 32, gy - 70, 11, { fill: '#f4e6c8', stroke: '#c8b898', 'stroke-width': 1.6 }) + circ(gx + cb.rx + 32, gy - 54, 6, { fill: '#f2c14e', stroke: '#a8801e', 'stroke-width': 1.2 });
      return s;
    }
    if (C.tipo === 'abobora') {
      return p('M' + n(cb.x - 34) + ',' + n(cb.y - cb.ry + 10) + ' Q' + cb.x + ',' + n(cb.y - cb.ry - 16) + ' ' + n(cb.x + 34) + ',' + n(cb.y - cb.ry + 10) + ' Q' + cb.x + ',' + n(cb.y - cb.ry) + ' ' + n(cb.x - 34) + ',' + n(cb.y - cb.ry + 10) + 'Z', { fill: '#f7922e', stroke: '#c0601a', 'stroke-width': 2 }) +
        ret(cb.x - 5, cb.y - cb.ry - 20, 10, 20, { rx: 3, fill: '#6a8a3a', stroke: '#3c5a20', 'stroke-width': 1.4 }) + p('M' + n(cb.x + 4) + ',' + n(cb.y - cb.ry - 16) + ' q18,-10 24,4 q-14,6 -24,-4z', { fill: '#5fae4a', stroke: '#3c7a2e', 'stroke-width': 1.4 });
    }
    // aro do capuz em volta do rosto (com furo para o rosto)
    var ix = cb.rx - 4, iy = cb.ry - 2, aro = 'M' + n(cb.x - rx) + ',' + n(cb.y + 2) + ' a' + rx + ',' + ry + ' 0 1 0 ' + n(rx * 2) + ',0 a' + rx + ',' + ry + ' 0 1 0 ' + n(-rx * 2) + ',0z' +
      ' M' + n(cb.x - ix) + ',' + n(cb.y + 10) + ' a' + ix + ',' + iy + ' 0 1 1 ' + n(ix * 2) + ',0 a' + ix + ',' + iy + ' 0 1 1 ' + n(-ix * 2) + ',0z';
    var corte = c.faixa(-100, cb.y + cb.ry * 0.55);
    s += p(aro, { fill: cor, 'fill-rule': 'evenodd', stroke: escuro(cor, 0.35), 'stroke-width': 2, 'clip-path': corte });
    if (C.pelucia) s += elip(cb.x, cb.y + 10, ix + 2, iy + 2, { fill: 'none', stroke: C.pelucia, 'stroke-width': 11, 'clip-path': corte }) + elip(cb.x, cb.y + 10, ix + 2, iy + 2, { fill: 'none', stroke: '#e4ddd2', 'stroke-width': 2, 'stroke-dasharray': '1 4', 'clip-path': corte });
    if (C.tipo === 'dino') for (var i = -2; i <= 2; i++) { var an = rad(-90 + i * 26), x = cb.x + Math.cos(an) * (rx - 2), y = cb.y + 2 + Math.sin(an) * (ry - 2); s += '<g transform="rotate(' + (i * 26) + ' ' + n(x) + ' ' + n(y) + ')">' + p('M' + n(x - 10) + ',' + n(y + 4) + ' L' + x + ',' + n(y - 18) + ' L' + n(x + 10) + ',' + n(y + 4) + 'Z', { fill: '#ffd447', stroke: '#c9962a', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }) + '</g>'; }
    if (C.tipo === 'dino' || C.tipo === 'pinguim' || C.tipo === 'neve') {   // olhinhos e nariz no alto do capuz
      var ty = cb.y - cb.ry - 2;
      [-1, 1].forEach(function (k) { s += circ(cb.x + k * 16, ty, 6, { fill: '#ffffff', stroke: '#2a1e28', 'stroke-width': 1 }) + circ(cb.x + k * 16, ty + 1, 3, { fill: '#2a1e28' }); });
      if (C.tipo === 'pinguim') s += p('M' + n(cb.x - 8) + ',' + n(ty + 6) + ' L' + n(cb.x + 8) + ',' + n(ty + 6) + ' L' + cb.x + ',' + n(ty + 16) + 'Z', { fill: '#ffa53a', stroke: '#d9771a', 'stroke-width': 1.2 });
      if (C.tipo === 'neve') s += p('M' + n(cb.x - 4) + ',' + n(ty + 6) + ' L' + n(cb.x + 18) + ',' + n(ty + 11) + ' L' + n(cb.x - 4) + ',' + n(ty + 14) + 'Z', { fill: '#ff8a2a', stroke: '#c4601a', 'stroke-width': 1 }) + circ(cb.x - 10, ty - 9, 3, { fill: '#2e2a33' }) + circ(cb.x + 10, ty - 9, 3, { fill: '#2e2a33' });
    }
    if (C.pelucia && C.cor === '#d92f3a') s += circ(cb.x + rx * 0.72, cb.y + 2 - ry * 0.72, 11, { fill: C.pelucia, stroke: '#e4ddd2', 'stroke-width': 1.4 });
    return s;
  }

  /* ---------- roupa de 4 patas: casaco que cobre as costas, mangas nas patas da frente, pernas de trás ---------- */
  function roupaQ(c, a, g, S) {
    if (!S) return '';
    var b = g.b, s = '', top = S.top || {}, B = S.baixo || {};
    var cor = S.abobora ? '#f7922e' : S.capa ? S.capa.cor : (S.bib ? S.bib.cor : top.cor) || '#f59ac0';
    var est = S.bib ? null : top.est;
    var casaco = 'M' + n(b.x - b.rx - 4) + ',' + n(b.y) + ' a' + n(b.rx + 4) + ',' + n(b.ry + 4) + ' 0 1 1 ' + n((b.rx + 4) * 2) + ',0 a' + n(b.rx + 4) + ',' + n(b.ry + 4) + ' 0 1 1 ' + n(-(b.rx + 4) * 2) + ',0z';
    var bainha = b.y + b.ry * (S.capa ? 0.5 : 0.55), corte = c.faixa(-50, bainha);
    s += tecido(c, casaco, cor, est, { 'clip-path': corte });
    if (top.glitter || S.top && S.top.emblema) s += p(casaco, { fill: c.estampa('glitter', cor), 'clip-path': corte });
    if (S.abobora) [-40, -14, 12, 38].forEach(function (dx) { s += p('M' + n(b.x + dx) + ',' + n(b.y - b.ry) + ' Q' + n(b.x + dx * 1.2) + ',' + n(b.y) + ' ' + n(b.x + dx) + ',' + n(bainha), { stroke: '#d0701f', 'stroke-width': 2, fill: 'none', 'clip-path': corte }); });
    // barra (pelúcia branca do Noel, ou a costura)
    var barra = top.barra || (S.capa && S.capa.forro);
    s += p('M' + n(b.x - b.rx - 2) + ',' + n(bainha) + ' L' + n(b.x + b.rx + 2) + ',' + n(bainha), { stroke: barra || escuro(cor, 0.2), 'stroke-width': barra ? 12 : 3, 'stroke-linecap': 'round', 'clip-path': c.corte(casaco) });
    if (top.cinto) s += ret(b.x - 6, b.y - b.ry - 6, 14, bainha - b.y + b.ry + 6, { fill: top.cinto, 'clip-path': c.corte(casaco) }) + ret(b.x - 9, b.y + 6, 20, 16, { rx: 3, fill: 'none', stroke: '#f2c14e', 'stroke-width': 3 });
    if (top.ziper) s += p('M' + n(b.x - b.rx + 12) + ',' + n(b.y - 30) + ' Q' + n(b.x - b.rx + 2) + ',' + n(b.y) + ' ' + n(b.x - b.rx + 14) + ',' + n(bainha - 4), { stroke: escuro(cor, 0.45), 'stroke-width': 2.2, fill: 'none' });
    // saias: babado na bainha
    if (B.tipo === 'tutu' || B.tipo === 'tule' || B.tipo === 'nuvens' || B.tipo === 'arco' || B.tipo === 'saia' || B.tipo === 'babado') {
      var cores = B.tipo === 'arco' ? ['#f9a8c4', '#ffd08a', '#a8e8c0', '#a8d0f8', '#cdb0f4'] : B.tipo === 'nuvens' ? ['#f9b4d0', '#fde08a', '#a8e0f8', '#c8b0f4'] : [B.cor || cor];
      var x0 = b.x - b.rx + 18, x1 = b.x + b.rx - 8, k = 14, d = 'M' + n(x0) + ',' + n(bainha - 4);
      for (var i = 0; i < k; i++) { var xa = x0 + (i + 1) * (x1 - x0) / k; d += ' L' + n(xa - (x1 - x0) / k / 2) + ',' + n(bainha + 18 + (i % 2) * 4) + ' L' + n(xa) + ',' + n(bainha - 2); }
      d += 'Z';
      cores.forEach(function (cc, j) { s += p(d, { fill: cc, opacity: 0.85, stroke: escuro(cc, 0.2), 'stroke-width': 1, transform: 'translate(0 ' + (j * 4) + ')' }); });
      if (B.glitter || B.tipo === 'nuvens') { var r = sorteio(4); for (var z = 0; z < 14; z++) s += circ(x0 + r() * (x1 - x0), bainha + 2 + r() * 14, 1.4, { fill: B.glitter ? B.glitter[z % 2] : '#ffffff' }); }
    }
    if (S.bib) { s += lin(b.x - 30, b.y - b.ry + 4, b.x - 40, bainha, { stroke: '#f2c14e', 'stroke-width': 1.2, 'stroke-dasharray': '3 2', 'clip-path': c.corte(casaco) }); }
    if (top.texto || top.controle) s += top.controle ? controle(b.x + 10, b.y - 8, 0.9) : '';
    if (top.emblema === 'unicornio') s += emblemaUnicornio(c, b.x + 14, b.y - 12);
    if (S.heroi) s += emblemaHeroi(S.heroi, b.x + 10, b.y - 10, 20);
    if (a.patch && a.patch !== 'nenhum' && !S.capa && !S.abobora) s += patch(c, a.patch, b.x + 30, b.y - 10, 13);
    if (S.cachecol) s += cachecol(g, S.cachecol);
    return s;
  }
  function pernasRoupaQ(c, a, g, S) {
    if (!S || S.capa || S.abobora) return null;
    var top = S.top || {}, B = S.baixo || {}, pr = g.pernas;
    var manga = top.mangas && top.mangas !== 'nenhuma' && top.mangas !== 'alcinha' ? (top.mangas === 'longa' ? 0.62 : 0.34) : 0;
    var corM = S.jaqueta ? (S.jaqueta.metal ? '#c9d0dc' : S.jaqueta.cor) : top.cor;
    if (S.jaqueta) manga = 0.62;
    var perna = function (l, frac, cor, est, longe) {
      var t0 = l[0], pe = l[1], y2 = t0[1] + (pe[1] - t0[1]) * frac, r = g.rp + 3.5, x = t0[0];
      var r2 = capsula(x, t0[1] - 6, x, y2, r, longe ? escuro(cor, 0.12) : cor, escuro(cor, 0.4));
      var e = c.estampa(est, cor); if (e) r2 += lin(x, t0[1] - 6, x, y2, { stroke: e, 'stroke-width': r * 2, 'stroke-linecap': 'round' });
      if (top.barra && !B.tipo) r2 += lin(x - r, y2 + 2, x + r, y2 + 2, { stroke: top.barra, 'stroke-width': 8, 'stroke-linecap': 'round' });
      if (S.heroi && frac > 0.6) r2 += elip(x, pe[1] - 2, g.peRx + 3, g.peRy + 6, { fill: S.heroi.cor2, stroke: escuro(S.heroi.cor2, 0.35), 'stroke-width': 1.8 });
      return r2;
    };
    var trasFrac = B.tipo === 'calca' ? (B.pezinho ? 0.92 : 0.8) : B.tipo === 'bermuda' ? 0.42 : B.tipo === 'calcao' ? 0.3 : 0;
    return function (i) {
      var frente = i === 0 || i === 2;
      if (frente) return manga ? perna(pr[i], manga, corM, top.est, i < 2) : '';
      return trasFrac ? perna(pr[i], trasFrac, B.cor, B.est, i < 2) : '';
    };
  }

  /* ---------- acessórios ---------- */
  function lacoD(x, y, cor, e, estilo, ang, tecido) {   // laço: duas alças, nó e pontinhas (tecido: estampa por cima das alças)
    e = e || 1; var cont = escuro(cor, 0.35), s = '';
    s += p('M0,4 L-10,22 L-4,21 L-2,26 L4,8 Z M0,4 L10,22 L4,21 L2,26 L-4,8 Z', { fill: escuro(cor, 0.1), stroke: cont, 'stroke-width': 1.4, 'stroke-linejoin': 'round' });
    s += p('M0,0 C-8,-14 -30,-18 -30,-2 C-30,12 -10,10 0,0 Z', { fill: cor, stroke: cont, 'stroke-width': 1.6 }) + p('M0,0 C8,-14 30,-18 30,-2 C30,12 10,10 0,0 Z', { fill: cor, stroke: cont, 'stroke-width': 1.6 });
    if (tecido) s += p('M0,0 C-8,-14 -30,-18 -30,-2 C-30,12 -10,10 0,0 Z M0,0 C8,-14 30,-18 30,-2 C30,12 10,10 0,0 Z', { fill: tecido });
    s += p('M-6,-2 C-12,-8 -22,-10 -24,-3 M6,-2 C12,-8 22,-10 24,-3', { stroke: claro(cor, 0.45), 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round', opacity: 0.8 });
    if (estilo === 'glitter') { var r = sorteio(9); for (var i = 0; i < 16; i++) { var gx = (r() - 0.5) * 52, gy = (r() - 0.6) * 18; if (Math.abs(gx) > 4) s += circ(gx, gy, 0.9 + r() * 1.1, { fill: i % 3 ? '#ffffff' : '#fff2a8', opacity: 0.9 }); } }
    s += ret(-6, -7, 12, 13, { rx: 4, fill: escuro(cor, 0.06), stroke: cont, 'stroke-width': 1.6 });
    if (estilo === 'perola') s += circ(0, -0.5, 5, { fill: '#fbf8f4', stroke: '#cfc6d6', 'stroke-width': 0.9 }) + circ(-1.6, -2, 1.6, { fill: '#ffffff' });
    if (estilo === 'flor') { for (var fl = 0; fl < 5; fl++) { var fa = rad(fl * 72 - 90); s += circ(Math.cos(fa) * 3.6, -0.5 + Math.sin(fa) * 3.6, 2.8, { fill: '#9a6a44', stroke: '#5e3c22', 'stroke-width': 0.5 }); } s += circ(0, -0.5, 2.4, { fill: '#f4f8ff', stroke: '#9ab0c8', 'stroke-width': 0.6 }); [-20, 20].forEach(function (gx) { s += circ(gx, -3, 1.6, { fill: '#f4f8ff', stroke: '#9ab0c8', 'stroke-width': 0.5 }); }); }
    if (estilo === 'pedrinhas') { s += circ(0, -0.5, 3.4, { fill: '#e8f4ff', stroke: '#9ab0c8', 'stroke-width': 0.8 }) + circ(-1, -1.5, 1, { fill: '#fff' }); [-20, -12, 12, 20].forEach(function (gx, j) { s += circ(gx, -4 + (j % 2) * 4, 2, { fill: '#f4f8ff', stroke: '#9ab0c8', 'stroke-width': 0.6 }); }); }
    return '<g transform="translate(' + n(x) + ' ' + n(y) + ') rotate(' + (ang || 0) + ') scale(' + e + ')">' + s + '</g>';
  }
  A.lacoD = lacoD;
  var HOLO = '#cfd8f0';
  function acessCor(a, id) { var it = D.acess[id], cid = (a.corAcess && a.corAcess[id]) || (it && it.cor); return corHex(cid, '#f59ac0'); }
  function sapato(c, id, cor, x, y, g, sentado, lado) {
    var s = '', rx = g.peRx + 3, ry = g.peRy + 4;
    if (sentado) {
      var sc = id === 'botinhas' || id === 'sapatinho' ? '#2e2a33' : id === 'coturno' ? '#c98a4b' : id === 'bota-elfo' ? '#4fae6a' : id === 'tenis' || id === 'tenis-strass' ? '#fbfaf7' : cor === HOLO ? '#e8d8f4' : cor;
      s += circ(x, y, 21, { fill: sc, stroke: escuro(sc, 0.35), 'stroke-width': 2 }) + circ(x, y + 2, 13, { fill: '#e6e0e6', stroke: escuro(sc, 0.2), 'stroke-width': 1.2 });
      if (id === 'patins') [-1, 1].forEach(function (k) { s += circ(x + k * 9, y + 18, 5, { fill: '#a8d8f8', stroke: '#5a90b8', 'stroke-width': 1.2, opacity: 0.85 }); });
      if (id === 'patins-linha') s += elip(x, y + 19, 5, 7, { fill: '#a8d8f8', stroke: '#5a90b8', 'stroke-width': 1.2, opacity: 0.85 });
      if (id === 'tenis-luz') ['#ff5a7a', '#ffe45c', '#6fd68a', '#5fb0f0'].forEach(function (cc, k) { s += circ(x + Math.cos(rad(k * 90 + 45)) * 17, y + Math.sin(rad(k * 90 + 45)) * 17, 2.4, { fill: cc }); });
      if (id === 'bota-neve' || id === 'sapato-boneca') for (var k2 = 0; k2 < 8; k2++) s += circ(x + Math.cos(rad(k2 * 45)) * 20, y + Math.sin(rad(k2 * 45)) * 20, 4, { fill: '#fbf8f2', stroke: '#d8d0c4', 'stroke-width': 0.8 });
      if (id === 'pantufa') s += circ(x - 5, y - 4, 1.8, { fill: '#2a1e28' }) + circ(x + 5, y - 4, 1.8, { fill: '#2a1e28' });
      if (id === 'bota-elfo') s += circ(x, y - 19, 3.4, { fill: '#f2c14e', stroke: '#a8862a', 'stroke-width': 1 });
      return s;
    }
    var topoY = y - ry + 2;
    if (id === 'tenis' || id === 'tenis-strass' || id === 'tenis-brilho') {
      var base = id === 'tenis-brilho' ? (cor === '#cfd8f0' ? c.lin(['#f8c6f0', '#c6e8f8', '#e8f8c6', '#f8d8c6', '#d8c6f8'], 0, 0, 1, 0.6) : cor) : '#fbfaf7';
      var cano = id === 'tenis-brilho' ? 18 : 0;
      s += p('M' + n(x - rx) + ',' + n(y + 4) + ' Q' + n(x - rx) + ',' + n(topoY - cano) + ' ' + n(x - 6) + ',' + n(topoY - cano) + ' L' + n(x + 6) + ',' + n(topoY - cano) + ' Q' + n(x + rx) + ',' + n(topoY - cano) + ' ' + n(x + rx) + ',' + n(y + 4) + 'Z', { fill: base, stroke: '#9a94a4', 'stroke-width': 1.8 });
      if (/^#(f2c14e|c9ced8|f59ac0|ff3d8b)$/.test(cor) && id === 'tenis-brilho') s += p('M' + n(x - rx) + ',' + n(y + 4) + ' Q' + n(x - rx) + ',' + n(topoY - cano) + ' ' + n(x - 6) + ',' + n(topoY - cano) + ' L' + n(x + 6) + ',' + n(topoY - cano) + ' Q' + n(x + rx) + ',' + n(topoY - cano) + ' ' + n(x + rx) + ',' + n(y + 4) + 'Z', { fill: c.estampa('glitter', cor) });
      s += ret(x - rx - 1, y + 2, (rx + 1) * 2, 7, { rx: 3.5, fill: id === 'tenis' ? '#c99a6a' : '#ffffff', stroke: id === 'tenis' ? '#8a5a3c' : '#b8b2c0', 'stroke-width': 1.2 });
      if (id === 'tenis') s += elip(x, y + 1, 9, 4, { fill: '#efe2cc' }) + p('M' + n(x - rx + 4) + ',' + n(y - 2) + ' Q' + x + ',' + n(y - 8) + ' ' + n(x + rx - 4) + ',' + n(y - 2), { stroke: '#4f8fe0', 'stroke-width': 3, fill: 'none' });
      for (var l = 0; l < 3; l++) s += lin(x - 6, topoY - cano + 5 + l * 5, x + 6, topoY - cano + 5 + l * 5, { stroke: id === 'tenis' ? '#c8c2cc' : '#ffffff', 'stroke-width': 1.8, 'stroke-linecap': 'round' });
      if (id === 'tenis-strass') { s += p('M' + n(x - rx + 2) + ',' + n(y + 1) + ' Q' + x + ',' + n(y - 12) + ' ' + n(x + rx - 2) + ',' + n(y + 1) + 'Z', { fill: cor }) + p('M' + n(x - rx + 2) + ',' + n(y + 1) + ' Q' + x + ',' + n(y - 12) + ' ' + n(x + rx - 2) + ',' + n(y + 1) + 'Z', { fill: c.estampa('glitter', cor) }); for (var z = -2; z <= 2; z++) s += circ(x + z * 5, y - 3 + Math.abs(z), 1.6, { fill: '#ffffff', stroke: '#c0a8d8', 'stroke-width': 0.5 }); }
      return s;
    }
    if (id === 'botinhas' || id === 'coturno') {
      var bc = id === 'coturno' ? '#c98a4b' : '#2e2a33';
      s += p('M' + n(x - rx + 2) + ',' + n(y + 4) + ' L' + n(x - rx + 4) + ',' + n(topoY - 22) + ' L' + n(x + rx - 4) + ',' + n(topoY - 22) + ' L' + n(x + rx - 2) + ',' + n(y + 4) + 'Z', { fill: bc, stroke: escuro(bc, 0.4), 'stroke-width': 1.8, 'stroke-linejoin': 'round' });
      s += ret(x - rx, y + (id === 'coturno' ? -1 : 1), rx * 2, id === 'coturno' ? 10 : 7, { rx: 3, fill: escuro(bc, 0.45) });
      if (id === 'coturno') for (var cl = 0; cl < 4; cl++) s += p('M' + n(x - 6) + ',' + n(topoY - 18 + cl * 7) + ' L' + n(x + 6) + ',' + n(topoY - 14 + cl * 7) + ' M' + n(x + 6) + ',' + n(topoY - 18 + cl * 7) + ' L' + n(x - 6) + ',' + n(topoY - 14 + cl * 7), { stroke: '#ffd447', 'stroke-width': 1.6 });
      else s += elip(x - 6, topoY - 12, 3, 6, { fill: '#ffffff', opacity: 0.25 });
      return s;
    }
    if (id === 'sapatilhas' || id === 'sapatinho') {
      var sc2 = id === 'sapatinho' ? '#2e2a33' : cor;
      s += p('M' + n(x - rx) + ',' + n(y + 4) + ' Q' + n(x - rx) + ',' + n(topoY + 4) + ' ' + x + ',' + n(topoY + 4) + ' Q' + n(x + rx) + ',' + n(topoY + 4) + ' ' + n(x + rx) + ',' + n(y + 4) + 'Z', { fill: sc2, stroke: escuro(sc2, 0.4), 'stroke-width': 1.8 });
      s += lin(x - rx + 4, topoY + 2, x + rx - 4, topoY + 2, { stroke: escuro(sc2, 0.3), 'stroke-width': 3, 'stroke-linecap': 'round' });
      s += id === 'sapatilhas' ? lacoD(x, y - 2, claro(sc2, 0.3), 0.22) : circ(x + rx - 7, topoY + 2, 2.2, { fill: '#e8c060' });
      return s;
    }
    var ct = escuro(cor, 0.4), sola = function (cs, h) { return ret(x - rx - 1, y + 2, (rx + 1) * 2, h || 7, { rx: 3.5, fill: cs, stroke: escuro(cs, 0.3), 'stroke-width': 1.2 }); };
    var cano = function (alto, cs, larg) {   // bota: do bico até 'alto' acima do peito do pé
      larg = larg || 0;
      return p('M' + n(x - rx + 1) + ',' + n(y + 4) + ' Q' + n(x - rx - 1) + ',' + n(topoY) + ' ' + n(x - rx + 4 - larg) + ',' + n(topoY - alto) + ' L' + n(x + rx - 4 + larg) + ',' + n(topoY - alto) + ' Q' + n(x + rx + 1) + ',' + n(topoY) + ' ' + n(x + rx - 1) + ',' + n(y + 4) + 'Z', { fill: cs, stroke: escuro(typeof cs === 'string' && cs.charAt(0) === '#' ? cs : cor, 0.4), 'stroke-width': 1.8, 'stroke-linejoin': 'round' });
    };
    var baixo = function (cs) {   // sapato baixinho de bico redondo
      return p('M' + n(x - rx) + ',' + n(y + 4) + ' Q' + n(x - rx) + ',' + n(topoY + 2) + ' ' + n(x - 7) + ',' + n(topoY + 2) + ' L' + n(x + 7) + ',' + n(topoY + 2) + ' Q' + n(x + rx) + ',' + n(topoY + 2) + ' ' + n(x + rx) + ',' + n(y + 4) + 'Z', { fill: cs, stroke: escuro(cor, 0.4), 'stroke-width': 1.8 });
    };
    var florzinha = function (fx, fy, r, cp) { var f = ''; for (var k = 0; k < 5; k++) { var an = rad(k * 72 - 90); f += circ(fx + Math.cos(an) * r, fy + Math.sin(an) * r, r * 0.85, { fill: cp || '#ffffff', stroke: escuro(cp || '#ffffff', 0.2), 'stroke-width': 0.5 }); } return f + circ(fx, fy, r * 0.7, { fill: '#ffd447' }); };
    var cadarco = function (y0, n0, cc) { var f = ''; for (var k = 0; k < n0; k++) f += p('M' + n(x - 6) + ',' + n(y0 + k * 6) + ' L' + n(x + 6) + ',' + n(y0 + k * 6 + 4) + ' M' + n(x + 6) + ',' + n(y0 + k * 6) + ' L' + n(x - 6) + ',' + n(y0 + k * 6 + 4), { stroke: cc, 'stroke-width': 1.5, 'stroke-linecap': 'round' }); return f; };
    if (id === 'sandalia') {
      s += sola(claro(cor, 0.55), 6);
      s += p('M' + n(x - rx + 3) + ',' + n(y + 3) + ' Q' + x + ',' + n(topoY + 8) + ' ' + n(x + rx - 3) + ',' + n(y + 3), { stroke: ct, 'stroke-width': 7.5, fill: 'none', 'stroke-linecap': 'round' }) + p('M' + n(x - rx + 3) + ',' + n(y + 3) + ' Q' + x + ',' + n(topoY + 8) + ' ' + n(x + rx - 3) + ',' + n(y + 3), { stroke: cor, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' });
      s += lin(x - rx + 6, topoY - 2, x + rx - 6, topoY - 2, { stroke: ct, 'stroke-width': 5.5, 'stroke-linecap': 'round' }) + lin(x - rx + 6, topoY - 2, x + rx - 6, topoY - 2, { stroke: cor, 'stroke-width': 3.4, 'stroke-linecap': 'round' }) + lin(x, topoY - 2, x, topoY + 9, { stroke: cor, 'stroke-width': 3.4 });
      return s + florzinha(x, topoY + 9, 2.6);
    }
    if (id === 'chinelo') {
      s += sola(cor, 6) + lin(x - rx + 2, y + 4, x + rx - 2, y + 4, { stroke: claro(cor, 0.45), 'stroke-width': 1.6 });
      var tira = 'M' + n(x - rx + 5) + ',' + n(y + 3) + ' Q' + n(x - 7) + ',' + n(topoY + 8) + ' ' + x + ',' + n(topoY + 6) + ' Q' + n(x + 7) + ',' + n(topoY + 8) + ' ' + n(x + rx - 5) + ',' + n(y + 3);
      s += p(tira, { stroke: escuro(cor, 0.45), 'stroke-width': 6.5, fill: 'none', 'stroke-linecap': 'round' }) + p(tira, { stroke: claro(cor, 0.25), 'stroke-width': 4.4, fill: 'none', 'stroke-linecap': 'round' });
      return s + circ(x, topoY + 6, 3.6, { fill: cor, stroke: escuro(cor, 0.45), 'stroke-width': 1 });
    }
    if (id === 'galocha') {
      s += cano(26, cor) + ret(x - rx + 3, topoY - 27, (rx - 3) * 2, 6, { rx: 3, fill: claro(cor, 0.4), stroke: escuro(cor, 0.4), 'stroke-width': 1.2 });
      s += elip(x - rx * 0.45, topoY - 6, 3.4, 11, { fill: '#ffffff', opacity: 0.5 }) + p('M' + n(x + 5) + ',' + n(topoY - 14) + ' q-4,6 0,8 q4,-2 0,-8z', { fill: '#a8d8f8', stroke: '#5a90b8', 'stroke-width': 0.8 });
      return s + sola(escuro(cor, 0.35), 7);
    }
    if (id === 'bota-neve') {
      s += cano(16, cor, 1) + sola('#e8e4ec', 8) + p('M' + n(x - rx + 1) + ',' + n(y + 6) + ' l5,-3 5,3 5,-3 5,3 5,-3 5,3 5,-3 5,3 5,-3 5,3', { stroke: '#b8b2c0', 'stroke-width': 1, fill: 'none' });
      for (var f1 = 0; f1 < 6; f1++) s += circ(x - rx + 6 + f1 * ((rx * 2 - 12) / 5), topoY - 16 + (f1 % 2) * 2, 5.4, { fill: '#fbf8f2', stroke: '#d8d0c4', 'stroke-width': 1 });
      return s + circ(x + rx - 8, topoY - 4, 3, { fill: '#ffffff', stroke: escuro(cor, 0.3), 'stroke-width': 0.8 });
    }
    if (id === 'sapatilha-bale') {
      var fita = function (x1, y1, x2, y2) { return lin(x1, y1, x2, y2, { stroke: escuro(cor, 0.25), 'stroke-width': 3.6, 'stroke-linecap': 'round' }) + lin(x1, y1, x2, y2, { stroke: claro(cor, 0.25), 'stroke-width': 2.2, 'stroke-linecap': 'round' }); };
      s += fita(x - rx + 8, topoY + 6, x + 9, topoY - 12) + fita(x + rx - 8, topoY + 6, x - 9, topoY - 12) + fita(x + 9, topoY - 12, x - 7, topoY - 27) + fita(x - 9, topoY - 12, x + 7, topoY - 27);
      s += baixo(cor) + p('M' + n(x - rx + 4) + ',' + n(y + 4) + ' Q' + x + ',' + n(y - 2) + ' ' + n(x + rx - 4) + ',' + n(y + 4), { stroke: claro(cor, 0.5), 'stroke-width': 1.4, fill: 'none' }) + elip(x - 8, topoY + 8, 6, 2.6, { fill: '#ffffff', opacity: 0.45 });
      return s + lacoD(x, topoY + 4, claro(cor, 0.2), 0.2);
    }
    if (id === 'pantufa') {
      [-1, 1].forEach(function (k) { s += elip(x + k * 8, topoY - 6, 5, 12, { fill: cor, stroke: escuro(cor, 0.35), 'stroke-width': 1.4, transform: 'rotate(' + (k * 12) + ' ' + n(x + k * 8) + ' ' + n(topoY + 4) + ')' }) + elip(x + k * 8, topoY - 5, 2.2, 8, { fill: '#f8c6d6', transform: 'rotate(' + (k * 12) + ' ' + n(x + k * 8) + ' ' + n(topoY + 4) + ')' }); });
      s += elip(x, y - 1, rx + 1, ry - 1, { fill: cor, stroke: escuro(cor, 0.35), 'stroke-width': 1.8 }) + elip(x, y - 1, rx + 1, ry - 1, { fill: c.pelo(escuro(cor, 0.5), true) });
      s += circ(x - 6, y - 3, 2, { fill: '#2a1e28' }) + circ(x + 6, y - 3, 2, { fill: '#2a1e28' }) + p(coracaoD(x, y + 1, 2), { fill: '#f06292' }) + elip(x - 11, y + 2, 2.6, 1.5, { fill: '#ff8fb3', opacity: 0.7 }) + elip(x + 11, y + 2, 2.6, 1.5, { fill: '#ff8fb3', opacity: 0.7 });
      return s + sola(claro(cor, 0.4), 6);
    }
    if (id === 'tenis-luz') {
      s += p('M' + n(x - rx) + ',' + n(y + 4) + ' Q' + n(x - rx) + ',' + n(topoY - 4) + ' ' + n(x - 6) + ',' + n(topoY - 4) + ' L' + n(x + 6) + ',' + n(topoY - 4) + ' Q' + n(x + rx) + ',' + n(topoY - 4) + ' ' + n(x + rx) + ',' + n(y + 4) + 'Z', { fill: cor, stroke: escuro(cor, 0.4), 'stroke-width': 1.8 });
      s += p(estrelaD(x + 9, y - 4, 4, 1.8), { fill: '#ffffff', opacity: 0.85 }) + cadarco(topoY, 3, '#ffffff');
      s += ret(x - rx - 1, y + 2, (rx + 1) * 2, 8, { rx: 4, fill: '#ffffff', stroke: '#b8b2c0', 'stroke-width': 1.2 });
      ['#ff5a7a', '#ffb04d', '#ffe45c', '#6fd68a', '#5fb0f0', '#b07be6'].forEach(function (cc, k) { s += ret(x - rx + 2 + k * ((rx * 2 - 4) / 6), y + 4, (rx * 2 - 4) / 6 - 1.4, 4, { rx: 1.5, fill: cc, 'class': 'ma-brilha' }); });
      return s;
    }
    if (id === 'sapato-boneca' || id === 'sapato-cadarco') {
      var sb = id === 'sapato-cadarco' && cor === HOLO ? c.lin(['#f8c6f0', '#c6e8f8', '#e8f8c6', '#f8d8c6', '#d8c6f8'], 0, 0, 1, 0.6) : cor;
      if (id === 'sapato-boneca') for (var m1 = 0; m1 < 6; m1++) s += circ(x - rx + 6 + m1 * ((rx * 2 - 12) / 5), topoY + 1, 3.6, { fill: '#ffffff', stroke: '#d8d0dc', 'stroke-width': 0.8 });
      s += baixo(sb) + elip(x - 9, topoY + 8, 5, 2.4, { fill: '#ffffff', opacity: 0.55 });
      if (id === 'sapato-boneca') s += lin(x - rx + 4, topoY + 6, x + rx - 4, topoY + 6, { stroke: escuro(cor, 0.3), 'stroke-width': 3.4, 'stroke-linecap': 'round' }) + ret(x + rx - 12, topoY + 3, 7, 6, { rx: 1.4, fill: 'none', stroke: '#e8c060', 'stroke-width': 1.6 });
      else s += cadarco(topoY + 5, 2, cor === '#2e2a33' ? '#fbfaf7' : escuro(cor, 0.45)) + ret(x - rx - 1, y + 2, (rx + 1) * 2, 6, { rx: 3, fill: escuro(cor === HOLO ? '#c9a8e8' : cor, 0.45) });
      return s;
    }
    if (id === 'babuche') {
      s += p('M' + n(x - rx) + ',' + n(y + 4) + ' Q' + n(x - rx - 1) + ',' + n(topoY - 1) + ' ' + x + ',' + n(topoY - 1) + ' Q' + n(x + rx + 1) + ',' + n(topoY - 1) + ' ' + n(x + rx) + ',' + n(y + 4) + 'Z', { fill: cor, stroke: escuro(cor, 0.4), 'stroke-width': 1.8 });
      [[-12, 4], [-4, 2], [4, 2], [12, 4], [-8, 9], [0, 8], [8, 9]].forEach(function (f) { s += circ(x + f[0], topoY + f[1] + 2, 1.7, { fill: escuro(cor, 0.3) }); });
      s += p(coracaoD(x - 10, topoY + 12, 3.4), { fill: '#f06292', stroke: '#b8306a', 'stroke-width': 0.6 }) + p(estrelaD(x + 10, topoY + 12, 4.2, 1.9), { fill: '#ffd447', stroke: '#c9962a', 'stroke-width': 0.6 }) + florzinha(x, topoY + 14, 1.8, '#a8d0f8');
      return s + sola(claro(cor, 0.35), 6);
    }
    if (id === 'bota-cadarco') {
      s += cano(22, cor) + cadarco(topoY - 18, 4, cor === '#2e2a33' ? '#fbfaf7' : '#ffffff');
      for (var il = 0; il < 4; il++) [-1, 1].forEach(function (k) { s += circ(x + k * 8, topoY - 17 + il * 6, 1.5, { fill: '#f2c14e', stroke: '#a8862a', 'stroke-width': 0.5 }); });
      return s + sola(escuro(cor, 0.45), 7) + elip(x - rx * 0.5, topoY - 8, 2.6, 7, { fill: '#ffffff', opacity: 0.3 });
    }
    if (id === 'bota-elfo') {
      s += ret(x - rx + 5, topoY - 30, (rx - 5) * 2, 10, { rx: 3, fill: '#e5404f', stroke: '#a82634', 'stroke-width': 1.2 });
      s += cano(20, '#4fae6a') + ret(x - rx + 3, topoY - 22, (rx - 3) * 2, 7, { rx: 3, fill: '#f2c14e', stroke: '#a8862a', 'stroke-width': 1.2 });
      for (var z1 = 0; z1 < 3; z1++) s += p(estrelaD(x - 10 + z1 * 10, topoY - 18.5, 2.2, 1), { fill: '#fff6c8' });
      s += p('M' + n(x - 6) + ',' + n(y + 2) + ' Q' + n(x - 8) + ',' + n(topoY + 2) + ' ' + n(x + 2) + ',' + n(topoY - 2) + ' Q' + n(x + 9) + ',' + n(topoY) + ' ' + n(x + 5) + ',' + n(topoY + 6) + ' Q' + n(x + 2) + ',' + n(topoY + 10) + ' ' + n(x + 6) + ',' + n(y + 2) + 'Z', { fill: '#5cc078', stroke: '#2f7a40', 'stroke-width': 1.2 });
      return s + circ(x + 5, topoY + 7, 3.4, { fill: '#f2c14e', stroke: '#a8862a', 'stroke-width': 1 }) + sola('#ffd447', 7);
    }
    if (id === 'patins-linha') {
      s += cano(18, cor) + cadarco(topoY - 13, 3, '#ffffff') + ret(x - rx, y + 1, rx * 2, 6, { rx: 3, fill: escuro(cor, 0.3) });
      s += ret(x - 5, y + 6, 10, 9, { fill: '#9aa0aa', stroke: '#5a6070', 'stroke-width': 1 });
      return s + elip(x, y + 16, 5.5, 7.5, { fill: '#a8d8f8', stroke: '#5a90b8', 'stroke-width': 1.2, opacity: 0.9 }) + circ(x, y + 16, 1.8, { fill: '#ffffff' });
    }
    if (id === 'patins') {
      s += p('M' + n(x - rx) + ',' + n(y + 2) + ' L' + n(x - rx + 2) + ',' + n(topoY - 18) + ' L' + n(x + rx - 2) + ',' + n(topoY - 18) + ' L' + n(x + rx) + ',' + n(y + 2) + 'Z', { fill: cor === HOLO ? metalico(c, cor) : cor, stroke: escuro(cor, 0.4), 'stroke-width': 1.8, 'stroke-linejoin': 'round' });
      s += ret(x - rx - 2, y, (rx + 2) * 2, 7, { rx: 3, fill: '#ffffff', stroke: '#b8b2c0', 'stroke-width': 1.2 });
      for (var cl2 = 0; cl2 < 3; cl2++) s += lin(x - 7, topoY - 12 + cl2 * 6, x + 7, topoY - 12 + cl2 * 6, { stroke: '#ffffff', 'stroke-width': 2, 'stroke-linecap': 'round' });
      s += circ(x + rx + 2, y + 2, 4, { fill: '#ff8fb3', stroke: '#d8608a', 'stroke-width': 1 });
      [-1, 1].forEach(function (k) { s += circ(x + k * (rx - 6), y + 14, 6.5, { fill: claro(cor, 0.45), stroke: escuro(cor, 0.3), 'stroke-width': 1.4, opacity: 0.8 }) + circ(x + k * (rx - 6), y + 14, 2, { fill: '#ffffff' }); });
      return s;
    }
    return s;
  }
  // ajuste de altura quando a pelúcia está em cima de rodinhas: no skate, os pés pisam a tábua; nos patins, as rodinhas encostam no chão
  A.levantar = function (a) { var e = a.acess || {}; return e.chao === 'skate' ? 22 : e.pes === 'patins' ? 3 : e.pes === 'patins-linha' ? 6 : 0; };
  function skate(g, cor) {
    var y = g.chao - 13, x0 = g.corpo === 'q' ? g.b.x - 96 : 82, x1 = g.corpo === 'q' ? g.b.x + 88 : 218, s = '';
    s += p('M' + n(x0) + ',' + n(y - 12) + ' Q' + n(x0 - 14) + ',' + n(y - 12) + ' ' + n(x0 - 16) + ',' + n(y - 24) + ' L' + n(x0 - 10) + ',' + n(y - 8) + ' Q' + n(x0 - 6) + ',' + n(y - 2) + ' ' + x0 + ',' + n(y - 2) + ' L' + x1 + ',' + n(y - 2) + ' Q' + n(x1 + 6) + ',' + n(y - 2) + ' ' + n(x1 + 10) + ',' + n(y - 8) + ' L' + n(x1 + 16) + ',' + n(y - 24) + ' Q' + n(x1 + 14) + ',' + n(y - 12) + ' ' + x1 + ',' + n(y - 12) + 'Z', { fill: cor, stroke: escuro(cor, 0.4), 'stroke-width': 2 });
    s += lin(x0 + 10, y - 9, x1 - 10, y - 9, { stroke: '#ffffff', 'stroke-width': 2, opacity: 0.6, 'stroke-dasharray': '10 8' });
    [x0 + 22, x1 - 22].forEach(function (wx) { s += ret(wx - 14, y - 2, 28, 5, { fill: '#9aa0aa' }) + circ(wx - 10, y + 9, 7, { fill: '#ffe27a', stroke: '#c9a23a', 'stroke-width': 1.6 }) + circ(wx + 10, y + 9, 7, { fill: '#ffe27a', stroke: '#c9a23a', 'stroke-width': 1.6 }); });
    return s;
  }
  function cabecaAcess(c, a, g, id, cor) {
    var cb = g.cab, x = cb.x, y = cb.y - cb.ry, s = '';
    if (id === 'tiara' || id === 'tiara-sapinho' || id === 'tiara-chifres') {
      var tc = id === 'tiara' ? cor : id === 'tiara-sapinho' ? '#5fbf5a' : '#d8434f';
      var arco = 'M' + n(x - cb.rx * 0.86) + ',' + n(cb.y - cb.ry * 0.42) + ' A' + n(cb.rx * 0.9) + ',' + n(cb.ry * 0.95) + ' 0 0 1 ' + n(x + cb.rx * 0.86) + ',' + n(cb.y - cb.ry * 0.42);
      s += p(arco, { stroke: escuro(tc, 0.35), 'stroke-width': 11, fill: 'none', 'stroke-linecap': 'round' }) + p(arco, { stroke: tc, 'stroke-width': 7.5, fill: 'none', 'stroke-linecap': 'round' });
      if (id === 'tiara') for (var i = -2; i <= 2; i++) { var an = rad(-90 + i * 22); s += circ(x + Math.cos(an) * cb.rx * 0.9, cb.y + Math.sin(an) * cb.ry * 0.95 + 2, 3.2, { fill: '#ffffff', opacity: 0.9 }); }
      if (id === 'tiara-sapinho') [-1, 1].forEach(function (k) { var ex = x + k * 24, ey = y - 8; s += circ(ex, ey, 14, { fill: '#5fbf5a', stroke: '#2f7a2e', 'stroke-width': 1.8 }) + circ(ex, ey - 1, 9, { fill: '#ffffff' }) + circ(ex, ey, 5, { fill: '#1a1220' }) + circ(ex + 2, ey - 2, 1.8, { fill: '#ffffff' }); });
      if (id === 'tiara-chifres') [-1, 1].forEach(function (k) { var bx = x + k * 26, by = y + 6; s += p('M' + bx + ',' + by + ' q' + (k * 4) + ',-24 ' + (k * 16) + ',-34 M' + n(bx + k * 6) + ',' + n(by - 16) + ' q' + (k * 10) + ',-2 ' + (k * 16) + ',6 M' + n(bx + k * 10) + ',' + n(by - 26) + ' q' + (k * -6) + ',-8 ' + (k * -4) + ',-16', { stroke: '#a8202e', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }) + p('M' + bx + ',' + by + ' q' + (k * 4) + ',-24 ' + (k * 16) + ',-34 M' + n(bx + k * 6) + ',' + n(by - 16) + ' q' + (k * 10) + ',-2 ' + (k * 16) + ',6 M' + n(bx + k * 10) + ',' + n(by - 26) + ' q' + (k * -6) + ',-8 ' + (k * -4) + ',-16', { stroke: '#e5404f', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }); });
      return s;
    }
    if (id === 'coroa') {
      var cy = y + 4;
      s += p('M' + n(x - 30) + ',' + n(cy) + ' L' + n(x - 34) + ',' + n(cy - 30) + ' L' + n(x - 17) + ',' + n(cy - 14) + ' L' + x + ',' + n(cy - 36) + ' L' + n(x + 17) + ',' + n(cy - 14) + ' L' + n(x + 34) + ',' + n(cy - 30) + ' L' + n(x + 30) + ',' + n(cy) + ' Q' + x + ',' + n(cy + 8) + ' ' + n(x - 30) + ',' + n(cy) + 'Z', { fill: '#ffd35c', stroke: '#c48a1a', 'stroke-width': 2, 'stroke-linejoin': 'round' });
      s += circ(x, cy - 6, 5, { fill: '#f06292', stroke: '#b8306a', 'stroke-width': 1 }) + circ(x - 18, cy - 4, 3.5, { fill: '#6fb6f0' }) + circ(x + 18, cy - 4, 3.5, { fill: '#6fd68a' }) + circ(x - 34, cy - 31, 3, { fill: '#fff6c8' }) + circ(x, cy - 37, 3, { fill: '#fff6c8' }) + circ(x + 34, cy - 31, 3, { fill: '#fff6c8' });
      return s;
    }
    if (id === 'coroa-flores') {
      var cores = ['#f9a8c4', '#fff09a', '#a8d0f8', '#cdb0f4', '#ffd0a0', '#a8e8c0', '#f9a8c4'];
      for (var j = 0; j < 7; j++) {
        var an2 = rad(-160 + j * 23.3), fx = x + Math.cos(an2) * cb.rx * 0.9, fy = cb.y + Math.sin(an2) * cb.ry * 0.95;
        if (j % 2) s += elip(fx, fy + 6, 8, 4, { fill: '#6fbf6a', transform: 'rotate(' + n(-160 + j * 23.3 + 90) + ' ' + n(fx) + ' ' + n(fy + 6) + ')' });
        for (var pt = 0; pt < 5; pt++) { var pa = rad(pt * 72); s += circ(fx + Math.cos(pa) * 5, fy + Math.sin(pa) * 5, 4.4, { fill: cores[j], stroke: escuro(cores[j], 0.2), 'stroke-width': 0.8 }); }
        s += circ(fx, fy, 3, { fill: '#ffd447' });
      }
      return s;
    }
    if (id === 'chapeu') {
      s += elip(x, y + 18, cb.rx + 30, 20, { fill: cor, stroke: escuro(cor, 0.35), 'stroke-width': 2 }) + p('M' + n(x - 44) + ',' + n(y + 16) + ' Q' + n(x - 44) + ',' + n(y - 30) + ' ' + x + ',' + n(y - 30) + ' Q' + n(x + 44) + ',' + n(y - 30) + ' ' + n(x + 44) + ',' + n(y + 16) + 'Z', { fill: cor, stroke: escuro(cor, 0.35), 'stroke-width': 2 });
      s += p('M' + n(x - 44) + ',' + n(y + 6) + ' Q' + x + ',' + n(y + 12) + ' ' + n(x + 44) + ',' + n(y + 6) + ' L' + n(x + 44) + ',' + n(y + 16) + ' Q' + x + ',' + n(y + 22) + ' ' + n(x - 44) + ',' + n(y + 16) + 'Z', { fill: '#ffffff', opacity: 0.85 }) + lacoD(x + 30, y + 10, '#f06292', 0.35);
      return s;
    }
    if (id === 'bone' || id === 'viseira' || id === 'capacete') {
      if (id === 'capacete') {
        s += p('M' + n(x - cb.rx * 0.86) + ',' + n(cb.y - cb.ry * 0.3) + ' C' + n(x - cb.rx * 0.9) + ',' + n(y - 30) + ' ' + n(x + cb.rx * 0.9) + ',' + n(y - 30) + ' ' + n(x + cb.rx * 0.86) + ',' + n(cb.y - cb.ry * 0.3) + ' Q' + x + ',' + n(cb.y - cb.ry * 0.5) + ' ' + n(x - cb.rx * 0.86) + ',' + n(cb.y - cb.ry * 0.3) + 'Z', { fill: cor, stroke: escuro(cor, 0.4), 'stroke-width': 2 });
        s += p('M' + n(x - 40) + ',' + n(y - 4) + ' Q' + x + ',' + n(y - 22) + ' ' + n(x + 40) + ',' + n(y - 4), { stroke: claro(cor, 0.4), 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }) + [-14, 0, 14].map(function (dx) { return ret(x + dx - 3, y - 12, 6, 10, { rx: 3, fill: escuro(cor, 0.3) }); }).join('');
        s += p('M' + n(x - cb.rx * 0.84) + ',' + n(cb.y - cb.ry * 0.3) + ' Q' + n(x - cb.rx * 0.7) + ',' + n(cb.y + 40) + ' ' + n(x - 30) + ',' + n(cb.y + cb.ry * 0.7), { stroke: '#2e2a33', 'stroke-width': 3, fill: 'none' }) + ret(x - 36, cb.y + cb.ry * 0.66, 12, 9, { rx: 2, fill: '#c9ced8', stroke: '#6a707c' });
        return s;
      }
      var topo = id === 'viseira' ? '' : p('M' + n(x - cb.rx * 0.84) + ',' + n(cb.y - cb.ry * 0.36) + ' C' + n(x - cb.rx * 0.86) + ',' + n(y - 26) + ' ' + n(x + cb.rx * 0.86) + ',' + n(y - 26) + ' ' + n(x + cb.rx * 0.84) + ',' + n(cb.y - cb.ry * 0.36) + ' Z', { fill: cor, stroke: escuro(cor, 0.4), 'stroke-width': 2 }) + circ(x, y - 18, 4, { fill: escuro(cor, 0.2) }) + p('M' + x + ',' + n(y - 16) + ' L' + x + ',' + n(cb.y - cb.ry * 0.4), { stroke: escuro(cor, 0.25), 'stroke-width': 1.4 });
      if (id === 'viseira') s += p('M' + n(x - cb.rx * 0.84) + ',' + n(cb.y - cb.ry * 0.36) + ' A' + n(cb.rx * 0.86) + ',' + n(cb.ry * 0.86) + ' 0 0 1 ' + n(x + cb.rx * 0.84) + ',' + n(cb.y - cb.ry * 0.36), { stroke: cor, 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' });
      s += topo + p('M' + n(x - cb.rx * 0.62) + ',' + n(cb.y - cb.ry * 0.36) + ' Q' + x + ',' + n(cb.y - cb.ry * 0.62) + ' ' + n(x + cb.rx * 0.62) + ',' + n(cb.y - cb.ry * 0.36) + ' Q' + n(x + cb.rx * 0.5) + ',' + n(cb.y - cb.ry * 0.1) + ' ' + x + ',' + n(cb.y - cb.ry * 0.12) + ' Q' + n(x - cb.rx * 0.5) + ',' + n(cb.y - cb.ry * 0.1) + ' ' + n(x - cb.rx * 0.62) + ',' + n(cb.y - cb.ry * 0.36) + 'Z', { fill: escuro(cor, 0.08), stroke: escuro(cor, 0.4), 'stroke-width': 2 });
      return s;
    }
    return s;
  }
  function lacos(c, a, g, id, cor) {
    var L = g.laco, s = '';
    if (id === 'laco') return lacoD(L[0][0], L[0][1], cor, 0.78, null, -18);
    if (id === 'lacos2') return lacoD(L[0][0] - 2, L[0][1] + 4, cor, 0.62, null, -22) + lacoD(L[1][0] + 2, L[1][1] + 4, cor, 0.62, null, 22);
    if (id === 'laco-glitter') return lacoD(L[0][0], L[0][1], cor, 0.8, 'glitter', -18);
    if (id === 'laco-pedrinhas') return lacoD(L[1][0], L[1][1], cor, 0.8, 'pedrinhas', 16);
    if (id === 'laco-gigante') return lacoD(g.cab.x - 26, g.topo[1] + 2, cor, 1.35, null, -12);
    if (id === 'mini-lacos') { var cs = ['#f9707f', '#ffb04d', '#ffe45c', '#6fd68a', '#5fb0f0', '#b07be6']; cs.forEach(function (cc, i) { var an = rad(-150 + i * 24), cb = g.cab; s += lacoD(cb.x + Math.cos(an) * cb.rx * 0.92, cb.y + Math.sin(an) * cb.ry * 0.95, cc, 0.32, null, -150 + i * 24 + 90); }); return s; }
    var cb = g.cab, k, an;
    var bordaCab = function (graus, f) { var r0 = rad(graus); return [cb.x + Math.cos(r0) * cb.rx * (f || 0.9), cb.y + Math.sin(r0) * cb.ry * (f || 0.9)]; };
    if (id === 'laco-bolinhas') return lacoD(L[0][0], L[0][1], cor, 0.8, null, -18, c.estampa('bolinhas-mini', cor));
    if (id === 'laco-xadrez') return lacoD(L[1][0], L[1][1], cor, 0.8, null, 16, c.estampa('xadrez', cor));
    if (id === 'laco-perola') return lacoD(L[0][0], L[0][1], cor, 0.82, 'perola', -18, c.lin([claro(cor, 0.5), cor, claro(cor, 0.35), escuro(cor, 0.1)], 0, 0, 1, 1));
    if (id === 'lacos-flor') return lacoD(L[0][0] - 2, L[0][1] + 4, cor, 0.62, 'flor', -22) + lacoD(L[1][0] + 2, L[1][1] + 4, cor, 0.62, 'flor', 22);
    if (id === 'laco-topo') return lacoD(g.topo[0], g.topo[1] + 6, cor, 0.5, 'glitter', 0);
    if (id === 'laco-coracao') {   // as alças do laço são dois coraçõezinhos
      var x = L[0][0], y = L[0][1], ct = escuro(cor, 0.35);
      s += p('M0,4 L-8,20 L-3,19 L-1,24 L3,8 Z M0,4 L8,20 L3,19 L1,24 L-3,8 Z', { fill: escuro(cor, 0.1), stroke: ct, 'stroke-width': 1.3, 'stroke-linejoin': 'round' });
      [-1, 1].forEach(function (k) { s += '<g transform="translate(' + (k * 15) + ' -2) rotate(' + (k * 90) + ')">' + p(coracaoD(0, 0, 13), { fill: cor, stroke: ct, 'stroke-width': 1.6 }) + '</g>'; });
      s += ret(-5, -6, 10, 11, { rx: 4, fill: escuro(cor, 0.06), stroke: ct, 'stroke-width': 1.5 }) + p(brilhoD(-17, -6, 3), { fill: '#ffffff', opacity: 0.8 });
      return '<g transform="translate(' + n(x) + ' ' + n(y) + ') rotate(-18) scale(0.85)">' + s + '</g>';
    }
    if (id === 'presilhas-estrela') {   // três presilhas de estrela na beirada da cabeça
      [-62, -44, -26].forEach(function (gr0, i) {
        var q0 = bordaCab(gr0, 0.92), r0 = i === 1 ? 10 : 8;
        s += lin(q0[0] - 9, q0[1] + 4, q0[0] + 9, q0[1] - 2, { stroke: '#a8aebc', 'stroke-width': 2.6, 'stroke-linecap': 'round', transform: 'rotate(' + (gr0 + 90) + ' ' + n(q0[0]) + ' ' + n(q0[1]) + ')' });
        s += p(estrelaD(q0[0], q0[1], r0, r0 * 0.48), { fill: cor, stroke: escuro(cor, 0.35), 'stroke-width': 1.4, 'stroke-linejoin': 'round' }) + circ(q0[0] - r0 * 0.25, q0[1] - r0 * 0.25, 1.4, { fill: '#ffffff', opacity: 0.9 });
      });
      return s;
    }
    if (id === 'chuquinhas' || id === 'scrunchie') {   // tufinhos de pelo presos com elástico
      var pe0 = D.pelo[a.pelo] || D.PELOS[0], pc = pe0.grad ? pe0.grad[Math.floor(pe0.grad.length / 2)] : pe0.cor;
      (id === 'scrunchie' ? [-58] : [-138, -42]).forEach(function (gr0) {
        var q0 = bordaCab(gr0, 0.9), t0 = '';
        for (k = -1; k <= 1; k++) { an = rad(gr0 + k * 22); t0 += elip(q0[0] + Math.cos(an) * 14, q0[1] + Math.sin(an) * 14, 7, 13, { fill: pc, stroke: escuro(pc, 0.4), 'stroke-width': 1.4, transform: 'rotate(' + n(gr0 + 90 + k * 22) + ' ' + n(q0[0] + Math.cos(an) * 14) + ' ' + n(q0[1] + Math.sin(an) * 14) + ')' }); }
        s += t0;
        if (id === 'scrunchie') {
          for (k = 0; k < 10; k++) { an = rad(k * 36); s += elip(q0[0] + Math.cos(an) * 8, q0[1] + Math.sin(an) * 5, 5.4, 4.4, { fill: c.radial([[0, claro(cor, 0.25)], [1, escuro(cor, 0.25)]], 0.4, 0.35, 0.7), stroke: escuro(cor, 0.4), 'stroke-width': 0.8 }); }
        } else {
          s += elip(q0[0], q0[1], 8, 4, { fill: cor, stroke: escuro(cor, 0.35), 'stroke-width': 1.2, transform: 'rotate(' + n(gr0 + 90) + ' ' + n(q0[0]) + ' ' + n(q0[1]) + ')' });
          [-1, 1].forEach(function (k) { var bx = q0[0] + k * 6 * Math.cos(rad(gr0 + 90)), by = q0[1] + k * 6 * Math.sin(rad(gr0 + 90)); s += circ(bx, by, 4.6, { fill: cor, stroke: escuro(cor, 0.35), 'stroke-width': 1 }) + circ(bx - 1.4, by - 1.4, 1.3, { fill: '#ffffff', opacity: 0.85 }); });
        }
      });
      return s;
    }
    if (id === 'garra') {   // piranha (garra) de cabelo
      var gq = bordaCab(-50, 0.9), dente = '';
      for (k = 0; k < 6; k++) dente += 'M' + n(-15 + k * 6) + ',2 l2,13 2,-13 ';
      s += p('M-18,2 Q0,-12 18,2 Z', { fill: cor, stroke: escuro(cor, 0.5), 'stroke-width': 1.4 }) + p(dente, { fill: cor, stroke: escuro(cor, 0.5), 'stroke-width': 1.2, 'stroke-linejoin': 'round' }) + p('M-12,-1 Q0,-8 12,-1', { stroke: claro(cor, 0.5), 'stroke-width': 1.6, fill: 'none', opacity: 0.8 });
      return '<g transform="translate(' + n(gq[0]) + ' ' + n(gq[1]) + ') rotate(40)">' + s + '</g>';
    }
    if (id === 'tiara-laco') {
      var arco = 'M' + n(cb.x - cb.rx * 0.86) + ',' + n(cb.y - cb.ry * 0.42) + ' A' + n(cb.rx * 0.9) + ',' + n(cb.ry * 0.95) + ' 0 0 1 ' + n(cb.x + cb.rx * 0.86) + ',' + n(cb.y - cb.ry * 0.42);
      s += p(arco, { stroke: escuro(cor, 0.35), 'stroke-width': 11, fill: 'none', 'stroke-linecap': 'round' }) + p(arco, { stroke: cor, 'stroke-width': 7.5, fill: 'none', 'stroke-linecap': 'round' });
      var tq = bordaCab(-118, 0.95);
      return s + lacoD(tq[0], tq[1], cor, 1.05, null, -22);
    }
    if (id === 'laco-fitas') {   // laço de fitinhas coloridas, preso perto da orelha
      var x = L[0][0], y = L[0][1], fs = ['#8a5cd6', '#ffd447', '#4f8fe0', '#f06292', '#8a5cd6', '#ffd447', '#4f8fe0', '#f06292', '#6fd68a'];
      fs.forEach(function (cc, i) { var an = rad(i * 40 + 10), l = 16 + (i % 3) * 3; s += p('M' + n(x) + ',' + n(y) + ' q' + n(Math.cos(an + 0.5) * l * 0.6) + ',' + n(Math.sin(an + 0.5) * l * 0.6) + ' ' + n(Math.cos(an) * l) + ',' + n(Math.sin(an) * l), { stroke: escuro(cc, 0.25), 'stroke-width': 6.5, fill: 'none', 'stroke-linecap': 'round' }) + p('M' + n(x) + ',' + n(y) + ' q' + n(Math.cos(an + 0.5) * l * 0.6) + ',' + n(Math.sin(an + 0.5) * l * 0.6) + ' ' + n(Math.cos(an) * l) + ',' + n(Math.sin(an) * l), { stroke: cc, 'stroke-width': 4.5, fill: 'none', 'stroke-linecap': 'round' }); });
      return s + circ(x, y, 5, { fill: '#ffffff', stroke: '#c8c0d0', 'stroke-width': 1 });
    }
    return s;
  }
  function oculos(c, a, g, id, cor) {
    var y = g.olhoY + 1, dx = g.olhoDx, x = g.cab.x, r = g.olhoR + 7, s = '';
    if (id === 'oculos') {
      [-1, 1].forEach(function (k) { s += circ(x + k * dx, y, r, { fill: '#e8f4ff', 'fill-opacity': 0.25, stroke: cor, 'stroke-width': 4 }) + p('M' + n(x + k * dx - r * 0.5) + ',' + n(y - r * 0.4) + ' l6,-4', { stroke: '#ffffff', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.8 }); });
      s += p('M' + n(x - dx + r) + ',' + n(y - 2) + ' Q' + x + ',' + n(y - 8) + ' ' + n(x + dx - r) + ',' + n(y - 2), { stroke: cor, 'stroke-width': 3.5, fill: 'none' });
      return s;
    }
    if (id === 'oculos-sol') {
      [-1, 1].forEach(function (k) { s += ret(x + k * dx - r, y - r * 0.8, r * 2, r * 1.6, { rx: r * 0.6, fill: cor, stroke: escuro(cor, 0.3), 'stroke-width': 2.4 }) + ret(x + k * dx - r + 5, y - r * 0.8 + 5, r * 2 - 10, r * 1.6 - 10, { rx: r * 0.4, fill: '#2a2430', opacity: 0.9 }) + p('M' + n(x + k * dx - r * 0.5) + ',' + n(y - r * 0.3) + ' l7,-4', { stroke: '#ffffff', 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: 0.7 }); });
      s += lin(x - dx + r, y - 4, x + dx - r, y - 4, { stroke: cor, 'stroke-width': 4 });
      return s;
    }
    if (id === 'oculos-coracao') {
      [-1, 1].forEach(function (k) { s += p(coracaoD(x + k * dx, y, r * 0.95), { fill: cor, 'fill-opacity': 0.55, stroke: escuro(cor, 0.2), 'stroke-width': 3.4 }) + p('M' + n(x + k * dx - 8) + ',' + n(y - 6) + ' l5,-3', { stroke: '#ffffff', 'stroke-width': 2, 'stroke-linecap': 'round' }); });
      s += lin(x - dx + r * 0.8, y - 4, x + dx - r * 0.8, y - 4, { stroke: escuro(cor, 0.2), 'stroke-width': 3 });
      return s;
    }
    return s;
  }
  function pescocoAcess(c, a, g, id, cor) {
    var x = g.pescoco[0], y = g.pescoco[1], s = '', q = g.corpo === 'q';
    var w = q ? 38 : 40;
    if (id === 'colar-bolinhas') { var cs = ['#f9b4d0', '#fde08a', '#a8e0f8', '#c8b0f4', '#a8e8c0']; for (var i = 0; i <= 10; i++) { var t = i / 10, bx = x - w + t * w * 2, by = y + Math.sin(t * Math.PI) * 18 - (q ? 6 : 0); s += circ(bx, by, 4.6, { fill: cs[i % 5], stroke: escuro(cs[i % 5], 0.25), 'stroke-width': 0.8 }) + circ(bx - 1.4, by - 1.4, 1.3, { fill: '#ffffff', opacity: 0.8 }); } return s; }
    if (id === 'colar-coracao') return p('M' + n(x - w) + ',' + n(y - 2) + ' Q' + x + ',' + n(y + 30) + ' ' + n(x + w) + ',' + n(y - 2), { stroke: '#e0b848', 'stroke-width': 2, fill: 'none', 'stroke-dasharray': '2 1.5' }) + p(coracaoD(x, y + 22, 8), { fill: '#f06292', stroke: '#c0406a', 'stroke-width': 1.4 }) + circ(x - 3, y + 19, 1.6, { fill: '#ffffff', opacity: 0.8 });
    if (id === 'lenco') return p('M' + n(x - w) + ',' + n(y - 4) + ' Q' + x + ',' + n(y + 8) + ' ' + n(x + w) + ',' + n(y - 4) + ' L' + x + ',' + n(y + 34) + 'Z', { fill: cor, stroke: escuro(cor, 0.35), 'stroke-width': 1.6, 'stroke-linejoin': 'round' }) + circ(x - 10, y + 6, 2, { fill: '#ffffff' }) + circ(x + 8, y + 10, 2, { fill: '#ffffff' }) + circ(x, y + 20, 2, { fill: '#ffffff' });
    if (id === 'coleira' || id === 'coleira-pata') {
      var holo = cor === '#cfd8f0' ? c.lin(['#f8c6f0', '#c6e8f8', '#e8f8c6', '#d8c6f8'], 0, 0, 1, 0) : cor;
      s += p('M' + n(x - w) + ',' + n(y - 4) + ' Q' + x + ',' + n(y + 14) + ' ' + n(x + w) + ',' + n(y - 4), { stroke: escuro(cor, 0.35), 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' }) + p('M' + n(x - w) + ',' + n(y - 4) + ' Q' + x + ',' + n(y + 14) + ' ' + n(x + w) + ',' + n(y - 4), { stroke: holo, 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' });
      s += circ(x, y + 9, 5, { fill: 'none', stroke: '#c9ced8', 'stroke-width': 2.2 }) + p('M' + x + ',' + n(y + 13) + ' C' + n(x + (q ? -70 : 70)) + ',' + n(y + 40) + ' ' + n(x + (q ? -80 : 90)) + ',' + n(y + 120) + ' ' + n(x + (q ? -60 : 64)) + ',' + n(y + 150), { stroke: escuro(cor, 0.35), 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }) + p('M' + x + ',' + n(y + 13) + ' C' + n(x + (q ? -70 : 70)) + ',' + n(y + 40) + ' ' + n(x + (q ? -80 : 90)) + ',' + n(y + 120) + ' ' + n(x + (q ? -60 : 64)) + ',' + n(y + 150), { stroke: holo, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
      var hx = x + (q ? -60 : 64), hy = y + 152;
      if (id === 'coleira-pata') {   // controle em forma de patinha na ponta da guia
        s += elip(hx, hy + 10, 14, 12, { fill: '#fbfaf7', stroke: escuro(cor, 0.35), 'stroke-width': 1.6 }) + elip(hx, hy + 12, 7, 6, { fill: holo });
        [-9, -3, 3, 9].forEach(function (dx, i) { s += circ(hx + dx, hy - 2 - (i === 1 || i === 2 ? 3 : 0), 3.4, { fill: holo, stroke: escuro(cor, 0.3), 'stroke-width': 0.8 }); });
      } else s += ret(hx - 8, hy - 6, 16, 12, { rx: 5, fill: holo, stroke: escuro(cor, 0.35), 'stroke-width': 1.4 });
      return s;
    }
    return s;
  }
  function pulsoAcess(c, a, g, id) {
    var m = g.pulso, s = '';
    var x = m[0], yy = m[1] - (g.corpo === 'q' ? 0 : 16), cs = id === 'pulseira-strass' ? ['#f4f8ff', '#dfe8f4'] : ['#f9b4d0', '#fde08a', '#a8e0f8', '#c8b0f4'];
    for (var i = 0; i < 7; i++) { var an = rad(200 + i * 22), bx = x + Math.cos(an) * 19, by = yy + Math.sin(an) * 6 + 6; s += circ(bx, by, id === 'pulseira-strass' ? 3 : 3.6, { fill: cs[i % cs.length], stroke: id === 'pulseira-strass' ? '#8aa0c0' : escuro(cs[i % cs.length], 0.3), 'stroke-width': 0.8 }) + (id === 'pulseira-strass' ? circ(bx - 0.8, by - 0.8, 1, { fill: '#ffffff' }) : ''); }
    return s;
  }
  /* ---------- asinhas (atrás de tudo) ---------- */
  function asasAcess(c, a, g, id, cor) {
    var q = g.corpo === 'q', s = '';
    var x = q ? g.costas[0] : 150, y = q ? g.costas[1] - 10 : g.t.y0 + 30, gw = c.lin([['#e8f4ff', 0.9], ['#f8d8f4', 0.85], ['#d8f0e8', 0.85]], 0, 0, 1, 1);
    [-1, 1].forEach(function (k) {
      if (q && k < 0) return;
      var dx = q ? -6 : 0;
      s += p('M' + n(x + dx) + ',' + n(y) + ' C' + n(x + k * 40) + ',' + n(y - 70) + ' ' + n(x + k * 98) + ',' + n(y - 60) + ' ' + n(x + k * 86) + ',' + n(y - 14) + ' C' + n(x + k * 80) + ',' + n(y + 8) + ' ' + n(x + k * 40) + ',' + n(y + 8) + ' ' + n(x + dx) + ',' + n(y) + 'Z', { fill: gw, stroke: '#b8a8d8', 'stroke-width': 1.6 });
      s += p('M' + n(x + dx) + ',' + n(y + 6) + ' C' + n(x + k * 40) + ',' + n(y + 20) + ' ' + n(x + k * 70) + ',' + n(y + 44) + ' ' + n(x + k * 52) + ',' + n(y + 58) + ' C' + n(x + k * 34) + ',' + n(y + 64) + ' ' + n(x + k * 14) + ',' + n(y + 34) + ' ' + n(x + dx) + ',' + n(y + 6) + 'Z', { fill: gw, stroke: '#b8a8d8', 'stroke-width': 1.6 });
      s += brilhos(x + k * 60, y - 26, 20, 16, 4);
    });
    return s;
  }

  /* ---------- bolsas e mochilas ---------- */
  // bolsas de levar na mão (em pé: na mão esquerda; 4 patas: na boquinha, ou do lado do corpo se a boca estiver ocupada)
  var BOLSA_MAO = { 'bolsa-coracao': 1, 'bolsa-bicho': 1, 'bolsa-palha': 1, 'lancheira': 1, 'sacola-presente': 1 };
  // mochilas de bichinho de pelúcia: a cabecinha espia por cima do ombro
  var MOCHILA_BICHO = { 'mochila-ursinho': 'ursinho', 'mochila-ovelha': 'ovelha', 'mochila-pug': 'pug', 'mochila-unicornio': 'unicornio', 'mochila-neve': 'neve', 'mochila-pinguim': 'pinguim', 'mochila-bicho': 'dino' };
  function metalico(c, cor) {
    if (cor === HOLO) return c.lin(['#f8c6f0', '#c6e8f8', '#e8f8c6', '#f8d8c6', '#d8c6f8'], 0, 0, 1, 1);
    return c.lin([claro(cor, 0.55), cor, claro(cor, 0.3), escuro(cor, 0.18)], 0, 0, 1, 1);
  }
  function alca(x1, y1, x2, y2, tipo, cor) {   // alça com uma barriguinha; tipo: 'fita' | 'corrente' | 'couro'
    var d = 'M' + n(x1) + ',' + n(y1) + ' Q' + n((x1 + x2) / 2 + 4) + ',' + n((y1 + y2) / 2 + 6) + ' ' + n(x2) + ',' + n(y2);
    if (tipo === 'corrente') return p(d, { stroke: '#a8862a', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }) + p(d, { stroke: '#f2d77a', 'stroke-width': 2.4, fill: 'none', 'stroke-dasharray': '3 1.6' });
    var base = tipo === 'couro' ? '#7a4a2a' : escuro(cor, 0.15);
    return p(d, { stroke: escuro(base, 0.45), 'stroke-width': 5.4, fill: 'none', 'stroke-linecap': 'round' }) + p(d, { stroke: base, 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round' });
  }
  function escala(s, x, y, e) { return s ? '<g transform="translate(' + n(x) + ' ' + n(y) + ') scale(' + e + ') translate(' + n(-x) + ' ' + n(-y) + ')">' + s + '</g>' : ''; }
  function tipoAlca(id) { return id === 'bolsa-metal' || id === 'bolsa-coracao' ? 'corrente' : id === 'bolsa-rena' ? 'couro' : 'fita'; }
  // bolsa de usar no corpo, com a boca (onde a alça prende) em (x, y)
  function bolsaCorpo(c, id, cor, x, y) {
    var s = '', ct = escuro(cor, 0.38);
    if (id === 'bolsa-tiracolo') {
      s += ret(x - 19, y, 38, 28, { rx: 9, fill: cor, stroke: ct, 'stroke-width': 1.8 });
      s += p('M' + n(x - 19) + ',' + n(y + 9) + ' Q' + n(x - 19) + ',' + n(y) + ' ' + n(x - 10) + ',' + n(y) + ' L' + n(x + 10) + ',' + n(y) + ' Q' + n(x + 19) + ',' + n(y) + ' ' + n(x + 19) + ',' + n(y + 9) + ' L' + n(x + 19) + ',' + n(y + 11) + ' Q' + x + ',' + n(y + 23) + ' ' + n(x - 19) + ',' + n(y + 11) + 'Z', { fill: escuro(cor, 0.1), stroke: ct, 'stroke-width': 1.6 });
      s += p(coracaoD(x, y + 15, 3.8), { fill: '#f2c14e', stroke: '#b8862a', 'stroke-width': 0.8 });
      return s + lin(x - 14, y + 24, x + 14, y + 24, { stroke: claro(cor, 0.5), 'stroke-width': 1, 'stroke-dasharray': '2 2' });
    }
    if (id === 'bolsa-ombro') {
      s += p('M' + n(x - 17) + ',' + n(y) + ' L' + n(x + 17) + ',' + n(y) + ' L' + n(x + 22) + ',' + n(y + 30) + ' Q' + x + ',' + n(y + 36) + ' ' + n(x - 22) + ',' + n(y + 30) + 'Z', { fill: cor, stroke: ct, 'stroke-width': 1.8, 'stroke-linejoin': 'round' });
      s += lin(x - 16, y + 5, x + 16, y + 5, { stroke: escuro(cor, 0.15), 'stroke-width': 3 });
      s += p('M' + n(x - 18) + ',' + n(y + 26) + ' Q' + x + ',' + n(y + 31) + ' ' + n(x + 18) + ',' + n(y + 26), { stroke: claro(cor, 0.5), 'stroke-width': 1, 'stroke-dasharray': '2 2', fill: 'none' });
      return s + lacoD(x + 7, y + 15, claro(cor, 0.45), 0.26);
    }
    if (id === 'bolsa-metal') {
      s += ret(x - 18, y, 36, 26, { rx: 11, fill: metalico(c, cor), stroke: escuro(cor, 0.3), 'stroke-width': 1.6 });
      s += p('M' + n(x - 18) + ',' + n(y + 10) + ' Q' + x + ',' + n(y + 16) + ' ' + n(x + 18) + ',' + n(y + 10), { stroke: escuro(cor, 0.25), 'stroke-width': 1.4, fill: 'none' });
      return s + circ(x, y + 13, 3, { fill: '#f2e2a0', stroke: '#b8962a', 'stroke-width': 0.8 }) + p(brilhoD(x - 9, y + 6, 3.4), { fill: '#ffffff', opacity: 0.9 });
    }
    if (id === 'bolsa-estrela') {
      s += p(estrelaD(x, y + 19, 20, 11), { fill: cor, stroke: ct, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }) + p(estrelaD(x, y + 19, 15, 8), { fill: 'none', stroke: claro(cor, 0.55), 'stroke-width': 1, 'stroke-dasharray': '2 1.6' });
      return s + circ(x - 4, y + 19, 1.6, { fill: '#2a1e28' }) + circ(x + 4, y + 19, 1.6, { fill: '#2a1e28' }) + p('M' + n(x - 2) + ',' + n(y + 23) + ' q2,2 4,0', { stroke: '#2a1e28', 'stroke-width': 1.1, fill: 'none' }) + elip(x - 7, y + 23, 2.4, 1.4, { fill: '#ff8fb3', opacity: 0.7 }) + elip(x + 7, y + 23, 2.4, 1.4, { fill: '#ff8fb3', opacity: 0.7 });
    }
    if (id === 'bolsa-morango') {
      s += p('M' + x + ',' + n(y + 5) + ' C' + n(x + 25) + ',' + n(y + 1) + ' ' + n(x + 22) + ',' + n(y + 26) + ' ' + x + ',' + n(y + 37) + ' C' + n(x - 22) + ',' + n(y + 26) + ' ' + n(x - 25) + ',' + n(y + 1) + ' ' + x + ',' + n(y + 5) + 'Z', { fill: '#ef4a5a', stroke: '#a82634', 'stroke-width': 1.8 });
      [[-9, 13], [0, 15], [9, 13], [-6, 22], [6, 22], [0, 29], [-12, 19], [12, 19]].forEach(function (k) { s += elip(x + k[0], y + k[1], 1.3, 2, { fill: '#ffe08a' }); });
      return s + p(estrelaD(x, y + 5, 12, 5, 6), { fill: '#5cb85c', stroke: '#2f7a2e', 'stroke-width': 1, 'stroke-linejoin': 'round' }) + elip(x - 8, y + 12, 3, 5, { fill: '#ffffff', opacity: 0.35 });
    }
    if (id === 'bolsa-paete') {
      s += ret(x - 18, y, 36, 26, { rx: 12, fill: cor, stroke: escuro(cor, 0.35), 'stroke-width': 1.6 }) + ret(x - 18, y, 36, 26, { rx: 12, fill: c.estampa('lantejoula', cor) });
      return s + circ(x - 4, y - 1, 3, { fill: '#f2d77a', stroke: '#a8862a', 'stroke-width': 0.8 }) + circ(x + 4, y - 1, 3, { fill: '#f2d77a', stroke: '#a8862a', 'stroke-width': 0.8 });
    }
    if (id === 'bolsa-rena') {
      [-1, 1].forEach(function (k) {   // chifrinhos
        var ax = x + k * 7, d = 'M' + n(ax) + ',' + n(y + 6) + ' q' + n(k * -1) + ',-10 ' + n(k * 5) + ',-16 M' + n(ax + k * 3) + ',' + n(y - 4) + ' q' + n(k * 5) + ',-2 ' + n(k * 8) + ',-7';
        s += p(d, { stroke: '#8a6a3a', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }) + p(d, { stroke: '#e2c48e', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
        s += elip(x + k * 16, y + 9, 7, 4, { fill: '#9a6a44', stroke: '#5e3c22', 'stroke-width': 1.2, transform: 'rotate(' + (k * 25) + ' ' + n(x + k * 16) + ' ' + n(y + 9) + ')' });
      });
      s += circ(x, y + 18, 16, { fill: '#9a6a44', stroke: '#5e3c22', 'stroke-width': 1.8 }) + circ(x, y + 18, 16, { fill: c.pelo('#5e3c22', true) });
      return s + elip(x, y + 25, 9, 7, { fill: '#c9a27c' }) + circ(x, y + 22, 4.4, { fill: '#e5404f', stroke: '#a82634', 'stroke-width': 0.8 }) + circ(x - 1.4, y + 20.6, 1.2, { fill: '#ffffff' }) + circ(x - 6, y + 14, 2.2, { fill: '#2a1e28' }) + circ(x + 6, y + 14, 2.2, { fill: '#2a1e28' });
    }
    return s;
  }
  // bolsa de mão: a alça sai da mãozinha em (x, y) e a bolsa fica pendurada embaixo
  function bolsaMao(c, id, cor, x, y) {
    var s = '';
    if (id === 'bolsa-coracao') {
      s += alca(x - 9, y + 12, x, y - 1, 'corrente') + alca(x + 9, y + 12, x, y - 1, 'corrente');
      return s + p(coracaoD(x, y + 24, 15), { fill: metalico(c, cor), stroke: escuro(cor, 0.35), 'stroke-width': 1.6 }) + p(coracaoD(x, y + 24, 15), { fill: c.estampa('glitter', cor) }) + p(brilhoD(x - 6, y + 19, 3.4), { fill: '#ffffff' });
    }
    if (id === 'bolsa-bicho') return p('M' + n(x - 10) + ',' + n(y + 12) + ' Q' + x + ',' + n(y - 6) + ' ' + n(x + 10) + ',' + n(y + 12), { stroke: '#d0809a', 'stroke-width': 2.6, fill: 'none' }) + p('M' + n(x - 15) + ',' + n(y + 20) + ' l2,-12 8,8 z M' + n(x + 15) + ',' + n(y + 20) + ' l-2,-12 -8,8 z', { fill: '#fbd1e0', stroke: '#d0809a', 'stroke-width': 1.2 }) + circ(x, y + 30, 16, { fill: '#fbd1e0', stroke: '#d0809a', 'stroke-width': 1.6 }) + circ(x - 6, y + 28, 2, { fill: '#2a1e28' }) + circ(x + 6, y + 28, 2, { fill: '#2a1e28' }) + p('M' + n(x - 2) + ',' + n(y + 33) + ' q2,2 4,0', { stroke: '#2a1e28', 'stroke-width': 1.2, fill: 'none' }) + elip(x - 10, y + 34, 3, 2, { fill: '#ff8fb3', opacity: 0.7 }) + elip(x + 10, y + 34, 3, 2, { fill: '#ff8fb3', opacity: 0.7 });
    if (id === 'bolsa-palha') {
      [-1, 1].forEach(function (k) { s += p('M' + n(x + k * 13) + ',' + n(y + 16) + ' Q' + n(x + k * 6) + ',' + n(y - 6) + ' ' + n(x - k * 2) + ',' + n(y + 1), { stroke: '#a8803e', 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round' }); });
      var d = 'M' + n(x - 21) + ',' + n(y + 14) + ' L' + n(x + 21) + ',' + n(y + 14) + ' L' + n(x + 16) + ',' + n(y + 42) + ' Q' + x + ',' + n(y + 46) + ' ' + n(x - 16) + ',' + n(y + 42) + 'Z';
      s += p(d, { fill: '#ecd096', stroke: '#a8803e', 'stroke-width': 1.8, 'stroke-linejoin': 'round' });
      for (var i = 0; i < 4; i++) s += lin(x - 19 + i, y + 22 + i * 6, x + 19 - i, y + 22 + i * 6, { stroke: '#c9a25e', 'stroke-width': 1.4, 'stroke-dasharray': '3 2' });
      s += ret(x - 21, y + 15, 42, 5, { fill: cor, stroke: escuro(cor, 0.3), 'stroke-width': 0.8 }) + lacoD(x + 9, y + 18, cor, 0.3);
      for (var pt = 0; pt < 5; pt++) { var an = rad(pt * 72); s += circ(x - 9 + Math.cos(an) * 3.4, y + 32 + Math.sin(an) * 3.4, 3, { fill: '#ffffff', stroke: '#e0d0b0', 'stroke-width': 0.5 }); }
      return s + circ(x - 9, y + 32, 2.2, { fill: '#ffd447' });
    }
    if (id === 'lancheira') {
      s += p('M' + n(x - 9) + ',' + n(y + 13) + ' L' + n(x - 8) + ',' + n(y + 1) + ' L' + n(x + 8) + ',' + n(y + 1) + ' L' + n(x + 9) + ',' + n(y + 13), { stroke: escuro(cor, 0.4), 'stroke-width': 4.4, fill: 'none', 'stroke-linejoin': 'round' });
      s += ret(x - 20, y + 12, 40, 30, { rx: 6, fill: cor, stroke: escuro(cor, 0.4), 'stroke-width': 1.8 }) + ret(x - 20, y + 22, 40, 9, { fill: '#fbfaf7', opacity: 0.9 });
      s += ret(x - 4, y + 10, 8, 6, { rx: 2, fill: '#d8dbe2', stroke: '#8a909c', 'stroke-width': 0.8 }) + p(estrelaD(x - 9, y + 26.5, 4, 1.8), { fill: '#ffd447' }) + p(coracaoD(x + 9, y + 26.5, 3.2), { fill: '#f06292' });
      return s + elip(x - 12, y + 17, 4, 2, { fill: '#ffffff', opacity: 0.4 });
    }
    if (id === 'sacola-presente') {
      var rosa = cor !== '#ff9a4d', alcaC = rosa ? '#ff3d8b' : '#c85a1a';
      [-1, 1].forEach(function (k) { s += p('M' + n(x + k * 8) + ',' + n(y + 15) + ' Q' + n(x + k * 7) + ',' + n(y - 4) + ' ' + x + ',' + n(y) + '', { stroke: alcaC, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }); });
      s += p('M' + n(x - 12) + ',' + n(y + 15) + ' L' + n(x - 4) + ',' + n(y + 5) + ' L' + n(x + 1) + ',' + n(y + 14) + ' L' + n(x + 7) + ',' + n(y + 4) + ' L' + n(x + 12) + ',' + n(y + 15) + 'Z', { fill: '#fdf6fb', stroke: '#d8c8d8', 'stroke-width': 0.8 });
      s += ret(x - 17, y + 14, 34, 34, { rx: 2, fill: rosa ? '#fbd5e6' : cor, stroke: escuro(cor, 0.35), 'stroke-width': 1.6 });
      if (rosa) ['#f9707f', '#ffb04d', '#ffe45c', '#6fd68a', '#5fb0f0', '#b07be6'].forEach(function (cc, i) { s += ret(x - 15 + i * 5.3, y + 16, 3, 30, { fill: cc, opacity: 0.9 }); });
      else [[-7, 25], [7, 38]].forEach(function (b, i) { var bx = x + b[0], by = y + b[1]; s += circ(bx, by, 6, { fill: i ? '#f7b6cf' : '#f2d8a8', stroke: '#8a5a3c', 'stroke-width': 0.8 }) + circ(bx - 4.5, by - 5, 2.2, { fill: i ? '#f7b6cf' : '#f2d8a8', stroke: '#8a5a3c', 'stroke-width': 0.8 }) + circ(bx + 4.5, by - 5, 2.2, { fill: i ? '#f7b6cf' : '#f2d8a8', stroke: '#8a5a3c', 'stroke-width': 0.8 }) + circ(bx - 2, by, 0.9, { fill: '#2a1e28' }) + circ(bx + 2, by, 0.9, { fill: '#2a1e28' }); });
      return s;
    }
    return s;
  }
  function pochete(c, g) {
    if (g.corpo === 'q') { var b = g.b; return ret(b.x - 30, b.y + b.ry * 0.2, 46, 22, { rx: 9, fill: '#8a9a5a', stroke: '#4a5a2a', 'stroke-width': 1.6 }) + ret(b.x - 30, b.y + b.ry * 0.2, 46, 22, { rx: 9, fill: c.estampa('camuflado', '#8a9a5a') }); }
    var t = g.t, y = t.y1 - 24, s = '';
    s += p('M' + n(150 - t.wb - 2) + ',' + n(y - 10) + ' Q150,' + n(y + 2) + ' ' + n(150 + t.wb + 2) + ',' + n(y - 10), { stroke: '#3a3226', 'stroke-width': 5, fill: 'none' });
    s += ret(124, y - 14, 52, 26, { rx: 10, fill: '#8a9a5a', stroke: '#4a5a2a', 'stroke-width': 1.6 }) + ret(124, y - 14, 52, 26, { rx: 10, fill: c.estampa('camuflado', '#8a9a5a') }) + lin(128, y - 6, 172, y - 6, { stroke: '#2e2a26', 'stroke-width': 1.6 }) + circ(170, y - 6, 2.2, { fill: '#d8dbe2' });
    return s;
  }
  // cabecinha de pelúcia (mochila de bichinho): centro (x, y), raio r
  function cabecinha(c, tipo, x, y, r, cor) {
    var cf = { ursinho: '#d9b48a', ovelha: '#f3e2cf', pug: '#e6cfa9', unicornio: '#fbe3ee', neve: '#fbfaf7', pinguim: '#2e2a33', dino: cor }[tipo] || '#d9b48a';
    var ct = tipo === 'pinguim' ? '#16121a' : tipo === 'neve' ? '#a8b4c8' : escuro(cf, 0.42), s = '', k;
    if (tipo === 'ursinho') [-1, 1].forEach(function (k) { s += circ(x + k * r * 0.72, y - r * 0.7, r * 0.36, { fill: cf, stroke: ct, 'stroke-width': 1.4 }) + circ(x + k * r * 0.72, y - r * 0.7, r * 0.18, { fill: '#f3d6c0' }); });
    if (tipo === 'ovelha') {
      [-1, 1].forEach(function (k) { s += elip(x + k * r * 1.02, y - r * 0.05, r * 0.36, r * 0.16, { fill: '#e2c6b0', stroke: ct, 'stroke-width': 1 }); });
      for (k = 0; k < 9; k++) { var an = rad(190 + k * 20); s += circ(x + Math.cos(an) * r * 0.9, y + Math.sin(an) * r * 0.9, r * 0.34, { fill: '#fffaf0', stroke: '#d8cbb8', 'stroke-width': 1.1 }); }
    }
    if (tipo === 'unicornio') {
      ['#f9a8c4', '#cdb0f4', '#a8d0f8', '#ffd08a'].forEach(function (cc, i) { s += circ(x - r * 0.86 + i * 2, y - r * 0.5 + i * r * 0.36, r * 0.3, { fill: cc, stroke: escuro(cc, 0.25), 'stroke-width': 1 }); });
      [-1, 1].forEach(function (k) { s += p('M' + n(x + k * r * 0.3) + ',' + n(y - r * 0.85) + ' L' + n(x + k * r * 0.62) + ',' + n(y - r * 1.25) + ' L' + n(x + k * r * 0.74) + ',' + n(y - r * 0.6) + 'Z', { fill: cf, stroke: ct, 'stroke-width': 1.2, 'stroke-linejoin': 'round' }); });
    }
    if (tipo === 'dino') for (k = -1; k <= 1; k++) { var ax = x + k * r * 0.5, ay = y - r * (k ? 0.86 : 1) + 2; s += p('M' + n(ax - r * 0.22) + ',' + n(ay + 2) + ' L' + n(ax) + ',' + n(ay - r * 0.42) + ' L' + n(ax + r * 0.22) + ',' + n(ay + 2) + 'Z', { fill: escuro(cf, 0.2), stroke: ct, 'stroke-width': 1.2, 'stroke-linejoin': 'round' }); }
    s += circ(x, y, r, { fill: cf, stroke: ct, 'stroke-width': 1.6 });
    if (tipo === 'ursinho' || tipo === 'ovelha' || tipo === 'pug') s += circ(x, y, r, { fill: c.pelo(escuro(cf, 0.5), true) });
    if (tipo === 'pinguim') s += p(coracaoD(x, y + r * 0.12, r * 0.66), { fill: '#fbfaf7' }) + p('M' + n(x - r * 0.16) + ',' + n(y + r * 0.22) + ' L' + n(x + r * 0.16) + ',' + n(y + r * 0.22) + ' L' + x + ',' + n(y + r * 0.42) + 'Z', { fill: '#ffa53a', stroke: '#c86a10', 'stroke-width': 0.8 });
    if (tipo === 'pug') {
      s += elip(x, y + r * 0.36, r * 0.48, r * 0.34, { fill: '#5a4a42' });
      [-1, 1].forEach(function (k) { s += p('M' + n(x + k * r * 0.5) + ',' + n(y - r * 0.82) + ' Q' + n(x + k * r * 1.15) + ',' + n(y - r * 0.8) + ' ' + n(x + k * r * 1.02) + ',' + n(y - r * 0.2) + ' Q' + n(x + k * r * 0.8) + ',' + n(y - r * 0.5) + ' ' + n(x + k * r * 0.5) + ',' + n(y - r * 0.82) + 'Z', { fill: '#5a4a42', stroke: '#3a2e2a', 'stroke-width': 1 }); });
    }
    if (tipo === 'unicornio') s += p('M' + n(x - r * 0.15) + ',' + n(y - r * 0.8) + ' L' + x + ',' + n(y - r * 1.5) + ' L' + n(x + r * 0.15) + ',' + n(y - r * 0.8) + 'Z', { fill: '#ffd86b', stroke: '#c9962a', 'stroke-width': 1.2, 'stroke-linejoin': 'round' });
    if (tipo === 'neve') {
      s += ret(x - r * 0.48, y - r * 1.55, r * 0.96, r * 0.8, { rx: 2, fill: '#2e2a33' }) + ret(x - r * 0.78, y - r * 0.86, r * 1.56, r * 0.18, { rx: 2, fill: '#2e2a33' }) + ret(x - r * 0.48, y - r * 0.98, r * 0.96, r * 0.14, { fill: '#e5404f' });
      s += p('M' + x + ',' + n(y + r * 0.08) + ' L' + n(x + r * 0.62) + ',' + n(y + r * 0.2) + ' L' + x + ',' + n(y + r * 0.32) + 'Z', { fill: '#ff9a4d', stroke: '#c86a10', 'stroke-width': 0.8 });
    }
    // olhinhos, bochechas, narizinho
    [-1, 1].forEach(function (k) { s += circ(x + k * r * 0.34, y - r * 0.08, r * 0.13, { fill: tipo === 'pinguim' ? '#2a1e28' : '#2a1e28' }) + circ(x + k * r * 0.34 - r * 0.04, y - r * 0.12, r * 0.05, { fill: '#ffffff' }); });
    if (tipo !== 'pinguim' && tipo !== 'neve') [-1, 1].forEach(function (k) { s += elip(x + k * r * 0.58, y + r * 0.28, r * 0.15, r * 0.09, { fill: '#ff8fb3', opacity: 0.6 }); });
    if (tipo === 'ursinho' || tipo === 'ovelha') s += elip(x, y + r * 0.22, r * 0.12, r * 0.09, { fill: '#4a3226' });
    if (tipo === 'pug') s += elip(x, y + r * 0.2, r * 0.14, r * 0.1, { fill: '#1e1614' });
    if (tipo === 'dino' || tipo === 'unicornio') s += p('M' + n(x - r * 0.14) + ',' + n(y + r * 0.26) + ' q' + n(r * 0.14) + ',' + n(r * 0.14) + ' ' + n(r * 0.28) + ',0', { stroke: '#2a1e28', 'stroke-width': 1.2, fill: 'none', 'stroke-linecap': 'round' });
    if (tipo === 'dino') s += elip(x - r * 0.42, y - r * 0.48, r * 0.24, r * 0.12, { fill: '#ffffff', opacity: 0.65, transform: 'rotate(-30 ' + n(x - r * 0.42) + ' ' + n(y - r * 0.48) + ')' });
    return s;
  }
  var COR_MOCHILA_BICHO = { ursinho: '#d9b48a', ovelha: '#f6efe2', pug: '#e6cfa9', unicornio: '#f8c6dc', neve: '#fbfaf7', pinguim: '#2e2a33' };
  function mochila(c, g, id, cor, camada) {
    var q = g.corpo === 'q', bicho = MOCHILA_BICHO[id], s = '';
    var mc = id === 'mochila-espaco' ? '#2f3f6e' : id === 'mochila-degrade' ? '#e0c8f0' : bicho && bicho !== 'dino' ? COR_MOCHILA_BICHO[bicho] : cor;
    var fundo = id === 'mochila-degrade' ? c.lin(['#f9b6d6', '#e0c8f4', '#a9d2f5'], 0, 0, 1, 1) : mc;
    var brilho = id === 'mochila-paete' ? c.estampa('lantejoula', cor) : id === 'mochila-glitter' ? c.estampa('glitter', cor) : null;
    var fita = bicho === 'unicornio' ? '#f06292' : bicho === 'pinguim' ? '#e5404f' : escuro(mc, 0.22);
    function enfeite(x0, y0, w, h) {   // o que aparece na parte visível da mochila
      var e = '';
      if (id === 'mochila-espaco') e += circ(x0 + 8, y0 + 22, 5, { fill: '#ffb04d' }) + elip(x0 + 8, y0 + 22, 9, 2.2, { fill: 'none', stroke: '#ffe27a', 'stroke-width': 1.2 }) + circ(x0 + w - 8, y0 + 34, 4.4, { fill: '#6fd68a' }) + p(estrelaD(x0 + 7, y0 + 50, 3.4, 1.4), { fill: '#fff6c8' }) + p(estrelaD(x0 + w - 7, y0 + 14, 3.4, 1.4), { fill: '#fff6c8' }) + circ(x0 + w - 9, y0 + 60, 3.6, { fill: '#f9a8c4' });
      if (id === 'mochila-degrade' || id === 'mochila-bicho') e += elip(x0 + 9, y0 + 16, 3, 9, { fill: '#ffffff', opacity: 0.55 }) + elip(x0 + w - 9, y0 + 16, 3, 9, { fill: '#ffffff', opacity: 0.55 });
      return e;
    }
    function orelhas(x1, x2, y) {   // orelhinhas de coelho em pé nos cantos de cima
      var e = '';
      [[x1, -1], [x2, 1]].forEach(function (o) { var ox = o[0], k = o[1]; e += '<g transform="rotate(' + (k * 16) + ' ' + n(ox) + ' ' + n(y) + ')">' + elip(ox, y - 16, 7, 19, { fill: mc, stroke: escuro(mc, 0.38), 'stroke-width': 1.6 }) + elip(ox, y - 15, 3.4, 13, { fill: '#f8c6d6' }) + '</g>'; });
      return e;
    }
    if (q) {
      if (camada !== 'frente') return '';
      var bx = g.costas[0], by = g.costas[1];
      if (bicho) return lin(bx - 16, by + 12, bx - 24, by + 46, { stroke: fita, 'stroke-width': 6, 'stroke-linecap': 'round' }) + cabecinha(c, bicho, bx, by - 2, 24, cor);
      if (id === 'mochila-orelhas') s += orelhas(bx - 20, bx + 20, by - 18);
      s += ret(bx - 30, by - 22, 60, 40, { rx: 14, fill: fundo, stroke: escuro(mc, 0.35), 'stroke-width': 2 }) + (brilho ? ret(bx - 30, by - 22, 60, 40, { rx: 14, fill: brilho }) : '') + enfeite(bx - 30, by - 28, 60, 40);
      s += ret(bx - 20, by - 6, 40, 18, { rx: 7, fill: id === 'mochila-espaco' ? '#3f5290' : escuro(mc, 0.1), stroke: escuro(mc, 0.35), 'stroke-width': 1.4, opacity: brilho ? 0.85 : 1 }) + lin(bx - 26, by + 18, bx - 26, by + 50, { stroke: fita, 'stroke-width': 6 });
      return s;
    }
    var t = g.t;
    if (camada === 'tras') {   // a mochila aparece por trás, dos lados (e a cabecinha do bichinho espia por cima do ombro)
      var x0 = 150 - t.wb - 12, w = (t.wb + 12) * 2, y0 = t.y0 + 14;
      if (id === 'mochila-orelhas') s += orelhas(x0 + 14, x0 + w - 14, y0 + 6);
      s += ret(x0, y0, w, 86, { rx: 22, fill: fundo, stroke: escuro(mc, 0.35), 'stroke-width': 2 }) + (brilho ? ret(x0, y0, w, 86, { rx: 22, fill: brilho }) : '') + enfeite(x0, y0, w, 86);
      if (bicho) s += cabecinha(c, bicho, 150 + t.wb + 8, t.y0 - 8, 24, cor);
      return s;
    }
    if (camada === 'frente') [-1, 1].forEach(function (k) { s += p('M' + n(150 + k * (t.wt - 4)) + ',' + n(t.y0 + 2) + ' Q' + n(150 + k * (t.wt + 2)) + ',' + n(t.y0 + 40) + ' ' + n(150 + k * (t.wb - 4)) + ',' + n(t.y0 + 74), { stroke: fita, 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }); });
    return s;
  }
  // camadas: 'tras' (atrás do corpo), 'frente' (no corpo, embaixo dos braços), 'cima' (por cima dos braços),
  // 'mao' (na mão esquerda, dentro do braço), 'boca' (4 patas: depois da cabeça)
  function bolsaAcess(c, a, g, id, cor, camada) {
    var q = g.corpo === 'q', t = g.t, s = '', tipo = tipoAlca(id);
    if (id === 'pochete') return camada === 'frente' ? pochete(c, g) : '';
    if (id.indexOf('mochila') === 0) return mochila(c, g, id, cor, camada);
    var naMao = BOLSA_MAO[id];
    if (q) {
      if (naMao && !(a.acess && a.acess.mao)) return camada === 'boca' ? bolsaMao(c, id, cor, g.maoItem[0], g.maoItem[1] - 14) : '';
      if (camada !== 'frente') return '';
      var b = g.b, bx = b.x - 4, by = b.y - 6;
      var costa = function (x) { return b.y - b.ry * Math.sqrt(Math.max(0, 1 - Math.pow((x - b.x) / b.rx, 2))) + 5; };
      var ya = naMao ? by - 10 : by + 2, dx = naMao ? 7 : 14;
      s += alca(bx - dx, ya, bx - 30, costa(bx - 30), tipo, cor) + alca(bx + dx, ya, bx + 28, costa(bx + 28), tipo, cor);
      return s + (naMao ? bolsaMao(c, id, cor, bx, by - 14) : bolsaCorpo(c, id, cor, bx, by));
    }
    if (naMao) return camada === 'mao' ? escala(bolsaMao(c, id, cor, g.mao[0][0], g.mao[0][1] + (g.pendurada ? -4 : 4)), g.mao[0][0], g.mao[0][1], 1.2) : '';
    var ombro = id === 'bolsa-ombro', x = ombro ? 150 + t.wb - 14 : 178, y = ombro ? t.y1 - 34 : t.y1 - 46;
    if (camada === 'frente') {
      if (ombro) return alca(150 + t.wt - 12, t.y0 + 2, x - 13, y + 2, tipo, cor) + alca(150 + t.wt - 4, t.y0 + 6, x + 13, y + 2, tipo, cor);
      return alca(150 - t.wt + 4, t.y0 + 4, x + 15, y + 3, tipo, cor) + alca(x - 18, y + 4, x - 14, y + 2, tipo, cor);
    }
    return camada === 'cima' ? escala(bolsaCorpo(c, id, cor, x, y), x, y, 1.3) : '';
  }
  function maoAcess(c, a, g, id) {
    if (g.pendurada) return '';
    var m = g.maoItem, x = m[0], y = m[1], s = '', q = g.corpo === 'q';
    if (id === 'varinha') {
      s += lin(x - 2, y + 6, x + 22, y - 54, { stroke: '#b07be6', 'stroke-width': 4.5, 'stroke-linecap': 'round' }) + p(estrelaD(x + 24, y - 60, 15, 7), { fill: '#ffd447', stroke: '#c9962a', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }) + p(brilhoD(x + 40, y - 74, 5), { fill: '#fff8c8', 'class': 'ma-brilha ma-efeito' }) + p(brilhoD(x + 8, y - 76, 4), { fill: '#ffffff', 'class': 'ma-brilha ma-efeito' });
      return s;
    }
    if (id === 'balao') {
      var bx = q ? x - 40 : x + 34, by = q ? 20 : 28;
      // barbante da mão até a pontinha do balão (4 patas: passa por fora da cabeça)
      var fio = q ? ' C' + n(x - 68) + ',' + n(y - 6) + ' ' + n(x - 78) + ',' + n(y - 116) + ' ' + bx + ',' + n(by + 22) : ' C' + n(x + (bx - x) * 0.3) + ',' + n(y - 60) + ' ' + n(bx - 10) + ',' + n(by + 80) + ' ' + bx + ',' + n(by + 22);
      s += p('M' + x + ',' + n(y - 2) + fio, { stroke: '#8a809a', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' });
      s += p(coracaoD(bx, by, 26), { fill: '#f0507a', stroke: '#b82c58', 'stroke-width': 1.8 }) + elip(bx - 10, by - 6, 5, 8, { fill: '#ffffff', opacity: 0.45, transform: 'rotate(-25 ' + n(bx - 10) + ' ' + n(by - 6) + ')' });
      return s;
    }
    if (id === 'chaveiro') return circ(x, y + 8, 6, { fill: 'none', stroke: '#c9ced8', 'stroke-width': 2.2 }) + lin(x, y + 14, x, y + 22, { stroke: '#c9ced8', 'stroke-width': 1.6 }) + p(estrelaD(x, y + 31, 10, 5), { fill: '#ffd447', stroke: '#c9962a', 'stroke-width': 1.4 }) + circ(x - 2, y + 30, 1.2, { fill: '#2a1e28' }) + circ(x + 2.5, y + 30, 1.2, { fill: '#2a1e28' });
    return s;
  }
  // mini pelúcia (filhotinho da mesma espécie, ou o ursinho de bolso)
  function miniPelucia(c, a, g, id) {
    var x = g.colo[0], y = g.colo[1], base = id === 'mini-urso' ? 'urso' : a.base;
    var mini = { base: base, corpo: 'pe', pelo: id === 'mini-urso' ? 'creme' : a.pelo, olhos: a.olhos, estiloOlho: 'brilho', bochecha: 'rosa', coracao: a.coracao, roupa: 'nenhuma', acess: {}, fofura: 70 };
    var c2 = new Ctx(c.id + 'm'), e = g.corpo === 'q' ? 0.3 : 0.34, inner = desenhar(c2, mini, { vista: 'inteiro' });
    c.defs.push(c2.defs.join(''));
    return '<g transform="translate(' + n(x - 150 * e) + ' ' + n(y - 236 * e) + ') scale(' + e + ')">' + inner + '</g>';
  }
  function abracadinho(c, a, g, id) {   // unicorninho que abraça o braço ou a perna
    var alvo, q = g.corpo === 'q';
    if (q) alvo = id === 'abracadinho-braco' ? g.pernas[2] : g.pernas[3];
    else alvo = id === 'abracadinho-braco' ? [g.omb[0], g.mao[0]] : [g.qua[1], g.pe[1]];
    var x = (alvo[0][0] + alvo[1][0]) / 2, y = (alvo[0][1] + alvo[1][1]) / 2 + (q ? -4 : 0), s = '';
    s += circ(x, y + 2, 15, { fill: '#fdeef6', stroke: '#d8a8c8', 'stroke-width': 1.6 });
    s += p('M' + n(x - 4) + ',' + n(y - 13) + ' L' + n(x - 1) + ',' + n(y - 27) + ' L' + n(x + 3) + ',' + n(y - 13) + 'Z', { fill: '#ffd86b', stroke: '#c9962a', 'stroke-width': 1 });
    s += circ(x - 10, y - 8, 5, { fill: '#a8d0f8' }) + circ(x - 13, y - 1, 4.6, { fill: '#cdb0f4' }) + circ(x + 9, y - 10, 4.4, { fill: '#f9a8c4' });
    s += circ(x - 4.5, y + 2, 2.2, { fill: '#2a1e28' }) + circ(x + 4.5, y + 2, 2.2, { fill: '#2a1e28' }) + circ(x - 3.8, y + 1.2, 0.8, { fill: '#ffffff' }) + circ(x + 5.2, y + 1.2, 0.8, { fill: '#ffffff' }) + elip(x - 9, y + 7, 3, 1.8, { fill: '#ff8fb3', opacity: 0.7 }) + elip(x + 9, y + 7, 3, 1.8, { fill: '#ff8fb3', opacity: 0.7 });
    // bracinhos que grudam em volta
    s += p('M' + n(x - 13) + ',' + n(y + 8) + ' q' + n(10) + ',14 26,0', { stroke: '#d8a8c8', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }) + p('M' + n(x - 13) + ',' + n(y + 8) + ' q' + n(10) + ',14 26,0', { stroke: '#fdeef6', 'stroke-width': 5.5, fill: 'none', 'stroke-linecap': 'round' });
    return s;
  }
  function muletas(g) {
    var s = '';
    [-1, 1].forEach(function (k) {
      var topo = [150 + k * (g.t.wt + 20), g.t.y0 + 26], baixo = [150 + k * (g.t.wb + 44), g.chao], cor = '#9aa6b8';
      s += lin(topo[0], topo[1], baixo[0], baixo[1], { stroke: escuro(cor, 0.35), 'stroke-width': 8, 'stroke-linecap': 'round' }) + lin(topo[0], topo[1], baixo[0], baixo[1], { stroke: cor, 'stroke-width': 5, 'stroke-linecap': 'round' });
      s += lin(topo[0] - 9, topo[1] - 2, topo[0] + 9, topo[1] + 2, { stroke: '#5a6578', 'stroke-width': 7, 'stroke-linecap': 'round' });
      var mx = topo[0] + (baixo[0] - topo[0]) * 0.4, my = topo[1] + (baixo[1] - topo[1]) * 0.4;
      s += lin(mx - 7, my, mx + 7, my, { stroke: '#5a6578', 'stroke-width': 6, 'stroke-linecap': 'round' }) + circ(baixo[0], baixo[1], 5, { fill: '#5a6578' });
    });
    return s;
  }
  function cadeira(g, frente) {   // cadeira de rodas (em pé = sentado) ou carrinho de rodas (4 patas)
    var s = '', cor = '#6aa8e8', aro = '#3a4a62';
    if (g.corpo === 'q') {
      var b = g.b, wx = b.x + b.rx * 0.55, wy = g.chao - 30;
      if (!frente) return circ(wx + 8, wy - 2, 30, { fill: 'none', stroke: '#9aa6b8', 'stroke-width': 5 });
      s += p('M' + n(b.x - 10) + ',' + n(b.y - 10) + ' L' + n(wx) + ',' + n(wy) + ' M' + n(b.x - 20) + ',' + n(b.y + 30) + ' L' + n(wx) + ',' + n(wy), { stroke: cor, 'stroke-width': 6, 'stroke-linecap': 'round' });
      s += circ(wx, wy, 30, { fill: 'none', stroke: aro, 'stroke-width': 7 }) + circ(wx, wy, 30, { fill: 'none', stroke: '#c9ced8', 'stroke-width': 2.4, 'stroke-dasharray': '4 4' }) + circ(wx, wy, 5, { fill: cor });
      for (var i = 0; i < 6; i++) { var an = rad(i * 60); s += lin(wx, wy, wx + Math.cos(an) * 27, wy + Math.sin(an) * 27, { stroke: '#c9ced8', 'stroke-width': 1.4 }); }
      s += ret(b.x - 40, b.y - b.ry * 0.2, 90, 10, { rx: 5, fill: cor, opacity: 0.9 });
      return s;
    }
    var t = g.t, y = 300;
    if (!frente) {
      s += ret(150 - t.wb - 6, t.y0 + 20, (t.wb + 6) * 2, 100, { rx: 12, fill: '#4a5a78', stroke: '#2e3a52', 'stroke-width': 2 });
      [-1, 1].forEach(function (k) { var wx = 150 + k * (t.wb + 22); s += circ(wx, y, 46, { fill: 'none', stroke: aro, 'stroke-width': 7 }) + circ(wx, y, 38, { fill: 'none', stroke: '#c9ced8', 'stroke-width': 2.2 }); for (var i = 0; i < 8; i++) { var an = rad(i * 45); s += lin(wx, y, wx + Math.cos(an) * 38, y + Math.sin(an) * 38, { stroke: '#c9ced8', 'stroke-width': 1.2 }); } s += circ(wx, y, 6, { fill: cor }); });
      return s;
    }
    s += ret(150 - t.wb - 4, 286, (t.wb + 4) * 2, 12, { rx: 6, fill: cor, stroke: escuro(cor, 0.4), 'stroke-width': 1.6 });
    [-1, 1].forEach(function (k) { var wx = 150 + k * (t.wb + 22); s += circ(wx, y, 46, { fill: 'none', stroke: aro, 'stroke-width': 7 }) + circ(wx, y, 46, { fill: 'none', stroke: '#8a96aa', 'stroke-width': 2, 'stroke-dasharray': '3 5' }) + circ(wx + k * 16, g.chao - 4, 8, { fill: aro }); });
    s += lin(118, 300, 118, 334, { stroke: cor, 'stroke-width': 5 }) + lin(182, 300, 182, 334, { stroke: cor, 'stroke-width': 5 }) + ret(102, 332, 96, 7, { rx: 3, fill: cor });
    return s;
  }
  function patch(c, id, x, y, r) {
    var s = circ(x, y, r, { fill: '#fffaf2', stroke: '#e0c8a8', 'stroke-width': 1.4 }) + circ(x, y, r - 2.5, { fill: 'none', stroke: '#e0a8c0', 'stroke-width': 1, 'stroke-dasharray': '2 1.6' });
    if (id.indexOf('letra-') === 0) return s + txt(x, y + r * 0.42, id.slice(6), { 'font-family': 'Fredoka, Arial Rounded MT Bold, sans-serif', 'font-weight': 700, 'font-size': n(r * 1.25), fill: '#e0559a', 'text-anchor': 'middle' });
    if (id === 'coracao') return s + p(coracaoD(x, y, r * 0.55), { fill: '#f06292' });
    if (id === 'estrela') return s + p(estrelaD(x, y, r * 0.7, r * 0.3), { fill: '#ffd447', stroke: '#c9962a', 'stroke-width': 0.8 });
    if (id === 'arco-iris') return s + ['#f9707f', '#ffc04d', '#6fd68a', '#5fb0f0'].map(function (cc, i) { return p('M' + n(x - r * 0.7 + i * 2.2) + ',' + n(y + 4) + ' a' + n(r * 0.7 - i * 2.2) + ',' + n(r * 0.7 - i * 2.2) + ' 0 0 1 ' + n((r * 0.7 - i * 2.2) * 2) + ',0', { stroke: cc, 'stroke-width': 2.2, fill: 'none' }); }).join('');
    if (id === 'capivara') return s + elip(x, y + 1, r * 0.62, r * 0.5, { fill: '#b38b6d' }) + circ(x - r * 0.42, y - r * 0.42, 2, { fill: '#b38b6d' }) + circ(x + r * 0.42, y - r * 0.42, 2, { fill: '#b38b6d' }) + ret(x - 4, y + 1, 8, 5, { rx: 2, fill: '#4a3226' }) + circ(x - 3.5, y - 2, 1, { fill: '#2a1e28' }) + circ(x + 3.5, y - 2, 1, { fill: '#2a1e28' });
    return s;
  }

  /* ---------- fofura: murchinha → no ponto → cheia demais ---------- */
  A.zonaFofura = function (f) { return f < 45 ? 'pouco' : f <= 85 ? 'ponto' : 'cheio'; };
  A.escalaFofura = function (f) {
    if (f == null) f = 70;
    if (f < 55) { var t = Math.max(0, f) / 55; return { sx: 0.84 + 0.16 * t, sy: 0.62 + 0.38 * t }; }
    if (f <= 85) return { sx: 1, sy: 1 };
    var u = Math.min(1, (f - 85) / 35); return { sx: 1 + 0.2 * u, sy: 1 + 0.03 * u };
  };
  function transformaFofura(g, f) { var e = A.escalaFofura(f); return 'translate(150 ' + g.chao + ') scale(' + n(e.sx * 100) / 100 + ' ' + n(e.sy * 100) / 100 + ') translate(-150 ' + (-g.chao) + ')'; }
  A.transformaFofura = transformaFofura;

  /* ---------- montagem: todas as camadas na ordem ---------- */
  function desenhar(c, a, op) {
    op = op || {};
    var pose = op.pose || null;
    if (pose === 'pendurada' && (a.base !== 'preguica' || (a.acess && (a.acess.apoio || a.acess.chao)))) pose = null;
    var g = A.geo(a.base, a.corpo, pose, a), T = tintas(c, a), e = a.acess || {}, s = '', q = g.corpo === 'q';
    if (a.base === 'raposa') { T.membro = null; T.pe = '#3a2a2e'; }
    if (a.base === 'pinguim') { T.pe = '#ffa53a'; T.sola = '#ffcf8a'; }
    if (a.base === 'panda') T.membro = T.m;
    var S = a.roupa && a.roupa !== 'nenhuma' ? especRoupa(a) : null;
    var capuzVestido = S && S.capuz;
    var corA = function (id) { return acessCor(a, id); };
    var lev = A.levantar(a);
    // sombra no chão
    s += elip(q ? g.b.x - 6 : 150, g.chao + 4, q ? 110 : 76, 10, { fill: '#3a1830', opacity: 0.16 });
    if (pose === 'pendurada') s += galho();
    if (e.chao === 'skate') s += skate(g, corA('skate'));
    var corpo = '';
    if (e.apoio === 'cadeira') corpo += cadeira(g, false);
    if (e.asas) corpo += asasAcess(c, a, g, e.asas, corA(e.asas));
    if (e.costas) corpo += bolsaAcess(c, a, g, e.costas, corA(e.costas), 'tras');
    if (S && S.capa && !q) corpo += p('M' + n(150 - g.t.wt - 10) + ',' + n(g.t.y0) + ' Q' + n(150 - g.t.wb - 40) + ',' + n(g.t.y1) + ' ' + n(150 - g.t.wb - 30) + ',' + n(g.t.y1 + 26) + ' L' + n(150 + g.t.wb + 30) + ',' + n(g.t.y1 + 26) + ' Q' + n(150 + g.t.wb + 40) + ',' + n(g.t.y1) + ' ' + n(150 + g.t.wt + 10) + ',' + n(g.t.y0) + 'Z', { fill: escuro(S.capa.cor, 0.12), stroke: escuro(S.capa.cor, 0.35), 'stroke-width': 2 });
    if (S && S.heroi) corpo += capaHeroi(g, S.heroi);
    var rabo = cauda(c, a, g, T);
    if (rabo) corpo += gr(rabo, { 'class': 'ma-rabo', 'data-px': q ? g.cauda[0] : 196, 'data-py': q ? g.cauda[1] : 276 });
    if (q) {
      var RQ = pernasRoupaQ(c, a, g, S);
      var roupaCorpo = roupaQ(c, a, g, S);
      var patas = [0, 1, 2, 3].map(function (i) {
        var extra = (RQ ? RQ(i) : '') + (e.pes ? sapato(c, e.pes, corA(e.pes), g.pernas[i][1][0], g.pernas[i][1][1], g, false, i) : '');
        if (i === 2 && e.pulso) extra += pulsoAcess(c, a, g, e.pulso);
        if ((i === 2 && e.abraco === 'abracadinho-braco') || (i === 3 && e.abraco === 'abracadinho-perna')) extra += abracadinho(c, a, g, e.abraco);
        return pataQ(c, a, g, T, i, extra);
      });
      // pescocinho de pelúcia atrás do corpo e da cabeça: liga os dois (girafa e pescoçudo têm o pescoço comprido deles)
      if (!g.pescocoLongo) corpo += capsula(g.cab.x + 16, g.cab.y + g.cab.ry * 0.45, g.b.x - g.b.rx * 0.5, g.b.y - g.b.ry * 0.25, 30, T.f, T.s);
      corpo += corpoQ(c, a, g, T, roupaCorpo, patas);
      if (e.costas) corpo += bolsaAcess(c, a, g, e.costas, corA(e.costas), 'frente');
      if (e.colo) corpo += miniPelucia(c, a, g, e.colo);
      if (e.apoio === 'cadeira') corpo += cadeira(g, true);
    } else {
      corpo += pernasPe(c, a, g, T);
      corpo += troncoPe(c, a, g, T);
      if (S) corpo += roupaPeCorpo(c, a, g, S);
      if (e.pes) for (var i = 0; i < 2; i++) corpo += sapato(c, e.pes, corA(e.pes), g.pe[i][0], g.pe[i][1], g, g.sentado, i);
      if (e.abraco === 'abracadinho-perna') corpo += abracadinho(c, a, g, e.abraco);
      if (e.costas) corpo += bolsaAcess(c, a, g, e.costas, corA(e.costas), 'frente');
      if (e.colo && !g.pendurada) corpo += miniPelucia(c, a, g, e.colo);
      var bracos = '';
      for (var k = 0; k < 2; k++) {
        var lado = bracoPe(c, a, g, T, k) + mangaLado(c, a, g, S, k);
        if (k === 0 && e.pulso) lado += pulsoAcess(c, a, g, e.pulso);
        if (k === 0 && e.abraco === 'abracadinho-braco') lado += abracadinho(c, a, g, e.abraco);
        if (k === 0 && e.costas) lado += bolsaAcess(c, a, g, e.costas, corA(e.costas), 'mao');
        if (k === 1 && e.mao) lado += maoAcess(c, a, g, e.mao);
        bracos += gr(lado, { 'class': 'ma-braco', 'data-k': k, 'data-px': g.omb[k][0], 'data-py': g.omb[k][1] });
      }
      if (g.pendurada) corpo = bracos + corpo; else corpo += bracos;
      if (e.costas) corpo += bolsaAcess(c, a, g, e.costas, corA(e.costas), 'cima');
      if (e.apoio === 'cadeira') corpo += cadeira(g, true);
    }
    // cabeça
    var cab = cabeca(c, a, g, T, capuz(c, a, g, S, false));
    cab += capuz(c, a, g, S, true);
    if (a.base === 'unicornio') cab += chifre(g);
    if (e.pescoco) cab += pescocoAcess(c, a, g, e.pescoco, corA(e.pescoco));
    if (S && S.heroi) cab += mascara(g, S.heroi);
    if (e.cabeca && !capuzVestido) cab += cabecaAcess(c, a, g, e.cabeca, corA(e.cabeca));
    if (e.laco && !(capuzVestido && /^(tiara-laco|chuquinhas|scrunchie|laco-topo)$/.test(e.laco))) cab += lacos(c, a, g, e.laco, corA(e.laco));
    if (e.olhos) cab += oculos(c, a, g, e.olhos, corA(e.olhos));
    var frente = '';
    if (e.mao && q) frente += maoAcess(c, a, g, e.mao);
    if (e.costas && q) frente += bolsaAcess(c, a, g, e.costas, corA(e.costas), 'boca');
    if (e.apoio === 'muletas' && !q) frente += muletas(g);
    var murcho = '';
    var f = op.fofura != null ? op.fofura : a.fofura;
    if (f != null && f < 45) {   // ruguinhas da pelúcia murcha
      var op2 = n((45 - f) / 45 * 0.7);
      murcho = gr(p(q ? 'M126,230 q14,8 30,0 M176,250 q14,8 30,0 M146,272 q10,6 22,0' : 'M122,236 q14,8 30,0 M150,260 q14,8 30,0 M126,280 q10,6 22,0 M124,104 q12,6 24,0 M156,92 q12,6 24,0', { stroke: T.s, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }), { opacity: op2 });
    }
    var conteudo = gr(gr(corpo + murcho, { 'class': op.anim ? 'ma-corpo' : null, 'data-px': q ? g.b.x : 150, 'data-py': g.chao }) + gr(cab, { 'class': op.anim ? 'ma-cabeca' : null, 'data-px': n(g.cab.x), 'data-py': n(q ? g.cab.y + g.cab.ry * 0.7 : g.t.y0 + 10) }) + frente, { 'class': op.anim ? 'ma-respira' : null, 'data-px': q ? g.b.x : 150, 'data-py': g.chao });
    var trans = (lev ? 'translate(0 ' + (-lev) + ') ' : '') + transformaFofura(g, f);
    return gr(s + gr(conteudo, { transform: trans, 'class': 'ma-fofura' }), { 'class': op.anim ? 'ma-viva' : null });
  }
  function galho() {
    return p('M10,10 Q150,-4 290,12', { stroke: '#7a5236', 'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round' }) + p('M10,10 Q150,-4 290,12', { stroke: '#9a6a46', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }) +
      [[40, 6, -30], [250, 8, 30], [210, 2, -10]].map(function (f) { return elip(f[0], f[1] + 12, 14, 7, { fill: '#6fbf6a', stroke: '#3c8a3a', 'stroke-width': 1.2, transform: 'rotate(' + f[2] + ' ' + f[0] + ' ' + (f[1] + 12) + ')' }); }).join('');
  }

  /* ---------- svg pronto ---------- */
  var VISTAS = { inteiro: [0, -24, 300, 396], cabeca: null };
  A.caixaVista = function (a, vista) {
    var g = A.geo(a.base, a.corpo, null, a);
    if (vista === 'cabeca') {
      var cb = g.cab, r = Math.max(cb.rx, cb.ry) + 40;
      return [n(cb.x - r), n(cb.y - r - (a.base === 'coelha' || a.base === 'unicornio' || a.base === 'girafa' ? 22 : 4)), n(r * 2), n(r * 2)];
    }
    return VISTAS.inteiro;
  };
  A.svg = function (a, op) {
    op = op || {};
    var c = new Ctx(op.id || 'ma'), corpo = desenhar(c, a, op), vb = op.viewBox || A.caixaVista(a, op.vista || 'inteiro');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb.join(' ') + '"' + (op.largura ? ' width="' + op.largura + '" height="' + op.altura + '"' : '') + ' class="ma-svg"' + (op.rotulo ? ' role="img" aria-label="' + esc(op.rotulo) + '"' : ' aria-hidden="true"') + '><defs>' + c.defs.join('') + '</defs>' + corpo + '</svg>';
  };
  // só o miolo (para encaixar dentro de outra cena): { defs, corpo }
  A.pedacos = function (a, op) { var c = new Ctx((op && op.id) || 'mp'); var corpo = desenhar(c, a, op || {}); return { defs: c.defs.join(''), corpo: corpo }; };

  /* ---------- miniaturas: roupa no cabide e acessório sozinho ---------- */
  A.cabide = function (a, roupaId, op) {
    op = op || {};
    var b = Object.assign({}, a, { base: 'urso', corpo: 'pe', roupa: roupaId, acess: {}, patch: null, pelo: 'branco' });
    var c = new Ctx(op.id || 'cb'), g = A.geo('urso', 'pe', null, b), S = roupaId === 'nenhuma' ? null : especRoupa(b), s = '';
    s += p('M150,150 q0,-14 10,-14 q10,0 10,8 q0,8 -10,12 L150,166', { stroke: '#8a7a6a', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
    s += p('M150,166 L92,192 Q86,196 92,198 L208,198 Q214,196 208,192 Z', { fill: '#c99a6a', stroke: '#8a6a4a', 'stroke-width': 2 });
    if (!S) return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="70 130 160 230" aria-hidden="true">' + s + txt(150, 270, '∅', { 'font-size': 60, fill: '#c8b8c8', 'text-anchor': 'middle', 'font-family': 'sans-serif' }) + '</svg>';
    var T = { s: '#00000000', f: 'none', cl: 'none', tex: 'none', vol: 'none' };
    void T;
    s += roupaPeCorpo(c, b, g, S) + mangasPe(c, b, g, S);
    var vb = '62 134 176 236';
    if (S.capuz) { s = capuz(c, b, g, S, false) + capuz(c, b, g, S, true) + s; vb = '50 40 200 330'; }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" aria-hidden="true"><defs>' + c.defs.join('') + '</defs>' + s + '</svg>';
  };
  A.miniAcess = function (a, id, op) {
    op = op || {};
    var it = D.acess[id], b = Object.assign({}, a, { acess: {}, roupa: 'nenhuma' });
    if (!it) return '';
    b.acess[it.caixa] = id;
    if (b.corpo === 'q' && it.so === 'pe') b.corpo = 'pe';
    var g = A.geo(b.base, b.corpo, null, b), cb = g.cab, vb;
    var caixa = it.caixa;
    if (caixa === 'laco' || caixa === 'cabeca') vb = [cb.x - cb.rx - 34, cb.y - cb.ry - 64, cb.rx * 2 + 68, cb.rx * 2 + 68];
    else if (caixa === 'olhos') vb = [cb.x - cb.rx, g.olhoY - cb.rx * 0.9, cb.rx * 2, cb.rx * 1.8];
    else if (caixa === 'pescoco') vb = id === 'coleira' ? [cb.x - 100, cb.y - 10, 220, 220] : [g.pescoco[0] - 70, g.pescoco[1] - 60, 140, 140];
    else vb = [0, -24, 300, 396];
    return A.svg(b, { id: op.id, viewBox: vb });
  };

  /* ---------- a caixinha-casinha de presente (com janelinha por onde o bichinho espia) ---------- */
  A.caixinha = function (op) {
    op = op || {};
    var c = new Ctx(op.id || 'cx'), s = '', cor = op.cor || '#f7a8c8', cor2 = op.cor2 || '#fff4e8', aberta = !!op.aberta;
    var corpoCx = 'M40,150 L260,150 L260,380 Q260,392 248,392 L52,392 Q40,392 40,380 Z';
    s += elip(150, 396, 124, 12, { fill: '#3a1830', opacity: 0.14 });
    s += p(corpoCx, { fill: cor, stroke: escuro(cor, 0.35), 'stroke-width': 3 }) + p(corpoCx, { fill: c.volume(), opacity: 0.6 });
    // listras de papel de presente
    for (var i = 0; i < 6; i++) s += ret(40 + i * 40, 150, 18, 242, { fill: '#ffffff', opacity: 0.18, 'clip-path': c.corte(corpoCx) });
    // janelinha
    s += '<g class="cx-janela">' + ret(92, 196, 116, 116, { rx: 58, fill: '#fffdf8', stroke: escuro(cor, 0.35), 'stroke-width': 3 }) + (op.miolo ? '<g clip-path="' + c.corte('M92,254 a58,58 0 1 1 116,0 a58,58 0 1 1 -116,0z') + '">' + op.miolo + '</g>' : '') +
      p('M92,254 a58,58 0 1 1 116,0 a58,58 0 1 1 -116,0z', { fill: 'none', stroke: '#ffffff', 'stroke-width': 10 }) + lin(150, 196, 150, 312, { stroke: '#ffffff', 'stroke-width': 4, opacity: 0.8 }) + lin(92, 254, 208, 254, { stroke: '#ffffff', 'stroke-width': 4, opacity: 0.8 }) + '</g>';
    // portinha e coração
    s += p(coracaoD(150, 352, 16), { fill: '#e8475f', stroke: '#b82c40', 'stroke-width': 2 }) + p(coracaoD(150, 352, 16), { fill: c.estampa('glitter', '#e8475f') });
    // telhado (abre!)
    var tel = '<g class="cx-telhado"' + (aberta ? ' transform="translate(0 -70) rotate(-14 150 150)"' : '') + '>' +
      p('M20,158 L150,40 L280,158 Q284,166 274,166 L26,166 Q16,166 20,158 Z', { fill: cor2, stroke: escuro(cor, 0.35), 'stroke-width': 3, 'stroke-linejoin': 'round' }) +
      p('M60,150 L150,68 L240,150', { fill: 'none', stroke: cor, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.6 }) +
      p('M118,74 Q150,22 182,74', { fill: 'none', stroke: escuro(cor, 0.2), 'stroke-width': 10, 'stroke-linecap': 'round' }) +
      lacoD(150, 152, '#f2c14e', 1.1) + '</g>';
    s += tel;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 410" aria-hidden="true" class="cx-svg"><defs>' + c.defs.join('') + '</defs>' + s + '</svg>';
  };

  /* ---------- a máquina de fofura (carrocinha de madeira com rodas e janela de flocos) ---------- */
  A.maquina = function (op) {
    op = op || {};
    var c = new Ctx(op.id || 'mq'), s = '', mad = '#b8743e', mad2 = '#8a5228', mad3 = '#d89a5e';
    s += elip(160, 396, 140, 12, { fill: '#3a1830', opacity: 0.14 });
    // corpo de madeira
    var corpoM = 'M40,70 Q40,52 58,52 L262,52 Q280,52 280,70 L280,330 Q280,342 268,342 L52,342 Q40,342 40,330 Z';
    s += p(corpoM, { fill: c.lin([mad3, mad, mad2], 0, 0, 0, 1), stroke: '#5a3418', 'stroke-width': 3 });
    for (var i = 0; i < 9; i++) s += lin(40, 80 + i * 30, 280, 80 + i * 30, { stroke: '#7a4420', 'stroke-width': 1, opacity: 0.25 });
    // telhadinho arredondado com friso
    s += p('M28,62 Q160,6 292,62 L292,74 Q160,22 28,74 Z', { fill: '#5fae6a', stroke: '#3a7a44', 'stroke-width': 2.4 });
    s += [60, 110, 160, 210, 260].map(function (x) { return circ(x, x === 160 ? 32 : x === 110 || x === 210 ? 40 : 56, 5, { fill: '#ffe27a', 'class': 'mq-luzinha' }); }).join('');
    // janela de vidro com flocos girando e luzes que trocam de cor
    s += ret(62, 84, 196, 130, { rx: 12, fill: '#5a3418' }) + ret(70, 92, 180, 114, { rx: 8, fill: '#f4f8fb' });
    var flocos = '', r = sorteio(5);
    for (var k = 0; k < 46; k++) { var fx = 78 + r() * 164, fy = 120 + r() * 82; flocos += circ(fx, fy, 6 + r() * 7, { fill: '#ffffff', stroke: '#dfe6ee', 'stroke-width': 1 }); }
    s += '<g clip-path="' + c.corte('M70,100 Q70,92 78,92 H242 Q250,92 250,100 V198 Q250,206 242,206 H78 Q70,206 70,198Z') + '">' + ret(70, 92, 180, 114, { fill: '#e8f0f6' }) +
      '<g class="mq-flocos">' + flocos + '</g>' + ret(70, 92, 180, 114, { fill: '#6fd68a', opacity: 0.32, 'class': 'mq-luz' }) + '</g>';
    s += p('M84,100 L120,100 L92,190 L80,190 Z', { fill: '#ffffff', opacity: 0.35 }) + ret(66, 88, 188, 122, { rx: 10, fill: 'none', stroke: '#d89a5e', 'stroke-width': 5 });
    // caixinha de coração com coraçõezinhos
    s += p(coracaoD(160, 262, 34), { fill: '#e8475f', stroke: '#9a2434', 'stroke-width': 3 }) + p(coracaoD(160, 264, 24), { fill: '#b82c40' });
    [[148, 258], [164, 254], [172, 268], [154, 272], [160, 262]].forEach(function (h) { s += p(coracaoD(h[0], h[1], 5), { fill: '#ff8fa8', stroke: '#e8475f', 'stroke-width': 0.6 }); });
    // bico (por onde sai a fofura) — do lado esquerdo
    s += ret(4, 232, 42, 20, { rx: 6, fill: '#c9ced8', stroke: '#6a707c', 'stroke-width': 2 }) + ret(0, 226, 12, 32, { rx: 4, fill: '#9aa0aa', stroke: '#6a707c', 'stroke-width': 2 });
    // rodas de carrocinha
    [92, 228].forEach(function (x) {
      s += circ(x, 344, 40, { fill: '#fff8ee', stroke: '#c8b8a0', 'stroke-width': 3 }) + circ(x, 344, 31, { fill: 'none', stroke: '#e8dcc8', 'stroke-width': 2 });
      for (var j = 0; j < 8; j++) { var an = rad(j * 45); s += lin(x, 344, x + Math.cos(an) * 31, 344 + Math.sin(an) * 31, { stroke: '#3a7a44', 'stroke-width': 2.4 }); }
      s += circ(x, 344, 8, { fill: '#e8475f', stroke: '#9a2434', 'stroke-width': 2 });
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" aria-hidden="true" class="mq-svg"><defs>' + c.defs.join('') + '</defs>' + s + '</svg>';
  };

  /* ---------- a certidão de nascimento (só dentro do jogo; pode virar PNG no aparelho) ---------- */
  // t: textos já no idioma { titulo, nome, especie, nasceu, data, padrinho, padrinhoNome, coracao, coracaoNome, fofura, fofuraNome, voz, vozNome, estrelas, rodape }
  A.certidao = function (a, t, op) {
    op = op || {};
    var c = new Ctx(op.id || 'ct'), W = 600, H = 820, s = '', F = 'Fredoka, Arial Rounded MT Bold, Trebuchet MS, sans-serif';
    s += ret(0, 0, W, H, { rx: 34, fill: '#fff7ee' });
    // moldura de babado (vieiras) e costura
    var bord = '';
    for (var x = 26; x < W - 20; x += 28) { bord += circ(x, 18, 14, { fill: '#f7b6cf' }) + circ(x, H - 18, 14, { fill: '#f7b6cf' }); }
    for (var y = 46; y < H - 40; y += 28) { bord += circ(18, y, 14, { fill: '#b9d8f5' }) + circ(W - 18, y, 14, { fill: '#b9d8f5' }); }
    s += bord + ret(26, 26, W - 52, H - 52, { rx: 24, fill: '#fffaf4', stroke: '#e8c8a8', 'stroke-width': 3 }) + ret(38, 38, W - 76, H - 76, { rx: 18, fill: 'none', stroke: '#e0a8c0', 'stroke-width': 2, 'stroke-dasharray': '6 5' });
    // título
    s += p('M110,70 Q300,40 490,70 L490,124 Q300,96 110,124 Z', { fill: '#f06292', stroke: '#c0406a', 'stroke-width': 2 }) + p('M110,70 L84,82 L96,98 L84,114 L110,124 Z M490,70 L516,82 L504,98 L516,114 L490,124 Z', { fill: '#d8507e' });
    s += txt(300, 103, t.titulo, { 'font-family': F, 'font-weight': 700, 'font-size': 26, fill: '#ffffff', 'text-anchor': 'middle' });
    // a pelúcia num medalhão
    s += circ(300, 290, 132, { fill: '#fdeef4', stroke: '#f7b6cf', 'stroke-width': 6 }) + circ(300, 290, 120, { fill: 'none', stroke: '#ffffff', 'stroke-width': 3, 'stroke-dasharray': '4 6' });
    var pd = A.pedacos(a, { id: (op.id || 'ct') + 'p', pose: op.pose });
    c.defs.push(pd.defs);
    s += '<g clip-path="' + c.corte('M168,290 a132,132 0 1 1 264,0 a132,132 0 1 1 -264,0z') + '"><g transform="translate(300 300) scale(0.64) translate(-150 -186)">' + pd.corpo + '</g></g>';
    s += p(estrelaD(140, 180, 14, 6), { fill: '#ffd447' }) + p(estrelaD(466, 200, 10, 4.4), { fill: '#ffd447' }) + p(coracaoD(460, 400, 12), { fill: '#f06292' }) + p(coracaoD(146, 404, 9), { fill: '#b9d8f5' });
    // nome
    s += txt(300, 466, t.nome, { 'font-family': F, 'font-weight': 700, 'font-size': 44, fill: '#5a3a6a', 'text-anchor': 'middle' });
    s += txt(300, 496, t.especie, { 'font-family': F, 'font-size': 20, fill: '#9a6a8a', 'text-anchor': 'middle' });
    // linhas
    var linhas = [[t.nasceu, t.data], [t.padrinho, t.padrinhoNome || '—'], [t.coracao, t.coracaoNome], [t.fofura, t.fofuraNome], [t.voz, t.vozNome]];
    if (t.filhote) linhas.push([t.filhote, t.filhoteNome]);
    linhas.forEach(function (l, i) {
      var yy = 548 + i * 36;
      s += txt(84, yy, l[0], { 'font-family': F, 'font-size': 19, fill: '#9a6a8a' }) + txt(516, yy, l[1], { 'font-family': F, 'font-weight': 700, 'font-size': 20, fill: '#4a3a5a', 'text-anchor': 'end' }) + lin(84, yy + 10, 516, yy + 10, { stroke: '#f0d8e4', 'stroke-width': 1.5, 'stroke-dasharray': '3 4' });
    });
    if (t.estrelas) s += txt(300, H - 74, t.estrelas, { 'font-family': F, 'font-weight': 700, 'font-size': 26, fill: '#e0a020', 'text-anchor': 'middle' });
    // carimbo de patinha
    var px = 500, py = H - 86;
    s += '<g opacity="0.75" transform="rotate(-12 ' + px + ' ' + py + ')">' + circ(px, py, 40, { fill: 'none', stroke: '#e0559a', 'stroke-width': 3 }) + elip(px, py + 8, 13, 11, { fill: '#e0559a' }) + circ(px - 13, py - 8, 5, { fill: '#e0559a' }) + circ(px - 4, py - 15, 5, { fill: '#e0559a' }) + circ(px + 6, py - 15, 5, { fill: '#e0559a' }) + circ(px + 14, py - 8, 5, { fill: '#e0559a' }) + '</g>';
    s += txt(84, H - 58, t.rodape, { 'font-family': F, 'font-size': 15, fill: '#b08aa0' });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '"' + (op.largura ? ' width="' + op.largura + '" height="' + op.altura + '"' : '') + ' class="ct-svg" role="img" aria-label="' + esc(t.titulo + ': ' + t.nome) + '"><defs>' + (op.fonte ? '<style>@font-face{font-family:Fredoka;src:url(' + op.fonte + ') format("woff2");font-weight:300 700}</style>' : '') + c.defs.join('') + '</defs>' + s + '</svg>';
  };

  /* ---------- vitrine (fundo da coleção): pedestais listrados, neve de algodão e luzinhas ---------- */
  A.vitrine = function (op) {
    op = op || {};
    var c = new Ctx(op.id || 'vt'), s = '', W = 400, H = op.alto ? 860 : 300;
    s += ret(0, 0, W, H, { fill: c.lin(['#7a2a3a', '#a83a4a', '#6a2232'], 0, 0, 0, 1) });
    // listras de bengalinha nas laterais e luzinhas de camarim douradas em volta
    for (var y0 = -20; y0 < H; y0 += 26) { s += p('M0,' + y0 + ' L14,' + (y0 + 12) + ' L14,' + (y0 + 24) + ' L0,' + (y0 + 12) + 'Z', { fill: '#ffffff', opacity: 0.85 }) + p('M' + W + ',' + y0 + ' L' + (W - 14) + ',' + (y0 + 12) + ' L' + (W - 14) + ',' + (y0 + 24) + ' L' + W + ',' + (y0 + 12) + 'Z', { fill: '#ffffff', opacity: 0.85 }); }
    for (var i = 0; i < 14; i++) s += circ(14 + i * 28, 8, 9, { fill: '#ffe9a8', opacity: 0.22 }) + circ(14 + i * 28, 8, 4.2, { fill: '#ffe9a8', 'class': 'vt-luz' });
    for (var j = 1; j < Math.floor(H / 34); j++) s += circ(22, 8 + j * 34, 3.6, { fill: '#ffe9a8', 'class': 'vt-luz' }) + circ(W - 22, 8 + j * 34, 3.6, { fill: '#ffe9a8', 'class': 'vt-luz' });
    var r = sorteio(2);
    for (var k = 0; k < (op.alto ? 90 : 40); k++) s += circ(34 + r() * 332, 26 + r() * (H - 90), 1.2 + r() * 2, { fill: '#ffffff', opacity: 0.65 });
    s += p('M0,' + (H - 50) + ' Q60,' + (H - 68) + ' 120,' + (H - 52) + ' Q200,' + (H - 74) + ' 280,' + (H - 54) + ' Q340,' + (H - 68) + ' 400,' + (H - 52) + ' L400,' + H + ' L0,' + H + 'Z', { fill: '#fbfaf7' });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' + c.defs.join('') + '</defs>' + s + '</svg>';
  };
  A.pedestal = function (op) {
    var c = new Ctx((op && op.id) || 'pd'), s = '';
    var d = 'M20,10 L180,10 L170,70 L30,70Z';
    s += p(d, { fill: '#ffffff', stroke: '#c8a8b0', 'stroke-width': 2 });
    for (var i = -6; i < 12; i++) s += p('M' + (i * 22) + ',70 L' + (i * 22 + 40) + ',10 L' + (i * 22 + 54) + ',10 L' + (i * 22 + 14) + ',70Z', { fill: '#e8475f', 'clip-path': c.corte(d) });
    s += elip(100, 10, 82, 10, { fill: '#fbfaf7', stroke: '#c8a8b0', 'stroke-width': 2 });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 76" aria-hidden="true"><defs>' + c.defs.join('') + '</defs>' + s + '</svg>';
  };

  raiz.AmiguinhoArte = A;
  if (typeof module === 'object' && module.exports) module.exports = A;
})(typeof window !== 'undefined' ? window : globalThis);
