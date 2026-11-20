// Filtros da estante (dono, 20/Nov/2026): "Todos" aceso de começo; tocar num recurso (sem internet, em dois, com o
// corpo, na TV, inclinar) apaga o "Todos" e mostra só os jogos que têm todos os recursos acesos; "Todos" volta tudo.
// No celular só os ícones, cabendo sem rolar de 320 px para cima; na tela larga ícone + nome. O "?" explica.
// Rolando a estante, a fileira fica presa no alto da tela (dono, 20/Nov/2026).
// Rodar da raiz do repositório: node --test teste/estante-filtros.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const raiz = path.join(__dirname, '..');

function servidor() {
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
  return http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (!p.startsWith('/kids/')) { r.writeHead(404); return r.end(); }
    p = p.slice(6); if (!p || p.endsWith('/')) p += 'index.html';
    const f = path.join(raiz, p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  });
}

test('estante: filtros por recurso, Todos de começo, juntar filtros, caber no celular, explicar', { timeout: 120000 }, async () => {
  const { chromium } = require('playwright');
  const w = {}; new Function('window', 'document', fs.readFileSync(path.join(raiz, 'catalogo.js'), 'utf8'))(w, { querySelectorAll: () => [] });
  const tem = (j, k) => (k === 'off' ? !j.soOnline : (j.rec || []).indexOf(k) >= 0);
  const esperado = (fs_) => w.BolinhoCatalogo.jogos.filter((j) => fs_.every((k) => tem(j, k))).map((j) => j.id).sort();
  const srv = servidor(); await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/kids/';
  const b = await chromium.launch();
  try {
    for (const [cod, larg] of [['pt', 320], ['en', 390], ['es', 1280]]) {
      const ctx = await b.newContext({ viewport: { width: larg, height: 800 }, isMobile: larg < 600, hasTouch: true, serviceWorkers: 'block' });
      await ctx.addInitScript((c) => { localStorage.setItem('bolinho:idioma', c); localStorage.setItem('bolinho:novidades-ocultas', '["*"]'); }, cod);
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
      const pg = await ctx.newPage(), erros = []; pg.on('pageerror', (e) => erros.push(e.message));
      await pg.goto(base); await pg.waitForSelector('.filtros .f-todos');
      const vistos = () => pg.$$eval('.grid .card:not(.filtrado)', (cs) => cs.map((c) => c.dataset.jogo).sort());
      const todos = () => pg.getAttribute('.f-todos', 'aria-pressed');
      assert.strictEqual(await todos(), 'true', cod + ': Todos aceso de começo');
      assert.deepStrictEqual(await vistos(), w.BolinhoCatalogo.jogos.map((j) => j.id).sort(), cod + ': todos os jogos à vista');
      assert.ok(await pg.$eval('.filtros', (f) => f.scrollWidth <= f.clientWidth + 1), cod + ' ' + larg + ': a fileira cabe sem rolar');
      assert.strictEqual(await pg.$eval('.f-dois .f-txt', (e) => getComputedStyle(e).display !== 'none'), larg >= 896, cod + ': nome do filtro só na tela larga');
      await pg.click('.f-dois');
      assert.strictEqual(await todos(), 'false', cod + ': um filtro apaga o Todos');
      assert.deepStrictEqual(await vistos(), esperado(['dois']), cod + ': em dois');
      await pg.click('.f-tv');
      assert.deepStrictEqual(await vistos(), esperado(['dois', 'tv']), cod + ': em dois + na TV');
      await pg.click('.f-dois'); await pg.click('.f-tv');
      assert.strictEqual(await todos(), 'true', cod + ': sem filtro aceso, o Todos volta');
      await pg.click('.f-off');
      assert.deepStrictEqual(await vistos(), esperado(['off']), cod + ': sem internet');
      assert.ok(!(await vistos()).includes('danca-na-sala'), 'a Dança na Sala precisa de internet');
      await pg.click('.f-todos');
      assert.strictEqual((await vistos()).length, w.BolinhoCatalogo.jogos.length, cod + ': Todos mostra tudo de novo');
      await pg.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await pg.waitForTimeout(100);
      const topo = await pg.$eval('.filtros', (f) => f.getBoundingClientRect().top);
      assert.ok(topo >= 0 && topo < 24, cod + ': rolando a estante, os filtros ficam presos no alto (top ' + topo + ')');
      await pg.click('.f-dois'); await pg.click('.f-dois');
      await pg.evaluate(() => window.scrollTo(0, 0));
      await pg.click('.f-q');
      assert.ok(await pg.$eval('.c-bal', (e) => !e.hidden && e.textContent.length > 20), cod + ': o ? explica');
      assert.deepStrictEqual(erros, []);
      await ctx.close();
    }
  } finally { await b.close(); srv.close(); }
});
