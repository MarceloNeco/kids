/* =====================================================================
   idioma.js — o idioma do Bolinho de Chuva: Português, English e Español (dono, 14/Nov/2026).
   A escolha é feita UMA vez, na estante (bandeira + sigla: 🇧🇷 PT · 🇺🇸 EN · 🇪🇸 ES; a bandeira é SVG embutido), e vale para todos os jogos: fica guardada no
   aparelho (localStorage "bolinho:idioma") e cada jogo lê daqui ao abrir. Os jogos não têm botão de idioma próprio
   (o #btLingua de cada jogo fica sempre escondido). Sem escolha feita: o idioma do aparelho, se for um dos três;
   se não, português. Também aceita ?idioma=pt|en|es no endereço (guarda a escolha).
   Carregar logo depois do recursos.js, na estante e em todo jogo:
     <script src="../recursos.js" data-app="kids"></script>
     <script src="../idioma.js"></script>
   O que faz na página:
     - <html lang="pt-BR|en-US|es-ES"> e a classe idioma-pt / idioma-en / idioma-es no <html>.
     - Pedaços marcados com class="pt", class="en" ou class="es" só aparecem no idioma escolhido.
     - Onde houver <div data-idiomas></div>, monta os três botões com bandeira (a estante usa).
   PT = português do Brasil · EN = inglês dos Estados Unidos · ES = espanhol da Espanha (diretriz de 14/Nov/2026).
   Para os jogos:
     BolinhoIdioma.atual()               → 'pt' | 'en' | 'es'
     BolinhoIdioma.t(pt, en, es)         → o texto do idioma escolhido (sem o espanhol, cai no português).
                                           Também aceita um objeto: t({ pt: '…', en: '…', es: '…' }).
     BolinhoIdioma.voz()                 → 'pt-BR' | 'en-US' | 'es-ES' (para a fala, SpeechSynthesisUtterance.lang)
     BolinhoIdioma.escolher('en')        → troca, guarda e avisa
     BolinhoIdioma.aoMudar(function (codigo) { … })  → trocaram o idioma (nesta página ou noutra aba)
     BolinhoIdioma.ingles()              → atual() === 'en' (compatibilidade com o código antigo)
   ===================================================================== */
(function (raiz) {
  'use strict';
  if (raiz.BolinhoIdioma) return;
  var d = document, CHAVE = 'bolinho:idioma', ouvintes = [];
  // bandeira desenhada (SVG embutido): o emoji de bandeira não aparece no Windows nem em todo Android (diretriz)
  var BR = '<svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#009c3b"/>' +
    '<path d="M15 2.2 27.4 10 15 17.8 2.6 10z" fill="#ffdf00"/><circle cx="15" cy="10" r="4.6" fill="#002776"/>' +
    '<path d="M10.6 9.2c3-.9 6.3-.6 8.9.9" stroke="#fff" stroke-width=".9" fill="none"/></svg>';
  var US = '<svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#fff"/>' +
    '<path d="M0 0h30v1.54H0zm0 3.08h30v1.54H0zm0 3.08h30v1.54H0zm0 3.08h30v1.54H0zm0 3.08h30v1.54H0zm0 3.08h30v1.54H0zm0 3.08h30v1.54H0z" fill="#b22234"/>' +
    '<rect width="13" height="10.77" fill="#3c3b6e"/>' +
    '<g fill="#fff"><circle cx="2.2" cy="2" r=".7"/><circle cx="6.5" cy="2" r=".7"/><circle cx="10.8" cy="2" r=".7"/>' +
    '<circle cx="4.3" cy="4.4" r=".7"/><circle cx="8.6" cy="4.4" r=".7"/><circle cx="2.2" cy="6.8" r=".7"/>' +
    '<circle cx="6.5" cy="6.8" r=".7"/><circle cx="10.8" cy="6.8" r=".7"/><circle cx="4.3" cy="9.1" r=".7"/><circle cx="8.6" cy="9.1" r=".7"/></g></svg>';
  var ES = '<svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#aa151b"/>' +
    '<rect y="5" width="30" height="10" fill="#f1bf00"/></svg>';
  var LISTA = [
    { codigo: 'pt', sigla: 'PT', bandeira: BR, nome: 'Português', lang: 'pt-BR', voz: 'pt-BR' },
    { codigo: 'en', sigla: 'EN', bandeira: US, nome: 'English', lang: 'en-US', voz: 'en-US' },
    { codigo: 'es', sigla: 'ES', bandeira: ES, nome: 'Español', lang: 'es-ES', voz: 'es-ES' }
  ];
  function valido(c) { return c === 'pt' || c === 'en' || c === 'es'; }
  function info(c) { for (var i = 0; i < LISTA.length; i++) if (LISTA[i].codigo === c) return LISTA[i]; return LISTA[0]; }
  function guardar(c) { try { raiz.localStorage.setItem(CHAVE, c); } catch (e) {} }
  function inicial() {
    var q = null;
    try { q = new URLSearchParams(raiz.location.search).get('idioma'); } catch (e) {}
    if (valido(q)) { guardar(q); return q; }
    try { var s = raiz.localStorage.getItem(CHAVE); if (valido(s)) return s; } catch (e2) {}
    var a = String((raiz.navigator && raiz.navigator.language) || 'pt').slice(0, 2).toLowerCase();
    return valido(a) ? a : 'pt';
  }
  var atual = inicial();

  var estilo = d.createElement('style');
  estilo.id = 'bolinho-idioma';
  estilo.textContent =
    '#btLingua{display:none!important}' +
    'html.idioma-pt .en,html.idioma-pt .es,html.idioma-en .pt,html.idioma-en .es,html.idioma-es .pt,html.idioma-es .en{display:none!important}' +
    '.bolinho-idiomas{display:inline-flex;gap:.35rem;flex-wrap:wrap}' +
    '.bolinho-idiomas button{display:inline-flex;align-items:center;gap:.35rem;min-height:44px;min-width:64px;padding:.35rem .8rem;' +
    'border-radius:999px;border:1px solid #3a2f73;background:rgba(34,27,77,.8);color:#f3f0ff;font:inherit;font-weight:800;' +
    'font-size:.95rem;letter-spacing:.04em;cursor:pointer}' +
    '.bolinho-idiomas button .bd{display:inline-flex;line-height:0}.bolinho-idiomas button .bd svg{width:26px;height:auto;border-radius:3px;box-shadow:0 0 0 1px rgba(255,255,255,.35)}' +
    '.bolinho-idiomas button[aria-pressed="true"]{background:#c6ff3d;color:#1a1446;border-color:#c6ff3d}' +
    '.bolinho-idiomas button:focus-visible{outline:3px solid #ffd166;outline-offset:2px}';
  (d.head || d.documentElement).appendChild(estilo);

  function aplicar() {
    var h = d.documentElement;
    h.lang = info(atual).lang;
    h.classList.remove('idioma-pt', 'idioma-en', 'idioma-es', 'sem-ingles');
    h.classList.add('idioma-' + atual);
    var bts = d.querySelectorAll('.bolinho-idiomas button');
    for (var i = 0; i < bts.length; i++) bts[i].setAttribute('aria-pressed', String(bts[i].getAttribute('data-idioma') === atual));
  }
  function avisar() { ouvintes.slice().forEach(function (fn) { try { fn(atual); } catch (e) {} }); }
  function escolher(c, semGuardar) {
    if (!valido(c)) return;
    if (!semGuardar) guardar(c);
    if (c === atual) return;
    atual = c;
    aplicar();
    avisar();
  }

  // os três botões (🇧🇷 PT · 🇺🇸 EN · 🇪🇸 ES) onde a página pedir: <div data-idiomas></div>
  function montarBotoes() {
    var alvos = d.querySelectorAll('[data-idiomas]');
    for (var i = 0; i < alvos.length; i++) {
      var alvo = alvos[i];
      if (alvo.getAttribute('data-idiomas-montado')) continue;
      alvo.setAttribute('data-idiomas-montado', '1');
      alvo.classList.add('bolinho-idiomas');
      alvo.setAttribute('role', 'group');
      alvo.setAttribute('aria-label', 'Idioma · Language · Idioma');
      LISTA.forEach(function (l) {
        var b = d.createElement('button');
        b.type = 'button';
        b.setAttribute('data-idioma', l.codigo);
        b.setAttribute('lang', l.lang);
        b.setAttribute('aria-label', l.nome);
        b.title = l.nome;
        b.innerHTML = '<span class="bd">' + l.bandeira + '</span>' + l.sigla;
        b.addEventListener('click', function () { escolher(l.codigo); });
        alvo.appendChild(b);
      });
    }
    aplicar();
  }

  aplicar();
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', montarBotoes); else montarBotoes();
  // escolheram noutra aba (a estante aberta junto com um jogo)
  raiz.addEventListener('storage', function (e) { if (e.key === CHAVE && valido(e.newValue)) escolher(e.newValue, true); });

  raiz.BolinhoIdioma = {
    lista: LISTA.slice(),
    atual: function () { return atual; },
    t: function (pt, en, es) {
      if (pt && typeof pt === 'object') { var o = pt; pt = o.pt; en = o.en; es = o.es; }
      if (atual === 'en') return en != null ? en : pt;
      if (atual === 'es') return es != null ? es : pt;
      return pt;
    },
    voz: function () { return info(atual).voz; },
    escolher: function (c) { escolher(c); },
    aoMudar: function (fn) { if (typeof fn === 'function') ouvintes.push(fn); },
    ingles: function () { return atual === 'en'; },
    montarBotoes: montarBotoes
  };
})(window);
