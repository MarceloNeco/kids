/* 🎵 Biblioteca de músicas da estante (pedido do dono, 14/Nov/2026): todas as músicas gravadas dos jogos e da rádio,
   com nome, autor e licença, para ouvir uma por uma. A lista vem de biblioteca-musicas.js (gerado por
   ferramentas/biblioteca-musicas.js a partir do que cada jogo toca). Abre pelo botão #btBiblioteca da estante.
   - Toca uma música por vez; ao tocar, pausa a rádio da estante.
   - Fecha no ✕, no Esc e no Voltar do celular (entrada no histórico ao abrir).
   - Textos em PT/EN/ES pelo idioma.js; os nomes das músicas ficam como o autor publicou.
   - Sem internet, toca a cópia guardada no aparelho (as favoritas, Trilha.offline); a que não estiver guardada avisa
     "precisa de internet".
   - "✓ No jogo" / "🚫 Fora" (dono, 14/Nov/2026): tira a música do repertório daquele jogo neste aparelho
     (Trilha.desligar do trilha.js; o jogo não a toca mais; todas fora = o jogo toca todas, nunca fica mudo).
   - Tela do DJ (dono, 20/Nov/2026: "o DJ tem que aparecer sempre, só que ele tem que mexer quando estiver tocando
     música... dentro da página do Bolinho FM"): uma TV 16:9 no alto da página, logo abaixo do título, sempre à vista
     enquanto a página está aberta. A capivara DJ e a coelhinha (desenho do clipe.js, BolinhoClipe.telinha; vídeo de IA:
     CLIPES_VIDEO.telinha) só dançam quando alguma música toca: a desta página ou a rádio da estante
     (window.BolinhoRadio, do radio.js), no ritmo da que estiver tocando. Sem música: quadro parado com um ▶ no meio, e
     tocar começa a primeira música da lista. Com música: selo "Ao vivo" e tocar abre o telão do Clipe por cima.
     A caixa é uma só e é recolocada no lugar a cada montar(). Na TV (?tv= ou navegador de TV) não aparece. */
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
    // tela do DJ: TV 16:9 com moldura roxa e brilho lima; o brilho e a luzinha de baixo acendem com música
    '.bib-dj{position:relative;width:100%;max-width:30rem;margin:.35rem auto 1.1rem;padding:7px 7px 19px;border-radius:22px;box-sizing:border-box;' +
    'background:linear-gradient(160deg,#33287f,#15103d 70%);border:1.5px solid #4a3d8f;box-shadow:0 12px 30px rgba(0,0,0,.45),0 0 18px rgba(198,255,61,.12);transition:box-shadow .5s,border-color .5s}' +
    '.bib-dj::after{content:"";position:absolute;left:50%;bottom:7px;width:34px;height:5px;margin-left:-17px;border-radius:3px;background:#3a2f73;transition:background .4s,box-shadow .4s}' +
    '.bib-dj.tocando{border-color:rgba(198,255,61,.7);box-shadow:0 12px 30px rgba(0,0,0,.45),0 0 26px rgba(198,255,61,.3)}' +
    '.bib-dj.tocando::after{background:#c6ff3d;box-shadow:0 0 8px #c6ff3d}' +
    '.bib-tela{display:block;position:relative;width:100%;height:0;padding:56.25% 0 0;margin:0;border:0;border-radius:15px;overflow:hidden;background:#0b0a1f;color:#f3f0ff;font:inherit;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}' +
    '.bib-tela:focus-visible{outline:3px solid #ffd166;outline-offset:3px}' +
    '.bib-tela canvas,.bib-tela video{position:absolute;left:0;top:0;width:100%;height:100%;display:block}' +
    '.bib-tela video{object-fit:cover;opacity:0;transition:opacity .4s}.bib-tela.com-video video{opacity:1}' +
    '.bib-vivo{position:absolute;left:9px;top:9px;z-index:1;display:inline-flex;align-items:center;gap:5px;padding:3px 9px 3px 7px;border-radius:999px;' +
    'background:rgba(14,10,40,.74);border:1px solid rgba(198,255,61,.45);font-size:.68rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;line-height:1.3;pointer-events:none;transition:opacity .3s}' +
    '.bib-vivo i{width:8px;height:8px;border-radius:50%;background:#ff4fa3;box-shadow:0 0 6px #ff4fa3;animation:bib-pisca 1.2s ease-in-out infinite}' +
    '@keyframes bib-pisca{50%{opacity:.3}}' +
    '.bib-tocar{position:absolute;left:50%;top:50%;z-index:1;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;background:rgba(14,10,40,.72);color:#c6ff3d;' +
    'display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px #c6ff3d,0 6px 18px rgba(0,0,0,.5);pointer-events:none;transition:opacity .3s,transform .3s}' +
    '.bib-tocar svg{width:28px;height:28px;margin-left:4px}' +
    '.bib-amplia{position:absolute;right:9px;bottom:9px;z-index:1;width:30px;height:30px;border-radius:50%;background:rgba(14,10,40,.74);color:#c6ff3d;display:flex;align-items:center;justify-content:center;pointer-events:none;transition:opacity .3s}' +
    '.bib-amplia svg{width:16px;height:16px}' +
    '.bib-dj.tocando .bib-tocar{opacity:0;transform:scale(.6)}' +
    '.bib-dj:not(.tocando) .bib-vivo,.bib-dj:not(.tocando) .bib-amplia{opacity:0}' +
    '@media (prefers-reduced-motion:reduce){.bib-vivo i{animation:none}.bib-tocar{transition:none}}' +
    'body.bib-aberta{overflow:hidden}';
  d.head.appendChild(css);

  var painel = d.createElement('div');
  painel.className = 'bib'; painel.hidden = true;
  painel.setAttribute('role', 'dialog'); painel.setAttribute('aria-modal', 'true'); painel.setAttribute('aria-labelledby', 'bibTitulo');
  d.body.appendChild(painel);

  var audio = new Audio(); audio.preload = 'none';
  var tocandoUrl = null, naHistoria = false;

  // 📺 Tela do DJ (só fora da TV: ?tv= ou navegador de TV, o mesmo teste do kids.js)
  var naTV = /[?&]tv=/.test(location.search) || /AFT|SMART-?TV|SmartTV|Tizen|Web0S|webOS|NetCast|BRAVIA|Android TV|GoogleTV|CrKey|HbbTV|AppleTV|Roku|Viera|Philips|Hisense|VIDAA/i.test(navigator.userAgent || '');
  var dj = null, djTela = null, djTl = null, djVisivel = true;
  if (!naTV) {
    dj = d.createElement('div');
    dj.className = 'bib-dj';
    dj.innerHTML = '<button type="button" class="bib-tela">' +
      '<span class="bib-vivo" aria-hidden="true"><i></i><span class="pt">Ao vivo</span><span class="en">Live</span><span class="es">En directo</span></span>' +
      '<span class="bib-tocar" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg></span>' +
      '<span class="bib-amplia" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg></span></button>';
    djTela = dj.querySelector('.bib-tela');
    // longe da vista (rolou a lista), o desenho descansa (leve no tablet Fire velho)
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { djVisivel = es[es.length - 1].isIntersecting; djLigar(); }, { root: painel }).observe(dj);
  }
  function somDaRadio() { return window.BolinhoRadio && BolinhoRadio.audio || null; }
  // o som que a tela segue: o da página, se estiver tocando; senão a rádio da estante, se ela estiver tocando
  function somAtivo() { var r = somDaRadio(); return audio.paused && r && !r.paused ? r : audio; }
  function djLigar() {
    if (!dj) return;
    if (!djTl && !painel.hidden && window.BolinhoClipe && BolinhoClipe.telinha) djTl = BolinhoClipe.telinha(djTela, somAtivo());
    if (djTl) { if (!painel.hidden && djVisivel) djTl.ligar(); else djTl.desligar(); }
  }
  function djAtualizar() {
    if (!dj) return;
    var a = somAtivo(), toca = !a.paused;
    if (djTl) djTl.audio(a);
    dj.classList.toggle('tocando', toca);
    djTela.setAttribute('aria-label', toca ? T('Tela do DJ: toque para ver o clipe grande', 'DJ screen: tap to see the big music video', 'Pantalla del DJ: toca para ver el videoclip en grande')
      : T('Tela do DJ: toque para tocar música', 'DJ screen: tap to play music', 'Pantalla del DJ: toca para poner música'));
  }
  function musicaDaPagina() {
    var achou = null;
    BolinhoBiblioteca.jogos.forEach(function (j) { j.musicas.forEach(function (m) { if (!achou && m.a === tocandoUrl) achou = { t: m.t, au: m.au }; }); });
    return achou;
  }
  if (dj) {
    djTela.addEventListener('click', function () {
      var a = somAtivo();
      if (a.paused) {   // parada: começa a primeira música da lista
        var li = painel.querySelector('li[data-a]');
        if (li) tocar(li.getAttribute('data-a'));
        return;
      }
      if (window.BolinhoClipe) BolinhoClipe.abrir({ cenas: 'radio', audio: a, musica: a === audio ? musicaDaPagina : BolinhoRadio.musica });
    });
    var r0 = somDaRadio();
    ['play', 'pause', 'ended'].forEach(function (ev) { audio.addEventListener(ev, djAtualizar); if (r0) r0.addEventListener(ev, djAtualizar); });
  }

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
    // título com o mesmo radinho tocando do botão (Bolinho FM)
    var radio = bt.querySelector('.radinho'), fm = T('Bolinho FM', 'Rainy Day FM', 'Buñuelos FM');
    var h = '<div class="bib-c"><div class="bib-topo"><h2 id="bibTitulo">' + (radio ? radio.outerHTML : '') + '<span><span class="fm">' + fm + '</span><small>' +
      T('Biblioteca de músicas', 'Music library', 'Biblioteca de música') + '</small></span></h2>' +
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
    if (dj) { var topo = painel.querySelector('.bib-topo'); topo.parentNode.insertBefore(dj, topo.nextSibling); djAtualizar(); }   // a mesma tela, de volta ao lugar
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
  // Sem internet (ou se a internet falhar), toca a cópia guardada no aparelho, se houver: as favoritas de cada jogo e da
  // rádio ficam no cache "bolinho-musicas" (Trilha.offline, ../trilha.js). Sem cópia: "precisa de internet".
  // (dono, 14/Nov/2026: o Bolinho FM não tocava nada sem internet, nem as músicas já guardadas)
  var semCopia = null, procurando = {};
  function daGuardada(url) {
    var O = window.Trilha && Trilha.offline, abs;
    try { abs = new URL(url, location.href).href; } catch (e) { abs = url; }
    if (!O || !O.tocar) { semCopia = url; marcar(true); return; }
    if (procurando[url]) return;
    procurando[url] = 1;
    O.tocar(audio, abs, true).then(function (ok) {
      delete procurando[url];
      if (tocandoUrl !== url) return;
      if (!ok) { semCopia = url; return marcar(true); }
      var p = audio.play();
      if (p && p.catch) p.catch(function () { semCopia = url; marcar(true); });
    });
  }
  function tocar(url) {
    if (tocandoUrl === url && !audio.paused) { audio.pause(); return; }
    pausarRadio();
    if (tocandoUrl !== url || semCopia === url) {
      tocandoUrl = url; semCopia = null;
      if (navigator.onLine === false) { audio.pause(); return daGuardada(url); }
      audio.src = url;
    }
    var p = audio.play();
    if (p && p.catch) p.catch(function () { daGuardada(url); });
  }
  ['play', 'pause', 'ended'].forEach(function (ev) { audio.addEventListener(ev, function () { marcar(); }); });
  audio.addEventListener('error', function () { if (tocandoUrl) daGuardada(tocandoUrl); });

  // trava a página de trás enquanto a janela está aberta (dono, 14/Nov/2026: rolar até o fim da janela não pode mexer o fundo)
  function travarFundo(sim) {
    var h = document.documentElement, n = Math.max(0, (+h.getAttribute('data-travas') || 0) + (sim ? 1 : -1));
    h.setAttribute('data-travas', n); h.classList.toggle('trava-fundo', n > 0);
  }
  function abrir() {
    montar();
    painel.hidden = false;
    d.body.classList.add('bib-aberta'); travarFundo(true);
    djLigar(); djAtualizar();
    painel.querySelector('.bib-x').focus();
    try { history.pushState({ bolinhoBiblioteca: 1 }, ''); naHistoria = true; } catch (e) { naHistoria = false; }
  }
  function fechar(pelaHistoria) {
    if (painel.hidden) return;
    painel.hidden = true;
    d.body.classList.remove('bib-aberta'); travarFundo(false);
    audio.pause(); djLigar();
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
  // o Voltar que só fecha o telão do Clipe (aberto pela tela do DJ) cai de novo na entrada desta página: ela continua aberta
  window.addEventListener('popstate', function () { if (!painel.hidden && !(history.state && history.state.bolinhoBiblioteca)) fechar(true); });
  if (window.BolinhoIdioma) BolinhoIdioma.aoMudar(function () { if (!painel.hidden) montar(); });
})();
