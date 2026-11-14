/* 🎵 Biblioteca de músicas da estante (pedido do dono, 14/Nov/2026): todas as músicas gravadas dos jogos e da rádio,
   com nome, autor e licença, para ouvir uma por uma. A lista vem de biblioteca-musicas.js (gerado por
   ferramentas/biblioteca-musicas.js a partir do que cada jogo toca). Abre pelo botão #btBiblioteca da estante.
   - Toca uma música por vez; ao tocar, pausa a rádio da estante.
   - Fecha no ✕, no Esc e no Voltar do celular (entrada no histórico ao abrir).
   - Textos em PT/EN/ES pelo idioma.js; os nomes das músicas ficam como o autor publicou.
   - Sem internet, a música que não estiver guardada no aparelho avisa "precisa de internet". */
(function () {
  'use strict';
  var d = document, bt = d.getElementById('btBiblioteca');
  if (!bt || !window.BolinhoBiblioteca) return;
  function T(pt, en, es) { return window.BolinhoIdioma ? BolinhoIdioma.t(pt, en, es) : pt; }
  function lingua() { return window.BolinhoIdioma ? BolinhoIdioma.atual() : 'pt'; }

  var css = d.createElement('style');
  css.textContent =
    '.bib{position:fixed;inset:0;z-index:30;background:#0b0a1f;color:#f3f0ff;overflow-y:auto;-webkit-overflow-scrolling:touch;' +
    'padding:calc(env(safe-area-inset-top,0px) + 1rem) 1rem calc(env(safe-area-inset-bottom,0px) + 6rem)}' +
    '.bib[hidden]{display:none}' +
    '.bib-c{max-width:46rem;margin:0 auto}' +
    '.bib-topo{position:sticky;top:-1rem;display:flex;align-items:center;gap:.6rem;padding:.6rem 0;background:#0b0a1f;z-index:1}' +
    '.bib-topo h2{flex:1;margin:0;font-size:1.35rem}' +
    '.bib-x{min-width:48px;min-height:48px;border-radius:999px;border:1px solid #3a2f73;background:#221b4d;color:#f3f0ff;font-size:1.3rem;cursor:pointer}' +
    '.bib-sub{color:#b3acd6;margin:.2rem 0 1rem;line-height:1.4}' +
    '.bib h3{display:flex;align-items:center;gap:.5rem;margin:1.4rem 0 .5rem;font-size:1.1rem}' +
    '.bib h3 img{width:1.6rem;height:1.6rem;border-radius:.35rem}' +
    '.bib h3 small{color:#b3acd6;font-weight:500}' +
    '.bib ol{list-style:none;margin:0;padding:0;display:grid;gap:.4rem}' +
    '.bib li{display:flex;align-items:center;gap:.7rem;padding:.45rem .6rem;border-radius:14px;background:rgba(34,27,77,.7);border:1px solid #3a2f73}' +
    '.bib li.toca{border-color:#c6ff3d;background:rgba(198,255,61,.12)}' +
    '.bib li button{flex:none;width:44px;height:44px;border-radius:999px;border:0;background:#c6ff3d;color:#1a1446;font-size:1.05rem;cursor:pointer}' +
    '.bib li button:focus-visible,.bib-x:focus-visible{outline:3px solid #ffd166;outline-offset:2px}' +
    '.bib .nm{flex:1;min-width:0}' +
    '.bib .nm b{display:block;overflow-wrap:anywhere}' +
    '.bib .nm span{display:block;color:#b3acd6;font-size:.82rem}' +
    '.bib .nm em{color:#ffb3c7;font-style:normal}' +
    'body.bib-aberta{overflow:hidden}';
  d.head.appendChild(css);

  var painel = d.createElement('div');
  painel.className = 'bib'; painel.hidden = true;
  painel.setAttribute('role', 'dialog'); painel.setAttribute('aria-modal', 'true'); painel.setAttribute('aria-labelledby', 'bibTitulo');
  d.body.appendChild(painel);

  var audio = new Audio(); audio.preload = 'none';
  var tocandoUrl = null, naHistoria = false;

  function nomeJogo(id) {
    if (id === 'estante') return { nome: T('📻 Rádio do Bolinho', '📻 Rainy Day Donuts radio', '📻 Radio de Buñuelos de Lluvia'), img: null };
    var j = (window.BolinhoCatalogo && BolinhoCatalogo.jogos || []).filter(function (x) { return x.id === id; })[0];
    if (!j) return { nome: id, img: null };
    var n = j.nomes && j.nomes[lingua()] || j.nome;
    return { nome: (j.img ? '' : j.ico + ' ') + n, img: j.img || null };
  }
  function licenca(l) { return l === 'CC0' ? T('domínio público', 'public domain', 'dominio público') : l; }

  function montar() {
    var jogos = BolinhoBiblioteca.jogos, unicas = {};
    jogos.forEach(function (j) { j.musicas.forEach(function (m) { unicas[m.a] = 1; }); });
    var h = '<div class="bib-c"><div class="bib-topo"><h2 id="bibTitulo">' + T('🎵 Biblioteca de músicas', '🎵 Music library', '🎵 Biblioteca de música') + '</h2>' +
      '<button type="button" class="bib-x" aria-label="' + T('Fechar', 'Close', 'Cerrar') + '">✕</button></div>' +
      '<p class="bib-sub">' + T('Todas as músicas que tocam nos jogos e na rádio: ', 'Every song played in the games and on the radio: ', 'Todas las canciones que suenan en los juegos y en la radio: ') +
      Object.keys(unicas).length + T(' músicas. Toque ▶ para ouvir.', ' songs. Tap ▶ to listen.', ' canciones. Toca ▶ para escucharla.') + '</p>';
    jogos.forEach(function (j) {
      var n = nomeJogo(j.id);
      h += '<h3>' + (n.img ? '<img src="' + n.img + '" alt="">' : '') + esc(n.nome) + ' <small>· ' + j.musicas.length + '</small></h3><ol>';
      j.musicas.forEach(function (m) {
        h += '<li data-a="' + esc(m.a) + '"><button type="button" aria-label="' + esc(T('Tocar ', 'Play ', 'Reproducir ') + m.t) + '">▶</button>' +
          '<div class="nm"><b>' + esc(m.t) + '</b><span>' + esc(m.au) + (m.lic ? ' · ' + esc(licenca(m.lic)) : '') + '</span></div></li>';
      });
      h += '</ol>';
    });
    painel.innerHTML = h + '</div>';
    marcar();
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function marcar(erro) {
    var lis = painel.querySelectorAll('li');
    for (var i = 0; i < lis.length; i++) {
      var li = lis[i], meu = li.getAttribute('data-a') === tocandoUrl, b = li.querySelector('button');
      var ativo = meu && !audio.paused;
      li.classList.toggle('toca', ativo);
      b.textContent = ativo ? '⏸' : '▶';
      var aviso = li.querySelector('.nm em');
      if (meu && erro && !aviso) { aviso = d.createElement('em'); li.querySelector('.nm span').appendChild(aviso); }
      if (aviso) aviso.textContent = meu && erro ? ' · ' + T('precisa de internet', 'needs the internet', 'necesita internet') : '';
    }
  }
  function pausarRadio() {
    var r = d.querySelector('.radio.tocando .r-play');
    if (r) r.click();
  }
  function tocar(url) {
    if (tocandoUrl === url && !audio.paused) { audio.pause(); return; }
    if (tocandoUrl !== url) { tocandoUrl = url; audio.src = url; }
    pausarRadio();
    var p = audio.play();
    if (p && p.catch) p.catch(function () { marcar(true); });
  }
  ['play', 'pause', 'ended'].forEach(function (ev) { audio.addEventListener(ev, function () { marcar(); }); });
  audio.addEventListener('error', function () { marcar(true); });

  function abrir() {
    montar();
    painel.hidden = false;
    d.body.classList.add('bib-aberta');
    painel.querySelector('.bib-x').focus();
    try { history.pushState({ bolinhoBiblioteca: 1 }, ''); naHistoria = true; } catch (e) { naHistoria = false; }
  }
  function fechar(pelaHistoria) {
    if (painel.hidden) return;
    painel.hidden = true;
    d.body.classList.remove('bib-aberta');
    audio.pause();
    if (naHistoria && !pelaHistoria) { naHistoria = false; history.back(); }
    naHistoria = false;
    bt.focus();
  }
  bt.addEventListener('click', abrir);
  painel.addEventListener('click', function (e) {
    if (e.target.closest('.bib-x')) return fechar();
    var b = e.target.closest('li button');
    if (b) tocar(b.parentNode.getAttribute('data-a'));
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !painel.hidden) fechar(); });
  window.addEventListener('popstate', function () { if (!painel.hidden) fechar(true); });
  if (window.BolinhoIdioma) BolinhoIdioma.aoMudar(function () { if (!painel.hidden) montar(); });
})();
