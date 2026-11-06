// Enigmatic — a página de verdade no Chromium (Playwright), com um servidorzinho local da raiz do repositório.
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

// As palavras das cartas: nunca quebram no meio (a linha só pula num espaço), cabem dentro da carta e a letra não fica
// menor que 12 px. (Achado de 06/Nov/2026: "fu- / maça", "es- / toura", "regar a plant / a" no Galaxy S24.)
// Cada palavra é um <span class="w">: se ela tem mais de um retângulo na tela, quebrou no meio.
async function conferirPalavras(pg, nome) {
  const ruins = await pg.evaluate(() => {
    const out = [];
    for (const b of document.querySelectorAll('#lousa .carta')) {
      const cs = getComputedStyle(b), r = b.getBoundingClientRect();
      const c = { l: r.left + b.clientLeft + parseFloat(cs.paddingLeft) - 1, t: r.top + b.clientTop + parseFloat(cs.paddingTop) - 1 };
      c.r = r.left + b.clientLeft + b.clientWidth - parseFloat(cs.paddingRight) + 1; c.b = r.top + b.clientTop + b.clientHeight - parseFloat(cs.paddingBottom) + 1;
      const fora = el => { const q = el.getBoundingClientRect(); return q.left < c.l || q.right > c.r || q.top < c.t || q.bottom > c.b; };
      const pal = b.querySelector('.pal'), em = b.querySelector('.emo'), rotulo = b.getAttribute('aria-label');
      if (em && fora(em)) out.push(rotulo + ': desenho sai da carta');
      if (getComputedStyle(pal).display === 'none') continue;
      const ps = getComputedStyle(pal);
      if (pal.textContent !== rotulo) out.push(rotulo + ': texto diferente do rótulo (' + pal.textContent + ')');
      if (ps.overflowWrap !== 'normal' || ps.hyphens !== 'manual' || ps.wordBreak !== 'normal') out.push(rotulo + ': CSS deixa quebrar palavra (' + ps.overflowWrap + ', ' + ps.hyphens + ', ' + ps.wordBreak + ')');
      if (parseFloat(ps.fontSize) < 12) out.push(rotulo + ': letra pequena demais (' + ps.fontSize + ')');
      const ws = pal.querySelectorAll('.w');
      if (Array.from(ws).map(w => w.textContent).join(' ') !== rotulo) out.push(rotulo + ': nem toda palavra está num <span class="w">');
      for (const w of ws) {
        if (w.getClientRects().length !== 1) out.push(rotulo + ': "' + w.textContent + '" quebrou no meio');
        if (fora(w)) out.push(rotulo + ': "' + w.textContent + '" sai da carta');
      }
    }
    return out;
  });
  assert.deepEqual(ruins, [], nome);
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
  assert.equal((await est(pg)).n, 4, 'Difícil tem 4 pares');
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
  assert.match(await pg.textContent('#progMedio'), /⭐ 3 · 1\/66/);
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

// Todas as rodadas de todos os níveis, em PT e EN, no celular em pé (390 e 320 px) e deitado: nenhuma carta sai da
// tela e nenhuma palavra quebra no meio nem sai da carta. (Achados de 06/Nov/2026: uma palavra comprida empurrava a
// carta da direita para fora em 390 px; depois as palavras quebravam no meio com hífen.) Em 390 px confere também o
// modo 🔤 só desenhos: palavras escondidas e desenhos dentro das cartas.
test('todas as rodadas cabem na tela do celular, em pé e deitado, em português e inglês', async () => {
  for (const vp of [{ width: 390, height: 844 }, { width: 320, height: 640 }, { width: 844, height: 390 }]) {
    for (const lingua of ['pt', 'en']) {
      const pg = await abrir({ viewport: vp, hasTouch: true, isMobile: true });
      if (lingua === 'en') await pg.click('#btLingua');
      for (const n of ['facil', 'medio', 'dificil']) {
        const ids = await pg.evaluate(n => EnigmasDebug.ids(n), n);
        assert.ok(ids.length >= 30, n + ' ' + lingua + ': ' + ids.length + ' rodadas');
        for (const id of ids) {
          assert.ok(await pg.evaluate(([n, id]) => EnigmasDebug.abrir(n, id), [n, id]), 'abrir ' + id);
          await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
          const nome = vp.width + 'x' + vp.height + ' ' + lingua + ' ' + n + ' ' + id;
          await conferirLayout(pg, nome);
          await conferirPalavras(pg, nome);
          if (vp.width === 390) {
            await pg.click('#btPalavras');
            await conferirPalavras(pg, nome + ' só desenhos');
            assert.equal(await pg.evaluate(() => Array.from(document.querySelectorAll('.carta:not(.texto) .pal')).filter(p => p.offsetParent).length), 0, nome + ': palavra à vista no modo só desenhos');
            await pg.click('#btPalavras');
          }
        }
      }
      assert.deepEqual(await pg.erros(), []);
      await pg.fechar();
    }
  }
});

test('🔤 só desenhos: esconde as palavras, tocar mostra o balão com a palavra e a voz lê; o jogo lembra', async () => {
  const pg = await abrir({ hasTouch: true, isMobile: true }, () => {
    window.__falas = [];
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, get: () => ({ speak: u => window.__falas.push(u.text), cancel() {} }) });
  });
  await pg.click('#btDificil');
  assert.equal(await pg.getAttribute('#btPalavras', 'aria-pressed'), 'true', 'começa com as palavras à vista');
  const id = await pg.evaluate(() => EnigmasDebug.ids('dificil').find(i => { EnigmasDebug.abrir('dificil', i); return document.querySelector('.carta.texto'); }));
  await pg.evaluate(id => EnigmasDebug.abrir('dificil', id), id);   // uma rodada com adivinhas (cartas só de texto)
  await pg.click('#btPalavras');
  assert.equal(await pg.getAttribute('#btPalavras', 'aria-pressed'), 'false');
  const vis = await pg.evaluate(() => ({
    desenho: Array.from(document.querySelectorAll('.carta:not(.texto) .pal')).filter(p => p.offsetParent).length,
    texto: Array.from(document.querySelectorAll('.carta.texto .pal')).filter(p => p.offsetParent).length,
    cartasTexto: document.querySelectorAll('.carta.texto').length
  }));
  assert.equal(vis.desenho, 0, 'palavras das cartas com desenho escondidas');
  assert.ok(vis.cartasTexto > 0 && vis.texto === vis.cartasTexto, 'adivinha (só texto) continua com o texto');
  await conferirLayout(pg, 'só desenhos'); await conferirPalavras(pg, 'só desenhos');

  const alvo = await pg.$('.carta:not(.texto)'), palavra = await alvo.getAttribute('aria-label');
  assert.equal(await pg.isVisible('#balao'), false);
  await alvo.tap();
  assert.equal(await pg.isVisible('#balao'), true, 'tocar mostra o balão');
  assert.equal(await pg.textContent('#balao'), palavra);
  const b = await pg.evaluate(() => { const r = document.getElementById('balao').getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: innerWidth, h: innerHeight }; });
  assert.ok(b.l >= 0 && b.r <= b.w && b.t >= 0 && b.b <= b.h, 'balão dentro da tela');
  assert.ok((await pg.evaluate(() => window.__falas)).includes(palavra), 'a voz lê a palavra');
  await pg.screenshot({ path: FOTOS + 'enigmas-so-desenhos.png' });
  await pg.waitForTimeout(2300);
  assert.equal(await pg.isVisible('#balao'), false, 'o balão some sozinho');

  // com as palavras à vista não aparece balão
  await pg.click('#btPalavras');
  await alvo.tap(); await alvo.tap();
  assert.equal(await pg.isVisible('#balao'), false, 'sem balão com as palavras à vista');
  await pg.click('#btPalavras');

  // lembra a escolha
  await pg.reload(); await pg.waitForFunction(() => window.EnigmasDebug && window.EnigmasDebug.pronto);
  await pg.click('#btFacil');
  assert.equal(await pg.getAttribute('#btPalavras', 'aria-pressed'), 'false', 'lembrou o modo só desenhos');
  assert.equal(await pg.evaluate(() => Array.from(document.querySelectorAll('.carta:not(.texto) .pal')).filter(p => p.offsetParent).length), 0);
  await porToque(pg);
  await conferirRodadaCompleta(pg, 'Fácil só com desenhos');
  assert.deepEqual(await pg.erros(), []);
  await pg.fechar();
});

// v0.3.0 (achado do dono no celular, 412×915: "com quase tudo ligado vira uma bagunça"): cada risco é uma curva
// (bezier cúbica, comando C) que sai da carta na horizontal, fina, com um contorno escuro embaixo (halo) para ver quem
// passa por cima nos cruzamentos; fica no vão entre as colunas (não cobre as palavras); balança bem devagar, e com
// "reduzir movimento" fica parado. O risco que acompanha o dedo também é curva.
test('riscos de giz: curvas com halo, no vão entre as colunas, balançam devagar e param com "reduzir movimento"', async () => {
  for (const calmo of [false, true]) {
    const pg = await abrir({ viewport: { width: 412, height: 915 }, reducedMotion: calmo ? 'reduce' : 'no-preference' });
    await pg.click('#btMedio');
    const id = await pg.evaluate(() => EnigmasDebug.ids('medio').find(i => { EnigmasDebug.abrir('medio', i); return EnigmasDebug.estado().n === 7; }));
    await pg.evaluate(id => EnigmasDebug.abrir('medio', id), id);

    // arrastando: o risco solto já é curva
    const cs = await cartas(pg), a = cs.find(c => c.lado === 'e');
    await pg.mouse.move(a.x, a.y); await pg.mouse.down();
    await pg.mouse.move(a.x + 60, a.y + 120, { steps: 5 });
    const solto = await pg.getAttribute('#giz .risco.solto .traco', 'd');
    assert.match(solto, /^M[\d.\s-]+C[\d.\s-]+$/, 'risco do arraste é curva: ' + solto);
    await pg.mouse.move(a.x + 60, 5, { steps: 3 }); await pg.mouse.up();   // solta fora das cartas: apaga
    await pg.waitForTimeout(500);

    await porToque(pg);
    await esperarFesta(pg);
    await pg.waitForTimeout(600);
    const medir = () => pg.evaluate(() => {
      const svg = document.getElementById('giz').getBoundingClientRect();
      const gs = Array.from(document.querySelectorAll('#giz .risco.certo'));
      return {
        ds: gs.map(g => g.querySelector('.traco').getAttribute('d')),
        partes: gs.map(g => Array.from(g.querySelectorAll('path')).map(p => p.getAttribute('class')).join(',')),
        caixas: gs.map(g => { const b = g.querySelector('.traco').getBBox(); return { l: svg.left + b.x, r: svg.left + b.x + b.width }; }),
        esq: document.getElementById('colEsq').getBoundingClientRect().right, dir: document.getElementById('colDir').getBoundingClientRect().left
      };
    });
    const m1 = await medir();
    assert.equal(m1.ds.length, 7, 'um risco por par');
    for (const d of m1.ds) assert.match(d, /^M[\d.\s-]+C[\d.\s-]+$/, 'risco é curva: ' + d);
    for (const p of m1.partes) assert.equal(p, 'halo,po,traco', 'halo embaixo do traço');
    for (const c of m1.caixas) assert.ok(c.l >= m1.esq - 0.5 && c.r <= m1.dir + 0.5, 'risco invade as cartas: ' + JSON.stringify(c) + ' vão ' + m1.esq + '–' + m1.dir);
    // cada par numa faixa diferente: o meio das curvas não cai todo no mesmo lugar
    const meios = m1.ds.map(d => { const v = d.match(/-?[\d.]+/g).map(Number); return 0.125 * v[0] + 0.375 * v[2] + 0.375 * v[4] + 0.125 * v[6]; });
    assert.ok(Math.max(...meios) - Math.min(...meios) > 15, 'curvas todas no mesmo lugar: ' + meios.join(' '));
    if (!calmo) await pg.screenshot({ path: FOTOS + 'enigmas-riscos.png' });
    await pg.waitForTimeout(800);
    const m2 = await medir();
    if (calmo) assert.deepEqual(m2.ds, m1.ds, 'com "reduzir movimento" os riscos ficam parados');
    else {
      assert.notDeepEqual(m2.ds, m1.ds, 'os riscos balançam');
      // devagar e pouquinho: as pontas não saem do lugar e o resto mexe no máximo uns 3 px
      for (let i = 0; i < 7; i++) {
        const v1 = m1.ds[i].match(/-?[\d.]+/g).map(Number), v2 = m2.ds[i].match(/-?[\d.]+/g).map(Number);
        for (const k of [0, 1, 6, 7]) assert.ok(Math.abs(v1[k] - v2[k]) < 0.11, 'a ponta do risco mexeu');
        for (const k of [3, 5]) assert.ok(Math.abs(v1[k] - v2[k]) <= 5.1, 'balanço grande demais');
      }
    }
    assert.deepEqual(await pg.erros(), []);
    await pg.fechar();
  }
});

test('quem jogou o Difícil antigo: as rodadas feitas e as estrelas aparecem no Médio; o Difícil novo começa do zero', async () => {
  const pg = await abrir({}, () => {
    localStorage.setItem('bolinho:enigmas:progresso', JSON.stringify({
      facil: { feitas: [], estrelas: 0, rodadas: 0 }, medio: { feitas: ['medio-1q8ugsf'], estrelas: 3, rodadas: 1 },
      dificil: { feitas: ['dificil-n2ejoc', 'dificil-1cxtgc2'], estrelas: 5, rodadas: 2 } }));
  });
  assert.match(await pg.textContent('#progMedio'), /⭐ 8 · 3\/66/);
  assert.match(await pg.textContent('#progDificil'), /⭐ 0 · 0\/\d+/);
  const p = await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:enigmas:progresso')));
  assert.equal(p.v, 3, 'gravou que já levou o progresso');
  assert.deepEqual(p.medio.feitas, ['medio-1q8ugsf', 'medio-n2ejoc', 'medio-1cxtgc2']);
  assert.deepEqual(await pg.erros(), []);
  await pg.fechar();
});
