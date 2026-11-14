/* GLUB GLUB — regras do jogo, sem tela. Funciona no navegador (window.GlubRegras) e no Node (require), para os testes.

   O mundo: altura 1000, largura 1000 × aspecto (largura/altura da tela). A superfície da água fica em y = E.sup; o fundo
   em y = 1000. Cada jogador tem uma vara com a ponta acima da água (Juca à esquerda, Lili à direita); o anzol fica
   pendurado a L_LINHA da ponta, balançando sozinho (pêndulo). 🎣 = mergulha em linha reta na direção da linha naquele
   instante (a reta passa pela ponta da vara) e pega o PRIMEIRO bicho que encostar; sem nada até o fundo ou a borda, volta
   vazio. ⬆️ segurando = sobe mais rápido; ⬆️ na descida = desiste. Os pontos entram quando o bicho chega ao balde.

   GlubRegras.NIVEIS                      facil | medio | dificil (ver NIVEIS abaixo)
   GlubRegras.BICHOS                      { id, nome: {pt, en, es}, faixa, pontos, tam, peso, tipo, alt, raro? }
   GlubRegras.criar({ semente, aspecto, jogadores: [{ lado, nivel, robo }] })  → E
   GlubRegras.passo(E, dt)                → eventos: fisgou | pegou | vazio | balde | poder | bonus | bonusFim | fim
                                            | piranhas | cortou | raro | salvou | filhote | entregou | acertou | chefe
   Rodada especial (uma por partida, sorteada; E.rodada): limpa (rede pega até 3 lixos), socorro (boias nos banhistas),
   filhotes (levar o filhote de tartaruga até a mãe), estrelas (estrelas douradas caindo), gigante (3 acertos no dragão).
   GlubRegras.pescar(E, j, ang?)          → true se o mergulho começou (ang de fora: TV e rede, entregas 2 e 3)
   GlubRegras.subir(E, j, segurando)
   GlubRegras.redimensionar(E, aspecto)   tela girou: tudo fica no mesmo lugar, proporcionalmente
   GlubRegras.placar(E)                   → { pontos: [a, b], time, vencedor: 0 | 1 | -1 }
   GlubRegras.ponta(E, j), repouso(E, j, ang)   onde ficam a ponta da vara e o anzol parado
   GlubRegras.colocar(E, id, x, y, {vel}), colocarBolha(E, id, x, y)   para os testes e a vitrine */
(function (raiz) {
  'use strict';
  var H = 1000, PASSO = 1 / 60, L_LINHA = 95, ACIMA = 165, FOLGA_FIM = 1.5;
  var DURACAO = 60, BONUS_EM = 32, BONUS_DURA = 15, EXTRA_BALDE = 10, BOLHA_CADA = 12, RARO_CADA = 14;
  var RODADAS = ['limpa', 'socorro', 'filhotes', 'estrelas', 'gigante'];
  var CORTADA = 2, VOO = 0.9, PUXA = 0.6, ARCO = 230, ACERTOS = 3;

  var NIVEIS = {
    facil:   { id: 'facil',   cardume: 6,  vel: 0.045, zigue: 0,   balanco: 0.25, angMax: 0.75, mergulho: 0.6, subida: 0.6,
               robo: { erro: 0.3,  espera: [1.6, 3.2] }, pedido: { tipos: 2, total: 3 }, piranha: { n: 4, cada: 26 } },
    medio:   { id: 'medio',   cardume: 10, vel: 0.075, zigue: 0.5, balanco: 0.35, angMax: 0.85, mergulho: 0.6, subida: 0.6,
               robo: { erro: 0.14, espera: [1.0, 2.2] }, pedido: { tipos: 3, total: 5 }, piranha: { n: 6, cada: 18 } },
    dificil: { id: 'dificil', cardume: 14, vel: 0.11,  zigue: 1,   balanco: 0.5,  angMax: 0.95, mergulho: 0.6, subida: 0.6,
               robo: { erro: 0.04, espera: [0.4, 1.0] }, pedido: { tipos: 3, total: 7 }, piranha: { n: 8, cada: 12 } }
  };
  var ORDEM = ['facil', 'medio', 'dificil'];

  function b(id, pt, en, es, faixa, pontos, tam, peso, tipo, alt, raro) {
    var o = { id: id, nome: { pt: pt, en: en, es: es }, faixa: faixa, pontos: pontos, tam: tam, peso: peso, tipo: tipo, alt: alt || 0.5 };
    if (raro) o.raro = true;
    return o;
  }
  var BICHOS = [
    b('lambari', 'Lambari', 'Lambari', 'Lambari', 1, 1, 0.048, 1, 'bicho', 0.63),
    b('piaba', 'Piaba', 'Piaba', 'Piaba', 1, 1, 0.044, 1, 'bicho', 0.67),
    b('palhaco', 'Peixe-palhaço', 'Clownfish', 'Pez payaso', 1, 2, 0.05, 1, 'bicho', 0.63),
    b('agua-viva', 'Água-viva', 'Jellyfish', 'Medusa', 1, 3, 0.075, 1, 'bicho', 1.0),
    b('cirurgiao', 'Cirurgião-azul', 'Blue tang', 'Pez cirujano', 1, 3, 0.06, 1, 'bicho', 0.59),
    b('tilapia', 'Tilápia', 'Tilapia', 'Tilapia', 1, 2, 0.062, 1, 'bicho', 0.53),
    b('baiacu', 'Baiacu', 'Pufferfish', 'Pez globo', 1, 3, 0.06, 1, 'bicho', 0.83),
    b('traira', 'Traíra', 'Wolf fish', 'Pez lobo', 2, 5, 0.078, 2, 'bicho', 0.52),
    b('pacu', 'Pacu', 'Pacu', 'Pacú', 2, 5, 0.074, 2, 'bicho', 0.87),
    b('cavalo-marinho', 'Cavalo-marinho', 'Seahorse', 'Caballito de mar', 2, 6, 0.075, 1, 'bicho', 1.0),
    b('bagre', 'Bagre', 'Catfish', 'Pez gato', 2, 6, 0.082, 2, 'bicho', 0.58),
    b('tartaruga', 'Tartaruga', 'Turtle', 'Tortuga', 2, 8, 0.085, 3, 'bicho', 0.65),
    b('bota', 'Bota velha', 'Old boot', 'Bota vieja', 3, 1, 0.06, 1, 'premio', 0.92),
    b('garrafa', 'Garrafa com bilhete', 'Message in a bottle', 'Botella con mensaje', 3, 10, 0.06, 1, 'premio', 0.38),
    b('bau', 'Baú', 'Treasure chest', 'Cofre del tesoro', 3, 15, 0.08, 2, 'premio', 0.77),
    b('polvo', 'Polvo', 'Octopus', 'Pulpo', 4, 12, 0.09, 3, 'bicho', 0.86),
    b('lagosta', 'Lagosta', 'Lobster', 'Langosta', 4, 15, 0.095, 3, 'bicho', 0.72),
    b('caranguejo', 'Caranguejo gigante', 'Giant crab', 'Cangrejo gigante', 4, 20, 0.1, 3, 'bicho', 0.68),
    b('morsa', 'Morsa', 'Walrus', 'Morsa', 4, 22, 0.13, 5, 'bicho', 0.76),
    b('tubarao', 'Tubarão', 'Shark', 'Tiburón', 4, 25, 0.14, 4, 'bicho', 0.68),
    b('martelo', 'Tubarão-martelo', 'Hammerhead shark', 'Tiburón martillo', 4, 30, 0.14, 4, 'bicho', 0.67),
    b('tubarao-baleia', 'Tubarão-baleia', 'Whale shark', 'Tiburón ballena', 5, 40, 0.19, 5, 'bicho', 0.39),
    b('abissal', 'Peixe-abissal', 'Abyssal fish', 'Pez abisal', 5, 42, 0.1, 4, 'bicho', 0.88),
    b('lanterna', 'Peixe-lanterna', 'Anglerfish', 'Pez linterna', 5, 45, 0.11, 4, 'bicho', 0.9),
    b('orca', 'Orca', 'Orca', 'Orca', 5, 50, 0.17, 5, 'bicho', 0.64),
    b('baleia', 'Baleia', 'Whale', 'Ballena', 5, 60, 0.22, 5, 'bicho', 0.56),
    b('sereia', 'Sereia Iara', 'Iara the mermaid', 'La sirena Iara', 5, 80, 0.14, 4, 'bicho', 0.64),
    b('pirarucu', 'Pirarucu Dourado', 'Golden Arapaima', 'Arapaima Dorado', 6, 500, 0.17, 5, 'bicho', 0.46, true),
    // gigantes que brilham no escuro: passam de vez em quando, bem no fundo
    b('lula-gigante', 'Lula-gigante', 'Giant squid', 'Calamar gigante', 5, 70, 0.24, 5, 'bicho', 0.45, true),
    b('agua-viva-gigante', 'Água-viva gigante', 'Giant jellyfish', 'Medusa gigante', 5, 65, 0.2, 4, 'bicho', 1.0, true),
    b('peixe-dragao', 'Peixe-dragão', 'Dragonfish', 'Pez dragón', 5, 75, 0.2, 4, 'bicho', 0.35, true),
    // das rodadas especiais e as piranhas (não entram no cardume)
    b('gigante', 'Dragão-do-mar', 'Sea dragon', 'Dragón marino', 0, 100, 0.34, 5, 'chefe', 0.45),
    b('menino', 'Menino', 'Boy', 'Niño', 0, 10, 0.085, 1, 'banhista', 1.0),
    b('menina', 'Menina', 'Girl', 'Niña', 0, 10, 0.085, 1, 'banhista', 1.0),
    b('filhote', 'Filhote de tartaruga', 'Baby turtle', 'Tortuguita', 0, 15, 0.05, 1, 'filhote', 0.7),
    b('estrela', 'Estrela dourada', 'Golden starfish', 'Estrella dorada', 0, 5, 0.05, 1, 'estrela', 1.0),
    b('piranha', 'Piranha', 'Piranha', 'Piraña', 0, 0, 0.055, 1, 'piranha', 0.75),
    b('pet', 'Garrafa PET', 'Plastic bottle', 'Botella de plástico', 0, 3, 0.055, 1, 'lixo', 0.45),
    b('lata', 'Lata', 'Can', 'Lata', 0, 3, 0.045, 1, 'lixo', 0.75),
    b('sacola', 'Sacolinha', 'Plastic bag', 'Bolsa de plástico', 0, 4, 0.06, 1, 'lixo', 0.8),
    b('chinelo', 'Chinelo', 'Flip-flop', 'Chancla', 0, 5, 0.06, 1, 'lixo', 0.5),
    b('pneu', 'Pneu velho', 'Old tire', 'Neumático viejo', 0, 8, 0.08, 2, 'lixo', 0.9)
  ];
  var POR_ID = {};
  BICHOS.forEach(function (x) { POR_ID[x.id] = x; });
  // os que nadam devagar (fração da velocidade da faixa)
  var LENTOS = { baleia: 0.9, 'agua-viva': 0.35, 'cavalo-marinho': 0.3, tartaruga: 0.7, polvo: 0.8, lagosta: 0.8, caranguejo: 0.6, morsa: 0.9, 'agua-viva-gigante': 0.45 };
  Object.keys(LENTOS).forEach(function (id) { POR_ID[id].lento = LENTOS[id]; });
  // linhas de cada faixa, em fração da profundidade da água (0 = superfície, 1 = fundo)
  var LINHAS = { 1: [0.08, 0.16, 0.24], 2: [0.34, 0.43], 3: [0.53], 4: [0.63, 0.72], 5: [0.82], 6: [0.92] };
  // quem vale mais nada um pouco mais rápido (sempre na medida do nível: vel do nível × faixa)
  var VEL_FAIXA = { 1: 1, 2: 1, 3: 0, 4: 1.1, 5: 1.25, 6: 1.3 };
  var GIGANTES = ['lula-gigante', 'agua-viva-gigante', 'peixe-dragao'];
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
  function velDe(E, faixa, id) { return E.nv.vel * VEL_FAIXA[faixa] * (0.8 + E.rnd() * 0.4) * ((id && POR_ID[id].lento) || 1); }
  function povoar(E) {
    var n = E.cardume, n1 = Math.ceil(n * 0.6), cont = { 1: n1, 2: n - n1, 3: 4, 4: 4, 5: 2 };
    [1, 2, 3, 4, 5].forEach(function (f) {
      var lista = daFaixa(f, f === 3 ? 'premio' : 'bicho'), linhas = LINHAS[f];
      for (var i = 0; i < cont[f]; i++) {
        var d = f === 3 ? lista[i % lista.length] : sortear(E, lista);
        var x = (i + 0.3 + E.rnd() * 0.4) / cont[f] * E.W, linha = linhas[i % linhas.length];
        novoBicho(E, d.id, x, linha, (i + f) % 2 ? 1 : -1, velDe(E, f, d.id));
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
    var dir = E.rnd() < 0.5 ? 1 : -1, r = d.tam * H * E.esc / 2;
    novoBicho(E, d.id, dir > 0 ? -r : E.W + r, linha, dir, velDe(E, faixa, d.id));
  }
  function moverBichos(E, h) {
    var z = E.nv.zigue;
    for (var i = E.bichos.length - 1; i >= 0; i--) {
      var o = E.bichos[i];
      if (o.preso != null) continue;
      var r = o.tam * H * E.esc / 2;
      if (especial(E, o, r, h)) { if (o.fora) E.bichos.splice(i, 1); continue; }
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
      o.y = fundoY(E, o.fy) + Math.sin(E.t * o.wf * 1.1 + o.fase) * (4 + z * 10) + (o.faixa === 3 ? Math.sin(E.t + o.fase) * 3 : 0);
    }
  }
  // os que não são do cardume: cada um anda do seu jeito; o.fora = sair do lago
  function saiu(E, o, r) { return o.dir > 0 ? o.x > E.W + r * 2 : o.x < -r * 2; }
  function vaiEvolta(E, o, r, h, v) {   // nada de um lado para o outro sem sair da tela
    o.x += o.dir * v * E.W * h;
    if (o.dir > 0 && o.x > E.W - r * 0.3) o.dir = -1; else if (o.dir < 0 && o.x < r * 0.3) o.dir = 1;
  }
  function especial(E, o, r, h) {
    var t = o.tipo;
    if (t === 'piranha') {
      o.x += o.dir * o.v * E.W * h; o.y = fundoY(E, o.fy) + Math.sin(E.t * 3 + o.fase) * 9;
      o.fora = saiu(E, o, r); return true;
    }
    if (t === 'estrela') {
      if (o.fy < 0.96) o.fy = Math.min(0.96, o.fy + (o.fy < 0 ? 0.55 : 0.07) * h); else if (!o.noFundo) o.noFundo = E.t;
      o.x += Math.sin(E.t * 1.3 + o.fase) * 6 * h;
      o.y = fundoY(E, o.fy); o.fora = o.noFundo && E.t - o.noFundo > 3; return true;
    }
    if (t === 'banhista') {
      if (o.salvo != null) { o.x += o.dir * 0.09 * E.W * h; o.y = E.sup - 6 + Math.sin(E.t * 2 + o.fase) * 3; o.fora = saiu(E, o, r); }
      else o.y = E.sup + 8 + Math.sin(E.t * 2.4 + o.fase) * 5;
      o.fy = (o.y - E.sup) / (H - E.sup); return true;
    }
    if (t === 'mae') { vaiEvolta(E, o, r, h, o.v); o.y = fundoY(E, o.fy) + Math.sin(E.t * 0.9 + o.fase) * 6; return true; }
    if (t === 'filhote' && o.entregue) {
      var m = o.mae; o.x = m.x + o.dx; o.y = m.y + o.dy + Math.sin(E.t * 3 + o.fase) * 3; o.fora = E.t > o.ate; return true;
    }
    if (t === 'chefe') {
      if (o.vencido) { o.x += o.dir * o.v * 2.5 * E.W * h; o.fora = saiu(E, o, r); }
      else vaiEvolta(E, o, r, h, o.v);
      o.y = fundoY(E, o.fy) + Math.sin(E.t * 0.8 + o.fase) * 14; return true;
    }
    return false;
  }
  // deitado, a tela é baixinha: os bichos ficam maiores (E.esc) para dar para ver os detalhes; o toque e o desenho usam o mesmo tamanho
  function escDe(aspecto) { return aspecto >= 1 ? 1.45 : 1; }
  function encosta(E, o, x, y) {
    var rx = o.tam * H * E.esc / 2 + 6, ry = o.tam * H * E.esc / 2 * o.alt + 6, dx = (x - o.x) / rx, dy = (y - o.y) / ry;
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
  // de vez em quando passa um raro bem no fundo: o Pirarucu Dourado ou um gigante que brilha no escuro
  function raro(E, ev) {
    if (E.t < E.proxRaro) return;
    E.proxRaro = E.t + RARO_CADA;
    if (E.bonus || E.acabou || E.bichos.some(function (o) { return o.raro; })) return;
    var k = E.rnd(); if (k > 0.8) return;
    var id = k < 0.25 ? 'pirarucu' : sortear(E, GIGANTES), d = POR_ID[id], dir = E.rnd() < 0.5 ? 1 : -1, r = d.tam * H * E.esc;
    novoBicho(E, id, dir > 0 ? -r : E.W + r, id === 'pirarucu' ? LINHAS[6][0] : 0.76, dir, velDe(E, d.faixa === 6 ? 6 : 5, id));
    ev.push({ tipo: 'raro', id: id });
  }
  // cardume de piranhas: atravessa o meio do lago; encostou na linha, corta (no fácil passa pouco, no difícil mais)
  function piranhas(E, ev) {
    if (E.t < E.proxPiranha) return;
    var nv = E.nv.piranha;
    E.proxPiranha = E.t + nv.cada * (0.7 + E.rnd() * 0.6);
    if (E.bonus || E.acabou || E.bichos.some(function (o) { return o.tipo === 'piranha'; })) return;
    var dir = E.rnd() < 0.5 ? 1 : -1, fy = 0.3 + E.rnd() * 0.22, r = POR_ID.piranha.tam * H * E.esc / 2, v = Math.max(E.nv.vel * 1.6, 0.08);
    for (var i = 0; i < nv.n; i++) {
      var x = dir > 0 ? -r - i * r * 2.4 : E.W + r + i * r * 2.4;
      novoBicho(E, 'piranha', x, fy + ((i % 3) - 1) * 0.035, dir, v);
    }
    ev.push({ tipo: 'piranhas' });
  }
  function doBonus(o) { return ['lixo', 'banhista', 'filhote', 'mae', 'estrela', 'chefe'].indexOf(o.tipo) >= 0; }
  function bonus(E, ev) {
    if (!E.bonusFeito && !E.acabou && E.tempo <= BONUS_EM) {
      E.bonusFeito = true; E.bonus = { tipo: E.rodada, fim: E.t + BONUS_DURA, prox: E.t };
      E.bichos = E.bichos.filter(function (o) { return o.preso != null && o.tipo !== 'piranha'; });
      E.bolhas = []; E.fila = [];
      if (E.rodada === 'filhotes') {   // a mamãe tartaruga nada de um lado para o outro, lá no fundo
        var m = novoBicho(E, 'tartaruga', E.W * 0.5, 0.74, 1, Math.max(E.nv.vel * 0.7, 0.04));
        m.tipo = 'mae'; m.tam = 0.16; m.pontos = 0;
      }
      ev.push({ tipo: 'bonus', rodada: E.rodada });
    }
    if (!E.bonus) return;
    if (E.t >= E.bonus.fim || E.acabou) {
      var rod = E.bonus.tipo;
      E.bonus = null;
      E.bichos = E.bichos.filter(function (o) { return o.preso != null && o.tipo !== 'filhote'; });
      E.j.forEach(function (J) { J.anzol.levando = null; });
      povoar(E);
      ev.push({ tipo: 'bonusFim', rodada: rod });
      return;
    }
    if (E.t < E.bonus.prox) return;
    var tipo = E.bonus.tipo, quantos = function (tp) { return E.bichos.filter(function (o) { return o.tipo === tp && !o.entregue && o.salvo == null; }).length; }, o;
    if (tipo === 'limpa' && quantos('lixo') < 16) {
      E.bonus.prox = E.t + 0.5;
      o = novoBicho(E, sortear(E, BICHOS.filter(function (x) { return x.tipo === 'lixo'; })).id, (0.06 + E.rnd() * 0.88) * E.W, 0.02, 1, (E.rnd() - 0.5) * 0.02);
      o.fy0 = o.fy;
    } else if (tipo === 'socorro' && quantos('banhista') < 3) {
      E.bonus.prox = E.t + 1.2;
      var x = 0, livre = false;
      for (var k = 0; k < 8 && !livre; k++) {   // longe dos outros banhistas
        x = (0.12 + E.rnd() * 0.76) * E.W;
        livre = !E.bichos.some(function (q) { return q.tipo === 'banhista' && Math.abs(q.x - x) < 150; });
      }
      if (livre) novoBicho(E, sortear(E, ['menino', 'menina']), x, 0, 1, 0);
    } else if (tipo === 'filhotes' && quantos('filhote') < 4) {
      E.bonus.prox = E.t + 1;
      var dir = E.rnd() < 0.5 ? 1 : -1, rf = POR_ID.filhote.tam * H * E.esc / 2;
      novoBicho(E, 'filhote', dir > 0 ? -rf : E.W + rf, LINHAS[1][E.seq % 3], dir, velDe(E, 1) * 0.7);
    } else if (tipo === 'estrelas' && quantos('estrela') < 14) {
      E.bonus.prox = E.t + 0.45;
      novoBicho(E, 'estrela', (0.05 + E.rnd() * 0.9) * E.W, -0.3, 1, 0);
    } else if (tipo === 'gigante' && !E.bichos.some(function (q) { return q.tipo === 'chefe'; })) {
      E.bonus.prox = E.t + 3;
      var dg = E.rnd() < 0.5 ? 1 : -1, rg = POR_ID.gigante.tam * H * E.esc / 2;
      o = novoBicho(E, 'gigante', dg > 0 ? -rg : E.W + rg, 0.6, dg, Math.max(E.nv.vel * 0.9, 0.05));
      o.acertos = 0;
    }
  }

  /* ---------- jogadores ---------- */
  function ponta(E, j) {
    var lado = E.j[j].lado === 'dir';
    var empe = E.W < H, m = empe ? 0.34 : 0.21;   // celular em pé: as varas mais baixas e mais para o meio, para os personagens caberem
    return { x: E.W * (lado ? 1 - m : m), y: E.sup - (empe ? 110 : ACIMA) };
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
      W: H * aspecto, sup: supDe(aspecto), esc: escDe(aspecto), t: 0, tempo: DURACAO, rnd: mulberry32(op.semente || 1), seq: 0,
      bichos: [], bolhas: [], fila: [], pend: [], repor: true, proxBolha: 8, proxRaro: RARO_CADA, proxPiranha: 0,
      bonus: null, bonusFeito: false, acabou: false, fimT: 0, encerrado: false
    };
    E.nv = nivelDoLago(op.jogadores); E.cardume = E.nv.cardume;
    E.rodada = RODADAS.indexOf(op.rodada) >= 0 ? op.rodada : sortear(E, RODADAS);
    E.proxPiranha = 6 + E.nv.piranha.cada * 0.5 * E.rnd();
    E.j = op.jogadores.map(function (x) {
      return { lado: x.lado, nivel: NIVEIS[x.nivel] ? x.nivel : 'facil', robo: !!x.robo, pontos: 0, poder: null,
        anzol: { fase: 'balanca', ang: 0, x: 0, y: 0, presos: [], dist: 0, dirAng: 0, segurando: false, tb: x.lado === 'dir' ? 1.3 : 0,
          levando: null, ate: 0, jt: 0, de: null, para: null },
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
    if (E.bonus && E.bonus.tipo === 'socorro') {   // joga a boia: quanto mais inclinada a linha, mais longe ela cai
      a.fase = 'joga'; a.jt = 0; a.de = { x: a.x, y: a.y }; a.para = { x: ondeCai(E, j, a.dirAng), y: E.sup + 6 };
      return true;
    }
    a.fase = 'desce'; a.dist = 0;
    var p = repouso(E, j, a.dirAng); a.x = p.x; a.y = p.y;
    return true;
  }
  function subir(E, j, segurando) {
    var a = E.j[j].anzol;
    a.segurando = !!segurando;
    if (segurando && a.fase === 'desce') { a.fase = 'sobe'; E.pend.push({ tipo: 'vazio', j: j }); }
  }
  function ondeCai(E, j, ang) {
    var pt = ponta(E, j), K = E.W * 0.78 / Math.sin(NIVEIS[E.j[j].nivel].angMax);
    return Math.max(E.W * 0.03, Math.min(E.W * 0.97, pt.x + Math.sin(ang) * K));
  }
  // o que o anzol pode pegar agora (com um filhote no anzol, só a mamãe tartaruga)
  function pegavel(E, J, o) {
    if (o.preso != null || o.entregue || o.tipo === 'piranha' || o.tipo === 'banhista') return false;
    if (J.anzol.levando) return o.tipo === 'mae';
    if (o.tipo === 'mae') return false;
    return !(o.tipo === 'chefe' && o.vencido);
  }
  // piranha encostou na linha: corta; o que estava preso foge e a vara fica um pouco sem anzol
  function cortar(E, j, ev) {
    var a = E.j[j].anzol;
    a.presos.forEach(function (o) {
      o.preso = null; o.fy = Math.max(0.04, Math.min(0.95, (o.y - E.sup) / (H - E.sup))); o.fy0 = o.fy;
      o.dir = E.rnd() < 0.5 ? 1 : -1; if (!o.v && o.tipo === 'bicho') o.v = velDe(E, Math.max(1, o.faixa), o.id);
    });
    a.presos = []; a.fase = 'cortada'; a.ate = E.t + CORTADA; a.dist = 0; a.segurando = false;
    ev.push({ tipo: 'cortou', j: j, x: a.x, y: a.y });
  }
  function piranhaNaLinha(E, a) {
    for (var i = 0; i < E.bichos.length; i++) { var o = E.bichos[i]; if (o.tipo === 'piranha' && encosta(E, o, a.x, a.y)) return true; }
    return false;
  }

  function chegou(E, j, ev) {
    var J = E.j[j], a = J.anzol, valeu = !E.acabou || E.t - E.fimT <= FOLGA_FIM;
    a.presos.forEach(function (o) {
      var k = E.bichos.indexOf(o); if (k >= 0) E.bichos.splice(k, 1);
      if (!valeu) return;
      if (o.tipo === 'filhote') { a.levando = 'filhote'; ev.push({ tipo: 'filhote', j: j }); return; }
      J.pontos += o.pontos;
      ev.push({ tipo: 'pegou', j: j, bicho: { id: o.id, tipo: o.tipo, faixa: o.faixa, raro: o.raro }, pontos: o.pontos });
      if (o.tipo === 'bicho' || o.tipo === 'premio') repor(E, o.faixa);
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
    if (a.fase === 'cortada') {   // amarrando um anzol novo
      a.x = pt.x; a.y = pt.y;
      if (E.t >= a.ate) { a.fase = 'balanca'; a.tb = 0; a.ang = 0; }
      return;
    }
    if (a.fase === 'balanca') {
      a.tb += h; a.ang = nv.angMax * Math.sin(2 * Math.PI * nv.balanco * a.tb);
      a.x = pt.x + Math.sin(a.ang) * L_LINHA; a.y = pt.y + Math.cos(a.ang) * L_LINHA;
      return;
    }
    if (a.fase === 'joga' || a.fase === 'puxa') { boia(E, j, h, ev); return; }
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
      if (piranhaNaLinha(E, a)) { cortar(E, j, ev); return; }
      var alvo = null;
      for (var i = 0; i < E.bichos.length; i++) { var o = E.bichos[i]; if (pegavel(E, J, o) && encosta(E, o, a.x, a.y)) { alvo = o; break; } }
      if (alvo && (alvo.tipo === 'mae' || alvo.tipo === 'chefe')) { especialNoAnzol(E, j, alvo, ev); a.fase = 'sobe'; return; }
      if (alvo) {
        var pegos = [alvo], limpa = E.bonus && E.bonus.tipo === 'limpa';
        if (limpa || (J.poder && J.poder.id === 'rede')) {   // a rede pega até 3 de uma vez (no "Limpa o Rio!", só lixo)
          E.bichos.filter(function (o) { return o !== alvo && pegavel(E, J, o) && (!limpa || o.tipo === 'lixo') && Math.hypot(o.x - a.x, o.y - a.y) <= (limpa ? 110 : 70) * E.esc; })
            .sort(function (p, q) { return Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(q.x - a.x, q.y - a.y); })
            .slice(0, 2).forEach(function (o) { pegos.push(o); });
          if (!limpa) J.poder = null;
        }
        pegos.forEach(function (o, n) { o.preso = j; o.dx = o.x - a.x; o.dy = o.y - a.y; o.minhoca = 0; a.presos.push(o); ev.push({ tipo: 'fisgou', j: j, bicho: { id: o.id, tipo: o.tipo, faixa: o.faixa }, pontos: o.pontos, n: n }); });
        a.fase = 'sobe';
      } else if (a.y >= H - 15 || a.x <= 0 || a.x >= E.W) {
        a.fase = 'sobe'; ev.push({ tipo: 'vazio', j: j });
      }
      return;
    }
    // sobe: o bicho mais pesado deixa a subida mais lenta; ⬆️ segurando puxa 2,5 vezes mais rápido
    if (piranhaNaLinha(E, a)) { cortar(E, j, ev); return; }
    var peso = a.presos.reduce(function (m, o) { return Math.max(m, o.peso); }, 0);
    var v = nv.subida * H * vz / (peso ? 0.7 + 0.3 * peso : 0.7) * (a.segurando ? 2.5 : 1);
    a.dist -= v * h;
    if (a.dist <= 0) { a.dist = 0; a.x = pt.x + sx * L_LINHA; a.y = pt.y + sy * L_LINHA; chegou(E, j, ev); a.tb = Math.asin(Math.max(-1, Math.min(1, a.ang / nv.angMax))) / (2 * Math.PI * nv.balanco); return; }
    a.x = pt.x + sx * (L_LINHA + a.dist); a.y = pt.y + sy * (L_LINHA + a.dist);
    a.presos.forEach(function (o) { o.x = a.x; o.y = a.y + o.tam * H * E.esc * 0.42; o.fy = (o.y - E.sup) / (H - E.sup); });
  }

  // a mamãe tartaruga recebe o filhote; o dragão-do-mar leva um acerto (no terceiro, é pescado)
  function especialNoAnzol(E, j, o, ev) {
    var J = E.j[j], a = J.anzol, pts;
    if (o.tipo === 'mae') {
      pts = POR_ID.filhote.pontos; J.pontos += pts; a.levando = null;
      var f = novoBicho(E, 'filhote', o.x, o.fy, o.dir, 0);
      f.entregue = true; f.mae = o; f.dx = (E.rnd() - 0.5) * o.tam * H * E.esc * 0.6; f.dy = -o.tam * H * E.esc * 0.32; f.ate = E.t + 3;
      ev.push({ tipo: 'entregou', j: j, pontos: pts, x: o.x, y: o.y });
      return;
    }
    o.acertos = (o.acertos || 0) + 1; o.piscou = E.t;
    if (o.acertos < ACERTOS) { pts = 10; J.pontos += pts; ev.push({ tipo: 'acertou', j: j, acertos: o.acertos, pontos: pts, x: a.x, y: a.y }); return; }
    pts = o.pontos; J.pontos += pts; o.vencido = true; o.dir = a.x < E.W / 2 ? 1 : -1;
    if (E.bonus) E.bonus.prox = E.t + 3;
    ev.push({ tipo: 'chefe', j: j, pontos: pts, x: a.x, y: a.y });
  }
  // 🛟 a boia voa em arco até a água; caiu perto de um banhista, ele fica boiando, sorri e vai para a margem
  function boia(E, j, h, ev) {
    var J = E.j[j], a = J.anzol, nv = NIVEIS[J.nivel];
    a.jt += h;
    if (a.fase === 'joga') {
      var k = Math.min(1, a.jt / VOO);
      a.x = a.de.x + (a.para.x - a.de.x) * k; a.y = a.de.y + (a.para.y - a.de.y) * k - Math.sin(Math.PI * k) * ARCO;
      if (k < 1) return;
      var alvo = null, melhor = Infinity;
      E.bichos.forEach(function (o) {
        var d = Math.abs(o.x - a.x);
        if (o.tipo === 'banhista' && o.salvo == null && d <= o.tam * H * E.esc / 2 + 40 && d < melhor) { alvo = o; melhor = d; }
      });
      if (alvo) {
        alvo.salvo = j; alvo.dir = J.lado === 'dir' ? 1 : -1; J.pontos += alvo.pontos;
        ev.push({ tipo: 'salvou', j: j, id: alvo.id, pontos: alvo.pontos, x: alvo.x, y: E.sup });
      } else ev.push({ tipo: 'vazio', j: j });
      a.fase = 'puxa'; a.jt = 0; a.de = { x: a.x, y: a.y };
      return;
    }
    var p = repouso(E, j, a.ang), q = Math.min(1, a.jt / PUXA);
    a.x = a.de.x + (p.x - a.de.x) * q; a.y = a.de.y + (p.y - a.de.y) * q;
    if (q >= 1) { a.fase = 'balanca'; a.tb = Math.asin(Math.max(-1, Math.min(1, a.ang / nv.angMax))) / (2 * Math.PI * nv.balanco); }
  }

  /* ---------- robô (o outro personagem no modo sozinho) ---------- */
  function primeiroNoCaminho(E, j, ang) {
    var pt = ponta(E, j), sx = Math.sin(ang), sy = Math.cos(ang);
    for (var d = L_LINHA; d < 1400; d += 14) {
      var x = pt.x + sx * d, y = pt.y + sy * d;
      if (y >= H - 15 || x <= 0 || x >= E.W) return null;
      for (var i = 0; i < E.bichos.length; i++) {
        var o = E.bichos[i];
        if ((o.tipo === 'piranha' || pegavel(E, E.j[j], o)) && encosta(E, o, x, y)) return o;
      }
    }
    return null;
  }
  function robo(E, j) {
    var J = E.j[j], a = J.anzol, rb = NIVEIS[J.nivel].robo;
    if (a.fase === 'sobe') { a.segurando = a.presos.length > 0 && (J.nivel === 'dificil' || (J.nivel === 'medio' && a.presos[0].peso >= 3)); return; }
    if (a.fase !== 'balanca' || E.t < J.roboProx || E.acabou) return;
    var cansou = E.t > J.roboProx + rb.espera[1] * 2, quer;
    if (E.bonus && E.bonus.tipo === 'socorro') {
      var x = ondeCai(E, j, a.ang);
      quer = E.bichos.some(function (o) { return o.tipo === 'banhista' && o.salvo == null && Math.abs(o.x - x) < o.tam * H * E.esc / 2; });
    } else {
      var alvo = primeiroNoCaminho(E, j, a.ang);
      if (alvo && alvo.tipo === 'piranha') alvo = null;
      quer = alvo && (alvo.pontos >= 5 || E.bonus || a.levando);
    }
    if (quer || cansou) {
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
      raro(E, ev);
      piranhas(E, ev);
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
    E.W = W; E.sup = supDe(aspecto); E.esc = escDe(aspecto);
    E.bichos.forEach(function (o) { o.y = fundoY(E, o.fy); });
    E.bolhas.forEach(function (o) { o.y = fundoY(E, o.fy); });
  }
  function placar(E) {
    var p = E.j.map(function (J) { return J.pontos; });
    return { pontos: p, time: p.reduce(function (s, x) { return s + x; }, 0), vencedor: p[0] === p[1] ? -1 : p[0] > p[1] ? 0 : 1 };
  }
  function colocar(E, id, x, y, op) {
    var d = POR_ID[id], v = op && typeof op.vel === 'number' ? op.vel : velDe(E, Math.max(1, d.faixa), id);
    return novoBicho(E, id, x, (y - E.sup) / (H - E.sup), 1, v);
  }

  var GlubRegras = { NIVEIS: NIVEIS, ORDEM: ORDEM, BICHOS: BICHOS, POR_ID: POR_ID, LINHAS: LINHAS, H: H, L_LINHA: L_LINHA,
    RODADAS: RODADAS, GIGANTES: GIGANTES, ondeCai: ondeCai,
    criar: criar, passo: passo, pescar: pescar, subir: subir, redimensionar: redimensionar, placar: placar,
    ponta: ponta, repouso: repouso, colocar: colocar, colocarBolha: colocarBolha };
  if (typeof module !== 'undefined' && module.exports) module.exports = GlubRegras;
  else raiz.GlubRegras = GlubRegras;
})(this);
