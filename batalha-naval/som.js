/* Batalha Naval — efeitos sonoros, todos feitos na hora pelo próprio aparelho (Web Audio). Nenhum arquivo de som.
   BNSom.iniciar() no primeiro toque (o navegador só libera som depois de um toque);
   BNSom.efeito('agua' | 'acerto' | 'afundou' | 'vitoria' | 'derrota' | 'vez' | 'toque' | 'por' | 'girar' | 'erro' | 'comecou');
   BNSom.ligar(true/false). A música de fundo é a do ../trilha.js (gravada), separada destes efeitos. */
(function (raiz) {
  'use strict';
  var ctx = null, ligado = true, ruido = null;
  function iniciar() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(function () {}); return; }
    var AC = raiz.AudioContext || raiz.webkitAudioContext; if (!AC) return;
    try { ctx = new AC(); } catch (e) { ctx = null; return; }
    var n = ctx.sampleRate, b = ctx.createBuffer(1, n, n), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    ruido = b;
  }
  function tom(f0, f1, dur, tipo, vol, quando) {
    var t = ctx.currentTime + (quando || 0), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  function chiado(dur, f0, f1, vol, quando, tipo) {
    var t = ctx.currentTime + (quando || 0), s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = ruido; f.type = tipo || 'lowpass'; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol || 0.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(ctx.destination); s.start(t); s.stop(t + dur + 0.05);
  }
  var EF = {
    toque: function () { tom(660, 520, 0.06, 'triangle', 0.08); },
    por: function () { tom(300, 220, 0.12, 'triangle', 0.18); chiado(0.15, 900, 300, 0.12); },
    girar: function () { tom(500, 800, 0.1, 'triangle', 0.12); },
    erro: function () { tom(200, 150, 0.18, 'square', 0.08); },
    vez: function () { tom(784, 0, 0.18, 'sine', 0.18); tom(1046, 0, 0.3, 'sine', 0.18, 0.12); },
    comecou: function () { [392, 523, 659, 784].forEach(function (f, i) { tom(f, 0, 0.22, 'square', 0.09, i * 0.11); }); },
    // água: o "ploft" (bolha caindo) e o respingo
    agua: function () { tom(900, 180, 0.25, 'sine', 0.22); chiado(0.45, 3000, 400, 0.18, 0.05, 'bandpass'); },
    // acerto: explosão (estrondo grave + chiado)
    acerto: function () { tom(140, 40, 0.5, 'sawtooth', 0.22); chiado(0.6, 2500, 120, 0.45); },
    // afundou: explosão maior e o navio "descendo" (glub glub)
    afundou: function () {
      tom(120, 30, 0.8, 'sawtooth', 0.25); chiado(0.9, 3000, 90, 0.5);
      [0.55, 0.75, 0.95].forEach(function (q, i) { tom(500 - i * 90, 200 - i * 40, 0.16, 'sine', 0.16, q); });
    },
    vitoria: function () { [523, 659, 784, 1046, 784, 1046].forEach(function (f, i) { tom(f, 0, i === 5 ? 0.6 : 0.18, 'square', 0.1, i * 0.14); }); },
    derrota: function () { [392, 349, 311, 262].forEach(function (f, i) { tom(f, 0, 0.3, 'triangle', 0.14, i * 0.22); }); }
  };
  raiz.BNSom = {
    iniciar: iniciar,
    ligar: function (v) { ligado = !!v; },
    ligado: function () { return ligado; },
    efeito: function (nome) { if (!ligado || !ctx || !EF[nome]) return; try { EF[nome](); } catch (e) { /* sem som */ } }
  };
})(typeof window !== 'undefined' ? window : this);
