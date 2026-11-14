/* AQUA — o fundo em carrossel (pedido do dono, 14/Nov/2026: "está muito vazio o fundo").
   Atrás dos frascos passa uma cena de cada vez: fotos de verdade (pasta cenas/, licenças no CREDITOS.md) e cenas
   desenhadas aqui mesmo, no código. O carrossel alterna foto e desenho. A cada frasco fechado com a rolha, o app.js pede
   a próxima cena e ela entra devagar por cima da anterior (uns 2 segundos).
   Nada disso pode atrapalhar o jogo: as fotos ficam um pouco desfocadas, os desenhos são pintados em resolução baixa
   (ficam macios) e um véu claro (ou escuro, nas cenas de noite) fica por cima de tudo, atrás dos frascos.
   Movimento: nas fotos, um zoom bem lento (CSS) e partículas por cima (gotas, brilhos, pétalas, folhas, bolhas,
   confete, estrelas); nos desenhos, a própria cena se mexe (nuvens, chuva, borboletas, vaga-lumes, peixes...).
   Com "reduzir movimento" ligado no aparelho: troca sem transição, sem zoom e sem partículas; o desenho fica parado.

   10 cenas de graça e 3 pacotes da lojinha (mar, junina, espaco), cada um com uma foto e um desenho.
   O "tema" de cada cena diz as cores do vidro e da prateleira (AquaDesenho.CENARIOS) e se o véu é claro ou escuro.

   AquaFundo.CENAS · PACOTES · lista(pacotesQueTem) · iniciar(elemento, { calmo, vel }) · mostrar(id, suave)
   · quadro(dt) · redimensionar() · atual() · tema() */
(function (raiz) {
  'use strict';
  var F = {};
  var TAU = Math.PI * 2;

  // ---------- as cenas ----------
  // foco: o pedaço da foto que fica à vista quando a tela corta a foto (celular em pé corta os lados)
  F.CENAS = [
    { id: 'cachoeira', tipo: 'foto', img: 'cenas/foto-cachoeira.webp', foco: '50% 45%', part: 'gotas', tema: 'chuva', nome: ['Cachoeira na mata', 'Waterfall in the forest', 'Cascada en el bosque'] },
    { id: 'praia', tipo: 'foto', img: 'cenas/foto-praia.webp', foco: '40% 50%', part: 'brilhos', tema: 'chuva', nome: ['Praia de água clarinha', 'Clear-water beach', 'Playa de agua clarita'] },
    { id: 'flores', tipo: 'foto', img: 'cenas/foto-flores.webp', foco: '50% 55%', part: 'petalas', tema: 'chuva', nome: ['Campo de flores', 'Field of flowers', 'Campo de flores'] },
    { id: 'floresta', tipo: 'foto', img: 'cenas/foto-floresta.webp', foco: '50% 50%', part: 'folhas', tema: 'chuva', nome: ['Floresta com raios de sol', 'Forest with sunbeams', 'Bosque con rayos de sol'] },
    { id: 'baloes', tipo: 'foto', img: 'cenas/foto-baloes.webp', foco: '50% 40%', part: 'brilhos', tema: 'chuva', nome: ['Céu com balões coloridos', 'Sky with colorful balloons', 'Cielo con globos de colores'] },
    { id: 'chuva', tipo: 'desenho', tema: 'chuva', nome: ['Tarde de chuva com arco-íris', 'Rainy afternoon with a rainbow', 'Tarde de lluvia con arcoíris'] },
    { id: 'jardim', tipo: 'desenho', tema: 'chuva', nome: ['Jardim com borboletas', 'Garden with butterflies', 'Jardín con mariposas'] },
    { id: 'vagalumes', tipo: 'desenho', tema: 'espaco', nome: ['Floresta à noite com vaga-lumes', 'Night forest with fireflies', 'Bosque de noche con luciérnagas'] },
    { id: 'montanhas', tipo: 'desenho', tema: 'junina', nome: ['Montanhas no pôr do sol', 'Mountains at sunset', 'Montañas al atardecer'] },
    { id: 'nuvens', tipo: 'desenho', tema: 'chuva', nome: ['Nuvens fofas e passarinhos', 'Fluffy clouds and birds', 'Nubes esponjosas y pajaritos'] },
    { id: 'recife', tipo: 'foto', pacote: 'mar', img: 'cenas/foto-recife.webp', foco: '45% 50%', part: 'bolhas', tema: 'mar', nome: ['Recife de corais', 'Coral reef', 'Arrecife de coral'] },
    { id: 'mar', tipo: 'desenho', pacote: 'mar', tema: 'mar', nome: ['Peixes e tartarugas', 'Fish and turtles', 'Peces y tortugas'] },
    { id: 'bandeirinhas', tipo: 'foto', pacote: 'junina', img: 'cenas/foto-bandeirinhas.webp', foco: '50% 30%', part: 'confete', tema: 'chuva', nome: ['Bandeirinhas no céu', 'Party flags in the sky', 'Banderitas en el cielo'] },
    { id: 'junina', tipo: 'desenho', pacote: 'junina', tema: 'junina', nome: ['Fogueira e bandeirinhas', 'Bonfire and party flags', 'Fogata y banderitas'] },
    { id: 'nebulosa', tipo: 'foto', pacote: 'espaco', img: 'cenas/foto-nebulosa.webp', foco: '60% 45%', part: 'estrelas', tema: 'espaco', nome: ['Nebulosa da Bolha (Hubble)', 'Bubble Nebula (Hubble)', 'Nebulosa de la Burbuja (Hubble)'] },
    { id: 'planetas', tipo: 'desenho', pacote: 'espaco', tema: 'espaco', nome: ['Planetas e foguete', 'Planets and a rocket', 'Planetas y cohete'] }
  ];
  F.PACOTES = { mar: ['recife', 'mar'], junina: ['bandeirinhas', 'junina'], espaco: ['nebulosa', 'planetas'] };
  var ESCURO = { espaco: 1 };          // véu escuro (cena de noite) em vez do claro
  function cena(id) { for (var i = 0; i < F.CENAS.length; i++) if (F.CENAS[i].id === id) return F.CENAS[i]; return null; }
  F.cena = cena;

  // a ordem do carrossel: foto, desenho, foto, desenho... com as cenas de graça e as dos pacotes que a criança tem
  F.lista = function (tem) {
    tem = tem || [];
    var fotos = [], desenhos = [];
    F.CENAS.forEach(function (c) { if (!c.pacote || tem.indexOf(c.pacote) >= 0) (c.tipo === 'foto' ? fotos : desenhos).push(c.id); });
    var out = [];
    for (var i = 0; i < Math.max(fotos.length, desenhos.length); i++) { if (fotos[i]) out.push(fotos[i]); if (desenhos[i]) out.push(desenhos[i]); }
    return out;
  };

  // ---------- ajudantes de desenho ----------
  function sorteio(n) {   // o mesmo sorteio sempre: as cenas ficam iguais a cada vez
    var a = n >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function degrade(c, y0, y1, cores) {
    var g = c.createLinearGradient(0, y0, 0, y1);
    // cada cor pode vir sozinha ('#fff', espaçadas por igual) ou com a posição ([0.4, '#fff'])
    cores.forEach(function (p, i) { if (Array.isArray(p)) g.addColorStop(p[0], p[1]); else g.addColorStop(i / (cores.length - 1), p); });
    return g;
  }
  function ceu(c, w, h, cores) { c.fillStyle = degrade(c, 0, h, cores); c.fillRect(0, 0, w, h); }
  function nuvem(c, x, y, r, cor) {
    c.fillStyle = cor || '#fff';
    c.beginPath();
    c.arc(x - r * 1.1, y + r * 0.25, r * 0.7, 0, TAU); c.arc(x - r * 0.35, y - r * 0.25, r * 0.85, 0, TAU);
    c.arc(x + r * 0.5, y - r * 0.1, r * 0.95, 0, TAU); c.arc(x + r * 1.25, y + r * 0.3, r * 0.6, 0, TAU);
    c.rect(x - r * 1.1, y + r * 0.2, r * 2.35, r * 0.75);
    c.fill();
  }
  // um morro: a linha de cima ondulada, fechado até o chão
  function morro(c, w, h, y, amp, ondas, fase, cor) {
    c.fillStyle = cor; c.beginPath(); c.moveTo(0, h);
    for (var x = 0; x <= w + 8; x += 8) c.lineTo(x, y + Math.sin(x / w * ondas * TAU + fase) * amp + Math.sin(x / w * ondas * 2.3 * TAU + fase * 1.7) * amp * 0.35);
    c.lineTo(w, h); c.closePath(); c.fill();
  }
  function serra(c, w, h, y, alto, picos, rnd, cor) {
    c.fillStyle = cor; c.beginPath(); c.moveTo(0, h); c.lineTo(0, y);
    var passo = w / picos;
    for (var i = 0; i <= picos; i++) {
      var x = i * passo;
      c.lineTo(x + passo * 0.5, y - alto * (0.45 + rnd() * 0.55));
      c.lineTo(x + passo, y - alto * rnd() * 0.25);
    }
    c.lineTo(w, h); c.closePath(); c.fill();
  }
  function flor(c, x, y, r, cor, miolo) {
    c.fillStyle = cor;
    for (var i = 0; i < 5; i++) { var a = i * TAU / 5; c.beginPath(); c.arc(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.48, 0, TAU); c.fill(); }
    c.fillStyle = miolo || '#ffd21f'; c.beginPath(); c.arc(x, y, r * 0.38, 0, TAU); c.fill();
  }
  function borboleta(c, x, y, s, t, cor) {
    var bate = 0.25 + 0.75 * Math.abs(Math.sin(t * 9));
    c.save(); c.translate(x, y);
    c.fillStyle = cor;
    [-1, 1].forEach(function (lado) {
      c.save(); c.scale(lado * bate, 1);
      c.beginPath(); c.ellipse(s * 0.55, -s * 0.35, s * 0.6, s * 0.45, -0.5, 0, TAU); c.fill();
      c.beginPath(); c.ellipse(s * 0.45, s * 0.35, s * 0.42, s * 0.32, 0.5, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(s * 0.6, -s * 0.38, s * 0.16, 0, TAU); c.fill();
      c.fillStyle = cor; c.restore();
    });
    c.fillStyle = '#3b2b52'; c.beginPath(); c.ellipse(0, 0, s * 0.12, s * 0.55, 0, 0, TAU); c.fill();
    c.restore();
  }
  function passaro(c, x, y, s, t, cor) {
    var asa = Math.sin(t * 8) * s * 0.5;
    c.strokeStyle = cor || '#33415c'; c.lineWidth = Math.max(1.2, s * 0.16); c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(x - s, y - asa); c.quadraticCurveTo(x - s * 0.45, y - s * 0.15 - asa * 0.3, x, y);
    c.quadraticCurveTo(x + s * 0.45, y - s * 0.15 - asa * 0.3, x + s, y - asa); c.stroke();
  }
  function peixe(c, x, y, s, dir, cor, t) {
    c.save(); c.translate(x, y); c.scale(dir, 1);
    var rabo = Math.sin(t * 7) * s * 0.18;
    c.fillStyle = cor;
    c.beginPath(); c.moveTo(-s * 0.85, 0); c.lineTo(-s * 1.35, -s * 0.42 + rabo); c.lineTo(-s * 1.35, s * 0.42 + rabo); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(0, 0, s, s * 0.55, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(-s * 0.15, 0, s * 0.18, s * 0.5, 0, 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(s * 0.52, -s * 0.12, s * 0.17, 0, TAU); c.fill();
    c.fillStyle = '#17324d'; c.beginPath(); c.arc(s * 0.56, -s * 0.12, s * 0.09, 0, TAU); c.fill();
    c.restore();
  }
  function brilhoEstrela(c, x, y, r, a, cor) {
    c.globalAlpha = a; c.fillStyle = cor || '#fff';
    c.beginPath();
    for (var i = 0; i < 8; i++) { var an = i * Math.PI / 4, rr = i % 2 ? r * 0.3 : r; c.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
    c.closePath(); c.fill(); c.globalAlpha = 1;
  }
  function luz(c, x, y, r, cor, a) {   // um brilho redondo que some nas bordas
    var g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, cor.replace('A', a)); g.addColorStop(1, cor.replace('A', 0));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  }
  function rodar(v, max) { v = v % max; return v < 0 ? v + max : v; }

  // ---------- as cenas desenhadas ----------
  // fixo(c, w, h, rnd, st): a parte parada, pintada uma vez só (e guardada); vivo(c, w, h, t, st): o que se mexe.
  // st guarda o que cada cena sorteou (posições), refeito quando o tamanho muda.
  var DESENHOS = {
    chuva: {
      fixo: function (c, w, h, rnd) {
        ceu(c, w, h, ['#8fc6dc', '#bfe3ea', '#e4f6f2']);
        // arco-íris atrás de tudo
        var cx = w * 0.5, cy = h * 0.78, R = Math.max(w, h) * 0.55, cores = ['#ef3b55', '#ff8a1f', '#ffd21f', '#9bdc28', '#17c3c9', '#2f7bf0', '#9340e0'];
        c.globalAlpha = 0.5; c.lineWidth = R * 0.045;
        cores.forEach(function (cor, i) { c.strokeStyle = cor; c.beginPath(); c.arc(cx, cy, R - i * R * 0.044, Math.PI, TAU); c.stroke(); });
        c.globalAlpha = 1;
        morro(c, w, h, h * 0.8, h * 0.025, 1.2, 0.5, '#7fcf7a');
        morro(c, w, h, h * 0.88, h * 0.02, 1.7, 2.2, '#5bb96a');
        for (var i = 0; i < 26; i++) flor(c, rnd() * w, h * (0.86 + rnd() * 0.12), 4 + rnd() * 5, ['#ff72b6', '#ffd21f', '#ffffff', '#ff8a1f'][i % 4]);
        // poças
        c.fillStyle = 'rgba(160,215,235,.7)';
        [[0.22, 0.95], [0.7, 0.93]].forEach(function (p) { c.beginPath(); c.ellipse(w * p[0], h * p[1], w * 0.08, h * 0.008 + 3, 0, 0, TAU); c.fill(); });
      },
      prep: function (w, h, rnd, st) {
        st.gotas = []; for (var i = 0; i < 70; i++) st.gotas.push([rnd() * w, rnd() * h, 0.7 + rnd() * 0.6]);
        st.nuvens = []; for (i = 0; i < 4; i++) st.nuvens.push([rnd() * w, h * (0.06 + rnd() * 0.22), Math.min(w, h) * (0.07 + rnd() * 0.06), 6 + rnd() * 10]);
      },
      vivo: function (c, w, h, t, st) {
        st.nuvens.forEach(function (n) { nuvem(c, rodar(n[0] + t * n[3], w + n[2] * 5) - n[2] * 2.5, n[1], n[2], 'rgba(255,255,255,.88)'); });
        c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.4; c.lineCap = 'round'; c.beginPath();
        st.gotas.forEach(function (g) {
          var y = rodar(g[1] + t * 260 * g[2], h + 30) - 15, x = rodar(g[0] - y * 0.25, w);
          c.moveTo(x, y); c.lineTo(x - 3.5, y + 13 * g[2]);
        });
        c.stroke();
      }
    },
    jardim: {
      fixo: function (c, w, h, rnd) {
        ceu(c, w, h, ['#9fdcff', '#d6f1ff', '#fff4cf']);
        morro(c, w, h, h * 0.66, h * 0.03, 0.9, 1, '#b5e48c');
        morro(c, w, h, h * 0.74, h * 0.03, 1.4, 3, '#8fd16b');
        morro(c, w, h, h * 0.83, h * 0.02, 2, 5, '#6cc24a');
        for (var i = 0; i < 60; i++) {
          var y = h * (0.72 + rnd() * 0.27), r = 3 + (y / h - 0.7) * 30 * (0.6 + rnd() * 0.5);
          c.strokeStyle = '#3f9a3a'; c.lineWidth = Math.max(1, r * 0.18); c.beginPath(); c.moveTo(0, 0);
          var x = rnd() * w; c.moveTo(x, y); c.lineTo(x, y + r * 2.2); c.stroke();
          flor(c, x, y, r, ['#ff72b6', '#ffffff', '#ffd21f', '#ff8a1f', '#c08cff', '#ef3b55'][i % 6], i % 6 === 2 ? '#ff8a1f' : '#ffd21f');
        }
      },
      prep: function (w, h, rnd, st) {
        st.bb = []; for (var i = 0; i < 7; i++) st.bb.push([rnd() * TAU, 0.12 + rnd() * 0.18, ['#ff72b6', '#ffd21f', '#17c3c9', '#ff8a1f', '#9340e0', '#ffffff', '#2f7bf0'][i], 7 + rnd() * 7, rnd() * 10]);
        st.nuvens = [[rnd() * w, h * 0.12, Math.min(w, h) * 0.08, 7], [rnd() * w, h * 0.24, Math.min(w, h) * 0.06, 4]];
      },
      vivo: function (c, w, h, t, st) {
        // o sol com os raios girando devagar
        var sx = w * 0.82, sy = h * 0.11, sr = Math.min(w, h) * 0.07;
        c.save(); c.translate(sx, sy); c.rotate(t * 0.12); c.fillStyle = 'rgba(255,214,90,.45)';
        for (var i = 0; i < 12; i++) { c.rotate(TAU / 12); c.beginPath(); c.moveTo(sr * 1.15, -sr * 0.12); c.lineTo(sr * 1.9, 0); c.lineTo(sr * 1.15, sr * 0.12); c.fill(); }
        c.restore(); c.fillStyle = '#ffd34d'; c.beginPath(); c.arc(sx, sy, sr, 0, TAU); c.fill();
        st.nuvens.forEach(function (n) { nuvem(c, rodar(n[0] + t * n[3], w + n[2] * 5) - n[2] * 2.5, n[1], n[2], 'rgba(255,255,255,.95)'); });
        st.bb.forEach(function (b) {
          var a = t * b[1] + b[0];
          var x = w * (0.5 + 0.42 * Math.sin(a * 1.3 + b[4])), y = h * (0.62 + 0.18 * Math.sin(a * 2.1 + b[4] * 0.7)) + Math.sin(t * 3 + b[4]) * 6;
          borboleta(c, x, y, b[3], t + b[4], b[2]);
        });
      }
    },
    vagalumes: {
      fixo: function (c, w, h, rnd) {
        ceu(c, w, h, ['#171543', '#2a2f6e', '#2f5a63']);
        for (var i = 0; i < 90; i++) { c.fillStyle = 'rgba(255,255,255,' + (0.3 + rnd() * 0.6) + ')'; c.fillRect(rnd() * w, rnd() * h * 0.55, 1.4, 1.4); }
        var mx = w * 0.22, my = h * 0.14, mr = Math.min(w, h) * 0.06;
        luz(c, mx, my, mr * 4, 'rgba(255,248,210,A)', 0.35);
        c.fillStyle = '#fff6d8'; c.beginPath(); c.arc(mx, my, mr, 0, TAU); c.fill();
        c.fillStyle = 'rgba(220,210,170,.6)'; c.beginPath(); c.arc(mx - mr * 0.3, my - mr * 0.2, mr * 0.18, 0, TAU); c.arc(mx + mr * 0.35, my + mr * 0.25, mr * 0.12, 0, TAU); c.fill();
        // árvores em três camadas, cada uma mais escura e mais perto
        [['#23405a', 0.6, 0.18], ['#1a3147', 0.7, 0.22], ['#0f2033', 0.8, 0.26]].forEach(function (cam, k) {
          for (var x = -20; x < w + 40; x += 26 + rnd() * 40) {
            var base = h * (cam[1] + 0.2), alto = h * cam[2] * (0.7 + rnd() * 0.6), larg = alto * 0.32;
            c.fillStyle = cam[0]; c.beginPath(); c.moveTo(x, base - alto);
            for (var n = 1; n <= 4; n++) { c.lineTo(x - larg * n / 4, base - alto + alto * n / 4.4); c.lineTo(x - larg * n / 8, base - alto + alto * n / 4.4); }
            c.lineTo(x - larg, base); c.lineTo(x + larg, base);
            for (n = 4; n >= 1; n--) { c.lineTo(x + larg * n / 8, base - alto + alto * n / 4.4); c.lineTo(x + larg * n / 4, base - alto + alto * n / 4.4); }
            c.closePath(); c.fill();
          }
          if (k === 2) { c.fillStyle = cam[0]; c.fillRect(0, h * 0.99 - 2, w, h); }
        });
        morro(c, w, h, h * 0.9, h * 0.015, 2, 1, '#0b1a28');
      },
      prep: function (w, h, rnd, st) {
        st.v = []; for (var i = 0; i < 38; i++) st.v.push([rnd() * w, h * (0.35 + rnd() * 0.6), rnd() * TAU, 0.4 + rnd() * 0.8, 10 + rnd() * 26]);
        st.e = []; for (i = 0; i < 14; i++) st.e.push([rnd() * w, rnd() * h * 0.5, rnd() * TAU]);
      },
      vivo: function (c, w, h, t, st) {
        st.e.forEach(function (e) { brilhoEstrela(c, e[0], e[1], 3.2, 0.3 + 0.7 * Math.abs(Math.sin(t * 1.3 + e[2])), '#fffbe0'); });
        st.v.forEach(function (v) {
          var x = v[0] + Math.sin(t * v[3] + v[2]) * v[4], y = v[1] + Math.cos(t * v[3] * 0.7 + v[2] * 1.3) * v[4] * 0.6;
          var a = 0.15 + 0.85 * Math.pow(Math.abs(Math.sin(t * 1.4 + v[2])), 3);
          luz(c, x, y, 11, 'rgba(225,255,120,A)', 0.55 * a);
          c.fillStyle = 'rgba(250,255,190,' + a + ')'; c.beginPath(); c.arc(x, y, 1.9, 0, TAU); c.fill();
        });
      }
    },
    montanhas: {
      fixo: function (c, w, h, rnd) {
        ceu(c, w, h, [[0, '#5b4b9e'], [0.38, '#e46fa0'], [0.6, '#ffb36b'], [0.62, '#ffd59a'], [1, '#6a4f9e']]);
        var sx = w * 0.5, sy = h * 0.6, sr = Math.min(w, h) * 0.11;
        luz(c, sx, sy, sr * 3.2, 'rgba(255,220,140,A)', 0.55);
        c.fillStyle = '#ffe08a'; c.beginPath(); c.arc(sx, sy, sr, Math.PI, TAU); c.fill();
        serra(c, w, h, h * 0.6, h * 0.2, 4, rnd, '#8a5fa8');
        serra(c, w, h, h * 0.62, h * 0.14, 6, rnd, '#6c4a92');
        serra(c, w, h, h * 0.63, h * 0.08, 9, rnd, '#53397a');
        // o lago (da linha do horizonte para baixo)
        c.fillStyle = degrade(c, h * 0.63, h, ['#f0a2a8', '#9c7fc0', '#4f3d80']); c.fillRect(0, h * 0.63, w, h * 0.37);
        morro(c, w, h, h * 0.92, h * 0.015, 1.3, 2, '#3a2a5e');
      },
      prep: function (w, h, rnd, st) {
        st.listras = []; for (var i = 0; i < 16; i++) st.listras.push([h * (0.64 + rnd() * 0.25), rnd() * TAU, 0.3 + rnd() * 0.7]);
        st.bando = { x0: rnd() * w, y: h * 0.25 };
        st.nuvens = [[rnd() * w, h * 0.16, Math.min(w, h) * 0.07, 5], [rnd() * w, h * 0.3, Math.min(w, h) * 0.05, 8]];
      },
      vivo: function (c, w, h, t, st) {
        st.nuvens.forEach(function (n) { nuvem(c, rodar(n[0] + t * n[3], w + n[2] * 5) - n[2] * 2.5, n[1], n[2], 'rgba(255,190,200,.75)'); });
        // o reflexo do sol tremendo na água
        st.listras.forEach(function (l) {
          var largura = (w * 0.06 + (l[0] - h * 0.63) * 0.35) * (0.6 + 0.4 * Math.sin(t * 1.6 * l[2] + l[1]));
          c.fillStyle = 'rgba(255,230,160,' + (0.35 + 0.3 * Math.sin(t * 2 + l[1])) + ')';
          c.fillRect(w * 0.5 - largura / 2 + Math.sin(t + l[1]) * 6, l[0], largura, 2.2);
        });
        // um bando de passarinhos em V atravessando
        var bx = rodar(st.bando.x0 + t * 28, w + 300) - 150, s = Math.min(w, h) * 0.018;
        [[0, 0], [-1, 1], [-2, 2], [-1, -1], [-2, -2]].forEach(function (p, k) { passaro(c, bx + p[0] * s * 2.6, st.bando.y + Math.abs(p[1]) * s * 1.6 + Math.sin(t * 2 + k) * 2, s, t + k * 0.3, '#3d2b5c'); });
      }
    },
    nuvens: {
      fixo: function (c, w, h, rnd) {
        ceu(c, w, h, ['#3fa7f0', '#8fd0ff', '#d6f0ff']);
        for (var i = 0; i < 6; i++) nuvem(c, rnd() * w, h * (0.55 + rnd() * 0.4), Math.min(w, h) * (0.06 + rnd() * 0.05), 'rgba(255,255,255,.35)');
      },
      prep: function (w, h, rnd, st) {
        st.camadas = [];
        [[5, 0.05, 0.6], [11, 0.08, 0.8], [20, 0.11, 0.95]].forEach(function (cfg, k) {
          for (var i = 0; i < 4; i++) st.camadas.push([rnd() * w, h * (0.08 + rnd() * 0.75), Math.min(w, h) * cfg[1] * (0.7 + rnd() * 0.5), cfg[0], cfg[2]]);
        });
        st.aves = []; for (var j = 0; j < 5; j++) st.aves.push([rnd() * w, h * (0.15 + rnd() * 0.5), 14 + rnd() * 18, rnd() * 9]);
        st.pipa = [w * 0.74, h * 0.3];
      },
      vivo: function (c, w, h, t, st) {
        st.camadas.forEach(function (n) { nuvem(c, rodar(n[0] + t * n[3], w + n[2] * 5) - n[2] * 2.5, n[1], n[2], 'rgba(255,255,255,' + n[4] + ')'); });
        st.aves.forEach(function (a) { passaro(c, rodar(a[0] + t * a[2], w + 80) - 40, a[1] + Math.sin(t * 1.5 + a[3]) * 8, Math.min(w, h) * 0.016, t + a[3], '#2c4a6e'); });
        // a pipa balançando, com rabiola
        var px = st.pipa[0] + Math.sin(t * 0.9) * 18, py = st.pipa[1] + Math.cos(t * 1.2) * 10, s = Math.min(w, h) * 0.045, giro = Math.sin(t * 1.4) * 0.25;
        c.strokeStyle = 'rgba(80,80,80,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(px, py + s); c.quadraticCurveTo(px - w * 0.1, h * 0.7, px - w * 0.3, h * 1.05); c.stroke();
        c.save(); c.translate(px, py); c.rotate(giro);
        c.fillStyle = '#ef3b55'; c.beginPath(); c.moveTo(0, -s); c.lineTo(s * 0.75, 0); c.lineTo(0, s); c.lineTo(-s * 0.75, 0); c.closePath(); c.fill();
        c.fillStyle = '#ffd21f'; c.beginPath(); c.moveTo(0, -s); c.lineTo(s * 0.75, 0); c.lineTo(0, 0); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(0, s); c.lineTo(-s * 0.75, 0); c.lineTo(0, 0); c.closePath(); c.fill();
        c.restore();
        c.strokeStyle = '#ff8a1f'; c.lineWidth = 2; c.beginPath(); c.moveTo(px, py + s);
        for (var k = 1; k <= 8; k++) c.lineTo(px + Math.sin(t * 3 + k * 0.8) * 7, py + s + k * s * 0.35);
        c.stroke();
      }
    },
    mar: {
      fixo: function (c, w, h, rnd) {
        ceu(c, w, h, ['#48d1e8', '#1784b8', '#0b4f86', '#083763']);
        // areia, pedras e corais
        morro(c, w, h, h * 0.88, h * 0.02, 1.5, 1, '#e7c78c');
        morro(c, w, h, h * 0.93, h * 0.012, 2.5, 3, '#d9b06c');
        for (var i = 0; i < 7; i++) { c.fillStyle = ['#7d8fa3', '#5f7186'][i % 2]; c.beginPath(); c.ellipse(rnd() * w, h * (0.89 + rnd() * 0.06), 14 + rnd() * 26, 9 + rnd() * 12, 0, Math.PI, TAU); c.fill(); }
        for (i = 0; i < 9; i++) {
          var x = rnd() * w, y = h * (0.89 + rnd() * 0.07), r = Math.min(w, h) * (0.02 + rnd() * 0.025), cor = ['#ff7f7f', '#ff9fd0', '#ffb84d', '#c38bff'][i % 4];
          c.fillStyle = cor;
          for (var k = 0; k < 6; k++) { c.beginPath(); c.arc(x + (rnd() - 0.5) * r * 2, y - rnd() * r * 1.8, r * (0.35 + rnd() * 0.3), 0, TAU); c.fill(); }
        }
        // estrela-do-mar
        c.fillStyle = '#ff8a5c'; var ex = w * 0.3, ey = h * 0.95, er = Math.min(w, h) * 0.025;
        c.beginPath(); for (i = 0; i < 10; i++) { var an = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? er * 0.45 : er; c.lineTo(ex + Math.cos(an) * rr, ey + Math.sin(an) * rr); } c.closePath(); c.fill();
      },
      prep: function (w, h, rnd, st) {
        st.raios = []; for (var i = 0; i < 6; i++) st.raios.push([rnd() * w, 0.05 + rnd() * 0.06, rnd() * TAU]);
        st.algas = []; for (i = 0; i < 9; i++) st.algas.push([rnd() * w, h * (0.9 + rnd() * 0.06), h * (0.12 + rnd() * 0.16), rnd() * TAU, ['#2fae6a', '#46c27e', '#1f8f57'][i % 3]]);
        st.peixes = []; for (i = 0; i < 11; i++) st.peixes.push([rnd() * w, h * (0.15 + rnd() * 0.65), (rnd() < 0.5 ? -1 : 1), 14 + rnd() * 40, Math.min(w, h) * (0.016 + rnd() * 0.022), ['#ffd21f', '#ff8a1f', '#ff72b6', '#9bdc28', '#ffffff', '#ef3b55', '#c08cff'][i % 7], rnd() * 9]);
        st.bolhas = []; for (i = 0; i < 22; i++) st.bolhas.push([rnd() * w, rnd() * h, 2 + rnd() * 4, 18 + rnd() * 30]);
        st.tartaruga = [rnd() * w, h * 0.32];
      },
      vivo: function (c, w, h, t, st) {
        c.save(); c.globalCompositeOperation = 'lighter';
        st.raios.forEach(function (r) {
          var x = r[0] + Math.sin(t * 0.3 + r[2]) * w * 0.05, larg = w * r[1], a = 0.07 + 0.05 * Math.sin(t * 0.8 + r[2]);
          var g = c.createLinearGradient(0, 0, 0, h * 0.85); g.addColorStop(0, 'rgba(220,255,255,' + a + ')'); g.addColorStop(1, 'rgba(220,255,255,0)');
          c.fillStyle = g; c.beginPath(); c.moveTo(x - larg * 0.3, 0); c.lineTo(x + larg * 0.3, 0); c.lineTo(x + larg * 1.6 + w * 0.08, h * 0.85); c.lineTo(x - larg * 0.4 + w * 0.08, h * 0.85); c.closePath(); c.fill();
        });
        c.restore();
        st.algas.forEach(function (a) {
          c.strokeStyle = a[4]; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(a[0], a[1]);
          for (var k = 1; k <= 8; k++) c.lineTo(a[0] + Math.sin(t * 1.3 + a[3] + k * 0.5) * k * 2.2, a[1] - a[2] * k / 8);
          c.stroke();
        });
        // a tartaruga nadando devagar
        var tx = rodar(st.tartaruga[0] + t * 14, w + 200) - 100, ty = st.tartaruga[1] + Math.sin(t * 0.8) * 12, ts = Math.min(w, h) * 0.05, rema = Math.sin(t * 2.4) * 0.5;
        c.save(); c.translate(tx, ty);
        c.fillStyle = '#7ccf8f';
        [[-0.55, -0.55, -rema], [0.45, -0.6, rema], [-0.55, 0.55, rema], [0.45, 0.6, -rema]].forEach(function (p) { c.save(); c.translate(p[0] * ts, p[1] * ts); c.rotate(p[2] + (p[1] < 0 ? -0.6 : 0.6)); c.beginPath(); c.ellipse(0, 0, ts * 0.42, ts * 0.17, 0, 0, TAU); c.fill(); c.restore(); });
        c.beginPath(); c.arc(ts * 1.05, 0, ts * 0.28, 0, TAU); c.fill();
        c.fillStyle = '#3f8f5a'; c.beginPath(); c.ellipse(0, 0, ts * 0.85, ts * 0.65, 0, 0, TAU); c.fill();
        c.strokeStyle = '#8fd6a0'; c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, ts * 0.35, 0, TAU); c.moveTo(ts * 0.35, 0); c.lineTo(ts * 0.8, 0); c.moveTo(-ts * 0.35, 0); c.lineTo(-ts * 0.8, 0); c.stroke();
        c.fillStyle = '#17324d'; c.beginPath(); c.arc(ts * 1.15, -ts * 0.08, ts * 0.06, 0, TAU); c.fill();
        c.restore();
        st.peixes.forEach(function (p) {
          var x = rodar(p[0] + t * p[3] * p[2], w + 120) - 60, y = p[1] + Math.sin(t * 1.1 + p[6]) * 10;
          peixe(c, x, y, p[4], p[2], p[5], t + p[6]);
        });
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.2;
        st.bolhas.forEach(function (b) { var y = rodar(b[1] - t * b[3], h + 20) - 10; c.beginPath(); c.arc(b[0] + Math.sin(t * 2 + b[1]) * 5, y, b[2], 0, TAU); c.stroke(); });
      }
    },
    junina: {
      fixo: function (c, w, h, rnd) {
        ceu(c, w, h, [[0, '#1d1446'], [0.55, '#5d3a9b'], [0.78, '#ff8a5c'], [1, '#ffb36b']]);
        for (var i = 0; i < 60; i++) { c.fillStyle = 'rgba(255,255,255,' + (0.3 + rnd() * 0.6) + ')'; c.fillRect(rnd() * w, rnd() * h * 0.45, 1.5, 1.5); }
        // barraquinhas e a igrejinha ao longe
        c.fillStyle = '#3a2350';
        var ix = w * 0.78, iy = h * 0.8; c.fillRect(ix - 26, iy - 60, 52, 60); c.beginPath(); c.moveTo(ix - 32, iy - 60); c.lineTo(ix, iy - 92); c.lineTo(ix + 32, iy - 60); c.fill(); c.fillRect(ix - 3, iy - 112, 6, 22); c.fillRect(ix - 10, iy - 104, 20, 5);
        for (i = 0; i < 4; i++) {
          var bx = w * (0.08 + i * 0.17), by = h * 0.82, bl = Math.min(w, h) * 0.1;
          c.fillStyle = '#4a2c63'; c.fillRect(bx, by - bl * 0.55, bl, bl * 0.55);
          c.fillStyle = ['#ef3b55', '#ffd21f', '#17c3c9', '#ff72b6'][i];
          c.beginPath(); c.moveTo(bx - 6, by - bl * 0.55); c.lineTo(bx + bl / 2, by - bl * 0.9); c.lineTo(bx + bl + 6, by - bl * 0.55); c.fill();
          c.fillStyle = 'rgba(255,214,120,.8)'; c.fillRect(bx + bl * 0.15, by - bl * 0.4, bl * 0.7, bl * 0.18);
        }
        morro(c, w, h, h * 0.84, h * 0.01, 1, 0, '#6b3e2e');
        c.fillStyle = degrade(c, h * 0.84, h, ['#7a4a33', '#5a3322']); c.fillRect(0, h * 0.86, w, h * 0.14);
      },
      prep: function (w, h, rnd, st) {
        st.fios = [[0.12, 0.05], [0.24, 0.07], [0.37, 0.06]];
        st.faisca = []; for (var i = 0; i < 18; i++) st.faisca.push([rnd(), rnd() * 2, 0.6 + rnd()]);
        st.lanternas = []; for (i = 0; i < 4; i++) st.lanternas.push([w * (0.12 + i * 0.25 + rnd() * 0.05), h * (0.09 + rnd() * 0.05), rnd() * TAU, ['#ff5d73', '#ffce1f', '#17c3c9', '#9bdc28'][i]]);
      },
      vivo: function (c, w, h, t, st) {
        var cores = ['#ef3b55', '#ffd21f', '#2f7bf0', '#9bdc28', '#ff72b6', '#ff8a1f', '#17c3c9'];
        // bandeirinhas em três varais, balançando com o vento
        st.fios.forEach(function (f, k) {
          var y0 = h * f[0], seta = h * f[1], n = Math.max(10, Math.round(w / 34)), lb = w / n;
          c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.2; c.beginPath();
          for (var i = 0; i <= n; i++) { var x = i * lb, y = y0 + Math.sin(i / n * Math.PI) * seta; if (i) c.lineTo(x, y); else c.moveTo(x, y); }
          c.stroke();
          for (i = 0; i < n; i++) {
            var x1 = i * lb + lb * 0.12, x2 = x1 + lb * 0.76, ya = y0 + Math.sin((i + 0.12) / n * Math.PI) * seta, yb = y0 + Math.sin((i + 0.88) / n * Math.PI) * seta;
            var balanco = Math.sin(t * 2.2 + i * 0.7 + k) * lb * 0.12, fundo = Math.max(ya, yb) + lb * 0.9;
            c.fillStyle = cores[(i + k * 3) % cores.length];
            c.beginPath(); c.moveTo(x1, ya); c.lineTo(x2, yb); c.lineTo(x2 + balanco, fundo); c.lineTo((x1 + x2) / 2 + balanco, fundo - lb * 0.32); c.lineTo(x1 + balanco, fundo); c.closePath(); c.fill();
          }
        });
        // lanterninhas de papel acendendo e apagando
        st.lanternas.forEach(function (l) {
          var a = 0.7 + 0.3 * Math.sin(t * 2 + l[2]), x = l[0] + Math.sin(t * 0.8 + l[2]) * 4, y = l[1] + h * 0.33;
          luz(c, x, y, 26, 'rgba(255,200,120,A)', 0.4 * a);
          c.fillStyle = l[3]; c.globalAlpha = a; c.beginPath(); c.ellipse(x, y, 10, 13, 0, 0, TAU); c.fill(); c.globalAlpha = 1;
          c.fillStyle = '#5a3322'; c.fillRect(x - 5, y - 15, 10, 3); c.fillRect(x - 5, y + 12, 10, 3);
        });
        // a fogueira
        var fx = w * 0.2, fy = h * 0.86, fs = Math.min(w, h) * 0.07;
        luz(c, fx, fy - fs * 0.6, fs * 3.2, 'rgba(255,170,60,A)', 0.35 + 0.08 * Math.sin(t * 9));
        c.fillStyle = '#7a4520';
        [[-0.6, 0.35], [0.6, -0.35]].forEach(function (r) { c.save(); c.translate(fx, fy); c.rotate(r[1]); c.fillRect(-fs * 0.9, -fs * 0.1, fs * 1.8, fs * 0.22); c.restore(); });
        [['#ff5d2e', 1], ['#ffa42e', 0.7], ['#ffe27a', 0.42]].forEach(function (ch, k) {
          var hh = fs * 1.6 * ch[1] * (0.85 + 0.15 * Math.sin(t * 11 + k * 2)), ll = fs * 0.75 * ch[1], tremor = Math.sin(t * 13 + k) * fs * 0.08;
          c.fillStyle = ch[0]; c.beginPath(); c.moveTo(fx - ll, fy); c.quadraticCurveTo(fx - ll * 0.9, fy - hh * 0.5, fx + tremor, fy - hh); c.quadraticCurveTo(fx + ll * 0.9, fy - hh * 0.5, fx + ll, fy); c.closePath(); c.fill();
        });
        st.faisca.forEach(function (f) {
          var vida = rodar(t * 0.5 * f[2] + f[1], 1.6), x = fx + (f[0] - 0.5) * fs * 1.2 + Math.sin(t * 3 + f[1] * 9) * 6, y = fy - fs - vida * h * 0.25;
          c.fillStyle = 'rgba(255,220,120,' + Math.max(0, 1 - vida / 1.6) + ')'; c.fillRect(x, y, 2.2, 2.2);
        });
      }
    },
    planetas: {
      fixo: function (c, w, h, rnd) {
        ceu(c, w, h, ['#0b0b2e', '#1d1150', '#2c1458']);
        luz(c, w * 0.25, h * 0.35, Math.max(w, h) * 0.4, 'rgba(255,114,182,A)', 0.18);
        luz(c, w * 0.8, h * 0.7, Math.max(w, h) * 0.4, 'rgba(47,123,240,A)', 0.2);
        for (var i = 0; i < 160; i++) { c.fillStyle = 'rgba(255,255,255,' + (0.25 + rnd() * 0.7) + ')'; var r = rnd() < 0.08 ? 2 : 1.2; c.fillRect(rnd() * w, rnd() * h, r, r); }
      },
      prep: function (w, h, rnd, st) {
        st.e = []; for (var i = 0; i < 24; i++) st.e.push([rnd() * w, rnd() * h, rnd() * TAU, 2 + rnd() * 3]);
        st.cadente = rnd() * 10;
      },
      vivo: function (c, w, h, t, st) {
        st.e.forEach(function (e) { brilhoEstrela(c, e[0], e[1], e[3], 0.25 + 0.75 * Math.abs(Math.sin(t * 1.1 + e[2])), '#fffbe8'); });
        // planeta com anel, as faixas andando devagar
        var px = w * 0.76, py = h * 0.2, pr = Math.min(w, h) * 0.12;
        c.save(); c.translate(px, py); c.rotate(-0.35);
        c.strokeStyle = 'rgba(255,214,140,.85)'; c.lineWidth = pr * 0.12; c.beginPath(); c.ellipse(0, 0, pr * 1.75, pr * 0.42, 0, Math.PI, TAU); c.stroke();
        c.save(); c.beginPath(); c.arc(0, 0, pr, 0, TAU); c.clip();
        c.fillStyle = '#ffb35c'; c.fillRect(-pr, -pr, pr * 2, pr * 2);
        for (var k = -4; k < 6; k++) { c.fillStyle = k % 2 ? 'rgba(239,59,85,.45)' : 'rgba(255,230,160,.55)'; c.fillRect(-pr, -pr + rodar(k * pr * 0.32 + t * 6, pr * 3.2) - pr * 0.4, pr * 2, pr * 0.14); }
        c.fillStyle = 'rgba(0,0,40,.25)'; c.beginPath(); c.arc(pr * 0.45, pr * 0.3, pr * 1.05, 0, TAU); c.fill();
        c.restore();
        c.beginPath(); c.ellipse(0, 0, pr * 1.75, pr * 0.42, 0, 0, Math.PI); c.stroke();
        c.restore();
        // planeta azul com uma luazinha dando a volta
        var qx = w * 0.18, qy = h * 0.68, qr = Math.min(w, h) * 0.075, la = t * 0.6;
        var lx = qx + Math.cos(la) * qr * 2, ly = qy + Math.sin(la) * qr * 0.7, atras = Math.sin(la) < 0;
        function lua() { c.fillStyle = '#d9d4e8'; c.beginPath(); c.arc(lx, ly, qr * 0.25, 0, TAU); c.fill(); }
        if (atras) lua();
        var g = c.createRadialGradient(qx - qr * 0.4, qy - qr * 0.4, qr * 0.1, qx, qy, qr);
        g.addColorStop(0, '#9fe7ff'); g.addColorStop(1, '#2f5fd0'); c.fillStyle = g; c.beginPath(); c.arc(qx, qy, qr, 0, TAU); c.fill();
        c.fillStyle = 'rgba(155,220,40,.7)'; c.beginPath(); c.ellipse(qx - qr * 0.2, qy - qr * 0.1, qr * 0.35, qr * 0.22, 0.4, 0, TAU); c.fill();
        if (!atras) lua();
        // o foguete cruzando a tela de tempos em tempos
        var ciclo = rodar(t, 14) / 14, fx = -0.15 * w + ciclo * w * 1.3, fy = h * 0.85 - ciclo * h * 0.55, fs = Math.min(w, h) * 0.035;
        c.save(); c.translate(fx, fy); c.rotate(-Math.atan2(h * 0.55, w * 1.3) + Math.PI / 2);
        c.fillStyle = ['#ffd21f', '#ff8a1f'][Math.floor(t * 12) % 2];
        c.beginPath(); c.moveTo(-fs * 0.35, fs * 1.1); c.lineTo(0, fs * (1.8 + Math.random() * 0.4)); c.lineTo(fs * 0.35, fs * 1.1); c.fill();
        c.fillStyle = '#ef3b55'; c.beginPath(); c.moveTo(-fs * 0.45, fs * 0.6); c.lineTo(-fs * 0.85, fs * 1.15); c.lineTo(-fs * 0.45, fs * 1.05); c.fill();
        c.beginPath(); c.moveTo(fs * 0.45, fs * 0.6); c.lineTo(fs * 0.85, fs * 1.15); c.lineTo(fs * 0.45, fs * 1.05); c.fill();
        c.fillStyle = '#f2f4ff'; c.beginPath(); c.moveTo(0, -fs * 1.2); c.quadraticCurveTo(fs * 0.55, -fs * 0.4, fs * 0.45, fs * 1.1); c.lineTo(-fs * 0.45, fs * 1.1); c.quadraticCurveTo(-fs * 0.55, -fs * 0.4, 0, -fs * 1.2); c.fill();
        c.fillStyle = '#17c3c9'; c.beginPath(); c.arc(0, -fs * 0.15, fs * 0.22, 0, TAU); c.fill();
        c.restore();
        // estrela cadente
        var cc = rodar(t + st.cadente, 9);
        if (cc < 1.2) {
          var p = cc / 1.2, sx = w * (0.15 + p * 0.5), sy = h * (0.08 + p * 0.25);
          var gg = c.createLinearGradient(sx - w * 0.12, sy - h * 0.06, sx, sy); gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(1, 'rgba(255,255,255,' + (1 - p) + ')');
          c.strokeStyle = gg; c.lineWidth = 2; c.beginPath(); c.moveTo(sx - w * 0.12, sy - h * 0.06); c.lineTo(sx, sy); c.stroke();
        }
      }
    }
  };
  F.DESENHOS = DESENHOS;

  // ---------- partículas por cima das fotos ----------
  var PART = {
    gotas: { n: 40, nasce: function (p, w, h, r) { p.x = r() * w; p.y = r() * h; p.vx = -6; p.vy = 30 + r() * 40; p.r = 1 + r() * 1.8; },
      pinta: function (c, p) { c.fillStyle = 'rgba(235,250,255,.75)'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); c.fill(); } },
    brilhos: { n: 22, nasce: function (p, w, h, r) { p.x = r() * w; p.y = r() * h * 0.85; p.vx = 0; p.vy = 0; p.r = 3 + r() * 5; p.f = r() * TAU; p.vel = 0.6 + r() * 1.2; },
      pinta: function (c, p, t) { brilhoEstrela(c, p.x, p.y, p.r, 0.15 + 0.7 * Math.pow(Math.abs(Math.sin(t * p.vel + p.f)), 4), '#fffbe0'); } },
    petalas: { n: 22, nasce: function (p, w, h, r) { p.x = r() * w; p.y = r() * h; p.vx = 8 + r() * 12; p.vy = 18 + r() * 22; p.r = 3 + r() * 3.5; p.f = r() * TAU; p.cor = ['#ffd1e6', '#ffffff', '#ffb3cf', '#fff1a8'][Math.floor(r() * 4)]; },
      pinta: function (c, p, t) { c.save(); c.translate(p.x + Math.sin(t * 1.5 + p.f) * 10, p.y); c.rotate(t * 1.2 + p.f); c.fillStyle = p.cor; c.beginPath(); c.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, TAU); c.fill(); c.restore(); } },
    folhas: { n: 18, nasce: function (p, w, h, r) { p.x = r() * w; p.y = r() * h; p.vx = 6 + r() * 10; p.vy = 16 + r() * 20; p.r = 4 + r() * 4; p.f = r() * TAU; p.cor = ['#9bdc28', '#ffd21f', '#ff8a1f', '#6cc24a'][Math.floor(r() * 4)]; },
      pinta: function (c, p, t) {
        c.save(); c.translate(p.x + Math.sin(t * 1.2 + p.f) * 14, p.y); c.rotate(Math.sin(t * 2 + p.f) * 1.2); c.fillStyle = p.cor;
        c.beginPath(); c.moveTo(0, -p.r); c.quadraticCurveTo(p.r * 0.8, 0, 0, p.r); c.quadraticCurveTo(-p.r * 0.8, 0, 0, -p.r); c.fill(); c.restore();
      } },
    bolhas: { n: 30, nasce: function (p, w, h, r) { p.x = r() * w; p.y = r() * h; p.vx = 0; p.vy = -(16 + r() * 30); p.r = 2 + r() * 5; p.f = r() * TAU; },
      pinta: function (c, p, t) { c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1.2; c.beginPath(); c.arc(p.x + Math.sin(t * 2 + p.f) * 5, p.y, p.r, 0, TAU); c.stroke(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(p.x + Math.sin(t * 2 + p.f) * 5 - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.25, 0, TAU); c.fill(); } },
    confete: { n: 34, nasce: function (p, w, h, r) { p.x = r() * w; p.y = r() * h; p.vx = -5 + r() * 10; p.vy = 26 + r() * 30; p.r = 3 + r() * 3; p.f = r() * TAU; p.cor = ['#ef3b55', '#ffd21f', '#2f7bf0', '#9bdc28', '#ff72b6', '#ff8a1f'][Math.floor(r() * 6)]; },
      pinta: function (c, p, t) { c.save(); c.translate(p.x, p.y); c.rotate(t * 2 + p.f); c.fillStyle = p.cor; var e = Math.cos(t * 5 + p.f); c.fillRect(-p.r, -p.r * 0.45 * e, p.r * 2, p.r * 0.9 * e); c.restore(); } },
    estrelas: { n: 30, nasce: function (p, w, h, r) { p.x = r() * w; p.y = r() * h; p.vx = 0; p.vy = 0; p.r = 2 + r() * 4; p.f = r() * TAU; p.vel = 0.5 + r(); },
      pinta: function (c, p, t) { brilhoEstrela(c, p.x, p.y, p.r, 0.2 + 0.8 * Math.pow(Math.abs(Math.sin(t * p.vel + p.f)), 3), '#ffffff'); } }
  };

  // ---------- o motor do carrossel ----------
  var opc = { calmo: false, vel: 1 }, base = null, partCv = null, partCtx = null, veu = null;
  var camadas = [], atualId = null, relogio = 0, W = 0, H = 0, K = 0.5, parts = [], tipoPart = null, rndPart = sorteio(77);
  var TRANSICAO = 1.8;   // segundos

  F.iniciar = function (el, o) {
    base = el; opc.calmo = !!(o && o.calmo); opc.vel = (o && o.vel) || 1;
    base.innerHTML = '';
    partCv = document.createElement('canvas'); partCv.className = 'cn-part';
    veu = document.createElement('div'); veu.className = 'cn-veu';
    base.appendChild(partCv); base.appendChild(veu);
    partCtx = partCv.getContext('2d');
    F.redimensionar();
  };
  F.atual = function () { return atualId; };
  F.tema = function () { var c = cena(atualId); return c ? c.tema : 'chuva'; };

  // a resolução dos desenhos: metade da tela de verdade (ficam macios e baratos de pintar)
  F.redimensionar = function () {
    if (!base) return;
    var r = base.getBoundingClientRect(), dpr = Math.min(2, raiz.devicePixelRatio || 1);
    var w = Math.round(r.width || raiz.innerWidth), h = Math.round(r.height || raiz.innerHeight);
    if (!w || !h) return;
    K = 0.55 * dpr;
    var mudou = w !== W || h !== H; W = w; H = h;
    partCv.width = Math.round(W * K); partCv.height = Math.round(H * K);
    if (mudou) camadas.forEach(function (cm) { if (cm.cv) prepararDesenho(cm); });
    pintarCamadas(); pintarParticulas(0);
  };

  function prepararDesenho(cm) {
    var d = DESENHOS[cm.cena.id], w = Math.round(W * K), h = Math.round(H * K);
    cm.cv.width = w; cm.cv.height = h;
    cm.fixo = document.createElement('canvas'); cm.fixo.width = w; cm.fixo.height = h;
    var rnd = sorteio(cm.cena.id.length * 977 + 13);
    d.fixo(cm.fixo.getContext('2d'), w, h, rnd);
    cm.st = {}; d.prep(w, h, sorteio(cm.cena.id.length * 31 + 7), cm.st);
  }

  F.mostrar = function (id, suave) {
    var c = cena(id);
    if (!c || !base || id === atualId) return;
    atualId = id;
    var el = document.createElement('div'); el.className = 'cn-camada cn-' + c.tipo; el.setAttribute('data-cena', id);
    var cm = { cena: c, el: el, cv: null, nasceu: relogio };
    if (c.tipo === 'foto') {
      var img = document.createElement('img'); img.alt = ''; img.src = c.img; img.decoding = 'async';
      img.style.objectPosition = c.foco || '50% 50%';
      el.appendChild(img);
    } else {
      cm.cv = document.createElement('canvas'); el.appendChild(cm.cv);
      prepararDesenho(cm);
    }
    el.classList.toggle('escuro', !!ESCURO[c.tema]);
    veu.classList.toggle('escuro', !!ESCURO[c.tema]);
    base.insertBefore(el, partCv);
    camadas.push(cm);
    var rapido = opc.calmo || !suave;
    el.style.transitionDuration = (rapido ? 0 : TRANSICAO / opc.vel) + 's';
    if (rapido) el.classList.add('visivel');
    else { void el.offsetWidth; el.classList.add('visivel'); }
    // a camada de baixo sai quando a de cima terminou de aparecer
    var velhas = camadas.slice(0, -1);
    setTimeout(function () {
      velhas.forEach(function (v) { if (v.el.parentNode) v.el.parentNode.removeChild(v.el); var i = camadas.indexOf(v); if (i >= 0) camadas.splice(i, 1); });
    }, rapido ? 0 : (TRANSICAO / opc.vel) * 1000 + 80);
    tipoPart = c.tipo === 'foto' && !opc.calmo ? c.part : null;
    pintarCamadas();
  };

  function pintarCamadas() {
    camadas.forEach(function (cm) {
      if (!cm.cv) return;
      var c = cm.cv.getContext('2d'), w = cm.cv.width, h = cm.cv.height;
      c.clearRect(0, 0, w, h); c.drawImage(cm.fixo, 0, 0);
      DESENHOS[cm.cena.id].vivo(c, w, h, opc.calmo ? 3 : relogio, cm.st);
    });
  }

  function pintarParticulas(dt) {
    if (!partCtx) return;
    var w = partCv.width, h = partCv.height, def = tipoPart && PART[tipoPart], i;
    // as partículas da cena anterior vão sumindo; as novas nascem aos poucos
    var alvo = def ? Math.round(def.n * Math.min(1.6, Math.max(0.6, (w * h) / (300 * 600)))) : 0;
    for (i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      if (p.tipo !== tipoPart) p.some = Math.max(0, (p.some == null ? 1 : p.some) - dt * 1.2);
      if (p.some === 0) { parts.splice(i, 1); continue; }
      p.x += p.vx * dt * K * 2; p.y += p.vy * dt * K * 2;
      if (p.y > h + 12) p.y = -10; if (p.y < -12) p.y = h + 10; if (p.x > w + 12) p.x = -10; if (p.x < -12) p.x = w + 10;
    }
    var vivas = parts.filter(function (p) { return p.tipo === tipoPart; }).length;
    if (def && vivas < alvo) for (i = 0; i < Math.min(3, alvo - vivas); i++) { var n = { tipo: tipoPart, some: null }; def.nasce(n, w, h, rndPart); parts.push(n); }
    partCtx.clearRect(0, 0, w, h);
    parts.forEach(function (p) {
      partCtx.globalAlpha = p.some == null ? 1 : p.some;
      PART[p.tipo].pinta(partCtx, p, relogio);
    });
    partCtx.globalAlpha = 1;
  }

  // chamado a cada quadro pelo app.js (com "reduzir movimento" o app não chama: tudo fica parado)
  F.quadro = function (dt) {
    if (!base || opc.calmo) return;
    relogio += dt;
    pintarCamadas(); pintarParticulas(dt);
  };

  F.particulas = function () { return parts.length; };

  if (typeof module !== 'undefined' && module.exports) module.exports = F; else raiz.AquaFundo = F;
})(typeof self !== 'undefined' ? self : this);
