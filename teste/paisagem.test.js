// Celular deitado (pedido do dono, 06/Nov/2026, Galaxy S24 no Chrome): em todo jogo, com o celular deitado,
// - a capa mostra os botões de começar sem rolar e sem nada saindo para o lado;
// - na tela de jogar a página não rola, a área do jogo ocupa a altura (pelo menos ~70%; a Bagunçolândia, toda),
//   a pinça não amplia a página (viewport ou touch-action) e arrastar o dedo em cima do jogo não move a página;
// - nenhum erro no console.
// A Dança na Sala se joga com o corpo (o dedo não joga): lá o vídeo e a câmera ficam inteiros na primeira tela e os
// controles continuam embaixo, rolando.
// Rodar da raiz do repositório: node --test teste/paisagem.test.js
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

const TAMANHOS = [[915, 412], [844, 390]];
const JOGOS = [
  { id: 'baguncolandia', url: 'baguncolandia/?teste', capa: ['#btTV', '#btCel', '#btSolo', '#btToque'], alvo: '#tvCanvas', altura: 0.95,
    tamanhos: [[915, 412], [844, 390], [915, 356]],   // 915×356: o S24 com a barra do Chrome
    jogar: async (pg) => { await pg.click('#btToque'); await pg.fill('#nome', 'Lara'); await pg.click('#btEntrar');
      await pg.waitForFunction(() => window.BaguncaApp.TVApp.tv.fase === 'lobby', null, { timeout: 20000 }); await pg.click('#localComecar');
      await pg.waitForFunction(() => window.BaguncaApp.TVApp.tv.fase === 'jogando' && document.getElementById('tv').classList.contains('casa'), null, { timeout: 20000 }); } },
  { id: 'peluqueria', url: 'peluqueria/', entrada: '#btEntrar', capa: ['#btJogar'], alvo: '#palco',
    jogar: async (pg) => { await pg.click('#btJogar'); await pg.waitForSelector('#rodada.ativa, #rodada:not([hidden])', { timeout: 15000 }).catch(() => {}); await pg.waitForTimeout(3600); } },
  { id: 'vruuum', url: 'vruuum/?teste', entrada: '#btEntrar', capa: ['#btCorrer'], alvo: '#tela',
    jogar: async (pg) => { await pg.click('#btCorrer'); await pg.waitForTimeout(2000); } },
  { id: 'purpurina', url: 'purpurina/?teste', entrada: '#btEntrar', capa: ['#btLivre'], alvo: '#palco',
    jogar: async (pg) => { await pg.click('#btLivre'); await pg.waitForTimeout(600); } },
  { id: 'rabiscolandia', url: 'rabiscolandia/?teste', entrada: '#btEntrar', capa: ['#btLivre', '#btLivro', '#btNumeros'], alvo: '#tela',
    jogar: async (pg) => { await pg.click('#btLivre'); await pg.waitForTimeout(800); const x = await pg.$('button.tour-bt[aria-label*="Sair"]'); if (x) await x.click(); await pg.waitForTimeout(300); } },
  { id: 'campo-minado', url: 'campo-minado/?teste', capa: ['#btFacil', '#btMedio', '#btDificil'], alvo: '#tabuleiro',
    jogar: async (pg) => { await pg.click('#btFacil'); await pg.waitForTimeout(500); } },
  { id: 'batalha-naval (arrumar)', url: 'batalha-naval/?teste', capa: ['#btAmigos', '#btPerto', '#btPC', '#btPassa'], alvo: '#arrTab',
    jogar: async (pg) => { await pg.click('#btPC'); await pg.click('button.nivel[data-nivel="facil"]'); await pg.waitForTimeout(500); } },
  { id: 'batalha-naval (jogo)', url: 'batalha-naval/?teste', alvo: '#tabAlvo',
    jogar: async (pg) => { await pg.click('#btPC'); await pg.click('button.nivel[data-nivel="facil"]'); await pg.click('#btSortear'); await pg.click('#btPronto'); await pg.waitForTimeout(1200); } },
  { id: 'enigmas', url: 'enigmas/?teste', capa: ['#btFacil', '#btMedio', '#btDificil'], alvo: '#lousa',
    jogar: async (pg) => { await pg.click('#btFacil'); await pg.waitForTimeout(600); } },
  { id: 'labirinto', url: 'labirinto/?teste', capa: ['#btJogar'], alvo: '#palco',
    jogar: async (pg) => { await pg.click('#btJogar'); await pg.waitForTimeout(800); } },
  { id: 'a-garra', url: 'a-garra/?teste', capa: ['#btJogar'], alvo: '#palco',
    jogar: async (pg) => { await pg.click('#btJogar'); await pg.waitForTimeout(600); } },
  { id: 'danca-na-sala', url: 'danca-na-sala.html?teste', capa: ['#btTV', '#btCel', '#btSolo'], alvo: '#jogo .camBox', corpo: true,
    jogar: async (pg) => { await pg.click('#btSolo'); await pg.fill('#nome', 'Lara').catch(() => {}); await pg.click('#btEntrar'); await pg.waitForSelector('#jogo.solo', { timeout: 15000 }); await pg.waitForTimeout(800); } },
];

let navegador, base;
before(async () => {
  await new Promise((r) => servidor.listen(0, r));
  base = 'http://127.0.0.1:' + servidor.address().port + '/kids/';
  navegador = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
});
after(async () => { if (navegador) await navegador.close(); servidor.close(); });

async function abrir(w, h) {
  const ctx = await navegador.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'pt-BR' });
  // interruptores do RootifyONE (fora de /kids/) e internet de verdade: respostas fixas, sem rede
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await ctx.route('**/solverone-dados/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"recursos":{}}' }));
  const pg = await ctx.newPage(), erros = [];
  pg.on('pageerror', (e) => erros.push(e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) erros.push(m.text()); });
  return { ctx, pg, erros };
}

function medir(pg, sel) {
  return pg.evaluate((sel) => {
    const e = document.querySelector(sel), r = e ? e.getBoundingClientRect() : null, vv = window.visualViewport;
    // a pinça amplia a página? não, se o viewport proíbe ou se algum touch-action no caminho até a raiz tira o pinch-zoom
    let semPinca = /user-scalable=no|maximum-scale=1(\.0)?\b/.test((document.querySelector('meta[name=viewport]') || {}).content || '');
    if (r && !semPinca) {
      for (let x = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); x && x.nodeType === 1; x = x.parentElement) {
        const t = getComputedStyle(x).touchAction;
        if (t === 'none' || (t !== 'auto' && t !== 'manipulation' && !/pinch-zoom/.test(t))) { semPinca = true; break; }
      }
    }
    return { sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, el: r && { x: r.x, y: r.y, w: r.width, h: r.height },
      semPinca, sx: scrollX, sy: scrollY, vx: vv ? vv.offsetLeft : 0, vy: vv ? vv.offsetTop : 0, vs: vv ? vv.scale : 1 };
  }, sel);
}

async function arrastar(ctx, pg, x, y, dx, dy) {
  const cdp = await ctx.newCDPSession(pg);
  const toque = (type, px, py) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: px, y: py }] });
  await toque('touchStart', x, y);
  for (let i = 1; i <= 8; i++) { await toque('touchMove', x + dx * i / 8, y + dy * i / 8); await pg.waitForTimeout(16); }
  await toque('touchEnd'); await pg.waitForTimeout(250);
}

async function botoesVisiveis(pg, seletores, w, h, onde) {
  for (const s of seletores) {
    const r = await pg.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { t: b.top, b: b.bottom, l: b.left, r: b.right }; }, s);
    assert.ok(r, onde + ': não achei ' + s);
    assert.ok(r.t >= 0 && r.b <= h + 0.5 && r.l >= 0 && r.r <= w + 0.5, onde + ': ' + s + ' fora da tela sem rolar (' + JSON.stringify(r) + ')');
  }
}

for (const j of JOGOS) {
  test('deitado: ' + j.id, async (t) => {
    for (const [w, h] of (j.tamanhos || TAMANHOS)) {
      const onde = j.id + ' ' + w + '×' + h;
      const { ctx, pg, erros } = await abrir(w, h);
      try {
        await pg.goto(base + j.url); await pg.waitForTimeout(500);
        // capa: os botões de começar aparecem sem rolar e nada sai para o lado
        if (j.entrada) { await botoesVisiveis(pg, [j.entrada], w, h, onde + ' (entrada)'); await pg.click(j.entrada); await pg.waitForTimeout(400); }
        if (j.capa) {
          await botoesVisiveis(pg, j.capa, w, h, onde + ' (capa)');
          const c = await medir(pg, j.capa[0]);
          assert.ok(c.sw <= w, onde + ' (capa): rola para o lado (' + c.sw + ')');
        }
        // tela de jogar
        await j.jogar(pg);
        const a = await medir(pg, j.alvo);
        assert.ok(a.el && a.el.w > 0, onde + ': não achei a área do jogo ' + j.alvo);
        assert.ok(a.sw <= w, onde + ': a página rola para o lado (' + a.sw + ' > ' + w + ')');
        if (j.corpo) {
          // Dança na Sala (joga-se com o corpo): o vídeo e a câmera inteiros na primeira tela, lado a lado
          for (const s of ['#jogo .ytSolo', '#jogo .camBox']) await botoesVisiveis(pg, [s], w, h, onde);
        } else {
          assert.ok(a.sh <= h, onde + ': a página rola para baixo (' + a.sh + ' > ' + h + ')');
          const frac = j.altura || 0.7;
          assert.ok(a.el.h >= frac * h - 0.5, onde + ': a área do jogo tem ' + Math.round(a.el.h) + ' px de altura (< ' + Math.round(frac * 100) + '% de ' + h + ')');
          assert.ok(a.el.y >= -0.5 && a.el.y + a.el.h <= h + 0.5, onde + ': a área do jogo sai da tela');
        }
        if (j.id === 'baguncolandia') t.diagnostic(onde + ': canvas ' + Math.round(a.el.w) + '×' + Math.round(a.el.h));
        assert.ok(a.semPinca, onde + ': a pinça ainda amplia a página em cima do jogo');
        // arrastar o dedo em cima do jogo (para cima e para o lado) não mexe a página
        const cx = a.el.x + a.el.w / 2, cy = a.el.y + Math.min(a.el.h, h - a.el.y) / 2;
        await arrastar(ctx, pg, cx, cy, -Math.min(160, a.el.w / 3), 0);
        if (!j.corpo) await arrastar(ctx, pg, cx, cy, 0, -Math.min(120, a.el.h / 3));   // na Dança a página rola de propósito (os controles)
        const d = await medir(pg, j.alvo);
        assert.deepStrictEqual([d.sx, d.sy, Math.round(d.vx), Math.round(d.vy), d.vs], [0, 0, 0, 0, 1], onde + ': o dedo moveu a página');
        assert.deepStrictEqual(erros, [], onde + ': erro no console');
      } finally { await ctx.close(); }
    }
  });
}
