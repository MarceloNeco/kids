// Janelas da estante (dono, 14/Nov/2026: "a tela de trás continua se movendo"): com o Bolinho FM, as Novidades da semana
// ou o passo a passo de instalar abertos, rolar até o fim da janela (dois dedos no touchpad, roda do mouse ou dedo
// arrastando) não pode mexer a página de trás; fechando, a página volta a rolar.
// Rodar da raiz do repositório: node --test teste/janelas.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const raiz = path.join(__dirname, '..');

test('estante: janela aberta trava a página de trás (touchpad, roda e dedo)', async () => {
  const { chromium } = require('playwright');
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
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
  const b = await chromium.launch();
  const JANELAS = [
    { nome: 'Bolinho FM', abrir: async (pg) => { await pg.$eval('#btBiblioteca', (x) => x.click()); return '.bib'; }, fechar: (pg) => pg.click('.bib-x') },
    { nome: 'Novidades', novidades: true, abrir: async (pg) => { await pg.waitForSelector('.nov:not([hidden])', { timeout: 3000 }); return '.nov-c'; }, fechar: (pg) => pg.click('.nov .ok') },
    { nome: 'Instalar', abrir: async (pg) => { await pg.$eval('.bc-btn', (x) => x.click()); await pg.waitForSelector('.bc-fundo:not([hidden])'); return '.bc-passos'; }, fechar: (pg) => pg.click('.bc-fechar') }
  ];
  try {
    for (const [w, h, toque] of [[1100, 700, false], [390, 700, true]]) {
      for (const j of JANELAS) {
        const onde = j.nome + ' ' + w + 'px';
        const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: toque, isMobile: toque, locale: 'pt-BR', serviceWorkers: 'block',
          userAgent: toque ? 'Mozilla/5.0 (Linux; Android 14; SM-A146B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36' : undefined });
        await ctx.addInitScript((nov) => { if (!nov) localStorage.setItem('bolinho:novidades-ocultas', '["*"]'); window.Date.now = () => Date.parse('2026-11-15T10:00:00'); }, !!j.novidades);
        await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
        const pg = await ctx.newPage();
        await pg.goto(base); await pg.waitForTimeout(400);
        if (!j.novidades) await pg.evaluate(() => window.scrollTo(0, 300));
        const sel = await j.abrir(pg);
        await pg.waitForTimeout(150);
        const antes = await pg.evaluate(() => window.scrollY);
        const caixa = await pg.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 200) }; });
        await pg.mouse.move(caixa.x, caixa.y);
        for (let i = 0; i < 25; i++) await pg.mouse.wheel(0, 600);   // muito além do fim da janela
        if (toque) {
          const cdp = await ctx.newCDPSession(pg);
          for (let i = 0; i < 4; i++) await cdp.send('Input.synthesizeScrollGesture', { x: Math.round(caixa.x), y: Math.round(caixa.y), yDistance: -900, speed: 3000, gestureSourceType: 'touch' });
        }
        await pg.waitForTimeout(300);
        assert.strictEqual(await pg.evaluate(() => window.scrollY), antes, onde + ': a página de trás rolou');
        assert.ok(await pg.evaluate(() => document.documentElement.classList.contains('trava-fundo')), onde + ': fundo travado');
        await j.fechar(pg); await pg.waitForTimeout(200);
        assert.ok(!(await pg.evaluate(() => document.documentElement.classList.contains('trava-fundo'))), onde + ': fechou e destravou');
        await pg.mouse.wheel(0, 400); await pg.waitForTimeout(200);
        assert.ok(await pg.evaluate(() => window.scrollY) > antes, onde + ': depois de fechar, a página rola');
        await ctx.close();
      }
    }
  } finally { await b.close(); srv.close(); }
});
