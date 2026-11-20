// Testes de arquivos do TIJOLAÇO: node --test tijolaco/teste/arquivos.test.js (rodar da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const pasta = path.resolve(__dirname, '..');
const ler = f => fs.readFileSync(path.join(pasta, f), 'utf8');

test('versão igual nos três lugares (app.js, sw.js, versoes.json)', () => {
  const a = ler('app.js').match(/APP_VERSION = '([\d.]+)'/)[1];
  const s = ler('sw.js').match(/VERSAO = '([\d.]+)'/)[1];
  const v = JSON.parse(ler('versoes.json')).versoes[0];
  assert.equal(a, s); assert.equal(v.versao, a);
  assert.equal(ler('app.js').match(/APP_DATA = '([^']+)'/)[1], v.data);
  for (const k of ['data', 'hora', 'pt', 'en', 'es']) assert.ok(v[k], 'versoes.json sem ' + k);
  assert.equal(v.pt.length, v.en.length); assert.equal(v.pt.length, v.es.length);
});

test('sw.js pela peça comum, e TODO arquivo do ARQUIVOS existe; tudo o que é publicado está na lista', () => {
  const sw = ler('sw.js');
  assert.match(sw, /importScripts\('\.\.\/sw-comum\.js'\);/);
  assert.match(sw, /BolinhoSW\(\{ prefixo: 'tijolaco-', versao: VERSAO, arquivos: ARQUIVOS, pular:/);
  const lista = JSON.parse(sw.match(/var ARQUIVOS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  for (const a of lista) if (a !== './') assert.ok(fs.existsSync(path.join(pasta, a)) && fs.statSync(path.join(pasta, a)).isFile(), 'falta no disco: ' + a);
  const publicados = fs.readdirSync(pasta).filter(f => /\.(js|css|html|json|png|svg|webmanifest)$/.test(f) && f !== 'sw.js');
  for (const f of publicados) assert.ok(lista.includes(f), 'sw.js não guarda: ' + f);
  for (const f of ['../carregando.js', '../trilha.js', '../recursos.js', '../idioma.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../instalar.js', '../rabiscolandia/fontes/fredoka.woff2'])
    assert.ok(lista.includes(f), 'sw.js não guarda ' + f);
});

test('index.html: CSP sem script inline, carregando logo depois do manifest, peças comuns na ordem, interruptor e PT|EN|ES', () => {
  const html = ler('index.html');
  assert.match(html, /Content-Security-Policy/);
  assert.ok(!/<script(?![^>]*src)[^>]*>/.test(html), 'script inline');
  assert.ok(html.includes('<link rel="manifest" href="manifest.webmanifest">\n<script src="../carregando.js" data-fora-do-arquivo></script>'));
  for (const m of html.matchAll(/<script src="([^"]+)"/g)) assert.ok(fs.existsSync(path.join(pasta, m[1])), m[1]);
  const ordem = ['../recursos.js" data-app="kids"', '../idioma.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../trilha.js', 'app.js'];
  let pos = -1;
  for (const p of ordem) { const i = html.indexOf('<script src="' + p); assert.ok(i > pos, 'fora de ordem: ' + p); pos = i; }
  assert.match(html, /data-recurso="tijolaco"/);
  assert.match(html, /<section id="desligado"/);
  assert.match(html, /id="btJogar"/); assert.match(html, /<canvas id="cena"/);
  for (const m of html.matchAll(/data-(?:t|rotulo)="([^"]*)"/g)) assert.equal(m[1].split('|').length, 3, 'texto sem as três línguas: ' + m[1]);
  assert.ok(!/id="btLingua"/.test(html), 'sem botão de idioma próprio');
  assert.match(html, /\.\.\/rabiscolandia\/fontes\/fredoka\.woff2|estilo\.css/);
  assert.match(ler('estilo.css'), /\.\.\/rabiscolandia\/fontes\/fredoka\.woff2/);
});

test('app.js: interruptor, navegação, trilha, esperar o "Carregando…" e o ?instalar=1', () => {
  const js = ler('app.js');
  assert.match(js, /SolverRecursos\.ligado\('tijolaco', true\)/);
  assert.match(js, /BolinhoNav\.iniciar\(\{ jogo: 'tijolaco', noInicio: .*irParaInicio: /);
  assert.match(js, /emAndamento: function/);
  assert.match(js, /var VR = '\.\.\/vruuum\/musicas\/', P = '\.\.\/purpurina\/musicas\/', KM = 'Kevin MacLeod', CC = 'CC BY 4\.0';/);
  assert.match(js, /if \(window\.Trilha && !TESTE\) Trilha\.iniciar\(\{ jogo: 'tijolaco', musicas: MUSICAS, creditos: 'CREDITOS\.md' \}\);/);
  assert.match(js, /bc-carregando/);
  assert.match(js, /s\.src = '\.\.\/instalar\.js'/);
  assert.ok(!/=>|\blet\b|\bconst\b|`/.test(js + ler('regras.js') + ler('arte.js') + ler('som.js') + ler('fases.js')), 'JavaScript simples (var/function), para o tablet velho');
});

test('ids usados no app.js existem no index.html', () => {
  const html = ler('index.html');
  for (const m of ler('app.js').matchAll(/\$\('([A-Za-z0-9]+)'\)/g)) assert.ok(html.includes('id="' + m[1] + '"'), 'falta id ' + m[1]);
});

test('textos t(pt, en, es) sempre nas três línguas', () => {
  const s = "(?:'(?:[^'\\\\]|\\\\.)*'|\"(?:[^\"\\\\]|\\\\.)*\")";
  const t1 = new RegExp('\\bt\\(' + s + '\\s*\\)', 'g'), t2 = new RegExp('\\bt\\(' + s + '\\s*,\\s*' + s + '\\s*\\)', 'g');
  for (const m of ler('app.js').matchAll(t1)) assert.fail('t() só com uma língua: ' + m[0]);
  for (const m of ler('app.js').matchAll(t2)) assert.fail('t() sem o espanhol: ' + m[0]);
});

test('manifest e ícones (192, 512 e o SVG)', () => {
  const m = JSON.parse(ler('manifest.webmanifest'));
  assert.equal(m.start_url, './'); assert.equal(m.scope, './');
  for (const i of m.icons) assert.ok(fs.existsSync(path.join(pasta, i.src)), i.src);
  for (const [f, n] of [['icone-192.png', 192], ['icone-512.png', 512]]) {
    const b = fs.readFileSync(path.join(pasta, f));
    assert.equal(b.readUInt32BE(16), n, f + ' largura'); assert.equal(b.readUInt32BE(20), n, f + ' altura');
  }
  assert.match(ler('icone.svg'), /^<svg[^>]+viewBox="0 0 512 512"/);
});

test('trilha: 12 músicas gravadas que existem, com autor e licença conferidos e crédito no CREDITOS.md', () => {
  const js = ler('app.js'), cred = ler('CREDITOS.md');
  const P = { VR: '../vruuum/musicas/', P: '../purpurina/musicas/' };
  const musicas = [...js.matchAll(/\{ a: (VR|P) \+ '([a-z0-9-]+\.mp3)', t: '([^']+)', au: ([^,]+), lic: ([^}]+) \}/g)];
  assert.equal(musicas.length, 12);
  const lic = { VR: fs.readFileSync(path.join(pasta, '../vruuum/musicas/LICENCAS.md'), 'utf8'), P: fs.readFileSync(path.join(pasta, '../purpurina/musicas/LICENCAS.md'), 'utf8') };
  for (const [, pre, arq, tit] of musicas) {
    assert.ok(fs.existsSync(path.join(pasta, P[pre], arq)), 'falta o arquivo ' + arq);
    assert.ok(lic[pre].includes(arq), arq + ' sem licença na pasta de origem');
    assert.ok(cred.includes(arq) && cred.includes(tit), 'sem crédito: ' + arq);
  }
});

test('nenhum segredo nem dado pessoal no código', () => {
  for (const f of fs.readdirSync(pasta).filter(f => /\.(js|html|json|md)$/.test(f))) {
    const s = ler(f);
    assert.ok(!/service_role|sb_secret_|sk-[A-Za-z0-9]{20}|AIza[0-9A-Za-z_-]{30}|ghp_[A-Za-z0-9]{20}/.test(s), f + ' parece ter segredo');
  }
});

test('nada de propriedade intelectual do jogo de referência', () => {
  for (const f of fs.readdirSync(pasta).filter(f => /\.(js|html|json|css)$/.test(f))) {
    const s = ler(f).toLowerCase();
    for (const p of ['zuma', 'sapo', 'frog', 'templo', 'temple', 'crânio', 'caveira', 'skull']) assert.ok(!s.includes(p), f + ' fala de ' + p);
  }
});
