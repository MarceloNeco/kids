/* Bagunçolândia — catálogo de figuras (SVG desenhado aqui, sem arte de terceiros).
   Cada figura: id, papel (fruta | doce | bola | heroi | vilao | poder), nome PT/EN/ES, turma
   (propria | publica | minhas), raio no palco (px, em 1280×720), cor do "suco" ao cortar e o svg
   (viewBox 0 0 100 100). As suas imagens vêm de meus/personagens.json (ver LEIA-ME.md).
   Também roda no Node (só o catálogo); rasterizar() precisa de navegador. */
(function (root, fabrica) {
  if (typeof module !== 'undefined' && module.exports) module.exports = fabrica();
  else root.Figuras = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- peças reutilizáveis ---------- */
  var defs = {};
  function grad(id, c1, c2, radial) {
    if (!defs[id]) defs[id] = radial
      ? '<radialGradient id="' + id + '" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></radialGradient>'
      : '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient>';
    return 'url(#' + id + ')';
  }
  function svg(corpo, ids) {
    var d = (ids || []).map(function (k) { return defs[k]; }).join('');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>' + d + '</defs>' + corpo + '</svg>';
  }
  var BRILHO = '<ellipse cx="36" cy="28" rx="11" ry="6" fill="#fff" opacity=".35" transform="rotate(-25 36 28)"/>';
  /* carinha simpática: olhos grandes com brilho e sorriso; humor: feliz | bravo | surpreso | ninja */
  function cara(x, y, esc, humor, corBoca) {
    esc = esc || 1; corBoca = corBoca || '#3a1d2b';
    var o = '', dx = 11 * esc, ry = 7 * esc, rx = 5.5 * esc;
    if (humor === 'ninja') return '<g transform="translate(' + x + ' ' + y + ')"><rect x="-22" y="-9" width="44" height="14" rx="4" fill="#1f1b3a"/><ellipse cx="-9" cy="-2" rx="4.5" ry="3" fill="#fff"/><ellipse cx="9" cy="-2" rx="4.5" ry="3" fill="#fff"/><circle cx="-8" cy="-2" r="2" fill="#1f1b3a"/><circle cx="10" cy="-2" r="2" fill="#1f1b3a"/><path d="M-22 -4 l-12 -8 M-22 -2 l-13 2" stroke="#1f1b3a" stroke-width="3" stroke-linecap="round"/></g>';
    o += '<g transform="translate(' + x + ' ' + y + ')">';
    o += '<ellipse cx="' + (-dx) + '" cy="0" rx="' + rx + '" ry="' + ry + '" fill="#fff"/><ellipse cx="' + dx + '" cy="0" rx="' + rx + '" ry="' + ry + '" fill="#fff"/>';
    var py = humor === 'surpreso' ? 1 : 1.5, pr = 3 * esc;
    o += '<circle cx="' + (-dx + 1.5) + '" cy="' + py + '" r="' + pr + '" fill="#1f1b3a"/><circle cx="' + (dx + 1.5) + '" cy="' + py + '" r="' + pr + '" fill="#1f1b3a"/>';
    o += '<circle cx="' + (-dx + 2.6) + '" cy="' + (py - 1.2) + '" r="1.1" fill="#fff"/><circle cx="' + (dx + 2.6) + '" cy="' + (py - 1.2) + '" r="1.1" fill="#fff"/>';
    if (humor === 'bravo') o += '<path d="M' + (-dx - 6) + ' -10 l12 4 M' + (dx + 6) + ' -10 l-12 4" stroke="#1f1b3a" stroke-width="3" stroke-linecap="round"/><path d="M-9 14 q9 -7 18 0" stroke="' + corBoca + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>';
    else if (humor === 'surpreso') o += '<ellipse cx="0" cy="14" rx="4.5" ry="5.5" fill="' + corBoca + '"/>';
    else o += '<path d="M-10 10 q10 12 20 0" stroke="' + corBoca + '" stroke-width="3.2" fill="none" stroke-linecap="round"/><ellipse cx="' + (-dx - 7) + '" cy="9" rx="4" ry="2.5" fill="#ff7aa8" opacity=".55"/><ellipse cx="' + (dx + 7) + '" cy="9" rx="4" ry="2.5" fill="#ff7aa8" opacity=".55"/>';
    o += '</g>';
    return o;
  }

  var F = [];
  function add(f) { F.push(f); return f; }

  /* ================= FRUTAS (cortar) ================= */
  grad('melG', '#ff6b7f', '#d8213f', true); grad('melCasca', '#9be15d', '#2e8b2e');
  add({ id: 'melancia', papel: 'fruta', turma: 'propria', raio: 50, suco: '#ff3c5f', nome: { pt: 'Fatia de melancia', en: 'Watermelon slice', es: 'Tajada de sandía' },
    svg: svg('<path d="M8 36 A42 42 0 0 0 92 36 Z" fill="' + grad('melCasca') + '"/><path d="M15 36 A35 35 0 0 0 85 36 Z" fill="#eafbe0"/><path d="M19 36 A31 31 0 0 0 81 36 Z" fill="' + grad('melG') + '"/><rect x="8" y="34" width="84" height="4" fill="#2e8b2e"/>' +
      '<g fill="#1f1b3a"><ellipse cx="42" cy="55" rx="2.2" ry="3.4" transform="rotate(-20 42 55)"/><ellipse cx="58" cy="55" rx="2.2" ry="3.4" transform="rotate(20 58 55)"/><ellipse cx="50" cy="66" rx="2.2" ry="3.4"/><ellipse cx="36" cy="46" rx="2" ry="3" transform="rotate(-35 36 46)"/><ellipse cx="64" cy="46" rx="2" ry="3" transform="rotate(35 64 46)"/></g>', ['melG', 'melCasca']) });
  grad('larG', '#ffb347', '#ff7a00', true);
  add({ id: 'laranja', papel: 'fruta', turma: 'propria', raio: 44, suco: '#ff9f1c', nome: { pt: 'Laranja', en: 'Orange', es: 'Naranja' },
    svg: svg('<circle cx="50" cy="52" r="42" fill="' + grad('larG') + '"/><circle cx="50" cy="52" r="42" fill="none" stroke="#c75a00" stroke-width="2" opacity=".5"/><path d="M50 10 q6 -8 14 -4 q-5 8 -14 4" fill="#4caf50"/><circle cx="50" cy="12" r="3" fill="#8d5524"/>' + BRILHO + '<g fill="#fff" opacity=".18"><circle cx="40" cy="60" r="2"/><circle cx="62" cy="48" r="2"/><circle cx="55" cy="70" r="2"/><circle cx="33" cy="45" r="2"/></g>', ['larG']) });
  grad('morG', '#ff6b8b', '#d1163c', true);
  add({ id: 'morango', papel: 'fruta', turma: 'propria', raio: 42, suco: '#ff3366', nome: { pt: 'Morango', en: 'Strawberry', es: 'Fresa' },
    svg: svg('<path d="M50 94 C20 80 12 56 16 36 C20 22 34 20 50 24 C66 20 80 22 84 36 C88 56 80 80 50 94Z" fill="' + grad('morG') + '"/><path d="M50 26 l-6 -14 l10 8 l4 -14 l4 14 l10 -8 l-6 14 l12 -3 l-10 8 l12 4 l-14 0 q-6 4 -12 0 l-14 0 l12 -4 l-10 -8 z" fill="#3fbf4a"/>' +
      '<g fill="#ffe8a3"><ellipse cx="36" cy="50" rx="2.4" ry="3.4"/><ellipse cx="50" cy="44" rx="2.4" ry="3.4"/><ellipse cx="64" cy="50" rx="2.4" ry="3.4"/><ellipse cx="42" cy="66" rx="2.4" ry="3.4"/><ellipse cx="58" cy="66" rx="2.4" ry="3.4"/><ellipse cx="50" cy="80" rx="2.4" ry="3.4"/></g>' + BRILHO, ['morG']) });
  grad('banG', '#fff176', '#f9a825');
  add({ id: 'banana', papel: 'fruta', turma: 'propria', raio: 46, suco: '#ffe066', nome: { pt: 'Banana', en: 'Banana', es: 'Plátano' },
    svg: svg('<path d="M18 30 C10 60 30 86 66 86 C80 86 88 78 86 70 C60 76 38 62 30 30 Z" fill="' + grad('banG') + '" stroke="#c98a00" stroke-width="2.5" stroke-linejoin="round"/><path d="M18 30 l-4 -8 l12 2 l4 8z" fill="#6d4c1e"/><path d="M86 70 l6 2 l-4 6z" fill="#6d4c1e"/><path d="M34 40 C40 60 54 74 76 76" stroke="#fff" stroke-width="3" opacity=".45" fill="none" stroke-linecap="round"/>', ['banG']) });
  grad('kiwiG', '#c6ff3d', '#5aa31e', true);
  add({ id: 'kiwi', papel: 'fruta', turma: 'propria', raio: 42, suco: '#9be15d', nome: { pt: 'Kiwi', en: 'Kiwi', es: 'Kiwi' },
    svg: svg('<circle cx="50" cy="50" r="44" fill="#8d6e3f"/><circle cx="50" cy="50" r="38" fill="' + grad('kiwiG') + '"/><circle cx="50" cy="50" r="10" fill="#eef7d2"/><g fill="#1f1b3a">' + [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { return '<ellipse cx="50" cy="30" rx="2" ry="3.5" transform="rotate(' + a + ' 50 50)"/>'; }).join('') + '</g>', ['kiwiG']) });
  grad('uvaG', '#b388ff', '#5e35b1', true);
  add({ id: 'uva', papel: 'fruta', turma: 'propria', raio: 44, suco: '#8e5bff', nome: { pt: 'Cacho de uva', en: 'Grapes', es: 'Racimo de uvas' },
    svg: svg('<path d="M50 6 q8 2 10 14" stroke="#6d4c1e" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M50 14 q-14 -6 -22 6 q14 2 22 -6z" fill="#4caf50"/>' + [[36, 32], [52, 30], [66, 34], [30, 48], [46, 46], [62, 48], [76, 50], [38, 62], [54, 62], [70, 64], [46, 78], [62, 78], [54, 92]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="' + grad('uvaG') + '"/><ellipse cx="' + (p[0] - 3) + '" cy="' + (p[1] - 3) + '" rx="3" ry="1.8" fill="#fff" opacity=".4"/>'; }).join(''), ['uvaG']) });
  grad('abaG', '#ffd54f', '#f57f17', true);
  add({ id: 'abacaxi', papel: 'fruta', turma: 'propria', raio: 48, suco: '#ffd166', nome: { pt: 'Abacaxi', en: 'Pineapple', es: 'Piña' },
    svg: svg('<g fill="#43a047"><path d="M50 38 l-8 -34 l14 22 l6 -26 l4 26 l12 -20 l-6 32z"/><path d="M50 38 l-22 -22 l16 8 l-24 0 l24 10z"/><path d="M50 38 l22 -22 l-16 8 l24 0 l-24 10z"/></g><ellipse cx="50" cy="66" rx="28" ry="32" fill="' + grad('abaG') + '"/><g stroke="#c77800" stroke-width="1.6" opacity=".7" fill="none"><path d="M22 60 l56 24 M22 72 l48 22 M28 46 l50 22 M36 38 l40 18 M78 60 l-56 24 M78 72 l-48 22 M72 46 l-50 22 M64 38 l-40 18"/></g>' + BRILHO, ['abaG']) });
  grad('macaG', '#ff7b7b', '#c62828', true);
  add({ id: 'maca', papel: 'fruta', turma: 'propria', raio: 42, suco: '#ff5252', nome: { pt: 'Maçã', en: 'Apple', es: 'Manzana' },
    svg: svg('<path d="M50 30 C30 14 8 30 12 56 C16 80 34 94 50 88 C66 94 84 80 88 56 C92 30 70 14 50 30Z" fill="' + grad('macaG') + '"/><path d="M50 30 q-2 -14 4 -22" stroke="#6d4c1e" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M54 18 q14 -8 20 4 q-12 6 -20 -4z" fill="#43a047"/>' + BRILHO, ['macaG']) });

  /* ================= DOCES (cortar) ================= */
  grad('donG', '#ffb3c6', '#ff4fa3', true); grad('massaG', '#f4c27a', '#c98a3c');
  add({ id: 'donut', papel: 'doce', turma: 'propria', raio: 44, suco: '#ff7ab8', nome: { pt: 'Rosquinha', en: 'Donut', es: 'Dónut' },
    svg: svg('<circle cx="50" cy="52" r="42" fill="' + grad('massaG') + '"/><path d="M50 10 a42 42 0 1 1 -0.1 0z M50 36 a16 16 0 1 0 0.1 0z" fill="' + grad('donG') + '" fill-rule="evenodd"/><circle cx="50" cy="52" r="15" fill="#1a1446" opacity=".12"/>' +
      '<g stroke-width="3" stroke-linecap="round"><path d="M30 30 l6 4" stroke="#c6ff3d"/><path d="M66 26 l6 2" stroke="#3ee8ff"/><path d="M76 56 l2 6" stroke="#fff176"/><path d="M26 62 l5 -4" stroke="#fff"/><path d="M58 80 l6 -3" stroke="#c6ff3d"/><path d="M40 78 l-2 6" stroke="#3ee8ff"/></g>', ['donG', 'massaG']) });
  grad('pirG', '#ff8a80', '#d50000', true);
  add({ id: 'pirulito', papel: 'doce', turma: 'propria', raio: 40, suco: '#ff6f91', nome: { pt: 'Pirulito', en: 'Lollipop', es: 'Piruleta' },
    svg: svg('<rect x="47" y="56" width="6" height="40" rx="3" fill="#f5f5f5"/><circle cx="50" cy="38" r="30" fill="' + grad('pirG') + '"/><path d="M50 38 m-24 0 a24 24 0 0 1 48 0 a18 18 0 0 1 -36 0 a12 12 0 0 1 24 0 a6 6 0 0 1 -12 0" fill="none" stroke="#fff" stroke-width="5" opacity=".85" stroke-linecap="round"/>' + BRILHO, ['pirG']) });
  grad('cupG', '#ffe0f0', '#ff80ab');
  add({ id: 'cupcake', papel: 'doce', turma: 'propria', raio: 44, suco: '#ffb3d9', nome: { pt: 'Cupcake', en: 'Cupcake', es: 'Magdalena' },
    svg: svg('<path d="M26 56 l6 38 h36 l6 -38z" fill="#8d5524"/><g stroke="#5d3a16" stroke-width="2"><path d="M36 58 l3 34 M50 58 v34 M64 58 l-3 34"/></g><path d="M22 56 C20 30 36 22 50 30 C64 22 80 30 78 56 Z" fill="' + grad('cupG') + '"/><path d="M28 50 q10 -14 22 -6 q12 -8 22 6" fill="none" stroke="#fff" stroke-width="4" opacity=".6" stroke-linecap="round"/><circle cx="50" cy="22" r="7" fill="#e53935"/><circle cx="48" cy="20" r="2" fill="#fff" opacity=".6"/>' +
      '<g fill="#c6ff3d"><circle cx="36" cy="44" r="2"/><circle cx="64" cy="46" r="2"/></g><g fill="#3ee8ff"><circle cx="46" cy="38" r="2"/><circle cx="58" cy="52" r="2"/></g>', ['cupG']) });
  grad('sorvG', '#ffd6e8', '#ff6fa8', true);
  add({ id: 'sorvete', papel: 'doce', turma: 'propria', raio: 44, suco: '#ffa6c9', nome: { pt: 'Sorvete', en: 'Ice cream', es: 'Helado' },
    svg: svg('<path d="M30 50 l20 46 l20 -46z" fill="#e0a458"/><g stroke="#b87a2e" stroke-width="1.5" fill="none"><path d="M34 58 l32 0 M38 68 l24 0 M42 78 l16 0 M40 52 l12 42 M60 52 l-12 42"/></g><circle cx="50" cy="40" r="24" fill="' + grad('sorvG') + '"/><circle cx="38" cy="30" r="12" fill="#fff5f8"/><circle cx="62" cy="30" r="12" fill="#ffd6e8"/><path d="M50 16 l6 -12" stroke="#d32f2f" stroke-width="3"/><circle cx="48" cy="18" r="5" fill="#e53935"/>' + BRILHO, ['sorvG']) });

  /* ================= BOLAS (chutar) ================= */
  grad('bolaG', '#ffffff', '#cfd8dc', true);
  add({ id: 'bola', papel: 'bola', turma: 'propria', raio: 40, suco: '#ffffff', nome: { pt: 'Bola de futebol', en: 'Soccer ball', es: 'Balón de fútbol' },
    svg: svg('<circle cx="50" cy="50" r="44" fill="' + grad('bolaG') + '" stroke="#37474f" stroke-width="2"/><g fill="#1f2a30"><path d="M50 30 l12 9 l-5 14 h-14 l-5 -14z"/><path d="M50 8 l8 8 l-8 14 l-8 -14z"/><path d="M14 40 l12 -2 l6 12 l-8 10 l-12 -6z"/><path d="M86 40 l-12 -2 l-6 12 l8 10 l12 -6z"/><path d="M34 84 l6 -12 h20 l6 12 l-16 8z"/></g>', ['bolaG']) });
  grad('praiaG', '#ffffff', '#e0e0e0', true);
  add({ id: 'bolaPraia', papel: 'bola', turma: 'propria', raio: 40, suco: '#ffffff', nome: { pt: 'Bola de praia', en: 'Beach ball', es: 'Pelota de playa' },
    svg: svg('<circle cx="50" cy="50" r="44" fill="' + grad('praiaG') + '"/><g><path d="M50 6 C30 30 30 70 50 94 C40 70 40 30 50 6z" fill="#ff4fa3"/><path d="M50 6 C70 30 70 70 50 94 C60 70 60 30 50 6z" fill="#3ee8ff"/><path d="M50 6 C14 20 14 80 50 94 C26 70 26 30 50 6z" fill="#c6ff3d" opacity=".9"/><path d="M50 6 C86 20 86 80 50 94 C74 70 74 30 50 6z" fill="#ffd166" opacity=".9"/></g><circle cx="50" cy="50" r="44" fill="none" stroke="#37474f" stroke-width="2"/>' + BRILHO, ['praiaG']) });
  grad('bskG', '#ffb74d', '#e65100', true);
  add({ id: 'bolaBasquete', papel: 'bola', turma: 'propria', raio: 40, suco: '#ff9800', nome: { pt: 'Bola de basquete', en: 'Basketball', es: 'Balón de baloncesto' },
    svg: svg('<circle cx="50" cy="50" r="44" fill="' + grad('bskG') + '"/><g stroke="#3e2723" stroke-width="3" fill="none"><path d="M50 6 v88 M6 50 h88 M18 18 q32 32 64 64 M82 18 q-32 32 -64 64"/></g><circle cx="50" cy="50" r="44" fill="none" stroke="#3e2723" stroke-width="2"/>' + BRILHO, ['bskG']) });

  /* ================= VILÕES ================= */
  grad('pimG', '#ff5252', '#b71c1c', true);
  add({ id: 'pimentao', papel: 'vilao', turma: 'propria', raio: 44, suco: '#ff1744', nome: { pt: 'Pimentão Bravo', en: 'Angry Pepper', es: 'Pimiento Gruñón' },
    svg: svg('<path d="M30 24 C10 40 14 86 44 94 C70 100 92 70 84 38 C80 22 60 16 50 26 C42 18 34 20 30 24Z" fill="' + grad('pimG') + '"/><path d="M50 26 q0 -16 10 -22" stroke="#2e7d32" stroke-width="5" fill="none" stroke-linecap="round"/>' + cara(52, 56, 1.1, 'bravo') + '<g fill="#ffb300"><path d="M10 50 l-8 -4 l6 8z"/><path d="M90 46 l8 -6 l-4 10z"/><path d="M60 10 l4 -8 l2 8z"/></g>' + BRILHO, ['pimG']) });
  grad('bombG', '#616161', '#111', true);
  add({ id: 'bombeta', papel: 'vilao', turma: 'propria', raio: 42, suco: '#9e9e9e', nome: { pt: 'Bombeta', en: 'Bombette', es: 'Bombeta' },
    svg: svg('<circle cx="48" cy="58" r="36" fill="' + grad('bombG') + '"/><rect x="40" y="16" width="16" height="12" rx="3" fill="#455a64"/><path d="M48 16 q4 -12 16 -8" stroke="#8d6e63" stroke-width="3" fill="none" stroke-linecap="round"/><g><circle cx="66" cy="8" r="5" fill="#ffd166"/><circle cx="66" cy="8" r="2.5" fill="#fff"/><path d="M60 2 l-3 -2 M72 2 l3 -2 M66 -1 v-2" stroke="#ff7a00" stroke-width="2"/></g>' + cara(48, 58, 1, 'bravo', '#fff') + '<ellipse cx="34" cy="38" rx="9" ry="5" fill="#fff" opacity=".25" transform="rotate(-25 34 38)"/>', ['bombG']) });
  grad('nuvG', '#b0bec5', '#546e7a', true);
  add({ id: 'chuvisco', papel: 'vilao', turma: 'propria', raio: 46, suco: '#64b5f6', nome: { pt: 'Chuvisco', en: 'Drizzle', es: 'Llovizna' },
    svg: svg('<path d="M24 66 a16 16 0 0 1 4 -31 a20 20 0 0 1 38 -8 a16 16 0 0 1 14 28 a12 12 0 0 1 -6 11z" fill="' + grad('nuvG') + '"/>' + cara(52, 46, 0.9, 'bravo', '#263238') + '<g fill="#4fc3f7"><path d="M30 72 q-4 8 0 10 q4 -2 0 -10z"/><path d="M48 76 q-4 8 0 10 q4 -2 0 -10z"/><path d="M66 72 q-4 8 0 10 q4 -2 0 -10z"/><path d="M39 86 q-4 8 0 10 q4 -2 0 -10z"/><path d="M57 86 q-4 8 0 10 q4 -2 0 -10z"/></g>', ['nuvG']) });

  /* ================= TURMA PRÓPRIA — heróis ================= */
  grad('melcG', '#ff6b7f', '#d8213f', true);
  add({ id: 'melancino', papel: 'heroi', turma: 'propria', raio: 48, suco: '#ff3c5f', nome: { pt: 'Melancino', en: 'Melonino', es: 'Sandiíto' },
    svg: svg('<path d="M20 46 q-8 30 10 44 l30 -6z" fill="#c6ff3d"/><circle cx="50" cy="50" r="38" fill="#2e8b2e"/><circle cx="50" cy="50" r="33" fill="#eafbe0"/><circle cx="50" cy="50" r="29" fill="' + grad('melcG') + '"/>' + cara(50, 50, 1, 'feliz') + '<g fill="#1f1b3a"><ellipse cx="32" cy="34" rx="2" ry="3"/><ellipse cx="68" cy="34" rx="2" ry="3"/><ellipse cx="50" cy="26" rx="2" ry="3"/></g><path d="M38 24 l6 -8 l6 8 l6 -8 l6 8" stroke="#ffd166" stroke-width="3" fill="none" stroke-linejoin="round"/>' + BRILHO, ['melcG']) });
  add({ id: 'donatella', papel: 'heroi', turma: 'propria', raio: 44, suco: '#ff7ab8', nome: { pt: 'Donatella', en: 'Donatella', es: 'Donatella' },
    svg: svg('<circle cx="50" cy="52" r="40" fill="' + grad('massaG') + '"/><path d="M50 12 a40 40 0 1 1 -0.1 0z M50 40 a12 12 0 1 0 0.1 0z" fill="' + grad('donG') + '" fill-rule="evenodd"/>' + cara(50, 30, 0.85, 'feliz') + '<path d="M22 20 q6 -14 16 -8 q-10 2 -16 8z M78 20 q-6 -14 -16 -8 q10 2 16 8z" fill="#ff4fa3"/><circle cx="24" cy="20" r="5" fill="#ffd166"/><circle cx="76" cy="20" r="5" fill="#ffd166"/><g stroke-width="3" stroke-linecap="round"><path d="M28 60 l6 4" stroke="#c6ff3d"/><path d="M70 58 l6 2" stroke="#3ee8ff"/><path d="M40 84 l6 -3" stroke="#fff"/><path d="M60 82 l-2 6" stroke="#3ee8ff"/></g>', ['massaG', 'donG']) });
  add({ id: 'morangao', papel: 'heroi', turma: 'propria', raio: 44, suco: '#ff3366', nome: { pt: 'Morangão', en: 'Big Berry', es: 'Fresón' },
    svg: svg('<path d="M50 96 C18 82 10 56 16 34 C22 20 38 20 50 26 C62 20 78 20 84 34 C90 56 82 82 50 96Z" fill="' + grad('morG') + '"/><path d="M50 26 l-8 -16 l12 10 l4 -16 l4 16 l12 -10 l-8 16 l14 -2 l-12 8z" fill="#3fbf4a"/>' + cara(50, 56, 1.05, 'feliz') + '<g fill="#ffe8a3"><ellipse cx="30" cy="48" rx="2.2" ry="3.2"/><ellipse cx="70" cy="48" rx="2.2" ry="3.2"/><ellipse cx="36" cy="76" rx="2.2" ry="3.2"/><ellipse cx="64" cy="76" rx="2.2" ry="3.2"/></g><path d="M14 56 q-8 4 -6 14 M86 56 q8 4 6 14" stroke="#d1163c" stroke-width="7" stroke-linecap="round" fill="none"/>', ['morG']) });
  add({ id: 'bananito', papel: 'heroi', turma: 'propria', raio: 46, suco: '#ffe066', nome: { pt: 'Bananito', en: 'Bananito', es: 'Bananito' },
    svg: svg('<path d="M16 26 C8 60 30 90 68 90 C84 90 92 80 90 70 C62 78 36 60 30 26 Z" fill="' + grad('banG') + '" stroke="#c98a00" stroke-width="2.5" stroke-linejoin="round"/><path d="M16 26 l-4 -8 l12 2 l4 8z" fill="#6d4c1e"/>' + cara(58, 68, 0.9, 'feliz') + '<path d="M44 40 l-8 -14 l12 6 l0 -14 l6 12 l10 -8 l-4 14" stroke="#6d4c1e" stroke-width="2.5" fill="none" stroke-linejoin="round"/><rect x="40" y="46" width="34" height="8" rx="4" fill="#1f1b3a" opacity=".85"/>', ['banG']) });
  add({ id: 'kiwiNinja', papel: 'heroi', turma: 'propria', raio: 42, suco: '#9be15d', nome: { pt: 'Kiwi Ninja', en: 'Kiwi Ninja', es: 'Kiwi Ninja' },
    svg: svg('<circle cx="50" cy="50" r="44" fill="#8d6e3f"/><circle cx="50" cy="50" r="38" fill="' + grad('kiwiG') + '"/>' + cara(50, 46, 1, 'ninja') + '<path d="M30 66 q20 14 40 0" stroke="#1f1b3a" stroke-width="3" fill="none" stroke-linecap="round"/><g fill="#1f1b3a">' + [200, 240, 280, 320].map(function (a) { return '<ellipse cx="50" cy="28" rx="2" ry="3.5" transform="rotate(' + a + ' 50 50)"/>'; }).join('') + '</g><path d="M84 30 l10 -10 M86 40 l12 -2" stroke="#cfd8dc" stroke-width="3" stroke-linecap="round"/>', ['kiwiG']) });
  grad('pipG', '#fffde7', '#ffe082', true);
  add({ id: 'pipoquinha', papel: 'heroi', turma: 'propria', raio: 40, suco: '#fff8e1', nome: { pt: 'Pipoquinha', en: 'Popcornie', es: 'Palomitas' },
    svg: svg('<g fill="' + grad('pipG') + '" stroke="#e0b24a" stroke-width="2"><circle cx="34" cy="40" r="16"/><circle cx="66" cy="40" r="16"/><circle cx="50" cy="26" r="16"/><circle cx="36" cy="64" r="16"/><circle cx="64" cy="64" r="16"/><circle cx="50" cy="52" r="20"/></g>' + cara(50, 54, 0.9, 'surpreso') + '<path d="M44 10 l4 -8 l4 8" stroke="#ffd166" stroke-width="3" fill="none"/>', ['pipG']) });
  add({ id: 'sorvetao', papel: 'heroi', turma: 'propria', raio: 46, suco: '#ffa6c9', nome: { pt: 'Sorvetão', en: 'Big Scoop', es: 'Heladote' },
    svg: svg('<path d="M28 52 l22 46 l22 -46z" fill="#e0a458"/><g stroke="#b87a2e" stroke-width="1.5" fill="none"><path d="M32 60 l36 0 M36 70 l28 0 M40 80 l20 0"/></g><circle cx="50" cy="38" r="28" fill="' + grad('sorvG') + '"/>' + cara(50, 40, 1, 'feliz') + '<path d="M26 22 q4 -16 18 -14 M74 22 q-4 -16 -18 -14" stroke="#fff5f8" stroke-width="8" stroke-linecap="round" fill="none"/><circle cx="50" cy="8" r="6" fill="#e53935"/><g fill="#3ee8ff"><circle cx="30" cy="40" r="2"/><circle cx="72" cy="36" r="2"/></g><g fill="#c6ff3d"><circle cx="36" cy="56" r="2"/><circle cx="66" cy="54" r="2"/></g>', ['sorvG']) });
  grad('bolG', '#ffe082', '#d4891f', true);
  add({ id: 'bolinhoDeChuva', papel: 'heroi', mascote: true, turma: 'propria', raio: 48, suco: '#ffd166', nome: { pt: 'Bolinho de Chuva', en: 'Rainy Day Donut', es: 'Buñuelo de Lluvia' },
    svg: svg('<path d="M50 4 q-26 2 -32 24 h64 q-6 -22 -32 -24z" fill="#3ee8ff"/><path d="M18 28 q8 -6 16 0 q8 -6 16 0 q8 -6 16 0 q8 -6 16 0" stroke="#1a9fc0" stroke-width="2.5" fill="none"/><rect x="48.5" y="28" width="3" height="18" fill="#1f1b3a"/><path d="M28 46 C20 60 24 88 50 92 C76 88 80 60 72 46 C66 36 34 36 28 46Z" fill="' + grad('bolG') + '"/><path d="M34 44 q16 -10 32 0" stroke="#fff" stroke-width="4" opacity=".5" fill="none" stroke-linecap="round"/>' + cara(50, 64, 1, 'feliz') + '<g fill="#fff" opacity=".9"><circle cx="34" cy="56" r="1.6"/><circle cx="66" cy="58" r="1.6"/><circle cx="42" cy="82" r="1.6"/><circle cx="60" cy="84" r="1.6"/><circle cx="50" cy="48" r="1.6"/><circle cx="30" cy="70" r="1.6"/><circle cx="70" cy="72" r="1.6"/></g><g fill="#c6ff3d"><circle cx="22" cy="56" r="3"/><circle cx="78" cy="56" r="3"/></g>', ['bolG']) });
  add({ id: 'capitaoChute', papel: 'heroi', turma: 'propria', raio: 44, suco: '#ffffff', nome: { pt: 'Capitão Chute', en: 'Captain Kick', es: 'Capitán Chut' },
    svg: svg('<circle cx="50" cy="54" r="40" fill="' + grad('bolaG') + '" stroke="#37474f" stroke-width="2"/><g fill="#1f2a30"><path d="M22 66 l10 -4 l6 10 l-6 10 l-12 -6z"/><path d="M78 66 l-10 -4 l-6 10 l6 10 l12 -6z"/><path d="M38 90 l6 -8 h12 l6 8z"/></g>' + cara(50, 52, 1, 'feliz') + '<path d="M22 30 q28 -22 56 0 l-4 6 q-24 -16 -48 0z" fill="#1a1446"/><rect x="18" y="30" width="64" height="7" rx="3" fill="#1a1446"/><path d="M50 14 l3 6 l6 1 l-4.5 4 l1 6 l-5.5 -3 l-5.5 3 l1 -6 l-4.5 -4 l6 -1z" fill="#ffd166"/>', ['bolaG']) });

  /* ---- meninas da turma (cílios, laço, flor) ---- */
  var CILIOS = '<g stroke="#1f1b3a" stroke-width="2" stroke-linecap="round"><path d="M28 36 l-5 -5 M33 33 l-3 -6 M72 36 l5 -5 M67 33 l3 -6"/></g>';
  grad('limG', '#fff59d', '#f9a825', true);
  add({ id: 'liliLimao', papel: 'heroi', menina: true, turma: 'propria', raio: 44, suco: '#fff176', nome: { pt: 'Lili Limão', en: 'Lily Lemon', es: 'Lili Limón' },
    svg: svg('<ellipse cx="50" cy="54" rx="40" ry="36" fill="' + grad('limG') + '"/><path d="M10 54 q-8 -4 -4 -10 M90 54 q8 -4 4 -10" stroke="#f9a825" stroke-width="6" stroke-linecap="round" fill="none"/>' + cara(50, 50, 1, 'feliz') + CILIOS + '<g transform="translate(22 22)"><ellipse cx="-8" cy="0" rx="9" ry="5" fill="#ff4fa3" transform="rotate(-30)"/><ellipse cx="8" cy="0" rx="9" ry="5" fill="#ff4fa3" transform="rotate(30)"/><circle cx="0" cy="0" r="3" fill="#ff2b8e"/></g>' + BRILHO, ['limG']) });
  grad('cerG', '#ff6b8b', '#b71c1c', true);
  add({ id: 'cerejinha', papel: 'heroi', menina: true, turma: 'propria', raio: 44, suco: '#ff3366', nome: { pt: 'Cerejinha', en: 'Cherry', es: 'Cerecita' },
    svg: svg('<path d="M40 40 q4 -30 26 -34 M62 44 q-10 -28 4 -38" stroke="#2e7d32" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M66 6 q14 -4 18 10 q-14 2 -18 -10z" fill="#4caf50"/><circle cx="36" cy="62" r="26" fill="' + grad('cerG') + '"/><circle cx="66" cy="66" r="22" fill="' + grad('cerG') + '"/>' + cara(36, 60, 0.7, 'feliz') + '<g transform="translate(66 66) scale(.6)">' + cara(0, 0, 0.9, 'surpreso') + '</g><g stroke="#1f1b3a" stroke-width="1.6" stroke-linecap="round"><path d="M22 50 l-4 -4 M26 47 l-2 -5"/></g><ellipse cx="26" cy="48" rx="7" ry="4" fill="#fff" opacity=".4"/>', ['cerG']) });
  add({ id: 'uvinha', papel: 'heroi', menina: true, turma: 'propria', raio: 44, suco: '#8e5bff', nome: { pt: 'Uvinha', en: 'Grapey', es: 'Uvita' },
    svg: svg('<path d="M50 8 q8 2 10 14" stroke="#6d4c1e" stroke-width="3" fill="none" stroke-linecap="round"/>' + [[36, 32], [52, 30], [66, 34], [30, 48], [70, 50], [38, 64], [66, 64], [46, 80], [60, 80], [53, 93]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="' + grad('uvaG') + '"/>'; }).join('') + '<circle cx="52" cy="52" r="18" fill="' + grad('uvaG') + '"/>' + cara(52, 52, 0.75, 'feliz') + '<g stroke="#1f1b3a" stroke-width="1.6" stroke-linecap="round"><path d="M38 44 l-4 -3 M66 44 l4 -3"/></g><g transform="translate(70 30)"><circle cx="0" cy="0" r="5" fill="#ffd166"/>' + [0, 72, 144, 216, 288].map(function (a) { return '<ellipse cx="0" cy="-8" rx="4" ry="5" fill="#ff6f91" transform="rotate(' + a + ')"/>'; }).join('') + '</g>', ['uvaG']) });
  grad('abcG', '#c5e1a5', '#558b2f', true);
  add({ id: 'abacatinha', papel: 'heroi', menina: true, turma: 'propria', raio: 46, suco: '#aed581', nome: { pt: 'Abacatinha', en: 'Avocadita', es: 'Aguacatita' },
    svg: svg('<path d="M50 6 C28 6 14 30 14 54 C14 78 30 96 50 96 C70 96 86 78 86 54 C86 30 72 6 50 6Z" fill="' + grad('abcG') + '"/><path d="M50 14 C32 14 22 34 22 54 C22 76 34 90 50 90 C66 90 78 76 78 54 C78 34 68 14 50 14Z" fill="#e6ee9c"/><circle cx="50" cy="60" r="18" fill="#8d6e3f"/><ellipse cx="44" cy="54" rx="6" ry="4" fill="#fff" opacity=".3"/>' + cara(50, 38, 0.8, 'feliz') + '<g stroke="#1f1b3a" stroke-width="1.6" stroke-linecap="round"><path d="M38 30 l-4 -3 M62 30 l4 -3"/></g><g transform="translate(70 18)"><ellipse cx="-7" cy="0" rx="8" ry="4.5" fill="#3ee8ff" transform="rotate(-30)"/><ellipse cx="7" cy="0" rx="8" ry="4.5" fill="#3ee8ff" transform="rotate(30)"/><circle cx="0" cy="0" r="2.5" fill="#1a9fc0"/></g>', ['abcG']) });
  F.forEach(function (f) { if (f.id === 'donatella') f.menina = true; });

  /* ================= PODERES ================= */
  grad('estG', '#fff9c4', '#ffb300', true);
  add({ id: 'estrelinha', papel: 'poder', poder: 'x2', turma: 'propria', raio: 40, suco: '#ffd166', nome: { pt: 'Estrelinha ✖2', en: 'Little Star ✖2', es: 'Estrellita ✖2' },
    svg: svg('<path d="M50 4 l13 28 l31 3 l-23 21 l7 30 l-28 -16 l-28 16 l7 -30 l-23 -21 l31 -3z" fill="' + grad('estG') + '" stroke="#e59d00" stroke-width="2" stroke-linejoin="round"/>' + cara(50, 50, 0.85, 'feliz') + '<text x="50" y="86" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="16" fill="#1a1446">×2</text>', ['estG']) });
  grad('carG', '#a5d6a7', '#2e7d32', true);
  add({ id: 'caracol', papel: 'poder', poder: 'lento', turma: 'propria', raio: 40, suco: '#9be15d', nome: { pt: 'Caracol (tempo lento)', en: 'Snail (slow time)', es: 'Caracol (tiempo lento)' },
    svg: svg('<path d="M14 80 q10 -20 40 -18 l0 20z" fill="#c5a26a"/><circle cx="62" cy="54" r="28" fill="' + grad('carG') + '"/><path d="M62 54 m-18 0 a18 18 0 0 1 36 0 a12 12 0 0 1 -24 0 a6 6 0 0 1 12 0" fill="none" stroke="#1b5e20" stroke-width="4" stroke-linecap="round"/><path d="M22 66 q-10 -14 -4 -30 M30 64 q-2 -16 8 -28" stroke="#c5a26a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="18" cy="34" r="4" fill="#fff"/><circle cx="38" cy="34" r="4" fill="#fff"/><circle cx="18" cy="34" r="2" fill="#1f1b3a"/><circle cx="38" cy="34" r="2" fill="#1f1b3a"/>', ['carG']) });
  add({ id: 'nuvemDeFrutas', papel: 'poder', poder: 'chuva', turma: 'propria', raio: 44, suco: '#ff9f1c', nome: { pt: 'Nuvem de frutas', en: 'Fruit cloud', es: 'Nube de frutas' },
    svg: svg('<path d="M24 60 a16 16 0 0 1 4 -31 a20 20 0 0 1 38 -8 a16 16 0 0 1 14 28 a12 12 0 0 1 -6 11z" fill="#fff" opacity=".95"/>' + cara(52, 42, 0.8, 'feliz') + '<circle cx="30" cy="76" r="6" fill="#ff7a00"/><circle cx="48" cy="84" r="6" fill="#d1163c"/><circle cx="66" cy="76" r="6" fill="#9be15d"/><circle cx="56" cy="94" r="5" fill="#8e5bff"/><circle cx="38" cy="94" r="5" fill="#ffd166"/>', []) });

  /* ================= DOMÍNIO PÚBLICO (desenhos originais inspirados nas obras livres) ================= */
  add({ id: 'willie', papel: 'heroi', turma: 'publica', raio: 46, suco: '#eceff1', nome: { pt: 'Camundongo do barco (1928)', en: 'Steamboat mouse (1928)', es: 'Ratón del barco de vapor (1928)' },
    svg: svg('<circle cx="22" cy="24" r="16" fill="#111"/><circle cx="78" cy="24" r="16" fill="#111"/><circle cx="50" cy="52" r="34" fill="#111"/><path d="M50 36 C34 36 22 50 24 66 C28 80 40 84 50 84 C60 84 72 80 76 66 C78 50 66 36 50 36Z" fill="#f5f5f5"/><ellipse cx="40" cy="54" rx="4" ry="8" fill="#111"/><ellipse cx="60" cy="54" rx="4" ry="8" fill="#111"/><path d="M36 48 l8 -2 M56 46 l8 2" stroke="#111" stroke-width="2"/><ellipse cx="50" cy="66" rx="5" ry="4" fill="#111"/><path d="M36 70 q14 14 28 0" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M70 80 q20 4 18 18" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="50" cy="52" r="34" fill="none" stroke="#111" stroke-width="2"/>', []) });
  add({ id: 'marinheiro', papel: 'heroi', turma: 'publica', raio: 46, suco: '#90caf9', nome: { pt: 'Marinheiro Popeye (1929)', en: 'Sailor Popeye (1929)', es: 'Marinero Popeye (1929)' },
    svg: svg('<rect x="30" y="58" width="40" height="34" rx="8" fill="#1565c0"/><ellipse cx="18" cy="80" rx="14" ry="10" fill="#ffcc80"/><ellipse cx="82" cy="80" rx="14" ry="10" fill="#ffcc80"/><circle cx="50" cy="36" r="24" fill="#ffcc80"/><path d="M26 22 h48 q0 -12 -24 -12 q-24 0 -24 12z" fill="#f5f5f5"/><rect x="24" y="20" width="52" height="5" fill="#111"/><circle cx="42" cy="34" r="3" fill="#111"/><path d="M58 30 q4 4 0 8" stroke="#111" stroke-width="2.5" fill="none"/><path d="M62 46 q6 12 18 8" stroke="#5d4037" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="82" cy="52" r="4" fill="#5d4037"/><path d="M30 50 q20 10 32 -2" fill="#ffb74d"/><path d="M36 10 q14 -8 28 0" stroke="#111" stroke-width="3" fill="none"/>', []) });
  add({ id: 'alice', papel: 'heroi', menina: true, turma: 'publica', raio: 46, suco: '#b39ddb', nome: { pt: 'Alice (do livro, 1865)', en: 'Alice (from the book, 1865)', es: 'Alicia (del libro, 1865)' },
    svg: svg('<path d="M30 56 l-8 38 h56 l-8 -38z" fill="#9575cd"/><path d="M34 60 l-6 30 h44 l-6 -30z" fill="#ede7f6"/><g fill="#1a1446"><rect x="32" y="86" width="8" height="8"/><rect x="60" y="86" width="8" height="8"/></g><circle cx="50" cy="34" r="22" fill="#ffe0b2"/><path d="M28 36 q0 -28 22 -26 q22 -2 22 26 q-6 -14 -22 -14 q-16 0 -22 14z" fill="#fdd835"/><path d="M26 40 q-2 28 10 34 M74 40 q2 28 -10 34" stroke="#fdd835" stroke-width="8" stroke-linecap="round" fill="none"/><rect x="28" y="14" width="44" height="5" rx="2" fill="#1a1446"/>' + cara(50, 36, 0.8, 'feliz') + '', []) });
  add({ id: 'pinoquio', papel: 'heroi', turma: 'publica', raio: 46, suco: '#d7ccc8', nome: { pt: 'Pinóquio (do livro, 1883)', en: 'Pinocchio (from the book, 1883)', es: 'Pinocho (del libro, 1883)' },
    svg: svg('<rect x="34" y="60" width="32" height="32" rx="6" fill="#ef5350"/><rect x="26" y="64" width="8" height="26" rx="4" fill="#d7b98e"/><rect x="66" y="64" width="8" height="26" rx="4" fill="#d7b98e"/><rect x="30" y="20" width="40" height="42" rx="10" fill="#d7b98e"/><path d="M30 20 l20 -16 l20 16z" fill="#fff" stroke="#9e9e9e" stroke-width="2"/><path d="M34 30 q-4 10 0 20 M66 30 q4 10 0 20" stroke="#a1887f" stroke-width="2" fill="none"/>' + cara(50, 36, 0.8, 'surpreso') + '<path d="M50 42 l26 2 l-26 2z" fill="#c9a06c" stroke="#8d6e3f" stroke-width="1.5"/><circle cx="50" cy="62" r="3" fill="#a1887f"/><circle cx="50" cy="70" r="3" fill="#a1887f"/>', []) });
  add({ id: 'quixote', papel: 'heroi', turma: 'publica', raio: 46, suco: '#cfd8dc', nome: { pt: 'Dom Quixote (1605)', en: 'Don Quixote (1605)', es: 'Don Quijote (1605)' },
    svg: svg('<rect x="36" y="56" width="28" height="36" rx="6" fill="#90a4ae"/><path d="M36 60 h28 l-4 6 h-20z" fill="#546e7a"/><rect x="18" y="56" width="10" height="34" rx="5" fill="#cfd8dc"/><rect x="74" y="20" width="5" height="76" rx="2" fill="#8d6e63"/><path d="M76 20 l-6 -14 l12 0z" fill="#cfd8dc"/><circle cx="50" cy="38" r="18" fill="#ffe0b2"/><path d="M28 30 q22 -18 44 0 l0 6 h-44z" fill="#b0bec5"/><path d="M34 28 h32 q-2 -10 -16 -10 q-14 0 -16 10z" fill="#90a4ae"/><path d="M40 48 q10 8 20 0" stroke="#5d4037" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M42 42 l-4 -2 M58 42 l4 -2" stroke="#5d4037" stroke-width="2.5"/><circle cx="44" cy="36" r="2.5" fill="#1f1b3a"/><circle cx="56" cy="36" r="2.5" fill="#1f1b3a"/><path d="M40 56 q10 10 20 0" stroke="#5d4037" stroke-width="3" fill="none"/>', []) });

  /* ================= BICHOS (Pega-pega: aparecem, esperam e vão embora; pegou → vão para o cantinho) =================
     O corpo é SVG (de lado, olhando para a direita, chão em y≈98). Pernas e asas são desenhadas à parte no palco para
     mexer: pernas = [x, y do quadril, comprimento, grossura, cor]; asas = [x, y, rx, ry, cor]; asaEixo 'x' = bate para os
     lados (borboleta de frente). anda: voa | anda | pula | buraco. tam = lado do quadrado no palco (px); vel = px/s. */
  function olho(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff"/><circle cx="' + (x + r * 0.25) + '" cy="' + y + '" r="' + (r * 0.6) + '" fill="#1f1b3a"/><circle cx="' + (x + r * 0.45) + '" cy="' + (y - r * 0.3) + '" r="' + (r * 0.22) + '" fill="#fff"/>'; }
  function bicho(f) { f.papel = 'bicho'; f.turma = 'propria'; f.raio = f.raio || 46; f.suco = f.suco || '#ffffff'; return add(f); }
  bicho({ id: 'borboleta', anda: 'voa', asaEixo: 'x', tam: 84, vel: 150, nome: { pt: 'Borboleta', en: 'Butterfly', es: 'Mariposa' },
    asas: [[34, 38, 20, 18, '#ff7ab8'], [66, 38, 20, 18, '#ff7ab8'], [38, 62, 13, 12, '#ffd166'], [62, 62, 13, 12, '#ffd166']],
    svg: svg('<ellipse cx="50" cy="52" rx="5" ry="22" fill="#3a2b4a"/><circle cx="50" cy="28" r="7" fill="#3a2b4a"/><path d="M47 22 q-6 -12 -12 -14 M53 22 q6 -12 12 -14" stroke="#3a2b4a" stroke-width="2.5" fill="none" stroke-linecap="round"/>' + olho(47, 27, 2.6) + olho(54, 27, 2.6)) });
  bicho({ id: 'joaninha', anda: 'voa', tam: 60, vel: 110, nome: { pt: 'Joaninha', en: 'Ladybug', es: 'Mariquita' },
    asas: [[46, 40, 18, 9, 'rgba(220,240,255,.75)']], pernas: [[38, 72, 12, 3, '#1f1b3a'], [52, 74, 12, 3, '#1f1b3a'], [64, 72, 12, 3, '#1f1b3a']],
    svg: svg('<path d="M18 70 A32 30 0 0 1 82 70 Z" fill="#e53935"/><path d="M50 40 V70" stroke="#1f1b3a" stroke-width="2.5"/><g fill="#1f1b3a"><circle cx="34" cy="58" r="5"/><circle cx="64" cy="56" r="5"/><circle cx="44" cy="48" r="4"/><circle cx="58" cy="66" r="4"/></g><circle cx="84" cy="62" r="11" fill="#1f1b3a"/>' + olho(87, 59, 3.4)) });
  bicho({ id: 'libelula', anda: 'voa', tam: 96, vel: 230, nome: { pt: 'Libélula', en: 'Dragonfly', es: 'Libélula' },
    asas: [[44, 40, 22, 7, 'rgba(200,235,255,.8)'], [56, 42, 20, 6, 'rgba(200,235,255,.8)']],
    svg: svg('<rect x="10" y="47" width="58" height="7" rx="3.5" fill="#26c6da"/><circle cx="72" cy="50" r="9" fill="#00acc1"/>' + olho(76, 47, 4)) });
  bicho({ id: 'passarinho', anda: 'voa', tam: 80, vel: 240, nome: { pt: 'Passarinho', en: 'Little bird', es: 'Pajarito' },
    asas: [[44, 50, 18, 11, '#1e88e5']], pernas: [[46, 76, 18, 3, '#ff9800'], [56, 76, 18, 3, '#ff9800']],
    svg: svg('<path d="M14 46 L30 50 L14 58 Z" fill="#1565c0"/><ellipse cx="50" cy="56" rx="28" ry="22" fill="#42a5f5"/><ellipse cx="54" cy="64" rx="16" ry="12" fill="#e3f2fd"/><circle cx="70" cy="38" r="16" fill="#42a5f5"/><path d="M84 36 L96 40 L84 44 Z" fill="#ff9800"/>' + olho(74, 34, 5)) });
  bicho({ id: 'minhoca', anda: 'buraco', tam: 76, vel: 45, nome: { pt: 'Minhoca', en: 'Earthworm', es: 'Lombriz' },
    svg: svg('<path d="M14 96 q8 -30 26 -26 q20 4 18 -20 q-2 -20 18 -22" stroke="#f48fb1" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M30 76 l6 4 M46 70 l7 2 M58 48 l7 -2" stroke="#ec407a" stroke-width="2.5"/>' + olho(78, 26, 4.5) + '<path d="M74 36 q5 4 10 0" stroke="#ad1457" stroke-width="2" fill="none" stroke-linecap="round"/>') });
  bicho({ id: 'toupeira', anda: 'buraco', tam: 100, vel: 90, nome: { pt: 'Toupeira', en: 'Mole', es: 'Topo' },
    pernas: [[40, 86, 12, 7, '#6d4c41'], [62, 86, 12, 7, '#6d4c41']],
    svg: svg('<ellipse cx="50" cy="64" rx="34" ry="28" fill="#6d4c41"/><ellipse cx="70" cy="56" rx="20" ry="18" fill="#795548"/><ellipse cx="88" cy="58" rx="8" ry="6" fill="#ff8a80"/><path d="M68 50 q4 -3 8 0" stroke="#1f1b3a" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="78" cy="76" rx="9" ry="6" fill="#ffab91"/><path d="M80 64 l14 -4 M80 66 l14 2" stroke="#3e2723" stroke-width="1.5"/>') });
  bicho({ id: 'sapo', anda: 'pula', tam: 80, vel: 160, nome: { pt: 'Sapo', en: 'Frog', es: 'Rana' },
    pernas: [[30, 78, 18, 8, '#43a047'], [66, 82, 14, 6, '#43a047']],
    svg: svg('<ellipse cx="50" cy="70" rx="34" ry="22" fill="#66bb6a"/><ellipse cx="54" cy="78" rx="22" ry="12" fill="#c5e1a5"/><circle cx="58" cy="46" r="11" fill="#66bb6a"/><circle cx="78" cy="48" r="11" fill="#66bb6a"/>' + olho(58, 44, 7) + olho(78, 46, 7) + '<path d="M66 64 q10 6 20 0" stroke="#1b5e20" stroke-width="2.5" fill="none" stroke-linecap="round"/>') });
  bicho({ id: 'coelho', anda: 'pula', tam: 124, vel: 220, nome: { pt: 'Coelho', en: 'Bunny', es: 'Conejito' },
    pernas: [[30, 80, 16, 9, '#e0e0e0'], [40, 80, 16, 9, '#eeeeee'], [62, 82, 14, 7, '#e0e0e0'], [70, 82, 14, 7, '#eeeeee']],
    svg: svg('<circle cx="18" cy="62" r="9" fill="#fff"/><ellipse cx="46" cy="68" rx="30" ry="20" fill="#f5f5f5"/><circle cx="74" cy="52" r="16" fill="#f5f5f5"/><ellipse cx="66" cy="22" rx="6" ry="20" fill="#f5f5f5" transform="rotate(-12 66 22)"/><ellipse cx="78" cy="22" rx="6" ry="20" fill="#f5f5f5" transform="rotate(10 78 22)"/><ellipse cx="66" cy="22" rx="3" ry="14" fill="#f8bbd0" transform="rotate(-12 66 22)"/><ellipse cx="78" cy="22" rx="3" ry="14" fill="#f8bbd0" transform="rotate(10 78 22)"/>' + olho(80, 50, 4.5) + '<circle cx="89" cy="56" r="3" fill="#f48fb1"/>') });
  bicho({ id: 'esquilo', anda: 'pula', tam: 104, vel: 230, nome: { pt: 'Esquilo', en: 'Squirrel', es: 'Ardilla' },
    pernas: [[40, 80, 16, 7, '#a1582c'], [62, 80, 16, 7, '#a1582c']],
    svg: svg('<path d="M30 80 q-28 -10 -18 -46 q8 -24 26 -8 q-10 14 -2 30 Z" fill="#d2691e"/><ellipse cx="52" cy="66" rx="20" ry="18" fill="#e07b39"/><ellipse cx="56" cy="72" rx="10" ry="10" fill="#ffe0b2"/><circle cx="70" cy="46" r="13" fill="#e07b39"/><path d="M64 34 l2 -10 l6 8 Z" fill="#d2691e"/>' + olho(74, 44, 4) + '<circle cx="83" cy="49" r="2.5" fill="#3e2723"/>') });
  bicho({ id: 'pato', anda: 'anda', tam: 124, vel: 120, nome: { pt: 'Pato', en: 'Duck', es: 'Pato' },
    asas: [[44, 56, 16, 10, '#fdd835']], pernas: [[42, 78, 18, 4, '#ff9800'], [54, 78, 18, 4, '#ff9800']],
    svg: svg('<ellipse cx="46" cy="62" rx="30" ry="18" fill="#ffeb3b"/><path d="M16 56 l-6 -8 l12 4 Z" fill="#ffeb3b"/><ellipse cx="70" cy="40" rx="13" ry="14" fill="#ffeb3b"/><path d="M80 40 q12 0 14 4 q-6 4 -14 2 Z" fill="#ff9800"/>' + olho(72, 36, 4)) });
  bicho({ id: 'galinha', anda: 'anda', tam: 124, vel: 130, nome: { pt: 'Galinha', en: 'Hen', es: 'Gallina' },
    asas: [[44, 58, 15, 10, '#eeeeee']], pernas: [[44, 78, 18, 4, '#fbc02d'], [56, 78, 18, 4, '#fbc02d']],
    svg: svg('<path d="M16 50 q-4 -16 8 -14 q2 10 6 14 Z" fill="#fafafa"/><ellipse cx="48" cy="62" rx="28" ry="18" fill="#fafafa"/><ellipse cx="70" cy="40" rx="12" ry="14" fill="#fafafa"/><path d="M64 26 q3 -8 6 -2 q3 -6 6 2 Z" fill="#e53935"/><path d="M80 40 l10 3 l-10 3 Z" fill="#fbc02d"/><ellipse cx="78" cy="50" rx="3" ry="5" fill="#e53935"/>' + olho(72, 37, 3.6)) });
  bicho({ id: 'gato', anda: 'anda', tam: 156, vel: 200, nome: { pt: 'Gato', en: 'Cat', es: 'Gato' },
    pernas: [[28, 66, 30, 7, '#f57c00'], [36, 66, 30, 7, '#fb8c00'], [62, 66, 30, 7, '#f57c00'], [70, 66, 30, 7, '#fb8c00']],
    svg: svg('<path d="M18 62 q-14 -6 -10 -26" stroke="#fb8c00" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="48" cy="60" rx="30" ry="13" fill="#fb8c00"/><path d="M30 52 l6 10 M44 50 l4 12 M58 50 l2 12" stroke="#e65100" stroke-width="3"/><circle cx="78" cy="44" r="14" fill="#fb8c00"/><path d="M68 34 l2 -14 l9 10 Z M80 30 l8 -12 l3 15 Z" fill="#fb8c00"/>' + olho(82, 42, 4) + '<path d="M88 50 l9 -1 M88 52 l9 2" stroke="#5d4037" stroke-width="1.2"/><circle cx="90" cy="48" r="2" fill="#f06292"/>') });
  bicho({ id: 'cachorro', anda: 'anda', tam: 184, vel: 240, nome: { pt: 'Cachorro', en: 'Dog', es: 'Perro' },
    pernas: [[26, 62, 34, 8, '#8d6e63'], [34, 62, 34, 8, '#a1887f'], [62, 62, 34, 8, '#8d6e63'], [70, 62, 34, 8, '#a1887f']],
    svg: svg('<path d="M16 54 q-10 -10 -4 -22" stroke="#a1887f" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="46" cy="56" rx="32" ry="15" fill="#a1887f"/><circle cx="78" cy="40" r="16" fill="#a1887f"/><ellipse cx="90" cy="46" rx="9" ry="7" fill="#bcaaa4"/><circle cx="96" cy="44" r="3.5" fill="#3e2723"/><ellipse cx="70" cy="44" rx="6" ry="13" fill="#6d4c41" transform="rotate(14 70 44)"/>' + olho(82, 36, 4) + '<path d="M86 52 q4 6 8 2" stroke="#e57373" stroke-width="3" fill="none" stroke-linecap="round"/>') });
  bicho({ id: 'porquinho', anda: 'anda', tam: 150, vel: 130, nome: { pt: 'Porquinho', en: 'Piglet', es: 'Cerdito' },
    pernas: [[30, 68, 24, 9, '#f48fb1'], [38, 68, 24, 9, '#f8bbd0'], [60, 68, 24, 9, '#f48fb1'], [68, 68, 24, 9, '#f8bbd0']],
    svg: svg('<path d="M16 56 q-8 -2 -4 -8 q4 -4 2 -8" stroke="#f48fb1" stroke-width="3" fill="none"/><ellipse cx="48" cy="58" rx="34" ry="20" fill="#f8bbd0"/><circle cx="78" cy="48" r="16" fill="#f8bbd0"/><path d="M70 34 l4 -10 l6 10 Z" fill="#f48fb1"/><ellipse cx="92" cy="52" rx="6" ry="7" fill="#f48fb1"/><circle cx="91" cy="50" r="1.4" fill="#ad1457"/><circle cx="91" cy="55" r="1.4" fill="#ad1457"/>' + olho(80, 44, 3.8)) });
  bicho({ id: 'ovelha', anda: 'anda', tam: 180, vel: 120, nome: { pt: 'Ovelha', en: 'Sheep', es: 'Oveja' },
    pernas: [[30, 66, 28, 6, '#3e2723'], [38, 66, 28, 6, '#4e342e'], [60, 66, 28, 6, '#3e2723'], [68, 66, 28, 6, '#4e342e']],
    svg: svg('<g fill="#fafafa"><circle cx="26" cy="54" r="12"/><circle cx="38" cy="44" r="13"/><circle cx="54" cy="44" r="13"/><circle cx="66" cy="52" r="12"/><circle cx="40" cy="62" r="13"/><circle cx="56" cy="62" r="13"/></g><ellipse cx="80" cy="46" rx="11" ry="13" fill="#4e342e"/><ellipse cx="72" cy="40" rx="8" ry="4" fill="#4e342e" transform="rotate(-20 72 40)"/>' + olho(84, 42, 3.5)) });
  bicho({ id: 'tartaruga', anda: 'anda', tam: 104, vel: 45, nome: { pt: 'Tartaruga', en: 'Turtle', es: 'Tortuga' },
    pernas: [[32, 76, 16, 9, '#8bc34a'], [44, 78, 14, 9, '#9ccc65'], [60, 78, 14, 9, '#8bc34a'], [70, 76, 16, 9, '#9ccc65']],
    svg: svg('<path d="M18 78 A32 28 0 0 1 82 78 Z" fill="#2e7d32"/><path d="M34 60 l8 -8 l12 0 l8 8 l-8 10 l-12 0 Z" fill="#43a047" stroke="#1b5e20" stroke-width="2"/><rect x="16" y="74" width="68" height="6" rx="3" fill="#1b5e20"/><ellipse cx="88" cy="68" rx="10" ry="8" fill="#9ccc65"/>' + olho(90, 65, 3.4)) });
  bicho({ id: 'cavalo', anda: 'anda', tam: 540, vel: 300, nome: { pt: 'Cavalo (tamanho de verdade)', en: 'Horse (real size)', es: 'Caballo (tamaño real)' },
    pernas: [[27, 56, 42, 6.5, '#5d4037'], [33, 56, 42, 6.5, '#6d4c41'], [61, 56, 42, 6.5, '#5d4037'], [67, 56, 42, 6.5, '#6d4c41']],
    svg: svg('<path d="M17 44 q-12 4 -11 26 q4 -10 9 -16" fill="#3e2723"/><ellipse cx="45" cy="49" rx="29" ry="15" fill="#8d6e63"/><path d="M63 46 C66 34 70 24 74 16 L86 19 C82 28 79 38 77 52 Z" fill="#8d6e63"/><ellipse cx="86" cy="23" rx="12" ry="7.5" fill="#8d6e63" transform="rotate(32 86 23)"/><ellipse cx="92" cy="30" rx="5.5" ry="4.5" fill="#6d4c41"/><circle cx="93" cy="30" r="1.1" fill="#3e2723"/><path d="M77 13 l1 -7 l4 6 Z" fill="#6d4c41"/><path d="M75 14 C70 22 67 32 64 44" stroke="#3e2723" stroke-width="5" fill="none" stroke-linecap="round"/>' + olho(84, 19, 2.3)) });

  /* ---------- API ---------- */
  var minhas = [];
  function lista(turmas) {
    turmas = turmas || { propria: true, publica: true, minhas: true };
    return F.concat(minhas).filter(function (f) { return turmas[f.turma] !== false; });
  }
  function porId(id) { return F.concat(minhas).filter(function (f) { return f.id === id; })[0] || null; }

  /* As suas imagens: meus/personagens.json → [{ nome:{pt,en,es} | "texto", arquivo, papel, raio? }].
     Papéis aceitos: heroi, vilao, fruta, doce, bola, poder. Nada é executado: só imagem. */
  function carregarMeus(url) {
    if (typeof fetch !== 'function') return Promise.resolve([]);
    url = url || 'meus/personagens.json';
    var base = url.replace(/[^/]*$/, '');
    return fetch(url, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }).then(function (lista) {
      if (!Array.isArray(lista)) return [];
      minhas = lista.slice(0, 40).map(function (x, i) {
        if (!x || typeof x !== 'object' || typeof x.arquivo !== 'string' || !/^[\w.-]+\.(png|svg|webp|jpg|jpeg)$/i.test(x.arquivo)) return null;
        var papel = ['heroi', 'vilao', 'fruta', 'doce', 'bola', 'poder'].indexOf(x.papel) >= 0 ? x.papel : 'heroi';
        var nome = typeof x.nome === 'string' ? { pt: x.nome, en: x.nome, es: x.nome } : (x.nome && typeof x.nome === 'object') ? { pt: String(x.nome.pt || x.arquivo), en: String(x.nome.en || x.nome.pt || x.arquivo), es: String(x.nome.es || x.nome.pt || x.arquivo) } : { pt: x.arquivo, en: x.arquivo, es: x.arquivo };
        return { id: 'meu' + i, papel: papel, turma: 'minhas', raio: Math.max(30, Math.min(70, +x.raio || 46)), suco: '#fff', nome: { pt: nome.pt.slice(0, 40), en: nome.en.slice(0, 40), es: nome.es.slice(0, 40) }, img: base + x.arquivo, mascote: !!x.mascote, poder: x.poder === 'lento' || x.poder === 'chuva' ? x.poder : 'x2' };
      }).filter(Boolean);
      return minhas;
    });
  }

  /* Rasteriza uma figura num canvas quadrado (px) para desenhar rápido no palco. Cache por id+px. */
  var cache = {};
  function rasterizar(fig, px) {
    var k = fig.id + '@' + px;
    if (cache[k]) return cache[k];
    cache[k] = new Promise(function (ok) {
      var img = new Image();
      img.onload = function () {
        var c = document.createElement('canvas'); c.width = c.height = px;
        var ctx = c.getContext('2d');
        // imagens de fora (meus/) podem não ser quadradas: encaixa dentro do quadrado mantendo a proporção
        var w = img.naturalWidth || px, h = img.naturalHeight || px, esc = Math.min(px / w, px / h);
        ctx.drawImage(img, (px - w * esc) / 2, (px - h * esc) / 2, w * esc, h * esc);
        ok(c);
      };
      img.onerror = function () { var c = document.createElement('canvas'); c.width = c.height = px; var ctx = c.getContext('2d'); ctx.fillStyle = '#888'; ctx.beginPath(); ctx.arc(px / 2, px / 2, px / 2 - 2, 0, 6.3); ctx.fill(); ok(c); };
      if (fig.img) img.src = fig.img;
      else img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fig.svg);
    });
    return cache[k];
  }

  return { lista: lista, porId: porId, carregarMeus: carregarMeus, rasterizar: rasterizar, todas: F };
});
