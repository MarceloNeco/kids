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
    versão nova… 3 de 25", espera ela chegar INTEIRA e abre já nela (uma vez só). Espera enquanto o download anda
    (tablet velho com internet fraca: arquivo grande passa de 45 s). Não chegou inteira (erro, internet parada, aparelho
    sem espaço): abre a versão que está no aparelho, que continua inteira, e AVISA embaixo "Tem versão nova… abra o
    jogo de novo com internet" (dono, 22/Nov/2026: nunca ficar calado na versão velha).
  - Trava de segurança: nunca fica preso no carregando (no máximo 12 s; conferindo, 10 s; baixando a versão nova, 45 s
    sem andar ou 3 minutos no total).
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
    clearTimeout(trava);   // daqui em diante valem os prazos de baixo (nunca fica preso)
    return sw.getRegistration().then(function (reg) {
      if (!reg) return false;
      if (trocou) return true;
      return new Promise(function (ok) {
        var seguindo = false, fim = false, canal = null, parado = 0, teto = 0;
        function acabar(v) {
          if (fim) return;
          fim = true; clearTimeout(t); clearTimeout(parado); clearTimeout(teto);
          if (canal) try { canal.close(); } catch (e) {}
          ok(v);
        }
        // não chegou inteira: abre a do aparelho e avisa
        function desistir(motivo) { pendente = pendente || motivo || 'rede'; acabar(false); }
        // conferir no site leva alguns segundos no tablet velho
        var t = setTimeout(function () { acabar(trocou); }, 10000);
        function andou() { clearTimeout(parado); parado = setTimeout(function () { desistir(); }, 45000); }
        function seguir(w) {
          if (!w || seguindo) return;
          seguindo = true; clearTimeout(t);
          msg(T('Baixando a versão nova…', 'Downloading the new version…', 'Descargando la versión nueva…'));
          andou(); teto = setTimeout(function () { desistir(); }, 180000);
          // o service worker conta o andamento (sw-comum.js): enquanto anda, espera
          try {
            canal = new BroadcastChannel('bolinho-sw');
            canal.onmessage = function (ev) {
              var m = ev.data || {};
              if (m.escopo !== reg.scope) return;
              if (m.fase === 'falhou') return desistir(m.motivo);
              if (m.total) {
                andou();
                msg(T('Baixando a versão nova…', 'Downloading the new version…', 'Descargando la versión nueva…') + '\n' + m.feitos + T(' de ', ' of ', ' de ') + m.total);
              }
            };
          } catch (e) {}
          if (w.state === 'activated') return acabar(true);
          w.addEventListener('statechange', function () {
            if (w.state === 'activated') acabar(true);
            else if (w.state === 'redundant') desistir();   // não baixou inteira: fica a do aparelho
          });
        }
        if (reg.installing || reg.waiting) seguir(reg.installing || reg.waiting);
        reg.addEventListener('updatefound', function () { seguir(reg.installing); });
        // a conferência terminou: se achou versão nova, ela já está instalando (o aviso "updatefound" pode chegar depois)
        function conferiu() {
          setTimeout(function () {
            if (seguindo) return;
            if (reg.installing || reg.waiting) return seguir(reg.installing || reg.waiting);
            acabar(trocou);
          }, 50);
        }
        reg.update().then(conferiu, conferiu);
      });
    }).then(function (nova) {
      if (nova) try { sessionStorage.setItem(chave, String(agora)); } catch (e) {}
      return nova;
    }, function () { return false; });
  }

  // a versão nova não chegou inteira desta vez: aviso embaixo (não tampa o jogo), some sozinho e fecha num toque
  var pendente = '';
  function avisar() {
    if (!pendente || !d.body) return;
    var a = d.createElement('div');
    a.className = 'bc-aviso';
    a.setAttribute('role', 'status');
    a.style.cssText = 'position:fixed;left:50%;bottom:1rem;transform:translateX(-50%);z-index:2147483000;' +
      'width:max-content;max-width:calc(100% - 2rem);box-sizing:border-box;padding:.7rem 1rem;border-radius:16px;text-align:center;' +
      'background:#1a1446;border:2px solid #ffd166;color:#f3f0ff;font:600 16px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;' +
      'box-shadow:0 10px 30px rgba(0,0,0,.5);cursor:pointer';
    a.textContent = pendente === 'espaco'
      ? T('✨ Tem versão nova deste jogo, mas falta espaço no aparelho. Libere espaço e abra o jogo de novo.',
        '✨ There\'s a new version of this game, but the device is out of space. Free up some space and open the game again.',
        '✨ Hay una versión nueva de este juego, pero falta espacio en el dispositivo. Libera espacio y vuelve a abrir el juego.')
      : T('✨ Tem versão nova deste jogo, mas ela não terminou de chegar. Abra o jogo de novo com internet.',
        '✨ There\'s a new version of this game, but it didn\'t finish downloading. Open the game again with the internet on.',
        '✨ Hay una versión nueva de este juego, pero no terminó de descargarse. Vuelve a abrir el juego con internet.');
    function fechar() { if (a.parentNode) a.parentNode.removeChild(a); }
    a.addEventListener('click', fechar);
    setTimeout(fechar, 12000);
    d.body.appendChild(a);
  }

  window.addEventListener('load', function () {
    var fontes = d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve();
    Promise.race([fontes, espera(3000)]).then(quadro).then(versaoNova).then(function (nova) {
      if (nova && !mostrou) location.reload(); else { mostrar(); avisar(); }
    }, mostrar);
  });
  window.BolinhoCarregando = { mostrar: mostrar };
})();
