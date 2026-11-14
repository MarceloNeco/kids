// Quem é? — arquivos, versão e modo sem internet. Rodar da raiz: node --test quem-e/teste/arquivos.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const pasta = path.resolve(__dirname, '..');
const ler = f => fs.readFileSync(path.join(pasta, f), 'utf8');

test('versão igual nos três lugares (app.js, sw.js e versoes.json)', () => {
  const a = ler('app.js').match(/APP_VERSION = '([\d.]+)'/)[1];
  const s = ler('sw.js').match(/VERSAO = '([\d.]+)'/)[1];
  const j = JSON.parse(ler('versoes.json')), v = j.versoes[0];
  assert.equal(j.app, 'quem-e');
  assert.equal(a, s); assert.equal(v.versao, a);
  for (const k of ['data', 'hora', 'pt', 'en', 'es']) assert.ok(v[k], 'versoes.json sem ' + k);
  assert.match(v.data, /^\d{2}\/[A-Z][a-z]{2}\/\d{4}$/);
  assert.equal(v.pt.length, v.en.length);
  assert.equal(v.pt.length, v.es.length);
  assert.equal(ler('app.js').match(/APP_DATA = '([^']+)'/)[1], v.data);
});

test('sw.js guarda todos os arquivos publicados e as peças de fora', () => {
  const sw = ler('sw.js');
  const lista = JSON.parse(sw.match(/var ARQUIVOS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  for (const a of lista) if (a !== './') assert.ok(fs.existsSync(path.join(pasta, a)), 'falta no disco: ' + a);
  const publicados = fs.readdirSync(pasta).filter(f => /\.(js|css|html|json|png|svg|webmanifest)$/.test(f) && f !== 'sw.js');
  for (const f of publicados) assert.ok(lista.includes(f), 'sw.js não guarda: ' + f);
  for (const f of fs.readdirSync(path.join(pasta, 'personagens'))) assert.ok(lista.includes('personagens/' + f), 'sw.js não guarda: personagens/' + f);
  const html = ler('index.html');
  for (const m of html.matchAll(/src="(\.\.\/[^"]+)"/g)) assert.ok(lista.includes(m[1]), 'sw.js não guarda: ' + m[1]);
  assert.ok(lista.includes('../rabiscolandia/fontes/fredoka.woff2'));
  assert.match(sw, /CACHE = 'quem-e-v'/);
  assert.match(sw, /indexOf\('quem-e-'\) === 0/, 'só apaga os caches do próprio jogo');
  assert.match(sw, /\\\.mp3\$\/i\.test/, 'não mexe nas músicas');
});

test('manifest: instalável, escopo da pasta, ícones existem', () => {
  const m = JSON.parse(ler('manifest.webmanifest'));
  assert.equal(m.scope, './'); assert.equal(m.id, './'); assert.equal(m.start_url, './'); assert.equal(m.display, 'standalone');
  assert.equal(m.short_name, 'Quem é?');
  for (const i of m.icons) assert.ok(fs.existsSync(path.join(pasta, i.src)), i.src);
  assert.ok(m.icons.some(i => i.sizes === '512x512' && /maskable/.test(i.purpose)) && m.icons.some(i => i.sizes === '192x192'));
});

test('documentos do jogo', () => {
  for (const f of ['LEIA-ME.md', 'PENDENCIAS.md', 'CREDITOS.md']) assert.ok(fs.existsSync(path.join(pasta, f)), f);
  assert.match(ler('PENDENCIAS.md'), /foto das massinhas/i);
  assert.match(ler('CREDITOS.md'), /Kevin MacLeod/);
});
