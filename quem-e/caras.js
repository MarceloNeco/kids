/* Quem é? — desenha as caras do Duelo de Caras em SVG (busto: cabeça, ombros e roupa), a partir da cara que o
   logica.js sorteia. Tudo feito em código, nenhuma imagem de fora. Pedido do dono (14/Nov/2026): bem detalhado e
   colorido, nada de desenho simples de videogame antigo. O jeito de desenhar (ajudantes, tons de pele) veio da
   Purpurina (purpurina/boneca.js), para os jogos ficarem da mesma família.

   QECaras.svg(cara, op) → texto SVG
     op.id       prefixo dos ids internos (degradês, estampas): cada SVG na página precisa do seu
     op.grande   true = versão da lupa, com mais detalhe (fios de cabelo, costura, reflexos, cílios)
     op.largura / op.altura  tamanho em pixels (sem eles, o SVG ocupa a caixa onde estiver)
   Coordenadas: 300 de largura por 360 de altura. Cabeça em (150, 165) no adulto. */
(function (raiz) {
  'use strict';
  var W = 300, H = 360;

  // ---------- ajudantes (os mesmos da Purpurina) ----------
  function n(v) { return Math.round(v * 10) / 10; }
  function rgb(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function mistura(a, b, t) { var x = rgb(a), y = rgb(b); return '#' + [0, 1, 2].map(function (i) { var v = Math.round(x[i] + (y[i] - x[i]) * t); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function esc(h, t) { return mistura(h, '#1e0a28', t); }
  function cla(h, t) { return mistura(h, '#ffffff', t); }
  function at(o) { var s = ''; for (var k in o) if (o[k] !== undefined && o[k] !== null) s += ' ' + k + '="' + o[k] + '"'; return s; }
  function p(d, o) { return '<path d="' + d + '"' + at(o || {}) + '/>'; }
  function circ(cx, cy, r, o) { return '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '"' + at(o || {}) + '/>'; }
  function elip(cx, cy, rx, ry, o) { return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '"' + at(o || {}) + '/>'; }
  function espelhar(d) { var i = 0; return d.replace(/-?\d*\.?\d+/g, function (m) { var r = i % 2 === 0 ? String(n(W - parseFloat(m))) : m; i++; return r; }); }
  function dois(d, o) { return p(d, o) + p(espelhar(d), o); }
  function M(x, y) { return 'M' + n(x) + ',' + n(y); }
  function L(x, y) { return 'L' + n(x) + ',' + n(y); }
  function Q(a, b, x, y) { return 'Q' + n(a) + ',' + n(b) + ' ' + n(x) + ',' + n(y); }
  function C(a, b, c, d, x, y) { return 'C' + n(a) + ',' + n(b) + ' ' + n(c) + ',' + n(d) + ' ' + n(x) + ',' + n(y); }
  function estrela(x, y, R, r) { var s = ''; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; s += (i ? 'L' : 'M') + n(x + Math.cos(a) * q) + ',' + n(y + Math.sin(a) * q); } return s + 'Z'; }

  // ---------- paletas ----------
  var PALETAS = {
    pele: { p1: '#fde4d4', p2: '#f6c9a6', p3: '#e5a77c', p4: '#c58457', p5: '#94603d', p6: '#683f26' },
    cabelo: { preto: '#2c2233', castanho: '#6e4327', loiro: '#ecc56b', ruivo: '#d8612a', branco: '#e9e7f0' },
    peruca: { azul: '#3aa6ff', rosa: '#ff6fb6', verde: '#4fd667', arco: '#ff6f6f' },
    olhos: { castanhos: '#6d3e1f', azuis: '#3b8de2', verdes: '#38a26a' },
    roupa: { vermelho: '#e8433e', azul: '#3a7be0', verde: '#36b26a', amarelo: '#f6c22c', roxo: '#8e55d6', laranja: '#f5892c' }
  };
  var ARCO = ['#ff5a5a', '#ff9f2e', '#ffd93b', '#4fd667', '#3aa6ff', '#9b6bff'];
  // cor dos enfeites da cabeça (boné, chapéu, laço): contrasta com a roupa
  var ENFEITE = { vermelho: '#2f6fd6', azul: '#ff5b8f', verde: '#ff7a3d', amarelo: '#8e55d6', roxo: '#2fbf8f', laranja: '#3a7be0' };
  var LABIOS = '#c9475e';
  var VERMELHO_PALHACO = '#e8203a';

  function geometria(c) {
    var crianca = c.tipo === 'menino' || c.tipo === 'menina';
    var idoso = c.tipo === 'vovo' || c.tipo === 'vova';
    var masc = c.tipo === 'menino' || c.tipo === 'homem' || c.tipo === 'vovo';
    return crianca ? { cx: 150, cy: 182, rx: 63, ry: 66, queixo: 0.78, crianca: true, idoso: false, masc: masc }
      : { cx: 150, cy: 175, rx: masc ? 60 : 57, ry: 73, queixo: masc ? 0.62 : 0.55, crianca: false, idoso: idoso, masc: masc };
  }

  function rosto(g) {
    var cx = g.cx, cy = g.cy, rx = g.rx, ry = g.ry, q = g.queixo;
    return M(cx - rx, cy) + C(cx - rx, cy - ry * 1.12, cx + rx, cy - ry * 1.12, cx + rx, cy) +
      C(cx + rx, cy + ry * 0.62, cx + rx * q, cy + ry, cx, cy + ry) + C(cx - rx * q, cy + ry, cx - rx, cy + ry * 0.62, cx - rx, cy) + 'Z';
  }

  // ---------- degradês e estampas ----------
  function defs(c, g, I, cores) {
    var s = '<defs>' +
      '<radialGradient id="' + I + 'fu" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="' + cla(cores.roupa, 0.82) + '"/><stop offset="1" stop-color="' + cla(cores.roupa, 0.45) + '"/></radialGradient>' +
      '<radialGradient id="' + I + 'pe" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="' + cla(cores.pele, 0.18) + '"/><stop offset=".7" stop-color="' + cores.pele + '"/><stop offset="1" stop-color="' + esc(cores.pele, 0.14) + '"/></radialGradient>' +
      '<linearGradient id="' + I + 'ca" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="' + cla(cores.cabelo, 0.22) + '"/><stop offset=".55" stop-color="' + cores.cabelo + '"/><stop offset="1" stop-color="' + esc(cores.cabelo, 0.22) + '"/></linearGradient>' +
      '<linearGradient id="' + I + 'ro" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + esc(cores.roupa, 0.2) + '"/><stop offset=".35" stop-color="' + cores.roupa + '"/><stop offset=".65" stop-color="' + cla(cores.roupa, 0.08) + '"/><stop offset="1" stop-color="' + esc(cores.roupa, 0.22) + '"/></linearGradient>';
    var e = c.estampa, cor = cla(cores.roupa, 0.55);
    if (e === 'listras') s += '<pattern id="' + I + 'es" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="7" fill="' + cor + '" opacity=".75"/></pattern>';
    else if (e === 'bolinhas') s += '<pattern id="' + I + 'es" width="20" height="20" patternUnits="userSpaceOnUse">' + circ(5, 5, 3.2, { fill: '#fff', opacity: 0.85 }) + circ(15, 15, 3.2, { fill: '#fff', opacity: 0.85 }) + '</pattern>';
    else if (e === 'xadrez') s += '<pattern id="' + I + 'es" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="9" fill="' + esc(cores.roupa, 0.35) + '" opacity=".45"/><rect width="9" height="24" fill="' + esc(cores.roupa, 0.35) + '" opacity=".45"/><rect x="15" width="2" height="24" fill="#fff" opacity=".5"/></pattern>';
    else if (e === 'estrelas') s += '<pattern id="' + I + 'es" width="30" height="30" patternUnits="userSpaceOnUse">' + p(estrela(9, 9, 5.5, 2.4), { fill: '#fff6a8' }) + p(estrela(24, 23, 4, 1.8), { fill: '#fff', opacity: 0.85 }) + '</pattern>';
    if (c.oculos === 'escuros') s += '<linearGradient id="' + I + 'le" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3a63"/><stop offset="1" stop-color="#140c1c"/></linearGradient>';
    if (c.cabeca === 'coroa') s += '<linearGradient id="' + I + 'ou" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2a6"/><stop offset=".45" stop-color="#ffcb2f"/><stop offset="1" stop-color="#c9871a"/></linearGradient>';
    if (c.nariz) s += '<radialGradient id="' + I + 'na" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#ff8a96"/><stop offset=".5" stop-color="' + VERMELHO_PALHACO + '"/><stop offset="1" stop-color="#9e0f22"/></radialGradient>';
    return s + '</defs>';
  }

  // pescoço com sombra embaixo do queixo (o corpo inteiro desenha só ele; o busto desenha dentro da roupa)
  function pescoco(g, cores) {
    return p('M130,' + (g.cy + g.ry - 30) + ' L130,292 Q150,304 170,292 L170,' + (g.cy + g.ry - 30) + 'Z', { fill: cores.pele, stroke: esc(cores.pele, 0.3), 'stroke-width': 2 }) +
      p('M130,' + (g.cy + g.ry - 8) + ' Q150,' + (g.cy + g.ry + 14) + ' 170,' + (g.cy + g.ry - 8) + ' L170,' + (g.cy + g.ry + 6) + ' Q150,' + (g.cy + g.ry + 20) + ' 130,' + (g.cy + g.ry + 6) + 'Z', { fill: esc(cores.pele, 0.2), opacity: 0.55 });
  }

  // ---------- roupa e ombros ----------
  function roupa(c, g, I, cores, grande) {
    var corpo = 'M18,360 C22,318 52,294 104,284 L196,284 C248,294 278,318 282,360Z';
    var s = p(corpo, { fill: 'url(#' + I + 'ro)', stroke: esc(cores.roupa, 0.45), 'stroke-width': 3 });
    if (c.estampa !== 'lisa') s += p(corpo, { fill: 'url(#' + I + 'es)' });
    // pescoço com sombra embaixo do queixo
    var pesc = 'M130,' + (g.cy + g.ry - 30) + ' L130,292 Q150,304 170,292 L170,' + (g.cy + g.ry - 30) + 'Z';
    s += p(pesc, { fill: cores.pele, stroke: esc(cores.pele, 0.3), 'stroke-width': 2 }) +
      p('M130,' + (g.cy + g.ry - 8) + ' Q150,' + (g.cy + g.ry + 14) + ' 170,' + (g.cy + g.ry - 8) + ' L170,' + (g.cy + g.ry + 6) + ' Q150,' + (g.cy + g.ry + 20) + ' 130,' + (g.cy + g.ry + 6) + 'Z', { fill: esc(cores.pele, 0.2), opacity: 0.55 });
    var gola = esc(cores.roupa, 0.35);
    if (g.idoso && g.masc) {
      // vovô: cardigã aberto com botões
      s += p('M122,286 L150,340 L178,286', { fill: 'none', stroke: gola, 'stroke-width': 4, 'stroke-linejoin': 'round' }) +
        p('M122,286 L150,340 L150,360 L104,360 L112,292Z', { fill: esc(cores.roupa, 0.12) }) + p(espelhar('M122,286 L150,340 L150,360 L104,360 L112,292Z'), { fill: esc(cores.roupa, 0.12) }) +
        circ(141, 334, 4, { fill: cla(cores.roupa, 0.6), stroke: gola, 'stroke-width': 1.5 }) + circ(141, 352, 4, { fill: cla(cores.roupa, 0.6), stroke: gola, 'stroke-width': 1.5 });
    } else if (g.idoso) {
      // vovó: gola de renda
      var renda = '';
      for (var i = 0; i < 7; i++) renda += circ(118 + i * 10.7, 296 + Math.sin(i / 6 * Math.PI) * 10, 6.5, { fill: '#fffaf2', stroke: '#e6d8c8', 'stroke-width': 1.2 });
      s += renda;
    } else if (c.tipo === 'homem') {
      // homem: camisa com colarinho e botões
      s += dois('M150,300 L126,282 L118,300 L140,318Z', { fill: cla(cores.roupa, 0.75), stroke: gola, 'stroke-width': 2, 'stroke-linejoin': 'round' }) +
        p('M150,302 L150,360', { stroke: gola, 'stroke-width': 2 }) + circ(150, 326, 3, { fill: cla(cores.roupa, 0.8), stroke: gola }) + circ(150, 346, 3, { fill: cla(cores.roupa, 0.8), stroke: gola });
    } else if (c.tipo === 'mulher') {
      s += p('M118,286 Q150,326 182,286', { fill: cores.pele, stroke: gola, 'stroke-width': 3.5 });
    } else {
      // criança: camiseta de gola redonda
      s += p('M124,286 Q150,306 176,286', { fill: 'none', stroke: gola, 'stroke-width': 6, 'stroke-linecap': 'round' });
    }
    if (grande) {
      // costura e dobras do tecido
      s += p('M58,330 Q74,316 96,308', { fill: 'none', stroke: esc(cores.roupa, 0.3), 'stroke-width': 2, opacity: 0.6 }) +
        p(espelhar('M58,330 Q74,316 96,308'), { fill: 'none', stroke: esc(cores.roupa, 0.3), 'stroke-width': 2, opacity: 0.6 }) +
        p('M40,350 C52,322 80,302 110,292', { fill: 'none', stroke: cla(cores.roupa, 0.5), 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }) +
        p(espelhar('M40,350 C52,322 80,302 110,292'), { fill: 'none', stroke: cla(cores.roupa, 0.5), 'stroke-width': 1.6, 'stroke-dasharray': '5 4' });
    }
    return s;
  }

  function colar(c, g) {
    if (!c.colar) return '';
    var s = '', cor = g.masc ? '#d9a62a' : '#fff6f0';
    for (var i = 0; i <= 10; i++) {
      var t = i / 10, x = 124 + 52 * t, y = 288 + Math.sin(t * Math.PI) * 22;
      s += circ(x, y, g.masc ? 2.6 : 4.2, { fill: cor, stroke: g.masc ? '#a87812' : '#d9c6c0', 'stroke-width': 1 });
    }
    return s + p('M150,312 L143,322 L150,334 L157,322Z', { fill: '#ff5fa8', stroke: '#b32a6a', 'stroke-width': 1.5 }) + circ(148, 320, 1.6, { fill: '#fff' });
  }

  // ---------- cabelo ----------
  function corCabelo(c) { return c.peruca ? PALETAS.peruca[c.peruca] : PALETAS.cabelo[c.cabeloCor]; }

  function cabeloTras(c, g, I, cores) {
    if (c.peruca) return perucaVolume(c, g, I, true);
    var cx = g.cx, cy = g.cy, rx = g.rx, f = { fill: 'url(#' + I + 'ca)', stroke: esc(cores.cabelo, 0.35), 'stroke-width': 2.5 };
    if (c.cabeloComp === 'comprido') return p(M(cx - rx - 6, cy - 30) + C(cx - rx - 26, cy + 50, cx - rx - 30, cy + 120, cx - rx - 12, 318) + Q(cx, 330, cx + rx + 12, 318) + C(cx + rx + 30, cy + 120, cx + rx + 26, cy + 50, cx + rx + 6, cy - 30) + 'Z', f);
    if (c.cabeloComp === 'medio') return p(M(cx - rx - 6, cy - 30) + C(cx - rx - 18, cy + 30, cx - rx - 16, cy + 70, cx - rx + 2, cy + g.ry * 0.8) + L(cx + rx - 2, cy + g.ry * 0.8) + C(cx + rx + 16, cy + 70, cx + rx + 18, cy + 30, cx + rx + 6, cy - 30) + 'Z', f);
    return '';
  }

  function perucaVolume(c, g, I, tras) {
    // peruca de palhaço cacheada: bolinhas grandes em volta da cabeça (arco = cada bolinha de uma cor)
    var cx = g.cx, cy = g.cy - 14, R = g.rx + 22, s = '', k = 0;
    var base = PALETAS.peruca[c.peruca];
    var angs = tras ? [200, 225, 250, 290, 315, 340, 165, 15, 140, 40] : [190, 215, 240, 270, 300, 325, 350];
    angs.forEach(function (a) {
      var r = a * Math.PI / 180, x = cx + Math.cos(r) * R * (tras ? 1 : 0.92), y = cy + Math.sin(r) * R * (tras ? 0.95 : 0.8);
      var cor = c.peruca === 'arco' ? ARCO[k % ARCO.length] : base; k++;
      s += circ(x, y, tras ? 30 : 24, { fill: cor, stroke: esc(cor, 0.35), 'stroke-width': 2.5 }) + circ(x - 8, y - 9, tras ? 9 : 7, { fill: cla(cor, 0.5), opacity: 0.7 });
    });
    return s;
  }

  function cabeloFrente(c, g, I, cores, grande) {
    if (c.peruca) return perucaVolume(c, g, I, false);
    var cx = g.cx, cy = g.cy, rx = g.rx, ry = g.ry, s = '';
    var f = { fill: 'url(#' + I + 'ca)', stroke: esc(cores.cabelo, 0.35), 'stroke-width': 2.5, 'stroke-linejoin': 'round' };
    if (c.cabeloComp === 'careca') {
      s += elip(cx - 18, cy - ry * 0.72, 16, 8, { fill: '#fff', opacity: 0.35 });
      if (g.idoso) s += dois(M(cx - rx - 3, cy + 6) + C(cx - rx - 10, cy - 18, cx - rx + 2, cy - 34, cx - rx + 14, cy - 36) + C(cx - rx + 8, cy - 18, cx - rx + 6, cy - 2, cx - rx + 4, cy + 10) + 'Z', f);
      return s;
    }
    var topo = cy - ry * 1.02, linha = cy - ry * (g.masc ? 0.5 : 0.42);
    var capa = M(cx - rx - 5, cy + (g.masc ? -8 : 14)) + C(cx - rx - 12, topo - 26, cx + rx + 12, topo - 26, cx + rx + 5, cy + (g.masc ? -8 : 14));
    if (g.masc) {
      capa += L(cx + rx - 4, cy - 18) + Q(cx + rx * 0.7, linha - 6, cx + rx * 0.3, linha) + Q(cx + 4, linha - 14, cx - rx * 0.25, linha - 2) + Q(cx - rx * 0.7, linha - 8, cx - rx + 4, cy - 18) + 'Z';
    } else {
      // franja de lado, caindo pela testa
      capa += L(cx + rx - 3, cy - 2) + Q(cx + rx * 0.9, linha, cx + rx * 0.55, linha - 4) + Q(cx + rx * 0.05, linha + 8, cx - rx * 0.45, linha + 18) + Q(cx - rx * 0.85, linha + 18, cx - rx + 3, cy + 10) + 'Z';
    }
    s += p(capa, f);
    // brilho em faixa e mechas
    s += p(M(cx - rx * 0.55, topo + 14) + Q(cx, topo - 4, cx + rx * 0.55, topo + 14), { fill: 'none', stroke: cla(cores.cabelo, 0.55), 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.55 });
    var mechas = grande ? 7 : 3;
    for (var i = 0; i < mechas; i++) {
      var x = cx - rx * 0.6 + (rx * 1.2) * (i + 0.5) / mechas;
      s += p(M(x, topo + 4) + Q(x + (g.masc ? 4 : 10), (topo + linha) / 2, x + (g.masc ? 2 : 14), linha - 2), { fill: 'none', stroke: esc(cores.cabelo, 0.3), 'stroke-width': grande ? 1.4 : 2, opacity: 0.6, 'stroke-linecap': 'round' });
    }
    if (c.cabeloComp === 'comprido' || c.cabeloComp === 'medio') {
      var fim = c.cabeloComp === 'comprido' ? 300 : cy + ry * 0.78;
      // mechas que caem dos lados do rosto, por cima dos ombros
      s += dois(M(cx - rx - 5, cy - 4) + C(cx - rx - 12, cy + 40, cx - rx - 8, fim - 30, cx - rx + 8, fim) + C(cx - rx + 2, fim - 40, cx - rx + 6, cy + 40, cx - rx + 4, cy + 4) + 'Z', f);
    }
    if (grande) {
      for (var j = 0; j < 5; j++) s += p(M(cx - rx + 8 + j * 4, topo + 20 + j * 3) + Q(cx - rx * 0.3, topo + 6, cx + j * 6, topo + 2 + j * 2), { fill: 'none', stroke: cla(cores.cabelo, 0.4), 'stroke-width': 0.9, opacity: 0.7 });
    }
    return s;
  }

  // ---------- rosto ----------
  function olhos(c, g, grande) {
    var cx = g.cx, y = g.cy + 2, d = g.crianca ? 25 : 23, rx = g.crianca ? 14 : 12.5, ry = g.crianca ? 11.5 : (g.idoso ? 7.5 : 9.5);
    var iris = PALETAS.olhos[c.olhos], s = '';
    [-1, 1].forEach(function (lado) {
      var x = cx + lado * d;
      s += elip(x, y, rx, ry, { fill: '#fff', stroke: '#3a1450', 'stroke-width': 2 }) +
        circ(x + lado * 1, y + 1, ry * 0.78, { fill: iris }) + circ(x + lado * 1, y + 1, ry * 0.78 * 0.62, { fill: esc(iris, 0.45), opacity: grande ? 0.5 : 0 }) +
        circ(x + lado * 1, y + 1, ry * 0.36, { fill: '#1e0a28' }) + circ(x - 3, y - 3, ry * 0.26, { fill: '#fff' }) +
        (grande ? circ(x + 3, y + 3, ry * 0.12, { fill: '#fff', opacity: 0.8 }) : '') +
        p(M(x - rx - 1, y - 1) + Q(x, y - ry - 6, x + rx + 1, y - 1), { fill: 'none', stroke: '#3a1450', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
      if (!g.masc) {
        var cilios = grande ? 3 : 2;
        for (var k = 0; k < cilios; k++) {
          var bx = x + lado * (rx * 0.35 + k * 4.5), by = y - ry * 0.85 - k * 0.5;
          s += p(M(bx, by) + L(bx + lado * 4, by - 5), { stroke: '#3a1450', 'stroke-width': 2, 'stroke-linecap': 'round' });
        }
      }
      if (g.idoso) s += p(M(x + lado * (rx + 3), y + 1) + L(x + lado * (rx + 9), y - 2) + M(x + lado * (rx + 3), y + 4) + L(x + lado * (rx + 9), y + 5), { stroke: esc('#c58457', 0.2), 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: 0.7 });
    });
    return s;
  }

  function sobrancelhas(c, g, cores) {
    var cor = c.cabeloComp === 'careca' && !c.peruca ? esc(cores.pele, 0.45) : esc(PALETAS.cabelo[c.cabeloCor], 0.15), y = g.cy - (g.crianca ? 15 : 16);
    return dois(M(g.cx - 34, y + 2) + Q(g.cx - 24, y - 7, g.cx - 12, y), { fill: 'none', stroke: cor, 'stroke-width': g.masc ? 5 : 3.5, 'stroke-linecap': 'round' });
  }

  function nariz(c, g, I, cores) {
    var cx = g.cx, y = g.cy + (g.crianca ? 24 : 26);
    if (c.nariz) return circ(cx, y, 12.5, { fill: 'url(#' + I + 'na)', stroke: '#9e0f22', 'stroke-width': 2 }) + elip(cx - 4, y - 5, 4, 2.6, { fill: '#fff', opacity: 0.8 });
    return p(M(cx - 2, y - 14) + Q(cx - 6, y + 2, cx - 1, y + 4) + Q(cx + 6, y + 6, cx + 8, y + 1), { fill: 'none', stroke: esc(cores.pele, 0.4), 'stroke-width': 2.5, 'stroke-linecap': 'round' }) +
      elip(cx - 2, y - 4, 3, 5, { fill: '#fff', opacity: 0.35 });
  }

  function boca(c, g) {
    var cx = g.cx, y = g.cy + g.ry * (g.crianca ? 0.6 : 0.58), lg = g.crianca ? 18 : 16;
    return p(M(cx - lg, y) + Q(cx, y + 20, cx + lg, y) + Q(cx, y + 6, cx - lg, y) + 'Z', { fill: '#b8364d', stroke: '#3a1450', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }) +
      p(M(cx - lg + 5, y + 2.5) + Q(cx, y + 7, cx + lg - 5, y + 2.5) + L(cx + lg - 6, y + 5) + Q(cx, y + 9, cx - lg + 6, y + 5) + 'Z', { fill: '#fff' }) +
      elip(cx, y + 11, 6, 3, { fill: '#ff8fa0' }) +
      (g.masc ? '' : p(M(cx - lg - 1, y - 1) + Q(cx, y - 3, cx + lg + 1, y - 1), { fill: 'none', stroke: LABIOS, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.8 }));
  }

  function bochechas(c, g) {
    var y = g.cy + 24, s = elip(g.cx - 38, y, 11, 7, { fill: '#ff7a9a', opacity: 0.32 }) + elip(g.cx + 38, y, 11, 7, { fill: '#ff7a9a', opacity: 0.32 });
    if (c.sardas) {
      [[-36, -4], [-42, 2], [-30, 3], [-38, 8], [-46, -2]].forEach(function (q) {
        s += circ(g.cx + q[0], y + q[1], 1.7, { fill: '#a9572f', opacity: 0.75 }) + circ(g.cx - q[0], y + q[1] + 1, 1.7, { fill: '#a9572f', opacity: 0.75 });
      });
    }
    return s;
  }

  function pelosRosto(c, g, cores) {
    if (c.pelos === 'nenhum') return { barba: '', bigode: '' };
    var cor = c.cabeloComp === 'careca' && c.cabeloCor !== 'branco' ? '#4a3a3a' : PALETAS.cabelo[c.cabeloCor];
    var cx = g.cx, cy = g.cy, rx = g.rx, ry = g.ry, f = { fill: cor, stroke: esc(cor, 0.35), 'stroke-width': 2, 'stroke-linejoin': 'round' };
    var bigode = p(M(cx, cy + 38) + C(cx - 10, cy + 32, cx - 26, cy + 36, cx - 30, cy + 46) + C(cx - 18, cy + 44, cx - 8, cy + 46, cx, cy + 42) +
      C(cx + 8, cy + 46, cx + 18, cy + 44, cx + 30, cy + 46) + C(cx + 26, cy + 36, cx + 10, cy + 32, cx, cy + 38) + 'Z', f);
    if (c.pelos === 'bigode') return { barba: '', bigode: bigode };
    var barba = M(cx - rx + 1, cy + 4) + C(cx - rx + 2, cy + ry * 0.9, cx - rx * 0.5, cy + ry + 22, cx, cy + ry + 22) +
      C(cx + rx * 0.5, cy + ry + 22, cx + rx - 2, cy + ry * 0.9, cx + rx - 1, cy + 4) + L(cx + rx - 12, cy + 16) +
      C(cx + rx * 0.5, cy + 54, cx + 22, cy + 62, cx, cy + 62) + C(cx - 22, cy + 62, cx - rx * 0.5, cy + 54, cx - rx + 12, cy + 16) + 'Z';
    return { barba: p(barba, f), bigode: bigode };
  }

  function orelhas(c, g, cores) {
    var s = dois(M(g.cx - g.rx + 3, g.cy - 12) + C(g.cx - g.rx - 16, g.cy - 18, g.cx - g.rx - 16, g.cy + 22, g.cx - g.rx + 3, g.cy + 18) + 'Z', { fill: cores.pele, stroke: esc(cores.pele, 0.35), 'stroke-width': 2 });
    if (c.brinco) {
      var y = g.cy + 24;
      if (g.masc) s += circ(g.cx - g.rx - 5, y, 3.5, { fill: '#ffd23f', stroke: '#b8860b' }) + circ(g.cx + g.rx + 5, y, 3.5, { fill: '#ffd23f', stroke: '#b8860b' });
      else s += [-1, 1].map(function (l) { var x = g.cx + l * (g.rx + 5); return circ(x, y + 9, 9, { fill: 'none', stroke: '#e0a81e', 'stroke-width': 3.2 }) + circ(x, y + 18, 3, { fill: '#ff5fa8' }); }).join('');
    }
    return s;
  }

  function oculos(c, g, I) {
    if (c.oculos === 'nenhum') return '';
    var cx = g.cx, y = g.cy + 2, d = g.crianca ? 25 : 23, s = '';
    if (c.oculos === 'grau') {
      s += [-1, 1].map(function (l) { return '<rect x="' + n(cx + l * d - 17) + '" y="' + n(y - 13) + '" width="34" height="26" rx="10" fill="#cfe9ff" fill-opacity=".25" stroke="#3a1450" stroke-width="3.2"/>'; }).join('') +
        p(M(cx - d + 17, y - 2) + Q(cx, y - 9, cx + d - 17, y - 2), { fill: 'none', stroke: '#3a1450', 'stroke-width': 3 });
    } else if (c.oculos === 'escuros') {
      s += [-1, 1].map(function (l) { return p(M(cx + l * d - 19, y - 12) + L(cx + l * d + 19, y - 12) + Q(cx + l * d + 19, y + 14, cx + l * d, y + 14) + Q(cx + l * d - 19, y + 14, cx + l * d - 19, y - 12) + 'Z', { fill: 'url(#' + I + 'le)', stroke: '#140c1c', 'stroke-width': 3 }) + p(M(cx + l * d - 12, y - 6) + L(cx + l * d - 4, y - 6) + L(cx + l * d - 11, y + 4) + 'Z', { fill: '#fff', opacity: 0.55 }); }).join('') +
        p(M(cx - d + 19, y - 8) + L(cx + d - 19, y - 8), { stroke: '#140c1c', 'stroke-width': 4 });
    } else {
      // coloridos: armação grossa em forma de coração, cor de chiclete
      s += [-1, 1].map(function (l) { var x = cx + l * d; return p(M(x, y + 13) + C(x - 24, y, x - 14, y - 20, x, y - 9) + C(x + 14, y - 20, x + 24, y, x, y + 13) + 'Z', { fill: '#ffe0f0', 'fill-opacity': 0.35, stroke: '#ff3fa0', 'stroke-width': 5, 'stroke-linejoin': 'round' }); }).join('') +
        p(M(cx - d + 12, y - 6) + Q(cx, y - 12, cx + d - 12, y - 6), { fill: 'none', stroke: '#ff3fa0', 'stroke-width': 4 });
    }
    return s + dois(M(cx - d - 17, y - 4) + L(cx - g.rx - 2, y - 8), { stroke: c.oculos === 'coloridos' ? '#ff3fa0' : '#3a1450', 'stroke-width': 3, 'stroke-linecap': 'round' });
  }

  // ---------- na cabeça ----------
  function naCabeca(c, g, I) {
    var k = c.cabeca, cx = g.cx, topo = g.cy - g.ry - (c.peruca ? 18 : 6), cor = ENFEITE[c.roupaCor], s = '';
    if (k === 'nada') return '';
    if (k === 'bone') {
      s += p(M(cx - g.rx - 4, topo + 30) + C(cx - g.rx, topo - 22, cx + g.rx, topo - 22, cx + g.rx + 4, topo + 30) + 'Z', { fill: cor, stroke: esc(cor, 0.4), 'stroke-width': 2.5 }) +
        p(M(cx - g.rx - 6, topo + 28) + Q(cx - 20, topo + 22, cx + g.rx + 50, topo + 34) + Q(cx + g.rx + 40, topo + 46, cx - g.rx - 6, topo + 36) + 'Z', { fill: esc(cor, 0.25), stroke: esc(cor, 0.45), 'stroke-width': 2.5 }) +
        circ(cx, topo - 9, 5, { fill: esc(cor, 0.3) }) + p(M(cx - 24, topo + 2) + Q(cx, topo - 14, cx + 24, topo + 2), { fill: 'none', stroke: cla(cor, 0.45), 'stroke-width': 3, opacity: 0.7 });
    } else if (k === 'chapeu') {
      s += elip(cx, topo + 26, g.rx + 36, 13, { fill: cor, stroke: esc(cor, 0.4), 'stroke-width': 2.5 }) +
        p(M(cx - g.rx + 6, topo + 26) + L(cx - g.rx + 12, topo - 34) + Q(cx, topo - 44, cx + g.rx - 12, topo - 34) + L(cx + g.rx - 6, topo + 26) + 'Z', { fill: cor, stroke: esc(cor, 0.4), 'stroke-width': 2.5 }) +
        p(M(cx - g.rx + 8, topo + 10) + L(cx + g.rx - 8, topo + 10) + L(cx + g.rx - 7, topo + 22) + L(cx - g.rx + 7, topo + 22) + 'Z', { fill: '#3a1450' }) +
        circ(cx + g.rx - 22, topo + 16, 6, { fill: '#ffd23f' });
    } else if (k === 'coroa') {
      var y0 = topo + 18;
      s += p(M(cx - 44, y0) + L(cx - 50, y0 - 44) + L(cx - 26, y0 - 22) + L(cx, y0 - 52) + L(cx + 26, y0 - 22) + L(cx + 50, y0 - 44) + L(cx + 44, y0) + 'Z', { fill: 'url(#' + I + 'ou)', stroke: '#a8700f', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }) +
        circ(cx, y0 - 14, 6, { fill: '#ff3f6a', stroke: '#9e0f22' }) + circ(cx - 26, y0 - 10, 4.5, { fill: '#3aa6ff', stroke: '#1b4fd1' }) + circ(cx + 26, y0 - 10, 4.5, { fill: '#4fd667', stroke: '#1f8a3a' }) +
        circ(cx - 50, y0 - 46, 4, { fill: '#fff2a6' }) + circ(cx, y0 - 54, 4, { fill: '#fff2a6' }) + circ(cx + 50, y0 - 46, 4, { fill: '#fff2a6' });
    } else if (k === 'laco') {
      var x = cx + g.rx * 0.55, y = topo + 18, o = { fill: cor, stroke: esc(cor, 0.4), 'stroke-width': 2.5, 'stroke-linejoin': 'round' };
      s += p(M(x, y) + C(x - 34, y - 30, x - 38, y + 22, x, y) + 'Z', o) + p(M(x, y) + C(x + 34, y - 30, x + 38, y + 22, x, y) + 'Z', o) + circ(x, y, 7, { fill: esc(cor, 0.15), stroke: esc(cor, 0.4), 'stroke-width': 2 });
    } else if (k === 'tiara') {
      s += p(M(cx - g.rx - 2, topo + 40) + C(cx - g.rx + 4, topo - 6, cx + g.rx - 4, topo - 6, cx + g.rx + 2, topo + 40), { fill: 'none', stroke: cor, 'stroke-width': 7, 'stroke-linecap': 'round' });
      [-30, -10, 10, 30].forEach(function (dx, i) { s += p(estrela(cx + dx, topo + 6 + Math.abs(dx) * 0.25, i % 2 ? 6 : 8, 3), { fill: '#fff6a8', stroke: '#d9a62a', 'stroke-width': 1.2 }); });
    }
    return s;
  }

  function rugas(c, g, cores) {
    if (!g.idoso) return '';
    return p(M(g.cx - 18, g.cy - g.ry * 0.62) + Q(g.cx, g.cy - g.ry * 0.68, g.cx + 18, g.cy - g.ry * 0.62), { fill: 'none', stroke: esc(cores.pele, 0.3), 'stroke-width': 1.6, opacity: 0.6 }) +
      dois(M(g.cx - 30, g.cy + 36) + Q(g.cx - 34, g.cy + 46, g.cx - 28, g.cy + 54), { fill: 'none', stroke: esc(cores.pele, 0.3), 'stroke-width': 1.8, opacity: 0.6 });
  }

  // ---------- o desenho inteiro ----------
  // ---------- corpo inteiro (dono, 14/Nov/2026): da cintura para baixo, braços, sapatos, mochila e o que segura ----------
  var CALCA = '#3b5b9a';
  function corpoInteiro(c, g, I, cores) {
    var pele = cores.pele, pe = { fill: pele, stroke: esc(pele, 0.35), 'stroke-width': 2.5, 'stroke-linejoin': 'round' };
    var roupaCor = cores.roupa, roupaT = esc(roupaCor, 0.4), baixoCor = c.baixo === 'calca' ? CALCA : c.baixo === 'vestido' ? roupaCor : ENFEITE[c.roupaCor];
    var crianca = g.crianca, s = '';
    var pernaE = 'M106,500 L136,500 L134,566 L108,566Z', pernaD = espelhar(pernaE);
    // mochila atrás do corpo
    if (c.mochila) s += '<rect x="66" y="300" width="168" height="130" rx="26" fill="' + ENFEITE[c.roupaCor] + '" stroke="' + esc(ENFEITE[c.roupaCor], 0.4) + '" stroke-width="3"/>';
    // pernas de pele (aparecem com short, saia e vestido; descalço mostra os pés)
    if (c.baixo !== 'calca') s += p(pernaE, pe) + p(pernaD, pe);
    // parte de baixo
    if (c.baixo === 'calca') {
      var cal = { fill: baixoCor, stroke: esc(baixoCor, 0.4), 'stroke-width': 2.5, 'stroke-linejoin': 'round' };
      s += p('M86,424 L148,424 L144,566 L98,566Z', cal) + p(espelhar('M86,424 L148,424 L144,566 L98,566Z'), cal) +
        p('M150,430 L150,470', { stroke: esc(baixoCor, 0.5), 'stroke-width': 2 }) + p('M100,446 Q118,452 134,446', { fill: 'none', stroke: cla(baixoCor, 0.3), 'stroke-width': 2, 'stroke-dasharray': '4 3' });
    } else if (c.baixo === 'short') {
      var sh = { fill: baixoCor, stroke: esc(baixoCor, 0.4), 'stroke-width': 2.5, 'stroke-linejoin': 'round' };
      s += p('M84,424 L150,424 L146,500 L96,500Z', sh) + p(espelhar('M84,424 L150,424 L146,500 L96,500Z'), sh);
    } else if (c.baixo === 'saia') {
      s += p('M84,424 L216,424 L242,508 L58,508Z', { fill: baixoCor, stroke: esc(baixoCor, 0.4), 'stroke-width': 2.5, 'stroke-linejoin': 'round' }) +
        p('M110,430 L98,506 M150,430 L150,506 M190,430 L202,506', { stroke: esc(baixoCor, 0.25), 'stroke-width': 2, opacity: 0.6 });
    } else {
      s += p('M82,410 L218,410 L246,520 L54,520Z', { fill: 'url(#' + I + 'ro)', stroke: roupaT, 'stroke-width': 3, 'stroke-linejoin': 'round' }) + (c.estampa !== 'lisa' ? p('M82,410 L218,410 L246,520 L54,520Z', { fill: 'url(#' + I + 'es)' }) : '');
    }
    // tronco (camiseta) com a cor e a estampa da carta
    var tronco = 'M102,284 L198,284 C228,290 238,312 234,344 L222,432 L78,432 L66,344 C62,312 72,290 102,284Z';
    s += p(tronco, { fill: 'url(#' + I + 'ro)', stroke: roupaT, 'stroke-width': 3, 'stroke-linejoin': 'round' });
    if (c.estampa !== 'lisa') s += p(tronco, { fill: 'url(#' + I + 'es)' });
    s += p('M124,286 Q150,306 176,286', { fill: 'none', stroke: roupaT, 'stroke-width': 5, 'stroke-linecap': 'round' });
    if (c.baixo !== 'vestido') s += p('M78,428 L222,428', { stroke: esc(c.baixo === 'calca' ? CALCA : baixoCor, 0.35), 'stroke-width': 6 });
    // alças da mochila
    if (c.mochila) s += p('M112,288 L104,424 M188,288 L196,424', { stroke: esc(ENFEITE[c.roupaCor], 0.25), 'stroke-width': 9, 'stroke-linecap': 'round' });
    // braços: manga da camiseta e o resto de pele; mãos
    var braco = 'M74,300 C58,336 52,388 56,436';
    s += p(braco, { fill: 'none', stroke: esc(pele, 0.35), 'stroke-width': 26, 'stroke-linecap': 'round' }) + p(braco, { fill: 'none', stroke: pele, 'stroke-width': 21, 'stroke-linecap': 'round' }) +
      p(espelhar(braco), { fill: 'none', stroke: esc(pele, 0.35), 'stroke-width': 26, 'stroke-linecap': 'round' }) + p(espelhar(braco), { fill: 'none', stroke: pele, 'stroke-width': 21, 'stroke-linecap': 'round' });
    var manga = 'M76,298 C66,318 62,336 61,352';
    s += p(manga, { fill: 'none', stroke: roupaT, 'stroke-width': 31, 'stroke-linecap': 'round' }) + p(manga, { fill: 'none', stroke: roupaCor, 'stroke-width': 26, 'stroke-linecap': 'round' }) +
      p(espelhar(manga), { fill: 'none', stroke: roupaT, 'stroke-width': 31, 'stroke-linecap': 'round' }) + p(espelhar(manga), { fill: 'none', stroke: roupaCor, 'stroke-width': 26, 'stroke-linecap': 'round' });
    s += circ(56, 442, 13, pe) + circ(244, 442, 13, pe);
    // pés e calçados
    [[121, 1], [179, -1]].forEach(function (q) {
      var x = q[0], ld = q[1];
      if (c.calcado === 'descalco') s += p('M' + (x - 16) + ',566 Q' + (x - 18) + ',584 ' + x + ',584 Q' + (x + 18) + ',584 ' + (x + 16) + ',566Z', pe) + circ(x - 8 * ld, 580, 2, { fill: esc(pele, 0.3) }) + circ(x - 2 * ld, 582, 2, { fill: esc(pele, 0.3) });
      else if (c.calcado === 'tenis') s += p('M' + (x - 18) + ',560 L' + (x + 14) + ',560 Q' + (x + 26) + ',566 ' + (x + 24 * 1) + ',580 L' + (x - 20) + ',580Z', { fill: '#ffffff', stroke: '#3a1450', 'stroke-width': 3, 'stroke-linejoin': 'round' }) +
        p('M' + (x - 20) + ',580 L' + (x + 24) + ',580', { stroke: ENFEITE[c.roupaCor], 'stroke-width': 5 }) + p('M' + (x - 8) + ',564 L' + (x + 6) + ',568', { stroke: ENFEITE[c.roupaCor], 'stroke-width': 3 });
      else if (c.calcado === 'bota') s += p('M' + (x - 17) + ',522 L' + (x + 15) + ',522 L' + (x + 16) + ',566 Q' + (x + 30) + ',570 ' + (x + 28) + ',584 L' + (x - 19) + ',584Z', { fill: '#7a4a2a', stroke: '#3a1450', 'stroke-width': 3, 'stroke-linejoin': 'round' }) +
        p('M' + (x - 17) + ',530 L' + (x + 15) + ',530', { stroke: '#a8724a', 'stroke-width': 4 });
      else s += p('M' + (x - 16) + ',564 L' + (x + 14) + ',564 Q' + (x + 24) + ',570 ' + (x + 22) + ',580 L' + (x - 18) + ',580Z', { fill: '#2c2233', stroke: '#3a1450', 'stroke-width': 3, 'stroke-linejoin': 'round' }) + elip(x, 567, 8, 2, { fill: '#fff', opacity: 0.3 });
    });
    // o que segura na mão direita (lado direito da carta)
    var hx = 244, hy = 442;
    if (c.segura === 'balao') s += p('M' + hx + ',' + (hy - 10) + ' Q' + (hx + 14) + ',' + (hy - 70) + ' ' + (hx + 8) + ',' + (hy - 120), { fill: 'none', stroke: '#3a1450', 'stroke-width': 2 }) +
      elip(hx + 8, hy - 150, 24, 30, { fill: '#ff3f6a', stroke: '#9e0f22', 'stroke-width': 3 }) + elip(hx, hy - 160, 6, 9, { fill: '#fff', opacity: 0.6 });
    else if (c.segura === 'bola') s += circ(hx + 6, hy + 20, 20, { fill: '#fff', stroke: '#3a1450', 'stroke-width': 3 }) + p(estrelaP(hx + 6, hy + 20, 7), { fill: '#3a1450' });
    else if (c.segura === 'sorvete') s += p('M' + (hx - 12) + ',' + (hy - 14) + ' L' + (hx + 12) + ',' + (hy - 14) + ' L' + hx + ',' + (hy + 18) + 'Z', { fill: '#e8b16a', stroke: '#a8724a', 'stroke-width': 2.5 }) +
      circ(hx, hy - 24, 15, { fill: '#ff9fc8', stroke: '#c84f86', 'stroke-width': 2.5 }) + circ(hx - 4, hy - 30, 3, { fill: '#fff', opacity: 0.7 });
    else if (c.segura === 'livro') s += '<rect x="' + (hx - 18) + '" y="' + (hy - 34) + '" width="36" height="44" rx="4" fill="#2fa86a" stroke="#1f6e46" stroke-width="3"/>' + p('M' + (hx - 10) + ',' + (hy - 24) + ' L' + (hx + 10) + ',' + (hy - 24), { stroke: '#fff', 'stroke-width': 2.5 });
    else if (c.segura === 'flor') s += p('M' + hx + ',' + (hy - 6) + ' L' + hx + ',' + (hy - 56), { stroke: '#2fa86a', 'stroke-width': 4 }) + flor5(hx, hy - 64, 9, '#ffd23f', '#ff5fa8');
    void crianca;
    return s;
  }
  function estrelaP(x, y, r) { var d = ''; for (var i = 0; i < 5; i++) { var a = -Math.PI / 2 + i * 2 * Math.PI / 5; d += (i ? 'L' : 'M') + n(x + Math.cos(a) * r) + ',' + n(y + Math.sin(a) * r); } return d + 'Z'; }
  function flor5(x, y, r, miolo, petala) { var s = ''; for (var i = 0; i < 5; i++) { var a = i * 2 * Math.PI / 5; s += circ(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.8, { fill: petala, stroke: esc(petala, 0.35), 'stroke-width': 1.5 }); } return s + circ(x, y, r * 0.6, { fill: miolo }); }

  function svg(c, op) {
    op = op || {};
    var I = op.id || 'qc', g = geometria(c), grande = !!op.grande;
    var cores = { pele: PALETAS.pele[c.pele] || PALETAS.pele.p2, cabelo: corCabelo(c), roupa: PALETAS.roupa[c.roupaCor] || '#3a7be0' };
    var corpo = !!op.corpo && !!c.baixo, alto = corpo ? 620 : H;
    var tam = op.largura ? ' width="' + op.largura + '" height="' + (op.altura || Math.round(op.largura * alto / W)) + '"' : '';
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + alto + '"' + tam + ' role="img">' + defs(c, g, I, cores) +
      '<rect width="300" height="' + alto + '" fill="url(#' + I + 'fu)"/>' +
      circ(40, 46, 10, { fill: '#fff', opacity: 0.35 }) + circ(262, 70, 6, { fill: '#fff', opacity: 0.35 }) + circ(250, 30, 3.5, { fill: '#fff', opacity: 0.5 });
    var pelos = pelosRosto(c, g, cores);
    s += cabeloTras(c, g, I, cores) + (corpo ? corpoInteiro(c, g, I, cores) + pescoco(g, cores) : roupa(c, g, I, cores, grande)) + colar(c, g) + orelhas(c, g, cores) +
      p(rosto(g), { fill: 'url(#' + I + 'pe)', stroke: esc(cores.pele, 0.38), 'stroke-width': 2.5 }) +
      bochechas(c, g) + rugas(c, g, cores) + olhos(c, g, grande) + sobrancelhas(c, g, cores) + pelos.barba + boca(c, g) + pelos.bigode + nariz(c, g, I, cores) +
      cabeloFrente(c, g, I, cores, grande) + oculos(c, g, I) + naCabeca(c, g, I);
    return s + '</svg>';
  }

  var Q_ = { svg: svg, PALETAS: PALETAS };
  raiz.QECaras = Q_;
  if (typeof module === 'object' && module.exports) module.exports = Q_;
})(typeof window !== 'undefined' ? window : globalThis);
