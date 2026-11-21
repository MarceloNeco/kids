/* Purpurina — desenha a personagem (e o cenário) em SVG, a partir do estado (ver visual.js).
   Tudo desenhado em código: nenhuma imagem de fora. Uma função só: PurpurinaBoneca.svg(estado, opcoes).
     opcoes.id      prefixo dos ids internos (gradientes, padrões) — cada SVG na página precisa do seu
     opcoes.area    [x, y, largura, altura] para mostrar só um pedaço (miniaturas dos botões)
     opcoes.fundo   false = sem cenário (padrão: true);  opcoes.soFundo = só o cenário
     opcoes.anim    true = glitter piscando (na tela); false = parado (foto e miniaturas)
     opcoes.largura / opcoes.altura  tamanho em pixels (foto)
   Coordenadas da personagem: 400 de largura por 720 de altura; cabeça em (200, 205). */
(function (raiz) {
  'use strict';
  var P = raiz.PurpurinaPecas || (typeof require === 'function' ? require('./pecas.js') : null);
  var V = raiz.PurpurinaVisual || (typeof require === 'function' ? require('./visual.js') : null);
  var W = 400, H = 720;
  // a cabeça é desenhada em (200, 205) e depois aumentada um pouco (jeito fofo, pescoço curto)
  var CABECA = 'translate(0 14) translate(200 297) scale(1.12) translate(-200 -297)';
  /* Nova Era (dono, 19/Nov/2026, referência do Poki): o rosto acompanha a idade escolhida em Eu → Idade.
     cab: tamanho da cabeça (a criancinha tem a cabeça maior); olho: tamanho dos olhos; maxilar/queixo: o rosto vai
     ficando mais fino e mais comprido com a idade (queixo pequeno, nada de "queixudo"); boca: lábios mais cheios. */
  var IDADES = {
    pequena: { cab: 1.2, olho: 1.04, maxilar: 1.04, queixoY: -3, queixoL: 1.05, boca: [0.92, 0.95] },
    crianca: { cab: 1.12, olho: 1, maxilar: 0.97, queixoY: 0, queixoL: 0.95, boca: [1, 1] },
    adolescente: { cab: 1.06, largura: 0.93, olho: 0.95, maxilar: 0.95, queixoY: 0, queixoL: 0.95, boca: [1.02, 1.06] },
    adulta: { cab: 1.02, largura: 0.86, olho: 0.92, maxilar: 0.93, queixoY: 0, queixoL: 0.95, boca: [1.04, 1.1] }
  };
  var IDADE = IDADES.crianca;
  /* ---------- corpo com medidas reais (Nova Era, 19/Nov/2026) ----------
     O desenho do corpo continua o mesmo por baixo (roupas, sapatos, joias e poses servem em todas as idades), mas cada
     ponto passa por uma "deformação" que põe o corpo nas medidas de gente de verdade (dono, 19/Nov/2026: "tem que ser
     medidas reais"), em cabeças (alturas da cabeça) a partir do alto da cabeça:
       - altura total: 5 cabeças aos 5 anos, 6 aos 10, 7 aos 15 e 7,5 na adulta;
       - ombro: a ~1,3 cabeça do alto; quadril (o cós da calça, logo acima do gancho): perto da metade da altura;
       - pernas: do gancho ao chão, metade da altura (pés de 615 para baixo não esticam);
       - larguras em cabeças (larg = quanto a largura do desenho de baixo vira no ombro, na cintura, no quadril e nas
         pernas): adulta com ombros ~1,65, cintura ~1,05 e quadril ~1,45 cabeça; criança quase sem cintura; menino com
         quadril mais estreito que os ombros. A cabeça inteira vai junto, só reduzida. */
  /* (20/Nov/2026, dono: "grossura do corpo totalmente desproporcional… use a pesquisa do Poki"): cabeça grande como no
     estilo do Poki (mais perto de 5 cabeças), tronco mais estreito (ombro, busto, cintura e quadril), braços e pernas
     afinando nas juntas — o corpo deixa de ser largo perto de braços finos */
  var PROPORCAO = {
    // larg: ombro, busto, cintura, quadril, coxa, joelho, panturrilha, tornozelo (curvas femininas; menino em MENINO)
    // (20/Nov/2026, dono, com silhueta de referência medida; ombro feminino: um pouco mais estreito que o quadril): o busto do tamanho do ombro,
    // a cintura ~67% do quadril e tudo em curva contínua (gx) — antes o busto passava do ombro e a cintura fazia quina
    // (20/Nov/2026, dono: "a adulta ainda continua muito esticada… mais natural"): um pouco menos de cabeças e membros
    // mais cheios — 4,8 / 5,8 / 6,5 / 7 cabeças
    pequena: { cabecas: 4.5, topo: 150, ombro: 1.28, quadril: 2.25, larg: [0.87, 0.89, 0.92, 0.99, 0.98, 0.9, 0.94, 0.86] },
    crianca: { cabecas: 5.2, topo: 100, ombro: 1.32, quadril: 2.72, larg: [0.82, 0.84, 0.8, 0.95, 0.96, 0.88, 0.94, 0.84] },
    adolescente: { cabecas: 6.2, topo: 76, ombro: 1.31, quadril: 2.72, larg: [0.82, 0.82, 0.65, 1.0, 1.25, 1.0, 1.05, 0.9] },
    adulta: { cabecas: 6.8, topo: 64, ombro: 1.32, quadril: 2.8, larg: [0.84, 0.84, 0.65, 1.06, 1.3, 1.05, 1.1, 0.95] }
  };
  // menino: ombros mais largos que o quadril (forma de V), cintura pouco marcada, pernas retas
  var MENINO = { pequena: [0.92, 0.92, 0.92, 0.94, 0.94, 0.88, 0.9, 0.84], crianca: [0.88, 0.88, 0.84, 0.88, 0.9, 0.84, 0.88, 0.8],
    adolescente: [0.9, 0.9, 0.8, 0.86, 1.15, 0.98, 1.02, 0.88], adulta: [0.94, 0.94, 0.82, 0.88, 1.2, 1.02, 1.06, 0.92] };
  /* barras de ajuste (dono, 20/Nov/2026: "uma barra de rolar… mais claro, mais escuro, até mais intensidade da maquiagem"):
     <parte>Tom (-1 = bem mais claro … 1 = bem mais escuro) vale para toda cor; <parte>Forca (0,15 … 1) é a intensidade da
     maquiagem — a cor vai se misturando com a pele até quase sumir. */
  var MAQUIAGEM = ['blush', 'sombra', 'delineado', 'cilios', 'batom', 'glitter', 'unhas'];
  function corAjustada(e, catId) {
    var k = P.categoria(catId), c = P.cor(k.cores, e[k.opcoes ? catId + 'Cor' : catId]);
    var tom = +e[catId + 'Tom'] || 0, forca = e[catId + 'Forca'] == null ? 1 : +e[catId + 'Forca'], h = c.hex;
    if (!tom && forca >= 1) return c;
    if (tom > 0) h = esc(h, tom * 0.5); else if (tom < 0) h = cla(h, -tom * 0.55);
    if (forca < 1 && MAQUIAGEM.indexOf(catId) >= 0) h = mistura(corAjustada(e, 'pele').hex, h, forca);
    return Object.assign({}, c, { hex: h });
  }
  /* tipo de corpo (Eu → Corpo; dono, 20/Nov/2026: "mais gordinho, mais cheinho, mais magrinho, mais curvilíneo"): quanto
     cada largura muda (ombro, busto, cintura, quadril, coxa, joelho, panturrilha, tornozelo) e a grossura dos braços */
  var TIPOS = {
    magrinho: { l: [0.94, 0.92, 0.9, 0.9, 0.88, 0.92, 0.9, 0.95], b: 0.88 },
    medio: { l: [1, 1, 1, 1, 1, 1, 1, 1], b: 1 },
    cheinho: { l: [1.04, 1.08, 1.18, 1.1, 1.12, 1.06, 1.08, 1.04], b: 1.12 },
    gordinho: { l: [1.1, 1.15, 1.38, 1.22, 1.25, 1.12, 1.15, 1.08], b: 1.25 },
    curvilineo: { l: [1, 1.12, 0.92, 1.18, 1.12, 1, 1.04, 1], b: 1.02 },
    atletico: { l: [1.1, 1.02, 1, 1, 1.05, 1, 1.06, 1], b: 1.08 }
  };
  var DF = null;
  function deformacao(idade, menino, corpo) {
    var q = PROPORCAO[idade] || PROPORCAO.adulta, cab = IDADE.cab, L = q.larg.slice();
    if (menino) L = (MENINO[idade] || MENINO.adulta).slice();
    var tipo = TIPOS[corpo] || TIPOS.medio; L = L.map(function (v, i) { return v * tipo.l[i]; });
    var queixo = 311 + ((IDADE === IDADES.pequena ? 275 : IDADE === IDADES.crianca ? 278 : IDADE === IDADES.adolescente ? 282 : 285) - 297) * cab;
    var alto = queixo - (311 - 205 * cab), h = (664 - q.topo) / q.cabecas, s = h / alto;
    var yC = q.topo + h, yS = q.topo + q.ombro * h, yW = q.topo + q.quadril * h;
    // pontos de apoio: [y original, y novo]; abaixo do último a escala é 1
    var Y = [[queixo, yC], [340, yS], [455, yW], [615, 615]];
    function fy(y) {
      if (y <= Y[0][0]) return yC + (y - queixo) * s;
      for (var i = 1; i < Y.length; i++) if (y <= Y[i][0]) { var a = Y[i - 1], b = Y[i]; return a[1] + (y - a[0]) * (b[1] - a[1]) / (b[0] - a[0]); }
      return y;
    }
    // largura: a cabeça (e o que fica na altura dela, como a mão no cabelo) reduz junto; do ombro para baixo, normal
    var X = [[queixo, s], [342, L[0]], [378, L[1]], [425, L[2]], [466, L[3]], [515, L[4]], [552, L[5]], [588, L[6]], [626, L[7]], [646, 0.95]];
    /* entre um ponto e outro a largura muda em CURVA, não em linha reta (dono, 20/Nov/2026: "retângulo, triângulo de
       corte… não tem contorno natural"): com a reta, o contorno virava retas com quinas (um "V" na cintura); com a curva
       (suave nas pontas), busto, cintura e quadril ficam redondos, como uma silhueta de verdade */
    function gx(y) {
      if (y <= X[0][0]) return s;
      for (var i = 1; i < X.length; i++) if (y <= X[i][0]) {
        var a = X[i - 1], b = X[i], t = (y - a[0]) / (b[0] - a[0]);
        if (i > 1) t = t * t * (3 - 2 * t);   // do queixo ao ombro continua reto (pescoço)
        return a[1] + (b[1] - a[1]) * t;
      }
      return 0.95;
    }
    /* pernas (dono, 21/Nov/2026: "a grossura dos braços e das pernas tem que ser proporcional"): abaixo do gancho cada
       perna engrossa ou afina em volta do PRÓPRIO meio (x 174 / 226), e não em volta do meio do corpo — assim joelho,
       panturrilha e tornozelo ganham a grossura certa sem as pernas se abrirem em "O". No gancho (470) as duas contas
       dão o mesmo lugar, então não há emenda. L[4..7] = grossura da coxa, joelho, panturrilha e tornozelo. */
    var GG = gx(470), XP = [[470, GG], [515, L[4]], [552, L[5]], [588, L[6]], [626, L[7]], [646, L[7] * 1.1], [700, L[7] * 1.1]];
    function gp(y) {
      for (var i = 1; i < XP.length; i++) if (y <= XP[i][0]) { var a = XP[i - 1], b = XP[i], t = (y - a[0]) / (b[0] - a[0]); t = t * t * (3 - 2 * t); return a[1] + (b[1] - a[1]) * t; }
      return XP[XP.length - 1][1];
    }
    function fx(x, y) {
      if (y <= 470) return 200 + (x - 200) * gx(y);
      var lado = x < 200 ? -1 : 1, c0 = 200 + lado * 26;
      return 200 + lado * 26 * GG + (x - c0) * gp(y);
    }
    return { s: s, traco: 1, braco: tipo.b, queixo: queixo, yC: yC, fy: fy, gx: gx, fx: fx,
      cabeca: 'translate(200 ' + n(yC) + ') scale(' + n(s * 1000) / 1000 + ') translate(-200 ' + n(-queixo) + ')' };
  }
  // aplica a deformação em tudo o que é desenho do corpo (caminhos, círculos, elipses, retângulos e centros de giro)
  function deformar(str) {
    if (!DF || !str) return str;
    var D = DF, rigidas = [];
    // peça solta (saia, vestido): abaixo do quadril fica com a largura do quadril (cai do jeito que foi desenhada)
    str = str.replace(/<g data-solta="">([\s\S]*?)<\/g><!--\/solta-->/g, function (m, c) {
      var g = D.gx, gq = g(466);
      var D2 = Object.assign({}, D, { fx: function (x, y) { return 200 + (x - 200) * (y > 466 ? gq : g(y)); } });
      rigidas.push('<g>' + deformarResto(c, D2) + '</g>');
      return '\u0001' + (rigidas.length - 1) + '\u0001';
    });
    // a mão (com o anel e a pulseira) não estica junto com a perna: só vai para o lugar novo, do tamanho certo
    str = str.replace(/<g data-rigido="(-?[\d.]+),(-?[\d.]+)(?:,(-?[\d.]+),(-?[\d.]+))?">([\s\S]*?)<\/g><!--\/rigido-->/g, function (m, x, y, sx, sy, c) {
      var k = (D.fx(+x + 4, +y) - D.fx(+x - 4, +y)) / 8, X = D.fx(+x, +y), Y = D.fy(+y);
      // mão: fica na ponta do braço encurtado (do ombro sx,sy até ela)
      if (sx !== undefined) { var Sx = D.fx(+sx, +sy), Sy = D.fy(+sy); X = Sx + (X - Sx) * ENCURTA; Y = Sy + (Y - Sy) * ENCURTA; }
      c = c.replace(/<g data-osso="[^"]*">/g, '<g>').replace(/<!--\/osso-->/g, '');   // dentro da peça rígida o braço vai junto, sem osso
      rigidas.push('<g transform="translate(' + n(X) + ' ' + n(Y) + ') scale(' + n(k * 1000) / 1000 + ') translate(' + (-x) + ' ' + (-y) + ')">' + c + '</g>');
      return '\u0001' + (rigidas.length - 1) + '\u0001';
    });
    // braço (osso): só os dois pontas (ombro e pulso) vão para o lugar novo; o desenho entre elas gira e estica junto,
    // sem entortar com a curva da cintura
    str = str.replace(/<g data-osso="(-?[\d.]+),(-?[\d.]+),(-?[\d.]+),(-?[\d.]+)">([\s\S]*?)<\/g><!--\/osso-->/g, function (m, x1, y1, x2, y2, c) {
      var P = [+x1, +y1], Q = [+x2, +y2], P2 = [D.fx(P[0], P[1]), D.fy(P[1])], Q2 = [D.fx(Q[0], Q[1]), D.fy(Q[1])];
      var v = [Q[0] - P[0], Q[1] - P[1]], w = [Q2[0] - P2[0], Q2[1] - P2[1]], lv = Math.sqrt(v[0] * v[0] + v[1] * v[1]) || 1, lw = Math.sqrt(w[0] * w[0] + w[1] * w[1]);
      if (lv > 120) { w = [w[0] * ENCURTA, w[1] * ENCURTA]; lw *= ENCURTA; }   // braço inteiro: um pouco mais curto (dono, 20/Nov/2026)
      var av = Math.atan2(v[1], v[0]), aw = Math.atan2(w[1], w[0]), k = lw / lv, kl = 0.95 * (D.braco || 1);
      // matriz = gira para o eixo do osso, estica no comprimento (k) e mantém a grossura (kl), gira para a direção nova
      var ca = Math.cos(aw), sa = Math.sin(aw), cb = Math.cos(-av), sb = Math.sin(-av);
      var m11 = ca * k * cb - sa * kl * sb, m12 = ca * k * -sb - sa * kl * cb, m21 = sa * k * cb + ca * kl * sb, m22 = sa * k * -sb + ca * kl * cb;
      var e = P2[0] - (m11 * P[0] + m12 * P[1]), f = P2[1] - (m21 * P[0] + m22 * P[1]);
      rigidas.push('<g transform="matrix(' + [m11, m21, m12, m22, e, f].map(function (z) { return Math.round(z * 10000) / 10000; }).join(' ') + ')">' + c + '</g>');
      return '\u0001' + (rigidas.length - 1) + '\u0001';
    });
    return voltarRigidas(deformarResto(str, D), rigidas);
  }
  function voltarRigidas(str, rigidas) { return rigidas.length ? str.replace(/\u0001(\d+)\u0001/g, function (m, i) { return rigidas[+i]; }) : str; }
  var ENCURTA = 0.86;
  // transformações do esqueleto (as mesmas do animador.js): ombro gira e encolhe o braço de cima no eixo dele;
  // o cotovelo desfaz o encolhimento em volta dele mesmo e gira o antebraço
  function transformaOmbro(a, f, S) { return 'rotate(' + n(a) + ' ' + n(S[0]) + ' ' + n(S[1]) + ')' + (f < 0.999 ? ' translate(' + n(S[0]) + ' ' + n(S[1]) + ') scale(1 ' + n(f * 1000) / 1000 + ') translate(' + n(-S[0]) + ' ' + n(-S[1]) + ')' : ''); }
  function transformaCotovelo(b, f, E) { return (f < 0.999 ? 'translate(' + n(E[0]) + ' ' + n(E[1]) + ') scale(1 ' + n(1000 / f) / 1000 + ') translate(' + n(-E[0]) + ' ' + n(-E[1]) + ') ' : '') + 'rotate(' + n(b) + ' ' + n(E[0]) + ' ' + n(E[1]) + ')'; }   // quanto o braço inteiro encolhe depois de ir para o corpo novo
  function rigido(x, y, s, ombro) { return s ? '<g data-rigido="' + x + ',' + y + (ombro ? ',' + ombro[0] + ',' + ombro[1] : '') + '">' + s + '</g><!--/rigido-->' : ''; }
  function deformarResto(str, D) {
    function par(x, y) { return n(D.fx(+x, +y)) + ',' + n(D.fy(+y)); }
    // arco (A rx,ry giro grande lado x,y): os raios só encolhem como a peça naquele ponto; o ponto final vai para o lugar novo
    function arco(m2, rx, ry, g, f1, f2, x, y) {
      var kx = (D.fx(+x + 4, +y) - D.fx(+x - 4, +y)) / 8, ky = (D.fy(+y + 4) - D.fy(+y - 4)) / 8;
      return 'A' + n(+rx * kx) + ',' + n(+ry * ky) + ' ' + g + ' ' + f1 + ' ' + f2 + ' ' + par(x, y);
    }
    // caminho só com retas e curvas (M L Q C Z): vira uma linha de muitos pontos, cada um no lugar novo — assim a blusa
    // ganha cintura e quadril de verdade (antes só os cantos mudavam de lugar e o meio ficava reto)
    function curvar(d) {
      if (/[^MLQCZ\d\s.,\-eE]/.test(d)) return null;
      var tk = d.match(/[MLQCZ]|-?\d*\.?\d+(?:e-?\d+)?/g), i = 0, cmd = '', cur = [0, 0], ini = [0, 0], out = [];
      function num() { return +tk[i++]; }
      function pt(q) { return [num(), num()]; }
      function poe(x, y, novo) { out.push((novo ? 'M' : 'L') + par(x, y)); }
      function amostra(f, comp) { var k = Math.max(2, Math.min(24, Math.round(comp / 7))); for (var j = 1; j <= k; j++) { var q = f(j / k); poe(q[0], q[1]); } }
      function dist(a, b) { return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1])); }
      while (i < tk.length) {
        if (/[MLQCZ]/.test(tk[i])) cmd = tk[i++];
        // o "fechar" (Z) também é uma reta que passa pela deformação (senão o lado que fecha a peça saía reto e o
        // recorte comia o contorno — dono, 20/Nov/2026: "o contorno da roupa do lado esquerdo tem uma falha")
        if (cmd === 'Z') { var z0 = cur, z1 = ini; if (dist(z0, z1) > 0.5) amostra(function (t) { return [z0[0] + (z1[0] - z0[0]) * t, z0[1] + (z1[1] - z0[1]) * t]; }, dist(z0, z1)); out.push('Z'); cur = ini; continue; }
        if (cmd === 'M') { cur = ini = pt(); poe(cur[0], cur[1], true); cmd = 'L'; continue; }
        var a = cur;
        if (cmd === 'L') { var b = pt(); amostra(function (t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }, dist(a, b)); cur = b; }
        else if (cmd === 'Q') { var c1 = pt(), e = pt(); amostra(function (t) { var u = 1 - t; return [u * u * a[0] + 2 * u * t * c1[0] + t * t * e[0], u * u * a[1] + 2 * u * t * c1[1] + t * t * e[1]]; }, dist(a, c1) + dist(c1, e)); cur = e; }
        else if (cmd === 'C') { var p1 = pt(), p2 = pt(), e2 = pt(); amostra(function (t) { var u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * e2[0], u * u * u * a[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * e2[1]]; }, dist(a, p1) + dist(p1, p2) + dist(p2, e2)); cur = e2; }
        else return null;
      }
      return out.join(' ');
    }
    return str.replace(/(\sd=")([^"]*)"/g, function (m, a, d) {
      var c = curvar(d); if (c) return a + c + '"';
      return a + d.replace(/A(-?\d*\.?\d+),(-?\d*\.?\d+) (-?\d*\.?\d+) ([01]) ?([01]) (-?\d*\.?\d+),(-?\d*\.?\d+)|(-?\d*\.?\d+),(-?\d*\.?\d+)/g, function (m2, rx, ry, g, f1, f2, x, y, px, py) {
        return rx !== undefined ? arco(m2, rx, ry, g, f1, f2, x, y) : par(px, py);
      }) + '"';
    })
      .replace(/<(circle|ellipse)\s([^>]*)>/g, function (m, tag, atr) {
        var cx = +(atr.match(/cx="([^"]*)"/) || [])[1], cy = +(atr.match(/cy="([^"]*)"/) || [])[1];
        if (isNaN(cx) || isNaN(cy)) return m;
        var y0 = D.fy(cy), ky = Math.max(0.35, (D.fy(cy + 4) - D.fy(cy - 4)) / 8), kx = (D.fx(cx + 4, cy) - D.fx(cx - 4, cy)) / 8;
        atr = atr.replace(/cx="[^"]*"/, 'cx="' + n(D.fx(cx, cy)) + '"').replace(/cy="[^"]*"/, 'cy="' + n(y0) + '"');
        // círculos afinam como os traços (as juntas dos braços casam com eles)
        if (tag === 'circle') atr = atr.replace(/(\s|^)r="([^"]*)"/, function (m3, e0, r) { return e0 + 'r="' + n(+r * Math.min(kx, D.traco)) + '"'; });
        else atr = atr.replace(/rx="([^"]*)"/, function (m3, r) { return 'rx="' + n(+r * kx) + '"'; }).replace(/ry="([^"]*)"/, function (m3, r) { return 'ry="' + n(+r * ky) + '"'; });
        return '<' + tag + ' ' + atr + '>';
      })
      .replace(/<rect\s([^>]*)>/g, function (m, atr) {
        var g = function (k) { return +(atr.match(new RegExp('(?:^|\\s)' + k + '="([^"]*)"')) || [])[1]; };
        var x = g('x'), y = g('y'), w = g('width'), h = g('height');
        if ([x, y, w, h].some(isNaN)) return m;
        var y1 = D.fy(y), y2 = D.fy(y + h), x1 = D.fx(x, y + h / 2), x2 = D.fx(x + w, y + h / 2);
        return '<rect ' + atr.replace(/(^|\s)x="[^"]*"/, '$1x="' + n(x1) + '"').replace(/(^|\s)y="[^"]*"/, '$1y="' + n(y1) + '"').replace(/width="[^"]*"/, 'width="' + n(x2 - x1) + '"').replace(/height="[^"]*"/, 'height="' + n(y2 - y1) + '"') + '>';
      })
      .replace(/stroke-width="([\d.]+)"/g, function (m, w) { return 'stroke-width="' + n(+w * D.traco) + '"'; })
      .replace(/rotate\((-?[\d.]+) (-?[\d.]+) (-?[\d.]+)\)/g, function (m, a, x, y) { return 'rotate(' + a + ' ' + par(x, y).replace(',', ' ') + ')'; });
  }
  // ponto do corpo depois da deformação (para os centros das animações do desfile)
  function origem(x, y) { return DF ? 'transform-origin:' + n(DF.fx(x, y)) + 'px ' + n(DF.fy(y)) + 'px' : ''; }
  function grupo(s) { return s ? '<g transform="' + CABECA + '">' + s + '</g>' : ''; }

  // ---------- ajudantes ----------
  function n(v) { return Math.round(v * 10) / 10; }
  function rgb(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function mistura(a, b, t) { var x = rgb(a), y = rgb(b); return '#' + [0, 1, 2].map(function (i) { var v = Math.round(x[i] + (y[i] - x[i]) * t); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function esc(h, t) { return mistura(h, '#000000', t); }
  function cla(h, t) { return mistura(h, '#ffffff', t); }
  function at(o) { var s = ''; for (var k in o) if (o[k] !== undefined && o[k] !== null) s += ' ' + k + '="' + o[k] + '"'; return s; }
  function p(d, o) { return '<path d="' + d + '"' + at(o || {}) + '/>'; }
  function circ(cx, cy, r, o) { return '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '"' + at(o || {}) + '/>'; }
  function elip(cx, cy, rx, ry, o) { return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '"' + at(o || {}) + '/>'; }
  function ret(x, y, w, h, o) { return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '"' + at(o || {}) + '/>'; }
  // espelha um caminho na vertical do meio (só M, L, Q, C e Z: todo número vem em par x,y)
  function espelhar(d) { var i = 0; return d.replace(/-?\d*\.?\d+/g, function (m) { var r = i % 2 === 0 ? String(n(W - parseFloat(m))) : m; i++; return r; }); }
  function dois(d, o) { return p(d, o) + p(espelhar(d), o); }
  function sorteio(s) { s = s >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function estrela5(x, y, R, r) { var s = ''; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; s += (i ? 'L' : 'M') + n(x + Math.cos(a) * q) + ',' + n(y + Math.sin(a) * q); } return s + 'Z'; }
  function estrela4(x, y, r) { return 'M' + n(x) + ',' + n(y - r) + 'Q' + n(x) + ',' + n(y) + ' ' + n(x + r) + ',' + n(y) + 'Q' + n(x) + ',' + n(y) + ' ' + n(x) + ',' + n(y + r) + 'Q' + n(x) + ',' + n(y) + ' ' + n(x - r) + ',' + n(y) + 'Q' + n(x) + ',' + n(y) + ' ' + n(x) + ',' + n(y - r) + 'Z'; }
  /* ---------- glitter que brilha ----------
     lantejoula: um floquinho em losango, de tons diferentes da cor, com um pontinho de luz; algumas piscam.
     faísca: estrela fina de 4 pontas com uma cruz menor em X e um brilho em volta; na tela ela cresce, gira um
     pouco e some, sem parar (classes pp-fa / pp-pi no estilo.css). Parado (foto, miniatura) fica o desenho cheio.
     Tudo em coordenadas absolutas, para o giro da cabeça conseguir levar cada pedaço junto. */
  var ANIM = false;
  var ARCO_GLITTER = ['#ff7cc8', '#ffd76a', '#7ee8ff', '#b892ff', '#86ecc8'];
  function anima(classe, r) { return ANIM ? ' class="' + classe + '" style="animation-duration:' + n(1.2 + r() * 1.6) + 's;animation-delay:-' + n(r() * 3) + 's"' : ''; }
  function lantejoula(x, y, t, cor, r, pisca) {
    var a = r() * Math.PI, ca = Math.cos(a) * t, sa = Math.sin(a) * t, k = 0.62, tons = [cla(cor, 0.55), cor, esc(cor, 0.18), cla(cor, 0.25), '#ffffff'];
    var c = tons[Math.floor(r() * tons.length)];
    var d = 'M' + n(x + ca) + ',' + n(y + sa) + 'L' + n(x - sa * k) + ',' + n(y + ca * k) + 'L' + n(x - ca) + ',' + n(y - sa) + 'L' + n(x + sa * k) + ',' + n(y - ca * k) + 'Z';
    return '<path d="' + d + '" fill="' + c + '" stroke="' + esc(cor, 0.35) + '" stroke-width="' + n(Math.max(0.25, t * 0.12)) + '"' + (pisca ? anima('pp-pi', r) : '') + '/>' +
      (r() < 0.5 ? circ(x - ca * 0.3, y - sa * 0.3, Math.max(0.35, t * 0.22), { fill: '#fff', opacity: 0.9 }) : '');
  }
  function faisca(x, y, t, cor, r) {
    var d = t * 0.5;
    var xis = 'M' + n(x - d) + ',' + n(y - d) + 'Q' + n(x) + ',' + n(y) + ' ' + n(x + d) + ',' + n(y - d) + 'Q' + n(x) + ',' + n(y) + ' ' + n(x + d) + ',' + n(y + d) +
      'Q' + n(x) + ',' + n(y) + ' ' + n(x - d) + ',' + n(y + d) + 'Q' + n(x) + ',' + n(y) + ' ' + n(x - d) + ',' + n(y - d) + 'Z';
    return '<g' + anima('pp-fa', r) + '>' + circ(x, y, t * 0.62, { fill: cor, opacity: 0.25 }) + circ(x, y, t * 0.3, { fill: '#fff', opacity: 0.55 }) +
      p(estrela4(x, y, t), { fill: '#fff', stroke: cor, 'stroke-width': 0.35 }) + p(xis, { fill: '#fff', opacity: 0.9 }) + circ(x, y, Math.max(0.5, t * 0.12), { fill: '#fff' }) + '</g>';
  }
  // um punhado de glitter nos pontos dados: muitas lantejoulas e, de tanto em tanto, uma faísca
  function purpurina(pts, cor, r, t, cada) {
    var s = '', fa = '';
    pts.forEach(function (q, k) {
      var c = cor.id === 'arco' ? ARCO_GLITTER[k % ARCO_GLITTER.length] : cor.hex;
      s += lantejoula(q[0], q[1], t * (0.55 + r() * 0.6), c, r, k % 3 === 0);
      if (k % cada === 0) fa += faisca(q[0], q[1], t * (2.2 + r() * 1.6), cor.id === 'arco' ? ARCO_GLITTER[(k + 2) % 5] : cla(cor.hex, 0.2), r);
    });
    return s + fa;
  }
  function coracao(x, y, s) { return 'M' + n(x) + ',' + n(y + s * 0.9) + 'C' + n(x - s * 1.5) + ',' + n(y - s * 0.1) + ' ' + n(x - s * 0.6) + ',' + n(y - s * 1.15) + ' ' + n(x) + ',' + n(y - s * 0.35) + 'C' + n(x + s * 0.6) + ',' + n(y - s * 1.15) + ' ' + n(x + s * 1.5) + ',' + n(y - s * 0.1) + ' ' + n(x) + ',' + n(y + s * 0.9) + 'Z'; }
  function flor(x, y, r, cor, miolo) { var s = ''; for (var i = 0; i < 5; i++) { var a = i * Math.PI * 2 / 5 - Math.PI / 2; s += circ(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.75, { fill: cor }); } return s + circ(x, y, r * 0.55, { fill: miolo || '#ffd23f' }); }
  function laco(x, y, s, cor) {
    var c = esc(cor, 0.3), o = { fill: cor, stroke: c, 'stroke-width': 2, 'stroke-linejoin': 'round' };
    return p('M' + x + ',' + y + 'L' + n(x - s * 0.5) + ',' + n(y + s * 1.3) + 'L' + n(x - s * 0.1) + ',' + n(y + s * 1.15) + 'Z', o) +
      p('M' + x + ',' + y + 'L' + n(x + s * 0.5) + ',' + n(y + s * 1.3) + 'L' + n(x + s * 0.1) + ',' + n(y + s * 1.15) + 'Z', o) +
      p('M' + x + ',' + y + 'C' + n(x - s * 1.7) + ',' + n(y - s * 1.3) + ' ' + n(x - s * 1.7) + ',' + n(y + s * 1.1) + ' ' + x + ',' + y + 'Z', o) +
      p('M' + x + ',' + y + 'C' + n(x + s * 1.7) + ',' + n(y - s * 1.3) + ' ' + n(x + s * 1.7) + ',' + n(y + s * 1.1) + ' ' + x + ',' + y + 'Z', o) +
      p('M' + n(x - s * 1.05) + ',' + n(y - s * 0.35) + 'Q' + n(x - s * 0.6) + ',' + n(y - s * 0.55) + ' ' + n(x - s * 0.3) + ',' + n(y - s * 0.2), { fill: 'none', stroke: cla(cor, 0.6), 'stroke-width': 2.5, 'stroke-linecap': 'round', opacity: 0.8 }) +
      circ(x, y, s * 0.32, { fill: esc(cor, 0.12), stroke: c, 'stroke-width': 2 });
  }

  // ---------- o desenho ----------
  function svg(e0, op) {
    op = op || {};
    ANIM = !!op.anim;
    var e = V.limpar(e0), I = (op.id || 'b') + '-', fundo = op.fundo !== false, out = [];
    IDADE = IDADES[e.idade] || IDADES.adulta;
    DF = deformacao(e.idade, e.personagem === 'menino', e.corpo);
    // a partir dos 11 anos o rosto fica oval: a cabeça estreita um pouco (largura) e alonga
    CABECA = 'translate(0 14) translate(200 297) scale(' + IDADE.cab * (IDADE.largura || 1) + ' ' + IDADE.cab + ') translate(-200 -297)';
    var C = function (cat) { return corAjustada(e, cat); };
    var pele = C('pele').hex, peleE = esc(pele, 0.24), cab = C('cabelo').hex, cabE = esc(cab, 0.3 + 0.3 * escuridao(pele));
    var vis = function (cat) { return V.visivel(e, cat); };
    var estNa = vis('vestido') ? 'vestido' : 'blusa', comEstampa = e.estampa !== 'liso';
    var area = op.soFundo ? [0, 0, W, H] : (op.area || [0, 0, W, H]);
    var defs = defsSvg(e, I, pele, cab);

    function peca(ds, cor, catId) {
      var s = '', est = comEstampa && catId === estNa;
      (typeof ds === 'string' ? [ds] : ds).forEach(function (d) {
        s += p(d, { fill: cor.hex });
        if (est) s += p(d, { fill: 'url(#' + I + 'est)' });
        if (cor.brilho) s += p(d, { fill: 'url(#' + I + 'shine)' });
        s += p(d, { fill: 'url(#' + I + 'vol)' }) + p(d, { fill: 'url(#' + I + 'lado)' });
        s += p(d, { fill: 'none', stroke: esc(cor.hex, 0.4), 'stroke-width': 1.4, 'stroke-linejoin': 'round', opacity: 0.8 });
      });
      return s;
    }
    function linha(d, cor, larg, op2) { return p(d, { fill: 'none', stroke: cor, 'stroke-width': larg || 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: op2 }); }

    var cenarioS = fundo || op.soFundo ? cenario(e.cenario, I) : null;
    if (cenarioS) out.push(cenarioS);
    if (op.soFundo) return fechar();
    var sombraChao = elip(200, 664, 96, 13, { fill: '#000', opacity: 0.16 });
    out.push(sombraChao);

    /* ---------- giro (opcoes.angulo, em graus, qualquer valor) ----------
       Contínuo, como um boneco 3D: a cabeça é tratada como uma esfera. Olhos, sobrancelhas, nariz e boca andam
       sobre ela e encolhem de lado (ver cabecaVirada); o contorno do rosto vai virando, aos poucos, o perfil
       (testa, nariz, lábios e queixo); o cabelo da frente gira junto com o rosto e o de trás vai para trás.
       O corpo afina até virar o corpo de perfil e, passando de 90°, aparece de costas. A cabeça gira a volta
       inteira sem pular: a pele do rosto é uma região presa na cabeça (linha do cabelo, costeletas, queixo) que
       vai sumindo atrás dela, e de costas sobra só cabelo. */
    function normal(a) { a = (((a || 0) % 360) + 360) % 360; return a < 0.5 || a > 359.5 ? 0 : a; }
    // opcoes.olhar: só a cabeça vira (o corpo fica de frente) — no desfile ela olha para os lados
    // Nova Era: "olhar" não gira a cabeça em 3D (parecia troca de foto): a cabeça inclina de leve e os olhos vão para o
    // lado, contínuo (dono, 20/Nov/2026: "por que não tem o movimento do rosto?")
    var angB = normal(op.angulo), ang = angB, olharV = angB ? 0 : (function (a) { return a > 180 ? a - 360 : a; })(normal(op.olhar));
    var rad = ang * Math.PI / 180, radS = ang > 180 ? rad - 2 * Math.PI : rad, cos = ang ? Math.cos(rad) : 1, sen = ang ? Math.sin(rad) : 0, cosB = Math.cos(angB * Math.PI / 180);
    var corpoCostas = cosB < 0, costas = false, virada = !!ang, escalaX = 1 - 0.55 * Math.pow(Math.abs(Math.sin(angB * Math.PI / 180)), 1.5);
    // opcoes.sorriso: sorriso aberto; opcoes.tchau: braço levantado dando tchau (mexendo, com opcoes.anim)
    e.sorrindo = !!op.sorriso; var tchau = !!op.tchau && !angB;
    // de lado, o cabelo de trás e o pescoço não afinam junto com o corpo
    // de frente e de lado o cabelo de trás fica atrás do corpo; de costas ele vai por cima (ver cabecaVirada)
    // (no alto, o cabelo de trás não passa do contorno da cabeça: sem bico em cima quando ela vira)
    // de lado o cabelo de trás ganha o volume que fica atrás da cabeça (ver volumeTras), embaixo do desenho girado
    if (virada) { var vt = volumeTras(cabeloTras(e, I, cab, cabE), radS); if (vt) out.push(grupo('<g clip-path="url(#' + I + 'trasC)">' + vt + '</g>')); if (cos >= 0) out.push(grupo('<g clip-path="url(#' + I + 'trasC)">' + torcer(cabeloTras(e, I, cab, cabE), true, radS) + '</g>')); out.push(pescoco()); }
    var iniBoneca = out.length;

    // ---------- asas e cabelo de trás (de costas, vão por cima do corpo, lá embaixo) ----------
    var asasF = vis('vestido') && e.vestido === 'fada' ? asas(C('vestido')) : '';
    if (!corpoCostas) out.push(asasF);
    if (!ang) { var trasF = afinarCabelo(cabeloTras(e, I, cab, cabE), cabE); out.push(grupo(trasF + fiosIlustra(trasF, I, 'fiosT', e, cab, cabE))); }

    // ---------- pernas, pés e sapatos ----------
    function membro(d, larg) {
      // braço com forma (não um tubo): do ombro (mais largo) até o pulso (fino), seguindo a curva do traço
      var v = (d.match(/-?\d*\.?\d+/g) || []).map(Number), A = [v[0], v[1]], B = v.length >= 6 ? [v[2], v[3]] : null, Z = B ? [v[4], v[5]] : [v[2], v[3]];
      if (!B) B = [(A[0] + Z[0]) / 2, (A[1] + Z[1]) / 2];
      var inteiro = larg >= 22, esq = [], dir = [], N = 12;
      function largura(t) {   // inteiro: ombro → cotovelo → pulso; pedaço (antebraço): cotovelo → pulso
        return larg * 0.5 * (inteiro ? (t < 0.45 ? 1.12 - t * 0.55 : t < 0.58 ? 0.87 - (t - 0.45) * 0.6 : 0.8 + (t - 0.58) * 0.15 - Math.max(0, t - 0.8) * 1.2) : (0.92 - t * 0.3));
      }
      for (var i = 0; i <= N; i++) {
        var t = i / N, u = 1 - t, x = u * u * A[0] + 2 * u * t * B[0] + t * t * Z[0], y = u * u * A[1] + 2 * u * t * B[1] + t * t * Z[1];
        var dx = 2 * u * (B[0] - A[0]) + 2 * t * (Z[0] - B[0]), dy = 2 * u * (B[1] - A[1]) + 2 * t * (Z[1] - B[1]), l = Math.sqrt(dx * dx + dy * dy) || 1, w = largura(t);
        esq.push(n(x - dy / l * w) + ',' + n(y + dx / l * w)); dir.push(n(x + dy / l * w) + ',' + n(y - dx / l * w));
      }
      var r0 = largura(0);
      var forma = 'M' + esq.join(' L') + ' L' + dir.reverse().join(' L') + 'Z';
      var desenho = circ(A[0], A[1], r0, { fill: pele, stroke: esc(pele, 0.35), 'stroke-width': 1.4 }) + p(forma, { fill: pele, stroke: esc(pele, 0.35), 'stroke-width': 1.4, 'stroke-linejoin': 'round' }) +
        circ(A[0], A[1], r0 - 0.8, { fill: pele });
      return '<g data-osso="' + A[0] + ',' + A[1] + ',' + Z[0] + ',' + Z[1] + '">' + desenho + '</g><!--/osso-->';
    }
    function perna(x0, x1) {
      var M = [[455, 20], [500, 17.5], [548, 12.5], [586, 14], [626, 9.5], [642, 9]], esq = [], dir = [];
      M.forEach(function (m) { var x = x0 + (x1 - x0) * (m[0] - 455) / 187; esq.push([x - m[1], m[0]]); dir.push([x + m[1], m[0]]); });
      var d = 'M' + esq.map(function (q) { return n(q[0]) + ',' + q[1]; }).join(' L') + ' L' + dir.reverse().map(function (q) { return n(q[0]) + ',' + q[1]; }).join(' L') + 'Z';
      return p(d, { fill: pele, stroke: esc(pele, 0.35), 'stroke-width': 1.4, 'stroke-linejoin': 'round' }) +
        p('M' + n(x0 + 9) + ',470 Q' + n(x0 + 13) + ',520 ' + n((x0 + x1) / 2 + 6) + ',548', { fill: 'none', stroke: '#7a5ba8', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.12 });
    }
    var iniPernas = out.length;
    // pernas com forma de verdade: coxa larga em cima, joelho, panturrilha e tornozelo fino (cabem dentro das calças)
    [[177, 173], [223, 227]].forEach(function (q) { out.push(perna(q[0], q[1])); });
    out.push(sapatos(e, C('sapatos'), pele, peleE, peca, corpoCostas));

    // ---------- parte de baixo ----------
    if (vis('calca')) out.push(calca(e.calca, C('calca'), peca, linha, pele));
    /* opcoes.passos (desfile): cada perna — com o sapato e a perna da calça — vira um grupo próprio, que dobra o
       joelho e levanta o pé (classes pp-passo-e / pp-passo-d no estilo.css, uma de cada vez, só enquanto ela anda).
       A saia e o vestido vêm depois, por cima, e balançam com o corpo. De frente apenas. */
    if (op.passos && !angB) {
      var pernas = out.splice(iniPernas).join('');
      // as pernas começam na junta do quadril (y 456), por baixo da barra da blusa: a perna que anda gira ali e nada da
      // calça escapa para fora da roupa (dono, 20/Nov/2026: "os quadrados da calça não acompanham")
      defs += deformar('<clipPath id="' + I + 'pernaE"><rect x="-200" y="456" width="403" height="900"/></clipPath><clipPath id="' + I + 'pernaD"><rect x="197" y="456" width="403" height="900"/></clipPath>');
      out.push('<g class="pp-passo-e"><g clip-path="url(#' + I + 'pernaE)">' + pernas + '</g></g>', '<g class="pp-passo-d"><g clip-path="url(#' + I + 'pernaD)">' + pernas + '</g></g>',
        '<g clip-path="url(#' + I + 'quadrilP)">' + pernas + '</g>');
      defs += deformar('<clipPath id="' + I + 'quadrilP"><rect x="-200" y="0" width="800" height="458"/></clipPath>');   // o cós (escondido pela blusa), junto com o corpo
    }
    // desfile: da cintura para baixo, a saia e a barra do vestido acompanham o passo (.pp-barra, estilo.css), sem tombar
    var andaBarra = op.passos && !angB;
    if (andaBarra) defs += deformar('<clipPath id="' + I + 'acimaCint"><rect x="-200" y="-200" width="800" height="658"/></clipPath><clipPath id="' + I + 'abaixoCint"><rect x="-200" y="455" width="800" height="600"/></clipPath>');
    function barra(x) { return andaBarra ? '<g clip-path="url(#' + I + 'acimaCint)">' + x + '</g><g class="pp-barra"><g clip-path="url(#' + I + 'abaixoCint)">' + x + '</g></g>' : x; }
    // saia e vestido caem soltos do quadril: não apertam no joelho como a perna (com a perna fina, a barra ficava ondulada)
    function solta(x) { return '<g data-solta="">' + x + '</g><!--/solta-->'; }
    if (vis('saia')) out.push(andaBarra ? '<g class="pp-barra">' + solta(saia(e.saia, C('saia'), peca, linha)) + '</g>' : solta(saia(e.saia, C('saia'), peca, linha)));

    // ---------- pescoço, tronco e braços ----------
    // pescoço (20/Nov/2026, dono: "divisão bizarra da cabeça, pescoço e torso"): sem contorno grosso nem faixa reta de
    // sombra — só um traço fino dos lados e uma sombra macia embaixo do queixo, para cabeça, pescoço e ombro serem um só
    // (dono, 21/Nov/2026: proporção normal) pescoço com a grossura de um pescoço de verdade (~5,5% da altura), não um palito
    out.push(p('M173,262 L227,262 L226,312 Q230,334 252,342 L148,342 Q170,334 174,312Z', { fill: pele }) +
      p('M173,268 L174,312 Q170,332 156,340 M227,268 L226,312 Q230,332 244,340', { fill: 'none', stroke: esc(pele, 0.3), 'stroke-width': 1.1, opacity: 0.7 }) +
      p('M174,276 Q200,304 226,276 L226,268 L174,268Z', { fill: '#7a5ba8', opacity: 0.08 }));
    // tronco de pele um pouco mais estreito que qualquer roupa (a roupa cobre os lados: sem pele sobrando embaixo do braço)
    var TRONCO = 'M150,342 Q200,330 250,342 Q259,346 256,366 L248,458 L152,458 L144,366 Q141,346 150,342Z';
    // sem contorno em cima (dono, 20/Nov/2026: "divisão dos ombros e pescoço"): só os lados do tronco têm traço; pescoço,
    // ombros e tronco são uma pele só
    out.push(p(TRONCO, { fill: pele }) + p(TRONCO, { fill: 'url(#' + I + 'lado)' }) +
      p('M144,366 L152,458 M256,366 L248,458', { fill: 'none', stroke: peleE, 'stroke-width': 1.4 }));
    /* pose do fim da passarela (opcoes.pose): 'cintura' = mão direita na cintura (menina); 'cruzados' = braços cruzados
       (menino). Os braços da pose são desenhados no fim, por cima (bracosPose). */
    /* opcoes.rig (Nova Era, 20/Nov/2026: "as poses precisam de movimento, não ficar trocando de foto"): os braços viram um
       esqueleto — ombro, cotovelo e mão em grupos que giram (.rig-ombro-*, .rig-cotovelo-*), a cabeça inclina (.rig-cabeca)
       e as íris andam (.rig-iris). Quem mexe é o animador.js, de pose em pose, sem redesenhar. */
    // esqueleto em todo desenho de frente (dono, 20/Nov/2026: "manga torta" nos cartões): o braço parado antigo só com rig: false
    var rig = op.rig !== false && !angB && !tchau && !(POSES.indexOf(op.pose) >= 0);
    var bracoPose = !rig && !angB && !tchau && POSES.indexOf(op.pose) >= 0 ? op.pose : '';
    var semDireito = tchau || !!bracoPose || rig, semEsquerdo = rig || (!!bracoPose && bracoPose !== 'cintura' && bracoPose !== 'beijo'), semBracos = semDireito && semEsquerdo;
    var iniBracos = out.length;
    var bracos = (semEsquerdo ? [] : ['M150,354 Q126,420 118,498']).concat(semDireito ? [] : ['M250,354 Q274,420 282,498']);
    bracos.forEach(function (d) { out.push(membro(d, 23)); });

    // ---------- vestido ou blusa ----------
    var iTop = out.length;
    // braço que se mexe (esqueleto ou pose) traz a própria manga: a manga parada do desenho de baixo nem é desenhada
    // (senão sobrava um "toco" de manga do lado do corpo)
    var MANGAS_E = [MANGA_CURTA, MANGA_LONGA, MANGA_BUFANTE], MANGAS_D = MANGAS_E.map(espelhar);
    function pecaTopo(ds, cor, cat) {
      var l = (typeof ds === 'string' ? [ds] : ds).filter(function (d) { return !(semEsquerdo && MANGAS_E.indexOf(d) >= 0) && !(semDireito && MANGAS_D.indexOf(d) >= 0); });
      return l.length ? peca(l, cor, cat) : '';
    }
    var roupaCima = vis('vestido') ? barra(solta(vestido(e.vestido, C('vestido'), pecaTopo, linha, pele, peleE))) : blusa(e.blusa === 'nenhum' ? 'nenhum' : e.blusa, C('blusa'), pecaTopo, linha, pele);
    out.push(roupaCima);
    // (20/Nov/2026, dono: "dois triângulos pra baixo em cima da roupa"): sem as curvinhas desenhadas no peito — o busto
    // aparece no próprio contorno do corpo (PROPORCAO.larg), saindo para os lados e afinando na cintura
    // ---------- bolsa, mãos e joias do corpo ----------
    // bolsa de mão vai junto com a mão direita (não estica); a de ombro segue o corpo
    if (vis('bolsa') && !tchau && !bracoPose && (!rig || e.bolsa === 'ombro')) out.push(e.bolsa === 'ombro' ? bolsa(e.bolsa, C('bolsa'), peca, linha) : rigido(282, 496, bolsa(e.bolsa, C('bolsa'), peca, linha), [250, 354]));
    var esmalte = { tipo: e.unhas, cor: C('unhas') };
    if (!semEsquerdo) out.push(rigido(118, 496, mao(118, -1, pele, peleE, esmalte), [150, 354]));
    if (!semDireito) out.push(rigido(282, 496, mao(282, 1, pele, peleE, esmalte), [250, 354]));
    if (!corpoCostas && vis('colar')) out.push(colar(e.colar, C('colar'), I));
    if (!corpoCostas && vis('broche')) out.push(broche(e.broche, C('broche')));
    if (vis('pulseira') && !tchau && !semEsquerdo) out.push(rigido(118, 496, pulseira(e.pulseira, C('pulseira')), [150, 354]));
    if (!corpoCostas && vis('anel') && !tchau && !bracoPose && !rig) out.push(anel(e.anel, C('anel')));
    // em pose, a manga pendurada (parada) some do lado do braço em pose: o braço da pose desenha a própria manga
    if (bracoPose || rig) {
      var vestP = vis('vestido');
      /* o recorte do meio segue o contorno do corpo (um caminho, que a deformação curva em busto, cintura e quadril), e não
         um retângulo reto (dono, 20/Nov/2026: a blusa virava um caixote e a pele aparecia dos lados, como um "sovaco") */
      var faixa = 'M135,-200'; for (var yf = 290; yf <= 720; yf += 6) faixa += ' L135,' + yf;   // pontos juntinhos: a curva sai certa
      faixa += ' L135,1000 L265,1000'; for (var yg = 720; yg >= 290; yg -= 6) faixa += ' L265,' + yg; faixa += ' L265,-200Z';
      defs += deformar('<clipPath id="' + I + 'semManga"><path d="' + faixa + '"/>' + (semEsquerdo ? '' : '<rect x="-200" y="-200" width="350" height="1200"/>') +
        (semDireito ? '' : '<rect x="250" y="-200" width="400" height="1200"/>') + (vestP ? '<rect x="-200" y="455" width="800" height="800"/>' : '') + '</clipPath>');
      out[iTop] = '<g clip-path="url(#' + I + 'semManga)">' + out[iTop] + '</g>';
    }
    // capa de chuva por cima de tudo, na mesma camada; com esqueleto ou pose, sem a manga parada do braço que se mexe
    if (vis('capa')) out[iTop] += barra(capa(e.capa, C('capa'), peca, { e: !semEsquerdo, d: !semDireito }));
    if (vis('cinto')) out[iTop] += cinto(e.cinto, C('cinto'));
    /* desfile andando: cada braço balança a partir do ombro (.pp-braco-e / -d, estilo.css), junto com a perna do outro
       lado. Os braços, a roupa de cima (mangas), as mãos e as joias saem em três cópias recortadas: o meio do corpo
       (x 140–260) parado e cada lado (x < 150 e x > 250) girando no ombro. No vestido, só da cintura para cima vai com o
       braço (a saia fica no lugar). */
    if (op.passos && !angB && !tchau && !bracoPose && !rig) {
      var camada = out.splice(iniBracos), topo = camada[iTop - iniBracos], vest = vis('vestido');
      var antesTop = camada.slice(0, iTop - iniBracos).join(''), depoisTop = camada.slice(iTop - iniBracos + 1).join('');
      defs += deformar('<clipPath id="' + I + 'brMeio"><rect x="140" y="-200" width="120" height="1200"/></clipPath>' +
        '<clipPath id="' + I + 'brTopFixo"><rect x="140" y="-200" width="120" height="1200"/>' + (vest ? '<rect x="-200" y="455" width="800" height="800"/>' : '') + '</clipPath>' +
        '<clipPath id="' + I + 'brE"><rect x="-200" y="-200" width="350" height="1200"/></clipPath><clipPath id="' + I + 'brD"><rect x="250" y="-200" width="400" height="1200"/></clipPath>' +
        '<clipPath id="' + I + 'brEtop"><rect x="-200" y="-200" width="350" height="' + (vest ? 655 : 1200) + '"/></clipPath><clipPath id="' + I + 'brDtop"><rect x="250" y="-200" width="400" height="' + (vest ? 655 : 1200) + '"/></clipPath>');
      function lado(cl, clTop) { return '<g clip-path="url(#' + I + cl + ')">' + antesTop + '</g><g clip-path="url(#' + I + clTop + ')">' + topo + '</g><g clip-path="url(#' + I + cl + ')">' + depoisTop + '</g>'; }
      out.push('<g clip-path="url(#' + I + 'brTopFixo)">' + topo + '</g><g clip-path="url(#' + I + 'brMeio)">' + depoisTop + '</g>');
      out.push('<g class="pp-braco-e">' + lado('brE', 'brEtop') + '</g>', '<g class="pp-braco-d">' + lado('brD', 'brDtop') + '</g>');
    }
    if (corpoCostas) out.push(asasF);

    // ---------- cabeça (tudo aqui dentro vai para o grupo aumentado) ----------
    var corpo = out; out = [];
    var menino = e.personagem === 'menino', rosto = contorno(0, 0, e.rosto, e.nariz, menino);
    // distância entre os olhos (os dois andam junto com a sobrancelha, a dobra da pálpebra e a lente dos óculos)
    var dO = { juntos: -7, afastados: 9 }[e.distOlhos] || 0;
    function deslocar(x, conteudo) { return x ? '<g transform="translate(' + x + ' 0)">' + conteudo + '</g>' : conteudo; }
    // sobrancelha desenhada (cheia no começo, afinando na ponta), da cor do cabelo um pouco mais escura
    function sobr(cx, lado) { return p(sobrancelha(cx, lado, menino), { fill: mistura(cab, '#2a1c1a', 0.45), opacity: 0.92 }); }
    if (virada) out.push(cabecaVirada());
    else if (costas) {
      // de costas: a cabeça é só cabelo
      out.push(elip(116, 216, 12, 17, { fill: pele, stroke: peleE, 'stroke-width': 2 }), elip(284, 216, 12, 17, { fill: pele, stroke: peleE, 'stroke-width': 2 }));
      out.push(pintar(rosto, 'url(#' + I + 'cab)', cabE) + p('M200,118 L200,200', { stroke: cabE, 'stroke-width': 2, opacity: 0.5 }));
      out.push(cabeloTras(e, I, cab, cabE));
      if (vis('brincos')) out.push(brincos(e.brincos, C('brincos'), I));
    } else {
      if (vis('capa')) out.push(capuzAtras(e.capa, C('capa')));
      out.push(elip(116, 216, 12, 17, { fill: pele, stroke: peleE, 'stroke-width': 2 }), elip(284, 216, 12, 17, { fill: pele, stroke: peleE, 'stroke-width': 2 }));
      out.push(pintar(rosto, 'url(#' + I + 'pele)', esc(pele, 0.42), 1.1));
      out.push(luzLados(pele, menino), luzMeio(pele, I), base(e.base, pele, rosto), blush(e, C('blush').hex, I), deslocar(-dO, olhoIdade(164, olho(164, -1, e, I, C, olharV * 0.16, op.anim))), deslocar(dO, olhoIdade(236, olho(236, 1, op.piscadinha ? Object.assign({}, e, { formaOlho: 'sorridentes' }) : e, I, C, olharV * 0.16, op.anim && !op.piscadinha))   /* opcoes.piscadinha: o olho direito fecha num arquinho */));
      out.push(deslocar(-dO, sobr(164, -1)), deslocar(dO, sobr(236, 1)));
      out.push(narizFrente(e.nariz, pele) + narizLuz(pele, menino));
      // menina: boca um pouco menor e mais alta (o queixo ficou curto e redondo; a boca aberta não passa da ponta do queixo)
      out.push(menino ? bocaIdade(formaDaBoca(e, boca(e, C('batom'), pele, I))) : '<g transform="translate(200 262) scale(0.86) translate(-200 -270)">' + bocaIdade(formaDaBoca(e, boca(e, C('batom'), pele, I))) + '</g>');
      if (menino && vis('bigode')) out.push(bocaIdade(bigode(e.bigode, cab)));
      if (vis('adesivo')) out.push(adesivo(e.adesivo, 266, 250, 13));
      if (e.glitter === 'bochechas' || e.glitter === 'olhos') out.push(glitter(e, C('glitter')));
      // ---------- cabelo da frente e acessórios do rosto ----------
      var franjaF = afinarCabelo(subirTesta(cabeloFrente(e, I, cab, cabE), TESTA[e.testa] || 0), cabE);
      // sombra que a franja faz na testa (separa o cabelo do rosto; mais forte na pele escura)
      defs += '<clipPath id="' + I + 'rostoF"><path d="' + rosto + '"/></clipPath>';
      out.push('<g clip-path="url(#' + I + 'rostoF)"><g transform="translate(0 4)" opacity="' + n(0.2 + 0.25 * escuridao(pele)) + '">' +
        franjaF.replace(/fill="(url\([^)]*\)|#[0-9a-fA-F]{3,6})"/g, 'fill="' + esc(pele, 0.55) + '"').replace(/stroke="#[0-9a-fA-F]{3,6}"/g, 'stroke="' + esc(pele, 0.55) + '"') + '</g></g>');
      out.push(franjaF + fiosIlustra(franjaF, I, 'fiosF', e, cab, cabE));
      if (vis('capa')) out.push(capuzFrente(e.capa, C('capa')));   // o capuz cobre o alto do cabelo
      if (vis('brincos')) out.push(brincos(e.brincos, C('brincos'), I));
      if (vis('oculos')) out.push(oculos(e.oculos, C('oculos'), dO));
    }
    var enfeites = '';
    if (vis('laco') && !(e.laco === 'alto' && (e.cabeca === 'chapeu' || e.cabeca === 'gorro'))) enfeites += lacos(e.laco, C('laco'), e.cabelo);
    if (vis('cabeca')) enfeites += cabeca(e.cabeca, C('cabeca'), I, peca);
    // enfeites de cabeça: de lado, vão um pouco para a frente e ficam mais estreitos (vistos de lado)
    if (virada && cos < -0.25 && ['tiara', 'diadema', 'unicornio'].indexOf(e.cabeca) >= 0) enfeites = enfeites.replace(cabeca(e.cabeca, C('cabeca'), I, peca), '');   // tiara fica na frente: de costas não aparece
    // enfeites giram junto: de lado ficam mais estreitos; passando de 90° trocam de lado (o laço do lado direito vai para a esquerda)
    out.push(virada && enfeites ? '<g transform="translate(' + n(200 + sen * 22) + ' 0) scale(' + n((cos >= 0 ? 1 : -1) * Math.max(0.68, Math.abs(cos)) * 1000) / 1000 + ' 1) translate(-200 0)">' + enfeites + '</g>' : enfeites);
    var animAntes = ANIM; ANIM = ANIM && (virada || !ang);
    if (e.glitter === 'cabelo') out.push(virada ? torcer(glitter(e, C('glitter')), false, radS, sen >= 0 ? 1 : -1).frente : glitter(e, C('glitter')));
    var cabecaPronta = grupo(olharV ? '<g transform="rotate(' + n(olharV * 0.16) + ' 200 300) translate(' + n(olharV * 0.12) + ' 0)">' + out.join('') + '</g>' : out.join(''));
    out = corpo;
    ANIM = animAntes && !ang;
    if (e.glitter === 'tudo') out.push(glitter(e, C('glitter')));
    ANIM = animAntes;
    if (angB) {
      // só o corpo afina um pouco; a cabeça fica do tamanho certo (de costas, espelhada: laço e cabelo trocam de lado)
      var boneca = out.splice(iniBoneca).join('');
      // de lado, o corpo de frente vai se transformando no corpo de perfil (um braço na frente, pernas uma atrás da outra)
      var sB = Math.abs(Math.sin(angB * Math.PI / 180)), wL = sB >= 0.82 ? 1 : 0;   // troca de uma vez (sem transparência)
      if (wL < 1) out.push('<g transform="translate(200 0) scale(' + n((corpoCostas ? -1 : 1) * escalaX * 100) / 100 + ' 1) translate(-200 0)"' + (wL > 0 ? ' opacity="' + n(1 - wL) + '"' : '') + '>' + boneca + '</g>');
      if (wL > 0) { var ladoB = Math.sin(angB * Math.PI / 180) >= 0 ? 1 : -1, cl = corpoLado(); out.push('<g' + (wL < 1 ? ' opacity="' + n(wL) + '"' : '') + (ladoB < 0 ? ' transform="translate(400 0) scale(-1 1)"' : '') + '>' + cl + '</g>'); }
      out.push(costas ? '<g transform="translate(400 0) scale(-1 1)">' + cabecaPronta + '</g>' : cabecaPronta);
    } else {
      // mão no cabelo: o braço sobe e a mão fica atrás da cabeça (desenhado antes da cabeça)
      if (bracoPose === 'maoCabelo') out.push(bracosPose('maoCabeloAtras', tipoManga(), corDoTopo(), pele, peleE, esmalte, membro));
      out.push(cabecaPronta);
    }
    // o braço do tchau vai por cima de tudo (fica na frente do cabelo, do lado do rosto)
    // o braço do tchau vai inteiro junto com o ombro (sem a mão encolher para cima do rosto na altura da cabeça)
    if (tchau) out.push(rigido(250, 356, bracoTchau(pele, peleE, esmalte, membro, op.anim)));
    // beijinho: corações saindo da boca e subindo (na cabeça, para ficarem no lugar dela; .pp-beijo no estilo.css)
    if (bracoPose === 'beijo') out.push(grupo('<g class="pp-beijo">' + p(coracao(236, 256, 9), { fill: '#ff4f8b', stroke: '#fff', 'stroke-width': 1.5 }) + '</g><g class="pp-beijo pp-beijo2">' + p(coracao(252, 236, 6), { fill: '#ff8fc8', stroke: '#fff', 'stroke-width': 1.2 }) + '</g>'));
    if (bracoPose) out.push(bracosPose(bracoPose, tipoManga(), corDoTopo(), pele, peleE, esmalte, membro));
    // corpo de ilustração de moda: o corpo passa pela deformação e a cabeça (já pronta) só é reduzida e posta no lugar
    var cabecaGrupo = '<g transform="' + CABECA + '">';
    out = out.map(function (x) {
      if (x === cenarioS || x === sombraChao) return x;
      if (x === cabecaPronta && rig) return '<g class="rig-cabeca" data-x="200" data-y="' + n(DF.yC) + '"><g transform="' + DF.cabeca + '">' + x + '</g></g>';
      if (x === cabecaPronta || x.indexOf(cabecaGrupo) === 0) return '<g transform="' + DF.cabeca + '">' + x + '</g>';
      return deformar(x).replace(/<g class="pp-(passo-e|passo-d|braco-e|braco-d)">/g, function (m, k) {
        var o = { 'passo-e': [177, 455], 'passo-d': [223, 455], 'braco-e': [150, 352], 'braco-d': [250, 352] }[k];
        return '<g class="pp-' + k + '" style="' + origem(o[0], o[1]) + '">';
      }).replace(/<g class="pp-barra">/g, '<g class="pp-barra" style="' + origem(200, 455) + '">');
    });
    if (rig) out.push(bracoRig(-1), bracoRig(1));
    /* desfile (opcoes.passos): tudo menos as pernas e a sombra do chão vai para grupos .pp-corpo, que acompanham o
       quadril (o peso passa de um pé para o outro e o corpo sobe e desce um pouco) sem tombar de lado; as pernas
       (.pp-passo-e / -d) fazem o catwalk: um pé cruza e pousa na frente do outro, na linha do meio (estilo.css) */
    if (op.passos && !angB) {
      var junto = [], soltos = [];
      out.forEach(function (x) {
        if (x === cenarioS || x === sombraChao || x.indexOf('<g class="pp-passo-') === 0) { if (soltos.length) junto.push('<g class="pp-corpo" style="' + origem(200, 455) + '">' + soltos.join('') + '</g>'); soltos = []; junto.push(x); }
        else soltos.push(x);
      });
      if (soltos.length) junto.push('<g class="pp-corpo" style="' + origem(200, 455) + '">' + soltos.join('') + '</g>');
      out = junto;
    }
    /* rebolado (dono, 21/Nov/2026: "o corpo tem que se movimentar como um todo, todos os pontos se conectarem de maneira
       natural e fluida"): o desenho da personagem sai duas vezes, cortado na linha do quadril — embaixo as pernas, que
       inclinam a partir dos pés (os pés ficam no chão e o quadril vai para o lado), e em cima o tronco, que sai do quadril
       já deslocado e volta um pouco nos ombros. As duas inclinações levam a linha do quadril exatamente para o mesmo
       lugar, então nada desencaixa (sem degrau na calça); a cabeça vai junto com o pescoço, sem entortar. Tudo o que está
       na mesma altura vai junto (a mão na cintura fica na cintura). O animador só muda as duas matrizes (.pp-banda-*). */
    if (rig && op.passos && op.rebolar !== false) {
      var yJ = DF.fy(456), fica = cenarioS && out[0] === cenarioS ? [out.shift()] : [], chao = out.indexOf(sombraChao) >= 0 ? [sombraChao] : [];
      var fig = out.filter(function (x) { return x !== sombraChao; }).join('');
      defs += '<clipPath id="' + I + 'bandaC"><rect x="-1000" y="-2000" width="2400" height="' + n(2000 + yJ + 1.5) + '"/></clipPath>' +
        '<clipPath id="' + I + 'bandaB"><rect x="-1000" y="' + n(yJ - 1.5) + '" width="2400" height="2000"/></clipPath>';
      out = fica.concat(chao, ['<g class="pp-rebola" data-y="' + n(yJ) + '" data-ombro="' + n(DF.fy(354)) + '" data-pe="664" data-queixo="' + n(DF.yC) + '">' +
        '<g clip-path="url(#' + I + 'bandaB)"><g class="pp-banda-baixo">' + fig + '</g></g>' +
        '<g clip-path="url(#' + I + 'bandaC)"><g class="pp-banda-cima">' + fig + '</g></g></g>']);
    }
    return fechar();

    /* ---------- o corpo de perfil (virado para a direita; o espelho vira para a esquerda) ----------
       Desenho próprio de lado, com as cores e a estampa das peças escolhidas: braço e perna do lado de lá atrás
       (um pouco mais escuros), tronco de lado, saia, calça ou vestido de lado, braço do lado de cá na frente e
       sapatos de lado. */
    // braço do esqueleto, já no corpo novo: ombro S, cotovelo E, pulso W (em repouso, pendurado); a pose inicial vem de
    // opcoes.poseRig { oE, cE, oD, cD } (graus: o = abrir para fora, c = dobrar o cotovelo para dentro)
    function bracoRig(lado) {
      var sx0 = lado < 0 ? 150 : 250, wx0 = lado < 0 ? 118 : 282, S = [DF.fx(sx0, 354), DF.fy(354)], W0 = [DF.fx(wx0, 498), DF.fy(498)];
      var W = [S[0] + (W0[0] - S[0]) * ENCURTA, S[1] + (W0[1] - S[1]) * ENCURTA], L = Math.sqrt((W[0] - S[0]) * (W[0] - S[0]) + (W[1] - S[1]) * (W[1] - S[1]));
      var d = [(W[0] - S[0]) / L, (W[1] - S[1]) / L], Lu = L * 0.5, E = [S[0] + d[0] * Lu, S[1] + d[1] * Lu], k = DF.traco * 1.3 * DF.braco;   // grossura de braço de verdade (dono, 21/Nov/2026)
      function seg(A, B, w0, w1) {   // pedaço do braço: começa largo e afina, com as pontas redondas
        var nx = -(B[1] - A[1]), ny = B[0] - A[0], l = Math.sqrt(nx * nx + ny * ny) || 1; nx /= l; ny /= l;
        // pontas redondas para fora (sweep 0): no cotovelo as duas pontas se encaixam sem buraco
        return 'M' + n(A[0] + nx * w0) + ',' + n(A[1] + ny * w0) + ' L' + n(B[0] + nx * w1) + ',' + n(B[1] + ny * w1) + ' A' + n(w1) + ',' + n(w1) + ' 0 0 0 ' + n(B[0] - nx * w1) + ',' + n(B[1] - ny * w1) +
          ' L' + n(A[0] - nx * w0) + ',' + n(A[1] - ny * w0) + ' A' + n(w0) + ',' + n(w0) + ' 0 0 0 ' + n(A[0] + nx * w0) + ',' + n(A[1] + ny * w0) + 'Z';
      }
      /* sem "emenda" no cotovelo (dono, 20/Nov/2026): primeiro todos os contornos, depois todo o preenchimento por cima —
         o braço e a manga viram uma peça só, sem as bolinhas de boneco articulado */
      function duas(d, cor) { return { c: p(d, { fill: cor, stroke: esc(cor, 0.35), 'stroke-width': 1.4, 'stroke-linejoin': 'round' }), f: p(d, { fill: cor }) }; }
      var manga = tipoManga(), corTop = corDoTopo();
      var bc = duas(seg(S, E, 12 * k, 8 * k), pele), ab = duas(seg(E, W, 8.2 * k, 5.6 * k), pele);   // braço afina do ombro ao punho
      var cimaC = bc.c, cimaF = bc.f, baixoC = ab.c, baixoF = ab.f;
      if (corTop && manga === 'longa') {
        var mc = duas(seg(S, E, 12.8 * k, 9.2 * k), corTop.hex), mb = duas(seg(E, [W[0] - d[0] * 4, W[1] - d[1] * 4], 9.2 * k, 6.8 * k), corTop.hex);
        cimaC += mc.c; cimaF += mc.f; baixoC += mb.c; baixoF += mb.f;
      } else if (corTop && manga !== 'nada') cimaF += p(seg(S, [S[0] + d[0] * Lu * 0.55, S[1] + d[1] * Lu * 0.55], 13 * k, 11 * k), { fill: corTop.hex, stroke: esc(corTop.hex, 0.35), 'stroke-width': 1.4, 'stroke-linejoin': 'round' });
      // ombro redondo por baixo do braço (some o "ganchinho" no ombro)
      cimaC = circ(S[0], S[1], 13 * k, { fill: corTop && manga !== 'nada' ? corTop.hex : pele }) + cimaC;
      // sem manga: o arco do contorno do braço não risca o ombro (a pele do braço continua a do ombro)
      if (!corTop || manga === 'nada') cimaF += circ(S[0], S[1], 12 * k + 1.2, { fill: pele });
      var esm = { tipo: e.unhas, cor: C('unhas') }, mk = DF.traco * 0.78;
      // a bolsa de mão (e o guarda-chuva) vai na mão direita e o anel no dedo: tudo dentro do grupo da mão, que gira com o braço
      var naMao = lado > 0 && vis('bolsa') && e.bolsa !== 'ombro' ? bolsa(e.bolsa, C('bolsa'), peca, linha) : '';
      var maoS = '<g transform="translate(' + n(W[0]) + ' ' + n(W[1]) + ') scale(' + n(mk * 100) / 100 + ') translate(' + (-wx0) + ' -497)">' + naMao + mao(wx0, lado, pele, peleE, esm) +
        (lado < 0 && vis('pulseira') ? pulseira(e.pulseira, C('pulseira')) : '') + (vis('anel') ? anel(e.anel, C('anel'), lado) : '') + '</g>';
      // f: o braço de cima "vem para a frente" (fica mais curto na tela) — o antebraço desfaz o encolhimento e não deforma
      var pr = op.poseRig || {}, a = lado < 0 ? (pr.oE || 6) : -(pr.oD || 6), b = lado < 0 ? -(pr.cE || 8) : (pr.cD || 8), f0 = (lado < 0 ? pr.fE : pr.fD) || 1, lt = lado < 0 ? 'e' : 'd';
      // o antebraço sai em dois grupos com a mesma classe (contorno e preenchimento): o animador gira os dois juntos
      var cot = '<g class="rig-cotovelo-' + lt + '" data-x="' + n(E[0]) + '" data-y="' + n(E[1]) + '" transform="' + transformaCotovelo(b, f0, E) + '">';
      return '<g class="rig-ombro-' + lt + '" data-x="' + n(S[0]) + '" data-y="' + n(S[1]) + '" transform="' + transformaOmbro(a, f0, S) + '">' + cimaC +
        cot + baixoC + '</g>' + cimaF + cot + baixoF + maoS + '</g></g>';
    }
    function corDoTopo() { return vis('capa') ? C('capa') : vis('vestido') ? C('vestido') : (e.blusa !== 'nenhum' ? C('blusa') : null); }
    function tipoManga() {
      if (vis('capa')) return 'longa';
      var temVest = vis('vestido');
      return temVest ? (['casaco', 'macacao'].indexOf(e.vestido) >= 0 ? 'longa' : ['tomara', 'verao', 'jardineira', 'festa', 'fada', 'sereia', 'gala'].indexOf(e.vestido) >= 0 ? 'nada' : 'curta')   /* vestidos sem manga: o braço fica de pele */ :
        (['sueter', 'jaqueta', 'pijama', 'moletom', 'camisa', 'disco', 'jaquetaGola'].indexOf(e.blusa) >= 0 ? 'longa' : ['regata', 'ombro', 'colete', 'nenhum'].indexOf(e.blusa) >= 0 ? 'nada' : 'curta');
    }
    function corpoLado() {
      var s = '', sombra = function (d, larg) { return p(d, { stroke: '#2a0a3c', 'stroke-width': larg, 'stroke-linecap': 'round', fill: 'none', opacity: 0.16 }); };
      var temVest = vis('vestido'), corTop = temVest ? C('vestido') : (e.blusa !== 'nenhum' ? C('blusa') : null), catTop = temVest ? 'vestido' : 'blusa';
      var compVest = { princesa: 640, gala: 640, sereia: 640, camisola: 600, festa: 560, rodado: 560, verao: 540, fada: 540, tomara: 560, casaco: 540, jardineira: 530, macacao: 640 }[e.vestido] || 560;
      var compSaia = { curta: 510, tutu: 515, balone: 520, pregas: 540, jeans: 530, camadas: 560, longa: 630 }[e.saia] || 530;
      var compCalca = { shorts: 505, bermuda: 545 }[e.calca] || 636;
      var manga = tipoManga(), corBraco = vis('capa') ? C('capa') : corTop;
      // braço e perna de lá (atrás)
      var bracoLa = 'M197,356 Q186,424 182,492', pernaLa = 'M195,456 L190,640';
      s += membro(pernaLa, 27) + sombra(pernaLa, 27);
      if (vis('calca')) s += p(pernaLa.replace('640', String(compCalca)), { stroke: C('calca').hex, 'stroke-width': 31, 'stroke-linecap': 'round', fill: 'none' }) + sombra(pernaLa.replace('640', String(compCalca)), 31);
      s += sapatoLado(190, true);
      s += membro(bracoLa, 21) + (manga === 'longa' && corBraco ? p(bracoLa, { stroke: corBraco.hex, 'stroke-width': 24, 'stroke-linecap': 'round', fill: 'none' }) : '') + sombra(bracoLa, 22) + maoLado(182, 497, true);
      // perna de cá
      var pernaCa = 'M206,456 L210,640';
      s += membro(pernaCa, 29);
      if (vis('calca')) s += peca(['M191,450 L223,450 L' + (compCalca > 600 ? '226,' + compCalca + ' L196,' + compCalca : '227,' + compCalca + ' L192,' + compCalca) + 'Z'], C('calca'), 'calca');
      s += sapatoLado(210, false);
      // tronco de lado (peito na frente, costas atrás)
      var tronco = 'M180,338 Q198,330 216,335 Q233,348 233,380 Q230,420 224,458 L178,458 Q171,420 172,382 Q170,350 180,338Z';
      s += p(tronco, { fill: pele, stroke: peleE, 'stroke-width': 1.4 });
      if (vis('saia')) s += peca('M181,448 L223,448 Q238,' + (compSaia - 30) + ' 248,' + compSaia + ' L156,' + compSaia + ' Q166,' + (compSaia - 30) + ' 181,448Z', C('saia'), 'saia');
      if (temVest) s += peca('M181,450 L223,450 Q' + (compVest > 600 ? 250 : 244) + ',' + (compVest - 40) + ' ' + (compVest > 600 ? 262 : 252) + ',' + compVest + ' L' + (compVest > 600 ? 142 : 150) + ',' + compVest + ' Q' + (compVest > 600 ? 150 : 158) + ',' + (compVest - 40) + ' 181,450Z', C('vestido'), 'vestido');
      if (corTop) {
        var decote = e.blusa === 'ombro' || e.vestido === 'tomara' ? 'M180,352 Q200,346 226,350' : 'M184,340 Q196,346 210,338';
        s += peca('M' + (decote.split(' ')[0].slice(1)) + ' Q233,350 233,380 Q230,420 225,' + (temVest ? 452 : 462) + ' L177,' + (temVest ? 452 : 462) + ' Q171,420 172,382 Q170,356 ' + decote.split(' ')[0].slice(1) + 'Z', corTop, catTop);
        s += p(decote, { fill: 'none', stroke: esc(corTop.hex, 0.3), 'stroke-width': 1.6 });
      }
      // capa de chuva de lado: por cima de tudo, até o joelho
      if (vis('capa')) s += peca('M180,336 Q200,328 218,334 Q236,348 236,380 L254,562 Q204,572 154,562 L172,382 Q170,350 180,336Z', C('capa'), 'x');
      // braço de cá, na frente do tronco
      var bracoCa = 'M203,354 Q208,426 212,494';
      s += membro(bracoCa, 23);
      if (corBraco && manga !== 'nada') s += manga === 'longa' ? p('M203,352 Q208,424 212,486', { stroke: corBraco.hex, 'stroke-width': 26, 'stroke-linecap': 'round', fill: 'none' }) + p('M203,352 Q208,424 212,486', { stroke: esc(corBraco.hex, 0.3), 'stroke-width': 26, 'stroke-linecap': 'round', fill: 'none', opacity: 0.18 })
        : peca('M190,346 Q204,336 218,348 L220,392 Q206,398 192,392Z', corTop, catTop);
      s += maoLado(212, 499, false);
      return s;
    }
    // mão de lado: palma com o polegar para a frente e as unhas
    function maoLado(x, y, la) {
      var s = elip(x, y, 10, 12, { fill: pele, stroke: peleE, 'stroke-width': 2 }) + p('M' + (x + 6) + ',' + (y - 4) + ' Q' + (x + 13) + ',' + (y + 2) + ' ' + (x + 9) + ',' + (y + 8), { fill: 'none', stroke: peleE, 'stroke-width': 1.6, 'stroke-linecap': 'round' });
      if (e.unhas !== 'nenhum' && !la) s += unhas([[x + 2, y + 11], [x + 6, y + 10]], { tipo: e.unhas, cor: C('unhas') }, pele);
      return s + (la ? elip(x, y, 10, 12, { fill: '#2a0a3c', opacity: 0.16 }) : '');
    }
    // sapato de lado (bico para a frente); descalça mostra o pé
    function sapatoLado(x, la) {
      var t = e.sapatos, c = C('sapatos'), s;
      // descalça: calcanhar atrás, peito do pé descendo até os dedos na frente, sola reta e a unha do dedão em cima
      var forma = 'M' + (x - 10) + ',634 L' + (x - 10) + ',632 L' + (x + 8) + ',632 L' + (x + 30) + ',648 Q' + (x + 30) + ',656 ' + (x + 18) + ',656 L' + (x - 10) + ',656Z';
      if (t === 'nenhum') {
        var volta = 'M' + (x + 7) + ',628 Q' + (x + 8) + ',637 ' + (x + 14) + ',641 Q' + (x + 24) + ',644 ' + (x + 28) + ',650 Q' + (x + 30) + ',656 ' + (x + 24) + ',656 L' + (x - 6) + ',656 Q' + (x - 13) + ',655 ' + (x - 12) + ',646 Q' + (x - 11) + ',638 ' + (x - 9) + ',628';
        forma = volta + 'Z';
        // contorno sem o risco de cima (o pé continua a perna, sem "meia")
        s = p(forma, { fill: pele }) + p(volta, { fill: 'none', stroke: peleE, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }) +
          p('M' + (x + 20) + ',652 Q' + (x + 21) + ',655 ' + (x + 19) + ',656', { fill: 'none', stroke: esc(pele, 0.2), 'stroke-width': 1, 'stroke-linecap': 'round' });
        if (!la) s += unhas([[x + 26, 650, 0.85]], { tipo: e.unhas, cor: C('unhas') }, pele);
      } else {
        var salto = ['salto', 'scarpin', 'saltoMedio', 'princesa', 'anabela', 'plataforma'].indexOf(t) >= 0, cano = t === 'bota' || t === 'galocha' || t === 'botaNeve' ? 600 : t === 'botaCano' ? 560 : t === 'patins' ? 598 : 0;
        var d = 'M' + (x - 10) + ',' + (cano || 632) + ' L' + (x + 8) + ',' + (cano || 632) + ' L' + (x + 8) + ',638 Q' + (x + 26) + ',638 ' + (x + 30) + ',' + (salto ? 652 : 648) + ' Q' + (x + 30) + ',656 ' + (x + 18) + ',656 L' + (x - 10) + ',656Z';
        s = peca(d, c, 'sapatos'); forma = d;
        if (salto) s += p('M' + (x - 10) + ',652 L' + (x - 3) + ',652 L' + (x - 5) + ',666 L' + (x - 9) + ',666Z', { fill: esc(c.hex, 0.25) });
        if (t === 'tenis' || t === 'tenisAlto' || t === 'tenisLuz' || t === 'tenisGlitter') s += p('M' + (x - 10) + ',652 L' + (x + 26) + ',652', { stroke: '#fff', 'stroke-width': 3 }) + p('M' + (x - 2) + ',640 L' + (x + 10) + ',642', { stroke: '#fff', 'stroke-width': 1.6, opacity: 0.8 });
        // patins de lado: aqui sim as rodas aparecem redondas, uma na frente e uma atrás, com o freio na ponta
        if (t === 'patins') {
          s += ret(x - 12, 654, 44, 5, { fill: '#9aa3b5', stroke: '#6f7788', 'stroke-width': 1, rx: 2.5 }) + circ(x + 33, 659, 3.6, { fill: '#ff8fb1', stroke: '#d0567c', 'stroke-width': 1.1 });
          [x - 4, x + 22].forEach(function (rx) { s += circ(rx, 664, 6.5, { fill: '#ffd166', stroke: '#c9932a', 'stroke-width': 1.5 }) + circ(rx, 664, 2.6, { fill: '#fff', stroke: '#c9932a', 'stroke-width': 0.8 }); });
        }
      }
      // o pé de lá fica um pouco mais escuro (na sombra), só no desenho dele, sem caixa em volta
      return s + (la ? p(forma, { fill: '#2a0a3c', opacity: 0.14 }) : '');
    }

    // pescoço girado: de lado fica um pouco mais largo e mais para trás, com a sombra do queixo
    function pescoco() {
      var as = Math.abs(sen), m = 200 - sen * 5, l = 14 + 8 * as;
      return grupo(p('M' + n(m - l) + ',262 L' + n(m + l) + ',262 L' + n(m + l + 2 * as) + ',352 L' + n(m - l - 2 * as) + ',352Z', { fill: pele, stroke: peleE, 'stroke-width': 2 }) +
        p('M' + n(m - l) + ',284 Q' + n(m + sen * 10) + ',' + n(306 + 6 * as) + ' ' + n(m + l) + ',284 L' + n(m + l) + ',300 Q' + m + ',316 ' + n(m - l) + ',300Z', { fill: esc(pele, 0.35), opacity: 0.18 }));
    }

    /* ---------- a cabeça girada ----------
       Cada parte do rosto tem um "ângulo de lugar" na esfera da cabeça (az): olhos a ±26°, boca e nariz a 0°,
       orelhas a ±90°. Girando a cabeça de θ, a parte vai para x = 200 + R·sen(az+θ) e fica mais estreita
       (cos(az+θ)) — some quando passa para trás. O contorno mistura o rosto de frente e o perfil. */
    function cabecaVirada() {
      var s = '', sg = sen >= 0 ? 1 : -1, as = Math.abs(sen), G = Math.PI / 180;
      var cont = contorno(radS, 0, e.rosto, e.nariz, menino), contV = contorno(radS, 10, e.rosto, e.nariz, menino);
      function xa(az, R) { return 200 + R * Math.sin(az * G + rad); }
      function proj(conteudo, x0, az, R, corte, minimo) {
        var k = Math.cos(az * G + rad); if (k < (minimo === undefined ? 0.12 : minimo)) return '';
        var kx = Math.max(k, 0.3);
        return '<g transform="translate(' + n(xa(az, R)) + ' 0) scale(' + n(kx * 1000) / 1000 + ' 1) translate(' + (-x0) + ' 0)">' + (corte ? '<g clip-path="url(#' + I + corte + ')">' + conteudo + '</g>' : conteudo) + '</g>';
      }
      var xE = xa(-sg * 90, 86), xF = xa(sg * 90, 86), zE = Math.cos((-sg * 90) * G + rad), zF = Math.cos((sg * 90) * G + rad);
      defs += '<clipPath id="' + I + 'rostoV"><path d="' + cont + '"/></clipPath><clipPath id="' + I + 'cabV"><path d="' + contV + '"/></clipPath>' +
        '<clipPath id="' + I + 'mE"><rect x="0" y="0" width="200" height="720"/></clipPath><clipPath id="' + I + 'mD"><rect x="200" y="0" width="200" height="720"/></clipPath>';
      var hf = torcer(subirTesta(cabeloFrente(e, I, cab, cabE), TESTA[e.testa] || 0), false, radS, sg);
      // de três-quartos para trás, a franja fica dentro do contorno da cabeça (não sai um "bico" atrás)
      defs += '<clipPath id="' + I + 'cabF"><path d="' + contV + '"/>' + (cos > 0.35 ? '<rect x="' + (sg > 0 ? -400 : 200) + '" y="170" width="600" height="1000"/>' : '') + '</clipPath>';
      // a pele do rosto (região presa na cabeça) e o contorno: traço da cor do cabelo onde é cabelo, da pele onde é rosto
      var peleD = regiaoPele(radS, menino, TESTA[e.testa] || 0);
      // cabelo de trás: no alto quem mostra o cabelo é a própria cabeça (já é de cabelo); dele só aparece o que desce,
      // do meio da cabeça para baixo — assim não forma bico em cima. Coque, rabo, puffs e cachos ficam inteiros (passam da cabeça).
      var alto = ['coque', 'coqueDuplo', 'coqueBaguncado', 'meio', 'rabinhoAlto', 'rabinhoCachos', 'puffs', 'rabo', 'chiquinhas', 'afro', 'cacheado', 'cachosCurtos', 'encaracolado', 'lateral', 'armado', 'armadoLongo', 'cachosSoltos'].indexOf(e.cabelo) >= 0;
      // cabelo curto (não desce pelas costas): fica todo dentro do contorno da cabeça, sem "aba" sobrando de lado
      var ysT = (cabeloTras(e, I, cab, cabE).match(/,(-?\d*\.?\d+)/g) || []).map(function (t) { return +t.slice(1); }), curtoT = !alto && ysT.length && Math.max.apply(null, ysT) < 330;
      if (curtoT) defs += '<clipPath id="' + I + 'trasC"><path d="' + contorno(radS, 8, e.rosto, e.nariz, menino) + '"/></clipPath>'; else
      defs += '<clipPath id="' + I + 'trasC">' + (alto ? '<rect x="-400" y="-400" width="1200" height="1400"/>' : '<path d="M-400,1400 L-400,0 Q200,330 800,0 L800,1400Z"/>' + (cos < 0 ? '<path d="' + contorno(radS, -3, e.rosto, e.nariz, menino) + '"/>' : '')) + '</clipPath>';
      defs += '<clipPath id="' + I + 'peleR"><path d="' + peleD + '"/></clipPath>';
      // mecha do lado de lá (vai para trás da cabeça) e orelhas que ficam atrás do rosto
      s += hf.atras;
      if (zF > -0.35) s += orelha(xF, 12, false, -sg);
      if (zE <= 0.3) s += orelha(xE, 12, false, sg);
      s += p(cont, { fill: 'none', stroke: cabE, 'stroke-width': 3.4, 'stroke-linejoin': 'round' }) + '<g clip-path="url(#' + I + 'peleR)">' + p(cont, { fill: 'none', stroke: peleE, 'stroke-width': 3.4, 'stroke-linejoin': 'round' }) + '</g>';
      // a cabeça toda é cabelo (com fios que giram junto) e a pele vai por cima
      s += p(cont, { fill: 'url(#' + I + 'cab)' }) + '<g clip-path="url(#' + I + 'rostoV)">' + fiosCabeca() + p('M146,126 Q200,104 254,126', { fill: 'none', stroke: '#fff', 'stroke-width': 13, opacity: 0.13, 'stroke-linecap': 'round' }) + p('M156,123 Q200,106 244,123', { fill: 'none', stroke: '#fff', 'stroke-width': 4, opacity: 0.3, 'stroke-linecap': 'round' }) +
        p(peleD, { fill: 'url(#' + I + 'pele)' }) + p(peleD, { fill: 'url(#' + I + 'sombCab)' }) +
        p(peleD, { fill: 'none', stroke: cabE, 'stroke-width': 1.8, opacity: 0.5, 'stroke-linejoin': 'round' }) + '</g>';
      // maquiagem e feições: só onde é pele
      var fe = '';
      if (e.base === 'natural') fe += p(peleD, { fill: mistura(pele, '#ffd9c7', 0.3), opacity: 0.45 });
      if (e.base === 'bronze') fe += p(peleD, { fill: '#c8743f', opacity: 0.13 });
      var bs = e.base === 'natural' ? '' : base(e.base, pele, rosto); if (e.base === 'bronze') bs = bs.replace(/^<path[^>]*\/>/, '');
      var xn = xa(0, 84), cn = esc(pele, 0.28);
      defs += '<linearGradient id="' + I + 'sombV" gradientUnits="userSpaceOnUse" x1="' + n(xn - sg * 6) + '" y1="0" x2="' + n(xn + sg * 70) + '" y2="0"><stop offset="0" stop-color="#e88a90" stop-opacity="0"/><stop offset="1" stop-color="#e88a90" stop-opacity="' + n(0.14 * as) + '"/></linearGradient>';
      var lados = luzLados(pele, menino) + bs +
        blush(e, C('blush').hex, I) + (e.glitter === 'bochechas' || e.glitter === 'olhos' ? glitter(e, C('glitter')) : '') + (vis('adesivo') ? adesivo(e.adesivo, 266, 250, 13) : '');
      var olhar = sen * 11;
      var azO = 26.3 + dO * 0.62;
      fe += proj(lados + deslocar(-dO, olho(164, -1, e, I, C, olhar, op.anim) + sobr(164, -1)), 164 - dO, -azO, 81.4, 'mE');
      fe += proj(lados + deslocar(dO, olho(236, 1, e, I, C, olhar, op.anim) + sobr(236, 1)), 236 + dO, azO, 81.4, 'mD');
      fe += p(peleD, { fill: 'url(#' + I + 'sombV)' });
      // nariz: a curvinha de frente some aos poucos e aparece a lateral do nariz
      if (cos > 0.05) fe += '<g opacity="' + n(cos) + '">' + proj(narizFrente(e.nariz, pele), 200, 0, 84, null, 0.05) + '</g>';
      if (as > 0.12 && cos > -0.2) fe += linha('M' + n(xn - sg * 9 * as) + ',226 Q' + n(xn - sg * 2 * as) + ',240 ' + n(xn - sg * 6 * as) + ',250', cn, 2, n(Math.min(0.55, as)) ) +
        linha('M' + n(xn - sg * 11 * as) + ',250 Q' + n(xn - sg * 7 * as) + ',245 ' + n(xn - sg * 3 * as) + ',251', cn, 2.2, n(Math.min(0.8, as * 1.2)));
      fe += proj(formaDaBoca(e, boca(e, C('batom'), pele, I)), 200, 0, menino ? 68 : 60, null, -0.3);
      s += '<g clip-path="url(#' + I + 'rostoV)"><g clip-path="url(#' + I + 'peleR)">' + fe + '</g></g>';
      // de costas, o cabelo de trás cai por cima da cabeça e das costas
      if (cos < 0) s += '<g clip-path="url(#' + I + 'trasC)">' + torcer(cabeloTras(e, I, cab, cabE), true, radS) + '</g>';
      // cabelo da frente: gira junto com o rosto; o que passaria da cabeça do lado para onde ela olha é cortado
      // virando, do lado de cá da têmpora a franja termina na linha do cabelo
      if (cos > -0.1) {
        var xT = xa(-sg * 56, 86), xP = xa(-sg * 34, 86) + sg * 6, xH = xa(-sg * 44, 86), mv = -sg * 300 * (1 - Math.min(1, as / 0.4)), xL = 200 + sg * 900;
        defs += '<clipPath id="' + I + 'cabY"><path d="M' + n(xL) + ',-200 L' + n(xP + sg * 64 + mv) + ',-200 L' + n(xP + mv) + ',116 Q' + n(xH + mv) + ',134 ' + n(xT + mv) + ',168 Q' + n(xT + sg * 4 + mv) + ',204 ' + n(xT + sg * 16 + mv) + ',240 L' + n(xT + sg * 30 + mv) + ',900 L' + n(xL) + ',900Z"/></clipPath>';
        s += '<g clip-path="url(#' + I + 'cabF)"><g clip-path="url(#' + I + 'cabY)">' + hf.frente + '</g></g>';
      }
      s += hf.lado;
      // orelha do lado de cá (com o desenho de dentro), por cima do cabelo, como cabelo preso atrás da orelha
      if (zE > 0.3) s += orelha(xE, 11 + 6 * zE, true, sg);
      // brincos nas orelhas que aparecem
      if (vis('brincos')) {
        if (zE > -0.35) s += '<g transform="translate(' + n(xE - (sg > 0 ? 116 : 284)) + ' 0)">' + brincos(e.brincos, C('brincos'), I, sg > 0, sg < 0) + '</g>';
        if (zF > -0.35 && zF < 0.3 && as < 0.75) s += '<g transform="translate(' + n(xF - (sg > 0 ? 284 : 116)) + ' 0)">' + brincos(e.brincos, C('brincos'), I, sg < 0, sg > 0) + '</g>';
      }
      // óculos: cada lente vai com o seu olho; de lado aparece a haste até a orelha
      if (vis('oculos')) {
        var azO2 = 26.3 + dO * 0.62, oc = oculos(e.oculos, C('oculos'), dO), kO = Math.cos(-sg * azO2 * G + rad), xO = xa(-sg * azO2, 81.4);
        s += proj(oc, 164 - dO, -azO2, 81.4, 'mE', 0.05) + proj(oc, 236 + dO, azO2, 81.4, 'mD', 0.05);
        if (as > 0.3 && kO > 0.05) s += linha('M' + n(xO - sg * 26 * Math.max(kO, 0.3)) + ',208 L' + n(xE + sg * 6) + ',206', C('oculos').hex, 3.5);
      }
      return s;
    }
    function orelha(x, w, detalhe, fr) {
      var s = elip(x, 216, w, 17, { fill: pele, stroke: peleE, 'stroke-width': 2 });
      if (detalhe) s += p('M' + n(x + fr * w * 0.3) + ',205 Q' + n(x - fr * w * 0.75) + ',203 ' + n(x - fr * w * 0.45) + ',218 Q' + n(x - fr * w * 0.25) + ',229 ' + n(x + fr * w * 0.25) + ',229', { fill: 'none', stroke: esc(pele, 0.3), 'stroke-width': 2, 'stroke-linecap': 'round' }) +
        elip(x + fr * w * 0.12, 219, w * 0.32, 6, { fill: esc(pele, 0.14), opacity: 0.7 });
      return s;
    }
    /* fios do cabelo na cabeça: "meridianos" presos na cabeça, que giram junto (só a parte do lado de cá aparece) */
    function fiosCabeca() {
      var d1 = '', d2 = '';
      for (var k = 0; k < 12; k++) {
        var az = (k * 30 + 15) * Math.PI / 180, pts = [];
        for (var y = 104; y <= 300; y += 14) { var a2 = az + radS, c2 = Math.cos(a2); if (c2 < 0.05) { pts = null; break; } pts.push(n(200 + raioCabeca(y, menino) * Math.sin(a2)) + ',' + y); }
        if (pts && pts.length > 2) { if (k % 2) d2 += 'M' + pts.join(' L'); else d1 += 'M' + pts.join(' L'); }
      }
      return (d1 ? p(d1, { fill: 'none', stroke: cabE, 'stroke-width': 1.6, opacity: 0.4, 'stroke-linejoin': 'round' }) : '') + (d2 ? p(d2, { fill: 'none', stroke: '#fff', 'stroke-width': 1.8, opacity: 0.14, 'stroke-linejoin': 'round' }) : '');
    }

    function fechar() {
      var w = op.largura, h = op.altura;
      // realce (palco e TV): cenário levemente desfocado atrás e a personagem com sombra macia — tira o "papel recortado"
      var realce = op.realce !== undefined ? op.realce : (fundo && !op.soFundo);
      if (realce && out.length > 1) {
        var cen = out.shift();
        out = ['<g filter="url(#' + I + 'desf)">' + cen + '</g>' + ret(0, 0, W, H, { fill: 'url(#' + I + 'luzE)' }), '<g filter="url(#' + I + 'somb)">' + out.join('') + '</g>'];
      }
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + area.join(' ') + '"' + (w ? ' width="' + w + '" height="' + h + '"' : '') +
        // sem cenário, o braço que estica (apontando, tchau) não é cortado na borda do desenho
        ' preserveAspectRatio="xMidYMid ' + (op.cortar ? 'slice' : 'meet') + '"' + (fundo || op.soFundo ? '' : ' overflow="visible"') + '><defs>' + defs + '</defs>' + out.join('') + '</svg>';
    }
  }

  // ---------- gradientes e estampas ----------
  function defsSvg(e, I, pele, cab) {
    var est = corAjustada(e, 'estampa').hex, padrao = '';
    var t = { patternUnits: 'userSpaceOnUse' };
    switch (e.estampa) {
      case 'bolinhas': padrao = '<pattern id="' + I + 'est" width="22" height="22"' + at(t) + '>' + circ(6, 6, 3.6, { fill: est }) + circ(17, 17, 3.6, { fill: est }) + '</pattern>'; break;
      case 'listras': padrao = '<pattern id="' + I + 'est" width="20" height="20"' + at(t) + '>' + ret(0, 0, 20, 7, { fill: est }) + '</pattern>'; break;
      case 'estrelas': padrao = '<pattern id="' + I + 'est" width="28" height="28"' + at(t) + '>' + p(estrela5(8, 9, 5, 2.2), { fill: est }) + p(estrela5(22, 22, 5, 2.2), { fill: est }) + '</pattern>'; break;
      case 'coracoes': padrao = '<pattern id="' + I + 'est" width="26" height="26"' + at(t) + '>' + p(coracao(7, 8, 4), { fill: est }) + p(coracao(20, 21, 4), { fill: est }) + '</pattern>'; break;
      case 'flores': padrao = '<pattern id="' + I + 'est" width="30" height="30"' + at(t) + '>' + flor(8, 8, 3.2, est, '#ffd23f') + flor(23, 23, 3.2, est, '#ffd23f') + '</pattern>'; break;
      case 'arcoiris': padrao = '<pattern id="' + I + 'est" width="30" height="30"' + at(t) + '>' + ['#ff5a6e', '#ffd23f', '#5cc46a', '#5ac8ff', '#b892ff'].map(function (c, k) { return ret(0, k * 6, 30, 6, { fill: c, opacity: 0.85 }); }).join('') + '</pattern>'; break;
      case 'oncinha': padrao = '<pattern id="' + I + 'est" width="30" height="30"' + at(t) + '>' + circ(7, 8, 3.6, { fill: 'none', stroke: est, 'stroke-width': 2.2 }) + circ(7, 8, 1.6, { fill: est, opacity: 0.6 }) + circ(22, 20, 4, { fill: 'none', stroke: est, 'stroke-width': 2.2 }) + circ(22, 20, 1.8, { fill: est, opacity: 0.6 }) + circ(17, 5, 1.8, { fill: est }) + circ(5, 24, 1.6, { fill: est }) + '</pattern>'; break;
      case 'xadrez': padrao = '<pattern id="' + I + 'est" width="24" height="24"' + at(t) + '>' + ret(0, 0, 9, 24, { fill: est, opacity: 0.45 }) + ret(0, 0, 24, 9, { fill: est, opacity: 0.45 }) + '</pattern>'; break;
    }
    var iris = corAjustada(e, 'olhos').hex;
    return padrao +
      // Nova Era (ilustração 2D, sem volume 3D): pele de cor lisa
      '<linearGradient id="' + I + 'pele"><stop offset="0" stop-color="' + pele + '"/><stop offset="1" stop-color="' + pele + '"/></linearGradient>' +
      // luz de desenho: uma faixa de luz de corte reto do lado esquerdo (a luz vem de cima, à esquerda)
      '<linearGradient id="' + I + 'lado" x1="0" y1="0" x2="1" y2="0"><stop offset=".04" stop-color="#fff" stop-opacity="0"/><stop offset=".2" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<filter id="' + I + 'somb" x="-30%" y="-15%" width="160%" height="135%"><feDropShadow dx="5" dy="9" stdDeviation="8" flood-color="#2a0a3c" flood-opacity=".38"/></filter>' +
      '<filter id="' + I + 'desf" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.2"/></filter>' +
      '<radialGradient id="' + I + 'luzE" cx=".3" cy=".2" r=".9"><stop offset="0" stop-color="#fff8e8" stop-opacity=".28"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#1a0630" stop-opacity=".28"/></radialGradient>' +
      // sombra de desenho: uma faixa lilás de corte reto do lado direito (18%, como na bíblia de estilo da pesquisa)
      '<linearGradient id="' + I + 'vol" x1="0" y1="0" x2="1" y2="0"><stop offset=".55" stop-color="#7a5ba8" stop-opacity="0"/><stop offset="1" stop-color="#7a5ba8" stop-opacity=".2"/></linearGradient>' +
      '<linearGradient id="' + I + 'shine" x1="0" y1="0" x2="1" y2="1"><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".6"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      // sombra que o cabelo faz na testa, logo abaixo da linha do cabelo
      '<radialGradient id="' + I + 'luzPele"><stop offset="0" stop-color="#ffe6c4" stop-opacity=".55"/><stop offset="1" stop-color="#ffe6c4" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + I + 'calorPele"><stop offset="0" stop-color="#c8452c" stop-opacity=".35"/><stop offset="1" stop-color="#c8452c" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + I + 'sombCab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + esc(cab, 0.45) + '" stop-opacity="' + n(0.32 + 0.3 * escuridao(pele)) + '"/><stop offset=".16" stop-color="' + esc(cab, 0.2) + '" stop-opacity="0"/></linearGradient>' +
      // branco do olho com volume (mais escuro em cima, onde a pálpebra faz sombra)
      '<linearGradient id="' + I + 'esclera" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9cde6"/><stop offset=".42" stop-color="#fff"/><stop offset="1" stop-color="#f6f1fb"/></linearGradient>' +
      gradienteCabelo(e, I, cab) +
      '<radialGradient id="' + I + 'iris" cx=".5" cy=".38" r=".6"><stop offset="0" stop-color="' + cla(iris, 0.35) + '"/><stop offset=".7" stop-color="' + iris + '"/><stop offset="1" stop-color="' + esc(iris, 0.45) + '"/></radialGradient>' +
      '<radialGradient id="' + I + 'blush"><stop offset="0" stop-color="' + corAjustada(e, 'blush').hex + '" stop-opacity=".8"/><stop offset="1" stop-color="' + corAjustada(e, 'blush').hex + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + I + 'lab" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="' + cla(corAjustada(e, 'batom').hex, 0.45) + '"/><stop offset="1" stop-color="' + corAjustada(e, 'batom').hex + '"/></radialGradient>' +
      '<clipPath id="' + I + 'olhoE"><path d="' + formaOlho(164) + '"/></clipPath><clipPath id="' + I + 'olhoD"><path d="' + formaOlho(236) + '"/></clipPath>';
  }

  // ---------- cabelo ----------
  // mechas: "pontas" e "arco" mudam o degradê do cabelo (vale para todos os cortes); "frente" desenha faixas
  function gradienteCabelo(e, I, cab) {
    // Nova Era: cor lisa, só uma sombra na raiz (o brilho vem das mechas de luz desenhadas)
    var m = corAjustada(e, 'mechas').hex, st = [[0, esc(cab, 0.14)], [0.14, cab], [1, cab]];
    if (e.mechas === 'pontas') st = [[0, cla(cab, 0.18)], [0.45, cab], [0.8, m], [1, cla(m, 0.2)]];
    if (e.mechas === 'arco') st = [[0, cla(cab, 0.18)], [0.4, cab], [0.55, '#ff7cc8'], [0.68, '#ffd76a'], [0.8, '#7ee8ff'], [0.92, '#b892ff'], [1, '#86ecc8']];
    return '<linearGradient id="' + I + 'cab" x1="0" y1="0" x2="0" y2="1">' + st.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join('') + '</linearGradient>';
  }
  function puff(cx, cy, r, f) { var s = circ(cx, cy, r, f); for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; s += circ(cx + Math.cos(a) * r * 0.85, cy + Math.sin(a) * r * 0.85, r * 0.32, f); } return s + circ(cx, cy, r * 0.8, { fill: f.fill }); }
  // mecha lisa do lado: a borda de dentro segue o contorno da bochecha e do queixo (não invade o rosto)
  var MECHA_LISA = 'M108,204 Q96,330 124,436 L146,430 Q142,350 142,300 Q134,276 122,252 Q117,236 117,222Z';
  // fios: linhas claras finas que dão textura de cabelo de verdade
  var FIOS = [[118, 1], [134, 1], [266, -1], [282, -1]].map(function (q) { return '<path d="M' + q[0] + ',236 Q' + (q[0] - q[1] * 8) + ',340 ' + (q[0] + q[1] * 4) + ',452" fill="none" stroke="#fff" stroke-width="1.4" opacity=".16"/>'; }).join('');
  var COSTAS_LONGO = 'M106,210 Q100,100 200,95 Q300,100 294,210 L306,472 Q200,494 94,472Z';
  // cacho de molinha: bolinhas alternadas para um lado e para o outro, com a voltinha desenhada por dentro
  function molinha(x, y0, q, r, f, cabE) {
    var s = '';
    for (var k = 0; k < q; k++) {
      var cx = x + (k % 2 ? r * 0.32 : -r * 0.32), cy = y0 + k * r * 1.3, rr = r * (1 - k * 0.03);
      s += elip(cx, cy, rr, rr * 0.85, f) + p('M' + n(cx - rr * 0.55) + ',' + n(cy - rr * 0.1) + ' Q' + n(cx) + ',' + n(cy + rr * 0.65) + ' ' + n(cx + rr * 0.55) + ',' + n(cy - rr * 0.1), { fill: 'none', stroke: cabE, 'stroke-width': 1.6, opacity: 0.55 }) +
        p('M' + n(cx - rr * 0.4) + ',' + n(cy - rr * 0.45) + ' Q' + n(cx) + ',' + n(cy - rr * 0.75) + ' ' + n(cx + rr * 0.35) + ',' + n(cy - rr * 0.5), { fill: 'none', stroke: '#fff', 'stroke-width': 1.4, opacity: 0.3 });
    }
    return s;
  }
  // textura de cachinhos: voltinhas claras e escuras espalhadas numa área
  function texturaCachos(cx, cy, rx, ry, q, cab, cabE, sem) {
    var r = sorteio(sem), s = '';
    for (var k = 0; k < q; k++) {
      var a = r() * Math.PI * 2, d = Math.sqrt(r()), x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d, t = 5 + r() * 4;
      s += p('M' + n(x - t) + ',' + n(y) + ' Q' + n(x) + ',' + n(y - t * 1.2) + ' ' + n(x + t) + ',' + n(y) + ' Q' + n(x) + ',' + n(y + t * 0.8) + ' ' + n(x - t * 0.3) + ',' + n(y - t * 0.2), { fill: 'none', stroke: k % 3 ? cabE : cla(cab, 0.35), 'stroke-width': 1.6, opacity: k % 3 ? 0.45 : 0.6 });
    }
    return s;
  }
  // cabelo armado (ondulado com volume): contorno ondulado que abre até os ombros, com as pontas virando cachos
  function armadoTras(ate, f, cab, cabE) {
    var lados = [], k, n0 = 7, s = '';
    var d = 'M104,206 Q96,104 200,96 Q304,104 296,206';
    for (k = 1; k <= n0; k++) { var t = k / n0, y = 206 + (ate - 216) * t, x = 296 + 46 * Math.sin(t * Math.PI * 0.9) + 8 + (k % 2 ? 12 : -6); d += ' Q' + n(x + 14) + ',' + n(y - (ate - 216) / n0 / 2) + ' ' + n(x) + ',' + n(y); }
    for (k = 6; k >= 0; k--) { var xb = 118 + k * 27.3; d += ' Q' + n(xb + 14) + ',' + n(ate + 22 + (k % 2) * 6) + ' ' + n(xb) + ',' + n(ate + (k % 2 ? 4 : -4)); }
    for (k = n0 - 1; k >= 0; k--) { var t2 = k / n0, y2 = 206 + (ate - 216) * t2, x2 = 104 - 46 * Math.sin(t2 * Math.PI * 0.9) - 8 - (k % 2 ? 12 : -6); d += ' Q' + n(x2 - 14) + ',' + n(y2 + (ate - 216) / n0 / 2) + ' ' + n(x2) + ',' + n(y2); }
    s += p(d + 'Z', f);
    // ondas por dentro e os cachinhos das pontas
    for (k = 0; k < 6; k++) { var xo = 112 + k * 35; s += p('M' + xo + ',' + (250 + (k % 2) * 20) + ' Q' + (xo - 14) + ',' + (ate - 120) + ' ' + (xo + 6) + ',' + (ate - 60) + ' Q' + (xo + 18) + ',' + (ate - 20) + ' ' + (xo - 4) + ',' + (ate + 6), { fill: 'none', stroke: cabE, 'stroke-width': 1.8, opacity: 0.45, 'stroke-linecap': 'round' }); }
    for (k = 0; k < 4; k++) { var xl = 130 + k * 47; s += p('M' + xl + ',' + (260 + k * 8) + ' Q' + (xl + 18) + ',' + (ate - 90) + ' ' + (xl - 2) + ',' + (ate - 30), { fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.18, 'stroke-linecap': 'round' }); }
    return s;
  }
  // fiozinhos soltos (frizz) em volta da cabeça: o "armadinho" de cabelo de criança de verdade
  function frizz(cabE, cab, sem) {
    var r = sorteio(sem || 5), s = '';
    for (var k = 0; k < 11; k++) {
      var a = -Math.PI * 0.92 + k * Math.PI * 0.84 / 10, R = 96 + r() * 6, x = 200 + Math.cos(a) * R * 1.04, y = 202 + Math.sin(a) * R;
      var L = 6 + r() * 7, x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L, cv = (r() - 0.5) * 14;
      s += p('M' + n(x) + ',' + n(y) + ' Q' + n((x + x2) / 2 + cv) + ',' + n((y + y2) / 2 - cv * 0.5) + ' ' + n(x2) + ',' + n(y2), { fill: 'none', stroke: k % 2 ? cabE : cab, 'stroke-width': 1, opacity: 0.35, 'stroke-linecap': 'round' });
    }
    return s;
  }
  /* ---------- cabelo em ilustração (Nova Era): fios desenhados ----------
     Por cima de qualquer penteado liso ou ondulado: fios finos saindo do alto da cabeça e descendo pelos lados, uns
     mais escuros e outros de luz, só dentro do próprio cabelo (máscara feita do desenho do penteado). Cacheado, afro e
     dreads já têm textura própria e ficam sem. */
  var SEM_FIOS = ['cacheado', 'cachosCurtos', 'afro', 'encaracolado', 'cachosSoltos', 'armado', 'armadoLongo', 'dreads', 'puffs', 'rabinhoCachos', 'careca', 'raspado'];
  function fiosIlustra(s, I, nome, e, cab, cabE) {
    if (!s || SEM_FIOS.indexOf(e.cabelo) >= 0) return '';
    var m = s.replace(/fill="(url\([^)]*\)|#[0-9a-fA-F]{3,6})"/g, 'fill="#fff"').replace(/stroke="#[0-9a-fA-F]{3,6}"/g, 'stroke="#fff"').replace(/ opacity="[^"]*"/g, '');
    var esc1 = '', luz = '';
    [-1, 1].forEach(function (sd) {
      for (var k = 0; k < 15; k++) {
        // os fios de luz ficam 2 px ao lado dos escuros
        var t = k / 14, dx = k % 2 ? 0 : 2, x0 = 200 + dx + sd * (3 + t * 26), y0 = 96 + t * 6;
        var d = 'M' + n(x0) + ',' + n(y0) + ' C' + n(200 + dx + sd * (34 + t * 62)) + ',' + n(104 + t * 14) + ' ' + n(200 + dx + sd * (78 + t * 30)) + ',' + n(168 + t * 20) + ' ' + n(200 + dx + sd * (84 + t * 28 + (k % 3) * 4)) + ',' + n(560);
        if (k % 2) esc1 += d; else luz += d;
      }
    });
    return '<mask id="' + I + nome + '" maskUnits="userSpaceOnUse" x="-200" y="-200" width="800" height="1200">' + m + '</mask><g mask="url(#' + I + nome + ')">' +
      p(esc1, { fill: 'none', stroke: cabE, 'stroke-width': 1.1, opacity: 0.4 }) + p(luz, { fill: 'none', stroke: cla(cab, 0.5), 'stroke-width': 1.3, opacity: 0.3 }) + '</g>';
  }
  // contorno do cabelo mais fino, como traço de ilustração
  function afinarCabelo(s, cabE) { return s ? s.split('stroke="' + cabE + '" stroke-width="2.2"').join('stroke="' + cabE + '" stroke-width="1.3"') : s; }
  function cabeloTras(e, I, cab, cabE) {
    var f = { fill: 'url(#' + I + 'cab)', stroke: cabE, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, s = '';
    switch (e.cabelo) {
      case 'cortina': case 'franjinha': case 'chiquinhasBaixas': s = e.cabelo === 'chiquinhasBaixas' ? '' : p(COSTAS_LONGO, f); break;
      case 'lob': s = p('M104,210 Q98,100 200,95 Q302,100 296,210 Q312,260 298,300 Q312,330 290,346 Q200,360 110,346 Q88,330 102,300 Q88,260 104,210Z', f); break;
      case 'rabinhoAlto': s = p('M206,72 Q304,60 302,172 Q298,282 268,364 Q276,272 262,182 Q250,112 206,98Z', f) + circ(200, 92, 26, f); break;
      case 'coqueBaguncado':
        if (e.cabeca !== 'chapeu' && e.cabeca !== 'gorro') { s = circ(200, 88, 32, f) + circ(178, 80, 16, f) + circ(222, 78, 15, f) + circ(206, 64, 14, f); s += p('M226,66 Q244,52 240,40 M174,64 Q160,52 166,40', { fill: 'none', stroke: cab, 'stroke-width': 4, 'stroke-linecap': 'round' }); }
        break;
      case 'cachosCurtos': for (var cc = 0; cc <= 18; cc++) { var ac = -0.5 + cc * (Math.PI + 1) / 18; s += circ(200 + Math.cos(ac) * 104, 210 - Math.sin(ac) * 104, 25, f); } break;
      case 'ondasLongas': s = p('M100,210 Q92,96 200,90 Q308,96 300,210 Q330,270 308,330 Q332,390 310,450 Q330,500 296,526 Q200,548 104,526 Q70,500 90,450 Q68,390 92,330 Q70,270 100,210Z', f); break;
      case 'dreads':
        s = p(COSTAS_LONGO, f);
        for (var dr = 0; dr < 15; dr++) { var dxr = 102 + dr * 14; s += p('M' + dxr + ',220 L' + (dxr + 2) + ',476', { fill: 'none', stroke: cabE, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: 0.6 }); }
        break;
      case 'ondasLado': s = p('M106,210 Q100,100 200,95 Q300,100 294,210 L300,300 Q200,290 110,260Z', f); break;
      case 'cacheadoLongo':
        s = p(COSTAS_LONGO, f);
        for (var rl = 0; rl < 10; rl++) { s += circ(96 + (rl % 2) * 6, 230 + rl * 25, 13, f) + circ(304 - (rl % 2) * 6, 230 + rl * 25, 13, f); }
        for (var rb = 0; rb < 9; rb++) s += circ(104 + rb * 24, 474 + (rb % 2) * 6, 13, f);
        break;
      case 'longo': case 'franja': case 'meio': s = p(COSTAS_LONGO, f) + FIOS;
        if (e.cabelo === 'meio' && e.cabeca !== 'chapeu' && e.cabeca !== 'gorro') s += circ(200, 98, 24, f) + linha2('M184,96 Q200,82 216,98', cabE);
        break;
      case 'afro': s = elip(200, 196, 124, 116, { fill: 'url(#' + I + 'cab)' }); for (var q = 0; q < 28; q++) { var aq = q / 28 * Math.PI * 2; s += circ(200 + Math.cos(aq) * 122, 196 + Math.sin(aq) * 112, 28, f); } s += elip(200, 196, 118, 110, { fill: 'url(#' + I + 'cab)' }); break;
      case 'puffs': s = puff(116, 118, 44, f) + puff(284, 118, 44, f); break;
      case 'pixie': s = p('M108,214 Q100,100 200,95 Q300,100 292,214 L284,246 L116,246Z', f); break;
      // sereia: a mais comprida, até perto do joelho (antes ia até o chão e, girando, parecia cabelo embaixo dos pés)
      case 'sereia': s = p('M104,210 Q98,100 200,95 Q302,100 296,210 Q318,266 300,322 Q322,378 304,434 Q326,490 300,546 Q200,566.8 100,546 Q74,490 96,434 Q78,378 100,322 Q82,266 104,210Z', f); break;
      case 'coqueDuplo': if (e.cabeca !== 'chapeu' && e.cabeca !== 'gorro') s = circ(138, 104, 33, f) + circ(262, 104, 33, f) + linha2('M118,100 Q138,82 158,100', cabE) + linha2('M242,100 Q262,82 282,100', cabE); break;
      case 'box':
        s = p('M104,210 Q98,100 200,95 Q302,100 296,210 L308,482 Q200,502 92,482Z', f);
        for (var b = 0; b < 17; b++) { var bx = 100 + b * 12.5; s += p('M' + bx + ',220 Q' + (bx + 4) + ',350 ' + (bx - 2) + ',486', { fill: 'none', stroke: cabE, 'stroke-width': 1.6, 'stroke-dasharray': '4 3', opacity: 0.7 }); }
        break;
      case 'ondulado': s = p('M106,210 Q100,100 200,95 Q300,100 294,210 Q314,260 297,302 Q318,348 300,392 Q320,432 296,452 Q200,478 104,452 Q80,432 100,392 Q82,348 103,302 Q86,260 106,210Z', f); break;
      case 'chanel': s = p('M104,210 Q100,100 200,95 Q300,100 296,210 L302,312 Q250,322 200,320 Q150,322 98,312Z', f); break;
      case 'cacheado':
        var r = sorteio(7);
        s += p('M96,230 Q92,330 120,350 L280,350 Q308,330 304,230Z', f);
        for (var i = 0; i <= 24; i++) { var a = -0.75 + i * (Math.PI + 1.5) / 24; s += circ(200 + Math.cos(a) * 112, 222 - Math.sin(a) * 118, 32 + r() * 8, f); }
        break;
      case 'rabo': s = p('M248,118 Q336,104 324,226 Q318,312 290,372 Q300,300 284,226 Q276,160 250,140Z', f) + circ(262, 128, 9, { fill: '#ff4fa3', stroke: '#c22a78', 'stroke-width': 2 }); break;
      case 'chiquinhas': s = dois('M120,158 Q58,176 66,292 Q72,364 100,410 Q94,324 106,262 Q114,210 134,180Z', f); break;
      case 'coque': if (e.cabeca !== 'chapeu' && e.cabeca !== 'gorro') s = circ(200, 96, 40, f) + linha2('M172,90 Q200,70 228,92', cabE) + linha2('M170,104 Q200,84 230,106', cabE); break;
      case 'trancas': s = ''; break;
      case 'armado': s = armadoTras(410, f, cab, cabE) + frizz(cabE, cab, 5); break;
      case 'cachosSoltos': s = armadoTras(420, f, cab, cabE) + texturaCachos(200, 330, 112, 90, 30, cab, cabE, 13) + frizz(cabE, cab, 7); break;
      case 'armadoLongo': s = armadoTras(500, f, cab, cabE) + frizz(cabE, cab, 9); break;
      case 'lisoPontas': s = p('M106,210 Q100,100 200,95 Q300,100 294,210 L300,404 Q304,444 272,446 Q248,446 250,424 L150,424 Q152,446 128,446 Q96,444 100,404Z', f) + FIOS; break;
      case 'lisoRepartido': s = p(COSTAS_LONGO, f) + FIOS; break;
      case 'chanelPontas': s = p('M104,210 Q100,100 200,95 Q300,100 296,210 Q304,268 300,302 Q296,330 268,330 L132,330 Q104,330 100,302 Q96,268 104,210Z', f); break;
      case 'pontasFora': s = p('M104,210 Q100,100 200,95 Q300,100 296,210 Q298,282 310,312 Q330,332 314,342 Q288,338 278,322 L122,322 Q112,338 86,342 Q70,332 90,312 Q102,282 104,210Z', f); break;
      case 'cachinhos':
        s = p('M102,210 Q98,100 200,95 Q302,100 298,210 L302,392 Q200,410 98,392Z', f);
        [96, 124, 152, 180, 208, 236, 264, 292, 306].forEach(function (x, k) { s += molinha(x, 300 + (k % 2) * 14, 6, 14, f, cabE); });
        break;
      case 'encaracolado':
        s = elip(200, 222, 130, 124, { fill: 'url(#' + I + 'cab)' });
        for (var en = 0; en <= 22; en++) { var ae = -0.35 + en * (Math.PI + 0.7) / 22; s += circ(200 + Math.cos(ae) * 124, 222 - Math.sin(ae) * 118, 26, f); }
        for (var eb = 0; eb < 8; eb++) s += circ(104 + eb * 27.5, 334 + (eb % 2) * 10, 24, f);
        s += elip(200, 226, 118, 112, { fill: 'url(#' + I + 'cab)' }) + texturaCachos(200, 230, 118, 110, 34, cab, cabE, 21);
        break;
      case 'rabinhoCachos':
        s = circ(200, 92, 24, f);
        for (var rc = 0; rc <= 9; rc++) { var trc = rc / 9; s += circ(214 + trc * 92 - trc * trc * 26, 102 + trc * 250, 23 - trc * 8, f); }
        s += texturaCachos(262, 230, 34, 120, 14, cab, cabE, 5);
        break;
      case 'curtinho': case 'topete': s = p('M110,200 Q102,100 200,94 Q298,100 290,200 Q292,226 276,234 Q200,246 124,234 Q108,226 110,200Z', f); break;   // nuca curtinha, orelhas à mostra
    }
    return s;
  }
  function linha2(d, c) { return p(d, { fill: 'none', stroke: c, 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.6 }); }
  function cabeloFrente(e, I, cab, cabE) {
    var f = { fill: 'url(#' + I + 'cab)', stroke: cabE, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, s = '', brilho = true;
    var franja = 'M108,222 Q104,102 200,99 Q296,102 292,222 Q290,160 244,128 C226,150 186,166 150,170 Q122,184 118,224Z';
    var liso = 'M110,214 Q104,104 200,100 Q296,104 290,214 Q284,146 236,126 Q214,122 200,116 Q186,122 164,126 Q116,146 110,214Z';
    switch (e.cabelo) {
      case 'longo': s = p(franja, f) + dois(MECHA_LISA, f); break;
      case 'ondulado': s = p(franja, f) + dois('M108,206 Q94,258 112,300 Q94,342 118,386 L140,382 Q124,340 142,302 Q126,272 120,250 Q116,232 116,220Z', f); break;
      case 'chanel': s = p('M106,238 Q100,102 200,97 Q300,102 294,238 L286,166 Q200,178 114,166Z', f) + dois('M104,200 L98,302 L128,306 Q122,270 118,240 L116,206Z', f); break;
      case 'cacheado':
        var r = sorteio(3);
        for (var i = 0; i < 9; i++) { var a = Math.PI * 1.08 + i * Math.PI * 0.84 / 8; s += circ(200 + Math.cos(a) * 82, 196 + Math.sin(a) * 78, 21 + r() * 6, f); }
        brilho = false; break;
      case 'rabo': case 'coque': case 'coqueDuplo': s = p(liso, f); break;
      case 'cortina': s = p('M110,214 Q104,104 200,100 Q296,104 290,214 Q284,164 250,148 Q222,140 204,124 L196,124 Q178,140 150,148 Q116,164 110,214Z', f) + dois(MECHA_LISA, f); break;
      case 'lob': s = p(franja, f) + dois('M108,206 Q94,258 112,300 Q100,330 118,346 L136,342 Q124,320 142,302 Q126,272 120,250 Q116,232 116,220Z', f); break;
      case 'rabinhoAlto': s = p(liso, f) + circ(200, 86, 10, { fill: '#ff4fa3', stroke: '#c22a78', 'stroke-width': 2 }); break;
      case 'coroaTranca':
        s = p(liso, f);
        for (var ct = 0; ct <= 14; ct++) { var tt = ct / 14, cx2 = (1 - tt) * (1 - tt) * 112 + 2 * (1 - tt) * tt * 200 + tt * tt * 288, cy2 = (1 - tt) * (1 - tt) * 196 + 2 * (1 - tt) * tt * 70 + tt * tt * 196; s += elip(cx2, cy2, 12, 9, Object.assign({ transform: 'rotate(' + Math.round(-60 + tt * 120) + ' ' + n(cx2) + ' ' + n(cy2) + ')' }, f)); }
        break;
      case 'coqueBaguncado': s = p(liso, f) + p('M126,176 Q112,222 124,262', { fill: 'none', stroke: cab, 'stroke-width': 4.5, 'stroke-linecap': 'round' }) + p('M274,176 Q288,222 276,262', { fill: 'none', stroke: cab, 'stroke-width': 4.5, 'stroke-linecap': 'round' }); break;
      case 'cachosCurtos': for (var c4 = 0; c4 < 9; c4++) { var a4 = Math.PI * 1.1 + c4 * Math.PI * 0.8 / 8; s += circ(200 + Math.cos(a4) * 84, 192 + Math.sin(a4) * 76, 16, f); } brilho = false; break;
      case 'ondasLongas': s = p(franja, f) + dois('M108,206 Q92,260 112,310 Q92,360 116,410 Q96,460 120,510 L140,506 Q120,460 138,410 Q118,360 142,312 Q126,276 120,252 Q116,232 116,220Z', f); break;
      case 'franjinha': s = p('M108,236 Q100,102 200,97 Q300,102 292,236 L284,150 Q200,158 116,150Z', f) + dois(MECHA_LISA, f); break;
      case 'chiquinhasBaixas':
        s = p('M110,214 Q104,104 200,100 Q296,104 290,214 Q280,150 206,128 L200,104 L194,128 Q120,150 110,214Z', f) + dois('M116,236 Q82,282 94,362 Q102,412 124,444 Q118,382 122,322 Q126,282 136,256Z', f);
        s += circ(124, 248, 8, { fill: '#ff4fa3', stroke: '#c22a78', 'stroke-width': 2 }) + circ(276, 248, 8, { fill: '#ff4fa3', stroke: '#c22a78', 'stroke-width': 2 });
        break;
      case 'dreads':
        s = p('M110,214 Q104,104 200,100 Q296,104 290,214 Q280,150 206,128 L200,104 L194,128 Q120,150 110,214Z', f);
        [-1, 1].forEach(function (ld) { for (var kd = 0; kd < 3; kd++) { var xd = 200 + ld * (98 - kd * 7); s += p('M' + xd + ',206 Q' + (xd + ld * 6) + ',320 ' + (xd - ld * 2) + ',' + (430 - kd * 10), { fill: 'none', stroke: cab, 'stroke-width': 9, 'stroke-linecap': 'round' }) + p('M' + xd + ',206 Q' + (xd + ld * 6) + ',320 ' + (xd - ld * 2) + ',' + (430 - kd * 10), { fill: 'none', stroke: cabE, 'stroke-width': 9, 'stroke-dasharray': '2 9', opacity: 0.5 }) + ret(xd - ld * 2 - 5, 380 - kd * 20, 10, 6, { fill: '#f2c14e', rx: 2 }); } });
        break;
      case 'ondasLado':
        s = p('M108,226 Q104,100 200,98 Q296,100 294,210 Q280,146 230,140 Q180,150 150,176 Q124,196 116,226Z', f) +
          p('M262,140 Q332,188 314,280 Q334,340 306,400 Q322,452 292,484 L264,474 Q288,424 272,382 Q292,322 274,272 Q290,220 252,184Z', f);
        break;
      case 'cacheadoLongo':
        s = p(franja, f);
        for (var r5 = 0; r5 < 9; r5++) { s += circ(112 - (r5 % 2) * 3, 226 + r5 * 26, 11, f) + circ(288 + (r5 % 2) * 3, 226 + r5 * 26, 11, f); }
        break;
      case 'franja': s = p('M106,238 Q100,102 200,97 Q300,102 294,238 L286,166 Q200,178 114,166Z', f) + dois(MECHA_LISA, f); break;
      case 'meio': s = p(franja, f) + dois(MECHA_LISA, f); break;
      case 'afro': s = p('M110,206 Q106,112 200,106 Q294,112 290,206 Q280,150 200,142 Q120,150 110,206Z', f); for (var h = 0; h < 7; h++) s += circ(132 + h * 22.5, 140 - Math.sin(h / 6 * Math.PI) * 18, 12, f); brilho = false; break;
      case 'puffs': s = p(liso, f) + circ(140, 132, 8, { fill: '#ff4fa3', stroke: '#c22a78', 'stroke-width': 2 }) + circ(260, 132, 8, { fill: '#ff4fa3', stroke: '#c22a78', 'stroke-width': 2 }); break;
      case 'lateral': s = p(liso, f) + p('M118,160 Q72,190 82,282 Q88,352 120,404 Q112,322 114,262 Q114,212 124,180Z', f) + circ(120, 168, 9, { fill: '#ff4fa3', stroke: '#c22a78', 'stroke-width': 2 }); break;
      case 'trancaLado':
        s = p(liso, f);
        for (var tl = 0; tl < 11; tl++) s += elip(110 + tl * 3.4 + (tl % 2 ? 4 : -4), 232 + tl * 23, 17 - tl * 0.5, 14, f);
        s += circ(146, 488, 8, { fill: '#ff4fa3', stroke: '#c22a78', 'stroke-width': 2 });
        break;
      case 'pixie': s = p('M108,224 Q104,100 200,98 Q296,100 292,224 Q290,170 268,150 Q220,182 150,156 Q124,176 116,226Z', f) + dois('M110,198 L106,252 L121,246 L118,206Z', f); break;
      case 'sereia': s = p(franja, f) + dois('M108,206 Q92,260 112,310 Q92,360 116,410 Q96,460 120,510 L140,506 Q120,460 138,410 Q118,360 142,312 Q126,276 120,252 Q116,232 116,220Z', f); break;
      case 'box':
        s = p('M110,214 Q104,104 200,100 Q296,104 290,214 Q280,150 206,128 L200,104 L194,128 Q120,150 110,214Z', f);
        [-1, 1].forEach(function (lado) { for (var k = 0; k < 4; k++) { var x0 = 200 + lado * (96 - k * 5); s += p('M' + x0 + ',214 Q' + (x0 + lado * 8) + ',330 ' + (x0 - lado * 2) + ',' + (452 - k * 8), { fill: 'none', stroke: cab, 'stroke-width': 7, 'stroke-linecap': 'round' }) + p('M' + x0 + ',214 Q' + (x0 + lado * 8) + ',330 ' + (x0 - lado * 2) + ',' + (452 - k * 8), { fill: 'none', stroke: cabE, 'stroke-width': 2, 'stroke-dasharray': '3 4' }) + circ(x0 - lado * 2, 456 - k * 8, 4, { fill: ['#ffd23f', '#ff5fb4', '#7ee8ff', '#fff'][k] }); } });
        break;
      case 'chiquinhas': s = p(franja, f) + circ(118, 168, 9, { fill: '#ff4fa3', stroke: '#c22a78', 'stroke-width': 2 }) + circ(282, 168, 9, { fill: '#ff4fa3', stroke: '#c22a78', 'stroke-width': 2 }); break;
      case 'lisoPontas':
        s = p('M110,222 Q104,104 200,100 Q296,104 290,222 Q282,150 236,128 Q212,122 200,112 Q188,122 164,128 Q118,150 110,222Z', f) +
          dois('M108,206 Q96,300 104,382 Q106,414 132,416 Q150,414 146,398 Q130,400 132,380 Q136,320 140,300 Q132,276 122,252 Q117,236 117,222Z', f) +
          dois('M112,384 Q118,404 134,406', { fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.3, 'stroke-linecap': 'round' });
        break;
      case 'lisoRepartido':
        s = p('M110,222 Q104,104 200,100 Q296,104 290,222 Q282,150 236,128 Q212,122 200,112 Q188,122 164,128 Q118,150 110,222Z', f) + dois(MECHA_LISA, f) +
          p('M200,100 L200,114', { stroke: cabE, 'stroke-width': 2, 'stroke-linecap': 'round' }) + dois('M168,112 Q140,124 126,160', { fill: 'none', stroke: '#fff', 'stroke-width': 5, opacity: 0.25, 'stroke-linecap': 'round' });
        brilho = false; break;
      case 'chanelPontas':
        s = p('M106,232 Q100,102 200,97 Q300,102 294,232 Q286,170 246,150 Q210,166 150,150 Q118,170 112,232Z', f) +
          dois('M104,204 Q96,268 100,298 Q104,324 130,324 Q142,322 140,310 Q124,308 124,290 Q124,262 120,240 L116,206Z', f);
        break;
      case 'pontasFora': s = p(franja, f) + dois('M108,206 Q102,270 94,306 Q80,328 96,336 Q116,330 124,310 Q128,280 120,250 Q116,232 116,220Z', f); break;
      case 'cachinhos':
        s = p(franja, f);
        for (var mf = 0; mf < 7; mf++) s += circ(146 + mf * 18, 146 + Math.abs(mf - 3) * 3, 11, f);
        s += molinha(110, 232, 7, 11, f, cabE) + molinha(290, 232, 7, 11, f, cabE);
        brilho = false; break;
      case 'encaracolado':
        s = p(liso, f);
        for (var ef = 0; ef < 9; ef++) { var aef = Math.PI * 1.08 + ef * Math.PI * 0.84 / 8; s += circ(200 + Math.cos(aef) * 86, 198 + Math.sin(aef) * 82, 17, f); }
        [[108, 230], [102, 262], [108, 294], [292, 230], [298, 262], [292, 294]].forEach(function (q) { s += circ(q[0], q[1], 17, f); });
        s += texturaCachos(200, 130, 80, 22, 10, cab, cabE, 9);
        brilho = false; break;
      case 'rabinhoCachos': s = p(liso, f) + circ(200, 86, 11, { fill: '#ff8fc8', stroke: '#c22a78', 'stroke-width': 2 }) + p('M192,84 Q200,78 208,84', { fill: 'none', stroke: '#fff', 'stroke-width': 1.6, opacity: 0.6 }); break;
      case 'curtinho': s = p('M112,198 Q104,100 200,94 Q296,100 288,198 Q286,172 274,158 Q264,150 252,158 Q240,142 222,150 Q206,138 190,150 Q172,140 158,154 Q144,148 132,160 Q118,170 112,198Z', f) + p('M150,118 Q200,104 250,118', { fill: 'none', stroke: '#fff', 'stroke-width': 5, opacity: 0.22, 'stroke-linecap': 'round' }); brilho = false; break;   // franjinha curta repicada, lados acima da orelha
      case 'topete':
        s = p('M112,198 Q104,100 200,94 Q296,100 288,198 Q286,172 274,158 Q264,150 252,158 Q240,142 222,150 Q206,138 190,150 Q172,140 158,154 Q144,148 132,160 Q118,170 112,198Z', f) +
          p('M138,142 Q142,98 194,90 Q248,86 266,116 Q250,106 230,110 Q208,114 192,128 Q172,136 158,152Z', f) + p('M160,120 Q192,96 236,100', { fill: 'none', stroke: '#fff', 'stroke-width': 4, opacity: 0.3, 'stroke-linecap': 'round' }) +
          p('M170,128 Q200,108 244,110', { fill: 'none', stroke: cabE, 'stroke-width': 1.6, opacity: 0.5, 'stroke-linecap': 'round' });
        break;
      case 'cachosSoltos':
        // risca no meio, sem franja: a testa fica à mostra e os cachos soltos caem dos lados do rosto, em molinhas
        s = p('M108,230 Q100,102 200,98 Q300,102 292,230 Q290,174 266,150 Q238,130 208,128 Q201,126 200,118 Q199,126 192,128 Q162,130 134,150 Q110,174 108,230Z', f) +
          dois('M110,200 Q102,226 106,250 L124,254 Q120,230 122,206Z', f) + molinha(110, 252, 8, 13, f, cabE) + molinha(290, 252, 8, 13, f, cabE) +
          molinha(126, 300, 5, 11, f, cabE) + molinha(274, 300, 5, 11, f, cabE) +
          dois('M188,120 Q160,128 140,150', { fill: 'none', stroke: cabE, 'stroke-width': 1.4, opacity: 0.45, 'stroke-linecap': 'round' }) +
          dois('M176,110 Q150,116 132,134', { fill: 'none', stroke: '#fff', 'stroke-width': 4, opacity: 0.2, 'stroke-linecap': 'round' });
        brilho = false; break;
      case 'armado': case 'armadoLongo':
        // risca no meio: as duas metades descem pelos lados da testa e caem onduladas ao lado do rosto (cortina)
        var fim = e.cabelo === 'armado' ? 360 : 430;
        s = p('M108,230 Q100,102 200,98 Q300,102 292,230 Q290,174 266,150 Q238,130 208,128 Q201,126 200,118 Q199,126 192,128 Q162,130 134,150 Q110,174 108,230Z', f) +
          dois('M110,200 Q92,250 106,286 Q88,318 104,' + (fim - 30) + ' Q96,' + (fim - 6) + ' 116,' + fim + ' Q132,' + (fim + 4) + ' 136,' + (fim - 14) + ' Q120,' + (fim - 30) + ' 128,' + (fim - 60) + ' Q140,320 130,290 Q142,262 130,238 Q122,222 120,206Z', f) +
          dois('M112,240 Q100,280 114,300 Q102,330 116,' + (fim - 50), { fill: 'none', stroke: cabE, 'stroke-width': 1.6, opacity: 0.5, 'stroke-linecap': 'round' }) +
          dois('M188,120 Q160,128 140,150', { fill: 'none', stroke: cabE, 'stroke-width': 1.4, opacity: 0.45, 'stroke-linecap': 'round' }) +
          dois('M176,110 Q150,116 132,134', { fill: 'none', stroke: '#fff', 'stroke-width': 4, opacity: 0.2, 'stroke-linecap': 'round' });
        brilho = false; break;
      case 'trancas':
        s = p('M110,214 Q104,104 200,100 Q296,104 290,214 Q280,150 206,128 L200,104 L194,128 Q120,150 110,214Z', f);
        for (var k = 0; k < 10; k++) {
          var y = 236 + k * 23, dx = (k % 2 ? 4 : -4) + k * 1.6;
          s += elip(110 + dx, y, 16 - k * 0.4, 14, f) + elip(290 - dx, y, 16 - k * 0.4, 14, f);
        }
        s += circ(126, 470, 8, { fill: '#ff4fa3', stroke: '#c22a78', 'stroke-width': 2 }) + circ(274, 470, 8, { fill: '#ff4fa3', stroke: '#c22a78', 'stroke-width': 2 });
        break;
    }
    if (e.mechas === 'frente') { var mc = corAjustada(e, 'mechas').hex; s += p('M152,112 Q136,150 124,214', { fill: 'none', stroke: mc, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.9 }) + p('M246,110 Q266,148 278,210', { fill: 'none', stroke: mc, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.9 }); }
    // brilho do cabelo em ilustração: mechas de luz finas que seguem a curva da cabeça (no lugar da faixa larga)
    if (brilho) s += p('M150,124 Q176,108 196,106 M162,130 Q182,116 198,114 M250,124 Q224,108 204,106 M238,130 Q218,116 202,114', { fill: 'none', stroke: '#fff', 'stroke-width': 2.2, 'stroke-linecap': 'round', opacity: 0.3 });
    return s;
  }

  // ---------- cabeça girada: volumes redondos (crânio, rosto, queixo, nariz, lábios) e cabelo que gira junto ----------
  /* A cabeça é feita de volumes de verdade — elipsoides em 3D, em volta do centro (200, 205) — e cada um, girado
     em torno do eixo de cima para baixo, aparece no desenho como uma elipse. O contorno é a união dessas elipses:
     fica sempre redondinho e liso, e o nariz, os lábios e o queixo só "saem" da borda quando ela está quase de lado,
     como numa cabeça de verdade. c = centro (x, y, z para a frente), r = raios. */
  var VOLUMES = {
    oval: [{ c: [0, -8, -4], r: [86, 90, 90] }, { c: [0, 42, 16], r: [70, 52, 62] }, { c: [0, 77, 50], r: [17, 11, 15] }],
    redondo: [{ c: [0, -6, -4], r: [88, 88, 90] }, { c: [0, 38, 16], r: [76, 50, 62] }, { c: [0, 74, 48], r: [20, 10, 14] }],
    coracao: [{ c: [0, -10, -4], r: [88, 90, 90] }, { c: [0, 44, 18], r: [62, 54, 58] }, { c: [0, 83, 48], r: [14, 11, 14] }],
    fininho: [{ c: [0, -8, -4], r: [80, 94, 88] }, { c: [0, 46, 16], r: [62, 56, 60] }, { c: [0, 83, 48], r: [15, 11, 14] }],
    bochechudo: [{ c: [0, -8, -4], r: [86, 90, 90] }, { c: [0, 42, 16], r: [70, 52, 62] }, { c: [0, 77, 50], r: [17, 11, 15] }, { c: [-44, 34, 30], r: [38, 32, 34] }, { c: [44, 34, 30], r: [38, 32, 34] }],
    largo: [{ c: [0, -8, -4], r: [92, 88, 90] }, { c: [0, 36, 14], r: [80, 50, 62] }, { c: [0, 72, 48], r: [18, 11, 14] }],
    quadradinho: [{ c: [0, -8, -4], r: [88, 88, 90] }, { c: [0, 40, 14], r: [78, 54, 60] }, { c: [-30, 64, 34], r: [26, 22, 26] }, { c: [30, 64, 34], r: [26, 22, 26] }, { c: [0, 76, 46], r: [22, 11, 14] }],
    comprido: [{ c: [0, -10, -4], r: [82, 94, 88] }, { c: [0, 48, 14], r: [64, 60, 60] }, { c: [0, 87, 46], r: [16, 12, 14] }]
  };
  var NARIZ_V = {
    botao: [{ c: [0, 30, 78], r: [6, 11, 7] }, { c: [0, 38, 83], r: [6.5, 6, 7] }],
    arrebitado: [{ c: [0, 30, 78], r: [6, 10, 7] }, { c: [0, 35, 85], r: [6, 5.5, 7] }],
    fininho: [{ c: [0, 28, 79], r: [4.5, 14, 7] }, { c: [0, 38, 83], r: [5, 5, 6] }],
    redondinho: [{ c: [0, 31, 78], r: [6, 10, 7] }, { c: [0, 39, 82], r: [9, 8, 9] }],
    pequenino: [{ c: [0, 33, 78], r: [5, 8, 6] }, { c: [0, 38, 81], r: [5, 5, 5] }],
    batatinha: [{ c: [0, 30, 78], r: [6, 10, 7] }, { c: [0, 39, 82], r: [11, 9, 10] }],
    largo: [{ c: [0, 31, 78], r: [8, 11, 7] }, { c: [0, 39, 81], r: [10, 7, 8] }],
    reto: [{ c: [0, 26, 80], r: [5, 16, 7] }, { c: [0, 38, 84], r: [6, 6, 6] }]
  };
  var LABIOS_V = [{ c: [0, 61, 67], r: [13, 6, 7] }, { c: [0, 69, 65], r: [11, 6, 7] }];
  // contorno da cabeça girada de th (radianos; + olha para a direita): união das elipses; extra = folga (volume do cabelo)
  function contorno(th, extra, forma, nariz, menino) {
    var base0 = VOLUMES[forma] || VOLUMES.oval;
    /* menina: queixinho pequeno e recolhido (de lado não fica "queixudo") e maxilar suave — o cantinho do rosto
       quadradinho fica mais alto e redondinho. Continua sendo cada formato, só que delicado. */
    if (!menino) base0 = base0.map(function (v) {
      if (v.c[0] === 0 && v.c[1] >= 70) return { c: [0, v.c[1] - 12, v.c[2] - 24], r: [v.r[0] * 1.05, v.r[1] * 0.85, v.r[2] * 0.6] };   // queixinho redondo e curto, nada de ponta
      if (v.c[0] === 0 && v.c[1] >= 30 && v.c[1] < 70) return { c: [0, v.c[1] - 8, v.c[2] - 8], r: [v.r[0] * 1.0, v.r[1] * 0.72, v.r[2] * 0.9] };   // maxilar curto e arredondado (dono, 20/Nov/2026: "queixo ainda masculino"): bochecha cheia, sem rosto comprido
      // (20/Nov/2026, dono: "queixo de mulheres não femininos"): o crânio termina mais alto, para o rosto não fechar em "U"
      // largo; quem desenha a parte de baixo é o maxilar, que afina em V suave até um queixinho delicado
      if (v.c[0] === 0 && v.c[1] < 0) return { c: [0, v.c[1] - 6, v.c[2]], r: [v.r[0], v.r[1] - 8, v.r[2]] };
      if (v.c[0] !== 0 && v.c[1] >= 60) return { c: [v.c[0] * 0.85, v.c[1] - 10, v.c[2] - 6], r: [v.r[0] * 0.85, v.r[1] * 0.8, v.r[2] * 0.85] };
      return v;
    });
    // menina: os lábios acompanham o maxilar (um pouco para trás e menores), sem ficar "bicudo" de lado
    // pela idade: maxilar mais estreito e queixo menor e mais baixo nas mais velhas (rosto oval, natural)
    base0 = base0.map(function (v, k) {
      if (k === 1) return { c: [v.c[0], v.c[1] + IDADE.queixoY * 0.5, v.c[2]], r: [v.r[0] * IDADE.maxilar, v.r[1], v.r[2]] };
      if (k === 2 && v.c[0] === 0) return { c: [v.c[0], v.c[1] + IDADE.queixoY, v.c[2]], r: [v.r[0] * IDADE.queixoL, v.r[1], v.r[2]] };
      return v;
    });
    var lab = menino ? LABIOS_V : LABIOS_V.map(function (v) { return { c: [0, v.c[1] - 1, v.c[2] - 9], r: [v.r[0] * 0.92, v.r[1] * 0.85, v.r[2] * 0.85] }; });
    var vs = base0.concat(NARIZ_V[nariz] || NARIZ_V.botao, lab), c = Math.cos(th), s = Math.sin(th), d = '';
    // menino: queixo e maxilar um pouquinho mais largos (sem exagero)
    if (menino) vs = vs.map(function (v, k) { return k === 1 || k === 2 ? { c: v.c, r: [v.r[0] + (k === 1 ? 5 : 4), v.r[1], v.r[2]] } : v; });
    vs.forEach(function (v) {
      var x = 200 + v.c[0] * c + v.c[2] * s, y = 205 + v.c[1], rx = Math.sqrt(v.r[0] * v.r[0] * c * c + v.r[2] * v.r[2] * s * s) + (extra || 0), ry = v.r[1] + (extra || 0);
      d += 'M' + n(x - rx) + ',' + n(y) + 'a' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + n(2 * rx) + ',0a' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + n(-2 * rx) + ',0Z';
    });
    return d;
  }
  // raio da cabeça (de lado a lado) em cada altura: crânio e maxilar
  function raioCabeca(y, menino) {
    var a = (y - 197) / 90, b = (y - 247) / 52, r1 = Math.abs(a) < 1 ? 86 * Math.sqrt(1 - a * a) : 0, r2 = Math.abs(b) < 1 ? (menino ? 75 : 70) * Math.sqrt(1 - b * b) : 0;
    return Math.max(r1, r2, 8);
  }
  /* a pele do rosto como uma região presa na cabeça: linha do cabelo (testa → têmporas → costeletas na frente da
     orelha), os lados do rosto e o queixo, em "ângulo de lugar" (az) e altura. Girando de th, cada ponto vai para
     x = 200 + raio·sen(az + th); o que passa para trás da cabeça encosta na borda (por fora, 3 px) — assim a
     pele some aos poucos, sem pulo, e de costas sobra só cabelo. */
  var PELE_AZ = (function () {
    var pts = [], k;
    for (k = 0; k <= 24; k++) { var az = -88 + k * 176 / 24; pts.push([az, 125 + 85 * Math.pow(Math.abs(az) / 88, 2.2)]); }
    for (k = 1; k <= 6; k++) pts.push([88, 210 + k * 16]);
    for (k = 1; k <= 8; k++) pts.push([88 - k * 22, 306]);
    for (k = 1; k <= 5; k++) pts.push([-88, 306 - k * 19]);
    return pts;
  })();
  function regiaoPele(th, menino, dT) {
    return PELE_AZ.map(function (q, i) {
      // th vai de -180° a 180°: o que passa de 90° para um lado encosta na borda desse lado (de costas, tudo de um lado só)
      var a = q[0] * Math.PI / 180 + th, r = raioCabeca(q[1], menino);
      var x = Math.abs(a) <= Math.PI / 2 ? 200 + r * Math.sin(a) : 200 + (a > 0 ? 1 : -1) * (r + 3);
      // testa alta: sobe a linha do cabelo no meio da testa; nas têmporas quase nada (senão de lado fica careca)
      // e nunca passa do alto da cabeça
      var y = q[1];
      if (dT && y < 215) { y -= dT * pesoTesta(y) * frenteTesta(q[0]); if (dT > 0) y = Math.max(y, 114); }
      return (i ? 'L' : 'M') + n(x) + ',' + n(y);
    }).join('') + 'Z';
  }
  /* testa: sobe (ou desce) a linha do cabelo da frente. Só a faixa da franja e das têmporas anda (de y 100 a 285, com
     as pontas suaves): o alto da cabeça e as mechas compridas ficam onde estavam. d > 0 = testa mais alta. */
  var TESTA = { baixa: -8, alta: 14, bemAlta: 24 };
  // perto do alto da cabeça anda menos (a cabeça é redonda: lá em cima a linha do cabelo "deita"), para não sumir o cabelo
  function pesoTesta(y) { return y <= 107 ? 0 : y < 165 ? (y - 107) / 58 : y <= 225 ? 1 : y < 285 ? (285 - y) / 60 : 0; }
  // quanto a linha do cabelo sobe conforme o lugar na cabeça: tudo no meio da testa, quase nada perto da orelha
  function frenteTesta(az) { var a = Math.abs(az); return a <= 30 ? 1 : a >= 80 ? 0.1 : 0.1 + 0.9 * (0.5 + 0.5 * Math.cos((a - 30) / 50 * Math.PI)); }
  function subirTesta(s, d) {
    if (!d || !s) return s;
    // nos lados (têmporas, mechas que descem perto da orelha) sobe bem menos, como a testa de verdade
    function lado(x) { var a = Math.abs(x - 200); return a <= 40 ? 1 : a >= 88 ? 0.15 : 0.15 + 0.85 * (0.5 + 0.5 * Math.cos((a - 40) / 48 * Math.PI)); }
    return s.replace(/(\sd=")([^"]*)"/g, function (m, a, dd) { return a + dd.replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, function (m2, x, y) { return x + ',' + n(+y - d * pesoTesta(+y) * lado(+x)); }) + '"'; })
      .replace(/cx="([^"]*)" cy="([^"]*)"/g, function (m, x, y) { return 'cx="' + x + '" cy="' + n(+y - d * pesoTesta(+y) * lado(+x)) + '"'; });
  }
  // pinta o contorno sem as linhas de dentro: primeiro o traço grosso, depois o recheio por cima
  function pintar(d, recheio, traco, larg) { return p(d, { fill: 'none', stroke: traco, 'stroke-width': (larg || 2.2) * 2, 'stroke-linejoin': 'round' }) + p(d, { fill: recheio }); }
  // nariz de frente, em cada formato (desenhado em volta de x = 200)
  // Nova Era: olhos, nariz e boca acompanham a idade (só de frente)
  function olhoIdade(cx, s) { return IDADE.olho === 1 ? s : '<g transform="translate(' + cx + ' 214) scale(' + IDADE.olho + ') translate(' + (-cx) + ' -214)">' + s + '</g>'; }
  function bocaIdade(s) { var b = IDADE.boca; return b[0] === 1 && b[1] === 1 ? s : '<g transform="translate(200 268) scale(' + b[0] + ' ' + b[1] + ') translate(-200 -268)">' + s + '</g>'; }
  // nariz delicado com luz na ponte e uma sombra fininha do lado (adolescente e adulta), como na referência
  function narizLuz(pele, menino) {
    if (IDADE.olho > 0.95) return '';
    return p('M199,216 Q200,230 199,240', { fill: 'none', stroke: '#fff', 'stroke-width': 2.2, 'stroke-linecap': 'round', opacity: 0.2 });
  }
  // nariz em ilustração: sombra fininha de um lado da ponte (a luz vem da esquerda), pontinha com luz e as narinas
  // marcadas de leve. Cada formato muda a largura (w), o comprimento da ponte e a altura da ponta.
  function narizFrente(tipo, pele) {
    var N = { arrebitado: [5, 243, 0.5], fininho: [4, 247, 1], redondinho: [7, 246, 0.6], pequenino: [4, 246, 0.3], batatinha: [9, 246, 0.6], largo: [10, 247, 0.6], reto: [5, 247, 1] }[tipo] || [5.5, 246, 0.6];
    var w = N[0], y = N[1], ponte = N[2], c = esc(pele, 0.34);
    var s = p('M204,' + n(y - 12 - ponte * 18) + ' Q' + n(206 + w * 0.2) + ',' + n(y - 10) + ' ' + n(203 + w * 0.4) + ',' + n(y - 2), { fill: 'none', stroke: c, 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: 0.45 });
    s += elip(200, y - 3, w * 0.45, 2.4, { fill: '#fff', opacity: n(0.4 * (1 - 0.6 * escuridao(pele))) });
    s += p('M' + n(200 - w) + ',' + n(y - 1) + ' Q' + n(200 - w - 2) + ',' + n(y + 4) + ' ' + n(200 - w * 0.45) + ',' + n(y + 4.5) + ' Q200,' + n(y + 6.5) + ' ' + n(200 + w * 0.45) + ',' + n(y + 4.5) + ' Q' + n(200 + w + 2) + ',' + n(y + 4) + ' ' + n(200 + w) + ',' + n(y - 1), { fill: 'none', stroke: c, 'stroke-width': 1.4, 'stroke-linecap': 'round', opacity: 0.75 });
    s += elip(200 - w * 0.5, y + 3, 1.7, 1, { fill: c, opacity: 0.55 }) + elip(200 + w * 0.5, y + 3, 1.7, 1, { fill: c, opacity: 0.55 });
    return s;
  }
  /* cabelo girado: cada ponto do desenho de frente vira um ponto num elipsoide em volta da cabeça (mais estreito
     lá em cima, onde o alto da cabeça quase não sai do lugar) e gira junto. tras = cabelo da parte de trás (gira
     para o outro lado). Na frente, as mechas compridas dos lados andam inteiras, presas atrás da orelha (como nas
     ilustrações de perfil): a do lado de cá fica por cima, a do lado de lá vai para trás da cabeça (devolvida em
     .atras). Com giro 0 o desenho fica exatamente igual. */
  function torcer(s, tras, th, sg) {
    var M = Math.PI / 2, atras = '', lado = '';
    function raio(y) { var dy = Math.max(0, 215 - y) / 118; return (tras ? 112 : 92) * Math.sqrt(Math.max(0, 1 - dy * dy)); }
    function fx(x, y) {
      var R = raio(y), d = x - 200, lado = d < 0 ? -1 : 1, exc = 0, u;
      if (R < 1 || Math.abs(d) > R) { exc = d - lado * R; u = lado; } else u = d / R;
      var f = Math.asin(u);
      if (tras) f = Math.PI - f;
      var a = f + th, some = !tras && Math.abs(a) > M;
      var aperta = 0.3 + 0.7 * Math.max(0, Math.min(1, 1 - Math.cos(th)));   // de frente o de trás quase não passa para a frente; de costas ele aparece inteiro
      if (tras) a = a > 3 * M ? 3 * M + (a - 3 * M) * aperta : a < M ? M - (M - a) * aperta : a;
      var sa = Math.sin(a), x2 = 200 + R * (some ? (a > 0 ? 1 : -1) : sa) + exc * Math.abs(sa);
      // cabelo de trás: o que passa da borda é como um raio maior (de costas fica espelhado, sem bico no alto)
      // (com 0° dá exatamente o desenho de frente; girando, o volume largo dos lados acompanha a volta sem se cruzar)
      if (tras) x2 = 200 + (R + Math.abs(exc)) * sa;
      // de lado, o cabelo comprido de trás desce colado nas costas (embaixo da cabeça fica mais estreito)
      if (tras) x2 = 200 + (x2 - 200) * (1 - Math.abs(Math.sin(th)) * 0.62 * Math.max(0, Math.min(1, (y - 280) / 90)));
      return [x2, some];
    }
    var res = s.replace(/<(path|circle|ellipse)\s([^>]*?)(\/?)>/g, function (m, tag, atr, fecha) {
      // mecha comprida do lado? (começa abaixo da testa e desce bastante)
      var xs = [], ys = [];
      (atr.match(/(^|\s)d="([^"]*)"/) || ['', '', ''])[2].replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, function (m3, x, y) { xs.push(+x); ys.push(+y); });
      var cc = atr.match(/cx="([^"]*)" cy="([^"]*)"/); if (cc) { xs.push(+cc[1]); ys.push(+cc[2]); }
      if (!tras && fecha && xs.length) {
        var cx = xs.reduce(function (a, b) { return a + b; }, 0) / xs.length, cy = ys.reduce(function (a, b) { return a + b; }, 0) / ys.length;
        if (cy > 236 && Math.abs(cx - 200) > 40) {
          var lm = cx < 200 ? -1 : 1, a0 = lm * 110 * Math.PI / 180, dx = 96 * (Math.sin(a0 + th) - Math.sin(a0)), kx = 1 - 0.25 * Math.abs(Math.sin(th));
          var el = '<g transform="translate(' + n(cx + dx) + ' 0) scale(' + n(kx * 100) / 100 + ' 1) translate(' + n(-cx) + ' 0)">' + m + '</g>';
          if (lm === sg && th) { if (Math.cos(a0 + th) > -0.75) atras += el; } else lado += el;
          return '';
        }
      }
      var tot = 0, fora = 0;
      function um(x, y) { var r = fx(+x, +y); tot++; if (r[1]) fora++; return n(r[0]); }
      atr = atr.replace(/(^|\s)d="([^"]*)"/, function (m2, ini, d) { return ini + 'd="' + d.replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, function (m3, x, y) { return um(x, y) + ',' + y; }) + '"'; });
      atr = atr.replace(/cx="([^"]*)" cy="([^"]*)"( rx="([^"]*)")?/, function (m2, x, y, temRx, rx) {
        var res = 'cx="' + um(x, y) + '" cy="' + y + '"';
        // elipse grande (volume do cabelo): fica mais estreita conforme gira, como o resto do desenho
        if (temRx) { var dd = Math.abs(fx(+x + 1, +y)[0] - fx(+x - 1, +y)[0]) / 2; res += ' rx="' + n(+rx * Math.max(0.45, Math.min(1, dd))) + '"'; }
        return res;
      });
      if (!tras && fecha && tot && fora / tot >= 0.6) return '';
      return '<' + tag + ' ' + atr + fecha + '>';
    });
    if (tras) return res;
    return { frente: res, lado: lado, atras: atras };
  }
  /* volume do cabelo de trás visto de lado. O desenho de frente só tem o contorno (os lados do cabelo); de lado, quem
     aparece é a parte de trás, que não está no contorno. Então, de lado, o mesmo desenho vai junto, apertado e
     empurrado para trás da cabeça, só com o preenchimento (sem os fios), por baixo do cabelo girado. */
  function volumeTras(s, th) {
    var q = Math.abs(Math.sin(th)); if (q < 0.05 || !s) return '';
    // só no cabelo comprido (que desce pelas costas); no curto a própria cabeça já é o volume
    var ys = (s.match(/,(-?\d*\.?\d+)/g) || []).map(function (t) { return +t.slice(1); }).concat((s.match(/cy="([^"]*)"/g) || []).map(function (t) { return +t.slice(4, -1); }));
    if (!ys.length || Math.max.apply(null, ys) < 330) return '';
    var sg = Math.sin(th) >= 0 ? 1 : -1, k = (Math.cos(th) >= 0 ? 1 : -1) * (1 - 0.5 * q), atras = -sg * q * 62;
    function x(v, y) { var w = Math.max(0, Math.min(1, (y - 150) / 60)); return n(200 + (v - 200) * k + atras * w); }
    var so = s.replace(/<path [^>]*fill="none"[^>]*\/>/g, '').replace(/(stroke-width=")[\d.]+/g, '$10');
    so = so.replace(/(\sd=")([^"]*)"/g, function (m, a, d) { return a + d.replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, function (m2, vx, vy) { return x(+vx, +vy) + ',' + vy; }) + '"'; })
      .replace(/cx="([^"]*)" cy="([^"]*)"( rx="([^"]*)")?/g, function (m, vx, vy, temRx, rx) { return 'cx="' + x(+vx, +vy) + '" cy="' + vy + '"' + (temRx ? ' rx="' + n(+rx * Math.abs(k)) + '"' : ''); });
    // sempre cabelo inteiro (antes aparecia transparente no começo do giro: um "fantasma" claro do lado);
    // no começo ele fica quase todo escondido atrás do cabelo de trás, então não dá pulo
    return so;
  }
  // luz e sombra do rosto de frente: dos lados (testa, bochechas, pálpebras) e do meio (nariz e queixo)
  /* luz do rosto: só luz e cor de pele saudável (rosado nas bochechas, brilho na testa, no nariz e no queixo).
     Nada de sombra escura na parte de baixo do rosto ou dos lados — de longe parecia barba. */
  // semMonolid: olho fininho sem a dobrinha da pálpebra (a linha da dobra não aparece)
  // (a dobrinha da pálpebra agora é desenhada junto com o olho)
  function luzLados(pele, menino) {
    var rosa = (menino ? 0.03 : 0.08) * (1 - escuridao(pele));
    return elip(152, 246, 26, 16, { fill: '#ff8f9a', opacity: rosa }) + elip(248, 246, 26, 16, { fill: '#ff8f9a', opacity: rosa });
  }
  function luzMeio(pele, I) {
    return elip(200, 276, 8, 3, { fill: '#fff', opacity: 0.12 }) + brilhoPele(pele, I);   // luzinha no queixo (dentro do queixo novo, mais curto)
  }
  // quão escura é a pele (0 = branca, 1 = bem escura)
  function escuridao(h) { var c = rgb(h), l = (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; return Math.max(0, Math.min(1, (0.72 - l) / 0.45)); }
  /* pele escura de verdade (dono, 20/Nov/2026: "tá com a mesma cor do cabelo, falso"): tem brilho — luz dourada na testa,
     na ponte e na ponta do nariz, nas maçãs do rosto e no queixo, e as bochechas com um calor avermelhado. Quanto mais
     escura a pele, mais forte o brilho; na pele clara quase não aparece. */
  function brilhoPele(pele, I) {
    var k = escuridao(pele); if (k < 0.15) return '';
    var o = function (v) { return n(v * k * 100) / 100; }, L = { fill: 'url(#' + I + 'luzPele)' }, Q = { fill: 'url(#' + I + 'calorPele)' };
    return '<g opacity="' + o(0.85) + '">' + elip(200, 152, 40, 18, L) + elip(200, 230, 4, 18, L) +
      elip(150, 234, 20, 10, Object.assign({ transform: 'rotate(-18 150 234)' }, L)) + elip(250, 234, 20, 10, Object.assign({ transform: 'rotate(18 250 234)' }, L)) +
      elip(200, 276, 6, 3, L) + '</g>' + '<g opacity="' + o(0.18) + '">' + elip(152, 252, 26, 16, Q) + elip(248, 252, 26, 16, Q) + '</g>';
  }


  // braço levantado dando tchau: ombro → cotovelo → mão aberta; o antebraço balança (opcoes.anim)
  function bracoTchau(pele, peleE, esmalte, membro, anim) {
    var s = membro('M250,356 Q282,352 300,330', 22);
    var mao2 = p('M308,258 Q306,232 322,228 Q338,232 336,258 Q334,272 322,274 Q310,272 308,258Z', { fill: pele, stroke: peleE, 'stroke-width': 2 });
    var dedosT = [[312, 236, 218], [319, 232, 210], [326, 232, 211], [333, 236, 220]].map(function (d) { return p('M' + d[0] + ',' + d[1] + ' L' + d[0] + ',' + d[2], { stroke: peleE, 'stroke-width': 7.4, 'stroke-linecap': 'round' }) + p('M' + d[0] + ',' + d[1] + ' L' + d[0] + ',' + d[2], { stroke: pele, 'stroke-width': 5, 'stroke-linecap': 'round' }); }).join('');
    var polegar = p('M310,260 L298,248', { stroke: peleE, 'stroke-width': 7.4, 'stroke-linecap': 'round' }) + p('M310,260 L298,248', { stroke: pele, 'stroke-width': 5, 'stroke-linecap': 'round' });
    var pontas = [[312, 217], [319, 209], [326, 210], [333, 219], [298.6, 247]];
    var ante = membro('M300,330 Q312,300 320,270', 19) + dedosT + polegar + mao2 + elip(318, 246, 6, 4, { fill: '#fff', opacity: 0.18 }) + unhas(pontas, esmalte, pele);
    var mexe = anim ? '<animateTransform attributeName="transform" type="rotate" values="-12 300 330;14 300 330;-12 300 330" dur=".7s" repeatCount="indefinite"/>' : '';
    return s + '<g>' + ante + mexe + '</g>';
  }

  /* poses do fim da passarela (opcoes.pose), sorteadas no desfile (app.js):
     'cintura'      mão direita (da imagem) na cintura, cotovelo para fora; a outra solta
     'duasCintura'  as duas mãos na cintura
     'maoCabelo'    mão direita no cabelo, do lado da cabeça; a esquerda na cintura
     'cruzados'     braços cruzados na frente do peito (menino)
     'bolsos'       mãos nos bolsos (menino): os braços descem para dentro e as mãos somem no bolso
     'carinha'      as duas mãos no queixo, emoldurando o rosto (foto de desfile infantil do dono)
     'maosCabeca'   as duas mãos em cima da cabeça, cotovelos para fora (foto de desfile infantil do dono)
     'joinha'       os dois punhos na frente do peito com o polegar para cima (foto do menino no desfile)
     Manga curta cobre o começo do braço; manga longa, o braço todo. */
  var POSES = ['cintura', 'duasCintura', 'maoCabelo', 'cruzados', 'bolsos', 'carinha', 'joinha', 'maosCabeca', 'beijo'];
  function bracosPose(tipo, manga, corTop, pele, peleE, esmalte, membro) {
    function vestir(d, larg, ate) {   // a manga por cima do braço (ate: 0..1 do traço, aproximado pelo pathLength)
      if (!corTop || manga === 'nada') return '';
      var fim = manga === 'longa' ? 1 : ate;
      if (fim <= 0) return '';   // sem manga nesse pedaço (antes ficava uma bolinha da cor da roupa no cotovelo)
      // a manga vai junto com o osso do braço (mesmas pontas), para não se soltar dele no corpo novo
      var v = (d.match(/-?\d*\.?\d+/g) || []), Z = v.length >= 6 ? [v[4], v[5]] : [v[2], v[3]];
      return '<g data-osso="' + v[0] + ',' + v[1] + ',' + Z[0] + ',' + Z[1] + '">' +
        p(d, { fill: 'none', stroke: esc(corTop.hex, 0.25), 'stroke-width': larg + 4, 'stroke-linecap': 'round', pathLength: 100, 'stroke-dasharray': n(fim * 100) + ' 200' }) +
        p(d, { fill: 'none', stroke: corTop.hex, 'stroke-width': larg + 2, 'stroke-linecap': 'round', pathLength: 100, 'stroke-dasharray': n(fim * 100) + ' 200' }) + '</g><!--/osso-->';
    }
    function punho(x, y, giro) {   // mão fechada, vista de cima (só os nós dos dedos)
      return '<g transform="rotate(' + giro + ' ' + x + ' ' + y + ')">' + elip(x, y, 12, 9.5, { fill: pele, stroke: peleE, 'stroke-width': 2 }) +
        p('M' + (x - 7) + ',' + (y + 2) + ' L' + (x + 7) + ',' + (y + 2), { stroke: peleE, 'stroke-width': 1.2, opacity: 0.5 }) + elip(x - 3, y - 3, 4, 2.4, { fill: '#fff', opacity: 0.2 }) + '</g>';
    }
    function cintura(lado) {   // lado 1 = direita da imagem, -1 = esquerda (espelho em x = 200)
      var x = function (v) { return lado > 0 ? v : 400 - v; };
      var br = 'M' + x(250) + ',356 Q' + x(280) + ',372 ' + x(300) + ',412', an = 'M' + x(300) + ',412 Q' + x(290) + ',438 ' + x(262) + ',452';
      return membro(br, 23) + vestir(br, 23, 0.5) + membro(an, 20) + vestir(an, 20, 0) + punho(x(258), 452, -30 * lado);
    }
    if (tipo === 'cintura') return cintura(1);
    if (tipo === 'duasCintura') return cintura(1) + cintura(-1);
    if (tipo === 'bolsos') {
      var bE = 'M150,354 Q132,410 160,462', bD = 'M250,354 Q268,410 240,462';
      function bolso(x) { return p('M' + (x - 13) + ',458 Q' + x + ',452 ' + (x + 13) + ',458', { fill: 'none', stroke: '#000', 'stroke-width': 2, opacity: 0.35, 'stroke-linecap': 'round' }); }
      return membro(bE, 23) + vestir(bE, 23, 0.4) + bolso(160) + membro(bD, 23) + vestir(bD, 23, 0.4) + bolso(240);
    }
    if (tipo === 'maosCabeca') {
      var hE = 'M150,354 Q102,330 98,262', hD = 'M250,354 Q298,330 302,262', gE = 'M98,262 Q104,196 150,150', gD = 'M302,262 Q296,196 250,150';
      return membro(hE, 23) + vestir(hE, 23, 0.4) + membro(hD, 23) + vestir(hD, 23, 0.4) + membro(gE, 19) + vestir(gE, 19, 0) + membro(gD, 19) + vestir(gD, 19, 0) +
        punho(154, 146, 50) + punho(246, 146, -50);
    }
    if (tipo === 'joinha') {
      var jE = 'M150,354 Q130,392 148,420', jD = 'M250,354 Q270,392 252,420', fE = 'M148,420 Q160,396 176,372', fD = 'M252,420 Q244,394 230,366';
      function polegar(x, y) { return p('M' + x + ',' + (y - 4) + ' L' + x + ',' + (y - 17), { stroke: peleE, 'stroke-width': 9, 'stroke-linecap': 'round' }) + p('M' + x + ',' + (y - 4) + ' L' + x + ',' + (y - 17), { stroke: pele, 'stroke-width': 6.4, 'stroke-linecap': 'round' }); }
      return membro(jE, 23) + vestir(jE, 23, 0.6) + membro(jD, 23) + vestir(jD, 23, 0.6) + membro(fE, 20) + vestir(fE, 20, 0) + membro(fD, 20) + vestir(fD, 20, 0) +
        polegar(180, 364) + punho(178, 368, 0) + polegar(232, 358) + punho(230, 362, 0);
    }
    if (tipo === 'carinha') {
      var cE = 'M150,354 Q124,392 150,402', cD = 'M250,354 Q276,392 250,402', aE = 'M150,402 Q154,350 164,312', aD = 'M250,402 Q246,350 236,312';
      return membro(cE, 23) + vestir(cE, 23, 0.5) + membro(cD, 23) + vestir(cD, 23, 0.5) + membro(aE, 19) + vestir(aE, 19, 0) + membro(aD, 19) + vestir(aD, 19, 0) +
        punho(166, 304, -35) + punho(234, 304, 35);
    }
    if (tipo === 'beijo') {   // mandando beijinho: cotovelo para baixo e para fora, a mão na boca
      var bB = 'M250,356 Q272,378 266,404', aB = 'M266,404 Q244,330 214,282';
      return membro(bB, 23) + vestir(bB, 23, 0.5) + membro(aB, 20) + vestir(aB, 20, 0) + punho(212, 280, -30);
    }
    if (tipo === 'maoCabelo') return cintura(-1);   // a outra mão na cintura; o braço erguido vem antes da cabeça
    if (tipo === 'maoCabeloAtras') {
      var brC = 'M250,356 Q314,332 336,266', anC = 'M336,266 Q322,214 270,200';
      return membro(brC, 23) + vestir(brC, 23, 0.45) + membro(anC, 20) + vestir(anC, 20, 0) + punho(266, 200, 40);
    }
    // cruzados: braços de cima descem do ombro até o cotovelo; antebraços atravessam o peito, um sobre o outro
    var e1 = 'M150,354 Q138,384 146,420', d1 = 'M250,354 Q262,384 254,420';
    var anteE = 'M146,420 Q190,416 236,394', anteD = 'M254,420 Q210,410 166,394';
    return membro(e1, 23) + vestir(e1, 23, 0.7) + membro(d1, 23) + vestir(d1, 23, 0.7) +
      membro(anteD, 20) + vestir(anteD, 20, 0) + punho(166, 394, 20) +
      membro(anteE, 20) + vestir(anteE, 20, 0) + punho(238, 393, -20);
  }

  // ---------- mãos: palma, 4 dedos e polegar (do lado de dentro, virado para o corpo) ----------
  // dedos vistos de fora para dentro: mindinho, anelar, médio, indicador. lado -1 = mão da esquerda da imagem.
  var DEDOS = [[-7, 10], [-2.4, 12.5], [2.4, 13], [7, 11]];
  function dedos(x, lado) { return DEDOS.map(function (d) { var dx = d[0] * -lado; return 'M' + n(x + dx) + ',506 L' + n(x + dx * 1.18) + ',' + n(506 + d[1]); }).join(' ') + ' M' + n(x - lado * 8) + ',496 L' + n(x - lado * 14) + ',508'; }
  function mao(x, lado, pele, peleE, esmalte) {
    var d = dedos(x, lado);
    var s = p(d, { fill: 'none', stroke: peleE, 'stroke-width': 7.4, 'stroke-linecap': 'round' }) + elip(x, 501, 12, 12.5, { fill: pele, stroke: peleE, 'stroke-width': 2 }) +
      p(d, { fill: 'none', stroke: pele, 'stroke-width': 5, 'stroke-linecap': 'round' }) + elip(x, 501, 10.6, 11, { fill: pele }) +
      elip(x - lado * 2, 497, 5, 3.5, { fill: '#fff', opacity: 0.18 });
    // unhas: na ponta de cada dedo e do polegar
    var pontas = DEDOS.map(function (q) { var dx = q[0] * -lado; return [x + dx * 1.18, 506 + q[1] - 1.4]; });
    pontas.push([x - lado * 14 + lado * 1.2, 506.6]);
    return s + unhas(pontas, esmalte, pele);
  }
  var ARCO_UNHA = ['#ff5a6e', '#ffd23f', '#5cc46a', '#5ac8ff', '#b892ff'];
  function unhas(pontas, esmalte, pele) {
    var s = '', tipo = esmalte ? esmalte.tipo : 'nenhum', cor = esmalte && esmalte.cor ? esmalte.cor.hex : '#ff4fa3';
    pontas.forEach(function (q, k) {
      var x = q[0], y = q[1], c = cor, t = q[2] || 1;   // q[2]: tamanho (as unhas dos pés variam do dedão ao mindinho)
      if (tipo === 'nenhum') { s += elip(x, y, 1.8 * t, 2.3 * t, { fill: cla(pele, 0.45), stroke: esc(pele, 0.15), 'stroke-width': 0.4 }); return; }
      if (tipo === 'arco') c = ARCO_UNHA[k % ARCO_UNHA.length];
      if (tipo === 'degrade') c = mistura(cor, '#ffffff', k * 0.14);
      if (tipo === 'francesinha') c = '#ffd9df';
      s += elip(x, y, 2 * t, 2.5 * t, { fill: c, stroke: esc(c, 0.3), 'stroke-width': 0.5 });
      if (tipo === 'francesinha') s += elip(x, y + 1.2 * t, 1.9 * t, 1.1 * t, { fill: '#fff' });
      if (tipo === 'glitter') { var ru = sorteio(k + 3); s += lantejoula(x - 0.7, y - 0.5, 0.7, cla(c, 0.5), ru, true) + lantejoula(x + 0.7, y + 0.7, 0.6, '#ffffff', ru, true) + lantejoula(x + 0.4, y - 1.1, 0.5, cla(c, 0.2), ru, false); if (k % 2 === 0) s += faisca(x + 1.2, y - 1.6, 2.2, cla(c, 0.3), ru); }
      if (tipo === 'bolinhas') s += circ(x, y, 0.65, { fill: '#fff' });
      if (tipo === 'coracao' && k === 2) s += p(coracao(x, y, 0.9), { fill: '#fff' });
      s += elip(x - 0.6 * t, y - 0.9 * t, 0.6 * t, 0.9 * t, { fill: '#fff', opacity: 0.6 });
    });
    return s;
  }
  /* pé de frente (visto um pouco de cima): o peito do pé alarga do tornozelo para os dedos, e os cinco dedinhos
     ficam na ponta, do dedão (do lado de dentro, perto do outro pé) ao mindinho. Devolve o desenho e onde ficam as
     unhas — em cima de cada dedo, nunca embaixo do pé. */
  function peFrente(x, pele, peleE, deCostas) {
    // de costas: só o calcanhar (redondinho, um pouco mais estreito), sem dedos nem unhas
    if (deCostas) {
      var cal = 'M' + n(x - 12) + ',630 C' + n(x - 13) + ',640 ' + n(x - 14) + ',650 ' + n(x - 8) + ',655 Q' + x + ',658 ' + n(x + 8) + ',655 C' + n(x + 14) + ',650 ' + n(x + 13) + ',640 ' + n(x + 12) + ',630';
      return { svg: p(cal + 'Z', { fill: pele }) + p(cal, { fill: 'none', stroke: peleE, 'stroke-width': 1.5 }) + elip(x, 650, 6, 3, { fill: esc(pele, 0.1), opacity: 0.5 }), unhas: [] };
    }
    var d = x < 200 ? 1 : -1;   // para dentro (onde fica o dedão)
    var dedos = [[8.4, 4.1, 650.6], [2.1, 3.3, 651.4], [-3.4, 3, 651.9], [-8.1, 2.7, 652.2], [-12.1, 2.3, 652.2]].map(function (q) { return [x + d * q[0], q[2], q[1]]; });
    var lados = 'M' + n(x - 12) + ',630 C' + n(x - 14) + ',638 ' + n(x - 16) + ',645 ' + n(x - 15) + ',651 Q' + x + ',656 ' + n(x + 15) + ',651 C' + n(x + 16) + ',645 ' + n(x + 14) + ',638 ' + n(x + 12) + ',630';
    var s = p(lados + 'Z', { fill: pele }) + p(lados, { fill: 'none', stroke: peleE, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }) +
      p('M' + n(x + d * 5) + ',636 Q' + n(x + d * 6.5) + ',642 ' + n(x + d * 7.5) + ',646', { fill: 'none', stroke: esc(pele, 0.12), 'stroke-width': 1.2, 'stroke-linecap': 'round', opacity: 0.55 });
    dedos.slice().reverse().forEach(function (q) { s += elip(q[0], q[1], q[2], q[2] * 1.08, { fill: pele, stroke: peleE, 'stroke-width': 0.9 }); });
    return { svg: s, unhas: dedos.map(function (q) { return [q[0], q[1] + q[2] * 0.12, q[2] / 3.3]; }) };
  }

  function dedoDoAnel(x, lado) { var dx = DEDOS[1][0] * -lado; return [x + dx * 1.09, 515]; }

  // ---------- rosto ----------
  function base(tipo, pele, rosto) {
    if (tipo === 'natural') return p(rosto, { fill: mistura(pele, '#ffd9c7', 0.3), opacity: 0.45 });
    if (tipo === 'bronze') return p(rosto, { fill: '#c8743f', opacity: 0.13 }) + elip(150, 236, 22, 10, { fill: '#e0874a', opacity: 0.18 }) + elip(250, 236, 22, 10, { fill: '#e0874a', opacity: 0.18 });
    if (tipo === 'iluminada') return elip(148, 236, 17, 7, { fill: '#fff', opacity: 0.45, transform: 'rotate(-18 148 236)' }) + elip(252, 236, 17, 7, { fill: '#fff', opacity: 0.45, transform: 'rotate(18 252 236)' }) +
      elip(200, 236, 3.5, 11, { fill: '#fff', opacity: 0.5 }) + elip(200, 150, 26, 8, { fill: '#fff', opacity: 0.32 });
    if (tipo === 'sardas') { var s = '', pts = [[150, 240], [160, 246], [145, 250], [170, 240], [158, 234], [250, 240], [240, 246], [255, 250], [230, 240], [242, 234], [192, 238], [208, 238]]; pts.forEach(function (q) { s += circ(q[0], q[1], 2, { fill: esc(pele, 0.35), opacity: 0.7 }); }); return s; }
    return '';
  }
  function blush(e, cor, I) {
    if (e.blush === 'redondo') return circ(150, 252, 24, { fill: 'url(#' + I + 'blush)' }) + circ(250, 252, 24, { fill: 'url(#' + I + 'blush)' });
    if (e.blush === 'coracao') return p(coracao(150, 252, 10), { fill: cor, opacity: 0.75 }) + p(coracao(250, 252, 10), { fill: cor, opacity: 0.75 });
    if (e.blush === 'diagonal') return elip(152, 248, 24, 9, { fill: 'url(#' + I + 'blush)', transform: 'rotate(-22 152 248)' }) + elip(248, 248, 24, 9, { fill: 'url(#' + I + 'blush)', transform: 'rotate(22 248 248)' });
    return '';
  }
  /* ---------- olho em ilustração (Nova Era, 19/Nov/2026) ----------
     Amendoado, com o canto de fora um pouco levantado, como nos jogos de maquiagem do Poki: pálpebra de cima com traço
     mais grosso para fora, dobrinha da pálpebra, íris grande cortada de leve pelas pálpebras, cílios saindo do traço.
     Criança: olho mais redondo e aberto. As medidas são do lado de fora (lado = -1 olho da esquerda, 1 da direita). */
  function geoOlho(cx, lado) {
    var r = IDADE.olho >= 1.04 ? 1.3 : IDADE.olho >= 1 ? 1.15 : 1, cy = 214;
    function q(x, y) { return [cx + lado * x, cy + y]; }
    return { cy: cy, ini: q(-20, 4), fim: q(24, -2), c1: q(-14, -10 * r), c2: q(10, -20 * r), b1: q(18, 13 * r), b2: q(-6, 17 * r), q: q, r: r };
  }
  function pt(a) { return n(a[0]) + ',' + n(a[1]); }
  function bez(a, b, c, d, t) { var u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; }
  function formaOlho(cx) {
    var g = geoOlho(cx, cx < 200 ? -1 : 1);
    return 'M' + pt(g.ini) + 'C' + pt(g.c1) + ' ' + pt(g.c2) + ' ' + pt(g.fim) + 'C' + pt(g.b1) + ' ' + pt(g.b2) + ' ' + pt(g.ini) + 'Z';
  }
  // pálpebra de cima: faixa escura, fina no canto de dentro e mais grossa para fora (com um risquinho no canto, na menina)
  function tracoPalpebra(g, lado, grossura, rabinho) {
    var k = grossura, q = g.q, r = g.r;
    var volta = rabinho ? q(27 + k, -6 - k) : q(25, -3 - k * 0.4);
    return 'M' + pt(g.ini) + 'C' + pt(g.c1) + ' ' + pt(g.c2) + ' ' + pt(g.fim) + 'L' + pt(volta) + 'C' + pt(q(10, -20 * r - k * 1.5)) + ' ' + pt(q(-14, -10 * r - k * 0.6)) + ' ' + pt(q(-20, 3)) + 'Z';
  }
  function sobrancelha(cx, lado, menino) {
    var q = function (x, y) { return n(cx + lado * x) + ',' + n(214 + y); };
    if (menino) return 'M' + q(-20, -30) + 'C' + q(-8, -33) + ' ' + q(10, -35) + ' ' + q(26, -31) + 'C' + q(12, -41) + ' ' + q(-8, -40) + ' ' + q(-21, -37) + 'Z';
    return 'M' + q(-19, -28) + 'C' + q(-8, -34) + ' ' + q(8, -39) + ' ' + q(26, -30) + 'C' + q(10, -43) + ' ' + q(-8, -40) + ' ' + q(-20, -33.5) + 'Z';
  }
  function olho(cx, lado, e, I, C, olhar, piscar) {
    var g = geoOlho(cx, lado), cy = g.cy, ix = cx + (olhar || 0), s = '', som = C('sombra'), del = C('delineado').hex, cil = C('cilios').hex, pele = C('pele').hex;
    var men = e.personagem === 'menino', escuro = '#2a1a1c';
    // fechadinhos sorrindo: o olho vira um arquinho (meia-lua) com os cílios por cima — ele "sorri" com os olhos
    if (e.formaOlho === 'sorridentes') {
      var corA = e.delineado !== 'nenhum' ? del : escuro, arco = 'M' + (cx - 19) + ',' + (cy + 4) + ' Q' + cx + ',' + (cy - 14) + ' ' + (cx + 19) + ',' + (cy + 4);
      var r0 = '';
      if (e.sombra !== 'nenhum') r0 += p('M' + (cx - 21) + ',' + (cy + 3) + ' Q' + cx + ',' + (cy - 30) + ' ' + (cx + 21) + ',' + (cy + 3) + ' Q' + cx + ',' + (cy - 12) + ' ' + (cx - 21) + ',' + (cy + 3) + 'Z', { fill: e.sombra === 'arco' ? '#ff8fc8' : som.hex, opacity: 0.6 });
      r0 += p(arco, { fill: 'none', stroke: corA, 'stroke-width': e.delineado === 'grosso' ? 4.5 : 3, 'stroke-linecap': 'round' });
      if (e.cilios !== 'nenhum' && !men) [0.75, 0.9].forEach(function (t0) { var tt = lado > 0 ? t0 : 1 - t0, x0 = (1 - tt) * (1 - tt) * (cx - 19) + 2 * (1 - tt) * tt * cx + tt * tt * (cx + 19), y0 = (1 - tt) * (1 - tt) * (cy + 4) + 2 * (1 - tt) * tt * (cy - 14) + tt * tt * (cy + 4);
        r0 += p('M' + n(x0) + ',' + n(y0) + ' l' + (lado * 6) + ',-6', { stroke: e.cilios === 'arco' ? '#ff8fc8' : cil, 'stroke-width': 1.8, 'stroke-linecap': 'round' }); });
      return r0;
    }
    // sombra: na pálpebra móvel, entre o olho e a dobrinha (esfumada sobe até a sobrancelha)
    function palpebra(alt, larg) { var a = g.q(-larg * 0.8, 2), b = g.q(larg, -4); return 'M' + pt(a) + 'C' + pt(g.q(-larg * 0.6, -alt * 0.7)) + ' ' + pt(g.q(larg * 0.5, -alt)) + ' ' + pt(b) + 'C' + pt(g.c2) + ' ' + pt(g.c1) + ' ' + pt(a) + 'Z'; }
    switch (e.sombra) {
      case 'simples': s += p(palpebra(30, 26), { fill: som.hex, opacity: 0.7 }); break;
      case 'esfumada': s += p(palpebra(40, 30), { fill: som.hex, opacity: 0.35 }) + p(palpebra(30, 26), { fill: esc(som.hex, 0.15), opacity: 0.65 }); break;
      case 'arco': s += p(palpebra(40, 30), { fill: '#7cc8ff', opacity: 0.75 }) + p(palpebra(34, 27), { fill: '#ffe066', opacity: 0.8 }) + p(palpebra(28, 25), { fill: '#ff8fc8', opacity: 0.85 }); break;
      case 'brilhante': s += p(palpebra(32, 27), { fill: som.hex, opacity: 0.8 }) + p(palpebra(32, 27), { fill: 'url(#' + I + 'shine)' }) + p(estrela4(cx + lado * 14, cy - 22, 4), { fill: '#fff' }) + circ(cx - lado * 6, cy - 20, 1.6, { fill: '#fff' }); break;
    }
    // dobrinha da pálpebra (olho fininho/monolid não tem)
    if (['fininhos', 'fininhosPuxados'].indexOf(e.formaOlho) < 0)
      s += p('M' + pt(g.q(-10, -15 * g.r)) + 'C' + pt(g.q(-2, -23 * g.r)) + ' ' + pt(g.q(14, -25 * g.r)) + ' ' + pt(g.q(25, -9)), { fill: 'none', stroke: esc(pele, 0.3), 'stroke-width': 1.2, 'stroke-linecap': 'round', opacity: men ? 0.3 : 0.5 });
    var sombraDoOlho = s; s = '';
    var forma = formaOlho(cx), clip = 'url(#' + I + (lado < 0 ? 'olhoE' : 'olhoD') + ')', corI = corAjustada(e, 'olhos').hex, ri = 13 * (g.r > 1 ? 1.06 : 1);
    s += p(forma, { fill: 'url(#' + I + 'esclera)' });
    s += '<g clip-path="' + clip + '"><g class="rig-iris">' + circ(ix, cy + 1.5, ri, { fill: 'url(#' + I + 'iris)' }) + circ(ix, cy + 1.5, ri - 0.6, { fill: 'none', stroke: esc(corI, 0.6), 'stroke-width': 1.4 }) +
      p('M' + n(ix - ri * 0.7) + ',' + n(cy + 6) + ' Q' + ix + ',' + n(cy + ri + 1) + ' ' + n(ix + ri * 0.7) + ',' + n(cy + 6), { fill: 'none', stroke: cla(corI, 0.45), 'stroke-width': 2.4, opacity: 0.55, 'stroke-linecap': 'round' }) +
      circ(ix, cy + 1.5, ri * 0.44, { fill: '#160e14' }) +
      circ(ix - lado * 4.5 - 1, cy - 4, ri * 0.3, { fill: '#fff' }) + circ(ix + lado * 4 + 1, cy + 7, ri * 0.13, { fill: '#fff', opacity: 0.9 }) + '</g>' +
      // sombra da pálpebra de cima no branco e na íris
      p('M' + pt(g.ini) + 'C' + pt(g.c1) + ' ' + pt(g.c2) + ' ' + pt(g.fim) + 'L' + pt(g.q(24, 3)) + 'C' + pt(g.q(10, -12 * g.r)) + ' ' + pt(g.q(-14, -4 * g.r)) + ' ' + pt(g.q(-20, 8)) + 'Z', { fill: '#2a0a1c', opacity: 0.16 }) + '</g>';
    // linha de baixo (bem fina) e o traço da pálpebra de cima
    s += p('M' + pt(g.fim) + 'C' + pt(g.b1) + ' ' + pt(g.b2) + ' ' + pt(g.ini), { fill: 'none', stroke: esc(pele, 0.45), 'stroke-width': 1.2, 'stroke-linecap': 'round', opacity: 0.75 });
    var lid = 'M' + pt(g.ini) + 'C' + pt(g.c1) + ' ' + pt(g.c2) + ' ' + pt(g.fim);
    s += p(tracoPalpebra(g, lado, men ? 1.2 : 2.2, !men), { fill: escuro, stroke: escuro, 'stroke-width': 0.8, 'stroke-linejoin': 'round' });
    if (e.delineado === 'fino') s += p(tracoPalpebra(g, lado, 2.6, true), { fill: del });
    if (e.delineado === 'grosso') s += p(tracoPalpebra(g, lado, 5, true), { fill: del });
    if (e.delineado === 'gatinho') {
      s += p(tracoPalpebra(g, lado, 3, true), { fill: del }) +
        p('M' + pt(g.q(22, -1)) + 'L' + pt(g.q(37, -15)) + 'L' + pt(g.q(14, -12)) + 'Z', { fill: del, stroke: del, 'stroke-width': 1.2, 'stroke-linejoin': 'round' });
    }
    // cílios: saem do traço da pálpebra, mais compridos para fora, curvados para cima e para fora
    var CIL = { curtos: [4, 7, 1.7, 0.5], longos: [5, 11, 1.8, 0.45], boneca: [7, 14, 2.1, 0.38], gatinho: [6, 11, 1.8, 0.35], volume: [11, 12, 1.9, 0.12], baixo: [5, 10, 1.8, 0.45], arco: [7, 12, 2.2, 0.3], strass: [5, 11, 1.8, 0.45], fadinha: [8, 13, 1.5, 0.2], dramaticos: [9, 18, 2.2, 0.2], coracao: [5, 11, 1.8, 0.45] }[e.cilios] || (men ? [0, 0, 0, 0] : [4, 7, 1.7, 0.5]);
    var arco = ['#ff5a6e', '#ff9f1c', '#ffd23f', '#5cc46a', '#5ac8ff', '#7a5cff', '#d05cff'];
    function naPalpebra(t2) { var a = bez(g.ini, g.c1, g.c2, g.fim, t2); a[1] -= 1.4; return a; }
    for (var i = 0; i < CIL[0]; i++) {
      var t = CIL[0] === 1 ? 0.8 : CIL[3] + i * (1 - CIL[3]) / (CIL[0] - 1);
      var qq = naPalpebra(t), x = qq[0], y = qq[1];
      var ang = -Math.PI / 2 + lado * (0.15 + t * 0.95), L = CIL[1] * (0.55 + t * 0.6);
      if (e.cilios === 'gatinho') L = CIL[1] * (0.35 + t * t * 1.3);
      if (e.cilios === 'fadinha') L = CIL[1] * (0.55 + (i % 2) * 0.55);   // fadinha: pontas alternadas, curtas e compridas
      var x2 = x + Math.cos(ang) * L, y2 = y + Math.sin(ang) * L;
      s += p('M' + n(x) + ',' + n(y) + 'Q' + n(x + Math.cos(ang) * L * 0.2) + ',' + n(y + Math.sin(ang) * L * 0.75) + ' ' + n(x2 + lado * 2.5) + ',' + n(y2 + 1), { fill: 'none', stroke: e.cilios === 'arco' ? arco[i % arco.length] : cil, 'stroke-width': CIL[2], 'stroke-linecap': 'round' });
    }
    if (e.cilios === 'boneca' || e.cilios === 'baixo') for (var k = 0; k < (e.cilios === 'baixo' ? 4 : 3); k++) { var bq = bez(g.fim, g.b1, g.b2, g.ini, 0.15 + k * 0.13); s += p('M' + n(bq[0]) + ',' + n(bq[1]) + 'l' + n(lado * 2.5) + ',6', { stroke: cil, 'stroke-width': 1.5, 'stroke-linecap': 'round' }); }
    if (e.cilios === 'strass') [0.3, 0.5, 0.7].forEach(function (t3) { var gq = naPalpebra(t3); s += circ(gq[0], gq[1] - 3, 2.2, { fill: '#fff', stroke: '#ff9fd2', 'stroke-width': 1 }); });
    if (e.cilios === 'coracao') s += p(coracao(cx + lado * 30, cy - 20, 4.2), { fill: '#ff4f8b', stroke: '#fff', 'stroke-width': 0.8 });
    if (e.cilios === 'fadinha') s += p(estrela4(cx + lado * 29, cy - 22, 4.5), { fill: '#fff' }) + circ(cx + lado * 22, cy - 28, 1.4, { fill: '#fff' });
    // formato do olho: o mesmo desenho, esticado e inclinado (menino: um pouco menor e mais reto)
    var FO = { amendoados: [1.1, 0.82, -4], grandes: [1.12, 1.12, 0], pequenos: [0.86, 0.86, 0], puxadinhos: [1.04, 0.86, -9], caidos: [1.04, 0.9, 9], fininhos: [1.08, 0.7, 0], fininhosPuxados: [1.08, 0.7, -8], sorridentes: [1, 1, 0] }[e.formaOlho] || [1, 1, 0];
    var sxO = FO[0] * (men ? 0.92 : 1), syO = FO[1] * (men ? 0.86 : 1), rotO = FO[2] * lado;
    var mexe = sxO !== 1 || syO !== 1 || rotO !== 0;
    var abre = mexe ? '<g transform="translate(' + cx + ' 214) rotate(' + rotO + ') scale(' + n(sxO * 100) / 100 + ' ' + n(syO * 100) / 100 + ') translate(' + (-cx) + ' -214)">' : '', fecha0 = mexe ? '</g>' : '';
    if (!piscar) return abre + sombraDoOlho + s + fecha0;
    /* piscar: a cada ~4,6 s o olho fecha por um instante — a pálpebra (cor da pele, com a sombra e o delineado)
       desce e os cílios ficam para baixo. Os dois olhos piscam juntos. */
    var fecha = 'M' + pt(g.ini) + 'C' + pt(g.q(-8, 13)) + ' ' + pt(g.q(12, 12)) + ' ' + pt(g.fim);
    var f = p(forma, { fill: pele, stroke: pele, 'stroke-width': 3 });
    if (e.sombra !== 'nenhum') f += p(forma, { fill: e.sombra === 'arco' ? '#ff8fc8' : som.hex, opacity: 0.6 });
    f += p(fecha, { fill: 'none', stroke: e.delineado !== 'nenhum' ? del : escuro, 'stroke-width': e.delineado === 'grosso' ? 4.5 : 2.6, 'stroke-linecap': 'round' });
    var nf = e.cilios === 'nenhum' || men ? 0 : Math.max(3, Math.min(7, CIL[0]));
    for (var j = 0; j < nf; j++) {
      var tj = 0.35 + j * 0.6 / Math.max(1, nf - 1), fq = bez(g.ini, g.q(-8, 13), g.q(12, 12), g.fim, tj);
      var Lj = 4 + tj * CIL[1] * 0.45;
      f += p('M' + n(fq[0]) + ',' + n(fq[1]) + 'Q' + n(fq[0] + lado * Lj * 0.3) + ',' + n(fq[1] + Lj * 0.7) + ' ' + n(fq[0] + lado * Lj * 0.7) + ',' + n(fq[1] + Lj * 0.85), { fill: 'none', stroke: e.cilios === 'arco' ? arco[j % arco.length] : cil, 'stroke-width': 1.6, 'stroke-linecap': 'round' });
    }
    var tempo = ' dur="4.6s" repeatCount="indefinite" keyTimes="0;0.92;0.935;0.975;0.99;1" calcMode="discrete"';
    return abre + sombraDoOlho + '<g>' + s + '<animate attributeName="opacity" values="1;1;0;0;1;1"' + tempo + '/></g>' +
      '<g opacity="0">' + f + '<animate attributeName="opacity" values="0;0;1;1;0;0"' + tempo + '/></g>' + fecha0;
  }
  // formato da boca: a mesma boca (com o batom) esticada; o sorrisinho ganha os cantinhos para cima
  function formaDaBoca(e, s) {
    if (e.sorrindo) return s;
    var F = { fininha: [1.02, 0.66], cheinha: [1.06, 1.32], larga: [1.3, 0.95], pequenininha: [0.76, 0.84], sorrisinho: [1.08, 0.9] }[e.formaBoca];
    if (!F) return s;
    var r = '<g transform="translate(200 272) scale(' + F[0] + ' ' + F[1] + ') translate(-200 -272)">' + s + '</g>';
    if (e.formaBoca === 'sorrisinho') r += p('M176,262 Q178,268 183,267 M224,262 Q222,268 217,267', { fill: 'none', stroke: '#b5655f', 'stroke-width': 1.8, 'stroke-linecap': 'round', opacity: 0.7 });
    return r;
  }
  function boca(e, cor, pele, I) {
    // sorriso aberto (desfile): cantos para cima, dentinhos e a cor do batom (ou a boca natural)
    if (e.sorrindo) {
      var cs = e.batom === 'nenhum' ? mistura(pele, '#d8606c', 0.45) : cor.hex;
      return p('M178,262 Q200,272 222,262 Q216,290 200,291 Q184,290 178,262Z', { fill: esc(cs, 0.45) }) + p('M182,265 Q200,272 218,265 L216,270 Q200,276 184,270Z', { fill: '#fff' }) +
        p('M190,284 Q200,280 210,284 Q200,290 190,284Z', { fill: '#ff8fa3', opacity: 0.9 }) + p('M178,262 Q200,272 222,262', { fill: 'none', stroke: cs, 'stroke-width': 4, 'stroke-linecap': 'round' }) +
        p('M180,266 Q184,288 200,291 Q216,288 220,266', { fill: 'none', stroke: cs, 'stroke-width': 3.4, 'stroke-linecap': 'round' }) + p('M176,260 Q177,264 180,264 M224,260 Q223,264 220,264', { fill: 'none', stroke: esc(pele, 0.3), 'stroke-width': 1.6, 'stroke-linecap': 'round' });
    }
    // menino sem batom: boquinha sorrindo, mais fina
    if (e.personagem === 'menino' && e.batom === 'nenhum') { var nm = mistura(pele, '#c86a6a', 0.35); return p('M184,268 Q200,282 216,268 Q200,276 184,268Z', { fill: cla(nm, 0.1) }) + p('M183,267 Q200,281 217,267', { fill: 'none', stroke: esc(nm, 0.35), 'stroke-width': 2.6, 'stroke-linecap': 'round' }); }
    // lábios em ilustração: arco do cupido marcado em cima e o de baixo mais cheio, com luz
    var cima = 'M182,267 C186,264 192,259 197,260.5 Q200,262 203,260.5 C208,259 214,264 218,267 Q200,270.5 182,267Z', baixo = 'M182,267 Q200,270.5 218,267 C214,277 207,281.5 200,281.5 C193,281.5 186,277 182,267Z';
    var meio = 'M181,267 Q200,272 219,267';
    if (e.batom === 'nenhum') { var nat = mistura(pele, '#e0707a', 0.4); return p(cima, { fill: esc(nat, 0.12) }) + p(baixo, { fill: nat }) + p(baixo, { fill: 'none', stroke: esc(nat, 0.2), 'stroke-width': 0.8, opacity: 0.6 }) + p(meio, { fill: 'none', stroke: esc(nat, 0.5), 'stroke-width': 1.5, 'stroke-linecap': 'round' }) + elip(203, 276, 5, 1.5, { fill: '#fff', opacity: 0.28 }); }
    var c = cor.hex, fill = e.batom === 'degrade' ? 'url(#' + I + 'lab)' : c;
    var s = p(cima, { fill: esc(c, 0.1) }) + p(baixo, { fill: fill }) + p(cima, { fill: fill, opacity: 0.6 }) + p(meio, { fill: 'none', stroke: esc(c, 0.5), 'stroke-width': 1.5, 'stroke-linecap': 'round' }) + p(cima, { fill: 'none', stroke: esc(c, 0.25), 'stroke-width': 0.8, opacity: 0.6 }) + elip(203, 276, 5, 1.5, { fill: '#fff', opacity: 0.28 });
    if (e.batom === 'gloss') s += elip(201, 277, 8, 2.8, { fill: '#fff', opacity: 0.75 }) + elip(194, 264, 3, 1.4, { fill: '#fff', opacity: 0.6 });
    if (e.batom === 'brilho') {
      // glitter de verdade na boca: lantejoulas por toda a boca (só dentro dela) e duas faísquinhas
      var rb = sorteio(7), pb = [], kb;
      for (kb = 0; kb < 70; kb++) { var bx = 184 + rb() * 32, by = 262 + rb() * 23, dx = (bx - 200) / 18; if (by > 266 - 3 * (1 - dx * dx) && by < 266 + 19 * (1 - dx * dx)) pb.push([bx, by]); }
      s += '<defs><clipPath id="' + I + 'labG"><path d="' + cima + '"/><path d="' + baixo + '"/></clipPath></defs><g clip-path="url(#' + I + 'labG)">' + pb.map(function (q) { return lantejoula(q[0], q[1], 1.3 + rb() * 0.9, cla(c, 0.15), rb, rb() < 0.45); }).join('') + '</g>' +
        faisca(193, 277, 6, cla(c, 0.3), rb) + faisca(211, 268, 4.6, cla(c, 0.3), rb) + faisca(186, 266, 3.6, cla(c, 0.3), rb);
    }
    return s;
  }
  function adesivo(tipo, x, y, s) {
    switch (tipo) {
      case 'coracao': return p(coracao(x, y, s * 0.8), { fill: '#ff4f8b', stroke: '#fff', 'stroke-width': 1.5 });
      case 'estrela': return p(estrela5(x, y, s, s * 0.45), { fill: '#ffd23f', stroke: '#e89a10', 'stroke-width': 1.3, 'stroke-linejoin': 'round' });
      case 'lua': return p('M' + (x + 3) + ',' + (y - s) + 'A' + s + ',' + s + ' 0 1 0 ' + (x + 3) + ',' + (y + s) + 'A' + (s * 0.72) + ',' + (s * 0.85) + ' 0 1 1 ' + (x + 3) + ',' + (y - s) + 'Z', { fill: '#ffe07a', stroke: '#e0a520', 'stroke-width': 1.3 });
      case 'borboleta': return elip(x - 6, y - 4, 7, 6, { fill: '#ff8fc8' }) + elip(x + 6, y - 4, 7, 6, { fill: '#ff8fc8' }) + elip(x - 5, y + 5, 5, 4, { fill: '#b892ff' }) + elip(x + 5, y + 5, 5, 4, { fill: '#b892ff' }) + p('M' + x + ',' + (y - 8) + 'L' + x + ',' + (y + 9), { stroke: '#4a2c20', 'stroke-width': 2, 'stroke-linecap': 'round' });
      case 'arco': return ['#ff5a6e', '#ffd23f', '#5ac8ff'].map(function (c, i) { var r = s - i * 3.2; return p('M' + (x - r) + ',' + (y + 4) + 'A' + r + ',' + r + ' 0 0 1 ' + (x + r) + ',' + (y + 4), { fill: 'none', stroke: c, 'stroke-width': 3.2 }); }).join('');
      case 'flor': return flor(x, y, s * 0.42, '#ff8fc8', '#ffd23f');
      case 'floco': var f = ''; for (var i = 0; i < 3; i++) { var a = i * Math.PI / 3; f += p('M' + n(x - Math.cos(a) * s) + ',' + n(y - Math.sin(a) * s) + 'L' + n(x + Math.cos(a) * s) + ',' + n(y + Math.sin(a) * s), { stroke: '#5ab4ff', 'stroke-width': 2.4, 'stroke-linecap': 'round' }); } return f + circ(x, y, 2.4, { fill: '#fff' });
      case 'concha': return p('M' + (x - s) + ',' + (y + 5) + 'Q' + (x - s * 1.1) + ',' + (y - s) + ' ' + x + ',' + (y - s) + 'Q' + (x + s * 1.1) + ',' + (y - s) + ' ' + (x + s) + ',' + (y + 5) + 'Q' + x + ',' + (y + s * 0.8) + ' ' + (x - s) + ',' + (y + 5) + 'Z', { fill: '#ffb3c8', stroke: '#e0708f', 'stroke-width': 1.4 }) +
        [-6, 0, 6].map(function (dx) { return p('M' + x + ',' + (y + 8) + 'L' + (x + dx) + ',' + (y - s + 3), { stroke: '#e0708f', 'stroke-width': 1.2 }); }).join('');
    }
    return '';
  }
  function glitter(e, cor) {
    var r = sorteio({ bochechas: 11, olhos: 23, cabelo: 37, tudo: 51 }[e.glitter]), pts = [];
    function em(cx, cy, rx, ry, q) { for (var k = 0; k < q; k++) { var a = r() * Math.PI * 2, d = Math.sqrt(r()); pts.push([cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d]); } }
    if (e.glitter === 'bochechas') { em(150, 250, 24, 16, 26); em(250, 250, 24, 16, 26); return purpurina(pts, cor, r, 2.4, 9); }
    if (e.glitter === 'olhos') { em(130, 200, 12, 24, 18); em(270, 200, 12, 24, 18); em(164, 178, 20, 6, 10); em(236, 178, 20, 6, 10); return purpurina(pts, cor, r, 2.2, 8); }
    if (e.glitter === 'cabelo') { em(200, 140, 100, 40, 60); if (['longo', 'ondulado', 'trancas', 'chiquinhas'].indexOf(e.cabelo) >= 0) { em(110, 320, 14, 100, 18); em(290, 320, 14, 100, 18); } return purpurina(pts, cor, r, 2.8, 8); }
    for (var i = 0; i < 110; i++) pts.push([60 + r() * 280, 80 + r() * 590]);
    return purpurina(pts, cor, r, 4.2, 4);
  }

  // ---------- roupas ----------
  function tronco(y2, alta) {
    return alta ? 'M140,368 Q137,346 152,341 L184,328 L216,328 L248,341 Q263,346 260,368 L251,' + y2 + ' Q200,' + (y2 + 7) + ' 149,' + y2 + 'Z'
      : 'M140,368 Q137,346 152,341 L182,336 Q200,354 218,336 L248,341 Q263,346 260,368 L251,' + y2 + ' Q200,' + (y2 + 7) + ' 149,' + y2 + 'Z';
  }
  var MANGA_CURTA = 'M152,340 Q133,344 127,368 L120,400 L150,407 L158,374Z';
  var MANGA_LONGA = 'M152,340 Q131,344 125,370 Q113,430 104,490 L132,496 Q141,432 158,378Z';
  var MANGA_BUFANTE = 'M152,338 Q124,330 120,364 Q120,390 146,392 Q160,380 158,350Z';
  function blusa(tipo, cor, peca, linha, pele) {
    var c = esc(cor.hex, 0.3), s = '';
    switch (tipo) {
      case 'nenhum': s = peca('M162,344 L170,342 Q200,362 230,342 L238,344 Q254,352 257,376 L249,462 Q200,469 151,462 L143,376 Q146,352 162,344Z', { hex: '#fbf7ff' }, 'x'); break;
      case 'camiseta': s = peca([tronco(462), MANGA_CURTA, espelhar(MANGA_CURTA)], cor, 'blusa') + linha('M182,336 Q200,354 218,336', c, 3); break;
      case 'regata': s = peca('M157,343 L171,338 Q200,370 229,338 L243,343 Q256,352 260,372 L251,462 Q200,469 149,462 L140,372 Q144,352 157,343Z', cor, 'blusa'); break;
      case 'babados':
        s = peca([tronco(452), MANGA_BUFANTE, espelhar(MANGA_BUFANTE)], cor, 'blusa');
        var bab = 'M148,450'; for (var i = 0; i < 8; i++) bab += 'Q' + (154 + i * 13) + ',' + 476 + ' ' + (161 + i * 13) + ',' + 452;
        s += peca(bab + 'L253,452 L252,446 L148,446Z', { hex: cla(cor.hex, 0.25), brilho: cor.brilho }, 'x') + linha('M182,336 Q192,348 200,350 Q208,348 218,336', cla(cor.hex, 0.6), 5);
        break;
      case 'sueter':
        s = peca([tronco(470, true), MANGA_LONGA, espelhar(MANGA_LONGA)], cor, 'blusa') + peca('M182,320 L218,320 L218,338 Q200,344 182,338Z', { hex: esc(cor.hex, 0.08) }, 'x');
        s += linha('M150,460 L250,460', c, 2.5, 0.7) + linha('M106,482 L131,486', c, 2.5, 0.7) + linha('M294,482 L269,486', c, 2.5, 0.7);
        for (var k = 0; k < 6; k++) s += linha('M' + (176 + k * 9) + ',372 l4,6 l4,-6', cla(cor.hex, 0.5), 2, 0.8);
        break;
      case 'jaqueta':
        s = peca(tronco(462), { hex: '#fbf7ff' }, 'x') + peca(['M152,341 L184,334 L192,380 L180,465 L149,462 L140,368 Q137,346 152,341Z', espelhar('M152,341 L184,334 L192,380 L180,465 L149,462 L140,368 Q137,346 152,341Z'), MANGA_LONGA, espelhar(MANGA_LONGA)], cor, 'blusa');
        s += peca(['M184,334 L170,360 L192,380Z', espelhar('M184,334 L170,360 L192,380Z')], { hex: esc(cor.hex, 0.15) }, 'x') + circ(186, 410, 3, { fill: c }) + circ(186, 436, 3, { fill: c });
        break;
      // anos 70 (dono, 20/Nov/2026): camisa de gola grande e pontuda, aberta em V no peito, manga comprida
      case 'disco':
      case 'jaquetaGola':
        var creme = tipo === 'disco' ? cor : { hex: '#f3e6c8' }, cc = esc(creme.hex, 0.3);
        if (tipo === 'disco') s = peca([tronco(462), MANGA_LONGA, espelhar(MANGA_LONGA)], cor, 'blusa');
        else s = peca(tronco(462), creme, 'x');
        s += p('M187,336 L200,392 L213,336Z', { fill: pele || cla(creme.hex, 0.5) });   // decote aberto
        if (tipo === 'jaquetaGola') {
          var painel = 'M152,341 L180,334 L190,392 L182,468 L149,462 L140,368 Q137,346 152,341Z';
          s += peca([painel, espelhar(painel), MANGA_LONGA, espelhar(MANGA_LONGA)], cor, 'blusa');
          s += p('M160,352 Q158,400 156,450 M240,352 Q242,400 244,450', { fill: 'none', stroke: '#fff', 'stroke-width': 3, opacity: 0.18, 'stroke-linecap': 'round' });   // brilho do couro
        }
        var gola = 'M186,333 L199,347 L174,378 L154,346Z';
        s += p(gola, { fill: cla(creme.hex, 0.25), stroke: cc, 'stroke-width': 1.3, 'stroke-linejoin': 'round' }) + p(espelhar(gola), { fill: cla(creme.hex, 0.25), stroke: cc, 'stroke-width': 1.3, 'stroke-linejoin': 'round' });
        [404, 430, 456].forEach(function (y) { s += circ(200, y, 2.4, { fill: cla(creme.hex, 0.6), stroke: cc, 'stroke-width': 0.8 }); });
        break;
      case 'moletom':
        s = peca([tronco(472, true), MANGA_LONGA, espelhar(MANGA_LONGA)], cor, 'blusa') + peca('M156,344 Q200,312 244,344 Q232,362 200,358 Q168,362 156,344Z', { hex: esc(cor.hex, 0.12) }, 'x');
        s += peca('M170,420 L230,420 L238,458 L162,458Z', { hex: esc(cor.hex, 0.06) }, 'x') + linha('M192,354 L189,390', '#fff', 2.5) + linha('M208,354 L211,390', '#fff', 2.5) + circ(189, 392, 2.6, { fill: '#fff' }) + circ(211, 392, 2.6, { fill: '#fff' });
        break;
      case 'camisa':
        s = peca([tronco(462), MANGA_CURTA, espelhar(MANGA_CURTA)], cor, 'blusa') + linha('M200,350 L200,462', c, 1.6, 0.7);
        s += peca(['M184,334 L166,356 L198,362 L200,348Z', espelhar('M184,334 L166,356 L198,362 L200,348Z')], { hex: cla(cor.hex, 0.3) }, 'x');
        [376, 400, 424, 448].forEach(function (y) { s += circ(205, y, 2.8, { fill: '#fff', stroke: c, 'stroke-width': 1 }); });
        break;
      case 'ombro':
        s = peca(['M140,372 Q200,384 260,372 L251,462 Q200,469 149,462Z', 'M128,372 Q118,392 124,412 L150,408 Q152,388 146,374Z', espelhar('M128,372 Q118,392 124,412 L150,408 Q152,388 146,374Z')], cor, 'blusa');
        var ond = 'M130,360 Q200,374 270,360 L270,384'; for (var o2 = 0; o2 < 10; o2++) ond += 'Q' + n(263 - o2 * 14) + ',' + (398 - (o2 % 2) * 4) + ' ' + n(256 - o2 * 14) + ',384';
        s += peca(ond + 'Z', { hex: cla(cor.hex, 0.25), brilho: cor.brilho }, 'x');
        break;
      case 'laco': s = peca([tronco(462), MANGA_BUFANTE, espelhar(MANGA_BUFANTE)], cor, 'blusa') + laco(200, 348, 13, '#fbf7ff'); break;
      case 'colete':
        s = peca([tronco(462), MANGA_CURTA, espelhar(MANGA_CURTA)], { hex: '#fbf7ff' }, 'x');
        s += peca(['M150,342 L182,336 L194,392 L186,466 L149,462 L140,368 Q137,346 150,342Z', espelhar('M150,342 L182,336 L194,392 L186,466 L149,462 L140,368 Q137,346 150,342Z')], cor, 'blusa');
        s += circ(186, 410, 3, { fill: c }) + circ(186, 434, 3, { fill: c }) + circ(214, 410, 3, { fill: c }) + circ(214, 434, 3, { fill: c });
        break;
      case 'pijama':
        s = peca([tronco(468), MANGA_LONGA, espelhar(MANGA_LONGA)], cor, 'blusa') + peca(['M182,336 L166,348 L196,364Z', espelhar('M182,336 L166,348 L196,364Z')], { hex: '#fbf7ff' }, 'x');
        [380, 410, 440].forEach(function (y) { s += circ(200, y, 3.5, { fill: '#fff', stroke: c, 'stroke-width': 1.2 }); });
        s += linha('M200,360 L200,466', c, 1.6, 0.7);
        break;
    }
    return s;
  }
  function saia(tipo, cor, peca, linha) {
    var c = esc(cor.hex, 0.3), s = '';
    switch (tipo) {
      case 'curta': s = peca('M154,446 L246,446 L276,530 Q200,546 124,530Z', cor, 'saia') + linha('M180,452 L170,534', c, 1.6, 0.5) + linha('M220,452 L230,534', c, 1.6, 0.5); break;
      case 'tutu':
        [[0, 0.45, 112, 288, 516], [1, 0.2, 118, 282, 506], [2, 0, 128, 272, 494]].forEach(function (cam) {
          var d = 'M154,444 L246,444 L' + cam[3] + ',' + cam[4];
          for (var i = 0; i < 10; i++) { var x = cam[3] - (i + 0.5) * (cam[3] - cam[2]) / 10, x2 = cam[3] - (i + 1) * (cam[3] - cam[2]) / 10; d += 'L' + n(x) + ',' + (cam[4] + 12) + 'L' + n(x2) + ',' + cam[4]; }
          s += peca(d + 'Z', { hex: cla(cor.hex, cam[1]), brilho: cor.brilho }, 'x');
        });
        for (var k = 0; k < 7; k++) s += circ(140 + k * 20, 470 + (k % 2) * 14, 1.8, { fill: '#fff', opacity: 0.85 });
        break;
      case 'longa': s = peca('M154,446 L246,446 Q264,540 272,630 Q200,644 128,630 Q136,540 154,446Z', cor, 'saia') + linha('M186,456 Q180,540 172,636', c, 1.6, 0.45) + linha('M214,456 Q220,540 228,636', c, 1.6, 0.45); break;
      case 'balone': s = peca('M154,446 L246,446 Q292,488 262,530 Q200,544 138,530 Q108,488 154,446Z', cor, 'saia') + peca('M140,520 Q200,534 260,520 Q264,528 258,534 Q200,548 142,534 Q136,528 140,520Z', { hex: esc(cor.hex, 0.12), brilho: cor.brilho }, 'x'); break;
      case 'camadas':
        s = peca('M134,504 Q200,514 266,504 L280,542 Q200,556 120,542Z', { hex: cla(cor.hex, 0.32), brilho: cor.brilho }, 'x') + peca('M146,474 Q200,482 254,474 L266,508 Q200,518 134,508Z', { hex: cla(cor.hex, 0.16), brilho: cor.brilho }, 'x') + peca('M154,446 L246,446 L254,478 Q200,486 146,478Z', cor, 'saia');
        break;
      case 'jeans':
        var pesp = { fill: 'none', stroke: '#ffd166', 'stroke-width': 1.5, 'stroke-dasharray': '3 3' };
        s = peca('M154,446 L246,446 L260,522 Q200,530 140,522Z', cor, 'saia') + p('M162,454 L150,516', pesp) + p(espelhar('M162,454 L150,516'), pesp) + p('M144,514 Q200,522 256,514', pesp) + p('M164,462 Q176,474 188,462', pesp) + circ(200, 452, 3, { fill: '#c9a352' });
        break;
      case 'pregas':
        s = peca('M154,446 L246,446 L266,526 L134,526Z', cor, 'saia');
        for (var j = 1; j < 7; j++) s += linha('M' + (154 + j * 13) + ',452 L' + (134 + j * 18.9) + ',526', c, 1.6, 0.6);
        break;
    }
    return s + peca('M152,440 L248,440 L248,453 L152,453Z', { hex: esc(cor.hex, 0.12), brilho: cor.brilho }, 'x');
  }
  function calca(tipo, cor, peca, linha, pele) {
    var c = esc(cor.hex, 0.3), s = '';
    switch (tipo) {
      case 'jeans': s = peca('M152,446 L248,446 L250,480 L244,642 L210,642 L203,494 L197,494 L190,642 L156,642 L150,480Z', cor, 'calca') + linha('M200,452 L200,494', c, 1.6) + linha('M160,462 Q172,474 184,462', c, 1.6, 0.7) + linha('M216,462 Q228,474 240,462', c, 1.6, 0.7); break;
      case 'shorts': s = peca('M152,446 L248,446 L256,514 L206,516 L200,486 L194,516 L144,514Z', cor, 'calca') + linha('M147,506 L195,508', cla(cor.hex, 0.4), 2, 0.8) + linha('M205,508 L253,506', cla(cor.hex, 0.4), 2, 0.8); break;
      case 'legging': s = peca('M154,446 L246,446 L242,642 L211,642 L202,496 L198,496 L189,642 L158,642Z', cor, 'calca'); break;
      case 'pantalona': s = peca('M152,446 L248,446 L253,500 L268,642 L208,642 L200,496 L192,642 L132,642 L147,500Z', cor, 'calca') + linha('M176,500 L164,640', c, 1.4, 0.5) + linha('M224,500 L236,640', c, 1.4, 0.5); break;
      case 'bermuda': s = peca('M152,446 L248,446 L254,560 L208,562 L201,492 L199,492 L192,562 L146,560Z', cor, 'calca') + peca(['M146,550 L192,552 L192,564 L146,562Z', 'M208,552 L254,550 L254,562 L208,564Z'], { hex: esc(cor.hex, 0.1), brilho: cor.brilho }, 'x'); break;
      case 'jogger':
        s = peca('M151,446 L249,446 L252,488 L246,624 L210,624 L202,494 L198,494 L190,624 L154,624 L148,488Z', cor, 'calca') + peca(['M156,616 L190,616 L188,642 L158,642Z', 'M210,616 L244,616 L242,642 L212,642Z'], { hex: esc(cor.hex, 0.15) }, 'x');
        s += linha('M152,470 L156,616', '#fff', 3, 0.8) + linha('M248,470 L244,616', '#fff', 3, 0.8) + linha('M194,452 L190,474', '#fff', 2) + linha('M206,452 L210,474', '#fff', 2);
        break;
      case 'rasgada':
        s = peca('M152,446 L248,446 L250,480 L244,642 L210,642 L203,494 L197,494 L190,642 L156,642 L150,480Z', cor, 'calca') + linha('M200,452 L200,494', c, 1.6);
        [[172, 560], [230, 576], [170, 602], [226, 524]].forEach(function (q) { s += elip(q[0], q[1], 8, 3.6, { fill: pele || '#f1c19c' }) + p('M' + (q[0] - 8) + ',' + (q[1] - 1) + ' L' + (q[0] + 8) + ',' + (q[1] - 1) + ' M' + (q[0] - 7) + ',' + (q[1] + 2) + ' L' + (q[0] + 7) + ',' + (q[1] + 2), { stroke: '#fff', 'stroke-width': 1.1 }); });
        break;
      case 'pijama': s = peca('M150,446 L250,446 L254,486 L252,628 L208,628 L201,494 L199,494 L192,628 L148,628 L146,486Z', cor, 'calca') + peca(['M148,616 L192,616 L192,630 L148,630Z', 'M208,616 L252,616 L252,630 L208,630Z'], { hex: '#fbf7ff' }, 'x'); break;
    }
    return s + peca('M152,440 L248,440 L248,452 L152,452Z', { hex: esc(cor.hex, 0.12), brilho: cor.brilho }, 'x');
  }
  function vestido(tipo, cor, peca, linha, pele, peleE) {
    var c = esc(cor.hex, 0.3), cl = cla(cor.hex, 0.35), s = '';
    var corpete = 'M146,366 Q140,350 154,344 L166,342 Q176,360 200,355 Q224,360 234,342 L246,344 Q260,350 254,366 L249,454 Q200,462 151,454Z';
    switch (tipo) {
      case 'princesa':
        s = peca('M151,446 Q200,458 249,446 Q292,520 320,642 Q200,676 80,642 Q108,520 151,446Z', cor, 'vestido');
        [[176, 120], [200, 200], [224, 280]].forEach(function (q) { s += linha('M' + q[0] + ',460 Q' + (q[0] + (q[1] - 200) * 0.2) + ',560 ' + q[1] + ',650', c, 1.8, 0.45); });
        var bainha = 'M84,640'; for (var i = 0; i < 12; i++) bainha += 'Q' + n(94 + i * 19.7) + ',' + (i % 2 ? 668 : 672) + ' ' + n(104 + i * 19.7) + ',' + (i === 11 ? 640 : 652);
        s += peca(bainha + 'L316,640 Q200,664 84,640Z', { hex: cl, brilho: cor.brilho }, 'x');
        s += peca(corpete, cor, 'vestido') + peca([MANGA_BUFANTE, espelhar(MANGA_BUFANTE)], { hex: cl, brilho: cor.brilho }, 'x');
        s += peca('M151,444 Q200,456 249,444 L249,456 Q200,468 151,456Z', { hex: esc(cor.hex, 0.15), brilho: cor.brilho }, 'x') + p(estrela5(200, 452, 8, 3.5), { fill: '#fff', stroke: c, 'stroke-width': 1 });
        break;
      case 'rodado':
        s = peca('M151,446 Q200,456 249,446 L288,548 Q200,570 112,548Z', cor, 'vestido') + peca([tronco(452), MANGA_BUFANTE, espelhar(MANGA_BUFANTE)], cor, 'vestido');
        s += linha('M180,456 L166,556', c, 1.6, 0.45) + linha('M220,456 L234,556', c, 1.6, 0.45) + peca('M151,442 L249,442 L249,454 L151,454Z', { hex: '#fbf7ff' }, 'x');
        break;
      case 'sereia':
        s = peca('M146,366 Q140,350 154,344 L166,342 Q200,364 234,342 L246,344 Q260,350 254,366 L248,452 Q254,520 241,586 Q264,630 300,664 Q200,680 100,664 Q136,630 159,586 Q146,520 152,452Z', cor, 'vestido');
        for (var r = 0; r < 4; r++) for (var k = 0; k < 4 + r; k++) s += p('M' + n(160 + k * (80 / (3 + r)) - r * 4) + ',' + (470 + r * 30) + 'q6,8 12,0', { fill: 'none', stroke: cl, 'stroke-width': 1.8, opacity: 0.8 });
        s += peca('M159,586 Q200,598 241,586 Q264,630 300,664 Q200,680 100,664 Q136,630 159,586Z', { hex: cla(cor.hex, 0.2), brilho: true }, 'x');
        s += circ(175, 350, 4, { fill: '#fff' }) + circ(225, 350, 4, { fill: '#fff' });
        break;
      case 'verao':
        s = peca('M160,344 L170,342 Q200,368 230,342 L240,344 Q252,356 250,380 L248,450 L282,568 Q200,584 118,568 L152,450 L150,380 Q148,356 160,344Z', cor, 'vestido');
        s += linha('M165,343 L162,330', c, 3) + linha('M235,343 L238,330', c, 3) + peca('M150,446 L250,446 L250,456 L150,456Z', { hex: '#fbf7ff' }, 'x');
        break;
      case 'festa':
        s = peca('M151,446 Q200,456 249,446 L284,540 Q200,560 116,540Z', cor, 'vestido');
        var tule = 'M151,450 L249,450 L296,548'; for (var t = 0; t < 12; t++) tule += 'L' + n(296 - (t + 0.5) * 16) + ',' + 564 + 'L' + n(296 - (t + 1) * 16) + ',548';
        s += p(tule + 'Z', { fill: cla(cor.hex, 0.55), opacity: 0.6, stroke: cla(cor.hex, 0.2), 'stroke-width': 1.5 });
        s += peca(corpete, cor, 'vestido') + laco(200, 452, 20, esc(cor.hex, 0.05));
        break;
      case 'gala':
        s = peca('M148,344 L172,336 L252,366 Q258,374 254,384 L250,452 Q262,540 272,642 Q200,660 128,642 Q138,540 150,452 L146,384 Q142,356 148,344Z', cor, 'vestido');
        s += linha('M190,462 Q184,560 176,646', c, 1.6, 0.45) + linha('M216,462 Q226,560 236,646', c, 1.6, 0.45) + p(estrela5(166, 348, 9, 4), { fill: '#fff', stroke: c, 'stroke-width': 1 });
        for (var g = 0; g < 9; g++) s += circ(142 + g * 15, 626 - (g % 2) * 10, 1.8, { fill: '#fff', opacity: 0.85 });
        break;
      case 'jardineira':
        s = peca([tronco(462), MANGA_CURTA, espelhar(MANGA_CURTA)], { hex: '#fbf7ff' }, 'x');
        s += peca('M166,372 L234,372 L238,446 L282,552 Q200,570 118,552 L162,446Z', cor, 'vestido') + peca(['M166,374 L158,342 L170,340 L178,374Z', espelhar('M166,374 L158,342 L170,340 L178,374Z')], cor, 'x');
        s += circ(172, 378, 3.2, { fill: '#ffd166', stroke: c }) + circ(228, 378, 3.2, { fill: '#ffd166', stroke: c }) + peca('M184,392 L216,392 L214,416 Q200,422 186,416Z', { hex: esc(cor.hex, 0.08) }, 'x');
        break;
      case 'macacao':
        s = peca('M157,343 L171,338 Q200,370 229,338 L243,343 Q254,352 254,372 L251,452 L253,500 L268,642 L208,642 L200,496 L192,642 L132,642 L147,500 L149,452 L146,372 Q146,352 157,343Z', cor, 'vestido');
        s += peca('M149,444 L251,444 L251,457 L149,457Z', { hex: esc(cor.hex, 0.18), brilho: cor.brilho }, 'x') + ret(192, 443, 16, 15, { fill: 'none', stroke: '#ffd166', 'stroke-width': 2.5, rx: 3 });
        break;
      case 'tomara':
        s = peca('M151,446 Q200,456 249,446 Q302,496 264,548 Q200,560 136,548 Q98,496 151,446Z', cor, 'vestido') + peca(corpete, cor, 'vestido');
        s += peca('M151,444 Q200,456 249,444 L249,456 Q200,468 151,456Z', { hex: cla(cor.hex, 0.3), brilho: cor.brilho }, 'x') + laco(200, 452, 10, cla(cor.hex, 0.35));
        break;
      case 'casaco':
        s = peca(['M140,368 Q137,346 152,341 L184,330 L216,330 L248,341 Q263,346 260,368 L270,562 Q200,574 130,562Z', MANGA_LONGA, espelhar(MANGA_LONGA)], cor, 'vestido') + linha('M200,362 L200,566', c, 1.8, 0.6);
        s += peca('M138,446 L262,446 L263,460 L137,460Z', { hex: esc(cor.hex, 0.18) }, 'x') + p('M168,334 Q200,352 232,334 Q236,348 226,362 Q200,372 174,362 Q164,348 168,334Z', { fill: '#fff6ec', stroke: '#e6d6c6', 'stroke-width': 1.5 });
        [392, 420, 486, 516].forEach(function (y) { s += circ(186, y, 3.2, { fill: c }) + circ(214, y, 3.2, { fill: c }); });
        break;
      case 'fada':
        s = peca('M151,446 Q200,456 249,446 L270,522 L252,506 L246,554 L226,522 L200,570 L174,522 L154,554 L148,506 L130,522Z', { hex: cla(cor.hex, 0.3), brilho: cor.brilho }, 'x');
        s += peca('M151,446 Q200,456 249,446 L262,506 L244,494 L234,532 L216,504 L200,540 L184,504 L166,532 L156,494 L138,506Z', cor, 'vestido') + peca(corpete, cor, 'vestido');
        for (var fz = 0; fz < 6; fz++) s += p(estrela4(150 + fz * 20, 480 + (fz % 2) * 26, 3.5), { fill: '#fff', opacity: 0.9 });
        break;
      case 'camisola':
        s = peca('M148,342 Q200,330 252,342 Q262,350 260,372 L272,602 Q200,616 128,602 L140,372 Q138,350 148,342Z', cor, 'vestido') + peca([MANGA_CURTA, espelhar(MANGA_CURTA)], cor, 'vestido');
        var renda = 'M130,598'; for (var q = 0; q < 10; q++) renda += 'Q' + n(137 + q * 14) + ',618 ' + n(144 + q * 14) + ',600';
        s += p(renda + 'L270,600 L270,594 L130,594Z', { fill: '#fff', stroke: '#e6dcf0', 'stroke-width': 1.5 }) + laco(200, 350, 9, '#ff8fc8');
        break;
    }
    return s;
  }
  /* ---------- capa de chuva (dono, 20/Nov/2026, com foto de referência) ----------
     Vai por cima de qualquer roupa, até o joelho, com mangas compridas e capuz na cabeça (capuzAtras / capuzFrente).
     transparente: plástico rosinha que deixa ver a roupa, com unicórnios, arco-íris e estrelinhas; patinho: amarela,
     bolsos com vivo vermelho e o capuz com olhinhos e bico; colorida: lisa com botões de pressão e bolsos de lapela;
     arcoiris: listras de arco-íris. */
  var CAPA_CORPO = 'M150,346 Q160,334 182,332 L218,332 Q240,334 250,346 L262,372 L286,566 Q200,580 114,566 L138,372Z';
  function capaX(y, lado) { var k = (y - 372) / (566 - 372); return lado < 0 ? 138 - 24 * k : 262 + 24 * k; }   // borda da capa na altura y
  function unicornio(x, y, k) {
    k = k || 1;
    function q(v) { return n(v * k); }
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      p('M' + q(-6) + ',' + q(-7) + ' Q' + q(-12) + ',' + q(0) + ' ' + q(-8) + ',' + q(8), { fill: 'none', stroke: '#ff8fc8', 'stroke-width': n(3.4 * k), 'stroke-linecap': 'round' }) +   // crina
      circ(0, 0, 7 * k, { fill: '#fff', stroke: '#c9b6d9', 'stroke-width': 0.8 }) + elip(5 * k, 3 * k, 4.6 * k, 3.6 * k, { fill: '#fff', stroke: '#c9b6d9', 'stroke-width': 0.8 }) +
      p('M' + q(-1) + ',' + q(-6) + ' L' + q(2) + ',' + q(-15) + ' L' + q(4) + ',' + q(-5) + 'Z', { fill: '#ffd23f', stroke: '#d9a520', 'stroke-width': 0.6 }) +   // chifre
      circ(1.5 * k, -1 * k, 1.1 * k, { fill: '#3a2440' }) + circ(6.5 * k, 3 * k, 0.7 * k, { fill: '#c9a0b8' }) + '</g>';
  }
  function unicornioPreso(x, y, k) { return rigido(x, y, unicornio(x, y, k)); }   // na capa: vai para o lugar certo do corpo sem esticar
  function arcoIris(x, y, r) {
    var s = '';
    ['#ff5f6d', '#ffb03b', '#ffe14d', '#5fd38d', '#4fa3ff', '#a77bff'].forEach(function (c, i) {
      var ri = r - i * r * 0.13;
      s += p('M' + n(x - ri) + ',' + y + ' A' + n(ri) + ',' + n(ri) + ' 0 0 1 ' + n(x + ri) + ',' + y, { fill: 'none', stroke: c, 'stroke-width': n(r * 0.13 + 0.3) });
    });
    return s + circ(x - r, y, r * 0.28, { fill: '#fff' }) + circ(x + r, y, r * 0.28, { fill: '#fff' });
  }
  function capa(tipo, cor, peca, mangas) {
    mangas = mangas || { e: true, d: true };
    var c = esc(cor.hex, 0.3), s = '', formas = [CAPA_CORPO].concat(mangas.e ? [MANGA_LONGA] : [], mangas.d ? [espelhar(MANGA_LONGA)] : []);
    var vivo = tipo === 'patinho' ? '#e8384f' : tipo === 'transparente' ? esc(cor.hex, 0.12) : tipo === 'arcoiris' ? '#a77bff' : cla(cor.hex, 0.5);
    if (tipo === 'transparente') {
      s += '<g opacity=".55">' + peca(formas, cor, 'x') + '</g>';
      s += unicornioPreso(226, 404, 1.7) + arcoIris(170, 432, 16) + unicornioPreso(168, 500, 1.5) + arcoIris(234, 506, 15) + unicornioPreso(232, 552, 1.3) + arcoIris(150, 552, 12);
      [[196, 452], [244, 452], [180, 528], [210, 372]].forEach(function (q) { s += p(estrela4(q[0], q[1], 4), { fill: '#fff', opacity: 0.95 }); });
      s += p('M158,364 Q148,450 146,548', { fill: 'none', stroke: '#fff', 'stroke-width': 5, opacity: 0.45, 'stroke-linecap': 'round' }) +   // brilho do plástico
        p('M244,380 Q252,450 258,520', { fill: 'none', stroke: '#fff', 'stroke-width': 3, opacity: 0.35, 'stroke-linecap': 'round' });
    } else if (tipo === 'arcoiris') {
      s += peca(formas, cor, 'x');
      var cores = ['#ff5f6d', '#ffb03b', '#ffe14d', '#5fd38d', '#4fa3ff', '#a77bff'];
      for (var i = 0; i < 6; i++) {
        var y0 = 372 + i * 32.3, y1 = y0 + 32.3;
        s += p('M' + n(capaX(y0, -1)) + ',' + n(y0) + ' L' + n(capaX(y0, 1)) + ',' + n(y0) + ' L' + n(capaX(y1, 1)) + ',' + n(y1) + (i === 5 ? ' Q200,580 ' : ' L') + n(capaX(y1, -1)) + ',' + n(y1) + 'Z', { fill: cores[i], opacity: 0.92 });
      }
      s += p('M150,346 Q160,334 182,332 L218,332 Q240,334 250,346 L262,372 L138,372Z', { fill: cores[0], opacity: 0.92 });
    } else s += peca(formas, cor, 'x');
    // fecho no meio, botões de pressão, bolsos e a barra com vivo
    s += p('M200,338 L200,574', { fill: 'none', stroke: esc(cor.hex, 0.35), 'stroke-width': 1.8, opacity: 0.7 });
    [380, 420, 460, 500, 540].forEach(function (y) { s += circ(207, y, 3.4, { fill: tipo === 'transparente' ? '#fff' : cla(cor.hex, 0.75), stroke: c, 'stroke-width': 1 }); });
    if (tipo === 'patinho' || tipo === 'colorida') {
      [[148, 1], [216, 1]].forEach(function (q) {
        var x = q[0];
        s += p('M' + x + ',478 L' + (x + 36) + ',478 L' + (x + 36) + ',516 Q' + (x + 18) + ',520 ' + x + ',516Z', { fill: tipo === 'patinho' ? cor.hex : esc(cor.hex, 0.08), stroke: c, 'stroke-width': 1.2 });
        s += p('M' + x + ',478 L' + (x + 36) + ',478', { fill: 'none', stroke: vivo, 'stroke-width': 3, 'stroke-linecap': 'round' });
        if (tipo === 'colorida') s += p('M' + x + ',478 L' + (x + 36) + ',478 L' + (x + 32) + ',490 L' + (x + 4) + ',490Z', { fill: cla(cor.hex, 0.25), stroke: c, 'stroke-width': 1 }) + circ(x + 18, 486, 2.4, { fill: '#fff' });
      });
    }
    s += p('M114,566 Q200,580 286,566', { fill: 'none', stroke: vivo, 'stroke-width': 3.2, 'stroke-linecap': 'round', opacity: 0.9 });
    return s;
  }
  // cinto por cima da roupa, na cintura (anos 70: fivela grande dourada)
  function cinto(tipo, cor) {
    var c = esc(cor.hex, 0.35), ouro = '#e9b949', ouroE = '#a87a1c', s = '';
    if (tipo === 'corrente') {
      for (var k = 0; k <= 12; k++) { var x = 148 + k * 8.67, y = 451 + 6 * (1 - Math.pow((x - 200) / 54, 2)); s += elip(x, y, 4.6, 3, { fill: 'none', stroke: cor.brilho ? cor.hex : ouro, 'stroke-width': 1.8 }); }
      return s;
    }
    var fino = tipo === 'fino';
    s += p(fino ? 'M147,451 Q200,459 253,451 L253,457 Q200,465 147,457Z' : 'M146,447 Q200,455 254,447 L254,461 Q200,469 146,461Z', { fill: cor.hex, stroke: c, 'stroke-width': 1.2 });
    if (fino) return s + ret(195, 451, 10, 9, { fill: 'none', stroke: ouro, 'stroke-width': 2, rx: 1.5 });
    return s + ret(182, 446, 36, 22, { fill: ouro, stroke: ouroE, 'stroke-width': 1.4, rx: 4 }) + ret(188, 451, 24, 12, { fill: '#f6d77a', stroke: ouroE, 'stroke-width': 1, rx: 2 }) +
      p('M190,453 L196,453', { stroke: '#fff', 'stroke-width': 1.6, opacity: 0.8, 'stroke-linecap': 'round' });
  }
  // bigode (só menino), da cor do cabelo
  function bigode(tipo, cab) {
    var f = { fill: mistura(cab, '#1a1210', 0.2), stroke: esc(cab, 0.45), 'stroke-width': 1, 'stroke-linejoin': 'round' };
    if (tipo === 'bigodao') return p('M200,251 C190,247 178,248 170,257 C165,264 167,273 172,280 C174,271 180,265 188,263 C194,262 198,263 200,264 C202,263 206,262 212,263 C220,265 226,271 228,280 C233,273 235,264 230,257 C222,248 210,247 200,251Z', f);
    var fino = p('M200,256 C192,253 182,254 175,261 C184,259 192,259.5 200,260.5 C208,259.5 216,259 225,261 C218,254 208,253 200,256Z', f);
    if (tipo === 'cavanhaque') return fino + p('M191,284 Q200,280 209,284 Q207,300 200,305 Q193,300 191,284Z', f);
    return fino;
  }
  // capuz: a parte de dentro (atrás da cabeça) e o aro em volta do rosto, por cima do cabelo
  var CAPUZ = 'M84,334 Q64,168 116,98 Q156,44 200,42 Q244,44 284,98 Q336,168 316,334 Q260,350 200,350 Q140,350 84,334Z';
  var ABERTURA = 'M101,212 A99,112 0 1 0 299,212 A99,112 0 1 0 101,212Z';
  function capuzAtras(tipo, cor) {
    return p(CAPUZ, { fill: esc(cor.hex, 0.28), opacity: tipo === 'transparente' ? 0.5 : 1 });
  }
  function capuzFrente(tipo, cor) {
    var c = esc(cor.hex, 0.35), transp = tipo === 'transparente';
    var s = p(CAPUZ + ' ' + ABERTURA, { fill: cor.hex, 'fill-rule': 'evenodd', stroke: c, 'stroke-width': 1.6, opacity: transp ? 0.6 : 1 });
    s += p(ABERTURA, { fill: 'none', stroke: tipo === 'patinho' ? '#e8384f' : esc(cor.hex, 0.2), 'stroke-width': 4, opacity: transp ? 0.8 : 1 });   // vivo em volta do rosto
    s += p('M118,110 Q150,66 196,56', { fill: 'none', stroke: '#fff', 'stroke-width': 5, opacity: 0.4, 'stroke-linecap': 'round' });   // brilho do plástico
    if (transp) s += unicornio(258, 92, 1.3) + p(estrela4(132, 120, 4), { fill: '#fff' }) + p(estrela4(176, 64, 3), { fill: '#fff' });
    if (tipo === 'patinho') {
      [170, 230].forEach(function (x) { s += circ(x, 70, 13, { fill: '#fff', stroke: '#3a2a20', 'stroke-width': 1.4 }) + circ(x + 2, 72, 6.5, { fill: '#222' }) + circ(x + 4, 69, 2.2, { fill: '#fff' }); });
      s += p('M172,92 Q200,80 228,92 Q220,108 200,108 Q180,108 172,92Z', { fill: '#ff6a2b', stroke: '#c94a1a', 'stroke-width': 1.4 }) + p('M176,94 Q200,100 224,94', { fill: 'none', stroke: '#c94a1a', 'stroke-width': 1.2 });
    }
    if (tipo === 'colorida' || tipo === 'arcoiris') s += p('M150,318 L146,352 M250,318 L254,352', { fill: 'none', stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round' }) + circ(146, 354, 3.2, { fill: '#fff' }) + circ(254, 354, 3.2, { fill: '#fff' });   // cordinhas
    return s;
  }
  function asas(cor) {
    var o = { fill: cla(cor.hex, 0.45), opacity: 0.78, stroke: '#fff', 'stroke-width': 2.5 };
    function asa(cx, cy, rx, ry, ang) { return elip(cx, cy, rx, ry, Object.assign({ transform: 'rotate(' + ang + ' ' + cx + ' ' + cy + ')' }, o)) + elip(cx, cy, rx * 0.55, ry * 0.45, { fill: '#fff', opacity: 0.35, transform: 'rotate(' + ang + ' ' + cx + ' ' + cy + ')' }); }
    return asa(92, 372, 88, 42, -30) + asa(108, 462, 60, 28, 26) + asa(308, 372, 88, 42, 30) + asa(292, 462, 60, 28, -26) +
      p(estrela4(48, 340, 7), { fill: '#fff' }) + p(estrela4(352, 340, 7), { fill: '#fff' }) + circ(84, 470, 3, { fill: '#fff' }) + circ(316, 470, 3, { fill: '#fff' });
  }
  function sapatos(e, cor, pele, peleE, peca, deCostas) {
    var s = '', c = esc(cor.hex, 0.3), esmalte = { tipo: e.unhas, cor: corAjustada(e, 'unhas') };
    function salto(x, alt, larg) { return p('M' + n(x - larg / 2) + ',656 L' + n(x + larg / 2) + ',656 L' + n(x + larg / 3) + ',' + (656 + alt) + ' L' + n(x - larg / 3) + ',' + (656 + alt) + 'Z', { fill: esc(cor.hex, 0.25), stroke: esc(cor.hex, 0.45), 'stroke-width': 1 }); }
    function bico(x) { return 'M' + (x - 16) + ',652 Q' + (x - 17) + ',634 ' + x + ',632 Q' + (x + 17) + ',634 ' + (x + 16) + ',652 Q' + x + ',661 ' + (x - 16) + ',652Z'; }
    function frente(x) { return 'M' + (x - 16) + ',645 Q' + x + ',639 ' + (x + 16) + ',645 L' + (x + 16) + ',652 Q' + x + ',661 ' + (x - 16) + ',652Z'; }
    // patins vistos de frente: as rodas aparecem de pé, estreitas (de lado só a banda de rodagem), as de trás um
    // pouco mais altas e escuras atrás das da frente; eixo, base e o freio de borracha na ponta
    function rodasDeFrente(x) {
      var am = '#ffd166', amE = '#c9932a', t = '';
      [-1, 1].forEach(function (l) { t += ret(x + l * 12 - 3, 650, 6, 11, { fill: esc(am, 0.25), stroke: amE, 'stroke-width': 1.1, rx: 3 }); });
      t += ret(x - 18, 655, 36, 3.4, { fill: '#7d8597', rx: 1.7 });
      [-1, 1].forEach(function (l) {
        var cx = x + l * 15;
        t += ret(cx - 4.5, 651, 9, 16, { fill: am, stroke: amE, 'stroke-width': 1.4, rx: 4.5 }) + ret(cx - 1.4, 653, 2.8, 12, { fill: '#fff', opacity: 0.7, rx: 1.4 }) +
          p('M' + n(cx + l * 3) + ',654 L' + n(cx + l * 3) + ',664', { stroke: amE, 'stroke-width': 1, opacity: 0.6, 'stroke-linecap': 'round' });
      });
      return t + ret(x - 4.5, 649, 9, 12, { fill: '#ff8fb1', stroke: '#d0567c', 'stroke-width': 1.2, rx: 3.5 }) + ret(x - 21, 646, 42, 6, { fill: '#9aa3b5', stroke: '#6f7788', 'stroke-width': 1, rx: 3 });
    }
    [172, 228].forEach(function (x) {
      var pf = peFrente(x, pele, peleE, deCostas), pe = pf.svg;
      switch (e.sapatos) {
        case 'nenhum':
          s += pe + unhas(pf.unhas, esmalte, pele);
          break;
        case 'princesa':
          s += pe + salto(x, 6, 7) + peca(frente(x), cor, 'x') + p(estrela4(x, 643, 3), { fill: '#fff' }) + laco(x, 641, 5, cla(cor.hex, 0.45)) + circ(x, 641, 1.8, { fill: '#7ee8ff', stroke: '#fff', 'stroke-width': 0.6 });
          break;
        case 'scarpin': s += pe + salto(x, 20, 4) + peca(frente(x), cor, 'x') + elip(x - 6, 648, 4, 1.4, { fill: '#fff', opacity: 0.5 }); break;
        case 'saltoMedio': s += pe + salto(x, 12, 9) + peca(frente(x), cor, 'x'); break;
        case 'saltoBaixo': s += pe + salto(x, 6, 4) + peca(frente(x), cor, 'x') + laco(x, 642, 4, esc(cor.hex, 0.1)); break;
        case 'plataforma':
          s += pe + p('M' + (x - 18) + ',650 L' + (x + 18) + ',650 L' + (x + 18) + ',668 Q' + x + ',672 ' + (x - 18) + ',668Z', { fill: cla(cor.hex, 0.35), stroke: c, 'stroke-width': 1.5 }) +
            p('M' + (x - 18) + ',660 L' + (x + 18) + ',660', { stroke: c, 'stroke-width': 1, opacity: 0.6 }) + p('M' + (x - 14) + ',641 L' + (x + 14) + ',641 M' + (x - 15) + ',648 L' + (x + 15) + ',648', { stroke: cor.hex, 'stroke-width': 4, 'stroke-linecap': 'round' });
          break;
        case 'anabela':
          s += pe + p('M' + (x - 17) + ',651 L' + (x + 17) + ',651 L' + (x + 18) + ',666 L' + (x - 18) + ',666Z', { fill: '#e8c98a', stroke: '#b8954e', 'stroke-width': 1.2 }) +
            p('M' + (x - 17) + ',656 L' + (x + 17) + ',656 M' + (x - 17) + ',661 L' + (x + 17) + ',661', { stroke: '#b8954e', 'stroke-width': 0.8, 'stroke-dasharray': '2 2' }) +
            p('M' + (x - 14) + ',642 L' + (x + 14) + ',646 M' + (x + 14) + ',642 L' + (x - 14) + ',646', { stroke: cor.hex, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
          break;
        case 'rasteirinha':
          s += pe + p('M' + (x - 17) + ',653 Q' + x + ',660 ' + (x + 17) + ',653 L' + (x + 17) + ',656 Q' + x + ',664 ' + (x - 17) + ',656Z', { fill: esc(cor.hex, 0.1) }) +
            p('M' + (x - 13) + ',640 L' + (x + 13) + ',650 M' + (x + 13) + ',640 L' + (x - 13) + ',650 M' + (x - 14) + ',628 L' + (x + 14) + ',628', { stroke: cor.hex, 'stroke-width': 2.4, 'stroke-linecap': 'round' }) + circ(x, 645, 2.4, { fill: '#fff' });
          break;
        case 'chineloFlor':
          s += pe + p('M' + (x - 17) + ',652 Q' + x + ',662 ' + (x + 17) + ',652 L' + (x + 17) + ',657 Q' + x + ',668 ' + (x - 17) + ',657Z', { fill: cor.hex, stroke: c, 'stroke-width': 1.5 }) +
            p('M' + (x - 14) + ',650 L' + x + ',640 L' + (x + 14) + ',650', { fill: 'none', stroke: esc(cor.hex, 0.15), 'stroke-width': 3.5, 'stroke-linecap': 'round' }) + flor(x, 640, 3.6, '#fff', '#ffd23f');
          break;
        case 'clog':
          s += peca('M' + (x - 20) + ',652 Q' + (x - 22) + ',628 ' + x + ',626 Q' + (x + 22) + ',628 ' + (x + 20) + ',652 Q' + x + ',662 ' + (x - 20) + ',652Z', cor, 'x');
          [[-8, 634], [0, 632], [8, 634], [-4, 640], [4, 640]].forEach(function (q) { s += circ(x + q[0], q[1], 1.8, { fill: esc(cor.hex, 0.35) }); });
          s += flor(x - 10, 645, 2.6, '#ff8fc8', '#fff3a0') + p(estrela5(x + 10, 645, 4, 1.8), { fill: '#ffd23f' });
          break;
        case 'mocassim':
          s += pe + peca('M' + (x - 17) + ',652 Q' + (x - 18) + ',634 ' + x + ',632 Q' + (x + 18) + ',634 ' + (x + 17) + ',652 Q' + x + ',661 ' + (x - 17) + ',652Z', cor, 'x') +
            p('M' + (x - 10) + ',638 Q' + x + ',634 ' + (x + 10) + ',638 L' + (x + 10) + ',642 L' + (x - 10) + ',642Z', { fill: esc(cor.hex, 0.15) }) + p('M' + (x - 4) + ',640 L' + (x + 4) + ',640', { stroke: '#2a1c1a', 'stroke-width': 1.4 });
          break;
        case 'social':
          s += peca(bico(x), cor, 'x') + p('M' + (x - 17) + ',653 Q' + x + ',661 ' + (x + 17) + ',653 L' + (x + 17) + ',656 Q' + x + ',665 ' + (x - 17) + ',656Z', { fill: esc(cor.hex, 0.5) }) +
            p('M' + (x - 5) + ',636 L' + (x + 5) + ',638 M' + (x - 5) + ',640 L' + (x + 5) + ',642 M' + (x + 5) + ',636 L' + (x - 5) + ',638', { stroke: cla(cor.hex, 0.5), 'stroke-width': 1.2 }) + elip(x + 7, 646, 4, 1.4, { fill: '#fff', opacity: 0.5 });
          break;
        case 'tenisAlto': case 'tenisLuz': case 'tenisGlitter':
          var alto = e.sapatos === 'tenisAlto';
          s += peca('M' + (x - 19) + ',652 L' + (x - 17) + ',' + (alto ? 600 : 628) + ' Q' + x + ',' + (alto ? 596 : 624) + ' ' + (x + 17) + ',' + (alto ? 600 : 628) + ' L' + (x + 19) + ',652 Q' + x + ',660 ' + (x - 19) + ',652Z', cor, 'x') +
            p('M' + (x - 20) + ',647 Q' + x + ',657 ' + (x + 20) + ',647 L' + (x + 20) + ',654 Q' + x + ',665 ' + (x - 20) + ',654Z', { fill: '#fff', stroke: '#c9c1d6', 'stroke-width': 1.5 }) +
            p('M' + (x - 7) + ',' + (alto ? 612 : 634) + ' L' + (x + 7) + ',' + (alto ? 612 : 634) + ' M' + (x - 7) + ',' + (alto ? 622 : 640) + ' L' + (x + 7) + ',' + (alto ? 622 : 640) + (alto ? ' M' + (x - 7) + ',632 L' + (x + 7) + ',632' : ''), { stroke: cor.id === 'branco' ? '#ff8fc8' : '#fff', 'stroke-width': 2, 'stroke-linecap': 'round' });
          if (alto) s += p(estrela5(x + 12, 624, 4.5, 2), { fill: '#fff' });
          if (e.sapatos === 'tenisLuz') { s += elip(x, 662, 20, 4, { fill: '#7ee8ff', opacity: 0.35 }); ARCO_UNHA.forEach(function (cc, k) { s += circ(x - 14 + k * 7, 656, 1.6, { fill: cc }); }); }
          if (e.sapatos === 'tenisGlitter') { var rt = sorteio(x), pt = []; for (var kt = 0; kt < 30; kt++) pt.push([x - 15 + rt() * 30, 630 + rt() * 18]); s += purpurina(pt, { id: 'x', hex: cor.hex }, rt, 1.5, 10); }
          break;
        case 'botaCano':
          s += peca('M' + (x - 17) + ',536 L' + (x + 17) + ',536 L' + (x + 20) + ',650 Q' + x + ',663 ' + (x - 20) + ',650Z', cor, 'x') + p('M' + (x - 19) + ',532 L' + (x + 19) + ',532 L' + (x + 18) + ',546 L' + (x - 18) + ',546Z', { fill: esc(cor.hex, 0.15), stroke: c, 'stroke-width': 1 }) +
            p('M' + (x - 9) + ',556 L' + (x - 10) + ',640', { stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.35 });
          break;
        case 'botaNeve':
          s += peca('M' + (x - 19) + ',588 L' + (x + 19) + ',588 L' + (x + 22) + ',650 Q' + x + ',664 ' + (x - 22) + ',650Z', cor, 'x') + elip(x, 590, 24, 9, { fill: '#fff6ec', stroke: '#e6d6c6', 'stroke-width': 1.5 }) +
            [[-12, 588], [-4, 584], [6, 586], [14, 590]].map(function (q) { return circ(x + q[0], q[1], 5, { fill: '#fff6ec' }); }).join('') + p('M' + (x - 22) + ',652 Q' + x + ',664 ' + (x + 22) + ',652', { fill: 'none', stroke: esc(cor.hex, 0.4), 'stroke-width': 3 });
          break;
        case 'ponta':
          s += peca('M' + (x - 13) + ',652 Q' + (x - 15) + ',630 ' + x + ',628 Q' + (x + 15) + ',630 ' + (x + 13) + ',652 Q' + x + ',662 ' + (x - 13) + ',652Z', { hex: cla(cor.hex, 0.25), brilho: true }, 'x') +
            p('M' + (x - 12) + ',630 L' + (x + 13) + ',600 M' + (x + 12) + ',630 L' + (x - 13) + ',600 M' + (x - 13) + ',600 L' + (x + 13) + ',584 M' + (x + 13) + ',600 L' + (x - 13) + ',584', { stroke: cla(cor.hex, 0.1), 'stroke-width': 2.4, 'stroke-linecap': 'round' });
          break;
        case 'tenis':
          s += peca('M' + (x - 19) + ',652 Q' + (x - 21) + ',628 ' + x + ',626 Q' + (x + 21) + ',628 ' + (x + 19) + ',652 Q' + x + ',660 ' + (x - 19) + ',652Z', cor, 'x') +
            p('M' + (x - 20) + ',647 Q' + x + ',657 ' + (x + 20) + ',647 L' + (x + 20) + ',654 Q' + x + ',665 ' + (x - 20) + ',654Z', { fill: '#fff', stroke: '#c9c1d6', 'stroke-width': 1.5 }) +
            p('M' + (x - 7) + ',634 L' + (x + 7) + ',634 M' + (x - 7) + ',640 L' + (x + 7) + ',640', { stroke: cor.id === 'branco' ? '#ff8fc8' : '#fff', 'stroke-width': 2, 'stroke-linecap': 'round' });
          break;
        case 'sapatilha':
          s += pe + peca('M' + (x - 17) + ',652 Q' + (x - 19) + ',636 ' + (x - 9) + ',636 Q' + x + ',642 ' + (x + 9) + ',636 Q' + (x + 19) + ',636 ' + (x + 17) + ',652 Q' + x + ',661 ' + (x - 17) + ',652Z', cor, 'x') + laco(x, 640, 4.5, cla(cor.hex, 0.4));
          break;
        case 'sandalia':
          s += pe + p('M' + (x - 18) + ',652 Q' + x + ',660 ' + (x + 18) + ',652 L' + (x + 18) + ',657 Q' + x + ',666 ' + (x - 18) + ',657Z', { fill: esc(cor.hex, 0.1), stroke: c, 'stroke-width': 1.5 }) +
            p('M' + (x - 14) + ',642 L' + (x + 14) + ',642 M' + (x - 15) + ',650 L' + (x + 15) + ',650', { stroke: cor.hex, 'stroke-width': 4, 'stroke-linecap': 'round' }) + circ(x, 642, 3, { fill: '#fff' });
          break;
        case 'bota':
          s += peca('M' + (x - 18) + ',566 L' + (x + 18) + ',566 L' + (x + 20) + ',650 Q' + x + ',663 ' + (x - 20) + ',650Z', cor, 'x') +
            p('M' + (x - 21) + ',560 Q' + x + ',552 ' + (x + 21) + ',560 L' + (x + 21) + ',574 Q' + x + ',566 ' + (x - 21) + ',574Z', { fill: '#fff6ec', stroke: '#e6d6c6', 'stroke-width': 1.5 });
          break;
        case 'salto':
          s += pe + p('M' + (x - 16) + ',653 Q' + (x - 17) + ',634 ' + x + ',632 Q' + (x + 17) + ',634 ' + (x + 16) + ',653 Q' + x + ',662 ' + (x - 16) + ',653Z', { fill: cla(cor.hex, 0.35), opacity: 0.72, stroke: '#fff', 'stroke-width': 2 }) +
            p(estrela4(x - 6, 640, 4.5), { fill: '#fff' }) + circ(x + 7, 646, 1.6, { fill: '#fff' });
          break;
        case 'boneca':
          s += pe + peca('M' + (x - 17) + ',652 Q' + (x - 19) + ',634 ' + x + ',634 Q' + (x + 19) + ',634 ' + (x + 17) + ',652 Q' + x + ',661 ' + (x - 17) + ',652Z', cor, 'x') +
            p('M' + (x - 15) + ',640 L' + (x + 15) + ',640', { stroke: esc(cor.hex, 0.2), 'stroke-width': 3.5, 'stroke-linecap': 'round' }) + circ(x + 9, 640, 2.6, { fill: '#fff' });
          break;
        case 'patins':
          s += peca('M' + (x - 17) + ',596 L' + (x + 17) + ',596 L' + (x + 19) + ',648 Q' + x + ',656 ' + (x - 19) + ',648Z', cor, 'x') +
            p('M' + (x - 18) + ',592 L' + (x + 18) + ',592 L' + (x + 18) + ',604 L' + (x - 18) + ',604Z', { fill: '#fff', stroke: c, 'stroke-width': 1.2 }) +
            p('M' + (x - 7) + ',612 L' + (x + 7) + ',612 M' + (x - 7) + ',622 L' + (x + 7) + ',622 M' + (x - 7) + ',632 L' + (x + 7) + ',632', { stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round' }) +
            rodasDeFrente(x);
          break;
        case 'chinelo':
          s += pe + p('M' + (x - 17) + ',652 Q' + x + ',662 ' + (x + 17) + ',652 L' + (x + 17) + ',657 Q' + x + ',668 ' + (x - 17) + ',657Z', { fill: cor.hex, stroke: c, 'stroke-width': 1.5 }) +
            p('M' + (x - 14) + ',650 L' + x + ',640 L' + (x + 14) + ',650', { fill: 'none', stroke: esc(cor.hex, 0.15), 'stroke-width': 3.5, 'stroke-linecap': 'round' }) + circ(x, 640, 2.4, { fill: '#fff' });
          break;
        case 'galocha':
          s += peca('M' + (x - 19) + ',572 L' + (x + 19) + ',572 L' + (x + 20) + ',650 Q' + x + ',664 ' + (x - 20) + ',650Z', cor, 'x') +
            p('M' + (x - 11) + ',584 L' + (x - 12) + ',634', { stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.5 }) +
            p('M' + (x - 20) + ',646 Q' + x + ',658 ' + (x + 20) + ',646 L' + (x + 20) + ',652 Q' + x + ',666 ' + (x - 20) + ',652Z', { fill: esc(cor.hex, 0.25) });
          break;
        case 'pantufa':
          s += elip(x - 9, 628, 5, 11, { fill: cla(cor.hex, 0.2), stroke: c, 'stroke-width': 1.5 }) + elip(x + 9, 628, 5, 11, { fill: cla(cor.hex, 0.2), stroke: c, 'stroke-width': 1.5 }) +
            elip(x, 648, 25, 16, { fill: cla(cor.hex, 0.25), stroke: c, 'stroke-width': 2 }) + circ(x - 7, 644, 2.2, { fill: '#2a1c1a' }) + circ(x + 7, 644, 2.2, { fill: '#2a1c1a' }) + elip(x, 650, 3, 2, { fill: '#ff8fb1' });
          break;
      }
    });
    return s;
  }

  // ---------- acessórios ----------
  /* Bolsas seguradas de verdade: a mão (x 282, palma em y 501, dedos até ~520) é desenhada DEPOIS da bolsa, então os
     dedos ficam por cima da alça. Bolsas de alça ficam penduradas embaixo da mão (a alça sobe por dentro do punho);
     a bolsinha de mão fica presa entre os dedos; a bolsa de ombro atravessa o peito e fica no quadril.
     Detalhes: costura pontilhada, metal dourado, brilho e sombra. */
  function bolsa(tipo, cor, peca, linha) {
    var c = esc(cor.hex, 0.3), cl = cla(cor.hex, 0.45), ouro = '#e9b949', ouroE = '#a87a1c';
    function costura(d, cc) { return p(d, { fill: 'none', stroke: cc || cl, 'stroke-width': 1.1, 'stroke-dasharray': '2.2 2', opacity: 0.85 }); }
    function metal(x, y, w, h) { return ret(x, y, w, h, { fill: ouro, stroke: ouroE, 'stroke-width': 0.8, rx: Math.min(w, h) / 3 }) + ret(x + 0.6, y + 0.4, w * 0.45, h * 0.35, { fill: '#fff6cf', opacity: 0.8, rx: 0.6 }); }
    function alca(d, larg) { return p(d, { fill: 'none', stroke: esc(cor.hex, 0.45), 'stroke-width': (larg || 3.4) + 1.6, 'stroke-linecap': 'round' }) + p(d, { fill: 'none', stroke: esc(cor.hex, 0.08), 'stroke-width': larg || 3.4, 'stroke-linecap': 'round' }); }
    function sombra(cx, cy, rx) { return elip(cx, cy, rx, 3.2, { fill: '#000', opacity: 0.12 }); }
    switch (tipo) {
      case 'mao':
        return '<g transform="rotate(-9 280 518)">' +
          peca('M254,506 Q254,502 258,502 L302,502 Q306,502 306,506 L306,528 Q306,533 301,533 L259,533 Q254,533 254,528Z', cor, 'x') +
          p('M254,505 Q280,523 306,505 L306,512 Q280,529 254,512Z', { fill: esc(cor.hex, 0.14), opacity: 0.9 }) +
          costura('M257,505 Q280,521 303,505') + costura('M257,530 L303,530') +
          metal(276, 512, 9, 6) + p(estrela4(296, 525, 3), { fill: '#fff', opacity: 0.9 }) + elip(266, 524, 7, 2, { fill: '#fff', opacity: 0.25 }) + '</g>';
      case 'ombro':
        var s = p('M158,346 Q206,400 252,446', { fill: 'none', stroke: esc(cor.hex, 0.45), 'stroke-width': 6, 'stroke-linecap': 'round' }) + p('M158,346 Q206,400 252,446', { fill: 'none', stroke: esc(cor.hex, 0.05), 'stroke-width': 4, 'stroke-linecap': 'round' }) +
          costura('M158,346 Q206,400 252,446', cla(cor.hex, 0.6)) + metal(196, 384, 7, 7) + sombra(262, 492, 22);
        s += peca('M238,446 Q238,440 244,440 L282,440 Q288,440 288,446 L288,484 Q288,490 282,490 L244,490 Q238,490 238,484Z', cor, 'x');
        s += p('M238,444 L288,444 L287,466 Q263,476 239,466Z', { fill: esc(cor.hex, 0.13), stroke: c, 'stroke-width': 1 }) + costura('M241,447 L285,447 M241,463 Q263,472 285,463') + metal(259, 466, 8, 9) + elip(248, 480, 6, 2, { fill: '#fff', opacity: 0.22 });
        return s;
      case 'guardaChuva':
        // guarda-chuva fechado pendurado na mão: cabo em gancho na mão, haste e o pano enrolado com a fitinha
        var g = p('M288,500 Q296,488 286,482 Q276,478 274,490 L274,516', { fill: 'none', stroke: '#8a5a2a', 'stroke-width': 4.4, 'stroke-linecap': 'round' }) +
          p('M288,500 Q296,488 286,482 Q276,478 274,490 L274,516', { fill: 'none', stroke: '#c48a4c', 'stroke-width': 2.4, 'stroke-linecap': 'round' });
        g += p('M274,512 L274,660', { stroke: '#9aa3b5', 'stroke-width': 2.2 });
        g += peca('M274,514 Q262,560 266,632 L274,650 L282,632 Q286,560 274,514Z', cor, 'x');
        g += p('M274,516 Q270,580 272,640', { fill: 'none', stroke: esc(cor.hex, 0.3), 'stroke-width': 1.2, opacity: 0.7 }) + p('M268,600 Q274,604 280,600', { fill: 'none', stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round' }) +
          p('M267,560 L268,612', { fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.45, 'stroke-linecap': 'round' }) + p('M274,650 L274,664', { stroke: '#6b7385', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
        return g;
      case 'coracao':
        return alca('M270,536 Q270,500 282,497 Q294,500 294,536', 3.4) + sombra(282, 572, 18) +
          peca(coracao(282, 548, 21), cor, 'x') + p(coracao(282, 548, 15), { fill: 'none', stroke: cl, 'stroke-width': 1.1, 'stroke-dasharray': '2.2 2' }) +
          metal(279, 530, 6, 5) + p(estrela4(273, 541, 4.5), { fill: '#fff', opacity: 0.9 }) + elip(274, 547, 4, 7, { fill: '#fff', opacity: 0.2, transform: 'rotate(25 274 547)' });
      case 'cesta':
        var b = p('M262,530 Q263,492 282,490 Q301,492 302,530', { fill: 'none', stroke: '#8a5a2a', 'stroke-width': 6.5, 'stroke-linecap': 'round' }) + p('M262,530 Q263,492 282,490 Q301,492 302,530', { fill: 'none', stroke: '#c48a4c', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '4 3' }) + sombra(282, 574, 26);
        b += p('M254,530 L310,530 L302,570 Q282,575 262,570Z', { fill: '#d39a5c', stroke: '#8a5a2a', 'stroke-width': 1.6 });
        for (var r = 0; r < 4; r++) b += p('M' + (255 + r * 0.9) + ',' + (538 + r * 9) + ' L' + (309 - r * 1.9) + ',' + (538 + r * 9), { stroke: '#8a5a2a', 'stroke-width': 1.2, opacity: 0.6 });
        for (var v = 0; v < 7; v++) b += p('M' + (260 + v * 7.5) + ',531 L' + (264 + v * 6.2) + ',569', { stroke: '#a8743a', 'stroke-width': 1, opacity: 0.55 });
        for (var k = 0; k < 6; k++) b += p('M' + (256 + k * 9) + ',521 L' + (265 + k * 9) + ',521 L' + (264 + k * 9) + ',531 L' + (257 + k * 9) + ',531Z', { fill: k % 2 ? '#fff' : cor.hex });
        return b + p('M256,521 L310,521 L309,531 L257,531Z', { fill: 'none', stroke: c, 'stroke-width': 1 }) + ret(254, 528, 56, 5, { fill: '#b07a40', rx: 2.5 });
      case 'praia':
        var t = alca('M266,526 Q268,498 280,499', 3.4) + alca('M298,526 Q296,498 284,499', 3.4) + sombra(282, 578, 26);
        t += p('M256,524 L308,524 L302,574 Q282,579 262,574Z', { fill: '#f0cf86', stroke: '#b8954e', 'stroke-width': 1.6 });
        for (var y = 0; y < 6; y++) t += p('M' + (257 + y * 0.9) + ',' + (530 + y * 8) + ' L' + (307 - y * 1) + ',' + (530 + y * 8), { stroke: '#c9a352', 'stroke-width': 1.1, 'stroke-dasharray': '3 2', opacity: 0.8 });
        return t + p('M258,540 L306,540 L305,550 L259,550Z', { fill: cor.hex, stroke: c, 'stroke-width': 0.8 }) + flor(296, 545, 4, '#fff', '#ffd23f') + elip(266, 560, 6, 2, { fill: '#fff', opacity: 0.25 });
    }
    return '';
  }
  function colar(tipo, cor, I) {
    var c = esc(cor.hex, 0.3), s = '', i, t;
    function no(t2) { return [(1 - t2) * (1 - t2) * 176 + 2 * (1 - t2) * t2 * 200 + t2 * t2 * 224, (1 - t2) * (1 - t2) * 334 + 2 * (1 - t2) * t2 * 368 + t2 * t2 * 334]; }
    var corrente = { fill: 'none', stroke: cor.brilho ? cor.hex : esc(cor.hex, 0.05), 'stroke-width': 1.8 };
    switch (tipo) {
      case 'perolas': for (i = 0; i <= 10; i++) { t = no(i / 10); s += circ(t[0], t[1], 4.6, { fill: cla(cor.hex, 0.55), stroke: c, 'stroke-width': 0.8 }) + circ(t[0] - 1.4, t[1] - 1.4, 1.3, { fill: '#fff' }); } break;
      case 'coracao': s = p('M176,334 Q200,368 224,334', corrente) + p(coracao(200, 360, 9), { fill: cor.hex, stroke: c, 'stroke-width': 1.5 }) + circ(197, 356, 1.8, { fill: '#fff' }); break;
      case 'gargantilha': s = p('M186,312 Q200,318 214,312 L214,322 Q200,328 186,322Z', { fill: cor.hex, stroke: c, 'stroke-width': 1.2 }) + p(estrela4(200, 326, 5), { fill: '#fff', stroke: c, 'stroke-width': 0.8 }); break;
      case 'estrela': s = p('M176,334 Q200,368 224,334', corrente) + p(estrela5(200, 362, 10, 4.5), { fill: cor.hex, stroke: c, 'stroke-width': 1.3, 'stroke-linejoin': 'round' }); break;
      case 'diamantes':
        for (i = 0; i <= 8; i++) { t = no(i / 8); s += p('M' + n(t[0]) + ',' + n(t[1] - 4.5) + 'L' + n(t[0] + 4) + ',' + n(t[1]) + 'L' + n(t[0]) + ',' + n(t[1] + 4.5) + 'L' + n(t[0] - 4) + ',' + n(t[1]) + 'Z', { fill: '#e6f6ff', stroke: cor.hex, 'stroke-width': 1.2 }); }
        s += p('M200,360 L208,368 L200,382 L192,368Z', { fill: '#e6f6ff', stroke: cor.hex, 'stroke-width': 1.6 }) + p(estrela4(206, 362, 4.5), { fill: '#fff' }) + p(estrela4(184, 352, 3), { fill: '#fff' });
        break;
      case 'medalhao': s = p('M176,334 Q200,368 224,334', corrente) + elip(200, 366, 9, 11, { fill: cor.hex, stroke: c, 'stroke-width': 1.5 }) + p(coracao(200, 366, 4), { fill: esc(cor.hex, 0.25) }) + elip(197, 361, 2, 3, { fill: '#fff', opacity: 0.7 }); break;
      case 'micangas': var cm = ['#ff5a6e', '#ffd23f', '#5cc46a', '#5ac8ff', '#b892ff', cor.hex]; for (i = 0; i <= 12; i++) { t = no(i / 12); s += circ(t[0], t[1], 3.6, { fill: cm[i % cm.length], stroke: '#fff', 'stroke-width': 0.8 }); } break;
      case 'lua': s = p('M176,334 Q200,368 224,334', corrente) + p('M204,352 C189,353 189,373 204,374 C197,368 197,358 204,352Z', { fill: cor.hex, stroke: c, 'stroke-width': 1.2 }); break;
      case 'concha': s = p('M176,334 Q200,368 224,334', corrente) + adesivo('concha', 200, 364, 10); break;
      case 'laco': s = p('M186,312 Q200,318 214,312 L214,322 Q200,328 186,322Z', { fill: cor.hex, stroke: c, 'stroke-width': 1.2 }) + laco(200, 320, 7, cor.hex); break;
      case 'corrente':   // corrente grossa de elos, com uma plaquinha (anos 70)
        s = p('M177,335 Q200,388 223,335', { fill: 'none', stroke: esc(cor.hex, 0.4), 'stroke-width': 4.6, 'stroke-linecap': 'round' }) +
          p('M177,335 Q200,388 223,335', { fill: 'none', stroke: cor.hex, 'stroke-width': 3, 'stroke-dasharray': '3.2 1.4', 'stroke-linecap': 'round' }) +
          ret(194, 360, 12, 10, { fill: cor.hex, stroke: c, 'stroke-width': 1, rx: 2 }) + ret(196, 362, 4, 2, { fill: '#fff', opacity: 0.7 });
        break;
      case 'duplo': s = p('M176,334 Q200,368 224,334', corrente) + p('M170,338 Q200,396 230,338', corrente) + circ(200, 351, 2.8, { fill: cor.hex }) + p(estrela5(200, 378, 7, 3), { fill: cor.hex, stroke: c, 'stroke-width': 1 }); break;
      case 'borboleta': s = p('M176,334 Q200,368 224,334', corrente) + adesivo('borboleta', 200, 364, 10); break;
      case 'flores':
        var cores = [cor.hex, '#ff8fc8', '#ffd23f', '#cfa8ff', '#86ecc8'];
        for (i = 0; i <= 9; i++) { t = i / 9; var x = (1 - t) * (1 - t) * 160 + 2 * (1 - t) * t * 200 + t * t * 240, y = (1 - t) * (1 - t) * 340 + 2 * (1 - t) * t * 396 + t * t * 340; s += flor(x, y, 5, cores[i % cores.length], '#fff3a0'); }
        break;
    }
    return s;
  }
  // pulseira no pulso esquerdo (da imagem), anel na mão esquerda (e na direita, em "nas duas mãos"), broche no peito
  function pulseira(tipo, cor) {
    var x = 120.5, y = 487, c = esc(cor.hex, 0.3), s = '', gira = 'rotate(-6 ' + x + ' ' + y + ')';
    // só a metade da frente (a de trás fica escondida atrás do pulso)
    function aro(yy, col, larg, extra) { return p('M' + (x - 13.5) + ',' + yy + ' A13.5,4.8 0 0 0 ' + (x + 13.5) + ',' + yy, Object.assign({ fill: 'none', stroke: col, 'stroke-width': larg, 'stroke-linecap': 'round', transform: gira }, extra || {})); }
    function contas(cores, r) { var t = ''; for (var k = 0; k <= 8; k++) { var a = k / 8 * Math.PI; t += circ(x + Math.cos(a) * 13.5, y + Math.sin(a) * 4.8, r, { fill: cores[k % cores.length], stroke: '#fff', 'stroke-width': 0.6 }); } return t; }
    switch (tipo) {
      case 'simples': s = aro(y, cor.hex, 4) + aro(y + 0.6, '#fff', 1, { opacity: 0.5 }); break;
      case 'berloque': s = aro(y, cor.hex, 1.8) + p(coracao(x - 7, y + 9, 3.2), { fill: '#e8384f' }) + p(estrela5(x + 1, y + 10, 3.6, 1.6), { fill: '#ffd23f' }) + circ(x + 8, y + 8, 2.6, { fill: '#7ee8ff' }); break;
      case 'perolas': s = contas(['#fffaf2'], 3.2); break;
      case 'micangas': s = contas(['#ff5a6e', '#ffd23f', '#5cc46a', '#5ac8ff', '#b892ff', cor.hex], 3); break;
      case 'relogio': s = aro(y, cor.hex, 5) + circ(x, y + 2, 7, { fill: '#fff', stroke: c, 'stroke-width': 2.5 }) + p('M' + x + ',' + (y + 2) + ' L' + x + ',' + (y - 2) + ' M' + x + ',' + (y + 2) + ' L' + (x + 3) + ',' + (y + 3), { stroke: '#2a1c1a', 'stroke-width': 1.2, 'stroke-linecap': 'round' }); break;
      case 'varias': s = aro(y - 4, cor.hex, 2.6) + aro(y, '#ff5fb4', 2.6) + aro(y + 4, '#7ee8ff', 2.6); break;
      case 'amizade': s = aro(y, cor.hex, 4) + aro(y, '#ffd23f', 4, { 'stroke-dasharray': '4 4' }); break;
    }
    return s;
  }
  function anel(tipo, cor, soLado) {
    // anel visto de frente: só a faixinha que passa na frente do dedo anelar, com o enfeite em cima
    function um(lado, topo) {
      var q = dedoDoAnel(lado < 0 ? 118 : 282, lado), x = q[0], y = q[1];
      var t = p('M' + n(x - 3.4) + ',' + n(y - 1) + ' Q' + n(x) + ',' + n(y + 2.6) + ' ' + n(x + 3.4) + ',' + n(y - 1), { fill: 'none', stroke: esc(cor.hex, 0.3), 'stroke-width': 3.6, 'stroke-linecap': 'round' }) +
        p('M' + n(x - 3.4) + ',' + n(y - 1) + ' Q' + n(x) + ',' + n(y + 2.6) + ' ' + n(x + 3.4) + ',' + n(y - 1), { fill: 'none', stroke: cor.hex, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
      if (topo === 'pedra') t += circ(x, y + 0.6, 3, { fill: '#ff5fb4', stroke: '#fff', 'stroke-width': 0.9 }) + p(estrela4(x + 2.4, y - 2, 2.2), { fill: '#fff' });
      if (topo === 'coracao') t += p(coracao(x, y + 0.4, 3), { fill: '#e8384f', stroke: '#fff', 'stroke-width': 0.7 });
      if (topo === 'flor') t += flor(x, y + 0.6, 1.9, '#ff8fc8', '#ffd23f');
      if (topo === 'estrela') t += p(estrela5(x, y + 0.6, 4, 1.8), { fill: cor.hex, stroke: esc(cor.hex, 0.3), 'stroke-width': 0.7 });
      return rigido(lado < 0 ? 118 : 282, 496, t, [lado < 0 ? 150 : 250, 354]);   // vai junto com a mão
    }
    // soLado (esqueleto): só o anel daquela mão (-1 esquerda, 1 direita), para ir junto com o braço
    if (tipo === 'dois') return (soLado !== 1 ? um(-1, 'pedra') : '') + (soLado !== -1 ? um(1, 'coracao') : '');
    return soLado === 1 ? '' : um(-1, tipo);
  }
  function broche(tipo, cor) {
    var x = 174, y = 388, c = esc(cor.hex, 0.3);
    switch (tipo) {
      case 'estrela': return p(estrela5(x, y, 11, 5), { fill: cor.hex, stroke: c, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }) + p(estrela4(x - 3, y - 3, 3.5), { fill: '#fff' });
      case 'laco': return laco(x, y, 9, cor.hex) + circ(x, y, 3, { fill: '#fff' });
      case 'flor': return flor(x, y, 5.5, cor.hex, '#fff3a0');
      case 'coracao': return p(coracao(x, y, 9), { fill: cor.hex, stroke: c, 'stroke-width': 1.4 }) + circ(x - 3, y - 3, 2, { fill: '#fff' });
      case 'borboleta': return elip(x - 6, y - 4, 7, 6, { fill: cor.hex, stroke: c }) + elip(x + 6, y - 4, 7, 6, { fill: cor.hex, stroke: c }) + elip(x - 5, y + 5, 5, 4, { fill: cla(cor.hex, 0.4) }) + elip(x + 5, y + 5, 5, 4, { fill: cla(cor.hex, 0.4) }) + p('M' + x + ',' + (y - 8) + 'L' + x + ',' + (y + 9), { stroke: '#4a2c20', 'stroke-width': 2, 'stroke-linecap': 'round' });
      case 'joia': return circ(x, y, 10, { fill: cor.hex, stroke: c, 'stroke-width': 1.5 }) + circ(x, y, 6.5, { fill: '#ff5fb4', stroke: '#fff', 'stroke-width': 1.2 }) + p(estrela4(x + 3, y - 3, 3.5), { fill: '#fff' });
    }
    return '';
  }
  function brincos(tipo, cor, I, esq, dir) {
    var c = esc(cor.hex, 0.3), s = '';
    function k2(i) { return i % 2 ? cla(cor.hex, 0.35) : cor.hex; }
    [esq === false ? null : 116, dir === false ? null : 284].forEach(function (x) {
      if (x === null) return;
      switch (tipo) {
        case 'bolinha': s += circ(x, 232, 5.5, { fill: cor.hex, stroke: c, 'stroke-width': 1.2 }) + circ(x - 1.6, 230.4, 1.6, { fill: '#fff' }); break;
        case 'argola': s += circ(x, 242, 11, { fill: 'none', stroke: cor.hex, 'stroke-width': 3.2 }) + circ(x, 242, 11, { fill: 'none', stroke: c, 'stroke-width': 0.8 }); break;
        case 'estrela': s += p('M' + x + ',230 L' + x + ',236', { stroke: c, 'stroke-width': 1.5 }) + p(estrela5(x, 244, 9, 4), { fill: cor.hex, stroke: c, 'stroke-width': 1.2, 'stroke-linejoin': 'round' }); break;
        case 'coracao': s += p('M' + x + ',230 L' + x + ',236', { stroke: c, 'stroke-width': 1.5 }) + p(coracao(x, 243, 7), { fill: cor.hex, stroke: c, 'stroke-width': 1.2 }); break;
        case 'perola': s += circ(x, 227, 2.2, { fill: cor.hex }) + circ(x, 233, 6, { fill: '#fffaf2', stroke: '#d9cbb8', 'stroke-width': 1 }) + circ(x - 2, 231, 2, { fill: '#fff' }); break;
        case 'diamante': s += circ(x, 228, 2.4, { fill: cor.hex }) + p('M' + x + ',230 L' + (x + 7) + ',238 L' + x + ',250 L' + (x - 7) + ',238Z', { fill: '#e6f6ff', stroke: cor.hex, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }) + p('M' + (x - 7) + ',238 L' + (x + 7) + ',238 M' + x + ',230 L' + x + ',250', { stroke: '#a8d8f0', 'stroke-width': 0.8 }) + p(estrela4(x + 6, 231, 4), { fill: '#fff' }); break;
        case 'lua': s += p('M' + x + ',228 L' + x + ',234', { stroke: c, 'stroke-width': 1.5 }) + p('M' + (x + 3) + ',233 C' + (x - 10) + ',234 ' + (x - 10) + ',253 ' + (x + 3) + ',254 C' + (x - 3) + ',249 ' + (x - 3) + ',238 ' + (x + 3) + ',233Z', { fill: cor.hex, stroke: c, 'stroke-width': 1 }); break;
        case 'borboleta': s += p('M' + x + ',228 L' + x + ',236', { stroke: c, 'stroke-width': 1.5 }) + elip(x - 5, 240, 5, 4.5, { fill: cor.hex, stroke: c, 'stroke-width': 0.8 }) + elip(x + 5, 240, 5, 4.5, { fill: cor.hex, stroke: c, 'stroke-width': 0.8 }) + elip(x - 4, 247, 3.5, 3, { fill: cla(cor.hex, 0.4) }) + elip(x + 4, 247, 3.5, 3, { fill: cla(cor.hex, 0.4) }) + p('M' + x + ',236 L' + x + ',250', { stroke: '#4a2c20', 'stroke-width': 1.6 }); break;
        case 'flor': s += p('M' + x + ',228 L' + x + ',234', { stroke: c, 'stroke-width': 1.5 }) + flor(x, 240, 4.2, cor.hex, '#fff3a0'); break;
        case 'pingente': s += circ(x, 231, 3.2, { fill: cor.hex }) + p('M' + x + ',234 L' + x + ',256', { stroke: cor.hex, 'stroke-width': 1.5 }) + circ(x, 242, 3, { fill: '#ff7cc8', stroke: '#fff', 'stroke-width': 0.8 }) + circ(x, 250, 3, { fill: '#7ee8ff', stroke: '#fff', 'stroke-width': 0.8 }) + p('M' + x + ',254 Q' + (x + 6) + ',262 ' + x + ',270 Q' + (x - 6) + ',262 ' + x + ',254Z', { fill: cla(cor.hex, 0.25), stroke: c, 'stroke-width': 1 }); break;
        case 'cereja': s += p('M' + x + ',229 Q' + (x + 1) + ',240 ' + (x - 4) + ',247 M' + x + ',229 Q' + (x + 4) + ',238 ' + (x + 6) + ',245', { fill: 'none', stroke: '#3cae50', 'stroke-width': 1.6 }) + circ(x - 4, 250, 4.4, { fill: '#e8384f' }) + circ(x + 6, 248, 4.4, { fill: '#e8384f' }) + circ(x - 5.5, 248.5, 1.3, { fill: '#fff' }) + circ(x + 4.5, 246.5, 1.3, { fill: '#fff' }); break;
        case 'cascata':
          s += circ(x, 229, 2.6, { fill: cor.hex }) + p('M' + (x - 6) + ',236 L' + (x + 6) + ',236', { stroke: cor.hex, 'stroke-width': 2, 'stroke-linecap': 'round' });
          [-5, 0, 5].forEach(function (dx, k) { var L = k === 1 ? 22 : 15; s += p('M' + (x + dx) + ',236 L' + (x + dx) + ',' + (236 + L), { stroke: cor.hex, 'stroke-width': 1.2 }) + p('M' + (x + dx) + ',' + (236 + L - 2) + ' L' + (x + dx + 3) + ',' + (236 + L + 3) + ' L' + (x + dx) + ',' + (236 + L + 9) + ' L' + (x + dx - 3) + ',' + (236 + L + 3) + 'Z', { fill: '#e6f6ff', stroke: '#9fd4f0', 'stroke-width': 0.8 }) + circ(x + dx, 236 + L * 0.5, 1.6, { fill: '#fff' }); });
          break;
        case 'argolaPerola': s += circ(x, 241, 10, { fill: 'none', stroke: cor.hex, 'stroke-width': 3 }) + circ(x, 252, 4.6, { fill: '#fffaf2', stroke: '#d9cbb8', 'stroke-width': 1 }) + circ(x - 1.4, 250.6, 1.5, { fill: '#fff' }); break;
        case 'lacinho': s += p('M' + x + ',229 L' + x + ',235', { stroke: c, 'stroke-width': 1.5 }) + laco(x, 241, 6, cor.hex); break;
        case 'franja':
          s += circ(x, 230, 3, { fill: cor.hex }) + p('M' + (x - 4) + ',236 Q' + x + ',230 ' + (x + 4) + ',236Z', { fill: cor.hex });
          for (var fi = -3; fi <= 3; fi++) s += p('M' + (x + fi * 1.2) + ',236 L' + (x + fi * 2.2) + ',258', { stroke: k2(fi) , 'stroke-width': 1.6, 'stroke-linecap': 'round' });
          break;
        case 'morango':
          s += p('M' + x + ',229 L' + x + ',235', { stroke: c, 'stroke-width': 1.5 }) + p('M' + (x - 7) + ',240 Q' + x + ',234 ' + (x + 7) + ',240 Q' + (x + 6) + ',252 ' + x + ',256 Q' + (x - 6) + ',252 ' + (x - 7) + ',240Z', { fill: '#ff4a5e', stroke: '#c22a3e', 'stroke-width': 1 }) +
            p('M' + (x - 6) + ',239 L' + (x - 2) + ',236 L' + x + ',239 L' + (x + 2) + ',236 L' + (x + 6) + ',239 L' + x + ',242Z', { fill: '#3cae50' });
          [[-3, 244], [2, 245], [-1, 249], [3, 250], [-3, 251]].forEach(function (q) { s += elip(x + q[0], q[1], 0.7, 1, { fill: '#ffe680' }); });
          break;
        case 'gota': s += circ(x, 232, 3.5, { fill: cor.hex, stroke: c, 'stroke-width': 1 }) + p('M' + x + ',237 Q' + (x + 9) + ',250 ' + x + ',258 Q' + (x - 9) + ',250 ' + x + ',237Z', { fill: cla(cor.hex, 0.3), stroke: c, 'stroke-width': 1.2 }) + p(estrela4(x - 2, 249, 3.5), { fill: '#fff' }); break;
      }
    });
    return s;
  }
  // óculos: cada lente centrada no seu olho (dO = olhos mais juntos ou afastados); armações de vários formatos
  function oculos(tipo, cor, dO) {
    dO = dO || 0;
    var c = cor.hex, cE = esc(c, 0.28), s = '', xs = [164 - dO, 236 + dO], grosso = 4.2;
    var lente = { fill: '#dff3ff', opacity: 0.18 }, brilhoL = function (x, y) { return p('M' + (x - 13) + ',' + (y - 9) + ' L' + (x - 5) + ',' + (y - 13), { stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: 0.55 }); };
    function aro(d, larg) { return p(d, Object.assign({}, lente)) + p(d, { fill: 'none', stroke: cE, 'stroke-width': (larg || grosso) + 1.6, 'stroke-linejoin': 'round' }) + p(d, { fill: 'none', stroke: c, 'stroke-width': larg || grosso, 'stroke-linejoin': 'round' }); }
    function retang(x, y, w, h, r) { return 'M' + (x - w + r) + ',' + (y - h) + ' L' + (x + w - r) + ',' + (y - h) + ' Q' + (x + w) + ',' + (y - h) + ' ' + (x + w) + ',' + (y - h + r) + ' L' + (x + w) + ',' + (y + h - r) + ' Q' + (x + w) + ',' + (y + h) + ' ' + (x + w - r) + ',' + (y + h) + ' L' + (x - w + r) + ',' + (y + h) + ' Q' + (x - w) + ',' + (y + h) + ' ' + (x - w) + ',' + (y + h - r) + ' L' + (x - w) + ',' + (y - h + r) + ' Q' + (x - w) + ',' + (y - h) + ' ' + (x - w + r) + ',' + (y - h) + 'Z'; }
    var yP = 210, hasteY = 206, esp = { retangular: 27, quadrado: 27, gatinho: 27, oval: 26, redondoGrande: 26, aviador: 26, meioAro: 26, fininho: 23 }[tipo] || 23;
    xs.forEach(function (x, k) {
      var lado = k ? 1 : -1;
      switch (tipo) {
        case 'sol': s += elip(x, 217, 27, 21, { fill: mistura(c, '#1d1420', 0.6), opacity: 0.88, stroke: c, 'stroke-width': 4 }) + p('M' + (x - 14) + ',206 L' + (x - 4) + ',202', { stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.7 }); break;
        case 'coracao': s += p(coracao(x, 216, 21), { fill: c, opacity: 0.4, stroke: c, 'stroke-width': 4, 'stroke-linejoin': 'round' }); break;
        case 'estrela': s += p(estrela5(x, 216, 30, 15), { fill: c, opacity: 0.35, stroke: c, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }); break;
        case 'redondo': s += circ(x, 216, 23, { fill: '#fff', opacity: 0.15, stroke: c, 'stroke-width': 3.5 }); break;
        case 'retangular': s += aro(retang(x, 216, 27, 17, 7)) + brilhoL(x, 216); break;
        case 'quadrado': s += aro(retang(x, 216, 26, 22, 4), 5) + brilhoL(x, 216); break;
        case 'oval': s += aro('M' + (x - 26) + ',216 a26,19 0 1,0 52,0 a26,19 0 1,0 -52,0Z') + brilhoL(x, 216); break;
        case 'redondoGrande': s += aro('M' + (x - 26) + ',218 a26,26 0 1,0 52,0 a26,26 0 1,0 -52,0Z', 3.6) + brilhoL(x, 216); break;
        case 'gatinho':
          s += aro('M' + (x - lado * 24) + ',' + 204 + ' Q' + x + ',' + 199 + ' ' + (x + lado * 30) + ',' + 196 + ' Q' + (x + lado * 26) + ',' + 222 + ' ' + (x + lado * 6) + ',' + 232 + ' Q' + (x - lado * 20) + ',' + 236 + ' ' + (x - lado * 24) + ',' + 214 + 'Z') + brilhoL(x, 216); break;
        case 'aviador': s += aro('M' + (x - 25) + ',204 L' + (x + 25) + ',204 Q' + (x + 27) + ',226 ' + (x + 12) + ',236 Q' + x + ',240 ' + (x - 12) + ',236 Q' + (x - 27) + ',226 ' + (x - 25) + ',204Z', 2.4) + brilhoL(x, 216); break;
        case 'meioAro': s += p('M' + (x - 26) + ',216 a26,18 0 1,0 52,0', { fill: '#dff3ff', opacity: 0.18 }) + p(retang(x, 216, 26, 17, 6), { fill: '#dff3ff', opacity: 0.12 }) + p('M' + (x - 27) + ',218 L' + (x - 27) + ',205 Q' + (x - 27) + ',199 ' + (x - 20) + ',199 L' + (x + 20) + ',199 Q' + (x + 27) + ',199 ' + (x + 27) + ',205 L' + (x + 27) + ',218', { fill: 'none', stroke: c, 'stroke-width': 5, 'stroke-linecap': 'round' }) + brilhoL(x, 216); break;
        case 'fininho': s += aro('M' + (x - 22) + ',216 a22,18 0 1,0 44,0 a22,18 0 1,0 -44,0Z', 1.8) + brilhoL(x, 216); break;
      }
    });
    var w = esp;
    var haste = p('M' + (xs[0] - w + 1) + ',' + hasteY + ' L116,204 M' + (xs[1] + w - 1) + ',' + hasteY + ' L284,204', { stroke: c, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
    var ponte = tipo === 'aviador' ? p('M' + (xs[0] + 24) + ',206 L' + (xs[1] - 24) + ',206 M' + (xs[0] + 22) + ',212 Q200,207 ' + (xs[1] - 22) + ',212', { fill: 'none', stroke: c, 'stroke-width': 2.4, 'stroke-linecap': 'round' })
      : p('M' + (xs[0] + w - 3) + ',' + yP + ' Q200,203 ' + (xs[1] - w + 3) + ',' + yP, { fill: 'none', stroke: c, 'stroke-width': tipo === 'fininho' ? 2 : 3.8, 'stroke-linecap': 'round' });
    return haste + s + ponte;
  }
  function lacos(tipo, cor, corte) {
    switch (tipo) {
      case 'alto': return laco(200, 104, 28, cor.hex);
      case 'lado': return laco(270, 142, 21, cor.hex);
      case 'dois': return corte === 'chiquinhas' ? laco(118, 166, 15, cor.hex) + laco(282, 166, 15, cor.hex) : laco(130, 148, 15, cor.hex) + laco(270, 148, 15, cor.hex);
      case 'estrela': return p(estrela5(270, 146, 15, 7), { fill: cor.hex, stroke: esc(cor.hex, 0.3), 'stroke-width': 1.5, 'stroke-linejoin': 'round' }) + p(estrela4(266, 141, 4), { fill: '#fff' });
      case 'presilhas': return ['#ff8fc8', '#7ee8ff', '#ffd76a', cor.hex].map(function (c2, k) { var x = 232 + k * 15, y = 124 + k * 11; return '<g transform="rotate(' + (30 + k * 6) + ' ' + x + ' ' + y + ')">' + ret(x - 15, y - 4, 30, 8, { rx: 4, fill: c2, stroke: esc(c2, 0.3), 'stroke-width': 1 }) + ret(x - 7, y - 1.2, 9, 2, { rx: 1, fill: '#fff', opacity: 0.6 }) + '</g>'; }).join('');
      case 'perolas': var sp = ''; for (var pk = 0; pk < 6; pk++) { var pt2 = pk / 5, px = 232 + pt2 * 40, py = 122 + pt2 * 34; sp += circ(px, py, 4.4, { fill: '#fffaf2', stroke: '#d9cbb8', 'stroke-width': 1 }) + circ(px - 1.3, py - 1.3, 1.3, { fill: '#fff' }); } return sp;
      case 'borboletas': return [[138, 140, -20], [262, 140, 20], [244, 118, 10]].map(function (q, k) { var c2 = k === 2 ? '#7ee8ff' : cor.hex; return '<g transform="rotate(' + q[2] + ' ' + q[0] + ' ' + q[1] + ')">' + elip(q[0] - 6, q[1] - 4, 7, 6, { fill: c2, stroke: esc(c2, 0.3), 'stroke-width': 1 }) + elip(q[0] + 6, q[1] - 4, 7, 6, { fill: c2, stroke: esc(c2, 0.3), 'stroke-width': 1 }) + elip(q[0] - 5, q[1] + 4, 5, 4, { fill: cla(c2, 0.4) }) + elip(q[0] + 5, q[1] + 4, 5, 4, { fill: cla(c2, 0.4) }) + p('M' + q[0] + ',' + (q[1] - 7) + ' L' + q[0] + ',' + (q[1] + 7), { stroke: esc(c2, 0.5), 'stroke-width': 2, 'stroke-linecap': 'round' }) + '</g>'; }).join('');
      case 'florGrande': var fl = ''; for (var fp = 0; fp < 6; fp++) { var af = fp * Math.PI / 3; fl += elip(268 + Math.cos(af) * 12, 140 + Math.sin(af) * 12, 11, 7, { fill: cor.hex, stroke: esc(cor.hex, 0.25), 'stroke-width': 1, transform: 'rotate(' + Math.round(af * 180 / Math.PI) + ' ' + n(268 + Math.cos(af) * 12) + ' ' + n(140 + Math.sin(af) * 12) + ')' }); } return elip(250, 154, 9, 4, { fill: '#5cc46a', transform: 'rotate(-30 250 154)' }) + fl + circ(268, 140, 6, { fill: '#ffd23f', stroke: '#e89a10', 'stroke-width': 1 });
      case 'lacao': return laco(200, 98, 40, cor.hex);
    }
    return '';
  }
  function cabeca(tipo, cor, I, peca) {
    var c = esc(cor.hex, 0.3), s = '';
    switch (tipo) {
      case 'tiara':
        s = p('M126,152 Q200,96 274,152', { fill: 'none', stroke: c, 'stroke-width': 9, 'stroke-linecap': 'round' }) + p('M126,152 Q200,96 274,152', { fill: 'none', stroke: cor.hex, 'stroke-width': 6, 'stroke-linecap': 'round' });
        s += p('M188,120 L200,96 L212,120 L200,128Z', { fill: '#ff7cc8', stroke: '#fff', 'stroke-width': 1.5 }) + circ(166, 128, 4, { fill: '#7ee8ff', stroke: '#fff', 'stroke-width': 1 }) + circ(234, 128, 4, { fill: '#7ee8ff', stroke: '#fff', 'stroke-width': 1 }) + p(estrela4(204, 106, 4), { fill: '#fff' });
        break;
      case 'coroa':
        s = peca('M150,130 L154,76 L177,104 L200,62 L223,104 L246,76 L250,130 Q200,140 150,130Z', cor, 'x') + p('M151,118 Q200,128 249,118 L250,130 Q200,140 150,130Z', { fill: esc(cor.hex, 0.15) });
        s += circ(154, 76, 5, { fill: '#ff7cc8', stroke: '#fff', 'stroke-width': 1.2 }) + circ(246, 76, 5, { fill: '#ff7cc8', stroke: '#fff', 'stroke-width': 1.2 }) + circ(200, 62, 6, { fill: '#7ee8ff', stroke: '#fff', 'stroke-width': 1.2 }) + elip(200, 124, 7, 5, { fill: '#e8384f', stroke: '#fff', 'stroke-width': 1.2 });
        break;
      case 'flores':
        var cores = [cor.hex, '#ff8fc8', '#ffd23f', '#cfa8ff'];
        for (var i = 0; i <= 8; i++) { var t = i / 8, x = (1 - t) * (1 - t) * 116 + 2 * (1 - t) * t * 200 + t * t * 284, y = (1 - t) * (1 - t) * 176 + 2 * (1 - t) * t * 70 + t * t * 176; if (i % 2) s += elip(x, y + 8, 6, 3.5, { fill: '#5cc46a', transform: 'rotate(30 ' + n(x) + ' ' + n(y + 8) + ')' }); s += flor(x, y, 7, cores[i % cores.length], '#fff3a0'); }
        break;
      case 'chapeu':
        s = elip(200, 134, 150, 30, { fill: '#f3d48b', stroke: '#c9a352', 'stroke-width': 2 }) + p('M140,132 Q144,62 200,60 Q256,62 260,132Z', { fill: '#f6dc9c', stroke: '#c9a352', 'stroke-width': 2 }) +
          p('M141,116 Q200,128 259,116 L260,132 Q200,142 140,132Z', { fill: cor.hex, stroke: c, 'stroke-width': 1.5 }) + flor(246, 124, 6, '#fff', cor.hex);
        break;
      case 'gorro':
        s = peca('M106,172 Q104,82 200,78 Q296,82 294,172Z', cor, 'x');
        for (var k = 0; k < 7; k++) s += p('M' + (130 + k * 23) + ',96 L' + (130 + k * 23) + ',166', { stroke: esc(cor.hex, 0.15), 'stroke-width': 2, opacity: 0.6 });
        s += p('M102,170 Q200,150 298,170 L298,196 Q200,176 102,196Z', { fill: cla(cor.hex, 0.35), stroke: c, 'stroke-width': 2 }) + circ(200, 72, 22, { fill: cla(cor.hex, 0.55), stroke: c, 'stroke-width': 2 });
        break;
      case 'diadema':
        s = p('M126,152 Q200,96 274,152', { fill: 'none', stroke: c, 'stroke-width': 10, 'stroke-linecap': 'round' }) + p('M126,152 Q200,96 274,152', { fill: 'none', stroke: cor.hex, 'stroke-width': 7, 'stroke-linecap': 'round' });
        var gemas = ['#ff5fb4', '#7ee8ff', '#ffd23f', '#86ecc8', '#b892ff'];
        for (var d = 0; d <= 8; d++) { var td = d / 8, gx = (1 - td) * (1 - td) * 126 + 2 * (1 - td) * td * 200 + td * td * 274, gy = (1 - td) * (1 - td) * 152 + 2 * (1 - td) * td * 96 + td * td * 152; s += circ(gx, gy, d === 4 ? 6.5 : 4.5, { fill: gemas[d % gemas.length], stroke: '#fff', 'stroke-width': 1.2 }); }
        s += p(estrela4(204, 118, 5), { fill: '#fff' });
        break;
      case 'faixa':
        s = p('M118,170 Q200,96 282,170', { fill: 'none', stroke: c, 'stroke-width': 15, 'stroke-linecap': 'round' }) + p('M118,170 Q200,96 282,170', { fill: 'none', stroke: cor.hex, 'stroke-width': 12, 'stroke-linecap': 'round' }) +
          p('M150,132 Q200,108 250,132', { fill: 'none', stroke: '#fff', 'stroke-width': 2.5, opacity: 0.35, 'stroke-linecap': 'round' }) +
          elip(200, 116, 13, 10, { fill: cor.hex, stroke: c, 'stroke-width': 2 }) + p('M188,114 Q178,100 172,112 M212,114 Q222,100 228,112', { fill: 'none', stroke: c, 'stroke-width': 2, opacity: 0.7 });
        break;
      case 'unicornio':
        s = p('M118,170 Q200,92 282,170', { fill: 'none', stroke: cor.hex, 'stroke-width': 7, 'stroke-linecap': 'round' }) +
          p('M186,108 L200,40 L214,108Z', { fill: '#fff5d6', stroke: '#e0b84a', 'stroke-width': 2, 'stroke-linejoin': 'round' }) + p('M190,96 L210,88 M193,82 L207,74 M196,66 L204,60', { stroke: '#e0b84a', 'stroke-width': 2 }) +
          dois('M154,116 L146,86 L172,104Z', { fill: cor.hex, stroke: c, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }) + flor(170, 120, 5, '#ff8fc8', '#ffd23f') + flor(230, 120, 5, '#b892ff', '#ffd23f') + flor(200, 112, 4, '#7ee8ff', '#fff');
        break;
      case 'estrelas':
        s = p('M118,170 Q200,92 282,170', { fill: 'none', stroke: c, 'stroke-width': 5, 'stroke-linecap': 'round' }) + p('M118,170 Q200,92 282,170', { fill: 'none', stroke: cor.hex, 'stroke-width': 3, 'stroke-linecap': 'round' });
        [[146, 116, 9], [174, 94, 11], [200, 84, 14], [226, 94, 11], [254, 116, 9]].forEach(function (q) { s += p('M' + q[0] + ',' + (q[1] + 14) + ' L' + q[0] + ',' + (q[1] + q[2] * 0.6), { stroke: c, 'stroke-width': 1.5 }) + p(estrela5(q[0], q[1], q[2], q[2] * 0.45), { fill: '#ffd76a', stroke: '#e0a520', 'stroke-width': 1.2, 'stroke-linejoin': 'round' }) + circ(q[0] - q[2] * 0.25, q[1] - q[2] * 0.2, q[2] * 0.15, { fill: '#fff' }); });
        break;
      case 'orelhas':
        s = p('M118,170 Q200,92 282,170', { fill: 'none', stroke: cor.hex, 'stroke-width': 6, 'stroke-linecap': 'round' }) +
          dois('M126,142 L118,80 L168,112Z', { fill: cor.hex, stroke: c, 'stroke-width': 2, 'stroke-linejoin': 'round' }) + dois('M132,130 L127,96 L156,114Z', { fill: '#ff9ec4' });
        break;
    }
    return s;
  }

  /* ---------- a passarela do desfile ----------
     Palco de show: parede com letreiro de lâmpadas, passarela em perspectiva com luzes correndo nas bordas,
     holofotes, plateia dos dois lados com flashes de câmera. As animações (lâmpadas, luzes, holofotes e flashes)
     são de CSS (classes pas-*), então param sozinhas com "reduzir movimento". 400 × 720, alinhado embaixo. */
  function passarela(id) {
    var I = (id || 'pas') + '-', s = '', r = sorteio(42), k;
    s += '<defs><linearGradient id="' + I + 'ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12031f"/><stop offset=".55" stop-color="#3a0d5a"/><stop offset="1" stop-color="#1c0630"/></linearGradient>' +
      '<linearGradient id="' + I + 'chao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd6ec"/><stop offset=".5" stop-color="#ff9fd2"/><stop offset="1" stop-color="#e45fa8"/></linearGradient>' +
      '<linearGradient id="' + I + 'brilhoChao" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="' + I + 'luz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity=".75"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="' + I + 'brilho"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#ff9fd2" stop-opacity="0"/></radialGradient></defs>';
    s += ret(0, 0, 400, 720, { fill: 'url(#' + I + 'ceu)' });
    // estrelinhas no teto escuro
    for (k = 0; k < 40; k++) s += circ(r() * 400, r() * 300, 0.6 + r() * 1.4, { fill: '#fff', opacity: n(0.3 + r() * 0.6), class: 'pas-pisca', style: 'animation-delay:' + n(r() * 3) + 's' });
    // parede do fundo: arco com lâmpadas e o letreiro
    s += p('M60,430 L60,250 Q200,150 340,250 L340,430Z', { fill: '#2a0a45', stroke: '#ff5fb4', 'stroke-width': 3 });
    s += p('M80,430 L80,262 Q200,178 320,262 L320,430Z', { fill: '#4b1673' });
    for (k = 0; k <= 26; k++) { var t = k / 26, ax = (1 - t) * (1 - t) * 60 + 2 * (1 - t) * t * 200 + t * t * 340, ay = (1 - t) * (1 - t) * 250 + 2 * (1 - t) * t * 150 + t * t * 250; s += circ(ax, ay, 4, { fill: '#ffe680', class: 'pas-lampada', style: 'animation-delay:' + n(k * 0.08) + 's' }); }
    for (k = 0; k < 8; k++) { s += circ(60, 270 + k * 20, 3.5, { fill: '#ffe680', class: 'pas-lampada', style: 'animation-delay:' + n(k * 0.1) + 's' }) + circ(340, 270 + k * 20, 3.5, { fill: '#ffe680', class: 'pas-lampada', style: 'animation-delay:' + n(k * 0.1 + 0.05) + 's' }); }
    s += '<text x="200" y="236" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="30" fill="#fff" stroke="#ff5fb4" stroke-width="1.5" class="pas-letreiro">✨ PURPURINA ✨</text>';
    // cortina de luz no fundo do arco
    for (k = 0; k < 9; k++) s += ret(88 + k * 26, 280, 10, 150, { fill: k % 2 ? '#ff8fc8' : '#b892ff', opacity: 0.22, rx: 5, class: 'pas-led', style: 'animation-delay:' + n(k * 0.15) + 's' });
    // passarela em perspectiva (do fundo até a frente)
    s += p('M168,430 L232,430 L380,720 L20,720Z', { fill: 'url(#' + I + 'chao)' });
    s += p('M190,430 L210,430 L240,720 L160,720Z', { fill: 'url(#' + I + 'brilhoChao)', opacity: 0.8 });
    for (k = 0; k < 7; k++) { var yl = 430 + Math.pow(k / 7, 1.6) * 290; s += p('M' + n(200 - (32 + (yl - 430) * 0.62)) + ',' + n(yl) + ' L' + n(200 + 32 + (yl - 430) * 0.62) + ',' + n(yl), { stroke: '#fff', 'stroke-width': 1, opacity: 0.25 }); }
    // luzes correndo nas bordas da passarela
    for (k = 0; k < 16; k++) {
      var tt = Math.pow(k / 15, 1.5), yy = 430 + tt * 290, dx = 32 + tt * 180, rr = 2.2 + tt * 5;
      s += circ(200 - dx, yy, rr, { fill: '#fff', class: 'pas-borda', style: 'animation-delay:' + n(k * 0.09) + 's' }) + circ(200 + dx, yy, rr, { fill: '#fff', class: 'pas-borda', style: 'animation-delay:' + n(k * 0.09) + 's' });
    }
    // plateia dos dois lados, com flashes de câmera
    [[-1, 0], [1, 0]].forEach(function (q) {
      for (var fila = 0; fila < 3; fila++) for (var c = 0; c < 6; c++) {
        var y = 520 + fila * 70 + (c % 2) * 8, x = q[0] < 0 ? 18 + c * 24 - fila * 6 + fila * fila * 0 : 382 - c * 24 + fila * 6;
        if ((q[0] < 0 && x > 200 - (34 + (y - 430) * 0.62) - 14) || (q[0] > 0 && x < 200 + (34 + (y - 430) * 0.62) + 14)) continue;
        var tom = ['#1a0630', '#24083d', '#2e0b4a'][fila];
        s += elip(x, y + 26, 15, 16, { fill: tom }) + circ(x, y, 11, { fill: tom });
        if (r() < 0.45) s += '<g class="pas-flash" style="animation-delay:' + n(r() * 4) + 's;animation-duration:' + n(2.5 + r() * 3) + 's">' + circ(x + 6, y + 12, 10, { fill: 'url(#' + I + 'brilho)' }) + p(estrela4(x + 6, y + 12, 9), { fill: '#fff' }) + '</g>';
      }
    });
    // holofotes balançando
    s += '<g class="pas-holofote pas-h1">' + p('M70,0 L30,720 L170,720Z', { fill: 'url(#' + I + 'luz)', opacity: 0.35 }) + '</g>';
    s += '<g class="pas-holofote pas-h2">' + p('M330,0 L230,720 L370,720Z', { fill: 'url(#' + I + 'luz)', opacity: 0.35 }) + '</g>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 720" preserveAspectRatio="xMidYMax slice">' + s + '</svg>';
  }

  /* teto do show: uma barra de refletores coloridos que acendem um atrás do outro, cada um com o seu facho de luz.
     Camada própria, presa no alto da passarela (o desenho da passarela é cortado em cima quando a tela está em pé). */
  function tetoShow() {
    var s = '', k, cores = ['#ff5fb4', '#ffd23f', '#7ee8ff', '#b892ff', '#86ecc8', '#ff8f5a'];
    s += ret(0, 6, 400, 10, { fill: '#5a2a7a', stroke: '#8a4fb0', 'stroke-width': 1.5 }) + ret(0, 17, 400, 3, { fill: '#3a1456' });
    for (k = 0; k < 11; k++) {
      var lx = 20 + k * 36, cor = cores[k % cores.length], at = n((k % 2 ? k + 6 : k) * 0.16), fim = lx + (200 - lx) * 0.5;
      s += '<g class="pas-facho" style="animation-delay:' + at + 's">' + p('M' + (lx - 6) + ',30 L' + (lx + 6) + ',30 L' + n(fim + 34) + ',240 L' + n(fim - 34) + ',240Z', { fill: cor, opacity: 0.22 }) + '</g>';
      s += ret(lx - 7, 14, 14, 13, { fill: '#2a0a3c', rx: 4 }) + circ(lx, 29, 8.5, { fill: '#2a0a3c' }) +
        '<g class="pas-teto" style="animation-delay:' + at + 's">' + circ(lx, 30, 14, { fill: cor, opacity: 0.4 }) + circ(lx, 29, 7, { fill: cor }) + circ(lx - 2, 27, 2.4, { fill: '#fff' }) + '</g>';
    }
    return '<svg class="teto-show" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" preserveAspectRatio="xMidYMin slice" aria-hidden="true">' + s + '</svg>';
  }

  // ---------- cenários ----------
  function cenario(id, I) {
    var s = '', r = sorteio(99), k;
    function grad(nome, a, b) { return '<defs><linearGradient id="' + I + nome + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs>'; }
    switch (id) {
      case 'quarto':
        s = ret(0, 0, W, H, { fill: '#ffd9ec' });
        for (k = 0; k < 10; k++) s += ret(k * 44, 0, 20, 600, { fill: '#ffc8e3' });
        s += ret(0, 590, W, 130, { fill: '#e7b2d4' }) + elip(200, 668, 170, 34, { fill: '#cfa8ff', opacity: 0.9 }) + elip(200, 668, 140, 24, { fill: '#e3ccff' });
        s += ret(36, 120, 104, 130, { fill: '#9ad8ff', stroke: '#fff', 'stroke-width': 8, rx: 6 }) + circ(110, 150, 14, { fill: '#fff6b0' }) + p('M30,112 Q60,190 40,262 L28,262Z M146,112 Q116,190 136,262 L148,262Z', { fill: '#ff8fc8' });
        s += p('M0,70 Q100,104 200,70 Q300,104 400,70', { fill: 'none', stroke: '#fff', 'stroke-width': 2 });
        for (k = 0; k < 9; k++) s += p(coracao(20 + k * 45, 88 + (k % 2 ? 6 : 10), 7), { fill: ['#ff4fa3', '#ffd23f', '#8fd0ff'][k % 3] });
        s += ret(312, 556, 64, 44, { fill: '#fff', rx: 6, stroke: '#e6c6dc', 'stroke-width': 3 }) + p('M344,556 L344,522', { stroke: '#c9a3ff', 'stroke-width': 4 }) + circ(344, 506, 30, { fill: '#fff3a0', opacity: 0.35 }) +
          p('M324,522 L364,522 L355,490 L333,490Z', { fill: '#ffd23f', stroke: '#e8a920', 'stroke-width': 2, 'stroke-linejoin': 'round' });
        break;
      case 'praia':
        s = grad('ceu', '#7fd3ff', '#d9f4ff') + ret(0, 0, W, H, { fill: 'url(#' + I + 'ceu)' }) + circ(330, 90, 36, { fill: '#ffe066' }) + circ(330, 90, 50, { fill: '#ffe066', opacity: 0.25 });
        s += ret(0, 420, W, 140, { fill: '#33b5e5' }) + ret(0, 420, W, 30, { fill: '#5fd0f5' });
        for (k = 0; k < 6; k++) s += p('M' + (k * 75 - 10) + ',' + (470 + (k % 2) * 30) + ' q12,-8 24,0 q12,8 24,0', { fill: 'none', stroke: '#fff', 'stroke-width': 3, opacity: 0.8 });
        s += p('M0,540 Q200,520 400,540 L400,720 L0,720Z', { fill: '#ffe2a3' });
        for (k = 0; k < 30; k++) s += circ(r() * 400, 560 + r() * 160, 1.5, { fill: '#e8c27a' });
        s += p('M44,560 Q30,420 62,300', { fill: 'none', stroke: '#a0703c', 'stroke-width': 14, 'stroke-linecap': 'round' });
        ['M62,300 Q20,270 -6,300 Q30,286 62,300Z', 'M62,300 Q100,260 136,286 Q96,282 62,300Z', 'M62,300 Q40,240 70,224 Q60,260 62,300Z', 'M62,300 Q110,300 120,340 Q90,310 62,300Z', 'M62,300 Q14,312 6,350 Q36,316 62,300Z'].forEach(function (d) { s += p(d, { fill: '#3cc46a', stroke: '#2a9a50', 'stroke-width': 3, 'stroke-linejoin': 'round' }); });
        s += circ(340, 620, 26, { fill: '#fff' }) + p('M314,620 A26,26 0 0 1 340,594 L340,620Z', { fill: '#ff5a6e' }) + p('M340,594 A26,26 0 0 1 366,620 L340,620Z', { fill: '#ffd23f' }) + p('M340,620 L340,646 A26,26 0 0 1 314,620Z', { fill: '#5ac8ff' });
        s += p('M150,150 q10,-10 20,0 q10,-10 20,0 M230,120 q8,-8 16,0 q8,-8 16,0', { fill: 'none', stroke: '#4a6a8a', 'stroke-width': 2.5, 'stroke-linecap': 'round' });
        break;
      case 'castelo':
        s = grad('ceu', '#2a1460', '#7a3fb0') + ret(0, 0, W, H, { fill: 'url(#' + I + 'ceu)' });
        for (k = 0; k < 30; k++) s += p(estrela4(r() * 400, r() * 300, 1.5 + r() * 3), { fill: '#fff', opacity: 0.5 + r() * 0.5 });
        s += p('M40,520 L40,300 L70,250 L100,300 L100,360 L150,360 L150,250 L200,180 L250,250 L250,360 L300,360 L300,300 L330,250 L360,300 L360,520Z', { fill: '#5b3a9a', opacity: 0.9 });
        [[70, 330], [330, 330], [200, 280], [175, 400], [225, 400]].forEach(function (q) { s += ret(q[0] - 7, q[1], 14, 22, { fill: '#ffe08a', rx: 7 }); });
        s += ret(0, 520, W, 200, { fill: '#3d2470' }) + p('M150,720 L176,520 L224,520 L250,720Z', { fill: '#d43a5a' }) + p('M160,720 L180,520 M240,720 L220,520', { stroke: '#ffd23f', 'stroke-width': 3 });
        s += ret(0, 300, 26, 420, { fill: '#e8dcff' }) + ret(374, 300, 26, 420, { fill: '#e8dcff' });
        s += p('M200,0 L200,30', { stroke: '#ffd23f', 'stroke-width': 2 }) + p('M150,40 Q200,70 250,40', { fill: 'none', stroke: '#ffd23f', 'stroke-width': 4 });
        for (k = 0; k < 5; k++) s += p('M' + (156 + k * 22) + ',' + (44 + (k === 2 ? 18 : k % 2 ? 12 : 4)) + ' l0,10', { stroke: '#ffd23f', 'stroke-width': 2 }) + circ(156 + k * 22, 60 + (k === 2 ? 18 : k % 2 ? 12 : 4), 4, { fill: '#fff6b0' });
        break;
      case 'palco':
        s = ret(0, 0, W, H, { fill: '#1d0f36' });
        for (k = 0; k < 24; k++) s += p(estrela4(60 + r() * 280, 60 + r() * 360, 2 + r() * 4), { fill: ['#ff7cc8', '#7ee8ff', '#ffd76a'][k % 3], opacity: 0.8 });
        s += p('M0,0 L80,0 Q60,300 90,720 L0,720Z', { fill: '#c8243f' }) + p('M400,0 L320,0 Q340,300 310,720 L400,720Z', { fill: '#c8243f' });
        for (k = 0; k < 3; k++) s += p('M' + (16 + k * 22) + ',0 Q' + (10 + k * 22) + ',300 ' + (24 + k * 24) + ',720', { fill: 'none', stroke: '#8f1530', 'stroke-width': 3 }) + p('M' + (384 - k * 22) + ',0 Q' + (390 - k * 22) + ',300 ' + (376 - k * 24) + ',720', { fill: 'none', stroke: '#8f1530', 'stroke-width': 3 });
        s += p('M0,0 L400,0 L400,40 Q300,70 200,40 Q100,70 0,40Z', { fill: '#a81d36' });
        s += p('M60,40 L150,680 L250,680Z', { fill: '#fff3a0', opacity: 0.16 }) + p('M340,40 L150,680 L250,680Z', { fill: '#ffb3e6', opacity: 0.16 });
        s += ret(0, 610, W, 110, { fill: '#5a3a2a' });
        for (k = 0; k < 6; k++) s += p('M0,' + (622 + k * 18) + ' L400,' + (622 + k * 18), { stroke: '#46291c', 'stroke-width': 2 });
        break;
      case 'jardim':
        s = grad('ceu', '#9fdcff', '#e6f7ff') + ret(0, 0, W, H, { fill: 'url(#' + I + 'ceu)' });
        [[80, 90], [300, 60]].forEach(function (q) { s += elip(q[0], q[1], 40, 16, { fill: '#fff' }) + elip(q[0] + 22, q[1] - 10, 26, 16, { fill: '#fff' }); });
        s += p('M0,420 Q120,360 240,420 Q330,380 400,410 L400,720 L0,720Z', { fill: '#8fdc7a' }) + p('M0,520 Q200,470 400,520 L400,720 L0,720Z', { fill: '#6cc860' });
        s += ret(312, 260, 18, 180, { fill: '#a0703c' }) + circ(320, 240, 60, { fill: '#4cbf5c' }) + circ(290, 270, 38, { fill: '#3fae50' }) + circ(352, 272, 38, { fill: '#3fae50' });
        for (k = 0; k < 7; k++) s += circ(286 + r() * 70, 200 + r() * 90, 5, { fill: '#ff5a6e' });
        for (k = 0; k < 18; k++) { var fx = r() * 400, fy = 540 + r() * 170; s += p('M' + n(fx) + ',' + n(fy) + ' l0,14', { stroke: '#3a9a4a', 'stroke-width': 2 }) + flor(fx, fy, 4.5, ['#ff8fc8', '#ffd23f', '#cfa8ff', '#fff'][k % 4], '#ffb000'); }
        s += elip(60, 200, 7, 5, { fill: '#ff8fc8' }) + elip(72, 200, 7, 5, { fill: '#ff8fc8' }) + p('M66,194 L66,206', { stroke: '#4a2c20', 'stroke-width': 2 });
        break;
      case 'neve':
        s = grad('ceu', '#bcdcff', '#f1f8ff') + ret(0, 0, W, H, { fill: 'url(#' + I + 'ceu)' });
        s += p('M-20,440 L90,260 L200,440Z', { fill: '#dce9f8' }) + p('M140,440 L270,220 L420,440Z', { fill: '#cfe0f4' }) + p('M70,292 L90,260 L112,292 L100,286 L90,296 L80,286Z M248,256 L270,220 L292,256 L280,250 L270,262 L260,250Z', { fill: '#fff' });
        s += p('M0,500 Q200,460 400,500 L400,720 L0,720Z', { fill: '#fbfdff' });
        [[40, 470], [360, 480], [90, 440]].forEach(function (q) { s += p('M' + q[0] + ',' + (q[1] - 90) + ' L' + (q[0] + 34) + ',' + q[1] + ' L' + (q[0] - 34) + ',' + q[1] + 'Z', { fill: '#2f8a64' }) + p('M' + q[0] + ',' + (q[1] - 90) + ' L' + (q[0] + 14) + ',' + (q[1] - 52) + ' L' + (q[0] - 14) + ',' + (q[1] - 52) + 'Z', { fill: '#fff' }); });
        s += circ(340, 640, 28, { fill: '#fff', stroke: '#d6e4f2', 'stroke-width': 2 }) + circ(340, 596, 20, { fill: '#fff', stroke: '#d6e4f2', 'stroke-width': 2 }) + p('M340,598 L356,602 L340,604Z', { fill: '#ff8a3d' }) + circ(334, 590, 2.2, { fill: '#2a1c1a' }) + circ(346, 590, 2.2, { fill: '#2a1c1a' });
        for (k = 0; k < 40; k++) s += circ(r() * 400, r() * 640, 1.5 + r() * 2.5, { fill: '#fff', opacity: 0.9 });
        break;
      case 'festa':
        s = ret(0, 0, W, H, { fill: '#fff0c8' });
        for (k = 0; k < 50; k++) s += circ(r() * 400, r() * 600, 3, { fill: ['#ff4fa3', '#7ee8ff', '#ffd23f', '#86ecc8', '#cfa8ff'][k % 5], opacity: 0.6 });
        s += p('M0,40 Q200,100 400,40', { fill: 'none', stroke: '#c9a352', 'stroke-width': 2 });
        for (k = 0; k < 9; k++) { var bx = 10 + k * 46, by = 40 + Math.sin(k / 8 * Math.PI) * 30; s += p('M' + n(bx) + ',' + n(by) + ' L' + n(bx + 34) + ',' + n(by + 4) + ' L' + n(bx + 17) + ',' + n(by + 40) + 'Z', { fill: ['#ff4fa3', '#ffd23f', '#5ac8ff', '#86ecc8', '#cfa8ff'][k % 5] }); }
        [[50, 220, '#ff4fa3'], [86, 270, '#5ac8ff'], [350, 230, '#ffd23f'], [318, 290, '#cfa8ff']].forEach(function (q) { s += p('M' + q[0] + ',' + (q[1] + 38) + ' Q' + (q[0] + 10) + ',' + (q[1] + 120) + ' ' + q[0] + ',' + (q[1] + 200), { fill: 'none', stroke: '#9a8a9a', 'stroke-width': 1.5 }) + elip(q[0], q[1], 30, 38, { fill: q[2] }) + elip(q[0] - 10, q[1] - 14, 6, 10, { fill: '#fff', opacity: 0.5 }); });
        s += ret(0, 600, W, 120, { fill: '#ffd59e' }) + ret(300, 560, 90, 60, { fill: '#fff', rx: 6, stroke: '#ffb3d9', 'stroke-width': 4 }) + ret(312, 530, 66, 32, { fill: '#ff8fc8', rx: 6 }) + p('M345,512 L345,530', { stroke: '#5ac8ff', 'stroke-width': 4 }) + elip(345, 506, 4, 7, { fill: '#ffb000' });
        break;
      case 'mar':
        s = grad('ceu', '#3fc2e6', '#0b4f8f') + ret(0, 0, W, H, { fill: 'url(#' + I + 'ceu)' });
        for (k = 0; k < 4; k++) s += p('M' + (40 + k * 100) + ',0 L' + (90 + k * 100) + ',0 L' + (20 + k * 100) + ',520 L' + (-10 + k * 100) + ',520Z', { fill: '#fff', opacity: 0.07 });
        s += p('M0,640 Q200,610 400,640 L400,720 L0,720Z', { fill: '#f3d6a0' });
        [[30, '#3fbf7a'], [70, '#2fa868'], [340, '#3fbf7a'], [376, '#2fa868']].forEach(function (q) { s += p('M' + q[0] + ',660 Q' + (q[0] - 20) + ',600 ' + q[0] + ',560 Q' + (q[0] + 20) + ',520 ' + q[0] + ',460', { fill: 'none', stroke: q[1], 'stroke-width': 9, 'stroke-linecap': 'round' }); });
        s += p('M300,660 L300,620 M300,630 L286,606 M300,624 L316,598', { stroke: '#ff7c9a', 'stroke-width': 8, 'stroke-linecap': 'round' });
        for (k = 0; k < 18; k++) s += circ(r() * 400, r() * 600, 3 + r() * 6, { fill: 'none', stroke: '#fff', 'stroke-width': 1.5, opacity: 0.55 });
        [[80, 180, '#ffd23f'], [320, 140, '#ff8a6b'], [330, 380, '#cfa8ff']].forEach(function (q, j) { var d = j === 0 ? 1 : -1; s += elip(q[0], q[1], 18, 11, { fill: q[2] }) + p('M' + (q[0] - d * 16) + ',' + q[1] + ' L' + (q[0] - d * 30) + ',' + (q[1] - 10) + ' L' + (q[0] - d * 30) + ',' + (q[1] + 10) + 'Z', { fill: q[2] }) + circ(q[0] + d * 9, q[1] - 3, 2.2, { fill: '#2a1c1a' }); });
        break;
    }
    return s;
  }

  /* área de zoom (rosto, mãos, pés…) no corpo de ilustração: a mesma área de antes (pecas.js → ZOOM) levada para o lugar
     novo da cabeça e do corpo, conforme a idade escolhida */
  function areaZoom(a, e0, minimo) {
    var e = V.limpar(e0);
    IDADE = IDADES[e.idade] || IDADES.adulta; DF = deformacao(e.idade, e.personagem === 'menino', e.corpo);
    var ym = a[1] + a[3] / 2, y1 = DF.fy(a[1]), y2 = DF.fy(a[1] + a[3]), x1 = DF.fx(a[0], ym), x2 = DF.fx(a[0] + a[2], ym);
    if (a[1] + a[3] > 600) y1 = Math.max(y1, y2 - a[3]);   // pés: os pés não esticam, a área continua do mesmo tamanho
    // não fica menor que um rosto de criancinha (detalhe demais some na tela)
    // (no olho e na boca, maquiando, chega mais perto: minimo menor)
    var m = minimo || 90, w = Math.max(x2 - x1, m), h = Math.max(y2 - y1, m), cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
    return [n(cx - w / 2), n(cy - h / 2), n(w), n(h)];
  }
  var API = { transformaOmbro: transformaOmbro, transformaCotovelo: transformaCotovelo, corAjustada: corAjustada, MAQUIAGEM: MAQUIAGEM, svg: svg, espelhar: espelhar, passarela: passarela, tetoShow: tetoShow, areaZoom: areaZoom };
  API.POSES = POSES;
  raiz.PurpurinaBoneca = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : this);
