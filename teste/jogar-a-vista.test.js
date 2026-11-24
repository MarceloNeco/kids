// Jogar sempre à vista, sem rolar, no celular em pé (dono, 20/Nov/2026): "em vez de ter um monte de opção tudo de uma
// vez (...) e só tem um botãozinho jogar lá no final (...) o jogar tem que estar sempre lá, disponível com alguma opção
// padrão, visível". Em cada jogo, na tela de começo (depois da abertura "Toque para…", quando há), o botão de jogar
// (ou a primeira escolha que já leva a jogar) tem de estar inteiro dentro da tela em 360×740 e 390×844. Escolhas demais
// = etapas curtas, cada uma cabendo na tela. Jogo novo: uma linha em JOGOS.
// Rodar da raiz do repositório: node --test teste/jogar-a-vista.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const raiz = path.join(__dirname, '..');

// jogo: [o que tocar antes (abertura), o botão que tem de estar à vista]
const JOGOS = {
  baguncolandia: [[], '#btPassoCel'],
  peluqueria: [['#btEntrar'], '#btJogar'],
  purpurina: [['#btEntrar'], '#btLivre'],
  'purpurina-80s': [['#btEntrar'], '#btLivre'],
  'purpurina-nova': [['#btEntrar'], '#btLivre'],
  rabiscolandia: [['#btEntrar'], '#btLivre'],
  'campo-minado': [[], '.nivel.facil'],
  enigmas: [[], '.nivel.facil'],
  aqua: [[], '.nivel.facil'],
  'glub-glub': [[], '#btJogar'],
  'batalha-naval': [[], 'button.grande'],
  'quem-e': [[], '#btBlue'],
  jogoteca: [[], '#btJogar'],
  'fruta-podre': [[], '#btJogar'],
  tijolaco: [[], '#btJogar'],
  'meu-amiguinho': [[], '#btCriar'],
  'a-garra': [[], '#btJogar'],
  labirinto: [[], '#btJogar'],
  cozinha: [['#btEntrar'], '#btCozinhar'],
  vruuum: [['#btEntrar'], '#btCorrer']
};

function servidor() {
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.webmanifest': 'application/manifest+json' };
  return http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (!p.startsWith('/kids/') || /\.mp3$/.test(p)) { r.writeHead(404); return r.end(); }
    p = p.slice(6); if (!p || p.endsWith('/')) p += 'index.html';
    const f = path.join(raiz, p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  });
}

test('todo jogo da estante tem a linha dele aqui', () => {
  const pastas = fs.readdirSync(raiz).filter((g) => fs.existsSync(path.join(raiz, g, 'app.js')) && fs.existsSync(path.join(raiz, g, 'sw.js')));
  for (const g of pastas) assert.ok(JOGOS[g], g + ': falta dizer em JOGOS qual é o botão de jogar');
});

test('celular em pé: o jogar está inteiro na tela, sem rolar', { timeout: 600000 }, async () => {
  const { chromium } = require('playwright');
  const srv = servidor(); await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/kids/';
  const b = await chromium.launch();
  const falhas = [];
  try {
    for (const [W, H] of [[360, 740], [390, 844]]) {
      for (const [id, [antes, jogar]] of Object.entries(JOGOS)) {
        const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
        await ctx.addInitScript(() => { localStorage.setItem('bolinho:idioma', 'pt'); localStorage.setItem('bolinho:novidades-ocultas', '["*"]'); });
        await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
        const pg = await ctx.newPage();
        await pg.goto(base + id + '/');
        await pg.waitForTimeout(2500);
        for (const sel of antes) { await pg.evaluate((q) => { const e = document.querySelector(q); if (e) e.click(); }, sel); await pg.waitForTimeout(1200); }
        const r = await pg.evaluate((q) => {
          const e = [...document.querySelectorAll(q)].find((x) => x.offsetParent !== null || getComputedStyle(x).position === 'fixed');
          if (!e) return null;
          const b = e.getBoundingClientRect();
          return { top: Math.round(b.top), bottom: Math.round(b.bottom), H: innerHeight, rolado: Math.round(scrollY) };
        }, jogar);
        if (!r) falhas.push(`${id} ${W}×${H}: não achei ${jogar}`);
        else if (r.top < 0 || r.bottom > r.H + 1 || r.rolado > 0) falhas.push(`${id} ${W}×${H}: ${jogar} em ${r.top}–${r.bottom} (tela ${r.H})`);
        await ctx.close();
      }
    }
  } finally { await b.close(); srv.close(); }
  assert.deepStrictEqual(falhas, []);
});
