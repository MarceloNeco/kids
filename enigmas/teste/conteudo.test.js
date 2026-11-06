// Enigmas de Ligar — o conteúdo (rodadas.js) está certo? Rodar da raiz do kids: node --test enigmas/teste/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../rodadas.js');
const J = require('../jogo.js');

const PARES = { facil: [3, 4], medio: [5, 5], dificil: [6, 7] };
const LINGUAS = ['pt', 'en'];
const todas = n => R[n].map(c => J.rodada(c, n));
const nomeR = r => r.nivel + ' "' + r.dica.pt + '" (' + r.pares.map(p => p[0].pt).join(', ') + ')';

test('três níveis, cada um com pelo menos 30 rodadas em cada língua', () => {
  assert.deepEqual(R.NIVEIS, ['facil', 'medio', 'dificil']);
  for (const n of R.NIVEIS) for (const l of LINGUAS) {
    const q = J.lista(R, n, l).length;
    assert.ok(q >= 30, n + ' em ' + l + ' tem só ' + q + ' rodadas');
  }
});

test('número de pares de cada nível: Fácil 3–4, Médio 5, Difícil 6–7', () => {
  for (const n of R.NIVEIS) for (const r of todas(n)) {
    const q = r.pares.length;
    assert.ok(q >= PARES[n][0] && q <= PARES[n][1], nomeR(r) + ' tem ' + q + ' pares');
  }
});

test('dentro de cada nível a dificuldade só sobe (menos pares primeiro)', () => {
  for (const n of R.NIVEIS) for (const l of LINGUAS) {
    const q = J.lista(R, n, l).map(r => r.pares.length);
    for (let i = 1; i < q.length; i++) assert.ok(q[i] >= q[i - 1], n + '/' + l + ': rodada ' + (i + 1) + ' tem menos pares que a anterior');
  }
});

test('cada par escrito certo: "item = item", com uma língua de cada lado da barra', () => {
  for (const n of R.NIVEIS) for (const c of R[n]) {
    assert.equal(typeof c[0], 'string');
    assert.equal(c[0].replace(/^(pt|en):/, '').split('|').length, 2, 'pista sem as duas línguas: ' + c[0]);
    for (const p of c.slice(1)) {
      assert.equal(p.split(' = ').length, 2, 'par mal escrito: ' + p);
      for (const lado of p.split(' = ')) {
        assert.ok(/^\S+ [^|]+\|[^|]+$/.test(lado.trim()), 'item mal escrito: "' + lado + '"');
      }
    }
  }
});

test('PT e EN presentes em toda pista e todo item', () => {
  for (const n of R.NIVEIS) for (const r of todas(n)) {
    assert.ok(r.dica.pt && r.dica.en, 'pista sem tradução: ' + nomeR(r));
    for (const p of r.pares) for (const it of p) {
      assert.ok(it.pt.length > 0 && it.en.length > 0, 'item sem as duas línguas em ' + nomeR(r) + ': ' + JSON.stringify(it));
      assert.ok(it.e || it.pt, 'item vazio');
    }
  }
});

test('nenhum item repetido numa rodada (desenho, palavra em PT ou em EN), então só existe um jeito de ligar', () => {
  for (const n of R.NIVEIS) for (const r of todas(n)) {
    const itens = r.pares.flat();
    for (const campo of ['e', 'pt', 'en']) {
      const vals = itens.map(it => it[campo].toLowerCase()).filter(Boolean);
      const rep = vals.filter((v, i) => vals.indexOf(v) !== i);
      assert.deepEqual(rep, [], nomeR(r) + ': repetido (' + campo + ')');
    }
    // cada lado tem itens diferentes e nenhum item da esquerda aparece na direita
    const esq = r.pares.map(p => p[0].pt.toLowerCase()), dir = r.pares.map(p => p[1].pt.toLowerCase());
    assert.equal(new Set(esq).size, esq.length); assert.equal(new Set(dir).size, dir.length);
    for (const e of esq) assert.ok(!dir.includes(e), nomeR(r) + ': "' + e + '" nos dois lados');
  }
});

test('nenhuma rodada repetida dentro do nível (nem com os pares em outra ordem)', () => {
  for (const n of R.NIVEIS) {
    const rs = todas(n), ids = rs.map(r => r.id);
    assert.equal(new Set(ids).size, ids.length, n + ': código de rodada repetido');
    const assinaturas = rs.map(r => (r.so || '') + r.pares.map(p => p[0].pt + '=' + p[1].pt).sort().join('/'));
    const rep = assinaturas.filter((a, i) => assinaturas.indexOf(a) !== i);
    assert.deepEqual(rep, [], n + ': rodada repetida');
  }
});

test('rimas: as rodadas só de uma língua existem nas duas (troca uma pela outra)', () => {
  for (const n of R.NIVEIS) {
    const rs = todas(n);
    assert.equal(rs.filter(r => r.so === 'pt').length, rs.filter(r => r.so === 'en').length, n + ': rimas em PT e EN não batem');
  }
  assert.ok(todas('dificil').some(r => r.so === 'pt'), 'Difícil deve ter rimas em português');
});

test('emojis só até a versão 11 do Unicode (aparecem no tablet Fire e em celular antigo)', () => {
  // faixas que entraram no Unicode 12 ou depois (tabela oficial do Emoji 12–15)
  const NOVAS = [[0x1FA70, 0x1FAFF], [0x1F7E0, 0x1F7FF], [0x1F90C, 0x1F90F], [0x1F93F, 0x1F93F], [0x1F971, 0x1F972], [0x1F977, 0x1F979],
    [0x1F97B, 0x1F97B], [0x1F9A3, 0x1F9AF], [0x1F9BA, 0x1F9BF], [0x1F9C3, 0x1F9CF], [0x1F6D5, 0x1F6DF], [0x1F6FA, 0x1F6FF]];
  for (const n of R.NIVEIS) for (const r of todas(n)) for (const it of r.pares.flat()) {
    for (const ch of it.e) {
      const cp = ch.codePointAt(0);
      assert.ok(!NOVAS.some(([a, b]) => cp >= a && cp <= b), nomeR(r) + ': emoji novo demais ' + it.e + ' (U+' + cp.toString(16) + ')');
    }
  }
});
