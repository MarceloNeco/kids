/* Batalha Naval — efeitos sonoros, todos feitos na hora pelo próprio aparelho (Web Audio). Nenhum arquivo de som:
   funciona sem internet. Tudo passa por um volume geral e um compressor (as explosões não estouram o alto-falante).
   BNSom.iniciar() no primeiro toque (o navegador só libera som depois de um toque);
   BNSom.efeito(nome) → true se tocou. Nomes (BNSom.EFEITOS):
     toque (botão) · por (navio no mar: baque de metal) · girar (clique) · erro · pronto (apito do navio)
     comecou (corneta da batalha) · vez (ping do sonar) · disparo (canhão + míssil saindo) · assobio (tiro chegando)
     agua (respingo) · acerto (explosão com estrondo) · afundou (explosões, o casco rangendo e as bolhas)
     vitoria (fanfarra) · derrota (trombone triste)
   BNSom.ligar(true/false) é o botão 🔊 do jogo. A música de fundo é a do ../trilha.js (gravada): durante os efeitos
   maiores ela abaixa (Trilha.volume(0.3)) e depois volta sozinha, para os efeitos ficarem por cima. */
(function (raiz) {
  'use strict';
  var ctx = null, ligado = true, ruido = null, mestre = null, distorcao = null, tAbaixar = null;
  function iniciar() {
    if (ctx) { if (ctx.state === 'suspended' && ctx.resume) ctx.resume().catch(function () {}); return; }
    var AC = raiz.AudioContext || raiz.webkitAudioContext; if (!AC) return;
    try {
      ctx = new AC();
      var n = ctx.sampleRate * 2, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      ruido = b;
      mestre = ctx.createGain(); mestre.gain.value = 0.85;
      var comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 6; comp.attack.value = 0.003; comp.release.value = 0.25;
      mestre.connect(comp); comp.connect(ctx.destination);
      distorcao = ctx.createWaveShaper();
      var c = new Float32Array(1024); for (i = 0; i < 1024; i++) { var x = i / 512 - 1; c[i] = (1 + 6) * x / (1 + 6 * Math.abs(x)); }
      distorcao.curve = c; distorcao.connect(mestre);
    } catch (e) { ctx = null; }
  }
  function agora() { return ctx.currentTime; }
  // envelope: sobe em "ataque", fica, e cai até sumir no fim de "dur"
  function envelope(g, t, vol, ataque, dur) {
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  // tom simples: o = { f0, f1, dur, tipo, vol, q (quando), ataque, saida, vib (Hz), prof (Hz) }
  function tom(o) {
    var t = agora() + (o.q || 0), osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.tipo || 'sine'; osc.frequency.setValueAtTime(o.f0, t);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, t + o.dur);
    if (o.vib) { var l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = o.vib; lg.gain.value = o.prof || 4; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + o.dur + 0.05); }
    envelope(g, t, o.vol || 0.2, o.ataque || 0.01, o.dur);
    osc.connect(g); g.connect(o.saida || mestre); osc.start(t); osc.stop(t + o.dur + 0.05);
    return g;
  }
  // chiado filtrado: o = { dur, f0, f1, vol, q, filtro ('lowpass' | 'bandpass' | 'highpass'), Q, ataque, saida }
  function chiado(o) {
    var t = agora() + (o.q || 0), s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = ruido; fl.type = o.filtro || 'lowpass'; fl.Q.value = o.Q || 0.8;
    fl.frequency.setValueAtTime(o.f0, t); if (o.f1) fl.frequency.exponentialRampToValueAtTime(o.f1, t + o.dur);
    envelope(g, t, o.vol || 0.3, o.ataque || 0.005, o.dur);
    s.connect(fl); fl.connect(g); g.connect(o.saida || mestre);
    s.start(t, Math.random() * 1.2); s.stop(t + o.dur + 0.05);
  }
  // metal de sopro (corneta, apito, trombone): duas ondas serrote quase iguais, filtro que abre no ataque
  function sopro(f, q, dur, vol, corte, vib) {
    var t = agora() + q, fl = ctx.createBiquadFilter(), g = ctx.createGain();
    fl.type = 'lowpass'; fl.Q.value = 2; fl.frequency.setValueAtTime(200, t); fl.frequency.exponentialRampToValueAtTime(corte, t + 0.06); fl.frequency.exponentialRampToValueAtTime(corte * 0.55, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.04); g.gain.setValueAtTime(vol, t + Math.max(0.05, dur - 0.1)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    [1, 1.004].forEach(function (k) {
      var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f * k, t);
      if (vib) { var l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = vib; lg.gain.value = f * 0.012; l.connect(lg); lg.connect(o.frequency); l.start(t + 0.12); l.stop(t + dur + 0.05); }
      o.connect(fl); o.start(t); o.stop(t + dur + 0.05);
    });
    fl.connect(g); g.connect(mestre);
  }
  function eco(tempo, volta, mix) {
    var ent = ctx.createGain(), d = ctx.createDelay(1), fb = ctx.createGain(), m = ctx.createGain();
    d.delayTime.value = tempo; fb.gain.value = volta; m.gain.value = mix;
    ent.connect(mestre); ent.connect(d); d.connect(fb); fb.connect(d); d.connect(m); m.connect(mestre);
    return ent;
  }
  function bolhas(q, n, dur, vol) {
    for (var i = 0; i < n; i++) { var f = 280 + Math.random() * 500; tom({ f0: f, f1: f * (1.6 + Math.random()), dur: 0.05 + Math.random() * 0.05, tipo: 'sine', vol: vol * (0.6 + Math.random() * 0.4), q: q + Math.random() * dur, ataque: 0.004 }); }
  }
  // explosão: o estrondo (chiado grave saturado), o "soco" grave, os estalos e o ronco que fica
  function explosao(q, k) {
    chiado({ dur: 1.1 * k, f0: 3200, f1: 90, vol: 0.9, q: q, ataque: 0.004, saida: distorcao });
    tom({ f0: 95, f1: 28, dur: 1.0 * k, tipo: 'sine', vol: 0.75, q: q, ataque: 0.006, saida: distorcao });
    tom({ f0: 160, f1: 45, dur: 0.35, tipo: 'triangle', vol: 0.35, q: q });
    for (var i = 0; i < 5; i++) chiado({ dur: 0.04, f0: 2500 + Math.random() * 3000, vol: 0.18, q: q + 0.08 + Math.random() * 0.5, filtro: 'highpass' });
    chiado({ dur: 1.8 * k, f0: 160, f1: 60, vol: 0.45, q: q + 0.05, ataque: 0.08, Q: 1.5 });
  }

  var EF = {
    toque: function () { tom({ f0: 880, f1: 640, dur: 0.06, tipo: 'triangle', vol: 0.08 }); chiado({ dur: 0.02, f0: 4000, vol: 0.05, filtro: 'highpass' }); },
    por: function () {
      tom({ f0: 150, f1: 62, dur: 0.22, tipo: 'sine', vol: 0.45, ataque: 0.004 });
      chiado({ dur: 0.09, f0: 1100, vol: 0.32, filtro: 'bandpass', Q: 3 });
      [347, 791, 1127, 1561, 2093].forEach(function (f, i) { tom({ f0: f, dur: 0.18 + 0.12 * (5 - i) / 5, tipo: 'sine', vol: 0.055, ataque: 0.002 }); });
      tom({ f0: 220, f1: 180, dur: 0.05, tipo: 'square', vol: 0.06, q: 0.012 });
    },
    girar: function () { [0, 0.045, 0.09].forEach(function (q, i) { chiado({ dur: 0.018, f0: 3500 - i * 400, vol: 0.22, q: q, filtro: 'highpass' }); tom({ f0: 1800 - i * 200, dur: 0.02, tipo: 'square', vol: 0.03, q: q }); }); },
    erro: function () { tom({ f0: 190, f1: 150, dur: 0.14, tipo: 'square', vol: 0.08 }); tom({ f0: 170, f1: 120, dur: 0.18, tipo: 'square', vol: 0.08, q: 0.16 }); },
    pronto: function () {
      sopro(98, 0, 1.15, 0.22, 900, 5); sopro(147, 0, 1.15, 0.16, 1100, 5);
      chiado({ dur: 1.1, f0: 300, vol: 0.06, ataque: 0.1, filtro: 'bandpass', Q: 1 });
    },
    comecou: function () {
      [[392, 0, 0.14], [523, 0.15, 0.14], [659, 0.3, 0.14], [784, 0.45, 0.5]].forEach(function (n) { sopro(n[0], n[1], n[2], 0.14, 2600); });
      [0, 0.15, 0.3, 0.45, 0.52].forEach(function (q) { chiado({ dur: 0.12, f0: 1800, f1: 400, vol: 0.25, q: q, filtro: 'bandpass', Q: 0.8 }); tom({ f0: 140, f1: 60, dur: 0.12, vol: 0.35, q: q }); });
    },
    vez: function () {
      var e = eco(0.32, 0.38, 0.6);
      tom({ f0: 1180, f1: 1150, dur: 1.3, tipo: 'sine', vol: 0.22, ataque: 0.004, saida: e });
      tom({ f0: 2360, dur: 0.25, tipo: 'sine', vol: 0.04, ataque: 0.004, saida: e });
    },
    disparo: function () {
      chiado({ dur: 0.55, f0: 1400, f1: 140, vol: 0.75, ataque: 0.003, saida: distorcao });
      tom({ f0: 120, f1: 36, dur: 0.45, tipo: 'sine', vol: 0.6, ataque: 0.004, saida: distorcao });
      chiado({ dur: 0.55, f0: 500, f1: 2600, vol: 0.28, q: 0.05, filtro: 'bandpass', Q: 2.5, ataque: 0.12 });
    },
    assobio: function () {
      tom({ f0: 2300, f1: 650, dur: 0.62, tipo: 'sine', vol: 0.12, ataque: 0.08, vib: 9, prof: 30 });
      chiado({ dur: 0.6, f0: 900, f1: 2200, vol: 0.12, filtro: 'bandpass', Q: 3, ataque: 0.3 });
    },
    agua: function () {
      chiado({ dur: 0.55, f0: 2600, f1: 500, vol: 0.5, ataque: 0.01, filtro: 'bandpass', Q: 0.7 });
      tom({ f0: 320, f1: 85, dur: 0.16, tipo: 'sine', vol: 0.35, ataque: 0.004 });
      chiado({ dur: 0.8, f0: 5000, f1: 2500, vol: 0.09, q: 0.15, filtro: 'highpass', ataque: 0.05 });
      bolhas(0.12, 7, 0.45, 0.07);
    },
    acerto: function () { explosao(0, 1); },
    afundou: function () {
      explosao(0, 1.25); explosao(0.38, 1.1);
      // o casco rangendo e afundando
      var t = agora() + 0.7, o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(78, t); o.frequency.exponentialRampToValueAtTime(40, t + 1.9);
      fl.type = 'bandpass'; fl.Q.value = 6; fl.frequency.setValueAtTime(380, t); l.frequency.value = 3.2; lg.gain.value = 160; l.connect(lg); lg.connect(fl.frequency);
      envelope(g, t, 0.28, 0.25, 1.9);
      o.connect(fl); fl.connect(g); g.connect(mestre); o.start(t); o.stop(t + 2); l.start(t); l.stop(t + 2);
      tom({ f0: 190, f1: 120, dur: 0.5, tipo: 'square', vol: 0.04, q: 1.1, vib: 11, prof: 12 });
      bolhas(1.2, 16, 1.5, 0.08);
    },
    vitoria: function () {
      [[523, 0, 0.13], [659, 0.14, 0.13], [784, 0.28, 0.13], [1046, 0.42, 0.28], [784, 0.72, 0.13], [1046, 0.86, 0.9]].forEach(function (n) { sopro(n[0], n[1], n[2], 0.13, 3000); });
      [523, 659].forEach(function (f) { sopro(f, 0.86, 0.9, 0.08, 2400); });
      for (var i = 0; i < 6; i++) chiado({ dur: 0.08, f0: 2000, f1: 600, vol: 0.15, q: 0.86 + i * 0.06, filtro: 'bandpass' });
    },
    derrota: function () { [[392, 0, 0.38], [370, 0.42, 0.38], [349, 0.84, 0.38], [330, 1.26, 1.2]].forEach(function (n, i) { sopro(n[0], n[1], n[2], 0.16, 900, i === 3 ? 6 : 0); }); }
  };
  // quanto tempo cada efeito dura (para abaixar a música só enquanto toca)
  var DURA = { pronto: 1.2, comecou: 1, vez: 1.6, disparo: 0.6, assobio: 0.6, agua: 0.9, acerto: 1.9, afundou: 3.2, vitoria: 1.8, derrota: 2.5 };
  var abaixadaAte = 0;
  function abaixarMusica(s) {
    var T = raiz.Trilha; if (!T || !T.volume) return;
    var fim = Math.max(abaixadaAte, Date.now() + s * 1000 + 250);
    T.volume(0.3); clearTimeout(tAbaixar); abaixadaAte = fim;
    tAbaixar = setTimeout(function () { abaixadaAte = 0; T.volume(null); }, fim - Date.now());
  }
  raiz.BNSom = {
    EFEITOS: Object.keys(EF),
    iniciar: iniciar,
    ligar: function (v) { ligado = !!v; },
    ligado: function () { return ligado; },
    efeito: function (nome) {
      if (!ligado || !ctx || !EF[nome]) return false;
      try { EF[nome](); } catch (e) { return false; }
      if (DURA[nome]) abaixarMusica(DURA[nome]);
      return true;
    }
  };
})(typeof window !== 'undefined' ? window : this);
