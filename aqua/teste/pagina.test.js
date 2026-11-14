// Teste da página inteira no Chromium (Playwright): node --test aqua/teste/*.test.js (rodar da raiz do kids)
// Com ?teste as animações correm 6 vezes mais rápido e o embaralhar usa um sorteio fixo.
const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');
const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg', '.md': 'text/plain' };
let ingles = false;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  // interruptor "ingles" do RootifyONE (../idioma.js): só ligado no teste do inglês
  if (p === '/solverone-dados/recursos/kids.json') { if (!ingles) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"recursos":{"ingles":{"ligado":true}}}'); return; }
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const IGNORAR = /favicon|solverone-dados/i;
let browser, base;

test.before(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/aqua/';
  browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
});
test.after(async () => { if (browser) await browser.close(); server.close(); });

const CELULAR = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 };
async function abrir(ctxOp, pref, url) {
  const ctx = await browser.newContext(Object.assign({ locale: 'pt-BR', serviceWorkers: 'block' }, ctxOp || CELULAR));
  if (pref) await ctx.addInitScript((p) => { try { if (!localStorage.getItem('aqua.pref')) localStorage.setItem('aqua.pref', JSON.stringify(p)); } catch (e) { /* sem armazenamento */ } }, pref);
  const pg = await ctx.newPage(); const erros = [];
  pg.on('console', m => { if (m.type() === 'error') erros.push(m.text() + ' @' + (m.location() && m.location().url)); });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  await pg.addInitScript(() => { window.__csp = []; document.addEventListener('securitypolicyviolation', e => window.__csp.push(e.violatedDirective + ' ' + e.blockedURI)); });
  await pg.goto(url || base + '?teste');
  await pg.waitForFunction(() => window.AquaApp);
  pg.erros = () => erros.filter(e => !IGNORAR.test(e));
  pg.ctx = ctx;
  return pg;
}
const frascos = pg => pg.evaluate(() => AquaApp.estado().frascos);
const assentar = pg => pg.evaluate(() => AquaApp.assentar());
// joga o caminho do resolvedor tocando nos frascos de verdade (com frasco embaçado, repete a jogada até a cor passar toda)
async function resolver(pg, ate) {
  await assentar(pg);
  const plano = await pg.evaluate(() => AquaMotor.plano(AquaApp.estado()));
  let n = 0;
  for (const p of plano || []) {
    const esperado = await pg.evaluate((p) => { AquaApp.assentar(); const e = AquaApp.estado(); return AquaMotor.escrito(AquaMotor.depois(e.frascos, e.cap, p[0], p[1])); }, p);
    for (let vez = 0; vez < 6; vez++) {
      await pg.click('#frasco-' + p[0]); await pg.click('#frasco-' + p[1]);
      if (await pg.evaluate((e) => AquaMotor.escrito(AquaApp.estado().frascos) === e, esperado)) break;
    }
    if (ate && ++n >= ate) return n;
  }
  return n;
}
const numeros = pg => pg.evaluate(() => ['nDesfazer', 'nDica', 'nEmbaralhar', 'nExtra'].map(id => document.getElementById(id).textContent));

test('menu: nome, três níveis, lojinha, versão, sem erro e sem pedido para fora', async () => {
  const pg = await abrir();
  const fora = [];
  pg.on('request', r => { if (!r.url().startsWith(base.replace('/aqua/', '/'))) fora.push(r.url()); });
  assert.equal(await pg.isVisible('#menu'), true);
  assert.equal(await pg.getAttribute('h1', 'aria-label'), 'AQUA');
  assert.equal((await pg.textContent('h1')).trim(), 'AQUA');
  for (const id of ['#btFacil', '#btMedio', '#btDificil', '#btLoja']) assert.ok(await pg.isVisible(id), id);
  assert.match(await pg.textContent('#recFacil'), /Fase 1/);
  assert.match(await pg.textContent('#versao'), /Versão 0\.1\.0 · 14\/Nov\/2026/);
  assert.match(await pg.textContent('#versao'), /sem anúncios e sem compras/);
  assert.equal(await pg.evaluate(() => getComputedStyle(document.getElementById('btLingua')).display), 'none', 'sem o interruptor, só português');
  await pg.click('#btAjuda'); assert.ok(await pg.isVisible('#ajuda'));
  assert.match(await pg.textContent('#ajuda'), /nunca custam nada/);
  await pg.waitForTimeout(600);
  assert.deepEqual(fora.filter(u => !/solverone-dados/.test(u)), [], 'pedidos para fora');
  assert.deepEqual(await pg.evaluate(() => window.__csp), []);
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('jogar: toque levanta, toque em outro despeja; jogada que não pode não muda nada', async () => {
  const pg = await abrir();
  await pg.click('#btFacil');
  await pg.waitForFunction(() => AquaApp.tela() === 'jogo' && AquaApp.lay());
  const antes = await frascos(pg);
  assert.equal(antes.length, 5, 'fácil fase 1: 3 cores + 2 vazios');
  assert.equal(await pg.locator('.frasco').count(), 5);
  assert.match(await pg.getAttribute('#frasco-0', 'aria-label'), /^Frasco 1: de cima para baixo: /);
  assert.match(await pg.getAttribute('#frasco-4', 'aria-label'), /vazio/);
  // frasco vazio sem nada levantado: nada acontece
  await pg.click('#frasco-4'); assert.deepEqual(await frascos(pg), antes);
  // levanta o 1 e solta
  await pg.click('#frasco-0'); assert.equal(await pg.getAttribute('#frasco-0', 'aria-pressed'), 'true');
  assert.match(await pg.getAttribute('#frasco-0', 'aria-label'), /levantado/);
  await pg.click('#frasco-0'); assert.equal(await pg.getAttribute('#frasco-0', 'aria-pressed'), 'false');
  // despeja no vazio: a cor de cima (todas as iguais juntas) passa
  const topo = antes[0][antes[0].length - 1]; let k = 0; while (antes[0][antes[0].length - 1 - k] === topo) k++;
  await pg.click('#frasco-0'); await pg.click('#frasco-3');
  assert.ok(await pg.evaluate(() => AquaApp.animando()) >= 1, 'o despejo é animado');
  const depois = await frascos(pg);
  assert.deepEqual(depois[3], new Array(k).fill(topo)); assert.equal(depois[0].length, antes[0].length - k);
  await assentar(pg);
  // em cima de cor diferente não despeja (passa a levantar o outro frasco)
  const outro = [1, 2].find(i => depois[i][depois[i].length - 1] !== depois[3][depois[3].length - 1]);
  await pg.click('#frasco-3'); await pg.click('#frasco-' + outro);
  assert.deepEqual(await frascos(pg), depois);
  assert.equal(await pg.getAttribute('#frasco-' + outro, 'aria-pressed'), 'true');
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('fase inteira sem ajuda: rolha nos frascos, 3 estrelas, 30 gotinhas, próxima fase liberada e guardada', async () => {
  const pg = await abrir();
  await pg.click('#btFacil');
  await pg.waitForFunction(() => AquaApp.lay());
  await resolver(pg);
  await pg.waitForSelector('#fim:not([hidden])', { timeout: 5000 });
  assert.equal(await pg.locator('#fimEstrelas .acesa').count(), 3);
  assert.equal(await pg.textContent('#fimTitulo'), 'Perfeito!');
  assert.match(await pg.textContent('#fimGotas'), /\+30 gotinhas/);
  assert.equal(await pg.textContent('#gotasJogo'), '30');
  for (let i = 0; i < 5; i++) assert.match(await pg.getAttribute('#frasco-' + i, 'aria-label'), /pronto, todo |vazio/);
  const guardado = await pg.evaluate(() => JSON.parse(localStorage.getItem('aqua.pref')));
  assert.equal(guardado.fase.facil, 2); assert.deepEqual(guardado.estrelas.facil, [3]); assert.equal(guardado.gotas, 30);
  // próxima fase
  await pg.click('#btProxima');
  assert.equal(await pg.isVisible('#fim'), false);
  assert.equal(await pg.textContent('#placaFase'), 'Fase 2');
  assert.equal(await pg.evaluate(() => AquaApp.fase()), 2);
  // de volta ao menu, o cartão do nível mostra a fase e as estrelas
  await pg.click('.bolinho-nav .bn-casa'); await pg.waitForSelector('#menu', { state: 'visible' });
  assert.match(await pg.textContent('#recFacil'), /Fase 2 · ⭐ 3/);
  assert.equal(await pg.textContent('#gotasMenuN'), '30');
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('ajudas do médio: contadores, desfazer, dica com caminho fixo, frasco extra, embaralhar, recomeçar e estrelas', async () => {
  const pg = await abrir(null, { fase: { facil: 1, medio: 9, dificil: 1 } });
  await pg.click('#btMedio');
  await pg.waitForFunction(() => AquaApp.lay());
  assert.equal(await pg.textContent('#placaFase'), 'Fase 9');
  assert.deepEqual(await numeros(pg), ['5', '3', '2', '1']);
  const ini = await frascos(pg);
  assert.equal(ini.length, 8, 'médio fase 9: 6 cores + 2 vazios');
  assert.equal(await pg.evaluate(() => AquaApp.estado().cobertos.length), 1, 'um frasco embaçado');
  const cob = await pg.evaluate(() => AquaApp.estado().cobertos[0]);
  assert.match(await pg.getAttribute('#frasco-' + cob, 'aria-label'), /escondida, escondida, escondida$/);
  // desfazer sem jogada: avisa e não gasta
  await pg.click('#btDesfazer'); assert.match(await pg.textContent('#aviso'), /Ainda não tem jogada/); assert.deepEqual(await numeros(pg), ['5', '3', '2', '1']);
  // duas jogadas e um desfazer
  await resolver(pg, 2); await assentar(pg);
  const dois = await frascos(pg);
  await pg.click('#btDesfazer');
  assert.notDeepEqual(await frascos(pg), dois); assert.deepEqual(await numeros(pg), ['4', '3', '2', '1']);
  // dica: mostra de onde para onde, gasta uma; seguir a dica até o fim nunca volta atrás
  await pg.click('#btDica');
  const d1 = await pg.evaluate(() => AquaApp.dica());
  assert.ok(Array.isArray(d1) && d1.length === 2); assert.match(await pg.textContent('#aviso'), /Despeje o frasco \d+ no frasco \d+\./);
  assert.deepEqual(await numeros(pg), ['4', '2', '2', '1']);
  await pg.click('#frasco-' + d1[0]); await pg.click('#frasco-' + d1[1]); await assentar(pg);
  assert.equal(await pg.evaluate(() => AquaApp.dica()), null, 'a dica some depois da jogada');
  // frasco extra
  await pg.click('#btExtra');
  assert.equal((await frascos(pg)).length, 9); assert.equal(await pg.locator('.frasco').count(), 9);
  assert.deepEqual(await numeros(pg), ['4', '2', '2', '0']);
  await pg.click('#btExtra'); assert.match(await pg.textContent('#aviso'), /Acabaram os frascos extras desta fase/); assert.equal((await frascos(pg)).length, 9);
  // desfazer depois do frasco extra: o frasco continua lá
  await pg.click('#btDesfazer'); assert.equal((await frascos(pg)).length, 9);
  // embaralhar: mesmas gotas, outra arrumação, ainda com solução
  const antes = await frascos(pg);
  await pg.click('#btEmbaralhar');
  const emb = await frascos(pg);
  assert.notDeepEqual(emb, antes); assert.deepEqual(emb.flat().sort(), antes.flat().sort());
  assert.ok(await pg.evaluate(() => !!AquaMotor.plano(AquaApp.estado())), 'embaralhado tem solução');
  assert.deepEqual(await numeros(pg), ['3', '2', '1', '0']);
  // termina: usou embaralhar e extra = 1 estrela, 10 gotinhas
  await resolver(pg);
  await pg.waitForSelector('#fim:not([hidden])', { timeout: 5000 });
  assert.equal(await pg.locator('#fimEstrelas .acesa').count(), 1);
  assert.match(await pg.textContent('#fimGotas'), /\+10 gotinhas/);
  // jogar esta de novo: as ajudas voltam cheias; sem ajuda agora vale 3 estrelas (+20 de melhora)
  await pg.click('#btDeNovo');
  assert.deepEqual(await numeros(pg), ['5', '3', '2', '1']); assert.deepEqual(await frascos(pg), ini);
  // recomeçar no meio
  await resolver(pg, 3); await pg.click('#btReiniciar'); assert.deepEqual(await frascos(pg), ini);
  await resolver(pg);
  await pg.waitForSelector('#fim:not([hidden])', { timeout: 5000 });
  assert.equal(await pg.locator('#fimEstrelas .acesa').count(), 3);
  assert.match(await pg.textContent('#fimGotas'), /\+20 gotinhas/);
  const g = await pg.evaluate(() => JSON.parse(localStorage.getItem('aqua.pref')));
  assert.equal(g.gotas, 30); assert.equal(g.estrelas.medio[8], 3); assert.equal(g.fase.medio, 10);
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('fácil: desfazer e dica sem limite; a dica aparece sozinha depois de um tempo parado e não tira estrela', async () => {
  const pg = await abrir(null, null, base);          // sem ?teste: velocidade de verdade
  await pg.click('#btFacil');
  await pg.waitForFunction(() => AquaApp.lay());
  assert.deepEqual(await numeros(pg), ['∞', '∞', '3', '2']);
  await pg.waitForFunction(() => AquaApp.dica(), null, { timeout: 15000 });
  assert.deepEqual(await pg.evaluate(() => AquaApp.usos()), { desfazer: 0, dica: 0, embaralhar: 0, extra: 0 });
  const d = await pg.evaluate(() => AquaApp.dica());
  await pg.click('#frasco-' + d[0]);
  assert.equal(await pg.evaluate(() => AquaApp.dica()), null, 'qualquer toque apaga a dica que veio sozinha');
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('travou: sem jogada possível o jogo avisa e chama as ajudas', async () => {
  const pg = await abrir();
  await pg.click('#btFacil');
  await pg.waitForFunction(() => AquaApp.lay());
  // arruma na mão uma situação que fica sem saída depois de uma jogada (tudo cheio e nenhuma cor de cima combina)
  await pg.evaluate(() => { const e = AquaApp.estado(); e.frascos = [[0, 1, 0], [1, 0, 1], [0, 1], [1, 2, 1], [0, 0, 1]]; e.vistos = e.frascos.map(f => f.map(() => true)); });
  await pg.click('#frasco-3'); await pg.click('#frasco-2'); await assentar(pg);
  assert.match(await pg.textContent('#aviso'), /Travou!/);
  assert.ok(await pg.evaluate(() => document.getElementById('btExtra').classList.contains('chama')));
  await pg.click('#btDica'); assert.match(await pg.textContent('#aviso'), /não dá mais para terminar/);
  assert.deepEqual(await numeros(pg), ['∞', '∞', '3', '2'], 'dica que não pôde ajudar não gasta');
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('lojinha de brincadeira: sem gotinha não leva; com gotinha troca, usa, e o jogo fica com o frasco e o cenário novos', async () => {
  const pg = await abrir(null, { gotas: 150 });
  await pg.click('#btLoja'); await pg.waitForSelector('#loja', { state: 'visible' });
  assert.equal(await pg.textContent('#gotasLoja'), '150');
  assert.equal(await pg.locator('#lojaFrascos .item').count(), 6); assert.equal(await pg.locator('#lojaCenarios .item').count(), 4);
  assert.match(await pg.textContent('#loja'), /nada custa dinheiro/);
  assert.match(await pg.textContent('#item-tubinho'), /em uso/);
  await pg.click('#item-foguete');                       // 240: não dá
  assert.equal(await pg.textContent('#gotasLoja'), '150'); assert.match(await pg.textContent('#item-foguete'), /faltam 90/);
  await pg.click('#item-potinho');                       // 60
  assert.equal(await pg.textContent('#gotasLoja'), '90'); assert.match(await pg.textContent('#item-potinho'), /em uso/); assert.match(await pg.textContent('#item-tubinho'), /usar/);
  await pg.click('#item-mar');                           // 80
  assert.equal(await pg.textContent('#gotasLoja'), '10'); assert.match(await pg.textContent('#item-mar'), /em uso/);
  await pg.click('#item-tubinho'); assert.equal(await pg.textContent('#gotasLoja'), '10', 'voltar para o que já tem não custa nada');
  await pg.click('#item-potinho');
  const g = await pg.evaluate(() => JSON.parse(localStorage.getItem('aqua.pref')));
  assert.equal(g.gotas, 10); assert.equal(g.frasco, 'potinho'); assert.equal(g.cenario, 'mar'); assert.deepEqual(g.tem.frascos.sort(), ['potinho', 'tubinho']);
  await pg.click('#btLojaVoltar'); await pg.waitForSelector('#menu', { state: 'visible' });
  await pg.click('#btFacil'); await pg.waitForFunction(() => AquaApp.lay());
  assert.ok(await pg.evaluate(() => document.getElementById('jogo').classList.contains('cen-mar')));
  assert.equal(await pg.evaluate(() => AquaApp.lay().md.modelo), 'potinho');
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

// telas onde tudo tem de caber: celular pequeno, celular em pé e deitado, tablet Fire, computador
const TAMANHOS = [[360, 640], [390, 844], [412, 915], [844, 390], [915, 412], [800, 1280], [1280, 800], [1366, 768]];
for (const [w, h] of TAMANHOS) {
  test('cabe na tela ' + w + '×' + h + ': todos os frascos e as ajudas à vista, sem rolar, nos três níveis (fases adiantadas)', async () => {
    const pg = await abrir({ viewport: { width: w, height: h }, hasTouch: w < 1366, isMobile: w <= 915, deviceScaleFactor: 1 }, { fase: { facil: 40, medio: 40, dificil: 60 } });
    for (const n of ['facil', 'medio', 'dificil']) {
      if (!(await pg.isVisible('#menu'))) { await pg.click('.bolinho-nav .bn-casa'); await pg.waitForSelector('#menu', { state: 'visible' }); }
      await pg.click('.nivel[data-nivel="' + n + '"]');
      await pg.waitForFunction(() => AquaApp.tela() === 'jogo' && AquaApp.lay());
      await pg.click('#btExtra'); await pg.waitForTimeout(250);            // o pior caso: com o frasco extra
      const r = await pg.evaluate(() => {
        const cx = (e) => { const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
        return { sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, frascos: [...document.querySelectorAll('.frasco')].map(cx),
          ajudas: [...document.querySelectorAll('.aj')].map(cx), barra: [...document.querySelectorAll('#jogo .barra > *')].map(cx), nav: cx(document.querySelector('.bolinho-nav')), s: AquaApp.lay().s };
      });
      const onde = n + ' ' + w + '×' + h;
      assert.ok(r.sw <= w && r.sh <= h, onde + ': a página rola');
      assert.equal(r.frascos.length, n === 'dificil' ? 15 : n === 'medio' ? 11 : 8, onde);
      for (const b of r.frascos.concat(r.ajudas, r.barra)) assert.ok(b.l >= -0.5 && b.t >= -0.5 && b.r <= w + 0.5 && b.b <= h + 0.5, onde + ': algo fora da tela ' + JSON.stringify(b));
      for (const b of r.frascos) assert.ok(b.w >= 40 && b.h >= 44, onde + ': frasco pequeno demais para o dedo ' + JSON.stringify(b));
      for (const b of r.ajudas) assert.ok(b.w >= 44 && b.h >= 44, onde + ': ajuda menor que 44 px');
      // os frascos não ficam um em cima do outro, nem embaixo das ajudas, da barra ou do 🏠/🚪
      const cruza = (a, b) => Math.min(a.r, b.r) - Math.max(a.l, b.l) > 1 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 1;
      for (let i = 0; i < r.frascos.length; i++) {
        for (let j = i + 1; j < r.frascos.length; j++) assert.ok(!cruza(r.frascos[i], r.frascos[j]), onde + ': frascos ' + i + ' e ' + j + ' se cruzam');
        for (const b of r.ajudas.concat(r.barra, [r.nav])) assert.ok(!cruza(r.frascos[i], b), onde + ': frasco ' + i + ' embaixo de um botão');
      }
      for (const b of r.barra) assert.ok(!cruza(b, r.nav), onde + ': a barra do jogo embaixo do 🏠/🚪');
      assert.ok(r.s >= 0.5, onde + ': frascos encolhidos demais (escala ' + r.s.toFixed(2) + ')');
    }
    assert.deepEqual(pg.erros(), []);
    await pg.ctx.close();
  });
}

test('girar o celular no meio da fase: os frascos se arrumam de novo e o jogo continua igual', async () => {
  const pg = await abrir(null, { fase: { facil: 1, medio: 20, dificil: 1 } });
  await pg.click('#btMedio'); await pg.waitForFunction(() => AquaApp.lay());
  await resolver(pg, 4); await assentar(pg);
  const antes = await frascos(pg), l1 = await pg.evaluate(() => AquaApp.lay().casas.map(c => c.l));
  await pg.setViewportSize({ width: 844, height: 390 }); await pg.waitForTimeout(500);
  const l2 = await pg.evaluate(() => AquaApp.lay().casas.map(c => c.l));
  assert.deepEqual(await frascos(pg), antes);
  assert.ok(Math.max(...l1) > Math.max(...l2), 'deitado usa menos fileiras');
  await resolver(pg); await pg.waitForSelector('#fim:not([hidden])', { timeout: 5000 });
  const c = await pg.evaluate(() => { const b = document.querySelector('#fim .cartao').getBoundingClientRect(); const p = document.getElementById('btProxima').getBoundingClientRect(); return { t: b.top, b: b.bottom, pt: p.top, pb: p.bottom }; });
  assert.ok(c.pt >= 0 && c.pb <= 390, 'o botão Próxima fase aparece inteiro com o celular deitado');
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('desenho: o canvas pinta os líquidos (não fica em branco) e o despejo mexe a imagem', async () => {
  const pg = await abrir({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }, null, base);
  await pg.click('#btFacil'); await pg.waitForFunction(() => AquaApp.lay()); await pg.waitForTimeout(300);
  const pintado = () => pg.evaluate(() => { const c = document.getElementById('palco'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0, soma = 0; for (let i = 3; i < d.length; i += 16) if (d[i] > 200) { n++; soma += d[i - 3] * 3 + d[i - 2] * 5 + d[i - 1] * 7; } return { n, soma }; });
  const a = await pintado();
  assert.ok(a.n > 2000, 'canvas quase vazio: ' + a.n);
  const p = await pg.evaluate(() => AquaMotor.plano(AquaApp.estado())[0]);
  await pg.click('#frasco-' + p[0]); await pg.click('#frasco-' + p[1]); await pg.waitForTimeout(450);
  assert.ok(await pg.evaluate(() => AquaApp.animando()) === 1, 'no meio do despejo');
  const b = await pintado();
  assert.notEqual(b.soma, a.soma);
  await pg.waitForFunction(() => AquaApp.animando() === 0, null, { timeout: 5000 });
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('teclado: Tab chega nos frascos e Enter joga', async () => {
  const pg = await abrir({ viewport: { width: 1280, height: 800 } });
  await pg.click('#btFacil'); await pg.waitForFunction(() => AquaApp.lay());
  const antes = await frascos(pg);
  await pg.focus('#frasco-0'); await pg.keyboard.press('Enter');
  assert.equal(await pg.getAttribute('#frasco-0', 'aria-pressed'), 'true');
  await pg.focus('#frasco-3'); await pg.keyboard.press('Enter');
  assert.notDeepEqual(await frascos(pg), antes);
  await pg.ctx.close();
});

test('sons gravados: o jogo carrega as gravações da pasta sons/ no primeiro toque', async () => {
  const pg = await abrir();
  await pg.click('#btFacil'); await pg.waitForFunction(() => AquaApp.lay());
  await pg.waitForFunction(() => AquaSom.carregadas().length >= 6, null, { timeout: 8000 });
  assert.deepEqual((await pg.evaluate(() => AquaSom.carregadas())).sort(), ['aplausos', 'brilho', 'despejar', 'erro', 'glub', 'rolha', 'vidro']);
  await pg.ctx.close();
});

test('inglês só com o interruptor "ingles" ligado: aí o botão de idioma aparece e troca os textos', async () => {
  ingles = true;
  try {
    const pg = await abrir({ viewport: { width: 390, height: 844 }, locale: 'pt-BR' });
    await pg.waitForFunction(() => !document.documentElement.classList.contains('sem-ingles'), null, { timeout: 8000 });
    await pg.click('#btLingua');
    assert.equal(await pg.getAttribute('html', 'lang'), 'en');
    assert.match(await pg.textContent('.sub'), /Pour the colors/);
    assert.match(await pg.textContent('#recFacil'), /Stage 1/);
    await pg.click('#btFacil'); await pg.waitForFunction(() => AquaApp.lay());
    assert.equal(await pg.textContent('#placaFase'), 'Stage 1');
    assert.match(await pg.getAttribute('#frasco-0', 'aria-label'), /^Bottle 1: top to bottom: /);
    assert.deepEqual(pg.erros(), []);
    await pg.ctx.close();
  } finally { ingles = false; }
});

test('sem internet: depois da primeira visita o jogo abre e joga pela cópia guardada (service worker)', async () => {
  const ctx = await browser.newContext({ locale: 'pt-BR', viewport: { width: 390, height: 844 } });
  const pg = await ctx.newPage(); const erros = [];
  pg.on('pageerror', e => erros.push(e.message));
  await pg.goto(base + '?teste');
  await pg.evaluate(() => navigator.serviceWorker.ready);
  await pg.waitForFunction(async () => { const ks = await caches.keys(); const k = ks.find(x => x.indexOf('aqua-v') === 0); if (!k) return false; const c = await caches.open(k); return (await c.keys()).length >= 20; }, null, { timeout: 15000 });
  await ctx.setOffline(true);
  await pg.reload(); await pg.waitForFunction(() => window.AquaApp);
  assert.equal((await pg.textContent('h1')).trim(), 'AQUA');
  await pg.click('#btFacil'); await pg.waitForFunction(() => AquaApp.lay());
  const p = await pg.evaluate(() => AquaMotor.plano(AquaApp.estado())[0]);
  await pg.click('#frasco-' + p[0]); await pg.click('#frasco-' + p[1]);
  await pg.waitForFunction(() => AquaSom.carregadas().length >= 6, null, { timeout: 8000 });   // os efeitos também vêm da cópia
  assert.deepEqual(erros, []);
  await ctx.close();
});
