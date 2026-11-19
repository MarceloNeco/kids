/* TIJOLAÇO — regras do modo TijoLinto, sem tela (roda no navegador e no Node, para os testes).
   O caminho é uma curva Catmull-Rom (centrípeta) passando pelos pontos da fase, guardada numa tabela com um ponto a
   cada 1 unidade (x, y, tangente, "dentro da manilha"). Cada tijolo da fila guarda só a distância s desde o começo
   do caminho; a posição na tela é o ponto da tabela em s.
   A fila é um vetor da frente (índice 0, mais perto da caçamba) para trás (o rolo empurra o último).
   Só o pedaço de trás anda sozinho; os da frente param, e voltam puxados pelo ímã quando as pontas do buraco têm a
   mesma cor. Juntou 3 ou mais da mesma cor: estoura. Juntou de novo pelo ímã: combo x2, x3…
   Campo de jogo: 1000 × 620 unidades (deitado); em pé, os pontos trocam x por y (620 × 1000).
   TijolacoRegras.novo(fase, nivel, { retrato, rng }) · passo(E, dt) → eventos · atirar(E) · trocar(E) · portao(E, i) */
(function (raiz) {
  'use strict';
  var R = 16, D = 32;   // raio e espaço de um tijolo redondo
  var CORES = [
    { id: 'tijolo', cor: '#c8432c' }, { id: 'azulejo', cor: '#2f7fd8' }, { id: 'tinta', cor: '#3aa84a' },
    { id: 'telha', cor: '#f2a516' }, { id: 'madeira', cor: '#8a5a2e' }, { id: 'pedra', cor: '#9aa3ab' }
  ];
  var NIVEIS = {
    facil: { cores: 4, vel: 0.72, meta: 0.8, mira: 9999, intervalo: 0.24 },
    medio: { cores: 5, vel: 1, meta: 1, mira: 220, intervalo: 0.26 },
    dificil: { cores: 6, vel: 1.3, meta: 1.2, mira: 70, intervalo: 0.28 }
  };
  var PODERES = ['marreta', 're', 'devagar', 'prumo'];
  var VEL_TIRO = 1150, VEL_RAJADA = 330, VEL_IMA = 260, ACEL_IMA = 1400, VEL_QUEDA = 650, VEL_OURO = 900, CRESCER = 0.12;

  /* ---------- caminho: Catmull-Rom centrípeta → tabela de 1 em 1 unidade ---------- */
  function crSegmento(p0, p1, p2, p3, saida) {
    function tj(ti, a, b) { var dx = b[0] - a[0], dy = b[1] - a[1]; return ti + Math.max(1e-3, Math.pow(dx * dx + dy * dy, 0.25)); }
    var t0 = 0, t1 = tj(t0, p0, p1), t2 = tj(t1, p1, p2), t3 = tj(t2, p2, p3);
    var corda = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), n = Math.max(2, Math.ceil(corda / 2));
    for (var k = 0; k < n; k++) {
      var t = t1 + (t2 - t1) * k / n, P = [0, 0];
      for (var c = 0; c < 2; c++) {
        var A1 = (t1 - t) / (t1 - t0) * p0[c] + (t - t0) / (t1 - t0) * p1[c];
        var A2 = (t2 - t) / (t2 - t1) * p1[c] + (t - t1) / (t2 - t1) * p2[c];
        var A3 = (t3 - t) / (t3 - t2) * p2[c] + (t - t2) / (t3 - t2) * p3[c];
        var B1 = (t2 - t) / (t2 - t0) * A1 + (t - t0) / (t2 - t0) * A2;
        var B2 = (t3 - t) / (t3 - t1) * A2 + (t - t1) / (t3 - t1) * A3;
        P[c] = (t2 - t) / (t2 - t1) * B1 + (t - t1) / (t2 - t1) * B2;
      }
      saida.push(P);
    }
  }
  // pontos → { x, y, a (Float32Array, um por unidade de caminho), oculto (Uint8Array), L, marcas (s de cada ponto) }
  function tabela(pontos, manilhas) {
    var n = pontos.length, densos = [], marcasIdx = [];
    var ext0 = [2 * pontos[0][0] - pontos[1][0], 2 * pontos[0][1] - pontos[1][1]];
    var extN = [2 * pontos[n - 1][0] - pontos[n - 2][0], 2 * pontos[n - 1][1] - pontos[n - 2][1]];
    for (var i = 0; i < n - 1; i++) {
      marcasIdx.push(densos.length);
      crSegmento(i ? pontos[i - 1] : ext0, pontos[i], pontos[i + 1], i + 2 < n ? pontos[i + 2] : extN, densos);
    }
    marcasIdx.push(densos.length); densos.push(pontos[n - 1].slice());
    // comprimento acumulado dos pontos densos
    var acum = new Float64Array(densos.length);
    for (i = 1; i < densos.length; i++) acum[i] = acum[i - 1] + Math.hypot(densos[i][0] - densos[i - 1][0], densos[i][1] - densos[i - 1][1]);
    var L = Math.floor(acum[densos.length - 1]), m = L + 1;
    var X = new Float32Array(m), Y = new Float32Array(m), A = new Float32Array(m), O = new Uint8Array(m);
    var j = 0;
    for (var s = 0; s < m; s++) {
      while (j < densos.length - 2 && acum[j + 1] < s) j++;
      var seg = acum[j + 1] - acum[j] || 1, f = Math.min(1, Math.max(0, (s - acum[j]) / seg));
      X[s] = densos[j][0] + (densos[j + 1][0] - densos[j][0]) * f;
      Y[s] = densos[j][1] + (densos[j + 1][1] - densos[j][1]) * f;
    }
    for (s = 0; s < m; s++) {
      var a0 = Math.max(0, s - 2), a1 = Math.min(m - 1, s + 2);
      A[s] = Math.atan2(Y[a1] - Y[a0], X[a1] - X[a0]);
    }
    // dentro da manilha: perto do segmento do cano e andando na mesma direção dele (quem cruza por cima não some)
    (manilhas || []).forEach(function (mn) {
      var ax = mn[0][0], ay = mn[0][1], bx = mn[1][0], by = mn[1][1], dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy, ang = Math.atan2(dy, dx);
      for (var k = 0; k < m; k++) {
        var u = ((X[k] - ax) * dx + (Y[k] - ay) * dy) / l2;
        if (u < 0 || u > 1) continue;
        var px = ax + dx * u - X[k], py = ay + dy * u - Y[k];
        if (px * px + py * py < 100 && Math.abs(Math.cos(A[k] - ang)) > 0.8) O[k] = 1;
      }
    });
    return { x: X, y: Y, a: A, oculto: O, L: L, marcas: marcasIdx.map(function (k) { return acum[k]; }) };
  }
  function ponto(tab, s) {
    var i = Math.max(0, Math.min(tab.L, Math.round(s)));
    return { x: tab.x[i], y: tab.y[i], a: tab.a[i] };
  }
  function visivel(tab, s) { return s >= 0 && s <= tab.L && !tab.oculto[Math.round(s)]; }

  /* ---------- fase → trilhos (com portões), virando x↔y em pé ---------- */
  function virar(p, retrato) { return retrato ? [p[1], p[0]] : [p[0], p[1]]; }
  function pecasDe(tr) { return tr.pecas || [{ p: tr.p }]; }
  // pontos do caminho com a escolha de cada portão; marca onde começa e termina cada portão (índice do ponto)
  function montarPontos(T) {
    var pts = [], faixas = [];
    T.pecas.forEach(function (pc) {
      if (pc.p) { pc.p.forEach(function (q) { pts.push(q); }); return; }
      var g = T.portoes[pc.idx], ini = pts.length - 1;
      (g.longo ? pc.longo : pc.curto).forEach(function (q) { pts.push(q); });
      faixas[pc.idx] = [ini, pts.length];   // do ponto da bifurcação até o ponto de junção (o próximo depois do ramo)
    });
    return { pts: pts, faixas: faixas };
  }
  function construir(T, manilhas) {
    var mp = montarPontos(T), tab = tabela(mp.pts, manilhas);
    T.tab = tab;
    mp.faixas.forEach(function (fx, k) {
      if (!fx) return;
      var g = T.portoes[k];
      // trecho que muda com o portão: um ponto antes da bifurcação até um depois da junção (a curva depende dos vizinhos)
      g.de = tab.marcas[Math.max(0, fx[0] - 1)] - D; g.ate = tab.marcas[Math.min(tab.marcas.length - 1, fx[1] + 1)] + D;
    });
  }

  function novo(fase, nivel, op) {
    op = op || {};
    var N = NIVEIS[nivel] || NIVEIS.facil, retrato = !!op.retrato, rng = op.rng || Math.random;
    var W = retrato ? 620 : 1000, H = retrato ? 1000 : 620;
    var vv = function (p) { return virar(p, retrato); };
    var manilhas = (fase.manilhas || []).map(function (m) { return [vv(m[0]), vv(m[1])]; });
    var E = {
      fase: fase, nivel: nivel, N: N, W: W, H: H, retrato: retrato, rng: rng, manilhas: manilhas,
      ncores: Math.min(N.cores, fase.cores || 6), trilhos: [], portoes: [], tiros: [], textos: [],
      pontos: 0, estourados: 0, meta: Math.round(fase.meta * N.meta), obraPronta: false, perdendo: false, fim: null,
      tempo: 0, espera: 0, efeitos: { re: 0, devagar: 0, prumo: 0 }, capacete: null, proxCapacete: fase.capacete || 20,
      maiorCombo: 0, bonusOuro: 0, idBola: 1
    };
    fase.trilhos.forEach(function (tr, ti) {
      var T = { i: ti, pecas: [], portoes: E.portoes, bolas: [], gerados: 0, maxS: 0, ouro: null, perigo: 0 };
      pecasDe(tr).forEach(function (pc) {
        if (pc.p) T.pecas.push({ p: pc.p.map(vv) });
        else {
          var idx = E.portoes.length;
          E.portoes.push({ trilho: ti, longo: false, travado: false, botao: vv(pc.portao.botao), de: 0, ate: 0 });
          T.pecas.push({ idx: idx, curto: pc.portao.curto.map(vv), longo: pc.portao.longo.map(vv) });
        }
      });
      construir(T, manilhas);
      E.trilhos.push(T);
    });
    var L = fase.lancador;
    if (L.trilho) {
      var a = vv(L.trilho[0]), b = vv(L.trilho[1]);
      // mira reta para dentro do campo (do trilho para o meio)
      var nx = -(b[1] - a[1]), ny = b[0] - a[0], cx = W / 2 - (a[0] + b[0]) / 2, cy = H / 2 - (a[1] + b[1]) / 2;
      if (nx * cx + ny * cy < 0) { nx = -nx; ny = -ny; }
      E.lanc = { x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2, trilho: [a, b], u: 0.5, alvoU: 0.5, base: Math.atan2(ny, nx) };
      E.lanc.ang = E.lanc.base;
    } else {
      var p = vv([L.x, L.y]);
      E.lanc = { x: p[0], y: p[1], ang: -Math.PI / 2 };
    }
    E.lanc.cor = corSorteada(E); E.lanc.prox = corSorteada(E); E.lanc.espera = 0;
    return E;
  }

  /* ---------- cores ---------- */
  function coresNaMesa(E) {
    var tem = {};
    E.trilhos.forEach(function (T) { T.bolas.forEach(function (b) { tem[b.c] = 1; }); });
    return Object.keys(tem).map(Number);
  }
  function corSorteada(E) {
    var na = coresNaMesa(E), lista = na.length ? na : [];
    if (!lista.length) for (var c = 0; c < E.ncores; c++) lista.push(c);
    return lista[Math.floor(E.rng() * lista.length) % lista.length];
  }
  function corNova(E, T) {
    var b = T.bolas, n = b.length, c;
    var u1 = n ? b[n - 1].c : -1, u2 = n > 1 ? b[n - 2].c : -2;
    if (n && E.rng() < 0.38 && !(u1 === u2)) return u1;   // pares de vez em quando, nunca 3 iguais seguidos
    do { c = Math.floor(E.rng() * E.ncores); } while (c === u1 && u1 === u2);
    return c;
  }

  /* ---------- fila ---------- */
  function contato(b1, b2) { return D * ((b1.w == null ? 1 : b1.w) + (b2.w == null ? 1 : b2.w)) / 2; }
  function ligados(B, i) { return B[i].s - B[i + 1].s <= contato(B[i], B[i + 1]) + 1; }
  function novaBola(E, c, s, poder) {
    return { id: E.idBola++, c: c, s: s, w: 1, poder: poder || null, tPoder: poder ? 15 : 0, x: 0, y: 0, a: 0, chk: false, cadeia: 0 };
  }
  // grupo da mesma cor, ligado, em volta do índice k → [ini, fim]
  function grupo(B, k) {
    var a = k, z = k;
    while (a > 0 && B[a - 1].c === B[k].c && ligados(B, a - 1)) a--;
    while (z < B.length - 1 && B[z + 1].c === B[k].c && ligados(B, z)) z++;
    return [a, z];
  }
  function inserir(E, T, k, frente, cor, de) {
    var B = T.bolas, h = B[k], nb = novaBola(E, cor, 0);
    nb.w = 0; nb.chk = true; nb.de = de || null; nb.t = 0;
    if (frente) { nb.s = h.s + D / 2; B.splice(k, 0, nb); }
    else { nb.s = h.s - D / 2; B.splice(k + 1, 0, nb); }
    return nb;
  }

  // estoura o grupo em volta de k (se tiver 3 ou mais); devolve quantos estouraram
  function estourar(E, T, k, nivelCombo, ev) {
    var B = T.bolas, g = grupo(B, k), n = g[1] - g[0] + 1;
    if (n < 3) return 0;
    var foram = B.splice(g[0], n), cx = 0, cy = 0;
    foram.forEach(function (b) { cx += b.x; cy += b.y; });
    cx /= n; cy /= n;
    var pts = n * 10 * nivelCombo + (nivelCombo > 1 ? 50 * nivelCombo : 0);
    ganhar(E, pts, n);
    E.maiorCombo = Math.max(E.maiorCombo, nivelCombo);
    ev.push({ tipo: 'estouro', x: cx, y: cy, n: n, combo: nivelCombo, cor: foram[0].c, pontos: pts, bolas: foram.map(function (b) { return { x: b.x, y: b.y, c: b.c }; }) });
    // a ponta da frente do buraco lembra o combo: se o ímã juntar e estourar de novo, é o próximo
    if (g[0] > 0 && g[0] < B.length) B[g[0] - 1].cadeia = nivelCombo;
    foram.forEach(function (b) { if (b.poder) usarPoder(E, b, ev); });
    return n;
  }
  function ganhar(E, pts, n) {
    E.pontos += pts; E.estourados += n || 0;
    if (!E.obraPronta && E.estourados >= E.meta) { E.obraPronta = true; E._obraPronta = true; }
  }
  function usarPoder(E, b, ev) {
    ev.push({ tipo: 'poder', poder: b.poder, x: b.x, y: b.y });
    if (b.poder === 're') E.efeitos.re = 3.2;
    else if (b.poder === 'devagar') E.efeitos.devagar = 8;
    else if (b.poder === 'prumo') E.efeitos.prumo = 10;
    else if (b.poder === 'marreta') {
      // marreta: tudo em volta (raio de 90) quebra, em qualquer trilho
      E.trilhos.forEach(function (T) {
        var fora = [];
        for (var i = T.bolas.length - 1; i >= 0; i--) {
          var o = T.bolas[i];
          if (visivel(T.tab, o.s) && Math.hypot(o.x - b.x, o.y - b.y) < 90) fora.push(T.bolas.splice(i, 1)[0]);
        }
        if (fora.length) {
          ganhar(E, fora.length * 10, fora.length);
          ev.push({ tipo: 'estouro', x: b.x, y: b.y, n: fora.length, combo: 1, cor: fora[0].c, pontos: fora.length * 10, marreta: true,
            bolas: fora.map(function (o) { return { x: o.x, y: o.y, c: o.c }; }) });
        }
      });
    }
  }

  /* ---------- tiro ---------- */
  function atirar(E, ang) {
    if (E.fim || E.perdendo || E.lanc.espera > 0) return false;
    if (ang != null) E.lanc.ang = ang;
    var a = E.lanc.ang, v = VEL_TIRO * (E.efeitos.prumo > 0 ? 1.35 : 1);
    E.tiros.push({ x: E.lanc.x + Math.cos(a) * 30, y: E.lanc.y + Math.sin(a) * 30, vx: Math.cos(a) * v, vy: Math.sin(a) * v, cor: E.lanc.cor, brechas: 0, passou: [] });
    E.lanc.cor = E.lanc.prox; E.lanc.prox = corSorteada(E);
    E.lanc.espera = E.efeitos.prumo > 0 ? 0.1 : E.N.intervalo;
    return true;
  }
  function trocar(E) { var c = E.lanc.cor; E.lanc.cor = E.lanc.prox; E.lanc.prox = c; return true; }

  // primeiro tijolo que o tiro acertaria, andando reto do lançador (para a linha de mira)
  function alcance(E, ang, max) {
    var x = E.lanc.x, y = E.lanc.y, dx = Math.cos(ang), dy = Math.sin(ang), melhor = max, r2 = (R * 1.7) * (R * 1.7);
    E.trilhos.forEach(function (T) {
      T.bolas.forEach(function (b) {
        if (!visivel(T.tab, b.s)) return;
        var px = b.x - x, py = b.y - y, u = px * dx + py * dy;
        if (u < 0 || u > melhor) return;
        var qx = px - dx * u, qy = py - dy * u, d2 = qx * qx + qy * qy;
        if (d2 < r2) melhor = Math.min(melhor, u - Math.sqrt(r2 - d2));
      });
    });
    return Math.max(0, melhor);
  }

  /* ---------- portões ---------- */
  function travado(E, g) {
    var T = E.trilhos[g.trilho];
    return T.bolas.some(function (b) { return b.s >= g.de && b.s <= g.ate; });
  }
  function portao(E, i) {
    var g = E.portoes[i];
    if (!g || E.fim || travado(E, g)) return false;
    var T = E.trilhos[g.trilho], L0 = T.tab.L, fim0 = g.ate;
    g.longo = !g.longo;
    construir(T, E.manilhas);
    var d = T.tab.L - L0;
    // quem já passou do portão continua no mesmo lugar da tela: a distância até a caçamba não muda
    T.bolas.forEach(function (b) { if (b.s > fim0) b.s += d; });
    if (T.maxS > fim0) T.maxS += d;
    return true;
  }

  /* ---------- passo do jogo ---------- */
  function velocidade(E, T) {
    if (E.perdendo) return VEL_QUEDA;
    if (E.efeitos.re > 0) return -150;
    var base = E.fase.vel * E.N.vel, B = T.bolas, L = T.tab.L;
    // rajada do começo: entra correndo até 30 % do caminho (e nunca até um portão, para dar tempo de escolher)
    var ate = L * 0.3;
    E.portoes.forEach(function (g) { if (g.trilho === T.i) ate = Math.min(ate, g.de - D * 3); });
    if (T.gerados < (T.rajada != null ? T.rajada : E.fase.rajada) && (!B.length || B[0].s < ate)) return Math.max(VEL_RAJADA, base * 6);
    var v = base * (E.efeitos.devagar > 0 ? 0.35 : 1);
    if (B.length) { var f = B[0].s / L; if (f > 0.85) v *= 1 - 0.4 * Math.min(1, (f - 0.85) / 0.15); }
    return v;
  }

  function passoTrilho(E, T, dt, ev) {
    var B = T.bolas, tab = T.tab, i, k;
    // 1) quem acabou de encaixar cresce (~120 ms) e empurra a frente
    var conferir = [];
    for (i = 0; i < B.length; i++) {
      var b = B[i];
      if (b.w < 1) { b.w = Math.min(1, b.w + dt / CRESCER); b.t = b.w; if (b.w >= 1) { b.de = null; conferir.push(b); } }
      if (b.poder) { b.tPoder -= dt; if (b.tPoder <= 0) b.poder = null; }
    }
    // gaps antes de mexer (para saber quem se juntou)
    var aberto = [];
    for (i = 0; i < B.length - 1; i++) aberto[i] = !ligados(B, i);
    // 2) o pedaço de trás anda (ou dá ré)
    var v = velocidade(E, T);
    if (B.length) {
      if (v >= 0) B[B.length - 1].s += v * dt;
      else { for (i = B.length - 1; i >= 0; i--) { B[i].s += v * dt; if (i > 0 && aberto[i - 1]) break; } }
    }
    // 3) ímã: buraco com a mesma cor nas pontas puxa o pedaço da frente para trás
    for (i = 0; i < B.length - 1; i++) {
      if (!aberto[i] || B[i].c !== B[i + 1].c || B[i].w < 1 || B[i + 1].w < 1) { B[i].ima = 0; continue; }
      B[i].ima = Math.min(1100, (B[i].ima || VEL_IMA) + ACEL_IMA * dt);
      var puxa = Math.max(0, Math.min(B[i].ima * dt, B[i].s - B[i + 1].s - contato(B[i], B[i + 1])));
      for (k = i; k >= 0; k--) { B[k].s -= puxa; if (k > 0 && aberto[k - 1]) break; }
    }
    // 4) empurra (de trás para a frente) e vê quem se juntou
    var juntou = [];
    for (i = B.length - 2; i >= 0; i--) {
      var precisa = B[i + 1].s + contato(B[i], B[i + 1]);
      if (B[i].s < precisa) B[i].s = precisa;
      if (aberto[i] && ligados(B, i)) juntou.push(B[i]);
    }
    // 5) junções: estourou pelo ímã = combo
    juntou.forEach(function (fr) {
      var j = B.indexOf(fr);
      if (j < 0 || j >= B.length - 1) return;
      var nv = fr.cadeia ? fr.cadeia + 1 : 1;
      fr.cadeia = 0;
      if (B[j].c === B[j + 1].c && estourar(E, T, j, nv, ev)) { if (nv > 1) ev.push({ tipo: 'combo', n: nv }); }
      else ev.push({ tipo: 'junta', x: fr.x, y: fr.y });
    });
    // 6) tijolos que acabaram de encaixar
    conferir.forEach(function (b) { var j = B.indexOf(b); if (j >= 0) estourar(E, T, j, 1, ev); });
    // 7) chegam tijolos novos pela boca da manilha
    if (!E.obraPronta && !E.perdendo && v > 0) {
      var guarda = 0;
      while ((!B.length || B[B.length - 1].s >= 0) && guarda++ < 40) {
        if (!B.length && T.gerados > 0) T.rajada = T.gerados + 10;   // limpou a fila: vem uma rajada curta
        var s0 = B.length ? B[B.length - 1].s - D : 0, pd = null;
        if (T.gerados > 6 && E.rng() < (E.fase.poder || 0)) pd = (E.fase.poderes || PODERES)[Math.floor(E.rng() * (E.fase.poderes || PODERES).length)];
        B.push(novaBola(E, corNova(E, T), s0, pd));
        T.gerados++;
      }
    }
    // 8) posição na tela
    for (i = 0; i < B.length; i++) { var p = ponto(tab, B[i].s); B[i].x = p.x; B[i].y = p.y; B[i].a = p.a; }
    // 9) perigo, caçamba e derrota
    var cab = B.length ? B[0].s : 0;
    T.maxS = Math.max(T.maxS, Math.min(cab, tab.L));
    T.perigo = B.length ? Math.max(0, Math.min(1, (cab / tab.L - 0.85) / 0.15)) : 0;
    if (!E.perdendo && B.length && cab >= tab.L) { E.perdendo = true; ev.push({ tipo: 'perdendo', trilho: T.i }); }
    if (E.perdendo) while (B.length && B[0].s >= tab.L) { var q = B.shift(); ev.push({ tipo: 'cai', x: tab.x[tab.L], y: tab.y[tab.L], c: q.c }); }
  }

  function passoTiros(E, dt, ev) {
    for (var t = E.tiros.length - 1; t >= 0; t--) {
      var tr = E.tiros[t], acabou = false, passos = Math.max(1, Math.ceil(Math.hypot(tr.vx, tr.vy) * dt / 7));
      for (var p = 0; p < passos && !acabou; p++) {
        tr.x += tr.vx * dt / passos; tr.y += tr.vy * dt / passos;
        // capacete dourado
        var cp = E.capacete;
        if (cp && Math.hypot(cp.x - tr.x, cp.y - tr.y) < 34) {
          var v = [500, 750, 1000][Math.floor(E.rng() * 3)];
          ganhar(E, v, 0); E.estourados = Math.min(E.meta, E.estourados + Math.ceil(E.meta * 0.06));
          if (!E.obraPronta && E.estourados >= E.meta) { E.obraPronta = true; E._obraPronta = true; }
          ev.push({ tipo: 'capacete', x: cp.x, y: cp.y, pontos: v }); E.capacete = null;
        }
        // acertou um tijolo?
        for (var ti = 0; ti < E.trilhos.length && !acabou; ti++) {
          var T = E.trilhos[ti], B = T.bolas;
          for (var i = 0; i < B.length; i++) {
            var b = B[i];
            if (!visivel(T.tab, b.s)) continue;
            var dx = tr.x - b.x, dy = tr.y - b.y;
            if (dx * dx + dy * dy < (D * 0.92) * (D * 0.92)) {
              var frente = dx * Math.cos(b.a) + dy * Math.sin(b.a) > 0;
              inserir(E, T, i, frente, tr.cor, { x: tr.x, y: tr.y });
              ev.push({ tipo: 'encaixe', x: b.x, y: b.y, c: tr.cor });
              acabou = true; break;
            }
          }
          // tiro na brecha: passou por um buraco entre dois pedaços da fila
          if (!acabou) for (i = 0; i < B.length - 1; i++) {
            var f = B[i], r = B[i + 1], gap = f.s - r.s;
            if (gap < D * 1.6 || gap > D * 7 || tr.passou.indexOf(f.id) >= 0 || !visivel(T.tab, f.s) || !visivel(T.tab, r.s)) continue;
            for (var s = r.s + R; s <= f.s - R; s += 6) {
              var pp = ponto(T.tab, s);
              if ((pp.x - tr.x) * (pp.x - tr.x) + (pp.y - tr.y) * (pp.y - tr.y) < 196) { tr.passou.push(f.id); tr.brechas++; break; }
            }
          }
        }
        if (tr.x < -60 || tr.y < -60 || tr.x > E.W + 60 || tr.y > E.H + 60) acabou = true;
      }
      if (acabou) {
        if (tr.brechas) { var bp = 100 * tr.brechas; ganhar(E, bp, 0); ev.push({ tipo: 'brecha', n: tr.brechas, pontos: bp, x: tr.x, y: tr.y }); }
        E.tiros.splice(t, 1);
      }
    }
  }

  // um lugar livre (longe do caminho e do lançador) para o capacete dourado
  function lugarLivre(E) {
    for (var k = 0; k < 40; k++) {
      var x = 70 + E.rng() * (E.W - 140), y = 70 + E.rng() * (E.H - 140), ok = Math.hypot(x - E.lanc.x, y - E.lanc.y) > 90;
      for (var t = 0; ok && t < E.trilhos.length; t++) {
        var tab = E.trilhos[t].tab;
        for (var s = 0; s <= tab.L; s += 12) if (Math.abs(tab.x[s] - x) < 48 && Math.abs(tab.y[s] - y) < 48) { ok = false; break; }
      }
      if (ok) return { x: x, y: y };
    }
    return null;
  }

  function passo(E, dt) {
    var ev = [];
    if (E.fim) return ev;
    E.tempo += dt;
    var ef = E.efeitos;
    ['re', 'devagar', 'prumo'].forEach(function (k) { if (ef[k] > 0) ef[k] = Math.max(0, ef[k] - dt); });
    var L = E.lanc;
    if (L.espera > 0) L.espera = Math.max(0, L.espera - dt);
    if (L.trilho) {   // lançador no andaime: desliza até onde o dedo pede
      var du = L.alvoU - L.u, passoU = dt * 1.3;
      L.u += Math.abs(du) < passoU ? du : passoU * Math.sign(du);
      L.x = L.trilho[0][0] + (L.trilho[1][0] - L.trilho[0][0]) * L.u; L.y = L.trilho[0][1] + (L.trilho[1][1] - L.trilho[0][1]) * L.u;
    }
    // o ouro (vitória) percorre o resto do caminho e conta pontos
    if (E.ganhando) {
      var todos = true;
      E.trilhos.forEach(function (T) {
        if (!T.ouro) return;
        var antes = T.ouro.s;
        T.ouro.s = Math.min(T.tab.L, T.ouro.s + VEL_OURO * dt);
        var pts = Math.round((T.ouro.s - antes) * 0.5);
        E.pontos += pts; E.bonusOuro += pts;
        var p = ponto(T.tab, T.ouro.s); T.ouro.x = p.x; T.ouro.y = p.y; T.ouro.a = p.a;
        if (T.ouro.s < T.tab.L) todos = false;
      });
      if (todos) { E.espera += dt; if (E.espera > 0.6) { E.fim = 'vitoria'; ev.push({ tipo: 'vitoria' }); } }
      passoTiros(E, dt, ev);
      return ev;
    }
    E.trilhos.forEach(function (T) { passoTrilho(E, T, dt, ev); });
    passoTiros(E, dt, ev);
    E.portoes.forEach(function (g) { g.travado = travado(E, g); });
    if (E._obraPronta) { E._obraPronta = false; ev.push({ tipo: 'obraPronta' }); }
    // capacete dourado
    if (E.capacete) { E.capacete.vida -= dt; if (E.capacete.vida <= 0) E.capacete = null; }
    else if (!E.perdendo && (E.proxCapacete -= dt) <= 0) {
      E.proxCapacete = (E.fase.capacete || 20) * (0.8 + E.rng() * 0.4);
      var lg = lugarLivre(E);
      if (lg) { E.capacete = { x: lg.x, y: lg.y, vida: 8 }; ev.push({ tipo: 'capaceteSurge' }); }
    }
    var vazio = E.trilhos.every(function (T) { return !T.bolas.length; });
    if (E.perdendo && vazio) { E.espera += dt; if (E.espera > 0.5) { E.fim = 'derrota'; ev.push({ tipo: 'derrota' }); } }
    else if (E.obraPronta && vazio && !E.perdendo) {
      E.ganhando = true; E.espera = 0; E.capacete = null;
      E.trilhos.forEach(function (T) { var p = ponto(T.tab, T.maxS); T.ouro = { s: T.maxS, x: p.x, y: p.y, a: p.a }; });
      ev.push({ tipo: 'ouro' });
    }
    return ev;
  }

  // estrelas: 1 por vencer, mais uma por cada marca de pontos da fase
  function estrelas(E) {
    if (E.fim !== 'vitoria') return 0;
    var m = E.meta;
    return 1 + (E.pontos >= m * 22 ? 1 : 0) + (E.pontos >= m * 34 ? 1 : 0);
  }

  var API = { R: R, D: D, CORES: CORES, NIVEIS: NIVEIS, PODERES: PODERES, tabela: tabela, ponto: ponto, visivel: visivel,
    novo: novo, passo: passo, atirar: atirar, trocar: trocar, portao: portao, alcance: alcance, inserir: inserir, estourar: estourar,
    grupo: grupo, ligados: ligados, novaBola: novaBola, estrelas: estrelas, montarPontos: montarPontos, tabelaDe: function (T, longo, manilhas) {
      // tabela de um trilho com todos os portões curtos ou todos longos (para o cenário desenhar os dois ramos)
      var c = { pecas: T.pecas, portoes: T.portoes.map(function (g) { return { longo: longo }; }) };
      return tabela(montarPontos(c).pts, manilhas);
    } };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else raiz.TijolacoRegras = API;
})(this);
