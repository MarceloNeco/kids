/* Vruuum! — sons feitos na hora pelo navegador (WebAudio): ronco do motor, música de corrida (rock.js),
   estrela, batida, lama, turbo, pulo, buzina, 3-2-1 e festa da chegada. Nenhum arquivo de áudio.
   O navegador só deixa tocar depois de um toque: iniciar() é chamado no primeiro botão. */
(function (raiz) {
  'use strict';
  var ac = null, mestre = null, musGanho = null, motores = [], ligado = true, musicaLigada = false;
  // a música (banda de rock) mora em rock.js; aqui ficam o motor do carro e os efeitos
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function iniciar() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    var AC = raiz.AudioContext || raiz.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    mestre = ac.createGain(); mestre.gain.value = ligado ? 0.8 : 0; mestre.connect(ac.destination);
    musGanho = ac.createGain(); musGanho.gain.value = 0.55; musGanho.connect(mestre);
    if (raiz.VruuumRock) raiz.VruuumRock.preparar(ac, musGanho);
  }
  function tom(tipo, f, ini, dur, vol, fFim, destino) {
    if (!ac) return;
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f, ini);
    if (fFim) o.frequency.exponentialRampToValueAtTime(fFim, ini + dur);
    g.gain.setValueAtTime(0.0001, ini); g.gain.exponentialRampToValueAtTime(vol, ini + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, ini + dur);
    o.connect(g); g.connect(destino || mestre); o.start(ini); o.stop(ini + dur + 0.05);
  }
  var ruidoBuf = null;
  function ruido(ini, dur, vol, filtro, freq, destino) {
    if (!ac) return;
    if (!ruidoBuf) { ruidoBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); var d = ruidoBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = ruidoBuf; f.type = filtro; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, ini); g.gain.exponentialRampToValueAtTime(0.0001, ini + dur);
    s.connect(f); f.connect(g); g.connect(destino || mestre); s.start(ini); s.stop(ini + dur + 0.05);
  }

  // ---------- música: a "rádio" do jogo ----------
  /* Regra do dono (06/Nov/2026): com internet, só as 35 músicas gravadas (musicas/*.mp3: Kevin MacLeod e Anthem of
     Rain, CC BY 4.0, SuperTuxKart, CC BY-SA, e HoliznaCC0, CC0; créditos em musicas/LICENCAS.md), sem parar, em ordem
     sorteada e com a favorita por último (Trilha.embaralhar do ../trilha.js). Sem internet, só a favorita guardada no
     aparelho (Kart Grand Prix, Trilha.offline, cache "bolinho-musicas"; guardada na primeira que toca com internet),
     mesmo que outras estejam no cache do jogo; sem ela, as de rock feitas pelo rock.js. No arquivo baixado (sem MP3),
     só as do rock.js. Fora desde 06/Nov/2026: RetroFuture Nasty (sintetizador com som de videogame).
     Um único <audio> para tudo (o iPhone só deixa tocar o elemento que já tocou depois de um toque). */
  var GRAVADAS = [
    { url: 'musicas/volatile-reaction.mp3', nome: 'Volatile Reaction', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/kart-grand-prix.mp3', nome: 'Kart Grand Prix', autor: 'Weirwood', licenca: 'CC BY-SA 3.0' },
    { url: 'musicas/heroic-age.mp3', nome: 'Heroic Age', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/lava.mp3', nome: 'Lava', autor: 'Kalsan', licenca: 'CC BY-SA 3.0' },
    { url: 'musicas/unholy-knight.mp3', nome: 'Unholy Knight', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/las-dunas-champions.mp3', nome: 'Las Dunas Champions', autor: 'ALBatross', licenca: 'CC BY-SA 4.0' },
    // 1.3.0: mais 20 rocks gravados de verdade (bateria, baixo e guitarra): 15 do Kevin MacLeod (CC BY 4.0) e
    // 5 do HoliznaCC0 (álbum "Rock Montage", CC0, domínio público)
    { url: 'musicas/metalmania.mp3', nome: 'Metalmania', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/ready-aim-fire.mp3', nome: 'Ready Aim Fire', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/summon-the-rawk.mp3', nome: 'Summon the Rawk', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/noise-attack.mp3', nome: 'Noise Attack', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/hotrock.mp3', nome: 'Hotrock', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/neolith.mp3', nome: 'Neolith', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/iron-bacon.mp3', nome: 'Iron Bacon', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/take-the-lead.mp3', nome: 'Take the Lead', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/exhilarate.mp3', nome: 'Exhilarate', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/cool-hard-facts.mp3', nome: 'Cool Hard Facts', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/bet-you-can.mp3', nome: 'Bet You Can', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/pump.mp3', nome: 'Pump', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/breakdown.mp3', nome: 'Breakdown', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/what-you-want.mp3', nome: 'What You Want', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/holizna-jams.mp3', nome: 'Rock Montage: Jams', autor: 'HoliznaCC0', licenca: 'CC0' },
    { url: 'musicas/holizna-punk.mp3', nome: 'Rock Montage: Punk', autor: 'HoliznaCC0', licenca: 'CC0' },
    { url: 'musicas/holizna-americana.mp3', nome: 'Rock Montage: Americana', autor: 'HoliznaCC0', licenca: 'CC0' },
    { url: 'musicas/holizna-grunge.mp3', nome: 'Rock Montage: Grunge', autor: 'HoliznaCC0', licenca: 'CC0' },
    { url: 'musicas/holizna-classic.mp3', nome: 'Rock Montage: Classic', autor: 'HoliznaCC0', licenca: 'CC0' },
    // 1.4.0: mais 10 rocks animados: 4 da banda Anthem of Rain (instrumentais, CC BY 4.0), 1 do HoliznaCC0 (CC0) e 5 do Kevin MacLeod
    { url: 'musicas/anthem-rock-this-house.mp3', nome: 'Rock This House', autor: 'Anthem of Rain', licenca: 'CC BY 4.0' },
    { url: 'musicas/anthem-bad-nostalgia.mp3', nome: 'Bad Nostalgia', autor: 'Anthem of Rain', licenca: 'CC BY 4.0' },
    { url: 'musicas/anthem-so-my-love.mp3', nome: 'So My Love', autor: 'Anthem of Rain', licenca: 'CC BY 4.0' },
    { url: 'musicas/anthem-leave-the-country.mp3', nome: 'Leave the Country', autor: 'Anthem of Rain', licenca: 'CC BY 4.0' },
    { url: 'musicas/holizna-way-of-the-samurai.mp3', nome: 'Way of the Samurai', autor: 'HoliznaCC0', licenca: 'CC0' },
    { url: 'musicas/retrofuture-clean.mp3', nome: 'RetroFuture Clean', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/zap-beat.mp3', nome: 'Zap Beat', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/el-magicia.mp3', nome: 'El Magicia', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/gearhead.mp3', nome: 'Gearhead', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' },
    { url: 'musicas/bet-you-can-2.mp3', nome: 'Bet You Can (ver 2)', autor: 'Kevin MacLeod (incompetech.com)', licenca: 'CC BY 4.0' }
  ];
  var lista = [], atual = -1, audio = null, aoTrocar = null, falhas = 0, guardouFavorita = false, sintN = 0;
  // as gravadas em ordem sorteada (cada vez que abre o jogo começa por uma diferente), a favorita por último;
  // sem gravadas (arquivo baixado): só as 3 feitas pelo jogo
  function montarLista() {
    var sint = raiz.VruuumRock ? raiz.VruuumRock.MUSICAS.map(function (m, k) { return { s: k, nome: m.nome, autor: 'Vruuum!', licenca: '' }; }) : [];
    if (raiz.JOGO_EM_ARQUIVO || !raiz.Audio) { lista = sint; return; }
    var grav = GRAVADAS.map(function (g) { return { g: g }; }), T = raiz.Trilha;
    if (T && T.embaralhar) { lista = T.embaralhar(grav, 'vruuum', function (it) { return it.g.url; }); return; }
    for (var k = grav.length - 1; k > 0; k--) { var r = Math.floor(Math.random() * (k + 1)), tmp = grav[k]; grav[k] = grav[r]; grav[r] = tmp; }
    lista = grav;
  }
  // sem internet: só a favorita guardada no aparelho; sem ela, uma das feitas pelo rock.js; sem elas, silêncio
  function semInternet(it) {
    var OFF = raiz.Trilha && raiz.Trilha.offline;
    (OFF ? OFF.tocar(audio, OFF.FAVORITAS.vruuum) : Promise.resolve(false)).then(function (ok) {
      if (!musicaLigada || lista[atual] !== it) return;
      if (ok) {
        var fav = GRAVADAS.filter(function (g) { return OFF.FAVORITAS.vruuum.indexOf('/' + g.url) > 0; })[0];
        if (fav && aoTrocar) aoTrocar(info({ g: fav }));
        var p = audio.play(); if (p && p.catch) p.catch(function () {});
        return;
      }
      var R = raiz.VruuumRock; if (!R || !R.MUSICAS.length) return;
      var k = sintN++ % R.MUSICAS.length;
      if (aoTrocar) aoTrocar({ nome: R.MUSICAS[k].nome, autor: 'Vruuum!', licenca: '' });
      R.aoFim = avancar; R.comecar(k);
    });
  }
  function info(item) { return item.g ? { nome: item.g.nome, autor: item.g.autor, licenca: item.g.licenca } : { nome: item.nome, autor: item.autor, licenca: item.licenca }; }
  function pararTudo() { if (raiz.VruuumRock) raiz.VruuumRock.desligar(); if (audio) audio.pause(); }
  function tocarItem(k) {
    if (!lista.length) montarLista();
    if (!lista.length) return;
    atual = ((k % lista.length) + lista.length) % lista.length;
    var it = lista[atual];
    pararTudo();
    var offline = it.g && raiz.navigator && raiz.navigator.onLine === false;
    if (aoTrocar && !offline) aoTrocar(info(it));
    if (!musicaLigada) return;
    if (it.s != null) { raiz.VruuumRock.aoFim = avancar; raiz.VruuumRock.comecar(it.s); falhas = 0; return; }
    if (!audio) {
      audio = new raiz.Audio(); audio.preload = 'auto';
      audio.addEventListener('ended', avancar);   // se o arquivo não carregar, o play() falha e pula (abaixo)
    }
    if (offline) { audio.volume = 0.8; audio.muted = !ligado; semInternet(it); return; }
    audio.src = it.g.url; audio.volume = 0.8; audio.muted = !ligado;
    var p = audio.play(), OFF = raiz.Trilha && raiz.Trilha.offline;
    function pular() { if (musicaLigada && lista[atual] === it && ++falhas < lista.length) avancar(); }
    if (p && p.catch) p.then(function () {
      falhas = 0;
      if (OFF && !guardouFavorita && raiz.navigator.onLine !== false) { guardouFavorita = true; OFF.guardar(['vruuum']); }
    }).catch(function () {
      // sem internet: a favorita guardada no aparelho (blob:, o arquivo inteiro); sem ela, a próxima
      if (!OFF || !musicaLigada) { pular(); return; }
      OFF.tocar(audio, OFF.FAVORITAS.vruuum).then(function (ok) {
        if (!musicaLigada || lista[atual] !== it) return;
        if (!ok) { pular(); return; }
        var fav = GRAVADAS.filter(function (g) { return OFF.FAVORITAS.vruuum.indexOf('/' + g.url) > 0; })[0];
        if (fav && aoTrocar) aoTrocar(info({ g: fav }));
        var p2 = audio.play(); if (p2 && p2.catch) p2.then(function () { falhas = 0; }, pular);
      });
    });
  }
  function avancar() { tocarItem(atual + 1); }
  function musica(liga) {
    if (!ac) return;
    if (liga && !musicaLigada) {
      musicaLigada = true;
      if (atual < 0) { tocarItem(0); return; }
      var it = lista[atual];
      if (it.s != null) raiz.VruuumRock.ligar();
      else if (raiz.navigator && raiz.navigator.onLine === false) tocarItem(atual);   // sem internet: a favorita (ou a do rock.js) de novo
      else if (audio) { var p = audio.play(); if (p && p.catch) p.catch(function () {}); }
    } else if (!liga && musicaLigada) { musicaLigada = false; pararTudo(); }
  }
  // corrida nova: começa a próxima música do início
  function proxima() { tocarItem(atual + 1); }
  // app escondido (outra aba, tela apagada): silencia; ao voltar, continua
  function dormir(sim) {
    if (!ac) return;
    if (sim) { ac.suspend(); if (audio) audio.pause(); }
    else { ac.resume(); if (musicaLigada && atual >= 0 && lista[atual].g && audio) { var p = audio.play(); if (p && p.catch) p.catch(function () {}); } }
  }

  // ---------- motor (um por jogador) ----------
  function motor(vels) {
    if (!ac) return;
    while (motores.length < vels.length) {
      var o = ac.createOscillator(), o2 = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
      o.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0;
      o.connect(f); o2.connect(f); f.connect(g); g.connect(mestre); o.start(); o2.start();
      motores.push({ o: o, o2: o2, g: g, f: f });
    }
    motores.forEach(function (m, k) {
      var v = vels[k], agora = ac.currentTime;
      if (v == null) { m.g.gain.setTargetAtTime(0, agora, 0.1); return; }
      var f0 = 48 + v * 95 + (k ? 6 : 0);
      m.o.frequency.setTargetAtTime(f0, agora, 0.08); m.o2.frequency.setTargetAtTime(f0 * 0.5, agora, 0.08);
      m.f.frequency.setTargetAtTime(300 + v * 700, agora, 0.1);
      m.g.gain.setTargetAtTime(0.035 + v * 0.03, agora, 0.1);
    });
  }

  // ---------- efeitos ----------
  var efeitos = {
    estrela: function (t) { tom('square', 988, t, 0.07, 0.12); tom('square', 1319, t + 0.06, 0.14, 0.12); },
    estrelaAr: function (t) { [1047, 1319, 1568, 2093].forEach(function (f, k) { tom('square', f, t + k * 0.05, 0.1, 0.1); }); },
    batida: function (t) { ruido(t, 0.35, 0.6, 'lowpass', 900); tom('sawtooth', 220, t, 0.4, 0.2, 60); tom('sine', 600, t + 0.15, 0.5, 0.1, 1200); },
    cone: function (t) { tom('triangle', 500, t, 0.12, 0.3, 250); ruido(t, 0.1, 0.3, 'bandpass', 1200); },
    lama: function (t) { ruido(t, 0.4, 0.4, 'lowpass', 500); tom('sine', 180, t, 0.3, 0.25, 70); },
    turbo: function (t) { tom('sawtooth', 200, t, 0.6, 0.15, 1200); ruido(t, 0.6, 0.25, 'highpass', 2000); },
    pulo: function (t) { tom('square', 300, t, 0.35, 0.12, 900); },
    perdeu: function (t) { [880, 740, 620].forEach(function (f, k) { tom('triangle', f, t + k * 0.06, 0.08, 0.1); }); },
    tum: function (t) { tom('sine', 160, t, 0.15, 0.4, 80); },
    buzina: function (t, k) { var f = k ? 440 : 523; [0, 0.18].forEach(function (d) { tom('square', f, t + d, 0.13, 0.12); tom('square', f * 1.25, t + d, 0.13, 0.1); }); },
    bip: function (t) { tom('square', 660, t, 0.18, 0.2); },
    vai: function (t) { tom('square', 1320, t, 0.4, 0.22); },
    mundo: function (t) { [523, 659, 784].forEach(function (f, k) { tom('triangle', f, t + k * 0.08, 0.2, 0.15); }); },
    chegou: function (t) { [523, 659, 784, 1047, 784, 1047].forEach(function (f, k) { tom('square', f, t + k * 0.11, k === 5 ? 0.6 : 0.12, 0.13); }); ruido(t + 0.7, 1.2, 0.15, 'highpass', 5000); },
    clique: function (t) { tom('triangle', 880, t, 0.06, 0.15); },
    // 1.11.0: muitos barulhos novos
    derrapa: function (t) { ruido(t, 0.25, 0.25, 'bandpass', 2600); tom('sawtooth', 900, t, 0.22, 0.05, 700); },
    faisca: function (t, n) { var f = [0, 880, 1175, 1568][n || 1]; tom('square', f, t, 0.08, 0.12); tom('square', f * 1.5, t + 0.07, 0.12, 0.1); },
    miniturbo: function (t, n) { tom('sawtooth', 160, t, 0.5 + (n || 1) * 0.12, 0.2, 1400); ruido(t, 0.5, 0.3, 'highpass', 1500); tom('square', 660, t + 0.05, 0.15, 0.08, 1320); },
    caixa: function (t) { tom('triangle', 520, t, 0.08, 0.2, 1040); [0, 1, 2, 3, 4, 5, 6, 7].forEach(function (k) { tom('square', 700 + (k % 3) * 220, t + 0.1 + k * 0.12, 0.05, 0.06); }); },
    poder: function (t) { [784, 988, 1175, 1568].forEach(function (f, k) { tom('triangle', f, t + k * 0.07, 0.14, 0.15); }); },
    escudoBate: function (t) { tom('sine', 300, t, 0.35, 0.3, 900); tom('sine', 600, t + 0.05, 0.25, 0.12, 1500); },
    splat: function (t) { ruido(t, 0.3, 0.45, 'lowpass', 700); tom('sine', 260, t, 0.25, 0.35, 60); tom('triangle', 900, t + 0.05, 0.1, 0.1, 300); },
    gosma: function (t) { tom('sine', 200, t, 0.3, 0.3, 900); tom('sine', 140, t + 0.1, 0.2, 0.2, 400); },
    looping: function (t) { tom('sawtooth', 220, t, 1.2, 0.12, 880); tom('square', 330, t + 0.2, 1.0, 0.06, 1320); ruido(t, 1.2, 0.18, 'bandpass', 1800); },
    loopFeito: function (t) { [523, 659, 784, 1047, 1319].forEach(function (f, k) { tom('square', f, t + k * 0.08, 0.16, 0.12); }); ruido(t + 0.3, 0.8, 0.12, 'highpass', 5000); },
    fogos: function (t) { tom('sine', 120 + Math.random() * 60, t, 0.35, 0.4, 40); ruido(t, 0.6, 0.3, 'lowpass', 1800); for (var k = 0; k < 6; k++) ruido(t + 0.15 + k * 0.07 + Math.random() * 0.05, 0.05, 0.12, 'highpass', 4000); },
    turboRival: function (t) { tom('sawtooth', 120, t, 0.4, 0.07, 500); },
    looping2: function (t) { tom('sine', 440, t, 0.2, 0.1); },
    torcida: function (t) { for (var k = 0; k < 5; k++) ruido(t + k * 0.35, 0.9, 0.12, 'bandpass', 900 + k * 120); [784, 988, 1175].forEach(function (f, k) { tom('triangle', f, t + 0.2 + k * 0.1, 0.3, 0.08); }); },
    whoosh: function (t) { ruido(t, 0.7, 0.3, 'bandpass', 900); tom('sine', 300, t, 0.6, 0.1, 1200); }
  };
  // chiado do pneu (contínuo, um por jogador): força 0 a 1 (0 = quieto)
  var chiados = [];
  function chiado(forcas) {
    if (!ac) return;
    while (chiados.length < forcas.length) {
      if (!ruidoBuf) ruido(ac.currentTime, 0.01, 0.0001, 'lowpass', 100);
      var src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      src.buffer = ruidoBuf; src.loop = true; f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 3; g.gain.value = 0;
      src.connect(f); f.connect(g); g.connect(mestre); src.start();
      chiados.push({ g: g, f: f });
    }
    chiados.forEach(function (ch, k) { var v = forcas[k] || 0; ch.g.gain.setTargetAtTime(v * 0.18, ac.currentTime, 0.05); ch.f.frequency.setTargetAtTime(2000 + v * 1400, ac.currentTime, 0.1); });
  }
  function tocar(nome, k) { if (!ac || !ligado || !efeitos[nome]) return; efeitos[nome](ac.currentTime + 0.005, k); }
  function alternar() { ligado = !ligado; if (mestre) mestre.gain.setTargetAtTime(ligado ? 0.8 : 0, ac.currentTime, 0.05); if (audio) audio.muted = !ligado; return ligado; }
  function parar() { musica(false); motor([]); chiado([]); }

  raiz.VruuumSom = { iniciar: iniciar, tocar: tocar, motor: motor, musica: musica, proxima: proxima, aoTrocarMusica: function (fn) { aoTrocar = fn; if (atual >= 0 && lista[atual]) fn(info(lista[atual])); }, GRAVADAS: GRAVADAS, dormir: dormir, alternar: alternar, parar: parar, chiado: chiado, ligado: function () { return ligado; } };
})(this);
