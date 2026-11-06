// Enigmas de Ligar — regras do jogo (jogo.js): ligar, errar, estrelas, embaralhar e escolher a próxima rodada.
// Rodar da raiz do kids: node --test enigmas/teste/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const J = require('../jogo.js');
const R = require('../rodadas.js');

function semente(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const exemplo = J.rodada(['Do que cada um gosta?|What does each one like?', '🐶 cachorro|dog = 🦴 osso|bone', '🐵 macaco|monkey = 🍌 banana|banana', '_ au au|woof = 🐰 coelho|rabbit'], 'facil');

test('lê os itens: emoji, palavra em PT e em EN; "_" é sem desenho', () => {
  assert.deepEqual(exemplo.pares[0][0], { e: '🐶', pt: 'cachorro', en: 'dog' });
  assert.deepEqual(exemplo.pares[2][0], { e: '', pt: 'au au', en: 'woof' });
  assert.deepEqual(exemplo.dica, { pt: 'Do que cada um gosta?', en: 'What does each one like?' });
  assert.equal(exemplo.so, null);
  const so = J.rodada(['pt:Rima|Rhyme', '🐱 gato|cat = 🦆 pato|duck'], 'dificil');
  assert.equal(so.so, 'pt'); assert.equal(so.dica.pt, 'Rima');
});

test('só a ligação certa vale; errar conta erro e não liga nada', () => {
  const P = J.Partida(exemplo, semente(1));
  assert.equal(P.n, 3);
  assert.equal(P.ligar(0, 1), 'errado'); assert.equal(P.erros, 1); assert.equal(P.acertos, 0);
  assert.equal(P.ligado('e', 0), false);
  assert.equal(P.ligar(0, 0), 'certo'); assert.equal(P.ligado('e', 0), true); assert.equal(P.ligado('d', 0), true);
  assert.equal(P.ligar(0, 0), 'ja', 'ligar de novo o que já está ligado não conta');
  assert.equal(P.ligar(1, 0), 'ja', 'a da direita já está ocupada');
  assert.equal(P.erros, 1);
  assert.equal(P.ligar(2, 2), 'certo');
  assert.equal(P.completa(), false);
  assert.equal(P.ligar(1, 1), 'fim');
  assert.equal(P.completa(), true);
  assert.equal(P.estrelas(), 2);
});

test('estrelas: sem erro 3, até 2 erros 2, mais erros 1 (nunca zero)', () => {
  assert.equal(J.estrelas(0), 3); assert.equal(J.estrelas(1), 2); assert.equal(J.estrelas(2), 2);
  assert.equal(J.estrelas(3), 1); assert.equal(J.estrelas(20), 1);
});

test('embaralha os dois lados e ninguém fica bem na frente do seu par', () => {
  for (const n of R.NIVEIS) for (const c of R[n]) {
    const r = J.rodada(c, n);
    for (let s = 1; s <= 30; s++) {
      const P = J.Partida(r, semente(s));
      assert.deepEqual([...P.esquerda].sort(), r.pares.map((_, i) => i), 'esquerda com todos');
      assert.deepEqual([...P.direita].sort(), r.pares.map((_, i) => i), 'direita com todos');
      for (let k = 0; k < P.n; k++) assert.notEqual(P.esquerda[k], P.direita[k], 'par alinhado em ' + r.dica.pt);
    }
  }
});

test('não repete rodada antes de passar por todas; depois recomeça misturado', () => {
  for (const n of R.NIVEIS) for (const l of ['pt', 'en']) {
    const lista = J.lista(R, n, l), rnd = semente(7), feitas = [];
    for (let i = 0; i < lista.length; i++) {
      const { rodada, reiniciou } = J.escolher(lista, feitas, rnd);
      assert.equal(reiniciou, false);
      assert.ok(!feitas.includes(rodada.id), n + '/' + l + ': repetiu antes da hora');
      feitas.push(rodada.id);
    }
    assert.equal(new Set(feitas).size, lista.length);
    const depois = J.escolher(lista, feitas, rnd);
    assert.equal(depois.reiniciou, true, 'avisa que já fez todas');
  }
});

test('a próxima rodada sai entre as primeiras que faltam (a dificuldade sobe aos poucos)', () => {
  const lista = J.lista(R, 'dificil', 'pt');
  for (let s = 1; s <= 200; s++) {
    const feitas = lista.slice(0, s % 20).map(r => r.id);
    const { rodada } = J.escolher(lista, feitas, semente(s));
    const pos = lista.indexOf(rodada);
    assert.ok(pos >= feitas.length && pos < feitas.length + J.JANELA, 'escolheu longe demais: ' + pos);
  }
  // mas não é sempre a mesma: sorteia
  const primeiras = new Set(); for (let s = 1; s <= 50; s++) primeiras.add(J.escolher(lista, [], semente(s)).rodada.id);
  assert.ok(primeiras.size > 1, 'sempre a mesma primeira rodada');
});

test('rimas só aparecem na língua delas', () => {
  const pt = J.lista(R, 'dificil', 'pt'), en = J.lista(R, 'dificil', 'en');
  assert.ok(pt.every(r => r.so !== 'en')); assert.ok(en.every(r => r.so !== 'pt'));
  assert.ok(pt.some(r => r.so === 'pt')); assert.ok(en.some(r => r.so === 'en'));
});
