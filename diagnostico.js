/* Diagnóstico do Bolinho de Chuva (dono, 20/Nov/2026: "no tablet Fire antigo o GLUB GLUB não carrega").
   Mostra, no próprio aparelho: espaço usado e livre, memória, núcleos, navegador, e cada jogo guardado (service worker +
   gavetas com a versão no nome). "Consertar" apaga o service worker e as gavetas daquele jogo: a próxima abertura, com
   internet, baixa a versão nova inteira do zero. Não apaga estrelas, recordes nem preferências (ficam no localStorage). */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var l = window.BolinhoIdioma ? BolinhoIdioma.atual() : 'pt';
  function T(pt, en, es) { return l === 'en' ? en : l === 'es' ? es : pt; }
  var IDX = { pt: 0, en: 1, es: 2 };
  document.querySelectorAll('[data-t]').forEach(function (el) { var p = el.getAttribute('data-t').split('|'); el.textContent = p[IDX[l]] || p[0]; });
  function mb(b) { return (b / 1048576).toFixed(1) + ' MB'; }
  function linha(pai, nome, det, botao) {
    var d = document.createElement('div'); d.className = 'linha';
    var n = document.createElement('span'); n.className = 'nome'; n.textContent = nome; d.appendChild(n);
    var t = document.createElement('span'); t.className = 'det'; t.textContent = det; d.appendChild(t);
    if (botao) d.appendChild(botao);
    pai.appendChild(d); return d;
  }
  var nv = navigator, ap = $('aparelho');
  linha(ap, T('Navegador', 'Browser', 'Navegador'), nv.userAgent);
  linha(ap, T('Memória / núcleos', 'Memory / cores', 'Memoria / núcleos'), (nv.deviceMemory ? nv.deviceMemory + ' GB' : '?') + ' / ' + (nv.hardwareConcurrency || '?'));
  linha(ap, T('Internet', 'Internet', 'Internet'), nv.onLine === false ? T('sem internet', 'offline', 'sin internet') : T('com internet', 'online', 'con internet'));
  var espaco = linha(ap, T('Espaço', 'Storage', 'Espacio'), '…');
  if (nv.storage && nv.storage.estimate) nv.storage.estimate().then(function (e) {
    var livre = e.quota - e.usage;
    espaco.lastChild.textContent = T('usado ', 'used ', 'usado ') + mb(e.usage) + T(' de ', ' of ', ' de ') + mb(e.quota) + ' · ' + T('livre ', 'free ', 'libre ') + mb(livre);
    espaco.lastChild.className = 'det ' + (livre < 50 * 1048576 ? 'ruim' : 'ok');
  }); else espaco.lastChild.textContent = '?';

  // gaveta → jogo: o nome começa pelo prefixo do jogo ("glub-glub-v0.1.6-…"); a da estante é "dgo-…"
  function pastaDe(escopo) { var m = escopo.match(/\/kids\/([^/]+)\/$/); return m ? m[1] : null; }
  function consertar(reg, pasta, botao) {
    botao.disabled = true; botao.textContent = '…';
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k.indexOf(pasta + '-') === 0; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return reg.unregister(); }).then(function () {
      botao.textContent = T('✓ Pronto: abra o jogo', '✓ Done: open the game', '✓ Listo: abre el juego');
      var a = document.createElement('a'); a.href = '/kids/' + pasta + '/'; a.textContent = ' ▶ ' + pasta; botao.parentNode.appendChild(a);
    }).catch(function (e) { botao.textContent = '✗ ' + e; });
  }
  var lista = $('jogos');
  if (!nv.serviceWorker || !nv.serviceWorker.getRegistrations) { lista.textContent = T('Este navegador não guarda jogos.', 'This browser does not save games.', 'Este navegador no guarda juegos.'); return; }
  Promise.all([nv.serviceWorker.getRegistrations(), window.caches ? caches.keys() : Promise.resolve([])]).then(function (r) {
    var regs = r[0], ks = r[1];
    if (!regs.length) lista.textContent = T('Nenhum jogo guardado.', 'No saved games.', 'Ningún juego guardado.');
    regs.sort(function (a, b) { return a.scope < b.scope ? -1 : 1; }).forEach(function (reg) {
      var pasta = pastaDe(reg.scope), gav = ks.filter(function (k) { return pasta ? k.indexOf(pasta + '-') === 0 : k.indexOf('dgo-') === 0; });
      var estado = (reg.active ? '✓' : '—') + (reg.installing ? T(' · baixando versão nova', ' · downloading new version', ' · descargando versión nueva') : '') + (reg.waiting ? T(' · nova esperando', ' · new one waiting', ' · nueva esperando') : '');
      var b = null;
      if (pasta) { b = document.createElement('button'); b.type = 'button'; b.textContent = T('🔧 Consertar', '🔧 Fix', '🔧 Arreglar'); b.addEventListener('click', function () { consertar(reg, pasta, b); }); }
      linha(lista, pasta || T('estante', 'shelf', 'estantería'), estado + ' · ' + (gav.join(', ') || T('sem gaveta', 'no cache', 'sin caché')), b);
    });
  });
  $('btTudo').addEventListener('click', function () {
    if (!confirm(T('Apagar todos os jogos guardados neste aparelho?', 'Delete all saved games on this device?', '¿Borrar todos los juegos guardados en este dispositivo?'))) return;
    var bt = $('btTudo'); bt.disabled = true;
    Promise.all([nv.serviceWorker.getRegistrations(), caches.keys()]).then(function (r) {
      return Promise.all(r[1].filter(function (k) { return k !== 'bolinho-musicas'; }).map(function (k) { return caches.delete(k); }).concat(r[0].map(function (g) { return g.unregister(); })));
    }).then(function () {
      try { localStorage.removeItem('bolinho:guardar-todos'); } catch (e) {}
      bt.textContent = T('✓ Pronto! Abra o Bolinho com internet.', '✓ Done! Open Bolinho with internet.', '✓ ¡Listo! Abre Bolinho con internet.');
    });
  });
})();
