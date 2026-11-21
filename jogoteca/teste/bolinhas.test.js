// Testes do Bolinhas da Angústia: node --test jogoteca/teste/bolinhas.test.js (rodar da raiz do repositório kids).
// Decisão do dono (21/Nov/2026): uma pessoa joga sozinha, em duas modalidades — Queda Livre (2 opções, responder enquanto
// as bolinhas caem) e Sem pressa (4 opções, sem tempo, escolher 3 zonas antes de responder). Sem parceiro virtual, sem dois
// jogadores, sem Contrato.
// 1) Regras, perguntas e física (lógica pura, no Node). 2) Página no Chromium (Playwright): escolher a modalidade, uma
// rodada de cada até o placar, a câmera da bolinha, a música de tensão e nada de parceiro em lugar nenhum.
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
test('valores das 15 canaletas (tabela da especificação): pontas no mínimo, o maior no centro', () => {
  assert.deepEqual(L.VALORES, [1, 500, 100, 2000, 10, 1000, 5, 10000, 1, 5000, 10, 2500, 100, 1500, 1]);
  assert.equal(L.VALORES[0] + L.VALORES[14], 2);
  assert.equal(L.VALORES[7], Math.max(...L.VALORES));
  assert.equal(L.GEO.ZONAS, 7); assert.equal(L.GEO.CANALETAS, 15);
});

test('duas modalidades: Queda Livre com 2 opções e tempo; Sem pressa com 4 opções e sem tempo', () => {
  assert.deepEqual(Object.keys(L.MODALIDADES).sort(), ['calma', 'queda']);
  const q = L.MODALIDADES.queda, c = L.MODALIDADES.calma;
  assert.equal(q.opcoes, 2); assert.equal(c.opcoes, 4);
  assert.ok(q.perguntas >= 3 && c.perguntas >= 3, 'várias perguntas por rodada');
  assert.deepEqual(q.zonas, [0, 3, 6], 'na Queda Livre as bolinhas caem das zonas 1, 4 e 7');
  assert.equal(c.zonas, null, 'no Sem pressa quem escolhe as zonas é a pessoa');
  assert.equal(L.tempoDeLeitura('calma', 'facil'), null); assert.equal(L.tempoDeLeitura('calma', 'dificil'), null);
  assert.ok(L.tempoDeLeitura('queda', 'facil') > L.tempoDeLeitura('queda', 'medio'));
  assert.ok(L.tempoDeLeitura('queda', 'medio') > L.tempoDeLeitura('queda', 'dificil'));
});

test('pontos: acertou = verde soma; errou = vermelha desconta, e o saldo nunca fica abaixo de zero', () => {
  assert.equal(L.corDaResposta(true), 'verde'); assert.equal(L.corDaResposta(false), 'vermelha');
  assert.equal(L.aplicarBola(100, 500, 'verde'), 600);
  assert.equal(L.aplicarBola(600, 500, 'vermelha'), 100);
  assert.equal(L.aplicarBola(100, 500, 'vermelha'), 0);
  // um lote inteiro: as canaletas onde caíram (7 = 10.000, 1 = 500, 14 = 1)
  assert.equal(L.aplicarLote(0, [7, 1, 14], 'verde'), 10501);
  assert.equal(L.aplicarLote(10501, [1, 14], 'vermelha'), 10000);
  assert.equal(L.aplicarLote(300, [7, 1], 'vermelha'), 0);
});

test('Sem pressa: as zonas vêm antes da resposta (3 bolinhas, a mesma zona pode repetir)', () => {
  const max = L.MODALIDADES.calma.bolas;
  assert.equal(max, 3);
  let z = [];
  assert.equal(L.zonasProntas(z, max), false);
  z = L.adicionarZona(z, 3, max); z = L.adicionarZona(z, 3, max);
  assert.equal(L.zonasProntas(z, max), false, 'com 2 ainda não responde');
  z = L.adicionarZona(z, 9, max);
  assert.deepEqual(z, [3, 3, 6], 'zona fora da parede vira a da ponta');
  assert.equal(L.zonasProntas(z, max), true);
  assert.deepEqual(L.adicionarZona(z, 1, max), [3, 3, 6], 'não passa de 3');
});

test('moeda por idioma: R$ em PT, $ em EN, € em ES (os mesmos números)', () => {
  assert.equal(L.dinheiro(12500, 'pt'), 'R$ 12.500');
  assert.equal(L.dinheiro(12500, 'en'), '$12,500');
  assert.equal(L.dinheiro(12500, 'es'), '12.500 €');
  assert.equal(L.dinheiro(0, 'pt'), 'R$ 0');
});

test('sem parceiro, sem dois jogadores, sem Contrato e nenhum personagem parceiro no código, nos textos e na documentação', () => {
  for (const k of ['PERSONAGENS', 'afinidades', 'iaResponder', 'iaContrato', 'valorContrato', 'multiplicadores', 'BONUS']) assert.equal(L[k], undefined, k);
  const pasta = path.resolve(__dirname, '..');
  const arquivos = ['jogos/bolinhas.js', 'jogos/bolinhas-perguntas.js', 'app.js', 'LEIA-ME.md', 'BOLINHAS-ESPECIFICACAO.md', 'teste/bolinhas.test.js'];
  for (const a of arquivos) {
    const txt = fs.readFileSync(path.join(pasta, a), 'utf8');
    assert.ok(!new RegExp('Rub' + 'ens', 'i').test(txt), a + ': ainda fala do personagem tirado');
  }
  const js = fs.readFileSync(path.join(pasta, 'jogos/bolinhas.js'), 'utf8');
  for (const r of [/Sala de Isolamento/, /Dois na mesma tela/, /assinar/i]) assert.ok(!r.test(js), 'bolinhas.js ainda tem ' + r);
  const ajuda = jogo.ajuda((pt) => pt);
  assert.match(ajuda, /Queda Livre/); assert.match(ajuda, /Sem pressa/); assert.doesNotMatch(ajuda, /parceiro/i);
});

/* ---------------- perguntas ---------------- */
test('banco: 40 de 2 opções e 60 de 4, nos 3 idiomas, com a certa válida', () => {
  const por = n => BANCO.filter(q => q.o.length === n);
  assert.ok(por(2).length >= 40, '2 opções: ' + por(2).length);
  assert.ok(por(4).length >= 60, '4 opções: ' + por(4).length);
  assert.equal(BANCO.length, por(2).length + por(4).length, 'só perguntas de 2 ou de 4 opções');
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
  for (const n of [2, 4]) {
    assert.equal(new Set(por(n).map(q => q.cat)).size, 10, n + ' opções: as 10 categorias');
    assert.deepEqual([...new Set(por(n).map(q => q.d))].sort(), [1, 2, 3]);
  }
});

test('sorteio: nada repete na rodada e o nível escolhe a dificuldade', () => {
  for (const nivel of ['facil', 'medio', 'dificil']) for (const mod of ['queda', 'calma']) {
    const R = L.MODALIDADES[mod], usadas = {}, s = L.criarSorte(11), ids = [];
    for (let i = 0; i < R.perguntas; i++) {
      const q = L.sortearPergunta(BANCO, R.opcoes, nivel, usadas, s);
      assert.equal(q.o.length, R.opcoes); ids.push(q.id);
      if (nivel === 'facil') assert.equal(q.d, 1, 'fácil começa pelas fáceis');
      if (nivel === 'dificil') assert.equal(q.d, 3, 'difícil começa pelas difíceis');
    }
    assert.equal(new Set(ids).size, ids.length, nivel + ' ' + mod + ': sem repetir');
  }
  const usadas = {}, s = L.criarSorte(3), vistas = new Set();
  let q; while ((q = L.sortearPergunta(BANCO, 4, 'facil', usadas, s))) { assert.ok(!vistas.has(q.id)); vistas.add(q.id); }
  assert.equal(vistas.size, BANCO.filter(x => x.o.length === 4).length);
  const p = L.prepararPergunta(BANCO.find(x => x.id === 'g3c'), L.criarSorte(5));
  assert.equal(p.o[p.c][1], 'Canberra');
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
const IGNORAR = /solverone-dados|favicon|\.mp3|media/i;
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

  for (const [w, h] of [[360, 740], [390, 844]]) {
    test(w + '×' + h + ': começo com as duas modalidades em cartões e o Começar à vista, sem rolar', async () => {
      const pg = await abrir({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true }, 'facil');
      assert.equal(await pg.locator('.jt-bol2-modo[data-mod]').count(), 2);
      const txt = await pg.textContent('.jt-bol2-cena');
      assert.match(txt, /Queda Livre/); assert.match(txt, /Sem pressa/);
      assert.doesNotMatch(txt, /parceiro|Sala de Isolamento|Dois na mesma tela/i);
      const r = await pg.$eval('.jt-bol2-cena [data-comecar]', e => { const b = e.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, rola: e.closest('.jt-bol2-cena').scrollHeight > e.closest('.jt-bol2-cena').clientHeight + 1 }; });
      assert.ok(r.top >= 0 && r.bottom <= h, 'Começar inteiro na tela: ' + JSON.stringify(r));
      assert.equal(r.rola, false, 'a tela de começo não rola');
      // escolha padrão: a Queda Livre já vem marcada; tocar no outro cartão troca e o botão diz qual vai começar
      assert.equal(await pg.getAttribute('.jt-bol2-modo[data-mod="queda"]', 'aria-pressed'), 'true');
      await pg.click('.jt-bol2-modo[data-mod="calma"]');
      assert.equal(await pg.getAttribute('.jt-bol2-modo[data-mod="calma"]', 'aria-pressed'), 'true');
      assert.match(await pg.textContent('.jt-bol2-cena [data-comecar]'), /Sem pressa/);
      await pg.click('.jt-bol2-cena [data-comecar]');
      assert.equal((await estado(pg)).modalidade, 'calma');
      assert.deepEqual(pg.erros, []);
      await pg.ctx.close();
    });
  }

  test('390×844, Queda Livre: 2 opções, responder enquanto caem, verdes somam, rodada inteira até o placar', { timeout: 120000 }, async () => {
    const pg = await abrir({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, 'facil');
    await pg.click('.jt-bol2-cena [data-comecar]');
    await pg.waitForSelector('.jt-bol2-fasecard [data-ok]');
    await pg.click('.jt-bol2-fasecard [data-ok]');
    let e = await estado(pg);
    assert.equal(e.modalidade, 'queda'); assert.equal(e.etapa, 'leitura'); assert.equal(e.opcoes, 2);
    assert.equal(await pg.locator('.jt-bol2-ops .jt-bol2-op').count(), 2);
    assert.ok((await pg.textContent('.jt-bol2-perg')).length > 8, 'a pergunta aparece');
    // o tempo de leitura acaba e as 3 bolinhas brancas caem; responder durante a queda trava a resposta
    await pg.evaluate(() => BolinhasDebug.velocidade(4));
    await pg.waitForFunction(() => BolinhasDebug.estado().caindo === 3, null, { timeout: 15000 });
    await pg.evaluate(() => BolinhasDebug.velocidade(1));
    e = await estado(pg);
    assert.equal(e.etapa, 'queda'); assert.ok(e.tensao, 'música de tensão durante a queda');
    await pg.click('.jt-bol2-ops .jt-bol2-op[data-op="' + e.certa + '"]');
    await pg.evaluate(o => BolinhasDebug.responder(o), e.certa === 0 ? 1 : 0);
    assert.equal((await estado(pg)).resposta, e.certa, 'a resposta travada não muda');
    await pg.evaluate(() => BolinhasDebug.velocidade(6));
    await pg.waitForFunction(() => BolinhasDebug.estado().cores.includes('verde'), null, { timeout: 15000 });
    await pg.waitForFunction(() => BolinhasDebug.estado().saldo > 0 && BolinhasDebug.estado().rodada === 1, null, { timeout: 20000 });
    e = await estado(pg);
    assert.equal(e.tensao, false, 'a tensão acaba quando a última bolinha bate no fundo');
    assert.deepEqual(e.marcas, [true]);
    // o resto da rodada: uma errada (sem responder = erro) e as outras certas
    await pg.evaluate(() => BolinhasDebug.velocidade(14));
    const vistas = new Set();
    for (let i = 0; i < 1200; i++) {
      e = await estado(pg); vistas.add(e.etapa);
      if (e.etapa === 'fim') break;
      if (e.etapa === 'leitura' && e.resposta === null && e.rodada !== 2) await pg.evaluate(() => BolinhasDebug.responderCerto());
      await pg.waitForTimeout(50);
    }
    assert.equal(e.etapa, 'fim', 'chegou ao placar; passou por ' + [...vistas].join(' '));
    assert.equal(e.marcas.length, 5); assert.equal(e.marcas[2], false, 'sem resposta = erro');
    assert.equal(e.acertos, 4);
    const txt = await pg.textContent('.jt-bol2-placar');
    assert.ok(txt.includes(L.dinheiro(e.saldo, 'pt')), 'placar com o saldo'); assert.match(txt, /4 de 5 certas/);
    await pg.click('.jt-bol2-placar [data-trocar]');
    assert.equal((await estado(pg)).etapa, 'inicio', 'trocar de modalidade volta ao começo');
    assert.deepEqual(pg.erros, []);
    await pg.ctx.close();
  });

  test('390×844, Sem pressa: sem tempo, 4 opções, 3 zonas antes de responder, vermelhas descontam, rodada até o placar', { timeout: 120000 }, async () => {
    const pg = await abrir({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, 'medio');
    await pg.click('.jt-bol2-modo[data-mod="calma"]');
    await pg.click('.jt-bol2-cena [data-comecar]');
    await pg.evaluate(() => BolinhasDebug.velocidade(20));
    await pg.waitForTimeout(1500);
    assert.equal((await estado(pg)).etapa, 'cartao', 'nada anda sozinho no Sem pressa');
    await pg.evaluate(() => BolinhasDebug.pularCartao());
    let e = await estado(pg);
    assert.equal(e.etapa, 'zonas'); assert.equal(e.opcoes, 4);
    assert.equal(await pg.locator('.jt-bol2-ops .jt-bol2-op').count(), 4);
    assert.ok(await pg.$eval('.jt-bol2-ops .jt-bol2-op', b => b.disabled), 'as opções esperam as zonas');
    // sem relógio: o tempo passa (rápido) e nada cai
    await pg.waitForTimeout(2500);
    e = await estado(pg);
    assert.equal(e.etapa, 'zonas'); assert.equal(e.bolas, 0); assert.equal(e.timers, 0, 'nenhum relógio agendado');
    // responder antes das 3 zonas não vale
    await pg.evaluate(() => BolinhasDebug.responderCerto());
    assert.equal((await estado(pg)).resposta, null);
    // as zonas: tocar na parede (zona 4), teclado (← e OK = zona 3) e desfazer
    const box = await pg.$eval('.jt-bol2-parede', el => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
    await pg.mouse.click(box.x + box.w / 2, box.y + box.h * 0.06);
    assert.deepEqual((await estado(pg)).zonas, [3]);
    await pg.keyboard.press('ArrowLeft'); await pg.keyboard.press('Enter');
    assert.deepEqual((await estado(pg)).zonas, [3, 2]);
    await pg.click('.jt-bol2-acoes [data-desfazer]');
    assert.deepEqual((await estado(pg)).zonas, [3]);
    await pg.evaluate(() => { BolinhasDebug.zona(6); BolinhasDebug.zona(6); });
    e = await estado(pg);
    assert.deepEqual(e.zonas, [3, 6, 6]); assert.equal(e.etapa, 'resposta');
    assert.equal(await pg.$eval('.jt-bol2-ops .jt-bol2-op', b => b.disabled), false, 'com as 3 zonas, as opções se soltam');
    // errou: as 3 caem vermelhas das zonas escolhidas e descontam (saldo começa em 0 e não fica negativo)
    await pg.evaluate(() => BolinhasDebug.velocidade(1));
    await pg.evaluate(() => BolinhasDebug.responderErrado());
    e = await estado(pg);
    assert.deepEqual(e.cores, ['vermelha', 'vermelha', 'vermelha']); assert.ok(e.tensao);
    assert.ok(await pg.$eval('.jt-bol2-op.errada', b => !!b));
    await pg.evaluate(() => BolinhasDebug.velocidade(8));
    await pg.waitForFunction(() => BolinhasDebug.estado().rodada === 1 && BolinhasDebug.estado().etapa === 'zonas', null, { timeout: 30000 });
    e = await estado(pg);
    assert.equal(e.saldo, 0); assert.deepEqual(e.marcas, [false]); assert.equal(e.tensao, false);
    // acertou: verdes que somam
    await pg.evaluate(() => { BolinhasDebug.zona(3); BolinhasDebug.zona(3); BolinhasDebug.zona(3); BolinhasDebug.responderCerto(); });
    assert.deepEqual((await estado(pg)).cores.slice(-3), ['verde', 'verde', 'verde'], 'as 3 novas caem verdes');
    await pg.waitForFunction(() => BolinhasDebug.estado().rodada === 2, null, { timeout: 30000 });
    assert.ok((await estado(pg)).saldo > 0, 'as verdes somaram');
    await pg.evaluate(() => BolinhasDebug.velocidade(14));
    for (let i = 0; i < 1200; i++) {
      e = await estado(pg);
      if (e.etapa === 'fim') break;
      if (e.etapa === 'zonas') await pg.evaluate(() => { BolinhasDebug.zona(1); BolinhasDebug.zona(3); BolinhasDebug.zona(5); });
      else if (e.etapa === 'resposta') await pg.evaluate(() => BolinhasDebug.responderCerto());
      await pg.waitForTimeout(50);
    }
    assert.equal(e.etapa, 'fim');
    assert.equal(e.acertos, 4); assert.equal(e.marcas.length, 5);
    assert.match(await pg.textContent('.jt-bol2-placar'), /Sem pressa/);
    await pg.click('.jt-bol2-placar [data-denovo]');
    e = await estado(pg);
    assert.equal(e.modalidade, 'calma'); assert.equal(e.etapa, 'cartao'); assert.equal(e.saldo, 0);
    assert.doesNotMatch(await pg.textContent('body'), new RegExp('Rub' + 'ens|parceiro', 'i'));
    assert.deepEqual(pg.erros, []);
    await pg.ctx.close();
  });

  test('câmera: começa na câmera da bolinha (bem perto), depois acompanha de perto, câmera lenta no fim e volta ao plano aberto', { timeout: 60000 }, async () => {
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
    const pov = amostras.filter(s => s.c.plano === 'pov');
    assert.ok(pov.length >= 3, 'câmera da bolinha: ' + pov.length + ' amostras');
    assert.ok(pov.some(s => s.c.z > 4), 'a câmera da bolinha chega bem perto');
    for (const s of pov.filter(s => s.c.z > 4)) assert.ok(Math.abs(s.c.x - s.c.lider.x) < 60 && Math.abs(s.c.y - s.c.lider.y) < 80, 'colada na bolinha');
    const segue = amostras.filter(s => s.c.lider && (s.c.plano === 'segue' || s.c.plano === 'lenta' || s.c.plano === 'grupo'));
    assert.ok(segue.length >= 3, 'depois acompanha: ' + segue.length);
    assert.ok(segue.some(s => s.c.z > 2.8), 'acompanhamento bem perto');
    const i0 = amostras.indexOf(pov[0]), i1 = amostras.indexOf(segue[0]);
    assert.ok(i0 < i1, 'primeiro a câmera da bolinha, depois o acompanhamento');
    assert.ok(amostras.some(s => s.c.lenta), 'câmera lenta perto das canaletas');
    await pg.waitForFunction(() => { const c = BolinhasDebug.camera(); return !c.lider && Math.abs(c.z - 1) < 0.03 && Math.abs(c.y - c.aberto.y) < 12 && Math.abs(c.x - c.aberto.x) < 12; }, null, { timeout: 15000 });
    assert.deepEqual(pg.erros, []);
    await pg.ctx.close();
  });

  test('reduzir movimento: sem câmera da bolinha e sem câmera lenta', { timeout: 60000 }, async () => {
    const pg = await abrir({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }, 'facil');
    await pg.click('.jt-bol2-cena [data-comecar]');
    await pg.evaluate(() => BolinhasDebug.pularCartao());
    await pg.evaluate(() => { BolinhasDebug.velocidade(2); BolinhasDebug.responderCerto(); });
    const planos = new Set(); let lenta = false;
    for (let i = 0; i < 120; i++) {
      const s = await pg.evaluate(() => ({ c: BolinhasDebug.camera(), e: BolinhasDebug.estado() }));
      planos.add(s.c.plano); lenta = lenta || s.c.lenta;
      if (s.e.rodada >= 1) break;
      await pg.waitForTimeout(80);
    }
    assert.ok(!planos.has('pov'), 'sem câmera da bolinha: ' + [...planos].join(' '));
    assert.equal(lenta, false);
    await pg.ctx.close();
  });

  test('1280×800 e inglês/espanhol: textos e moeda no idioma escolhido', async () => {
    for (const [cod, re, moeda, mod] of [['en', /Start/, /\$0/, /No Rush/], ['es', /Empezar/, /0€/, /Sin prisa/]]) {
      const ctx = await browser.newContext({ locale: 'pt-BR', viewport: { width: 1280, height: 800 } });
      await ctx.addInitScript(c => localStorage.setItem('bolinho:idioma', c), cod);
      const pg = await ctx.newPage();
      await pg.goto(base + '?teste');
      await pg.waitForFunction(() => window.JogotecaDebug);
      await pg.evaluate(() => JogotecaDebug.jogar('bolinhas', 'facil'));
      await pg.waitForSelector('.jt-bol2-cena [data-comecar]');
      assert.match(await pg.textContent('.jt-bol2-cena [data-comecar]'), re);
      assert.match(await pg.textContent('.jt-bol2-cena'), mod);
      assert.match((await pg.getAttribute('.jt-bol2-odo', 'aria-label')).replace(/\s/g, ''), moeda);
      await ctx.close();
    }
  });
});
