// Testes do motor do Campo Minado: node --test campo-minado/teste/*.test.js (rodar da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const CM = require('../campo.js');

// monta um tabuleiro com os ouriços onde o teste quiser
function montar(linhas, colunas, minas) {
  const e = CM.criar(linhas, colunas, minas.length);
  minas.forEach(i => { e.cel[i].mina = true; });
  CM.contar(e); e.plantado = true;
  return e;
}

test('três níveis: Fácil, Médio e Difícil, com tamanho, ouriços e densidade certos', () => {
  assert.deepEqual(CM.ORDEM, ['facil', 'medio', 'dificil']);
  const esperado = { facil: [8, 8, 10], medio: [10, 14, 25], dificil: [12, 20, 50] };
  for (const n of CM.ORDEM) {
    const [curto, longo, minas] = esperado[n];
    const emPe = CM.doNivel(n, false), deitado = CM.doNivel(n, true);
    assert.equal(emPe.linhas, longo); assert.equal(emPe.colunas, curto);
    assert.equal(deitado.linhas, curto); assert.equal(deitado.colunas, longo);
    assert.equal(emPe.cel.length, curto * longo); assert.equal(emPe.minas, minas);
    assert.ok(minas <= curto * longo - 9, 'sobra lugar para o primeiro toque seguro');
  }
  // cada nível é mais difícil que o anterior (mais ouriços, mais casas e mais ouriço por casa)
  assert.ok(CM.NIVEIS.facil.minas < CM.NIVEIS.medio.minas && CM.NIVEIS.medio.minas < CM.NIVEIS.dificil.minas);
  const dens = n => CM.NIVEIS[n].minas / (CM.NIVEIS[n].curto * CM.NIVEIS[n].longo);
  assert.ok(dens('facil') >= 0.15 && dens('facil') <= 0.17, 'Fácil ~16%: ' + dens('facil'));
  assert.ok(dens('medio') >= 0.17 && dens('medio') <= 0.19, 'Médio ~18% (perto do clássico): ' + dens('medio'));
  assert.ok(dens('dificil') >= 0.20 && dens('dificil') <= 0.22, 'Difícil ~21% (como o Expert clássico): ' + dens('dificil'));
  assert.ok(dens('facil') < dens('medio') && dens('medio') < dens('dificil'));
  // só o Fácil guarda as oito casas em volta do primeiro toque
  assert.deepEqual(CM.ORDEM.map(n => CM.doNivel(n, false).emVolta), [true, false, false]);
  assert.throws(() => CM.doNivel('impossivel'));
});

test('primeiro toque nunca acorda ouriço: no Fácil livra as 3 × 3 casas, no Médio e no Difícil só a casa tocada', () => {
  const vizinhaComOurico = { medio: 0, dificil: 0 };
  for (const n of CM.ORDEM) for (const deitado of [false, true]) for (let s = 1; s <= 200; s++) {
    const e = CM.doNivel(n, deitado), rng = CM.semente(s * 7919);
    const lugares = [0, e.colunas - 1, e.cel.length - 1, e.cel.length - e.colunas, Math.floor(e.cel.length / 2) + Math.floor(e.colunas / 2)];
    const i = lugares[s % lugares.length];
    const r = CM.abrir(e, i, rng);
    assert.equal(r.explodiu, false);
    assert.equal(e.cel.filter(c => c.mina).length, e.minas, 'número certo de ouriços');
    assert.equal(e.cel[i].mina, false);
    assert.equal(e.abertas, r.abertas.length);
    if (n === 'facil') {
      for (const v of CM.vizinhos(e, i)) assert.equal(e.cel[v].mina, false, 'Fácil: vizinha do primeiro toque sem ouriço');
      assert.equal(e.cel[i].n, 0, 'Fácil: o primeiro toque cai numa casa sem número');
      assert.ok(r.abertas.length >= CM.vizinhos(e, i).length + 1, 'Fácil: abriu um pedacinho');
    } else if (CM.vizinhos(e, i).some(v => e.cel[v].mina)) vizinhaComOurico[n]++;
  }
  // regra clássica: no Médio e no Difícil as vizinhas podem ter ouriço (e muitas vezes têm)
  assert.ok(vizinhaComOurico.medio > 100, 'Médio: vizinhas com ouriço em ' + vizinhaComOurico.medio + ' de 400');
  assert.ok(vizinhaComOurico.dificil > 100, 'Difícil: vizinhas com ouriço em ' + vizinhaComOurico.dificil + ' de 400');
});

// quanto do jardim o primeiro toque abre, em média, tocando num lugar qualquer (300 sementes por nível e posição)
function mediaPrimeiroToque(n) {
  let soma = 0, soUma = 0, N = 0;
  for (const deitado of [false, true]) for (let s = 1; s <= 300; s++) {
    const e = CM.doNivel(n, deitado), rng = CM.semente(s * 2654435761 + (deitado ? 1 : 0));
    const i = Math.floor(rng() * e.cel.length);
    const r = CM.abrir(e, i, rng);
    soma += r.abertas.length / e.cel.length; if (r.abertas.length === 1) soUma++; N++;
  }
  return { media: soma / N, soUma: soUma / N };
}
test('primeiro toque no Médio e no Difícil abre em média no máximo 25% do jardim (600 jogos cada)', () => {
  const linhas = [];
  for (const n of CM.ORDEM) {
    const m = mediaPrimeiroToque(n);
    linhas.push(n + ': abre em média ' + (m.media * 100).toFixed(1) + '% · só a casa tocada em ' + (m.soUma * 100).toFixed(0) + '%');
    if (n !== 'facil') {
      assert.ok(m.media <= 0.25, n + ' abre demais: ' + m.media);
      assert.ok(m.soUma >= 0.5, n + ': o primeiro toque muitas vezes mostra só um número');
    } else assert.ok(m.media < 0.5, 'Fácil abre um pedacinho, não o jardim todo: ' + m.media);
  }
  console.log('# ' + linhas.join('\n# '));
});

test('tabuleiro pequeno demais: guarda pelo menos a casa tocada', () => {
  const e = CM.criar(3, 3, 8);
  const r = CM.abrir(e, 4, CM.semente(3));
  assert.equal(r.explodiu, false); assert.equal(e.cel[4].mina, false);
  assert.equal(e.cel.filter(c => c.mina).length, 8);
  assert.equal(e.fim, 'ganhou', 'só sobrou a casa tocada: ganhou');
});

test('vizinhos: canto tem 3, borda 5, meio 8', () => {
  const e = CM.criar(4, 5, 0);
  assert.equal(CM.vizinhos(e, 0).length, 3);
  assert.equal(CM.vizinhos(e, 2).length, 5);
  assert.equal(CM.vizinhos(e, 6).length, 8);
  assert.deepEqual(CM.vizinhos(e, 0).sort((a, b) => a - b), [1, 5, 6]);
});

test('números contam os ouriços em volta (com diagonais)', () => {
  // 4x4, ouriços em 0 e 5 e 15
  // M 2 1 0
  // 2 M 1 0
  // 1 1 2 1
  // 0 0 1 M
  const e = montar(4, 4, [0, 5, 15]);
  assert.deepEqual(e.cel.map(c => c.mina ? 'M' : c.n), ['M', 2, 1, 0, 2, 'M', 1, 0, 1, 1, 2, 1, 0, 0, 1, 'M']);
  const so = montar(3, 3, [4]);
  assert.deepEqual(so.cel.map((c, i) => i === 4 ? 'M' : c.n), [1, 1, 1, 1, 'M', 1, 1, 1, 1]);
});

test('enchente: casa vazia abre as vizinhas e para nos números', () => {
  // 5x5 com um muro de ouriços na coluna 2 (linhas 0..4): a enchente do lado esquerdo não passa
  const e = montar(5, 5, [2, 7, 12, 17, 22]);
  const r = CM.abrir(e, 0);
  const abertas = r.abertas.sort((a, b) => a - b);
  assert.deepEqual(abertas, [0, 1, 5, 6, 10, 11, 15, 16, 20, 21], 'abre só o lado esquerdo do muro');
  assert.ok(abertas.every(i => !e.cel[i].mina));
  assert.equal(e.fim, null);
  // casa com número abre só ela
  const e2 = montar(3, 3, [8]);
  assert.deepEqual(CM.abrir(e2, 4).abertas, [4]);
  // enchente não abre casa com bandeirinha
  const e3 = montar(3, 4, [11]);
  CM.bandeira(e3, 1);
  const r3 = CM.abrir(e3, 0);
  assert.ok(!r3.abertas.includes(1)); assert.equal(e3.cel[1].aberta, false);
});

test('ganhar: abriu tudo o que não é ouriço → ganhou e os ouriços ganham bandeirinha', () => {
  const e = montar(5, 5, [0]);
  const r = CM.abrir(e, 24);
  assert.equal(r.abertas.length, 24);
  assert.equal(e.fim, 'ganhou');
  assert.equal(e.cel[0].bandeira, true); assert.equal(CM.restantes(e), 0);
  // depois do fim, nada mais muda
  assert.deepEqual(CM.abrir(e, 0).abertas, []); assert.equal(CM.bandeira(e, 0), false);
  // ganhar abrindo uma por uma
  const e2 = montar(2, 2, [3]);
  CM.abrir(e2, 0); assert.equal(e2.fim, null);
  CM.abrir(e2, 1); assert.equal(e2.fim, null);
  CM.abrir(e2, 2); assert.equal(e2.fim, 'ganhou');
});

test('ganhar num nível de verdade, abrindo todas as casas sem ouriço', () => {
  for (const n of CM.ORDEM) {
    const e = CM.doNivel(n, false), rng = CM.semente(11);
    CM.abrir(e, 0, rng);
    e.cel.forEach((c, i) => { if (!c.mina) CM.abrir(e, i); });
    assert.equal(e.fim, 'ganhou', n);
    assert.equal(e.abertas, e.cel.length - e.minas);
  }
});

test('perder: abrir um ouriço acorda ele e marca as bandeirinhas erradas', () => {
  const e = montar(3, 3, [8]);
  CM.bandeira(e, 0);
  const r = CM.abrir(e, 8);
  assert.equal(r.explodiu, true); assert.equal(e.fim, 'perdeu'); assert.equal(e.explodiu, 8);
  assert.equal(e.cel[0].errada, true);
  assert.equal(CM.bandeira(e, 1), false, 'depois de perder não marca mais');
});

test('bandeirinha: põe, tira, conta o que falta e protege a casa', () => {
  const e = montar(3, 3, [8]);
  assert.equal(CM.restantes(e), 1);
  assert.equal(CM.bandeira(e, 8), true); assert.equal(e.cel[8].bandeira, true); assert.equal(CM.restantes(e), 0);
  assert.deepEqual(CM.abrir(e, 8), { abertas: [], explodiu: false }, 'casa com bandeirinha não abre');
  assert.equal(CM.bandeira(e, 8), true); assert.equal(e.cel[8].bandeira, false); assert.equal(CM.restantes(e), 1);
  CM.abrir(e, 4);
  assert.equal(CM.bandeira(e, 4), false, 'casa aberta não leva bandeirinha');
});

test('acorde: número com as bandeirinhas certas abre as vizinhas; errado acorda o ouriço', () => {
  // 3x3, ouriço em 0: o 4 (meio) vale 1
  const e = montar(3, 3, [0]);
  CM.abrir(e, 4);
  assert.deepEqual(CM.acorde(e, 4).abertas, [], 'sem bandeirinha, nada');
  CM.bandeira(e, 0);
  const r = CM.acorde(e, 4);
  assert.equal(r.explodiu, false);
  assert.equal(e.fim, 'ganhou');
  // bandeirinha no lugar errado: o acorde acorda o ouriço
  const e2 = montar(3, 3, [0]);
  CM.abrir(e2, 4); CM.bandeira(e2, 2);
  const r2 = CM.acorde(e2, 4);
  assert.equal(r2.explodiu, true); assert.equal(e2.fim, 'perdeu'); assert.equal(e2.cel[2].errada, true);
});

// monta um tabuleiro a partir de um desenho (M = ouriço) e abre as casas da lista
function quadro(linhas, abertas) {
  const C = linhas[0].length, minas = [];
  linhas.forEach((l, r) => [...l].forEach((ch, c) => { if (ch === 'M') minas.push(r * C + c); }));
  const e = montar(linhas.length, C, minas);
  abertas.forEach(i => { assert.equal(e.cel[i].mina, false); e.cel[i].aberta = true; e.abertas++; });
  return e;
}
test('dica: deduzir acha as gramas seguras e os ouriços só pelos números (regras de um número só)', () => {
  // índices 3 × 3:   0 1 2 / 3 4 5 / 6 7 8      ouriço no 0; abertas 1, 3, 4, 6, 7, 8; fechadas 0, 2, 5
  // o 3 vale 1 e só tem o 0 fechado em volta → 0 é ouriço (regra 2);
  // o 1 vale 1 e já tem esse ouriço → as outras gramas dele, 2 e 5, são seguras (regra 1)
  const a = quadro(['M..', '...', '...'], [1, 3, 4, 6, 7, 8]);
  assert.deepEqual([a.cel[1].n, a.cel[3].n, a.cel[4].n], [1, 1, 1]);
  assert.deepEqual(CM.deduzir(a), { seguras: [2, 5], minas: [0] });

  // só um ouriço fechado em volta de todo mundo: é ouriço e não sobra grama segura
  const b = quadro(['M..', '...', '...'], [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(CM.deduzir(b), { seguras: [], minas: [0] });

  // sem certeza, nada pisca: 3 × 4 com ouriço no 0, abertas só as linhas de baixo da esquerda
  //   0 1 2 3 / 4 5 6 7 / 8 9 10 11  → o 4 vale 1 (fechadas 0, 1) e o 5 vale 1 (fechadas 0, 1, 2, 6): ninguém garante nada
  const c = quadro(['M...', '....', '....'], [4, 5, 8, 9, 10, 11]);
  assert.deepEqual([c.cel[4].n, c.cel[5].n], [1, 1]);
  assert.deepEqual(CM.deduzir(c), { seguras: [], minas: [] });

  // em cadeia: ouriços no 0 e no 1; abertas a linha do meio e a de baixo
  //   o 4 vale 2 com só 0 e 1 fechados → os dois são ouriço; o 5 vale 2 → o 2 é seguro; o 6 vale 1 → o 3 é seguro
  const d = quadro(['MM..', '....', '....'], [4, 5, 6, 7, 8, 9, 10, 11]);
  assert.deepEqual([d.cel[4].n, d.cel[5].n, d.cel[6].n], [2, 2, 1]);
  assert.deepEqual(CM.deduzir(d), { seguras: [2, 3], minas: [0, 1] });
  // grama com bandeirinha não pisca
  CM.bandeira(d, 3);
  assert.deepEqual(CM.deduzir(d).seguras, [2]);
  // bandeirinha errada da criança não engana a dica (as bandeirinhas não entram na conta)
  CM.bandeira(d, 3); CM.bandeira(d, 2);
  assert.deepEqual(CM.deduzir(d), { seguras: [3], minas: [0, 1] });

  // antes do primeiro toque e depois do fim, não há dica
  assert.deepEqual(CM.deduzir(CM.doNivel('facil', false)), { seguras: [], minas: [] });
  const f = montar(3, 3, [8]); CM.abrir(f, 8);
  assert.deepEqual(CM.deduzir(f), { seguras: [], minas: [] });
});

test('dica: em jogos de verdade, o que ela diz é sempre certo', () => {
  let algumaVez = 0;
  for (let s = 1; s <= 300; s++) {
    const e = CM.doNivel('facil', false), rng = CM.semente(s);
    CM.abrir(e, Math.floor(rng() * 64), rng);
    // joga seguindo a dica até ela não ter mais nada a dizer
    for (let passo = 0; passo < 64 && !e.fim; passo++) {
      const d = CM.deduzir(e);
      d.minas.forEach(i => assert.equal(e.cel[i].mina, true, 'semente ' + s + ': ouriço deduzido errado'));
      d.seguras.forEach(i => assert.equal(e.cel[i].mina, false, 'semente ' + s + ': grama segura com ouriço'));
      if (!d.seguras.length) break;
      algumaVez++;
      CM.abrir(e, d.seguras[0]);
      assert.notEqual(e.fim, 'perdeu');
    }
  }
  assert.ok(algumaVez > 300, 'a dica tem o que dizer na maioria dos jogos do Fácil: ' + algumaVez);
});

test('semente: mesma semente, mesmo jardim', () => {
  const a = CM.doNivel('dificil', false), b = CM.doNivel('dificil', false);
  CM.abrir(a, 50, CM.semente(42)); CM.abrir(b, 50, CM.semente(42));
  assert.deepEqual(a.cel.map(c => c.mina), b.cel.map(c => c.mina));
  const r = CM.semente(1); for (let k = 0; k < 1000; k++) { const x = r(); assert.ok(x >= 0 && x < 1); }
});
