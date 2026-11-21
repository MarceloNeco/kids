// Raio da Bruxinha (1.36.0, dono 21/Nov/2026): quem joga de bruxa tem o botão ⚡ RAIO (acerta o rival mais perto na
// frente, que fica lento um pouquinho; recarrega); a bruxa do computador solta raio de vez em quando, com aviso antes,
// e quem pula desvia. node --test vruuum/teste/raio.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../pista.js');
const M = require('../motor.js');

const BRUXA_RIVAL = { id: 'x', veic: 'bruxa', mod: { vel: 1.02, curva: 1.08, bruxa: true } };
const CARRO_RIVAL = { id: 'y', veic: 'classico', mod: { vel: 1, curva: 1 } };
function corrida(nivel, configs, bruxa) {
  const e = M.novaCorrida(nivel || 'normal', 9, 1, configs || []);
  e.jogadores[0].mod = bruxa ? { vel: 1.02, curva: 1.08, voa: false, bruxa: true } : { vel: 1, curva: 1, voa: false };
  e.fase = 'corrida';
  return e;
}
function passo(e, ent, n = 1) { const ev = []; for (let k = 0; k < n; k++) { M.atualizar(e, [Object.assign({ dir: 0 }, ent)], 1 / 60); ev.push(...e.eventos); } return ev; }

test('⚡ RAIO da bruxa: acerta o rival mais perto na frente, que fica lento; depois recarrega', () => {
  const e = corrida('normal', [CARRO_RIVAL, CARRO_RIVAL], true), j = e.jogadores[0];
  j.z = 100 * P.SEG; j.vel = e.pista.cfg.velMax;
  e.rivais[0].z = j.z + 20 * P.SEG; e.rivais[1].z = j.z + 8 * P.SEG;
  let ev = passo(e, { raio: true });
  const r = ev.find((x) => x.tipo === 'raio');
  assert.ok(r, 'soltou o raio'); assert.equal(r.r, 1, 'no rival mais perto');
  assert.ok(e.rivais[1].lento > 1 && e.rivais[1].raio > 0, 'o rival ficou lento');
  assert.ok(ev.some((x) => x.tipo === 'pontos' && x.motivo === 'raio'));
  ev = passo(e, { raio: true });
  assert.ok(!ev.some((x) => x.tipo === 'raio'), 'não dá para soltar outro na hora');
  passo(e, {}, Math.ceil(M.RAIO.recarga * 60) + 2);
  e.rivais[0].z = j.z + 10 * P.SEG;
  assert.ok(passo(e, { raio: true }).some((x) => x.tipo === 'raio'), 'recarregou');
});

test('⚡ sem ninguém na frente, o raio não sai (e não gasta a recarga toda)', () => {
  const e = corrida('normal', [CARRO_RIVAL], true), j = e.jogadores[0];
  j.z = 300 * P.SEG; e.rivais[0].z = 100 * P.SEG;
  const ev = passo(e, { raio: true });
  assert.ok(ev.some((x) => x.tipo === 'raioNada') && !ev.some((x) => x.tipo === 'raio'));
  assert.ok(j.raioRec < 1);
});

test('só a bruxa solta raio', () => {
  const e = corrida('normal', [CARRO_RIVAL], false), j = e.jogadores[0];
  j.z = 100 * P.SEG; e.rivais[0].z = j.z + 8 * P.SEG;
  assert.ok(!passo(e, { raio: true }).some((x) => /^raio/.test(x.tipo)));
});

function bruxaDoComputador(nivel) {
  const e = corrida(nivel, [BRUXA_RIVAL]), j = e.jogadores[0], rv = e.rivais[0];
  j.z = 200 * P.SEG; j.vel = e.pista.cfg.velMax; rv.z = j.z - 6 * P.SEG; rv.proxRaio = 0.01;
  return { e, j, rv };
}
test('bruxa do computador: avisa antes; quem não pula leva o raio e fica mais lento', () => {
  const { e, j } = bruxaDoComputador('normal');
  let ev = passo(e, {}, 2);
  assert.ok(ev.some((x) => x.tipo === 'raioAviso' && x.j === 0), 'aviso antes');
  assert.ok(j.raioAviso > 1, 'dá tempo de reagir');
  const vel = j.vel;
  ev = passo(e, {}, Math.ceil(e.pista.cfg.raioAviso * 60) + 2);
  assert.ok(ev.some((x) => x.tipo === 'raioPegou'), 'o raio caiu');
  assert.ok(j.vel < vel * 0.8, 'ficou mais lento');
  assert.equal(j.rodando, 0, 'sem rodopiar');
});

test('bruxa do computador: quem pula durante o aviso desvia (mesmo se pulou logo no começo)', () => {
  const { e, j } = bruxaDoComputador('normal');
  passo(e, {}, 2);
  passo(e, { pular: true });   // pulou na hora do aviso: já desceu quando o raio cai, mas desviou
  const vel = j.vel;
  const ev = passo(e, {}, Math.ceil(e.pista.cfg.raioAviso * 60) + 2);
  assert.ok(ev.some((x) => x.tipo === 'raioDesviou') && !ev.some((x) => x.tipo === 'raioPegou'));
  assert.ok(j.vel >= vel * 0.95);
});

test('bruxa do computador: de bolha também desvia; o Ursão nem sente', () => {
  let { e, j } = bruxaDoComputador('normal');
  j.escudo = 10; passo(e, {}, 2);
  assert.ok(passo(e, {}, Math.ceil(e.pista.cfg.raioAviso * 60) + 2).some((x) => x.tipo === 'raioDesviou'));
  ({ e, j } = bruxaDoComputador('normal'));
  j.mod.urso = true; passo(e, {}, 2);
  const ev = passo(e, {}, Math.ceil(e.pista.cfg.raioAviso * 60) + 2);
  assert.ok(!ev.some((x) => x.tipo === 'raioPegou'));
});

test('bruxa do computador: não fica soltando raio o tempo todo (de vez em quando, menos no nível Criança)', () => {
  const conta = {};
  for (const nivel of ['crianca', 'normal', 'turbo']) {
    const e = corrida(nivel, [BRUXA_RIVAL]), j = e.jogadores[0], rv = e.rivais[0];
    j.z = 100 * P.SEG; rv.z = j.z - 4 * P.SEG;
    let n = 0;
    for (let s = 0; s < 120 * 60; s++) {   // 2 minutos, a bruxa sempre logo atrás (o pior caso)
      j.z = Math.min(j.z + 40, e.pista.zChegada - 50 * P.SEG); rv.z = j.z - 4 * P.SEG; j.vel = 3000;
      M.atualizar(e, [{ dir: 0 }], 1 / 60);
      n += e.eventos.filter((x) => x.tipo === 'raioAviso').length;
    }
    conta[nivel] = n;
    const cada = e.pista.cfg.raioCada;
    assert.ok(n <= Math.ceil(120 / cada[0]) + 1, nivel + ': raio demais (' + n + ')');
    assert.ok(n >= 3, nivel + ': ela solta raio de vez em quando (' + n + ')');
  }
  assert.ok(conta.crianca < conta.normal && conta.normal <= conta.turbo, JSON.stringify(conta));
});

test('a Bruxinha do computador entra nos rivais (em mais ou menos metade das corridas no chão), com o jeito de bruxa', () => {
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'app.js'), 'utf8');
  const linha = src.split('\n').find((l) => l.includes('opcoes = VE.LISTA.filter'));
  assert.ok(linha && !linha.includes('!v.bruxa'), 'a bruxa não está mais fora dos rivais');
  assert.ok(/livres\[q\]\.bruxa/.test(src) && /Math\.random\(\) < 0\.5/.test(src), 'sorteio de meia-meia');
  assert.ok(src.includes('bruxa: !!v.bruxa } });'), 'o rival leva o jeito de bruxa para o motor');
});
