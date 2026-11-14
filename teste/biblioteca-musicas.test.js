// 🎵 Biblioteca de músicas da estante (dono, 14/Nov/2026): todas as músicas gravadas dos jogos e da rádio, com nome,
// autor e licença, para ouvir uma por uma.
// - biblioteca-musicas.js está em dia com o que cada jogo toca (senão: node ferramentas/biblioteca-musicas.js);
// - toda música tem nome, autor e licença, e o arquivo existe;
// - na estante, o botão 🎵 abre a lista por jogo, o ▶ toca, e o ✕ e o Voltar do celular fecham sem sair da estante.
// Rodar da raiz do repositório: node --test teste/biblioteca-musicas.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const raiz = path.join(__dirname, '..');
const gerar = require('../ferramentas/biblioteca-musicas.js');
const LISTAS = require('./listas-musica.js');

test('biblioteca-musicas.js em dia com as músicas de cada jogo, com nome, autor e licença', () => {
  assert.strictEqual(fs.readFileSync(path.join(raiz, 'biblioteca-musicas.js'), 'utf8'), gerar(),
    'a biblioteca está desatualizada: rode  node ferramentas/biblioteca-musicas.js  na raiz do repositório');
  const w = {}; new Function('window', fs.readFileSync(path.join(raiz, 'biblioteca-musicas.js'), 'utf8'))(w);
  assert.deepStrictEqual(w.BolinhoBiblioteca.jogos.map((j) => j.id), Object.keys(LISTAS), 'um bloco por jogo e a rádio');
  for (const j of w.BolinhoBiblioteca.jogos) for (const m of j.musicas) {
    assert.ok(m.t && m.au && m.lic, j.id + ': falta nome, autor ou licença em ' + m.a + ' (acrescente no CREDITOS.md ou no LICENCAS.md)');
    assert.ok(fs.existsSync(path.join(raiz, m.a.replace(/^\/kids\//, ''))), j.id + ': arquivo não existe ' + m.a);
  }
});

test('estante: 🎵 abre a biblioteca, ▶ toca, Voltar fecha sem sair da estante', async () => {
  const { chromium } = require('playwright');
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.mp3': 'audio/mpeg', '.webmanifest': 'application/manifest+json' };
  const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (!p.startsWith('/kids/')) { r.writeHead(404); return r.end(); }
    p = p.slice(6); if (!p || p.endsWith('/')) p += 'index.html';
    const f = path.join(raiz, p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/kids/';
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    for (const [cod, titulo] of [['pt', /Biblioteca de músicas/], ['en', /Music library/], ['es', /Biblioteca de música/]]) {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
      await ctx.addInitScript((c) => { localStorage.setItem('bolinho:idioma', c); localStorage.setItem('bolinho:novidades-vistas', '["*"]'); }, cod);
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
      const pg = await ctx.newPage(), erros = [];
      pg.on('pageerror', (e) => erros.push(e.message));
      await pg.goto(base); await pg.waitForTimeout(500);
      await pg.click('#btBiblioteca');
      await pg.waitForSelector('.bib:not([hidden])');
      assert.match(await pg.textContent('#bibTitulo'), titulo, cod + ': título');
      assert.strictEqual(await pg.$$eval('.bib h3', (h) => h.length), Object.keys(LISTAS).length, cod + ': um bloco por jogo');
      assert.ok(await pg.$$eval('.bib li', (l) => l.length) >= 150, cod + ': as músicas de todos os jogos');
      const larg = await pg.evaluate(() => document.querySelector('.bib').scrollWidth <= innerWidth + 1);
      assert.ok(larg, cod + ': a lista rola para o lado em 390 px');
      if (cod === 'pt') {
        await pg.click('.bib li >> nth=3 >> button');
        await pg.waitForFunction(() => document.querySelector('.bib li.toca') || document.querySelector('.bib li em'), null, { timeout: 5000 });
        const src = await pg.$eval('.bib li >> nth=3', (li) => li.getAttribute('data-a'));
        assert.match(src, /\.mp3$/);
      }
      await pg.goBack(); await pg.waitForTimeout(300);
      assert.ok(await pg.$eval('.bib', (e) => e.hidden), cod + ': o Voltar fechou a biblioteca');
      assert.strictEqual(pg.url(), base, cod + ': o Voltar não saiu da estante');
      await pg.click('#btBiblioteca'); await pg.click('.bib-x');
      assert.ok(await pg.$eval('.bib', (e) => e.hidden), cod + ': o ✕ fecha');
      assert.deepStrictEqual(erros, [], cod + ': erro na página');
      await ctx.close();
    }
  } finally { await b.close(); srv.close(); }
});
