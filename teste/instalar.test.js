// Botão "Instalar o Bolinho" da estante (dono, 14/Nov/2026: simples, fácil e para qualquer aparelho):
// - é a primeira coisa da página, numa linha só, com a frase do aparelho (celular, tablet, computador; na TV, "Deixar
//   o Bolinho na TV") e no idioma escolhido;
// - no iPhone (sem janela de instalar do navegador) o toque abre o passo a passo daquele aparelho;
// - "Já instalei" esconde por 30 dias, não para sempre (marca antiga "1" volta a mostrar).
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

test('estante: botão de instalar com a frase de cada aparelho, numa linha, nos 3 idiomas; Já instalei esconde 30 dias', async () => {
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
    // marca de "Já instalei" de hoje: escondido; antiga ("1", de antes) ou de 31 dias: o botão volta
    for (const [marca, escondido] of [[String(Date.now()), true], ['1', false], [String(Date.now() - 31 * 864e5), false]]) {
      const { ctx, pg } = await abrir(UA.celular, 'pt', marca);
      assert.strictEqual(await pg.$eval('.bc-inst', (e) => e.hidden), escondido, 'marca ' + marca);
      await ctx.close();
    }
  } finally { await b.close(); srv.close(); }
});
