/* GLUB GLUB — efeitos sonoros feitos na hora (WebAudio), sem arquivo nenhum. A música de fundo é a trilha comum (../trilha.js).
   GlubSom.ligar(true|false) · toque() · mergulho() · glub() · fisgou() · carretilha() · ponto(valor) · balde() · poder() ·
   bonus() · rioLimpo() · fim() · raro() */
(function (raiz) {
  'use strict';
  var ctx = null, ligado = true, ultimaCarretilha = 0;
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
  function chiado(ini, dur, vol, freq) {   // água: ruído filtrado
    var c = ac(); if (!c) return;
    var n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + (ini || 0);
    s.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq || 900; f.Q.value = 0.8; g.gain.value = vol || 0.25;
    s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
  }
  var S = {
    ligar: function (v) { ligado = !!v; },
    ligado: function () { return ligado; },
    acordar: function () { ac(); },
    toque: function () { nota(660, 0, 0.08, 'triangle', 0.1); },
    mergulho: function () { chiado(0, 0.35, 0.22, 1200); nota(500, 0, 0.25, 'sine', 0.06, 180); },
    glub: function () { nota(320, 0, 0.09, 'sine', 0.12, 620); nota(380, 0.11, 0.09, 'sine', 0.1, 720); },   // "glub glub"
    fisgou: function () { nota(880, 0, 0.07, 'square', 0.06); nota(1175, 0.06, 0.1, 'square', 0.06); },
    carretilha: function () { var c = ac(); if (!c || c.currentTime - ultimaCarretilha < 0.07) return; ultimaCarretilha = c.currentTime; nota(1400 + Math.random() * 300, 0, 0.025, 'square', 0.03); },
    ponto: function (v) { var f = v >= 100 ? 1047 : v >= 20 ? 880 : v >= 5 ? 784 : 659; chiado(0, 0.2, 0.18, 1600); nota(f, 0.05, 0.18, 'triangle', 0.13); nota(f * 1.5, 0.13, 0.22, 'triangle', 0.1); },
    balde: function () { [523, 659, 784, 1047].forEach(function (f, i) { nota(f, i * 0.09, 0.2, 'triangle', 0.12); }); },
    poder: function () { [700, 900, 1200, 1600].forEach(function (f, i) { nota(f, i * 0.05, 0.12, 'sine', 0.09); }); },
    bonus: function () { nota(392, 0, 0.3, 'sawtooth', 0.07); nota(523, 0.25, 0.45, 'sawtooth', 0.07); },
    rioLimpo: function () { [784, 988, 1175, 1568].forEach(function (f, i) { nota(f, i * 0.12, 0.3, 'sine', 0.1); }); },
    raro: function () { [523, 784, 1047, 1319, 1568].forEach(function (f, i) { nota(f, i * 0.07, 0.35, 'triangle', 0.1); }); },
    fim: function () { [523, 523, 659, 784, 659, 784, 1047].forEach(function (f, i) { nota(f, i * 0.14, 0.24, 'triangle', 0.12); }); }
  };
  raiz.GlubSom = S;
})(this);
