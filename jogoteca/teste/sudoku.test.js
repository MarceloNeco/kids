// Testes do Sudoku da Jogoteca: node --test jogoteca/teste/sudoku.test.js (rodar da raiz do repositório kids).
// 1) Lógica pura (no Node): solução única, pistas na faixa do nível, solução válida, tempo para gerar.
// 2) Página no Chromium (Playwright): cabe sem rolar em pé e deitado, tocar casa + número escreve, Continuar, sem erro no console.
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');

const sudoku = require('../jogos/sudoku.js');
const L = sudoku.logica;
const NIVEIS = ['facil', 'medio', 'dificil'];

/* ---------------- lógica pura ---------------- */
test('o jogo se registra com id, ajuda e iniciar', () => {
  assert.equal(sudoku.id, 'sudoku');
  assert.equal(typeof sudoku.iniciar, 'function');
  const t = (pt, en, es) => pt + '|' + en + '|' + es;
  assert.match(sudoku.ajuda(t), /<p>/);
});

for (const nivel of NIVEIS) {
  test('nível ' + nivel + ': solução única, pistas na faixa, solução válida e rápido', () => {
    const [min, max] = L.FAIXA[nivel];
    for (let semente = 1; semente <= 25; semente++) {
      const t0 = Date.now();
      const g = L.gerar(nivel, semente);
      const ms = Date.now() - t0;
      assert.ok(ms < 2000, 'gerar levou ' + ms + ' ms');
      const pistas = L.contarPistas(g.pistas);
      assert.ok(pistas >= min && pistas <= max, nivel + ' semente ' + semente + ': ' + pistas + ' pistas');
      assert.equal(L.contarSolucoes(g.pistas, 2), 1, 'solução única');
      assert.ok(L.solucaoValida(g.solucao), 'solução válida');
      for (let i = 0; i < 81; i++) if (g.pistas[i]) assert.equal(g.pistas[i], g.solucao[i], 'pista bate com a solução');
      assert.deepEqual(L.resolver(g.pistas), g.solucao, 'o solucionador acha a mesma solução');
    }
  });
}

test('gerar sem semente também cai na faixa e leva menos de 2 s', () => {
  for (const nivel of NIVEIS) {
    const t0 = Date.now();
    const g = L.gerar(nivel);
    assert.ok(Date.now() - t0 < 2000);
    const p = L.contarPistas(g.pistas);
    assert.ok(p >= L.FAIXA[nivel][0] && p <= L.FAIXA[nivel][1]);
  }
});

test('a mesma semente dá o mesmo sudoku', () => {
  assert.deepEqual(L.gerar('medio', 77).pistas, L.gerar('medio', 77).pistas);
  assert.notDeepEqual(L.gerar('medio', 77).pistas, L.gerar('medio', 78).pistas);
});

test('valido, contarSolucoes e solucaoValida', () => {
  const g = L.gerar('facil', 5);
  const vazia = g.pistas.indexOf(0);
  assert.equal(L.valido(g.pistas, vazia, g.solucao[vazia]), true);
  // um número que já está na mesma linha não vale
  const linha = Math.floor(vazia / 9);
  let naLinha = 0;
  for (let c = 0; c < 9; c++) if (g.pistas[linha * 9 + c]) { naLinha = g.pistas[linha * 9 + c]; break; }
  assert.equal(L.valido(g.pistas, vazia, naLinha), false);
  const zeros = new Array(81).fill(0);
  assert.equal(L.contarSolucoes(zeros, 2), 2, 'grade vazia tem muitas soluções');
  const ruim = g.solucao.slice(); ruim[0] = ruim[1];
  assert.equal(L.solucaoValida(ruim), false);
  assert.equal(L.contarSolucoes(ruim, 2), 0, 'grade com conflito não tem solução');
});

/* ---------------- página no Chromium ---------------- */
const { chromium } = require('playwright');
const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
// interruptores do RootifyONE, ícone e músicas não importam aqui; os outros jogos da Jogoteca são feitos em paralelo
const IGNORAR = /solverone-dados|favicon|\.mp3|jogos\/(paciencia|boliche)\.js/i;
const FONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
const DEITADO = { viewport: { width: 915, height: 412 }, hasTouch: true, isMobile: true };
let browser, base;

test.before(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/jogoteca/';
  browser = await chromium.launch();
});
test.after(async () => { if (browser) await browser.close(); server.close(); });

async function abrir(ctxOp, ctxExistente) {
  const ctx = ctxExistente || await browser.newContext(Object.assign({ locale: 'pt-BR' }, ctxOp));
  const pg = await ctx.newPage(), erros = [];
  pg.on('console', m => { if (m.type() === 'error') { const u = (m.location() && m.location().url) || ''; if (!IGNORAR.test(u + m.text())) erros.push(m.text() + ' @' + u); } });
  pg.on('pageerror', e => { if (!IGNORAR.test(String(e.stack || ''))) erros.push('pageerror: ' + e.message); });
  await pg.goto(base + '?teste');
  await pg.waitForFunction(() => window.JogotecaDebug);
  pg.erros = erros; pg.ctx = ctx;
  return pg;
}
async function jogar(pg, nivel) {
  await pg.evaluate(n => JogotecaDebug.jogar('sudoku', n), nivel || 'facil');
  await pg.waitForFunction(() => document.querySelectorAll('#palco .jt-sud-cel').length === 81);
}
const est = pg => pg.evaluate(() => JogotecaDebug.rodando().estado());
const caixa = (pg, sel) => pg.$eval(sel, e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
function dentro(a, vw, vh) { return a.x >= -0.5 && a.y >= -0.5 && a.x + a.w <= vw + 0.5 && a.y + a.h <= vh + 0.5 && a.w > 0 && a.h > 0; }

async function confereCabe(pg, vw, vh) {
  const rola = await pg.evaluate(() => ({
    doc: document.documentElement.scrollHeight > innerHeight + 1 || document.documentElement.scrollWidth > innerWidth + 1,
    palco: (() => { const p = document.getElementById('palco'); return p.scrollHeight > p.clientHeight + 1 || p.scrollWidth > p.clientWidth + 1; })()
  }));
  assert.equal(rola.doc, false, 'a página não rola');
  assert.equal(rola.palco, false, 'o palco não rola');
  const palco = await caixa(pg, '#palco');
  for (const sel of ['.jt-sud-tab', '.jt-sud-teclas', '.jt-sud-ferr', '.jt-sud-info']) {
    const c = await caixa(pg, sel);
    assert.ok(dentro(c, vw, vh), sel + ' cabe na tela: ' + JSON.stringify(c));
    assert.ok(c.y >= palco.y - 0.5, sel + ' fica embaixo da barra');
  }
  const tab = await caixa(pg, '.jt-sud-tab');
  for (const sel of ['.jt-sud-teclas', '.jt-sud-ferr']) {
    const c = await caixa(pg, sel);
    const cruza = tab.x < c.x + c.w && c.x < tab.x + tab.w && tab.y < c.y + c.h && c.y < tab.y + tab.h;
    assert.equal(cruza, false, sel + ' não fica por cima da grade');
  }
  return tab;
}
// toca a primeira casa vazia e um número ainda disponível; devolve { i, n }
async function escreverNumaVazia(pg) {
  const e = await est(pg);
  const i = e.val.indexOf(0);
  await pg.tap('.jt-sud-cel[data-i="' + i + '"]');
  const n = await pg.evaluate(() => { const b = document.querySelector('.jt-sud-num:not(.jt-sud-feito)'); return +b.getAttribute('data-n'); });
  await pg.tap('.jt-sud-num[data-n="' + n + '"]');
  return { i, n };
}

test('celular em pé (390×844): grade em cima, teclado embaixo, cabe sem rolar; tocar casa + número escreve', async () => {
  const pg = await abrir(FONE);
  await jogar(pg, 'facil');
  const tab = await confereCabe(pg, 390, 844);
  const teclas = await caixa(pg, '.jt-sud-teclas');
  assert.ok(teclas.y >= tab.y + tab.h - 0.5, 'teclado embaixo da grade');
  assert.ok(tab.w >= 340, 'a grade ocupa a largura: ' + tab.w);
  const { i, n } = await escreverNumaVazia(pg);
  assert.equal(await pg.textContent('.jt-sud-cel[data-i="' + i + '"] .jt-sud-v'), String(n));
  assert.equal((await est(pg)).val[i], n);
  // no fácil, número errado fica vermelho
  const e = await est(pg);
  const vermelho = await pg.$eval('.jt-sud-cel[data-i="' + i + '"]', c => c.classList.contains('jt-sud-erro'));
  assert.equal(vermelho, e.sol[i] !== n);
  // ↶ Desfazer tira o número
  await pg.tap('.jt-sud-fer[data-f="desfazer"]');
  assert.equal((await est(pg)).val[i], 0);
  // ✏️ Rascunho escreve anotação pequena
  await pg.tap('.jt-sud-fer[data-f="rascunho"]');
  await pg.tap('.jt-sud-num[data-n="' + n + '"]');
  assert.equal(await pg.textContent('.jt-sud-cel[data-i="' + i + '"] .jt-sud-notas'), String(n));
  // 💡 Dica põe o número certo e conta
  await pg.tap('.jt-sud-fer[data-f="dica"]');
  const d = await est(pg);
  assert.equal(d.dicas, 1);
  assert.equal(d.val[d.sel], d.sol[d.sel]);
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});

test('deitado (915×412): grade à esquerda, teclado à direita, cabe sem rolar; teclado físico escreve', async () => {
  const pg = await abrir(DEITADO);
  await jogar(pg, 'medio');
  const tab = await confereCabe(pg, 915, 412);
  const teclas = await caixa(pg, '.jt-sud-teclas');
  assert.ok(teclas.x >= tab.x + tab.w - 0.5, 'teclado à direita da grade');
  const { i, n } = await escreverNumaVazia(pg);
  assert.equal(await pg.textContent('.jt-sud-cel[data-i="' + i + '"] .jt-sud-v'), String(n));
  // setas andam, número escreve, Backspace apaga
  const e = await est(pg);
  const alvo = e.val.indexOf(0);
  await pg.evaluate(k => { const c = document.querySelector('.jt-sud-cel[data-i="' + k + '"]'); c.click(); }, alvo);
  const vizinha = Math.floor(alvo / 9) * 9 + ((alvo % 9) + 1) % 9;
  await pg.keyboard.press('ArrowRight');
  assert.equal((await est(pg)).sel, vizinha);
  await pg.keyboard.press('ArrowLeft');
  await pg.keyboard.press('7');
  assert.equal((await est(pg)).val[alvo], 7);
  await pg.keyboard.press('Backspace');
  assert.equal((await est(pg)).val[alvo], 0);
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});

test('a partida fica guardada: ao abrir de novo no mesmo nível, ▶ Continuar volta onde parou; 🔄 começa outra', async () => {
  const pg = await abrir(FONE);
  await jogar(pg, 'facil');
  const { i, n } = await escreverNumaVazia(pg);
  const antes = await est(pg);
  const ctx = pg.ctx;
  await pg.close();
  const pg2 = await abrir(null, ctx);
  await jogar(pg2, 'facil');
  assert.equal(await pg2.isVisible('.jt-sud-veu [data-acao="continuar"]'), true);
  await pg2.tap('.jt-sud-veu [data-acao="continuar"]');
  const depois = await est(pg2);
  assert.deepEqual(depois.pistas, antes.pistas);
  assert.equal(depois.val[i], n);
  assert.equal(await pg2.isVisible('.jt-sud-veu'), false);
  // 🔄 Recomeçar: partida nova, sem perguntar
  await pg2.tap('#btRecomecar');
  await pg2.waitForFunction(() => document.querySelectorAll('#palco .jt-sud-cel').length === 81);
  assert.equal(await pg2.isVisible('.jt-sud-veu'), false);
  assert.notDeepEqual((await est(pg2)).pistas, antes.pistas);
  assert.deepEqual(pg2.erros, []);
  await ctx.close();
});

test('vitória: completar a grade chama a janela 🎉 com o tempo', async () => {
  const pg = await abrir(FONE);
  await jogar(pg, 'facil');
  const e = await est(pg);
  await pg.evaluate(sol => {
    const vazias = [];
    for (let i = 0; i < 81; i++) if (!document.querySelector('.jt-sud-cel[data-i="' + i + '"] .jt-sud-v').textContent) vazias.push(i);
    vazias.forEach(i => {
      document.querySelector('.jt-sud-cel[data-i="' + i + '"]').click();
      document.querySelector('.jt-sud-num[data-n="' + sol[i] + '"]').click();
    });
  }, e.sol);
  await pg.waitForFunction(() => !document.getElementById('fim').hidden, null, { timeout: 5000 });
  assert.match(await pg.textContent('#fimTexto'), /Sudoku completo em \d\d:\d\d/);
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});
