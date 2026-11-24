// Testes de arquivos da Purpurina: node --test purpurina/teste/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const pasta = path.resolve(__dirname, '..');
const ler = f => fs.readFileSync(path.join(pasta, f), 'utf8');

test('versão igual nos três lugares', () => {
  const a = ler('app.js').match(/APP_VERSION = '([\d.]+)'/)[1];
  const s = ler('sw.js').match(/VERSAO = '([\d.]+)'/)[1];
  const v = JSON.parse(ler('versoes.json')).versoes[0];
  assert.equal(a, s); assert.equal(v.versao, a);
  for (const k of ['data', 'hora', 'pt', 'en', 'es']) assert.ok(v[k], 'versoes.json sem ' + k);
  assert.equal(v.pt.length, v.en.length, 'PT e EN com o mesmo número de itens');
  assert.equal(v.pt.length, v.es.length, 'PT e ES com o mesmo número de itens');
});

test('sw.js guarda todos os arquivos publicados', () => {
  const lista = JSON.parse(ler('sw.js').match(/var ARQUIVOS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  for (const a of lista) if (a !== './' && a !== '../recursos.js') assert.ok(fs.existsSync(path.join(pasta, a)), 'falta no disco: ' + a);
  const publicados = fs.readdirSync(pasta).filter(f => /\.(js|css|html|json|png|webmanifest)$/.test(f) && f !== 'sw.js');
  publicados.push('fontes/fredoka.woff2');
  for (const f of publicados) assert.ok(lista.includes(f), 'sw.js não guarda: ' + f);
});

test('index.html: CSP sem script inline, scripts existem, interruptor e textos PT|EN|ES, sem botão de idioma próprio', () => {
  const html = ler('index.html');
  assert.match(html, /Content-Security-Policy/);
  assert.ok(!/<script>(?!\s*<\/script>)/.test(html) && !/<script(?![^>]*src)[^>]*>/.test(html), 'script inline');
  for (const m of html.matchAll(/<script src="([^"]+)"/g)) if (!m[1].startsWith('../')) assert.ok(fs.existsSync(path.join(pasta, m[1])), m[1]);
  assert.match(html, /data-recurso="purpurina-80s"/);
  for (const m of html.matchAll(/data-t="([^"]*)"/g)) assert.equal(m[1].split('|').length, 3, 'texto sem as três línguas: ' + m[1]);
  for (const m of html.matchAll(/data-rotulo="([^"]*)"/g)) assert.equal(m[1].split('|').length, 3, 'rótulo sem as três línguas: ' + m[1]);
  assert.ok(!/aria-label="[^"]* \/ [^"]*"/.test(html), 'rótulo PT / EN sem data-rotulo');
  assert.ok(!/id="btLingua"/.test(html), 'o idioma é escolhido só na estante');
});

test('ids usados no app.js existem no index.html', () => {
  const html = ler('index.html'), js = ler('app.js');
  for (const m of js.matchAll(/\$\('([A-Za-z0-9]+)'\)/g)) assert.ok(html.includes('id="' + m[1] + '"'), 'falta id ' + m[1]);
});

test('interruptor purpurina no recursos-do-app.json do Feature Tester', () => {
  const r = JSON.parse(fs.readFileSync(path.join(pasta, '..', 'recursos-do-app.json'), 'utf8'));
  assert.ok(r.recursos.some(x => x.id === 'purpurina' && x.pagina === 'purpurina/'));
});

test('sem o botão de baixar arquivo (dono, 14/Nov/2026: só confundia; instalar é o caminho)', () => {
  const html = ler('index.html');
  assert.doesNotMatch(html, /btBaixar|baixar\.js/);
  assert.match(html, /recursos\.js"[^>]*data-fora-do-arquivo/);
});

test('instalar: botão sempre à vista, passo a passo comum offline e "já instalado" (dono, 14/Nov/2026: "não acho o ícone")', () => {
  const html = ler('index.html'), js = ler('app.js'), sw = ler('sw.js'), m = JSON.parse(ler('manifest.webmanifest'));
  assert.match(html, /<button id="btInstalar"(?![^>]*hidden)[^>]*>/, 'o botão não nasce escondido');
  assert.match(js, /src = '\.\.\/instalar\.js'/, 'sem a janela do Chrome, abre o passo a passo comum');
  assert.match(sw, /'\.\.\/instalar\.js'/, 'passo a passo guardado para sem internet');
  assert.match(js, /getInstalledRelatedApps/);
  assert.ok(m.related_applications && m.related_applications[0].url.endsWith('/kids/purpurina-80s/manifest.webmanifest'));
  assert.equal(m.id, './', 'id igual ao de antes (start_url) para não virar outro app');
  // tela cheia pelo ⛶ não é janela de app (senão o passo a passo diz "abriu dentro de outro app")
  assert.match(js, /fullscreen\)'\)\.matches && !document\.fullscreenElement/);
  assert.match(fs.readFileSync(path.join(pasta, '..', 'instalar.js'), 'utf8'), /fullscreen\)'\)\.matches && !document\.fullscreenElement/);
});

test('músicas: as mesmas da Purpurina (sem copiar os MP3), todas existem, estão no sw.js e têm crédito lá', () => {
  const urls = require('../som.js').PurpurinaSom.GRAVADAS.map(g => g.url);
  const doSw = JSON.parse(ler('sw.js').match(/var MUSICAS = (\[[^\]]*\]);/)[1].replace(/'/g, '"'));
  assert.ok(urls.length >= 20, 'pelo menos 20 músicas');
  assert.equal(urls[0], '../purpurina/musicas/disco-medusae.mp3', 'a de abertura continua sendo a primeira');
  assert.deepEqual(doSw, urls, 'a mesma lista no sw.js');
  assert.ok(!fs.existsSync(path.join(pasta, 'musicas')), 'sem pasta de músicas própria (não duplica 69 MB)');
  urls.forEach(u => {
    assert.ok(u.startsWith('../'), u + ' vem da pasta de outro jogo');
    assert.ok(fs.existsSync(path.join(pasta, u)), u + ' existe');
    const outro = (f) => { const a = path.join(pasta, u.split('/musicas/')[0], f); return fs.existsSync(a) ? fs.readFileSync(a, 'utf8') : ''; };
    assert.ok((outro('CREDITOS.md') + outro('musicas/LICENCAS.md')).includes(u.split('/').pop()), u + ' tem crédito');
  });
  assert.ok(require('../som.js').PurpurinaSom.GRAVADAS.filter(g => g.desfile).length >= 6, 'pelo menos 6 de passarela (desfile)');
  assert.match(ler('app.js'), /Som\.desfile\(\)/, 'o desfile sorteia uma de passarela');
  // as duas Purpurinas guardam as coisas separadas no aparelho e a gaveta desta não começa com "purpurina-" (a antiga apagaria)
  assert.doesNotMatch(ler('app.js') + ler('tv.js') + ler('ia-foto.js'), /['"]purpurina\./);
  assert.match(ler('sw.js'), /prefixo: 'purpurina80s-'/);
});

test('estilos prontos na tela de looks e desfile com a turma (dono, 15/Nov/2026)', () => {
  const html = ler('index.html'), js = ler('app.js');
  assert.match(html, /id="listaEstilos"/);
  assert.match(js, /function vestirEstilo\(/); assert.match(js, /P\.ESTILOS\.forEach/);
  assert.match(js, /Escolher um estilo pronto/);
  assert.match(js, /function entrarTurma\(/); assert.match(js, /purpurina80s\.looks/); assert.match(js, /limparTurma\(\)/);
});

test('combinações prontas no estúdio com a setinha de "tem mais para o lado" (dono, 15/Nov/2026)', () => {
  const js = ler('app.js'), css = ler('estilo.css');
  assert.match(js, /function combinacoes\(cc\)/); assert.match(js, /P\.COMBOS\[grupoAtual\]/);
  assert.match(css, /\.combos-fila \{[^}]*overflow-x: auto/); assert.match(css, /\.combos\.tem-mais \.combos-fila/); assert.match(css, /\.combos-seta/);
});
