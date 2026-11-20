// Testes do Jogo da Velha de guerra: node --test jogoteca/teste/velha.test.js (rodar da raiz do repositório kids).
// 1) Lógica (Node): quem vence, o computador difícil nunca perde, o médio bloqueia e ganha quando pode.
// 2) Página (Chromium): escolher contra quem, jogar, a batalha acaba e o placar sobe; cabe na tela; sem erro.
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');
const velha = require('../jogos/velha.js');
const L = velha.logica;

test('o jogo se registra com id, ajuda e iniciar', () => {
  assert.equal(velha.id, 'velha'); assert.equal(typeof velha.iniciar, 'function');
  assert.match(velha.ajuda((pt, en, es) => pt + en + es), /<p>/);
});

test('vencedor: linhas, colunas, diagonais e empate', () => {
  assert.deepEqual(L.vencedor(['x', 'x', 'x', '', 'o', 'o', '', '', '']), { quem: 'x', linha: [0, 1, 2] });
  assert.equal(L.vencedor(['o', 'x', '', 'o', 'x', '', 'o', '', '']).quem, 'o');
  assert.equal(L.vencedor(['x', 'o', '', 'o', 'x', '', '', '', 'x']).quem, 'x');
  assert.equal(L.vencedor(['x', 'o', 'x', 'x', 'o', 'o', 'o', 'x', 'x']).quem, 'empate');
  assert.equal(L.vencedor(['x', '', '', '', '', '', '', '', '']), null);
});

test('difícil: o computador nunca perde, jogue a pessoa como jogar (todas as partidas possíveis)', () => {
  let partidas = 0;
  function explora(t, vez, pcComeca) {
    const v = L.vencedor(t);
    if (v) { partidas++; assert.notEqual(v.quem, 'x', 'a pessoa ganhou do difícil: ' + t.join(',')); return; }
    if (vez === 'o') { const i = L.jogadaPC(t, 'o', 'dificil', () => 0); t[i] = 'o'; explora(t, 'x'); t[i] = ''; return; }
    for (let i = 0; i < 9; i++) if (!t[i]) { t[i] = 'x'; explora(t, 'o'); t[i] = ''; }
  }
  explora(['', '', '', '', '', '', '', '', ''], 'x');
  explora(['', '', '', '', '', '', '', '', ''], 'o');
  assert.ok(partidas > 100, partidas + ' partidas');
});

test('médio: ganha quando pode e bloqueia; fácil às vezes se distrai', () => {
  assert.equal(L.jogadaPC(['o', 'o', '', 'x', 'x', '', '', '', ''], 'o', 'medio', () => 0.9), 2, 'fecha a própria linha');
  assert.equal(L.jogadaPC(['x', 'x', '', '', 'o', '', '', '', ''], 'o', 'medio', () => 0.9), 2, 'bloqueia a do outro');
  const escolhas = new Set();
  let s = 1; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let k = 0; k < 40; k++) escolhas.add(L.jogadaPC(['x', 'x', '', '', 'o', '', '', '', ''], 'o', 'facil', r));
  assert.ok(escolhas.size > 1, 'o fácil nem sempre bloqueia');
});

/* ---------------- página no Chromium ---------------- */
const { chromium } = require('playwright');
const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const IGNORAR = /solverone-dados|favicon|\.mp3/i;
let browser, base;
test.before(async () => { await new Promise(r => server.listen(0, '127.0.0.1', r)); base = 'http://127.0.0.1:' + server.address().port + '/jogoteca/'; browser = await chromium.launch(); });
test.after(async () => { if (browser) await browser.close(); server.close(); });

for (const [nome, vp] of [['em pé', { width: 390, height: 844 }], ['deitado', { width: 915, height: 412 }]]) {
  test('página ' + nome + ': contra o computador, a batalha acaba, o placar sobe e tudo cabe na tela', async () => {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: true, isMobile: true, locale: 'pt-BR' });
    const pg = await ctx.newPage(), erros = [];
    pg.on('console', m => { if (m.type() === 'error' && !IGNORAR.test(m.text() + ((m.location() && m.location().url) || ''))) erros.push(m.text()); });
    pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
    try {
      await pg.goto(base + '?teste'); await pg.waitForFunction(() => window.JogotecaDebug);
      assert.ok(await pg.$('.capa[data-jogo="velha"]'), 'capa na vitrine');
      await pg.evaluate(() => JogotecaDebug.jogar('velha', 'dificil'));
      await pg.waitForSelector('.jt-vel-veu button');
      await pg.click('.jt-vel-veu button');   // contra o computador
      const est = () => pg.evaluate(() => JogotecaDebug.rodando().estado());
      assert.equal((await est()).modo, 'pc');
      const tab = await pg.$eval('.jt-vel-tab', e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
      assert.ok(tab.x >= 0 && tab.y >= 0 && tab.x + tab.w <= vp.width + 0.5 && tab.y + tab.h <= vp.height + 0.5 && tab.w >= 150, 'o tabuleiro cabe: ' + JSON.stringify(tab));
      for (let g = 0; g < 20; g++) {
        const e = await est(); if (e.fim) break;
        if (e.vez === 'x' && !e.travado) { const i = e.t.indexOf(''); await pg.click('.jt-vel-cel[data-i="' + i + '"]'); }
        await pg.waitForTimeout(250);
      }
      await pg.waitForFunction(() => JogotecaDebug.rodando().estado().fim, null, { timeout: 10000 });
      const e = await est();
      assert.notEqual(e.fim, 'x', 'ninguém ganha do difícil');
      await pg.waitForSelector('.jt-vel-bt[data-acao="proxima"]:not([hidden])', { timeout: 10000 });
      if (e.fim === 'o') assert.equal((await est()).pts.o, 1, 'o placar subiu');
      await pg.click('.jt-vel-bt[data-acao="proxima"]');
      const e2 = await est();
      assert.equal(e2.t.join(''), e2.vez === 'o' ? e2.t.join('') : '', 'campo limpo para a próxima batalha');
      assert.equal(e2.fim, null);
      assert.deepEqual(erros, []);
    } finally { await ctx.close(); }
  });
}

test('dois jogadores: vitória na guerra (3 batalhas) abre a janela de vitória', async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, locale: 'pt-BR' });
  const pg = await ctx.newPage();
  try {
    await pg.goto(base + '?teste'); await pg.waitForFunction(() => window.JogotecaDebug);
    await pg.evaluate(() => JogotecaDebug.jogar('velha', 'facil'));
    await pg.click('.jt-vel-veu button:nth-of-type(2)');   // dois jogadores
    assert.equal((await pg.evaluate(() => JogotecaDebug.rodando().estado())).modo, 'dois');
    // quem começa alterna a cada batalha; quem começa faz a linha de cima (0, 1, 2) e o outro joga embaixo (6, 7)
    for (let b = 0; b < 5; b++) {
      for (const i of [0, 6, 1, 7, 2]) { await pg.click('.jt-vel-cel[data-i="' + i + '"]'); await pg.waitForTimeout(60); }
      await pg.waitForFunction((n) => { const e = JogotecaDebug.rodando().estado(); return e.pts.x + e.pts.o === n; }, b + 1, { timeout: 10000 });
      const e = await pg.evaluate(() => JogotecaDebug.rodando().estado());
      if (e.guerra) break;
      await pg.waitForSelector('.jt-vel-bt[data-acao="proxima"]:not([hidden])', { timeout: 10000 }); await pg.click('.jt-vel-bt[data-acao="proxima"]');
    }
    const e = await pg.evaluate(() => JogotecaDebug.rodando().estado());
    assert.deepEqual(e.pts, { x: 3, o: 2 }, 'o Vermelho começou 3 vezes e venceu as 3');
    assert.equal(e.guerra, 'x');
    await pg.waitForSelector('#fim:not([hidden])', { timeout: 8000 });
    assert.match(await pg.textContent('#fimTexto'), /Vermelho venceu a guerra por 3 a 2/);
  } finally { await ctx.close(); }
});
