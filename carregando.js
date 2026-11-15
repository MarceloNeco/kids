/*
  Tela de "carregando" de todos os jogos do Bolinho de Chuva (dono, 15/Nov/2026: no tablet velho os menus apareciam
  com os botões sem os escritos; "só mostrar a tela depois que tivesse carregado").
  Cada jogo inclui, no <head>, logo depois do <link rel="manifest">:
      <script src="../carregando.js" data-fora-do-arquivo></script>
  e põe '../carregando.js' no ARQUIVOS do sw.js.
  - Na hora em que a página começa: fundo escuro, o ícone do jogo e "Carregando…" piscando (PT/EN/ES, o idioma da
    estante). O jogo fica escondido por baixo (só escondido: ele monta tudo normalmente).
  - Mostra o jogo quando a página terminou de carregar e as letras (fontes) chegaram — botões já com os escritos.
  - Com internet, antes de mostrar, confere se há versão nova do jogo (sw-comum.js). Se houver, mostra "Baixando a
    versão nova…", espera ela chegar INTEIRA e abre já nela (uma vez só). Não chegou inteira: abre a versão que
    está no aparelho, que continua inteira.
  - Trava de segurança: nunca fica preso no carregando (no máximo 12 s; baixando versão nova, 45 s).
  Escrito em JavaScript antigo (sem =>) de propósito: o tablet Fire mais velho também roda.
*/
(function () {
  'use strict';
  var d = document, h = d.documentElement;
  var l = 'pt';
  try { l = localStorage.getItem('bolinho:idioma') || 'pt'; } catch (e) {}
  function T(pt, en, es) { return l === 'en' ? en : l === 'es' ? es : pt; }
  var ico = d.querySelector('link[rel~="icon"]');
  ico = ico ? ico.href : '';
  var st = d.createElement('style');
  st.textContent = 'html.bc-carregando body{visibility:hidden!important}' +
    'html.bc-carregando::before{content:"";position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483646;background:#0b0a1f' +
    (ico ? ' url("' + ico + '") no-repeat 50% calc(50% - 46px);background-size:120px 120px' : '') + '}' +
    'html.bc-carregando::after{content:attr(data-bc-msg);position:fixed;left:0;right:0;top:calc(50% + 36px);z-index:2147483647;' +
    'padding:0 1rem;text-align:center;white-space:pre-wrap;color:#f3f0ff;font:700 20px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;' +
    'animation:bc-pisca .9s ease-in-out infinite alternate}' +
    '@keyframes bc-pisca{from{opacity:.35}to{opacity:1}}' +
    '@media (prefers-reduced-motion:reduce){html.bc-carregando::after{animation:none}}';
  (d.head || h).appendChild(st);
  function msg(t) { h.setAttribute('data-bc-msg', t); }
  msg(T('Carregando…', 'Loading…', 'Cargando…'));
  h.classList.add('bc-carregando');

  var mostrou = false, trava = setTimeout(mostrar, 12000);
  // a versão nova pode chegar inteira antes de a página terminar de abrir (jogo pequeno, internet boa): o service worker
  // novo assume esta página ("controllerchange") — então ela foi aberta pela versão anterior e precisa abrir de novo
  var trocou = false;
  try { if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.addEventListener('controllerchange', function () { trocou = true; }); } catch (e) {}
  function mostrar() {
    if (mostrou) return;
    mostrou = true; clearTimeout(trava);
    h.classList.remove('bc-carregando'); h.removeAttribute('data-bc-msg');
  }
  function espera(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }
  function quadro() { return new Promise(function (ok) { requestAnimationFrame(function () { requestAnimationFrame(ok); }); }); }

  // versão nova no site? (só quando o jogo já está guardado no aparelho e há internet)
  function versaoNova() {
    var sw = navigator.serviceWorker;
    if (!sw || !sw.controller || navigator.onLine === false || !sw.getRegistration) return Promise.resolve(false);
    var chave = 'bc-recarregou:' + location.pathname, agora = Date.now();
    try { if (agora - (+sessionStorage.getItem(chave) || 0) < 60000) return Promise.resolve(false); } catch (e) {}   // já abriu na nova agora há pouco
    return sw.getRegistration().then(function (reg) {
      if (!reg) return false;
      if (trocou) return true;
      return new Promise(function (ok) {
        var t = setTimeout(function () { ok(false); }, 3000), seguindo = false;
        function seguir(w) {
          if (!w || seguindo) return;
          seguindo = true; clearTimeout(t); clearTimeout(trava);
          msg(T('Baixando a versão nova…', 'Downloading the new version…', 'Descargando la versión nueva…'));
          t = setTimeout(function () { ok(false); }, 45000);
          if (w.state === 'activated') { clearTimeout(t); return ok(true); }
          w.addEventListener('statechange', function () {
            if (w.state === 'activated') { clearTimeout(t); ok(true); }
            else if (w.state === 'redundant') { clearTimeout(t); ok(false); }   // não baixou inteira: fica a do aparelho
          });
        }
        if (reg.installing || reg.waiting) seguir(reg.installing || reg.waiting);
        reg.addEventListener('updatefound', function () { seguir(reg.installing); });
        // a conferência terminou: se achou versão nova, ela já está instalando (o aviso "updatefound" pode chegar depois)
        function conferiu() {
          setTimeout(function () {
            if (seguindo) return;
            if (reg.installing || reg.waiting) return seguir(reg.installing || reg.waiting);
            clearTimeout(t); ok(trocou);
          }, 50);
        }
        reg.update().then(conferiu, conferiu);
      });
    }).then(function (nova) {
      if (nova) try { sessionStorage.setItem(chave, String(agora)); } catch (e) {}
      return nova;
    }, function () { return false; });
  }

  window.addEventListener('load', function () {
    var fontes = d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve();
    Promise.race([fontes, espera(3000)]).then(quadro).then(versaoNova).then(function (nova) {
      if (nova && !mostrou) location.reload(); else mostrar();
    }, mostrar);
  });
  window.BolinhoCarregando = { mostrar: mostrar };
})();
