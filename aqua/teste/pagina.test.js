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
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
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
  assert.match(await pg.textContent('#versao'), /Versão 0\.3\.0 · 14\/Nov\/2026/);
  assert.match(await pg.textContent('#versao'), /sem anúncios e sem compras/);
  assert.equal(await pg.$('#btLingua'), null, 'o idioma é escolhido só na estante');
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

test('lojinha de brincadeira: frascos trocam e ficam em uso; cenários são pacotes de cenas que entram no carrossel do fundo', async () => {
  const pg = await abrir(null, { gotas: 150 });
  await pg.click('#btLoja'); await pg.waitForSelector('#loja', { state: 'visible' });
  assert.equal(await pg.textContent('#gotasLoja'), '150');
  assert.equal(await pg.locator('#lojaFrascos .item').count(), 6); assert.equal(await pg.locator('#lojaCenarios .item').count(), 3, 'três pacotes: mar, junina e espaço');
  assert.match(await pg.textContent('#loja'), /nada custa dinheiro/);
  assert.match(await pg.textContent('#loja'), /10 cenas já vêm de graça/);
  assert.match(await pg.textContent('#item-tubinho'), /em uso/);
  await pg.click('#item-foguete');                       // 240: não dá
  assert.equal(await pg.textContent('#gotasLoja'), '150'); assert.match(await pg.textContent('#item-foguete'), /faltam 90/);
  await pg.click('#item-potinho');                       // 60
  assert.equal(await pg.textContent('#gotasLoja'), '90'); assert.match(await pg.textContent('#item-potinho'), /em uso/); assert.match(await pg.textContent('#item-tubinho'), /usar/);
  assert.match(await pg.textContent('#item-mar'), /Recife de corais · Peixes e tartarugas/);
  await pg.click('#item-mar');                           // 80
  assert.equal(await pg.textContent('#gotasLoja'), '10'); assert.match(await pg.textContent('#item-mar'), /no carrossel/);
  await pg.click('#item-mar'); assert.equal(await pg.textContent('#gotasLoja'), '10', 'pacote que já tem não cobra de novo');
  await pg.click('#item-junina'); assert.equal(await pg.textContent('#gotasLoja'), '10'); assert.match(await pg.textContent('#item-junina'), /faltam 140/);
  const g = await pg.evaluate(() => JSON.parse(localStorage.getItem('aqua.pref')));
  assert.equal(g.gotas, 10); assert.equal(g.frasco, 'potinho'); assert.deepEqual(g.tem.frascos.sort(), ['potinho', 'tubinho']); assert.deepEqual(g.tem.cenarios.sort(), ['chuva', 'mar']);
  assert.equal(g.cenario, undefined);
  await pg.click('#btLojaVoltar'); await pg.waitForSelector('#menu', { state: 'visible' });
  await pg.click('#btFacil'); await pg.waitForFunction(() => AquaApp.lay());
  const cenas = await pg.evaluate(() => AquaApp.cenas());
  assert.equal(cenas.length, 12, '10 de graça + 2 do Fundo do mar');
  assert.ok(cenas.includes('recife') && cenas.includes('mar') && !cenas.includes('junina'));
  assert.equal(await pg.evaluate(() => AquaApp.lay().md.modelo), 'potinho');
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('fundo em carrossel: 10 cenas de graça, foto e desenho alternados; fechar um frasco troca a cena com transição', async () => {
  const pg = await abrir();
  await pg.click('#btFacil'); await pg.waitForFunction(() => AquaApp.lay());
  const cenas = await pg.evaluate(() => AquaApp.cenas());
  assert.deepEqual(cenas, ['cachoeira', 'chuva', 'praia', 'jardim', 'flores', 'vagalumes', 'floresta', 'montanhas', 'baloes', 'nuvens']);
  const tipos = await pg.evaluate((cs) => cs.map(c => AquaFundo.cena(c).tipo), cenas);
  for (let i = 0; i < tipos.length; i++) assert.equal(tipos[i], i % 2 ? 'desenho' : 'foto');
  const primeira = await pg.evaluate(() => AquaApp.cena());
  assert.equal(primeira, cenas[3], 'fácil fase 1 começa na cena 3 (fase × 3)');
  assert.equal(await pg.locator('#cenario .cn-camada').count(), 1);
  // joga até fechar o primeiro frasco
  await assentar(pg);
  const plano = await pg.evaluate(() => AquaMotor.plano(AquaApp.estado()));
  let fechou = false;
  for (const p of plano) {
    await pg.click('#frasco-' + p[0]); await pg.click('#frasco-' + p[1]); await assentar(pg);
    if (await pg.evaluate((c) => AquaApp.cena() !== c, primeira)) { fechou = true; break; }
  }
  assert.ok(fechou, 'fechar um frasco trocou a cena');
  assert.equal(await pg.evaluate(() => AquaApp.cena()), cenas[4]);
  assert.equal(await pg.locator('#cenario .cn-camada').count(), 2, 'as duas cenas juntas durante a transição');
  await pg.waitForFunction(() => document.querySelectorAll('#cenario .cn-camada').length === 1, null, { timeout: 3000 });
  assert.equal(await pg.getAttribute('#cenario .cn-camada', 'data-cena'), cenas[4]);
  // o fundo nunca pega o toque: no meio de cada frasco quem responde é o botão do frasco
  const tocaFrasco = await pg.evaluate(() => [...document.querySelectorAll('.frasco')].every(b => { const r = b.getBoundingClientRect(); return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === b; }));
  assert.ok(tocaFrasco);
  assert.equal(await pg.evaluate(() => getComputedStyle(document.getElementById('cenario')).pointerEvents), 'none');
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('fundo: cada cena aparece, as fotos carregam e os desenhos pintam alguma coisa (16 cenas, com todos os pacotes)', async () => {
  const pg = await abrir({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }, { tem: { frascos: [], cenarios: ['mar', 'junina', 'espaco'] } });
  await pg.click('#btMedio'); await pg.waitForFunction(() => AquaApp.lay());
  const cenas = await pg.evaluate(() => AquaApp.cenas());
  assert.equal(cenas.length, 16);
  for (const id of cenas) {
    await pg.evaluate((id) => AquaFundo.mostrar(id, false), id);
    const tipo = await pg.evaluate((id) => AquaFundo.cena(id).tipo, id);
    if (tipo === 'foto') {
      await pg.waitForFunction(() => { const i = document.querySelector('#cenario .cn-camada:last-of-type img'); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 8000 })
        .catch(() => assert.fail(id + ': a foto não carregou'));
      const larg = await pg.evaluate(() => document.querySelector('#cenario .cn-camada:last-of-type img').naturalWidth);
      assert.ok(larg >= 900, id + ': foto pequena demais (' + larg + ')');
    } else {
      const cores = await pg.evaluate(() => { const c = document.querySelector('#cenario .cn-camada:last-of-type canvas'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; const s = new Set(); for (let i = 0; i < d.length; i += 400) s.add(d[i] >> 4 << 8 | d[i + 1] >> 4 << 4 | d[i + 2] >> 4); return s.size; });
      assert.ok(cores > 25, id + ': desenho quase vazio (' + cores + ' cores)');
    }
  }
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('reduzir movimento: a cena troca na hora, sem transição, sem zoom e sem partículas', async () => {
  const pg = await abrir(Object.assign({}, CELULAR, { reducedMotion: 'reduce' }));
  await pg.click('#btFacil'); await pg.waitForFunction(() => AquaApp.lay());
  await pg.evaluate(() => AquaFundo.mostrar('cachoeira', true));
  assert.equal(await pg.locator('#cenario .cn-camada').count(), 1, 'trocou sem transição');
  assert.equal(await pg.evaluate(() => getComputedStyle(document.querySelector('#cenario img')).animationName), 'none');
  await pg.waitForTimeout(600);
  assert.equal(await pg.evaluate(() => AquaFundo.particulas()), 0);
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

// o idioma vem da estante (../idioma.js, localStorage "bolinho:idioma"): o jogo não tem botão de idioma próprio
async function abrirEm(lingua, ctxOp) {
  const ctx = await browser.newContext(Object.assign({ locale: 'pt-BR', serviceWorkers: 'block' }, ctxOp || CELULAR));
  await ctx.addInitScript((c) => { try { localStorage.setItem('bolinho:idioma', c); } catch (e) { /* sem armazenamento */ } }, lingua);
  const pg = await ctx.newPage(); const erros = [];
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  await pg.goto(base + '?teste'); await pg.waitForFunction(() => window.AquaApp);
  pg.erros = () => erros; pg.ctx = ctx;
  return pg;
}
test('inglês escolhido na estante: o jogo abre em inglês, sem botão de idioma', async () => {
  const pg = await abrirEm('en');
  assert.equal(await pg.getAttribute('html', 'lang'), 'en');
  assert.equal(await pg.$('#btLingua'), null);
  assert.match(await pg.textContent('.sub'), /Pour the colors/);
  assert.match(await pg.textContent('#recFacil'), /Stage 1/);
  assert.match(await pg.textContent('#versao'), /Version 0\.2\.0 · Nov\/14\/2026/);
  await pg.click('#btFacil'); await pg.waitForFunction(() => AquaApp.lay());
  assert.equal(await pg.textContent('#placaFase'), 'Stage 1');
  assert.match(await pg.getAttribute('#frasco-0', 'aria-label'), /^Bottle 1: top to bottom: /);
  assert.equal(await pg.getAttribute('#btDica', 'aria-label'), 'Hint: shows a good move (no limit)');
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});
test('espanhol escolhido na estante: menu, jogo, ajudas, fim de fase e lojinha em espanhol', async () => {
  const pg = await abrirEm('es');
  assert.equal(await pg.getAttribute('html', 'lang'), 'es');
  assert.match(await pg.textContent('.sub'), /Pasa los colores/);
  assert.equal(await pg.textContent('#btFacil .n-nome'), '🫧 Fácil');
  assert.equal(await pg.textContent('#btMedio .n-nome'), '🧪 Medio');
  assert.match(await pg.textContent('#recFacil'), /Fase 1/);
  assert.match(await pg.textContent('#versao'), /Versión 0\.2\.0 · 14\/nov\/2026 · Música: .* sin anuncios y sin compras/);
  assert.equal(await pg.getAttribute('#btAjuda', 'aria-label'), 'Cómo jugar');
  await pg.click('#btAjuda'); assert.match(await pg.textContent('#ajuda'), /Nunca cuestan nada/);
  await pg.click('#btFacil'); await pg.waitForFunction(() => AquaApp.lay());
  assert.equal(await pg.getAttribute('#placaFase', 'aria-label'), 'Nivel Fácil, fase 1');
  assert.match(await pg.getAttribute('#frasco-0', 'aria-label'), /^Frasco 1: de arriba abajo: /);
  assert.equal(await pg.getAttribute('#btDica', 'aria-label'), 'Pista: muestra una buena jugada (sin límite)');
  await pg.click('#btDesfazer'); assert.match(await pg.textContent('#aviso'), /Todavía no hay ninguna jugada/);
  await resolver(pg);
  await pg.waitForSelector('#fim:not([hidden])');
  assert.equal(await pg.textContent('#fimTitulo'), '¡Perfecto!');
  assert.match(await pg.textContent('#fimGotas'), /gotitas$/);
  assert.equal(await pg.textContent('#btProxima'), 'Siguiente fase ▶');
  await pg.click('#btNiveis'); await pg.click('#btLoja');
  assert.match(await pg.textContent('#lojaCenarios'), /Tarde de lluvia.*en uso/);
  assert.match(await pg.textContent('#lojaFrascos'), /Tubito/);
  assert.deepEqual(pg.erros(), []);
  await pg.ctx.close();
});

test('sem internet: depois da primeira visita o jogo abre e joga pela cópia guardada (service worker)', async () => {
  const ctx = await browser.newContext({ locale: 'pt-BR', viewport: { width: 390, height: 844 } });
  const pg = await ctx.newPage(); const erros = [];
  pg.on('pageerror', e => erros.push(e.message));
  await pg.goto(base + '?teste');
  await pg.evaluate(() => navigator.serviceWorker.ready);
  await pg.waitForFunction(async () => { const ks = await caches.keys(); const k = ks.find(x => x.indexOf('aqua-v') === 0); if (!k) return false; const c = await caches.open(k); return (await c.keys()).length >= 30; }, null, { timeout: 15000 });
  await ctx.setOffline(true);
  await pg.reload(); await pg.waitForFunction(() => window.AquaApp);
  assert.equal((await pg.textContent('h1')).trim(), 'AQUA');
  await pg.click('#btFacil'); await pg.waitForFunction(() => AquaApp.lay());
  const p = await pg.evaluate(() => AquaMotor.plano(AquaApp.estado())[0]);
  await pg.click('#frasco-' + p[0]); await pg.click('#frasco-' + p[1]);
  await pg.waitForFunction(() => AquaSom.carregadas().length >= 6, null, { timeout: 8000 });   // os efeitos também vêm da cópia
  // as fotos do fundo também abrem sem internet
  for (const id of ['cachoeira', 'praia', 'baloes']) {
    await pg.evaluate((id) => AquaFundo.mostrar(id, false), id);
    await pg.waitForFunction(() => { const i = document.querySelector('#cenario .cn-camada:last-of-type img'); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 8000 })
      .catch(() => assert.fail(id + ': a foto não abriu sem internet'));
  }
  assert.deepEqual(erros, []);
  await ctx.close();
});
