// Uma música favorita por jogo, sem internet (06/Nov/2026): Trilha.offline (trilha.js) guarda UMA música de cada jogo
// e da rádio da estante, inteira, no cache "bolinho-musicas", e toca por blob: quando não há internet.
// Rodar da raiz do repositório: node --test teste/*.test.js (Playwright com o Chromium do ambiente).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const raiz = path.join(__dirname, '..');
const ler = (f) => fs.readFileSync(path.join(raiz, f), 'utf8');
const Trilha = require('../trilha.js');
const FAV = Trilha.offline.FAVORITAS;
const IDS = ['estante', 'baguncolandia', 'peluqueria', 'vruuum', 'purpurina', 'rabiscolandia', 'campo-minado', 'batalha-naval', 'enigmas', 'labirinto', 'cozinha', 'a-garra'];
const arquivo = (u) => u.replace(/^.*?\/kids\//, '');

test('favoritas: uma por jogo e a da estante, arquivo que existe, até 4 MB', () => {
  assert.deepStrictEqual(Object.keys(FAV).sort(), IDS.slice().sort());
  let total = 0;
  for (const id of IDS) {
    const f = arquivo(FAV[id]);
    assert.ok(/\/kids\/.+\.mp3$/.test(FAV[id]), id + ': endereço ' + FAV[id]);
    assert.ok(fs.existsSync(path.join(raiz, f)), id + ': não existe ' + f);
    const tam = fs.statSync(path.join(raiz, f)).size; total += tam;
    assert.ok(tam <= 4 * 1024 * 1024, id + ': ' + f + ' tem ' + (tam / 1048576).toFixed(1) + ' MB');
  }
  assert.ok(total < 30 * 1048576, 'total ' + (total / 1048576).toFixed(1) + ' MB');
});

test('cada favorita é uma música que o próprio jogo já toca', () => {
  const nome = (id) => path.basename(FAV[id]);
  assert.ok(ler('radio.js').includes("a: '" + nome('estante').replace('.mp3', '') + "'"), 'estante');
  assert.ok(ler('baguncolandia/som.js').includes("'" + nome('baguncolandia').replace('.mp3', '') + "'"), 'baguncolandia');
  assert.ok(ler('peluqueria/musicas/musicas.json').includes('"' + nome('peluqueria') + '"'), 'peluqueria');
  for (const id of ['vruuum', 'purpurina']) assert.ok(ler(id + '/som.js').includes("'musicas/" + nome(id) + "'"), id);
  assert.ok(ler('rabiscolandia/som.js').includes("gr('" + nome('rabiscolandia').replace('.mp3', '') + "'"), 'rabiscolandia');
  for (const id of ['campo-minado', 'batalha-naval', 'enigmas', 'labirinto', 'cozinha', 'a-garra']) {
    assert.ok(ler(id + '/app.js').includes(nome(id).replace('.mp3', '')), id + ': ' + nome(id));
  }
});

test('peças no lugar: estante carrega trilha.js antes do radio.js; jogos antigos carregam e guardam ../trilha.js', () => {
  const html = ler('index.html');
  assert.ok(html.indexOf('<script src="/kids/trilha.js"></script>') >= 0 && html.indexOf('/kids/trilha.js') < html.indexOf('/kids/radio.js'));
  for (const g of ['baguncolandia', 'peluqueria', 'vruuum', 'purpurina', 'rabiscolandia']) {
    assert.ok(ler(g + '/index.html').includes('<script src="../trilha.js" data-fora-do-arquivo></script>'), g + '/index.html');
    assert.ok(ler(g + '/sw.js').includes("'../trilha.js'"), g + '/sw.js');
    assert.ok(!/Trilha\.iniciar/.test(ler(g + '/app.js') + ler(g + '/som.js')), g + ': só o ajudante, sem Trilha.iniciar');
  }
  assert.match(ler('sw.js'), /if \(\/\\\.mp3\$\/i\.test\(url\.pathname\)\) return;/, 'o service worker da estante continua sem mexer em MP3');
});

// ---------- no navegador ----------
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.tflite': 'application/octet-stream' };
function servidor() {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (!p.startsWith('/kids/')) { res.writeHead(404); res.end(); return; }
    p = p.slice('/kids'.length); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(raiz, p);
    if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
}
// guarda todo <audio> que já tocou, para conferir de onde vem a música (e que está andando de verdade)
const VIGIA = () => {
  window.__audios = [];
  const orig = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { if (window.__audios.indexOf(this) < 0) window.__audios.push(this); return orig.apply(this, arguments); };
};
const tocandoBlob = (pg) => pg.evaluate(() => window.__audios.filter(a => !a.paused && a.currentTime > 0 && !a.error).map(a => a.src.slice(0, 5)).join(','));

test('Guardar todos guarda as 12 favoritas; sem internet a rádio, a Bagunçolândia, o Vruuum! e o Campo Minado tocam a favorita por blob:', { timeout: 420000 }, async () => {
  const { chromium } = require('playwright');
  const srv = servidor(); await new Promise(r => srv.listen(0, r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/kids/';
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 412, height: 860 }, locale: 'pt-BR' });
    await ctx.addInitScript(VIGIA);
    const pg = await ctx.newPage();
    const erros = []; pg.on('pageerror', e => erros.push(e.message));
    await pg.goto(base);
    await pg.evaluate(() => navigator.serviceWorker.ready);

    // (1) ⬇ Guardar todos → as 12 favoritas no cache "bolinho-musicas"
    await pg.click('#todos button.forte');
    await pg.waitForFunction(() => /músicas favoritas guardadas/.test(document.querySelector('#todos .st').textContent), null, { timeout: 300000 });
    const guardadas = await pg.evaluate(() => caches.open('bolinho-musicas').then(c => c.keys()).then(k => k.map(r => r.url)));
    const esperadas = IDS.map(id => base + arquivo(FAV[id]));
    assert.deepStrictEqual(guardadas.slice().sort(), [...new Set(esperadas)].sort(), 'cache bolinho-musicas');
    assert.match(await pg.textContent('#todos .st'), /12 de 12 músicas favoritas/);

    // o Vruuum! guarda todas as músicas dele no próprio cache; tira esse cache para testar só a favorita
    await pg.waitForFunction(() => caches.open('vruuum-musicas-v1').then(c => c.keys()).then(k => k.length >= 36), null, { timeout: 120000 }).catch(() => {});
    await pg.evaluate(() => caches.delete('vruuum-musicas-v1'));

    // (2) sem internet, a estante de novo: a rádio toca a favorita (blob:) depois de um toque
    await ctx.setOffline(true);
    await pg.goto(base);
    await pg.click('h1'); await pg.waitForTimeout(1500);
    assert.strictEqual(await tocandoBlob(pg), 'blob:', 'rádio da estante sem internet');
    assert.match(await pg.textContent('.radio .r-titulo'), /Cool Rock/);

    // (3) sem internet nos jogos
    await pg.goto(base + 'baguncolandia/?teste');
    await pg.click('#btToque'); await pg.fill('#nome', 'Lara'); await pg.click('#btEntrar'); await pg.waitForTimeout(2500);
    assert.ok(await pg.evaluate(() => Som.tocandoArquivo()), 'Bagunçolândia: música gravada tocando');
    assert.strictEqual(await tocandoBlob(pg), 'blob:', 'Bagunçolândia sem internet');

    await pg.goto(base + 'vruuum/');
    await pg.click('#btEntrar'); await pg.waitForTimeout(3000);
    assert.strictEqual(await tocandoBlob(pg), 'blob:', 'Vruuum! sem internet');

    await pg.goto(base + 'campo-minado/');
    await pg.mouse.click(200, 300); await pg.waitForTimeout(1500);
    assert.strictEqual(await tocandoBlob(pg), 'blob:', 'Campo Minado sem internet');
    assert.match(await pg.textContent('.trilha .tr-nome'), /Scheming Weasel/);

    // Enigmas: a regra de segurança (CSP) da página precisa deixar tocar blob: (0.1.1)
    await pg.goto(base + 'enigmas/');
    await pg.mouse.click(200, 300); await pg.waitForTimeout(1500);
    assert.strictEqual(await tocandoBlob(pg), 'blob:', 'Enigmas sem internet');

    assert.deepStrictEqual(erros, [], 'sem erro de JavaScript');
  } finally {
    await b.close(); srv.close();
  }
});
