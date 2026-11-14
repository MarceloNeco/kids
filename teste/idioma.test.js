// Três idiomas (dono, 14/Nov/2026): Português, English e Español. A escolha é feita só na estante (🇧🇷 PT · 🇺🇸 EN ·
// 🇪🇸 ES, idioma.js) e cada jogo abre no idioma escolhido, sem botão de idioma próprio.
// Rodar da raiz do repositório: node --test teste/*.test.js   ·   um jogo só: JOGO=cozinha/ node --test teste/idioma.test.js (JOGO=- = só a estante)
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
function publicar(ingles) {
  fs.mkdirSync(path.join(dados, 'recursos'), { recursive: true });
  const arq = path.join(dados, 'recursos', 'kids.json');
  if (ingles) fs.writeFileSync(arq, JSON.stringify({ recursos: { ingles: { ligado: true } } }));
  else if (fs.existsSync(arq)) fs.unlinkSync(arq);
}

const TODOS = ['baguncolandia/', 'peluqueria/', 'vruuum/', 'purpurina/', 'rabiscolandia/', 'campo-minado/', 'batalha-naval/',
  'enigmas/', 'labirinto/', 'cozinha/', 'a-garra/', 'aqua/', 'quem-e/', 'glub-glub/', 'danca-na-sala.html'];
const JOGOS = process.env.JOGO === '-' ? [] : process.env.JOGO ? [process.env.JOGO] : TODOS;
const IDIOMAS = [['pt', /^pt/i, 0], ['en', /^en/i, 1], ['es', /^es/i, 2]];

let srv, base, browser;
test.before(async () => {
  const { chromium } = require('playwright');
  srv = servidor(); await new Promise(r => srv.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + srv.address().port + '/kids/';
  browser = await chromium.launch();
});
test.after(async () => { if (browser) await browser.close(); if (srv) srv.close(); fs.rmSync(dados, { recursive: true, force: true }); });

async function abrir(url) {
  const ctx = await browser.newContext({ locale: 'en-US', viewport: { width: 1000, height: 900 }, serviceWorkers: 'block' });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());   // nada de internet de verdade (YouTube, CDN)
  const pg = await ctx.newPage();
  await pg.goto(base + url, { waitUntil: 'load' });
  return { ctx, pg };
}
// o recursos.js lê o arquivo do RootifyONE logo depois de abrir: espera ele chegar (ou o 404)
const assentar = (pg) => pg.waitForTimeout(800);

test('estante sem arquivo publicado, navegador em inglês: nenhum texto em inglês à vista', async () => {
  publicar(false);
  const { ctx, pg } = await abrir('');
  try {
    await pg.goto(base, { waitUntil: 'load' }); await assentar(pg);
    const bts = await pg.$$eval('[data-idiomas] button', bs => bs.map(b => b.textContent.trim()));
    assert.deepEqual(bts, ['PT', 'EN', 'ES']);
    const imgs = await pg.$$eval('[data-idiomas] button img', is => is.map(i => ({ src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0 })));
    assert.deepEqual(imgs.map(i => i.src.replace(/^.*\/kids\//, '')), ['bandeiras/br.svg', 'bandeiras/us.svg', 'bandeiras/es.svg'], 'bandeiras em arquivo SVG');
    assert.ok(imgs.every(i => i.ok), 'bandeiras carregadas');
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

test('estante com o interruptor "ingles" ligado: as linhas em inglês voltam', async () => {
  publicar(true);
  const { ctx, pg } = await abrir('');
  try {
    await pg.waitForFunction(() => !document.documentElement.classList.contains('sem-ingles'), null, { timeout: 8000 });
    const r = await pg.evaluate(() => ({ texto: document.body.innerText, en: BolinhoCatalogo.jogos.map(j => j.en) }));
    for (const en of r.en) assert.ok(r.texto.includes(en), 'inglês escondido: ' + en);
    assert.match(r.texto, /Brincar \/ Play/);
    assert.match(r.texto, /All games on this device/);
    assert.match(r.texto, /My Little Big Chef/);
  } finally { await ctx.close(); publicar(false); }
});

// textos com data-t="PT|EN" que estão mostrando o inglês
const emIngles = (pg) => pg.evaluate(() => Array.prototype.filter.call(document.querySelectorAll('[data-t]'), function (el) {
  const p = el.getAttribute('data-t').split('|'); return p[1] && p[1] !== p[0] && el.textContent.trim() === p[1].trim();
}).length);
const botao = (pg) => pg.evaluate(() => { const b = document.getElementById('btLingua'); return b ? getComputedStyle(b).display : null; });

for (const jogo of JOGOS) {
  test('jogo ' + jogo + ': navegador em inglês sem arquivo = português, sem botão de idioma; ligado = como antes', async () => {
    publicar(false);
    let { ctx, pg } = await abrir(jogo);
    try {
      await assentar(pg);
      assert.match(await pg.evaluate(() => document.documentElement.lang), /^pt/i, 'lang');
      assert.equal(await emIngles(pg), 0, 'textos em inglês à vista');
      const b = await botao(pg);
      if (b !== null) assert.equal(b, 'none', 'botão de idioma escondido');
    } finally { await ctx.close(); }

    publicar(true);
    ({ ctx, pg } = await abrir(jogo));
    try {
      await pg.waitForFunction(() => !document.documentElement.classList.contains('sem-ingles'), null, { timeout: 8000 });
      const b = await botao(pg);
      if (b !== null) assert.notEqual(b, 'none', 'botão de idioma à vista');
      // na próxima vez que abre (o interruptor já guardado no aparelho), o navegador em inglês abre em inglês, como antes
      await pg.reload({ waitUntil: 'load' }); await assentar(pg);
      assert.ok((await emIngles(pg)) > 0, 'inglês de volta depois de ligar');
    } finally { await ctx.close(); publicar(false); }
  });
}
