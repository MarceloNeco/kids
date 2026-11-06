/* Labirinto — gerador de labirintos (quadrado, redondo e colmeia).
   Funciona no navegador (window.Gerador) e no Node (require), para os testes.

   Gerador.criar({ forma: 'quadrado' | 'redondo' | 'colmeia', nivel: 'facil' | 'medio' | 'dificil',
                   semente: número, missao: true | false (opcional: sem isso, a semente decide), retrato: true | false })

   Devolve o labirinto:
     celulas  [{ x, y, anel?, setor?, q?, r? }]   centro de cada casa (unidade do mundo: 1 casa ≈ 1)
     arestas  [{ a, b, pts: [[x,y],...], aberta }] parede entre a e b (b = -1: borda de fora). aberta = passagem
     viz      viz[i] = [{ c, e }]                 vizinhos da casa i e o número da aresta entre elas
     inicio, saida, item                          casas (item = -1 quando não há missão)
     bordaInicio, bordaSaida                      aresta da borda por onde se entra / a porta da saída (-1: saída no meio)
     limites  { x0, y0, x1, y1 }                  retângulo que cobre o labirinto
   O labirinto é "perfeito": todas as casas se ligam e há um caminho só entre duas casas quaisquer
   (busca em profundidade com volta, a partir de uma casa sorteada). A mesma semente dá sempre o mesmo labirinto. */
(function (raiz) {
  'use strict';

  function sorteio(semente) {   // mulberry32: rápido e igual em todo navegador
    var a = (semente >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var TAMANHOS = {
    quadrado: { facil: { cols: 6, linhas: 8 }, medio: { cols: 10, linhas: 14 }, dificil: { cols: 15, linhas: 22 } },
    redondo: { facil: { aneis: 4 }, medio: { aneis: 7 }, dificil: { aneis: 11 } },
    colmeia: { facil: { raio: 3 }, medio: { raio: 5 }, dificil: { raio: 8 } }
  };
  var FORMAS = ['quadrado', 'redondo', 'colmeia'];
  var NIVEIS = ['facil', 'medio', 'dificil'];

  function novo() { return { celulas: [], arestas: [], viz: [] }; }
  function aresta(L, a, b, pts) {
    var e = L.arestas.length;
    L.arestas.push({ a: a, b: b, pts: pts, aberta: false });
    L.viz[a].push({ c: b, e: e });
    if (b >= 0) L.viz[b].push({ c: a, e: e });
    return e;
  }
  function arco(r, t0, t1) {   // arco do raio r, de t0 a t1, em pedacinhos de no máximo 0,12 (para a colisão ser fina)
    var n = Math.max(2, Math.ceil(Math.abs(t1 - t0) * r / 0.12)), pts = [];
    for (var k = 0; k <= n; k++) { var t = t0 + (t1 - t0) * k / n; pts.push([r * Math.cos(t), r * Math.sin(t)]); }
    return pts;
  }

  /* ---------- quadrado: grade de cols × linhas ---------- */
  function quadrado(tam, retrato) {
    var L = novo(), cols = tam.cols, lin = tam.linhas;
    if (retrato === false) { cols = tam.linhas; lin = tam.cols; }   // tela deitada: labirinto deitado
    for (var y = 0; y < lin; y++) for (var x = 0; x < cols; x++) { L.celulas.push({ x: x + 0.5, y: y + 0.5, col: x, lin: y }); L.viz.push([]); }
    var id = function (x, y) { return y * cols + x; };
    for (y = 0; y < lin; y++) for (x = 0; x < cols; x++) {
      var i = id(x, y);
      if (y === 0) aresta(L, i, -1, [[x, 0], [x + 1, 0]]);
      if (x === 0) aresta(L, i, -1, [[0, y], [0, y + 1]]);
      aresta(L, i, x + 1 < cols ? id(x + 1, y) : -1, [[x + 1, y], [x + 1, y + 1]]);
      aresta(L, i, y + 1 < lin ? id(x, y + 1) : -1, [[x, y + 1], [x + 1, y + 1]]);
    }
    L.cols = cols; L.linhas = lin;
    L.limites = { x0: 0, y0: 0, x1: cols, y1: lin };
    L.meio = id(Math.floor(cols / 2), Math.floor(lin / 2));
    return L;
  }

  /* ---------- redondo: anéis e fatias; o anel 0 é o círculo do meio ---------- */
  function setoresPorAnel(aneis) {
    var n = [1];
    for (var i = 1; i < aneis; i++) {
      if (i === 1) { n.push(6); continue; }
      var largura = 2 * Math.PI * (i + 0.5) / n[i - 1];   // largura de cada fatia se não dividir
      n.push(n[i - 1] * Math.max(1, Math.round(largura)));
    }
    return n;
  }
  function redondo(tam) {
    var L = novo(), R = tam.aneis, n = setoresPorAnel(R), base = [], i, j, k = 0;
    var GIRO = -Math.PI / 2;   // fatia 0 começa no alto
    for (i = 0; i < R; i++) {
      base.push(k);
      for (j = 0; j < n[i]; j++, k++) {
        var tm = GIRO + (j + 0.5) * 2 * Math.PI / n[i], rm = i === 0 ? 0 : i + 0.5;
        L.celulas.push({ x: rm * Math.cos(tm), y: rm * Math.sin(tm), anel: i, setor: j, raio: rm, ang: tm });
        L.viz.push([]);
      }
    }
    for (i = 1; i < R; i++) for (j = 0; j < n[i]; j++) {
      var c = base[i] + j, t0 = GIRO + j * 2 * Math.PI / n[i], t1 = GIRO + (j + 1) * 2 * Math.PI / n[i];
      var pai = base[i - 1] + Math.floor(j * n[i - 1] / n[i]);
      aresta(L, c, pai, arco(i, t0, t1));                                         // parede de dentro (curva)
      var lado = base[i] + (j + 1) % n[i];
      aresta(L, c, lado, [[i * Math.cos(t1), i * Math.sin(t1)], [(i + 1) * Math.cos(t1), (i + 1) * Math.sin(t1)]]);   // parede reta
      if (i === R - 1) aresta(L, c, -1, arco(R, t0, t1));                          // borda de fora
    }
    L.aneis = R; L.setores = n; L.base = base;
    L.limites = { x0: -R, y0: -R, x1: R, y1: R };
    L.meio = 0;
    return L;
  }

  /* ---------- colmeia: hexágonos (ponta para cima) num hexágono grande de raio N ---------- */
  var DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  function colmeia(tam) {
    var L = novo(), N = tam.raio, s = 1 / Math.sqrt(3), ids = {}, q, r;
    for (r = -N; r <= N; r++) for (q = -N; q <= N; q++) {
      if (Math.abs(q + r) > N) continue;
      ids[q + ',' + r] = L.celulas.length;
      L.celulas.push({ x: Math.sqrt(3) * s * (q + r / 2), y: 1.5 * s * r, q: q, r: r });
      L.viz.push([]);
    }
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    L.celulas.forEach(function (c, i) {
      DIRS.forEach(function (d) {
        var ov = ids[(c.q + d[0]) + ',' + (c.r + d[1])], o = ov === undefined ? -1 : ov;
        if (o >= 0 && o < i) return;   // aresta já feita pela outra casa
        var vx = Math.sqrt(3) * s * (d[0] + d[1] / 2), vy = 1.5 * s * d[1], fi = Math.atan2(vy, vx), a = fi - Math.PI / 6, b = fi + Math.PI / 6;
        var p = [[c.x + s * Math.cos(a), c.y + s * Math.sin(a)], [c.x + s * Math.cos(b), c.y + s * Math.sin(b)]];
        p.forEach(function (pt) { x0 = Math.min(x0, pt[0]); y0 = Math.min(y0, pt[1]); x1 = Math.max(x1, pt[0]); y1 = Math.max(y1, pt[1]); });
        aresta(L, i, o, p);
      });
    });
    L.raio = N; L.lado = s; L.ids = ids;
    L.limites = { x0: x0, y0: y0, x1: x1, y1: y1 };
    L.meio = ids['0,0'];
    return L;
  }

  /* ---------- cavar: busca em profundidade com volta (labirinto perfeito) ---------- */
  function cavar(L, rnd) {
    var visto = new Uint8Array(L.celulas.length), pilha = [Math.floor(rnd() * L.celulas.length)];
    visto[pilha[0]] = 1;
    while (pilha.length) {
      var c = pilha[pilha.length - 1], opcoes = [];
      for (var k = 0; k < L.viz[c].length; k++) { var v = L.viz[c][k]; if (v.c >= 0 && !visto[v.c]) opcoes.push(v); }
      if (!opcoes.length) { pilha.pop(); continue; }
      var esc = opcoes[Math.floor(rnd() * opcoes.length)];
      L.arestas[esc.e].aberta = true; visto[esc.c] = 1; pilha.push(esc.c);
    }
  }

  function bordasDe(L, c) { return L.viz[c].filter(function (v) { return v.c < 0; }).map(function (v) { return v.e; }); }
  function meioDa(L, e) { var p = L.arestas[e].pts; return p[Math.floor((p.length - 1) / 2)].map(function (v, k) { return (v + p[Math.ceil((p.length - 1) / 2)][k]) / 2; }); }
  // a aresta de borda de c mais para o lado "lado" (−1: alto, +1: embaixo)
  function bordaNoLado(L, c, lado) {
    var bs = bordasDe(L, c); bs.sort(function (a, b) { return lado * (meioDa(L, b)[1] - meioDa(L, a)[1]); });
    return bs[0];
  }

  function criar(op) {
    op = op || {};
    var forma = FORMAS.indexOf(op.forma) >= 0 ? op.forma : 'quadrado';
    var nivel = NIVEIS.indexOf(op.nivel) >= 0 ? op.nivel : 'facil';
    var semente = (op.semente >>> 0) || 1, rnd = sorteio(semente);
    var tam = TAMANHOS[forma][nivel];
    var L = forma === 'quadrado' ? quadrado(tam, op.retrato) : forma === 'redondo' ? redondo(tam) : colmeia(tam);
    cavar(L, rnd);
    var missao = typeof op.missao === 'boolean' ? op.missao : rnd() < 0.7;
    var i;

    if (forma === 'quadrado') {
      L.inicio = Math.floor(rnd() * L.cols);                                        // uma casa da primeira linha
      L.saida = (L.linhas - 1) * L.cols + Math.floor(rnd() * L.cols);               // uma casa da última
      L.bordaInicio = bordaNoLado(L, L.inicio, -1); L.bordaSaida = bordaNoLado(L, L.saida, 1);
    } else if (forma === 'redondo') {
      var R = L.aneis, nf = L.setores[R - 1], j = Math.floor(rnd() * nf);
      L.inicio = L.base[R - 1] + j;
      L.bordaInicio = bordasDe(L, L.inicio)[0];
      if (missao) { L.saida = L.base[R - 1] + (j + nf / 2) % nf; L.bordaSaida = bordasDe(L, L.saida)[0]; }
      else { L.saida = 0; L.bordaSaida = -1; }                                       // sem missão: a meta é o meio
    } else {
      var N = L.raio, cima = [], baixo = [];
      for (i = 0; i < L.celulas.length; i++) { if (L.celulas[i].r === -N) cima.push(i); if (L.celulas[i].r === N) baixo.push(i); }
      L.inicio = cima[Math.floor(rnd() * cima.length)]; L.saida = baixo[Math.floor(rnd() * baixo.length)];
      L.bordaInicio = bordaNoLado(L, L.inicio, -1); L.bordaSaida = bordaNoLado(L, L.saida, 1);
    }
    L.item = missao && L.meio !== L.saida && L.meio !== L.inicio ? L.meio : -1;
    L.tipoItem = Math.floor(rnd() * 4);   // 0 osso, 1 chave, 2 estrela, 3 tesouro (o app desenha)
    L.forma = forma; L.nivel = nivel; L.semente = semente;
    return L;
  }

  var G = { criar: criar, sorteio: sorteio, TAMANHOS: TAMANHOS, FORMAS: FORMAS, NIVEIS: NIVEIS, setoresPorAnel: setoresPorAnel };
  if (typeof module !== 'undefined' && module.exports) module.exports = G; else raiz.Gerador = G;
})(typeof self !== 'undefined' ? self : this);
