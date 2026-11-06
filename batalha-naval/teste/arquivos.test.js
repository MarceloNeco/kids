// Arquivos da Batalha Naval: node --test batalha-naval/teste/arquivos.test.js (rodar da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const pasta = path.resolve(__dirname, '..');
const ler = f => fs.readFileSync(path.join(pasta, f), 'utf8');

test('versão 0.2.0 igual nos três lugares (app.js, sw.js, versoes.json), de 06/Nov/2026', () => {
  const a = ler('app.js').match(/APP_VERSION = '([\d.]+)'/)[1];
  const s = ler('sw.js').match(/VERSAO = '([\d.]+)'/)[1];
  const v = JSON.parse(ler('versoes.json')).versoes[0];
  assert.equal(a, '0.2.0'); assert.equal(s, a); assert.equal(v.versao, a);
  assert.equal(v.data, '06/Nov/2026');
  for (const k of ['data', 'hora', 'pt', 'en']) assert.ok(v[k], 'versoes.json sem ' + k);
  assert.equal(v.pt.length, v.en.length, 'PT e EN com o mesmo número de itens');
});

test('sw.js: cache com o nome da pasta e guarda todos os arquivos publicados', () => {
  const sw = ler('sw.js');
  assert.match(sw, /var CACHE = 'batalha-naval-v'/);
  assert.match(sw, /indexOf\('batalha-naval-'\) === 0/, 'só apaga os caches deste jogo');
  const lista = JSON.parse(sw.match(/var ARQUIVOS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  for (const a of lista) if (a !== './') assert.ok(fs.existsSync(path.join(pasta, a)), 'falta no disco: ' + a);
  const publicados = fs.readdirSync(pasta).filter(f => /\.(js|css|html|json|png|webmanifest)$/.test(f) && f !== 'sw.js');
  for (const f of publicados) assert.ok(lista.includes(f), 'sw.js não guarda: ' + f);
  for (const f of ['../recursos.js', '../atualizar.js', '../telacheia.js', '../trilha.js']) assert.ok(lista.includes(f), 'sw.js não guarda ' + f);
});

test('index.html: CSP sem script inline, scripts existem, interruptor, peças comuns e textos PT|EN', () => {
  const html = ler('index.html');
  assert.match(html, /Content-Security-Policy/);
  assert.ok(!/<script(?![^>]*src)[^>]*>/.test(html), 'script inline');
  assert.ok(!/\son[a-z]+=/i.test(html), 'evento inline (onclick=…)');
  for (const m of html.matchAll(/<script src="([^"]+)"/g)) assert.ok(fs.existsSync(path.join(pasta, m[1])), m[1]);
  assert.match(html, /<script src="\.\.\/recursos\.js" data-app="kids"/);
  for (const f of ['../atualizar.js', '../telacheia.js', '../trilha.js']) assert.ok(html.includes('src="' + f + '"'), f);
  assert.match(html, /data-recurso="batalha-naval"/);
  for (const m of html.matchAll(/data-t="([^"]*)"/g)) assert.equal(m[1].split('|').length, 2, 'texto sem as duas línguas: ' + m[1]);
  assert.match(ler('app.js'), /s\.src = '\.\.\/instalar\.js'/);
});

test('ids usados no app.js existem no index.html', () => {
  const html = ler('index.html');
  for (const m of ler('app.js').matchAll(/\$\('([A-Za-z0-9]+)'\)/g)) assert.ok(html.includes('id="' + m[1] + '"'), 'falta id ' + m[1]);
});

test('textos t(pt, en) sempre nas duas línguas', () => {
  const js = ler('app.js');
  for (const m of js.matchAll(/\bt\('((?:[^'\\]|\\.)*)'\s*\)/g)) assert.fail('t() só com uma língua: ' + m[1]);
});

test('o que vem da rede nunca vai para innerHTML', () => {
  const js = ler('app.js');
  for (const m of js.matchAll(/innerHTML\s*=\s*([^;]+);/g)) assert.equal(m[1].trim(), "''", 'innerHTML com conteúdo: ' + m[1]);
  assert.ok(!/insertAdjacentHTML|outerHTML\s*=|document\.write/.test(js + ler('rede.js')));
});

test('nenhum segredo: só a chave publishable do Supabase', () => {
  for (const f of fs.readdirSync(pasta).filter(f => f.endsWith('.js'))) {
    const js = ler(f);
    assert.ok(!/service_role|sb_secret_|sk-[A-Za-z0-9]{20}|AIza[0-9A-Za-z_-]{30}|eyJhbGciOi/.test(js), f + ' parece ter segredo');
  }
  assert.match(ler('rede.js'), /sb_publishable_/);
});

test('manifest e ícones', () => {
  const m = JSON.parse(ler('manifest.webmanifest'));
  assert.equal(m.start_url, './'); assert.equal(m.scope, './');
  for (const i of m.icons) assert.ok(fs.existsSync(path.join(pasta, i.src)), i.src);
  const png = fs.readFileSync(path.join(pasta, 'icone-512.png'));
  assert.equal(png.readUInt32BE(16), 512); assert.equal(png.readUInt32BE(20), 512);
  assert.ok(fs.existsSync(path.join(pasta, 'icone.svg')), 'o desenho original do ícone');
});

test('documentos da pasta', () => {
  for (const f of ['LEIA-ME.md', 'PENDENCIAS.md', 'CREDITOS.md']) assert.ok(ler(f).length > 200, f);
});
