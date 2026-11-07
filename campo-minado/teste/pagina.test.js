// Teste da página inteira no Chromium (Playwright): node --test campo-minado/teste/*.test.js (rodar da raiz do kids)
// Com ?teste os ouriços ficam sempre no mesmo lugar (semente fixa) e as janelas de fim abrem sem esperar a animação.
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
  // interruptor "ingles" do RootifyONE ligado (../idioma.js): o teste troca o idioma, como antes
  if (p === '/solverone-dados/recursos/kids.json') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"recursos":{"ingles":{"ligado":true}}}'); return; }
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
// solverone-dados (interruptores do RootifyONE) não existe no servidor de teste: o 404 é esperado
const IGNORAR = /favicon|solverone-dados/i;
let browser, base;

test.before(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/campo-minado/';
  browser = await chromium.launch();
});
test.after(async () => { if (browser) await browser.close(); server.close(); });

async function abrir(ctxOp, url) {
  const ctx = await browser.newContext(Object.assign({ locale: 'pt-BR' }, ctxOp));
  const pg = await ctx.newPage(); const erros = [];
  pg.on('console', m => { if (m.type() === 'error') erros.push(m.text() + ' @' + (m.location() && m.location().url)); });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  await pg.addInitScript(() => { window.__csp = []; document.addEventListener('securitypolicyviolation', e => window.__csp.push(e.violatedDirective + ' ' + e.blockedURI)); });
  await pg.goto(url || base + '?teste');
  await pg.waitForFunction(() => window.CampoDebug && window.CampoDebug.pronto);
  pg.erros = () => erros.filter(e => !IGNORAR.test(e));
  pg.ctx = ctx;
  return pg;
}
const est = pg => pg.evaluate(() => { const e = CampoDebug.estado(); return { l: e.linhas, c: e.colunas, m: e.minas, abertas: e.abertas, fim: e.fim, plantado: e.plantado, bandeiras: e.bandeiras, cel: e.cel.map(c => ({ mina: c.mina, aberta: c.aberta, bandeira: c.bandeira })) }; });

const TELAS = { celular: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }, tablet: { viewport: { width: 800, height: 1280 }, hasTouch: true }, 'tablet Fire deitado': { viewport: { width: 1024, height: 600 }, hasTouch: true }, computador: { viewport: { width: 1366, height: 768 } } };

// telas onde o jardim todo tem de caber ao começar (celular em pé e deitado, tablet Fire em pé e deitado, computador)
const TAMANHOS = [[360, 740], [412, 915], [915, 412], [800, 1280], [1280, 800], [1366, 768]];
const RESERVA = 72;   // faixa de baixo guardada para o tocador de música (../trilha.js)
const ESPERADO = { facil: [8, 8, 10], medio: [10, 14, 25], dificil: [12, 20, 50] };

for (const [w, h] of TAMANHOS) {
  const nome = w + '×' + h;
  const op = { viewport: { width: w, height: h }, hasTouch: w < 1366, isMobile: w <= 915, deviceScaleFactor: w <= 915 ? 2 : 1 };
  test('jardim inteiro na tela ao começar e barra numa linha só: ' + nome + ', nos três níveis', async () => {
    const pg = await abrir(op);
    assert.equal(await pg.isVisible('#menu'), true);
    assert.equal(await pg.textContent('h1'), 'Campo Minado');
    for (const n of ['facil', 'medio', 'dificil']) {
      if (!(await pg.isVisible('#menu'))) { await pg.click('.bolinho-nav .bn-casa'); await pg.waitForSelector('#menu', { state: 'visible' }); }
      await pg.click('.nivel[data-nivel="' + n + '"]');
      await pg.waitForSelector('#jogo', { state: 'visible' });
      await pg.waitForTimeout(200);   // o ajuste fino do tamanho espera o espaço assentar
      const e = await est(pg);
      const deitado = w > h;
      assert.deepEqual([Math.min(e.l, e.c), Math.max(e.l, e.c), e.m], ESPERADO[n], n);
      assert.equal(e.c <= e.l, !deitado || e.c === e.l, 'jardim em pé na tela em pé, deitado na deitada');
      assert.equal(await pg.locator('.casa').count(), e.l * e.c);
      const m = await pg.evaluate(() => {
        const cs = [...document.querySelectorAll('.casa')].map(c => c.getBoundingClientRect());
        const tr = document.querySelector('.trilha'), ab = document.querySelector('.tela-inteira-bt:not([hidden])');
        const caixa = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
        const barra = [...document.querySelector('.barra').children].map(c => c.getBoundingClientRect());
        const a = document.getElementById('area');
        return {
          W: innerWidth, H: innerHeight, lado: Math.min(...cs.map(r => r.width)),
          esq: Math.min(...cs.map(r => r.left)), topo: Math.min(...cs.map(r => r.top)), dir: Math.max(...cs.map(r => r.right)), baixo: Math.max(...cs.map(r => r.bottom)),
          trilha: caixa(tr), aba: caixa(ab),
          linhasBarra: new Set(barra.map(r => Math.round(r.top))).size, colunasBarra: new Set(barra.map(r => Math.round(r.left + r.width / 2))).size, itensBarra: barra.length,
          barraBaixo: Math.max(...barra.map(r => r.bottom)), barraDir: Math.max(...barra.map(r => r.right)),
          rola: a.scrollWidth > a.clientWidth + 1 || a.scrollHeight > a.clientHeight + 1,
          pagina: document.documentElement.scrollWidth <= innerWidth
        };
      });
      const onde = nome + ' ' + n + ': ';
      // todas as casas dentro da tela, acima da faixa do tocador de música
      assert.ok(m.esq >= 0 && m.topo >= 0, onde + 'casa saindo pela esquerda/topo');
      assert.ok(m.dir <= m.W, onde + 'casa saindo pela direita: ' + m.dir + ' > ' + m.W);
      assert.ok(m.baixo <= m.H - RESERVA, onde + 'casa embaixo do tocador: ' + m.baixo + ' > ' + (m.H - RESERVA));
      // nem o tocador nem a abinha "Tela inteira" ficam em cima do jardim
      for (const x of [m.trilha, m.aba]) if (x) assert.ok(x.t >= m.baixo || x.r <= m.esq || x.l >= m.dir, onde + 'algo em cima do jardim ' + JSON.stringify(x));
      assert.equal(m.rola, false, onde + 'o jardim rola sem zoom');
      assert.equal(m.pagina, true, onde + 'a página rola para o lado');
      // a barra: uma linha só em cima (ou uma coluna só, à esquerda, no celular deitado)
      assert.equal(m.itensBarra, 5, '🦔 🙂 ⏱ 🚩 🔍 (o 🏠 está na barra comum)');
      if (h <= 520 && deitado) { assert.equal(m.colunasBarra, 1, onde + 'barra da esquerda em mais de uma coluna'); assert.ok(m.barraDir <= m.esq, onde + 'barra em cima do jardim'); }
      else { assert.equal(m.linhasBarra, 1, onde + 'barra quebrou em ' + m.linhasBarra + ' linhas'); assert.ok(m.barraBaixo <= m.topo, onde + 'barra em cima do jardim'); }
      // casas de pelo menos 24 px (alvo de toque mínimo); no Fácil, grandes
      assert.ok(m.lado >= 24, onde + 'casa pequena demais: ' + m.lado);
      if (n === 'facil') assert.ok(m.lado >= 34, onde + 'no Fácil a casa é grande: ' + m.lado);
    }
    assert.deepEqual(pg.erros(), []);
    assert.deepEqual(await pg.evaluate(() => window.__csp), []);
    assert.equal(await pg.locator('.trilha').count(), 1, 'tocador de música montado');
    await pg.ctx.close();
  });
}

test('Fácil: parado uns segundos, as gramas seguras piscam; um toque apaga; no Médio não pisca', async () => {
  const pg = await abrir(TELAS.celular);
  await pg.tap('#btFacil');
  await pg.tap('.casa[data-i="27"]');
  const espera = await pg.evaluate(() => CampoDebug.espera);
  assert.ok(espera >= 3000 && espera <= 5000, 'uns 4 s: ' + espera);
  assert.equal(await pg.locator('.casa.dica').count(), 0, 'logo depois do toque, nada pisca');
  await pg.waitForTimeout(espera + 600);
  const dica = await pg.evaluate(() => {
    const E = CampoDebug.estado(), certo = CampoMinado.deduzir(E).seguras;
    const pisca = [...document.querySelectorAll('.casa.dica')].map(b => +b.dataset.i);
    const anim = pisca.length ? getComputedStyle(document.querySelector('.casa.dica')).animationName : '';
    return { pisca, certo, minas: pisca.filter(i => E.cel[i].mina), fechadas: pisca.every(i => !E.cel[i].aberta && !E.cel[i].bandeira), anim };
  });
  assert.ok(dica.certo.length > 0, 'este jardim tem gramas seguras para mostrar');
  assert.deepEqual(dica.pisca, dica.certo, 'pisca exatamente as gramas que dá para garantir');
  assert.deepEqual(dica.minas, [], 'nunca pisca um ouriço');
  assert.equal(dica.fechadas, true);
  assert.equal(dica.anim, 'pisca');
  // "reduzir movimento": fica acesa parada, sem piscar
  await pg.emulateMedia({ reducedMotion: 'reduce' });
  const calmo = await pg.evaluate(() => { const s = getComputedStyle(document.querySelector('.casa.dica')); return { anim: s.animationName, sombra: s.boxShadow }; });
  assert.equal(calmo.anim, 'none'); assert.notEqual(calmo.sombra, 'none', 'brilho parado');
  await pg.emulateMedia({ reducedMotion: 'no-preference' });
  // qualquer toque apaga (até fora do jardim)
  await pg.tap('#placaRestam');
  assert.equal(await pg.locator('.casa.dica').count(), 0, 'o toque apagou a dica');
  // abrir uma grama da dica: segura, e a dica volta depois de mais uns segundos parado
  await pg.tap('.casa[data-i="' + dica.certo[0] + '"]');
  assert.equal((await est(pg)).fim === 'perdeu', false);
  // no Médio a dica não aparece
  await pg.tap('.bolinho-nav .bn-casa'); await pg.waitForSelector('#menu', { state: 'visible' });
  await pg.tap('#btMedio');
  await pg.tap('.casa[data-i="0"]');
  await pg.waitForTimeout(espera + 600);
  assert.equal(await pg.locator('.casa.dica').count(), 0, 'no Médio não tem dica');
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('celular: primeiro toque seguro, enchente, bandeirinha (botão e segurar), ganhar e recorde', async () => {
  const pg = await abrir(TELAS.celular);
  await pg.click('#btFacil');
  const meio = 27;
  await pg.tap('.casa[data-i="' + meio + '"]');
  let e = await est(pg);
  assert.equal(e.plantado, true); assert.equal(e.fim, null);
  assert.equal(e.cel[meio].mina, false); assert.ok(e.abertas > 1, 'abriu um pedaço: ' + e.abertas);
  assert.equal(await pg.locator('.casa.aberta').count(), e.abertas);
  // o número da tela é o número do motor
  const nums = await pg.evaluate(() => [...document.querySelectorAll('.casa.aberta')].map(b => [+b.dataset.i, b.textContent]));
  const motor = await pg.evaluate(() => CampoDebug.estado().cel.map(c => c.n));
  for (const [i, txt] of nums) assert.equal(txt, motor[i] ? String(motor[i]) : '');
  await pg.waitForFunction(() => +document.getElementById('tempo').textContent >= 1, null, { timeout: 3000 });

  // 🚩 modo bandeirinha: toque marca e desmarca, sem abrir
  const fechada = e.cel.findIndex(c => !c.aberta && c.mina);
  await pg.tap('#btModo');
  assert.equal(await pg.getAttribute('#btModo', 'aria-pressed'), 'true');
  await pg.tap('.casa[data-i="' + fechada + '"]');
  e = await est(pg);
  assert.equal(e.cel[fechada].bandeira, true); assert.equal(e.cel[fechada].aberta, false);
  assert.equal(await pg.textContent('#restam'), '9');
  await pg.tap('.casa[data-i="' + fechada + '"]');
  assert.equal((await est(pg)).cel[fechada].bandeira, false);
  await pg.tap('#btModo');

  // segurar o dedo marca (e soltar não abre)
  await pg.evaluate(async i => {
    const b = document.querySelector('.casa[data-i="' + i + '"]'), r = b.getBoundingClientRect();
    const o = { pointerType: 'touch', bubbles: true, clientX: r.left + 5, clientY: r.top + 5, isPrimary: true, pointerId: 7 };
    b.dispatchEvent(new PointerEvent('pointerdown', o));
    await new Promise(r => setTimeout(r, 600));
    b.dispatchEvent(new PointerEvent('pointerup', o));
    b.click();
  }, fechada);
  e = await est(pg);
  assert.equal(e.cel[fechada].bandeira, true, 'segurou: bandeirinha'); assert.equal(e.cel[fechada].aberta, false);
  assert.equal(e.fim, null);
  // toque normal numa casa com bandeirinha não abre
  await pg.tap('.casa[data-i="' + fechada + '"]');
  assert.equal((await est(pg)).cel[fechada].aberta, false);

  // abre todo o resto → ganhou
  await pg.evaluate(() => { const e = CampoDebug.estado(); e.cel.forEach((c, i) => { if (!c.mina && !c.aberta) CampoDebug.tocar(i); }); });
  await pg.waitForSelector('#fim', { state: 'visible' });
  assert.match(await pg.textContent('#fimTitulo'), /Jardim todo aberto/);
  assert.equal(await pg.isVisible('#fimRecorde'), true, 'primeira vitória é recorde');
  assert.equal(await pg.textContent('#btNovo'), '😎');
  assert.ok(await pg.locator('.tabuleiro.florido').count() === 1, 'flores no jardim');
  const pref = await pg.evaluate(() => JSON.parse(localStorage.getItem('campo-minado.pref')));
  assert.ok(pref.recordes.facil >= 1, 'recorde guardado');
  // voltar aos níveis mostra o recorde
  await pg.click('#btNiveis');
  await pg.waitForSelector('#menu', { state: 'visible' });
  assert.match(await pg.textContent('#recFacil'), /Melhor tempo/);
  assert.match(await pg.textContent('#recMedio'), /sem recorde/);
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('computador: botão direito marca, acorde e perder acordando o ouriço', async () => {
  const pg = await abrir(TELAS.computador);
  await pg.click('#btMedio');
  await pg.click('.casa[data-i="0"]');
  let e = await est(pg);
  assert.equal(e.cel[0].mina, false); assert.ok(e.abertas > 1);
  // acha um número aberto com um ouriço vizinho e faz o acorde
  const alvo = await pg.evaluate(() => {
    const E = CampoDebug.estado(), CM = window.CampoMinado;
    for (let i = 0; i < E.cel.length; i++) {
      const c = E.cel[i]; if (!c.aberta || !c.n) continue;
      const viz = CM.vizinhos(E, i), minas = viz.filter(v => E.cel[v].mina), fechadas = viz.filter(v => !E.cel[v].aberta && !E.cel[v].mina);
      if (fechadas.length) return { i, minas, fechadas };
    }
    return null;
  });
  assert.ok(alvo, 'achou um número para o acorde');
  for (const m of alvo.minas) await pg.click('.casa[data-i="' + m + '"]', { button: 'right' });
  e = await est(pg);
  for (const m of alvo.minas) assert.equal(e.cel[m].bandeira, true, 'botão direito marcou');
  await pg.click('.casa[data-i="' + alvo.i + '"]');
  e = await est(pg);
  for (const f of alvo.fechadas) assert.equal(e.cel[f].aberta, true, 'acorde abriu a vizinha ' + f);
  // botão direito de novo tira a bandeirinha
  await pg.click('.casa[data-i="' + alvo.minas[0] + '"]', { button: 'right' });
  assert.equal((await est(pg)).cel[alvo.minas[0]].bandeira, false);
  // abrir um ouriço: perdeu
  const mina = (await est(pg)).cel.findIndex(c => c.mina && !c.bandeira);
  await pg.click('.casa[data-i="' + mina + '"]');
  await pg.waitForSelector('#fim', { state: 'visible' });
  e = await est(pg);
  assert.equal(e.fim, 'perdeu');
  assert.match(await pg.textContent('#fimTitulo'), /ouriço acordou/);
  assert.equal(await pg.locator('.casa.mina').count() >= e.m - e.bandeiras, true, 'os ouriços aparecem');
  assert.equal(await pg.textContent('#btNovo'), '😵');
  // tentar de novo: jardim novo, tudo fechado, relógio zerado
  await pg.click('#btDeNovo');
  assert.equal(await pg.isVisible('#fim'), false);
  e = await est(pg);
  assert.equal(e.abertas, 0); assert.equal(e.plantado, false); assert.equal(await pg.textContent('#tempo'), '0');
  // teclado: setas andam, Enter abre, B marca
  await pg.focus('.casa[data-i="0"]');
  await pg.keyboard.press('ArrowRight'); await pg.keyboard.press('ArrowDown');
  assert.equal(await pg.evaluate(() => document.activeElement.dataset.i), String(e.c + 1));
  await pg.keyboard.press('Enter');
  e = await est(pg); assert.equal(e.cel[e.c + 1].aberta, true);
  const outra = e.cel.findIndex(c => !c.aberta);
  await pg.focus('.casa[data-i="' + outra + '"]'); await pg.keyboard.press('b');
  assert.equal((await est(pg)).cel[outra].bandeira, true);
  // Esc volta aos níveis
  await pg.keyboard.press('Escape');
  await pg.waitForSelector('#menu', { state: 'visible' });
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('inglês, ajuda e zoom', async () => {
  const pg = await abrir(TELAS.celular);
  await pg.tap('#btAjuda');
  assert.equal(await pg.isVisible('#ajuda'), true);
  assert.match(await pg.textContent('#ajuda'), /primeiro toque nunca acorda um ouriço/);
  assert.match(await pg.textContent('#ajuda'), /No Fácil, se você ficar uns segundinhos pensando/);
  await pg.tap('#btLingua');
  assert.equal(await pg.getAttribute('html', 'lang'), 'en');
  assert.equal(await pg.textContent('h1'), 'Garden Sweeper');
  assert.match(await pg.textContent('#ajuda'), /first tap never wakes a hedgehog/);
  assert.match(await pg.textContent('#ajuda'), /On Easy, if you stop to think/);
  assert.match(await pg.textContent('#btFacil'), /Easy/);
  await pg.tap('#btDificil');
  assert.equal(await pg.getAttribute('#btModo', 'aria-label'), 'Flag mode');
  assert.equal(await pg.getAttribute('#btZoom', 'aria-pressed'), 'false');
  const antes = (await pg.locator('.casa').first().boundingBox()).width;
  await pg.tap('#btZoom');
  const depois = (await pg.locator('.casa').first().boundingBox()).width;
  assert.ok(depois > antes * 1.4, 'zoom aumentou: ' + antes + ' → ' + depois);
  assert.equal(await pg.getAttribute('#btZoom', 'aria-pressed'), 'true');
  assert.equal(await pg.evaluate(() => { const a = document.getElementById('area'); return a.scrollWidth > a.clientWidth; }), true, 'jardim grande rola');
  await pg.tap('#btZoom');
  assert.equal((await pg.locator('.casa').first().boundingBox()).width, antes, 'outro toque mostra o jardim todo de novo');
  assert.equal(await pg.getAttribute('#btZoom', 'aria-pressed'), 'false');
  // a língua fica guardada
  await pg.reload(); await pg.waitForFunction(() => window.CampoDebug);
  assert.equal(await pg.textContent('h1'), 'Garden Sweeper');
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('Voltar do celular sai do jogo para os níveis', async () => {
  const pg = await abrir(TELAS.celular);
  await pg.tap('#btFacil');
  await pg.waitForSelector('#jogo', { state: 'visible' });
  await pg.goBack();
  await pg.waitForSelector('#menu', { state: 'visible' });
  assert.equal(await pg.isVisible('#jogo'), false);
  await pg.ctx.close();
});

test('sem internet: depois da primeira visita abre do aparelho', async () => {
  const pg = await abrir(TELAS.celular, base);
  await pg.evaluate(() => navigator.serviceWorker.ready);
  await pg.waitForFunction(async () => { const nome = 'campo-minado-v' + CampoDebug.versao, ks = await caches.keys(); if (!ks.includes(nome)) return false; const c = await caches.open(nome); return (await c.keys()).length >= 15; }, null, { timeout: 10000 });
  await pg.ctx.setOffline(true);
  await pg.reload();
  await pg.waitForFunction(() => window.CampoDebug && window.CampoDebug.pronto, null, { timeout: 10000 });
  assert.equal(await pg.textContent('h1'), 'Campo Minado');
  await pg.tap('#btFacil');
  await pg.tap('.casa[data-i="0"]');
  assert.ok((await est(pg)).abertas > 1, 'joga sem internet');
  await pg.ctx.close();
});
