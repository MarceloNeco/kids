// Cenários: mais lugares, cada um diz se bicho combina e se tem terra (toupeira e minhoca)
const test = require('node:test');
const assert = require('node:assert/strict');
const Cenas = require('../cenas.js');

test('cenários: pelo menos 7, SVG fechado e sem número quebrado', () => {
  const l = Cenas.lista();
  assert.ok(l.length >= 7, 'tem ' + l.length);
  l.forEach((c) => {
    assert.ok(c.svg.startsWith('<svg') && c.svg.endsWith('</svg>'), c.id);
    assert.ok(!/NaN|undefined/.test(c.svg), c.id + ' sem NaN/undefined');
    assert.equal(typeof c.bichos, 'boolean', c.id); assert.equal(typeof c.buraco, 'boolean', c.id);
  });
  ['fazenda', 'jardim', 'lago'].forEach((id) => assert.ok(Cenas.porId(id), id));
});
test('Pega-pega sorteia só onde bicho combina (nunca a Lua) e não repete o anterior', () => {
  for (let i = 0; i < 200; i++) { const c = Cenas.sortear('fazenda', (x) => x.bichos); assert.ok(c.bichos && c.id !== 'fazenda', c.id); }
});
