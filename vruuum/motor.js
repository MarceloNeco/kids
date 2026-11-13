/* Vruuum! — as regras da corrida: velocidade, volante, curvas, estrelas, batidas, turbo, rampa,
   trânsito e chegada. Puro (sem tela): o app manda as entradas, o motor devolve o estado e uma
   lista de eventos (para som e efeitos). Roda no navegador e no Node (testes).
   Ninguém perde a corrida: bater só deixa o carro mais lento e derruba umas estrelas. */
(function (raiz) {
  'use strict';
  var P = raiz.VruuumPista || (typeof require === 'function' ? require('./pista.js') : null);
  var SEG = P.SEG;
  var CONTAGEM = 3;        // 3-2-1
  var TURBO = 2.5;         // segundos de turbo
  var PULO = 1.1;          // segundos no ar depois da rampa
  var PULINHO = 0.75;      // segundos no ar com o botão PULAR
  var RECARGA = 1.3;       // segundos até poder pular de novo (contando o tempo no ar)
  var RODANDO = 0.9;       // segundos rodopiando depois de bater num carro
  var DEPOIS_DO_FIM = 3;   // segundos de festa depois que todos chegam
  // pontos (ninguém perde a corrida, mas o placar sobe e desce)
  var PONTOS = { estrela: 100, estrelaAr: 200, turbo: 50, rampa: 50, checkpoint: 500, chegada: 1000, cone: -50, batida: -150, looping: 300, miniturbo: 40, splat: 150 };
  // derrapagem: segurando para dentro numa curva, rápido. Ao soltar, um turbinho do tamanho da derrapagem
  var DERRAPA = [0.6, 1.4, 2.4];          // segundos derrapando para o nível 1 (faísca azul), 2 (laranja), 3 (roxa)
  var MINI_TURBO = [0, 0.7, 1.1, 1.6];    // segundos de turbo ao soltar, por nível
  function nivelDerrapa(t) { return t >= DERRAPA[2] ? 3 : t >= DERRAPA[1] ? 2 : t >= DERRAPA[0] ? 1 : 0; }
  // caixa surpresa: a roleta gira um pouquinho e o poder já vale sozinho (criança não precisa de botão)
  var ROLETA = 1.1, ESCUDO = 6, FOGUETE = 3;
  var PONTOS_LUGAR = [800, 400, 200];   // 1º, 2º e 3º lugar na chegada
  var TOQUE = { estrela: 0.28, cone: 0.24, lama: 0.3, turbo: 0.3, rampa: 0.3, caixa: 0.33 };

  // rivais (personagens): configs = [{ id, veic, mod: { vel, curva } }]
  function novaCorrida(nivel, semente, nJogadores, configs) {
    var pista = P.montar(nivel, semente);
    var n = nJogadores === 2 ? 2 : 1, jogadores = [];
    for (var k = 0; k < n; k++) {
      jogadores.push({ n: k, x: n === 2 ? (k ? 0.4 : -0.4) : 0, z: 1000, vel: 0, estrelas: 0, pontos: 0, tCheck: 0, turbo: 0, pulo: 0, puloMax: 0, recarga: 0, rodando: 0, tremor: 0, chegou: false, tempo: 0, batidas: 0, mundo: 0, fora: false, empurrao: 0, derrapa: 0, ladoDerrapa: 0, roleta: 0, poder: null, escudo: 0, foguete: 0, loop: null, loopings: 0 });
    }
    return {
      pista: pista, jogadores: jogadores,
      carros: pista.carros.map(function (c) { return { z: c.z, x: c.x, vel: c.vel, tipo: c.tipo }; }),
      fase: 'contagem', contagem: CONTAGEM, t: 0, depoisDoFim: 0, eventos: [], tiros: [],
      rivais: (configs || []).map(function (cf, k) {
        var faixa = P.FAIXAS[(k + 1) % 3];
        return { r: k, id: cf.id, veic: cf.veic, cor: cf.cor, mod: cf.mod || {}, x: faixa, faixa: faixa, z: 1000 + (k % 2 ? -1 : 1) * SEG * (1 + k), vel: 0, garra: 0.94 + ((semente >> k) % 7) * 0.01, chegou: false, tempo: 0, lento: 0, pensa: 0, turbo: 0, gosma: 0, proxTurbo: 4 + k * 1.7 };
      })
    };
  }

  function somar(e, j, p, motivo) {
    var antes = j.pontos; j.pontos = Math.max(0, j.pontos + p);
    if (j.pontos !== antes) e.eventos.push({ tipo: 'pontos', j: j.n, p: j.pontos - antes, motivo: motivo });
  }
  // bônus de tempo: quanto mais rápido no trecho, mais pontos (alvo = trecho em velocidade quase cheia)
  function bonusTempo(e, j, segs) {
    var alvo = segs * SEG / (e.pista.cfg.velMax * ((j.mod && j.mod.vel) || 1)) * 1.2, tempo = e.t - j.tCheck;
    j.tCheck = e.t;
    return { tempo: tempo, bonus: Math.max(0, Math.round((alvo - tempo) * 30)) };
  }
  function perder(e, j, q) {
    q = Math.min(q, j.estrelas);
    if (q > 0) { j.estrelas -= q; e.eventos.push({ tipo: 'perdeu', j: j.n, q: q }); }
  }

  var FORA_MAX = 0.4;   // força da curva, no máximo, em fração do volante
  function moverJogador(e, j, ent, dt) {
    var pista = e.pista, cfg = pista.cfg, mod = j.mod || {}, max = cfg.velMax * (mod.vel || 1);   // mod: jeito do veículo (veiculos.js)
    var seg = P.achar(pista, j.z), pct = j.vel / max;
    var dir = Math.max(-1, Math.min(1, (ent && ent.dir) || 0));
    if (j.rodando > 0) { j.rodando = Math.max(0, j.rodando - dt); dir = 0; }
    // looping (só no chão): o volante fica parado, a velocidade não cai e no fim ganha pontos
    var lp = mod.voa ? null : P.noLoop(pista, j.z);
    if (lp && j.loop !== lp) { j.loop = lp; j.pulo = 0; e.eventos.push({ tipo: 'looping', j: j.n }); }
    else if (!lp && j.loop) { j.loop = null; j.loopings++; e.eventos.push({ tipo: 'loopFeito', j: j.n }); somar(e, j, PONTOS.looping, 'looping'); }
    if (lp) { dir = 0; j.x = Math.max(-0.8, Math.min(0.8, j.x)); j.vel = Math.max(j.vel, max * 0.9); }
    if (j.chegou) dir *= 0.5;
    // botão PULAR: um pulinho que passa por cima de cone, lama e carrinho
    if (j.recarga > 0) j.recarga = Math.max(0, j.recarga - dt);
    if (ent && ent.pular && j.pulo <= 0 && j.recarga <= 0 && j.rodando <= 0 && !j.chegou && !lp) {
      j.pulo = j.puloMax = PULINHO; j.recarga = RECARGA; e.eventos.push({ tipo: 'pulo', j: j.n, manual: true });
    }

    // volante e força da curva (empurra para fora; no nível Criança quase nada). A força da curva nunca passa
    // de 40% do volante: segurando para dentro, sempre dá para fazer a curva (antes, nas curvas fortes, ela
    // chegava a 1,5x o volante no Normal e 2,5x no Turbo, e o carro ia para o acostamento mesmo segurando)
    var dx = dt * 2 * Math.max(pct, 0.35) * (mod.curva || 1);
    var fora = Math.max(-FORA_MAX, Math.min(FORA_MAX, seg.curva * cfg.centrifuga));
    // derrapagem: numa curva forte, rápido, segurando para dentro. Derrapando, a curva puxa menos para fora
    var derrapando = !mod.voa && !lp && j.pulo <= 0 && j.rodando <= 0 && !j.chegou && Math.abs(seg.curva) > 1.2 && dir * seg.curva > 0 && Math.abs(dir) > 0.5 && pct > 0.55;
    if (derrapando) {
      if (j.derrapa === 0) e.eventos.push({ tipo: 'derrapa', j: j.n });
      var nAntes = nivelDerrapa(j.derrapa);
      j.derrapa += dt; j.ladoDerrapa = dir > 0 ? 1 : -1; fora *= 0.5;
      if (nivelDerrapa(j.derrapa) > nAntes) e.eventos.push({ tipo: 'faisca', j: j.n, nivel: nivelDerrapa(j.derrapa) });
    } else if (j.derrapa > 0) {
      var nv = nivelDerrapa(j.derrapa);
      if (nv) { j.turbo = Math.max(j.turbo, MINI_TURBO[nv]); e.eventos.push({ tipo: 'miniturbo', j: j.n, nivel: nv }); somar(e, j, PONTOS.miniturbo * nv, 'miniturbo'); }
      j.derrapa = 0; j.ladoDerrapa = 0;
    }
    if (j.derrapa > 0) {   // derrapando, o carro desliza de lado e segura na beirada de dentro da curva (não sai da pista)
      var xd = j.x + dx * dir * 0.6;
      j.x = dir > 0 ? Math.min(xd, Math.max(j.x, 0.85)) : Math.max(xd, Math.min(j.x, -0.85));
    } else j.x += dx * dir;
    j.x -= dx * pct * fora;
    // nível Criança: sem mexer no volante, o carro volta sozinho para a estrada
    if (cfg.ajuda && !dir && Math.abs(j.x) > 0.8) j.x -= (j.x > 0 ? 1 : -1) * dt * 0.8;
    j.x = Math.max(-cfg.limiteX, Math.min(cfg.limiteX, j.x));
    if (seg.tunel) j.x = Math.max(-1.1, Math.min(1.1, j.x));   // dentro do túnel as paredes seguram o carro na pista

    // acelera sozinho (criança não precisa segurar nada); freio é opcional
    var alvo = max;
    if (j.turbo > 0) { alvo = max * 1.45; j.turbo = Math.max(0, j.turbo - dt); }
    if (j.chegou) alvo = max * 0.3;
    if (ent && ent.freio) j.vel -= max * 1.4 * dt;
    else if (j.vel < alvo) j.vel = Math.min(alvo, j.vel + max * (j.turbo > 0 ? 1.2 : 0.45) * dt);
    else j.vel = Math.max(alvo, j.vel - max * 0.6 * dt);

    // fora da estrada: grama, areia ou neve seguram o carro
    j.fora = Math.abs(j.x) > 1.05 && j.pulo <= 0;
    if (j.fora && j.vel > max * 0.4) { j.vel -= max * 1.3 * dt; j.tremor = 0.15; }
    j.vel = Math.max(0, Math.min(max * 1.5, j.vel));
    if (j.tremor > 0) j.tremor = Math.max(0, j.tremor - dt);
    if (j.pulo > 0) j.pulo = Math.max(0, j.pulo - dt);
    if (j.empurrao > 0) j.empurrao = Math.max(0, j.empurrao - dt);
    if (j.escudo > 0) j.escudo = Math.max(0, j.escudo - dt);
    if (j.foguete > 0) j.foguete = Math.max(0, j.foguete - dt);
    if (j.roleta > 0) { j.roleta -= dt; if (j.roleta <= 0) { j.roleta = 0; usarPoder(e, j, max); } }
    // morcego (1.11.1): perto de obstáculo vira o Conde Drácula (e volta a ser morcego quando passa); joga abóbora no rival da frente
    if (mod.dracula) {
      var iJ = Math.floor(j.z / SEG), perto = false;
      for (var q = iJ + 1; q < iJ + 16 && !perto; q++) { var sq = pista.segs[q]; if (sq) for (var w = 0; w < sq.coisas.length; w++) { var cq = sq.coisas[w]; if ((cq.tipo === 'cone' || cq.tipo === 'lama') && !cq.pego[j.n] && Math.abs(cq.x - j.x) < 0.6) perto = true; } }
      e.carros.forEach(function (cr) { if (cr.z > j.z && cr.z < j.z + SEG * 15 && Math.abs(cr.x - j.x) < 0.6) perto = true; });
      e.rivais.forEach(function (rv) { if (rv.z > j.z && rv.z < j.z + SEG * 10 && Math.abs(rv.x - j.x) < 0.5) perto = true; });
      if (perto !== !!j.dracula) { j.dracula = perto; e.eventos.push({ tipo: 'vira', j: j.n, dracula: perto }); }
    }
    if (mod.abobora && e.fase === 'corrida') {
      j.tAbobora = (j.tAbobora == null ? 3 : j.tAbobora) - dt;
      if (j.tAbobora <= 0) {
        var alvoA = -1, dA = Infinity;
        e.rivais.forEach(function (rv, k) { var d = rv.z - j.z; if (d > 0 && d < SEG * 70 && d < dA && !rv.chegou) { dA = d; alvoA = k; } });
        if (alvoA >= 0) { e.tiros.push({ tipo: 'abobora', z: j.z + SEG, x: j.x, vel: Math.max(j.vel, max) * 1.5, alvo: alvoA, de: j.n, vida: 4 }); e.eventos.push({ tipo: 'abobora', j: j.n }); j.tAbobora = 4 + Math.random() * 2; }
        else j.tAbobora = 1;
      }
    }

    var zAntes = j.z;
    j.z = Math.min(pista.comprimento - SEG, j.z + j.vel * dt);

    // coisas da pista que ficaram para trás neste quadro
    var i0 = Math.floor(zAntes / SEG), i1 = Math.floor(j.z / SEG);
    for (var i = i0; i <= i1; i++) {
      var s = pista.segs[i];
      if (!s) continue;
      var zc = i * SEG + SEG / 2;
      if (zc <= zAntes || zc > j.z) continue;
      for (var k = 0; k < s.coisas.length; k++) {
        var c = s.coisas[k];
        if (c.pego[j.n] || Math.abs(j.x - c.x) > TOQUE[c.tipo]) continue;
        var noAr = j.pulo > 0;
        if (c.tipo === 'estrela') {
          if ((c.alt > P.ALT_CHAO) !== noAr) continue;   // estrela do ar só para quem pulou
          c.pego[j.n] = true; j.estrelas++; e.eventos.push({ tipo: 'estrela', j: j.n, ar: noAr });
          somar(e, j, noAr ? PONTOS.estrelaAr : PONTOS.estrela, 'estrela');
          continue;
        }
        if (c.tipo === 'caixa') {   // caixa surpresa: pega mesmo pulando; com poder girando, a caixa só quebra
          c.pego[j.n] = true; e.eventos.push({ tipo: 'caixa', j: j.n, nova: !j.roleta });
          if (!j.roleta) j.roleta = ROLETA;
          continue;
        }
        if (noAr) continue;                               // no ar passa por cima de tudo
        c.pego[j.n] = true;
        if (j.escudo > 0 && (c.tipo === 'cone' || c.tipo === 'lama')) { e.eventos.push({ tipo: 'escudoBate', j: j.n }); continue; }   // a bolha protege
        if (c.tipo === 'cone') {
          if (j.rodando > 0) continue;
          j.vel *= 0.5; j.batidas++; j.tremor = 0.4;
          e.eventos.push({ tipo: 'cone', j: j.n }); perder(e, j, cfg.perdeCone); somar(e, j, PONTOS.cone, 'cone');
        } else if (c.tipo === 'lama') {
          if (j.vel > max * 0.3) j.vel *= 0.6;
          j.tremor = 0.7; e.eventos.push({ tipo: 'lama', j: j.n });
        } else if (c.tipo === 'turbo') {
          j.turbo = TURBO; e.eventos.push({ tipo: 'turbo', j: j.n }); somar(e, j, PONTOS.turbo, 'turbo');
        } else if (c.tipo === 'rampa') {
          j.pulo = j.puloMax = PULO; e.eventos.push({ tipo: 'pulo', j: j.n }); somar(e, j, PONTOS.rampa, 'rampa');
        }
      }
    }

    // trânsito: bater por trás deixa lento, rodopia e derruba estrelas
    if (j.pulo <= 0 && j.rodando <= 0 && !lp) {
      for (k = 0; k < e.carros.length; k++) {
        var car = e.carros[k];
        if (Math.abs(car.x - j.x) < 0.42 && j.z > car.z - SEG * 0.8 && j.z < car.z + SEG * 0.4 && j.vel > car.vel) {
          if (j.escudo > 0) {   // com a bolha: o carrinho é jogado para o lado e ninguém perde nada
            if (!car.pulou) { car.pulou = 1; car.x += (car.x >= j.x ? 1 : -1) * 0.5; e.eventos.push({ tipo: 'escudoBate', j: j.n }); }
            continue;
          }
          j.vel = car.vel * 0.6; j.z = car.z - SEG * 0.9; j.rodando = RODANDO; j.batidas++;
          e.eventos.push({ tipo: 'batida', j: j.n }); perder(e, j, cfg.perdeCarro); somar(e, j, PONTOS.batida, 'batida');
          break;
        }
      }
    }

    // mudou de mundo?
    var m = P.achar(pista, j.z).mundo;
    if (m !== j.mundo) {
      j.mundo = m; e.eventos.push({ tipo: 'mundo', j: j.n, mundo: m, nome: pista.mundos[m] });
      // cada portal de mundo é um CHECKPOINT: 500 pontos + bônus de tempo
      var bt = bonusTempo(e, j, pista.chegada / 4);
      e.eventos.push({ tipo: 'checkpoint', j: j.n, numero: m, tempo: bt.tempo, bonus: bt.bonus });
      somar(e, j, PONTOS.checkpoint + bt.bonus, 'checkpoint');
    }

    // chegada
    if (!j.chegou && j.z >= pista.zChegada) {
      j.chegou = true; j.tempo = e.t;
      var antes = e.jogadores.filter(function (o) { return o !== j && o.chegou; }).length;
      antes += e.rivais.filter(function (r) { return r.chegou; }).length;
      e.eventos.push({ tipo: 'chegou', j: j.n, lugar: antes + 1 });
      var bc = bonusTempo(e, j, pista.chegada / 4), concorrentes = e.jogadores.length + e.rivais.length;
      somar(e, j, PONTOS.chegada + bc.bonus + (concorrentes > 1 && antes < 3 ? PONTOS_LUGAR[antes] : 0), 'chegada');
    }
  }

  // ---------- poderes da caixa surpresa ----------
  // escudo: bolha verde que protege de cone, lama e trânsito; foguete: turbo grande; gosma: uma bola de gosma
  // que vai até o rival da frente e deixa ele lento (sem rival na frente, vira foguete)
  function usarPoder(e, j, max) {
    var opcoes = ['escudo', 'foguete'], alvo = -1, melhor = Infinity;
    e.rivais.forEach(function (rv, k) { var d = rv.z - j.z; if (d > 0 && d < SEG * 80 && d < melhor && !rv.chegou) { melhor = d; alvo = k; } });
    if (alvo >= 0) opcoes.push('gosma', 'gosma');
    var p = opcoes[Math.floor(Math.random() * opcoes.length)];
    j.poder = p; j.poderT = 2;
    if (p === 'escudo') j.escudo = ESCUDO;
    else if (p === 'foguete') { j.foguete = FOGUETE; j.turbo = Math.max(j.turbo, FOGUETE); }
    else e.tiros.push({ z: j.z + SEG, x: j.x, vel: Math.max(j.vel, max) * 1.6, alvo: alvo, de: j.n, vida: 4 });
    e.eventos.push({ tipo: 'poder', j: j.n, poder: p });
  }
  function moverTiros(e, dt) {
    e.tiros = e.tiros.filter(function (tr) {
      var rv = e.rivais[tr.alvo]; tr.vida -= dt;
      if (!rv || tr.vida <= 0) return false;
      tr.z += tr.vel * dt; tr.x += Math.max(-dt * 3, Math.min(dt * 3, rv.x - tr.x));
      if (tr.z < rv.z - SEG * 0.3) return true;
      rv.lento = Math.max(rv.lento, 1.8); rv.gosma = 2.6; rv.gosmaCor = tr.tipo === 'abobora' ? '#ff8c1a' : '#7ae03d';
      var j = e.jogadores[tr.de]; if (j) somar(e, j, PONTOS.splat, 'splat');
      e.eventos.push({ tipo: 'splat', j: tr.de, r: tr.alvo, abobora: tr.tipo === 'abobora' });
      return false;
    });
  }

  // ---------- rivais ----------
  function bloqueado(e, i0, i1, x) {   // tem cone, lama ou carrinho nessa faixa entre os pedaços i0 e i1?
    var pista = e.pista;
    for (var i = i0; i <= i1; i++) {
      var s = pista.segs[i]; if (!s) continue;
      for (var k = 0; k < s.coisas.length; k++) { var c = s.coisas[k]; if ((c.tipo === 'cone' || c.tipo === 'lama') && Math.abs(c.x - x) < 0.3) return true; }
    }
    for (k = 0; k < e.carros.length; k++) { var ci = Math.floor(e.carros[k].z / SEG); if (ci >= i0 && ci <= i1 && Math.abs(e.carros[k].x - x) < 0.4) return true; }
    return false;
  }
  function moverRival(e, rv, dt) {
    var pista = e.pista, cfg = pista.cfg, max = cfg.velMax * (rv.mod.vel || 1);
    var lider = e.jogadores.reduce(function (a, j) { return j.z > a.z ? j : a; }, e.jogadores[0]);
    // fica por perto dos jogadores: quem dispara segura, quem fica para trás acelera (corrida sempre disputada)
    var d = (rv.z - lider.z) / SEG, f = d > 18 ? 0.86 : d < -18 ? 1.15 : 1 - d * 0.006;
    var alvo = rv.chegou ? max * 0.3 : max * rv.garra * f;
    // disputa de perto: de vez em quando um rival que está logo atrás dá um turbo e tenta passar
    rv.proxTurbo -= dt;
    if (rv.proxTurbo <= 0) { rv.proxTurbo = 5 + Math.random() * 6; if (d < 2 && d > -14 && !rv.chegou) { rv.turbo = 1.6; e.eventos.push({ tipo: 'turboRival', r: rv.r }); } }
    if (rv.turbo > 0) { rv.turbo -= dt; alvo *= 1.35; }
    if (rv.gosma > 0) rv.gosma -= dt;
    if (rv.lento > 0) { rv.lento -= dt; alvo *= 0.55; }
    var lpR = P.noLoop(pista, rv.z);
    if (lpR) alvo = Math.max(alvo, max * 0.95);
    rv.vel += Math.max(-max * 0.8 * dt, Math.min(max * 0.45 * dt, alvo - rv.vel));
    var i = Math.floor(rv.z / SEG);
    // decide a faixa um pouco antes: foge de cone, lama e carrinho (às vezes se distrai)
    rv.pensa -= dt;
    if (rv.pensa <= 0) {
      rv.pensa = 0.25;
      if (bloqueado(e, i + 3, i + 14, rv.faixa) && Math.random() < 0.8) {
        var livres = P.FAIXAS.filter(function (fx) { return !bloqueado(e, i + 3, i + 14, fx); });
        if (livres.length) rv.faixa = livres.sort(function (a, b) { return Math.abs(a - rv.x) - Math.abs(b - rv.x); })[0];
      } else if (Math.random() < 0.02) rv.faixa = P.FAIXAS[Math.floor(Math.random() * 3)];
    }
    var dx = (lpR ? Math.max(-0.7, Math.min(0.7, rv.faixa)) : rv.faixa) - rv.x; rv.x += Math.max(-dt * 1.3, Math.min(dt * 1.3, dx));
    var zAntes = rv.z; rv.z = Math.min(pista.comprimento - SEG, rv.z + rv.vel * dt);
    // se não desviou a tempo, o cone/lama segura (só o rival, a pista dele é a mesma de todos)
    for (var k = Math.floor(zAntes / SEG); k <= Math.floor(rv.z / SEG); k++) {
      var s = pista.segs[k]; if (!s) continue;
      for (var q = 0; q < s.coisas.length; q++) { var c = s.coisas[q]; if ((c.tipo === 'cone' || c.tipo === 'lama') && Math.abs(c.x - rv.x) < 0.25 && (k * SEG + SEG / 2) > zAntes && (k * SEG + SEG / 2) <= rv.z) rv.lento = 0.8; }
    }
    // encostou num jogador: um empurrãozinho dos dois lados e o rival muda para a faixa do outro lado
    // (antes ele voltava para a mesma faixa, encostava de novo e ficava tremendo do lado do jogador)
    if (rv.encostou > 0) rv.encostou -= dt;
    e.jogadores.forEach(function (j) {
      if (j.pulo > 0 || lpR || Math.abs(j.z - rv.z) > SEG * 0.6 || Math.abs(j.x - rv.x) > 0.38) return;
      var lado = j.x <= rv.x ? -1 : 1, longe = P.FAIXAS.filter(function (fx) { return lado < 0 ? fx > j.x + 0.4 : fx < j.x - 0.4; });
      if (longe.length) rv.faixa = longe.sort(function (a, b) { return Math.abs(a - rv.x) - Math.abs(b - rv.x); })[0];
      if (rv.encostou > 0) return;
      rv.encostou = 0.6; j.x += lado * 0.07; rv.x -= lado * 0.05;
      if (j.empurrao <= 0) { j.empurrao = 0.5; e.eventos.push({ tipo: 'tum', j: j.n }); }
    });
    if (!rv.chegou && rv.z >= pista.zChegada) { rv.chegou = true; rv.tempo = e.t; }
  }
  // posição de cada jogador na corrida (contando os rivais): quem chegou antes, depois quem está mais na frente
  function posicoes(e) {
    var todos = e.jogadores.map(function (j) { return { j: j, z: j.z, fim: j.chegou ? j.tempo : Infinity }; })
      .concat(e.rivais.map(function (r) { return { z: r.z, fim: r.chegou ? r.tempo : Infinity }; }));
    todos.sort(function (a, b) { return a.fim !== b.fim ? a.fim - b.fim : b.z - a.z; });
    todos.forEach(function (o, k) {
      if (!o.j) return;
      if (o.j.lugar && o.j.lugar !== k + 1 && !o.j.chegou && e.t - (o.j.tLugar || 0) > 0.8) { e.eventos.push({ tipo: 'lugar', j: o.j.n, lugar: k + 1, subiu: k + 1 < o.j.lugar }); o.j.tLugar = e.t; }
      o.j.lugar = k + 1;
    });
    e.total = todos.length;
  }

  function atualizar(e, entradas, dt) {
    e.eventos = [];
    if (e.fase === 'fim') return e;
    if (e.fase === 'contagem') {
      var antes = Math.ceil(e.contagem);
      e.contagem -= dt;
      if (e.contagem <= 0) { e.fase = 'corrida'; e.contagem = 0; e.eventos.push({ tipo: 'vai' }); }
      else if (Math.ceil(e.contagem) !== antes) e.eventos.push({ tipo: 'bip', n: Math.ceil(e.contagem) });
      return e;
    }
    e.t += dt;
    var pista = e.pista;
    e.carros.forEach(function (c) {
      c.z += c.vel * dt;
      if (c.z > pista.zChegada - 30 * SEG) c.z = 260 * SEG;
      var lc = P.noLoop(pista, c.z + SEG * 10); if (lc) c.z = (lc.fim + 12) * SEG;   // o trânsito não entra no looping
      if (c.pulou) { c.pulou += dt; if (c.pulou > 1.5) c.pulou = 0; }
    });
    moverTiros(e, dt);
    e.jogadores.forEach(function (j) { moverJogador(e, j, entradas && entradas[j.n], dt); });

    // dois carros lado a lado: um empurrãozinho, sem perder nada
    if (e.jogadores.length === 2) {
      var a = e.jogadores[0], b = e.jogadores[1];
      if (Math.abs(a.z - b.z) < SEG * 0.6 && Math.abs(a.x - b.x) < 0.38 && a.pulo <= 0 && b.pulo <= 0) {
        var lado = a.x <= b.x ? -1 : 1;
        a.x += lado * 0.06; b.x -= lado * 0.06;
        if (a.empurrao <= 0) { a.empurrao = b.empurrao = 0.5; e.eventos.push({ tipo: 'tum' }); }
      }
    }

    e.rivais.forEach(function (rv) { moverRival(e, rv, dt); });
    posicoes(e);

    if (e.jogadores.every(function (j) { return j.chegou; })) {
      e.depoisDoFim += dt;
      if (e.depoisDoFim >= DEPOIS_DO_FIM) { e.fase = 'fim'; e.eventos.push({ tipo: 'fim' }); }
    }
    return e;
  }

  var VruuumMotor = { nivelDerrapa: nivelDerrapa, DERRAPA: DERRAPA, MINI_TURBO: MINI_TURBO, ROLETA: ROLETA, ESCUDO: ESCUDO, FOGUETE: FOGUETE, usarPoder: usarPoder, PONTOS: PONTOS, PONTOS_LUGAR: PONTOS_LUGAR, novaCorrida: novaCorrida, atualizar: atualizar, CONTAGEM: CONTAGEM, TURBO: TURBO, PULO: PULO, PULINHO: PULINHO, RECARGA: RECARGA, RODANDO: RODANDO, DEPOIS_DO_FIM: DEPOIS_DO_FIM };
  if (typeof module !== 'undefined' && module.exports) module.exports = VruuumMotor;
  else raiz.VruuumMotor = VruuumMotor;
})(this);
