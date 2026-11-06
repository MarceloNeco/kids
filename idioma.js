/* =====================================================================
   idioma.js — inglês só com o interruptor "ingles" do RootifyONE (dono, 06/Nov/2026: por enquanto só português).
   Carregar logo depois do recursos.js, na estante e em todo jogo:
     <script src="../recursos.js" data-app="kids"></script>
     <script src="../idioma.js"></script>
   - Interruptor desligado ou sem arquivo publicado (o padrão) = <html class="sem-ingles">: some tudo que tem
     class="en" e o botão de idioma dos jogos (#btLingua); cada jogo pergunta BolinhoIdioma.ingles() e fica em português.
   - Interruptor ligado = a classe sai e tudo volta a ser como antes (português e inglês).
   - BolinhoIdioma.ingles() → true só com o interruptor ligado.
     BolinhoIdioma.aoMudar(function (ingles) { … }) → o arquivo do RootifyONE chegou e mudou o interruptor.
   - Jogo aberto em inglês quando o interruptor é desligado: toca no próprio botão de idioma (volta ao português).
   Os textos em inglês continuam no código e nos dados: só ficam escondidos.
   ===================================================================== */
(function (raiz) {
  'use strict';
  if (raiz.BolinhoIdioma) return;
  var d = document, R = raiz.SolverRecursos, ouvintes = [], atual = null;

  function ler() { try { return !!(R && R.ligado('ingles', false)); } catch (e) { return false; } }
  function aplicar() {
    var sim = ler(), antes = atual;
    atual = sim;
    d.documentElement.classList.toggle('sem-ingles', !sim);
    if (antes === null || antes === sim) return;
    if (!sim) { var bt = d.getElementById('btLingua'); if (bt && /^en/i.test(d.documentElement.lang || '')) bt.click(); }
    ouvintes.slice().forEach(function (fn) { try { fn(sim); } catch (e) {} });
  }

  var estilo = d.createElement('style');
  estilo.id = 'bolinho-idioma';
  estilo.textContent = '.sem-ingles .en,.sem-ingles #btLingua{display:none!important}';
  (d.head || d.documentElement).appendChild(estilo);
  aplicar();
  if (R && R.aoMudar) R.aoMudar(aplicar);

  raiz.BolinhoIdioma = {
    ingles: function () { return atual; },
    aoMudar: function (fn) { if (typeof fn === 'function') ouvintes.push(fn); }
  };
})(window);
