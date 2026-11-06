/* Batalha Naval — os navios: tipos (nome PT/EN por tamanho) e o desenho de cada um, visto de cima, em SVG feito aqui
   (arte própria, nenhuma imagem de fora). Desenho deitado com a proa para a direita, 100 unidades por casa
   (comprimento 100 × tam, largura 100); em pé é o mesmo desenho girado 90° (proa para baixo).
   Tipo de cada navio: pelo tamanho e por qual é (o 1º ou o 2º daquele tamanho na frota):
     5 Porta-aviões · 4 Encouraçado, Cruzador · 3 Submarino, Fragata · 2 Destróier, Lancha-patrulha
   BNNavios.tipo(tams, i) → id do tipo do navio i da frota; BNNavios.daFrota(frota, navio) → id;
   BNNavios.svg(id, h) → <svg class="navio-svg"> (só elementos criados um a um: nada de innerHTML).
   Grupos que o CSS liga e desliga: .esteira (espuma), .oleo e .queimado (só no navio afundado). */
(function (raiz) {
  'use strict';
  var TIPOS = {
    porta: { pt: 'Porta-aviões', en: 'Aircraft carrier', tam: 5 },
    encouracado: { pt: 'Encouraçado', en: 'Battleship', tam: 4 },
    cruzador: { pt: 'Cruzador', en: 'Cruiser', tam: 4 },
    submarino: { pt: 'Submarino', en: 'Submarine', tam: 3 },
    fragata: { pt: 'Fragata', en: 'Frigate', tam: 3, fem: true },
    destroier: { pt: 'Destróier', en: 'Destroyer', tam: 2 },
    patrulha: { pt: 'Lancha-patrulha', en: 'Patrol boat', tam: 2, fem: true }
  };
  var POR_TAM = { 5: ['porta'], 4: ['encouracado', 'cruzador'], 3: ['submarino', 'fragata'], 2: ['destroier', 'patrulha'] };
  function porOrdem(tam, ord) { var l = POR_TAM[tam] || POR_TAM[2]; return l[Math.min(ord, l.length - 1)]; }
  function tipo(tams, i) { var ord = 0; for (var j = 0; j < i; j++) if (tams[j] === tams[i]) ord++; return porOrdem(tams[i], ord); }
  function daFrota(frota, nv) {
    for (var i = 0; i < (frota || []).length; i++) { var o = frota[i]; if (o && o.x === nv.x && o.y === nv.y && o.tam === nv.tam && o.h === nv.h) return tipo(frota.map(function (f) { return f.tam; }), i); }
    return porOrdem(nv.tam, 0);
  }

  if (typeof document === 'undefined') { var API0 = { TIPOS: TIPOS, POR_TAM: POR_TAM, tipo: tipo, daFrota: daFrota, porOrdem: porOrdem }; raiz.BNNavios = API0; if (typeof module !== 'undefined' && module.exports) module.exports = API0; return; }

  var NS = 'http://www.w3.org/2000/svg';
  function E(tag, at, pai) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (pai) pai.appendChild(e); return e; }
  function f(n) { return Math.round(n * 10) / 10; }
  function M(pts) { return 'M' + pts.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join(' L') + 'Z'; }

  // ---------- cores e texturas compartilhadas (um <svg> escondido com os gradientes, uma vez só) ----------
  var COR = { linha: '#1b242c', aco: '#8c99a5', super: 'url(#bnSuper)', escuro: '#2b343c', vidro: '#163246' };
  function defs() {
    if (document.getElementById('bnDefs')) return;
    var s = E('svg', { id: 'bnDefs', width: 0, height: 0, 'aria-hidden': 'true', focusable: 'false', style: 'position:absolute;width:0;height:0;overflow:hidden' });
    var d = E('defs', {}, s);
    function lin(id, stops, vert) { var g = E('linearGradient', { id: id, x1: 0, y1: 0, x2: vert ? 0 : 1, y2: vert ? 1 : 0 }, d); stops.forEach(function (st) { E('stop', { offset: st[0], 'stop-color': st[1], 'stop-opacity': st[2] == null ? 1 : st[2] }, g); }); }
    function rad(id, stops, cx, cy) { var g = E('radialGradient', { id: id, cx: cx || 0.5, cy: cy || 0.5, r: 0.6 }, d); stops.forEach(function (st) { E('stop', { offset: st[0], 'stop-color': st[1], 'stop-opacity': st[2] == null ? 1 : st[2] }, g); }); }
    lin('bnCasco', [[0, '#27313a'], [0.16, '#66737f'], [0.42, '#a9b5c0'], [0.55, '#b8c3cd'], [0.84, '#65717d'], [1, '#232c34']], true);
    lin('bnDeck', [[0, '#76838f'], [0.5, '#9aa6b1'], [1, '#727f8b']], true);
    lin('bnTeca', [[0, '#8a6a42'], [0.5, '#b9935e'], [1, '#85653f']], true);
    lin('bnSuper', [[0, '#eef2f5'], [0.55, '#c3ccd4'], [1, '#97a3ae']], true);
    lin('bnPista', [[0, '#30373e'], [0.5, '#454e57'], [1, '#2c3238']], true);
    lin('bnSub', [[0, '#06090c'], [0.28, '#26313b'], [0.5, '#46566a'], [0.72, '#232d37'], [1, '#05080b']], true);
    lin('bnCano', [[0, '#1c2329'], [0.4, '#6c7883'], [1, '#1c2329']], true);
    lin('bnEsteira', [[0, '#ffffff', 0], [0.55, '#e9f7ff', 0.5], [1, '#ffffff', 0.9]]);
    rad('bnTorre', [[0, '#d5dde4'], [0.55, '#8e9aa5'], [1, '#55606a']], 0.4, 0.38);
    rad('bnOleo', [[0, '#07090c', 0.6], [0.62, '#141622', 0.45], [0.8, '#3d2f6e', 0.28], [0.9, '#1f6a5a', 0.22], [1, '#0a0d12', 0]]);
    var tab = E('pattern', { id: 'bnTabuas', width: 46, height: 4.6, patternUnits: 'userSpaceOnUse' }, d);
    E('rect', { width: 46, height: 4.6, fill: 'none' }, tab);
    E('line', { x1: 0, y1: 4.3, x2: 46, y2: 4.3, stroke: '#5a3f22', 'stroke-opacity': 0.45, 'stroke-width': 0.7 }, tab);
    E('line', { x1: 30, y1: 0, x2: 30, y2: 4.3, stroke: '#5a3f22', 'stroke-opacity': 0.3, 'stroke-width': 0.6 }, tab);
    var ant = E('pattern', { id: 'bnAntider', width: 6, height: 6, patternUnits: 'userSpaceOnUse' }, d);
    E('circle', { cx: 3, cy: 3, r: 0.7, fill: '#000', 'fill-opacity': 0.12 }, ant);
    (document.body || document.documentElement).appendChild(s);
  }

  // ---------- peças de desenho ----------
  // casco: popa (x0) mais estreita, mais largo a 1/3, proa (x1) em ponta
  function casco(x0, x1, hw, proa, popa) {
    var xb = x1 - proa, xm = x0 + (xb - x0) * 0.32, xc = x0 + (xm - x0) * 0.45;
    return 'M' + f(x0) + ' ' + f(50 - popa) + ' C' + f(xc) + ' ' + f(50 - hw) + ' ' + f(xm) + ' ' + f(50 - hw) + ' ' + f(xm) + ' ' + f(50 - hw) +
      ' L' + f(xb) + ' ' + f(50 - hw) + ' C' + f(xb + proa * 0.55) + ' ' + f(50 - hw) + ' ' + f(x1 - proa * 0.1) + ' ' + f(50 - hw * 0.32) + ' ' + f(x1) + ' 50' +
      ' C' + f(x1 - proa * 0.1) + ' ' + f(50 + hw * 0.32) + ' ' + f(xb + proa * 0.55) + ' ' + f(50 + hw) + ' ' + f(xb) + ' ' + f(50 + hw) +
      ' L' + f(xm) + ' ' + f(50 + hw) + ' C' + f(xm) + ' ' + f(50 + hw) + ' ' + f(xc) + ' ' + f(50 + hw) + ' ' + f(x0) + ' ' + f(50 + popa) +
      ' Q' + f(x0 - 4) + ' 50 ' + f(x0) + ' ' + f(50 - popa) + 'Z';
  }
  // espuma: rastro em V atrás da popa e a onda da proa
  function esteira(p, x0, popa, x1, hw, proa, forte) {
    var g = E('g', { class: 'esteira' }, p), k = forte ? 1.5 : 1;
    E('path', { d: 'M' + f(x0 + 2) + ' ' + f(50 - popa * 0.9) + ' Q' + f(x0 * 0.5) + ' ' + f(50 - popa * 0.95) + ' 0 ' + f(50 - popa - 10 * k) + ' L0 ' + f(50 + popa + 10 * k) + ' Q' + f(x0 * 0.5) + ' ' + f(50 + popa * 0.95) + ' ' + f(x0 + 2) + ' ' + f(50 + popa * 0.9) + 'Z', fill: 'url(#bnEsteira)' }, g);
    E('ellipse', { cx: f(x0 - 1), cy: 50, rx: f(7 * k), ry: f(popa * 0.75), fill: '#fff', 'fill-opacity': 0.75 }, g);
    for (var i = 0; i < 4 * k; i++) E('circle', { cx: f(x0 * (0.15 + 0.2 * (i % 4))), cy: f(50 + ((i % 2) ? 1 : -1) * (popa * 0.35 + (i * 3) % 9)), r: f(2.2 - (i % 3) * 0.5), fill: '#fff', 'fill-opacity': 0.7 }, g);
    var xa = x1 - proa * 0.25, xb = x1 - proa - 26 * k;
    [-1, 1].forEach(function (s) {
      E('path', { d: 'M' + f(xa) + ' ' + f(50 + s * hw * 0.55) + ' Q' + f(x1 - proa * 0.8) + ' ' + f(50 + s * (hw + 3)) + ' ' + f(xb) + ' ' + f(50 + s * (hw + 7)), fill: 'none', stroke: '#fff', 'stroke-opacity': 0.75, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      E('path', { d: 'M' + f(xa - proa * 0.35) + ' ' + f(50 + s * (hw + 1)) + ' Q' + f(xb + 4) + ' ' + f(50 + s * (hw + 5)) + ' ' + f(xb - 30) + ' ' + f(50 + s * (hw + 9)), fill: 'none', stroke: '#fff', 'stroke-opacity': 0.4, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
    });
  }
  function sombra(p, d) { E('path', { d: d, fill: '#000814', 'fill-opacity': 0.38, transform: 'translate(3 5)' }, p); }
  // torre de canhões: cx, cy, tamanho s, dir 1 = para a proa, -1 = para a popa, canos
  function torre(p, cx, cy, s, dir, canos) {
    var g = E('g', { transform: 'translate(' + f(cx) + ' ' + f(cy) + ') scale(' + dir + ' 1)' }, p);
    var esp = s * 0.26;
    for (var i = 0; i < canos; i++) {
      var yy = (i - (canos - 1) / 2) * esp;
      E('rect', { x: f(s * 0.1), y: f(yy - s * 0.065), width: f(s * 1.3), height: f(s * 0.13), rx: f(s * 0.05), fill: 'url(#bnCano)', stroke: COR.linha, 'stroke-width': 0.5 }, g);
      E('rect', { x: f(s * 1.32), y: f(yy - s * 0.08), width: f(s * 0.09), height: f(s * 0.16), rx: 1, fill: '#20282f' }, g);
    }
    E('path', { d: 'M' + f(-s * 0.56) + ' ' + f(-s * 0.44) + ' L' + f(s * 0.12) + ' ' + f(-s * 0.46) + ' Q' + f(s * 0.62) + ' ' + f(-s * 0.4) + ' ' + f(s * 0.62) + ' 0 Q' + f(s * 0.62) + ' ' + f(s * 0.4) + ' ' + f(s * 0.12) + ' ' + f(s * 0.46) + ' L' + f(-s * 0.56) + ' ' + f(s * 0.44) + ' Q' + f(-s * 0.66) + ' 0 ' + f(-s * 0.56) + ' ' + f(-s * 0.44) + 'Z',
      fill: 'url(#bnTorre)', stroke: COR.linha, 'stroke-width': 1.4 }, g);
    E('rect', { x: f(-s * 0.62), y: f(-s * 0.36), width: f(s * 0.14), height: f(s * 0.72), rx: 1.5, fill: '#4c5761' }, g);   // telêmetro atrás
    E('circle', { cx: f(-s * 0.18), cy: f(-s * 0.2), r: f(s * 0.08), fill: '#5e6a74', stroke: '#3a434b', 'stroke-width': 0.5 }, g);
    E('circle', { cx: f(-s * 0.18), cy: f(s * 0.2), r: f(s * 0.08), fill: '#5e6a74', stroke: '#3a434b', 'stroke-width': 0.5 }, g);
  }
  // canhão moderno (cúpula furtiva com um cano)
  function canhao(p, cx, cy, s, dir) {
    var g = E('g', { transform: 'translate(' + f(cx) + ' ' + f(cy) + ') scale(' + (dir || 1) + ' 1)' }, p);
    E('rect', { x: 0, y: f(-s * 0.08), width: f(s * 1.5), height: f(s * 0.16), rx: f(s * 0.06), fill: 'url(#bnCano)', stroke: COR.linha, 'stroke-width': 0.5 }, g);
    E('path', { d: M([[-s * 0.55, -s * 0.42], [s * 0.15, -s * 0.42], [s * 0.6, -s * 0.12], [s * 0.6, s * 0.12], [s * 0.15, s * 0.42], [-s * 0.55, s * 0.42]]), fill: 'url(#bnTorre)', stroke: COR.linha, 'stroke-width': 1.2 }, g);
    E('path', { d: M([[-s * 0.3, -s * 0.22], [s * 0.15, -s * 0.22], [s * 0.35, 0], [s * 0.15, s * 0.22], [-s * 0.3, s * 0.22]]), fill: '#fff', 'fill-opacity': 0.18 }, g);
  }
  function vls(p, x, y, cols, lins, c) {
    E('rect', { x: f(x - 2), y: f(y - 2), width: f(cols * c + 3), height: f(lins * c + 3), rx: 2, fill: '#56616b', stroke: '#2f3840', 'stroke-width': 0.8 }, p);
    for (var i = 0; i < cols; i++) for (var j = 0; j < lins; j++) E('rect', { x: f(x + i * c), y: f(y + j * c), width: f(c - 1.2), height: f(c - 1.2), rx: 0.6, fill: (i + j) % 3 ? '#3b444c' : '#46505a' }, p);
  }
  function heliponto(p, cx, cy, r) {
    E('circle', { cx: f(cx), cy: f(cy), r: f(r), fill: '#59646e', 'fill-opacity': 0.55, stroke: '#f2f5f7', 'stroke-width': 1.6 }, p);
    E('circle', { cx: f(cx), cy: f(cy), r: f(r * 0.72), fill: 'none', stroke: '#ffd23f', 'stroke-width': 0.9, 'stroke-dasharray': '3 2.4' }, p);
    var h = r * 0.5, w = r * 0.42;   // H olhando para a popa (como se lê de cima de quem pousa)
    E('path', { d: 'M' + f(cx - h) + ' ' + f(cy - w) + ' L' + f(cx - h) + ' ' + f(cy + w) + ' M' + f(cx + h) + ' ' + f(cy - w) + ' L' + f(cx + h) + ' ' + f(cy + w) + ' M' + f(cx - h) + ' ' + f(cy) + ' L' + f(cx + h) + ' ' + f(cy),
      stroke: '#f2f5f7', 'stroke-width': f(r * 0.17), fill: 'none', transform: 'rotate(90 ' + f(cx) + ' ' + f(cy) + ')' }, p);
  }
  function chamine(p, x, y, w, h) {
    E('rect', { x: f(x), y: f(y), width: f(w), height: f(h), rx: f(Math.min(w, h) * 0.45), fill: '#4e5861', stroke: COR.linha, 'stroke-width': 1 }, p);
    E('rect', { x: f(x + w * 0.2), y: f(y + h * 0.22), width: f(w * 0.6), height: f(h * 0.56), rx: f(Math.min(w, h) * 0.25), fill: '#101418' }, p);
    E('ellipse', { cx: f(x - w * 0.9), cy: f(y + h / 2), rx: f(w * 1.3), ry: f(h * 0.32), fill: '#5b6168', 'fill-opacity': 0.22 }, p);   // fumacinha para a popa
  }
  function mastro(p, cx, cy, s) {
    E('line', { x1: f(cx), y1: f(cy - s), x2: f(cx), y2: f(cy + s), stroke: '#3a434b', 'stroke-width': 1.4 }, p);
    E('line', { x1: f(cx - s * 0.3), y1: f(cy), x2: f(cx + s * 0.3), y2: f(cy), stroke: '#3a434b', 'stroke-width': 1.2 }, p);
    E('circle', { cx: f(cx), cy: f(cy), r: f(s * 0.32), fill: '#dfe5ea', stroke: '#56616b', 'stroke-width': 0.8 }, p);
  }
  // ponte de comando: bloco com frente inclinada e a faixa das janelas
  function ponte(p, x0, x1, hw) {
    E('path', { d: M([[x0, 50 - hw], [x1 - hw * 0.5, 50 - hw], [x1, 50 - hw * 0.45], [x1, 50 + hw * 0.45], [x1 - hw * 0.5, 50 + hw], [x0, 50 + hw]]), fill: COR.super, stroke: '#4a555f', 'stroke-width': 1.2 }, p);
    E('path', { d: M([[x0 + 6, 50 - hw * 0.68], [x1 - hw * 0.62, 50 - hw * 0.68], [x1 - 5, 50 - hw * 0.3], [x1 - 5, 50 + hw * 0.3], [x1 - hw * 0.62, 50 + hw * 0.68], [x0 + 6, 50 + hw * 0.68]]), fill: '#e3e8ec', stroke: '#9aa5af', 'stroke-width': 0.6 }, p);
    E('path', { d: 'M' + f(x1 - 2.5) + ' ' + f(50 - hw * 0.4) + ' L' + f(x1 - 2.5) + ' ' + f(50 + hw * 0.4), stroke: COR.vidro, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, p);
  }
  function aviao(p, x, y, s, dir) {
    var pts = [[13, 0], [7, -1.4], [2, -1.8], [-3, -9], [-6, -9], [-4, -1.8], [-8, -1.6], [-10.5, -5], [-12.5, -5], [-11.5, 0]];
    var todos = pts.concat(pts.slice(1, -1).reverse().map(function (q) { return [q[0], -q[1]]; }));
    E('path', { d: M(todos), fill: '#b4bec8', stroke: '#3a434b', 'stroke-width': 0.5, transform: 'translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * (dir || 1)) + ' ' + f(s) + ')' }, p);
  }
  function bote(p, cx, cy) { E('ellipse', { cx: f(cx), cy: f(cy), rx: 7, ry: 2.6, fill: '#ff7a2f', stroke: '#7a2e08', 'stroke-width': 0.6 }, p); }

  // marcas de queimado do navio afundado (sempre as mesmas para o mesmo navio)
  function queimado(p, W, id, hw) {
    var g = E('g', { class: 'queimado' }, p), sem = 7;
    for (var c = 0; c < id.length; c++) sem = (sem * 31 + id.charCodeAt(c)) % 9973;
    function rnd() { sem = (sem * 9301 + 49297) % 233280; return sem / 233280; }
    for (var i = 0; i < W / 100; i++) {
      var cx = i * 100 + 50 + (rnd() - 0.5) * 30, cy = 50 + (rnd() - 0.5) * hw * 0.5, pts = [];
      for (var k = 0; k < 10; k++) { var a = k / 10 * Math.PI * 2, r = (hw * 0.45) * (0.6 + rnd() * 0.6); pts.push([cx + Math.cos(a) * r * 1.3, cy + Math.sin(a) * r]); }
      E('path', { d: M(pts), fill: '#1a0e06', 'fill-opacity': 0.6 }, g);
      E('circle', { cx: f(cx), cy: f(cy), r: f(hw * 0.22), fill: '#2d170a', 'fill-opacity': 0.8 }, g);
      for (k = 0; k < 3; k++) E('circle', { class: 'brasa', cx: f(cx + (rnd() - 0.5) * hw), cy: f(cy + (rnd() - 0.5) * hw * 0.7), r: f(1.6 + rnd() * 1.6), fill: '#ff8a2a' }, g);
    }
    if (W >= 300) { var xm = W * (0.45 + rnd() * 0.1); E('path', { d: 'M' + f(xm) + ' ' + f(50 - hw - 2) + ' L' + f(xm + 8) + ' ' + f(50 - hw * 0.4) + ' L' + f(xm - 6) + ' ' + f(50 + hw * 0.1) + ' L' + f(xm + 7) + ' ' + f(50 + hw * 0.6) + ' L' + f(xm) + ' ' + f(50 + hw + 2), fill: 'none', stroke: '#0a0503', 'stroke-width': 4, 'stroke-linejoin': 'round' }, g); }
  }
  function oleo(p, W) { E('ellipse', { class: 'oleo', cx: W / 2, cy: 50, rx: W / 2 - 3, ry: 47, fill: 'url(#bnOleo)' }, p); }

  // ---------- os navios ----------
  var ARTE = {
    porta: function (p) {
      var hull = casco(20, 494, 30, 80, 24);
      esteira(p, 20, 22, 494, 27, 80);
      var deck = [[22, 23], [175, 19], [228, 9], [340, 5], [372, 15], [432, 21], [478, 33], [494, 50], [478, 63], [424, 73], [362, 79], [250, 84], [120, 84], [22, 78]];
      sombra(p, M(deck));
      E('path', { d: hull, fill: 'url(#bnCasco)', stroke: COR.linha, 'stroke-width': 2 }, p);
      E('path', { d: M(deck), fill: 'url(#bnPista)', stroke: '#14191e', 'stroke-width': 2 }, p);
      E('path', { d: M(deck), fill: 'url(#bnAntider)' }, p);
      // pista em ângulo (pouso), a do centro (decolagem) e as catapultas
      E('path', { d: 'M30 66 L356 13', stroke: '#f4f6f8', 'stroke-width': 2.2, 'stroke-dasharray': '14 9' }, p);
      E('path', { d: 'M30 78 L362 24 M30 52 L340 7', stroke: '#f4f6f8', 'stroke-opacity': 0.55, 'stroke-width': 1 }, p);
      E('path', { d: 'M300 43 L470 43 M300 57 L466 57', stroke: '#9aa4ad', 'stroke-width': 1.2 }, p);
      E('path', { d: 'M40 62 L52 74 M58 59 L70 71 M76 56 L88 68', stroke: '#c9d0d6', 'stroke-width': 1 }, p);   // cabos de parada
      E('path', { d: 'M24 26 L24 76', stroke: '#ffd23f', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, p);
      E('rect', { x: 150, y: 70, width: 34, height: 12, rx: 1.5, fill: 'none', stroke: '#7d8790', 'stroke-width': 1.2 }, p);   // elevadores
      E('rect', { x: 236, y: 9, width: 30, height: 10, rx: 1.5, fill: 'none', stroke: '#7d8790', 'stroke-width': 1.2, transform: 'rotate(-9 251 14)' }, p);
      // número no convés
      E('rect', { x: 420, y: 37, width: 14, height: 26, rx: 5, fill: 'none', stroke: '#f4f6f8', 'stroke-width': 3, 'stroke-opacity': 0.85 }, p);
      E('path', { d: 'M442 37 L458 37 L447 63', fill: 'none', stroke: '#f4f6f8', 'stroke-width': 3, 'stroke-opacity': 0.85, 'stroke-linejoin': 'round' }, p);
      // ilha (torre de comando) a estibordo
      E('rect', { x: 276, y: 62, width: 76, height: 22, rx: 4, fill: '#000814', 'fill-opacity': 0.4, transform: 'translate(4 6)' }, p);
      E('rect', { x: 276, y: 62, width: 76, height: 22, rx: 4, fill: COR.super, stroke: '#3e4851', 'stroke-width': 1.3 }, p);
      E('rect', { x: 286, y: 65.5, width: 50, height: 15, rx: 3, fill: '#e6ebef', stroke: '#9aa5af', 'stroke-width': 0.6 }, p);
      E('path', { d: 'M350 65 L350 81', stroke: COR.vidro, 'stroke-width': 3, 'stroke-linecap': 'round' }, p);
      chamine(p, 292, 67, 14, 11); mastro(p, 322, 73, 11);
      aviao(p, 82, 40, 1.7, 1); aviao(p, 120, 34, 1.7, 1); aviao(p, 112, 58, 1.7, 1); aviao(p, 395, 66, 1.6, -1); aviao(p, 205, 32, 1.6, 1);
      return 27;
    },
    encouracado: function (p) {
      var x0 = 16, x1 = 395, hw = 37, proa = 96, popa = 29, hull = casco(x0, x1, hw, proa, popa), deck = casco(x0 + 6, x1 - 9, hw - 5, proa - 12, popa - 5);
      esteira(p, x0, popa, x1, hw, proa);
      sombra(p, hull);
      E('path', { d: hull, fill: 'url(#bnCasco)', stroke: COR.linha, 'stroke-width': 2 }, p);
      E('path', { d: deck, fill: 'url(#bnTeca)' }, p);
      E('path', { d: deck, fill: 'url(#bnTabuas)' }, p);
      E('path', { d: 'M334 27 L356 50 L334 73', fill: 'none', stroke: '#59646e', 'stroke-width': 3, 'stroke-linejoin': 'round' }, p);   // quebra-mar
      E('circle', { cx: 372, cy: 43, r: 2.6, fill: '#2b343c' }, p); E('circle', { cx: 372, cy: 57, r: 2.6, fill: '#2b343c' }, p);
      E('path', { d: 'M370 43 L352 47 M370 57 L352 53', stroke: '#3a434b', 'stroke-width': 1.4, 'stroke-dasharray': '2 1.2' }, p);
      torre(p, 309, 50, 33, 1, 3);
      torre(p, 89, 50, 35, -1, 3);
      // superestrutura no meio, chaminé e canhões secundários dos lados
      E('rect', { x: 133, y: 29, width: 114, height: 42, rx: 7, fill: '#000814', 'fill-opacity': 0.3, transform: 'translate(3 4)' }, p);
      E('rect', { x: 133, y: 29, width: 114, height: 42, rx: 7, fill: COR.super, stroke: '#46515b', 'stroke-width': 1.3 }, p);
      [[158, 25], [190, 25], [158, 75], [190, 75]].forEach(function (q) { torre(p, q[0], q[1], 12, 1, 2); });
      ponte(p, 196, 240, 14);
      E('circle', { cx: 214, cy: 50, r: 7.5, fill: '#bcc6cf', stroke: '#56616b', 'stroke-width': 1 }, p);
      E('rect', { x: 210, y: 41, width: 5, height: 18, rx: 1.5, fill: '#56616b' }, p);   // telêmetro do diretor de tiro
      chamine(p, 158, 41, 26, 18);
      mastro(p, 144, 50, 11);
      torre(p, 262, 50, 37, 1, 3);         // torre B, por cima da A
      return hw;
    },
    cruzador: function (p) {
      var x0 = 16, x1 = 396, hw = 34, proa = 112, popa = 29, hull = casco(x0, x1, hw, proa, popa), deck = casco(x0 + 6, x1 - 9, hw - 4.5, proa - 14, popa - 4.5);
      esteira(p, x0, popa, x1, hw, proa);
      sombra(p, hull);
      E('path', { d: hull, fill: 'url(#bnCasco)', stroke: COR.linha, 'stroke-width': 2 }, p);
      E('path', { d: deck, fill: 'url(#bnDeck)' }, p);
      E('path', { d: deck, fill: 'url(#bnAntider)' }, p);
      E('path', { d: 'M300 50 L378 50', stroke: '#6b7782', 'stroke-width': 1, 'stroke-dasharray': '4 3' }, p);
      canhao(p, 330, 50, 20, 1);
      vls(p, 266, 38, 6, 4, 6.2);
      vls(p, 96, 38, 5, 4, 6.2);
      heliponto(p, 52, 50, 19);
      // superestrutura com os painéis do radar e as duas chaminés
      E('rect', { x: 140, y: 27, width: 118, height: 46, rx: 4, fill: '#000814', 'fill-opacity': 0.3, transform: 'translate(3 4)' }, p);
      ponte(p, 140, 258, 23);
      E('path', { d: M([[238, 30], [252, 36], [252, 42], [238, 38]]), fill: '#34414f', stroke: '#1d2731', 'stroke-width': 0.8 }, p);
      E('path', { d: M([[238, 70], [252, 64], [252, 58], [238, 62]]), fill: '#34414f', stroke: '#1d2731', 'stroke-width': 0.8 }, p);
      chamine(p, 168, 41, 14, 18); chamine(p, 190, 41, 14, 18);
      mastro(p, 222, 50, 12);
      E('circle', { cx: 206, cy: 50, r: 6.5, fill: '#f4f6f8', stroke: '#9aa4ad', 'stroke-width': 1 }, p);
      bote(p, 150, 24); bote(p, 150, 76);
      return hw;
    },
    submarino: function (p) {
      var x0 = 10, x1 = 294, hw = 25;
      var hull = 'M' + x0 + ' 50 C' + (x0 + 30) + ' ' + (50 - hw * 0.5) + ' ' + (x0 + 70) + ' ' + (50 - hw) + ' ' + (x0 + 112) + ' ' + (50 - hw) + ' L' + (x1 - 44) + ' ' + (50 - hw) +
        ' C' + (x1 - 12) + ' ' + (50 - hw) + ' ' + x1 + ' ' + (50 - hw * 0.6) + ' ' + x1 + ' 50 C' + x1 + ' ' + (50 + hw * 0.6) + ' ' + (x1 - 12) + ' ' + (50 + hw) + ' ' + (x1 - 44) + ' ' + (50 + hw) +
        ' L' + (x0 + 112) + ' ' + (50 + hw) + ' C' + (x0 + 70) + ' ' + (50 + hw) + ' ' + (x0 + 30) + ' ' + (50 + hw * 0.5) + ' ' + x0 + ' 50Z';
      var g = E('g', { class: 'esteira' }, p);
      // a água lavando o casco (submarino na superfície), a onda da proa e o rastro da hélice
      E('path', { d: 'M' + (x1 - 6) + ' ' + (50 - hw * 0.8) + ' Q' + (x1 - 50) + ' ' + (50 - hw - 9) + ' ' + (x1 - 120) + ' ' + (50 - hw - 6) + ' M' + (x1 - 6) + ' ' + (50 + hw * 0.8) + ' Q' + (x1 - 50) + ' ' + (50 + hw + 9) + ' ' + (x1 - 120) + ' ' + (50 + hw + 6), fill: 'none', stroke: '#fff', 'stroke-opacity': 0.7, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      E('path', { d: 'M' + (x1 - 70) + ' ' + (50 - hw - 4) + ' Q' + (x1 - 150) + ' ' + (50 - hw - 5) + ' ' + (x0 + 60) + ' ' + (50 - hw - 2) + ' M' + (x1 - 70) + ' ' + (50 + hw + 4) + ' Q' + (x1 - 150) + ' ' + (50 + hw + 5) + ' ' + (x0 + 60) + ' ' + (50 + hw + 2), fill: 'none', stroke: '#fff', 'stroke-opacity': 0.32, 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
      E('path', { d: 'M14 50 Q6 40 0 33 L0 67 Q6 60 14 50Z', fill: 'url(#bnEsteira)' }, g);
      E('ellipse', { cx: 9, cy: 50, rx: 6, ry: 9, fill: '#fff', 'fill-opacity': 0.7 }, g);
      sombra(p, hull);
      // lemes de popa (em cruz) e hélice
      E('path', { d: M([[22, 31], [34, 31], [48, 45], [28, 45]]), fill: '#161d24', stroke: '#05080b', 'stroke-width': 0.8 }, p);
      E('path', { d: M([[22, 69], [34, 69], [48, 55], [28, 55]]), fill: '#161d24', stroke: '#05080b', 'stroke-width': 0.8 }, p);
      E('path', { d: hull, fill: 'url(#bnSub)', stroke: '#030507', 'stroke-width': 2 }, p);
      E('ellipse', { cx: 160, cy: 45, rx: 118, ry: 3.2, fill: '#fff', 'fill-opacity': 0.1 }, p);
      E('path', { d: 'M40 50 L276 50', stroke: '#5c6e80', 'stroke-opacity': 0.5, 'stroke-width': 0.8, 'stroke-dasharray': '6 4' }, p);
      E('rect', { x: 10, y: 48.4, width: 30, height: 3.2, rx: 1.5, fill: '#0e1318' }, p);
      E('ellipse', { cx: 9, cy: 50, rx: 2.2, ry: 6.5, fill: '#9b8547', stroke: '#4a3f20', 'stroke-width': 0.6 }, p);
      // escotilhas e os tubos de mísseis
      [[252, 50, 3.4], [228, 50, 2.6], [120, 50, 3], [88, 50, 2.4]].forEach(function (q) { E('circle', { cx: q[0], cy: q[1], r: q[2], fill: '#141b22', stroke: '#617387', 'stroke-width': 0.7 }, p); });
      for (var i = 0; i < 4; i++) { E('circle', { cx: 132 + i * 7, cy: 44, r: 2, fill: '#1a222a', stroke: '#4d5d6e', 'stroke-width': 0.5 }, p); E('circle', { cx: 132 + i * 7, cy: 56, r: 2, fill: '#1a222a', stroke: '#4d5d6e', 'stroke-width': 0.5 }, p); }
      // vela (torre) com os lemes de mergulho e o periscópio
      E('rect', { x: 192, y: 27, width: 9, height: 46, rx: 3.5, fill: '#141b22', stroke: '#030507', 'stroke-width': 0.8 }, p);
      var vela = 'M162 50 C162 43 172 40.5 188 40.5 L206 41.5 C215 42.5 219 46 219 50 C219 54 215 57.5 206 58.5 L188 59.5 C172 59.5 162 57 162 50Z';
      E('path', { d: vela, fill: '#000814', 'fill-opacity': 0.45, transform: 'translate(3 4)' }, p);
      E('path', { d: vela, fill: '#2a3540', stroke: '#030507', 'stroke-width': 1.2 }, p);
      E('path', { d: 'M168 50 C168 45.5 175 44 188 44 L205 44.6 C211 45.3 214 47.5 214 50', fill: 'none', stroke: '#fff', 'stroke-opacity': 0.18, 'stroke-width': 1.4 }, p);
      E('circle', { cx: 199, cy: 50, r: 2.6, fill: '#a9b8c5', stroke: '#1d262e', 'stroke-width': 0.6 }, p);
      E('circle', { cx: 190, cy: 50, r: 2, fill: '#7f909f' }, p);
      E('circle', { cx: 207, cy: 50, r: 1.8, fill: '#7f909f' }, p);
      E('rect', { x: 180, y: 48.6, width: 5, height: 2.8, rx: 1, fill: '#5d6f80' }, p);
      return hw;
    },
    fragata: function (p) {
      var x0 = 14, x1 = 294, hw = 32, proa = 86, popa = 28, hull = casco(x0, x1, hw, proa, popa), deck = casco(x0 + 6, x1 - 8, hw - 4.5, proa - 12, popa - 4.5);
      esteira(p, x0, popa, x1, hw, proa);
      sombra(p, hull);
      E('path', { d: hull, fill: 'url(#bnCasco)', stroke: COR.linha, 'stroke-width': 2 }, p);
      E('path', { d: deck, fill: 'url(#bnDeck)' }, p);
      E('path', { d: deck, fill: 'url(#bnAntider)' }, p);
      canhao(p, 238, 50, 18, 1);
      vls(p, 202, 41, 3, 3, 6);
      heliponto(p, 46, 50, 17);
      E('rect', { x: 72, y: 31, width: 32, height: 38, rx: 3, fill: COR.super, stroke: '#46515b', 'stroke-width': 1.1 }, p);   // hangar
      E('path', { d: 'M73 36 L73 64', stroke: '#6b7782', 'stroke-width': 1.6 }, p);
      ponte(p, 104, 194, 20);
      chamine(p, 120, 42, 18, 16);
      mastro(p, 168, 50, 13);
      E('rect', { x: 150, y: 46, width: 10, height: 8, rx: 1.5, fill: '#2e3b48' }, p);
      bote(p, 132, 26); bote(p, 132, 74);
      return hw;
    },
    destroier: function (p) {
      var x0 = 12, x1 = 196, hw = 31, proa = 62, popa = 26, hull = casco(x0, x1, hw, proa, popa), deck = casco(x0 + 5, x1 - 7, hw - 4.5, proa - 9, popa - 4.5);
      esteira(p, x0, popa, x1, hw, proa);
      sombra(p, hull);
      E('path', { d: hull, fill: 'url(#bnCasco)', stroke: COR.linha, 'stroke-width': 2 }, p);
      E('path', { d: deck, fill: 'url(#bnDeck)' }, p);
      canhao(p, 158, 50, 15, 1);
      vls(p, 134, 43, 2, 2, 7);
      heliponto(p, 36, 50, 14);
      ponte(p, 64, 128, 19);
      chamine(p, 78, 43, 14, 14);
      mastro(p, 108, 50, 12);
      E('circle', { cx: 96, cy: 50, r: 4.5, fill: '#f4f6f8', stroke: '#9aa4ad', 'stroke-width': 0.8 }, p);
      bote(p, 82, 25); bote(p, 82, 75);
      return hw;
    },
    patrulha: function (p) {
      var x0 = 14, x1 = 195, hw = 29, proa = 70, popa = 26, hull = casco(x0, x1, hw, proa, popa), deck = casco(x0 + 5, x1 - 7, hw - 4, proa - 10, popa - 4);
      esteira(p, x0, popa, x1, hw, proa, true);
      sombra(p, hull);
      E('path', { d: hull, fill: 'url(#bnCasco)', stroke: COR.linha, 'stroke-width': 2 }, p);
      E('path', { d: deck, fill: '#a8b3bd' }, p);
      E('path', { d: M([[138, 50 - hw + 1.5], [150, 50 - hw + 2], [143, 50 - hw + 8], [131, 50 - hw + 7]]), fill: '#ff7a2f' }, p);   // faixa da guarda
      E('path', { d: M([[138, 50 + hw - 1.5], [150, 50 + hw - 2], [143, 50 + hw - 8], [131, 50 + hw - 7]]), fill: '#ff7a2f' }, p);
      E('rect', { x: 26, y: 38, width: 26, height: 10, rx: 2, fill: '#6f7b86', stroke: '#46515b', 'stroke-width': 0.8 }, p);   // motores
      E('rect', { x: 26, y: 52, width: 26, height: 10, rx: 2, fill: '#6f7b86', stroke: '#46515b', 'stroke-width': 0.8 }, p);
      // cabine com o para-brisa
      E('rect', { x: 76, y: 31, width: 52, height: 38, rx: 9, fill: '#000814', 'fill-opacity': 0.3, transform: 'translate(3 4)' }, p);
      E('rect', { x: 76, y: 31, width: 52, height: 38, rx: 9, fill: COR.super, stroke: '#46515b', 'stroke-width': 1.2 }, p);
      E('path', { d: 'M118 34 Q132 50 118 66 L113 63 Q124 50 113 37Z', fill: '#1f5579', stroke: '#0c2233', 'stroke-width': 0.8 }, p);
      E('path', { d: 'M117 38 Q125 46 121 52', fill: 'none', stroke: '#cfeaff', 'stroke-opacity': 0.7, 'stroke-width': 1.2 }, p);
      mastro(p, 96, 50, 10);
      E('rect', { x: 84, y: 47, width: 18, height: 6, rx: 2, fill: '#3a434b' }, p);   // radar
      // metralhadora dupla na proa
      E('circle', { cx: 152, cy: 50, r: 6.5, fill: 'url(#bnTorre)', stroke: COR.linha, 'stroke-width': 1 }, p);
      E('path', { d: 'M156 47.5 L176 47.5 M156 52.5 L176 52.5', stroke: '#20282f', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, p);
      return hw;
    }
  };

  // svg(id, h): o navio inteiro, já na posição (deitado ou em pé) — o CSS faz ele ocupar exatamente as casas dele
  function svg(id, h) {
    defs();
    var t = TIPOS[id] || TIPOS.destroier, W = t.tam * 100;
    var s = E('svg', { class: 'navio-svg ' + (h ? 'h' : 'v'), viewBox: h ? '0 0 ' + W + ' 100' : '0 0 100 ' + W, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false', 'data-tipo': id });
    var g = E('g', h ? {} : { transform: 'translate(100 0) rotate(90)' }, s);
    oleo(g, W);
    var corpo = E('g', { class: 'corpo' }, g);
    var hw = ARTE[id](corpo);
    queimado(corpo, W, id, hw || 26);
    return s;
  }

  var API = { TIPOS: TIPOS, POR_TAM: POR_TAM, tipo: tipo, daFrota: daFrota, porOrdem: porOrdem, svg: svg, defs: defs };
  raiz.BNNavios = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : this);
