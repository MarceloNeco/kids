// Quem é? — regras da partida (partida.js). Rodar da raiz: node --test quem-e/teste/partida.test.js
const test = require('node:test');
const assert = require('node:assert');
const L = require('../logica.js');
const QP = require('../partida.js');

function sorteio(s) { s = s >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const codigo = (fn) => { try { fn(); } catch (e) { return e.codigo; } return null; };

test('passar o aparelho: partida inteira', () => {
  const p = QP.criar({ modo: 'passar', nivel: 'facil', semente: 3 });
  const t = p.tabuleiro;
  assert.deepStrictEqual(p.aguardando(), { acao: 'segredo', faltam: [0, 1] });
  p.escolherSegredo(0, 2); p.escolherSegredo(1, 7);
  assert.strictEqual(p.estado.fase, 'jogo');
  assert.deepStrictEqual(p.aguardando(), { jogador: 0, acao: 'perguntar' });
  let rodadas = 0;
  while (p.estado.fase === 'jogo' && rodadas++ < 200) {
    const j = p.estado.vez, o = 1 - j, seg = p.estado.segredos[o];
    const vivos = p.estado.dePe[j].map((v, i) => v ? i : -1).filter(i => i >= 0);
    if (vivos.length === 1) { assert.strictEqual(p.palpite(j, vivos[0]).acertou, true); break; }
    const id = t.perguntas.find(q => !p.estado.feitas[j].includes(q) && L.utilidade(t.caras, p.estado.dePe[j], q) > 0 && L.utilidade(t.caras, p.estado.dePe[j], q) < vivos.length);
    p.perguntar(j, id);
    assert.deepStrictEqual(p.aguardando(), { jogador: o, acao: 'responder' });
    assert.strictEqual(p.responder(o, L.responder(t.caras[seg], id)).ok, true);
    const ids = p.descartarTodos(j);
    for (const i of ids) assert.strictEqual(p.estado.dePe[j][i], false);
    assert.ok(p.estado.dePe[j][seg], 'descartou o segredo');
    p.pronto(j);
  }
  assert.strictEqual(p.estado.fase, 'fim');
  assert.ok(p.estado.vencedor === 0 || p.estado.vencedor === 1);
});

test('resposta errada não passa e nada muda', () => {
  const p = QP.criar({ modo: 'passar', nivel: 'medio', semente: 8 });
  p.escolherSegredo(0, 1); p.escolherSegredo(1, 4);
  const id = p.tabuleiro.perguntas[0];
  p.perguntar(0, id);
  const certa = L.responder(p.tabuleiro.caras[4], id);
  const antes = JSON.stringify(p.estado);
  assert.deepStrictEqual(p.responder(1, !certa), { ok: false });
  assert.deepStrictEqual(p.responder(1, !certa), { ok: false });
  assert.strictEqual(JSON.stringify(p.estado), antes);
  assert.strictEqual(p.responder(1, certa).ok, true);
  assert.strictEqual(p.estado.passo, 'descartar');
});

test('regras: fora da vez, passo errado, pergunta repetida', () => {
  const p = QP.criar({ modo: 'passar', nivel: 'facil', semente: 5 });
  assert.strictEqual(codigo(() => p.perguntar(0, p.tabuleiro.perguntas[0])), 'fase');
  p.escolherSegredo(0, 0); p.escolherSegredo(1, 1);
  assert.strictEqual(codigo(() => p.perguntar(1, p.tabuleiro.perguntas[0])), 'fora-da-vez');
  assert.strictEqual(codigo(() => p.pronto(0)), 'passo');
  assert.strictEqual(codigo(() => p.perguntar(0, 'nao-existe')), 'pergunta');
  const id = p.tabuleiro.perguntas[0];
  p.perguntar(0, id);
  p.responder(1, L.responder(p.tabuleiro.caras[1], id));
  p.pronto(0);
  p.perguntar(1, id); p.responder(0, L.responder(p.tabuleiro.caras[0], id)); p.pronto(1);
  assert.strictEqual(codigo(() => p.perguntar(0, id)), 'pergunta');
});

test('palpite errado vira a carta e passa a vez; virar tudo e desvirar continua valendo', () => {
  const p = QP.criar({ modo: 'passar', nivel: 'facil', semente: 9 });
  p.escolherSegredo(0, 3); p.escolherSegredo(1, 5);
  assert.deepStrictEqual(p.palpite(0, 6), { acertou: false });
  assert.strictEqual(p.estado.dePe[0][6], false);
  assert.strictEqual(p.estado.vez, 1);
  p.estado.dePe[1].forEach((v, i) => { if (v) p.virar(1, i); });
  assert.ok(p.estado.dePe[1].every(v => !v));
  assert.deepStrictEqual(p.palpite(1, 3), { acertou: true });
  assert.strictEqual(p.estado.fase, 'fim');
  assert.strictEqual(p.estado.vencedor, 1);
});

test('contra a meleca: ela escolhe o segredo, responde sozinha e joga a vez dela', () => {
  for (const nivel of ['facil', 'medio', 'dificil']) {
    const rnd = sorteio(nivel.length * 7);
    for (let s = 1; s <= 100; s++) {
      const p = QP.criar({ modo: 'meleca', nivel, semente: s, rnd });
      assert.notStrictEqual(p.estado.segredos[1], null);
      const t = p.tabuleiro, seg = Math.floor(rnd() * t.caras.length);
      p.escolherSegredo(0, seg);
      let passos = 0;
      while (p.estado.fase === 'jogo' && passos++ < 500) {
        const a = p.aguardando();
        if (a.jogador === 1) { p.vezDaMeleca(); continue; }
        if (a.acao === 'responder') { assert.strictEqual(p.responder(0, L.responder(t.caras[seg], p.estado.ultima.pergunta)).ok, true); continue; }
        if (a.acao === 'perguntar') {
          const vivos = p.estado.dePe[0].map((v, i) => v ? i : -1).filter(i => i >= 0);
          const q = t.perguntas.find(x => !p.estado.feitas[0].includes(x) && L.utilidade(t.caras, p.estado.dePe[0], x) > 0 && L.utilidade(t.caras, p.estado.dePe[0], x) < vivos.length);
          if (!q || vivos.length === 1) p.palpite(0, vivos[0]); else p.perguntar(0, q);
          continue;
        }
        if (a.acao === 'descartar') { p.descartarTodos(0); p.pronto(0); }
      }
      assert.strictEqual(p.estado.fase, 'fim', nivel + ' ' + s);
    }
  }
});

test('salvar e voltar continua igual', () => {
  const p = QP.criar({ modo: 'meleca', nivel: 'medio', semente: 12, rnd: sorteio(2) });
  p.escolherSegredo(0, 4);
  const id = p.tabuleiro.perguntas[2];
  p.perguntar(0, id); p.vezDaMeleca(); p.descartarTodos(0);
  const q = QP.voltar(JSON.parse(JSON.stringify(p.salvar())));
  assert.deepStrictEqual(q.estado, p.estado);
  assert.deepStrictEqual(q.tabuleiro, p.tabuleiro);
  q.pronto(0);
  assert.deepStrictEqual(q.aguardando(), { jogador: 1, acao: 'perguntar' });
});

test('em rede: segredo do outro desconhecido, resposta e veredito vêm de fora', () => {
  const p = QP.criar({ modo: 'rede', nivel: 'facil', semente: 4, eu: 0 });
  p.escolherSegredo(0, 2);
  assert.strictEqual(p.estado.fase, 'segredo');
  p.marcarPronto(1);
  assert.strictEqual(p.estado.fase, 'jogo');
  const id = p.tabuleiro.perguntas[0];
  p.perguntar(0, id);
  assert.strictEqual(p.responder(1, true).ok, true);  // veio da rede: o outro aparelho já conferiu
  p.pronto(0);
  p.perguntar(1, id);
  assert.deepStrictEqual(p.responder(0, !L.responder(p.tabuleiro.caras[2], id)), { ok: false }); // o meu segredo eu confiro
  p.responder(0, L.responder(p.tabuleiro.caras[2], id)); p.pronto(1);
  assert.deepStrictEqual(p.palpite(0, 5), { pendente: true });
  assert.deepStrictEqual(p.aguardando(), { jogador: 1, acao: 'veredito' });
  p.veredito(false);
  assert.strictEqual(p.estado.vez, 1);
  assert.strictEqual(p.estado.dePe[0][5], false);
});

test('corpo inteiro: a partida guarda e volta com o corpo', () => {
  const p = QP.criar({ modo: 'passar', nivel: 'medio', semente: 3, corpo: true });
  assert.equal(p.tabuleiro.corpo, true);
  const q = QP.voltar(JSON.parse(JSON.stringify(p.salvar())));
  assert.deepEqual(q.tabuleiro, p.tabuleiro);
});

test('jeito livre contra a meleca: sem vez; pergunta quando quer, vira com o dedo, "Vou adivinhar!"', () => {
  const p = QP.criar({ modo: 'meleca', nivel: 'facil', semente: 9, livre: true, rnd: sorteio(3) });
  const t = p.tabuleiro, seg = p.estado.segredos[1];
  assert.strictEqual(p.estado.fase, 'jogo', 'começa direto: você não precisa escolher segredo');
  assert.deepStrictEqual(p.aguardando(), { jogador: 0, acao: 'livre', pendente: false });
  assert.strictEqual(p.vezDaMeleca(), null, 'a meleca não joga a vez dela');
  // pergunta duas seguidas, sem passar a vez; ela responde certo
  const [q1, q2] = t.perguntas;
  assert.strictEqual(p.perguntarLivre(0, q1), !!L.responder(t.caras[seg], q1));
  assert.strictEqual(p.perguntarLivre(0, q2), !!L.responder(t.caras[seg], q2));
  assert.strictEqual(codigo(() => p.perguntarLivre(0, q1)), 'pergunta', 'a mesma pergunta não repete');
  assert.strictEqual(codigo(() => p.perguntar(0, t.perguntas[3])), 'fase', 'no livre não tem a pergunta com vez');
  // nada vira sozinho: só com o dedo
  assert.ok(p.estado.dePe[0].every(Boolean));
  p.virar(0, 0); assert.strictEqual(p.estado.dePe[0][0], false); p.virar(0, 0);
  // palpite errado: a carta vira e continua; certo: ganha
  const errada = seg === 0 ? 1 : 0;
  assert.deepStrictEqual(p.palpite(0, errada), { acertou: false });
  assert.strictEqual(p.estado.dePe[0][errada], false);
  assert.strictEqual(p.estado.fase, 'jogo');
  assert.deepStrictEqual(p.palpite(0, seg), { acertou: true });
  assert.strictEqual(p.estado.fase, 'fim'); assert.strictEqual(p.estado.vencedor, 0);
  assert.strictEqual(p.aguardando(), null);
});

test('jeito livre em rede: palpite pendente até o veredito; um por vez; salvar e voltar', () => {
  const p = QP.criar({ modo: 'rede', nivel: 'medio', semente: 4, eu: 1, livre: true });
  p.escolherSegredo(1, 5); p.marcarPronto(0);
  assert.deepStrictEqual(p.aguardando(), { jogador: 1, acao: 'livre', pendente: false });
  // o outro (0) chuta o MEU: o meu segredo está aqui, então já sei
  assert.deepStrictEqual(p.palpite(0, 3), { acertou: false });
  assert.strictEqual(p.estado.fase, 'jogo');
  // eu chuto o dele: fica pendente
  assert.deepStrictEqual(p.palpite(1, 7), { pendente: true });
  assert.deepStrictEqual(p.aguardando(), { jogador: 1, acao: 'livre', pendente: true });
  assert.strictEqual(codigo(() => p.palpite(1, 8)), 'passo', 'um palpite pendente por vez');
  const q = QP.voltar(JSON.parse(JSON.stringify(p.salvar())));
  assert.strictEqual(q.livre, true);
  assert.deepStrictEqual(q.vereditoLivre(1, false), { acertou: false });
  assert.strictEqual(q.estado.dePe[1][7], false);
  q.palpite(1, 9);
  assert.deepStrictEqual(q.vereditoLivre(1, true), { acertou: true });
  assert.strictEqual(q.estado.vencedor, 1);
  assert.strictEqual(q.estado.ultima.palpite, 9);
});
