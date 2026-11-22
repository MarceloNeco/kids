// Nenhum texto saindo da caixinha (dono, 22/Nov/2026: "tem escritos que estão saindo fora da caixinha"): no Chromium
// (Playwright), em 360×740 e 412×915, em PT, EN e ES, passa pela tela de começo, pelas 7 etapas e por TODAS as opções de
// cada etapa (todo bichinho, toda cor, toda roupa, toda caixinha de acessórios e cada acessório com as suas cores, toda voz)
// e reprova se:
//   - um texto sai da caixa (scrollWidth > clientWidth + 1 ou scrollHeight > clientHeight + 1);
//   - um texto fica cortado com reticências (text-overflow: ellipsis ativo);
//   - um texto fica fora do próprio cartão/botão (nome em cima do cartão vizinho) ou cortado pela borda de quem esconde o
//     que passa (overflow hidden: a categoria "Na m…" cortada na borda do balcão, a etapa que precisaria rolar);
//   - o nome de um cartão passa de 2 linhas (3 no rótulo estreito da caixinha do balcão), ou dois cartões se sobrepõem;
//   - um texto ou botão com texto fica embaixo da bolinha 🎵 da música (fixa: right .6rem, bottom .6rem, 36×36 px, ../trilha.js).
// Rodar da raiz do repositório kids: node --test meu-amiguinho/teste/textos.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (!p.startsWith('/kids/')) { res.writeHead(404); res.end(); return; }
  p = p.slice(6); if (!p || p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || /\.mp3$/.test(f) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
let browser, base;
test.before(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/kids/meu-amiguinho/';
  browser = await chromium.launch();
});
test.after(async () => { if (browser) await browser.close(); server.close(); });

// roda na página: confere a tela inteira e devolve a lista de problemas
function instalarConferencia() {
  window.__checar = function (onde) {
    const erros = [];
    const W = innerWidth, H = innerHeight, rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const mus = { left: W - 0.6 * rem - 36, right: W - 0.6 * rem, top: H - 0.6 * rem - 36, bottom: H - 0.6 * rem };
    const cruzaMusica = (r) => r.right > mus.left + 0.5 && r.left < mus.right - 0.5 && r.bottom > mus.top + 0.5 && r.top < mus.bottom - 0.5;
    const nome = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : '');
    const visivel = (e) => { for (let x = e; x && x !== document.body; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden' || x.hidden) return false; } return e.getClientRects().length > 0; };
    const fora = (r, c) => r.left < c.left - 1 || r.right > c.right + 1 || r.top < c.top - 1 || r.bottom > c.bottom + 1;
    const rg = document.createRange();
    for (const e of document.querySelectorAll('body *')) {
      // só o que é do jogo (a barra 🏠/🚪 e o "Tela inteira" são peças comuns da raiz, com teste próprio)
      if (!e.closest('.tela, .janela, .aviso') || e.closest('svg, script, style, .so-leitor, .trilha, [aria-hidden="true"]')) continue;
      const textos = [...e.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
      if (!visivel(e)) continue;
      const cs = getComputedStyle(e), quem = nome(e) + ' «' + e.textContent.trim().slice(0, 40) + '»';
      // botão com texto embaixo da 🎵
      if ((e.tagName === 'BUTTON' || e.tagName === 'INPUT') && (e.textContent.trim() || e.value) && cruzaMusica(e.getBoundingClientRect())) erros.push(onde + ': embaixo da 🎵: ' + quem);
      if (!textos.length) continue;
      if (cs.display !== 'inline') {
        if (cs.textOverflow === 'ellipsis' && cs.overflowX !== 'visible' && e.scrollWidth > e.clientWidth) erros.push(onde + ': cortado com reticências: ' + quem);
        else if (e.scrollWidth > e.clientWidth + 1) erros.push(onde + ': sai da caixa na largura (' + e.scrollWidth + ' > ' + e.clientWidth + '): ' + quem);
        // (na altura, uma folguinha: letra grande com entrelinha apertada passa 1 ou 2 px da caixa, e isso não é texto saindo)
        if (e.scrollHeight > e.clientHeight + Math.max(3, parseFloat(cs.fontSize) * 0.35)) erros.push(onde + ': sai da caixa na altura (' + e.scrollHeight + ' > ' + e.clientHeight + '): ' + quem);
      }
      const cartao = e.closest('button, .opc, .acrilico, label, .fala, .aviso');
      const linhas = new Set();
      for (const n of textos) {
        rg.selectNodeContents(n);
        for (const r of rg.getClientRects()) {
          if (r.width < 1 || r.height < 1) continue;
          linhas.add(Math.round(r.top));
          if (cartao && fora(r, cartao.getBoundingClientRect())) erros.push(onde + ': texto fora do próprio cartão ' + nome(cartao) + ': ' + quem);
          // quem esconde o que passa (overflow hidden) corta o texto? (numa fileira que rola para o lado, a largura vale ao rolar)
          let livreX = false, livreY = false;
          for (let a = e.parentElement; a && a !== document.documentElement; a = a.parentElement) {
            const ac = getComputedStyle(a), ar = a.getBoundingClientRect();
            const rolaX = /auto|scroll/.test(ac.overflowX), rolaY = /auto|scroll/.test(ac.overflowY);
            if (!livreX && ac.overflowX !== 'visible' && !rolaX && (r.left < ar.left - 1 || r.right > ar.right + 1)) { erros.push(onde + ': cortado na borda de ' + nome(a) + ': ' + quem); break; }
            if (!livreY && ac.overflowY !== 'visible' && !rolaY && (r.top < ar.top - 1 || r.bottom > ar.bottom + 1)) { erros.push(onde + ': cortado embaixo/em cima por ' + nome(a) + ' (a etapa precisaria rolar): ' + quem); break; }
            if (rolaX) livreX = true; if (rolaY) livreY = true;
          }
          if (cruzaMusica(r)) erros.push(onde + ': texto embaixo da 🎵: ' + quem);
        }
      }
      const maxLinhas = e.matches('.acrilico small') ? 3 : 2;   // o rótulo da caixinha do balcão, estreita, pode ir a 3
      if (e.matches('.opc small, .acrilico small, .opc span') && linhas.size > maxLinhas) erros.push(onde + ': nome em mais de ' + maxLinhas + ' linhas (' + linhas.size + '): ' + quem);
    }
    // cartões vizinhos não se sobrepõem
    for (const fila of document.querySelectorAll('#painel .roda, #painel .balcao')) {
      const cs = [...fila.children].filter(visivel).map((c) => [c, c.getBoundingClientRect()]);
      for (let i = 1; i < cs.length; i++) for (let j = 0; j < i; j++) {
        const a = cs[i][1], b = cs[j][1], w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (w > 1 && h > 1) erros.push(onde + ': cartões um em cima do outro: ' + nome(cs[i][0]) + ' «' + cs[i][0].textContent.trim().slice(0, 30) + '» e «' + cs[j][0].textContent.trim().slice(0, 30) + '»');
      }
    }
    const p = document.getElementById('painel');
    if (p && visivel(p) && p.scrollTop > 0) erros.push(onde + ': a etapa rolou para baixo');
    if (document.documentElement.scrollHeight > innerHeight + 1 || scrollY > 0) erros.push(onde + ': a página rola');
    return erros;
  };
  // passa por todas as opções da etapa aberta, conferindo depois de cada toque
  window.__percorrer = function (etapa) {
    const erros = [], P = document.getElementById('painel');
    const conferir = (onde) => { for (const x of window.__checar(etapa + ' ' + onde)) if (erros.length < 40) erros.push(x); };
    const todos = (at) => [...P.querySelectorAll('[data-' + at + ']')].filter((b) => !b.disabled).map((b) => b.getAttribute('data-' + at));
    const tocar = (at, v) => { const b = P.querySelector('[data-' + at + '="' + v + '"]'); if (b && !b.disabled) b.click(); };
    const passa = (at, depois) => { for (const v of todos(at)) { tocar(at, v); conferir(at + '=' + v); if (depois) depois(v); } };
    conferir('aberta');
    if (etapa === 'bicho') passa('base', () => passa('corpo'));
    else if (etapa === 'pelo') { passa('pelo'); passa('olhos'); passa('estilo-olho'); passa('bochecha'); }
    else if (etapa === 'fofura') passa('coracao');
    else if (etapa === 'roupa') { passa('roupa', () => { passa('cor-roupa'); passa('estampa'); }); passa('patch'); }
    else if (etapa === 'acess') {
      for (const cx of todos('caixa')) { tocar('caixa', cx); conferir('caixinha=' + cx); passa('acess', () => passa('cor-acess')); }
    } else if (etapa === 'voz') { passa('genero'); passa('pronta'); passa('voz'); passa('som'); tocar('mais-frase', '1'); conferir('duas frases'); }
    return erros;
  };
}

for (const [w, h] of [[360, 740], [412, 915]]) {
  for (const lang of ['pt', 'en', 'es']) {
    test('textos dentro da caixinha, ' + w + '×' + h + ', ' + lang + ': começo, 7 etapas e todas as opções', { timeout: 300000 }, async () => {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
      await ctx.addInitScript((l) => { localStorage.setItem('bolinho:idioma', l); }, lang);
      await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
      const pg = await ctx.newPage(), falhas = [];
      pg.on('pageerror', (e) => falhas.push('pageerror: ' + e.message));
      try {
        await pg.goto(base + '?teste');
        await pg.waitForFunction(() => window.AmiguinhoDebug && AmiguinhoDebug.pronto, null, { timeout: 20000 });
        await pg.evaluate(() => document.fonts.ready);
        await pg.waitForTimeout(300);
        await pg.evaluate(instalarConferencia);
        let erros = await pg.evaluate(() => window.__checar('começo'));
        await pg.click('#btCriar'); await pg.waitForTimeout(250);
        const etapas = await pg.evaluate(() => AmiguinhoDados.ETAPAS.map((e) => e.id));
        assert.equal(etapas.length, 7);
        for (let i = 0; i < 7; i++) {
          erros = erros.concat(await pg.evaluate((id) => window.__percorrer(id), etapas[i]));
          if (i < 6) { await pg.click('#btProximo'); await pg.waitForTimeout(200); }
        }
        assert.deepEqual([...new Set(erros)].slice(0, 25), []);
        assert.deepEqual(falhas, []);
      } finally { await ctx.close(); }
    });
  }
}

// O balcão vai crescer (dono, 22/Nov/2026: bolsas, asinhas, saias e shorts, dezenas de acessórios): com 16 caixinhas de
// nomes compridos e 15 itens por caixinha, tudo continua à vista, sem cortar categoria nem nome, e a etapa não rola.
for (const [w, h, lang] of [[360, 740, 'pt'], [360, 740, 'es'], [412, 915, 'en']]) {
  test('balcão cheio (16 caixinhas × 15 itens), ' + w + '×' + h + ', ' + lang, { timeout: 300000 }, async () => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    await ctx.addInitScript((l) => { localStorage.setItem('bolinho:idioma', l); }, lang);
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    const pg = await ctx.newPage(), falhas = [];
    pg.on('pageerror', (e) => falhas.push('pageerror: ' + e.message));
    try {
      await pg.goto(base + '?teste');
      await pg.waitForFunction(() => window.AmiguinhoDebug && AmiguinhoDebug.pronto, null, { timeout: 20000 });
      await pg.evaluate(() => document.fonts.ready);
      await pg.evaluate(instalarConferencia);
      const n = await pg.evaluate(() => {
        const D = AmiguinhoDados;
        const novas = [['saias', 'Saias e shorts', 'Skirts & shorts', 'Faldas y pantalones cortos'], ['bolsas2', 'Bolsas e mochilas', 'Bags & backpacks', 'Bolsos y mochilas'],
          ['asinhas2', 'Asinhas', 'Little wings', 'Alitas'], ['festa', 'Chapéus de festa', 'Party hats', 'Gorros de fiesta'], ['brincos', 'Brincos e piercings de mentirinha', 'Pretend earrings', 'Pendientes de mentirijillas']];
        for (const [id, pt, en, es] of novas) { if (D.CAIXAS.length >= 16) break; const cx = { id, n: [pt, en, es], ico: '✨' }; D.CAIXAS.push(cx); D.caixa[id] = cx; }
        const nomes = [['Tênis com bico de strass dourado', 'Golden rhinestone-toe sneakers', 'Zapatillas con puntera de brillantes doradas'], ['Laço', 'Bow', 'Lazo'], ['Guia com controle de patinha', 'Leash with paw remote', 'Correa con mando de patita']];
        for (const cx of D.CAIXAS) {
          let k = D.ACESS.filter((x) => x.caixa === cx.id).length;
          for (let i = 0; k < 15; i++, k++) { const nm = nomes[i % nomes.length], it = { id: 'extra-' + cx.id + '-' + i, caixa: cx.id, n: nm, e: nm }; D.ACESS.push(it); D.acess[it.id] = it; }
        }
        return D.CAIXAS.length;
      });
      assert.ok(n >= 16, 'caixinhas: ' + n);
      await pg.click('#btCriar'); await pg.waitForTimeout(200);
      for (let i = 0; i < 4; i++) { await pg.click('#btProximo'); await pg.waitForTimeout(120); }
      const erros = await pg.evaluate(() => window.__percorrer('acess'));
      assert.deepEqual([...new Set(erros)].slice(0, 25), []);
      // toda caixinha inteira à vista, dentro do balcão e da tela
      const fora = await pg.evaluate(() => { const b = document.querySelector('.balcao').getBoundingClientRect(); return [...document.querySelectorAll('.acrilico')].filter((x) => { const r = x.getBoundingClientRect(); return r.left < b.left || r.right > b.right || r.top < b.top || r.bottom > b.bottom || r.bottom > innerHeight; }).map((x) => x.dataset.caixa); });
      assert.deepEqual(fora, []);
      assert.deepEqual(falhas, []);
    } finally { await ctx.close(); }
  });
}
