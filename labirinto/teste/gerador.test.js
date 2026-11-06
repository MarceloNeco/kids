// Testes do gerador: node --test labirinto/teste/*.test.js (rodar da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../gerador.js');
const R = require('../regras.js');

function confereperfeito(L, nome) {
  const n = L.celulas.length;
  const abertas = L.arestas.filter(e => e.aberta);
  // árvore: ligada e sem voltas ⇔ n − 1 passagens e todas as casas alcançáveis
  assert.equal(abertas.length, n - 1, nome + ': passagens ≠ casas − 1 (tem volta ou casa solta)');
  for (const e of abertas) assert.ok(e.b >= 0, nome + ': passagem aberta para fora do labirinto');
  const visto = new Uint8Array(n), fila = [0]; visto[0] = 1;
  for (let h = 0; h < fila.length; h++) for (const v of L.viz[fila[h]]) if (v.c >= 0 && L.arestas[v.e].aberta && !visto[v.c]) { visto[v.c] = 1; fila.push(v.c); }
  assert.equal(fila.length, n, nome + ': nem todas as casas se ligam');
  // cada casa tem o centro dentro dela mesma
  L.celulas.forEach((c, i) => assert.equal(R.celulaEm(L, c.x, c.y), i, nome + ': centro fora da casa ' + i));
}

for (const forma of G.FORMAS) for (const nivel of G.NIVEIS) {
  test(`${forma} ${nivel}: labirinto perfeito em várias sementes`, () => {
    for (let s = 1; s <= 25; s++) confereperfeito(G.criar({ forma, nivel, semente: s * 7919 }), `${forma}/${nivel}/${s}`);
  });
}

test('mesma semente = mesmo labirinto; semente diferente = outro', () => {
  for (const forma of G.FORMAS) {
    const a = G.criar({ forma, nivel: 'medio', semente: 42 }), b = G.criar({ forma, nivel: 'medio', semente: 42 }), c = G.criar({ forma, nivel: 'medio', semente: 43 });
    const assin = L => L.arestas.map(e => e.aberta ? 1 : 0).join('') + '|' + L.inicio + '|' + L.saida + '|' + L.item;
    assert.equal(assin(a), assin(b), forma + ': mudou com a mesma semente');
    assert.notEqual(assin(a), assin(c), forma + ': igual com outra semente');
  }
});

test('três tamanhos: fácil < médio < difícil', () => {
  for (const forma of G.FORMAS) {
    const n = G.NIVEIS.map(nivel => G.criar({ forma, nivel, semente: 5 }).celulas.length);
    assert.ok(n[0] < n[1] && n[1] < n[2], forma + ': ' + n.join(' < '));
    assert.ok(n[2] >= 200, forma + ' difícil precisa ser desafiador: ' + n[2] + ' casas');
  }
});

test('entrada e saída na borda; item no meio quando há missão', () => {
  for (const forma of G.FORMAS) for (let s = 1; s <= 30; s++) {
    const L = G.criar({ forma, nivel: 'medio', semente: s });
    assert.ok(L.bordaInicio >= 0 && L.arestas[L.bordaInicio].b === -1 && L.arestas[L.bordaInicio].a === L.inicio);
    if (L.bordaSaida >= 0) assert.ok(L.arestas[L.bordaSaida].b === -1 && L.arestas[L.bordaSaida].a === L.saida);
    else assert.ok(forma === 'redondo' && L.saida === 0 && L.item === -1, 'saída no meio só no redondo sem missão');
    if (L.item >= 0) { assert.equal(L.item, L.meio); assert.notEqual(L.item, L.saida); }
    assert.notEqual(L.inicio, L.saida);
  }
  const comMissao = G.criar({ forma: 'redondo', nivel: 'facil', semente: 3, missao: true });
  assert.equal(comMissao.item, 0, 'redondo com missão: item no círculo do meio');
  const sem = G.criar({ forma: 'quadrado', nivel: 'facil', semente: 3, missao: false });
  assert.equal(sem.item, -1);
});

test('quadrado deitado troca colunas e linhas', () => {
  const a = G.criar({ forma: 'quadrado', nivel: 'medio', semente: 1 }), b = G.criar({ forma: 'quadrado', nivel: 'medio', semente: 1, retrato: false });
  assert.equal(a.cols, b.linhas); assert.equal(a.linhas, b.cols);
});

test('redondo: fatias dobram para fora e o miolo é uma casa só', () => {
  const n = G.setoresPorAnel(11);
  assert.equal(n[0], 1); assert.equal(n[1], 6);
  for (let i = 2; i < n.length; i++) assert.ok(n[i] % n[i - 1] === 0 && n[i] >= n[i - 1]);
});
