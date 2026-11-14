// A cozinha em 3D (v0.13.0, cozinha3d.js): enquanto a criança escolhe o utensílio, a cozinha aparece em 3D e, ao acertar,
// o cozinheirinho anda até a estação (a pia para lavar as mãos). node --test cozinha/teste/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { iniciar, fechar, abrir, comecar } = require('./navegador.js');

test.before(iniciar);
test.after(fechar);

test('cozinha 3D: aparece na escolha do utensílio e o cozinheirinho anda até a pia', { timeout: 60000 }, async () => {
  const r = await abrir({ width: 390, height: 844 }, { isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  const pg = r.pg;
  await pg.goto(pg.url() + '&cozinha3d&devagar');
  await pg.addStyleTag({ content: '.tela-inteira-bt{display:none!important}' });
  await comecar(pg, 'facil', 'pao-queijo');
  await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
  await pg.click('[data-lugar="casa"]', { force: true }); await pg.waitForSelector('#cozinha.ativa');
  await pg.waitForSelector('#palco .diorama.d3 canvas', { timeout: 15000 });
  assert.equal(await pg.evaluate(() => Cozinha3D.estado().pos), 'porta');
  await pg.click('[data-u="pia"]', { force: true });
  await pg.waitForTimeout(200);
  assert.equal(await pg.evaluate(() => Cozinha3D.estado().andando), true, 'andando até a pia');
  await pg.waitForFunction(() => window.Cozinha.jogo().cz.fase === 'acao', null, { timeout: 15000 });
  await pg.waitForFunction(() => Cozinha3D.estado().pos === 'pia', null, { timeout: 15000 });
  assert.deepEqual(r.erros.filter(e => !/GL Driver|GPU stall|WebGL/.test(e)), [], 'erros no console');
  await r.ctx.close();
});
