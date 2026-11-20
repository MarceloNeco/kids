/* Jogoteca — efeitos de batalha usados pelo Jogo da Velha e pelo Xadrez (dono, 20/Nov/2026: "com bastante animação, como
   se fosse uma guerra pra quem ganha"). Guerra de desenho animado: faíscas, fumaça, estilhaços, tremor, letreiros de
   quadrinho (POW! BUM!), faixas grandes (XEQUE!, VITÓRIA!), fogos e sons feitos no código (WebAudio, sem arquivo).
     var fx = JogotecaBatalha.criar(palco, ctx)
     fx.explosao(x, y, cores, forca)   estilhaços + fumaça (x, y em px dentro do palco; forca 0.5 a 2)
     fx.faiscas(x, y, cor)            faísquinhas (pôr uma peça, espadas se batendo)
     fx.texto(x, y, txt, cor)         letreiro de quadrinho que pula e some
     fx.faixa(txt, cor, ms)           faixa grande atravessando o meio
     fx.tremer(el, forte)             a tela (ou a peça) treme
     fx.fogos(n)                      fogos de artifício
     fx.som(nome)                     'passo' 'espada' 'boom' 'tambor' 'corneta' 'vitoria' 'derrota' 'tregua'
     fx.parar()                       solta tudo (laço de animação, canvas, sons)
   Com ctx.calmo (reduzir movimento) quase não treme e solta menos partículas. */
(function () {
  'use strict';
  var CSS = '' +
    '.jt-bat-cv{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:30}' +
    '.jt-bat-txt{position:absolute;z-index:31;pointer-events:none;font-weight:800;font-size:clamp(26px,8vw,46px);letter-spacing:1px;transform:translate(-50%,-50%) rotate(-8deg);' +
      '-webkit-text-stroke:2px #1a0d00;paint-order:stroke fill;text-shadow:3px 4px 0 #1a0d00;animation:jtBatTxt .9s ease-out forwards;white-space:nowrap}' +
    '@keyframes jtBatTxt{0%{transform:translate(-50%,-50%) rotate(-8deg) scale(.2);opacity:0}25%{transform:translate(-50%,-50%) rotate(-8deg) scale(1.35);opacity:1}' +
      '45%{transform:translate(-50%,-50%) rotate(-4deg) scale(1)}100%{transform:translate(-50%,-130%) rotate(-4deg) scale(1.05);opacity:0}}' +
    '.jt-bat-faixa{position:absolute;left:-5%;right:-5%;top:50%;z-index:32;pointer-events:none;padding:10px 0;text-align:center;font-weight:800;font-size:clamp(30px,10vw,64px);' +
      'color:#fff;-webkit-text-stroke:2px #1a0d00;paint-order:stroke fill;text-shadow:0 5px 0 #1a0d00;transform:translateY(-50%) rotate(-4deg);' +
      'box-shadow:0 8px 24px rgba(0,0,0,.45);animation:jtBatFaixa 1.6s cubic-bezier(.2,.9,.3,1.2) forwards}' +
    '@keyframes jtBatFaixa{0%{transform:translate(-110%,-50%) rotate(-4deg)}18%{transform:translate(0,-50%) rotate(-4deg)}82%{transform:translate(0,-50%) rotate(-4deg);opacity:1}' +
      '100%{transform:translate(110%,-50%) rotate(-4deg);opacity:0}}' +
    '.jt-bat-treme{animation:jtBatTreme .38s linear}.jt-bat-treme.forte{animation:jtBatTremeF .55s linear}' +
    '@keyframes jtBatTreme{0%,100%{translate:0 0}20%{translate:-5px 2px}40%{translate:5px -3px}60%{translate:-4px 3px}80%{translate:3px -2px}}' +
    '@keyframes jtBatTremeF{0%,100%{translate:0 0}10%{translate:-11px 5px}25%{translate:10px -7px}40%{translate:-9px 6px}55%{translate:8px -5px}70%{translate:-5px 4px}85%{translate:4px -2px}}';

  function criar(palco, ctx) {
    if (!document.getElementById('jt-batalha-css')) { var st = document.createElement('style'); st.id = 'jt-batalha-css'; st.textContent = CSS; document.head.appendChild(st); }
    var calmo = !!ctx.calmo, cv = document.createElement('canvas'); cv.className = 'jt-bat-cv'; palco.appendChild(cv);
    var g = cv.getContext('2d'), parts = [], laco = 0, ultimo = 0, vivo = true, timers = [], actx = null, dpr = Math.min(2, window.devicePixelRatio || 1);
    function medir() { var r = palco.getBoundingClientRect(); cv.width = Math.max(1, r.width * dpr); cv.height = Math.max(1, r.height * dpr); }
    medir(); window.addEventListener('resize', medir);
    function quadro(agora) {
      laco = 0; if (!vivo) return;
      var dt = Math.min(0.05, ultimo ? (agora - ultimo) / 1000 : 0.016); ultimo = agora;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
      parts = parts.filter(function (p) {
        p.t += dt; if (p.t >= p.vida) return false;
        p.vy += p.gr * dt; p.vx *= (1 - p.atr * dt); p.vy *= (1 - p.atr * dt); p.x += p.vx * dt; p.y += p.vy * dt; p.giro += p.vg * dt;
        var k = 1 - p.t / p.vida;
        g.globalAlpha = Math.max(0, p.tipo === 'fumaca' ? k * 0.55 : k);
        g.fillStyle = p.cor;
        if (p.tipo === 'fumaca') { g.beginPath(); g.arc(p.x, p.y, p.r * (1.6 - k * 0.8), 0, 7); g.fill(); }
        else if (p.tipo === 'caco') { g.save(); g.translate(p.x, p.y); g.rotate(p.giro); g.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r); g.restore(); }
        else if (p.tipo === 'risco') { g.strokeStyle = p.cor; g.lineWidth = p.r; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04); g.stroke(); }
        else { g.beginPath(); g.arc(p.x, p.y, p.r * (0.4 + k * 0.6), 0, 7); g.fill(); }
        return true;
      });
      g.globalAlpha = 1;
      if (parts.length) laco = requestAnimationFrame(quadro); else ultimo = 0;
    }
    function soltar(p) { parts.push(Object.assign({ t: 0, vx: 0, vy: 0, gr: 0, atr: 1, giro: 0, vg: 0, r: 3, vida: 0.8, tipo: 'ponto', cor: '#fff' }, p)); if (!laco && vivo) laco = requestAnimationFrame(quadro); }
    var qt = function (n) { return calmo ? Math.ceil(n / 3) : n; };

    /* ---------- sons (WebAudio, sem arquivo) ---------- */
    function audio() {
      if (ctx.somLigado && !ctx.somLigado()) return null;
      try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); return actx; } catch (e) { return null; }
    }
    function nota(a, f, ini, dur, tipo, vol, ate) {
      var o = a.createOscillator(), gg = a.createGain(), n = a.currentTime + ini;
      o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, n); if (ate) o.frequency.exponentialRampToValueAtTime(ate, n + dur);
      gg.gain.setValueAtTime(0.0001, n); gg.gain.exponentialRampToValueAtTime(vol || 0.2, n + 0.012); gg.gain.exponentialRampToValueAtTime(0.0001, n + dur);
      o.connect(gg); gg.connect(a.destination); o.start(n); o.stop(n + dur + 0.03);
    }
    function ruido(a, ini, dur, vol, corte) {
      var tam = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, tam, a.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < tam; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / tam, 2);
      var s = a.createBufferSource(), f = a.createBiquadFilter(), gg = a.createGain(), n = a.currentTime + ini;
      s.buffer = buf; f.type = 'lowpass'; f.frequency.value = corte || 1200; gg.gain.value = vol || 0.4;
      s.connect(f); f.connect(gg); gg.connect(a.destination); s.start(n);
    }
    function som(nome) {
      var a = audio(); if (!a) return;
      if (nome === 'passo') { nota(a, 140, 0, 0.12, 'triangle', 0.25, 70); ruido(a, 0, 0.08, 0.2, 800); }
      else if (nome === 'espada') { nota(a, 1800, 0, 0.18, 'square', 0.06, 1200); nota(a, 2600, 0.01, 0.25, 'sine', 0.08); ruido(a, 0, 0.06, 0.15, 6000); }
      else if (nome === 'boom') { ruido(a, 0, 0.6, 0.55, 500); nota(a, 90, 0, 0.45, 'sine', 0.35, 35); }
      else if (nome === 'tambor') { [0, 0.14, 0.28].forEach(function (t, i) { nota(a, i === 2 ? 120 : 160, t, 0.12, 'triangle', 0.22, 60); ruido(a, t, 0.05, 0.12, 1500); }); }
      else if (nome === 'corneta') { [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.36]].forEach(function (q) { nota(a, q[0], q[1], q[1] === 0.36 ? 0.4 : 0.13, 'sawtooth', 0.07); }); }
      else if (nome === 'vitoria') { [[392, 0], [523, 0.15], [659, 0.3], [784, 0.45], [659, 0.62], [784, 0.75], [1047, 0.9]].forEach(function (q, i) { nota(a, q[0], q[1], i === 6 ? 0.7 : 0.16, 'sawtooth', 0.07); nota(a, q[0] / 2, q[1], 0.16, 'triangle', 0.08); }); }
      else if (nome === 'derrota') { [[392, 0], [370, 0.3], [349, 0.6], [330, 0.9]].forEach(function (q, i) { nota(a, q[0], q[1], i === 3 ? 0.8 : 0.3, 'triangle', 0.12); }); }
      else if (nome === 'tregua') { [[523, 0], [659, 0.2], [523, 0.4]].forEach(function (q) { nota(a, q[0], q[1], 0.25, 'sine', 0.12); }); }
    }

    var fx = {
      explosao: function (x, y, cores, forca) {
        forca = forca || 1; cores = cores || ['#ffcf4a', '#ff7a2f', '#e23b3b'];
        var i, a, v;
        for (i = 0; i < qt(26 * forca); i++) { a = Math.random() * 6.283; v = (120 + Math.random() * 380) * forca; soltar({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, gr: 520, atr: 1.2, r: 2 + Math.random() * 4, vida: 0.5 + Math.random() * 0.6, tipo: Math.random() < 0.5 ? 'caco' : 'risco', vg: (Math.random() - 0.5) * 20, cor: cores[i % cores.length] }); }
        for (i = 0; i < qt(10 * forca); i++) { a = Math.random() * 6.283; v = 30 + Math.random() * 70; soltar({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, gr: -30, atr: 1.5, r: 10 + Math.random() * 14 * forca, vida: 0.8 + Math.random() * 0.7, tipo: 'fumaca', cor: Math.random() < 0.5 ? '#6b6157' : '#9a9088' }); }
        soltar({ x: x, y: y, r: 34 * forca, vida: 0.18, tipo: 'ponto', cor: '#fff7c2' });   // clarão
      },
      faiscas: function (x, y, cor) {
        for (var i = 0; i < qt(12); i++) { var a = Math.random() * 6.283, v = 60 + Math.random() * 160; soltar({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, gr: 300, r: 1.5 + Math.random() * 2, vida: 0.35 + Math.random() * 0.3, tipo: 'risco', cor: cor || '#ffe680' }); }
      },
      texto: function (x, y, txt, cor) {
        var el = document.createElement('div'); el.className = 'jt-bat-txt'; el.textContent = txt; el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.color = cor || '#ffcf4a';
        palco.appendChild(el); timers.push(setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 950));
      },
      faixa: function (txt, cor, ms) {
        var el = document.createElement('div'); el.className = 'jt-bat-faixa'; el.textContent = txt;
        el.style.background = 'linear-gradient(90deg, transparent, ' + (cor || '#e23b3b') + ' 12%, ' + (cor || '#e23b3b') + ' 88%, transparent)';
        if (ms) el.style.animationDuration = ms + 'ms';
        palco.appendChild(el); timers.push(setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, (ms || 1600) + 50));
      },
      tremer: function (el, forte) {
        if (calmo || !el) return;
        el.classList.remove('jt-bat-treme', 'forte'); void el.offsetWidth; el.classList.add('jt-bat-treme'); if (forte) el.classList.add('forte');
        timers.push(setTimeout(function () { el.classList.remove('jt-bat-treme', 'forte'); }, 600));
      },
      fogos: function (n) {
        var r = palco.getBoundingClientRect();
        for (var k = 0; k < (n || 5); k++) (function (k) {
          timers.push(setTimeout(function () {
            if (!vivo) return;
            var x = r.width * (0.15 + Math.random() * 0.7), y = r.height * (0.15 + Math.random() * 0.4), cor = ['#ffcf4a', '#ff4f6d', '#5fc6ff', '#7bdc5a', '#c49bff'][k % 5];
            for (var i = 0; i < qt(36); i++) { var a = i / 36 * 6.283, v = 120 + Math.random() * 110; soltar({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, gr: 120, atr: 1.4, r: 2.5, vida: 0.9 + Math.random() * 0.5, tipo: 'ponto', cor: cor }); }
            som('boom');
          }, k * 380));
        })(k);
      },
      som: som,
      parar: function () {
        vivo = false; if (laco) cancelAnimationFrame(laco);
        timers.forEach(clearTimeout); timers = []; parts = [];
        window.removeEventListener('resize', medir);
        if (cv.parentNode) cv.parentNode.removeChild(cv);
        if (actx && actx.close) { try { actx.close(); } catch (e) {} }
      }
    };
    return fx;
  }
  var B = { criar: criar };
  if (typeof window !== 'undefined') window.JogotecaBatalha = B;
  if (typeof module !== 'undefined' && module.exports) module.exports = B;
})();
