/* Meu Pequeno Amiguinho — sons e vozes.
   - falar(texto, estilo, aoAcabar, genero): a voz do aparelho no idioma escolhido, de MENININHA ('f') ou de MENININHO
     ('m') (dono, 22/Nov/2026: o ursinho menina falava com voz de homem). Voz infantil não vem pronta nos navegadores:
     escolhemos pelo nome a voz feminina (menininha) ou masculina (menininho) do idioma e subimos o tom para soar criança;
     se o aparelho só tiver uma voz, o tom diferencia (menininha bem mais aguda).
   - Frases gravadas com o microfone: ficam SÓ neste aparelho (IndexedDB "meu-amiguinho", gaveta "vozes"); nunca são
     enviadas. O microfone só é pedido quando a pessoa toca em "Gravar". Efeito "voz de bichinho": tocar mais agudo
     (playbackRate 1.4 sem preservar o tom).
   - Vozes prontas gravadas (para depois): vozes/lista.json diz quais arquivos existem em vozes/<idioma>/<f|m>/<frase>.mp3;
     hoje a lista está vazia e a fala do aparelho é usada.
   - Efeitos (WebAudio, feitos aqui): toque, pop, vento da máquina de fofura, beijinho com brilho, festa, e os sons fofos
     (cantarolar, apitinho, ronronar, risadinha, beijinhos). */
(function (raiz) {
  'use strict';
  var V = {}, ctx = null, ligado = true;
  function ac() {
    if (!ctx) { var C = raiz.AudioContext || raiz.webkitAudioContext; if (!C) return null; try { ctx = new C(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') try { ctx.resume(); } catch (e) {}
    return ctx;
  }
  V.ligar = function (sim) { ligado = !!sim; };
  V.acordar = function () { ac(); };
  function nota(f, t0, dur, tipo, vol, f2) {
    var c = ac(); if (!c || !ligado) return;
    var o = c.createOscillator(), g = c.createGain(); o.type = tipo || 'sine';
    o.frequency.setValueAtTime(f, c.currentTime + t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, c.currentTime + t0 + dur);
    g.gain.setValueAtTime(0.0001, c.currentTime + t0); g.gain.exponentialRampToValueAtTime(vol || 0.18, c.currentTime + t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.05);
  }
  V.toque = function () { nota(660, 0, 0.09, 'sine', 0.12, 880); };
  V.pop = function () { nota(520, 0, 0.12, 'triangle', 0.16, 1040); };
  V.erro = function () { nota(300, 0, 0.16, 'sine', 0.12, 220); };
  V.brilho = function () { [1320, 1760, 2093, 2637].forEach(function (f, i) { nota(f, i * 0.06, 0.22, 'sine', 0.07); }); };
  V.beijinho = function () { nota(900, 0, 0.06, 'sine', 0.16, 1800); nota(1200, 0.12, 0.05, 'sine', 0.12, 2200); V.brilho(); };
  V.festa = function () { [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) { nota(f, i * 0.09, 0.22, 'triangle', 0.13); }); };
  V.estrelinhas = function () { [1047, 1319, 1568, 2093].forEach(function (f, i) { nota(f, i * 0.08, 0.3, 'sine', 0.1); }); };
  V.apertao = function () { nota(260, 0, 0.18, 'sine', 0.16, 140); };
  // vento da máquina de fofura: ruído filtrado que sobe enquanto o botão está apertado
  var vento = null;
  V.vento = function (liga, forca) {
    var c = ac(); if (!c) return;
    if (liga && !vento && ligado) {
      var n = c.sampleRate, buf = c.createBuffer(1, n, n), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      var src = c.createBufferSource(); src.buffer = buf; src.loop = true;
      var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 0.8;
      var g = c.createGain(); g.gain.value = 0.0001; g.gain.exponentialRampToValueAtTime(0.12, c.currentTime + 0.15);
      src.connect(f); f.connect(g); g.connect(c.destination); src.start();
      vento = { src: src, f: f, g: g };
    }
    if (vento && liga && forca != null) vento.f.frequency.setTargetAtTime(400 + forca * 9, c.currentTime, 0.05);
    if (vento && !liga) { var v = vento; vento = null; v.g.gain.setTargetAtTime(0.0001, c.currentTime, 0.06); setTimeout(function () { try { v.src.stop(); } catch (e) {} }, 400); }
  };
  // sons fofos (o jeito do bichinho, quando aperta)
  V.somFofo = function (id) {
    if (id === 'canto') [659, 784, 880, 784, 659, 784].forEach(function (f, i) { nota(f, i * 0.16, 0.18, 'sine', 0.12); nota(f * 2, i * 0.16, 0.12, 'sine', 0.03); });
    else if (id === 'apito') { nota(1400, 0, 0.12, 'square', 0.05, 1900); nota(1700, 0.16, 0.12, 'square', 0.05, 2200); }
    else if (id === 'ronrom') { for (var i = 0; i < 14; i++) nota(70 + (i % 2) * 10, i * 0.06, 0.07, 'sawtooth', 0.06); }
    else if (id === 'risada') [880, 988, 880, 1047, 880].forEach(function (f, i) { nota(f, i * 0.11, 0.09, 'triangle', 0.12, f * 1.2); });
    else if (id === 'beijo') { V.beijinho(); nota(900, 0.35, 0.06, 'sine', 0.16, 1800); }
  };

  /* ---------- fala do aparelho, o mais fofa possível ---------- */
  // tom (pitch) e ritmo de cada jeito de falar, para menininha (f) e menininho (m): os dois com tom de criança;
  // a "fala de urso" continua grossa, mas no gênero escolhido
  var ESTILOS = {
    fina: { f: { tom: 1.9, ritmo: 0.92 }, m: { tom: 1.45, ritmo: 0.95 } },
    grossa: { f: { tom: 0.8, ritmo: 0.85 }, m: { tom: 0.5, ritmo: 0.85 } },
    devagar: { f: { tom: 1.7, ritmo: 0.6 }, m: { tom: 1.3, ritmo: 0.6 } }
  };
  function lingua() { return raiz.BolinhoIdioma ? BolinhoIdioma.voz() : 'pt-BR'; }
  var FEMININAS = /female|feminin|mujer|mulher|girl|menina|niña|luciana|francisca|vit[oó]ria|maria|camila|thalita|fernanda|leticia|helena|joana|samantha|victoria|karen|allison|\bava\b|susan|zira|jenny|\baria\b|m[oó]nica|paulina|lucia|elvira|laura|marisol|esperanza/i;
  var MASCULINAS = /\bmale\b|mascul|hombre|homem|\bboy\b|menino|niño|daniel|felipe|ricardo|jorge|diego|\balex\b|\bfred\b|david|\bmark\b|\bguy\b|pablo|antonio|enrique|\btom\b|thomas/i;
  function generoDe(g) { return g === 'm' ? 'm' : 'f'; }
  // a voz do idioma com mais cara de menininha (g = 'f') ou de menininho (g = 'm'); sem nenhuma do gênero, a primeira do idioma
  V.escolherVoz = function (lang, g) {
    if (!raiz.speechSynthesis) return null;
    g = generoDe(g);
    var todas = speechSynthesis.getVoices() || [], l2 = (lang || lingua()).toLowerCase(), base = l2.slice(0, 2);
    var doIdioma = todas.filter(function (v) { return (v.lang || '').toLowerCase().replace('_', '-') === l2; });
    if (!doIdioma.length) doIdioma = todas.filter(function (v) { return (v.lang || '').toLowerCase().indexOf(base) === 0; });
    if (!doIdioma.length) return null;
    var quer = g === 'f' ? FEMININAS : MASCULINAS, nao = g === 'f' ? MASCULINAS : FEMININAS;
    var nota = function (v) { var n = v.name || ''; return (quer.test(n) ? 4 : 0) - (nao.test(n) ? 4 : 0) + (/child|kid|crian|junior/i.test(n) ? 1 : 0) + (v.localService ? 0.5 : 0); };
    return doIdioma.slice().sort(function (a, b) { return nota(b) - nota(a); })[0];
  };
  V.falar = function (texto, estilo, aoAcabar, genero) {
    if (!raiz.speechSynthesis || !texto) { if (aoAcabar) aoAcabar(); return false; }
    try {
      speechSynthesis.cancel();
      var g = generoDe(genero), u = new SpeechSynthesisUtterance(texto), e = (ESTILOS[estilo] || ESTILOS.fina)[g], v = V.escolherVoz(null, g);
      u.lang = lingua(); if (v) u.voice = v;
      u.pitch = e.tom; u.rate = e.ritmo; u.volume = 1;
      u.onend = u.onerror = function () { if (aoAcabar) aoAcabar(); };
      speechSynthesis.speak(u);
      return true;
    } catch (err) { if (aoAcabar) aoAcabar(); return false; }
  };
  V.calar = function () { try { if (raiz.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} if (tocador) try { tocador.pause(); } catch (e) {} };

  /* ---------- vozes prontas gravadas (pasta vozes/; hoje vazia) ---------- */
  var prontas = null;
  V.carregarProntas = function () {
    if (prontas || typeof fetch === 'undefined') return;
    prontas = {};
    fetch('vozes/lista.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j && j.arquivos) j.arquivos.forEach(function (f) { prontas[f] = true; }); }).catch(function () {});
  };
  V.temPronta = function (fraseId, lang, genero) { return !!(prontas && prontas[(lang || 'pt') + '/' + generoDe(genero) + '/' + fraseId + '.mp3']); };

  /* ---------- gravações no aparelho (IndexedDB) ---------- */
  var BANCO = 'meu-amiguinho', GAVETA = 'vozes';
  function banco() {
    return new Promise(function (ok, erro) {
      if (!raiz.indexedDB) { erro(new Error('sem indexedDB')); return; }
      var r = indexedDB.open(BANCO, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(GAVETA); };
      r.onsuccess = function () { ok(r.result); }; r.onerror = function () { erro(r.error); };
    });
  }
  function op(modo, f) { return banco().then(function (db) { return new Promise(function (ok, erro) { var t = db.transaction(GAVETA, modo), s = t.objectStore(GAVETA), r = f(s); t.oncomplete = function () { ok(r && r.result); db.close(); }; t.onerror = function () { erro(t.error); db.close(); }; }); }); }
  V.guardar = function (chave, blob) { return op('readwrite', function (s) { return s.put(blob, chave); }); };
  V.ler = function (chave) { return op('readonly', function (s) { return s.get(chave); }); };
  V.apagar = function (chave) { return op('readwrite', function (s) { return s.delete(chave); }).catch(function () {}); };
  V.chaves = function () { return op('readonly', function (s) { return s.getAllKeys(); }).catch(function () { return []; }); };
  V.podeGravar = function () { return !!(raiz.navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && raiz.MediaRecorder); };
  var gravando = null;
  // grava até maxMs; aoAndar(fracao) para a barrinha; devolve Promise<Blob>
  V.gravar = function (maxMs, aoAndar) {
    if (!V.podeGravar()) return Promise.reject(new Error('sem microfone'));
    return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then(function (fluxo) {
      return new Promise(function (ok, erro) {
        var partes = [], rec;
        try { rec = new MediaRecorder(fluxo); } catch (e) { fluxo.getTracks().forEach(function (t) { t.stop(); }); erro(e); return; }
        var t0 = Date.now(), tick = setInterval(function () { if (aoAndar) aoAndar(Math.min(1, (Date.now() - t0) / maxMs)); }, 100);
        rec.ondataavailable = function (e) { if (e.data && e.data.size) partes.push(e.data); };
        rec.onstop = function () { clearInterval(tick); fluxo.getTracks().forEach(function (t) { t.stop(); }); gravando = null; ok(new Blob(partes, { type: rec.mimeType || 'audio/webm' })); };
        rec.start(); gravando = rec;
        setTimeout(function () { if (rec.state === 'recording') rec.stop(); }, maxMs);
      });
    });
  };
  V.pararGravacao = function () { if (gravando && gravando.state === 'recording') gravando.stop(); };
  V.gravandoAgora = function () { return !!gravando; };
  var tocador = null, urlAtual = null;
  V.tocarBlob = function (blob, efeito, aoAcabar) {
    if (!blob) { if (aoAcabar) aoAcabar(); return false; }
    if (!tocador) tocador = new Audio();
    if (urlAtual) URL.revokeObjectURL(urlAtual);
    urlAtual = URL.createObjectURL(blob);
    tocador.src = urlAtual;
    try { tocador.preservesPitch = !efeito; tocador.mozPreservesPitch = !efeito; tocador.webkitPreservesPitch = !efeito; } catch (e) {}
    tocador.playbackRate = efeito ? 1.4 : 1;
    tocador.onended = function () { if (aoAcabar) aoAcabar(); };
    var p = tocador.play(); if (p && p.catch) p.catch(function () { if (aoAcabar) aoAcabar(); });
    return true;
  };
  V.tocarArquivo = function (url, aoAcabar) {
    if (!tocador) tocador = new Audio();
    tocador.src = url; tocador.playbackRate = 1; tocador.onended = function () { if (aoAcabar) aoAcabar(); };
    var p = tocador.play(); if (p && p.catch) p.catch(function () { if (aoAcabar) aoAcabar(); });
  };

  raiz.AmiguinhoVoz = V;
})(typeof window !== 'undefined' ? window : globalThis);
