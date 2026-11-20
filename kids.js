/* Controle remoto da TV — estante do Bolinho de Chuva (solverone.com.br/kids).
   Numa TV de verdade (sem toque, ou com nome de TV no navegador), as setas passam o foco entre os botões "Jogar"
   dos cartões, OK (Enter) abre, e o jogo abre já no "papel de TV" (?tv=auto, que o cartão guarda em data-tv).
   No celular e no tablet (ex.: Amazon Fire), nada disso atrapalha: abre no jeito normal, por toque.
   ?debug mostra na tela cada tecla recebida (para diagnosticar numa TV de verdade). */
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card .c-jogar'));
  if (!cards.length) return;
  var toque = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
  var tv = /AFT|SMART-?TV|SmartTV|Tizen|Web0S|webOS|NetCast|BRAVIA|Android TV|GoogleTV|CrKey|HbbTV|AppleTV|Roku|Viera|Philips|Hisense|VIDAA/i.test(navigator.userAgent || '');
  // TV de verdade = tem nome de TV no navegador, ou não tem toque. Aí os jogos abrem já como TV.
  if (tv || !toque) cards.forEach(function (c) {
    var p = c.closest('.card').getAttribute('data-tv');
    if (p && c.href) c.href = c.href + (c.href.indexOf('?') < 0 ? p : p.replace('?', '&'));
  });

  var i = Math.max(0, cards.indexOf(document.activeElement)), ultimo = 0, ultimaTecla = '';
  var debug = /[?&]debug\b/.test(location.search), painel = null;
  if (debug) { painel = document.createElement('pre'); painel.id = 'debug'; painel.textContent = 'DIAGNÓSTICO: aperte as setas e OK no controle…\n'; document.body.appendChild(painel); }
  function log(e) { if (!painel) return; var ae = document.activeElement; painel.textContent += e.type + '  key=' + JSON.stringify(e.key) + '  code=' + JSON.stringify(e.code) + '  keyCode=' + e.keyCode + '  foco=' + (ae && (ae.id || ae.tagName)) + '\n'; var linhas = painel.textContent.split('\n'); if (linhas.length > 10) painel.textContent = linhas.slice(-10).join('\n'); }
  // depois do último cartão, o 📺 Clipe da rádio (radio.js monta o botão depois deste arquivo)
  function todos() { var b = document.querySelector('.radio .r-clipe'); return b ? cards.concat([b]) : cards; }
  function foco(n, parado) { var l = todos(); i = (n + l.length) % l.length; try { l[i].focus({ preventScroll: !!parado }); } catch (e) { l[i].focus(); } cards.forEach(function (c, k) { c.closest('.card').classList.toggle('sel', k === i); }); }

  // Só assume o controle (foco inicial, navegação por setas) numa TV de verdade. No celular/tablet,
  // deixa o toque normal — senão um cartão fica "sedado" com borda de foco sem ninguém ter mexido.
  if (!(tv || !toque)) return;
  document.body.tabIndex = -1;
  foco(0, true); setTimeout(function () { if (document.activeElement !== cards[i]) foco(i, true); }, 300);
  window.addEventListener('load', function () { foco(i, true); });
  function tecla(e) {
    log(e);
    if (document.body.classList.contains('bc-modal') || document.body.classList.contains('clipe-aberto')) return;   // o telão do clipe cuida das teclas dele
    var k = e.key || '', c = e.keyCode || e.which || 0, agora = Date.now();
    var dir = (k === 'ArrowRight' || k === 'Right' || c === 39) ? 1 : (k === 'ArrowDown' || k === 'Down' || c === 40) ? 1 : (k === 'ArrowLeft' || k === 'Left' || c === 37) ? -1 : (k === 'ArrowUp' || k === 'Up' || c === 38) ? -1 : 0;
    var ok = k === 'Enter' || k === 'OK' || k === ' ' || c === 13 || c === 32;
    if (!dir && !ok) return;
    var ae = document.activeElement;
    if (ok && ae && ae.className && String(ae.className).indexOf('bc-') === 0) return; // OK no botão de instalar: é dele
    var assinatura = (dir || 'ok');
    if (agora - ultimo < 350 && ultimaTecla === assinatura) { e.preventDefault(); return; }
    ultimo = agora; ultimaTecla = assinatura;
    e.preventDefault();
    if (dir) foco(i + dir); else { var alvo = todos()[i]; if (alvo.href && alvo.href.indexOf('#') < 0) location.href = alvo.href; else alvo.click(); }
  }
  ['keydown', 'keypress', 'keyup'].forEach(function (t) { window.addEventListener(t, tecla, true); });
  cards.forEach(function (c, n) { c.addEventListener('focus', function () { i = n; }); c.addEventListener('mouseenter', function () { i = n; }); });
  var dica = document.getElementById('dicaCursor');
  document.addEventListener('cursorStateChange', function (e) { if (dica) dica.style.display = (e.detail && e.detail.visibility) ? 'block' : 'none'; }, false);
})();
