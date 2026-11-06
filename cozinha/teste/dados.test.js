// Dados da Cozinha: node --test cozinha/teste/*.test.js (rodar da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../dados.js');
const L = require('../logica.js');
const ART = require('../desenhos.js');
const NIVEIS = ['facil', 'medio', 'dificil'];

test('pelo menos 10 receitas, cada uma com nome PT/EN, emoji, cor e ingredientes', () => {
  assert.ok(D.RECEITAS.length >= 10, 'só ' + D.RECEITAS.length + ' receitas');
  const ids = new Set();
  for (const r of D.RECEITAS) {
    assert.ok(!ids.has(r.id), 'receita repetida ' + r.id); ids.add(r.id);
    assert.ok(r.pt && r.en && r.pt !== '' && r.en !== '', r.id + ' sem nome PT/EN');
    assert.ok(r.e && /^#[0-9a-f]{6}$/i.test(r.cor), r.id + ' sem emoji ou cor');
    assert.ok(r.ing.length >= 2, r.id + ': poucos ingredientes');
    for (const x of r.ing) { assert.ok(D.ingrediente[x.id], r.id + ': ingrediente desconhecido ' + x.id); assert.ok(Number.isInteger(x.q) && x.q >= 1, r.id + ': quantidade ruim de ' + x.id); }
    const f = Object.keys(r.facil);
    assert.ok(f.length >= 1 && f.length < r.ing.length, r.id + ': o Fácil precisa ter menos ingredientes que o Médio');
    for (const id of f) {
      const m = r.ing.find(x => x.id === id);
      assert.ok(m, r.id + ': ingrediente do Fácil fora da lista ' + id);
      assert.ok(r.facil[id] >= 1 && r.facil[id] <= m.q, r.id + ': quantidade do Fácil maior que a do Médio em ' + id);
    }
  }
});

test('ingredientes, lugares e utensílios com textos PT e EN e desenho', () => {
  for (const g of D.INGREDIENTES) {
    assert.ok(g.pt.length === 2 && g.en.length === 2 && g.pt.every(Boolean) && g.en.every(Boolean), g.id + ': nome no singular e plural, PT e EN');
    assert.ok(g.e || g.s, g.id + ' sem desenho');
    assert.ok(ART.icone(g.id).length > 10, g.id + ' sem ícone');
    if (g.de) assert.ok(D.lugar[g.de], g.id + ': lugar desconhecido ' + g.de);
    assert.ok(L.lugaresDe(g.id).length >= 1, g.id + ' não se consegue em lugar nenhum');
  }
  for (const l of D.LUGARES) assert.ok(l.pt && l.en && l.faz[0] && l.faz[1] && l.e, l.id);
  for (const u of D.UTENSILIOS) { assert.ok(u.pt && u.en && u.na[0] && u.na[1], u.id); assert.ok(ART.icone(u.id).length > 10, u.id + ' sem ícone'); }
  for (const n of D.NIVEIS) assert.ok(n.pt && n.en && n.txt[0] && n.txt[1], n.id);
  // os lugares pedidos: rio, pomar, horta, galinheiro, vaca, mercado e vizinha
  for (const id of ['rio', 'pomar', 'horta', 'galinheiro', 'vaca', 'mercado', 'vizinha', 'casa']) assert.ok(D.lugar[id], 'falta o lugar ' + id);
});

test('todo ingrediente de toda receita se consegue em algum lugar, em todos os níveis', () => {
  for (const r of D.RECEITAS) for (const n of NIVEIS) {
    for (const x of L.ingredientesDoNivel(r, n)) assert.ok(L.lugaresDe(x.id, n).length >= 1, r.id + '/' + n + ': ' + x.id + ' não se consegue');
  }
});

test('Fácil: poucos ingredientes, que se juntam em no máximo dois lugares', () => {
  for (const r of D.RECEITAS) {
    const ids = L.ingredientesDoNivel(r, 'facil').map(x => x.id);
    assert.ok(ids.length <= 3, r.id + ': Fácil com ' + ids.length + ' ingredientes');
    assert.ok(L.lugaresMinimos(ids) <= 2, r.id + ': Fácil precisa de mais de 2 lugares');
    assert.ok(L.ingredientesDoNivel(r, 'medio').length > ids.length, r.id + ': Médio deveria ter mais ingredientes');
  }
});

test('moedas do Médio e do Difícil dão para tudo que só o mercado vende; Difícil com menos sobra', () => {
  for (const r of D.RECEITAS) {
    assert.equal(L.moedasIniciais(r, 'facil'), 0);
    for (const n of ['medio', 'dificil']) assert.ok(L.moedasIniciais(r, n) >= L.custoSoMercado(r, n), r.id + '/' + n + ': moedas não dão');
    assert.ok(L.moedasIniciais(r, 'dificil') < L.moedasIniciais(r, 'medio'), r.id + ': o Difícil devia ter menos moedas');
  }
  assert.ok(D.nivel.dificil.favores < D.nivel.medio.favores && D.nivel.medio.favores < D.nivel.facil.favores, 'favores diminuem com o nível');
});

test('passos de cada nível: começam lavando as mãos, terminam servindo, ordem da lista é válida, só usam o que tem', () => {
  for (const r of D.RECEITAS) {
    const tamanhos = NIVEIS.map(n => L.passosDoNivel(r, n).length);
    assert.ok(tamanhos[0] <= tamanhos[1] && tamanhos[1] <= tamanhos[2], r.id + ': Difícil devia ter pelo menos tantos passos quanto o Fácil ' + tamanhos);
    for (const n of NIVEIS) {
      const ps = L.passosDoNivel(r, n), tem = new Set(L.ingredientesDoNivel(r, n).map(x => x.id)), usados = new Set();
      assert.ok(ps.length >= 4, r.id + '/' + n + ': poucos passos');
      assert.equal(ps[0].a, 'lavar', r.id + '/' + n + ': o primeiro passo é lavar as mãos');
      assert.equal(ps[ps.length - 1].a, 'servir', r.id + '/' + n + ': o último passo é servir');
      assert.ok(L.ordemValida(ps, ps.map(p => p.id)), r.id + '/' + n + ': a ordem da lista não respeita as dependências');
      const ids = new Set();
      for (const p of ps) {
        assert.ok(!ids.has(p.id), r.id + ': passo repetido ' + p.id); ids.add(p.id);
        assert.ok(D.ACOES.includes(p.a), r.id + ': ação desconhecida ' + p.a);
        assert.ok(D.utensilio[p.u], r.id + ': utensílio desconhecido ' + p.u);
        if (p.em) assert.ok(D.utensilio[p.em], r.id + ': utensílio desconhecido ' + p.em);
        if (p.de) assert.ok(D.utensilio[p.de], r.id + ': utensílio desconhecido ' + p.de);
        if (p.a === 'por') assert.ok(p.ing.length >= 1, r.id + '/' + n + ': passo de pôr sem ingrediente ' + p.id);
        for (const d of p.dep) assert.ok(ids.has(d), r.id + '/' + n + ': ' + p.id + ' depende de um passo que vem depois ou não existe: ' + d);
        for (const i of p.ing) { assert.ok(tem.has(i), r.id + '/' + n + ': ' + p.id + ' usa ' + i + ' que não está no nível'); usados.add(i); }
        const pt = L.textoPasso(p, r, n, false), en = L.textoPasso(p, r, n, true);
        assert.ok(pt && en && pt !== en, r.id + '/' + n + ': texto PT/EN do passo ' + p.id);
        assert.ok(!/undefined|NaN/.test(pt + en), r.id + ': texto quebrado ' + pt + ' / ' + en);
      }
      for (const i of tem) assert.ok(usados.has(i), r.id + '/' + n + ': o ingrediente ' + i + ' é buscado mas não é usado em nenhum passo');
    }
  }
});

test('no Difícil a ordem importa: em várias receitas dá para escolher entre passos, mas nem todo passo vale a qualquer hora', () => {
  let comEscolha = 0;
  for (const r of D.RECEITAS) {
    const ps = L.passosDoNivel(r, 'dificil'), feitos = [];
    let escolha = false;
    for (const p of ps) { if (L.proximos(ps, feitos).length > 1) escolha = true; feitos.push(p.id); }
    if (escolha) comEscolha++;
    // servir nunca pode ser o primeiro
    assert.ok(!L.podeFazer(ps, [ps[0].id], ps[ps.length - 1].id), r.id + ': dá para servir logo depois de lavar as mãos');
  }
  assert.ok(comEscolha >= D.RECEITAS.length / 2, 'poucas receitas com escolha de ordem: ' + comEscolha);
});

test('dica de adulto: faca, fogão, forno e liquidificador avisam', () => {
  for (const id of ['tabua', 'fogao', 'forno', 'liquidificador', 'batedeira']) assert.ok(D.utensilio[id].adulto, id);
});

// ---------- o jogo também ensina: cada coisa vem de onde vem de verdade ----------
// Mapa esperado (escrito aqui, de propósito): lugar da vila e planta de cada fruta e legume, e o tipo da planta.
const ONDE = {
  banana: ['pomar', 'bananeira', 'bananeira'], maca: ['pomar', 'macieira', 'arvore'], laranja: ['pomar', 'laranjeira', 'arvore'],
  limao: ['pomar', 'limoeiro', 'arvore'], morango: ['pomar', 'morangueiro', 'rasteira'], uva: ['pomar', 'parreira', 'parreira'],
  cenoura: ['horta', 'pe-cenoura', 'raiz'], batata: ['horta', 'pe-batata', 'raiz'], tomate: ['horta', 'tomateiro', 'estaca'],
  alface: ['horta', 'pe-alface', 'cabeca'], cheiro: ['horta', 'cheiro-verde', 'touceira'],
  ovo: ['galinheiro'], leite: ['vaca'], peixe: ['rio']
};
// o que é feito pelas pessoas não nasce em lugar nenhum da vila: vem do mercadinho (ou emprestado da vizinha)
const FEITO_PELAS_PESSOAS = ['farinha', 'acucar', 'sal', 'oleo', 'fermento', 'manteiga', 'chocolate', 'leitecond', 'granulado', 'queijo', 'pao', 'polvilho', 'mel'];

test('cada fruta e cada legume nasce na planta certa, e cada coisa vem do lugar certo da vila', () => {
  for (const [id, [lugar, planta, forma]] of Object.entries(ONDE)) {
    const g = D.ingrediente[id];
    assert.equal(g.de, lugar, id + ' devia vir de ' + lugar);
    if (planta) {
      assert.equal(g.planta, planta, id + ' devia nascer em ' + planta);
      assert.ok(D.planta[planta], 'planta desconhecida ' + planta);
      assert.equal(D.planta[planta].lugar, lugar, planta + ' fica em ' + lugar);
      assert.equal(D.planta[planta].forma, forma, planta + ' é desenhada como ' + forma);
      assert.ok(D.planta[planta].pt && D.planta[planta].en, planta + ' sem nome PT/EN');
    } else assert.ok(!g.planta, id + ' não nasce em planta');
  }
  for (const id of FEITO_PELAS_PESSOAS) {
    const g = D.ingrediente[id];
    assert.ok(!g.de && !g.planta, id + ' é feito pelas pessoas: não nasce na natureza (nada de farinha na árvore)');
    assert.ok(g.preco > 0, id + ' se compra no mercadinho');
  }
  // todo ingrediente está numa das duas listas, e toda fruta/legume do pomar e da horta tem planta
  for (const g of D.INGREDIENTES) {
    assert.ok(ONDE[g.id] || FEITO_PELAS_PESSOAS.includes(g.id), 'ingrediente novo sem lugar conferido no teste: ' + g.id);
    if (g.de === 'pomar' || g.de === 'horta') assert.ok(g.planta, g.id + ' sem planta');
  }
  // o legume que cresce embaixo da terra é só cenoura e batata
  assert.deepEqual(D.PLANTAS.filter(p => p.forma === 'raiz').map(p => p.id).sort(), ['pe-batata', 'pe-cenoura']);
});

test('cada ingrediente tem uma frase curta que ensina de onde vem (PT e EN), e a da banana fala da bananeira', () => {
  for (const g of D.INGREDIENTES) {
    assert.ok(Array.isArray(g.fato) && g.fato[0] && g.fato[1] && g.fato[0] !== g.fato[1], g.id + ' sem frase PT/EN');
    assert.ok(g.fato[0].length <= 90 && g.fato[1].length <= 90, g.id + ': frase comprida demais para criança');
  }
  assert.match(D.ingrediente.banana.fato[0], /cachos na bananeira/); assert.match(D.ingrediente.banana.fato[1], /banana plant/);
  assert.match(D.ingrediente.cenoura.fato[0], /embaixo da terra/);
  assert.match(D.ingrediente.farinha.fato[0], /trigo/);
});

test('desenhos: toda planta do pomar e da horta tem desenho, e cada planta do pomar tem lugar para as frutas', () => {
  for (const p of D.PLANTAS.filter(p => p.lugar === 'pomar')) {
    assert.match(ART.planta(p.id), /^<svg[^>]*viewBox="0 0 100 125"/, p.id + ' sem desenho');
    assert.ok(ART.FRUTOS[p.id].length >= 2, p.id + ' com poucas frutas');
    for (const [x, y] of ART.FRUTOS[p.id]) assert.ok(x > 0 && x < 100 && y > 0 && y < 115, p.id + ': fruta fora do desenho');
  }
  for (const g of D.INGREDIENTES.filter(g => g.de === 'horta')) assert.match(ART.horta(g.id), /^<svg/, g.id + ' sem desenho na horta');
  assert.match(ART.planta('bananeira'), /#7b2d5b/, 'a bananeira tem o coração roxo');
  assert.match(ART.fruto('banana'), /<svg/, 'banana no cacho é uma penca desenhada');
});

test('pescaria: o círculo do anzol diminui e os peixes ficam mais rápidos do Fácil para o Difícil', () => {
  const [f, m, d] = ['facil', 'medio', 'dificil'].map(n => D.nivel[n]);
  assert.ok(f.zonaPeixe > m.zonaPeixe && m.zonaPeixe > d.zonaPeixe, 'círculo menor a cada nível');
  assert.ok(d.zonaPeixe <= 0.06, 'no Difícil precisa acertar a hora');
  assert.ok(f.zonaPeixe >= 0.12, 'no Fácil continua fácil');
  assert.ok(f.velPeixe < m.velPeixe && m.velPeixe < d.velPeixe, 'peixes mais rápidos a cada nível');
});
