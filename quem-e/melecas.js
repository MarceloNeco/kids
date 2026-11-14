/* Quem é? — as duas melecas das filhas do dono, desenhadas em SVG no código:
     Melekento Blue — espuma com jeito de geleia azul, translúcida, com bolhinhas dentro e espuminha em cima;
     Pink Honey     — melequinha rosa brilhante que escorre, com um fio de mel dourado.
   Desenhadas pela descrição do dono (14/Nov/2026). Quando chegar a foto das massinhas de verdade, ajustar aqui
   (cores em LISTA e CORES, formato em CORPO). Pendência no PENDENCIAS.md do jogo.

   QEMelecas.svg(id, humor, op) → texto SVG (200 × 200)
     id     'blue' | 'pink'
     humor  'parada' | 'feliz' | 'ops' | 'pensando' | 'falando' | 'triste'
     op.id  prefixo dos ids internos (cada SVG na página precisa do seu)
   A animação é só CSS (estilo.css): o grupo de fora leva qm-respira (parada, pensando, falando, triste),
   qm-pula (feliz) ou qm-treme (ops). Sem movimento quando a pessoa pede menos movimento. */
(function (raiz) {
  'use strict';
  var LISTA = [
    { id: 'blue', nome: 'Melekento Blue', cor: '#2e8bff' },
    { id: 'pink', nome: 'Pink Honey', cor: '#ff5fa8' }
  ];
  var CORES = {
    blue: { claro: '#a8dcff', meio: '#2e8bff', escuro: '#1b4fd1', contorno: '#163a9c' },
    pink: { claro: '#ffc2df', meio: '#ff5fa8', escuro: '#d6347f', contorno: '#9c1f5c' }
  };
  var MEL = '#ffb52e', TINTA = '#3a1450';
  var CORPO = {
    blue: 'M28,172 C8,170 12,126 34,104 C42,64 76,34 108,36 C146,38 174,72 172,112 C190,128 192,168 164,173 Q96,180 28,172Z',
    pink: 'M38,170 C18,168 24,124 44,100 C54,62 84,40 112,44 C146,48 168,84 160,118 C172,134 170,164 148,169 Q122,176 104,172 Q100,186 92,172 Q64,176 38,170Z'
  };

  function n(v) { return Math.round(v * 10) / 10; }
  function at(o) { var s = ''; for (var k in o) if (o[k] !== undefined && o[k] !== null) s += ' ' + k + '="' + o[k] + '"'; return s; }
  function p(d, o) { return '<path d="' + d + '"' + at(o || {}) + '/>'; }
  function circ(cx, cy, r, o) { return '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '"' + at(o || {}) + '/>'; }
  function elip(cx, cy, rx, ry, o) { return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '"' + at(o || {}) + '/>'; }

  function defs(id, I) {
    var c = CORES[id];
    return '<defs><radialGradient id="' + I + 'co" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="' + c.claro + '"/><stop offset=".55" stop-color="' + c.meio + '"/><stop offset="1" stop-color="' + c.escuro + '"/></radialGradient>' +
      '<linearGradient id="' + I + 'me" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="' + MEL + '"/></linearGradient></defs>';
  }

  function corpo(id, I) {
    var c = CORES[id], s = elip(100, 176, 78, 9, { fill: TINTA, opacity: 0.18 });
    if (id === 'blue') {
      s += p(CORPO.blue, { fill: 'url(#' + I + 'co)', 'fill-opacity': 0.88, stroke: c.contorno, 'stroke-width': 3.5, 'stroke-linejoin': 'round' });
      // bolhinhas dentro da geleia
      [[52, 140, 7], [70, 158, 4], [150, 146, 8], [134, 162, 4.5], [160, 126, 3.5], [44, 118, 4], [118, 150, 3], [88, 150, 2.6]].forEach(function (b) {
        s += circ(b[0], b[1], b[2], { fill: '#ffffff', opacity: 0.4, stroke: '#ffffff', 'stroke-width': 1, 'stroke-opacity': 0.7 });
      });
      // espuminha em cima
      [[78, 44, 9], [96, 37, 11], [116, 39, 10], [134, 47, 8], [64, 54, 7]].forEach(function (b) { s += circ(b[0], b[1], b[2], { fill: '#e6f4ff', opacity: 0.85, stroke: c.contorno, 'stroke-width': 1.5 }); });
    } else {
      s += p(CORPO.pink, { fill: 'url(#' + I + 'co)', stroke: c.contorno, 'stroke-width': 3.5, 'stroke-linejoin': 'round' });
      // pingos rosa escorrendo e o fio de mel
      s += p('M58,166 Q60,180 66,184 Q72,180 70,168Z', { fill: c.meio, stroke: c.contorno, 'stroke-width': 2.5 }) +
        '<g class="qm-mel">' + p('M140,160 Q146,176 144,188 Q142,196 148,198 Q156,196 152,186 Q150,174 152,160Z', { fill: 'url(#' + I + 'me)', stroke: '#c9841a', 'stroke-width': 2 }) +
        elip(146, 191, 2, 3, { fill: '#fff', opacity: 0.7 }) + '</g>';
    }
    // brilho grande e molhado
    s += p('M54,92 Q64,62 94,52', { fill: 'none', stroke: '#ffffff', 'stroke-width': 9, 'stroke-linecap': 'round', opacity: 0.55 }) + circ(48, 106, 4.5, { fill: '#fff', opacity: 0.6 });
    return s;
  }

  function olho(x, y, humor, lado) {
    if (humor === 'feliz') return p('M' + (x - 12) + ',' + (y + 4) + ' Q' + x + ',' + (y - 12) + ' ' + (x + 12) + ',' + (y + 4), { fill: 'none', stroke: TINTA, 'stroke-width': 5, 'stroke-linecap': 'round' });
    var rx = humor === 'ops' ? 16 : 14, ry = humor === 'ops' ? 19 : 17;
    var dx = humor === 'pensando' ? -5 : 0, dy = humor === 'pensando' ? -6 : (humor === 'triste' ? 4 : 2);
    var s = elip(x, y, rx, ry, { fill: '#fff', stroke: TINTA, 'stroke-width': 3 }) + circ(x + dx, y + dy, humor === 'ops' ? 6 : 8, { fill: TINTA }) + circ(x + dx - 3, y + dy - 4, 3, { fill: '#fff' });
    if (humor === 'triste') s += p('M' + (x - 14) + ',' + (y - 20 - lado * 4) + ' L' + (x + 14) + ',' + (y - 20 + lado * 4), { stroke: TINTA, 'stroke-width': 4, 'stroke-linecap': 'round' });
    return s;
  }

  function cara(humor) {
    var s = olho(80, 100, humor, -1) + olho(124, 100, humor, 1);
    if (humor === 'feliz' || humor === 'parada' || humor === 'falando') s += elip(64, 124, 9, 5, { fill: '#ff4f8f', opacity: 0.35 }) + elip(140, 124, 9, 5, { fill: '#ff4f8f', opacity: 0.35 });
    if (humor === 'parada') s += p('M88,126 Q102,138 116,126', { fill: 'none', stroke: TINTA, 'stroke-width': 4, 'stroke-linecap': 'round' });
    else if (humor === 'feliz') s += p('M80,122 Q102,152 124,122Z', { fill: '#b8364d', stroke: TINTA, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }) + elip(102, 136, 9, 5, { fill: '#ff8fa0' });
    else if (humor === 'ops') s += elip(102, 134, 7, 9, { fill: '#b8364d', stroke: TINTA, 'stroke-width': 3 }) + p('M156,70 Q150,84 156,90 Q162,84 156,70Z', { fill: '#bfe7ff', stroke: '#3a8bd1', 'stroke-width': 1.5 });
    else if (humor === 'pensando') s += p('M90,132 Q100,128 112,134', { fill: 'none', stroke: TINTA, 'stroke-width': 4, 'stroke-linecap': 'round' }) + circ(150, 60, 4, { fill: TINTA }) + circ(162, 50, 5, { fill: TINTA }) + circ(176, 38, 6, { fill: TINTA });
    else if (humor === 'falando') s += elip(102, 132, 13, 9, { fill: '#b8364d', stroke: TINTA, 'stroke-width': 3.5 }) + elip(102, 136, 7, 3.5, { fill: '#ff8fa0' });
    else if (humor === 'triste') s += p('M88,138 Q102,126 116,138', { fill: 'none', stroke: TINTA, 'stroke-width': 4, 'stroke-linecap': 'round' }) + p('M70,118 Q66,128 70,132 Q74,128 70,118Z', { fill: '#bfe7ff', stroke: '#3a8bd1', 'stroke-width': 1.5 });
    return s;
  }

  var ANIM = { feliz: 'qm-pula', ops: 'qm-treme' };
  function svg(id, humor, op) {
    if (!CORES[id]) throw new Error('meleca desconhecida: ' + id);
    humor = humor || 'parada';
    var I = (op && op.id) || 'qm';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img">' + defs(id, I) +
      '<g class="qm-' + id + ' ' + (ANIM[humor] || 'qm-respira') + '">' + corpo(id, I) + cara(humor) + '</g></svg>';
  }

  var M = { LISTA: LISTA, svg: svg };
  raiz.QEMelecas = M;
  if (typeof module === 'object' && module.exports) module.exports = M;
})(typeof window !== 'undefined' ? window : globalThis);
