/* Jogoteca — Paciência (Klondike clássico). 7 colunas, monte, descarte e 4 fundações (do Ás ao Rei, mesmo naipe).
   Níveis: fácil vira 1 carta e desfaz à vontade; médio vira 3 e desfaz; difícil vira 3 e não desfaz.
   Controles: arrastar (dedo ou mouse, leva a pilha a partir da carta tocada); toque simples manda a carta para o melhor
   lugar (fundação primeiro, depois coluna); teclado e controle da TV: setas andam com o cursor, Enter pega e solta,
   Esc/Backspace cancela. Quando todas as cartas estão viradas aparece "Completar", que leva tudo para as fundações.
   A lógica pura fica em "logica" (testada no Node: jogoteca/teste/paciencia.test.js); a tela é só DOM + CSS, sem imagem.
   Com ctx.teste, o embaralhamento usa semente fixa (?semente=N na busca; sem ela, 2026) e expõe window.JogotecaPacienciaDebug. */
(function () {
  'use strict';

  /* ================= lógica pura (sem tela) ================= */
  // carta = { n: 1..13, s: naipe (0 ♠, 1 ♥, 2 ♦, 3 ♣), up: virada para cima, id: 0..51 }
  function carta(n, s, up) { return { n: n, s: s, up: !!up, id: s * 13 + n - 1 }; }
  function vermelha(c) { return c.s === 1 || c.s === 2; }
  function topo(p) { return p.length ? p[p.length - 1] : null; }

  function sorteador(semente) {   // mulberry32: mesma semente, mesmo baralho
    var a = (semente >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var x = a;
      x = Math.imul(x ^ (x >>> 15), x | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  function embaralhar(lista, rnd) {   // Fisher-Yates
    for (var i = lista.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1)), x = lista[i];
      lista[i] = lista[j]; lista[j] = x;
    }
    return lista;
  }
  function estadoVazio(vira) {
    return { monte: [], desc: [], fund: [[], [], [], []], col: [[], [], [], [], [], [], []], vira: vira === 3 ? 3 : 1, jogadas: 0, hist: [] };
  }
  function novoJogo(semente, vira) {
    var rnd = semente == null ? Math.random : sorteador(semente), b = [], s, n, i, j;
    for (s = 0; s < 4; s++) for (n = 1; n <= 13; n++) b.push(carta(n, s, false));
    embaralhar(b, rnd);
    var e = estadoVazio(vira);
    for (i = 0; i < 7; i++) for (j = 0; j <= i; j++) { var c = b.pop(); c.up = j === i; e.col[i].push(c); }
    e.monte = b;   // o topo do monte é o fim da lista
    return e;
  }

  // origem: { p: 'col', i, k } (k = posição da carta tocada) | { p: 'desc' } | { p: 'fund', i }
  // destino: { p: 'col', i } | { p: 'fund', i }
  function cartasDe(e, o) {
    if (!o) return null;
    if (o.p === 'col') {
      var c = e.col[o.i]; if (!c) return null;
      var k = o.k == null ? c.length - 1 : o.k;
      if (k < 0 || k >= c.length || !c[k].up) return null;
      return c.slice(k);
    }
    if (o.p === 'desc') return e.desc.length ? [topo(e.desc)] : null;
    if (o.p === 'fund') return e.fund[o.i] && e.fund[o.i].length ? [topo(e.fund[o.i])] : null;
    return null;
  }
  function podeNaColuna(cartas, col) {
    var c = cartas[0], t = topo(col);
    if (!t) return c.n === 13;   // coluna vazia só aceita Rei
    return t.up && t.n === c.n + 1 && vermelha(t) !== vermelha(c);
  }
  function podeNaFundacao(cartas, f) {
    if (cartas.length !== 1) return false;
    var c = cartas[0], t = topo(f);
    if (!t) return c.n === 1;
    return t.s === c.s && t.n + 1 === c.n;
  }
  function podeMover(e, o, d) {
    var cs = cartasDe(e, o);
    if (!cs || !d || (d.p === o.p && d.i === o.i)) return false;
    if (d.p === 'col') return !!e.col[d.i] && podeNaColuna(cs, e.col[d.i]);
    if (d.p === 'fund') return !!e.fund[d.i] && podeNaFundacao(cs, e.fund[d.i]);
    return false;
  }
  function foto(e) { return JSON.stringify({ monte: e.monte, desc: e.desc, fund: e.fund, col: e.col, jogadas: e.jogadas }); }
  function guardar(e) { if (e.hist) { e.hist.push(foto(e)); if (e.hist.length > 600) e.hist.shift(); } }
  function mover(e, o, d) {
    if (!podeMover(e, o, d)) return false;
    guardar(e);
    var cs;
    if (o.p === 'col') {
      var col = e.col[o.i], k = o.k == null ? col.length - 1 : o.k;
      cs = col.splice(k, col.length - k);
      var t = topo(col); if (t && !t.up) t.up = true;   // a carta de baixo vira sozinha
    } else if (o.p === 'desc') cs = [e.desc.pop()];
    else cs = [e.fund[o.i].pop()];
    var alvo = d.p === 'col' ? e.col[d.i] : e.fund[d.i];
    for (var i = 0; i < cs.length; i++) alvo.push(cs[i]);
    e.jogadas++;
    return true;
  }
  function comprar(e) {   // vira 1 ou 3 do monte; monte vazio: o descarte volta para o monte
    var i;
    if (!e.monte.length) {
      if (!e.desc.length) return false;
      guardar(e);
      e.monte = e.desc.reverse(); e.desc = [];
      for (i = 0; i < e.monte.length; i++) e.monte[i].up = false;
      e.jogadas++;
      return true;
    }
    guardar(e);
    var n = Math.min(e.vira, e.monte.length);
    for (i = 0; i < n; i++) { var c = e.monte.pop(); c.up = true; e.desc.push(c); }
    e.jogadas++;
    return true;
  }
  function desfazer(e) {
    if (!e.hist || !e.hist.length) return false;
    var f = JSON.parse(e.hist.pop());
    e.monte = f.monte; e.desc = f.desc; e.fund = f.fund; e.col = f.col; e.jogadas = f.jogadas;
    return true;
  }
  function venceu(e) { for (var i = 0; i < 4; i++) if (e.fund[i].length !== 13) return false; return true; }
  function tudoVirado(e) {
    for (var i = 0; i < 7; i++) for (var k = 0; k < e.col[i].length; k++) if (!e.col[i][k].up) return false;
    return true;
  }
  function fundacaoPara(e, cartas) {
    if (!cartas || cartas.length !== 1) return -1;
    for (var i = 0; i < 4; i++) if (podeNaFundacao(cartas, e.fund[i])) return i;
    return -1;
  }
  // o "toque simples": fundação primeiro (só carta sozinha), depois coluna com cartas, por fim coluna vazia (Rei)
  function melhorDestino(e, o) {
    var cs = cartasDe(e, o);
    if (!cs) return null;
    if (o.p !== 'fund' && cs.length === 1) { var fi = fundacaoPara(e, cs); if (fi >= 0) return { p: 'fund', i: fi }; }
    var k = o.p === 'col' ? (o.k == null ? e.col[o.i].length - 1 : o.k) : -1, vazia = -1;
    for (var i = 0; i < 7; i++) {
      if (o.p === 'col' && o.i === i) continue;
      var col = e.col[i];
      if (!col.length) { if (vazia < 0 && cs[0].n === 13 && !(o.p === 'col' && k === 0)) vazia = i; continue; }
      if (podeNaColuna(cs, col)) return { p: 'col', i: i };
    }
    return vazia >= 0 ? { p: 'col', i: vazia } : null;
  }
  function copiar(e) {
    var f = JSON.parse(foto(e));
    f.vira = e.vira; f.hist = null;
    return f;
  }
  // "Completar": simula numa cópia (só fundação + comprar) e devolve a lista de ações; null se não fecha sozinho
  function autoCompletar(e) {
    if (!tudoVirado(e)) return null;
    var s = copiar(e), acoes = [], parado = 0;
    for (var passo = 0; passo < 3000; passo++) {
      if (venceu(s)) return acoes;
      var feito = false, origens = [{ p: 'desc' }];
      for (var i = 0; i < 7; i++) if (s.col[i].length) origens.push({ p: 'col', i: i, k: s.col[i].length - 1 });
      for (var j = 0; j < origens.length && !feito; j++) {
        var fi = fundacaoPara(s, cartasDe(s, origens[j]));
        if (fi >= 0) { mover(s, origens[j], { p: 'fund', i: fi }); acoes.push({ tipo: 'mover', o: origens[j], d: { p: 'fund', i: fi } }); feito = true; }
      }
      if (feito) { parado = 0; continue; }
      if (!s.monte.length && !s.desc.length) return null;
      if (++parado > 160) return null;
      comprar(s); acoes.push({ tipo: 'comprar' });
    }
    return null;
  }

  var logica = { carta: carta, vermelha: vermelha, sorteador: sorteador, embaralhar: embaralhar, estadoVazio: estadoVazio,
    novoJogo: novoJogo, cartasDe: cartasDe, podeNaColuna: podeNaColuna, podeNaFundacao: podeNaFundacao, podeMover: podeMover,
    mover: mover, comprar: comprar, desfazer: desfazer, venceu: venceu, tudoVirado: tudoVirado, melhorDestino: melhorDestino,
    autoCompletar: autoCompletar, copiar: copiar };

  /* ================= visual ================= */
  var NAIPE = [
    '<path d="M50 4C60 22 92 36 92 60c0 14-10 24-23 24-8 0-14-3-17-8 1 9 5 15 13 20H35c8-5 12-11 13-20-3 5-9 8-17 8C18 84 8 74 8 60 8 36 40 22 50 4z"/>',
    '<path d="M50 92C22 70 6 54 6 33 6 19 17 8 30 8c9 0 16 5 20 13 4-8 11-13 20-13 13 0 24 11 24 25 0 21-16 37-44 59z"/>',
    '<path d="M50 3C61 20 74 35 90 50 74 65 61 80 50 97 39 80 26 65 10 50 26 35 39 20 50 3z"/>',
    '<circle cx="50" cy="27" r="20"/><circle cx="27" cy="57" r="20"/><circle cx="73" cy="57" r="20"/><circle cx="50" cy="50" r="13"/>' +
      '<path d="M50 44c2 24 7 40 17 52H33c10-12 15-28 17-52z"/>'
  ];
  function naipeSVG(s) { return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + NAIPE[s] + '</svg>'; }
  function rotulo(n) { return n === 1 ? 'A' : n === 11 ? 'J' : n === 12 ? 'Q' : n === 13 ? 'K' : String(n); }

  var CSS = [
    '.jt-pac-mesa{position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;touch-action:none;-webkit-user-select:none;user-select:none;',
    'background:radial-gradient(ellipse 75% 65% at 50% 38%,#43a35d 0%,#2a8045 42%,#175a30 78%,#0e3f21 100%);}',
    '.jt-pac-mesa:before{content:"";position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;',
    'background:repeating-linear-gradient(35deg,rgba(255,255,255,.018) 0,rgba(255,255,255,.018) 1px,transparent 1px,transparent 4px),',
    'repeating-linear-gradient(-55deg,rgba(0,0,0,.035) 0,rgba(0,0,0,.035) 1px,transparent 1px,transparent 5px);',
    'box-shadow:inset 0 0 140px rgba(0,0,0,.5),inset 0 0 40px rgba(0,0,0,.25);}',
    '.jt-pac-vaga{position:absolute;left:0;top:0;box-sizing:border-box;border-radius:calc(var(--cw) * .09);',
    'border:2px solid rgba(255,255,255,.2);background:rgba(0,0,0,.13);box-shadow:inset 0 2px 8px rgba(0,0,0,.25);',
    'display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.26);',
    'font:700 calc(var(--cw) * .44)/1 Georgia,"Times New Roman",serif;}',
    '.jt-pac-vaga[data-p="monte"]{cursor:pointer;font-family:system-ui,sans-serif;font-size:calc(var(--cw) * .5);color:rgba(255,255,255,.45);}',
    '.jt-pac-vaga[data-p="desc"]{border-color:transparent;background:transparent;box-shadow:none;}',
    '.jt-pac-carta{position:absolute;left:0;top:0;width:var(--cw);height:var(--ch);transition:transform .22s cubic-bezier(.2,.8,.3,1);cursor:pointer;}',
    '.jt-pac-quieto .jt-pac-carta,.jt-pac-calmo .jt-pac-carta{transition:none;}',
    '.jt-pac-corpo{position:absolute;left:0;top:0;right:0;bottom:0;border-radius:calc(var(--cw) * .09);',
    'box-shadow:0 1px 1px rgba(0,0,0,.3),0 2px 6px rgba(0,0,0,.22);transition:transform .15s ease,box-shadow .15s ease;}',
    '.jt-pac-frente,.jt-pac-verso{position:absolute;left:0;top:0;right:0;bottom:0;border-radius:inherit;box-sizing:border-box;overflow:hidden;}',
    '.jt-pac-frente{display:none;background:linear-gradient(165deg,#ffffff 0%,#fbf8f0 60%,#f1ecdf 100%);border:1px solid rgba(40,30,10,.22);}',
    '.jt-pac-up .jt-pac-frente{display:block;}.jt-pac-up .jt-pac-verso{display:none;}',
    '.jt-pac-v{color:#cf1f33;}.jt-pac-p{color:#1a1d29;}',
    '.jt-pac-frente svg{display:block;width:100%;height:100%;fill:currentColor;}',
    '.jt-pac-ci{position:absolute;left:6%;top:2%;font:700 calc(var(--cw) * .36)/1 Georgia,"Times New Roman",serif;letter-spacing:-.06em;}',
    '.jt-pac-cs{position:absolute;right:6%;top:5%;width:calc(var(--cw) * .27);height:calc(var(--cw) * .27);}',
    '.jt-pac-meio{position:absolute;left:50%;top:64%;width:calc(var(--cw) * .52);height:calc(var(--cw) * .52);margin:calc(var(--cw) * -.26) 0 0 calc(var(--cw) * -.26);',
    'filter:drop-shadow(0 1px 0 rgba(0,0,0,.12));}',
    '.jt-pac-as{width:calc(var(--cw) * .66);height:calc(var(--cw) * .66);margin:calc(var(--cw) * -.33) 0 0 calc(var(--cw) * -.33);}',
    '.jt-pac-fig{position:absolute;left:14%;right:14%;top:31%;bottom:7%;border-radius:calc(var(--cw) * .06);',
    'border:1.5px solid #c9a23a;box-shadow:inset 0 0 0 2px rgba(255,255,255,.7),inset 0 0 0 3px rgba(201,162,58,.55);',
    'display:flex;flex-direction:column;align-items:center;justify-content:center;}',
    '.jt-pac-fig b{font:700 calc(var(--cw) * .4)/1 Georgia,"Times New Roman",serif;}',
    '.jt-pac-fig svg{width:calc(var(--cw) * .24);height:calc(var(--cw) * .24);margin-top:calc(var(--cw) * .02);}',
    '.jt-pac-fig11{background:linear-gradient(180deg,#e9f1ff,#cbdcf7);}',
    '.jt-pac-fig12{background:linear-gradient(180deg,#ffeef2,#f7cfd9);}',
    '.jt-pac-fig13{background:linear-gradient(180deg,#fff6dc,#f3dd9c);}',
    '.jt-pac-cf{position:absolute;right:6%;bottom:3%;transform:rotate(180deg);text-align:center;font:700 calc(var(--cw) * .2)/1 Georgia,"Times New Roman",serif;}',
    '.jt-pac-cf svg{width:calc(var(--cw) * .16);height:calc(var(--cw) * .16);margin:1px auto 0;}',
    '.jt-pac-mini .jt-pac-cf{display:none;}',
    '.jt-pac-verso{background:#fbf8f0;border:1px solid rgba(40,10,20,.35);}',
    '.jt-pac-verso:before{content:"";position:absolute;left:7%;top:5%;right:7%;bottom:5%;border-radius:calc(var(--cw) * .05);',
    'background:radial-gradient(circle at 50% 50%,rgba(255,214,120,.28) 0,rgba(255,214,120,0) 55%),',
    'repeating-linear-gradient(45deg,rgba(233,192,96,.7) 0,rgba(233,192,96,.7) 1px,transparent 1px,transparent calc(var(--cw) * .11)),',
    'repeating-linear-gradient(-45deg,rgba(233,192,96,.7) 0,rgba(233,192,96,.7) 1px,transparent 1px,transparent calc(var(--cw) * .11)),',
    'linear-gradient(160deg,#94203d 0%,#6d1029 55%,#520a1d 100%);box-shadow:inset 0 0 0 1.5px #d9b45a,inset 0 0 10px rgba(0,0,0,.35);}',
    '.jt-pac-verso:after{content:"";position:absolute;left:50%;top:50%;width:calc(var(--cw) * .3);height:calc(var(--cw) * .3);',
    'margin:calc(var(--cw) * -.15) 0 0 calc(var(--cw) * -.15);transform:rotate(45deg);border:2px solid #f0cf72;box-sizing:border-box;',
    'background:radial-gradient(circle,#c33a5b 0%,#7a1530 70%);box-shadow:0 0 0 3px #6d1029,0 0 0 4px #e3bd5e,0 2px 6px rgba(0,0,0,.4);}',
    '.jt-pac-pega .jt-pac-corpo{transform:translateY(-7%);box-shadow:0 0 0 2px #ffd34d,0 0 16px 3px rgba(255,211,77,.75),0 10px 18px rgba(0,0,0,.35);}',
    '.jt-pac-arrasta{transition:none !important;}',
    '.jt-pac-arrasta .jt-pac-corpo{transform:scale(1.05) rotate(-1.5deg);box-shadow:0 14px 28px rgba(0,0,0,.45),0 4px 8px rgba(0,0,0,.3);}',
    '.jt-pac-vira .jt-pac-corpo{animation:jt-pac-vira .28s ease-out;}',
    '@keyframes jt-pac-vira{0%{transform:scaleX(.04) translateY(-4%);}60%{transform:scaleX(1.06) translateY(-4%);}100%{transform:none;}}',
    '.jt-pac-treme .jt-pac-corpo{animation:jt-pac-treme .32s ease-in-out;}',
    '@keyframes jt-pac-treme{0%,100%{transform:none;}20%{transform:translateX(-6%);}50%{transform:translateX(5%);}80%{transform:translateX(-3%);}}',
    '.jt-pac-festa .jt-pac-corpo{animation:jt-pac-pula .5s ease-in-out 3 alternate;}',
    '@keyframes jt-pac-pula{0%{transform:none;}100%{transform:translateY(-22%) rotate(4deg);box-shadow:0 0 22px 6px rgba(255,214,90,.8);}}',
    '.jt-pac-cursor{position:absolute;left:0;top:0;box-sizing:border-box;border-radius:calc(var(--cw) * .12);border:3px solid #ffd34d;pointer-events:none;',
    'box-shadow:0 0 0 2px rgba(0,0,0,.35),0 0 18px 4px rgba(255,211,77,.65);z-index:3000;animation:jt-pac-brilho 1.1s ease-in-out infinite alternate;}',
    '@keyframes jt-pac-brilho{0%{box-shadow:0 0 0 2px rgba(0,0,0,.35),0 0 8px 2px rgba(255,211,77,.45);}100%{box-shadow:0 0 0 2px rgba(0,0,0,.35),0 0 22px 6px rgba(255,211,77,.85);}}',
    '.jt-pac-calmo .jt-pac-cursor{animation:none;}',
    '.jt-pac-hud{position:absolute;left:0;top:0;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;box-sizing:border-box;z-index:2500;}',
    '.jt-pac-hud>*{margin:3px 5px;}',
    '.jt-pac-chip{box-sizing:border-box;min-width:76px;padding:4px 12px 5px;border-radius:14px;text-align:center;color:#fff;line-height:1.05;',
    'background:rgba(6,30,14,.42);border:1px solid rgba(255,255,255,.16);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 2px 8px rgba(0,0,0,.2);}',
    '.jt-pac-rot{display:block;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.72;}',
    '.jt-pac-val{display:block;font-size:21px;font-weight:700;font-variant-numeric:tabular-nums;}',
    '.jt-pac-bt{min-height:46px;padding:0 16px;border:0;border-radius:14px;font-size:17px;font-weight:700;color:#4a2c00;',
    'background:linear-gradient(180deg,#fff7dc 0%,#f6dc8c 55%,#e9c25a 100%);box-shadow:0 3px 0 #a87b16,0 6px 14px rgba(0,0,0,.3);}',
    '.jt-pac-bt:active{transform:translateY(2px);box-shadow:0 1px 0 #a87b16,0 3px 8px rgba(0,0,0,.3);}',
    '.jt-pac-bt[disabled]{opacity:.45;cursor:default;}',
    '.jt-pac-bt:focus-visible,.jt-pac-completar:focus-visible{outline:3px solid #fff;outline-offset:2px;}',
    '.jt-pac-hud-lados{align-content:flex-start;}',
    '.jt-pac-hud-lados .jt-pac-chip{width:calc(50% - 6px);min-width:0;margin:0 0 6px;padding:4px 4px 5px;}',
    '.jt-pac-hud-lados .jt-pac-chip+.jt-pac-chip{margin-left:6px;}',
    '.jt-pac-hud-lados .jt-pac-bt{width:100%;margin:0;padding:0 6px;}',
    '.jt-pac-completar{position:absolute;left:50%;z-index:2600;min-height:54px;padding:0 26px;border:0;border-radius:999px;white-space:nowrap;',
    'transform:translateX(-50%);font-size:20px;font-weight:700;color:#3a2300;',
    'background:linear-gradient(180deg,#ffe78f 0%,#ffcf4a 45%,#ff9d2e 100%);box-shadow:0 4px 0 #b45d0c,0 10px 24px rgba(0,0,0,.45);',
    'animation:jt-pac-chama 1.2s ease-in-out infinite alternate;}',
    '@keyframes jt-pac-chama{0%{box-shadow:0 4px 0 #b45d0c,0 10px 24px rgba(0,0,0,.45);}100%{box-shadow:0 4px 0 #b45d0c,0 10px 24px rgba(0,0,0,.45),0 0 26px 6px rgba(255,207,74,.75);}}',
    '.jt-pac-calmo .jt-pac-completar{animation:none;}',
    '@media (max-width:360px){.jt-pac-chip{min-width:64px;padding:3px 8px 4px;}.jt-pac-val{font-size:18px;}.jt-pac-bt{font-size:15px;padding:0 12px;}.jt-pac-hud>*{margin:3px 3px;}}'
  ].join('\n');

  function ajuda(t) {
    return '<p>' + t('Leve todas as cartas para as 4 casas de cima, cada naipe em ordem: Ás, 2, 3… até o Rei.',
      'Move every card to the 4 home piles, each suit in order: Ace, 2, 3… up to the King.',
      'Lleva todas las cartas a las 4 casillas de arriba, cada palo en orden: As, 2, 3… hasta el Rey.') + '</p>' +
      '<p>' + t('Nas 7 colunas, ponha uma carta sobre outra de número um acima e de cor diferente (o 6 vermelho vai no 7 preto). Coluna vazia só aceita Rei.',
        'In the 7 columns, place a card on one that is one higher and of the other colour (a red 6 goes on a black 7). An empty column only takes a King.',
        'En las 7 columnas, pon una carta sobre otra un número más alta y de otro color (el 6 rojo va sobre el 7 negro). Una columna vacía solo acepta un Rey.') + '</p>' +
      '<p>' + t('Toque no monte para virar cartas: 1 no fácil, 3 no médio e no difícil. Quando ele acabar, toque de novo e as cartas voltam.',
        'Tap the stock to turn cards: 1 on Easy, 3 on Medium and Hard. When it runs out, tap again and the cards go back.',
        'Toca el mazo para girar cartas: 1 en fácil, 3 en medio y en difícil. Cuando se acabe, tócalo otra vez y las cartas vuelven.') + '</p>' +
      '<p>' + t('Toque numa carta e ela vai sozinha para o melhor lugar. Ou arraste: as cartas que estão por cima vão junto.',
        'Tap a card and it jumps to the best place by itself. Or drag it: the cards on top of it come along.',
        'Toca una carta y va sola al mejor sitio. O arrástrala: las cartas que tiene encima van con ella.') + '</p>' +
      '<p>' + t('No teclado ou no controle da TV: as setas andam, OK/Enter pega e solta, Voltar/Esc cancela.',
        'With a keyboard or TV remote: arrows move, OK/Enter picks up and drops, Back/Esc cancels.',
        'Con el teclado o el mando de la tele: las flechas se mueven, OK/Intro coge y suelta, Atrás/Esc cancela.') + '</p>' +
      '<p>' + t('↶ desfaz a última jogada (fácil e médio). Com todas as cartas viradas, aparece ✨ Completar.',
        '↶ undoes the last move (Easy and Medium). Once every card is face up, ✨ Finish appears.',
        '↶ deshace la última jugada (fácil y medio). Con todas las cartas boca arriba, aparece ✨ Completar.') + '</p>';
  }

  function fmtTempo(seg) {
    var h = Math.floor(seg / 3600), m = Math.floor(seg / 60) % 60, s = seg % 60;
    return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  /* ================= a partida na tela ================= */
  function iniciar(palco, ctx) {
    var t = ctx.t, nivel = ctx.nivel, calmo = !!ctx.calmo;
    var vira = nivel === 'facil' ? 1 : 3, podeDesfazer = nivel !== 'dificil';
    var semente = null;
    if (ctx.teste) { var ms = /[?&]semente=(\d+)/.exec(location.search); semente = ms ? +ms[1] : 2026; }
    var e = novoJogo(semente, vira);
    if (!podeDesfazer) e.hist = null;

    if (!document.getElementById('jt-paciencia-css')) {
      var st = document.createElement('style'); st.id = 'jt-paciencia-css'; st.textContent = CSS; document.head.appendChild(st);
    }

    /* ---------- montar a mesa ---------- */
    var mesa = document.createElement('div');
    mesa.className = 'jt-pac-mesa' + (calmo ? ' jt-pac-calmo' : '');
    mesa.setAttribute('role', 'application');
    mesa.setAttribute('aria-label', t('Mesa da Paciência', 'Solitaire table', 'Mesa del Solitario'));
    var vagas = {};
    function novaVaga(p, i, txt) {
      var v = document.createElement('div');
      v.className = 'jt-pac-vaga'; v.setAttribute('data-p', p); if (i != null) v.setAttribute('data-i', i);
      v.textContent = txt || ''; mesa.appendChild(v); vagas[p + (i == null ? '' : i)] = v; return v;
    }
    novaVaga('monte'); novaVaga('desc');
    var i;
    for (i = 0; i < 4; i++) novaVaga('fund', i, 'A');
    for (i = 0; i < 7; i++) novaVaga('col', i, 'K');

    var els = {};
    (function () {
      var todas = [];
      for (var s = 0; s < 4; s++) for (var n = 1; n <= 13; n++) todas.push(carta(n, s));
      todas.forEach(function (c) {
        var el = document.createElement('div'), r = rotulo(c.n), sv = naipeSVG(c.s);
        el.className = 'jt-pac-carta'; el.setAttribute('data-id', c.id);
        var meio = c.n > 10 ? '<span class="jt-pac-fig jt-pac-fig' + c.n + '"><b>' + r + '</b>' + sv + '</span>'
          : '<span class="jt-pac-meio' + (c.n === 1 ? ' jt-pac-as' : '') + '">' + sv + '</span>';
        el.innerHTML = '<div class="jt-pac-corpo"><div class="jt-pac-frente ' + (vermelha(c) ? 'jt-pac-v' : 'jt-pac-p') + '">' +
          '<span class="jt-pac-ci">' + r + '</span><span class="jt-pac-cs">' + sv + '</span>' + meio +
          '<span class="jt-pac-cf">' + r + sv + '</span></div><div class="jt-pac-verso"></div></div>';
        mesa.appendChild(el); els[c.id] = el;
      });
    })();

    var cursorEl = document.createElement('div'); cursorEl.className = 'jt-pac-cursor'; cursorEl.hidden = true; mesa.appendChild(cursorEl);

    var hud = document.createElement('div'); hud.className = 'jt-pac-hud';
    function chip(rot) {
      var c = document.createElement('div'); c.className = 'jt-pac-chip';
      c.innerHTML = '<span class="jt-pac-rot">' + rot + '</span><span class="jt-pac-val">0</span>';
      hud.appendChild(c); return c.lastChild;
    }
    var valJogadas = chip(t('Jogadas', 'Moves', 'Movimientos')), valTempo = chip(t('Tempo', 'Time', 'Tiempo'));
    valTempo.textContent = '0:00';
    var btDesfazer = null;
    if (podeDesfazer) {
      btDesfazer = document.createElement('button'); btDesfazer.type = 'button'; btDesfazer.className = 'jt-pac-bt';
      btDesfazer.textContent = '↶ ' + t('Desfazer', 'Undo', 'Deshacer');
      btDesfazer.addEventListener('click', function () { acaoDesfazer(); });
      hud.appendChild(btDesfazer);
    }
    mesa.appendChild(hud);
    var btCompletar = document.createElement('button'); btCompletar.type = 'button'; btCompletar.className = 'jt-pac-completar'; btCompletar.hidden = true;
    btCompletar.textContent = '✨ ' + t('Completar', 'Finish', 'Completar');
    btCompletar.addEventListener('click', function () { completar(); });
    mesa.appendChild(btCompletar);
    palco.appendChild(mesa);

    /* ---------- medidas (em pé: monte e casas em cima; deitado/largo: monte à esquerda, casas à direita) ---------- */
    var lay = null, R = 1.42;
    function medir() {
      var W = palco.clientWidth || 360, H = palco.clientHeight || 600, L = { W: W, H: H, lados: W / H >= 1.3 }, cw, ch, k;
      var pad = Math.round(Math.max(W < 360 ? 5 : 7, Math.min(22, Math.min(W, H) * 0.02)));
      var g = Math.round(Math.max(W < 360 ? 3 : 4, Math.min(16, W * 0.008)));
      L.colX = [];
      if (!L.lados) {
        var hudH = Math.round(Math.max(56, Math.min(74, H * 0.075)));
        cw = Math.floor(Math.min((W - 2 * pad - 6 * g) / 7, (H - hudH - 2 * pad) / (R * 3.3), 150)); ch = Math.round(cw * R);
        var x0 = Math.round((W - (7 * cw + 6 * g)) / 2);
        for (k = 0; k < 7; k++) L.colX.push(x0 + k * (cw + g));
        L.monte = { x: L.colX[0], y: pad }; L.desc = { x: L.colX[1], y: pad };
        L.fan = 'x'; L.passo = Math.round(Math.min(cw * 0.3, (cw + 2 * g) / 2));
        L.fund = []; for (k = 0; k < 4; k++) L.fund.push({ x: L.colX[3 + k], y: pad });
        L.yCol = pad + ch + Math.max(2 * g, Math.round(ch * 0.16)); L.fundoCol = H - hudH - Math.round(pad / 2);
        L.hud = { x: 0, y: H - hudH, w: W, h: hudH, lados: false };
        L.completar = { x: W / 2, bottom: hudH + 8 };
      } else {
        var hudL = podeDesfazer ? 108 : 56, G = 3 * g;
        var chMax = Math.min((H - 2 * pad) / 2.7, (H - 2 * pad - g) / 2.5, (H - 2 * pad - 2 * g - hudL) / 2);
        cw = Math.floor(Math.min((W - 2 * pad - 7 * g - 2 * G) / 10, chMax / R, 175)); ch = Math.round(cw * R);
        var x1 = Math.round((W - (10 * cw + 7 * g + 2 * G)) / 2), xC = x1 + cw + G;
        for (k = 0; k < 7; k++) L.colX.push(xC + k * (cw + g));
        var xR = L.colX[6] + cw + G;
        L.monte = { x: x1, y: pad }; L.desc = { x: x1, y: pad + ch + g };
        L.fan = 'y'; L.passo = Math.round(Math.max(0, Math.min(ch * 0.24, (H - 2 * pad - 2 * ch - g) / 2)));
        L.fund = []; for (k = 0; k < 4; k++) L.fund.push({ x: xR + (k % 2) * (cw + g), y: pad + Math.floor(k / 2) * (ch + g) });
        L.yCol = pad; L.fundoCol = H - pad;
        L.hud = { x: xR, y: pad + 2 * ch + 2 * g, w: 2 * cw + g, h: Math.max(hudL, H - pad - (pad + 2 * ch + 2 * g)), lados: true };
        L.completar = { x: xC + (7 * cw + 6 * g) / 2, bottom: pad + 10 };
      }
      L.cw = cw; L.ch = ch; L.g = g; L.pad = pad;
      L.dDown = ch * 0.11; L.dUp = ch * 0.31;
      lay = L;
      mesa.style.setProperty('--cw', cw + 'px'); mesa.style.setProperty('--ch', ch + 'px');
      mesa.classList.toggle('jt-pac-mini', cw < 64);
      function poe(el, x, y) { el.style.width = cw + 'px'; el.style.height = ch + 'px'; el.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }
      poe(vagas.monte, L.monte.x, L.monte.y); poe(vagas.desc, L.desc.x, L.desc.y);
      for (k = 0; k < 4; k++) poe(vagas['fund' + k], L.fund[k].x, L.fund[k].y);
      for (k = 0; k < 7; k++) poe(vagas['col' + k], L.colX[k], L.yCol);
      hud.className = 'jt-pac-hud' + (L.hud.lados ? ' jt-pac-hud-lados' : '');
      hud.style.transform = 'translate(' + L.hud.x + 'px,' + L.hud.y + 'px)'; hud.style.width = L.hud.w + 'px'; hud.style.height = L.hud.h + 'px';
      btCompletar.style.left = L.completar.x + 'px'; btCompletar.style.bottom = L.completar.bottom + 'px';
    }

    // y de cada carta de uma coluna (aperta as distâncias quando a coluna cresce)
    function ysColuna(i) {
      var col = e.col[i], ys = [], nDown = 0, nUp = 0, k;
      for (k = 0; k < col.length; k++) { if (col[k].up) nUp++; else nDown++; }
      var dD = lay.dDown, dU = lay.dUp, precisa = nDown * dD + Math.max(0, nUp - 1) * dU, cabe = lay.fundoCol - lay.yCol - lay.ch;
      if (precisa > cabe && precisa > 0) { var f = Math.max(0, cabe) / precisa; dD = Math.max(2, dD * f); dU = Math.max(lay.ch * 0.13, dU * f); }
      var y = lay.yCol;
      for (k = 0; k < col.length; k++) { ys.push(Math.round(y)); y += col[k].up ? dU : dD; }
      return ys;
    }
    function posicoes() {
      var P = {}, k, i, n = e.desc.length, vis = vira === 3 ? 3 : 1;
      for (k = 0; k < e.monte.length; k++) { var d = Math.floor(k / 8); P[e.monte[k].id] = { x: lay.monte.x - d, y: lay.monte.y - d, z: 10 + k }; }
      for (k = 0; k < n; k++) {
        var f = Math.max(0, k - (n - Math.min(vis, n)));
        P[e.desc[k].id] = { x: lay.desc.x + (lay.fan === 'x' ? f * lay.passo : 0), y: lay.desc.y + (lay.fan === 'y' ? f * lay.passo : 0), z: 100 + k };
      }
      for (i = 0; i < 4; i++) for (k = 0; k < e.fund[i].length; k++) P[e.fund[i][k].id] = { x: lay.fund[i].x, y: lay.fund[i].y, z: 200 + k };
      for (i = 0; i < 7; i++) { var ys = ysColuna(i); for (k = 0; k < e.col[i].length; k++) P[e.col[i][k].id] = { x: lay.colX[i], y: ys[k], z: 300 + k }; }
      return P;
    }

    /* ---------- desenhar ---------- */
    var antes = {}, viradas = {}, timers = [], parado = false, pos = {};
    function depoisDe(ms, fn) { var id = setTimeout(function () { var j = timers.indexOf(id); if (j >= 0) timers.splice(j, 1); if (!parado) fn(); }, ms); timers.push(id); return id; }
    function cartasPegas() {
      var ids = {};
      if (pega) { var cs = cartasDe(e, pega); if (cs) cs.forEach(function (c) { ids[c.id] = true; }); }
      return ids;
    }
    function todasAsCartas(fn) {
      var i, k;
      for (k = 0; k < e.monte.length; k++) fn(e.monte[k]);
      for (k = 0; k < e.desc.length; k++) fn(e.desc[k]);
      for (i = 0; i < 4; i++) for (k = 0; k < e.fund[i].length; k++) fn(e.fund[i][k]);
      for (i = 0; i < 7; i++) for (k = 0; k < e.col[i].length; k++) fn(e.col[i][k]);
    }
    function desenhar(quieto) {
      pos = posicoes();
      var pegas = cartasPegas();
      todasAsCartas(function (c) {
        var el = els[c.id], p = pos[c.id], a = antes[c.id];
        if (c.up && a && !a.up && !quieto && !calmo) {
          el.classList.add('jt-pac-vira');
          (function (el2) { depoisDe(320, function () { el2.classList.remove('jt-pac-vira'); }); })(el);
        }
        if (c.up !== (a ? a.up : null)) el.classList.toggle('jt-pac-up', c.up);
        el.classList.toggle('jt-pac-pega', !!pegas[c.id]);
        var mexeu = a && (a.x !== p.x || a.y !== p.y);
        el._z = p.z;
        if (mexeu && !quieto && !calmo) {   // por cima de tudo enquanto voa
          el.style.zIndex = 1000 + p.z;
          if (el._tz) clearTimeout(el._tz);
          (function (el2) { el2._tz = depoisDe(260, function () { el2.style.zIndex = el2._z; el2._tz = null; }); })(el);
        } else if (!el._tz || quieto) el.style.zIndex = p.z;
        if (!a || mexeu) el.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)';
        antes[c.id] = { x: p.x, y: p.y, up: c.up };
      });
      vagas.monte.textContent = !e.monte.length && e.desc.length ? '↻' : '';
      desenharCursor();
    }
    function refazerTudo() {
      mesa.classList.add('jt-pac-quieto');
      medir(); antes = {}; desenhar(true);
      void mesa.offsetWidth;
      mesa.classList.remove('jt-pac-quieto');
    }

    /* ---------- placar, relógio e Completar ---------- */
    var inicio = 0, segundos = 0, fim = false, autoRodando = false, acoesAuto = null;
    function comecarRelogio() { if (!inicio) inicio = Date.now(); }
    function tic() {
      if (inicio && !fim) segundos = Math.floor((Date.now() - inicio) / 1000);
      valTempo.textContent = fmtTempo(segundos);
    }
    var relogio = setInterval(tic, 1000);
    function atualizarHud() {
      valJogadas.textContent = String(e.jogadas);
      tic();
      if (btDesfazer) btDesfazer.disabled = !e.hist || !e.hist.length || fim || autoRodando;
      acoesAuto = !fim && !autoRodando && tudoVirado(e) ? autoCompletar(e) : null;
      btCompletar.hidden = !(acoesAuto && acoesAuto.length);
    }

    /* ---------- jogadas ---------- */
    function depois() {
      if (pega && !cartasDe(e, pega)) pega = null;
      normalizarCursor();
      desenhar(); atualizarHud();
      if (venceu(e) && !fim) vencer();
    }
    function aplicarMover(o, d) {
      if (fim || !mover(e, o, d)) return false;
      comecarRelogio(); ctx.som(d.p === 'fund' ? 'certo' : 'carta');
      if (modoTeclado) cur = d.p === 'col' ? { p: 'col', i: d.i, k: e.col[d.i].length - 1 } : { p: d.p, i: d.i };
      depois();
      return true;
    }
    function acaoComprar() {
      if (fim || autoRodando) return;
      if (comprar(e)) { comecarRelogio(); ctx.som('carta'); depois(); }
    }
    function acaoDesfazer() {
      if (!podeDesfazer || fim || autoRodando) return;
      if (desfazer(e)) { pega = null; ctx.som('toque'); depois(); }
    }
    function tremer(o) {
      var cs = cartasDe(e, o); if (!cs || calmo) return;
      cs.forEach(function (c) {
        var el = els[c.id]; el.classList.remove('jt-pac-treme'); void el.offsetWidth; el.classList.add('jt-pac-treme');
        depoisDe(360, function () { el.classList.remove('jt-pac-treme'); });
      });
    }
    function tocarCarta(o) {   // toque simples: leva para o melhor lugar
      var d = melhorDestino(e, o);
      if (d) aplicarMover(o, d); else { ctx.som('erro'); tremer(o); }
    }
    function completar() {
      if (fim || autoRodando || !acoesAuto) return;
      var lista = acoesAuto.slice(), passo = calmo ? 40 : 95;
      autoRodando = true; pega = null; btCompletar.hidden = true; atualizarHud();
      (function proxima() {
        if (parado) return;
        var a = lista.shift();
        if (!a) { autoRodando = false; depois(); return; }
        var ok = a.tipo === 'comprar' ? comprar(e) : mover(e, a.o, a.d);
        if (!ok) { autoRodando = false; depois(); return; }
        if (a.tipo !== 'comprar') ctx.som('carta');
        desenhar(); valJogadas.textContent = String(e.jogadas);
        if (venceu(e)) { autoRodando = false; depois(); return; }
        depoisDe(passo, proxima);
      })();
    }
    function vencer() {
      fim = true; tic(); pega = null; modoTeclado = false; desenharCursor();
      var seg = segundos, tempo = fmtTempo(seg), chave = 'melhor-' + nivel, melhor = ctx.ler(chave), recorde = typeof melhor !== 'number' || seg < melhor;
      if (recorde) ctx.gravar(chave, seg);
      atualizarHud();
      var j = e.jogadas;
      var pt = 'Você venceu em ' + j + ' jogadas e ' + tempo + '!', en = 'You won in ' + j + ' moves and ' + tempo + '!',
        es = '¡Has ganado en ' + j + ' movimientos y ' + tempo + '!';
      if (recorde && typeof melhor === 'number') { pt += ' Novo recorde neste nível!'; en += ' New record for this level!'; es += ' ¡Nuevo récord en este nivel!'; }
      else if (!recorde) { var mt = fmtTempo(melhor); pt += ' Seu melhor tempo: ' + mt + '.'; en += ' Your best time: ' + mt + '.'; es += ' Tu mejor tiempo: ' + mt + '.'; }
      if (!calmo) {
        for (var i = 0; i < 4; i++) {
          var el = els[topo(e.fund[i]).id];
          el.firstChild.style.animationDelay = (i * 0.12) + 's'; el.classList.add('jt-pac-festa');
        }
      }
      depoisDe(calmo ? 250 : 1300, function () { ctx.venceu(pt, en, es); });
    }

    /* ---------- dedo e mouse ---------- */
    function onde(id) {
      var i, k;
      for (k = 0; k < e.monte.length; k++) if (e.monte[k].id === id) return { p: 'monte' };
      for (k = 0; k < e.desc.length; k++) if (e.desc[k].id === id) return { p: 'desc', topo: k === e.desc.length - 1 };
      for (i = 0; i < 4; i++) for (k = 0; k < e.fund[i].length; k++) if (e.fund[i][k].id === id) return { p: 'fund', i: i, topo: k === e.fund[i].length - 1 };
      for (i = 0; i < 7; i++) for (k = 0; k < e.col[i].length; k++) if (e.col[i][k].id === id) return { p: 'col', i: i, k: k, up: e.col[i][k].up };
      return null;
    }
    function retCol(i) {
      var col = e.col[i], y0 = lay.yCol, y1 = y0 + lay.ch;
      if (col.length) y1 = Math.max(y1, pos[topo(col).id].y + lay.ch);
      return { x: lay.colX[i], y: y0, w: lay.cw, h: y1 - y0 };
    }
    function alvoSob(o, x, y) {   // pilha com mais área embaixo da carta arrastada (prefere as válidas)
      var cands = [], i;
      for (i = 0; i < 4; i++) cands.push({ d: { p: 'fund', i: i }, r: { x: lay.fund[i].x, y: lay.fund[i].y, w: lay.cw, h: lay.ch } });
      for (i = 0; i < 7; i++) cands.push({ d: { p: 'col', i: i }, r: retCol(i) });
      var melhor = null, melhorArea = 0, melhorValido = null, areaValida = 0;
      cands.forEach(function (c) {
        if (c.d.p === o.p && c.d.i === o.i) return;
        var ax = Math.max(0, Math.min(x + lay.cw, c.r.x + c.r.w) - Math.max(x, c.r.x)), ay = Math.max(0, Math.min(y + lay.ch, c.r.y + c.r.h) - Math.max(y, c.r.y));
        var area = ax * ay; if (!area) return;
        if (area > melhorArea) { melhorArea = area; melhor = c.d; }
        if (area > areaValida && podeMover(e, o, c.d)) { areaValida = area; melhorValido = c.d; }
      });
      return melhorValido ? { d: melhorValido, ok: true } : melhor ? { d: melhor, ok: false } : null;
    }
    var arr = null;
    function aoApertar(ev) {
      if (fim || autoRodando || arr) return;
      if (ev.button != null && ev.button > 0) return;
      var alvo = ev.target, el = alvo.closest ? alvo.closest('.jt-pac-carta') : null;
      if (modoTeclado) { modoTeclado = false; desenharCursor(); }
      if (!el) {
        var v = alvo.closest ? alvo.closest('.jt-pac-vaga') : null;
        if (v && v.getAttribute('data-p') === 'monte') { ev.preventDefault(); acaoComprar(); }
        return;
      }
      ev.preventDefault();
      var id = +el.getAttribute('data-id'), w = onde(id), o = null;
      if (!w) return;
      if (w.p === 'monte') { acaoComprar(); return; }
      if (w.p === 'desc' && w.topo) o = { p: 'desc' };
      else if (w.p === 'fund' && w.topo) o = { p: 'fund', i: w.i };
      else if (w.p === 'col' && w.up) o = { p: 'col', i: w.i, k: w.k };
      if (!o) return;
      if (pega) { pega = null; desenhar(); }
      var cs = cartasDe(e, o), base = {};
      cs.forEach(function (c) { base[c.id] = { x: pos[c.id].x, y: pos[c.id].y }; });
      arr = { o: o, cs: cs, base: base, x0: ev.clientX, y0: ev.clientY, ini: false, pid: ev.pointerId };
      try { mesa.setPointerCapture(ev.pointerId); } catch (er) { /* sem captura neste navegador */ }
    }
    function aoMexer(ev) {
      if (!arr || ev.pointerId !== arr.pid) return;
      var dx = ev.clientX - arr.x0, dy = ev.clientY - arr.y0;
      if (!arr.ini) {
        if (dx * dx + dy * dy < 64) return;
        arr.ini = true;
        arr.cs.forEach(function (c, j) { var el = els[c.id]; el.classList.add('jt-pac-arrasta'); if (el._tz) { clearTimeout(el._tz); el._tz = null; } el.style.zIndex = 2000 + j; });
      }
      arr.dx = dx; arr.dy = dy;
      arr.cs.forEach(function (c) { var b = arr.base[c.id]; els[c.id].style.transform = 'translate(' + (b.x + dx) + 'px,' + (b.y + dy) + 'px)'; });
    }
    function soltar(ev, cancelou) {
      if (!arr || (ev && ev.pointerId !== arr.pid)) return;
      var a = arr; arr = null;
      try { mesa.releasePointerCapture(a.pid); } catch (er) { /* já solto */ }
      if (!a.ini) { if (!cancelou) tocarCarta(a.o); return; }
      a.cs.forEach(function (c) { var el = els[c.id]; el.classList.remove('jt-pac-arrasta'); antes[c.id].x = null; });
      var b = a.base[a.cs[0].id], alvo = cancelou ? null : alvoSob(a.o, b.x + a.dx, b.y + a.dy);
      if (alvo && alvo.ok && aplicarMover(a.o, alvo.d)) return;
      if (alvo) ctx.som('erro');
      desenhar();   // volta para o lugar, com animação
    }
    function aoSoltar(ev) { soltar(ev, false); }
    function aoCancelar(ev) { soltar(ev, true); }
    mesa.addEventListener('pointerdown', aoApertar);
    mesa.addEventListener('pointermove', aoMexer);
    mesa.addEventListener('pointerup', aoSoltar);
    mesa.addEventListener('pointercancel', aoCancelar);
    mesa.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });

    /* ---------- teclado e controle da TV ---------- */
    var cur = { p: 'monte' }, pega = null, modoTeclado = false;
    function primeiraVirada(i) { var c = e.col[i]; for (var k = 0; k < c.length; k++) if (c[k].up) return k; return c.length - 1; }
    function normalizarCursor() {
      if (cur.p !== 'col') return;
      var c = e.col[cur.i];
      if (!c.length) { cur.k = -1; return; }
      if (cur.k == null || cur.k < 0 || cur.k >= c.length) cur.k = c.length - 1;
      if (!c[cur.k].up) cur.k = primeiraVirada(cur.i);
    }
    function retAlvo(a) {
      var cw = lay.cw, ch = lay.ch;
      if (a.p === 'monte') return { x: lay.monte.x, y: lay.monte.y, w: cw, h: ch };
      if (a.p === 'desc') { var td = topo(e.desc); return td ? { x: pos[td.id].x, y: pos[td.id].y, w: cw, h: ch } : { x: lay.desc.x, y: lay.desc.y, w: cw, h: ch }; }
      if (a.p === 'fund') return { x: lay.fund[a.i].x, y: lay.fund[a.i].y, w: cw, h: ch };
      var col = e.col[a.i];
      if (!col.length || a.k < 0) return { x: lay.colX[a.i], y: lay.yCol, w: cw, h: ch };
      var y0 = pos[col[a.k].id].y, y1 = pos[topo(col).id].y + ch;
      return { x: lay.colX[a.i], y: y0, w: cw, h: y1 - y0 };
    }
    function alvosTeclado() {   // cada lugar onde o cursor pode parar, com o ponto central da parte visível
      var lista = [{ p: 'monte' }, { p: 'desc' }], i, k;
      for (i = 0; i < 4; i++) lista.push({ p: 'fund', i: i });
      for (i = 0; i < 7; i++) {
        var col = e.col[i];
        if (!col.length) { lista.push({ p: 'col', i: i, k: -1 }); continue; }
        for (k = primeiraVirada(i); k < col.length; k++) lista.push({ p: 'col', i: i, k: k });
      }
      return lista.map(function (a) {
        var r = retAlvo(a), h = r.h;
        if (a.p === 'col' && a.k >= 0 && a.k < e.col[a.i].length - 1) h = pos[e.col[a.i][a.k + 1].id].y - r.y;
        return { a: a, cx: r.x + r.w / 2, cy: r.y + Math.min(h, lay.ch) / 2 };
      });
    }
    function mesmoAlvo(a, b) { return a.p === b.p && (a.i == null || a.i === b.i) && (a.p !== 'col' || a.k === b.k); }
    function andar(dir) {
      var lista = alvosTeclado(), atual = null, j;
      for (j = 0; j < lista.length; j++) if (mesmoAlvo(lista[j].a, cur)) { atual = lista[j]; break; }
      if (!atual) { cur = { p: 'monte' }; return; }
      var melhor = null, nota = Infinity;
      lista.forEach(function (c) {
        var dx = c.cx - atual.cx, dy = c.cy - atual.cy, prim, sec;
        if (dir === 'dir') { prim = dx; sec = dy; } else if (dir === 'esq') { prim = -dx; sec = dy; }
        else if (dir === 'baixo') { prim = dy; sec = dx; } else { prim = -dy; sec = dx; }
        if (prim <= 2) return;
        var v = prim + Math.abs(sec) * 3;
        if (v < nota) { nota = v; melhor = c; }
      });
      if (melhor) { cur = melhor.a; ctx.som('toque'); }
    }
    function desenharCursor() {
      if (!modoTeclado || fim) { cursorEl.hidden = true; return; }
      normalizarCursor();
      var r = retAlvo(cur);
      cursorEl.hidden = false;
      cursorEl.style.width = (r.w + 8) + 'px'; cursorEl.style.height = (r.h + 8) + 'px';
      cursorEl.style.transform = 'translate(' + (r.x - 4) + 'px,' + (r.y - 4) + 'px)';
    }
    function origemDoCursor() {
      if (cur.p === 'desc') return e.desc.length ? { p: 'desc' } : null;
      if (cur.p === 'fund') return e.fund[cur.i].length ? { p: 'fund', i: cur.i } : null;
      if (cur.p === 'col') return cur.k >= 0 && e.col[cur.i][cur.k] && e.col[cur.i][cur.k].up ? { p: 'col', i: cur.i, k: cur.k } : null;
      return null;
    }
    function enter() {
      if (cur.p === 'monte') { pega = null; acaoComprar(); return; }
      if (!pega) {
        var o = origemDoCursor();
        if (!o) { ctx.som('erro'); return; }
        pega = o; ctx.som('toque'); desenhar(); return;
      }
      var p = pega;
      if (cur.p === p.p && cur.i === p.i) {   // soltar no mesmo lugar = "toque simples"
        pega = null; var d = melhorDestino(e, p);
        if (d) aplicarMover(p, d); else { ctx.som('erro'); desenhar(); }
        return;
      }
      if (cur.p === 'col' || cur.p === 'fund') {
        var dest = { p: cur.p, i: cur.i };
        if (podeMover(e, p, dest)) { pega = null; aplicarMover(p, dest); return; }
      }
      ctx.som('erro');
    }
    function janelaAberta() {
      var a = document.getElementById('ajuda'), f = document.getElementById('fim');
      return (a && !a.hidden) || (f && !f.hidden);
    }
    function aoTeclar(ev) {
      if (parado || fim || autoRodando || janelaAberta() || !palco.offsetParent) return;
      var k = ev.key, dir = k === 'ArrowLeft' ? 'esq' : k === 'ArrowRight' ? 'dir' : k === 'ArrowUp' ? 'cima' : k === 'ArrowDown' ? 'baixo' : null;
      var tag = ev.target && ev.target.tagName;
      if (dir) {
        ev.preventDefault();
        if (!modoTeclado) { modoTeclado = true; normalizarCursor(); } else andar(dir);
        desenharCursor(); return;
      }
      if (k === 'Enter' || k === ' ' || k === 'Spacebar') {
        if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'A') return;
        ev.preventDefault();
        if (!modoTeclado) { modoTeclado = true; desenharCursor(); return; }
        enter(); desenharCursor(); return;
      }
      if ((k === 'Escape' || k === 'Backspace' || k === 'GoBack' || k === 'BrowserBack') && pega) {
        ev.preventDefault(); ev.stopPropagation(); pega = null; ctx.som('toque'); desenhar(); return;
      }
      if ((k === 'u' || k === 'U' || (k === 'z' && (ev.ctrlKey || ev.metaKey))) && podeDesfazer) { ev.preventDefault(); acaoDesfazer(); }
    }
    document.addEventListener('keydown', aoTeclar, true);

    /* ---------- tamanho da tela ---------- */
    var espera = null;
    function aoRedimensionar() { if (espera) clearTimeout(espera); espera = setTimeout(function () { espera = null; if (!parado) refazerTudo(); }, 80); }
    window.addEventListener('resize', aoRedimensionar);
    window.addEventListener('orientationchange', aoRedimensionar);

    refazerTudo(); atualizarHud();

    if (ctx.teste) window.JogotecaPacienciaDebug = { logica: logica, estado: function () { return e; }, layout: function () { return lay; },
      refazer: function () { depois(); }, pega: function () { return pega; }, cursor: function () { return cur; } };

    return {
      parar: function () {
        parado = true;
        clearInterval(relogio);
        if (espera) clearTimeout(espera);
        timers.forEach(clearTimeout); timers = [];
        document.removeEventListener('keydown', aoTeclar, true);
        window.removeEventListener('resize', aoRedimensionar);
        window.removeEventListener('orientationchange', aoRedimensionar);
        if (mesa.parentNode) mesa.parentNode.removeChild(mesa);
      }
    };
  }

  (window.JogotecaJogos = window.JogotecaJogos || []).push({ id: 'paciencia', ajuda: ajuda, iniciar: iniciar, logica: logica });
})();
