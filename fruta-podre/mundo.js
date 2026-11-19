/* FRUTA PODRE — o mundo de uma fase com a física do Matter.js (sem desenho): blocos, pragas, galões de vinagre, frutas
   lançadas, poderes, dano, explosões, pontos e o turno (mira → voo → espera → próxima fruta / contagem / fim).
   FrutaMundo.criar(fase, { nivel, Matter, regras }) devolve o mundo; a tela chama mundo.passo() 60 vezes por segundo e
   lê mundo.eventos (quebra, ko, explosao, toque, poder...) para os sons, as partículas e os pontos que sobem.
   Roda também no Node (teste/regras.test.js), com require('../libs/matter.min.js'). */
(function (raiz, fabrica) {
  var M = fabrica(raiz);
  if (typeof module === 'object' && module.exports) module.exports = M; else raiz.FrutaMundo = M;
})(this, function (raiz) {
  'use strict';
  var CARENCIA = 60;        // primeiro segundo: a estrutura se acomoda sem levar dano
  var ESPERA_MAX = 360;     // espera no máximo 6 s a poeira baixar
  var VITORIA = 180;        // 3 s depois da última praga
  var CONTAGEM = 300;       // 5 s de contagem antes da derrota
  var TONTA = 54;           // a praga fica tonta ~0,9 s e some num "puf"

  function criar(fase, op) {
    op = op || {};
    var Matter = op.Matter || raiz.Matter, R = op.regras || raiz.FrutaRegras;
    var Engine = Matter.Engine, Bodies = Matter.Bodies, Body = Matter.Body, Composite = Matter.Composite, Events = Matter.Events, Sleeping = Matter.Sleeping;
    var nivel = R.NIVEIS[op.nivel] ? op.nivel : 'medio', N = R.NIVEIS[nivel];
    var engine = Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 });
    engine.gravity.y = 1;
    var mundo = engine.world, CH = R.CHAO, W = fase.width || 1800;
    var porId = {}, remover = [], semente = 12345;
    function sorte() { semente = (semente * 16807) % 2147483647; return semente / 2147483647; }   // sorteio repetível (mesmo tiro, mesmo resultado)
    var S = {
      fase: fase, nivel: nivel, W: W, engine: engine, passos: 0, estado: 'mira', pontos: 0, eventos: [], tiros: 0,
      blocos: [], pragas: [], galoes: [], projeteis: [], fila: R.fila(fase, nivel), atual: null, rastro: [], rastroAnterior: [],
      estilingue: { x: fase.slingshot.x, y: fase.slingshot.y }, turno: null, vitoriaT: null, contagemT: 0, esperaT: 0, calmoT: 0, resultado: null
    };
    function ev(o) { S.eventos.push(o); }
    function registrar(corpo, o, tipo) { o.kind = tipo; o.body = corpo; porId[corpo.id] = o; Composite.add(mundo, corpo); return o; }

    // chão: uma laje parada bem comprida
    var chao = Bodies.rectangle(W / 2, CH + 150, W + 6000, 300, { isStatic: true, friction: 0.9, frictionStatic: 1, restitution: 0.1, label: 'chao' });
    Composite.add(mundo, chao);

    fase.blocks.forEach(function (b, i) {
      var mat = R.material(b.type), m = R.MATERIAIS[mat];
      var corpo = Bodies.rectangle(b.x, b.y, b.width, b.height, { angle: (b.angle || 0) * Math.PI / 180, isStatic: !!b.static,
        density: m.densidade, friction: m.atrito, frictionStatic: m.atritoParado, restitution: m.quique, label: b.type });
      var v = R.vidaBloco(b.type, b.width, b.height);
      S.blocos.push(registrar(corpo, { tipo: b.type, mat: mat, w: b.width, h: b.height, vida: v, vidaMax: v, estatico: !!b.static, semente: i * 7919 % 997 }, 'bloco'));
    });
    fase.enemies.forEach(function (e) {
      var d = R.PRAGAS[e.type], corpo;
      if (d.sensor) corpo = Bodies.circle(e.x, e.y, d.r, { isStatic: true, isSensor: true, label: e.type });
      else {
        corpo = Bodies.circle(e.x, e.y, d.r, { density: d.densidade, friction: 0.8, frictionStatic: 1, restitution: 0.15, label: e.type });
        Body.setInertia(corpo, Infinity);   // a praga escorrega e tomba junto, mas não sai rolando feito bola
      }
      S.pragas.push(registrar(corpo, { tipo: e.type, vida: (d.vida || 1) * N.vidaPraga, capacete: e.armor === 'bottle_cap', ko: false, sumiu: false,
        x0: e.x, y0: e.y, fase: sorte() * 6.28 }, 'praga'));
    });
    (fase.hazards || []).forEach(function (h) {
      var corpo = Bodies.rectangle(h.x, h.y, 44, 58, { density: 0.0015, friction: 0.6, frictionStatic: 0.8, restitution: 0.2, label: h.type });
      S.galoes.push(registrar(corpo, { tipo: h.type, w: 44, h: 58, explodiu: false, pavio: -1 }, 'galao'));
    });

    function carencia() { return S.passos < CARENCIA && !S.tiros; }   // só antes do primeiro tiro
    function vivas() { var n = 0; for (var i = 0; i < S.pragas.length; i++) if (!S.pragas[i].ko) n++; return n; }
    function eProjetil(o) { return o && o.kind === 'fruta'; }
    function pos(corpo) { return { x: corpo.position.x, y: corpo.position.y }; }
    function acordarTudo() { for (var i = 0; i < mundo.bodies.length; i++) if (!mundo.bodies[i].isStatic) Sleeping.set(mundo.bodies[i], false); }
    function tirar(corpo) { if (remover.indexOf(corpo) < 0) remover.push(corpo); }

    function carregar() {
      S.atual = S.fila.shift() || null;
      S.estado = S.atual ? 'mira' : S.estado;
      if (S.atual) ev({ tipo: 'carrega', fruta: S.atual });
    }

    function quebrar(o, por) {
      if (o.quebrado || o.estatico) return;
      o.quebrado = true;
      var pedacos = R.pontosPedacos(o.tipo, o.w, o.h), soma = 0;
      for (var i = 0; i < pedacos.length; i++) soma += pedacos[i];
      S.pontos += soma;
      if (S.turno) { S.turno.quebras++; S.turno.pontos += soma; }
      ev({ tipo: 'quebra', mat: o.mat, bloco: o.tipo, x: o.body.position.x, y: o.body.position.y, w: o.w, h: o.h, ang: o.body.angle, pontos: soma, pedacos: pedacos, por: por || null });
      tirar(o.body);
    }
    function nocautear(p) {
      if (p.ko) return;
      p.ko = true; p.koT = S.passos;
      S.pontos += R.PONTOS_PRAGA;
      if (S.turno) { S.turno.kos++; S.turno.pontos += R.PONTOS_PRAGA; }
      ev({ tipo: 'ko', praga: p.tipo, x: p.body.position.x, y: p.body.position.y, pontos: R.PONTOS_PRAGA });
    }
    // um golpe na praga: a barata perde vida; o rato perde o capacete no 1º golpe forte e cai no 2º; a mosca cai com qualquer toque
    function ferirPraga(p, d) {
      if (p.ko) return;
      if (p.tipo === 'mosca_zumbidora') { nocautear(p); return; }
      if (p.tipo === 'rato_ladrao') {
        if (d < R.PRAGAS.rato_ladrao.golpe * N.vidaPraga) { if (d > 30) ev({ tipo: 'ai', praga: p.tipo, x: p.body.position.x, y: p.body.position.y }); return; }
        if (p.capacete) { p.capacete = false; ev({ tipo: 'capacete', x: p.body.position.x, y: p.body.position.y - 20 }); return; }
        nocautear(p); return;
      }
      p.vida -= d;
      if (p.vida <= 0) nocautear(p); else if (d > 30) ev({ tipo: 'ai', praga: p.tipo, x: p.body.position.x, y: p.body.position.y });
    }
    function explodirGalao(g, atraso) {
      if (g.explodiu || g.pavio >= 0) return;
      g.pavio = atraso || 0;
    }
    function explosao(x, y, raio, empurrao, forca, tipo, fonte) {
      ev({ tipo: 'explosao', x: x, y: y, raio: raio, de: tipo });
      acordarTudo();
      for (var i = 0; i < mundo.bodies.length; i++) {
        var c = mundo.bodies[i], o = porId[c.id];
        if (c.isStatic && !(o && o.kind === 'praga')) continue;
        if (!o || o === fonte) continue;
        var dx = c.position.x - x, dy = c.position.y - y, d = Math.sqrt(dx * dx + dy * dy);
        if (d > raio) continue;
        var f = 1 - d / raio, ux = d > 1 ? dx / d : 0, uy = d > 1 ? dy / d : -1;
        if (!c.isStatic) {
          var dv = empurrao * f / Math.sqrt(Math.max(1, c.mass));
          Body.setVelocity(c, { x: c.velocity.x + ux * dv, y: c.velocity.y + (uy - 0.35) * dv });
          Body.setAngularVelocity(c, c.angularVelocity + (sorte() - 0.5) * 0.2 * f);
        }
        if (forca <= 0) { if (o.kind === 'praga' && o.tipo === 'mosca_zumbidora') nocautear(o); continue; }
        if (o.kind === 'bloco') { o.vida -= forca * f * R.MATERIAIS[o.mat].mult; if (S.turno) S.turno.danos += forca * f; if (o.vida <= 0) quebrar(o, tipo); }
        else if (o.kind === 'praga') ferirPraga(o, forca * 0.45 * f);
        else if (o.kind === 'galao') explodirGalao(o, 8);
      }
    }

    // o mundo do turno: o que a fruta fez (para os garotos comemorarem ou porem a mão na cabeça)
    function novoTurno() { S.turno = { danos: 0, quebras: 0, kos: 0, pontos: 0 }; }

    Events.on(engine, 'collisionStart', function (e) {
      for (var i = 0; i < e.pairs.length; i++) {
        var par = e.pairs[i], a = par.bodyA.parent || par.bodyA, b = par.bodyB.parent || par.bodyB;
        var oa = porId[a.id], ob = porId[b.id];
        var va = a.plugin.v || a.velocity, vb = b.plugin.v || b.velocity, n = par.collision.normal;
        var vrel = Math.abs((va.x - vb.x) * n.x + (va.y - vb.y) * n.y);
        var sp = par.collision.supports && par.collision.supports[0], px = sp ? sp.x : (a.position.x + b.position.x) / 2, py = sp ? sp.y : (a.position.y + b.position.y) / 2;
        // mosca: qualquer coisa andando (ou fruta) que encostar derruba
        if (a.isSensor || b.isSensor) {
          var mosca = a.isSensor ? oa : ob, outro = a.isSensor ? b : a, oo = porId[outro.id];
          if (carencia() || !mosca || outro.isStatic) continue;
          var vo = outro.plugin.v || outro.velocity;
          if (Math.abs(vo.x) + Math.abs(vo.y) > 1 || eProjetil(oo)) ferirPraga(mosca, 999);
          continue;
        }
        if (eProjetil(oa)) bateuFruta(oa, ob, vrel, px, py);
        if (eProjetil(ob)) bateuFruta(ob, oa, vrel, px, py);
        if (carencia()) continue;
        ferir(oa, a, b, ob, vrel);
        ferir(ob, b, a, oa, vrel);
        if (vrel > 2.2) {
          var mat = oa && oa.kind === 'bloco' ? oa.mat : ob && ob.kind === 'bloco' ? ob.mat : (eProjetil(oa) || eProjetil(ob)) ? 'fruta' : null;
          if (mat) ev({ tipo: 'toque', mat: mat, forca: vrel, x: px, y: py });
        }
      }
    });
    function bateuFruta(p, outro, vrel, x, y) {
      if (!p.bateu) {
        p.bateu = true;
        ev({ tipo: 'bate', fruta: p.tipo, x: x, y: y, forca: vrel });
        if (p.tipo === 'abacaxi_azedo' && !p.explodiu) p.pavio = 60;   // 1 s depois do impacto
      }
      if (p.jato > 0) {
        // a pimenta no jato fura madeira e vidro sem perder a velocidade
        if (outro && outro.kind === 'bloco' && !outro.estatico && (outro.mat === 'wood' || outro.mat === 'glass') && p.furos < 4) {
          p.furos++; p.furou = true; quebrar(outro, 'pimenta_jato');
        } else if (!(outro && outro.kind === 'bloco' && outro.quebrado)) p.jato = 0;
      }
    }
    function ferir(o, corpo, outro, oo, vrel) {
      if (!o || o.kind === 'fruta') return;
      var m = outro.isStatic ? corpo.mass : outro.mass, d;
      if (o.kind === 'bloco') {
        if (o.estatico || o.quebrado) return;
        d = R.dano(m, vrel, o.mat);
        if (oo && oo.kind === 'fruta' && oo.bigorna && o.mat === 'stone') d *= 2.5;
        if (d < 12) return;
        o.vida -= d;
        if (S.turno) S.turno.danos += d;
        if (o.vida <= 0) quebrar(o, oo && oo.kind === 'fruta' ? oo.tipo : null);
      } else if (o.kind === 'praga') {
        d = R.dano(m, vrel, null);
        if (d > 12) ferirPraga(o, d);
      } else if (o.kind === 'galao') {
        d = R.dano(m, vrel, null);
        if (d > 45) explodirGalao(o, 0);
      }
    }

    // ---------- lançar e poderes ----------
    function novaFruta(tipo, x, y, r, vx, vy, extra) {
      var F = R.FRUTAS[tipo];
      var c = Bodies.circle(x, y, r, { density: F.densidade, restitution: 0.45, friction: 0.5, frictionStatic: 0.8, frictionAir: 0, label: tipo });
      Body.setVelocity(c, { x: vx, y: vy });
      var p = registrar(c, { tipo: tipo, r: r, poderUsado: false, bateu: false, feito: false, parado: 0, voo: 0, jato: 0, furos: 0, pavio: -1, giro: 0 }, 'fruta');
      for (var k in extra) p[k] = extra[k];
      S.projeteis.push(p);
      return p;
    }
    S.lancar = function (vx, vy) {
      if (S.estado !== 'mira' || !S.atual || S.vitoriaT != null || S.resultado) return false;
      S.rastroAnterior = S.rastro; S.rastro = [];
      var tipo = S.atual;
      S.atual = null;
      novaFruta(tipo, S.estilingue.x, S.estilingue.y, R.FRUTAS[tipo].r, vx, vy, { principal: true });
      S.estado = 'voo'; S.tiros++; novoTurno();
      ev({ tipo: 'lanca', fruta: tipo, forca: Math.sqrt(vx * vx + vy * vy) / R.VMAX });
      return true;
    };
    function principal() { for (var i = 0; i < S.projeteis.length; i++) if (S.projeteis[i].principal) return S.projeteis[i]; return null; }
    S.podePoder = function () {
      var p = principal();
      if (!p || p.feito || p.poderUsado) return false;
      return !p.bateu || (p.tipo === 'abacaxi_azedo' && !p.explodiu);
    };
    S.poder = function () {
      if (!S.podePoder()) return false;
      var p = principal(), c = p.body, v = c.velocity, x = c.position.x, y = c.position.y;
      p.poderUsado = true;
      if (p.tipo === 'trio_uva') {
        var vel = Math.sqrt(v.x * v.x + v.y * v.y), ang = Math.atan2(v.y, v.x), r = p.r * 0.72;
        Body.scale(c, 0.72, 0.72); p.r = r; p.uma = true;
        [-0.24, 0.24].forEach(function (d) {
          var a = ang + d;
          novaFruta('trio_uva', x + Math.cos(a) * 4 - Math.sin(a) * d * 70, y + Math.sin(a) * 4 + Math.cos(a) * d * 70, r, Math.cos(a) * vel, Math.sin(a) * vel, { uma: true, poderUsado: true, irma: true });
        });
      } else if (p.tipo === 'pimenta_jato') {
        var s = Math.sqrt(v.x * v.x + v.y * v.y) || 1, ux = s > 1 ? v.x / s : 1, uy = s > 1 ? v.y / s : 0;
        p.vJato = { x: ux * 30, y: uy * 30 }; p.jato = 45;
        Body.setVelocity(c, p.vJato);
      } else if (p.tipo === 'melancia_passada') {
        p.bigorna = true;
        Body.setDensity(c, R.FRUTAS.melancia_passada.densidade * 4);
        Body.setVelocity(c, { x: v.x * 0.12, y: Math.max(26, v.y) });
      } else if (p.tipo === 'abacaxi_azedo') {
        explodirAbacaxi(p);
      } else if (p.tipo === 'maca_podre') {
        ev({ tipo: 'grito', x: x, y: y });
        // o grito do verme: empurra o que é leve, derruba mosca e assusta barata
        for (var i = 0; i < mundo.bodies.length; i++) {
          var b = mundo.bodies[i], o = porId[b.id];
          if (!o || b === c) continue;
          var dx = b.position.x - x, dy = b.position.y - y, d = Math.sqrt(dx * dx + dy * dy);
          if (d > 160) continue;
          var f = 1 - d / 160;
          if (o.kind === 'praga') { if (o.tipo === 'mosca_zumbidora') ferirPraga(o, 999); else ferirPraga(o, 140 * f); }
          if (!b.isStatic && b.mass < 7) { Sleeping.set(b, false); Body.setVelocity(b, { x: b.velocity.x + dx / (d || 1) * 7 * f, y: b.velocity.y + (dy / (d || 1) - 0.3) * 7 * f }); }
        }
      }
      ev({ tipo: 'poder', fruta: p.tipo, x: x, y: y });
      return true;
    };
    function explodirAbacaxi(p) {
      if (p.explodiu) return;
      p.explodiu = true; p.feito = true; p.poderUsado = true;
      var x = p.body.position.x, y = p.body.position.y;
      tirar(p.body);
      explosao(x, y, 190, 20, 3200, 'abacaxi_azedo', p);
    }

    // ---------- o passo ----------
    function calmo() {
      for (var i = 0; i < mundo.bodies.length; i++) {
        var b = mundo.bodies[i];
        if (b.isStatic || b.isSleeping) continue;
        if (b.speed > 0.2 || Math.abs(b.angularVelocity) > 0.015) return false;
      }
      return true;
    }
    S.passo = function () {
      var i, b, p;
      for (i = 0; i < mundo.bodies.length; i++) { b = mundo.bodies[i]; b.plugin.v = { x: b.velocity.x, y: b.velocity.y }; }
      // anti-gravidade da pimenta no jato (linha reta)
      for (i = 0; i < S.projeteis.length; i++) { p = S.projeteis[i]; if (p.jato > 0) Body.setVelocity(p.body, p.vJato); }
      Engine.update(engine, R.PASSO);
      S.passos++;
      for (i = 0; i < S.projeteis.length; i++) {
        p = S.projeteis[i];
        if (p.jato > 0) { p.jato--; if (p.furou) { p.furou = false; Body.setVelocity(p.body, { x: p.vJato.x * 0.92, y: p.vJato.y * 0.92 }); p.vJato = { x: p.vJato.x * 0.92, y: p.vJato.y * 0.92 }; } }
      }
      // galões com o pavio aceso
      for (i = 0; i < S.galoes.length; i++) {
        var g = S.galoes[i];
        if (g.explodiu || g.pavio < 0) continue;
        if (g.pavio-- <= 0) { g.explodiu = true; tirar(g.body); explosao(g.body.position.x, g.body.position.y, 200, 22, 3400, 'galao', g); }
      }
      // frutas no ar ou paradas
      var lider = null;
      for (i = 0; i < S.projeteis.length; i++) {
        p = S.projeteis[i];
        if (p.feito) continue;
        var c = p.body, x = c.position.x, y = c.position.y;
        p.voo++;
        if (p.tipo === 'abacaxi_azedo' && p.pavio >= 0 && !p.explodiu && p.pavio-- <= 0) { explodirAbacaxi(p); ev({ tipo: 'poder', fruta: p.tipo, x: x, y: y }); continue; }
        if (p.bateu && c.frictionAir === 0) c.frictionAir = 0.02;
        if (c.speed < 0.3) p.parado++; else p.parado = 0;
        if (x < -600 || x > W + 800 || y > CH + 300 || p.parado > 45 || p.voo > 900 || c.isSleeping) {
          p.feito = true;
          if (!p.bateu) ev({ tipo: 'fora', fruta: p.tipo });
        }
        if (!lider || (p.principal && !lider.principal)) lider = p;
      }
      if (lider && !lider.bateu && S.passos % 3 === 0) S.rastro.push({ x: lider.body.position.x, y: lider.body.position.y });
      if (lider && lider.bateu && S.passos % 3 === 0 && S.rastro.length && lider.voo < 200) S.rastro.push({ x: lider.body.position.x, y: lider.body.position.y });
      // pragas: tontas somem num "puf"; caiu longe = nocaute
      for (i = 0; i < S.pragas.length; i++) {
        var pr = S.pragas[i];
        if (!pr.ko) {
          var q = pr.body.position;
          if (q.y > CH + 200 || q.x < -600 || q.x > W + 800) nocautear(pr);
        } else if (!pr.sumiu && S.passos - pr.koT > TONTA) {
          pr.sumiu = true; tirar(pr.body);
          ev({ tipo: 'puf', praga: pr.tipo, x: pr.body.position.x, y: pr.body.position.y });
        }
      }
      for (i = 0; i < S.blocos.length; i++) { b = S.blocos[i]; if (!b.quebrado && (b.body.position.x > W + 900 || b.body.position.y > CH + 400)) { b.quebrado = true; tirar(b.body); } }
      if (remover.length) {
        for (i = 0; i < remover.length; i++) Composite.remove(mundo, remover[i]);
        remover = [];
        acordarTudo();
      }
      // fim de fase
      if (!S.resultado && S.vitoriaT == null && vivas() === 0) { S.vitoriaT = VITORIA; ev({ tipo: 'ultima' }); return; }
      if (S.vitoriaT != null && !S.resultado) {
        if (--S.vitoriaT <= 0) {
          var sobra = S.fila.length + (S.atual ? 1 : 0), bonus = R.bonusFrutas(sobra);
          S.pontos += bonus;
          S.resultado = { venceu: true, sobra: sobra, bonus: bonus, pontos: S.pontos, estrelas: R.estrelas(S.pontos, fase.parScores, true) };
          S.estado = 'vitoria'; S.atual = null;
          ev({ tipo: 'vitoria' });
        }
        return;
      }
      if (S.resultado) return;
      // turno
      if (S.estado === 'voo') {
        var todos = true;
        for (i = 0; i < S.projeteis.length; i++) if (!S.projeteis[i].feito) { todos = false; break; }
        if (todos) { S.estado = 'espera'; S.esperaT = 0; S.calmoT = 0; }
      } else if (S.estado === 'espera') {
        S.esperaT++;
        S.calmoT = calmo() ? S.calmoT + 1 : 0;
        if (S.calmoT > 30 || S.esperaT > ESPERA_MAX) fimDoTurno();
      } else if (S.estado === 'contagem') {
        S.contagemT--;
        if (S.contagemT <= 0) {
          S.resultado = { venceu: false, sobra: 0, bonus: 0, pontos: S.pontos, estrelas: 0 };
          S.estado = 'derrota';
          ev({ tipo: 'derrota' });
        }
      }
    };
    function fimDoTurno() {
      var t = S.turno || { danos: 0, quebras: 0, kos: 0, pontos: 0 };
      ev({ tipo: 'turno', danos: t.danos, quebras: t.quebras, kos: t.kos, pontos: t.pontos });
      // as frutas usadas viram suco e somem
      for (var i = 0; i < S.projeteis.length; i++) {
        var p = S.projeteis[i];
        if (!p.sumiu && !p.explodiu) ev({ tipo: 'some', fruta: p.tipo, x: p.body.position.x, y: p.body.position.y, r: p.r });
        p.sumiu = true;
        if (Composite.get(mundo, p.body.id, 'body')) Composite.remove(mundo, p.body);
      }
      S.projeteis = [];
      if (S.fila.length) carregar();
      else { S.estado = 'contagem'; S.contagemT = CONTAGEM; ev({ tipo: 'contagem' }); }
    }

    S.vivas = vivas;
    S.calmo = calmo;
    S.principal = principal;
    S.corpos = function () { return mundo.bodies; };
    S.objeto = function (corpo) { return porId[corpo.id]; };
    // para os testes: nocauteia todas as pragas (a vitória chega 3 s depois, como no jogo)
    S.vencer = function () { S.pragas.forEach(function (p) { if (!p.ko) { if (!S.turno) novoTurno(); nocautear(p); } }); };
    S.semFrutas = function () { S.fila = []; };
    S.ferir = ferirPraga;   // um golpe direto numa praga (testes)
    carregar();
    return S;
  }
  return { criar: criar, CARENCIA: CARENCIA };
});
