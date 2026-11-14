// Quem é? — "📶 Jogar pertinho" (sem internet, por QR code): node --test quem-e/teste/pertinho.test.js (rodar da raiz)
// Usa as peças da Batalha Naval como estão (../batalha-naval/pertinho.js, qr.js e libs/). Dois "celulares" de mentira
// em dois contextos separados do Chromium (não dividem nada: só a ligação direta, RTCDataChannel, os junta):
// o QR aparece na tela e é lido de verdade (print → jsQR → câmera falsa do Chromium), a partida corre, a ligação cai
// no meio e volta trocando os códigos de novo, e nada sai para fora do 127.0.0.1.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const http = require('http');
const fs = require('fs');
const os = require('os');
const { chromium } = require('playwright');
const jsQR = require('../../batalha-naval/libs/jsQR.js');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg', '.md': 'text/markdown' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'qe-perto-'));
const CAMERA = path.join(pasta, 'camera.y4m');
function quadroCamera(w, h, lum) {      // quadro da câmera falsa (Y4M, tons de cinza): o Chromium relê o arquivo a cada vez que a câmera abre
  const Y = Buffer.alloc(w * h), UV = Buffer.alloc((w / 2) * (h / 2) * 2, 128);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) Y[y * w + x] = lum(x, y);
  fs.writeFileSync(CAMERA, Buffer.concat([Buffer.from(`YUV4MPEG2 W${w} H${h} F10:1 Ip A1:1 C420jpeg\n`), Buffer.from('FRAME\n'), Y, UV]));
}
function cameraMostra(img) {
  const k = Math.min(1, 440 / Math.max(img.w, img.h)), w = Math.round(img.w * k), h = Math.round(img.h * k), x0 = (640 - w) >> 1, y0 = (480 - h) >> 1;
  quadroCamera(640, 480, (x, y) => {
    if (x < x0 || y < y0 || x >= x0 + w || y >= y0 + h) return 235;
    const i = (Math.floor((y - y0) / k) * img.w + Math.floor((x - x0) / k)) * 4;
    return Math.round(0.299 * img.d[i] + 0.587 * img.d[i + 1] + 0.114 * img.d[i + 2]);
  });
}
async function lerQRdaTela(pg) {
  const png = await pg.locator('#pertoQR').screenshot();
  const img = await pg.evaluate(async b64 => {
    const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
    return { w: im.width, h: im.height, d: Array.from(x.getImageData(0, 0, im.width, im.height).data) };
  }, png.toString('base64'));
  const r = jsQR(Uint8ClampedArray.from(img.d), img.w, img.h);
  return { texto: r && r.data, img };
}

let base, browser;
const fora = [];
test.before(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/quem-e/';
  quadroCamera(640, 480, () => 128);
  browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-video-capture=' + CAMERA] });
});
test.after(async () => { await browser.close(); server.close(); fs.rmSync(pasta, { recursive: true, force: true }); });

// um "celular": contexto próprio, câmera liberada, conexões guardadas (para derrubar), nada para fora do 127.0.0.1
async function celular() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, locale: 'pt-BR' });
  await ctx.grantPermissions(['camera']);
  await ctx.addInitScript(() => {
    const Orig = window.RTCPeerConnection; window.__pcs = [];
    window.RTCPeerConnection = function (c) { const pc = new Orig(c); window.__pcs.push(pc); return pc; };
    window.RTCPeerConnection.prototype = Orig.prototype;
  });
  await ctx.route('**/*', rota => { const u = new URL(rota.request().url()); if (u.hostname !== '127.0.0.1') { fora.push(u.href); return rota.abort(); } return rota.continue(); });
  const pg = await ctx.newPage(), erros = [];
  pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) erros.push(m.text()); });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  await pg.goto(base + '?teste');
  await pg.waitForFunction(() => window.QEDebug && window.QEDebug.pronto);
  pg.erros = erros; pg.ctx = ctx;
  return pg;
}
const perto = pg => pg.evaluate(() => window.QEDebug.perto());

test('jogar pertinho: QR lido pela câmera, corpo inteiro, partida, a ligação cai e volta', async () => {
  const a = await celular(), b = await celular();
  // A: cada um no seu celular → pertinho → criar → corpo inteiro → Fácil → QR da oferta
  await a.click('#btBlue'); await a.click('#btRede'); await a.click('#btPerto'); await a.waitForSelector('#perto.ativa');
  assert.match(await a.textContent('#perto'), /Roteador Wi-Fi.*modo avião/s);
  assert.match(await a.textContent('#perto'), /iPhone/);
  await a.click('#btPertoCriar'); await a.waitForSelector('#niveis.ativa');
  if ((await a.getAttribute('#btCorpo', 'aria-pressed')) !== 'true') await a.click('#btCorpo');
  await a.click('#btFacil'); await a.waitForSelector('#pertoCodigo.ativa');
  await a.waitForFunction(() => window.QEDebug.perto() && window.QEDebug.perto().qr, null, { timeout: 15000 });
  const pa = await perto(a);
  assert.match(pa.codigo, /^QEBN1O/); assert.equal(await a.textContent('#pertoCodTexto'), pa.codigo);
  const qrA = await lerQRdaTela(a);
  assert.equal(qrA.texto, pa.codigo, 'o QR da tela, lido pelo jsQR, é o código');

  // B: entrar → câmera falsa mostrando o print do QR de A → lê sozinho → QR da resposta
  cameraMostra(qrA.img);
  await b.click('#btPink'); await b.click('#btRede'); await b.click('#btPerto'); await b.click('#btPertoEntrar');
  await b.waitForSelector('#pertoLer.ativa');
  await b.waitForFunction(() => { const p = window.QEDebug.perto(); return p && p.qr && p.etapa === 'resposta'; }, null, { timeout: 20000 });
  assert.ok(await b.isVisible('#pertoCodigo.ativa'));
  assert.equal(await b.evaluate(() => document.getElementById('pertoVideo').srcObject), null, 'a câmera desligou depois de ler');
  const pb = await perto(b);
  assert.match(pb.codigo, /^QEBN1R/);
  assert.equal((await lerQRdaTela(b)).texto, pb.codigo);

  // A lê a resposta (pelo mesmo caminho da câmera): o próprio código e o de outro jogo não servem
  quadroCamera(640, 480, () => 128);
  await a.click('#btPertoLerResposta'); await a.waitForSelector('#pertoLer.ativa');
  assert.equal(await a.evaluate(c => window.QEDebug.lerCodigo(c), pa.codigo), false, 'ler o próprio código (oferta) não serve');
  assert.match(await a.textContent('#pertoLerStatus'), /código de criar/);
  assert.equal(await a.evaluate(c => window.QEDebug.lerCodigo(c), pb.codigo.slice(2)), false, 'código da Batalha Naval');
  assert.match(await a.textContent('#pertoLerStatus'), /Batalha Naval/);
  assert.equal(await a.evaluate(() => window.QEDebug.lerCodigo('QEBN9R123')), false);
  assert.match(await a.textContent('#pertoLerStatus'), /outra versão/);
  assert.equal(await a.evaluate(c => window.QEDebug.lerCodigo(c), pb.codigo), true);

  // ligados: os dois escolhem o segredo, com o corpo inteiro que A escolheu
  await a.waitForSelector('#segredo.ativa', { timeout: 15000 }); await b.waitForSelector('#segredo.ativa', { timeout: 15000 });
  assert.ok(await b.evaluate(() => document.querySelector('#gradeSegredo .carta svg').getAttribute('viewBox').split(' ')[3] > 400), 'B sem o corpo inteiro');
  for (const x of [a, b]) assert.deepEqual(await x.evaluate(() => window.QEDebug.sala()), { perto: true, ligado: true, host: x === a, eu: x === a ? 0 : 1 });
  await a.click('#segredo .carta[data-id="2"]'); await a.click('#btConfirmarSegredo');
  await b.click('#segredo .carta[data-id="5"]'); await b.click('#btConfirmarSegredo');
  await a.waitForSelector('#jogo.ativa'); await b.waitForSelector('#jogo.ativa');
  // A pergunta, B responde, A passa a vez
  await a.click('#btPerguntar'); await a.click('#perguntas button[data-p]:not(.inutil)');
  await b.waitForSelector('#responder:not([hidden])', { timeout: 10000 });
  await b.click((await b.evaluate(() => QEDebug.respostaCerta())) ? '#btSim' : '#btNao');
  await a.waitForSelector('#descartar:not([hidden])', { timeout: 10000 });
  await a.click('#btPronto');
  await b.waitForSelector('#acoes:not([hidden])', { timeout: 10000 });

  // a ligação cai: os dois avisam e oferecem ligar de novo
  await b.evaluate(() => window.__pcs.forEach(pc => pc.close()));
  for (const x of [a, b]) await x.waitForSelector('.qe-aviso h2', { timeout: 10000 });
  for (const x of [a, b]) assert.match(await x.textContent('.qe-aviso h2'), /caiu/);
  await a.click('.qe-aviso button >> nth=0'); await b.click('.qe-aviso button >> nth=0');
  await a.waitForFunction(() => window.QEDebug.perto() && window.QEDebug.perto().codigo, null, { timeout: 15000 });
  await b.waitForSelector('#pertoLer.ativa');
  const novaOferta = (await perto(a)).codigo;
  assert.notEqual(novaOferta, pa.codigo);
  assert.equal(await b.evaluate(c => window.QEDebug.lerCodigo(c), novaOferta), true);
  await b.waitForFunction(() => { const p = window.QEDebug.perto(); return p && p.etapa === 'resposta' && p.codigo; }, null, { timeout: 15000 });
  const novaResposta = (await perto(b)).codigo;
  await a.click('#btPertoLerResposta'); await a.waitForSelector('#pertoLer.ativa');
  assert.equal(await a.evaluate(c => window.QEDebug.lerCodigo(c), novaResposta), true);
  for (const x of [a, b]) await x.waitForSelector('#jogo.ativa', { timeout: 15000 });
  for (const x of [a, b]) await x.waitForFunction(() => window.QEDebug.sala().ligado);

  // a partida continuou de onde parou: é a vez de B, que chuta certo (o segredo de A é a carta 2)
  await b.waitForSelector('#acoes:not([hidden])', { timeout: 10000 });
  await b.click('#btPalpite'); await b.click('#tabuleiro .carta[data-id="2"]'); await b.click('#btConfirmarPalpite');
  await b.waitForSelector('#fim:not([hidden])', { timeout: 10000 }); await a.waitForSelector('#fim:not([hidden])', { timeout: 10000 });
  assert.notEqual(await a.textContent('#fimTitulo'), await b.textContent('#fimTitulo'), 'um ganhou e o outro não');

  // nada de internet, e nada guardado para "voltar" ao recarregar
  assert.deepEqual(fora, [], 'pedidos para fora do aparelho');
  for (const x of [a, b]) {
    assert.equal(await x.evaluate(() => typeof window.supabase), 'undefined');
    assert.equal(await x.evaluate(() => sessionStorage.getItem('bolinho:quem-e:rede')), null);
    assert.ok(!/sala=/.test(x.url()));
  }
  assert.deepEqual(a.erros, []); assert.deepEqual(b.erros, []);
  await a.ctx.close(); await b.ctx.close();
});

test('jogar pertinho: se não ligar, explica o porquê e deixa tentar de novo; cancelar volta', async () => {
  const c = await celular(), d = await celular(), e = await celular();
  // C cria; D lê o código de C e responde; E cria OUTRA partida e lê a resposta de D (velha, de outra tentativa)
  for (const x of [c, e]) {
    await x.click('#btPink'); await x.click('#btRede'); await x.click('#btPerto'); await x.click('#btPertoCriar'); await x.click('#btFacil');
    await x.waitForFunction(() => window.QEDebug.perto() && window.QEDebug.perto().codigo, null, { timeout: 15000 });
  }
  await d.click('#btPink'); await d.click('#btRede'); await d.click('#btPerto'); await d.click('#btPertoEntrar'); await d.waitForSelector('#pertoLer.ativa');
  assert.equal(await d.evaluate(x => window.QEDebug.lerCodigo(x), (await perto(c)).codigo), true);
  await d.waitForFunction(() => { const p = window.QEDebug.perto(); return p && p.etapa === 'resposta' && p.codigo; }, null, { timeout: 15000 });
  const velha = (await perto(d)).codigo;
  await e.click('#btPertoLerResposta');
  assert.equal(await e.evaluate(x => window.QEDebug.lerCodigo(x), velha), true);
  await e.waitForSelector('.qe-aviso h2', { timeout: 15000 });
  assert.match(await e.textContent('.qe-aviso h2'), /não se acharam/);
  assert.match(await e.textContent('.qe-aviso p'), /MESMO Wi-Fi/);
  await e.click('.qe-aviso button >> nth=1');           // Voltar
  await e.waitForSelector('#perto.ativa');
  assert.equal(await perto(e), null);
  // cancelar no meio também volta, e o 🏠 desliga tudo
  await e.click('#btPertoEntrar'); await e.waitForSelector('#pertoLer.ativa');
  await e.click('#btPertoCancelar2'); await e.waitForSelector('#perto.ativa');
  await c.click('[data-nav="inicio"], .bn-inicio').catch(() => c.goBack());
  await c.waitForSelector('#inicio.ativa');
  assert.equal(await perto(c), null);
  for (const x of [c, d, e]) { assert.deepEqual(x.erros, []); await x.ctx.close(); }
});
