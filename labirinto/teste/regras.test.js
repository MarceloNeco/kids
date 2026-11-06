// Testes das regras (colisão do risco, caminho do cachorrinho, missão): node --test labirinto/teste/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../gerador.js');
const R = require('../regras.js');

const RAIO = 0.2;
// uma parede fechada entre duas casas vizinhas (nenhuma de borda)
function paredeEntreVizinhas(L) {
  for (const e of L.arestas) if (!e.aberta && e.b >= 0) return e;
  throw new Error('sem parede interna');
}

for (const forma of G.FORMAS) {
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
