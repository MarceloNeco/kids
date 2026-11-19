// Testes do duelo (cada um no seu celular): node --test vruuum/teste/
const test = require('node:test');
const assert = require('node:assert/strict');
const DU = require('../duelo.js');
const M = require('../motor.js');

test('código de 4 letras e identidade de 8 letras/números', () => {
  for (let k = 0; k < 50; k++) { assert.match(DU.codigoNovo(), /^[A-HJ-NP-Z]{4}$/); assert.match(DU.idNovo(), /^[a-z0-9]{8}$/); }
  assert.equal(DU.codigo(' abcd '), 'ABCD');
  assert.equal(DU.codigo('AB1D'), null);
  assert.equal(DU.codigo('ABCDE'), null);
});

test('mensagens certas passam; estranhas ou maldosas são jogadas fora', () => {
  const id = 'abcd1234', rid = 'zzzz9999';
  const oi = DU.validar({ t: 'oi', id, nome: '<b>Júlia</b>', veic: 'gt', cor: '#ff4fa3', h: 1 });
  assert.equal(oi.nome, 'bJúlia/b');   // sem < > (a tela só usa textContent, mas limpa assim mesmo)
  assert.equal(DU.validar({ t: 'oi', id: 'X', nome: 'a', veic: 'gt', cor: '#ff4fa3' }), null);
  assert.equal(DU.validar({ t: 'oi', id, nome: 'a', veic: 'gt', cor: 'red' }), null);
  assert.ok(DU.validar({ t: 'largar', id, rid, sem: 123, niv: 'normal', mun: ['praia'], riv: [{ id: 'saci', veic: 'kart', cor: '#123456', vel: 1, curva: 1.1 }] }));
  assert.equal(DU.validar({ t: 'largar', id, rid, sem: 123, niv: 'impossivel', mun: [], riv: [] }), null);
  assert.equal(DU.validar({ t: 'largar', id, rid, sem: 123, niv: 'normal', mun: [], riv: new Array(9).fill({ id: 'a', veic: 'gt', cor: '#123456', vel: 1, curva: 1 }) }), null);
  assert.ok(DU.validar({ t: 'pos', id, rid, z: 5000, x: 0.3, v: 900, tu: 0, pu: 0, c: 0, tm: 0, pt: 100 }));
  assert.equal(DU.validar({ t: 'pos', id, rid, z: NaN, x: 0, v: 0, tu: 0, pu: 0, c: 0, tm: 0, pt: 0 }), null);
  assert.equal(DU.validar({ t: 'pos', id, rid, z: 1, x: 99, v: 0, tu: 0, pu: 0, c: 0, tm: 0, pt: 0 }), null);
  assert.ok(DU.validar({ t: 'riv', id, rid, r: [[1000, 0, 0, 0, 0]] }));
  assert.equal(DU.validar({ t: 'riv', id, rid, r: [[1000, 0, 0]] }), null);
  assert.ok(DU.validar({ t: 'tchau', id }));
  assert.equal(DU.validar({ t: 'outra', id }), null);
  assert.equal(DU.validar(null), null);
});

test('o corredor que vem do outro celular (remoto) não é movido pelo computador', () => {
  const e = M.novaCorrida('normal', 7, 1, [{ id: 'saci', veic: 'kart', mod: {} }, { id: 'emilia', veic: 'gt', mod: {} }]);
  e.fase = 'corrida';
  const outro = e.rivais[1]; outro.remoto = true; outro.z = 3000;
  const z0 = e.rivais[0].z;
  for (let k = 0; k < 120; k++) M.atualizar(e, [{ dir: 0 }], 1 / 60);
  assert.equal(outro.z, 3000, 'o remoto ficou onde o canal pôs');
  assert.ok(e.rivais[0].z > z0, 'o rival do computador andou');
});
