// Todas as receitas, nos níveis Médio e Difícil, chegam ao fim na cozinha (cada tipo de passo funciona no navegador).
// A cesta é enchida direto (juntar na vila já é testado em pagina.test.js). Os dois níveis rodam ao mesmo tempo.
// node --test cozinha/teste/*.test.js (da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const { iniciar, fechar, abrir, cozinhar } = require('./navegador.js');

test.before(iniciar);
test.after(fechar);

async function todas(nivel) {
  const { ctx, pg, erros } = await abrir({ width: 1024, height: 768 });
  const ids = await pg.evaluate(() => window.CozinhaDados.RECEITAS.map(r => r.id));
  await pg.click('#btEntrar'); await pg.click('[data-nivel="' + nivel + '"]');
  for (const id of ids) {
    await pg.click('[data-rec="' + id + '"]'); await pg.click('#btBuscar'); await pg.waitForSelector('#mapa.ativa');
    await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.imprevistoFeito = true; j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
    await pg.click('[data-lugar="casa"]');
    await cozinhar(pg, false);
    const est = (await pg.textContent('#prontoEstrelas')).match(/⭐/g).length;
    assert.ok(est >= 2, id + ': estrelas ' + est);
    await pg.click('#btOutra'); await pg.waitForSelector('#menu.ativa');
  }
  const prog = await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:cozinha:progresso')));
  assert.equal(Object.keys(prog.r).filter(k => prog.r[k][nivel]).length, ids.length, 'todas guardadas no progresso');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
}

test('todas as receitas do Médio e do Difícil chegam ao fim na cozinha', { timeout: 240000 }, async () => {
  await Promise.all([todas('medio'), todas('dificil')]);
});
