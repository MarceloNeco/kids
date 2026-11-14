// Botão "Instalar o Bolinho" da estante (dono, 14/Nov/2026: simples, fácil e para qualquer aparelho):
// - é a primeira coisa da página, numa linha só, com a frase do aparelho (celular, tablet, computador; na TV, "Deixar
//   o Bolinho na TV") e no idioma escolhido;
// - no iPhone (sem janela de instalar do navegador) o toque abre o passo a passo daquele aparelho;
// - um botão de instalar só, sempre à vista no navegador ("Já instalei" esconde só na visita); some aberto pelo ícone.
// Rodar da raiz do repositório: node --test teste/instalar.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const raiz = path.join(__dirname, '..');
const UA = {
  celular: 'Mozilla/5.0 (Linux; Android 14; SM-A146B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  tablet: 'Mozilla/5.0 (Linux; Android 13; SM-X200) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  tv: 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0 Safari/537.36 WebAppManager',
  computador: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
};
const ESPERA = {
  celular: ['Instalar o Bolinho no celular', 'Install Rainy Day Donuts on your phone', 'Instalar Buñuelos de Lluvia en el móvil'],
  iphone: ['Instalar o Bolinho no celular', 'Install Rainy Day Donuts on your phone', 'Instalar Buñuelos de Lluvia en el móvil'],
  tablet: ['Instalar o Bolinho no tablet', 'Install Rainy Day Donuts on your tablet', 'Instalar Buñuelos de Lluvia en la tablet'],
  tv: ['Deixar o Bolinho na TV', 'Keep Rainy Day Donuts on the TV', 'Dejar Buñuelos de Lluvia en la tele'],
  computador: ['Instalar o Bolinho no computador', 'Install Rainy Day Donuts on your computer', 'Instalar Buñuelos de Lluvia en el ordenador']
};

test('estante: botão de instalar com a frase de cada aparelho, numa linha, nos 3 idiomas; um botão só, sempre à vista no navegador', async () => {
  const { chromium } = require('playwright');
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
  const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (!p.startsWith('/kids/')) { r.writeHead(404); return r.end(); }
    p = p.slice(6); if (!p || p.endsWith('/')) p += 'index.html';
    const f = path.join(raiz, p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/kids/';
  const b = await chromium.launch();
  const abrir = async (ua, cod, marca) => {
    const tv = /SmartTV/.test(ua);
    const ctx = await b.newContext({ viewport: tv ? { width: 1280, height: 720 } : { width: 390, height: 844 }, userAgent: ua, serviceWorkers: 'block' });
    await ctx.addInitScript(([c, m]) => { localStorage.setItem('bolinho:idioma', c); localStorage.setItem('bolinho:novidades-ocultas', '["*"]'); if (m) localStorage.setItem('bolinho:instalado:/kids/', m); }, [cod, marca]);
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    const pg = await ctx.newPage(); await pg.goto(base); await pg.waitForTimeout(400);
    return { ctx, pg };
  };
  try {
    for (const [ap, ua] of Object.entries(UA)) {
      for (const [i, cod] of ['pt', 'en', 'es'].entries()) {
        const { ctx, pg } = await abrir(ua, cod);
        const r = await pg.evaluate(() => {
          const bt = document.querySelector('.bc-btn'), barra = document.querySelector('.bc-inst');
          return { t: bt.textContent.trim(), h: bt.getBoundingClientRect().height, primeiro: document.body.firstElementChild === barra, vis: !barra.hidden };
        });
        const curto = ['Instalar o Bolinho', 'Install Rainy Day Donuts', 'Instalar Buñuelos de Lluvia'][i];
        assert.ok(r.t === ESPERA[ap][i] || (ap !== 'tv' && r.t === curto), ap + ' ' + cod + ': ' + r.t);
        assert.ok(r.vis && r.primeiro, ap + ': o botão é a primeira coisa da página');
        assert.ok(r.h <= 50, ap + ' ' + cod + ': a frase quebrou em duas linhas');
        if (ap === 'iphone' && cod === 'pt') {
          await pg.click('.bc-btn');
          await pg.waitForSelector('.bc-fundo:not([hidden])');
          assert.match(await pg.textContent('.bc-corpo'), /Adicionar à Tela de Início/, 'iPhone: passo a passo do Safari');
          await pg.click('.bc-ja');
          assert.ok(await pg.$eval('.bc-inst', (e) => e.hidden), 'Já instalei esconde');
        }
        await ctx.close();
      }
    }
    // um botão de instalar só (a barra de cima), sempre à vista no navegador, mesmo com marca de "Já instalei"
    {
      const { ctx, pg } = await abrir(UA.iphone, 'pt', String(Date.now()));
      assert.ok(!(await pg.$eval('.bc-inst', (e) => e.hidden)), 'a barra de instalar continua à vista');
      assert.strictEqual(await pg.$$eval('.bc-btn, .bt-instalar', (b) => b.length), 1, 'um botão de instalar só');
      await ctx.close();
    }
    // já instalado neste aparelho (o Chrome responde getInstalledRelatedApps): a barra some também no navegador
    for (const [instalado, deveVer] of [[true, false], [false, true]]) {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, userAgent: UA.celular, locale: 'pt-BR', serviceWorkers: 'block' });
      await ctx.addInitScript((i) => { localStorage.setItem('bolinho:novidades-ocultas', '["*"]'); navigator.getInstalledRelatedApps = () => Promise.resolve(i ? [{ platform: 'webapp', url: location.origin + '/kids/manifest.webmanifest' }] : []); }, instalado);
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
      const pg = await ctx.newPage(); await pg.goto(base); await pg.waitForTimeout(400);
      assert.strictEqual(!(await pg.$eval('.bc-inst', (e) => e.hidden)), deveVer, instalado ? 'já instalado: sem barra no navegador' : 'não instalado: barra à vista');
      await ctx.close();
    }
    assert.match(fs.readFileSync(path.join(raiz, 'manifest.webmanifest'), 'utf8'), /"related_applications": \[\{ "platform": "webapp", "url": "https:\/\/solverone\.com\.br\/kids\/manifest\.webmanifest" \}\]/, 'manifest diz qual é o app (webapp)');
    // janela de app: pelo ícone do Bolinho (?app=1) some tudo; dentro da janela de um JOGO instalado (🚪 do jogo leva à
    // estante, sem ?app=1) o botão aparece e ensina a abrir no Chrome para instalar
    {
      const janela = async (url) => {
        const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, userAgent: UA.celular, locale: 'pt-BR', serviceWorkers: 'block' });
        await ctx.addInitScript(() => {
          localStorage.setItem('bolinho:novidades-ocultas', '["*"]');
          const mm = window.matchMedia.bind(window);
          window.matchMedia = (q) => /display-mode:\s*standalone/.test(q) ? { matches: true, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} } : mm(q);
        });
        await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
        const pg = await ctx.newPage(); await pg.goto(url); await pg.waitForTimeout(400);
        return { ctx, pg };
      };
      let { ctx, pg } = await janela(base + '?app=1');
      assert.strictEqual(await pg.$('.bc-inst'), null, 'pelo ícone do Bolinho: sem barra de instalar');
      await pg.goto(base); await pg.waitForTimeout(300);   // voltou para a estante (sem ?app=1) na mesma janela do app
      assert.strictEqual(await pg.$('.bc-inst'), null, 'continua sendo o app do Bolinho');
      await ctx.close();
      ({ ctx, pg } = await janela(base));
      assert.ok(await pg.isVisible('.bc-btn'), 'dentro de um jogo instalado: o botão aparece');
      await pg.click('.bc-btn');
      await pg.waitForSelector('.bc-fundo:not([hidden])');
      assert.match(await pg.textContent('.bc-corpo'), /por dentro de outro app/);
      assert.match(await pg.textContent('.bc-corpo'), /três pontinhos ⋮.*Abrir no Chrome/, 'ensina o ⋮ → Abrir no Chrome (o link intent só recarregava a página)');
      assert.strictEqual(await pg.$('.bc-corpo a.bc-forte'), null, 'sem o botão que só recarregava');
      await ctx.close();
      // "⋮ → Abrir no Chrome" leva a MESMA página para uma aba do Chrome, sem recarregar (dono, 14/Nov/2026, print: o aviso
      // "por dentro de outro app" ficou no Chrome de verdade). A página percebe que saiu da janela de app e recarrega.
      {
        const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 }, userAgent: UA.celular, locale: 'pt-BR', serviceWorkers: 'block' });
        await ctx2.addInitScript(() => {
          localStorage.setItem('bolinho:novidades-ocultas', '["*"]');
          if (!sessionStorage.getItem('teste:modo')) sessionStorage.setItem('teste:modo', 'app');
          const mm = window.matchMedia.bind(window);
          window.matchMedia = (q) => /display-mode:\s*standalone/.test(q)
            ? { get matches() { return sessionStorage.getItem('teste:modo') === 'app'; }, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} } : mm(q);
        });
        await ctx2.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
        const p2 = await ctx2.newPage(); await p2.goto(base); await p2.waitForTimeout(400);
        await p2.click('.bc-btn'); await p2.waitForSelector('.bc-fundo:not([hidden])');
        assert.match(await p2.textContent('.bc-corpo'), /por dentro de outro app/);
        await p2.evaluate(() => sessionStorage.setItem('teste:modo', 'browser'));   // virou aba do Chrome
        await p2.waitForEvent('load', { timeout: 5000 });
        await p2.waitForTimeout(400);
        assert.ok(await p2.$eval('.bc-fundo', (e) => e.hidden), 'recarregou: o aviso de "outro app" sumiu');
        await p2.click('.bc-btn'); await p2.waitForSelector('.bc-fundo:not([hidden])');
        assert.doesNotMatch(await p2.textContent('.bc-corpo'), /por dentro de outro app/, 'no Chrome: passos normais de instalar');
        assert.match(await p2.textContent('.bc-corpo'), /role a lista para baixo.*Instalar app/, 'diz onde fica o Instalar app no menu ⋮');
        await ctx2.close();
      }
      assert.match(fs.readFileSync(path.join(raiz, 'manifest.webmanifest'), 'utf8'), /"start_url": "\.\/\?app=1"/, 'o ícone abre com ?app=1');
    }
    // 🎵 Músicas e o idioma numa linha só, até em celular estreito e com a letra grande do Android
    for (const [w, letra] of [[390, 16], [360, 21], [320, 21]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 700 }, userAgent: UA.celular, locale: 'pt-BR', serviceWorkers: 'block' });
      await ctx.addInitScript((f) => { localStorage.setItem('bolinho:novidades-ocultas', '["*"]'); document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.fontSize = f + 'px'; }); }, letra);
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
      const pg = await ctx.newPage(); await pg.goto(base); await pg.waitForTimeout(400);
      const r = await pg.$$eval('.barra-topo .bt-biblioteca, .barra-topo .bi-atual', (bs) => bs.map((x) => { const c = x.getBoundingClientRect(); return { t: Math.round(c.top), r: c.right, cortado: x.scrollWidth > x.clientWidth + 1 }; }));
      assert.strictEqual(r.length, 2, w + ': os dois botões');
      assert.ok(r.every((x) => x.t === r[0].t), w + ' px, letra ' + letra + ': na mesma linha ' + JSON.stringify(r));
      assert.ok(r.every((x) => !x.cortado && x.r <= w), w + ' px: nenhum cortado nem para fora da tela');
      await ctx.close();
    }
  } finally { await b.close(); srv.close(); }
});
