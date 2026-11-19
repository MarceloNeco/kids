// Testes da Paciência (Klondike): node --test jogoteca/teste/paciencia.test.js (rodar da raiz do repositório kids).
// 1) a lógica pura no Node (regras de empilhar, fundação, reciclar o monte, desfazer, vitória e "Completar");
// 2) a página no Chromium (Playwright), em pé (390×844) e deitado (915×412): as 7 colunas cabem, um toque move uma carta,
//    arrastar com o mouse, teclado/controle da TV e nenhum erro no console.
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..', '..');

/* ================= lógica pura ================= */
function carregar() {
  global.window = {};
  delete require.cache[require.resolve('../jogos/paciencia.js')];
  require('../jogos/paciencia.js');
  const m = global.window.JogotecaJogos.filter(j => j.id === 'paciencia')[0];
  delete global.window;
  return m;
}
const MOD = carregar();
const L = MOD.logica;
const c = (n, s, up = true) => L.carta(n, s, up);   // naipes: 0 ♠, 1 ♥, 2 ♦, 3 ♣
function vazio(vira) { return L.estadoVazio(vira || 1); }

test('registro: id, ajuda nos 3 idiomas e iniciar', () => {
  assert.equal(MOD.id, 'paciencia');
  assert.equal(typeof MOD.iniciar, 'function');
  const t = (pt, en, es) => pt + '|' + en + '|' + es;
  const html = MOD.ajuda(t);
  assert.match(html, /Ás/); assert.match(html, /Ace/); assert.match(html, /As, 2, 3/);
});

test('novo jogo: colunas com 1 a 7 cartas, só a última virada, 24 no monte, 52 cartas diferentes', () => {
  const e = L.novoJogo(7, 1);
  e.col.forEach((col, i) => {
    assert.equal(col.length, i + 1);
    col.forEach((x, k) => assert.equal(x.up, k === i));
  });
  assert.equal(e.monte.length, 24);
  assert.ok(e.monte.every(x => !x.up));
  assert.equal(e.desc.length, 0);
  const ids = new Set();
  e.monte.concat(...e.col).forEach(x => ids.add(x.id));
  assert.equal(ids.size, 52);
});

test('embaralhar (Fisher-Yates): mesma semente = mesmo jogo; outra semente = outro jogo', () => {
  const a = JSON.stringify(L.novoJogo(123, 3).col), b = JSON.stringify(L.novoJogo(123, 3).col), d = JSON.stringify(L.novoJogo(124, 3).col);
  assert.equal(a, b);
  assert.notEqual(a, d);
  const lista = [1, 2, 3, 4, 5, 6, 7, 8];
  L.embaralhar(lista, L.sorteador(5));
  assert.deepEqual(lista.slice().sort((x, y) => x - y), [1, 2, 3, 4, 5, 6, 7, 8]);
  // sem semente também embaralha (Math.random) e não perde carta
  assert.equal(L.novoJogo(null, 1).monte.length, 24);
});

test('coluna: ordem decrescente alternando cores; coluna vazia só aceita Rei', () => {
  assert.equal(L.podeNaColuna([c(6, 1)], [c(7, 0)]), true);    // 6♥ no 7♠
  assert.equal(L.podeNaColuna([c(6, 3)], [c(7, 2)]), true);    // 6♣ no 7♦
  assert.equal(L.podeNaColuna([c(6, 1)], [c(7, 2)]), false);   // vermelho no vermelho
  assert.equal(L.podeNaColuna([c(5, 1)], [c(7, 0)]), false);   // pula número
  assert.equal(L.podeNaColuna([c(8, 1)], [c(7, 0)]), false);   // maior
  assert.equal(L.podeNaColuna([c(6, 1)], [c(7, 0, false)]), false);   // carta virada para baixo
  assert.equal(L.podeNaColuna([c(13, 1)], []), true);
  assert.equal(L.podeNaColuna([c(12, 1)], []), false);
});

test('fundação: Ás no lugar vazio, depois o mesmo naipe +1; pilha não entra', () => {
  assert.equal(L.podeNaFundacao([c(1, 2)], []), true);
  assert.equal(L.podeNaFundacao([c(2, 2)], []), false);
  assert.equal(L.podeNaFundacao([c(2, 2)], [c(1, 2)]), true);
  assert.equal(L.podeNaFundacao([c(2, 1)], [c(1, 2)]), false);   // outro naipe
  assert.equal(L.podeNaFundacao([c(3, 2)], [c(1, 2)]), false);   // pula número
  assert.equal(L.podeNaFundacao([c(2, 2), c(1, 0)], [c(1, 2)]), false);
});

test('mover uma pilha entre colunas leva as de cima junto e vira a carta que ficou por baixo', () => {
  const e = vazio();
  e.col[0] = [c(3, 3, false), c(9, 0), c(8, 1), c(7, 3)];
  e.col[1] = [c(10, 2)];
  assert.equal(L.podeMover(e, { p: 'col', i: 0, k: 2 }, { p: 'col', i: 1 }), false);   // 8♥ não vai no 10♦
  assert.equal(L.mover(e, { p: 'col', i: 0, k: 1 }, { p: 'col', i: 1 }), true);         // 9♠ 8♥ 7♣ no 10♦
  assert.deepEqual(e.col[1].map(x => x.n), [10, 9, 8, 7]);
  assert.equal(e.col[0].length, 1);
  assert.equal(e.col[0][0].up, true, 'a carta de baixo vira sozinha');
  assert.equal(e.jogadas, 1);
  // carta virada para baixo não sai
  e.col[2] = [c(5, 0, false), c(4, 1)];
  assert.equal(L.cartasDe(e, { p: 'col', i: 2, k: 0 }), null);
});

test('comprar: fácil vira 1, médio/difícil vira 3; monte vazio devolve o descarte na mesma ordem', () => {
  const e1 = L.novoJogo(9, 1), topo1 = e1.monte[e1.monte.length - 1].id;
  assert.equal(L.comprar(e1), true);
  assert.equal(e1.desc.length, 1); assert.equal(e1.desc[0].id, topo1); assert.equal(e1.desc[0].up, true);

  const e = L.novoJogo(9, 3), ordem = e.monte.map(x => x.id);
  for (let i = 0; i < 8; i++) L.comprar(e);   // 24 cartas, de 3 em 3
  assert.equal(e.monte.length, 0); assert.equal(e.desc.length, 24);
  assert.equal(e.desc[e.desc.length - 1].id, ordem[0], 'a última do descarte é a do fundo do monte');
  assert.equal(L.comprar(e), true, 'reciclar');
  assert.equal(e.desc.length, 0);
  assert.deepEqual(e.monte.map(x => x.id), ordem, 'o monte volta igualzinho');
  assert.ok(e.monte.every(x => !x.up));
  // nada no monte nem no descarte: não dá para comprar
  const v = vazio(3);
  assert.equal(L.comprar(v), false);
});

test('desfazer volta passo a passo, inclusive a carta que tinha virado', () => {
  const e = vazio();
  e.col[0] = [c(4, 3, false), c(1, 1)];
  e.monte = [c(5, 0, false)];
  const antes = JSON.stringify(e.col);
  assert.equal(L.mover(e, { p: 'col', i: 0 }, { p: 'fund', i: 0 }), true);
  assert.equal(e.col[0][0].up, true);
  assert.equal(L.comprar(e), true);
  assert.equal(e.jogadas, 2);
  assert.equal(L.desfazer(e), true);
  assert.equal(e.desc.length, 0); assert.equal(e.monte.length, 1);
  assert.equal(L.desfazer(e), true);
  assert.equal(JSON.stringify(e.col), antes);
  assert.equal(e.col[0][0].up, false, 'a carta volta a ficar virada para baixo');
  assert.equal(e.fund[0].length, 0);
  assert.equal(e.jogadas, 0);
  assert.equal(L.desfazer(e), false, 'sem histórico não faz nada');
});

test('toque simples (melhor destino): fundação primeiro, depois coluna; Rei sozinho no fundo não vai para coluna vazia', () => {
  const e = vazio();
  e.fund[0] = [c(1, 1)];
  e.col[0] = [c(2, 1)];          // 2♥: pode ir na fundação ou no 3♠
  e.col[1] = [c(3, 0)];
  assert.deepEqual(L.melhorDestino(e, { p: 'col', i: 0 }), { p: 'fund', i: 0 });
  e.col[2] = [c(9, 0, false), c(5, 2), c(4, 0)];   // pilha 5♦ 4♠ procura um 6 preto
  e.col[3] = [c(6, 3)];
  assert.deepEqual(L.melhorDestino(e, { p: 'col', i: 2, k: 1 }), { p: 'col', i: 3 });
  e.col[4] = [c(13, 0)];
  assert.equal(L.melhorDestino(e, { p: 'col', i: 4 }), null);
  e.col[4] = [c(9, 2, false), c(13, 0)];
  assert.equal(L.melhorDestino(e, { p: 'col', i: 4, k: 1 }).p, 'col');   // agora libera a carta de baixo
  assert.equal(L.melhorDestino(e, { p: 'desc' }), null);
});

test('vitória: a última carta na fundação vence; "Completar" leva tudo sozinho', () => {
  const e = vazio();
  for (let s = 0; s < 4; s++) for (let n = 1; n <= 13; n++) if (!(s === 3 && n === 13)) e.fund[s].push(c(n, s));
  e.col[2] = [c(13, 3)];
  assert.equal(L.venceu(e), false);
  assert.equal(L.mover(e, { p: 'col', i: 2 }, { p: 'fund', i: 3 }), true);
  assert.equal(L.venceu(e), true);

  // todas viradas, um pouco no descarte e no monte: a lista de ações fecha o jogo
  const f = vazio(3);
  for (let s = 0; s < 4; s++) for (let n = 1; n <= 7; n++) f.fund[s].push(c(n, s));
  f.col[0] = [c(13, 0), c(12, 1), c(11, 0), c(10, 1), c(9, 0), c(8, 1)];
  f.col[1] = [c(13, 1), c(12, 0), c(11, 1), c(10, 0), c(9, 1), c(8, 0)];
  f.col[2] = [c(13, 2), c(12, 3), c(11, 2), c(10, 3)];
  f.col[3] = [c(13, 3), c(12, 2), c(11, 3)];
  f.monte = [c(9, 3, false), c(8, 2, false)];
  f.desc = [c(10, 2), c(9, 2), c(8, 3)];
  assert.equal(L.tudoVirado(f), true);
  const acoes = L.autoCompletar(f);
  assert.ok(acoes && acoes.length >= 24);
  assert.equal(L.venceu(f), false, 'a simulação não mexe no jogo de verdade');
  acoes.forEach(a => assert.ok(a.tipo === 'comprar' ? L.comprar(f) : L.mover(f, a.o, a.d)));
  assert.equal(L.venceu(f), true);

  // com carta virada para baixo, não tem "Completar"
  const g = L.novoJogo(3, 1);
  assert.equal(L.tudoVirado(g), false);
  assert.equal(L.autoCompletar(g), null);
});

/* ================= página no Chromium ================= */
const { chromium } = require('playwright');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
// interruptores do RootifyONE e músicas não importam aqui; os outros jogos da Jogoteca, se ainda não existirem, também não
const outros = ['jogos/sudoku.js', 'jogos/boliche.js', 'capas.js'].filter(f => !fs.existsSync(path.join(raiz, 'jogoteca', f)));
const IGNORAR = new RegExp(['solverone-dados', 'favicon', '\\.mp3'].concat(outros.map(f => f.replace(/[./]/g, '\\$&'))).join('|'), 'i');
const FONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
const DEITADO = { viewport: { width: 915, height: 412 }, hasTouch: true, isMobile: true };
const PC = { viewport: { width: 1280, height: 800 } };
let browser, base;

test.before(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/jogoteca/';
  browser = await chromium.launch();
});
test.after(async () => { if (browser) await browser.close(); server.close(); });

async function abrir(ctxOp, nivel) {
  const ctx = await browser.newContext(Object.assign({ locale: 'pt-BR' }, ctxOp));
  const pg = await ctx.newPage(), erros = [];
  pg.on('console', m => { if (m.type() === 'error') { const u = (m.location() && m.location().url) || ''; if (!IGNORAR.test(u + m.text())) erros.push(m.text() + ' @' + u); } });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  await pg.goto(base + '?teste');
  await pg.waitForFunction(() => window.JogotecaDebug);
  await pg.evaluate(n => JogotecaDebug.jogar('paciencia', n), nivel || 'facil');
  await pg.waitForSelector('.jt-pac-mesa .jt-pac-carta');
  pg.erros = erros; pg.ctx = ctx;
  return pg;
}
// onde está a carta (pilha) e o ponto para tocar nela (a faixa de cima, sempre à vista)
const lugar = (pg, id) => pg.evaluate(id => {
  const e = window.JogotecaPacienciaDebug.estado();
  if (e.monte.some(x => x.id === id)) return 'monte';
  if (e.desc.some(x => x.id === id)) return 'desc';
  for (let i = 0; i < 4; i++) if (e.fund[i].some(x => x.id === id)) return 'fund' + i;
  for (let i = 0; i < 7; i++) if (e.col[i].some(x => x.id === id)) return 'col' + i;
  return null;
}, id);
async function pontoDaCarta(pg, id) {
  const r = await pg.$eval('.jt-pac-carta[data-id="' + id + '"]', el => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
  return { x: r.x + r.w / 2, y: r.y + Math.min(10, r.h / 4) };
}
// procura uma carta que tenha para onde ir; se não houver, compra do monte (como uma pessoa faria)
async function cartaQueMove(pg, so) {
  for (let tentativa = 0; tentativa < 40; tentativa++) {
    const achou = await pg.evaluate(so => {
      const D = window.JogotecaPacienciaDebug, L = D.logica, e = D.estado(), orig = [];
      for (let i = 0; i < 7; i++) { const col = e.col[i]; const k = col.findIndex(x => x.up); if (k >= 0) orig.push({ p: 'col', i, k }); }
      if (so !== 'colunas') orig.push({ p: 'desc' });
      for (const o of orig) {
        const d = L.melhorDestino(e, o);
        if (d && (so !== 'colunas' || d.p === 'col')) return { id: L.cartasDe(e, o)[0].id, o, d, de: o.p === 'col' ? 'col' + o.i : o.p };
      }
      return null;
    }, so);
    if (achou) return achou;
    await pg.evaluate(() => { const D = window.JogotecaPacienciaDebug; D.logica.comprar(D.estado()); D.refazer(); });
  }
  return null;
}
async function confereLayout(pg) {
  const info = await pg.evaluate(() => {
    const cols = Array.from(document.querySelectorAll('.jt-pac-vaga[data-p="col"]')).map(v => { const b = v.getBoundingClientRect(); return { x: b.x, w: b.width, y: b.y, h: b.height }; });
    const palco = document.getElementById('palco').getBoundingClientRect();
    return { cols, largura: innerWidth, palco: { y: palco.y, h: palco.height }, cartas: document.querySelectorAll('.jt-pac-carta').length,
      hud: document.querySelector('.jt-pac-hud').getBoundingClientRect().bottom };
  });
  assert.equal(info.cartas, 52);
  assert.equal(info.cols.length, 7);
  info.cols.forEach((c, i) => {
    assert.ok(c.x >= 0 && c.x + c.w <= info.largura, 'coluna ' + i + ' cabe na largura');
    assert.ok(c.w >= 38, 'carta legível (' + c.w + ' px)');
    if (i) assert.ok(c.x >= info.cols[i - 1].x + info.cols[i - 1].w, 'colunas não se encostam');
  });
  assert.ok(info.hud <= info.palco.y + info.palco.h + 1, 'placar dentro do palco');
  return info;
}

for (const [nome, op] of [['em pé (390×844)', FONE], ['deitado (915×412)', DEITADO]]) {
  test('celular ' + nome + ': o jogo aparece, as 7 colunas cabem, um toque move uma carta, sem erro no console', async () => {
    const pg = await abrir(op, 'facil');
    await confereLayout(pg);
    const alvo = await cartaQueMove(pg);
    assert.ok(alvo, 'achou uma carta para mover');
    await pg.waitForTimeout(300);
    const p = await pontoDaCarta(pg, alvo.id);
    await pg.touchscreen.tap(p.x, p.y);
    await pg.waitForTimeout(150);
    const agora = await lugar(pg, alvo.id);
    assert.notEqual(agora, alvo.de, 'a carta saiu do lugar');
    assert.equal(agora, alvo.d.p + alvo.d.i);
    assert.equal(await pg.$eval('.jt-pac-chip .jt-pac-val', el => el.textContent), String(await pg.evaluate(() => window.JogotecaPacienciaDebug.estado().jogadas)));
    // tocar no monte vira uma carta
    const antes = await pg.evaluate(() => window.JogotecaPacienciaDebug.estado().desc.length);
    const m = await pg.$eval('.jt-pac-vaga[data-p="monte"]', el => { const b = el.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
    await pg.touchscreen.tap(m.x, m.y);
    await pg.waitForTimeout(100);
    const depois = await pg.evaluate(() => { const e = window.JogotecaPacienciaDebug.estado(); return { d: e.desc.length, m: e.monte.length }; });
    assert.ok(depois.d === antes + 1 || (depois.d === 0 && depois.m > 0), 'o monte virou uma carta (ou reciclou)');
    assert.deepEqual(pg.erros, []);
    await pg.ctx.close();
  });
}

test('computador: arrastar com o mouse leva a pilha; soltar num lugar errado volta; ↶ Desfazer desfaz', async () => {
  const pg = await abrir(PC, 'medio');
  await confereLayout(pg);
  const alvo = await cartaQueMove(pg, 'colunas');
  assert.ok(alvo, 'achou uma pilha para arrastar');
  await pg.waitForTimeout(300);
  const p = await pontoDaCarta(pg, alvo.id);
  const destino = await pg.$eval('.jt-pac-vaga[data-p="col"][data-i="' + alvo.d.i + '"]', el => { const b = el.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
  const n = await pg.evaluate(o => window.JogotecaPacienciaDebug.logica.cartasDe(window.JogotecaPacienciaDebug.estado(), o).length, alvo.o);
  // primeiro, soltar no meio do nada: a carta volta
  await pg.mouse.move(p.x, p.y); await pg.mouse.down();
  await pg.mouse.move(p.x, p.y + 220, { steps: 6 }); await pg.mouse.up();
  await pg.waitForTimeout(100);
  assert.equal(await lugar(pg, alvo.id), alvo.de);
  // agora no lugar certo
  await pg.waitForTimeout(250);
  await pg.mouse.move(p.x, p.y); await pg.mouse.down();
  await pg.mouse.move(destino.x, destino.y + 20, { steps: 8 }); await pg.mouse.up();
  await pg.waitForTimeout(100);
  assert.equal(await lugar(pg, alvo.id), 'col' + alvo.d.i);
  const tam = await pg.evaluate(i => window.JogotecaPacienciaDebug.estado().col[i].length, alvo.d.i);
  assert.ok(tam >= n + 1, 'a pilha inteira foi junto');
  await pg.click('.jt-pac-bt');
  await pg.waitForTimeout(100);
  assert.equal(await lugar(pg, alvo.id), alvo.de, 'desfez');
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});

test('difícil: vira 3 e não tem botão de desfazer', async () => {
  const pg = await abrir(FONE, 'dificil');
  assert.equal(await pg.$('.jt-pac-bt'), null);
  const vira = await pg.evaluate(() => { const D = window.JogotecaPacienciaDebug; D.logica.comprar(D.estado()); D.refazer(); return D.estado().desc.length; });
  assert.equal(vira, 3);
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});

test('teclado e controle da TV: setas mostram o cursor, Enter compra/pega, Esc cancela', async () => {
  const pg = await abrir({ viewport: { width: 1920, height: 1080 } }, 'facil');
  assert.equal(await pg.isVisible('.jt-pac-cursor'), false);
  await pg.keyboard.press('ArrowRight');   // 1ª seta só mostra o cursor (no monte)
  assert.equal(await pg.isVisible('.jt-pac-cursor'), true);
  await pg.keyboard.press('Enter');        // no monte: vira uma carta
  assert.equal(await pg.evaluate(() => window.JogotecaPacienciaDebug.estado().desc.length), 1);
  await pg.keyboard.press('ArrowDown');    // desce para o descarte (monte à esquerda, descarte embaixo)
  assert.equal(await pg.evaluate(() => window.JogotecaPacienciaDebug.cursor().p), 'desc');
  await pg.keyboard.press('Enter');        // pega
  assert.deepEqual(await pg.evaluate(() => window.JogotecaPacienciaDebug.pega()), { p: 'desc' });
  assert.equal(await pg.$$eval('.jt-pac-pega', l => l.length), 1);
  await pg.keyboard.press('Escape');       // cancela
  assert.equal(await pg.evaluate(() => window.JogotecaPacienciaDebug.pega()), null);
  await pg.keyboard.press('ArrowRight');   // vai para as colunas
  assert.equal(await pg.evaluate(() => window.JogotecaPacienciaDebug.cursor().p), 'col');
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});

test('vitória pelo "Completar": chama a janela 🎉 com jogadas e tempo e guarda o melhor tempo do nível', async () => {
  const pg = await abrir(FONE, 'facil');
  await pg.evaluate(() => {
    const D = window.JogotecaPacienciaDebug, L = D.logica, e = D.estado(), c = L.carta;
    e.monte = []; e.desc = []; e.fund = [[], [], [], []]; e.col = [[], [], [], [], [], [], []];
    for (let s = 0; s < 4; s++) for (let n = 1; n <= 10; n++) e.fund[s].push(c(n, s, true));
    e.col[0] = [c(13, 0, true), c(12, 1, true), c(11, 0, true)];
    e.col[1] = [c(13, 1, true), c(12, 0, true), c(11, 1, true)];
    e.col[2] = [c(13, 2, true), c(12, 3, true), c(11, 2, true)];
    e.col[3] = [c(13, 3, true), c(12, 2, true), c(11, 3, true)];
    D.refazer();
  });
  await pg.waitForSelector('.jt-pac-completar', { state: 'visible' });
  await pg.click('.jt-pac-completar');
  await pg.waitForSelector('#fim', { state: 'visible', timeout: 8000 });
  assert.match(await pg.textContent('#fimTexto'), /Você venceu em \d+ jogadas e \d+:\d\d!/);
  const melhor = await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:jogoteca:paciencia:melhor-facil')));
  assert.equal(typeof melhor, 'number');
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});
