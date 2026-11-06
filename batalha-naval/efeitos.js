/* Batalha Naval — efeitos de tiro desenhados num <canvas> por cima da tela (só enquanto tem efeito acontecendo):
   o míssil voando até a casa, a coluna d'água com gotas e ondas (água), a explosão com clarão, bola de fogo, faíscas,
   destroços e fumaça (acerto), explosões em sequência e bolhas subindo (afundou), e o tremor leve da tela.
   Quem pede "menos movimento" no aparelho (prefers-reduced-motion) não vê nada disso: BNFx.ativo() = false e o jogo
   mostra só as marcas paradas. Desenhos prontos (sprites) são feitos uma vez; nada de gradiente novo a cada quadro.
   BNFx.tiro(de, para, ms, aoChegar) · agua(p, tam) · explosao(p, tam, forte) · bolhas(p, tam, ms) · tremer(el, forte)
   p = { x, y } em pixels da tela (clientX/clientY); tam = tamanho da casa em pixels. */
(function (raiz) {
  'use strict';
  var cv = null, cx = null, parts = [], rodando = false, dpr = 1, ultimo = 0, contador = 0;
  var mq = raiz.matchMedia ? raiz.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function ativo() { return !(mq && mq.matches); }

  function sprite(r, fn) { var c = document.createElement('canvas'); c.width = c.height = r * 2; fn(c.getContext('2d'), r); return c; }
  function radial(g, r, stops) { var gr = g.createRadialGradient(r, r, 0, r, r, r); stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); }); g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2); }
  var SP = null;
  function sprites() {
    if (SP) return SP;
    SP = {
      fogo: sprite(64, function (g, r) { radial(g, r, [[0, 'rgba(255,255,230,1)'], [0.25, 'rgba(255,220,90,.95)'], [0.5, 'rgba(255,128,30,.75)'], [0.75, 'rgba(200,40,10,.35)'], [1, 'rgba(120,20,0,0)']]); }),
      clarao: sprite(64, function (g, r) { radial(g, r, [[0, 'rgba(255,255,255,1)'], [0.3, 'rgba(255,240,180,.7)'], [1, 'rgba(255,200,80,0)']]); }),
      fumaca: sprite(48, function (g, r) { radial(g, r, [[0, 'rgba(70,70,74,.85)'], [0.55, 'rgba(60,60,66,.5)'], [1, 'rgba(40,40,46,0)']]); }),
      vapor: sprite(48, function (g, r) { radial(g, r, [[0, 'rgba(235,248,255,.9)'], [0.6, 'rgba(200,235,255,.45)'], [1, 'rgba(200,235,255,0)']]); }),
      brilho: sprite(32, function (g, r) { radial(g, r, [[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,200,120,.8)'], [1, 'rgba(255,120,40,0)']]); })
    };
    return SP;
  }

  function preparar() {
    if (cv) return true;
    if (!document.body) return false;
    cv = document.createElement('canvas'); cv.id = 'fx'; cv.className = 'fx'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv); cx = cv.getContext('2d');
    medir(); raiz.addEventListener('resize', medir);
    return true;
  }
  function medir() {
    if (!cv) return;
    dpr = Math.min(raiz.devicePixelRatio || 1, 2);
    cv.width = Math.round(raiz.innerWidth * dpr); cv.height = Math.round(raiz.innerHeight * dpr);
    cv.style.width = raiz.innerWidth + 'px'; cv.style.height = raiz.innerHeight + 'px';
  }
  function por(p) { parts.push(p); contador++; if (!rodando) { rodando = true; cv.hidden = false; ultimo = performance.now(); raiz.requestAnimationFrame(quadro); } }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function quadro(agora) {
    var dt = Math.min(0.05, (agora - ultimo) / 1000); ultimo = agora;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, cv.width, cv.height);
    var vivos = [];
    for (var i = 0; i < parts.length; i++) { var p = parts[i]; p.t += dt; if (p.t < 0) vivos.push(p); else if (p.t < p.vida) { desenhar(p, dt); vivos.push(p); } else if (p.fim) p.fim(); }
    // um efeito pode ter criado outros no fim (o míssil chegando): eles entram no próximo quadro
    parts = vivos.concat(parts.slice(i));
    if (parts.length) raiz.requestAnimationFrame(quadro);
    else { rodando = false; cx.clearRect(0, 0, cv.width, cv.height); cv.hidden = true; }
  }

  function desenhar(p, dt) {
    var k = p.t / p.vida, S = sprites();
    cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over';
    switch (p.tipo) {
      case 'missil': {
        // curva (arco para cima) da origem ao alvo; a cauda são as últimas posições
        var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        var x = (1 - e) * (1 - e) * p.x0 + 2 * (1 - e) * e * p.cx + e * e * p.x1, y = (1 - e) * (1 - e) * p.y0 + 2 * (1 - e) * e * p.cy + e * e * p.y1;
        p.rastro.push([x, y]); if (p.rastro.length > 16) p.rastro.shift();
        if (Math.random() < 0.7) parts.push({ tipo: 'fumaca', x: x, y: y, vx: rnd(-8, 8), vy: rnd(-8, 4), t: 0, vida: rnd(0.35, 0.6), r0: p.tam * 0.12, r1: p.tam * 0.35, a: 0.35 });
        cx.globalCompositeOperation = 'lighter';
        for (var j = 1; j < p.rastro.length; j++) {
          var q = j / p.rastro.length;
          cx.strokeStyle = 'rgba(255,' + Math.round(150 + 100 * q) + ',' + Math.round(60 * q) + ',' + (q * 0.9).toFixed(2) + ')';
          cx.lineWidth = Math.max(1, p.tam * 0.16 * q); cx.lineCap = 'round';
          cx.beginPath(); cx.moveTo(p.rastro[j - 1][0], p.rastro[j - 1][1]); cx.lineTo(p.rastro[j][0], p.rastro[j][1]); cx.stroke();
        }
        var rb = p.tam * 0.55; cx.drawImage(S.brilho, x - rb, y - rb, rb * 2, rb * 2);
        cx.globalCompositeOperation = 'source-over';
        cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(x, y, Math.max(1.5, p.tam * 0.07), 0, 7); cx.fill();
        break;
      }
      case 'fogo': case 'clarao': case 'fumaca': case 'vapor': {
        p.x += (p.vx || 0) * dt; p.y += (p.vy || 0) * dt;
        if (p.tipo === 'fumaca' || p.tipo === 'vapor') p.vy -= 6 * dt;
        var r = p.r0 + (p.r1 - p.r0) * (1 - Math.pow(1 - k, 2));
        var a = p.tipo === 'clarao' ? 1 - k : p.tipo === 'fogo' ? (k < 0.15 ? 1 : 1 - (k - 0.15) / 0.85) : (k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8);
        cx.globalAlpha = Math.max(0, a * (p.a || 1));
        if (p.tipo === 'fogo' || p.tipo === 'clarao') cx.globalCompositeOperation = 'lighter';
        cx.drawImage(S[p.tipo], p.x - r, p.y - r, r * 2, r * 2);
        break;
      }
      case 'faisca': {
        p.vy += 260 * dt; p.vx *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt;
        cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = 1 - k;
        cx.strokeStyle = k < 0.5 ? '#fff6c0' : '#ffb347'; cx.lineWidth = Math.max(1, p.tam * 0.045); cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04); cx.stroke();
        break;
      }
      case 'destroco': {
        p.vy += 340 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.giro += p.vg * dt;
        cx.globalAlpha = 1 - k * k; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.giro);
        cx.fillStyle = p.cor; cx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2); cx.restore();
        break;
      }
      case 'gota': {
        p.vy += 420 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        cx.globalAlpha = k < 0.75 ? 0.95 : (1 - k) / 0.25;
        cx.fillStyle = p.cor; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.fill();
        break;
      }
      case 'coluna': {
        // coluna d'água: sobe rápido e desaba
        var h = p.h * Math.sin(Math.min(1, k * 1.15) * Math.PI), w = p.w * (1 + k * 0.6);
        var gr = cx.createLinearGradient(0, p.y - h, 0, p.y);
        gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.25, 'rgba(240,250,255,.9)'); gr.addColorStop(1, 'rgba(180,225,255,.55)');
        cx.globalAlpha = 1 - k * 0.6; cx.fillStyle = gr;
        cx.beginPath(); cx.moveTo(p.x - w / 2, p.y); cx.quadraticCurveTo(p.x - w * 0.3, p.y - h * 0.6, p.x - w * 0.12, p.y - h);
        cx.quadraticCurveTo(p.x, p.y - h * 1.08, p.x + w * 0.12, p.y - h); cx.quadraticCurveTo(p.x + w * 0.3, p.y - h * 0.6, p.x + w / 2, p.y); cx.closePath(); cx.fill();
        break;
      }
      case 'onda': {
        var ro = p.r0 + (p.r1 - p.r0) * k;
        cx.globalAlpha = (1 - k) * 0.9; cx.strokeStyle = '#e6f7ff'; cx.lineWidth = Math.max(1, p.tam * 0.06 * (1 - k) + 1);
        cx.beginPath(); cx.ellipse(p.x, p.y, ro, ro * 0.8, 0, 0, 7); cx.stroke();
        break;
      }
      case 'bolha': {
        p.y += p.vy * dt; p.x += Math.sin(p.t * 9 + p.fase) * p.tam * 0.25 * dt;
        cx.globalAlpha = k < 0.8 ? 0.9 : (1 - k) / 0.2;
        cx.strokeStyle = 'rgba(220,245,255,.95)'; cx.lineWidth = 1.2; cx.fillStyle = 'rgba(180,230,255,.18)';
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.fill(); cx.stroke();
        cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(p.x - p.r * 0.35, p.y - p.r * 0.35, Math.max(0.8, p.r * 0.25), 0, 7); cx.fill();
        break;
      }
    }
  }

  // ---------- os efeitos ----------
  function tiro(de, para, ms, aoChegar) {
    if (!ativo() || !preparar()) { if (aoChegar) aoChegar(); return; }
    var dist = Math.hypot(para.x - de.x, para.y - de.y), tam = para.tam || 30;
    por({ tipo: 'missil', x0: de.x, y0: de.y, x1: para.x, y1: para.y, cx: (de.x + para.x) / 2 + (para.y - de.y) * 0.12, cy: Math.min(de.y, para.y) - dist * 0.28,
      t: 0, vida: (ms || 600) / 1000, tam: tam, rastro: [], fim: aoChegar });
  }
  function agua(p, tam) {
    if (!ativo() || !preparar()) return;
    por({ tipo: 'coluna', x: p.x, y: p.y + tam * 0.15, w: tam * 0.55, h: tam * 1.6, t: 0, vida: 0.75 });
    for (var i = 0; i < 26; i++) {
      var a = rnd(-Math.PI * 0.95, -Math.PI * 0.05), v = rnd(tam * 2, tam * 6.5);
      por({ tipo: 'gota', x: p.x + rnd(-tam * 0.15, tam * 0.15), y: p.y, vx: Math.cos(a) * v * 0.6, vy: Math.sin(a) * v, r: rnd(1.2, tam * 0.07 + 1.5), cor: i % 3 ? '#e9f8ff' : '#9fd8ff', t: 0, vida: rnd(0.5, 0.9) });
    }
    for (i = 0; i < 3; i++) por({ tipo: 'onda', x: p.x, y: p.y, r0: tam * 0.15, r1: tam * (0.9 + i * 0.45), tam: tam, t: -i * 0.14, vida: 0.9 + i * 0.1 });
    for (i = 0; i < 4; i++) por({ tipo: 'vapor', x: p.x + rnd(-tam * 0.3, tam * 0.3), y: p.y - rnd(0, tam * 0.5), vx: rnd(-10, 10), vy: rnd(-25, -8), r0: tam * 0.2, r1: tam * 0.6, a: 0.6, t: 0, vida: rnd(0.6, 1) });
  }
  function explosao(p, tam, forte) {
    if (!ativo() || !preparar()) return;
    var k = forte ? 1.35 : 1, i;
    por({ tipo: 'clarao', x: p.x, y: p.y, r0: tam * 0.4, r1: tam * 2.2 * k, t: 0, vida: 0.28 });
    for (i = 0; i < 9; i++) por({ tipo: 'fogo', x: p.x + rnd(-tam * 0.25, tam * 0.25), y: p.y + rnd(-tam * 0.25, tam * 0.2), vx: rnd(-tam, tam) * 0.8, vy: rnd(-tam * 1.4, -tam * 0.1), r0: tam * 0.2, r1: tam * rnd(0.55, 0.95) * k, t: -rnd(0, 0.12), vida: rnd(0.45, 0.8) });
    for (i = 0; i < 22 * k; i++) { var a = rnd(0, Math.PI * 2), v = rnd(tam * 3, tam * 8) * k; por({ tipo: 'faisca', x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - tam * 2, tam: tam, t: 0, vida: rnd(0.35, 0.75) }); }
    for (i = 0; i < 6; i++) { var b = rnd(-Math.PI, 0), w = rnd(tam * 2, tam * 5); por({ tipo: 'destroco', x: p.x, y: p.y, vx: Math.cos(b) * w, vy: Math.sin(b) * w, r: rnd(1.2, tam * 0.08 + 1), giro: 0, vg: rnd(-12, 12), cor: i % 2 ? '#2b2f33' : '#5b636b', t: 0, vida: rnd(0.6, 1) }); }
    for (i = 0; i < 7; i++) por({ tipo: 'fumaca', x: p.x + rnd(-tam * 0.3, tam * 0.3), y: p.y + rnd(-tam * 0.2, tam * 0.2), vx: rnd(-12, 12), vy: rnd(-40, -15), r0: tam * 0.25, r1: tam * rnd(0.7, 1.2) * k, a: 0.75, t: -rnd(0.1, 0.3), vida: rnd(1, 1.6) });
  }
  function bolhas(p, tam, ms) {
    if (!ativo() || !preparar()) return;
    for (var i = 0; i < 9; i++) por({ tipo: 'bolha', x: p.x + rnd(-tam * 0.4, tam * 0.4), y: p.y + rnd(-tam * 0.2, tam * 0.3), vy: -rnd(tam * 0.6, tam * 1.4), r: rnd(1.5, tam * 0.12 + 1.5), fase: rnd(0, 6), tam: tam, t: -rnd(0, (ms || 1500) / 1000 * 0.7), vida: rnd(0.7, 1.2) });
  }
  function tremer(el, forte) {
    if (!ativo() || !el) return;
    var c = forte ? 'treme-forte' : 'treme';
    el.classList.remove('treme', 'treme-forte'); void el.offsetWidth; el.classList.add(c);
    setTimeout(function () { el.classList.remove(c); }, forte ? 700 : 420);
  }

  raiz.BNFx = { ativo: ativo, tiro: tiro, agua: agua, explosao: explosao, bolhas: bolhas, tremer: tremer,
    // para os testes: quantos efeitos já foram criados e quantos estão vivos agora
    contagem: function () { return { criados: contador, vivos: parts.length }; } };
})(typeof window !== 'undefined' ? window : this);
