/* A-GARRA — efeitos sonoros feitos na hora (WebAudio), sem arquivo nenhum.
   Som.ligar(true|false) · Som.toque() · Som.ficha() · Som.motor(liga) · Som.descer() · Som.fechar() · Som.pegou() ·
   Som.errou() · Som.escorregou() · Som.ganhou(raro) · Som.pulo() · Som.tique() · Som.fim(estrelas)
   A música de fundo é a trilha comum (../trilha.js); estes são só os efeitos. */
(function (raiz) {
  'use strict';
  var ctx = null, ligado = true, zumbido = null;
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
    ligar: function (v) { ligado = !!v; if (!ligado) S.motor(false); },
    ligado: function () { return ligado; },
    acordar: function () { ac(); },
    toque: function () { nota(660, 0, 0.08, 'triangle', 0.1); },
    ficha: function () { nota(1568, 0, 0.12, 'triangle', 0.12); nota(2093, 0.08, 0.25, 'sine', 0.1); },
    // zumbido baixinho do motor enquanto a garra anda
    motor: function (liga) {
      var c = ac();
      if (liga && c && !zumbido) {
        var o = c.createOscillator(), g = c.createGain();
        o.type = 'sawtooth'; o.frequency.value = 70; g.gain.value = 0.0001;
        g.gain.exponentialRampToValueAtTime(0.025, c.currentTime + 0.08);
        o.connect(g); g.connect(c.destination); o.start(); zumbido = { o: o, g: g };
      } else if (!liga && zumbido) {
        var z = zumbido; zumbido = null;
        try { z.g.gain.exponentialRampToValueAtTime(0.0001, z.g.context.currentTime + 0.08); z.o.stop(z.g.context.currentTime + 0.1); } catch (e) {}
      }
    },
    descer: function () { nota(520, 0, 0.9, 'triangle', 0.06, 260); },
    fechar: function () { nota(240, 0, 0.08, 'square', 0.06); nota(180, 0.06, 0.1, 'square', 0.05); },
    pegou: function () { [523, 659, 784].forEach(function (f, k) { nota(f, k * 0.08, 0.18, 'triangle', 0.11); }); },
    errou: function () { nota(330, 0, 0.18, 'sine', 0.08, 300); },
    escorregou: function () { nota(392, 0, 0.25, 'triangle', 0.1, 370); nota(349, 0.25, 0.25, 'triangle', 0.1, 330); nota(311, 0.5, 0.5, 'triangle', 0.1, 260); },
    ganhou: function (raro) {
      [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.3], [784, 0.45], [1047, 0.55]].forEach(function (n) { nota(n[0], n[1], 0.28, 'triangle', 0.14); });
      [262, 330, 392].forEach(function (f) { nota(f, 0.55, 0.8, 'sine', 0.07); });
      if (raro) [1319, 1568, 2093, 2637].forEach(function (f, k) { nota(f, 0.8 + k * 0.07, 0.4, 'sine', 0.07); });
    },
    pulo: function () { nota(300, 0, 0.18, 'sine', 0.06, 700); },
    tique: function () { nota(1200, 0, 0.05, 'square', 0.04); },
    fim: function (estrelas) {
      if (!estrelas) { nota(392, 0, 0.3, 'triangle', 0.1); nota(330, 0.3, 0.5, 'triangle', 0.1); return; }
      [523, 659, 784, 1047].forEach(function (f, k) { nota(f, k * 0.12, 0.35, 'triangle', 0.13); });
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = S; else raiz.Som = S;
})(typeof self !== 'undefined' ? self : this);
