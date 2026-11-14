// Arquivos da Cozinha (versão, modo sem internet, tela, músicas, segredos): node --test cozinha/teste/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const pasta = path.resolve(__dirname, '..');
const ler = f => fs.readFileSync(path.join(pasta, f), 'utf8');

test('versão 0.11.1 igual nos três lugares (app.js, sw.js e versoes.json), de 14/Nov/2026', () => {
  const a = ler('app.js').match(/APP_VERSION = '([\d.]+)'/)[1];
  const s = ler('sw.js').match(/VERSAO = '([\d.]+)'/)[1];
  const v = JSON.parse(ler('versoes.json')).versoes[0];
  assert.equal(a, '0.11.1'); assert.equal(s, a); assert.equal(v.versao, a);
  assert.equal(v.data, '14/Nov/2026'); assert.match(ler('app.js'), /APP_UPDATED = '14\/Nov\/2026'/);
  for (const k of ['hora', 'pt', 'en', 'es']) assert.ok(v[k], 'versoes.json sem ' + k);
  assert.equal(v.pt.length, v.en.length, 'PT e EN com o mesmo número de itens');
  assert.equal(v.pt.length, v.es.length, 'PT e ES com o mesmo número de itens');
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

test('index.html: CSP sem script inline, peças comuns, interruptor cozinha e textos PT|EN|ES', () => {
  const html = ler('index.html');
  assert.match(html, /Content-Security-Policy/);
  assert.ok(!/<script(?![^>]*src)[^>]*>/.test(html), 'script inline');
  for (const m of html.matchAll(/<script src="([^"]+)"/g)) assert.ok(fs.existsSync(path.join(pasta, m[1])), m[1]);
  assert.match(html, /<script src="\.\.\/recursos\.js" data-app="kids"/);
  for (const f of ['../atualizar.js', '../telacheia.js', '../trilha.js']) assert.ok(html.includes('<script src="' + f + '"'), 'falta ' + f);
  assert.match(html, /data-recurso="cozinha"/);
  assert.match(html, /rel="manifest" href="manifest.webmanifest"/);
  for (const m of html.matchAll(/data-t="([^"]*)"/g)) assert.equal(m[1].split('|').length, 3, 'texto sem as três línguas: ' + m[1]);
  assert.match(ler('app.js'), /s\.src = '\.\.\/instalar\.js'/);
});

test('manifest: nome, ícones 192 e 512 que existem e são PNG', () => {
  const m = JSON.parse(ler('manifest.webmanifest'));
  assert.equal(m.short_name, 'Mão na Massa'); assert.equal(m.start_url, './'); assert.equal(m.scope, './');
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

test('textos t(pt, en, es) do app sempre nas três línguas; nenhum botão de idioma próprio (a escolha é na estante)', () => {
  const js = ler('app.js');
  for (const m of js.matchAll(/\bt\('((?:[^'\\]|\\.)*)'\s*\)/g)) assert.fail('t() só com uma língua: ' + m[1]);
  for (const m of js.matchAll(/\bt\((?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*,\s*(?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*\)/g)) assert.fail('t() sem o espanhol: ' + m[0]);
  const html = ler('index.html');
  for (const m of html.matchAll(/data-(?:t|rotulo|logo)="([^"]*)"/g)) assert.equal(m[1].split('|').length, 3, 'pt|en|es: ' + m[1]);
  assert.ok(!/btLingua/.test(html + js), 'sem #btLingua');
  assert.ok(!/navigator\.language/.test(js), 'o idioma vem da estante (../idioma.js), não do aparelho');
  assert.match(html, /data-logo="Mão na Massa\|My Little Big Chef\|Manos a la Masa"/);
});

test('trilha: pelo menos 10 músicas animadas que existem, com crédito no CREDITOS.md e na licença de origem; nada de som de videogame', () => {
  const js = ler('app.js'), cred = ler('CREDITOS.md');
  const lic = { M: fs.readFileSync(path.join(pasta, '..', 'rabiscolandia', 'musicas', 'LICENCAS.md'), 'utf8'), B: fs.readFileSync(path.join(pasta, '..', 'baguncolandia', 'CREDITOS.md'), 'utf8') };
  const PASTA = { M: 'rabiscolandia', B: 'baguncolandia' };
  assert.match(js, /var M = '\.\.\/rabiscolandia\/musicas\/', B = '\.\.\/baguncolandia\/musicas\/'/);
  assert.match(js, /Trilha\.iniciar\(\{ jogo: 'cozinha'/);
  const trilha = js.slice(js.indexOf("Trilha.iniciar({ jogo: 'cozinha'"), js.indexOf('] });', js.indexOf("Trilha.iniciar({ jogo: 'cozinha'")));
  const musicas = [...trilha.matchAll(/\{ a: ([MB]) \+ '([a-z0-9-]+\.mp3)', t: '([^']+)'/g)].map(m => ({ p: m[1], n: m[2], t: m[3] }));
  assert.ok(musicas.length >= 10, 'só ' + musicas.length + ' músicas');
  assert.equal(musicas.length, (trilha.match(/\{ a: /g) || []).length, 'toda música aponta para M (Rabiscolândia) ou B (Bagunçolândia)');
  for (const m of musicas) {
    assert.ok(fs.existsSync(path.join(pasta, '..', PASTA[m.p], 'musicas', m.n)), 'falta ' + m.n);
    assert.ok(m.p === 'M' ? lic.M.includes('`' + m.n + '`') : lic.B.includes(m.t), 'sem licença na origem: ' + m.n);
    assert.ok(cred.includes('`' + m.n + '`'), 'CREDITOS.md sem ' + m.n);
  }
  // o dono não gosta de som de "Atari" (sintetizador/8 bits) nem de música calma demais para cozinhar
  for (const ruim of ['spazzmatica', 'pixel-peeker', 'bit-bit', 'wakka', 'gymnopedie', 'who-likes-to-party', 'disco-lounge', 'airport-lounge'])
    assert.ok(!trilha.includes(ruim), 'música que não combina: ' + ruim);
  assert.ok(!fs.readdirSync(pasta).some(f => /\.mp3$/.test(f)), 'nenhum mp3 copiado para a pasta da cozinha');
  assert.match(cred, /Kevin MacLeod/); assert.match(cred, /CC BY/); assert.match(cred, /CC0/); assert.match(cred, /Rafael Krux/);
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

test('fotos de verdade (v0.6.0): toda receita e todo ingrediente tem a sua foto JPG pequena, guardada para sem internet e com crédito', () => {
  const D = require('../dados.js');
  const sw = ler('sw.js'), cred = ler('CREDITOS.md');
  const lista = JSON.parse(sw.match(/var ARQUIVOS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  const ids = D.RECEITAS.map(r => r.id).concat(D.INGREDIENTES.map(i => i.id));
  assert.equal(new Set(ids).size, ids.length, 'receita e ingrediente com o mesmo id dividiriam a mesma foto');
  for (const id of ids) {
    const f = 'fotos/' + id + '.jpg', b = fs.readFileSync(path.join(pasta, f));
    assert.equal(b[0] === 0xff && b[1] === 0xd8, true, f + ' não é JPG');
    assert.ok(b.length < 70 * 1024, f + ' grande demais (' + Math.round(b.length / 1024) + ' KB)');
    assert.ok(lista.includes(f), 'sw.js não guarda ' + f);
    assert.ok(cred.includes('`' + f + '`'), 'CREDITOS.md sem ' + f);
  }
  // só licença livre (domínio público, CC0, CC BY, CC BY-SA), com autor e link da página de cada foto
  const linhas = cred.split('\n').filter(l => /`fotos\/[a-z-]+\.jpg`/.test(l));
  assert.equal(linhas.length, ids.length);
  for (const l of linhas) { assert.match(l, /(CC0|domínio público|CC BY(-SA)? [0-9.]+)/, l); assert.match(l, /https:\/\/commons\.wikimedia\.org\/wiki\/File:/, l); }
});

test('voz gravada da Dona Cida (v0.6.1): cada frase que ela fala tem o seu mp3, guardado para sem internet e com crédito', () => {
  const D = require('../dados.js');
  const js = ler('app.js'), sw = ler('sw.js'), cred = ler('CREDITOS.md');
  const lista = JSON.parse(sw.match(/var ARQUIVOS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  const chaves = [...js.matchAll(/, (?:false|true), '([a-z-]+)'\);/g)].map(m => m[1]).filter(c => c !== 'aqui-');
  assert.ok(chaves.length >= 6, 'frases fixas: ' + chaves);
  chaves.push('exemplo');
  for (const g of D.INGREDIENTES.filter(x => x.vizinha)) chaves.push('aqui-' + g.id);
  for (const c of chaves) {
    const f = 'voz/cida-' + c + '.mp3', b = fs.readFileSync(path.join(pasta, f));
    assert.ok(b.length > 4000 && b.length < 60 * 1024, f + ' com tamanho estranho');
    assert.ok(lista.includes(f), 'sw.js não guarda ' + f);
  }
  assert.match(sw, /url\.pathname\.indexOf\('\/cozinha\/voz\/'\) < 0\) return;/, 'a voz não fica de fora do service worker como as músicas');
  assert.match(cred, /Kokoro/); assert.match(cred, /pf_dora/); assert.match(cred, /Apache/);
});
