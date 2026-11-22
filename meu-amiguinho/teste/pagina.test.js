// A página no Chromium (Playwright): node --test meu-amiguinho/teste/pagina.test.js (rodar da raiz do repositório kids).
// Com ?teste o jogo expõe window.AmiguinhoDebug: estado(), encher(f), certidaoPng(), vivo().
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
      await pg.click('#btCriar'); await pg.waitForTimeout(300);
      for (let i = 0; i < 7; i++) {
        const e = await est(pg); assert.equal(e.tela, 'oficina'); assert.equal(e.etapa, i);
        assert.equal(await pg.textContent('#seloNum'), String(i + 1));
        assert.match(await pg.textContent('#etConta'), new RegExp((i + 1) + '\\sde\\s7'));
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

// Barra de tom (dono, 22/Nov/2026: "como no Purpurina… mais escuro, mais claro"): só aparece depois de tocar numa cor; arrastar
// muda o bichinho na hora e fica no rascunho; a etapa continua sem rolar.
test('barra de tom ☀️ ↔ 🌙 no pelo, na roupa e no acessório: aparece ao tocar na cor, muda o desenho e fica lembrada', async () => {
  const pg = await abrir(360, 740);
  try {
    const arrastar = (v) => pg.evaluate((x) => { const r = document.querySelector('#painel input[type=range]'); r.value = String(x); r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); }, v);
    const desenho = () => pg.evaluate(() => document.querySelector('#pelucia').innerHTML.replace(/ id="[^"]*"|url\(#[^)]*\)/g, ''));
    await pg.click('#btCriar'); await pg.waitForTimeout(200);
    await pg.click('#btProximo'); await pg.waitForTimeout(200);
    assert.equal(await pg.locator('#painel input[type=range]').count(), 0, 'a barra só aparece depois de tocar numa cor');
    await pg.click('#painel [data-pelo="rosa"]'); await pg.waitForTimeout(150);
    assert.equal(await pg.locator('#painel input[type=range]').count(), 1);
    assert.match(await pg.textContent('#painel .linha-tom'), /Mais claro ou mais escuro/);
    let antes = await desenho(); await arrastar(80); await pg.waitForTimeout(150);
    assert.notEqual(await desenho(), antes, 'o pelo mudou de tom');
    assert.equal((await est(pg)).amigo.tom.pelo, 0.8);
    assert.ok(await naoRola(pg), 'etapa 2 rola com a barra');
    for (let i = 0; i < 2; i++) { await pg.click('#btProximo'); await pg.waitForTimeout(200); }
    await pg.click('#painel [data-roupa="pijama"]'); await pg.waitForTimeout(150);
    await pg.click('#painel [data-cor-roupa="menta"]'); await pg.waitForTimeout(150);
    antes = await desenho(); await arrastar(-70); await pg.waitForTimeout(150);
    assert.notEqual(await desenho(), antes, 'a roupa mudou de tom');
    assert.equal((await est(pg)).amigo.tom.roupa, -0.7);
    assert.ok(await naoRola(pg), 'etapa 4 rola com a barra');
    await pg.click('#btProximo'); await pg.waitForTimeout(200);
    await pg.click('#painel [data-acess="laco"]'); await pg.waitForTimeout(150);
    await pg.click('#painel [data-cor-acess="azul"]'); await pg.waitForTimeout(150);
    antes = await desenho(); await arrastar(50); await pg.waitForTimeout(150);
    assert.notEqual(await desenho(), antes, 'o laço mudou de tom');
    assert.ok(await naoRola(pg), 'etapa 5 rola com a barra');
    const r = await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:meu-amiguinho:rascunho')).amigo.tom);
    assert.deepEqual(r, { pelo: 0.8, roupa: -0.7, acess: { laco: 0.5 } }, 'o tom fica no rascunho');
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});

// Guarda-roupa em grupos (dono, 22/Nov/2026): Roupas inteiras · Partes de cima · Saias e shorts, todos à vista, sem rolar.
test('etapa 4: grupos do guarda-roupa, parte de cima + saia, a inteira tira a de baixo; rascunho antigo de camiseta ganha a bermuda', async () => {
  for (const [w, h, lang] of [[360, 740, 'pt'], [412, 915, 'es']]) {
    const pg = await abrir(w, h, lang);
    try {
      await pg.click('#btCriar'); await pg.waitForTimeout(200);
      for (let i = 0; i < 3; i++) { await pg.click('#btProximo'); await pg.waitForTimeout(200); }
      assert.equal(await pg.locator('#painel [data-grupo]').count(), 3);
      for (const g of ['inteira', 'cima', 'baixo']) assert.ok(await inteiro(pg, '#painel [data-grupo="' + g + '"]'), 'grupo ' + g + ' à vista');
      assert.equal(await pg.locator('#painel [data-roupa]').count(), await pg.evaluate(() => AmiguinhoDados.ROUPAS.filter((r) => r.grupo === 'inteira').length + 1), 'roupas inteiras (e "Sem roupa")');
      await pg.click('#painel [data-grupo="cima"]'); await pg.waitForTimeout(150);
      await pg.click('#painel [data-roupa="raglan-coruja"]'); await pg.waitForTimeout(150);
      await pg.click('#painel [data-grupo="baixo"]'); await pg.waitForTimeout(150);
      assert.equal(await pg.locator('#painel [data-baixo]').count(), await pg.evaluate(() => AmiguinhoDados.BAIXOS.length + 1), 'todas as saias, shorts e calças (e "Nada")');
      await pg.click('#painel [data-baixo="tutu-pompons"]'); await pg.waitForTimeout(150);
      await pg.click('#painel [data-cor-baixo="lilas"]'); await pg.waitForTimeout(150);
      assert.equal(await pg.locator('#painel input[type=range]').count(), 1, 'barra de tom da parte de baixo');
      assert.ok(await naoRola(pg), 'etapa 4 rola');
      let e = (await est(pg)).amigo;
      assert.equal(e.roupa, 'raglan-coruja'); assert.equal(e.baixo, 'tutu-pompons'); assert.equal(e.corBaixo, 'lilas');
      await pg.click('#painel [data-grupo="inteira"]'); await pg.waitForTimeout(150);
      await pg.click('#painel [data-roupa="vestido-listrado"]'); await pg.waitForTimeout(150);
      e = (await est(pg)).amigo; assert.equal(e.baixo, null, 'o vestido tirou o tutu');
      await pg.click('#painel [data-grupo="baixo"]'); await pg.waitForTimeout(150);
      await pg.click('#painel [data-baixo="calca-jeans"]'); await pg.waitForTimeout(150);
      e = (await est(pg)).amigo; assert.equal(e.roupa, 'nenhuma', 'a calça tirou o vestido'); assert.equal(e.baixo, 'calca-jeans');
      assert.deepEqual(pg.erros, []);
    } finally { await pg.ctx.close(); }
  }
  // rascunho de antes (camiseta com a bermuda junto, sem o campo "baixo"): abre com a bermuda separada, na mesma cor
  const pg2 = await abrir(360, 740);
  try {
    await pg2.evaluate(() => localStorage.setItem('bolinho:meu-amiguinho:rascunho', JSON.stringify({ amigo: { id: 'velho2', base: 'urso', corpo: 'pe', pelo: 'creme', roupa: 'camiseta', corRoupa: 'amarelo', acess: {}, frases: [{ pronta: 'teamo' }] }, etapa: 3 })));
    await pg2.reload(); await pg2.waitForFunction(() => window.AmiguinhoDebug && AmiguinhoDebug.pronto);
    await pg2.click('#btContinuar'); await pg2.waitForTimeout(250);
    const e = (await est(pg2)).amigo;
    assert.equal(e.roupa, 'camiseta'); assert.equal(e.corRoupa, 'amarelo'); assert.equal(e.baixo, 'bermuda'); assert.equal(e.corBaixo, 'jeans-escuro');
    assert.ok(await pg2.evaluate(() => document.querySelector('#pelucia').innerHTML.includes('#3c5c94')), 'a bermuda de antes, na mesma cor');
    assert.deepEqual(pg2.erros, []);
  } finally { await pg2.ctx.close(); }
});

test('montar uma coala do jeito da Alice, Pronto: caixinha, amiguinho vivo com ❤, certidão em PNG e coleção', async () => {
  const pg = await abrir(390, 844);
  try {
    await pg.click('#btCriar');
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

// Dono, 22/Nov/2026: sem níveis e sem Encomenda ("é só para desenho tranquilo"); tudo liberado sempre.
test('sem níveis nem Encomenda: começo só com Criar e Coleção, todas as opções sempre; rascunho antigo abre normal', async () => {
  const pg = await abrir(360, 740);
  try {
    assert.equal(await pg.locator('[data-nivel]').count(), 0, 'sem Fácil/Médio/Encomenda');
    assert.equal(await pg.$('#encomenda'), null);
    await pg.click('#btCriar'); await pg.waitForTimeout(200);
    assert.equal(await pg.locator('#painel [data-base]').count(), await pg.evaluate(() => AmiguinhoDados.BASES.length), 'todos os bichinhos');
    for (let i = 0; i < 4; i++) await pg.click('#btProximo');
    const n = await pg.evaluate(() => AmiguinhoDados.ACESS.filter((x) => x.caixa === 'laco').length);
    assert.equal(await pg.locator('#painel [data-acess]').count(), n, 'todos os laços');
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
  // rascunho guardado por uma versão antiga (com nivel e enc) e preferência com nivel: abre normal, sem cartão de encomenda
  const pg2 = await abrir(360, 740, 'pt', {});
  try {
    await pg2.evaluate(() => {
      localStorage.setItem('bolinho:meu-amiguinho:pref', JSON.stringify({ nivel: 'dificil', efeitos: true }));
      localStorage.setItem('bolinho:meu-amiguinho:rascunho', JSON.stringify({ amigo: { id: 'velho', base: 'gato', corpo: 'pe', pelo: 'cinza', acess: { laco: 'laco' }, frases: [{ pronta: 'teamo' }] },
        enc: { base: 'coelha', pelo: 'rosa', roupa: 'pijama', acess: {} }, etapa: 3, nivel: 'dificil' }));
    });
    await pg2.reload(); await pg2.waitForFunction(() => window.AmiguinhoDebug && AmiguinhoDebug.pronto);
    assert.ok(await pg2.isVisible('#btContinuar'));
    await pg2.click('#btContinuar'); await pg2.waitForTimeout(200);
    const e = await est(pg2); assert.equal(e.tela, 'oficina'); assert.equal(e.etapa, 3); assert.equal(e.amigo.base, 'gato'); assert.deepEqual(e.amigo.acess, { laco: 'laco' });
    await pg2.click('#btPronto');
    await pg2.waitForFunction(() => AmiguinhoDebug.estado().tela === 'amigo', null, { timeout: 8000 });
    assert.ok((await pg2.textContent('#amNome')).length > 0);
    assert.equal(await pg2.evaluate(() => localStorage.getItem('bolinho:meu-amiguinho:rascunho')), null, 'o rascunho virou amiguinho na coleção');
    assert.deepEqual(pg2.erros, []);
  } finally { await pg2.ctx.close(); }
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
    await pg.click('#btCriar');
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

// Dono, 22/Nov/2026: onde dá para salvar a imagem, dá também para 📤 Compartilhar (WhatsApp etc.), só se o aparelho deixa.
for (const comSuporte of [true, false]) {
  test('certidão: 📤 Compartilhar ' + (comSuporte ? 'aparece e manda o PNG' : 'some quando o aparelho não compartilha arquivo'), async () => {
    const pg = await abrir(390, 844);
    try {
      await pg.evaluate((sim) => {
        window.__mandou = null;
        if (sim) {
          Navigator.prototype.canShare = function (d) { return !!(d && d.files && d.files.length && d.files.every((f) => f instanceof File)); };
          Navigator.prototype.share = function (d) { window.__mandou = { titulo: d.title, arquivos: d.files.map((f) => ({ nome: f.name, tipo: f.type, tam: f.size })) }; return Promise.reject(new DOMException('cancelou', 'AbortError')); };
        } else { delete Navigator.prototype.canShare; delete Navigator.prototype.share; }
      }, comSuporte);
      await pg.click('#btColecao'); await pg.waitForTimeout(300);
      await pg.click('.cartao-amigo >> nth=0'); await pg.waitForTimeout(300);
      await pg.click('#btCertidao'); await pg.waitForSelector('#certJanela:not([hidden]) .ct-svg');
      if (comSuporte) {
        await pg.waitForSelector('#btCompartilhar:not([hidden])', { timeout: 8000 });
        assert.equal(await pg.textContent('#btCompartilhar'), '📤 Compartilhar');
        await pg.click('#btCompartilhar'); await pg.waitForTimeout(200);
        const m = await pg.evaluate(() => window.__mandou);
        assert.equal(m.arquivos.length, 1); assert.equal(m.arquivos[0].tipo, 'image/png'); assert.match(m.arquivos[0].nome, /^certidao-alice\.png$/); assert.ok(m.arquivos[0].tam > 20000);
        assert.ok(await pg.isVisible('#certJanela'), 'cancelar não fecha nem dá erro');
      } else {
        await pg.waitForTimeout(1500);
        assert.ok(await pg.isHidden('#btCompartilhar')); assert.ok(await pg.isVisible('#btSalvarPng'));
      }
      assert.deepEqual(pg.erros, []);
    } finally { await pg.ctx.close(); }
  });
}
