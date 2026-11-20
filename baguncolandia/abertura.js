/* Bagunçolândia — abertura: atrás do menu inicial, uma piscina de bolas gigantes e brilhantes com luz neon
   (inspirada no vídeo que o dono mandou, 20/Nov/2026: bolas rosa, azul, roxo, vermelho, dourado e prateado, algumas com
   espiral, luz roxa/azul/rosa e a criança mergulhando). Tudo desenhado aqui; nenhuma foto ou vídeo entra no site.
   - As bolas balançam de leve; onde o dedo encosta, elas pulam e se afastam.
   - De tempos em tempos o boneco que a criança montou sai do meio das bolas, sorrindo de braços para cima, e afunda de novo.
   - Só desenha enquanto a tela inicial (#inicio) está aberta e a página está à vista. Com "reduzir movimento", fica parada. */
(function () {
  'use strict';
  var cv = document.createElement('canvas'); cv.id = 'aberturaFundo'; cv.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(cv, document.body.firstChild);
  var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, bolas = [], sprites = {}, t0 = 0, rodando = false, ultimo = 0;
  var parado = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var CORES = [['#ff3d8b', 0], ['#2f6bff', 0], ['#9b4dff', 0], ['#ff3b3b', 0], ['#ff8fd1', 0], ['#3ec6ff', 0], ['#e9e4ff', 1], ['#e2b04a', 2], ['#c9cdd8', 2], ['#18b88a', 0]];   // [cor, tipo: 0 lisa, 1 com espiral, 2 metálica]
  var mergulho = { fase: 'espera', t: 0, x: 0, prox: 2.5 };
  function aleat(a, b) { return a + Math.random() * (b - a); }
  function tela() { return document.querySelector('#inicio.ativa'); }

  /* cada bola vira uma figurinha pronta (desenhada uma vez só): brilho, sombra da borda e reflexo colorido do neon */
  function sprite(i, r) {
    var k = i + ':' + r; if (sprites[k]) return sprites[k];
    var c = document.createElement('canvas'), s = Math.ceil(r * 2 * dpr) + 4; c.width = c.height = s;
    var g = c.getContext('2d'), m = s / 2, R = r * dpr, cor = CORES[i][0], tipo = CORES[i][1];
    var gr = g.createRadialGradient(m - R * 0.35, m - R * 0.4, R * 0.1, m, m, R);
    gr.addColorStop(0, tipo === 2 ? '#fffbe8' : 'rgba(255,255,255,.95)'); gr.addColorStop(0.18, cor); gr.addColorStop(0.75, cor); gr.addColorStop(1, 'rgba(10,4,40,.9)');
    g.fillStyle = gr; g.beginPath(); g.arc(m, m, R, 0, 6.2832); g.fill();
    if (tipo === 1) { g.strokeStyle = 'rgba(60,20,40,.55)'; g.lineWidth = Math.max(1, R * 0.05); g.beginPath(); for (var a = 0; a < 15; a += 0.2) { var rr = R * 0.05 * a; g.lineTo(m + R * 0.15 + Math.cos(a) * rr * 0.5, m + R * 0.1 + Math.sin(a) * rr * 0.5); } g.stroke(); }   // a espiral das bolas do vídeo
    var luz = g.createLinearGradient(0, 0, s, s); luz.addColorStop(0, 'rgba(120,90,255,0)'); luz.addColorStop(1, 'rgba(120,60,255,.35)');   // reflexo do neon roxo embaixo
    g.fillStyle = luz; g.beginPath(); g.arc(m, m, R, 0, 6.2832); g.fill();
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(m - R * 0.38, m - R * 0.45, R * 0.22, R * 0.13, -0.6, 0, 6.2832); g.fill();   // brilho de plástico
    return (sprites[k] = c);
  }
  function montar() {
    dpr = Math.min(1.5, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    sprites = {}; bolas = [];
    var topo = H * 0.42, base = Math.max(46, Math.min(W, H) * 0.085);   // a piscina ocupa a parte de baixo; as bolas de trás são menores
    for (var y = topo; y < H + base; y += base * 0.55) {
      var prof = (y - topo) / (H - topo), r = base * (0.55 + 0.6 * prof);
      for (var x = -r + aleat(0, r); x < W + r; x += r * aleat(1.45, 1.8)) bolas.push({ x: x, y: y + aleat(-r * 0.2, r * 0.2), r: Math.round(r), cor: Math.floor(Math.random() * CORES.length), fase: aleat(0, 6.28), dy: 0, vy: 0, dx: 0, vx: 0 });
    }
    bolas.sort(function (a, b) { return a.y - b.y; });   // de trás para a frente
  }
  /* o boneco da criança (o que ela montou no jogo; senão, o de sempre) */
  function boneco() { try { var l = JSON.parse(localStorage.getItem('bagunca:bonecos') || '[]'); return l[0] || {}; } catch (e) { return {}; } }
  function empurrar(px, py, forca) {
    bolas.forEach(function (b) { var dx = b.x - px, dy = b.y - py, d = Math.hypot(dx, dy) || 1; if (d < forca) { var f = (1 - d / forca); b.vy -= 520 * f; b.vx += dx / d * 260 * f; } });
  }
  function desenhar(ts) {
    var t = ts / 1000, dt = Math.min(0.05, (ts - (ultimo || ts)) / 1000); ultimo = ts;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    // luz neon que muda de cor devagar (roxo → azul → rosa) e reflexos dos espelhos
    var h = parado ? 270 : 250 + 40 * Math.sin(t * 0.25);
    var luz = ctx.createRadialGradient(W * 0.5, H * 0.3, 10, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
    luz.addColorStop(0, 'hsla(' + h + ',90%,45%,.55)'); luz.addColorStop(1, 'hsla(' + (h + 40) + ',80%,8%,0)');
    ctx.fillStyle = luz; ctx.fillRect(0, 0, W, H);
    for (var e = 0; e < 3; e++) { var ex = W * (0.18 + e * 0.32) + Math.sin(t * 0.3 + e) * 8, ge = ctx.createLinearGradient(ex - 14, 0, ex + 14, 0); ge.addColorStop(0, 'rgba(255,255,255,0)'); ge.addColorStop(0.5, 'rgba(220,210,255,.10)'); ge.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = ge; ctx.fillRect(ex - 14, 0, 28, H * 0.6); }
    // mergulho do boneco: sobe do meio das bolas, comemora e afunda
    var M = mergulho, alto = Math.min(W, H) * 0.5, baseY = H * 1.02, sobe = 0;
    if (!parado) {
      M.t += dt;
      if (M.fase === 'espera' && M.t > M.prox) { M.fase = 'sobe'; M.t = 0; M.x = aleat(W * 0.15, W * 0.85); empurrar(M.x, baseY - alto * 0.3, alto * 0.7); }
      else if (M.fase === 'sobe' && M.t > 0.5) { M.fase = 'festa'; M.t = 0; }
      else if (M.fase === 'festa' && M.t > 1.6) { M.fase = 'desce'; M.t = 0; }
      else if (M.fase === 'desce' && M.t > 0.5) { M.fase = 'espera'; M.t = 0; M.prox = aleat(5, 9); empurrar(M.x, baseY - alto * 0.2, alto * 0.5); }
      sobe = M.fase === 'sobe' ? M.t / 0.5 : M.fase === 'festa' ? 1 : M.fase === 'desce' ? 1 - M.t / 0.5 : 0;
      sobe = 1 - Math.pow(1 - Math.max(0, Math.min(1, sobe)), 3);
    }
    var bonecoY = baseY + alto * 0.55 * (1 - sobe), noMeio = false;
    for (var i = 0; i < bolas.length; i++) {
      var b = bolas[i];
      if (!noMeio && sobe > 0 && b.y > H * 0.95 && window.Boneco) { noMeio = true;   // o boneco fica entre as bolas de trás e as da frente
        ctx.save(); ctx.translate(M.x, bonecoY + Math.sin(t * 9) * (M.fase === 'festa' ? alto * 0.02 : 0)); Boneco.corpoEmPe(ctx, boneco(), alto, { pose: 'festa', bE: 1, bD: 1, balanco: 0, ts: ts }); ctx.restore(); }
      if (!parado) {   // mola: volta para o lugar
        b.vy += (-b.dy * 60 - b.vy * 7) * dt; b.vx += (-b.dx * 60 - b.vx * 7) * dt; b.dy += b.vy * dt; b.dx += b.vx * dt;
      }
      var bob = parado ? 0 : Math.sin(t * 1.3 + b.fase) * b.r * 0.06;
      ctx.drawImage(sprite(b.cor, b.r), b.x + b.dx - b.r - 2 / dpr, b.y + b.dy + bob - b.r - 2 / dpr, b.r * 2 + 4 / dpr, b.r * 2 + 4 / dpr);
    }
  }
  function quadro(ts) {
    if (!tela() || document.hidden) { rodando = false; cv.style.display = 'none'; return; }
    desenhar(ts); if (!parado) requestAnimationFrame(quadro); else rodando = false;
  }
  function ligar() {
    if (rodando || !tela() || document.hidden) return;
    cv.style.display = ''; rodando = true; ultimo = 0; requestAnimationFrame(quadro);
  }
  montar();
  addEventListener('resize', function () { montar(); if (parado) { rodando = false; ligar(); } });
  document.addEventListener('visibilitychange', ligar);
  new MutationObserver(ligar).observe(document.getElementById('inicio'), { attributes: true, attributeFilter: ['class'] });   // voltou para a tela inicial: liga de novo
  document.addEventListener('pointerdown', function (e) { if (tela() && !parado) empurrar(e.clientX, e.clientY, Math.min(W, H) * 0.22); }, { passive: true });   // o dedo faz as bolas pularem
  ligar();
})();
