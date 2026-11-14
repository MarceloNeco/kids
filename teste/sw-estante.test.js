// Service worker da estante (dono, 14/Nov/2026, print com português e espanhol misturados): com a internet lenta (mais
// de 4 s), a cópia guardada tem de vir SÓ da gaveta da estante — nunca da gaveta antiga de um jogo instalado, que pode
// ter uma peça comum velha (ex.: o idioma.js de antes dos três idiomas).
// Rodar da raiz do repositório: node --test teste/sw-estante.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const raiz = path.join(__dirname, '..');
// o idioma.js de antes dos três idiomas (só escondia o inglês com a classe "sem-ingles")
const VELHO = "(function(){var d=document;d.documentElement.classList.add('sem-ingles');var e=d.createElement('style');e.textContent='.sem-ingles .en{display:none!important}';d.head.appendChild(e);window.BolinhoIdioma={ingles:function(){return false},aoMudar:function(){}};})();";

test('estante: internet lenta + gaveta antiga de jogo com idioma.js velho = continua com um idioma só', async () => {
  const { chromium } = require('playwright');
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
  let lento = false;
  const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (!p.startsWith('/kids/')) { r.writeHead(404); return r.end(); }
    p = p.slice(6); if (!p || p.endsWith('/')) p += 'index.html';
    const f = path.join(raiz, p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    const manda = () => { r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); };
    if (lento && p === 'idioma.js') setTimeout(manda, 7000); else manda();
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/kids/';
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'pt-BR' });
  await ctx.addInitScript(() => localStorage.setItem('bolinho:novidades-ocultas', '["*"]'));
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  const pg = await ctx.newPage();
  try {
    // 1) uma gaveta antiga de jogo, criada antes, com o idioma.js velho no mesmo endereço
    await pg.goto(base + 'icone-192.png');
    await pg.evaluate(async ([u, js]) => { const c = await caches.open('dgo-baguncolandia-v0.1'); await c.put(u, new Response(js, { headers: { 'Content-Type': 'text/javascript' } })); }, [base + 'idioma.js', VELHO]);
    // 2) a estante com internet boa: o service worker guarda a peça nova na gaveta dele
    await pg.goto(base);
    await pg.evaluate(() => navigator.serviceWorker.ready);
    await pg.reload(); await pg.waitForTimeout(500);
    assert.ok(await pg.evaluate(() => !!navigator.serviceWorker.controller), 'a estante ficou com o service worker');
    // 3) internet lenta para o idioma.js: a cópia guardada tem de ser a da estante
    lento = true;
    await pg.reload({ timeout: 20000 }); await pg.waitForTimeout(5500);
    const r = await pg.evaluate(() => ({ classe: document.documentElement.className, botao: !!document.querySelector('[data-idiomas] .bi-atual'),
      texto: document.querySelector('h1').innerText }));
    assert.match(r.classe, /idioma-pt/, 'o idioma.js novo (da gaveta da estante) rodou: ' + r.classe);
    assert.ok(r.botao, 'o botão de idioma está lá');
    assert.strictEqual(r.texto.trim(), 'Bolinho de Chuva', 'um idioma só no título');
  } finally { await ctx.close(); await b.close(); srv.close(); }
});
