// Cartões compactos da estante (dono, 15/Nov/2026): nome inteiro, "? ⌄" que abre a explicação com animação, ícones do
// que o jogo faz (tocar explica), ⬇ Instalar logo à esquerda e Jogar SEMPRE na ponta direita (alinhado em todos),
// três idiomas, e sem internet o jogo que precisa dela fica apagado.
// Rodar da raiz do repositório: node --test teste/estante-cartoes.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const raiz = path.join(__dirname, '..');

function servidor() {
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
  return http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (!p.startsWith('/kids/')) { r.writeHead(404); return r.end(); }
    p = p.slice(6); if (!p || p.endsWith('/')) p += 'index.html';
    const f = path.join(raiz, p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  });
}

test('estante: cartões compactos, nome inteiro, Jogar na ponta direita, abrir, explicar ícone e sem internet', { timeout: 120000 }, async () => {
  const { chromium } = require('playwright');
  const srv = servidor(); await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/kids/';
  const b = await chromium.launch();
  try {
    for (const [cod, w, jogar, abrirTv, inclinar] of [['pt', 390, 'Jogar', /Abrir na TV/, /Inclinar o celular/], ['en', 360, 'Play', /Open on the TV/, /Tilt the phone/], ['es', 320, 'Jugar', /Abrir en la tele/, /Inclinar el móvil/]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
      await ctx.addInitScript((c) => { localStorage.setItem('bolinho:idioma', c); localStorage.setItem('bolinho:novidades-ocultas', '["*"]'); }, cod);
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
      const pg = await ctx.newPage(), erros = [];
      pg.on('pageerror', (e) => erros.push(e.message));
      await pg.goto(base); await pg.waitForTimeout(500);
      const m = await pg.$$eval('.card[data-jogo]', (cs) => cs.map((c) => {
        const h2 = c.querySelector('h2'), j = c.querySelector('.c-jogar').getBoundingClientRect(), i = c.querySelector('.c-inst'), r = c.getBoundingClientRect();
        const vis = [...h2.children].find((s) => getComputedStyle(s).display !== 'none');
        return { id: c.dataset.jogo, nome: vis.textContent, cortado: h2.scrollWidth > h2.clientWidth + 1, jd: Math.round(r.right - j.right), jogar: c.querySelector('.c-jogar').innerText.trim(),
          inst: i ? Math.round(j.left - i.getBoundingClientRect().right) : null, fora: r.right > innerWidth + 1, altura: r.height,
          ics: c.querySelectorAll('.c-l .ic').length, so: c.hasAttribute('data-so-online') };
      }));
      assert.ok(m.length >= 15, cod + ': um cartão por jogo');
      for (const c of m) {
        assert.ok(!c.cortado && !c.fora, cod + ' ' + w + ' px: ' + c.id + ' com o nome inteiro e dentro da tela');
        assert.strictEqual(c.jogar, jogar, cod + ': ' + c.id + ' tem o botão ' + jogar);
        assert.ok(c.ics >= 1, cod + ': ' + c.id + ' com ícones');
        if (c.so) assert.strictEqual(c.inst, null, c.id + ': sem botão de baixar'); else assert.ok(c.inst >= 0 && c.inst < 16, cod + ': ' + c.id + ' ⬇ logo à esquerda do Jogar (' + c.inst + ')');
        assert.ok(c.altura < (w < 380 ? 190 : 160), cod + ': ' + c.id + ' compacto (' + c.altura + ' px)');
      }
      assert.strictEqual(new Set(m.map((c) => c.jd)).size, 1, cod + ': Jogar alinhado na ponta direita em todos ' + JSON.stringify(m.map((c) => c.jd)));
      // "? ⌄" abre e fecha a explicação
      const v = '.card[data-jogo="vruuum"]';
      assert.strictEqual(await pg.$eval(v + ' .c-d', (d) => d.getBoundingClientRect().height), 0, 'fechado');
      await pg.click(v + ' .c-q'); await pg.waitForTimeout(500);
      assert.strictEqual(await pg.getAttribute(v + ' .c-q', 'aria-expanded'), 'true');
      assert.ok(await pg.$eval(v + ' .c-d', (d) => d.getBoundingClientRect().height > 100), cod + ': abriu');
      assert.match(await pg.innerText(v + ' .c-d'), abrirTv);
      assert.match(await pg.innerText(v + ' .c-d'), inclinar);
      // tocar num ícone explica o que é (e não abre o jogo)
      await pg.click(v + ' .c-l .ic-incl');
      assert.match(await pg.innerText('.c-bal'), inclinar);
      assert.strictEqual(new URL(pg.url()).pathname, '/kids/', 'continua na estante');
      await pg.click(v + ' .c-q'); await pg.waitForTimeout(500);
      assert.ok(await pg.$eval('.c-bal', (e) => e.hidden), 'o balão some no próximo toque');
      assert.strictEqual(await pg.$eval(v + ' .c-d', (d) => d.getBoundingClientRect().height), 0, cod + ': fechou');
      // sem internet: a Dança na Sala (precisa de internet) e os jogos ainda não guardados ficam apagados
      await ctx.setOffline(true); await pg.waitForTimeout(200);
      assert.ok(await pg.$eval('.card[data-jogo="danca-na-sala"]', (c) => c.classList.contains('sem')), 'Dança na Sala apagada');
      await pg.evaluate(() => { document.querySelector('.card[data-jogo="campo-minado"]').setAttribute('data-guardado', ''); BolinhoCatalogo.rede(); });
      assert.ok(!(await pg.$eval('.card[data-jogo="campo-minado"]', (c) => c.classList.contains('sem'))), 'jogo guardado continua aceso');
      assert.ok(await pg.$eval('.card[data-jogo="labirinto"]', (c) => c.classList.contains('sem')), 'jogo ainda não guardado fica apagado');
      await ctx.setOffline(false); await pg.waitForTimeout(200);
      assert.ok(!(await pg.$eval('.card[data-jogo="danca-na-sala"]', (c) => c.classList.contains('sem'))), 'internet voltou: acende');
      assert.deepStrictEqual(erros, [], cod + ': erro na página');
      await ctx.close();
    }
  } finally { await b.close(); srv.close(); }
});
