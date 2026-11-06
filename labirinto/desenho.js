/* Labirinto — desenho no canvas: chão e paredes em 3D (as paredes têm altura e se inclinam como vistas por uma câmera
   que fica em cima do meio da tela), o cachorrinho, os itens da missão (osso, chave, estrela, tesouro), a porta da
   saída, a bandeira e os confetes. Tudo feito em código, nenhuma imagem.

   Câmera: { cx, cy, z, W, H } — o ponto (cx, cy) do mundo fica no meio da tela; z = pixels por casa. */
(function (raiz) {
  'use strict';

  var TEMAS = {
    quadrado: { nome: 'jardim', fundo: ['#0f3b2c', '#06261b'], chao: '#f4e6bd', chao2: '#ead59b', topo: '#67d86f', lado: '#2e8a47', risco: '#ff4fa3' },
    redondo: { nome: 'espaço', fundo: ['#251c66', '#0d0a33'], chao: '#3a2f8f', chao2: '#4a3da6', topo: '#ff8ae0', lado: '#a2378b', risco: '#7ef9ff' },
    colmeia: { nome: 'colmeia', fundo: ['#4a2a05', '#2a1702'], chao: '#ffeab0', chao2: '#ffd978', topo: '#ffb703', lado: '#a86200', risco: '#7b5cff' }
  };

  function tela(cam, x, y) { return [(x - cam.cx) * cam.z + cam.W / 2, (y - cam.cy) * cam.z + cam.H / 2]; }
  function mundoParaTela(ctx, cam, dpr) { ctx.setTransform(dpr * cam.z, 0, 0, dpr * cam.z, dpr * (cam.W / 2 - cam.cx * cam.z), dpr * (cam.H / 2 - cam.cy * cam.z)); }

  // curvas do redondo: para DESENHAR basta um ponto a cada ~6° (a colisão continua com os pedacinhos finos do gerador)
  function simplificar(pts) {
    if (pts.length <= 2) return pts;
    var comp = 0;
    for (var k = 1; k < pts.length; k++) comp += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
    var r = Math.hypot(pts[0][0], pts[0][1]) || 1, n = Math.max(1, Math.min(pts.length - 1, Math.ceil(comp / r / 0.1))), out = [];
    for (var i = 0; i <= n; i++) out.push(pts[Math.round(i * (pts.length - 1) / n)]);
    return out;
  }
  // dados que não mudam durante a partida: paredes com caixinha (para pular as que estão fora da tela) e distância do meio
  function preparar(L) {
    var l = L.limites, mx = (l.x0 + l.x1) / 2, my = (l.y0 + l.y1) / 2, dmax = Math.hypot(l.x1 - mx, l.y1 - my) || 1;
    L._paredes = [];
    L.arestas.forEach(function (e, i) {
      if (e.aberta || i === L.bordaInicio || i === L.bordaSaida) return;
      var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      e.pts.forEach(function (p) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
      L._paredes.push({ pts: simplificar(e.pts), x0: x0, y0: y0, x1: x1, y1: y1, d: Math.hypot((x0 + x1) / 2 - mx, (y0 + y1) / 2 - my) / dmax });
    });
  }

  /* chão + paredes. op.altura (0..1): paredes subindo na abertura; op.revela (0..1): de dentro para fora */
  function chao(ctx, L, cam, dpr, op) {
    op = op || {};
    var T = TEMAS[L.forma], W = cam.W, H = cam.H, alt = op.altura == null ? 1 : op.altura, rev = op.revela == null ? 1 : op.revela;
    if (!L._paredes) preparar(L);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);   // o fundo (T.fundo) fica no CSS do palco: na abertura em 3D só o labirinto voa
    var vx0 = cam.cx - W / 2 / cam.z - 1, vx1 = cam.cx + W / 2 / cam.z + 1, vy0 = cam.cy - H / 2 / cam.z - 1, vy1 = cam.cy + H / 2 / cam.z + 1;

    // chão (casas alternadas, para a criança enxergar as casas)
    mundoParaTela(ctx, cam, dpr);
    ctx.fillStyle = T.chao;
    var i, c;
    if (L.forma === 'quadrado') {
      ctx.fillRect(0, 0, L.cols, L.linhas);
      ctx.fillStyle = T.chao2; ctx.beginPath();
      var c0 = Math.max(0, Math.floor(vx0)), c1 = Math.min(L.cols - 1, Math.ceil(vx1)), r0 = Math.max(0, Math.floor(vy0)), r1 = Math.min(L.linhas - 1, Math.ceil(vy1));
      for (var y = r0; y <= r1; y++) for (var x = c0; x <= c1; x++) if ((x + y) % 2) ctx.rect(x, y, 1, 1);
      ctx.fill();
    } else if (L.forma === 'redondo') {
      ctx.beginPath(); ctx.arc(0, 0, L.aneis, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = T.chao2; ctx.beginPath();
      for (i = 1; i < L.aneis; i += 2) { ctx.moveTo(i + 1, 0); ctx.arc(0, 0, i + 1, 0, Math.PI * 2); ctx.moveTo(i, 0); ctx.arc(0, 0, i, 0, Math.PI * 2, true); }
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill();
    } else {
      var s = L.lado * 1.02;
      [T.chao, T.chao2].forEach(function (cor, k) {
        ctx.fillStyle = cor; ctx.beginPath();
        for (i = 0; i < L.celulas.length; i++) {
          c = L.celulas[i];
          if (((c.q - c.r) % 3 + 3) % 3 === 0 ? k !== 1 : k !== 0) continue;
          if (c.x < vx0 || c.x > vx1 || c.y < vy0 || c.y > vy1) continue;
          for (var v = 0; v < 6; v++) { var a = Math.PI / 6 + v * Math.PI / 3, px = c.x + s * Math.cos(a), py = c.y + s * Math.sin(a); if (v) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
          ctx.closePath();
        }
        ctx.fill();
      });
    }

    // paredes em 3D: base no chão, topo levantado e puxado para fora do meio da tela (perspectiva)
    var f = 0.3 * cam.z / (1.3 * Math.max(W, H)) * alt, sobe = 0.14 * cam.z * alt, lw = Math.max(2, 0.14 * cam.z), ox = W / 2, oy = H / 2;
    var vis = [];
    for (i = 0; i < L._paredes.length; i++) {
      var p = L._paredes[i];
      if (p.x1 < vx0 || p.x0 > vx1 || p.y1 < vy0 || p.y0 > vy1) continue;
      var h = rev >= 1 ? 1 : Math.max(0, Math.min(1, (rev * 1.5 - p.d * 0.5) / 0.6));   // de dentro para fora
      if (h <= 0) continue;
      vis.push([p, h]);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    function base(pt) { return tela(cam, pt[0], pt[1]); }
    function topo(b, h) { return [b[0] + (b[0] - ox) * f * h, b[1] + (b[1] - oy) * f * h - sobe * h]; }
    // lados
    ctx.fillStyle = T.lado; ctx.strokeStyle = T.lado; ctx.lineWidth = lw;
    ctx.beginPath();
    vis.forEach(function (ph) {
      var pts = ph[0].pts, h = ph[1];
      for (var k = 0; k + 1 < pts.length; k++) {
        var a = base(pts[k]), b = base(pts[k + 1]), ta = topo(a, h), tb = topo(b, h);
        var area = (b[0] - a[0]) * (tb[1] - a[1]) - (b[1] - a[1]) * (tb[0] - a[0]);   // mesmo sentido em todos (sem buracos)
        if (area >= 0) { ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(tb[0], tb[1]); ctx.lineTo(ta[0], ta[1]); }
        else { ctx.moveTo(a[0], a[1]); ctx.lineTo(ta[0], ta[1]); ctx.lineTo(tb[0], tb[1]); ctx.lineTo(b[0], b[1]); }
        ctx.closePath();
      }
    });
    ctx.fill();
    ctx.beginPath();
    vis.forEach(function (ph) { var pts = ph[0].pts; ctx.moveTo.apply(ctx, base(pts[0])); for (var k = 1; k < pts.length; k++) ctx.lineTo.apply(ctx, base(pts[k])); });
    ctx.stroke();
    // topos
    ctx.strokeStyle = T.topo; ctx.lineWidth = lw;
    ctx.beginPath();
    vis.forEach(function (ph) { var pts = ph[0].pts, h = ph[1]; ctx.moveTo.apply(ctx, topo(base(pts[0]), h)); for (var k = 1; k < pts.length; k++) ctx.lineTo.apply(ctx, topo(base(pts[k]), h)); });
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = Math.max(1, lw * 0.3);
    ctx.stroke();
  }

  /* ---------- cachorrinho (unidade: 1 = altura dele) ---------- */
  function cachorro(ctx, x, y, tam, e) {
    e = e || {};
    var t = e.t || 0, dir = e.dir < 0 ? -1 : 1, anda = e.andando ? 1 : 0, pulo = e.pulo || 0;
    ctx.save();
    ctx.translate(x, y);
    // sombra
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(0, tam * 0.36, tam * (0.36 - pulo * 0.12), tam * 0.09, 0, 0, Math.PI * 2); ctx.fill();
    ctx.translate(0, -pulo * tam * 0.55 - anda * Math.abs(Math.sin(t * 14)) * tam * 0.05);
    ctx.scale(tam * dir, tam);
    var pelo = '#e9b97a', escuro = '#8a5426', claro = '#fff1dc';
    ctx.lineCap = 'round';
    // rabo abanando
    var ab = Math.sin(t * (e.feliz ? 22 : 10)) * 0.5;
    ctx.strokeStyle = pelo; ctx.lineWidth = 0.09;
    ctx.beginPath(); ctx.moveTo(-0.26, 0.08); ctx.quadraticCurveTo(-0.46, -0.02 + ab * 0.1, -0.42 + ab * 0.12, -0.2); ctx.stroke();
    // patinhas
    ctx.fillStyle = escuro;
    var pa = anda ? Math.sin(t * 14) * 0.05 : 0;
    [[-0.17, pa], [-0.05, -pa], [0.08, pa], [0.2, -pa]].forEach(function (p) { ctx.beginPath(); ctx.ellipse(p[0], 0.3 + p[1], 0.055, 0.06, 0, 0, Math.PI * 2); ctx.fill(); });
    // corpo
    ctx.fillStyle = pelo; ctx.beginPath(); ctx.ellipse(0, 0.14, 0.3, 0.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = claro; ctx.beginPath(); ctx.ellipse(0.08, 0.2, 0.15, 0.1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = escuro; ctx.beginPath(); ctx.ellipse(-0.12, 0.06, 0.09, 0.07, 0.4, 0, Math.PI * 2); ctx.fill();
    // coleira
    ctx.strokeStyle = '#ff4f7b'; ctx.lineWidth = 0.05; ctx.beginPath(); ctx.arc(0.13, -0.08, 0.17, 0.6, 2.2); ctx.stroke();
    ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(0.1, 0.09, 0.035, 0, Math.PI * 2); ctx.fill();
    // cabeça
    ctx.save(); ctx.translate(0.14, -0.2); ctx.rotate(Math.sin(t * 3) * 0.06);
    var orelha = e.feliz ? Math.sin(t * 18) * 0.25 : Math.sin(t * 2) * 0.08;
    ctx.fillStyle = escuro;
    ctx.save(); ctx.translate(-0.2, -0.06); ctx.rotate(0.35 + orelha); ctx.beginPath(); ctx.ellipse(0, 0.1, 0.08, 0.16, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.fillStyle = pelo; ctx.beginPath(); ctx.arc(0, 0, 0.24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = claro; ctx.beginPath(); ctx.ellipse(0.06, 0.09, 0.14, 0.1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = escuro;
    ctx.save(); ctx.translate(0.19, -0.07); ctx.rotate(-0.35 - orelha); ctx.beginPath(); ctx.ellipse(0, 0.1, 0.08, 0.16, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // olhos (piscam de vez em quando)
    var pisca = (t % 3.2) < 0.12 ? 0.15 : 1;
    ctx.fillStyle = '#1b1446';
    [[-0.04, -0.04], [0.12, -0.04]].forEach(function (o) { ctx.beginPath(); ctx.ellipse(o[0], o[1], 0.042, 0.05 * pisca, 0, 0, Math.PI * 2); ctx.fill(); });
    if (pisca === 1) { ctx.fillStyle = '#fff'; [[-0.03, -0.06], [0.13, -0.06]].forEach(function (o) { ctx.beginPath(); ctx.arc(o[0], o[1], 0.014, 0, Math.PI * 2); ctx.fill(); }); }
    // bochechas
    ctx.fillStyle = 'rgba(255,110,140,.45)'; [[-0.12, 0.06], [0.2, 0.06]].forEach(function (o) { ctx.beginPath(); ctx.arc(o[0], o[1], 0.04, 0, Math.PI * 2); ctx.fill(); });
    // focinho, boca e linguinha
    ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.ellipse(0.06, 0.05, 0.045, 0.032, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 0.02;
    ctx.beginPath(); ctx.moveTo(0.06, 0.08); ctx.quadraticCurveTo(0.02, 0.13, -0.01, 0.1); ctx.moveTo(0.06, 0.08); ctx.quadraticCurveTo(0.1, 0.13, 0.13, 0.1); ctx.stroke();
    if (e.feliz || anda) { ctx.fillStyle = '#ff6f91'; ctx.beginPath(); ctx.ellipse(0.06, 0.15, 0.035, 0.05 + (e.feliz ? 0.015 * Math.sin(t * 20) : 0), 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.restore();
  }

  /* ---------- itens da missão (unidade: 1 = tamanho do item) ---------- */
  var ITENS = [
    { pt: 'o osso', en: 'the bone', em: '🦴' },
    { pt: 'a chave', en: 'the key', em: '🔑' },
    { pt: 'a estrela', en: 'the star', em: '⭐' },
    { pt: 'o tesouro', en: 'the treasure', em: '💎' }
  ];
  function estrela(ctx, x, y, r, pontas) {
    ctx.beginPath();
    for (var k = 0; k < (pontas || 5) * 2; k++) { var a = -Math.PI / 2 + k * Math.PI / (pontas || 5), rr = k % 2 ? r * 0.45 : r; ctx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); }
    ctx.closePath();
  }
  function item(ctx, tipo, x, y, tam, t) {
    ctx.save(); ctx.translate(x, y + Math.sin(t * 3) * tam * 0.06); ctx.scale(tam, tam);
    var g = ctx.createRadialGradient(0, 0, 0.05, 0, 0, 0.7);
    g.addColorStop(0, 'rgba(255,240,150,.85)'); g.addColorStop(1, 'rgba(255,240,150,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 0.7 + Math.sin(t * 4) * 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 0.05; ctx.strokeStyle = 'rgba(60,30,0,.55)'; ctx.lineJoin = 'round';
    if (tipo === 0) {   // osso
      ctx.rotate(-0.5); ctx.fillStyle = '#fffaf0';
      ctx.beginPath(); ctx.rect(-0.26, -0.08, 0.52, 0.16);
      [[-0.28, -0.1], [-0.28, 0.1], [0.28, -0.1], [0.28, 0.1]].forEach(function (p) { ctx.moveTo(p[0] + 0.12, p[1]); ctx.arc(p[0], p[1], 0.12, 0, Math.PI * 2); });
      ctx.fill(); ctx.stroke(); ctx.fill();
    } else if (tipo === 1) {   // chave
      ctx.rotate(-0.6); ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#9a6a00';
      ctx.beginPath(); ctx.arc(-0.22, 0, 0.16, 0, Math.PI * 2); ctx.moveTo(-0.17, 0); ctx.arc(-0.22, 0, 0.07, 0, Math.PI * 2, true);
      ctx.rect(-0.06, -0.05, 0.4, 0.1); ctx.rect(0.18, 0.05, 0.06, 0.1); ctx.rect(0.28, 0.05, 0.06, 0.13);
      ctx.fill('evenodd'); ctx.stroke();
    } else if (tipo === 2) {   // estrela
      ctx.rotate(Math.sin(t * 2) * 0.2); ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#c77d00';
      estrela(ctx, 0, 0, 0.4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1b1446'; ctx.beginPath(); ctx.arc(-0.08, -0.02, 0.035, 0, Math.PI * 2); ctx.arc(0.08, -0.02, 0.035, 0, Math.PI * 2); ctx.fill();
    } else {   // baú do tesouro
      ctx.fillStyle = '#a0522d'; ctx.strokeStyle = '#4a2208';
      ctx.beginPath(); ctx.rect(-0.32, -0.04, 0.64, 0.3); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-0.32, -0.04); ctx.quadraticCurveTo(0, -0.38, 0.32, -0.04); ctx.closePath(); ctx.fillStyle = '#c0713a'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(-0.05, -0.12, 0.1, 0.38); ctx.fillRect(-0.32, 0.06, 0.64, 0.06);
      ctx.fillStyle = '#7ef9ff'; estrela(ctx, 0.16, -0.22, 0.08, 4); ctx.fill();
    }
    ctx.restore();
  }

  function cadeado(ctx, x, y, tam, balanco) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(balanco || 0); ctx.scale(tam, tam);
    ctx.strokeStyle = '#d8dbe8'; ctx.lineWidth = 0.1; ctx.beginPath(); ctx.arc(0, -0.08, 0.16, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#ffb703'; ctx.strokeStyle = '#7a4a00'; ctx.lineWidth = 0.04;
    ctx.beginPath(); ctx.rect(-0.25, -0.08, 0.5, 0.38); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#4a2a00'; ctx.beginPath(); ctx.arc(0, 0.08, 0.06, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-0.025, 0.08, 0.05, 0.12);
    ctx.restore();
  }

  function bandeira(ctx, x, y, tam, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(tam, tam);
    ctx.strokeStyle = '#5b4a3a'; ctx.lineWidth = 0.06; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-0.2, 0.35); ctx.lineTo(-0.2, -0.4); ctx.stroke();
    var o = Math.sin(t * 5) * 0.03;
    for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) {
      ctx.fillStyle = (i + j) % 2 ? '#1b1446' : '#ffffff';
      ctx.fillRect(-0.18 + i * 0.12, -0.4 + j * 0.1 + (i % 2 ? o : -o), 0.125, 0.105);
    }
    ctx.restore();
  }

  /* ---------- confetes e brilhos (coordenadas da tela) ---------- */
  var CORES = ['#ff4fa3', '#ffd166', '#7ef9ff', '#c6ff3d', '#ff9f1c', '#b388ff', '#ffffff'];
  function Particulas() { this.lista = []; }
  Particulas.prototype.add = function (p) { if (this.lista.length < 500) this.lista.push(p); };
  Particulas.prototype.explosao = function (x, y, n, forca, tipo) {
    for (var k = 0; k < n; k++) {
      var a = Math.random() * Math.PI * 2, v = forca * (0.4 + Math.random() * 0.8);
      this.add({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - forca * 0.3, g: tipo === 'brilho' ? 60 : 380, vida: 0, max: 0.8 + Math.random() * 0.9,
        cor: CORES[k % CORES.length], tipo: tipo || (k % 3 ? 'confete' : 'brilho'), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14, tam: 4 + Math.random() * 6 });
    }
  };
  Particulas.prototype.chuva = function (W, n) {
    for (var k = 0; k < n; k++) this.add({ x: Math.random() * W, y: -20 - Math.random() * 200, vx: (Math.random() - 0.5) * 60, vy: 80 + Math.random() * 120, g: 60, vida: 0,
      max: 3 + Math.random() * 2, cor: CORES[k % CORES.length], tipo: 'confete', rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10, tam: 6 + Math.random() * 6 });
  };
  Particulas.prototype.passo = function (dt) {
    var l = this.lista;
    for (var k = l.length - 1; k >= 0; k--) {
      var p = l[k]; p.vida += dt;
      if (p.vida >= p.max) { l.splice(k, 1); continue; }
      p.vy += p.g * dt; p.vx *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    }
  };
  Particulas.prototype.desenhar = function (ctx) {
    this.lista.forEach(function (p) {
      var a = 1 - Math.max(0, (p.vida - p.max * 0.6) / (p.max * 0.4));
      ctx.globalAlpha = a; ctx.fillStyle = p.cor;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      if (p.tipo === 'confete') ctx.fillRect(-p.tam / 2, -p.tam / 4, p.tam, p.tam / 2);
      else { estrela(ctx, 0, 0, p.tam * 0.9, 4); ctx.fill(); }
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  };

  var D = { TEMAS: TEMAS, ITENS: ITENS, tela: tela, mundoParaTela: mundoParaTela, preparar: preparar, chao: chao, cachorro: cachorro, item: item,
    cadeado: cadeado, bandeira: bandeira, estrela: estrela, Particulas: Particulas };
  if (typeof module !== 'undefined' && module.exports) module.exports = D; else raiz.Desenho = D;
})(typeof self !== 'undefined' ? self : this);
