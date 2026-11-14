/* AQUA — efeitos sonoros. Sons GRAVADOS de verdade (pasta sons/, créditos no CREDITOS.md), tocados pelo WebAudio
   para sair na hora do toque. Enquanto uma gravação ainda não carregou (ou se o aparelho não conseguir abrir), toca
   um som de reserva feito na hora, para o jogo nunca ficar mudo.
   A música de fundo é a trilha comum (../trilha.js); aqui são só os efeitos.

   AquaSom.ligar(true|false) · ligado() · acordar() (no primeiro toque: libera o som e carrega as gravações)
   · vidro() pegar um frasco · despejar(segundos) · glub() · rolha() · brilho() · aplausos() · erro() · toque() */
(function (raiz) {
  'use strict';
  var ctx = null, ligado = true, buf = {}, pedidos = false, despejando = null;
  var ARQ = { despejar: 'sons/despejar.mp3', glub: 'sons/glub.mp3', rolha: 'sons/rolha.mp3', vidro: 'sons/vidro.mp3',
    brilho: 'sons/brilho.mp3', aplausos: 'sons/aplausos.mp3', erro: 'sons/erro.mp3' };

  function ac() {
    try {
      if (!ctx) { var A = raiz.AudioContext || raiz.webkitAudioContext; if (!A) return null; ctx = new A(); }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { return null; }
    return ctx;
  }
  function carregar() {
    if (pedidos || !raiz.fetch) return; pedidos = true;
    var c = ac(); if (!c) return;
    Object.keys(ARQ).forEach(function (k) {
      raiz.fetch(ARQ[k]).then(function (r) { if (!r.ok) throw new Error('sem arquivo'); return r.arrayBuffer(); })
        .then(function (ab) { return new Promise(function (ok, erro) { c.decodeAudioData(ab, ok, erro); }); })
        .then(function (b) { buf[k] = b; }).catch(function () { /* fica o som de reserva */ });
    });
  }
  // toca uma gravação; devolve { fonte, ganho } ou null se ela (ainda) não existe
  function tocar(nome, vol, ritmo, duracao) {
    var c = ligado && ac(); if (!c || !buf[nome]) return null;
    try {
      var s = c.createBufferSource(), g = c.createGain(), t = c.currentTime;
      s.buffer = buf[nome]; s.playbackRate.value = ritmo || 1;
      g.gain.setValueAtTime(vol == null ? 0.8 : vol, t);
      s.connect(g); g.connect(c.destination); s.start(t);
      if (duracao) { g.gain.setValueAtTime(vol == null ? 0.8 : vol, t + Math.max(0.05, duracao - 0.14)); g.gain.linearRampToValueAtTime(0.0001, t + duracao); s.stop(t + duracao + 0.03); }
      return { fonte: s, ganho: g };
    } catch (e) { return null; }
  }
  // reserva: nota simples
  function nota(freq, ini, dur, tipo, vol, ate) {
    var c = ligado && ac(); if (!c) return;
    try {
      var o = c.createOscillator(), g = c.createGain(), t = c.currentTime + (ini || 0);
      o.type = tipo || 'sine'; o.frequency.setValueAtTime(freq, t);
      if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
    } catch (e) { /* sem som */ }
  }
  // reserva do despejo: chiado de água (ruído filtrado) que sobe de tom enquanto o frasco enche
  function chiado(dur) {
    var c = ligado && ac(); if (!c) return;
    try {
      var n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0), i;
      for (i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (0.6 + 0.4 * Math.sin(i * 0.004));
      var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime;
      s.buffer = b; f.type = 'bandpass'; f.Q.value = 2.2; f.frequency.setValueAtTime(700, t); f.frequency.exponentialRampToValueAtTime(1900, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.05); g.gain.setValueAtTime(0.16, t + dur - 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
    } catch (e) { /* sem som */ }
  }

  var S = {
    ARQUIVOS: ARQ,
    ligar: function (v) { ligado = !!v; if (!ligado) S.pararDespejo(); },
    ligado: function () { return ligado; },
    acordar: function () { if (ac()) carregar(); },
    carregadas: function () { return Object.keys(buf); },
    toque: function () { if (!tocar('vidro', 0.35, 1.5)) nota(900, 0, 0.05, 'triangle', 0.06); },
    vidro: function () { if (!tocar('vidro', 0.7, 0.94 + Math.random() * 0.14)) { nota(1560, 0, 0.16, 'sine', 0.08); nota(2340, 0.01, 0.22, 'sine', 0.04); } },
    despejar: function (dur) {
      S.pararDespejo();
      // a gravação fica um pouco mais aguda no fim, como um frasco de verdade enchendo
      var r = tocar('despejar', 0.85, 1, dur);
      if (r) { try { r.fonte.playbackRate.linearRampToValueAtTime(1.22, ctx.currentTime + dur); } catch (e) { /* tudo bem */ } despejando = r; }
      else chiado(dur);
    },
    pararDespejo: function () {
      if (!despejando || !ctx) return;
      try { despejando.ganho.gain.cancelScheduledValues(ctx.currentTime); despejando.ganho.gain.setValueAtTime(0.0001, ctx.currentTime); despejando.fonte.stop(ctx.currentTime + 0.03); } catch (e) { /* já parou */ }
      despejando = null;
    },
    glub: function () { if (!tocar('glub', 0.8, 0.9 + Math.random() * 0.25)) nota(240, 0, 0.13, 'sine', 0.16, 520); },
    rolha: function () { if (!tocar('rolha', 0.9, 1)) { nota(420, 0, 0.07, 'square', 0.1, 150); nota(900, 0.02, 0.05, 'triangle', 0.07); } },
    brilho: function () { if (!tocar('brilho', 0.7, 1)) [1047, 1319, 1568, 2093].forEach(function (f, k) { nota(f, k * 0.07, 0.4, 'sine', 0.09); }); },
    aplausos: function () { if (!tocar('aplausos', 0.8, 1)) [523, 659, 784, 1047, 784, 1047].forEach(function (f, k) { nota(f, k * 0.12, 0.3, 'triangle', 0.13); }); },
    erro: function () { if (!tocar('erro', 0.6, 1)) nota(190, 0, 0.14, 'triangle', 0.12, 120); }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = S; else raiz.AquaSom = S;
})(typeof self !== 'undefined' ? self : this);
