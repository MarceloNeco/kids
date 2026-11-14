// Quem é? — A Meleca Adivinha com a lista de verdade (personagens/*.js): cada personagem "joga" respondendo as próprias
// respostas. Rodar da raiz: node --test quem-e/teste/adivinha-real.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const A = require('../adivinha.js'), Q = require('../adivinha-perguntas.js');
const p = path.join(__dirname, '..', 'personagens');
const base = A.carregar(fs.readdirSync(p).sort().map(f => require(path.join(p, f))), Q.PERGUNTAS);
function sorteio(s) { s = s >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function partida(alvo, nivel, rnd, ruido) {
  const j = A.criar({ base, nivel, rnd });
  for (let i = 0; i < 300; i++) {
    const a = j.proxima();
    if (a.tipo === 'perdi') return false;
    if (a.tipo === 'chute') { if (a.personagem.id === alvo.id) return true; j.chuteErrado(); continue; }
    let v = alvo.r[a.id]; if (v === undefined) v = Q.POR_ID[a.id].padrao;
    const x = rnd(); if (x < ruido) v = v === 's' ? 'n' : v === 'n' ? 's' : '?'; else if (x < ruido * 2 && v !== '?') v = v === 's' ? 'p' : v === 'n' ? 'q' : v;
    j.responder(v);
  }
  return false;
}

for (const nivel of ['I', 'F', 'A']) {
  test('nível ' + nivel + ': respondendo certo, a meleca acerta todo mundo', () => {
    const rnd = sorteio(1), alvos = base.personagens.filter(c => c.niveis.includes(nivel));
    const falhas = alvos.filter(a => !partida(a, nivel, rnd, 0)).map(a => a.id);
    assert.deepEqual(falhas, []);
  });
  test('nível ' + nivel + ': com 10% das respostas trocadas, acerta pelo menos 92%', () => {
    const rnd = sorteio(2), alvos = base.personagens.filter(c => c.niveis.includes(nivel)).filter((c, i) => i % 3 === 0);
    const ok = alvos.filter(a => partida(a, nivel, rnd, 0.1)).length;
    assert.ok(ok >= 0.92 * alvos.length, ok + ' de ' + alvos.length);
  });
}
