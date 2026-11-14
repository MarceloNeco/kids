// Quem é? — A Meleca Adivinha aprende (aprender.js). Rodar da raiz: node --test quem-e/teste/aprender.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const AP = require('../aprender.js');
const Q = require('../adivinha-perguntas.js');

function memoria() { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; }, m }; }
const hist = [{ id: 'pessoa', r: 's' }, { id: 'real', r: 's' }, { id: 'crianca', r: 's' }, { id: 'masculino', r: 's' }, { id: 'canta', r: '?' }, { id: 'cor-azul', r: 'p' }];

test('ensinar alguém novo: guarda as respostas dadas (sem os "não sei") e o nível vale para ele e os de cima', () => {
  const ap = AP.criar({ armazenamento: memoria() });
  const p = ap.ensinar({ nome: 'Meu irmão Theo', emoji: '👦', nivel: 'I', historico: hist });
  assert.match(p.id, /^apr-/);
  assert.equal(p.niveis, 'IFA');
  assert.deepEqual(p.r, { pessoa: 's', real: 's', crianca: 's', masculino: 's', 'cor-azul': 'p', casa: 's' });
  const q = ap.ensinar({ nome: 'Vovó Cida', emoji: '👵', nivel: 'A', historico: hist.slice(0, 2) });
  assert.equal(q.niveis, 'A');
  assert.equal(ap.lista().length, 2);
  assert.equal(AP.criar({ armazenamento: ap.armazenamento }).lista().length, 2, 'não ficou guardado');
});

test('ensinar de novo o mesmo nome junta as respostas (a mais nova vale)', () => {
  const ap = AP.criar({ armazenamento: memoria() });
  ap.ensinar({ nome: 'Theo', emoji: '👦', nivel: 'F', historico: [{ id: 'canta', r: 'n' }, { id: 'pessoa', r: 's' }] });
  const p = ap.ensinar({ nome: ' theo ', emoji: '🧒', nivel: 'I', historico: [{ id: 'canta', r: 's' }] });
  assert.equal(ap.lista().length, 1);
  assert.equal(p.r.canta, 's'); assert.equal(p.r.pessoa, 's');
  assert.equal(p.niveis, 'IFA', 'ensinado no Infantil passa a valer em todos');
});

test('corrigir um personagem da lista pronta: guarda só a correção', () => {
  const ap = AP.criar({ armazenamento: memoria() });
  ap.corrigir('pikachu', [{ id: 'cor-amarelo', r: 's' }, { id: 'voa', r: 'n' }, { id: 'magia', r: '?' }]);
  ap.corrigir('pikachu', [{ id: 'voa', r: 'q' }]);
  assert.deepEqual(ap.correcoes(), { pikachu: { 'cor-amarelo': 's', voa: 'q' } });
});

test('esquecer, exportar e importar sem duplicar', () => {
  const a = AP.criar({ armazenamento: memoria() });
  const t = a.ensinar({ nome: 'Theo', emoji: '👦', nivel: 'I', historico: hist });
  a.ensinar({ nome: 'Tia Bia', emoji: '👩', nivel: 'F', historico: hist.slice(0, 3) });
  a.corrigir('pikachu', [{ id: 'voa', r: 'n' }]);
  const arquivo = a.exportar();
  const b = AP.criar({ armazenamento: memoria() });
  b.ensinar({ nome: 'theo', emoji: '👦', nivel: 'I', historico: [{ id: 'oculos', r: 's' }] });
  const r = b.importar(arquivo);
  assert.deepEqual(r, { novos: 1, juntados: 1, correcoes: 1 });
  assert.equal(b.lista().length, 2);
  assert.equal(b.lista().find(p => p.nome.toLowerCase() === 'theo').r.oculos, 's');
  assert.equal(b.importar(arquivo).novos, 0, 'importar de novo duplicou');
  a.esquecer(t.id);
  assert.equal(a.lista().length, 1);
});

test('arquivo estranho na importação: limpa o que não presta e não quebra', () => {
  const b = AP.criar({ armazenamento: memoria() });
  assert.throws(() => b.importar('isso não é json'), /arquivo/);
  assert.throws(() => b.importar(JSON.stringify({ formato: 1, app: 'outro' })), /arquivo/);
  const r = b.importar(JSON.stringify({ formato: 1, app: 'quem-e', aprendidos: [
    { nome: '<img src=x onerror=alert(1)>Zé', emoji: '😀😀😀😀😀😀😀😀😀😀', niveis: 'IFA', r: { pessoa: 's', inventada: 's', canta: 'talvez' } },
    { nome: '', r: {} }, null, 5
  ], correcoes: { pikachu: { voa: 'x', 'cor-amarelo': 's' }, '<b>': { voa: 's' } } }));
  assert.equal(r.novos, 1);
  const z = b.lista()[0];
  assert.ok(!/[<>]/.test(z.nome));
  assert.ok(z.emoji.length <= 8);
  assert.deepEqual(Object.keys(z.r).sort(), ['casa', 'pessoa']);
  assert.deepEqual(b.correcoes(), { pikachu: { 'cor-amarelo': 's' } });
  for (const k of Object.keys(z.r)) assert.ok(Q.POR_ID[k]);
});
