// Regras e física do FRUTA PODRE no Node (sem navegador): node --test fruta-podre/teste/*.test.js (rodar da raiz do repositório kids)
// O mundo usa o mesmo Matter.js do jogo (libs/matter.min.js) e é repetível: o mesmo tiro dá sempre o mesmo resultado.
const test = require('node:test');
const assert = require('node:assert/strict');
const Matter = require('../libs/matter.min.js');
const R = require('../regras.js');
const { FASES, MUNDO } = require('../fases.js');
const FrutaMundo = require('../mundo.js');

const criar = (n, nivel) => FrutaMundo.criar(FASES[n - 1], { Matter, regras: R, nivel: nivel || 'medio' });
function rodar(S, passos, cada) { for (let i = 0; i < passos; i++) { S.passo(); if (cada) cada(i, S); } }
function tiro(S, ang, forca) { const v = R.velocidade(ang, forca); return S.lancar(v.vx, v.vy); }
function ateFimDoTurno(S, cada) { let n = 0; while ((S.estado === 'voo' || S.estado === 'espera') && n < 3000) { S.passo(); if (cada) cada(n, S); n++; } return n; }

test('pontuação: +5.000 por praga, +10.000 por fruta que sobra, pedaços de +10 a +500', () => {
  assert.equal(R.PONTOS_PRAGA, 5000);
  assert.equal(R.bonusFrutas(0), 0); assert.equal(R.bonusFrutas(3), 30000);
  for (const f of FASES) for (const b of f.blocks) {
    const p = R.pontosPedacos(b.type, b.width, b.height);
    assert.ok(p.length >= 3, 'quebra em pelo menos 3 pedaços');
    for (const x of p) assert.ok(x >= 10 && x <= 500, b.type + ' ' + x);
  }
  assert.ok(R.pontosPedacos('stone_slab', 160, 20)[0] > R.pontosPedacos('wood_plank', 160, 20)[0], 'pedra vale mais que madeira');
  assert.ok(R.pontosPedacos('wood_plank', 160, 20)[0] > R.pontosPedacos('glass_pane', 160, 20)[0], 'madeira vale mais que vidro');
  assert.equal(R.formatar(35000, 'pt'), '35.000'); assert.equal(R.formatar(35000, 'en'), '35,000'); assert.equal(R.formatar(1234567, 'es'), '1.234.567');
});

test('estrelas pelas metas parScores (vencer já dá 1)', () => {
  const par = { oneStar: 15000, twoStars: 20000, threeStars: 25000 };
  assert.equal(R.estrelas(40000, par, false), 0, 'perdeu: nenhuma');
  assert.equal(R.estrelas(5000, par, true), 1);
  assert.equal(R.estrelas(20000, par, true), 2);
  assert.equal(R.estrelas(24999, par, true), 2);
  assert.equal(R.estrelas(25000, par, true), 3);
});

test('dano = massa × velocidade relativa² × multiplicador do material: vidro fraco, madeira média, pedra forte', () => {
  assert.equal(R.dano(2, 3, 'wood'), 2 * 9 * R.MATERIAIS.wood.mult);
  assert.equal(R.dano(1, 10, 'wood') * 4, R.dano(1, 20, 'wood'), 'o dobro da velocidade = 4 vezes o dano');
  assert.ok(R.dano(5, 10, 'glass') > R.dano(5, 10, 'wood') && R.dano(5, 10, 'wood') > R.dano(5, 10, 'stone'));
  // quantos golpes iguais cada material aguenta (bloco do mesmo tamanho)
  const golpes = (m) => R.vidaBloco(m + '_x', 40, 60) / R.dano(6, 12, m);
  assert.ok(golpes('glass') < golpes('wood') && golpes('wood') < golpes('stone'));
  assert.ok(R.MATERIAIS.stone.densidade > R.MATERIAIS.wood.densidade && R.MATERIAIS.wood.densidade > R.MATERIAIS.glass.densidade, 'pedra é a mais pesada');
  assert.ok(R.MATERIAIS.glass.atrito < R.MATERIAIS.wood.atrito, 'vidro escorrega');
  assert.ok(R.vidaBloco('wood_plank', 160, 40) > R.vidaBloco('wood_plank', 20, 60), 'bloco maior aguenta mais');
});

test('física: gravidade 1, frutas quicam 0,45, pedra 0,1, e a linha pontilhada segue o Matter.js', () => {
  const S = criar(1);
  assert.equal(S.engine.gravity.y, 1);
  tiro(S, 40, 0.8);
  const p = S.projeteis[0];
  assert.equal(p.body.restitution, 0.45);
  assert.equal(R.MATERIAIS.stone.quique, 0.1);
  const v = R.velocidade(40, 0.8), prev = R.prever(S.estilingue.x, S.estilingue.y, v.vx, v.vy, 40);
  rodar(S, 40);
  assert.ok(Math.abs(p.body.position.x - prev[39].x) < 1.5 && Math.abs(p.body.position.y - prev[39].y) < 1.5,
    'previsão ' + JSON.stringify(prev[39]) + ' × fruta ' + JSON.stringify(p.body.position));
});

test('níveis: fácil ganha uma maçã a mais; difícil tem pragas mais resistentes; linha 100% / 35% / 20%', () => {
  const f = FASES[0];
  assert.equal(R.fila(f, 'facil').length, f.slingshot.ammoQueue.length + 1);
  assert.equal(R.fila(f, 'medio').length, f.slingshot.ammoQueue.length);
  assert.equal(R.NIVEIS.facil.linha, 1); assert.equal(R.NIVEIS.medio.linha, 0.35); assert.equal(R.NIVEIS.dificil.linha, 0.2);
  const m = criar(1, 'medio'), d = criar(1, 'dificil');
  const barata = (S) => S.pragas.find(p => p.tipo === 'barata_cascuda').vida;
  assert.ok(barata(d) > barata(m));
});

test('as 8 fases do Mundo 1: formato da especificação, pragas e frutas, e ficam de pé sozinhas', () => {
  assert.equal(FASES.length, 8);
  assert.equal(MUNDO.nome.pt, 'A Quitanda do Seu Zé');
  const ids = new Set();
  FASES.forEach((f, i) => {
    const onde = f.levelId;
    assert.equal(f.levelId, 'mundo1_fase0' + (i + 1)); ids.add(f.levelId);
    for (const l of ['pt', 'en', 'es']) assert.ok(f.title[l], onde + ' sem título em ' + l);
    assert.ok(f.parScores.oneStar < f.parScores.twoStars && f.parScores.twoStars < f.parScores.threeStars, onde + ': metas em ordem');
    assert.ok(f.slingshot.ammoQueue.length >= 3, onde + ': frutas');
    for (const a of f.slingshot.ammoQueue) assert.ok(R.FRUTAS[a], onde + ': fruta desconhecida ' + a);
    assert.ok(f.enemies.length >= 1, onde + ': pragas');
    for (const e of f.enemies) assert.ok(R.PRAGAS[e.type], onde + ': praga desconhecida ' + e.type);
    for (const b of f.blocks) { assert.ok(R.TIPOS_BLOCO.includes(b.type), onde + ': bloco ' + b.type); assert.ok(b.width > 0 && b.height > 0); }
    for (const h of f.hazards) assert.equal(h.type, 'vinegar_barrel');
    if (i >= 4) assert.ok(f.hazards.length > 0, onde + ': da fase 5 em diante tem galão de vinagre');
    else assert.equal(f.hazards.length, 0, onde + ': galão só a partir da fase 5');
    // monta no Matter.js e espera 4 s: nada quebra, nenhuma praga cai, nada sai do lugar
    const S = criar(i + 1);
    assert.equal(S.pragas.length, f.enemies.length); assert.equal(S.estado, 'mira'); assert.ok(S.atual);
    const antes = S.blocos.map(b => ({ x: b.body.position.x, y: b.body.position.y }));
    rodar(S, 240);
    assert.equal(S.vivas(), f.enemies.length, onde + ': praga caiu sozinha');
    assert.equal(S.blocos.filter(b => b.quebrado).length, 0, onde + ': bloco quebrou sozinho');
    S.blocos.forEach((b, k) => assert.ok(Math.hypot(b.body.position.x - antes[k].x, b.body.position.y - antes[k].y) < 4, onde + ': ' + b.tipo + ' escorregou'));
  });
  assert.equal(ids.size, 8);
  assert.ok(new Set(FASES.flatMap(f => f.blocks.map(b => R.material(b.type)))).size === 3, 'madeira, vidro e pedra');
});

test('um tiro de maçã na fase 1 voa, acerta a fortaleza e derruba praga', () => {
  const S = criar(1);
  rodar(S, 70);
  assert.ok(tiro(S, 20, 1));
  assert.equal(S.estado, 'voo');
  let x0 = S.projeteis[0].body.position.x, bateu = false;
  ateFimDoTurno(S, (n, M) => { if (M.eventos.some(e => e.tipo === 'bate')) bateu = true; M.eventos.length = Math.min(M.eventos.length, 200); });
  assert.ok(bateu, 'a fruta acertou');
  assert.ok(S.pragas.some(p => p.ko), 'derrubou praga');
  assert.ok(S.pontos >= 5000);
  assert.ok(S.rastro.length > 10 || S.rastroAnterior.length > 10, 'rastro do tiro');
  assert.equal(S.estado, 'mira', 'a próxima fruta foi para o estilingue');
  assert.ok(x0 < 300);
});

test('o tiro logo no começo (antes de 1 s) já causa dano', () => {
  const S = criar(5);
  rodar(S, 5);
  tiro(S, 0, 0.9);
  ateFimDoTurno(S);
  assert.ok(S.galoes.some(g => g.explodiu), 'o galão explodiu');
});

test('poderes: uva vira 3, pimenta fura madeira, melancia despenca, abacaxi explode, maçã grita', () => {
  let S = criar(2); rodar(S, 70); tiro(S, 20, 0.9); rodar(S, 15);
  assert.ok(S.poder()); assert.equal(S.projeteis.length, 3, 'trio de uvas');
  assert.ok(!S.poder(), 'o poder é usado uma vez só');
  const vs = S.projeteis.map(p => Math.atan2(p.body.velocity.y, p.body.velocity.x));
  assert.ok(Math.max(...vs) - Math.min(...vs) > 0.3, 'em leque');

  S = criar(3); rodar(S, 70); tiro(S, 8, 1); rodar(S, 12);
  const vAntes = S.projeteis[0].body.speed;
  assert.ok(S.poder()); rodar(S, 2);
  assert.ok(S.projeteis[0].body.speed > vAntes * 1.3, 'jato acelera');
  let furou = 0; for (let i = 0; i < 80; i++) { S.passo(); furou += S.eventos.filter(e => e.tipo === 'quebra' && e.por === 'pimenta_jato').length; S.eventos.length = 0; }
  assert.ok(furou >= 1, 'a pimenta furou madeira');

  S = criar(6); rodar(S, 70); tiro(S, 45, 0.8); rodar(S, 20);
  assert.ok(S.poder()); rodar(S, 1);
  const m = S.projeteis[0];
  assert.ok(m.bigorna && m.body.velocity.y > 20 && Math.abs(m.body.velocity.x) < 3, 'melancia cai reto');

  S = criar(5); rodar(S, 70); S.fila = []; S.atual = 'abacaxi_azedo'; tiro(S, 40, 0.6); rodar(S, 20);
  assert.ok(S.poder()); assert.ok(S.eventos.some(e => e.tipo === 'explosao' && e.de === 'abacaxi_azedo'));

  S = criar(5); rodar(S, 70); S.fila = []; S.atual = 'abacaxi_azedo'; tiro(S, 10, 0.4);
  let estourou = false; for (let i = 0; i < 400 && !estourou; i++) { S.passo(); estourou = S.eventos.some(e => e.tipo === 'explosao' && e.de === 'abacaxi_azedo'); }
  assert.ok(estourou, 'o abacaxi explode sozinho 1 s depois de bater');

  S = criar(1); rodar(S, 70); tiro(S, 30, 0.8); rodar(S, 10);
  assert.ok(S.poder()); assert.ok(S.eventos.some(e => e.tipo === 'grito'));
});

test('galões de vinagre explodem em cadeia (fase 5) e a vitória chega 3 s depois da última praga, com bônus de frutas', () => {
  const S = criar(5);
  rodar(S, 70);
  tiro(S, 0, 0.9);
  let ultima = null, vitoria = null;
  for (let i = 0; i < 1500 && !S.resultado; i++) { S.passo(); if (S.eventos.some(e => e.tipo === 'ultima')) ultima = i; if (S.eventos.some(e => e.tipo === 'vitoria')) vitoria = i; S.eventos.length = 0; }
  assert.ok(S.galoes.filter(g => g.explodiu).length >= 2, 'reação em cadeia');
  assert.ok(S.resultado && S.resultado.venceu);
  assert.equal(vitoria - ultima, 180, '3 s de espera');
  assert.equal(S.resultado.sobra, 2); assert.equal(S.resultado.bonus, 20000);
  assert.ok(S.resultado.estrelas >= 2);
});

test('rato de capacete aguenta 2 golpes; barata precisa de pancada forte; mosca cai com qualquer toque; todas somem num "puf"', () => {
  const S = criar(4), G = R.PRAGAS.rato_ladrao.golpe;
  const rato = S.pragas.find(p => p.tipo === 'rato_ladrao'), barata = S.pragas.find(p => p.tipo === 'barata_cascuda'), mosca = S.pragas.find(p => p.tipo === 'mosca_zumbidora');
  S.ferir(rato, G * 0.5); assert.ok(rato.capacete && !rato.ko, 'pancadinha não faz nada');
  S.ferir(rato, G + 10); assert.ok(!rato.capacete && !rato.ko, '1º golpe: perde o capacete');
  S.ferir(rato, G + 10); assert.ok(rato.ko, '2º golpe: nocauteado');
  S.ferir(barata, R.PRAGAS.barata_cascuda.vida * 0.6); assert.ok(!barata.ko);
  S.ferir(barata, R.PRAGAS.barata_cascuda.vida * 0.6); assert.ok(barata.ko);
  S.ferir(mosca, 1); assert.ok(mosca.ko);
  assert.equal(S.pontos, 3 * R.PONTOS_PRAGA);
  rodar(S, 70);
  assert.ok([rato, barata, mosca].every(p => p.sumiu), 'sumiram num puf');
  const D = criar(4, 'dificil'), rd = D.pragas.find(p => p.tipo === 'rato_ladrao');
  D.ferir(rd, G + 10); assert.ok(rd.capacete, 'no difícil o rato aguenta mais');
});

test('derrota: sem frutas e com praga viva, contagem de 5 s', () => {
  const S = criar(1);
  rodar(S, 70);
  S.semFrutas();
  tiro(S, 70, 0.25);
  let contagem = null, fim = null;
  for (let i = 0; i < 2000 && !S.resultado; i++) { S.passo(); if (S.eventos.some(e => e.tipo === 'contagem')) contagem = i; if (S.eventos.some(e => e.tipo === 'derrota')) fim = i; S.eventos.length = 0; }
  assert.ok(S.resultado && !S.resultado.venceu);
  assert.equal(fim - contagem, 300, '5 s de contagem');
  assert.equal(S.resultado.estrelas, 0);
});
