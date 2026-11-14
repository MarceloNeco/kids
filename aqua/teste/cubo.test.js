// Testes das regras do Cubo d'Água (cubo-motor.js): node --test aqua/teste/*.test.js (rodar da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../cubo-motor.js');

const aoAcaso = (r) => ({ eixo: 'xyz'[Math.floor(r() * 3)], camada: [-1, 0, 1][Math.floor(r() * 3)], dir: r() < 0.5 ? 1 : -1 });

test('cubo novo: 54 pastilhas, 9 de cada cor, cada face de uma cor só', () => {
  const e = C.novo();
  assert.equal(e.pastilhas.length, 54);
  for (let cor = 0; cor < 6; cor++) assert.equal(e.pastilhas.filter(p => p.cor === cor).length, 9);
  assert.ok(C.pronto(e)); assert.equal(C.facesProntas(e), 6);
  assert.equal(new Set(e.pastilhas.map(p => p.pos.join(',') + '|' + p.normal.join(','))).size, 54, 'cada pastilha num lugar diferente');
});

test('girar: 4 giros iguais voltam ao começo; ida e volta se desfazem; giro inválido não vale', () => {
  for (const eixo of ['x', 'y', 'z']) for (const camada of [-1, 0, 1]) for (const dir of [1, -1]) {
    const e = C.novo();
    for (let i = 0; i < 4; i++) C.girar(e, { eixo, camada, dir });
    assert.ok(C.pronto(e), eixo + camada + dir);
    C.girar(e, { eixo, camada, dir }); assert.ok(!C.pronto(e));
    C.girar(e, C.inverso({ eixo, camada, dir })); assert.ok(C.pronto(e));
  }
  const e = C.novo();
  assert.equal(C.girar(e, { eixo: 'w', camada: 0, dir: 1 }), false);
  assert.equal(C.girar(e, { eixo: 'x', camada: 2, dir: 1 }), false);
  assert.equal(e.giros.length, 0);
});

test('girar uma fatia de fora muda 4 faces e deixa 2 inteiras; a do meio deixa 0', () => {
  const a = C.novo(); C.girar(a, { eixo: 'x', camada: 1, dir: 1 }); assert.equal(C.facesProntas(a), 2);
  const b = C.novo(); C.girar(b, { eixo: 'y', camada: 0, dir: -1 }); assert.equal(C.facesProntas(b), 2);
  assert.ok(!C.pronto(b));
});

test('desfazer: volta exatamente o último giro da criança', () => {
  const r = C.semente(4), e = C.gerar('medio', 7), antes = JSON.stringify(e.pastilhas);
  for (let k = 0; k < 6; k++) C.girar(e, aoAcaso(r));
  for (let k = 0; k < 6; k++) assert.ok(C.desfazer(e));
  assert.equal(JSON.stringify(e.pastilhas), antes);
  assert.equal(C.desfazer(e), null, 'sem giro para desfazer');
});

test('simplificar: junta giros seguidos da mesma fatia', () => {
  const g = (eixo, camada, dir) => ({ eixo, camada, dir });
  assert.deepEqual(C.simplificar([g('x', 1, 1), g('x', 1, -1)]), []);
  assert.deepEqual(C.simplificar([g('y', 0, 1), g('y', 0, 1), g('y', 0, 1)]), [g('y', 0, -1)]);
  assert.deepEqual(C.simplificar([g('y', 0, 1), g('y', 0, 1)]), [g('y', 0, 1), g('y', 0, 1)]);
  assert.deepEqual(C.simplificar([g('z', -1, 1), g('x', 1, 1), g('x', 1, -1), g('z', -1, -1)]), []);
});

test('fases: cada nível embaralha mais, sempre com solução, nunca já montado; a fase N é sempre a mesma', () => {
  for (const nivel of C.NIVEIS) {
    let antes = 0;
    for (let f = 1; f <= 300; f++) {
      const cfg = C.config(nivel, f), e = C.gerar(nivel, f);
      assert.ok(e, nivel + ' ' + f + ': não gerou');
      assert.ok(cfg.giros >= antes); antes = cfg.giros;
      assert.equal(e.embaralho.length, cfg.giros);
      assert.equal(C.simplificar(e.embaralho).length, cfg.giros, 'nenhum giro do embaralho se cancela');
      assert.ok(!C.pronto(e), nivel + ' ' + f + ': já começa montado');
      if (!cfg.meio) assert.ok(e.embaralho.every(g => g.camada !== 0), 'sem fatia do meio no começo');
      // a prova: seguir o caminho da dica até o fim monta o cubo
      C.caminho(e).forEach(g => C.girar(e, g));
      assert.ok(C.pronto(e), nivel + ' ' + f + ': o caminho não monta');
    }
  }
  assert.deepEqual(C.gerar('dificil', 9).embaralho, C.gerar('dificil', 9).embaralho);
  assert.notDeepEqual(C.gerar('dificil', 9).embaralho, C.gerar('dificil', 10).embaralho);
  assert.deepEqual([C.config('facil', 1).giros, C.config('facil', 100).giros], [1, 3]);
  assert.deepEqual([C.config('medio', 1).giros, C.config('medio', 100).giros], [4, 8]);
  assert.deepEqual([C.config('dificil', 1).giros, C.config('dificil', 100).giros], [10, 25]);
});

test('dica: de qualquer ponto (com giros ao acaso da criança) o caminho da dica monta o cubo', () => {
  const r = C.semente(21);
  for (const nivel of C.NIVEIS) for (let f = 1; f <= 60; f++) {
    const e = C.gerar(nivel, f);
    for (let k = 0; k < 1 + (f % 9); k++) C.girar(e, aoAcaso(r));
    let n = 0;
    while (!C.pronto(e)) { const g = C.dica(e); assert.ok(g, 'sem dica e sem montar'); C.girar(e, g); assert.ok(++n < 200, 'a dica não chega ao fim'); }
  }
  assert.equal(C.dica(C.novo()), null, 'cubo montado: nada a dizer');
});
