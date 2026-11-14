// Regras da Cozinha (cesta, moedas, favores, ordem dos passos): node --test cozinha/teste/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../dados.js');
const L = require('../logica.js');

test('cesta: soma, tira, mostra o que falta e sabe quando está completa', () => {
  const precisa = [{ id: 'ovo', q: 3 }, { id: 'farinha', q: 2 }];
  const c = {};
  assert.deepEqual(L.faltando(precisa, c).map(r => [r.id, r.falta]), [['ovo', 3], ['farinha', 2]]);
  L.por(c, 'ovo'); L.por(c, 'ovo', 2); L.por(c, 'farinha');
  assert.equal(c.ovo, 3);
  assert.deepEqual(L.faltando(precisa, c).map(r => [r.id, r.falta]), [['farinha', 1]]);
  assert.equal(L.completa(precisa, c), false);
  L.por(c, 'farinha'); L.por(c, 'banana');   // coisa a mais não atrapalha
  assert.equal(L.completa(precisa, c), true);
  L.tirar(c, 'ovo');
  assert.equal(L.completa(precisa, c), false);
  assert.deepEqual(L.resumo(precisa, c), [{ id: 'ovo', precisa: 3, tem: 2, falta: 1 }, { id: 'farinha', precisa: 2, tem: 2, falta: 0 }]);
  L.tirar(c, 'banana'); assert.ok(!('banana' in c), 'zero some da cesta');
});

test('quantidades por nível: Fácil usa as do Fácil, Médio e Difícil as completas', () => {
  const r = D.receita['bolo-cenoura'];
  assert.equal(L.quantidade(r, 'facil', 'ovo'), 2);
  assert.equal(L.quantidade(r, 'medio', 'ovo'), 3);
  assert.equal(L.quantidade(r, 'facil', 'fermento'), 0);
  assert.equal(L.nomeQtd('ovo', 1, false), '1 ovo'); assert.equal(L.nomeQtd('ovo', 3, false), '3 ovos');
  assert.equal(L.nomeQtd('farinha', 2, true), '2 cups of flour');
});

test('lugares: onde achar cada coisa e os lugares que ainda ajudam', () => {
  assert.deepEqual(L.lugaresDe('peixe'), ['rio']);
  assert.deepEqual(L.lugaresDe('ovo'), ['galinheiro', 'mercado', 'vizinha']);
  assert.deepEqual(L.lugaresDe('fermento'), ['mercado']);
  assert.equal(L.lugaresMinimos(['peixe', 'batata']), 2);
  assert.equal(L.lugaresMinimos(['ovo', 'farinha']), 1);
  const u = L.lugaresUteis([{ id: 'ovo', q: 1 }, { id: 'peixe', q: 1 }], { ovo: 1 });
  assert.deepEqual(Object.keys(u), ['rio']);
});

test('moedas: de 5, 2 e 1, troco certo e compra no mercado', () => {
  assert.deepEqual(L.moedasPara(13), [5, 5, 2, 1]);
  assert.deepEqual(L.moedasPara(0), []);
  assert.equal(L.soma(L.moedasPara(17)), 17);
  assert.equal(L.troco(5, 3), 2); assert.equal(L.troco(3, 3), 0); assert.equal(L.troco(2, 3), -1);
  // Fácil: grátis
  let e = { moedas: 0, cesta: {} };
  assert.deepEqual(L.comprar(e, 'fermento', 'facil'), { ok: true, troco: 0, preco: 0 });
  assert.equal(e.cesta.fermento, 1);
  // Médio: paga com moedas e recebe troco
  e = { moedas: 7, cesta: {} };
  const r = L.comprar(e, 'leitecond', 'medio', 5);
  assert.deepEqual(r, { ok: true, troco: 2, preco: 3 });
  assert.equal(e.moedas, 4); assert.equal(e.cesta.leitecond, 1);
  assert.equal(L.comprar(e, 'leitecond', 'medio', 2).motivo, 'pouco');
  assert.equal(L.comprar(e, 'leitecond', 'medio', 9).motivo, 'sem-moedas');
  e.moedas = 1;
  assert.equal(L.comprar(e, 'leitecond', 'medio').motivo, 'sem-moedas');
  assert.equal(e.cesta.leitecond, 1, 'compra que não deu não põe nada na cesta');
  assert.equal(L.comprar(e, 'peixe', 'medio').motivo, 'nao-vende');
});

test('sem moedas para o que só o mercado tem: aparece o jeito de ajudar o Seu Zé', () => {
  const precisa = [{ id: 'leitecond', q: 1 }, { id: 'ovo', q: 1 }];
  assert.equal(L.precisaAjudar({ moedas: 1, cesta: {} }, precisa, 'medio'), true);
  assert.equal(L.precisaAjudar({ moedas: 3, cesta: {} }, precisa, 'medio'), false);
  assert.equal(L.precisaAjudar({ moedas: 0, cesta: {} }, precisa, 'facil'), false);
  assert.equal(L.precisaAjudar({ moedas: 0, cesta: { leitecond: 1 } }, precisa, 'medio'), false);
});

test('favores da vizinha: limitados, um de cada vez e só chega na cesta depois do obrigado', () => {
  const e = { favores: 2, cesta: {}, pendente: null };
  assert.equal(L.pedirFavor(e, 'peixe').motivo, 'nao-tem');
  assert.ok(L.pedirFavor(e, 'farinha').ok);
  assert.equal(e.cesta.farinha, undefined, 'ainda não agradeceu');
  assert.equal(L.pedirFavor(e, 'ovo').motivo, 'pendente');
  assert.deepEqual(L.agradecer(e), { ok: true, id: 'farinha' });
  assert.equal(e.cesta.farinha, 1); assert.equal(e.favores, 1);
  assert.equal(L.agradecer(e).ok, false, 'obrigado sem pedido não dá nada');
  L.pedirFavor(e, 'ovo'); L.agradecer(e);
  assert.equal(e.favores, 0);
  assert.equal(L.pedirFavor(e, 'ovo').motivo, 'sem-favor');
});

test('imprevisto do Difícil: leva só o que dá para buscar de novo de graça', () => {
  for (const r of D.RECEITAS) {
    const precisa = L.ingredientesDoNivel(r, 'dificil'), cesta = {};
    precisa.forEach(x => { cesta[x.id] = x.q; });
    for (const s of [0, 0.3, 0.6, 0.99]) {
      const id = L.imprevisto(precisa, cesta, () => s);
      if (id === null) { assert.ok(!precisa.some(x => D.ingrediente[x.id].de), r.id + ': devia ter imprevisto'); continue; }
      assert.ok(D.ingrediente[id].de, r.id + ': o imprevisto levou ' + id + ', que não se acha de graça');
    }
  }
  assert.equal(L.imprevisto([{ id: 'fermento', q: 1 }], { fermento: 1 }), null);
});

test('ordem dos passos: dependências, próximos possíveis e ordens válidas ou não', () => {
  const r = D.receita['vitamina'], ps = L.passosDoNivel(r, 'dificil');
  assert.deepEqual(ps.map(p => p.id), ['lavar', 'gelarL', 'cortar', 'liq', 'bater', 'servir']);
  assert.deepEqual(L.proximos(ps, []), ['lavar']);
  assert.deepEqual(L.proximos(ps, ['lavar']).sort(), ['cortar', 'gelarL']);
  assert.equal(L.podeFazer(ps, ['lavar', 'cortar'], 'liq'), false, 'o leite ainda não gelou');
  assert.deepEqual(L.faltamAntes(ps, ['lavar', 'cortar'], 'liq'), ['gelarL']);
  assert.equal(L.podeFazer(ps, ['lavar'], 'lavar'), false, 'passo feito não se faz de novo');
  assert.ok(L.ordemValida(ps, ['lavar', 'cortar', 'gelarL', 'liq', 'bater', 'servir']));
  assert.ok(L.ordemValida(ps, ['lavar', 'gelarL', 'cortar', 'liq', 'bater', 'servir']));
  assert.ok(!L.ordemValida(ps, ['lavar', 'cortar', 'liq', 'gelarL', 'bater', 'servir']));
  assert.ok(!L.ordemValida(ps, ['cortar', 'lavar', 'gelarL', 'liq', 'bater', 'servir']));
  assert.ok(!L.ordemValida(ps, ['lavar']), 'ordem incompleta');
  assert.equal(L.proximoNaOrdem(ps, ['lavar']), 'gelarL');
  assert.equal(L.proximoNaOrdem(ps, ps.map(p => p.id)), null);
  // no Fácil o passo de gelar o leite (só do Difícil) some e a dependência se ajusta
  const pf = L.passosDoNivel(r, 'facil');
  assert.deepEqual(pf.map(p => p.id), ['lavar', 'cortar', 'liq', 'bater', 'servir']);
  assert.deepEqual(pf.find(p => p.id === 'liq').dep, ['cortar']);
});

test('passos que dependem de ingredientes do nível somem quando o ingrediente não está', () => {
  const r = D.receita['pao-queijo'];
  const f = L.passosDoNivel(r, 'facil').map(p => p.id), m = L.passosDoNivel(r, 'medio').map(p => p.id);
  for (const id of ['panela', 'ligar', 'desligar', 'escaldar']) { assert.ok(!f.includes(id), 'Fácil não devia ter ' + id); assert.ok(m.includes(id), 'Médio devia ter ' + id); }
});

test('estrelas: 3 sem erros, menos com muitos erros ou se ficou de noite, nunca menos de 1', () => {
  assert.equal(L.estrelas({ erros: 0 }), 3);
  assert.equal(L.estrelas({ erros: 2 }), 3);
  assert.equal(L.estrelas({ erros: 3 }), 2);
  assert.equal(L.estrelas({ erros: 6 }), 1);
  assert.equal(L.estrelas({ erros: 0, atrasou: true }), 2);
  assert.equal(L.estrelas({ erros: 20, atrasou: true }), 1);
});

test('família à mesa (v0.8.0): a receita serve 2; mais gente multiplica as quantidades e as moedas; o nível limita quantos', () => {
  const r = D.receita['bolo-cenoura'];
  assert.equal(L.fatorDe(1), 1); assert.equal(L.fatorDe(2), 1); assert.equal(L.fatorDe(3), 2); assert.equal(L.fatorDe(4), 2); assert.equal(L.fatorDe(6), 3);
  assert.equal(L.quantidade(r, 'medio', 'ovo', 2), 6, '4 pessoas: o dobro de ovos');
  assert.deepEqual(L.ingredientesDoNivel(r, 'facil', 1), L.ingredientesDoNivel(r, 'facil'));
  assert.ok(L.moedasIniciais(r, 'medio', 2) > L.moedasIniciais(r, 'medio', 1), 'mais gente, mais moedas');
  assert.ok(L.moedasIniciais(r, 'dificil', 3) >= L.custoSoMercado(r, 'dificil', 3), 'as moedas dão para tudo');
  assert.equal(L.maxPessoas('facil'), 2); assert.equal(L.maxPessoas('medio'), 4); assert.equal(L.maxPessoas('dificil'), 6);
  // "eu" sempre; no Fácil só mais uma pessoa (a nova entra no lugar da outra)
  assert.deepEqual(L.alternarPessoa(['eu'], 'mamae', 'facil'), ['eu', 'mamae']);
  assert.deepEqual(L.alternarPessoa(['eu', 'mamae'], 'papai', 'facil'), ['eu', 'papai']);
  assert.deepEqual(L.alternarPessoa(['eu', 'mamae', 'papai'], 'mamae', 'medio'), ['eu', 'papai'], 'tocar de novo tira');
  assert.deepEqual(L.alternarPessoa(['eu', 'mamae'], 'eu', 'medio'), ['eu', 'mamae'], 'eu não sai');
  let l = ['eu']; for (const id of ['mamae', 'papai', 'vovo-a', 'vovo-o', 'irmao', 'irma']) l = L.alternarPessoa(l, id, 'dificil');
  assert.equal(l.length, 6); assert.equal(l[0], 'eu');
  // o texto do passo mostra a quantidade das porções
  const p = L.passosDoNivel(r, 'medio').find(x => x.id === 'liq');
  assert.match(L.textoPasso(p, r, 'medio', false, 2), /6 ovos/);
  for (const f of D.FAMILIA) assert.ok(f.pt && f.en && /^#[0-9a-f]{6}$/i.test(f.cor) && f.cabelo, f.id);
});
