/* Jogoteca — Jogo da Velha de guerra (dono, 20/Nov/2026: "com bastante animação, como se fosse uma guerra pra quem ganha").
   O Exército Vermelho (⚔️ espadas, o X) contra o Exército Azul (🛡️ escudos, o O), num campo de batalha 3×3. Cada partida é
   uma BATALHA; quem vence 3 batalhas vence a GUERRA. A marca cai do céu com poeira; quem fecha a linha manda um raio pela
   linha e as marcas do outro explodem (BUM!); empate é trégua, com bandeira branca. Contra o computador (o jogador é o
   Vermelho) ou em dois na mesma tela; quem começa alterna a cada batalha.
   Computador: fácil erra bastante; médio ganha quando pode e bloqueia; difícil não erra (minimax).
   Lógica pura em "logica" (testes no Node); efeitos em jogos/batalha.js. */
(function () {
  'use strict';

  /* ================= lógica pura ================= */
  var LINHAS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  function vencedor(t) {   // { quem: 'x'|'o', linha } | { quem: 'empate' } | null
    for (var i = 0; i < 8; i++) { var l = LINHAS[i]; if (t[l[0]] && t[l[0]] === t[l[1]] && t[l[0]] === t[l[2]]) return { quem: t[l[0]], linha: l }; }
    return t.indexOf('') < 0 ? { quem: 'empate' } : null;
  }
  function livres(t) { var r = []; for (var i = 0; i < 9; i++) if (!t[i]) r.push(i); return r; }
  var outro = function (q) { return q === 'x' ? 'o' : 'x'; };
  function minimax(t, vez, eu, prof) {   // nota do ponto de vista de "eu" (vitória rápida vale mais)
    var v = vencedor(t);
    if (v) return v.quem === 'empate' ? 0 : v.quem === eu ? 10 - prof : prof - 10;
    var melhor = vez === eu ? -99 : 99, l = livres(t);
    for (var i = 0; i < l.length; i++) {
      t[l[i]] = vez; var n = minimax(t, outro(vez), eu, prof + 1); t[l[i]] = '';
      melhor = vez === eu ? Math.max(melhor, n) : Math.min(melhor, n);
    }
    return melhor;
  }
  function fechaLinha(t, quem) {   // casa que completa uma linha de "quem", ou -1
    for (var i = 0; i < 8; i++) {
      var l = LINHAS[i], n = 0, vazia = -1;
      for (var k = 0; k < 3; k++) { if (t[l[k]] === quem) n++; else if (!t[l[k]]) vazia = l[k]; }
      if (n === 2 && vazia >= 0) return vazia;
    }
    return -1;
  }
  // a jogada do computador ("eu") no nível; rnd() entre 0 e 1 (os testes passam um sorteio fixo)
  function jogadaPC(t, eu, nivel, rnd) {
    rnd = rnd || Math.random;
    var l = livres(t); if (!l.length) return -1;
    var sorteia = function (lista) { return lista[Math.floor(rnd() * lista.length)]; };
    if (nivel === 'facil' && rnd() < 0.55) return sorteia(l);
    if (nivel !== 'dificil') {
      var g = fechaLinha(t, eu); if (g >= 0) return g;
      var b = fechaLinha(t, outro(eu)); if (b >= 0) return b;
      if (!t[4] && rnd() < 0.6) return 4;
      return sorteia(l);
    }
    var melhor = -99, lista = [];
    for (var i = 0; i < l.length; i++) {
      t[l[i]] = eu; var n = minimax(t, outro(eu), eu, 1); t[l[i]] = '';
      if (n > melhor) { melhor = n; lista = [l[i]]; } else if (n === melhor) lista.push(l[i]);
    }
    return sorteia(lista);
  }
  var logica = { LINHAS: LINHAS, vencedor: vencedor, jogadaPC: jogadaPC, minimax: minimax, VITORIAS: 3 };

  /* ================= desenho ================= */
  var CSS = '' +
    '.jt-vel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px 10px calc(env(safe-area-inset-bottom,0px) + 10px);box-sizing:border-box;' +
      'background:radial-gradient(circle at 50% 40%,#5c7d3a 0%,#3d5a26 55%,#24361a 100%);overflow:hidden}' +
    '.jt-vel-placar{display:flex;align-items:center;justify-content:center;gap:10px;font-weight:700;font-size:clamp(16px,4.5vw,22px)}' +
    '.jt-vel-lado{display:flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;background:rgba(0,0,0,.35);border:2px solid transparent;transition:transform .2s,border-color .2s}' +
    '.jt-vel-lado.vez{border-color:#ffcf4a;transform:scale(1.08);box-shadow:0 0 14px rgba(255,207,74,.6)}' +
    '.jt-vel-lado.x{color:#ffb3b3}.jt-vel-lado.o{color:#b3d9ff}' +
    '.jt-vel-pts{display:inline-block;min-width:1.2em;text-align:center;font-size:1.25em;color:#fff}.jt-vel-pts.pop{animation:jtVelPop .6s}' +
    '@keyframes jtVelPop{0%{transform:scale(1)}40%{transform:scale(1.9);color:#ffcf4a}100%{transform:scale(1)}}' +
    '.jt-vel-estrelas{font-size:.8em;letter-spacing:1px;opacity:.9}' +
    '.jt-vel-status{min-height:1.3em;font-size:clamp(15px,4vw,19px);text-align:center;text-shadow:0 2px 3px rgba(0,0,0,.5)}' +
    '.jt-vel-campo{position:relative;flex:1 1 auto;width:100%;display:flex;align-items:center;justify-content:center;min-height:0}' +
    '.jt-vel-tab{position:relative;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:0;border-radius:18px;' +
      'background:linear-gradient(160deg,#c9a66b,#a8834a);box-shadow:inset 0 0 0 6px #6b4a22,0 10px 26px rgba(0,0,0,.45);padding:6px;box-sizing:border-box}' +
    '.jt-vel-cel{position:relative;border:0;background:transparent;padding:0;margin:0;cursor:pointer;outline-offset:-6px}' +
    '.jt-vel-cel:nth-child(3n+1),.jt-vel-cel:nth-child(3n+2){border-right:7px solid #5a3b17}.jt-vel-cel:nth-child(-n+6){border-bottom:7px solid #5a3b17}' +
    '.jt-vel-cel:focus-visible{outline:4px solid #ffcf4a}' +
    '.jt-vel-cel.alvo:hover::after{content:"";position:absolute;inset:18%;border-radius:50%;background:rgba(255,255,255,.18)}' +
    '.jt-vel-marca{position:absolute;inset:10%;animation:jtVelCai .45s cubic-bezier(.3,1.6,.5,1)}' +
    '.jt-vel-marca svg{width:100%;height:100%;display:block;filter:drop-shadow(0 6px 4px rgba(0,0,0,.45))}' +
    '@keyframes jtVelCai{0%{transform:translateY(-120%) scale(2.2) rotate(-25deg);opacity:0}60%{transform:translateY(4%) scale(.92) rotate(4deg);opacity:1}100%{transform:none}}' +
    '.jt-vel-marca.campea{animation:jtVelPula .5s ease-in-out 3}' +
    '@keyframes jtVelPula{0%,100%{transform:none}50%{transform:translateY(-14%) scale(1.15)}}' +
    '.jt-vel-marca.caida{animation:jtVelCaida .7s ease-in forwards}' +
    '@keyframes jtVelCaida{0%{transform:none}30%{transform:rotate(-15deg) scale(1.1)}100%{transform:translateY(40%) rotate(70deg) scale(.3);opacity:0}}' +
    '.jt-vel-raio{position:absolute;inset:0;pointer-events:none;z-index:5}' +
    '.jt-vel-raio line{stroke-dasharray:1;stroke-dashoffset:1;animation:jtVelRaio .45s ease-out forwards}' +
    '@keyframes jtVelRaio{to{stroke-dashoffset:0}}' +
    '.jt-vel-bandeira{position:absolute;left:50%;top:50%;font-size:min(30vw,140px);transform:translate(-50%,-50%);animation:jtVelBand 1.6s ease-in-out;z-index:6;pointer-events:none}' +
    '@keyframes jtVelBand{0%{transform:translate(-50%,40%) scale(.3);opacity:0}30%{transform:translate(-50%,-50%) scale(1) rotate(-8deg);opacity:1}55%{transform:translate(-50%,-50%) rotate(8deg)}80%{transform:translate(-50%,-50%) rotate(-6deg);opacity:1}100%{transform:translate(-50%,-60%);opacity:0}}' +
    '.jt-vel-botoes{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}' +
    '.jt-vel-bt{min-height:50px;padding:0 22px;border:0;border-radius:999px;font-size:19px;font-weight:700;color:#3a2300;background:linear-gradient(180deg,#ffe07a,#ffcf4a 45%,#ff9d2e);box-shadow:0 5px 0 #b45d0c}' +
    '.jt-vel-bt.sec{color:#fff;background:rgba(255,255,255,.14);border:1.5px solid rgba(255,255,255,.45);box-shadow:none}' +
    '.jt-vel-veu{position:absolute;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;background:rgba(10,14,30,.72);padding:16px;box-sizing:border-box}' +
    '.jt-vel-caixa{max-width:420px;width:100%;padding:18px;border-radius:22px;background:#24361a;border:3px solid #ffcf4a;text-align:center;display:flex;flex-direction:column;gap:12px;box-shadow:0 14px 40px rgba(0,0,0,.5)}' +
    '.jt-vel-caixa h3{margin:0;font-size:clamp(22px,6vw,30px)}.jt-vel-caixa p{margin:0;font-size:17px;line-height:1.35}';

  // as marcas, desenho próprio: espadas cruzadas (Vermelho) e escudo com estrela (Azul)
  function svgMarca(q) {
    if (q === 'x') return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<g transform="rotate(45 50 50)"><rect x="46" y="8" width="8" height="62" rx="2" fill="#e8edf3" stroke="#5a6170" stroke-width="2"/><polygon points="46,8 50,0 54,8" fill="#e8edf3" stroke="#5a6170" stroke-width="2"/>' +
      '<rect x="32" y="68" width="36" height="7" rx="3" fill="#d92b3a" stroke="#6b0f17" stroke-width="2"/><rect x="46" y="75" width="8" height="16" rx="2" fill="#7a3a12"/><circle cx="50" cy="94" r="5" fill="#ffcf4a" stroke="#7a4a00" stroke-width="2"/></g>' +
      '<g transform="rotate(-45 50 50)"><rect x="46" y="8" width="8" height="62" rx="2" fill="#e8edf3" stroke="#5a6170" stroke-width="2"/><polygon points="46,8 50,0 54,8" fill="#e8edf3" stroke="#5a6170" stroke-width="2"/>' +
      '<rect x="32" y="68" width="36" height="7" rx="3" fill="#d92b3a" stroke="#6b0f17" stroke-width="2"/><rect x="46" y="75" width="8" height="16" rx="2" fill="#7a3a12"/><circle cx="50" cy="94" r="5" fill="#ffcf4a" stroke="#7a4a00" stroke-width="2"/></g></svg>';
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4 L88 16 C88 56 74 80 50 96 C26 80 12 56 12 16 Z" fill="#2d6fe0" stroke="#0d2a66" stroke-width="4"/>' +
      '<path d="M50 14 L78 23 C78 54 68 72 50 85 C32 72 22 54 22 23 Z" fill="#5fa6ff"/>' +
      '<polygon points="50,28 56,44 73,44 59,54 64,70 50,60 36,70 41,54 27,44 44,44" fill="#ffcf4a" stroke="#7a4a00" stroke-width="2"/></svg>';
  }
  var COR = { x: ['#e23b3b', '#ffb3b3', '#7a1a12', '#ffcf4a'], o: ['#2d6fe0', '#b3d9ff', '#0d2a66', '#ffcf4a'] };

  function iniciar(palco, ctx) {
    if (!document.getElementById('jt-velha-css')) { var st = document.createElement('style'); st.id = 'jt-velha-css'; st.textContent = CSS; document.head.appendChild(st); }
    var t = ctx.t, timers = [], vivo = true;
    var raiz = document.createElement('div'); raiz.className = 'jt-vel'; palco.appendChild(raiz);
    var fx = window.JogotecaBatalha.criar(palco, ctx);
    var NOME = { x: t('Vermelho', 'Red', 'Rojo'), o: t('Azul', 'Blue', 'Azul') };
    raiz.innerHTML = '<div class="jt-vel-placar"><span class="jt-vel-lado x">⚔️ <span class="jt-vel-nome-x"></span> <span class="jt-vel-pts" data-q="x">0</span></span>' +
      '<span>×</span><span class="jt-vel-lado o"><span class="jt-vel-pts" data-q="o">0</span> <span class="jt-vel-nome-o"></span> 🛡️</span></div>' +
      '<div class="jt-vel-status" aria-live="polite"></div><div class="jt-vel-campo"><div class="jt-vel-tab" role="grid"></div></div>' +
      '<div class="jt-vel-botoes"><button type="button" class="jt-vel-bt" data-acao="proxima" hidden></button></div>';
    var $ = function (s) { return raiz.querySelector(s); }, tab = $('.jt-vel-tab'), status = $('.jt-vel-status'), btProx = $('[data-acao="proxima"]');
    var E = { t: ['', '', '', '', '', '', '', '', ''], vez: 'x', comeca: 'x', pts: { x: 0, o: 0 }, modo: null, travado: true, fim: null, guerra: null, batalha: 1 };
    var cels = [];
    for (var i = 0; i < 9; i++) (function (i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'jt-vel-cel'; b.setAttribute('data-i', i);
      b.setAttribute('aria-label', t('Casa ', 'Square ', 'Casilla ') + (i + 1));
      b.addEventListener('click', function () { tocar(i); });
      tab.appendChild(b); cels.push(b);
    })(i);
    function nomes() {
      var pc = E.modo === 'pc';
      $('.jt-vel-nome-x').textContent = pc ? t('Você', 'You', 'Tú') : NOME.x;
      $('.jt-vel-nome-o').textContent = pc ? t('Computador', 'Computer', 'Ordenador') : NOME.o;
    }
    function medir() {
      var c = $('.jt-vel-campo').getBoundingClientRect(), lado = Math.max(120, Math.floor(Math.min(c.width - 8, c.height - 8, 520)));
      tab.style.width = tab.style.height = lado + 'px';
    }
    window.addEventListener('resize', medir);
    function centro(i) { var r = cels[i].getBoundingClientRect(), p = palco.getBoundingClientRect(); return { x: r.left - p.left + r.width / 2, y: r.top - p.top + r.height / 2 }; }
    function pintarVez() {
      raiz.querySelectorAll('.jt-vel-lado').forEach(function (el) { el.classList.toggle('vez', !E.fim && el.classList.contains(E.vez)); });
      cels.forEach(function (c, i) { c.classList.toggle('alvo', !E.t[i] && !E.travado); });
      if (E.fim) return;
      var pc = E.modo === 'pc' && E.vez === 'o';
      status.textContent = t('Batalha ', 'Battle ', 'Batalla ') + E.batalha + ' · ' +
        (pc ? t('🛡️ O computador está atacando…', '🛡️ The computer is attacking…', '🛡️ El ordenador está atacando…')
          : E.modo === 'pc' ? t('⚔️ Sua vez: ataque!', '⚔️ Your turn: attack!', '⚔️ Tu turno: ¡ataca!')
            : (E.vez === 'x' ? '⚔️ ' : '🛡️ ') + t('Vez do ' + NOME[E.vez], NOME[E.vez] + "'s turn", 'Turno del ' + NOME[E.vez]));
    }
    function por(i, q) {
      E.t[i] = q;
      var m = document.createElement('div'); m.className = 'jt-vel-marca'; m.setAttribute('data-q', q); m.innerHTML = svgMarca(q);
      cels[i].appendChild(m); cels[i].setAttribute('aria-label', (q === 'x' ? '⚔️ ' : '🛡️ ') + NOME[q]);
      timers.push(setTimeout(function () { var c = centro(i); fx.faiscas(c.x, c.y + 10, '#d9c49a'); fx.faiscas(c.x, c.y, COR[q][3]); fx.som('passo'); fx.tremer(tab); }, 260));
    }
    function tocar(i) {
      if (E.travado || E.fim || E.t[i] || (E.modo === 'pc' && E.vez === 'o')) return;
      jogar(i);
    }
    function jogar(i) {
      por(i, E.vez);
      var v = vencedor(E.t);
      if (v) { acabou(v); return; }
      E.vez = outro(E.vez); pintarVez();
      if (E.modo === 'pc' && E.vez === 'o') vezPC();
    }
    function vezPC() {
      E.travado = true; pintarVez(); fx.som('tambor');
      timers.push(setTimeout(function () {
        if (!vivo) return;
        E.travado = false;
        jogar(jogadaPC(E.t, 'o', ctx.nivel));
      }, ctx.teste ? 120 : 750));
    }
    function acabou(v) {
      E.fim = v; E.travado = true; pintarVez();
      timers.push(setTimeout(function () {
        if (!vivo) return;
        if (v.quem === 'empate') {
          var b = document.createElement('div'); b.className = 'jt-vel-bandeira'; b.textContent = '🏳️'; $('.jt-vel-campo').appendChild(b);
          timers.push(setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 1700));
          fx.som('tregua'); fx.faixa(t('TRÉGUA!', 'TRUCE!', '¡TREGUA!'), '#7a8494');
          status.textContent = t('Ninguém venceu esta batalha: trégua!', 'Nobody won this battle: truce!', 'Nadie ha ganado esta batalla: ¡tregua!');
          proxima();
          return;
        }
        var q = v.quem, perde = outro(q);
        // o raio corre pela linha vencedora
        var a = centro(v.linha[0]), z = centro(v.linha[2]), r = palco.getBoundingClientRect(), tr = tab.getBoundingClientRect();
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'jt-vel-raio');
        var ox = tr.left - r.left, oy = tr.top - r.top;
        svg.innerHTML = '<line x1="' + (a.x - ox) + '" y1="' + (a.y - oy) + '" x2="' + (z.x - ox) + '" y2="' + (z.y - oy) + '" pathLength="1" stroke="#fff3a0" stroke-width="16" stroke-linecap="round" style="filter:drop-shadow(0 0 10px ' + COR[q][3] + ')"/>';
        tab.appendChild(svg); fx.som('espada');
        v.linha.forEach(function (k) { var m = cels[k].querySelector('.jt-vel-marca'); if (m) m.classList.add('campea'); });
        // as marcas do outro exército explodem, uma de cada vez
        var delas = []; E.t.forEach(function (x, k) { if (x === perde) delas.push(k); });
        delas.forEach(function (k, n) {
          timers.push(setTimeout(function () {
            if (!vivo) return;
            var c = centro(k), m = cels[k].querySelector('.jt-vel-marca'); if (m) m.classList.add('caida');
            fx.explosao(c.x, c.y, COR[perde].concat(['#6b6157']), 0.8); fx.som('boom'); fx.tremer(raiz, n === delas.length - 1);
            if (n === 0) fx.texto(c.x, c.y - 20, t(['BUM!', 'POW!', 'CABUM!'][n % 3], ['BOOM!', 'POW!', 'KABOOM!'][n % 3], ['¡BUM!', '¡PAM!', '¡CATAPUM!'][n % 3]), COR[q][3]);
          }, 450 + n * 260));
        });
        timers.push(setTimeout(function () {
          if (!vivo) return;
          E.pts[q]++; var el = raiz.querySelector('.jt-vel-pts[data-q="' + q + '"]'); el.textContent = E.pts[q]; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
          var humano = E.modo === 'pc' ? q === 'x' : true, nome = E.modo === 'pc' ? (q === 'x' ? t('VOCÊ', 'YOU', 'TÚ') : t('O COMPUTADOR', 'THE COMPUTER', 'EL ORDENADOR')) : NOME[q].toUpperCase();
          if (E.pts[q] >= logica.VITORIAS) { guerra(q); return; }
          fx.faixa(t('VITÓRIA ', 'VICTORY ', 'VICTORIA ') + (q === 'x' ? '⚔️' : '🛡️'), COR[q][0]); fx.som(humano ? 'corneta' : 'derrota');
          status.textContent = E.modo === 'pc' ? (q === 'x' ? t('Você venceu esta batalha!', 'You won this battle!', '¡Has ganado esta batalla!') : t('O computador venceu esta batalha.', 'The computer won this battle.', 'El ordenador ha ganado esta batalla.'))
            : t('O ' + NOME[q] + ' venceu esta batalha!', NOME[q] + ' won this battle!', '¡El ' + NOME[q] + ' ha ganado esta batalla!');
          proxima();
        }, 650 + delas.length * 260));
      }, 380));
    }
    function proxima() {
      btProx.hidden = false; btProx.textContent = t('⚔️ Próxima batalha', '⚔️ Next battle', '⚔️ Siguiente batalla');
      timers.push(setTimeout(function () { try { btProx.focus(); } catch (e) {} }, 60));
    }
    function guerra(q) {
      E.guerra = q; fx.som('vitoria'); fx.fogos(6); fx.faixa(t('VITÓRIA NA GUERRA!', 'WAR WON!', '¡GUERRA GANADA!'), COR[q][0], 2200);
      var pc = E.modo === 'pc';
      status.textContent = pc ? (q === 'x' ? t('Você venceu a guerra!', 'You won the war!', '¡Has ganado la guerra!') : t('O computador venceu a guerra.', 'The computer won the war.', 'El ordenador ha ganado la guerra.'))
        : t('O ' + NOME[q] + ' venceu a guerra!', NOME[q] + ' won the war!', '¡El ' + NOME[q] + ' ha ganado la guerra!');
      timers.push(setTimeout(function () {
        if (!vivo) return;
        if (!pc || q === 'x') {
          var txt = pc ? ['Você venceu a guerra por ' + E.pts.x + ' a ' + E.pts.o + '!', 'You won the war ' + E.pts.x + ' to ' + E.pts.o + '!', '¡Has ganado la guerra ' + E.pts.x + ' a ' + E.pts.o + '!']
            : ['O Exército ' + NOME[q] + ' venceu a guerra por ' + E.pts[q] + ' a ' + E.pts[outro(q)] + '!', 'The ' + NOME[q] + ' Army won the war ' + E.pts[q] + ' to ' + E.pts[outro(q)] + '!', '¡El Ejército ' + NOME[q] + ' ha ganado la guerra ' + E.pts[q] + ' a ' + E.pts[outro(q)] + '!'];
          ctx.venceu(txt[0], txt[1], txt[2]);
        } else veu(t('O computador venceu a guerra', 'The computer won the war', 'El ordenador ha ganado la guerra'),
          t('Foi por ' + E.pts.o + ' a ' + E.pts.x + '. Bora pedir revanche?', 'It was ' + E.pts.o + ' to ' + E.pts.x + '. Time for a rematch?', 'Ha sido ' + E.pts.o + ' a ' + E.pts.x + '. ¿Pedimos la revancha?'),
          [[t('🔄 Revanche', '🔄 Rematch', '🔄 Revancha'), novaGuerra]]);
      }, 2400));
    }
    function batalhaNova() {
      btProx.hidden = true;
      E.t = ['', '', '', '', '', '', '', '', '']; E.fim = null; E.batalha++;
      E.comeca = outro(E.comeca); E.vez = E.comeca;
      cels.forEach(function (c, i) { c.innerHTML = ''; c.setAttribute('aria-label', t('Casa ', 'Square ', 'Casilla ') + (i + 1)); });
      var r = tab.querySelector('.jt-vel-raio'); if (r) r.parentNode.removeChild(r);
      E.travado = false; pintarVez(); fx.som('tambor');
      if (E.modo === 'pc' && E.vez === 'o') vezPC();
    }
    function novaGuerra() {
      E.pts = { x: 0, o: 0 }; E.batalha = 0; E.comeca = 'o'; E.guerra = null;
      raiz.querySelectorAll('.jt-vel-pts').forEach(function (el) { el.textContent = '0'; });
      batalhaNova();
    }
    btProx.addEventListener('click', function () { ctx.som('toque'); if (!E.guerra) batalhaNova(); });
    var veuEl = null;
    function veu(titulo, texto, botoes) {
      veuEl = document.createElement('div'); veuEl.className = 'jt-vel-veu';
      var cx = document.createElement('div'); cx.className = 'jt-vel-caixa'; cx.innerHTML = '<h3></h3><p></p>';
      cx.querySelector('h3').textContent = titulo; cx.querySelector('p').textContent = texto;
      botoes.forEach(function (b, k) {
        var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'jt-vel-bt' + (k ? ' sec' : ''); bt.textContent = b[0];
        bt.addEventListener('click', function () { ctx.som('toque'); if (veuEl && veuEl.parentNode) veuEl.parentNode.removeChild(veuEl); veuEl = null; b[1](); });
        cx.appendChild(bt);
      });
      veuEl.appendChild(cx); raiz.appendChild(veuEl);
      timers.push(setTimeout(function () { var b = cx.querySelector('button'); if (b) b.focus(); }, 40));
    }
    // começo: contra quem?
    function escolher(modo) { E.modo = modo; ctx.gravar('modo', modo); nomes(); novaGuerra(); }
    nomes(); medir(); pintarVez();
    veu(t('⚔️ Jogo da Velha de guerra', '⚔️ Tic-Tac-Toe at war', '⚔️ Tres en raya en guerra'),
      t('Quem vencer 3 batalhas vence a guerra. Contra quem você vai lutar?', 'Whoever wins 3 battles wins the war. Who will you fight?', 'Quien gane 3 batallas gana la guerra. ¿Contra quién vas a luchar?'),
      ctx.ler('modo') === 'dois'
        ? [[t('👥 Dois jogadores', '👥 Two players', '👥 Dos jugadores'), function () { escolher('dois'); }], [t('🤖 Contra o computador', '🤖 Against the computer', '🤖 Contra el ordenador'), function () { escolher('pc'); }]]
        : [[t('🤖 Contra o computador', '🤖 Against the computer', '🤖 Contra el ordenador'), function () { escolher('pc'); }], [t('👥 Dois jogadores', '👥 Two players', '👥 Dos jugadores'), function () { escolher('dois'); }]]);
    timers.push(setTimeout(medir, 30));

    var api = {
      parar: function () {
        vivo = false; timers.forEach(clearTimeout); timers = []; fx.parar();
        window.removeEventListener('resize', medir);
      }
    };
    if (ctx.teste) api.estado = function () { return { t: E.t.slice(), vez: E.vez, pts: Object.assign({}, E.pts), modo: E.modo, fim: E.fim && E.fim.quem, guerra: E.guerra, travado: E.travado, veu: !!veuEl }; };
    return api;
  }

  var jogo = {
    id: 'velha',
    logica: logica,
    ajuda: function (t) {
      return '<p>' + t('Faça uma linha de 3 marcas iguais (de lado, de pé ou na diagonal) antes do outro exército. Cada partida é uma batalha; quem vencer 3 batalhas vence a guerra.',
        'Make a line of 3 of your marks (across, down or diagonal) before the other army. Each game is a battle; whoever wins 3 battles wins the war.',
        'Haz una línea de 3 marcas iguales (en horizontal, vertical o diagonal) antes que el otro ejército. Cada partida es una batalla; quien gane 3 batallas gana la guerra.') + '</p>' +
        '<p>' + t('⚔️ O Vermelho usa espadas e 🛡️ o Azul usa escudos. Contra o computador você é o Vermelho; em dois, passem o aparelho. Quem começa troca a cada batalha.',
        '⚔️ Red uses swords and 🛡️ Blue uses shields. Against the computer you are Red; with two players, pass the device. Who starts changes every battle.',
        '⚔️ El Rojo usa espadas y 🛡️ el Azul usa escudos. Contra el ordenador eres el Rojo; entre dos, pasaos el aparato. Quien empieza cambia en cada batalla.') + '</p>' +
        '<p>' + t('Fácil: o computador se distrai. Médio: ele bloqueia. Difícil: ele não erra nunca, e o melhor que dá é empatar (trégua)!',
        'Easy: the computer gets distracted. Medium: it blocks you. Hard: it never makes a mistake, so the best you can get is a draw (truce)!',
        'Fácil: el ordenador se despista. Medio: te bloquea. Difícil: no se equivoca nunca, ¡lo mejor que puedes sacar es un empate (tregua)!') + '</p>';
    },
    iniciar: iniciar
  };
  if (typeof window !== 'undefined') (window.JogotecaJogos = window.JogotecaJogos || []).push(jogo);
  if (typeof module !== 'undefined' && module.exports) module.exports = jogo;
})();
