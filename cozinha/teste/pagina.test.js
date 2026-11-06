// Cozinha no Chromium (Playwright), jogando de verdade (ajudantes em navegador.js): node --test cozinha/teste/*.test.js (da raiz do repositório)
// Sobe um servidor pequeno na raiz do repositório e abre /cozinha/?teste (esperas curtinhas, frutas maduras).
// Joga receitas do Fácil do começo ao fim no tamanho de celular, tablet e computador, sem erro no console;
// confere o mercadinho com moedas e troco, a vizinha com obrigado, as fichas misturadas e o imprevisto do Difícil.
const test = require('node:test');
const assert = require('node:assert/strict');
const { iniciar, fechar, abrir, segurar, noLugar, voltarVila, tem, comecar, fazerPasso, cozinhar } = require('./navegador.js');

test.before(iniciar);
test.after(fechar);

async function vitaminaFacil(viewport, extra) {
  const { ctx, pg, erros } = await abrir(viewport, extra);
  await comecar(pg, 'facil', 'vitamina');
  assert.equal(await pg.locator('#cestaMapa .item').count(), 2, 'a cesta mostra os 2 ingredientes do Fácil');
  // pomar: colher uma banana madura
  await noLugar(pg, 'pomar');
  await pg.click('.fruta.madura[data-ing="banana"]');
  assert.equal(await tem(pg, 'banana'), 1);
  await voltarVila(pg);
  // a casa ainda não deixa cozinhar
  await pg.click('[data-lugar="casa"]');
  assert.ok(await pg.locator('#mapa.ativa').count(), 'sem tudo na cesta, fica na vila');
  assert.match(await pg.textContent('#aviso'), /Ainda falta/);
  // fazendinha: segurar para tirar o leite
  await noLugar(pg, 'vaca');
  await segurar(pg, '#btOrdenhar', 700);
  await pg.waitForFunction(() => (window.Cozinha.jogo().cesta.leite || 0) === 1);
  await voltarVila(pg);
  assert.ok(await pg.locator('[data-lugar="casa"].pronta').count(), 'a casa brilha com a cesta completa');
  await pg.click('[data-lugar="casa"]');
  await cozinhar(pg, true);
  assert.match(await pg.textContent('#prontoTitulo'), /Vitamina de banana/);
  assert.equal((await pg.textContent('#prontoEstrelas')).match(/⭐/g).length, 3, '3 estrelas sem erro');
  assert.match(await pg.textContent('#cartao'), /Receita da família/);
  assert.match(await pg.textContent('#cartao'), /1 banana/);
  const prog = await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:cozinha:progresso')));
  assert.equal(prog.r.vitamina.facil, 3, 'progresso guardado');
  // de volta ao menu, a receita aparece com as estrelas
  await pg.click('#btOutra');
  assert.equal((await pg.textContent('[data-rec="vitamina"] .rec-est')).match(/⭐/g).length, 3);
  // sem rolagem para o lado
  assert.ok(await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'a página rola para o lado');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
}

test('celular em pé: vitamina de banana no Fácil, do começo ao fim', { timeout: 60000 }, async () => {
  await vitaminaFacil({ width: 390, height: 844 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
});

test('computador: vitamina de banana no Fácil, do começo ao fim', { timeout: 60000 }, async () => {
  await vitaminaFacil({ width: 1280, height: 800 });
});

test('tablet: bolo de cenoura no Fácil, juntando na horta, no galinheiro e no mercadinho de graça', { timeout: 90000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 800, height: 1280 }, { hasTouch: true });
  await comecar(pg, 'facil', 'bolo-cenoura');
  await noLugar(pg, 'horta');
  for (let i = 0; i < 2; i++) {
    const planta = pg.locator('.planta[data-ing="cenoura"]:not(:disabled)').first();
    for (let k = 0; k < 3; k++) await planta.click();
  }
  await pg.waitForFunction(() => window.Cozinha.jogo().cesta.cenoura === 2);
  await voltarVila(pg);
  await noLugar(pg, 'galinheiro');
  for (let i = 0; i < 2; i++) { await pg.locator('.galinha').nth(i).click(); await pg.locator('.ovo:not([hidden])').first().click(); }
  assert.equal(await tem(pg, 'ovo'), 2);
  await voltarVila(pg);
  await noLugar(pg, 'mercado');
  assert.match(await pg.textContent('.prateleira'), /grátis/);
  await pg.click('.produto[data-ing="farinha"]'); await pg.click('.produto[data-ing="farinha"]');
  assert.equal(await tem(pg, 'farinha'), 2);
  await voltarVila(pg);
  await pg.click('[data-lugar="casa"]');
  await cozinhar(pg, true);
  assert.match(await pg.textContent('#prontoTitulo'), /Bolo de cenoura/);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('Médio: mercadinho com moedas e troco, vizinha só entrega depois do obrigado, erro de utensílio conta', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 }, { hasTouch: true });
  await comecar(pg, 'medio', 'brigadeiro');
  const m0 = await pg.evaluate(() => window.Cozinha.jogo().moedas);
  assert.ok(m0 >= 9, 'moedas suficientes no Médio');
  await noLugar(pg, 'mercado');
  await pg.click('.produto[data-ing="leitecond"]');
  await pg.waitForSelector('.caixa:not([hidden])');
  assert.ok(await pg.locator('.cx-pagar:disabled').count(), 'sem moeda no balcão não paga');
  await pg.click('.cx-carteira .moeda.m5');          // dá uma moeda de 5 para algo de 3
  await pg.click('.cx-pagar');
  assert.equal(await tem(pg, 'leitecond'), 1);
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().moedas), m0 - 3, 'pagou 3');
  assert.match(await pg.textContent('#aviso'), /Troco: 💰 2/);
  await voltarVila(pg);
  await noLugar(pg, 'vizinha');
  await pg.click('.pedido[data-ing="manteiga"]');
  assert.equal(await tem(pg, 'manteiga'), 0, 'ainda não agradeceu');
  await pg.click('#btObrigado');
  assert.equal(await tem(pg, 'manteiga'), 1);
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().favores), 2);
  await voltarVila(pg);
  // completa o resto e erra o utensílio uma vez na cozinha
  await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
  await pg.click('[data-lugar="casa"]');
  await pg.waitForSelector('#cozinha.ativa');
  await pg.click('#utensilios .utensilio:not([data-u="pia"])');
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().erros), 1);
  assert.ok(await pg.locator('[data-u="pia"].luz').count(), 'depois de errar, o utensílio certo brilha');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('Difícil: imprevisto ao chegar em casa e fichas misturadas que respeitam a ordem', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 1280, height: 800 });
  await comecar(pg, 'dificil', 'vitamina');
  assert.ok(await pg.locator('#sol:not([hidden])').count(), 'o sol aparece no Difícil');
  await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
  await pg.click('[data-lugar="casa"]');
  assert.ok(await pg.locator('#mapa.ativa').count(), 'o imprevisto segura na vila');
  assert.match(await pg.textContent('#aviso'), /Biscoito/);
  assert.equal(await pg.evaluate(() => { const j = window.Cozinha.jogo(); return j.precisa.every(x => (j.cesta[x.id] || 0) >= x.q); }), false);
  await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
  await pg.click('[data-lugar="casa"]');
  await pg.waitForSelector('#cozinha.ativa');
  assert.ok(await pg.locator('.ficha-bt').count() >= 5, 'fichas misturadas');
  await pg.click('.ficha-bt[data-passo="servir"]');
  assert.match(await pg.textContent('#aviso'), /Ainda não/);
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().erros), 1);
  await pg.click('.ficha-bt[data-passo="lavar"]');
  await pg.waitForFunction(() => window.Cozinha.jogo().cz.fase === 'utensilio');
  assert.equal(await pg.locator('.utensilio.luz').count(), 0, 'no Difícil o utensílio não brilha de cara');
  await fazerPasso(pg);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('inglês: troca de língua no menu e textos da receita em EN', { timeout: 30000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 });
  await pg.click('#btEntrar');
  if ((await pg.textContent('#btLingua')).trim() === 'EN') await pg.click('#btLingua');
  assert.match(await pg.textContent('#menu'), /Pick a recipe/);
  await pg.click('[data-rec="pizza"]');
  assert.match(await pg.textContent('#recIngredientes'), /cups of flour/);
  assert.equal(await pg.evaluate(() => document.documentElement.lang), 'en');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});
