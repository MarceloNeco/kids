// Arquivos da Cozinha (versão, modo sem internet, tela, músicas, segredos): node --test cozinha/teste/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const pasta = path.resolve(__dirname, '..');
const ler = f => fs.readFileSync(path.join(pasta, f), 'utf8');

test('versão 0.1.0 igual nos três lugares (app.js, sw.js e versoes.json), de 06/Nov/2026', () => {
  const a = ler('app.js').match(/APP_VERSION = '([\d.]+)'/)[1];
  const s = ler('sw.js').match(/VERSAO = '([\d.]+)'/)[1];
  const v = JSON.parse(ler('versoes.json')).versoes[0];
  assert.equal(a, '0.1.0'); assert.equal(s, a); assert.equal(v.versao, a);
  assert.equal(v.data, '06/Nov/2026'); assert.match(ler('app.js'), /APP_UPDATED = '06\/Nov\/2026'/);
  for (const k of ['hora', 'pt', 'en']) assert.ok(v[k], 'versoes.json sem ' + k);
  assert.equal(v.pt.length, v.en.length, 'PT e EN com o mesmo número de itens');
  assert.equal(JSON.parse(ler('versoes.json')).app, 'cozinha');
});

test('sw.js: cache com o nome da pasta e guarda todos os arquivos publicados', () => {
  const sw = ler('sw.js');
  assert.match(sw, /var CACHE = 'cozinha-v' \+ VERSAO/);
  assert.match(sw, /indexOf\('cozinha-'\) === 0/);
  const lista = JSON.parse(sw.match(/var ARQUIVOS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  for (const a of lista) if (a !== './') assert.ok(fs.existsSync(path.join(pasta, a)), 'falta no disco: ' + a);
  const publicados = fs.readdirSync(pasta).filter(f => /\.(js|css|html|json|png|webmanifest)$/.test(f) && f !== 'sw.js');
  for (const f of publicados) assert.ok(lista.includes(f), 'sw.js não guarda: ' + f);
  for (const f of ['../recursos.js', '../atualizar.js', '../telacheia.js', '../trilha.js', '../rabiscolandia/fontes/fredoka.woff2']) assert.ok(lista.includes(f), 'sw.js não guarda ' + f);
});

test('index.html: CSP sem script inline, peças comuns, interruptor cozinha e textos PT|EN', () => {
  const html = ler('index.html');
  assert.match(html, /Content-Security-Policy/);
  assert.ok(!/<script(?![^>]*src)[^>]*>/.test(html), 'script inline');
  for (const m of html.matchAll(/<script src="([^"]+)"/g)) assert.ok(fs.existsSync(path.join(pasta, m[1])), m[1]);
  assert.match(html, /<script src="\.\.\/recursos\.js" data-app="kids"/);
  for (const f of ['../atualizar.js', '../telacheia.js', '../trilha.js']) assert.ok(html.includes('<script src="' + f + '"'), 'falta ' + f);
  assert.match(html, /data-recurso="cozinha"/);
  assert.match(html, /rel="manifest" href="manifest.webmanifest"/);
  for (const m of html.matchAll(/data-t="([^"]*)"/g)) assert.equal(m[1].split('|').length, 2, 'texto sem as duas línguas: ' + m[1]);
  assert.match(ler('app.js'), /s\.src = '\.\.\/instalar\.js'/);
});

test('manifest: nome, ícones 192 e 512 que existem e são PNG', () => {
  const m = JSON.parse(ler('manifest.webmanifest'));
  assert.equal(m.short_name, 'Cozinha'); assert.equal(m.start_url, './'); assert.equal(m.scope, './');
  for (const i of m.icons) {
    const b = fs.readFileSync(path.join(pasta, i.src));
    assert.equal(b.slice(1, 4).toString(), 'PNG', i.src);
    const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
    assert.equal(w + 'x' + h, i.sizes, i.src + ' com tamanho errado');
  }
});

test('ids usados no app.js existem no index.html', () => {
  const html = ler('index.html');
  for (const m of ler('app.js').matchAll(/\$\('([A-Za-z0-9]+)'\)/g)) assert.ok(html.includes('id="' + m[1] + '"'), 'falta id ' + m[1]);
});

test('textos t(pt, en) do app sempre nas duas línguas', () => {
  const js = ler('app.js');
  for (const m of js.matchAll(/\bt\('((?:[^'\\]|\\.)*)'\s*\)/g)) assert.fail('t() só com uma língua: ' + m[1]);
});

test('trilha: pelo menos 10 músicas que existem, com crédito no CREDITOS.md e na licença da Rabiscolândia', () => {
  const js = ler('app.js'), cred = ler('CREDITOS.md');
  const lic = fs.readFileSync(path.join(pasta, '..', 'rabiscolandia', 'musicas', 'LICENCAS.md'), 'utf8');
  assert.match(js, /Trilha\.iniciar\(\{ jogo: 'cozinha'/);
  const nomes = [...js.matchAll(/M \+ '([a-z0-9-]+\.mp3)'/g)].map(m => m[1]);
  assert.ok(nomes.length >= 10, 'só ' + nomes.length + ' músicas');
  for (const n of nomes) {
    assert.ok(fs.existsSync(path.join(pasta, '..', 'rabiscolandia', 'musicas', n)), 'falta ' + n);
    assert.ok(lic.includes('`' + n + '`'), 'sem licença ' + n);
    assert.ok(cred.includes(n), 'CREDITOS.md sem ' + n);
  }
  assert.match(cred, /Kevin MacLeod/); assert.match(cred, /CC BY/);
});

test('pendências: a entrevista com a filha do dono está na lista', () => {
  assert.match(ler('PENDENCIAS.md'), /Entrevistar a filha do dono para ajustar receitas, lugares e passos/);
});

test('nenhum segredo nem dado pessoal no código', () => {
  for (const f of fs.readdirSync(pasta).filter(f => /\.(js|html|json|md)$/.test(f))) {
    const s = ler(f);
    assert.ok(!/service_role|sb_secret_|sk-[A-Za-z0-9]{20}|AIza[0-9A-Za-z_-]{30}|\d{3}\.\d{3}\.\d{3}-\d{2}/.test(s), f + ' parece ter segredo ou CPF');
  }
});
