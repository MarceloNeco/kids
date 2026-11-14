/* GLUB GLUB — amostra do desenho (Tarefa 2): o lago com Juca, Lili e os bichos nadando; os anzóis mergulham sozinhos
   de vez em quando para mostrar o movimento. ?per=dia|tarde|noite e ?cen=roca|mar|serra trocam a hora e o lugar;
   ?vitrine põe todos os bichos no lago. O jogo de verdade (telas, botões, placar) entra na Tarefa 4. */
(function () {
  'use strict';
  var R = window.GlubRegras, A = window.GlubArte, Q = location.search;
  var PER = (Q.match(/[?&]per=(\w+)/) || [])[1] || 'dia', CEN = (Q.match(/[?&]cen=(\w+)/) || [])[1] || 'roca', VITRINE = /[?&]vitrine\b/.test(Q);
  var cv = document.getElementById('lago'), ctx = cv.getContext('2d'), E = null, ultimo = 0, t0 = performance.now();
  function montar() {
    var w = innerWidth, h = innerHeight, aspecto = w / h;
    A.preparar(cv, w, h, devicePixelRatio || 1, { periodo: PER, cenario: CEN });
    if (!E) {
      E = R.criar({ semente: 4, aspecto: aspecto, jogadores: [{ lado: 'esq', nivel: 'facil', robo: false }, { lado: 'dir', nivel: 'facil', robo: false }] });
      E.proxBolha = 3; E.bonusFeito = true; E.tempo = 1e9;
      if (VITRINE) {
        E.bichos = []; E.repor = false; E.proxBolha = Infinity; E.proxRaro = Infinity;
        var porFaixa = {};
        R.BICHOS.forEach(function (b) { if (b.tipo !== 'lixo') (porFaixa[b.faixa] = porFaixa[b.faixa] || []).push(b.id); });
        Object.keys(porFaixa).forEach(function (f) {
          var ids = porFaixa[f], linhas = R.LINHAS[f];
          ids.forEach(function (id, i) { var o = R.colocar(E, id, (i + 0.5) / ids.length * E.W, E.sup + (R.H - E.sup) * linhas[i % linhas.length], { vel: 0 }); o.fy0 = o.fy; o.dir = i % 2 ? -1 : 1; });
        });
      }
    } else R.redimensionar(E, aspecto);
  }
  var prox = [1.5, 3];
  function quadro(agora) {
    var dt = Math.min(0.05, (agora - (ultimo || agora)) / 1000); ultimo = agora;
    var t = (agora - t0) / 1000;
    if (!VITRINE) for (var j = 0; j < 2; j++) if (t > prox[j]) { R.pescar(E, j); prox[j] = t + 2.5 + Math.random() * 2; }
    R.passo(E, dt);
    A.quadro(ctx, E, t);
    requestAnimationFrame(quadro);
  }
  addEventListener('resize', montar);
  montar(); requestAnimationFrame(quadro);
  window.GlubDebug = { pronto: true, estado: function () { return E; } };
})();
