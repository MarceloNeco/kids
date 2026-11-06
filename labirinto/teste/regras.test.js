// Testes das regras (colisão do risco, caminho do cachorrinho, missão): node --test labirinto/teste/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../gerador.js');
const R = require('../regras.js');

// uma parede fechada entre duas casas vizinhas (nenhuma de borda)
function paredeEntreVizinhas(L) {
  for (const e of L.arestas) if (!e.aberta && e.b >= 0) return e;
  throw new Error('sem parede interna');
}

for (const forma of G.FORMAS) {
  const RAIO = R.RAIO[forma];
  test(`${forma}: risco rápido por cima de uma parede para antes dela`, () => {
    for (let s = 1; s <= 15; s++) {
      const L = G.criar({ forma, nivel: 'medio', semente: s }), C = R.colisor(L, RAIO);
      const e = paredeEntreVizinhas(L), a = L.celulas[e.a], b = L.celulas[e.b];
      // de um centro ao outro num movimento só (dedo rápido): atravessaria a parede
      assert.ok(C.cruzaParede([a.x, a.y], [b.x, b.y]) || !R.ligadas(L, e.a, e.b));
      const r = C.avancar([a.x, a.y], [b.x, b.y]);
      assert.equal(r.bateu, true, 'devia bater');
      assert.equal(R.celulaEm(L, r.pt[0], r.pt[1]), e.a, 'a ponta ficou do lado de cá');
      assert.ok(!C.cruzaParede([a.x, a.y], r.pt), 'o risco não atravessa');
      assert.ok(C.distParede(r.pt[0], r.pt[1]) >= RAIO - 1e-9, 'a ponta não encosta na parede');
      // muito rápido: de um lado a outro do labirinto inteiro
      const l = L.limites, longe = C.avancar([a.x, a.y], [l.x1 + 5, l.y1 + 5]);
      assert.ok(!C.cruzaParede([a.x, a.y], longe.pt), 'risco longo atravessou');
    }
  });

  test(`${forma}: risco pelo caminho certo passa (passagem aberta) e muitos riscos aleatórios nunca furam parede`, () => {
    const L = G.criar({ forma, nivel: 'dificil', semente: 77 }), C = R.colisor(L, RAIO);
    const cam = R.caminho(L, L.inicio, L.saida);
    let p = [L.celulas[cam[0]].x, L.celulas[cam[0]].y];
    for (let k = 1; k < cam.length; k++) {
      const c = L.celulas[cam[k]], r = C.avancar(p, [c.x, c.y]);
      // de centro a centro de casas ligadas: no redondo a reta pode raspar o canto; então seguir em dois passos pelo meio
      if (r.bateu) {
        const m = R.arestaEntre(L, cam[k - 1], cam[k]), pts = L.arestas[m].pts, meio = pts[Math.floor(pts.length / 2)];
        const mid = [(meio[0] + (pts[0][0] + pts[pts.length - 1][0]) / 2) / 2, (meio[1] + (pts[0][1] + pts[pts.length - 1][1]) / 2) / 2];
        const r1 = C.avancar(p, mid), r2 = C.avancar(r1.pt, [c.x, c.y]);
        assert.ok(!r1.bateu && !r2.bateu, `passagem aberta ${cam[k - 1]}→${cam[k]} bloqueada`);
        p = r2.pt;
      } else p = r.pt;
    }
    assert.equal(R.celulaEm(L, p[0], p[1]), L.saida, 'chegou na saída desenhando');
    const rnd = G.sorteio(9);
    let tip = [L.celulas[L.inicio].x, L.celulas[L.inicio].y];
    for (let k = 0; k < 4000; k++) {
      const alvo = [L.limites.x0 + rnd() * (L.limites.x1 - L.limites.x0), L.limites.y0 + rnd() * (L.limites.y1 - L.limites.y0)];
      const perto = [tip[0] + (alvo[0] - tip[0]) * rnd() * 0.3, tip[1] + (alvo[1] - tip[1]) * rnd() * 0.3];
      const r = C.avancar(tip, perto);
      assert.ok(!C.cruzaParede(tip, r.pt), 'furou parede');
      assert.ok(R.celulaEm(L, r.pt[0], r.pt[1]) >= 0, 'saiu do labirinto');
      tip = r.pt;
    }
  });

  test(`${forma}: caminho do cachorrinho só passa por passagens abertas`, () => {
    for (let s = 1; s <= 10; s++) {
      const L = G.criar({ forma, nivel: 'dificil', semente: s });
      const rnd = G.sorteio(s);
      for (let k = 0; k < 30; k++) {
        const a = Math.floor(rnd() * L.celulas.length), b = Math.floor(rnd() * L.celulas.length);
        const cam = R.caminho(L, a, b);
        assert.equal(cam[0], a); assert.equal(cam[cam.length - 1], b);
        for (let i = 1; i < cam.length; i++) assert.ok(R.ligadas(L, cam[i - 1], cam[i]), 'atravessou parede');
        assert.equal(new Set(cam).size, cam.length, 'caminho com volta');
      }
    }
  });

  test(`${forma}: setas só andam por passagem aberta`, () => {
    const L = G.criar({ forma, nivel: 'medio', semente: 11 });
    for (let c = 0; c < L.celulas.length; c++) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const v = R.vizinhoNaDirecao(L, c, dx, dy);
      if (v >= 0) assert.ok(R.ligadas(L, c, v));
    }
  });
}

test('missão: a saída fica trancada até pegar o item', () => {
  for (const forma of G.FORMAS) {
    const L = G.criar({ forma, nivel: 'facil', semente: 8, missao: true });
    assert.ok(L.item >= 0);
    const P = R.partida(L);
    assert.equal(P.saidaAberta(), false);
    assert.equal(P.chegou(L.saida), 'trancada');
    assert.equal(P.venceu, false);
    assert.equal(P.chegou(L.item), 'item');
    assert.equal(P.saidaAberta(), true);
    assert.equal(P.chegou(L.item), null, 'item só uma vez');
    assert.equal(P.chegou(L.saida), 'venceu');
    assert.equal(P.chegou(L.saida), null);
  }
  const S = G.criar({ forma: 'quadrado', nivel: 'facil', semente: 8, missao: false }), P2 = R.partida(S);
  assert.equal(P2.saidaAberta(), true);
  assert.equal(P2.chegou(S.saida), 'venceu');
});

test('caminho da missão passa pelo item; estrelas pelo tempo', () => {
  const L = G.criar({ forma: 'quadrado', nivel: 'medio', semente: 4, missao: true });
  const n = R.casasDoCaminho(L);
  assert.ok(n >= R.caminho(L, L.inicio, L.saida).length - 1);
  assert.equal(R.estrelas(5, n), 3);
  assert.equal(R.estrelas(8 + n * 0.9 + 1, n), 2);
  assert.equal(R.estrelas(1e6, n), 1);
});

/* ---------- linha reta (v0.2.0): o cachorrinho só vai até onde enxerga, sem virar ---------- */
// conferência independente da "linha reta" de cada formato (feita aqui, sem usar Regras.reta)
function emLinha(L, a, b) {
  const A = L.celulas[a], B = L.celulas[b];
  if (L.forma === 'quadrado') return A.col === B.col || A.lin === B.lin;
  if (L.forma === 'colmeia') { const dq = B.q - A.q, dr = B.r - A.r; return dq === 0 || dr === 0 || dq === -dr; }
  if (A.anel === B.anel) return true;
  // mesma fatia: a casa de fora tem o meio dentro do ângulo da casa de dentro (o anel 0 é o círculo todo)
  const [D, F] = A.anel < B.anel ? [A, B] : [B, A];
  if (D.anel === 0) return true;
  const n = L.setores[D.anel], fr = (((F.ang + Math.PI / 2) / (2 * Math.PI)) % 1 + 1) % 1;
  return fr >= D.setor / n - 1e-9 && fr < (D.setor + 1) / n - 1e-9;
}
// cada passo da reta vai para uma casa vizinha, sempre no mesmo jeito (sem virar)
function confereReto(L, cam) {
  if (cam.length < 2) return;
  const cel = cam.map(c => L.celulas[c]);
  for (let i = 1; i < cam.length; i++) assert.ok(R.arestaEntre(L, cam[i - 1], cam[i]) >= 0, 'passo para casa que não é vizinha');
  if (L.forma === 'quadrado' || L.forma === 'colmeia') {
    const k = L.forma === 'quadrado' ? ['col', 'lin'] : ['q', 'r'];
    const d0 = [cel[1][k[0]] - cel[0][k[0]], cel[1][k[1]] - cel[0][k[1]]];
    for (let i = 2; i < cel.length; i++) assert.deepEqual([cel[i][k[0]] - cel[i - 1][k[0]], cel[i][k[1]] - cel[i - 1][k[1]]], d0, 'virou no meio');
  } else if (cel.every(c => c.anel === cel[0].anel)) {
    const n = L.setores[cel[0].anel], d = (cel[1].setor - cel[0].setor + n) % n;
    assert.ok(d === 1 || d === n - 1);
    for (let i = 2; i < cel.length; i++) assert.equal((cel[i].setor - cel[i - 1].setor + n) % n, d, 'mudou de lado no anel');
    assert.ok(cam.length - 1 <= n / 2, 'foi pelo lado comprido do anel');
  } else {
    const s = Math.sign(cel[1].anel - cel[0].anel);
    for (let i = 1; i < cel.length; i++) assert.equal(cel[i].anel - cel[i - 1].anel, s, 'pela fatia: um anel por passo, sempre para o mesmo lado');
  }
}

for (const forma of G.FORMAS) {
  test(`${forma}: linha reta — muitos labirintos e toques: só reto, nunca atravessa parede, para na parede, recusa o que precisa virar`, () => {
    let aceitos = 0, recusados = 0, parados = 0;
    for (let s = 1; s <= 40; s++) {
      const L = G.criar({ forma, nivel: G.NIVEIS[s % 3], semente: s * 7919, retrato: s % 2 === 0 });
      const rnd = G.sorteio(s);
      for (let k = 0; k < 120; k++) {
        const a = Math.floor(rnd() * L.celulas.length), b = Math.floor(rnd() * L.celulas.length);
        const r = R.reta(L, a, b);
        if (!emLinha(L, a, b)) { assert.equal(r, null, `aceitou alvo que precisa virar ${a}→${b}`); recusados++; continue; }
        assert.ok(r, `recusou alvo em linha reta ${a}→${b}`);
        assert.equal(r.caminho[0], a);
        for (let i = 1; i < r.caminho.length; i++) assert.ok(R.ligadas(L, r.caminho[i - 1], r.caminho[i]), 'atravessou parede');
        confereReto(L, r.caminho);
        if (r.chegou) {
          aceitos++;
          assert.equal(r.caminho[r.caminho.length - 1], b);
          assert.deepEqual(r.caminho, R.caminho(L, a, b), 'reta sem parede = o único caminho do labirinto');
        } else {
          parados++;
          // atrás da parede: o caminho de verdade até o alvo não é essa reta, e a reta para numa casa que não é o alvo
          assert.notEqual(r.caminho[r.caminho.length - 1], b);
          assert.notDeepEqual(R.caminho(L, a, b), r.caminho);
        }
      }
      // visíveis = exatamente as casas que a reta alcança
      const de = Math.floor(rnd() * L.celulas.length), vis = new Set(R.visiveis(L, de));
      for (let c = 0; c < L.celulas.length; c++) { const r = R.reta(L, de, c); assert.equal(vis.has(c), c !== de && !!(r && r.chegou)); }
    }
    assert.ok(aceitos > 50 && recusados > 50 && parados > 50, `casos de todo tipo: ${aceitos}/${recusados}/${parados}`);
  });
}

test('linha reta: exemplos feitos à mão (quadrado, colmeia, redondo)', () => {
  // quadrado 6×8 com todas as passagens abertas e uma parede no meio da primeira linha
  const L = G.criar({ forma: 'quadrado', nivel: 'facil', semente: 1, retrato: true });
  L.arestas.forEach(e => { e.aberta = e.b >= 0; });
  const id = (x, y) => y * L.cols + x;
  L.arestas[R.arestaEntre(L, id(2, 0), id(3, 0))].aberta = false;
  assert.deepEqual(R.reta(L, id(0, 0), id(2, 0)), { caminho: [id(0, 0), id(1, 0), id(2, 0)], chegou: true });
  assert.deepEqual(R.reta(L, id(0, 0), id(5, 0)), { caminho: [id(0, 0), id(1, 0), id(2, 0)], chegou: false }, 'para na parede');
  assert.deepEqual(R.reta(L, id(0, 0), id(0, 3)).caminho, [id(0, 0), id(0, 1), id(0, 2), id(0, 3)]);
  assert.equal(R.reta(L, id(0, 0), id(1, 1)), null, 'diagonal precisa virar');
  assert.deepEqual(R.reta(L, id(4, 0), id(4, 0)), { caminho: [id(4, 0)], chegou: true });
  // colmeia: as 6 direções valem; fora delas, não
  const H = G.criar({ forma: 'colmeia', nivel: 'medio', semente: 2 });
  H.arestas.forEach(e => { e.aberta = e.b >= 0; });
  const h = (q, r) => H.ids[q + ',' + r];
  for (const [dq, dr] of [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]) {
    const r = R.reta(H, h(0, 0), h(3 * dq, 3 * dr));
    assert.equal(r.chegou, true); assert.equal(r.caminho.length, 4);
  }
  assert.equal(R.reta(H, h(0, 0), h(2, 1)), null);
  // redondo: pelo anel pelo lado curto; pela fatia para fora e para dentro; fatia vizinha precisa virar
  const O = G.criar({ forma: 'redondo', nivel: 'medio', semente: 3 });
  O.arestas.forEach(e => { e.aberta = e.b >= 0; });
  const o = (a, s) => O.base[a] + s;
  assert.deepEqual(R.reta(O, o(3, 1), o(3, 16)).caminho, [o(3, 1), o(3, 0), o(3, 17), o(3, 16)], 'lado curto do anel');
  assert.deepEqual(R.reta(O, o(1, 0), o(4, 0)).caminho, [o(1, 0), o(2, 0), o(3, 0), o(4, 0)], 'para fora pela fatia');
  assert.deepEqual(R.reta(O, o(4, 1), 0).caminho, [o(4, 1), o(3, 0), o(2, 0), o(1, 0), 0], 'para dentro até o meio');
  assert.equal(R.reta(O, o(1, 0), o(4, 12)), null, 'outra fatia');
  assert.equal(R.visiveis(O, 0).length, O.celulas.length - 1, 'do meio, tudo aberto, vê todas pela fatia');
});
