// Vigia da estante (06/Nov/2026): todo jogo do catálogo obedece o app "kids" do RootifyONE e tem o seu interruptor;
// os jogos com a trilha comum (trilha.js) tocam pelo menos 10 músicas gravadas que existem no repositório.
// Rodar da raiz do repositório: node --test teste/*.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const ler = (f) => fs.readFileSync(path.join(raiz, f), 'utf8');

const catalogo = ler('catalogo.js');
const jogos = [...catalogo.matchAll(/\{ id: '([a-z0-9-]+)',[^]*?url: '([^']+)'/g)]
  .map(m => ({ id: m[1], url: m[2] })).filter(j => j.url.startsWith('/kids/'));
const rec = JSON.parse(ler('recursos-do-app.json'));

test('catálogo tem os jogos', () => {
  assert.ok(jogos.length >= 11, 'jogos no catálogo: ' + jogos.map(j => j.id).join(', '));
});

test('recursos-do-app.json: app kids, "app" (manutenção) e um interruptor por jogo', () => {
  assert.equal(rec.app, 'kids');
  assert.ok(rec.recursos.some(r => r.id === 'app'));
  for (const j of jogos) {
    const r = rec.recursos.find(x => x.id === j.id);
    assert.ok(r, 'sem interruptor: ' + j.id);
    assert.equal('/kids/' + r.pagina, j.url, 'página do interruptor ' + j.id);
    assert.ok(r.nome && r.nome.pt && r.nome.en, 'nome PT/EN: ' + j.id);
  }
});

test('cada jogo obedece o app kids (data-app) e marca o próprio interruptor (data-recurso)', () => {
  for (const j of jogos) {
    const arq = j.url.replace(/^\/kids\//, '') + (j.url.endsWith('/') ? 'index.html' : '');
    const html = ler(arq);
    assert.match(html, /src="\.\.\/recursos\.js" data-app="kids"|src="recursos\.js" data-app="kids"/, 'data-app em ' + arq);
    assert.ok(html.includes('data-recurso="' + j.id + '"'), 'data-recurso="' + j.id + '" em ' + arq);
  }
  assert.match(ler('index.html'), /<script src="\/kids\/recursos\.js" data-app="kids"><\/script>/, 'estante obedece os interruptores');
  assert.ok(catalogo.includes("a.setAttribute('data-recurso', j.id)"), 'cartão marcado com data-recurso');
});

test('jogos com a trilha comum: pelo menos 10 músicas que existem', () => {
  for (const j of jogos) {
    const pasta = j.url.replace(/^\/kids\//, '');
    if (!pasta.endsWith('/')) continue;
    const js = fs.readdirSync(path.join(raiz, pasta)).filter(f => /\.(js|html)$/.test(f)).map(f => ler(pasta + f)).join('\n');
    if (!/Trilha\.iniciar/.test(js)) continue;
    // os caminhos podem vir montados (M + 'nome.mp3', ou só o nome): vale todo texto entre aspas que é o nome de
    // um arquivo de alguma pasta musicas/ do repositório
    const pastas = fs.readdirSync(raiz).filter(d => fs.existsSync(path.join(raiz, d, 'musicas')));
    const existe = (n) => pastas.some(d => fs.existsSync(path.join(raiz, d, 'musicas', n + '.mp3')));
    const nomes = [...new Set([...js.matchAll(/['"/]([a-z0-9-]{3,})(?:\.mp3)?['"]/g)].map(m => m[1]))].filter(existe);
    assert.ok(nomes.length >= 10, j.id + ': só ' + nomes.length + ' músicas');
  }
});

test('estante sem internet: o service worker guarda as peças e os ícones dos cartões', () => {
  const sw = ler('sw.js');
  for (const f of ['recursos.js', 'trilha.js', 'cartoes-fundos.css']) assert.ok(sw.includes("'" + f + "'"), 'sw.js sem ' + f);
  for (const m of catalogo.matchAll(/img: '\/kids\/([^']+)'/g)) assert.ok(sw.includes("'" + m[1] + "'"), 'sw.js sem ' + m[1]);
});
