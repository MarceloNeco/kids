// Navios, efeitos e sons da Batalha Naval (v0.3.0): node --test batalha-naval/teste/visual.test.js (rodar da raiz do kids)
// Confere: cada tipo de navio é desenhado (SVG) ocupando exatamente as casas dele, deitado e em pé; água, acerto e
// afundou disparam o efeito, a marca e o som certos (o míssil voa antes); "menos movimento" mostra só as marcas paradas;
// todos os sons tocam de verdade no Web Audio do Chromium, abaixam a música e obedecem o botão de som; partidas
// inteiras sem erro no console num celular pequeno (360×740) e no computador (1280×800).
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require('playwright');
const Nav = require('../navios.js');
const L = require('../logica.js');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml', '.md': 'text/markdown; charset=utf-8' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.startsWith('/solverone-dados/')) { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(p.endsWith('/kids.json') ? '{"recursos":{"ingles":{"ligado":true}}}' : '{}'); return; }   // e o inglês ligado (../idioma.js): o teste troca o idioma
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
let base, browser;
test.before(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/batalha-naval/';
  browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
});
test.after(async () => { await browser.close(); server.close(); });

// grava os sons pedidos, os efeitos de tela e as vibrações (os objetos são os mesmos que o app.js usa)
const ESPIAO = () => {
  window.__vib = [];
  Object.defineProperty(navigator, 'vibrate', { configurable: true, value: p => { window.__vib.push(p); return true; } });
  document.addEventListener('DOMContentLoaded', () => {
    window.__sons = []; window.__fx = []; window.__treme = 0;
    const ef = window.BNSom.efeito; window.BNSom.efeito = n => { window.__sons.push(n); return ef(n); };
    ['tiro', 'agua', 'explosao', 'bolhas', 'tremer'].forEach(k => { const f = window.BNFx[k]; window.BNFx[k] = function (...a) { window.__fx.push([k, k === 'explosao' ? !!a[2] : null]); return f.apply(this, a); }; });
    new MutationObserver(ms => ms.forEach(m => { if (m.target.classList && (m.target.classList.contains('treme') || m.target.classList.contains('treme-forte'))) window.__treme++; }))
      .observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  });
};
function vigiar(pg) {
  const erros = [];
  pg.on('console', m => { if (m.type() === 'error') erros.push(m.text() + ' @' + ((m.location() && m.location().url) || '')); });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  return erros;
}
async function abrir(op = {}, url = base + '?teste') {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 1000, height: 820 }, locale: 'pt-BR' }, op));
  await ctx.route(/\.mp3$/, r => r.fulfill({ status: 200, contentType: 'audio/mpeg', body: Buffer.alloc(0) }));
  await ctx.addInitScript(ESPIAO);
  const pg = await ctx.newPage(); const erros = vigiar(pg);
  await pg.goto(url); await pg.waitForSelector('#inicio.ativa');
  return { ctx, pg, erros };
}
const celulas = nv => Array.from({ length: nv.tam }, (_, i) => nv.h ? [nv.x + i, nv.y] : [nv.x, nv.y + i]);

test('tipos de navio: cada nível tem nomes diferentes, sempre com submarino e destróier, em PT e EN', () => {
  for (const nivel of Object.keys(L.NIVEIS)) {
    const tams = L.NIVEIS[nivel].frota, tipos = tams.map((_, i) => Nav.tipo(tams, i));
    assert.equal(new Set(tipos).size, tipos.length, 'nome repetido no ' + nivel + ': ' + tipos);
    assert.ok(tipos.includes('submarino') && tipos.includes('destroier'), nivel + ': ' + tipos);
    tipos.forEach((t, i) => { assert.equal(Nav.TIPOS[t].tam, tams[i]); assert.ok(Nav.TIPOS[t].pt && Nav.TIPOS[t].en); });
  }
  assert.deepEqual(Nav.tipo(L.NIVEIS.dificil.frota, 0), 'porta');
  assert.equal(Nav.daFrota([{ x: 0, y: 0, tam: 3, h: true }, { x: 0, y: 2, tam: 3, h: false }], { x: 0, y: 2, tam: 3, h: false }), 'fragata');
});

test('cada tipo de navio desenhado em SVG, deitado e em pé, ocupando exatamente as suas casas', async () => {
  for (const vp of [{ width: 360, height: 740 }, { width: 1280, height: 800 }]) {
    const { ctx, pg, erros } = await abrir({ viewport: vp, hasTouch: vp.width < 500 });
    await pg.click('#btPC'); await pg.click('[data-nivel="dificil"]');
    const toque = async (x, y) => { const c = await pg.$eval('#arrTab', (el, [x, y]) => { const r = el._c[y][x].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, [x, y]); await pg.mouse.click(c[0], c[1]); };
    const medir = () => pg.$eval('#arrTab', el => [...el.querySelectorAll('svg.navio-svg')].map(s => {
      const r = s.getBoundingClientRect(), [c0, c1] = s.style.gridColumn.split(' / span ').map(Number), [r0, r1] = s.style.gridRow.split(' / span ').map(Number);
      const a = el._c[r0 - 2][c0 - 2].getBoundingClientRect(), b = el._c[r0 - 2 + r1 - 1][c0 - 2 + c1 - 1].getBoundingClientRect();
      return { tipo: s.getAttribute('data-tipo'), cls: s.getAttribute('class'), vb: s.getAttribute('viewBox'), partes: s.querySelectorAll('path,rect,circle,ellipse').length,
        r: [r.left, r.top, r.right, r.bottom], casas: [a.left, a.top, b.right, b.bottom], span: [c1, r1] };
    }));
    const conferir = (lista, h) => {
      assert.deepEqual(lista.map(n => n.tipo).sort(), Object.keys(Nav.TIPOS).sort(), 'todos os 7 tipos');
      for (const n of lista) {
        const tam = Nav.TIPOS[n.tipo].tam;
        assert.match(n.cls, h ? /\bh\b/ : /\bv\b/, n.tipo);
        assert.deepEqual(n.span, h ? [tam, 1] : [1, tam], n.tipo + ' ocupa ' + tam + ' casas');
        assert.equal(n.vb, h ? `0 0 ${tam * 100} 100` : `0 0 100 ${tam * 100}`);
        assert.ok(n.partes >= 20, n.tipo + ' com detalhes: ' + n.partes);
        for (let k = 0; k < 4; k++) assert.ok(Math.abs(n.r[k] - n.casas[k]) <= 1.5, `${n.tipo} ${h ? 'deitado' : 'em pé'} fora das casas (${vp.width}px): ${n.r} × ${n.casas}`);
        const cel = Math.min(n.casas[2] - n.casas[0], n.casas[3] - n.casas[1]);
        assert.ok(cel >= 20, 'casa pequena demais: ' + cel);
      }
    };
    for (let y = 0; y < 7; y++) await toque(6, y);                    // os 7 deitados, um por linha (longe do botão de tela cheia)
    conferir(await medir(), true);
    // na bandeja: desenho + nome em PT, e em EN
    assert.deepEqual(await pg.$$eval('#arrPecas .peca', l => l.map(b => !!b.querySelector('svg.navio-svg'))), [true, true, true, true, true, true, true]);
    assert.match(await pg.textContent('#arrPecas'), /Porta-aviões.*Encouraçado.*Cruzador.*Submarino.*Fragata.*Destróier.*Lancha-patrulha/s);
    await pg.click('#btLingua');
    assert.match(await pg.textContent('#arrPecas'), /Aircraft carrier.*Battleship.*Cruiser.*Submarine.*Frigate.*Destroyer.*Patrol boat/s);
    await pg.click('#btLingua');
    await pg.click('#btLimpar'); await pg.click('#btGirar');             // agora em pé
    await pg.$eval('#arrTab', el => el.scrollIntoView({ block: 'center' }));
    for (let x = 0; x < 7; x++) await toque(x, 0);
    conferir(await medir(), false);
    assert.equal(await pg.$$eval('#arrTab .c.nv', l => l.length), 5 + 4 + 4 + 3 + 3 + 2 + 2);
    assert.deepEqual(erros, []);
    await ctx.close();
  }
});

// joga contra o computador no Fácil com tempo de verdade e mira onde quiser (a frota do computador é conhecida)
async function partida(op, url = base) {
  const a = await abrir(op, url);
  await a.pg.click('#btPC'); await a.pg.click('[data-nivel="facil"]');
  await a.pg.click('#btSortear'); await a.pg.click('#btPronto'); await a.pg.waitForSelector('#jogo.ativa');
  await a.pg.waitForTimeout(900);                // a corneta de começar já tocou
  a.frota = await a.pg.evaluate(() => window.BNApp.jogo().frotas[1]);
  const ocup = new Set(a.frota.flatMap(celulas).map(c => c.join()));
  a.agua = []; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (!ocup.has(x + ',' + y)) a.agua.push([x, y]);
  a.atirar = async (x, y) => {
    await a.pg.waitForFunction(() => document.querySelector('#tabAlvo').classList.contains('pode'), null, { timeout: 15000 });
    await a.pg.evaluate(() => { window.__sons = []; window.__fx = []; window.__vib = []; window.__treme = 0; });
    await a.pg.click(`#tabAlvo button.c[data-x="${x}"][data-y="${y}"]`);
  };
  a.cls = (x, y) => a.pg.$eval('#tabAlvo', (el, [x, y]) => el._c[y][x].className, [x, y]);
  return a;
}

test('água, acerto e afundou: míssil, marca, efeito, som, tremor, vibração e a faixa AFUNDOU com o nome do navio', async () => {
  const a = await partida({ viewport: { width: 412, height: 915 }, hasTouch: true });
  const { pg } = a;
  // água: enquanto o míssil voa a marca não aparece; depois respingo + som de água
  const [ax, ay] = a.agua[0];
  await a.atirar(ax, ay);
  assert.match(await a.cls(ax, ay), /\bchegando\b/);
  await pg.waitForFunction(() => window.__sons.includes('agua'));
  assert.deepEqual(await pg.evaluate(() => window.__sons.slice(0, 2)), ['disparo', 'agua']);
  assert.match(await a.cls(ax, ay), /\bagua\b/); assert.doesNotMatch(await a.cls(ax, ay), /chegando/);
  assert.deepEqual(await pg.evaluate(() => window.__fx.map(f => f[0])), ['tiro', 'agua']);
  assert.equal(await pg.evaluate(() => window.__treme), 0, 'água não treme a tela');
  assert.equal(await pg.$eval('#estouro', e => e.className), 'estouro agua');
  // acerto (num navio de 3 ou mais, sem afundar)
  const grande = a.frota.find(nv => nv.tam >= 3), [hx, hy] = celulas(grande)[0];
  await a.atirar(hx, hy);
  await pg.waitForFunction(() => window.__sons.includes('acerto'));
  assert.deepEqual(await pg.evaluate(() => window.__sons.slice(0, 2)), ['disparo', 'acerto']);
  assert.match(await a.cls(hx, hy), /\bacerto\b/);
  assert.deepEqual(await pg.evaluate(() => window.__fx.filter(f => f[0] !== 'tiro')), [['explosao', false], ['tremer', null]]);
  assert.ok(await pg.evaluate(() => window.__treme) >= 1, 'acerto treme a tela');
  assert.deepEqual(await pg.evaluate(() => window.__vib), [80]);
  const fogo = await pg.$eval('#tabAlvo', (el, [x, y]) => { const s = getComputedStyle(el._c[y][x], '::before'), f = getComputedStyle(el._c[y][x], '::after'); return [s.backgroundImage.slice(0, 30), s.animationName, f.animationName]; }, [hx, hy]);
  assert.match(fogo[0], /data:image\/svg/); assert.equal(fogo[1], 'chama'); assert.equal(fogo[2], 'fumaca');
  // afundou: o menor navio inteiro
  const peq = a.frota[a.frota.length - 1], tipo = Nav.tipo(a.frota.map(n => n.tam), a.frota.length - 1);
  for (const [x, y] of celulas(peq).slice(0, -1)) await a.atirar(x, y);
  const [sx, sy] = celulas(peq).slice(-1)[0];
  await a.atirar(sx, sy);
  // durante o voo o navio afundado ainda não aparece
  assert.match(await pg.$eval('#tabAlvo', el => [...el.querySelectorAll('svg.navio-svg')].map(s => s.getAttribute('class')).join('|')), /escondido/);
  await pg.waitForFunction(() => window.__sons.includes('afundou'));
  assert.deepEqual(await pg.evaluate(() => window.__sons.slice(0, 2)), ['disparo', 'afundou']);
  const nav = await pg.$eval('#tabAlvo', el => [...el.querySelectorAll('svg.navio-svg')].map(s => [s.getAttribute('data-tipo'), s.getAttribute('class')]));
  assert.equal(nav.length, 1); assert.equal(nav[0][0], tipo); assert.match(nav[0][1], /afundado/); assert.match(nav[0][1], /afundando/);
  assert.equal(await pg.$eval('#estouro', e => e.className), 'estouro afundou');
  assert.match(await pg.textContent('#estouro'), new RegExp('AFUNDOU!.*' + Nav.TIPOS[tipo].pt));
  await pg.waitForFunction(n => window.__fx.filter(f => f[0] === 'explosao').length >= n, peq.tam);
  const fx = await pg.evaluate(() => window.__fx);
  assert.ok(fx.filter(f => f[0] === 'explosao').every(f => f[1] === true), 'explosões fortes ao afundar');
  assert.ok(fx.some(f => f[0] === 'bolhas'), 'bolhas');
  assert.deepEqual(await pg.evaluate(() => window.__vib), [[90, 50, 140, 50, 240]]);
  for (const [x, y] of celulas(peq)) assert.match(await a.cls(x, y), /\bafundado\b/);
  // depois de afundar: navio queimado (a animação acaba)
  await pg.waitForFunction(() => [...document.querySelectorAll('#tabAlvo svg.navio-svg')].every(s => !/afundando/.test(s.getAttribute('class'))), null, { timeout: 5000 });
  assert.match(await pg.$eval('#tabAlvo svg.navio-svg', s => getComputedStyle(s.querySelector('.queimado')).display), /inline/);
  // o computador atira em mim: assobio do tiro chegando
  await pg.waitForFunction(() => window.__sons.includes('assobio'), null, { timeout: 10000 });
  assert.ok(await pg.evaluate(() => window.BNFx.contagem().criados) > 50, 'partículas desenhadas');
  assert.deepEqual(a.erros, []);
  await a.ctx.close();
});

test('menos movimento (prefers-reduced-motion): marcas paradas, sem míssil, sem partículas, sem tremer; os sons continuam', async () => {
  const a = await partida({ viewport: { width: 412, height: 915 }, hasTouch: true, reducedMotion: 'reduce' });
  const { pg } = a;
  assert.equal(await pg.evaluate(() => window.BNFx.ativo()), false);
  const [ax, ay] = a.agua[0];
  await a.atirar(ax, ay);
  assert.match(await a.cls(ax, ay), /\bagua\b/); assert.doesNotMatch(await a.cls(ax, ay), /chegando/);
  assert.deepEqual(await pg.evaluate(() => window.__sons), ['agua']);
  const grande = a.frota.find(nv => nv.tam >= 3), [hx, hy] = celulas(grande)[0];
  await a.atirar(hx, hy);
  assert.match(await a.cls(hx, hy), /\bacerto\b/);
  const anim = await pg.$eval('#tabAlvo', (el, [x, y]) => [getComputedStyle(el._c[y][x], '::before').animationName, getComputedStyle(el._c[y][x], '::after').animationName,
    getComputedStyle(el._c[y][x], '::before').backgroundImage.slice(0, 20), getComputedStyle(el.querySelector('.mar-fundo'), '::before').animationName], [hx, hy]);
  assert.deepEqual(anim.slice(0, 2), ['none', 'none'], 'fogo e fumaça parados');
  assert.match(anim[2], /data:image\/svg/, 'a marca do fogo aparece');
  assert.equal(anim[3], 'none', 'o mar parado');
  const peq = a.frota[a.frota.length - 1];
  for (const [x, y] of celulas(peq)) await a.atirar(x, y);
  assert.ok((await pg.evaluate(() => window.__sons)).includes('afundou'));
  assert.doesNotMatch(await pg.$eval('#tabAlvo svg.navio-svg', s => s.getAttribute('class')), /afundando|escondido/);
  await pg.waitForTimeout(400);
  assert.equal(await pg.evaluate(() => window.__treme), 0, 'não treme');
  assert.deepEqual(await pg.evaluate(() => window.BNFx.contagem()), { criados: 0, vivos: 0 });
  assert.equal(await pg.$('#fx'), null, 'nenhum canvas de efeitos');
  assert.deepEqual(a.erros, []);
  await a.ctx.close();
});

test('sons: todos tocam no Web Audio de verdade, abaixam a música e obedecem o botão 🔊', async () => {
  const { ctx, pg, erros } = await abrir();
  await pg.click('#btPC');                       // um toque libera o som
  await pg.waitForFunction(() => window.BNSom.efeito('toque'));
  const nomes = await pg.evaluate(() => window.BNSom.EFEITOS);
  for (const n of ['toque', 'por', 'girar', 'pronto', 'comecou', 'vez', 'disparo', 'assobio', 'agua', 'acerto', 'afundou', 'vitoria', 'derrota']) assert.ok(nomes.includes(n), 'falta o som ' + n);
  const vol = await pg.evaluate(async lista => {
    const v = []; const orig = window.Trilha.volume; window.Trilha.volume = x => { v.push(x); return orig(x); };
    const ok = lista.map(n => window.BNSom.efeito(n));
    return { ok, v };
  }, nomes);
  assert.ok(vol.ok.every(Boolean), 'algum som falhou: ' + nomes.filter((n, i) => !vol.ok[i]));
  assert.ok(vol.v.includes(0.3), 'a música abaixa durante os efeitos');
  await pg.waitForTimeout(3800);
  assert.equal(await pg.evaluate(() => window.Trilha._audio ? window.Trilha._audio.volume > 0.2 : true), true, 'a música volta depois');
  // botão de som desligado: nada toca
  await pg.click('.voltar >> nth=0').catch(() => {});
  await pg.click('#btEfeitos');
  assert.equal(await pg.evaluate(() => window.BNSom.efeito('acerto')), false);
  await pg.click('#btEfeitos');
  assert.equal(await pg.evaluate(() => window.BNSom.efeito('acerto')), true);
  assert.deepEqual(erros, []);
  await ctx.close();
});

test('partidas inteiras com os efeitos, sem erro no console: celular 360×740 e computador 1280×800', async () => {
  for (const [vp, toque] of [[{ width: 360, height: 740 }, true], [{ width: 1280, height: 800 }, false]]) {
    const { ctx, pg, erros } = await abrir({ viewport: vp, hasTouch: toque });
    await pg.click('#btPC'); await pg.click('[data-nivel="facil"]'); await pg.click('#btSortear'); await pg.click('#btPronto');
    await pg.waitForSelector('#jogo.ativa');
    for (let i = 0; i < 900; i++) {
      if (await pg.$eval('#fimCaixa', f => !f.hidden)) break;
      const c = await pg.$('#tabAlvo.pode button.c:not(:disabled)'); if (c) await c.click().catch(() => {});
      await pg.waitForTimeout(40);
    }
    assert.equal(await pg.evaluate(() => window.BNApp.dados().fase), 'fim');
    const larg = await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(larg <= 0, 'rola para o lado em ' + vp.width + 'px');
    assert.ok(await pg.evaluate(() => window.BNFx.contagem().criados) > 0);
    // navios afundados (meus ou do computador) aparecem como casco queimado
    assert.ok(await pg.$$eval('svg.navio-svg.afundado', l => l.length) >= 1);
    await pg.waitForTimeout(1500);
    assert.deepEqual(erros, [], 'erros no console (' + vp.width + 'px)');
    await ctx.close();
  }
});
