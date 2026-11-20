// Regra de ouro dos desenhos (paginas.js), conferida no Chromium (Playwright): node --test rabiscolandia/teste/regra-de-ouro.test.js
// Toda área pintável precisa de um pedaço à vista onde caiba uma bolinha de raio 16 (é onde o número do "pintar por
// números" aparece e onde a criança toca). Mede com o mesmo rotulosDe do motor (pintura.js), num quadro de 500 px.
// Os desenhos da Turminha (20/Nov/2026) já nasceram medidos com 16; os mais antigos têm folga de arredondamento (15).
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { chromium } = require('playwright');
const pasta = path.resolve(__dirname, '..');

test('toda área de todo desenho tem lugar para o número', async () => {
  const browser = await chromium.launch();
  try {
    const pg = await browser.newPage();
    await pg.setContent('<html><body></body></html>');
    for (const f of ['paginas.js', 'folha.js', 'pintura.js']) await pg.addScriptTag({ path: path.join(pasta, f) });
    const medidas = await pg.evaluate(() => window.DesenhoPaginas.LISTA.map(p => ({
      id: p.id, cat: p.cat, r: window.DesenhoPintura.rotulosDe(p).map(o => o.r)
    })));
    assert.ok(medidas.length > 0);
    for (const m of medidas) {
      const min = m.cat === 'turminha' ? 16 : 15;
      m.r.forEach((r, i) => assert.ok(r >= min, m.id + ': área ' + i + ' com raio livre ' + r.toFixed(1) + ' (precisa ' + min + ')'));
    }
  } finally { await browser.close(); }
});
