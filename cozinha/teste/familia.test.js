// Família à mesa (v0.8.0, pedido do dono de 14/Nov/2026): na ficha a criança toca em quem vai comer (ela sempre come);
// a receita serve 2 pessoas e, com mais gente, as quantidades e as moedas crescem; o nível limita quantos (Fácil 2,
// Médio 4, Difícil 6); no fim, cada pessoa da família aparece à mesa com o seu prato (a foto), comendo junto.
// node --test cozinha/teste/*.test.js (da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const { iniciar, fechar, abrir, cozinhar } = require('./navegador.js');

test.before(iniciar);
test.after(fechar);

test('Médio: chamar a mamãe, o papai e a vovó dobra as quantidades e as moedas; no fim os 3 comem junto', { timeout: 90000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  await pg.click('#btEntrar'); await pg.click('[data-nivel="medio"]'); await pg.click('[data-rec="omelete"]'); await pg.waitForSelector('#receita.ativa');
  assert.equal(await pg.locator('#recFamilia .fam-bt').count(), 8, 'eu, mamãe, papai, vovó, vovô, irmão, irmã e bebê');
  assert.equal(await pg.getAttribute('[data-pessoa="eu"]', 'aria-pressed'), 'true', 'a criança sempre come');
  assert.match(await pg.textContent('#recIngredientes'), /3 ovos/);
  const moedas1 = +(await pg.textContent('#recBolsa')).match(/💰 (\d+)/)[1];
  await pg.click('[data-pessoa="mamae"]');
  assert.match(await pg.textContent('#recPorcao'), /Para 2 pessoas/);
  assert.match(await pg.textContent('#recIngredientes'), /3 ovos/, '2 pessoas: a receita normal');
  await pg.click('[data-pessoa="papai"]'); await pg.click('[data-pessoa="vovo-a"]');
  assert.match(await pg.textContent('#recPorcao'), /Para 4 pessoas · receita x2/);
  assert.match(await pg.textContent('#recIngredientes'), /6 ovos/, '4 pessoas: o dobro');
  assert.ok(+(await pg.textContent('#recBolsa')).match(/💰 (\d+)/)[1] > moedas1, 'mais moedas para comprar o dobro');
  // no Médio cabem 4: chamar o vovô tira quem entrou primeiro (a mamãe)
  await pg.click('[data-pessoa="vovo-o"]');
  assert.equal(await pg.getAttribute('[data-pessoa="mamae"]', 'aria-pressed'), 'false');
  assert.equal(await pg.locator('#recFamilia .fam-bt.on').count(), 4);
  // fica guardado
  assert.deepEqual(await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:cozinha:pref')).familia), ['eu', 'papai', 'vovo-a', 'vovo-o']);
  await pg.click('#btBuscar'); await pg.waitForSelector('#mapa.ativa');
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().precisa.find(x => x.id === 'ovo').q), 6);
  await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
  await pg.click('[data-lugar="casa"]');
  // o passo da cozinha fala as quantidades da família
  assert.match(await pg.textContent('#ficha'), /6 ovos/);
  await cozinhar(pg, false);
  assert.equal(await pg.locator('#prontoFamilia .fam').count(), 3, 'papai, vovó e vovô à mesa');
  assert.equal(await pg.locator('#prontoFamilia .fam image[href="fotos/omelete.jpg"]').count(), 3, 'cada um com a omelete de verdade no prato');
  assert.match(await pg.textContent('#prontoNota'), /Papai, Vovó e Vovô comeram junto com você/);
  assert.match(await pg.textContent('#cartao'), /4 pessoas/);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('Fácil: no máximo 2 pessoas (a receita não cresce) e, sozinho, ninguém aparece à mesa', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 915, height: 412 }, { isMobile: true, hasTouch: true });
  await pg.click('#btEntrar'); await pg.click('[data-nivel="facil"]'); await pg.click('[data-rec="vitamina"]'); await pg.waitForSelector('#receita.ativa');
  await pg.click('[data-pessoa="irma"]'); await pg.click('[data-pessoa="bebe"]');
  assert.equal(await pg.locator('#recFamilia .fam-bt.on').count(), 2);
  assert.equal(await pg.getAttribute('[data-pessoa="bebe"]', 'aria-pressed'), 'true', 'a última que entrou fica');
  assert.match(await pg.textContent('#recIngredientes'), /1 banana/);
  await pg.click('[data-pessoa="bebe"]');   // tirou: fica só a criança
  await pg.click('#btBuscar'); await pg.waitForSelector('#mapa.ativa');
  await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
  await pg.click('[data-lugar="casa"]');
  await cozinhar(pg, true);
  assert.equal(await pg.locator('#prontoFamilia').isHidden(), true);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});
