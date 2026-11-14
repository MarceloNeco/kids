// Padaria, feira e jaboticabeira (v0.10.0, pedido do dono de 14/Nov/2026):
// - a Padaria do Seu Joaquim vende pão, leite, queijo e manteiga; a Feira da Dona Rosa vende frutas e legumes;
//   as duas funcionam como o mercadinho (de graça no Fácil; moedas e troco no Médio e no Difícil);
// - a jabuticaba nasce grudada no tronco da jaboticabeira (o jogo ensina), e entra no Suco de jabuticaba.
// node --test cozinha/teste/*.test.js (da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../dados.js');
const L = require('../logica.js');
const ART = require('../desenhos.js');
const { iniciar, fechar, abrir, comecar, noLugar, voltarVila, tem } = require('./navegador.js');

test('regras: onde se compra cada coisa e quanto custa o que só se compra', () => {
  assert.deepEqual(L.lugaresDe('pao'), ['mercado', 'padaria']);
  assert.deepEqual(L.lugaresDe('leite'), ['vaca', 'mercado', 'padaria', 'vizinha']);
  assert.deepEqual(L.lugaresDe('banana'), ['pomar', 'mercado', 'feira']);
  assert.deepEqual(L.lugaresDe('cenoura'), ['horta', 'mercado', 'feira']);
  assert.deepEqual(L.lugaresDe('farinha'), ['mercado', 'vizinha'], 'a padaria não vende farinha');
  assert.equal(L.vende('feira', 'ovo'), false); assert.equal(L.vende('padaria', 'queijo'), true);
  assert.equal(L.soCompra('pao'), true); assert.equal(L.soCompra('banana'), false); assert.equal(L.soCompra('ovo'), false);
  // o pão (que agora também está na padaria) continua contando nas moedas do sanduíche
  const r = D.receita.sanduiche;
  assert.ok(L.custoSoMercado(r, 'medio') >= D.ingrediente.pao.preco * 2);
  for (const id of ['padaria', 'feira']) { assert.ok(D.lugar[id] && D.lugar[id].dono, id); }
});

test('jaboticabeira: a jabuticaba nasce no tronco; desenho da planta, das frutinhas e o suco novo', () => {
  assert.equal(D.ingrediente.jabuticaba.planta, 'jaboticabeira');
  assert.equal(D.planta.jaboticabeira.forma, 'tronco');
  assert.match(D.ingrediente.jabuticaba.fato[0], /grudadinha no tronco/);
  assert.match(ART.planta('jaboticabeira'), /^<svg/);
  assert.ok(ART.FRUTOS.jaboticabeira.length >= 4);
  assert.match(ART.fruto('jabuticaba'), /massinha/);
  const s = D.receita['suco-jabuticaba'];
  assert.ok(s && s.ing.some(x => x.id === 'jabuticaba'));
});

test.before(iniciar);
test.after(fechar);

test('Médio: compra o pão na padaria do Seu Joaquim e o tomate na feira da Dona Rosa, com moedas', { timeout: 90000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  await comecar(pg, 'medio', 'sanduiche');
  await noLugar(pg, 'padaria');
  assert.match(await pg.textContent('#jogoLugar .instr'), /Seu Joaquim dá o troco/);
  const naPadaria = await pg.$$eval('.prateleira .produto', bs => bs.map(b => b.dataset.ing).sort());
  assert.deepEqual(naPadaria, ['leite', 'manteiga', 'pao', 'queijo']);
  for (let i = 0; i < 2; i++) { await pg.click('.produto[data-ing="pao"]'); await pg.click('.cx-carteira .moeda'); await pg.click('.cx-pagar'); }
  assert.equal(await tem(pg, 'pao'), 2);
  await voltarVila(pg);
  await noLugar(pg, 'feira');
  assert.match(await pg.textContent('#jogoLugar .instr'), /Dona Rosa/);
  assert.ok(await pg.locator('.prateleira .produto[data-ing="tomate"]').count(), 'a feira vende tomate');
  assert.equal(await pg.locator('.prateleira .produto[data-ing="farinha"]').count(), 0, 'a feira não vende farinha');
  await pg.click('.produto[data-ing="tomate"]'); await pg.click('.cx-carteira .moeda'); await pg.click('.cx-pagar');
  assert.equal(await tem(pg, 'tomate'), 1);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('Fácil: suco de jabuticaba — no pomar a jaboticabeira tem as frutinhas no tronco; colhe e vira suco', { timeout: 90000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  await comecar(pg, 'facil', 'suco-jabuticaba');
  await noLugar(pg, 'pomar');
  assert.equal(await pg.locator('.pe[data-planta="jaboticabeira"]').count(), 1);
  assert.match(await pg.textContent('.pe[data-planta="jaboticabeira"] .pe-nome'), /jaboticabeira/);
  const n = await pg.evaluate(() => window.Cozinha.jogo().precisa.find(x => x.id === 'jabuticaba').q);
  for (let i = 0; i < n; i++) {
    await pg.click('.pe[data-planta="jaboticabeira"] .fruta.madura');
    await pg.waitForFunction(k => (window.Cozinha.jogo().cesta.jabuticaba || 0) >= k, i + 1);
  }
  assert.match(await pg.textContent('#jogoLugar .fato'), /grudadinha no tronco/);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});
