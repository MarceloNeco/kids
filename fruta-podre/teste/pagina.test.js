// Teste da página no Chromium (Playwright): node --test fruta-podre/teste/pagina.test.js (rodar da raiz do repositório kids).
// Com ?teste o jogo expõe window.FrutaDebug: jogar(fase, nivel), estado(), lancar(angulo, forca), poder(), vencer(), semFrutas().
const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const IGNORAR = /solverone-dados|favicon|\.mp3/i;   // interruptores do RootifyONE e músicas não importam aqui
const FONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
const DEITADO = { viewport: { width: 915, height: 412 }, hasTouch: true, isMobile: true };
let browser, base;

test.before(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/fruta-podre/';
  browser = await chromium.launch();
});
test.after(async () => { if (browser) await browser.close(); server.close(); });

async function abrir(ctxOp, busca) {
  const ctx = await browser.newContext(Object.assign({ locale: 'pt-BR', serviceWorkers: 'block' }, ctxOp));
  await ctx.addInitScript(() => { try { localStorage.setItem('bolinho:idioma', 'pt'); } catch (e) {} });
  const pg = await ctx.newPage(), erros = [];
  pg.on('console', m => { if (m.type() === 'error') { const u = (m.location() && m.location().url) || ''; if (!IGNORAR.test(u + m.text())) erros.push(m.text() + ' @' + u); } });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  pg.on('requestfailed', r => { if (!IGNORAR.test(r.url())) erros.push('falhou: ' + r.url()); });
  await pg.goto(base + '?teste' + (busca || ''));
  await pg.waitForFunction(() => window.FrutaDebug && FrutaDebug.pronto && !document.documentElement.classList.contains('bc-carregando'));
  pg.erros = erros; pg.ctx = ctx;
  return pg;
}
const est = pg => pg.evaluate(() => FrutaDebug.estado());
const dentro = (pg, sel) => pg.$eval(sel, e => { const r = e.getBoundingClientRect(); return { r: { t: r.top, b: r.bottom, l: r.left, ri: r.right }, w: innerWidth, h: innerHeight, sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight }; });

for (const [nome, op] of [['em pé (390×844)', FONE], ['deitado (915×412)', DEITADO]]) {
  test('menu ' + nome + ': #btJogar à vista sem rolar, título, mapa das 8 fases e nível', async () => {
    const pg = await abrir(op);
    const d = await dentro(pg, '#btJogar');
    assert.ok(d.r.t >= 0 && d.r.b <= d.h && d.r.l >= 0 && d.r.ri <= d.w, '#btJogar fora da tela: ' + JSON.stringify(d));
    assert.ok(d.sw <= d.w && d.sh <= d.h, 'a página rola');
    assert.equal(await pg.textContent('#btJogar'), '▶ Jogar fase 1');
    assert.equal(await pg.$$eval('#mapa .fase-bt', b => b.length), 8);
    assert.equal(await pg.$$eval('#mapa .fase-bt.trancada', b => b.length), 7, 'só a fase 1 começa destravada');
    assert.equal(await pg.$eval('#logo', h => h.textContent), 'FRUTAPODRE');
    assert.equal(await pg.$$eval('[data-nivel]', b => b.length), 3);
    const c = await pg.$eval('#cena', e => { const r = e.getBoundingClientRect(); return { w: r.width, h: r.height }; });
    assert.ok(c.w >= op.viewport.width - 1 && c.h >= op.viewport.height - 1, 'o canvas ocupa a tela');
    assert.deepEqual(pg.erros, []);
    await pg.ctx.close();
  });
}

test('fase 1: #btJogar começa, a fruta voa e acerta a fortaleza; o arrastar do dedo também lança', async () => {
  const pg = await abrir(DEITADO);
  await pg.click('#btJogar');
  await pg.waitForFunction(() => FrutaDebug.estado().tela === 'jogo');
  let e = await est(pg);
  assert.equal(e.fase, 1); assert.equal(e.turno, 'mira'); assert.ok(e.pragas >= 1); assert.ok(e.frutas >= 3);
  assert.ok(await pg.isVisible('#hudPontos'));
  assert.ok(await pg.evaluate(() => FrutaDebug.lancar(20, 1)));
  await pg.waitForTimeout(250);
  const x1 = (await est(pg)).lider.x;
  await pg.waitForTimeout(250);
  const x2 = (await est(pg)).lider.x;
  assert.ok(x2 > x1 + 50, 'a fruta voa para a direita (' + x1 + ' → ' + x2 + ')');
  await pg.waitForFunction(() => FrutaDebug.estado().impactos > 0, null, { timeout: 8000 });
  await pg.waitForFunction(() => FrutaDebug.estado().turno === 'mira', null, { timeout: 15000 });
  e = await est(pg);
  assert.ok(e.pontos > 0, 'fez pontos');
  // agora com o dedo: arrastar a fruta para trás e soltar (depois que a câmera voltou ao estilingue)
  await pg.waitForFunction(() => { const a = FrutaDebug.estado().camera; const ok = window.__cx != null && Math.abs(a.x0 - window.__cx) < 0.5; window.__cx = a.x0; return ok; }, null, { timeout: 6000, polling: 200 });
  const b = await pg.evaluate(() => FrutaDebug.ondeNaTela(180, 470));
  await pg.mouse.move(b.x, b.y); await pg.mouse.down();
  await pg.mouse.move(b.x - 50, b.y + 30, { steps: 4 }); await pg.mouse.move(b.x - 100, b.y + 60, { steps: 4 });
  await pg.mouse.up();
  await pg.waitForFunction(() => FrutaDebug.estado().turno === 'voo', null, { timeout: 3000 });
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});

test('teclado / controle da TV: setas miram e OK lança', async () => {
  const pg = await abrir(DEITADO);
  await pg.evaluate(() => FrutaDebug.jogar(1, 'medio'));
  await pg.waitForTimeout(1500);
  await pg.keyboard.press('ArrowUp'); await pg.keyboard.press('ArrowLeft');
  await pg.keyboard.press('Enter');
  await pg.waitForFunction(() => FrutaDebug.estado().turno === 'voo', null, { timeout: 3000 });
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});

test('Trio Uva-Passa: o poder no ar vira 3 projéteis', async () => {
  const pg = await abrir(DEITADO);
  await pg.evaluate(() => FrutaDebug.jogar(2, 'medio'));
  assert.equal((await est(pg)).atual, 'trio_uva');
  await pg.evaluate(() => FrutaDebug.lancar(35, 0.9));
  await pg.waitForTimeout(250);
  assert.ok(await pg.evaluate(() => FrutaDebug.poder()), 'usou o poder');
  assert.equal((await est(pg)).projeteis, 3);
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});

test('vencer abre a tela de vitória com estrelas, guarda no aparelho e destrava a fase 2', async () => {
  const pg = await abrir(FONE);
  await pg.evaluate(() => FrutaDebug.jogar(1, 'medio'));
  await pg.evaluate(() => FrutaDebug.vencer());
  await pg.waitForFunction(() => FrutaDebug.estado().fim, null, { timeout: 8000 });
  assert.equal(await pg.textContent('#fimTitulo'), 'Fase limpa!');
  assert.equal(await pg.$$eval('#fimEstrelas .est', e => e.length), 3);
  const ganhas = await pg.$$eval('#fimEstrelas .est.ganhou', e => e.length);
  assert.ok(ganhas >= 1);
  assert.match(await pg.textContent('#fimPontos'), /Pontos: [\d.]+/);
  assert.ok(await pg.isVisible('#btProxima'));
  const prog = await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:fruta-podre:progresso')));
  assert.equal(prog.estrelas[1], ganhas);
  await pg.click('#btProxima');
  await pg.waitForFunction(() => FrutaDebug.estado().fase === 2);
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});

test('perder abre a tela de derrota (as frutas acabam com praga viva, contagem de 5 s)', async () => {
  const pg = await abrir(DEITADO);
  await pg.evaluate(() => FrutaDebug.jogar(1, 'medio'));
  await pg.evaluate(() => { FrutaDebug.semFrutas(); FrutaDebug.lancar(75, 0.3); });
  await pg.waitForFunction(() => FrutaDebug.estado().turno === 'contagem', null, { timeout: 15000 });
  assert.ok(await pg.isVisible('#contagem'));
  await pg.waitForFunction(() => FrutaDebug.estado().fim, null, { timeout: 10000 });
  assert.equal(await pg.textContent('#fimTitulo'), 'As pragas venceram!');
  assert.equal(await pg.$$eval('#fimEstrelas .est.ganhou', e => e.length), 0);
  assert.equal(await pg.textContent('#btDeNovo'), '🔄 Tentar de novo');
  await pg.click('#btDeNovo');
  await pg.waitForFunction(() => FrutaDebug.estado().turno === 'mira' && !FrutaDebug.estado().fim);
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});

test('três idiomas: EN e ES trocam o nome e os textos (sem botão de idioma)', async () => {
  for (const [l, nome, jogar] of [['en', 'ROTTENFRUIT', '▶ Play level 1'], ['es', 'FRUTAPODRIDA', '▶ Jugar fase 1']]) {
    const ctx = await browser.newContext(Object.assign({ locale: 'pt-BR', serviceWorkers: 'block' }, DEITADO));
    await ctx.addInitScript((c) => localStorage.setItem('bolinho:idioma', c), l);
    const pg = await ctx.newPage();
    await pg.goto(base + '?teste');
    await pg.waitForFunction(() => window.FrutaDebug);
    assert.equal(await pg.$eval('#logo', h => h.textContent), nome);
    assert.equal(await pg.textContent('#btJogar'), jogar);
    assert.match(await pg.evaluate(() => document.documentElement.lang), new RegExp('^' + l));
    assert.equal(await pg.$('#btLingua'), null);
    await ctx.close();
  }
});
