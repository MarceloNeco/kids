// A personagem da Purpurina 80's viaja para os outros jogos (dono, 22/Nov/2026; viajar.js + ../personagens.js):
// vira "Purpurina 80's" (retrato 256×256 e corpo 384×512, fundo transparente) ao abrir o jogo e ao sair do estúdio
// quando mudou; sem ter brincado, nada sai. Rodar da raiz do repositório: node --test purpurina-80s/teste/viajar.test.js
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require('playwright');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const servidor = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (!p.startsWith('/kids/') || /\.mp3$/.test(p)) { res.writeHead(404); res.end(); return; }
  p = p.slice('/kids'.length); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});

let navegador, base;
before(async () => {
  await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + servidor.address().port + '/kids/';
  navegador = await chromium.launch();
});
after(async () => { if (navegador) await navegador.close(); servidor.close(); });

async function abrir(ctx, erros) {
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(e.message));
  await pg.goto(base + 'purpurina-80s/'); await pg.waitForTimeout(500);
  return pg;
}
async function contexto() {
  const ctx = await navegador.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await ctx.addInitScript(() => { localStorage.setItem('bolinho:idioma', 'pt'); localStorage.setItem('purpurina80s.semMusica', '1'); });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  return ctx;
}
const imagem = (pg, url) => pg.evaluate((u) => new Promise((ok) => { const i = new Image(); i.onload = () => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0); ok({ w: i.width, h: i.height, canto: x.getImageData(1, 1, 1, 1).data[3], meio: x.getImageData(i.width / 2, i.height / 2, 1, 1).data[3] }); }; i.src = u; }), url);

test('exporta a personagem do Brincar livre da Nova Era para os outros jogos', async () => {
  const ctx = await contexto(), erros = [];
  try {
    let pg = await abrir(ctx, erros);
    await pg.waitForTimeout(2000);
    assert.deepEqual(await pg.evaluate(() => BolinhoPersonagens.listar().length), 0, 'sem ter brincado, nada é exportado');
    await pg.evaluate(() => localStorage.setItem('purpurina80s.atual', JSON.stringify(PurpurinaVisual.novo())));
    await pg.close(); pg = await abrir(ctx, erros);
    await pg.waitForFunction(() => BolinhoPersonagens.listar({ jogo: 'purpurina-80s' }).length === 1, null, { timeout: 8000 });
    const p = await pg.evaluate(() => BolinhoPersonagens.pegar('purpurina-80s:minha'));
    assert.equal(p.nome, "Purpurina 80's"); assert.equal(p.tipo, 'pessoa'); assert.equal(p.jogo, 'purpurina-80s'); assert.equal(p.temCorpo, true);
    const r = await imagem(pg, p.retrato), c = await imagem(pg, p.corpo);
    assert.deepEqual([r.w, r.h, r.canto], [256, 256, 0], 'retrato 256×256 com fundo transparente');
    assert.ok(r.meio > 200, 'o rosto no meio do retrato');
    assert.deepEqual([c.w, c.h, c.canto], [384, 512, 0], 'corpo 384×512 com fundo transparente');
    assert.ok(c.meio > 200, 'o corpo no meio');
    // mudou no estúdio e saiu: exporta de novo (o retrato muda)
    const antes = p.atualizado;
    // mudou no estúdio e saiu (a tela #estudio deixa de ser a ativa): exporta de novo
    await pg.evaluate(() => { const e = PurpurinaVisual.surpresa(PurpurinaVisual.novo(), () => 0.3); localStorage.setItem('purpurina80s.atual', JSON.stringify(e)); document.getElementById('estudio').classList.add('ativa'); });
    await pg.waitForTimeout(100);
    await pg.evaluate(() => document.getElementById('estudio').classList.remove('ativa')); await pg.waitForTimeout(1500);
    const depois = await pg.evaluate(() => BolinhoPersonagens.listar({ jogo: 'purpurina-80s' })[0].atualizado);
    assert.ok(depois > antes, 'saiu do estúdio com a personagem mudada: exportou de novo');
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

