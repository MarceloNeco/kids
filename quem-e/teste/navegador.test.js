// Quem é? — o jogo no Chromium (Playwright). Rodar da raiz: node --test quem-e/teste/navegador.test.js
// Com ?teste a meleca joga sem esperar e o sorteio usa semente fixa.
const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');
const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg', '.md': 'text/markdown' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const IGNORAR = /favicon|solverone-dados|\.mp3|ERR_|net::/i;
let browser, base;
test.before(async () => { await new Promise(r => server.listen(0, '127.0.0.1', r)); base = 'http://127.0.0.1:' + server.address().port + '/quem-e/'; browser = await chromium.launch(); });
test.after(async () => { if (browser) await browser.close(); server.close(); });

async function abrir(viewport) {
  const ctx = await browser.newContext({ locale: 'pt-BR', viewport: viewport || { width: 390, height: 844 }, hasTouch: true });
  const pg = await ctx.newPage(); const erros = [];
  pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) erros.push(m.text()); });
  pg.on('response', r => { if (r.status() >= 400) erros.push(r.status() + ' ' + r.url()); });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  await pg.goto(base + '?teste');
  await pg.waitForFunction(() => window.QEDebug && window.QEDebug.pronto);
  pg.erros = () => erros.filter(e => !IGNORAR.test(e));
  pg.ctx = ctx;
  return pg;
}
const visivel = (pg, sel) => pg.locator(sel).first().isVisible();
async function comecar(pg, nivel) {
  await pg.click('#btPink');
  await pg.waitForSelector('#modos.ativa');
  await pg.click('#btMeleca');
  await pg.waitForSelector('#niveis.ativa');
  await pg.click('#bt' + nivel);
  await pg.waitForSelector('#segredo.ativa');
  await pg.click('#segredo .carta[data-id="0"]');
  await pg.click('#btConfirmarSegredo');
  await pg.waitForSelector('#jogo.ativa');
}

test('partida inteira contra a Pink Honey no Fácil, com resposta errada recusada', async () => {
  const pg = await abrir();
  await comecar(pg, 'Facil');
  let recusou = false;
  for (let i = 0; i < 120; i++) {
    if (await visivel(pg, '#fim:not([hidden])')) break;
    const a = await pg.evaluate(() => QEDebug.aguardando());
    if (!a) { await pg.waitForTimeout(30); continue; }
    if (a.jogador === 1) { await pg.waitForTimeout(30); continue; }
    if (a.acao === 'responder') {
      const certa = await pg.evaluate(() => QEDebug.respostaCerta());
      if (!recusou) {
        await pg.click(certa ? '#btNao' : '#btSim');
        await pg.waitForSelector('#olhaDeNovo:not([hidden])');
        assert.equal((await pg.evaluate(() => QEDebug.aguardando())).acao, 'responder');
        recusou = true;
      }
      await pg.click(certa ? '#btSim' : '#btNao');
      continue;
    }
    if (a.acao === 'perguntar') {
      const vivas = await pg.evaluate(() => QEDebug.estado().dePe[0].filter(Boolean).length);
      if (vivas === 1) {
        await pg.click('#btPalpite');
        await pg.click('#tabuleiro .carta:not(.virada)');
        await pg.click('#btConfirmarPalpite');
        continue;
      }
      await pg.click('#btPerguntar');
      await pg.waitForSelector('#perguntas:not([hidden])');
      await pg.click('#perguntas button[data-p]:not(.inutil)');
      continue;
    }
    if (a.acao === 'descartar') { await pg.click('#btPronto'); continue; }
    await pg.waitForTimeout(30);
  }
  assert.ok(recusou, 'a meleca nunca perguntou');
  await pg.waitForSelector('#fim:not([hidden])');
  assert.deepEqual(pg.erros(), []);
  await pg.click('#btDeNovo');
  await pg.waitForSelector('#segredo.ativa');
  await pg.ctx.close();
});

test('Médio: o botão descarta exatamente as que não servem', async () => {
  const pg = await abrir();
  await comecar(pg, 'Medio');
  await pg.click('#btPerguntar');
  await pg.click('#perguntas button[data-p]:not(.inutil)');
  await pg.waitForSelector('#btDescartar:not([hidden])');
  const esperado = await pg.evaluate(() => QEDebug.quantasDescartar());
  assert.match(await pg.textContent('#btDescartar'), /Descartar quem|Nenhuma para descartar/);
  await pg.click('#btDescartar');
  assert.equal(await pg.locator('#tabuleiro .carta.virada').count(), esperado);
  // virar uma por uma também vale
  const antes = await pg.locator('#tabuleiro .carta.virada').count();
  await pg.click('#tabuleiro .carta:not(.virada) >> nth=0');
  assert.equal(await pg.locator('#tabuleiro .carta.virada').count(), antes + 1);
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

for (const vp of [{ width: 360, height: 740 }, { width: 740, height: 360 }]) {
  test('Difícil cabe sem rolar em ' + vp.width + '×' + vp.height, async () => {
    const pg = await abrir(vp);
    await comecar(pg, 'Dificil');
    const r = await pg.evaluate(() => {
      const cartas = [...document.querySelectorAll('#tabuleiro .carta')].map(c => c.getBoundingClientRect());
      return { n: cartas.length, fora: cartas.filter(b => b.bottom > innerHeight + 1 || b.right > innerWidth + 1 || b.top < 0).length,
        menor: Math.min(...cartas.map(b => b.width)), rola: document.scrollingElement.scrollHeight - innerHeight };
    });
    assert.ok(r.n >= 30, 'cartas: ' + r.n);
    assert.equal(r.fora, 0, 'cartas fora da tela');
    assert.ok(r.rola <= 1, 'a página rola ' + r.rola);
    assert.ok(r.menor >= 44, 'carta pequena demais: ' + r.menor);
    await pg.ctx.close();
  });
}

test('lupa abre a cara grande e fecha com Esc; 🏠 volta ao começo', async () => {
  const pg = await abrir();
  await comecar(pg, 'Facil');
  await pg.click('#btLupa');
  await pg.click('#tabuleiro .carta[data-id="3"]');
  await pg.waitForSelector('dialog.sj[open] .lupa svg');
  await pg.keyboard.press('Escape');
  await pg.waitForFunction(() => !document.querySelector('dialog.sj[open]'));
  assert.equal(await pg.locator('#tabuleiro .carta.virada').count(), 0, 'a lupa virou a carta');
  pg.once('dialog', d => d.accept());
  await pg.click('.bolinho-nav .bn-casa');
  const sair = pg.locator('.bolinho-sair button').first();
  if (await sair.isVisible().catch(() => false)) await sair.click();
  await pg.waitForSelector('#inicio.ativa');
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('cada um no seu celular: duas abas jogam pelo código', async () => {
  const a = await abrir();
  await a.click('#btBlue'); await a.click('#btRede'); await a.waitForSelector('#rede.ativa');
  await a.click('#btCriarSala'); await a.click('#btFacil');
  await a.waitForSelector('#redeSala:not([hidden])');
  const codigo = (await a.textContent('#codigoSala')).trim();
  assert.match(codigo, /^[A-Z]{4}$/);
  const b = await a.ctx.newPage(); const errosB = [];
  b.on('pageerror', e => errosB.push(e.message));
  await b.goto(base + '?teste&sala=' + codigo);
  await b.waitForSelector('#segredo.ativa', { timeout: 10000 });
  await a.waitForSelector('#segredo.ativa', { timeout: 10000 });
  await a.click('#segredo .carta[data-id="2"]'); await a.click('#btConfirmarSegredo');
  await b.click('#segredo .carta[data-id="5"]'); await b.click('#btConfirmarSegredo');
  await a.waitForSelector('#jogo.ativa'); await b.waitForSelector('#jogo.ativa');
  // A pergunta, B responde (a errada é recusada), A passa a vez
  await a.click('#btPerguntar'); await a.click('#perguntas button[data-p]:not(.inutil)');
  await b.waitForSelector('#responder:not([hidden])', { timeout: 10000 });
  const certa = await b.evaluate(() => QEDebug.respostaCerta());
  await b.click(certa ? '#btNao' : '#btSim');
  await b.waitForSelector('#olhaDeNovo:not([hidden])');
  await b.click(certa ? '#btSim' : '#btNao');
  await a.waitForSelector('#descartar:not([hidden])', { timeout: 10000 });
  await a.click('#btPronto');
  await b.waitForSelector('#acoes:not([hidden])', { timeout: 10000 });
  // B chuta certo (o segredo de A é a carta 2)
  await b.click('#btPalpite'); await b.click('#tabuleiro .carta[data-id="2"]'); await b.click('#btConfirmarPalpite');
  await b.waitForSelector('#fim:not([hidden])', { timeout: 10000 });
  await a.waitForSelector('#fim:not([hidden])', { timeout: 10000 });
  await b.waitForFunction(() => !document.querySelector('#fimCaras .oculta'), null, { timeout: 10000 });
  assert.deepEqual(a.erros(), []); assert.deepEqual(errosB, []);
  await a.ctx.close();
});

test('sem internet depois da primeira visita: contra a meleca funciona e o celular-a-celular avisa', async () => {
  const ctx = await browser.newContext({ locale: 'pt-BR', viewport: { width: 390, height: 844 } });
  const pg = await ctx.newPage(); const erros = [];
  pg.on('pageerror', e => erros.push(e.message));
  await pg.goto(base);
  await pg.evaluate(() => navigator.serviceWorker.ready);
  await pg.reload(); await pg.waitForFunction(() => !!navigator.serviceWorker.controller);
  await pg.waitForTimeout(800);
  await ctx.setOffline(true);
  await pg.reload();
  await pg.waitForFunction(() => window.QEDebug && window.QEDebug.pronto);
  await pg.click('#btPink'); await pg.click('#btMeleca'); await pg.click('#btFacil');
  await pg.waitForSelector('#segredo.ativa');
  assert.ok(await pg.locator('#gradeSegredo .carta').count() === 12);
  await pg.goBack().catch(() => {});
  await pg.waitForSelector('#inicio.ativa');
  await pg.click('#btPink'); await pg.click('#btRede');
  assert.match(await pg.textContent('#redeStatus'), /Sem internet/);
  assert.deepEqual(erros, []);
  await ctx.close();
});

test('passando o aparelho: nomes de quem joga, a meleca avisa a troca e lê a pergunta em voz alta', async () => {
  const ctx = await browser.newContext({ locale: 'pt-BR', viewport: { width: 390, height: 844 }, hasTouch: true });
  await ctx.addInitScript(() => {
    window.__falas = [];
    const S = function (t) { this.text = t; };
    window.SpeechSynthesisUtterance = S;
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speak: u => { window.__falas.push(u.text); setTimeout(() => u.onend && u.onend(), 5); }, cancel: () => {}, getVoices: () => [{ name: 'Local', lang: 'pt-BR', localService: true }], speaking: false, addEventListener: () => {} } });
  });
  const pg = await ctx.newPage(); const erros = [];
  pg.on('pageerror', e => erros.push(e.message));
  await pg.goto(base + '?teste'); await pg.waitForFunction(() => window.QEDebug && window.QEDebug.pronto);
  await pg.click('#btBlue'); await pg.click('#btPassar'); await pg.click('#btFacil');
  await pg.waitForSelector('#nomes.ativa');
  await pg.fill('#nome1', 'Ana'); await pg.fill('#nome2', 'Bia'); await pg.click('#btNomesOk');
  await pg.waitForSelector('#segredo.ativa');
  assert.match(await pg.textContent('#tituloSegredo'), /Ana/);
  await pg.click('#segredo .carta[data-id="0"]'); await pg.click('#btConfirmarSegredo');
  await pg.waitForSelector('#cortina:not([hidden])');
  assert.match(await pg.textContent('#cortinaTitulo'), /Bia/);
  await pg.waitForFunction(() => window.__falas.some(f => /Bia/.test(f)), null, { timeout: 3000 });
  await pg.click('#btCortina');
  await pg.click('#segredo .carta[data-id="1"]'); await pg.click('#btConfirmarSegredo');
  await pg.click('#btCortina');
  await pg.click('#btPerguntar'); await pg.click('#perguntas button[data-p]:not(.inutil)');
  const pergunta = await pg.evaluate(() => { const id = QEDebug.estado().ultima.pergunta; return QELogica.pergunta(id).pt; });
  await pg.click('#btCortina');
  await pg.waitForSelector('#responder:not([hidden])');
  await pg.waitForFunction(p => window.__falas.filter(f => f.includes(p.replace(/[\u{1F000}-\u{1FAFF}]/gu, '').trim())).length >= 2, pergunta, { timeout: 3000 });
  assert.deepEqual(erros, []);
  // os nomes ficam guardados só neste aparelho e voltam na próxima partida
  assert.deepEqual(await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:quem-e:pref')).nomes), ['Ana', 'Bia']);
  await ctx.close();
});

for (const vp of [{ width: 360, height: 740 }, { width: 740, height: 360 }]) {
  test('corpo inteiro ligado: cartas altas, perguntas de roupa e tudo cabe em ' + vp.width + '×' + vp.height, async () => {
    const pg = await abrir(vp);
    await pg.click('#btPink'); await pg.click('#btMeleca');
    await pg.click('#btCorpo');
    assert.equal(await pg.getAttribute('#btCorpo', 'aria-pressed'), 'true');
    await pg.click('#btDificil');
    await pg.waitForSelector('#segredo.ativa');
    await pg.click('#segredo .carta[data-id="0"]'); await pg.click('#btConfirmarSegredo');
    await pg.waitForSelector('#jogo.ativa');
    assert.ok(await pg.evaluate(() => QEDebug.estado() && document.querySelector('#tabuleiro .carta svg').getAttribute('viewBox').split(' ')[3] > 400), 'carta sem o corpo');
    const r = await pg.evaluate(() => { const c = [...document.querySelectorAll('#tabuleiro .carta')].map(x => x.getBoundingClientRect()); return { fora: c.filter(b => b.bottom > innerHeight + 1 || b.right > innerWidth + 1).length, menor: Math.min(...c.map(b => b.width)), alta: c[0].height / c[0].width }; });
    assert.equal(r.fora, 0); assert.ok(r.menor >= 28, 'estreita: ' + r.menor); assert.ok(r.alta > 1.9, 'não é alta: ' + r.alta);
    await pg.click('#btPerguntar');
    assert.ok(await pg.locator('#perguntas button[data-p="saia"], #perguntas button[data-p="short"], #perguntas button[data-p="calca"], #perguntas button[data-p="vestido"]').count() >= 1);
    assert.deepEqual(pg.erros(), []);
    // a escolha fica guardada
    assert.equal(await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:quem-e:pref')).corpo), true);
    await pg.ctx.close();
  });
}
