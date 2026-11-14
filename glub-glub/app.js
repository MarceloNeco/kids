/* GLUB GLUB — amostra do desenho (Tarefa 2): o lago com Juca, Lili e quatro bichos nadando; os anzóis mergulham sozinhos
   de vez em quando para mostrar o movimento. O jogo de verdade (telas, botões, placar) entra na Tarefa 4. */
(function () {
  'use strict';
  var R = window.GlubRegras, A = window.GlubArte;
  var cv = document.getElementById('lago'), ctx = cv.getContext('2d'), E = null, ultimo = 0, t0 = performance.now();
  var VITRINE = [['lambari', 1, 5], ['pacu', 2, 3], ['martelo', 4, 2], ['sereia', 5, 1]];
  function montar() {
    var w = innerWidth, h = innerHeight, aspecto = w / h;
    A.preparar(cv, w, h, devicePixelRatio || 1);
    if (!E) {
      E = R.criar({ semente: 4, aspecto: aspecto, jogadores: [{ lado: 'esq', nivel: 'facil', robo: false }, { lado: 'dir', nivel: 'facil', robo: false }] });
      E.bichos = []; E.repor = false; E.proxBolha = Infinity; E.proxRaro = Infinity; E.bonusFeito = true; E.tempo = 1e9;
      VITRINE.forEach(function (v) { for (var i = 0; i < v[2]; i++) entrar(v[0], v[1], (i + 0.5) / v[2]); });
    } else R.redimensionar(E, aspecto);
  }
  function entrar(id, faixa, fx) {
    var linhas = R.LINHAS[faixa], fy = linhas[Math.floor(Math.random() * linhas.length)];
    var o = R.colocar(E, id, fx * E.W, E.sup + (R.H - E.sup) * fy);
    o.dir = Math.random() < 0.5 ? 1 : -1; o.fy0 = o.fy;
  }
  var prox = [1.5, 3];
  function quadro(agora) {
    var dt = Math.min(0.05, (agora - (ultimo || agora)) / 1000); ultimo = agora;
    var t = (agora - t0) / 1000;
    for (var j = 0; j < 2; j++) if (t > prox[j]) { R.pescar(E, j); prox[j] = t + 2.5 + Math.random() * 2; }
    R.passo(E, dt).forEach(function (e) { if (e.tipo === 'pegou') { var v = VITRINE.filter(function (x) { return x[0] === e.bicho.id; })[0]; entrar(v[0], v[1], Math.random()); } });
    A.quadro(ctx, E, t);
    requestAnimationFrame(quadro);
  }
  addEventListener('resize', montar);
  montar(); requestAnimationFrame(quadro);
  window.GlubDebug = { pronto: true, estado: function () { return E; } };
})();
