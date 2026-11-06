// Teste da página no Chromium (Playwright), em tamanho de celular e de computador:
// node --test labirinto/teste/*.test.js (rodar da raiz do repositório kids). Servidor estático pequeno aqui dentro.
// Com ?teste o jogo expõe window.LabirintoDebug; ?semente=N fixa o labirinto e ?missao=1 liga a missão.
const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const G = require('../gerador.js');
const R = require('../regras.js');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const IGNORAR = /solverone-dados|favicon/i;   // interruptores do RootifyONE não existem neste servidor de teste
const FONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 };
const PC = { viewport: { width: 1280, height: 800 } };
let browser, base;

test.before(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/labirinto/';
  browser = await chromium.launch();
});
test.after(async () => { if (browser) await browser.close(); server.close(); });

async function abrir(ctxOp, busca) {
  const ctx = await browser.newContext(Object.assign({ locale: 'pt-BR' }, ctxOp));
  const pg = await ctx.newPage(), erros = [];
  pg.on('console', m => { if (m.type() === 'error') { const u = (m.location() && m.location().url) || ''; if (!IGNORAR.test(u + m.text())) erros.push(m.text() + ' @' + u); } });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  await pg.goto(base + '?teste' + (busca || ''));
  await pg.waitForFunction(() => window.LabirintoDebug && LabirintoDebug.pronto);
  pg.erros = erros; pg.ctx = ctx;
  return pg;
}
const est = pg => pg.evaluate(() => LabirintoDebug.estado());
async function jogar(pg, forma, nivel, modo) {
  await pg.click(`[data-forma="${forma}"]`); await pg.click(`[data-nivel="${nivel}"]`); await pg.click(`[data-modo="${modo}"]`);
  await pg.click('#btJogar');
  await pg.waitForFunction(() => { const e = LabirintoDebug.estado(); return e.tela === 'jogo' && !e.intro && !e.glide; }, null, { timeout: 8000 });
}
const centro = (pg, c) => pg.evaluate(c => LabirintoDebug.centro(c), c);
const tela = (pg, p) => pg.evaluate(p => LabirintoDebug.tela(p[0], p[1]), p);
// semente com missão em que o item NÃO está no caminho direto da entrada à saída (para testar a porta trancada)
function sementeDesviada(forma, nivel, retrato) {
  for (let s = 1; s < 500; s++) {
    const L = G.criar({ forma, nivel, semente: s, retrato, missao: true });
    if (L.item >= 0 && !R.caminho(L, L.inicio, L.saida).includes(L.item)) return s;
  }
  throw new Error('sem semente');
}
// semente em que a casa da entrada tem uma parede fechada com uma vizinha (para o risco rápido bater nela)
function sementeComParede(forma, nivel) {
  for (let s = 21; s < 500; s++) {
    const L = G.criar({ forma, nivel, semente: s, retrato: true, missao: true });
    if (L.item >= 0 && L.viz[L.inicio].some(v => v.c >= 0 && !L.arestas[v.e].aberta)) return s;
  }
  throw new Error('sem semente');
}
// desenha com o mouse pelo caminho certo: centro → meio da passagem → centro da próxima casa
async function desenharCaminho(pg, de, para) {
  const cam = await pg.evaluate(([a, b]) => LabirintoDebug.caminho(a, b), [de, para]);
  for (let k = 1; k < cam.length; k++) {
    const meio = await pg.evaluate(([a, b]) => LabirintoDebug.passagem(a, b), [cam[k - 1], cam[k]]);
    let p = await tela(pg, meio); await pg.mouse.move(p[0], p[1], { steps: 3 });
    p = await centro(pg, cam[k]); await pg.mouse.move(p[0], p[1], { steps: 3 });
  }
}

test('celular: menu abre sem erro, textos em português, trilha de música e versão', async () => {
  const pg = await abrir(FONE);
  assert.match(await pg.textContent('#btJogar'), /Jogar/);
  assert.match(await pg.textContent('#versao'), /0\.1\.0/);
  assert.ok(await pg.isVisible('.trilha'), 'tocador da trilha');
  assert.equal(await pg.evaluate(() => document.querySelectorAll('[data-recurso="labirinto"]').length), 2);
  await pg.click('#btLingua');
  assert.match(await pg.textContent('#btJogar'), /Play/);
  const semRolagem = await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  assert.ok(semRolagem, 'menu sem rolagem para o lado a 390 px');
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});

test('celular, cachorrinho no quadrado: saída trancada até pegar o item, depois vitória e recorde', async () => {
  const s = sementeDesviada('quadrado', 'facil', true);
  const pg = await abrir(FONE, '&missao=1&semente=' + s);
  await jogar(pg, 'quadrado', 'facil', 'andar');
  await pg.evaluate(() => LabirintoDebug.velocidade(6));
  let e = await est(pg);
  assert.ok(e.item >= 0, 'tem missão');
  let p = await centro(pg, e.saida); await pg.mouse.click(p[0], p[1]);
  await pg.waitForFunction(s => LabirintoDebug.estado().casaCao === s, e.saida, { timeout: 8000 });
  e = await est(pg);
  assert.equal(e.pegouItem, false); assert.equal(e.venceu, false, 'não vence com a porta trancada');
  assert.match(await pg.textContent('#dica'), /trancada/);
  p = await centro(pg, e.item); await pg.mouse.click(p[0], p[1]);
  await pg.waitForFunction(() => LabirintoDebug.estado().pegouItem, null, { timeout: 8000 });
  assert.match(await pg.textContent('#missao'), /saída abriu/);
  await pg.waitForTimeout(900);
  p = await centro(pg, e.saida); await pg.mouse.click(p[0], p[1]);
  await pg.waitForFunction(() => LabirintoDebug.estado().fim, null, { timeout: 10000 });
  assert.ok(await pg.isVisible('#fim'));
  assert.equal(await pg.locator('#fimEstrelas span').count(), 3);
  const rec = await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:labirinto:recordes')));
  assert.ok(rec['quadrado-facil'] && rec['quadrado-facil'].e >= 1, 'recorde guardado');
  await pg.click('#btDeNovo');
  await pg.waitForFunction(() => { const e = LabirintoDebug.estado(); return !e.fim && !e.venceu && e.tela === 'jogo'; });
  await pg.goBack();   // Voltar do celular: sai do labirinto para o menu
  await pg.waitForFunction(() => LabirintoDebug.estado().tela === 'menu');
  assert.match(await pg.textContent('[data-rec="facil"]'), /★/);
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});

for (const forma of ['quadrado', 'redondo', 'colmeia']) {
  test(`celular, desenhar no ${forma}: risco rápido para na parede, desfazer, e o caminho certo vence`, async () => {
    const pg = await abrir(FONE, '&missao=1&semente=' + sementeComParede(forma, 'facil'));
    await jogar(pg, forma, 'facil', 'desenhar');
    const e = await est(pg), parede = await pg.evaluate(() => LabirintoDebug.parede());
    assert.ok(parede, 'tem parede ao lado da entrada');
    const outra = parede.a === e.inicio ? parede.b : parede.a;
    // risco rápido (um movimento só) da entrada para a casa do outro lado da parede
    let p = await tela(pg, e.ponta); await pg.mouse.move(p[0], p[1]); await pg.mouse.down();
    const q = await centro(pg, outra); await pg.mouse.move(q[0], q[1], { steps: 1 });
    let s = await est(pg);
    assert.equal(s.bloqueado, true, 'a linha parou');
    assert.equal(s.casaPonta, e.inicio, 'a ponta ficou do lado de cá da parede');
    assert.equal(await pg.evaluate(() => LabirintoDebug.furou()), false, 'não furou a parede');
    // o dedo continua longe, cruzando outras paredes: a linha não anda
    const n = s.risco;
    await pg.mouse.move(q[0] + 60, q[1] + 90, { steps: 1 }); await pg.mouse.move(q[0] - 40, q[1] + 140, { steps: 2 });
    s = await est(pg);
    assert.equal(s.risco, n, 'linha bloqueada não segue o dedo');
    await pg.mouse.up();
    await pg.click('#btDesfazer');
    s = await est(pg);
    assert.equal(s.risco, 1, 'desfazer apagou o traço');
    // começar longe da ponta não desenha
    await pg.mouse.move(q[0], q[1]); await pg.mouse.down(); await pg.mouse.move(q[0] + 5, q[1] + 5, { steps: 2 }); await pg.mouse.up();
    assert.equal((await est(pg)).risco, 1, 'longe da ponta não risca');
    // agora o caminho certo: entrada → item → saída
    p = await tela(pg, (await est(pg)).ponta); await pg.mouse.move(p[0], p[1]); await pg.mouse.down();
    await desenharCaminho(pg, e.inicio, e.item);
    s = await est(pg);
    assert.equal(s.pegouItem, true, 'pegou o item desenhando');
    assert.equal(s.bloqueado, false, 'caminho certo não bate em parede');
    await desenharCaminho(pg, e.item, e.saida);
    await pg.mouse.up();
    s = await est(pg);
    assert.equal(s.venceu, true, 'chegou na saída');
    assert.equal(await pg.evaluate(() => LabirintoDebug.furou()), false, 'a linha inteira nunca furou parede');
    await pg.waitForFunction(() => LabirintoDebug.estado().fim, null, { timeout: 6000 });
    assert.deepEqual(pg.erros, []);
    await pg.ctx.close();
  });
}

test('computador, colmeia média: clique leva o cachorrinho; difícil no celular começa com zoom', async () => {
  const pg = await abrir(PC, '&missao=1&semente=5');
  await jogar(pg, 'colmeia', 'medio', 'andar');
  await pg.evaluate(() => LabirintoDebug.velocidade(8));
  const e = await est(pg);
  let p = await centro(pg, e.item); await pg.mouse.click(p[0], p[1]);
  await pg.waitForFunction(() => LabirintoDebug.estado().pegouItem, null, { timeout: 10000 });
  await pg.waitForTimeout(900);
  p = await centro(pg, e.saida); await pg.mouse.click(p[0], p[1]);
  await pg.waitForFunction(() => LabirintoDebug.estado().fim, null, { timeout: 10000 });
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();

  const fone = await abrir(FONE, '&semente=9');
  await jogar(fone, 'redondo', 'dificil', 'andar');
  const f = await est(fone);
  assert.ok(f.z > f.zFit * 1.2, 'difícil no celular: câmera perto do cachorrinho');
  await fone.click('#btTudo');
  assert.ok(Math.abs((await est(fone)).z - f.zFit) < 0.01, '⤢ mostra o labirinto inteiro');
  assert.deepEqual(fone.erros, []);
  await fone.ctx.close();
});

test('computador, movimento reduzido: setas do teclado jogam o quadrado inteiro', async () => {
  const pg = await abrir(Object.assign({ reducedMotion: 'reduce' }, PC), '&missao=1&semente=3');
  await jogar(pg, 'quadrado', 'facil', 'andar');
  await pg.evaluate(() => LabirintoDebug.velocidade(8));
  const e = await est(pg);
  const cam = await pg.evaluate(([a, b, c]) => LabirintoDebug.caminho(a, b).concat(LabirintoDebug.caminho(b, c).slice(1)), [e.inicio, e.item, e.saida]);
  const cel = await pg.evaluate(() => LabirintoDebug.estado());
  assert.ok(cel);
  for (let k = 1; k < cam.length; k++) {
    const a = await centro(pg, cam[k - 1]), b = await centro(pg, cam[k]);
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const tecla = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp');
    await pg.keyboard.press(tecla);
    await pg.waitForFunction(c => LabirintoDebug.estado().casaCao === c || LabirintoDebug.estado().venceu, cam[k], { timeout: 5000 });
  }
  await pg.waitForFunction(() => LabirintoDebug.estado().fim, null, { timeout: 5000 });
  // parede: seta para um lado fechado não anda
  await pg.click('#btDeNovo');
  await pg.waitForFunction(() => { const e = LabirintoDebug.estado(); return !e.intro && !e.glide && !e.fim; });
  const e2 = await est(pg), parede = await pg.evaluate(() => LabirintoDebug.parede());
  if (parede) {
    const outra = parede.a === e2.inicio ? parede.b : parede.a;
    const a = await centro(pg, e2.inicio), b = await centro(pg, outra), dx = b[0] - a[0], dy = b[1] - a[1];
    await pg.keyboard.press(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp'));
    await pg.waitForTimeout(400);
    assert.equal((await est(pg)).casaCao, e2.inicio, 'não atravessou a parede pela seta');
  }
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});
