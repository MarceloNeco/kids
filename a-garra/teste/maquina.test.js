// Testes da máquina por dentro (física e regras), no Node, sem navegador:
// node --test a-garra/teste/*.test.js (rodar da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../maquina.js');
const { BURACO, L, A, CASA } = M.medidas;

// joga sozinho: mira no bichinho mais alto (com um erro de mira opcional) e aperta PEGAR
function jogarSozinho(m, erro) {
  let guarda = 0, k = 0;
  while (m.fase !== 'fim' && guarda++ < 100000) {
    if (m.fase === 'mirar') {
      const alvo = m.premios.filter(p => !p.ganho && p.x > BURACO).sort((a, b) => (a.y - a.r) - (b.y - b.r))[0];
      const desvio = erro ? ((k++ % 2 ? 1 : -1) * erro * alvo.r) : 0;
      m.garra.x = Math.max(m.limites.min, Math.min(m.limites.max, alvo.x + desvio));
      m.pegar();
    }
    m.passo(1 / 60);
  }
  return m;
}

test('a pilha assenta: ninguém no buraco, ninguém fora do vidro, todos parados', () => {
  for (const nivel of ['facil', 'medio', 'dificil']) for (let s = 1; s <= 10; s++) {
    const m = M.nova({ nivel, semente: s });
    assert.equal(m.premios.length, m.cfg.qtd);
    assert.equal(m.premios.filter(p => p.tipo === M.RARO).length, 1, 'uma estrela dourada');
    for (const p of m.premios) {
      assert.ok(p.x >= BURACO, nivel + ' ' + s + ': bichinho no lado do buraco');   // pode ficar apoiado na quina da mureta
      assert.ok(p.x + p.r <= L + 0.5 && p.y + p.r <= A + 0.5, nivel + ' ' + s + ': fora do vidro');
    }
    // depois de 2 s sozinha, a pilha continua no lugar (não treme nem desmorona)
    const antes = m.premios.map(p => [p.x, p.y]);
    for (let i = 0; i < 120; i++) m.passo(1 / 60);
    m.premios.forEach((p, i) => assert.ok(Math.hypot(p.x - antes[i][0], p.y - antes[i][1]) < 6, nivel + ' ' + s + ': a pilha mexeu sozinha'));
    assert.equal(m.ganhos.length, 0);
  }
});

test('mesma semente, mesma máquina', () => {
  const a = M.nova({ nivel: 'medio', semente: 42 }), b = M.nova({ nivel: 'medio', semente: 42 });
  assert.deepEqual(a.premios.map(p => [p.tipo, p.x.toFixed(3), p.y.toFixed(3)]), b.premios.map(p => [p.tipo, p.x.toFixed(3), p.y.toFixed(3)]));
});

test('fácil: mirando no meio, todo bichinho vem (a garra nunca solta)', () => {
  for (let s = 1; s <= 8; s++) {
    const m = jogarSozinho(M.nova({ nivel: 'facil', semente: s }));
    assert.equal(m.fase, 'fim');
    assert.ok(m.ganhos.length >= m.cfg.fichas, 'semente ' + s + ': só ' + m.ganhos.length);
    assert.ok(!m.eventos.some(e => e.tipo === 'escorregou'));
  }
});

test('os níveis ficam mais difíceis (mirando com um pouco de erro)', () => {
  const taxa = (nivel) => { let g = 0, f = 0; for (let s = 1; s <= 12; s++) { const m = jogarSozinho(M.nova({ nivel, semente: s }), 0.45); g += m.ganhos.length; f += m.cfg.fichas; } return g / f; };
  const fa = taxa('facil'), me = taxa('medio'), di = taxa('dificil');
  assert.ok(fa > me && me > di, `fácil ${fa.toFixed(2)} > médio ${me.toFixed(2)} > difícil ${di.toFixed(2)}`);
  assert.ok(di > 0.15, 'o difícil ainda dá para ganhar: ' + di.toFixed(2));
});

test('fechar longe do bichinho não pega nada; cada tentativa gasta uma ficha', () => {
  const m = M.nova({ nivel: 'dificil', semente: 3 });
  const f0 = m.fichas;
  m.garra.x = CASA + 2;   // em cima da mureta/buraco: não tem bichinho embaixo
  assert.equal(m.pegar(), true);
  assert.equal(m.pegar(), false, 'não aperta duas vezes');
  assert.equal(m.fichas, f0 - 1);
  let guarda = 0; while (m.fase !== 'mirar' && guarda++ < 2000) m.passo(1 / 60);
  assert.ok(m.eventos.some(e => e.tipo === 'errou'));
  assert.equal(m.ganhos.length, 0);
});

test('escorregar: com a garra fraca de propósito, o bichinho cai no caminho', () => {
  const m = M.nova({ nivel: 'dificil', semente: 5, ajustes: { escorrega: 5 } });
  const alvo = m.premios.slice().sort((a, b) => (a.y - a.r) - (b.y - b.r))[0];
  m.garra.x = alvo.x; m.pegar();
  let guarda = 0; while (m.fase !== 'mirar' && m.fase !== 'fim' && guarda++ < 2000) m.passo(1 / 60);
  assert.ok(m.eventos.some(e => e.tipo === 'pegou'), 'pegou');
  assert.ok(m.eventos.some(e => e.tipo === 'escorregou'), 'escorregou');
});

test('relógio: no médio, sem apertar, a garra desce sozinha quando o tempo acaba', () => {
  const m = M.nova({ nivel: 'medio', semente: 2 });
  assert.equal(m.tempo, 20);
  for (let i = 0; i < 60 * 19; i++) m.passo(1 / 60);
  assert.equal(m.fase, 'mirar');
  assert.ok(m.eventos.some(e => e.tipo === 'tique'), 'tique-taque nos últimos segundos');
  for (let i = 0; i < 60 * 1.2; i++) m.passo(1 / 60);
  assert.notEqual(m.fase, 'mirar');
  assert.equal(m.fichas, m.cfg.fichas - 1);
});

test('a garra fica entre o buraco e a parede da direita', () => {
  const m = M.nova({ nivel: 'facil', semente: 1 });
  m.mover(1); for (let i = 0; i < 600; i++) m.passo(1 / 60);
  assert.equal(m.garra.x, m.limites.max);
  m.mover(-1); for (let i = 0; i < 600; i++) m.passo(1 / 60);
  assert.equal(m.garra.x, m.limites.min);
  m.irPara(150); for (let i = 0; i < 120; i++) m.passo(1 / 60);
  assert.ok(Math.abs(m.garra.x - 150) < 1);
});
