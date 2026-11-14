// A cidade em 3D de verdade (v0.12.0, cidade3d.js com o three.js): monta com os 10 lugares, os nomes ficam em cima de
// cada prédio, tocar num lugar faz o cozinheirinho andar até lá e depois entra; ⟲ ⟳ giram a cidade; o three.js está
// guardado no jogo (sem internet). node --test cozinha/teste/*.test.js (da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { iniciar, fechar, abrir, comecar } = require('./navegador.js');

test.before(iniciar);
test.after(fechar);

test('three.js guardado no jogo com a licença MIT, e a cidade no sw.js', () => {
  const pasta = path.resolve(__dirname, '..');
  assert.ok(fs.statSync(path.join(pasta, 'libs', 'three.module.min.js')).size > 500000);
  assert.match(fs.readFileSync(path.join(pasta, 'libs', 'three-LICENSE.txt'), 'utf8'), /MIT License/);
  const sw = fs.readFileSync(path.join(pasta, 'sw.js'), 'utf8');
  for (const f of ['cidade3d.js', 'libs/three.module.min.js']) assert.ok(sw.includes("'" + f + "'"), f);
  assert.match(fs.readFileSync(path.join(pasta, 'cidade3d.js'), 'utf8'), /from '\.\/libs\/three\.module\.min\.js'/, 'importa o three.js do próprio jogo, não de fora');
});

for (const vp of [{ width: 390, height: 844 }, { width: 915, height: 412 }]) {
  test('cidade 3D ' + vp.width + '×' + vp.height + ': 10 lugares com nome em cima, o cozinheirinho anda até o tocado e entra; girar', { timeout: 60000 }, async () => {
    const { ctx, pg, erros } = await abrir(vp, { isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
    await pg.goto(pg.url() + '&vila3d&devagar');
    await pg.addStyleTag({ content: '.tela-inteira-bt{display:none!important}' });
    await comecar(pg, 'medio', 'pao-queijo');
    await pg.waitForFunction(() => window.Cidade3D && document.querySelector('#vila.vila3d canvas'), null, { timeout: 15000 });
    assert.equal(await pg.locator('#vila .rotulos .lugar').count(), 10);
    // cada nome fica dentro da cidade (posto em cima do seu prédio)
    await pg.waitForTimeout(400);
    const dentro = await pg.evaluate(() => { const v = document.querySelector('#vila').getBoundingClientRect(); return [...document.querySelectorAll('#vila .rotulos .lugar')].every(b => { const r = b.getBoundingClientRect(); return r.left > v.left - 40 && r.right < v.right + 40 && r.top > v.top - 30 && r.bottom < v.bottom + 10; }); });
    assert.ok(dentro, 'nomes dentro da cidade');
    // girar
    const az0 = await pg.evaluate(() => Cidade3D.estado().az);
    await pg.click('[data-girar="1"]', { force: true }); await pg.waitForTimeout(700);
    assert.notEqual(await pg.evaluate(() => Cidade3D.estado().az), az0, 'a cidade girou');
    // tocar no mercado: anda (ainda na vila) e depois entra
    await pg.click('[data-lugar="mercado"]', { force: true });
    await pg.waitForTimeout(250);
    assert.equal(await pg.evaluate(() => Cidade3D.estado().andando), true, 'andando pela rua');
    assert.equal(await pg.locator('#mapa.ativa').count(), 1);
    await pg.waitForSelector('#lugar.ativa', { timeout: 8000 });
    assert.match(await pg.textContent('#lugarTitulo'), /Mercadinho/);
    assert.deepEqual(erros.filter(e => !/GL Driver|GPU stall|WebGL/.test(e)), [], 'erros no console');
    await ctx.close();
  });
}
