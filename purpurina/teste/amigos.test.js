// Personagens que viajam entre os jogos (dono, 22/Nov/2026; amigos.js + ../personagens.js):
// - EXPORTA: a personagem do Brincar livre vira "Purpurina 80's" para os outros jogos (retrato 256×256 e corpo 384×512,
//   fundo transparente), ao abrir o jogo e ao sair do estúdio quando ela mudou;
// - IMPORTA: em Acessórios, 🧸 Amiguinho lista os amiguinhos do Meu Pequeno Amiguinho (com retrato); escolhido, ele aparece
//   ao lado dela no palco (e some ao girar); "Sem amiguinho" tira; sem nenhum, a janela leva ao Meu Pequeno Amiguinho.
// Rodar da raiz do repositório: node --test purpurina/teste/amigos.test.js
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require('playwright');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const servidor = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (!p.startsWith('/kids/') || /\.mp3$/.test(p)) { res.writeHead(404); res.end(); return; }
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

async function abrir(ctx, erros) {
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => erros.push(e.message));
  await pg.goto(base + 'purpurina/?antiga'); await pg.waitForTimeout(500);   // (?antiga: o endereço sem ela leva para a Purpurina 80's nova, 24/Nov/2026)
  return pg;
}
async function contexto() {
  const ctx = await navegador.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await ctx.addInitScript(() => { localStorage.setItem('bolinho:idioma', 'pt'); localStorage.setItem('purpurina.semMusica', '1'); });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  return ctx;
}
async function estudioAcessorios(pg) {
  await pg.click('#btEntrar'); await pg.waitForTimeout(500);
  await pg.click('#btLivre'); await pg.waitForTimeout(500);
  if (await pg.isVisible('#janela')) { await pg.click('#janelaBotoes button:nth-child(2)'); await pg.waitForTimeout(500); }   // continuar o visual
  await pg.evaluate(() => [...document.querySelectorAll('.grupo-bt')].find((b) => b.getAttribute('aria-label') === 'Acessórios').click());
  await pg.waitForTimeout(300);
}
const imagem = (pg, url) => pg.evaluate((u) => new Promise((ok) => { const i = new Image(); i.onload = () => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0); ok({ w: i.width, h: i.height, canto: x.getImageData(1, 1, 1, 1).data[3], meio: x.getImageData(i.width / 2, i.height / 2, 1, 1).data[3] }); }; i.src = u; }), url);

test('exporta a personagem do Brincar livre para os outros jogos', async () => {
  const ctx = await contexto(), erros = [];
  try {
    let pg = await abrir(ctx, erros);
    await pg.waitForTimeout(2000);
    assert.deepEqual(await pg.evaluate(() => BolinhoPersonagens.listar().length), 0, 'sem ter brincado, nada é exportado');
    await pg.evaluate(() => localStorage.setItem('purpurina.atual', JSON.stringify(PurpurinaVisual.novo())));
    await pg.close(); pg = await abrir(ctx, erros);
    await pg.waitForFunction(() => BolinhoPersonagens.listar({ jogo: 'purpurina' }).length === 1, null, { timeout: 8000 });
    const p = await pg.evaluate(() => BolinhoPersonagens.pegar('purpurina:minha'));
    assert.equal(p.nome, "Purpurina 80's"); assert.equal(p.tipo, 'pessoa'); assert.equal(p.jogo, 'purpurina'); assert.equal(p.temCorpo, true);
    const r = await imagem(pg, p.retrato), c = await imagem(pg, p.corpo);
    assert.deepEqual([r.w, r.h, r.canto], [256, 256, 0], 'retrato 256×256 com fundo transparente');
    assert.ok(r.meio > 200, 'o rosto no meio do retrato');
    assert.deepEqual([c.w, c.h, c.canto], [384, 512, 0], 'corpo 384×512 com fundo transparente');
    assert.ok(c.meio > 200, 'o corpo no meio');
    // mudou no estúdio e saiu: exporta de novo (o retrato muda)
    const antes = p.atualizado;
    await estudioAcessorios(pg);
    await pg.click('#btSurpresa'); await pg.waitForTimeout(300);
    await pg.evaluate(() => history.back()); await pg.waitForTimeout(1500);
    const depois = await pg.evaluate(() => BolinhoPersonagens.listar({ jogo: 'purpurina' })[0].atualizado);
    assert.ok(depois > antes, 'saiu do estúdio com a personagem mudada: exportou de novo');
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('importa: o amiguinho do Meu Pequeno Amiguinho fica ao lado dela', async () => {
  const ctx = await contexto(), erros = [];
  try {
    const pg = await abrir(ctx, erros);
    await estudioAcessorios(pg);
    // sem amiguinho: a janela leva ao Meu Pequeno Amiguinho
    await pg.click('.bt-amigo'); await pg.waitForTimeout(300);
    const vazio = await pg.evaluate(() => ({ texto: document.getElementById('janelaTexto').textContent, botoes: [...document.querySelectorAll('#janelaBotoes button')].map((b) => b.textContent) }));
    assert.match(vazio.texto, /Monte um no Meu Pequeno Amiguinho/);
    assert.deepEqual(vazio.botoes, ['🧸 Montar no Meu Pequeno Amiguinho', 'Fechar']);
    await pg.click('#janelaBotoes button:nth-child(2)'); await pg.waitForTimeout(400);
    // outro jogo salva amiguinhos (e uma personagem que não é do Meu Pequeno Amiguinho, que não entra)
    await pg.evaluate(async () => {
      function img(cor, w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); c.fillStyle = cor; c.fillRect(w * 0.2, h * 0.1, w * 0.6, h * 0.8); return cv.toDataURL('image/png'); }
      await BolinhoPersonagens.salvar({ id: 'amiguinho:7', jogo: 'meu-amiguinho', nome: 'Pipoca', tipo: 'bicho', retrato: img('#ff9a3c', 256, 256), corpo: img('#ff9a3c', 384, 512), atualizado: 2000 });
      await BolinhoPersonagens.salvar({ id: 'amiguinho:8', jogo: 'meu-amiguinho', nome: 'Robozinho', tipo: 'robo', retrato: img('#3ab0ff', 256, 256), atualizado: 1000 });
      await BolinhoPersonagens.salvar({ id: 'vruuum:x', jogo: 'vruuum', nome: 'Piloto', tipo: 'pessoa', retrato: img('#0f0', 256, 256), atualizado: 3000 });
    });
    await pg.click('.bt-amigo'); await pg.waitForTimeout(300);
    const lista = await pg.evaluate(() => [...document.querySelectorAll('#janelaBotoes button')].map((b) => b.textContent + (b.querySelector('img') ? '+retrato' : '')));
    assert.deepEqual(lista, ['Pipoca+retrato', 'Robozinho+retrato', '🚫 Sem amiguinho']);
    await pg.click('#janelaBotoes button:nth-child(1)'); await pg.waitForTimeout(1000);
    const r = await pg.evaluate(() => { const im = document.querySelector('#boneca image.pp-amigo'); return { tem: !!im, href: im && im.getAttribute('href').slice(0, 15), escolhido: JSON.parse(localStorage.getItem('purpurina.amigo')), botao: document.querySelector('.bt-amigo').textContent }; });
    assert.deepEqual(r, { tem: true, href: 'data:image/png;', escolhido: 'amiguinho:7', botao: '🧸Amiguinho ✓' });
    // o corpo (384×512) é o que vai na mão, não o retrato, sem a sobra transparente em volta, e em pé perto do chão
    const pos = await pg.evaluate(() => { const im = document.querySelector('#boneca image.pp-amigo'); return { fonte: im.getAttribute('data-fonte'), w: +im.getAttribute('width'), h: +im.getAttribute('height'), pe: +im.getAttribute('y') + +im.getAttribute('height') }; });
    assert.equal(pos.fonte, 'corpo');
    assert.deepEqual([pos.h, pos.pe], [175, 640]);
    assert.ok(Math.abs(pos.w / pos.h - 0.6 * 384 / (0.8 * 512)) < 0.03, 'a proporção do desenho sem as sobras: ' + pos.w + '×' + pos.h);
    // a foto (camada da personagem) leva o amiguinho; girando ela some
    const svgs = await pg.evaluate(() => ({ foto: PurpurinaBoneca.svg(PurpurinaVisual.novo(), { id: 'f', fundo: false, amigo: true, largura: 100, altura: 180 }).includes('pp-amigo'),
      girando: PurpurinaBoneca.svg(PurpurinaVisual.novo(), { id: 'g', fundo: false, amigo: true, angulo: 90 }).includes('pp-amigo'),
      semPedir: PurpurinaBoneca.svg(PurpurinaVisual.novo(), { id: 'h', fundo: false }).includes('pp-amigo') }));
    assert.deepEqual(svgs, { foto: true, girando: false, semPedir: false });
    // continua ao abrir de novo; "Sem amiguinho" tira
    await pg.reload(); await pg.waitForTimeout(500);
    await estudioAcessorios(pg); await pg.waitForTimeout(600);
    assert.equal(await pg.evaluate(() => !!document.querySelector('#boneca image.pp-amigo')), true, 'lembra a escolha');
    await pg.click('.bt-amigo'); await pg.waitForTimeout(300);
    await pg.click('#janelaBotoes button:nth-child(3)'); await pg.waitForTimeout(500);
    assert.equal(await pg.evaluate(() => !!document.querySelector('#boneca image.pp-amigo') || localStorage.getItem('purpurina.amigo') !== null), false);
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});
