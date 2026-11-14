/* Vruuum! — a garagem: 24 veículos, todos desenhados em código. Desde a 1.15.0 os carros, a moto e o trenó são 3D
   (modelos3d.js: na curva aparece a lateral, no morro o teto); os desenhos abaixo são os que ainda são de costas.
   Terra: Clássico, GT (traseira redonda), Superesportivo (largo, aerofólio grande), Kart, Monstrão,
   Moto, Skate (animado: a perna empurra o chão, em quadros), Cavalo (galopando, em 3D: cavalo.js). Céu: Aviãozinho, Jato, Helicóptero — esses voam (desenho.js troca a estrada por uma rota no
   ar e os obstáculos por pássaros, nuvens de tempestade, anéis e correntes de ar).
   Estilos inspirados em carros esportivos famosos, mas sem marca, logotipo ou nome de fabricante.
   vel e curva: pequenas diferenças (até ~10%) para cada um ter seu jeito sem desequilibrar a corrida. */
(function (raiz) {
  'use strict';
  var S = raiz.VruuumSprites || { util: {} }, U = S.util, EMOJI = S.EMOJI, FONTE = S.FONTE;   // no Node (testes) só a lista importa
  var MOD = raiz.VruuumModelos || (typeof require === 'function' ? require('./modelos3d.js') : null);
  // veículo em 3D (modelos3d.js): desenho parado de costas para os rivais/garagem e a cabeça do piloto no lugar certo
  function em3d(id, extra) {
    var v = { modelo: id, aberto: true, janela: { elipse: [0.5, 0.3, 0.2, 0.2] }, desenhar: MOD.desenhar(id) };
    Object.keys(extra).forEach(function (k) { v[k] = extra[k]; });
    var o = MOD.cabeca(id, 0, 0, v.w, v.h, 0.3, 0, 0); v.cab = o ? [o.x / v.w, o.y / v.h, 2 * o.r / v.h] : [0.5, 0.3, 0.15];
    return v;
  }
  var CAV = raiz.VruuumCavalo || (typeof require === 'function' ? require('./cavalo.js') : null);
  var circ = U.circ, oval = U.oval, caixa = U.caixa, poli = U.poli, linha = U.linha, sombra = U.sombra;

  function tom(cor, f) {   // f > 0 clareia, f < 0 escurece
    var n = parseInt(cor.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function m(v) { return Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f)); }
    return 'rgb(' + m(r) + ',' + m(g) + ',' + m(b) + ')';
  }
  function grad(c, y0, y1, a, b) { var g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
  function piloto(c, emoji, x, y, tam, clipFn) {
    if (!emoji) return;   // na corrida o piloto é desenhado por cima, animado (cabeca.js)
    c.save(); if (clipFn) { c.beginPath(); clipFn(); c.clip(); }
    c.font = Math.round(tam) + 'px ' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(emoji, x, y);
    c.restore();
  }

  // ---------- terra ----------

  /* menino de skate visto de trás, como num jogo de skate: o pé da frente em cima do shape e o de trás
     empurrando o chão. fase (0 a 1) é um ciclo da remada: 0–0.45 o pé de trás empurra a rua (vai para
     trás, mais perto de quem olha), 0.45–0.65 levanta (aparece a sola) e volta, 0.65–1 descansa no
     tail (deslizando). Desenhado em vários quadros (quadros: 12) que a corrida troca conforme a velocidade.
     A cabeça é desenhada viva por cima (cabeca.js): aqui fica só uma cabeça neutra para quando está longe. */
  var PELE = '#f2c9a0', PELE_SOMBRA = '#d9a57a', SHORT = '#2a2d3a';
  function mistura(a, b, f) { return a + (b - a) * f; }
  function suave(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  // perna em dois pedaços (coxa e canela) com o joelho dobrando para fora (lado = -1 esquerda, 1 direita)
  function joelho(hx, hy, fx, fy, comp, lado) {
    var dx = fx - hx, dy = fy - hy, d = Math.sqrt(dx * dx + dy * dy) || 1, meio = Math.max(comp, d) / 2;
    var alt = Math.sqrt(Math.max(0, meio * meio - (d / 2) * (d / 2)));
    return [hx + dx / 2 - dy / d * alt * -lado, hy + dy / 2 + dx / d * alt * -lado];
  }
  function membro(c, a, b, l1, l2, cor, sombraCor) {   // pedaço de braço ou perna afinando, com sombra de um lado
    var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / d, ny = dx / d;
    poli(c, [a[0] + nx * l1, a[1] + ny * l1, b[0] + nx * l2, b[1] + ny * l2, b[0] - nx * l2, b[1] - ny * l2, a[0] - nx * l1, a[1] - ny * l1], cor);
    circ(c, a[0], a[1], l1, cor); circ(c, b[0], b[1], l2, cor);
    if (sombraCor) poli(c, [a[0] + nx * l1 * 0.3, a[1] + ny * l1 * 0.3, b[0] + nx * l2 * 0.3, b[1] + ny * l2 * 0.3, b[0] + nx * l2 * 0.95, b[1] + ny * l2 * 0.95, a[0] + nx * l1 * 0.95, a[1] + ny * l1 * 0.95], sombraCor);
  }
  function tenis(c, x, y, w, sola, cor) {   // tênis visto de trás (calcanhar); sola > 0 = pé levantado mostrando a sola
    var h = w * 0.62;
    if (sola > 0) {
      c.save(); c.translate(x, y); c.rotate(-0.25 * sola);
      oval(c, 0, -h * 0.1, w * 0.52, h * (0.55 + sola * 0.6), '#e9e4ee');
      oval(c, 0, -h * 0.1, w * 0.4, h * (0.42 + sola * 0.5), '#c95d7a');
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = Math.max(1, w * 0.04);
      for (var k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(-w * 0.3, -h * 0.1 + k * h * 0.18 * (0.6 + sola)); c.lineTo(w * 0.3, -h * 0.1 + k * h * 0.18 * (0.6 + sola)); c.stroke(); }
      c.restore(); return;
    }
    caixa(c, x - w / 2, y - h, w, h, w * 0.3, '#f6f6f8');
    caixa(c, x - w / 2, y - h * 0.22, w, h * 0.22, w * 0.1, '#d8d8de');   // sola
    caixa(c, x - w * 0.14, y - h * 0.95, w * 0.28, h * 0.6, w * 0.08, cor);   // reforço do calcanhar
  }
  function shape(c, W, H, cor) {
    // sombra no chão, rodinhas da frente (lá adiante), o shape indo para longe em perspectiva e o tail perto da gente
    oval(c, W * 0.47, H * 0.905, W * 0.21, H * 0.02, 'rgba(0,0,0,.3)');
    [0.415, 0.525].forEach(function (x) { caixa(c, W * (x - 0.022), H * 0.728, W * 0.044, H * 0.028, W * 0.01, '#e8e2d0'); });
    linha(c, [W * 0.415, H * 0.742, W * 0.525, H * 0.742], '#9aa0a6', H * 0.007);
    function deck(dy) {
      c.beginPath(); c.moveTo(W * 0.415, H * (0.708 + dy)); c.quadraticCurveTo(W * 0.47, H * (0.69 + dy), W * 0.525, H * (0.708 + dy));
      c.lineTo(W * 0.585, H * (0.848 + dy)); c.quadraticCurveTo(W * 0.47, H * (0.876 + dy), W * 0.355, H * (0.848 + dy)); c.closePath();
    }
    deck(0.016); c.fillStyle = cor; c.fill();   // a borda do shape (madeira pintada)
    deck(0.009); c.fillStyle = '#e9c48a'; c.fill();
    deck(0); c.fillStyle = grad(c, H * 0.69, H * 0.87, '#2a2a33', '#3b3b46'); c.fill();   // lixa
    c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = Math.max(1, H * 0.003); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.07)'; for (var k = 0; k < 22; k++) c.fillRect(W * (0.39 + (k * 37 % 17) / 100), H * (0.72 + (k * 13 % 12) / 100), 2, 2);
    linha(c, [W * 0.385, H * 0.885, W * 0.555, H * 0.885], '#9aa0a6', H * 0.011);   // truck de trás
    [0.37, 0.57].forEach(function (x) { caixa(c, W * (x - 0.038), H * 0.868, W * 0.076, H * 0.038, W * 0.02, '#f1ead6'); caixa(c, W * (x - 0.038), H * 0.868, W * 0.076, H * 0.011, W * 0.01, 'rgba(255,255,255,.75)'); });
  }
  function skatista(c, W, H, cor, emoji, fase, corpo) {   // corpo: 'menina' (saia, blusinha com coração) ou 'menino'
    var menina = corpo === 'menina';   // sem corpo informado (código antigo): menino, como antes da escolha existir
    fase = ((fase || 0) % 1 + 1) % 1;
    var escura = tom(cor, -0.35), clara = tom(cor, 0.2), g = giroCorpo(fase), cg = Math.cos(g), sg = Math.sin(g);
    // pé de trás: onde está em cada momento da remada
    var px, py, sola = 0, noChao = false, perto = 1, deitado = 0;
    if (fase < 0.45) { var a = suave(fase / 0.45); px = mistura(0.63, 0.7, a); py = mistura(0.84, 0.975, a); noChao = true; perto = mistura(1, 1.18, a); }
    else if (fase < 0.65) { var b = (fase - 0.45) / 0.2; px = mistura(0.7, 0.5, suave(b)); py = mistura(0.975, 0.835, suave(b)) - Math.sin(Math.PI * b) * 0.07; sola = Math.sin(Math.PI * Math.min(1, b * 1.3)); perto = mistura(1.18, 1, b); }
    else { var d = suave((fase - 0.65) / 0.08); px = mistura(0.5, 0.485, d); py = 0.845; deitado = d; }
    shape(c, W, H, tom(cor, 0.1));
    if (noChao) oval(c, W * px, H * (py + 0.005), W * 0.06 * perto, H * 0.012, 'rgba(0,0,0,.3)');
    // quadris giram com o corpo: o direito (de trás) fica mais perto de quem olha
    var mq = 0.055 * cg + 0.01;
    // perna de trás (direita): quadril -> joelho -> pé
    var qd = [W * (0.5 + mq), H * 0.55], pd = [W * px, H * (py - 0.045 * perto)], jd = joelho(qd[0], qd[1], pd[0], pd[1], H * 0.27, 1);
    membro(c, qd, jd, W * 0.062, W * 0.05, PELE, PELE_SOMBRA); membro(c, jd, pd, W * 0.05, W * 0.036 * perto, PELE, PELE_SOMBRA);
    caixa(c, pd[0] - W * 0.038 * perto, pd[1] - H * 0.012, W * 0.076 * perto, H * 0.022, W * 0.01, '#fdfdfd');   // meia
    // perna da frente (esquerda): pé em cima do shape, perto do bico
    var qe = [W * (0.5 - mq), H * 0.55], pe = [W * 0.455, H * 0.765], je = joelho(qe[0], qe[1], pe[0], pe[1], H * 0.222, -1);
    membro(c, qe, je, W * 0.062, W * 0.05, PELE, PELE_SOMBRA); membro(c, je, pe, W * 0.05, W * 0.036, PELE, PELE_SOMBRA);
    caixa(c, pe[0] - W * 0.038, pe[1] - H * 0.012, W * 0.076, H * 0.022, W * 0.01, '#fdfdfd');
    // tênis: remando, o da frente aponta para a frente (calcanhar); deslizando, os dois ficam de lado no shape
    if (deitado > 0.5) tenisLado(c, W * 0.455, H * 0.8, W * 0.15, tom(cor, -0.2)); else tenis(c, W * 0.455, H * 0.8, W * 0.11, 0, tom(cor, -0.2));
    if (deitado > 0.5) tenisLado(c, W * px, H * py, W * 0.16, tom(cor, -0.2)); else tenis(c, W * px, H * py, W * 0.11 * perto, sola, tom(cor, -0.2));
    // bermuda (menino) ou saia rodada com pregas (menina), estreitando com o giro
    var lb = 0.14 * (0.62 + 0.38 * cg);
    if (menina) {
      var saia = tom(cor, -0.3), lb2 = lb + 0.06;
      c.fillStyle = saia; c.beginPath();
      c.moveTo(W * (0.5 - lb + 0.01), H * 0.47); c.lineTo(W * (0.5 + lb - 0.01), H * 0.47);
      c.lineTo(W * (0.5 + lb2), H * 0.6); c.quadraticCurveTo(W * 0.5, H * 0.615, W * (0.5 - lb2), H * 0.6); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = Math.max(1, W * 0.007);
      for (var pq = -2; pq <= 2; pq++) { c.beginPath(); c.moveTo(W * (0.5 + pq * lb * 0.35), H * 0.48); c.lineTo(W * (0.5 + pq * lb2 * 0.4), H * 0.605); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.moveTo(W * (0.5 - lb2), H * 0.597); c.quadraticCurveTo(W * 0.5, H * 0.612, W * (0.5 + lb2), H * 0.597);
      c.lineTo(W * (0.5 + lb2), H * 0.604); c.quadraticCurveTo(W * 0.5, H * 0.619, W * (0.5 - lb2), H * 0.604); c.closePath(); c.fill();
    } else {
    c.fillStyle = SHORT; c.beginPath();
    c.moveTo(W * (0.5 - lb), H * 0.47); c.lineTo(W * (0.5 + lb), H * 0.47); c.lineTo(W * (0.5 + lb - 0.005), H * 0.585);
    c.lineTo(W * 0.505, H * 0.6); c.lineTo(W * 0.5, H * 0.545); c.lineTo(W * 0.495, H * 0.6); c.lineTo(W * (0.5 - lb + 0.005), H * 0.585); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(W * (0.5 - lb + 0.02), H * 0.48, W * (lb * 2 - 0.04), H * 0.015);
    }
    // camiseta: o tronco gira de lado (pé esquerdo na frente): as costas ficam à esquerda e o lado direito do
    // corpo aparece à direita, mais escuro
    var A = 0.13, B = 0.085, meia = Math.sqrt(A * A * cg * cg + B * B * sg * sg), esp = -B * sg * 0.9;   // largura vista e a coluna
    c.save(); c.translate(W * 0.5, 0); c.scale(meia / A, 1); c.translate(-W * 0.5, 0);
    c.fillStyle = grad(c, H * 0.22, H * 0.52, clara, escura); c.beginPath();
    var cint = menina ? 0.025 : 0;   // blusinha mais acinturada
    c.moveTo(W * (0.385 + cint), H * 0.505); c.quadraticCurveTo(W * (0.36 + cint * 1.6), H * 0.4, W * 0.37, H * 0.3);
    c.lineTo(W * 0.37, H * 0.3); c.quadraticCurveTo(W * 0.39, H * 0.225, W * 0.43, H * 0.215);
    c.quadraticCurveTo(W * 0.5, H * 0.232, W * 0.57, H * 0.215); c.quadraticCurveTo(W * 0.61, H * 0.225, W * 0.63, H * 0.3);
    c.quadraticCurveTo(W * (0.64 - cint * 1.6), H * 0.4, W * (0.615 - cint), H * 0.505);
    c.quadraticCurveTo(W * 0.5, H * 0.52, W * (0.385 + cint), H * 0.505); c.closePath(); c.fill();
    c.save(); c.clip();
    var xc = 0.5 + esp * (A / meia);   // a coluna, em coordenadas antes do "scale"
    c.fillStyle = 'rgba(0,0,0,' + (0.28 * sg).toFixed(3) + ')'; c.fillRect(W * (xc + 0.06), H * 0.2, W * 0.3, H * 0.35);   // lado direito, virado
    c.restore();
    c.strokeStyle = 'rgba(0,0,0,.16)'; c.lineWidth = Math.max(1, W * 0.008); c.lineCap = 'round';
    [[xc - 0.05, 0.3, xc - 0.07, 0.46], [xc + 0.07, 0.32, xc + 0.085, 0.47], [xc, 0.38, xc - 0.01, 0.5]].forEach(function (q) { c.beginPath(); c.moveTo(W * q[0], H * q[1]); c.quadraticCurveTo(W * (q[0] + 0.02), H * (q[1] + q[3]) / 2, W * q[2], H * q[3]); c.stroke(); });
    c.save(); c.translate(W * xc, H * 0.33); c.scale(Math.max(0.35, cg), 1);
    c.fillStyle = 'rgba(255,255,255,.85)'; c.font = '800 ' + Math.round(H * 0.045) + 'px ' + FONTE; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(menina ? '♥' : '7', 0, 0);
    c.restore(); c.restore();
    // pescoço e cabeça neutra (cabelo), coberta pelo piloto vivo
    caixa(c, W * 0.455, H * 0.17, W * 0.09, H * 0.06, W * 0.03, PELE_SOMBRA);
    circ(c, W * 0.5, H * 0.105, H * 0.072, '#3a2a20');   // menor que a cabeça viva, para não aparecer na borda quando ela vira
    piloto(c, emoji, W * 0.5, H * 0.105, H * 0.2);
  }
  function tenisLado(c, x, y, w, cor) {   // tênis visto de lado, atravessado no shape (bico para a direita)
    var h = w * 0.36;
    caixa(c, x - w / 2, y - h, w, h, h * 0.45, '#f6f6f8');
    caixa(c, x - w / 2, y - h * 0.28, w, h * 0.28, h * 0.12, '#d8d8de');
    caixa(c, x - w * 0.12, y - h * 0.85, w * 0.3, h * 0.45, h * 0.15, cor);
  }
  // quanto o corpo está virado de lado (rad): remando fica mais de frente, deslizando fica de lado
  function giroCorpo(fase) {
    fase = ((fase || 0) % 1 + 1) % 1;
    if (fase < 0.45) return 0.35;
    if (fase < 0.7) return 0.35 + 0.55 * suave((fase - 0.45) / 0.25);
    if (fase < 0.9) return 0.9;
    return 0.9 - 0.55 * suave((fase - 0.9) / 0.1);
  }
  /* braços do skatista, desenhados ao vivo (seguem a curva). lado: -1 virando à esquerda, 1 à direita.
     Cada braço tem dois ângulos, o do ombro (braço) e o do cotovelo (antebraço), medidos a partir de "reto
     para baixo", para fora do corpo. Andando reto: braços um pouco abertos e cotovelos dobrados, antebraço para a
     frente, prontos para equilibrar. Na curva o corpo inclina para dentro e os braços fazem o contrapeso: o de
     DENTRO se estica para o lado da curva, mais baixo, quase reto; o de FORA sobe, com o cotovelo bem dobrado e a
     mão no alto (virando à esquerda: esquerdo baixo e esticado, direito alto e dobrado). Remando, balançam ao
     contrário das pernas. qual: 'longe' (o esquerdo, atrás do corpo: desenhar ANTES do boneco) ou 'perto' (o
     direito, na frente: desenhar DEPOIS). x0, y0, W, H: onde o boneco está desenhado. */
  var POSE = {   // [ombro, cotovelo (absoluto), tamanho do antebraço visto]
    reto: [32, 82, 0.86],
    fora: [72, 128, 0.92],
    dentro: [26, 42, 1]
  };
  function bracosSkate(c, x0, y0, W, H, cor, fase, lado, qual) {
    fase = ((fase || 0) % 1 + 1) % 1; lado = Math.max(-1, Math.min(1, lado || 0));
    var g = giroCorpo(fase), cg = Math.cos(g), s = qual === 'longe' ? -1 : 1;
    var bal = fase < 0.65 ? Math.sin(fase / 0.65 * Math.PI * 2) : 0;
    var esq = Math.max(0, -lado), dir = Math.max(0, lado);
    var dentro = s < 0 ? esq : dir, fora = s < 0 ? dir : esq;   // este braço está do lado de dentro ou de fora da curva?
    var r = POSE.reto, f = POSE.fora, d = POSE.dentro;
    function mix(k) { return r[k] + (f[k] - r[k]) * fora + (d[k] - r[k]) * dentro; }
    var aU = (mix(0) + 12 * bal * s) * Math.PI / 180, aF = (mix(1) + 16 * bal * s) * Math.PI / 180, kF = mix(2);
    var k = s < 0 ? 0.86 : 1, Lu = H * 0.125 * k, Lf = H * 0.115 * k * kF;   // o de trás parece um pouco menor
    var om = [x0 + W * (0.5 + s * 0.13 * cg * (s < 0 ? 0.9 : 1.05)), y0 + H * (s < 0 ? 0.24 : 0.25)];
    var co = [om[0] + s * Math.sin(aU) * Lu, om[1] + Math.cos(aU) * Lu];
    var mao = [co[0] + s * Math.sin(aF) * Lf, co[1] + Math.cos(aF) * Lf];
    membro(c, om, co, W * 0.046 * k, W * 0.04 * k, PELE, PELE_SOMBRA);
    membro(c, co, mao, W * 0.04 * k, W * 0.031 * k, PELE, PELE_SOMBRA);
    circ(c, co[0], co[1], W * 0.041 * k, PELE);                                   // cotovelo
    oval(c, mao[0], mao[1], W * 0.037 * k, W * 0.032 * k, PELE);                  // mão
    circ(c, mao[0] - s * W * 0.022 * k, mao[1] - W * 0.012 * k, W * 0.014 * k, PELE_SOMBRA);   // polegar
    // manga curta da camiseta
    var mx = om[0] + (co[0] - om[0]) * 0.45, my = om[1] + (co[1] - om[1]) * 0.45;
    membro(c, om, [mx, my], W * 0.06 * k, W * 0.052 * k, tom(cor, s < 0 ? -0.25 : 0.05), null);
  }

  var LISTA = [
    em3d('classico', { id: 'classico', grupo: 'terra', nome: ['Clássico', 'Classic', 'Clásico'], w: 800, h: 1120, vel: 1, curva: 1 }),
    em3d('conversivel', { id: 'conversivel', grupo: 'terra', nome: ['Conversível Rosa', 'Pink Convertible', 'Descapotable Rosa'], w: 820, h: 1120, vel: 1.02, curva: 1.04 }),
    em3d('gt', { id: 'gt', grupo: 'terra', nome: ['GT Redondo', 'Round GT', 'GT Redondo'], w: 820, h: 990, vel: 1.04, curva: 1.03 }),
    em3d('super', { id: 'super', grupo: 'terra', nome: ['Superesportivo', 'Supercar', 'Superdeportivo'], w: 920, h: 960, vel: 1.08, curva: 0.95 }),
    em3d('kart', { id: 'kart', capacete: true, grupo: 'terra', nome: ['Kart', 'Kart', 'Kart'], w: 720, h: 760, vel: 0.96, curva: 1.12 }),
    em3d('monstrao', { id: 'monstrao', grupo: 'terra', nome: ['Monstrão', 'Monster Truck', 'Camión Monstruo'], w: 960, h: 1550, vel: 0.95, curva: 0.98 }),
    em3d('moto', { id: 'moto', capacete: true, grupo: 'moto', nome: ['Moto', 'Motorbike', 'Moto'], w: 520, h: 1250, vel: 1.03, curva: 1.1 }),
    { id: 'skate', semMotor: true, janela: { elipse: [0.5, 0.1, 0.3, 0.2] }, cab: [0.5, 0.1, 0.2], aberto: true, quadros: 12, bracos: true, grupo: 'moto', nome: ['Skate', 'Skateboard', 'Skate'], w: 560, h: 780, vel: 0.94, curva: 1.15, desenhar: skatista },
    { id: 'cavalo', semMotor: true, voz: 'cavalo', janela: { elipse: [0.5, 0.16, 0.3, 0.2] }, cab: [0.5, 0.16, 0.132], aberto: true, quadros: 12, cavalo: true, grupo: 'moto', nome: ['Cavalo', 'Horse', 'Caballo'], w: 720, h: 1050, vel: 0.97, curva: 1.12, desenhar: function (c, W, H, cor, e, f, corpo) { CAV.desenhar(c, W, H, cor, e, f, corpo); } },
    { id: 'dino', semMotor: true, voz: 'dino', janela: { elipse: [0.5, 0.16, 0.3, 0.2] }, cab: [0.5, 0.16, 0.132], aberto: true, quadros: 12, cavalo: true, bicho: 'dino', grupo: 'moto', nome: ['Dinossauro', 'Dinosaur', 'Dinosaurio'], w: 720, h: 1050, vel: 0.98, curva: 1.08, desenhar: function (c, W, H, cor, e, f, corpo) { CAV.desenhar(c, W, H, cor, e, f, corpo, 'dino'); } },
    em3d('galinha', { id: 'galinha', quadros: 8, galinha: true, semMotor: true, voz: 'galo', grupo: 'moto', nome: ['Galinha', 'Hen', 'Gallina'], w: 900, h: 1000, vel: 0.95, curva: 1.12 }),
    em3d('pipoca', { id: 'pipoca', quadros: 6, grupo: 'terra', nome: ['Carrinho de Pipoca', 'Popcorn Cart', 'Carrito de Palomitas'], w: 820, h: 900, vel: 0.95, curva: 1.08 }),
    em3d('sorvete', { id: 'sorvete', quadros: 8, grupo: 'terra', nome: ['Carrinho de Sorvete', 'Ice Cream Cart', 'Carrito de Helados'], w: 820, h: 960, vel: 0.95, curva: 1.08 }),
    em3d('hamburguer', { id: 'hamburguer', grupo: 'terra', nome: ['Carro-Hambúrguer', 'Burger Car', 'Coche Hamburguesa'], w: 900, h: 860, vel: 1.0, curva: 1.0 }),
    em3d('furgao', { id: 'furgao', grupo: 'terra', nome: ['Furgão de Surfe', 'Surf Van', 'Furgoneta de Surf'], w: 900, h: 1000, vel: 0.99, curva: 1.0 }),
    em3d('escolar', { id: 'escolar', quadros: 8, grupo: 'terra', nome: ['Ônibus Escolar', 'School Bus', 'Autobús Escolar'], w: 1000, h: 1100, vel: 0.95, curva: 0.96 }),
    em3d('pelucias', { id: 'pelucias', quadros: 8, grupo: 'terra', nome: ['Caminhão de Pelúcias', 'Plush Claw Truck', 'Camión de Peluches'], w: 1000, h: 1060, vel: 0.96, curva: 0.98 }),
    em3d('ovo', { id: 'ovo', quadros: 8, semPiloto: true, semMotor: true, grupo: 'moto', nome: ['Ovo Corredor', 'Running Egg', 'Huevo Corredor'], w: 720, h: 1000, vel: 0.97, curva: 1.14 }),
    em3d('aviao', { id: 'aviao', grupo: 'ar', nome: ['Aviãozinho', 'Little Plane', 'Avioncito'], w: 1500, h: 760, vel: 1, curva: 1.05 }),
    em3d('jato', { id: 'jato', grupo: 'ar', nome: ['Jato', 'Jet', 'Jet'], w: 1300, h: 700, vel: 1.1, curva: 0.92 }),
    em3d('treno', { id: 'treno', semMotor: true, quadros: 8, grupo: 'ar', nome: ['Trenó do Papai Noel', "Santa's Sleigh", 'Trineo de Papá Noel'], w: 880, h: 1180, vel: 1.0, curva: 1.05 }),
    em3d('arara', { id: 'arara', semMotor: true, voz: 'arara', quadros: 8, grupo: 'ar', nome: ['Arara Gigante', 'Giant Macaw', 'Guacamayo Gigante'], w: 1300, h: 1000, vel: 1.04, curva: 1.08 }),
    em3d('morcego', { id: 'morcego', quadros: 8, dracula: true, abobora: true, semMotor: true, voz: 'morcego', grupo: 'ar', nome: ['Morcego (vira Drácula!)', 'Bat (turns into Dracula!)', 'Murciélago (¡se vuelve Drácula!)'], w: 1300, h: 1000, vel: 1.02, curva: 1.1 }),
    em3d('heli', { id: 'heli', grupo: 'ar', nome: ['Helicóptero', 'Helicopter', 'Helicóptero'], w: 1100, h: 900, vel: 0.95, curva: 1.12 })
  ];
  var GRUPOS = [
    { id: 'terra', nome: ['🚗 Carros', '🚗 Cars', '🚗 Coches'] },
    { id: 'moto', nome: ['🏍️ Moto, skate e montarias', '🏍️ Bike, skateboard and rides', '🏍️ Moto, skate y monturas'] },
    { id: 'ar', nome: ['✈️ No céu (voa!)', '✈️ In the sky (flies!)', '✈️ En el cielo (¡vuela!)'] }
  ];
  function achar(id) { for (var k = 0; k < LISTA.length; k++) if (LISTA[k].id === id) return LISTA[k]; return null; }
  function voa(id) { var v = achar(id); return !!(v && v.grupo === 'ar'); }

  var VruuumVeiculos = { LISTA: LISTA, GRUPOS: GRUPOS, achar: achar, voa: voa, tom: tom, bracosSkate: bracosSkate, giroCorpo: giroCorpo };
  if (typeof module !== 'undefined' && module.exports) module.exports = VruuumVeiculos;
  else raiz.VruuumVeiculos = VruuumVeiculos;
})(this);
