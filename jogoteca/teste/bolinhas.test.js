// Testes do Bolinhas da Angústia: node --test jogoteca/teste/bolinhas.test.js (rodar da raiz do repositório kids).
// 1) Regras, perguntas e física (lógica pura, no Node). 2) Página no Chromium (Playwright): Fase 1, travar a resposta,
// a partida inteira até o Contrato e a revelação, e o modo Dois na mesma tela (cortina, Sala de Isolamento, assinar).
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');

global.window = global.window || {};
require('../jogos/bolinhas-perguntas.js');
require('../jogos/bolinhas.js');
const jogo = window.JogotecaJogos.find(j => j.id === 'bolinhas');
const L = jogo.logica;
const BANCO = window.JogotecaBolinhasPerguntas;

/* ---------------- regras ---------------- */
test('tabelas de valores das 3 fases (as da especificação do dono)', () => {
  assert.deepEqual(L.VALORES[1], [1, 500, 100, 2000, 10, 1000, 5, 10000, 1, 5000, 10, 2500, 100, 1500, 1]);
  assert.deepEqual(L.VALORES[2], [1, 2500, 500, 10000, 50, 5000, 25, 50000, 1, 25000, 50, 12500, 500, 7500, 1]);
  assert.deepEqual(L.VALORES[3], [1, 10000, 2500, 50000, 250, 25000, 100, 150000, 1, 75000, 250, 35000, 2500, 15000, 1]);
  for (const f of [1, 2, 3]) {
    const v = L.VALORES[f];
    assert.equal(v.length, 15);
    assert.equal(v[0] + v[14], 2, 'as pontas valem o mínimo');
    assert.ok(v[7] === Math.max(...v), 'o maior valor fica no centro');
  }
  assert.equal(L.GEO.ZONAS, 7); assert.equal(L.GEO.CANALETAS, 15);
});

test('saldo: verde soma, vermelha desconta e nunca fica abaixo de zero', () => {
  assert.equal(L.aplicarBola(100, 500, 'verde'), 600);
  assert.equal(L.aplicarBola(600, 500, 'vermelha'), 100);
  assert.equal(L.aplicarBola(100, 500, 'vermelha'), 0);
  assert.equal(L.aplicarBola(0, 10000, 'vermelha'), 0);
});

test('contrato = saldo da Fase 1 + acertos F2 × 5.000 + acertos F3 × 10.000', () => {
  assert.equal(L.valorContrato(12500, 2, 1), 32500);
  assert.equal(L.valorContrato(0, 0, 0), 0);
  assert.equal(L.valorContrato(1, 3, 3), 45001);
  assert.deepEqual(L.multiplicadores(0), [1]);
  assert.deepEqual(L.multiplicadores(1), [1, 2]);
  assert.deepEqual(L.multiplicadores(2), [1, 3]);
});

test('moeda por idioma: R$ em PT, $ em EN, € em ES (os mesmos números)', () => {
  assert.equal(L.dinheiro(12500, 'pt'), 'R$ 12.500');
  assert.equal(L.dinheiro(12500, 'en'), '$12,500');
  assert.equal(L.dinheiro(12500, 'es'), '12.500 €');
  assert.equal(L.dinheiro(0, 'pt'), 'R$ 0');
});

/* ---------------- perguntas ---------------- */
test('banco: 40 de 2 opções, 30 de 3 e 30 de 4, nos 3 idiomas, com a certa válida', () => {
  const por = n => BANCO.filter(q => q.o.length === n);
  assert.ok(por(2).length >= 40, '2 opções: ' + por(2).length);
  assert.ok(por(3).length >= 30, '3 opções: ' + por(3).length);
  assert.ok(por(4).length >= 30, '4 opções: ' + por(4).length);
  const ids = new Set();
  for (const q of BANCO) {
    assert.ok(!ids.has(q.id), 'id repetido: ' + q.id); ids.add(q.id);
    assert.ok(L.CATEGORIAS[q.cat], q.id + ': categoria ' + q.cat);
    assert.ok([1, 2, 3].includes(q.d), q.id + ': dificuldade');
    assert.ok(Array.isArray(q.q) && q.q.length === 3 && q.q.every(s => typeof s === 'string' && s.trim().length > 5), q.id + ': pergunta nos 3 idiomas');
    assert.ok(Number.isInteger(q.c) && q.c >= 0 && q.c < q.o.length, q.id + ': correctIndex');
    for (const o of q.o) assert.ok(typeof o === 'string' ? o.trim() : (o.length === 3 && o.every(s => typeof s === 'string' && s.trim())), q.id + ': opção nos 3 idiomas');
    for (let i = 0; i < 3; i++) {
      const textos = q.o.map(o => typeof o === 'string' ? o : o[i]);
      assert.equal(new Set(textos).size, textos.length, q.id + ': opções repetidas no idioma ' + i);
    }
  }
  // as 10 categorias aparecem em cada fase, e as 3 dificuldades também
  for (const n of [2, 3, 4]) {
    assert.equal(new Set(por(n).map(q => q.cat)).size, 10, n + ' opções: as 10 categorias');
    assert.deepEqual([...new Set(por(n).map(q => q.d))].sort(), [1, 2, 3]);
  }
});

test('sorteio: nada repete na partida e o nível escolhe a dificuldade', () => {
  for (const nivel of ['facil', 'medio', 'dificil']) {
    const usadas = {}, s = L.criarSorte(11), ids = [];
    for (const [n, k] of [[2, 5], [3, 3], [4, 3]]) for (let i = 0; i < k; i++) {
      const q = L.sortearPergunta(BANCO, n, nivel, usadas, s);
      assert.equal(q.o.length, n); ids.push(q.id);
      if (nivel === 'facil') assert.equal(q.d, 1, 'fácil começa pelas fáceis');
      if (nivel === 'dificil') assert.equal(q.d, 3, 'difícil começa pelas difíceis');
    }
    assert.equal(new Set(ids).size, ids.length, nivel + ': sem repetir');
  }
  // esgotou a dificuldade preferida, pega a seguinte; esgotou tudo, devolve null
  const usadas = {}, s = L.criarSorte(3), vistas = new Set();
  let q; while ((q = L.sortearPergunta(BANCO, 2, 'facil', usadas, s))) { assert.ok(!vistas.has(q.id)); vistas.add(q.id); }
  assert.equal(vistas.size, BANCO.filter(x => x.o.length === 2).length);
  // opções embaralhadas, com a certa acompanhando
  const p = L.prepararPergunta(BANCO.find(x => x.id === 'g3c'), L.criarSorte(5));
  assert.equal(p.o[p.c][1], 'Canberra');
});

test('parceiro virtual: 4 a 6 personagens, afinidades de 0,2 a 0,95, nível muda a força', () => {
  assert.ok(L.PERSONAGENS.length >= 4 && L.PERSONAGENS.length <= 6);
  for (const p of L.PERSONAGENS) {
    for (const nv of ['facil', 'medio', 'dificil']) {
      const a = L.afinidades(p, nv);
      assert.equal(Object.keys(a).length, 10);
      for (const v of Object.values(a)) assert.ok(v >= 0.2 && v <= 0.95, p.nome + ' ' + nv + ': ' + v);
    }
    const f = L.afinidades(p, 'facil'), d = L.afinidades(p, 'dificil');
    assert.ok(Object.keys(f).some(k => f[k] > d[k]), 'fácil = parceiro mais forte');
  }
  // responde pela afinidade: forte acerta muito mais que fraco
  const q = L.prepararPergunta(BANCO.find(x => x.o.length === 3 && x.d === 1), L.criarSorte(1));
  const taxa = (v) => { const s = L.criarSorte(9); let ok = 0; for (let i = 0; i < 2000; i++) if (L.iaResponder({ [q.cat]: v }, q, s).indice === q.c) ok++; return ok / 2000; };
  assert.ok(taxa(0.95) > 0.9, 'forte'); assert.ok(taxa(0.2) < 0.55, 'fraco');
  // no Contrato: muita certeza rasga, muito chute assina
  assert.equal(L.iaContrato([0.9, 0.92, 0.88, 0.95], L.criarSorte(2)), 'rasgar');
  assert.equal(L.iaContrato([0.2, 0.3, 0.25], L.criarSorte(2)), 'assinar');
});

/* ---------------- física ---------------- */
test('física: 500 quedas de cada zona sempre terminam numa canaleta, com a queda entre 4,5 e 6,5 s em média', () => {
  assert.equal(L.FIS.eBola, 0.6); assert.equal(L.FIS.ePino, 0.75);
  let total = 0, n = 0;
  for (let z = 0; z < 7; z++) {
    let tz = 0;
    const cont = new Array(15).fill(0);
    for (let i = 0; i < 500; i++) {
      const r = L.simularQueda(z, z * 1000 + i + 1);
      assert.ok(r.pousou, 'zona ' + (z + 1) + ', queda ' + i + ': ficou presa');
      assert.ok(r.canaleta >= 0 && r.canaleta <= 14);
      cont[r.canaleta]++; tz += r.tempo; total += r.tempo; n++;
    }
    const media = tz / 500;
    assert.ok(media >= 4.5 && media <= 6.5, 'zona ' + (z + 1) + ': ' + media.toFixed(2) + ' s');
    // a zona importa: o centro da distribuição fica perto da própria zona
    const centro = cont.reduce((a, c, k) => a + c * k, 0) / 500;
    assert.ok(Math.abs(centro - (1.5 + 2 * z)) < 3, 'zona ' + (z + 1) + ' cai perto: ' + centro.toFixed(1));
  }
  const media = total / n;
  assert.ok(media >= 4.5 && media <= 6.5, 'média geral ' + media.toFixed(2));
  // mesma semente, mesma queda; jitter diferente, caminho diferente
  assert.deepEqual(L.simularQueda(3, 42), L.simularQueda(3, 42));
  const m = L.criarMundo(), s = L.criarSorte(8), a = L.soltar(m, 3, 'branca', s), b = L.soltar(m, 3, 'branca', s);
  const ja = Math.abs(a.x - L.zonaX(3)), jb = Math.abs(b.x - L.zonaX(3));
  assert.ok(ja >= 1.5 && ja <= 3 && jb >= 1.5 && jb <= 3 && a.x !== b.x, 'jitter de ±1,5 a 3 px');
});

/* ---------------- página no Chromium ---------------- */
const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const IGNORAR = /solverone-dados|favicon|\.mp3/i;
let browser, base;

test.describe('no navegador', () => {
  test.before(async () => {
    const { chromium } = require('playwright');
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    base = 'http://127.0.0.1:' + server.address().port + '/jogoteca/';
    browser = await chromium.launch();
  });
  test.after(async () => { if (browser) await browser.close(); server.close(); });

  async function abrir(op, nivel) {
    const ctx = await browser.newContext(Object.assign({ locale: 'pt-BR', deviceScaleFactor: 1 }, op));
    const pg = await ctx.newPage(), erros = [];
    pg.on('console', m => { if (m.type() === 'error') { const u = (m.location() && m.location().url) || ''; if (!IGNORAR.test(u + m.text())) erros.push(m.text() + ' @' + u); } });
    pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
    await pg.goto(base + '?teste');
    await pg.waitForFunction(() => window.JogotecaDebug);
    await pg.evaluate(n => window.JogotecaDebug.jogar('bolinhas', n), nivel || 'facil');
    await pg.waitForFunction(() => window.BolinhasDebug);
    await pg.waitForSelector('.jt-bol2-cena [data-comecar]');
    pg.erros = erros; pg.ctx = ctx;
    return pg;
  }
  const estado = pg => pg.evaluate(() => BolinhasDebug.estado());

  for (const [w, h] of [[390, 844], [915, 412]]) {
    test(w + '×' + h + ': a Fase 1 aparece com a pergunta e as bolinhas caindo; responder trava', async () => {
      const pg = await abrir({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true }, 'facil');
      await pg.click('.jt-bol2-cena [data-comecar]');
      await pg.waitForSelector('.jt-bol2-fasecard [data-ok]');
      await pg.click('.jt-bol2-fasecard [data-ok]');
      assert.equal((await estado(pg)).etapa, 'leitura');
      assert.ok((await pg.textContent('.jt-bol2-perg')).length > 8, 'a pergunta aparece');
      assert.equal(await pg.locator('.jt-bol2-ops .jt-bol2-op').count(), 2);
      // a parede ocupa boa parte da tela
      const r = await pg.$eval('.jt-bol2-parede', e => { const b = e.getBoundingClientRect(); return { w: b.width, h: b.height }; });
      assert.ok(r.h >= (h - 52) * 0.6, 'parede alta: ' + r.h);
      await pg.evaluate(() => BolinhasDebug.velocidade(4));
      await pg.waitForFunction(() => BolinhasDebug.estado().caindo === 3, null, { timeout: 15000 });
      await pg.evaluate(() => BolinhasDebug.velocidade(1));
      assert.equal((await estado(pg)).etapa, 'queda');
      // responder trava: a escolhida fica marcada, as outras não aceitam mais toque
      const e0 = await estado(pg);
      const outra = e0.certa === 0 ? 1 : 0;
      await pg.click('.jt-bol2-ops .jt-bol2-op[data-op="' + e0.certa + '"]');
      assert.equal((await estado(pg)).resposta, e0.certa);
      assert.equal(await pg.$eval('.jt-bol2-ops .jt-bol2-op[data-op="' + outra + '"]', b => b.disabled), true);
      await pg.evaluate(o => BolinhasDebug.responder(o), outra);
      assert.equal((await estado(pg)).resposta, e0.certa, 'a resposta travada não muda');
      await pg.evaluate(() => BolinhasDebug.velocidade(6));
      await pg.waitForFunction(() => BolinhasDebug.estado().saldo > 0, null, { timeout: 15000 });
      assert.ok(await pg.$eval('.jt-bol2-op.certa', b => !!b));
      assert.deepEqual(pg.erros, []);
      await pg.ctx.close();
    });
  }

  test('câmera de TV: desce junto com a bolinha (com zoom e câmera lenta no fim) e volta ao plano aberto', { timeout: 60000 }, async () => {
    const pg = await abrir({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, 'facil');
    await pg.click('.jt-bol2-cena [data-comecar]');
    await pg.evaluate(() => BolinhasDebug.pularCartao());
    const c0 = await pg.evaluate(() => BolinhasDebug.camera());
    assert.ok(Math.abs(c0.z - 1) < 0.01 && Math.abs(c0.x - c0.aberto.x) < 1 && Math.abs(c0.y - c0.aberto.y) < 1, 'começa no plano aberto');
    await pg.evaluate(() => { BolinhasDebug.velocidade(1.5); BolinhasDebug.responderCerto(); });
    const amostras = [];
    for (let i = 0; i < 200; i++) {
      const s = await pg.evaluate(() => ({ c: BolinhasDebug.camera(), e: BolinhasDebug.estado() }));
      amostras.push(s);
      if (s.e.rodada >= 1) break;
      await pg.waitForTimeout(100);
    }
    const seguindo = amostras.filter(s => s.c.lider && (s.c.plano === 'segue' || s.c.plano === 'lenta' || s.c.plano === 'grupo'));
    assert.ok(seguindo.length >= 5, 'a câmera seguiu a queda: ' + seguindo.length + ' amostras');
    assert.ok(seguindo.some(s => s.c.z > 1.6), 'aproxima (zoom)');
    const meio = seguindo.slice(Math.floor(seguindo.length / 3));
    assert.ok(meio[meio.length - 1].c.y > meio[0].c.y + 120, 'o centro da câmera desce junto: ' + meio[0].c.y.toFixed(0) + ' → ' + meio[meio.length - 1].c.y.toFixed(0));
    for (const s of meio) assert.ok(Math.abs(s.c.y - s.c.lider.y) < 360, 'a bolinha fica no quadro');
    assert.ok(amostras.some(s => s.c.lenta), 'câmera lenta perto das canaletas');
    // terminou a queda: volta ao plano aberto
    await pg.waitForFunction(() => { const c = BolinhasDebug.camera(); return !c.lider && Math.abs(c.z - 1) < 0.03 && Math.abs(c.y - c.aberto.y) < 12 && Math.abs(c.x - c.aberto.x) < 12; }, null, { timeout: 15000 });
    assert.equal((await pg.evaluate(() => BolinhasDebug.camera())).lenta, false);
    assert.deepEqual(pg.erros, []);
    await pg.ctx.close();
  });

  test('390×844, Solo + Parceiro: a partida inteira até o Contrato e a revelação', { timeout: 150000 }, async () => {
    const pg = await abrir({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, 'medio');
    await pg.click('.jt-bol2-cena [data-comecar]');
    await pg.evaluate(() => BolinhasDebug.velocidade(14));
    const vistas = new Set();
    let e;
    for (let i = 0; i < 1500; i++) {
      e = await estado(pg);
      vistas.add(e.fase + ':' + e.etapa);
      if (e.etapa === 'revelacao' || e.etapa === 'fim') break;
      if (e.etapa === 'cartao') await pg.evaluate(() => BolinhasDebug.pularCartao());
      else if (e.fase === 1 && (e.etapa === 'leitura' || e.etapa === 'queda') && e.resposta === null) await pg.evaluate(() => BolinhasDebug.responderCerto());
      else if (e.etapa === 'verdes' || e.etapa === 'zona') await pg.evaluate(z => { BolinhasDebug.zona(z); BolinhasDebug.soltar(); }, (i % 5) + 1);
      await pg.waitForTimeout(60);
    }
    assert.equal(e.etapa, 'revelacao', 'chegou à revelação; passou por ' + [...vistas].join(' '));
    for (const k of ['1:queda', '2:verdes', '2:zona', '2:pensando', '2:vermelhas', '3:verdes', '3:zona', '3:vermelhas', '4:contrato'])
      assert.ok(vistas.has(k), 'passou por ' + k);
    assert.ok(e.saldoF1 > 0, 'acertou as 5 da Fase 1');
    assert.equal(e.contrato, e.saldoF1 + e.acertos[0] * 5000 + e.acertos[1] * 10000, 'contrato pela fórmula');
    assert.ok(['assinar', 'rasgar'].includes(e.decisao));
    assert.equal(await pg.isVisible('.jt-bol2-revela'), true);
    const txt = await pg.textContent('.jt-bol2-revela');
    assert.ok(txt.includes(L.dinheiro(e.saldo, 'pt')) && txt.includes(L.dinheiro(e.contrato, 'pt')), 'painel e contrato lado a lado');
    assert.match(txt, /Vocês levam R\$ [\d.]+!/);
    // jogar de novo volta para a escolha do modo
    await pg.click('.jt-bol2-revela [data-denovo]');
    assert.equal((await estado(pg)).etapa, 'inicio');
    assert.deepEqual(pg.erros, []);
    await pg.ctx.close();
  });

  test('915×412, Dois na mesma tela: cortina, Sala de Isolamento, contrato assinado com caneta e revelação', { timeout: 60000 }, async () => {
    const pg = await abrir({ viewport: { width: 915, height: 412 }, hasTouch: true, isMobile: true }, 'dificil');
    await pg.click('.jt-bol2-modo[data-modo="dois"]');
    assert.equal(await pg.isVisible('.jt-bol2-perfil'), false, 'sem parceiro virtual');
    await pg.click('.jt-bol2-cena [data-comecar]');
    assert.equal((await estado(pg)).modo, 'dois');
    // uma pergunta da Fase 2: o Palco escolhe a zona (teclado), passa o aparelho; a Sala responde
    await pg.evaluate(() => BolinhasDebug.pularPara('zona', { fase: 2, rodada: 1, saldo: 5000, saldoF1: 5000, memo: [1, 5] }));
    assert.equal(await pg.isVisible('.jt-bol2-perg'), false, 'o Palco não vê a pergunta');
    await pg.keyboard.press('ArrowRight'); await pg.keyboard.press('ArrowRight');
    await pg.keyboard.press('ArrowDown');
    let e = await estado(pg);
    assert.equal(e.mult, 2, 'Duplo na 2ª pergunta');
    await pg.keyboard.press('Enter');
    await pg.waitForSelector('.jt-bol2-cortina [data-ok]');
    assert.match(await pg.textContent('.jt-bol2-cortina'), /não olhe/);
    await pg.click('.jt-bol2-cortina [data-ok]');
    assert.ok((await pg.textContent('.jt-bol2-cena .jt-bol2-perg')).length > 8, 'a Sala vê a pergunta completa');
    assert.equal(await pg.locator('.jt-bol2-cena .jt-bol2-odo').count(), 0, 'a Sala não vê o saldo');
    e = await estado(pg);
    await pg.click('.jt-bol2-cena [data-sala="' + e.certa + '"]');
    await pg.click('.jt-bol2-cortina [data-ok]');
    await pg.evaluate(() => BolinhasDebug.velocidade(8));
    await pg.waitForFunction(() => BolinhasDebug.estado().caindo >= 1, null, { timeout: 10000 });
    await pg.waitForFunction(() => BolinhasDebug.estado().rodada === 2 && BolinhasDebug.estado().etapa === 'zona', null, { timeout: 20000 });
    e = await estado(pg);
    assert.equal(e.acertos[0], 1);
    // o Contrato: passa para a Sala, assina, chama os dois, revela
    await pg.evaluate(() => BolinhasDebug.pularPara('contrato', { saldo: 120000, saldoF1: 5000, acertos: [1, 2] }));
    await pg.click('.jt-bol2-cortina [data-ok]');
    assert.match(await pg.textContent('.jt-bol2-papel .valor'), /R\$ 30\.000/);
    await pg.click('.jt-bol2-cena [data-assinar]');
    assert.equal(await pg.$eval('.jt-bol2-papel', p => p.classList.contains('assina')), true, 'animação da caneta');
    await pg.waitForSelector('.jt-bol2-cortina [data-ok]', { timeout: 10000 });
    await pg.click('.jt-bol2-cortina [data-ok]');
    await pg.waitForSelector('.jt-bol2-revela');
    const txt = await pg.textContent('.jt-bol2-revela');
    assert.match(txt, /ASSINOU/); assert.match(txt, /Vocês levam R\$ 30\.000!/); assert.match(txt, /R\$ 120\.000/);
    assert.deepEqual(pg.erros, []);
    await pg.ctx.close();
  });

  test('inglês e espanhol: moeda e textos do jogo no idioma escolhido', async () => {
    for (const [cod, re, moeda] of [['en', /Start/, /\$0/], ['es', /Empezar/, /0€/]]) {
      const ctx = await browser.newContext({ locale: 'pt-BR', viewport: { width: 1280, height: 800 } });
      await ctx.addInitScript(c => localStorage.setItem('bolinho:idioma', c), cod);
      const pg = await ctx.newPage();
      await pg.goto(base + '?teste');
      await pg.waitForFunction(() => window.JogotecaDebug);
      await pg.evaluate(() => JogotecaDebug.jogar('bolinhas', 'facil'));
      await pg.waitForSelector('.jt-bol2-cena [data-comecar]');
      assert.match(await pg.textContent('.jt-bol2-cena [data-comecar]'), re);
      assert.match((await pg.getAttribute('.jt-bol2-odo', 'aria-label')).replace(/\s/g, ''), moeda);
      await ctx.close();
    }
  });
});
