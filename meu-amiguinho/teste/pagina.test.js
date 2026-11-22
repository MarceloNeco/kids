// A página no Chromium (Playwright): node --test meu-amiguinho/teste/pagina.test.js (rodar da raiz do repositório kids).
// Com ?teste o jogo expõe window.AmiguinhoDebug: estado(), encher(f), encomendar(semente), certidaoPng(), vivo().
const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (!p.startsWith('/kids/')) { res.writeHead(404); res.end(); return; }
  p = p.slice(6); if (!p || p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || /\.mp3$/.test(f) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
let browser, base;
test.before(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/kids/meu-amiguinho/';
  browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
});
test.after(async () => { if (browser) await browser.close(); server.close(); });

async function abrir(w, h, lang, extra) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, serviceWorkers: 'block', acceptDownloads: true }, extra || {}));
  await ctx.addInitScript((l) => { localStorage.setItem('bolinho:idioma', l); }, lang || 'pt');
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  const pg = await ctx.newPage(), erros = [];
  pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|solverone-dados/.test(m.text())) erros.push(m.text()); });
  pg.on('pageerror', (e) => erros.push('pageerror: ' + e.message));
  await pg.goto(base + '?teste');
  await pg.waitForFunction(() => window.AmiguinhoDebug && AmiguinhoDebug.pronto, null, { timeout: 20000 });
  await pg.waitForTimeout(400);
  pg.erros = erros; pg.ctx = ctx;
  return pg;
}
const est = (pg) => pg.evaluate(() => AmiguinhoDebug.estado());
const inteiro = (pg, sel) => pg.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight + 0.5 && r.right <= innerWidth + 0.5; });
const naoRola = (pg) => pg.evaluate(() => document.documentElement.scrollHeight <= innerHeight && document.documentElement.scrollWidth <= innerWidth && scrollY === 0);

for (const [w, h] of [[360, 740], [390, 844]]) {
  test('celular ' + w + '×' + h + ': começo e as 7 etapas sem rolar, Pronto sempre à vista, selo 1 de 7 … 7 de 7', async () => {
    const pg = await abrir(w, h);
    try {
      assert.ok(await inteiro(pg, '#btCriar')); assert.ok(await naoRola(pg), 'o começo rola');
      assert.match(await pg.textContent('#nColecao'), /2/);
      await pg.click('[data-nivel="medio"]');
      await pg.click('#btCriar'); await pg.waitForTimeout(300);
      for (let i = 0; i < 7; i++) {
        const e = await est(pg); assert.equal(e.tela, 'oficina'); assert.equal(e.etapa, i);
        assert.equal(await pg.textContent('#seloNum'), String(i + 1));
        assert.match(await pg.textContent('#etConta'), new RegExp((i + 1) + ' de 7'));
        assert.ok(await naoRola(pg), 'etapa ' + (i + 1) + ' rola');
        assert.ok(await inteiro(pg, '#btPronto'), 'etapa ' + (i + 1) + ': Pronto fora da tela');
        assert.ok(await inteiro(pg, '#palco'), 'etapa ' + (i + 1) + ': o bichinho fora da tela');
        if (i < 6) { assert.ok(await inteiro(pg, '#btProximo')); await pg.click('#btProximo'); await pg.waitForTimeout(250); }
      }
      // o Voltar do celular volta uma etapa
      await pg.goBack(); await pg.waitForTimeout(250); assert.equal((await est(pg)).etapa, 5);
      await pg.click('#btVoltar'); await pg.waitForTimeout(250); assert.equal((await est(pg)).etapa, 4);
      assert.deepEqual(pg.erros, []);
    } finally { await pg.ctx.close(); }
  });
}

test('montar uma coala do jeito da Alice, Pronto: caixinha, amiguinho vivo com ❤, certidão em PNG e coleção', async () => {
  const pg = await abrir(390, 844);
  try {
    await pg.click('[data-nivel="medio"]'); await pg.click('#btCriar');
    await pg.click('#painel [data-base="coala"]');
    assert.equal((await est(pg)).amigo.base, 'coala');
    assert.match(await pg.textContent('#fala'), /Eucalipta/);
    await pg.click('#btProximo'); await pg.click('#painel [data-pelo="cinza-azul"]'); await pg.click('#painel [data-olhos="azul"]'); await pg.click('#painel [data-estilo-olho="cilios"]');
    await pg.click('#btProximo'); await pg.waitForTimeout(200);
    // coração: segurar = beijinho e desejo; máquina: segurar enche, soltar avalia
    const bd = await pg.$('#btDesejo'), b1 = await bd.boundingBox();
    await pg.mouse.move(b1.x + b1.width / 2, b1.y + b1.height / 2); await pg.mouse.down(); await pg.waitForTimeout(1100); await pg.mouse.up();
    assert.equal((await est(pg)).amigo.desejo, true);
    const be = await pg.$('#btEncher'), b2 = await be.boundingBox();
    await pg.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2); await pg.mouse.down(); await pg.waitForTimeout(2300); await pg.mouse.up(); await pg.waitForTimeout(200);
    let f = (await est(pg)).amigo.fofura; assert.ok(f > 45 && f < 90, 'encheu até o ponto: ' + f);
    assert.equal(await pg.getAttribute('#medidor', 'data-zona'), 'ponto');
    await pg.evaluate(() => AmiguinhoDebug.encher(110)); await pg.click('#btApertao'); assert.equal((await est(pg)).amigo.fofura, 95);
    await pg.evaluate(() => AmiguinhoDebug.encher(70));
    await pg.click('#btProximo'); await pg.click('#painel [data-roupa="vestido-nuvens"]');
    await pg.click('#btProximo');
    await pg.click('#painel [data-acess="laco-fitas"]');
    await pg.click('#painel [data-caixa="pes"]'); await pg.click('#painel [data-acess="tenis-brilho"]');
    await pg.click('#painel [data-caixa="colo"]'); await pg.click('#painel [data-acess="filhote"]');
    let a = (await est(pg)).amigo; assert.deepEqual(a.acess, { laco: 'laco-fitas', pes: 'tenis-brilho', colo: 'filhote' });
    await pg.click('#btProximo');
    await pg.click('#painel [data-pronta="abraco"]');
    assert.ok(await pg.isVisible('.privado')); assert.match(await pg.textContent('.privado'), /só neste aparelho/);
    await pg.click('#btProximo');
    await pg.fill('#inNome', 'Lili'); await pg.fill('#inFilhote', 'Nenê');
    await pg.click('#btPronto');
    await pg.waitForSelector('#caixaAnim:not([hidden])', { timeout: 2000 });
    await pg.waitForFunction(() => AmiguinhoDebug.estado().tela === 'amigo', null, { timeout: 8000 });
    assert.equal(await pg.textContent('#amNome'), 'Lili');
    assert.ok(await inteiro(pg, '#btCoracao')); assert.ok(await inteiro(pg, '#btCertidao'));
    await pg.click('#btCoracao'); await pg.waitForTimeout(150); assert.match(await pg.textContent('#falaAmigo'), /abraço/);
    await pg.click('#peluciaAmigo'); assert.ok(await pg.evaluate(() => AmiguinhoDebug.vivo().emAcao()), 'reage ao toque');
    await pg.click('#btCertidao'); await pg.waitForSelector('#certJanela:not([hidden]) .ct-svg');
    assert.match(await pg.textContent('#certDesenho'), /Certidão de Nascimento[\s\S]*Lili[\s\S]*coalinha[\s\S]*Nenê/);
    const tam = await pg.evaluate(() => AmiguinhoDebug.certidaoPng()); assert.ok(tam > 20000, 'PNG ' + tam);
    const [baixou] = await Promise.all([pg.waitForEvent('download'), pg.click('#btSalvarPng')]);
    assert.match(baixou.suggestedFilename(), /^certidao-lili\.png$/);
    await pg.click('#btFecharCert');
    // na coleção: 3 (a nova + os 2 exemplos); apagar a nova
    await pg.goBack(); await pg.waitForTimeout(300); assert.equal((await est(pg)).tela, 'menu');
    await pg.click('#btColecao'); await pg.waitForTimeout(300);
    assert.equal(await pg.locator('.cartao-amigo').count(), 3);
    assert.deepEqual(await pg.$$eval('.cartao-amigo .nome', (e) => e.map((x) => x.textContent)), ['Lili', 'Alice', 'Coraçãozinho']);
    await pg.click('.cartao-amigo >> nth=0'); await pg.waitForTimeout(300);
    await pg.click('#btApagar'); await pg.click('#btApagarSim'); await pg.waitForTimeout(400);
    assert.equal(await pg.locator('.cartao-amigo').count(), 2);
    await pg.click('.cartao-amigo >> nth=1'); await pg.waitForTimeout(300);
    assert.equal(await pg.textContent('#amNome'), 'Coraçãozinho'); assert.ok(await pg.isHidden('#btApagar'), 'exemplo não se apaga');
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});

test('Encomenda (difícil): o cartão pede, o jogo dá estrelas por acerto', async () => {
  const pg = await abrir(390, 844);
  try {
    await pg.click('[data-nivel="dificil"]'); await pg.click('#btCriar'); await pg.waitForTimeout(200);
    assert.ok(await pg.isVisible('#encomenda')); assert.match(await pg.textContent('#encTexto'), /^Quero /);
    const enc = await pg.evaluate(() => AmiguinhoDebug.encomendar(7));
    await pg.evaluate((e) => { const a = AmiguinhoDebug.amigo(), R = AmiguinhoRegras; R.escolherBase(a, e.base); a.pelo = e.pelo; R.vestir(a, e.roupa); if (e.corRoupa) R.corRoupa(a, e.corRoupa);
      Object.keys(e.acess).forEach((c) => { R.porAcess(a, e.acess[c].id); if (e.acess[c].cor) R.corAcess(a, e.acess[c].id, e.acess[c].cor); }); if (e.coracao) a.coracao = e.coracao; if (e.fofura) a.fofura = e.fofura === 'cheio' ? 100 : 70; }, enc);
    assert.ok(await inteiro(pg, '#btPronto'));
    await pg.click('#btPronto');
    await pg.waitForFunction(() => AmiguinhoDebug.estado().tela === 'amigo', null, { timeout: 8000 });
    assert.match(await pg.textContent('#amEstrelas'), /⭐⭐⭐/);
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});

test('voz: gravar (microfone de mentira) guarda só no aparelho e toca com efeito', async () => {
  const pg = await abrir(390, 844, 'pt', { permissions: ['microphone'] });
  try {
    await pg.click('#btCriar');
    for (let i = 0; i < 5; i++) await pg.click('#btProximo');
    let pedidos = []; pg.on('request', (r) => { if (!/\/kids\//.test(r.url())) pedidos.push(r.url()); });
    await pg.click('#btGravar'); await pg.waitForTimeout(1200); await pg.click('#btGravar');
    await pg.waitForFunction(() => AmiguinhoDebug.amigo().frases[0].gravada === true, null, { timeout: 8000 });
    const id = (await est(pg)).amigo.id;
    const guardado = await pg.evaluate((id) => AmiguinhoVoz.ler(id + ':0').then((b) => b ? b.size : 0), id);
    assert.ok(guardado > 100, 'blob no IndexedDB: ' + guardado);
    assert.deepEqual(pedidos.filter((u) => !/^blob:|^data:/.test(u)), [], 'nada enviado');
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});

for (const [lang, titulo, criar] of [['en', 'Pick me!', 'Make my buddy'], ['es', '¡Elígeme!', 'Crear mi amiguito']]) {
  test('idioma ' + lang + ': textos da estante, sem botão de idioma próprio', async () => {
    const pg = await abrir(390, 844, lang);
    try {
      assert.match(await pg.evaluate(() => document.documentElement.lang), new RegExp('^' + lang));
      assert.match(await pg.textContent('#btCriar'), new RegExp(criar));
      await pg.click('#btCriar'); assert.equal(await pg.textContent('#etTitulo'), titulo);
      assert.equal(await pg.$('#btLingua'), null);
      assert.deepEqual(pg.erros, []);
    } finally { await pg.ctx.close(); }
  });
}

test('4 patas e robozinho vivos: patas andam, telinha de LED troca de carinha', async () => {
  const pg = await abrir(390, 844);
  try {
    await pg.click('[data-nivel="medio"]'); await pg.click('#btCriar');
    await pg.click('#painel [data-base="ovelha"]'); assert.equal((await est(pg)).amigo.corpo, 'q');
    assert.equal(await pg.locator('#pelucia .ma-pata').count(), 4);
    await pg.click('#painel [data-corpo="pe"]'); assert.equal((await est(pg)).amigo.corpo, 'pe');
    await pg.click('#painel [data-base="robo"]'); await pg.waitForTimeout(200);
    const antes = await pg.$eval('#pelucia .ma-tela', (e) => e.innerHTML);
    await pg.click('#pelucia'); await pg.waitForTimeout(300);
    assert.notEqual(await pg.$eval('#pelucia .ma-tela', (e) => e.innerHTML), antes, 'a carinha mudou');
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});

// Dono, 22/Nov/2026: "o escrito tampa toda a cabeça dos animais e não dá pra sair dele" e a bolinha 🎵 tampava o Pronto.
test('balão: fica embaixo (nunca na cabeça), some sozinho, fecha num toque; a 🎵 não tampa o Pronto', async () => {
  const pg = await abrir(360, 740);
  try {
    await pg.click('#btCriar'); await pg.waitForTimeout(300);
    const outro = await pg.$$eval('[data-base]', (bs) => { const b = bs.find((x) => x.getAttribute('aria-pressed') !== 'true'); return b && b.dataset.base; });
    await pg.click('[data-base="' + outro + '"]'); await pg.waitForTimeout(150);
    assert.ok(await pg.isVisible('#fala'), 'o balão aparece ao escolher o bichinho');
    const r = await pg.evaluate(() => { const f = fala.getBoundingClientRect(), p = palco.getBoundingClientRect(); return { fTopo: f.top, meio: p.top + p.height * 0.55, fBaixo: f.bottom, pBaixo: p.bottom }; });
    assert.ok(r.fTopo >= r.meio && r.fBaixo <= r.pBaixo + 1, 'o balão fica na metade de baixo do palco, longe da cabeça (' + JSON.stringify(r) + ')');
    await pg.click('#fala'); assert.ok(!(await pg.isVisible('#fala')), 'um toque fecha o balão');
    await pg.click('[data-base="' + outro + '"]'); await pg.click('[data-base]:not([data-base="' + outro + '"])'); await pg.waitForTimeout(150);
    assert.ok(await pg.isVisible('#fala'));
    await pg.waitForTimeout(5400); assert.ok(!(await pg.isVisible('#fala')), 'o balão some sozinho');
    // a bolinha da música (fixa no canto de baixo à direita, 36 px + margem) não fica em cima do Pronto
    const livre = await pg.$eval('#btPronto', (e) => { const b = e.getBoundingClientRect(); return innerWidth - b.right; });
    assert.ok(livre >= 46, 'o Pronto deixa o canto livre para a 🎵 (' + livre + ' px)');
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});
