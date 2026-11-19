/* FRUTA PODRE — efeitos sonoros feitos na hora (WebAudio), sem arquivo nenhum. A música é a trilha comum (../trilha.js).
   FrutaSom.ligar(v) · acordar() · elastico(tensao) / soltarElastico() · lanca(fruta) · grito(fruta) · poder(fruta) ·
   quebra(material) · toque(material, forca) · splat() · explosao() · ko() · puf() · capacete() · ai() · estrela(i) ·
   vitoria() · derrota() · tique() · clique() */
(function (raiz) {
  'use strict';
  var ctx = null, saida = null, ligado = true, ruido = null, ultimoToque = 0, el = null;
  function ac() {
    if (!ligado) return null;
    try {
      if (!ctx) {
        var A = raiz.AudioContext || raiz.webkitAudioContext; if (!A) return null;
        ctx = new A();
        saida = ctx.createDynamicsCompressor(); saida.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { return null; }
    return ctx;
  }
  function buf() {   // 1 s de chiado, feito uma vez só
    if (ruido) return ruido;
    var n = ctx.sampleRate, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return (ruido = b);
  }
  function env(g, t, vol, ataque, dur) {
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + ataque); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  function nota(freq, ini, dur, tipo, vol, ate) {
    var c = ac(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), t = c.currentTime + (ini || 0);
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dur);
    env(g, t, vol || 0.15, 0.01, dur);
    o.connect(g); g.connect(saida); o.start(t); o.stop(t + dur + 0.05);
  }
  function chiado(ini, dur, vol, tipo, freq, ate, q) {
    var c = ac(); if (!c) return;
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + (ini || 0);
    s.buffer = buf(); s.playbackRate.value = 0.8 + Math.random() * 0.4;
    f.type = tipo || 'bandpass'; f.frequency.setValueAtTime(freq || 1000, t); f.Q.value = q || 0.9;
    if (ate) f.frequency.exponentialRampToValueAtTime(ate, t + dur);
    env(g, t, vol || 0.25, 0.005, dur);
    s.connect(f); f.connect(g); g.connect(saida); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  // voz de desenho: dente de serra passando por dois filtros de vogal
  function voz(freq, ate, dur, vogal, vol, ini, tremor) {
    var c = ac(); if (!c) return;
    var t = c.currentTime + (ini || 0), o = c.createOscillator(), g = c.createGain();
    var F = { a: [800, 1200], e: [500, 1900], i: [320, 2500], o: [500, 900], u: [350, 700] }[vogal || 'a'];
    o.type = 'sawtooth'; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(ate, t + dur);
    if (tremor) {
      var l = c.createOscillator(), lg = c.createGain(); l.frequency.value = tremor; lg.gain.value = freq * 0.06;
      l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.05);
    }
    env(g, t, vol || 0.12, 0.02, dur);
    F.forEach(function (fq) { var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = fq; f.Q.value = 6; o.connect(f); f.connect(g); });
    g.connect(saida); o.start(t); o.stop(t + dur + 0.05);
  }
  var S = {
    ligar: function (v) { ligado = !!v; if (!ligado) S.soltarElastico(true); },
    ligado: function () { return ligado; },
    acordar: function () { ac(); },
    clique: function () { nota(660, 0, 0.07, 'triangle', 0.1); },
    // borracha esticando: o som sobe com a tensão
    elastico: function (tensao) {
      var c = ac(); if (!c) return;
      if (!el) {
        var o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(), l = c.createOscillator(), lg = c.createGain();
        o.type = 'sawtooth'; f.type = 'lowpass'; f.Q.value = 8; g.gain.value = 0.0001;
        l.frequency.value = 22; lg.gain.value = 8; l.connect(lg); lg.connect(o.frequency);
        o.connect(f); f.connect(g); g.connect(saida); o.start(); l.start();
        el = { o: o, f: f, g: g, l: l };
      }
      var t = c.currentTime, k = Math.max(0, Math.min(1, tensao));
      el.o.frequency.setTargetAtTime(70 + k * 170, t, 0.03);
      el.f.frequency.setTargetAtTime(300 + k * 1400, t, 0.03);
      el.l.frequency.setTargetAtTime(14 + k * 30, t, 0.05);
      el.g.gain.setTargetAtTime(0.02 + k * 0.09, t, 0.04);
    },
    soltarElastico: function (calado) {
      if (!el || !ctx) return;
      var e = el, t = ctx.currentTime; el = null;
      e.g.gain.setTargetAtTime(0.0001, t, 0.02);
      setTimeout(function () { try { e.o.stop(); e.l.stop(); } catch (x) {} }, 200);
      if (!calado) { nota(260, 0, 0.18, 'sine', 0.22, 70); chiado(0, 0.12, 0.12, 'bandpass', 2500, 600); }
    },
    lanca: function (fruta) { S.soltarElastico(); S.grito(fruta, 0.08); },
    grito: function (fruta, ini) {
      ini = ini || 0;
      if (fruta === 'maca_podre') voz(520, 760, 0.45, 'i', 0.12, ini, 9);
      else if (fruta === 'trio_uva') { voz(760, 900, 0.18, 'e', 0.09, ini); voz(860, 1000, 0.18, 'e', 0.09, ini + 0.12); voz(960, 1150, 0.22, 'i', 0.09, ini + 0.24); }
      else if (fruta === 'pimenta_jato') voz(600, 1300, 0.55, 'a', 0.12, ini, 14);
      else if (fruta === 'melancia_passada') voz(170, 140, 0.7, 'o', 0.16, ini, 5);
      else voz(380, 300, 0.5, 'u', 0.13, ini, 18);
    },
    poder: function (fruta) {
      if (fruta === 'trio_uva') { nota(500, 0, 0.08, 'square', 0.08, 900); nota(620, 0.05, 0.08, 'square', 0.08, 1100); nota(740, 0.1, 0.08, 'square', 0.08, 1300); voz(900, 1300, 0.3, 'i', 0.08, 0.05); }
      else if (fruta === 'pimenta_jato') { chiado(0, 0.7, 0.3, 'bandpass', 600, 3000, 0.6); voz(700, 1500, 0.5, 'i', 0.1, 0, 20); }
      else if (fruta === 'melancia_passada') { nota(1400, 0, 0.6, 'sine', 0.12, 300); voz(220, 120, 0.6, 'o', 0.12, 0.05); }
      else if (fruta === 'maca_podre') { voz(900, 1400, 0.5, 'i', 0.12, 0, 25); chiado(0, 0.35, 0.12, 'highpass', 3000); }
      else S.explosao();
    },
    quebra: function (mat) {
      if (mat === 'glass') {
        chiado(0, 0.35, 0.3, 'highpass', 3500, null, 0.7);
        for (var i = 0; i < 5; i++) nota(2200 + Math.random() * 2600, 0.02 + i * 0.04, 0.12, 'sine', 0.05);
      } else if (mat === 'stone') { chiado(0, 0.5, 0.45, 'lowpass', 500, 120); chiado(0.05, 0.3, 0.2, 'bandpass', 1200, 300); nota(90, 0, 0.3, 'sine', 0.2, 50); }
      else { chiado(0, 0.08, 0.45, 'bandpass', 1800, null, 2); chiado(0.05, 0.25, 0.3, 'bandpass', 600, 250, 1.5); nota(160, 0.02, 0.15, 'triangle', 0.15, 90); }
    },
    toque: function (mat, forca) {
      var c = ac(); if (!c || c.currentTime - ultimoToque < 0.06) return;
      ultimoToque = c.currentTime;
      var v = Math.min(0.28, 0.05 + forca * 0.02);
      if (mat === 'glass') nota(1800 + Math.random() * 800, 0, 0.12, 'sine', v * 0.6);
      else if (mat === 'stone') chiado(0, 0.12, v, 'lowpass', 400);
      else if (mat === 'fruta') { chiado(0, 0.12, v, 'lowpass', 700, 200); nota(180, 0, 0.1, 'sine', v * 0.6, 90); }
      else { chiado(0, 0.06, v, 'bandpass', 900, null, 3); nota(220, 0, 0.08, 'triangle', v * 0.5, 140); }
    },
    splat: function () { chiado(0, 0.3, 0.35, 'lowpass', 1600, 200, 1.2); nota(300, 0, 0.15, 'sine', 0.15, 80); },
    explosao: function () { chiado(0, 0.9, 0.6, 'lowpass', 1200, 80, 0.7); nota(110, 0, 0.6, 'sine', 0.35, 35); chiado(0, 0.25, 0.3, 'bandpass', 2500, 500); },
    ko: function () { nota(320, 0, 0.12, 'sine', 0.14, 760); nota(760, 0.12, 0.3, 'sine', 0.12, 220); voz(600, 300, 0.3, 'o', 0.08, 0.02, 12); },
    puf: function () { chiado(0, 0.25, 0.18, 'bandpass', 800, 300, 0.8); },
    capacete: function () { nota(1400, 0, 0.25, 'square', 0.06); nota(2100, 0, 0.3, 'triangle', 0.06); nota(1750, 0.05, 0.35, 'sine', 0.05); },
    ai: function () { voz(500, 380, 0.18, 'a', 0.07); },
    estrela: function (i) { var f = [784, 988, 1319][i] || 1319; nota(f, 0, 0.35, 'triangle', 0.14); nota(f * 2, 0.04, 0.3, 'sine', 0.06); },
    vitoria: function () { [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) { nota(f, i * 0.11, 0.22, 'triangle', 0.13); }); },
    derrota: function () { [392, 370, 349, 330].forEach(function (f, i) { voz(f, f * 0.94, i === 3 ? 0.8 : 0.32, 'u', 0.13, i * 0.34, i === 3 ? 6 : 0); }); },
    tique: function () { nota(880, 0, 0.08, 'square', 0.06); }
  };
  raiz.FrutaSom = S;
})(this);
