/* Mão na Massa — a vila "3D" vista de cima (v0.7.0, pedido do dono de 14/Nov/2026, parte 2).
   Cada lugar é um bloquinho de terra com grama em cima (isométrico, como as referências que o dono mandou), com a sua
   construção: rio com peixe pulando e trapiche, pomar cercado com árvores redondas, horta cercada com fileiras,
   galinheiro de madeira com rampa e ninho, celeiro vermelho com cata-vento girando e a vaca, mercadinho com toldo
   listrado e uma cesta gigante no telhado, a casinha da Dona Cida e a nossa casa com fumacinha na chaminé.
   Também desenha o cozinheirinho que anda pela vila, o carrinho e as nuvens. Tudo em SVG feito no código (nenhuma
   imagem de fora). Só desenha: quem anda, para onde e quando, é o app.js.
   Coordenadas: o bloco ocupa o viewBox 0 0 200 175; P(u, v, z) leva um ponto do chão do bloco (u, v de 0 a 1) e a
   altura z (px) para a tela. A face da esquerda (v = 1) é a mais clara, a da direita (u = 1) a mais escura. */
(function (raiz) {
  'use strict';
  function q(n) { return Math.round(n * 10) / 10; }
  function P(u, v, z) { return [q(100 + (u - v) * 90), q(60 + (u + v) * 45 - (z || 0))]; }
  function pts(l) { return l.map(function (p) { return p.join(','); }).join(' '); }
  function poli(l, cor, extra) { return '<polygon points="' + pts(l) + '" fill="' + cor + '"' + (extra || '') + '/>'; }
  function tom(hex, f) {   // f > 0 clareia, f < 0 escurece
    var n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(function (x) { return Math.round(f > 0 ? x + (255 - x) * f : x * (1 + f)); });
    return '#' + c.map(function (x) { return (x < 16 ? '0' : '') + x.toString(16); }).join('');
  }
  var CONT = ' stroke="rgba(60,30,10,.35)" stroke-width="1" stroke-linejoin="round"';

  // caixa (prédio) de (u0,v0) a (u1,v1), do chão z0 até z0+h: só as 3 faces que aparecem
  function caixa(u0, v0, u1, v1, h, cor, z0) {
    z0 = z0 || 0; var z1 = z0 + h;
    return poli([P(u0, v1, z0), P(u1, v1, z0), P(u1, v1, z1), P(u0, v1, z1)], tom(cor, 0.08), CONT) +
      poli([P(u1, v0, z0), P(u1, v1, z0), P(u1, v1, z1), P(u1, v0, z1)], tom(cor, -0.18), CONT) +
      poli([P(u0, v0, z1), P(u1, v0, z1), P(u1, v1, z1), P(u0, v1, z1)], tom(cor, 0.25), CONT);
  }
  // telhado de duas águas com a cumeeira ao longo de u
  function telhado(u0, v0, u1, v1, z, alto, cor, beiral) {
    var b = beiral || 0.04, vm = (v0 + v1) / 2; u0 -= b; u1 += b; v0 -= b; v1 += b;
    return poli([P(u0, v0, z), P(u1, v0, z), P(u1, vm, z + alto), P(u0, vm, z + alto)], tom(cor, 0.12), CONT) +
      poli([P(u1, v0 + b, z), P(u1, v1 - b, z), P(u1, vm, z + alto)], tom(cor, -0.35), CONT) +
      poli([P(u0, v1, z), P(u1, v1, z), P(u1, vm, z + alto), P(u0, vm, z + alto)], cor, CONT);
  }
  // retângulo pintado numa face: E = face da esquerda (v fixo, anda em u); D = face da direita (u fixo, anda em v)
  function naE(v, ua, ub, za, zb, cor, extra) { return poli([P(ua, v, za), P(ub, v, za), P(ub, v, zb), P(ua, v, zb)], cor, extra); }
  function naD(u, va, vb, za, zb, cor, extra) { return poli([P(u, va, za), P(u, vb, za), P(u, vb, zb), P(u, va, zb)], cor, extra); }
  function janelaE(v, ua, ub, za, zb) { return naE(v, ua, ub, za, zb, '#bfe9ff', ' stroke="#fff" stroke-width="1.6"') + naE(v, (ua + ub) / 2 - 0.004, (ua + ub) / 2 + 0.004, za, zb, '#fff'); }
  function janelaD(u, va, vb, za, zb) { return naD(u, va, vb, za, zb, '#bfe9ff', ' stroke="#fff" stroke-width="1.6"'); }
  // bola "de massinha" (copa de árvore, fruta, alface): gradiente com brilho
  var gid = 0;
  function bola(x, y, r, cor, cls) {
    var id = 'vb' + (++gid);
    return '<radialGradient id="' + id + '" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="' + tom(cor, 0.45) + '"/><stop offset=".55" stop-color="' + cor + '"/><stop offset="1" stop-color="' + tom(cor, -0.3) + '"/></radialGradient>' +
      '<circle' + (cls ? ' class="' + cls + '"' : '') + ' cx="' + q(x) + '" cy="' + q(y) + '" r="' + r + '" fill="url(#' + id + ')"/>';
  }
  function sombra(u, v, r) { var p = P(u, v, 0); return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="' + r + '" ry="' + q(r / 2) + '" fill="rgba(40,70,20,.28)"/>'; }
  function arvore(u, v, cor, frutas, alto) {
    var a = alto || 36, p = P(u, v, 0), t = P(u, v, a), s = sombra(u, v, 16);
    var h = s + '<path d="M' + (p[0] - 3) + ' ' + p[1] + ' L' + (p[0] - 2) + ' ' + (t[1] + 6) + ' L' + (p[0] + 2) + ' ' + (t[1] + 6) + ' L' + (p[0] + 3) + ' ' + p[1] + 'Z" fill="#8a5a2b"/>' +
      '<g class="v-copa">' + bola(t[0], t[1], 19, cor);
    (frutas || []).forEach(function (f) { h += bola(t[0] + f[0], t[1] + f[1], 3.6, f[2]); });
    return h + '</g>';
  }
  function cerca(lados) {   // cerquinha de madeira nas bordas (lados: 'e' esquerda-frente, 'd' direita-frente, 't' fundo)
    var h = '', cor = '#c98a4b';
    function linha(a, b, n) {
      for (var i = 0; i <= n; i++) { var u = a[0] + (b[0] - a[0]) * i / n, v = a[1] + (b[1] - a[1]) * i / n, p = P(u, v, 0), t = P(u, v, 10); h += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + t[0] + '" y2="' + t[1] + '" stroke="' + cor + '" stroke-width="2.6" stroke-linecap="round"/>'; }
      [5, 9].forEach(function (z) { var p1 = P(a[0], a[1], z), p2 = P(b[0], b[1], z); h += '<line x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '" stroke="' + tom(cor, -0.15) + '" stroke-width="1.8"/>'; });
    }
    if (lados.indexOf('t') >= 0) { linha([0.06, 0.06], [0.94, 0.06], 7); linha([0.06, 0.06], [0.06, 0.94], 7); }
    if (lados.indexOf('e') >= 0) linha([0.06, 0.94], [0.94, 0.94], 7);
    if (lados.indexOf('d') >= 0) linha([0.94, 0.06], [0.94, 0.94], 7);
    return h;
  }

  // o bloquinho: terra dos lados, grama em cima com a beirada mais clara
  function base(topo) {
    var g = topo || '#86cf5c';
    return '<ellipse cx="100" cy="170" rx="86" ry="10" fill="rgba(80,50,20,.18)"/>' +
      poli([P(0, 1, 0), P(1, 1, 0), P(1, 1, -16), P(0, 1, -16)], '#b9824e') + poli([P(1, 0, 0), P(1, 1, 0), P(1, 1, -16), P(1, 0, -16)], '#94603a') +
      poli([P(0, 1, -5), P(1, 1, -5), P(1, 1, 0), P(0, 1, 0)], '#6fbe48') + poli([P(1, 0, -5), P(1, 1, -5), P(1, 1, 0), P(1, 0, 0)], '#5aa63a') +
      poli([P(0, 0), P(1, 0), P(1, 1), P(0, 1)], g) + poli([P(0.04, 0.04), P(0.96, 0.04), P(0.96, 0.96), P(0.04, 0.96)], tom(g, 0.1));
  }

  var B = {};
  B.rio = function () {
    var h = base();
    h += poli([P(0.1, 0.12), P(0.92, 0.1), P(0.9, 0.9), P(0.12, 0.9)], '#3aa0e8') + poli([P(0.15, 0.17), P(0.87, 0.15), P(0.85, 0.85), P(0.17, 0.85)], '#5cc0f5');
    h += '<g class="v-ondas" fill="none" stroke="#e8f8ff" stroke-width="2" stroke-linecap="round">';
    [[0.35, 0.35], [0.6, 0.5], [0.4, 0.68]].forEach(function (o, i) { var p = P(o[0], o[1]); h += '<path class="v-onda v-o' + i + '" d="M' + (p[0] - 12) + ' ' + p[1] + ' q6 -4 12 0 t12 0"/>'; });
    h += '</g>';
    // peixe que pula em arco (anima no CSS)
    var pf = P(0.62, 0.32);
    h += '<g class="v-peixe-pula" style="transform-origin:' + pf[0] + 'px ' + pf[1] + 'px"><path d="M' + pf[0] + ' ' + pf[1] + ' c6 -6 16 -6 20 0 c-4 6 -14 6 -20 0z" fill="#ff9f43" stroke="#c96a1d" stroke-width="1"/><path d="M' + (pf[0] + 19) + ' ' + pf[1] + ' l7 -5 v10z" fill="#ff9f43"/><circle cx="' + (pf[0] + 5) + '" cy="' + (pf[1] - 1) + '" r="1.3" fill="#333"/></g>';
    // vitória-régia e juncos
    var pv = P(0.3, 0.55); h += '<ellipse cx="' + pv[0] + '" cy="' + pv[1] + '" rx="9" ry="4.5" fill="#4caf50"/><circle cx="' + (pv[0] + 2) + '" cy="' + (pv[1] - 2) + '" r="2.5" fill="#ff8fb1"/>';
    [[0.08, 0.45], [0.1, 0.5], [0.92, 0.6]].forEach(function (o) { var p = P(o[0], o[1]); h += '<path d="M' + p[0] + ' ' + p[1] + ' v-14 M' + (p[0] + 3) + ' ' + p[1] + ' v-10" stroke="#3f8f2e" stroke-width="2" stroke-linecap="round"/><ellipse cx="' + p[0] + '" cy="' + (p[1] - 15) + '" rx="2" ry="4" fill="#8a5a2b"/>'; });
    // trapiche de madeira com a vara de pescar
    h += caixa(0.62, 0.78, 0.98, 0.96, 3, '#c98a4b', 2);
    var pv2 = P(0.72, 0.84, 5); h += '<path d="M' + pv2[0] + ' ' + pv2[1] + ' L' + (pv2[0] - 26) + ' ' + (pv2[1] - 30) + '" stroke="#8a5a2b" stroke-width="2.4" stroke-linecap="round"/><path d="M' + (pv2[0] - 26) + ' ' + (pv2[1] - 30) + ' Q' + (pv2[0] - 34) + ' ' + (pv2[1] - 10) + ' ' + (pv2[0] - 30) + ' ' + (pv2[1] + 2) + '" fill="none" stroke="#fff" stroke-width="1"/><circle cx="' + (pv2[0] - 30) + '" cy="' + (pv2[1] + 2) + '" r="2.4" fill="#e84a3c"/>';
    return h;
  };
  B.pomar = function () {
    var h = base() + cerca('t');
    h += arvore(0.3, 0.3, '#5cbf4a', [[-8, -4, '#ff8c1a'], [6, -9, '#ff8c1a'], [9, 4, '#ff8c1a'], [-4, 8, '#ff8c1a']], 40);
    h += arvore(0.72, 0.36, '#4fae45', [[-9, 0, '#e8342e'], [4, -10, '#e8342e'], [8, 6, '#e8342e']], 36);
    h += arvore(0.4, 0.72, '#66c653', [[-6, -8, '#ffd23f'], [7, -3, '#ffd23f'], [-2, 7, '#ffd23f']], 34);
    var pc = P(0.78, 0.8, 0);   // cesta cheia de laranjas
    h += '<path d="M' + (pc[0] - 10) + ' ' + (pc[1] - 8) + ' h20 l-3 10 h-14z" fill="#c98a4b" stroke="#8a5a2b" stroke-width="1.2"/>' + bola(pc[0] - 4, pc[1] - 9, 3.5, '#ff8c1a') + bola(pc[0] + 3, pc[1] - 10, 3.5, '#ff8c1a');
    return h + cerca('ed');
  };
  B.horta = function () {
    var h = base() + cerca('t');
    [0.25, 0.5, 0.75].forEach(function (v, i) {
      h += caixa(0.14, v - 0.08, 0.86, v + 0.08, 4, '#8b5a33');
      for (var k = 0; k < 4; k++) {
        var u = 0.22 + k * 0.19, p = P(u, v, 4);
        if (i === 0) h += '<path d="M' + p[0] + ' ' + p[1] + ' l-3 -9 M' + p[0] + ' ' + p[1] + ' l3 -10 M' + p[0] + ' ' + p[1] + ' l0 -11" stroke="#3f9a2e" stroke-width="2.2" stroke-linecap="round"/><path d="M' + (p[0] - 3) + ' ' + p[1] + ' l3 6 l3 -6z" fill="#ff8a1a"/>';
        else if (i === 1) h += bola(p[0], p[1] - 4, 6, '#7bc950');
        else h += '<path d="M' + p[0] + ' ' + p[1] + ' l-4 -8 M' + p[0] + ' ' + p[1] + ' l4 -8" stroke="#3f9a2e" stroke-width="2" stroke-linecap="round"/>' + bola(p[0], p[1], 4.2, '#8e2c6b');
      }
    });
    return h + cerca('ed');
  };
  B.galinheiro = function () {
    var h = base();
    // casinha de madeira em cima de pernas, com rampa e ninho com ovos no puxadinho
    [[0.3, 0.3], [0.68, 0.3], [0.3, 0.62], [0.68, 0.62]].forEach(function (o) { var a = P(o[0], o[1], 0), b = P(o[0], o[1], 12); h += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#a8692f" stroke-width="3"/>'; });
    h += caixa(0.28, 0.28, 0.7, 0.64, 30, '#e0a050', 12);
    h += naE(0.64, 0.38, 0.52, 14, 32, '#5b3415') + naE(0.64, 0.56, 0.66, 30, 38, '#bfe9ff');
    h += telhado(0.28, 0.28, 0.7, 0.64, 42, 18, '#8a7768');
    var r1 = P(0.45, 0.64, 13), r2 = P(0.45, 0.92, 0), r3 = P(0.37, 0.92, 0), r4 = P(0.37, 0.64, 13);
    h += poli([r4, r1, r2, r3], '#d99a4c', CONT);
    // puxadinho com o ninho e os ovos
    h += caixa(0.7, 0.36, 0.86, 0.6, 14, '#d48f45', 12) + '<ellipse cx="' + P(0.78, 0.6, 18)[0] + '" cy="' + P(0.78, 0.6, 18)[1] + '" rx="9" ry="4" fill="#e9c27a"/>' +
      '<ellipse cx="' + (P(0.78, 0.6, 18)[0] - 3) + '" cy="' + (P(0.78, 0.6, 18)[1] - 3) + '" rx="3" ry="4" fill="#fff4e0"/><ellipse cx="' + (P(0.78, 0.6, 18)[0] + 3) + '" cy="' + (P(0.78, 0.6, 18)[1] - 3) + '" rx="3" ry="4" fill="#f3d9b5"/>';
    // galinha bicando o chão
    var pg = P(0.2, 0.86, 0);
    h += '<g class="v-galinha" style="transform-origin:' + pg[0] + 'px ' + pg[1] + 'px"><ellipse cx="' + pg[0] + '" cy="' + (pg[1] - 7) + '" rx="8" ry="6" fill="#fff" stroke="#ddd"/><circle cx="' + (pg[0] + 7) + '" cy="' + (pg[1] - 13) + '" r="4" fill="#fff" stroke="#ddd"/><path d="M' + (pg[0] + 6) + ' ' + (pg[1] - 18) + ' l2 -3 l2 3z" fill="#e84a3c"/><path d="M' + (pg[0] + 11) + ' ' + (pg[1] - 13) + ' l3 1 l-3 1z" fill="#ffb21a"/><circle cx="' + (pg[0] + 8) + '" cy="' + (pg[1] - 14) + '" r=".9" fill="#333"/></g>';
    return h;
  };
  B.vaca = function () {
    var h = base();
    // celeiro vermelho com beiradas brancas e a porta com X
    h += caixa(0.18, 0.22, 0.66, 0.66, 34, '#d6403a');
    h += naE(0.66, 0.3, 0.52, 0, 24, '#a92f2a', ' stroke="#fff" stroke-width="2"') + '<path d="M' + P(0.3, 0.66, 0).join(' ') + ' L' + P(0.52, 0.66, 24).join(' ') + ' M' + P(0.52, 0.66, 0).join(' ') + ' L' + P(0.3, 0.66, 24).join(' ') + '" stroke="#fff" stroke-width="1.8"/>';
    h += janelaD(0.66, 0.32, 0.46, 16, 26) + naE(0.66, 0.56, 0.62, 18, 26, '#bfe9ff', ' stroke="#fff" stroke-width="1.4"');
    h += telhado(0.18, 0.22, 0.66, 0.66, 34, 22, '#6d6560');
    // cata-vento: torre de treliça e as pás girando
    var b1 = P(0.82, 0.3, 0), b2 = P(0.9, 0.38, 0), tp = P(0.86, 0.34, 66);
    h += '<path d="M' + b1.join(' ') + ' L' + tp.join(' ') + ' L' + b2.join(' ') + ' M' + q((b1[0] + tp[0]) / 2) + ' ' + q((b1[1] + tp[1]) / 2) + ' L' + q((b2[0] + tp[0]) / 2) + ' ' + q((b2[1] + tp[1]) / 2) + '" stroke="#eee" stroke-width="2" fill="none"/>';
    h += '<g class="v-pas" style="transform-origin:' + tp[0] + 'px ' + tp[1] + 'px">';
    for (var i = 0; i < 8; i++) h += '<path d="M' + tp[0] + ' ' + tp[1] + ' l' + q(16 * Math.cos(i * Math.PI / 4)) + ' ' + q(16 * Math.sin(i * Math.PI / 4)) + '" stroke="#f4f4f4" stroke-width="3.4" stroke-linecap="round"/>';
    h += '<circle cx="' + tp[0] + '" cy="' + tp[1] + '" r="2.5" fill="#999"/></g>';
    // a vaca Mimosa (com o rabo balançando) e o balde de leite
    var pv = P(0.42, 0.88, 0);
    h += '<g class="v-vaquinha"><ellipse cx="' + pv[0] + '" cy="' + (pv[1] - 9) + '" rx="13" ry="7" fill="#fff" stroke="#bbb"/><ellipse cx="' + (pv[0] - 4) + '" cy="' + (pv[1] - 11) + '" rx="4" ry="3" fill="#333"/><ellipse cx="' + (pv[0] + 6) + '" cy="' + (pv[1] - 7) + '" rx="3" ry="2.4" fill="#333"/>' +
      '<path d="M' + (pv[0] - 8) + ' ' + (pv[1] - 4) + ' v6 M' + (pv[0] + 8) + ' ' + (pv[1] - 4) + ' v6" stroke="#ccc" stroke-width="2.4"/><ellipse cx="' + (pv[0] + 15) + '" cy="' + (pv[1] - 13) + '" rx="5" ry="4.4" fill="#fff" stroke="#bbb"/><ellipse cx="' + (pv[0] + 18) + '" cy="' + (pv[1] - 11) + '" rx="2.6" ry="2" fill="#ffb3c1"/>' +
      '<path class="v-rabo" style="transform-origin:' + (pv[0] - 12) + 'px ' + (pv[1] - 11) + 'px" d="M' + (pv[0] - 12) + ' ' + (pv[1] - 11) + ' q-5 4 -4 10" stroke="#999" stroke-width="1.6" fill="none"/></g>';
    var pb = P(0.72, 0.9, 0); h += '<path d="M' + (pb[0] - 5) + ' ' + (pb[1] - 9) + ' h10 l-1.5 9 h-7z" fill="#cfd8e3" stroke="#7d8a99" stroke-width="1"/><ellipse cx="' + pb[0] + '" cy="' + (pb[1] - 9) + '" rx="5" ry="1.6" fill="#fff"/>';
    return h;
  };
  B.mercado = function () {
    var h = base('#9fd38a');
    h += poli([P(0.1, 0.72), P(0.9, 0.72), P(0.9, 0.95), P(0.1, 0.95)], '#e9e2d0');   // calçada
    h += caixa(0.18, 0.18, 0.82, 0.7, 40, '#ffd76a');
    h += naE(0.7, 0.36, 0.56, 0, 22, '#6cc3e8', ' stroke="#fff" stroke-width="2"') + janelaE(0.7, 0.22, 0.32, 8, 22) + janelaE(0.7, 0.6, 0.76, 8, 22) + janelaD(0.82, 0.3, 0.6, 8, 24);
    // toldo listrado (verde-água e branco) na frente
    for (var i = 0; i < 8; i++) { var a = 0.18 + i * 0.08, b = a + 0.08; h += poli([P(a, 0.7, 30), P(b, 0.7, 30), P(b, 0.8, 22), P(a, 0.8, 22)], i % 2 ? '#fff' : '#2bb6a8', CONT); }
    // placa "MERCADO" (em inglês, "MARKET") no alto da frente e a cesta gigante no telhado
    var pl = P(0.2, 0.7, 38);
    h += '<text x="0" y="0" transform="matrix(.894 .447 0 1 ' + pl[0] + ' ' + pl[1] + ')" font-family="Fredoka, system-ui, sans-serif" font-weight="700" font-size="9.5" fill="#b8541c">' + (raiz.BolinhoIdioma && raiz.BolinhoIdioma.atual() === 'en' ? 'MARKET' : 'MERCADO') + '</text>';
    var pc = P(0.5, 0.44, 40);
    h += '<path d="M' + (pc[0] - 18) + ' ' + (pc[1] - 16) + ' h36 l-5 18 h-26z" fill="#ffc93c" stroke="#d99a1a" stroke-width="1.5"/><path d="M' + (pc[0] - 12) + ' ' + (pc[1] - 13) + ' v12 M' + (pc[0] - 4) + ' ' + (pc[1] - 13) + ' v12 M' + (pc[0] + 4) + ' ' + (pc[1] - 13) + ' v12 M' + (pc[0] + 12) + ' ' + (pc[1] - 13) + ' v12" stroke="#d99a1a" stroke-width="1.5"/>' +
      '<path d="M' + (pc[0] - 13) + ' ' + (pc[1] - 16) + ' q13 -20 26 0" fill="none" stroke="#fff6e0" stroke-width="3.4" stroke-linecap="round"/>' + bola(pc[0] - 7, pc[1] - 18, 4, '#e8432f') + bola(pc[0] + 2, pc[1] - 19, 4, '#7bc950');
    return h;
  };
  B.vizinha = function () {
    var h = base();
    h += caixa(0.24, 0.24, 0.72, 0.66, 30, '#ffb6c9');
    h += naE(0.66, 0.32, 0.44, 0, 20, '#a35a3a', CONT) + '<circle cx="' + P(0.42, 0.66, 10)[0] + '" cy="' + P(0.42, 0.66, 10)[1] + '" r="1.2" fill="#ffd23f"/>';
    // janela com a Dona Cida espiando (cabelo branco em coque e óculos)
    h += naE(0.66, 0.5, 0.66, 10, 24, '#fff6e0', ' stroke="#fff" stroke-width="1.6"');
    var pj = P(0.58, 0.66, 15);
    h += '<g class="v-cida-janela"><circle cx="' + pj[0] + '" cy="' + (pj[1] + 1) + '" r="4.4" fill="#f6c9a3"/><circle cx="' + pj[0] + '" cy="' + (pj[1] - 5) + '" r="3" fill="#eee"/><path d="M' + (pj[0] - 4.4) + ' ' + (pj[1] - 1) + ' q4.4 -5 8.8 0" fill="#eee"/><path d="M' + (pj[0] - 3) + ' ' + (pj[1] + 0.6) + ' h6" stroke="#555" stroke-width=".8"/></g>';
    h += janelaD(0.72, 0.34, 0.52, 10, 22);
    h += telhado(0.24, 0.24, 0.72, 0.66, 30, 18, '#e8574a');
    [[0.2, 0.84, '#ff5e9c'], [0.82, 0.78, '#ffd23f'], [0.76, 0.9, '#8e6bff']].forEach(function (f) { var p = P(f[0], f[1], 0); h += '<path d="M' + (p[0] - 4) + ' ' + (p[1] - 6) + ' h8 l-1 6 h-6z" fill="#c96a3a"/>' + bola(p[0], p[1] - 9, 4.2, f[2]); });
    return h;
  };
  B.casa = function () {
    var h = base();
    h += caixa(0.22, 0.24, 0.76, 0.66, 32, '#9fd8ff');
    h += naE(0.66, 0.36, 0.5, 0, 22, '#e07b39', CONT) + janelaE(0.66, 0.56, 0.7, 10, 24) + janelaD(0.76, 0.32, 0.54, 10, 24);
    // chaminé com fumacinha
    h += caixa(0.6, 0.34, 0.68, 0.42, 26, '#b85a3a', 38);
    var pf = P(0.64, 0.38, 66);
    h += '<g class="v-fumaca" fill="#fff">' + [0, 1, 2].map(function (i) { return '<circle class="v-f' + i + '" cx="' + pf[0] + '" cy="' + pf[1] + '" r="' + (4 + i) + '" opacity=".8"/>'; }).join('') + '</g>';
    h += telhado(0.22, 0.24, 0.76, 0.66, 32, 20, '#ff8a3d');
    // varal de flores e a placa de boas-vindas
    var pp = P(0.2, 0.86, 0); h += '<path d="M' + pp[0] + ' ' + pp[1] + ' v-12" stroke="#8a5a2b" stroke-width="2"/><rect x="' + (pp[0] - 9) + '" y="' + (pp[1] - 20) + '" width="18" height="9" rx="2" fill="#fff6e0" stroke="#c98a4b"/><text x="' + pp[0] + '" y="' + (pp[1] - 13.5) + '" text-anchor="middle" font-size="6" font-family="Fredoka, system-ui, sans-serif" fill="#c0392b">♥</text>';
    return h;
  };

  // o bloco de um lugar (SVG inteiro)
  function bloco(id) {
    return '<svg class="bloco b-' + id + '" viewBox="0 -10 200 185" aria-hidden="true" focusable="false"><g>' + (B[id] ? B[id]() : base()) + '</g></svg>';
  }

  // o cozinheirinho (de frente, meio de lado): chapéu de cozinheiro, avental, cesta no braço; as pernas mexem no CSS (.anda)
  function boneco() {
    return '<svg class="boneco-svg" viewBox="0 0 40 56" aria-hidden="true" focusable="false">' +
      '<ellipse cx="20" cy="54" rx="11" ry="2.6" fill="rgba(0,0,0,.2)"/>' +
      '<g class="v-perna v-pe1"><rect x="14" y="40" width="5" height="12" rx="2.4" fill="#3a5a8c"/><ellipse cx="16.5" cy="52.5" rx="3.6" ry="2" fill="#5b3415"/></g>' +
      '<g class="v-perna v-pe2"><rect x="21" y="40" width="5" height="12" rx="2.4" fill="#3a5a8c"/><ellipse cx="23.5" cy="52.5" rx="3.6" ry="2" fill="#5b3415"/></g>' +
      '<g class="v-corpo"><path d="M10 42 q0 -14 10 -15 q10 1 10 15z" fill="#ff8a3d" stroke="#d76b1f" stroke-width="1"/><path d="M15 29 l5 9 l5 -9z" fill="#fff"/>' +
      '<g class="v-braco-cesta"><path d="M29 33 q5 4 4 9" stroke="#ff8a3d" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M28 41 h11 l-2 7 h-7z" fill="#c98a4b" stroke="#8a5a2b" stroke-width="1"/><path d="M29.5 41 q4 -6 8 0" fill="none" stroke="#8a5a2b" stroke-width="1.2"/></g>' +
      '<path d="M11 33 q-4 4 -3 8" stroke="#ff8a3d" stroke-width="4" stroke-linecap="round" fill="none"/>' +
      '<circle cx="20" cy="20" r="9" fill="#f6c9a3" stroke="#d9a07a" stroke-width="1"/><path d="M11.5 17 q2 -6 8.5 -6 q6.5 0 8.5 6 q-4 -3 -8.5 -2 q-4.5 -1 -8.5 2z" fill="#6b3e1f"/>' +
      '<circle cx="16.5" cy="20" r="1.2" fill="#3b2412"/><circle cx="23.5" cy="20" r="1.2" fill="#3b2412"/><path d="M17 24 q3 2.4 6 0" fill="none" stroke="#9b2c3c" stroke-width="1.2" stroke-linecap="round"/>' +
      '<ellipse cx="14.5" cy="23" rx="1.8" ry="1.1" fill="#ff8fa3" opacity=".6"/><ellipse cx="25.5" cy="23" rx="1.8" ry="1.1" fill="#ff8fa3" opacity=".6"/>' +
      '<g class="v-chapeu"><circle cx="15" cy="7" r="4.6" fill="#fff" stroke="#e1d4c4"/><circle cx="25" cy="7" r="4.6" fill="#fff" stroke="#e1d4c4"/><circle cx="20" cy="4.6" r="5.4" fill="#fff" stroke="#e1d4c4"/><rect x="13" y="7" width="14" height="5.4" rx="2" fill="#fff" stroke="#e1d4c4"/></g></g></svg>';
  }
  function carro(cor) {
    cor = cor || '#e84a3c';
    return '<svg class="carro-svg" viewBox="0 0 44 26" aria-hidden="true" focusable="false"><ellipse cx="22" cy="24" rx="19" ry="2.4" fill="rgba(0,0,0,.18)"/>' +
      '<path d="M4 18 v-6 q0 -3 3 -3 h6 l5 -6 h12 l6 6 h3 q3 0 3 3 v6z" fill="' + cor + '" stroke="' + tom(cor, -0.3) + '" stroke-width="1"/><path d="M19 5 h10 l4 4 h-16z" fill="#bfe9ff"/>' +
      '<circle cx="12" cy="19" r="4" fill="#333"/><circle cx="12" cy="19" r="1.6" fill="#ccc"/><circle cx="32" cy="19" r="4" fill="#333"/><circle cx="32" cy="19" r="1.6" fill="#ccc"/><rect x="39" y="11" width="2.4" height="2.4" rx="1" fill="#ffd23f"/></svg>';
  }
  function nuvem() { return '<svg class="nuvem-svg" viewBox="0 0 60 26" aria-hidden="true" focusable="false"><g fill="#fff" opacity=".92"><circle cx="16" cy="16" r="9"/><circle cx="28" cy="11" r="11"/><circle cx="42" cy="15" r="9"/><rect x="12" y="15" width="34" height="10" rx="5"/></g></svg>'; }

  var API = { bloco: bloco, boneco: boneco, carro: carro, nuvem: nuvem, LUGARES_DESENHADOS: Object.keys(B) };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else raiz.CozinhaVila = API;
})(typeof self !== 'undefined' ? self : this);
