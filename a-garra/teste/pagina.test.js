// Teste da página no Chromium (Playwright), em tamanho de celular e de computador, com a máquina em 3D:
// node --test a-garra/teste/*.test.js (rodar da raiz do repositório kids). Servidor estático pequeno aqui dentro.
// Com ?teste o jogo expõe window.GarraDebug; ?semente=N fixa a máquina. O navegador de teste desenha o 3D sem placa de
// vídeo (devagar), por isso os testes aceleram o relógio do jogo (GarraDebug.velocidade).
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
const IGNORAR = /solverone-dados|favicon|\.mp3|Failed to load resource|GPU stall|GL_CLOSE_PATH|WebGL/i;
const FONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 };
const PC = { viewport: { width: 1280, height: 800 } };
let browser, base;

test.before(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/a-garra/';
  browser = await chromium.launch();
});
test.after(async () => { if (browser) await browser.close(); server.close(); });

async function abrir(ctxOp, busca) {
  const ctx = await browser.newContext(Object.assign({ locale: 'pt-BR' }, ctxOp));
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  const pg = await ctx.newPage(), erros = [];
  pg.on('console', m => { if (m.type() === 'error' && !IGNORAR.test(m.text() + ((m.location() && m.location().url) || ''))) erros.push(m.text()); });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  await pg.goto(base + '?teste' + (busca || ''));
  await pg.waitForFunction(() => window.GarraDebug && GarraDebug.pronto, null, { timeout: 20000 });
  pg.erros = erros; pg.ctx = ctx;
  return pg;
}
const est = pg => pg.evaluate(() => GarraDebug.estado());
async function jogar(pg, maquina, nivel) {
  await pg.click(`[data-maquina="${maquina}"]`); await pg.click(`[data-nivel="${nivel}"]`); await pg.click('#btJogar');
  await pg.waitForFunction(() => GarraDebug.estado().fase === 'mirar', null, { timeout: 20000 });
}
// segura uma seta da tela por um tempo
async function segurar(pg, sel, ms) {
  const b = await pg.locator(sel).boundingBox();
  await pg.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await pg.mouse.down(); await pg.waitForTimeout(ms); await pg.mouse.up();
}

test('celular: tocar no prêmio leva a garra; com a garra forte ele vem, vai para a coleção e o fim mostra o resultado', async () => {
  const pg = await abrir(FONE, '&semente=11');
  try {
    await jogar(pg, 'lanchonete', 'facil');
    let e = await est(pg);
    assert.equal(e.maquina, 'lanchonete'); assert.equal(e.fichas, 12);
    assert.equal(await pg.$eval('#infoTempo', el => el.hidden), true, 'fácil sem relógio');
    await pg.evaluate(() => { GarraDebug.forte(true); GarraDebug.fichas(1); GarraDebug.velocidade(3); });
    const a = await pg.evaluate(() => GarraDebug.maisAlto());
    const pt = await pg.evaluate((a) => GarraDebug.tela(a.x, a.y + a.r, a.z), a);
    const casa = await est(pg);
    await pg.touchscreen.tap(pt.x, pt.y);   // o toque leva a garra até o prêmio tocado (pode ser um da frente, na mesma linha)
    await pg.waitForFunction((c) => { const e = GarraDebug.estado(); return Math.hypot(e.x - c.x, e.z - c.z) > 1; }, casa, { timeout: 15000 });
    await pg.evaluate((a) => GarraDebug.irPara(a.x, a.z), a);   // e agora bem no meio do mais alto
    await pg.waitForFunction((a) => { const e = GarraDebug.estado(); return Math.hypot(e.x - a.x, e.z - a.z) < 0.05; }, a, { timeout: 15000 });
    await pg.click('#btPegar');
    await pg.waitForSelector('#fim:not([hidden])', { timeout: 60000 });
    e = await est(pg);
    assert.equal(e.fichas, 0);
    assert.ok(e.ganhos.length >= 1, 'com a garra forte e bem mirada, o prêmio vem: ' + JSON.stringify(e));
    assert.equal(await pg.$$eval('#fimPremios img', l => l.length), e.ganhos.length);
    const col = await pg.evaluate(() => GarraDebug.colecao());
    assert.equal(Object.values(col).reduce((s, n) => s + n, 0), e.ganhos.length);
    // coleção: uma aba por máquina, a da lanchonete mostra o que veio; continua lá depois de recarregar
    await pg.click('#btFimColecao');
    assert.equal(await pg.isVisible('#colecao'), true);
    assert.equal(await pg.$$eval('#abas [data-aba]', l => l.length), 5);
    assert.equal(await pg.$$eval('#prateleira .item', l => l.length), 11);
    assert.ok(await pg.$$eval('#prateleira .item:not(.falta)', l => l.length) >= 1);
    await pg.reload(); await pg.waitForFunction(() => window.GarraDebug && GarraDebug.pronto);
    assert.match(await pg.textContent('[data-col="lanchonete"]'), /🧸 \d+\/11/);
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});

test('celular: as setas ⬅ ➡ ⬆ ⬇ levam a garra; no médio tem relógio e a garra desce sozinha', async () => {
  const pg = await abrir(FONE, '&semente=4');
  try {
    await jogar(pg, 'telefone', 'medio');
    assert.equal(await pg.$eval('#infoTempo', el => el.hidden), false, 'médio com relógio');
    const e0 = await est(pg);
    await segurar(pg, '#btDir', 700);
    const e1 = await est(pg);
    assert.ok(e1.x > e0.x + 0.3, 'andou para a direita: ' + e0.x + ' → ' + e1.x);
    await segurar(pg, '#btCima', 700);
    const e2 = await est(pg);
    assert.ok(e2.z < e1.z - 0.3, 'andou para o fundo: ' + e1.z + ' → ' + e2.z);
    await segurar(pg, '#btBaixo', 300); await segurar(pg, '#btEsq', 300);
    const e3 = await est(pg);
    assert.ok(e3.z > e2.z && e3.x < e2.x, 'frente e esquerda');
    await pg.waitForTimeout(200);
    const e4 = await est(pg);
    assert.ok(Math.hypot(e4.x - e3.x, e4.z - e3.z) < 0.05, 'soltou, parou');
    await pg.evaluate(() => GarraDebug.velocidade(10));
    await pg.waitForFunction(() => GarraDebug.estado().fase !== 'mirar', null, { timeout: 15000 });
    assert.equal((await est(pg)).fichas, 9, 'o tempo acabou e gastou a ficha');
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});

test('computador: setas e espaço jogam; 🎥 troca a câmera, 🔍 aproxima e arrastar gira', async () => {
  const pg = await abrir(PC, '&semente=8');
  try {
    await jogar(pg, 'estrelas', 'dificil');
    const e = await est(pg);
    assert.equal(e.maquina, 'estrelas'); assert.equal(e.nivel, 'dificil'); assert.equal(e.fichas, 10);
    await pg.keyboard.down('ArrowRight'); await pg.waitForTimeout(500); await pg.keyboard.up('ArrowRight');
    await pg.keyboard.down('ArrowUp'); await pg.waitForTimeout(400); await pg.keyboard.up('ArrowUp');
    const e1 = await est(pg);
    assert.ok(e1.x > e.x + 0.3 && e1.z < e.z - 0.2, 'setas andam');
    const c0 = await pg.evaluate(() => GarraDebug.camera());
    await pg.click('#btCamera');
    assert.ok((await pg.evaluate(() => GarraDebug.camera())).pitch > c0.pitch + 0.5, 'de cima');
    await pg.click('#btCamera');
    assert.ok((await pg.evaluate(() => GarraDebug.camera())).yaw > 1.4, 'bem de lado');
    await pg.click('#btCamera');
    await pg.click('#btMais');
    assert.ok((await pg.evaluate(() => GarraDebug.camera())).zoom < c0.zoom, 'zoom');
    const r = await pg.locator('#tela').boundingBox();
    await pg.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await pg.mouse.down(); await pg.mouse.move(r.x + r.width / 2 - 150, r.y + r.height / 2, { steps: 6 }); await pg.mouse.up();
    assert.ok(Math.abs((await pg.evaluate(() => GarraDebug.camera())).yaw) > 0.3, 'arrastar gira a câmera');
    await pg.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await pg.mouse.down(); await pg.mouse.move(r.x + r.width / 2 - 600, r.y + r.height / 2, { steps: 8 }); await pg.mouse.up();
    assert.ok(Math.abs((await pg.evaluate(() => GarraDebug.camera())).yaw) > 1.55, 'gira até ver de lado');
    // (o relógio do difícil é curto e o navegador de teste é lento: a ficha é comparada logo antes do espaço)
    await pg.evaluate(() => GarraDebug.fichas(10));
    await pg.waitForFunction(() => GarraDebug.estado().fase === 'mirar', null, { timeout: 30000 });
    const antes = (await est(pg)).fichas;
    await pg.keyboard.press('Space');
    await pg.waitForFunction(() => GarraDebug.estado().fase !== 'mirar');
    assert.equal((await est(pg)).fichas, antes - 1);
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});

test('as 5 máquinas abrem sem erro, cada uma com os seus prêmios (os bichos de verdade são menos, soltos no cobertor)', async () => {
  const pg = await abrir(FONE, '&semente=2');
  try {
    for (const [mq, min, max] of [['telefone', 36, 48], ['neon', 36, 48], ['estrelas', 36, 48], ['lanchonete', 36, 48], ['bichos', 11, 17]]) {
      await pg.goto(base + '?teste&semente=2'); await pg.waitForFunction(() => window.GarraDebug && GarraDebug.pronto);
      await jogar(pg, mq, 'facil');
      const e = await est(pg);
      assert.equal(e.maquina, mq); assert.ok(e.premios >= min && e.premios <= max, mq + ': ' + e.premios + ' prêmios');
    }
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});

test('Voltar do celular e 🏠 voltam ao menu', async () => {
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

test('três idiomas, escolhidos na estante: nome, botões e prêmios no idioma certo, sem botão de idioma próprio', async () => {
  for (const [cod, logo, pegar, lang, premio] of [['pt', 'A-GARRA', 'PEGAR', 'pt-BR', 'Ursinho'], ['en', 'THE CLAW', 'GRAB', 'en', 'Teddy'], ['es', 'LA GARRA', 'COGER', 'es', 'Osito']]) {
    const ctx = await browser.newContext(Object.assign({ locale: cod === 'pt' ? 'en-US' : 'pt-BR' }, FONE));
    await ctx.addInitScript((c) => { localStorage.setItem('bolinho:idioma', c); localStorage.setItem('bolinho:a-garra:colecao', JSON.stringify({ urso: 1 })); }, cod);
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
    const pg = await ctx.newPage();
    try {
      await pg.goto(base + '?teste'); await pg.waitForFunction(() => window.GarraDebug && GarraDebug.pronto);
      assert.equal(await pg.$('#btLingua'), null, 'sem botão de idioma');
      assert.equal(await pg.evaluate(() => document.documentElement.lang), lang);
      assert.equal((await pg.textContent('#logo')).replace(/ /g, ' '), logo);
      assert.equal(await pg.textContent('#btPegar'), pegar);
      await pg.click('#btColecao');
      assert.ok((await pg.textContent('#prateleira')).includes(premio), cod + ': prêmio com o nome no idioma');
    } finally { await ctx.close(); }
  }
});
