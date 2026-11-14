// Três idiomas (dono, 14/Nov/2026): Português, English e Español. A escolha é feita só na estante (🇧🇷 PT · 🇺🇸 EN ·
// 🇪🇸 ES, idioma.js) e cada jogo abre no idioma escolhido, sem botão de idioma próprio.
// Rodar da raiz do repositório: node --test teste/*.test.js   ·   um jogo só: JOGO=cozinha/ node --test teste/idioma.test.js
const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const raiz = path.join(__dirname, '..');
const dados = fs.mkdtempSync(path.join(os.tmpdir(), 'kids-idioma-'));   // faz o papel de /solverone-dados/ do site
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };

function servidor() {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    let f = null;
    if (p.startsWith('/solverone-dados/')) f = path.join(dados, p.slice('/solverone-dados/'.length));
    else if (p.startsWith('/kids/')) { if (p.endsWith('/')) p += 'index.html'; f = path.join(raiz, p.slice('/kids/'.length)); }
    if (!f || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
}

const TODOS = ['baguncolandia/', 'peluqueria/', 'vruuum/', 'purpurina/', 'rabiscolandia/', 'campo-minado/', 'batalha-naval/',
  'enigmas/', 'labirinto/', 'cozinha/', 'a-garra/', 'aqua/', 'quem-e/', 'danca-na-sala.html'];
const JOGOS = process.env.JOGO ? [process.env.JOGO] : TODOS;
const IDIOMAS = [['pt', /^pt/i, 0], ['en', /^en/i, 1], ['es', /^es/i, 2]];

let srv, base, browser;
test.before(async () => {
  const { chromium } = require('playwright');
  srv = servidor(); await new Promise(r => srv.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + srv.address().port + '/kids/';
  browser = await chromium.launch();
});
test.after(async () => { if (browser) await browser.close(); if (srv) srv.close(); fs.rmSync(dados, { recursive: true, force: true }); });

async function contexto(locale) {
  const ctx = await browser.newContext({ locale: locale || 'pt-BR', viewport: { width: 1000, height: 900 }, serviceWorkers: 'block' });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());   // nada de internet de verdade (YouTube, CDN)
  return ctx;
}
const assentar = (pg) => pg.waitForTimeout(800);
// textos com data-t="PT|EN|ES": quantos NÃO mostram a parte do idioma escolhido
const fora = (pg, i) => pg.evaluate((i) => Array.prototype.filter.call(document.querySelectorAll('[data-t]'), function (el) {
  const p = el.getAttribute('data-t').split('|'); const quer = (p[i] != null ? p[i] : p[0]).trim();
  return el.offsetParent !== null && el.textContent.trim() !== quer && p.some(function (x) { return x.trim() === el.textContent.trim(); });
}).map(el => el.getAttribute('data-t')), i);
const botao = (pg) => pg.evaluate(() => { const b = document.getElementById('btLingua'); return b ? getComputedStyle(b).display : null; });

test('estante: três botões com bandeira, a escolha muda os textos e fica guardada', async () => {
  const ctx = await contexto('pt-BR');
  const pg = await ctx.newPage();
  try {
    await pg.goto(base, { waitUntil: 'load' }); await assentar(pg);
    const bts = await pg.$$eval('[data-idiomas] button', bs => bs.map(b => b.textContent.trim()));
    assert.deepEqual(bts, ['🇧🇷PT', '🇺🇸EN', '🇪🇸ES']);
    assert.match(await pg.evaluate(() => document.body.innerText), /Brincar/);
    for (const [cod, re] of [['en', /\bPlay\b/], ['es', /Jugar/], ['pt', /Brincar/]]) {
      await pg.click('[data-idiomas] button[data-idioma="' + cod + '"]');
      await pg.waitForTimeout(200);
      assert.equal(await pg.evaluate(() => BolinhoIdioma.atual()), cod);
      assert.match(await pg.evaluate(() => document.body.innerText), re, 'estante em ' + cod);
      const r = await pg.evaluate(() => ({ texto: document.body.innerText, j: BolinhoCatalogo.jogos.map(j => ({ pt: j.texto, en: j.en, es: j.es })) }));
      for (const j of r.j) {
        assert.ok(j.es, 'catálogo sem espanhol');
        for (const k of ['pt', 'en', 'es']) {
          if (k === cod) assert.ok(r.texto.includes(j[k]), 'descrição em ' + k + ' escondida: ' + j[k]);
          else if (j[k] !== j[cod]) assert.ok(!r.texto.includes(j[k]), 'descrição em ' + k + ' à vista em ' + cod + ': ' + j[k]);
        }
      }
    }
    await pg.click('[data-idiomas] button[data-idioma="es"]');
    await pg.reload({ waitUntil: 'load' }); await assentar(pg);
    assert.equal(await pg.evaluate(() => BolinhoIdioma.atual()), 'es', 'escolha guardada');
  } finally { await ctx.close(); }
});

for (const jogo of JOGOS) {
  test('jogo ' + jogo + ': abre no idioma escolhido na estante (pt, en, es), sem botão de idioma próprio', async () => {
    for (const [cod, re, i] of IDIOMAS) {
      const ctx = await contexto(cod === 'pt' ? 'en-US' : 'pt-BR');   // o aparelho em outro idioma: vale a escolha da estante
      await ctx.addInitScript((c) => { try { localStorage.setItem('bolinho:idioma', c); } catch (e) {} }, cod);
      const pg = await ctx.newPage();
      try {
        await pg.goto(base + jogo, { waitUntil: 'load' }); await assentar(pg);
        assert.match(await pg.evaluate(() => document.documentElement.lang), re, cod + ': <html lang>');
        assert.deepEqual(await fora(pg, i), [], cod + ': textos em outro idioma à vista');
        const b = await botao(pg);
        if (b !== null) assert.equal(b, 'none', 'botão de idioma do jogo escondido');
      } finally { await ctx.close(); }
    }
  });
}
