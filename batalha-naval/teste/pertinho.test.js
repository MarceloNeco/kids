// "📶 Jogar pertinho" (sem internet, por QR code): node --test batalha-naval/teste/pertinho.test.js (rodar da raiz do kids)
// 1. Os códigos: SDP de verdade do Chromium → código curto → SDP de novo (ida e volta), tamanho, versão errada e lixo.
// 2. Dois aparelhos de mentira (duas abas do Chromium) SEM internet: a página e as bibliotecas vêm do service worker,
//    o QR aparece na tela e é lido de verdade (print da tela → jsQR; e a câmera falsa do Chromium mostrando esse print),
//    os dois se ligam pelo canal direto (RTCDataChannel) e jogam uma partida inteira; a ligação cai no meio e volta.
//    Atenção: o "sem internet" do Chromium (context.setOffline) também trava as checagens de conexão do WebRTC (o que
//    não acontece num celular de verdade em modo avião: lá a rede local continua). Por isso o teste tira o "sem
//    internet" só durante os segundos em que os dois aparelhos se acham, com toda a internet bloqueada (route) e
//    conferindo no fim que nenhum pedido saiu para fora do 127.0.0.1.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const http = require('http');
const fs = require('fs');
const os = require('os');
const { chromium } = require('playwright');
const P = require('../pertinho.js');
const jsQR = require('../libs/jsQR.js');
const qrcode = require('../libs/qrcode.js');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml', '.md': 'text/markdown; charset=utf-8' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.startsWith('/solverone-dados/')) { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{}'); return; }
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'bn-perto-'));
const CAMERA = path.join(pasta, 'camera.y4m');
// quadro da câmera falsa (formato Y4M, tons de cinza): o Chromium relê o arquivo a cada vez que alguém abre a câmera
function quadroCamera(w, h, lum) {
  const Y = Buffer.alloc(w * h), UV = Buffer.alloc((w / 2) * (h / 2) * 2, 128);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) Y[y * w + x] = lum(x, y);
  fs.writeFileSync(CAMERA, Buffer.concat([Buffer.from(`YUV4MPEG2 W${w} H${h} F10:1 Ip A1:1 C420jpeg\n`), Buffer.from('FRAME\n'), Y, UV]));
}
let base, browser;
test.before(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/batalha-naval/';
  quadroCamera(640, 480, () => 128);
  browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-video-capture=' + CAMERA] });
});
test.after(async () => { await browser.close(); server.close(); fs.rmSync(pasta, { recursive: true, force: true }); });

function versaoQR(txt) { const q = qrcode(0, 'M'); q.addData(txt, 'Alphanumeric'); q.make(); return (q.getModuleCount() - 17) / 4; }

// oferta e resposta de verdade do Chromium (com a câmera liberada = endereço IP; sem ela = nome .local)
async function sdpsDoChromium(liberarCamera) {
  const ctx = await browser.newContext();
  if (liberarCamera) await ctx.grantPermissions(['camera']);
  const a = await ctx.newPage(), b = await ctx.newPage();
  await a.goto(base + 'versoes.json'); await b.goto(base + 'versoes.json');
  const juntar = pc => new Promise(r => { let t; const fim = () => r({ type: pc.localDescription.type, sdp: pc.localDescription.sdp }); const teto = setTimeout(fim, 5000);
    pc.onicecandidate = e => { clearTimeout(t); if (!e.candidate) { clearTimeout(teto); fim(); } else t = setTimeout(() => { clearTimeout(teto); fim(); }, 700); }; });
  const oferta = await a.evaluate(async j => { const juntar = eval(j); const pc = new RTCPeerConnection({ iceServers: [] }); window.pc = pc; pc.createDataChannel('x'); await pc.setLocalDescription(await pc.createOffer()); return juntar(pc); }, juntar.toString());
  const resposta = await b.evaluate(async ([j, o]) => { const juntar = eval(j); const pc = new RTCPeerConnection({ iceServers: [] }); await pc.setRemoteDescription(o); await pc.setLocalDescription(await pc.createAnswer()); return juntar(pc); }, [juntar.toString(), oferta]);
  // o SDP remontado a partir do código também é aceito pelo Chromium
  const remontada = P.deCodigo(P.paraCodigo(oferta));
  const aceita = await b.evaluate(async o => { const pc = new RTCPeerConnection({ iceServers: [] }); await pc.setRemoteDescription(o); await pc.setLocalDescription(await pc.createAnswer()); return pc.localDescription.type; }, { type: remontada.type, sdp: remontada.sdp });
  assert.equal(aceita, 'answer');
  const remResp = P.deCodigo(P.paraCodigo(resposta));
  await a.evaluate(async r => { await pc.setRemoteDescription(r); }, { type: remResp.type, sdp: remResp.sdp });
  await ctx.close();
  return [oferta, resposta];
}
const campo = (sdp, n) => (new RegExp('^a=' + n + ':(.*)$', 'm').exec(sdp) || [])[1].trim();
const enderecos = sdp => sdp.split(/\r?\n/).map(l => /^a=candidate:\S+ 1 udp \d+ (\S+) (\d+) typ host/i.exec(l)).filter(Boolean).map(m => m[1].toLowerCase() + ' ' + m[2]).sort();

test('códigos: SDP de verdade do Chromium vai e volta, fica curto e o QR pequeno', async () => {
  const tamanhos = [];
  for (const liberar of [true, false]) {
    for (const desc of await sdpsDoChromium(liberar)) {
      const cod = P.paraCodigo(desc);
      assert.match(cod, desc.type === 'offer' ? /^BN1O[0-9A-Z$%+\-./:]+$/ : /^BN1R[0-9A-Z$%+\-./:]+$/);
      const volta = P.deCodigo(cod);
      assert.equal(volta.type, desc.type);
      for (const k of ['ice-ufrag', 'ice-pwd', 'fingerprint', 'setup', 'mid']) assert.equal(campo(volta.sdp, k), campo(desc.sdp, k), k);
      assert.deepEqual(enderecos(volta.sdp), enderecos(desc.sdp), 'os endereços UDP voltam iguais');
      assert.ok(enderecos(desc.sdp).length >= 1, 'o Chromium achou pelo menos um endereço');
      assert.equal(P.paraCodigo(volta), cod, 'codificar o SDP remontado dá o mesmo código');
      // colado com espaços, quebras de linha e minúsculas também serve
      assert.equal(P.deCodigo('  ' + cod.slice(0, 30).toLowerCase() + '\n' + cod.slice(30) + ' ').sdp.split('\n').slice(4).join(), volta.sdp.split('\n').slice(4).join());
      tamanhos.push([liberar ? 'IP' : '.local', desc.type, cod.length, versaoQR(cod)]);
      assert.ok(cod.length <= 160, 'código grande demais: ' + cod.length);
      assert.ok(versaoQR(cod) <= 6, 'QR grande demais: versão ' + versaoQR(cod));
    }
  }
  console.log('# tamanho dos códigos [endereço, tipo, letras, versão do QR]: ' + JSON.stringify(tamanhos));
});

test('códigos: versão diferente avisa "versao"; lixo, cortado, mexido ou de outro app avisa "lixo"', async () => {
  const [oferta] = await sdpsDoChromium(true);
  const cod = P.paraCodigo(oferta);
  const erroDe = txt => { try { P.deCodigo(txt); return 'aceitou'; } catch (e) { return e.codigo; } };
  assert.equal(erroDe('BN2' + cod.slice(3)), 'versao');
  assert.equal(erroDe('BN10' + cod.slice(3)), 'versao');
  for (const lixo of ['', 'oi', 'BN', 'BN1', 'BN1O', 'BN1X' + cod.slice(4), 'https://solverone.com.br/kids/', cod.slice(0, -1), cod.slice(0, -2), cod + '0', cod.slice(0, 20) + cod.slice(23),
    cod.slice(0, 40) + (cod[40] === 'A' ? 'B' : 'A') + cod.slice(41), cod.replace(/.$/, c => c === '0' ? '1' : '0'), 'BN1O' + '::::::'.repeat(20), 'BN1R' + '0'.repeat(120), null, undefined, 12345])
    assert.equal(erroDe(lixo), 'lixo', 'aceitou lixo: ' + String(lixo).slice(0, 50));
  // lixo sorteado: nunca aceita, nunca trava
  let semente = 7; const rnd = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 2000; i++) {
    const n = 4 + Math.floor(rnd() * 150); let s = 'BN1' + (rnd() < 0.5 ? 'O' : 'R');
    for (let k = 0; k < n; k++) s += P.ALFA[Math.floor(rnd() * P.ALFA.length)];
    assert.equal(erroDe(s), 'lixo');
  }
  assert.throws(() => P.paraCodigo({ type: 'offer', sdp: 'v=0\r\n' }));
});

test('canal direto (rede.js): as mesmas mensagens do jogo, pelo mesmo validar(); lixo não passa; queda avisa uma vez', async () => {
  const R = require('../rede.js');
  let ouvir = null, cair = null, fechou = 0; const enviados = [];
  const conexao = { enviar: t => enviados.push(t), ouvir: (o, c) => { ouvir = o; cair = c; }, fechar: () => { fechou++; } };
  const chegou = []; let quedas = 0;
  const canal = await R.abrir('PERTO', m => chegou.push(m), () => quedas++, conexao);
  canal.mandar({ t: 'pulso', de: 'abcd1234' });
  assert.deepEqual(enviados.map(x => JSON.parse(x)), [{ t: 'pulso', de: 'abcd1234' }]);
  ouvir(JSON.stringify({ t: 'oi', de: 'efgh5678', nome: '<b>Ana</b>' }));
  for (const lixo of ['{', 'null', '[]', JSON.stringify({ t: 'oi', de: 'curto' }), JSON.stringify({ t: 'tiro', de: 'efgh5678', alvo: 0, x: 99, y: 0, n: 0 }), JSON.stringify({ t: 'oi', de: 'efgh5678', nome: 'x'.repeat(300000) }), 42])
    ouvir(lixo);
  assert.deepEqual(chegou, [{ t: 'oi', de: 'efgh5678', nome: 'bAna/b' }]);
  cair(); cair();
  assert.equal(quedas, 1, 'a queda avisa uma vez só');
  canal.fechar(); assert.equal(fechou, 1);
});

// ---------------------------------------------------------------------------------------------------------------
function vigiar(pg) {
  const erros = [];
  pg.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  return erros;
}
const visivel = (pg, sel) => pg.$eval(sel, el => !el.hidden && el.getClientRects().length > 0).catch(() => false);
async function jogarAteFim(abas, max = 900) {
  for (let i = 0; i < max; i++) {
    let todos = true;
    for (const { pg } of abas) {
      if (!(await visivel(pg, '#fimCaixa'))) todos = false;
      const minha = await pg.$eval('#banner', b => b.classList.contains('minha')).catch(() => false);
      if (minha) { const c = await pg.$('#tabAlvo.pode button.c:not(:disabled)'); if (c) await c.click().catch(() => {}); }
    }
    if (todos) return i;
    await abas[0].pg.waitForTimeout(40);
  }
  throw new Error('a partida não terminou');
}
async function arrumarEPronto(aba) {
  await aba.pg.waitForSelector('#btArrumar:not([hidden])'); await aba.pg.click('#btArrumar');
  await aba.pg.click('#btSortear'); await aba.pg.click('#btPronto'); await aba.pg.waitForSelector('#sala.ativa');
}
// o QR que está na tela: print → pixels (numa página, sem internet: imagem data:) → jsQR aqui no Node
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
// a câmera falsa passa a mostrar esse print (no meio de um quadro 640×480 branco)
function cameraMostra(img) {
  const k = Math.min(1, 440 / Math.max(img.w, img.h)), w = Math.round(img.w * k), h = Math.round(img.h * k), x0 = (640 - w) >> 1, y0 = (480 - h) >> 1;
  quadroCamera(640, 480, (x, y) => {
    if (x < x0 || y < y0 || x >= x0 + w || y >= y0 + h) return 235;
    const i = (Math.floor((y - y0) / k) * img.w + Math.floor((x - x0) / k)) * 4;
    return Math.round(0.299 * img.d[i] + 0.587 * img.d[i + 1] + 0.114 * img.d[i + 2]);
  });
}
// os dois se acham (ver o aviso lá em cima): sem "sem internet" só nesse intervalo, com a internet bloqueada
async function ligarSemInternet(ctx, fn) { await ctx.setOffline(false); try { await fn(); } finally { await ctx.setOffline(true); } }

test('jogar pertinho: 2 abas sem internet, QR lido pela câmera, partida inteira, ligação cai e volta', async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 820 }, hasTouch: true, locale: 'pt-BR' });
  await ctx.grantPermissions(['camera']);
  await ctx.addInitScript(() => {           // guardar as conexões, para derrubar uma no meio da partida
    const Orig = window.RTCPeerConnection; window.__pcs = [];
    window.RTCPeerConnection = function (c) { const pc = new Orig(c); window.__pcs.push(pc); return pc; };
    window.RTCPeerConnection.prototype = Orig.prototype;
  });
  const fora = [];
  await ctx.route('**/*', rota => { const u = new URL(rota.request().url()); if (u.hostname !== '127.0.0.1') { fora.push(u.href); return rota.abort(); } return rota.continue(); });
  const abrir = async () => {
    const pg = await ctx.newPage(), erros = vigiar(pg);
    await pg.goto(base + '?teste'); await pg.waitForSelector('#inicio.ativa');
    await pg.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 15000 });
    return { pg, erros };
  };
  const a = await abrir(), b = await abrir();
  await ctx.setOffline(true);
  // sem internet: recarregar vem do service worker, e as bibliotecas do QR também (não foram carregadas antes)
  for (const x of [a, b]) { await x.pg.reload(); await x.pg.waitForSelector('#inicio.ativa'); }
  assert.equal(await a.pg.evaluate(() => navigator.onLine), false);
  assert.ok(await visivel(a.pg, '#avisoSemNet'), 'o início avisa que está sem internet');
  assert.equal(await a.pg.evaluate(() => typeof window.qrcode + typeof window.jsQR), 'undefinedundefined');

  // A: criar → explicação → nível → QR da oferta
  await a.pg.click('#btPerto');
  assert.match(await a.pg.textContent('#perto'), /Roteador Wi-Fi.*modo avião/s);
  assert.match(await a.pg.textContent('#perto'), /iPhone/);
  await a.pg.fill('#nomePerto', 'Ana'); await a.pg.click('#btPertoCriar'); await a.pg.click('[data-nivel="facil"]');
  await a.pg.waitForSelector('#pertoCodigo.ativa');
  await a.pg.waitForFunction(() => window.BNApp.perto() && window.BNApp.perto().qr, null, { timeout: 15000 });
  const pa = await a.pg.evaluate(() => window.BNApp.perto());
  assert.match(pa.codigo, /^BN1O/); assert.equal(await a.pg.textContent('#pertoCodTexto'), pa.codigo);
  const qrA = await lerQRdaTela(a.pg);
  assert.equal(qrA.texto, pa.codigo, 'o QR da tela lido pelo jsQR é o código');
  console.log('# oferta: ' + pa.codigo.length + ' letras, QR versão ' + pa.qr.versao + ' (' + pa.qr.modulos + '×' + pa.qr.modulos + ')');

  // B: entrar → câmera (falsa, mostrando o print do QR de A) → lê sozinho → QR da resposta
  cameraMostra(qrA.img);
  await b.pg.click('#btPerto'); await b.pg.fill('#nomePerto', 'Beto'); await b.pg.click('#btPertoEntrar');
  await b.pg.waitForSelector('#pertoLer.ativa');
  await b.pg.waitForFunction(() => window.BNApp.perto() && window.BNApp.perto().qr && window.BNApp.perto().etapa === 'resposta', null, { timeout: 20000 });
  assert.ok(await b.pg.isVisible('#pertoCodigo.ativa'));
  assert.equal(await b.pg.evaluate(() => document.getElementById('pertoVideo').srcObject), null, 'a câmera desligou depois de ler');
  const pb = await b.pg.evaluate(() => window.BNApp.perto());
  assert.match(pb.codigo, /^BN1R/);
  const qrB = await lerQRdaTela(b.pg);
  assert.equal(qrB.texto, pb.codigo);
  console.log('# resposta: ' + pb.codigo.length + ' letras, QR versão ' + pb.qr.versao);

  // A: ler a resposta (a câmera abre — agora sem QR na frente; o código entra pelo mesmo caminho que a câmera usa) → ligados
  quadroCamera(640, 480, () => 128);
  await a.pg.click('#btPertoLerResposta'); await a.pg.waitForSelector('#pertoLer.ativa');
  assert.equal(await a.pg.evaluate(c => window.BNApp.lerCodigo(c), pa.codigo), false, 'ler o próprio código (oferta) não serve');
  assert.match(await a.pg.textContent('#pertoLerStatus'), /código de criar/);
  assert.equal(await a.pg.evaluate(() => window.BNApp.lerCodigo('BN9R123')), false);
  assert.match(await a.pg.textContent('#pertoLerStatus'), /outra versão/);
  await ligarSemInternet(ctx, async () => {
    assert.equal(await a.pg.evaluate(c => window.BNApp.lerCodigo(c), qrB.texto), true);
    await a.pg.waitForSelector('#sala.ativa', { timeout: 15000 }); await b.pg.waitForSelector('#sala.ativa', { timeout: 15000 });
    await a.pg.waitForFunction(() => document.querySelectorAll('#salaLista li').length === 2);
    await b.pg.waitForFunction(() => document.querySelectorAll('#salaLista li').length === 2);
  });
  for (const x of [a, b]) {
    assert.ok(await x.pg.evaluate(() => window.BNApp.jogo().perto && window.BNApp.jogo().conectado));
    assert.ok(await visivel(x.pg, '#salaPerto')); assert.ok(!(await visivel(x.pg, '#salaConvite')));
  }
  assert.match(await b.pg.textContent('#salaLista'), /Ana.*Beto/s);

  // a partida, toda sem internet
  await arrumarEPronto(a); await arrumarEPronto(b);
  await a.pg.waitForFunction(() => !document.getElementById('btComecar').disabled);
  await a.pg.click('#btComecar');
  await b.pg.waitForSelector('#jogo.ativa');
  for (let i = 0; i < 16; i++) await jogarAteFim([a, b], 1).catch(() => {});
  const antes = await a.pg.evaluate(() => window.BNApp.dados().log.length);
  assert.ok(antes >= 4, 'quase nenhum tiro antes de cair: ' + antes);

  // a ligação cai: os dois avisam e oferecem ligar de novo
  await b.pg.evaluate(() => window.__pcs.forEach(pc => pc.close()));
  for (const x of [a, b]) {
    await x.pg.waitForSelector('#janela:not([hidden])', { timeout: 10000 });
    assert.match(await x.pg.textContent('#janelaTitulo'), /caiu/);
  }
  assert.match(await a.pg.textContent('#banner'), /Sem conexão/);
  // ligar de novo: A mostra um código novo, B lê (pelo mesmo caminho da câmera), B mostra a resposta, A lê
  await a.pg.click('#janelaBotoes button >> nth=0'); await b.pg.click('#janelaBotoes button >> nth=0');
  await a.pg.waitForFunction(() => window.BNApp.perto() && window.BNApp.perto().codigo, null, { timeout: 15000 });
  await b.pg.waitForSelector('#pertoLer.ativa');
  const novaOferta = await a.pg.evaluate(() => window.BNApp.perto().codigo);
  assert.notEqual(novaOferta, pa.codigo);
  assert.equal(await b.pg.evaluate(c => window.BNApp.lerCodigo(c), novaOferta), true);
  await b.pg.waitForFunction(() => window.BNApp.perto() && window.BNApp.perto().etapa === 'resposta' && window.BNApp.perto().codigo, null, { timeout: 15000 });
  const novaResposta = await b.pg.evaluate(() => window.BNApp.perto().codigo);
  await a.pg.click('#btPertoLerResposta'); await a.pg.waitForSelector('#pertoLer.ativa');
  await ligarSemInternet(ctx, async () => {
    assert.equal(await a.pg.evaluate(c => window.BNApp.lerCodigo(c), novaResposta), true);
    for (const x of [a, b]) await x.pg.waitForSelector('#jogo.ativa', { timeout: 15000 });
    await a.pg.waitForFunction(() => window.BNApp.jogo().conectado);
    await b.pg.waitForFunction(() => window.BNApp.jogo().conectado);
  });
  assert.ok((await a.pg.evaluate(() => window.BNApp.dados().log.length)) >= antes, 'a partida continuou de onde parou');
  await jogarAteFim([a, b]);
  const da = await a.pg.evaluate(() => window.BNApp.dados()), db = await b.pg.evaluate(() => window.BNApp.dados());
  assert.equal(da.fase, 'fim'); assert.equal(da.venc, db.venc); assert.deepEqual(da.log, db.log);
  assert.ok(da.log.length > antes);
  assert.notEqual(await a.pg.textContent('#fimTitulo'), await b.pg.textContent('#fimTitulo'), 'um ganhou e o outro não');
  // nada de internet: nenhum pedido para fora, nada de Supabase, e a partida nunca foi guardada para "voltar"
  assert.deepEqual(fora, [], 'pedidos para fora do aparelho');
  for (const x of [a, b]) {
    assert.equal(await x.pg.evaluate(() => typeof window.supabase), 'undefined');
    assert.equal(await x.pg.evaluate(() => localStorage.getItem('batalha-naval.rede')), null);
    assert.ok(!/sala=/.test(x.pg.url()));
  }
  // sair no fim: volta para o início
  await a.pg.click('#btInicioFim'); await a.pg.waitForSelector('#inicio.ativa');
  assert.deepEqual(a.erros, []); assert.deepEqual(b.erros, []);
  await ctx.close();
});

test('jogar pertinho: se não ligar, explica o porquê e deixa tentar de novo; cancelar volta', async () => {
  const ctx = await browser.newContext({ viewport: { width: 800, height: 1000 }, locale: 'pt-BR' });
  const pg = await ctx.newPage(), erros = vigiar(pg);
  await pg.goto(base + '?teste'); await pg.waitForSelector('#inicio.ativa');
  // uma resposta "de outro lugar" (de uma conexão que já fechou): os dois nunca se acham
  const [, respostaVelha] = await sdpsDoChromium(false);
  await pg.click('#btPerto'); await pg.click('#btPertoCriar'); await pg.click('[data-nivel="medio"]');
  await pg.waitForFunction(() => window.BNApp.perto() && window.BNApp.perto().codigo, null, { timeout: 15000 });
  await pg.click('#btPertoLerResposta'); await pg.waitForSelector('#pertoLer.ativa');
  assert.equal(await pg.evaluate(c => window.BNApp.lerCodigo(c), P.paraCodigo(respostaVelha)), true);
  await pg.waitForSelector('#janela:not([hidden])', { timeout: 15000 });
  assert.match(await pg.textContent('#janelaTitulo'), /não se acharam/);
  assert.match(await pg.textContent('#janelaTexto'), /MESMO Wi-Fi/);
  assert.match(await pg.textContent('#janelaTexto'), /avião/);
  await pg.click('#janelaBotoes button >> nth=0');            // tentar de novo: código novo na tela
  await pg.waitForSelector('#pertoCodigo.ativa');
  await pg.waitForFunction(() => window.BNApp.perto() && window.BNApp.perto().codigo, null, { timeout: 15000 });
  await pg.click('#btPertoCancelar1');
  await pg.waitForSelector('#perto.ativa');
  assert.equal(await pg.evaluate(() => window.BNApp.perto()), null);
  // entrar e cancelar com o botão Voltar do celular
  await pg.click('#btPertoEntrar'); await pg.waitForSelector('#pertoLer.ativa');
  await pg.goBack(); await pg.waitForSelector('#perto.ativa');
  assert.equal(await pg.evaluate(() => window.BNApp.perto()), null);
  assert.deepEqual(erros, []);
  await ctx.close();
});
