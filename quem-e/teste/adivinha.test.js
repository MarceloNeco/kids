// Quem é? — A Meleca Adivinha: o motor (adivinha.js). Rodar da raiz: node --test quem-e/teste/adivinha.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const A = require('../adivinha.js');

function sorteio(s) { s = s >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
// mundo de mentira: 300 personagens e 60 perguntas sim/não sorteadas, mais 6 perguntas de nível F e A
function mundo(semente) {
  const r = sorteio(semente), perguntas = [], lista = [];
  for (let i = 0; i < 66; i++) perguntas.push({ id: 'q' + i, n: i < 60 ? 'I' : i < 63 ? 'F' : 'A', g: 'x', pt: 'P' + i + '?', en: 'Q' + i + '?', padrao: '?', nucleo: false });
  for (let k = 0; k < 300; k++) {
    const partes = [];
    for (let i = 0; i < 66; i++) { const x = r(); if (x < 0.08) continue; partes.push('q' + i + ':' + (x < 0.5 ? 's' : x < 0.55 ? 'p' : x < 0.6 ? 'q' : 'n')); }
    lista.push(['p' + k, 'Pessoa ' + k, '🙂', k % 10 === 0 ? 'FA' : 'IFA', partes.join(' ')]);
  }
  return { perguntas, lista };
}
const verdade = (alvo, id) => { const v = alvo.r[id]; return v === undefined ? '?' : v; };
function jogar(base, nivel, alvoId, rnd, ruido) {
  const j = A.criar({ base, nivel, rnd });
  const alvo = base.personagens.find(p => p.id === alvoId);
  for (let passos = 0; passos < 200; passos++) {
    const a = j.proxima();
    if (a.tipo === 'perdi') return { acertou: false, perguntas: j.estado().perguntas };
    if (a.tipo === 'chute') { if (a.personagem.id === alvoId) return { acertou: true, perguntas: j.estado().perguntas, chutes: j.estado().chutes }; j.chuteErrado(); continue; }
    let c = verdade(alvo, a.id);
    if (ruido && rnd() < ruido && (c === 's' || c === 'n')) c = c === 's' ? 'n' : 's';
    j.responder(c);
  }
  throw new Error('não terminou');
}

test('sem erro na resposta: acerta todo mundo, quase sempre de primeira e com poucas perguntas', () => {
  const { perguntas, lista } = mundo(7);
  const base = A.carregar([lista], perguntas), rnd = sorteio(3);
  let primeira = 0, soma = 0;
  for (const p of base.personagens) {
    const r = jogar(base, 'A', p.id, rnd, 0);
    assert.ok(r.acertou, 'não acertou ' + p.id);
    if (r.chutes === 1) primeira++;
    soma += r.perguntas;
  }
  assert.ok(primeira >= 0.95 * base.personagens.length, 'de primeira: ' + primeira);
  assert.ok(soma / base.personagens.length <= 22, 'média de perguntas: ' + soma / base.personagens.length);
});

test('com 10% das respostas erradas ainda acerta a maioria', () => {
  const { perguntas, lista } = mundo(9);
  const base = A.carregar([lista], perguntas), rnd = sorteio(5);
  let ok = 0;
  for (const p of base.personagens) if (jogar(base, 'A', p.id, rnd, 0.1).acertou) ok++;
  assert.ok(ok >= 0.85 * base.personagens.length, 'acertou ' + ok + ' de ' + base.personagens.length);
});

test('nível: no Infantil só pergunta perguntas I e só chuta personagens do Infantil', () => {
  const { perguntas, lista } = mundo(11);
  const base = A.carregar([lista], perguntas);
  const j = A.criar({ base, nivel: 'I', rnd: sorteio(1) });
  for (let i = 0; i < 60; i++) {
    const a = j.proxima();
    if (a.tipo === 'pergunta') { assert.ok(+a.id.slice(1) < 60, a.id); j.responder('n'); }
    else if (a.tipo === 'chute') { assert.ok(a.personagem.niveis.includes('I')); j.chuteErrado(); }
    else break;
  }
});

test('"não sei" não muda as chances; desfazer volta exatamente', () => {
  const { perguntas, lista } = mundo(13);
  const base = A.carregar([lista], perguntas);
  const j = A.criar({ base, nivel: 'A', rnd: sorteio(2) });
  const a = j.proxima(); const antes = JSON.stringify(j.chances());
  j.responder('?');
  assert.equal(JSON.stringify(j.chances()), antes);
  const b = j.proxima(); j.responder('s');
  assert.notEqual(JSON.stringify(j.chances()), antes);
  j.desfazer();
  assert.equal(JSON.stringify(j.chances()), antes);
  assert.equal(j.proxima().id, b.id);
  assert.notEqual(a.id, b.id);
  assert.deepEqual(j.historico().map(h => h.id), [a.id]);
});

test('nunca repete pergunta; depois de 4 chutes errados, perde e pede ajuda', () => {
  const { perguntas, lista } = mundo(17);
  const base = A.carregar([lista], perguntas);
  const j = A.criar({ base, nivel: 'A', rnd: sorteio(4) });
  const feitas = new Set(); let chutes = 0, fim = null;
  for (let i = 0; i < 300 && !fim; i++) {
    const a = j.proxima();
    if (a.tipo === 'pergunta') { assert.ok(!feitas.has(a.id), 'repetiu ' + a.id); feitas.add(a.id); j.responder(i % 2 ? 's' : 'n'); }
    else if (a.tipo === 'chute') { chutes++; j.chuteErrado(); }
    else fim = a;
  }
  assert.equal(fim && fim.tipo, 'perdi');
  assert.ok(chutes <= 4);
});

test('personagem aprendido entra na disputa no nível certo', () => {
  const { perguntas, lista } = mundo(19);
  const base = A.carregar([lista], perguntas);
  const respostas = {}; for (let i = 0; i < 60; i++) respostas['q' + i] = i % 3 ? 'n' : 's';
  const extra = { id: 'apr-irmao', nome: 'Meu irmão', emoji: '👦', niveis: 'IFA', r: respostas };
  const j = A.criar({ base, nivel: 'I', rnd: sorteio(6), extras: [extra] });
  for (let i = 0; i < 100; i++) {
    const a = j.proxima();
    if (a.tipo === 'chute') { if (a.personagem.id === 'apr-irmao') return; j.chuteErrado(); continue; }
    if (a.tipo === 'perdi') break;
    j.responder(respostas[a.id] || '?');
  }
  assert.fail('não chutou o aprendido');
});

test('revisão: resposta estranha guardada não vira NaN e não estraga o jogo', () => {
  const { perguntas, lista } = mundo(23);
  const base = A.carregar([lista], perguntas);
  const ruim = { id: 'apr-x', nome: 'X', emoji: '⭐', niveis: 'IFA', r: { q0: 'constructor', q1: 'toString' } };
  const j = A.criar({ base, nivel: 'A', rnd: sorteio(8), extras: [ruim] });
  for (let i = 0; i < 40; i++) { const a = j.proxima(); if (a.tipo === 'pergunta') j.responder(i % 2 ? 's' : 'n'); else if (a.tipo === 'chute') j.chuteErrado(); else break; }
  assert.ok(j.chances().every(x => Number.isFinite(x)), 'chance NaN');
  const ruim2 = { id: 'apr-y', nome: 'Y', emoji: '⭐', niveis: 'IFA', r: {} }; for (let i = 0; i < 66; i++) ruim2.r['q' + i] = 'constructor';
  const alvo = base.personagens[3], j2 = A.criar({ base, nivel: 'A', rnd: sorteio(8), extras: [ruim2] });
  let achou = false, perguntas2 = 0;
  for (let i = 0; i < 100 && !achou; i++) { const a = j2.proxima(); if (a.tipo === 'perdi') break; if (a.tipo === 'chute') { if (a.personagem.id === alvo.id) achou = true; else j2.chuteErrado(); continue; } perguntas2++; const v = alvo.r[a.id]; j2.responder(v === undefined ? '?' : v); }
  assert.ok(achou && perguntas2 >= 5, 'o personagem estragado atrapalhou: achou=' + achou + ' perguntas=' + perguntas2);
  const r = jogar(base, 'A', base.personagens[3].id, sorteio(9), 0);
  assert.ok(r.acertou);
});

test('revisão: desfazer depois de um chute errado não traz o chutado de volta', () => {
  const { perguntas, lista } = mundo(29);
  const base = A.carregar([lista], perguntas);
  const alvo = base.personagens[10];
  const j = A.criar({ base, nivel: 'A', rnd: sorteio(10) });
  let rejeitado = null;
  for (let i = 0; i < 100 && !rejeitado; i++) {
    const a = j.proxima();
    if (a.tipo === 'chute') { if (a.personagem.id !== alvo.id) { rejeitado = a.personagem.id; j.chuteErrado(); } else { j.chuteErrado(); rejeitado = a.personagem.id; } break; }
    // responde como se fosse o primeiro mais provável, para forçar um chute que não é o alvo
    j.responder(i % 2 ? 's' : 'n');
  }
  assert.ok(rejeitado);
  const chutesAntes = j.estado().chutes;
  j.desfazer();
  assert.equal(j.estado().chutes, chutesAntes, 'desfazer devolveu o chute');
  for (let i = 0; i < 100; i++) {
    const a = j.proxima();
    if (a.tipo === 'perdi') break;
    if (a.tipo === 'chute') { assert.notEqual(a.personagem.id, rejeitado, 'chutou de novo quem já tinha errado'); j.chuteErrado(); continue; }
    j.responder(i % 2 ? 's' : 'n');
  }
});
