// Versão nova sempre chega (dono, 22/Nov/2026: o tablet Fire da filha ficou no Meu Pequeno Amiguinho 0.1.x com a 0.3.0
// publicada, mesmo guardando com Wi-Fi). Garantia: com internet, abrir o jogo ou tocar em Guardar termina na versão mais
// nova; se ela não der para chegar inteira naquela vez, o jogo AVISA ("abra de novo com internet") em vez de ficar calado
// na velha. Peças: sw-comum.js, carregando.js, jogos.js (Guardar todos), atualizar.js.
// O servidor de teste serve o repositório em /kids/ e troca a versão do Meu Pequeno Amiguinho (VERSAO do sw.js,
// APP_VERSION do app.js, versoes.json e o conteúdo do arte.js), com internet lenta, arquivo com erro e pedido pendurado.
// Rodar da raiz do repositório: node --test teste/versao-nova.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const raiz = path.join(__dirname, '..');
const JOGO = 'meu-amiguinho/';

function servidor(st) {
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
  const V = () => st.v + '.0.0';
  function corpo(p) {
    const b = fs.readFileSync(path.join(raiz, p));
    if (!p.startsWith(JOGO)) return b;
    const s = b.toString();
    if (p === JOGO + 'sw.js') return Buffer.from(s.replace(/var VERSAO = '[^']+'/, "var VERSAO = '" + V() + "'"));
    if (p === JOGO + 'app.js') return Buffer.from(s.replace(/var APP_VERSION = '[^']+'/, "var APP_VERSION = '" + V() + "'"));
    if (p === JOGO + 'versoes.json') return Buffer.from(s.replace(/"versao": "[^"]+"/, '"versao": "' + V() + '"'));
    if (p === JOGO + 'arte.js') return Buffer.from(s + '\n/* versão ' + V() + ' */\n');
    return b;
  }
  return http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (p === '/kids/' + JOGO + 'pendurado.txt') return;   // nunca responde (Wi-Fi do tablet acordando)
    if (!p.startsWith('/kids/')) { r.writeHead(404); return r.end(); }
    p = p.slice(6); if (!p || p.endsWith('/')) p += 'index.html';
    // só o Meu Pequeno Amiguinho é guardado neste teste (os outros jogos ficam de fora para ser rápido); músicas também
    if (/\/sw\.js$/.test(p) && p !== JOGO + 'sw.js') { r.writeHead(404); return r.end(); }
    if (/\.mp3$/.test(p)) { r.writeHead(404); return r.end(); }
    if (st.falhar && p === st.falhar) { r.writeHead(500); return r.end(); }
    const f = path.join(raiz, p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    const c = corpo(p);
    // como o GitHub Pages: o navegador pode guardar por 10 minutos
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'max-age=600' });
    // internet lenta: a resposta começa logo e o arquivo vem aos pouquinhos, durante "a" milissegundos
    const a = st.atraso && p.startsWith(JOGO) && p !== JOGO + 'sw.js' ? st.atraso(p, c.length) : 0;
    if (!a) return r.end(c);
    const N = 20;
    for (let i = 0; i < N; i++) setTimeout(() => { if (i === N - 1) r.end(c.subarray(Math.floor(i * c.length / N))); else r.write(c.subarray(Math.floor(i * c.length / N), Math.floor((i + 1) * c.length / N))); }, Math.round((i + 1) * a / N));
  });
}

async function preparar(st, op) {
  const { chromium } = require('playwright');
  op = op || {};
  const srv = servidor(st); await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/kids/';
  const dir = op.persistente ? fs.mkdtempSync(path.join(os.tmpdir(), 'bolinho-versao-')) : null;
  let b = null;
  async function navegador() {
    let ctx;
    if (dir) ctx = await chromium.launchPersistentContext(dir, { viewport: { width: 800, height: 1280 } });
    else { b = b || await chromium.launch(); ctx = await b.newContext({ viewport: { width: 800, height: 1280 } }); }
    await ctx.addInitScript((app) => {
      localStorage.setItem('bolinho:idioma', 'pt'); localStorage.setItem('bolinho:novidades-ocultas', '["*"]');
      if (app) {   // aberto pelo ícone: janela de aplicativo instalado
        const mm = window.matchMedia.bind(window);
        window.matchMedia = (q) => /display-mode:\s*standalone/.test(q) ? { matches: true, media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} } : mm(q);
      }
    }, !!op.app);
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    const pg = ctx.pages()[0] || await ctx.newPage();
    return { ctx, pg };
  }
  const fechar = async (ctx) => { await ctx.close().catch(() => {}); if (b) await b.close().catch(() => {}); srv.close(); if (dir) fs.rmSync(dir, { recursive: true, force: true }); };
  return { base, jogo: base + JOGO, navegador, fechar };
}

// abre (ou espera abrir) o jogo: a tela de carregando some e a versão aparece; devolve a versão e o aviso, se houver
async function aberto(pg, ms) {
  const fim = Date.now() + (ms || 120000);
  for (;;) {
    const r = await pg.evaluate(() => {
      const v = document.getElementById('versao');
      if (document.documentElement.classList.contains('bc-carregando') || !v || !v.textContent) return null;
      const a = document.querySelector('.bc-aviso');
      return { versao: (v.textContent.match(/\d+\.\d+\.\d+/) || [''])[0], aviso: a ? a.textContent : '' };
    }).catch(() => null);
    if (r) return r;
    if (Date.now() > fim) throw new Error('o jogo não abriu');
    await pg.waitForTimeout(250);
  }
}
async function abrir(pg, url, ms) { await pg.goto(url); return aberto(pg, ms); }
const sw = (pg) => pg.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r ? { ativo: !!r.active, instalando: !!r.installing, esperando: !!r.waiting } : null));
const ate = async (pg, fn, ms) => { const fim = Date.now() + (ms || 30000); while (Date.now() < fim) { if (await pg.evaluate(fn).catch(() => false)) return true; await pg.waitForTimeout(250); } return false; };
const gaveta = (v) => new Function('return caches.keys().then(function (k) { return k.some(function (n) { return n.indexOf("meu-amiguinho-v' + v + '.0.0-") === 0; }); }).then(function (tem) { return tem && navigator.serviceWorker.getRegistration().then(function (r) { return !!r && !!r.active && !r.installing && !r.waiting; }); })');

// 1ª visita com a v1: o jogo fica guardado no aparelho
async function guardarV1(pg, jogo) {
  assert.strictEqual((await abrir(pg, jogo)).versao, '1.0.0');
  await pg.evaluate(() => navigator.serviceWorker.ready);
  assert.ok(await ate(pg, gaveta(1), 60000), 'v1 guardada no aparelho');
  assert.strictEqual((await abrir(pg, jogo)).versao, '1.0.0', 'v1 abre da gaveta');
}

test('A — abrir o jogo com internet já abre na versão nova', { timeout: 120000 }, async () => {
  const st = { v: 1 }, t = await preparar(st);
  const { ctx, pg } = await t.navegador();
  try {
    await guardarV1(pg, t.jogo);
    st.v = 2;
    const r = await abrir(pg, t.jogo);
    assert.strictEqual(r.versao, '2.0.0', 'abriu já na versão nova');
    assert.strictEqual(r.aviso, '');
  } finally { await t.fechar(ctx); }
});

test('B — Guardar todos na estante deixa o jogo na nova; se a nova não chegar, a estante não diz que está atualizado', { timeout: 240000 }, async () => {
  const st = { v: 1 }, t = await preparar(st);
  const { ctx, pg } = await t.navegador();
  const guardar = async () => {
    await pg.goto(t.base);
    await pg.click('#todos button.forte');
    await pg.waitForFunction(() => { const b = document.querySelector('#todos button.forte'); return b && !b.disabled; }, null, { timeout: 200000 });
    return pg.textContent('#todos .st');
  };
  try {
    await guardarV1(pg, t.jogo);
    st.v = 2;
    await guardar();
    assert.ok(await ate(pg, gaveta(2)), 'Guardar trouxe a v2 inteira');
    const r = await abrir(pg, t.jogo);
    assert.strictEqual(r.versao, '2.0.0', 'o jogo abre já na nova');
    // v3 publicada, mas um arquivo não chega: a estante não conta o jogo como guardado e atualizado
    st.v = 3; st.falhar = JOGO + 'dados.js';
    const msg = await guardar();
    assert.match(msg, /^0 de \d+ guardados/, 'o jogo que ficou na versão velha não conta como atualizado: ' + msg.slice(0, 80));
    assert.doesNotMatch(await pg.textContent('#todos button.forte'), /Todos guardados/);
    const r3 = await abrir(pg, t.jogo);
    assert.strictEqual(r3.versao, '2.0.0', 'continua a v2 inteira');
    assert.match(r3.aviso, /versão nova/, 'e o jogo avisa que tem versão nova');
  } finally { await t.fechar(ctx); }
});

test('C — aberto pelo ícone (app instalado): ao voltar para o app, avisa e baixa; Atualizar abre na nova', { timeout: 120000 }, async () => {
  const st = { v: 1 }, t = await preparar(st, { app: true });
  const { ctx, pg } = await t.navegador();
  try {
    await guardarV1(pg, t.jogo);
    // o app fica aberto (na lista de recentes do tablet); sai a v2; a criança volta para o app (sem abrir de novo)
    st.v = 2;
    await pg.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await pg.waitForSelector('.sa-aviso', { timeout: 20000 });
    assert.match(await pg.textContent('.sa-aviso'), /2\.0\.0/);
    assert.ok(await ate(pg, gaveta(2), 30000), 'a versão nova já baixa por trás, com o app aberto');
    await pg.click('.sa-sim');
    await pg.waitForTimeout(500);
    assert.strictEqual((await aberto(pg)).versao, '2.0.0', 'Atualizar abriu na nova');
    assert.strictEqual((await abrir(pg, t.jogo)).versao, '2.0.0', 'aberto de novo pelo ícone: a nova');
  } finally { await t.fechar(ctx); }
});

test('D — internet lenta (arquivos grandes, mais de 45 s): espera a nova chegar inteira e abre nela', { timeout: 240000 }, async () => {
  const st = { v: 1 }, t = await preparar(st);
  const { ctx, pg } = await t.navegador();
  try {
    await guardarV1(pg, t.jogo);
    st.v = 2; st.atraso = (p, n) => 1000 + n / 5;   // ~5 KB/s: o arte.js sozinho leva quase 1 minuto
    const t0 = Date.now();
    const r = await abrir(pg, t.jogo, 200000);
    assert.strictEqual(r.versao, '2.0.0', 'abriu na nova depois de ' + Math.round((Date.now() - t0) / 1000) + ' s');
  } finally { await t.fechar(ctx); }
});

test('D — o tablet fecha o navegador no meio do download: na vez seguinte continua de onde parou e chega na nova', { timeout: 300000 }, async () => {
  const st = { v: 1 }, t = await preparar(st, { persistente: true });
  let { ctx, pg } = await t.navegador();
  try {
    await guardarV1(pg, t.jogo);
    st.v = 2; st.atraso = () => 6000;   // cada arquivo leva 6 s: tudo junto, mais de 40 s
    let chegou = false;
    for (let i = 0; i < 6 && !chegou; i++) {
      pg.goto(t.jogo).catch(() => {});
      await pg.waitForTimeout(15000);   // 15 s de jogo e o tablet fecha o navegador
      chegou = await pg.evaluate(gaveta(2)).catch(() => false);
      if (chegou) break;
      await ctx.close();
      ({ ctx, pg } = await t.navegador());
    }
    assert.ok(chegou, 'a versão nova terminou de chegar, aos pedaços');
    assert.strictEqual((await abrir(pg, t.jogo)).versao, '2.0.0');
  } finally { await t.fechar(ctx); }
});

test('D — a nova não chega inteira: abre a de antes, inteira, mas avisa', { timeout: 120000 }, async () => {
  const st = { v: 1 }, t = await preparar(st);
  const { ctx, pg } = await t.navegador();
  try {
    await guardarV1(pg, t.jogo);
    st.v = 2; st.falhar = JOGO + 'dados.js';
    const r = await abrir(pg, t.jogo);
    assert.strictEqual(r.versao, '1.0.0', 'a de antes, inteira');
    assert.match(r.aviso, /versão nova.*internet/, 'avisa: "abra de novo com internet"');
    // a internet volta ao normal: abrir de novo traz a nova
    st.falhar = null;
    assert.strictEqual((await abrir(pg, t.jogo)).versao, '2.0.0');
  } finally { await t.fechar(ctx); }
});

test('E — página aberta muito tempo, com um pedido pendurado: a versão nova não fica "esperando" para sempre', { timeout: 180000 }, async () => {
  const st = { v: 1 }, t = await preparar(st);
  const { ctx, pg } = await t.navegador();
  try {
    await guardarV1(pg, t.jogo);
    // um pedido da página fica pendurado no service worker da v1 (Wi-Fi do tablet acordando) e sai a v2
    await pg.evaluate(() => { fetch('pendurado.txt').catch(() => {}); });
    await pg.waitForTimeout(500);
    st.v = 2;
    await pg.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
    assert.ok(await ate(pg, () => navigator.serviceWorker.getRegistration().then((r) => !!r.waiting || !r.installing), 30000));
    const r = await abrir(pg, t.jogo, 150000);
    assert.ok(r.versao === '2.0.0' || /versão nova/.test(r.aviso), 'abriu na nova, ou pelo menos avisou: ' + JSON.stringify(r) + ' ' + JSON.stringify(await sw(pg)));
    assert.strictEqual((await abrir(pg, t.jogo)).versao, '2.0.0', 'na abertura seguinte, a nova');
  } finally { await t.fechar(ctx); }
});
