// Quem é? — casos achados na revisão final (14/Nov/2026). Rodar da raiz: node --test quem-e/teste/revisao.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');
const R = require('../rede.js');
const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
let browser, base;
test.before(async () => { await new Promise(r => server.listen(0, '127.0.0.1', r)); base = 'http://127.0.0.1:' + server.address().port + '/quem-e/'; browser = await chromium.launch(); });
test.after(async () => { if (browser) await browser.close(); server.close(); });

async function pagina(ctx, url) {
  const pg = await ctx.newPage(); pg.errosPg = [];
  pg.on('pageerror', e => pg.errosPg.push(e.message));
  await pg.goto(url); await pg.waitForFunction(() => window.QEDebug && window.QEDebug.pronto);
  return pg;
}
// A cria, B entra; os dois escolhem o segredo (A: carta 2, B: carta 5)
async function duasAbas(nivel) {
  const ctx = await browser.newContext({ locale: 'pt-BR', viewport: { width: 390, height: 844 } });
  const a = await pagina(ctx, base + '?teste');
  await a.click('#btBlue'); await a.click('#btRede'); await a.click('#btCriarSala'); await a.click('#bt' + nivel);
  await a.waitForSelector('#redeSala:not([hidden])');
  const codigo = (await a.textContent('#codigoSala')).trim();
  const b = await pagina(ctx, base + '?teste&sala=' + codigo);
  await b.waitForSelector('#segredo.ativa', { timeout: 10000 }); await a.waitForSelector('#segredo.ativa', { timeout: 10000 });
  await a.click('#segredo .carta[data-id="2"]'); await a.click('#btConfirmarSegredo');
  await b.click('#segredo .carta[data-id="5"]'); await b.click('#btConfirmarSegredo');
  await a.waitForSelector('#jogo.ativa'); await b.waitForSelector('#jogo.ativa');
  return { ctx, a, b, codigo };
}

test('recarregar no meio da partida em dois celulares volta para o jogo, com as cartas viradas', async () => {
  const { ctx, a, b } = await duasAbas('Medio');
  await a.click('#tabuleiro .carta[data-id="7"]'); await a.click('#tabuleiro .carta[data-id="9"]');
  assert.equal(await a.locator('#tabuleiro .carta.virada').count(), 2);
  await a.reload(); await a.waitForFunction(() => window.QEDebug && window.QEDebug.pronto);
  await a.waitForSelector('#jogo.ativa', { timeout: 8000 });
  assert.equal(await a.locator('#tabuleiro .carta.virada').count(), 2, 'as cartas viradas voltaram de pé');
  await a.waitForSelector('#acoes:not([hidden])', { timeout: 8000 });
  await b.reload(); await b.waitForFunction(() => window.QEDebug && window.QEDebug.pronto);
  await b.waitForSelector('#jogo.ativa', { timeout: 8000 });
  assert.deepEqual(a.errosPg.concat(b.errosPg), []);
  await ctx.close();
});

test('quem criou recarrega antes do amigo entrar: continua dono da sala, com o código à vista', async () => {
  const ctx = await browser.newContext({ locale: 'pt-BR', viewport: { width: 390, height: 844 } });
  const a = await pagina(ctx, base + '?teste');
  await a.click('#btPink'); await a.click('#btRede'); await a.click('#btCriarSala'); await a.click('#btFacil');
  const codigo = (await a.textContent('#codigoSala')).trim();
  await a.reload(); await a.waitForFunction(() => window.QEDebug && window.QEDebug.pronto);
  await a.waitForSelector('#redeSala:not([hidden])', { timeout: 5000 });
  assert.equal((await a.textContent('#codigoSala')).trim(), codigo);
  const b = await pagina(ctx, base + '?teste&sala=' + codigo);
  await b.waitForSelector('#segredo.ativa', { timeout: 10000 }); await a.waitForSelector('#segredo.ativa', { timeout: 10000 });
  await ctx.close();
});

test('palpite errado em dois celulares: avisa "Não é…"; "Trocar o nível" sai da sala', async () => {
  const { ctx, a, b } = await duasAbas('Facil');
  await a.click('#btPalpite'); await a.click('#tabuleiro .carta[data-id="0"]'); await a.click('#btConfirmarPalpite');
  await a.waitForFunction(() => /Não é/.test(document.getElementById('balao').textContent), null, { timeout: 8000 });
  await b.waitForSelector('#acoes:not([hidden])', { timeout: 8000 });
  await b.click('#btPalpite'); await b.click('#tabuleiro .carta[data-id="2"]'); await b.click('#btConfirmarPalpite');
  await a.waitForSelector('#fim:not([hidden])', { timeout: 8000 });
  await a.click('#btOutroNivel');
  assert.equal(await a.evaluate(() => QEDebug.temSala()), false, 'a sala continuou aberta');
  await ctx.close();
});

test('lupa ligada não atrapalha escolher o segredo nem o palpite', async () => {
  const ctx = await browser.newContext({ locale: 'pt-BR', viewport: { width: 390, height: 844 } });
  const pg = await pagina(ctx, base + '?teste');
  await pg.click('#btPink'); await pg.click('#btMeleca'); await pg.click('#btFacil');
  await pg.click('#segredo .carta[data-id="0"]'); await pg.click('#btConfirmarSegredo');
  await pg.click('#btLupa');
  await pg.click('#btPalpite'); await pg.click('#tabuleiro .carta[data-id="4"]');
  assert.equal(await pg.locator('dialog.sj[open]').count(), 0, 'no palpite a lupa abriu em vez de escolher');
  assert.match(await pg.textContent('#btConfirmarPalpite'), /É /);
  await pg.click('#btCancelarPalpite');
  await pg.click('.bolinho-nav .bn-casa'); await pg.waitForSelector('#inicio.ativa');
  await pg.click('#btPink'); await pg.click('#btMeleca'); await pg.click('#btFacil');
  await pg.click('#segredo .carta[data-id="3"]');
  assert.equal(await pg.locator('dialog.sj[open]').count(), 0, 'no segredo a lupa abriu em vez de escolher');
  assert.equal(await pg.locator('#segredo .carta.escolhida').count(), 1);
  await ctx.close();
});

test('Fácil com todas as cartas viradas: nenhum título de grupo vazio na lista de perguntas', async () => {
  const ctx = await browser.newContext({ locale: 'pt-BR', viewport: { width: 390, height: 844 } });
  const pg = await pagina(ctx, base + '?teste');
  await pg.click('#btPink'); await pg.click('#btMeleca'); await pg.click('#btFacil');
  await pg.click('#segredo .carta[data-id="0"]'); await pg.click('#btConfirmarSegredo');
  for (let i = 0; i < 12; i++) await pg.click('#tabuleiro .carta[data-id="' + i + '"]');
  await pg.click('#btPerguntar');
  const vazios = await pg.evaluate(() => [...document.querySelectorAll('#listaPerguntas h3')].filter(h => !h.nextElementSibling || h.nextElementSibling.tagName === 'H3').length);
  assert.equal(vazios, 0);
  assert.ok(await pg.locator('#listaPerguntas .vazio').count() === 1, 'sem a dica de usar o É este!');
  await ctx.close();
});

test('rede: "revelar" com carta fora do tabuleiro é ignorado', () => {
  const msgs = [];
  const a = R.criar({ id: 'aaaaaaaa', codigo: 'ABCD', host: true, nivel: 'facil', semente: 3, mandar: m => msgs.push(m), agora: () => 0 });
  a.receber({ t: 'oi', de: 'bbbbbbbb' });
  a.agir('segredo', { c: 1 });
  a.receber({ t: 'pronto', de: 'bbbbbbbb' });
  a.agir('palpite', { c: 4 });
  a.receber({ t: 'ev', de: 'bbbbbbbb', e: { n: 1, j: 1, k: 'veredito', ok: true } });
  assert.equal(a.partida.estado.fase, 'fim');
  a.receber({ t: 'revelar', de: 'bbbbbbbb', c: 40 });
  assert.equal(a.revelado(), null);
  a.receber({ t: 'revelar', de: 'bbbbbbbb', c: 4 });
  assert.equal(a.revelado(), 4);
});
