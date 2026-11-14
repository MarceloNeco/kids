// A voz segue o idioma da estante (../idioma.js): o texto, o lang e uma voz do mesmo idioma (nunca uma voz
// portuguesa lendo inglês ou espanhol). Rodar da raiz do repositório: node --test baguncolandia/teste/voz.test.js
const test = require('node:test');
const assert = require('node:assert/strict');

function carregar(idioma, vozes) {
  const faladas = [];
  const raiz = {
    BolinhoIdioma: { atual: () => idioma, voz: () => ({ pt: 'pt-BR', en: 'en-US', es: 'es-ES' })[idioma], aoMudar() {} },
    speechSynthesis: { getVoices: () => vozes, addEventListener() {}, cancel() {}, speak(u) { faladas.push(u); }, paused: false },
    SpeechSynthesisUtterance: function (t) { this.text = t; }
  };
  global.self = raiz; global.SpeechSynthesisUtterance = raiz.SpeechSynthesisUtterance;   // o voz.js cria a fala pelo nome global
  const si = global.setInterval; global.setInterval = () => 0;   // o vigia do Android (resume a cada 9 s) não segura o teste
  delete require.cache[require.resolve('../voz.js')];
  require('../voz.js');
  global.setInterval = si; delete global.self;
  return { Voz: raiz.Voz, faladas };
}
const VOZES = [{ lang: 'pt-BR', name: 'Luciana' }, { lang: 'en-GB', name: 'Daniel' }, { lang: 'en-US', name: 'Samantha' }, { lang: 'es-MX', name: 'Paulina' }, { lang: 'es-ES', name: 'Mónica' }];

for (const [idioma, texto, lang, voz] of [['pt', 'Pula!', 'pt-BR', 'Luciana'], ['en', 'Jump!', 'en-US', 'Samantha'], ['es', '¡Salta!', 'es-ES', 'Mónica']]) {
  test('voz em ' + idioma + ': texto, lang e voz do mesmo idioma', async () => {
    const { Voz, faladas } = carregar(idioma, VOZES);
    assert.ok(Voz.falar('Pula!', 'Jump!', '¡Salta!'));
    await new Promise(r => setTimeout(r, 100));
    const u = faladas.pop();
    assert.equal(u.text, texto); assert.equal(u.lang, lang); assert.equal(u.voice.name, voz);
  });
}

test('sem voz em espanhol no aparelho: só o lang, nenhuma voz portuguesa', async () => {
  const { Voz, faladas } = carregar('es', [{ lang: 'pt-BR', name: 'Luciana' }, { lang: 'en-US', name: 'Samantha' }]);
  Voz.falar('Pula!', 'Jump!', '¡Salta!');
  await new Promise(r => setTimeout(r, 100));
  const u = faladas.pop();
  assert.equal(u.text, '¡Salta!'); assert.equal(u.lang, 'es-ES'); assert.equal(u.voice, undefined);
});
