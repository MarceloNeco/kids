// v0.12.5 (dono, 20/Nov/2026: "o jogar tem que estar sempre lá, disponível com alguma opção padrão, visível"; "você tem
// que ficar indo para baixo... celular está muito ruim"): no celular, em pé e deitado, a escolha do nível e da receita
// cabe na tela sem rolar a página e o ▶ Cozinhar (com a receita da última vez) fica dentro da tela; na ficha, o
// 🧺 Vamos buscar! também fica à vista. Tablet e computador podem rolar, mas o ▶ Cozinhar fica preso à vista.
const test = require('node:test');
const assert = require('node:assert/strict');
const { iniciar, fechar, abrir } = require('./navegador');

test.before(iniciar);
test.after(fechar);

async function medir(pg, sel) {
  return pg.evaluate(s => {
    const b = document.querySelector(s).getBoundingClientRect();
    return { rola: document.documentElement.scrollHeight - innerHeight, rolaLado: document.documentElement.scrollWidth - innerWidth,
      dentro: b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth, b: [b.left, b.top, b.right, b.bottom].map(Math.round), H: innerHeight };
  }, sel);
}

for (const vp of [{ width: 360, height: 740 }, { width: 390, height: 844 }, { width: 740, height: 360 }, { width: 915, height: 412 }]) {
  test('celular ' + vp.width + '×' + vp.height + ': a escolha cabe sem rolar a página e o ▶ Cozinhar está dentro da tela', { timeout: 60000 }, async () => {
    const { ctx, pg, erros } = await abrir(vp, { isMobile: true, hasTouch: true });
    await pg.click('#btEntrar'); await pg.waitForSelector('#menu.ativa'); await pg.waitForTimeout(500);
    let m = await medir(pg, '#btCozinhar');
    assert.ok(m.rola <= 1, 'a página rola ' + m.rola + ' px');
    assert.ok(m.rolaLado <= 1, 'a página rola para o lado');
    assert.ok(m.dentro, '▶ Cozinhar fora da tela: ' + JSON.stringify(m));
    // os 3 níveis à vista; as receitas correm para o lado dentro da fileira (a página não)
    for (const n of ['facil', 'medio', 'dificil']) assert.ok((await medir(pg, '[data-nivel="' + n + '"]')).dentro, 'nível ' + n + ' fora da tela');
    assert.ok(await pg.evaluate(() => { const f = document.getElementById('receitas'); return f.scrollWidth > f.clientWidth; }), 'as receitas deviam correr para o lado');
    // padrão: a primeira receita; tocando no ▶ Cozinhar abre a ficha dela
    assert.match(await pg.textContent('#btCozinhar'), /Cozinhar.*Bolo de cenoura/);
    await pg.click('[data-nivel="medio"]');
    m = await medir(pg, '#btCozinhar'); assert.ok(m.rola <= 1 && m.dentro, 'trocar o nível mexeu no lugar do ▶ Cozinhar');
    // o ❓ abre por cima, sem fazer a página rolar
    await pg.click('#btAjuda'); assert.ok((await medir(pg, '#btCozinhar')).rola <= 1, 'o ❓ fez a página rolar'); await pg.click('#btAjuda');
    await pg.click('#btCozinhar'); await pg.waitForSelector('#receita.ativa');
    assert.match(await pg.textContent('#recTitulo'), /Bolo de cenoura/);
    assert.ok((await medir(pg, '#btBuscar')).dentro, '🧺 Vamos buscar! fora da tela na ficha');
    // a receita escolhida vira a da vez: de volta ao menu, o ▶ Cozinhar já mostra ela e o cartão aparece na fileira
    await pg.goBack(); await pg.waitForSelector('#menu.ativa');
    await pg.click('[data-rec="cookies"]'); await pg.waitForSelector('#receita.ativa');
    await pg.goBack(); await pg.waitForSelector('#menu.ativa');
    assert.match(await pg.textContent('#btCozinhar'), /Cookies/);
    assert.ok(await pg.evaluate(() => { const f = document.getElementById('receitas'), b = f.querySelector('.rec.escolhida').getBoundingClientRect(), r = f.getBoundingClientRect();
      return b.right > r.left && b.left < r.right; }), 'o cartão da receita escolhida devia estar à vista na fileira');
    assert.deepEqual(erros, []);
    await ctx.close();
  });
}

test('computador 1280×800: o ▶ Cozinhar fica preso à vista mesmo rolando a grade; Enter no teclado também abre', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 1280, height: 800 });
  await pg.click('#btEntrar'); await pg.waitForSelector('#menu.ativa'); await pg.waitForTimeout(500);
  assert.ok((await medir(pg, '#btCozinhar')).dentro, '▶ Cozinhar fora da tela no alto');
  await pg.evaluate(() => window.scrollTo(0, 200));
  assert.ok((await medir(pg, '#btCozinhar')).dentro, '▶ Cozinhar fora da tela depois de rolar');
  await pg.focus('#btCozinhar'); await pg.keyboard.press('Enter'); await pg.waitForSelector('#receita.ativa');
  assert.deepEqual(erros, []);
  await ctx.close();
});

test('inglês e espanhol: ▶ Cook / ▶ Cocinar com o nome da receita', { timeout: 30000 }, async () => {
  for (const [lg, re] of [['en', /Cook.*Carrot cake/], ['es', /Cocinar.*Tarta de zanahoria/]]) {
    const { ctx, pg, erros } = await abrir({ width: 390, height: 844 }, { isMobile: true, hasTouch: true }, null, lg);
    await pg.click('#btEntrar'); await pg.waitForSelector('#menu.ativa');
    assert.match(await pg.textContent('#btCozinhar'), re);
    assert.ok((await pg.textContent('#nivelTexto')).length > 10, 'explicação do nível vazia');
    assert.deepEqual(erros, []);
    await ctx.close();
  }
});
