// Jogo íntegro no aparelho (dono, 15/Nov/2026): a versão nova só entra quando chega INTEIRA; faltou uma peça, descarta e
// continua a anterior; tela "Carregando…" até o jogo estar pronto; com internet, abre já na versão nova.
// Peças: sw-comum.js (service worker comum), carregando.js (a tela de carregando), ferramentas/pecas-comuns.js.
// Rodar da raiz do repositório: node --test teste/sw-jogos.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const raiz = path.join(__dirname, '..');
const ler = (f) => fs.readFileSync(path.join(raiz, f), 'utf8');
const P = require('../ferramentas/pecas-comuns.js');

test('todo jogo usa o sw-comum.js e a tela de carregando, e a lista do aparelho só tem arquivos que existem', () => {
  const jogos = P.jogos();
  assert.ok(jogos.length >= 14, 'jogos: ' + jogos.join(', '));
  for (const g of jogos) {
    const sw = ler(g + '/sw.js');
    assert.match(sw, /importScripts\('\.\.\/sw-comum\.js'\);/, g + ': sw.js importa ../sw-comum.js');
    assert.match(sw, /BolinhoSW\(\{ prefixo: '[a-z-]+-', versao: VERSAO, arquivos: ARQUIVOS/, g + ': sw.js chama BolinhoSW');
    assert.doesNotMatch(sw, /addEventListener\('(install|activate|fetch)'/, g + ': instalar/ativar/buscar só pelo sw-comum.js');
    assert.doesNotMatch(sw, /\bcaches\.match\(/, g + ': nada de procurar em todas as gavetas (pegava peça antiga de outro jogo)');
    const arq = P.arquivosDe(g);
    assert.ok(arq.includes('../carregando.js'), g + ': ../carregando.js no ARQUIVOS');
    for (const a of arq) {
      const f = path.join(raiz, g, a === './' ? 'index.html' : a);
      assert.ok(fs.existsSync(f) && fs.statSync(f).isFile(), g + ': o ARQUIVOS pede ' + a + ', que não existe (a versão nova nunca instalaria)');
    }
    const html = ler(g + '/index.html');
    assert.ok(html.includes('<link rel="manifest" href="manifest.webmanifest">\n<script src="../carregando.js" data-fora-do-arquivo></script>'),
      g + ': index.html com ../carregando.js logo depois do manifest');
  }
  assert.match(ler('sw-comum.js'), new RegExp("^var PECAS = '" + P.impressao() + "';", 'm'),
    'uma peça comum mudou: rode  node ferramentas/pecas-comuns.js  (assim todos os jogos baixam a versão nova inteira)');
});

// servidor de teste: o repositório em /kids/, com uma "versão nova" do Campo Minado e um arquivo que pode falhar
function servidor(estado) {
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' };
  return http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (!p.startsWith('/kids/')) { r.writeHead(404); return r.end(); }
    p = p.slice(6); if (!p || p.endsWith('/')) p += 'index.html';
    if (estado.falhar && p === estado.falhar) { r.writeHead(500); return r.end(); }
    const f = path.join(raiz, p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    let corpo = fs.readFileSync(f);
    if (estado.nova && p === 'campo-minado/sw.js') corpo = Buffer.from(String(corpo).replace(/var VERSAO = '[^']*'/, "var VERSAO = '" + estado.nova + "'"));
    if (estado.nova && p === 'campo-minado/versoes.json') corpo = Buffer.from(String(corpo).replace(/"versao": "[^"]*"/, '"versao": "' + estado.nova + '"'));
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    r.end(corpo);
  });
}

test('Campo Minado: guarda inteiro, abre sem internet, versão nova pela metade é descartada, inteira entra', { timeout: 180000 }, async () => {
  const { chromium } = require('playwright');
  const estado = {};
  const srv = servidor(estado); await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/kids/campo-minado/';
  const b = await chromium.launch();
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'pt-BR' });
    // registra se a tela de carregando estava lá quando a página montou, e o que ela dizia
    await ctx.addInitScript(() => {
      localStorage.setItem('bolinho:idioma', 'pt');
      window.__carregando = [];
      document.addEventListener('DOMContentLoaded', () => { window.__carregando.push(document.documentElement.className.includes('bc-carregando')); });
      const sa = Element.prototype.setAttribute;
      Element.prototype.setAttribute = function (k, v) { if (k === 'data-bc-msg') window.__carregando.push(String(v)); return sa.apply(this, arguments); };
    });
    const pg = await ctx.newPage(), erros = [];
    pg.on('pageerror', (e) => erros.push(e.message));
    const gavetas = () => pg.evaluate(() => caches.keys().then((ks) => ks.filter((k) => k.indexOf('campo-minado-') === 0).sort()));
    const marca = (k) => pg.evaluate((k) => caches.open(k).then((c) => c.match('__bolinho-completo__')).then((r) => r && r.text()), k);
    // espera uma condição que depende de promessas (caches, service worker): o waitForFunction não espera promessa
    const ate = async (fn, arg, ms) => { const fim = Date.now() + (ms || 20000); while (Date.now() < fim) { if (await pg.evaluate(fn, arg).catch(() => false)) return true; await pg.waitForTimeout(250); } return false; };
    const visivel = () => pg.waitForFunction(() => !document.documentElement.classList.contains('bc-carregando'), null, { timeout: 15000 });

    // 1ª visita: abre da internet, a tela de carregando some, e o service worker guarda tudo
    await pg.goto(base); await visivel();
    assert.ok((await pg.evaluate(() => window.__carregando)).includes(true), 'a tela de carregando cobre o jogo enquanto monta');
    assert.match(String(await pg.evaluate(() => window.__carregando)), /Carregando…/);
    await pg.evaluate(() => navigator.serviceWorker.ready);
    await ate(() => !!navigator.serviceWorker.controller);
    await ate(() => caches.keys().then((ks) => Promise.all(ks.filter((k) => k.indexOf('campo-minado-') === 0).map((k) => caches.open(k).then((c) => c.match('__bolinho-completo__'))))).then((m) => m.length === 1 && !!m[0]));
    let g = await gavetas();
    assert.strictEqual(g.length, 1, 'uma gaveta: ' + g);
    const v1 = await marca(g[0]);
    assert.ok(v1, 'gaveta com a marca de completa');
    const n = await pg.evaluate((k) => caches.open(k).then((c) => c.keys()).then((ks) => ks.length), g[0]);
    assert.ok(n >= P.arquivosDe('campo-minado').length, 'todos os arquivos guardados (' + n + ')');

    // sem internet: abre igual, da gaveta
    await ctx.setOffline(true);
    await pg.goto(base); await visivel();
    assert.ok(await pg.$('#tabuleiro, canvas, main, .tela'), 'o jogo abriu sem internet');
    await ctx.setOffline(false);

    // versão nova no site, mas um arquivo falha: a nova é descartada e a anterior continua inteira
    estado.nova = '9.9.8'; estado.falhar = 'campo-minado/campo.js';
    await pg.goto(base); await visivel();
    // o navegador pode tentar instalar mais de uma vez: espera não haver instalação em andamento
    await ate(() => navigator.serviceWorker.getRegistration().then((r) => !r.installing && !r.waiting)
      .then((livre) => livre && caches.keys().then((ks) => ks.filter((k) => k.indexOf('campo-minado-') === 0).length === 1)));
    g = await gavetas();
    assert.strictEqual(g.length, 1, 'a gaveta pela metade foi apagada: ' + g);
    assert.strictEqual(await marca(g[0]), v1, 'continua a versão anterior, inteira');
    assert.strictEqual(await pg.evaluate(() => fetch('versoes.json').then((r) => r.json()).then((d) => d.versoes[0].versao)), v1, 'rodando a anterior');

    // o arquivo volta: ao abrir, "Baixando a versão nova…", espera chegar inteira e abre nela; a antiga é apagada
    estado.falhar = null; estado.nova = '9.9.9';
    await pg.goto(base);
    assert.ok(await ate(() => caches.keys().then((ks) => /^campo-minado-v9\.9\.9-[0-9a-f]+$/.test(ks.filter((k) => k.indexOf('campo-minado-') === 0).join()))), 'a nova entrou e a antiga saiu');
    await visivel(); await pg.waitForTimeout(800);
    g = await gavetas();
    assert.deepStrictEqual(g.map((k) => k.split('-')[2]), ['v9.9.9'], 'só a versão nova: ' + g);
    assert.strictEqual(await marca(g[0]), '9.9.9');
    assert.strictEqual(await pg.evaluate(() => fetch('versoes.json').then((r) => r.json()).then((d) => d.versoes[0].versao)), '9.9.9', 'abriu já na versão nova');
    assert.ok(await pg.evaluate(() => sessionStorage.getItem('bc-recarregou:' + location.pathname)), 'a tela de carregando esperou a versão nova e abriu nela');

    // recuperação: gaveta ativa sem a marca (o aparelho desligou no meio) se completa sozinha na próxima abertura
    await pg.evaluate((k) => caches.open(k).then((c) => Promise.all([c.delete('__bolinho-completo__'), c.delete('campo.js')])), g[0]);
    await pg.goto(base); await visivel();
    await ate((k) => caches.open(k).then((c) => c.match('__bolinho-completo__')).then((r) => !!r), g[0]);
    assert.strictEqual(await marca(g[0]), '9.9.9', 'completou e marcou de novo');
    assert.ok(await pg.evaluate((k) => caches.open(k).then((c) => c.match('campo.js')).then((r) => !!r), g[0]), 'o arquivo que faltava voltou');
    assert.deepStrictEqual(erros, [], 'erro na página');
    await ctx.close();
  } finally { await b.close(); srv.close(); }
});
