// Testes da máquina por dentro (física 3D, garra e regra de pagamento), no Node, sem navegador:
// node --test a-garra/teste/*.test.js (rodar da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../maquina.js');
const { BX, BZ, L, P, CASA, LIM } = M.medidas;
const TIPOS = ['urso', 'coelho', 'gato', 'sapo'];
const noBuraco = (p) => p.x < BX && p.z > P - BZ;

// joga sozinho: mira no prêmio mais alto (com um erro de mira opcional, em frações do raio) e aperta PEGAR
function jogarSozinho(m, erro, sorteio) {
  let guarda = 0;
  const r = sorteio || (() => 0.5);
  while (m.fase !== 'fim' && guarda++ < 200000) {
    if (m.fase === 'mirar') {
      const a = m.premios.filter(p => !p.ganho && !noBuraco(p)).sort((x, y) => (y.y + y.r) - (x.y + x.r))[0];
      m.garra.x = Math.max(LIM.x0, Math.min(LIM.x1, a.x + (r() - 0.5) * 2 * (erro || 0) * a.r));
      m.garra.z = Math.max(LIM.z0, Math.min(LIM.z1, a.z + (r() - 0.5) * 2 * (erro || 0) * a.r));
      m.pegar();
    }
    m.passo(1 / 60);
  }
  return m;
}
function sorteador(s) { return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

test('o monte assenta: ninguém no buraco, ninguém fora do vidro, e não desmorona sozinho', () => {
  for (const nivel of ['facil', 'medio', 'dificil']) for (let s = 1; s <= 6; s++) {
    const m = M.nova({ nivel, semente: s, tipos: TIPOS, raro: 'estrela' });
    assert.equal(m.premios.length, m.cfg.qtd);
    assert.equal(m.premios.filter(p => p.tipo === 'estrela').length, 1, 'um prêmio raro');
    for (const p of m.premios) {
      assert.ok(!noBuraco(p), nivel + ' ' + s + ': prêmio no buraco');
      assert.ok(p.x >= p.r - 0.01 && p.x <= L - p.r + 0.01 && p.z >= p.r - 0.01 && p.z <= P - p.r + 0.01 && p.y >= p.r - 0.01, nivel + ' ' + s + ': fora do vidro');
    }
    const antes = m.premios.map(p => [p.x, p.y, p.z]);
    for (let i = 0; i < 180; i++) m.passo(1 / 60);
    m.premios.forEach((p, i) => assert.ok(Math.hypot(p.x - antes[i][0], p.y - antes[i][1], p.z - antes[i][2]) < 0.05, nivel + ' ' + s + ': o monte mexeu sozinho'));
    assert.equal(m.ganhos.length, 0);
  }
});

test('mesma semente, mesma máquina', () => {
  const a = M.nova({ nivel: 'medio', semente: 42, tipos: TIPOS }), b = M.nova({ nivel: 'medio', semente: 42, tipos: TIPOS });
  assert.deepEqual(a.premios.map(p => [p.tipo, p.x.toFixed(4), p.y.toFixed(4), p.z.toFixed(4)]), b.premios.map(p => [p.tipo, p.x.toFixed(4), p.y.toFixed(4), p.z.toFixed(4)]));
});

test('garra forte e bem mirada: o prêmio sobe, vai até o buraco e é seu', () => {
  for (let s = 1; s <= 5; s++) {
    const m = M.nova({ nivel: 'facil', semente: s, tipos: TIPOS, ajustes: { sempreForte: true, fichas: 1 } });
    jogarSozinho(m, 0);
    assert.equal(m.fase, 'fim');
    assert.ok(m.ganhos.length >= 1, 'semente ' + s);
    assert.ok(m.eventos.some(e => e.tipo === 'pegou' && e.forte));
    assert.ok(!m.eventos.some(e => e.tipo === 'escorregou'));
  }
});

test('garra fraca: pega, mas deixa cair no caminho', () => {
  let escorregou = 0;
  for (let s = 1; s <= 5; s++) {
    const m = M.nova({ nivel: 'dificil', semente: s, tipos: TIPOS, ajustes: { nuncaForte: true, fichas: 1 } });
    jogarSozinho(m, 0);
    if (m.eventos.some(e => e.tipo === 'escorregou')) escorregou++;
    assert.ok(m.eventos.some(e => e.tipo === 'pegou' && !e.forte), 'pegou fraco');
  }
  assert.equal(escorregou, 5);
});

test('regra de pagamento: mirando bem, mais ou menos 1 a cada 4 (fácil), 1 a cada 7 (médio) e 1 a cada 10 (difícil)', () => {
  const taxa = (nivel) => { let g = 0, f = 0; for (let s = 1; s <= 20; s++) { const m = jogarSozinho(M.nova({ nivel, semente: s, tipos: TIPOS }), 0.3, sorteador(s)); g += m.ganhos.length; f += m.cfg.fichas; } return f / g; };
  const fa = taxa('facil'), me = taxa('medio'), di = taxa('dificil');
  assert.ok(fa >= 2.5 && fa <= 6, 'fácil: 1 a cada ' + fa.toFixed(1));
  assert.ok(me >= 4.5 && me <= 10, 'médio: 1 a cada ' + me.toFixed(1));
  assert.ok(di >= 7 && di <= 16, 'difícil: 1 a cada ' + di.toFixed(1));
  assert.ok(fa < me && me < di, 'cada nível mais difícil');
});

test('garantia: depois de muitas tentativas sem prêmio, a próxima bem mirada vem forte', () => {
  const m = M.nova({ nivel: 'dificil', semente: 9, tipos: TIPOS, semGanhar: 10 });
  const a = m.premios.filter(p => !noBuraco(p)).sort((x, y) => (y.y + y.r) - (x.y + x.r))[0];
  m.garra.x = a.x; m.garra.z = a.z; m.pegar();
  let g = 0; while (m.fase !== 'levar' && g++ < 2000) m.passo(1 / 60);
  assert.ok(m.eventos.some(e => e.tipo === 'pegou' && e.forte), JSON.stringify(m.eventos));
});

test('fechar longe de tudo não pega nada; cada tentativa gasta uma ficha e não aperta duas vezes', () => {
  const m = M.nova({ nivel: 'dificil', semente: 3, tipos: TIPOS });
  const f0 = m.fichas;
  assert.equal(m.pegar(), true);   // a garra começa em cima do buraco: lá embaixo não tem prêmio
  assert.equal(m.pegar(), false);
  assert.equal(m.fichas, f0 - 1);
  let g = 0; while (m.fase !== 'mirar' && g++ < 3000) m.passo(1 / 60);
  assert.ok(m.eventos.some(e => e.tipo === 'errou'), JSON.stringify(m.eventos));
  assert.equal(m.ganhos.length, 0);
});

test('relógio: no médio, sem apertar, a garra desce sozinha quando o tempo acaba', () => {
  const m = M.nova({ nivel: 'medio', semente: 2, tipos: TIPOS });
  assert.equal(m.tempo, 25);
  for (let i = 0; i < 60 * 24; i++) m.passo(1 / 60);
  assert.equal(m.fase, 'mirar');
  assert.ok(m.eventos.some(e => e.tipo === 'tique'), 'tique-taque nos últimos segundos');
  for (let i = 0; i < 60 * 1.2; i++) m.passo(1 / 60);
  assert.notEqual(m.fase, 'mirar');
  assert.equal(m.fichas, m.cfg.fichas - 1);
});

test('a garra anda nas 4 direções e não sai do vidro; o dedo leva até o ponto', () => {
  const m = M.nova({ nivel: 'facil', semente: 1, tipos: TIPOS });
  m.mover(1, 0); for (let i = 0; i < 400; i++) m.passo(1 / 60);
  assert.equal(m.garra.x, LIM.x1);
  m.mover(0, -1); for (let i = 0; i < 400; i++) m.passo(1 / 60);
  assert.equal(m.garra.z, LIM.z0);
  m.mover(-1, 1); for (let i = 0; i < 400; i++) m.passo(1 / 60);
  assert.equal(m.garra.x, LIM.x0); assert.equal(m.garra.z, LIM.z1);
  m.irPara(3, 2); for (let i = 0; i < 200; i++) m.passo(1 / 60);
  assert.ok(Math.hypot(m.garra.x - 3, m.garra.z - 2) < 0.02);
  assert.ok(Math.hypot(CASA.x - 0.75, CASA.z - 4.25) < 1e-9, 'a garra mora em cima do buraco');
});

test('bichinhos vivos: os de cima dão pulinhos sozinhos, sem cair no buraco', () => {
  const m = M.nova({ nivel: 'facil', semente: 4, tipos: TIPOS, vivos: true });
  for (let i = 0; i < 60 * 20; i++) m.passo(1 / 60);
  assert.ok(m.eventos.filter(e => e.tipo === 'pulo').length >= 2, 'pularam');
  assert.equal(m.ganhos.length, 0, 'pulo não vira prêmio');
});
