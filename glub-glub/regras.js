/* GLUB GLUB — regras do jogo, sem tela. Funciona no navegador (window.GlubRegras) e no Node (require), para os testes.

   O mundo: altura 1000, largura 1000 × aspecto (largura/altura da tela). A superfície da água fica em y = E.sup; o fundo
   em y = 1000. Cada jogador tem uma vara com a ponta acima da água (Juca à esquerda, Lili à direita); o anzol fica
   pendurado a L_LINHA da ponta, balançando sozinho (pêndulo). 🎣 = mergulha em linha reta na direção da linha naquele
   instante (a reta passa pela ponta da vara) e pega o PRIMEIRO bicho que encostar; sem nada até o fundo ou a borda, volta
   vazio. ⬆️ segurando = sobe mais rápido; ⬆️ na descida = desiste. Os pontos entram quando o bicho chega ao balde.

   GlubRegras.NIVEIS                      facil | medio | dificil (ver NIVEIS abaixo)
   GlubRegras.BICHOS                      { id, nome: {pt, en}, faixa, pontos, tam, peso, tipo, alt, raro? }
   GlubRegras.criar({ semente, aspecto, jogadores: [{ lado, nivel, robo }] })  → E
   GlubRegras.passo(E, dt)                → eventos: fisgou | pegou | vazio | balde | poder | bonus | bonusFim | fim
   GlubRegras.pescar(E, j, ang?)          → true se o mergulho começou (ang de fora: TV e rede, entregas 2 e 3)
   GlubRegras.subir(E, j, segurando)
   GlubRegras.redimensionar(E, aspecto)   tela girou: tudo fica no mesmo lugar, proporcionalmente
   GlubRegras.placar(E)                   → { pontos: [a, b], time, vencedor: 0 | 1 | -1 }
   GlubRegras.ponta(E, j), repouso(E, j, ang)   onde ficam a ponta da vara e o anzol parado
   GlubRegras.colocar(E, id, x, y, {vel}), colocarBolha(E, id, x, y)   para os testes e a vitrine */
(function (raiz) {
  'use strict';
  var H = 1000, PASSO = 1 / 60, L_LINHA = 95, ACIMA = 120, FOLGA_FIM = 1.5;
  var DURACAO = 60, BONUS_EM = 32, BONUS_DURA = 15, EXTRA_BALDE = 10, BOLHA_CADA = 12, RARO_CADA = 20;

  var NIVEIS = {
    facil:   { id: 'facil',   cardume: 6,  vel: 0.045, zigue: 0,   balanco: 0.25, angMax: 0.75, mergulho: 0.6, subida: 0.6,
               robo: { erro: 0.3,  espera: [1.6, 3.2] }, pedido: { tipos: 2, total: 3 } },
    medio:   { id: 'medio',   cardume: 10, vel: 0.075, zigue: 0.5, balanco: 0.35, angMax: 0.85, mergulho: 0.6, subida: 0.6,
               robo: { erro: 0.14, espera: [1.0, 2.2] }, pedido: { tipos: 3, total: 5 } },
    dificil: { id: 'dificil', cardume: 14, vel: 0.11,  zigue: 1,   balanco: 0.5,  angMax: 0.95, mergulho: 0.6, subida: 0.6,
               robo: { erro: 0.04, espera: [0.4, 1.0] }, pedido: { tipos: 3, total: 7 } }
  };
  var ORDEM = ['facil', 'medio', 'dificil'];

  function b(id, pt, en, faixa, pontos, tam, peso, tipo, alt, raro) {
    var o = { id: id, nome: { pt: pt, en: en }, faixa: faixa, pontos: pontos, tam: tam, peso: peso, tipo: tipo, alt: alt || 0.5 };
    if (raro) o.raro = true;
    return o;
  }
  var BICHOS = [
    b('lambari', 'Lambari', 'Lambari', 1, 1, 0.034, 1, 'bicho', 0.42),
    b('piaba', 'Piaba', 'Piaba', 1, 1, 0.03, 1, 'bicho', 0.42),
    b('tilapia', 'Tilápia', 'Tilapia', 1, 2, 0.046, 1, 'bicho', 0.55),
    b('baiacu', 'Baiacu', 'Pufferfish', 1, 3, 0.044, 1, 'bicho', 0.8),
    b('traira', 'Traíra', 'Wolf fish', 2, 5, 0.058, 2, 'bicho', 0.4),
    b('pacu', 'Pacu', 'Pacu', 2, 5, 0.056, 2, 'bicho', 0.7),
    b('bagre', 'Bagre', 'Catfish', 2, 6, 0.062, 2, 'bicho', 0.4),
    b('tartaruga', 'Tartaruga', 'Turtle', 2, 8, 0.066, 3, 'bicho', 0.6),
    b('bota', 'Bota velha', 'Old boot', 3, 1, 0.046, 1, 'premio', 0.85),
    b('garrafa', 'Garrafa com bilhete', 'Message in a bottle', 3, 10, 0.046, 1, 'premio', 0.5),
    b('bau', 'Baú', 'Treasure chest', 3, 15, 0.06, 2, 'premio', 0.75),
    b('polvo', 'Polvo', 'Octopus', 4, 12, 0.07, 3, 'bicho', 0.85),
    b('lagosta', 'Lagosta', 'Lobster', 4, 15, 0.072, 3, 'bicho', 0.5),
    b('caranguejo', 'Caranguejo gigante', 'Giant crab', 4, 20, 0.08, 3, 'bicho', 0.6),
    b('tubarao', 'Tubarão', 'Shark', 4, 25, 0.1, 4, 'bicho', 0.4),
    b('martelo', 'Tubarão-martelo', 'Hammerhead shark', 4, 30, 0.1, 4, 'bicho', 0.45),
    b('tubarao-baleia', 'Tubarão-baleia', 'Whale shark', 5, 40, 0.14, 5, 'bicho', 0.4),
    b('baleia', 'Baleia', 'Whale', 5, 60, 0.17, 5, 'bicho', 0.45),
    b('sereia', 'Sereia Iara', 'Iara the mermaid', 5, 80, 0.1, 4, 'bicho', 0.55),
    b('pirarucu', 'Pirarucu Dourado', 'Golden Arapaima', 6, 500, 0.13, 5, 'bicho', 0.35, true),
    b('pet', 'Garrafa PET', 'Plastic bottle', 0, 3, 0.04, 1, 'lixo', 0.45),
    b('lata', 'Lata', 'Can', 0, 3, 0.03, 1, 'lixo', 0.75),
    b('sacola', 'Sacolinha', 'Plastic bag', 0, 4, 0.045, 1, 'lixo', 0.8),
    b('chinelo', 'Chinelo', 'Flip-flop', 0, 5, 0.045, 1, 'lixo', 0.5),
    b('pneu', 'Pneu velho', 'Old tire', 0, 8, 0.06, 2, 'lixo', 0.9)
  ];
  var POR_ID = {};
  BICHOS.forEach(function (x) { POR_ID[x.id] = x; });
  // linhas de cada faixa, em fração da profundidade da água (0 = superfície, 1 = fundo)
  var LINHAS = { 1: [0.08, 0.16, 0.24], 2: [0.34, 0.43], 3: [0.53], 4: [0.63, 0.72], 5: [0.82], 6: [0.92] };
  var VEL_FAIXA = { 1: 1, 2: 0.8, 3: 0, 4: 0.5, 5: 0.32, 6: 0.28 };
  var PODERES = ['rede', 'ligeiro', 'minhoca'];
  function daFaixa(f, tipo) { return BICHOS.filter(function (x) { return x.faixa === f && x.tipo === (tipo || 'bicho') && !x.raro; }); }

  function mulberry32(a) {
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function supDe(aspecto) { return aspecto >= 1 ? 270 : 230; }
  function fundoY(E, fy) { return E.sup + (H - E.sup) * fy; }
  function sortear(E, lista) { return lista[Math.floor(E.rnd() * lista.length)]; }
  function nivelDoLago(jogadores) {
    var i = Math.min.apply(null, jogadores.map(function (j) { var k = ORDEM.indexOf(j.nivel); return k < 0 ? 0 : k; }));
    return NIVEIS[ORDEM[i]];
  }

  /* ---------- bichos no lago ---------- */
  function novoBicho(E, id, x, fy, dir, v) {
    var d = POR_ID[id];
    var o = { id: id, tipo: d.tipo, faixa: d.faixa, pontos: d.pontos, peso: d.peso, tam: d.tam, alt: d.alt, raro: !!d.raro,
      x: x, fy: fy, fy0: fy, y: fundoY(E, fy), dir: dir, v: v, fase: E.rnd() * 6.28, wf: 0.6 + E.rnd() * 0.8, preso: null, n: E.seq++ };
    E.bichos.push(o);
    return o;
  }
  function velDe(E, faixa) { return E.nv.vel * VEL_FAIXA[faixa] * (0.8 + E.rnd() * 0.4); }
  function povoar(E) {
    var n = E.cardume, n1 = Math.ceil(n * 0.6), cont = { 1: n1, 2: n - n1, 3: 4, 4: 4, 5: 2 };
    [1, 2, 3, 4, 5].forEach(function (f) {
      var lista = daFaixa(f, f === 3 ? 'premio' : 'bicho'), linhas = LINHAS[f];
      for (var i = 0; i < cont[f]; i++) {
        var d = f === 3 ? lista[i % lista.length] : sortear(E, lista);
        var x = (i + 0.3 + E.rnd() * 0.4) / cont[f] * E.W, linha = linhas[i % linhas.length];
        novoBicho(E, d.id, x, linha, (i + f) % 2 ? 1 : -1, velDe(E, f));
      }
    });
  }
  function repor(E, faixa) {
    if (!E.repor || faixa < 1 || faixa > 5) return;
    E.fila.push({ faixa: faixa, t: E.t + 2 });
  }
  function entrarNovo(E, faixa) {
    var lista = daFaixa(faixa, faixa === 3 ? 'premio' : 'bicho'), d = sortear(E, lista);
    // metade das vezes, um bicho que algum balde está pedindo (para o pedido não ficar impossível)
    var pedidos = [];
    E.j.forEach(function (j) { j.balde.pedido.forEach(function (p) { if (p.falta > 0 && POR_ID[p.id].faixa === faixa) pedidos.push(p.id); }); });
    if (pedidos.length && E.rnd() < 0.5) d = POR_ID[sortear(E, pedidos)];
    var linhas = LINHAS[faixa], linha = linhas[Math.floor(E.rnd() * linhas.length)];
    if (faixa === 3) { novoBicho(E, d.id, (0.1 + E.rnd() * 0.8) * E.W, linha, 1, 0); return; }
    var dir = E.rnd() < 0.5 ? 1 : -1, r = d.tam * H / 2;
    novoBicho(E, d.id, dir > 0 ? -r : E.W + r, linha, dir, velDe(E, faixa));
  }
  function moverBichos(E, h) {
    var z = E.nv.zigue;
    for (var i = E.bichos.length - 1; i >= 0; i--) {
      var o = E.bichos[i];
      if (o.preso != null) continue;
      var r = o.tam * H / 2;
      if (o.tipo === 'lixo') {   // afunda devagar e fica no fundo
        if (o.fy < 0.95) { o.fy += 0.05 * h; o.x += o.v * E.W * h; }
        o.y = fundoY(E, o.fy) + Math.sin(E.t * 1.5 + o.fase) * 3;
        continue;
      }
      if (o.v) {
        var ritmo = 1 + z * 0.6 * Math.sin(o.fase + E.t * o.wf * 2);
        if (z && E.rnd() < z * 0.12 * h) o.dir = -o.dir;   // no difícil, muda de direção sem aviso
        o.x += o.dir * o.v * E.W * ritmo * h;
        if (o.raro) { if (o.x < -r * 2 || o.x > E.W + r * 2) { E.bichos.splice(i, 1); continue; } }
        else if (o.x < -r) o.x = E.W + r; else if (o.x > E.W + r) o.x = -r;
      }
      if (o.minhoca) {   // minhoca dourada: sobe até a faixa 2 e depois volta
        var alvo = E.t < o.minhoca ? LINHAS[2][1] : o.fy0;
        o.fy += Math.max(-0.12 * h, Math.min(0.12 * h, alvo - o.fy));
        if (E.t >= o.minhoca && Math.abs(o.fy - o.fy0) < 1e-3) { o.fy = o.fy0; o.minhoca = 0; }
      }
      o.y = fundoY(E, o.fy) + (z ? Math.sin(E.t * o.wf * 1.7 + o.fase) * z * 12 : 0) + (o.faixa === 3 ? Math.sin(E.t + o.fase) * 3 : 0);
    }
  }
  function encosta(o, x, y) {
    var rx = o.tam * H / 2 + 6, ry = o.tam * H / 2 * o.alt + 6, dx = (x - o.x) / rx, dy = (y - o.y) / ry;
    return dx * dx + dy * dy <= 1;
  }

  /* ---------- bolhas de poder, bicho raro, "Limpa o Rio!" ---------- */
  function colocarBolha(E, id, x, y) { var o = { id: id, x: x, fy: (y - E.sup) / (H - E.sup), y: y }; E.bolhas.push(o); return o; }
  function moverBolhas(E, h) {
    if (E.t >= E.proxBolha && !E.bolhas.length && !E.bonus && !E.acabou) {
      E.proxBolha = E.t + BOLHA_CADA;
      colocarBolha(E, sortear(E, PODERES), (0.15 + E.rnd() * 0.7) * E.W, fundoY(E, 0.62 + E.rnd() * 0.15));
    }
    for (var i = E.bolhas.length - 1; i >= 0; i--) {
      var o = E.bolhas[i];
      o.fy -= 0.035 * h; o.y = fundoY(E, o.fy); o.x += Math.sin(E.t * 2 + i) * 8 * h;
      if (o.fy <= 0.02) E.bolhas.splice(i, 1);
    }
  }
  function raro(E) {
    if (E.t < E.proxRaro) return;
    E.proxRaro = E.t + RARO_CADA;
    if (E.bonus || E.acabou || E.bichos.some(function (o) { return o.raro; }) || E.rnd() > 0.35) return;
    var dir = E.rnd() < 0.5 ? 1 : -1, r = POR_ID.pirarucu.tam * H;
    novoBicho(E, 'pirarucu', dir > 0 ? -r : E.W + r, LINHAS[6][0], dir, E.nv.vel * VEL_FAIXA[6]);
  }
  function bonus(E, ev) {
    if (!E.bonusFeito && !E.acabou && E.tempo <= BONUS_EM) {
      E.bonusFeito = true; E.bonus = { fim: E.t + BONUS_DURA, prox: E.t };
      E.bichos = E.bichos.filter(function (o) { return o.preso != null; });
      E.bolhas = []; E.fila = [];
      ev.push({ tipo: 'bonus' });
    }
    if (!E.bonus) return;
    if (E.t >= E.bonus.fim || E.acabou) {
      E.bonus = null;
      E.bichos = E.bichos.filter(function (o) { return o.preso != null; });
      povoar(E);
      ev.push({ tipo: 'bonusFim' });
      return;
    }
    if (E.t >= E.bonus.prox && E.bichos.filter(function (o) { return o.tipo === 'lixo'; }).length < 16) {
      E.bonus.prox = E.t + 0.5;
      var d = sortear(E, BICHOS.filter(function (x) { return x.tipo === 'lixo'; }));
      var o = novoBicho(E, d.id, (0.06 + E.rnd() * 0.88) * E.W, 0.02, 1, (E.rnd() - 0.5) * 0.02);
      o.fy0 = o.fy;
    }
  }

  /* ---------- jogadores ---------- */
  function ponta(E, j) {
    var lado = E.j[j].lado === 'dir';
    return { x: E.W * (lado ? 0.79 : 0.21), y: E.sup - ACIMA };
  }
  function repouso(E, j, ang) { var p = ponta(E, j); return { x: p.x + Math.sin(ang) * L_LINHA, y: p.y + Math.cos(ang) * L_LINHA }; }
  function novoPedido(E, j) {
    var J = E.j[j], nv = NIVEIS[J.nivel], faixas = J.nivel === 'facil' ? [1, 2] : J.nivel === 'medio' ? [1, 2, 4] : [1, 2, 4];
    var cand = [];
    E.bichos.forEach(function (o) { if (o.tipo === 'bicho' && !o.raro && faixas.indexOf(o.faixa) >= 0 && cand.indexOf(o.id) < 0) cand.push(o.id); });
    faixas.forEach(function (f) { daFaixa(f).forEach(function (x) { if (cand.length < nv.pedido.tipos && cand.indexOf(x.id) < 0) cand.push(x.id); }); });
    if (J.nivel === 'medio') {   // médio: no máximo um bicho do fundo no pedido
      var fundo = cand.filter(function (id) { return POR_ID[id].faixa === 4; });
      cand = cand.filter(function (id) { return POR_ID[id].faixa < 4; }).concat(fundo.length ? [sortear(E, fundo)] : []);
    }
    var tipos = [];
    while (tipos.length < nv.pedido.tipos && cand.length) tipos.push(cand.splice(Math.floor(E.rnd() * cand.length), 1)[0]);
    var total = nv.pedido.total + Math.min(J.balde.cheios, 4), pedido = tipos.map(function (id) { return { id: id, falta: 1 }; });
    for (var k = tipos.length; k < total; k++) pedido[Math.floor(E.rnd() * pedido.length)].falta++;
    J.balde.pedido = pedido;
  }

  function criar(op) {
    var aspecto = op.aspecto || 16 / 9, E = {
      W: H * aspecto, sup: supDe(aspecto), t: 0, tempo: DURACAO, rnd: mulberry32(op.semente || 1), seq: 0,
      bichos: [], bolhas: [], fila: [], pend: [], repor: true, proxBolha: 8, proxRaro: RARO_CADA,
      bonus: null, bonusFeito: false, acabou: false, fimT: 0, encerrado: false
    };
    E.nv = nivelDoLago(op.jogadores); E.cardume = E.nv.cardume;
    E.j = op.jogadores.map(function (x) {
      return { lado: x.lado, nivel: NIVEIS[x.nivel] ? x.nivel : 'facil', robo: !!x.robo, pontos: 0, poder: null,
        anzol: { fase: 'balanca', ang: 0, x: 0, y: 0, presos: [], dist: 0, dirAng: 0, segurando: false, tb: x.lado === 'dir' ? 1.3 : 0 },
        balde: { pedido: [], cheios: 0 }, roboProx: 1 + (x.lado === 'dir' ? 0.5 : 0) };
    });
    povoar(E);
    E.j.forEach(function (J, j) { novoPedido(E, j); var p = repouso(E, j, 0); J.anzol.x = p.x; J.anzol.y = p.y; });
    return E;
  }
  function veloz(E, J) { return J.poder && J.poder.id === 'ligeiro' && E.t < J.poder.ate ? 2 : 1; }

  function pescar(E, j, ang) {
    var a = E.j[j].anzol;
    if (E.acabou || a.fase !== 'balanca') return false;
    a.dirAng = typeof ang === 'number' ? ang : a.ang; a.ang = a.dirAng;
    a.fase = 'desce'; a.dist = 0;
    var p = repouso(E, j, a.dirAng); a.x = p.x; a.y = p.y;
    return true;
  }
  function subir(E, j, segurando) {
    var a = E.j[j].anzol;
    a.segurando = !!segurando;
    if (segurando && a.fase === 'desce') { a.fase = 'sobe'; E.pend.push({ tipo: 'vazio', j: j }); }
  }

  function chegou(E, j, ev) {
    var J = E.j[j], a = J.anzol, valeu = !E.acabou || E.t - E.fimT <= FOLGA_FIM;
    a.presos.forEach(function (o) {
      var k = E.bichos.indexOf(o); if (k >= 0) E.bichos.splice(k, 1);
      if (!valeu) return;
      J.pontos += o.pontos;
      ev.push({ tipo: 'pegou', j: j, bicho: { id: o.id, tipo: o.tipo, faixa: o.faixa }, pontos: o.pontos });
      if (o.tipo !== 'lixo') repor(E, o.faixa);
      var p = J.balde.pedido.filter(function (x) { return x.id === o.id && x.falta > 0; })[0];
      if (p) {
        p.falta--;
        if (J.balde.pedido.every(function (x) { return x.falta === 0; })) {
          J.balde.cheios++; if (!E.acabou) E.tempo += EXTRA_BALDE;
          novoPedido(E, j);
          ev.push({ tipo: 'balde', j: j, cheios: J.balde.cheios });
        }
      }
    });
    a.presos = []; a.fase = 'balanca'; a.segurando = a.segurando && !J.robo ? a.segurando : false;
  }

  function moverAnzol(E, j, h, ev) {
    var J = E.j[j], a = J.anzol, nv = NIVEIS[J.nivel], pt = ponta(E, j), vz = veloz(E, J);
    if (a.fase === 'balanca') {
      a.tb += h; a.ang = nv.angMax * Math.sin(2 * Math.PI * nv.balanco * a.tb);
      a.x = pt.x + Math.sin(a.ang) * L_LINHA; a.y = pt.y + Math.cos(a.ang) * L_LINHA;
      return;
    }
    var sx = Math.sin(a.dirAng), sy = Math.cos(a.dirAng);
    if (a.fase === 'desce') {
      a.dist += nv.mergulho * H * vz * h;
      a.x = pt.x + sx * (L_LINHA + a.dist); a.y = pt.y + sy * (L_LINHA + a.dist);
      for (var k = E.bolhas.length - 1; k >= 0; k--) {
        var bo = E.bolhas[k];
        if (Math.hypot(bo.x - a.x, bo.y - a.y) <= 30) {
          E.bolhas.splice(k, 1);
          if (bo.id === 'minhoca') {
            var grandes = E.bichos.filter(function (o) { return o.faixa >= 4 && o.faixa <= 5 && o.preso == null && o.tipo === 'bicho'; });
            if (grandes.length) sortear(E, grandes).minhoca = E.t + 6;
          } else J.poder = { id: bo.id, ate: bo.id === 'rede' ? Infinity : E.t + 10 };
          ev.push({ tipo: 'poder', j: j, poder: bo.id });
        }
      }
      var alvo = null;
      for (var i = 0; i < E.bichos.length; i++) { var o = E.bichos[i]; if (o.preso == null && encosta(o, a.x, a.y)) { alvo = o; break; } }
      if (alvo) {
        var pegos = [alvo];
        if (J.poder && J.poder.id === 'rede') {
          E.bichos.filter(function (o) { return o !== alvo && o.preso == null && Math.hypot(o.x - a.x, o.y - a.y) <= 70; })
            .sort(function (p, q) { return Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(q.x - a.x, q.y - a.y); })
            .slice(0, 2).forEach(function (o) { pegos.push(o); });
          J.poder = null;
        }
        pegos.forEach(function (o, n) { o.preso = j; o.dx = o.x - a.x; o.dy = o.y - a.y; o.minhoca = 0; a.presos.push(o); ev.push({ tipo: 'fisgou', j: j, bicho: { id: o.id, tipo: o.tipo, faixa: o.faixa }, pontos: o.pontos, n: n }); });
        a.fase = 'sobe';
      } else if (a.y >= H - 15 || a.x <= 0 || a.x >= E.W) {
        a.fase = 'sobe'; ev.push({ tipo: 'vazio', j: j });
      }
      return;
    }
    // sobe: o bicho mais pesado deixa a subida mais lenta; ⬆️ segurando puxa 2,5 vezes mais rápido
    var peso = a.presos.reduce(function (m, o) { return Math.max(m, o.peso); }, 0);
    var v = nv.subida * H * vz / (peso ? 0.7 + 0.3 * peso : 0.7) * (a.segurando ? 2.5 : 1);
    a.dist -= v * h;
    if (a.dist <= 0) { a.dist = 0; a.x = pt.x + sx * L_LINHA; a.y = pt.y + sy * L_LINHA; chegou(E, j, ev); a.tb = Math.asin(Math.max(-1, Math.min(1, a.ang / nv.angMax))) / (2 * Math.PI * nv.balanco); return; }
    a.x = pt.x + sx * (L_LINHA + a.dist); a.y = pt.y + sy * (L_LINHA + a.dist);
    a.presos.forEach(function (o) { o.x = a.x; o.y = a.y + o.tam * H * o.alt * 0.4; o.fy = (o.y - E.sup) / (H - E.sup); });
  }

  /* ---------- robô (o outro personagem no modo sozinho) ---------- */
  function primeiroNoCaminho(E, j, ang) {
    var pt = ponta(E, j), sx = Math.sin(ang), sy = Math.cos(ang);
    for (var d = L_LINHA; d < 1400; d += 14) {
      var x = pt.x + sx * d, y = pt.y + sy * d;
      if (y >= H - 15 || x <= 0 || x >= E.W) return null;
      for (var i = 0; i < E.bichos.length; i++) if (E.bichos[i].preso == null && encosta(E.bichos[i], x, y)) return E.bichos[i];
    }
    return null;
  }
  function robo(E, j) {
    var J = E.j[j], a = J.anzol, rb = NIVEIS[J.nivel].robo;
    if (a.fase === 'sobe') { a.segurando = a.presos.length > 0 && (J.nivel === 'dificil' || (J.nivel === 'medio' && a.presos[0].peso >= 3)); return; }
    if (a.fase !== 'balanca' || E.t < J.roboProx || E.acabou) return;
    var alvo = primeiroNoCaminho(E, j, a.ang), cansou = E.t > J.roboProx + rb.espera[1] * 2;
    if ((alvo && alvo.pontos >= 5) || cansou) {
      pescar(E, j, a.ang + (E.rnd() * 2 - 1) * rb.erro);
      J.roboProx = E.t + rb.espera[0] + E.rnd() * (rb.espera[1] - rb.espera[0]);
    }
  }

  function passo(E, dt) {
    if (E.encerrado) return [];
    var ev = E.pend.splice(0), n = Math.max(1, Math.ceil(dt / PASSO - 1e-9)), h = dt / n;
    for (var s = 0; s < n && !E.encerrado; s++) {
      E.t += h;
      if (!E.acabou) {
        E.tempo -= h;
        if (E.tempo <= 0) { E.tempo = 0; E.acabou = true; E.fimT = E.t; ev.push({ tipo: 'fim' }); }
      } else if (E.t - E.fimT > FOLGA_FIM) {
        E.encerrado = true;
        E.j.forEach(function (J) { J.anzol.presos = []; J.anzol.fase = 'balanca'; });
        break;
      }
      bonus(E, ev);
      for (var f = E.fila.length - 1; f >= 0; f--) if (E.t >= E.fila[f].t) { if (!E.bonus) entrarNovo(E, E.fila[f].faixa); E.fila.splice(f, 1); }
      raro(E);
      moverBichos(E, h);
      moverBolhas(E, h);
      for (var j = 0; j < E.j.length; j++) { if (E.j[j].robo) robo(E, j); moverAnzol(E, j, h, ev); }
    }
    return ev;
  }

  function redimensionar(E, aspecto) {
    var W = H * aspecto, f = W / E.W;
    E.bichos.forEach(function (o) { o.x *= f; });
    E.bolhas.forEach(function (o) { o.x *= f; });
    E.W = W; E.sup = supDe(aspecto);
    E.bichos.forEach(function (o) { o.y = fundoY(E, o.fy); });
    E.bolhas.forEach(function (o) { o.y = fundoY(E, o.fy); });
  }
  function placar(E) {
    var p = E.j.map(function (J) { return J.pontos; });
    return { pontos: p, time: p.reduce(function (s, x) { return s + x; }, 0), vencedor: p[0] === p[1] ? -1 : p[0] > p[1] ? 0 : 1 };
  }
  function colocar(E, id, x, y, op) {
    var d = POR_ID[id], v = op && typeof op.vel === 'number' ? op.vel : velDe(E, Math.max(1, d.faixa));
    return novoBicho(E, id, x, (y - E.sup) / (H - E.sup), 1, v);
  }

  var GlubRegras = { NIVEIS: NIVEIS, ORDEM: ORDEM, BICHOS: BICHOS, POR_ID: POR_ID, LINHAS: LINHAS, H: H, L_LINHA: L_LINHA,
    criar: criar, passo: passo, pescar: pescar, subir: subir, redimensionar: redimensionar, placar: placar,
    ponta: ponta, repouso: repouso, colocar: colocar, colocarBolha: colocarBolha };
  if (typeof module !== 'undefined' && module.exports) module.exports = GlubRegras;
  else raiz.GlubRegras = GlubRegras;
})(this);
