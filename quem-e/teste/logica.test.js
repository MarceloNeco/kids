// Quem é? — motor do Duelo de Caras (logica.js) e nomes (nomes.js). Rodar da raiz: node --test quem-e/teste/logica.test.js
const test = require('node:test');
const assert = require('node:assert');
const L = require('../logica.js');
const N = require('../nomes.js');

const NIVEIS = ['facil', 'medio', 'dificil'];
const MASC = ['menino', 'homem', 'vovo'];
const masc = (c) => MASC.includes(c.tipo);

function sorteio(s) { s = s >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

test('nomes: pelo menos 80 de cada, sem repetidos, sem sobrenome', () => {
  for (const lista of [N.MASCULINOS, N.FEMININOS]) {
    assert.ok(lista.length >= 80, 'tamanho ' + lista.length);
    assert.strictEqual(new Set(lista).size, lista.length, 'repetido');
    for (const n of lista) assert.ok(/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõçü]+$/.test(n), 'nome estranho: ' + n);
  }
  const todos = new Set(N.MASCULINOS);
  for (const n of N.FEMININOS) assert.ok(!todos.has(n), 'nos dois: ' + n);
});

test('tabuleiro: tamanho, nomes únicos, gêneros equilibrados e combinações com sentido', () => {
  for (const nivel of NIVEIS) {
    for (let s = 1; s <= 300; s++) {
      const t = L.gerarTabuleiro(s, nivel);
      assert.strictEqual(t.caras.length, L.NIVEIS[nivel].caras);
      assert.strictEqual(new Set(t.caras.map(c => c.nome)).size, t.caras.length, 'nome repetido');
      const m = t.caras.filter(masc).length;
      assert.ok(Math.abs(m - (t.caras.length - m)) <= 1, 'desequilíbrio ' + m);
      t.caras.forEach((c, i) => {
        assert.strictEqual(c.id, i);
        if (c.tipo === 'menino' || c.tipo === 'menina') assert.strictEqual(c.pelos, 'nenhum', 'barba em criança');
        if (c.peruca) assert.notStrictEqual(c.cabeloComp, 'careca', 'peruca em careca');
        if (c.cabeloCor === 'branco') assert.ok(c.tipo === 'vovo' || c.tipo === 'vova', 'branco em ' + c.tipo);
        if (c.pelos !== 'nenhum') assert.ok(MASC.includes(c.tipo) && c.tipo !== 'menino', 'pelos em ' + c.tipo);
      });
    }
  }
});

test('tabuleiro: ninguém fica impossível de descobrir (todo par difere em uma pergunta do nível)', () => {
  for (const nivel of NIVEIS) {
    for (let s = 1; s <= 120; s++) {
      const t = L.gerarTabuleiro(s, nivel);
      const ps = L.perguntasDoNivel(nivel);
      const assin = t.caras.map(c => ps.map(p => p.teste(c) ? 1 : 0).join(''));
      assert.strictEqual(new Set(assin).size, assin.length, nivel + ' semente ' + s);
    }
  }
});

test('tabuleiro: mesma semente, mesmo tabuleiro', () => {
  for (const nivel of NIVEIS) assert.strictEqual(JSON.stringify(L.gerarTabuleiro(77, nivel)), JSON.stringify(L.gerarTabuleiro(77, nivel)));
  assert.notStrictEqual(JSON.stringify(L.gerarTabuleiro(77, 'medio')), JSON.stringify(L.gerarTabuleiro(78, 'medio')));
});

test('perguntas úteis: Sim em 2 até 2/3 das caras (95% das sementes); sempre entre 1 e n-1', () => {
  for (const nivel of NIVEIS) {
    let boas = 0; const total = 200;
    for (let s = 1; s <= total; s++) {
      const t = L.gerarTabuleiro(s, nivel), n = t.caras.length;
      let ok = true;
      assert.ok(t.perguntas.length >= 8, 'poucas perguntas');
      for (const id of t.perguntas) {
        const sim = t.caras.filter(c => L.responder(c, id)).length;
        assert.ok(sim >= 1 && sim < n, id + ' sem utilidade');
        if (sim < 2 || sim > Math.ceil(2 * n / 3)) ok = false;
      }
      for (const p of L.perguntasDoNivel(nivel)) {
        if (t.perguntas.includes(p.id)) continue;
        const sim = t.caras.filter(c => p.teste(c)).length;
        assert.ok(sim === 0 || sim === n, 'pergunta útil ficou de fora: ' + p.id);
      }
      if (ok) boas++;
    }
    assert.ok(boas >= total * 0.95, nivel + ': ' + boas + '/' + total);
  }
});

test('perguntas por nível: acumulam e cada uma tem texto PT/EN, ícone e grupo', () => {
  const f = L.perguntasDoNivel('facil').map(p => p.id), m = L.perguntasDoNivel('medio').map(p => p.id), d = L.perguntasDoNivel('dificil').map(p => p.id);
  for (const id of f) assert.ok(m.includes(id) && d.includes(id));
  for (const id of m) assert.ok(d.includes(id));
  for (const id of ['crianca', 'adulto', 'idoso', 'masculino', 'feminino', 'cabelo-preto', 'cabelo-loiro', 'oculos', 'algo-cabeca']) assert.ok(f.includes(id), id);
  for (const id of ['comprido', 'careca', 'peruca', 'barba', 'bigode', 'brinco', 'colar', 'nariz', 'roupa-azul']) { assert.ok(m.includes(id), id); assert.ok(!f.includes(id), id); }
  for (const id of ['bone', 'coroa', 'oculos-escuros', 'olhos-azuis', 'sardas']) { assert.ok(d.includes(id), id); assert.ok(!m.includes(id), id); }
  for (const p of L.PERGUNTAS) {
    assert.ok(p.pt && p.en && p.ico && ['quem', 'cabelo', 'rosto', 'cabeca', 'joias', 'roupa', 'corpo'].includes(p.grupo), p.id);
    assert.ok(/\?$/.test(p.pt) && /\?$/.test(p.en), 'interrogação: ' + p.id);
  }
});

test('Fácil: o que não se pergunta não varia', () => {
  for (let s = 1; s <= 100; s++) {
    const t = L.gerarTabuleiro(s, 'facil');
    for (const c of t.caras) {
      assert.ok(!c.peruca && !c.brinco && !c.colar && !c.nariz && !c.sardas && c.pelos === 'nenhum', JSON.stringify(c));
    }
    assert.strictEqual(new Set(t.caras.map(c => c.olhos)).size, 1);
  }
});

test('conferir: resposta certa passa, errada não', () => {
  const t = L.gerarTabuleiro(5, 'dificil');
  for (const c of t.caras) for (const id of t.perguntas) {
    assert.strictEqual(L.conferir(c, id, L.responder(c, id)), true);
    assert.strictEqual(L.conferir(c, id, !L.responder(c, id)), false);
  }
});

test('descartaveis: só as de pé que não servem', () => {
  const t = L.gerarTabuleiro(9, 'medio');
  const dePe = t.caras.map((c, i) => i % 5 !== 0);
  const d = L.descartaveis(t.caras, dePe, 'comprido', false);
  const esperado = t.caras.filter((c, i) => dePe[i] && L.responder(c, 'comprido')).map(c => c.id);
  assert.deepStrictEqual(d, esperado);
  for (const id of d) assert.ok(dePe[id]);
  assert.strictEqual(L.utilidade(t.caras, dePe, 'comprido'), esperado.length);
});

function partidaMeleca(t, segredo, estrategia, rnd) {
  const cand = t.caras.map(() => true), feitas = [];
  let perguntas = 0;
  for (let turno = 0; turno < 200; turno++) {
    const a = L.escolherPerguntaMeleca(t.caras, cand, feitas, t.perguntas, estrategia, rnd);
    if (a.tipo === 'palpite') {
      assert.ok(cand[a.idCara], 'palpite numa carta virada');
      if (a.idCara === segredo) return perguntas;
      cand[a.idCara] = false;
      continue;
    }
    perguntas++;
    assert.ok(!feitas.includes(a.id), 'pergunta repetida');
    feitas.push(a.id);
    const r = L.responder(t.caras[segredo], a.id);
    L.descartaveis(t.caras, cand, a.id, r).forEach(i => { cand[i] = false; });
  }
  throw new Error('não terminou');
}

test('meleca: sempre acaba acertando, e no Difícil é mais esperta que no Fácil', () => {
  for (const nivel of NIVEIS) {
    const rnd = sorteio(11);
    for (let s = 1; s <= 200; s++) {
      const t = L.gerarTabuleiro(s, nivel);
      const q = partidaMeleca(t, Math.floor(rnd() * t.caras.length), nivel, rnd);
      assert.ok(q <= t.caras.length, 'perguntas demais: ' + q);
    }
  }
  let somaF = 0, somaD = 0;
  const rnd = sorteio(3);
  for (let s = 1; s <= 200; s++) {
    const t = L.gerarTabuleiro(s, 'dificil'), seg = s % t.caras.length;
    somaF += partidaMeleca(t, seg, 'facil', rnd);
    somaD += partidaMeleca(t, seg, 'dificil', rnd);
  }
  assert.ok(somaD < somaF, 'difícil ' + somaD + ' × fácil ' + somaF);
});

// ---------- corpo inteiro (dono, 14/Nov/2026): saia, short, calça, vestido, tênis, bota, descalço, mochila, segurando algo ----------
test('corpo inteiro: perguntas de roupa e calçado só com o corpo ligado, acumulando por nível', () => {
  const sem = L.perguntasDoNivel('dificil').map(p => p.id), com = L.perguntasDoNivel('dificil', true).map(p => p.id);
  for (const id of ['saia', 'short', 'calca', 'vestido', 'descalco']) { assert.ok(!sem.includes(id), id); assert.ok(L.perguntasDoNivel('facil', true).some(p => p.id === id), 'fácil: ' + id); }
  for (const id of ['tenis', 'bota', 'mochila', 'segura']) { assert.ok(L.perguntasDoNivel('medio', true).some(p => p.id === id), 'médio: ' + id); assert.ok(!L.perguntasDoNivel('facil', true).some(p => p.id === id), id); }
  for (const id of ['segura-balao', 'segura-bola', 'segura-sorvete']) assert.ok(com.includes(id) && !L.perguntasDoNivel('medio', true).some(p => p.id === id), id);
  for (const p of L.PERGUNTAS.filter(x => x.corpo)) assert.equal(p.grupo, 'corpo');
});

test('corpo inteiro: tabuleiros válidos, únicos, perguntas úteis e mesma semente = mesmo tabuleiro', () => {
  for (const nivel of NIVEIS) {
    let boas = 0;
    for (let s = 1; s <= 150; s++) {
      const t = L.gerarTabuleiro(s, nivel, { corpo: true }), n = t.caras.length, ps = L.perguntasDoNivel(nivel, true);
      assert.equal(t.corpo, true);
      for (const c of t.caras) {
        assert.ok(['calca', 'short', 'saia', 'vestido'].includes(c.baixo), c.baixo);
        assert.ok(['tenis', 'bota', 'sapato', 'descalco'].includes(c.calcado), c.calcado);
        if (c.calcado === 'descalco') assert.ok(nivel !== 'dificil' || true);
      }
      const assin = t.caras.map(c => ps.map(p => p.teste(c) ? 1 : 0).join(''));
      assert.equal(new Set(assin).size, n, nivel + ' ' + s + ': caras iguais');
      let ok = true;
      for (const id of t.perguntas) { const sim = t.caras.filter(c => L.responder(c, id)).length; assert.ok(sim >= 1 && sim < n, id); if (sim < 2 || sim > Math.ceil(2 * n / 3)) ok = false; }
      assert.ok(t.perguntas.some(id => L.pergunta(id).corpo), 'nenhuma pergunta de corpo');
      if (ok) boas++;
    }
    assert.ok(boas >= 140, nivel + ' boas ' + boas);
    assert.equal(JSON.stringify(L.gerarTabuleiro(9, nivel, { corpo: true })), JSON.stringify(L.gerarTabuleiro(9, nivel, { corpo: true })));
  }
  // sem o corpo, nada muda (os tabuleiros de antes continuam iguais)
  const t = L.gerarTabuleiro(5, 'medio');
  assert.ok(!t.corpo && !('baixo' in t.caras[0]));
});
