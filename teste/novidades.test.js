// ✨ Novidades da semana (dono, 14/Nov/2026): jogo que entrou na estante há até 7 dias (campo "novo" do catalogo.js)
// aparece numa janela bonita (ícone, nome, frase, ▶ Jogar) uma vez por aparelho, e o cartão dele ganha "✨ Novo".
// Rodar da raiz do repositório: node --test teste/novidades.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const raiz = path.join(__dirname, '..');

test('catálogo: datas "novo" válidas e de no máximo hoje', () => {
  const w = { }; new Function('window', 'document', fs.readFileSync(path.join(raiz, 'catalogo.js'), 'utf8'))(w, { querySelectorAll: () => [] });
  for (const j of w.BolinhoCatalogo.jogos) if (j.novo) {
    assert.match(j.novo, /^\d{4}-\d{2}-\d{2}$/, j.id + ': novo no formato AAAA-MM-DD');
    assert.ok(Date.parse(j.novo) <= Date.now() + 864e5, j.id + ': data no futuro');
  }
  const C = w.BolinhoCatalogo, dia = (s) => Date.parse(s + 'T12:00:00');
  assert.ok(C.ehNovo({ novo: '2026-11-14' }, dia('2026-11-14')) && C.ehNovo({ novo: '2026-11-14' }, dia('2026-11-20')));
  assert.ok(!C.ehNovo({ novo: '2026-11-14' }, dia('2026-11-21')) && !C.ehNovo({}, dia('2026-11-14')));
});

test('estante: janela de novidades com os jogos da semana, uma vez só; selo ✨ Novo; some depois de 7 dias e na TV', async () => {
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
  // "hoje" fixo: o dia em que entraram AQUA, GLUB GLUB, A-GARRA e Quem é?
  const contexto = async (hoje, cod) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    await ctx.addInitScript(([t, c]) => { const D = Date; Date.now = () => t; localStorage.setItem('bolinho:idioma', c || 'pt'); }, [hoje, cod]);
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    return ctx;
  };
  try {
    const hoje = Date.parse('2026-11-15T10:00:00');
    let ctx = await contexto(hoje), pg = await ctx.newPage();
    await pg.goto(base); await pg.waitForSelector('.nov:not([hidden])', { timeout: 3000 });
    assert.match(await pg.textContent('#novTitulo'), /Novidades da semana/);
    const ids = await pg.$$eval('.nov li a', (as) => as.map((a) => a.getAttribute('data-jogo')));
    assert.deepStrictEqual(ids.sort(), ['a-garra', 'aqua', 'glub-glub', 'quem-e']);
    assert.ok(await pg.$$eval('.nov li a .ic img', (is) => is.every((i) => i.complete && i.naturalWidth > 0)), 'ícones carregados');
    assert.ok(await pg.evaluate(() => document.querySelector('.nov-c').scrollWidth <= document.querySelector('.nov-c').clientWidth + 1), 'nada rola para o lado');
    assert.strictEqual(await pg.$$eval('.card .novo-selo', (s) => s.length), 4, 'selo ✨ Novo nos 4 cartões');
    await pg.click('.nov .ok');
    assert.ok(await pg.$eval('.nov', (e) => e.hidden), 'Legal! fecha');
    await pg.reload(); await pg.waitForTimeout(1500);
    assert.ok(await pg.$eval('.nov', (e) => e.hidden).catch(() => true), 'não aparece de novo no mesmo aparelho');
    await ctx.close();

    for (const [cod, titulo] of [['en', /New this week/], ['es', /Novedades de la semana/]]) {
      ctx = await contexto(hoje, cod); pg = await ctx.newPage();
      await pg.goto(base); await pg.waitForSelector('.nov:not([hidden])', { timeout: 3000 });
      assert.match(await pg.textContent('#novTitulo'), titulo, cod);
      await ctx.close();
    }
    // na TV: sem janela por cima (só o selo)
    ctx = await contexto(hoje); pg = await ctx.newPage();
    await pg.goto(base + '?tv=auto'); await pg.waitForTimeout(1500);
    assert.strictEqual(await pg.$('.nov'), null, 'TV: sem janela');
    await ctx.close();
    // 8 dias depois: nada
    ctx = await contexto(Date.parse('2026-11-22T10:00:00')); pg = await ctx.newPage();
    await pg.goto(base); await pg.waitForTimeout(1500);
    assert.strictEqual(await pg.$('.nov'), null, 'sem novidades depois de 7 dias');
    assert.strictEqual(await pg.$$eval('.card .novo-selo', (s) => s.length), 0, 'sem selo depois de 7 dias');
    await ctx.close();
  } finally { await b.close(); srv.close(); }
});
