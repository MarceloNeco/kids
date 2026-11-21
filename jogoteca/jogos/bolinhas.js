/* Bolinhas da Angústia (Nail-Biter Drop / Bolitas de la Angustia) — jogo da Jogoteca (Bolinho de Chuva · SolverONE · kids).
   Game show de perguntas numa parede gigante de pinos (mecânica Plinko, livre; nome, arte e sons próprios).
   Especificação do dono: jogoteca/BOLINHAS-ESPECIFICACAO.md (no topo, a decisão de 21/Nov/2026). Perguntas: jogos/bolinhas-perguntas.js.
   Uma pessoa joga sozinha (dono, 21/Nov/2026: sem parceiro virtual, sem dois jogadores), em duas modalidades escolhidas no começo:
   - Queda Livre (queda): 5 perguntas de 2 opções; lida a pergunta, três bolinhas brancas caem das zonas 1, 4 e 7 e é preciso
     responder antes que a primeira chegue lá embaixo (sem resposta = erro). Acertou: viram verdes e somam o valor da canaleta;
     errou: viram vermelhas e descontam. O tempo de leitura muda com o nível (fácil 6 s, médio 4,5 s, difícil 3 s).
   - Sem pressa (calma): 5 perguntas de 4 opções, sem relógio nenhum. Lida a pergunta, você escolhe 3 zonas no alto (pode repetir
     a mesma; ↩ desfaz) e só então as opções se soltam. Respondeu: as bolinhas caem verdes (acertou, somam) ou vermelhas (errou,
     descontam) das zonas escolhidas. Centro vale mais, pontas arriscam menos.
   O saldo nunca fica abaixo de zero; no fim, o placar (saldo, acertos, recorde por modalidade e nível). O nível da Jogoteca escolhe
   a dificuldade das perguntas.
   Física própria e leve (círculo com círculo, passo fixo de 1/120 s), sem biblioteca: pinos em grade intercalada, divisórias de
   pontas redondas, sensor no fundo de cada canaleta e empurrãozinho se a bolinha parar. A restituição de um choque é o produto das
   duas (bolinha 0,6 × pino 0,75 = 0,45; bolinha com parede 0,6), com gravidade calibrada para a queda durar ~5,8 s
   (bolinha de raio 14 desde 21/Nov/2026, um pouco maior, a pedido do dono).
   Visual (dono, 19/Nov/2026: "mais realista, a câmera seguindo a bola"): estúdio de TV em 2.5D num <canvas> do palco inteiro —
   parede alta de acrílico escuro na moldura de metal escovado com parafusos e LEDs que correm, pinos cromados com sombra, placas de
   valor de LED, piso brilhante refletindo a parede, feixes de luz na cor do momento, plateia na penumbra e paralaxe do fundo.
   Mais pedidos do dono em 21/Nov/2026 (fotos do programa só como referência de estilo): painel de LED atrás dos pinos
   (quadradinhos de 50 × 50 que acendem em ondas, anéis, chuva e brilho salteado; azul no normal, verde no acerto, vermelho no
   erro), pintado numa tela pequenina esticada sobre a parede numa só cópia; arco de luz (tubo de neon) em volta da parede com
   luzes que correm; música de tensão ("Interloper", Kevin MacLeod, CC BY 4.0, musicas/tensao-interloper.mp3) do soltar até a
   última bolinha bater no fundo — a trilha do jogo pausa e volta do ponto onde parou (Trilha.parar / Trilha.continuar).
   Câmera de transmissão: plano aberto antes de soltar; primeiro a CÂMERA DA BOLINHA (ponto de vista: colada numa bolinha, zoom
   4,4×, riscos de velocidade, até perto do meio da parede); depois acompanha bem de perto (3,1×) a mais adiantada, com as
   outras em quadrinhos (CÂM 2, CÂM 3), ou enquadra o grupo; nos últimos 15% da queda, câmera lenta (0,4×) e zoom nas canaletas;
   na chegada, flash da cor e volta ao plano aberto. Com ctx.calmo: cortes secos, sem câmera da bolinha e sem câmera lenta.
   Desempenho: o cenário fixo é pintado UMA vez por resolução (plano aberto e, logo depois, a do zoom); cada quadro só copia o pedaço
   que aparece e desenha por cima bolinhas, brilhos e luzes. Ficou lento (< 36 quadros/s na queda), liga sozinho o modo leve
   (sem feixes, vinheta nem quadrinhos; resolução 1×). HUD e painel em DOM por cima do estúdio.
   Teclado e controle da TV: na Queda Livre, ← → passam pelas opções e OK responde; no Sem pressa, ← → andam pelas zonas, OK põe
   uma bolinha, ⌫ desfaz e, com as 3 no lugar, ← → passam pelas opções e OK responde.
   A lógica pura fica em logica.* para os testes no Node (jogoteca/teste/bolinhas.test.js).
   Com ctx.teste: semente fixa (?semente=N, padrão 7) e window.BolinhasDebug (estado, comecar, velocidade, responder, zona, desfazer…). */
(function () {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ======================= regras (lógica pura) ======================= */
  // valores das 15 canaletas (tabela da Queda Livre da especificação): pontas valem o mínimo, o centro o máximo
  var VALORES = [1, 500, 100, 2000, 10, 1000, 5, 10000, 1, 5000, 10, 2500, 100, 1500, 1];
  // as duas modalidades (dono, 21/Nov/2026). leitura = segundos até as bolinhas caírem (null = sem relógio)
  var MODALIDADES = {
    queda: { opcoes: 2, perguntas: 5, bolas: 3, zonas: [0, 3, 6], leitura: { facil: 6, medio: 4.5, dificil: 3 } },
    calma: { opcoes: 4, perguntas: 5, bolas: 3, zonas: null, leitura: null }
  };
  function tempoDeLeitura(mod, nivel) { var l = MODALIDADES[mod].leitura; return l ? (l[nivel] || l.medio) : null; }
  // verde soma; vermelha subtrai, e o saldo nunca fica abaixo de zero
  function aplicarBola(saldo, valor, cor) { return cor === 'verde' ? saldo + valor : Math.max(0, saldo - valor); }
  function corDaResposta(acertou) { return acertou ? 'verde' : 'vermelha'; }
  // o que um lote de bolinhas da mesma cor faz com o saldo (as canaletas onde caíram, na ordem em que caíram)
  function aplicarLote(saldo, canaletas, cor) { canaletas.forEach(function (k) { saldo = aplicarBola(saldo, VALORES[k], cor); }); return saldo; }
  // Sem pressa: as zonas são escolhidas ANTES de responder (até "max" bolinhas; a mesma zona pode repetir)
  function adicionarZona(zonas, z, max) { return zonas.length >= max ? zonas.slice() : zonas.concat([clamp(Math.round(z), 0, 6)]); }
  function zonasProntas(zonas, max) { return zonas.length === max; }

  // sorteio com semente (mulberry32): o mesmo número dá o mesmo jogo (testes)
  function criarSorte(semente) {
    var s = (semente >>> 0) || 1;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0; var x = s;
      x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  function embaralhar(l, sorte) { for (var i = l.length - 1; i > 0; i--) { var j = Math.floor(sorte() * (i + 1)), x = l[i]; l[i] = l[j]; l[j] = x; } return l; }

  var CATEGORIAS = {
    historia: { ico: '🏛️', n: ['História', 'History', 'Historia'] },
    geografia: { ico: '🌍', n: ['Geografia', 'Geography', 'Geografía'] },
    ciencias: { ico: '🔬', n: ['Ciências', 'Science', 'Ciencias'] },
    animais: { ico: '🐾', n: ['Animais', 'Animals', 'Animales'] },
    esportes: { ico: '⚽', n: ['Esportes', 'Sports', 'Deportes'] },
    cinema: { ico: '🎬', n: ['Cinema e Desenho', 'Movies & Cartoons', 'Cine y Dibujos'] },
    musica: { ico: '🎵', n: ['Música', 'Music', 'Música'] },
    comida: { ico: '🍕', n: ['Comida', 'Food', 'Comida'] },
    linguas: { ico: '🔤', n: ['Línguas', 'Languages', 'Idiomas'] },
    corpo: { ico: '💪', n: ['Corpo Humano', 'Human Body', 'Cuerpo Humano'] }
  };

  // o nível escolhe a dificuldade: fácil começa pelas fáceis, difícil pelas difíceis, médio sorteia entre todas
  var PREF = { facil: [1, 2, 3], dificil: [3, 2, 1] };
  function sortearPergunta(banco, nOpcoes, nivel, usadas, sorte) {
    var cand = banco.filter(function (q) { return q.o.length === nOpcoes && !usadas[q.id]; });
    if (!cand.length) return null;
    embaralhar(cand, sorte);
    var ordem = PREF[nivel];
    if (ordem) {
      var melhor = 9;
      cand.forEach(function (q) { melhor = Math.min(melhor, ordem.indexOf(q.d)); });
      cand = cand.filter(function (q) { return ordem.indexOf(q.d) === melhor; });
    }
    usadas[cand[0].id] = true;
    return cand[0];
  }
  // a pergunta pronta para a partida: opções embaralhadas, c = índice da certa já na ordem nova
  function prepararPergunta(q, sorte) {
    var ordem = [], i;
    for (i = 0; i < q.o.length; i++) ordem.push(i);
    embaralhar(ordem, sorte);
    return { id: q.id, cat: q.cat, d: q.d, q: q.q, o: ordem.map(function (k) { return q.o[k]; }), c: ordem.indexOf(q.c) };
  }
  /* ======================= física (lógica pura, unidades do mundo: a parede tem 750 × 1050) ======================= */
  var GEO = { W: 750, H: 1050, RB: 14, RP: 5, Y0: 130, DY: 50, FILAS: 15, YDIV: 900, RDIV: 3.5, SENSOR: 1000, CHAO: 1045, Y_SOLTA: 50,
    ZONAS: 7, CANALETAS: 15, LARG: 50 };
  var FIS = { g: 1250, arrasto: 0.5, arrastoX: 1, vmax: 600, eBola: 0.6, ePino: 0.75 };
  FIS.eChoque = FIS.eBola * FIS.ePino;
  function zonaX(z) { return 75 + 100 * z; }
  // a última fila fica em cima das divisórias (x = 50k); as outras se alternam meio passo para o lado
  function filaAlinhada(f) { return (GEO.FILAS - 1 - f) % 2 === 0; }
  function criarPinos() {
    var p = [], filas = [], f, k;
    for (f = 0; f < GEO.FILAS; f++) {
      var y = GEO.Y0 + f * GEO.DY, al = filaAlinhada(f);
      filas.push({ y: y, alinhada: al, inicio: p.length });
      if (al) for (k = 1; k <= 14; k++) p.push({ x: 50 * k, y: y, b: 0 });
      else { for (k = 1; k <= 13; k++) p.push({ x: 25 + 50 * k, y: y, b: 0 }); p.push({ x: 0, y: y, b: 0, parede: true }); p.push({ x: GEO.W, y: y, b: 0, parede: true }); }
    }
    return { lista: p, filas: filas };
  }
  function criarMundo() { var pp = criarPinos(); return { pinos: pp.lista, filas: pp.filas, bolas: [], t: 0, n: 0 }; }
  // solta uma bolinha da zona (0 a 6), com o jitter de ±1,5 a 3 px (duas bolinhas da mesma zona nunca repetem o caminho)
  function soltar(m, zona, cor, sorte, espera) {
    var j = (1.5 + 1.5 * sorte()) * (sorte() < 0.5 ? -1 : 1);
    var b = { id: ++m.n, zona: zona, cor: cor, x: zonaX(zona) + j, y: GEO.Y_SOLTA, vx: 0, vy: 0, t: 0, espera: espera || 0, pousou: false,
      canaleta: -1, tPouso: 0, parado: 0, empurroes: 0, aplicada: false };
    m.bolas.push(b);
    return b;
  }
  function choquePino(m, b, idx, e, ev) {
    var p = m.pinos[idx], dx = b.x - p.x, dy = b.y - p.y, min = GEO.RB + GEO.RP, d2 = dx * dx + dy * dy;
    if (d2 >= min * min || d2 === 0) return;
    var d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
    b.x = p.x + nx * min; b.y = p.y + ny * min;
    var vn = b.vx * nx + b.vy * ny;
    if (vn >= 0) return;
    b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny;
    if (ev && -vn > 40) ev('pino', b, -vn, idx);
  }
  function passoBola(m, b, dt, sorte, ev) {
    var k = Math.max(0, 1 - FIS.arrasto * dt), v, f, f0, fila, kx;
    b.t += dt;
    b.vy += FIS.g * dt; b.vx *= k * Math.max(0, 1 - FIS.arrastoX * dt); b.vy *= k;
    v = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    if (v > FIS.vmax) { b.vx *= FIS.vmax / v; b.vy *= FIS.vmax / v; }
    b.x += b.vx * dt; b.y += b.vy * dt;
    // pinos: só os das filas vizinhas, e em cada fila só o mais perto (os pinos ficam a 50 de distância)
    f0 = Math.round((b.y - GEO.Y0) / GEO.DY);
    for (f = f0 - 1; f <= f0 + 1; f++) {
      if (f < 0 || f >= GEO.FILAS) continue;
      fila = m.filas[f];
      if (fila.alinhada) { kx = clamp(Math.round(b.x / 50), 1, 14); choquePino(m, b, fila.inicio + kx - 1, FIS.eChoque, ev); }
      else {
        kx = clamp(Math.round((b.x - 25) / 50), 1, 13); choquePino(m, b, fila.inicio + kx - 1, FIS.eChoque, ev);
        if (b.x < 40) choquePino(m, b, fila.inicio + 13, FIS.eChoque, ev);
        if (b.x > GEO.W - 40) choquePino(m, b, fila.inicio + 14, FIS.eChoque, ev);
      }
    }
    // divisórias das canaletas: hastes de ponta redonda (cápsulas)
    if (b.y > GEO.YDIV - GEO.RB - 4) {
      var kd = Math.round(b.x / 50);
      if (kd >= 1 && kd <= 14) {
        var cy = clamp(b.y, GEO.YDIV, GEO.H), dx = b.x - 50 * kd, dy = b.y - cy, min = GEO.RB + GEO.RDIV, d2 = dx * dx + dy * dy;
        if (d2 < min * min && d2 > 0) {
          var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, vn;
          b.x = 50 * kd + nx * min; b.y = cy + ny * min; vn = b.vx * nx + b.vy * ny;
          if (vn < 0) { b.vx -= (1 + FIS.eBola) * vn * nx; b.vy -= (1 + FIS.eBola) * vn * ny; if (ev && -vn > 60) ev('divisoria', b, -vn); }
        }
      }
    }
    if (b.x < GEO.RB) { b.x = GEO.RB; b.vx = Math.abs(b.vx) * FIS.eBola; }
    if (b.x > GEO.W - GEO.RB) { b.x = GEO.W - GEO.RB; b.vx = -Math.abs(b.vx) * FIS.eBola; }
    if (b.y > GEO.CHAO - GEO.RB) { b.y = GEO.CHAO - GEO.RB; b.vy = -Math.abs(b.vy) * 0.3; b.vx *= 0.8; }
    // sensor no fundo da canaleta: o valor trava quando o centro cruza a linha
    if (!b.pousou && b.y >= GEO.SENSOR) {
      b.pousou = true; b.canaleta = clamp(Math.floor(b.x / GEO.LARG), 0, GEO.CANALETAS - 1); b.tPouso = b.t;
      if (ev) ev('pouso', b);
    }
    // nunca fica presa: parou no meio do caminho, ganha um empurrãozinho (para o lado de dentro, se estiver na parede)
    if (!b.pousou && b.vx * b.vx + b.vy * b.vy < 144) {
      b.parado += dt;
      if (b.parado > 0.5) {
        b.vx = (b.x < 60 ? 1 : b.x > GEO.W - 60 ? -1 : sorte() < 0.5 ? -1 : 1) * (50 + 30 * sorte()); b.vy = -20; b.parado = 0; b.empurroes++;
      }
    } else b.parado = 0;
  }
  function choqueBolas(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, min = GEO.RB * 2, d2 = dx * dx + dy * dy;
    if (d2 >= min * min || d2 === 0) return;
    var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, sob = (min - d) / 2;
    a.x -= nx * sob; a.y -= ny * sob; b.x += nx * sob; b.y += ny * sob;
    var rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
    if (rel <= 0) return;
    var imp = (1 + FIS.eBola * FIS.eBola) * rel / 2;
    a.vx -= imp * nx; a.vy -= imp * ny; b.vx += imp * nx; b.vy += imp * ny;
  }
  function passoMundo(m, dt, sorte, ev) {
    var i, j, b, ativas = [];
    m.t += dt;
    for (i = 0; i < m.bolas.length; i++) {
      b = m.bolas[i];
      if (b.espera > 0) { b.espera -= dt; if (b.espera <= 0) { b.espera = 0; if (ev) ev('solta', b); } else continue; }
      passoBola(m, b, dt, sorte, ev); ativas.push(b);
    }
    for (i = 0; i < ativas.length; i++) for (j = i + 1; j < ativas.length; j++) choqueBolas(ativas[i], ativas[j]);
  }
  // uma queda inteira sem desenhar (testes): devolve a canaleta e o tempo até o sensor
  function simularQueda(zona, semente) {
    var m = criarMundo(), s = criarSorte(semente), b = soltar(m, zona, 'branca', s);
    while (!b.pousou && b.t < 60) passoMundo(m, 1 / 120, s);
    return { canaleta: b.canaleta, tempo: b.tPouso, empurroes: b.empurroes, pousou: b.pousou };
  }

  /* ======================= números e moeda ======================= */
  function milhar(v, lingua) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, lingua === 'en' ? ',' : '.'); }
  function dinheiro(v, lingua) { return lingua === 'en' ? '$' + milhar(v, 'en') : lingua === 'es' ? milhar(v, 'es') + ' €' : 'R$ ' + milhar(v, 'pt'); }

  /* ======================= estilo (DOM) ======================= */
  var CSS = '' +
    '.jt-bol2{position:absolute;inset:0;overflow:hidden;color:#eaf6ff;font-family:Fredoka,system-ui,sans-serif;' +
    'background:radial-gradient(120% 70% at 50% 0%,#1d3bb8 0%,rgba(29,59,184,0) 60%),radial-gradient(90% 60% at 50% 110%,#5b1fb0 0%,rgba(91,31,176,0) 60%),linear-gradient(180deg,#081a66,#0a0b3a 55%,#1a0a47)}' +
    '.jt-bol2-aura{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .5s,background .5s}.jt-bol2-leve .jt-bol2-aura{display:none}' +
    '.jt-bol2.tensao .jt-bol2-aura{opacity:.4;background:radial-gradient(80% 60% at 50% 55%,rgba(255,170,40,.0) 30%,rgba(255,150,30,.55) 100%)}' +
    '.jt-bol2.verde .jt-bol2-aura{opacity:.32;background:radial-gradient(80% 60% at 50% 55%,rgba(30,255,140,0) 30%,rgba(20,220,120,.55) 100%)}' +
    '.jt-bol2.vermelho .jt-bol2-aura{opacity:.4;background:radial-gradient(80% 60% at 50% 55%,rgba(255,30,70,0) 30%,rgba(200,10,50,.65) 100%)}' +
    '.jt-bol2-aura.bate{animation:jtb2Bate .42s ease-out}' +
    '@keyframes jtb2Bate{0%{filter:brightness(1)}18%{filter:brightness(1.9)}40%{filter:brightness(1.1)}55%{filter:brightness(1.6)}100%{filter:brightness(1)}}' +
    '.jt-bol2-tela{position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none;outline:none}' +
    '.jt-bol2-parede{position:absolute;pointer-events:none}' +
    '.jt-bol2-tag{position:absolute;z-index:3;padding:3px 9px;border-radius:5px;background:rgba(210,20,45,.88);color:#fff;font:700 12px/1.25 Fredoka,system-ui,sans-serif;letter-spacing:1.2px;text-transform:uppercase;pointer-events:none;box-shadow:0 2px 10px rgba(0,0,0,.4)}' +
    '.jt-bol2-tag.lenta{background:rgba(255,176,40,.95);color:#2a1500}' +
    '.retrato .jt-bol2-hud{background:linear-gradient(180deg,rgba(3,4,22,.92),rgba(3,4,22,.7) 70%,rgba(3,4,22,0))}' +
    '.retrato .jt-bol2-painel{background:linear-gradient(180deg,rgba(3,4,22,0),rgba(3,4,22,.85) 14%,rgba(3,4,22,.95))}' +
    '.deitado .jt-bol2-hud,.deitado .jt-bol2-painel{background:radial-gradient(closest-side,rgba(3,4,22,.82) 55%,rgba(3,4,22,0))}' +
    '.jt-bol2-hud,.jt-bol2-painel{position:absolute;box-sizing:border-box;display:flex;flex-direction:column}' +
    '.jt-bol2-hud{gap:8px}.deitado .jt-bol2-hud{justify-content:center;align-items:center;gap:14px}.deitado .jt-bol2-hud>*{width:100%;max-width:440px}' +
    '.deitado .jt-bol2-mini{width:auto;align-self:center}' +
    '.retrato .jt-bol2-hud{flex-direction:row;align-items:center;padding:4px 8px;gap:8px}' +
    '.jt-bol2-saldo{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;align-items:center;text-align:center}' +
    '.jt-bol2-fase{font-size:13px;font-weight:600;letter-spacing:.4px;color:#9fe9ff;text-transform:uppercase;display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap;line-height:1.1}' +
    '.jt-bol2-pontos{display:inline-flex;gap:4px}' +
    '.jt-bol2-pontos i{width:9px;height:9px;border-radius:50%;border:1.5px solid #7fdcff;display:inline-block;box-sizing:border-box}' +
    '.jt-bol2-pontos i.agora{background:#7fdcff;box-shadow:0 0 8px #7fdcff}.jt-bol2-pontos i.sim{background:#2dff88;border-color:#2dff88}.jt-bol2-pontos i.nao{background:#ff3b5c;border-color:#ff3b5c}' +
    '.jt-bol2-odo{display:flex;align-items:center;justify-content:center;font-weight:700;font-size:var(--odo,34px);line-height:1;color:#fff;' +
    'text-shadow:0 0 10px rgba(80,220,255,.9),0 0 26px rgba(80,160,255,.7);font-variant-numeric:tabular-nums;white-space:nowrap}' +
    '.jt-bol2-odo .m{font-size:.6em;margin:0 .12em;color:#9fe9ff}' +
    '.jt-bol2-d{display:inline-block;height:1em;overflow:hidden;width:.62em;text-align:center}' +
    '.jt-bol2-fita{display:block;transition:transform .9s cubic-bezier(.2,.9,.25,1)}' +
    '.jt-bol2-fita span{display:block;height:1em}' +
    '.jt-bol2-odo .s{display:inline-block;width:.28em;text-align:center}' +
    '.jt-bol2-odo.calmo .jt-bol2-fita{transition:none}' +
    '.jt-bol2-odo.sobe{animation:jtb2Sobe .6s}.jt-bol2-odo.desce{animation:jtb2Desce .6s}' +
    '@keyframes jtb2Sobe{30%{color:#7dffb4;text-shadow:0 0 16px #2dff88,0 0 34px #2dff88}}@keyframes jtb2Desce{30%{color:#ff9aac;text-shadow:0 0 16px #ff3b5c,0 0 34px #ff3b5c}}' +
    '.jt-bol2-mini{min-width:44px;min-height:44px;border-radius:999px;border:2px solid #7fdcff;background:rgba(8,14,60,.8);color:#eaf6ff;font:700 22px/1 Fredoka,system-ui,sans-serif;padding:0 10px;flex:0 0 auto}' +
    '.jt-bol2-mini[aria-pressed="true"]{background:#fff;color:#0a0b3a}' +
    '.jt-bol2-painel{gap:6px;padding:6px 10px calc(8px + env(safe-area-inset-bottom,0px));align-items:stretch;justify-content:flex-start;overflow-y:auto}' +
    '.deitado .jt-bol2-painel{justify-content:center}' +
    '.jt-bol2-painel>*{width:100%;max-width:560px;margin:0 auto;flex-shrink:0}.deitado .jt-bol2-saldo{flex:0 0 auto}' +
    '.jt-bol2-msg{margin:0;font-size:15px;font-weight:600;text-align:center;color:#ffe08a;min-height:1.2em;line-height:1.2}.jt-bol2-msg:empty{display:none}' +
    '.jt-bol2-cat{display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;flex-wrap:wrap}' +
    '.jt-bol2-chip{padding:3px 10px;border-radius:999px;background:rgba(127,220,255,.16);border:1px solid rgba(127,220,255,.6);font-weight:600}' +
    '.jt-bol2-perg{margin:0;font-size:18px;font-weight:600;text-align:center;line-height:1.25;color:#fff}' +
    '.jt-bol2-ops{display:grid;grid-template-columns:1fr 1fr;gap:8px}.deitado .jt-bol2-ops.n4{grid-template-columns:1fr}' +
    '.jt-bol2-ops.n4{gap:6px}.jt-bol2-ops.n4 .jt-bol2-op{min-height:42px;font-size:15px;padding:4px 8px}.jt-bol2-op.espera{opacity:.62;border-style:dashed}' +
    '.jt-bol2-op{position:relative;display:flex;align-items:center;gap:8px;min-height:48px;padding:6px 10px;border-radius:14px;border:2px solid rgba(127,220,255,.55);' +
    'background:linear-gradient(180deg,rgba(40,70,190,.55),rgba(20,24,90,.75));color:#fff;font:600 16px/1.15 Fredoka,system-ui,sans-serif;text-align:left;box-shadow:0 0 14px rgba(60,170,255,.18)}' +
    '.jt-bol2-op .l{flex:0 0 auto;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#7fdcff;color:#081a66;font-weight:700;font-size:14px}' +
    '.jt-bol2-op:disabled{cursor:default}' +
    '.jt-bol2-op.trava{border-color:#ffc23a;box-shadow:0 0 0 2px #ffc23a,0 0 20px rgba(255,194,58,.6);background:linear-gradient(180deg,#7a4a00,#3e2400)}' +
    '.jt-bol2-op.certa{border-color:#2dff88;box-shadow:0 0 0 2px #2dff88,0 0 22px rgba(45,255,136,.6);background:linear-gradient(180deg,#0b7a43,#063d22)}' +
    '.jt-bol2-op.errada{border-color:#ff3b5c;box-shadow:0 0 0 2px #ff3b5c,0 0 22px rgba(255,59,92,.55);background:linear-gradient(180deg,#8a0f26,#430713)}' +
    '.jt-bol2-op.apagada{opacity:.45}' +
    '.jt-bol2-acoes{display:flex;gap:8px;align-items:stretch;justify-content:center;flex-wrap:wrap}' +
    '.jt-bol2-btn{min-height:48px;padding:0 22px;border-radius:999px;border:0;font:700 19px/1 Fredoka,system-ui,sans-serif;color:#081a3a;' +
    'background:linear-gradient(180deg,#9ff3ff,#3fd0ff 55%,#2a8cff);box-shadow:0 4px 0 #1846a8,0 0 22px rgba(63,208,255,.55)}' +
    '.jt-bol2-btn:active{transform:translateY(3px);box-shadow:0 1px 0 #1846a8}' +
    '.jt-bol2-btn:disabled{filter:grayscale(.8) brightness(.7);box-shadow:none}' +
    '.jt-bol2-btn.ouro{background:linear-gradient(180deg,#ffe58a,#ffc23a 55%,#ff9420);box-shadow:0 4px 0 #a85a0c,0 0 22px rgba(255,194,58,.55);color:#3a2300}' +
    '.jt-bol2 button:focus-visible{outline:3px solid #ffe08a;outline-offset:2px}' +
    '.jt-bol2-cena{position:absolute;inset:0;z-index:8;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;overflow:auto;' +
    'background:radial-gradient(100% 80% at 50% 30%,rgba(30,50,160,.9),rgba(6,8,36,.96))}' +
    '.jt-bol2-cena.vidro{background:rgba(4,6,30,.72)}' +
    '@media (orientation:landscape) and (max-height:560px){.jt-bol2-caixa.larga .jt-bol2-logo span{display:inline;margin-left:.25em}}' +
    '@media (min-width:1400px) and (min-height:800px){.jt-bol2-perg{font-size:26px}.jt-bol2-op{font-size:20px;min-height:58px}' +
    '.jt-bol2-msg{font-size:19px}.jt-bol2-cat{font-size:17px}.jt-bol2-btn{min-height:58px;font-size:23px}' +
    '.jt-bol2-fase{font-size:17px}.jt-bol2-caixa{width:min(680px,100%)}.jt-bol2-status{font-size:18px}}' +
    '.jt-bol2-caixa{width:min(560px,100%);max-height:100%;box-sizing:border-box;margin:auto;padding:16px;border-radius:22px;text-align:center;display:flex;flex-direction:column;gap:10px;' +
    'background:linear-gradient(180deg,rgba(28,46,150,.92),rgba(22,12,70,.95));border:2px solid rgba(127,220,255,.55);box-shadow:0 0 40px rgba(60,170,255,.35),0 18px 40px rgba(0,0,0,.5)}' +
    '.jt-bol2-caixa h2{margin:0;font-size:24px;color:#fff;line-height:1.1}' +
    '.jt-bol2-caixa p{margin:0;font-size:16px;line-height:1.3}' +
    '.jt-bol2-logo{margin:0;font-weight:700;font-size:clamp(30px,8vw,46px);line-height:.95;color:#fff;letter-spacing:.5px;' +
    'text-shadow:0 0 8px #3fd0ff,0 0 22px #3fd0ff,0 0 44px #7b3cff}' +
    '.jt-bol2-logo span{display:block;color:#ff9be0;text-shadow:0 0 8px #ff5fd0,0 0 22px #ff5fd0,0 0 44px #7b3cff}' +
    '@media (orientation:landscape) and (max-height:560px){.jt-bol2-caixa.larga{width:min(860px,100%);display:grid;grid-template-columns:1fr 1fr;align-items:start;text-align:center}' +
    '.jt-bol2-caixa.larga>.cheia{grid-column:1/-1}.jt-bol2-caixa{padding:12px;gap:8px}.jt-bol2-caixa h2{font-size:21px}.jt-bol2-logo{font-size:30px}}' +
    '.jt-bol2-fasecard{animation:jtb2Entra .5s cubic-bezier(.2,1.3,.4,1)}' +
    '.jt-bol2-fasecard .num{font-size:15px;letter-spacing:3px;text-transform:uppercase;color:#9fe9ff}' +
    '.jt-bol2-fasecard h2{font-size:clamp(30px,8vw,48px);text-shadow:0 0 10px #3fd0ff,0 0 30px #7b3cff}' +
    '@keyframes jtb2Entra{0%{transform:scale(.6);opacity:0}100%{transform:scale(1);opacity:1}}' +
    '.jt-bol2-modos{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '.jt-bol2-modo{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 8px 12px;border-radius:18px;border:2px solid rgba(127,220,255,.4);' +
    'background:linear-gradient(180deg,rgba(20,34,120,.75),rgba(10,10,52,.85));color:#eaf6ff;font:600 15px/1.2 Fredoka,system-ui,sans-serif;cursor:pointer;transition:transform .15s,box-shadow .2s}' +
    '.jt-bol2-modo:active{transform:scale(.97)}' +
    '.jt-bol2-modo svg{width:100%;max-width:150px;height:auto;display:block;filter:drop-shadow(0 0 8px rgba(63,208,255,.35))}' +
    '.jt-bol2-modo b{font-size:18px;color:#fff}.jt-bol2-modo small{font-size:13px;opacity:.9;font-weight:500;line-height:1.25}' +
    '.jt-bol2-modo .selo{font-size:12px;font-weight:700;letter-spacing:.5px;padding:2px 9px;border-radius:999px;background:rgba(127,220,255,.18);color:#9fe9ff}' +
    '.jt-bol2-modo[data-mod="calma"] .selo{background:rgba(255,155,224,.18);color:#ffb3e6}' +
    '.jt-bol2-modo[aria-pressed="true"]{border-color:#ffc23a;box-shadow:0 0 0 2px #ffc23a,0 0 26px rgba(255,194,58,.5);background:linear-gradient(180deg,rgba(88,60,10,.75),rgba(40,20,4,.85))}' +
    '.jt-bol2-modo[aria-pressed="true"]::after{content:"✔";position:absolute;top:-9px;right:-7px;width:26px;height:26px;border-radius:50%;background:#ffc23a;color:#3a2300;font-size:15px;line-height:26px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.4)}' +
    '.jt-bol2-status{flex:1 1 auto;display:flex;align-items:center;justify-content:center;min-height:44px;padding:0 12px;border-radius:999px;border:2px dashed rgba(127,220,255,.55);' +
    'font-weight:600;font-size:15px;color:#d6f8ff;text-align:center;line-height:1.15}' +
    '.jt-bol2-status.pronto{border-style:solid;border-color:#2dff88;color:#b6ffd6;box-shadow:0 0 16px rgba(45,255,136,.35)}' +
    '.jt-bol2-btn.fino{min-height:44px;padding:0 14px;font-size:16px;flex:0 0 auto}' +
    '.jt-bol2-decide{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}' +
    '.jt-bol2-placar .num{font-size:14px;letter-spacing:2px;text-transform:uppercase;color:#9fe9ff}' +
    '.jt-bol2-placar .jt-bol2-total{font-size:clamp(38px,11vw,64px);font-weight:700;color:#fff;line-height:1;white-space:nowrap;font-variant-numeric:tabular-nums;' +
    'text-shadow:0 0 12px rgba(80,220,255,.9),0 0 34px rgba(80,160,255,.7);animation:jtb2Entra .6s cubic-bezier(.2,1.3,.4,1) both}' +
    '.jt-bol2-placar .jt-bol2-pontos{justify-content:center;gap:8px}.jt-bol2-placar .jt-bol2-pontos i{width:22px;height:22px;border-width:2.5px}' +
    '.jt-bol2-placar .frase{font-size:20px;font-weight:700;color:#ffe08a}' +
    '@media (orientation:landscape) and (max-height:560px){.jt-bol2-modo{padding:6px 6px 8px}.jt-bol2-modo small{font-size:12px}.jt-bol2-modo svg{max-width:110px}}' +
    '@media (prefers-reduced-motion:reduce){.jt-bol2-aura.bate,.jt-bol2-fasecard,.jt-bol2-placar .jt-bol2-total,.jt-bol2-odo.sobe,.jt-bol2-odo.desce{animation:none}}' +
    '@media (max-height:520px){.jt-bol2-perg{font-size:16px}.jt-bol2-op{min-height:42px;font-size:15px}.jt-bol2-btn{min-height:44px;font-size:17px}.jt-bol2-msg{font-size:14px}}';
  function injetarEstilo() {
    if (document.getElementById('jt-bolinhas-css')) return;
    var s = document.createElement('style'); s.id = 'jt-bolinhas-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ======================= desenho: ajudantes ======================= */
  function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }
  function elip(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, Math.PI * 2); }

  /* ======================= som (WebAudio próprio, respeitando o 🔊 da casca) ======================= */
  function criarSom(ctx) {
    var A = null, ultPlim = 0, plins = 0;
    function ligado() { return !ctx.somLigado || ctx.somLigado(); }
    function ac() {
      if (!ligado()) return null;
      try {
        A = A || new (window.AudioContext || window.webkitAudioContext)();
        if (A.state === 'suspended') A.resume();
        return A;
      } catch (e) { return null; }
    }
    function nota(a, f, ini, dur, tipo, vol, fFim) {
      var o = a.createOscillator(), g = a.createGain(), n = a.currentTime + ini;
      o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, n);
      if (fFim) o.frequency.exponentialRampToValueAtTime(fFim, n + dur);
      g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(vol, n + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, n + dur);
      o.connect(g); g.connect(a.destination); o.start(n); o.stop(n + dur + 0.03);
    }
    return {
      // plim metálico de pino: tom e volume pela velocidade (no máximo uns 14 por segundo, para não virar chiado)
      plim: function (vel, agora) {
        var a = ac(); if (!a) return;
        if (agora - ultPlim > 0.07) { plins = 0; } if (++plins > 1 && agora - ultPlim < 0.07) return; ultPlim = agora;
        var k = clamp(vel / 520, 0, 1), f = 1500 + 1500 * k;
        nota(a, f, 0, 0.14, 'triangle', 0.03 + 0.06 * k); nota(a, f * 2.76, 0, 0.07, 'sine', 0.012 + 0.02 * k);
      },
      coracao: function () { var a = ac(); if (!a) return; nota(a, 70, 0, 0.16, 'sine', 0.32, 45); nota(a, 60, 0.17, 0.18, 'sine', 0.22, 40); },
      acerto: function () { var a = ac(); if (!a) return; [523, 659, 784, 1047].forEach(function (f, i) { nota(a, f, i * 0.07, 0.5, 'triangle', 0.09); }); nota(a, 1568, 0.3, 0.4, 'sine', 0.04); },
      erro: function () { var a = ac(); if (!a) return; nota(a, 150, 0, 0.7, 'sawtooth', 0.09, 50); nota(a, 75, 0, 0.8, 'sine', 0.25, 38); },
      verde: function () { var a = ac(); if (!a) return; nota(a, 880, 0, 0.12, 'triangle', 0.07); nota(a, 1320, 0.07, 0.18, 'triangle', 0.06); },
      vermelha: function () { var a = ac(); if (!a) return; nota(a, 120, 0, 0.3, 'square', 0.04, 70); nota(a, 90, 0, 0.35, 'sine', 0.2, 50); },
      comporta: function () { var a = ac(); if (!a) return; nota(a, 240, 0, 0.06, 'square', 0.03, 140); }
    };
  }

  /* ======================= o jogo ======================= */
  function iniciar(palco, ctx) {
    var t = ctx.t, L = ctx.lingua === 'en' ? 'en' : ctx.lingua === 'es' ? 'es' : 'pt', IDX = L === 'en' ? 1 : L === 'es' ? 2 : 0;
    var nivel = ctx.nivel === 'medio' || ctx.nivel === 'dificil' ? ctx.nivel : 'facil', calmo = !!ctx.calmo;
    var banco = window.JogotecaBolinhasPerguntas || [];
    var semente = Math.floor(Math.random() * 1e9);
    if (ctx.teste) { var ms = /[?&]semente=(\d+)/.exec(location.search); semente = ms ? +ms[1] : 7; }
    var sorte = criarSorte(semente), som = criarSom(ctx);
    function tx(v) { return typeof v === 'string' ? v : (v[IDX] != null ? v[IDX] : v[0]); }
    function din(v) { return dinheiro(v, L); }
    function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function nomeMod(m) { return m === 'calma' ? t('Sem pressa', 'No Rush', 'Sin prisa') : t('Queda Livre', 'Free Fall', 'Caída Libre'); }
    injetarEstilo();

    /* ---------- DOM ---------- */
    var raiz = el('div', 'jt-bol2 calma' + (calmo ? ' jt-bol2-calmo' : ''));
    var aura = el('div', 'jt-bol2-aura');
    var hud = el('div', 'jt-bol2-hud');
    var parede = el('div', 'jt-bol2-parede'), tag = el('div', 'jt-bol2-tag'); tag.hidden = true;
    var tela = el('canvas', 'jt-bol2-tela'); tela.tabIndex = 0; tela.setAttribute('role', 'img');
    tela.setAttribute('aria-label', t('A parede de pinos. Toque numa zona do alto para escolher de onde a bolinha cai.',
      'The wall of pegs. Tap a zone at the top to choose where the ball drops.', 'La pared de clavos. Toca una zona de arriba para elegir desde dónde cae la bolita.'));
    var painel = el('div', 'jt-bol2-painel');
    raiz.appendChild(tela); raiz.appendChild(aura); raiz.appendChild(parede); raiz.appendChild(hud); raiz.appendChild(painel); raiz.appendChild(tag);
    palco.appendChild(raiz);

    // HUD: placar (modalidade, bolinhas das perguntas, saldo gigante) e alto contraste
    var saldoBox = el('div', 'jt-bol2-saldo');
    var faseEl = el('div', 'jt-bol2-fase'); var faseNome = el('span'); var pontosEl = el('span', 'jt-bol2-pontos');
    faseEl.appendChild(faseNome); faseEl.appendChild(pontosEl);
    var odo = el('div', 'jt-bol2-odo' + (calmo ? ' calmo' : '')); odo.setAttribute('role', 'status');
    saldoBox.appendChild(faseEl); saldoBox.appendChild(odo);
    var contrasteBt = el('button', 'jt-bol2-mini', '<span aria-hidden="true">+ −</span>'); contrasteBt.type = 'button';
    contrasteBt.setAttribute('aria-label', t('Alto contraste: + e − dentro das bolinhas', 'High contrast: + and − inside the balls', 'Alto contraste: + y − dentro de las bolitas'));

    // painel: aviso, categoria, pergunta, opções, ações
    var msgEl = el('p', 'jt-bol2-msg'); msgEl.setAttribute('aria-live', 'polite');
    var catEl = el('div', 'jt-bol2-cat'); var pergEl = el('p', 'jt-bol2-perg'); var opsEl = el('div', 'jt-bol2-ops'); var acoesEl = el('div', 'jt-bol2-acoes');
    [msgEl, catEl, pergEl, opsEl, acoesEl].forEach(function (e) { painel.appendChild(e); });
    var cena = el('div', 'jt-bol2-cena'); cena.hidden = true; raiz.appendChild(cena);

    /* ---------- estado ---------- */
    var contraste = !!ctx.ler('contraste');
    var modalidade = ctx.ler('modalidade') === 'calma' ? 'calma' : 'queda';
    var G = null;
    var mundo = criarMundo();
    function novoEstado() {
      return { mod: modalidade, etapa: 'inicio', saldo: 0, rodada: 0, marcas: [], acertos: 0, perg: null, resposta: null,
        zonas: [], zona: 3, zonaOk: false, usadas: {}, lote: null, leituraAte: 0 };
    }
    function R() { return MODALIDADES[G.mod]; }
    function jogando() { return G.etapa !== 'inicio' && G.etapa !== 'fim'; }
    G = novoEstado();

    /* ---------- relógio do jogo (tudo anda junto: pausa com a aba escondida e acelera nos testes) ---------- */
    var relogio = 0, vel = 1, timers = [];
    function agendar(seg, fn) { var tm = { em: relogio + seg, fn: fn }; timers.push(tm); return tm; }
    function cancelar(tm) { var i = timers.indexOf(tm); if (i >= 0) timers.splice(i, 1); }
    function rodarTimers() {
      for (var i = 0; i < timers.length; i++) if (timers[i].em <= relogio) { var tm = timers.splice(i, 1)[0]; i--; tm.fn(); }
    }

    /* ---------- odômetro ---------- */
    var odoAtual = null;
    function pintarOdo(v, forcar) {
      var s = din(v);
      if (s === odoAtual && !forcar) return;
      var velho = odoAtual || s, dif = v > (G.saldoVisto || 0) ? 'sobe' : v < (G.saldoVisto || 0) ? 'desce' : '';
      G.saldoVisto = v;
      var forma = s.replace(/\d/g, '0'), formaVelha = velho.replace(/\d/g, '0');
      if (forma !== formaVelha || !odo.firstChild) {
        // nova forma: monta as colunas com os dígitos velhos alinhados à direita e depois roda
        var vd = velho.replace(/\D/g, ''), nd = s.replace(/\D/g, '').length;
        while (vd.length < nd) vd = '0' + vd; vd = vd.slice(vd.length - nd);
        var html = '', k = 0, partes = /^(\D*)([\d.,]+)(\D*)$/.exec(s) || ['', '', s, ''];
        if (partes[1].trim()) html += '<span class="m">' + partes[1].trim() + '</span>';
        for (var i = 0; i < partes[2].length; i++) {
          var ch = partes[2].charAt(i);
          if (/\d/.test(ch)) {
            var fita = ''; for (var d = 0; d <= 9; d++) fita += '<span>' + d + '</span>';
            html += '<span class="jt-bol2-d"><span class="jt-bol2-fita" style="transform:translateY(-' + vd.charAt(k) + 'em)">' + fita + '</span></span>'; k++;
          } else html += '<span class="s">' + ch + '</span>';
        }
        if (partes[3].trim()) html += '<span class="m">' + partes[3].trim() + '</span>';
        odo.innerHTML = html;
        void odo.offsetWidth;
      }
      var fitas = odo.querySelectorAll('.jt-bol2-fita'), ds = s.replace(/\D/g, '');
      for (var j = 0; j < fitas.length; j++) fitas[j].style.transform = 'translateY(-' + ds.charAt(j) + 'em)';
      odo.setAttribute('aria-label', t('Saldo: ', 'Balance: ', 'Saldo: ') + s);
      odoAtual = s;
      if (dif && !calmo) { odo.classList.remove('sobe', 'desce'); void odo.offsetWidth; odo.classList.add(dif); }
    }

    /* ---------- HUD ---------- */
    function pintarFase() {
      var h = '';
      faseNome.textContent = G.etapa === 'inicio' ? t('Saldo', 'Balance', 'Saldo') : nomeMod(G.mod);
      if (G.etapa !== 'inicio') for (var i = 0; i < R().perguntas; i++) {
        var m = G.marcas[i];
        h += '<i class="' + (m === true ? 'sim' : m === false ? 'nao' : i === G.rodada && jogando() && G.etapa !== 'cartao' ? 'agora' : '') + '"></i>';
      }
      pontosEl.innerHTML = h;
    }
    contrasteBt.addEventListener('click', function () {
      contraste = !contraste; ctx.gravar('contraste', contraste); contrasteBt.setAttribute('aria-pressed', String(contraste));
      ctx.som('toque'); prepararSprites(); sujo = true;
    });
    contrasteBt.setAttribute('aria-pressed', String(contraste));

    /* ---------- medidas: o canvas é o estúdio inteiro; a "janela" é onde o plano aberto enquadra a parede ---------- */
    var fontesProntas = !document.fonts, dpr = 1, dprMax = 2, s0 = 1, c = tela.getContext('2d'), Lt = {}, sujo = true, leve = false;
    var MUNDO = { x0: -130, y0: -130, x1: 880, y1: 1400 };   // parede (750 × 1050) + moldura + piso do palco, em unidades do mundo
    var ABERTO = { x0: -52, y0: -52, x1: 802, y1: 1130 };    // o que o plano aberto mostra
    var PISO = 1092, RZ = (ABERTO.y1 - ABERTO.y0) / (ABERTO.x1 - ABERTO.x0);
    var CAM0 = { x: (ABERTO.x0 + ABERTO.x1) / 2, y: (ABERTO.y0 + ABERTO.y1) / 2, z: 1 };
    var cam = { x: CAM0.x, y: CAM0.y, z: 1 };
    var cen1 = null, cenZ = null, el1 = 1, elZ = 1, estudio = null, vinheta = null, feixe = null, feixesCor = {}, cenChave = '', timerZ = 0;
    function medir() {
      var r = palco.getBoundingClientRect(), W = Math.max(240, Math.round(r.width)), H = Math.max(240, Math.round(r.height));
      var retrato = H >= W * 1.05, pw, ph, px, py;
      raiz.classList.toggle('retrato', retrato); raiz.classList.toggle('deitado', !retrato);
      hud.innerHTML = '';
      if (retrato) {
        // o Sem pressa precisa de mais painel (pergunta + 4 opções + zonas); a parede encolhe um pouco
        var topo = clamp(Math.round(H * 0.08), 56, 86), baixo = G.mod === 'calma' ? clamp(Math.round(H * 0.35), 252, 380) : clamp(Math.round(H * 0.25), 188, 320);
        ph = Math.min((W - 6) * RZ, H - topo - baixo - 4); pw = ph / RZ;
        px = (W - pw) / 2; py = topo;
        pos(hud, 0, 0, W, topo); pos(painel, 0, py + ph + 2, W, H - py - ph - 2);
        hud.appendChild(saldoBox); hud.appendChild(contrasteBt);
        raiz.style.setProperty('--odo', clamp(Math.round(topo * 0.5), 28, 44) + 'px');
      } else {
        ph = H - 10; pw = ph / RZ;
        var lado = (W - pw) / 2 - 14;
        if (lado < 190) { lado = 190; pw = W - 2 * (lado + 14); ph = pw * RZ; }
        px = (W - pw) / 2; py = (H - ph) / 2;
        pos(hud, 10, 8, lado, H - 16); pos(painel, px + pw + 10, 6, lado, H - 12);
        hud.appendChild(saldoBox); hud.appendChild(contrasteBt);
        raiz.style.setProperty('--odo', clamp(Math.round(Math.min(lado / 6.5, H / 7)), 30, 96) + 'px');
      }
      pos(parede, px, py, pw, ph);
      if (retrato) pos(tag, px + 8, py + 8, null, null); else pos(tag, px + 10, py + ph - 30, null, null);   // deitado: no piso, para não tapar as zonas
      dpr = Math.min(dprMax, window.devicePixelRatio || 1);
      tela.width = Math.round(W * dpr); tela.height = Math.round(H * dpr);
      s0 = Math.min(pw / (ABERTO.x1 - ABERTO.x0), ph / (ABERTO.y1 - ABERTO.y0));
      Lt = { W: W, H: H, retrato: retrato, pw: pw, ph: ph, px: px, py: py, jx: px + pw / 2, jy: py + ph / 2 };
      cenChave = ''; estudio = null; vinheta = null; feixe = null; feixesCor = {};
      prepararSprites(); desenharFundo(); sujo = true;
    }
    function pos(e, x, y, w, h) {
      e.style.left = Math.round(x) + 'px'; e.style.top = Math.round(y) + 'px';
      if (w != null) { e.style.width = Math.round(w) + 'px'; e.style.height = Math.round(h) + 'px'; }
    }
    function novoCanvas(w, h) { var cv = document.createElement('canvas'); cv.width = Math.max(2, Math.ceil(w)); cv.height = Math.max(2, Math.ceil(h)); return cv; }

    /* ---------- sprites das coisas que se mexem (pintados uma vez, na resolução do zoom máximo) ---------- */
    var SPR = {}, CORES = {
      branca: { nucleo: '#ffffff', meio: '#e4efff', borda: '#8aa6dc', luz: [200, 228, 255] },
      verde: { nucleo: '#f0fff6', meio: '#2dff88', borda: '#05803c', luz: [45, 255, 136] },
      vermelha: { nucleo: '#fff0f3', meio: '#ff3b5c', borda: '#94102a', luz: [255, 59, 92] }
    };
    function rgba(l, a) { return 'rgba(' + l[0] + ',' + l[1] + ',' + l[2] + ',' + a + ')'; }
    function sprite(n, fn) { var cv = novoCanvas(n, n); fn(cv.getContext('2d'), cv.width); return cv; }
    function escMax() { return s0 * dpr * 4.5; }   // até o zoom da câmera da bolinha
    function prepararSprites() {
      var S = escMax(), rb = GEO.RB * 1.08 * S;
      Object.keys(CORES).forEach(function (k) {
        var co = CORES[k];
        // esfera de vidro leitoso com um LED dentro: halo, corpo translúcido, núcleo aceso, borda de luz e brilho especular
        SPR[k] = sprite(rb * 6.6, function (g, n) {
          var m = n / 2, gr = g.createRadialGradient(m, m, rb * 0.8, m, m, m);
          gr.addColorStop(0, rgba(co.luz, 0.5)); gr.addColorStop(0.3, rgba(co.luz, 0.16)); gr.addColorStop(1, rgba(co.luz, 0));
          g.fillStyle = gr; g.fillRect(0, 0, n, n);
          gr = g.createRadialGradient(m + rb * 0.08, m + rb * 0.12, rb * 0.05, m, m, rb);
          gr.addColorStop(0, co.nucleo); gr.addColorStop(0.32, co.meio); gr.addColorStop(0.82, co.borda); gr.addColorStop(1, 'rgba(10,12,30,.9)');
          circ(g, m, m, rb); g.fillStyle = gr; g.fill();
          gr = g.createRadialGradient(m - rb * 0.3, m - rb * 0.35, 0, m - rb * 0.3, m - rb * 0.35, rb * 1.1);
          gr.addColorStop(0, 'rgba(255,255,255,.42)'); gr.addColorStop(0.5, 'rgba(255,255,255,.1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          circ(g, m, m, rb); g.fillStyle = gr; g.fill();
          g.save(); circ(g, m, m, rb); g.clip();
          g.fillStyle = rgba(co.luz, 0.55); elip(g, m + rb * 0.22, m + rb * 0.62, rb * 0.5, rb * 0.2, -0.3); g.fill();
          g.restore();
          g.lineWidth = rb * 0.09; g.strokeStyle = 'rgba(255,255,255,.65)';
          g.beginPath(); g.arc(m, m, rb * 0.9, Math.PI * 1.05, Math.PI * 1.55); g.stroke();
          g.fillStyle = 'rgba(255,255,255,.95)'; elip(g, m - rb * 0.38, m - rb * 0.44, rb * 0.22, rb * 0.12, -0.6); g.fill();
          if (contraste && k !== 'branca') {
            g.lineWidth = Math.max(1.5, rb * 0.14); g.strokeStyle = '#000'; circ(g, m, m, rb); g.stroke();
            [['#000', 0.32], ['#fff', 0.14]].forEach(function (q) {
              g.lineCap = 'round'; g.lineWidth = Math.max(1, rb * q[1]); g.strokeStyle = q[0];
              g.beginPath(); g.moveTo(m - rb * 0.5, m); g.lineTo(m + rb * 0.5, m);
              if (k === 'verde') { g.moveTo(m, m - rb * 0.5); g.lineTo(m, m + rb * 0.5); }
              g.stroke();
            });
          }
        });
      });
      SPR.sombra = sprite(GEO.RB * 4 * S, function (g, n) {
        var m = n / 2, gr = g.createRadialGradient(m, m, 0, m, m, m);
        gr.addColorStop(0, 'rgba(0,0,8,.55)'); gr.addColorStop(0.45, 'rgba(0,0,8,.3)'); gr.addColorStop(1, 'rgba(0,0,8,0)');
        g.fillStyle = gr; g.fillRect(0, 0, n, n);
      });
      SPR.luz = sprite(50 * S, function (g, n) {
        var m = n / 2, gr = g.createRadialGradient(m, m, 0, m, m, m);
        gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.13, 'rgba(190,245,255,.95)'); gr.addColorStop(0.4, 'rgba(70,190,255,.35)'); gr.addColorStop(1, 'rgba(70,120,255,0)');
        g.fillStyle = gr; g.fillRect(0, 0, n, n);
      });
      SPR.led = {};
      // pino cromado nítido, desenhado por cima do cenário quando a câmera chega muito perto (a câmera da bolinha)
      SPR.pino = sprite(26 * S, function (q, n) {
        var e2 = n / 26, rp = GEO.RP * 1.3, m = 13, gq; q.scale(e2, e2);
        gq = q.createRadialGradient(m - rp * 0.35, m - rp * 0.42, rp * 0.05, m, m, rp);
        gq.addColorStop(0, '#ffffff'); gq.addColorStop(0.25, '#e9eef8'); gq.addColorStop(0.6, '#7b86a6'); gq.addColorStop(0.85, '#2b3352'); gq.addColorStop(1, '#8fb4ff');
        circ(q, m, m, rp); q.fillStyle = gq; q.fill();
      });
    }
    // pontinho de LED da moldura, na cor do momento (feito só quando a cor aparece)
    function ledSprite(cor) {
      if (SPR.led[cor]) return SPR.led[cor];
      var n = 18 * escMax();
      SPR.led[cor] = sprite(n, function (g, w) {
        var m = w / 2, gr = g.createRadialGradient(m, m, 0, m, m, m);
        gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.2, cor); gr.addColorStop(0.5, cor.replace('rgb(', 'rgba(').replace(')', ',.35)')); gr.addColorStop(1, cor.replace('rgb(', 'rgba(').replace(')', ',0)'));
        g.fillStyle = gr; g.fillRect(0, 0, w, w);
      });
      return SPR.led[cor];
    }
    var COR_CLIMA = { calma: 'rgb(80,170,255)', tensao: 'rgb(255,176,48)', verde: 'rgb(45,255,136)', vermelho: 'rgb(255,47,85)' };
    // painel de LED atrás dos pinos (dono, 21/Nov/2026, fotos do programa): quadradinhos de 50 × 50 com os pinos nos cantos,
    // acendendo em ondas; azul no normal, verde quando acerta, vermelho quando erra
    var LEDW = { y0: GEO.Y0, cols: 15, linhas: 15, lado: 50 };
    var COR_LED = { azul: [40, 120, 255], verde: [20, 255, 80], vermelho: [255, 20, 40] };
    function corLed() { return climaAtual === 'verde' ? 'verde' : climaAtual === 'vermelho' ? 'vermelho' : 'azul'; }
    // o padrão do LED muda a cada 7 s: onda diagonal, anéis do centro, chuva nas colunas e brilho salteado
    function brilhoTile(i, j, tm) {
      var pad = Math.floor(tm / 7) % 4, v, dx = i - 7, dy = j - 7;
      if (climaAtual === 'verde' || climaAtual === 'vermelho') {   // resultado: anéis fortes saindo do centro
        v = 0.5 + 0.5 * Math.sin(Math.sqrt(dx * dx + dy * dy) * 0.9 - tm * 7);
        return 0.3 + 0.6 * v * v;
      }
      var vel2 = climaAtual === 'tensao' ? 2.2 : 1;
      if (pad === 0) v = 0.5 + 0.5 * Math.sin((i + j) * 0.55 - tm * 2.4 * vel2);
      else if (pad === 1) v = 0.5 + 0.5 * Math.sin(Math.sqrt(dx * dx + dy * dy) * 0.8 - tm * 2.6 * vel2);
      else if (pad === 2) { var f = ((j - tm * 6 * vel2 + ((i * 7) % 5) * 3) % 15 + 15) % 15; v = f < 4 ? 1 - f / 4 : 0; }
      else { var h = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; h -= Math.floor(h); v = 0.5 + 0.5 * Math.sin(tm * (1.5 + 2 * h) * vel2 + h * 6.28); v = v * v * v; }
      return 0.12 + 0.55 * v + (climaAtual === 'tensao' ? 0.25 * batida : 0);
    }
    // as luzes são pintadas numa tela pequenina (um quadradinho de 12 px por LED) e esticadas sobre a parede numa só cópia,
    // com suavização: vira brilho difuso por cima dos quadradinhos apagados do cenário (leve até no tablet velho)
    var ledCv = null, LEDPX = 12;
    function desenharLeds() {
      if (!ledCv) ledCv = novoCanvas(LEDW.cols * LEDPX, LEDW.linhas * LEDPX);
      var g = ledCv.getContext('2d'), co = COR_LED[corLed()], tm = leve ? 0 : relReal, i, j, b;
      g.clearRect(0, 0, ledCv.width, ledCv.height);
      g.fillStyle = 'rgb(' + co[0] + ',' + co[1] + ',' + co[2] + ')';
      for (j = 0; j < LEDW.linhas; j++) for (i = 0; i < LEDW.cols; i++) {
        b = brilhoTile(i, j, tm); if (b < 0.04) continue;
        g.globalAlpha = Math.min(1, b); g.fillRect(i * LEDPX + 2, j * LEDPX + 2, LEDPX - 4, LEDPX - 4);
      }
      // miolo mais claro dos LEDs bem acesos
      g.fillStyle = 'rgb(' + Math.min(255, co[0] + 140) + ',' + Math.min(255, co[1] + 140) + ',' + Math.min(255, co[2] + 140) + ')';
      for (j = 0; j < LEDW.linhas; j++) for (i = 0; i < LEDW.cols; i++) {
        b = brilhoTile(i, j, tm); if (b < 0.55) continue;
        g.globalAlpha = Math.min(1, (b - 0.55) * 1.6); g.fillRect(i * LEDPX + 4, j * LEDPX + 4, LEDPX - 8, LEDPX - 8);
      }
      g.globalAlpha = 1;
      c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.85;
      c.drawImage(ledCv, 0, LEDW.y0, LEDW.cols * LEDW.lado, LEDW.linhas * LEDW.lado);
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    }
    // arco de luz em volta da parede: pernas no piso e meia elipse por cima (centro 375, 560; topo em y = −120)
    var ARCO = { x: 375, y: 560, rx: 470, ry: 680 }, ARCO_PERNA = 1092 - 560;
    function pontoArco(u) {   // u de 0 a 1: perna esquerda subindo, arco, perna direita descendo
      var L1 = ARCO_PERNA, L2 = Math.PI * (ARCO.rx + ARCO.ry) / 2, tot = 2 * L1 + L2, d = u * tot;
      if (d < L1) return [ARCO.x - ARCO.rx, ARCO.y + L1 - d];
      d -= L1;
      if (d < L2) { var a = Math.PI + Math.PI * d / L2; return [ARCO.x + Math.cos(a) * ARCO.rx, ARCO.y + Math.sin(a) * ARCO.ry]; }
      d -= L2; return [ARCO.x + ARCO.rx, ARCO.y + d];
    }

    /* ---------- cenário fixo: pintado UMA vez por resolução (plano aberto e zoom), nunca a cada quadro ---------- */
    var MAIOR = Math.max.apply(null, VALORES);
    function nivelValor(v) { return v >= MAIOR * 0.3 ? 2 : v >= MAIOR * 0.04 ? 1 : 0; }
    function rr(g, x, y, w, h, r) {
      g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r);
      g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
    }
    function fonte(px, peso) { return (peso || 700) + ' ' + px + 'px Fredoka, system-ui, sans-serif'; }
    function metal(g, x0, y0, x1, y1) {
      var gr = g.createLinearGradient(x0, y0, x1, y1);
      gr.addColorStop(0, '#4b5268'); gr.addColorStop(0.18, '#c8cedb'); gr.addColorStop(0.35, '#7d8599'); gr.addColorStop(0.55, '#e9edf4');
      gr.addColorStop(0.75, '#6a7288'); gr.addColorStop(1, '#a9b0c0');
      return gr;
    }
    function pintarCenario(el) {
      var cv = novoCanvas((MUNDO.x1 - MUNDO.x0) * el, (MUNDO.y1 - MUNDO.y0) * el), g = cv.getContext('2d');
      var vs = VALORES, sr = criarSorte(77), i, k, gr, x, y;
      g.setTransform(el, 0, 0, el, -MUNDO.x0 * el, -MUNDO.y0 * el);
      // brilho atrás da parede
      gr = g.createRadialGradient(375, 520, 100, 375, 520, 760);
      gr.addColorStop(0, 'rgba(70,110,255,.32)'); gr.addColorStop(0.6, 'rgba(110,50,220,.12)'); gr.addColorStop(1, 'rgba(110,50,220,0)');
      g.fillStyle = gr; g.fillRect(MUNDO.x0, MUNDO.y0, MUNDO.x1 - MUNDO.x0, PISO - MUNDO.y0);
      // arco de luz (tubo de neon) atrás da moldura; as luzes que correm nele vêm no desenho de cada quadro
      [[16, 'rgba(90,160,255,.10)'], [9, 'rgba(120,190,255,.22)'], [3.5, 'rgba(215,235,255,.85)']].forEach(function (q) {
        g.beginPath(); for (i = 0; i <= 120; i++) { var pa = pontoArco(i / 120); if (i) g.lineTo(pa[0], pa[1]); else g.moveTo(pa[0], pa[1]); }
        g.lineWidth = q[0]; g.strokeStyle = q[1]; g.lineCap = 'round'; g.stroke();
      });
      // moldura de metal escovado, com chanfro
      rr(g, -40, -40, 830, 1130, 34); g.fillStyle = metal(g, -40, -40, 790, 1090); g.fill();
      g.save(); rr(g, -40, -40, 830, 1130, 34); g.clip();
      for (i = 0; i < 160; i++) {
        y = -40 + sr() * 1130; g.fillStyle = sr() < 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,20,.07)';
        g.fillRect(-40, y, 830, 0.6 + sr());
      }
      g.restore();
      rr(g, -40, -40, 830, 1130, 34); g.lineWidth = 3; g.strokeStyle = 'rgba(10,12,30,.9)'; g.stroke();
      rr(g, -37, -37, 824, 1124, 31); g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,.55)'; g.stroke();
      // canaleta dos LEDs (os acesos correm por cima, no desenho de cada quadro)
      rr(g, -21, -21, 792, 1092, 24); g.lineWidth = 9; g.strokeStyle = '#0a0d24'; g.stroke();
      g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.25)'; rr(g, -25.5, -25.5, 801, 1101, 27); g.stroke();
      ledsPerimetro(function (lx, ly) { circ(g, lx, ly, 2.3); g.fillStyle = '#1d2c66'; g.fill(); });
      // parafusos
      function parafuso(px, py) {
        circ(g, px + 0.8, py + 1.2, 5.6); g.fillStyle = 'rgba(0,0,10,.45)'; g.fill();
        gr = g.createRadialGradient(px - 2, py - 2, 0.5, px, py, 5.5); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, '#a9b1c4'); gr.addColorStop(1, '#3d4458');
        circ(g, px, py, 5.2); g.fillStyle = gr; g.fill();
        var a = sr() * Math.PI; g.lineWidth = 1.4; g.strokeStyle = 'rgba(20,24,40,.8)';
        g.beginPath(); g.moveTo(px - Math.cos(a) * 3.6, py - Math.sin(a) * 3.6); g.lineTo(px + Math.cos(a) * 3.6, py + Math.sin(a) * 3.6); g.stroke();
      }
      for (x = 40; x <= 710; x += 134) { parafuso(x, -33); parafuso(x, 1083); }
      for (y = 60; y <= 1000; y += 134) { parafuso(-33, y); parafuso(783, y); }
      // painel de acrílico escuro
      gr = g.createLinearGradient(0, 0, 0, GEO.H); gr.addColorStop(0, '#0d1b62'); gr.addColorStop(0.5, '#070b36'); gr.addColorStop(1, '#150a3e');
      rr(g, 0, 0, GEO.W, GEO.H, 20); g.fillStyle = gr; g.fill();
      g.save(); rr(g, 0, 0, GEO.W, GEO.H, 20); g.clip();
      gr = g.createRadialGradient(375, 480, 30, 375, 480, 560); gr.addColorStop(0, 'rgba(90,150,255,.2)'); gr.addColorStop(1, 'rgba(90,150,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, GEO.W, GEO.H);
      g.strokeStyle = 'rgba(140,200,255,.035)'; g.lineWidth = 1;
      // os quadradinhos do painel de LED, apagados (as luzes acendem por cima, a cada quadro)
      for (k = 0; k < LEDW.linhas; k++) for (i = 0; i < LEDW.cols; i++) {
        rr(g, i * LEDW.lado + 2.5, LEDW.y0 + k * LEDW.lado + 2.5, LEDW.lado - 5, LEDW.lado - 5, 8);
        g.fillStyle = 'rgba(70,82,130,.16)'; g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(160,180,230,.12)'; g.stroke();
      }
      // reflexos do acrílico (faixas diagonais e brilho no alto)
      [[120, 90, 0.05], [330, 34, 0.035], [560, 140, 0.045]].forEach(function (q) {
        var gg = g.createLinearGradient(q[0], 0, q[0] + q[1], 0);
        gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, 'rgba(220,235,255,' + q[2] + ')'); gg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gg; g.beginPath(); g.moveTo(q[0], 0); g.lineTo(q[0] + q[1], 0); g.lineTo(q[0] + q[1] - 360, GEO.H); g.lineTo(q[0] - 360, GEO.H); g.closePath(); g.fill();
      });
      gr = g.createLinearGradient(0, 92, 0, 330); gr.addColorStop(0, 'rgba(200,225,255,.08)'); gr.addColorStop(1, 'rgba(200,225,255,0)');
      g.fillStyle = gr; g.fillRect(0, 92, GEO.W, 240);
      // faixa das comportas: caixas de metal com o número aceso e a janelinha onde a bolinha espera
      gr = g.createLinearGradient(0, 0, 0, 92); gr.addColorStop(0, '#05071c'); gr.addColorStop(1, '#0b1040');
      g.fillStyle = gr; g.fillRect(0, 0, GEO.W, 92);
      g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, 92, GEO.W, 6);
      g.fillStyle = metal(g, 0, 88, 0, 94); g.fillRect(0, 88, GEO.W, 4);
      for (k = 0; k < GEO.ZONAS; k++) {
        x = zonaX(k);
        rr(g, x - 34, 9, 68, 76, 12); g.fillStyle = 'rgba(0,0,10,.5)'; g.fill();
        rr(g, x - 35, 6, 70, 76, 12); g.fillStyle = metal(g, x - 35, 6, x + 35, 82); g.fill();
        g.lineWidth = 1.2; g.strokeStyle = 'rgba(255,255,255,.6)'; g.stroke();
        rr(g, x - 26, 35, 52, 39, 9); gr = g.createLinearGradient(0, 33, 0, 74); gr.addColorStop(0, '#02030c'); gr.addColorStop(1, '#0b1238');
        g.fillStyle = gr; g.fill(); g.lineWidth = 1.5; g.strokeStyle = 'rgba(0,0,0,.8)'; g.stroke();
        rr(g, x - 17, 8, 34, 25, 6); g.fillStyle = '#03040e'; g.fill();
        g.font = fonte(25); g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = 6; g.strokeStyle = 'rgba(80,200,255,.3)'; g.strokeText(String(k + 1), x, 21.5); g.fillStyle = '#d6f8ff'; g.fillText(String(k + 1), x, 21.5);
      }
      // canaletas: fundo rebaixado e placas de valor de LED (a grade de pontos do LED é um padrão de 3 × 3)
      var gp = novoCanvas(Math.max(2, Math.round(3 * el)), Math.max(2, Math.round(3 * el))), gpc = gp.getContext('2d'), grade;
      gpc.fillStyle = 'rgba(0,0,0,.42)'; gpc.fillRect(0, 0, gp.width, Math.max(1, Math.round(el))); gpc.fillRect(0, 0, Math.max(1, Math.round(el)), gp.height);
      grade = g.createPattern(gp, 'repeat');
      if (grade.setTransform && window.DOMMatrix) grade.setTransform(new DOMMatrix().scale(1 / el, 1 / el));
      gr = g.createLinearGradient(0, GEO.YDIV - 20, 0, GEO.H); gr.addColorStop(0, 'rgba(2,3,14,0)'); gr.addColorStop(0.2, '#03041a'); gr.addColorStop(1, '#070624');
      g.fillStyle = gr; g.fillRect(0, GEO.YDIV - 20, GEO.W, GEO.H - GEO.YDIV + 20);
      for (k = 0; k < GEO.CANALETAS; k++) {
        var nv = nivelValor(vs[k]), x0 = k * GEO.LARG, cor = nv === 2 ? [255, 196, 60] : nv === 1 ? [90, 210, 255] : [175, 182, 230];
        rr(g, x0 + 7, 908, 36, 86, 5); g.fillStyle = '#010208'; g.fill(); g.lineWidth = 1.2; g.strokeStyle = 'rgba(120,140,220,.3)'; g.stroke();
        g.save(); rr(g, x0 + 7, 908, 36, 86, 5); g.clip();
        gr = g.createLinearGradient(0, 908, 0, 994); gr.addColorStop(0, rgba(cor, 0.05)); gr.addColorStop(1, rgba(cor, 0.16)); g.fillStyle = gr; g.fillRect(x0 + 7, 908, 36, 86);
        g.translate(x0 + GEO.LARG / 2, 951); g.rotate(-Math.PI / 2);
        var txt = milhar(vs[k], L);
        g.font = fonte(txt.length > 6 ? 21 : 24); g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = 7; g.strokeStyle = rgba(cor, 0.22); g.strokeText(txt, 0, 0);
        g.fillStyle = rgba(cor, 1); g.fillText(txt, 0, 0);
        g.restore();
        // grade de pontos do placar de LED
        g.fillStyle = grade; g.fillRect(x0 + 7, 908, 36, 86);
        gr = g.createLinearGradient(0, 1000, 0, GEO.H); gr.addColorStop(0, rgba(cor, 0)); gr.addColorStop(1, rgba(cor, nv ? 0.3 : 0.12));
        g.fillStyle = gr; g.fillRect(x0 + 3, 1000, GEO.LARG - 6, GEO.H - 1000);
        g.fillStyle = rgba(cor, nv ? 0.9 : 0.45); g.fillRect(x0 + 8, GEO.H - 6, GEO.LARG - 16, 3);
      }
      g.setLineDash([5, 9]); g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(0, GEO.SENSOR); g.lineTo(GEO.W, GEO.SENSOR); g.stroke(); g.setLineDash([]);
      // divisórias de metal com sombra e ponta cromada
      for (k = 1; k < GEO.CANALETAS; k++) {
        x = k * GEO.LARG;
        g.fillStyle = 'rgba(0,0,10,.5)'; rr(g, x - 1, GEO.YDIV + 2, 8, GEO.H - GEO.YDIV, 4); g.fill();
        gr = g.createLinearGradient(x - 4, 0, x + 4, 0); gr.addColorStop(0, '#3f4760'); gr.addColorStop(0.4, '#f2f5fa'); gr.addColorStop(0.7, '#8b93a8'); gr.addColorStop(1, '#2e3448');
        g.fillStyle = gr; rr(g, x - GEO.RDIV, GEO.YDIV - GEO.RDIV, GEO.RDIV * 2, GEO.H - GEO.YDIV, GEO.RDIV); g.fill();
        gr = g.createRadialGradient(x - 1.5, GEO.YDIV - 2, 0.3, x, GEO.YDIV, 5); gr.addColorStop(0, '#fff'); gr.addColorStop(0.5, '#b5bdcf'); gr.addColorStop(1, '#353c52');
        circ(g, x, GEO.YDIV, 4.6); g.fillStyle = gr; g.fill();
      }
      // pinos cromados: primeiro as sombras no acrílico, depois as esferas (luz vindo de cima à esquerda)
      var ps = mundo.pinos, rp = GEO.RP * 1.3, lado = 26, pino = sprite(lado * el, function (q, n) {
        var e2 = n / lado; q.scale(e2, e2);
        var m = 9, gq = q.createRadialGradient(m + 4, m + 7, 0, m + 4, m + 7, rp * 2.1);
        gq.addColorStop(0, 'rgba(0,0,10,.6)'); gq.addColorStop(1, 'rgba(0,0,10,0)'); q.fillStyle = gq; q.fillRect(0, 0, lado, lado);
        gq = q.createRadialGradient(m - rp * 0.35, m - rp * 0.42, rp * 0.05, m, m, rp);
        gq.addColorStop(0, '#ffffff'); gq.addColorStop(0.25, '#e9eef8'); gq.addColorStop(0.6, '#7b86a6'); gq.addColorStop(0.85, '#2b3352'); gq.addColorStop(1, '#8fb4ff');
        circ(q, m, m, rp); q.fillStyle = gq; q.fill();
        q.fillStyle = 'rgba(150,200,255,.35)'; elip(q, m + rp * 0.1, m + rp * 0.55, rp * 0.55, rp * 0.22); q.fill();
      });
      for (i = 0; i < ps.length; i++) g.drawImage(pino, ps[i].x - 9, ps[i].y - 9, lado, lado);
      // borda interna escura (profundidade do acrílico dentro da moldura)
      rr(g, 0, 0, GEO.W, GEO.H, 20); g.lineWidth = 10; g.strokeStyle = 'rgba(0,0,12,.55)'; g.stroke();
      g.restore();
      rr(g, 0, 0, GEO.W, GEO.H, 20); g.lineWidth = 2; g.strokeStyle = 'rgba(150,220,255,.5)'; g.stroke();
      // piso do palco: preto brilhante, refletindo a parede
      var piso = (PISO - MUNDO.y0) * el;
      gr = g.createLinearGradient(0, PISO, 0, MUNDO.y1); gr.addColorStop(0, '#10133c'); gr.addColorStop(1, '#020210');
      g.fillStyle = gr; g.fillRect(MUNDO.x0, PISO, MUNDO.x1 - MUNDO.x0, MUNDO.y1 - PISO);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      g.beginPath(); g.rect(0, piso, cv.width, cv.height - piso); g.clip();
      g.globalAlpha = 0.3; g.setTransform(1, 0, 0, -1, 0, 2 * piso); g.drawImage(cv, 0, 0); g.globalAlpha = 1;
      g.restore();
      gr = g.createLinearGradient(0, PISO, 0, MUNDO.y1); gr.addColorStop(0, 'rgba(4,4,20,.15)'); gr.addColorStop(0.35, 'rgba(4,4,20,.75)'); gr.addColorStop(1, 'rgba(3,3,14,1)');
      g.fillStyle = gr; g.fillRect(MUNDO.x0, PISO, MUNDO.x1 - MUNDO.x0, MUNDO.y1 - PISO);
      // as pontas do piso somem no escuro do estúdio
      [[MUNDO.x0, MUNDO.x0 + 110, 1], [MUNDO.x1 - 110, MUNDO.x1, -1]].forEach(function (q) {
        var gg = g.createLinearGradient(q[0], 0, q[1], 0);
        gg.addColorStop(q[2] > 0 ? 0 : 1, 'rgba(3,3,14,1)'); gg.addColorStop(q[2] > 0 ? 1 : 0, 'rgba(3,3,14,0)');
        g.globalCompositeOperation = 'destination-out'; g.fillStyle = gg; g.fillRect(q[0], PISO, q[1] - q[0], MUNDO.y1 - PISO); g.globalCompositeOperation = 'source-over';
      });
      g.fillStyle = 'rgba(160,210,255,.25)'; g.fillRect(-60, PISO, 870, 1.5);
      return cv;
    }
    // os LEDs da moldura ficam numa volta só (retângulo arredondado); cb(x, y) para cada um, a partir de "inicio"
    var LED_PASSO = 24, LED_VOLTA = 2 * (792 + 1092);
    function pontoLed(d) {
      d = ((d % LED_VOLTA) + LED_VOLTA) % LED_VOLTA;
      if (d < 792) return [-21 + d, -21]; d -= 792;
      if (d < 1092) return [771, -21 + d]; d -= 1092;
      if (d < 792) return [771 - d, 1071]; d -= 792;
      return [-21, 1071 - d];
    }
    function ledsPerimetro(cb) { for (var d = 0; d < LED_VOLTA; d += LED_PASSO) { var p = pontoLed(d); cb(p[0], p[1]); } }
    // o estúdio em volta (tela): fundo, painéis de LED, treliça com refletores, piso e a plateia na penumbra
    function pintarEstudio() {
      var w = tela.width * 0.6, h = tela.height * 0.6, cv = novoCanvas(w, h), g = cv.getContext('2d'), sr = criarSorte(31), i, x, gr;   // meia resolução (é fundo desfocado)
      gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#03041a'); gr.addColorStop(0.55, '#0b0d36'); gr.addColorStop(0.75, '#080824'); gr.addColorStop(1, '#030310');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      var colW = Math.max(6, w / 34), passo = w / 11;
      for (i = 0; i < 12; i++) {
        x = i * passo + passo * 0.2;
        gr = g.createLinearGradient(0, h * 0.08, 0, h * 0.72);
        gr.addColorStop(0, i % 2 ? 'rgba(80,170,255,.16)' : 'rgba(150,80,255,.16)'); gr.addColorStop(1, 'rgba(60,40,160,0)');
        g.fillStyle = gr; g.fillRect(x, h * 0.08, colW, h * 0.64);
        g.fillStyle = 'rgba(0,0,0,.35)';
        for (var y = h * 0.08; y < h * 0.72; y += Math.max(3, h / 160)) g.fillRect(x, y, colW, 1);
      }
      gr = g.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, w * 0.6);
      gr.addColorStop(0, 'rgba(60,90,255,.18)'); gr.addColorStop(1, 'rgba(60,90,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      // treliça e refletores
      g.fillStyle = '#05060f'; g.fillRect(0, 0, w, h * 0.045);
      g.strokeStyle = 'rgba(120,130,170,.25)'; g.lineWidth = Math.max(1, h / 500);
      for (x = 0; x < w; x += h * 0.045) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h * 0.045, h * 0.045); g.stroke(); }
      for (i = 0; i < 9; i++) {
        x = (i + 0.5) * w / 9; var rl = Math.max(4, h * 0.012);
        gr = g.createRadialGradient(x, h * 0.05, 0, x, h * 0.05, rl * 5); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(0.2, 'rgba(160,210,255,.45)'); gr.addColorStop(1, 'rgba(120,160,255,0)');
        g.fillStyle = gr; g.fillRect(x - rl * 5, h * 0.05 - rl * 5, rl * 10, rl * 10);
      }
      // piso em perspectiva
      gr = g.createLinearGradient(0, h * 0.74, 0, h); gr.addColorStop(0, '#0d0f38'); gr.addColorStop(1, '#020208');
      g.fillStyle = gr; g.fillRect(0, h * 0.74, w, h * 0.26);
      g.strokeStyle = 'rgba(120,170,255,.07)'; g.lineWidth = 1;
      for (i = -10; i <= 10; i++) { g.beginPath(); g.moveTo(w / 2 + i * w * 0.02, h * 0.74); g.lineTo(w / 2 + i * w * 0.16, h); g.stroke(); }
      // plateia na penumbra
      var rc = Math.max(7, Math.min(w, h) * 0.028);
      for (var fila = 0; fila < 2; fila++) {
        var yb = h - rc * (fila ? 1.2 : 3.2);
        for (x = -rc + sr() * rc; x < w + rc; x += rc * (2.2 + sr() * 0.9)) {
          var cy = yb - sr() * rc * 0.6, rh = rc * (0.8 + sr() * 0.3);
          g.fillStyle = fila ? '#010106' : '#04040f';
          elip(g, x, cy + rh * 2.1, rh * 1.8, rh * 1.4); g.fill();
          circ(g, x, cy, rh); g.fill();
          g.strokeStyle = fila ? 'rgba(120,190,255,.22)' : 'rgba(150,120,255,.16)'; g.lineWidth = Math.max(1, rh * 0.12);
          g.beginPath(); g.arc(x, cy, rh, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
        }
      }
      return cv;
    }
    function pintarVinheta() {
      var w = Math.ceil(tela.width / 2), h = Math.ceil(tela.height / 2), cv = novoCanvas(w, h), g = cv.getContext('2d');
      var gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
      gr.addColorStop(0, 'rgba(0,0,10,0)'); gr.addColorStop(1, 'rgba(0,0,10,.62)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      return cv;
    }
    // feixe de luz de estúdio (branco, meia resolução); as cores saem dele uma vez só
    function pintarFeixe() {
      var w = Math.ceil(tela.width * 0.17), h = Math.ceil(tela.height * 0.65), cv = novoCanvas(w, h), g = cv.getContext('2d');
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(0.5, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(w * 0.44, 0); g.lineTo(w * 0.56, 0); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
      g.globalCompositeOperation = 'destination-in';
      gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      return cv;
    }
    function feixeDaCor(k) {
      if (feixesCor[k]) return feixesCor[k];
      if (!feixe) feixe = pintarFeixe();
      var cv = novoCanvas(feixe.width, feixe.height), g = cv.getContext('2d');
      g.drawImage(feixe, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = COR_CLIMA[k]; g.fillRect(0, 0, cv.width, cv.height);
      feixesCor[k] = cv; return cv;
    }
    function desenharFundo() {
      var chave = tela.width + 'x' + tela.height + ':' + fontesProntas + ':' + leve;
      if (chave === cenChave) return;   // nada mudou: não repinta (o começo fica leve no tablet velho)
      cenChave = chave;
      el1 = s0 * dpr; cen1 = pintarCenario(el1);
      if (!estudio && !leve) estudio = pintarEstudio();
      if (!vinheta && !leve) vinheta = pintarVinheta();
      // a versão para o zoom é pintada logo depois, sem travar a abertura do jogo
      cenZ = null; clearTimeout(timerZ);
      timerZ = setTimeout(function () {
        if (!vivo) return;
        var mw = MUNDO.x1 - MUNDO.x0, mh = MUNDO.y1 - MUNDO.y0, lim = leve ? 2.2e6 : 6e6;
        elZ = Math.min(s0 * dpr * 3.4, Math.sqrt(lim / (mw * mh)), 4096 / mh);
        if (elZ > el1 * 1.2 && !leve) cenZ = pintarCenario(elZ);
        sujo = true;
      }, 500);
      sujo = true;
    }

    /* ---------- efeitos ---------- */
    var parts = [], flutua = [], flashes = [], tremor = 0, portas = [0, 0, 0, 0, 0, 0, 0];
    function explodir(x, y, cor, n) {
      if (calmo) n = Math.round(n / 3);
      var cs = cor === 'verde' ? ['#2dff88', '#b6ffd6', '#fff'] : cor === 'vermelha' ? ['#ff3b5c', '#ffb0bd', '#ffd23f'] : ['#fff', '#bff3ff'];
      for (var i = 0; i < n; i++) {
        var a = sorte() * Math.PI * 2, v = 120 + 260 * sorte();
        parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, vida: 0.6 + 0.5 * sorte(), max: 1.1, cor: cs[i % cs.length], tam: 3 + 4 * sorte() });
      }
      if (parts.length > 160) parts.splice(0, parts.length - 160);
    }

    /* ---------- bolinhas e lotes ---------- */
    function novoLote(total, fim) { var l = { total: total, bolas: [], fim: fim, acabou: false }; G.lote = l; return l; }
    function lancar(lote, zona, cor, atraso) { var b = soltar(mundo, zona, cor, sorte, atraso || 0.05); b.lote = lote; b.rastro = []; lote.bolas.push(b); sujo = true; return b; }
    function aplicar(b) {
      if (b.aplicada || b.cor === 'branca' || !b.pousou) return;
      b.aplicada = true;
      var v = VALORES[b.canaleta], mx = MAIOR;
      G.saldo = aplicarBola(G.saldo, v, b.cor);
      pintarOdo(G.saldo);
      flashes.push({ k: b.canaleta, cor: b.cor, vida: 1 });
      flutua.push({ x: (b.canaleta + 0.5) * GEO.LARG, y: GEO.YDIV - 20, txt: (b.cor === 'verde' ? '+' : '−') + milhar(v, L), cor: b.cor, vida: 1.6 });
      explodir(b.x, b.y, b.cor, 14);
      if (b.cor === 'verde') som.verde(); else som.vermelha();
      if (!calmo && (v === mx || (b.cor === 'vermelha' && v >= mx * 0.3))) tremor = 1;
    }
    function aoEvento(tipo, b, forca, idx) {
      if (tipo === 'pino') { var p = mundo.pinos[idx]; p.b = Math.min(1, p.b + forca / 220); som.plim(forca, relogio); }
      else if (tipo === 'solta') { som.comporta(); }
      else if (tipo === 'pouso') {
        aoPousarCamera(b);
        if (b.cor !== 'branca') aplicar(b);
        else if (G.mod === 'queda' && G.etapa === 'queda' && G.resposta === null) revelarQueda();
      }
    }
    function trocarCor(b, cor) {
      b.cor = cor; b.troca = 1;
      explodir(b.x, b.y, cor, 18);
      if (b.pousou) aplicar(b);
    }
    function revelarLote(acertou) {
      if (!G.lote) return;
      G.lote.revelado = true;
      G.lote.bolas.forEach(function (b) { trocarCor(b, acertou ? 'verde' : 'vermelha'); });
      clima(acertou ? 'verde' : 'vermelho');
      if (acertou) som.acerto(); else som.erro();
    }
    function checarLote() {
      var l = G.lote;
      if (!l || l.acabou || l.bolas.length < l.total) return;
      for (var i = 0; i < l.bolas.length; i++) { var b = l.bolas[i]; if (!b.pousou || (b.cor !== 'branca' && !b.aplicada) || b.cor === 'branca') return; }
      l.acabou = true;
      tensaoDesligar();   // a última bateu no fundo: a trilha volta
      agendar(1.1, function () {
        l.bolas.forEach(function (b) { b.sumir = 1; });
        clima('calma');
        if (G.lote === l) G.lote = null;
        l.fim();
      });
    }

    /* ---------- clima do cenário: calma (azul), tensão (âmbar com coração), verde, vermelho ---------- */
    var climaAtual = 'calma', proxBatida = 0;
    function clima(k) {
      if (k === climaAtual) return;
      raiz.classList.remove('calma', 'tensao', 'verde', 'vermelho'); raiz.classList.add(k); climaAtual = k;
      if (k === 'tensao') proxBatida = relogio + 0.2;
    }
    /* ---------- música de tensão na queda (dono, 21/Nov/2026): do soltar até a ÚLTIMA bolinha bater no fundo; a trilha do
       jogo pausa e depois continua do ponto onde parou. "Interloper", Kevin MacLeod, CC BY 4.0 (créditos em CREDITOS.md).
       A tensão também continua de onde parou na queda seguinte. É efeito do momento: obedece ao 🔊 dos efeitos. ---------- */
    var tensao = { audio: null, ativa: false, pausouTrilha: false, vol: 0, alvo: 0 };
    function tensaoLigar() {
      if (tensao.ativa) return;
      tensao.ativa = true; tensao.alvo = 0.6;
      if (window.Trilha && window.Trilha.tocando && window.Trilha.tocando()) { window.Trilha.parar(); tensao.pausouTrilha = true; }
      if (ctx.somLigado && !ctx.somLigado()) return;
      try {
        if (!tensao.audio) { tensao.audio = new Audio('musicas/tensao-interloper.mp3'); tensao.audio.loop = true; tensao.audio.preload = 'auto'; }
        tensao.audio.volume = tensao.vol;
        var pr = tensao.audio.play(); if (pr && pr.catch) pr.catch(function () {});
      } catch (e) { /* sem áudio neste aparelho */ }
    }
    function tensaoDesligar() {
      if (!tensao.ativa) return;
      tensao.ativa = false; tensao.alvo = 0;
    }
    // volume em rampa (entra em 0,3 s, sai em 0,7 s); calada, pausa e devolve a trilha do jogo
    function tensaoPasso(dt) {
      var a = tensao.audio;
      if (tensao.vol !== tensao.alvo) {
        tensao.vol = tensao.alvo > tensao.vol ? Math.min(tensao.alvo, tensao.vol + dt / 0.3 * 0.6) : Math.max(0, tensao.vol - dt / 0.7 * 0.6);
        if (a) a.volume = tensao.vol;
      }
      if (!tensao.ativa && tensao.vol === 0) {
        if (a && !a.paused) a.pause();
        if (tensao.pausouTrilha) { tensao.pausouTrilha = false; if (window.Trilha && window.Trilha.continuar) window.Trilha.continuar(); }
      }
    }
    function bater() {
      som.coracao();
      if (!calmo) { aura.classList.remove('bate'); void aura.offsetWidth; aura.classList.add('bate'); }
    }

    /* ---------- painel ---------- */
    function msg(s) { msgEl.textContent = s || ''; }
    function limparPainel() { msg(''); catEl.innerHTML = ''; pergEl.textContent = ''; pergEl.hidden = true; opsEl.innerHTML = ''; acoesEl.innerHTML = ''; }
    var LETRAS = ['A', 'B', 'C', 'D'];
    function montarOps(p, aoEscolher) {
      opsEl.innerHTML = ''; opsEl.className = 'jt-bol2-ops n' + p.o.length;
      p.o.forEach(function (o, i) {
        var b = el('button', 'jt-bol2-op'); b.type = 'button';
        b.innerHTML = '<span class="l">' + LETRAS[i] + '</span><span>' + esc(tx(o)) + '</span>';
        b.setAttribute('data-op', i);
        b.addEventListener('click', function () { aoEscolher(i); });
        opsEl.appendChild(b);
      });
    }
    // no Sem pressa as opções ficam à mostra, mas só se soltam depois das 3 zonas escolhidas
    function opsAtivas(sim) {
      Array.prototype.forEach.call(opsEl.children, function (b) { b.disabled = !sim; b.classList.toggle('espera', !sim); });
    }
    function marcarOps(certa, escolhida) {
      Array.prototype.forEach.call(opsEl.children, function (b, i) {
        b.disabled = true; b.classList.remove('trava', 'espera');
        if (i === certa) b.classList.add('certa'); else if (i === escolhida) b.classList.add('errada'); else b.classList.add('apagada');
      });
    }
    function categoriaHTML(p) {
      var c = CATEGORIAS[p.cat];
      return '<span class="jt-bol2-chip">' + c.ico + ' ' + esc(tx(c.n)) + '</span>';
    }
    function focar(b) { if (b) try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } }

    /* ---------- cenas (por cima de tudo) ---------- */
    function abrirCena(html, classe) {
      cena.className = 'jt-bol2-cena' + (classe ? ' ' + classe : ''); cena.innerHTML = html; cena.hidden = false;
      var b = cena.querySelector('[data-foco]') || cena.querySelector('button');
      if (b) setTimeout(function () { if (!cena.hidden) focar(b); }, 30);
      return cena;
    }
    function fecharCena() { cena.hidden = true; cena.innerHTML = ''; }
    function aoClicarCena(sel, fn) { var b = cena.querySelector(sel); if (b) b.addEventListener('click', function () { ctx.som('toque'); fn(b); }); }

    /* ---------- começo: as duas modalidades em cartões, Começar sempre à vista (com a última escolhida) ---------- */
    // desenhinho de cada modalidade: a parede neon com pinos; na Queda Livre três brancas caindo das zonas 1, 4 e 7,
    // no Sem pressa três bolinhas esperando nas zonas escolhidas e as cores do resultado embaixo
    function arteMod(m) {
      var h = '<svg viewBox="0 0 150 96" aria-hidden="true"><defs><radialGradient id="jtb2g' + m + '" cx=".38" cy=".35" r=".7">' +
        '<stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#e4efff"/><stop offset="1" stop-color="#8aa6dc"/></radialGradient></defs>' +
        '<rect x="5" y="3" width="140" height="90" rx="12" fill="#0b1650" stroke="#7fdcff" stroke-width="2.5"/>' +
        '<rect x="12" y="9" width="126" height="13" rx="4" fill="#05071c"/>', f, k, x;
      for (k = 0; k < 7; k++) h += '<rect x="' + (15 + k * 18) + '" y="10.5" width="12" height="10" rx="3" fill="#2a3a8a"/>';
      for (f = 0; f < 4; f++) for (k = 0; k < (f % 2 ? 7 : 8); k++) {
        x = (f % 2 ? 21 : 12) + k * 18; h += '<circle cx="' + x + '" cy="' + (32 + f * 12) + '" r="2" fill="#c8d6ff" opacity=".75"/>';
      }
      for (k = 0; k < 8; k++) h += '<rect x="' + (12 + k * 16) + '" y="80" width="2" height="10" fill="#8b93a8"/>';
      if (m === 'queda') {
        [[24, 46], [75, 34], [117, 58]].forEach(function (q) {
          h += '<path d="M' + q[0] + ' ' + (q[1] - 22) + ' L' + q[0] + ' ' + (q[1] - 7) + '" stroke="#bff3ff" stroke-width="5" stroke-linecap="round" opacity=".35"/>' +
            '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="6.5" fill="url(#jtb2g' + m + ')"/>';
        });
        h += '<circle cx="128" cy="84" r="0" />';
      } else {
        [[39, '#2dff88'], [75, '#2dff88'], [111, '#ff3b5c']].forEach(function (q) {
          h += '<circle cx="' + q[0] + '" cy="16" r="5.5" fill="url(#jtb2g' + m + ')"/>' +
            '<circle cx="' + q[0] + '" cy="16" r="8.5" fill="none" stroke="' + q[1] + '" stroke-width="2"/>';
        });
        h += '<circle cx="63" cy="85" r="5" fill="#2dff88"/><circle cx="87" cy="85" r="5" fill="#ff3b5c"/>';
      }
      return h + '</svg>';
    }
    function textoComecar() { return '▶ ' + t('Começar', 'Start', 'Empezar') + ' · ' + nomeMod(modalidade); }
    function telaInicio() {
      G = novoEstado(); timers = []; mundo.bolas = []; parts = []; flutua = []; flashes = []; tensaoDesligar();
      clima('calma'); pintarOdo(0, true); pintarFase(); limparPainel(); desenharFundo();
      function cartao(m, ico, sub, selo) {
        return '<button type="button" class="jt-bol2-modo" data-mod="' + m + '" aria-pressed="' + (modalidade === m) + '">' + arteMod(m) +
          '<b>' + ico + ' ' + nomeMod(m) + '</b><span class="selo">' + selo + '</span><small>' + sub + '</small></button>';
      }
      var html = '<div class="jt-bol2-caixa larga">' +
        '<h2 class="jt-bol2-logo cheia">' + t('Bolinhas', 'Nail-Biter', 'Bolitas') + '<span>' + t('da Angústia', 'Drop', 'de la Angustia') + '</span></h2>' +
        '<p class="cheia">' + t('Acertou, as bolinhas ficam verdes e somam. Errou, ficam vermelhas e descontam. Escolha como quer jogar:',
          'Get it right and the balls turn green and add up. Get it wrong and they turn red and take away. Choose how you want to play:',
          'Si aciertas, las bolitas se vuelven verdes y suman. Si fallas, se vuelven rojas y restan. Elige cómo quieres jugar:') + '</p>' +
        '<div class="jt-bol2-modos cheia">' +
        cartao('queda', '⏱', t('Responda enquanto as bolinhas caem!', 'Answer while the balls are falling!', '¡Responde mientras caen las bolitas!'),
          t('2 opções · com tempo', '2 options · timed', '2 opciones · con tiempo')) +
        cartao('calma', '🧘', t('Escolha de onde as bolinhas caem e responda com calma.', 'Pick where the balls drop, then answer calmly.', 'Elige desde dónde caen las bolitas y responde con calma.'),
          t('4 opções · sem tempo', '4 options · no timer', '4 opciones · sin tiempo')) +
        '</div>' +
        '<button type="button" class="jt-bol2-btn ouro cheia" data-comecar data-foco>' + textoComecar() + '</button></div>';
      abrirCena(html);
      Array.prototype.forEach.call(cena.querySelectorAll('[data-mod]'), function (b) {
        b.addEventListener('click', function () {
          ctx.som('toque');
          if (modalidade === b.getAttribute('data-mod')) return comecar(modalidade);   // tocou de novo no escolhido: começa
          modalidade = b.getAttribute('data-mod'); ctx.gravar('modalidade', modalidade);
          Array.prototype.forEach.call(cena.querySelectorAll('[data-mod]'), function (o) { o.setAttribute('aria-pressed', String(o === b)); });
          cena.querySelector('[data-comecar]').textContent = textoComecar();
        });
      });
      aoClicarCena('[data-comecar]', function () { comecar(modalidade); });
    }
    function comecar(m) {
      modalidade = m === 'calma' ? 'calma' : 'queda'; ctx.gravar('modalidade', modalidade);
      G = novoEstado(); timers = []; mundo.bolas = []; parts = []; flutua = []; flashes = []; clima('calma'); tensaoDesligar();
      fecharCena(); pintarOdo(0, true); medir();
      cartaoRodada();
    }

    /* ---------- cartão da rodada (as regras em uma frase) ---------- */
    function cartaoRodada() {
      G.etapa = 'cartao'; G.rodada = 0; G.perg = null;
      pintarFase(); limparPainel();
      var queda = G.mod === 'queda';
      var sub = queda ? t('5 perguntas de 2 opções. Três bolinhas caem das zonas 1, 4 e 7: responda antes que a primeira chegue lá embaixo!',
        '5 questions with 2 options. Three balls drop from zones 1, 4 and 7: answer before the first one reaches the bottom!',
        '5 preguntas de 2 opciones. Tres bolitas caen de las zonas 1, 4 y 7: ¡responde antes de que la primera llegue abajo!') :
        t('5 perguntas de 4 opções, sem relógio. Leia, toque em 3 zonas lá no alto (o centro vale mais, as pontas arriscam menos) e depois responda.',
          '5 questions with 4 options, no clock. Read, tap 3 zones at the top (the middle pays more, the edges risk less) and then answer.',
          '5 preguntas de 4 opciones, sin reloj. Lee, toca 3 zonas de arriba (el centro vale más, los lados arriesgan menos) y luego responde.');
      abrirCena('<div class="jt-bol2-caixa jt-bol2-fasecard"><span class="num">' + (queda ? '⏱' : '🧘') + ' ' + t('Modalidade', 'Mode', 'Modalidad') + '</span><h2>' + nomeMod(G.mod) + '</h2><p>' + sub + '</p>' +
        '<button type="button" class="jt-bol2-btn" data-foco data-ok>' + t('Vamos!', 'Let’s go!', '¡Vamos!') + '</button></div>', 'vidro');
      var seguiu = false, seguir = function () { if (seguiu) return; seguiu = true; fecharCena(); proxima(); };
      aoClicarCena('[data-ok]', seguir);
      if (queda) agendar(calmo ? 6 : 4.5, function () { if (G.etapa === 'cartao') seguir(); });   // no Sem pressa, nada anda sozinho
    }
    function proxima() {
      if (G.rodada >= R().perguntas) return placar();
      if (G.mod === 'queda') perguntaQueda(); else perguntaCalma();
    }
    function novaPergunta() {
      var q = sortearPergunta(banco, R().opcoes, nivel, G.usadas, sorte);
      if (!q) { G.usadas = {}; q = sortearPergunta(banco, R().opcoes, nivel, G.usadas, sorte); }   // banco esgotado: recomeça
      G.perg = prepararPergunta(q, sorte); G.resposta = null;
      limparPainel();
      catEl.innerHTML = categoriaHTML(G.perg);
      pergEl.hidden = false; pergEl.textContent = tx(G.perg.q);
    }
    function marcar(acertou) { G.marcas[G.rodada] = acertou; if (acertou) G.acertos++; pintarFase(); }

    /* ---------- Queda Livre: 2 opções, responder enquanto as bolinhas caem ---------- */
    function perguntaQueda() {
      novaPergunta();
      var seg = tempoDeLeitura('queda', nivel);
      G.etapa = 'leitura'; G.leituraAte = relogio + seg;
      pintarFase();
      montarOps(G.perg, responderQueda);
      G.timerLeitura = agendar(seg, soltarQueda);
    }
    function soltarQueda() {
      if (G.etapa !== 'leitura') return;
      cancelar(G.timerLeitura);
      G.etapa = 'queda';
      var l = novoLote(R().bolas, function () { G.rodada++; proxima(); });
      R().zonas.forEach(function (z) { lancar(l, z, 'branca', 0.05); });
      clima('tensao'); tensaoLigar();
      msg(G.resposta === null ? t('Rápido! Responda antes que a primeira caia!', 'Quick! Answer before the first one lands!', '¡Rápido! ¡Responde antes de que caiga la primera!') :
        t('Resposta travada… lá vão elas!', 'Answer locked… here they go!', 'Respuesta bloqueada… ¡allá van!'));
      if (G.resposta !== null) agendar(0.9, revelarQueda);
    }
    function responderQueda(i) {
      if (G.mod !== 'queda' || G.resposta !== null || (G.etapa !== 'leitura' && G.etapa !== 'queda')) return;
      G.resposta = i; ctx.som('toque');
      Array.prototype.forEach.call(opsEl.children, function (b, k) { b.disabled = true; if (k === i) b.classList.add('trava'); else b.classList.add('apagada'); });
      msg(t('Resposta travada!', 'Answer locked!', '¡Respuesta bloqueada!'));
      if (G.etapa === 'leitura') agendar(0.35, soltarQueda);
      else agendar(0.6, revelarQueda);
    }
    function revelarQueda() {
      if (!G.lote || G.lote.revelado || G.mod !== 'queda') return;
      var acertou = G.resposta === G.perg.c;
      marcar(acertou);
      marcarOps(G.perg.c, G.resposta);
      msg(G.resposta === null ? t('O tempo acabou! Vermelhas…', 'Time’s up! Reds…', '¡Se acabó el tiempo! Rojas…') :
        acertou ? t('Acertou! Bolinhas verdes: tudo soma!', 'Correct! Green balls: it all adds up!', '¡Acierto! Bolitas verdes: ¡todo suma!') :
          t('Errou… bolinhas vermelhas: tudo desconta!', 'Wrong… red balls: it all comes off!', 'Fallo… bolitas rojas: ¡todo resta!'));
      revelarLote(acertou);
    }

    /* ---------- Sem pressa: 4 opções, sem tempo; primeiro as 3 zonas, depois a resposta ---------- */
    function perguntaCalma() {
      novaPergunta();
      G.zonas = []; G.zonaOk = false; G.etapa = 'zonas';
      pintarFase(); clima('calma');
      montarOps(G.perg, responderCalma); opsAtivas(false);
      montarAcoesZonas();
    }
    function montarAcoesZonas() {
      acoesEl.innerHTML = '';
      var n = G.zonas.length, max = R().bolas, pronto = zonasProntas(G.zonas, max);
      var des = el('button', 'jt-bol2-btn fino'); des.type = 'button'; des.setAttribute('data-desfazer', '');
      des.innerHTML = '<span aria-hidden="true">↩</span>'; des.setAttribute('aria-label', t('Desfazer a última zona', 'Undo the last zone', 'Deshacer la última zona'));
      des.disabled = n === 0;
      des.addEventListener('click', function () { desfazerZona(); });
      var st = el('span', 'jt-bol2-status' + (pronto ? ' pronto' : '')); st.setAttribute('data-status', '');
      st.textContent = pronto ? '✔ ' + t('Agora é só responder!', 'Now pick your answer!', '¡Ahora elige la respuesta!') :
        '👆 ' + t('Toque nas zonas do alto: ', 'Tap the zones at the top: ', 'Toca las zonas de arriba: ') + n + '/' + max;
      acoesEl.appendChild(des); acoesEl.appendChild(st);
    }
    function colocarZona(z) {
      if (G.mod !== 'calma' || G.etapa !== 'zonas') return;
      G.zonas = adicionarZona(G.zonas, z, R().bolas); G.zona = clamp(Math.round(z), 0, 6); G.zonaOk = true; sujo = true;
      som.comporta();
      if (zonasProntas(G.zonas, R().bolas)) {
        G.etapa = 'resposta'; opsAtivas(true);
        var foco = document.activeElement;
        if (!foco || foco === document.body || foco === tela || foco.hasAttribute('data-desfazer')) focar(opsEl.firstChild);
      }
      montarAcoesZonas();
    }
    function desfazerZona() {
      if (G.mod !== 'calma' || (G.etapa !== 'zonas' && G.etapa !== 'resposta') || !G.zonas.length) return;
      ctx.som('toque');
      G.zonas = G.zonas.slice(0, -1); G.etapa = 'zonas'; opsAtivas(false); sujo = true;
      montarAcoesZonas();
    }
    function responderCalma(i) {
      if (G.mod !== 'calma' || G.etapa !== 'resposta' || G.resposta !== null) return;
      var acertou = i === G.perg.c, cor = corDaResposta(acertou);
      G.resposta = i; G.etapa = 'quedaCalma'; ctx.som('toque');
      marcar(acertou); marcarOps(G.perg.c, i); acoesEl.innerHTML = '';
      msg(acertou ? t('Acertou! As bolinhas caem verdes: tudo soma!', 'Correct! The balls drop green: it all adds up!', '¡Acierto! Las bolitas caen verdes: ¡todo suma!') :
        t('Errou… as bolinhas caem vermelhas: tudo desconta!', 'Wrong… the balls drop red: it all comes off!', 'Fallo… las bolitas caen rojas: ¡todo resta!'));
      clima(acertou ? 'verde' : 'vermelho');
      if (acertou) som.acerto(); else som.erro();
      var l = novoLote(G.zonas.length, function () { G.rodada++; proxima(); });
      tensaoLigar();
      G.zonas.forEach(function (z, k) { var b = lancar(l, z, cor, 0.6 + k * 0.45); b.troca = 1; explodir(zonaX(z), GEO.Y_SOLTA, cor, 8); });
    }

    /* ---------- placar no fim da rodada ---------- */
    function placar() {
      G.etapa = 'fim'; limparPainel(); pintarFase();
      var n = R().perguntas, ch = 'recorde-' + G.mod + '-' + nivel, rec = +ctx.ler(ch) || 0, novo = G.saldo > rec;
      if (novo) ctx.gravar(ch, G.saldo);
      var bols = ''; for (var i = 0; i < n; i++) bols += '<i class="' + (G.marcas[i] ? 'sim' : 'nao') + '"></i>';
      var frase = G.acertos === n ? t('Gabaritou! 🤩', 'A perfect round! 🤩', '¡Pleno total! 🤩') : G.acertos >= 3 ? t('Mandou bem! 👏', 'Well played! 👏', '¡Muy bien! 👏') :
        t('A parede quer revanche! 💪', 'The wall wants a rematch! 💪', '¡La pared quiere la revancha! 💪');
      clima(G.acertos >= 3 ? 'verde' : 'calma');
      if (G.acertos >= 3) som.acerto();
      abrirCena('<div class="jt-bol2-caixa jt-bol2-placar"><span class="num">🏁 ' + t('Placar', 'Final score', 'Marcador') + ' · ' + nomeMod(G.mod) + '</span>' +
        '<div class="jt-bol2-total" data-total>' + din(G.saldo) + '</div>' +
        '<div class="jt-bol2-pontos">' + bols + '</div>' +
        '<p><b>' + G.acertos + '</b> ' + t('de ', 'out of ', 'de ') + n + t(' certas', ' right', ' aciertos') + '</p>' +
        '<p class="frase">' + frase + '</p>' +
        '<p>' + (novo && G.saldo > 0 ? '🏆 ' + t('Novo recorde!', 'New record!', '¡Nuevo récord!') : rec ? t('Recorde: ', 'Record: ', 'Récord: ') + din(rec) : '') + '</p>' +
        '<div class="jt-bol2-decide"><button type="button" class="jt-bol2-btn ouro" data-foco data-denovo>🔄 ' + t('Jogar de novo', 'Play again', 'Jugar otra vez') + '</button>' +
        '<button type="button" class="jt-bol2-btn" data-trocar>🎛 ' + t('Trocar modalidade', 'Change mode', 'Cambiar modalidad') + '</button></div></div>', 'vidro');
      aoClicarCena('[data-denovo]', function () { comecar(G.mod); });
      aoClicarCena('[data-trocar]', telaInicio);
    }

    /* ---------- toque na parede e teclado ---------- */
    function aoTocar(ev) {
      if (G.mod !== 'calma' || G.etapa !== 'zonas') return;
      var r = tela.getBoundingClientRect(), x = cam.x + (ev.clientX - r.left - Lt.jx) / (s0 * cam.z);
      if (x < -60 || x > GEO.W + 60) return;
      colocarZona(Math.round((x - 75) / 100));
      ev.preventDefault();
    }
    tela.addEventListener('pointerdown', aoTocar);
    function focarEntre(lista, d) {
      var bs = Array.prototype.filter.call(lista, function (b) { return !b.disabled && b.offsetParent !== null; });
      if (!bs.length) return;
      var i = bs.indexOf(document.activeElement); i = i < 0 ? 0 : (i + d + bs.length) % bs.length; bs[i].focus();
    }
    function aoTeclar(ev) {
      if (!ev.key || document.querySelector('.ajuda:not([hidden]), .fim:not([hidden])')) return;
      var k = ev.key, seta = /^Arrow/.test(k), d = k === 'ArrowRight' || k === 'ArrowDown' ? 1 : -1, emBotao = ev.target && ev.target.tagName === 'BUTTON';
      if (!cena.hidden) { if (seta) { focarEntre(cena.querySelectorAll('button'), d); ev.preventDefault(); } return; }
      if (G.mod === 'calma' && (G.etapa === 'zonas' || G.etapa === 'resposta')) {
        if (k === 'Backspace' || k === 'Delete') { desfazerZona(); ev.preventDefault(); return; }
        if (G.etapa === 'zonas') {
          if (k === 'ArrowLeft' || k === 'ArrowRight') { G.zona = clamp((G.zonaOk ? G.zona : 3 - d) + d, 0, 6); G.zonaOk = true; sujo = true; ctx.som('toque'); ev.preventDefault(); }
          else if ((k === 'Enter' || k === ' ') && !emBotao) { ev.preventDefault(); colocarZona(G.zonaOk ? G.zona : 3); }
          return;
        }
      }
      if ((G.etapa === 'leitura' || G.etapa === 'queda' || G.etapa === 'resposta') && G.resposta === null && seta) { focarEntre(opsEl.children, d); ev.preventDefault(); }
    }
    window.addEventListener('keydown', aoTeclar);

    /* ---------- câmera de transmissão: plano aberto, desce com a bolinha, câmera lenta no último segundo ---------- */
    var relReal = 0, escala = 1, camLider = null, pips = [], segura = null, ultCorte = -9, tipoPlano = 'aberto', flashTela = null, batida = 0;
    var liderAnt = null, alvoPov = null;
    var LIMIAR_LENTA = GEO.SENSOR - 0.15 * (GEO.SENSOR - GEO.Y_SOLTA), POV_ATE = 470;   // a câmera da bolinha vai até perto do meio da parede
    function caindoAgora() { return mundo.bolas.filter(function (b) { return b.espera <= 0 && !b.pousou && b.sumir === undefined; }); }
    function limitarCam(a) {
      var hw = Lt.pw / (2 * s0 * a.z), hh = Lt.ph / (2 * s0 * a.z);
      if (hw * 2 < ABERTO.x1 - ABERTO.x0) a.x = clamp(a.x, ABERTO.x0 + hw, ABERTO.x1 - hw); else a.x = CAM0.x;
      if (hh * 2 < ABERTO.y1 - ABERTO.y0) a.y = clamp(a.y, ABERTO.y0 + hh, ABERTO.y1 + 40 - hh); else a.y = CAM0.y;
      return a;
    }
    function planoDesejado() {
      var cai = caindoAgora(), a, tipo = 'aberto', lenta = false, i, b;
      pips = []; camLider = null;
      if (segura && relReal < segura.ate) return { a: segura.a, tipo: 'segura', lenta: false };
      segura = null;
      if (!cai.length) { alvoPov = null; liderAnt = null; return { a: { x: CAM0.x, y: CAM0.y, z: 1 }, tipo: 'aberto', lenta: false }; }
      // a líder só troca quando outra passa com folga (3 bolinhas soltas juntas não fazem a câmera pular de uma para outra)
      var lider = cai.indexOf(liderAnt) >= 0 ? liderAnt : cai[0], x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (i = 0; i < cai.length; i++) {
        b = cai[i]; if (b.y > lider.y + 40) lider = b;
        x0 = Math.min(x0, b.x); x1 = Math.max(x1, b.x); y0 = Math.min(y0, b.y); y1 = Math.max(y1, b.y);
      }
      liderAnt = lider;
      if (cai.indexOf(alvoPov) < 0) alvoPov = lider;   // a câmera da bolinha fica na mesma bolinha até ela passar do meio
      if (!calmo && alvoPov.y < POV_ATE) lider = alvoPov;
      camLider = lider;
      var zf = Math.min(Lt.pw / (s0 * (x1 - x0 + 200)), Lt.ph / (s0 * (y1 - y0 + 260)));
      if (!calmo && lider.y < POV_ATE) {
        // câmera da bolinha (dono, 21/Nov/2026): colada na mais adiantada, bem perto, os pinos passando por ela
        a = { x: lider.x, y: lider.y + 22, z: 4.4 }; tipo = 'pov';
        if (!leve) for (i = 0; i < cai.length && pips.length < 2; i++) if (cai[i] !== lider) pips.push(cai[i]);
      }
      else if (cai.length > 1 && zf >= 1.8) { a = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 + 50, z: Math.min(2.8, zf) }; tipo = 'grupo'; }
      else {
        a = { x: lider.x, y: lider.y + 55, z: 3.1 }; tipo = 'segue';   // acompanhamento bem perto (dono, 21/Nov/2026)
        if (!leve) for (i = 0; i < cai.length && pips.length < 2; i++) if (cai[i] !== lider) pips.push(cai[i]);   // modo leve: sem quadrinhos
      }
      if (lider.y > LIMIAR_LENTA) { a = { x: lider.x, y: Math.max(lider.y + 25, 940), z: 3.4 }; tipo = 'lenta'; lenta = !calmo; }
      return { a: limitarCam(a), tipo: tipo, lenta: lenta };
    }
    function atualizarCamera(dt) {
      relReal += dt;
      tensaoPasso(dt);
      var p = planoDesejado(), a = p.a;
      escala += ((p.lenta ? 0.4 : 1) - escala) * Math.min(1, dt * 5);
      if (calmo) {   // reduzir movimento: cortes secos em vez de a câmera andar, e sem câmera lenta
        escala = 1;
        if (p.tipo !== tipoPlano || (p.tipo === 'segue' && relReal - ultCorte > 1.5)) { cam.x = a.x; cam.y = a.y; cam.z = a.z; ultCorte = relReal; sujo = true; }
      } else {
        var pov = p.tipo === 'pov', k = 1 - Math.exp(-dt * (pov ? 14 : 3.6)), kz = 1 - Math.exp(-dt * (pov ? 3.4 : 2.6));
        var dx = a.x - cam.x, dy = a.y - cam.y, dz = a.z - cam.z;
        if (Math.abs(dx) + Math.abs(dy) > 0.05 || Math.abs(dz) > 0.0005) { cam.x += dx * k; cam.y += dy * k; cam.z += dz * kz; sujo = true; }
      }
      tipoPlano = p.tipo;
      var tagTxt = escala < 0.75 ? '⏱ ' + t('Câmera lenta', 'Slow motion', 'Cámara lenta') : p.tipo === 'pov' ? '🎥 ' + t('Câmera da bolinha', 'Ball cam', 'Cámara de la bolita') :
        jogando() ? '● ' + t('Ao vivo', 'Live', 'En directo') : '';
      if (tag.textContent !== tagTxt) { tag.textContent = tagTxt; tag.hidden = !tagTxt; tag.classList.toggle('lenta', escala < 0.75); }
      if (flashTela) { flashTela.v -= dt * 2.4; if (flashTela.v <= 0) flashTela = null; sujo = true; }
      if (batida > 0) batida = Math.max(0, batida - dt * 3);
    }
    function aoPousarCamera(b) {
      flashTela = { cor: b.cor === 'verde' ? '45,255,136' : b.cor === 'vermelha' ? '255,47,85' : '200,228,255', v: 1 };
      if (b === camLider && !calmo) segura = { ate: relReal + 0.7, a: limitarCam({ x: b.x, y: 960, z: 3 }) };
    }

    /* ---------- laço: física em passo fixo, desenho só quando algo se mexe ---------- */
    var raf = 0, ultimo = 0, vivo = true, acum = 0, PASSO = 1 / 120, medidas = { n: 0, soma: 0, auto: true };
    function atualizar(dt) {
      relogio += dt;
      rodarTimers();
      acum += dt;
      var n = 0;
      while (acum >= PASSO && n < 400) { passoMundo(mundo, PASSO, sorte, aoEvento); acum -= PASSO; n++; }
      if (n >= 400) acum = 0;
      checarLote();
      var i, b, p, mexe = false;
      for (i = mundo.bolas.length - 1; i >= 0; i--) {
        b = mundo.bolas[i];
        if (b.sumir !== undefined) { b.sumir -= dt * 2.5; if (b.sumir <= 0) { mundo.bolas.splice(i, 1); continue; } }
        if (b.troca) b.troca = Math.max(0, b.troca - dt * 2.2);
        if (b.espera <= 0) { b.rastro.push(b.x, b.y); if (b.rastro.length > 12) b.rastro.splice(0, 2); b.giro = (b.giro || 0) + b.vx * dt / GEO.RB; }
        mexe = true;
      }
      for (i = 0; i < mundo.pinos.length; i++) { p = mundo.pinos[i]; if (p.b > 0.01) { p.b *= Math.exp(-dt * 3.2); mexe = true; } else p.b = 0; }
      for (i = parts.length - 1; i >= 0; i--) { p = parts[i]; p.vida -= dt; if (p.vida <= 0) { parts.splice(i, 1); continue; } p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; mexe = true; }
      for (i = flutua.length - 1; i >= 0; i--) { flutua[i].vida -= dt; flutua[i].y -= 40 * dt; if (flutua[i].vida <= 0) flutua.splice(i, 1); else mexe = true; }
      for (i = flashes.length - 1; i >= 0; i--) { flashes[i].vida -= dt * 1.3; if (flashes[i].vida <= 0) flashes.splice(i, 1); else mexe = true; }
      if (tremor > 0) { tremor = Math.max(0, tremor - dt * 2.5); mexe = true; }
      for (i = 0; i < 7; i++) {
        var alvo = 0;
        for (var j = 0; j < mundo.bolas.length; j++) { b = mundo.bolas[j]; if (b.zona === i && b.sumir === undefined && ((b.espera > 0 && b.espera < 0.35) || (b.espera <= 0 && b.t < 0.4))) alvo = 1; }
        var a = portas[i] + (alvo - portas[i]) * Math.min(1, dt * 14);
        if (Math.abs(a - portas[i]) > 0.002) mexe = true;
        portas[i] = a;
      }
      if (G.etapa === 'zonas' || G.etapa === 'resposta' || climaAtual === 'tensao') mexe = true;
      if (!leve && (cena.hidden || jogando())) mexe = true;   // o painel de LED está sempre se mexendo
      // coração: bate mais rápido quanto mais perto do fundo estão as bolinhas
      if ((climaAtual === 'tensao' || (G.etapa === 'quedaCalma' && caindoAgora().length)) && relogio >= proxBatida) {
        var fundoY = 0; mundo.bolas.forEach(function (bb) { if (!bb.pousou && bb.espera <= 0) fundoY = Math.max(fundoY, bb.y); });
        var prog = clamp(fundoY / GEO.SENSOR, 0, 1);
        bater(); batida = 1; proxBatida = relogio + (0.95 - 0.5 * prog);
      }
      // contagem da leitura (Fase 1)
      if (G.etapa === 'leitura' && G.resposta === null) {
        var falta = Math.ceil(G.leituraAte - relogio), s = t('As bolinhas caem em ', 'The balls drop in ', 'Las bolitas caen en ') + Math.max(1, falta) + '…';
        if (msgEl.textContent !== s) msg(s);
      }
      if (mexe) sujo = true;
    }
    // desenha a cópia certa do cenário fixo (só o pedaço que aparece) com a câmera cm, centro (cx, cy) e escala S (px por unidade)
    function pintarCamada(cm, cx, cy, S, R) {
      var usarZ = cenZ && S > el1 * 1.25, cv = usarZ ? cenZ : cen1, el = usarZ ? elZ : el1;
      if (!cv) return;
      var ax0 = Math.max(cm.x + (R.x - cx) / S, MUNDO.x0), ay0 = Math.max(cm.y + (R.y - cy) / S, MUNDO.y0);
      var ax1 = Math.min(cm.x + (R.x + R.w - cx) / S, MUNDO.x1), ay1 = Math.min(cm.y + (R.y + R.h - cy) / S, MUNDO.y1);
      var sx = (ax0 - MUNDO.x0) * el, sy = (ay0 - MUNDO.y0) * el, sw = Math.min(cv.width - sx, (ax1 - ax0) * el), sh = Math.min(cv.height - sy, (ay1 - ay0) * el);
      if (sw <= 1 || sh <= 1) return;
      c.drawImage(cv, sx, sy, sw, sh, cx + (ax0 - cm.x) * S, cy + (ay0 - cm.y) * S, sw / el * S, sh / el * S);
    }
    function desenharBola(b, S, simples) {
      var sp = SPR[b.cor]; if (!sp) return;
      var sw = sp.width / escMax(), al = b.sumir !== undefined ? Math.max(0, b.sumir) : 1, pulso = b.troca > 0 ? 1 + 0.35 * Math.sin(b.troca * Math.PI) : 1;
      var so = SPR.sombra, ss = so.width / escMax();
      c.globalAlpha = al * 0.8; c.drawImage(so, b.x + 4 - ss / 2, b.y + 8 - ss / 2, ss, ss);
      if (!simples && !leve && b.espera <= 0 && !b.pousou && b.rastro.length > 4) {
        c.globalCompositeOperation = 'lighter';
        var nr = b.rastro.length / 2;
        for (var k = 0; k < nr - 1; k++) {
          var f = (k + 1) / nr, s3 = sw * (0.3 + 0.4 * f);
          c.globalAlpha = 0.22 * f * al; c.drawImage(sp, b.rastro[k * 2] - s3 / 2, b.rastro[k * 2 + 1] - s3 / 2, s3, s3);
        }
        c.globalCompositeOperation = 'source-over';
      }
      c.globalAlpha = al; var s4 = sw * pulso;
      c.drawImage(sp, b.x - s4 / 2, b.y - s4 / 2, s4, s4);
      // giro aparente: dois pontinhos do LED dando a volta por dentro do vidro
      c.fillStyle = 'rgba(255,255,255,' + (0.55 * al) + ')';
      for (var q = 0; q < 2; q++) { var an = (b.giro || 0) + q * Math.PI; circ(c, b.x + Math.cos(an) * GEO.RB * 0.5, b.y + Math.sin(an) * GEO.RB * 0.25, 1.5); c.fill(); }
      if (b.troca > 0) { c.globalAlpha = b.troca * al; c.lineWidth = 3.5; c.strokeStyle = '#fff'; circ(c, b.x, b.y, GEO.RB * (1.3 + (1 - b.troca) * 3)); c.stroke(); }
      // reflexo no piso brilhante, perto do fundo
      if (!simples && b.y > 960) { c.globalAlpha = 0.22 * al; c.drawImage(sp, b.x - sw / 2, 2 * PISO - b.y - sw / 2 + 30, sw, sw); }
      c.globalAlpha = 1;
    }
    function dinamicos(S, simples) {
      var i, b, p, k, x, sp, sw;
      if (!simples) desenharLeds();
      if (!simples) {
        // luzes que correm pelo arco, na cor do clima
        var corA = COR_CLIMA[climaAtual] || COR_CLIMA.calma, ledA = ledSprite(corA), la = ledA.width / escMax() * 1.6, nA = 64, u0 = (leve ? 0 : relReal) * (climaAtual === 'tensao' ? 0.12 : 0.05);
        c.globalCompositeOperation = 'lighter';
        for (k = 0; k < nA; k++) {
          var pa = pontoArco(k / (nA - 1)), on = 0.5 + 0.5 * Math.sin((k / nA - u0) * Math.PI * 12);
          c.globalAlpha = 0.25 + 0.75 * on * on; c.drawImage(ledA, pa[0] - la / 2, pa[1] - la / 2, la, la);
        }
        c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
        // LEDs que correm pela moldura, na cor do clima (mais fortes na batida do coração)
        var cor = COR_CLIMA[climaAtual] || COR_CLIMA.calma, led = ledSprite(cor), lw = led.width / escMax(), vel2 = climaAtual === 'tensao' ? 520 : 260;
        var cometas = leve ? 3 : 6, cauda = leve ? 2 : 6;
        c.globalCompositeOperation = 'lighter';
        for (k = 0; k < cometas; k++) for (i = 0; i < cauda; i++) {
          var pt = pontoLed(Math.round((relReal * vel2 + k * LED_VOLTA / cometas) / LED_PASSO) * LED_PASSO - i * LED_PASSO);
          c.globalAlpha = (1 - i / cauda) * (0.75 + 0.25 * batida); c.drawImage(led, pt[0] - lw / 2, pt[1] - lw / 2, lw, lw);
        }
        c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
        // feixe de mira da zona escolhida
        if (G.etapa === 'zonas' && G.zonaOk) {
          x = zonaX(G.zona);
          var pulso = 0.55 + 0.45 * Math.sin(relogio * 5), gr = c.createLinearGradient(0, 80, 0, GEO.YDIV);
          gr.addColorStop(0, 'rgba(127,230,255,' + (0.3 * pulso + 0.1) + ')'); gr.addColorStop(1, 'rgba(127,230,255,0)');
          c.fillStyle = gr; c.fillRect(x - 24, 84, 48, GEO.YDIV - 84);
          c.fillStyle = 'rgba(200,250,255,' + (0.3 + 0.3 * pulso) + ')'; c.fillRect(x - 1.2, 84, 2.4, GEO.YDIV - 84);
        }
        for (i = 0; i < flashes.length; i++) {
          var fl = flashes[i];
          c.fillStyle = (fl.cor === 'verde' ? 'rgba(45,255,136,' : 'rgba(255,59,92,') + (0.5 * fl.vida) + ')';
          c.fillRect(fl.k * GEO.LARG + 3, GEO.YDIV, GEO.LARG - 6, GEO.H - GEO.YDIV - 3);
        }
      }
      // bem de perto (câmera da bolinha), os pinos ganham a versão nítida por cima do cenário ampliado
      if (!simples && S > (cenZ ? elZ : el1) * 1.3) {
        var vx0 = cam.x - Lt.W * dpr / S, vx1 = cam.x + Lt.W * dpr / S, vy0 = cam.y - Lt.H * dpr / S, vy1 = cam.y + Lt.H * dpr / S;
        for (i = 0; i < mundo.pinos.length; i++) {
          p = mundo.pinos[i]; if (p.x < vx0 || p.x > vx1 || p.y < vy0 || p.y > vy1) continue;
          c.drawImage(SPR.pino, p.x - 13, p.y - 13, 26, 26);
        }
      }
      // pinos tocados acendem e pulsam
      sp = SPR.luz; sw = sp.width / escMax();
      c.globalCompositeOperation = 'lighter';
      for (i = 0; i < mundo.pinos.length; i++) {
        p = mundo.pinos[i]; if (p.b <= 0.02) continue;
        var s2 = sw * (0.55 + 0.6 * p.b); c.globalAlpha = Math.min(1, p.b * 1.5);
        c.drawImage(sp, p.x - s2 / 2, p.y - s2 / 2, s2, s2);
      }
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
      if (!simples) {
        // comportas: portinhola que abre, contorno aceso na escolhida, luzinhas das zonas guardadas
        for (k = 0; k < 7; k++) {
          x = zonaX(k);
          var escolhida = G.etapa === 'zonas' && G.zonaOk && G.zona === k;
          if (escolhida) { c.lineWidth = 4; c.strokeStyle = 'rgba(160,240,255,' + (0.6 + 0.4 * Math.sin(relogio * 6)) + ')'; rr(c, x - 38, 3, 76, 82, 14); c.stroke(); }
          var ab = portas[k], meia = 24 * (1 - ab);
          c.fillStyle = '#b3bbcd'; c.fillRect(x - 25, 64, meia, 6); c.fillRect(x + 25 - meia, 64, meia, 6);
          c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(x - 25, 64, meia, 1.2); c.fillRect(x + 25 - meia, 64, meia, 1.2);
          // Sem pressa: as bolinhas já escolhidas esperam na janelinha da comporta (e um pontinho por bolinha embaixo)
          if (G.etapa === 'zonas' || G.etapa === 'resposta') {
            var nm = 0; for (i = 0; i < G.zonas.length; i++) if (G.zonas[i] === k) nm++;
            if (nm) {
              var spb = SPR.branca, swb = spb.width / escMax();
              for (i = 0; i < nm; i++) c.drawImage(spb, x + (i - (nm - 1) / 2) * 13 - swb / 2, GEO.Y_SOLTA + 4 - swb / 2, swb, swb);
              for (i = 0; i < nm; i++) { circ(c, x - (nm - 1) * 4.5 + i * 9, 79, 3.2); c.fillStyle = '#ffe08a'; c.fill(); }
            }
          }
        }
      }
      for (i = 0; i < mundo.bolas.length; i++) desenharBola(mundo.bolas[i], S, simples);
      if (simples) return;
      for (i = 0; i < parts.length; i++) { p = parts[i]; c.globalAlpha = Math.min(1, p.vida / 0.5); c.fillStyle = p.cor; c.fillRect(p.x - p.tam / 2, p.y - p.tam / 2, p.tam, p.tam); }
      c.globalAlpha = 1;
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = fonte(34);
      for (i = 0; i < flutua.length; i++) {
        var ft = flutua[i]; c.globalAlpha = Math.min(1, ft.vida);
        c.lineWidth = 6; c.strokeStyle = 'rgba(4,6,30,.9)'; c.strokeText(ft.txt, clamp(ft.x, 70, GEO.W - 70), ft.y);
        c.fillStyle = ft.cor === 'verde' ? '#7dffb4' : '#ff8fa3'; c.fillText(ft.txt, clamp(ft.x, 70, GEO.W - 70), ft.y);
      }
      c.globalAlpha = 1;
    }
    function feixes(alfa) {
      var k = climaAtual, fx = feixeDaCor(k), W = tela.width, H = tela.height, i, ang;
      c.globalCompositeOperation = 'lighter';
      for (i = 0; i < 4; i++) {
        ang = (i < 2 ? -1 : 1) * (0.18 + 0.08 * (i % 2)) + 0.09 * Math.sin(relReal * 0.45 + i * 1.7);
        c.setTransform(Math.cos(ang), Math.sin(ang), -Math.sin(ang), Math.cos(ang), W * (0.1 + i * 0.27), -H * 0.04);
        c.globalAlpha = alfa * (1 + 0.6 * batida);
        c.drawImage(fx, -fx.width, 0, fx.width * 2, fx.height * 2);
      }
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    }
    function desenhar() {
      if (!sujo || !cen1) return;
      sujo = false;
      var W = tela.width, H = tela.height, S = s0 * dpr * cam.z, cx = Lt.jx * dpr, cy = Lt.jy * dpr, i, b;
      if (tremor > 0 && !calmo) { cx += (sorte() * 2 - 1) * 5 * tremor * dpr; cy += (sorte() * 2 - 1) * 4 * tremor * dpr; }
      c.setTransform(1, 0, 0, 1, 0, 0);
      // estúdio ao fundo, com paralaxe (anda menos que a parede)
      var mx = W * 0.1, my = H * 0.1, ox = clamp(-(cam.x - CAM0.x) * s0 * dpr * 0.18, -mx, mx), oy = clamp(-(cam.y - CAM0.y) * s0 * dpr * 0.12, -my, my);
      var ze = 2 * (1 + (cam.z - 1) * 0.06), cobre = cam.x - cx / S > MUNDO.x0 && cam.x + (W - cx) / S < MUNDO.x1 && cam.y - cy / S > MUNDO.y0 && cam.y + (H - cy) / S < MUNDO.y1;
      if (leve) { if (!cobre) { c.fillStyle = '#05061c'; c.fillRect(0, 0, W, H); } }
      else c.drawImage(estudio, (W - estudio.width * ze) / 2 + ox, (H - estudio.height * ze) / 2 + oy, estudio.width * ze, estudio.height * ze);
      if (!leve) feixes(0.2);
      pintarCamada(cam, cx, cy, S, { x: 0, y: 0, w: W, h: H });
      c.setTransform(S, 0, 0, S, cx - cam.x * S, cy - cam.y * S);
      dinamicos(S, false);
      c.setTransform(1, 0, 0, 1, 0, 0);
      if (!leve) { feixes(0.028); c.drawImage(vinheta, 0, 0, W, H); }
      if (tipoPlano === 'pov' && camLider) {
        // câmera da bolinha: riscos de velocidade subindo pela tela e a borda escurecida da lente
        var vy = Math.max(0, camLider.vy || 0), nr = 16, Wd = W, Hd = H;
        c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(190,230,255,1)'; c.lineCap = 'round';
        for (i = 0; i < nr; i++) {
          var hx = ((i * 0.6180339 * Wd) % Wd), off = ((relReal * (300 + vy * 2.2) * dpr + i * 97 * dpr) % (Hd * 1.3)), comp = (30 + vy * 0.18) * dpr;
          if (Math.abs(hx - Wd / 2) < Wd * 0.12) continue;   // o meio fica limpo para a bolinha
          c.globalAlpha = 0.07 + 0.1 * Math.min(1, vy / 400); c.lineWidth = (1.5 + (i % 3)) * dpr;
          c.beginPath(); c.moveTo(hx, Hd - off); c.lineTo(hx, Hd - off + comp); c.stroke();
        }
        c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
        if (vinheta) { c.globalAlpha = 0.8; c.drawImage(vinheta, 0, 0, W, H); c.globalAlpha = 1; }
      }
      if (flashTela) { c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(' + flashTela.cor + ',' + (0.3 * flashTela.v) + ')'; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; }
      // quadros pequenos (picture-in-picture) com as outras bolinhas
      for (i = 0; i < pips.length; i++) {
        b = pips[i];
        var pw2 = Math.round(Math.min(Lt.pw * 0.36, 210) * dpr), ph2 = Math.round(pw2 * 0.75), aEsq = camLider && camLider.x > cam.x, R = { x: aEsq ? Math.round((Lt.px + 8) * dpr) : Math.round((Lt.px + Lt.pw) * dpr - pw2 - 8 * dpr), y: Math.round((Lt.py + (aEsq ? 40 : 10)) * dpr + i * (ph2 + 8 * dpr)), w: pw2, h: ph2 };
        var cm = limitarCam({ x: b.x, y: b.y + 40, z: 2 }), S2 = s0 * dpr * cm.z, pcx = R.x + R.w / 2, pcy = R.y + R.h / 2;
        cm = { x: cm.x, y: cm.y, z: cm.z };
        c.save(); c.beginPath(); c.rect(R.x, R.y, R.w, R.h); c.clip();
        c.fillStyle = '#04051a'; c.fillRect(R.x, R.y, R.w, R.h);
        pintarCamada(cm, pcx, pcy, S2, R);
        c.setTransform(S2, 0, 0, S2, pcx - cm.x * S2, pcy - cm.y * S2);
        dinamicos(S2, true);
        c.restore();
        var corB = CORES[b.cor] ? CORES[b.cor].luz : [255, 255, 255];
        c.lineWidth = 2.5 * dpr; c.strokeStyle = rgba(corB, 0.95); c.strokeRect(R.x, R.y, R.w, R.h);
        c.font = fonte(Math.round(11 * dpr)); c.textAlign = 'left'; c.textBaseline = 'top';
        c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(R.x, R.y, 54 * dpr, 17 * dpr);
        c.fillStyle = '#fff'; c.fillText(t('CÂM ', 'CAM ', 'CÁM ') + (i + 2), R.x + 5 * dpr, R.y + 3 * dpr);
      }
    }
    function laco(ts) {
      if (!vivo) return;
      raf = requestAnimationFrame(laco);
      var dtR = ultimo ? Math.min(0.05, Math.max(0, (ts - ultimo) / 1000)) : 1 / 60; ultimo = ts;
      atualizar(dtR * vel * escala);
      atualizarCamera(dtR * vel);
      var desenhou = sujo;
      desenhar();
      // tablet lento: com a queda rolando abaixo de ~36 quadros por segundo, liga sozinho o modo leve
      if (desenhou && !leve && medidas.auto && caindoAgora().length && medidas.ult) {
        medidas.n++; medidas.soma += (ts - medidas.ult) / 1000;
        if (medidas.soma >= 1.2) { if (medidas.n / medidas.soma < 36) ligarLeve(true); medidas.n = 0; medidas.soma = 0; }
      }
      medidas.ult = ts;
    }
    function ligarLeve(v) {
      leve = !!v; dprMax = leve ? 1 : 2; raiz.classList.toggle('jt-bol2-leve', leve); medir();
    }
    function aoVisibilidade() {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; if (tensao.audio) tensao.audio.pause(); }
      else if (vivo && !raf) { ultimo = 0; sujo = true; raf = requestAnimationFrame(laco); if (tensao.ativa && tensao.audio) { var pr = tensao.audio.play(); if (pr && pr.catch) pr.catch(function () {}); } }
    }
    document.addEventListener('visibilitychange', aoVisibilidade);
    var obs = null;
    function aoRedimensionar() { var r = palco.getBoundingClientRect(); if (Math.round(r.width) !== Lt.W || Math.round(r.height) !== Lt.H) medir(); }
    if (window.ResizeObserver) { obs = new ResizeObserver(aoRedimensionar); obs.observe(palco); } else window.addEventListener('resize', aoRedimensionar);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fontesProntas = true; if (vivo) desenharFundo(); });
    // aparelho lento (tablet velho)? um teste de meio segundo de pintura decide o modo leve antes de pintar o estúdio
    (function () {
      var ms = 1e9;
      for (var k = 0; k < 2; k++) {
        var t0 = performance.now(), cv = novoCanvas(200, 200), g = cv.getContext('2d');
        for (var i = 0; i < 40; i++) { var gr = g.createRadialGradient(100, 100, 0, 100, 100, 100); gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.fillRect(0, 0, 200, 200); }
        g.getImageData(0, 0, 1, 1); ms = Math.min(ms, performance.now() - t0);
      }
      if (ms > 14) { leve = true; dprMax = 1; raiz.classList.add('jt-bol2-leve'); }
    })();
    medir();
    telaInicio();
    raf = requestAnimationFrame(laco);

    if (ctx.teste) window.BolinhasDebug = {
      estado: function () {
        return { modalidade: G.mod, etapa: G.etapa, saldo: G.saldo, rodada: G.rodada, acertos: G.acertos, marcas: G.marcas.slice(),
          bolas: mundo.bolas.length, caindo: mundo.bolas.filter(function (b) { return b.espera <= 0 && !b.pousou; }).length,
          cores: mundo.bolas.map(function (b) { return b.cor; }), resposta: G.resposta, certa: G.perg ? G.perg.c : null,
          opcoes: G.perg ? G.perg.o.length : 0, zonas: G.zonas.slice(), timers: timers.length, semente: semente, nivel: nivel, tensao: tensao.ativa };
      },
      comecar: function (m) { comecar(m || 'queda'); },
      velocidade: function (v) { vel = v || 1; },
      responder: function (i) { if (G.mod === 'calma') responderCalma(i); else responderQueda(i); },
      responderCerto: function () { if (G.perg) BolinhasDebug.responder(G.perg.c); },
      responderErrado: function () { if (G.perg) BolinhasDebug.responder((G.perg.c + 1) % G.perg.o.length); },
      zona: function (z) { colocarZona(z); },
      desfazer: function () { desfazerZona(); },
      camera: function () {
        return { x: cam.x, y: cam.y, z: cam.z, escala: escala, lenta: escala < 0.75, plano: tipoPlano, pips: pips.length, aberto: { x: CAM0.x, y: CAM0.y },
          lider: camLider ? { x: camLider.x, y: camLider.y } : null, leve: leve, zoomPronto: !!cenZ };
      },
      leve: function (v, auto) { medidas.auto = auto !== false; ligarLeve(v); },
      pularCartao: function () { var b = cena.querySelector('[data-ok]'); if (G.etapa === 'cartao' && b) b.click(); }
    };

    return {
      parar: function () {
        vivo = false; cancelAnimationFrame(raf); clearTimeout(timerZ);
        if (tensao.audio) { tensao.audio.pause(); tensao.audio.src = ''; }
        if (tensao.pausouTrilha && window.Trilha && window.Trilha.continuar) window.Trilha.continuar();
        window.removeEventListener('keydown', aoTeclar);
        document.removeEventListener('visibilitychange', aoVisibilidade);
        if (obs) obs.disconnect(); else window.removeEventListener('resize', aoRedimensionar);
        if (ctx.teste) try { delete window.BolinhasDebug; } catch (e) { window.BolinhasDebug = undefined; }
        if (raiz.parentNode) raiz.parentNode.removeChild(raiz);
      }
    };
  }

  (window.JogotecaJogos = window.JogotecaJogos || []).push({
    id: 'bolinhas',
    ajuda: function (t) {
      return '<p>' + t('Um game show numa parede gigante de pinos! As bolinhas ficam <b>verdes</b> quando você acerta (somam o valor da canaleta onde caem) e <b>vermelhas</b> quando erra (descontam; o saldo nunca fica abaixo de zero).',
        'A game show on a giant wall of pegs! The balls turn <b>green</b> when you get it right (they add the value of the slot they land in) and <b>red</b> when you get it wrong (they take it away; the balance never goes below zero).',
        '¡Un concurso en una pared gigante de clavos! Las bolitas se vuelven <b>verdes</b> cuando aciertas (suman el valor de la casilla donde caen) y <b>rojas</b> cuando fallas (lo restan; el saldo nunca baja de cero).') + '</p>' +
        '<p><b>⏱ ' + t('Queda Livre', 'Free Fall', 'Caída Libre') + ':</b> ' + t('5 perguntas de 2 opções. Três bolinhas brancas caem das zonas 1, 4 e 7: responda antes que a primeira chegue lá embaixo. Sem resposta, vale como erro.',
          '5 questions with 2 options. Three white balls drop from zones 1, 4 and 7: answer before the first one reaches the bottom. No answer counts as wrong.',
          '5 preguntas de 2 opciones. Tres bolitas blancas caen de las zonas 1, 4 y 7: responde antes de que la primera llegue abajo. Sin respuesta, cuenta como fallo.') + '</p>' +
        '<p><b>🧘 ' + t('Sem pressa', 'No Rush', 'Sin prisa') + ':</b> ' + t('5 perguntas de 4 opções, sem relógio. Leia a pergunta, toque em 3 zonas lá no alto (pode repetir a mesma; ↩ desfaz) e depois responda. O centro vale mais e as pontas arriscam menos.',
          '5 questions with 4 options, no clock. Read the question, tap 3 zones at the top (you can repeat one; ↩ undoes) and then answer. The middle pays more and the edges risk less.',
          '5 preguntas de 4 opciones, sin reloj. Lee la pregunta, toca 3 zonas de arriba (puedes repetir la misma; ↩ deshace) y luego responde. El centro vale más y los lados arriesgan menos.') + '</p>' +
        '<p>' + t('O nível muda as perguntas (e, na Queda Livre, o tempo para ler). Teclado ou controle da TV: ← → passam pelas zonas ou pelas opções, OK confirma e ⌫ desfaz a zona. O botão «+ −» põe + e − dentro das bolinhas.',
          'The level changes the questions (and, in Free Fall, the reading time). Keyboard or TV remote: ← → move through the zones or the options, OK confirms and ⌫ undoes a zone. The «+ −» button puts + and − inside the balls.',
          'El nivel cambia las preguntas (y, en la Caída Libre, el tiempo para leer). Teclado o mando de la tele: ← → recorren las zonas o las opciones, OK confirma y ⌫ deshace la zona. El botón «+ −» pone + y − dentro de las bolitas.') + '</p>';
    },
    iniciar: iniciar,
    logica: { VALORES: VALORES, MODALIDADES: MODALIDADES, GEO: GEO, FIS: FIS, CATEGORIAS: CATEGORIAS, aplicarBola: aplicarBola, aplicarLote: aplicarLote,
      corDaResposta: corDaResposta, tempoDeLeitura: tempoDeLeitura, adicionarZona: adicionarZona, zonasProntas: zonasProntas,
      criarSorte: criarSorte, sortearPergunta: sortearPergunta, prepararPergunta: prepararPergunta,
      criarMundo: criarMundo, soltar: soltar, passoMundo: passoMundo, simularQueda: simularQueda, dinheiro: dinheiro, zonaX: zonaX }
  });
})();
