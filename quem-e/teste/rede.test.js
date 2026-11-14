// Quem é? — Duelo de Caras em dois aparelhos, sem internet: node --test quem-e/teste/rede.test.js
// Aparelhos de mentira no mesmo processo, por um canal falso que perde e repete mensagens, com relógio de mentira.
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../logica.js');
const R = require('../rede.js');

function sorteio(s) { s = s >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
let cont = 0;
const idTeste = () => ('t' + (cont++).toString(36) + 'zzzzzzzz').slice(0, 8);

function Mundo(semente, perda = 0, repete = 0) {
  let t = 1000;
  const rnd = sorteio(semente), nos = [], fila = [];
  const M = { nos, rnd, agora: () => t, msgs: [] };
  M.no = (op) => {
    const k = nos.length, no = { on: true, salvo: null };
    no.criar = dados => R.criar({
      id: op.id, codigo: 'ABCD', host: !!op.host, nivel: op.nivel, semente: op.semente, dados, agora: M.agora,
      mandar: m => { if (!no.on) return; const txt = JSON.stringify(m); M.msgs.push(txt); nos.forEach((o, j) => { if (j !== k && o.on && rnd() >= perda) { fila.push([j, txt]); if (rnd() < repete) fila.push([j, txt]); } }); },
      salvar: d => { no.salvo = d; }
    });
    no.s = no.criar(null);
    nos.push(no);
    return no;
  };
  M.entregar = () => { let g = 0; while (fila.length && g++ < 100000) { const [j, txt] = fila.shift(); if (nos[j].on) nos[j].s.receber(JSON.parse(txt)); } };
  M.passo = (ms = 500) => { M.entregar(); t += ms; nos.forEach(o => { if (o.on) o.s.tique(); }); M.entregar(); };
  M.recarregar = no => { no.s = no.criar(no.salvo); };
  return M;
}

// cada aparelho faz o que a partida pede dele, com respostas verdadeiras
function jogar(M, no, seg) {
  const s = no.s, p = s.partida; if (!p) return;
  const a = p.aguardando(); if (!a) return;
  if (a.acao === 'segredo') { if (a.faltam.includes(s.eu) && p.estado.segredos[s.eu] === null) s.agir('segredo', { c: seg }); return; }
  if (a.jogador !== s.eu) return;
  const t = p.tabuleiro, e = p.estado, eu = s.eu;
  if (a.acao === 'responder') { assert.equal(s.agir('resposta', { r: L.responder(t.caras[seg], e.ultima.pergunta) }).ok, true); return; }
  if (a.acao === 'descartar') { p.descartarTodos(eu); s.agir('fimvez', {}); return; }
  if (a.acao === 'perguntar') {
    const vivos = e.dePe[eu].map((v, i) => v ? i : -1).filter(i => i >= 0);
    const q = t.perguntas.find(x => !e.feitas[eu].includes(x) && L.utilidade(t.caras, e.dePe[eu], x) > 0 && L.utilidade(t.caras, e.dePe[eu], x) < vivos.length);
    if (!q || vivos.length === 1) s.agir('palpite', { c: vivos[0] }); else s.agir('pergunta', { p: q });
  }
}

function partidaInteira(M, a, b, segA, segB, recarregarNoMeio) {
  for (let i = 0; i < 4000; i++) {
    jogar(M, a, segA); jogar(M, b, segB); M.passo(200);
    if (recarregarNoMeio && i === 40) { M.recarregar(b); }
    if (a.s.partida && a.s.partida.estado.fase === 'fim' && b.s.partida.estado.fase === 'fim' && a.s.revelado() !== null && b.s.revelado() !== null) return;
  }
  assert.fail('a partida não terminou');
}

test('partida inteira entre dois aparelhos, com perdas e repetições', () => {
  for (const [sem, nivel] of [[1, 'facil'], [2, 'medio'], [3, 'dificil']]) {
    const M = Mundo(sem, 0.25, 0.2);
    const a = M.no({ id: idTeste(), host: true, nivel, semente: 99 }), b = M.no({ id: idTeste() });
    for (let i = 0; i < 40 && !b.s.partida; i++) M.passo();
    assert.ok(b.s.partida, 'quem entrou não recebeu o tabuleiro');
    assert.equal(b.s.eu, 1); assert.equal(a.s.eu, 0);
    assert.deepEqual(b.s.partida.tabuleiro, a.s.partida.tabuleiro);
    partidaInteira(M, a, b, 3, 7, false);
    assert.deepEqual(a.s.diario(), b.s.diario(), 'diários diferentes');
    assert.equal(a.s.partida.estado.vencedor, b.s.partida.estado.vencedor);
    assert.equal(a.s.revelado(), 7); assert.equal(b.s.revelado(), 3);
  }
});

test('o segredo de cada um só aparece nas mensagens depois do fim', () => {
  const M = Mundo(4);
  const a = M.no({ id: idTeste(), host: true, nivel: 'medio', semente: 5 }), b = M.no({ id: idTeste() });
  for (let i = 0; i < 20 && !b.s.partida; i++) M.passo();
  a.s.agir('segredo', { c: 11 }); b.s.agir('segredo', { c: 17 });
  for (let i = 0; i < 6; i++) M.passo();
  const antes = M.msgs.length;
  assert.ok(!M.msgs.some(txt => /"segredo"|"revelar"|"c":(11|17)\b/.test(txt)), 'segredo vazou');
  partidaInteira(M, a, b, 11, 17, false);
  assert.ok(M.msgs.slice(antes).some(txt => /"revelar"/.test(txt)));
});

test('recarregar a página no meio volta para a mesma partida', () => {
  const M = Mundo(6, 0.1);
  const a = M.no({ id: idTeste(), host: true, nivel: 'facil', semente: 8 }), b = M.no({ id: idTeste() });
  for (let i = 0; i < 20 && !b.s.partida; i++) M.passo();
  partidaInteira(M, a, b, 2, 9, true);
  assert.deepEqual(a.s.diario(), b.s.diario());
});

test('terceiro aparelho ouve "sala cheia"; mensagem estranha é ignorada', () => {
  const M = Mundo(7);
  const a = M.no({ id: idTeste(), host: true, nivel: 'facil', semente: 1 }), b = M.no({ id: idTeste() }), c = M.no({ id: idTeste() });
  for (let i = 0; i < 20; i++) M.passo();
  assert.ok(b.s.partida || c.s.partida);
  const fora = b.s.partida ? c : b;
  assert.equal(fora.s.cheia(), true);
  const antes = JSON.stringify(a.s.diario());
  for (const lixo of [null, 5, 'oi', {}, { t: 'ev', de: 'xx' }, { t: 'ev', de: b.s.id, e: { n: 0, j: 1, k: 'pergunta', p: '<script>' } }, { t: 'ev', de: 'zzzzzzzz', e: { n: 0, j: 1, k: 'pronto' } }])
    a.s.receber(lixo);
  assert.equal(JSON.stringify(a.s.diario()), antes);
  assert.equal(R.validar({ t: 'ev', de: 'abcdefgh', e: { n: 0, j: 1, k: 'resposta', r: 'sim' } }), null);
});

test('o outro sumiu: depois de 12 s sem notícia, avisa', () => {
  const M = Mundo(8);
  const a = M.no({ id: idTeste(), host: true, nivel: 'facil', semente: 1 }), b = M.no({ id: idTeste() });
  for (let i = 0; i < 10; i++) M.passo();
  assert.equal(a.s.outroAqui(), true);
  b.on = false;
  for (let i = 0; i < 30; i++) M.passo();
  assert.equal(a.s.outroAqui(), false);
});
