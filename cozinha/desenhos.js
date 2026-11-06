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

  var D = (typeof module !== 'undefined' && module.exports) ? require('./dados.js') : raiz.CozinhaDados;
  function icone(id) {
    var x = D.ingrediente[id] || D.utensilio[id];
    if (!x) return '';
    if (x.s && S[x.s]) return '<span class="ic ic-svg">' + S[x.s] + '</span>';
    return '<span class="ic">' + x.e + '</span>';
  }

  var API = { S: S, icone: icone };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else raiz.CozinhaDesenhos = API;
})(typeof self !== 'undefined' ? self : this);
