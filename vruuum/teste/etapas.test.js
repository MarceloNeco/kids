// Menu em etapas (dono, 20/Nov/2026: "tem que ter várias etapas (...) e o jogar tem que estar sempre lá, disponível com
// alguma opção padrão, visível"): no celular em pé (360×740 e 390×844) e deitado (844×390), em cada etapa a página não
// rola e o 🏁 Correr! está inteiro na tela; dá para correr direto da etapa 1; o Voltar do celular volta uma etapa;
// nenhuma opção do menu antigo sumiu. Rodar da raiz do repositório: node --test vruuum/teste/etapas.test.js
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require('playwright');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.wasm': 'application/wasm', '.tflite': 'application/octet-stream' };
const servidor = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (!p.startsWith('/kids/') || /\.(mp3|wav)$/.test(p)) { res.writeHead(404); res.end(); return; }
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

async function abrirMenu(w, h, lingua) {
  const ctx = await navegador.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, serviceWorkers: 'block' });
  await ctx.addInitScript((l) => { localStorage.setItem('bolinho:idioma', l); }, lingua || 'pt');
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  const pg = await ctx.newPage(), erros = [];
  pg.on('pageerror', (e) => erros.push(e.message));
  await pg.goto(base + 'vruuum/?teste'); await pg.waitForTimeout(600);
  await pg.evaluate(() => document.getElementById('btEntrar').click());   // o botão pulsa: o clique vai direto
  await pg.waitForSelector('#menu.ativa #btCorrer', { state: 'visible', timeout: 10000 });
  await pg.waitForTimeout(400);
  return { ctx, pg, erros };
}
const medir = (pg) => pg.evaluate(() => {
  const caixa = (id) => { const e = document.getElementById(id), r = e.getBoundingClientRect(); return { t: r.top, b: r.bottom, l: r.left, r: r.right, ver: !e.hidden && r.width > 0 }; };
  return { etapa: +document.getElementById('menu').getAttribute('data-etapa'), nome: document.getElementById('etapaNome').textContent,
    num: document.getElementById('etapaNum').textContent, rolar: document.documentElement.scrollHeight, alto: innerHeight, largo: innerWidth, y: scrollY,
    correr: caixa('btCorrer'), proximo: caixa('btProximo'), voltar: caixa('btVoltarEtapa') };
});
const dentro = (c, m) => c.t >= 0 && c.l >= 0 && c.b <= m.alto + 0.5 && c.r <= m.largo + 0.5;

for (const [w, h] of [[360, 740], [390, 844], [844, 390]]) {
  test('etapas: em ' + w + '×' + h + ' cada etapa cabe na tela e o Correr fica à vista', async () => {
    const { ctx, pg, erros } = await abrirMenu(w, h);
    try {
      const total = await pg.evaluate(() => document.querySelectorAll('[data-ir-etapa]').length);
      assert.equal(total, 5);
      for (let k = 0; k < total; k++) {
        if (k) { await pg.click('#btProximo'); await pg.waitForTimeout(250); }
        const m = await medir(pg), onde = w + '×' + h + ' etapa ' + (k + 1);
        assert.equal(m.etapa, k, onde + ': etapa errada');
        assert.match(m.num, new RegExp('Etapa ' + (k + 1) + ' de 5'), onde);
        assert.ok(m.nome.length > 2, onde + ': sem o nome da etapa');
        assert.ok(m.rolar <= m.alto + 2 && m.y === 0, onde + ': a página rola (' + m.rolar + ' > ' + m.alto + ')');
        assert.ok(m.correr.ver && dentro(m.correr, m), onde + ': o Correr não está inteiro na tela ' + JSON.stringify(m.correr));
        assert.equal(m.voltar.ver, k > 0, onde + ': Voltar');
        assert.equal(m.proximo.ver, k < total - 1, onde + ': Próximo');
        if (m.proximo.ver) assert.ok(dentro(m.proximo, m), onde + ': Próximo fora da tela');
        if (m.voltar.ver) assert.ok(dentro(m.voltar, m), onde + ': Voltar fora da tela');
      }
      assert.deepEqual(erros, []);
    } finally { await ctx.close(); }
  });
}

test('etapas: em espanhol e inglês a etapa mais cheia (veículo) também não rola a página', async () => {
  for (const l of ['es', 'en']) {
    const { ctx, pg } = await abrirMenu(360, 740, l);
    try {
      await pg.click('[data-ir-etapa="2"]'); await pg.waitForTimeout(250);
      const m = await medir(pg);
      assert.equal(m.etapa, 2);
      assert.ok(m.rolar <= m.alto + 2 && dentro(m.correr, m), l + ': ' + JSON.stringify(m));
    } finally { await ctx.close(); }
  }
});

test('etapas: corre direto da etapa 1, com as escolhas de padrão', async () => {
  const { ctx, pg, erros } = await abrirMenu(360, 740);
  try {
    assert.equal((await medir(pg)).etapa, 0);
    await pg.click('#btCorrer');
    await pg.waitForSelector('#jogo.ativa', { timeout: 5000 });
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('etapas: o Voltar do celular volta uma etapa; as bolinhas levam direto a uma etapa', async () => {
  const { ctx, pg, erros } = await abrirMenu(390, 844);
  try {
    await pg.click('#btProximo'); await pg.waitForTimeout(150);
    await pg.click('#btProximo'); await pg.waitForTimeout(150);
    assert.equal((await medir(pg)).etapa, 2);
    await pg.goBack().catch(() => {}); await pg.waitForTimeout(300);
    assert.equal((await medir(pg)).etapa, 1, 'Voltar da etapa 3 vai para a 2');
    await pg.goBack().catch(() => {}); await pg.waitForTimeout(300);
    assert.equal((await medir(pg)).etapa, 0, 'Voltar da etapa 2 vai para a 1');
    assert.ok(pg.url().includes('/vruuum/'), 'continua no jogo');
    // bolinha: pula para a etapa 4; o botão Voltar da tela anda uma etapa para trás
    await pg.click('[data-ir-etapa="3"]'); await pg.waitForTimeout(150);
    assert.equal((await medir(pg)).etapa, 3);
    await pg.click('#btVoltarEtapa'); await pg.waitForTimeout(300);
    assert.equal((await medir(pg)).etapa, 2);
    // da corrida, o 🏠 volta ao menu na mesma etapa
    await pg.click('#btCorrer'); await pg.waitForSelector('#jogo.ativa', { timeout: 5000 });
    await pg.click('.bolinho-nav .bn-casa'); await pg.waitForSelector('#menu.ativa', { timeout: 5000 }); await pg.waitForTimeout(300);
    assert.equal((await medir(pg)).etapa, 2, 'voltou ao menu na etapa em que estava');
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('etapas: nenhuma opção do menu sumiu, e cada uma está numa etapa', async () => {
  const { ctx, pg } = await abrirMenu(390, 844);
  try {
    const r = await pg.evaluate(() => {
      const SEL = ['[data-jogadores="1"]', '[data-jogadores="2"]', '[data-nivel="crianca"]', '[data-nivel="normal"]', '[data-nivel="turbo"]',
        '[data-rivais="com"]', '[data-rivais="sem"]', '#btDuelo', '#btTvControles', '#btSerControle', '#recordeMenu',
        '#mundosEsc [data-mundo=""]', '[data-visual="misto"]', '[data-visual="neon"]', '[data-visual="colorido"]',
        '#previa', '#veiculos .cartao-veic', '#cores .cor', '[data-corpo="menina"]', '[data-corpo="menino"]', '#bichos [data-piloto]', '#bichos [data-personagem]',
        '#musNome', '#musAnt', '#musProx', '[data-controle="toque"]', '[data-controle="maos"]', '#btGuardar', '#ver', '#btSom', '#btAjuda'];
      const faltam = SEL.filter((s) => !document.querySelector(s));
      const foraDeEtapa = SEL.filter((s) => { const e = document.querySelector(s); return e && !e.closest('.etapa') && !e.closest('.faixa'); });
      return { faltam, foraDeEtapa, veic: document.querySelectorAll('#veiculos .cartao-veic').length, total: window.VruuumVeiculos.LISTA.length,
        mundos: document.querySelectorAll('#mundosEsc .cartao-mundo').length, totalMundos: window.VruuumPista.MUNDOS.length + 1 };
    });
    assert.deepEqual(r.faltam, []); assert.deepEqual(r.foraDeEtapa, []);
    assert.equal(r.veic, r.total, 'todos os veículos'); assert.equal(r.mundos, r.totalMundos, 'todos os cenários e a surpresa');
  } finally { await ctx.close(); }
});

test('1.34.0: o Piloto é a última etapa e só aparece quando o personagem aparece no veículo', async () => {
  const { ctx, pg, erros } = await abrirMenu(390, 844);
  try {
    const estado = () => pg.evaluate(() => ({
      etapa: +document.getElementById('menu').getAttribute('data-etapa'), num: document.getElementById('etapaNum').textContent,
      nome: document.getElementById('etapaNome').textContent,
      bolinhas: Array.from(document.querySelectorAll('[data-ir-etapa]')).filter((b) => !b.parentNode.hidden).length,
      proximo: !document.getElementById('btProximo').hidden, bichos: document.getElementById('bichos').offsetParent !== null }));
    const escolher = (id) => pg.evaluate((v) => document.querySelector('[data-veic="' + v + '"]').click(), id);
    await pg.click('[data-ir-etapa="2"]'); await pg.waitForTimeout(150);
    await escolher('classico'); await pg.waitForTimeout(100);
    let e = await estado();
    assert.equal(e.bolinhas, 5); assert.match(e.num, /de 5/);
    await pg.click('#btProximo'); await pg.waitForTimeout(150);
    e = await estado(); assert.equal(e.etapa, 3); assert.match(e.nome, /Música/); assert.ok(e.proximo, 'depois da música vem o Piloto');
    await pg.click('#btProximo'); await pg.waitForTimeout(150);
    e = await estado(); assert.equal(e.etapa, 4); assert.match(e.nome, /Piloto/); assert.ok(e.bichos, 'os personagens aparecem'); assert.ok(!e.proximo, 'é a última');
    for (const id of ['urso', 'bruxa', 'treno', 'ovo']) {   // personagem não aparece: 4 etapas, a da música é a última
      await pg.click('[data-ir-etapa="2"]'); await pg.waitForTimeout(150);
      await escolher(id); await pg.waitForTimeout(100);
      e = await estado(); assert.equal(e.bolinhas, 4, id); assert.match(e.num, /de 4/, id);
      await pg.click('#btProximo'); await pg.waitForTimeout(150);
      e = await estado(); assert.equal(e.etapa, 3, id); assert.ok(!e.proximo, id + ': a música é a última');
    }
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});
