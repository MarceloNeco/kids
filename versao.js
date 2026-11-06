/* Versão no pé da primeira tela (06/Nov/2026, pedido do dono): uma linha bem discreta, "v0.6.8 · 06/Nov/2026",
   embaixo da tela de entrada de cada jogo. Lê a primeira entrada do versoes.json do próprio jogo (o service worker
   de cada jogo já guarda esse arquivo, então funciona sem internet). Na estante, a versão vem do atributo data-versao.
     <script src="../versao.js" data-alvo="#entrada" defer></script>
     <script src="/kids/versao.js" data-alvo="footer" data-versao="11" data-prefixo="Estante" defer></script>
   Se não achar a tela ou o arquivo, não faz nada (nunca atrapalha o jogo). */
(function () {
  'use strict';
  var eu = document.currentScript;
  if (!eu) return;
  var alvo = eu.getAttribute('data-alvo') || 'body';
  var fixa = eu.getAttribute('data-versao');
  var prefixo = eu.getAttribute('data-prefixo');
  var arquivo = new URL(eu.getAttribute('data-versoes') || 'versoes.json', location.href).href;

  function por(texto) {
    var t = document.querySelector(alvo);
    if (!t || !texto) return;
    var p = document.createElement('p');
    p.className = 'versao-rodape';
    p.textContent = texto;
    if (alvo !== 'footer' && getComputedStyle(t).position === 'static') t.style.position = 'relative';
    p.style.cssText = alvo === 'footer'
      ? 'margin:.6rem 0 0;font:500 11px/1.3 system-ui,sans-serif;opacity:.55;text-align:center'
      : 'position:absolute;left:0;right:0;bottom:calc(8px + env(safe-area-inset-bottom, 0px));margin:0;' +
        'font:500 11px/1.3 system-ui,sans-serif;color:inherit;opacity:.5;text-align:center;pointer-events:none';
    t.appendChild(p);
  }
  function quando(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  if (fixa) { quando(function () { por((prefixo ? prefixo + ' ' : '') + 'v' + fixa); }); return; }
  fetch(arquivo).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    var v = d && d.versoes && d.versoes[0];
    if (!v || !v.versao) return;
    quando(function () { por((prefixo ? prefixo + ' ' : '') + 'v' + v.versao + (v.data ? ' · ' + v.data : '')); });
  }).catch(function () { /* sem arquivo: sem linha */ });
})();
