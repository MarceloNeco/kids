// Voz da Dona Cida (v0.5.0): no Samsung do dono ela falava com voz de homem. Agora escolhe uma voz FEMININA do
// português do Brasil (nomes e códigos do Android conhecidos), deixa as masculinas por último, e se só houver voz de
// homem (ou desconhecida) fala bem mais fininha. O 👵🔁 troca a voz, fala uma frase de exemplo e guarda a escolha.
// A voz do navegador é trocada por uma de mentira com a lista de vozes de cada teste.
// node --test cozinha/teste/*.test.js (da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const { iniciar, fechar, abrir, comecar, noLugar } = require('./navegador.js');

test.before(iniciar);
test.after(fechar);

function vozes(lista) {
  return { content: '(' + function (lista) {
    window.__falas = [];
    class Fala extends EventTarget { constructor(t) { super(); this.text = t; this.lang = ''; this.rate = 1; this.pitch = 1; this.voice = null; this.onend = null; this.onerror = null; } }
    const ss = new EventTarget();
    Object.assign(ss, { speaking: false, pending: false, getVoices: () => lista, pause() {}, resume() {}, cancel() {},
      speak(u) { window.__falas.push({ text: u.text, lang: u.lang, rate: u.rate, pitch: u.pitch, voz: u.voice && u.voice.name }); setTimeout(() => { u.dispatchEvent(new Event('end')); if (u.onend) u.onend(); }, 20); } });
    Object.defineProperty(window, 'speechSynthesis', { value: ss, configurable: true });
    window.SpeechSynthesisUtterance = Fala;
  } + ')(' + JSON.stringify(lista) + ');' };
}
const falas = pg => pg.evaluate(() => window.__falas);
// como no Android (Chrome + voz do Google): códigos no nome; e nomes de computador
const ANDROID = [
  { name: 'pt-br-x-ptd-local', lang: 'pt-BR' },     // masculina
  { name: 'Daniel', lang: 'pt-BR' },                // masculina
  { name: 'pt-br-x-afs-network', lang: 'pt-BR' },   // feminina
  { name: 'Joana', lang: 'pt-PT' },                 // feminina, mas de Portugal
  { name: 'Samantha', lang: 'en-US' }
];

async function naVizinha(lista, extra) {
  const r = await abrir({ width: 412, height: 915 }, Object.assign({ isMobile: true, hasTouch: true }, extra || {}), vozes(lista));
  await comecar(r.pg, 'medio', 'brigadeiro');
  await noLugar(r.pg, 'vizinha');
  return r;
}

test('vovó com várias vozes (Android): escolhe a feminina do Brasil (pt-br-x-afs), com tom de vovó 1,2', { timeout: 30000 }, async () => {
  const { ctx, pg, erros } = await naVizinha(ANDROID);
  const f = await falas(pg);
  assert.equal(f.length, 1); assert.match(f[0].text, /que bom te ver/);
  assert.equal(f[0].voz, 'pt-br-x-afs-network', 'voz feminina do Brasil, nunca a masculina');
  assert.equal(f[0].pitch, 1.2); assert.equal(f[0].rate, 0.9); assert.equal(f[0].lang, 'pt-BR');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('vovó num aparelho só com voz de homem: fala bem mais fininha (tom 1,45) e devagar (0,88)', { timeout: 30000 }, async () => {
  const { ctx, pg, erros } = await naVizinha([{ name: 'pt-br-x-ptd-local', lang: 'pt-BR' }, { name: 'Ricardo', lang: 'pt-BR' }]);
  const f = (await falas(pg))[0];
  assert.equal(f.pitch, 1.45); assert.equal(f.rate, 0.88);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('vovó com uma voz desconhecida (ex.: a voz padrão do Samsung) e uma masculina: usa a desconhecida, mais fininha', { timeout: 30000 }, async () => {
  const { ctx, pg, erros } = await naVizinha([{ name: 'pt-br-x-ptz-local', lang: 'pt-BR' }, { name: 'Português (Brasil)', lang: 'pt-BR' }]);
  const f = (await falas(pg))[0];
  assert.equal(f.voz, 'Português (Brasil)'); assert.equal(f.pitch, 1.45);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('🔁 Trocar a voz da vovó: passa para a próxima voz, fala uma frase de exemplo e guarda a escolha', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await naVizinha(ANDROID);
  // ordem para a vovó: afs (feminina, Brasil), ptd e Daniel (masculinas, Brasil), Joana (Portugal)
  await pg.click('.bt-voz-vovo');
  let f = await falas(pg);
  let ult = f[f.length - 1];
  assert.equal(ult.voz, 'pt-br-x-ptd-local'); assert.match(ult.text, /minha voz de vovó/); assert.equal(ult.pitch, 1.45, 'voz de homem fica fininha');
  assert.deepEqual(await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:cozinha:voz-vovo'))), { pt: 'pt-br-x-ptd-local' });
  assert.match(await pg.textContent('#aviso'), /Voz da vovó: pt-br-x-ptd-local \(2\/4\)/);
  await pg.click('.bt-voz-vovo'); await pg.click('.bt-voz-vovo');
  f = await falas(pg); ult = f[f.length - 1];
  assert.equal(ult.voz, 'Joana'); assert.equal(ult.pitch, 1.2, 'Joana é feminina');
  // a escolha fica guardada: ao voltar outro dia, a vovó já fala com a Joana
  await pg.reload(); await comecar(pg, 'medio', 'brigadeiro'); await noLugar(pg, 'vizinha');
  f = await falas(pg); ult = f[f.length - 1];
  assert.match(ult.text, /que bom te ver/); assert.equal(ult.voz, 'Joana');
  // no menu também tem o 👵🔁 (com a voz desligada, o exemplo fala mesmo assim)
  await pg.click('#lugar .voltar'); await pg.click('#mapa .voltar'); await pg.click('.bolinho-nav .bn-casa'); await pg.waitForSelector('#menu.ativa');
  await pg.click('#btVoz');
  await pg.click('#btVozVovo');
  f = await falas(pg); ult = f[f.length - 1];
  assert.equal(ult.voz, 'pt-br-x-afs-network', 'volta ao começo da lista');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});
