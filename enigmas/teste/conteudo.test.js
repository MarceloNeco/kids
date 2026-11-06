// Enigmatic — o conteúdo (rodadas.js) está certo? Rodar da raiz do kids: node --test enigmas/teste/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../rodadas.js');
const J = require('../jogo.js');

const PARES = { facil: [3, 4], medio: [5, 7], dificil: [4, 4] };
const MINIMO = { facil: 30, medio: 30, dificil: 40 };
const LINGUAS = ['pt', 'en'];
const todas = n => R[n].map(c => J.rodada(c, n));
const nomeR = r => r.nivel + ' "' + r.dica.pt + '" (' + r.pares.map(p => p[0].pt).join(', ') + ')';

test('três níveis: Fácil e Médio com pelo menos 30 rodadas em cada língua, Difícil com pelo menos 40', () => {
  assert.deepEqual(R.NIVEIS, ['facil', 'medio', 'dificil']);
  for (const n of R.NIVEIS) for (const l of LINGUAS) {
    const q = J.lista(R, n, l).length;
    assert.ok(q >= MINIMO[n], n + ' em ' + l + ' tem só ' + q + ' rodadas');
  }
});

test('número de pares de cada nível: Fácil 3–4, Médio 5–7, Difícil exatamente 4', () => {
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
  assert.ok(todas('medio').some(r => r.so === 'pt'), 'Médio deve ter rimas em português (vieram do Difícil antigo)');
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

// v0.3.0: as rodadas do Difícil antigo (6 e 7 pares) foram para o Médio, e o Médio antigo continua lá. O código de
// cada rodada vem do conteúdo, então ele é o mesmo de antes (só troca "dificil-" por "medio-"): o progresso guardado
// no aparelho é levado junto (J.migrar).
const MEDIO_ANTIGO = ['1q8ugsf', '1fjx0tt', 'qioygr', '1bmg0wp', 'jtxk6a', '10ch2yi', '1mb7x26', 'zn3rul', '1mxkrls', 'urapif', 'jq2p6l',
  '10o5cw3', 'iwgsd4', 'pr4n8u', '1jh9dxc', '3kjt84', '1tghkru', '10nmt4', 'mzcqxg', 'wcmocm', '1lnqhxn', '73vtwg', 'nq3k0l', '1ecxhd',
  '3tf75q', '1jhdsa6', 'pi8ozb', '3leyik', '1y8iw2f', '1w51pja', '1a0btfg', 'h7gysp', '18cfz41'];
const DIFICIL_ANTIGO = ['n2ejoc', '1cxtgc2', 'dzzxvz', '1gt23s9', '1koempy', '112nhcx', 'shhskj', '1b0e76h', '1bnjf7h', '5qoxya', '1toqlvg',
  '1wq0u0z', '1c7y4io', '1nbxttk', '1d9p7ec', '1ytt8p7', 'esf3nh', 'axmfe7', 'y9e89o', '1qdqjfa', '47d68q', 'iow3sc', 'dsd9mu', 'i6fjta',
  '1ijdld', '1sis6na', '1lp6t3', 'gzgn7e', 'tisvla', '17efc00', 'xounw3', '10s9iox', 'dxbqhe', '1wiwucf', 'uqojva', 'upjg2l', '14icjo1'];
test('Médio tem as rodadas que já eram dele e todas as do Difícil antigo, com o mesmo código', () => {
  const medio = todas('medio').map(r => r.id), dificil = todas('dificil').map(r => r.id);
  for (const h of MEDIO_ANTIGO.concat(DIFICIL_ANTIGO)) assert.ok(medio.includes('medio-' + h), 'falta no Médio: ' + h);
  assert.equal(medio.length, MEDIO_ANTIGO.length + DIFICIL_ANTIGO.length);
  for (const h of DIFICIL_ANTIGO) assert.ok(!dificil.includes('dificil-' + h), 'rodada antiga ainda no Difícil: ' + h);
});

// Matemática do Difícil: o teste refaz cada conta. R.CONTAS (no rodadas.js) guarda, para cada carta da esquerda com
// conta, a conta em JavaScript; ela tem de dar o número da carta da direita em PT e em EN.
const numeros = s => (s.match(/\d+(?:[.,]\d+)?/g) || []).map(x => +x.replace(',', '.'));
const fazer = expr => Function('"use strict"; return (' + expr + ');')();
const ROMANOS = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
const romano = s => [...s].reduce((t, c, i, a) => t + (ROMANOS[c] < (ROMANOS[a[i + 1]] || 0) ? -ROMANOS[c] : ROMANOS[c]), 0);
test('matemática do Difícil: toda conta confere (refeita aqui), em PT e EN', () => {
  let contas = 0; const usadas = new Set();
  for (const r of todas('dificil')) {
    const comConta = r.pares.filter(p => R.CONTAS[p[0].pt] !== undefined);
    if (comConta.length) assert.equal(comConta.length, r.pares.length, nomeR(r) + ': rodada de contas com carta sem conta no R.CONTAS');
    for (const [esq, dir] of r.pares) {
      const ehNumero = /^(R\$ )?\d/.test(dir.pt);
      if (!ehNumero) { assert.equal(R.CONTAS[esq.pt], undefined, nomeR(r) + ': conta para carta que não é número'); continue; }
      assert.ok(R.CONTAS[esq.pt] !== undefined, nomeR(r) + ': "' + esq.pt + '" = ' + dir.pt + ' sem conta no R.CONTAS');
      const valor = fazer(R.CONTAS[esq.pt]); usadas.add(esq.pt); contas++;
      const certo = v => Math.abs(v - valor) < 1e-9;
      assert.ok(certo(numeros(dir.pt)[0]), esq.pt + ' dá ' + valor + ', não ' + dir.pt);
      assert.ok(certo(numeros(dir.en)[0]), esq.en + ' dá ' + valor + ', não ' + dir.en);
      assert.deepEqual(numeros(esq.pt), numeros(esq.en), 'números diferentes em PT e EN: ' + esq.pt + ' / ' + esq.en);
      // quando a própria carta é uma conta (7 × 8, 6², 1000 − 1) ou número romano, faz a conta direto do texto também
      const t = esq.pt.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/(\d+)²/g, '($1*$1)');
      if (/^[\d\s+\-*/().]+$/.test(t)) assert.ok(certo(fazer(t)), 'o texto "' + esq.pt + '" não dá ' + valor);
      if (/^[IVXLCDM]+$/.test(esq.pt)) assert.equal(romano(esq.pt), valor, esq.pt + ' não é ' + valor);
    }
    // cada resultado só aparece uma vez na rodada (um só jeito de ligar)
    const vals = r.pares.filter(p => R.CONTAS[p[0].pt] !== undefined).map(p => fazer(R.CONTAS[p[0].pt]));
    assert.equal(new Set(vals).size, vals.length, nomeR(r) + ': duas contas com o mesmo resultado');
  }
  assert.ok(contas >= 60, 'só ' + contas + ' contas');
  assert.deepEqual(Object.keys(R.CONTAS).filter(k => !usadas.has(k)), [], 'contas no R.CONTAS que nenhuma carta usa');
});

test('Difícil mistura os temas (contas, ciências, palavras, adivinhas e "complete a dupla")', () => {
  const pistas = todas('dificil').map(r => r.dica.pt);
  const tem = re => pistas.filter(p => re.test(p)).length;
  assert.ok(tem(/Tabuada|Divis|Fra|Porcent|Problem|vem depois|romanos|tempo|troco|quadrado|Medidas|Conta|Dobro/) >= 12, 'contas');
  assert.ok(tem(/Planeta|Órgão|bicho|Plantas|Fotoss|Ímã|corpo|inventou|acontece|céu|Sólido|Instrumentos|campeões|natureza|Terra|Cadeia|vive|reconhecer|Para que/i) >= 12, 'ciências');
  assert.ok(tem(/Coletivos|Sinônimos|Opostos|Expressões/) >= 8, 'palavras');
  assert.ok(tem(/O que é, o que é/) >= 3 && tem(/Complete a dupla/) >= 3, 'adivinhas e analogias');
});
