/* A Garra — a máquina por dentro: os bichinhos (bolinhas que caem, rolam e se empilham), a garra e as regras de cada
   nível. Sem desenho e sem tela: roda igual no navegador e no Node (testes em teste/maquina.test.js).

   Uso:
     var m = Maquina.nova({ nivel: 'facil', tema: 'cabine', semente: 7 });
     m.mover(-1 | 0 | 1)   segurar ⬅/➡ (0 = soltou)          m.irPara(x | null)  levar a garra até x (dedo)
     m.pegar()             desce a garra (só na fase "mirar")  m.passo(dt)         anda dt segundos
     m.fase                'mirar' 'descer' 'fechar' 'subir' 'levar' 'soltar' 'voltar' 'fim'
     m.garra               { x, y, abertura (0 fechada a 1 aberta), balanco, premio }
     m.premios             [{ id, tipo, x, y, r, ang, preso }]   m.ganhos  [tipo, ...]   m.fichas   m.tempo
     m.eventos             fila que o app esvazia a cada quadro: { tipo: 'pegou' | 'raspou' | 'errou' | 'escorregou' |
                           'ganhou' | 'ficha' | 'tique' | 'fim', ... }
   Medidas em "unidades da máquina": o vidro tem L × A por dentro, y cresce para baixo; o buraco do prêmio fica à
   esquerda (0 até BURACO), separado dos bichinhos por uma mureta de acrílico (x = BURACO, do y = MURETA até o chão).
   O chão só existe à direita da mureta: quem passa para o lado do buraco cai e vira prêmio. */
(function (raiz) {
  'use strict';
  var L = 300, A = 400, BURACO = 74, MURETA = 240, TRILHO = 30, PERNA = 34, CASA = BURACO / 2, G = 1100;

  // ajustes de cada nível. tol: quão perto do meio do bichinho a garra precisa fechar (1 = até a borda);
  // escorrega: chance de o bichinho cair no caminho (0 = a garra nunca solta); tempo: segundos para mirar (0 = sem pressa)
  var NIVEIS = {
    facil: { fichas: 10, tempo: 0, qtd: 12, raio: [30, 34], tol: 1.0, escorrega: 0, vel: 120 },
    medio: { fichas: 10, tempo: 20, qtd: 16, raio: [26, 30], tol: 0.72, escorrega: 0.4, vel: 140 },
    dificil: { fichas: 8, tempo: 12, qtd: 20, raio: [22, 27], tol: 0.52, escorrega: 0.7, vel: 160 }
  };
  var TIPOS = ['urso', 'coelho', 'gato', 'cachorro', 'sapo', 'pinguim', 'porquinho', 'panda', 'unicornio', 'dino', 'polvo', 'pintinho'];
  var RARO = 'estrela';   // a estrela dourada: uma por máquina, difícil de achar

  function sorteador(semente) {   // mulberry32: a mesma semente faz a mesma máquina (testes e ?semente=)
    var s = (semente >>> 0) || 1;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function nova(op) {
    op = op || {};
    var nivel = NIVEIS[op.nivel] ? op.nivel : 'facil';
    var cfg = Object.assign({}, NIVEIS[nivel], op.ajustes || {});
    var rnd = sorteador(op.semente != null ? op.semente : Math.floor(Math.random() * 1e9));
    var m = {
      nivel: nivel, tema: op.tema || 'cabine', cfg: cfg, fase: 'mirar', fichas: cfg.fichas, tempo: cfg.tempo, t: 0,
      garra: { x: CASA, y: TRILHO, abertura: 0.15, balanco: 0, vb: 0, premio: null, vx: 0 },
      premios: [], ganhos: [], eventos: [], esvaziou: false,
      _dir: 0, _alvo: null, _fase: 0, _aposta: null, _tique: -1
    };

    /* ---------- os bichinhos: arrumados em pilha e assentados ---------- */
    var tipos = [];
    for (var i = 0; i < cfg.qtd - 1; i++) tipos.push(TIPOS[i % TIPOS.length]);
    for (i = tipos.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), x = tipos[i]; tipos[i] = tipos[j]; tipos[j] = x; }
    tipos.splice(Math.floor(rnd() * tipos.length), 0, RARO);
    var rMax = cfg.raio[1], cols = Math.max(1, Math.floor((L - BURACO - 6) / (2 * rMax))), lado = (L - BURACO - 6) / cols;
    tipos.forEach(function (tipo, k) {
      var r = cfg.raio[0] + rnd() * (cfg.raio[1] - cfg.raio[0]);
      if (tipo === RARO) r = cfg.raio[0];
      var c = k % cols, lin = Math.floor(k / cols);
      m.premios.push({ id: k, tipo: tipo, r: r, x: BURACO + 3 + lado * (c + 0.5) + (rnd() - 0.5) * 8, y: A - rMax - lin * 2 * rMax - rnd() * 6,
        vx: (rnd() - 0.5) * 30, vy: 0, ang: (rnd() - 0.5) * 0.8, preso: false });
    });
    // assentar com a mureta "até o teto"; depois, com a mureta de verdade, quem rolar para o buraco volta para cima
    // do monte, até a pilha ficar firme (ninguém vira prêmio antes de começar)
    for (i = 0; i < 240 * 4; i++) fisica(m, 1 / 240, 'assentar');
    for (var volta = 0; volta < 10; volta++) {
      m.premios.forEach(acordar);
      for (i = 0; i < 240 * 3; i++) fisica(m, 1 / 240, 'conferir');
      var fugiram = m.premios.filter(function (p) { return p.x < BURACO; });
      if (!fugiram.length) break;
      fugiram.forEach(function (p) { p.x = L - p.r - rnd() * 40; p.y = -p.r; p.vx = 0; p.vy = 0; });
      m.premios.forEach(acordar);
      for (i = 0; i < 240 * 3; i++) fisica(m, 1 / 240, 'assentar');
    }
    m.premios.forEach(function (p) { p.vx = 0; p.vy = 0; p.dorme = true; });

    m.mover = function (d) { m._dir = d > 0 ? 1 : d < 0 ? -1 : 0; if (m._dir) m._alvo = null; };
    m.irPara = function (x) { m._alvo = x == null ? null : x; if (x != null) m._dir = 0; };
    m.pegar = function () {
      if (m.fase !== 'mirar') return false;
      m.fase = 'descer'; m._dir = 0; m._alvo = null; m.garra.abertura = 1; m.fichas--;
      m.eventos.push({ tipo: 'ficha', fichas: m.fichas });
      return true;
    };
    m.passo = function (dt) { passo(m, Math.min(dt, 0.05), rnd); };
    m.limites = { min: CASA, max: L - 20 };
    return m;
  }

  /* ---------- a garra ---------- */
  function passo(m, dt, rnd) {
    var g = m.garra, cfg = m.cfg;
    m.t += dt;
    if (m.fase === 'mirar') {
      var vx = 0;
      if (m._dir) vx = m._dir * cfg.vel;
      else if (m._alvo != null) {
        var d = Math.max(CASA, Math.min(L - 20, m._alvo)) - g.x;
        vx = Math.abs(d) < 1 ? 0 : Math.sign(d) * Math.min(cfg.vel * 1.4, Math.abs(d) * 8);
        if (!vx) g.x = Math.max(CASA, Math.min(L - 20, m._alvo));
      }
      g.vx = vx;
      g.x = Math.max(CASA, Math.min(L - 20, g.x + vx * dt));
      g.abertura = Math.max(0.15, g.abertura - dt);
      if (cfg.tempo) {
        m.tempo = Math.max(0, m.tempo - dt);
        var s = Math.ceil(m.tempo);
        if (s <= 5 && s !== m._tique && m.tempo > 0) { m._tique = s; m.eventos.push({ tipo: 'tique', s: s }); }
        if (m.tempo <= 0) m.pegar();
      }
    } else if (m.fase === 'descer') {
      g.vx = 0;
      g.y += 165 * dt;
      var ponta = g.y + PERNA, toca = null;
      m.premios.forEach(function (p) {
        if (p.preso || p.ganho || p.x < BURACO) return;
        if (Math.hypot(p.x - g.x, p.y - ponta) < p.r * 0.92) toca = p;
      });
      if (toca || ponta >= A - 4) { m.fase = 'fechar'; m._fase = 0; }
    } else if (m.fase === 'fechar') {
      m._fase += dt;
      g.abertura = Math.max(0, 1 - m._fase / 0.45);
      if (m._fase >= 0.45) {
        var ponta2 = g.y + PERNA, melhor = null, perto = null;
        m.premios.forEach(function (p) {
          if (p.preso || p.ganho || p.x < BURACO) return;   // o que já está caindo no buraco não se pega
          var dx = Math.abs(p.x - g.x), dy = p.y - ponta2;
          if (dy < -p.r * 0.6 || dy > p.r * 1.25) return;   // a ponta precisa estar entre o alto e o meio do bichinho
          if (dx < p.r * cfg.tol && (!melhor || dx < Math.abs(melhor.x - g.x))) melhor = p;
          else if (dx < p.r * 1.3 && (!perto || dx < Math.abs(perto.x - g.x))) perto = p;
        });
        if (melhor) {
          var q = 1 - Math.abs(melhor.x - g.x) / (melhor.r * cfg.tol);
          melhor.preso = true; melhor.dorme = false; melhor.vx = 0; melhor.vy = 0; g.premio = melhor;
          acordarPerto(m, melhor, 14);   // quem estava encostado nele pode rolar
          // a chance de escorregar, decidida agora: no tranco lá em cima ou num ponto do caminho
          var chance = Math.min(0.9, cfg.escorrega * (1.5 - q));
          m._aposta = rnd() < chance ? (rnd() < 0.5 ? 'tranco' : 0.25 + rnd() * 0.6) : null;
          m.eventos.push({ tipo: 'pegou', premio: melhor.tipo, firme: q });
        } else if (perto) {
          acordar(perto); acordarPerto(m, perto, 10);
          perto.vx += Math.sign(perto.x - g.x || 1) * 90; perto.vy -= 60;   // raspou: empurra o bichinho
          m.eventos.push({ tipo: 'raspou', premio: perto.tipo });
        } else m.eventos.push({ tipo: 'errou' });
        m.fase = 'subir';
      }
    } else if (m.fase === 'subir') {
      g.y = Math.max(TRILHO, g.y - 130 * dt);
      if (g.y <= TRILHO) {
        if (g.premio && m._aposta === 'tranco') soltar(m, 'escorregou');
        g.vb += (g.premio ? 1.6 : 0.6);
        m.fase = 'levar'; m._ini = g.x;
      }
    } else if (m.fase === 'levar') {
      var antes = g.x;
      g.x = Math.max(CASA, g.x - 115 * dt);
      g.vx = (g.x - antes) / dt;
      var feito = m._ini > CASA ? (m._ini - g.x) / (m._ini - CASA) : 1;
      if (g.premio && typeof m._aposta === 'number' && feito >= m._aposta) soltar(m, 'escorregou');
      if (g.x <= CASA) { m.fase = 'soltar'; m._fase = 0; g.vx = 0; }
    } else if (m.fase === 'soltar') {
      m._fase += dt;
      g.abertura = Math.min(1, m._fase / 0.3);
      if (g.premio) soltar(m, null);
      if (m._fase >= 1.1) { m.fase = 'voltar'; m._fase = 0; }
    } else if (m.fase === 'voltar') {
      m._fase += dt;
      g.abertura = Math.max(0.15, 1 - m._fase * 2);
      var parados = m.premios.every(function (p) { return p.ganho || (Math.abs(p.vx) < 25 && Math.abs(p.vy) < 25) || p.x < BURACO; });
      if (m._fase >= 0.5 && (parados || m._fase > 2.5)) {
        var restam = m.premios.some(function (p) { return !p.ganho; });
        if (!restam) m.esvaziou = true;
        if (!m.fichas || !restam) { m.fase = 'fim'; m.eventos.push({ tipo: 'fim', ganhos: m.ganhos.length, esvaziou: m.esvaziou }); }
        else { m.fase = 'mirar'; m.tempo = m.cfg.tempo; m._tique = -1; m._aposta = null; }
      }
    }
    // balanço do que está pendurado (só enfeite e onde o bichinho fica)
    g.vb += (-g.balanco * 30 - g.vb * 2.2) * dt - g.vx * 0.002;
    g.balanco += g.vb * dt * 6;
    g.balanco = Math.max(-1, Math.min(1, g.balanco));
    if (g.premio) { g.premio.x = g.x + g.balanco * 4; g.premio.y = g.y + PERNA + g.premio.r * 0.25; }
    var n = Math.max(1, Math.ceil(dt * 240));
    for (var i = 0; i < n; i++) fisica(m, dt / n, false);
  }

  function soltar(m, motivo) {
    var g = m.garra, p = g.premio;
    if (!p) return;
    p.preso = false; p.vx = g.vx * 0.8; p.vy = 0; g.premio = null; m._aposta = null;
    if (motivo) { g.abertura = 0.7; m.eventos.push({ tipo: motivo, premio: p.tipo }); }
  }

  /* ---------- física das bolinhas ---------- */
  // Bolinhas sem atrito, empilhadas, iam escorregando devagar e a pilha "derretia". Por isso o bichinho parado DORME
  // (fica fixo, como uma pelúcia de verdade presa no monte) e só acorda quando algo bate nele com força, quando a garra
  // pega um vizinho ou quando o empurra (acordarPerto).
  // modo: 'assentar' (mureta até o teto), 'conferir' (mureta de verdade, sem contar prêmio) ou nada (jogando)
  function fixo(p) { return p.preso || p.dorme; }
  function acordar(p) { if (p.dorme) { p.dorme = false; p.sono = 0; } }
  function acordarPerto(m, alvo, folga) {
    m.premios.forEach(function (q) { if (q !== alvo && !q.ganho && Math.hypot(q.x - alvo.x, q.y - alvo.y) < q.r + alvo.r + folga) acordar(q); });
  }
  function fisica(m, dt, modo) {
    var assentando = modo === 'assentar';
    var ps = m.premios, i, j, p, q, acordados = 0;
    for (i = 0; i < ps.length; i++) {
      p = ps[i]; if (fixo(p) || p.ganho) continue;
      acordados++;
      p.vy += G * dt; p.vx *= 1 - 0.4 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.ang += p.vx * dt / p.r;
    }
    if (!acordados && !(m.garra && m.garra.premio)) return;   // tudo dormindo: nada a fazer
    for (var it = 0; it < 3; it++) {
      for (i = 0; i < ps.length; i++) {
        p = ps[i]; if (p.ganho) continue;
        for (j = i + 1; j < ps.length; j++) {
          q = ps[j]; if (q.ganho || (fixo(p) && fixo(q))) continue;
          var dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy), min = p.r + q.r;
          if (d >= min || d < 1e-6) continue;
          var nx = dx / d, ny = dy / d, sobra = min - d;
          var rv = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
          // batida forte (ou o bichinho da garra passando) acorda quem dorme
          if (p.dorme && (q.preso || rv < -70)) acordar(p);
          if (q.dorme && (p.preso || rv < -70)) acordar(q);
          var wp = fixo(p) ? 0 : fixo(q) ? 1 : 0.5, wq = 1 - wp;
          p.x -= nx * sobra * wp; p.y -= ny * sobra * wp; q.x += nx * sobra * wq; q.y += ny * sobra * wq;
          if (rv < 0) {
            var imp = -rv * 1.1;   // quase sem quicar
            p.vx -= nx * imp * wp; p.vy -= ny * imp * wp;
            q.vx += nx * imp * wq; q.vy += ny * imp * wq;
          }
          // atrito entre os dois (pelúcia não escorrega muito)
          var tx = -ny, ty = nx, tv = (q.vx - p.vx) * tx + (q.vy - p.vy) * ty;
          if (!fixo(p)) { p.vx += tx * tv * 0.08 * wp * 2; p.vy += ty * tv * 0.08 * wp * 2; }
          if (!fixo(q)) { q.vx -= tx * tv * 0.08 * wq * 2; q.vy -= ty * tv * 0.08 * wq * 2; }
        }
      }
      for (i = 0; i < ps.length; i++) {
        p = ps[i]; if (fixo(p) || p.ganho) continue;
        if (p.x - p.r < 0) { p.x = p.r; p.vx = Math.abs(p.vx) * 0.2; }
        if (p.x + p.r > L) { p.x = L - p.r; p.vx = -Math.abs(p.vx) * 0.2; }
        if (p.x >= BURACO && p.y + p.r > A) { p.y = A - p.r; if (p.vy > 0) p.vy = -p.vy * 0.12; if (Math.abs(p.vy) < 30) p.vy = 0; p.vx *= 0.9; }
        // mureta: o segmento de (BURACO, topo) até (BURACO, A); assentando, ela vai até o teto
        var topo = assentando ? -1000 : MURETA, cy = Math.max(topo, Math.min(A, p.y)), ddx = p.x - BURACO, ddy = p.y - cy, dd = Math.hypot(ddx, ddy);
        if (dd < p.r) {
          var ux, uy;
          if (dd < 1e-6) { ux = p.x < BURACO ? -1 : 1; uy = 0; } else { ux = ddx / dd; uy = ddy / dd; }
          p.x = BURACO + ux * p.r; p.y = cy + uy * p.r;
          var vn = p.vx * ux + p.vy * uy;
          if (vn < 0) { p.vx -= ux * vn * 1.15; p.vy -= uy * vn * 1.15; }
        }
        if (modo === 'conferir' && p.y - p.r > A + 4) { p.y = A + p.r + 4; p.vy = 0; p.vx = 0; continue; }   // espera no fundo do buraco
        if (!modo && p.y - p.r > A + 4 && !p.ganho) {   // caiu pelo buraco: é prêmio!
          p.ganho = true; m.ganhos.push(p.tipo);
          m.eventos.push({ tipo: 'ganhou', premio: p.tipo, total: m.ganhos.length });
        }
      }
    }
    // quem ficou quietinho por um tempo dorme (no buraco, nunca: tem que cair)
    for (i = 0; i < ps.length; i++) {
      p = ps[i]; if (fixo(p) || p.ganho) continue;
      if (Math.hypot(p.vx, p.vy) < 12 && p.x >= BURACO) { p.sono = (p.sono || 0) + dt; if (p.sono > 0.35) { p.dorme = true; p.vx = 0; p.vy = 0; } }
      else p.sono = 0;
    }
  }

  var M = { nova: nova, NIVEIS: NIVEIS, TIPOS: TIPOS, RARO: RARO, medidas: { L: L, A: A, BURACO: BURACO, MURETA: MURETA, TRILHO: TRILHO, PERNA: PERNA, CASA: CASA } };
  if (typeof module !== 'undefined' && module.exports) module.exports = M; else raiz.Maquina = M;
})(typeof self !== 'undefined' ? self : this);
