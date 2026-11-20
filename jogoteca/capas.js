/* Jogoteca — capas dos jogos (arte própria, SVG 120×160, sem texto: o nome vem por cima, no idioma escolhido).
   window.JogotecaCapas[id]() devolve o <svg>. Os ids batem com a LISTA do app.js. */
(function () {
  'use strict';
  var n = 0;
  function svg(corpo) { return '<svg viewBox="0 0 120 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + corpo + '</svg>'; }
  function id(p) { n += 1; return p + n; }
  // retícula de pontinhos (o charme dos quadrinhos antigos)
  function reticula(cor, op) {
    var i = id('ret');
    return '<defs><pattern id="' + i + '" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.3" fill="' + cor + '" opacity="' + op + '"/></pattern></defs>' +
      '<rect width="120" height="160" fill="url(#' + i + ')"/>';
  }
  function carta(x, y, r, naipe, cor, valor) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ')">' +
      '<rect x="-17" y="-24" width="34" height="48" rx="4" fill="#fff" stroke="#c9ccd6" stroke-width=".8"/>' +
      '<text x="-13" y="-13" font-family="Georgia,serif" font-size="10" font-weight="700" fill="' + cor + '">' + valor + '</text>' +
      '<text x="0" y="9" text-anchor="middle" font-size="22" fill="' + cor + '">' + naipe + '</text></g>';
  }
  var C = {
    paciencia: function () {
      var g = id('feltro');
      return svg('<defs><radialGradient id="' + g + '" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#3fbf6a"/><stop offset=".6" stop-color="#1c7a3f"/><stop offset="1" stop-color="#0d4524"/></radialGradient></defs>' +
        '<rect width="120" height="160" fill="url(#' + g + ')"/>' + reticula('#fff', .06) +
        '<g transform="translate(0 4)">' + carta(36, 62, -22, '♣', '#1d2333', 'A') + carta(50, 56, -8, '♥', '#d32f3f', 'A') + carta(66, 56, 8, '♠', '#1d2333', 'A') + carta(82, 62, 22, '♦', '#d32f3f', 'A') + '</g>' +
        '<rect x="30" y="96" width="60" height="5" rx="2.5" fill="#000" opacity=".18"/>' +
        '<path d="M14 18 l4 -8 l4 8 l-4 8z" fill="#ffd54a" opacity=".9"/><path d="M100 26 l3 -6 l3 6 l-3 6z" fill="#ffd54a" opacity=".8"/>');
    },
    sudoku: function () {
      var g = id('ceu'), linhas = '', nums = [[0, 0, 5], [1, 1, 3], [2, 0, 8], [4, 1, 7], [3, 3, 1], [5, 4, 9], [0, 5, 6], [2, 4, 2], [4, 5, 4], [1, 3, 9]];
      for (var i = 0; i <= 6; i++) {
        var w = i % 3 === 0 ? 2 : .7;
        linhas += '<line x1="' + (18 + i * 14) + '" y1="30" x2="' + (18 + i * 14) + '" y2="114" stroke="#1b3d8f" stroke-width="' + w + '"/>' +
          '<line x1="18" y1="' + (30 + i * 14) + '" x2="102" y2="' + (30 + i * 14) + '" stroke="#1b3d8f" stroke-width="' + w + '"/>';
      }
      var ns = nums.map(function (q) { return '<text x="' + (25 + q[0] * 14) + '" y="' + (42 + q[1] * 14) + '" text-anchor="middle" font-family="Georgia,serif" font-size="10" font-weight="700" fill="' + (q[2] === 9 ? '#2d7cf6' : '#13265f') + '">' + q[2] + '</text>'; }).join('');
      return svg('<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fc6ff"/><stop offset="1" stop-color="#1f5fd6"/></linearGradient></defs>' +
        '<rect width="120" height="160" fill="url(#' + g + ')"/>' + reticula('#fff', .12) +
        '<rect x="14" y="26" width="92" height="92" rx="8" fill="#eef6ff" stroke="#fff" stroke-width="3"/>' +
        '<rect x="46" y="58" width="14" height="14" fill="#ffe680"/>' + linhas + ns +
        '<circle cx="104" cy="22" r="10" fill="#ffd54a"/><text x="104" y="26" text-anchor="middle" font-size="11" font-weight="700" fill="#7a4a00">?</text>');
    },
    boliche: function () {
      var g = id('pista'), pinos = '';
      [[60, 52], [53, 57], [67, 57], [46, 62], [60, 62], [74, 62]].forEach(function (p) {
        pinos += '<g transform="translate(' + p[0] + ' ' + p[1] + ')"><path d="M0 -12 c3 0 4 3 3 6 c-1 3 3 5 3 10 c0 4 -3 6 -6 6 c-3 0 -6 -2 -6 -6 c0 -5 4 -7 3 -10 c-1 -3 0 -6 3 -6z" fill="#fff" stroke="#9aa4b8" stroke-width=".6"/>' +
          '<rect x="-3" y="-6" width="6" height="1.4" fill="#e23b3b"/><rect x="-3" y="-3.8" width="6" height="1" fill="#e23b3b"/></g>';
      });
      return svg('<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a2f"/><stop offset="1" stop-color="#ffd23f"/></linearGradient></defs>' +
        '<rect width="120" height="160" fill="#2bb3b1"/>' + reticula('#0b5f5e', .35) +
        '<polygon points="38,44 82,44 120,160 0,160" fill="url(#' + g + ')"/>' + reticula('#b4410f', .18) +
        '<polygon points="38,44 82,44 84,48 36,48" fill="#1d1d1d" opacity=".35"/>' + pinos +
        '<circle cx="62" cy="122" r="17" fill="#2340b8"/><circle cx="56" cy="116" r="5" fill="#fff" opacity=".35"/>' +
        '<circle cx="58" cy="118" r="2" fill="#0d1d5c"/><circle cx="65" cy="116" r="2" fill="#0d1d5c"/><circle cx="62" cy="123" r="2" fill="#0d1d5c"/>' +
        '<path d="M10 20 l10 4 l-10 4 M110 30 l-10 4 l10 4" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>');
    },
    bolinhas: function () {
      // parede neon azul/roxo: 7 zonas em cima, pinos intercalados, 15 canaletas embaixo e as bolinhas verde, vermelha e branca
      var g = id('parede'), lz = id('luz'), bv = id('bv'), bm = id('bm'), bb = id('bb'), pinos = '', zonas = '', canaletas = '', r, c;
      for (r = 0; r < 7; r++) for (c = 0; c < 8; c++) {
        var x = 11 + c * 14 + (r % 2) * 7;
        if (x > 112) continue;
        pinos += '<circle cx="' + x + '" cy="' + (44 + r * 11) + '" r="1.5" fill="#cfe9ff"/>';
      }
      for (c = 0; c < 7; c++) zonas += '<rect x="' + (8.5 + c * 15) + '" y="14" width="13" height="15" rx="3" fill="#0a1040" stroke="' + (c === 3 ? '#bff3ff' : '#5fc9ff') + '" stroke-width="' + (c === 3 ? 1.6 : .9) + '"/>' +
        '<rect x="' + (10.5 + c * 15) + '" y="25" width="9" height="1.6" fill="#7fa8e8"/>';
      for (c = 0; c < 15; c++) {
        var alto = c === 7 || c === 9 || c === 3, x0 = 4 + c * 7.47;
        canaletas += '<rect x="' + (x0 + .6) + '" y="128" width="6.2" height="26" fill="' + (alto ? '#ffc23a' : c % 2 ? '#3fd0ff' : '#5a62a8') + '" opacity="' + (alto ? .5 : .25) + '"/>' +
          '<rect x="' + (x0 + 1.2) + '" y="151.5" width="5" height="1.6" rx=".8" fill="' + (alto ? '#ffe08a' : '#7fe6ff') + '"/>';
        if (c) canaletas += '<rect x="' + (x0 - .5) + '" y="126" width="1.1" height="30" rx=".55" fill="#dfe8ff"/>';
      }
      function bola(cx, cy, rr, grad, cor) {
        return '<circle cx="' + cx + '" cy="' + cy + '" r="' + (rr * 2.4) + '" fill="' + cor + '" opacity=".22"/><circle cx="' + cx + '" cy="' + cy + '" r="' + rr + '" fill="url(#' + grad + ')"/>' +
          '<circle cx="' + (cx - rr * .35) + '" cy="' + (cy - rr * .4) + '" r="' + (rr * .3) + '" fill="#fff" opacity=".85"/>';
      }
      function rg(i, a, b2, cc) { return '<radialGradient id="' + i + '" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="' + a + '"/><stop offset=".55" stop-color="' + b2 + '"/><stop offset="1" stop-color="' + cc + '"/></radialGradient>'; }
      return svg('<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14309a"/><stop offset=".55" stop-color="#0b1052"/><stop offset="1" stop-color="#2a0c66"/></linearGradient>' +
        '<linearGradient id="' + lz + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bff3ff" stop-opacity=".55"/><stop offset="1" stop-color="#bff3ff" stop-opacity="0"/></linearGradient>' +
        rg(bv, '#eafff2', '#2dff88', '#07843f') + rg(bm, '#ffe9ee', '#ff3b5c', '#99102a') + rg(bb, '#ffffff', '#dbeaff', '#7f9fd8') + '</defs>' +
        '<rect width="120" height="160" fill="#090b38"/><rect x="3" y="3" width="114" height="154" rx="8" fill="url(#' + g + ')"/>' +
        '<rect x="54" y="29" width="12" height="100" fill="url(#' + lz + ')"/>' + zonas + pinos + canaletas +
        '<path d="M57 40 Q48 58 60 70 T 66 98" stroke="#2dff88" stroke-width="1.2" fill="none" stroke-dasharray="2 2.5" opacity=".7"/>' +
        bola(66, 100, 5.2, bv, '#2dff88') + bola(30, 78, 4.6, bm, '#ff3b5c') + bola(92, 58, 4.6, bb, '#bff3ff') +
        '<rect x="3" y="3" width="114" height="154" rx="8" fill="none" stroke="#7fe6ff" stroke-width="1.6"/><rect x="1" y="1" width="118" height="158" rx="9" fill="none" stroke="#7b3cff" stroke-width="1.4" opacity=".7"/>');
    },
    milionario: function () {
      var g = id('luz');
      return svg('<defs><radialGradient id="' + g + '" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#3b6cff"/><stop offset="1" stop-color="#090a3a"/></radialGradient></defs>' +
        '<rect width="120" height="160" fill="url(#' + g + ')"/>' +
        '<polygon points="20,0 34,0 70,160 40,160" fill="#fff" opacity=".07"/><polygon points="86,0 100,0 80,160 50,160" fill="#fff" opacity=".07"/>' +
        '<circle cx="60" cy="70" r="30" fill="#ffcf3a" stroke="#c58200" stroke-width="4"/><circle cx="60" cy="70" r="22" fill="none" stroke="#c58200" stroke-width="1.5"/>' +
        '<text x="60" y="80" text-anchor="middle" font-family="Georgia,serif" font-size="28" font-weight="700" fill="#9a5b00">$</text>' +
        '<path d="M44 92 l8 6 l-2 -10z" fill="#8a5a2b"/><rect x="70" y="86" width="12" height="9" rx="1.5" fill="#6b8f3a" transform="rotate(-12 76 90)"/>' +
        '<rect x="22" y="112" width="76" height="12" rx="6" fill="#120b52" stroke="#6f8bff" stroke-width="1.5"/><rect x="22" y="128" width="76" height="12" rx="6" fill="#120b52" stroke="#6f8bff" stroke-width="1.5"/>');
    },
    velha: function () {
      // campo de batalha com a grade de madeira, espadas vermelhas, escudos azuis e o raio da vitória
      var g = id('campo');
      var espada = function (x, y) { return '<g transform="translate(' + x + ' ' + y + ')"><g transform="rotate(45)"><rect x="-2" y="-14" width="4" height="20" fill="#e8edf3" stroke="#5a6170"/><rect x="-7" y="5" width="14" height="3" fill="#d92b3a"/><rect x="-1.5" y="8" width="3" height="6" fill="#7a3a12"/></g><g transform="rotate(-45)"><rect x="-2" y="-14" width="4" height="20" fill="#e8edf3" stroke="#5a6170"/><rect x="-7" y="5" width="14" height="3" fill="#d92b3a"/><rect x="-1.5" y="8" width="3" height="6" fill="#7a3a12"/></g></g>'; };
      var escudo = function (x, y) { return '<g transform="translate(' + x + ' ' + y + ')"><path d="M0 -12 L11 -8 C11 4 6 10 0 14 C-6 10 -11 4 -11 -8 Z" fill="#2d6fe0" stroke="#0d2a66" stroke-width="1.5"/><polygon points="0,-6 2,-1 7,-1 3,2 4,7 0,4 -4,7 -3,2 -7,-1 -2,-1" fill="#ffcf4a"/></g>'; };
      return svg('<defs><radialGradient id="' + g + '" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#6f9a42"/><stop offset="1" stop-color="#22341a"/></radialGradient></defs>' +
        '<rect width="120" height="160" fill="url(#' + g + ')"/>' + reticula('#000', .12) +
        '<g stroke="#5a3b17" stroke-width="5" stroke-linecap="round"><line x1="46" y1="36" x2="46" y2="114"/><line x1="74" y1="36" x2="74" y2="114"/><line x1="20" y1="62" x2="100" y2="62"/><line x1="20" y1="88" x2="100" y2="88"/></g>' +
        espada(33, 49) + escudo(60, 49) + espada(87, 49) + escudo(33, 75) + espada(60, 75) + escudo(87, 101) + espada(33, 101) +
        '<line x1="29" y1="45" x2="91" y2="105" stroke="#fff3a0" stroke-width="5" stroke-linecap="round" opacity=".9"/>' +
        '<path d="M96 20 l4 8 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1z" fill="#ffcf4a" stroke="#b45d0c"/>');
    },
    xadrez: function () {
      // tabuleiro em perspectiva, rei azul e rei vermelho frente a frente, espadas cruzadas e explosão
      var g = id('ceuX'), casas = '';
      for (var r = 0; r < 4; r++) for (var c = 0; c < 6; c++) {
        var y0 = 104 + r * 14, y1 = y0 + 14, k0 = 1 + r * 0.25, k1 = 1 + (r + 1) * 0.25, x = function (cc, k) { return 60 + (cc - 3) * 17 * k; };
        casas += '<polygon points="' + x(c, k0) + ',' + y0 + ' ' + x(c + 1, k0) + ',' + y0 + ' ' + x(c + 1, k1) + ',' + y1 + ' ' + x(c, k1) + ',' + y1 + '" fill="' + ((r + c) % 2 ? '#6f9448' : '#d8c08a') + '"/>';
      }
      var rei = function (x, cor, borda) { return '<g transform="translate(' + x + ' 52) scale(.42)"><path d="M35 76 L40 46 H60 L65 76 Z M31 30 Q50 21 69 30 L62 46 H38 Z M24 76 H76 Q80 84 76 92 H24 Q20 84 24 76 Z" fill="' + cor + '" stroke="' + borda + '" stroke-width="4"/><path d="M47 3 H53 V9 H59 V15 H53 V23 H47 V15 H41 V9 H47 Z" fill="#ffcf4a" stroke="#7a4a00" stroke-width="3"/></g>'; };
      return svg('<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1d5c"/><stop offset="1" stop-color="#7a3a12"/></linearGradient></defs>' +
        '<rect width="120" height="160" fill="url(#' + g + ')"/>' + reticula('#fff', .06) + casas +
        '<circle cx="60" cy="62" r="22" fill="#ffcf4a" opacity=".85"/><path d="M60 34 l5 16 16 -6 -10 13 14 9 -17 1 2 17 -10 -13 -10 13 2 -17 -17 -1 14 -9 -10 -13 16 6z" fill="#ff7a2f" opacity=".9"/>' +
        rei(6, '#3b82f0', '#0b1f4d') + rei(72, '#e23b3b', '#4d0b10') +
        '<g transform="translate(60 66)"><g transform="rotate(40)"><rect x="-2" y="-22" width="4" height="30" fill="#e8edf3" stroke="#5a6170"/><rect x="-8" y="8" width="16" height="4" fill="#ffcf4a"/></g><g transform="rotate(-40)"><rect x="-2" y="-22" width="4" height="30" fill="#e8edf3" stroke="#5a6170"/><rect x="-8" y="8" width="16" height="4" fill="#ffcf4a"/></g></g>');
    },
    bilhar: function () {
      var g = id('mesa'), bolas = '';
      [[60, 70, '#ffd23f'], [54, 80, '#2340b8'], [66, 80, '#e23b3b'], [48, 90, '#7b2cbf'], [60, 90, '#111'], [72, 90, '#ff7a2f']].forEach(function (b) {
        bolas += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="5.6" fill="' + b[2] + '"/><circle cx="' + (b[0] - 1.8) + '" cy="' + (b[1] - 1.8) + '" r="1.6" fill="#fff" opacity=".6"/>';
      });
      return svg('<defs><radialGradient id="' + g + '" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#2fae64"/><stop offset="1" stop-color="#0c5130"/></radialGradient></defs>' +
        '<rect width="120" height="160" fill="#5a2d14"/><rect x="10" y="10" width="100" height="140" rx="8" fill="url(#' + g + ')"/>' +
        '<circle cx="12" cy="12" r="5" fill="#000"/><circle cx="108" cy="12" r="5" fill="#000"/><circle cx="12" cy="148" r="5" fill="#000"/><circle cx="108" cy="148" r="5" fill="#000"/><circle cx="10" cy="80" r="4.5" fill="#000"/><circle cx="110" cy="80" r="4.5" fill="#000"/>' +
        bolas + '<circle cx="60" cy="126" r="5.6" fill="#fff"/><line x1="60" y1="134" x2="74" y2="158" stroke="#e8c48a" stroke-width="3" stroke-linecap="round"/>');
    }
  };
  window.JogotecaCapas = C;
})();
