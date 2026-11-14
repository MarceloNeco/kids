// Teste da página no Chromium (Playwright): node --test glub-glub/teste/pagina.test.js (rodar da raiz do repositório kids).
// Com ?teste o jogo expõe window.GlubDebug: estado(), pescar(j), subir(j, s), avancar(segundos).
const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const IGNORAR = /solverone-dados|favicon|\.mp3/i;   // interruptores do RootifyONE e músicas não importam aqui
const FONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
const DEITADO = { viewport: { width: 915, height: 412 }, hasTouch: true, isMobile: true };
let browser, base;

test.before(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/glub-glub/';
  browser = await chromium.launch();
});
test.after(async () => { if (browser) await browser.close(); server.close(); });

async function abrir(ctxOp, busca) {
  const ctx = await browser.newContext(Object.assign({ locale: 'pt-BR' }, ctxOp));
  const pg = await ctx.newPage(), erros = [];
  pg.on('console', m => { if (m.type() === 'error') { const u = (m.location() && m.location().url) || ''; if (!IGNORAR.test(u + m.text())) erros.push(m.text() + ' @' + u); } });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  await pg.goto(base + '?teste' + (busca || ''));
  await pg.waitForFunction(() => window.GlubDebug && GlubDebug.pronto);
  pg.erros = erros; pg.ctx = ctx;
  return pg;
}
const est = pg => pg.evaluate(() => GlubDebug.estado());
async function jogarSozinho(pg) { await pg.click('#btSozinho'); await pg.click('#btJogar'); await pg.waitForFunction(() => GlubDebug.estado().tela === 'jogo'); }
async function jogarDois(pg) { await pg.click('#btDois'); await pg.click('#btJogar'); await pg.waitForFunction(() => GlubDebug.estado().tela === 'jogo'); }
const caixa = (pg, sel) => pg.$eval(sel, e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, vis: getComputedStyle(e).display !== 'none' && r.width > 0 }; });
const cruza = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

test('sozinho no celular em pé: 🎣 faz o anzol descer, sem erro no console', async () => {
  const pg = await abrir(FONE);
  await jogarSozinho(pg);
  assert.equal((await est(pg)).fases[0], 'balanca');
  await pg.tap('#pescar0');
  await pg.waitForTimeout(150);
  assert.notEqual((await est(pg)).fases[0], 'balanca');
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});

test('celular em pé: "dois" pede para deitar o celular', async () => {
  const pg = await abrir(FONE);
  await pg.click('#btDois');
  assert.equal(await pg.isDisabled('#btJogar'), true);
  assert.equal(await pg.isVisible('#avisoDeitar'), true);
  await pg.ctx.close();
});

test('dois no mesmo aparelho (deitado): o 🎣 de um não mexe no anzol do outro', async () => {
  const pg = await abrir(DEITADO);
  await jogarDois(pg);
  await pg.tap('#pescar1');
  await pg.waitForTimeout(150);
  let e = await est(pg);
  assert.equal(e.fases[0], 'balanca'); assert.notEqual(e.fases[1], 'balanca');
  await pg.tap('#pescar0');
  await pg.waitForTimeout(100);
  e = await est(pg);
  assert.notEqual(e.fases[0], 'balanca');
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});

test('fim da partida: placar dos dois, total do time e jogar de novo', async () => {
  const pg = await abrir(DEITADO);
  await jogarDois(pg);
  await pg.evaluate(() => GlubDebug.avancar(64));
  await pg.waitForSelector('#fim:not([hidden])');
  const t = await pg.textContent('#fim');
  assert.match(t, /Juca/); assert.match(t, /Lili/); assert.match(t, /Juntos vocês pescaram \d+/);
  await pg.click('#btDeNovo');
  await pg.waitForFunction(() => GlubDebug.estado().tela === 'jogo' && GlubDebug.estado().tempo > 59);
  await pg.ctx.close();
});

test('girar o celular no meio da partida: nada some e os anzóis continuam', async () => {
  const pg = await abrir(FONE);
  await jogarSozinho(pg);
  const antes = await est(pg);
  await pg.setViewportSize({ width: 844, height: 390 });
  await pg.waitForTimeout(300);
  const depois = await est(pg);
  assert.equal(depois.tela, 'jogo');
  assert.equal(depois.bichos, antes.bichos);
  assert.ok(depois.aspecto > 1);
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});

test('sair do app (aba escondida) pausa o relógio', async () => {
  const pg = await abrir(FONE);
  await jogarSozinho(pg);
  await pg.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  const t1 = (await est(pg)).tempo;
  await pg.waitForTimeout(1500);
  const t2 = (await est(pg)).tempo;
  assert.ok(Math.abs(t2 - t1) < 0.05, `relógio andou: ${t1} → ${t2}`);
  await pg.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
  await pg.waitForTimeout(600);
  assert.ok((await est(pg)).tempo < t2, 'voltou a andar');
  await pg.ctx.close();
});

test('botões 🎣 e ⬆️ grandes e fora da barra 🏠/🚪, em pé e deitado', async () => {
  for (const [op, dois] of [[FONE, false], [DEITADO, true]]) {
    const pg = await abrir(op);
    if (dois) await jogarDois(pg); else await jogarSozinho(pg);
    const nav = await pg.$('.bolinho-nav') ? await caixa(pg, '.bolinho-nav') : null;
    for (const id of dois ? ['#pescar0', '#subir0', '#pescar1', '#subir1'] : ['#pescar0', '#subir0']) {
      const b = await caixa(pg, id);
      assert.ok(b.vis, id + ' à vista');
      assert.ok(b.w >= 56 && b.h >= 56, id + ' pequeno: ' + b.w + '×' + b.h);
      if (nav) assert.ok(!cruza(b, nav), id + ' embaixo da barra 🏠/🚪');
      assert.ok(b.y + b.h <= op.viewport.height + 1 && b.x + b.w <= op.viewport.width + 1, id + ' fora da tela');
    }
    await pg.ctx.close();
  }
});

test('álbum: bicho pescado vira figurinha e continua depois de recarregar', async () => {
  const pg = await abrir(DEITADO);
  await jogarSozinho(pg);
  await pg.evaluate(() => GlubDebug.pescarUm('pacu'));
  await pg.waitForFunction(() => (GlubDebug.estado().album.pacu || 0) >= 1, null, { timeout: 8000 });
  await pg.reload(); await pg.waitForFunction(() => window.GlubDebug && GlubDebug.pronto);
  assert.ok((await est(pg)).album.pacu >= 1);
  await pg.click('#btAlbum');
  assert.equal(await pg.isVisible('[data-figurinha="pacu"].tem'), true);
  await pg.ctx.close();
});

test('nível de cada jogador no modo dois: cada um escolhe o seu', async () => {
  const pg = await abrir(DEITADO);
  await pg.click('#btDois');
  await pg.click('[data-nivel-j="0"][data-nivel="facil"]');
  await pg.click('[data-nivel-j="1"][data-nivel="dificil"]');
  await pg.click('#btJogar');
  await pg.waitForFunction(() => GlubDebug.estado().tela === 'jogo');
  assert.deepEqual((await est(pg)).niveis, ['facil', 'dificil']);
  await pg.ctx.close();
});

test('celular simples: as tiras dos bichos não são refeitas a cada imagem que termina de carregar', async () => {
  const pg = await abrir(DEITADO);
  await pg.waitForTimeout(3500);   // todas as imagens chegam nesse tempo
  const e = await pg.evaluate(() => GlubArte.estatisticas());
  assert.ok(e.feitas <= e.guardadas + 40, `refez demais: ${e.feitas} tiras feitas para ${e.guardadas} guardadas`);
  await pg.ctx.close();
});

test('tela de fim: só depois da folga e nunca por cima de uma partida nova', async () => {
  const pg = await abrir(DEITADO);
  await jogarDois(pg);
  await pg.evaluate(() => GlubDebug.avancar(60.2));   // acabou o tempo, mas a folga de 1,5 s ainda corre
  assert.equal(await pg.isVisible('#fim'), false, 'fim apareceu antes da folga');
  await pg.evaluate(() => GlubDebug.irMenu());
  await pg.click('#btDois'); await pg.click('#btJogar');
  await pg.waitForTimeout(2500);
  assert.equal(await pg.isVisible('#fim'), false, 'o fim da partida velha abriu por cima da nova');
  await pg.ctx.close();
});

test('tablet em pé em dois: placares e baldes à vista, fora dos botões', async () => {
  const pg = await abrir({ viewport: { width: 820, height: 1180 }, hasTouch: true, isMobile: true });
  await jogarDois(pg);
  for (const p of ['#placar0', '#placar1']) for (const b of ['#pescar0', '#subir0', '#pescar1', '#subir1'])
    assert.ok(!cruza(await caixa(pg, p), await caixa(pg, b)), p + ' embaixo de ' + b);
  await pg.ctx.close();
});

test('faixa "Limpa o Rio!" inteira na tela do celular em pé', async () => {
  const pg = await abrir(FONE);
  await jogarSozinho(pg);
  await pg.evaluate(() => GlubDebug.avancar(28.5));
  await pg.waitForSelector('#faixa:not([hidden])');
  const f = await caixa(pg, '#faixa');
  assert.ok(f.x >= 0 && f.x + f.w <= 390, 'faixa cortada: ' + JSON.stringify(f));
  await pg.ctx.close();
});

// três idiomas (dono, 14/Nov/2026): a escolha é feita só na estante (localStorage "bolinho:idioma", ../idioma.js)
async function abrirEm(idioma, ctxOp) {
  const ctx = await browser.newContext(Object.assign({ locale: 'pt-BR' }, ctxOp));
  await ctx.addInitScript(c => { try { localStorage.setItem('bolinho:idioma', c); } catch (e) {} }, idioma);
  const pg = await ctx.newPage(), erros = [];
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  await pg.goto(base + '?teste');
  await pg.waitForFunction(() => window.GlubDebug && GlubDebug.pronto);
  pg.erros = erros; pg.ctx = ctx;
  return pg;
}
const cabe = (pg) => pg.evaluate(() => Array.prototype.filter.call(document.querySelectorAll('.tela.ativa button, .tela.ativa .rotulo, .tela.ativa h2, .faixa:not([hidden])'), function (el) {
  const r = el.getBoundingClientRect(); if (!r.width) return false;
  return r.left < -1 || r.right > innerWidth + 1 || el.scrollWidth > el.clientWidth + 2;
}).map(el => el.id || el.textContent));

test('espanhol escolhido na estante: menu, faixas, fim e álbum em espanhol, sem botão de idioma', async () => {
  const pg = await abrirEm('es', DEITADO);
  assert.match(await pg.evaluate(() => document.documentElement.lang), /^es/);
  assert.equal(await pg.$('#btLingua'), null, 'o jogo não tem botão de idioma próprio');
  assert.equal((await pg.textContent('#btJogar')).trim(), '▶ ¡A pescar!');
  assert.equal(await pg.getAttribute('#btEfeitos', 'aria-label'), 'Sonidos');
  assert.match(await pg.getAttribute('#btHora', 'aria-label'), /^Momento del día: /);
  assert.match(await pg.textContent('#versao'), /Versión [\d.]+ · \d\d\/[a-z]{3}\/\d{4}/);
  await pg.click('#btDois'); await pg.click('#btJogar');
  await pg.waitForFunction(() => GlubDebug.estado().tela === 'jogo');
  assert.equal(await pg.getAttribute('#pescar0', 'aria-label'), 'Pescar');
  assert.equal(await pg.getAttribute('#subir0', 'aria-label'), 'Recoger el sedal');
  await pg.evaluate(() => GlubDebug.avancar(64));
  await pg.waitForSelector('#fim:not([hidden])');
  assert.match(await pg.textContent('#fim'), /¡Juntos habéis pescado \d+ puntos!/);
  await pg.click('#btFimMenu');
  await pg.waitForFunction(() => GlubDebug.estado().tela === 'menu');
  await pg.click('#btAlbum');
  assert.match(await pg.textContent('#album'), /Álbum de cromos/);
  assert.match(await pg.textContent('#albumConta'), /^\d+ de \d+ cromos$/);
  assert.deepEqual(pg.erros, []);
  await pg.ctx.close();
});

test('idioma trocado na estante (outra aba): o jogo troca na hora', async () => {
  const pg = await abrirEm('pt', FONE);
  assert.equal((await pg.textContent('#btJogar')).trim(), '▶ Pescar!');
  await pg.evaluate(() => BolinhoIdioma.escolher('en'));
  assert.equal((await pg.textContent('#btJogar')).trim(), "▶ Let's fish!");
  assert.match(await pg.evaluate(() => document.documentElement.lang), /^en/);
  await pg.evaluate(() => BolinhoIdioma.escolher('es'));
  assert.equal((await pg.textContent('#btJogar')).trim(), '▶ ¡A pescar!');
  assert.equal(await pg.getAttribute('#btAjuda', 'aria-label'), 'Cómo se juega');
  await pg.ctx.close();
});

test('nos três idiomas nada sai da tela no celular, em pé e deitado (começo, jogo e "Limpa o Rio!")', async () => {
  for (const idioma of ['pt', 'en', 'es']) for (const vp of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    const pg = await abrirEm(idioma, { viewport: vp, hasTouch: true, isMobile: true });
    await pg.click('#btAjuda');
    assert.deepEqual(await cabe(pg), [], idioma + ' ' + vp.width + '×' + vp.height + ': começo');
    await jogarSozinho(pg);
    await pg.evaluate(() => GlubDebug.avancar(28.5));
    await pg.waitForSelector('#faixa:not([hidden])');
    assert.deepEqual(await cabe(pg), [], idioma + ' ' + vp.width + '×' + vp.height + ': jogo');
    await pg.ctx.close();
  }
});

test('menu do começo: cada grupo numa linha só (celular em pé) e o lago à vista atrás', async () => {
  for (const largura of [360, 390]) {
    const pg = await abrir({ viewport: { width: largura, height: 800 }, hasTouch: true, isMobile: true });
    for (const grupo of [['#btSozinho', '#btDois'], ['[data-quem="juca"]', '[data-quem="lili"]'], ['[data-nivel-j="0"][data-nivel="facil"]', '[data-nivel-j="0"][data-nivel="medio"]', '[data-nivel-j="0"][data-nivel="dificil"]']]) {
      const ys = [];
      for (const s of grupo) { const b = await caixa(pg, s); assert.ok(b.x >= 0 && b.x + b.w <= largura, s + ' fora da tela'); ys.push(Math.round(b.y)); }
      assert.ok(Math.max(...ys) - Math.min(...ys) <= 2, largura + 'px: ' + grupo.join(' ') + ' em linhas diferentes: ' + ys);
    }
    const nav = await caixa(pg, '.bolinho-nav'), logo = await caixa(pg, '.logo span:first-child');   // as letras (a caixa do título começa na borda)
    assert.ok(!cruza(nav, logo), 'o nome GLUB GLUB está embaixo do botão Saída');
    const painel = await caixa(pg, '.painel');
    assert.ok(painel.h <= 800 * 0.62, 'a caixa do menu cobre o lago: ' + painel.h + 'px');
    await pg.ctx.close();
  }
});
