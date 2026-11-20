// Ursão de Pelúcia (1.30.0): gigante, nada atrapalha, empurra os rivais rindo, chega em 1º; só a beirada o segura.
// node --test vruuum/teste/urso.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../pista.js');
const M = require('../motor.js');
const V = require('../veiculos.js');

const RIVAIS = [1, 2, 3, 4, 5].map(k => ({ id: 'r' + k, veic: 'classico', cor: '#ff0000', mod: { vel: 1.08, curva: 1 } }));
function corrida(nivel, semente, urso) {
  const e = M.novaCorrida(nivel, semente, 1, RIVAIS);
  e.jogadores[0].mod = { vel: 1, curva: 1.05, urso: urso };
  e.fase = 'corrida'; e.contagem = 0;
  return e;
}
function passo(e, dir, n = 1, dt = 1 / 60) { const ev = []; for (let k = 0; k < n; k++) { M.atualizar(e, [{ dir: dir }], dt); ev.push(...e.eventos); } return ev; }

test('o Ursão está na garagem, gigante, sem motor e não é sorteado como rival', () => {
  const u = V.achar('urso');
  assert.ok(u && u.urso && u.semMotor && u.semPiloto);
  assert.ok(u.w >= 1500 && u.h >= 1500, 'gigante');
  assert.equal(u.voz, 'risada');
});

test('o Ursão chega em 1º, dirigindo no meio da pista (nada atrapalha)', () => {
  for (const semente of [3, 11, 27]) {
    const e = corrida('normal', semente, true), j = e.jogadores[0];
    let lugar = null;
    for (let t = 0; t < 400 && !j.chegou; t += 1 / 30) {
      M.atualizar(e, [{ dir: Math.max(-1, Math.min(1, -j.x * 4)) }], 1 / 30);
      for (const ev of e.eventos) if (ev.tipo === 'chegou') lugar = ev.lugar;
    }
    assert.equal(lugar, 1, 'semente ' + semente);
  }
});

test('cone e lama não seguram o Ursão: ele ri e segue', () => {
  const e = corrida('normal', 5, true), j = e.jogadores[0];
  j.x = 0; j.z = 40 * P.SEG; j.vel = e.pista.cfg.velMax;
  const s = e.pista.segs[44]; s.coisas.push({ tipo: 'cone', x: 0, pego: {} }, { tipo: 'lama', x: 0, pego: {} });
  const antes = j.vel, ev = passo(e, 0, 40);
  assert.ok(j.vel >= antes * 0.95, 'não freou: ' + antes + ' -> ' + j.vel);
  assert.ok(!ev.some(x => x.tipo === 'cone' || x.tipo === 'lama'));
  assert.ok(ev.some(x => x.tipo === 'risada'));
});

test('o Ursão empurra o rival para o lado (e o rival fica mais lento)', () => {
  const e = corrida('normal', 5, true), j = e.jogadores[0], rv = e.rivais[0];
  j.x = 0; j.z = 30 * P.SEG; rv.x = 0.1; rv.faixa = 0.1; rv.z = j.z + 10; rv.vel = j.vel = e.pista.cfg.velMax * 0.8;
  const ev = passo(e, 0, 1);
  assert.ok(Math.abs(rv.x - j.x) >= 0.75, 'rival longe: ' + rv.x);
  assert.ok(rv.lento > 0);
  assert.ok(ev.some(x => x.tipo === 'ursoEmpurra'));
});

test('encostando na beirada o Ursão freia bastante (é assim que os outros passam)', () => {
  const e = corrida('normal', 5, true), j = e.jogadores[0], max = e.pista.cfg.velMax * M.URSO.vel;
  j.z = 30 * P.SEG; j.vel = max; j.x = 1.0;
  const ev = passo(e, 1, 30);
  assert.ok(j.vel < max * 0.4, 'freou: ' + j.vel / max);
  assert.ok(ev.some(x => x.tipo === 'ursoBate'));
});

test('virando para o lado, o Ursão saltita; reto, não', () => {
  const e = corrida('normal', 5, true), j = e.jogadores[0];
  j.z = 30 * P.SEG; j.vel = e.pista.cfg.velMax;
  assert.ok(!passo(e, 0, 30).some(x => x.tipo === 'saltito'));
  assert.ok(passo(e, 1, 10).some(x => x.tipo === 'saltito'));
  assert.ok(j.pulo > 0 || j.puloMax === M.URSO.saltito);
});

test('quem não é o Ursão continua igual (cone segura)', () => {
  const e = corrida('normal', 5, false), j = e.jogadores[0];
  j.x = 0; j.z = 40 * P.SEG; j.vel = e.pista.cfg.velMax;
  e.pista.segs[44].coisas.push({ tipo: 'cone', x: 0, pego: {} });
  const ev = passo(e, 0, 40);
  assert.ok(ev.some(x => x.tipo === 'cone'));
});

test('1.32.0: um pouco mais rápido que os rivais (não um foguete) e a beirada freia até 15%', () => {
  assert.ok(M.URSO.vel > 1.05 && M.URSO.vel <= 1.12, 'vel ' + M.URSO.vel);
  const e = corrida('normal', 5, true), j = e.jogadores[0], max = e.pista.cfg.velMax * M.URSO.vel;
  j.z = 30 * P.SEG; j.vel = max; j.x = 1.0;
  passo(e, 1, 90);
  assert.ok(j.vel < max * 0.2, 'freou bem: ' + (j.vel / max).toFixed(2));
});
