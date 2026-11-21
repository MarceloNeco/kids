// Abertura do Bolinho FM (dono, 21/Nov/2026): quando a rádio da estante começa, a primeira música é SEMPRE a
// "Abertura do Bolinho FM" (fantasia orquestral, composição original, musicas/bolinho-abertura.mp3); depois o resto segue
// sorteado com a favorita (Cool Rock) no fim. Só sai da frente se alguém a tirar do repertório na Biblioteca.
// Rodar da raiz do repositório: node --test teste/radio-abertura.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const raiz = path.join(__dirname, '..');
const MP3 = path.join(raiz, 'musicas', 'bolinho-abertura.mp3');

test('o arquivo da abertura existe, é MP3 e cabe em 2,5 MB; tem crédito e a receita para refazer', () => {
  const b = fs.readFileSync(MP3);
  assert.ok(b.length > 500000 && b.length <= 2.5 * 1048576, 'tamanho: ' + b.length);
  assert.ok(b.slice(0, 3).toString() === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0), 'é MP3');
  assert.match(fs.readFileSync(path.join(raiz, 'CREDITOS.md'), 'utf8'), /`bolinho-abertura\.mp3` \| "Abertura do Bolinho FM" — SolverONE/);
  assert.ok(fs.existsSync(path.join(raiz, 'ferramentas', 'musica-abertura.py')));
});

test('no navegador: a rádio começa pela abertura, toda vez; tirada na Biblioteca, não vem mais na frente', { timeout: 120000 }, async () => {
  const { chromium } = require('playwright');
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
    '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (!p.startsWith('/kids/')) { res.writeHead(404); res.end(); return; }
    p = p.slice('/kids'.length); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(raiz, p);
    if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/kids/';
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    const ctx = await b.newContext({ serviceWorkers: 'block', locale: 'pt-BR', viewport: { width: 1024, height: 800 } });
    await ctx.addInitScript(() => { localStorage.setItem('bolinho:novidades-ocultas', '["*"]'); localStorage.setItem('bolinho:idioma', 'pt'); });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    const pg = await ctx.newPage(); const erros = []; pg.on('pageerror', e => erros.push(e.message));
    const segundas = new Set();
    for (let vez = 0; vez < 5; vez++) {
      await pg.goto(base); await pg.waitForSelector('.radio');
      await pg.waitForFunction(() => window.BolinhoRadio && /bolinho-abertura\.mp3$/.test(BolinhoRadio.audio.src), null, { timeout: 5000 });
      const r = await pg.evaluate(() => ({
        titulo: document.querySelector('.radio .r-titulo').textContent,
        bol: [...document.querySelectorAll('.r-bolinhas button')].map(x => x.getAttribute('aria-label'))
      }));
      assert.match(r.bol[0], /^1: Abertura do Bolinho FM$/, 'vez ' + vez + ': ' + r.bol.join(' | '));
      assert.match(r.bol[r.bol.length - 1], /Cool Rock/, 'a favorita continua no fim');
      assert.strictEqual(r.bol.filter(x => /Abertura/.test(x)).length, 1, 'a abertura só uma vez');
      segundas.add(r.bol[1]);
      await pg.waitForFunction(() => /Abertura do Bolinho FM/.test(document.querySelector('.radio .r-titulo').textContent), null, { timeout: 3000 });
      // ⏭ segue para as outras; ⏮ volta para a abertura
      await pg.click('.radio .r-prox');
      assert.doesNotMatch(await pg.evaluate(() => BolinhoRadio.audio.src), /bolinho-abertura/);
      await pg.click('.radio .r-ant');
      assert.match(await pg.evaluate(() => BolinhoRadio.audio.src), /bolinho-abertura\.mp3$/);
    }
    assert.ok(segundas.size >= 2, 'depois da abertura, o resto continua sorteado: ' + [...segundas].join(' | '));

    // em inglês, o nome da abertura acompanha o idioma
    await pg.goto(base + '?idioma=en'); await pg.waitForSelector('.radio');
    assert.match((await pg.$$eval('.r-bolinhas button', bs => bs.map(x => x.getAttribute('aria-label'))))[0], /Rainy Day FM Opening/);

    // tirada do repertório da rádio na Biblioteca (Trilha.desligar): não vem mais na frente
    await pg.evaluate(() => Trilha.desligar('estante', '/kids/musicas/bolinho-abertura.mp3', true));
    await pg.goto(base); await pg.waitForSelector('.radio');
    const bol = await pg.$$eval('.r-bolinhas button', bs => bs.map(x => x.getAttribute('aria-label')));
    assert.ok(!bol.some(x => /Abertura/.test(x)), bol.join(' | '));
    assert.strictEqual(bol.length, 10);
    assert.deepStrictEqual(erros, []);
  } finally { await b.close(); srv.close(); }
});
