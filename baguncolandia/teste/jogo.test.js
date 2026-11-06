// Testes do motor puro do Bagunçolândia: node --test baguncolandia/teste/
const test = require('node:test');
const assert = require('node:assert/strict');
const B = require('../jogo.js');

const FIGS = [
  { id: 'melancia', papel: 'fruta', raio: 48 },
  { id: 'donut', papel: 'doce', raio: 40 },
  { id: 'pimentao', papel: 'vilao', raio: 44 },
  { id: 'bolinho', papel: 'heroi', raio: 46, mascote: true },
  { id: 'estrela', papel: 'poder', raio: 36, poder: 'x2' },
  { id: 'bola', papel: 'bola', raio: 34 }
];
function sorteioFixo(seq) { let i = 0; return () => seq[i++ % seq.length]; }
function partida(extra) {
  return B.criarPartida(Object.assign({ modo: 'corta', jogadores: 1, duracao: 60, dificuldade: 'normal', figuras: FIGS, aleatorio: sorteioFixo([0.5]) }, extra || {}));
}
function drenar(p) { return p.eventos(); }

test('rodada começa com placar zero, 3 vidas e tempo cheio', () => {
  const p = partida(); p.comecar();
  const e = p.estado();
  assert.equal(e.jogadores[0].pontos, 0);
  assert.equal(e.jogadores[0].vidas, 3);
  assert.equal(e.restante, 60);
  assert.equal(e.fase, 'jogando');
});

test('corta-corta lança frutas que sobem e caem (gravidade)', () => {
  const p = partida(); p.comecar();
  p.avancar(1200);                       // intervalo normal é 1 s: já lançou pelo menos uma
  const e = p.estado();
  assert.ok(e.coisas.length >= 1, 'lançou');
  const c = e.coisas[0]; const y0 = c.y, vy0 = c.vy;
  assert.ok(vy0 < 0, 'sobe (vy negativo)');
  p.avancar(500);
  const c2 = p.estado().coisas.find(x => x.id === c.id);
  assert.ok(c2 && c2.vy > vy0, 'gravidade freia a subida');
});

test('passar a mão por cima de uma fruta corta e dá pontos', () => {
  const p = partida(); p.comecar();
  p.lancar({ fig: 'melancia', x: 640, y: 360, vx: 0, vy: 0 }, 0);
  const fruta = p.estado().coisas[0];
  assert.equal(fruta.papel, 'fruta');
  // dois pontos de movimento seguidos cruzando a fruta (x,y normalizados do palco do jogador)
  p.movimento(0, [[0.40, 0.5, 90]], 1000);
  p.movimento(0, [[0.60, 0.5, 90]], 1100);
  const ev = drenar(p);
  assert.ok(ev.some(x => x.t === 'corte' && x.fig === 'melancia'), JSON.stringify(ev));
  assert.equal(p.estado().jogadores[0].pontos, 10);
  assert.equal(p.estado().coisas.filter(c => !c.morta).length, 0);
});

test('movimento fraco não corta', () => {
  const p = partida(); p.comecar();
  p.lancar({ fig: 'melancia', x: 640, y: 360, vx: 0, vy: 0 }, 0);
  p.movimento(0, [[0.40, 0.5, 10]], 1000);
  p.movimento(0, [[0.60, 0.5, 10]], 1100);
  assert.equal(p.estado().jogadores[0].pontos, 0);
});

test('cortar um vilão tira uma vida', () => {
  const p = partida(); p.comecar();
  p.lancar({ fig: 'pimentao', x: 640, y: 360, vx: 0, vy: 0 }, 0);
  p.movimento(0, [[0.40, 0.5, 90]], 1000);
  p.movimento(0, [[0.60, 0.5, 90]], 1100);
  assert.equal(p.estado().jogadores[0].vidas, 2);
  assert.ok(drenar(p).some(x => x.t === 'vilao'));
});

test('três frutas numa passada viram combo com bônus', () => {
  const p = partida(); p.comecar();
  [500, 640, 780].forEach((x, i) => p.lancar({ fig: 'melancia', x, y: 360, vx: 0, vy: 0 }, i));
  p.movimento(0, [[0.30, 0.5, 95]], 1000);
  p.movimento(0, [[0.70, 0.5, 95]], 1100);
  const ev = drenar(p);
  const combo = ev.find(x => x.t === 'combo');
  assert.ok(combo && combo.n === 3, JSON.stringify(ev));
  assert.equal(p.estado().jogadores[0].pontos, 30 + 15);   // 3×10 + bônus 3×5
});

test('a rodada acaba quando o tempo zera', () => {
  const p = partida({ duracao: 5 }); p.comecar();
  p.avancar(5200);
  assert.equal(p.estado().fase, 'fim');
  assert.ok(drenar(p).some(x => x.t === 'fim'));
});

test('pega-pega: tocar num herói pega; vilão tira 5; mascote vale dobro', () => {
  const p = partida({ modo: 'pega' }); p.comecar();
  p.lancar({ fig: 'bolinho', x: 640, y: 360, vx: 0, vy: 0 }, 0);
  p.movimento(0, [[0.5, 0.5, 80]], 1000);
  assert.equal(p.estado().jogadores[0].pontos, 30);
  p.lancar({ fig: 'pimentao', x: 300, y: 300, vx: 0, vy: 0 }, 1);
  p.movimento(0, [[300 / 1280, 300 / 720, 80]], 1300);
  assert.equal(p.estado().jogadores[0].pontos, 25);
  assert.ok(drenar(p).some(x => x.t === 'pegou' && x.fig === 'bolinho'));
});

test('poder x2 dobra os pontos por 10 s', () => {
  const p = partida({ modo: 'pega' }); p.comecar();
  p.lancar({ fig: 'estrela', x: 640, y: 360, vx: 0, vy: 0 }, 0);
  p.movimento(0, [[0.5, 0.5, 80]], 1000);
  assert.equal(p.estado().jogadores[0].poder, 'x2');
  p.lancar({ fig: 'bolinho', x: 640, y: 360, vx: 0, vy: 0 }, 1);
  p.movimento(0, [[0.5, 0.5, 80]], 1300);
  assert.equal(p.estado().jogadores[0].pontos, 60);   // 30 × 2
  p.avancar(10500);
  assert.equal(p.estado().jogadores[0].poder, null);
});

test('chuta-chuta: só movimento na zona de chute conta, e gol vale 30', () => {
  const p = partida({ modo: 'chuta' }); p.comecar();
  p.zonaChute(0, 0.65);   // chute = abaixo de 65% da altura
  p.lancar({ fig: 'bola', x: 640, y: 600, vx: 0, vy: 0 }, 0);
  p.movimento(0, [[0.5, 600 / 720, 90]], 1000);     // ponto em cima da bola, na zona
  let ev = drenar(p);
  assert.ok(ev.some(x => x.t === 'chutou'), JSON.stringify(ev));
  assert.equal(p.estado().jogadores[0].pontos, 10);
  const bola = p.estado().coisas.find(c => c.papel === 'bola');
  assert.ok(bola.vy < 0, 'a bola voa para cima depois do chute');
  // bola fora da zona não chuta
  p.lancar({ fig: 'bola', x: 300, y: 200, vx: 0, vy: 0 }, 1);
  p.movimento(0, [[300 / 1280, 200 / 720, 90]], 1300);
  assert.ok(!drenar(p).some(x => x.t === 'chutou'));
  // gol: bola chutada que entra na trave
  const trave = p.estado().trave;
  p.lancar({ fig: 'bola', x: trave.x + trave.w / 2, y: trave.y + trave.h + 10, vx: 0, vy: -900, chutada: true }, 2);
  p.avancar(100);
  assert.ok(drenar(p).some(x => x.t === 'gol'));
  assert.equal(p.estado().jogadores[0].pontos, 40);
});

test('dois jogadores têm placar separado', () => {
  const p = partida({ jogadores: 2 }); p.comecar();
  p.lancar({ fig: 'melancia', x: 960, y: 360, vx: 0, vy: 0, j: 1 }, 0);   // raia do jogador 2 = metade direita
  p.movimento(1, [[0.4, 0.5, 90]], 1000);
  p.movimento(1, [[0.6, 0.5, 90]], 1100);
  assert.equal(p.estado().jogadores[0].pontos, 0);
  assert.equal(p.estado().jogadores[1].pontos, 10);
});

test('separar os pontos de uma câmera só entre dois jogadores (metade esquerda = 1)', () => {
  const r = B.separarJogadores([[0.2, 0.5, 80], [0.8, 0.3, 60]]);
  assert.deepEqual(r[0], [[0.4, 0.5, 80]]);
  assert.deepEqual(r[1], [[0.6, 0.3, 60]]);
});

test('validar: aceita mensagens certas e recusa lixo', () => {
  assert.ok(B.validar({ t: 'join', id: 'abc12345', nome: 'Ana' }));
  assert.equal(B.validar({ t: 'join', id: 'abc12345', nome: 'Um nome comprido demais para caber' }), null);
  assert.equal(B.validar({ t: 'hack', id: 'x' }), null);
  assert.equal(B.validar({ t: 'offer', id: 'abc12345', nome: 'Ana', sdp: 'texto' }), null);
  assert.ok(B.validar({ t: 'offer', id: 'abc12345', nome: 'Ana', sdp: { type: 'offer', sdp: 'v=0' } }));
  assert.equal(B.validar({ t: 'offer', id: 'abc12345', nome: 'Ana', sdp: { type: 'rollback', sdp: 'v=0' } }), null);
  assert.equal(B.validar({ t: 'cmd', acao: 'apagar-tudo' }), null);
  assert.ok(B.validar({ t: 'cmd', acao: 'comecar', modo: 'corta' }));
  assert.equal(B.validar({ t: 'cmd', acao: 'musica', texto: 'x'.repeat(500) }).texto.length, 200);
  assert.equal(B.validar({ t: 'cmd', acao: 'config', ambiente: 'matrix' }).ambiente, 'paisagem');
  assert.equal(B.validar({ t: 'dados', bpm: 999 }).bpm, 220);
  const bo = B.validar({ t: 'cmd', acao: 'boneco', j: 1, boneco: { cabeca: 'liliLimao', cor: '#ff4fa3', roupa: 'vestido', acessorio: 'laco', pele: 'red', sapato: '#fff' } });
  assert.equal(bo.j, 1); assert.equal(bo.boneco.cabeca, 'liliLimao'); assert.equal(bo.boneco.roupa, 'vestido'); assert.equal(bo.boneco.pele, undefined); assert.equal(bo.boneco.sapato, undefined);
  assert.equal(B.validar({ t: 'cmd', acao: 'boneco', boneco: 'x' }), null);
  assert.equal(B.validar({ t: 'cmd', acao: 'boneco', boneco: { cabeca: '<img>' } }).boneco.cabeca, undefined);
  assert.deepEqual(B.validar({ t: 'dados', c: [0.1, 0.2, 0.3, 0.4] }).c, { x: 0.1, y: 0.2, w: 0.3, h: 0.4 });
  // estado (da TV para os celulares) também é conferido: fase de lista fechada, lista só de ids, pontos até 4
  const es = B.validar({ t: 'estado', fase: 'hack', lista: 'x', pontos: [{ nome: 'Ana', pontos: 10 }, {}, {}, {}, {}, {}], eu: 9 });
  assert.equal(es.fase, 'lobby'); assert.deepEqual(es.lista, []); assert.equal(es.pontos.length, 4); assert.equal(es.eu, 3);
  assert.equal(B.validar({ t: 'estado', fase: 'fim', lista: ['abcdefghijk', 'ruim'] }).lista.length, 1);
  assert.equal(B.validar('string'), null);
  assert.equal(B.validar({ t: 'join', id: '<script>', nome: 'Ana' }), null);
  const v = B.validar({ t: 'join', id: 'abc12345', nome: '  Ana <b>  ' });
  assert.equal(v.nome, 'Ana <b>');   // texto cru é guardado; quem mostra usa textContent
});

/* ---------- v0.2: corpo, Pula e abaixa, Bagunça de bolas ---------- */
test('corpo: a caixa calibrada vira posição; subir = pulo; encurtar = abaixado', () => {
  const p = partida({ modo: 'pula' }); p.comecar();
  p.calibrar(0, { x: 0.3, y: 0.1, w: 0.2, h: 0.8 });
  p.corpo(0, { x: 0.5, y: 0.1, w: 0.2, h: 0.8 }, 1000);
  let c = p.estado().jogadores[0].corpo;
  assert.ok(Math.abs(c.x - 0.6) < 0.01, 'x = centro da caixa');
  assert.equal(c.pulando, false); assert.equal(c.abaixado, false);
  p.corpo(0, { x: 0.5, y: 0.1 - 0.15, w: 0.2, h: 0.8 }, 1100);
  assert.equal(p.estado().jogadores[0].corpo.pulando, true, 'topo subiu 15 % da altura = pulo');
  p.corpo(0, { x: 0.5, y: 0.45, w: 0.25, h: 0.45 }, 1200);
  c = p.estado().jogadores[0].corpo;
  assert.equal(c.abaixado, true, 'altura caiu para 56 % = abaixado');
  assert.equal(c.pulando, false);
});

test('pula e abaixa: tronco baixo exige pulo; galho alto exige abaixar; passar vale 10', () => {
  const p = partida({ modo: 'pula' }); p.comecar();
  p.calibrar(0, { x: 0.4, y: 0.1, w: 0.2, h: 0.8 });
  p.corpo(0, { x: 0.4, y: 0.1, w: 0.2, h: 0.8 }, 1000);          // parado no meio
  // tronco vindo da direita, já perto do boneco, sem pular → bate
  p.obstaculo({ tipo: 'baixo', x: 700, vx: -400 }, 0);
  p.avancar(100); p.avancar(100); p.avancar(100);
  let ev = drenar(p);
  assert.ok(ev.some(x => x.t === 'bateu' && x.tipo === 'baixo'), JSON.stringify(ev));
  assert.equal(p.estado().jogadores[0].vidas, 2);
  // outro tronco, agora pulando → passa
  p.obstaculo({ tipo: 'baixo', x: 700, vx: -400 }, 0);
  p.corpo(0, { x: 0.4, y: 0.1 - 0.2, w: 0.2, h: 0.8 }, 1500);
  for (let i = 0; i < 6; i++) { p.corpo(0, { x: 0.4, y: 0.1 - 0.2, w: 0.2, h: 0.8 }, 1500 + i * 100); p.avancar(100); }
  ev = drenar(p);
  assert.ok(ev.some(x => x.t === 'desviou'), JSON.stringify(ev));
  assert.ok(!ev.some(x => x.t === 'bateu'));
  assert.equal(p.estado().jogadores[0].pontos, 10);
  // galho alto: em pé bate; abaixado passa
  p.corpo(0, { x: 0.4, y: 0.1, w: 0.2, h: 0.8 }, 2200);
  p.obstaculo({ tipo: 'alto', x: 700, vx: -400 }, 0);
  for (let i = 0; i < 4; i++) { p.corpo(0, { x: 0.4, y: 0.1, w: 0.2, h: 0.8 }, 2300 + i * 100); p.avancar(100); }
  assert.ok(drenar(p).some(x => x.t === 'bateu' && x.tipo === 'alto'));
  p.obstaculo({ tipo: 'alto', x: 700, vx: -400 }, 0);
  for (let i = 0; i < 6; i++) { p.corpo(0, { x: 0.4, y: 0.45, w: 0.25, h: 0.45 }, 2800 + i * 100); p.avancar(100); }
  ev = drenar(p);
  assert.ok(ev.some(x => x.t === 'desviou') && !ev.some(x => x.t === 'bateu'), JSON.stringify(ev));
});

test('pula e abaixa: lança obstáculos sozinho e avisa antes (evento aviso)', () => {
  const p = partida({ modo: 'pula' }); p.comecar();
  for (let i = 0; i < 18; i++) p.avancar(100);
  const ev = drenar(p);
  assert.ok(ev.some(x => x.t === 'aviso' && (x.tipo === 'baixo' || x.tipo === 'alto')), JSON.stringify(ev));
  assert.ok(p.estado().coisas.some(c => c.papel === 'obstaculo'));
});

test('bagunça de bolas: encostar numa bola vale 5 e a empurra; bomba tira vida', () => {
  const p = partida({ modo: 'bolas' }); p.comecar();
  p.lancar({ fig: 'bola', x: 640, y: 500, vx: 0, vy: 0, estilo: 'quica' }, 0);
  p.movimento(0, [[0.5, 500 / 720, 80]], 1000);
  const ev = drenar(p);
  assert.ok(ev.some(x => x.t === 'tocou'), JSON.stringify(ev));
  assert.equal(p.estado().jogadores[0].pontos, 5);
  const b = p.estado().coisas.find(c => c.papel === 'bola');
  assert.ok(!b.morta && (b.vx !== 0 || b.vy !== 0), 'a bola continua, empurrada');
  p.lancar({ fig: 'pimentao', x: 300, y: 500, vx: 0, vy: 0, estilo: 'quica' }, 1);
  p.movimento(0, [[300 / 1280, 500 / 720, 80]], 1400);
  assert.equal(p.estado().jogadores[0].vidas, 2);
});

test('bagunça de bolas: as bolas quicam no chão e nas paredes', () => {
  const p = partida({ modo: 'bolas' }); p.comecar();
  const b = p.lancar({ fig: 'bola', x: 640, y: 600, vx: 300, vy: 0, estilo: 'quica' }, 0);
  for (let i = 0; i < 30; i++) p.avancar(100);
  const c = p.estado().coisas.find(x => x.id === b.id);
  assert.ok(c, 'não some');
  assert.ok(c.x > 0 && c.x < 1280 && c.y < 720, 'fica dentro do palco');
});

/* ---------- v0.4: esqueleto por IA ---------- */
// 13 pontos [x,y] normalizados e espelhados: 0 nariz, 1-2 ombros, 3-4 cotovelos, 5-6 pulsos, 7-8 quadris, 9-10 joelhos, 11-12 tornozelos
function pose(o) {
  o = o || {};
  const dx = o.dx || 0, dy = o.dy || 0, agacho = o.agacho || 0;
  const y = v => v - dy + (v > 0.5 ? -agacho * (v - 0.5) * 2 : 0);
  return [[0.5 + dx, y(0.15)], [0.42 + dx, y(0.3)], [0.58 + dx, y(0.3)], [0.36 + dx, y(0.45)], [0.64 + dx, y(0.45)],
    o.pulsoE || [0.33 + dx, y(0.58)], o.pulsoD || [0.67 + dx, y(0.58)], [0.45 + dx, y(0.55)], [0.55 + dx, y(0.55)],
    [0.45 + dx, y(0.72)], [0.55 + dx, y(0.72)], o.peE || [0.45 + dx, y(0.9)], o.peD || [0.55 + dx, y(0.9)]];
}

test('esqueleto: o pulso em movimento rápido corta a fruta', () => {
  const p = partida(); p.comecar();
  p.lancar({ fig: 'melancia', x: 640, y: 360, vx: 0, vy: 0 }, 0);
  p.esqueleto(0, pose({ pulsoD: [0.3, 0.5] }), 1000);
  p.esqueleto(0, pose({ pulsoD: [0.7, 0.5] }), 1100);
  assert.ok(drenar(p).some(e => e.t === 'corte'));
});

test('esqueleto: pulso parado não corta', () => {
  const p = partida(); p.comecar();
  p.lancar({ fig: 'melancia', x: 640, y: 360, vx: 0, vy: 0 }, 0);
  p.esqueleto(0, pose({ pulsoD: [0.5, 0.5] }), 1000);
  p.esqueleto(0, pose({ pulsoD: [0.5, 0.5] }), 1100);
  assert.ok(!drenar(p).some(e => e.t === 'corte'));
});

test('esqueleto no chuta-chuta: só o pé chuta a bola (mão não vale)', () => {
  const p = partida({ modo: 'chuta' }); p.comecar();
  p.lancar({ fig: 'bola', x: 640, y: 300, vx: 0, vy: 0 }, 0);
  p.esqueleto(0, pose({ pulsoD: [0.3, 300 / 720] }), 1000);
  p.esqueleto(0, pose({ pulsoD: [0.7, 300 / 720] }), 1100);     // mão passa pela bola (fora da zona de chute, mas com esqueleto a zona não manda)
  assert.ok(!drenar(p).some(e => e.t === 'chutou'), 'mão não chuta');
  p.esqueleto(0, pose({ peD: [0.3, 300 / 720] }), 1200);
  p.esqueleto(0, pose({ peD: [0.7, 300 / 720] }), 1300);      // pé passa pela bola
  assert.ok(drenar(p).some(e => e.t === 'chutou'), 'pé chuta');
});

test('esqueleto alimenta o corpo: andar, pular e abaixar sem calibração', () => {
  const p = partida({ modo: 'pula' }); p.comecar();
  for (let i = 0; i < 12; i++) p.esqueleto(0, pose(), 1000 + i * 100);   // 1,2 s parado: vira referência
  let c = p.estado().jogadores[0].corpo;
  assert.ok(Math.abs(c.x - 0.5) < 0.03 && !c.pulando && !c.abaixado);
  p.esqueleto(0, pose({ dx: 0.2 }), 2300); p.esqueleto(0, pose({ dx: 0.2 }), 2400);
  assert.ok(p.estado().jogadores[0].corpo.x > 0.6, 'andou para a direita');
  p.esqueleto(0, pose({ dy: 0.15 }), 2500);
  assert.equal(p.estado().jogadores[0].corpo.pulando, true, 'subiu = pulo');
  p.esqueleto(0, pose({ agacho: 0.5 }), 2600);
  assert.equal(p.estado().jogadores[0].corpo.abaixado, true, 'encolheu = abaixado');
  assert.ok(p.estado().jogadores[0].esqueleto, 'o esqueleto fica no estado para o desenho');
});

test('validar aceita esqueleto compacto e recusa lixo', () => {
  const ok = B.validar({ t: 'dados', k: [pose()] });
  assert.equal(ok.k.length, 1); assert.equal(ok.k[0].length, 13);
  assert.equal(B.validar({ t: 'dados', k: 'x' }).k, undefined);
  assert.equal(B.validar({ t: 'dados', k: [[[1, 2]]] }).k, undefined);
});

test('validar: boneco leva "eu" (qual joga quando é 1 pessoa) só se for true', () => {
  assert.strictEqual(B.validar({ t: 'cmd', acao: 'boneco', j: 1, boneco: { cabeca: 'menino' }, eu: true }).eu, true);
  assert.strictEqual(B.validar({ t: 'cmd', acao: 'boneco', j: 1, boneco: { cabeca: 'menino' }, eu: 'sim' }).eu, undefined);
  assert.strictEqual(B.validar({ t: 'cmd', acao: 'boneco', j: 0, boneco: { cabeca: 'menino' } }).eu, undefined);
});

/* 🧍 "Boneco vai até lá" (no dedo): o boneco anda até o dedo, pula para alcançar e só vale o que encosta nele */
function vaiPartida(modo) { const p = partida({ modo: modo || 'corta', vai: true }); p.comecar(); return p; }
function limpar(p) { p.estado().coisas.length = 0; }
function rodar(p, ms, passo = 16) { for (let t = 0; t < ms; t += passo) p.avancar(passo); }

test('vai até lá: responde na hora e cruza a tela em ~1,5 s, sem teleporte', () => {
  const p = vaiPartida(); limpar(p);
  const x0 = p.estado().jogadores[0].vai.x;
  p.alvo(0, 0.95, 0.8); p.avancar(50);
  const x1 = p.estado().jogadores[0].vai.x;
  assert.ok(x1 > x0, 'já começou a andar no primeiro quadro');
  let ant = x1, maior = 0;
  for (let t = 0; t < 1500; t += 16) { p.avancar(16); limpar(p); const x = p.estado().jogadores[0].vai.x; maior = Math.max(maior, (x - ant) / 0.016); ant = x; }
  assert.ok(maior <= 1280 / 1.5 + 1, 'nunca passa de 1 tela em 1,5 s: ' + maior);
  const fim = p.estado().jogadores[0].vai.x;
  assert.ok(Math.abs(fim - 0.95 * 1280) < 120 || fim >= 1280 - 0.2 * 720 * 0.56 - 1, 'chegou perto do dedo: ' + fim);
});

test('vai até lá: alvo alto → pula sozinho; alvo baixo → fica no chão', () => {
  const p = vaiPartida(); limpar(p);
  p.alvo(0, 0.5, 0.1); let menor = 0; for (let t = 0; t < 600; t += 16) { p.avancar(16); limpar(p); menor = Math.min(menor, p.estado().jogadores[0].vai.y); }
  assert.ok(menor < -40, 'pulou: ' + menor);
  assert.ok(0.86 * 720 + menor - 0.56 * 720 * 1.18 <= 0.1 * 720, 'a mão alcançou a altura do dedo');
  const q = vaiPartida(); limpar(q);
  q.alvo(0, 0.5, 0.8); let m2 = 0; for (let t = 0; t < 600; t += 16) { q.avancar(16); limpar(q); m2 = Math.min(m2, q.estado().jogadores[0].vai.y); }
  assert.equal(m2, 0);
});

test('vai até lá: só vale encostando — fruta longe não conta, fruta no corpo conta', () => {
  const p = vaiPartida(); limpar(p);
  p.lancar({ fig: 'melancia', x: 150, y: 500, estilo: 'voa' }, 0); rodar(p, 300);
  assert.equal(p.estado().jogadores[0].pontos, 0, 'longe do boneco não marca');
  p.alvo(0, 150 / 1280, 0.7); rodar(p, 1500);
  assert.ok(p.estado().jogadores[0].pontos > 0, 'o boneco foi até lá e encostou');
});

test('vai até lá: no chuta-chuta a bola só vai com as pernas (não com a cabeça)', () => {
  const p = vaiPartida('chuta'); limpar(p);
  const alta = p.lancar({ fig: 'bola', x: 640, y: 330, estilo: 'voa' }, 0); p.avancar(16);
  assert.ok(!alta.chutada, 'bola na altura da cabeça não é chute');
  const baixa = p.lancar({ fig: 'bola', x: 640, y: 660, estilo: 'voa' }, 0); p.avancar(16);
  assert.ok(baixa.chutada, 'bola no pé é chute');
});

/* 🐰 Pega-pega com bichos */
const BICHOS = [
  { id: 'coelho', papel: 'bicho', raio: 46, anda: 'pula', tam: 124, vel: 220 },
  { id: 'borboleta', papel: 'bicho', raio: 46, anda: 'voa', tam: 84, vel: 150 },
  { id: 'toupeira', papel: 'bicho', raio: 46, anda: 'buraco', tam: 100, vel: 90 },
  { id: 'cavalo', papel: 'bicho', raio: 46, anda: 'anda', tam: 540, vel: 300 }
];
function pegaPega(extra) { const p = partida(Object.assign({ modo: 'pega', figuras: FIGS.concat(BICHOS) }, extra || {})); p.comecar(); return p; }
function bichos(p) { return p.estado().coisas.filter(c => c.estilo === 'bicho'); }
function ate(p, cond, ms) { for (let t = 0; t < ms; t += 16) { p.avancar(16); if (cond()) return true; } return false; }

test('pega-pega: os bichos entram no lugar dos heróis e ficam à vista, longe do cantinho', () => {
  const p = pegaPega();
  assert.ok(ate(p, () => bichos(p).some(c => c.b.fase === 'fica'), 8000), 'um bicho chegou');
  const c = bichos(p).find(x => x.b.fase === 'fica');
  assert.ok(c.x - c.tam / 2 >= -1 && c.x + c.tam / 2 <= 1281, 'inteiro dentro da tela: ' + c.fig);
  assert.ok(c.x > 250, 'não nasce no cantinho');
  assert.ok(!p.estado().coisas.some(x => x.papel === 'heroi'), 'sem heróis no lugar dos bichos');
});

test('pega-pega: bicho que ninguém pega vai embora sozinho', () => {
  const p = pegaPega();
  ate(p, () => bichos(p).length > 0, 8000);
  const c = bichos(p)[0];
  assert.ok(ate(p, () => !p.estado().coisas.includes(c), 20000), 'sumiu depois de esperar');
});

test('pega-pega: pegou → +15, vai ao cantinho, fica ~10 s e sai andando; não se pega duas vezes', () => {
  const p = partida({ modo: 'pega', figuras: FIGS.concat([BICHOS[0]]) }); p.comecar();
  ate(p, () => bichos(p).some(c => c.b.fase === 'fica' && c.anda !== 'buraco'), 10000);
  const c = bichos(p).find(x => x.b.fase === 'fica' && x.anda !== 'buraco');
  p.movimento(0, [[c.x / 1280, c.y / 720, 100]], 1000);
  assert.equal(p.estado().jogadores[0].pontos, 15);
  assert.equal(c.b.fase, 'pego');
  assert.ok(ate(p, () => c.b.fase === 'canto', 8000), 'chegou ao cantinho');
  assert.ok(c.x < 450, 'cantinho de baixo à esquerda: ' + c.x);
  p.movimento(0, [[c.x / 1280, c.y / 720, 100]], 9000); assert.equal(p.estado().jogadores[0].pontos, 15, 'no cantinho não conta de novo');
  rodar(p, 9000); assert.equal(c.b.fase, 'canto', 'ainda descansando');
  assert.ok(ate(p, () => !p.estado().coisas.includes(c), 12000), 'saiu da tela');
});

test('pega-pega: a toupeira sai do buraco e só dá para pegar quando está fora', () => {
  const p = partida({ modo: 'pega', figuras: FIGS.concat([BICHOS[2]]) }); p.comecar();
  ate(p, () => bichos(p).length > 0, 8000);
  const t = bichos(p)[0]; assert.ok(t.b.k < 0.35);
  p.movimento(0, [[t.x / 1280, t.y / 720, 100]], 500); assert.equal(p.estado().jogadores[0].pontos, 0, 'dentro do buraco não conta');
  ate(p, () => t.b.k >= 1, 2000);
  p.movimento(0, [[t.x / 1280, t.y / 720, 100]], 2600); assert.equal(p.estado().jogadores[0].pontos, 15);
});

test('pega-pega no difícil: o boneco anda até o bicho e pega encostando', () => {
  const p = partida({ modo: 'pega', figuras: FIGS.concat([BICHOS[0]]), vai: true }); p.comecar();
  ate(p, () => bichos(p).length > 0, 8000);
  const c = bichos(p)[0];
  p.alvo(0, c.b.px / 1280, 0.8);   // o dedo vai onde o coelho vai parar
  assert.ok(ate(p, () => c.pego, 6000), 'pegou');
});

test('⌨️ no 💪 Difícil: ← → andam até a beira e ↑ pula; no 😊 Fácil o teclado não faz nada', () => {
  const p = vaiPartida(); limpar(p);
  const x0 = p.estado().jogadores[0].vai.x; p.teclas(0, { esq: true }); rodar(p, 600); limpar(p);
  assert.ok(p.estado().jogadores[0].vai.x < x0 - 200, 'andou para a esquerda');
  p.teclas(0, { pulo: true }); p.avancar(16); assert.ok(p.estado().jogadores[0].vai.y < 0 || p.estado().jogadores[0].vai.vx !== undefined);
  let menor = 0; for (let t = 0; t < 400; t += 16) { p.avancar(16); limpar(p); menor = Math.min(menor, p.estado().jogadores[0].vai.y); } assert.ok(menor < -100);
  const f = partida(); f.comecar(); f.teclas(0, { dir: true }); f.avancar(16); assert.equal(f.estado().jogadores[0].vai, null);
});
