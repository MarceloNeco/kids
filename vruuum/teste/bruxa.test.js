// Bruxa na vassoura (1.33.0): começa no chão com os carros; o botão PULAR sobe para o céu e, de novo, desce.
// node --test vruuum/teste/bruxa.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../pista.js');
const M = require('../motor.js');
const V = require('../veiculos.js');

function corrida() {
  const e = M.novaCorrida('normal', 9, 1, []);
  e.jogadores[0].mod = { vel: 1.02, curva: 1.08, voa: false, bruxa: true };
  e.fase = 'corrida';
  return e;
}
function passo(e, ent, n = 1) { const ev = []; for (let k = 0; k < n; k++) { M.atualizar(e, [ent], 1 / 60); ev.push(...e.eventos); } return ev; }

test('a bruxa está na garagem (grupo do céu), mas começa no chão', () => {
  const b = V.achar('bruxa');
  assert.ok(b && b.bruxa && b.modelo === 'bruxa');
  assert.equal(b.grupo, 'ar');
  assert.equal(V.voa('bruxa'), false, 'começa andando, junto com os carros');
  assert.ok(b.nome.every(n => n.length > 3));
});

test('PULAR sobe para o céu; PULAR de novo desce para a estrada', () => {
  const e = corrida(), j = e.jogadores[0];
  j.z = 50 * P.SEG; j.vel = e.pista.cfg.velMax;
  passo(e, { dir: 0 }, 2);
  assert.ok(!j.voando && !j.mod.voa);
  let ev = passo(e, { dir: 0, pular: true });
  assert.ok(j.voando && j.mod.voa, 'subiu');
  assert.ok(ev.some(x => x.tipo === 'bruxaSobe'));
  ev = passo(e, { dir: 0, pular: true });
  assert.ok(j.voando, 'no meio da subida o botão não desce de novo');
  passo(e, { dir: 0 }, Math.ceil(M.RECARGA * 60) + 2);
  ev = passo(e, { dir: 0, pular: true });
  assert.ok(!j.voando && !j.mod.voa, 'desceu');
  assert.ok(ev.some(x => x.tipo === 'bruxaDesce'));
});

test('no chão a vassoura passa por cima do rio (não vira barco)', () => {
  const e = corrida(), j = e.jogadores[0];
  const i = e.pista.segs.findIndex(s => s.agua);
  assert.ok(i > 0, 'a pista tem rio');
  j.z = (i - 2) * P.SEG; j.vel = e.pista.cfg.velMax;
  const ev = passo(e, { dir: 0 }, 60);
  assert.ok(!ev.some(x => x.tipo === 'agua'));
});
