// Personagens que viajam entre os jogos (dono, 22/Nov/2026): a peça comum personagens.js (BolinhoPersonagens).
// - salvar / listar / pegar / remover, com filtro (jogo, tipo, excetoJogo), imagens no IndexedDB e índice no localStorage;
// - no máximo 40 (saem os mais antigos, e as imagens deles também); imagem grande sai comprimida (até ~60 KB);
// - sem IndexedDB: só o localStorage, com o retrato pequeno e sem o corpo;
// - avisa a outra aba (evento storage); nunca lança erro para o jogo;
// - todo jogo que carrega a peça a guarda no sw.js, logo depois do ../idioma.js, e o arquivo é JavaScript antigo (sem =>).
// Rodar da raiz do repositório: node --test teste/personagens.test.js
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const http = require('http');
const fs = require('fs');

const raiz = path.join(__dirname, '..');
const ler = (f) => fs.readFileSync(path.join(raiz, f), 'utf8');
const PAGINA = '<!doctype html><meta charset="utf-8"><title>teste</title><script src="/kids/personagens.js"></script>';
const servidor = http.createServer((q, r) => {
  const p = decodeURIComponent(q.url.split('?')[0]);
  if (p === '/kids/teste-personagens.html') { r.writeHead(200, { 'Content-Type': 'text/html' }); return r.end(PAGINA); }
  if (p === '/kids/personagens.js') { r.writeHead(200, { 'Content-Type': 'text/javascript' }); return r.end(ler('personagens.js')); }
  r.writeHead(404); r.end();
});

let navegador, base;
before(async () => {
  const { chromium } = require('playwright');
  await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + servidor.address().port + '/kids/teste-personagens.html';
  navegador = await chromium.launch();
});
after(async () => { if (navegador) await navegador.close(); servidor.close(); });

async function pagina(ctx, semBanco) {
  const c = ctx || await navegador.newContext();
  if (semBanco) await c.addInitScript(() => { try { Object.defineProperty(window, 'indexedDB', { value: undefined, configurable: true }); } catch (e) { /* ok */ } });
  const pg = await c.newPage(), erros = [];
  pg.on('pageerror', (e) => erros.push(e.message));
  await pg.goto(base);
  // ajudante na página: uma imagem de teste (bolinha colorida em fundo transparente), como dataURL
  await pg.evaluate(() => {
    window.desenho = function (cor, w, h, ruido) {
      const cv = document.createElement('canvas'); cv.width = w || 256; cv.height = h || 256;
      const c = cv.getContext('2d'); c.fillStyle = cor; c.beginPath(); c.arc(cv.width / 2, cv.height / 2, cv.width / 3, 0, 7); c.fill();
      if (ruido) { const d = c.getImageData(0, 0, cv.width, cv.height); for (let i = 0; i < d.data.length; i += 4) { d.data[i] = Math.random() * 255; d.data[i + 1] = Math.random() * 255; d.data[i + 2] = Math.random() * 255; d.data[i + 3] = 255; } c.putImageData(d, 0, 0); }
      return cv.toDataURL('image/png');
    };
  });
  return { ctx: c, pg, erros };
}
const bytes = (u) => Math.round((u.length - u.indexOf(',') - 1) * 0.75);

test('salvar, listar (com filtro), pegar e remover', async () => {
  const { ctx, pg, erros } = await pagina();
  try {
    const r = await pg.evaluate(async () => {
      const P = window.BolinhoPersonagens, avisos = [];
      P.aoMudar((e) => avisos.push(e.acao + ':' + e.id));
      const a = await P.salvar({ id: 'amiguinho:1', jogo: 'meu-amiguinho', nome: 'Pipoca', tipo: 'bicho', retrato: desenho('#f80'), corpo: desenho('#f80', 384, 512), atualizado: 1000 });
      await P.salvar({ id: 'purpurina:minha', jogo: 'purpurina', nome: 'Purpurina 80s', tipo: 'pessoa', retrato: desenho('#f0c'), atualizado: 2000 });
      await P.salvar({ id: 'amiguinho:2', jogo: 'meu-amiguinho', nome: 'Robozinho', tipo: 'robo', retrato: desenho('#0af'), atualizado: 3000 });
      const todos = P.listar().map((x) => x.id);
      const soAmig = P.listar({ jogo: 'meu-amiguinho' }).map((x) => x.id);
      const semPurp = P.listar({ excetoJogo: 'purpurina' }).map((x) => x.id);
      const robos = P.listar({ tipo: 'robo' }).map((x) => x.id);
      const um = await P.pegar('amiguinho:1');
      // o retrato continua com fundo transparente (canto) e a cor no meio
      const px = await new Promise((ok) => { const img = new Image(); img.onload = () => { const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const c = cv.getContext('2d'); c.drawImage(img, 0, 0); ok({ w: img.width, h: img.height, canto: c.getImageData(2, 2, 1, 1).data[3], meio: [...c.getImageData(128, 128, 1, 1).data] }); }; img.src = um.retrato; });
      const corpo = await new Promise((ok) => { const img = new Image(); img.onload = () => ok([img.width, img.height]); img.src = um.corpo; });
      // salvar de novo o mesmo id atualiza (não duplica)
      await P.salvar({ id: 'amiguinho:1', jogo: 'meu-amiguinho', nome: 'Pipoca 2', tipo: 'bicho', retrato: desenho('#f80'), atualizado: 4000 });
      const depois = P.listar();
      const removeu = await P.remover('purpurina:minha'), deNovo = await P.remover('purpurina:minha');
      const sumiu = await P.pegar('purpurina:minha');
      const banco = await new Promise((ok) => { const r = indexedDB.open('bolinho-personagens'); r.onsuccess = () => { const q = r.result.transaction('imagens').objectStore('imagens').getAllKeys(); q.onsuccess = () => ok(q.result.sort()); }; });
      const indice = JSON.parse(localStorage.getItem('bolinho:personagens'));
      return { a, todos, soAmig, semPurp, robos, um: { nome: um.nome, tipo: um.tipo, temCorpo: um.temCorpo, mini: um.mini.slice(0, 15) }, px, corpo, depois: depois.map((x) => x.id + '=' + x.nome), removeu, deNovo, sumiu, banco, avisos,
        indiceSemImagemGrande: indice.lista.every((x) => !x.retrato && !x.corpo), tamIndice: localStorage.getItem('bolinho:personagens').length };
    });
    assert.equal(r.a.id, 'amiguinho:1'); assert.equal(r.a.temCorpo, true);
    assert.deepEqual(r.todos, ['amiguinho:2', 'purpurina:minha', 'amiguinho:1'], 'do mais novo para o mais velho');
    assert.deepEqual(r.soAmig, ['amiguinho:2', 'amiguinho:1']);
    assert.deepEqual(r.semPurp, ['amiguinho:2', 'amiguinho:1']);
    assert.deepEqual(r.robos, ['amiguinho:2']);
    assert.deepEqual(r.um, { nome: 'Pipoca', tipo: 'bicho', temCorpo: true, mini: 'data:image/webp' });
    assert.deepEqual([r.px.w, r.px.h], [256, 256]);
    assert.equal(r.px.canto, 0, 'fundo transparente');
    assert.ok(r.px.meio[0] > 200 && r.px.meio[2] < 60 && r.px.meio[3] > 200, 'a cor do desenho no meio: ' + r.px.meio);
    assert.deepEqual(r.corpo, [384, 512]);
    assert.deepEqual(r.depois, ['amiguinho:1=Pipoca 2', 'amiguinho:2=Robozinho', 'purpurina:minha=Purpurina 80s'], 'atualizou sem duplicar e subiu para o começo');
    assert.equal(r.removeu, true); assert.equal(r.deNovo, false); assert.equal(r.sumiu, null);
    assert.deepEqual(r.banco, ['amiguinho:1', 'amiguinho:2'], 'as imagens de quem saiu saem do banco');
    assert.ok(r.indiceSemImagemGrande, 'o índice do localStorage não leva as imagens grandes');
    assert.ok(r.tamIndice < 20000, 'índice leve: ' + r.tamIndice);
    assert.deepEqual(r.avisos, ['salvou:amiguinho:1', 'salvou:purpurina:minha', 'salvou:amiguinho:2', 'salvou:amiguinho:1', 'removeu:purpurina:minha']);
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('no máximo 40: saem os mais antigos (e as imagens deles); imagem grande sai comprimida', async () => {
  const { ctx, pg, erros } = await pagina();
  try {
    const r = await pg.evaluate(async () => {
      const P = window.BolinhoPersonagens, img = desenho('#3a3');
      for (let i = 1; i <= 43; i++) await P.salvar({ id: 'teste:' + i, jogo: 'teste', nome: 'N' + i, tipo: 'bicho', retrato: img, atualizado: i * 10 });
      const ids = P.listar().map((x) => x.id);
      // foto barulhenta de 1024×1024: tem de caber em ~60 KB
      await P.salvar({ id: 'teste:grande', jogo: 'teste', nome: 'Grande', tipo: 'pessoa', retrato: desenho('#000', 1024, 1024, true), corpo: desenho('#000', 1024, 1400, true) });
      const g = await P.pegar('teste:grande');
      const banco = await new Promise((ok) => { const r = indexedDB.open('bolinho-personagens'); r.onsuccess = () => { const q = r.result.transaction('imagens').objectStore('imagens').getAllKeys(); q.onsuccess = () => ok(q.result); }; });
      return { n: ids.length, primeiro: ids[0], ultimo: ids[ids.length - 1], tem1: ids.includes('teste:1'), tem3: ids.includes('teste:3'), tem4: ids.includes('teste:4'),
        nDepois: P.listar().length, ret: g.retrato.length, corpo: g.corpo.length, mini: g.mini.length, banco: banco.length, banco1: banco.includes('teste:1') };
    });
    assert.equal(r.n, 40);
    assert.equal(r.primeiro, 'teste:43'); assert.equal(r.ultimo, 'teste:4');
    assert.ok(!r.tem1 && !r.tem3 && r.tem4, 'saíram os 3 mais antigos');
    assert.equal(r.nDepois, 40);
    assert.ok(r.ret * 0.75 <= 61000, 'retrato até ~60 KB: ' + Math.round(r.ret * 0.75));
    assert.ok(r.corpo * 0.75 <= 61000, 'corpo até ~60 KB: ' + Math.round(r.corpo * 0.75));
    assert.ok(r.mini * 0.75 <= 6500, 'retratinho pequeno: ' + Math.round(r.mini * 0.75));
    assert.equal(r.banco, 40, 'o banco fica só com as imagens dos 40'); assert.equal(r.banco1, false);
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('sem IndexedDB: só o localStorage, retrato pequeno e sem corpo', async () => {
  const { ctx, pg, erros } = await pagina(null, true);
  try {
    const r = await pg.evaluate(async () => {
      const P = window.BolinhoPersonagens;
      const s = await P.salvar({ id: 'amiguinho:9', jogo: 'meu-amiguinho', nome: 'Bolota', tipo: 'bicho', retrato: desenho('#c0f'), corpo: desenho('#c0f', 384, 512) });
      const l = P.listar(), g = await P.pegar('amiguinho:9');
      const tam = await new Promise((ok) => { const img = new Image(); img.onload = () => ok(img.width); img.src = g.retrato; });
      const rem = await P.remover('amiguinho:9');
      return { semBanco: typeof indexedDB, s: !!s, n: l.length, mini: !!l[0].mini, temCorpo: l[0].temCorpo, tam, corpo: g.corpo, rem, depois: P.listar().length };
    });
    assert.equal(r.semBanco, 'undefined');
    assert.equal(r.s, true); assert.equal(r.n, 1); assert.equal(r.mini, true, 'a lista tem a imagem para o botão');
    assert.equal(r.temCorpo, false); assert.equal(r.corpo, null);
    assert.equal(r.tam, 96, 'retrato pequeno');
    assert.equal(r.rem, true); assert.equal(r.depois, 0);
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('avisa a outra aba e nunca lança erro para o jogo', async () => {
  const { ctx, pg, erros } = await pagina();
  try {
    const { pg: pg2 } = await pagina(ctx);
    await pg2.evaluate(() => { window.avisos = []; window.BolinhoPersonagens.aoMudar((e) => window.avisos.push(e.acao)); });
    await pg.evaluate(() => window.BolinhoPersonagens.salvar({ id: 'purpurina-nova:minha', jogo: 'purpurina-nova', nome: 'Purpurina Nova', tipo: 'pessoa', retrato: desenho('#f0c') }));
    await pg2.waitForFunction(() => window.avisos.length > 0, null, { timeout: 5000 });
    const outra = await pg2.evaluate(() => ({ avisos: window.avisos, lista: window.BolinhoPersonagens.listar().map((x) => x.id) }));
    assert.deepEqual(outra, { avisos: ['outra-aba'], lista: ['purpurina-nova:minha'] });
    const r = await pg.evaluate(async () => {
      const P = window.BolinhoPersonagens, res = [];
      res.push(await P.salvar(null), await P.salvar({ id: 1 }), await P.salvar({ id: 'x:1', jogo: 'x' }), await P.salvar({ id: 'x:2', jogo: 'x', retrato: 'data:image/png;base64,quebrado' }));
      res.push(await P.pegar('nao-tem'), await P.remover('nao-tem'));
      const desliga = P.aoMudar(() => { throw new Error('jogo com defeito'); }); const ok = await P.salvar({ id: 'x:3', jogo: 'x', retrato: desenho('#000') }); desliga();
      localStorage.setItem('bolinho:personagens', '{quebrado');
      res.push(P.listar(), await P.pegar('x:3'), typeof P.aoMudar('não é função'));
      return { res, ok: !!ok };
    });
    assert.deepEqual(r.res, [null, null, null, null, null, false, [], null, 'function']);
    assert.equal(r.ok, true, 'um ouvinte com defeito não atrapalha o salvar');
    assert.deepEqual(erros, []);
  } finally { await ctx.close(); }
});

test('todo jogo que carrega a peça a guarda no sw.js, logo depois do ../idioma.js; JavaScript antigo', () => {
  const codigo = ler('personagens.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.ok(!/=>|\blet\b|\bconst\b|`/.test(codigo), 'personagens.js em JavaScript antigo (sem =>, let, const, crase)');
  const jogos = fs.readdirSync(raiz).filter((g) => fs.existsSync(path.join(raiz, g, 'index.html')) && fs.existsSync(path.join(raiz, g, 'sw.js')));
  const usam = jogos.filter((g) => ler(g + '/index.html').includes('../personagens.js'));
  for (const g of ['purpurina', 'purpurina-nova', 'vruuum']) assert.ok(usam.includes(g), g + ' carrega a peça');
  for (const g of usam) {
    const html = ler(g + '/index.html');
    assert.ok(html.includes('<script src="../personagens.js" data-fora-do-arquivo></script>'), g + ': com data-fora-do-arquivo');
    assert.match(html, /<script src="\.\.\/idioma\.js"[^>]*><\/script>\s*<script src="\.\.\/personagens\.js"/, g + ': logo depois do ../idioma.js');
    assert.ok(ler(g + '/sw.js').includes("'../personagens.js'"), g + ': ../personagens.js no ARQUIVOS do sw.js');
  }
});
