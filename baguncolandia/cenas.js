/* Bagunçolândia — cenários desenhados (SVG vetorial, leve) para o ambiente "Paisagem + boneco".
   Cada cena: id, nome PT/EN, chão (y do chão em 0..1 do palco), céu (cor para o fundo do canvas) e o svg
   (viewBox 0 0 1280 720), rasterizado uma vez pelo desenho.js. Sem imagens de fora. */
(function (root, fabrica) {
  if (typeof module !== 'undefined' && module.exports) module.exports = fabrica();
  else root.Cenas = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var CHAO = 0.86;
  function svg(defs, corpo) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><defs>' + defs + '</defs>' + corpo + '</svg>'; }
  function nuvem(x, y, s, cor) { cor = cor || '#fff'; return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="' + cor + '" opacity=".95"><ellipse cx="0" cy="0" rx="60" ry="28"/><ellipse cx="-40" cy="8" rx="40" ry="22"/><ellipse cx="45" cy="6" rx="45" ry="24"/><ellipse cx="5" cy="-18" rx="38" ry="24"/></g>'; }
  function arvore(x, y, s, copa, tronco) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-14" y="-10" width="28" height="90" rx="8" fill="' + (tronco || '#8d5524') + '"/><circle cx="0" cy="-60" r="70" fill="' + copa + '"/><circle cx="-50" cy="-30" r="48" fill="' + copa + '"/><circle cx="50" cy="-30" r="48" fill="' + copa + '"/><circle cx="-20" cy="-90" r="40" fill="' + copa + '" opacity=".9"/><circle cx="25" cy="-85" r="36" fill="#fff" opacity=".12"/></g>'; }
  function flor(x, y, cor) { return '<g transform="translate(' + x + ' ' + y + ')"><rect x="-2" y="0" width="4" height="26" fill="#4caf50"/><circle cx="0" cy="-6" r="7" fill="' + cor + '"/><circle cx="-8" cy="0" r="7" fill="' + cor + '"/><circle cx="8" cy="0" r="7" fill="' + cor + '"/><circle cx="-5" cy="8" r="7" fill="' + cor + '"/><circle cx="5" cy="8" r="7" fill="' + cor + '"/><circle cx="0" cy="2" r="5" fill="#ffd166"/></g>'; }

  var C = [];
  C.push({ id: 'praia', bichos: true, buraco: false, nome: { pt: 'Praia', en: 'Beach' }, chao: CHAO, ceu: '#8fd7ff',
    svg: svg('<linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fb3ff"/><stop offset="1" stop-color="#bdeaff"/></linearGradient><linearGradient id="mar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1fa2d6"/><stop offset="1" stop-color="#0d6fa8"/></linearGradient><linearGradient id="areia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe8a8"/><stop offset="1" stop-color="#f0c674"/></linearGradient>',
      '<rect width="1280" height="720" fill="url(#ceu)"/><circle cx="1080" cy="120" r="70" fill="#fff176"/><circle cx="1080" cy="120" r="95" fill="#fff176" opacity=".25"/>' + nuvem(220, 110, 1.2) + nuvem(620, 70, 0.8) + nuvem(900, 170, 1) +
      '<rect y="420" width="1280" height="220" fill="url(#mar)"/><g fill="#fff" opacity=".5"><path d="M0 450 q40 -12 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 v6 h-1280z"/><path d="M0 520 q50 -14 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 v5 h-1280z" opacity=".6"/></g>' +
      '<path d="M0 560 Q320 530 640 575 T1280 560 V720 H0z" fill="url(#areia)"/><path d="M0 600 Q400 585 800 610 T1280 600 V720 H0z" fill="#ffd98c" opacity=".7"/>' +
      '<g transform="translate(180 600)"><path d="M0 0 q-10 -90 30 -160" stroke="#a0683d" stroke-width="16" fill="none" stroke-linecap="round"/><g fill="#3fbf4a"><path d="M30 -160 q-70 -40 -120 10 q60 -10 120 -10z"/><path d="M30 -160 q70 -40 120 10 q-60 -10 -120 -10z"/><path d="M30 -160 q-40 -70 -20 -120 q30 60 20 120z"/><path d="M30 -160 q40 -70 20 -120 q-30 60 -20 120z"/></g><circle cx="22" cy="-150" r="8" fill="#8d5524"/><circle cx="40" cy="-146" r="8" fill="#8d5524"/></g>' +
      '<g transform="translate(1060 600)"><rect x="-4" y="-150" width="8" height="150" fill="#f3f3f3"/><path d="M-110 -140 a110 60 0 0 1 220 0z" fill="#ff4fa3"/><path d="M-110 -140 a110 60 0 0 1 220 0z" fill="#fff" opacity=".0"/><g fill="#fff"><path d="M-110 -140 a110 60 0 0 1 55 -52 q-15 26 -15 52z"/><path d="M0 -200 a110 60 0 0 1 55 8 q-30 20 -40 52 l-15 0 q0 -34 0 -60z"/></g></g>' +
      '<g fill="#fff" opacity=".9"><ellipse cx="420" cy="640" rx="18" ry="8"/><ellipse cx="760" cy="660" rx="14" ry="6"/></g><circle cx="640" cy="650" r="22" fill="#ff7a00"/><path d="M640 650 m-22 0 a22 22 0 0 1 44 0" fill="#fff" opacity=".35"/>' +
      '<path transform="translate(880 665) scale(.9)" d="M0 -22 L6 -6 L22 -6 L9 4 L14 20 L0 10 L-14 20 L-9 4 L-22 -6 L-6 -6z" fill="#ff7043"/><path transform="translate(320 690)" d="M-14 0 a14 12 0 0 1 28 0z" fill="#ffccbc"/><g stroke="#ffab91" stroke-width="2"><path d="M314 690 l-4 -10 M320 690 v-11 M326 690 l4 -10"/></g>' +
      '<g transform="translate(980 640)"><rect x="-50" y="-30" width="100" height="40" fill="#f5c76b"/><rect x="-40" y="-60" width="30" height="30" fill="#f5c76b"/><rect x="10" y="-60" width="30" height="30" fill="#f5c76b"/><path d="M-40 -60 h6 v-6 h6 v6 h6 v-6 h6 v6 h6 M10 -60 h6 v-6 h6 v6 h6 v-6 h6 v6 h6" stroke="#e0b050" stroke-width="3" fill="none"/><rect x="-10" y="-14" width="20" height="24" rx="10" fill="#d9a441"/><path d="M25 -60 v-24 l14 6 l-14 6" stroke="#5d4037" stroke-width="2" fill="#ff4fa3"/></g>' +
      passaroCeu(420, 230, 1.2) + passaroCeu(470, 210, 0.9) + pedra(80, 640, 0.6, '#a1887f') + pedra(1240, 650, 0.5, '#8d6e63')) });

  C.push({ id: 'floresta', bichos: true, buraco: true, nome: { pt: 'Floresta', en: 'Forest' }, chao: CHAO, ceu: '#bfe9ff',
    svg: svg('<linearGradient id="ceu2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ccfff"/><stop offset="1" stop-color="#d6f3ff"/></linearGradient><linearGradient id="grama" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8bd450"/><stop offset="1" stop-color="#4f9d2f"/></linearGradient>',
      '<rect width="1280" height="720" fill="url(#ceu2)"/><circle cx="200" cy="130" r="60" fill="#fff59d"/>' + nuvem(500, 120, 1) + nuvem(1000, 90, 1.3) +
      '<ellipse cx="300" cy="600" rx="500" ry="180" fill="#7bc67a"/><ellipse cx="1000" cy="620" rx="520" ry="200" fill="#6ab868"/>' +
      arvore(120, 560, 1.1, '#3f9b3f') + arvore(1150, 540, 1.3, '#2e8b57') + arvore(380, 520, 0.7, '#4caf50') + arvore(900, 530, 0.8, '#43a047') +
      '<path d="M0 600 Q320 570 640 605 T1280 598 V720 H0z" fill="url(#grama)"/>' +
      '<g fill="#5aa832"><path d="M80 610 l6 -22 l6 22z M96 612 l5 -16 l5 16z M560 618 l6 -22 l6 22z M580 620 l5 -16 l5 16z M1010 614 l6 -22 l6 22z"/></g>' +
      flor(240, 630, '#ff4fa3') + flor(700, 650, '#ffd166') + flor(1180, 640, '#ff6f91') + flor(470, 660, '#b388ff') +
      '<g transform="translate(820 640)"><rect x="-8" y="-20" width="16" height="30" rx="6" fill="#fff8e1"/><path d="M-30 -20 a30 22 0 0 1 60 0z" fill="#e53935"/><circle cx="-12" cy="-30" r="4" fill="#fff"/><circle cx="10" cy="-26" r="3" fill="#fff"/></g>' +
      '<g transform="translate(560 630)"><rect x="-90" y="-26" width="180" height="40" rx="20" fill="#8d6e63"/><ellipse cx="90" cy="-6" rx="14" ry="20" fill="#d7a77a"/><ellipse cx="90" cy="-6" rx="7" ry="11" fill="#a1805a"/><path d="M-60 -26 q10 -18 22 0" fill="#7cb342"/></g>' +
      terra(300, 668, 100) + terra(1000, 672, 80) + pedra(140, 655, 0.6) + pedra(1230, 648, 0.5, '#bdbdbd') + tufos(605, 715, 55, '#5aa832', 13) + arbusto(700, 610, 0.6, '#388e3c') + arbusto(1080, 612, 0.5, '#2e7d32')) });

  C.push({ id: 'espaco', bichos: false, buraco: false, nome: { pt: 'Espaço', en: 'Space' }, chao: CHAO, ceu: '#0b0a1f',
    svg: svg('<radialGradient id="lua" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#e0e0e0"/><stop offset="1" stop-color="#8d8d9a"/></radialGradient><radialGradient id="pl" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#ffb74d"/><stop offset="1" stop-color="#c2410c"/></radialGradient>',
      '<rect width="1280" height="720" fill="#0b0a1f"/><g fill="#fff">' + [[60, 80, 2], [200, 200, 1.5], [330, 60, 2.5], [480, 160, 1.5], [700, 40, 2], [820, 220, 1.5], [980, 90, 2.5], [1150, 180, 1.5], [1240, 40, 2], [560, 300, 1.2], [1050, 320, 1.6], [150, 340, 1.4], [900, 380, 1.3]].map(function (s) { return '<circle cx="' + s[0] + '" cy="' + s[1] + '" r="' + s[2] + '"/>'; }).join('') + '</g>' +
      '<circle cx="1040" cy="150" r="80" fill="url(#pl)"/><ellipse cx="1040" cy="150" rx="130" ry="26" fill="none" stroke="#ffd166" stroke-width="10" opacity=".8" transform="rotate(-18 1040 150)"/>' +
      '<circle cx="260" cy="170" r="48" fill="#3ee8ff" opacity=".85"/><circle cx="245" cy="155" r="10" fill="#fff" opacity=".4"/>' +
      '<g transform="translate(600 150) rotate(30)"><path d="M0 -60 q30 0 30 60 v40 h-60 v-40 q0 -60 30 -60z" fill="#eceff1"/><circle cx="0" cy="-10" r="12" fill="#3ee8ff"/><path d="M-30 20 l-20 30 h20z M30 20 l20 30 h-20z" fill="#ff4fa3"/><path d="M-12 40 h24 l-12 40z" fill="#ff7a00"/><path d="M-6 40 h12 l-6 24z" fill="#fff176"/></g>' +
      '<ellipse cx="640" cy="760" rx="900" ry="180" fill="url(#lua)"/><g fill="#6f6f80" opacity=".8"><ellipse cx="300" cy="650" rx="50" ry="18"/><ellipse cx="900" cy="670" rx="70" ry="22"/><ellipse cx="620" cy="690" rx="40" ry="14"/></g><g fill="#fff" opacity=".2"><ellipse cx="290" cy="645" rx="30" ry="9"/><ellipse cx="885" cy="663" rx="40" ry="11"/></g>') });

  C.push({ id: 'cidade', bichos: true, buraco: false, nome: { pt: 'Cidade', en: 'City' }, chao: CHAO, ceu: '#ffb37a',
    svg: svg('<linearGradient id="ceu4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b3fa0"/><stop offset=".55" stop-color="#ff7eb3"/><stop offset="1" stop-color="#ffcf7a"/></linearGradient><linearGradient id="rua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4a5e"/><stop offset="1" stop-color="#2b2b3a"/></linearGradient>',
      '<rect width="1280" height="720" fill="url(#ceu4)"/><circle cx="640" cy="440" r="110" fill="#ffd166" opacity=".9"/>' + nuvem(260, 150, 1, '#ffd6ea') + nuvem(1000, 110, 1.2, '#ffe3f0') +
      '<g fill="#3b2a6e">' + [[0, 300, 120], [130, 220, 100], [240, 340, 80], [330, 180, 140], [480, 280, 110], [600, 360, 90], [700, 240, 120], [830, 320, 100], [940, 160, 150], [1100, 300, 90], [1200, 230, 80]].map(function (b) { return '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + (620 - b[1]) + '"/>'; }).join('') + '</g>' +
      '<g fill="#ffd166" opacity=".85">' + (function () { var o = ''; [[0, 300, 120], [130, 220, 100], [330, 180, 140], [480, 280, 110], [700, 240, 120], [830, 320, 100], [940, 160, 150], [1100, 300, 90], [1200, 230, 80]].forEach(function (b) { for (var y = b[1] + 20; y < 580; y += 36) for (var x = b[0] + 14; x < b[0] + b[2] - 14; x += 30) if ((x * 7 + y * 3) % 5 !== 0) o += '<rect x="' + x + '" y="' + y + '" width="12" height="16" rx="2"/>'; }); return o; })() + '</g>' +
      '<rect y="600" width="1280" height="120" fill="url(#rua)"/><g stroke="#fff" stroke-width="6" stroke-dasharray="40 30" opacity=".8"><path d="M0 660 H1280"/></g>' +
      '<g transform="translate(200 600)"><rect x="-4" y="-170" width="8" height="170" fill="#263238"/><circle cx="0" cy="-178" r="14" fill="#fff59d"/><circle cx="0" cy="-178" r="30" fill="#fff59d" opacity=".25"/></g><g transform="translate(1080 600)"><rect x="-4" y="-170" width="8" height="170" fill="#263238"/><circle cx="0" cy="-178" r="14" fill="#fff59d"/><circle cx="0" cy="-178" r="30" fill="#fff59d" opacity=".25"/></g>') });

  /* ---------- peças para cenários mais caprichados ---------- */
  function tufos(y0, y1, n, cor, semente) { var o = '', s = semente || 7; for (var i = 0; i < n; i++) { s = (s * 9301 + 49297) % 233280; var x = (s / 233280) * 1280; s = (s * 9301 + 49297) % 233280; var y = y0 + (s / 233280) * (y1 - y0), h = 10 + (s % 12); o += '<path d="M' + x.toFixed(0) + ' ' + y.toFixed(0) + ' l-5 ' + (-h) + ' l7 ' + (h - 4) + ' l4 ' + (-h - 4) + ' l3 ' + (h + 4) + ' l6 ' + (-h + 2) + ' l-2 ' + h + 'z" fill="' + cor + '"/>'; } return o; }
  function pedra(x, y, s, cor) { cor = cor || '#9e9e9e'; return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-40 0 q-6 -30 18 -40 q22 -12 44 2 q22 14 18 38z" fill="' + cor + '"/><path d="M-22 -30 q14 -8 30 -2" stroke="#fff" stroke-width="4" opacity=".35" fill="none" stroke-linecap="round"/></g>'; }
  function arbusto(x, y, s, cor) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="' + cor + '"><circle cx="-40" cy="-20" r="34"/><circle cx="0" cy="-38" r="42"/><circle cx="40" cy="-20" r="34"/><rect x="-70" y="-24" width="140" height="24" rx="12"/><circle cx="-12" cy="-52" r="14" fill="#fff" opacity=".12"/></g>'; }
  function pinheiro(x, y, s, cor) { cor = cor || '#2e7d32'; return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-8" y="-20" width="16" height="30" fill="#6d4c41"/><path d="M0 -150 L50 -60 H28 L60 -10 H-60 L-28 -60 H-50z" fill="' + cor + '"/><path d="M0 -150 L18 -118 L-6 -112z" fill="#fff" opacity=".18"/></g>'; }
  function cerca(x0, x1, y, cor) { var o = '<g fill="' + (cor || '#fff') + '">'; for (var x = x0; x <= x1; x += 38) o += '<path d="M' + x + ' ' + y + ' v-58 l9 -12 l9 12 v58z"/>'; return o + '<rect x="' + x0 + '" y="' + (y - 46) + '" width="' + (x1 - x0 + 18) + '" height="8" rx="3"/><rect x="' + x0 + '" y="' + (y - 20) + '" width="' + (x1 - x0 + 18) + '" height="8" rx="3"/></g>'; }
  function terra(x, y, w) { return '<g transform="translate(' + x + ' ' + y + ')"><ellipse cx="0" cy="0" rx="' + w + '" ry="' + (w * 0.18) + '" fill="#8d6e4a"/><ellipse cx="0" cy="-2" rx="' + (w * 0.92) + '" ry="' + (w * 0.13) + '" fill="#a1805a"/>' + [[-0.5, 0.02], [-0.1, -0.03], [0.35, 0.01], [0.6, -0.02]].map(function (p) { return '<circle cx="' + (p[0] * w).toFixed(0) + '" cy="' + (p[1] * w).toFixed(0) + '" r="3" fill="#6d4c41"/>'; }).join('') + '</g>'; }
  function sol(x, y, r) { var raios = ''; for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; raios += '<path d="M' + (x + Math.cos(a) * r * 1.25).toFixed(0) + ' ' + (y + Math.sin(a) * r * 1.25).toFixed(0) + ' L' + (x + Math.cos(a) * r * 1.6).toFixed(0) + ' ' + (y + Math.sin(a) * r * 1.6).toFixed(0) + '" stroke="#fff176" stroke-width="6" stroke-linecap="round" opacity=".7"/>'; } return raios + '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 1.15) + '" fill="#fff59d" opacity=".4"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#ffeb3b"/>'; }
  function passaroCeu(x, y, s) { return '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="M-14 0 q7 -8 14 0 q7 -8 14 0" stroke="#37474f" stroke-width="3" fill="none" stroke-linecap="round"/>'; }

  C.push({ id: 'fazenda', bichos: true, buraco: true, nome: { pt: 'Fazenda', en: 'Farm' }, chao: CHAO, ceu: '#9fdcff',
    svg: svg('<linearGradient id="fzC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ec2ff"/><stop offset="1" stop-color="#d9f4ff"/></linearGradient><linearGradient id="fzG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ccc65"/><stop offset="1" stop-color="#558b2f"/></linearGradient>',
      '<rect width="1280" height="720" fill="url(#fzC)"/>' + sol(1110, 110, 52) + nuvem(260, 100, 1.1) + nuvem(640, 70, 0.8) + passaroCeu(470, 150, 1) + passaroCeu(510, 135, 0.8) +
      '<path d="M0 470 Q200 380 430 450 T880 430 T1280 460 V720 H0z" fill="#aed581"/><path d="M0 500 Q300 440 640 500 T1280 490 V720 H0z" fill="#8bc34a"/>' +
      '<g stroke="#7cb342" stroke-width="5" opacity=".7"><path d="M120 470 L60 540 M200 462 L170 540 M280 466 L280 540 M360 474 L390 540"/></g>' +
      // celeiro vermelho e silo
      '<g transform="translate(880 300)"><rect x="210" y="40" width="70" height="220" rx="10" fill="#cfd8dc"/><path d="M210 40 a35 30 0 0 1 70 0z" fill="#90a4ae"/><g stroke="#b0bec5" stroke-width="3"><path d="M210 90 h70 M210 140 h70 M210 190 h70"/></g>' +
      '<path d="M0 90 L110 10 L220 90 V260 H0z" fill="#e53935"/><path d="M-12 96 L110 4 L232 96" stroke="#fff" stroke-width="10" fill="none" stroke-linejoin="round"/><rect x="70" y="150" width="80" height="110" fill="#b71c1c"/><path d="M70 150 L150 260 M150 150 L70 260" stroke="#fff" stroke-width="7"/><rect x="70" y="150" width="80" height="110" fill="none" stroke="#fff" stroke-width="7"/><rect x="88" y="60" width="44" height="40" fill="#fff8e1" stroke="#fff" stroke-width="5"/><g stroke="#c62828" stroke-width="2" opacity=".6"><path d="M0 120 h70 M0 170 h70 M0 220 h70 M150 120 h70 M150 170 h70 M150 220 h70"/></g></g>' +
      // moinho
      '<g transform="translate(130 330)"><path d="M-16 0 L-26 230 H26 L16 0z" fill="#eceff1"/><path d="M-26 230 H26" stroke="#b0bec5" stroke-width="4"/><g fill="#fff" stroke="#b0bec5" stroke-width="3"><path d="M0 0 L-12 -100 L12 -100z"/><path d="M0 0 L100 -12 L100 12z"/><path d="M0 0 L12 100 L-12 100z"/><path d="M0 0 L-100 12 L-100 -12z"/></g><circle r="10" fill="#90a4ae"/></g>' +
      '<path d="M0 560 Q320 530 640 565 T1280 555 V720 H0z" fill="url(#fzG)"/>' +
      cerca(240, 820, 572, '#d7ccc8') +
      // fardos de feno
      '<g transform="translate(760 560)"><rect x="-55" y="-50" width="110" height="60" rx="14" fill="#fbc02d"/><g stroke="#f57f17" stroke-width="3" opacity=".6"><path d="M-40 -40 v40 M-10 -44 v44 M20 -40 v40"/></g></g><g transform="translate(830 575)"><rect x="-40" y="-40" width="80" height="50" rx="12" fill="#f9a825"/></g>' +
      terra(420, 650, 120) + terra(1080, 668, 90) + tufos(600, 715, 60, '#689f38', 3) + tufos(590, 710, 30, '#7cb342', 11) +
      flor(70, 650, '#ff4fa3') + flor(600, 690, '#ffd166') + flor(980, 660, '#fff') + flor(1220, 690, '#b388ff') + pedra(1200, 640, 0.6) + pedra(560, 662, 0.4, '#bdbdbd')) });

  C.push({ id: 'jardim', bichos: true, buraco: true, nome: { pt: 'Jardim florido', en: 'Flower garden' }, chao: CHAO, ceu: '#bfe9ff',
    svg: svg('<linearGradient id="jdC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd8ff"/><stop offset="1" stop-color="#f1fbff"/></linearGradient><linearGradient id="jdG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8bd450"/><stop offset="1" stop-color="#4c9a2a"/></linearGradient><radialGradient id="jdL" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#81d4fa"/><stop offset="1" stop-color="#29b6f6"/></radialGradient>',
      '<rect width="1280" height="720" fill="url(#jdC)"/>' + sol(160, 110, 46) + nuvem(520, 90, 1) + nuvem(980, 130, 1.2) +
      // casa ao fundo e cerca-viva
      '<g transform="translate(870 250)"><rect x="0" y="80" width="300" height="220" fill="#fff3e0"/><path d="M-20 90 L150 -10 L320 90z" fill="#ef6c00"/><rect x="40" y="130" width="70" height="60" fill="#81d4fa" stroke="#fff" stroke-width="6"/><rect x="190" y="130" width="70" height="60" fill="#81d4fa" stroke="#fff" stroke-width="6"/><rect x="125" y="200" width="50" height="100" rx="6" fill="#8d6e63"/><circle cx="165" cy="250" r="4" fill="#ffd166"/></g>' +
      '<rect x="0" y="470" width="1280" height="90" rx="30" fill="#388e3c"/><g fill="#43a047">' + [60, 180, 300, 420, 540, 660, 780, 900, 1020, 1140, 1260].map(function (x) { return '<circle cx="' + x + '" cy="478" r="44"/>'; }).join('') + '</g>' +
      arvore(150, 560, 1.15, '#43a047') +
      '<path d="M0 560 Q320 545 640 570 T1280 560 V720 H0z" fill="url(#jdG)"/>' +
      // caminho de pedrinhas, laguinho, banco, casinha de passarinho
      '<g fill="#e0e0e0" stroke="#bdbdbd" stroke-width="2">' + [[560, 700], [600, 660], [640, 625], [690, 600]].map(function (p) { return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="34" ry="12"/>'; }).join('') + '</g>' +
      '<ellipse cx="1010" cy="660" rx="150" ry="38" fill="url(#jdL)"/><ellipse cx="1010" cy="660" rx="150" ry="38" fill="none" stroke="#9e9e9e" stroke-width="10"/><g fill="#66bb6a"><ellipse cx="960" cy="662" rx="22" ry="8"/><ellipse cx="1060" cy="652" rx="18" ry="7"/></g><circle cx="964" cy="658" r="6" fill="#f48fb1"/>' +
      '<g transform="translate(400 600)"><rect x="-70" y="-46" width="140" height="12" rx="4" fill="#8d6e63"/><rect x="-70" y="-26" width="140" height="10" rx="4" fill="#a1887f"/><rect x="-60" y="-16" width="8" height="30" fill="#5d4037"/><rect x="52" y="-16" width="8" height="30" fill="#5d4037"/></g>' +
      '<g transform="translate(820 600)"><rect x="-5" y="-150" width="10" height="150" fill="#795548"/><path d="M-36 -150 L0 -186 L36 -150z" fill="#e53935"/><rect x="-28" y="-150" width="56" height="50" fill="#ffcc80"/><circle cy="-126" r="9" fill="#5d4037"/></g>' +
      // canteiros com terra de verdade (minhoca e toupeira saem daqui)
      '<g transform="translate(240 650)"><rect x="-120" y="-20" width="240" height="44" rx="8" fill="#8d6e63"/><rect x="-112" y="-14" width="224" height="20" rx="6" fill="#6d4c41"/>' + flor(-80, -40, '#ff4fa3') + flor(-30, -44, '#ffd166') + flor(20, -40, '#e040fb') + flor(70, -44, '#ff7043') + '</g>' +
      terra(700, 676, 90) + tufos(590, 715, 50, '#558b2f', 5) + flor(80, 690, '#fff') + flor(1200, 700, '#ff4fa3') + flor(1150, 600, '#ffd166') + pedra(1240, 640, 0.5)) });

  C.push({ id: 'lago', bichos: true, buraco: true, nome: { pt: 'Lago na montanha', en: 'Mountain lake' }, chao: CHAO, ceu: '#c5e8ff',
    svg: svg('<linearGradient id="lgC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#64b5f6"/><stop offset="1" stop-color="#e3f2fd"/></linearGradient><linearGradient id="lgA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fc3f7"/><stop offset="1" stop-color="#0277bd"/></linearGradient><linearGradient id="lgG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ccc65"/><stop offset="1" stop-color="#33691e"/></linearGradient>',
      '<rect width="1280" height="720" fill="url(#lgC)"/>' + nuvem(300, 90, 1.2) + nuvem(900, 60, 0.9) + passaroCeu(700, 120, 1.1) +
      '<path d="M-40 470 L220 170 L360 330 L520 120 L720 380 L880 200 L1080 400 L1200 260 L1320 470z" fill="#78909c"/><path d="M220 170 L180 216 L210 210 L240 230 L262 220z M520 120 L470 178 L505 170 L540 190 L570 176z M880 200 L846 240 L876 236 L906 252 L924 244z" fill="#fff"/>' +
      '<path d="M-40 470 L100 360 L260 470z M420 470 L600 330 L760 470z M960 470 L1120 350 L1320 470z" fill="#607d8b"/>' +
      '<g>' + [40, 110, 170, 260, 330, 400, 900, 980, 1040, 1110, 1190, 1250].map(function (x, i) { return pinheiro(x, 480 + (i % 3) * 8, 0.55 + (i % 4) * 0.08, i % 2 ? '#2e7d32' : '#1b5e20'); }).join('') + '</g>' +
      '<rect x="0" y="470" width="1280" height="110" fill="url(#lgA)"/><g fill="#fff" opacity=".45"><rect x="120" y="500" width="160" height="4" rx="2"/><rect x="520" y="530" width="220" height="4" rx="2"/><rect x="900" y="505" width="140" height="4" rx="2"/></g>' +
      // píer e canoa
      '<g fill="#8d6e63"><rect x="760" y="520" width="240" height="14" rx="4"/><rect x="780" y="530" width="10" height="50"/><rect x="980" y="530" width="10" height="50"/></g><path d="M560 540 q80 26 160 0 q-10 18 -80 20 q-70 -2 -80 -20z" fill="#ef6c00"/>' +
      '<path d="M0 575 Q300 555 640 585 T1280 570 V720 H0z" fill="url(#lgG)"/>' +
      // juncos, pedras, cogumelos e terra
      '<g stroke="#558b2f" stroke-width="5" stroke-linecap="round">' + [60, 75, 90, 1180, 1195, 1210].map(function (x) { return '<path d="M' + x + ' 590 q4 -50 -6 -80"/>'; }).join('') + '</g><g fill="#6d4c41">' + [[56, 512], [86, 516], [1192, 514]].map(function (p) { return '<rect x="' + p[0] + '" y="' + p[1] + '" width="8" height="26" rx="4"/>'; }).join('') + '</g>' +
      pedra(300, 640, 0.8, '#8d8d8d') + pedra(360, 650, 0.45, '#a8a8a8') + pedra(1000, 660, 0.7, '#9e9e9e') + terra(620, 670, 110) + tufos(595, 715, 55, '#33691e', 9) +
      '<g transform="translate(860 660)"><rect x="-6" y="-16" width="12" height="20" rx="5" fill="#fff8e1"/><path d="M-22 -16 a22 16 0 0 1 44 0z" fill="#e53935"/><circle cx="-8" cy="-24" r="3" fill="#fff"/></g>' + flor(160, 690, '#ffd166') + flor(500, 700, '#ff4fa3')) });

  var cache = {};
  function lista() { return C; }
  function porId(id) { return C.filter(function (c) { return c.id === id; })[0] || null; }
  function sortear(exceto, filtro) { var l = C.filter(function (c) { return c.id !== exceto && (!filtro || filtro(c)); }); if (!l.length) l = C.filter(function (c) { return !filtro || filtro(c); }); return l[Math.floor(Math.random() * l.length)]; }
  function rasterizar(cena, w, h) {
    var k = cena.id + '@' + w; if (cache[k]) return cache[k];
    cache[k] = new Promise(function (ok) {
      var img = new Image();
      img.onload = function () { var c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h); ok(c); };
      img.onerror = function () { var c = document.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d'); x.fillStyle = cena.ceu; x.fillRect(0, 0, w, h); ok(c); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(cena.svg);
    });
    return cache[k];
  }
  return { lista: lista, porId: porId, sortear: sortear, rasterizar: rasterizar, CHAO: CHAO };
});
