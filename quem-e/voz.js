/* Quem é? — a voz da meleca (sem tela; roda no Node para os testes com um "ambiente" de mentira).

   Duas camadas (diretriz "Voz"):
   1. Voz do aparelho (grátis, sem internet): sempre disponível. Cada meleca com o seu jeito: o Melekento Blue fala mais
      grosso e borbulhante, a Pink Honey mais fininho e animado.
   2. ElevenLabs (opcional, mais animada): só com a chave da própria pessoa guardada no cofre comum (../cofre.js, nome
      'ia:elevenlabs'), nunca em texto aberto. Cada fala gerada fica guardada no aparelho (Cache Storage "quem-e-voz",
      endereço = voz + texto) e repete sem gastar cota e sem internet. Erro, cota acabada ou sem internet → voz do aparelho,
      sem erro na tela.
   Texto "privado" (nome que a família ensinou) nunca vai para a internet: sempre a voz do aparelho.

   QEVoz.criar(amb) → { falar(texto, { meleca, privado }), calar(), usarEleven(sim), vozes, definirVoz(meleca, id) }
     amb: { online, cofre, fetch, caches, tocarAudio(blob), falarAparelho(texto, jeito), pararTudo() }
     QEVoz.ambienteDoNavegador(lingua) monta o amb de verdade. */
(function (raiz) {
  'use strict';
  var URL_API = 'https://api.elevenlabs.io/v1/text-to-speech/';
  // nome fora do prefixo "quem-e-": o sw.js apaga os caches "quem-e-…" a cada versão, e as falas pagas não podem sumir
  var CACHE = 'falas-quem-e';
  var ESPERA = 4500;   // a ElevenLabs não respondeu em 4,5 s: voz do aparelho
  // vozes prontas da biblioteca da ElevenLabs (a pessoa pode trocar o id nas ⚙): Blue mais grave, Pink mais aguda
  var VOZES = { blue: 'TxGEqnHWrfWFTfGW9XTX', pink: 'AZnzlk1XvdvUeBnXmlld' };
  var JEITO = { blue: { pitch: 0.75, rate: 1.0 }, pink: { pitch: 1.5, rate: 1.08 } };

  function limpar(t) { return String(t || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim(); }
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36); }

  function criar(amb) {
    var eleven = false, vozes = { blue: VOZES.blue, pink: VOZES.pink }, vez = 0;
    // privado: só voz que funciona dentro do aparelho (a voz "Google" do Chrome manda o texto para a internet)
    function aparelho(txt, meleca, privado) { var j = Object.assign({}, JEITO[meleca] || JEITO.pink); if (privado) j.soLocal = true; return Promise.resolve(amb.falarAparelho(txt, j)).catch(function () {}); }
    function chaveCache(txt, voz) { return 'https://quem-e.local/voz/' + voz + '/' + hash(txt) + '-' + txt.length; }

    function daInternet(txt, voz) {
      // lerAgora nunca abre a janela do PIN: com o cofre trancado, a meleca fala com a voz do aparelho (o PIN só é pedido
      // na janela 🎙️ Voz animada, nunca no meio do jogo de uma criança)
      var chave = amb.cofre && amb.cofre.lerAgora ? amb.cofre.lerAgora('ia:elevenlabs') : '';
      if (!chave) return Promise.reject(new Error('cofre trancado ou sem chave'));
      var ctrl = typeof AbortController === 'function' ? new AbortController() : null, relogio = null;
      var corrida = new Promise(function (ok, falha) { relogio = setTimeout(function () { if (ctrl) ctrl.abort(); falha(new Error('demorou')); }, ESPERA); });
      return Promise.race([corrida, Promise.resolve().then(function () {
        return amb.fetch(URL_API + encodeURIComponent(voz), {
          method: 'POST', signal: ctrl ? ctrl.signal : undefined,
          headers: { 'xi-api-key': chave, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
          body: JSON.stringify({ text: txt, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.35, similarity_boost: 0.8, style: 0.6, use_speaker_boost: true } })
        });
      })]).then(function (r) { clearTimeout(relogio); if (!r || !r.ok) throw new Error('elevenlabs ' + (r && r.status)); return r; }, function (e) { clearTimeout(relogio); throw e; });
    }

    return {
      vozes: vozes,
      usarEleven: function (sim) { eleven = !!sim; },
      definirVoz: function (meleca, id) { if (/^[A-Za-z0-9]{8,40}$/.test(id || '')) vozes[meleca] = id; },
      calar: function () { vez++; try { amb.pararTudo(); } catch (e) { /* ok */ } },
      falar: function (texto, op) {
        op = op || {};
        var txt = limpar(texto), meleca = op.meleca === 'blue' ? 'blue' : 'pink', minha = ++vez;
        if (!txt) return Promise.resolve();
        if (op.privado || !eleven || !amb.cofre || !amb.cofre.tem('ia:elevenlabs') || !amb.caches) return aparelho(txt, meleca, op.privado);
        var voz = vozes[meleca], chave = chaveCache(txt, voz);
        function ainda() { return minha === vez; }   // veio outra fala depois (ou calar): esta não toca mais
        return amb.caches.open(CACHE).then(function (c) {
          return c.match(chave).then(function (guardada) {
            if (guardada) return guardada.blob();
            if (!amb.online) throw new Error('sem internet');
            return daInternet(txt, voz).then(function (r) { return c.put(chave, r.clone ? r.clone() : r).then(function () { return r.blob(); }); });
          });
        }).then(function (blob) { if (ainda()) return amb.tocarAudio(blob); }).catch(function () { if (ainda()) return aparelho(txt, meleca); });
      }
    };
  }

  // o ambiente de verdade, no navegador
  function ambienteDoNavegador(lingua) {
    var audio = null, url = null;
    return {
      get online() { return navigator.onLine !== false; },
      cofre: raiz.SolverCofre || null,
      fetch: function (u, o) { return raiz.fetch(u, o); },
      caches: raiz.caches || null,
      tocarAudio: function (blob) {
        return new Promise(function (ok, falha) {
          try { if (audio) { audio.pause(); if (audio.terminar) audio.terminar(); } if (url) URL.revokeObjectURL(url); } catch (e) { /* ok */ }
          url = URL.createObjectURL(blob); audio = new Audio(url); audio.terminar = ok;   // cortada por outra fala: termina
          audio.onended = function () { ok(); }; audio.onerror = function () { falha(new Error('áudio')); };
          var p = audio.play(); if (p && p.catch) p.catch(falha);
        });
      },
      falarAparelho: function (txt, jeito) {
        return new Promise(function (ok) {
          if (!raiz.speechSynthesis || !raiz.SpeechSynthesisUtterance) { ok(); return; }
          try {
            speechSynthesis.cancel();
            var u = new SpeechSynthesisUtterance(txt), lang = lingua() === 'en' ? 'en' : 'pt';
            u.lang = lang === 'en' ? 'en-US' : 'pt-BR'; u.pitch = jeito.pitch; u.rate = jeito.rate;
            if (jeito.soLocal) {
              var locais = (speechSynthesis.getVoices() || []).filter(function (v) { return v.localService && String(v.lang || '').toLowerCase().replace('_', '-').indexOf(lang) === 0; });
              if (!locais.length) { ok(); return; }   // sem voz dentro do aparelho: o nome fica só escrito na tela
              u.voice = locais[0];
            }
            u.onend = u.onerror = function () { ok(); };
            setTimeout(function () { try { speechSynthesis.speak(u); } catch (e) { ok(); } }, 60);
            setTimeout(ok, 12000);
          } catch (e) { ok(); }
        });
      },
      pararTudo: function () { try { if (audio) { audio.pause(); if (audio.terminar) audio.terminar(); } } catch (e) { /* ok */ } try { speechSynthesis.cancel(); } catch (e) { /* ok */ } }
    };
  }

  var API = { criar: criar, ambienteDoNavegador: ambienteDoNavegador, VOZES: VOZES, CACHE: CACHE };
  raiz.QEVoz = API;
  if (typeof module === 'object' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
