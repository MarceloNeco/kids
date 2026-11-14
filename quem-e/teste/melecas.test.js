// Quem é? — as melecas (melecas.js). Rodar da raiz: node --test quem-e/teste/melecas.test.js
const test = require('node:test');
const assert = require('node:assert');
const M = require('../melecas.js');
const HUMORES = ['parada', 'feliz', 'ops', 'pensando', 'falando', 'triste'];

test('as duas melecas, com nome e cor', () => {
  assert.deepStrictEqual(M.LISTA.map(m => m.id), ['blue', 'pink']);
  assert.strictEqual(M.LISTA[0].nome, 'Melekento Blue');
  assert.strictEqual(M.LISTA[1].nome, 'Pink Honey');
  for (const m of M.LISTA) assert.match(m.cor, /^#[0-9a-f]{6}$/i);
});

test('cada meleca em cada humor: SVG válido, ids com prefixo, humores diferentes', () => {
  for (const m of M.LISTA) {
    const vistos = new Set();
    for (const h of HUMORES) {
      const s = M.svg(m.id, h, { id: 'm' + m.id + h });
      assert.ok(s.startsWith('<svg') && s.endsWith('</svg>'), m.id + h);
      for (const x of s.matchAll(/ id="([^"]+)"/g)) assert.ok(x[1].startsWith('m' + m.id + h), 'id sem prefixo ' + x[1]);
      for (const x of s.matchAll(/url\(#([^)]+)\)/g)) assert.ok(s.includes(' id="' + x[1] + '"'), 'referência sem alvo ' + x[1]);
      assert.ok(!/<script|<image|href="http/i.test(s));
      vistos.add(s.replace(/ id="[^"]+"|url\(#[^)]+\)/g, ''));
    }
    assert.strictEqual(vistos.size, HUMORES.length, 'humores iguais em ' + m.id);
  }
});

test('Melekento Blue: azul translúcido com bolhas; Pink Honey: rosa com fio de mel', () => {
  const b = M.svg('blue', 'parada', { id: 'b' }), p = M.svg('pink', 'parada', { id: 'p' });
  assert.match(b, /opacity="0?\.\d+"/);
  assert.ok((b.match(/<circle/g) || []).length >= 6, 'poucas bolhas');
  assert.ok(b.includes('qm-blue'));
  assert.ok(p.includes('qm-mel'), 'sem fio de mel');
  assert.ok(p.includes('qm-pink'));
});

test('classe de animação por humor', () => {
  assert.ok(M.svg('blue', 'feliz', { id: 'a' }).includes('qm-pula'));
  assert.ok(M.svg('pink', 'ops', { id: 'a' }).includes('qm-treme'));
  assert.ok(M.svg('pink', 'parada', { id: 'a' }).includes('qm-respira'));
});
