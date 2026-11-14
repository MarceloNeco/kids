// Navegação padrão (dono, 07/Nov/2026): todo jogo tem 🏠 Início e 🚪 Saída no canto de cima, pela peça comum
// navegacao.js. Para cada jogo, com o celular em pé (390×844) e deitado (915×412):
// - na tela de começo a 🚪 Saída aparece inteira na tela e o 🏠 não;
// - entrando no jogo, o 🏠 aparece e leva de volta à tela de começo;
// - o Voltar do celular numa tela de dentro também volta à tela de começo, e na tela de começo sai do jogo;
// - a 🚪, numa aba comum do navegador, leva à estante (/kids/);
// - a barra não cobre nenhum outro botão visível do jogo (na tela de começo e na de jogar);
// - nenhum erro no console.
// Rodar da raiz do repositório: node --test teste/navegacao.test.js   (só um jogo: --test-name-pattern=campo)
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require('playwright');

const raiz = path.join(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.webmanifest': 'application/manifest+json', '.wasm': 'application/wasm', '.tflite': 'application/octet-stream' };
const servidor = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (!p.startsWith('/kids/')) { res.writeHead(404); res.end(); return; }
  p = p.slice('/kids'.length); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});

const TAMANHOS = [[390, 844], [915, 412]];
// inicio: o que só aparece na tela de começo; entrar: do começo até uma tela de dentro (começar uma partida);
// confirmar: o jogo pergunta antes de largar a partida (🏠 e Voltar) e o teste responde que sim;
// fundo: jogos de várias telas, onde o Voltar volta uma tela por vez (diretriz): o 🏠 é testado lá do fundo;
// avisaAntesDeSair: na tela de começo o 1º Voltar avisa "toque de novo para sair" e só o 2º sai (diretriz)
const JOGOS = [
  { id: 'baguncolandia', url: 'baguncolandia/?teste', inicio: '#btPassoCel', avisaAntesDeSair: true,
    entrar: async (pg) => { await pg.click('#btPassoCel'); await pg.click('#btToque'); await pg.waitForTimeout(300); },
    fundo: async (pg) => { await pg.fill('#nome', 'Lara'); await pg.click('#btEntrar');
      await pg.waitForFunction(() => window.BaguncaApp.TVApp.tv.fase === 'lobby', null, { timeout: 20000 }); await pg.click('#localComecar'); await pg.waitForTimeout(1500); } },
  { id: 'peluqueria', url: 'peluqueria/', entrada: '#btEntrar', inicio: '#btJogar',
    entrar: async (pg) => { await pg.click('#btJogar'); await pg.waitForTimeout(1500); } },
  { id: 'vruuum', url: 'vruuum/?teste', entrada: '#btEntrar', inicio: '#btCorrer',
    entrar: async (pg) => { await pg.click('#btCorrer'); await pg.waitForTimeout(1500); } },
  { id: 'purpurina', url: 'purpurina/?teste', entrada: '#btEntrar', inicio: '#btLivre',
    entrar: async (pg) => { await pg.click('#btLivre'); await pg.waitForTimeout(600); } },
  { id: 'rabiscolandia', url: 'rabiscolandia/?teste', entrada: '#btEntrar', inicio: '#btLivre',
    entrar: async (pg) => { await pg.click('#btLivre'); await pg.waitForTimeout(800); const x = await pg.$('button.tour-bt[aria-label*="Sair"]'); if (x) await x.click(); await pg.waitForTimeout(300); } },
  { id: 'campo-minado', url: 'campo-minado/?teste', inicio: '#btFacil',
    entrar: async (pg) => { await pg.click('#btFacil'); await pg.waitForTimeout(500); } },
  { id: 'batalha-naval', url: 'batalha-naval/?teste', inicio: '#btPC', confirmar: { janela: '#janela', sim: '#janelaBotoes button >> nth=0' },
    entrar: async (pg) => { await pg.click('#btPC'); await pg.click('button.nivel[data-nivel="facil"]'); await pg.waitForTimeout(500); } },
  { id: 'enigmas', url: 'enigmas/?teste', inicio: '#btFacil',
    entrar: async (pg) => { await pg.click('#btFacil'); await pg.waitForTimeout(600); } },
  { id: 'labirinto', url: 'labirinto/?teste', inicio: '#btJogar',
    entrar: async (pg) => { await pg.click('#btJogar'); await pg.waitForTimeout(800); } },
  { id: 'a-garra', url: 'a-garra/?teste', inicio: '#btJogar',
    entrar: async (pg) => { await pg.click('#btJogar'); await pg.waitForTimeout(500); } },
  { id: 'cozinha', url: 'cozinha/?teste', entrada: '#btEntrar', inicio: '#receitas',
    entrar: async (pg) => { await pg.click('#receitas [data-rec]'); await pg.waitForTimeout(500); },
    fundo: async (pg) => { await pg.click('#btBuscar'); await pg.waitForTimeout(500); } },
  { id: 'aqua', url: 'aqua/?teste', inicio: '#btFacil',
    entrar: async (pg) => { await pg.click('#btFacil'); await pg.waitForTimeout(500); } },
  { id: 'quem-e', url: 'quem-e/?teste', inicio: '#btPink',
    entrar: async (pg) => { await pg.click('#btPink'); await pg.click('#btMeleca'); await pg.click('#btFacil'); await pg.click('#segredo .carta[data-id="0"]'); await pg.click('#btConfirmarSegredo'); await pg.waitForTimeout(500); } },
  { id: 'glub-glub', url: 'glub-glub/?teste', inicio: '#btSozinho',
    entrar: async (pg) => { await pg.click('#btSozinho'); await pg.click('#btJogar'); await pg.waitForTimeout(600); } },
  { id: 'danca-na-sala', url: 'danca-na-sala.html?teste', inicio: '#btSolo',
    entrar: async (pg) => { await pg.click('#btSolo'); await pg.fill('#nome', 'Lara').catch(() => {}); await pg.click('#btEntrar'); await pg.waitForSelector('#jogo.solo', { timeout: 15000 }); await pg.waitForTimeout(500); } },
];

let navegador, base;
before(async () => {
  await new Promise((r) => servidor.listen(0, r));
  base = 'http://127.0.0.1:' + servidor.address().port + '/kids/';
  navegador = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
});
after(async () => { if (navegador) await navegador.close(); servidor.close(); });

async function abrir(w, h) {
  const ctx = await navegador.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, locale: 'pt-BR', serviceWorkers: 'block' });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await ctx.route('**/solverone-dados/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"recursos":{}}' }));
  const pg = await ctx.newPage(), erros = [];
  pg.on('pageerror', (e) => erros.push(e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) erros.push(m.text()); });
  return { ctx, pg, erros };
}

const visivel = (pg, sel) => pg.evaluate((sel) => {
  const e = document.querySelector(sel); if (!e) return false;
  const r = e.getBoundingClientRect(), s = getComputedStyle(e);
  return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
}, sel);

// a barra: inteira dentro da tela e sem cobrir nenhum outro botão à vista
async function conferirBarra(pg, w, h, onde, comCasa) {
  const r = await pg.evaluate(() => {
    const nav = document.querySelector('.bolinho-nav');
    if (!nav || nav.hidden) return null;
    const caixa = (e) => { const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
    const casa = nav.querySelector('.bn-casa'), saida = nav.querySelector('.bn-saida');
    const nb = caixa(nav), cobertos = [];
    for (const e of document.querySelectorAll('button, a[href], [role="button"], input, select, textarea')) {
      if (nav.contains(e) || e.closest('.tela-inteira-bt, .bolinho-sair')) continue;
      const s = getComputedStyle(e), b = caixa(e);
      if (b.w < 2 || b.h < 2 || s.visibility === 'hidden' || +s.opacity === 0 || s.pointerEvents === 'none') continue;
      let x = e, escondido = false;
      for (; x && x.nodeType === 1; x = x.parentElement) { const cs = getComputedStyle(x); if (+cs.opacity === 0 || cs.visibility === 'hidden') { escondido = true; break; } }
      if (escondido) continue;
      const ix = Math.min(nb.r, b.r) - Math.max(nb.l, b.l), iy = Math.min(nb.b, b.b) - Math.max(nb.t, b.t);
      if (ix > 1 && iy > 1) cobertos.push((e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]) + ' ' + JSON.stringify(b));
    }
    return { nav: nb, casa: casa.hidden ? null : caixa(casa), saida: caixa(saida), cobertos };
  });
  assert.ok(r, onde + ': sem a barra de navegação');
  const dentro = (b) => b.l >= 0 && b.t >= 0 && b.r <= w + 0.5 && b.b <= h + 0.5;
  assert.ok(dentro(r.nav), onde + ': a barra sai da tela ' + JSON.stringify(r.nav));
  assert.ok(r.saida.w >= 44 && r.saida.h >= 44, onde + ': 🚪 menor que 44 px');
  if (comCasa) { assert.ok(r.casa, onde + ': sem o 🏠 numa tela de dentro'); assert.ok(r.casa.w >= 44 && r.casa.h >= 44, onde + ': 🏠 menor que 44 px'); }
  else assert.ok(!r.casa, onde + ': o 🏠 aparece na tela de começo');
  assert.deepStrictEqual(r.cobertos, [], onde + ': a barra cobre botões do jogo');
}

async function irAoInicio(pg, j) {
  await pg.goto(base + j.url); await pg.waitForTimeout(600);
  if (j.entrada) { await pg.click(j.entrada); await pg.waitForTimeout(500); }
  await pg.waitForSelector(j.inicio, { state: 'visible', timeout: 10000 });
  await pg.waitForTimeout(300);
}
async function esperarInicio(pg, j, onde) {
  if (j.confirmar) { await pg.waitForSelector(j.confirmar.janela, { state: 'visible', timeout: 3000 }).catch(() => {}); if (await visivel(pg, j.confirmar.janela)) await pg.click(j.confirmar.sim); }
  await pg.waitForSelector(j.inicio, { state: 'visible', timeout: 8000 }).catch(() => assert.fail(onde + ': não voltou à tela de começo'));
  await pg.waitForFunction(() => document.querySelector('.bolinho-nav .bn-casa').hidden, null, { timeout: 3000 }).catch(() => assert.fail(onde + ': o 🏠 continua à vista na tela de começo'));
}

for (const j of JOGOS) {
  test('navegação padrão: ' + j.id, async () => {
    for (const [w, h] of TAMANHOS) {
      const onde = j.id + ' ' + w + '×' + h;
      const { ctx, pg, erros } = await abrir(w, h);
      try {
        await pg.goto(base); await pg.waitForTimeout(300);   // veio da estante
        await irAoInicio(pg, j);
        await conferirBarra(pg, w, h, onde + ' (começo)', false);
        // 🏠 numa tela de dentro
        await j.entrar(pg);
        await pg.waitForSelector('.bolinho-nav .bn-casa:not([hidden])', { timeout: 3000 }).catch(() => assert.fail(onde + ': o 🏠 não apareceu dentro do jogo'));
        await conferirBarra(pg, w, h, onde + ' (jogando)', true);
        if (j.fundo) { await j.fundo(pg); await conferirBarra(pg, w, h, onde + ' (mais fundo)', true); }
        await pg.click('.bolinho-nav .bn-casa');
        await esperarInicio(pg, j, onde + ' (🏠)');
        // Voltar do celular numa tela de dentro
        await j.entrar(pg);
        await pg.waitForSelector('.bolinho-nav .bn-casa:not([hidden])', { timeout: 3000 });
        await pg.goBack().catch(() => {});
        await esperarInicio(pg, j, onde + ' (Voltar)');
        assert.ok(pg.url().startsWith(base + j.url.split('?')[0]), onde + ': o Voltar saiu do jogo (' + pg.url() + ')');
        // Voltar na tela de começo: sai do jogo (para a estante, de onde veio)
        if (j.avisaAntesDeSair) { await pg.goBack().catch(() => {}); await pg.waitForTimeout(400); }
        await pg.goBack().catch(() => {});
        await pg.waitForURL(base, { timeout: 5000 }).catch(() => assert.fail(onde + ': o Voltar na tela de começo não saiu do jogo (' + pg.url() + ')'));
        // 🚪 numa aba comum: vai para a estante
        await irAoInicio(pg, j);
        await pg.click('.bolinho-nav .bn-saida');
        await pg.waitForURL(base, { timeout: 5000 }).catch(() => assert.fail(onde + ': a 🚪 não levou à estante (' + pg.url() + ')'));
        assert.deepStrictEqual(erros, [], onde + ': erro no console');
      } finally { await ctx.close(); }
    }
  });
}

test('navegação padrão: 🚪 com a partida rolando pergunta antes de sair (Campo Minado)', async () => {
  const j = JOGOS.find((x) => x.id === 'campo-minado');
  const { ctx, pg, erros } = await abrir(390, 844);
  try {
    await irAoInicio(pg, j);
    await j.entrar(pg);
    await pg.click('#tabuleiro .casa >> nth=27'); await pg.waitForTimeout(300);
    await pg.click('.bolinho-nav .bn-saida');
    await pg.waitForSelector('.bolinho-sair:not([hidden])', { timeout: 2000 });
    await pg.click('.bolinho-sair .nao');
    assert.ok(await visivel(pg, '#tabuleiro'), 'Continuar brincando: o jogo continua');
    assert.ok(pg.url().includes('campo-minado'), 'Continuar brincando: não saiu');
    await pg.click('.bolinho-nav .bn-saida');
    await pg.click('.bolinho-sair .sim');
    await pg.waitForURL(base, { timeout: 5000 });
    assert.deepStrictEqual(erros, []);
  } finally { await ctx.close(); }
});

test('navegação padrão: a peça está em todo jogo, no sw.js de cada um e na estante', () => {
  const ler = (f) => fs.readFileSync(path.join(raiz, f), 'utf8');
  assert.match(ler('sw.js'), /'navegacao\.js'/, 'sw.js da estante não guarda o navegacao.js');
  for (const j of JOGOS) {
    const pagina = j.id === 'danca-na-sala' ? 'danca-na-sala.html' : j.id + '/index.html';
    const html = ler(pagina);
    assert.match(html, /<script src="(\.\.\/|\/kids\/)?navegacao\.js"/, pagina + ' não carrega o navegacao.js');
    assert.ok(html.search(/<script src="[^"]*idioma\.js"/) < html.search(/<script src="[^"]*navegacao\.js"/), pagina + ': navegacao.js antes do idioma.js');
    if (j.id !== 'danca-na-sala') assert.match(ler(j.id + '/sw.js'), /'\.\.\/navegacao\.js'/, j.id + '/sw.js não guarda o ../navegacao.js');
    const js = j.id === 'danca-na-sala' ? html : ler(j.id + '/app.js');
    assert.match(js, /BolinhoNav\.iniciar\(/, j.id + ' não chama BolinhoNav.iniciar');
  }
});
