// Teste da página no Chromium (Playwright): node --test tijolaco/teste/pagina.test.js (rodar da raiz do repositório kids).
// Com ?teste o jogo expõe window.TijolacoDebug: jogar(fase, nivel), estado(), atirar(ang), mirarNo(i), fila(cores, cor, s), vencer(), perder().
const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const IGNORAR = /solverone-dados|favicon|\.mp3/i;   // interruptores do RootifyONE e músicas não importam aqui
const FONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
const DEITADO = { viewport: { width: 915, height: 412 }, hasTouch: true, isMobile: true };
let browser, base;

test.before(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/tijolaco/';
  browser = await chromium.launch();
});
test.after(async () => { if (browser) await browser.close(); server.close(); });

async function abrir(ctxOp) {
  const ctx = await browser.newContext(Object.assign({ locale: 'pt-BR' }, ctxOp));
  const pg = await ctx.newPage(), erros = [];
  pg.on('console', m => { if (m.type() === 'error') { const u = (m.location() && m.location().url) || ''; if (!IGNORAR.test(u + m.text())) erros.push(m.text() + ' @' + u); } });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  await pg.goto(base + '?teste');
  await pg.waitForFunction(() => window.TijolacoDebug && TijolacoDebug.pronto && TijolacoDebug.estado().animando, null, { timeout: 20000 });
  pg.erros = erros; pg.ctx = ctx;
  return pg;
}
const est = pg => pg.evaluate(() => TijolacoDebug.estado());
const naTela = (pg, sel) => pg.$eval(sel, e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth && getComputedStyle(e).visibility !== 'hidden'; });

for (const [nome, op] of [['em pé 390×844', FONE], ['deitado 915×412', DEITADO]]) {
  test('começo ' + nome + ': #btJogar à vista sem rolar, 5 modos (4 "Em breve"), níveis e 8 fases', async () => {
    const pg = await abrir(op);
    try {
      assert.ok(await naTela(pg, '#btJogar'), '#btJogar fora da tela');
      assert.equal(await pg.evaluate(() => document.documentElement.scrollHeight <= innerHeight && document.documentElement.scrollWidth <= innerWidth), true, 'a página rola');
      assert.equal(await pg.locator('.modo').count(), 5);
      assert.equal(await pg.locator('.modo.breve .fita').count(), 4);
      assert.equal(await pg.locator('#fases .fase').count(), 8);
      assert.equal(await pg.locator('#fases .fase:disabled').count(), 7, 'só a fase 1 aberta no começo');
      assert.match(await pg.textContent('#btJogar'), /fase 1/);
      assert.equal((await pg.textContent('#letreiro')).trim(), 'TIJOLAÇO');
      for (const s of ['#btAjuda', '#btEfeitos', '[data-nivel="dificil"]']) assert.ok(await naTela(pg, s), s + ' fora da tela');
      assert.deepEqual(pg.erros, []);
    } finally { await pg.ctx.close(); }
  });
}

test('fase 1: a fila entra, o tiro encaixa e 3 iguais estouram contando pontos', async () => {
  const pg = await abrir(FONE);
  try {
    await pg.tap('#btJogar');
    await pg.waitForFunction(() => TijolacoDebug.estado().tela === 'jogo');
    await pg.waitForFunction(() => TijolacoDebug.estado().visiveis >= 6, null, { timeout: 8000 });
    assert.ok(await naTela(pg, '#cena'));
    // encaixa: fila sem vizinhos iguais, perto do fim (na volta de dentro, nada no caminho do tiro)
    await pg.evaluate(() => TijolacoDebug.fila([0, 1, 2, 3, 0, 1, 2, 3, 0, 1], 3, 3900));
    const n0 = (await est(pg)).bolas;
    await pg.evaluate(() => TijolacoDebug.atirar(TijolacoDebug.mirarNo(1)));
    await pg.waitForFunction(() => TijolacoDebug.estado().tiros === 0, null, { timeout: 3000 });
    await pg.waitForTimeout(250);
    let e = await est(pg);
    assert.equal(e.bolas, n0 + 1, 'o tijolo encaixou na fila');
    assert.equal(e.pontos, 0);
    // estoura: 1,1 + 1
    await pg.evaluate(() => TijolacoDebug.fila([0, 1, 1, 2, 3, 0, 2, 3], 1, 3900));
    await pg.evaluate(() => TijolacoDebug.atirar(TijolacoDebug.mirarNo(1)));
    await pg.waitForFunction(() => TijolacoDebug.estado().pontos > 0, null, { timeout: 3000 });
    e = await est(pg);
    assert.equal(e.estourados, 3); assert.equal(e.bolas, 6, '8 + 1 - 3'); assert.equal(e.pontos, 30);
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});

test('toque na betoneira troca o tijolo; tocar longe atira; tocar no portão desvia a fila', async () => {
  const pg = await abrir(FONE);
  try {
    await pg.evaluate(() => TijolacoDebug.jogar(4, 'medio'));
    await pg.waitForTimeout(400);
    const l = (await est(pg)).lanc, p = await pg.evaluate(([x, y]) => TijolacoDebug.naTela(x, y), [l.x, l.y]);
    await pg.evaluate(() => TijolacoDebug.fila([0, 1, 2, 3, 0, 1], 0, 2000, 1));
    const antes = (await est(pg)).lanc;
    await pg.touchscreen.tap(p.x, p.y);
    const depois = (await est(pg)).lanc;
    assert.deepEqual([depois.cor, depois.prox], [antes.prox, antes.cor], 'trocou o tijolo');
    // portão: o botão redondo numerado
    const g = (await est(pg)).portoes[0];
    assert.equal(g.longo, false);
    const pb = await pg.evaluate(([x, y]) => TijolacoDebug.naTela(x, y), [g.x, g.y]);
    await pg.touchscreen.tap(pb.x, pb.y);
    assert.equal((await est(pg)).portoes[0].longo, true, 'o toque no portão desviou a fila');
    // longe da betoneira e dos portões: atira
    await pg.touchscreen.tap(p.x, Math.max(80, p.y - 160));
    await pg.waitForTimeout(60);
    assert.ok((await est(pg)).tiros >= 1, 'tocar longe atira');
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});

test('vencer mostra a vitória com estrelas e destrava a fase 2; perder mostra a derrota', async () => {
  const pg = await abrir(DEITADO);
  try {
    await pg.evaluate(() => TijolacoDebug.jogar(1, 'facil'));
    await pg.waitForTimeout(600);
    await pg.evaluate(() => TijolacoDebug.vencer());
    await pg.waitForSelector('#fim:not([hidden])', { timeout: 5000 });
    let e = await est(pg);
    assert.equal(e.fim, 'vitoria'); assert.ok(e.estrelas[0] >= 1);
    assert.ok(await pg.isVisible('#btProxima'));
    assert.equal(await pg.locator('#fimEstrelas svg').count(), 3);
    assert.ok(await naTela(pg, '#btProxima'));
    await pg.click('#btProxima');
    await pg.waitForFunction(() => TijolacoDebug.estado().fase === 2 && TijolacoDebug.estado().fim === null);
    await pg.waitForTimeout(500);
    await pg.evaluate(() => TijolacoDebug.perder());
    await pg.waitForSelector('#fim:not([hidden])', { timeout: 8000 });
    e = await est(pg);
    assert.equal(e.fim, 'derrota');
    assert.equal(await pg.isVisible('#btProxima'), false);
    // volta ao começo: a fase 2 está aberta
    await pg.click('#btFimMenu');
    await pg.waitForFunction(() => TijolacoDebug.estado().tela === 'menu');
    assert.equal(await pg.locator('#fases .fase:disabled').count(), 6);
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});

test('teclado e TV: os números mexem nos portões, as setas giram, Espaço troca e Enter atira', async () => {
  const pg = await abrir({ viewport: { width: 1280, height: 720 } });
  try {
    await pg.evaluate(() => TijolacoDebug.jogar(4, 'medio'));
    await pg.waitForTimeout(500);
    assert.equal((await est(pg)).portoes.length, 1);
    await pg.keyboard.press('1');
    assert.equal((await est(pg)).portoes[0].longo, true);
    await pg.keyboard.press('Digit1');
    assert.equal((await est(pg)).portoes[0].longo, false);
    // teclado: setas giram, Espaço troca, Enter atira
    const a0 = (await est(pg)).lanc.ang;
    await pg.keyboard.down('ArrowRight'); await pg.waitForTimeout(300); await pg.keyboard.up('ArrowRight');
    assert.ok((await est(pg)).lanc.ang > a0 + 0.2, 'a seta gira a betoneira');
    const l = (await est(pg)).lanc;
    await pg.keyboard.press('Space');
    const l2 = (await est(pg)).lanc;
    assert.deepEqual([l2.cor, l2.prox], [l.prox, l.cor]);
    await pg.keyboard.press('Enter');
    assert.equal((await est(pg)).tiros, 1);
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});
