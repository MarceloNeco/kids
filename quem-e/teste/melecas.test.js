// Quem é? — as melecas (melecas.js). Rodar da raiz: node --test quem-e/teste/melecas.test.js
const test = require('node:test');
const assert = require('node:assert');
const M = require('../melecas.js');
const HUMORES = ['parada', 'feliz', 'ops', 'pensando', 'falando', 'triste'];

test('as duas melecas, com nome e cor', () => {
  assert.deepStrictEqual(M.LISTA.map(m => m.id), ['blue', 'pink']);
  assert.strictEqual(M.LISTA[0].nome, 'Melekento Blue');
  assert.strictEqual(M.LISTA[1].nome, 'Pink Honey');
  for (const m of M.LISTA) assert.match(m.cor, /^#[0-9a-f]{6}$/i);
});

test('cada meleca em cada humor: SVG válido, ids com prefixo, humores diferentes', () => {
  for (const m of M.LISTA) {
    const vistos = new Set();
    for (const h of HUMORES) {
      const s = M.svg(m.id, h, { id: 'm' + m.id + h });
      assert.ok(s.startsWith('<svg') && s.endsWith('</svg>'), m.id + h);
      for (const x of s.matchAll(/ id="([^"]+)"/g)) assert.ok(x[1].startsWith('m' + m.id + h), 'id sem prefixo ' + x[1]);
      for (const x of s.matchAll(/url\(#([^)]+)\)/g)) assert.ok(s.includes(' id="' + x[1] + '"'), 'referência sem alvo ' + x[1]);
      assert.ok(!/<script|<image|href="http/i.test(s));
      vistos.add(s.replace(/ id="[^"]+"|url\(#[^)]+\)/g, ''));
    }
    assert.strictEqual(vistos.size, HUMORES.length, 'humores iguais em ' + m.id);
  }
});

test('Melekento Blue: geleia azul em pé, com pezinhos; Pink Honey: rosa-choque fosco, deitada, com rabinho pontudo (fotos do dono)', () => {
  const b = M.svg('blue', 'parada', { id: 'b' }), p = M.svg('pink', 'parada', { id: 'p' });
  assert.match(b, /opacity="0?\.\d+"/);
  assert.ok(b.includes('qm-blue') && b.includes('qm-pes'), 'Blue sem pezinhos');
  assert.ok(p.includes('qm-pink') && p.includes('qm-rabo') && p.includes('qm-aba'), 'Pink sem rabinho ou sem a aba');
  assert.ok(!p.includes('qm-mel'), 'a Pink de verdade não tem fio de mel');
  assert.ok(/#ff1f8e/i.test(p), 'Pink sem o rosa-choque das fotos');
});

test('classe de animação por humor', () => {
  assert.ok(M.svg('blue', 'feliz', { id: 'a' }).includes('qm-pula'));
  assert.ok(M.svg('pink', 'ops', { id: 'a' }).includes('qm-treme'));
  assert.ok(M.svg('pink', 'parada', { id: 'a' }).includes('qm-respira'));
});

test('melecas em 3D: cada humor tem imagem guardada no jogo, leve, e entra no sw.js para jogar sem internet', () => {
  const fs = require('fs'), path = require('path');
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  for (const m of M.LISTA) for (const h of ['parada', 'feliz', 'ops', 'pensando', 'falando', 'triste']) {
    const tag = M.img(m.id, h), src = /src="([^"]+)"/.exec(tag)[1];
    assert.ok(/^<img class="qm-3d /.test(tag) && tag.includes('data-humor="' + h + '"'), tag);
    assert.ok(fs.existsSync(path.join(__dirname, '..', src)), 'falta ' + src);
  }
  for (const a of M.arquivos()) {
    const tam = fs.statSync(path.join(__dirname, '..', a)).size;
    assert.ok(tam < 120000, a + ' grande demais: ' + tam);
    assert.ok(sw.includes("'" + a + "'"), a + ' fora do sw.js');
  }
  assert.ok(M.img('blue', 'falando').includes('qm-fala'));
  assert.ok(M.img('pink', 'ops').includes('qm-treme'));
});
