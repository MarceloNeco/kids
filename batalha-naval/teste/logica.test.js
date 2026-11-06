// Regras da Batalha Naval (sem tela): node --test batalha-naval/teste/logica.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../logica.js');

function sorteio(semente) { let a = semente >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

test('três níveis: 8×8, 10×10, 12×12, frota maior a cada nível', () => {
  assert.deepEqual(Object.keys(L.NIVEIS), ['facil', 'medio', 'dificil']);
  assert.equal(L.NIVEIS.facil.n, 8); assert.equal(L.NIVEIS.medio.n, 10); assert.equal(L.NIVEIS.dificil.n, 12);
  const soma = k => L.NIVEIS[k].frota.reduce((a, b) => a + b, 0);
  assert.ok(soma('facil') < soma('medio') && soma('medio') < soma('dificil'));
  for (const k of Object.keys(L.NIVEIS)) for (const t of L.NIVEIS[k].frota) assert.ok(L.NOMES[t], 'sem nome o navio de ' + t);
});

test('coordenadas: letra da coluna + número da linha', () => {
  assert.equal(L.coord(0, 0), 'A1'); assert.equal(L.coord(4, 3), 'E4'); assert.equal(L.coord(5, 1), 'F2'); assert.equal(L.coord(11, 11), 'L12');
});

test('posicionar: dentro do tabuleiro e sem ficar por cima de outro', () => {
  const f = [{ x: 0, y: 0, tam: 4, h: true }];
  assert.ok(L.cabe(f, 8, { x: 0, y: 1, tam: 3, h: true }), 'encostado do lado pode');
  assert.ok(!L.cabe(f, 8, { x: 2, y: 0, tam: 2, h: false }), 'por cima não pode');
  assert.ok(!L.cabe([], 8, { x: 6, y: 0, tam: 3, h: true }), 'saindo pela direita');
  assert.ok(!L.cabe([], 8, { x: 0, y: 6, tam: 3, h: false }), 'saindo por baixo');
  assert.ok(!L.cabe([], 8, { x: -1, y: 0, tam: 2, h: true }));
  assert.ok(L.cabe(f, 8, { x: 0, y: 0, tam: 4, h: false }, 0), 'ignorando o próprio navio (girar no lugar)');
});

test('frota válida só com os navios do nível, tudo dentro e sem sobrepor', () => {
  const boa = [{ x: 0, y: 0, tam: 4, h: true }, { x: 0, y: 1, tam: 3, h: true }, { x: 7, y: 0, tam: 2, h: false }, { x: 3, y: 5, tam: 2, h: false }];
  assert.ok(L.frotaValida(boa, 'facil'));
  assert.ok(!L.frotaValida(boa.slice(0, 3), 'facil'), 'faltando navio');
  assert.ok(!L.frotaValida(boa, 'medio'), 'frota de outro nível');
  assert.ok(!L.frotaValida([boa[0], boa[1], boa[2], { x: 0, y: 0, tam: 2, h: false }], 'facil'), 'sobreposto');
  assert.ok(!L.frotaValida([boa[0], boa[1], boa[2], { x: 7, y: 7, tam: 2, h: true }], 'facil'), 'fora');
  assert.ok(!L.frotaValida([boa[0], boa[1], boa[2], { x: '1', y: 0, tam: 2, h: true }], 'facil'), 'lixo');
  assert.ok(!L.frotaValida(null, 'facil'));
});

test('arrumação aleatória sempre válida nos três níveis', () => {
  const r = sorteio(7);
  for (const k of Object.keys(L.NIVEIS)) for (let i = 0; i < 200; i++) assert.ok(L.frotaValida(L.aleatoria(k, r), k));
});

test('tiro: água, acerto, afundou e fim da frota', () => {
  const f = [{ x: 0, y: 0, tam: 2, h: true }, { x: 5, y: 5, tam: 3, h: false }];
  assert.deepEqual(L.resolver(f, {}, 3, 3), { r: 'agua' });
  assert.equal(L.resolver(f, {}, 0, 0).r, 'acerto');
  const a = L.resolver(f, { '0,0': 1 }, 1, 0);
  assert.equal(a.r, 'afundou'); assert.deepEqual(a.navio, { x: 0, y: 0, tam: 2, h: true }); assert.equal(a.fim, false);
  const fim = L.resolver(f, { '0,0': 1, '1,0': 1, '5,5': 1, '5,6': 1 }, 5, 7);
  assert.equal(fim.r, 'afundou'); assert.equal(fim.fim, true);
});

function partidaContra(nivel, semente) {
  const r = sorteio(semente), frota = L.aleatoria(nivel, r), ia = L.IA(nivel, r), n = L.NIVEIS[nivel].n, tiros = {};
  let fim = false, qtd = 0;
  while (!fim) {
    const [x, y] = ia.escolher();
    const k = L.chave(x, y);
    assert.ok(!tiros[k], 'computador atirou de novo em ' + L.coord(x, y) + ' (' + nivel + ')');
    assert.ok(x >= 0 && y >= 0 && x < n && y < n);
    const res = L.resolver(frota, tiros, x, y); tiros[k] = 1; qtd++;
    ia.anotar(x, y, res.r, res.navio); fim = !!res.fim;
    assert.ok(qtd <= n * n, 'passou do número de casas');
  }
  return qtd;
}

test('computador nunca atira duas vezes no mesmo lugar e sempre termina (3 níveis)', () => {
  for (const k of Object.keys(L.NIVEIS)) for (let i = 0; i < 25; i++) partidaContra(k, 100 + i);
});

test('esperteza do computador: Difícil < Médio < Fácil em número de tiros (mesmo tabuleiro 10×10)', () => {
  const jogar = (jeito, semente) => {
    const r = sorteio(semente), frota = L.aleatoria('medio', r), ia = L.IA('medio', r, jeito), tiros = {};
    let qtd = 0, fim = false;
    while (!fim) {
      const [x, y] = ia.escolher();
      const res = L.resolver(frota, tiros, x, y); tiros[L.chave(x, y)] = 1; qtd++;
      ia.anotar(x, y, res.r, res.navio); fim = !!res.fim;
    }
    return qtd;
  };
  const media = jeito => { let s = 0; for (let i = 0; i < 40; i++) s += jogar(jeito, 900 + i); return s / 40; };
  const f = media('facil'), m = media('medio'), d = media('dificil');
  assert.ok(d < m && m < f, `médias de tiros: difícil ${d}, médio ${m}, fácil ${f}`);
  console.log(`  tiros em média para afundar tudo (10×10): fácil ${f.toFixed(1)}, médio ${m.toFixed(1)}, difícil ${d.toFixed(1)}`);
});

test('navio vai e volta pela rede como lista curta', () => {
  const nv = { x: 3, y: 4, tam: 5, h: false };
  assert.deepEqual(L.deLista(L.paraLista(nv)), nv);
});
