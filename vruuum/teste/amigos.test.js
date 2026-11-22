// Amigos dos outros jogos como piloto (dono, 22/Nov/2026; amigos.js + ../personagens.js):
// - sem ninguém salvo, a fileira da etapa do Piloto mostra onde criar um amigo (links para o Meu Pequeno Amiguinho e a Purpurina);
// - um personagem salvo por outro jogo aparece na fileira (retrato + nome), e os do próprio Vruuum não;
// - escolhido, ele pilota: o nome aparece embaixo do veículo, o rosto dele é o que a cabeça do piloto desenha,
//   e o jogo lembra a escolha ao abrir de novo; escolher um bichinho tira o amigo; apagado no outro jogo, volta ao bichinho.
// Rodar da raiz do repositório: node --test vruuum/teste/amigos.test.js
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require('playwright');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.wasm': 'application/wasm', '.tflite': 'application/octet-stream' };
const servidor = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (!p.startsWith('/kids/') || /\.(mp3|wav)$/.test(p)) { res.writeHead(404); res.end(); return; }
  p = p.slice('/kids'.length); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});

let navegador, base;
before(async () => {
  await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + servidor.address().port + '/kids/';
  navegador = await chromium.launch();
});
after(async () => { if (navegador) await navegador.close(); servidor.close(); });

async function contexto() {
  const ctx = await navegador.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, serviceWorkers: 'block' });
  await ctx.addInitScript(() => { localStorage.setItem('bolinho:idioma', 'pt'); });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  return ctx;
}
async function abrirPiloto(ctx, erros) {
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(e.message));
  await pg.goto(base + 'vruuum/?teste'); await pg.waitForTimeout(600);
  await pg.evaluate(() => document.getElementById('btEntrar').click());
  await pg.waitForSelector('#menu.ativa #btCorrer', { state: 'visible', timeout: 10000 });
  await pg.click('[data-ir-etapa="4"]'); await pg.waitForTimeout(400);
  return pg;
}
// salva personagens de teste como outro jogo salvaria (retrato todo de uma cor só)
const salvarTeste = (pg) => pg.evaluate(async () => {
  function img(cor, w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); c.fillStyle = cor; c.beginPath(); c.arc(w / 2, h / 2, w * 0.48, 0, 7); c.fill(); return cv.toDataURL('image/png'); }
  await BolinhoPersonagens.salvar({ id: 'amiguinho:7', jogo: 'meu-amiguinho', nome: 'Pipoca', tipo: 'bicho', retrato: img('#ff00ff', 256, 256), corpo: img('#ff00ff', 384, 512), atualizado: 2000 });
  await BolinhoPersonagens.salvar({ id: 'purpurina:minha', jogo: 'purpurina', nome: "Purpurina 80's", tipo: 'pessoa', retrato: img('#00c0ff', 256, 256), atualizado: 1000 });
  await BolinhoPersonagens.salvar({ id: 'vruuum:eu', jogo: 'vruuum', nome: 'Do Vruuum', tipo: 'pessoa', retrato: img('#00ff00', 256, 256), atualizado: 3000 });
});
// quem a cabeça do piloto está desenhando agora (espia o VruuumCabeca.desenhar por meio segundo): o id do amigo, ou o bichinho
const pilotoDesenhado = (pg) => pg.evaluate(() => new Promise((ok) => {
  const C = window.VruuumCabeca, orig = C.desenhar, vistos = {};
  C.desenhar = function (c, vv, x0, y0, cw, ch, info) { const k = info.foto && info.foto.amigo ? 'amigo:' + info.foto.amigo + ':' + (info.foto.img.complete ? 'pronto' : 'carregando') : info.personagem ? 'pers' : 'bicho:' + info.emoji; vistos[k] = (vistos[k] || 0) + 1; return orig.apply(this, arguments); };
  setTimeout(() => { C.desenhar = orig; ok(Object.keys(vistos).filter((k) => k !== 'pers').sort()); }, 500);   // 'pers': a corrida de demonstração atrás do menu
}));

test('sem amigos: a fileira mostra onde criar um (Meu Pequeno Amiguinho e Purpurina)', async () => {
  const ctx = await contexto(), erros = [];
  try {
    const pg = await abrirPiloto(ctx, erros);
    const r = await pg.evaluate(() => { const c = document.getElementById('amigos'), b = c.getBoundingClientRect(); return { texto: c.textContent, links: [...c.querySelectorAll('a')].map((a) => a.getAttribute('href')), ver: b.height > 0, botoes: c.querySelectorAll('[data-amigo]').length }; });
    assert.equal(r.ver, true);
    assert.equal(r.botoes, 0);
    assert.match(r.texto, /Crie um amiguinho no Meu Pequeno Amiguinho ou uma personagem na Purpurina/);
    assert.deepEqual(r.links, ['../meu-amiguinho/', '../purpurina/']);
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('um amigo salvo em outro jogo aparece na fileira e pilota o veículo; o jogo lembra', async () => {
  const ctx = await contexto(), erros = [];
  try {
    let pg = await abrirPiloto(ctx, erros);
    await salvarTeste(pg);
    await pg.waitForSelector('#amigos [data-amigo]', { timeout: 5000 });   // a fileira se remonta sozinha (aoMudar)
    const fileira = await pg.evaluate(() => [...document.querySelectorAll('#amigos [data-amigo]')].map((b) => b.getAttribute('data-amigo') + '=' + b.textContent + '=' + (b.querySelector('img').src.slice(0, 15))));
    assert.deepEqual(fileira, ['amiguinho:7=Pipoca=data:image/webp', "purpurina:minha=Purpurina 80's=data:image/webp"], 'os de outros jogos, do mais novo para o mais velho; o do Vruuum não');
    assert.deepEqual(await pilotoDesenhado(pg), ['bicho:🐱']);
    await pg.click('#amigos [data-amigo="amiguinho:7"]');
    await pg.waitForTimeout(900);
    const r = await pg.evaluate(() => ({ marcado: document.querySelector('#amigos [data-amigo="amiguinho:7"]').getAttribute('aria-pressed'), bicho: document.querySelector('[data-piloto][aria-pressed="true"]'),
      nome: document.getElementById('nomeVeic').textContent, pref: JSON.parse(localStorage.getItem('vruuum.pref')).carros[0] }));
    assert.equal(r.marcado, 'true'); assert.equal(r.bicho, null, 'o bichinho deixa de estar marcado');
    assert.match(r.nome, /^Pipoca · /, 'o nome do amigo embaixo do veículo');
    assert.equal(r.pref.amigo, 'amiguinho:7'); assert.equal(r.pref.foto, false);
    assert.deepEqual(await pilotoDesenhado(pg), ['amigo:amiguinho:7:pronto'], 'o rosto do amigo pilota (prévia e miniaturas)');
    // abre de novo: lembra
    await pg.close();
    pg = await abrirPiloto(ctx, erros);
    await pg.waitForTimeout(800);
    const lembra = await pg.evaluate(() => document.querySelector('#amigos [data-amigo="amiguinho:7"]').getAttribute('aria-pressed'));
    assert.equal(lembra, 'true');
    assert.deepEqual(await pilotoDesenhado(pg), ['amigo:amiguinho:7:pronto'], 'continua pilotando');
    // escolher um bichinho tira o amigo
    await pg.click('[data-piloto="2"]'); await pg.waitForTimeout(200);
    assert.equal(await pg.evaluate(() => JSON.parse(localStorage.getItem('vruuum.pref')).carros[0].amigo), null);
    // apagado no outro jogo: volta para o bichinho, sem erro
    await pg.click('#amigos [data-amigo="amiguinho:7"]'); await pg.waitForTimeout(300);
    await pg.evaluate(() => BolinhoPersonagens.remover('amiguinho:7')); await pg.waitForTimeout(400);
    const apagado = await pg.evaluate(() => ({ botoes: [...document.querySelectorAll('#amigos [data-amigo]')].map((b) => b.getAttribute('data-amigo')), amigo: JSON.parse(localStorage.getItem('vruuum.pref')).carros[0].amigo || null }));
    assert.deepEqual(apagado.botoes, ['purpurina:minha']);
    assert.equal(apagado.amigo, null);
    assert.deepEqual(await pilotoDesenhado(pg), ['bicho:🦄'], 'volta para o bichinho escolhido antes');
    assert.equal(await pg.evaluate(() => document.getElementById('nomeVeic').textContent.indexOf('Pipoca')), -1);
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});
