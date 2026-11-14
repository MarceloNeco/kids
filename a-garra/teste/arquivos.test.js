// Testes de arquivos do H-rraaa (pasta a-garra): node --test a-garra/teste/*.test.js (rodar da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const pasta = path.resolve(__dirname, '..');
const ler = f => fs.readFileSync(path.join(pasta, f), 'utf8');

test('versão 0.4.2 igual nos três lugares (app.js, sw.js, versoes.json)', () => {
  const a = ler('app.js').match(/APP_VERSION = '([\d.]+)'/)[1];
  const s = ler('sw.js').match(/VERSAO = '([\d.]+)'/)[1];
  const v = JSON.parse(ler('versoes.json')).versoes[0];
  assert.equal(a, '0.4.2'); assert.equal(a, s); assert.equal(v.versao, a);
  assert.equal(v.data, '14/Nov/2026');
  assert.match(ler('app.js'), /APP_DATA = \['14\/Nov\/2026', 'Nov\/14\/2026', '14\/nov\/2026'\]/);
  for (const k of ['data', 'hora', 'pt', 'en', 'es']) assert.ok(v[k], 'versoes.json sem ' + k);
  assert.equal(v.pt.length, v.en.length, 'PT e EN com o mesmo número de itens');
  assert.equal(v.pt.length, v.es.length, 'PT e ES com o mesmo número de itens');
});

test('sw.js guarda todos os arquivos publicados, cache com o nome da pasta', () => {
  const sw = ler('sw.js');
  assert.match(sw, /var CACHE = 'a-garra-v'/);
  assert.match(sw, /indexOf\('a-garra-'\) === 0/);
  const lista = JSON.parse(sw.match(/var ARQUIVOS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  for (const a of lista) if (a !== './') assert.ok(fs.existsSync(path.join(pasta, a)), 'falta no disco: ' + a);
  const publicados = fs.readdirSync(pasta).filter(f => /\.(js|css|html|json|png|webmanifest)$/.test(f) && f !== 'sw.js');
  for (const f of publicados) assert.ok(lista.includes(f), 'sw.js não guarda: ' + f);
  for (const f of ['../trilha.js', '../recursos.js', '../atualizar.js', '../telacheia.js', '../rabiscolandia/fontes/fredoka.woff2']) assert.ok(lista.includes(f), 'sw.js não guarda ' + f);
});

test('index.html: CSP sem script inline, scripts existem, interruptor e textos PT|EN|ES, sem botão de idioma', () => {
  const html = ler('index.html');
  assert.match(html, /Content-Security-Policy/);
  assert.ok(!/<script(?![^>]*src)[^>]*>/.test(html), 'script inline');
  for (const m of html.matchAll(/<script src="([^"]+)"/g)) assert.ok(fs.existsSync(path.join(pasta, m[1])), m[1]);
  assert.match(html, /<script src="\.\.\/recursos\.js" data-app="kids" data-fora-do-arquivo><\/script>/);
  assert.match(html, /<script src="\.\.\/atualizar\.js" data-fora-do-arquivo>/);
  assert.match(html, /<script src="\.\.\/telacheia\.js" data-fora-do-arquivo>/);
  assert.match(html, /<script src="\.\.\/trilha\.js">/);
  assert.match(html, /data-recurso="a-garra"/);
  for (const m of html.matchAll(/data-(?:t|rotulo)="([^"]*)"/g)) assert.equal(m[1].split('|').length, 3, 'texto sem os três idiomas: ' + m[1]);
  assert.ok(!/btLingua/.test(html + ler('app.js')), 'o idioma vem só da estante: nada de botão próprio');
  assert.ok(!/navigator\.language/.test(ler('app.js')), 'nada de adivinhar o idioma pelo aparelho');
  assert.match(ler('app.js'), /s\.src = '\.\.\/instalar\.js'/);
});

test('ids usados no app.js existem no index.html', () => {
  const html = ler('index.html');
  for (const m of ler('app.js').matchAll(/\$\('([A-Za-z0-9]+)'\)/g)) assert.ok(html.includes('id="' + m[1] + '"'), 'falta id ' + m[1]);
});

test('textos t(pt, en, es) sempre nos três idiomas, e os nomes dos prêmios e das máquinas também', () => {
  for (const m of ler('app.js').matchAll(/\bt\('((?:[^'\\]|\\.)*)'\s*\)/g)) assert.fail('t() só com uma língua: ' + m[1]);
  for (const m of ler('app.js').matchAll(/\bt\(\s*'(?:[^'\\]|\\.)*'\s*,\s*'(?:[^'\\]|\\.)*'\s*\)/g)) assert.fail('t() sem o espanhol: ' + m[0]);
  const p3 = ler('premios3d.js'), nomes = p3.slice(p3.indexOf('export const NOMES'), p3.indexOf('};', p3.indexOf('export const NOMES')));
  for (const m of nomes.matchAll(/\[('[^']*'(?:, '[^']*')*)\]/g)) assert.equal(m[1].split("', '").length, 3, 'prêmio sem os três idiomas: ' + m[1]);
  for (const m of p3.matchAll(/(nome|prem): \[([^\]]*)\]/g)) assert.equal(m[2].split(',').length, 3, 'máquina sem os três idiomas: ' + m[0]);
});

test('manifest e ícones', () => {
  const m = JSON.parse(ler('manifest.webmanifest'));
  assert.equal(m.start_url, './'); assert.equal(m.scope, './');
  for (const i of m.icons) assert.ok(fs.existsSync(path.join(pasta, i.src)), i.src);
  for (const [f, n] of [['icone-192.png', 192], ['icone-512.png', 512]]) {
    const b = fs.readFileSync(path.join(pasta, f));
    assert.equal(b.readUInt32BE(16), n, f + ' largura'); assert.equal(b.readUInt32BE(20), n, f + ' altura');
  }
});

test('trilha: pelo menos 10 músicas, todas existem e têm crédito no CREDITOS.md', () => {
  const js = ler('app.js'), cred = ler('CREDITOS.md');
  assert.match(js, /Trilha\.iniciar\(\{ jogo: 'a-garra'/);
  const musicas = [...js.matchAll(/\{ a: '([^']+\.mp3)', t: '([^']+)'/g)];
  assert.ok(musicas.length >= 10, 'poucas músicas: ' + musicas.length);
  for (const [, a, t] of musicas) {
    assert.ok(fs.existsSync(path.join(pasta, a)), 'falta o arquivo ' + a);
    assert.ok(cred.includes(path.basename(a)) && cred.includes(t), 'sem crédito: ' + a);
  }
});

test('nenhum segredo nem dado pessoal no código', () => {
  for (const f of fs.readdirSync(pasta).filter(f => /\.(js|html|json|md)$/.test(f))) {
    const s = ler(f);
    assert.ok(!/service_role|sb_secret_|sk-[A-Za-z0-9]{20}|AIza[0-9A-Za-z_-]{30}|ghp_[A-Za-z0-9]{20}/.test(s), f + ' parece ter segredo');
  }
});

test('3D: a biblioteca Three.js mora na pasta, com a licença, e o service worker guarda os módulos', () => {
  for (const f of ['libs/three.module.js', 'libs/three.core.js', 'libs/LICENSE-three.txt']) assert.ok(fs.existsSync(path.join(pasta, f)), 'falta ' + f);
  assert.match(ler('libs/three.module.js'), /from '\.\/three\.core\.js'/);
  const sw = ler('sw.js');
  for (const f of ['premios3d.js', 'cenario3d.js', 'libs/three.module.js', 'libs/three.core.js']) assert.ok(sw.includes("'" + f + "'"), 'sw.js sem ' + f);
  assert.match(ler('index.html'), /<script src="app\.js" type="module"><\/script>/);
  assert.match(ler('CREDITOS.md'), /Three\.js/);
});
