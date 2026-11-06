/* Labirinto — regras: em que casa um ponto está, caminho entre casas, colisão do risco com as paredes e a missão.
   Funciona no navegador (window.Regras) e no Node (require), para os testes. Não desenha nada.

   Regras.celulaEm(L, x, y)        casa do ponto (mundo) ou -1 fora do labirinto
   Regras.ligadas(L, a, b)          true se há passagem aberta entre a e b
   Regras.caminho(L, de, para)      lista de casas de "de" até "para", só por passagens abertas (labirinto perfeito: o único)
   Regras.vizinhoNaDirecao(L, c, dx, dy)   casa vizinha ABERTA mais na direção (dx, dy) da tela, ou -1 (setas do teclado)
   Regras.colisor(L, raio)          paredes num mapa de quadradinhos; .avancar(p, q) leva a ponta do risco de p para q
                                    em passinhos e PARA antes de encostar numa parede: { pt, bateu }
   Regras.partida(L)                a missão: .chegou(casa) → 'item' | 'trancada' | 'venceu' | null
   Regras.estrelas(segundos, casasDoCaminho)   1, 2 ou 3 estrelas */
(function (raiz) {
  'use strict';
  var DOIS_PI = Math.PI * 2;

  function celulaEm(L, x, y) {
    if (L.forma === 'quadrado') {
      if (x < 0 || y < 0 || x >= L.cols || y >= L.linhas) return -1;
      return Math.floor(y) * L.cols + Math.floor(x);
    }
    if (L.forma === 'redondo') {
      var r = Math.sqrt(x * x + y * y), anel = Math.floor(r);
      if (anel >= L.aneis) return -1;
      if (anel === 0) return 0;
      var t = Math.atan2(y, x) + Math.PI / 2; t = ((t % DOIS_PI) + DOIS_PI) % DOIS_PI;
      var n = L.setores[anel];
      return L.base[anel] + Math.min(n - 1, Math.floor(t / DOIS_PI * n));
    }
    // colmeia: ponto → coordenada axial com arredondamento cúbico
    var s = L.lado, qf = (Math.sqrt(3) / 3 * x - y / 3) / s, rf = (2 / 3 * y) / s, sf = -qf - rf;
    var q = Math.round(qf), rr = Math.round(rf), ss = Math.round(sf);
    var dq = Math.abs(q - qf), dr = Math.abs(rr - rf), ds = Math.abs(ss - sf);
    if (dq > dr && dq > ds) q = -rr - ss; else if (dr > ds) rr = -q - ss;
    var id = L.ids[q + ',' + rr];
    return id === undefined ? -1 : id;
  }

  function arestaEntre(L, a, b) {
    var v = L.viz[a];
    for (var k = 0; k < v.length; k++) if (v[k].c === b) return v[k].e;
    return -1;
  }
  function ligadas(L, a, b) { var e = arestaEntre(L, a, b); return e >= 0 && L.arestas[e].aberta; }

  function caminho(L, de, para) {
    if (de < 0 || para < 0) return [];
    if (de === para) return [de];
    var veio = new Int32Array(L.celulas.length).fill(-2), fila = [de]; veio[de] = -1;
    for (var h = 0; h < fila.length; h++) {
      var c = fila[h];
      if (c === para) break;
      for (var k = 0; k < L.viz[c].length; k++) {
        var v = L.viz[c][k];
        if (v.c >= 0 && veio[v.c] === -2 && L.arestas[v.e].aberta) { veio[v.c] = c; fila.push(v.c); }
      }
    }
    if (veio[para] === -2) return [];
    var cam = [para];
    while (cam[0] !== de) cam.unshift(veio[cam[0]]);
    return cam;
  }

  function vizinhoNaDirecao(L, c, dx, dy) {
    var me = L.celulas[c], melhor = -1, mv = 0.35;   // até ~70° fora da direção ainda vale
    L.viz[c].forEach(function (v) {
      if (v.c < 0 || !L.arestas[v.e].aberta) return;
      var o = L.celulas[v.c], vx = o.x - me.x, vy = o.y - me.y, d = Math.sqrt(vx * vx + vy * vy) || 1;
      var cos = (vx * dx + vy * dy) / d;
      if (cos > mv) { mv = cos; melhor = v.c; }
    });
    return melhor;
  }

  /* ---------- colisão ---------- */
  function distSeg(px, py, ax, ay, bx, by) {
    var vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy, t = l2 ? ((px - ax) * vx + (py - ay) * vy) / l2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    var x = ax + t * vx - px, y = ay + t * vy - py;
    return Math.sqrt(x * x + y * y);
  }
  function lado(ax, ay, bx, by, cx, cy) { return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax); }
  function cruzam(a, b, c, d) {   // os segmentos ab e cd se tocam?
    var d1 = lado(c[0], c[1], d[0], d[1], a[0], a[1]), d2 = lado(c[0], c[1], d[0], d[1], b[0], b[1]);
    var d3 = lado(a[0], a[1], b[0], b[1], c[0], c[1]), d4 = lado(a[0], a[1], b[0], b[1], d[0], d[1]);
    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
    var E = 1e-12;
    function sobre(p, q, r) { return Math.min(p[0], q[0]) - E <= r[0] && r[0] <= Math.max(p[0], q[0]) + E && Math.min(p[1], q[1]) - E <= r[1] && r[1] <= Math.max(p[1], q[1]) + E; }
    if (Math.abs(d1) < E && sobre(c, d, a)) return true;
    if (Math.abs(d2) < E && sobre(c, d, b)) return true;
    if (Math.abs(d3) < E && sobre(a, b, c)) return true;
    if (Math.abs(d4) < E && sobre(a, b, d)) return true;
    return false;
  }

  // Paredes fechadas = arestas não abertas (a borda inteira, com a entrada e a porta da saída, fica sempre fechada:
  // o risco não sai do labirinto; chegar na casa da saída com a porta aberta já é vitória).
  function colisor(L, raio) {
    var B = 1, mapa = {}, segs = [];
    L.arestas.forEach(function (e) {
      if (e.aberta) return;
      for (var k = 0; k + 1 < e.pts.length; k++) segs.push([e.pts[k], e.pts[k + 1]]);
    });
    segs.forEach(function (s, i) {
      var x0 = Math.floor((Math.min(s[0][0], s[1][0]) - raio) / B), x1 = Math.floor((Math.max(s[0][0], s[1][0]) + raio) / B);
      var y0 = Math.floor((Math.min(s[0][1], s[1][1]) - raio) / B), y1 = Math.floor((Math.max(s[0][1], s[1][1]) + raio) / B);
      for (var x = x0; x <= x1; x++) for (var y = y0; y <= y1; y++) (mapa[x + ',' + y] = mapa[x + ',' + y] || []).push(i);
    });
    function perto(x, y) { return mapa[Math.floor(x / B) + ',' + Math.floor(y / B)] || []; }
    function livre(p, q) {   // q longe de toda parede (≥ raio) e o passinho p→q não cruza nenhuma
      var a = perto(q[0], q[1]), b = perto(p[0], p[1]), k, s;
      for (k = 0; k < a.length; k++) { s = segs[a[k]]; if (distSeg(q[0], q[1], s[0][0], s[0][1], s[1][0], s[1][1]) < raio) return false; }
      for (k = 0; k < a.length; k++) { s = segs[a[k]]; if (cruzam(p, q, s[0], s[1])) return false; }
      for (k = 0; k < b.length; k++) { s = segs[b[k]]; if (cruzam(p, q, s[0], s[1])) return false; }
      return true;
    }
    function avancar(p, q) {
      var dx = q[0] - p[0], dy = q[1] - p[1], d = Math.sqrt(dx * dx + dy * dy), passo = raio / 2;
      var n = Math.max(1, Math.ceil(d / passo)), atual = [p[0], p[1]];
      for (var k = 1; k <= n; k++) {
        var prox = [p[0] + dx * k / n, p[1] + dy * k / n];
        if (!livre(atual, prox)) return { pt: atual, bateu: true };
        atual = prox;
      }
      return { pt: atual, bateu: false };
    }
    // o risco inteiro atravessa alguma parede? (para os testes e para conferir)
    function cruzaParede(p, q) {
      for (var k = 0; k < segs.length; k++) if (cruzam(p, q, segs[k][0], segs[k][1])) return true;
      return false;
    }
    function distParede(x, y) {
      var m = Infinity;
      for (var k = 0; k < segs.length; k++) m = Math.min(m, distSeg(x, y, segs[k][0][0], segs[k][0][1], segs[k][1][0], segs[k][1][1]));
      return m;
    }
    return { avancar: avancar, livre: livre, cruzaParede: cruzaParede, distParede: distParede, raio: raio, segmentos: segs };
  }

  /* ---------- missão: primeiro o item do meio, depois a saída ---------- */
  function partida(L) {
    var P = { pegouItem: L.item < 0, venceu: false };
    P.saidaAberta = function () { return P.pegouItem; };
    P.chegou = function (c) {
      if (P.venceu) return null;
      if (!P.pegouItem && c === L.item) { P.pegouItem = true; return 'item'; }
      if (c === L.saida) { if (P.pegouItem) { P.venceu = true; return 'venceu'; } return 'trancada'; }
      return null;
    };
    return P;
  }
  function casasDoCaminho(L) {
    return L.item >= 0 ? caminho(L, L.inicio, L.item).length + caminho(L, L.item, L.saida).length - 2 : caminho(L, L.inicio, L.saida).length - 1;
  }
  function estrelas(seg, casas) {
    var bom = 8 + casas * 0.9;
    return seg <= bom ? 3 : seg <= bom * 2 ? 2 : 1;
  }

  var R = { celulaEm: celulaEm, ligadas: ligadas, arestaEntre: arestaEntre, caminho: caminho, vizinhoNaDirecao: vizinhoNaDirecao,
    colisor: colisor, partida: partida, estrelas: estrelas, casasDoCaminho: casasDoCaminho, cruzam: cruzam, distSeg: distSeg };
  if (typeof module !== 'undefined' && module.exports) module.exports = R; else raiz.Regras = R;
})(typeof self !== 'undefined' ? self : this);
