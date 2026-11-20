// Aberto pelo Bolinho, o jogo já começa com a música tocando (dono, 20/Nov/2026). O toque em "Jogar" na estante vale
// também para a página do jogo (Chrome), então: quem usa a Trilha comum (Trilha.iniciar) já tenta tocar ao abrir; quem tem
// tocador próprio pergunta Trilha.podeTocarJa() ao abrir e liga a música. Aberto direto, a música espera o primeiro toque.
// Rodar da raiz do repositório: node --test teste/musica-ao-abrir.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const raiz = path.join(__dirname, '..');

test('todo jogo com música liga ao abrir: Trilha.iniciar ou Trilha.podeTocarJa()', () => {
  const jogos = fs.readdirSync(raiz).filter((g) => fs.existsSync(path.join(raiz, g, 'app.js')) && fs.existsSync(path.join(raiz, g, 'sw.js')));
  assert.ok(jogos.length >= 18);
  for (const g of jogos) {
    const app = fs.readFileSync(path.join(raiz, g, 'app.js'), 'utf8');
    assert.ok(/Trilha\.iniciar\(/.test(app) || /Trilha\.podeTocarJa\(\)/.test(app), g + ': a música não liga sozinha ao abrir pelo Bolinho');
  }
});

test('Peluqueria aberta pela estante: a música toca sem outro toque; aberta direto, espera o toque', { timeout: 120000 }, async () => {
  const { chromium } = require('playwright');
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2' };
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
  const b = await chromium.launch({ args: ['--autoplay-policy=document-user-activation-required'] });
  try {
    const abrir = async (pelaEstante) => {
      const ctx = await b.newContext({ viewport: { width: 412, height: 860 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
      await ctx.addInitScript(() => {
        localStorage.setItem('bolinho:novidades-ocultas', '["*"]'); localStorage.setItem('bolinho:idioma', 'pt');
        window.__tocou = []; const P = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function () { const r = P.call(this); r.then(() => __tocou.push(this.src), () => {}); return r; };
      });
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
      const pg = await ctx.newPage();
      if (pelaEstante) {
        await pg.goto(base); await pg.waitForSelector('.card[data-jogo="peluqueria"] .c-jogar');
        await Promise.all([pg.waitForURL(/\/peluqueria\//), pg.tap('.card[data-jogo="peluqueria"] .c-jogar')]);
      } else await pg.goto(base + 'peluqueria/');
      await pg.waitForTimeout(3000);
      const tocou = await pg.evaluate(() => window.__tocou.length);
      await ctx.close();
      return tocou;
    };
    assert.ok(await abrir(true) > 0, 'pela estante: música tocando');
    assert.strictEqual(await abrir(false), 0, 'direto: espera o primeiro toque (regra do navegador)');
  } finally { await b.close(); srv.close(); }
});
