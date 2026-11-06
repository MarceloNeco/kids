// Cozinha no Chromium (Playwright), jogando de verdade: node --test cozinha/teste/*.test.js (da raiz do repositório)
// Sobe um servidor pequeno na raiz do repositório e abre /cozinha/?teste (esperas curtinhas, frutas maduras).
// Joga receitas do Fácil do começo ao fim no tamanho de celular, tablet e computador, sem erro no console;
// confere o mercadinho com moedas e troco, a vizinha com obrigado, as fichas misturadas e o imprevisto do Difícil.
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg', '.md': 'text/plain' };
let server, base, browser;

test.before(async () => {
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    // interruptores do RootifyONE moram em outro repositório: aqui respondem "nada desligado"
    if (p.startsWith('/solverone-dados/')) { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{}'); return; }
    const f = path.join(raiz, p);
    if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/cozinha/';
  browser = await chromium.launch();
});
test.after(async () => { if (browser) await browser.close(); if (server) server.close(); });

async function abrir(viewport, extra) {
  const ctx = await browser.newContext(Object.assign({ viewport, locale: 'pt-BR', reducedMotion: 'reduce' }, extra || {}));   // sem animação sem fim: o Playwright clica sem esperar parar
  const pg = await ctx.newPage(), erros = [];
  pg.on('console', m => { if (m.type() === 'error') erros.push(m.text() + ' @' + (m.location() && m.location().url)); });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  await pg.goto(base + '?teste');
  return { ctx, pg, erros };
}
async function centro(pg, sel) { const b = await pg.locator(sel).boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height }; }
async function segurar(pg, sel, ms) { const c = await centro(pg, sel); await pg.mouse.move(c.x, c.y); await pg.mouse.down(); await pg.waitForTimeout(ms); await pg.mouse.up(); }
async function circulos(pg, sel, voltas) {
  const c = await centro(pg, sel), r = Math.min(c.w, c.h) * 0.36;
  await pg.mouse.move(c.x + r, c.y); await pg.mouse.down();
  for (let i = 1; i <= voltas * 24; i++) { const a = i / 24 * 2 * Math.PI; await pg.mouse.move(c.x + r * Math.cos(a), c.y + r * Math.sin(a)); }
  await pg.mouse.up();
}
async function deslizar(pg, sel) {
  const c = await centro(pg, sel);
  await pg.mouse.move(c.x - c.w * 0.35, c.y - 10); await pg.mouse.down();
  for (let i = 1; i <= 8; i++) await pg.mouse.move(c.x - c.w * 0.35 + i * c.w * 0.7 / 8, c.y + 10);
  await pg.mouse.up();
}
async function noLugar(pg, id) { await pg.click('[data-lugar="' + id + '"]'); await pg.waitForSelector('#lugar.ativa'); }
async function voltarVila(pg) { await pg.click('#lugar .voltar'); await pg.waitForSelector('#mapa.ativa'); }
const tem = (pg, id) => pg.evaluate(i => window.Cozinha.jogo().cesta[i] || 0, id);

async function comecar(pg, nivel, rec) {
  await pg.click('#btEntrar');
  await pg.click('[data-nivel="' + nivel + '"]');
  await pg.click('[data-rec="' + rec + '"]');
  await pg.waitForSelector('#receita.ativa');
  await pg.click('#btBuscar');
  await pg.waitForSelector('#mapa.ativa');
}

// faz o passo atual na cozinha, do jeito que uma criança faria
async function fazerPasso(pg) {
  const p = await pg.evaluate(() => { const j = window.Cozinha.jogo(), id = j.cz.atual; return j.passos.find(x => x.id === id); });
  const feitos = await pg.evaluate(() => window.Cozinha.jogo().cz.feitos.length);
  const brilha = await pg.locator('[data-u="' + p.u + '"].luz').count();
  await pg.click('[data-u="' + p.u + '"]');
  await pg.waitForFunction(() => window.Cozinha.jogo().cz.fase === 'acao');
  switch (p.a) {
    case 'lavar': case 'mexer': await circulos(pg, '#palco .alvo-giro', 3.2); break;
    case 'cortar': for (let i = 0; i < 12 && await pg.evaluate(n => window.Cozinha.jogo().cz.feitos.length === n, feitos); i++) { await deslizar(pg, '#palco .tabua-alvo'); await pg.waitForTimeout(i % 4 === 3 ? 520 : 40); } break;
    case 'por': for (const i of p.ing) await pg.click('#palco .chip-ing[data-ing="' + i + '"]'); break;
    case 'bater': await segurar(pg, '#palco .bt-segurar', 700); break;
    case 'ligar': case 'desligar': await pg.click('#palco .botao-fogao'); break;
    case 'despejar': await pg.click('#palco .origem'); break;
    case 'virar': await pg.waitForSelector('#palco .bt-virar.luz'); await pg.click('#palco .bt-virar'); break;
    case 'assar': case 'gelar': case 'esperar': await pg.click('#palco .bt-timer'); await pg.waitForSelector('#palco .bt-timer.luz:not(:disabled)'); await pg.click('#palco .bt-timer'); break;
    case 'maos': for (let i = 0; i < 5; i++) await pg.click('#palco .massa-mao'); break;
    case 'servir': await pg.click('#palco .bt-servir'); break;
  }
  await pg.waitForFunction(n => window.Cozinha.jogo().cz.feitos.length > n, feitos, { timeout: 5000 });
  return { p, brilha };
}
async function cozinhar(pg, esperaBrilho) {
  await pg.waitForSelector('#cozinha.ativa');
  const n = await pg.evaluate(() => window.Cozinha.jogo().passos.length);
  for (let k = 0; k < n; k++) {
    await pg.waitForFunction(() => { const j = window.Cozinha.jogo(); return window.Cozinha.atual() === 'cozinha' && (j.cz.fase === 'utensilio' || j.cz.fase === 'ficha'); }, null, { timeout: 5000 });
    if (await pg.evaluate(() => window.Cozinha.jogo().cz.fase === 'ficha')) {
      // Difícil: escolhe uma ficha que já pode ser feita (todas as que vêm antes estão prontas)
      const id = await pg.evaluate(() => { const j = window.Cozinha.jogo(); return j.passos.find(p => !j.cz.feitos.includes(p.id) && p.dep.every(d => j.cz.feitos.includes(d))).id; });
      await pg.click('#palco .ficha-bt[data-passo="' + id + '"]');
      await pg.waitForFunction(() => window.Cozinha.jogo().cz.fase === 'utensilio');
    }
    const r = await fazerPasso(pg);
    if (esperaBrilho) assert.equal(r.brilha, 1, 'no Fácil o utensílio certo brilha (' + r.p.id + ')');
  }
  await pg.waitForSelector('#pronto.ativa', { timeout: 5000 });
}

async function vitaminaFacil(viewport, extra) {
  const { ctx, pg, erros } = await abrir(viewport, extra);
  await comecar(pg, 'facil', 'vitamina');
  assert.equal(await pg.locator('#cestaMapa .item').count(), 2, 'a cesta mostra os 2 ingredientes do Fácil');
  // pomar: colher uma banana madura
  await noLugar(pg, 'pomar');
  await pg.click('.fruta.madura[data-ing="banana"]');
  assert.equal(await tem(pg, 'banana'), 1);
  await voltarVila(pg);
  // a casa ainda não deixa cozinhar
  await pg.click('[data-lugar="casa"]');
  assert.ok(await pg.locator('#mapa.ativa').count(), 'sem tudo na cesta, fica na vila');
  assert.match(await pg.textContent('#aviso'), /Ainda falta/);
  // fazendinha: segurar para tirar o leite
  await noLugar(pg, 'vaca');
  await segurar(pg, '#btOrdenhar', 700);
  await pg.waitForFunction(() => (window.Cozinha.jogo().cesta.leite || 0) === 1);
  await voltarVila(pg);
  assert.ok(await pg.locator('[data-lugar="casa"].pronta').count(), 'a casa brilha com a cesta completa');
  await pg.click('[data-lugar="casa"]');
  await cozinhar(pg, true);
  assert.match(await pg.textContent('#prontoTitulo'), /Vitamina de banana/);
  assert.equal((await pg.textContent('#prontoEstrelas')).match(/⭐/g).length, 3, '3 estrelas sem erro');
  assert.match(await pg.textContent('#cartao'), /Receita da família/);
  assert.match(await pg.textContent('#cartao'), /1 banana/);
  const prog = await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:cozinha:progresso')));
  assert.equal(prog.r.vitamina.facil, 3, 'progresso guardado');
  // de volta ao menu, a receita aparece com as estrelas
  await pg.click('#btOutra');
  assert.equal((await pg.textContent('[data-rec="vitamina"] .rec-est')).match(/⭐/g).length, 3);
  // sem rolagem para o lado
  assert.ok(await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'a página rola para o lado');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
}

test('celular em pé: vitamina de banana no Fácil, do começo ao fim', { timeout: 60000 }, async () => {
  await vitaminaFacil({ width: 390, height: 844 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
});

test('computador: vitamina de banana no Fácil, do começo ao fim', { timeout: 60000 }, async () => {
  await vitaminaFacil({ width: 1280, height: 800 });
});

test('tablet: bolo de cenoura no Fácil, juntando na horta, no galinheiro e no mercadinho de graça', { timeout: 90000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 800, height: 1280 }, { hasTouch: true });
  await comecar(pg, 'facil', 'bolo-cenoura');
  await noLugar(pg, 'horta');
  for (let i = 0; i < 2; i++) {
    const planta = pg.locator('.planta[data-ing="cenoura"]:not(:disabled)').first();
    for (let k = 0; k < 3; k++) await planta.click();
  }
  await pg.waitForFunction(() => window.Cozinha.jogo().cesta.cenoura === 2);
  await voltarVila(pg);
  await noLugar(pg, 'galinheiro');
  for (let i = 0; i < 2; i++) { await pg.locator('.galinha').nth(i).click(); await pg.locator('.ovo:not([hidden])').first().click(); }
  assert.equal(await tem(pg, 'ovo'), 2);
  await voltarVila(pg);
  await noLugar(pg, 'mercado');
  assert.match(await pg.textContent('.prateleira'), /grátis/);
  await pg.click('.produto[data-ing="farinha"]'); await pg.click('.produto[data-ing="farinha"]');
  assert.equal(await tem(pg, 'farinha'), 2);
  await voltarVila(pg);
  await pg.click('[data-lugar="casa"]');
  await cozinhar(pg, true);
  assert.match(await pg.textContent('#prontoTitulo'), /Bolo de cenoura/);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('Médio: mercadinho com moedas e troco, vizinha só entrega depois do obrigado, erro de utensílio conta', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 }, { hasTouch: true });
  await comecar(pg, 'medio', 'brigadeiro');
  const m0 = await pg.evaluate(() => window.Cozinha.jogo().moedas);
  assert.ok(m0 >= 9, 'moedas suficientes no Médio');
  await noLugar(pg, 'mercado');
  await pg.click('.produto[data-ing="leitecond"]');
  await pg.waitForSelector('.caixa:not([hidden])');
  assert.ok(await pg.locator('.cx-pagar:disabled').count(), 'sem moeda no balcão não paga');
  await pg.click('.cx-carteira .moeda.m5');          // dá uma moeda de 5 para algo de 3
  await pg.click('.cx-pagar');
  assert.equal(await tem(pg, 'leitecond'), 1);
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().moedas), m0 - 3, 'pagou 3');
  assert.match(await pg.textContent('#aviso'), /Troco: 💰 2/);
  await voltarVila(pg);
  await noLugar(pg, 'vizinha');
  await pg.click('.pedido[data-ing="manteiga"]');
  assert.equal(await tem(pg, 'manteiga'), 0, 'ainda não agradeceu');
  await pg.click('#btObrigado');
  assert.equal(await tem(pg, 'manteiga'), 1);
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().favores), 2);
  await voltarVila(pg);
  // completa o resto e erra o utensílio uma vez na cozinha
  await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
  await pg.click('[data-lugar="casa"]');
  await pg.waitForSelector('#cozinha.ativa');
  await pg.click('#utensilios .utensilio:not([data-u="pia"])');
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().erros), 1);
  assert.ok(await pg.locator('[data-u="pia"].luz').count(), 'depois de errar, o utensílio certo brilha');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('Difícil: imprevisto ao chegar em casa e fichas misturadas que respeitam a ordem', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 1280, height: 800 });
  await comecar(pg, 'dificil', 'vitamina');
  assert.ok(await pg.locator('#sol:not([hidden])').count(), 'o sol aparece no Difícil');
  await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
  await pg.click('[data-lugar="casa"]');
  assert.ok(await pg.locator('#mapa.ativa').count(), 'o imprevisto segura na vila');
  assert.match(await pg.textContent('#aviso'), /Biscoito/);
  assert.equal(await pg.evaluate(() => { const j = window.Cozinha.jogo(); return j.precisa.every(x => (j.cesta[x.id] || 0) >= x.q); }), false);
  await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
  await pg.click('[data-lugar="casa"]');
  await pg.waitForSelector('#cozinha.ativa');
  assert.ok(await pg.locator('.ficha-bt').count() >= 5, 'fichas misturadas');
  await pg.click('.ficha-bt[data-passo="servir"]');
  assert.match(await pg.textContent('#aviso'), /Ainda não/);
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().erros), 1);
  await pg.click('.ficha-bt[data-passo="lavar"]');
  await pg.waitForFunction(() => window.Cozinha.jogo().cz.fase === 'utensilio');
  assert.equal(await pg.locator('.utensilio.luz').count(), 0, 'no Difícil o utensílio não brilha de cara');
  await fazerPasso(pg);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

for (const nivel of ['medio', 'dificil']) {
  test('todas as receitas do nível ' + nivel + ' chegam ao fim na cozinha (todo tipo de passo funciona)', { timeout: 240000 }, async () => {
    const { ctx, pg, erros } = await abrir({ width: 1024, height: 768 });
    const ids = await pg.evaluate(() => window.CozinhaDados.RECEITAS.map(r => r.id));
    await pg.click('#btEntrar'); await pg.click('[data-nivel="' + nivel + '"]');
    for (const id of ids) {
      await pg.click('[data-rec="' + id + '"]'); await pg.click('#btBuscar'); await pg.waitForSelector('#mapa.ativa');
      await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.imprevistoFeito = true; j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
      await pg.click('[data-lugar="casa"]');
      await cozinhar(pg, false);
      const est = (await pg.textContent('#prontoEstrelas')).match(/⭐/g).length;
      assert.ok(est >= 2, id + ': estrelas ' + est);
      await pg.click('#btOutra'); await pg.waitForSelector('#menu.ativa');
    }
    const prog = await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:cozinha:progresso')));
    assert.equal(Object.keys(prog.r).filter(k => prog.r[k][nivel]).length, ids.length, 'todas guardadas no progresso');
    assert.deepEqual(erros, [], 'erros no console');
    await ctx.close();
  });
}

test('inglês: troca de língua no menu e textos da receita em EN', { timeout: 30000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 });
  await pg.click('#btEntrar');
  if ((await pg.textContent('#btLingua')).trim() === 'EN') await pg.click('#btLingua');
  assert.match(await pg.textContent('#menu'), /Pick a recipe/);
  await pg.click('[data-rec="pizza"]');
  assert.match(await pg.textContent('#recIngredientes'), /cups of flour/);
  assert.equal(await pg.evaluate(() => document.documentElement.lang), 'en');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});
