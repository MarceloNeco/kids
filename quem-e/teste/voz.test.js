// Quem é? — voz da meleca (voz.js). Rodar da raiz: node --test quem-e/teste/voz.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const V = require('../voz.js');

function ambiente(op = {}) {
  const reg = { fetches: [], faladas: [], tocadas: [], cache: new Map() };
  const amb = {
    online: op.online !== false,
    cofre: { tem: n => !!op.chave && n === 'ia:elevenlabs', ler: n => Promise.resolve(op.chave || '') },
    fetch: (url, o) => { reg.fetches.push({ url, o }); if (op.falha) return Promise.resolve({ ok: false, status: 429, blob: () => Promise.resolve(null) }); return Promise.resolve({ ok: true, status: 200, blob: () => Promise.resolve({ tamanho: 10 }), clone() { return this; } }); },
    caches: { open: () => Promise.resolve({ match: k => Promise.resolve(reg.cache.has(k) ? { blob: () => Promise.resolve(reg.cache.get(k)) } : undefined), put: (k, r) => r.blob().then(b => { reg.cache.set(k, b); }) }) },
    tocarAudio: blob => { reg.tocadas.push(blob); return Promise.resolve(); },
    falarAparelho: (txt, jeito) => { reg.faladas.push({ txt, jeito }); return Promise.resolve(); },
    pararTudo: () => {}
  };
  return { amb, reg };
}

test('sem chave: voz do aparelho, com o jeito de cada meleca', async () => {
  const { amb, reg } = ambiente();
  const v = V.criar(amb);
  await v.falar('Oi!', { meleca: 'blue' });
  await v.falar('Oi!', { meleca: 'pink' });
  assert.equal(reg.fetches.length, 0);
  assert.equal(reg.faladas.length, 2);
  assert.ok(reg.faladas[0].jeito.pitch < reg.faladas[1].jeito.pitch, 'a Pink fala mais fininho');
});

test('com chave e ligada: pede uma vez à ElevenLabs e depois usa a guardada', async () => {
  const { amb, reg } = ambiente({ chave: 'sk_teste' });
  const v = V.criar(amb); v.usarEleven(true);
  await v.falar('Você pensou no Pikachu?', { meleca: 'pink' });
  await v.falar('Você pensou no Pikachu?', { meleca: 'pink' });
  assert.equal(reg.fetches.length, 1);
  assert.match(reg.fetches[0].url, /^https:\/\/api\.elevenlabs\.io\/v1\/text-to-speech\//);
  assert.equal(reg.fetches[0].o.headers['xi-api-key'], 'sk_teste');
  assert.equal(JSON.parse(reg.fetches[0].o.body).text, 'Você pensou no Pikachu?');
  assert.equal(reg.tocadas.length, 2);
  assert.equal(reg.faladas.length, 0);
});

test('ElevenLabs falhou (cota, erro): cai na voz do aparelho sem erro', async () => {
  const { amb, reg } = ambiente({ chave: 'sk_teste', falha: true });
  const v = V.criar(amb); v.usarEleven(true);
  await v.falar('Oi!', { meleca: 'blue' });
  assert.equal(reg.faladas.length, 1);
});

test('texto privado (nome ensinado pela família) nunca vai para a internet', async () => {
  const { amb, reg } = ambiente({ chave: 'sk_teste' });
  const v = V.criar(amb); v.usarEleven(true);
  await v.falar('Você pensou no meu irmão Theo?', { meleca: 'pink', privado: true });
  assert.equal(reg.fetches.length, 0);
  assert.equal(reg.faladas.length, 1);
});

test('sem internet: usa a fala guardada; sem fala guardada, a voz do aparelho', async () => {
  const { amb, reg } = ambiente({ chave: 'sk_teste' });
  const v = V.criar(amb); v.usarEleven(true);
  await v.falar('Sim!', { meleca: 'pink' });
  amb.online = false;
  await v.falar('Sim!', { meleca: 'pink' });
  await v.falar('Não!', { meleca: 'pink' });
  assert.equal(reg.fetches.length, 1);
  assert.equal(reg.tocadas.length, 2);
  assert.equal(reg.faladas.length, 1);
});

test('emoji sai do texto antes de falar', async () => {
  const { amb, reg } = ambiente();
  const v = V.criar(amb);
  await v.falar('🎉 Acertei! 👍', { meleca: 'pink' });
  assert.equal(reg.faladas[0].txt, 'Acertei!');
});
