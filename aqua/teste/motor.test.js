// Testes do motor do AQUA (regras, gerador e resolvedor): node --test aqua/teste/*.test.js (rodar da raiz do repositório kids)
// O principal: TODA fase gerada tem solução. Aqui 400 fases de cada nível são geradas e JOGADAS até o fim, jogada por
// jogada, pelas mesmas regras do jogo (inclusive com os frascos embaçados).
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../motor.js');

const FASES = 400;

// joga o caminho inteiro no estado de jogo (com frascos embaçados a cor de cima pode passar em pedaços: repete a jogada)
function jogar(est, passos) {
  let jogadas = 0;
  for (const [de, para] of passos) {
    const esperado = M.escrito(M.depois(est.frascos, est.cap, de, para));
    for (let vez = 0; M.escrito(est.frascos) !== esperado; vez++) {
      assert.ok(vez < est.cap, 'a jogada ' + de + '→' + para + ' não termina');
      assert.ok(M.despejar(est, de, para), 'jogada do resolvedor que o jogo não aceita: ' + de + '→' + para);
      jogadas++;
    }
  }
  return jogadas;
}

test('regras do despejo: só em frasco vazio ou em cima da mesma cor, só o que cabe, e a cor de cima vai junta', () => {
  const est = { cap: 4, frascos: [[0, 1, 1], [2, 1], [], [3, 3, 3, 3], [0, 2, 2, 2]], vistos: null };
  assert.equal(M.quantoDespeja(est, 0, 1), 2, 'duas camadas iguais vão juntas');
  assert.equal(M.quantoDespeja(est, 0, 2), 2, 'frasco vazio aceita');
  assert.equal(M.quantoDespeja(est, 1, 0), 1, 'só cabe uma');
  assert.equal(M.quantoDespeja(est, 0, 4), 0, 'frasco cheio não aceita');
  assert.equal(M.quantoDespeja(est, 4, 1), 0, 'cor diferente não aceita');
  assert.equal(M.quantoDespeja(est, 2, 0), 0, 'frasco vazio não despeja');
  assert.equal(M.quantoDespeja(est, 0, 0), 0, 'nele mesmo não');
  assert.equal(M.quantoDespeja(est, 3, 2), 0, 'frasco pronto está fechado');
  const r = M.despejar(est, 0, 1);
  assert.deepEqual(r, { q: 2, cor: 1, revelou: false, fechou: false });
  assert.deepEqual(est.frascos[0], [0]); assert.deepEqual(est.frascos[1], [2, 1, 1, 1]);
  assert.equal(M.despejar(est, 4, 1), null);
  assert.ok(M.pronto([3, 3, 3, 3], 4)); assert.ok(!M.pronto([3, 3, 3], 4)); assert.ok(!M.pronto([3, 3, 3, 1], 4));
  assert.ok(!M.venceu(est));
  assert.ok(M.venceu({ cap: 2, frascos: [[1, 1], [], [0, 0]] }));
  assert.ok(M.temJogada(est));
  assert.ok(!M.temJogada({ cap: 2, frascos: [[0, 1], [1, 0]] }), 'tudo cheio e nada combina: travou');
});

test('fechar um frasco: a jogada avisa quando ele fica cheio de uma cor só', () => {
  const est = { cap: 3, frascos: [[1, 0], [0, 0], []], vistos: null };
  assert.equal(M.despejar(est, 0, 1).fechou, true);
});

test('frasco embaçado: só a camada de cima à vista; passa só o pedaço à vista e revela a de baixo', () => {
  const est = M.novoEstado({ cap: 4, frascos: [[2, 1, 1, 1], [0, 0, 0, 2], [], []], cobertos: [0] });
  assert.deepEqual(est.vistos[0], [false, false, false, true]);
  assert.deepEqual(est.vistos[1], [true, true, true, true]);
  assert.equal(M.quantoDespeja(est, 0, 2), 1, 'as iguais de baixo estão escondidas: vai uma só');
  let r = M.despejar(est, 0, 2);
  assert.equal(r.q, 1); assert.equal(r.revelou, true);
  assert.deepEqual(est.vistos[0], [false, false, true]);
  r = M.despejar(est, 0, 2); assert.equal(r.revelou, true);
  r = M.despejar(est, 0, 2); assert.equal(r.revelou, true, 'apareceu a última');
  assert.deepEqual(est.frascos[2], [1, 1, 1]); assert.deepEqual(est.vistos[2], [true, true, true]);
  assert.deepEqual(est.vistos[0], [true]);
});

test('resolvedor: acha o caminho, e diz quando não existe', () => {
  const r = M.resolver([[0, 1, 0], [1, 0, 1], [], []], 3);
  assert.ok(r.passos && r.passos.length > 0);
  const est = { cap: 3, frascos: [[0, 1, 0], [1, 0, 1], [], []], vistos: null };
  jogar(est, r.passos); assert.ok(M.venceu(est));
  const sem = M.resolver([[0, 1], [1, 0]], 2);
  assert.equal(sem.passos, null); assert.equal(sem.esgotou, false, 'provou que não tem solução');
  assert.deepEqual(M.resolver([[0, 0], [1, 1], []], 2).passos, [], 'já resolvido');
  assert.equal(M.plano({ cap: 2, frascos: [[0, 1], [1, 0]] }), null);
});

test('dificuldade: as fases vão ficando mais difíceis (mais cores, frascos maiores, menos vazio, mais embaçados)', () => {
  for (const nivel of M.NIVEIS) {
    let antes = M.config(nivel, 1);
    for (let f = 2; f <= 200; f++) {
      const c = M.config(nivel, f);
      assert.ok(c.cores >= antes.cores, nivel + ' ' + f + ': cores diminuíram');
      assert.ok(c.cap >= antes.cap, nivel + ' ' + f + ': frasco diminuiu');
      assert.ok(c.cobertos >= antes.cobertos, nivel + ' ' + f + ': menos embaçados');
      assert.ok(c.cores <= M.MAX_CORES && c.vazios >= 1 && c.vazios <= 2);
      antes = c;
    }
  }
  const f1 = M.config('facil', 1), fN = M.config('facil', 100), m1 = M.config('medio', 1), mN = M.config('medio', 100), d1 = M.config('dificil', 1), dN = M.config('dificil', 100);
  assert.deepEqual([f1.cores, fN.cores, f1.cap, f1.cobertos, fN.cobertos], [3, 5, 3, 0, 0], 'fácil: 3 a 5 cores, sem embaçado');
  assert.deepEqual([m1.cores, mN.cores, m1.cap, m1.cobertos, mN.cobertos], [5, 8, 4, 0, 2], 'médio: 5 a 8 cores, embaçados aos poucos');
  assert.deepEqual([d1.cores, dN.cores, d1.cap, dN.cap], [8, 12, 4, 5], 'difícil: 8 a 12 cores, frascos de 4 e depois 5 camadas');
  assert.ok(d1.cobertos >= 2 && dN.cobertos === 3);
  assert.ok(m1.cores >= fN.cores && d1.cores >= mN.cores, 'cada nível começa onde o anterior termina');
  let aperto = 0; for (let f = 1; f <= 18; f++) if (M.config('dificil', f).vazios === 1) aperto++;
  assert.ok(aperto >= 2, 'difícil tem fases com um frasco vazio só');
});

for (const nivel of M.NIVEIS) {
  test(nivel + ': ' + FASES + ' fases geradas, todas com solução (jogadas até o fim, com os frascos embaçados)', () => {
    let tentMax = 0, jogMax = 0, embacadas = 0;
    for (let f = 1; f <= FASES; f++) {
      const g = M.gerar(nivel, f), cfg = M.config(nivel, f);
      assert.ok(g.tentativas > 0, nivel + ' ' + f + ': caiu na fase de reserva');
      tentMax = Math.max(tentMax, g.tentativas);
      // o que a fase tem que ter
      assert.equal(g.frascos.length, cfg.cores + cfg.vazios);
      assert.deepEqual([g.cap, g.cores, g.vazios, g.cobertos.length], [cfg.cap, cfg.cores, cfg.vazios, cfg.cobertos]);
      const conta = new Array(cfg.cores).fill(0);
      for (const fr of g.frascos) { assert.ok(fr.length === 0 || fr.length === cfg.cap); for (const c of fr) conta[c]++; }
      assert.ok(conta.every(n => n === cfg.cap), nivel + ' ' + f + ': cada cor enche exatamente um frasco');
      assert.ok(!g.frascos.some(fr => M.pronto(fr, g.cap)), nivel + ' ' + f + ': nenhum frasco já começa pronto');
      for (const i of g.cobertos) assert.ok(g.frascos[i].length === g.cap, 'embaçado só em frasco cheio');
      // a prova: resolver e jogar a solução inteira pelas regras do jogo
      const est = M.novoEstado(g);
      assert.ok(!M.venceu(est));
      const plano = M.plano(est);
      assert.ok(plano, nivel + ' ' + f + ': sem solução');
      jogMax = Math.max(jogMax, jogar(est, plano));
      assert.ok(M.venceu(est), nivel + ' ' + f + ': a solução não termina a fase');
      if (g.cobertos.length) embacadas++;
    }
    if (nivel === 'facil') assert.equal(embacadas, 0); else assert.ok(embacadas > FASES / 2);
    assert.ok(jogMax < 400, 'solução comprida demais: ' + jogMax);
  });
}

test('a fase N é sempre a mesma (o sorteio sai do nível e do número da fase) e fases vizinhas são diferentes', () => {
  for (const nivel of M.NIVEIS) {
    for (const f of [1, 7, 22, 40]) assert.deepEqual(M.gerar(nivel, f), M.gerar(nivel, f));
    assert.notDeepEqual(M.gerar(nivel, 5).frascos, M.gerar(nivel, 6).frascos);
  }
  assert.notDeepEqual(M.gerar('medio', 3).frascos, M.gerar('dificil', 3).frascos);
});

test('gerar é rápido o bastante para o celular (300 fases de cada nível)', () => {
  for (const nivel of M.NIVEIS) {
    let pior = 0;
    for (let f = 1; f <= 300; f++) { const t0 = process.hrtime.bigint(); M.gerar(nivel, f); pior = Math.max(pior, Number(process.hrtime.bigint() - t0) / 1e6); }
    assert.ok(pior < 2500, nivel + ': uma fase levou ' + Math.round(pior) + ' ms');
  }
});

test('dica: o caminho leva até o fim sem ir e voltar, de qualquer ponto do jogo', () => {
  const sorteio = M.semente(99);
  for (const nivel of M.NIVEIS) for (const f of [1, 8, 16, 23, 37]) {
    const est = M.novoEstado(M.gerar(nivel, f));
    // umas jogadas quaisquer (permitidas) antes de pedir a dica
    for (let n = 0; n < 6; n++) {
      const pode = [];
      for (let i = 0; i < est.frascos.length; i++) for (let j = 0; j < est.frascos.length; j++) if (M.quantoDespeja(est, i, j)) pode.push([i, j]);
      if (!pode.length) break;
      const p = pode[Math.floor(sorteio() * pode.length)]; M.despejar(est, p[0], p[1]);
    }
    const plano = M.plano(est);
    if (!plano) continue;                       // as jogadas à toa podem ter estragado a fase: aí a dica avisa
    const vistas = new Set([M.escrito(est.frascos)]);
    for (const p of plano) {
      const esperado = M.escrito(M.depois(est.frascos, est.cap, p[0], p[1]));
      while (M.escrito(est.frascos) !== esperado) assert.ok(M.despejar(est, p[0], p[1]));
      assert.ok(!vistas.has(esperado), nivel + ' ' + f + ': a dica voltou para uma arrumação que já tinha passado');
      vistas.add(esperado);
    }
    assert.ok(M.venceu(est));
  }
});

test('➕ frasco extra e 🔀 embaralhar: a fase continua com solução; frascos prontos não mudam', () => {
  const sorteio = M.semente(5);
  for (const nivel of M.NIVEIS) for (let f = 1; f <= 60; f++) {
    const est = M.novoEstado(M.gerar(nivel, f)), plano = M.plano(est);
    // joga até fechar o primeiro frasco, depois embaralha
    let fechado = -1;
    for (const p of plano) {
      const esperado = M.escrito(M.depois(est.frascos, est.cap, p[0], p[1]));
      while (M.escrito(est.frascos) !== esperado) { const r = M.despejar(est, p[0], p[1]); if (r.fechou) fechado = p[1]; }
      if (fechado >= 0) break;
    }
    const pronto = est.frascos[fechado].slice(), n = est.frascos.length, gotas = est.frascos.reduce((a, b) => a + b.length, 0);
    assert.equal(M.frascoExtra(est), n); assert.equal(est.frascos.length, n + 1); assert.equal(est.extras, 1);
    assert.ok(M.embaralhar(est, sorteio), nivel + ' ' + f + ': não embaralhou');
    assert.deepEqual(est.frascos[fechado], pronto, 'o frasco pronto ficou como estava');
    assert.equal(est.frascos.reduce((a, b) => a + b.length, 0), gotas, 'nenhuma gota sumiu');
    assert.equal(est.vistos.length, est.frascos.length);
    for (const i of est.cobertos) if (est.frascos[i].length && i !== fechado) assert.deepEqual(est.vistos[i], est.frascos[i].map((c, k) => k === est.frascos[i].length - 1), 'embaçado continua embaçado');
    const depois = M.plano(est);
    assert.ok(depois || M.venceu(est), nivel + ' ' + f + ': embaralhou para uma arrumação sem solução');
    if (depois) { jogar(est, depois); assert.ok(M.venceu(est)); }
  }
});

test('copiar: a cópia não mexe no original (é o que o ↩️ desfazer guarda)', () => {
  const est = M.novoEstado(M.gerar('medio', 20)), c = M.copiar(est), p = M.plano(est)[0];
  M.despejar(est, p[0], p[1]);
  assert.notDeepEqual(c.frascos, est.frascos);
  assert.deepEqual(c.frascos, M.gerar('medio', 20).frascos);
});
