// Testes do Xadrez de guerra: node --test jogoteca/teste/xadrez.test.js (rodar da raiz do repositório kids).
// 1) Regras (Node): contagem de lances "perft" nas posições de referência (pega qualquer erro de regra: roque, en passant,
//    promoção, xeque), xeque-mate, afogado, empates; o computador joga lance válido, rápido, e não deixa a dama de graça.
// 2) Página (Chromium): tocar na peça mostra as casas, mover, a captura vira batalha (prisioneiro), xeque-mate abre a vitória.
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');
const xadrez = require('../jogos/xadrez.js');
const X = xadrez.logica;
const lance = (s, uci) => { const m = X.legais(s).find(m => X.nomeCasa(m.de) + X.nomeCasa(m.para) === uci); assert.ok(m, 'lance ilegal: ' + uci); return X.aplicar(s, m); };

test('o jogo se registra com id, ajuda e iniciar', () => {
  assert.equal(xadrez.id, 'xadrez'); assert.equal(typeof xadrez.iniciar, 'function');
  assert.match(xadrez.ajuda((pt, en, es) => pt + en + es), /<p>/);
});

test('perft: o número de lances bate com as posições de referência do xadrez', () => {
  const casos = [
    ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', [20, 400, 8902, 197281]],
    ['r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', [48, 2039, 97862]],   // "kiwipete": roque, en passant, promoção
    ['8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1', [14, 191, 2812, 43238]],
    ['r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1', [6, 264, 9467]],
    ['rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8', [44, 1486, 62379]]
  ];
  for (const [fen, nums] of casos) nums.forEach((n, d) => assert.equal(X.perft(X.deFEN(fen), d + 1), n, fen + ' profundidade ' + (d + 1)));
});

test('xeque-mate, afogado e empates', () => {
  let s = X.inicial();
  for (const u of ['f2f3', 'e7e5', 'g2g4', 'd8h4']) s = lance(s, u);   // mate do louco
  assert.equal(X.situacao(s), 'mate');
  assert.equal(X.situacao(X.deFEN('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1')), 'afogado');
  assert.equal(X.situacao(X.deFEN('8/8/4k3/8/8/3K4/8/8 w - - 0 1')), 'material');
  assert.equal(X.situacao(X.deFEN('8/8/4k3/8/8/3KN3/8/8 w - - 0 1')), 'material');
  assert.equal(X.situacao(X.deFEN('8/8/4k3/8/8/3KR3/8/8 w - - 100 80')), '50');
  let r = X.deFEN('4k3/8/8/8/8/8/8/R3K3 w - - 0 1');
  for (let i = 0; i < 2; i++) for (const u of ['a1a2', 'e8d8', 'a2a1', 'd8e8']) r = lance(r, u);
  assert.equal(X.situacao(r), 'repeticao');
  assert.equal(X.situacao(X.deFEN('4k3/4Q3/4K3/8/8/8/8/8 b - - 0 1')), 'mate');
  assert.equal(X.situacao(lance(X.inicial(), 'e2e4')), '');
});

test('roque, en passant e promoção', () => {
  let s = X.deFEN('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  s = lance(s, 'e1g1'); assert.equal(s.b[X.casa('f1')], 'R'); assert.equal(s.b[X.casa('g1')], 'K'); assert.equal(s.roque, 'kq');
  s = lance(s, 'e8c8'); assert.equal(s.b[X.casa('d8')], 'r'); assert.equal(s.b[X.casa('c8')], 'k'); assert.equal(s.roque, '');
  // não pode rocar passando por casa atacada
  const t = X.deFEN('4k3/8/8/8/8/8/5r2/4K2R w K - 0 1');
  assert.ok(!X.legais(t).some(m => m.roque), 'f1 atacada: sem roque');
  let e = X.deFEN('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1');
  e = lance(e, 'e5d6'); assert.equal(e.b[X.casa('d5')], '', 'en passant tira o peão');
  const p = lance(X.deFEN('4k3/1P6/8/8/8/8/8/4K3 w - - 0 1'), 'b7b8'); assert.equal(p.b[X.casa('b8')], 'Q', 'o peão vira dama');
});

test('o computador: lance válido em todos os níveis, rápido, e no médio e difícil pega a dama de graça e dá o mate em 1', () => {
  for (const n of ['facil', 'medio', 'dificil']) {
    const s = X.deFEN('r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4'), t0 = Date.now(), m = X.jogadaPC(s, n);
    assert.ok(X.legais(s).some(x => x.de === m.de && x.para === m.para), n + ': lance válido');
    assert.ok(Date.now() - t0 < 3000, n + ' demorou ' + (Date.now() - t0) + ' ms');
  }
  for (const n of ['medio', 'dificil']) {
    const dama = X.jogadaPC(X.deFEN('4k3/8/8/3q4/8/8/3R4/4K3 w - - 0 1'), n);
    assert.equal(X.nomeCasa(dama.de) + X.nomeCasa(dama.para), 'd2d5', n + ': pega a dama');
    const mate = X.jogadaPC(X.deFEN('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1'), n);
    assert.equal(X.nomeCasa(mate.de) + X.nomeCasa(mate.para), 'a1a8', n + ': mate na última linha');
  }
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
  test('página ' + nome + ': tocar mostra as casas, mover, o computador responde, captura vira prisioneiro, xeque-mate abre a vitória', async () => {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: true, isMobile: true, locale: 'pt-BR' });
    const pg = await ctx.newPage(), erros = [];
    pg.on('console', m => { if (m.type() === 'error' && !IGNORAR.test(m.text() + ((m.location() && m.location().url) || ''))) erros.push(m.text()); });
    pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
    const est = () => pg.evaluate(() => JogotecaDebug.rodando().estado());
    try {
      await pg.goto(base + '?teste'); await pg.waitForFunction(() => window.JogotecaDebug);
      assert.ok(await pg.$('.capa[data-jogo="xadrez"]'), 'capa na vitrine');
      await pg.evaluate(() => JogotecaDebug.jogar('xadrez', 'medio'));
      await pg.waitForSelector('.jt-xad-veu button'); await pg.click('.jt-xad-veu button');
      assert.equal(await pg.$$eval('.jt-xad-peca', l => l.length), 32);
      const tab = await pg.$eval('.jt-xad-moldura', e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
      assert.ok(tab.x >= 0 && tab.y >= 0 && tab.x + tab.w <= vp.width + 0.5 && tab.y + tab.h <= vp.height + 0.5 && tab.w >= 180, 'o tabuleiro cabe: ' + JSON.stringify(tab));
      // as peças ficam em cima das casas certas
      const casaE2 = await pg.$eval('.jt-xad-cas[data-i="52"]', e => { const r = e.getBoundingClientRect(); return [r.x, r.y]; });
      const pecas = await pg.$$eval('.jt-xad-peca', l => l.map(e => { const r = e.getBoundingClientRect(); return [r.x, r.y]; }));
      assert.ok(pecas.some(p => Math.abs(p[0] - casaE2[0]) < 2 && Math.abs(p[1] - casaE2[1]) < 2), 'tem peça em cima do e2');
      await pg.click('.jt-xad-cas[data-i="52"]');   // e2
      assert.deepEqual((await est()).alvos.sort(), [36, 44]);
      await pg.click('.jt-xad-cas[data-i="36"]');   // e4
      await pg.waitForFunction(() => JogotecaDebug.rodando().estado().vez === 'w' && !JogotecaDebug.rodando().estado().travado, null, { timeout: 15000 });
      assert.equal((await est()).b[36], 'P');
      // uma captura: a dama azul pega a dama vermelha
      await pg.evaluate(() => JogotecaDebug.rodando().posicao('4k3/8/8/3q4/8/8/3Q4/4K3 w - - 0 1'));
      await pg.click('.jt-xad-cas[data-i="51"]'); await pg.click('.jt-xad-cas[data-i="27"]');
      await pg.waitForFunction(() => document.querySelectorAll('.jt-xad-presos[data-de="w"] svg').length === 1, null, { timeout: 5000 });
      // xeque-mate abre a janela de vitória
      await pg.evaluate(() => JogotecaDebug.rodando().posicao('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1'));
      await pg.click('.jt-xad-cas[data-i="56"]'); await pg.click('.jt-xad-cas[data-i="0"]');
      await pg.waitForFunction(() => JogotecaDebug.rodando().estado().fim, null, { timeout: 5000 });
      assert.deepEqual((await est()).fim, { vencedor: 'w', como: 'mate' });
      await pg.waitForSelector('#fim:not([hidden])', { timeout: 8000 });
      assert.match(await pg.textContent('#fimTexto'), /Xeque-mate/);
      assert.deepEqual(erros, []);
    } finally { await ctx.close(); }
  });
}
