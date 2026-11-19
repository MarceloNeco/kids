/* Boliche (Bowling / Bolos) — jogo da Jogoteca (Bolinho de Chuva · SolverONE · kids).
   Pista vista de trás em pseudo-3D num <canvas>: a física é simples, em 2D vista de cima (a bola e os pinos são
   círculos), e cada ponto é projetado em perspectiva na hora de desenhar. Arte própria, estilo retrô de quadrinhos.
   Controles: arrastar para cima lança (direção = mira, velocidade = força, curva no fim do gesto = efeito);
   no teclado e no controle da TV, ←/→ mudam a bola de lugar, Enter liga a mira que balança e o 2º Enter lança.
   Partida de 10 jogadas com a pontuação de verdade (strike, spare, bolas extras da 10ª), 1 ou 2 jogadores revezando.
   A lógica pura (pontuação e física) fica em logica.* para os testes no Node (jogoteca/teste/boliche.test.js).
   Com ctx.teste, window.BolicheDebug expõe estado(), lancar(alvo, forca, efeito) e definirLances(jogador, lances). */
(function () {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ======================= pontuação (lógica pura) ======================= */
  function marcaNum(n) { return n === 0 ? '-' : String(n); }

  // totais acumulados por quadro (10 posições); null enquanto o quadro ainda espera bolas (dele ou do bônus)
  function pontuar(lances) {
    var tot = [], soma = 0, i = 0, f, a, b, c, pend = false;
    for (f = 0; f < 10; f++) {
      if (pend || i >= lances.length) { pend = true; tot.push(null); continue; }
      a = lances[i]; b = lances[i + 1]; c = lances[i + 2];
      if (f === 9) {
        if (b === undefined) { pend = true; tot.push(null); continue; }
        if (a === 10 || a + b === 10) {
          if (c === undefined) { pend = true; tot.push(null); continue; }
          soma += a + b + c;
        } else soma += a + b;
        tot.push(soma); continue;
      }
      if (a === 10) {
        if (b === undefined || c === undefined) { pend = true; tot.push(null); continue; }
        soma += 10 + b + c; i += 1;
      } else {
        if (b === undefined) { pend = true; tot.push(null); continue; }
        if (a + b === 10) {
          if (c === undefined) { pend = true; tot.push(null); continue; }
          soma += 10 + c;
        } else soma += a + b;
        i += 2;
      }
      tot.push(soma);
    }
    return tot;
  }
  function total(lances) {
    var t = pontuar(lances), i;
    for (i = 9; i >= 0; i--) if (t[i] !== null) return t[i];
    return 0;
  }
  // o que vai escrito nas casinhas de cada quadro: 'X' (strike), '/' (spare), '-' (zero) ou o número
  function marcas(lances) {
    var q = [], i = 0, f, a, b, c, m;
    for (f = 0; f < 10; f++) {
      a = lances[i]; b = lances[i + 1]; c = lances[i + 2];
      if (a === undefined) { q.push([]); continue; }
      if (f < 9) {
        if (a === 10) { q.push(['', 'X']); i += 1; continue; }
        m = [marcaNum(a)];
        if (b !== undefined) m.push(a + b === 10 ? '/' : marcaNum(b));
        q.push(m); i += 2; continue;
      }
      m = [a === 10 ? 'X' : marcaNum(a)];
      if (b !== undefined) {
        if (a === 10) m.push(b === 10 ? 'X' : marcaNum(b));
        else m.push(a + b === 10 ? '/' : marcaNum(b));
        if (c !== undefined) {
          if ((a === 10 && b === 10) || (a < 10 && a + b === 10)) m.push(c === 10 ? 'X' : marcaNum(c));
          else m.push(b + c === 10 ? '/' : marcaNum(c));
        }
      }
      q.push(m);
    }
    return q;
  }
  // em que ponto está a partida: quadro (0..9; 10 = acabou), bola dentro do quadro, quantos pinos de pé na próxima bola
  function situacao(lances) {
    var i = 0, f, a, b, c;
    for (f = 0; f < 9; f++) {
      a = lances[i];
      if (a === undefined) return { quadro: f, bola: 0, emPe: 10, acabou: false };
      if (a === 10) { i += 1; continue; }
      b = lances[i + 1];
      if (b === undefined) return { quadro: f, bola: 1, emPe: 10 - a, acabou: false };
      i += 2;
    }
    a = lances[i]; b = lances[i + 1]; c = lances[i + 2];
    if (a === undefined) return { quadro: 9, bola: 0, emPe: 10, acabou: false };
    if (b === undefined) return { quadro: 9, bola: 1, emPe: a === 10 ? 10 : 10 - a, acabou: false };
    if (!(a === 10 || a + b === 10)) return { quadro: 10, bola: 0, emPe: 0, acabou: true };
    if (c === undefined) return { quadro: 9, bola: 2, emPe: (a === 10 && b < 10) ? 10 - b : 10, acabou: false };
    return { quadro: 10, bola: 0, emPe: 0, acabou: true };
  }

  /* ======================= física (lógica pura, em metros, vista de cima) ======================= */
  // x: de lado (0 = meio da pista); z: para a frente (0 = linha de falta). Pista com 1,06 m e canaletas de 24 cm.
  var CAB = 13.6, MEIA = 0.53, BORDA = 0.77, FIM = CAB + 0.95, RB = 0.109, RP = 0.062, Z0 = -0.3, PASSO = 1.75;
  var POS = (function () {
    var p = [], r, j;
    for (r = 0; r < 4; r++) for (j = 0; j <= r; j++) p.push({ x: (j - r / 2) * 0.3048, z: CAB + r * 0.264, fila: r, col: j });
    return p;   // índice 0 = pino 1 (o da frente) … índice 9 = pino 10
  })();
  var NIVEIS = {
    facil: { protecao: true, limiar: 0.42, natural: 0, mira: 1 },
    medio: { protecao: false, limiar: 0.58, natural: 0, mira: 0.3 },
    dificil: { protecao: false, limiar: 0.95, natural: -0.25, mira: 0 }
  };

  // o: { x, alvo (x na altura do pino da frente), forca (m/s), efeito (-1..1), nivel, emPe: [10 booleanos], sorte (-1..1) }
  function criarLance(o) {
    var nv = NIVEIS[o.nivel] || NIVEIS.facil, pinos = [], i;
    for (i = 0; i < 10; i++) {
      if (o.emPe && !o.emPe[i]) continue;
      pinos.push({ n: i, x: POS[i].x, z: POS[i].z, vx: 0, vz: 0, emPe: true, queda: 0, fx: 0, fz: 1, fora: false, tremor: 0 });
    }
    var forca = clamp(o.forca, 3, 12), x = clamp(o.x || 0, -0.45, 0.45);
    var dir = (clamp(o.alvo, -0.95, 0.95) - x) / (CAB - Z0);
    var vz = forca / Math.sqrt(1 + dir * dir), ef = clamp(o.efeito || 0, -1, 1);
    if (nv.natural) ef = clamp(ef + nv.natural + 0.12 * (o.sorte !== undefined ? o.sorte : Math.random() * 2 - 1), -1, 1);
    return { nv: nv, t: 0, tFora: 0, caiu: false, bateu: false, eventos: [],
      bola: { x: x, z: Z0, vx: vz * dir, vz: vz, ef: ef, canaleta: false, fora: false, giro: 0 }, pinos: pinos };
  }
  function derrubar(p, nx, nz) {
    if (!p.emPe) return;
    var d = Math.sqrt(p.vx * p.vx + p.vz * p.vz);
    p.emPe = false;
    if (d > 0.05) { p.fx = p.vx / d; p.fz = p.vz / d; } else { p.fx = nx || 0; p.fz = nz || 1; }
  }
  function raioPino(p) { return p.emPe ? RP : RP * (1 + 0.8 * p.queda); }
  function colidir(e, a, c, ma, mc, ehBola) {
    // pino deitado ocupa mais lugar (ele tem 38 cm de comprimento): é ele que leva os vizinhos junto
    var dx = c.x - a.x, dz = c.z - a.z, min = (ehBola ? RB : raioPino(a)) + raioPino(c), d2 = dx * dx + dz * dz;
    if (d2 >= min * min || d2 === 0) return;
    var d = Math.sqrt(d2), nx = dx / d, nz = dz / d, sob = min - d, wa = mc / (ma + mc), wc = ma / (ma + mc);
    a.x -= nx * sob * wa; a.z -= nz * sob * wa; c.x += nx * sob * wc; c.z += nz * sob * wc;
    var rel = (a.vx - c.vx) * nx + (a.vz - c.vz) * nz;
    if (rel <= 0) return;
    var imp = (1 + (ehBola ? 0.55 : 0.82)) * rel / (1 / ma + 1 / mc), lim = e.nv.limiar;
    a.vx -= imp / ma * nx; a.vz -= imp / ma * nz; c.vx += imp / mc * nx; c.vz += imp / mc * nz;
    if (c.emPe) { if (imp / mc > lim) derrubar(c, nx, nz); else c.tremor = Math.min(1, c.tremor + imp / mc * 1.5); }
    if (!ehBola && a.emPe) { if (imp / ma > lim) derrubar(a, -nx, -nz); else a.tremor = Math.min(1, a.tremor + imp / ma * 1.5); }
    if (ehBola && !e.bateu) { e.bateu = true; e.eventos.push('impacto'); }
    else if (imp > 0.6) e.eventos.push('pino');
  }
  function passoFisica(e, dt) {
    var b = e.bola, nv = e.nv, ps = e.pinos, i, j, p, s, amort, lim;
    e.t += dt;
    if (!b.fora) {
      if (!b.canaleta) b.vx += b.ef * 0.75 * (0.25 + 0.75 * clamp(b.z / CAB, 0, 1)) * dt;   // a curva aparece mais no fim
      b.vz *= 1 - 0.02 * dt;
      b.x += b.vx * dt; b.z += b.vz * dt;
      b.giro += Math.sqrt(b.vx * b.vx + b.vz * b.vz) * dt / RB;
      if (!b.canaleta) {
        if (nv.protecao) {
          lim = MEIA - RB * 0.35;
          if (Math.abs(b.x) > lim) { s = b.x > 0 ? 1 : -1; b.x = s * lim; b.vx = -s * (Math.abs(b.vx) * 0.55 + 0.04); e.eventos.push('tabela'); }
        } else if (Math.abs(b.x) > MEIA && b.z < FIM) {
          b.canaleta = true; e.caiu = true; b.x = (b.x > 0 ? 1 : -1) * (MEIA + 0.12); b.vx = 0; e.eventos.push('canaleta');
        }
      }
      if (Math.abs(b.x) > BORDA - RB) { s = b.x > 0 ? 1 : -1; b.x = s * (BORDA - RB); b.vx = -b.vx * 0.4; }
      for (i = 0; i < ps.length; i++) if (!ps[i].fora) colidir(e, b, ps[i], 4, 1, true);
      if (b.z > FIM + 0.2 || b.vx * b.vx + b.vz * b.vz < 0.06) b.fora = true;
    } else e.tFora += dt;
    for (i = 0; i < ps.length; i++) {
      if (ps[i].fora) continue;
      for (j = i + 1; j < ps.length; j++) if (!ps[j].fora) colidir(e, ps[i], ps[j], 1, 1, false);
    }
    for (i = 0; i < ps.length; i++) {
      p = ps[i];
      if (p.fora) continue;
      amort = Math.exp(-(p.emPe ? 14 : 1.5) * dt);
      p.vx *= amort; p.vz *= amort;
      p.x += p.vx * dt; p.z += p.vz * dt;
      if (!p.emPe && p.queda < 1) p.queda = Math.min(1, p.queda + dt * 4.5);
      if (p.tremor > 0) p.tremor = Math.max(0, p.tremor - dt * 2.2);
      if (Math.abs(p.x) > BORDA - RP) { s = p.x > 0 ? 1 : -1; p.x = s * (BORDA - RP); p.vx = -p.vx * 0.45; derrubar(p, -s, 0); }
      if (p.emPe && Math.abs(p.x) > MEIA) derrubar(p, p.x > 0 ? 1 : -1, 0);
      if (p.z > FIM) { derrubar(p, 0, 1); p.fora = true; }
    }
  }
  function lanceAcabou(e) {
    if (e.t > 11 || e.tFora > 2.6) return true;
    if (!e.bola.fora) return false;
    for (var i = 0; i < e.pinos.length; i++) {
      var p = e.pinos[i];
      if (p.fora) continue;
      if (p.vx * p.vx + p.vz * p.vz > 0.004 || (!p.emPe && p.queda < 1)) return false;
    }
    return e.tFora > 0.35;
  }
  function derrubados(e) { var n = 0; for (var i = 0; i < e.pinos.length; i++) if (!e.pinos[i].emPe) n++; return n; }
  // um lance inteiro sem desenhar (para os testes no Node)
  function simular(o) {
    var e = criarLance(o), emPe = [], i;
    while (!lanceAcabou(e)) passoFisica(e, 1 / 240);
    for (i = 0; i < 10; i++) emPe.push(false);
    for (i = 0; i < e.pinos.length; i++) emPe[e.pinos[i].n] = e.pinos[i].emPe;
    return { derrubados: derrubados(e), canaleta: e.caiu, emPe: emPe, tempo: e.t };
  }

  /* ======================= arte: cores, rostos, pinos, bola ======================= */
  var CORES = [
    { n: ['Vermelha', 'Red', 'Roja'], c: ['#ff9a8f', '#e3262f', '#5e0911'] },
    { n: ['Azul', 'Blue', 'Azul'], c: ['#9ccaff', '#1f5fd6', '#0a1c55'] },
    { n: ['Verde', 'Green', 'Verde'], c: ['#a6f2be', '#1fa65a', '#093f22'] },
    { n: ['Roxa', 'Purple', 'Morada'], c: ['#dcb2ff', '#8436d0', '#2a0d4c'] },
    { n: ['Rosa', 'Pink', 'Rosa'], c: ['#ffc6de', '#ff4f9a', '#721442'] },
    { n: ['Preta', 'Black', 'Negra'], c: ['#9a9cb2', '#2b2d3a', '#07070c'] }
  ];
  var ROSTOS = [['Menina', 'Girl', 'Niña'], ['Menino', 'Boy', 'Niño'], ['Gato', 'Cat', 'Gato'], ['Cachorro', 'Dog', 'Perro']];
  var TINTA = '#1d1a2e';

  function circulo(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }
  function elipse(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, Math.PI * 2); }
  function pinta(c, cor, lw) { c.fillStyle = cor; c.fill(); if (lw) { c.lineWidth = lw; c.strokeStyle = TINTA; c.stroke(); } }

  // os 4 rostos (arte própria, contorno grosso de quadrinho), num círculo de raio r
  function desenharRosto(c, tipo, x, y, r) {
    var lw = Math.max(1, r * 0.07);
    c.save();
    circulo(c, x, y, r); c.fillStyle = ['#ff8fb4', '#4f9df0', '#ffcf4a', '#57d1a2'][tipo] || '#4f9df0'; c.fill();
    c.save(); circulo(c, x, y, r); c.clip();
    c.globalAlpha = 0.22; c.fillStyle = '#fff';
    for (var i = -3; i <= 3; i++) for (var j = -3; j <= 3; j++) { circulo(c, x + i * r * 0.3 + (j % 2) * r * 0.15, y + j * r * 0.27, r * 0.05); c.fill(); }
    c.globalAlpha = 1;
    c.translate(x, y); c.scale(r / 50, r / 50);
    if (tipo === 0) {            // menina: cabelo castanho com marias-chiquinhas e laço
      circulo(c, -34, 6, 15); pinta(c, '#7a3d1c', 3.5); circulo(c, 34, 6, 15); pinta(c, '#7a3d1c', 3.5);
      circulo(c, 0, 2, 33); pinta(c, '#7a3d1c', 3.5);
      elipse(c, 0, 12, 26, 28); pinta(c, '#ffd2ad', 3.5);
      c.beginPath(); c.moveTo(-27, 4); c.quadraticCurveTo(-20, -22, 4, -20); c.quadraticCurveTo(22, -20, 27, 2); c.quadraticCurveTo(10, -8, -2, -6);
      c.quadraticCurveTo(-14, -4, -27, 4); pinta(c, '#7a3d1c', 3);
      c.beginPath(); c.moveTo(34, -10); c.lineTo(46, -20); c.lineTo(46, -2); c.closePath(); pinta(c, '#ff3d6e', 2.5);
      c.beginPath(); c.moveTo(34, -10); c.lineTo(22, -20); c.lineTo(22, -2); c.closePath(); pinta(c, '#ff3d6e', 2.5);
      elipse(c, -10, 12, 3.6, 5); pinta(c, TINTA); elipse(c, 10, 12, 3.6, 5); pinta(c, TINTA);
      circulo(c, -9, 10.5, 1.3); pinta(c, '#fff'); circulo(c, 11, 10.5, 1.3); pinta(c, '#fff');
      circulo(c, -17, 22, 5); pinta(c, 'rgba(255,110,130,.45)'); circulo(c, 17, 22, 5); pinta(c, 'rgba(255,110,130,.45)');
      c.beginPath(); c.arc(0, 23, 8, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 3; c.strokeStyle = TINTA; c.stroke();
    } else if (tipo === 1) {     // menino: cabelo espetado e sardas
      circulo(c, -27, 14, 7); pinta(c, '#e9ad84', 3); circulo(c, 27, 14, 7); pinta(c, '#e9ad84', 3);
      elipse(c, 0, 12, 26, 29); pinta(c, '#f1bb90', 3.5);
      c.beginPath(); c.moveTo(-27, 6); c.lineTo(-30, -12); c.lineTo(-20, -18); c.lineTo(-18, -30); c.lineTo(-6, -22); c.lineTo(2, -34); c.lineTo(10, -22);
      c.lineTo(22, -28); c.lineTo(22, -14); c.lineTo(30, -8); c.lineTo(27, 6); c.quadraticCurveTo(12, -6, -6, -4); c.quadraticCurveTo(-18, -2, -27, 6);
      pinta(c, '#3b2416', 3);
      elipse(c, -10, 11, 3.6, 5); pinta(c, TINTA); elipse(c, 10, 11, 3.6, 5); pinta(c, TINTA);
      circulo(c, -9, 9.5, 1.3); pinta(c, '#fff'); circulo(c, 11, 9.5, 1.3); pinta(c, '#fff');
      c.fillStyle = '#b8653a'; [[-16, 19], [-12, 22], [-19, 23], [16, 19], [12, 22], [19, 23]].forEach(function (s) { circulo(c, s[0], s[1], 1.4); c.fill(); });
      c.beginPath(); c.moveTo(-10, 25); c.quadraticCurveTo(0, 34, 10, 25); c.closePath(); pinta(c, '#fff', 2.5);
    } else if (tipo === 2) {     // gato laranja listrado
      c.beginPath(); c.moveTo(-30, -2); c.lineTo(-30, -34); c.lineTo(-8, -18); c.closePath(); pinta(c, '#f59a3c', 3.5);
      c.beginPath(); c.moveTo(30, -2); c.lineTo(30, -34); c.lineTo(8, -18); c.closePath(); pinta(c, '#f59a3c', 3.5);
      c.beginPath(); c.moveTo(-26, -8); c.lineTo(-26, -25); c.lineTo(-14, -16); c.closePath(); pinta(c, '#ffb3c7');
      c.beginPath(); c.moveTo(26, -8); c.lineTo(26, -25); c.lineTo(14, -16); c.closePath(); pinta(c, '#ffb3c7');
      elipse(c, 0, 8, 32, 27); pinta(c, '#f59a3c', 3.5);
      c.strokeStyle = '#b8561a'; c.lineWidth = 3.5;
      [[-8, -18, -5, -8], [0, -19, 0, -9], [8, -18, 5, -8]].forEach(function (s) { c.beginPath(); c.moveTo(s[0], s[1]); c.lineTo(s[2], s[3]); c.stroke(); });
      elipse(c, 0, 20, 15, 11); pinta(c, '#ffe2bd');
      elipse(c, -12, 5, 6, 7.5); pinta(c, '#9be36a', 2.5); elipse(c, 12, 5, 6, 7.5); pinta(c, '#9be36a', 2.5);
      elipse(c, -12, 5, 1.8, 6); pinta(c, TINTA); elipse(c, 12, 5, 1.8, 6); pinta(c, TINTA);
      c.beginPath(); c.moveTo(-4, 14); c.lineTo(4, 14); c.lineTo(0, 19); c.closePath(); pinta(c, '#ff6f91', 2);
      c.beginPath(); c.moveTo(-7, 22); c.quadraticCurveTo(-3, 26, 0, 21); c.quadraticCurveTo(3, 26, 7, 22); c.lineWidth = 2.5; c.strokeStyle = TINTA; c.stroke();
      c.lineWidth = 1.8; [[-14, 17, -36, 13], [-14, 21, -36, 23], [14, 17, 36, 13], [14, 21, 36, 23]].forEach(function (s) {
        c.beginPath(); c.moveTo(s[0], s[1]); c.lineTo(s[2], s[3]); c.stroke(); });
    } else {                     // cachorro bege de orelhas caídas
      elipse(c, 0, 8, 28, 30); pinta(c, '#e8c28e', 3.5);
      elipse(c, 13, 0, 9, 10); pinta(c, '#a8703c');
      elipse(c, -30, 6, 10, 22, 0.25); pinta(c, '#8a5530', 3.5); elipse(c, 30, 6, 10, 22, -0.25); pinta(c, '#8a5530', 3.5);
      elipse(c, 0, 22, 17, 13); pinta(c, '#fff3dc', 3);
      elipse(c, -11, 2, 3.8, 5); pinta(c, TINTA); elipse(c, 12, 2, 3.8, 5); pinta(c, TINTA);
      circulo(c, -10, 0.5, 1.3); pinta(c, '#fff'); circulo(c, 13, 0.5, 1.3); pinta(c, '#fff');
      elipse(c, 0, 15, 7, 5); pinta(c, TINTA);
      c.beginPath(); c.moveTo(-6, 26); c.quadraticCurveTo(-6, 38, 0, 38); c.quadraticCurveTo(6, 38, 6, 26); pinta(c, '#ff6f91', 2.5);
      c.beginPath(); c.moveTo(-9, 24); c.quadraticCurveTo(0, 30, 9, 24); c.lineWidth = 2.5; c.strokeStyle = TINTA; c.stroke();
    }
    c.restore();
    circulo(c, x, y, r - lw / 2); c.lineWidth = lw; c.strokeStyle = TINTA; c.stroke();
    c.restore();
  }

  // perfil do pino (fração da altura, meia largura em metros) — altura de 38 cm
  var PERFIL = [[0, .026], [.07, .041], [.17, .055], [.29, .0605], [.41, .056], [.53, .043], [.63, .027], [.69, .0235], [.77, .027], [.86, .0325], [.93, .030], [.985, .016], [1, 0]];
  var ESC_PINO = 1.25;   // o pino desenhado é um pouco maior que o círculo da física (fica mais legível)
  function caminhoPino(c, k) {
    var h = 0.38 * k, i, a, b, pts = [];
    for (i = 0; i < PERFIL.length; i++) pts.push([-PERFIL[i][1] * k, -PERFIL[i][0] * h]);
    for (i = PERFIL.length - 2; i >= 0; i--) pts.push([PERFIL[i][1] * k, -PERFIL[i][0] * h]);
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i < pts.length - 1; i++) { a = pts[i]; b = pts[i + 1]; c.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
    c.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]); c.closePath();
  }
  function desenharPino(c, k, alfa) {
    var h = 0.38 * k, g;
    c.globalAlpha = alfa;
    caminhoPino(c, k);
    g = c.createLinearGradient(-0.065 * k, 0, 0.065 * k, 0);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.42, '#f6f5f0'); g.addColorStop(0.8, '#d6d8e2'); g.addColorStop(1, '#aab0c2');
    c.fillStyle = g; c.fill();
    c.save(); c.clip();
    c.fillStyle = '#e3342f';
    c.fillRect(-k * 0.07, -h * 0.665, k * 0.14, h * 0.032);
    c.fillRect(-k * 0.07, -h * 0.615, k * 0.14, h * 0.032);
    c.fillStyle = 'rgba(255,255,255,.9)';
    elipse(c, -0.028 * k, -0.3 * h, 0.009 * k, 0.09 * h); c.fill();
    elipse(c, -0.012 * k, -0.875 * h, 0.006 * k, 0.03 * h); c.fill();
    c.restore();
    caminhoPino(c, k); c.lineWidth = Math.max(0.7, k * 0.0045); c.strokeStyle = TINTA; c.stroke();
    c.globalAlpha = 1;
  }
  function desenharBola(c, x, y, r, cor, giro, alfa) {
    var g = c.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.06, x, y, r * 1.02), i, p, cy, sy, cz;
    c.globalAlpha = alfa === undefined ? 1 : alfa;
    g.addColorStop(0, cor[0]); g.addColorStop(0.38, cor[1]); g.addColorStop(1, cor[2]);
    circulo(c, x, y, r); c.fillStyle = g; c.fill();
    // furos dos dedos: giram com a bola (rolando para a frente, saem por cima)
    var furos = [[-0.24, 0.42], [0.2, 0.42], [-0.02, 0.06]];
    for (i = 0; i < furos.length; i++) {
      p = furos[i];
      var px = Math.sin(p[0]) * Math.cos(p[1]), py = Math.sin(p[1]), pz = Math.cos(p[0]) * Math.cos(p[1]);
      cy = py * Math.cos(giro) - pz * Math.sin(giro); cz = py * Math.sin(giro) + pz * Math.cos(giro);
      if (cz < 0.12) continue;
      sy = r * 0.13 * cz;
      elipse(c, x + px * r * 0.95, y - cy * r * 0.95, r * 0.12 * Math.sqrt(Math.max(0.05, 1 - px * px)), sy);
      c.fillStyle = 'rgba(5,5,12,.85)'; c.fill();
    }
    c.fillStyle = 'rgba(255,255,255,.6)'; elipse(c, x - r * 0.38, y - r * 0.46, r * 0.22, r * 0.13, -0.6); c.fill();
    c.fillStyle = 'rgba(255,255,255,.9)'; elipse(c, x - r * 0.42, y - r * 0.5, r * 0.08, r * 0.05, -0.6); c.fill();
    circulo(c, x, y, r); c.lineWidth = Math.max(1, r * 0.05); c.strokeStyle = TINTA; c.stroke();
    c.globalAlpha = 1;
  }
  // retícula de pontinhos (quadrinho antigo)
  function padraoPontos(c, cor, passo, raio, dpr) {
    var t = document.createElement('canvas'), n = Math.max(2, Math.round(passo * dpr)), g;
    t.width = n; t.height = n; g = t.getContext('2d'); g.fillStyle = cor;
    circulo(g, n / 4, n / 4, raio * dpr); g.fill(); circulo(g, n * 3 / 4, n * 3 / 4, raio * dpr); g.fill();
    var p = c.createPattern(t, 'repeat');
    if (p && p.setTransform && window.DOMMatrix) p.setTransform(new DOMMatrix().scale(1 / dpr, 1 / dpr));
    return p;
  }
  function retangulo(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }

  /* ======================= estilo do que é DOM (faixa de escolha) ======================= */
  var CSS = '' +
    '.jt-bol{position:absolute;inset:0;overflow:hidden;background:#1a1328}' +
    '.jt-bol-tela{position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none;outline:none;cursor:grab}' +
    '.jt-bol-tela:active{cursor:grabbing}' +
    '.jt-bol-escolha{position:absolute;left:50%;bottom:calc(10px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:min(600px,calc(100% - 16px));' +
    'max-height:calc(100% - 16px);overflow:auto;box-sizing:border-box;padding:12px 14px 14px;color:#1d1a2e;border:3px solid #1d1a2e;border-radius:22px;' +
    'background:#fff3d6 radial-gradient(rgba(240,140,40,.18) 1.4px,transparent 1.6px) 0 0/8px 8px;box-shadow:6px 7px 0 rgba(29,26,46,.88);' +
    'display:flex;flex-direction:column;gap:10px;z-index:3;font-family:Fredoka,system-ui,sans-serif}' +
    '.jt-bol-tit{margin:0;font-size:21px;font-weight:700;text-align:center;line-height:1.1}' +
    '.jt-bol-corpo{display:flex;flex-wrap:wrap;gap:10px 18px;justify-content:center}' +
    '.jt-bol-grupo{display:flex;flex-direction:column;gap:6px;align-items:center;min-width:240px;flex:1 1 240px}' +
    '.jt-bol-rot{font-size:16px;font-weight:600}' +
    '.jt-bol-rot b{color:#c2410c}' +
    '.jt-bol-fila{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}' +
    '.jt-bol-cor{width:42px;height:42px;border-radius:50%;border:3px solid #1d1a2e;padding:0;box-shadow:0 3px 0 #1d1a2e;transition:transform .15s}' +
    '.jt-bol-rosto{width:54px;height:54px;border-radius:50%;border:3px solid transparent;padding:0;background:none;transition:transform .15s}' +
    '.jt-bol-rosto canvas{width:100%;height:100%;display:block;border-radius:50%}' +
    '.jt-bol-cor[aria-pressed="true"],.jt-bol-rosto[aria-pressed="true"]{transform:scale(1.14);outline:4px solid #ff8a1f;outline-offset:2px}' +
    '.jt-bol-baixo{display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap}' +
    '.jt-bol-seg{display:flex;border:3px solid #1d1a2e;border-radius:999px;overflow:hidden;background:#fff}' +
    '.jt-bol-seg button{border:0;min-height:44px;padding:0 14px;font-size:16px;font-weight:600;background:transparent;color:#1d1a2e}' +
    '.jt-bol-seg button+button{border-left:3px solid #1d1a2e}' +
    '.jt-bol-seg button[aria-pressed="true"]{background:#3fb8b3;color:#fff;text-shadow:0 1px 0 #1d1a2e}' +
    '.jt-bol-jogar{min-height:54px;padding:0 30px;border:3px solid #1d1a2e;border-radius:999px;font-size:22px;font-weight:700;color:#3a1d00;' +
    'background:linear-gradient(180deg,#ffe27a,#ffbf2e 55%,#ff9420);box-shadow:0 5px 0 #1d1a2e}' +
    '.jt-bol-jogar:active{transform:translateY(3px);box-shadow:0 2px 0 #1d1a2e}' +
    '.jt-bol-escolha button:focus-visible{outline:4px solid #1f5fd6;outline-offset:2px}' +
    '.jt-bol-ok{position:absolute;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:66px;height:66px;border-radius:50%;' +
    'border:3px solid #1d1a2e;background:radial-gradient(circle at 35% 30%,#8ff0e6,#3fb8b3 55%,#21858b);color:#1fa65a;font:700 40px/1 Fredoka,system-ui,sans-serif;' +
    'text-shadow:0 2px 0 #1d1a2e,2px 0 0 #1d1a2e,-2px 0 0 #1d1a2e,0 -2px 0 #1d1a2e;box-shadow:0 5px 0 #1d1a2e;z-index:2;padding:0}' +
    '.jt-bol-ok:active{transform:translateX(-50%) translateY(3px);box-shadow:0 2px 0 #1d1a2e}' +
    '.jt-bol-ok:focus-visible{outline:4px solid #ffcf4a;outline-offset:3px}' +
    '@media (max-height:520px){.jt-bol-escolha{padding:8px 12px 10px;gap:6px;width:min(860px,calc(100% - 16px))}.jt-bol-tit{font-size:18px}' +
    '.jt-bol-cor{width:36px;height:36px}.jt-bol-rosto{width:44px;height:44px}.jt-bol-jogar{min-height:46px;font-size:20px}}' +
    '@media (prefers-reduced-motion:reduce){.jt-bol-cor,.jt-bol-rosto{transition:none}}';
  function injetarEstilo() {
    if (document.getElementById('jt-boliche-css')) return;
    var s = document.createElement('style'); s.id = 'jt-boliche-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ======================= o jogo ======================= */
  function iniciar(palco, ctx) {
    var t = ctx.t, nivel = NIVEIS[ctx.nivel] ? ctx.nivel : 'facil', NV = NIVEIS[nivel], calmo = !!ctx.calmo;
    var IDX = ctx.lingua === 'en' ? 1 : ctx.lingua === 'es' ? 2 : 0;
    injetarEstilo();
    var raiz = document.createElement('div'); raiz.className = 'jt-bol';
    var tela = document.createElement('canvas'); tela.className = 'jt-bol-tela'; tela.tabIndex = 0;
    tela.setAttribute('role', 'img');
    tela.setAttribute('aria-label', t('Pista de boliche. Toque na bola e empurre para os pinos.', 'Bowling lane. Touch the ball and push it to the pins.', 'Pista de bolos. Toca la bola y empújala hacia los bolos.'));
    raiz.appendChild(tela); palco.appendChild(raiz);
    var btOk = document.createElement('button'); btOk.type = 'button'; btOk.className = 'jt-bol-ok'; btOk.hidden = true; btOk.textContent = '✓';
    btOk.setAttribute('aria-label', t('Continuar', 'Continue', 'Continuar'));
    btOk.addEventListener('click', function () { continuar(); });
    raiz.appendChild(btOk);
    var c = tela.getContext('2d');
    var fundo = document.createElement('canvas'), hud = document.createElement('canvas'), placarCv = document.createElement('canvas');

    // escolha guardada no aparelho
    var salvo = ctx.ler('escolha') || {};
    var esc = { nj: salvo.nj === 2 ? 2 : 1, j: [{ cor: 1, rosto: 0 }, { cor: 0, rosto: 2 }] };
    if (salvo.j && salvo.j.length) for (var q = 0; q < 2; q++) if (salvo.j[q]) {
      esc.j[q].cor = clamp(salvo.j[q].cor | 0, 0, CORES.length - 1); esc.j[q].rosto = clamp(salvo.j[q].rosto | 0, 0, 3);
    }

    var J = {
      fase: 'escolha', jogadores: [], vez: 0, emPe: [], pinos: [], lance: null, xBola: 0, mira: null,
      tOsc: 0, oscilando: false, zoom: 0, tPlacar: 0, prox: 0, encerrou: false, arrumado: false, msg: null, varrer: 0, espera: 0, tremor: 0, sons: 0, ultSom: 0, fimAvisado: false, giroParado: 0
    };
    function novoRack(animar) {
      var i; J.emPe = []; J.pinos = [];
      for (i = 0; i < 10; i++) { J.emPe.push(true); J.pinos.push({ n: i, x: POS[i].x, z: POS[i].z, emPe: true, queda: 0, fx: 0, fz: 1, fora: false, tremor: 0, descer: animar && !calmo ? 1 + (POS[i].fila * 0.12) : 0 }); }
    }
    function montarJogadores() {
      J.jogadores = [];
      for (var i = 0; i < esc.nj; i++) J.jogadores.push({ lances: [], cor: esc.j[i].cor, rosto: esc.j[i].rosto });
      J.vez = 0; novoRack(false);
    }
    montarJogadores();
    function jogadorAtual() { return J.jogadores[J.vez]; }
    function quemJoga() {   // quem tem menos quadros feitos; empate: o de número menor
      var m = -1, mq = 99, i, s;
      for (i = 0; i < J.jogadores.length; i++) { s = situacao(J.jogadores[i].lances); if (!s.acabou && s.quadro < mq) { mq = s.quadro; m = i; } }
      return m;
    }

    /* ---------- medidas e câmera ---------- */
    var L = {}, dpr = 1;
    function medir() {
      var r = palco.getBoundingClientRect(), W = Math.max(200, Math.round(r.width)), H = Math.max(200, Math.round(r.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      [tela, fundo, hud].forEach(function (cv) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); });
      L = { W: W, H: H, retrato: H > W * 1.1 };
      // placar (faixa que aparece por cima da pista no fim de cada jogada)
      var nj = J.jogadores.length; L.J2 = nj > 1; var wc = Math.min(W - 16, 1000), linhaH = clamp(H * 0.1 / (nj === 2 ? 1.25 : 1), 34, 64);
      var av = linhaH, tt = linhaH * 1.35, cw = (wc - av - tt - 8) / 10.5, duas = cw < 40;
      if (duas) { linhaH = clamp(H * 0.048, 32, 46); av = linhaH * 1.35; tt = linhaH * 1.45; cw = (wc - av - tt - 8) / 5.3; }
      var bloco = duas ? linhaH * 2 : linhaH;
      L.card = { x: 0, y: 0, w: wc, h: nj * bloco + (nj - 1) * 5 + 8, linhaH: linhaH, av: av, tt: tt, cw: cw, duas: duas, bloco: bloco };
      placarCv.width = Math.round((wc + 8) * dpr); placarCv.height = Math.round((L.card.h + 9) * dpr);
      L.ind = clamp(H * 0.068, 32, 64);
      L.painel = L.ind * 2 + 16;
      var yTopo = L.painel + Math.max(6, H * 0.012), yPerto = H - (L.retrato ? H * 0.13 : H * 0.1);
      var wPerto = L.retrato ? W * 0.88 : Math.min(W * 0.56, (yPerto - yTopo) * 2.6);
      var qq = L.retrato ? 0.3 : 0.22, zb = CAB + 0.79, hb = 0.38 * ESC_PINO;
      var D = qq * zb / (1 - qq), s0 = wPerto / (2 * MEIA), f = s0 * D, sb = f / (D + zb);
      var camH = Math.max(0.25, (yPerto - yTopo - hb * sb) / (s0 - sb));
      L.cam = { cx: W / 2, D: D, f: f, camH: camH, yH: yPerto - camH * s0 };
      L.zBaixo = Math.max(-D + 0.4, L.cam.f / ((H + 4 - L.cam.yH) / camH) - D);
      desenharFundo(); desenharHUD();
    }
    function proj(x, z, h) {
      var d = L.cam.D + z, s = L.cam.f / d;
      return { x: L.cam.cx + x * s, y: L.cam.yH + (L.cam.camH - (h || 0)) * s, s: s };
    }
    function quad(g, x1, x2, z1, z2, h1, h2) {
      var a = proj(x1, z1, h1), b = proj(x2, z1, h1), d = proj(x2, z2, h2 === undefined ? h1 : h2), e = proj(x1, z2, h2 === undefined ? h1 : h2);
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(d.x, d.y); g.lineTo(e.x, e.y); g.closePath();
    }
    function gradZ(g, z1, z2, c1, c2) { var a = proj(0, z1), b = proj(0, z2), gr = g.createLinearGradient(0, a.y, 0, b.y); gr.addColorStop(0, c1); gr.addColorStop(1, c2); return gr; }

    /* ---------- cenário fixo (desenhado uma vez a cada mudança de tamanho) ---------- */
    function desenharPista(g, ox, minha) {
      var zb = L.zBaixo, i, x, z;
      // canaletas
      quad(g, ox - BORDA, ox - MEIA, zb, FIM); g.fillStyle = gradZ(g, 0, FIM, minha ? '#c9622c' : '#a94a22', minha ? '#7e2f18' : '#6a2513'); g.fill();
      quad(g, ox + MEIA, ox + BORDA, zb, FIM); g.fill();
      g.fillStyle = 'rgba(60,15,5,.35)';
      quad(g, ox - BORDA + 0.06, ox - MEIA - 0.05, zb, FIM); g.fill(); quad(g, ox + MEIA + 0.05, ox + BORDA - 0.06, zb, FIM); g.fill();
      // pista
      quad(g, ox - MEIA, ox + MEIA, 0, FIM);
      g.fillStyle = minha ? gradZ(g, 0, FIM, '#ffc24a', '#f0662c') : gradZ(g, 0, FIM, '#ee9a3c', '#c84e24'); g.fill();
      // tábuas
      g.lineWidth = 1;
      for (i = 1; i < 10; i++) {
        x = ox - MEIA + i * (2 * MEIA / 10);
        var a = proj(x, 0), b = proj(x, FIM);
        g.strokeStyle = i % 2 ? 'rgba(255,240,200,.16)' : 'rgba(140,50,10,.12)';
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      }
      // brilho do fundo da pista
      quad(g, ox - MEIA, ox + MEIA, CAB * 0.55, FIM); g.fillStyle = gradZ(g, CAB * 0.55, FIM, 'rgba(255,255,255,0)', 'rgba(255,236,200,.28)'); g.fill();
      // setas e pontinhos de mira
      g.fillStyle = minha ? 'rgba(170,58,18,.75)' : 'rgba(130,40,12,.6)';
      for (i = -3; i <= 3; i++) {
        x = ox + i * 0.13; z = 4.4 + Math.abs(i) * 0.32;
        var p1 = proj(x - 0.03, z), p2 = proj(x + 0.03, z), p3 = proj(x, z + 0.42);
        g.beginPath(); g.moveTo(p1.x, p1.y); g.lineTo(p2.x, p2.y); g.lineTo(p3.x, p3.y); g.closePath(); g.fill();
        var pd = proj(x, 2.1); elipse(g, pd.x, pd.y, 0.018 * pd.s, 0.008 * pd.s); g.fill();
      }
      // bordas da pista
      g.strokeStyle = 'rgba(70,20,6,.7)'; g.lineWidth = Math.max(1, L.W / 600);
      [ox - MEIA, ox + MEIA].forEach(function (xx) { var a = proj(xx, zb), b = proj(xx, FIM); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); });
      // fundo da pista (onde ficam os pinos) e área de aproximação
      quad(g, ox - MEIA, ox + MEIA, CAB - 0.25, FIM); g.fillStyle = 'rgba(255,215,160,.12)'; g.fill();
      quad(g, ox - BORDA, ox + BORDA, zb, 0); g.fillStyle = minha ? gradZ(g, zb, 0, '#ffd877', '#ffc24a') : gradZ(g, zb, 0, '#f1b65a', '#e59a3c'); g.fill();
      quad(g, ox - BORDA, ox + BORDA, -0.025, 0.025); g.fillStyle = '#dff7da'; g.fill(); g.strokeStyle = 'rgba(29,26,46,.55)'; g.lineWidth = 1; g.stroke();
      // paredes laterais do fundo (onde os pinos batem)
      [[-1, ox - BORDA], [1, ox + BORDA]].forEach(function (s) {
        var a = proj(s[1], CAB - 0.4, 0), b = proj(s[1], FIM, 0), d = proj(s[1], FIM, 0.5), e = proj(s[1], CAB - 0.4, 0.5);
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(d.x, d.y); g.lineTo(e.x, e.y); g.closePath();
        g.fillStyle = (s[1] - ox) * (ox + s[1]) > 0 && Math.abs(s[1]) > 1 ? '#1f6f78' : '#2f9da3'; g.fill();
        g.strokeStyle = 'rgba(29,26,46,.5)'; g.lineWidth = 1; g.stroke();
      });
    }
    function desenharDivisor(g, x1, x2) {
      var zb = L.zBaixo, hh = 0.09, meio = (x1 + x2) / 2;
      // lado que a câmera vê
      var xs = meio > 0 ? x1 : x2;
      var a = proj(xs, zb, 0), b = proj(xs, FIM, 0), d = proj(xs, FIM, hh), e = proj(xs, zb, hh);
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(d.x, d.y); g.lineTo(e.x, e.y); g.closePath(); g.fillStyle = '#1d6f79'; g.fill();
      quad(g, x1, x2, zb, FIM, hh); g.fillStyle = gradZ(g, 0, FIM, '#46cbc6', '#2d9aa0'); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
      quad(g, x1 + 0.03, x1 + 0.06, zb, FIM, hh); g.fillStyle = 'rgba(255,255,255,.75)'; g.fill();
      // poste no fundo
      var p1 = proj(x1, FIM, 0), p2 = proj(x2, FIM, 0);
      var gr = g.createLinearGradient(p1.x, 0, p2.x, 0); gr.addColorStop(0, '#7fe3dc'); gr.addColorStop(0.3, '#3fb8b3'); gr.addColorStop(1, '#23858c');
      g.fillStyle = gr; g.fillRect(p1.x, 0, p2.x - p1.x, p1.y); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.strokeRect(p1.x, -2, p2.x - p1.x, p1.y + 2);
      g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(p1.x + (p2.x - p1.x) * 0.16, 0, Math.max(1, (p2.x - p1.x) * 0.12), p1.y);
    }
    function desenharFundo() {
      var g = fundo.getContext('2d'), k, i;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      var gr = g.createLinearGradient(0, 0, 0, L.H); gr.addColorStop(0, '#120c20'); gr.addColorStop(1, '#2a1838');
      g.fillStyle = gr; g.fillRect(0, 0, L.W, L.H);
      var pa = proj(0, 0); g.fillStyle = '#f3b552'; g.fillRect(0, pa.y, L.W, L.H - pa.y);   // chão da área de aproximação
      // a "boca" escura onde os pinos ficam, com uma luz de cima
      var pf = proj(0, FIM);
      var luz = g.createRadialGradient(L.W / 2, L.painel, 4, L.W / 2, L.painel, Math.max(80, (pf.y - L.painel) * 4));
      luz.addColorStop(0, 'rgba(120,200,210,.28)'); luz.addColorStop(1, 'rgba(120,200,210,0)');
      g.fillStyle = luz; g.fillRect(0, 0, L.W, pf.y + 2);
      // parede verde do lado esquerdo, atrás das pistas (tela deitada)
      if (!L.retrato) {
        var xw = proj(-PASSO * 1.5, FIM).x, gv = g.createLinearGradient(0, 0, xw, pf.y);
        gv.addColorStop(0, '#a6d652'); gv.addColorStop(1, '#5a9628');
        g.beginPath(); g.moveTo(0, 0); g.lineTo(xw - L.W * 0.05, 0); g.quadraticCurveTo(xw, 0, xw, L.painel + (pf.y - L.painel) * 0.5);
        g.lineTo(xw, pf.y + 2); g.lineTo(0, pf.y + 2); g.closePath(); g.fillStyle = gv; g.fill();
        g.save(); g.clip(); g.fillStyle = padraoPontos(g, 'rgba(30,70,10,.25)', 6, 1.3, dpr); g.fillRect(0, 0, xw, pf.y + 2); g.restore();
        g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
      }
      for (k = -3; k <= 3; k++) desenharPista(g, k * PASSO, k === 0);
      for (k = -3; k <= 2; k++) desenharDivisor(g, k * PASSO + BORDA, (k + 1) * PASSO - BORDA);
      // pinos das pistas vizinhas (enfeite)
      for (k = -3; k <= 3; k++) {
        if (k === 0) continue;
        for (i = 9; i >= 0; i--) {
          var p = proj(k * PASSO + POS[i].x, POS[i].z), kk = p.s * ESC_PINO;
          if (p.x < -40 || p.x > L.W + 40) continue;
          g.save(); g.translate(p.x, p.y); g.scale(1, -0.55); desenharPino(g, kk, 0.18); g.restore();
          g.save(); g.translate(p.x, p.y); desenharPino(g, kk, 0.92); g.restore();
        }
      }
      // retícula e cantos escurecidos
      g.fillStyle = padraoPontos(g, 'rgba(255,240,210,.16)', 7, 1.35, dpr); g.fillRect(0, pf.y, L.W, L.H - pf.y);
      g.fillStyle = padraoPontos(g, 'rgba(120,200,210,.07)', 7, 1.35, dpr); g.fillRect(0, 0, L.W, pf.y);
      g.fillStyle = padraoPontos(g, 'rgba(90,25,5,.10)', 11, 2.2, dpr); g.fillRect(0, pf.y, L.W, L.H - pf.y);
      var vg = g.createRadialGradient(L.W / 2, L.H * 0.62, Math.min(L.W, L.H) * 0.3, L.W / 2, L.H * 0.62, Math.max(L.W, L.H) * 0.85);
      vg.addColorStop(0, 'rgba(20,8,30,0)'); vg.addColorStop(1, 'rgba(20,8,30,.42)');
      g.fillStyle = vg; g.fillRect(0, 0, L.W, L.H);
    }

    /* ---------- painel de cima e placar ---------- */
    function desenharIndicador(g, cx, tam, num, minha) {
      var sp = tam / 4.2, i, r, raio = tam * 0.36, yc = 6 + raio;
      circulo(g, cx + 2, yc + 3, raio); g.fillStyle = 'rgba(15,40,50,.45)'; g.fill();
      circulo(g, cx, yc, raio); g.fillStyle = '#fbf6e6'; g.fill(); g.lineWidth = Math.max(1.5, tam * 0.055); g.strokeStyle = TINTA; g.stroke();
      g.fillStyle = TINTA; g.font = '700 ' + Math.round(raio * 1.3) + 'px Fredoka, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(String(num), cx, yc + raio * 0.07);
      var yT = yc + raio + 4 + sp * 0.45;
      for (i = 0; i < 10; i++) {
        r = POS[i];
        var px = cx + (r.col - r.fila / 2) * sp * 1.05, py = yT + (3 - r.fila) * sp * 0.9, aceso = minha && J.emPe[i];
        circulo(g, px, py, sp * 0.37);
        if (aceso) { g.shadowColor = '#c8fff6'; g.shadowBlur = sp * 0.9; g.fillStyle = '#e2fffa'; } else g.fillStyle = '#123840';
        g.fill(); g.shadowBlur = 0;
      }
      // os 2 pontinhos: qual bola da jogada é
      var s = minha ? situacao(jogadorAtual().lances) : { bola: -1 };
      for (i = 0; i < 2; i++) {
        circulo(g, cx + tam * 0.66 + i * sp * 0.95, yT + sp * 2.4, sp * 0.3);
        var aceso2 = minha && J.fase !== 'escolha' && (s.bola === i || (s.bola === 2 && i === 1));
        if (aceso2) { g.shadowColor = '#c8fff6'; g.shadowBlur = sp * 0.8; g.fillStyle = '#e2fffa'; } else g.fillStyle = '#123840';
        g.fill(); g.shadowBlur = 0;
      }
    }
    function desenharPlacar(g) {
      var cd = L.card, nj = J.jogadores.length, p, i, k;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, cd.w + 8, cd.h + 9);
      retangulo(g, cd.x + 4, cd.y + 5, cd.w, cd.h, 12); g.fillStyle = 'rgba(15,35,45,.45)'; g.fill();
      retangulo(g, cd.x, cd.y, cd.w, cd.h, 12); g.fillStyle = '#fbf8ee'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
      var fonte = 'Fredoka, system-ui, sans-serif';
      for (p = 0; p < nj; p++) {
        var jog = J.jogadores[p], y0 = cd.y + 4 + p * (cd.bloco + 5), ativo = p === J.vez && nj > 1 && J.fase !== 'fim';
        var mk = marcas(jog.lances), tot = pontuar(jog.lances), sit = situacao(jog.lances);
        if (ativo) { retangulo(g, cd.x + 3, y0 - 1, cd.w - 6, cd.bloco + 2, 9); g.fillStyle = 'rgba(255,207,74,.35)'; g.fill(); }
        if (nj > 1 && p !== J.vez) g.globalAlpha = 0.72;
        var ra = Math.min(cd.av, cd.bloco) * 0.42;
        desenharRosto(g, jog.rosto, cd.x + cd.av / 2 + 2, y0 + cd.bloco / 2, ra);
        if (nj > 1) {
          circulo(g, cd.x + cd.av / 2 + 2 + ra * 0.78, y0 + cd.bloco / 2 + ra * 0.78, ra * 0.38); g.fillStyle = '#ffcf4a'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = TINTA; g.stroke();
          g.fillStyle = TINTA; g.font = '700 ' + Math.round(ra * 0.5) + 'px ' + fonte; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText(String(p + 1), cd.x + cd.av / 2 + 2 + ra * 0.78, y0 + cd.bloco / 2 + ra * 0.8);
        }
        for (i = 0; i < 10; i++) {
          var linha = cd.duas && i >= 5 ? 1 : 0, col = cd.duas ? i % 5 : i;
          var fx = cd.x + cd.av + 4 + col * cd.cw, fy = y0 + linha * cd.linhaH, fw = i === 9 ? cd.cw * (cd.duas ? 1.3 : 1.5) : cd.cw, fh = cd.linhaH;
          var atual = !sit.acabou && sit.quadro === i && p === J.vez && J.fase !== 'escolha';
          g.fillStyle = atual ? '#fff0b0' : '#ffffff'; g.fillRect(fx, fy, fw, fh);
          var nb = i === 9 ? 3 : 2, bw = Math.min(fh * 0.46, fw / (nb + 0.6)), bh = fh * 0.46;
          for (k = 0; k < nb; k++) {
            var bx = fx + fw - (nb - k) * bw;
            if (k > 0 || i === 9) { g.fillStyle = '#bfe9e4'; g.fillRect(bx, fy, bw, bh); }
            g.strokeStyle = 'rgba(29,26,46,.55)'; g.lineWidth = 1; g.strokeRect(bx + 0.5, fy + 0.5, bw, bh);
          }
          g.fillStyle = TINTA; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.font = '700 ' + Math.round(bh * 0.78) + 'px ' + fonte;
          for (k = 0; k < mk[i].length; k++) {
            var cx2 = i === 9 ? fx + fw - (3 - k) * bw + bw / 2 : (k === 0 ? fx + fw - 2 * bw + bw / 2 : fx + fw - bw / 2);
            var mm = mk[i][k];
            if (!mm) continue;
            g.fillStyle = mm === 'X' ? '#d6301f' : mm === '/' ? '#1f5fd6' : TINTA;
            g.fillText(mm, cx2, fy + bh / 2 + 1);
          }
          if (tot[i] !== null) {
            g.fillStyle = TINTA; g.font = '700 ' + Math.round((fh - bh) * 0.66) + 'px ' + fonte;
            g.fillText(String(tot[i]), fx + fw / 2, fy + bh + (fh - bh) / 2 + 1);
          }
          g.fillStyle = 'rgba(29,26,46,.4)'; g.font = '600 ' + Math.round(bh * 0.5) + 'px ' + fonte; g.textAlign = 'left';
          g.fillText(String(i + 1), fx + 3, fy + bh * 0.42);
          g.strokeStyle = TINTA; g.lineWidth = 1.3; g.strokeRect(fx, fy, fw, fh);
        }
        // total
        var tx = cd.x + cd.w - cd.tt - 2;
        g.fillStyle = '#1f3c8f'; g.fillRect(tx, y0, cd.tt - 2, cd.bloco); g.strokeStyle = TINTA; g.lineWidth = 1.3; g.strokeRect(tx, y0, cd.tt - 2, cd.bloco);
        g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '700 ' + Math.round(Math.min(cd.tt * 0.42, cd.bloco * 0.5)) + 'px ' + fonte;
        g.fillText(String(total(jog.lances)), tx + cd.tt / 2 - 1, y0 + cd.bloco / 2 + 1);
        g.globalAlpha = 1;
      }
    }
    function desenharHUD() {
      var g = hud.getContext('2d'), k, P = L.painel, xi = L.retrato ? 0 : Math.round(L.W * 0.06), R = P * 0.75;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, L.W, L.H);
      var sombra = g.createLinearGradient(0, P, 0, P + 16); sombra.addColorStop(0, 'rgba(0,0,0,.5)'); sombra.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = sombra; g.fillRect(xi, P, L.W - xi, 16);
      // o painel (com a ponta esquerda arredondada quando há parede)
      g.beginPath(); g.moveTo(xi, -2); g.lineTo(L.W, -2); g.lineTo(L.W, P);
      if (xi) { g.lineTo(xi + R, P); g.quadraticCurveTo(xi, P, xi, P - R); } else g.lineTo(0, P);
      g.closePath();
      g.save(); g.clip();
      var gr = g.createLinearGradient(0, 0, 0, P); gr.addColorStop(0, '#62d0c9'); gr.addColorStop(1, '#3aa1a5');
      g.fillStyle = gr; g.fillRect(0, 0, L.W, P);
      for (k = 0; k < 6; k++) {   // manchas claras (papel envelhecido)
        var mx = L.W * ((k * 0.37 + 0.11) % 1), my = P * ((k * 0.61 + 0.3) % 1), mr = Math.max(60, L.W * 0.18);
        var m = g.createRadialGradient(mx, my, 0, mx, my, mr); m.addColorStop(0, 'rgba(255,255,240,.14)'); m.addColorStop(1, 'rgba(255,255,240,0)');
        g.fillStyle = m; g.fillRect(0, 0, L.W, P);
      }
      g.fillStyle = padraoPontos(g, 'rgba(10,60,70,.22)', 6, 1.25, dpr); g.fillRect(0, 0, L.W, P);
      g.restore();
      g.lineWidth = 3; g.strokeStyle = '#1b3440'; g.stroke();
      g.fillStyle = 'rgba(160,245,236,.7)'; g.fillRect(xi + (xi ? R : 0), P - 6, L.W, 2);
      // placarzinho de cada jogador (rosto + pontos), no canto
      var chW = L.ind * 2.1, chH = L.J2 ? L.ind * 0.86 : L.ind * 1.1, x0 = xi + (xi ? R * 0.55 : 8), fonte = 'Fredoka, system-ui, sans-serif';
      for (k = 0; k < J.jogadores.length; k++) {
        var yy = J.jogadores.length > 1 ? 6 + k * (chH + 6) : (P - chH) / 2, jog = J.jogadores[k], at = k === J.vez && J.jogadores.length > 1;
        retangulo(g, x0 + 3, yy + 4, chW, chH, chH / 2); g.fillStyle = 'rgba(15,40,50,.45)'; g.fill();
        retangulo(g, x0, yy, chW, chH, chH / 2); g.fillStyle = at ? '#ffe9a0' : '#fbf6e6'; g.fill(); g.lineWidth = at ? 3 : 2; g.strokeStyle = TINTA; g.stroke();
        desenharRosto(g, jog.rosto, x0 + chH / 2, yy + chH / 2, chH / 2 - 3);
        g.fillStyle = TINTA; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 ' + Math.round(chH * 0.5) + 'px ' + fonte;
        g.fillText(String(total(jog.lances)), x0 + chH + (chW - chH) / 2 - 2, yy + chH / 2 + 1);
      }
      var limite = x0 + chW + L.ind * 0.5;
      // números das pistas com os pinos acesos (o da sua pista mostra os que ainda estão de pé)
      for (k = -3; k <= 3; k++) {
        var xc = proj(k * PASSO, CAB).x;
        if (k !== 0 && (xc - L.ind * 0.7 < limite || xc > L.W - L.ind * 0.4)) continue;
        desenharIndicador(g, xc, L.ind, 3 + k, k === 0);
      }
      desenharPlacar(placarCv.getContext('2d'));
    }

    /* ---------- faixa de escolha (antes da primeira bola) ---------- */
    var faixa = null, editando = 0;
    function montarFaixa() {
      faixa = document.createElement('div'); faixa.className = 'jt-bol-escolha';
      faixa.setAttribute('role', 'dialog'); faixa.setAttribute('aria-label', t('Escolha antes de jogar', 'Choose before you play', 'Elige antes de jugar'));
      var h = '<p class="jt-bol-tit">' + t('🎳 Escolha sua bola e seu rosto', '🎳 Pick your ball and your face', '🎳 Elige tu bola y tu cara') + '</p>' +
        '<div class="jt-bol-baixo jt-bol-quem" hidden><div class="jt-bol-seg">' +
        '<button type="button" data-quem="0">' + t('Jogador 1', 'Player 1', 'Jugador 1') + '</button>' +
        '<button type="button" data-quem="1">' + t('Jogador 2', 'Player 2', 'Jugador 2') + '</button></div></div>' +
        '<div class="jt-bol-corpo"><div class="jt-bol-grupo"><span class="jt-bol-rot">' + t('Bola', 'Ball', 'Bola') + ': <b class="jt-bol-nc"></b></span><div class="jt-bol-fila">';
      CORES.forEach(function (cr, i) {
        h += '<button type="button" class="jt-bol-cor" data-cor="' + i + '" aria-label="' + cr.n[IDX] + '" style="background:radial-gradient(circle at 34% 30%,' +
          cr.c[0] + ' 0,' + cr.c[1] + ' 42%,' + cr.c[2] + ' 100%)"></button>';
      });
      h += '</div></div><div class="jt-bol-grupo"><span class="jt-bol-rot">' + t('Rosto', 'Face', 'Cara') + ': <b class="jt-bol-nr"></b></span><div class="jt-bol-fila">';
      ROSTOS.forEach(function (n, i) { h += '<button type="button" class="jt-bol-rosto" data-rosto="' + i + '" aria-label="' + n[IDX] + '"><canvas width="108" height="108"></canvas></button>'; });
      h += '</div></div></div><div class="jt-bol-baixo"><div class="jt-bol-seg" role="group" aria-label="' + t('Jogadores', 'Players', 'Jugadores') + '">' +
        '<button type="button" data-nj="1">👤 ' + t('1 jogador', '1 player', '1 jugador') + '</button>' +
        '<button type="button" data-nj="2">👥 ' + t('2 revezando', '2 taking turns', '2 por turnos') + '</button></div>' +
        '<button type="button" class="jt-bol-jogar">' + t('▶ Jogar', '▶ Play', '▶ Jugar') + '</button></div>';
      faixa.innerHTML = h;
      Array.prototype.forEach.call(faixa.querySelectorAll('.jt-bol-rosto canvas'), function (cv, i) {
        var g = cv.getContext('2d'); desenharRosto(g, i, 54, 54, 50);
      });
      faixa.addEventListener('click', function (ev) {
        var b = ev.target;
        while (b && b !== faixa && b.tagName !== 'BUTTON') b = b.parentNode;   // sem closest(): roda em navegador antigo
        if (!b || b === faixa) return;
        if (b.hasAttribute('data-cor')) { esc.j[editando].cor = +b.getAttribute('data-cor'); ctx.som('toque'); }
        else if (b.hasAttribute('data-rosto')) { esc.j[editando].rosto = +b.getAttribute('data-rosto'); ctx.som('toque'); }
        else if (b.hasAttribute('data-nj')) { esc.nj = +b.getAttribute('data-nj'); if (esc.nj === 1) editando = 0; ctx.som('toque'); }
        else if (b.hasAttribute('data-quem')) { editando = +b.getAttribute('data-quem'); ctx.som('toque'); }
        else if (b.classList.contains('jt-bol-jogar')) { comecarPartida(); return; }
        ctx.gravar('escolha', esc);
        pintarFaixa();
      });
      raiz.appendChild(faixa);
      pintarFaixa();
      setTimeout(function () { var b = faixa && faixa.querySelector('.jt-bol-jogar'); if (b) b.focus(); }, 60);
    }
    function pintarFaixa() {
      if (!faixa) return;
      var e = esc.j[editando];
      faixa.querySelector('.jt-bol-quem').hidden = esc.nj !== 2;
      Array.prototype.forEach.call(faixa.querySelectorAll('[data-cor]'), function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-cor') === e.cor)); });
      Array.prototype.forEach.call(faixa.querySelectorAll('[data-rosto]'), function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-rosto') === e.rosto)); });
      Array.prototype.forEach.call(faixa.querySelectorAll('[data-nj]'), function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-nj') === esc.nj)); });
      Array.prototype.forEach.call(faixa.querySelectorAll('[data-quem]'), function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-quem') === editando)); });
      faixa.querySelector('.jt-bol-nc').textContent = CORES[e.cor].n[IDX];
      faixa.querySelector('.jt-bol-nr').textContent = ROSTOS[e.rosto].join ? ROSTOS[e.rosto][IDX] : '';
      montarJogadores(); J.vez = editando; medir();
    }
    function comecarPartida() {
      ctx.gravar('escolha', esc);
      if (faixa) { raiz.removeChild(faixa); faixa = null; }
      montarJogadores(); medir();
      J.fase = 'mirar'; J.xBola = 0; ctx.som('certo');
      if (J.jogadores.length > 1) mostrarMsg('pilula', vezDe(0), 1.3);
      try { tela.focus({ preventScroll: true }); } catch (e) { tela.focus(); }
    }
    function vezDe(i) { return t('Vez do Jogador ', 'Player ', 'Turno del Jugador ') + (i + 1) + t('!', '’s turn!', '!'); }

    /* ---------- mensagens (STRIKE!, SPARE!, número de pinos) ---------- */
    function mostrarMsg(tipo, txt, dur) { J.msg = { tipo: tipo, txt: txt, t: 0, dur: dur || 1.4 }; }
    function desenharMsg() {
      var m = J.msg; if (!m) return;
      var u = m.t / m.dur, alfa = u > 0.8 ? Math.max(0, (1 - u) / 0.2) : Math.min(1, m.t / 0.12), esc2 = 1;
      if (!calmo) esc2 = m.t < 0.16 ? (m.t / 0.16) * 1.18 : m.t < 0.3 ? 1.18 - (m.t - 0.16) / 0.14 * 0.18 : 1;
      var cx = L.W / 2, cy = L.painel + (L.H - L.painel) * (L.retrato ? 0.62 : 0.66), R = Math.min(L.W * 0.4, (L.H - L.painel) * 0.32);
      c.save(); c.globalAlpha = alfa; c.translate(cx, cy); c.scale(Math.max(0.01, esc2), Math.max(0.01, esc2));
      var fonte = 'Fredoka, system-ui, sans-serif';
      if (m.tipo === 'estouro') {
        c.rotate(-0.07);
        var n = 18, i, a, rr;
        if (!calmo) {   // raios de quadrinho
          c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = Math.max(2, R * 0.025);
          for (i = 0; i < 14; i++) { a = i / 14 * Math.PI * 2 + m.t * 0.6; c.beginPath(); c.moveTo(Math.cos(a) * R * 1.15, Math.sin(a) * R * 0.85); c.lineTo(Math.cos(a) * R * 1.45, Math.sin(a) * R * 1.1); c.stroke(); }
        }
        c.beginPath();
        for (i = 0; i < n * 2; i++) { a = i / (n * 2) * Math.PI * 2; rr = i % 2 ? R * 0.72 : R; c.lineTo(Math.cos(a) * rr * 1.18, Math.sin(a) * rr * 0.82); }
        c.closePath(); c.fillStyle = '#ffd93b'; c.fill(); c.lineWidth = Math.max(3, R * 0.04); c.strokeStyle = TINTA; c.stroke();
        c.save(); c.clip(); c.fillStyle = padraoPontos(c, 'rgba(255,120,30,.35)', 8, 2, dpr); c.fillRect(-R * 1.3, -R, R * 2.6, R * 2); c.restore();
        c.beginPath();
        for (i = 0; i < n * 2; i++) { a = i / (n * 2) * Math.PI * 2 + 0.09; rr = i % 2 ? R * 0.5 : R * 0.66; c.lineTo(Math.cos(a) * rr * 1.18, Math.sin(a) * rr * 0.82); }
        c.closePath(); c.fillStyle = '#ff7b2e'; c.fill();
        var fs = R * 0.36; c.font = '700 ' + Math.round(fs) + 'px ' + fonte;
        while (c.measureText(m.txt).width > R * 2.1 && fs > 12) { fs *= 0.92; c.font = '700 ' + Math.round(fs) + 'px ' + fonte; }
        c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
        c.lineWidth = fs * 0.22; c.strokeStyle = TINTA; c.strokeText(m.txt, 0, fs * 0.05);
        c.fillStyle = '#c81e1e'; c.fillText(m.txt, fs * 0.05, fs * 0.1);
        c.fillStyle = '#fff'; c.fillText(m.txt, 0, 0);
      } else {
        var fs2 = clamp(R * 0.24, 18, 46); c.font = '700 ' + Math.round(fs2) + 'px ' + fonte;
        var w = c.measureText(m.txt).width + fs2 * 1.4, hh = fs2 * 1.7;
        retangulo(c, -w / 2 + 4, -hh / 2 + 5, w, hh, hh / 2); c.fillStyle = 'rgba(29,26,46,.7)'; c.fill();
        retangulo(c, -w / 2, -hh / 2, w, hh, hh / 2); c.fillStyle = '#fff3d6'; c.fill(); c.lineWidth = 3; c.strokeStyle = TINTA; c.stroke();
        c.fillStyle = TINTA; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(m.txt, 0, 1);
      }
      c.restore();
    }

    /* ---------- lançar ---------- */
    function lancar(alvo, forca, efeito) {
      if (J.fase !== 'mirar') return;
      J.oscilando = false; J.mira = null;
      J.lance = criarLance({ x: J.xBola, alvo: alvo, forca: forca, efeito: efeito, nivel: nivel, emPe: J.emPe });
      // os pinos animados do rack ficam no lugar dos da física
      J.antes = 0; for (var i = 0; i < 10; i++) if (J.emPe[i]) J.antes++;
      J.pinos = J.lance.pinos; J.fase = 'rolar'; J.sons = 0; J.msg = null;
      ctx.som('toque');
    }
    function fimDoLance() {
      var e = J.lance, k = derrubados(e), jog = jogadorAtual(), i, msg;
      for (i = 0; i < e.pinos.length; i++) if (!e.pinos[i].emPe) J.emPe[e.pinos[i].n] = false;
      jog.lances.push(k);
      if (J.antes === 10 && k === 10) { msg = ['estouro', t('STRIKE!', 'STRIKE!', '¡PLENO!')]; ctx.som('certo'); }
      else if (J.antes < 10 && k === J.antes) { msg = ['estouro', t('SPARE!', 'SPARE!', '¡SEMIPLENO!')]; ctx.som('certo'); }
      else if (e.caiu && k === 0) { msg = ['pilula', t('Canaleta!', 'Gutter ball!', '¡Al canal!')]; ctx.som('erro'); }
      else if (k === 0) { msg = ['pilula', t('Nenhum pino', 'No pins', 'Ningún bolo')]; ctx.som('erro'); }
      else msg = ['pilula', k === 1 ? t('1 pino', '1 pin', '1 bolo') : t(k + ' pinos!', k + ' pins!', '¡' + k + ' bolos!')];
      mostrarMsg(msg[0], msg[1], msg[0] === 'estouro' ? 1.5 : 1.1);
      J.fase = 'resultado'; J.espera = msg[0] === 'estouro' ? 1.5 : 1.05;
      desenharHUD();
    }
    function depoisDoResultado() {
      J.fase = 'varrer'; J.varrer = 0; J.arrumado = false;
    }
    // no meio da varrida (pista escura): some quem caiu e quem ficou de pé volta ao lugar; jogada encerrada, sai tudo
    function arrumarPinos() {
      var jog = jogadorAtual(), s = situacao(jog.lances), prox = quemJoga(), i, p, ps = [];
      J.prox = prox; J.encerrou = prox < 0 || prox !== J.vez || s.bola === 0;
      J.rackNovo = !J.encerrou && s.emPe === 10;   // 10ª jogada depois de strike/spare: pinos novos, mesma jogada
      if (!J.encerrou && !J.rackNovo) for (i = 0; i < J.pinos.length; i++) {
        p = J.pinos[i];
        if (!p.emPe || p.fora) continue;
        p.x = POS[p.n].x; p.z = POS[p.n].z; p.vx = p.vz = 0; p.tremor = 0; p.descer = calmo ? 0 : 0.55; ps.push(p);
      }
      J.pinos = ps;
    }
    function depoisDeVarrer() {
      J.lance = null; J.xBola = 0;
      if (J.prox < 0) { terminar(); return; }
      if (J.encerrou) { J.fase = 'placar'; J.tPlacar = 0; btOk.hidden = false; desenharHUD(); setTimeout(function () { if (vivo && !btOk.hidden) btOk.focus(); }, 30); return; }
      if (J.rackNovo) novoRack(true);
      J.fase = 'mirar'; desenharHUD();
    }
    // ✓ depois do placar: começa a próxima jogada
    function continuar() {
      if (J.fase !== 'placar') return;
      btOk.hidden = true; ctx.som('toque');
      J.vez = J.prox; novoRack(true); J.fase = 'mirar';
      if (J.jogadores.length > 1) mostrarMsg('pilula', vezDe(J.vez), 1.2);
      desenharHUD();
      try { tela.focus({ preventScroll: true }); } catch (e) { tela.focus(); }
    }
    function terminar() {
      J.fase = 'fim'; J.tPlacar = 0; desenharHUD();
      if (J.fimAvisado) return; J.fimAvisado = true;
      var chave = 'recorde-' + nivel, rec = +ctx.ler(chave) || 0, pts = J.jogadores.map(function (j) { return total(j.lances); });
      var melhor = Math.max.apply(null, pts), novo = melhor > rec;
      if (novo) ctx.gravar(chave, melhor);
      var pt, en, es;
      if (pts.length === 1) {
        pt = 'Você fez ' + pts[0] + ' pontos!'; en = 'You scored ' + pts[0] + ' points!'; es = '¡Has hecho ' + pts[0] + ' puntos!';
      } else {
        var v = pts[0] === pts[1] ? -1 : pts[0] > pts[1] ? 0 : 1;
        pt = 'Jogador 1: ' + pts[0] + ' pontos · Jogador 2: ' + pts[1] + ' pontos. ' + (v < 0 ? 'Empate!' : 'Vitória do Jogador ' + (v + 1) + '!');
        en = 'Player 1: ' + pts[0] + ' points · Player 2: ' + pts[1] + ' points. ' + (v < 0 ? 'It’s a tie!' : 'Player ' + (v + 1) + ' wins!');
        es = 'Jugador 1: ' + pts[0] + ' puntos · Jugador 2: ' + pts[1] + ' puntos. ' + (v < 0 ? '¡Empate!' : '¡Gana el Jugador ' + (v + 1) + '!');
      }
      if (novo) { pt += ' Novo recorde!'; en += ' New record!'; es += ' ¡Nuevo récord!'; }
      else if (rec) { pt += ' Recorde: ' + rec + '.'; en += ' Record: ' + rec + '.'; es += ' Récord: ' + rec + '.'; }
      setTimeout(function () { if (vivo) ctx.venceu(pt, en, es); }, 500);
    }

    /* ---------- atualizar ---------- */
    function atualizar(dt) {
      var i, p;
      if (J.msg) { J.msg.t += dt; if (J.msg.t > J.msg.dur) J.msg = null; }
      if (J.tremor > 0) J.tremor = Math.max(0, J.tremor - dt * 18);
      for (i = 0; i < J.pinos.length; i++) { p = J.pinos[i]; if (p.descer > 0) p.descer = Math.max(0, p.descer - dt * 2.6); }
      if (J.fase === 'mirar' && J.oscilando) J.tOsc += dt;
      if (J.fase === 'placar' || J.fase === 'fim') J.tPlacar += dt;
      // câmera: chega perto dos pinos enquanto a bola rola e volta para a vista normal depois da varrida
      var alvoZoom = 0;
      if (J.fase === 'rolar') alvoZoom = J.lance.bola.fora ? 1 : clamp((J.lance.bola.z - 1.5) / (CAB * 0.7), 0, 1);
      else if (J.fase === 'resultado' || (J.fase === 'varrer' && J.varrer < 0.75)) alvoZoom = 1;
      J.zoom += (alvoZoom - J.zoom) * (1 - Math.exp(-dt * (alvoZoom > J.zoom ? 2.6 : 3.2)));
      if (J.fase === 'rolar') {
        var e = J.lance, n = Math.max(1, Math.round(dt * 240)), h = dt / n;
        for (i = 0; i < n; i++) passoFisica(e, h);
        for (i = 0; i < e.eventos.length; i++) {
          var ev = e.eventos[i], agora = e.t;
          if (ev === 'impacto') { if (!calmo) J.tremor = clamp(Math.sqrt(e.bola.vz * e.bola.vz) * 0.9, 2, 8); ctx.som('pino'); J.ultSom = agora; J.sons++; }
          else if (ev === 'pino' && J.sons < 5 && agora - J.ultSom > 0.07) { ctx.som('pino'); J.ultSom = agora; J.sons++; }
          else if (ev === 'canaleta') ctx.som('erro');
        }
        e.eventos.length = 0;
        if (lanceAcabou(e)) fimDoLance();
      } else if (J.fase === 'resultado') {
        J.espera -= dt; if (J.espera <= 0) depoisDoResultado();
      } else if (J.fase === 'varrer') {
        J.varrer += dt / (calmo ? 0.5 : 0.85);
        if (J.varrer >= 0.5 && !J.arrumado) { J.arrumado = true; arrumarPinos(); }
        if (J.varrer >= 1) depoisDeVarrer();
      }
    }

    /* ---------- desenhar ---------- */
    function caminhoPista() { quad(c, -BORDA, BORDA, -1, FIM); }
    function alvoAtual() {   // x de mira na altura do pino da frente, enquanto mira (teclado) ou arrasta (dedo)
      if (J.oscilando) return Math.sin(J.tOsc * 2.3) * 0.62;
      if (arrasto && arrasto.ativo && arrasto.tipo === 'lancar') {
        var dx = arrasto.ux - arrasto.x0, dy = arrasto.uy - arrasto.y0;
        if (dy < -12) return clamp(J.xBola + Math.tan(Math.atan2(dx, -dy)) * 1.6, -0.95, 0.95);
      }
      return null;
    }
    function desenharMira() {
      if (J.fase !== 'mirar' || !NV.mira) return;
      var alvo = alvoAtual(); if (alvo === null) return;
      var x0 = J.xBola, dir = (alvo - x0) / (CAB - Z0), zMax = Z0 + (CAB - Z0) * NV.mira, z, x, p, i = 0;
      c.save(); quad(c, -BORDA, BORDA, -1, FIM); c.clip();
      for (z = Z0 + 0.7; z < zMax; z += 0.55, i++) {
        x = x0 + dir * (z - Z0);
        if (NV.protecao) { var lim = MEIA - RB * 0.35; while (Math.abs(x) > lim) x = (x > 0 ? 2 * lim - x : -2 * lim - x); }
        p = proj(x, z);
        elipse(c, p.x, p.y, Math.max(1.5, 0.03 * p.s), Math.max(1, 0.014 * p.s));
        c.fillStyle = 'rgba(255,255,255,' + (0.95 - 0.5 * (z / CAB)) + ')'; c.fill();
        c.lineWidth = 1; c.strokeStyle = 'rgba(29,26,46,.55)'; c.stroke();
      }
      c.restore();
    }
    function desenharObjetos() {
      var lista = [], i, p, e = J.lance, b = e ? e.bola : null, cor = CORES[jogadorAtual().cor].c, varrendo = J.fase === 'varrer';
      for (i = 0; i < J.pinos.length; i++) { p = J.pinos[i]; if (!p.fora) lista.push({ z: p.z, p: p }); }
      var bx, bz, giro;
      if (b && !b.fora) { bx = b.x; bz = b.z; giro = b.giro; }
      else if (J.fase === 'mirar' || J.fase === 'escolha') { bx = J.xBola; bz = Z0; giro = -0.35; }
      if (bz !== undefined) lista.push({ z: bz + 0.001, bola: true });
      lista.sort(function (a, b2) { return b2.z - a.z; });
      // alfa dos caídos durante a varrida
      var alfaCaido = varrendo ? clamp(1 - (J.varrer - 0.2) / 0.35, 0, 1) : 1;
      // reflexos na pista (dentro da pista)
      c.save(); quad(c, -MEIA, MEIA, 0, FIM); c.clip();
      for (i = 0; i < lista.length; i++) {
        if (lista[i].bola) continue;
        p = lista[i].p; if (!p.emPe || p.descer > 0.05) continue;
        var pr = proj(p.x, p.z);
        c.save(); c.translate(pr.x, pr.y); c.scale(1, -0.6); desenharPino(c, pr.s * ESC_PINO, 0.22); c.restore();
      }
      if (bz !== undefined) {
        var pb = proj(bx, bz, 0), rb = RB * pb.s;
        c.save(); c.translate(pb.x, pb.y); c.scale(1, -0.6); desenharBola(c, 0, -rb, rb, cor, giro, 0.25); c.restore();
      }
      c.restore();
      // pinos e bola, do fundo para a frente
      for (i = 0; i < lista.length; i++) {
        if (lista[i].bola) {
          var pg = proj(bx, bz, 0), r = RB * pg.s, canal = b && b.canaleta;
          elipse(c, pg.x, pg.y - r * 0.05, r * 0.95, r * 0.28); c.fillStyle = 'rgba(40,10,5,.35)'; c.fill();
          desenharBola(c, pg.x, pg.y - r + (canal ? r * 0.35 : 0), r, cor, giro, 1);
          continue;
        }
        p = lista[i].p;
        var k = proj(p.x, p.z, 0), kk = k.s * ESC_PINO, alfa = !p.emPe ? alfaCaido : 1;
        if (alfa <= 0) continue;
        var dy = p.descer > 0 ? -(p.descer * p.descer) * 0.9 * k.s : 0;
        if (p.emPe) { elipse(c, k.x, k.y, 0.05 * kk, 0.016 * kk); c.fillStyle = 'rgba(40,10,5,' + (0.3 * alfa) + ')'; c.fill(); }
        c.save(); c.translate(k.x, k.y + dy);
        if (!p.emPe) {
          var qd = p.queda, sy = 1 - qd * Math.abs(p.fz) * (p.fz > 0 ? 0.72 : 1.35);
          c.rotate(qd * (Math.PI / 2) * p.fx * 0.95); c.scale(1, Math.abs(sy) < 0.12 ? (sy < 0 ? -0.12 : 0.12) : sy);
        } else if (p.tremor > 0) c.rotate(Math.sin(relogio * 38) * 0.09 * p.tremor);
        desenharPino(c, kk, alfa);
        c.restore();
      }
      // a varredeira desce na frente dos pinos e o fundo da pista escurece por um instante
      if (varrendo) {
        var esc3 = Math.sin(Math.PI * clamp((J.varrer - 0.15) / 0.75, 0, 1));
        quad(c, -BORDA, BORDA, CAB - 0.4, FIM + 0.4); c.fillStyle = 'rgba(12,6,22,' + (0.78 * esc3) + ')'; c.fill();
        c.fillRect(proj(-BORDA, FIM).x, L.painel - 4, proj(BORDA, FIM).x - proj(-BORDA, FIM).x, proj(0, FIM).y - L.painel + 4);
        var u = J.varrer, alt = 0.62 * (1 - Math.sin(Math.PI * u)) + 0.03;
        quad(c, -BORDA, BORDA, CAB - 0.4, CAB - 0.4, alt, alt + 0.13);
        var a = proj(-BORDA, CAB - 0.4, alt), bb = proj(BORDA, CAB - 0.4, alt + 0.13);
        var gr = c.createLinearGradient(0, bb.y, 0, a.y); gr.addColorStop(0, '#5fd3cb'); gr.addColorStop(1, '#1f6f78');
        c.fillStyle = gr; c.fillRect(a.x, bb.y, bb.x - a.x, a.y - bb.y);
        c.lineWidth = 1.5; c.strokeStyle = TINTA; c.strokeRect(a.x, bb.y, bb.x - a.x, a.y - bb.y);
      }
    }
    function desenharDica() {
      if (J.fase !== 'mirar' || arrasto && arrasto.ativo) return;
      if (jogadorAtual().lances.length > 1 && !J.oscilando) return;
      var pb = proj(J.xBola, Z0), r = RB * pb.s, y = pb.y - r * 2 - 18, fs = clamp(L.W * 0.035, 14, 22), fonte = 'Fredoka, system-ui, sans-serif';
      var txt = J.oscilando ? t('Enter de novo para lançar!', 'Press Enter again to throw!', '¡Pulsa Enter otra vez para lanzar!')
        : t('Toque na bola e empurre para os pinos', 'Touch the ball and push it to the pins', 'Toca la bola y empújala hacia los bolos');
      var sub = J.oscilando ? '' : t('ou ← → e Enter no teclado', 'or ← → and Enter on the keyboard', 'o ← → y Enter en el teclado');
      c.font = '700 ' + Math.round(fs) + 'px ' + fonte; var w = c.measureText(txt).width;
      c.font = '600 ' + Math.round(fs * 0.72) + 'px ' + fonte; w = Math.max(w, c.measureText(sub).width) + fs * 1.4;
      var hh = sub ? fs * 2.5 : fs * 1.6, x = clamp(pb.x, w / 2 + 6, L.W - w / 2 - 6), yy = y - hh;
      var bob = calmo ? 0 : Math.sin(relogio * 4) * 4;
      c.save(); c.translate(0, bob);
      retangulo(c, x - w / 2 + 3, yy + 4, w, hh, 14); c.fillStyle = 'rgba(29,26,46,.5)'; c.fill();
      retangulo(c, x - w / 2, yy, w, hh, 14); c.fillStyle = 'rgba(255,243,214,.95)'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = TINTA; c.stroke();
      c.fillStyle = TINTA; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = '700 ' + Math.round(fs) + 'px ' + fonte; c.fillText(txt, x, yy + fs * 0.85);
      if (sub) { c.font = '600 ' + Math.round(fs * 0.72) + 'px ' + fonte; c.fillStyle = 'rgba(29,26,46,.75)'; c.fillText(sub, x, yy + fs * 1.85); }
      // setinha para cima
      c.beginPath(); c.moveTo(x, yy - 12); c.lineTo(x - 9, yy - 2); c.lineTo(x + 9, yy - 2); c.closePath(); c.fillStyle = '#ffcf4a'; c.fill(); c.stroke();
      c.restore();
    }
    function desenhar() {
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var sx = 0, sy = 0;
      if (J.tremor > 0 && !calmo) { sx = (Math.random() - 0.5) * J.tremor; sy = (Math.random() - 0.5) * J.tremor; }
      c.fillStyle = '#1a1328'; c.fillRect(0, 0, L.W, L.H);
      c.save(); c.translate(sx, sy);
      if (J.zoom > 0.002) {
        var k = J.zoom * J.zoom * (3 - 2 * J.zoom), P = proj(0, CAB + 0.3, 0.15), Tx = L.W / 2, Ty = L.painel + (L.H - L.painel) * (L.retrato ? 0.3 : 0.36);
        var e = 1 + k * ((L.retrato ? 2.5 : 1.85) - 1);
        c.translate(P.x + k * (Tx - P.x), P.y + k * (Ty - P.y)); c.scale(e, e); c.translate(-P.x, -P.y);
      }
      c.drawImage(fundo, 0, 0, L.W, L.H);
      desenharMira();
      desenharObjetos();
      c.restore();
      c.drawImage(hud, 0, 0, L.W, L.H);
      if (J.fase === 'placar' || J.fase === 'fim') {   // a faixa do placar por cima da pista
        var cd = L.card, u = clamp(J.tPlacar / 0.35, 0, 1), ee = 1 - Math.pow(1 - u, 3);
        var px = (L.W - cd.w) / 2 + (calmo ? 0 : (1 - ee) * -L.W * 0.6), py = L.painel + (L.H - L.painel - cd.h) * (L.retrato ? 0.4 : 0.36);
        c.globalAlpha = calmo ? u : 1; c.drawImage(placarCv, px, py, cd.w + 8, cd.h + 9); c.globalAlpha = 1;
      }
      desenharDica();
      desenharMsg();
    }

    /* ---------- dedo e mouse ---------- */
    var arrasto = null;
    function ponto(ev) { var r = tela.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top, t: (window.performance ? performance.now() : Date.now()) }; }
    function aoDescer(ev) {
      if (J.fase === 'placar') { continuar(); ev.preventDefault(); return; }
      if (J.fase !== 'mirar') return;
      var p = ponto(ev), pb = proj(J.xBola, Z0), r = RB * pb.s, naBola = Math.abs(p.x - pb.x) < r * 1.7 && Math.abs(p.y - (pb.y - r)) < r * 1.7;
      arrasto = { ativo: true, tipo: null, naBola: naBola, x0: p.x, y0: p.y, ux: p.x, uy: p.y, pts: [p], xb0: J.xBola, id: ev.pointerId };
      J.oscilando = false;
      try { tela.setPointerCapture(ev.pointerId); } catch (e) {}
      ev.preventDefault();
    }
    function aoMover(ev) {
      if (!arrasto || !arrasto.ativo) return;
      var p = ponto(ev), dx = p.x - arrasto.x0, dy = p.y - arrasto.y0;
      arrasto.ux = p.x; arrasto.uy = p.y; arrasto.pts.push(p);
      if (arrasto.pts.length > 40) arrasto.pts.shift();
      if (!arrasto.tipo && Math.abs(dx) + Math.abs(dy) > 10) arrasto.tipo = arrasto.naBola && Math.abs(dx) > Math.abs(dy) * 1.2 ? 'mover' : 'lancar';
      if (arrasto.tipo === 'mover') {
        var pb = proj(0, Z0); J.xBola = clamp(arrasto.xb0 + dx / pb.s, -0.42, 0.42);
      }
      ev.preventDefault();
    }
    function aoSubir(ev) {
      if (!arrasto || !arrasto.ativo) return;
      var a = arrasto; a.ativo = false; arrasto = null;
      if (ev.type === 'pointerup') { var p = ponto(ev); a.pts.push(p); a.ux = p.x; a.uy = p.y; }
      if (a.tipo !== 'lancar' || J.fase !== 'mirar') return;
      var dx = a.ux - a.x0, dy = a.uy - a.y0;
      if (dy > -30) return;
      // velocidade: últimos ~120 ms do gesto
      var fim = a.pts[a.pts.length - 1], ini = a.pts[0], i;
      for (i = a.pts.length - 1; i >= 0; i--) { ini = a.pts[i]; if (fim.t - ini.t > 120) break; }
      var dtg = Math.max(16, fim.t - ini.t) / 1000, dist = Math.sqrt((fim.x - ini.x) * (fim.x - ini.x) + (fim.y - ini.y) * (fim.y - ini.y));
      var vel = dist / dtg / Math.max(300, L.H);   // telas por segundo
      var forca = clamp(4.2 + vel * 2.1, 4.2, 11.5);
      var ang = Math.atan2(dx, -dy), alvo = clamp(J.xBola + Math.tan(clamp(ang, -1.2, 1.2)) * 1.6, -0.95, 0.95);
      // efeito: quanto o fim do gesto desvia da direção geral
      var n = a.pts.length, efeito = 0;
      if (n >= 4) {
        var m = a.pts[Math.floor(n * 0.6)], ddx = fim.x - m.x, ddy = fim.y - m.y;
        if (ddy < -4) efeito = clamp((Math.atan2(ddx, -ddy) - ang) * 1.6, -1, 1);
      }
      lancar(alvo, forca, efeito);
    }

    /* ---------- teclado e controle da TV ---------- */
    function aoTeclar(ev) {
      if (!ev.key || document.querySelector('.ajuda:not([hidden]), .fim:not([hidden])')) return;
      if (J.fase === 'escolha' && faixa) {
        if (/^Arrow/.test(ev.key)) {
          var bs = Array.prototype.filter.call(faixa.querySelectorAll('button'), function (b) { return b.offsetParent !== null; });
          var i = bs.indexOf(document.activeElement), d = ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? 1 : -1;
          i = i < 0 ? 0 : (i + d + bs.length) % bs.length; bs[i].focus(); ev.preventDefault();
        }
        return;
      }
      var alvoBotao = ev.target && ev.target.tagName === 'BUTTON';
      if (J.fase === 'placar' && (ev.key === 'Enter' || ev.key === ' ') && !alvoBotao) { ev.preventDefault(); continuar(); return; }
      if (J.fase !== 'mirar') return;
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
        J.xBola = clamp(J.xBola + (ev.key === 'ArrowRight' ? 0.06 : -0.06), -0.42, 0.42); ev.preventDefault();
      } else if ((ev.key === 'Enter' || ev.key === ' ') && !alvoBotao) {
        ev.preventDefault();
        if (!J.oscilando) { J.oscilando = true; J.tOsc = 0; ctx.som('toque'); }
        else lancar(alvoAtual(), 8.8, 0);
      } else if (ev.key === 'Escape' && J.oscilando) { J.oscilando = false; ev.preventDefault(); }
    }

    /* ---------- laço ---------- */
    var raf = 0, ultimo = 0, relogio = 0, vivo = true;
    function laco(ts) {
      if (!vivo) return;
      raf = requestAnimationFrame(laco);
      var dt = ultimo ? Math.min(0.05, Math.max(0, (ts - ultimo) / 1000)) : 1 / 60; ultimo = ts; relogio += dt;
      atualizar(dt); desenhar();
    }
    var obs = null;
    function aoRedimensionar() { medir(); }
    tela.addEventListener('pointerdown', aoDescer);
    tela.addEventListener('pointermove', aoMover);
    tela.addEventListener('pointerup', aoSubir);
    tela.addEventListener('pointercancel', aoSubir);
    window.addEventListener('keydown', aoTeclar);
    if (window.ResizeObserver) { obs = new ResizeObserver(aoRedimensionar); obs.observe(palco); } else window.addEventListener('resize', aoRedimensionar);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (vivo) desenharHUD(); });
    medir();
    montarFaixa();
    raf = requestAnimationFrame(laco);

    if (ctx.teste) window.BolicheDebug = {
      estado: function () {
        var b = J.lance && J.lance.bola;
        return { fase: J.fase, vez: J.vez, lances: J.jogadores.map(function (j) { return j.lances.slice(); }),
          totais: J.jogadores.map(function (j) { return total(j.lances); }), emPe: J.emPe.filter(Boolean).length,
          bateu: !!(J.lance && J.lance.bateu), bola: b ? { x: b.x, z: b.z, fora: b.fora } : null, nivel: nivel };
      },
      comecar: function () { if (J.fase === 'escolha') comecarPartida(); },
      continuar: function () { continuar(); },
      lancar: function (alvo, forca, efeito) { lancar(alvo || 0, forca || 9, efeito || 0); },
      definirLances: function (i, l) { J.jogadores[i].lances = l.slice(); J.vez = quemJoga() < 0 ? J.vez : quemJoga(); novoRack(false); desenharHUD(); }
    };

    return {
      parar: function () {
        vivo = false; cancelAnimationFrame(raf);
        window.removeEventListener('keydown', aoTeclar);
        if (obs) obs.disconnect(); else window.removeEventListener('resize', aoRedimensionar);
        if (ctx.teste) try { delete window.BolicheDebug; } catch (e) { window.BolicheDebug = undefined; }
        if (raiz.parentNode) raiz.parentNode.removeChild(raiz);
      }
    };
  }

  (window.JogotecaJogos = window.JogotecaJogos || []).push({
    id: 'boliche',
    ajuda: function (t) {
      return '<p>' + t('Arraste o dedo (ou o mouse) para cima para lançar a bola: a direção do arrasto é a mira e a velocidade é a força. ' +
        'Uma curvinha no fim do gesto faz a bola fazer curva.', 'Swipe up with your finger (or the mouse) to throw the ball: the direction is your aim and the speed is your power. ' +
        'A little hook at the end of the swipe makes the ball curve.', 'Desliza el dedo (o el ratón) hacia arriba para lanzar la bola: la dirección es la puntería y la velocidad es la fuerza. ' +
        'Un pequeño giro al final del gesto hace que la bola haga curva.') + '</p>' +
        '<p>' + t('Arraste a bola para os lados para mudar o lugar de onde ela sai. No teclado ou no controle da TV: ← → mudam a bola de lugar, Enter liga a mira e o segundo Enter lança.',
          'Drag the ball sideways to change where it starts. On a keyboard or TV remote: ← → move the ball, Enter starts the aim and a second Enter throws.',
          'Arrastra la bola hacia los lados para cambiar desde dónde sale. Con el teclado o el mando de la tele: ← → mueven la bola, Enter activa la puntería y el segundo Enter lanza.') + '</p>' +
        '<p>' + t('A partida tem 10 jogadas com até 2 bolas cada. Derrubou os 10 de uma vez é STRIKE (X): vale 10 mais as 2 bolas seguintes. Com as 2 bolas é SPARE (/): vale 10 mais a bola seguinte. Na 10ª jogada, quem faz strike ou spare ganha bolas extras. O máximo é 300!',
          'A game has 10 frames with up to 2 balls each. All 10 pins at once is a STRIKE (X): 10 plus your next 2 balls. With 2 balls it’s a SPARE (/): 10 plus your next ball. A strike or spare in the 10th frame earns bonus balls. The top score is 300!',
          'La partida tiene 10 tiradas con hasta 2 bolas cada una. Derribar los 10 de una vez es un PLENO (X): vale 10 más las 2 bolas siguientes. Con 2 bolas es un SEMIPLENO (/): vale 10 más la bola siguiente. En la 10.ª tirada, el pleno o el semipleno dan bolas extra. ¡El máximo es 300!') + '</p>' +
        '<p>' + t('Fácil: proteção nas canaletas e linha de mira. Médio: sem proteção e mira curta. Difícil: sem mira, a bola faz curva para a esquerda sozinha e os pinos são mais teimosos.',
          'Easy: gutter bumpers and an aiming line. Medium: no bumpers and a short aiming line. Hard: no aiming line, the ball hooks left on its own and the pins are more stubborn.',
          'Fácil: barreras en los canales y línea de puntería. Medio: sin barreras y puntería corta. Difícil: sin puntería, la bola hace curva a la izquierda sola y los bolos son más tozudos.') + '</p>';
    },
    iniciar: iniciar,
    logica: { pontuar: pontuar, total: total, marcas: marcas, situacao: situacao, criarLance: criarLance, passoFisica: passoFisica,
      lanceAcabou: lanceAcabou, derrubados: derrubados, simular: simular, POS: POS, NIVEIS: NIVEIS }
  });
})();
