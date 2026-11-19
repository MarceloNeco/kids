// Testes do Boliche da Jogoteca: node --test jogoteca/teste/boliche.test.js (rodar da raiz do repositório kids).
// 1) Pontuação e física (lógica pura, no Node). 2) Página no Chromium (Playwright): canvas, arrasto lança, placar registra.
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');

global.window = global.window || {};
require('../jogos/boliche.js');
const jogo = window.JogotecaJogos.find(j => j.id === 'boliche');
const L = jogo.logica;
const rep = (arr, n) => [].concat(...Array(n).fill(arr));

/* ---------------- pontuação ---------------- */
test('jogo perfeito = 300, com X em tudo', () => {
  const l = rep([10], 12);
  assert.equal(L.total(l), 300);
  assert.deepEqual(L.pontuar(l), [30, 60, 90, 120, 150, 180, 210, 240, 270, 300]);
  assert.deepEqual(L.marcas(l)[0], ['', 'X']);
  assert.deepEqual(L.marcas(l)[9], ['X', 'X', 'X']);
  assert.equal(L.situacao(l).acabou, true);
});

test('tudo 9/- = 90', () => {
  const l = rep([9, 0], 10);
  assert.equal(L.total(l), 90);
  assert.deepEqual(L.marcas(l)[3], ['9', '-']);
  assert.equal(L.situacao(l).acabou, true);
});

test('tudo spare 5/ com 5 extra = 150', () => {
  const l = rep([5, 5], 10).concat([5]);
  assert.equal(L.total(l), 150);
  assert.deepEqual(L.marcas(l)[0], ['5', '/']);
  assert.deepEqual(L.marcas(l)[9], ['5', '/', '5']);
});

test('10ª jogada com strike e spare (X 7 /) e partida de exemplo = 167', () => {
  const l = rep([0, 0], 9).concat([10, 7, 3]);
  assert.equal(L.total(l), 20);
  assert.deepEqual(L.marcas(l)[9], ['X', '7', '/']);
  const s = rep([0, 0], 9).concat([7, 3, 10]);
  assert.equal(L.total(s), 20);
  assert.deepEqual(L.marcas(s)[9], ['7', '/', 'X']);
  const exemplo = [10, 7, 3, 9, 0, 10, 0, 8, 8, 2, 0, 6, 10, 10, 10, 8, 1];
  assert.deepEqual(L.pontuar(exemplo), [20, 39, 48, 66, 74, 84, 90, 120, 148, 167]);
});

test('jogo zerado = 0 e quadros em andamento ficam em branco', () => {
  assert.equal(L.total(rep([0], 20)), 0);
  assert.deepEqual(L.marcas(rep([0], 20))[0], ['-', '-']);
  assert.deepEqual(L.pontuar([10]), Array(10).fill(null));
  assert.deepEqual(L.pontuar([3, 4]).slice(0, 2), [7, null]);
  assert.deepEqual(L.pontuar([10, 3, 4]).slice(0, 3), [17, 24, null]);
});

test('situação: bolas extras da 10ª e pinos de pé', () => {
  assert.deepEqual(L.situacao([7]), { quadro: 0, bola: 1, emPe: 3, acabou: false });
  assert.deepEqual(L.situacao(rep([10], 11)), { quadro: 9, bola: 2, emPe: 10, acabou: false });
  assert.deepEqual(L.situacao(rep([10], 10).concat([4])), { quadro: 9, bola: 2, emPe: 6, acabou: false });
  assert.equal(L.situacao(rep([0], 18).concat([3, 4])).acabou, true);
  assert.equal(L.situacao(rep([0], 18).concat([3, 7])).acabou, false);
});

/* ---------------- física ---------------- */
test('física: bola reta derruba pinos, canaleta no médio, proteção no fácil, strike é possível', () => {
  const reto = L.simular({ x: 0, alvo: 0, forca: 9, nivel: 'medio' });
  assert.ok(reto.derrubados >= 4, 'bola no meio derruba vários pinos: ' + reto.derrubados);
  const canal = L.simular({ x: 0.4, alvo: 0.95, forca: 8, nivel: 'medio' });
  assert.equal(canal.canaleta, true); assert.equal(canal.derrubados, 0);
  const protegido = L.simular({ x: 0.4, alvo: 0.95, forca: 8, nivel: 'facil' });
  assert.equal(protegido.canaleta, false);
  let strike = false;
  for (let a = 0.04; a <= 0.14 && !strike; a += 0.01) if (L.simular({ x: 0, alvo: a, forca: 9, nivel: 'medio' }).derrubados === 10) strike = true;
  assert.ok(strike, 'uma bola no "bolso" faz strike');
  const s2 = L.simular({ x: 0, alvo: 0.2, forca: 8, nivel: 'medio', emPe: [false, false, true, false, false, true, false, false, false, true] });
  assert.ok(s2.derrubados <= 3);
});

/* ---------------- página no Chromium ---------------- */
const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
// interruptores do RootifyONE, músicas e os outros jogos da Jogoteca que estão sendo feitos ao mesmo tempo não importam aqui
const IGNORAR = /solverone-dados|favicon|\.mp3|paciencia\.js|sudoku\.js/i;
const PRINTS = '/tmp/claude-0/-home-user/4b68fbd5-1d7b-52b8-a3cd-c926f2d9daa7/scratchpad';
let browser, base;

test.describe('no navegador', () => {
  test.before(async () => {
    const { chromium } = require('playwright');
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    base = 'http://127.0.0.1:' + server.address().port + '/jogoteca/';
    browser = await chromium.launch();
  });
  test.after(async () => { if (browser) await browser.close(); server.close(); });

  async function abrir(op, nivel) {
    const ctx = await browser.newContext(Object.assign({ locale: 'pt-BR', deviceScaleFactor: 1 }, op));
    const pg = await ctx.newPage(), erros = [];
    pg.on('console', m => { if (m.type() === 'error') { const u = (m.location() && m.location().url) || ''; if (!IGNORAR.test(u + m.text())) erros.push(m.text() + ' @' + u); } });
    pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
    await pg.goto(base + '?teste');
    await pg.waitForFunction(() => window.JogotecaDebug);
    await pg.evaluate(n => window.JogotecaDebug.jogar('boliche', n), nivel || 'facil');
    await pg.waitForSelector('.jt-bol-tela');
    await pg.waitForFunction(() => window.BolicheDebug);
    pg.erros = erros; pg.ctx = ctx;
    return pg;
  }

  test('canvas aparece, arrasto do mouse lança a bola e o placar registra o 1º lance', async () => {
    const pg = await abrir({ viewport: { width: 1280, height: 800 } }, 'facil');
    const cx = await pg.$eval('.jt-bol-tela', e => { const r = e.getBoundingClientRect(); return { w: r.width, h: r.height, x: r.x, y: r.y }; });
    assert.ok(cx.w > 300 && cx.h > 300, 'canvas com tamanho');
    assert.equal(await pg.isVisible('.jt-bol-escolha'), true);
    await pg.click('.jt-bol-cor[data-cor="0"]');
    await pg.click('.jt-bol-rosto[data-rosto="2"]');
    await pg.click('.jt-bol-jogar');
    assert.equal(await pg.isVisible('.jt-bol-escolha'), false);
    assert.equal((await pg.evaluate(() => BolicheDebug.estado())).fase, 'mirar');
    // arrasto: encosta na bola (perto da linha de falta) e empurra para cima
    const x = cx.x + cx.w / 2, y = cx.y + cx.h - cx.h * 0.08;
    await pg.mouse.move(x, y); await pg.mouse.down();
    for (let i = 1; i <= 8; i++) { await pg.mouse.move(x + i * 2, y - i * 40); await pg.waitForTimeout(12); }
    await pg.mouse.up();
    assert.equal((await pg.evaluate(() => BolicheDebug.estado())).fase, 'rolar');
    await pg.waitForFunction(() => BolicheDebug.estado().lances[0].length >= 1, null, { timeout: 15000 });
    const e = await pg.evaluate(() => BolicheDebug.estado());
    assert.ok(e.lances[0][0] >= 0 && e.lances[0][0] <= 10);
    // escolha guardada no aparelho
    const salvo = await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:jogoteca:boliche:escolha')));
    assert.equal(salvo.j[0].cor, 0); assert.equal(salvo.j[0].rosto, 2);
    assert.deepEqual(pg.erros, []);
    await pg.ctx.close();
  });

  test('teclado: Enter liga a mira, o 2º Enter lança; fim da jogada mostra o placar e o ✓ continua', async () => {
    const pg = await abrir({ viewport: { width: 915, height: 412 }, hasTouch: true, isMobile: true }, 'medio');
    await pg.click('.jt-bol-jogar');
    await pg.keyboard.press('ArrowRight');
    await pg.keyboard.press('Enter');
    await pg.waitForTimeout(300);
    await pg.keyboard.press('Enter');
    assert.equal((await pg.evaluate(() => BolicheDebug.estado())).fase, 'rolar');
    await pg.waitForFunction(() => BolicheDebug.estado().lances[0].length >= 1, null, { timeout: 15000 });
    // termina a jogada (se não foi strike, mais uma bola) e espera o placar
    await pg.waitForFunction(() => ['mirar', 'placar'].includes(BolicheDebug.estado().fase), null, { timeout: 8000 });
    if ((await pg.evaluate(() => BolicheDebug.estado())).fase === 'mirar') await pg.evaluate(() => BolicheDebug.lancar(0.05, 9, 0));
    await pg.waitForFunction(() => BolicheDebug.estado().fase === 'placar', null, { timeout: 15000 });
    assert.equal(await pg.isVisible('.jt-bol-ok'), true);
    await pg.click('.jt-bol-ok');
    const e = await pg.evaluate(() => BolicheDebug.estado());
    assert.equal(e.fase, 'mirar'); assert.equal(e.emPe, 10);
    assert.deepEqual(pg.erros, []);
    await pg.ctx.close();
  });

  test('fim da partida chama a janela de vitória com os pontos e guarda o recorde', async () => {
    const pg = await abrir({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, 'facil');
    await pg.click('.jt-bol-jogar');
    await pg.evaluate(() => BolicheDebug.definirLances(0, [9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9, 0]));
    // 10ª jogada: duas bolas (ou strike + extras) até acabar
    for (let i = 0; i < 3; i++) {
      const f = (await pg.evaluate(() => BolicheDebug.estado())).fase;
      if (f === 'fim') break;
      await pg.evaluate(() => BolicheDebug.lancar(0.08, 9, 0));
      await pg.waitForFunction(() => ['mirar', 'fim'].includes(BolicheDebug.estado().fase), null, { timeout: 15000 });
    }
    await pg.waitForSelector('#fim:not([hidden])', { timeout: 5000 });
    const txt = await pg.textContent('#fimTexto');
    assert.match(txt, /Você fez \d+ pontos!/);
    const rec = await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:jogoteca:boliche:recorde-facil')));
    assert.ok(rec >= 81);
    assert.deepEqual(pg.erros, []);
    await pg.ctx.close();
  });

  test('prints no meio da partida (390×844 e 1920×1080)', async () => {
    for (const [w, h, nome] of [[390, 844, 'boliche-390.png'], [1920, 1080, 'boliche-1920.png']]) {
      const pg = await abrir({ viewport: { width: w, height: h } }, 'facil');
      await pg.click('.jt-bol-jogar');
      await pg.evaluate(() => BolicheDebug.definirLances(0, [10, 7, 3, 9, 0, 10]));
      await pg.evaluate(() => BolicheDebug.lancar(0.07, 9.5, 0.1));
      await pg.waitForFunction(() => BolicheDebug.estado().bateu, null, { timeout: 10000 });
      await pg.waitForTimeout(220);
      if (fs.existsSync(PRINTS)) await pg.screenshot({ path: path.join(PRINTS, nome) });
      assert.deepEqual(pg.erros, []);
      await pg.ctx.close();
    }
  });
});
