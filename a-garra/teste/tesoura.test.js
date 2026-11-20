// A máquina da Tesoura (tesoura.js), no Node: segurar anda, soltar corta; em cima do fio corta quando chega a vez.
// node --test a-garra/teste/*.test.js (rodar da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('../tesoura.js');
const TIPOS = ['ursa-vestido', 'coelho-macacao'];

// segura até a tesoura chegar no fio (com um erro opcional) e solta
function tentar(t, erro) {
  assert.equal(t.apertar(), true);
  let g = 0;
  while (t.fase === 'andar' && g++ < 10000) { if (t.x >= t.fioX() + (erro || 0)) t.soltar(); else t.passo(1 / 120); }
  while (t.fase !== 'mirar' && t.fase !== 'fim' && g++ < 20000) t.passo(1 / 60);
}

test('segurar anda, soltar corta; gasta uma ficha por vez; a tesoura volta para o começo', () => {
  const t = T.nova({ nivel: 'medio', semente: 3, tipos: TIPOS });
  assert.equal(t.fase, 'mirar'); assert.equal(t.x, T.TRILHO.x0);
  t.apertar(); for (let i = 0; i < 30; i++) t.passo(1 / 60);
  assert.ok(t.x > T.TRILHO.x0 + 0.3, 'andou'); assert.equal(t.fichas, t.cfg.fichas - 1);
  t.soltar(); assert.equal(t.fase, 'cortar');
  for (let i = 0; i < 600 && t.fase !== 'mirar'; i++) t.passo(1 / 60);
  assert.equal(t.fase, 'mirar'); assert.equal(t.x, T.TRILHO.x0);
});

test('longe do fio: erra sempre, nunca ganha', () => {
  const t = T.nova({ nivel: 'facil', semente: 5, tipos: TIPOS, ajustes: { sempre: true } });
  for (let i = 0; i < 5; i++) tentar(t, 0.6);
  assert.equal(t.ganhos.length, 0);
  assert.ok(t.eventos.filter(e => e.tipo === 'errou').length >= 5);
});

test('em cima do fio: corta de vez a cada poucas tentativas (fácil 2–3, médio 2–4, difícil 3–5, mais 15% de sorte)', () => {
  for (const [nivel, min, max] of [['facil', 0.3, 0.75], ['medio', 0.22, 0.6], ['dificil', 0.15, 0.45]]) {
    let ganhou = 0, vezes = 0;
    for (let s = 1; s <= 30; s++) {
      const t = T.nova({ nivel, semente: s, tipos: TIPOS });
      while (t.fase !== 'fim') { tentar(t, 0); vezes++; }
      ganhou += t.ganhos.length;
    }
    const taxa = ganhou / vezes;
    assert.ok(taxa >= min && taxa <= max, nivel + ': ' + (taxa * 100).toFixed(0) + '% das tentativas');
  }
});

test('quase: o fio fica mais fino (fiapos) e o boneco continua lá; ganhou: cai, a porta abre e vem outro boneco', () => {
  const t = T.nova({ nivel: 'medio', semente: 9, tipos: TIPOS, ajustes: { nunca: true } });
  tentar(t, 0);
  assert.ok(t.eventos.some(e => e.tipo === 'quase')); assert.equal(t.premio.fiapos, 2);
  const g = T.nova({ nivel: 'medio', semente: 9, tipos: TIPOS, ajustes: { sempre: true } });
  const antes = g.premio;
  assert.equal(g.apertar(), true);
  while (g.fase === 'andar') { if (g.x >= g.fioX()) g.soltar(); else g.passo(1 / 120); }
  let abriu = 0;
  while (g.fase !== 'mirar') { g.passo(1 / 60); abriu = Math.max(abriu, g.porta); }
  assert.equal(abriu, 1, 'a porta abriu');
  assert.deepEqual(g.ganhos, [antes.tipo]);
  assert.notEqual(g.premio, antes, 'outro boneco pendurado');
  assert.equal(g.premio.fiapos, 3);
});

test('1 minuto para cortar; acabou o tempo, a tesoura corta onde está (e conta os 10 últimos segundos)', () => {
  const t = T.nova({ nivel: 'dificil', semente: 2, tipos: TIPOS });
  for (let i = 0; i < 60 * 61; i++) t.passo(1 / 60);
  assert.ok(t.eventos.some(e => e.tipo === 'tempoAcabou'));
  assert.equal(t.eventos.filter(e => e.tipo === 'tique').length, 10);
  assert.equal(t.fichas, t.cfg.fichas - 1);
});

test('chegou no fim do trilho segurando: corta lá; acabaram as fichas: fim', () => {
  const t = T.nova({ nivel: 'facil', semente: 4, tipos: TIPOS });
  t.fichas = 1; t.apertar();
  for (let i = 0; i < 60 * 8; i++) t.passo(1 / 60);
  assert.ok(t.eventos.some(e => e.tipo === 'errou' || e.tipo === 'quase' || e.tipo === 'cortou'));
  for (let i = 0; i < 60 * 8 && t.fase !== 'fim'; i++) t.passo(1 / 60);
  assert.equal(t.fase, 'fim'); assert.ok(t.eventos.some(e => e.tipo === 'fim'));
});
