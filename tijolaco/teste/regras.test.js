// Regras do TijoLinto sem tela: node --test tijolaco/teste/regras.test.js (rodar da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../regras.js');
const F = require('../fases.js');
const D = R.D;
const sorte = (sem) => { let s = sem; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

// partida de teste: fila parada (sem novos tijolos), com as cores dadas da frente para trás
function mesa(cores, op) {
  op = op || {};
  const fase = Object.assign({}, F[op.fase || 0], { vel: op.vel != null ? op.vel : 0.0001, poder: 0, capacete: 1e9 });
  const E = R.novo(fase, 'medio', { rng: sorte(42) });
  E.semNovos = true;
  const T = E.trilhos[0], s0 = op.s0 || Math.round(T.tab.L * 0.5);
  T.bolas = cores.map((c, k) => R.novaBola(E, c, s0 - k * D));
  R.passo(E, 0.0001);
  return { E, T };
}
// cresce o encaixe (120 ms) e deixa o ímã trabalhar
function rodar(E, seg) { const ev = []; for (let t = 0; t < seg; t += 1 / 60) ev.push(...R.passo(E, 1 / 60)); return ev; }

test('caminho: tabela com um ponto a cada 1 unidade, passando pelos pontos da fase, com tangente', () => {
  const pts = [[0, 0], [100, 0], [200, 100], [200, 300]];
  const tab = R.tabela(pts);
  assert.ok(tab.L > 420 && tab.L < 470, 'comprimento ' + tab.L);
  for (let s = 1; s <= tab.L; s++) {
    const d = Math.hypot(tab.x[s] - tab.x[s - 1], tab.y[s] - tab.y[s - 1]);
    assert.ok(d > 0.9 && d < 1.1, 'passo de ' + d + ' em s=' + s);
  }
  assert.deepEqual([tab.x[0], tab.y[0]], [0, 0]);
  assert.ok(Math.hypot(tab.x[tab.L] - 200, tab.y[tab.L] - 300) < 1.5);
  tab.marcas.forEach((s, i) => assert.ok(Math.hypot(tab.x[Math.round(s)] - pts[i][0], tab.y[Math.round(s)] - pts[i][1]) < 1.5, 'passa pelo ponto ' + i));
  assert.ok(Math.abs(tab.a[10]) < 0.15, 'começa indo para a direita');
  assert.ok(Math.abs(tab.a[tab.L - 5] - Math.PI / 2) < 0.1, 'termina descendo');
  const p = R.ponto(tab, 50.4); assert.ok(Math.abs(p.x - tab.x[50]) < 1e-6);
});

test('manilha: a fila some dentro do cano, mas quem cruza por cima continua à vista', () => {
  const pts = [[0, 100], [300, 100], [400, 50], [350, 0], [200, 0], [200, 100], [200, 250]];
  const tab = R.tabela(pts, [[[150, 100], [250, 100]]]);
  let ocultos = 0, cruzaVisivel = false;
  for (let s = 0; s <= tab.L; s++) {
    if (tab.oculto[s]) { ocultos++; assert.ok(Math.abs(tab.y[s] - 100) < 10); }
    if (Math.abs(tab.x[s] - 200) < 2 && Math.abs(tab.y[s] - 100) < 2 && Math.abs(Math.cos(tab.a[s])) < 0.3) cruzaVisivel = !tab.oculto[s];
  }
  assert.ok(ocultos > 80 && ocultos < 120, 'ocultos ' + ocultos);
  assert.ok(cruzaVisivel, 'o trecho que cruza por cima aparece');
});

test('as 8 fases carregam, deitadas e em pé, com caminhos longe do lançador', () => {
  assert.equal(F.length, 8);
  for (const f of F) for (const retrato of [false, true]) {
    const E = R.novo(f, 'dificil', { retrato, rng: sorte(7) });
    assert.equal(E.W, retrato ? 620 : 1000);
    assert.ok(E.trilhos.length >= 1);
    for (const T of E.trilhos) {
      assert.ok(T.tab.L > 900, 'fase ' + f.id + ' caminho curto: ' + T.tab.L);
      for (let s = 0; s <= T.tab.L; s += 5) {
        assert.ok(Math.hypot(T.tab.x[s] - E.lanc.x, T.tab.y[s] - E.lanc.y) > 80, 'fase ' + f.id + ': o caminho passa em cima do lançador');
        assert.ok(T.tab.x[s] > -1 && T.tab.x[s] < E.W + 1 && T.tab.y[s] > -1 && T.tab.y[s] < E.H + 1, 'fase ' + f.id + ' sai do campo');
      }
    }
    assert.ok(f.nome.pt && f.nome.en && f.nome.es);
    for (let i = 0; i < 300; i++) R.passo(E, 1 / 30);   // a fila entra
    assert.ok(E.trilhos.every(T => T.bolas.length > 5), 'fase ' + f.id + ': a fila entrou');
  }
  assert.ok(F.some(f => f.trilhos.length === 2), 'tem fase com dois caminhos');
  assert.ok(F[7].lancador.trilho, 'fase 8: lançador no andaime');
  assert.ok(F.some(f => f.trilhos.some(t => t.pecas && t.pecas.some(p => p.portao))), 'tem portões');
  assert.ok(F.some(f => (f.manilhas || []).length), 'tem manilhas');
});

test('níveis: fácil 4 cores e mira completa, médio 5, difícil 6, mais rápido e mira curta', () => {
  const N = R.NIVEIS;
  assert.equal(N.facil.cores, 4); assert.equal(N.medio.cores, 5); assert.equal(N.dificil.cores, 6);
  assert.ok(N.facil.vel < N.medio.vel && N.medio.vel < N.dificil.vel);
  assert.ok(N.facil.mira > 2000 && N.dificil.mira < N.medio.mira);
  const E = R.novo(Object.assign({}, F[1], { cores: 6 }), 'facil', { rng: sorte(3) });
  for (let i = 0; i < 600; i++) R.passo(E, 1 / 30);
  assert.ok(E.trilhos[0].bolas.every(b => b.c < 4), 'fácil só usa 4 cores');
});

test('encaixe antes ou depois do tijolo atingido, pelo lado do impacto, crescendo em ~120 ms', () => {
  let { E, T } = mesa([0, 1, 2, 3]);
  R.inserir(E, T, 1, true, 4);   // pela frente
  assert.deepEqual(T.bolas.map(b => b.c), [0, 4, 1, 2, 3]);
  assert.equal(T.bolas[1].w, 0);
  rodar(E, 0.06); assert.ok(T.bolas[1].w > 0.3 && T.bolas[1].w < 0.7, 'meio crescido em 60 ms: ' + T.bolas[1].w);
  rodar(E, 0.1); assert.equal(T.bolas[1].w, 1);
  for (let i = 0; i < T.bolas.length - 1; i++) assert.ok(T.bolas[i].s - T.bolas[i + 1].s >= D - 0.5, 'abriu espaço');
  ({ E, T } = mesa([0, 1, 2, 3]));
  R.inserir(E, T, 1, false, 4);  // por trás
  assert.deepEqual(T.bolas.map(b => b.c), [0, 1, 4, 2, 3]);
  // tiro de verdade: o lado vem do produto escalar com a tangente
  ({ E, T } = mesa([0, 1, 2, 3, 0, 1]));
  const b = T.bolas[2]; E.lanc.cor = 4;
  E.tiros.push({ x: b.x + Math.cos(b.a) * 25, y: b.y + Math.sin(b.a) * 25, vx: 0, vy: 0, cor: 4, brechas: 0, passou: [] });
  R.passo(E, 1 / 60);
  assert.deepEqual(T.bolas.map(x => x.c), [0, 1, 4, 2, 3, 0, 1], 'acertou pela frente: entra na frente');
});

test('3 da mesma cor estouram e contam pontos; 2 não', () => {
  let { E, T } = mesa([0, 1, 1, 2, 3]);
  R.inserir(E, T, 1, true, 1);
  const ev = rodar(E, 0.2);
  assert.deepEqual(T.bolas.map(b => b.c), [0, 2, 3]);
  assert.ok(ev.some(e => e.tipo === 'estouro' && e.n === 3));
  assert.equal(E.estourados, 3); assert.equal(E.pontos, 30);
  ({ E, T } = mesa([0, 1, 2, 3]));
  R.inserir(E, T, 1, true, 1); rodar(E, 0.2);
  assert.equal(T.bolas.length, 5); assert.equal(E.pontos, 0);
});

test('ímã: as pontas da mesma cor puxam a fila de volta e o estouro em cadeia vira combo x2, x3', () => {
  // frente → trás: 3, 0, 0, 1, 1, 2, 2, 1, 0, 3, 2, 1
  const { E, T } = mesa([3, 0, 0, 1, 1, 2, 2, 1, 0, 3, 2, 1]);
  R.inserir(E, T, 5, true, 2);   // 2,2,2 estoura → buraco entre 1,1 e 1 → ímã → 1,1,1 estoura (x2) → 0,0 e 0 (x3)
  const ev = rodar(E, 3);
  const est = ev.filter(e => e.tipo === 'estouro');
  assert.deepEqual(est.map(e => e.combo), [1, 2, 3]);
  assert.deepEqual(T.bolas.map(b => b.c), [3, 3, 2, 1]);
  assert.equal(E.maiorCombo, 3);
  assert.equal(E.pontos, 30 + (3 * 10 * 2 + 100) + (3 * 10 * 3 + 150));
  for (let i = 0; i < T.bolas.length - 1; i++) assert.ok(R.ligados(T.bolas, i), 'a fila voltou a ficar junta');
});

test('ímã não puxa quando as pontas têm cores diferentes', () => {
  const { E, T } = mesa([0, 1, 1, 2, 2, 3]);
  R.inserir(E, T, 3, true, 2); rodar(E, 0.2);
  const s0 = T.bolas[0].s; rodar(E, 1);
  assert.deepEqual(T.bolas.map(b => b.c), [0, 1, 1, 3]);
  assert.ok(Math.abs(T.bolas[0].s - s0) < 0.5, 'a frente ficou parada');
});

test('Barra da Obra: cheia = "Obra pronta!", não entra mais tijolo; quebrou tudo = tijolo de ouro e vitória', () => {
  const E = R.novo(F[0], 'facil', { rng: sorte(9) });
  rodar(E, 2);
  const n = E.trilhos[0].bolas.length;
  E.estourados = E.meta - 3;
  const T = E.trilhos[0], k = T.bolas.findIndex(b => R.visivel(T.tab, b.s));
  T.bolas[k].c = 5; T.bolas[k + 1].c = 5; T.bolas[k + 2].c = 5; T.bolas[k + 3].c = 4;
  R.inserir(E, T, k + 1, true, 5);
  const ev = rodar(E, 0.3);
  assert.ok(E.obraPronta); assert.ok(ev.some(e => e.tipo === 'obraPronta'));
  const antes = T.gerados; rodar(E, 3); assert.equal(T.gerados, antes, 'não entra mais tijolo');
  assert.ok(n > 3);
  T.bolas = []; const ev2 = rodar(E, 8);
  assert.ok(ev2.some(e => e.tipo === 'ouro')); assert.equal(E.fim, 'vitoria'); assert.ok(E.bonusOuro > 0);
  assert.ok(R.estrelas(E) >= 1 && R.estrelas(E) <= 3);
});

test('derrota: o primeiro tijolo chega na caçamba e a fila cai toda dentro', () => {
  const E = R.novo(F[1], 'dificil', { rng: sorte(5) });
  let ev = [], t = 0;
  while (!E.fim && t < 400) { ev = ev.concat(R.passo(E, 1 / 30)); t += 1 / 30; }
  assert.equal(E.fim, 'derrota');
  assert.ok(ev.some(e => e.tipo === 'perdendo')); assert.ok(ev.filter(e => e.tipo === 'cai').length > 10);
  assert.ok(E.trilhos.every(T => !T.bolas.length));
  assert.equal(R.estrelas(E), 0);
});

test('perigo: nos últimos 15 % a caçamba abre (perigo de 0 a 1)', () => {
  const { E, T } = mesa([0, 1, 2]);
  T.bolas.forEach((b, i) => { b.s = T.tab.L * 0.8 - i * D; }); R.passo(E, 0.001);
  assert.equal(T.perigo, 0);
  T.bolas.forEach((b, i) => { b.s = T.tab.L * 0.95 - i * D; }); R.passo(E, 0.001);
  assert.ok(T.perigo > 0.5 && T.perigo <= 1);
});

test('portão: troca o caminho só sem fila passando; quem já passou não sai do lugar', () => {
  const E = R.novo(F[3], 'medio', { rng: sorte(11) });
  E.semNovos = true;
  const T = E.trilhos[0], g = E.portoes[0];
  const L0 = T.tab.L;
  T.bolas = [R.novaBola(E, 0, g.ate + 200), R.novaBola(E, 1, 100)];
  R.passo(E, 0.0001);
  const x0 = T.bolas[0].x, y0 = T.bolas[0].y;
  assert.ok(R.portao(E, 0), 'abre com a fila fora do portão');
  assert.ok(g.longo); assert.ok(T.tab.L > L0 + 100, 'caminho mais longo');
  R.passo(E, 0.0001);
  assert.ok(Math.hypot(T.bolas[0].x - x0, T.bolas[0].y - y0) < 3, 'o tijolo que já passou ficou no lugar');
  T.bolas[1].s = g.de + 20; R.passo(E, 0.0001);
  assert.ok(g.travado); assert.equal(R.portao(E, 0), false, 'travado com a fila passando');
});

test('poderes: marreta quebra em volta, ré dá ré, sinal vermelho deixa devagar, prumo dá mira completa', () => {
  const { E, T } = mesa([0, 1, 1, 2, 3, 0, 2, 3]);
  T.bolas[2].poder = 'marreta'; T.bolas[2].tPoder = 15;
  R.inserir(E, T, 1, true, 1);
  const ev = rodar(E, 0.2);
  assert.ok(ev.some(e => e.tipo === 'poder' && e.poder === 'marreta'));
  assert.ok(T.bolas.length <= 4, 'a marreta levou os vizinhos: ' + T.bolas.length);
  const e2 = mesa([0, 1, 1, 2]); e2.T.bolas[1].poder = 're'; e2.T.bolas[1].tPoder = 15; R.inserir(e2.E, e2.T, 1, true, 1); rodar(e2.E, 0.2);
  assert.ok(e2.E.efeitos.re > 0);
  const e3 = mesa([0, 1, 1, 2]); e3.T.bolas[1].poder = 'devagar'; e3.T.bolas[1].tPoder = 15; R.inserir(e3.E, e3.T, 1, true, 1); rodar(e3.E, 0.2);
  assert.ok(e3.E.efeitos.devagar > 0);
  const e4 = mesa([0, 1, 1, 2]); e4.T.bolas[1].poder = 'prumo'; e4.T.bolas[1].tPoder = 15; R.inserir(e4.E, e4.T, 1, true, 1); rodar(e4.E, 0.2);
  assert.ok(e4.E.efeitos.prumo > 0);
});

test('tiro na brecha: passar por um buraco da fila dá bônus', () => {
  const { E, T } = mesa([0, 1, 2]);
  T.bolas.push(R.novaBola(E, 3, T.bolas[2].s - D * 4), R.novaBola(E, 0, T.bolas[2].s - D * 5));
  R.passo(E, 0.0001);
  const s = (T.bolas[2].s + T.bolas[3].s) / 2, p = R.ponto(T.tab, s), nx = -Math.sin(p.a), ny = Math.cos(p.a);
  E.tiros.push({ x: p.x - nx * 80, y: p.y - ny * 80, vx: nx * 1100, vy: ny * 1100, cor: 1, brechas: 0, passou: [] });
  const ev = rodar(E, 1.2);
  assert.ok(ev.some(e => e.tipo === 'brecha' && e.pontos === 100), 'bônus da brecha');
});

test('atirar e trocar: a cor da vez sai, a próxima entra; trocar inverte', () => {
  const { E } = mesa([0, 1, 2, 3]);
  E.lanc.cor = 1; E.lanc.prox = 2;
  R.trocar(E); assert.deepEqual([E.lanc.cor, E.lanc.prox], [2, 1]);
  assert.ok(R.atirar(E, 0)); assert.equal(E.tiros[0].cor, 2); assert.equal(E.lanc.cor, 1);
  assert.equal(R.atirar(E, 0), false, 'espera o intervalo entre tiros');
});
