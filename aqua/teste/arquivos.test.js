// Testes de arquivos do AQUA: node --test aqua/teste/*.test.js (rodar da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const pasta = path.resolve(__dirname, '..');
const ler = f => fs.readFileSync(path.join(pasta, f), 'utf8');

test('versão igual nos três lugares (app.js, sw.js e versoes.json) e é a 0.1.0 de 14/Nov/2026', () => {
  const a = ler('app.js').match(/APP_VERSION = '([\d.]+)'/)[1];
  const s = ler('sw.js').match(/VERSAO = '([\d.]+)'/)[1];
  const j = JSON.parse(ler('versoes.json'));
  const v = j.versoes[0];
  assert.equal(j.app, 'aqua');
  assert.equal(a, s); assert.equal(v.versao, a);
  for (const k of ['data', 'hora', 'pt', 'en']) assert.ok(v[k], 'versoes.json sem ' + k);
  assert.match(v.data, /^\d{2}\/[A-Z][a-z]{2}\/\d{4}$/);
  assert.equal(v.pt.length, v.en.length, 'PT e EN com o mesmo número de itens');
  assert.equal(ler('app.js').match(/APP_DATA = '([^']+)'/)[1], v.data);
  assert.equal(a, '0.1.0'); assert.equal(v.data, '14/Nov/2026');
});

test('sw.js guarda todos os arquivos publicados (e os de fora, com ../)', () => {
  const sw = ler('sw.js');
  const lista = JSON.parse(sw.match(/var ARQUIVOS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  for (const a of lista) if (a !== './') assert.ok(fs.existsSync(path.join(pasta, a)), 'falta no disco: ' + a);
  const publicados = fs.readdirSync(pasta).filter(f => /\.(js|css|html|json|png|svg|webmanifest)$/.test(f) && f !== 'sw.js');
  for (const f of publicados) assert.ok(lista.includes(f), 'sw.js não guarda: ' + f);
  for (const f of ['../recursos.js', '../idioma.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../trilha.js', '../rabiscolandia/fontes/fredoka.woff2']) assert.ok(lista.includes(f), 'sw.js não guarda: ' + f);
  assert.match(sw, /CACHE = 'aqua-v'/);
  assert.match(sw, /indexOf\('aqua-'\) === 0/, 'só apaga os caches do próprio jogo');
  assert.match(sw, /\\\.mp3\$\/i\.test\(url\.pathname\) && !efeito\) return;/, 'não mexe nas músicas (só guarda os efeitos da pasta sons/)');
  for (const f of fs.readdirSync(path.join(pasta, 'sons'))) assert.ok(lista.includes('sons/' + f), 'sw.js não guarda: sons/' + f);
});

test('manifest: instalável, escopo da pasta, ícones existem', () => {
  const m = JSON.parse(ler('manifest.webmanifest'));
  assert.equal(m.scope, './'); assert.equal(m.id, './'); assert.equal(m.start_url, './'); assert.equal(m.display, 'standalone');
  assert.ok(m.name && m.short_name);
  for (const i of m.icons) assert.ok(fs.existsSync(path.join(pasta, i.src)), i.src);
  assert.ok(m.icons.some(i => i.sizes === '512x512') && m.icons.some(i => i.sizes === '192x192'));
  // PNG de verdade, do tamanho que diz
  for (const [f, t] of [['icone-192.png', 192], ['icone-512.png', 512]]) {
    const b = fs.readFileSync(path.join(pasta, f));
    assert.equal(b.toString('hex', 0, 8), '89504e470d0a1a0a', f + ' não é PNG');
    assert.equal(b.readUInt32BE(16), t); assert.equal(b.readUInt32BE(20), t);
  }
});

test('index.html: CSP sem script inline, scripts existem, interruptor e textos PT|EN', () => {
  const html = ler('index.html');
  assert.match(html, /Content-Security-Policy/);
  assert.ok(!/<script(?![^>]*src)[^>]*>/.test(html), 'script inline');
  for (const m of html.matchAll(/<script src="([^"]+)"/g)) assert.ok(fs.existsSync(path.join(pasta, m[1])), m[1]);
  for (const f of ['../recursos.js', '../atualizar.js', '../telacheia.js', '../trilha.js']) assert.ok(html.includes('<script src="' + f + '"'), 'falta ' + f);
  assert.match(html, /<script src="\.\.\/recursos\.js" data-app="kids"/);
  assert.match(html, /data-recurso="aqua"/);
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest">/);
  for (const m of html.matchAll(/data-(?:t|rotulo)="([^"]*)"/g)) assert.equal(m[1].split('|').length, 2, 'texto sem as duas línguas: ' + m[1]);
});

test('ids usados no app.js existem no index.html', () => {
  const html = ler('index.html');
  for (const m of ler('app.js').matchAll(/\$\('([A-Za-z0-9]+)'\)/g)) assert.ok(html.includes('id="' + m[1] + '"'), 'falta id ' + m[1]);
});

test('textos t(pt, en) do app sempre nas duas línguas', () => {
  const js = ler('app.js');
  for (const m of js.matchAll(/\bt\('((?:[^'\\]|\\.)*)'\s*\)/g)) assert.fail('t() só com uma língua: ' + m[1]);
});

test('carrega o instalar.js comum só com ?instalar', () => {
  const js = ler('app.js');
  assert.match(js, /s\.src = '\.\.\/instalar\.js'/);
  assert.match(js, /\[\?&\]instalar\\b/);
});

test('música: pelo menos 10 gravadas, todas existem e têm crédito no CREDITOS.md e na licença de origem', () => {
  const js = ler('app.js'), cred = ler('CREDITOS.md');
  const lic = fs.readFileSync(path.join(pasta, '..', 'purpurina', 'musicas', 'LICENCAS.md'), 'utf8');
  const usadas = [...js.matchAll(/M_ \+ '([a-z0-9-]+\.mp3)'/g)].map(m => m[1]);
  assert.ok(usadas.length >= 10, 'poucas músicas: ' + usadas.length);
  assert.equal(new Set(usadas).size, usadas.length, 'música repetida');
  assert.match(js, /var M_ = '\.\.\/purpurina\/musicas\/'/);
  for (const f of usadas) {
    assert.ok(fs.existsSync(path.join(pasta, '..', 'purpurina', 'musicas', f)), 'falta o arquivo ' + f);
    assert.ok(lic.includes('`' + f + '`'), 'sem licença de origem: ' + f);
    assert.ok(cred.includes('`' + f + '`'), 'sem crédito no CREDITOS.md: ' + f);
  }
  assert.match(js, /Trilha\.iniciar\(\{ jogo: 'aqua', musicas: MUSICAS, creditos: 'CREDITOS\.md' \}\)/);
  assert.ok(!fs.existsSync(path.join(pasta, 'musicas')), 'nenhuma música copiada para cá');
});

test('efeitos sonoros: os arquivos que o som.js toca existem, são pequenos e têm crédito no CREDITOS.md', () => {
  const Som = require('../som.js'), cred = ler('CREDITOS.md');
  const nomes = Object.values(Som.ARQUIVOS);
  assert.ok(nomes.length >= 6);
  for (const a of nomes) {
    assert.ok(fs.existsSync(path.join(pasta, a)), 'falta ' + a);
    const tam = fs.statSync(path.join(pasta, a)).size;
    assert.ok(tam > 500 && tam < 150 * 1024, a + ' tem ' + tam + ' bytes');
    assert.ok(cred.includes('`' + a + '`'), 'sem crédito no CREDITOS.md: ' + a);
  }
});

test('sem anúncio, sem compra, sem rede de fora: o jogo só fala com a própria pasta', () => {
  for (const f of ['app.js', 'motor.js', 'som.js', 'desenho.js', 'index.html']) {
    const s = ler(f);
    assert.ok(!/https?:\/\/(?!www\.w3\.org)/.test(s.replace(/incompetech\.com/g, '')), f + ' aponta para fora');
    assert.ok(!/adsbygoogle|googletag|doubleclick|PaymentRequest|checkout|R\$\s*\d/i.test(s), f + ' parece ter anúncio ou compra');
  }
  assert.match(ler('index.html'), /default-src 'self'/);
});

test('nenhum segredo nem dado pessoal no código', () => {
  for (const f of fs.readdirSync(pasta).filter(f => /\.(js|html|json|md)$/.test(f))) {
    const s = ler(f);
    assert.ok(!/service_role|sb_secret_|sk-[A-Za-z0-9]{20}|AIza[0-9A-Za-z_-]{30}|eyJhbGci/.test(s), f + ' parece ter segredo');
    assert.ok(!/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/.test(s), f + ' parece ter CPF');
  }
});

test('localStorage sempre dentro de try/catch', () => {
  const js = ler('app.js');
  for (const linha of js.split('\n').filter(l => /localStorage\./.test(l))) assert.match(linha, /try \{/, 'localStorage sem try: ' + linha.trim());
});
