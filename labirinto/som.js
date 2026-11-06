/* Labirinto — efeitos sonoros feitos na hora (WebAudio), sem arquivo nenhum.
   Som.ligar(true|false) · Som.toque() · Som.passo() · Som.bate() · Som.item() · Som.porta() · Som.vitoria() · Som.trancada()
   A música de fundo é a trilha comum (../trilha.js); estes são só os efeitos. */
(function (raiz) {
  'use strict';
  var ctx = null, ligado = true, ultimoPasso = 0;
  function ac() {
    if (!ligado) return null;
    try {
      if (!ctx) { var A = raiz.AudioContext || raiz.webkitAudioContext; if (!A) return null; ctx = new A(); }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { return null; }
    return ctx;
  }
  function nota(freq, ini, dur, tipo, vol, ate) {
    var c = ac(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), t = c.currentTime + (ini || 0);
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  var S = {
    ligar: function (v) { ligado = !!v; },
    ligado: function () { return ligado; },
    acordar: function () { ac(); },
    toque: function () { nota(660, 0, 0.08, 'triangle', 0.1); },
    passo: function () { var c = ac(); if (!c || c.currentTime - ultimoPasso < 0.09) return; ultimoPasso = c.currentTime; nota(420 + Math.random() * 120, 0, 0.05, 'triangle', 0.05); },
    bate: function () { nota(180, 0, 0.16, 'square', 0.07, 90); },
    trancada: function () { nota(300, 0, 0.1, 'square', 0.06); nota(240, 0.12, 0.14, 'square', 0.06); },
    item: function () { [523, 659, 784, 1047, 1319].forEach(function (f, k) { nota(f, k * 0.07, 0.25, 'triangle', 0.13); }); nota(2093, 0.4, 0.4, 'sine', 0.06); },
    porta: function () { nota(220, 0, 0.6, 'sawtooth', 0.04, 880); [784, 988, 1175].forEach(function (f, k) { nota(f, 0.45 + k * 0.09, 0.4, 'sine', 0.1); }); },
    vitoria: function () {
      [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.36], [784, 0.52], [1047, 0.64]].forEach(function (n) { nota(n[0], n[1], 0.3, 'triangle', 0.15); });
      [262, 330, 392].forEach(function (f) { nota(f, 0.64, 0.9, 'sine', 0.08); });
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = S; else raiz.Som = S;
})(typeof self !== 'undefined' ? self : this);
