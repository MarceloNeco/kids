// Testes de arquivos do FRUTA PODRE: node --test fruta-podre/teste/*.test.js (rodar da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const pasta = path.resolve(__dirname, '..');
const ler = f => fs.readFileSync(path.join(pasta, f), 'utf8');

test('versão 0.1.0 igual nos três lugares (app.js, sw.js, versoes.json)', () => {
  const a = ler('app.js').match(/APP_VERSION = '([\d.]+)'/)[1];
  const s = ler('sw.js').match(/VERSAO = '([\d.]+)'/)[1];
  const v = JSON.parse(ler('versoes.json')).versoes[0];
  assert.equal(a, '0.1.0'); assert.equal(a, s); assert.equal(v.versao, a);
  assert.equal(v.data, '19/Nov/2026');
  assert.match(ler('app.js'), /APP_DATA = '19\/Nov\/2026'/);
  for (const k of ['data', 'hora', 'pt', 'en', 'es']) assert.ok(v[k], 'versoes.json sem ' + k);
  assert.equal(v.pt.length, v.en.length, 'PT e EN com o mesmo número de itens');
  assert.equal(v.pt.length, v.es.length, 'PT e ES com o mesmo número de itens');
});

test('sw.js guarda todos os arquivos publicados (todos existem), cache com o nome da pasta', () => {
  const sw = ler('sw.js');
  assert.match(sw, /importScripts\('\.\.\/sw-comum\.js'\);/);
  assert.match(sw, /BolinhoSW\(\{ prefixo: 'fruta-podre-', versao: VERSAO, arquivos: ARQUIVOS, pular: /);
  const lista = JSON.parse(sw.match(/var ARQUIVOS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  for (const a of lista) if (a !== './') assert.ok(fs.existsSync(path.join(pasta, a)) && fs.statSync(path.join(pasta, a)).isFile(), 'falta no disco: ' + a);
  const publicados = fs.readdirSync(pasta).filter(f => /\.(js|css|html|json|png|svg|webmanifest)$/.test(f) && f !== 'sw.js');
  for (const f of publicados) assert.ok(lista.includes(f), 'sw.js não guarda: ' + f);
  assert.ok(lista.includes('libs/matter.min.js'), 'sw.js não guarda a física (libs/matter.min.js)');
  for (const f of ['../carregando.js', '../trilha.js', '../recursos.js', '../idioma.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../rabiscolandia/fontes/fredoka.woff2'])
    assert.ok(lista.includes(f), 'sw.js não guarda ' + f);
  assert.ok(!lista.some(f => /\.mp3$/.test(f)), 'música não entra no ARQUIVOS (a trilha comum cuida)');
});

test('index.html: CSP sem script inline, peças obrigatórias na ordem, interruptor e textos PT|EN|ES, sem botão de idioma', () => {
  const html = ler('index.html');
  assert.match(html, /Content-Security-Policy/);
  assert.ok(!/<script(?![^>]*src)[^>]*>/.test(html), 'script inline');
  for (const m of html.matchAll(/<script src="([^"]+)"/g)) assert.ok(fs.existsSync(path.join(pasta, m[1])), m[1]);
  assert.ok(html.includes('<link rel="manifest" href="manifest.webmanifest">\n<script src="../carregando.js" data-fora-do-arquivo></script>'), 'carregando.js logo depois do manifest');
  const ordem = ['libs/matter.min.js', '../recursos.js" data-app="kids"', '../idioma.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../trilha.js', 'app.js'];
  let ultimo = -1;
  for (const p of ordem) { const i = html.indexOf('<script src="' + p); assert.ok(i > ultimo, 'ordem dos scripts: ' + p); ultimo = i; }
  assert.match(html, /data-recurso="fruta-podre"/);
  assert.match(html, /<section id="desligado"/);
  assert.match(html, /id="btJogar"/); assert.match(html, /<canvas id="cena"/);
  for (const m of html.matchAll(/data-(?:t|rotulo)="([^"]*)"/g)) assert.equal(m[1].split('|').length, 3, 'texto sem as três línguas: ' + m[1]);
  assert.ok(!/id="btLingua"/.test(html), 'o idioma é escolhido só na estante: sem botão próprio');
  assert.ok(!/aria-label="[^"]* \/ [^"]*"/.test(html), 'aria-label com duas línguas juntas: use data-rotulo');
  assert.ok(!/https?:\/\/(?!www\.w3\.org)/.test(html.replace(/<meta name="description"[^>]*>/, '')), 'nada buscado na internet (sem CDN)');
});

test('app.js: navegação, interruptor, trilha, instalar e a fonte', () => {
  const js = ler('app.js');
  assert.match(js, /BolinhoNav\.iniciar\(\{ jogo: 'fruta-podre', noInicio: /);
  assert.match(js, /irParaInicio: /); assert.match(js, /emAndamento: /);
  assert.match(js, /SolverRecursos\.ligado\('fruta-podre', true\)/);
  assert.match(js, /if \(window\.Trilha && !TESTE\) Trilha\.iniciar\(\{ jogo: 'fruta-podre', musicas: MUSICAS, creditos: 'CREDITOS\.md' \}\);/);
  assert.match(js, /s\.src = '\.\.\/instalar\.js'/);
  assert.match(js, /function esperar\(n\)/, 'o laço só começa depois da tela "Carregando…"');
  assert.match(ler('estilo.css'), /\.\.\/rabiscolandia\/fontes\/fredoka\.woff2/);
  assert.match(ler('estilo.css'), /--nav-alto/); assert.match(ler('estilo.css'), /--nav-largo/);
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
  // nomes e dicas das frutas e pragas também nas três
  const R = require('../regras.js');
  for (const d of Object.values(R.FRUTAS)) for (const k of ['nome', 'dica']) for (const l of ['pt', 'en', 'es']) assert.ok(d[k][l], 'fruta sem ' + k + ' em ' + l);
  for (const d of Object.values(R.PRAGAS)) for (const l of ['pt', 'en', 'es']) assert.ok(d.nome[l], 'praga sem nome em ' + l);
  assert.deepEqual([R.FRUTAS.maca_podre.nome.pt, R.FRUTAS.trio_uva.nome.pt, R.FRUTAS.pimenta_jato.nome.pt, R.FRUTAS.melancia_passada.nome.pt, R.FRUTAS.abacaxi_azedo.nome.pt],
    ['Maçã Podre', 'Trio Uva-Passa', 'Pimenta Malagueta', 'Melancia Passada', 'Abacaxi Azêdo']);
});

test('manifest e ícones', () => {
  const m = JSON.parse(ler('manifest.webmanifest'));
  assert.equal(m.start_url, './'); assert.equal(m.scope, './');
  for (const i of m.icons) assert.ok(fs.existsSync(path.join(pasta, i.src)), i.src);
  for (const [f, n] of [['icone-192.png', 192], ['icone-512.png', 512]]) {
    const b = fs.readFileSync(path.join(pasta, f));
    assert.equal(b.readUInt32BE(16), n, f + ' largura'); assert.equal(b.readUInt32BE(20), n, f + ' altura');
  }
  assert.match(ler('icone.svg'), /^<svg /);
});

test('trilha: 12 músicas no formato da raiz, todas existem e têm crédito no CREDITOS.md', () => {
  const js = ler('app.js'), cred = ler('CREDITOS.md');
  const P = { B: '../baguncolandia/musicas/', RB: '../rabiscolandia/musicas/' };
  const musicas = [...js.matchAll(/\{ a: (?:(B|RB) \+ )?'([^']+\.mp3)', t: '([^']+)'/g)].map(m => [(m[1] ? P[m[1]] : '') + m[2], m[3]]);
  assert.equal(musicas.length, 12);
  assert.equal(musicas[0][1], 'Sneaky Snitch', 'a favorita (Sneaky Snitch) está na lista');
  for (const [a, t] of musicas) {
    assert.ok(fs.existsSync(path.join(pasta, a)), 'falta o arquivo ' + a);
    assert.ok(cred.includes(path.basename(a)) && cred.includes(t), 'sem crédito: ' + a);
  }
  assert.match(cred, /Matter\.js/); assert.match(cred, /MIT/);
  assert.ok(fs.existsSync(path.join(pasta, 'libs', 'LICENSE-matter.txt')), 'licença do Matter.js');
});

test('nenhum segredo nem dado pessoal no código', () => {
  for (const f of fs.readdirSync(pasta).filter(f => /\.(js|html|json|md)$/.test(f))) {
    const s = ler(f);
    assert.ok(!/service_role|sb_secret_|sk-[A-Za-z0-9]{20}|AIza[0-9A-Za-z_-]{30}|ghp_[A-Za-z0-9]{20}/.test(s), f + ' parece ter segredo');
  }
});

test('LEIA-ME e PENDENCIAS: mapa, o que entrou no MVP e o que falta da especificação', () => {
  const l = ler('LEIA-ME.md'), p = ler('PENDENCIAS.md');
  for (const f of ['regras.js', 'fases.js', 'mundo.js', 'arte.js', 'som.js', 'app.js']) assert.ok(l.includes(f), 'LEIA-ME sem ' + f);
  assert.match(l, /MVP/);
  for (const k of ['Mundo 2', 'Banana', 'Coco', 'Limão', 'Jaca', 'Corvo', 'entilador', 'ano', 'eleia', 'ower-up']) assert.ok(p.includes(k), 'PENDENCIAS sem ' + k);
});
