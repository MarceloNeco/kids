// Testes do cavalo (cavalo.js): galope de 4 batidas com um momento no ar e a cabeça de quem monta no lugar certo.
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../cavalo.js');
const V = require('../veiculos.js');

const PATAS = [['te', false], ['td', false], ['de', true], ['dd', true]];
function noChao(f, quando) { const p = ((f - quando) % 1 + 1) % 1; return p < C.APOIO; }

test('galope: cada pata fica no chão uma vez por passada e há um momento com as 4 no ar', () => {
  let noAr = 0;
  for (let k = 0; k < 200; k++) {
    const f = k / 200, apoiadas = PATAS.filter(([id]) => noChao(f, C.BATIDA[id])).length;
    if (apoiadas === 0) noAr++;
  }
  assert.ok(noAr > 0, 'nenhum momento com as 4 patas no ar');
  assert.ok(noAr < 60, 'tempo demais no ar');
  for (const [id, frente] of PATAS) {
    let a = 0;
    for (let k = 0; k < 200; k++) a = Math.max(a, C.perna(k / 200, C.BATIDA[id], frente).dobra);
    assert.ok(a > 1, id + ' não dobra a perna ao voltar');
  }
});

test('parado, o cavalo fica em pé (pernas retas, corpo sem balançar)', () => {
  for (const [id, frente] of PATAS) assert.deepEqual(C.perna(-1, C.BATIDA[id], frente), { ang: 0, dobra: 0 });
  assert.equal(C.corpo(-1).sobe, 0);
});

test('a cabeça de quem monta: a da ficha do veículo bate com a do desenho, e fica dentro do quadro de lado também', () => {
  const v = V.achar('cavalo'), W = v.w, H = v.h;
  assert.ok(v && v.cavalo && v.quadros, 'cavalo na garagem, animado');
  const h = C.cabeca(0, 0, W, H, 0.3, 0);
  assert.ok(Math.abs(h.x / W - v.cab[0]) < 0.01 && Math.abs(h.y / H - v.cab[1]) < 0.01 && Math.abs(2 * h.r / H - v.cab[2]) < 0.01, JSON.stringify(h));
  for (const lado of [-1, 1]) for (let f = 0; f < 1; f += 0.1) {
    const q = C.cabeca(0, 0, W, H, f, lado);
    assert.ok(q.x - q.r > 0 && q.x + q.r < W && q.y - q.r > 0, 'cabeça fora do quadro');
  }
});
