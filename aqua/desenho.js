/* AQUA — o desenho dos frascos no canvas (sem regras do jogo: só pinta o que o app.js manda).
   Tudo aqui é desenho próprio, feito no código: o vidro, o líquido que fica sempre "deitado" (nivelado com o chão)
   mesmo com o frasco inclinado, a ondinha de cima, as bolhas, a rolha, o brilho, a prateleira e o fio do despejo.

   Medidas em "pontos do desenho" (o app.js aplica a escala). A origem de um frasco é o MEIO DO FUNDO de dentro dele;
   para cima o y é negativo. Cada camada de líquido tem UH pontos de altura.

   AquaDesenho.CORES · FRASCOS · CENARIOS · UH · medidas(modelo, cap) · caminho(ctx, m) · frasco(ctx, m, o)
   · prateleira(ctx, x, y, largura, tema) · fio(ctx, x, y1, y2, grossura, cor, t) · estrelinha(ctx, x, y, r, giro, cor) */
(function (raiz) {
  'use strict';
  var D = {};
  D.UH = 30;

  // 12 cores bem diferentes entre si, cada uma com nome e um desenho (para quem confunde as cores)
  D.CORES = [
    { hex: '#ef3b55', pt: 'vermelho', en: 'red', sim: '♥' },
    { hex: '#ff8a1f', pt: 'laranja', en: 'orange', sim: '▲' },
    { hex: '#ffd21f', pt: 'amarelo', en: 'yellow', sim: '★' },
    { hex: '#9bdc28', pt: 'verde-limão', en: 'lime', sim: '✿' },
    { hex: '#17a05b', pt: 'verde', en: 'green', sim: '■' },
    { hex: '#17c3c9', pt: 'turquesa', en: 'turquoise', sim: '◆' },
    { hex: '#2f7bf0', pt: 'azul', en: 'blue', sim: '●' },
    { hex: '#9340e0', pt: 'roxo', en: 'purple', sim: '☾' },
    { hex: '#ff72b6', pt: 'rosa', en: 'pink', sim: '✚' },
    { hex: '#8c5736', pt: 'marrom', en: 'brown', sim: '♪' },
    { hex: '#9aa9b8', pt: 'cinza', en: 'gray', sim: '☂' },
    { hex: '#3b2b52', pt: 'jabuticaba', en: 'dark plum', sim: '✖' }
  ];
  D.EMBACADO = '#d9e2ee';

  // modelos de frasco da lojinha (só aparência). w = largura do corpo; nw/nk = largura e altura do gargalo;
  // ombro = altura da curva entre o corpo e o gargalo; r = canto do fundo; bojo = barriga para os lados
  D.FRASCOS = {
    tubinho: { pt: 'Tubinho', en: 'Little tube', preco: 0, w: 44, nw: 30, nk: 12, ombro: 10, r: 20, bojo: 0 },
    potinho: { pt: 'Potinho', en: 'Little jar', preco: 60, w: 54, nw: 46, nk: 10, ombro: 6, r: 10, bojo: 0 },
    leiteira: { pt: 'Garrafa de leite', en: 'Milk bottle', preco: 90, w: 50, nw: 26, nk: 16, ombro: 26, r: 9, bojo: 0 },
    pocao: { pt: 'Poção', en: 'Potion', preco: 120, w: 50, nw: 22, nk: 18, ombro: 14, r: 23, bojo: 5 },
    gatinho: { pt: 'Gatinho', en: 'Kitty', preco: 180, w: 52, nw: 42, nk: 22, ombro: 6, r: 16, bojo: 0 },
    foguete: { pt: 'Foguete', en: 'Rocket', preco: 240, w: 46, nw: 14, nk: 6, ombro: 36, r: 7, bojo: 0 }
  };
  D.ORDEM_FRASCOS = ['tubinho', 'potinho', 'leiteira', 'pocao', 'gatinho', 'foguete'];

  // cenários da lojinha: o fundo é do estilo.css (classe cen-<id> no jogo); aqui ficam as cores do vidro e da prateleira
  D.CENARIOS = {
    chuva: { pt: 'Tarde de chuva', en: 'Rainy afternoon', preco: 0, traco: 'rgba(18,62,92,.82)', vidro: 'rgba(255,255,255,.30)', tabua: ['#e0a56a', '#b9793f', '#7d4c22'] },
    mar: { pt: 'Fundo do mar', en: 'Under the sea', preco: 80, traco: 'rgba(232,250,255,.9)', vidro: 'rgba(255,255,255,.16)', tabua: ['#ffd9a8', '#f2a36b', '#b8603a'] },
    junina: { pt: 'Festa junina', en: 'June party', preco: 150, traco: 'rgba(74,36,16,.85)', vidro: 'rgba(255,255,255,.34)', tabua: ['#f6c56f', '#d99a3c', '#8f5a1c'] },
    espaco: { pt: 'Espaço', en: 'Outer space', preco: 200, traco: 'rgba(226,214,255,.92)', vidro: 'rgba(255,255,255,.12)', tabua: ['#c9c2e6', '#8c83b8', '#514a7a'] }
  };
  D.ORDEM_CENARIOS = ['chuva', 'mar', 'junina', 'espaco'];

  // as medidas de um modelo para frascos de "cap" camadas
  D.medidas = function (modelo, cap) {
    var f = D.FRASCOS[modelo] || D.FRASCOS.tubinho, h = cap * D.UH + 4;
    return { modelo: modelo, cap: cap, w: f.w, nw: f.nw, nk: f.nk, ombro: f.ombro, r: f.r, bojo: f.bojo, h: h,
      topo: -(h + f.ombro + f.nk),                 // y da boca
      alto: h + f.ombro + f.nk + 12,               // com a rolha
      largo: f.w + 2 * f.bojo + (modelo === 'foguete' ? 22 : 10) };
  };

  // o contorno de dentro do frasco (da boca, pela esquerda, pelo fundo, até a boca de novo)
  D.caminho = function (ctx, m) {
    var w2 = m.w / 2, n2 = m.nw / 2, yb = -m.h, ys = -(m.h + m.ombro), b = m.bojo, meio = (yb - m.r) / 2;
    ctx.beginPath();
    ctx.moveTo(-n2, m.topo);
    ctx.lineTo(-n2, ys);
    ctx.quadraticCurveTo(-w2, ys + (m.modelo === 'foguete' ? m.ombro * 0.45 : 0), -w2, yb);
    if (b) ctx.quadraticCurveTo(-w2 - 2 * b, meio, -w2, -m.r); else ctx.lineTo(-w2, -m.r);
    ctx.quadraticCurveTo(-w2, 0, -w2 + m.r, 0);
    ctx.lineTo(w2 - m.r, 0);
    ctx.quadraticCurveTo(w2, 0, w2, -m.r);
    if (b) ctx.quadraticCurveTo(w2 + 2 * b, meio, w2, yb); else ctx.lineTo(w2, yb);
    ctx.quadraticCurveTo(w2, ys + (m.modelo === 'foguete' ? m.ombro * 0.45 : 0), n2, ys);
    ctx.lineTo(n2, m.topo);
    ctx.closePath();
  };

  function retArred(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // enfeites de cada modelo, por trás do vidro (orelhas do gatinho, asas do foguete)
  function enfeitesAtras(ctx, m, tema) {
    if (m.modelo === 'gatinho') {
      ctx.fillStyle = tema.vidro; ctx.strokeStyle = tema.traco; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
      [-1, 1].forEach(function (s) {
        ctx.beginPath(); ctx.moveTo(s * (m.nw / 2 + 1), m.topo + 1); ctx.lineTo(s * (m.nw / 2 + 4), m.topo - 15); ctx.lineTo(s * (m.nw / 2 - 15), m.topo + 1); ctx.closePath();
        ctx.fill(); ctx.stroke();
      });
    }
    if (m.modelo === 'foguete') {
      ctx.fillStyle = '#ff5d73'; ctx.strokeStyle = tema.traco; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
      [-1, 1].forEach(function (s) {
        ctx.beginPath(); ctx.moveTo(s * m.w / 2, -34); ctx.lineTo(s * (m.w / 2 + 11), -4); ctx.lineTo(s * (m.w / 2 + 11), 2); ctx.lineTo(s * m.w / 2, -8); ctx.closePath();
        ctx.fill(); ctx.stroke();
      });
    }
  }
  // enfeites na frente do vidro (carinha do gatinho, rosca do potinho, fita da poção)
  function enfeitesFrente(ctx, m, tema) {
    var y;
    if (m.modelo === 'gatinho') {
      y = m.topo + m.nk * 0.62;
      ctx.fillStyle = tema.traco;
      ctx.beginPath(); ctx.arc(-9, y - 3, 2.2, 0, 7); ctx.arc(9, y - 3, 2.2, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-2.4, y + 1); ctx.lineTo(2.4, y + 1); ctx.lineTo(0, y + 4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = tema.traco; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-6, y + 3); ctx.lineTo(-16, y + 1); ctx.moveTo(-6, y + 5); ctx.lineTo(-16, y + 7);
      ctx.moveTo(6, y + 3); ctx.lineTo(16, y + 1); ctx.moveTo(6, y + 5); ctx.lineTo(16, y + 7); ctx.stroke();
    }
    if (m.modelo === 'potinho') {
      ctx.strokeStyle = tema.traco; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(-m.nw / 2, m.topo + 4); ctx.lineTo(m.nw / 2, m.topo + 4); ctx.moveTo(-m.nw / 2, m.topo + 8); ctx.lineTo(m.nw / 2, m.topo + 8); ctx.stroke();
    }
    if (m.modelo === 'pocao') {
      y = -(m.h + m.ombro) - 5;
      ctx.fillStyle = '#ff5d73'; retArred(ctx, -m.nw / 2 - 2, y, m.nw + 4, 5, 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(m.nw / 2 + 1, y + 3); ctx.lineTo(m.nw / 2 + 9, y + 12); ctx.lineTo(m.nw / 2 + 3, y + 13); ctx.closePath(); ctx.fill();
    }
  }

  /* Desenha um frasco. O chamador já pôs a origem no meio do fundo, girou o frasco de "ang" e aplicou a escala.
     o = { unidades: [{ c, visto }] do fundo para a boca, ajuste: { c, q } (q > 0 = mais líquido da cor c por cima;
           q < 0 = tira esse tanto de cima), ang (giro do frasco, em radianos), onda (balanço do líquido), t (segundos),
           rolha (0 a 1), brilho (0 a 1), destaque (0 a 1, anel da dica), extra (frasco de ajuda), simbolos,
           bolhas: [{ x, y, r }], tema, revela (0 a 1, clarão da camada que apareceu) } */
  D.frasco = function (ctx, m, o) {
    var tema = o.tema || D.CENARIOS.chuva, UH = D.UH, i;
    var ang = (o.ang || 0) + (o.onda || 0);
    var dx = Math.sin(ang), dy = Math.cos(ang);        // para onde é "para baixo" (o chão), visto de dentro do frasco
    var tx = Math.cos(ang), ty = -Math.sin(ang);       // a linha do nível do líquido

    // as faixas de líquido: alturas (em pontos) do fundo para cima
    var faixas = [];
    for (i = 0; i < o.unidades.length; i++) faixas.push({ c: o.unidades[i].c, visto: o.unidades[i].visto !== false, q: 1 });
    if (o.ajuste && o.ajuste.q > 0) faixas.push({ c: o.ajuste.c, visto: true, q: o.ajuste.q });
    if (o.ajuste && o.ajuste.q < 0) {
      var tira = -o.ajuste.q;
      while (tira > 0 && faixas.length) { var u = faixas[faixas.length - 1]; if (u.q <= tira + 1e-6) { tira -= u.q; faixas.pop(); } else { u.q -= tira; tira = 0; } }
    }

    // anel da dica e brilho do frasco pronto, por trás
    if (o.destaque > 0) {
      ctx.save(); D.caminho(ctx, m); ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = 'rgba(255,206,31,' + (0.35 + 0.55 * o.destaque) + ')'; ctx.stroke(); ctx.restore();
    }
    if (o.brilho > 0 && faixas.length) {
      ctx.save(); D.caminho(ctx, m); ctx.shadowColor = D.CORES[faixas[0].c].hex; ctx.shadowBlur = 26 * o.brilho;
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,' + (0.75 * o.brilho) + ')'; ctx.stroke(); ctx.restore();
    }
    enfeitesAtras(ctx, m, tema);

    // por dentro do vidro
    ctx.save();
    D.caminho(ctx, m); ctx.fillStyle = tema.vidro; ctx.fill();
    ctx.clip();
    var alt = 0, bordas = [0];
    for (i = 0; i < faixas.length; i++) { alt += faixas[i].q * UH; bordas.push(alt); }
    var L = 320;
    // de cima para baixo: cada cor pinta "tudo abaixo do seu nível"; a de baixo pinta por cima da de cima
    for (i = faixas.length - 1; i >= 0; i--) {
      var H = bordas[i + 1], px = 0, py = -H, s, topo = i === faixas.length - 1;
      ctx.beginPath();
      if (topo && o.ondinha) {
        for (s = -90; s <= 90; s += 6) {
          var v = Math.sin(s * 0.16 + o.t * 3.1) * o.ondinha;
          if (s === -90) ctx.moveTo(px + tx * -L + dx * 0, py + ty * -L);
          ctx.lineTo(px + tx * s - dx * v, py + ty * s - dy * v);
        }
        ctx.lineTo(px + tx * L, py + ty * L);
      } else { ctx.moveTo(px - tx * L, py - ty * L); ctx.lineTo(px + tx * L, py + ty * L); }
      ctx.lineTo(px + tx * L + dx * 2 * L, py + ty * L + dy * 2 * L);
      ctx.lineTo(px - tx * L + dx * 2 * L, py - ty * L + dy * 2 * L);
      ctx.closePath();
      ctx.fillStyle = faixas[i].visto ? D.CORES[faixas[i].c].hex : D.EMBACADO;
      ctx.fill();
    }
    // a pele do líquido (linha mais clara no nível de cima)
    if (faixas.length) {
      ctx.beginPath(); ctx.moveTo(-tx * L, -alt - ty * L); ctx.lineTo(tx * L, -alt + ty * L);
      ctx.lineWidth = 2.4; ctx.strokeStyle = 'rgba(255,255,255,.42)'; ctx.stroke();
    }
    // em pé: "?" nas camadas escondidas, desenho de cada cor (se ligado) e bolhas
    if (Math.abs(ang) < 0.12) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (i = 0; i < faixas.length; i++) {
        var yc = -(bordas[i] + bordas[i + 1]) / 2;
        if (!faixas[i].visto) { ctx.font = '700 19px Fredoka, system-ui, sans-serif'; ctx.fillStyle = 'rgba(40,70,110,.6)'; ctx.fillText('?', 0, yc + 1); }
        else if (o.simbolos && faixas[i].q > 0.7) { ctx.font = '15px system-ui, sans-serif'; ctx.fillStyle = faixas[i].c === 2 || faixas[i].c === 3 ? 'rgba(60,50,0,.7)' : 'rgba(255,255,255,.9)'; ctx.fillText(D.CORES[faixas[i].c].sim, 0, yc + 1); }
      }
      if (o.bolhas) {
        ctx.lineWidth = 1.3;
        for (i = 0; i < o.bolhas.length; i++) {
          var b = o.bolhas[i]; if (b.y > alt - 3) continue;
          ctx.beginPath(); ctx.arc(b.x, -b.y, b.r, 0, 7); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.stroke();
        }
      }
    }
    // clarão da camada que acabou de aparecer no frasco embaçado
    if (o.revela > 0) { ctx.fillStyle = 'rgba(255,255,255,' + (0.7 * o.revela) + ')'; ctx.fillRect(-60, -alt - 4, 120, UH + 4); }
    // volume do vidro: escuro nas beiradas, claro no meio, e os dois reflexos
    var g = ctx.createLinearGradient(-m.w / 2, 0, m.w / 2, 0);
    g.addColorStop(0, 'rgba(0,20,50,.20)'); g.addColorStop(0.3, 'rgba(255,255,255,.10)'); g.addColorStop(0.7, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,20,50,.24)');
    ctx.fillStyle = g; ctx.fillRect(-m.w, m.topo - 10, m.w * 2, -m.topo + 20);
    ctx.fillStyle = 'rgba(255,255,255,.55)'; retArred(ctx, -m.w / 2 + 6, -m.h + 6, 5, m.h - m.r - 10, 2.5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.28)'; retArred(ctx, m.w / 2 - 9, -m.h + 16, 2.5, m.h * 0.45, 1.2); ctx.fill();
    // frasco embaçado: uma névoa leve por cima de tudo
    if (o.coberto) { ctx.fillStyle = 'rgba(235,242,250,.16)'; ctx.fillRect(-m.w, m.topo - 10, m.w * 2, -m.topo + 20); }
    ctx.restore();

    // o contorno do vidro e a boca
    D.caminho(ctx, m); ctx.lineJoin = 'round'; ctx.lineWidth = 3;
    ctx.strokeStyle = o.extra ? '#f0a800' : tema.traco;
    if (o.extra) ctx.setLineDash([7, 5]);
    ctx.stroke(); ctx.setLineDash([]);
    retArred(ctx, -m.nw / 2 - 3.5, m.topo - 3, m.nw + 7, 6.5, 3.2);
    ctx.fillStyle = o.extra ? '#ffd76a' : 'rgba(255,255,255,.85)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = o.extra ? '#c98a00' : tema.traco; ctx.stroke();
    enfeitesFrente(ctx, m, tema);

    // a rolha: desce de cima e encaixa na boca
    if (o.rolha > 0) {
      var p = Math.min(1, o.rolha), yr = m.topo - 9 - (1 - p) * (1 - p) * 46, lr = m.nw / 2;
      ctx.save(); ctx.globalAlpha = Math.min(1, p * 2.5);
      ctx.beginPath(); ctx.moveTo(-lr - 2.5, yr); ctx.lineTo(lr + 2.5, yr); ctx.lineTo(lr - 0.5, yr + 15); ctx.lineTo(-lr + 0.5, yr + 15); ctx.closePath();
      ctx.fillStyle = '#c08a52'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#7a4d22'; ctx.stroke();
      ctx.fillStyle = 'rgba(90,50,15,.45)'; ctx.fillRect(-lr * 0.5, yr + 4, 2, 2); ctx.fillRect(lr * 0.2, yr + 8, 2, 2); ctx.fillRect(-lr * 0.1, yr + 3, 1.6, 1.6);
      ctx.restore();
    }
  };

  // a prateleira de madeira onde os frascos de uma fileira ficam em pé
  D.prateleira = function (ctx, x, y, largura, alto, tema) {
    var tb = (tema || D.CENARIOS.chuva).tabua, g = ctx.createLinearGradient(0, y, 0, y + alto);
    g.addColorStop(0, tb[0]); g.addColorStop(0.55, tb[1]); g.addColorStop(1, tb[2]);
    ctx.save();
    ctx.shadowColor = 'rgba(0,30,50,.28)'; ctx.shadowBlur = alto; ctx.shadowOffsetY = alto * 0.5;
    retArred(ctx, x, y, largura, alto, alto * 0.45); ctx.fillStyle = g; ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; retArred(ctx, x + alto * 0.6, y + alto * 0.16, largura - alto * 1.2, alto * 0.16, alto * 0.08); ctx.fill();
  };

  // o fio de líquido que escorre da boca de um frasco até o nível do outro
  D.fio = function (ctx, x, y1, y2, grossura, cor, t) {
    if (y2 <= y1) return;
    ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = cor; ctx.lineWidth = grossura;
    ctx.beginPath(); ctx.moveTo(x, y1);
    var n = 6, i;
    for (i = 1; i <= n; i++) { var y = y1 + (y2 - y1) * i / n; ctx.lineTo(x + Math.sin(t * 22 + i * 1.7) * grossura * 0.09, y); }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.38)'; ctx.lineWidth = grossura * 0.28;
    ctx.beginPath(); ctx.moveTo(x - grossura * 0.2, y1 + grossura); ctx.lineTo(x - grossura * 0.2, y2 - grossura * 0.5); ctx.stroke();
    ctx.restore();
  };

  // estrelinha de quatro pontas (brilho do frasco pronto e da comemoração)
  D.estrelinha = function (ctx, x, y, r, giro, cor) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(giro || 0); ctx.fillStyle = cor || '#fff';
    ctx.beginPath();
    for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4, rr = i % 2 ? r * 0.32 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill(); ctx.restore();
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = D; else raiz.AquaDesenho = D;
})(typeof self !== 'undefined' ? self : this);
