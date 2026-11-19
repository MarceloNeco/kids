/* Bolinhas da Angústia (Nail-Biter Drop / Bolitas de la Angustia) — jogo da Jogoteca (Bolinho de Chuva · SolverONE · kids).
   Game show de perguntas numa parede gigante de pinos (mecânica Plinko, livre; nome, arte, sons e personagens próprios).
   Especificação do dono: jogoteca/BOLINHAS-ESPECIFICACAO.md. Perguntas: jogos/bolinhas-perguntas.js.
   Modos: Solo + Parceiro (principal: você no Palco, um parceiro virtual com afinidades na Sala de Isolamento) e Dois na mesma tela
   (um no Palco, o outro na Sala; o aparelho passa de mão com a tela "não olhe!").
   Fases: 1 Queda Livre (5 perguntas de 2 opções, 3 brancas das zonas 1, 4 e 7, travar antes da 1ª cair) · 2 A Separação (2 verdes
   grátis, 3 perguntas de 3 opções, Duplo na 2ª e Triplo na 3ª, 2 vermelhas obrigatórias) · 3 Tudo ou Nada (4 verdes, 4 opções,
   4 vermelhas) · Contrato (assinar ou rasgar) e a revelação lado a lado.
   Física própria e leve (círculo com círculo, passo fixo de 1/120 s), sem biblioteca: pinos em grade intercalada, divisórias de
   pontas redondas, sensor no fundo de cada canaleta e empurrãozinho se a bolinha parar. A restituição de um choque é o produto das
   duas (bolinha 0,6 × pino 0,75 = 0,45; bolinha com parede 0,6), com gravidade calibrada para a queda durar ~5,7 s.
   Desenho em <canvas> (só a parede, com o cenário fixo pintado uma vez) e o resto em DOM. O laço só desenha quando algo se mexe.
   A lógica pura fica em logica.* para os testes no Node (jogoteca/teste/bolinhas.test.js).
   Com ctx.teste: semente fixa (?semente=N, padrão 7) e window.BolinhasDebug (estado, comecar, velocidade, responder, zona, soltar…). */
(function () {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ======================= regras (lógica pura) ======================= */
  var VALORES = {
    1: [1, 500, 100, 2000, 10, 1000, 5, 10000, 1, 5000, 10, 2500, 100, 1500, 1],
    2: [1, 2500, 500, 10000, 50, 5000, 25, 50000, 1, 25000, 50, 12500, 500, 7500, 1],
    3: [1, 10000, 2500, 50000, 250, 25000, 100, 150000, 1, 75000, 250, 35000, 2500, 15000, 1]
  };
  var BONUS = { 2: 5000, 3: 10000 };
  var VERDES = { 2: 2, 3: 4 }, OPCOES = { 1: 2, 2: 3, 3: 4 }, PERGUNTAS = { 1: 5, 2: 3, 3: 3 };
  // verde soma; vermelha subtrai, e o saldo nunca fica abaixo de zero
  function aplicarBola(saldo, valor, cor) { return cor === 'verde' ? saldo + valor : Math.max(0, saldo - valor); }
  function valorContrato(saldoF1, acertosF2, acertosF3) { return saldoF1 + acertosF2 * BONUS[2] + acertosF3 * BONUS[3]; }
  // quantas bolinhas cai na pergunta k (0, 1, 2) das Fases 2 e 3: Duplo na 2ª, Triplo na 3ª (se o Palco quiser)
  function multiplicadores(k) { return k === 1 ? [1, 2] : k === 2 ? [1, 3] : [1]; }

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
  var ORDEM_CAT = ['historia', 'geografia', 'ciencias', 'animais', 'esportes', 'cinema', 'musica', 'comida', 'linguas', 'corpo'];

  // parceiros virtuais (arte e nomes próprios): afinidade de 0,2 a 0,95 por categoria
  var PERSONAGENS = [
    { id: 'zuza', nome: 'Vovó Zuza', pele: '#f3cba5', cabelo: '#f4f1ec', estilo: 'coque', extra: 'oculos', fundo: '#ff7ab8',
      af: { historia: 0.9, geografia: 0.55, ciencias: 0.4, animais: 0.6, esportes: 0.2, cinema: 0.35, musica: 0.8, comida: 0.95, linguas: 0.6, corpo: 0.55 } },
    { id: 'teo', nome: 'Téo', pele: '#8d5a32', cabelo: '#1d140e', estilo: 'cachos', extra: 'fone', fundo: '#3ad1ff',
      af: { historia: 0.3, geografia: 0.45, ciencias: 0.95, animais: 0.9, esportes: 0.55, cinema: 0.8, musica: 0.4, comida: 0.5, linguas: 0.35, corpo: 0.6 } },
    { id: 'bia', nome: 'Bia', pele: '#e6b07a', cabelo: '#6b3a1c', estilo: 'rabo', extra: 'faixa', fundo: '#7dff9b',
      af: { historia: 0.4, geografia: 0.7, ciencias: 0.5, animais: 0.6, esportes: 0.95, cinema: 0.45, musica: 0.25, comida: 0.5, linguas: 0.35, corpo: 0.85 } },
    { id: 'rubens', nome: 'Tio Rubens', pele: '#c98a55', cabelo: '#3a2618', estilo: 'careca', extra: 'bigode', fundo: '#ffc94a',
      af: { historia: 0.7, geografia: 0.9, ciencias: 0.3, animais: 0.45, esportes: 0.6, cinema: 0.4, musica: 0.5, comida: 0.8, linguas: 0.85, corpo: 0.3 } },
    { id: 'luna', nome: 'Luna', pele: '#ffd9bf', cabelo: '#9b5cff', estilo: 'lisa', extra: 'brinco', fundo: '#c58bff',
      af: { historia: 0.35, geografia: 0.4, ciencias: 0.5, animais: 0.7, esportes: 0.2, cinema: 0.9, musica: 0.95, comida: 0.55, linguas: 0.7, corpo: 0.45 } }
  ];
  // fácil: parceiro mais forte; difícil: mais fraco (sempre entre 0,2 e 0,95)
  function afinidades(p, nivel) {
    var aj = nivel === 'facil' ? 0.1 : nivel === 'dificil' ? -0.1 : 0, r = {};
    ORDEM_CAT.forEach(function (c) { r[c] = Math.round(clamp(p.af[c] + aj, 0.2, 0.95) * 100) / 100; });
    return r;
  }

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
  // parceiro virtual: sabe com chance = afinidade (menos nas difíceis); sabendo, acerta com certeza alta; senão chuta
  function iaResponder(af, p, sorte) {
    var a = af[p.cat] || 0.5, fd = p.d === 3 ? 0.7 : p.d === 2 ? 0.85 : 1;
    if (sorte() < a * fd) return { indice: p.c, confianca: 0.7 + 0.25 * sorte(), sabia: true };
    return { indice: Math.floor(sorte() * p.o.length), confianca: 0.15 + 0.3 * sorte(), sabia: false };
  }
  // no Contrato o parceiro não sabe o saldo: muita certeza nas respostas → rasga; muito chute → assina
  function iaContrato(confiancas, sorte) {
    if (!confiancas.length) return 'assinar';
    var m = 0; confiancas.forEach(function (c) { m += c; }); m /= confiancas.length;
    return m + (sorte() - 0.5) * 0.12 >= 0.6 ? 'rasgar' : 'assinar';
  }

  /* ======================= física (lógica pura, unidades do mundo: a parede tem 750 × 1050) ======================= */
  var GEO = { W: 750, H: 1050, RB: 12, RP: 5, Y0: 130, DY: 50, FILAS: 15, YDIV: 900, RDIV: 3.5, SENSOR: 1000, CHAO: 1045, Y_SOLTA: 50,
    ZONAS: 7, CANALETAS: 15, LARG: 50 };
  var FIS = { g: 1000, arrasto: 0.5, arrastoX: 1, vmax: 600, eBola: 0.6, ePino: 0.75 };
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
    '.jt-bol2-aura{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .5s,background .5s}' +
    '.jt-bol2.tensao .jt-bol2-aura{opacity:.55;background:radial-gradient(80% 60% at 50% 55%,rgba(255,170,40,.0) 30%,rgba(255,150,30,.55) 100%)}' +
    '.jt-bol2.verde .jt-bol2-aura{opacity:.7;background:radial-gradient(80% 60% at 50% 55%,rgba(30,255,140,0) 30%,rgba(20,220,120,.55) 100%)}' +
    '.jt-bol2.vermelho .jt-bol2-aura{opacity:.75;background:radial-gradient(80% 60% at 50% 55%,rgba(255,30,70,0) 30%,rgba(200,10,50,.65) 100%)}' +
    '.jt-bol2-aura.bate{animation:jtb2Bate .42s ease-out}' +
    '@keyframes jtb2Bate{0%{filter:brightness(1)}18%{filter:brightness(1.9)}40%{filter:brightness(1.1)}55%{filter:brightness(1.6)}100%{filter:brightness(1)}}' +
    '.jt-bol2-parede{position:absolute;border-radius:16px;box-shadow:0 0 0 2px rgba(120,220,255,.35),0 0 40px rgba(60,170,255,.35),0 0 90px rgba(123,60,255,.35)}' +
    '.jt-bol2-parede canvas{display:block;width:100%;height:100%;border-radius:16px;touch-action:none;outline:none}' +
    '.jt-bol2-hud,.jt-bol2-painel{position:absolute;box-sizing:border-box;display:flex;flex-direction:column}' +
    '.jt-bol2-hud{gap:8px}.deitado .jt-bol2-hud{justify-content:center;align-items:center;gap:14px}.deitado .jt-bol2-hud>*{width:100%;max-width:440px}' +
    '.deitado .jt-bol2-parc{max-width:440px}.deitado .jt-bol2-mini{width:auto}' +
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
    '.jt-bol2-parc{display:flex;align-items:center;gap:8px;padding:4px 10px 4px 4px;border-radius:999px;border:1.5px solid rgba(140,220,255,.45);' +
    'background:rgba(8,14,60,.7);color:#eaf6ff;font:600 14px/1.1 Fredoka,system-ui,sans-serif;text-align:left;min-height:44px;flex:0 0 auto;max-width:46%}' +
    '.jt-bol2-parc canvas{width:40px;height:40px;border-radius:50%;flex:0 0 auto;background:#223}' +
    '.jt-bol2-parc b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.jt-bol2-parc small{display:block;font-size:12px;opacity:.85;white-space:nowrap}' +
    '.jt-bol2-parc.pensa small::after{content:"";display:inline-block;width:1.2em;text-align:left;animation:jtb2Pontos 1s steps(4) infinite}' +
    '@keyframes jtb2Pontos{0%{content:""}25%{content:"."}50%{content:".."}75%{content:"..."}}' +
    '.jt-bol2-mini{min-width:44px;min-height:44px;border-radius:999px;border:2px solid #7fdcff;background:rgba(8,14,60,.8);color:#eaf6ff;font:700 22px/1 Fredoka,system-ui,sans-serif;padding:0 10px;flex:0 0 auto}' +
    '.jt-bol2-mini[aria-pressed="true"]{background:#fff;color:#0a0b3a}' +
    '.jt-bol2-afin{display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;font-size:13px}' +
    '.jt-bol2-afin div{display:flex;align-items:center;gap:5px;min-width:0}' +
    '.jt-bol2-afin span.n{flex:0 0 auto;width:1.4em;text-align:center}' +
    '.jt-bol2-afin span.b{flex:1 1 auto;height:8px;border-radius:5px;background:rgba(255,255,255,.14);overflow:hidden;position:relative}' +
    '.jt-bol2-afin span.b i{position:absolute;left:0;top:0;bottom:0;border-radius:5px;background:linear-gradient(90deg,#ff3b5c,#ffc23a 45%,#2dff88)}' +
    '.jt-bol2-afin em{font-style:normal;width:2.2em;text-align:right;opacity:.85;font-size:12px}' +
    '.jt-bol2-afin div.agora{background:rgba(127,220,255,.18);border-radius:6px;box-shadow:0 0 0 1px #7fdcff}' +
    '.jt-bol2-pop{position:absolute;z-index:6;padding:10px 12px;border-radius:16px;background:rgba(10,14,60,.96);border:1.5px solid #7fdcff;box-shadow:0 10px 30px rgba(0,0,0,.5)}' +
    '.jt-bol2-pop h3{margin:0 0 6px;font-size:15px;color:#9fe9ff}' +
    '.jt-bol2-cartaop{padding:10px;border-radius:16px;background:rgba(8,14,60,.55);border:1.5px solid rgba(140,220,255,.3)}' +
    '.jt-bol2-cartaop h3{margin:0 0 6px;font-size:15px;color:#9fe9ff;font-weight:600}' +
    '.jt-bol2-painel{gap:6px;padding:6px 10px calc(8px + env(safe-area-inset-bottom,0px));align-items:stretch;justify-content:flex-start;overflow-y:auto}' +
    '.deitado .jt-bol2-painel{justify-content:center}' +
    '.jt-bol2-painel>*{width:100%;max-width:560px;margin:0 auto;flex-shrink:0}.deitado .jt-bol2-saldo{flex:0 0 auto}' +
    '.jt-bol2-msg{margin:0;font-size:15px;font-weight:600;text-align:center;color:#ffe08a;min-height:1.2em;line-height:1.2}' +
    '.jt-bol2-cat{display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;flex-wrap:wrap}' +
    '.jt-bol2-chip{padding:3px 10px;border-radius:999px;background:rgba(127,220,255,.16);border:1px solid rgba(127,220,255,.6);font-weight:600}' +
    '.jt-bol2-cat .forca{font-weight:600}' +
    '.jt-bol2-perg{margin:0;font-size:18px;font-weight:600;text-align:center;line-height:1.25;color:#fff}' +
    '.jt-bol2-ops{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
    '.jt-bol2-ops.n3{grid-template-columns:1fr}.jt-bol2-ops.jt-bol2-so.n3{grid-template-columns:1fr 1fr 1fr}.jt-bol2-ops.jt-bol2-so .jt-bol2-op{padding:4px 6px;gap:5px;font-size:14px}' +
    '.jt-bol2-op{position:relative;display:flex;align-items:center;gap:8px;min-height:48px;padding:6px 10px;border-radius:14px;border:2px solid rgba(127,220,255,.55);' +
    'background:linear-gradient(180deg,rgba(40,70,190,.55),rgba(20,24,90,.75));color:#fff;font:600 16px/1.15 Fredoka,system-ui,sans-serif;text-align:left;box-shadow:0 0 14px rgba(60,170,255,.18)}' +
    '.jt-bol2-op .l{flex:0 0 auto;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#7fdcff;color:#081a66;font-weight:700;font-size:14px}' +
    '.jt-bol2-op:disabled{cursor:default}' +
    '.jt-bol2-op.so{min-height:36px;opacity:.95}.jt-bol2-ops.jt-bol2-so .l{width:22px;height:22px;font-size:12px}' +
    '.jt-bol2-op.trava{border-color:#ffc23a;box-shadow:0 0 0 2px #ffc23a,0 0 20px rgba(255,194,58,.6);background:linear-gradient(180deg,#7a4a00,#3e2400)}' +
    '.jt-bol2-op.certa{border-color:#2dff88;box-shadow:0 0 0 2px #2dff88,0 0 22px rgba(45,255,136,.6);background:linear-gradient(180deg,#0b7a43,#063d22)}' +
    '.jt-bol2-op.errada{border-color:#ff3b5c;box-shadow:0 0 0 2px #ff3b5c,0 0 22px rgba(255,59,92,.55);background:linear-gradient(180deg,#8a0f26,#430713)}' +
    '.jt-bol2-op.apagada{opacity:.45}' +
    '.jt-bol2-op .quem{margin-left:auto;font-size:12px;font-weight:600;padding:2px 7px;border-radius:999px;background:rgba(0,0,0,.35)}' +
    '.jt-bol2-acoes{display:flex;gap:8px;align-items:stretch;justify-content:center;flex-wrap:wrap}' +
    '.jt-bol2-seg{display:flex;border-radius:999px;border:2px solid rgba(127,220,255,.6);overflow:hidden}' +
    '.jt-bol2-seg button{border:0;background:transparent;color:#eaf6ff;min-height:44px;padding:0 12px;font:600 15px/1 Fredoka,system-ui,sans-serif}' +
    '.jt-bol2-seg button+button{border-left:2px solid rgba(127,220,255,.6)}' +
    '.jt-bol2-seg button[aria-pressed="true"]{background:#ffc23a;color:#3a2300}' +
    '.jt-bol2-btn{min-height:48px;padding:0 22px;border-radius:999px;border:0;font:700 19px/1 Fredoka,system-ui,sans-serif;color:#081a3a;' +
    'background:linear-gradient(180deg,#9ff3ff,#3fd0ff 55%,#2a8cff);box-shadow:0 4px 0 #1846a8,0 0 22px rgba(63,208,255,.55)}' +
    '.jt-bol2-btn:active{transform:translateY(3px);box-shadow:0 1px 0 #1846a8}' +
    '.jt-bol2-btn:disabled{filter:grayscale(.8) brightness(.7);box-shadow:none}' +
    '.jt-bol2-btn.ouro{background:linear-gradient(180deg,#ffe58a,#ffc23a 55%,#ff9420);box-shadow:0 4px 0 #a85a0c,0 0 22px rgba(255,194,58,.55);color:#3a2300}' +
    '.jt-bol2-btn.rosa{background:linear-gradient(180deg,#ffb3d6,#ff5fa8 55%,#d6247a);box-shadow:0 4px 0 #8a0f4f,0 0 22px rgba(255,95,168,.5);color:#3a0020}' +
    '.jt-bol2 button:focus-visible{outline:3px solid #ffe08a;outline-offset:2px}' +
    '.jt-bol2-fala{position:absolute;z-index:4;max-width:240px;padding:8px 12px;border-radius:14px;background:#fff;color:#14104a;font:600 15px/1.2 Fredoka,system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.4);pointer-events:none}' +
    '.jt-bol2-fala::before{content:"";position:absolute;left:18px;top:-8px;border:8px solid transparent;border-top:0;border-bottom-color:#fff}' +
    '.jt-bol2-cena{position:absolute;inset:0;z-index:8;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;overflow:auto;' +
    'background:radial-gradient(100% 80% at 50% 30%,rgba(30,50,160,.9),rgba(6,8,36,.96))}' +
    '.jt-bol2-cena.vidro{background:rgba(4,6,30,.72)}' +
    '@media (orientation:landscape) and (max-height:560px){.jt-bol2-caixa.larga .jt-bol2-logo span{display:inline;margin-left:.25em}.jt-bol2-modo{padding:6px}.jt-bol2-modo small{font-size:12px}}' +
    '@media (min-width:1400px) and (min-height:800px){.jt-bol2-perg{font-size:26px}.jt-bol2-op{font-size:20px;min-height:58px}.jt-bol2-ops.jt-bol2-so .jt-bol2-op{font-size:18px}' +
    '.jt-bol2-msg{font-size:19px}.jt-bol2-cat{font-size:17px}.jt-bol2-btn{min-height:58px;font-size:23px}.jt-bol2-seg button{min-height:52px;font-size:18px}' +
    '.jt-bol2-fase{font-size:17px}.jt-bol2-parc{font-size:17px}.jt-bol2-afin{font-size:16px}.jt-bol2-caixa{width:min(680px,100%)}}' +
    '.jt-bol2-caixa{width:min(560px,100%);max-height:100%;box-sizing:border-box;margin:auto;padding:16px;border-radius:22px;text-align:center;display:flex;flex-direction:column;gap:10px;' +
    'background:linear-gradient(180deg,rgba(28,46,150,.92),rgba(22,12,70,.95));border:2px solid rgba(127,220,255,.55);box-shadow:0 0 40px rgba(60,170,255,.35),0 18px 40px rgba(0,0,0,.5)}' +
    '.jt-bol2-caixa h2{margin:0;font-size:24px;color:#fff;line-height:1.1}' +
    '.jt-bol2-caixa p{margin:0;font-size:16px;line-height:1.3}' +
    '.jt-bol2-logo{margin:0;font-weight:700;font-size:clamp(30px,8vw,46px);line-height:.95;color:#fff;letter-spacing:.5px;' +
    'text-shadow:0 0 8px #3fd0ff,0 0 22px #3fd0ff,0 0 44px #7b3cff}' +
    '.jt-bol2-logo span{display:block;color:#ff9be0;text-shadow:0 0 8px #ff5fd0,0 0 22px #ff5fd0,0 0 44px #7b3cff}' +
    '.jt-bol2-modos{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '.jt-bol2-modo{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 8px;border-radius:16px;border:2px solid rgba(127,220,255,.4);background:rgba(8,14,60,.6);color:#eaf6ff;font:600 15px/1.2 Fredoka,system-ui,sans-serif}' +
    '.jt-bol2-modo b{font-size:17px}.jt-bol2-modo small{font-size:13px;opacity:.85;font-weight:500}' +
    '.jt-bol2-modo .ic{font-size:30px;line-height:40px;height:44px}' +
    '.jt-bol2-modo canvas{width:44px;height:44px;border-radius:50%}' +
    '.jt-bol2-modo[aria-pressed="true"]{border-color:#ffc23a;box-shadow:0 0 0 2px #ffc23a,0 0 22px rgba(255,194,58,.45);background:rgba(60,40,10,.55)}' +
    '.jt-bol2-perfil{display:flex;flex-direction:column;gap:6px;padding:10px;border-radius:16px;background:rgba(0,0,0,.25);text-align:left}' +
    '.jt-bol2-perfil .jt-bol2-ptopo{display:flex;align-items:center;gap:10px}' +
    '.jt-bol2-perfil .jt-bol2-ptopo b{font-size:18px;flex:1 1 auto}' +
    '.jt-bol2-perfil .jt-bol2-ptopo canvas{width:52px;height:52px;border-radius:50%}' +
    '@media (orientation:landscape) and (max-height:560px){.jt-bol2-caixa.larga{width:min(860px,100%);display:grid;grid-template-columns:1fr 1fr;align-items:start;text-align:center}' +
    '.jt-bol2-caixa.larga>.cheia{grid-column:1/-1}.jt-bol2-caixa{padding:12px;gap:8px}.jt-bol2-caixa h2{font-size:21px}.jt-bol2-logo{font-size:30px}}' +
    '.jt-bol2-fasecard{animation:jtb2Entra .5s cubic-bezier(.2,1.3,.4,1)}' +
    '.jt-bol2-fasecard .num{font-size:15px;letter-spacing:3px;text-transform:uppercase;color:#9fe9ff}' +
    '.jt-bol2-fasecard h2{font-size:clamp(30px,8vw,48px);text-shadow:0 0 10px #3fd0ff,0 0 30px #7b3cff}' +
    '@keyframes jtb2Entra{0%{transform:scale(.6);opacity:0}100%{transform:scale(1);opacity:1}}' +
    '.jt-bol2-cortina{background:repeating-linear-gradient(90deg,#3a0f6e 0 26px,#2a0a52 26px 52px)}' +
    '.jt-bol2-cortina .jt-bol2-caixa{background:rgba(10,6,40,.92)}' +
    '.jt-bol2-cortina .olho{font-size:56px;line-height:1}' +
    '.jt-bol2-papel{position:relative;width:min(330px,86%);margin:4px auto;padding:18px 18px 22px;border-radius:6px;color:#2a1a08;text-align:center;' +
    'background:linear-gradient(180deg,#fff8e6,#f3e2b8);box-shadow:0 10px 30px rgba(0,0,0,.45);font-family:Georgia,"Times New Roman",serif}' +
    '.jt-bol2-papel::before{content:"";position:absolute;inset:6px;border:2px double #b8862f;border-radius:4px;pointer-events:none}' +
    '.jt-bol2-papel h3{margin:0 0 4px;font-size:22px;letter-spacing:4px;color:#7a4a0c}' +
    '.jt-bol2-papel p{font-size:14px;margin:0 0 6px}' +
    '.jt-bol2-papel .valor{font-size:34px;font-weight:700;color:#14104a;margin:6px 0 10px;font-family:Fredoka,system-ui,sans-serif}' +
    '.jt-bol2-papel .linha{height:2px;background:#7a5a2a;margin:18px 30px 2px;opacity:.6}' +
    '.jt-bol2-papel svg{position:absolute;left:24%;width:52%;bottom:20px;height:44px;overflow:visible}' +
    '.jt-bol2-papel svg path{fill:none;stroke:#1b2a8f;stroke-width:3;stroke-linecap:round;stroke-dasharray:420;stroke-dashoffset:420}' +
    '.jt-bol2-papel.assina svg path{animation:jtb2Assina 1.4s ease-in-out forwards}' +
    '@keyframes jtb2Assina{to{stroke-dashoffset:0}}' +
    '.jt-bol2-papel .caneta{position:absolute;font-size:30px;bottom:30px;left:20%;opacity:0}' +
    '.jt-bol2-papel.assina .caneta{animation:jtb2Caneta 1.4s ease-in-out forwards}' +
    '@keyframes jtb2Caneta{0%{opacity:1;transform:translate(0,0)}20%{transform:translate(40px,-8px)}40%{transform:translate(80px,6px)}60%{transform:translate(120px,-10px)}80%{transform:translate(160px,4px)}100%{opacity:0;transform:translate(190px,-4px)}}' +
    '.jt-bol2-rasgo{position:relative;width:min(330px,86%);margin:4px auto;height:230px}' +
    '.jt-bol2-rasgo .jt-bol2-papel{position:absolute;inset:0;width:auto;margin:0}' +
    '.jt-bol2-rasgo .esq{clip-path:polygon(0 0,52% 0,47% 14%,54% 28%,46% 43%,53% 58%,45% 72%,52% 86%,47% 100%,0 100%)}' +
    '.jt-bol2-rasgo .dir{clip-path:polygon(52% 0,100% 0,100% 100%,47% 100%,52% 86%,45% 72%,53% 58%,46% 43%,54% 28%,47% 14%)}' +
    '.jt-bol2-rasgo.rasga .esq{animation:jtb2RasgaE 1s ease-in forwards}.jt-bol2-rasgo.rasga .dir{animation:jtb2RasgaD 1s ease-in forwards}' +
    '@keyframes jtb2RasgaE{30%{transform:translate(-6px,0) rotate(-3deg)}100%{transform:translate(-64px,12px) rotate(-13deg);opacity:.9}}' +
    '@keyframes jtb2RasgaD{30%{transform:translate(6px,0) rotate(3deg)}100%{transform:translate(64px,16px) rotate(11deg);opacity:.9}}' +
    '.jt-bol2-calmo .jt-bol2-papel.assina svg path{animation-duration:.01s}.jt-bol2-calmo .jt-bol2-rasgo.rasga .esq,.jt-bol2-calmo .jt-bol2-rasgo.rasga .dir{animation-duration:.01s}' +
    '.jt-bol2-caixa [data-pensa]{position:relative;z-index:3;align-self:center;padding:4px 14px;border-radius:999px;background:rgba(6,8,36,.85);font-weight:600;color:#ffe08a}' +
    '.jt-bol2-decide{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}' +
    '.jt-bol2-lado{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '.jt-bol2-lado>div{padding:12px 8px;border-radius:16px;background:rgba(0,0,0,.3);border:2px solid rgba(127,220,255,.35);display:flex;flex-direction:column;gap:4px;align-items:center}' +
    '.jt-bol2-lado>div.leva{border-color:#ffc23a;box-shadow:0 0 0 2px #ffc23a,0 0 28px rgba(255,194,58,.55);background:rgba(70,45,5,.55)}' +
    '.jt-bol2-lado small{font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:#9fe9ff}' +
    '.jt-bol2-lado strong{font-size:clamp(22px,6vw,34px);color:#fff;text-shadow:0 0 12px rgba(80,220,255,.8);white-space:nowrap}' +
    '.jt-bol2-lado em{font-style:normal;font-size:13px;font-weight:600;color:#ffe08a;min-height:1.2em}' +
    '.jt-bol2-final{font-size:22px;font-weight:700;color:#ffe08a}' +
    '.jt-bol2-carimbo{display:inline-block;margin:0 auto;padding:4px 14px;border:3px solid currentColor;border-radius:8px;font-weight:700;letter-spacing:2px;transform:rotate(-6deg);font-size:20px}' +
    '.jt-bol2-carimbo.assinou{color:#2dff88}.jt-bol2-carimbo.rasgou{color:#ff5f7a}' +
    '.jt-bol2-revela .jt-bol2-lado>div{animation:jtb2Entra .6s cubic-bezier(.2,1.3,.4,1) both}.jt-bol2-revela .jt-bol2-lado>div+div{animation-delay:.35s}' +
    '@media (prefers-reduced-motion:reduce){.jt-bol2-aura.bate,.jt-bol2-fasecard,.jt-bol2-revela .jt-bol2-lado>div,.jt-bol2-odo.sobe,.jt-bol2-odo.desce{animation:none}}' +
    '@media (max-height:520px){.jt-bol2-perg{font-size:16px}.jt-bol2-op{min-height:42px;font-size:15px}.jt-bol2-btn{min-height:44px;font-size:17px}.jt-bol2-msg{font-size:14px}}';
  function injetarEstilo() {
    if (document.getElementById('jt-bolinhas-css')) return;
    var s = document.createElement('style'); s.id = 'jt-bolinhas-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ======================= rostos dos parceiros (canvas) ======================= */
  var TINTA = '#1d1a2e';
  function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }
  function elip(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, Math.PI * 2); }
  function pinta(c, cor, lw) { c.fillStyle = cor; c.fill(); if (lw) { c.lineWidth = lw; c.strokeStyle = TINTA; c.stroke(); } }
  function desenharRosto(cv, p, px) {
    var dpr = Math.min(2, window.devicePixelRatio || 1), n = Math.round(px * dpr), c;
    cv.width = n; cv.height = n; c = cv.getContext('2d');
    c.save(); c.scale(n / 100, n / 100);
    circ(c, 50, 50, 50); c.fillStyle = p.fundo; c.fill();
    c.save(); circ(c, 50, 50, 49); c.clip();
    c.translate(50, 54);
    var h = p.cabelo;
    if (p.estilo === 'coque') { circ(c, 0, -40, 13); pinta(c, h, 3); }
    if (p.estilo === 'rabo') { c.beginPath(); c.moveTo(22, -20); c.quadraticCurveTo(46, -18, 40, 18); c.quadraticCurveTo(32, 0, 18, -6); c.closePath(); pinta(c, h, 3); }
    if (p.estilo === 'lisa') { c.beginPath(); c.moveTo(-34, -10); c.quadraticCurveTo(-40, 30, -30, 44); c.lineTo(30, 44); c.quadraticCurveTo(40, 30, 34, -10); c.closePath(); pinta(c, h, 3); }
    // pescoço e roupa
    c.beginPath(); c.moveTo(-30, 50); c.quadraticCurveTo(0, 30, 30, 50); c.lineTo(30, 60); c.lineTo(-30, 60); c.closePath(); pinta(c, '#1d2a6b', 3);
    // orelhas e rosto
    circ(c, -27, 4, 7); pinta(c, p.pele, 3); circ(c, 27, 4, 7); pinta(c, p.pele, 3);
    elip(c, 0, 2, 26, 30); pinta(c, p.pele, 3.5);
    // cabelo por cima
    c.beginPath();
    if (p.estilo === 'coque' || p.estilo === 'rabo' || p.estilo === 'lisa') {
      c.moveTo(-27, -2); c.quadraticCurveTo(-26, -34, 0, -32); c.quadraticCurveTo(26, -34, 27, -2); c.quadraticCurveTo(16, -18, 2, -16); c.quadraticCurveTo(-14, -16, -27, -2);
      pinta(c, h, 3);
    } else if (p.estilo === 'cachos') {
      [[-22, -14], [-14, -26], [-2, -31], [11, -29], [21, -18], [26, -6], [-26, -2]].forEach(function (q) { circ(c, q[0], q[1], 10); pinta(c, h, 2.5); });
    } else if (p.estilo === 'careca') {
      c.moveTo(-27, 2); c.quadraticCurveTo(-30, -14, -20, -16); c.lineTo(-20, -6); c.closePath(); pinta(c, h, 2.5);
      c.beginPath(); c.moveTo(27, 2); c.quadraticCurveTo(30, -14, 20, -16); c.lineTo(20, -6); c.closePath(); pinta(c, h, 2.5);
      c.beginPath(); c.arc(-8, -18, 6, Math.PI * 1.1, Math.PI * 1.7); c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,255,255,.6)'; c.stroke();
    }
    // olhos, bochechas e boca
    elip(c, -10, 4, 3.6, 5); pinta(c, TINTA); elip(c, 10, 4, 3.6, 5); pinta(c, TINTA);
    circ(c, -9, 2.5, 1.3); pinta(c, '#fff'); circ(c, 11, 2.5, 1.3); pinta(c, '#fff');
    circ(c, -17, 14, 5); pinta(c, 'rgba(255,110,130,.4)'); circ(c, 17, 14, 5); pinta(c, 'rgba(255,110,130,.4)');
    if (p.extra === 'bigode') {
      c.beginPath(); c.moveTo(0, 15); c.quadraticCurveTo(-10, 10, -18, 19); c.quadraticCurveTo(-8, 18, 0, 19); c.quadraticCurveTo(8, 18, 18, 19); c.quadraticCurveTo(10, 10, 0, 15); pinta(c, h, 2);
      c.beginPath(); c.arc(0, 22, 6, 0.2 * Math.PI, 0.8 * Math.PI); c.lineWidth = 2.5; c.strokeStyle = TINTA; c.stroke();
    } else { c.beginPath(); c.arc(0, 14, 8, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 3; c.strokeStyle = TINTA; c.stroke(); }
    if (p.extra === 'oculos') {
      c.lineWidth = 2.6; c.strokeStyle = '#7a3dd0';
      circ(c, -10, 4, 8); c.stroke(); circ(c, 10, 4, 8); c.stroke();
      c.beginPath(); c.moveTo(-2, 4); c.lineTo(2, 4); c.stroke();
    } else if (p.extra === 'fone') {
      c.beginPath(); c.arc(0, -2, 33, Math.PI * 1.05, Math.PI * 1.95); c.lineWidth = 5; c.strokeStyle = '#ff4fa3'; c.stroke();
      elip(c, -30, 4, 6, 10); pinta(c, '#ff4fa3', 2.5); elip(c, 30, 4, 6, 10); pinta(c, '#ff4fa3', 2.5);
    } else if (p.extra === 'faixa') {
      c.beginPath(); c.moveTo(-27, -12); c.quadraticCurveTo(0, -24, 27, -12); c.lineTo(26, -5); c.quadraticCurveTo(0, -17, -26, -5); c.closePath(); pinta(c, '#ff3b5c', 2);
    } else if (p.extra === 'brinco') {
      c.fillStyle = '#ffd23f';
      [-28, 28].forEach(function (x) { c.beginPath(); c.moveTo(x, 10); c.lineTo(x + 3, 15); c.lineTo(x, 20); c.lineTo(x - 3, 15); c.closePath(); c.fill(); });
    }
    c.restore();
    circ(c, 50, 50, 48.5); c.lineWidth = 3; c.strokeStyle = TINTA; c.stroke();
    c.restore();
  }

  /* ======================= som (WebAudio próprio, respeitando o 🔊 da casca) ======================= */
  function criarSom(ctx) {
    var A = null, ruido = null, ultPlim = 0, plins = 0;
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
    function barulho(a, ini, dur, filtro, fq, vol, picos) {
      if (!ruido) {
        ruido = a.createBuffer(1, a.sampleRate, a.sampleRate);
        var d = ruido.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), n = a.currentTime + ini, k;
      s.buffer = ruido; f.type = filtro; f.frequency.value = fq; f.Q.value = 1.2;
      g.gain.setValueAtTime(0.0001, n);
      for (k = 0; k < picos.length; k++) { g.gain.linearRampToValueAtTime(vol * picos[k][1], n + picos[k][0] * dur); }
      g.gain.linearRampToValueAtTime(0.0001, n + dur);
      s.connect(f); f.connect(g); g.connect(a.destination); s.start(n); s.stop(n + dur + 0.05);
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
      comporta: function () { var a = ac(); if (!a) return; nota(a, 240, 0, 0.06, 'square', 0.03, 140); },
      caneta: function () { var a = ac(); if (!a) return; barulho(a, 0, 1.3, 'bandpass', 2600, 0.35, [[0.05, 1], [0.15, .2], [0.22, 1], [0.33, .2], [0.42, 1], [0.55, .3], [0.62, 1], [0.75, .2], [0.85, .9]]); },
      rasgo: function () { var a = ac(); if (!a) return; barulho(a, 0, 0.8, 'highpass', 1400, 0.5, [[0.05, .6], [0.12, 1], [0.2, .5], [0.3, 1], [0.42, .7], [0.55, 1], [0.7, .6], [0.85, .9]]); }
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
    function nomeFase(f) {
      return f === 1 ? t('Queda Livre', 'Free Fall', 'Caída Libre') : f === 2 ? t('A Separação', 'The Split', 'La Separación') :
        f === 3 ? t('Tudo ou Nada', 'All or Nothing', 'Todo o Nada') : t('O Contrato', 'The Contract', 'El Contrato');
    }
    injetarEstilo();

    /* ---------- DOM ---------- */
    var raiz = el('div', 'jt-bol2 calma' + (calmo ? ' jt-bol2-calmo' : ''));
    var aura = el('div', 'jt-bol2-aura');
    var hud = el('div', 'jt-bol2-hud');
    var parede = el('div', 'jt-bol2-parede');
    var tela = el('canvas'); tela.tabIndex = 0; tela.setAttribute('role', 'img');
    tela.setAttribute('aria-label', t('A parede de pinos. Toque numa zona do alto para escolher de onde a bolinha cai.',
      'The wall of pegs. Tap a zone at the top to choose where the ball drops.', 'La pared de clavos. Toca una zona de arriba para elegir desde dónde cae la bolita.'));
    parede.appendChild(tela);
    var painel = el('div', 'jt-bol2-painel');
    raiz.appendChild(aura); raiz.appendChild(parede); raiz.appendChild(hud); raiz.appendChild(painel);
    palco.appendChild(raiz);

    // HUD: placar (fase, bolinhas das perguntas, saldo gigante), parceiro e alto contraste
    var saldoBox = el('div', 'jt-bol2-saldo');
    var faseEl = el('div', 'jt-bol2-fase'); var faseNome = el('span'); var pontosEl = el('span', 'jt-bol2-pontos');
    faseEl.appendChild(faseNome); faseEl.appendChild(pontosEl);
    var odo = el('div', 'jt-bol2-odo' + (calmo ? ' calmo' : '')); odo.setAttribute('role', 'status');
    saldoBox.appendChild(faseEl); saldoBox.appendChild(odo);
    var parcBt = el('button', 'jt-bol2-parc'); parcBt.type = 'button';
    var parcCv = el('canvas'); var parcTxt = el('span'); parcBt.appendChild(parcCv); parcBt.appendChild(parcTxt);
    var contrasteBt = el('button', 'jt-bol2-mini', '<span aria-hidden="true">+ −</span>'); contrasteBt.type = 'button';
    contrasteBt.setAttribute('aria-label', t('Alto contraste: + e − dentro das bolinhas', 'High contrast: + and − inside the balls', 'Alto contraste: + y − dentro de las bolitas'));
    var cartaoParc = el('div', 'jt-bol2-cartaop'); var afinEl = el('div', 'jt-bol2-afin');
    var pop = el('div', 'jt-bol2-pop'); pop.hidden = true;
    var fala = el('div', 'jt-bol2-fala'); fala.hidden = true; raiz.appendChild(fala);
    raiz.appendChild(pop);

    // painel: aviso, categoria, pergunta, opções, ações
    var msgEl = el('p', 'jt-bol2-msg'); msgEl.setAttribute('aria-live', 'polite');
    var catEl = el('div', 'jt-bol2-cat'); var pergEl = el('p', 'jt-bol2-perg'); var opsEl = el('div', 'jt-bol2-ops'); var acoesEl = el('div', 'jt-bol2-acoes');
    [msgEl, catEl, pergEl, opsEl, acoesEl].forEach(function (e) { painel.appendChild(e); });
    var cena = el('div', 'jt-bol2-cena'); cena.hidden = true; raiz.appendChild(cena);

    /* ---------- estado ---------- */
    var contraste = !!ctx.ler('contraste');
    var G = null;
    var mundo = criarMundo();
    var parceiro = PERSONAGENS[Math.floor(sorte() * PERSONAGENS.length)];
    var modo = ctx.ler('modo') === 'dois' ? 'dois' : 'ia';
    function novoEstado() {
      return { modo: modo, fase: 0, etapa: 'inicio', saldo: 0, saldoF1: 0, acertos: { 2: 0, 3: 0 }, marcas: { 1: [], 2: [], 3: [] }, rodada: 0,
        memo: [], zona: 3, zonaOk: false, mult: 1, perg: null, resposta: null, parc: null, confs: [], usadas: {}, lote: null, contrato: 0,
        decisao: null, af: afinidades(parceiro, nivel), leituraAte: 0 };
    }
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
      var f = G.fase;
      faseNome.textContent = f >= 1 && f <= 3 ? t('Fase ', 'Round ', 'Fase ') + f + ' · ' + nomeFase(f) : f === 4 ? nomeFase(4) : t('Saldo', 'Balance', 'Saldo');
      var h = '';
      if (f >= 1 && f <= 3) for (var i = 0; i < PERGUNTAS[f]; i++) {
        var m = G.marcas[f][i];
        h += '<i class="' + (m === true ? 'sim' : m === false ? 'nao' : i === G.rodada && G.etapa !== 'verdes' && G.etapa !== 'vermelhas' ? 'agora' : '') + '"></i>';
      }
      pontosEl.innerHTML = h;
    }
    function estadoParc() {
      if (G.modo === 'dois') return G.fase >= 2 ? t('🔒 um na Sala', '🔒 one in the Booth', '🔒 uno en la Cabina') : t('juntos no Palco', 'together on Stage', 'juntos en el Plató');
      if (G.etapa === 'pensando') return t('pensando', 'thinking', 'pensando');
      if (G.fase >= 2) return t('🔒 na Sala', '🔒 in the Booth', '🔒 en la Cabina');
      return t('no Palco com você', 'on Stage with you', 'en el Plató contigo');
    }
    function pintarParc() {
      parcBt.classList.toggle('pensa', G.etapa === 'pensando');
      if (G.modo === 'dois') {
        parcCv.hidden = true;
        parcTxt.innerHTML = '<b>👥 ' + t('Dois na mesma tela', 'Two on one screen', 'Dos en la misma pantalla') + '</b><small>' + estadoParc() + '</small>';
        parcBt.setAttribute('aria-label', t('Modo dois jogadores', 'Two-player mode', 'Modo dos jugadores'));
      } else {
        parcCv.hidden = false;
        parcTxt.innerHTML = '<b>' + esc(parceiro.nome) + '</b><small>' + estadoParc() + '</small>';
        parcBt.setAttribute('aria-label', t('Parceiro: ', 'Partner: ', 'Compañero: ') + parceiro.nome + '. ' + t('Ver afinidades', 'See strengths', 'Ver afinidades'));
      }
      pintarAfin();
    }
    function pintarAfin() {
      var cat = G.perg && G.fase >= 2 ? G.perg.cat : null, h = '';
      ORDEM_CAT.forEach(function (c) {
        var v = G.af[c];
        h += '<div' + (c === cat ? ' class="agora"' : '') + ' title="' + esc(tx(CATEGORIAS[c].n)) + '"><span class="n">' + CATEGORIAS[c].ico + '</span><span class="b"><i style="width:' +
          Math.round(v * 100) + '%"></i></span><em>' + Math.round(v * 100) + '%</em></div>';
      });
      afinEl.innerHTML = h;
      cartaoParc.hidden = G.modo === 'dois';
      if ((!cena.hidden && cena.contains(afinEl)) || (!pop.hidden && pop.contains(afinEl))) return;   // está à mostra no começo ou na janelinha
      cartaoParc.innerHTML = '<h3>' + t('Afinidades por categoria', 'Strengths by category', 'Afinidades por categoría') + '</h3>';
      cartaoParc.appendChild(afinEl);
    }
    parcBt.addEventListener('click', function () {
      if (G.modo === 'dois' || !raiz.classList.contains('retrato')) return;
      ctx.som('toque');
      if (!pop.hidden) { pop.hidden = true; pintarAfin(); return; }
      pop.innerHTML = '<h3>' + esc(parceiro.nome) + ' · ' + t('afinidades', 'strengths', 'afinidades') + '</h3>';
      pop.appendChild(afinEl); pop.hidden = false;
      var r = parcBt.getBoundingClientRect(), rr = raiz.getBoundingClientRect();
      pop.style.left = '8px'; pop.style.right = '8px'; pop.style.top = (r.bottom - rr.top + 6) + 'px';
    });
    pop.addEventListener('click', function () { pop.hidden = true; pintarAfin(); });
    contrasteBt.addEventListener('click', function () {
      contraste = !contraste; ctx.gravar('contraste', contraste); contrasteBt.setAttribute('aria-pressed', String(contraste));
      ctx.som('toque'); prepararSprites(); sujo = true;
    });
    contrasteBt.setAttribute('aria-pressed', String(contraste));

    /* ---------- medidas ---------- */
    var fontesProntas = !document.fonts, dpr = 1, esc2 = 1, fundo = document.createElement('canvas'), c = tela.getContext('2d'), Lt = {}, sujo = true;
    function medir() {
      var r = palco.getBoundingClientRect(), W = Math.max(240, Math.round(r.width)), H = Math.max(240, Math.round(r.height));
      var retrato = H >= W * 1.05, pw, ph, px, py;
      raiz.classList.toggle('retrato', retrato); raiz.classList.toggle('deitado', !retrato);
      hud.innerHTML = '';
      if (retrato) {
        var topo = clamp(Math.round(H * 0.08), 56, 86), baixo = clamp(Math.round(H * 0.25), 188, 320);
        ph = Math.min((W - 12) * 1.4, H - topo - baixo - 8); pw = ph / 1.4;
        px = (W - pw) / 2; py = topo;
        pos(hud, 0, 0, W, topo); pos(painel, 0, py + ph + 4, W, H - py - ph - 4);
        hud.appendChild(parcBt); hud.appendChild(saldoBox); hud.appendChild(contrasteBt);
        raiz.style.setProperty('--odo', clamp(Math.round(topo * 0.5), 28, 44) + 'px');
      } else {
        ph = H - 14; pw = ph / 1.4;
        var lado = (W - pw) / 2 - 14;
        if (lado < 190) { lado = 190; pw = W - 2 * (lado + 14); ph = pw * 1.4; }
        px = (W - pw) / 2; py = (H - ph) / 2;
        pos(hud, 10, 8, lado, H - 16); pos(painel, px + pw + 10, 4, lado, H - 8);
        hud.appendChild(saldoBox); hud.appendChild(parcBt); hud.appendChild(cartaoParc); hud.appendChild(contrasteBt);
        pop.hidden = true;
        raiz.style.setProperty('--odo', clamp(Math.round(Math.min(lado / 6.5, H / 7)), 30, 96) + 'px');
      }
      
      pos(parede, px, py, pw, ph);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      tela.width = Math.round(pw * dpr); tela.height = Math.round(ph * dpr);
      fundo.width = tela.width; fundo.height = tela.height;
      esc2 = tela.width / GEO.W;
      Lt = { W: W, H: H, retrato: retrato, pw: pw, ph: ph, px: px, py: py };
      desenharRosto(parcCv, parceiro, 40);
      pintarAfin();
      fundoChave = ''; prepararSprites(); desenharFundo(); sujo = true;
    }
    function pos(e, x, y, w, h) { e.style.left = Math.round(x) + 'px'; e.style.top = Math.round(y) + 'px'; e.style.width = Math.round(w) + 'px'; e.style.height = Math.round(h) + 'px'; }

    /* ---------- sprites (pintados uma vez a cada tamanho) ---------- */
    var SPR = {}, CORES = {
      branca: { nucleo: '#ffffff', meio: '#dbeaff', borda: '#7f9fd8', brilho: 'rgba(190,225,255,' },
      verde: { nucleo: '#eafff2', meio: '#2dff88', borda: '#07843f', brilho: 'rgba(45,255,136,' },
      vermelha: { nucleo: '#ffe9ee', meio: '#ff3b5c', borda: '#99102a', brilho: 'rgba(255,59,92,' }
    };
    function sprite(n, fn) { var cv = document.createElement('canvas'); cv.width = cv.height = Math.max(4, Math.ceil(n)); fn(cv.getContext('2d'), cv.width); return cv; }
    function prepararSprites() {
      var rb = GEO.RB * 1.15 * esc2, rp = GEO.RP * 1.3 * esc2;
      Object.keys(CORES).forEach(function (k) {
        var co = CORES[k];
        SPR[k] = sprite(rb * 5, function (g, n) {
          var m = n / 2, gr = g.createRadialGradient(m, m, rb * 0.6, m, m, m);
          gr.addColorStop(0, co.brilho + '.55)'); gr.addColorStop(0.45, co.brilho + '.18)'); gr.addColorStop(1, co.brilho + '0)');
          g.fillStyle = gr; g.fillRect(0, 0, n, n);
          gr = g.createRadialGradient(m - rb * 0.35, m - rb * 0.4, rb * 0.1, m, m, rb);
          gr.addColorStop(0, co.nucleo); gr.addColorStop(0.5, co.meio); gr.addColorStop(1, co.borda);
          circ(g, m, m, rb); g.fillStyle = gr; g.fill();
          g.fillStyle = 'rgba(255,255,255,.85)'; elip(g, m - rb * 0.35, m - rb * 0.42, rb * 0.3, rb * 0.18, -0.6); g.fill();
          if (contraste && k !== 'branca') {
            g.lineWidth = Math.max(1.5, rb * 0.16); g.strokeStyle = '#000'; circ(g, m, m, rb); g.stroke();
            g.lineCap = 'round'; g.lineWidth = Math.max(2, rb * 0.3); g.strokeStyle = '#000';
            g.beginPath(); g.moveTo(m - rb * 0.5, m); g.lineTo(m + rb * 0.5, m);
            if (k === 'verde') { g.moveTo(m, m - rb * 0.5); g.lineTo(m, m + rb * 0.5); }
            g.stroke();
            g.lineWidth = Math.max(1, rb * 0.13); g.strokeStyle = '#fff';
            g.beginPath(); g.moveTo(m - rb * 0.5, m); g.lineTo(m + rb * 0.5, m);
            if (k === 'verde') { g.moveTo(m, m - rb * 0.5); g.lineTo(m, m + rb * 0.5); }
            g.stroke();
          }
        });
      });
      SPR.pino = sprite(rp * 2.6, function (g, n) {
        var m = n / 2, gr = g.createRadialGradient(m - rp * 0.35, m - rp * 0.4, rp * 0.1, m, m, rp);
        gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.4, '#cfe0ff'); gr.addColorStop(1, '#5a6ab0');
        circ(g, m, m, rp); g.fillStyle = gr; g.fill();
        g.lineWidth = Math.max(0.6, rp * 0.18); g.strokeStyle = 'rgba(10,14,50,.8)'; g.stroke();
      });
      SPR.luz = sprite(rp * 9, function (g, n) {
        var m = n / 2, gr = g.createRadialGradient(m, m, 0, m, m, m);
        gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(160,240,255,.9)'); gr.addColorStop(0.45, 'rgba(70,190,255,.35)'); gr.addColorStop(1, 'rgba(70,120,255,0)');
        g.fillStyle = gr; g.fillRect(0, 0, n, n);
      });
    }

    /* ---------- cenário fixo (parede, pinos, divisórias, valores) ---------- */
    function nivelValor(v, f) { var mx = Math.max.apply(null, VALORES[f]); return v >= mx * 0.3 ? 2 : v >= mx * 0.04 ? 1 : 0; }
    function rr(g, x, y, w, h, r) {
      g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r);
      g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
    }
    function fonte(px, peso) { return (peso || 700) + ' ' + px + 'px Fredoka, system-ui, sans-serif'; }
    var fundoChave = '';
    function desenharFundo() {
      var g = fundo.getContext('2d'), f = clamp(G.fase || 1, 1, 3), i, k, gr, chave = f + ':' + fundo.width + 'x' + fundo.height + ':' + fontesProntas;
      if (chave === fundoChave) return;   // nada mudou: não repinta (o começo fica leve no tablet velho)
      fundoChave = chave;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, fundo.width, fundo.height);
      g.setTransform(esc2, 0, 0, esc2, 0, 0);
      // painel da parede
      gr = g.createLinearGradient(0, 0, 0, GEO.H); gr.addColorStop(0, '#0e1f72'); gr.addColorStop(0.55, '#0a0f4c'); gr.addColorStop(1, '#170a45');
      rr(g, 0, 0, GEO.W, GEO.H, 26); g.fillStyle = gr; g.fill();
      g.save(); rr(g, 0, 0, GEO.W, GEO.H, 26); g.clip();
      // grade sutil e brilho central
      g.strokeStyle = 'rgba(120,200,255,.055)'; g.lineWidth = 1.2;
      for (i = 50; i < GEO.W; i += 50) { g.beginPath(); g.moveTo(i, 92); g.lineTo(i, GEO.YDIV); g.stroke(); }
      for (i = 130; i < GEO.YDIV; i += 50) { g.beginPath(); g.moveTo(0, i); g.lineTo(GEO.W, i); g.stroke(); }
      gr = g.createRadialGradient(GEO.W / 2, 520, 40, GEO.W / 2, 520, 520); gr.addColorStop(0, 'rgba(80,140,255,.16)'); gr.addColorStop(1, 'rgba(80,140,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, GEO.W, GEO.H);
      // faixa das comportas
      gr = g.createLinearGradient(0, 0, 0, 92); gr.addColorStop(0, '#060a30'); gr.addColorStop(1, '#0c1458');
      g.fillStyle = gr; g.fillRect(0, 0, GEO.W, 92);
      g.fillStyle = 'rgba(127,220,255,.6)'; g.fillRect(0, 91, GEO.W, 2);
      for (k = 0; k < GEO.ZONAS; k++) {
        var x = zonaX(k);
        rr(g, x - 34, 8, 68, 74, 14); gr = g.createLinearGradient(0, 8, 0, 82); gr.addColorStop(0, '#1a2a8a'); gr.addColorStop(1, '#0a1040');
        g.fillStyle = gr; g.fill(); g.lineWidth = 2.5; g.strokeStyle = 'rgba(127,220,255,.7)'; g.stroke();
        g.font = fonte(24); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#bff3ff'; g.fillText(String(k + 1), x, 25);
        g.fillStyle = 'rgba(0,0,0,.45)'; rr(g, x - 24, 38, 48, 26, 9); g.fill();
      }
      // canaletas e valores
      var vs = VALORES[f];
      for (k = 0; k < GEO.CANALETAS; k++) {
        var nv = nivelValor(vs[k], f), x0 = k * GEO.LARG;
        gr = g.createLinearGradient(0, GEO.YDIV, 0, GEO.H);
        gr.addColorStop(0, nv === 2 ? 'rgba(255,194,58,.05)' : nv === 1 ? 'rgba(63,208,255,.04)' : 'rgba(255,255,255,.02)');
        gr.addColorStop(1, nv === 2 ? 'rgba(255,194,58,.32)' : nv === 1 ? 'rgba(63,208,255,.22)' : 'rgba(150,150,220,.1)');
        g.fillStyle = gr; g.fillRect(x0, GEO.YDIV, GEO.LARG, GEO.H - GEO.YDIV);
        g.fillStyle = nv === 2 ? '#ffc23a' : nv === 1 ? '#3fd0ff' : '#5a62a8'; g.fillRect(x0 + 6, GEO.H - 7, GEO.LARG - 12, 4);
        g.save(); g.translate(x0 + GEO.LARG / 2, 958); g.rotate(-Math.PI / 2);
        var txt = milhar(vs[k], L);
        g.font = fonte(txt.length > 6 ? 22 : 25); g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = 5; g.strokeStyle = 'rgba(4,6,30,.85)'; g.strokeText(txt, 0, 0);
        g.fillStyle = nv === 2 ? '#ffe08a' : nv === 1 ? '#bff3ff' : '#b8bce8'; g.fillText(txt, 0, 0);
        g.restore();
      }
      g.setLineDash([6, 8]); g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(0, GEO.SENSOR); g.lineTo(GEO.W, GEO.SENSOR); g.stroke(); g.setLineDash([]);
      // divisórias de ponta redonda
      for (k = 1; k < GEO.CANALETAS; k++) {
        var xd = k * GEO.LARG;
        gr = g.createLinearGradient(xd - 4, 0, xd + 4, 0); gr.addColorStop(0, '#5a6aa8'); gr.addColorStop(0.45, '#eaf2ff'); gr.addColorStop(1, '#46508a');
        g.fillStyle = gr; rr(g, xd - GEO.RDIV, GEO.YDIV - GEO.RDIV, GEO.RDIV * 2, GEO.H - GEO.YDIV, GEO.RDIV); g.fill();
        circ(g, xd - 1, GEO.YDIV - 1, 1.6); g.fillStyle = '#fff'; g.fill();
      }
      // pinos (os da parede aparecem pela metade)
      var ps = mundo.pinos, sp = SPR.pino, sw = sp.width / esc2;
      for (i = 0; i < ps.length; i++) g.drawImage(sp, ps[i].x - sw / 2, ps[i].y - sw / 2, sw, sw);
      g.restore();
      // moldura neon
      [[16, 'rgba(123,60,255,.12)'], [9, 'rgba(63,208,255,.18)'], [4, 'rgba(127,230,255,.6)'], [1.6, '#dff8ff']].forEach(function (s) {
        rr(g, 2, 2, GEO.W - 4, GEO.H - 4, 25); g.lineWidth = s[0]; g.strokeStyle = s[1]; g.stroke();
      });
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
      var f = clamp(G.fase, 1, 3), v = VALORES[f][b.canaleta], mx = Math.max.apply(null, VALORES[f]);
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
        if (b.cor !== 'branca') aplicar(b);
        else if (G.fase === 1 && G.etapa === 'queda' && G.resposta === null) revelarF1();
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
    function bater() {
      som.coracao();
      if (!calmo) { aura.classList.remove('bate'); void aura.offsetWidth; aura.classList.add('bate'); }
    }

    /* ---------- painel ---------- */
    function msg(s) { msgEl.textContent = s || ''; }
    function limparPainel() { msg(''); catEl.innerHTML = ''; pergEl.textContent = ''; pergEl.hidden = true; opsEl.innerHTML = ''; acoesEl.innerHTML = ''; fala.hidden = true; }
    var LETRAS = ['A', 'B', 'C', 'D'];
    function montarOps(p, clicavel, aoEscolher) {
      opsEl.innerHTML = ''; opsEl.className = 'jt-bol2-ops n' + p.o.length + (clicavel ? '' : ' jt-bol2-so');
      p.o.forEach(function (o, i) {
        var b = el('button', 'jt-bol2-op' + (clicavel ? '' : ' so')); b.type = 'button';
        b.innerHTML = '<span class="l">' + LETRAS[i] + '</span><span>' + esc(tx(o)) + '</span>';
        b.setAttribute('data-op', i);
        if (clicavel) b.addEventListener('click', function () { aoEscolher(i); }); else b.disabled = true;
        opsEl.appendChild(b);
      });
    }
    function marcarOps(certa, escolhida, rotulo) {
      Array.prototype.forEach.call(opsEl.children, function (b, i) {
        b.disabled = true; b.classList.remove('trava');
        if (i === certa) b.classList.add('certa'); else if (i === escolhida) b.classList.add('errada'); else b.classList.add('apagada');
        if (i === escolhida && rotulo) { var q = el('span', 'quem'); q.textContent = rotulo; b.appendChild(q); }
      });
    }
    function categoriaHTML(p, comForca) {
      var c = CATEGORIAS[p.cat], h = '<span class="jt-bol2-chip">' + c.ico + ' ' + esc(tx(c.n)) + '</span>';
      if (comForca && G.modo === 'ia') {
        var v = G.af[p.cat];
        h += '<span class="forca" style="color:' + (v >= 0.7 ? '#2dff88' : v >= 0.45 ? '#ffc23a' : '#ff6f86') + '">' + esc(parceiro.nome) + ': ' + Math.round(v * 100) + '%</span>';
      }
      return h;
    }

    /* ---------- cenas (por cima de tudo) ---------- */
    function abrirCena(html, classe) {
      cena.className = 'jt-bol2-cena' + (classe ? ' ' + classe : ''); cena.innerHTML = html; cena.hidden = false; fala.hidden = true; pop.hidden = true;
      var b = cena.querySelector('[data-foco]') || cena.querySelector('button');
      if (b) setTimeout(function () { if (!cena.hidden) try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } }, 30);
      return cena;
    }
    function fecharCena() { cena.hidden = true; cena.innerHTML = ''; }
    function aoClicarCena(sel, fn) { var b = cena.querySelector(sel); if (b) b.addEventListener('click', function () { ctx.som('toque'); fn(b); }); }

    /* ---------- começo: modo e parceiro ---------- */
    function telaInicio() {
      G = novoEstado(); timers = []; mundo.bolas = []; parts = []; flutua = []; flashes = [];
      clima('calma'); pintarOdo(0, true); pintarFase(); pintarParc(); limparPainel(); desenharFundo();
      var cv = '<canvas data-rosto></canvas>';
      var html = '<div class="jt-bol2-caixa larga">' +
        '<h2 class="jt-bol2-logo cheia">' + t('Bolinhas', 'Nail-Biter', 'Bolitas') + '<span>' + t('da Angústia', 'Drop', 'de la Angustia') + '</span></h2>' +
        '<p class="cheia">' + t('Responda, escolha a zona e torça: cada bolinha quica entre os pinos até o último segundo!',
          'Answer, pick a zone and hold your breath: every ball bounces through the pegs until the very last second!',
          '¡Responde, elige la zona y cruza los dedos: cada bolita rebota entre los clavos hasta el último segundo!') + '</p>' +
        '<div class="jt-bol2-modos">' +
        '<button type="button" class="jt-bol2-modo" data-modo="ia" aria-pressed="' + (modo === 'ia') + '">' + cv + '<b>' + t('Solo + Parceiro', 'Solo + Partner', 'Solo + Compañero') + '</b><small>' +
        t('Você no Palco; o parceiro responde na Sala de Isolamento.', 'You on Stage; your partner answers in the Isolation Booth.', 'Tú en el Plató; tu compañero responde en la Cabina de Aislamiento.') + '</small></button>' +
        '<button type="button" class="jt-bol2-modo" data-modo="dois" aria-pressed="' + (modo === 'dois') + '"><span class="ic">👥</span><b>' +
        t('Dois na mesma tela', 'Two on one screen', 'Dos en la misma pantalla') + '</b><small>' +
        t('Um no Palco, o outro na Sala. Passem o aparelho!', 'One on Stage, the other in the Booth. Pass the device!', 'Uno en el Plató y el otro en la Cabina. ¡Pasaos el aparato!') + '</small></button></div>' +
        '<div class="jt-bol2-perfil" ' + (modo === 'dois' ? 'hidden' : '') + '><div class="jt-bol2-ptopo">' + cv + '<b>' + esc(parceiro.nome) + '</b>' +
        '<button type="button" class="jt-bol2-mini" data-outro aria-label="' + t('Sortear outro parceiro', 'Draw another partner', 'Sortear otro compañero') + '">🎲</button></div>' +
        '<small>' + t('Afinidades (lembre na hora de escolher a zona!)', 'Strengths (remember them when picking a zone!)', 'Afinidades (¡recuérdalas al elegir la zona!)') + '</small><div data-afin></div></div>' +
        '<button type="button" class="jt-bol2-btn ouro cheia" data-comecar data-foco>▶ ' + t('Começar', 'Start', 'Empezar') + '</button></div>';
      abrirCena(html);
      Array.prototype.forEach.call(cena.querySelectorAll('canvas[data-rosto]'), function (k) { desenharRosto(k, parceiro, 52); });
      var af = cena.querySelector('[data-afin]'); if (af) { af.appendChild(afinEl); }
      Array.prototype.forEach.call(cena.querySelectorAll('[data-modo]'), function (b) {
        b.addEventListener('click', function () { ctx.som('toque'); modo = b.getAttribute('data-modo'); ctx.gravar('modo', modo); telaInicio(); });
      });
      aoClicarCena('[data-outro]', function () {
        var i = PERSONAGENS.indexOf(parceiro); parceiro = PERSONAGENS[(i + 1 + Math.floor(sorte() * (PERSONAGENS.length - 1))) % PERSONAGENS.length];
        desenharRosto(parcCv, parceiro, 40); telaInicio();
      });
      aoClicarCena('[data-comecar]', function () { comecar(modo); });
    }
    function comecar(m) {
      modo = m === 'dois' ? 'dois' : 'ia';
      G = novoEstado(); G.modo = modo;
      fecharCena(); pintarParc(); pintarOdo(0, true);
      iniciarFase(1);
    }

    /* ---------- cartão de fase ---------- */
    function iniciarFase(f) {
      G.fase = f; G.rodada = 0; G.etapa = 'cartao'; G.perg = null;
      desenharFundo(); pintarFase(); pintarParc(); limparPainel();
      var sub = f === 1 ? t('5 perguntas de 2 opções. Trave a resposta antes que a primeira bolinha chegue lá embaixo!',
        '5 questions with 2 options. Lock your answer before the first ball reaches the bottom!', '5 preguntas de 2 opciones. ¡Bloquea la respuesta antes de que la primera bolita llegue abajo!') :
        f === 2 ? (G.modo === 'ia' ? parceiro.nome + t(' vai para a Sala de Isolamento 🔒. Os valores aumentam!', ' goes to the Isolation Booth 🔒. The values go up!', ' se va a la Cabina de Aislamiento 🔒. ¡Los valores suben!') :
          t('Um de vocês vai para a Sala de Isolamento 🔒. Os valores aumentam!', 'One of you goes to the Isolation Booth 🔒. The values go up!', 'Uno de vosotros se va a la Cabina de Aislamiento 🔒. ¡Los valores suben!')) :
          t('4 opções, valores enormes e 4 vermelhas no fim. Coragem!', '4 options, huge values and 4 reds at the end. Be brave!', '4 opciones, valores enormes y 4 rojas al final. ¡Valor!');
      abrirCena('<div class="jt-bol2-caixa jt-bol2-fasecard"><span class="num">' + t('Fase ', 'Round ', 'Fase ') + f + '</span><h2>' + nomeFase(f) + '</h2><p>' + sub + '</p>' +
        '<button type="button" class="jt-bol2-btn" data-foco data-ok>' + t('Vamos!', 'Let’s go!', '¡Vamos!') + '</button></div>', 'vidro');
      var seguiu = false, seguir = function () {
        if (seguiu) return; seguiu = true; fecharCena();
        if (f === 1) perguntaF1(); else verdes();
      };
      aoClicarCena('[data-ok]', seguir);
      agendar(calmo ? 6 : 4.5, function () { if (G.etapa === 'cartao' && G.fase === f) seguir(); });
    }

    /* ---------- Fase 1: Queda Livre ---------- */
    var LEITURA = { facil: 6, medio: 4.5, dificil: 3 };
    function perguntaF1() {
      if (G.rodada >= PERGUNTAS[1]) return fimF1();
      var q = sortearPergunta(banco, 2, nivel, G.usadas, sorte);
      G.perg = prepararPergunta(q, sorte); G.resposta = null; G.etapa = 'leitura'; G.leituraAte = relogio + LEITURA[nivel];
      limparPainel(); pintarFase(); pintarParc();
      catEl.innerHTML = categoriaHTML(G.perg, false);
      pergEl.hidden = false; pergEl.textContent = tx(G.perg.q);
      montarOps(G.perg, true, responderF1);
      G.timerLeitura = agendar(LEITURA[nivel], soltarF1);
      if (G.modo === 'ia') agendar(1.4, function () { if (G.etapa === 'leitura' || G.etapa === 'queda') dicaParceiro(); });
    }
    function dicaParceiro() {
      if (G.resposta !== null || !G.perg) return;
      var r = iaResponder(G.af, G.perg, sorte), op = '«' + tx(G.perg.o[r.indice]) + '»';
      fala.textContent = parceiro.nome + ': ' + (r.confianca >= 0.6 ? t('Tenho certeza: é ', 'I’m sure: it’s ', '¡Seguro que es ') + op + t('!', '!', '!') :
        t('Hmm… acho que é ', 'Hmm… I think it’s ', 'Mmm… creo que es ') + op + '?');
      var rb = parcBt.getBoundingClientRect(), rr2 = raiz.getBoundingClientRect();
      fala.style.left = Math.max(6, rb.left - rr2.left) + 'px'; fala.style.top = (rb.bottom - rr2.top + 10) + 'px'; fala.hidden = false;
      agendar(4, function () { fala.hidden = true; });
    }
    function soltarF1() {
      if (G.etapa !== 'leitura') return;
      cancelar(G.timerLeitura);
      G.etapa = 'queda';
      var l = novoLote(3, function () { G.rodada++; perguntaF1(); });
      [0, 3, 6].forEach(function (z) { lancar(l, z, 'branca', 0.05); });
      clima('tensao');
      msg(G.resposta === null ? t('Rápido! Trave a resposta antes que a primeira caia!', 'Quick! Lock your answer before the first one lands!', '¡Rápido! ¡Bloquea la respuesta antes de que caiga la primera!') :
        t('Resposta travada… lá vão elas!', 'Answer locked… here they go!', 'Respuesta bloqueada… ¡allá van!'));
      if (G.resposta !== null) agendar(0.9, revelarF1);
    }
    function responderF1(i) {
      if (G.resposta !== null || (G.etapa !== 'leitura' && G.etapa !== 'queda')) return;
      G.resposta = i; ctx.som('toque'); fala.hidden = true;
      Array.prototype.forEach.call(opsEl.children, function (b, k) { b.disabled = true; if (k === i) b.classList.add('trava'); else b.classList.add('apagada'); });
      msg(t('Resposta travada!', 'Answer locked!', '¡Respuesta bloqueada!'));
      if (G.etapa === 'leitura') agendar(0.35, soltarF1);
      else agendar(0.6, revelarF1);
    }
    function revelarF1() {
      if (!G.lote || G.lote.revelado || G.fase !== 1) return;
      var acertou = G.resposta === G.perg.c;
      G.marcas[1][G.rodada] = acertou; pintarFase();
      marcarOps(G.perg.c, G.resposta, null);
      msg(G.resposta === null ? t('O tempo acabou! Vermelhas…', 'Time’s up! Reds…', '¡Se acabó el tiempo! Rojas…') :
        acertou ? t('Acertou! Bolinhas verdes: tudo soma!', 'Correct! Green balls: it all adds up!', '¡Acierto! Bolitas verdes: ¡todo suma!') :
          t('Errou… bolinhas vermelhas: tudo desconta!', 'Wrong… red balls: it all comes off!', 'Fallo… bolitas rojas: ¡todo resta!'));
      revelarLote(acertou);
    }
    function fimF1() {
      G.saldoF1 = G.saldo;
      if (G.saldo <= 0) return fimDeJogo();
      iniciarFase(2);
    }
    function fimDeJogo() {
      G.etapa = 'fim'; limparPainel();
      abrirCena('<div class="jt-bol2-caixa"><h2>😬 ' + t('Saldo zerado!', 'Balance wiped out!', '¡Saldo a cero!') + '</h2><p>' +
        t('As vermelhas levaram tudo na Queda Livre. Fim de jogo… mas a parede espera a revanche!', 'The reds took everything in Free Fall. Game over… but the wall is waiting for a rematch!',
          'Las rojas se lo llevaron todo en la Caída Libre. Fin del juego… ¡pero la pared espera la revancha!') + '</p>' +
        '<button type="button" class="jt-bol2-btn ouro" data-foco data-denovo>🔄 ' + t('Jogar de novo', 'Play again', 'Jugar otra vez') + '</button></div>', 'vidro');
      aoClicarCena('[data-denovo]', telaInicio);
    }

    /* ---------- Fases 2 e 3: verdes grátis, perguntas com zona, vermelhas obrigatórias ---------- */
    function verdes() {
      var n = VERDES[G.fase];
      G.etapa = 'verdes'; G.memo = []; G.zonaOk = false; G.perg = null; G.mult = 1;
      limparPainel(); pintarFase(); pintarParc(); clima('verde');
      novoLote(n, function () { perguntaZona(0); });
      montarAcoes();
      textoVerdes();
    }
    function textoVerdes() {
      var n = VERDES[G.fase];
      msg(t('Bolinhas verdes grátis! Escolha ', 'Free green balls! Pick ', '¡Bolitas verdes gratis! Elige ') + n + t(' zonas', ' zones', ' zonas') +
        ' (' + Math.min(n, G.memo.length + 1) + '/' + n + ')');
      catEl.innerHTML = '<span class="jt-bol2-chip">⚠️ ' + t('Guarde as zonas: as vermelhas obrigatórias caem delas no fim da fase!', 'Remember these zones: the mandatory reds drop from them at the end of the round!',
        '¡Recuerda las zonas: las rojas obligatorias caen de ellas al final de la fase!') + '</span>';
    }
    function perguntaZona(k) {
      if (k >= PERGUNTAS[G.fase]) return vermelhas();
      G.rodada = k; G.etapa = 'zona'; G.zonaOk = false; G.mult = 1; G.resposta = null; G.parc = null;
      var q = sortearPergunta(banco, OPCOES[G.fase], nivel, G.usadas, sorte);
      G.perg = prepararPergunta(q, sorte);
      limparPainel(); pintarFase(); pintarParc(); clima('calma');
      msg(t('Você só vê as opções. Escolha a zona pela confiança no parceiro!', 'You only see the options. Pick a zone by how much you trust your partner!',
        'Solo ves las opciones. ¡Elige la zona según tu confianza en el compañero!'));
      catEl.innerHTML = categoriaHTML(G.perg, true);
      montarOps(G.perg, false);
      montarAcoes();
    }
    function montarAcoes() {
      acoesEl.innerHTML = '';
      var ms = G.etapa === 'zona' ? multiplicadores(G.rodada) : [1];
      if (ms.length > 1) {
        var seg = el('div', 'jt-bol2-seg'); seg.setAttribute('role', 'group');
        ms.forEach(function (m) {
          var b = el('button'); b.type = 'button'; b.setAttribute('data-mult', m); b.setAttribute('aria-pressed', String(G.mult === m));
          b.textContent = m === 1 ? '×1' : m === 2 ? t('Duplo ×2', 'Double ×2', 'Doble ×2') : t('Triplo ×3', 'Triple ×3', 'Triple ×3');
          b.setAttribute('aria-label', m === 1 ? t('1 bolinha', '1 ball', '1 bolita') : m === 2 ? t('Lance Duplo: 2 bolinhas', 'Double drop: 2 balls', 'Tirada Doble: 2 bolitas') : t('Lance Triplo: 3 bolinhas', 'Triple drop: 3 balls', 'Tirada Triple: 3 bolitas'));
          b.addEventListener('click', function () { G.mult = m; ctx.som('toque'); montarAcoes(); });
          seg.appendChild(b);
        });
        acoesEl.appendChild(seg);
      }
      var bt = el('button', 'jt-bol2-btn' + (G.etapa === 'verdes' ? ' ouro' : '')); bt.type = 'button'; bt.setAttribute('data-soltar', '');
      bt.disabled = !G.zonaOk;
      bt.textContent = G.zonaOk ? '⬇ ' + t('Soltar na zona ', 'Drop at zone ', 'Soltar en la zona ') + (G.zona + 1) : '👆 ' + t('Toque numa zona', 'Tap a zone', 'Toca una zona');
      bt.addEventListener('click', confirmarZona);
      acoesEl.appendChild(bt);
    }
    function escolherZona(z) {
      if (G.etapa !== 'verdes' && G.etapa !== 'zona') return;
      G.zona = clamp(z, 0, 6); G.zonaOk = true; sujo = true; ctx.som('toque'); montarAcoes();
    }
    function confirmarZona() {
      if (!G.zonaOk) return;
      if (G.etapa === 'verdes') {
        G.memo.push(G.zona); lancar(G.lote, G.zona, 'verde', 0.25); som.comporta();
        G.zonaOk = false;
        if (G.memo.length >= VERDES[G.fase]) {
          G.etapa = 'quedaVerdes'; acoesEl.innerHTML = '';
          msg(t('Lá vão as verdes! Zonas guardadas: ', 'Here go the greens! Zones saved: ', '¡Allá van las verdes! Zonas guardadas: ') + G.memo.map(function (z) { return z + 1; }).join(', '));
        } else { montarAcoes(); textoVerdes(); }
        return;
      }
      if (G.etapa !== 'zona') return;
      G.zonaEscolhida = G.zona; G.etapa = 'resposta'; acoesEl.innerHTML = '';
      if (G.modo === 'ia') {
        G.etapa = 'pensando'; pintarParc();
        msg(parceiro.nome + t(' está pensando na Sala de Isolamento…', ' is thinking in the Isolation Booth…', ' está pensando en la Cabina de Aislamiento…'));
        agendar(1.3 + sorte() * 1.1, function () {
          G.parc = iaResponder(G.af, G.perg, sorte); G.resposta = G.parc.indice; G.confs.push(G.parc.confianca);
          G.etapa = 'resposta'; pintarParc(); soltarPergunta();
        });
      } else cortinaParaSala();
    }
    function soltarPergunta() {
      G.etapa = 'queda';
      msg(t('Resposta travada na Sala! Lá vai…', 'Answer locked in the Booth! Here it goes…', '¡Respuesta bloqueada en la Cabina! Allá va…'));
      var l = novoLote(G.mult, function () { perguntaZona(G.rodada + 1); });
      for (var i = 0; i < G.mult; i++) lancar(l, G.zonaEscolhida, 'branca', 0.1 + i * 0.5);
      clima('tensao');
      agendar(1.7 + (G.mult - 1) * 0.3, revelarPergunta);
    }
    function revelarPergunta() {
      var acertou = G.resposta === G.perg.c;
      G.marcas[G.fase][G.rodada] = acertou; if (acertou) G.acertos[G.fase]++;
      pintarFase();
      pergEl.hidden = false; pergEl.textContent = tx(G.perg.q);
      marcarOps(G.perg.c, G.resposta, G.modo === 'ia' ? parceiro.nome : t('Sala', 'Booth', 'Cabina'));
      msg(acertou ? (G.modo === 'ia' ? parceiro.nome : t('A Sala', 'The Booth', 'La Cabina')) + t(' acertou! Verde!', ' got it right! Green!', ' ha acertado. ¡Verde!') :
        (G.modo === 'ia' ? parceiro.nome : t('A Sala', 'The Booth', 'La Cabina')) + t(' errou… vermelha!', ' got it wrong… red!', ' ha fallado… ¡roja!'));
      revelarLote(acertou);
    }
    function vermelhas() {
      G.etapa = 'vermelhas'; G.perg = null; limparPainel(); pintarFase(); pintarParc(); clima('vermelho');
      msg(t('Hora das vermelhas obrigatórias! Das zonas ', 'Time for the mandatory reds! From zones ', '¡Hora de las rojas obligatorias! De las zonas ') + G.memo.map(function (z) { return z + 1; }).join(', ') + '…');
      var l = novoLote(G.memo.length, function () { if (G.fase === 2) iniciarFase(3); else irContrato(); });
      agendar(1.4, function () { G.memo.forEach(function (z, i) { lancar(l, z, 'vermelha', i * 0.6); }); clima('tensao'); agendar(0.4, function () { clima('vermelho'); }); });
    }

    /* ---------- dois na mesma tela: cortina e Sala de Isolamento ---------- */
    function cortinaParaSala() {
      G.etapa = 'cortina';
      abrirCena('<div class="jt-bol2-caixa"><div class="olho">🙈</div><h2>' + t('Passe o aparelho para quem está na Sala de Isolamento', 'Pass the device to whoever is in the Isolation Booth',
        'Pasa el aparato a quien está en la Cabina de Aislamiento') + '</h2><p><b>' + t('Palco: não olhe!', 'Stage: don’t look!', 'Plató: ¡no mires!') + '</b></p>' +
        '<button type="button" class="jt-bol2-btn rosa" data-foco data-ok>🔒 ' + t('Sou da Sala, pode mostrar', 'I’m in the Booth, show me', 'Soy de la Cabina, enséñamelo') + '</button></div>', 'jt-bol2-cortina');
      aoClicarCena('[data-ok]', telaSala);
    }
    function telaSala() {
      G.etapa = 'sala';
      var p = G.perg, h = '<div class="jt-bol2-caixa"><h2>🔒 ' + t('Sala de Isolamento', 'Isolation Booth', 'Cabina de Aislamiento') + '</h2>' +
        '<p>' + t('Você não vê o saldo nem as quedas. Responda com calma!', 'You can’t see the balance or the drops. Take your time!', 'No ves el saldo ni las caídas. ¡Responde con calma!') + '</p>' +
        '<div class="jt-bol2-cat">' + categoriaHTML(p, false) + '</div><p class="jt-bol2-perg">' + esc(tx(p.q)) + '</p><div class="jt-bol2-ops n' + p.o.length + '">';
      p.o.forEach(function (o, i) { h += '<button type="button" class="jt-bol2-op" data-sala="' + i + '"' + (i === 0 ? ' data-foco' : '') + '><span class="l">' + LETRAS[i] + '</span><span>' + esc(tx(o)) + '</span></button>'; });
      abrirCena(h + '</div></div>', 'jt-bol2-cortina');
      Array.prototype.forEach.call(cena.querySelectorAll('[data-sala]'), function (b) {
        b.addEventListener('click', function () { ctx.som('toque'); responderSala(+b.getAttribute('data-sala')); });
      });
    }
    function responderSala(i) {
      if (G.etapa !== 'sala') return;
      G.resposta = i; G.etapa = 'cortina2';
      abrirCena('<div class="jt-bol2-caixa"><div class="olho">✅</div><h2>' + t('Resposta travada!', 'Answer locked!', '¡Respuesta bloqueada!') + '</h2><p>' +
        t('Agora devolva o aparelho para o Palco.', 'Now hand the device back to the Stage.', 'Ahora devuelve el aparato al Plató.') + '</p>' +
        '<button type="button" class="jt-bol2-btn" data-foco data-ok>🎤 ' + t('Sou do Palco, continuar', 'I’m on Stage, continue', 'Soy del Plató, seguir') + '</button></div>', 'jt-bol2-cortina');
      aoClicarCena('[data-ok]', function () { fecharCena(); soltarPergunta(); });
    }

    /* ---------- o Contrato ---------- */
    function papelHTML(extra) {
      return '<div class="jt-bol2-papel' + (extra || '') + '"><h3>' + t('CONTRATO', 'CONTRACT', 'CONTRATO') + '</h3><p>' +
        t('A dupla recebe, garantido, o valor de:', 'The pair is guaranteed to receive:', 'La pareja recibe, garantizado, el valor de:') + '</p><div class="valor">' + din(G.contrato) + '</div>' +
        '<p style="font-size:12px">' + t('Queda Livre ', 'Free Fall ', 'Caída Libre ') + din(G.saldoF1) + ' + ' + G.acertos[2] + ' × ' + din(BONUS[2]) + ' + ' + G.acertos[3] + ' × ' + din(BONUS[3]) + '</p>' +
        '<div class="linha"></div><p style="font-size:11px;opacity:.7">' + t('assinatura', 'signature', 'firma') + '</p>' +
        '<svg viewBox="0 0 200 50" aria-hidden="true"><path d="M5 35 C 20 5, 30 45, 45 25 S 70 10, 80 30 S 100 45, 112 20 S 135 8, 140 32 C 150 45, 165 15, 195 22"/></svg><span class="caneta" aria-hidden="true">✒️</span></div>';
    }
    function irContrato() {
      G.fase = 4; G.etapa = 'contrato'; G.contrato = valorContrato(G.saldoF1, G.acertos[2], G.acertos[3]);
      limparPainel(); pintarFase(); clima('calma');
      if (G.modo === 'ia') {
        abrirCena('<div class="jt-bol2-caixa"><h2>📜 ' + nomeFase(4) + '</h2><p>' + esc(parceiro.nome) +
          t(' não sabe o saldo do painel. Vai assinar o contrato ou rasgar?', ' doesn’t know the balance on the board. Will they sign the contract or tear it up?',
            ' no sabe el saldo del panel. ¿Firmará el contrato o lo romperá?') + '</p>' + '<div data-papel>' + papelHTML('') + '</div>' +
          '<p data-pensa>🔒 ' + esc(parceiro.nome) + t(' está decidindo…', ' is deciding…', ' está decidiendo…') + '</p></div>', 'vidro');
        agendar(2.8, function () { decidir(iaContrato(G.confs, sorte)); });
      } else {
        abrirCena('<div class="jt-bol2-caixa"><div class="olho">🙈</div><h2>' + t('Passe o aparelho para a Sala de Isolamento', 'Pass the device to the Isolation Booth', 'Pasa el aparato a la Cabina de Aislamiento') +
          '</h2><p><b>' + t('Palco: não conte nada!', 'Stage: don’t say a word!', 'Plató: ¡no cuentes nada!') + '</b></p>' +
          '<button type="button" class="jt-bol2-btn rosa" data-foco data-ok>🔒 ' + t('Sou da Sala, mostrar o contrato', 'I’m in the Booth, show the contract', 'Soy de la Cabina, ver el contrato') + '</button></div>', 'jt-bol2-cortina');
        aoClicarCena('[data-ok]', function () {
          G.etapa = 'contratoSala';
          abrirCena('<div class="jt-bol2-caixa"><h2>📜 ' + nomeFase(4) + '</h2><p>' + t('Você não sabe quanto a dupla tem no painel. Assina e garante este valor, ou rasga e fica com o saldo do painel?',
            'You don’t know what the pair has on the board. Sign and lock in this amount, or tear it up and take the board balance?',
            'No sabes cuánto tiene la pareja en el panel. ¿Firmas y aseguras este valor, o lo rompes y te quedas con el saldo del panel?') + '</p>' +
            '<div data-papel>' + papelHTML('') + '</div><div class="jt-bol2-decide">' +
            '<button type="button" class="jt-bol2-btn ouro" data-assinar data-foco>✍️ ' + t('Assinar', 'Sign', 'Firmar') + '</button>' +
            '<button type="button" class="jt-bol2-btn rosa" data-rasgar>✂️ ' + t('Rasgar', 'Tear up', 'Romper') + '</button></div></div>', 'vidro');
          aoClicarCena('[data-assinar]', function () { decidir('assinar'); });
          aoClicarCena('[data-rasgar]', function () { decidir('rasgar'); });
        });
      }
    }
    function decidir(d) {
      if (G.decisao) return;
      G.decisao = d; G.etapa = 'decisao';
      var lugar = cena.querySelector('[data-papel]'), pensa = cena.querySelector('[data-pensa]'), dec = cena.querySelector('.jt-bol2-decide');
      if (dec) dec.hidden = true;
      if (pensa) pensa.textContent = d === 'assinar' ? '✍️ ' + parceiro.nome + t(' assinou!', ' signed!', ' ha firmado.') : '✂️ ' + parceiro.nome + t(' rasgou!', ' tore it up!', ' lo ha roto.');
      if (G.modo === 'dois' && pensa === null) {
        var p = el('p'); p.textContent = d === 'assinar' ? t('✍️ Assinado!', '✍️ Signed!', '✍️ ¡Firmado!') : t('✂️ Rasgado!', '✂️ Torn up!', '✂️ ¡Roto!'); lugar.parentNode.appendChild(p);
      }
      if (d === 'assinar') { lugar.innerHTML = papelHTML(' assina'); som.caneta(); }
      else { lugar.innerHTML = '<div class="jt-bol2-rasgo rasga">' + papelHTML(' esq') + papelHTML(' dir') + '</div>'; som.rasgo(); }
      agendar(2.4, function () {
        if (G.modo === 'dois') {
          abrirCena('<div class="jt-bol2-caixa"><div class="olho">🎉</div><h2>' + t('Chamem os dois!', 'Call both players!', '¡Llamad a los dos!') + '</h2><p>' +
            t('Hora da revelação, todo mundo junto no Palco.', 'Time for the big reveal, everyone together on Stage.', 'Hora de la revelación, todos juntos en el Plató.') + '</p>' +
            '<button type="button" class="jt-bol2-btn ouro" data-foco data-ok>🎬 ' + t('Revelar', 'Reveal', 'Revelar') + '</button></div>', 'jt-bol2-cortina');
          aoClicarCena('[data-ok]', revelacao);
        } else revelacao();
      });
    }
    function revelacao() {
      G.etapa = 'revelacao';
      var leva = G.decisao === 'assinar' ? G.contrato : G.saldo, outro = G.decisao === 'assinar' ? G.saldo : G.contrato;
      var veredito = leva > outro ? t('Escolha certeira!', 'Spot-on choice!', '¡Elección acertada!') : leva === outro ? t('Deu no mesmo!', 'It came out even!', '¡Ha dado lo mismo!') :
        t('Que angústia! O outro valia mais…', 'Nail-biting! The other one was worth more…', '¡Qué angustia! El otro valía más…');
      var ch = 'recorde-' + nivel, rec = +ctx.ler(ch) || 0, novo = leva > rec;
      if (novo) ctx.gravar(ch, leva);
      clima(leva >= outro ? 'verde' : 'vermelho');
      if (leva >= outro) som.acerto(); else som.erro();
      abrirCena('<div class="jt-bol2-caixa jt-bol2-revela"><h2>🎬 ' + t('A revelação', 'The big reveal', 'La revelación') + '</h2>' +
        '<span class="jt-bol2-carimbo ' + (G.decisao === 'assinar' ? 'assinou">✍️ ' + t('ASSINOU', 'SIGNED', 'FIRMÓ') : 'rasgou">✂️ ' + t('RASGOU', 'TORE IT UP', 'LO ROMPIÓ')) + '</span>' +
        '<div class="jt-bol2-lado"><div class="' + (G.decisao === 'rasgar' ? 'leva' : '') + '"><small>' + t('Painel', 'Board', 'Panel') + '</small><strong>' + din(G.saldo) + '</strong><em>' +
        (G.decisao === 'rasgar' ? t('✔ vocês levam', '✔ you take it', '✔ os lo lleváis') : '') + '</em></div>' +
        '<div class="' + (G.decisao === 'assinar' ? 'leva' : '') + '"><small>' + t('Contrato', 'Contract', 'Contrato') + '</small><strong>' + din(G.contrato) + '</strong><em>' +
        (G.decisao === 'assinar' ? t('✔ vocês levam', '✔ you take it', '✔ os lo lleváis') : '') + '</em></div></div>' +
        '<p class="jt-bol2-final">' + t('Vocês levam ', 'You take home ', 'Os lleváis ') + din(leva) + '!</p><p>' + veredito +
        (novo && leva > 0 ? ' 🏆 ' + t('Novo recorde!', 'New record!', '¡Nuevo récord!') : rec ? ' · ' + t('Recorde: ', 'Record: ', 'Récord: ') + din(Math.max(rec, leva)) : '') + '</p>' +
        '<button type="button" class="jt-bol2-btn ouro" data-foco data-denovo>🔄 ' + t('Jogar de novo', 'Play again', 'Jugar otra vez') + '</button></div>', 'vidro');
      aoClicarCena('[data-denovo]', telaInicio);
    }

    /* ---------- toque na parede e teclado ---------- */
    function aoTocar(ev) {
      if (G.etapa !== 'verdes' && G.etapa !== 'zona') return;
      var r = tela.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * GEO.W;
      escolherZona(Math.round((x - 75) / 100));
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
      if (G.etapa === 'verdes' || G.etapa === 'zona') {
        if (k === 'ArrowLeft' || k === 'ArrowRight') { escolherZona((G.zonaOk ? G.zona : 3 - d) + d); ev.preventDefault(); }
        else if ((k === 'ArrowUp' || k === 'ArrowDown') && G.etapa === 'zona') {
          var ms = multiplicadores(G.rodada); if (ms.length > 1) { G.mult = G.mult === 1 ? ms[1] : 1; montarAcoes(); } ev.preventDefault();
        } else if ((k === 'Enter' || k === ' ') && (!emBotao || ev.target.hasAttribute('data-soltar'))) { ev.preventDefault(); confirmarZona(); }
        return;
      }
      if ((G.etapa === 'leitura' || G.etapa === 'queda') && G.resposta === null && seta) { focarEntre(opsEl.children, d); ev.preventDefault(); }
    }
    window.addEventListener('keydown', aoTeclar);

    /* ---------- laço: física em passo fixo, desenho só quando algo se mexe ---------- */
    var raf = 0, ultimo = 0, vivo = true, acum = 0, PASSO = 1 / 120;
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
        if (b.espera <= 0) { b.rastro.push(b.x, b.y); if (b.rastro.length > 16) b.rastro.splice(0, 2); }
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
      if (G.etapa === 'verdes' || G.etapa === 'zona') mexe = true;
      // coração: bate mais rápido quanto mais perto do fundo estão as bolinhas
      if (climaAtual === 'tensao' && relogio >= proxBatida) {
        var fundoY = 0; mundo.bolas.forEach(function (bb) { if (!bb.pousou && bb.espera <= 0) fundoY = Math.max(fundoY, bb.y); });
        var prog = clamp(fundoY / GEO.SENSOR, 0, 1);
        bater(); proxBatida = relogio + (0.95 - 0.5 * prog);
      }
      // parceiro: fala da Fase 1 some sozinha; contagem da leitura
      if (G.etapa === 'leitura' && G.resposta === null) {
        var falta = Math.ceil(G.leituraAte - relogio), s = t('As bolinhas caem em ', 'The balls drop in ', 'Las bolitas caen en ') + Math.max(1, falta) + '…';
        if (msgEl.textContent !== s) msg(s);
      }
      if (mexe) sujo = true;
    }
    function desenhar() {
      if (!sujo) return;
      sujo = false;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, tela.width, tela.height);
      var ox = 0, oy = 0;
      if (tremor > 0 && !calmo) { ox = (sorte() * 2 - 1) * 5 * tremor * dpr; oy = (sorte() * 2 - 1) * 4 * tremor * dpr; }
      c.drawImage(fundo, ox, oy);
      c.setTransform(esc2, 0, 0, esc2, ox, oy);
      var i, b, p, k, sp, sw, x;
      // feixe de mira da zona escolhida
      if ((G.etapa === 'verdes' || G.etapa === 'zona') && G.zonaOk) {
        x = zonaX(G.zona);
        var pulso = 0.55 + 0.45 * Math.sin(relogio * 5), gr = c.createLinearGradient(0, 80, 0, GEO.YDIV);
        gr.addColorStop(0, 'rgba(127,230,255,' + (0.32 * pulso + 0.1) + ')'); gr.addColorStop(1, 'rgba(127,230,255,0)');
        c.fillStyle = gr; c.fillRect(x - 24, 80, 48, GEO.YDIV - 80);
        c.fillStyle = 'rgba(200,250,255,' + (0.35 + 0.3 * pulso) + ')'; c.fillRect(x - 1.5, 80, 3, GEO.YDIV - 80);
      }
      // canaleta que recebeu bolinha
      for (i = 0; i < flashes.length; i++) {
        var fl = flashes[i];
        c.fillStyle = (fl.cor === 'verde' ? 'rgba(45,255,136,' : 'rgba(255,59,92,') + (0.45 * fl.vida) + ')';
        c.fillRect(fl.k * GEO.LARG + 2, GEO.YDIV, GEO.LARG - 4, GEO.H - GEO.YDIV - 4);
      }
      // pinos tocados acendem e pulsam
      sp = SPR.luz; sw = sp.width / esc2; var pw0 = SPR.pino.width / esc2;
      for (i = 0; i < mundo.pinos.length; i++) {
        p = mundo.pinos[i]; if (p.b <= 0.02) continue;
        var s2 = sw * (0.7 + 0.6 * p.b); c.globalAlpha = Math.min(1, p.b * 1.7);
        c.drawImage(sp, p.x - s2 / 2, p.y - s2 / 2, s2, s2);
        s2 = pw0 * (1 + 0.5 * p.b); c.drawImage(SPR.pino, p.x - s2 / 2, p.y - s2 / 2, s2, s2);
      }
      c.globalAlpha = 1;
      // comportas: luz, portinhola que abre, zonas guardadas
      for (k = 0; k < 7; k++) {
        x = zonaX(k);
        var escolhida = (G.etapa === 'verdes' || G.etapa === 'zona') && G.zonaOk && G.zona === k;
        if (escolhida) { c.lineWidth = 5; c.strokeStyle = 'rgba(160,240,255,' + (0.6 + 0.4 * Math.sin(relogio * 6)) + ')'; rr(c, x - 36, 6, 72, 78, 15); c.stroke(); }
        var ab = portas[k], meia = 24 * (1 - ab);
        c.fillStyle = escolhida ? '#bff3ff' : '#7fa8e8';
        c.fillRect(x - 24, 62, meia, 7); c.fillRect(x + 24 - meia, 62, meia, 7);
        var nm = 0; for (i = 0; i < G.memo.length; i++) if (G.memo[i] === k) nm++;
        for (i = 0; i < nm; i++) { circ(c, x - 22 + i * 9, 76, 3.4); c.fillStyle = G.etapa === 'vermelhas' ? '#ff3b5c' : '#2dff88'; c.fill(); }
      }
      // bolinhas com rastro
      for (i = 0; i < mundo.bolas.length; i++) {
        b = mundo.bolas[i]; sp = SPR[b.cor]; if (!sp) continue;
        sw = sp.width / esc2;
        var al = b.sumir !== undefined ? Math.max(0, b.sumir) : 1;
        if (b.espera <= 0 && b.rastro.length > 2 && !b.pousou) {
          var nr = b.rastro.length / 2;
          for (k = 0; k < nr - 1; k++) {
            var f = (k + 1) / nr, s3 = sw * (0.35 + 0.45 * f);
            c.globalAlpha = 0.42 * f * al; c.drawImage(sp, b.rastro[k * 2] - s3 / 2, b.rastro[k * 2 + 1] - s3 / 2, s3, s3);
          }
        }
        c.globalAlpha = al;
        c.drawImage(sp, b.x - sw / 2, b.y - sw / 2, sw, sw);
        if (b.troca > 0) { c.globalAlpha = b.troca * al; c.lineWidth = 4; c.strokeStyle = '#fff'; circ(c, b.x, b.y, GEO.RB * (1.2 + (1 - b.troca) * 2.5)); c.stroke(); }
      }
      c.globalAlpha = 1;
      // faíscas
      for (i = 0; i < parts.length; i++) { p = parts[i]; c.globalAlpha = Math.min(1, p.vida / 0.5); c.fillStyle = p.cor; c.fillRect(p.x - p.tam / 2, p.y - p.tam / 2, p.tam, p.tam); }
      c.globalAlpha = 1;
      // valores que sobem da canaleta
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = fonte(34);
      for (i = 0; i < flutua.length; i++) {
        var ft = flutua[i]; c.globalAlpha = Math.min(1, ft.vida);
        c.lineWidth = 6; c.strokeStyle = 'rgba(4,6,30,.9)'; c.strokeText(ft.txt, clamp(ft.x, 70, GEO.W - 70), ft.y);
        c.fillStyle = ft.cor === 'verde' ? '#7dffb4' : '#ff8fa3'; c.fillText(ft.txt, clamp(ft.x, 70, GEO.W - 70), ft.y);
      }
      c.globalAlpha = 1;
    }
    function laco(ts) {
      if (!vivo) return;
      raf = requestAnimationFrame(laco);
      var dt = ultimo ? Math.min(0.05, Math.max(0, (ts - ultimo) / 1000)) : 1 / 60; ultimo = ts;
      atualizar(dt * vel); desenhar();
    }
    function aoVisibilidade() {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (vivo && !raf) { ultimo = 0; sujo = true; raf = requestAnimationFrame(laco); }
    }
    document.addEventListener('visibilitychange', aoVisibilidade);
    var obs = null;
    function aoRedimensionar() { var r = palco.getBoundingClientRect(); if (Math.round(r.width) !== Lt.W || Math.round(r.height) !== Lt.H) medir(); }
    if (window.ResizeObserver) { obs = new ResizeObserver(aoRedimensionar); obs.observe(palco); } else window.addEventListener('resize', aoRedimensionar);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fontesProntas = true; if (vivo) desenharFundo(); });
    medir();
    telaInicio();
    raf = requestAnimationFrame(laco);

    if (ctx.teste) window.BolinhasDebug = {
      estado: function () {
        return { fase: G.fase, etapa: G.etapa, saldo: G.saldo, saldoF1: G.saldoF1, acertos: [G.acertos[2], G.acertos[3]], rodada: G.rodada, modo: G.modo,
          bolas: mundo.bolas.length, caindo: mundo.bolas.filter(function (b) { return b.espera <= 0 && !b.pousou; }).length, contrato: G.contrato, decisao: G.decisao,
          resposta: G.resposta, certa: G.perg ? G.perg.c : null, opcoes: G.perg ? G.perg.o.length : 0, memo: G.memo.slice(), parceiro: parceiro.nome, semente: semente, mult: G.mult };
      },
      comecar: function (m) { comecar(m || 'ia'); },
      velocidade: function (v) { vel = v || 1; },
      responder: function (i) { if (G.etapa === 'sala') responderSala(i); else responderF1(i); },
      responderCerto: function () { if (G.perg) { if (G.etapa === 'sala') responderSala(G.perg.c); else responderF1(G.perg.c); } },
      zona: function (z) { escolherZona(z); },
      soltar: function () { confirmarZona(); },
      pularCartao: function () { var b = cena.querySelector('[data-ok]'); if (G.etapa === 'cartao' && b) b.click(); },
      pularPara: function (f, dados) {
        timers = []; mundo.bolas = []; fecharCena(); G.lote = null;
        dados = dados || {};
        if (dados.saldo != null) G.saldo = dados.saldo; if (dados.saldoF1 != null) G.saldoF1 = dados.saldoF1;
        if (dados.acertos) { G.acertos[2] = dados.acertos[0]; G.acertos[3] = dados.acertos[1]; }
        if (dados.confs) G.confs = dados.confs.slice();
        pintarOdo(G.saldo);
        if (f === 'contrato') irContrato(); else if (f === 'zona') { G.fase = dados.fase || 2; G.memo = dados.memo || [1, 5]; desenharFundo(); perguntaZona(dados.rodada || 0); }
        else iniciarFase(f);
      }
    };

    return {
      parar: function () {
        vivo = false; cancelAnimationFrame(raf);
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
      return '<p>' + t('Um game show numa parede gigante de pinos! As bolinhas brancas viram <b>verdes</b> (somam o valor da canaleta onde caem) ou <b>vermelhas</b> (descontam; o saldo nunca fica abaixo de zero).',
        'A game show on a giant wall of pegs! White balls turn <b>green</b> (they add the value of the slot they land in) or <b>red</b> (they take it away; the balance never goes below zero).',
        '¡Un concurso en una pared gigante de clavos! Las bolitas blancas se vuelven <b>verdes</b> (suman el valor de la casilla donde caen) o <b>rojas</b> (lo restan; el saldo nunca baja de cero).') + '</p>' +
        '<p><b>' + t('Fase 1 · Queda Livre', 'Round 1 · Free Fall', 'Fase 1 · Caída Libre') + ':</b> ' + t('5 perguntas de 2 opções. Três bolinhas caem das zonas 1, 4 e 7: trave a resposta antes que a primeira chegue lá embaixo. Terminou com saldo zero, acabou o jogo.',
          '5 questions with 2 options. Three balls drop from zones 1, 4 and 7: lock your answer before the first one reaches the bottom. Finish with zero and the game is over.',
          '5 preguntas de 2 opciones. Tres bolitas caen de las zonas 1, 4 y 7: bloquea la respuesta antes de que la primera llegue abajo. Si terminas con cero, se acaba el juego.') + '</p>' +
        '<p><b>' + t('Fases 2 e 3', 'Rounds 2 and 3', 'Fases 2 y 3') + ':</b> ' + t('o parceiro vai para a Sala de Isolamento. Primeiro você escolhe zonas para as verdes grátis (guarde: as vermelhas obrigatórias caem delas no fim!). Em cada pergunta você vê só as opções e escolhe a zona pela confiança no parceiro: centro vale mais, pontas arriscam menos. Na 2ª pergunta pode pedir Duplo, na 3ª Triplo.',
          'your partner goes to the Isolation Booth. First you pick zones for the free greens (remember them: the mandatory reds drop from there at the end!). For each question you only see the options and pick a zone by how much you trust your partner: the middle pays more, the edges risk less. On the 2nd question you can go Double, on the 3rd Triple.',
          'tu compañero se va a la Cabina de Aislamiento. Primero eliges zonas para las verdes gratis (recuérdalas: ¡las rojas obligatorias caen de ahí al final!). En cada pregunta solo ves las opciones y eliges la zona según tu confianza en el compañero: el centro paga más, los lados arriesgan menos. En la 2.ª pregunta puedes pedir Doble y en la 3.ª, Triple.') + '</p>' +
        '<p><b>' + t('O Contrato', 'The Contract', 'El Contrato') + ':</b> ' + t('quem está na Sala, sem saber o saldo, assina (leva o valor garantido: Queda Livre + 5.000 por acerto na Fase 2 + 10.000 por acerto na Fase 3) ou rasga (leva o saldo do painel).',
          'whoever is in the Booth, without knowing the balance, signs (takes the guaranteed amount: Free Fall + 5,000 per right answer in Round 2 + 10,000 per right answer in Round 3) or tears it up (takes the board balance).',
          'quien está en la Cabina, sin saber el saldo, firma (se lleva el valor garantizado: Caída Libre + 5.000 por acierto en la Fase 2 + 10.000 por acierto en la Fase 3) o lo rompe (se lleva el saldo del panel).') + '</p>' +
        '<p>' + t('Fácil: perguntas mais fáceis e parceiro mais forte. Difícil: perguntas difíceis e parceiro mais fraco. Teclado ou controle da TV: ← → escolhem a zona ou a opção, ↑ ↓ o Duplo/Triplo e Enter confirma. O botão «+ −» põe + e − dentro das bolinhas.',
          'Easy: easier questions and a stronger partner. Hard: hard questions and a weaker partner. Keyboard or TV remote: ← → pick the zone or the option, ↑ ↓ the Double/Triple and Enter confirms. The «+ −» button puts + and − inside the balls.',
          'Fácil: preguntas más fáciles y compañero más fuerte. Difícil: preguntas difíciles y compañero más flojo. Teclado o mando de la tele: ← → eligen la zona o la opción, ↑ ↓ el Doble/Triple y Enter confirma. El botón «+ −» pone + y − dentro de las bolitas.') + '</p>';
    },
    iniciar: iniciar,
    logica: { VALORES: VALORES, BONUS: BONUS, GEO: GEO, FIS: FIS, CATEGORIAS: CATEGORIAS, PERSONAGENS: PERSONAGENS, aplicarBola: aplicarBola, valorContrato: valorContrato,
      multiplicadores: multiplicadores, criarSorte: criarSorte, afinidades: afinidades, sortearPergunta: sortearPergunta, prepararPergunta: prepararPergunta,
      iaResponder: iaResponder, iaContrato: iaContrato, criarMundo: criarMundo, soltar: soltar, passoMundo: passoMundo, simularQueda: simularQueda,
      dinheiro: dinheiro, zonaX: zonaX }
  });
})();
