// Testes da garagem (a lista; os desenhos são conferidos no navegador): node --test vruuum/teste/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const V = require('../veiculos.js');

test('24 veículos, ids únicos, nome em PT, EN e ES, grupo que existe', () => {
  assert.equal(V.LISTA.length, 24);
  assert.equal(new Set(V.LISTA.map(v => v.id)).size, 24);
  const grupos = V.GRUPOS.map(g => g.id);
  for (const g of V.GRUPOS) assert.equal(g.nome.length, 3, g.id);
  for (const v of V.LISTA) {
    assert.ok(grupos.includes(v.grupo), v.id);
    assert.equal(v.nome.length, 3, v.id); assert.ok(v.nome.every(Boolean), v.id);
    assert.equal(typeof v.desenhar, 'function', v.id);
    assert.ok(v.w > 0 && v.h > 0, v.id);
  }
});

test('avião, jato, helicóptero, trenó, arara e morcego voam; os outros andam no chão', () => {
  assert.deepEqual(V.LISTA.filter(v => V.voa(v.id)).map(v => v.id).sort(), ['arara', 'aviao', 'heli', 'jato', 'morcego', 'treno']);
  assert.equal(V.voa('classico'), false);
  assert.equal(V.achar('nao-existe'), null);
});

test('diferenças pequenas de velocidade e curva (corrida equilibrada)', () => {
  for (const v of V.LISTA) {
    assert.ok(v.vel >= 0.9 && v.vel <= 1.12, v.id + ' vel ' + v.vel);
    assert.ok(v.curva >= 0.9 && v.curva <= 1.15, v.id + ' curva ' + v.curva);
  }
});

test('nenhum nome de marca nos veículos', () => {
  const nomes = V.LISTA.map(v => v.nome.join(' ')).join(' ').toLowerCase();
  for (const marca of ['porsche', 'ferrari', 'lamborghini', 'boeing', 'airbus', 'honda', 'yamaha', 'barbie', 'mattel']) assert.ok(!nomes.includes(marca), marca);
});

test('o skate é animado: vários quadros da perna empurrando o chão, cabeça aberta (sem capacete)', () => {
  const sk = V.achar('skate');
  assert.ok(sk.quadros >= 8, 'quadros ' + sk.quadros);
  assert.equal(sk.aberto, true);
  assert.ok(!sk.capacete);
});


test('bichos e carrinhos sem motor de carro: cada um tem a sua voz gravada', () => {
  for (const id of ['galinha', 'cavalo', 'dino', 'arara', 'morcego']) { const v = V.achar(id); assert.ok(v.semMotor, id); assert.ok(v.voz, id); }
  assert.equal(V.achar('galinha').voz, 'galo');
  assert.ok(V.achar('morcego').dracula && V.achar('morcego').abobora, 'o morcego vira Drácula e joga abóbora');
});

test('veículos em 3D (modelos3d.js): giram de lado, e a cabeça do piloto fica dentro do quadro em qualquer giro', () => {
  const M3 = require('../modelos3d.js');
  for (const id of ['furgao', 'escolar', 'pelucias', 'pipoca', 'sorvete', 'hamburguer', 'galinha']) {
    const v = V.achar(id);
    assert.equal(v.modelo, id);
    for (const lado of [-1, 0, 1]) for (const incl of [-0.3, 0, 0.3]) {
      const o = M3.cabeca(id, 0, 0, v.w, v.h, 0.3, lado, incl);
      assert.ok(o && o.x > 0 && o.x < v.w && o.y > 0 && o.y < v.h, id + ' ' + lado + ' ' + incl + ' ' + JSON.stringify(o));
    }
    const fC = M3.montar(id, 0, 0, v.w, v.h, '#ff4fa3', 0.3, 0, 0, {}).length, fL = M3.montar(id, 0, 0, v.w, v.h, '#ff4fa3', 0.3, 1, 0, {}).length;
    assert.ok(fC > 5 && fL > 5, id + ' faces ' + fC + ' ' + fL);
  }
  assert.ok(V.achar('ovo').semPiloto, 'o Ovo corre sozinho, sem carro e sem piloto');
});
