// A máquina de Festas (festas.js): o calendário do ano e os prêmios de cada festa.
// node --test a-garra/teste/*.test.js (rodar da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const F = require('../festas.js');

const d = (a, m, dd) => new Date(a, m - 1, dd, 12);

test('Páscoa certa (a conta de sempre)', () => {
  for (const [a, m, dd] of [[2024, 3, 31], [2025, 4, 20], [2026, 4, 5], [2027, 3, 28], [2028, 4, 16], [2030, 4, 21], [2038, 4, 25]]) assert.deepEqual(F.pascoa(a), { m: m - 1, d: dd }, String(a));
});

test('cada época do ano tem a sua festa', () => {
  const casos = [
    [d(2026, 11, 19), 'natal'], [d(2026, 12, 25), 'natal'], [d(2027, 1, 6), 'natal'], [d(2026, 11, 1), 'natal'],
    [d(2027, 1, 7), 'carnaval'], [d(2026, 2, 17), 'carnaval'], [d(2026, 2, 18), 'carnaval'],   // 2026: carnaval 17/fev, cinzas 18/fev
    [d(2026, 2, 19), 'pascoa'], [d(2026, 4, 5), 'pascoa'], [d(2026, 4, 30), 'pascoa'],
    [d(2026, 5, 1), 'junina'], [d(2026, 6, 24), 'junina'], [d(2026, 8, 15), 'junina'],
    [d(2026, 8, 16), 'criancas'], [d(2026, 10, 12), 'criancas'],
    [d(2026, 10, 13), 'bruxas'], [d(2026, 10, 31), 'bruxas']
  ];
  for (const [data, festa] of casos) assert.equal(F.festaDe(data), festa, data.toDateString());
  // Páscoa bem tarde (2038: 25/abr) fica até uma semana depois
  assert.equal(F.festaDe(d(2038, 5, 2)), 'pascoa'); assert.equal(F.festaDe(d(2038, 5, 3)), 'junina');
  // todo dia de dois anos tem festa
  for (let t = +d(2026, 1, 1); t < +d(2028, 1, 1); t += 864e5) assert.ok(F.LISTA[F.festaDe(new Date(t))]);
});

test('?festa= escolhe a festa (para testar); valor estranho cai no calendário', () => {
  assert.equal(F.atual('?teste&festa=pascoa', d(2026, 11, 19)), 'pascoa');
  assert.equal(F.atual('?festa=xyz', d(2026, 11, 19)), 'natal');
  assert.equal(F.atual('', d(2026, 7, 1)), 'junina');
});

test('cada festa tem nome nos três idiomas, 6 prêmios + 1 dourado, cada um com desenho 3D e nome', () => {
  const p3 = fs.readFileSync(path.join(__dirname, '..', 'premios3d.js'), 'utf8');
  const nomes = p3.slice(p3.indexOf('export const NOMES'), p3.indexOf('};', p3.indexOf('export const NOMES')));
  const vistos = new Set();
  for (const id of F.ORDEM) {
    const f = F.LISTA[id];
    assert.equal(f.nome.length, 3, id); assert.equal(f.ola.length, 3, id);
    assert.equal(f.tipos.length, 6, id); assert.match(f.raro, /-dourad[oa]$/);
    assert.ok(f.tipos.includes(f.raro.replace(/-dourad[oa]$/, '')), id + ': o dourado é um dos prêmios');
    for (const t of f.tipos.concat(f.raro)) {
      assert.ok(!vistos.has(t), 'prêmio repetido entre festas: ' + t); vistos.add(t);
      const chave = /^[a-z]+$/.test(t) ? t : "'" + t + "'";
      assert.ok(nomes.includes(chave + ': ['), 'sem nome: ' + t);
      if (t === f.raro) continue;
      assert.ok(new RegExp('\\n  ' + chave.replace(/[-']/g, (c) => '\\' + c) + '\\(k\\)').test(p3), 'sem desenho 3D: ' + t);
    }
  }
  assert.equal(F.todos().length, 42);
});
