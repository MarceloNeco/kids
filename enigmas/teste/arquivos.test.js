// Enigmas de Ligar — arquivos do app: versão, sem internet, página, músicas e créditos.
// Rodar da raiz do kids: node --test enigmas/teste/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const pasta = path.resolve(__dirname, '..');
const ler = f => fs.readFileSync(path.join(pasta, f), 'utf8');

test('versão igual nos três lugares: app.js, sw.js e a primeira entrada de versoes.json', () => {
  const a = ler('app.js').match(/APP_VERSION = '([\d.]+)'/)[1];
  const s = ler('sw.js').match(/VERSAO = '([\d.]+)'/)[1];
  const v = JSON.parse(ler('versoes.json'));
  assert.equal(v.app, 'enigmas');
  assert.equal(a, s); assert.equal(v.versoes[0].versao, a);
  for (const k of ['data', 'hora', 'pt', 'en']) assert.ok(v.versoes[0][k], 'versoes.json sem ' + k);
  assert.match(v.versoes[0].data, /^\d{2}\/(Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)\/\d{4}$/);
  assert.equal(v.versoes[0].pt.length, v.versoes[0].en.length, 'PT e EN com o mesmo número de itens');
});

test('sw.js: cache com o nome do app e guarda todos os arquivos publicados', () => {
  const sw = ler('sw.js');
  assert.match(sw, /var CACHE = 'enigmas-v' \+ VERSAO/);
  assert.match(sw, /indexOf\('enigmas-'\) === 0/, 'só apaga os caches deste app');
  const lista = JSON.parse(sw.match(/var ARQUIVOS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  for (const a of lista) if (a !== './') assert.ok(fs.existsSync(path.join(pasta, a)), 'falta no disco: ' + a);
  const publicados = fs.readdirSync(pasta).filter(f => /\.(js|css|html|json|png|webmanifest)$/.test(f) && f !== 'sw.js');
  publicados.push('fontes/fredoka.woff2');
  for (const f of publicados) assert.ok(lista.includes(f), 'sw.js não guarda: ' + f);
  for (const f of ['../recursos.js', '../atualizar.js', '../telacheia.js', '../janela.js', '../trilha.js']) assert.ok(lista.includes(f), 'sw.js não guarda ' + f);
});

test('index.html: CSP sem script inline, scripts existem, interruptor e textos PT|EN', () => {
  const html = ler('index.html');
  assert.match(html, /Content-Security-Policy/);
  assert.ok(!/<script(?![^>]*src)[^>]*>/.test(html), 'script inline');
  for (const m of html.matchAll(/<script src="([^"]+)"/g)) assert.ok(fs.existsSync(path.join(pasta, m[1])), m[1]);
  assert.match(html, /<script src="\.\.\/recursos\.js" data-app="kids"/, 'interruptores do RootifyONE como nos outros jogos');
  assert.ok((html.match(/data-recurso="enigmas"/g) || []).length >= 2, 'as duas telas obedecem o interruptor "enigmas"');
  for (const m of html.matchAll(/data-t="([^"]*)"/g)) assert.equal(m[1].split('|').length, 2, 'texto sem as duas línguas: ' + m[1]);
  // a ordem importa: dados e regras antes do app; janela.js antes de quem abre janela
  const ordem = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
  assert.ok(ordem.indexOf('rodadas.js') < ordem.indexOf('app.js') && ordem.indexOf('jogo.js') < ordem.indexOf('app.js'));
  assert.ok(ordem.indexOf('../janela.js') < ordem.indexOf('app.js') && ordem.indexOf('../trilha.js') < ordem.indexOf('app.js'));
});

test('ids usados no app.js existem no index.html', () => {
  const html = ler('index.html');
  for (const m of ler('app.js').matchAll(/\$\('([A-Za-z0-9]+)'\)/g)) assert.ok(html.includes('id="' + m[1] + '"'), 'falta id ' + m[1]);
  for (const n of ['Facil', 'Medio', 'Dificil']) { assert.ok(html.includes('id="bt' + n + '"')); assert.ok(html.includes('id="prog' + n + '"')); }
});

test('textos t(pt, en) do app sempre nas duas línguas', () => {
  const js = ler('app.js');
  for (const m of js.matchAll(/\bt\('((?:[^'\\]|\\.)*)'\s*\)/g)) assert.fail('t() só com uma língua: ' + m[1]);
});

test('música: pelo menos 10 faixas da trilha comum, todas existem, mais baixinha e com crédito', () => {
  const js = ler('app.js'), creditos = ler('CREDITOS.md');
  assert.match(js, /Trilha\.iniciar\(\{ jogo: 'enigmas'/);
  const vol = +js.match(/Trilha\.iniciar\(\{[^}]*volume: ([\d.]+)/)[1];
  assert.ok(vol < 0.5, 'volume tem de ser menor que o padrão (0.5) do trilha.js');
  const faixas = [...js.matchAll(/\{ a: M \+ '([^']+)', t: '([^']+)', au: '([^']+)'/g)];
  assert.ok(faixas.length >= 10, 'só ' + faixas.length + ' músicas');
  for (const [, arq, titulo, autor] of faixas) {
    assert.ok(fs.existsSync(path.join(pasta, '..', 'baguncolandia', 'musicas', arq)), 'música não existe: ' + arq);
    assert.ok(creditos.includes(titulo) && creditos.includes(autor), 'sem crédito no CREDITOS.md: ' + titulo + ' · ' + autor);
    assert.ok(creditos.includes(arq), 'CREDITOS.md não diz o arquivo de ' + titulo);
  }
  assert.ok(fs.existsSync(path.join(pasta, '..', 'trilha.js')), 'trilha.js comum');
});

test('instalável: manifesto, ícones do tamanho certo e o botão Instalar do Bolinho de Chuva', () => {
  const m = JSON.parse(ler('manifest.webmanifest'));
  assert.equal(m.start_url, './'); assert.equal(m.scope, './'); assert.equal(m.display, 'standalone');
  for (const ic of m.icons) {
    const png = fs.readFileSync(path.join(pasta, ic.src));
    assert.equal(png.toString('ascii', 1, 4), 'PNG');
    const largura = png.readUInt32BE(16), altura = png.readUInt32BE(20);
    assert.equal(largura + 'x' + altura, ic.sizes, ic.src);
  }
  const js = ler('app.js');
  assert.match(js, /s\.src = '\.\.\/instalar\.js'/);
  assert.match(js, /serviceWorker\.register\('sw\.js'\)/);
});

test('nenhum segredo nem dado pessoal nos arquivos', () => {
  for (const f of fs.readdirSync(pasta).filter(f => /\.(js|html|json|md)$/.test(f))) {
    const t = ler(f);
    assert.ok(!/service_role|sb_secret_|sk-[A-Za-z0-9]{20}|AIza[0-9A-Za-z_-]{30}|ghp_[A-Za-z0-9]{20}/.test(t), f + ' parece ter segredo');
    assert.ok(!/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/.test(t), f + ' parece ter CPF');
  }
});

test('documentos do app existem', () => {
  for (const f of ['LEIA-ME.md', 'PENDENCIAS.md', 'CREDITOS.md', 'fontes/OFL.txt', 'icone.svg']) assert.ok(fs.existsSync(path.join(pasta, f)), 'falta ' + f);
});
