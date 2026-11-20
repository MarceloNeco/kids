// 📺 Clipe (dono, 19/Nov/2026): o telão com os bichinhos dançando (clipe.js), na rádio da estante e no H-rraaa.
// - na estante, o botão 📺 aparece no tocador da rádio e abre o telão com o desenho animando (os pixels mudam);
// - o ✕ fecha (e o Esc também);
// - no H-rraaa, o botão 📺 do menu abre o telão;
// - as peças estão ligadas: clipe.js no sw.js da estante e no ARQUIVOS do H-rraaa;
// - nenhum erro no console;
// - telinha dos DJs (dono, 20/Nov/2026): a TV pequena em cima da rádio fica sempre à vista (parada, ▶ liga a rádio), abre o telão
//   ao ser tocada, o ✕ esconde e o aparelho lembra (o botão Clipe traz de volta), não cobre o ▶ e não aparece na TV.
// Rodar da raiz do repositório: node --test teste/clipe.test.js
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const http = require('http');
const fs = require('fs');

const raiz = path.join(__dirname, '..');
const ler = (f) => fs.readFileSync(path.join(raiz, f), 'utf8');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.webmanifest': 'application/manifest+json' };

test('clipe.js ligado: estante (index.html e sw.js) e H-rraaa (index.html e sw.js), textos nos três idiomas', () => {
  assert.ok(ler('index.html').includes('<script src="/kids/clipe.js"></script>'), 'estante carrega o clipe.js');
  assert.ok(ler('sw.js').includes("'clipe.js'"), 'sw.js da estante guarda o clipe.js');
  assert.ok(ler('a-garra/index.html').includes('<script src="../clipe.js" data-fora-do-arquivo></script>'), 'H-rraaa carrega o ../clipe.js');
  assert.ok(ler('a-garra/sw.js').includes("'../clipe.js'"), 'H-rraaa guarda o ../clipe.js');
  const r = ler('radio.js');
  assert.ok(r.includes('<span class="pt">Clipe</span><span class="en">Music video</span><span class="es">Videoclip</span>'), 'botão da rádio nos três idiomas');
  const c = ler('clipe.js');
  for (const m of c.matchAll(/\bT\(('[^']*'), ('[^']*')(, '[^']*')?\)/g)) assert.ok(m[3], 'T() sem o espanhol: ' + m[0]);
  for (const m of c.matchAll(/nome: \[([^\]]*)\]/g)) assert.equal(m[1].split("', '").length, 3, 'cena sem os três idiomas: ' + m[1]);
  assert.match(c, /var CLIPES_VIDEO = \{/, 'lugar para os vídeos de IA');
  assert.match(c, /\n    telinha: \[[^\]]*\]\n/, 'lugar para o vídeo de IA da telinha');
  assert.match(ler('sw.js'), /if \(\/\\\.\(mp4\|webm\)\$\/i\.test\(url\.pathname\)\) return;/, 'sw.js da estante deixa o vídeo passar direto (sem gaveta)');
  for (const m of r.matchAll(/\bT\(('[^']*'), ('[^']*')(, '[^']*')?\)/g)) assert.ok(m[3], 'T() sem o espanhol no radio.js: ' + m[0]);
  assert.ok(r.includes('<span class="pt">Ao vivo</span><span class="en">Live</span><span class="es">En directo</span>'), 'selo da telinha nos três idiomas');
});

test('telão: abre pelo 📺 da rádio e do H-rraaa, anima, fecha pelo ✕ e pelo Esc, sem erro no console', async () => {
  const { chromium } = require('playwright');
  const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (!p.startsWith('/kids/')) { r.writeHead(404); return r.end(); }
    p = p.slice(5); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(raiz, p);
    if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/kids/';
  const b = await chromium.launch();
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(() => { localStorage.setItem('bolinho:novidades-ocultas', '["*"]'); localStorage.setItem('bolinho:idioma', 'pt'); });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    await ctx.route('**/solverone-dados/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"recursos":{}}' }));
    const pg = await ctx.newPage();
    const erros = [];
    pg.on('pageerror', (e) => erros.push(e.message));
    pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) erros.push(m.text()); });
    // dois quadros do telão diferentes = o desenho está animando
    const quadro = () => pg.evaluate(() => { const c = document.querySelector('.clp canvas'), x = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0; for (let i = 0; i < x.length; i += 97) h = (h * 31 + x[i]) >>> 0; return h; });

    // estante: o 📺 Clipe no tocador da rádio
    await pg.goto(base);
    const bt = pg.locator('.radio .r-clipe');
    await bt.waitFor({ state: 'visible' });
    const caixa = await bt.boundingBox(), play = await pg.locator('.radio .r-play').boundingBox(), radio = await pg.locator('.radio').boundingBox();
    assert.ok(caixa.height >= 44, 'botão com pelo menos 44 px de altura');
    assert.ok(caixa.x + caixa.width <= radio.x + radio.width && caixa.y >= radio.y - 1, 'botão dentro do tocador');
    assert.ok(Math.abs((caixa.y + caixa.height / 2) - (play.y + play.height / 2)) < 3, 'botão na mesma linha do ▶');
    assert.strictEqual((await bt.innerText()).replace(/\s+/g, ' ').trim(), 'Clipe');
    assert.strictEqual(await bt.locator('svg.r-tv').count(), 1, 'ícone de traço, no estilo dos cartões (nada de emoji)');
    await bt.click();
    await pg.waitForSelector('.clp.aberto canvas');
    assert.ok(await pg.evaluate(() => BolinhoClipe.aberto()), 'telão aberto');
    await pg.waitForTimeout(400);
    const a = await quadro(); await pg.waitForTimeout(350); const c2 = await quadro();
    assert.notStrictEqual(a, c2, 'o desenho do telão mexe');
    // as três cenas da rádio desenham sem erro
    for (const n of [1, 2, 0]) { await pg.evaluate((n) => BolinhoClipe.cena(n), n); await pg.waitForTimeout(250); }
    assert.match(await pg.textContent('.clp-cena'), /Festa na piscina/);
    await pg.click('.clp-x');
    assert.ok(!(await pg.evaluate(() => BolinhoClipe.aberto())), 'o ✕ fechou');
    assert.ok(!(await pg.isVisible('.clp')), 'telão escondido');
    // Esc também fecha
    await bt.click(); await pg.waitForSelector('.clp.aberto');
    await pg.keyboard.press('Escape');
    assert.ok(!(await pg.evaluate(() => BolinhoClipe.aberto())), 'o Esc fechou');

    // H-rraaa: o 📺 Clipe no menu
    await pg.goto(base + 'a-garra/?teste');
    await pg.waitForFunction(() => window.GarraDebug && window.GarraDebug.pronto);
    await pg.locator('#btClipe').click();
    await pg.waitForSelector('.clp.aberto canvas');
    await pg.waitForTimeout(400);
    const g1 = await quadro(); await pg.waitForTimeout(350); const g2 = await quadro();
    assert.notStrictEqual(g1, g2, 'o desenho do H-rraaa mexe');
    await pg.evaluate(() => BolinhoClipe.cena(1)); await pg.waitForTimeout(250);
    assert.match(await pg.textContent('.clp-cena'), /DJ Garra/);
    await pg.click('.clp-x');
    assert.ok(!(await pg.evaluate(() => BolinhoClipe.aberto())), 'o ✕ fechou no H-rraaa');
    assert.strictEqual(await pg.evaluate(() => GarraDebug.estado().tela), 'menu', 'o jogo continua no menu');

    assert.deepStrictEqual(erros, [], 'erro no console');
    await ctx.close();
  } finally { await b.close(); srv.close(); }
});

test('telinha dos DJs: sempre à vista (parada, ▶ liga a rádio), tocando abre o telão, ✕ esconde e lembra, fora da TV', async () => {
  const { chromium } = require('playwright');
  const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (!p.startsWith('/kids/')) { r.writeHead(404); return r.end(); }
    p = p.slice(5); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(raiz, p);
    if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/kids/';
  const b = await chromium.launch();
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    // começa parada (quem pausou antes): a telinha já aparece, com os DJs esperando e um ▶ (dono, 20/Nov/2026: "não achei o DJ")
    await ctx.addInitScript(() => { localStorage.setItem('bolinho:novidades-ocultas', '["*"]'); localStorage.setItem('bolinho:idioma', 'pt');
      if (!sessionStorage.getItem('ja')) { sessionStorage.setItem('ja', '1'); localStorage.setItem('bolinho:radio:pausado', '1'); } });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    await ctx.route('**/solverone-dados/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"recursos":{}}' }));
    const pg = await ctx.newPage();
    const erros = [];
    pg.on('pageerror', (e) => erros.push(e.message));
    pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) erros.push(m.text()); });
    const quadro = () => pg.evaluate(() => { const c = document.querySelector('.rt-tela canvas'), x = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0; for (let i = 0; i < x.length; i += 53) h = (h * 31 + x[i]) >>> 0; return h; });
    const visivel = () => pg.locator('.r-telinha').evaluate((e) => e.classList.contains('rt-vis') && getComputedStyle(e).visibility === 'visible');
    const tocando = () => pg.evaluate(() => document.querySelector('.radio').classList.contains('tocando'));

    await pg.goto(base);
    await pg.waitForTimeout(600);
    assert.strictEqual(await pg.locator('.r-telinha').count(), 1, 'a telinha existe');
    await pg.waitForSelector('.r-telinha.rt-vis', { timeout: 8000 });
    assert.ok(await visivel(), 'com a rádio parada, a telinha já está à vista');
    assert.ok(!(await tocando()), 'e a rádio continua parada');
    assert.ok(await pg.locator('.rt-tocar').evaluate((e) => getComputedStyle(e).opacity === '1'), 'parada: o ▶ aparece no meio da telinha');

    // tocar na telinha parada liga a rádio; aí ela fica encostada em cima do tocador, centralizada, sem cobrir o ▶, e dança
    await pg.click('.r-telinha .rt-tela');
    await pg.waitForFunction(() => document.querySelector('.radio').classList.contains('tocando'), null, { timeout: 8000 });
    assert.ok(!(await pg.evaluate(() => BolinhoClipe.aberto())), 'com a rádio parada, o toque na telinha só liga a música (não abre o telão)');
    await pg.waitForTimeout(700);
    assert.ok(await visivel(), 'a telinha continua à vista');
    const tel = await pg.locator('.r-telinha').boundingBox(), radio = await pg.locator('.radio').boundingBox(), play = await pg.locator('.radio .r-play').boundingBox();
    assert.ok(Math.abs(tel.y + tel.height - radio.y) < 6, 'encostada em cima do tocador: ' + (tel.y + tel.height) + ' x ' + radio.y);
    assert.ok(Math.abs((tel.x + tel.width / 2) - (radio.x + radio.width / 2)) < 2, 'centralizada no tocador');
    assert.ok(tel.width >= 150 && tel.width <= 205, 'no celular, entre 150 e 200 px: ' + tel.width);
    const cruza = (a, c) => a.x < c.x + c.width && c.x < a.x + a.width && a.y < c.y + c.height && c.y < a.y + a.height;
    assert.ok(!cruza(tel, play), 'a telinha não cobre o ▶');
    const x = await pg.locator('.r-telinha .rt-x').boundingBox();
    assert.ok(!cruza(x, play) && x.y + x.height <= radio.y, 'o ✕ também não');
    const nit = await pg.evaluate(() => { const c = document.querySelector('.rt-tela canvas'); return [c.width, c.clientWidth]; });
    assert.strictEqual(nit[0], Math.round(nit[1] * 2), 'nítida: pintada com devicePixelRatio 2');
    const a1 = await quadro(); await pg.waitForTimeout(300); const a2 = await quadro();
    assert.notStrictEqual(a1, a2, 'os DJs dançam');

    // ⏸: a telinha fica, com o ▶ de novo
    await pg.click('.radio .r-play');
    await pg.waitForTimeout(700);
    assert.ok(await visivel(), 'pausou: a telinha continua à vista');
    assert.ok(await pg.locator('.rt-tocar').evaluate((e) => getComputedStyle(e).opacity === '1'), 'pausou: o ▶ volta');
    const p1 = await quadro(); await pg.waitForTimeout(400); const p2 = await quadro();
    assert.strictEqual(p1, p2, 'pausou: os DJs ficam parados (só mexem com música)');

    // tocando, tocar na telinha abre o telão (e a telinha descansa enquanto ele está aberto)
    await pg.click('.radio .r-play');
    await pg.waitForFunction(() => document.querySelector('.radio').classList.contains('tocando')); await pg.waitForTimeout(600);
    await pg.click('.r-telinha .rt-tela');
    await pg.waitForSelector('.clp.aberto canvas');
    assert.ok(await pg.evaluate(() => BolinhoClipe.aberto()), 'a telinha abriu o telão');
    await pg.waitForTimeout(200);
    const t1 = await quadro(); await pg.waitForTimeout(300); const t2 = await quadro();
    assert.strictEqual(t1, t2, 'com o telão aberto, a telinha não desenha');
    await pg.keyboard.press('Escape');
    assert.ok(!(await pg.evaluate(() => BolinhoClipe.aberto())), 'o Esc fechou o telão');
    await pg.waitForTimeout(300);
    const v1 = await quadro(); await pg.waitForTimeout(300); const v2 = await quadro();
    assert.notStrictEqual(v1, v2, 'fechou o telão: a telinha volta a dançar');

    // ✕ esconde, avisa como voltar e o aparelho lembra
    await pg.click('.r-telinha .rt-x');
    await pg.waitForTimeout(600);
    assert.ok(!(await visivel()), 'o ✕ escondeu a telinha');
    assert.ok(await tocando(), 'a música continua');
    assert.strictEqual(await pg.evaluate(() => localStorage.getItem('bolinho:radio:telinha')), 'oculta');
    assert.match(await pg.textContent('.rt-aviso'), /Clipe/, 'avisa que volta pelo botão Clipe');
    await pg.reload();
    await pg.waitForTimeout(500);
    if (!(await tocando())) await pg.click('.radio .r-play');
    await pg.waitForFunction(() => document.querySelector('.radio').classList.contains('tocando'));
    await pg.waitForTimeout(1000);
    assert.ok(!(await visivel()), 'depois de recarregar, continua escondida');
    // o botão Clipe traz de volta
    await pg.click('.radio .r-clipe');
    await pg.waitForSelector('.clp.aberto');
    await pg.keyboard.press('Escape');
    await pg.waitForSelector('.r-telinha.rt-vis'); await pg.waitForTimeout(600);
    assert.ok(await visivel(), 'o botão Clipe trouxe a telinha de volta');
    assert.strictEqual(await pg.evaluate(() => localStorage.getItem('bolinho:radio:telinha')), null);

    // na TV não aparece
    await pg.goto(base + '?tv=auto');
    await pg.waitForTimeout(500);
    if (!(await tocando())) await pg.click('.radio .r-play');
    await pg.waitForFunction(() => document.querySelector('.radio').classList.contains('tocando'));
    await pg.waitForTimeout(800);
    assert.strictEqual(await pg.locator('.r-telinha').count(), 0, 'na TV não tem telinha');

    assert.deepStrictEqual(erros, [], 'erro no console');
    await ctx.close();
  } finally { await b.close(); srv.close(); }
});
