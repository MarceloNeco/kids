/* H-rraaa (pasta a-garra) — a máquina por dentro, em 3D: os prêmios (bolas que caem, rolam, se empilham e "dormem" quando param), a
   garra (anda para os lados e para frente/trás, desce, fecha, sobe e leva até o buraco) e a regra de pagamento,
   igual à das máquinas de verdade: quase sempre a garra fecha FRACA e deixa cair; só de vez em quando vem FORTE.
   Sem desenho e sem tela: roda igual no navegador e no Node (testes em teste/maquina.test.js).

   Uso:
     var m = Maquina.nova({ nivel: 'dificil', tipos: ['urso', ...], raro: 'urso-dourado', vivos: false, andam: false, semente: 7 });
     (vivos: os de cima dão pulinhos; andam: os bichos ficam de pé e, de vez em quando, dão uma voltinha pelo monte)
     m.mover(dx, dz)     segurar as setas (-1, 0 ou 1 em cada eixo; 0, 0 = soltou)   m.irPara(x, z) levar até (dedo)
     m.pegar()           desce a garra (só na fase "mirar")                          m.passo(dt)    anda dt segundos
     m.fase              'mirar' 'descer' 'fechar' 'subir' 'levar' 'soltar' 'voltar' 'fim'
     m.garra             { x, y, z, abertura (0 fechada a 1 aberta), premio, forca ('forte' | 'fraca' | null) }
     m.premios           [{ id, tipo, x, y, z, r, q: [x, y, z, w] (giro), yaw, passeio (> 0 = andando), dorme, preso, ganho }]
     m.ganhos [tipo, ...]   m.fichas   m.tempo   m.semGanhar (tentativas desde o último prêmio)
     m.eventos           fila que o app esvazia: { tipo: 'ficha' | 'pegou' | 'raspou' | 'errou' | 'escorregou' |
                         'ganhou' | 'pulo' | 'tique' | 'fim', ... }
   Medidas (unidades da máquina, ~10 cm): o vidro tem L (x, esquerda → direita) × P (z, fundo → frente) × A (y, chão →
   teto). O buraco do prêmio fica na frente, à esquerda (x < BX, z > P − BZ), cercado por duas paredes de acrílico de
   altura AB; ali não tem chão: quem cai lá dentro é prêmio. */
(function (raiz) {
  'use strict';
  var L = 6, P = 5, A = 7, BX = 1.5, BZ = 1.5, AB = 1.5, TRILHO = 6.3, PERNA = 0.9, G = 40;
  var CASA = { x: BX / 2, z: P - BZ / 2 };
  var LIM = { x0: 0.45, x1: L - 0.45, z0: 0.45, z1: P - 0.45 };

  // cada nível: fichas, segundos para mirar (0 = sem relógio), quantos prêmios e de que tamanho, tol (quão perto do meio
  // a garra precisa fechar: 1 = até a borda) e cada (a garra vem forte mais ou menos 1 vez a cada "cada" tentativas;
  // depois de "cada − 1" tentativas sem prêmio, a próxima bem mirada vem forte com certeza)
  var NIVEIS = {
    facil: { fichas: 12, tempo: 0, qtd: 42, raio: [0.5, 0.58], tol: 0.9, cada: 4, vel: 1.5 },
    medio: { fichas: 10, tempo: 25, qtd: 54, raio: [0.44, 0.52], tol: 0.75, cada: 7, vel: 1.7 },
    dificil: { fichas: 10, tempo: 15, qtd: 70, raio: [0.38, 0.46], tol: 0.6, cada: 10, vel: 1.9 }
  };

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
    if (op.qtdFator) cfg.qtd = Math.round(cfg.qtd * op.qtdFator);   // ex.: os bichos que andam são menos e maiores, soltos no chão
    if (op.raioFator) cfg.raio = cfg.raio.map(function (r) { return r * op.raioFator; });
    var rnd = sorteador(op.semente != null ? op.semente : Math.floor(Math.random() * 1e9));
    var tiposBase = (op.tipos && op.tipos.length) ? op.tipos : ['bola'];
    var m = {
      nivel: nivel, cfg: cfg, fase: 'mirar', fichas: cfg.fichas, tempo: cfg.tempo, t: 0, vivos: !!op.vivos, andam: !!op.andam,
      garra: { x: CASA.x, y: TRILHO, z: CASA.z, abertura: 0.2, premio: null, forca: null, vx: 0, vz: 0, balanco: [0, 0], vb: [0, 0] },
      premios: [], ganhos: [], eventos: [], esvaziou: false, semGanhar: op.semGanhar || 0,
      _dx: 0, _dz: 0, _alvo: null, _fase: 0, _queda: null, _tique: -1, _rnd: rnd
    };

    /* ---------- os prêmios: sortidos (cada partida é diferente), jogados de cima, assentados e conferidos ---------- */
    // quantos: o total varia um pouco; cada tipo aparece pelo menos uma vez e o resto é sorteado com pesos sorteados
    // (numa partida tem muito ursinho, na outra quase nenhum); o monte tem um "pico" sorteado (mais alto no fundo, num lado...)
    var total = Math.round(cfg.qtd * (0.88 + rnd() * 0.24)) - (op.raro ? 1 : 0);
    var pesos = tiposBase.map(function () { return 0.25 + rnd() * rnd() * 3; }), soma = pesos.reduce(function (a, b) { return a + b; }, 0);
    var tipos = tiposBase.slice(0, total);
    for (var i = tipos.length; i < total; i++) {
      var sorte = rnd() * soma, j = 0;
      while (j < pesos.length - 1 && sorte > pesos[j]) { sorte -= pesos[j]; j++; }
      tipos.push(tiposBase[j]);
    }
    for (i = tipos.length - 1; i > 0; i--) { j = Math.floor(rnd() * (i + 1)); var x = tipos[i]; tipos[i] = tipos[j]; tipos[j] = x; }
    if (op.raro) tipos.splice(Math.floor(rnd() * tipos.length), 0, op.raro);
    m._monte = { x: BX + 0.8 + rnd() * (L - BX - 1.6), z: 0.6 + rnd() * (P - 1.4), forca: 0.25 + rnd() * 0.5 };
    tipos.forEach(function (tipo, k) {
      var r = (cfg.raio[0] + rnd() * (cfg.raio[1] - cfg.raio[0])) * (rnd() < 0.12 ? 1.15 : 1);
      var p = { id: k, tipo: tipo, r: r, vx: 0, vy: 0, vz: 0, preso: false, dorme: false, sono: 0, ganho: false, yaw: rnd() * Math.PI * 2 };
      p.q = girar([0, 0, 0, 1], [0, 1, 0], p.yaw);
      if (!m.andam) {
        if (rnd() < 0.45) p.q = giroQualquer(rnd);   // caído de qualquer jeito: de costas, de lado, de cabeça para baixo
        else p.q = girar(p.q, [1, 0, 0], (rnd() - 0.5) * 1.4);
      }
      soltarDeCima(p, rnd, k, m._monte);
      m.premios.push(p);
    });
    // assentar com as paredes do buraco até o teto; depois, com as paredes de verdade, quem cair no buraco volta para cima
    // do monte, até a pilha ficar firme (ninguém vira prêmio antes de começar)
    for (i = 0; i < 240 * 5; i++) fisica(m, 1 / 240, 'assentar');
    for (var volta = 0; volta < 10; volta++) {
      m.premios.forEach(acordar);
      for (i = 0; i < 240 * 3; i++) fisica(m, 1 / 240, 'conferir');
      var fugiram = m.premios.filter(noBuraco);
      if (!fugiram.length) break;
      fugiram.forEach(function (p) { soltarDeCima(p, rnd, 0, m._monte); });
      for (i = 0; i < 240 * 3; i++) fisica(m, 1 / 240, 'assentar');
    }
    m.premios.forEach(function (p) { p.vx = p.vy = p.vz = 0; p.dorme = true; p.proximoPulo = 2 + rnd() * 6; p.proximoPasseio = 1 + rnd() * 6; p.passeio = 0; });

    m.mover = function (dx, dz) { m._dx = Math.sign(dx || 0); m._dz = Math.sign(dz || 0); if (m._dx || m._dz) m._alvo = null; };
    m.irPara = function (x, z) { m._alvo = x == null ? null : { x: x, z: z }; if (x != null) { m._dx = 0; m._dz = 0; } };
    m.pegar = function () {
      if (m.fase !== 'mirar') return false;
      m.fase = 'descer'; m._dx = m._dz = 0; m._alvo = null; m.garra.abertura = 1; m.fichas--;
      m.eventos.push({ tipo: 'ficha', fichas: m.fichas });
      return true;
    };
    m.passo = function (dt) { passo(m, Math.min(dt, 0.05)); };
    m.limites = LIM;
    return m;
  }
  function soltarDeCima(p, rnd, k, monte) {
    var area = (L * P - BX * BZ);
    do {
      p.x = p.r + rnd() * (L - 2 * p.r); p.z = p.r + rnd() * (P - 2 * p.r);
      if (monte && rnd() < monte.forca) { p.x += (monte.x - p.x) * rnd() * 0.8; p.z += (monte.z - p.z) * rnd() * 0.8; }   // puxa para o pico do monte
    } while (p.x < BX + p.r && p.z > P - BZ - p.r);
    p.y = 1 + (k / Math.max(1, area)) * 1.4 + rnd() * 2.5;
    p.vx = p.vy = p.vz = 0;
  }
  function noBuraco(p) { return p.x < BX && p.z > P - BZ; }

  /* ---------- a garra ---------- */
  function passo(m, dt) {
    var g = m.garra, cfg = m.cfg, rnd = m._rnd;
    m.t += dt;
    g.vx = 0; g.vz = 0;
    if (m.fase === 'mirar') {
      if (m._dx || m._dz) { g.vx = m._dx * cfg.vel; g.vz = m._dz * cfg.vel; }
      else if (m._alvo) {
        var ax = clamp(m._alvo.x, LIM.x0, LIM.x1) - g.x, az = clamp(m._alvo.z, LIM.z0, LIM.z1) - g.z, d = Math.hypot(ax, az);
        if (d < 0.01) { g.x += ax; g.z += az; }
        else { var v = Math.min(cfg.vel * 1.3, d * 6); g.vx = ax / d * v; g.vz = az / d * v; }
      }
      g.x = clamp(g.x + g.vx * dt, LIM.x0, LIM.x1); g.z = clamp(g.z + g.vz * dt, LIM.z0, LIM.z1);
      g.abertura = Math.max(0.2, g.abertura - dt);
      if (cfg.tempo) {
        m.tempo = Math.max(0, m.tempo - dt);
        var s = Math.ceil(m.tempo);
        if (s <= 5 && s !== m._tique && m.tempo > 0) { m._tique = s; m.eventos.push({ tipo: 'tique', s: s }); }
        if (m.tempo <= 0) m.pegar();
      }
    } else if (m.fase === 'descer') {
      g.y -= 1.7 * dt;
      var ponta = [g.x, g.y - PERNA, g.z], toca = false;
      m.premios.forEach(function (p) { if (!p.ganho && !p.preso && !noBuraco(p) && dist3(p, ponta) < p.r * 0.95) toca = true; });
      // encostou: a garra ainda afunda um pouquinho no monte macio antes de fechar
      if (toca && m._afunda == null) m._afunda = g.y - 0.3;
      if ((m._afunda != null && g.y <= m._afunda) || ponta[1] <= 0.12) { m.fase = 'fechar'; m._fase = 0; m._afunda = null; }
    } else if (m.fase === 'fechar') {
      m._fase += dt;
      g.abertura = Math.max(0, 1 - m._fase / 0.5);
      if (m._fase >= 0.5) fechou(m, rnd);
    } else if (m.fase === 'subir') {
      var antes = g.y;
      g.y = Math.min(TRILHO, g.y + 1.3 * dt);
      m._subiu = (m._subiu || 0) + (g.y - antes);
      if (g.premio && g.forca === 'fraca') g.abertura = Math.min(0.28, g.abertura + dt * 0.5);   // a garra fraca afrouxa
      if (g.premio && m._queda === 'logo' && m._subiu > 0.55) soltar(m, 'escorregou');
      if (g.y >= TRILHO) {
        if (g.premio && m._queda === 'tranco') soltar(m, 'escorregou');
        g.vb[0] += g.premio ? 1.2 : 0.4;
        m.fase = 'levar'; m._ini = { x: g.x, z: g.z };
      }
    } else if (m.fase === 'levar') {
      var lx = CASA.x - g.x, lz = CASA.z - g.z, ld = Math.hypot(lx, lz);
      if (ld < 0.02) { g.x = CASA.x; g.z = CASA.z; m.fase = 'soltar'; m._fase = 0; }
      else { var vl = Math.min(1.4, ld * 5); g.vx = lx / ld * vl; g.vz = lz / ld * vl; g.x += g.vx * dt; g.z += g.vz * dt; }
      var total = Math.hypot(m._ini.x - CASA.x, m._ini.z - CASA.z) || 1, feito = 1 - Math.hypot(g.x - CASA.x, g.z - CASA.z) / total;
      if (g.premio && typeof m._queda === 'number' && feito >= m._queda) soltar(m, 'escorregou');
    } else if (m.fase === 'soltar') {
      m._fase += dt;
      g.abertura = Math.min(1, m._fase / 0.3);
      if (g.premio) soltar(m, null);
      if (m._fase >= 1.0) { m.fase = 'voltar'; m._fase = 0; }
    } else if (m.fase === 'voltar') {
      m._fase += dt;
      g.abertura = Math.max(0.2, 1 - m._fase * 2);
      var parados = m.premios.every(function (p) { return p.ganho || p.dorme || noBuraco(p); });
      if (m._fase >= 0.6 && (parados || m._fase > 3)) {
        var restam = m.premios.some(function (p) { return !p.ganho; });
        if (!restam) m.esvaziou = true;
        if (!m.fichas || !restam) { m.fase = 'fim'; m.eventos.push({ tipo: 'fim', ganhos: m.ganhos.length, esvaziou: m.esvaziou }); }
        else { m.fase = 'mirar'; m.tempo = cfg.tempo; m._tique = -1; m._queda = null; g.forca = null; }
      }
    }
    // balanço do que está pendurado (enfeite e onde o prêmio fica)
    for (var e = 0; e < 2; e++) {
      var vel = e ? g.vz : g.vx;
      g.vb[e] += (-g.balanco[e] * 30 - g.vb[e] * 2.4) * dt - vel * 0.05;
      g.balanco[e] = clamp(g.balanco[e] + g.vb[e] * dt * 4, -0.35, 0.35);
    }
    if (g.premio) { var pr = g.premio; pr.x = g.x + g.balanco[0] * 0.5; pr.z = g.z + g.balanco[1] * 0.5; pr.y = g.y - PERNA + pr.r * 0.45; }
    // bichinhos vivos: de vez em quando, um que está por cima dá um pulinho (para longe do buraco)
    if (m.vivos && m.fase !== 'fim') m.premios.forEach(function (p) {
      if (p.ganho || p.preso || !p.dorme) return;
      p.proximoPulo -= dt;
      if (p.proximoPulo > 0) return;
      p.proximoPulo = 3 + rnd() * 7;
      var livre = !m.premios.some(function (q) { return q !== p && !q.ganho && q.y > p.y && Math.hypot(q.x - p.x, q.z - p.z) < p.r + q.r; });
      if (!livre || Math.hypot(p.x - g.x, p.z - g.z) < 0.8) return;
      acordar(p); p.vy = 5 + rnd() * 2; p.vx = 0.6 + rnd() * 0.6; p.vz = -(0.3 + rnd() * 0.6);
      m.eventos.push({ tipo: 'pulo', premio: p.tipo, id: p.id });
    });
    // bichos que andam (Zoológico): de vez em quando um que está por cima levanta e dá uma voltinha pelo monte
    if (m.andam && m.fase !== 'fim') m.premios.forEach(function (p) {
      if (p.ganho || p.preso) { p.passeio = 0; return; }
      if (p.passeio > 0) {
        p.passeio -= dt;
        var perto = Math.hypot(p.x - g.x, p.z - g.z) < 1.1 && (m.fase === 'descer' || m.fase === 'fechar');
        if (perto) p.passeio = 0;
        // longe do buraco e das paredes: vira para o outro lado
        if (p.x < BX + 0.8 && p.z > P - BZ - 0.8) p.yaw = Math.atan2(1, -1);
        if (p.x < p.r + 0.15) p.yaw = Math.atan2(1, Math.cos(p.yaw)); else if (p.x > L - p.r - 0.15) p.yaw = Math.atan2(-1, Math.cos(p.yaw));
        if (p.z < p.r + 0.15) p.yaw = Math.atan2(Math.sin(p.yaw), 1); else if (p.z > P - p.r - 0.15) p.yaw = Math.atan2(Math.sin(p.yaw), -1);
        if (p.passeio > 0) { acordar(p); p.vx = Math.sin(p.yaw) * 0.75; p.vz = Math.cos(p.yaw) * 0.75; }
        else { p.vx = 0; p.vz = 0; }
        return;
      }
      if (!p.dorme) return;
      p.proximoPasseio -= dt;
      if (p.proximoPasseio > 0) return;
      p.proximoPasseio = 2 + rnd() * 6;
      var livre = !m.premios.some(function (q) { return q !== p && !q.ganho && q.y > p.y && Math.hypot(q.x - p.x, q.z - p.z) < p.r + q.r; });
      if (!livre || Math.hypot(p.x - g.x, p.z - g.z) < 1.1) return;
      p.yaw = rnd() * Math.PI * 2; p.passeio = 1.2 + rnd() * 1.8; acordar(p);
      m.eventos.push({ tipo: 'anda', premio: p.tipo, id: p.id });
    });
    var n = Math.max(1, Math.ceil(dt * 240));
    for (var i = 0; i < n; i++) fisica(m, dt / n, null);
    if (m.andam) m.premios.forEach(function (p) { if (!p.ganho) p.q = girar([0, 0, 0, 1], [0, 1, 0], p.yaw); });   // sempre de pé
  }

  // a garra fechou: pega ou não pega, e se pega, decide já se vem forte ou se vai soltar (e quando)
  function fechou(m, rnd) {
    var g = m.garra, cfg = m.cfg, ponta = g.y - PERNA, melhor = null, perto = null;
    m.premios.forEach(function (p) {
      if (p.preso || p.ganho || noBuraco(p)) return;
      var d = Math.hypot(p.x - g.x, p.z - g.z), h = ponta - p.y;   // altura da ponta em relação ao meio do prêmio
      if (h > p.r * 1.0 || h < -p.r * 0.7) return;   // a ponta precisa estar entre o alto e um pouco abaixo do meio
      if (d < p.r * cfg.tol && (!melhor || d < melhor._d)) { melhor = p; p._d = d; }
      else if (d < p.r * 1.4 && (!perto || d < perto._d)) { perto = p; p._d = d; }
    });
    m.semGanhar++;
    if (melhor) {
      var q = 1 - melhor._d / (melhor.r * cfg.tol);
      var forte = q >= 0.3 && (rnd() < 1 / (3 * cfg.cada) || m.semGanhar >= cfg.cada + 1);
      if (cfg.sempreForte) forte = true;
      if (cfg.nuncaForte) forte = false;
      melhor.preso = true; melhor.dorme = false; melhor.vx = melhor.vy = melhor.vz = 0; g.premio = melhor;
      g.forca = forte ? 'forte' : 'fraca';
      var sorte = rnd();
      m._queda = forte ? null : sorte < 0.55 ? 'logo' : sorte < 0.85 ? 'tranco' : 0.2 + rnd() * 0.6;
      m._subiu = 0;
      acordarPerto(m, melhor, 0.2);
      m.eventos.push({ tipo: 'pegou', premio: melhor.tipo, firme: q, forte: forte });
    } else if (perto) {
      acordar(perto); acordarPerto(m, perto, 0.15);
      var ux = perto.x - g.x, uz = perto.z - g.z, ud = Math.hypot(ux, uz) || 1;
      perto.vx += ux / ud * 1.4; perto.vz += uz / ud * 1.4; perto.vy += 1.2;   // raspou: empurra o prêmio
      m.eventos.push({ tipo: 'raspou', premio: perto.tipo });
    } else m.eventos.push({ tipo: 'errou' });
    m.fase = 'subir'; m._subiu = 0;
  }

  function soltar(m, motivo) {
    var g = m.garra, p = g.premio;
    if (!p) return;
    p.preso = false; p.vx = g.vx * 0.8; p.vz = g.vz * 0.8; p.vy = 0; p.sono = 0; g.premio = null; m._queda = null;
    if (motivo) { g.abertura = 0.55; m.eventos.push({ tipo: motivo, premio: p.tipo }); }
  }

  /* ---------- física das bolas ---------- */
  // Bolas sem atrito empilhadas vão escorregando devagar e o monte "derrete". Por isso a bola parada DORME (fica fixa,
  // como a pelúcia presa no monte) e só acorda quando algo bate nela com força, quando a garra pega ou empurra perto dela.
  // modo: 'assentar' (paredes do buraco até o teto), 'conferir' (paredes de verdade, sem contar prêmio) ou null (jogando)
  function fixo(p) { return p.preso || p.dorme; }
  function acordar(p) { if (p.dorme) { p.dorme = false; p.sono = 0; } }
  function acordarPerto(m, alvo, folga) {
    m.premios.forEach(function (q) { if (q !== alvo && !q.ganho && dist3(q, [alvo.x, alvo.y, alvo.z]) < q.r + alvo.r + folga) acordar(q); });
  }
  function fisica(m, dt, modo) {
    var ps = m.premios, i, j, p, q, acordados = 0, ab = modo === 'assentar' ? A : AB;
    for (i = 0; i < ps.length; i++) {
      p = ps[i]; if (fixo(p) || p.ganho) continue;
      acordados++;
      p.vy -= G * dt; var arrasto = 1 - 0.5 * dt; p.vx *= arrasto; p.vz *= arrasto;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      var w = Math.hypot(p.vx, p.vz);
      if (w > 0.01 && !m.andam) p.q = girar(p.q, [p.vz / w, 0, -p.vx / w], w * dt / p.r);   // rola (os bichos que andam ficam de pé)
    }
    if (!acordados && !m.garra.premio) return;   // tudo dormindo: nada a fazer
    var paredes = [[BX - 0.03, 0, P - BZ, BX + 0.03, ab, P], [0, 0, P - BZ - 0.03, BX, ab, P - BZ + 0.03]];
    for (var it = 0; it < 3; it++) {
      for (i = 0; i < ps.length; i++) {
        p = ps[i]; if (p.ganho) continue;
        for (j = i + 1; j < ps.length; j++) {
          q = ps[j]; if (q.ganho || (fixo(p) && fixo(q))) continue;
          var dx = q.x - p.x, dy = q.y - p.y, dz = q.z - p.z, min = p.r + q.r;
          if (Math.abs(dx) >= min || Math.abs(dy) >= min || Math.abs(dz) >= min) continue;
          var d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (d >= min || d < 1e-6) continue;
          var nx = dx / d, ny = dy / d, nz = dz / d, sobra = min - d;
          var rv = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny + (q.vz - p.vz) * nz;
          if (p.dorme && (q.preso || rv < -2.5)) acordar(p);   // batida forte (ou o prêmio da garra passando) acorda
          if (q.dorme && (p.preso || rv < -2.5)) acordar(q);
          var wp = fixo(p) ? 0 : fixo(q) ? 1 : 0.5, wq = 1 - wp;
          p.x -= nx * sobra * wp; p.y -= ny * sobra * wp; p.z -= nz * sobra * wp;
          q.x += nx * sobra * wq; q.y += ny * sobra * wq; q.z += nz * sobra * wq;
          if (rv < 0) {
            var imp = -rv * 1.1;   // quase sem quicar
            p.vx -= nx * imp * wp; p.vy -= ny * imp * wp; p.vz -= nz * imp * wp;
            q.vx += nx * imp * wq; q.vy += ny * imp * wq; q.vz += nz * imp * wq;
          }
          // atrito (pelúcia não escorrega muito): tira um pouco da velocidade de lado entre os dois
          var rx = q.vx - p.vx, ry = q.vy - p.vy, rz = q.vz - p.vz, rn = rx * nx + ry * ny + rz * nz;
          rx -= rn * nx; ry -= rn * ny; rz -= rn * nz;
          var f = 0.12;
          p.vx += rx * f * wp; p.vy += ry * f * wp; p.vz += rz * f * wp;
          q.vx -= rx * f * wq; q.vy -= ry * f * wq; q.vz -= rz * f * wq;
        }
      }
      for (i = 0; i < ps.length; i++) {
        p = ps[i]; if (fixo(p) || p.ganho) continue;
        if (p.x - p.r < 0) { p.x = p.r; p.vx = Math.abs(p.vx) * 0.2; }
        if (p.x + p.r > L) { p.x = L - p.r; p.vx = -Math.abs(p.vx) * 0.2; }
        if (p.z - p.r < 0) { p.z = p.r; p.vz = Math.abs(p.vz) * 0.2; }
        if (p.z + p.r > P) { p.z = P - p.r; p.vz = -Math.abs(p.vz) * 0.2; }
        if (!noBuraco(p) && p.y - p.r < 0) { p.y = p.r; if (p.vy < 0) p.vy = -p.vy * 0.1; if (Math.abs(p.vy) < 1) p.vy = 0; p.vx *= 0.9; p.vz *= 0.9; }
        for (var k = 0; k < 2; k++) bater(p, paredes[k]);
        if (modo === 'conferir' && p.y < -p.r * 2) { p.y = -p.r * 2; p.vx = p.vy = p.vz = 0; continue; }   // espera no fundo do buraco
        if (!modo && p.y < -p.r * 1.5 && !p.ganho) {   // caiu pelo buraco: é prêmio!
          p.ganho = true; m.ganhos.push(p.tipo); m.semGanhar = 0;
          m.eventos.push({ tipo: 'ganhou', premio: p.tipo, total: m.ganhos.length });
        }
      }
    }
    // quem ficou quietinho por um tempo dorme (no buraco, nunca: tem que cair)
    for (i = 0; i < ps.length; i++) {
      p = ps[i]; if (fixo(p) || p.ganho) continue;
      if (Math.hypot(p.vx, p.vy, p.vz) < 0.35 && !noBuraco(p)) { p.sono += dt; if (p.sono > 0.35) { p.dorme = true; p.vx = p.vy = p.vz = 0; } }
      else p.sono = 0;
    }
  }
  // bola contra uma caixa fina (parede de acrílico do buraco)
  function bater(p, c) {
    var cx = clamp(p.x, c[0], c[3]), cy = clamp(p.y, c[1], c[4]), cz = clamp(p.z, c[2], c[5]);
    var dx = p.x - cx, dy = p.y - cy, dz = p.z - cz, d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d >= p.r) return;
    var nx, ny, nz;
    if (d < 1e-6) {   // o centro está dentro da parede: sai para o lado mais perto
      var lado = (c[3] - c[0] < c[5] - c[2]) ? 'x' : 'z';
      nx = lado === 'x' ? (p.x < (c[0] + c[3]) / 2 ? -1 : 1) : 0; nz = lado === 'z' ? (p.z < (c[2] + c[5]) / 2 ? -1 : 1) : 0; ny = 0;
      d = 0;
    } else { nx = dx / d; ny = dy / d; nz = dz / d; }
    var s = p.r - d;
    p.x += nx * s; p.y += ny * s; p.z += nz * s;
    var vn = p.vx * nx + p.vy * ny + p.vz * nz;
    if (vn < 0) { p.vx -= nx * vn * 1.15; p.vy -= ny * vn * 1.15; p.vz -= nz * vn * 1.15; }
  }

  /* ---------- contas ---------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function dist3(p, c) { var dx = p.x - c[0], dy = p.y - c[1], dz = p.z - c[2]; return Math.sqrt(dx * dx + dy * dy + dz * dz); }
  function giroQualquer(rnd) {   // um giro qualquer, todos com a mesma chance (Shoemake)
    var u1 = rnd(), u2 = rnd() * Math.PI * 2, u3 = rnd() * Math.PI * 2, a = Math.sqrt(1 - u1), b = Math.sqrt(u1);
    return [a * Math.sin(u2), a * Math.cos(u2), b * Math.sin(u3), b * Math.cos(u3)];
  }
  function girar(q, eixo, ang) {   // gira o quatérnio q em volta de um eixo do mundo: rot * q
    var s = Math.sin(ang / 2), rx = eixo[0] * s, ry = eixo[1] * s, rz = eixo[2] * s, rw = Math.cos(ang / 2);
    var x = rw * q[0] + rx * q[3] + ry * q[2] - rz * q[1];
    var y = rw * q[1] - rx * q[2] + ry * q[3] + rz * q[0];
    var z = rw * q[2] + rx * q[1] - ry * q[0] + rz * q[3];
    var w = rw * q[3] - rx * q[0] - ry * q[1] - rz * q[2];
    var l = Math.sqrt(x * x + y * y + z * z + w * w) || 1;
    return [x / l, y / l, z / l, w / l];
  }

  var M = { nova: nova, NIVEIS: NIVEIS, medidas: { L: L, P: P, A: A, BX: BX, BZ: BZ, AB: AB, TRILHO: TRILHO, PERNA: PERNA, CASA: CASA, LIM: LIM } };
  if (typeof module !== 'undefined' && module.exports) module.exports = M; else raiz.Maquina = M;
})(typeof self !== 'undefined' ? self : this);
