// Regras e desenho do Meu Pequeno Amiguinho, sem navegador: node --test meu-amiguinho/teste/regras.test.js (da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../dados.js');
const A = require('../arte.js');
const R = require('../regras.js');

const corpos = [];
D.BASES.forEach((b) => b.corpos.forEach((c) => corpos.push([b.id, c])));

test('a turma: pelo menos 16 bichinhos, cada um com nome, frase e espécie nos 3 idiomas, nomes únicos', () => {
  assert.ok(D.BASES.length >= 16, 'só ' + D.BASES.length);
  const apelidos = new Set();
  for (const b of D.BASES) {
    for (const k of ['esp', 'apelido', 'frase']) assert.equal(b[k].length, 3, b.id + ' ' + k);
    assert.ok(D.pelo[b.pelo], b.id + ': pelo padrão ' + b.pelo);
    assert.ok(b.corpos.length >= 1 && b.corpos.every((c) => c === 'pe' || c === 'q'), b.id);
    assert.ok(!apelidos.has(b.apelido[0]), 'apelido repetido ' + b.apelido[0]); apelidos.add(b.apelido[0]);
  }
  assert.ok(D.BASES.filter((b) => b.corpos.includes('q')).length >= 8, 'bichos de 4 patas');
  for (const k of ['robo', 'coala', 'preguica', 'ovelha', 'capivara', 'unicornio', 'girafa', 'elefante']) assert.ok(D.base[k], 'falta ' + k);
});

test('nada da loja de referência: nomes proibidos não aparecem', () => {
  const fs = require('fs'), path = require('path');
  const tudo = fs.readdirSync(path.join(__dirname, '..')).filter((f) => /\.(js|html|json|css)$/.test(f)).map((f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8')).join('\n').toLowerCase();
  for (const p of ['criamigo', 'pedro pudim', 'unibrilho', 'marcão', 'pandoca', 'fernandinho', 'kuromi', 'hello kitty', 'harry potter', 'homem-aranha', 'batman', 'superman', 'mulher-maravilha']) assert.ok(!tudo.includes(p), 'fala de ' + p);
  assert.ok(!/\bstitch\b|\blilo\b/.test(tudo), 'personagem de outra marca');
});

test('textos de todas as listas nos 3 idiomas', () => {
  for (const [nome, lista, k] of [['PELOS', D.PELOS, 'n'], ['ROUPAS', D.ROUPAS, 'n'], ['BAIXOS', D.BAIXOS, 'n'], ['GRUPOS_ROUPA', D.GRUPOS_ROUPA, 'n'], ['ACESS', D.ACESS, 'n'], ['CAIXAS', D.CAIXAS, 'n'], ['VOZES', D.VOZES, 'n'], ['ESTAMPAS', D.ESTAMPAS, 'n'], ['FRASES', D.FRASES, 't'], ['ETAPAS', D.ETAPAS, 'titulo']])
    for (const x of lista) assert.equal(x[k].length, 3, nome + ' ' + x.id);
  assert.equal(D.ETAPAS.length, 7);
  for (const it of D.ACESS) { assert.ok(D.caixa[it.caixa], it.id); if (it.paleta) { assert.ok(D.PALETAS[it.paleta], it.id); assert.ok(D.PALETAS[it.paleta].includes(it.cor), it.id + ' cor padrão na paleta'); } }
  for (const p of Object.values(D.PALETAS)) for (const c of p) assert.ok(D.CORES[c], 'cor ' + c);
});

test('montagem: novo amiguinho já vem pronto; base, corpo, roupa e acessórios', () => {
  const a = R.novo();
  assert.equal(a.roupa, 'nenhuma'); assert.equal(a.fofura, 70); assert.ok(a.nome);
  assert.ok(R.escolherBase(a, 'ovelha')); assert.equal(a.corpo, 'q'); assert.equal(a.nome, 'Nuvem');
  assert.ok(R.escolherCorpo(a, 'pe')); assert.ok(!R.escolherCorpo(a, 'xx'));
  assert.ok(R.vestir(a, 'pijama')); assert.equal(a.corRoupa, 'lilas'); assert.equal(a.estampa, 'estrelas');
  assert.ok(R.corRoupa(a, 'menta')); assert.ok(!R.corRoupa(a, 'naoexiste'));
  assert.ok(R.porAcess(a, 'laco')); assert.ok(R.porAcess(a, 'oculos')); assert.ok(R.porAcess(a, 'patins'));
  assert.equal(R.quantosAcess(a), 3, 'vários ao mesmo tempo');
  assert.ok(R.porAcess(a, 'lacos2')); assert.equal(a.acess.laco, 'lacos2', 'um por caixinha');
  assert.ok(R.porAcess(a, 'skate')); assert.equal(a.acess.pes, undefined, 'skate tira os patins');
  assert.ok(R.porAcess(a, 'cadeira')); assert.equal(a.acess.chao, undefined, 'cadeira de rodas tira o skate');
  R.escolherCorpo(a, 'q'); assert.ok(!R.porAcess(a, 'muletas'), 'muletas só em pé');
  assert.equal(R.alternarAcess(a, 'laco'), true); assert.equal(R.alternarAcess(a, 'laco'), false); assert.equal(a.acess.laco, undefined);
});

test('fofura: murchinho, no ponto, cheio demais; apertão; estrelinhas', () => {
  const a = R.novo(); a.fofura = 0;
  R.encher(a, 30); assert.equal(R.zonaFofura(a.fofura), 'pouco');
  R.encher(a, 38); assert.equal(R.zonaFofura(a.fofura), 'ponto'); assert.equal(R.estrelinhasFofura(a.fofura), 3);
  R.encher(a, 40); assert.equal(R.zonaFofura(a.fofura), 'cheio'); assert.equal(R.estrelinhasFofura(a.fofura), 0);
  R.apertao(a); R.apertao(a); assert.equal(R.zonaFofura(a.fofura), 'ponto');
  R.encher(a, 999); assert.equal(a.fofura, 120);
  const e = A.escalaFofura(5), n = A.escalaFofura(70), g = A.escalaFofura(120);
  assert.ok(e.sy < 0.75 && n.sx === 1 && n.sy === 1 && g.sx > 1.15);
});

test('encaixe: cada roupa e cada acessório em cada bichinho (em pé e de 4 patas) desenha sem erro, nos pontos de ancoragem', () => {
  let n = 0;
  for (const [base, corpo] of corpos) {
    const g = A.geo(base, corpo, null, {});
    // pontos de ancoragem dentro do desenho
    for (const k of ['topo', 'pescoco', 'peito', 'colo', 'costas', 'pulso', 'maoItem', 'focinho']) {
      const p = g[k]; assert.ok(p && isFinite(p[0]) && isFinite(p[1]) && p[0] > 0 && p[0] < 300 && p[1] > -24 && p[1] < 372, base + '/' + corpo + ': ponto ' + k + ' ' + p);
    }
    assert.equal(g.pes.length, corpo === 'q' ? 4 : 2);
    for (const pe of g.pes) assert.ok(pe[1] > g.cab.y + g.cab.ry - 10 && pe[1] < g.chao, base + ': pé abaixo da cabeça e acima do chão');
    // 4 patas: a cabeça encosta no corpo (dono, 22/Nov/2026: "por que os corpos estão separados das cabeças?")
    if (corpo === 'q' && !g.pescocoLongo) {
      const x = g.b.x - g.b.rx * 0.5, fundoCab = g.cab.y + g.cab.ry * Math.sqrt(Math.max(0, 1 - ((x - g.cab.x) / g.cab.rx) ** 2)), topoCorpo = g.b.y - g.b.ry * Math.sqrt(1 - 0.25);
      assert.ok(fundoCab >= topoCorpo - 2, base + ': cabeça de 4 patas encostada no corpo (' + fundoCab.toFixed(0) + ' / ' + topoCorpo.toFixed(0) + ')');
    }
    for (const l of g.laco) { const dx = (l[0] - g.cab.x) / g.cab.rx, dy = (l[1] - g.cab.y) / g.cab.ry; assert.ok(Math.abs(Math.hypot(dx, dy) - 0.9) < 0.01, base + ': laço na borda da cabeça'); }
    const nu = R.novo(base); R.escolherCorpo(nu, corpo);
    const semNada = A.svg(nu, { id: 't' });
    for (const r of D.ROUPAS) {
      const a = R.novo(base); R.escolherCorpo(a, corpo); R.vestir(a, r.id);
      const s = A.svg(a, { id: 't' }); n++;
      assert.ok(!/NaN|undefined|Infinity/.test(s), base + '/' + corpo + '/' + r.id + ': número estragado');
      if (r.id !== 'nenhuma') assert.ok(s.length > semNada.length + 200, base + '/' + corpo + '/' + r.id + ': a roupa não apareceu');
    }
    for (const x of D.BAIXOS) {
      const a = R.novo(base); R.escolherCorpo(a, corpo);
      if (!R.vestirBaixo(a, x.id)) { assert.ok(x.so && x.so !== corpo, x.id + ' recusado sem motivo'); continue; }
      const s = A.svg(a, { id: 't' }); n++;
      assert.ok(!/NaN|undefined|Infinity/.test(s), base + '/' + corpo + '/' + x.id + ': número estragado');
      assert.ok(s.length > semNada.length + 200, base + '/' + corpo + '/' + x.id + ': a parte de baixo não apareceu');
      R.vestir(a, 'camiseta-lisa'); const s2 = A.svg(a, { id: 't' });
      const soBlusa = A.svg(Object.assign({}, a, { baixo: null }), { id: 't' });
      assert.ok(!/NaN|undefined|Infinity/.test(s2) && s2 !== s && s2 !== soBlusa && s2.length > semNada.length + 400, base + '/' + corpo + '/' + x.id + ' com blusa');
    }
    for (const it of D.ACESS) {
      const a = R.novo(base); R.escolherCorpo(a, corpo);
      if (!R.porAcess(a, it.id)) { assert.ok(it.so && it.so !== corpo, it.id + ' recusado sem motivo'); continue; }
      const s = A.svg(a, { id: 't' }); n++;
      assert.ok(!/NaN|undefined|Infinity/.test(s), base + '/' + corpo + '/' + it.id + ': número estragado');
      assert.ok(s.length > semNada.length + 100, base + '/' + corpo + '/' + it.id + ': o acessório não apareceu');
    }
  }
  assert.ok(n > 2000, 'combinações testadas: ' + n);
});

test('capuz tira o chapéu do desenho, mas não do amiguinho; robozinho tem telinha de LED com expressões', () => {
  const a = R.novo('urso'); R.porAcess(a, 'coroa');
  const com = A.svg(a, { id: 'x' }); R.vestir(a, 'noel'); const capuz = A.svg(a, { id: 'x' });
  assert.ok(com.includes('#ffd35c')); assert.ok(!capuz.includes('#ffd35c')); assert.equal(a.acess.cabeca, 'coroa');
  const r = R.novo('robo'), g = A.geo('robo', 'pe');
  for (const e of A.EXPRESSOES) assert.ok((A.telaLed(e, g).match(/led on/g) || []).length > 6, e);
  assert.match(A.svg(r, { id: 'r', anim: true }), /ma-tela/);
});

test('pelúcia viva: partes com pivô (corpo, cabeça, braços ou patas, rabo, olhos)', () => {
  const pe = A.svg(R.novo('urso'), { id: 'v', anim: true }), q = A.svg(R.novo('ovelha'), { id: 'v', anim: true });
  for (const c of ['ma-respira', 'ma-cabeca', 'ma-olho', 'ma-braco', 'ma-orelhas']) assert.match(pe, new RegExp(c));
  assert.equal((q.match(/class="ma-pata"/g) || []).length, 4);
  assert.match(q, /ma-rabo/);
  assert.match(A.svg(R.novo('preguica'), { id: 'p', pose: 'pendurada' }), /#9a6a46/, 'preguiça pendurada no galho');
});

// Dono, 22/Nov/2026: "não precisa de nível médio, encomenda, difícil, é só para desenho tranquilo".
test('sem níveis nem Encomenda; amiguinho antigo (com encomenda e estrelas) continua abrindo normal', () => {
  for (const f of ['opcoes', 'novaEncomenda', 'textoEncomenda', 'conferir']) assert.equal(R[f], undefined, f + ' não existe mais');
  const antigo = { id: 'a1', base: 'coelha', corpo: 'pe', pelo: 'rosa', roupa: 'pijama', corRoupa: 'lilas', acess: { laco: 'laco', pes: 'patins' }, corAcess: { laco: 'azul' },
    encomenda: { estrelas: 3, acertos: 7, total: 7 }, nome: 'Bibi', frases: [{ pronta: 'teamo' }] };
  const a = R.validar(antigo);
  assert.equal(a.base, 'coelha'); assert.equal(a.roupa, 'pijama'); assert.deepEqual(a.acess, { laco: 'laco', pes: 'patins' }); assert.equal(a.nome, 'Bibi');
  assert.equal(a.encomenda, undefined, 'as estrelas da Encomenda não aparecem mais');
  assert.ok(A.svg(a, { id: 'x' }).length > 1000);
});

// Peças que mudaram de caixinha (asas, bolsas, pochete): o amiguinho guardado antes continua com elas, na caixinha nova.
test('amiguinho antigo: cada peça vai para a caixinha atual dela; duas na mesma caixinha, fica a primeira', () => {
  const a = R.validar({ base: 'urso', acess: { costas: 'asas', mao: 'bolsa-coracao', pulso: 'pochete' } });
  const ordem = ['asas', 'bolsa-coracao', 'pochete'], primeira = {};
  for (const id of ordem) if (!primeira[D.acess[id].caixa]) primeira[D.acess[id].caixa] = id;   // (se duas caírem na mesma caixinha, fica a primeira)
  assert.deepEqual(a.acess, primeira);
  const b = R.validar({ base: 'urso', acess: { laco: 'laco', cabeca: 'lacos2' } });
  assert.deepEqual(b.acess, { laco: 'laco' });
  assert.deepEqual(R.validar({ base: 'urso', acess: { laco: 'nao-existe' } }).acess, {});
});

test('coleção: os 2 exemplos sempre lá; salvar, editar e apagar; dado estragado não entra', () => {
  const mem = {}, st = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); } };
  const C = R.Colecao(st);
  assert.deepEqual(C.listar().map((x) => x.nome), ['Alice', 'Coraçãozinho']);
  const alice = C.obter('ex-alice');
  assert.equal(alice.base, 'coala'); assert.equal(alice.acess.colo, 'filhote'); assert.equal(alice.nomeFilhote, 'Kaká'); assert.equal(alice.roupa, 'vestido-nuvens');
  assert.equal(C.obter('ex-coracaozinho').roupa, 'noel'); assert.equal(C.obter('ex-coracaozinho').corpo, 'q');
  assert.equal(C.apagar('ex-alice'), false, 'exemplo não se apaga');
  const a = R.novo('dino'); a.nome = 'Rex'; const s = C.salvar(a);
  assert.equal(s.id, a.id); assert.equal(C.listar().length, 3); assert.equal(C.listar()[0].nome, 'Rex');
  a.nome = 'Rex 2'; C.salvar(a); assert.equal(C.listar().length, 3, 'editar não duplica'); assert.equal(C.obter(a.id).nome, 'Rex 2');
  const copia = C.salvar(alice); assert.notEqual(copia.id, 'ex-alice', 'editar um exemplo vira um novo'); assert.equal(C.listar().length, 4);
  assert.ok(C.apagar(a.id)); assert.equal(C.listar().length, 3);
  mem[R.CHAVE] = JSON.stringify([{ base: 'naoexiste' }, { base: 'urso', pelo: 'xx', roupa: 'yy', acess: { laco: 'coroa', cabeca: 'coroa' }, frases: [{ texto: 'a'.repeat(200) }] }]);
  const l = C.meus(); assert.equal(l.length, 1); assert.equal(l[0].pelo, 'caramelo'); assert.equal(l[0].roupa, 'nenhuma'); assert.deepEqual(l[0].acess, { cabeca: 'coroa' }); assert.equal(l[0].frases[0].texto.length, 60);
});

// Barra de tom ☀️ ↔ 🌙 (dono, 22/Nov/2026: "assim como no Purpurina… mais escuro, mais claro, com vários tons").
test('tom: clareia e escurece o pelo, a roupa e cada acessório no desenho; fica lembrado; amiguinho antigo sem tom fica igual', () => {
  const luz = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16)); return c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11; };
  const a = R.novo('urso'); R.vestir(a, 'pijama'); R.porAcess(a, 'laco');
  const antes = A.svg(a, { id: 't' });
  const pelo = D.pelo[a.pelo].cor, roupa = D.CORES[a.corRoupa].hex, laco = D.CORES[D.acess.laco.cor].hex;
  for (const h of [pelo, roupa, laco]) assert.ok(antes.includes(h), 'cor de sempre ' + h);
  assert.ok(R.tom(a, 'pelo', 0.6)); assert.ok(R.tom(a, 'roupa', -0.5)); assert.ok(R.tom(a, 'acess', 0.8, 'laco'));
  assert.ok(!R.tom(a, 'acess', 0.5, 'nao-existe')); assert.ok(!R.tom(a, 'nariz', 0.5));
  const depois = A.svg(a, { id: 't' });
  for (const [h, v] of [[pelo, 0.6], [roupa, -0.5], [laco, 0.8]]) {
    const nova = A.comTom(h, v);
    assert.ok(depois.includes(nova), 'tom aplicado em ' + h);
    assert.ok(v > 0 ? luz(nova) < luz(h) - 10 : luz(nova) > luz(h) + 10, 'mais ' + (v > 0 ? 'escuro' : 'claro') + ': ' + h + ' → ' + nova);
  }
  assert.ok(!depois.includes('fill="' + pelo + '"'), 'o pelo inteiro mudou de tom');
  // o contorno e a parte clarinha do pelo acompanham a cor nova
  assert.ok(!depois.includes(A.util.escuro(pelo, 0.38)) && depois.includes(A.util.escuro(A.comTom(pelo, 0.6), 0.38)), 'contorno acompanha');
  // lembrado: o amiguinho guardado (coleção e rascunho passam pelo validar) volta com o mesmo tom e o mesmo desenho
  const mem = {}, st = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); } };
  const guardado = R.Colecao(st).salvar(a);
  assert.deepEqual(R.Colecao(st).obter(guardado.id).tom, { pelo: 0.6, roupa: -0.5, acess: { laco: 0.8 } });
  assert.equal(A.svg(R.validar(JSON.parse(JSON.stringify(a))), { id: 't' }), depois);
  // voltar para o meio tira o tom
  R.tom(a, 'pelo', 0); R.tom(a, 'roupa', 0.01); R.tom(a, 'acess', 0, 'laco');
  assert.equal(a.tom, undefined); assert.equal(A.svg(a, { id: 't' }), antes);
  // amiguinho antigo, sem o campo tom: o desenho é o de sempre
  const velho = R.validar({ base: 'coelha', pelo: 'rosa', roupa: 'pijama', corRoupa: 'menta', acess: { laco: 'laco' }, corAcess: { laco: 'azul' } });
  assert.equal(velho.tom, undefined);
  const igual = R.novo('coelha'); igual.id = velho.id; igual.pelo = 'rosa'; R.vestir(igual, 'pijama'); R.corRoupa(igual, 'menta'); R.porAcess(igual, 'laco'); R.corAcess(igual, 'laco', 'azul');
  igual.nome = velho.nome; igual.nasceu = velho.nasceu;
  assert.equal(A.svg(velho, { id: 't' }), A.svg(igual, { id: 't' }));
  // valor estragado: fica no limite ou é ignorado
  assert.deepEqual(R.validar({ base: 'urso', tom: { pelo: 'x', roupa: 9, acess: { 'nao-existe': 0.5, laco: -3 } } }).tom, { roupa: 1, acess: { laco: -1 } });
  // o holográfico (arco-íris) não tem claro e escuro
  assert.equal(A.comTom('#cfd8f0', 1), '#cfd8f0');
});

// Partes de baixo (dono, 22/Nov/2026: "vários tipos de saias, vários tipos de shortinhos, vários tipos de roupa").
test('guarda-roupa: roupas inteiras, partes de cima e partes de baixo; inteira tira a de baixo e vice-versa; cor e tom da parte de baixo', () => {
  assert.ok(D.ROUPAS.every((r) => r.id === 'nenhuma' || r.grupo === 'inteira' || r.grupo === 'cima'), 'toda roupa diz o grupo');
  assert.ok(D.ROUPAS.filter((r) => r.grupo === 'inteira').length >= 38, 'roupas inteiras');
  assert.ok(D.ROUPAS.filter((r) => r.grupo === 'cima').length >= 28, 'partes de cima');
  assert.ok(D.BAIXOS.filter((x) => x.saia).length >= 7 && D.BAIXOS.filter((x) => !x.saia).length >= 13, 'saias, shorts e calças');
  assert.deepEqual(D.GRUPOS_ROUPA.map((g) => g.id), ['inteira', 'cima', 'baixo']);
  for (const x of D.BAIXOS) if (x.cores) { assert.ok(D.PALETAS[x.paleta], x.id); assert.ok(D.PALETAS[x.paleta].includes(x.padrao.cor), x.id + ' cor padrão na paleta'); }
  for (const r of D.ROUPAS) if (r.cores && r.paleta) assert.ok(D.PALETAS[r.paleta].includes(r.padrao.cor), r.id + ' cor padrão na paleta');
  const a = R.novo('urso');
  assert.equal(a.baixo, null);
  assert.ok(R.vestir(a, 'camiseta-coracao')); assert.ok(R.vestirBaixo(a, 'tutu-glitter'));
  assert.equal(a.roupa, 'camiseta-coracao'); assert.equal(a.baixo, 'tutu-glitter'); assert.equal(a.corBaixo, 'rosa-choque', 'parte de cima e de baixo juntas');
  assert.ok(R.corBaixo(a, 'lilas')); assert.ok(!R.corBaixo(a, 'jeans'), 'cor fora da paleta do tutu');
  const comTutu = A.svg(a, { id: 't' });
  assert.ok(comTutu.includes(D.CORES.lilas.hex));
  assert.ok(R.tom(a, 'baixo', 0.7)); assert.ok(A.svg(a, { id: 't' }).includes(A.comTom(D.CORES.lilas.hex, 0.7)), 'tom da parte de baixo');
  assert.ok(R.vestir(a, 'vestido-nuvens')); assert.equal(a.baixo, null, 'roupa inteira tira a parte de baixo');
  assert.ok(R.vestirBaixo(a, 'short-jeans')); assert.equal(a.roupa, 'nenhuma', 'parte de baixo tira a roupa inteira');
  assert.ok(R.vestir(a, 'moletom-listras')); assert.equal(a.baixo, 'short-jeans', 'parte de cima não tira a de baixo');
  assert.ok(R.vestirBaixo(a, 'nenhum')); assert.equal(a.baixo, null);
  assert.ok(!R.vestirBaixo(a, 'nao-existe'));
  // a parte de baixo sozinha também aparece (sem blusa) e o patch do peito só aparece com blusa
  const b = R.novo('urso'); b.patch = 'letra-A'; R.vestirBaixo(b, 'calca-jeans');
  assert.ok(!/>A<\/text>/.test(A.svg(b, { id: 't' })), 'sem blusa, sem patch');
});

test('amiguinho antigo: a parte de cima que vinha com bermuda ou calça ganha a mesma, separada, com a mesma cor', () => {
  const VELHAS = { camiseta: '#3c5c94', moletom: '#2e2a33', 'corta-vento': '#2f3f6e', social: '#2f3f6e', polo: '#c8b48a', 'jaqueta-prata': '#3a3f52', 'jaqueta-couro': '#5b7fb8', 'camiseta-lisa': '#5b7fb8', skatista: '#8fb0dc' };
  for (const r of D.ROUPAS.filter((x) => x.vinhaCom)) {
    const [bx, cor] = r.vinhaCom;
    assert.ok(D.baixo[bx], r.id + ': ' + bx); assert.ok(D.PALETAS[D.baixo[bx].paleta].includes(cor), r.id + ': ' + cor + ' na paleta');
    const a = R.validar({ base: 'urso', roupa: r.id, acess: {} });
    assert.equal(a.baixo, bx, r.id); assert.equal(a.corBaixo, cor, r.id);
    if (VELHAS[r.id]) assert.ok(A.svg(a, { id: 't' }).includes(VELHAS[r.id]), r.id + ': a parte de baixo de antes (' + VELHAS[r.id] + ')');
  }
  // guardado já no jeito novo: a escolha fica (sem parte de baixo, ou outra)
  assert.equal(R.validar({ base: 'urso', roupa: 'camiseta', baixo: null }).baixo, null);
  assert.equal(R.validar({ base: 'urso', roupa: 'camiseta', baixo: 'tutu-arco' }).baixo, 'tutu-arco');
  // roupa inteira e parte de baixo juntas (dado estragado): fica a parte de baixo
  const x = R.validar({ base: 'urso', roupa: 'pijama', baixo: 'saia-jeans', corBaixo: 'rosa' });
  assert.equal(x.roupa, 'nenhuma'); assert.equal(x.baixo, 'saia-jeans'); assert.equal(x.corBaixo, 'rosa');
  // os exemplos da coleção (roupas inteiras) continuam iguais
  assert.equal(R.validar(R.EXEMPLOS[0]).baixo, null);
});

test('frases: prontas nos 3 idiomas com o nome da criança, escritas até 60 letras', () => {
  assert.equal(R.textoFrase({ pronta: 'teamo' }, 'pt', 'Bia'), 'Eu te amo, Bia!');
  assert.equal(R.textoFrase({ pronta: 'teamo' }, 'en', ''), 'I love you!');
  assert.equal(R.textoFrase({ pronta: 'noite' }, 'es', 'Leo'), '¡Buenas noches, Leo, que duermas bien!');
  assert.equal(R.textoFrase({ texto: 'x'.repeat(80) }, 'pt').length, 60);
});
