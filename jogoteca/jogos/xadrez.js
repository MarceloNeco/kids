/* Jogoteca — Xadrez de guerra (dono, 20/Nov/2026: "com bastante animação, como se fosse uma guerra pra quem ganha").
   O Exército Azul (embaixo, começa; contra o computador é você) contra o Exército Vermelho, num campo de batalha 8×8.
   Regras completas: roque, en passant, promoção (o peão vira dama sozinho), xeque, xeque-mate, afogamento e empates
   (só os reis, 50 lances sem captura nem peão, a mesma posição 3 vezes). Toque na peça: as casas aonde ela pode ir
   acendem (as de ataque com ⚔️). Captura vira batalha: a peça avança, as espadas batem, a outra explode (POW!), a tela
   treme e a presa vai para a fila de prisioneiros. Xeque toca a corneta; xeque-mate derruba o rei e solta os fogos.
   Computador: fácil (olha 1 lance e se distrai), médio (2 lances), difícil (3 lances e confere as trocas até o fim).
   Lógica pura em "logica" (testes no Node, com contagem de lances "perft"); efeitos em jogos/batalha.js.
   Casas: 0 = a8 … 7 = h8, 56 = a1 … 63 = h1. Peças: PNBRQK (Azul, maiúsculas) e pnbrqk (Vermelho). */
(function () {
  'use strict';

  /* ================= lógica pura ================= */
  var VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  var DN = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  var DB = [[-1, -1], [-1, 1], [1, -1], [1, 1]], DR = [[-1, 0], [1, 0], [0, -1], [0, 1]], DQ = DB.concat(DR);
  var corDe = function (p) { return p ? (p === p.toUpperCase() ? 'w' : 'b') : null; };
  var outra = function (c) { return c === 'w' ? 'b' : 'w'; };
  function casa(nome) { return (8 - +nome[1]) * 8 + (nome.charCodeAt(0) - 97); }
  function nomeCasa(i) { return String.fromCharCode(97 + (i % 8)) + (8 - Math.floor(i / 8)); }

  function inicial() { return deFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); }
  function deFEN(fen) {
    var p = fen.split(' '), b = [], i;
    p[0].split('/').forEach(function (linha) { for (i = 0; i < linha.length; i++) { var ch = linha[i]; if (/\d/.test(ch)) for (var k = 0; k < +ch; k++) b.push(''); else b.push(ch); } });
    var s = { b: b, vez: p[1] || 'w', roque: p[2] && p[2] !== '-' ? p[2] : '', ep: p[3] && p[3] !== '-' ? casa(p[3]) : -1, meio: +(p[4] || 0), n: +(p[5] || 1), hist: {} };
    s.hist[chave(s)] = 1;
    return s;
  }
  function chave(s) { return s.b.join(',') + s.vez + s.roque + s.ep; }

  function atacada(b, alvo, por) {   // a casa "alvo" está sob ataque de alguma peça da cor "por"?
    var r = alvo >> 3, c = alvo & 7, i, k, rr, cc, p;
    var peao = por === 'w' ? 'P' : 'p', dr = por === 'w' ? 1 : -1;   // o peão azul ataca para cima: está numa linha abaixo
    for (k = -1; k <= 1; k += 2) { rr = r + dr; cc = c + k; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === peao) return true; }
    var N = por === 'w' ? 'N' : 'n', K = por === 'w' ? 'K' : 'k';
    for (i = 0; i < 8; i++) { rr = r + DN[i][0]; cc = c + DN[i][1]; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === N) return true; }
    for (i = 0; i < 8; i++) { rr = r + DQ[i][0]; cc = c + DQ[i][1]; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === K) return true; }
    var B = por === 'w' ? 'B' : 'b', R = por === 'w' ? 'R' : 'r', Q = por === 'w' ? 'Q' : 'q';
    for (i = 0; i < 8; i++) {
      var d = DQ[i], diag = i < 4;
      rr = r + d[0]; cc = c + d[1];
      while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
        p = b[rr * 8 + cc];
        if (p) { if (p === Q || (diag ? p === B : p === R)) return true; break; }
        rr += d[0]; cc += d[1];
      }
    }
    return false;
  }
  function reiDe(b, cor) { var K = cor === 'w' ? 'K' : 'k'; return b.indexOf(K); }
  function emXeque(s, cor) { var k = reiDe(s.b, cor || s.vez); return k >= 0 && atacada(s.b, k, outra(cor || s.vez)); }

  function pseudo(s, soCapturas) {
    var b = s.b, eu = s.vez, ms = [], i, r, c, p, alvo, k, rr, cc;
    function add(de, para, extra) {
      if (extra && extra.promo === true) { (eu === 'w' ? 'QRBN' : 'qrbn').split('').forEach(function (pr) { add(de, para, { promo: pr }); }); return; }   // promoção: dama, torre, bispo ou cavalo
      var m = { de: de, para: para, peca: b[de], captura: b[para] || '' }; if (extra) for (var x in extra) m[x] = extra[x]; ms.push(m);
    }
    for (i = 0; i < 64; i++) {
      p = b[i]; if (!p || corDe(p) !== eu) continue;
      r = i >> 3; c = i & 7; var t = p.toLowerCase();
      if (t === 'p') {
        var dir = eu === 'w' ? -1 : 1, ini = eu === 'w' ? 6 : 1, ult = eu === 'w' ? 0 : 7;
        rr = r + dir;
        if (rr >= 0 && rr < 8) {
          if (!b[rr * 8 + c] && (!soCapturas || rr === ult)) {
            add(i, rr * 8 + c, rr === ult ? { promo: true } : null);
            if (r === ini && !b[(r + 2 * dir) * 8 + c] && !soCapturas) add(i, (r + 2 * dir) * 8 + c, { duplo: true });
          }
          for (k = -1; k <= 1; k += 2) {
            cc = c + k; if (cc < 0 || cc > 7) continue;
            alvo = rr * 8 + cc;
            if (b[alvo] && corDe(b[alvo]) !== eu) add(i, alvo, rr === ult ? { promo: true } : null);
            else if (alvo === s.ep) add(i, alvo, { ep: true, captura: eu === 'w' ? 'p' : 'P' });
          }
        }
      } else if (t === 'n' || t === 'k') {
        var lista = t === 'n' ? DN : DQ;
        for (k = 0; k < 8; k++) {
          rr = r + lista[k][0]; cc = c + lista[k][1]; if (rr < 0 || rr > 7 || cc < 0 || cc > 7) continue;
          alvo = rr * 8 + cc; if (b[alvo] && corDe(b[alvo]) === eu) continue;
          if (soCapturas && !b[alvo]) continue;
          add(i, alvo);
        }
        if (t === 'k' && !soCapturas) {   // roque: casas vazias e o rei não passa por casa atacada
          var ele = outra(eu), base = eu === 'w' ? 56 : 0, R = eu === 'w' ? 'R' : 'r';
          if (i === base + 4 && s.roque.indexOf(eu === 'w' ? 'K' : 'k') >= 0 && b[base + 7] === R && !b[base + 5] && !b[base + 6] &&
            !atacada(b, base + 4, ele) && !atacada(b, base + 5, ele) && !atacada(b, base + 6, ele)) add(i, base + 6, { roque: 'curto' });
          if (i === base + 4 && s.roque.indexOf(eu === 'w' ? 'Q' : 'q') >= 0 && b[base] === R && !b[base + 1] && !b[base + 2] && !b[base + 3] &&
            !atacada(b, base + 4, ele) && !atacada(b, base + 3, ele) && !atacada(b, base + 2, ele)) add(i, base + 2, { roque: 'longo' });
        }
      } else {
        var dirs = t === 'b' ? DB : t === 'r' ? DR : DQ;
        for (k = 0; k < dirs.length; k++) {
          rr = r + dirs[k][0]; cc = c + dirs[k][1];
          while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
            alvo = rr * 8 + cc;
            if (b[alvo]) { if (corDe(b[alvo]) !== eu) add(i, alvo); break; }
            if (!soCapturas) add(i, alvo);
            rr += dirs[k][0]; cc += dirs[k][1];
          }
        }
      }
    }
    return ms;
  }
  function aplicar(s, m, semHist) {
    var b = s.b.slice(), eu = s.vez, p = b[m.de];
    b[m.para] = m.promo || p; b[m.de] = '';
    if (m.ep) b[m.para + (eu === 'w' ? 8 : -8)] = '';
    if (m.roque) { var base = eu === 'w' ? 56 : 0; if (m.roque === 'curto') { b[base + 5] = b[base + 7]; b[base + 7] = ''; } else { b[base + 3] = b[base]; b[base] = ''; } }
    var roque = s.roque;
    if (roque) {
      if (p === 'K') roque = roque.replace(/[KQ]/g, ''); if (p === 'k') roque = roque.replace(/[kq]/g, '');
      [[63, 'K'], [56, 'Q'], [7, 'k'], [0, 'q']].forEach(function (q) { if (m.de === q[0] || m.para === q[0]) roque = roque.replace(q[1], ''); });
    }
    var n = { b: b, vez: outra(eu), roque: roque, ep: m.duplo ? (m.de + m.para) / 2 : -1, meio: (p.toLowerCase() === 'p' || m.captura) ? 0 : s.meio + 1, n: s.n + (eu === 'b' ? 1 : 0), hist: s.hist };
    if (!semHist) { n.hist = Object.assign({}, s.hist); var ch = chave(n); n.hist[ch] = (n.hist[ch] || 0) + 1; }
    return n;
  }
  function legais(s, soCapturas) {
    var eu = s.vez;
    return pseudo(s, soCapturas).filter(function (m) { var n = aplicar(s, m, true); return !atacada(n.b, reiDe(n.b, eu), outra(eu)); });
  }
  function semMaterial(b) {   // só reis, ou rei + um cavalo/bispo contra rei
    var resto = b.filter(function (p) { return p && p.toLowerCase() !== 'k'; });
    return !resto.length || (resto.length === 1 && /[nbNB]/.test(resto[0]));
  }
  // como está a partida: 'mate' (quem tem a vez perdeu), 'afogado', 'material', '50', 'repeticao', 'xeque' ou ''
  function situacao(s) {
    var ms = legais(s), x = emXeque(s);
    if (!ms.length) return x ? 'mate' : 'afogado';
    if (semMaterial(s.b)) return 'material';
    if (s.meio >= 100) return '50';
    if (s.hist[chave(s)] >= 3) return 'repeticao';
    return x ? 'xeque' : '';
  }
  function perft(s, d) { if (!d) return 1; var ms = legais(s), n = 0; if (d === 1) return ms.length; for (var i = 0; i < ms.length; i++) n += perft(aplicar(s, ms[i], true), d - 1); return n; }

  /* ---------- o computador ---------- */
  var CENTRO = [];
  for (var q = 0; q < 64; q++) { var rr0 = q >> 3, cc0 = q & 7; CENTRO[q] = 3.5 - Math.max(Math.abs(rr0 - 3.5), Math.abs(cc0 - 3.5)); }   // 0 na borda, 3 no meio
  function avaliar(b) {   // do ponto de vista do Azul
    var v = 0, i, p, t, s, r, pecas = 0;
    for (i = 0; i < 64; i++) if (b[i] && /[nbrqNBRQ]/.test(b[i])) pecas++;
    for (i = 0; i < 64; i++) {
      p = b[i]; if (!p) continue;
      t = p.toLowerCase(); s = p === t ? -1 : 1; r = i >> 3;
      var pos = 0, avanco = s > 0 ? 6 - r : r - 1;
      if (t === 'p') pos = avanco * avanco * 2.5 + CENTRO[i] * 4;
      else if (t === 'n') pos = CENTRO[i] * 10 - 12;
      else if (t === 'b') pos = CENTRO[i] * 5;
      else if (t === 'r') pos = (avanco === 5 ? 15 : 0);
      else if (t === 'q') pos = CENTRO[i] * 2;
      else pos = pecas > 6 ? (s > 0 ? (r === 7 ? 12 : -10 * (7 - r)) : (r === 0 ? 12 : -10 * r)) : CENTRO[i] * 8;   // rei: escondido no começo, ativo no fim
      v += s * (VAL[t] + pos);
    }
    return v;
  }
  var MATE = 100000;
  function ordenar(ms) { ms.forEach(function (m) { m.o = (m.captura ? VAL[m.captura.toLowerCase()] * 10 - VAL[m.peca.toLowerCase()] / 10 + 1000 : 0) + (m.promo ? 900 : 0); }); ms.sort(function (a, b) { return b.o - a.o; }); return ms; }
  function quies(s, a, z, prof, cont) {
    cont.n++;
    var lado = s.vez === 'w' ? 1 : -1, parado = avaliar(s.b) * lado;
    if (parado >= z) return z; if (parado > a) a = parado;
    if (prof <= 0) return a;
    var ms = ordenar(legais(s, true));
    for (var i = 0; i < ms.length; i++) {
      var v = -quies(aplicar(s, ms[i], true), -z, -a, prof - 1, cont);
      if (v >= z) return z; if (v > a) a = v;
    }
    return a;
  }
  function negamax(s, d, a, z, ply, qp, cont) {
    cont.n++;
    var ms = legais(s);
    if (!ms.length) return emXeque(s) ? -MATE + ply : 0;
    if (d <= 0) return qp > 0 ? quies(s, a, z, qp, cont) : avaliar(s.b) * (s.vez === 'w' ? 1 : -1);
    ordenar(ms);
    for (var i = 0; i < ms.length; i++) {
      var v = -negamax(aplicar(s, ms[i], true), d - 1, -z, -a, ply + 1, qp, cont);
      if (v >= z) return z; if (v > a) a = v;
    }
    return a;
  }
  var NIVEL_IA = { facil: { d: 1, qp: 0, ruido: 90, acaso: 0.3 }, medio: { d: 2, qp: 2, ruido: 18, acaso: 0 }, dificil: { d: 3, qp: 4, ruido: 0, acaso: 0 } };
  function jogadaPC(s, nivel, rnd) {
    rnd = rnd || Math.random;
    var cfg = NIVEL_IA[nivel] || NIVEL_IA.medio, ms = ordenar(legais(s)), cont = { n: 0 };
    if (!ms.length) return null;
    if (cfg.acaso && rnd() < cfg.acaso) return ms[Math.floor(rnd() * ms.length)];
    var melhor = null, nota = -Infinity, a = -Infinity;
    for (var i = 0; i < ms.length; i++) {
      var v = -negamax(aplicar(s, ms[i], true), cfg.d - 1, -Infinity, -a + cfg.ruido + 1, 1, cfg.qp, cont) + (cfg.ruido ? (rnd() - 0.5) * 2 * cfg.ruido : 0);
      if (v > nota) { nota = v; melhor = ms[i]; }
      if (nota - cfg.ruido > a) a = nota - cfg.ruido;
    }
    return melhor;
  }
  var logica = { inicial: inicial, deFEN: deFEN, casa: casa, nomeCasa: nomeCasa, legais: legais, aplicar: aplicar, situacao: situacao, emXeque: emXeque,
    perft: perft, avaliar: avaliar, jogadaPC: jogadaPC, atacada: atacada };

  /* ================= desenho ================= */
  // peças: desenho próprio (silhuetas), nas cores de cada exército
  var FORMA = {
    p: '<circle cx="50" cy="28" r="13"/><path d="M37 50 Q50 40 63 50 L67 76 H33 Z"/>',
    r: '<path d="M33 42 H67 L65 76 H35 Z"/><path d="M27 20 H37 V28 H45 V20 H55 V28 H63 V20 H73 V42 H27 Z"/>',
    n: '<path d="M30 76 C30 66 38 60 42 54 L30 58 Q22 60 22 52 L28 42 C32 30 42 22 52 22 L58 12 L62 24 C74 34 74 56 68 76 Z"/><circle cx="52" cy="34" r="3.5" class="olho"/>',
    b: '<path d="M37 76 Q39 62 44 56 H56 Q61 62 63 76 Z"/><path d="M50 14 C64 26 66 42 56 56 H44 C34 42 36 26 50 14 Z"/><path d="M55 27 L46 39" class="risco"/><circle cx="50" cy="11" r="5" class="ouro"/>',
    q: '<path d="M35 76 L40 48 H60 L65 76 Z"/><path d="M26 26 L36 48 H64 L74 26 L60 37 L50 18 L40 37 Z"/><circle cx="26" cy="24" r="5" class="ouro"/><circle cx="50" cy="15" r="5" class="ouro"/><circle cx="74" cy="24" r="5" class="ouro"/>',
    k: '<path d="M35 76 L40 46 H60 L65 76 Z"/><path d="M31 30 Q50 21 69 30 L62 46 H38 Z"/><path d="M47 3 H53 V9 H59 V15 H53 V23 H47 V15 H41 V9 H47 Z" class="ouro"/>'
  };
  function svgPeca(p) {
    var t = p.toLowerCase(), azul = p !== t;
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><g class="' + (azul ? 'az' : 'vm') + '">' + FORMA[t] +
      '<path d="M24 76 H76 Q80 84 76 92 H24 Q20 84 24 76 Z"/></g></svg>';
  }
  var CSS = '' +
    '.jt-xad{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;gap:6px;padding:6px 8px calc(env(safe-area-inset-bottom,0px) + 8px);box-sizing:border-box;' +
      'background:radial-gradient(circle at 50% 35%,#4a3f35,#241c16 70%);overflow:hidden}' +
    '.jt-xad-presos{display:flex;flex-wrap:wrap;align-items:center;gap:0;min-height:30px;width:100%;max-width:560px;font-size:14px;opacity:.95}' +
    '.jt-xad-presos .rot{margin-right:6px;font-weight:700}.jt-xad-presos svg{width:26px;height:26px;margin-right:-6px;animation:jtXadPreso .5s cubic-bezier(.3,1.6,.5,1)}' +
    '@keyframes jtXadPreso{0%{transform:scale(2.4) rotate(-40deg);opacity:0}100%{transform:none}}' +
    '.jt-xad-status{min-height:1.3em;font-size:clamp(15px,4vw,19px);text-align:center;text-shadow:0 2px 3px rgba(0,0,0,.6)}' +
    '.jt-xad-campo{flex:1 1 auto;width:100%;display:flex;align-items:center;justify-content:center;min-height:0}' +
    '.jt-xad-moldura{position:relative;padding:10px;border-radius:14px;background:linear-gradient(160deg,#8a5a2b,#5a3714);box-shadow:inset 0 0 0 3px #3a220b,0 12px 30px rgba(0,0,0,.55)}' +
    '.jt-xad-tab{position:relative;display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(8,1fr);border-radius:4px;overflow:hidden}' +
    '.jt-xad-cas{position:relative;border:0;padding:0;margin:0;background:#d8c08a;cursor:pointer}' +
    '.jt-xad-cas.esc{background:#6f9448}' +
    '.jt-xad-cas.esc::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.08),transparent 60%),radial-gradient(circle at 70% 75%,rgba(0,0,0,.08),transparent 55%)}' +
    '.jt-xad-cas.ult{box-shadow:inset 0 0 0 100px rgba(255,214,74,.35)}' +
    '.jt-xad-cas.sel{box-shadow:inset 0 0 0 100px rgba(95,198,255,.5)}' +
    '.jt-xad-cas.pode::after{content:"";position:absolute;left:36%;top:36%;width:28%;height:28%;border-radius:50%;background:rgba(20,30,10,.45)}' +
    '.jt-xad-cas.ataque::after{content:"⚔️";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:min(5vw,24px);background:radial-gradient(circle,rgba(226,59,59,.0) 45%,rgba(226,59,59,.55) 46%);animation:jtXadAtq 1s ease-in-out infinite}' +
    '@keyframes jtXadAtq{50%{opacity:.6}}' +
    '.jt-xad-cas.xeque{animation:jtXadXeque .6s ease-in-out infinite alternate}' +
    '@keyframes jtXadXeque{from{box-shadow:inset 0 0 0 100px rgba(226,59,59,.25)}to{box-shadow:inset 0 0 0 100px rgba(226,59,59,.75)}}' +
    '.jt-xad-cas:focus-visible{outline:3px solid #ffcf4a;outline-offset:-3px;z-index:2}' +
    '.jt-xad-coord{position:absolute;font-size:10px;font-weight:700;opacity:.55;pointer-events:none;color:#1d2a10}' +
    '.jt-xad-pecas{position:absolute;left:10px;top:10px;pointer-events:none}' +
    '.jt-xad-peca{position:absolute;width:12.5%;height:12.5%;transition:left .32s cubic-bezier(.4,.1,.3,1),top .32s cubic-bezier(.4,.1,.3,1);z-index:3}' +
    '.jt-xad-peca svg{width:100%;height:100%;display:block;filter:drop-shadow(0 4px 2px rgba(0,0,0,.45))}' +
    '.jt-xad-peca.anda{z-index:6}.jt-xad-peca.anda svg{animation:jtXadAnda .32s ease-in-out}' +
    '@keyframes jtXadAnda{50%{transform:scale(1.28) translateY(-10%)}}' +
    '.jt-xad-peca.morre{z-index:5;animation:jtXadMorre .6s ease-in forwards}' +
    '@keyframes jtXadMorre{0%{transform:none}25%{transform:scale(1.2) rotate(-12deg)}100%{transform:translateY(60%) rotate(160deg) scale(.1);opacity:0}}' +
    '.jt-xad-peca.tomba svg{animation:jtXadTomba 1s ease-in forwards}' +
    '@keyframes jtXadTomba{0%{transform:none}30%{transform:rotate(-12deg)}100%{transform:rotate(90deg) translate(20%,10%)}}' +
    '.jt-xad-peca.festa svg{animation:jtXadFesta .45s ease-in-out infinite alternate}' +
    '@keyframes jtXadFesta{to{transform:translateY(-14%) scale(1.08)}}' +
    '.jt-xad-peca.brilha svg{animation:jtXadBrilha .9s ease-out}' +
    '@keyframes jtXadBrilha{0%{filter:drop-shadow(0 0 0 #ffcf4a)}40%{filter:drop-shadow(0 0 14px #ffcf4a) brightness(1.6);transform:scale(1.25)}100%{filter:drop-shadow(0 4px 2px rgba(0,0,0,.45))}}' +
    '.jt-xad svg .az path,.jt-xad svg .az circle{fill:url(#jtXadAz);stroke:#0b1f4d;stroke-width:3.5;stroke-linejoin:round}' +
    '.jt-xad svg .vm path,.jt-xad svg .vm circle{fill:url(#jtXadVm);stroke:#4d0b10;stroke-width:3.5;stroke-linejoin:round}' +
    '.jt-xad svg .ouro{fill:#ffcf4a !important;stroke:#7a4a00 !important}.jt-xad svg .olho{fill:#fff !important;stroke:none !important}.jt-xad svg .risco{fill:none !important;stroke-width:4 !important}' +
    '.jt-xad-bt{min-height:50px;padding:0 22px;border:0;border-radius:999px;font-size:19px;font-weight:700;color:#3a2300;background:linear-gradient(180deg,#ffe07a,#ffcf4a 45%,#ff9d2e);box-shadow:0 5px 0 #b45d0c}' +
    '.jt-xad-bt.sec{color:#fff;background:rgba(255,255,255,.14);border:1.5px solid rgba(255,255,255,.45);box-shadow:none}' +
    '.jt-xad-veu{position:absolute;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;background:rgba(10,14,30,.72);padding:16px;box-sizing:border-box}' +
    '.jt-xad-caixa{max-width:420px;width:100%;padding:18px;border-radius:22px;background:#3a2c1f;border:3px solid #ffcf4a;text-align:center;display:flex;flex-direction:column;gap:12px;box-shadow:0 14px 40px rgba(0,0,0,.5)}' +
    '.jt-xad-caixa h3{margin:0;font-size:clamp(22px,6vw,30px)}.jt-xad-caixa p{margin:0;font-size:17px;line-height:1.35}';
  var GRADIENTES = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<linearGradient id="jtXadAz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8cc4ff"/><stop offset=".55" stop-color="#3b82f0"/><stop offset="1" stop-color="#1f4fb8"/></linearGradient>' +
    '<linearGradient id="jtXadVm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9c8f"/><stop offset=".55" stop-color="#e23b3b"/><stop offset="1" stop-color="#9e1a24"/></linearGradient></defs></svg>';
  var COR = { w: ['#3b82f0', '#8cc4ff', '#ffcf4a', '#0b1f4d'], b: ['#e23b3b', '#ff9c8f', '#ffcf4a', '#4d0b10'] };

  function iniciar(palco, ctx) {
    if (!document.getElementById('jt-xadrez-css')) { var st = document.createElement('style'); st.id = 'jt-xadrez-css'; st.textContent = CSS; document.head.appendChild(st); }
    var t = ctx.t, timers = [], vivo = true;
    var raiz = document.createElement('div'); raiz.className = 'jt-xad'; palco.appendChild(raiz);
    var fx = window.JogotecaBatalha.criar(palco, ctx);
    var EXE = { w: t('Azul', 'Blue', 'Azul'), b: t('Vermelho', 'Red', 'Rojo') };
    raiz.innerHTML = GRADIENTES + '<div class="jt-xad-presos" data-de="b"></div><div class="jt-xad-status" aria-live="polite"></div>' +
      '<div class="jt-xad-campo"><div class="jt-xad-moldura"><div class="jt-xad-tab" role="grid"></div><div class="jt-xad-pecas"></div></div></div><div class="jt-xad-presos" data-de="w"></div>';
    var $ = function (s) { return raiz.querySelector(s); }, tab = $('.jt-xad-tab'), camada = $('.jt-xad-pecas'), moldura = $('.jt-xad-moldura'), status = $('.jt-xad-status');
    var S = inicial(), modo = null, sel = -1, alvos = [], travado = true, fim = null, ultimo = null, pecas = {}, presos = { w: [], b: [] };
    var cas = [];
    for (var i = 0; i < 64; i++) (function (i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'jt-xad-cas' + (((i >> 3) + (i & 7)) % 2 ? ' esc' : ''); b.setAttribute('data-i', i);
      if ((i & 7) === 0) { var n = document.createElement('span'); n.className = 'jt-xad-coord'; n.style.left = '2px'; n.style.top = '1px'; n.textContent = 8 - (i >> 3); b.appendChild(n); }
      if ((i >> 3) === 7) { var l = document.createElement('span'); l.className = 'jt-xad-coord'; l.style.right = '3px'; l.style.bottom = '0'; l.textContent = String.fromCharCode(97 + (i & 7)); b.appendChild(l); }
      b.addEventListener('click', function () { tocar(i); });
      tab.appendChild(b); cas.push(b);
    })(i);
    function medir() {
      var c = $('.jt-xad-campo').getBoundingClientRect(), lado = Math.max(160, Math.floor(Math.min(c.width - 24, c.height - 24, 620)));
      tab.style.width = tab.style.height = lado + 'px'; camada.style.width = camada.style.height = lado + 'px';
    }
    window.addEventListener('resize', medir);
    function pos(el, i) { el.style.left = ((i & 7) * 12.5) + '%'; el.style.top = ((i >> 3) * 12.5) + '%'; }
    function centro(i) { var r = cas[i].getBoundingClientRect(), p = palco.getBoundingClientRect(); return { x: r.left - p.left + r.width / 2, y: r.top - p.top + r.height / 2 }; }
    function montarPecas() {
      camada.innerHTML = ''; pecas = {};
      S.b.forEach(function (p, i) { if (!p) return; var el = document.createElement('div'); el.className = 'jt-xad-peca'; el.innerHTML = svgPeca(p); pos(el, i); camada.appendChild(el); pecas[i] = el; });
    }
    function rotulos() { cas.forEach(function (c, i) { var p = S.b[i]; c.setAttribute('aria-label', nomeCasa(i) + (p ? ' ' + nomePeca(p) : '')); }); }
    function nomePeca(p) {
      var t2 = p.toLowerCase(), n = { p: t('peão', 'pawn', 'peón'), n: t('cavalo', 'knight', 'caballo'), b: t('bispo', 'bishop', 'alfil'), r: t('torre', 'rook', 'torre'), q: t('dama', 'queen', 'dama'), k: t('rei', 'king', 'rey') }[t2];
      return n + ' ' + EXE[corDe(p)].toLowerCase();
    }
    function humanoJoga() { return !fim && !travado && (modo === 'dois' || S.vez === 'w'); }
    function pintar() {
      cas.forEach(function (c, i) {
        c.classList.toggle('sel', i === sel);
        c.classList.toggle('ult', !!ultimo && (i === ultimo.de || i === ultimo.para));
        var a = alvos.filter(function (m) { return m.para === i; })[0];
        c.classList.toggle('pode', !!a && !a.captura); c.classList.toggle('ataque', !!a && !!a.captura);
        c.classList.toggle('xeque', !fim && S.b[i] === (S.vez === 'w' ? 'K' : 'k') && emXeque(S));
      });
      if (fim) return;
      var x = emXeque(S) ? t(' — XEQUE!', ' — CHECK!', ' — ¡JAQUE!') : '';
      status.textContent = modo === 'pc'
        ? (S.vez === 'w' ? t('🔵 Sua vez, comandante!', '🔵 Your turn, commander!', '🔵 ¡Tu turno, comandante!') : t('🔴 O Exército Vermelho está pensando…', '🔴 The Red Army is thinking…', '🔴 El Ejército Rojo está pensando…')) + x
        : (S.vez === 'w' ? '🔵 ' : '🔴 ') + t('Vez do Exército ' + EXE[S.vez], EXE[S.vez] + " Army's turn", 'Turno del Ejército ' + EXE[S.vez]) + x;
    }
    function tocar(i) {
      if (!humanoJoga()) return;
      var m = alvos.filter(function (x) { return x.para === i && (!x.promo || /q/i.test(x.promo)); })[0];   // promoção: na tela, sempre dama
      if (m) { sel = -1; alvos = []; mover(m); return; }
      if (S.b[i] && corDe(S.b[i]) === S.vez) {
        if (sel === i) { sel = -1; alvos = []; }
        else { sel = i; alvos = legais(S).filter(function (x) { return x.de === i; }); ctx.som('toque'); }
      } else { sel = -1; alvos = []; }
      pintar();
    }
    var ONOMATO = [['POW!', 'BUM!', 'CRASH!', 'CABUM!', 'TCHANG!'], ['POW!', 'BOOM!', 'CRASH!', 'KABOOM!', 'CLANG!'], ['¡PAM!', '¡BUM!', '¡CRAC!', '¡CATAPUM!', '¡CLANG!']];
    function mover(m) {
      travado = true;
      var el = pecas[m.de], quem = S.vez, vitima = m.ep ? m.para + (quem === 'w' ? 8 : -8) : m.para, morta = m.captura ? pecas[vitima] : null;
      delete pecas[m.de];
      el.classList.add('anda'); pos(el, m.para); pecas[m.para] = el;
      fx.som(m.captura ? 'espada' : 'passo');
      if (m.roque) {   // a torre pula por cima do rei
        var base = quem === 'w' ? 56 : 0, de = m.roque === 'curto' ? base + 7 : base, para = m.roque === 'curto' ? base + 5 : base + 3, torre = pecas[de];
        delete pecas[de]; torre.classList.add('anda'); pos(torre, para); pecas[para] = torre;
        timers.push(setTimeout(function () { torre.classList.remove('anda'); var c = centro(m.para); fx.texto(c.x, c.y - 30, t('ROQUE!', 'CASTLE!', '¡ENROQUE!'), COR[quem][1]); fx.som('corneta'); }, 330));
      }
      S = aplicar(S, m); ultimo = m;
      timers.push(setTimeout(function () {
        if (!vivo) return;
        el.classList.remove('anda');
        var c = centro(m.para);
        if (morta) {   // a batalha
          if (vitima !== m.para) delete pecas[vitima];
          morta.classList.add('morre');
          timers.push(setTimeout(function () { if (morta.parentNode) morta.parentNode.removeChild(morta); }, 650));
          var forte = /[qrQR]/.test(m.captura), cv = centro(vitima);
          fx.faiscas(c.x, c.y, '#fff7c2'); fx.explosao(cv.x, cv.y, COR[corDe(m.captura)].concat(['#ffcf4a']), forte ? 1.6 : 1);
          timers.push(setTimeout(function () { fx.som('boom'); }, 80));
          var on = ONOMATO[ctx.lingua === 'en' ? 1 : ctx.lingua === 'es' ? 2 : 0];
          fx.texto(c.x, c.y - 28, on[Math.floor(Math.random() * on.length)], COR[quem][2]);
          fx.tremer(moldura, forte);
          presos[quem].push(m.captura); pintarPresos();
        } else fx.faiscas(c.x, c.y + c.y * 0.02, '#e9dcb8');
        if (m.promo) { el.innerHTML = svgPeca(m.promo); el.classList.add('brilha'); fx.faiscas(c.x, c.y, '#ffcf4a'); fx.texto(c.x, c.y - 30, t('PROMOÇÃO!', 'PROMOTED!', '¡CORONACIÓN!'), '#ffcf4a'); fx.som('corneta'); timers.push(setTimeout(function () { el.classList.remove('brilha'); }, 950)); }
        rotulos(); depois();
      }, 340));
    }
    function pintarPresos() {
      ['w', 'b'].forEach(function (q) {
        var cx = raiz.querySelector('.jt-xad-presos[data-de="' + q + '"]');   // embaixo: presos do Azul; em cima: presos do Vermelho
        cx.innerHTML = '<span class="rot">' + (q === 'w' ? '🔵' : '🔴') + ' ' + t('Prisioneiros:', 'Prisoners:', 'Prisioneros:') + '</span>' + presos[q].map(svgPeca).join('');
      });
    }
    function depois() {
      var sit = situacao(S);
      if (sit === 'mate') { acabar(outra(S.vez), 'mate'); return; }
      if (sit && sit !== 'xeque') { acabar(null, sit); return; }
      if (sit === 'xeque') {
        var k = reiDe(S.b, S.vez), c = centro(k);
        fx.faixa(t('XEQUE!', 'CHECK!', '¡JAQUE!'), COR[outra(S.vez)][0], 1300); fx.som('corneta'); fx.faiscas(c.x, c.y, '#ff4f6d');
      }
      travado = false; pintar();
      if (modo === 'pc' && S.vez === 'b') vezPC();
    }
    function vezPC() {
      travado = true; pintar();
      timers.push(setTimeout(function () {
        if (!vivo) return;
        var m = jogadaPC(S, ctx.nivel);
        if (m) mover(m);
      }, ctx.teste ? 80 : (emXeque(S) ? 1100 : 600)));
    }
    function acabar(vencedor, como) {
      fim = { vencedor: vencedor, como: como }; travado = true; sel = -1; alvos = []; pintar();
      if (!vencedor) {
        fx.som('tregua'); fx.faixa(t('TRÉGUA!', 'TRUCE!', '¡TREGUA!'), '#7a8494', 2000);
        var motivo = { afogado: t('O rei ficou sem lance, sem estar em xeque: afogado.', 'The king has no move but is not in check: stalemate.', 'El rey no tiene jugada y no está en jaque: rey ahogado.'),
          material: t('Não sobrou exército para dar xeque-mate.', 'No army left to give checkmate.', 'No queda ejército para dar jaque mate.'),
          '50': t('50 lances sem captura nem peão andar.', '50 moves with no capture or pawn move.', '50 jugadas sin capturas ni peones.'),
          repeticao: t('A mesma posição apareceu 3 vezes.', 'The same position came up 3 times.', 'La misma posición ha salido 3 veces.') }[como];
        status.textContent = '🏳️ ' + t('Empate. ', 'Draw. ', 'Tablas. ') + motivo;
        timers.push(setTimeout(function () { if (vivo) veu(t('🏳️ Trégua!', '🏳️ Truce!', '🏳️ ¡Tregua!'), motivo, [[t('⚔️ Nova batalha', '⚔️ New battle', '⚔️ Nueva batalla'), recomecar]]); }, 2100));
        return;
      }
      var perde = outra(vencedor), k = reiDe(S.b, perde), rei = pecas[k], c = centro(k);
      fx.faixa(t('XEQUE-MATE!', 'CHECKMATE!', '¡JAQUE MATE!'), COR[vencedor][0], 2200); fx.som('boom');
      if (rei) rei.classList.add('tomba');
      fx.explosao(c.x, c.y, COR[perde].concat(['#ffcf4a']), 2); fx.tremer(raiz, true);
      Object.keys(pecas).forEach(function (i) { if (corDe(S.b[i]) === vencedor) pecas[i].classList.add('festa'); });
      timers.push(setTimeout(function () { if (!vivo) return; fx.fogos(6); fx.som(modo === 'pc' && vencedor === 'b' ? 'derrota' : 'vitoria'); }, 900));
      var pc = modo === 'pc';
      status.textContent = pc ? (vencedor === 'w' ? t('🏆 Xeque-mate! Você venceu a guerra!', '🏆 Checkmate! You won the war!', '🏆 ¡Jaque mate! ¡Has ganado la guerra!') : t('Xeque-mate… o Exército Vermelho venceu.', 'Checkmate… the Red Army won.', 'Jaque mate… ha ganado el Ejército Rojo.'))
        : '🏆 ' + t('Xeque-mate! O Exército ' + EXE[vencedor] + ' venceu!', 'Checkmate! The ' + EXE[vencedor] + ' Army won!', '¡Jaque mate! ¡Ha ganado el Ejército ' + EXE[vencedor] + '!');
      timers.push(setTimeout(function () {
        if (!vivo) return;
        if (!pc || vencedor === 'w') {
          var lances = S.n;
          ctx.venceu(pc ? 'Xeque-mate! Você venceu a guerra em ' + lances + ' lances.' : 'Xeque-mate! O Exército ' + EXE[vencedor] + ' venceu a guerra em ' + lances + ' lances.',
            pc ? 'Checkmate! You won the war in ' + lances + ' moves.' : 'Checkmate! The ' + EXE[vencedor] + ' Army won the war in ' + lances + ' moves.',
            pc ? '¡Jaque mate! Has ganado la guerra en ' + lances + ' jugadas.' : '¡Jaque mate! El Ejército ' + EXE[vencedor] + ' ha ganado la guerra en ' + lances + ' jugadas.');
        } else veu(t('O Exército Vermelho venceu', 'The Red Army won', 'Ha ganado el Ejército Rojo'),
          t('Seu rei caiu desta vez. Bora pedir revanche?', 'Your king fell this time. Time for a rematch?', 'Tu rey ha caído esta vez. ¿Pedimos la revancha?'), [[t('🔄 Revanche', '🔄 Rematch', '🔄 Revancha'), recomecar]]);
      }, 3200));
    }
    function recomecar() {
      S = inicial(); sel = -1; alvos = []; fim = null; ultimo = null; presos = { w: [], b: [] };
      montarPecas(); pintarPresos(); rotulos(); travado = false; pintar(); fx.som('tambor');
      fx.faixa(t('À BATALHA!', 'TO BATTLE!', '¡A LA BATALLA!'), '#5a3714', 1300);
    }
    var veuEl = null;
    function veu(titulo, texto, botoes) {
      veuEl = document.createElement('div'); veuEl.className = 'jt-xad-veu';
      var cx = document.createElement('div'); cx.className = 'jt-xad-caixa'; cx.innerHTML = '<h3></h3><p></p>';
      cx.querySelector('h3').textContent = titulo; cx.querySelector('p').textContent = texto;
      botoes.forEach(function (b, k) {
        var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'jt-xad-bt' + (k ? ' sec' : ''); bt.textContent = b[0];
        bt.addEventListener('click', function () { ctx.som('toque'); if (veuEl && veuEl.parentNode) veuEl.parentNode.removeChild(veuEl); veuEl = null; b[1](); });
        cx.appendChild(bt);
      });
      veuEl.appendChild(cx); raiz.appendChild(veuEl);
      timers.push(setTimeout(function () { var b = cx.querySelector('button'); if (b) b.focus(); }, 40));
    }
    function escolher(m) { modo = m; ctx.gravar('modo', m); recomecar(); }
    montarPecas(); pintarPresos(); rotulos(); medir(); pintar();
    var PC = [t('🤖 Contra o computador', '🤖 Against the computer', '🤖 Contra el ordenador'), function () { escolher('pc'); }], DOIS = [t('👥 Dois jogadores', '👥 Two players', '👥 Dos jugadores'), function () { escolher('dois'); }];
    veu(t('♟️ Xadrez de guerra', '♟️ Chess at war', '♟️ Ajedrez en guerra'),
      t('O Exército Azul contra o Exército Vermelho. Derrube o rei inimigo com um xeque-mate! Contra quem você vai lutar?', 'The Blue Army against the Red Army. Topple the enemy king with a checkmate! Who will you fight?', 'El Ejército Azul contra el Ejército Rojo. ¡Derriba al rey enemigo con un jaque mate! ¿Contra quién vas a luchar?'),
      ctx.ler('modo') === 'dois' ? [DOIS, PC] : [PC, DOIS]);
    timers.push(setTimeout(medir, 30));

    var api = {
      parar: function () { vivo = false; timers.forEach(clearTimeout); timers = []; fx.parar(); window.removeEventListener('resize', medir); }
    };
    if (ctx.teste) {
      api.estado = function () { return { b: S.b.slice(), vez: S.vez, modo: modo, fim: fim, travado: travado, sel: sel, alvos: alvos.map(function (m) { return m.para; }), veu: !!veuEl, n: S.n }; };
      api.posicao = function (fen) { S = deFEN(fen); fim = null; ultimo = null; montarPecas(); rotulos(); travado = false; pintar(); };
    }
    return api;
  }

  var jogo = {
    id: 'xadrez',
    logica: logica,
    ajuda: function (t) {
      return '<p>' + t('O xadrez de sempre, com cara de guerra: o Exército Azul (embaixo) começa. Toque numa peça sua e as casas aonde ela pode ir acendem; a ⚔️ mostra onde dá para atacar. Toque na casa para mover.',
        'Regular chess, war style: the Blue Army (at the bottom) starts. Tap one of your pieces and the squares it can reach light up; ⚔️ shows where you can attack. Tap a square to move.',
        'El ajedrez de siempre, en plan guerra: empieza el Ejército Azul (abajo). Toca una pieza tuya y se iluminan las casillas a las que puede ir; la ⚔️ marca dónde puedes atacar. Toca la casilla para mover.') + '</p>' +
        '<p>' + t('Ganha quem der xeque-mate: o rei inimigo atacado e sem saída. O peão que chega do outro lado vira dama sozinho. Tem roque e en passant, como no xadrez de verdade.',
        'You win with checkmate: the enemy king attacked with no way out. A pawn that reaches the other side becomes a queen by itself. Castling and en passant work like in real chess.',
        'Gana quien da jaque mate: el rey enemigo atacado y sin salida. El peón que llega al otro lado se convierte solo en dama. Hay enroque y captura al paso, como en el ajedrez de verdad.') + '</p>' +
        '<p>' + t('Contra o computador você é o Azul; em dois, passem o aparelho. Fácil: o computador se distrai. Médio: pensa 2 lances. Difícil: pensa 3 lances e confere as trocas.',
        'Against the computer you are Blue; with two players, pass the device. Easy: the computer gets distracted. Medium: it thinks 2 moves ahead. Hard: 3 moves ahead, checking every trade.',
        'Contra el ordenador eres el Azul; entre dos, pasaos el aparato. Fácil: el ordenador se despista. Medio: piensa 2 jugadas. Difícil: piensa 3 jugadas y revisa los cambios.') + '</p>';
    },
    iniciar: iniciar
  };
  if (typeof window !== 'undefined') (window.JogotecaJogos = window.JogotecaJogos || []).push(jogo);
  if (typeof module !== 'undefined' && module.exports) module.exports = jogo;
})();
