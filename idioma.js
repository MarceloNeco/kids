/* =====================================================================
   idioma.js — o idioma do Bolinho de Chuva: Português, English e Español (dono, 14/Nov/2026).
   A escolha é feita UMA vez, na estante (bandeira + sigla: 🇧🇷 PT · 🇺🇸 EN · 🇪🇸 ES; a bandeira é um SVG da pasta bandeiras/), e vale para todos os jogos: fica guardada no
   aparelho (localStorage "bolinho:idioma") e cada jogo lê daqui ao abrir. Os jogos não têm botão de idioma próprio
   (o #btLingua de cada jogo fica sempre escondido). Sem escolha feita: o idioma do aparelho, se for um dos três;
   se não, português. Também aceita ?idioma=pt|en|es no endereço (guarda a escolha).
   Carregar logo depois do recursos.js, na estante e em todo jogo:
     <script src="../recursos.js" data-app="kids"></script>
     <script src="../idioma.js"></script>
   O que faz na página:
     - <html lang="pt-BR|en-US|es-ES"> e a classe idioma-pt / idioma-en / idioma-es no <html>.
     - Pedaços marcados com class="pt", class="en" ou class="es" só aparecem no idioma escolhido.
     - Onde houver <div data-idiomas></div>, monta UM botão com o idioma atual (bandeira + sigla); tocando, pergunta se
       continua nele ou troca, com as três opções (a estante usa).
   PT = português do Brasil · EN = inglês dos Estados Unidos · ES = espanhol da Espanha (diretriz de 14/Nov/2026).
   Para os jogos:
     BolinhoIdioma.atual()               → 'pt' | 'en' | 'es'
     BolinhoIdioma.t(pt, en, es)         → o texto do idioma escolhido (sem o espanhol, cai no português).
                                           Também aceita um objeto: t({ pt: '…', en: '…', es: '…' }).
     BolinhoIdioma.voz()                 → 'pt-BR' | 'en-US' | 'es-ES' (para a fala, SpeechSynthesisUtterance.lang)
     BolinhoIdioma.marca()               → 'Bolinho de Chuva' | 'Rainy Day Donuts' | 'Buñuelos de Lluvia'
     BolinhoIdioma.escolher('en')        → troca, guarda e avisa
     BolinhoIdioma.aoMudar(function (codigo) { … })  → trocaram o idioma (nesta página ou noutra aba)
     BolinhoIdioma.ingles()              → atual() === 'en' (compatibilidade com o código antigo)
   ===================================================================== */
(function (raiz) {
  'use strict';
  if (raiz.BolinhoIdioma) return;
  var d = document, CHAVE = 'bolinho:idioma', ouvintes = [];
  // bandeiras em arquivo SVG (pasta bandeiras/, flag-icons, MIT): o emoji de bandeira não aparece no Windows nem em
  // todo Android (diretriz). O endereço sai de onde este arquivo está, então vale na estante e em qualquer jogo.
  var PASTA = (function () { try { return new URL('bandeiras/', d.currentScript && d.currentScript.src ? d.currentScript.src : raiz.location.href).href; } catch (e) { return '/kids/bandeiras/'; } })();
  function img(arq) { return '<img src="' + PASTA + arq + '" width="26" height="20" alt="" decoding="async">'; }
  var BR = img('br.svg'), US = img('us.svg'), ES = img('es.svg');
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
    '.bolinho-idiomas{position:relative;display:inline-flex}' +
    '.bolinho-idiomas .bi-atual,.bolinho-idiomas .bi-op{display:inline-flex;align-items:center;gap:.45rem;min-height:44px;padding:.35rem .8rem;' +
    'border-radius:999px;border:1px solid #3a2f73;background:rgba(34,27,77,.8);color:#f3f0ff;font:inherit;font-weight:800;' +
    'font-size:.95rem;letter-spacing:.03em;cursor:pointer}' +
    '.bolinho-idiomas .bi-atual .seta{font-size:.75em;opacity:.8}' +
    '.bolinho-idiomas .bd{display:inline-flex;line-height:0}.bolinho-idiomas .bd img{display:block;width:26px;height:20px;object-fit:cover;border-radius:3px;box-shadow:0 0 0 1px rgba(255,255,255,.35)}' +
    '.bolinho-idiomas .bi-menu{position:fixed;left:12px;top:12px;z-index:2147483001;width:min(18.5rem,calc(100vw - 24px));box-sizing:border-box;padding:.6rem;border-radius:18px;' +
    'background:#1a1446;border:1px solid #3a2f73;box-shadow:0 12px 30px rgba(0,0,0,.5);display:grid;gap:.4rem}' +
    '.bolinho-idiomas .bi-menu[hidden]{display:none}' +
    '.bolinho-idiomas .bi-menu p{margin:.1rem .3rem .3rem;color:#b3acd6;font-size:.9rem;font-weight:600}' +
    '.bolinho-idiomas .bi-op{width:100%;justify-content:flex-start;border-radius:14px;font-weight:700;letter-spacing:0}' +
    '.bolinho-idiomas .bi-op .nm{flex:1;min-width:0;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bolinho-idiomas .bi-op .ok{white-space:nowrap;font-size:.85em}' +
    '.bolinho-idiomas .bi-op[aria-checked="true"]{background:#c6ff3d;color:#1a1446;border-color:#c6ff3d}' +
    '.bolinho-idiomas button:focus-visible{outline:3px solid #ffd166;outline-offset:2px}';
  (d.head || d.documentElement).appendChild(estilo);

  function aplicar() {
    var h = d.documentElement;
    h.lang = info(atual).lang;
    h.classList.remove('idioma-pt', 'idioma-en', 'idioma-es', 'sem-ingles');
    h.classList.add('idioma-' + atual);
    var grupos = d.querySelectorAll('.bolinho-idiomas');
    for (var i = 0; i < grupos.length; i++) pintar(grupos[i]);
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

  // UM botão com o idioma atual (bandeira + sigla). Tocando, abre a pergunta: continuar no idioma atual ou trocar
  // (dono, 14/Nov/2026). Onde a página pedir: <div data-idiomas></div>
  function T(pt, en, es) { return atual === 'en' ? en : atual === 'es' ? es : pt; }
  function pintar(g) {
    var l = info(atual), bt = g.querySelector('.bi-atual');
    if (!bt) return;
    bt.innerHTML = '<span class="bd">' + l.bandeira + '</span>' + l.sigla + '<span class="seta" aria-hidden="true">▾</span>';
    bt.setAttribute('aria-label', T('Idioma: ', 'Language: ', 'Idioma: ') + l.nome + T(' (trocar)', ' (change)', ' (cambiar)'));
    bt.title = bt.getAttribute('aria-label');
    g.querySelector('.bi-menu p').textContent = T('Idioma: continuar em português ou trocar?', 'Language: keep English or change?', 'Idioma: ¿seguir en español o cambiar?');
    var ops = g.querySelectorAll('.bi-op');
    for (var k = 0; k < ops.length; k++) {
      var c = ops[k].getAttribute('data-idioma'), atualEste = c === atual;
      ops[k].setAttribute('aria-checked', String(atualEste));
      ops[k].querySelector('.ok').textContent = atualEste ? T('✓ continuar', '✓ keep', '✓ seguir') : '';
    }
  }
  // a caixinha das opções sempre inteira dentro da tela, onde quer que o botão esteja (dono, 14/Nov/2026: no celular ela
  // abria para fora da tela): logo abaixo do botão, alinhada a ele e empurrada para dentro pelas bordas
  function posicionar(bt, m) {
    var r = bt.getBoundingClientRect(), W = raiz.innerWidth, H = raiz.innerHeight, w = m.offsetWidth, h = m.offsetHeight, folga = 12;
    var x = r.right - w;                                   // alinhada pela direita do botão…
    if (r.left + w <= W - folga && r.left < W / 2) x = r.left;   // …ou pela esquerda, se o botão está à esquerda
    x = Math.max(folga, Math.min(x, W - w - folga));
    var y = r.bottom + 6;
    if (y + h > H - folga && r.top - 6 - h >= folga) y = r.top - 6 - h;   // sem espaço embaixo: abre para cima
    y = Math.max(folga, Math.min(y, H - h - folga));
    m.style.left = Math.round(x) + 'px'; m.style.top = Math.round(y) + 'px';
  }
  raiz.addEventListener('resize', function () { fecharMenus(false); });
  raiz.addEventListener('scroll', function () { fecharMenus(false); }, true);
  function fecharMenus(foco) {
    var gs = d.querySelectorAll('.bolinho-idiomas');
    for (var i = 0; i < gs.length; i++) {
      var m = gs[i].querySelector('.bi-menu'), bt = gs[i].querySelector('.bi-atual');
      if (m && !m.hidden) { m.hidden = true; bt.setAttribute('aria-expanded', 'false'); if (foco) bt.focus(); }
    }
  }
  function montarBotoes() {
    var alvos = d.querySelectorAll('[data-idiomas]');
    for (var i = 0; i < alvos.length; i++) {
      var alvo = alvos[i];
      if (alvo.getAttribute('data-idiomas-montado')) continue;
      alvo.setAttribute('data-idiomas-montado', '1');
      alvo.classList.add('bolinho-idiomas');
      var bt = d.createElement('button');
      bt.type = 'button'; bt.className = 'bi-atual';
      bt.setAttribute('aria-haspopup', 'true'); bt.setAttribute('aria-expanded', 'false');
      var menu = d.createElement('div');
      menu.className = 'bi-menu'; menu.hidden = true; menu.setAttribute('role', 'radiogroup');
      menu.appendChild(d.createElement('p'));
      LISTA.forEach(function (l) {
        var o = d.createElement('button');
        o.type = 'button'; o.className = 'bi-op'; o.setAttribute('role', 'radio');
        o.setAttribute('data-idioma', l.codigo); o.setAttribute('lang', l.lang);
        o.innerHTML = '<span class="bd">' + l.bandeira + '</span><span class="nm">' + l.sigla + ' · ' + l.nome + '</span><span class="ok"></span>';
        o.addEventListener('click', function () { escolher(l.codigo); fecharMenus(true); });
        menu.appendChild(o);
      });
      bt.addEventListener('click', function (e) {
        var m = e.currentTarget.parentNode.querySelector('.bi-menu'), abrir = m.hidden;
        fecharMenus(false);
        if (abrir) { m.hidden = false; e.currentTarget.setAttribute('aria-expanded', 'true'); posicionar(e.currentTarget, m); var c = m.querySelector('[aria-checked="true"]'); if (c) c.focus(); }
      });
      alvo.appendChild(bt); alvo.appendChild(menu);
    }
    aplicar();
  }
  d.addEventListener('click', function (e) { if (!(e.target.closest && e.target.closest('.bolinho-idiomas'))) fecharMenus(false); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharMenus(true); });

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
    // nome da marca em cada idioma (dono, 14/Nov/2026): Bolinho de Chuva · Rainy Day Donuts · Buñuelos de Lluvia
    marca: function () { return atual === 'en' ? 'Rainy Day Donuts' : atual === 'es' ? 'Buñuelos de Lluvia' : 'Bolinho de Chuva'; },
    escolher: function (c) { escolher(c); },
    aoMudar: function (fn) { if (typeof fn === 'function') ouvintes.push(fn); },
    ingles: function () { return atual === 'en'; },
    montarBotoes: montarBotoes
  };
})(window);
