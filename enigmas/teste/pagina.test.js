// Enigmas de Ligar — a página de verdade no Chromium (Playwright), com um servidorzinho local da raiz do repositório.
// Rodar da raiz do kids: node --test enigmas/teste/*.test.js
// Completa rodadas tocando (toque-toque) e arrastando (mouse e dedo), no celular em pé, deitado e no computador,
// e confere que não aparece nenhum erro no console. Fotos das telas em /tmp/enigmas-*.png (para olhar, se quiser).
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg', '.md': 'text/markdown; charset=utf-8' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const IGNORAR = /favicon|solverone-dados|ERR_NAME_NOT_RESOLVED|ERR_INTERNET|net::ERR|Failed to load resource: the server responded with a status of 404/i;
const FOTOS = '/tmp/';
let browser, base;

test.before(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/enigmas/';
  browser = await chromium.launch();
});
test.after(async () => { if (browser) await browser.close(); server.close(); });

async function abrir(ctxOpcoes, antes) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, locale: 'pt-BR' }, ctxOpcoes || {}));
  const pg = await ctx.newPage(); const erros = [];
  await pg.addInitScript(() => { window.__csp = []; document.addEventListener('securitypolicyviolation', e => window.__csp.push(e.violatedDirective + ' ' + e.blockedURI)); });
  if (antes) await pg.addInitScript(antes);
  pg.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  await pg.goto(base + '?teste');
  await pg.waitForFunction(() => window.EnigmasDebug && window.EnigmasDebug.pronto);
  pg.erros = async () => erros.filter(e => !IGNORAR.test(e)).concat(await pg.evaluate(() => window.__csp.map(c => 'CSP: ' + c)));
  pg.fechar = () => ctx.close();
  return pg;
}
const est = pg => pg.evaluate(() => EnigmasDebug.estado());
// centro de cada carta, o número do par e se já foi ligada
const cartas = pg => pg.evaluate(() => Array.from(document.querySelectorAll('.carta')).map(b => {
  const r = b.getBoundingClientRect();
  return { lado: b.dataset.lado, par: +b.dataset.par, x: r.left + r.width / 2, y: r.top + r.height / 2, top: r.top, bottom: r.bottom, left: r.left, right: r.right, ligada: b.disabled };
}));
const seletor = (lado, par) => `.carta[data-lado="${lado}"][data-par="${par}"]`;

async function porToque(pg) {
  const cs = await cartas(pg);
  for (const e of cs.filter(c => c.lado === 'e')) {
    await pg.click(seletor('e', e.par));
    await pg.click(seletor('d', e.par));
  }
}
async function porMouse(pg) {
  const cs = await cartas(pg);
  for (const e of cs.filter(c => c.lado === 'e')) {
    const d = cs.find(c => c.lado === 'd' && c.par === e.par);
    // metade das vezes arrasta da direita para a esquerda
    const [a, b] = e.par % 2 ? [d, e] : [e, d];
    await pg.mouse.move(a.x, a.y); await pg.mouse.down();
    await pg.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2 + 10, { steps: 6 });
    await pg.mouse.move(b.x, b.y, { steps: 6 }); await pg.mouse.up();
  }
}
async function porDedo(pg) {
  const cdp = await pg.context().newCDPSession(pg);
  const toque = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  const cs = await cartas(pg);
  for (const e of cs.filter(c => c.lado === 'e')) {
    const d = cs.find(c => c.lado === 'd' && c.par === e.par);
    await toque('touchStart', e.x, e.y);
    for (let i = 1; i <= 8; i++) await toque('touchMove', e.x + (d.x - e.x) * i / 8, e.y + (d.y - e.y) * i / 8);
    await toque('touchEnd');
  }
}
async function esperarFesta(pg) {
  await pg.waitForSelector('dialog.festa[open] #btProxima', { timeout: 5000 });
}
async function conferirRodadaCompleta(pg, nome) {
  await esperarFesta(pg);
  const e = await est(pg);
  assert.equal(e.acertos, e.n, nome + ': ligou todos os pares');
  assert.equal(e.erros, 0, nome + ': sem erro');
  assert.equal(e.riscos, e.n, nome + ': um risco de giz por par');
  const estrelas = await pg.textContent('dialog.festa .festa-estrelas');
  assert.equal(estrelas, '⭐⭐⭐', nome + ': três estrelas sem erro');
}
// todas as cartas dentro da tela, sem uma em cima da outra e sem rolagem para o lado
async function conferirLayout(pg, nome) {
  const cs = await cartas(pg);
  const tela = await pg.evaluate(() => ({ w: innerWidth, h: innerHeight, sw: document.documentElement.scrollWidth }));
  assert.ok(tela.sw <= tela.w + 1, nome + ': rola para o lado (' + tela.sw + ' > ' + tela.w + ')');
  for (const c of cs) assert.ok(c.top >= 0 && c.bottom <= tela.h && c.left >= 0 && c.right <= tela.w, nome + ': carta fora da tela ' + JSON.stringify(c));
  for (const lado of ['e', 'd']) {
    const col = cs.filter(c => c.lado === lado).sort((a, b) => a.top - b.top);
    for (let i = 1; i < col.length; i++) assert.ok(col[i].top >= col[i - 1].bottom - 0.5, nome + ': cartas encavaladas');
    for (const c of col) assert.ok(c.bottom - c.top >= 34, nome + ': carta pequena demais para o dedo (' + (c.bottom - c.top) + ' px)');
  }
}

test('celular em pé: Fácil por toque-toque, erro sem castigo, próxima rodada e progresso guardado', async () => {
  const pg = await abrir({ hasTouch: true, isMobile: true });
  await pg.screenshot({ path: FOTOS + 'enigmas-inicio.png' });
  await pg.click('#btFacil');
  let e = await est(pg);
  assert.equal(e.tela, 'jogo'); assert.ok(e.n >= 3 && e.n <= 4, 'Fácil tem 3 ou 4 pares');
  await conferirLayout(pg, 'celular Fácil');
  const id1 = e.id;

  // um erro: o risco some e nada fica ligado
  const cs = await cartas(pg);
  const a = cs.find(c => c.lado === 'e'), errada = cs.find(c => c.lado === 'd' && c.par !== a.par);
  await pg.click(seletor('e', a.par)); await pg.click(seletor('d', errada.par));
  e = await est(pg);
  assert.equal(e.erros, 1); assert.equal(e.acertos, 0);
  await pg.waitForTimeout(1200);
  assert.equal((await est(pg)).riscos, 0, 'risco errado se apaga');
  assert.equal(await pg.isDisabled(seletor('e', a.par)), false, 'carta continua livre depois do erro');

  await porToque(pg);
  await esperarFesta(pg);
  e = await est(pg);
  assert.equal(e.acertos, e.n);
  assert.match(await pg.textContent('dialog.festa .festa-estrelas'), /^⭐⭐☆$/, 'um erro = duas estrelas');
  await pg.screenshot({ path: FOTOS + 'enigmas-festa.png' });
  const p = await pg.evaluate(() => EnigmasDebug.progresso());
  assert.deepEqual(p.facil.feitas, [id1]); assert.equal(p.facil.estrelas, 2);

  await pg.click('#btProxima');
  await pg.waitForFunction(id => !EnigmasDebug.estado().festa && EnigmasDebug.estado().id !== id, id1);
  e = await est(pg);
  assert.equal(e.riscos, 0, 'lousa limpa na rodada nova'); assert.equal(e.acertos, 0);

  // guardou mesmo: abrir de novo no mesmo aparelho mostra o progresso no botão do nível
  await pg.reload(); await pg.waitForFunction(() => window.EnigmasDebug && window.EnigmasDebug.pronto);
  assert.match(await pg.textContent('#progFacil'), /⭐ 2 · 1\/36/);
  assert.deepEqual(await pg.erros(), []);
  await pg.fechar();
});

test('celular em pé: arrastando o dedo no Médio e no Difícil', async () => {
  const pg = await abrir({ hasTouch: true, isMobile: true });
  await pg.click('#btMedio');
  assert.equal((await est(pg)).n, 5);
  await conferirLayout(pg, 'celular Médio');
  await porDedo(pg);
  await conferirRodadaCompleta(pg, 'Médio com o dedo');
  await pg.click('#btNiveis');
  await pg.waitForFunction(() => EnigmasDebug.estado().tela === 'inicio' && !EnigmasDebug.estado().festa);

  await pg.click('#btDificil');
  const n = (await est(pg)).n;
  assert.ok(n === 6 || n === 7, 'Difícil tem 6 ou 7 pares');
  await conferirLayout(pg, 'celular Difícil');
  await pg.screenshot({ path: FOTOS + 'enigmas-celular-dificil.png' });
  await porDedo(pg);
  await conferirRodadaCompleta(pg, 'Difícil com o dedo');
  assert.deepEqual(await pg.erros(), []);
  await pg.fechar();
});

test('computador: arrastando com o mouse, teclado e inglês', async () => {
  const pg = await abrir({ viewport: { width: 1280, height: 800 } });
  await pg.click('#btLingua');
  assert.equal(await pg.textContent('.n-nome'), 'Easy');
  await pg.click('#btDificil');
  await conferirLayout(pg, 'computador Difícil');
  const pista = await pg.textContent('#pista');
  const ok = await pg.evaluate(p => EnigmasRodadas.dificil.some(r => r[0].replace(/^(pt|en):/, '').split('|')[1] === p), pista);
  assert.ok(ok, 'pista em inglês: ' + pista);
  await pg.screenshot({ path: FOTOS + 'enigmas-computador.png' });
  await porMouse(pg);
  await conferirRodadaCompleta(pg, 'Difícil com o mouse');
  await pg.keyboard.press('Enter');   // o foco está no "Próximo"
  await pg.waitForFunction(() => !EnigmasDebug.estado().festa && EnigmasDebug.estado().acertos === 0);

  // só teclado: Enter na primeira da esquerda, → vai para a direita, ↓ até o par, Enter
  const cs = await cartas(pg);
  const e0 = cs.find(c => c.lado === 'e');
  await pg.focus(seletor('e', e0.par)); await pg.keyboard.press('Enter');
  await pg.keyboard.press('ArrowRight');
  for (let i = 0; i < 8; i++) {
    const par = await pg.evaluate(() => document.activeElement.dataset.par);
    if (+par === e0.par) break;
    await pg.keyboard.press('ArrowDown');
  }
  await pg.keyboard.press('Enter');
  assert.equal((await est(pg)).acertos, 1, 'ligou um par só com o teclado');
  // Esc volta para os níveis
  await pg.keyboard.press('Escape');
  await pg.waitForFunction(() => EnigmasDebug.estado().tela === 'inicio');
  assert.deepEqual(await pg.erros(), []);
  await pg.fechar();
});

test('celular deitado e tela estreita de 320 px: tudo cabe', async () => {
  const pg = await abrir({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
  await pg.click('#btDificil');
  await conferirLayout(pg, 'celular deitado Difícil');
  await pg.screenshot({ path: FOTOS + 'enigmas-deitado.png' });
  await porToque(pg);
  await conferirRodadaCompleta(pg, 'deitado por toque');
  await pg.fechar();

  const p2 = await abrir({ viewport: { width: 320, height: 640 }, hasTouch: true, isMobile: true });
  const sw = await p2.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(sw <= 321, 'início rola para o lado em 320 px');
  await p2.click('#btDificil');
  await conferirLayout(p2, '320 px Difícil');
  await p2.screenshot({ path: FOTOS + 'enigmas-320.png' });
  assert.deepEqual(await p2.erros(), []);
  await p2.fechar();
});

test('Voltar do celular: com a festa aberta vai ao próximo enigma; na lousa volta aos níveis', async () => {
  const pg = await abrir({ viewport: { width: 800, height: 1280 }, hasTouch: true, isMobile: true });   // tablet em pé
  await pg.click('#btMedio');
  await conferirLayout(pg, 'tablet em pé Médio');
  await pg.screenshot({ path: FOTOS + 'enigmas-tablet.png' });
  const id1 = (await est(pg)).id;
  await porToque(pg);
  await esperarFesta(pg);
  await pg.goBack();
  await pg.waitForFunction(id => { const e = EnigmasDebug.estado(); return !e.festa && e.tela === 'jogo' && e.id !== id; }, id1);
  await pg.goBack();
  await pg.waitForFunction(() => EnigmasDebug.estado().tela === 'inicio');
  assert.match(await pg.textContent('#progMedio'), /⭐ 3 · 1\/33/);
  assert.deepEqual(await pg.erros(), []);
  await pg.fechar();
});

test('sem localStorage (modo privado travado) o jogo continua', async () => {
  const pg = await abrir({}, () => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('bloqueado'); } }); });
  await pg.click('#btFacil');
  await porToque(pg);
  await conferirRodadaCompleta(pg, 'sem localStorage');
  await pg.fechar();
});
