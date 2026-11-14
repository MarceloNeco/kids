/* Peluqueria — voz (speechSynthesis), a partir da voz da Bagunçolândia, nas regras de voz da SolverONE:
   lang pt-BR/en-US/es-ES conforme o idioma escolhido na estante; nunca nome de voz fixo (só voz do idioma:
   em português prefere pt-BR, depois qualquer pt; sem voz do idioma, só o lang);
   cancel() antes de falar com 60 ms de espera; uma frase por vez; vigia de tempo para não travar.
   Sem speechSynthesis o jogo segue só com a legenda grande (nunca dá erro). */
(function (root) {
  'use strict';
  var S = root.speechSynthesis, vozes = [], vigia = 0, falando = null;
  var LANG = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }, ALVO = { pt: /^(pt|por)/i, en: /^en/i, es: /^(es|spa)/i };
  function lingua() { var l = root.PeluqueriaApp && root.PeluqueriaApp.lingua; return LANG[l] ? l : 'pt'; }
  function carregarVozes() { if (!S) return; try { vozes = S.getVoices() || []; } catch (e) { vozes = []; } }
  function escolher() {
    var l = lingua(), alvo = ALVO[l];
    var lista = vozes.filter(function (v) { return alvo.test((v.lang || '').replace('_', '-')); });
    var br = lista.filter(function (v) { return /^pt[-_]?br/i.test(v.lang || '') || /brazil|brasil/i.test(v.name || ''); });
    return (l === 'pt' && br[0]) || lista[0] || null;
  }
  if (S) { carregarVozes(); try { S.addEventListener('voiceschanged', carregarVozes); } catch (e) {} }
  var api = { ultimo: '' };
  api.falar = function (pt, eng, esp) {
    var l = lingua(), texto = l === 'en' ? (eng || pt) : l === 'es' ? (esp || pt) : pt;
    api.ultimo = texto;
    if (!S || typeof root.SpeechSynthesisUtterance !== 'function' || !texto) return false;
    try { S.cancel(); } catch (e) {}
    clearTimeout(vigia);
    setTimeout(function () {
      try {
        var u = new SpeechSynthesisUtterance(texto), v = escolher();
        u.lang = LANG[l]; if (v) u.voice = v;
        u.rate = 1.05; u.pitch = 1.15; u.volume = 1;
        u.onend = u.onerror = function () { falando = null; clearTimeout(vigia); };
        falando = u; S.speak(u);
        vigia = setTimeout(function () { try { S.cancel(); } catch (e) {} falando = null; }, 1500 + texto.length * 90);
      } catch (e) { falando = null; }
    }, 60);
    return true;
  };
  // o Chrome do Android para a fala em ~15 s: resume() de tempos em tempos enquanto fala
  setInterval(function () { try { if (S && falando && S.paused) S.resume(); } catch (e) {} }, 9000);
  root.PeluqueriaVoz = api;
})(typeof self !== 'undefined' ? self : this);
