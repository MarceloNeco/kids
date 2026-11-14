// Quem é? — desenho das caras (caras.js). Rodar da raiz: node --test quem-e/teste/caras.test.js
const test = require('node:test');
const assert = require('node:assert');
const L = require('../logica.js');
const C = require('../caras.js');

const base = () => Object.assign({}, L.gerarTabuleiro(4, 'dificil').caras.find(c => c.tipo === 'mulher' && c.cabeloComp !== 'careca' && !c.peruca), {
  oculos: 'nenhum', nariz: false, pelos: 'nenhum', cabeca: 'nada', brinco: false, colar: false, sardas: false, peruca: null });

test('SVG bem formado, com viewBox do busto e ids prefixados', () => {
  for (const nivel of ['facil', 'medio', 'dificil']) {
    for (const c of L.gerarTabuleiro(12, nivel).caras) {
      const s = C.svg(c, { id: 'c' + c.id });
      assert.ok(s.startsWith('<svg') && s.endsWith('</svg>'));
      assert.ok(s.includes('viewBox="0 0 300 360"'));
      for (const m of s.matchAll(/ id="([^"]+)"/g)) assert.ok(m[1].startsWith('c' + c.id), 'id sem prefixo: ' + m[1]);
      for (const m of s.matchAll(/url\(#([^)]+)\)/g)) assert.ok(s.includes(' id="' + m[1] + '"'), 'referência sem alvo: ' + m[1]);
      assert.ok(!/<script|<image|href="http|on\w+=/i.test(s), 'conteúdo proibido');
    }
  }
});

test('cada característica muda o desenho', () => {
  const b = base();
  const casos = { tipo: 'homem', pele: b.pele === 'p1' ? 'p5' : 'p1', cabeloCor: b.cabeloCor === 'ruivo' ? 'preto' : 'ruivo',
    cabeloComp: b.cabeloComp === 'curto' ? 'comprido' : 'curto', peruca: 'arco', olhos: b.olhos === 'azuis' ? 'verdes' : 'azuis',
    oculos: 'escuros', sardas: true, nariz: true, cabeca: 'coroa', brinco: true, colar: true,
    roupaCor: b.roupaCor === 'roxo' ? 'verde' : 'roxo', estampa: b.estampa === 'xadrez' ? 'bolinhas' : 'xadrez' };
  const s0 = C.svg(b, { id: 'x' });
  for (const k of Object.keys(casos)) {
    const c = Object.assign({}, b, { [k]: casos[k] });
    assert.notStrictEqual(C.svg(c, { id: 'x' }), s0, 'não mudou: ' + k);
  }
  for (const v of ['grau', 'coloridos']) assert.notStrictEqual(C.svg(Object.assign({}, b, { oculos: v }), { id: 'x' }), C.svg(Object.assign({}, b, { oculos: 'escuros' }), { id: 'x' }));
  for (const v of ['bone', 'chapeu', 'laco', 'tiara']) assert.notStrictEqual(C.svg(Object.assign({}, b, { cabeca: v }), { id: 'x' }), C.svg(Object.assign({}, b, { cabeca: 'coroa' }), { id: 'x' }), v);
  const homem = Object.assign({}, b, { tipo: 'homem' });
  assert.notStrictEqual(C.svg(Object.assign({}, homem, { pelos: 'barba' }), { id: 'x' }), C.svg(Object.assign({}, homem, { pelos: 'bigode' }), { id: 'x' }));
});

test('nariz de palhaço é vermelho', () => {
  assert.ok(/#e8203a|#ff2d4a/i.test(C.svg(Object.assign(base(), { nariz: true }), { id: 'n' })));
});

test('tamanho: carta normal leve, versão da lupa mais detalhada', () => {
  for (const c of L.gerarTabuleiro(31, 'dificil').caras) {
    const p = C.svg(c, { id: 'a' }), g = C.svg(c, { id: 'a', grande: true });
    assert.ok(p.length < 14000, 'carta pesada: ' + p.length);
    assert.ok(g.length < 40000, 'lupa pesada: ' + g.length);
    assert.ok(g.length > p.length, 'lupa sem detalhe a mais');
  }
});

test('largura e altura opcionais', () => {
  const s = C.svg(base(), { id: 'w', largura: 120, altura: 144 });
  assert.ok(s.includes('width="120"') && s.includes('height="144"'));
});

test('corpo inteiro: desenho alto, e cada peça de roupa muda o desenho', () => {
  const b = Object.assign(base(), { baixo: 'calca', calcado: 'tenis', mochila: false, segura: null });
  const s0 = C.svg(b, { id: 'k', corpo: true });
  assert.ok(s0.includes('viewBox="0 0 300 620"'));
  for (const [k, v] of [['baixo', 'saia'], ['baixo', 'short'], ['baixo', 'vestido'], ['calcado', 'bota'], ['calcado', 'descalco'], ['calcado', 'sapato'], ['mochila', true], ['segura', 'balao'], ['segura', 'bola'], ['segura', 'sorvete']])
    assert.notEqual(C.svg(Object.assign({}, b, { [k]: v }), { id: 'k', corpo: true }), s0, k + '=' + v);
  for (const m of s0.matchAll(/url\(#([^)]+)\)/g)) assert.ok(s0.includes(' id="' + m[1] + '"'), m[1]);
  assert.ok(s0.length < 22000, 'pesado: ' + s0.length);
});
