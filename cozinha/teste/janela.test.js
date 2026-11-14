// v0.12.0 (dono, 14/Nov/2026): ao tocar num ingrediente (cesta, ficha, "daqui ainda falta") abre uma janela bonita com a
// imagem grande, o nome, quanto já tem, onde achar e de onde vem; nada de selecionar texto (o "Toque para pesquisar"
// do Google aparecia na cesta). E o botão 🎬 liga/desliga as animações do jogo; se o aparelho pede menos movimento e a
// família ainda não escolheu, o jogo pergunta uma vez. node --test cozinha/teste/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { iniciar, fechar, abrir, comecar, noLugar } = require('./navegador.js');

test.before(iniciar);
test.after(fechar);

test('tocar no ingrediente da cesta abre a janela (imagem, nome, quanto falta, onde achar, de onde vem) e fecha no Entendi', { timeout: 30000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  await comecar(pg, 'medio', 'pao-queijo');
  assert.equal(await pg.evaluate(() => getComputedStyle(document.body).userSelect), 'none', 'tocar não seleciona texto');
  await pg.click('#cestaMapa .item[data-ing="queijo"]');
  assert.equal(await pg.locator('#dialogo:not([hidden])').count(), 1);
  assert.match(await pg.textContent('#dialogoTitulo'), /queijo/);
  assert.match(await pg.textContent('#dialogo .ing-conta'), /Você tem 0 de 2/);
  assert.match(await pg.textContent('#dialogo .ing-onde'), /Mercadinho.*Padaria/s);
  assert.match(await pg.textContent('#dialogo .ing-fato'), /leite/);
  assert.equal(await pg.locator('#dialogo .ing-foto img').count(), 1);
  await pg.click('#dialogo [data-acao="ok"]');
  assert.equal(await pg.locator('#dialogo[hidden]').count(), 1);
  // também na ficha e no "daqui ainda falta"
  await noLugar(pg, 'mercado');
  await pg.click('#lugarPrecisa [data-ing="polvilho"]');
  assert.match(await pg.textContent('#dialogoTitulo'), /polvilho/);
  await pg.keyboard.press('Escape');
  assert.equal(await pg.locator('#dialogo[hidden]').count(), 1, 'Esc fecha');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('🎬 no menu desliga e liga as animações e guarda; com o aparelho pedindo menos movimento, o jogo pergunta uma vez', { timeout: 30000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 }, { reducedMotion: 'no-preference' });
  await pg.click('#btEntrar');
  assert.equal(await pg.getAttribute('#btMovimento', 'aria-pressed'), 'true');
  await pg.click('#btMovimento');
  assert.equal(await pg.getAttribute('#btMovimento', 'aria-pressed'), 'false');
  assert.equal(await pg.evaluate(() => document.documentElement.classList.contains('parado')), true);
  assert.equal(await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:cozinha:pref')).movimento), false);
  await pg.click('#btMovimento');
  assert.equal(await pg.evaluate(() => document.documentElement.classList.contains('parado')), false);
  await ctx.close();
  // aparelho com "remover animações": sem ?teste o jogo pergunta; "Ligar" liga e guarda
  const r = await abrir({ width: 390, height: 844 }, { reducedMotion: 'reduce' });
  await r.pg.goto(r.pg.url().replace('?teste', ''));
  await r.pg.click('#btEntrar');
  await r.pg.waitForSelector('#dialogo:not([hidden]) [data-acao="ligar"]', { timeout: 4000 });
  assert.equal(await r.pg.evaluate(() => document.documentElement.classList.contains('parado')), true, 'antes de responder, segue o aparelho');
  await r.pg.click('[data-acao="ligar"]');
  assert.equal(await r.pg.evaluate(() => document.documentElement.classList.contains('parado')), false, 'ligou as animações');
  await r.pg.reload(); await r.pg.click('#btEntrar'); await r.pg.waitForTimeout(800);
  assert.equal(await r.pg.locator('#dialogo:not([hidden])').count(), 0, 'não pergunta de novo');
  assert.deepEqual(erros.concat(r.erros).filter(e => !/404/.test(e)), [], 'erros no console');
  await r.ctx.close();
});
