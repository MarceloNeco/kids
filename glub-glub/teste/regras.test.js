// Regras do GLUB GLUB, sem tela: node --test glub-glub/teste/regras.test.js (rodar da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../regras.js');

const DOIS = (n0 = 'facil', n1 = 'facil', r0 = false, r1 = true) =>
  [{ lado: 'esq', nivel: n0, robo: r0 }, { lado: 'dir', nivel: n1, robo: r1 }];
// lago vazio e parado: nada de bicho novo, bolha, bicho raro nem robô atrapalhando
function lagoVazio(op = {}) {
  const E = R.criar(Object.assign({ semente: 7, aspecto: 16 / 9, jogadores: DOIS('facil', 'facil', false, false) }, op));
  E.bichos = []; E.repor = false; E.proxBolha = Infinity; E.proxRaro = Infinity; E.proxPiranha = Infinity; E.bonusFeito = true;
  return E;
}
function rodar(E, seg, dt = 1 / 60) {
  const ev = [];
  for (let t = 0; t < seg; t += dt) ev.push(...R.passo(E, dt));
  return ev;
}
function ateEvento(E, tipo, max = 20) {
  for (let t = 0; t < max; t += 1 / 60) {
    const ev = R.passo(E, 1 / 60).filter(e => e.tipo === tipo);
    if (ev.length) return { ev: ev[0], t };
  }
  return null;
}
// ponto do caminho reto do anzol a "d" unidades do repouso, no ângulo "ang"
function noCaminho(E, j, ang, d) {
  const a = E.j[j].anzol, p = R.repouso(E, j, ang);
  return { x: p.x + Math.sin(ang) * d, y: p.y + Math.cos(ang) * d, a };
}

test('mergulha em linha reta no ângulo do momento', () => {
  const E = lagoVazio(), ang = 0.5;
  assert.equal(R.pescar(E, 0, ang), true);
  const p0 = { x: E.j[0].anzol.x, y: E.j[0].anzol.y };
  rodar(E, 0.4);
  const a = E.j[0].anzol;
  assert.equal(a.fase, 'desce');
  assert.ok(Math.abs((a.x - p0.x) / (a.y - p0.y) - Math.tan(ang)) < 0.01, 'inclinação ' + (a.x - p0.x) / (a.y - p0.y));
});

test('pega o primeiro bicho que encostar', () => {
  const E = lagoVazio(), ang = 0.1;
  const raso = noCaminho(E, 0, ang, 300), fundo = noCaminho(E, 0, ang, 600);
  R.colocar(E, 'lambari', raso.x, raso.y, { vel: 0 });
  R.colocar(E, 'tubarao', fundo.x, fundo.y, { vel: 0 });
  R.pescar(E, 0, ang);
  const r = ateEvento(E, 'fisgou');
  assert.ok(r, 'fisgou alguma coisa');
  assert.equal(r.ev.bicho.id, 'lambari');
  assert.equal(E.j[0].anzol.fase, 'sobe');
  const p = ateEvento(E, 'pegou');
  assert.equal(p.ev.bicho.id, 'lambari');
  assert.equal(p.ev.pontos, 1);
  assert.equal(E.j[0].pontos, 1);
});

test('chega ao fundo sem pegar nada, sobe vazio e volta a balançar', () => {
  const E = lagoVazio();
  R.pescar(E, 0, 0);
  assert.ok(ateEvento(E, 'vazio'), 'evento vazio');
  assert.equal(E.j[0].anzol.fase, 'sobe');
  rodar(E, 4);
  assert.equal(E.j[0].anzol.fase, 'balanca');
  assert.equal(E.j[0].pontos, 0);
});

test('⬆️ na descida desiste e recolhe vazio', () => {
  const E = lagoVazio();
  R.pescar(E, 0, 0); rodar(E, 0.3);
  R.subir(E, 0, true);
  const ev = rodar(E, 1 / 60);
  assert.equal(E.j[0].anzol.fase, 'sobe');
  assert.equal(E.j[0].anzol.presos.length, 0);
  assert.ok(ev.some(e => e.tipo === 'vazio'));
});

function tempoDeSubida(id, segurando) {
  const E = lagoVazio(), ang = 0;
  const p = noCaminho(E, 0, ang, 500);
  R.colocar(E, id, p.x, p.y, { vel: 0 });
  R.pescar(E, 0, ang);
  ateEvento(E, 'fisgou');
  if (segurando) R.subir(E, 0, true);
  return ateEvento(E, 'pegou').t;
}
test('bicho pesado sobe mais devagar; ⬆️ segurando acelera', () => {
  const leve = tempoDeSubida('lambari', false), pesado = tempoDeSubida('tubarao', false), puxado = tempoDeSubida('tubarao', true);
  assert.ok(pesado > leve * 1.3, `tubarão ${pesado} × lambari ${leve}`);
  assert.ok(puxado * 2 <= pesado, `puxando ${puxado} × sem puxar ${pesado}`);
});

test('apertar 🎣 de novo durante o mergulho não faz outro mergulho', () => {
  const E = lagoVazio();
  assert.equal(R.pescar(E, 0, 0.2), true);
  rodar(E, 0.2);
  const y = E.j[0].anzol.y;
  assert.equal(R.pescar(E, 0, -0.6), false);
  rodar(E, 0.1);
  assert.ok(E.j[0].anzol.y > y, 'continua descendo no mesmo caminho');
});

test('o toque de um jogador não mexe no anzol do outro', () => {
  const E = lagoVazio();
  R.pescar(E, 1, 0); R.subir(E, 1, true);
  rodar(E, 0.2);
  assert.equal(E.j[0].anzol.fase, 'balanca');
});

test('os dois anzóis no mesmo bicho: fica com quem encostou primeiro', () => {
  const E = lagoVazio();
  // a linha do mergulho sempre passa pela ponta da vara: mirando da ponta, os dois anzóis passam pelo mesmo bicho
  const p0 = R.ponta(E, 0), p1 = R.ponta(E, 1);
  const alvo = { x: (p0.x + p1.x) / 2, y: 700 };
  const ang0 = Math.atan2(alvo.x - p0.x, alvo.y - p0.y), ang1 = Math.atan2(alvo.x - p1.x, alvo.y - p1.y);
  R.colocar(E, 'pacu', alvo.x, alvo.y, { vel: 0 });
  R.pescar(E, 0, ang0); rodar(E, 0.15); R.pescar(E, 1, ang1);
  const ev = rodar(E, 3).filter(e => e.tipo === 'fisgou');
  assert.equal(ev.length, 1);
  assert.equal(ev[0].j, 0);
});

test('mais fundo vale mais (bichos), e todo bicho tem nome PT, EN e ES', () => {
  const bichos = R.BICHOS.filter(b => b.tipo === 'bicho');
  for (let f = 1; f < 6; f++) {
    const daqui = bichos.filter(b => b.faixa === f).map(b => b.pontos), debaixo = bichos.filter(b => b.faixa > f).map(b => b.pontos);
    if (daqui.length && debaixo.length) assert.ok(Math.max(...daqui) <= Math.min(...debaixo), 'faixa ' + f);
  }
  for (const b of R.BICHOS) assert.ok(b.nome.pt && b.nome.en && b.nome.es, b.id);
  assert.equal(R.BICHOS.find(b => b.raro).pontos, 500);
});

test('relógio de 60 s: termina com o evento fim', () => {
  const E = lagoVazio();
  assert.equal(E.tempo, 60);
  const r = ateEvento(E, 'fim', 61);
  assert.ok(r && Math.abs(r.t - 60) < 0.05, 'fim em ' + (r && r.t));
  assert.equal(R.pescar(E, 0, 0), false, 'depois do fim não pesca');
});

test('balde cheio: +10 s e um pedido novo', () => {
  const E = lagoVazio(), ang = 0;
  E.j[0].balde.pedido = [{ id: 'lambari', falta: 1 }];
  const p = noCaminho(E, 0, ang, 300);
  R.colocar(E, 'lambari', p.x, p.y, { vel: 0 });
  R.pescar(E, 0, ang);
  const antes = E.tempo, r = ateEvento(E, 'balde');
  assert.ok(r, 'evento balde');
  assert.ok(Math.abs(E.tempo - (antes - r.t + 10)) < 0.05, 'ganhou 10 s');
  assert.equal(E.j[0].balde.cheios, 1);
  assert.ok(E.j[0].balde.pedido.every(x => x.falta > 0), 'pedido novo');
});

test('"Limpa o Rio!": uma vez, quando faltam 32 s, por 15 s, só lixo no lago', () => {
  const E = R.criar({ semente: 3, aspecto: 16 / 9, jogadores: DOIS(), rodada: 'limpa' });
  const ini = ateEvento(E, 'bonus', 61);
  assert.ok(ini && Math.abs(E.tempo - 32) < 0.05, 'começa com 32 s');
  rodar(E, 2);
  assert.ok(E.bichos.length > 0 && E.bichos.every(b => b.tipo === 'lixo' || b.preso != null), 'só lixo');
  const fim = ateEvento(E, 'bonusFim', 20);
  assert.ok(fim && Math.abs(E.tempo - 17) < 0.1, 'dura 15 s');
  assert.ok(E.bichos.some(b => b.tipo === 'bicho'), 'os peixes voltam');
  assert.equal(rodar(E, 17).filter(e => e.tipo === 'bonus').length, 0, 'só uma vez');
});

test('nível de cada jogador: o lago segue o mais fácil; balanço e balde seguem o de cada um', () => {
  const E = R.criar({ semente: 5, aspecto: 16 / 9, jogadores: DOIS('dificil', 'facil', false, false) });
  assert.equal(E.cardume, R.NIVEIS.facil.cardume);
  assert.equal(E.bichos.filter(b => b.faixa <= 2).length, R.NIVEIS.facil.cardume);
  const soma = j => E.j[j].balde.pedido.reduce((s, x) => s + x.falta, 0);
  assert.equal(soma(0), R.NIVEIS.dificil.pedido.total);
  assert.equal(soma(1), R.NIVEIS.facil.pedido.total);
  E.proxBolha = Infinity;
  let m0 = 0, m1 = 0;
  for (let t = 0; t < 8; t += 1 / 60) { R.passo(E, 1 / 60); m0 = Math.max(m0, Math.abs(E.j[0].anzol.ang)); m1 = Math.max(m1, Math.abs(E.j[1].anzol.ang)); }
  assert.ok(Math.abs(m0 - R.NIVEIS.dificil.angMax) < 0.03, 'balanço do difícil ' + m0);
  assert.ok(Math.abs(m1 - R.NIVEIS.facil.angMax) < 0.03, 'balanço do fácil ' + m1);
});

test('robô do difícil pesca mais que o do fácil', () => {
  let f = 0, d = 0;
  for (let s = 1; s <= 30; s++) {
    const E = R.criar({ semente: s, aspecto: 16 / 9, jogadores: [{ lado: 'esq', nivel: 'facil', robo: true }, { lado: 'dir', nivel: 'dificil', robo: true }] });
    rodar(E, 62, 1 / 30);
    f += E.j[0].pontos; d += E.j[1].pontos;
  }
  assert.ok(d > f, `difícil ${d} × fácil ${f}`);
});

test('fim com bicho subindo: conta se chegar em até 1,5 s, depois não entra mais nada', () => {
  const pegar = (folga) => {
    const E = lagoVazio(), ang = 0;
    E.tempo = 3;
    const p = noCaminho(E, 0, ang, 650);
    R.colocar(E, 'tubarao', p.x, p.y, { vel: 0 });
    R.pescar(E, 0, ang);
    ateEvento(E, 'fisgou');
    E.tempo = folga;          // o relógio acaba logo depois de fisgar
    return { E, ev: rodar(E, 8) };
  };
  const a = pegar(0.01);       // o tubarão demora mais de 1,5 s para subir
  assert.ok(a.ev.some(e => e.tipo === 'fim'));
  assert.equal(a.ev.filter(e => e.tipo === 'pegou').length, 0, 'chegou tarde demais');
  const b = pegar(3);          // tempo de sobra: chega antes do fim
  assert.equal(b.ev.filter(e => e.tipo === 'pegou').length, 1);
});

test('placar: pontos, total do time e vencedor', () => {
  const E = lagoVazio();
  E.j[0].pontos = 30; E.j[1].pontos = 12;
  assert.deepEqual(R.placar(E), { pontos: [30, 12], time: 42, vencedor: 0 });
  E.j[1].pontos = 30;
  assert.equal(R.placar(E).vencedor, -1);
});

test('girar a tela mantém tudo no mesmo lugar, proporcionalmente', () => {
  const E = lagoVazio({ aspecto: 16 / 9 });
  R.colocar(E, 'pacu', E.W * 0.25, 700, { vel: 0 });
  R.redimensionar(E, 9 / 16);
  assert.ok(Math.abs(E.W - 1000 * 9 / 16) < 1e-9);
  assert.ok(Math.abs(E.bichos[0].x / E.W - 0.25) < 1e-9);
  assert.ok(E.bichos[0].y > E.sup && E.bichos[0].y < 1000);
});

test('bolha de poder: anzol ligeiro deixa o mergulho duas vezes mais rápido', () => {
  const E = lagoVazio(), ang = 0;
  const p = noCaminho(E, 0, ang, 200);
  R.colocarBolha(E, 'ligeiro', p.x, p.y);
  R.pescar(E, 0, ang);
  const r = ateEvento(E, 'poder');
  assert.equal(r.ev.poder, 'ligeiro');
  assert.equal(E.j[0].anzol.fase, 'desce', 'a bolha estoura e o anzol continua');
  rodar(E, 5);
  const t = (() => { R.pescar(E, 0, 0); return ateEvento(E, 'vazio').t; })();
  E.j[0].poder = null; rodar(E, 5);
  const t2 = (() => { R.pescar(E, 0, 0); return ateEvento(E, 'vazio').t; })();
  assert.ok(Math.abs(t2 / t - 2) < 0.15, `ligeiro ${t} × normal ${t2}`);
});

test('bolha de poder: a rede pega até 3 bichos juntos', () => {
  const E = lagoVazio(), ang = 0;
  const p = noCaminho(E, 0, ang, 400);
  R.colocar(E, 'pacu', p.x, p.y, { vel: 0 });
  R.colocar(E, 'bagre', p.x + 40, p.y + 10, { vel: 0 });
  R.colocar(E, 'traira', p.x - 45, p.y - 5, { vel: 0 });
  R.colocar(E, 'tilapia', p.x + 300, p.y, { vel: 0 });
  E.j[0].poder = { id: 'rede', ate: Infinity };
  R.pescar(E, 0, ang);
  ateEvento(E, 'fisgou');
  assert.equal(E.j[0].anzol.presos.length, 3);
  assert.equal(E.j[0].poder, null, 'a rede foi usada');
});

/* ---------- 0.1.3: rodadas especiais, piranhas, gigantes, fundo mais rápido ---------- */
// lago vazio já dentro da rodada especial, sem nada novo aparecendo sozinho
function naRodada(rodada) {
  const E = lagoVazio({ rodada });
  E.bonusFeito = false; E.tempo = 32.5;
  const r = ateEvento(E, 'bonus', 2);
  assert.ok(r && r.ev.rodada === rodada, 'começou a rodada ' + rodada);
  E.bichos = E.bichos.filter(o => o.tipo === 'mae'); E.bonus.prox = Infinity; E.bonus.fim = E.t + 100;
  return E;
}

test('rodada especial: sorteada em cada partida (as cinco aparecem) ou escolhida', () => {
  const vistas = new Set();
  for (let s = 1; s <= 60; s++) vistas.add(R.criar({ semente: s, aspecto: 16 / 9, jogadores: DOIS() }).rodada);
  assert.deepEqual([...vistas].sort(), [...R.RODADAS].sort());
  assert.equal(R.criar({ semente: 1, aspecto: 16 / 9, jogadores: DOIS(), rodada: 'gigante' }).rodada, 'gigante');
});

test('♻️ Limpa o Rio: a rede pega até 3 lixos de uma vez', () => {
  const E = naRodada('limpa'), ang = 0.2, p = noCaminho(E, 0, ang, 400);
  ['pet', 'lata', 'chinelo', 'pneu'].forEach((id, i) => R.colocar(E, id, p.x + (i - 1.5) * 40, p.y + (i % 2) * 20, { vel: 0 }));
  const longe = R.colocar(E, 'lata', p.x + 600, p.y, { vel: 0 });   // longe da rede: fica
  R.pescar(E, 0, ang);
  const ev = rodar(E, 1.5).filter(e => e.tipo === 'fisgou');
  assert.equal(ev.length, 3, 'pegou 3: ' + ev.map(e => e.bicho.id));
  assert.equal(longe.preso, null);
  assert.equal(E.j[0].poder, null, 'não gasta poder');
});

test('🛟 Socorro na Água: a boia cai onde a linha aponta; perto do banhista, ele é salvo e vai para a margem', () => {
  const E = naRodada('socorro'), ang = 0.4, x = R.ondeCai(E, 0, ang);
  const b = R.colocar(E, 'menina', x + 20, E.sup, { vel: 0 });
  const longe = R.colocar(E, 'menino', x + 500, E.sup, { vel: 0 });
  assert.ok(R.ondeCai(E, 0, 0.6) > R.ondeCai(E, 0, 0.2), 'mais inclinada, mais longe');
  R.pescar(E, 0, ang);
  assert.equal(E.j[0].anzol.fase, 'joga');
  const r = ateEvento(E, 'salvou', 3);
  assert.ok(r, 'salvou');
  assert.equal(r.ev.id, 'menina'); assert.equal(E.j[0].pontos, 10);
  assert.equal(b.salvo, 0); assert.equal(longe.salvo, undefined);
  const x0 = b.x;
  rodar(E, 1);
  assert.equal(E.j[0].anzol.fase, 'balanca', 'a boia voltou');
  assert.ok(b.x < x0, 'boiando para a margem do Juca');
  rodar(E, 20);
  assert.ok(!E.bichos.includes(b), 'chegou à margem');
  // boia longe de todo mundo: volta vazia
  R.pescar(E, 0, -0.6);
  assert.ok(ateEvento(E, 'vazio', 3));
});

test('🐢 Leva os Filhotes: pesca o filhote e leva até a mamãe tartaruga', () => {
  const E = naRodada('filhotes'), ang = 0.15;
  const mae = E.bichos.find(o => o.tipo === 'mae');
  assert.ok(mae, 'a mamãe está no fundo');
  mae.v = 0;
  const p = noCaminho(E, 0, ang, 150);
  R.colocar(E, 'filhote', p.x, p.y, { vel: 0 });
  R.pescar(E, 0, ang);
  const f = ateEvento(E, 'filhote', 6);
  assert.ok(f, 'filhote no anzol');
  assert.equal(E.j[0].anzol.levando, 'filhote');
  assert.equal(E.j[0].pontos, 0, 'ainda não vale');
  // sem a mamãe no caminho: chega ao fundo e o filhote continua no anzol
  mae.x = -9999;
  R.pescar(E, 0, ang); assert.ok(ateEvento(E, 'vazio', 6)); rodar(E, 4);
  assert.equal(E.j[0].anzol.levando, 'filhote');
  const q = noCaminho(E, 0, ang, 500); mae.x = q.x; mae.fy = (q.y - E.sup) / (1000 - E.sup);
  R.pescar(E, 0, ang);
  const e = ateEvento(E, 'entregou', 6);
  assert.ok(e, 'entregou');
  assert.equal(E.j[0].pontos, 15); assert.equal(E.j[0].anzol.levando, null);
  assert.ok(E.bichos.some(o => o.tipo === 'filhote' && o.entregue), 'o filhote nada com a mãe');
});

test('⭐ Chuva de Estrelas: as estrelas caem do céu, afundam devagar e valem pontos', () => {
  const E = naRodada('estrelas');
  E.bonus.prox = E.t; rodar(E, 2);
  const es = E.bichos.filter(o => o.tipo === 'estrela');
  assert.ok(es.length >= 3, 'caindo: ' + es.length);
  const fy = es.map(o => o.fy); rodar(E, 0.5);
  assert.ok(es.every((o, i) => o.fy > fy[i] || o.fy >= 0.96), 'afundam');
  E.bonus.prox = Infinity; E.bichos = [];
  const ang = 0, p = noCaminho(E, 0, ang, 300), o = R.colocar(E, 'estrela', p.x, p.y, { vel: 0 });
  o.fy = 0.96; o.y = p.y; o.noFundo = E.t;
  R.pescar(E, 0, ang);
  const r = ateEvento(E, 'pegou', 8);
  assert.ok(r && r.ev.bicho.id === 'estrela' && r.ev.pontos === 5);
});

test('🐉 O Gigante: precisa de 3 acertos; no terceiro, é pescado e vale muito', () => {
  const E = naRodada('gigante');
  E.bonus.prox = E.t; rodar(E, 1 / 60); E.bonus.prox = Infinity;
  const g = E.bichos.find(o => o.tipo === 'chefe');
  assert.ok(g, 'o gigante chegou');
  g.v = 0;
  const ang = 0.3, p = noCaminho(E, 0, ang, 480);
  const pts = [];
  for (let n = 1; n <= 3; n++) {
    g.x = p.x; g.fy = (p.y - E.sup) / (1000 - E.sup);
    R.pescar(E, 0, ang);
    const r = ateEvento(E, n < 3 ? 'acertou' : 'chefe', 6);
    assert.ok(r, 'acerto ' + n);
    pts.push(E.j[0].pontos);
    rodar(E, 4);
  }
  assert.deepEqual(pts, [10, 20, 120]);
  assert.equal(g.vencido, true);
});

test('piranhas cortam a linha: o bicho preso foge e a vara fica 2 s sem anzol', () => {
  const E = lagoVazio(), ang = 0;
  const p = noCaminho(E, 0, ang, 500), q = noCaminho(E, 0, ang, 200);
  const peixe = R.colocar(E, 'bagre', p.x, p.y, { vel: 0 });
  R.pescar(E, 0, ang);
  assert.ok(ateEvento(E, 'fisgou', 4));
  const pir = R.colocar(E, 'piranha', q.x, q.y, { vel: 0 });
  pir.tipo = 'piranha';
  const r = ateEvento(E, 'cortou', 4);
  assert.ok(r, 'cortou');
  assert.equal(peixe.preso, null, 'o bagre fugiu');
  assert.ok(E.bichos.includes(peixe));
  assert.equal(E.j[0].anzol.fase, 'cortada');
  assert.equal(R.pescar(E, 0, 0), false, 'sem anzol não pesca');
  rodar(E, 2.1);
  assert.equal(E.j[0].anzol.fase, 'balanca');
  E.bichos = [];
  assert.equal(R.pescar(E, 0, 0), true);
});

test('piranhas: nunca são pescadas; aparecem mais no difícil que no fácil', () => {
  const E = lagoVazio(), ang = 0, p = noCaminho(E, 0, ang, 300);
  R.colocar(E, 'piranha', p.x, p.y, { vel: 0 });
  R.pescar(E, 0, ang);
  const ev = rodar(E, 2);
  assert.ok(ev.some(e => e.tipo === 'cortou') && !ev.some(e => e.tipo === 'fisgou'));
  const conta = nivel => {
    let n = 0;
    for (let s = 1; s <= 6; s++) {
      const L = R.criar({ semente: s, aspecto: 16 / 9, jogadores: DOIS(nivel, nivel, true, true) });
      L.bonusFeito = true; L.tempo = 1e9;
      n += rodar(L, 120, 1 / 30).filter(e => e.tipo === 'piranhas').length;
    }
    return n;
  };
  const f = conta('facil'), d = conta('dificil');
  assert.ok(f >= 1 && d > f, 'fácil ' + f + ', difícil ' + d);
  assert.ok(R.NIVEIS.dificil.piranha.n > R.NIVEIS.facil.piranha.n);
});

test('fundo mais rápido: quem vale mais nada um pouco mais rápido, na medida do nível', () => {
  const media = (nivel, faixa) => {
    const E = R.criar({ semente: 9, aspecto: 16 / 9, jogadores: DOIS(nivel, nivel) });
    const vs = E.bichos.filter(o => o.faixa === faixa && o.tipo === 'bicho').map(o => o.v);
    return vs.reduce((s, v) => s + v, 0) / vs.length;
  };
  for (const nv of R.ORDEM) assert.ok(media(nv, 5) > media(nv, 1), nv + ': fundo ' + media(nv, 5) + ' x raso ' + media(nv, 1));
  assert.ok(media('dificil', 5) > media('facil', 5));
});

test('gigantes que brilham passam de vez em quando bem no fundo e valem muito', () => {
  for (const id of R.GIGANTES) { const b = R.POR_ID[id]; assert.ok(b.raro && b.faixa === 5 && b.pontos >= 60, id); }
  const vistos = new Set();
  for (let s = 1; s <= 4; s++) {
    const E = R.criar({ semente: s, aspecto: 16 / 9, jogadores: DOIS('medio', 'medio', true, true) });
    E.bonusFeito = true; E.tempo = 1e9;
    rodar(E, 200, 1 / 30).filter(e => e.tipo === 'raro').forEach(e => vistos.add(e.id));
  }
  assert.ok(R.GIGANTES.every(id => vistos.has(id)), 'vistos: ' + [...vistos]);
});
