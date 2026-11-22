// Voz de menininha ou de menininho (dono, 22/Nov/2026: a filha fez uma ursinha menina e a voz saiu de homem).
// No Chromium (Playwright), com um speechSynthesis de mentira que tem uma voz feminina e uma masculina por idioma:
// menininha = voz feminina e tom agudo; menininho = voz masculina com tom de criança; o padrão vem do bichinho; a escolha
// fica guardada (rascunho e coleção); com uma voz só no aparelho, o tom diferencia.
// Rodar da raiz do repositório kids: node --test meu-amiguinho/teste/voz.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const D = require('../dados.js');
const R = require('../regras.js');

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

// speechSynthesis de mentira: guarda cada fala (texto, voz, tom) em window.__falas
function vozesDeMentira(lista) {
  const vozes = lista.map((v) => Object.assign({ localService: true, default: false, voiceURI: v.name }, v));
  window.__falas = [];
  class Fala { constructor(t) { this.text = t; this.voice = null; this.pitch = 1; this.rate = 1; this.volume = 1; this.lang = ''; } }
  window.SpeechSynthesisUtterance = Fala;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
    getVoices: () => vozes, cancel: () => {}, speaking: false, addEventListener: () => {},
    speak: (u) => { window.__falas.push({ texto: u.text, voz: u.voice && u.voice.name, tom: u.pitch, lang: u.lang }); setTimeout(() => u.onend && u.onend(), 10); }
  } });
}
const DUAS = [{ name: 'Microsoft Daniel - Portuguese (Brazil)', lang: 'pt-BR' }, { name: 'Microsoft Francisca Online - Portuguese (Brazil)', lang: 'pt-BR' },
  { name: 'Google US English Male', lang: 'en-US' }, { name: 'Samantha', lang: 'en-US' }, { name: 'Jorge', lang: 'es-ES' }, { name: 'Mónica', lang: 'es-ES' }];

async function abrir(lang, vozes) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await ctx.addInitScript((l) => { localStorage.setItem('bolinho:idioma', l); }, lang);
  await ctx.addInitScript(vozesDeMentira, vozes);
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  const pg = await ctx.newPage(), erros = [];
  pg.on('pageerror', (e) => erros.push('pageerror: ' + e.message));
  await pg.goto(base + '?teste');
  await pg.waitForFunction(() => window.AmiguinhoDebug && AmiguinhoDebug.pronto, null, { timeout: 20000 });
  pg.erros = erros; pg.ctx = ctx;
  return pg;
}
const ultima = (pg) => pg.evaluate(() => window.__falas[window.__falas.length - 1]);
async function etapaVoz(pg, bicho) {
  await pg.click('#btCriar'); await pg.waitForTimeout(150);
  if (bicho) await pg.click('#painel [data-base="' + bicho + '"]');
  for (let i = 0; i < 5; i++) { await pg.click('#btProximo'); await pg.waitForTimeout(80); }
}

test('regras: o padrão vem do bichinho (g da turma); a escolha vale e fica guardada; amiguinho antigo sem o campo usa o bichinho', () => {
  for (const b of D.BASES) assert.equal(R.genero(R.novo(b.id)), b.g === 'm' ? 'm' : 'f', b.id);
  const a = R.novo('urso'); a.genero = 'f';
  assert.equal(R.genero(a), 'f');
  assert.equal(R.validar(JSON.parse(JSON.stringify(a))).genero, 'f', 'guardado e lido de volta');
  assert.equal(R.genero(R.validar({ base: 'coelha' })), 'f');
  assert.equal(R.genero(R.validar({ base: 'urso', genero: 'x' })), 'm', 'valor estranho = o do bichinho');
});

for (const [lang, fem, masc, rotF, rotM] of [['pt', /Francisca/, /Daniel/, '♀ Menininha', '♂ Menininho'], ['en', /Samantha/, /Male/, '♀ Little girl', '♂ Little boy'], ['es', /Mónica/, /Jorge/, '♀ Niña', '♂ Niño']]) {
  test('voz ' + lang + ': ursinho começa menininho (voz masculina, tom de criança); ♀ troca para voz feminina aguda; ♂ volta', async () => {
    const pg = await abrir(lang, DUAS);
    try {
      await etapaVoz(pg);   // o urso é "m" na turma
      assert.equal(await pg.textContent('#painel [data-genero="f"]'), rotF);
      assert.equal(await pg.textContent('#painel [data-genero="m"]'), rotM);
      assert.equal(await pg.getAttribute('#painel [data-genero="m"]', 'aria-checked'), 'true', 'padrão do bichinho');
      await pg.click('#painel [data-pronta="abraco"]'); await pg.waitForTimeout(50);
      let f = await ultima(pg); assert.match(f.voz, masc); assert.ok(f.tom >= 1.3 && f.tom <= 1.5, 'tom de menininho: ' + f.tom);
      await pg.click('#painel [data-genero="f"]'); await pg.waitForTimeout(50);
      assert.equal((await pg.evaluate(() => AmiguinhoDebug.estado())).amigo.genero, 'f');
      assert.equal(await pg.getAttribute('#painel [data-genero="f"]', 'aria-checked'), 'true');
      f = await ultima(pg); assert.match(f.voz, fem); assert.ok(f.tom >= 1.6 && f.tom <= 1.9, 'tom de menininha: ' + f.tom);
      // "devagarinho" e "de urso" também seguem a menininha
      await pg.click('#painel [data-voz="devagar"]'); await pg.waitForTimeout(50);
      f = await ultima(pg); assert.match(f.voz, fem); assert.ok(f.tom >= 1.6);
      await pg.click('#painel [data-voz="grossa"]'); await pg.waitForTimeout(50);
      const urso = await ultima(pg); assert.match(urso.voz, fem, 'fala de urso de menininha');
      await pg.click('#painel [data-genero="m"]'); await pg.waitForTimeout(50);
      const ursoM = await ultima(pg); assert.match(ursoM.voz, masc); assert.ok(ursoM.tom < urso.tom, 'fala de urso de menininho mais grossa');
      assert.deepEqual(pg.erros, []);
    } finally { await pg.ctx.close(); }
  });
}

test('coelhinha começa menininha; a escolha fica no rascunho e na coleção (e a frase escrita segue a voz)', async () => {
  const pg = await abrir('pt', DUAS);
  try {
    await etapaVoz(pg, 'coelha');
    assert.equal(await pg.getAttribute('#painel [data-genero="f"]', 'aria-checked'), 'true');
    await pg.click('#painel [data-genero="m"]'); await pg.waitForTimeout(50);
    await pg.fill('#txtFrase', 'Oi, tudo bem?');
    await pg.click('#painel [data-ouvir]'); await pg.waitForTimeout(50);
    const f = await ultima(pg); assert.equal(f.texto, 'Oi, tudo bem?'); assert.match(f.voz, /Daniel/);
    // recarrega: o rascunho lembra
    await pg.reload(); await pg.waitForFunction(() => window.AmiguinhoDebug && AmiguinhoDebug.pronto);
    await pg.click('#btContinuar'); await pg.waitForTimeout(150);
    assert.equal((await pg.evaluate(() => AmiguinhoDebug.estado())).amigo.genero, 'm');
    assert.equal(await pg.getAttribute('#painel [data-genero="m"]', 'aria-checked'), 'true');
    // Pronto: na coleção, o ❤ fala com a voz de menininho
    await pg.click('#btPronto');
    await pg.waitForFunction(() => AmiguinhoDebug.estado().tela === 'amigo', null, { timeout: 8000 });
    await pg.click('#btCoracao'); await pg.waitForTimeout(50);
    assert.match((await ultima(pg)).voz, /Daniel/);
    const guardado = await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:meu-amiguinho:colecao'))[0].genero);
    assert.equal(guardado, 'm');
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});

test('aparelho com uma voz só: o tom diferencia (menininha mais aguda)', async () => {
  const pg = await abrir('pt', [{ name: 'Google português do Brasil', lang: 'pt-BR' }]);
  try {
    await etapaVoz(pg);
    await pg.click('#painel [data-genero="m"]'); await pg.waitForTimeout(50);
    const m = await ultima(pg);
    await pg.click('#painel [data-genero="f"]'); await pg.waitForTimeout(50);
    const f = await ultima(pg);
    assert.equal(m.voz, f.voz);
    assert.ok(f.tom - m.tom >= 0.3, 'menininha ' + f.tom + ' × menininho ' + m.tom);
    assert.deepEqual(pg.erros, []);
  } finally { await pg.ctx.close(); }
});
