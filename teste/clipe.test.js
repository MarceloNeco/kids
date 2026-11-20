// 📺 Clipe (dono, 19/Nov/2026): o telão com os bichinhos dançando (clipe.js), na rádio da estante e no H-rraaa.
// - na estante, o botão 📺 aparece no tocador da rádio e abre o telão com o desenho animando (os pixels mudam);
// - o ✕ fecha (e o Esc também);
// - no H-rraaa, o botão 📺 do menu abre o telão;
// - as peças estão ligadas: clipe.js no sw.js da estante e no ARQUIVOS do H-rraaa;
// - nenhum erro no console;
// - tela do DJ (dono, 20/Nov/2026: "é dentro da página do Bolinho FM"): aparece no alto da página do Bolinho FM ao abrir,
//   fica parada sem música e dança com a música da página e também com a rádio da estante tocando; tocando, tocar nela
//   abre o telão (e a página continua aberta ao fechar o telão); a barra da rádio não tem mais telinha; não aparece na TV.
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
  assert.ok(!/r-telinha|rt-tela|com-telinha|bolinho:radio:telinha/.test(r), 'a barra da rádio não tem mais telinha');
  const bib = ler('biblioteca.js');
  assert.ok(bib.includes('<span class="pt">Ao vivo</span><span class="en">Live</span><span class="es">En directo</span>'), 'selo da tela do DJ nos três idiomas');
  for (const m of bib.matchAll(/\bT\(('[^']*'), ('[^']*')(, '[^']*')?\)/g)) assert.ok(m[3], 'T() sem o espanhol no biblioteca.js: ' + m[0]);
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

test('tela do DJ no Bolinho FM: sempre à vista, parada sem música, dança com a música da página e com a rádio, abre o telão, fora da TV', async () => {
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
    // a rádio começa parada (quem pausou antes): a tela do DJ tem que aparecer mesmo assim, com os DJs parados e um ▶
    await ctx.addInitScript(() => { localStorage.setItem('bolinho:novidades-ocultas', '["*"]'); localStorage.setItem('bolinho:idioma', 'pt'); localStorage.setItem('bolinho:radio:pausado', '1'); });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    await ctx.route('**/solverone-dados/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"recursos":{}}' }));
    const pg = await ctx.newPage();
    const erros = [];
    pg.on('pageerror', (e) => erros.push(e.message));
    pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) erros.push(m.text()); });
    const quadro = () => pg.evaluate(() => { const c = document.querySelector('.bib-tela canvas'), x = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0; for (let i = 0; i < x.length; i += 53) h = (h * 31 + x[i]) >>> 0; return h; });
    const mexe = async () => { const a = await quadro(); await pg.waitForTimeout(350); return a !== await quadro(); };
    const dancando = () => pg.locator('.bib-dj').evaluate((e) => e.classList.contains('tocando'));
    const opac = (sel) => pg.locator(sel).evaluate((e) => getComputedStyle(e).opacity);
    const radioTocando = () => pg.evaluate(() => document.querySelector('.radio').classList.contains('tocando'));

    await pg.goto(base);
    await pg.waitForTimeout(500);
    assert.strictEqual(await pg.locator('.r-telinha, .rt-tela').count(), 0, 'a barra da rádio não tem mais telinha');
    assert.ok(!(await pg.evaluate(() => document.body.classList.contains('com-telinha'))), 'nem o espaço extra embaixo');
    assert.ok(!(await radioTocando()), 'a rádio está parada');

    // abre o Bolinho FM: a tela do DJ logo abaixo do título, larga, 16:9, centralizada
    await pg.click('#btBiblioteca');
    await pg.waitForSelector('.bib .bib-dj .bib-tela canvas');
    assert.ok(await pg.evaluate(() => document.querySelector('.bib-topo').nextElementSibling.classList.contains('bib-dj')), 'logo abaixo do título');
    const dj = await pg.locator('.bib-dj').boundingBox(), tela = await pg.locator('.bib-tela').boundingBox();
    assert.ok(await pg.locator('.bib-dj').isVisible(), 'à vista');
    assert.ok(dj.width >= 390 - 2 * 16 - 2 && dj.width <= 390 - 2 * 16 + 1, 'no celular, a largura da tela menos as margens: ' + dj.width);
    assert.ok(Math.abs(tela.width / tela.height - 16 / 9) < 0.02, 'tela 16:9: ' + tela.width + 'x' + tela.height);
    assert.ok(dj.y + dj.height < 844, 'inteira na primeira tela');
    await pg.waitForTimeout(500);
    const nit = await pg.evaluate(() => { const c = document.querySelector('.bib-tela canvas'); return [c.width, c.clientWidth]; });
    assert.strictEqual(nit[0], Math.round(nit[1] * 2), 'nítida: pintada com devicePixelRatio 2');

    // sem música: DJs parados, ▶ no meio, sem o selo "Ao vivo"
    assert.ok(!(await dancando()), 'sem música, não está dançando');
    assert.strictEqual(await opac('.bib-tocar'), '1', 'parada: o ▶ aparece');
    assert.strictEqual(await opac('.bib-vivo'), '0', 'parada: sem o selo Ao vivo');
    assert.ok(!(await mexe()), 'sem música, os DJs ficam parados');

    // trocar o idioma remonta a página: a mesma tela volta ao lugar (uma só, com um canvas só)
    await pg.evaluate(() => { window.__dj = document.querySelector('.bib-dj'); BolinhoIdioma.escolher('en'); });
    await pg.waitForTimeout(200);
    assert.ok(await pg.evaluate(() => document.querySelector('.bib-dj') === window.__dj && document.querySelectorAll('.bib-dj').length === 1 && document.querySelectorAll('.bib-tela canvas').length === 1), 'a mesma tela depois de remontar');
    assert.ok(await pg.evaluate(() => document.querySelector('.bib-topo').nextElementSibling === window.__dj), 'de volta logo abaixo do título');
    assert.match(await pg.locator('.bib-tela').getAttribute('aria-label'), /DJ screen/);

    // música da página: dançam, selo Ao vivo
    await pg.click('.bib li .tocar');
    await pg.waitForFunction(() => document.querySelector('.bib-dj').classList.contains('tocando'), null, { timeout: 8000 });
    await pg.waitForTimeout(500);
    assert.ok(await mexe(), 'com a música da página, os DJs dançam');
    assert.strictEqual(await opac('.bib-vivo'), '1', 'tocando: selo Ao vivo');

    // tocando, tocar na tela abre o telão por cima da página (e a tela descansa); fechar o telão volta para a página
    await pg.click('.bib-tela');
    await pg.waitForSelector('.clp.aberto canvas');
    assert.ok(await pg.evaluate(() => BolinhoClipe.aberto()), 'a tela do DJ abriu o telão');
    assert.ok(await pg.evaluate(() => +getComputedStyle(document.querySelector('.clp')).zIndex > +getComputedStyle(document.querySelector('.bib')).zIndex), 'telão por cima da página');
    assert.match(await pg.textContent('.clp-musica'), /\S/, 'letreiro com a música');
    await pg.waitForTimeout(200);
    assert.ok(!(await mexe()), 'com o telão aberto, a tela do DJ não desenha');
    await pg.click('.clp-x');
    await pg.waitForTimeout(400);
    assert.ok(!(await pg.evaluate(() => BolinhoClipe.aberto())), 'o ✕ fechou o telão');
    assert.ok(await pg.locator('.bib').isVisible(), 'a página do Bolinho FM continua aberta');
    assert.ok(await mexe(), 'fechou o telão: os DJs voltam a dançar');

    // pausou: parados de novo, com o ▶; tocar na tela parada começa a primeira música da lista
    await pg.click('.bib li .tocar');
    await pg.waitForFunction(() => !document.querySelector('.bib-dj').classList.contains('tocando'));
    await pg.waitForTimeout(400);
    assert.ok(!(await mexe()), 'pausou: os DJs param');
    assert.strictEqual(await opac('.bib-tocar'), '1', 'pausou: o ▶ volta');
    await pg.click('.bib-tela');
    await pg.waitForFunction(() => document.querySelector('.bib-dj').classList.contains('tocando'), null, { timeout: 8000 });
    assert.ok(!(await pg.evaluate(() => BolinhoClipe.aberto())), 'parada, o toque na tela só começa a música (não abre o telão)');
    assert.ok(await pg.locator('.bib li').first().evaluate((e) => e.classList.contains('toca')), 'tocou a primeira música da lista');

    // fecha a página (a música dela para) e liga a rádio da estante: ao abrir o Bolinho FM, os DJs dançam a rádio
    await pg.click('.bib-x');
    await pg.click('.radio .r-play');
    await pg.waitForFunction(() => document.querySelector('.radio').classList.contains('tocando'), null, { timeout: 8000 });
    await pg.click('#btBiblioteca');
    await pg.waitForSelector('.bib .bib-dj');
    await pg.waitForTimeout(600);
    assert.ok(await dancando(), 'com a rádio tocando, a tela está ao vivo');
    assert.ok(await mexe(), 'com a rádio tocando, os DJs dançam');
    await pg.click('.bib-tela');
    await pg.waitForSelector('.clp.aberto');
    const nomeRadio = (await pg.textContent('.radio .r-titulo')).trim();
    assert.ok((await pg.textContent('.clp-musica')).includes(nomeRadio), 'o telão mostra a música da rádio: ' + nomeRadio);
    await pg.keyboard.press('Escape');
    assert.ok(!(await pg.evaluate(() => BolinhoClipe.aberto())), 'o Esc fechou o telão');
    assert.ok(await pg.locator('.bib').isVisible(), 'e a página continua aberta');

    // na TV não aparece
    await pg.goto(base + '?tv=auto');
    await pg.waitForTimeout(500);
    await pg.evaluate(() => document.getElementById('btBiblioteca').click());
    await pg.waitForTimeout(300);
    assert.strictEqual(await pg.locator('.bib-dj').count(), 0, 'na TV não tem tela do DJ');

    assert.deepStrictEqual(erros, [], 'erro no console');
    await ctx.close();
  } finally { await b.close(); srv.close(); }
});
