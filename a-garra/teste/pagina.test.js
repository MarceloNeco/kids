// Teste da página no Chromium (Playwright), em tamanho de celular e de computador:
// node --test a-garra/teste/*.test.js (rodar da raiz do repositório kids). Servidor estático pequeno aqui dentro.
// Com ?teste o jogo expõe window.GarraDebug; ?semente=N fixa a máquina.
const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  if (p === '/solverone-dados/recursos/kids.json') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"recursos":{}}'); return; }
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const IGNORAR = /solverone-dados|favicon|\.mp3/i;
const FONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 };
const PC = { viewport: { width: 1280, height: 800 } };
let browser, base;

test.before(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/a-garra/';
  browser = await chromium.launch();
});
test.after(async () => { if (browser) await browser.close(); server.close(); });

async function abrir(ctxOp, busca, ctx) {
  ctx = ctx || await browser.newContext(Object.assign({ locale: 'pt-BR' }, ctxOp));
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  const pg = await ctx.newPage(), erros = [];
  pg.on('console', m => { if (m.type() === 'error') { const u = (m.location() && m.location().url) || ''; if (!IGNORAR.test(u + m.text()) && !/Failed to load resource/.test(m.text())) erros.push(m.text() + ' @' + u); } });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  await pg.goto(base + '?teste' + (busca || ''));
  await pg.waitForFunction(() => window.GarraDebug && GarraDebug.pronto);
  pg.erros = erros; pg.ctx = ctx;
  return pg;
}
const est = pg => pg.evaluate(() => GarraDebug.estado());
const esperarFase = (pg, fase, ms) => pg.waitForFunction(f => { const e = GarraDebug.estado(); return e.fase === f || e.fim; }, fase, { timeout: ms || 15000 });

// mira com o dedo (arrastando na máquina) no bichinho mais alto e aperta PEGAR
async function tentativa(pg, toque) {
  await esperarFase(pg, 'mirar');
  if ((await est(pg)).fim) return;
  const alvo = await pg.evaluate(() => GarraDebug.maisAlto());
  const pt = await pg.evaluate(x => GarraDebug.tela(x), alvo.x);
  if (toque) await pg.touchscreen.tap(pt.x, pt.y); else await pg.mouse.click(pt.x, pt.y);
  await pg.waitForFunction(x => Math.abs(GarraDebug.estado().x - x) < 1.5, alvo.x, { timeout: 5000 });
  await pg.click('#btPegar');
  await pg.waitForFunction(() => GarraDebug.estado().fase !== 'mirar');
}

test('celular: partida inteira no fácil, cada bichinho vai para a coleção e o fim mostra o resultado', async () => {
  const pg = await abrir(FONE, '&semente=11');
  try {
    assert.equal(await pg.isVisible('#menu'), true);
    await pg.click('[data-tema="neon"]'); await pg.click('[data-nivel="facil"]');
    await pg.click('#btJogar');
    let e = await est(pg);
    assert.equal(e.tela, 'jogo'); assert.equal(e.tema, 'neon'); assert.equal(e.fichas, 10);
    assert.equal(await pg.$eval('#infoTempo', el => el.hidden), true, 'fácil sem relógio');
    await pg.evaluate(() => GarraDebug.velocidade(4));
    for (let i = 0; i < 10 && !(await est(pg)).fim; i++) await tentativa(pg, true);
    await pg.waitForSelector('#fim:not([hidden])', { timeout: 20000 });
    e = await est(pg);
    assert.equal(e.fichas, 0);
    assert.ok(e.ganhos.length >= 10, 'no fácil, mirando no meio, todos vêm: ' + e.ganhos.length);
    assert.match(await pg.textContent('#fimEstrelas'), /★★★/);
    assert.equal(await pg.$$eval('#fimPremios canvas', l => l.length), e.ganhos.length);
    const col = await pg.evaluate(() => GarraDebug.colecao());
    assert.equal(Object.values(col).reduce((a, b) => a + b, 0), e.ganhos.length);
    // coleção: mostra os que já vieram; continua lá depois de recarregar
    await pg.click('#btFimColecao');
    assert.equal(await pg.isVisible('#colecao'), true);
    assert.equal(await pg.$$eval('#prateleira .item', l => l.length), 13);
    assert.equal(await pg.$$eval('#prateleira .item:not(.falta)', l => l.length), Object.keys(col).length);
    await pg.reload(); await pg.waitForFunction(() => window.GarraDebug && GarraDebug.pronto);
    assert.match(await pg.textContent('#colecaoConta'), new RegExp('^' + Object.keys(col).length + '/13$'));
    assert.match(await pg.textContent('[data-rec="facil"]'), /🧸 \d+/, 'recorde no menu');
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});

test('celular: segurar ⬅ ➡ leva a garra; no médio tem relógio e a garra desce sozinha', async () => {
  const pg = await abrir(FONE, '&semente=4');
  try {
    await pg.click('[data-nivel="medio"]'); await pg.click('#btJogar');
    assert.equal(await pg.$eval('#infoTempo', el => el.hidden), false, 'médio com relógio');
    const x0 = (await est(pg)).x;
    const b = await pg.locator('#btDir').boundingBox();
    await pg.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await pg.mouse.down(); await pg.waitForTimeout(600); await pg.mouse.up();
    const x1 = (await est(pg)).x;
    assert.ok(x1 > x0 + 40, 'andou para a direita: ' + x0 + ' → ' + x1);
    await pg.waitForTimeout(150);
    assert.ok(Math.abs((await est(pg)).x - x1) < 3, 'soltou, parou');
    const c = await pg.locator('#btEsq').boundingBox();
    await pg.mouse.move(c.x + c.width / 2, c.y + c.height / 2); await pg.mouse.down(); await pg.waitForTimeout(300); await pg.mouse.up();
    assert.ok((await est(pg)).x < x1 - 20, 'andou para a esquerda');
    await pg.evaluate(() => GarraDebug.velocidade(8));
    await pg.waitForFunction(() => GarraDebug.estado().fase !== 'mirar', null, { timeout: 8000 });
    assert.equal((await est(pg)).fichas, 9, 'o tempo acabou e gastou a ficha');
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});

test('computador: setas e espaço jogam; trocar de máquina e nível', async () => {
  const pg = await abrir(PC, '&semente=8');
  try {
    await pg.click('[data-tema="estrelas"]'); await pg.click('[data-nivel="dificil"]'); await pg.click('#btJogar');
    let e = await est(pg);
    assert.equal(e.tema, 'estrelas'); assert.equal(e.nivel, 'dificil'); assert.equal(e.fichas, 8);
    await pg.keyboard.down('ArrowRight'); await pg.waitForTimeout(400); await pg.keyboard.up('ArrowRight');
    assert.ok((await est(pg)).x > e.x + 30, 'seta anda');
    await pg.keyboard.press('Space');
    await pg.waitForFunction(() => GarraDebug.estado().fase !== 'mirar');
    assert.equal((await est(pg)).fichas, 7);
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});

test('🏠 com a partida rolando volta ao menu; o Voltar do celular também', async () => {
  const pg = await abrir(FONE, '&semente=2');
  try {
    await pg.click('#btJogar');
    await pg.waitForSelector('.bolinho-nav .bn-casa:not([hidden])');
    await pg.goBack();
    await pg.waitForFunction(() => GarraDebug.estado().tela === 'menu');
    await pg.click('#btColecao');
    assert.equal(await pg.isVisible('#colecao'), true);
    await pg.click('.bolinho-nav .bn-casa');
    await pg.waitForFunction(() => GarraDebug.estado().tela === 'menu');
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});
