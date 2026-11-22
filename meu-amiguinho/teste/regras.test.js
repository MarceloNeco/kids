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
  for (const [nome, lista, k] of [['PELOS', D.PELOS, 'n'], ['ROUPAS', D.ROUPAS, 'n'], ['ACESS', D.ACESS, 'n'], ['CAIXAS', D.CAIXAS, 'n'], ['VOZES', D.VOZES, 'n'], ['ESTAMPAS', D.ESTAMPAS, 'n'], ['FRASES', D.FRASES, 't'], ['ETAPAS', D.ETAPAS, 'titulo']])
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

test('frases: prontas nos 3 idiomas com o nome da criança, escritas até 60 letras', () => {
  assert.equal(R.textoFrase({ pronta: 'teamo' }, 'pt', 'Bia'), 'Eu te amo, Bia!');
  assert.equal(R.textoFrase({ pronta: 'teamo' }, 'en', ''), 'I love you!');
  assert.equal(R.textoFrase({ pronta: 'noite' }, 'es', 'Leo'), '¡Buenas noches, Leo, que duermas bien!');
  assert.equal(R.textoFrase({ texto: 'x'.repeat(80) }, 'pt').length, 60);
});
