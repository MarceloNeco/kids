/* A Garra — tudo o que se vê, desenhado em código no canvas (nenhuma imagem de fora, nenhum personagem de marca).
   As três máquinas foram inspiradas nas fotos de fliperama que o dono mandou (cabine vermelha de telefone, neon
   verde com parede de tijolo, azul estrelada), com o nome "A GARRA" no letreiro.
     Desenho.ESPACO                  { CW, CH, OX, OY }: tamanho do desenho e onde começa o vidro por dentro
     Desenho.fundo(g, tema, t)       o gabinete atrás: letreiro, colunas, parede do fundo, chão e o buraco
     Desenho.frente(g, tema, t, porta, painel)  mureta de acrílico, reflexo do vidro, base com a portinha do prêmio e o
                                     painel de luzinhas (painel = { fichas, ganhos, tempo })
     Desenho.trilho(g, x, tema)      o carrinho lá em cima (coordenadas do vidro)
     Desenho.garra(g, x, y, abertura, tema)   a garra (y = o "cubo"; as pontas ficam 34 abaixo)
     Desenho.bichinho(g, tipo, x, y, r, ang, op)  um bichinho de pelúcia (op.sombra, op.brilho)
     Desenho.NOMES                   nome de cada bichinho em PT e EN
     Desenho.TEMAS                   cores de cada máquina */
(function (raiz) {
  'use strict';
  var CW = 360, CH = 580, OX = 30, OY = 88, VL = 300, VA = 400, BURACO = 74, MURETA = 240;
  var TEMAS = {
    cabine: { nome: ['Cabine vermelha', 'Red booth'], moldura: '#c8102e', moldura2: '#8e0a20', fundo1: '#3a0f1c', fundo2: '#170812', chao: '#5a1830',
      letreiro: '#151515', texto: '#ffffff', luz: '#ffe27a', metal: '#d9dde4', base: '#c8102e' },
    neon: { nome: ['Neon verde', 'Green neon'], moldura: '#141414', moldura2: '#050505', fundo1: '#1c2622', fundo2: '#0b100e', chao: '#1d3a2a',
      letreiro: '#0a0a0a', texto: '#39ff6a', luz: '#39ff6a', metal: '#cfd6dc', base: '#101010', neon: '#39ff6a', neon2: '#ffd400' },
    estrelas: { nome: ['Estrelas azul', 'Blue stars'], moldura: '#1e2f7a', moldura2: '#111b4d', fundo1: '#1f3a8f', fundo2: '#0d1846', chao: '#2a2f6e',
      letreiro: '#0d1846', texto: '#ffd166', luz: '#7ef9ff', metal: '#e8d9a8', base: '#1e2f7a' }
  };
  var NOMES = {
    urso: ['Ursinho', 'Teddy'], coelho: ['Coelhinha', 'Bunny'], gato: ['Gatinho', 'Kitty'], cachorro: ['Cachorrinho', 'Puppy'],
    sapo: ['Sapinho', 'Froggy'], pinguim: ['Pinguim', 'Penguin'], porquinho: ['Porquinha', 'Piggy'], panda: ['Panda', 'Panda'],
    unicornio: ['Unicórnio', 'Unicorn'], dino: ['Dino', 'Dino'], polvo: ['Polvinho', 'Octopus'], pintinho: ['Pintinho', 'Chick'],
    estrela: ['Estrela dourada', 'Golden star']
  };

  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function circ(g, x, y, r, cor) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = cor; g.fill(); }
  function elip(g, x, y, rx, ry, rot, cor) { g.beginPath(); g.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); g.fillStyle = cor; g.fill(); }
  function brilhoNeon(g, cor, blur) { g.shadowColor = cor; g.shadowBlur = blur; }

  /* ---------- gabinete atrás ---------- */
  function fundo(g, tema, t) {
    var T = TEMAS[tema] || TEMAS.cabine;
    // corpo
    g.fillStyle = T.moldura; rr(g, 0, 0, CW, CH, 18); g.fill();
    // letreiro
    g.fillStyle = T.letreiro; rr(g, 14, 10, CW - 28, 64, 12); g.fill();
    g.save();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '700 38px Fredoka, system-ui, sans-serif';
    if (tema === 'neon') brilhoNeon(g, T.neon, 16);
    if (tema === 'estrelas') brilhoNeon(g, '#ffb300', 10);
    g.fillStyle = T.texto; g.fillText('A GARRA', CW / 2, 44);
    g.restore();
    // lâmpadas em volta do letreiro, piscando alternado
    var n = 14, fase = Math.floor(t * 3) % 2;
    for (var i = 0; i < n; i++) {
      var lx = 24 + i * (CW - 48) / (n - 1), acesa = (i % 2) === fase;
      g.save(); if (acesa) brilhoNeon(g, T.luz, 8);
      circ(g, lx, 15, 3.2, acesa ? T.luz : 'rgba(255,255,255,.25)');
      circ(g, lx, 69, 3.2, !acesa ? T.luz : 'rgba(255,255,255,.25)');
      g.restore();
    }
    // vidro por dentro: parede do fundo
    g.save();
    g.translate(OX, OY);
    var gr = g.createLinearGradient(0, 0, 0, VA);
    gr.addColorStop(0, T.fundo1); gr.addColorStop(1, T.fundo2);
    g.fillStyle = gr; g.fillRect(0, 0, VL, VA);
    if (tema === 'neon') tijolos(g, 'rgba(255,255,255,.05)');
    if (tema === 'cabine') { g.fillStyle = 'rgba(255,120,160,.08)'; for (var k = 0; k < 6; k++) g.fillRect(k * 56, 0, 24, VA); }
    if (tema === 'estrelas') ceuEstrelado(g, t);
    // luz de cima
    var luz = g.createLinearGradient(0, 0, 0, 120);
    luz.addColorStop(0, 'rgba(255,255,255,.22)'); luz.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = luz; g.fillRect(0, 0, VL, 120);
    // chão (só à direita da mureta) e o buraco do prêmio
    g.fillStyle = T.chao; g.fillRect(BURACO, VA - 6, VL - BURACO, 6);
    var b = g.createLinearGradient(0, MURETA, 0, VA);
    b.addColorStop(0, 'rgba(0,0,0,0)'); b.addColorStop(1, 'rgba(0,0,0,.75)');
    g.fillStyle = b; g.fillRect(0, MURETA, BURACO, VA - MURETA);
    g.restore();
  }
  function tijolos(g, cor) {
    g.strokeStyle = cor; g.lineWidth = 1.5;
    for (var y = 0, l = 0; y < VA; y += 22, l++) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(VL, y); g.stroke();
      for (var x = (l % 2) * 26; x < VL; x += 52) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 22); g.stroke(); }
    }
  }
  function ceuEstrelado(g, t) {
    g.save();
    for (var i = 0; i < 26; i++) {
      var x = (i * 73) % VL, y = (i * 131) % (VA - 120) + 10, a = 0.35 + 0.35 * Math.sin(t * 2 + i);
      g.globalAlpha = a; estrela5(g, x, y, 4 + (i % 3), 2, '#fff7c2');
    }
    g.globalAlpha = 0.18; g.strokeStyle = '#7ef9ff'; g.lineWidth = 2;
    for (var h = 0; h < 5; h++) hexagono(g, 40 + h * 58, 60 + (h % 2) * 50, 24);
    g.restore();
  }
  function hexagono(g, x, y, r) {
    g.beginPath();
    for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); }
    g.closePath(); g.stroke();
  }
  function estrela5(g, x, y, r, ri, cor) {
    g.beginPath();
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? ri : r; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
    g.closePath(); g.fillStyle = cor; g.fill();
  }

  /* ---------- na frente: mureta, vidro, colunas e base ---------- */
  function frente(g, tema, t, porta, painel) {
    var T = TEMAS[tema] || TEMAS.cabine;
    g.save();
    g.translate(OX, OY);
    // mureta de acrílico
    g.fillStyle = 'rgba(220,240,255,.28)'; g.fillRect(BURACO - 3, MURETA, 6, VA - MURETA);
    g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(BURACO - 3, MURETA, 2, VA - MURETA);
    g.fillStyle = 'rgba(255,255,255,.7)'; rr(g, BURACO - 5, MURETA - 3, 10, 6, 3); g.fill();
    // reflexo do vidro
    g.fillStyle = 'rgba(255,255,255,.07)';
    g.beginPath(); g.moveTo(VL * 0.55, 0); g.lineTo(VL * 0.75, 0); g.lineTo(VL * 0.35, VA); g.lineTo(VL * 0.15, VA); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.05)';
    g.beginPath(); g.moveTo(VL * 0.82, 0); g.lineTo(VL * 0.88, 0); g.lineTo(VL * 0.48, VA); g.lineTo(VL * 0.42, VA); g.closePath(); g.fill();
    if (tema === 'cabine') {   // os vidrinhos da cabine de telefone nas laterais
      g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2;
      for (var y = 50; y < VA; y += 50) { g.beginPath(); g.moveTo(0, y); g.lineTo(10, y); g.moveTo(VL - 10, y); g.lineTo(VL, y); g.stroke(); }
    }
    g.restore();
    // colunas (por cima do vidro, escondendo as bordas)
    g.fillStyle = T.moldura; g.fillRect(0, OY - 8, OX, VA + 16); g.fillRect(OX + VL, OY - 8, CW - OX - VL, VA + 16);
    g.fillRect(0, OY - 10, CW, 10);
    if (tema === 'neon') {
      g.save(); brilhoNeon(g, T.neon, 14); g.fillStyle = T.neon;
      rr(g, 9, OY, 8, VA, 4); g.fill(); rr(g, CW - 17, OY, 8, VA, 4); g.fill();
      brilhoNeon(g, T.neon2, 10); g.fillStyle = T.neon2;
      rr(g, OX - 3, OY + VA * 0.45, 3, VA * 0.5, 2); g.fill(); rr(g, OX + VL, OY + VA * 0.45, 3, VA * 0.5, 2); g.fill();
      g.restore();
    }
    if (tema === 'cabine') {
      g.strokeStyle = T.moldura2; g.lineWidth = 3;
      for (var yy = OY + 30; yy < OY + VA; yy += 50) { g.beginPath(); g.moveTo(4, yy); g.lineTo(OX - 4, yy); g.moveTo(OX + VL + 4, yy); g.lineTo(CW - 4, yy); g.stroke(); }
    }
    if (tema === 'estrelas') {
      for (var s = 0; s < 6; s++) { estrela5(g, OX / 2, OY + 30 + s * 68, 7, 3, '#ffd166'); estrela5(g, CW - OX / 2, OY + 64 + s * 68, 7, 3, '#ffd166'); }
    }
    // base
    var by = OY + VA + 6;
    g.fillStyle = T.base; g.fillRect(0, by - 6, CW, CH - by + 6);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, by - 6, CW, 6);
    // portinha do prêmio, embaixo do buraco
    var px = OX + 2, pw = BURACO + 10, ph = 58, py = by + 10;
    g.fillStyle = '#0b0b0b'; rr(g, px, py, pw, ph, 10); g.fill();
    g.fillStyle = tema === 'cabine' ? '#ffffff' : tema === 'neon' ? '#39ff6a' : '#ffd166';
    g.font = '700 13px Fredoka, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(porta || 'PRÊMIO', px + pw / 2, py + ph + 10);
    if (tema === 'cabine') { for (var c = 0; c < 6; c++) { g.fillStyle = c % 2 ? '#fff' : '#111'; g.fillRect(px + 6 + c * 13, py + 4, 13, 6); } }
    // painel de luzinhas, como nas máquinas de verdade: fichas, bichinhos e o relógio
    var lx = OX + BURACO + 24, lw = CW - lx - 16, ly = by + 12, lh = 52;
    g.fillStyle = '#050505'; rr(g, lx, ly, lw, lh, 10); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; rr(g, lx, ly, lw, lh, 10); g.stroke();
    if (painel) {
      var itens = [['🪙', painel.fichas, '#ffd166'], ['🧸', painel.ganhos, '#7ef9ff']];
      if (painel.tempo != null) itens.push(['⏱️', painel.tempo, painel.tempo <= 5 && Math.floor(t * 4) % 2 ? '#ff4f6d' : '#39ff6a']);
      g.font = '700 22px Fredoka, system-ui, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left';
      var passo = lw / itens.length;
      itens.forEach(function (it, i) {
        var x0 = lx + passo * i + passo / 2 - 30;
        g.fillStyle = '#ffffff'; g.fillText(it[0], x0, ly + lh / 2 + 1);
        g.save(); brilhoNeon(g, it[2], 8); g.fillStyle = it[2]; g.fillText(String(it[1]), x0 + 28, ly + lh / 2 + 1); g.restore();
      });
    }
  }

  /* ---------- carrinho e garra (coordenadas do vidro) ---------- */
  function trilho(g, x, tema) {
    var T = TEMAS[tema] || TEMAS.cabine;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 4, VL, 6);
    g.fillStyle = T.metal; rr(g, x - 16, 0, 32, 16, 4); g.fill();
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x - 12, 10, 24, 3);
  }
  function garra(g, x, y, ab, tema) {
    var T = TEMAS[tema] || TEMAS.cabine;
    ab = Math.max(0, Math.min(1, ab));
    g.strokeStyle = '#2b2b2b'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 14); g.lineTo(x, y - 8); g.stroke();
    // cubo
    var cg = g.createLinearGradient(x - 12, 0, x + 12, 0);
    cg.addColorStop(0, '#8a8f96'); cg.addColorStop(0.45, T.metal); cg.addColorStop(1, '#6d7178');
    g.fillStyle = cg; rr(g, x - 12, y - 10, 24, 16, 5); g.fill();
    // três dedos: o do meio atrás, os dois dos lados na frente
    g.lineCap = 'round'; g.lineJoin = 'round';
    function dedo(lado, escuro) {
      var j1x = x + lado * (8 + 10 * ab), j1y = y + 16, tx = x + lado * (6 + 18 * ab), ty = y + 34;
      g.strokeStyle = escuro ? '#55595f' : '#3a3d42'; g.lineWidth = 6;
      g.beginPath(); g.moveTo(x + lado * 6, y + 4); g.lineTo(j1x, j1y); g.lineTo(tx, ty); g.lineTo(tx - lado * 6, ty + 2); g.stroke();
      g.strokeStyle = escuro ? '#9aa0a8' : T.metal; g.lineWidth = 3.4;
      g.beginPath(); g.moveTo(x + lado * 6, y + 4); g.lineTo(j1x, j1y); g.lineTo(tx, ty); g.lineTo(tx - lado * 6, ty + 2); g.stroke();
    }
    g.save(); g.globalAlpha = 0.85;
    g.strokeStyle = '#55595f'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x, y + 32); g.stroke();
    g.restore();
    dedo(-1); dedo(1);
  }

  /* ---------- bichinhos ---------- */
  var COR = {
    urso: ['#b07a46', '#e8c89c'], coelho: ['#f7b3cf', '#fff0f6'], gato: ['#f5a33c', '#ffe1b3'], cachorro: ['#ead0a6', '#fff6e6'],
    sapo: ['#6cc04a', '#d9f5a8'], pinguim: ['#2e3654', '#ffffff'], porquinho: ['#ffb8cb', '#ffe0e8'], panda: ['#fbfbfb', '#ffffff'],
    unicornio: ['#fbf6ff', '#ffffff'], dino: ['#4fc0a0', '#fff1a8'], polvo: ['#a77de0', '#e6d4ff'], pintinho: ['#ffd93b', '#fff4b8'],
    estrela: ['#ffcf2e', '#fff3a6']
  };
  function bichinho(g, tipo, x, y, r, ang, op) {
    op = op || {};
    var c = COR[tipo] || COR.urso, k = r;
    g.save(); g.translate(x, y); g.rotate(ang || 0);
    if (op.sombra) { g.save(); g.globalAlpha = 0.25; elip(g, 0, k * 0.95, k * 0.8, k * 0.18, 0, '#000'); g.restore(); }
    // atrás do corpo: orelhas, chifre, crina, tentáculos, espinhos
    if (tipo === 'urso' || tipo === 'panda') {
      var oc = tipo === 'panda' ? '#1f1f24' : c[0];
      circ(g, -k * 0.62, -k * 0.66, k * 0.32, oc); circ(g, k * 0.62, -k * 0.66, k * 0.32, oc);
      if (tipo === 'urso') { circ(g, -k * 0.62, -k * 0.66, k * 0.17, '#e7a98a'); circ(g, k * 0.62, -k * 0.66, k * 0.17, '#e7a98a'); }
    } else if (tipo === 'coelho') {
      elip(g, -k * 0.32, -k * 1.05, k * 0.2, k * 0.55, -0.15, c[0]); elip(g, k * 0.32, -k * 1.05, k * 0.2, k * 0.55, 0.15, c[0]);
      elip(g, -k * 0.32, -k * 1.02, k * 0.1, k * 0.4, -0.15, '#ff8fb8'); elip(g, k * 0.32, -k * 1.02, k * 0.1, k * 0.4, 0.15, '#ff8fb8');
    } else if (tipo === 'gato' || tipo === 'porquinho') {
      [-1, 1].forEach(function (s) {
        g.beginPath(); g.moveTo(s * k * 0.25, -k * 0.85); g.lineTo(s * k * 0.85, -k * 1.08); g.lineTo(s * k * 0.78, -k * 0.38); g.closePath(); g.fillStyle = c[0]; g.fill();
        g.beginPath(); g.moveTo(s * k * 0.4, -k * 0.8); g.lineTo(s * k * 0.75, -k * 0.95); g.lineTo(s * k * 0.72, -k * 0.55); g.closePath(); g.fillStyle = tipo === 'gato' ? '#ffcf9b' : '#ff8fae'; g.fill();
      });
    } else if (tipo === 'sapo') {
      circ(g, -k * 0.42, -k * 0.72, k * 0.32, c[0]); circ(g, k * 0.42, -k * 0.72, k * 0.32, c[0]);
    } else if (tipo === 'unicornio') {
      ['#ff8fb8', '#ffd166', '#7ef9ff', '#c6a4ff'].forEach(function (cor, i) { elip(g, -k * 0.55 + i * k * 0.22, -k * 0.82 + Math.abs(i - 1.5) * k * 0.08, k * 0.2, k * 0.32, -0.5 + i * 0.3, cor); });
      g.beginPath(); g.moveTo(-k * 0.13, -k * 0.85); g.lineTo(0, -k * 1.45); g.lineTo(k * 0.13, -k * 0.85); g.closePath(); g.fillStyle = '#ffd36b'; g.fill();
      g.strokeStyle = '#e8a93a'; g.lineWidth = Math.max(1, k * 0.04);
      g.beginPath(); g.moveTo(-k * 0.09, -k * 1.0); g.lineTo(k * 0.1, -k * 1.06); g.moveTo(-k * 0.05, -k * 1.18); g.lineTo(k * 0.07, -k * 1.23); g.stroke();
      elip(g, -k * 0.62, -k * 0.6, k * 0.12, k * 0.2, -0.6, '#ffc9de'); elip(g, k * 0.62, -k * 0.6, k * 0.12, k * 0.2, 0.6, '#ffc9de');
    } else if (tipo === 'dino') {
      for (var e = -2; e <= 2; e++) {
        var a = -Math.PI / 2 + e * 0.42, ex = Math.cos(a) * k * 0.92, ey = Math.sin(a) * k * 0.92;
        g.beginPath(); g.moveTo(ex + Math.cos(a + 1.57) * k * 0.17, ey + Math.sin(a + 1.57) * k * 0.17); g.lineTo(Math.cos(a) * k * 1.28, Math.sin(a) * k * 1.28);
        g.lineTo(ex - Math.cos(a + 1.57) * k * 0.17, ey - Math.sin(a + 1.57) * k * 0.17); g.closePath(); g.fillStyle = '#ff9f43'; g.fill();
      }
    } else if (tipo === 'polvo') {
      for (var tt = 0; tt < 6; tt++) { var aa = Math.PI * 0.15 + tt * Math.PI * 0.14; circ(g, Math.cos(aa) * k * 0.88, Math.sin(aa) * k * 0.88, k * 0.22, c[0]); }
    } else if (tipo === 'pintinho') {
      elip(g, -k * 0.05, -k * 1.0, k * 0.08, k * 0.2, -0.3, '#ffc61a'); elip(g, k * 0.1, -k * 1.0, k * 0.07, k * 0.18, 0.4, '#ffc61a');
      elip(g, -k * 0.92, k * 0.1, k * 0.2, k * 0.12, 0.6, '#ffc61a'); elip(g, k * 0.92, k * 0.1, k * 0.2, k * 0.12, -0.6, '#ffc61a');
    }
    // corpo
    if (tipo === 'estrela') {
      g.save(); brilhoNeon(g, '#fff3a6', op.brilho ? 18 : 8);
      estrela5(g, 0, k * 0.05, k * 1.15, k * 0.6, c[0]); g.restore();
      estrela5(g, -k * 0.1, -k * 0.05, k * 0.75, k * 0.38, 'rgba(255,255,255,.35)');
    } else {
      var gr = g.createRadialGradient(-k * 0.35, -k * 0.4, k * 0.1, 0, 0, k);
      gr.addColorStop(0, clarear(c[0])); gr.addColorStop(1, c[0]);
      circ(g, 0, 0, k, gr);
      g.save(); g.globalAlpha = 0.12; g.strokeStyle = '#000'; g.lineWidth = Math.max(1, k * 0.05); g.beginPath(); g.arc(0, 0, k * 0.97, 0, Math.PI * 2); g.stroke(); g.restore();
    }
    // barriga / máscara
    if (tipo === 'pinguim') elip(g, 0, k * 0.12, k * 0.66, k * 0.72, 0, c[1]);
    else if (tipo !== 'estrela' && tipo !== 'panda' && tipo !== 'unicornio') elip(g, 0, k * 0.45, k * 0.55, k * 0.42, 0, c[1]);
    if (tipo === 'gato') { g.strokeStyle = '#d9772a'; g.lineWidth = Math.max(1, k * 0.07); g.lineCap = 'round'; [-0.2, 0, 0.2].forEach(function (d) { g.beginPath(); g.moveTo(d * k, -k * 0.92); g.lineTo(d * k * 0.8, -k * 0.68); g.stroke(); }); }
    if (tipo === 'cachorro') { elip(g, -k * 0.86, -k * 0.05, k * 0.24, k * 0.48, 0.25, '#a8774a'); elip(g, k * 0.86, -k * 0.05, k * 0.24, k * 0.48, -0.25, '#a8774a'); elip(g, k * 0.32, -k * 0.12, k * 0.24, k * 0.22, 0, '#c9a074'); }
    if (tipo === 'dino') for (var m = 0; m < 3; m++) circ(g, -k * 0.6 + m * k * 0.12, k * 0.05 + m * k * 0.18, k * 0.06, '#3a9c80');
    // rosto
    var olhoY = tipo === 'sapo' ? -k * 0.72 : -k * 0.1, olhoX = tipo === 'sapo' ? k * 0.42 : k * 0.32, ro = k * (tipo === 'polvo' ? 0.16 : 0.13);
    if (tipo === 'panda') { elip(g, -olhoX, olhoY, k * 0.2, k * 0.25, 0.5, '#1f1f24'); elip(g, olhoX, olhoY, k * 0.2, k * 0.25, -0.5, '#1f1f24'); }
    if (tipo === 'sapo') { circ(g, -olhoX, olhoY, k * 0.2, '#fff'); circ(g, olhoX, olhoY, k * 0.2, '#fff'); }
    [-1, 1].forEach(function (s) {
      circ(g, s * olhoX, olhoY, ro, tipo === 'panda' ? '#fff' : '#1c1c22');
      if (tipo === 'panda') circ(g, s * olhoX, olhoY, ro * 0.7, '#1c1c22');
      circ(g, s * olhoX + ro * 0.35, olhoY - ro * 0.35, ro * 0.38, '#fff');
    });
    var bochecha = tipo === 'pinguim' ? 'rgba(255,140,160,.5)' : 'rgba(255,110,140,.45)';
    elip(g, -k * 0.5, k * 0.12, k * 0.13, k * 0.08, 0, bochecha); elip(g, k * 0.5, k * 0.12, k * 0.13, k * 0.08, 0, bochecha);
    // focinho, bico, nariz e boca
    if (tipo === 'urso') { elip(g, 0, k * 0.2, k * 0.26, k * 0.2, 0, '#f1d6b0'); elip(g, 0, k * 0.12, k * 0.09, k * 0.06, 0, '#3a2414'); }
    else if (tipo === 'porquinho') { elip(g, 0, k * 0.2, k * 0.24, k * 0.16, 0, '#ff9ab5'); circ(g, -k * 0.08, k * 0.2, k * 0.045, '#b34d6e'); circ(g, k * 0.08, k * 0.2, k * 0.045, '#b34d6e'); }
    else if (tipo === 'pinguim' || tipo === 'pintinho') { g.beginPath(); g.moveTo(-k * 0.12, k * 0.08); g.lineTo(k * 0.12, k * 0.08); g.lineTo(0, k * 0.26); g.closePath(); g.fillStyle = '#ff9a1f'; g.fill(); }
    else if (tipo === 'gato' || tipo === 'coelho' || tipo === 'cachorro' || tipo === 'panda') {
      elip(g, 0, k * 0.1, k * 0.07, k * 0.05, 0, tipo === 'coelho' ? '#ff6f9f' : '#3a2a2a');
      if (tipo === 'gato') { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = Math.max(0.8, k * 0.025); [-1, 1].forEach(function (s) { g.beginPath(); g.moveTo(s * k * 0.15, k * 0.15); g.lineTo(s * k * 0.55, k * 0.08); g.moveTo(s * k * 0.15, k * 0.2); g.lineTo(s * k * 0.55, k * 0.25); g.stroke(); }); }
    }
    if (tipo !== 'pinguim' && tipo !== 'pintinho') {
      g.strokeStyle = '#3a2a2a'; g.lineWidth = Math.max(1, k * 0.05); g.lineCap = 'round';
      g.beginPath();
      if (tipo === 'sapo' || tipo === 'estrela' || tipo === 'dino') g.arc(0, k * 0.12, k * (tipo === 'sapo' ? 0.4 : 0.22), 0.2 * Math.PI, 0.8 * Math.PI);
      else { g.arc(-k * 0.07, k * 0.22, k * 0.07, 0.1 * Math.PI, 0.9 * Math.PI); g.moveTo(k * 0.14, k * 0.22 + 0.001); g.arc(k * 0.07, k * 0.22, k * 0.07, 0.1 * Math.PI, 0.9 * Math.PI); }
      g.stroke();
    }
    // etiqueta de pelúcia (como as das fotos)
    if (tipo !== 'estrela' && !op.semEtiqueta) {
      g.save(); g.translate(k * 0.72, k * 0.55); g.rotate(0.5);
      g.fillStyle = '#ffffff'; rr(g, -k * 0.1, 0, k * 0.2, k * 0.26, k * 0.03); g.fill();
      g.fillStyle = '#e63946'; g.fillRect(-k * 0.06, k * 0.06, k * 0.12, k * 0.04);
      g.restore();
    }
    if (op.brilho) { g.save(); g.globalAlpha = 0.9; estrela5(g, k * 0.75, -k * 0.8, k * 0.18, k * 0.07, '#fff'); estrela5(g, -k * 0.85, -k * 0.2, k * 0.12, k * 0.05, '#fff'); g.restore(); }
    g.restore();
  }
  function clarear(hex) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, gg = (n >> 8) & 255, b = n & 255;
    function m(v) { return Math.round(v + (255 - v) * 0.35); }
    return 'rgb(' + m(r) + ',' + m(gg) + ',' + m(b) + ')';
  }

  var D = { ESPACO: { CW: CW, CH: CH, OX: OX, OY: OY }, TEMAS: TEMAS, NOMES: NOMES, fundo: fundo, frente: frente, trilho: trilho, garra: garra, bichinho: bichinho, estrela5: estrela5 };
  if (typeof module !== 'undefined' && module.exports) module.exports = D; else raiz.Desenho = D;
})(typeof self !== 'undefined' ? self : this);
