// Quem é? — A Meleca Adivinha: a lista de personagens (personagens/*.js) e as perguntas (adivinha-perguntas.js).
// Rodar da raiz: node --test quem-e/teste/adivinha-dados.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const Q = require('../adivinha-perguntas.js');
const pasta = path.join(__dirname, '..', 'personagens');
const arquivos = fs.readdirSync(pasta).filter(f => f.endsWith('.js')).sort();
const lista = [];
for (const f of arquivos) for (const e of require(path.join(pasta, f))) lista.push({ f, e });
const nucleo = Q.PERGUNTAS.filter(p => p.nucleo).map(p => p.id);
function respostas(txt) { const r = {}; for (const par of txt.trim().split(/\s+/)) { const [k, v] = par.split(':'); r[k] = v; } return r; }

test('perguntas: ids únicos, nível, grupo, textos PT/EN/ES com interrogação, padrão válido', () => {
  const ids = new Set();
  for (const p of Q.PERGUNTAS) {
    assert.ok(/^[a-z0-9-]+$/.test(p.id) && !ids.has(p.id), p.id); ids.add(p.id);
    assert.ok(['I', 'F', 'A'].includes(p.n), p.id);
    assert.ok(Q.GRUPOS[p.g], p.id);
    assert.ok(/\?$/.test(p.pt) && /\?$/.test(p.en) && /^¿.*\?$/.test(p.es), p.id);
    assert.ok(['?', 'n'].includes(p.padrao), p.id);
  }
  assert.ok(Q.PERGUNTAS.length >= 120, 'perguntas: ' + Q.PERGUNTAS.length);
});

test('personagens: pelo menos 600, formato certo, ids e nomes únicos', () => {
  assert.ok(lista.length >= 600, 'personagens: ' + lista.length);
  const ids = new Set(), nomes = new Set();
  for (const { f, e } of lista) {
    assert.ok(Array.isArray(e) && e.length === 5, f + ': ' + JSON.stringify(e).slice(0, 80));
    const [id, nome, emoji, niveis, txt] = e;
    assert.ok(/^[a-z0-9-]+$/.test(id), f + ': id ' + id);
    assert.ok(!ids.has(id), 'id repetido: ' + id); ids.add(id);
    const n = nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    assert.ok(nome.length >= 2 && !nomes.has(n), 'nome repetido ou vazio: ' + nome); nomes.add(n);
    assert.ok(emoji && emoji.length <= 16, id + ': emoji');
    assert.ok(['IFA', 'FA', 'A'].includes(niveis), id + ': níveis ' + niveis);
    const r = respostas(txt);
    for (const k of Object.keys(r)) {
      assert.ok(Q.POR_ID[k], id + ': pergunta desconhecida ' + k);
      assert.ok(Q.RESPOSTAS.includes(r[k]), id + ': resposta ' + k + ':' + r[k]);
    }
    for (const k of nucleo) assert.ok(r[k], id + ': falta a resposta do núcleo ' + k);
  }
});

test('personagens: sem contradição', () => {
  for (const { e } of lista) {
    const [id, , , , txt] = e, r = respostas(txt);
    const tipos = ['pessoa', 'bicho', 'coisa'].filter(k => r[k] === 's');
    assert.ok(tipos.length <= 1, id + ': ' + tipos.join(' e '));
    assert.ok(!(r.masculino === 's' && r.feminino === 's'), id + ': menino e menina');
    assert.ok(!(r.crianca === 's' && r.idoso === 's'), id + ': criança e velhinho');
    for (const k of Object.keys(r)) if (k.startsWith('t-') && r[k] === 's') assert.notEqual(r.real, 's', id + ': de verdade e de ' + k);
  }
});

test('em cada nível, dois personagens nunca respondem tudo igual', () => {
  const ordem = { I: 0, F: 1, A: 2 };
  for (const nivel of ['I', 'F', 'A']) {
    const ps = Q.PERGUNTAS.filter(p => ordem[p.n] <= ordem[nivel]);
    const vistos = new Map();
    for (const { e } of lista) {
      if (!e[3].includes(nivel)) continue;
      const r = respostas(e[4]);
      const ass = ps.map(p => { const v = r[p.id] || p.padrao; return v === 'p' ? 's' : v === 'q' ? 'n' : v; }).join('');
      assert.ok(!vistos.has(ass), nivel + ': ' + e[0] + ' é igual a ' + vistos.get(ass));
      vistos.set(ass, e[0]);
    }
  }
});

test('o João Alves está na lista, em todos os níveis, como alguém da casa', () => {
  const j = lista.find(x => x.e[0] === 'joao-alves');
  assert.ok(j, 'sem o João Alves');
  assert.equal(j.e[3], 'IFA');
  assert.equal(respostas(j.e[4]).casa, 's');
});
