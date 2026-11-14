/* Cozinha — desenhos feitos em código (SVG), originais deste jogo: utensílios e ingredientes que não têm um emoji
   bom (açúcar, óleo, fermento...), a faca sem ponta e o ícone do app. Cada desenho é um texto SVG pequeno.
   icone(id) devolve o HTML do ícone de um ingrediente ou utensílio (emoji ou desenho). */
(function (raiz) {
  'use strict';
  var S = {};
  function svg(corpo) { return '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">' + corpo + '</svg>'; }
  var T = 'stroke-linejoin="round" stroke-linecap="round"';

  // ---------- ingredientes ----------
  S.acucar = svg('<path d="M16 14h32l5 40H11z" fill="#fff" stroke="#e8628a" stroke-width="3" ' + T + '/><path d="M16 14l4-6h24l4 6" fill="#ffd6e2" stroke="#e8628a" stroke-width="3" ' + T + '/>' +
    '<rect x="20" y="26" width="24" height="14" rx="4" fill="#ff8fb1"/><rect x="24" y="44" width="7" height="7" rx="1.5" fill="#fff" stroke="#c9c9d6" stroke-width="2"/><rect x="33" y="44" width="7" height="7" rx="1.5" fill="#fff" stroke="#c9c9d6" stroke-width="2"/>' +
    '<rect x="28.5" y="37" width="7" height="7" rx="1.5" fill="#fff" stroke="#c9c9d6" stroke-width="2"/>');
  S.oleo = svg('<path d="M27 4h10v9l7 10v34a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V23l7-10z" fill="#ffd84d" stroke="#c99700" stroke-width="3" ' + T + '/><rect x="25" y="2" width="14" height="6" rx="2" fill="#e84a3c"/>' +
    '<rect x="22" y="32" width="20" height="14" rx="3" fill="#fff8d6"/><path d="M32 35c-3 4-4 6-4 7.5a4 4 0 0 0 8 0c0-1.5-1-3.5-4-7.5z" fill="#f2b400"/>');
  S.fermento = svg('<rect x="14" y="14" width="36" height="42" rx="6" fill="#e84a3c" stroke="#a62a1f" stroke-width="3"/><ellipse cx="32" cy="14" rx="18" ry="5" fill="#ffd166" stroke="#a62a1f" stroke-width="3"/>' +
    '<rect x="14" y="28" width="36" height="12" fill="#fff"/><circle cx="25" cy="34" r="3" fill="#f7b733"/><circle cx="32" cy="33" r="3.6" fill="#f7b733"/><circle cx="39" cy="34" r="3" fill="#f7b733"/>');
  S.manteiga = svg('<ellipse cx="32" cy="46" rx="26" ry="9" fill="#6cc3ff" stroke="#2c7fb8" stroke-width="3"/><path d="M14 26l10-8h26v20l-10 8H14z" fill="#ffe680" stroke="#d9a400" stroke-width="3" ' + T + '/>' +
    '<path d="M14 26h26v20M40 26l10-8" fill="none" stroke="#d9a400" stroke-width="3" ' + T + '/>');
  S.leitecond = svg('<rect x="12" y="16" width="40" height="38" rx="5" fill="#3a86ff" stroke="#1d4fa8" stroke-width="3"/><ellipse cx="32" cy="16" rx="20" ry="5" fill="#cfd8e6" stroke="#1d4fa8" stroke-width="3"/>' +
    '<path d="M32 26c-6 8-8 12-8 15a8 8 0 0 0 16 0c0-3-2-7-8-15z" fill="#fff"/><rect x="12" y="46" width="40" height="5" fill="#ffd166"/>');
  S.granulado = svg('<path d="M18 18h28v34a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6z" fill="#fff4f8" stroke="#9b6bff" stroke-width="3" ' + T + '/><rect x="16" y="10" width="32" height="9" rx="3" fill="#9b6bff"/>' +
    '<g stroke-width="3.4" ' + T + '><path d="M24 28l4-2" stroke="#ff4fa3"/><path d="M34 26l3 3" stroke="#3ee8ff"/><path d="M26 38l3 3" stroke="#ffd166"/><path d="M36 37l4-1" stroke="#7bc950"/><path d="M25 48l4-1" stroke="#3ee8ff"/><path d="M35 47l3 3" stroke="#ff4fa3"/><path d="M31 33l1 4" stroke="#8b5a3c"/></g>');
  S.polvilho = svg('<path d="M14 14h36l4 42H10z" fill="#fff" stroke="#2c7fb8" stroke-width="3" ' + T + '/><path d="M14 14q18-8 36 0" fill="none" stroke="#2c7fb8" stroke-width="3" ' + T + '/>' +
    '<rect x="16" y="28" width="32" height="14" rx="4" fill="#6cc3ff"/><circle cx="24" cy="49" r="2.4" fill="#d6e6f5"/><circle cx="32" cy="50" r="2.4" fill="#d6e6f5"/><circle cx="40" cy="49" r="2.4" fill="#d6e6f5"/>');

  // ---------- utensílios ----------
  S.jabuticaba = svg('<circle cx="24" cy="38" r="14" fill="#2b1030"/><circle cx="42" cy="34" r="14" fill="#3b1a3f"/><circle cx="34" cy="20" r="12" fill="#2b1030"/><ellipse cx="20" cy="32" rx="4" ry="2.6" fill="#fff" opacity=".5"/><ellipse cx="38" cy="28" rx="4" ry="2.6" fill="#fff" opacity=".5"/>');
  S.gelatina = svg('<path d="M14 12h36l-3 44H17z" fill="#ff5e7e" stroke="#c42d4f" stroke-width="3" stroke-linejoin="round"/><path d="M14 12h36" stroke="#c42d4f" stroke-width="5" stroke-linecap="round"/>' +
    '<ellipse cx="32" cy="36" rx="11" ry="9" fill="#fff" opacity=".9"/><path d="M25 38q7-8 14 0q-7 6-14 0z" fill="#e8344e"/><circle cx="29" cy="33" r="1.6" fill="#fff"/>');
  S.grelha = svg('<rect x="6" y="18" width="52" height="34" rx="5" fill="#4a5568" stroke="#2d3748" stroke-width="3"/>' +
    '<path d="M10 24h44M10 30h44M10 36h44M10 42h44M10 48h44" stroke="#a0aec0" stroke-width="2.4" stroke-linecap="round"/><path d="M2 30h6M56 30h6" stroke="#2d3748" stroke-width="4" stroke-linecap="round"/>');
  S.faca = '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M6 40c10-6 24-14 36-20 4-2 8 0 8 4 0 3-3 5-6 6L10 46c-3 1-6-3-4-6z" fill="#dfe6ee" stroke="#7d8a99" stroke-width="3" ' + T + '/>' +
    '<path d="M42 22l14-8a4 4 0 0 1 4 7L48 30" fill="#ff8a3d" stroke="#b85a1a" stroke-width="3" ' + T + '/></svg>';
  S.tabua = svg('<rect x="4" y="22" width="48" height="34" rx="10" fill="#d9a066" stroke="#8b5a2b" stroke-width="3"/><circle cx="46" cy="30" r="3" fill="#8b5a2b"/>' +
    '<path d="M18 30c8-5 18-10 28-15 3-1.5 6 0 6 3 0 2-2 4-4 4.5L22 40c-3 1-6-6-4-10z" fill="#e6ecf2" stroke="#7d8a99" stroke-width="3" ' + T + '/><path d="M48 15l8-5a3 3 0 0 1 3 5l-7 5" fill="#ff8a3d" stroke="#b85a1a" stroke-width="2.5" ' + T + '/>');
  S.liquidificador = svg('<path d="M18 6h28l-4 34H22z" fill="#d8f3ff" fill-opacity=".85" stroke="#2c7fb8" stroke-width="3" ' + T + '/><rect x="16" y="3" width="32" height="6" rx="2" fill="#2c7fb8"/>' +
    '<path d="M46 12h6v18h-8" fill="none" stroke="#2c7fb8" stroke-width="3" ' + T + '/><path d="M26 36l6-4 6 4" fill="none" stroke="#7d8a99" stroke-width="2.5" ' + T + '/>' +
    '<path d="M16 40h32l4 18H12z" fill="#e84a3c" stroke="#a62a1f" stroke-width="3" ' + T + '/><circle cx="32" cy="49" r="4" fill="#fff"/>');
  S.batedeira = svg('<path d="M10 56h44" stroke="#7d8a99" stroke-width="4" ' + T + '/><rect x="40" y="18" width="10" height="38" rx="4" fill="#ff8fb1" stroke="#c2456d" stroke-width="3"/>' +
    '<path d="M12 12h36a6 6 0 0 1 6 6v6H18a6 6 0 0 1-6-6z" fill="#ff8fb1" stroke="#c2456d" stroke-width="3" ' + T + '/><path d="M26 24v10M22 34c0 6 8 6 8 0M30 34c0 6-8 6-8 0" fill="none" stroke="#7d8a99" stroke-width="2.5" ' + T + '/>' +
    '<path d="M12 40h28l-4 14H16z" fill="#d8f3ff" stroke="#2c7fb8" stroke-width="3" ' + T + '/>');
  S.espremedor = svg('<ellipse cx="32" cy="48" rx="26" ry="9" fill="#ffd166" stroke="#c99700" stroke-width="3"/><path d="M8 46v-4h48v4" fill="#ffd166" stroke="#c99700" stroke-width="3" ' + T + '/>' +
    '<path d="M18 42c0-14 6-26 14-30 8 4 14 16 14 30z" fill="#fff4c2" stroke="#c99700" stroke-width="3" ' + T + '/><path d="M32 14v28M24 22l4 20M40 22l-4 20" stroke="#e0b100" stroke-width="2" ' + T + '/><path d="M56 44h4" stroke="#c99700" stroke-width="4" ' + T + '/>');
  S.panela = svg('<path d="M10 26h44v20a10 10 0 0 1-10 10H20a10 10 0 0 1-10-10z" fill="#8d99ae" stroke="#4a5568" stroke-width="3" ' + T + '/><path d="M2 30h8M54 30h8" stroke="#4a5568" stroke-width="5" ' + T + '/>' +
    '<ellipse cx="32" cy="26" rx="22" ry="5" fill="#b8c2d1" stroke="#4a5568" stroke-width="3"/><path d="M24 16c0-4 4-4 4-8M34 16c0-4 4-4 4-8" fill="none" stroke="#c9d3e0" stroke-width="2.5" ' + T + '/>');
  S.espatula = svg('<path d="M30 4h4v30h-4z" fill="#8b5a2b" stroke="#5c3a1a" stroke-width="2.5" ' + T + '/><path d="M20 34h24v18a6 6 0 0 1-6 6H26a6 6 0 0 1-6-6z" fill="#e84a3c" stroke="#a62a1f" stroke-width="3" ' + T + '/>' +
    '<path d="M28 40v12M36 40v12" stroke="#ffb3a8" stroke-width="2.5" ' + T + '/>');
  S.fogao = svg('<rect x="6" y="14" width="52" height="46" rx="6" fill="#fdfdfd" stroke="#7d8a99" stroke-width="3"/><rect x="6" y="6" width="52" height="10" rx="3" fill="#e6ecf2" stroke="#7d8a99" stroke-width="3"/>' +
    '<circle cx="21" cy="28" r="7" fill="#2d3748"/><circle cx="43" cy="28" r="7" fill="#2d3748"/><circle cx="21" cy="46" r="7" fill="#2d3748"/><circle cx="43" cy="46" r="7" fill="#2d3748"/>' +
    '<circle cx="16" cy="11" r="2.5" fill="#e84a3c"/><circle cx="26" cy="11" r="2.5" fill="#e84a3c"/><circle cx="38" cy="11" r="2.5" fill="#e84a3c"/><circle cx="48" cy="11" r="2.5" fill="#e84a3c"/>');
  S.forma = svg('<path d="M4 26h56l-6 22H10z" fill="#9aa5b4" stroke="#4a5568" stroke-width="3" ' + T + '/><path d="M8 30h48l-4 14H12z" fill="#c9d3e0"/><path d="M2 26h60" stroke="#4a5568" stroke-width="4" ' + T + '/>');
  S.forno = svg('<rect x="6" y="6" width="52" height="54" rx="6" fill="#fdfdfd" stroke="#7d8a99" stroke-width="3"/><circle cx="18" cy="14" r="3.5" fill="#2d3748"/><circle cx="30" cy="14" r="3.5" fill="#2d3748"/><rect x="40" y="11" width="12" height="6" rx="2" fill="#3aa0e8"/>' +
    '<rect x="12" y="24" width="40" height="30" rx="4" fill="#2d3748" stroke="#7d8a99" stroke-width="3"/><rect x="16" y="28" width="32" height="22" rx="3" fill="#ffb347" fill-opacity=".55"/><path d="M18 22h28" stroke="#7d8a99" stroke-width="4" ' + T + '/>');
  S.geladeira = svg('<rect x="12" y="2" width="40" height="60" rx="7" fill="#e8f6ff" stroke="#2c7fb8" stroke-width="3"/><path d="M12 24h40" stroke="#2c7fb8" stroke-width="3"/>' +
    '<path d="M18 10v8M18 30v14" stroke="#2c7fb8" stroke-width="4" ' + T + '/><circle cx="40" cy="12" r="4" fill="#ff4fa3"/><rect x="34" y="34" width="10" height="10" rx="2" fill="#ffd166" transform="rotate(-8 39 39)"/>');

  // ---------- ícone do app (chapéu de cozinheiro, tigela e cenoura) ----------
  S.app = '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="f" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#ffe3a3"/><stop offset="1" stop-color="#ff8a3d"/></radialGradient></defs>' +
    '<rect width="512" height="512" rx="110" fill="url(#f)"/>' +
    '<g transform="translate(256 168)"><path d="M-110 40c-40 0-60-30-60-60 0-40 40-66 78-54 10-40 50-62 92-62s82 22 92 62c38-12 78 14 78 54 0 30-20 60-60 60z" fill="#fff" stroke="#d76b1f" stroke-width="14" stroke-linejoin="round"/>' +
    '<rect x="-104" y="34" width="208" height="56" rx="14" fill="#fff" stroke="#d76b1f" stroke-width="14"/><path d="M-50 44v36M0 44v36M50 44v36" stroke="#ffd2b0" stroke-width="12" stroke-linecap="round"/></g>' +
    '<path d="M96 300h320c0 96-72 156-160 156S96 396 96 300z" fill="#3aa0e8" stroke="#1d5f99" stroke-width="14" stroke-linejoin="round"/><path d="M136 330h240" stroke="#9ad4ff" stroke-width="14" stroke-linecap="round"/>' +
    '<g transform="rotate(28 352 266)"><path d="M338 210l28 0-14 120z" fill="#ff7a1a" stroke="#c2510a" stroke-width="10" stroke-linejoin="round"/><path d="M344 210c-12-26-6-40 8-48M352 210c0-22 8-34 22-40M360 210c10-18 22-24 36-22" fill="none" stroke="#2bb673" stroke-width="12" stroke-linecap="round"/></g>' +
    '<circle cx="190" cy="282" r="22" fill="#e84a3c"/><path d="M190 260c4-10 12-14 20-14" stroke="#2bb673" stroke-width="8" fill="none" stroke-linecap="round"/>' +
    '<circle cx="230" cy="380" r="16" fill="#fff" opacity=".85"/><circle cx="282" cy="380" r="16" fill="#fff" opacity=".85"/><path d="M226 404q30 26 60 0" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/></svg>';

  // ---------- plantas do pomar e da horta: cada fruta e cada legume na sua planta de verdade ----------
  // Pomar: quadro 100 × 125 (o chão fica em y ≈ 110). FRUTOS[planta] = onde ficam os botões das frutas, no mesmo
  // sistema de medidas (x e y em unidades do quadro; o app converte em %). Horta: quadro 100 × 110, terra em y = 58.
  function q(n) { return Math.round(n * 10) / 10; }
  function chao() { return '<ellipse cx="50" cy="117" rx="50" ry="10" fill="#7fcf5a"/><ellipse cx="50" cy="113" rx="44" ry="5" fill="#93dc6c"/>'; }
  function moita(lista, cores) {   // copa de árvore: círculos com sombra, cor e brilho
    var h = '';
    lista.forEach(function (c) { h += '<circle cx="' + (c[0] + 2) + '" cy="' + (c[1] + 3) + '" r="' + c[2] + '" fill="' + cores[2] + '"/>'; });
    lista.forEach(function (c) { h += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + cores[1] + '"/>'; });
    lista.forEach(function (c) { h += '<circle cx="' + q(c[0] - c[2] * 0.25) + '" cy="' + q(c[1] - c[2] * 0.3) + '" r="' + q(c[2] * 0.5) + '" fill="' + cores[0] + '" opacity=".3"/>'; });
    return h;
  }
  var TRONCO = '<path d="M43 112 Q46 92 45 78 Q43 70 35 62 L38 59 Q46 65 48.5 70 Q51 63 61 56 L63 59 Q55 66 54.5 78 Q54 94 57.5 112 Z" fill="#8b5a2b" stroke="#5c3a1a" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M48 108 Q49 92 48.5 80" stroke="#a8713e" stroke-width="2" fill="none" stroke-linecap="round"/>';
  function folhaBanana(x, y, ang, L, larg, cor, espelho) {   // folha larga e comprida da bananeira, caindo na ponta, com rasgos
    var w = larg, rasgos = '';
    [0.42, 0.62, 0.8].forEach(function (t, i) { var bx = L * t, by = 9 * t * t - 1.5; var sn = i % 2 ? 1 : -1; rasgos += 'M' + q(bx) + ' ' + q(by + sn * w * 0.95) + ' L' + q(bx - 2) + ' ' + q(by + sn * w * 0.4) + ' '; });
    return '<g transform="translate(' + x + ' ' + y + ') ' + (espelho ? 'scale(-1 1) ' : '') + 'rotate(' + ang + ')">' +
      '<path d="M0 0 C' + q(L * 0.12) + ' ' + q(-w * 1.25) + ' ' + q(L * 0.82) + ' ' + q(-w * 1.25) + ' ' + L + ' 9 C' + q(L * 0.82) + ' ' + q(w * 1.15) + ' ' + q(L * 0.12) + ' ' + q(w * 0.95) + ' 0 0 Z" fill="' + cor + '" stroke="#2f6b2a" stroke-width="1" stroke-linejoin="round"/>' +
      '<path d="' + rasgos + '" stroke="#e6f7ff" stroke-width="1" fill="none" stroke-linecap="round"/>' +
      '<path d="M0 0 C' + q(L * 0.3) + ' -2 ' + q(L * 0.78) + ' 0 ' + L + ' 9" stroke="#d9efb0" stroke-width="1.6" fill="none"/></g>';
  }
  function folhaUva(x, y, r, cor) {   // folha de parreira (5 pontas arredondadas)
    return '<path transform="translate(' + x + ' ' + y + ') scale(' + r + ')" d="M0 7 C-3 6 -9 6 -9 1 C-11 -2 -8 -5 -5 -4 C-6 -8 -2 -10 0 -7 C2 -10 6 -8 5 -4 C8 -5 11 -2 9 1 C9 6 3 6 0 7 Z" fill="' + cor + '" stroke="#2f6b2a" stroke-width=".25" stroke-linejoin="round"/>';
  }
  function trevo(x, y, s, ang) {   // folha do morango: 3 folhinhas serrilhadas
    var f = function (a) { return '<g transform="rotate(' + a + ')"><ellipse cx="0" cy="-7" rx="4.6" ry="6.2" fill="#3f9b3f" stroke="#2a6e2a" stroke-width=".7"/><path d="M0 -1.5 V-12" stroke="#2a6e2a" stroke-width=".6"/></g>'; };
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + ang + ') scale(' + s + ')">' + f(-48) + f(48) + f(0) + '</g>';
  }
  function flor(x, y, s, miolo) {
    var h = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">';
    for (var i = 0; i < 5; i++) h += '<circle cx="' + q(Math.cos(i * 1.2566 - 1.57) * 2.2) + '" cy="' + q(Math.sin(i * 1.2566 - 1.57) * 2.2) + '" r="1.7" fill="#fff"/>';
    return h + '<circle r="1.1" fill="' + (miolo || '#ffd23f') + '"/></g>';
  }
  var PL = {};
  PL.macieira = chao() + TRONCO + moita([[50, 40, 27], [27, 48, 17], [73, 48, 17], [35, 25, 16], [65, 25, 16], [50, 60, 18], [30, 64, 12], [70, 64, 12]], ['#a5e070', '#5cb845', '#3d8a32']);
  PL.laranjeira = chao() + TRONCO + moita([[50, 38, 28], [26, 46, 18], [74, 46, 18], [36, 24, 17], [64, 24, 17], [50, 60, 19], [30, 63, 13], [70, 63, 13]], ['#5fb35a', '#2e8540', '#1f5f2c']) +
    flor(42, 20, 0.8) + flor(80, 40, 0.8) + flor(20, 58, 0.8) + flor(58, 52, 0.7);   // a laranjeira tem flor branca e fruta ao mesmo tempo
  PL.limoeiro = chao() + '<path d="M44 112 Q47 98 46 88 Q42 80 33 76 L35 73 Q45 78 49 83 Q52 76 63 72 L64 75 Q55 80 54.5 88 Q54 100 56.5 112 Z" fill="#8b5a2b" stroke="#5c3a1a" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M36 76 l-3 -2 M60 74 l2 -3 M46 92 l-3 1" stroke="#5c3a1a" stroke-width="1" stroke-linecap="round"/>' +   // espinhos
    moita([[50, 50, 24], [24, 58, 17], [76, 58, 17], [34, 38, 16], [66, 38, 16], [50, 70, 15], [28, 72, 11], [72, 72, 11]], ['#b8e07a', '#62a83f', '#3f7a2c']) + flor(60, 34, 0.7, '#f3e9a0') + flor(28, 50, 0.7, '#f3e9a0');
  PL.bananeira = chao() +
    '<path d="M46 64 C38 70 37 84 40 98 C42 88 44 76 47 68 Z" fill="#b08a4a" stroke="#7a5a2a" stroke-width="1" stroke-linejoin="round"/>' +   // folha velha, seca, pendurada no tronco
    folhaBanana(47, 40, -155, 40, 10, '#3d8f37', false) +
    '<path d="M41 112 Q43 78 45.5 42 L54.5 42 Q57 78 59 112 Z" fill="#8aa856" stroke="#4f6b2c" stroke-width="1.4" stroke-linejoin="round"/>' +
    '<path d="M46 108 Q47 80 48 46 M53 108 Q53 80 52 46" stroke="#5d7a35" stroke-width="1.1" fill="none" opacity=".7"/>' +
    '<path d="M43 98 q3 -3 6 0 M52 84 q3 -3 5 1 M46 66 q2 -2 4 0" stroke="#8b6b3a" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    folhaBanana(50, 41, -5, 44, 10, '#4fae43', true) +
    folhaBanana(50, 40, -50, 40, 10, '#5cbf4a', true) + folhaBanana(50, 40, -40, 38, 9.5, '#4fae43', false) +
    folhaBanana(49, 40, -88, 32, 8.5, '#6ccb55', false) +
    // o cacho: o "engaço" sai do alto, faz a curva e desce; no fim, o coração roxo da bananeira
    '<path d="M51 44 Q68 40 71 54 L72 88" stroke="#6b8a3a" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
    '<path d="M72 86 C79 89 80 99 72 109 C64 99 65 89 72 86 Z" fill="#7b2d5b" stroke="#4e1636" stroke-width="1.2" stroke-linejoin="round"/>' +
    '<path d="M72 87 C76 91 76 98 72 104" stroke="#b25588" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  var UVAS = [[24, 54], [50, 50], [76, 56]];
  PL.parreira = chao() +
    '<rect x="7" y="27" width="6" height="86" rx="1.5" fill="#9a6a3a" stroke="#5c3a1a" stroke-width="1.3"/><rect x="87" y="27" width="6" height="86" rx="1.5" fill="#9a6a3a" stroke="#5c3a1a" stroke-width="1.3"/>' +
    '<rect x="2" y="24" width="96" height="6" rx="2" fill="#b07a44" stroke="#5c3a1a" stroke-width="1.3"/><path d="M14 30 L22 24 M46 30 L54 24 M78 30 L86 24" stroke="#5c3a1a" stroke-width="1"/>' +
    '<path d="M30 113 C24 98 36 86 28 72 C22 60 34 50 28 38 C26 33 30 29 34 27" stroke="#6e4423" stroke-width="3.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M30 60 c6 -2 6 -8 2 -8 M34 40 c5 1 7 -4 3 -6 M60 31 c3 4 8 2 6 -2" stroke="#7fae3a" stroke-width=".9" fill="none" stroke-linecap="round"/>' +   // gavinhas que se enrolam
    UVAS.map(function (u) { return '<path d="M' + u[0] + ' 30 Q' + (u[0] + 2) + ' 38 ' + u[0] + ' ' + (u[1] - 8) + '" stroke="#6e4423" stroke-width="1.4" fill="none"/>'; }).join('') +
    [[14, 22, 0.85, '#4fae43'], [24, 31, 0.8, '#3d8f37'], [35, 21, 0.9, '#5cbf4a'], [46, 32, 0.75, '#4fae43'], [58, 21, 0.85, '#3d8f37'], [68, 32, 0.8, '#5cbf4a'], [79, 21, 0.9, '#4fae43'], [88, 31, 0.75, '#3d8f37'], [32, 46, 0.7, '#5cbf4a'], [24, 84, 0.7, '#4fae43'], [35, 66, 0.65, '#3d8f37']]
      .map(function (f) { return folhaUva(f[0], f[1], f[2], f[3]); }).join('');
  PL.morangueiro = chao() +
    '<path d="M2 112 Q8 96 50 95 Q92 96 98 112 Z" fill="#8b5a3c"/><path d="M8 104 l5 -2 M20 100 l6 1 M36 98 l5 -1 M58 98 l6 1 M74 100 l5 -1 M88 104 l5 1 M28 106 l6 0 M66 106 l6 -1" stroke="#f1d27a" stroke-width="1.2" stroke-linecap="round"/>' +   // canteiro com palha
    [[18, 96], [50, 94], [82, 96]].map(function (b) {
      var x = b[0], y = b[1];
      return '<path d="M' + x + ' ' + y + ' Q' + (x - 9) + ' ' + (y - 16) + ' ' + (x - 12) + ' ' + (y - 26) + ' M' + x + ' ' + y + ' Q' + (x + 1) + ' ' + (y - 20) + ' ' + x + ' ' + (y - 34) + ' M' + x + ' ' + y + ' Q' + (x + 9) + ' ' + (y - 16) + ' ' + (x + 12) + ' ' + (y - 26) +
        ' M' + x + ' ' + y + ' Q' + (x - 6) + ' ' + (y - 8) + ' ' + (x - 10) + ' ' + (y - 6) + ' M' + x + ' ' + y + ' Q' + (x + 6) + ' ' + (y - 8) + ' ' + (x + 10) + ' ' + (y - 6) + '" stroke="#3a8a30" stroke-width="1.3" fill="none" stroke-linecap="round"/>' +
        trevo(x - 12, y - 26, 0.95, -30) + trevo(x, y - 34, 1.05, 0) + trevo(x + 12, y - 26, 0.95, 30) + flor(x - 6, y - 14, 0.9) + flor(x + 7, y - 13, 0.8);
    }).join('');
  // jaboticabeira (v0.10.0, referência do dono): tronco claro e liso, galhos abertos e copa pequena lá em cima; a
  // jabuticaba nasce GRUDADA no tronco e nos galhos grossos (o jogo ensina isso)
  PL.jaboticabeira = chao() +
    '<path d="M42 113 Q44 92 43 74 Q38 62 26 52 L29 48 Q40 56 46 64 Q48 52 47 40 L53 40 Q53 54 54 63 Q61 52 72 46 L74 50 Q62 58 57 72 Q56 92 58 113 Z" fill="#c9b49a" stroke="#8a7458" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M45 104 q3 -2 5 0 M52 90 q3 -2 4 1 M46 80 q2 -2 4 0" stroke="#a8927a" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
    moita([[50, 26, 17], [30, 36, 12], [70, 34, 12], [38, 18, 11], [62, 18, 11]], ['#a5e070', '#5cb845', '#3d8a32']);
  var FRUTOS = {
    macieira: [[30, 36], [69, 34], [36, 62], [66, 60]],
    laranjeira: [[30, 36], [69, 34], [36, 62], [66, 60]],
    limoeiro: [[28, 52], [72, 50], [42, 72], [64, 74]],
    bananeira: [[72, 58], [72, 78]],
    parreira: UVAS,
    morangueiro: [[11, 98], [37, 101], [63, 101], [89, 98]],
    jaboticabeira: [[48, 104], [53, 88], [46, 72], [30, 55], [71, 53]]
  };
  function planta(id) { return PL[id] ? '<svg class="pl-desenho" viewBox="0 0 100 125" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">' + PL[id] + '</svg>' : ''; }
  // a "penca" de bananas (os dedos apontam para cima, como no cacho de verdade). Verde = ainda não está madura.
  S.penca = '<svg viewBox="0 0 56 34" aria-hidden="true" focusable="false"><path d="M6 31 Q28 25 50 31" stroke="#6b5a2a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    [[9, -7], [18, -3], [28, 0], [38, 3], [47, 7]].map(function (d) {
      var x = d[0], dx = d[1];
      return '<path d="M' + (x - 3.5) + ' 30 Q' + (x - 5 + dx * 0.4) + ' 16 ' + (x + dx - 1.5) + ' 5 L' + (x + dx + 1.8) + ' 4.5 Q' + (x + 3 + dx * 0.4) + ' 16 ' + (x + 3.5) + ' 30 Z" fill="#ffd23f" stroke="#b88a00" stroke-width="1.3" stroke-linejoin="round"/>' +
        '<path d="M' + (x + dx - 1.4) + ' 5.6 L' + (x + dx + 1.6) + ' 5" stroke="#5c3a1a" stroke-width="2.2" stroke-linecap="round"/>';
    }).join('') + '</svg>';
  // frutas "de massinha" (v0.9.0, referência do dono): bolinhas gordinhas com gradiente, brilho e folhinha, no pé
  function grad(id, cor, claro, escuro) { return '<radialGradient id="' + id + '" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="' + claro + '"/><stop offset=".55" stop-color="' + cor + '"/><stop offset="1" stop-color="' + escuro + '"/></radialGradient>'; }
  function brilho(x, y) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="4.5" ry="3" fill="#fff" opacity=".55" transform="rotate(-30 ' + x + ' ' + y + ')"/>'; }
  var FOLHA = '<path d="M33 9 q9 -7 16 -2 q-7 7 -16 2z" fill="#4caf50" stroke="#2e7d32" stroke-width="1"/><path d="M32 6 v6" stroke="#6b4423" stroke-width="2.4" stroke-linecap="round"/>';
  var MASSINHA = {
    laranja: '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs>' + grad('gLar', '#ff9a1f', '#ffd27a', '#e06a00') + '</defs><circle cx="32" cy="36" r="24" fill="url(#gLar)"/>' + brilho(23, 26) + '<circle cx="32" cy="14" r="2" fill="#8a5a2b"/>' + FOLHA + '</svg>',
    maca: '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs>' + grad('gMac', '#e8342e', '#ff8f80', '#a11a16') + '</defs><path d="M32 16 C18 8 6 20 9 36 C12 54 24 60 32 56 C40 60 52 54 55 36 C58 20 46 8 32 16Z" fill="url(#gMac)"/>' + brilho(21, 26) + FOLHA + '</svg>',
    limao: '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs>' + grad('gLim', '#ffe03a', '#fff6a8', '#c9a800') + '</defs><ellipse cx="32" cy="36" rx="26" ry="19" fill="url(#gLim)"/><path d="M5 36 l-3 0 M59 36 l3 0" stroke="#c9a800" stroke-width="4" stroke-linecap="round"/>' + brilho(22, 28) + FOLHA + '</svg>',
    morango: '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs>' + grad('gMor', '#ff2f4f', '#ff9aa8', '#b3001f') + '</defs><path d="M32 60 C14 46 8 30 14 20 C20 12 44 12 50 20 C56 30 50 46 32 60Z" fill="url(#gMor)"/>' +
      [[22, 26], [32, 24], [42, 26], [26, 36], [38, 36], [32, 46], [20, 32], [44, 32]].map(function (p) { return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="1.4" ry="2" fill="#ffe38a"/>'; }).join('') +
      '<path d="M16 18 q8 2 16 -6 q8 8 16 6 q-4 6 -16 4 q-12 2 -16 -4z" fill="#3fae4a" stroke="#2e7d32" stroke-width="1"/>' + brilho(22, 24) + '</svg>',
    jabuticaba: '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs>' + grad('gJab', '#3b1a3f', '#8a5a94', '#14061a') + '</defs><circle cx="32" cy="32" r="26" fill="url(#gJab)"/>' + brilho(22, 22) + '<circle cx="32" cy="8" r="2.4" fill="#5b4636"/></svg>',
    uva: '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs>' + grad('gUva', '#8e44ad', '#d6a6f0', '#4a1a63') + '</defs>' +
      [[22, 20], [34, 19], [46, 21], [16, 31], [28, 31], [40, 31], [52, 32], [22, 42], [34, 42], [46, 42], [28, 52], [40, 52], [34, 61]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + (p[1] - 2) + '" r="7" fill="url(#gUva)"/>'; }).join('') +
      '<path d="M34 12 v-8" stroke="#6b4423" stroke-width="3" stroke-linecap="round"/><path d="M36 8 q12 -8 20 0 q-10 8 -20 0z" fill="#4caf50"/>' + brilho(19, 16) + '</svg>'
  };
  function fruto(ing) {
    if (ing === 'banana') return '<span class="ic ic-svg">' + S.penca + '</span>';
    return MASSINHA[ing] ? '<span class="ic ic-svg massinha">' + MASSINHA[ing] + '</span>' : null;
  }

  // horta: a planta (com o legume, quando ele fica embaixo da terra) e o que se colhe
  var HO = {};
  function rama(x, y, ang, L) {   // folhinha recortada da cenoura
    var h = '<g transform="translate(' + x + ' ' + y + ') rotate(' + ang + ')"><path d="M0 0 V' + (-L) + '" stroke="#3f9b3f" stroke-width="1.6" stroke-linecap="round"/>';
    for (var i = 1; i <= 4; i++) { var yy = -L * i / 4.5; h += '<ellipse cx="-3" cy="' + q(yy) + '" rx="3.2" ry="1.6" fill="#4fae43" transform="rotate(-30 -3 ' + q(yy) + ')"/><ellipse cx="3" cy="' + q(yy - 1.5) + '" rx="3.2" ry="1.6" fill="#5cbf4a" transform="rotate(30 3 ' + q(yy - 1.5) + ')"/>'; }
    return h + '<ellipse cx="0" cy="' + (-L - 1) + '" rx="2" ry="3" fill="#5cbf4a"/></g>';
  }
  HO.cenoura = rama(50, 58, -28, 34) + rama(50, 58, 0, 42) + rama(50, 58, 26, 34) + rama(50, 58, -12, 38) + rama(50, 58, 13, 38) +
    '<path d="M41 56 Q50 52 59 56 Q57 74 51 101 Q50 103 49 101 Q43 74 41 56 Z" fill="#ff8a1f" stroke="#c2510a" stroke-width="1.4" stroke-linejoin="round"/>' +
    '<path d="M44 66 h5 M52 74 h4 M45 82 h4 M51 90 h3" stroke="#c2510a" stroke-width="1.1" stroke-linecap="round"/><path d="M50 101 Q51 106 49 110" stroke="#c9a27a" stroke-width=".8" fill="none"/>';
  HO.batata = '<path d="M50 58 Q42 46 30 40 M50 58 Q50 40 50 24 M50 58 Q58 46 70 40 M50 58 Q60 64 72 78 M50 58 Q40 66 30 80 M50 58 L50 84" stroke="#3a8a30" stroke-width="1.3" fill="none"/>' +   // caule e raízes
    [[30, 40, 9], [42, 30, 9], [58, 30, 9], [70, 40, 9], [50, 22, 8], [36, 50, 7], [64, 50, 7]].map(function (f) { return '<ellipse cx="' + f[0] + '" cy="' + f[1] + '" rx="' + f[2] + '" ry="' + q(f[2] * 0.62) + '" fill="#4fae43" stroke="#2f6b2a" stroke-width=".9"/>'; }).join('') +
    flor(50, 14, 0.9, '#ffd23f') + flor(40, 20, 0.7, '#ffd23f') +
    [[30, 82, 10, 7], [50, 88, 11, 8], [71, 79, 10, 7]].map(function (b) { return '<ellipse cx="' + b[0] + '" cy="' + b[1] + '" rx="' + b[2] + '" ry="' + b[3] + '" fill="#d9a066" stroke="#8b5a2b" stroke-width="1.3"/><circle cx="' + (b[0] - 3) + '" cy="' + (b[1] - 2) + '" r=".9" fill="#8b5a2b"/><circle cx="' + (b[0] + 4) + '" cy="' + (b[1] + 1) + '" r=".9" fill="#8b5a2b"/>'; }).join('');
  HO.tomate = '<g transform="translate(50 60) scale(.88) translate(-50 -60)"><rect x="64" y="6" width="5" height="70" rx="1.5" fill="#c99a5b" stroke="#7a5426" stroke-width="1.2"/>' +   // a estaca
    '<path d="M50 60 Q48 40 56 26 Q62 16 66 10" stroke="#3a8a30" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M62 22 h9 M58 38 h11" stroke="#e8d9a0" stroke-width="2" stroke-linecap="round"/>' +   // amarrado na estaca
    [[40, 22, -20], [44, 40, -30], [62, 32, 20], [34, 34, -40], [56, 48, 30], [50, 14, -10], [72, 18, 30]].map(function (f) { return '<g transform="translate(' + f[0] + ' ' + f[1] + ') rotate(' + f[2] + ')"><ellipse cx="0" cy="0" rx="9" ry="4.4" fill="#4fae43" stroke="#2f6b2a" stroke-width=".9"/><path d="M-8 0 H8" stroke="#2f6b2a" stroke-width=".6"/></g>'; }).join('') +
    '<circle cx="34" cy="48" r="6" fill="#8fd36a" stroke="#4f8a2a" stroke-width="1.1"/><circle cx="62" cy="58" r="5" fill="#a9de7a" stroke="#4f8a2a" stroke-width="1.1"/></g>';   // tomates verdes (ainda crescendo)
  HO.alface = '<g transform="translate(50 60) scale(1.45) translate(-50 -60)"><g stroke="#4f8a2a" stroke-width="1.1" stroke-linejoin="round">' +
    '<path d="M20 60 C10 40 28 30 36 46 C38 30 62 30 64 46 C72 30 90 40 80 60 Z" fill="#7ccc4f"/>' +
    '<path d="M28 60 C22 44 38 36 44 48 C46 36 58 36 58 48 C64 38 78 44 72 60 Z" fill="#a8e070"/>' +
    '<path d="M36 60 C34 48 46 42 50 50 C54 42 66 48 64 60 Z" fill="#d4f29c"/></g>' +
    '<path d="M50 58 V48 M42 58 Q40 50 36 47 M58 58 Q60 50 64 47" stroke="#8fc45a" stroke-width="1" fill="none"/></g>';
  HO.cheiro = '<g stroke-linecap="round">' + [36, 40, 44, 48].map(function (x, i) { return '<path d="M' + x + ' 60 Q' + (x - 4 + i) + ' 34 ' + (x - 8 + i * 2) + ' 14" stroke="#2f9a46" stroke-width="2.4" fill="none"/>'; }).join('') +   // cebolinha
    [[60, 30], [70, 24], [66, 40], [76, 38], [56, 44]].map(function (c) { return '<path d="M60 60 Q' + c[0] + ' ' + (c[1] + 14) + ' ' + c[0] + ' ' + c[1] + '" stroke="#3a8a30" stroke-width="1.2" fill="none"/>' +
      '<g fill="#4fae43" stroke="#2f6b2a" stroke-width=".6"><circle cx="' + (c[0] - 3) + '" cy="' + c[1] + '" r="3.2"/><circle cx="' + (c[0] + 3) + '" cy="' + (c[1] - 1) + '" r="3.2"/><circle cx="' + c[0] + '" cy="' + (c[1] - 4) + '" r="3.2"/></g>'; }).join('') + '</g>';   // salsinha
  function horta(id) { return HO[id] ? '<svg class="pl-desenho" viewBox="0 0 100 110" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' + HO[id] + '</svg>' : ''; }

  var D = (typeof module !== 'undefined' && module.exports) ? require('./dados.js') : raiz.CozinhaDados;
  // Ingrediente e receita têm foto de verdade (fotos/<id>.jpg, fotos livres da Wikimedia Commons; CREDITOS.md).
  // icone(id) mostra a foto num círculo; icone(id, true) mostra o desenho/emoji (frutas no pé, legumes na terra).
  function foto(id) { return (D.ingrediente[id] || D.receita[id]) ? 'fotos/' + id + '.jpg' : ''; }
  function imgFoto(id, cls) { return '<span class="ic ic-foto' + (cls ? ' ' + cls : '') + '"><img src="' + foto(id) + '" alt="" draggable="false" decoding="async"></span>'; }
  // v0.12.0: ícones em 3D (render/<id>.webp para ingredientes e render/u-<id>.webp para utensílios), feitos no Higgsfield
  // (modelo Qwen-Image, licença Apache 2.0) com o fundo tirado; CREDITOS.md. RENDER lista os que já existem.
  var RENDER = {};
  ('banana cenoura farinha jabuticaba laranja leite limao maca morango ovo peixe queijo tomate u-liquidificador uva')
    .split(' ').forEach(function (k) { RENDER[k] = true; });
  function render(id) { var k = D.ingrediente[id] ? id : 'u-' + id; return RENDER[k] ? 'render/' + k + '.webp' : ''; }
  function icone(id, desenho) {
    var x = D.ingrediente[id] || D.utensilio[id];
    if (!x) return '';
    if (!desenho && render(id)) return '<span class="ic ic-3d"><img src="' + render(id) + '" alt="" draggable="false" decoding="async"></span>';
    if (!desenho && D.ingrediente[id]) return imgFoto(id);
    if (x.s && S[x.s]) return '<span class="ic ic-svg">' + S[x.s] + '</span>';
    return '<span class="ic">' + x.e + '</span>';
  }

  var API = { S: S, icone: icone, render: render, RENDER: RENDER, foto: foto, imgFoto: imgFoto, planta: planta, FRUTOS: FRUTOS, fruto: fruto, horta: horta };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else raiz.CozinhaDesenhos = API;
})(typeof self !== 'undefined' ? self : this);
