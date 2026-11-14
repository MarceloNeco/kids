// Ajudantes dos testes no navegador da Cozinha (não é teste): servidor pequeno na raiz do repositório kids,
// Chromium do Playwright e os gestos de uma criança (tocar, segurar, fazer círculos, deslizar para cortar).
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg', '.md': 'text/plain' };
let server, base, browser;

async function iniciar() {
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    // interruptores do RootifyONE moram em outro repositório: aqui respondem "nada desligado" e o inglês ligado
    // (interruptor "ingles", ../idioma.js), para os testes que trocam o idioma
    if (p.startsWith('/solverone-dados/')) { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(p.endsWith('/kids.json') ? '{"recursos":{"ingles":{"ligado":true}}}' : '{}'); return; }
    const f = path.join(raiz, p);
    if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/cozinha/';
  browser = await chromium.launch();
}
async function fechar() { if (browser) await browser.close(); if (server) server.close(); }

// antes (opcional): função que roda na página antes do jogo (ex.: trocar a voz do navegador por uma de mentira)
// idioma (opcional): 'pt', 'en' ou 'es', como se a estante tivesse escolhido (localStorage "bolinho:idioma", ../idioma.js)
async function abrir(viewport, extra, antes, idioma) {
  const ctx = await browser.newContext(Object.assign({ viewport, locale: 'pt-BR', reducedMotion: 'reduce' }, extra || {}));   // sem animação sem fim: o Playwright clica sem esperar parar
  if (idioma) await ctx.addInitScript(c => { try { localStorage.setItem('bolinho:idioma', c); } catch (e) { /* ok */ } }, idioma);
  if (antes) await ctx.addInitScript(antes);
  const pg = await ctx.newPage(), erros = [];
  pg.on('console', m => { if (m.type() === 'error') erros.push(m.text() + ' @' + (m.location() && m.location().url)); });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  await pg.goto(base + '?teste');
  return { ctx, pg, erros };
}
async function centro(pg, sel) { await pg.locator(sel).scrollIntoViewIfNeeded(); const b = await pg.locator(sel).boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height }; }
async function segurar(pg, sel, ms) { const c = await centro(pg, sel); await pg.mouse.move(c.x, c.y); await pg.mouse.down(); await pg.waitForTimeout(ms); await pg.mouse.up(); }
async function circulos(pg, sel, voltas) {
  const c = await centro(pg, sel), r = Math.min(c.w, c.h) * 0.36;
  await pg.mouse.move(c.x + r, c.y); await pg.mouse.down();
  for (let i = 1; i <= voltas * 12; i++) { const a = i / 12 * 2 * Math.PI; await pg.mouse.move(c.x + r * Math.cos(a), c.y + r * Math.sin(a)); }
  await pg.mouse.up();
}
async function deslizar(pg, sel) {
  const c = await centro(pg, sel);
  await pg.mouse.move(c.x - c.w * 0.35, c.y - 10); await pg.mouse.down();
  for (let i = 1; i <= 4; i++) await pg.mouse.move(c.x - c.w * 0.35 + i * c.w * 0.7 / 4, c.y + 10);
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


module.exports = { iniciar, fechar, abrir, centro, segurar, circulos, deslizar, noLugar, voltarVila, tem, comecar, fazerPasso, cozinhar };
