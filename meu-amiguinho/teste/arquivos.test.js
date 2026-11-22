// Arquivos do Meu Pequeno Amiguinho: node --test meu-amiguinho/teste/arquivos.test.js (rodar da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const pasta = path.resolve(__dirname, '..');
const ler = (f) => fs.readFileSync(path.join(pasta, f), 'utf8');
const JS = ['dados.js', 'arte.js', 'regras.js', 'voz.js', 'vivo.js', 'app.js'];

test('versão igual nos três lugares (app.js, sw.js, versoes.json), com PT/EN/ES', () => {
  const a = ler('app.js').match(/APP_VERSION = '([\d.]+)'/)[1];
  const s = ler('sw.js').match(/VERSAO = '([\d.]+)'/)[1];
  const v = JSON.parse(ler('versoes.json')).versoes[0];
  assert.equal(a, s); assert.equal(v.versao, a);
  assert.equal(ler('app.js').match(/APP_DATA = '([^']+)'/)[1], v.data);
  for (const k of ['data', 'hora', 'pt', 'en', 'es']) assert.ok(v[k], 'versoes.json sem ' + k);
  assert.equal(v.pt.length, v.en.length); assert.equal(v.pt.length, v.es.length);
});

test('sw.js pela peça comum; todo arquivo do ARQUIVOS existe; tudo o que é publicado está na lista', () => {
  const sw = ler('sw.js');
  assert.match(sw, /importScripts\('\.\.\/sw-comum\.js'\);/);
  assert.match(sw, /BolinhoSW\(\{ prefixo: 'meu-amiguinho-', versao: VERSAO, arquivos: ARQUIVOS, pular:/);
  const lista = JSON.parse(sw.match(/var ARQUIVOS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  for (const a of lista) if (a !== './') assert.ok(fs.existsSync(path.join(pasta, a)) && fs.statSync(path.join(pasta, a)).isFile(), 'falta no disco: ' + a);
  const publicados = fs.readdirSync(pasta).filter((f) => /\.(js|css|html|json|png|svg|webmanifest)$/.test(f) && f !== 'sw.js');
  for (const f of publicados) assert.ok(lista.includes(f), 'sw.js não guarda: ' + f);
  for (const f of ['../carregando.js', '../trilha.js', '../recursos.js', '../idioma.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../instalar.js', '../personagens.js', '../rabiscolandia/fontes/fredoka.woff2', 'vozes/lista.json'])
    assert.ok(lista.includes(f), 'sw.js não guarda ' + f);
});

test('index.html: CSP sem script inline, carregando logo depois do manifest, peças comuns na ordem, interruptor e PT|EN|ES', () => {
  const html = ler('index.html');
  assert.match(html, /Content-Security-Policy/);
  assert.ok(!/<script(?![^>]*src)[^>]*>/.test(html), 'script inline');
  assert.ok(html.includes('<link rel="manifest" href="manifest.webmanifest">\n<script src="../carregando.js" data-fora-do-arquivo></script>'));
  const ordem = ['dados.js', 'arte.js', 'regras.js', 'voz.js', 'vivo.js', '../recursos.js" data-app="kids"', '../idioma.js', '../personagens.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../trilha.js', 'app.js'];
  let pos = -1;
  for (const p of ordem) { const i = html.indexOf('<script src="' + p); assert.ok(i > pos, 'fora de ordem: ' + p); pos = i; }
  assert.match(html, /data-recurso="meu-amiguinho"/);
  assert.match(html, /<section id="desligado"/);
  for (const id of ['btCriar', 'btPronto', 'btProximo', 'btVoltar', 'btColecao', 'btCoracao', 'btCertidao', 'btSalvarPng']) assert.match(html, new RegExp('id="' + id + '"'));
  for (const m of html.matchAll(/data-(?:t|rotulo)="([^"]*)"/g)) assert.equal(m[1].split('|').length, 3, 'texto sem as três línguas: ' + m[1]);
  assert.ok(!/id="btLingua"/.test(html), 'sem botão de idioma próprio');
  assert.match(ler('estilo.css'), /\.\.\/rabiscolandia\/fontes\/fredoka\.woff2/);
});

test('app.js: interruptor, navegação, trilha, personagens, ?instalar=1; ids existem', () => {
  const js = ler('app.js'), html = ler('index.html');
  assert.match(js, /SolverRecursos\.ligado\('meu-amiguinho', true\)/);
  assert.match(js, /BolinhoNav\.iniciar\(\{ jogo: 'meu-amiguinho', noInicio: .*irParaInicio: /);
  assert.match(js, /if \(window\.Trilha && !TESTE\) Trilha\.iniciar\(\{ jogo: 'meu-amiguinho', musicas: MUSICAS, creditos: 'CREDITOS\.md' \}\);/);
  assert.match(js, /BolinhoPersonagens/); assert.match(js, /'amiguinho:' \+ a\.id/);
  assert.match(js, /s\.src = '\.\.\/instalar\.js'/);
  for (const m of js.matchAll(/\$\('([A-Za-z0-9]+)'\)/g)) assert.ok(html.includes('id="' + m[1] + '"') || js.includes('id="' + m[1] + '"') || js.includes("campo('" + m[1] + "'"), 'falta id ' + m[1]);
});

test('JavaScript simples (var/function) para o tablet velho; textos t(pt, en, es) sempre nas três línguas', () => {
  for (const f of JS) assert.ok(!/=>|\blet\b|\bconst\b|`/.test(ler(f)), f + ': use var/function');
  const s = "(?:'(?:[^'\\\\]|\\\\.)*'|\"(?:[^\"\\\\]|\\\\.)*\")";
  const t1 = new RegExp('\\bt\\(' + s + '\\s*\\)', 'g'), t2 = new RegExp('\\bt\\(' + s + '\\s*,\\s*' + s + '\\s*\\)', 'g');
  for (const m of ler('app.js').matchAll(t1)) assert.fail('t() só com uma língua: ' + m[0]);
  for (const m of ler('app.js').matchAll(t2)) assert.fail('t() sem o espanhol: ' + m[0]);
});

test('manifest e ícones (192, 512 e o SVG)', () => {
  const m = JSON.parse(ler('manifest.webmanifest'));
  assert.equal(m.start_url, './'); assert.equal(m.scope, './');
  for (const i of m.icons) assert.ok(fs.existsSync(path.join(pasta, i.src)), i.src);
  for (const [f, n] of [['icone-192.png', 192], ['icone-512.png', 512]]) { const b = fs.readFileSync(path.join(pasta, f)); assert.equal(b.readUInt32BE(16), n, f); assert.equal(b.readUInt32BE(20), n, f); }
  assert.match(ler('icone.svg'), /^<svg[^>]+viewBox="0 0 512 512"/);
});

test('trilha: pelo menos 10 músicas gravadas que existem, com licença na pasta de origem e crédito no CREDITOS.md', () => {
  const js = ler('app.js'), cred = ler('CREDITOS.md');
  const P = { B: '../baguncolandia/musicas/', RB: '../rabiscolandia/musicas/' };
  const ms = [...js.matchAll(/\{ a: (B|RB) \+ '([a-z0-9-]+\.mp3)', t: '([^']+)', au: ([^,]+), lic: ([^}]+) \}/g)];
  assert.ok(ms.length >= 10, 'só ' + ms.length);
  const origem = { B: fs.readFileSync(path.join(pasta, '../baguncolandia/CREDITOS.md'), 'utf8'), RB: fs.readFileSync(path.join(pasta, '../rabiscolandia/musicas/LICENCAS.md'), 'utf8') };
  for (const [, pre, arq, tit] of ms) {
    assert.ok(fs.existsSync(path.join(pasta, P[pre], arq)), 'falta ' + arq);
    assert.ok(origem[pre].includes(arq) || origem[pre].includes(tit), arq + ' sem licença na origem');
    assert.ok(cred.includes(arq) && cred.includes(tit), 'sem crédito: ' + arq);
  }
});

test('privacidade: nenhum segredo, nenhum envio da voz, nenhuma foto no repositório', () => {
  for (const f of fs.readdirSync(pasta).filter((f) => /\.(js|html|json|md)$/.test(f))) {
    const s = ler(f);
    assert.ok(!/service_role|sb_secret_|sk-[A-Za-z0-9]{20}|AIza[0-9A-Za-z_-]{30}|ghp_[A-Za-z0-9]{20}/.test(s), f + ' parece ter segredo');
  }
  const voz = ler('voz.js'), app = ler('app.js');
  assert.ok(!/fetch\([^)]*(POST|method)|XMLHttpRequest|sendBeacon|WebSocket/.test(voz + app), 'nada é enviado');
  assert.match(voz, /indexedDB\.open\(BANCO/);
  const proibidas = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? proibidas(path.join(d, e.name)) : /\.(jpe?g|mp4|mov|heic|webp)$/i.test(e.name) ? [e.name] : []);
  assert.deepEqual(proibidas(pasta), []);
  assert.deepEqual(JSON.parse(ler('vozes/lista.json')).arquivos, []);
});
