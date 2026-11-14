// Regra da música (dono, 06/Nov/2026), em todos os jogos do Bolinho:
// - com internet: todas as músicas GRAVADAS, em ordem sorteada; a favorita (a de sem internet) nunca é a primeira e
//   fica sempre no fim da volta; música feita no código ("Atari") nunca toca com internet;
// - sem internet: só a favorita guardada no aparelho; sem ela, a feita no código (ou silêncio).
// Rodar da raiz do repositório: node --test teste/*.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');
const raiz = path.join(__dirname, '..');
const ler = (f) => fs.readFileSync(path.join(raiz, f), 'utf8');

// Math.random previsível (cada semente dá outro sorteio)
const sorteio = (semente) => { let s = (semente * 48271 + 12345) % 2147483647; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

// ---------- Trilha.embaralhar ----------
function trilhaNova(href) {
  globalThis.location = { href };
  delete require.cache[require.resolve('../trilha.js')];
  return require('../trilha.js');   // location fica valendo: é contra ela que os endereços relativos são lidos
}

test('Trilha.embaralhar: favorita nunca primeiro e sempre por último, em centenas de sorteios', () => {
  const T = trilhaNova('http://x/kids/campo-minado/');
  const nomes = ['scheming-weasel', 'music-to-delight', 'batty-mcfaddin', 'life-of-riley', 'carpe-diem', 'mariachi-snooze',
    'sneaky-snitch', 'airport-lounge', 'street-party', 'sunflower-dance-party', 'beachfront-celebration'];
  const lista = nomes.map(n => ({ a: '../rabiscolandia/musicas/' + n + '.mp3', t: n }));
  const fav = T.offline.FAVORITAS['campo-minado'];
  assert.ok(fav.endsWith('/kids/rabiscolandia/musicas/scheming-weasel.mp3'), fav);
  const original = Math.random, primeiras = new Set();
  try {
    for (let s = 1; s <= 400; s++) {
      Math.random = sorteio(s);
      const o = T.embaralhar(lista, 'campo-minado');
      assert.deepStrictEqual(o.map(m => m.t).sort(), nomes.slice().sort(), 'todas as músicas, sem repetir');
      assert.strictEqual(o[o.length - 1].t, 'scheming-weasel', 'favorita por último (semente ' + s + ')');
      assert.notStrictEqual(o[0].t, 'scheming-weasel', 'favorita nunca primeiro');
      primeiras.add(o[0].t);
    }
    // Math.random nos extremos
    for (const r of [() => 0, () => 0.999999]) { Math.random = r; const o = T.embaralhar(lista, 'campo-minado'); assert.strictEqual(o[o.length - 1].t, 'scheming-weasel'); }
  } finally { Math.random = original; }
  assert.ok(primeiras.size >= 8, 'começa por músicas diferentes: ' + [...primeiras].join(', '));
  assert.deepStrictEqual(lista.map(m => m.t), nomes, 'não mexe na lista original');
  // endereço montado de outro jeito (como nos jogos antigos)
  const it = nomes.map(n => ({ url: '../rabiscolandia/musicas/' + n + '.mp3' }));
  Math.random = sorteio(7);
  try { assert.ok(T.embaralhar(it, 'campo-minado', m => m.url).pop().url.includes('scheming-weasel')); } finally { Math.random = original; }
});

test('Trilha.embaralhar: lista sem a favorita só é sorteada (nada muda de lugar à força)', () => {
  const T = trilhaNova('http://x/kids/campo-minado/');
  const lista = ['a', 'b', 'c', 'd'].map(n => ({ a: '../rabiscolandia/musicas/' + n + '.mp3', t: n }));
  const original = Math.random, ultimas = new Set();
  try { for (let s = 1; s <= 60; s++) { Math.random = sorteio(s); const o = T.embaralhar(lista, 'campo-minado'); assert.strictEqual(o.length, 4); ultimas.add(o[3].t); } }
  finally { Math.random = original; }
  assert.ok(ultimas.size >= 3, 'a última muda conforme o sorteio');
  assert.strictEqual(T.embaralhar(lista, 'jogo-sem-favorita').length, 4);
});

test('o tocador comum e a rádio usam a ordem sorteada com a favorita no fim', () => {
  const t = ler('trilha.js');
  assert.match(t, /var lista = T\.embaralhar\(op\.musicas, op\.jogo\)/);
  assert.match(t, /var atual = 0,/);
  assert.match(ler('radio.js'), /Trilha\.embaralhar\(MUSICAS, 'estante'/);
});

// ---------- playlists: ≥ 10 arquivos que existem; nada de som de videogame nem arquivo mudo ----------
// Medidos em 06/Nov/2026: som de videogame / 8 bits (ondas quadradas, notas secas), synth retrô (Spazzmatica) ou artista de
// chiptune (DarkNES). (Seis arquivos da Rabiscolândia que estavam mudos foram refeitos dos originais no mesmo dia.)
const FORA = ['spazzmatica-polka',
  'bit-bit-loop', 'comic-game-loop-mischief', 'pixel-peeker-polka', 'pookatori-and-friends', 'laserpack', 'retrofuture-nasty'];
const LISTAS = {
  estante: () => [...ler('radio.js').matchAll(/a: '([a-z0-9-]+)'/g)].map(m => 'musicas/' + m[1] + '.mp3'),
  baguncolandia: () => { const s = ler('baguncolandia/som.js'); return [...s.slice(s.indexOf('var TRILHA'), s.indexOf('sorteou = false')).matchAll(/'([a-z0-9-]+)'/g)].map(m => 'baguncolandia/musicas/' + m[1] + '.mp3'); },
  peluqueria: () => JSON.parse(ler('peluqueria/musicas/musicas.json')).map(m => 'peluqueria/musicas/' + m.arquivo),
  vruuum: () => [...ler('vruuum/som.js').matchAll(/url: '(musicas\/[^']+\.mp3)'/g)].map(m => 'vruuum/' + m[1]),
  purpurina: () => [...ler('purpurina/som.js').matchAll(/url: '(musicas\/[^']+\.mp3)'/g)].map(m => 'purpurina/' + m[1]),
  rabiscolandia: () => [...ler('rabiscolandia/som.js').matchAll(/gr\('([a-z0-9-]+)'/g)].map(m => 'rabiscolandia/musicas/' + m[1] + '.mp3'),
  'campo-minado': () => [...ler('campo-minado/app.js').matchAll(/M \+ '([a-z0-9-]+\.mp3)'/g)].map(m => 'rabiscolandia/musicas/' + m[1]),
  'batalha-naval': () => { const s = ler('batalha-naval/app.js'); return [...s.slice(s.indexOf('var MUSICAS'), s.indexOf('].map(function (m)')).matchAll(/\['([a-z0-9-]+)'/g)].map(m => 'vruuum/musicas/' + m[1] + '.mp3'); },
  labirinto: () => [...ler('labirinto/app.js').matchAll(/a: '\.\.\/([^']+\.mp3)'/g)].map(m => m[1]),
  cozinha: () => [...ler('cozinha/app.js').matchAll(/a: ([MB]) \+ '([a-z0-9-]+\.mp3)'/g)].map(m => (m[1] === 'M' ? 'rabiscolandia' : 'baguncolandia') + '/musicas/' + m[2]),
  aqua: () => [...ler('aqua/app.js').matchAll(/a: M_ \+ '([a-z0-9-]+\.mp3)'/g)].map(m => 'purpurina/musicas/' + m[1]),
  enigmas: () => [...ler('enigmas/app.js').matchAll(/a: M \+ '([a-z0-9-]+\.mp3)'/g)].map(m => 'baguncolandia/musicas/' + m[1])
};

test('playlists: pelo menos 10 arquivos que existem, sem repetir, nenhum mudo ou com som de videogame; favorita entre elas e até 2,5 MB', () => {
  const FAV = trilhaNova('http://x/kids/').offline.FAVORITAS;
  for (const [id, f] of Object.entries(LISTAS)) {
    const l = f();
    assert.ok(l.length >= 10, id + ': só ' + l.length + ' músicas');
    assert.strictEqual(new Set(l).size, l.length, id + ': música repetida');
    for (const a of l) {
      assert.ok(fs.existsSync(path.join(raiz, a)), id + ': falta ' + a);
      assert.ok(!FORA.includes(path.basename(a, '.mp3')), id + ': ' + a + ' não pode tocar');
    }
    const fav = FAV[id].replace(/^.*?\/kids\//, '');
    assert.ok(l.includes(fav), id + ': a favorita ' + fav + ' não está na lista');
    assert.ok(fs.statSync(path.join(raiz, fav)).size <= 2.5 * 1048576, id + ': favorita maior que 2,5 MB');
  }
  for (const [id, u] of Object.entries(FAV)) assert.ok(!FORA.includes(path.basename(u, '.mp3')), 'favorita de ' + id + ' é ' + u);
});

// ---------- os tocadores dos jogos antigos, no Node, com navegador de mentira ----------
// Qualquer nó do WebAudio: aceita tudo e não faz nada
const nada = new Proxy(function () {}, { get: (t, k) => (k === 'then' ? undefined : k === Symbol.toPrimitive ? () => 0 : nada), apply: () => nada, set: () => true });
class FalsoAC {
  constructor() { this.currentTime = 0; this.sampleRate = 44100; this.state = 'running'; this.destination = nada; return new Proxy(this, { get: (t, k) => (k in t ? t[k] : () => nada) }); }
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
  createBuffer(c, n) { const d = new Float32Array(n); return { getChannelData: () => d }; }
}
function mundo(jogo, { online = true, favGuardada = false, semente = 1, extra = {} } = {}) {
  const reg = { srcs: [], intervalos: 0 };
  class FalsoAudio {
    constructor() { this._src = ''; this.paused = true; this.currentTime = 0; this.error = null; this.attrs = {}; this.ev = {}; this.loop = false; this.volume = 1; this.muted = false; }
    get src() { return this._src; }
    set src(v) { this._src = String(v); reg.srcs.push(this._src); }
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
    load() {}
    addEventListener(k, fn) { (this.ev[k] = this.ev[k] || []).push(fn); }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
    removeAttribute(k) { if (k === 'src') this._src = ''; delete this.attrs[k]; }
  }
  const sb = {
    console, URL, Promise, Float32Array, JSON,
    location: { href: 'http://x/kids/' + jogo + '/', search: '' },
    navigator: { onLine: online },
    document: { addEventListener() {}, removeEventListener() {}, hidden: false },
    Audio: FalsoAudio, AudioContext: FalsoAC,
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => ++reg.intervalos, clearInterval() {},
    fetch: (u) => Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(ler(jogo + '/' + u))) }),
    ...extra
  };
  sb.self = sb; sb.window = sb;
  vm.createContext(sb);
  vm.runInContext('Math.random = (' + sorteio.toString() + ')(' + semente + ');', sb);
  vm.runInContext(ler('trilha.js'), sb, { filename: 'trilha.js' });
  // o cache "bolinho-musicas" de mentira: a favorita está lá (ou não)
  sb.Trilha.offline.tocar = (audio, url) => {
    if (!favGuardada) return Promise.resolve(false);
    audio.src = 'blob:' + url; return Promise.resolve(true);
  };
  sb.Trilha.offline.guardar = () => Promise.resolve(0);
  vm.runInContext(ler(jogo + '/som.js'), sb, { filename: jogo + '/som.js' });
  reg.fav = sb.Trilha.offline.FAVORITAS[jogo];
  reg.ultimo = () => new URL(reg.srcs[reg.srcs.length - 1], sb.location.href).href;
  return { sb, reg };
}
const espera = () => new Promise(r => setImmediate(r));
const SEMENTES = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

// confere a volta inteira: n músicas diferentes, a primeira não é a favorita, a última é
function confereVolta(nome, urls, fav, n) {
  assert.strictEqual(urls.length, n, nome + ': ' + urls.length + ' de ' + n);
  assert.strictEqual(new Set(urls).size, n, nome + ': música repetida na volta');
  assert.notStrictEqual(urls[0], fav, nome + ': começou pela favorita');
  assert.strictEqual(urls[n - 1], fav, nome + ': a favorita não ficou por último');
}

test('Vruuum!: com internet só gravadas (nenhuma do rock.js), favorita por último; sem internet a favorita; sem ela, a do rock.js', async () => {
  for (const semente of SEMENTES) {
    const rock = []; const extra = { VruuumRock: { MUSICAS: [{ nome: 'R1' }, { nome: 'R2' }, { nome: 'R3' }], preparar() {}, ligar() {}, desligar() {}, comecar: (k) => rock.push(k) } };
    const { sb, reg } = mundo('vruuum', { semente, extra });
    const S = sb.VruuumSom, n = S.GRAVADAS.length, urls = [];
    S.iniciar(); S.musica(true); urls.push(reg.ultimo());
    for (let i = 1; i < n; i++) { S.proxima(); urls.push(reg.ultimo()); }
    confereVolta('vruuum', urls, reg.fav, n);
    S.proxima(); assert.notStrictEqual(reg.ultimo(), reg.fav, 'a volta seguinte começa por outra');
    assert.deepStrictEqual(rock, [], 'com internet não toca a do rock.js');
  }
  { const { sb, reg } = mundo('vruuum', { online: false, favGuardada: true, extra: { VruuumRock: { MUSICAS: [{ nome: 'R1' }], preparar() {}, ligar() {}, desligar() {}, comecar() { throw new Error('não'); } } } });
    sb.VruuumSom.iniciar(); sb.VruuumSom.musica(true); await espera();
    assert.deepStrictEqual(reg.srcs, ['blob:' + reg.fav], 'sem internet: só a favorita guardada'); }
  { const rock = []; const { sb, reg } = mundo('vruuum', { online: false, extra: { VruuumRock: { MUSICAS: [{ nome: 'R1' }], preparar() {}, ligar() {}, desligar() {}, comecar: (k) => rock.push(k) } } });
    sb.VruuumSom.iniciar(); sb.VruuumSom.musica(true); await espera();
    assert.deepStrictEqual(reg.srcs, [], 'sem internet nenhuma gravada do cache do jogo'); assert.deepStrictEqual(rock, [0], 'sem a favorita: a do rock.js'); }
});

test('Purpurina: com internet só gravadas (nenhuma feita pelo jogo), favorita por último; sem internet a favorita; sem ela, a do jogo', async () => {
  for (const semente of SEMENTES) {
    const { sb, reg } = mundo('purpurina', { semente });
    const S = sb.PurpurinaSom, n = S.GRAVADAS.length, urls = [];
    S.iniciar(); S.musica(true); urls.push(reg.ultimo());
    for (let i = 1; i < n; i++) { S.proxima(); urls.push(reg.ultimo()); }
    confereVolta('purpurina', urls, reg.fav, n);
    assert.strictEqual(reg.intervalos, 0, 'com internet nenhuma música feita pelo jogo');
  }
  { const { sb, reg } = mundo('purpurina', { online: false, favGuardada: true });
    sb.PurpurinaSom.iniciar(); sb.PurpurinaSom.musica(true); await espera();
    assert.deepStrictEqual(reg.srcs, ['blob:' + reg.fav]); assert.strictEqual(reg.intervalos, 0); }
  { const { sb, reg } = mundo('purpurina', { online: false });
    let nome = ''; sb.PurpurinaSom.aoTrocarMusica(n => { nome = n; });
    sb.PurpurinaSom.iniciar(); sb.PurpurinaSom.musica(true); await espera();
    assert.deepStrictEqual(reg.srcs, []); assert.strictEqual(reg.intervalos, 1, 'sem a favorita: a feita pelo jogo');
    assert.ok(sb.PurpurinaSom.MUSICAS.some(m => m.nome === nome), 'mostra o nome da música do jogo: ' + nome); }
});

test('Rabiscolândia: com internet não começa (nem intercala) as músicas do app; favorita por último; sem internet a favorita; sem ela, as do app', async () => {
  for (const semente of SEMENTES) {
    const { sb, reg } = mundo('rabiscolandia', { semente });
    const S = sb.DesenhoSom, n = S.GRAVADAS.length, urls = [];
    S.iniciar(); S.musica(true);
    assert.ok(S.estado().gravadaAgora && !S.estado().appAgora, 'começa por uma gravada');
    urls.push(reg.ultimo());
    for (let i = 1; i < n; i++) { S.proxima(); assert.ok(!S.estado().appAgora, 'nenhuma do app no meio'); urls.push(reg.ultimo()); }
    confereVolta('rabiscolandia', urls, reg.fav, n);
    assert.ok(S.listar().every(m => m.gravada), 'a lista só tem gravadas');
  }
  { const { sb, reg } = mundo('rabiscolandia', { online: false, favGuardada: true });
    const S = sb.DesenhoSom; S.iniciar(); S.musica(true); await espera();
    assert.deepStrictEqual(reg.srcs, ['blob:' + reg.fav]); assert.ok(!S.estado().appAgora);
    assert.match(S.nomeAtual(), /Street Party/); }
  { const { sb, reg } = mundo('rabiscolandia', { online: false });
    const S = sb.DesenhoSom; S.iniciar(); S.musica(true); await espera();
    assert.deepStrictEqual(reg.srcs, []); assert.ok(S.estado().appAgora, 'sem a favorita: as do app');
    assert.ok(S.MUSICAS.some(m => m.nome === S.nomeAtual()), S.nomeAtual()); }
});

test('Bagunçolândia: com internet o lobby e as rodadas tocam gravadas sorteadas, favorita na última rodada; sem internet a favorita; sem ela, a sintetizada', async () => {
  for (const semente of SEMENTES) {
    const { sb, reg } = mundo('baguncolandia', { semente });
    const S = sb.Som, n = S.FAIXAS, urls = [];
    S.iniciar(); S.musica(true, 0); urls.push(reg.ultimo());
    assert.ok(S.tocandoArquivo(), 'lobby: gravada');
    for (let f = 1; f < n; f++) { S.musica(true, f); assert.ok(S.tocandoArquivo(), 'rodada ' + f + ': gravada'); urls.push(reg.ultimo()); }   // como o app.js: 1, 2, … n-1
    confereVolta('baguncolandia', urls, reg.fav, n);
  }
  { const { sb, reg } = mundo('baguncolandia', { online: false, favGuardada: true });
    sb.Som.iniciar(); sb.Som.musica(true, 0); await espera();
    assert.ok(reg.srcs.includes('blob:' + reg.fav) && reg.srcs.every(s => s.startsWith('blob:')), reg.srcs.join()); assert.ok(sb.Som.tocandoArquivo()); }
  { const { sb } = mundo('baguncolandia', { online: false });
    sb.Som.iniciar(); sb.Som.musica(true, 0); await espera();
    assert.ok(sb.Som.tocando() && !sb.Som.tocandoArquivo(), 'sem a favorita: a sintetizada'); }
});

test('Peluqueria: rodadas sorteadas com a favorita na última; sem internet só a favorita (nem a abertura guardada)', async () => {
  for (const semente of SEMENTES) {
    const { sb, reg } = mundo('peluqueria', { semente });
    const S = sb.PeluqueriaSom; S.ligar();
    await new Promise(r => S.musica('inicio') || setTimeout(r, 20));
    const n = S.lista().length, urls = [];
    for (let i = 0; i < n; i++) { S.rodada(); await espera(); urls.push(reg.ultimo()); }
    confereVolta('peluqueria', urls, reg.fav, n);
  }
  { const { sb, reg } = mundo('peluqueria', { online: false, favGuardada: true });
    const S = sb.PeluqueriaSom; S.ligar(); S.musica('inicio'); await new Promise(r => setTimeout(r, 20));
    assert.deepStrictEqual(reg.srcs, ['blob:' + reg.fav]); assert.strictEqual(S.posicao().arquivo, 'funky-chunk.mp3'); }
  { const { sb, reg } = mundo('peluqueria', { online: false });
    const S = sb.PeluqueriaSom; S.ligar(); S.musica('inicio'); await new Promise(r => setTimeout(r, 20));
    assert.deepStrictEqual(reg.srcs, [], 'sem a favorita: silêncio (a Peluqueria não tem música feita no código)'); }
});

// ---------- no navegador: a trilha comum e a rádio de verdade ----------
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };
test('no navegador: Campo Minado e Labirinto dão a volta com a favorita no fim; a rádio da estante põe a Cool Rock no fim', { timeout: 120000 }, async () => {
  const { chromium } = require('playwright');
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (!p.startsWith('/kids/')) { res.writeHead(404); res.end(); return; }
    p = p.slice('/kids'.length); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(raiz, p);
    if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => srv.listen(0, r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/kids/';
  const b = await chromium.launch();
  try {
    const ctx = await b.newContext({ serviceWorkers: 'block', locale: 'pt-BR' });
    const pg = await ctx.newPage(); const erros = []; pg.on('pageerror', e => erros.push(e.message));
    for (const jogo of ['campo-minado', 'labirinto', 'aqua']) {
      for (let vez = 0; vez < 3; vez++) {
        await pg.goto(base + jogo + '/'); await pg.waitForSelector('.trilha');
        const r = await pg.evaluate(async () => {
          const urls = [Trilha._audio.src], prox = document.querySelector('.trilha .tr-prox');
          for (let i = 0; i < 30; i++) { prox.click(); urls.push(Trilha._audio.src); }
          return urls;
        });
        const fav = await pg.evaluate((j) => Trilha.offline.FAVORITAS[j], jogo);
        const n = new Set(r).size;
        confereVolta(jogo, r.slice(0, n), fav, n);
        assert.ok(n >= 10, jogo + ': ' + n + ' músicas');
      }
    }
    await pg.goto(base); await pg.waitForSelector('.radio');
    const bol = await pg.$$eval('.r-bolinhas button', bs => bs.map(x => x.getAttribute('aria-label')));
    assert.strictEqual(bol.length, 10);
    assert.match(bol[9], /Cool Rock/, 'a favorita da rádio por último: ' + bol.join(' | '));
    assert.doesNotMatch(bol[0], /Cool Rock/);
    assert.deepStrictEqual(erros, []);
  } finally { await b.close(); srv.close(); }
});
