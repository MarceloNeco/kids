/* TIJOLAÇO — efeitos de obra feitos na hora (WebAudio), sem arquivo nenhum. A música é a trilha comum (../trilha.js).
   TijolacoSom.ligar(v) · ligado() · acordar() · toque() · tiro() · choque(combo) · estouro(combo) · betoneira() ·
   apito() · bateEstaca(forca) · portao() · capacete() · poder() · brecha() · obraPronta() · vitoria() · derrota() · cai() */
(function (raiz) {
  'use strict';
  var ctx = null, ligado = true, saida = null;
  var ESCALA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];   // pentatônica: o combo sobe de nota sem desafinar
  function ac() {
    if (!ligado) return null;
    try {
      if (!ctx) {
        var A = raiz.AudioContext || raiz.webkitAudioContext; if (!A) return null;
        ctx = new A(); saida = ctx.createDynamicsCompressor(); saida.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { return null; }
    return ctx;
  }
  function nota(freq, ini, dur, tipo, vol, ate) {
    var c = ac(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), t = c.currentTime + (ini || 0);
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(saida); o.start(t); o.stop(t + dur + 0.05);
  }
  var ruidoBuf = null;
  function ruido(ini, dur, vol, freq, q, tipo) {
    var c = ac(); if (!c) return;
    if (!ruidoBuf) { var n = c.sampleRate, d; ruidoBuf = c.createBuffer(1, n, c.sampleRate); d = ruidoBuf.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; }
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + (ini || 0);
    s.buffer = ruidoBuf; f.type = tipo || 'bandpass'; f.frequency.value = freq || 900; f.Q.value = q || 0.8;
    g.gain.setValueAtTime(vol || 0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(saida); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  function semitom(base, n) { return base * Math.pow(2, n / 12); }
  var S = {
    ligar: function (v) { ligado = !!v; },
    ligado: function () { return ligado; },
    acordar: function () { ac(); },
    toque: function () { nota(740, 0, 0.06, 'triangle', 0.08); },
    tiro: function () { ruido(0, 0.09, 0.14, 1800, 1.2); nota(260, 0, 0.09, 'sine', 0.1, 140); },
    // "toc" de tijolo encaixando: madeira + barro; a nota sobe a cada combo
    choque: function (combo) {
      var f = semitom(523, ESCALA[Math.min(ESCALA.length - 1, Math.max(0, (combo || 1) - 1))]);
      ruido(0, 0.05, 0.22, 2400, 2.5); nota(f, 0, 0.12, 'triangle', 0.14); nota(f * 2, 0.005, 0.06, 'sine', 0.05);
    },
    // estouro: o grupo racha (caco + poeira) e uma nota da escala, mais alta no combo
    estouro: function (combo) {
      var n = Math.min(ESCALA.length - 1, (combo || 1) - 1), f = semitom(392, ESCALA[n]);
      ruido(0, 0.22, 0.28, 900, 0.7); ruido(0.02, 0.14, 0.2, 3800, 1.5);
      nota(120, 0, 0.18, 'sine', 0.22, 55);
      nota(f, 0.03, 0.22, 'triangle', 0.13); nota(f * 1.5, 0.09, 0.26, 'triangle', 0.1);
      if (combo > 1) nota(f * 2, 0.15, 0.3, 'sine', 0.08);
    },
    // betoneira girando (troca de tijolo): ronco grave com batidinha
    betoneira: function () {
      var c = ac(); if (!c) return;
      ruido(0, 0.3, 0.14, 180, 1.5, 'lowpass');
      for (var i = 0; i < 4; i++) nota(90 + i * 6, i * 0.06, 0.07, 'square', 0.035);
    },
    apito: function () {   // apito de obra: dois toques com trinado
      var c = ac(); if (!c) return;
      [0, 0.28].forEach(function (t0, k) {
        var o = c.createOscillator(), lfo = c.createOscillator(), lg = c.createGain(), g = c.createGain(), t = c.currentTime + t0, dur = k ? 0.42 : 0.18;
        o.type = 'sine'; o.frequency.value = 2350; lfo.frequency.value = 38; lg.gain.value = 90;
        lfo.connect(lg); lg.connect(o.frequency);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.02); g.gain.setValueAtTime(0.09, t + dur - 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(saida); o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
      });
    },
    bateEstaca: function (forca) {   // bate-estaca da zona de perigo: tum grave + metal
      var v = 0.12 + 0.14 * (forca || 0);
      nota(70, 0, 0.22, 'sine', v * 1.6, 42); ruido(0, 0.08, v, 600, 1.2); nota(1180, 0.005, 0.05, 'square', 0.02);
    },
    portao: function () { nota(330, 0, 0.08, 'square', 0.06); ruido(0.03, 0.1, 0.12, 2600, 3); nota(495, 0.07, 0.1, 'triangle', 0.08); },
    capacete: function () { [988, 1319, 1568, 1976].forEach(function (f, i) { nota(f, i * 0.06, 0.25, 'triangle', 0.1); }); },
    poder: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { nota(f, i * 0.045, 0.16, 'sine', 0.09); }); },
    brecha: function () { nota(880, 0, 0.1, 'triangle', 0.1); nota(1320, 0.08, 0.16, 'triangle', 0.1); },
    obraPronta: function () { [523, 659, 784, 1047].forEach(function (f, i) { nota(f, i * 0.11, 0.3, 'triangle', 0.12); }); },
    vitoria: function () { S.apito(); [523, 523, 659, 784, 659, 784, 1047].forEach(function (f, i) { nota(f, 0.7 + i * 0.13, 0.24, 'triangle', 0.12); }); },
    derrota: function () { [392, 349, 311, 262].forEach(function (f, i) { nota(f, i * 0.2, 0.32, 'triangle', 0.11); }); ruido(0.8, 0.5, 0.25, 300, 0.6); },
    cai: function () { ruido(0, 0.12, 0.12, 700, 1); nota(200, 0, 0.12, 'sine', 0.08, 90); }
  };
  raiz.TijolacoSom = S;
})(this);
