/* 🎵 Biblioteca de músicas da estante (pedido do dono, 14/Nov/2026): todas as músicas gravadas dos jogos e da rádio,
   com nome, autor e licença, para ouvir uma por uma. A lista vem de biblioteca-musicas.js (gerado por
   ferramentas/biblioteca-musicas.js a partir do que cada jogo toca). Abre pelo botão #btBiblioteca da estante.
   - Toca uma música por vez; ao tocar, pausa a rádio da estante.
   - Fecha no ✕, no Esc e no Voltar do celular (entrada no histórico ao abrir).
   - Textos em PT/EN/ES pelo idioma.js; os nomes das músicas ficam como o autor publicou.
   - Sem internet, a música que não estiver guardada no aparelho avisa "precisa de internet".
   - "✓ No jogo" / "🚫 Fora" (dono, 14/Nov/2026): tira a música do repertório daquele jogo neste aparelho
     (Trilha.desligar do trilha.js; o jogo não a toca mais; todas fora = o jogo toca todas, nunca fica mudo). */
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
    '.bib li .tocar{flex:none;width:44px;height:44px;border-radius:999px;border:0;background:#c6ff3d;color:#1a1446;font-size:1.05rem;cursor:pointer}' +
    '.bib li .liga{flex:none;min-height:40px;padding:.3rem .65rem;border-radius:999px;border:1px solid #c6ff3d;background:transparent;color:#c6ff3d;font:inherit;font-size:.8rem;font-weight:800;cursor:pointer;white-space:nowrap}' +
    '.bib li.fora{opacity:.6}.bib li.fora .liga{border-color:#ff8fab;color:#ff8fab}.bib li.fora .nm b{text-decoration:line-through}' +
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
      Object.keys(unicas).length + T(' músicas. Toque ▶ para ouvir. Não quer uma música num jogo? Toque em "✓ No jogo" e ela fica fora.', ' songs. Tap ▶ to listen. Don\'t want a song in a game? Tap "✓ In game" to leave it out.', ' canciones. Toca ▶ para escucharla. ¿No quieres una canción en un juego? Toca "✓ En el juego" y se queda fuera.') + '</p>';
    jogos.forEach(function (j) {
      var n = nomeJogo(j.id);
      h += '<h3>' + (n.img ? '<img src="' + n.img + '" alt="">' : '') + esc(n.nome) + ' <small>· ' + j.musicas.length + '</small></h3><ol>';
      j.musicas.forEach(function (m) {
        var fora = desligada(j.id, m.a);
        h += '<li data-a="' + esc(m.a) + '" data-jogo="' + esc(j.id) + '"' + (fora ? ' class="fora"' : '') + '><button type="button" class="tocar" aria-label="' + esc(T('Tocar ', 'Play ', 'Reproducir ') + m.t) + '">▶</button>' +
          '<div class="nm"><b>' + esc(m.t) + '</b><span>' + esc(m.au) + (m.lic ? ' · ' + esc(licenca(m.lic)) : '') + '</span></div>' +
          '<button type="button" class="liga" aria-pressed="' + !fora + '" aria-label="' + esc(T('Tocar no jogo: ', 'Plays in the game: ', 'Suena en el juego: ') + m.t) + '">' + rotuloLiga(fora, j.id) + '</button></li>';
      });
      h += '</ol>';
    });
    painel.innerHTML = h + '</div>';
    marcar();
  }
  // música fora do repertório do jogo (Trilha.desligar, ../trilha.js): o jogo não toca mais, neste aparelho
  function desligada(jogo, a) { return !!(window.Trilha && Trilha.desligada && Trilha.desligada(jogo, a)); }
  function rotuloLiga(fora, jogo) { return fora ? T('🚫 Fora', '🚫 Off', '🚫 Fuera') : jogo === 'estante' ? T('✓ Na rádio', '✓ On radio', '✓ En la radio') : T('✓ No jogo', '✓ In game', '✓ En el juego'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function marcar(erro) {
    var lis = painel.querySelectorAll('li');
    for (var i = 0; i < lis.length; i++) {
      var li = lis[i], meu = li.getAttribute('data-a') === tocandoUrl, b = li.querySelector('.tocar');
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
    var lg = e.target.closest('li .liga');
    if (lg && window.Trilha && Trilha.desligar) {
      var li = lg.parentNode, j = li.getAttribute('data-jogo'), a = li.getAttribute('data-a'), fora = !desligada(j, a);
      Trilha.desligar(j, a, fora);
      li.classList.toggle('fora', fora); lg.setAttribute('aria-pressed', String(!fora)); lg.textContent = rotuloLiga(fora, j);
      return;
    }
    var b = e.target.closest('li .tocar');
    if (b) tocar(b.parentNode.getAttribute('data-a'));
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !painel.hidden) fechar(); });
  window.addEventListener('popstate', function () { if (!painel.hidden) fechar(true); });
  if (window.BolinhoIdioma) BolinhoIdioma.aoMudar(function () { if (!painel.hidden) montar(); });
})();
