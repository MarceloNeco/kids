// Tablet e computador deitados (dono, 22/Nov/2026, foto do Fire 7 deitado: "é ruim que não tem um aproveitamento. Está
// muito mal aproveitado"). No Chromium (Playwright), em 1024×600 (Fire 7), 1280×800, 1340×800 e 1920×1080, em cada uma das
// 7 etapas (e com a barra de tom aberta, cada grupo do guarda-roupa e uma caixinha de acessório com cores), reprova se:
//   - o palco do bichinho tem menos de 40 % da largura da tela;
//   - o desenho do bichinho tem menos de 70 % da altura disponível (a altura do palco);
//   - um cartão de item (bichinho, cabide, acessório) tem menos de 88 px de lado, ou uma cor/opção menos de 44 px;
//   - a barra de tom ☀️/🌙 tem menos de 44 px de altura para o dedo;
//   - um texto sai da caixa, fica com reticências, fica fora do próprio cartão ou cortado pela borda de quem esconde o que passa;
//   - algo fica fora da tela (na fileira que corre para o lado, vale a altura) ou um botão fica embaixo da bolinha 🎵;
//   - a página ou a etapa rola;
//   - o Próximo ou o Pronto vira um botão gigante (mais de 30 % da largura da tela).
// Também confere a tela de começo, o amiguinho pronto (botões numa fileira só), a certidão e a coleção.
// Rodar da raiz do repositório kids: node --test meu-amiguinho/teste/paisagem.test.js
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

// roda na página: as medidas da tela aberta; devolve a lista de problemas
function instalar() {
  window.__paisagem = function (onde, oficina) {
    const erros = [], W = innerWidth, H = innerHeight;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const mus = { left: W - 0.6 * rem - 36, right: W - 0.6 * rem, top: H - 0.6 * rem - 36, bottom: H - 0.6 * rem };
    const cruzaMusica = (r) => r.right > mus.left + 0.5 && r.left < mus.right - 0.5 && r.bottom > mus.top + 0.5 && r.top < mus.bottom - 0.5;
    const nome = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : '');
    const quem = (e) => nome(e) + ' «' + (e.textContent || '').trim().slice(0, 30) + '»';
    const visivel = (e) => { for (let x = e; x && x !== document.body; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden' || x.hidden) return false; } return e.getClientRects().length > 0; };
    const rolaX = (e) => e.closest('.roda, .grade, .abas');
    const tela = document.querySelector('.tela.ativa');
    const janela = [...document.querySelectorAll('.janela')].find((j) => !j.hidden);
    const area = janela || tela;
    // a página e a etapa não rolam
    if (document.documentElement.scrollHeight > H + 1 || document.documentElement.scrollWidth > W + 1 || scrollY > 0) erros.push(onde + ': a página rola');
    const P = document.getElementById('painel');
    if (oficina && P.scrollHeight > P.clientHeight + 1) erros.push(onde + ': a etapa rola (' + P.scrollHeight + ' > ' + P.clientHeight + ')');
    // nada fora da tela; nenhum botão embaixo da 🎵
    for (const e of area.querySelectorAll('button, input, .opc, .acrilico, .palco, .painel, .balcao, .roda, h1, h2, p, label')) {
      if (!visivel(e) || e.closest('[aria-hidden="true"]')) continue;
      const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
      const lado = rolaX(e.parentElement || e);
      if ((!lado && (r.left < -1 || r.right > W + 1)) || r.top < -1 || r.bottom > H + 1) erros.push(onde + ': fora da tela: ' + quem(e));
      if (lado) { const c = lado.getBoundingClientRect(); if (r.top < c.top - 1 || r.bottom > c.bottom + 1) erros.push(onde + ': cortado em cima/embaixo na fileira: ' + quem(e)); }
      if ((e.tagName === 'BUTTON' || e.tagName === 'INPUT') && cruzaMusica(r)) erros.push(onde + ': embaixo da 🎵: ' + quem(e));
    }
    // nenhum texto cortado
    const rg = document.createRange();
    for (const e of area.querySelectorAll('*')) {
      if (e.closest('svg, script, style, .so-leitor, [aria-hidden="true"]') || !visivel(e)) continue;
      const textos = [...e.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
      if (!textos.length) continue;
      const cs = getComputedStyle(e);
      if (cs.display !== 'inline') {
        if (cs.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth) erros.push(onde + ': reticências: ' + quem(e));
        else if (e.scrollWidth > e.clientWidth + 1) erros.push(onde + ': sai da caixa na largura: ' + quem(e));
      }
      const cartao = e.closest('button, .opc, .acrilico, label');
      for (const n of textos) {
        rg.selectNodeContents(n);
        for (const r of rg.getClientRects()) {
          if (r.width < 1 || r.height < 1) continue;
          if (cartao) { const c = cartao.getBoundingClientRect(); if (r.left < c.left - 1 || r.right > c.right + 1 || r.top < c.top - 1 || r.bottom > c.bottom + 1) erros.push(onde + ': texto fora do cartão: ' + quem(e)); }
          for (let a = e.parentElement; a && a !== document.documentElement; a = a.parentElement) {
            const ac = getComputedStyle(a), ar = a.getBoundingClientRect();
            if (/auto|scroll/.test(ac.overflowX)) break;
            if (ac.overflowX !== 'visible' && (r.left < ar.left - 1 || r.right > ar.right + 1 || r.top < ar.top - 1 || r.bottom > ar.bottom + 1)) { erros.push(onde + ': texto cortado por ' + nome(a) + ': ' + quem(e)); break; }
          }
        }
      }
    }
    if (!oficina) return erros;
    // o bichinho grande: o palco com 40 % da largura ou mais, o desenho com 70 % da altura do palco ou mais
    const pal = document.getElementById('palco').getBoundingClientRect();
    if (pal.width < 0.4 * W) erros.push(onde + ': palco estreito (' + Math.round(pal.width) + ' de ' + W + ')');
    const svg = document.querySelector('#pelucia svg'), sr = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    const alto = Math.min(sr.height, sr.width * vb.height / vb.width);   // o desenho cabe no svg sem deformar (meet)
    if (alto < 0.7 * pal.height) erros.push(onde + ': bichinho pequeno (' + Math.round(alto) + ' de ' + Math.round(pal.height) + ' px de altura)');
    // cartões e alvos para o dedo
    for (const c of P.querySelectorAll('.bichos .opc, .cabides .opc, .itens .opc')) {
      if (!visivel(c)) continue; const r = c.getBoundingClientRect();
      if (Math.min(r.width, r.height) < 88) erros.push(onde + ': cartão pequeno (' + Math.round(r.width) + '×' + Math.round(r.height) + '): ' + quem(c));
    }
    for (const c of P.querySelectorAll('button, .acrilico')) {
      if (!visivel(c)) continue; const r = c.getBoundingClientRect();
      if (Math.min(r.width, r.height) < 44) erros.push(onde + ': alvo pequeno para o dedo (' + Math.round(r.width) + '×' + Math.round(r.height) + '): ' + quem(c));
    }
    for (const b of P.querySelectorAll('input[type=range]')) { if (b.getBoundingClientRect().height < 44) erros.push(onde + ': barra de tom baixa (' + Math.round(b.getBoundingClientRect().height) + ' px)'); }
    // rodapé sem botão gigante
    for (const id of ['btProximo', 'btPronto']) { const b = document.getElementById(id); if (visivel(b) && b.getBoundingClientRect().width > 0.3 * W) erros.push(onde + ': ' + id + ' gigante (' + Math.round(b.getBoundingClientRect().width) + ' px)'); }
    return erros;
  };
}

const TAMANHOS = [[1024, 600], [1280, 800], [1340, 800], [1920, 1080]];
for (const [w, h] of TAMANHOS) {
  test('deitado ' + w + '×' + h + ': bichinho grande, cartões grandes, nada cortado nem rolando, nas 7 etapas e nas outras telas', { timeout: 180000 }, async () => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w <= 1340, hasTouch: true, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await ctx.addInitScript(() => { localStorage.setItem('bolinho:idioma', 'pt'); });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    const pg = await ctx.newPage(), falhas = [];
    pg.on('pageerror', (e) => falhas.push('pageerror: ' + e.message));
    try {
      await pg.goto(base + '?teste');
      await pg.waitForFunction(() => window.AmiguinhoDebug && AmiguinhoDebug.pronto, null, { timeout: 20000 });
      await pg.evaluate(() => document.fonts.ready);
      await pg.waitForTimeout(300);
      await pg.evaluate(instalar);
      const medir = (onde, of) => pg.evaluate(([o, f]) => window.__paisagem(o, f), [onde, of]);
      const tocar = async (sel) => { await pg.click(sel); await pg.waitForTimeout(120); };
      let erros = await medir('começo', false);
      await tocar('#btCriar');
      const etapas = await pg.evaluate(() => AmiguinhoDados.ETAPAS.map((e) => e.id));
      for (let i = 0; i < 7; i++) {
        const id = etapas[i];
        erros = erros.concat(await medir(id, true));
        if (id === 'pelo') { await tocar('#painel [data-pelo]:not(.sel)'); erros = erros.concat(await medir('pelo com a barra de tom', true)); }
        if (id === 'roupa') {
          for (const g of ['inteira', 'cima', 'baixo']) {
            await tocar('#painel [data-grupo="' + g + '"]'); erros = erros.concat(await medir('roupa, grupo ' + g, true));
            await tocar(g === 'baixo' ? '#painel [data-baixo]:not([data-baixo="nenhum"]):not(:disabled)' : '#painel [data-roupa]:not([data-roupa="nenhuma"]):not(:disabled)');
            const cor = await pg.$(g === 'baixo' ? '#painel [data-cor-baixo]' : '#painel [data-cor-roupa]');
            if (cor) { await cor.click(); await pg.waitForTimeout(120); }
            erros = erros.concat(await medir('roupa, grupo ' + g + ', com cor e barra de tom', true));
          }
        }
        if (id === 'acess') {
          await tocar('#painel [data-acess]:not(:disabled)');
          const cor = await pg.$('#painel [data-cor-acess]');
          if (cor) { await cor.click(); await pg.waitForTimeout(120); }
          erros = erros.concat(await medir('acess com cor e barra de tom', true));
        }
        if (i < 6) await tocar('#btProximo');
      }
      // o amiguinho pronto, a certidão e a coleção
      await pg.click('#btPronto');
      await pg.waitForFunction(() => AmiguinhoDebug.estado().tela === 'amigo', null, { timeout: 10000 });
      await pg.waitForTimeout(300);
      erros = erros.concat(await medir('amiguinho pronto', false));
      const topos = await pg.evaluate(() => [...document.querySelectorAll('.am-acoes > *')].filter((b) => !b.hidden).map((b) => Math.round(b.getBoundingClientRect().top)));
      assert.equal(new Set(topos).size, 1, 'os botões do amiguinho pronto numa fileira só: ' + topos);
      await tocar('#btCertidao'); await pg.waitForTimeout(300);
      erros = erros.concat(await medir('certidão', false));
      await tocar('#btFecharCert');
      await pg.goto(base + '?teste');
      await pg.waitForFunction(() => window.AmiguinhoDebug && AmiguinhoDebug.pronto, null, { timeout: 20000 });
      await pg.evaluate(instalar);
      await tocar('#btColecao'); await pg.waitForTimeout(300);
      erros = erros.concat(await medir('coleção', false));
      assert.deepEqual([...new Set(erros)].slice(0, 25), []);
      assert.deepEqual(falhas, []);
    } finally { await ctx.close(); }
  });
}
