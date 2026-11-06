// Jogo em rede da Batalha Naval, sem internet: node --test batalha-naval/teste/rede.test.js
// Vários aparelhos de mentira (no mesmo processo) jogam uma partida inteira por um "canal" falso que pode perder
// mensagens, com relógio de mentira (os 3 s de pulso passam na hora). Confere que todos veem o mesmo diário, que cada
// resposta bate com a frota de verdade de quem levou o tiro e que sempre sai um vencedor.
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../logica.js');
const R = require('../rede.js');

function sorteio(semente) { let a = semente >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
let contador = 0;
function idTeste() { return ('t' + (contador++).toString(36) + 'xxxxxxxx').slice(0, 8); }

function Mundo(semente, perda = 0) {
  let t = 1000;
  const rnd = sorteio(semente), nos = [], fila = [];
  const M = { nos, rnd, agora: () => t, recebidas: 0 };
  M.no = (nome, op = {}) => {
    const k = nos.length, no = { nome, on: true, salvo: null, frota: null };
    no.criarPartida = dados => R.criar({
      id: op.id, nome, codigo: 'ABCD', host: !!op.host, nivel: op.nivel, dados,
      agora: M.agora, rnd,
      mandar: m => { if (!no.on) return; nos.forEach((o, j) => { if (j !== k && o.on && rnd() >= perda) fila.push([j, JSON.stringify(m)]); }); },
      salvar: d => { no.salvo = d; }
    });
    no.p = no.criarPartida(null);
    nos.push(no);
    return no;
  };
  M.entregar = () => { let g = 0; while (fila.length && g++ < 100000) { const [j, txt] = fila.shift(); if (nos[j].on) { M.recebidas++; nos[j].p.receber(JSON.parse(txt)); } } };
  M.passo = (ms = 500) => { M.entregar(); t += ms; nos.forEach(o => { if (o.on) o.p.tique(); }); M.entregar(); };
  M.recarregar = no => { no.p = no.criarPartida(no.salvo); no.p.entrar(); };
  return M;
}

// cada aparelho "joga": quando é a sua vez e não tem tiro esperando, atira numa casa livre de um adversário presente
function jogar(M, no) {
  const p = no.p, s = p.estado(), eu = p.meu();
  if (s.fase !== 'jogo' || s.vez !== eu || s.pend) return;
  const alvos = p.ativos().filter(i => i !== eu && !s.j[i].au);
  if (!alvos.length) return;
  const b = alvos[Math.floor(M.rnd() * alvos.length)], n = p.tamanho(), livres = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!p.jaNoLog(b, x, y)) livres.push([x, y]);
  const [x, y] = livres[Math.floor(M.rnd() * livres.length)];
  assert.ok(p.atirar(b, x, y), 'atirar recusou um tiro válido');
}

function montar(M, nomes, nivel) {
  const host = M.no(nomes[0], { host: true, nivel, id: idTeste() });
  host.p.entrar();
  const outros = nomes.slice(1).map(nm => { const o = M.no(nm, { id: idTeste() }); o.p.entrar(); return o; });
  for (let i = 0; i < 60 && !(host.p.estado().j.length === nomes.length && outros.every(o => o.p.meu() >= 0)); i++) M.passo();
  assert.equal(host.p.estado().j.length, nomes.length, 'nem todos entraram na sala');
  for (const o of M.nos) {
    assert.equal(o.p.estado().nivel, nivel, 'nível chegou para ' + o.nome);
    o.frota = L.aleatoria(nivel, M.rnd);
    assert.ok(o.p.definirFrota(o.frota));
    assert.ok(o.p.pronto(true));
  }
  for (let i = 0; i < 60 && !host.p.podeComecar(); i++) M.passo();
  assert.ok(host.p.podeComecar(), 'anfitrião não pôde começar (todos prontos?)');
  assert.ok(host.p.comecar());
  for (let i = 0; i < 60 && !M.nos.every(o => o.p.estado().fase === 'jogo'); i++) M.passo();
  return host;
}

function conferir(M, vivos) {
  const ref = vivos[0].p.estado();
  for (const o of vivos) {
    const s = o.p.estado();
    assert.equal(s.fase, 'fim', o.nome + ' não chegou no fim (fase ' + s.fase + ')');
    assert.equal(s.venc, ref.venc, o.nome + ' viu outro vencedor');
    assert.deepEqual(s.log, ref.log, o.nome + ' tem outro diário de tiros');
  }
  // cada resposta bate com a frota de verdade
  const tiros = {};
  for (const e of ref.log) {
    const [a, b, x, y, rc] = e, dono = M.nos.find(o => o.p.estado().id === ref.j[b].id);
    tiros[b] = tiros[b] || {};
    const res = L.resolver(dono.frota, tiros[b], x, y); tiros[b][L.chave(x, y)] = 1;
    assert.equal(rc, L.R[res.r], `resposta errada em ${L.coord(x, y)} no mar de ${dono.nome}`);
    assert.notEqual(a, b);
  }
  assert.ok(ref.venc >= 0, 'sem vencedor');
  assert.ok(!ref.j[ref.venc].f, 'o vencedor não pode ter a frota afundada');
  return ref;
}

function ateOFim(M, max = 20000, antes) {
  for (let i = 0; i < max; i++) {
    if (antes) antes(i);
    M.nos.forEach(o => { if (o.on && !o.p.estado().saiu) jogar(M, o); });
    M.passo(200);
    const vivos = M.nos.filter(o => o.on && !o.p.estado().saiu);
    if (vivos.every(o => o.p.estado().fase === 'fim')) return i;
  }
  assert.fail('a partida não terminou');
}

test('validar: só passa mensagem conhecida e certinha', () => {
  const v = R.validar;
  assert.equal(v(null), null); assert.equal(v('oi'), null); assert.equal(v([]), null);
  assert.equal(v({ t: 'oi', de: 'curto' }), null);
  assert.equal(v({ t: 'hack', de: 'abcdefgh' }), null);
  assert.equal(v({ t: 'oi', de: 'abcdefgh', nome: '<img src=x onerror=alert(1)>Ana' }).nome.includes('<'), false);
  assert.equal(v({ t: 'oi', de: 'abcdefgh', nome: 'Um nome muito comprido demais' }).nome.length, 16);
  assert.equal(v({ t: 'tiro', de: 'abcdefgh', alvo: 1, x: 12, y: 0, n: 0 }), null, 'fora do tabuleiro');
  assert.equal(v({ t: 'tiro', de: 'abcdefgh', alvo: 1, x: 1.5, y: 0, n: 0 }), null, 'não inteiro');
  assert.equal(v({ t: 'tiro', de: 'abcdefgh', alvo: '1', x: 1, y: 0, n: 0 }), null, 'texto no lugar de número');
  assert.deepEqual(v({ t: 'tiro', de: 'abcdefgh', alvo: 1, x: 3, y: 4, n: 7, extra: 'x' }), { t: 'tiro', de: 'abcdefgh', alvo: 1, x: 3, y: 4, n: 7 });
  assert.equal(v({ t: 'resp', de: 'abcdefgh', a: 0, x: 1, y: 1, n: 0, r: 2 }), null, 'afundou sem o navio');
  assert.equal(v({ t: 'resp', de: 'abcdefgh', a: 0, x: 1, y: 1, n: 0, r: 2, nv: [10, 0, 4, 1] }), null, 'navio saindo do mar');
  assert.ok(v({ t: 'resp', de: 'abcdefgh', a: 0, x: 1, y: 1, n: 0, r: 2, nv: [0, 1, 4, 1] }));
  assert.equal(v({ t: 'resp', de: 'abcdefgh', a: 0, x: 1, y: 1, n: 0, r: 5 }), null);
  assert.equal(v({ t: 'frota', de: 'abcdefgh', navios: [[0, 0, 9, 1]] }), null);
  assert.equal(v({ t: 'nao', de: 'abcdefgh', para: 'bcdefghi', motivo: 'xss' }), null);
  const estado = { t: 'estado', de: 'abcdefgh', era: 1, ep: 3, h: 0, fase: 'jogo', nivel: 'facil', vez: 1, seq: 1, venc: -1,
    j: [{ id: 'abcdefgh', nome: 'Ana', p: 1, f: 0, au: 0, s: 0 }, { id: 'bcdefghi', nome: 'Beto', p: 1, f: 0, au: 0, s: 0 }], log: [[0, 1, 2, 3, 0]] };
  assert.ok(v(estado));
  assert.equal(v({ ...estado, nivel: 'impossivel' }), null);
  assert.equal(v({ ...estado, fase: 'pausa' }), null);
  assert.equal(v({ ...estado, seq: 2 }), null, 'seq diferente do diário');
  assert.equal(v({ ...estado, log: [[0, 1, 8, 3, 0]], seq: 1 }), null, 'tiro fora do 8×8');
  assert.equal(v({ ...estado, log: [[0, 0, 1, 1, 0]] }), null, 'atirou em si mesmo');
  assert.equal(v({ ...estado, log: [[0, 1, 1, 1, 0], [0, 1, 1, 1, 0]], seq: 2 }), null, 'mesma casa duas vezes');
  assert.equal(v({ ...estado, j: [...estado.j, estado.j[0]] }), null, 'id repetido');
  assert.equal(v({ ...estado, j: [1, 2, 3, 4, 5].map(i => ({ id: 'abcdefg' + i })) }), null, 'mais de 4');
  assert.equal(v({ ...estado, h: 5 }), null);
  const comNome = v({ ...estado, j: [{ ...estado.j[0], nome: '<script>x</script>' }, estado.j[1]] });
  assert.ok(!/[<>]/.test(comNome.j[0].nome));
  assert.match(R.codigoNovo(), /^[A-Z]{4}$/);
  assert.match(R.idNovo(), /^[a-z0-9]{8}$/);
});

for (const nivel of ['facil', 'medio', 'dificil']) {
  test('2 aparelhos jogam uma partida inteira (' + nivel + ')', () => {
    const M = Mundo(11 + nivel.length);
    montar(M, ['Ana', 'Beto'], nivel);
    ateOFim(M);
    conferir(M, M.nos);
  });
}

test('2 aparelhos com 30% das mensagens perdidas: ainda termina certinho', () => {
  const M = Mundo(77, 0.3);
  montar(M, ['Ana', 'Beto'], 'facil');
  ateOFim(M);
  conferir(M, M.nos);
});

test('3 e 4 jogadores, todos contra todos, com perdas: o último que boia ganha', () => {
  for (const [nomes, sem] of [[['Ana', 'Beto', 'Caio'], 5], [['Ana', 'Beto', 'Caio', 'Duda'], 9]]) {
    const M = Mundo(sem, 0.15);
    montar(M, nomes, 'facil');
    ateOFim(M);
    const ref = conferir(M, M.nos);
    assert.equal(ref.j.filter(p => p.f).length, nomes.length - 1, 'todos menos um afundados');
  }
});

test('5º jogador não entra (sala cheia) e quem chega depois do começo também não', () => {
  const M = Mundo(3);
  const host = M.no('Ana', { host: true, nivel: 'facil', id: idTeste() }); host.p.entrar();
  for (const nm of ['B', 'C', 'D']) M.no(nm, { id: idTeste() }).p.entrar();
  M.passo(); M.passo();
  const quinto = M.no('E', { id: idTeste() }); quinto.p.entrar(); M.passo(); M.passo();
  assert.equal(host.p.estado().j.length, 4);
  assert.equal(quinto.p.estado().nao, 'cheia');
});

test('recarregar a página no meio da partida: volta pelo mesmo código e continua', () => {
  const M = Mundo(21, 0.1);
  const host = montar(M, ['Ana', 'Beto'], 'medio');
  const beto = M.nos[1];
  let recarregou = 0;
  ateOFim(M, 20000, i => {
    if (i === 40 || i === 90) { M.recarregar(beto); recarregou++; }      // o Beto recarrega duas vezes
    if (i === 140) { M.recarregar(host); recarregou++; }                  // e o anfitrião também
  });
  assert.equal(recarregou, 3);
  conferir(M, M.nos);
});

test('quem sai pelo botão: numa dupla o outro ganha; num trio a vez pula a pessoa', () => {
  let M = Mundo(31);
  montar(M, ['Ana', 'Beto'], 'facil');
  for (let i = 0; i < 10; i++) { M.nos.forEach(o => jogar(M, o)); M.passo(); }
  M.nos[1].p.sair(); M.passo(); M.passo();
  assert.equal(M.nos[0].p.estado().fase, 'fim');
  assert.equal(M.nos[0].p.estado().venc, 0);

  M = Mundo(32);
  montar(M, ['Ana', 'Beto', 'Caio'], 'facil');
  for (let i = 0; i < 10; i++) { M.nos.forEach(o => jogar(M, o)); M.passo(); }
  M.nos[2].p.sair();
  ateOFim(M);
  const ref = conferir(M, M.nos.slice(0, 2));
  assert.equal(ref.j[2].s, 1);
  assert.notEqual(ref.venc, 2);
});

test('anfitrião sai pelo botão no meio: passa o comando e os outros terminam', () => {
  const M = Mundo(41, 0.1);
  montar(M, ['Ana', 'Beto', 'Caio'], 'facil');
  for (let i = 0; i < 15; i++) { M.nos.forEach(o => jogar(M, o)); M.passo(); }
  M.nos[0].p.sair();
  ateOFim(M);
  const ref = conferir(M, M.nos.slice(1));
  assert.equal(ref.j[0].s, 1);
  assert.ok(M.nos[1].p.souHost() || M.nos[2].p.souHost(), 'ninguém virou anfitrião');
});

test('anfitrião some (sem avisar): outro assume; ao voltar, ele vira jogador e a partida segue', () => {
  const M = Mundo(51);
  const host = montar(M, ['Ana', 'Beto', 'Caio'], 'facil');
  for (let i = 0; i < 12; i++) { M.nos.forEach(o => jogar(M, o)); M.passo(); }
  host.on = false;                                                     // o celular da Ana desligou
  for (let i = 0; i < 50; i++) { M.nos.forEach(o => o.on && jogar(M, o)); M.passo(); }
  const beto = M.nos[1];
  assert.ok(beto.p.souHost(), 'o Beto devia ter assumido');
  assert.equal(beto.p.estado().j[0].au, 1, 'Ana marcada como fora da conexão');
  host.on = true; M.recarregar(host);                                  // a Ana voltou
  for (let i = 0; i < 10; i++) M.passo();
  assert.ok(!host.p.souHost(), 'a Ana voltou como jogadora');
  assert.equal(beto.p.estado().j[0].au, 0);
  ateOFim(M);
  conferir(M, M.nos);
});

test('alguém some de vez: a vez pula, e o anfitrião pode continuar sem a pessoa', () => {
  const M = Mundo(61);
  const host = montar(M, ['Ana', 'Beto', 'Caio'], 'facil');
  M.nos[2].on = false;
  for (let i = 0; i < 80; i++) { M.nos.forEach(o => o.on && jogar(M, o)); M.passo(); }
  assert.equal(host.p.estado().j[2].au, 1);
  assert.notEqual(host.p.estado().vez, 2, 'a vez não pode ficar parada em quem sumiu');
  host.p.continuarSem(2);
  ateOFim(M);
  const ref = conferir(M, M.nos.slice(0, 2));
  assert.equal(ref.j[2].s, 1);
});

test('fim: todos mostram a frota e o anfitrião pode jogar de novo na mesma sala', () => {
  const M = Mundo(71);
  const host = montar(M, ['Ana', 'Beto'], 'facil');
  ateOFim(M);
  for (let i = 0; i < 8; i++) M.passo(1000);
  for (const o of M.nos) assert.equal(Object.keys(o.p.estado().revel).length, 2, o.nome + ' não viu as duas frotas');
  assert.ok(host.p.revanche());
  M.passo(); M.passo();
  for (const o of M.nos) { const s = o.p.estado(); assert.equal(s.fase, 'sala'); assert.equal(s.log.length, 0); assert.ok(s.j.every(p => !p.p)); }
});

test('tiro fora da vez, repetido ou de quem não está na sala não muda nada', () => {
  const M = Mundo(81);
  const host = montar(M, ['Ana', 'Beto'], 'facil');
  const s = host.p.estado(), naoVez = 1 - s.vez, quem = M.nos[naoVez];
  assert.equal(quem.p.atirar(1 - naoVez, 0, 0), false, 'atirar fora da vez');
  // mensagem forjada: alguém de fora manda tiro e resposta
  host.p.receber({ t: 'tiro', de: 'zzzzzzzz', alvo: 1, x: 0, y: 0, n: 0 });
  host.p.receber({ t: 'resp', de: 'zzzzzzzz', a: 0, x: 0, y: 0, n: 0, r: 0 });
  M.nos[1].p.receber({ t: 'estado', de: 'zzzzzzzz', era: 1, ep: 99999, h: 0, fase: 'fim', nivel: 'facil', vez: -1, seq: 0, venc: 0, log: [], j: [{ id: 'zzzzzzzz', nome: 'x' }] });
  M.passo();
  assert.equal(host.p.estado().log.length, 0);
  assert.equal(M.nos[1].p.estado().fase, 'jogo', 'estado de um estranho não pode valer');
  const vez = M.nos[s.vez];
  assert.ok(vez.p.atirar(1 - s.vez, 0, 0));
  assert.equal(vez.p.atirar(1 - s.vez, 1, 1), false, 'dois tiros de uma vez');
  M.passo();
  assert.equal(host.p.estado().log.length, 1);
});

test('40 partidas sorteadas (2 a 4 jogadores, até 30% de perda, recargas e anfitrião caindo): sempre terminam certinhas', () => {
  for (let sem = 1; sem <= 40; sem++) {
    const k = 2 + sem % 3, perda = [0, 0.15, 0.3][sem % 3];
    const M = Mundo(1000 + sem * 7, perda);
    montar(M, ['A', 'B', 'C', 'D'].slice(0, k), ['facil', 'medio'][sem % 2]);
    let fora = null, volta = 0;
    ateOFim(M, 60000, i => {
      if (!fora && M.rnd() < 0.004) { fora = M.nos.find(o => o.p.souHost()) || M.nos[0]; fora.on = false; volta = i + 50 + Math.floor(M.rnd() * 200); }
      else if (fora && i === volta) { fora.on = true; M.recarregar(fora); fora = null; }
      else if (M.rnd() < 0.005) M.recarregar(M.nos[Math.floor(M.rnd() * k)]);
    });
    if (fora) { fora.on = true; M.recarregar(fora); for (let q = 0; q < 40; q++) M.passo(500); }
    conferir(M, M.nos);
  }
});
