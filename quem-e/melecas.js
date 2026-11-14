/* Quem é? — as duas melecas das filhas do dono, desenhadas em SVG no código:
     Melekento Blue — geleia azul mole, translúcida, EM PÉ, com dois pezinhos, bolhinhas dentro e espuminha em cima
                      (descrição do dono, 14/Nov/2026; dois olhos, para não parecer nenhum monstro de desenho);
     Pink Honey     — bichinho mole de borracha rosa-choque FOSCO, deitado: cabeça com olhinhos e narizinho em bolinhas,
                      uma aba atrás da cabeça, corpo redondo e rabinho pontudo (fotos e vídeo do dono, 14/Nov/2026).
   Cores em LISTA e CORES, formato em CORPO.

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
    { id: 'pink', nome: 'Pink Honey', cor: '#ff1f8e' }
  ];
  var CORES = {
    blue: { claro: '#a8dcff', meio: '#2e8bff', escuro: '#1b4fd1', contorno: '#163a9c' },
    pink: { claro: '#ff74b8', meio: '#ff1f8e', escuro: '#c80f6b', contorno: '#8f0a4c' }
  };
  var TINTA = '#3a1450';
  var CORPO = {
    blue: 'M60,168 C44,166 40,140 46,112 C50,70 70,34 100,32 C130,34 150,70 154,112 C160,140 156,166 140,168 Q100,174 60,168Z',
    pink: 'M30,122 C26,92 44,72 70,70 C90,68 104,80 112,86 C130,80 150,78 164,72 C176,92 176,112 172,120 C178,142 162,164 132,166 C110,170 96,162 84,162 C60,166 34,152 30,122Z'
  };

  function n(v) { return Math.round(v * 10) / 10; }
  function at(o) { var s = ''; for (var k in o) if (o[k] !== undefined && o[k] !== null) s += ' ' + k + '="' + o[k] + '"'; return s; }
  function p(d, o) { return '<path d="' + d + '"' + at(o || {}) + '/>'; }
  function circ(cx, cy, r, o) { return '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '"' + at(o || {}) + '/>'; }
  function elip(cx, cy, rx, ry, o) { return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '"' + at(o || {}) + '/>'; }

  function defs(id, I) {
    var c = CORES[id];
    return '<defs><radialGradient id="' + I + 'co" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="' + c.claro + '"/><stop offset=".55" stop-color="' + c.meio + '"/><stop offset="1" stop-color="' + c.escuro + '"/></radialGradient>' +
      '</defs>';
  }

  function corpo(id, I) {
    var c = CORES[id], s = elip(100, 176, 70, 8, { fill: TINTA, opacity: 0.18 }), traco = { stroke: c.contorno, 'stroke-width': 3.5, 'stroke-linejoin': 'round' };
    if (id === 'blue') {
      // pezinhos (atrás do corpo), corpo de geleia em pé, bolhinhas e espuminha
      s += '<g class="qm-pes">' + elip(76, 170, 17, 9, Object.assign({ fill: c.meio }, traco)) + elip(124, 170, 17, 9, Object.assign({ fill: c.meio }, traco)) + '</g>';
      s += p(CORPO.blue, Object.assign({ fill: 'url(#' + I + 'co)', 'fill-opacity': 0.88 }, traco));
      [[66, 146, 6], [84, 158, 3.5], [138, 140, 7], [124, 156, 4], [142, 118, 3], [58, 122, 3.5], [110, 150, 2.6]].forEach(function (b) {
        s += circ(b[0], b[1], b[2], { fill: '#ffffff', opacity: 0.4, stroke: '#ffffff', 'stroke-width': 1, 'stroke-opacity': 0.7 });
      });
      [[84, 40, 8], [100, 33, 10], [117, 39, 8], [70, 50, 6]].forEach(function (b) { s += circ(b[0], b[1], b[2], { fill: '#e6f4ff', opacity: 0.85, stroke: c.contorno, 'stroke-width': 1.5 }); });
      s += p('M62,96 Q68,66 92,52', { fill: 'none', stroke: '#ffffff', 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.5 });
    } else {
      // rabinho pontudo, corpo deitado, a aba atrás da cabeça e as bolinhas da cabeça (como nas fotos)
      s += '<g class="qm-rabo">' + p('M156,78 L194,48 C190,76 182,98 170,116Z', Object.assign({ fill: c.meio }, traco)) + '</g>';
      s += p(CORPO.pink, Object.assign({ fill: 'url(#' + I + 'co)' }, traco));
      s += '<g class="qm-aba">' + p('M94,78 C112,70 128,84 126,106 C124,128 116,146 104,154 C100,132 98,110 90,94Z', Object.assign({ fill: c.meio }, traco)) +
        p('M104,84 C114,88 118,100 116,114', { fill: 'none', stroke: c.claro, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.6 }) + '</g>';
      s += circ(34, 116, 5, Object.assign({ fill: c.meio }, traco, { 'stroke-width': 2 })) + circ(58, 76, 4.5, Object.assign({ fill: c.meio }, traco, { 'stroke-width': 2 })) + circ(78, 74, 4.5, Object.assign({ fill: c.meio }, traco, { 'stroke-width': 2 }));
      // fosco: só um reflexo suave
      s += p('M132,96 Q148,92 158,98', { fill: 'none', stroke: '#ffffff', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.22 });
    }
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

  // a Pink tem a cara na cabeça, à esquerda e menor; o Blue, no meio do corpo
  var LUGAR_CARA = { blue: '', pink: 'translate(64 112) scale(.74) translate(-102 -115)' };
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
      '<g class="qm-' + id + ' ' + (ANIM[humor] || 'qm-respira') + '">' + corpo(id, I) + (LUGAR_CARA[id] ? '<g transform="' + LUGAR_CARA[id] + '">' + cara(humor) + '</g>' : cara(humor)) + '</g></svg>';
  }

  var M = { LISTA: LISTA, svg: svg };
  raiz.QEMelecas = M;
  if (typeof module === 'object' && module.exports) module.exports = M;
})(typeof window !== 'undefined' ? window : globalThis);
