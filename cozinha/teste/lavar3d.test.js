// Lavar as mãos em 3D (v0.12.0, pedido do dono): a criança sobe no banquinho, abre a torneira, molha, passa sabão,
// esfrega com círculos do dedo, enxágua, fecha a torneira e seca na toalha; no fim "Mãos limpinhas!" e o passo termina.
// node --test cozinha/teste/*.test.js (da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const { iniciar, fechar, abrir, comecar, circulos } = require('./navegador.js');

test.before(iniciar);
test.after(fechar);

test('lavar as mãos em 3D: as 8 etapas na ordem, esfregar com círculos do dedo, e o passo termina', { timeout: 90000 }, async () => {
  const r = await abrir({ width: 390, height: 844 }, { isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  const pg = r.pg;
  await pg.goto(pg.url() + '&lavar3d');
  await pg.addStyleTag({ content: '.tela-inteira-bt{display:none!important}' });
  const click0 = pg.click.bind(pg); pg.click = (s, o) => click0(s, Object.assign({ force: true }, o));   // com animação, os botões pulsam
  await comecar(pg, 'facil', 'vitamina');
  await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
  await pg.click('[data-lugar="casa"]'); await pg.waitForSelector('#cozinha.ativa');
  await pg.click('[data-u="pia"]');
  await pg.waitForSelector('.lavar3d canvas', { timeout: 25000 });
  const etapa = () => pg.evaluate(() => document.querySelector('.lavar3d').dataset.etapa);
  // toca no botão da etapa e espera mudar; num navegador lento (3D sem placa de vídeo) toca de novo se o toque se perdeu
  async function passar(e) {
    for (let k = 0; k < 5; k++) {
      await pg.click('.lv-bt');
      const ok = await pg.waitForFunction(x => { const el = document.querySelector('.lavar3d'); return el.dataset.etapa !== x || el.classList.contains('limpo'); }, e, { timeout: 8000 }).then(() => true, () => false);
      if (ok) return;
    }
    assert.fail('a etapa ' + e + ' não andou');
  }
  const vistas = [];
  for (const e of ['subir', 'abrir', 'molhar', 'sabao']) {
    vistas.push(await etapa()); assert.equal(await etapa(), e);
    assert.ok((await pg.textContent('.lv-bt')).length > 2, 'botão da etapa ' + e);
    await passar(e);
  }
  assert.equal(await etapa(), 'esfregar');
  assert.match(await pg.textContent('.lv-instr'), /círculos/);
  for (let k = 0; k < 4 && await etapa() === 'esfregar'; k++) { await circulos(pg, '.lavar3d .lv-cena', 2.2); await pg.waitForTimeout(500); }
  await pg.waitForFunction(() => document.querySelector('.lavar3d').dataset.etapa === 'enxaguar', null, { timeout: 25000 });
  for (const e of ['enxaguar', 'fechar', 'secar']) {
    assert.equal(await etapa(), e); await passar(e);
  }
  await pg.waitForSelector('.lavar3d.limpo .limpinho:not([hidden])', { timeout: 25000 });
  assert.match(await pg.textContent('.lavar3d .limpinho'), /Mãos limpinhas/);
  await pg.waitForFunction(() => window.Cozinha.jogo().cz.feitos.includes('lavar'), null, { timeout: 25000 });
  assert.deepEqual(r.erros.filter(e => !/GL Driver|GPU stall|WebGL/.test(e)), [], 'erros no console');
  await r.ctx.close();
});
