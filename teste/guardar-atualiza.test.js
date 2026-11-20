// "Guardar todos" deixa todos os jogos na última versão (dono, 20/Nov/2026: "quando eu coloco guardar local, ele já tem
// que garantir que todos estejam atualizados para a última"). Jogo já guardado no aparelho + versão nova publicada:
// tocar em Guardar traz a versão nova inteira, e o jogo não pergunta "quer atualizar?" depois.
// Rodar da raiz do repositório: node --test teste/guardar-atualiza.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const raiz = path.join(__dirname, '..');

function servidor(trocar) {
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
  return http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (!p.startsWith('/kids/')) { r.writeHead(404); return r.end(); }
    p = p.slice(6); if (!p || p.endsWith('/')) p += 'index.html';
    // só o AQUA é guardado neste teste (os outros jogos ficam de fora para ser rápido); músicas também
    if (/\/sw\.js$/.test(p) && p !== 'aqua/sw.js' && p !== 'sw.js') { r.writeHead(404); return r.end(); }
    if (/\.mp3$/.test(p) && !/^aqua\/sons\//.test(p)) { r.writeHead(404); return r.end(); }
    const f = path.join(raiz, p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    let corpo = fs.readFileSync(f);
    if (trocar.nova && (p === 'aqua/sw.js')) corpo = Buffer.from(corpo.toString().replace(/var VERSAO = '[^']+'/, "var VERSAO = '9.9.9'"));
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); r.end(corpo);
  });
}

test('Guardar todos: jogo já guardado ganha a versão nova publicada', { timeout: 180000 }, async () => {
  const { chromium } = require('playwright');
  const trocar = { nova: false };
  const srv = servidor(trocar); await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/kids/';
  const b = await chromium.launch();
  try {
    const ctx = await b.newContext({ viewport: { width: 412, height: 860 } });
    await ctx.addInitScript(() => { localStorage.setItem('bolinho:idioma', 'pt'); localStorage.setItem('bolinho:novidades-ocultas', '["*"]'); });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    const pg = await ctx.newPage();
    await pg.goto(base); await pg.evaluate(() => navigator.serviceWorker.ready);
    const guardar = async () => {
      await pg.click('#todos button.forte');
      await pg.waitForFunction(() => { const b = document.querySelector('#todos button.forte'); return b && !b.disabled; }, null, { timeout: 150000 });
    };
    const gavetas = () => pg.evaluate(() => caches.keys().then((k) => k.filter((n) => /^aqua-v/.test(n))));
    await guardar();
    const antes = await gavetas();
    assert.ok(antes.length === 1 && !/9\.9\.9/.test(antes[0]), 'AQUA guardado na versão de hoje: ' + antes);
    assert.match(await pg.textContent('#todos .st'), /Guardando|guardados|Pronto/);
    // sai versão nova do AQUA; tocar em Guardar de novo traz ela
    trocar.nova = true;
    await guardar();
    const depois = await gavetas();
    assert.ok(depois.some((n) => /^aqua-v9\.9\.9-/.test(n)), 'versão nova guardada: ' + depois);
    assert.ok(!depois.some((n) => n === antes[0]), 'a gaveta da versão velha sai: ' + depois);
    await ctx.close();
  } finally { await b.close(); srv.close(); }
});
