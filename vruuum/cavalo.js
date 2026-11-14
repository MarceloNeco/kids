/* Vruuum! — o Cavalo (1.10.0): um cavalo castanho GALOPANDO, com quem monta em cima.
   É montado em 3D de verdade com peças simples: bolas esticadas (corpo, garupa, peito, sela, focinho, tronco de quem
   monta) e "canos" que afinam (pescoço, cabeça, pernas, braços), girados e vistos por uma câmera atrás e um pouco
   acima. Por isso ele fica DE COSTAS na reta e aparece DE LADO (três quartos) nas curvas, com cabeça, pernas e
   rabo no lugar certo, e cada peça na frente ou atrás da outra pela distância (a mais longe é desenhada primeiro).
   Galope (fase 0 a 1 = uma passada): as 4 patas batem uma depois da outra (traseira esquerda, traseira direita,
   dianteira esquerda, dianteira direita) e no fim todas ficam no ar; o corpo balança para cima e para baixo e
   "gangorra", o pescoço vai e volta e o rabo voa para trás. Quem monta acompanha macio: o quadril vai com a sela,
   o tronco fica quase em pé (compensa a gangorra do cavalo) e as mãos seguem a boca do cavalo pelas rédeas.
   A cabeça de quem monta é a cabeça viva de cabeca.js (vira, olha e sorri); aqui fica só a posição dela. */
(function (raiz) {
  'use strict';
  var PI = Math.PI;
  var PELO = ['#c08a55', '#8d5a2e', '#60391a'], PRETO = ['#4a3426', '#24170f', '#0e0906'], CASCO = ['#6a6a70', '#3a3a40', '#1c1c20'];
  var PELE = ['#f8dcbc', '#f2c9a0', '#d39f74'], CALCA = ['#5577b4', '#36518a', '#1f3159'], BOTA = ['#8a5531', '#5a3218', '#341a0a'];
  var CABELO = ['#8a5a36', '#5a3a22', '#2e1c0f'];
  // 1.11.0: o mesmo esqueleto vira um DINOSSAURO verde (espinhos roxos nas costas, rabo grosso e comprido, cabeção sorridente)
  var DINO = ['#a6ec72', '#4caf50', '#2a6b2a'], ESPINHO = ['#e0a8ff', '#9b5de5', '#4a1f7a'], GARRA = ['#f4f1e8', '#cfc6a8', '#8a8066'];
  // câmera: distância (perspectiva), quanto olha de cima, quantas unidades cabem na altura e onde fica o chão
  var F = 7, PITCH = 0.22, ALT = 3.25, CHAO = 0.93, GIRO = 0.62;

  function tom(cor, f) {   // f > 0 clareia, f < 0 escurece
    var n = parseInt(String(cor || '#ff4fa3').slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function m(v) { return Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f)); }
    return 'rgb(' + m(r) + ',' + m(g) + ',' + m(b) + ')';
  }
  function tres(cor) { return [tom(cor, 0.3), tom(cor, 0), tom(cor, -0.45)]; }
  function soma(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  // gira o ponto p em volta de o, no plano de cima-baixo/frente-trás (a > 0 levanta a frente)
  function gira(p, a, o) {
    var y = p[1] - o[1], z = p[2] - o[2], ca = Math.cos(a), sa = Math.sin(a);
    return [p[0], o[1] + y * ca + z * sa, o[2] - y * sa + z * ca];
  }
  // pedaço de perna/braço: sai de j com comprimento l, no ângulo a (0 = para baixo, > 0 = para a frente)
  function osso(j, l, a, dx) { return [j[0] + (dx || 0), j[1] - Math.cos(a) * l, j[2] + Math.sin(a) * l]; }

  function camera(x0, y0, W, H, yaw) {
    var k = H / ALT, cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(PITCH), sp = Math.sin(PITCH);
    return {
      pt: function (p) {
        var x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy, ys = p[1] * cp + z1 * sp, d = z1 * cp - p[1] * sp, s = F / (F + d) * k;
        return { x: x0 + W / 2 + x1 * s, y: y0 + H * CHAO - ys * s, d: d, s: s };
      },
      dir: function (v, s) { var x1 = v[0] * cy + v[2] * sy, z1 = -v[0] * sy + v[2] * cy; return [x1 * s, -(v[1] * cp + z1 * sp) * s]; }
    };
  }

  // ---------- as peças ----------
  function bolaTela(c, cx, cy, r1, r2, ang, cores) {   // elipse com luz vindo de cima, à esquerda
    if (r1 < 0.3 || r2 < 0.3) return;
    c.save(); c.translate(cx, cy); c.rotate(ang); c.scale(r1, r2);
    var ca = Math.cos(-ang), sa = Math.sin(-ang), lx = -0.38 * ca + 0.48 * sa, ly = -0.38 * sa - 0.48 * ca;
    var g = c.createRadialGradient(lx, ly, 0.05, 0, 0, 1.02);
    g.addColorStop(0, cores[0]); g.addColorStop(0.62, cores[1]); g.addColorStop(1, cores[2]);
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, PI * 2); c.fill(); c.restore();
  }
  // bola esticada (raios rx, ry, rz) em p, inclinada de inc (frente para cima): a sombra dela na tela é uma elipse
  function bola(cam, lista, p, rx, ry, rz, inc, cores, vies) {
    var q = cam.pt(p), ci = Math.cos(inc || 0), si = Math.sin(inc || 0);
    var a = cam.dir([rx, 0, 0], q.s), b = cam.dir([0, ry * ci, -ry * si], q.s), e = cam.dir([0, rz * si, rz * ci], q.s);
    var m11 = a[0] * a[0] + b[0] * b[0] + e[0] * e[0], m12 = a[0] * a[1] + b[0] * b[1] + e[0] * e[1], m22 = a[1] * a[1] + b[1] * b[1] + e[1] * e[1];
    var tr = (m11 + m22) / 2, disc = Math.sqrt(Math.max(0, tr * tr - (m11 * m22 - m12 * m12)));
    var r1 = Math.sqrt(tr + disc), r2 = Math.sqrt(Math.max(0.01, tr - disc)), ang = 0.5 * Math.atan2(2 * m12, m11 - m22);
    lista.push({ d: q.d + (vies || 0), f: function (c) { bolaTela(c, q.x, q.y, r1, r2, ang, cores); } });
  }
  function canoTela(c, a, b, ra, rb, cores) {   // cano afinando de a até b, pontas redondas, luz de um lado
    var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 0.001, nx = -dy / d, ny = dx / d, an = Math.atan2(ny, nx);
    var lx = nx * 1 + ny * 1.2 < 0 ? nx : -nx, ly = nx * 1 + ny * 1.2 < 0 ? ny : -ny, rm = (ra + rb) / 2, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    var g = c.createLinearGradient(mx + lx * rm, my + ly * rm, mx - lx * rm, my - ly * rm);
    g.addColorStop(0, cores[0]); g.addColorStop(0.45, cores[1]); g.addColorStop(1, cores[2]);
    c.fillStyle = g; c.beginPath();
    c.moveTo(a.x + nx * ra, a.y + ny * ra); c.lineTo(b.x + nx * rb, b.y + ny * rb);
    c.arc(b.x, b.y, Math.max(0.3, rb), an, an - PI, true);
    c.lineTo(a.x - nx * ra, a.y - ny * ra);
    c.arc(a.x, a.y, Math.max(0.3, ra), an + PI, an, true);
    c.fill();
  }
  function cano(cam, lista, p1, p2, r1, r2, cores, vies) {
    var a = cam.pt(p1), b = cam.pt(p2);
    lista.push({ d: (a.d + b.d) / 2 + (vies || 0), f: function (c) { canoTela(c, a, b, r1 * a.s, r2 * b.s, cores); } });
  }
  // fita grossa por uma linha de pontos (rabo, crina): larguras em cada ponto
  function fita(cam, lista, pts, largs, cores, vies, fios) {
    var q = pts.map(cam.pt), dm = 0;
    q.forEach(function (p) { dm += p.d; });
    lista.push({ d: dm / q.length + (vies || 0), f: function (c) {
      var esq = [], dir = [];
      for (var k = 0; k < q.length; k++) {
        var o = q[Math.max(0, k - 1)], n = q[Math.min(q.length - 1, k + 1)], dx = n.x - o.x, dy = n.y - o.y, d = Math.sqrt(dx * dx + dy * dy) || 1, w = largs[k] * q[k].s;
        esq.push([q[k].x - dy / d * w, q[k].y + dx / d * w]); dir.push([q[k].x + dy / d * w, q[k].y - dx / d * w]);
      }
      var g = c.createLinearGradient(esq[0][0], esq[0][1], dir[0][0], dir[0][1]);
      g.addColorStop(0, cores[0]); g.addColorStop(0.5, cores[1]); g.addColorStop(1, cores[2]);
      c.fillStyle = g; c.beginPath(); c.moveTo(esq[0][0], esq[0][1]);
      for (k = 1; k < q.length; k++) { var mx = (esq[k - 1][0] + esq[k][0]) / 2, my = (esq[k - 1][1] + esq[k][1]) / 2; c.quadraticCurveTo(esq[k - 1][0], esq[k - 1][1], mx, my); }
      c.lineTo(esq[q.length - 1][0], esq[q.length - 1][1]); c.lineTo(dir[q.length - 1][0], dir[q.length - 1][1]);
      for (k = q.length - 2; k >= 0; k--) { var nx2 = (dir[k + 1][0] + dir[k][0]) / 2, ny2 = (dir[k + 1][1] + dir[k][1]) / 2; c.quadraticCurveTo(dir[k + 1][0], dir[k + 1][1], nx2, ny2); }
      c.lineTo(dir[0][0], dir[0][1]); c.closePath(); c.fill();
      if (fios) {   // fios de cabelo mais claros
        c.strokeStyle = fios; c.lineCap = 'round'; c.lineWidth = Math.max(1, q[0].s * 0.012);
        [-0.5, 0, 0.45].forEach(function (f) {
          c.beginPath();
          for (var k2 = 0; k2 < q.length; k2++) { var px = q[k2].x + (esq[k2][0] - q[k2].x) * f, py = q[k2].y + (esq[k2][1] - q[k2].y) * f; if (k2) c.lineTo(px, py); else c.moveTo(px, py); }
          c.stroke();
        });
      }
    } });
  }

  // ---------- o galope ----------
  var APOIO = 0.4;   // parte da passada em que a pata fica no chão (indo para trás); depois dobra, sobe e volta
  var BATIDA = { te: 0, td: 0.1, de: 0.36, dd: 0.46 };   // quando cada pata toca o chão
  function perna(f, quando, frente) {
    if (f < 0) return { ang: 0, dobra: 0 };   // parado, em pé
    var p = ((f - quando) % 1 + 1) % 1, A = frente ? 0.48 : 0.4, B = frente ? 0.42 : 0.55;
    if (p < APOIO) { var u = p / APOIO; return { ang: A - (A + B) * u, dobra: 0.08 * Math.sin(PI * u) }; }
    var v = (p - APOIO) / (1 - APOIO);
    return { ang: -B + (A + B) * (0.5 - 0.5 * Math.cos(PI * v)), dobra: Math.sin(PI * Math.min(1, v * 1.12)) * (frente ? 1.85 : 1.45) };
  }
  function corpo(f) {
    if (f < 0) return { sobe: 0, inc: 0, pesc: 0, voo: 0 };
    var a = 2 * PI * f;
    return { sobe: 0.055 * Math.cos(a - 2 * PI * 0.85), inc: 0.07 * Math.sin(a - 0.6), pesc: 0.16 * Math.sin(a + 0.9), voo: 0.5 + 0.5 * Math.sin(a + 1.4) };
  }

  /* monta a lista de peças. fase < 0 = parado. lado: -1 (curva para a esquerda) a 1 (direita).
     Devolve também onde fica a cabeça de quem monta (centro e raio, na tela). */
  function montar(x0, y0, W, H, cor, fase, lado, corpoPiloto, t, bicho) {
    var dino = bicho === 'dino', PELE_B = dino ? DINO : PELO, PATA = dino ? DINO : PRETO;
    var yaw = lado && lado.yaw != null ? lado.yaw : Math.max(-1, Math.min(1, lado || 0)) * GIRO, cam = camera(x0, y0, W, H, yaw), L = [];   // {yaw}: giro livre (volta de 360° na largada)
    var cp = corpo(fase), C0 = [0, 1.2, 0];
    function B(p) { var q = gira(p, cp.inc, C0); return [q[0], q[1] + cp.sobe, q[2]]; }   // ponto preso ao corpo do cavalo
    var menina = corpoPiloto === 'menina', camisa = tres(cor), manta = [tom(cor, 0.45), tom(cor, 0.12), tom(cor, -0.35)];
    // sombra no chão
    L.push({ d: 99, f: function (c) {
      var a = cam.pt([0, 0, -0.75]), b = cam.pt([0, 0, 0.75]), m = cam.pt([0, 0, 0]), lx = cam.pt([0.42, 0, 0]);
      c.save(); c.globalAlpha = 0.28 * (1 - Math.min(0.6, cp.sobe * 3)); c.fillStyle = '#000'; c.beginPath();
      var rx = Math.max(Math.abs(lx.x - m.x), Math.abs(b.x - a.x) / 2 + 4), ry = Math.max(3, Math.abs(b.y - a.y) / 2 + m.s * 0.05);
      if (c.ellipse) c.ellipse(m.x, m.y, rx, ry, 0, 0, PI * 2); else c.arc(m.x, m.y, rx, 0, PI * 2);
      c.fill(); c.restore();
    } });
    // corpo: barriga, garupa (bem redonda vista de trás) e peito
    bola(cam, L, B([0, 1.21, 0.0]), dino ? 0.36 : 0.31, dino ? 0.36 : 0.33, 0.72, cp.inc, PELE_B);
    bola(cam, L, B([0, 1.27, -0.44]), dino ? 0.38 : 0.34, 0.34, 0.42, cp.inc, PELE_B);
    bola(cam, L, B([0, 1.27, 0.5]), 0.27, 0.35, 0.34, cp.inc, PELE_B);
    // pescoço e cabeça (balançam com o galope)
    var base = B([0, 1.42, 0.66]);
    function N(p) { return gira(B(p), cp.pesc, base); }
    var nuca = N([0, 2.02, 1.02]), focinho = N([0, 1.76, 1.4]);
    if (dino) {   // pescoço grosso e cabeção redondo com olhões em cima e sorriso
      cano(cam, L, base, N([0, 1.9, 1.0]), 0.24, 0.17, DINO);
      bola(cam, L, N([0, 2.02, 1.16]), 0.21, 0.19, 0.24, -0.2, DINO, -0.02);
      bola(cam, L, N([0, 1.94, 1.38]), 0.15, 0.12, 0.14, -0.3, DINO, -0.03);
      [-1, 1].forEach(function (l) {
        bola(cam, L, N([l * 0.1, 2.18, 1.12]), 0.07, 0.07, 0.06, 0, ['#ffffff', '#f0f0f0', '#c8c8c8'], -0.05);
        bola(cam, L, N([l * 0.11, 2.19, 1.17]), 0.032, 0.035, 0.02, 0, ['#555', '#151515', '#000'], -0.07);
        bola(cam, L, N([l * 0.05, 1.98, 1.5]), 0.018, 0.018, 0.01, 0, ['#2a6b2a', '#1d4a1d', '#0e250e'], -0.06);
      });
    } else {
      cano(cam, L, base, N([0, 1.95, 1.0]), 0.21, 0.13, PELO);
      cano(cam, L, N([0, 2.04, 1.06]), focinho, 0.12, 0.085, PELO, -0.02);
      bola(cam, L, N([0, 1.75, 1.43]), 0.085, 0.075, 0.09, -0.6, [tom('#8d5a2e', 0.1), '#5e3a1c', '#2e1a0b'], -0.04);
      [-1, 1].forEach(function (l) {
        cano(cam, L, N([l * 0.055, 2.1, 1.03]), N([l * 0.075, 2.27, 0.99]), 0.038, 0.01, PELO, -0.03);
        bola(cam, L, N([l * 0.1, 2.0, 1.14]), 0.022, 0.026, 0.02, 0, ['#555', '#151515', '#000'], -0.05);
      });
    }
    // crina: pela crista do pescoço, caindo para o lado direito, e o topete
    var crista = [B([0, 1.62, 0.42]), N([0, 1.78, 0.68]), N([0, 1.95, 0.86]), N([0, 2.1, 1.0])], k;
    if (dino) {   // espinhos roxos: do alto da cabeça, pelo pescoço e pelas costas (a sela fica no meio, sem espinho)
      [N([0, 2.2, 1.08]), N([0, 2.08, 0.92]), N([0, 1.95, 0.78]), B([0, 1.66, 0.4]), B([0, 1.6, -0.42]), B([0, 1.58, -0.66])].forEach(function (b0, q) {
        var alto = q < 3 ? 0.17 : 0.22; cano(cam, L, b0, soma(b0, [0, alto, -0.04]), 0.075, 0.008, ESPINHO, -0.05);
      });
    } else fita(cam, L, crista, [0.05, 0.075, 0.07, 0.05], PRETO, -0.06);
    for (k = 0; k < (dino ? 0 : 6); k++) {   // mechas caindo para o lado, balançando com o vento
      var cr = N([0, 1.66 + k * 0.085, 0.47 + k * 0.1]), bal = 0.04 * Math.sin((t || 0) * 7 + k * 1.3);
      fita(cam, L, [cr, soma(cr, [0.07, -0.08, -0.05 + bal]), soma(cr, [0.1, -0.2, -0.1 + bal * 1.5])], [0.045, 0.035, 0.012], PRETO, -0.07);
    }
    // pernas: braço/coxa, canela (preta, "meias" do cavalo castanho), quartela e casco
    [['de', -1, true], ['dd', 1, true], ['te', -1, false], ['td', 1, false]].forEach(function (pp) {
      var fr = pp[2], l = pp[1], pr = perna(fase, BATIDA[pp[0]], fr), j0 = B(fr ? [l * 0.14, 1.14, 0.52] : [l * 0.16, 1.24, -0.52]);
      var a1 = fr ? pr.ang : pr.ang - 0.3, a2 = (fr ? pr.ang : pr.ang + 0.42) - pr.dobra, a3 = a2 + (pr.dobra > 0.5 ? -0.6 : 0.45);
      var j1 = osso(j0, fr ? 0.54 : 0.62, a1, -l * 0.015), j2 = osso(j1, fr ? 0.38 : 0.41, a2, -l * 0.01), j3 = osso(j2, 0.13, a3);
      cano(cam, L, j0, j1, (fr ? 0.13 : 0.17) * (dino ? 1.25 : 1), dino ? 0.1 : 0.068, PELE_B, fr ? 0 : 0.35);   // a coxa sai de baixo da garupa
      cano(cam, L, j1, j2, dino ? 0.1 : 0.055, dino ? 0.085 : 0.045, PATA);
      cano(cam, L, j2, j3, dino ? 0.085 : 0.045, dino ? 0.09 : 0.052, PATA, -0.01);
      bola(cam, L, osso(j3, 0.03, a3), dino ? 0.1 : 0.058, 0.05, dino ? 0.1 : 0.065, -a3, dino ? GARRA : CASCO, -0.02);
    });
    // rabo: sai da garupa e voa para trás no galope, balançando
    var raiz0 = B([0, 1.5, -0.86]), rabo = [];
    if (dino) {   // rabo de dinossauro: grosso, comprido, quase reto para trás, balançando de um lado para o outro
      raiz0 = B([0, 1.3, -0.8]);
      for (k = 0; k <= 5; k++) { var ud = k / 5; rabo.push([raiz0[0] + Math.sin((t || 0) * 5 + ud * 2) * 0.22 * ud, raiz0[1] - ud * 0.55, raiz0[2] - ud * 1.3]); }
      fita(cam, L, rabo, [0.24, 0.2, 0.16, 0.11, 0.07, 0.02], DINO, -0.3);
      [1, 2, 3].forEach(function (q) { var pr0 = rabo[q]; cano(cam, L, pr0, soma(pr0, [0, 0.17 - q * 0.03, -0.03]), 0.06, 0.006, ESPINHO, -0.32); });
    } else {
      for (k = 0; k <= 5; k++) {
        var u = k / 5;
        rabo.push([raiz0[0] + Math.sin(u * 2.4 + (t || 0) * 4) * 0.07 * u, raiz0[1] + 0.06 * Math.sin(u * PI) - u * 0.95 * (1 - 0.45 * cp.voo), raiz0[2] - u * (0.12 + 0.42 * cp.voo)]);
      }
      fita(cam, L, rabo, [0.06, 0.1, 0.13, 0.13, 0.1, 0.04], PRETO, -0.3, 'rgba(120,90,60,.45)');
    }
    // manta (na cor escolhida) e sela de couro
    bola(cam, L, B([0, 1.43, 0.02]), 0.36, 0.16, 0.3, cp.inc, manta, -0.08);
    bola(cam, L, B([0, 1.55, 0.0]), 0.2, 0.07, 0.25, cp.inc, BOTA, -0.12);

    // ---------- quem monta ----------
    // o quadril vai com a sela; o tronco fica quase em pé e um pouco para a frente (desfaz a gangorra do cavalo)
    var assento = B([0, 1.56, -0.02]), incl = -cp.inc * 0.8 + 0.12 + 0.03 * Math.sin(2 * PI * (fase < 0 ? 0 : fase) - 1.2);
    function P(p) { var q = gira(p, -incl, [0, 0, 0]); return [assento[0] + q[0], assento[1] + q[1], assento[2] + q[2]]; }
    var largO = menina ? 0.17 : 0.2;
    bola(cam, L, P([0, 0.1, -0.02]), 0.18, 0.1, 0.15, 0, CALCA, -0.19);
    cano(cam, L, P([0, 0.17, 0]), P([0, 0.44, 0.01]), 0.15, largO - 0.02, camisa, -0.2);   // tronco: cintura fina, ombros largos
    if (menina) {   // blusinha com coração nas costas
      var cz = cam.pt(P([0, 0.4, -0.13]));
      L.push({ d: cz.d - 0.3, f: function (c) {
        var r = cz.s * 0.05; c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath();
        c.moveTo(cz.x, cz.y + r * 0.9); c.bezierCurveTo(cz.x - r * 1.4, cz.y - r * 0.2, cz.x - r * 0.6, cz.y - r * 1.2, cz.x, cz.y - r * 0.4);
        c.bezierCurveTo(cz.x + r * 0.6, cz.y - r * 1.2, cz.x + r * 1.4, cz.y - r * 0.2, cz.x, cz.y + r * 0.9); c.fill();
      } });
    }
    cano(cam, L, P([0, 0.58, 0.02]), P([0, 0.7, 0.02]), 0.055, 0.05, PELE, -0.19);
    // braços: ombro, cotovelo, mão segurando a rédea (as mãos seguem a boca do cavalo)
    var maos = [];
    [-1, 1].forEach(function (l) {
      var om = P([l * (largO - 0.01), 0.54, 0]), co = P([l * (largO + 0.04), 0.32, 0.11]), mao = soma(P([l * 0.09, 0.27, 0.34]), [0, cp.pesc * 0.12, cp.pesc * 0.05]);
      cano(cam, L, om, co, 0.065, 0.055, camisa, -0.18);
      cano(cam, L, co, mao, 0.05, 0.04, PELE, -0.18);
      bola(cam, L, mao, 0.045, 0.045, 0.045, 0, PELE, -0.19);
      maos.push(mao);
    });
    var bocaL = N([-0.08, 1.76, 1.36]), bocaR = N([0.08, 1.76, 1.36]), qa = cam.pt(maos[0]), qb = cam.pt(maos[1]), ba = cam.pt(bocaL), bb = cam.pt(bocaR);
    L.push({ d: (qa.d + ba.d) / 2, f: function (c) {   // rédeas
      c.strokeStyle = '#3a2412'; c.lineWidth = Math.max(1, qa.s * 0.014); c.lineCap = 'round';
      c.beginPath(); c.moveTo(qa.x, qa.y); c.quadraticCurveTo((qa.x + ba.x) / 2, Math.max(qa.y, ba.y) + qa.s * 0.06, ba.x, ba.y);
      c.moveTo(qb.x, qb.y); c.quadraticCurveTo((qb.x + bb.x) / 2, Math.max(qb.y, bb.y) + qb.s * 0.06, bb.x, bb.y); c.stroke();
    } });
    // pernas de quem monta: por fora da sela, bota no estribo
    [-1, 1].forEach(function (l) {
      var qd = P([l * 0.12, 0.08, 0]), jo = soma(assento, [l * 0.33, -0.17, 0.2]), tor = soma(assento, [l * 0.35, -0.52, 0.07]);
      cano(cam, L, qd, jo, 0.085, 0.072, CALCA, -0.25);
      cano(cam, L, jo, tor, 0.068, 0.056, CALCA, -0.25);
      bola(cam, L, soma(tor, [0, -0.04, 0.04]), 0.062, 0.07, 0.12, 0, BOTA, -0.26);
      cano(cam, L, soma(tor, [-l * 0.02, 0.22, 0.02]), soma(tor, [0, -0.08, 0.04]), 0.008, 0.008, ['#999', '#666', '#333'], -0.24);   // estribo
    });
    var cab = cam.pt(P([0, 0.88, 0.02]));
    return { pecas: L, cabeca: { x: cab.x, y: cab.y, r: cab.s * 0.2, d: cab.d } };
  }
  function pintar(c, m) {
    m.pecas.sort(function (a, b) { return b.d - a.d; });
    for (var k = 0; k < m.pecas.length; k++) m.pecas[k].f(c);
  }

  // quadro parado (de costas) para a garagem e para os rivais: com uma cabeça neutra de cabelo, para quando está longe
  function desenhar(c, W, H, cor, emoji, fase, corpoPiloto, bicho) {
    var m = montar(0, 0, W, H, cor, fase == null ? 0.3 : fase, 0, corpoPiloto, 0, bicho), h = m.cabeca;
    pintar(c, m);
    bolaTela(c, h.x, h.y, h.r, h.r, 0, CABELO);
  }
  // ao vivo (corrida e garagem): gira de lado nas curvas. Devolve onde desenhar a cabeça viva
  function vivo(c, x0, y0, W, H, cor, fase, lado, corpoPiloto, t, bicho) {
    var m = montar(x0, y0, W, H, cor, fase, lado, corpoPiloto, t, bicho);
    pintar(c, m);
    return m.cabeca;
  }
  function cabeca(x0, y0, W, H, fase, lado, bicho) { return montar(x0, y0, W, H, '#ff4fa3', fase, lado, 'menina', 0, bicho).cabeca; }

  var VruuumCavalo = { desenhar: desenhar, vivo: vivo, cabeca: cabeca, perna: perna, corpo: corpo, BATIDA: BATIDA, APOIO: APOIO };
  if (typeof module !== 'undefined' && module.exports) module.exports = VruuumCavalo;
  else raiz.VruuumCavalo = VruuumCavalo;
})(this);
