/*
  Jogos no aparelho, sem internet (a lista vem de catalogo.js).
  - O botão ⬇ de cada cartão (feito no catalogo.js) abre o jogo com ?instalar=1 e o jogo mostra a barra
    "Instalar o aplicativo" (instalar.js) para ganhar ícone próprio.
  - Painel "Todos os jogos" (#todos):
      ⬇ Guardar todos neste aparelho → registra o service worker de cada jogo, com andamento na tela; cada jogo
        guarda o próprio código e passa a abrir sem internet (músicas e partes pesadas seguem a regra de cada jogo,
        em geral só no Wi-Fi). Depois guarda UMA música favorita de cada jogo e da rádio (Trilha.offline, trilha.js),
        que toca mesmo sem internet. Ao abrir de novo, a página mostra se já está tudo guardado.
      📲 Instalar um por um → navegador nenhum instala vários ícones de uma vez (cada app só se instala a partir da
        própria página). Então abre o primeiro jogo com ?instalar=1&fila=1; depois de instalar (ou pular), a barra
        leva ao próximo; no fim, volta para cá (?fila=fim). A fila fica em localStorage "bolinho:fila".
  - Com o Bolinho instalado (aberto como aplicativo, ou logo depois de instalar), guarda todos sozinho.
  - Cartão com data-so-online (ex.: Dança na Sala: YouTube e TV) mostra o ícone "Precisa de internet" (catalogo.js).
  - Jogo já guardado no aparelho ganha data-guardado no cartão: sem internet ele continua aceso (catalogo.js, rede()).
  Sem internet não existe TV: o pareamento celular ↔ TV precisa da internet.
*/
// a estante marca a aba: os jogos abertos daqui sabem que o Voltar na tela de começo volta para cá (navegacao.js)
try { sessionStorage.setItem('bolinho:estante', '1'); } catch (e) { /* sem sessionStorage */ }
(function () {
  // Dentro do Bolinho instalado (janela de aplicativo) o Chrome NÃO instala outro ícone: a barra do jogo aparece, mas o
  // toque não instala (dono, 19/Nov/2026, Samsung). No Android, o "Instalar um por um" e o ⬇ de cada cartão abrem então
  // no Chrome de verdade (link intent://), onde a janela "Instalar aplicativo" funciona. A fila fica no mesmo aparelho.
  function janelaDeApp() { return !!((window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)) || navigator.standalone === true); }
  function noChrome(url) {
    if (!/Android/.test(navigator.userAgent) || !janelaDeApp()) return url;
    var u = new URL(url, location.href);
    return 'intent://' + u.host + u.pathname + u.search + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(u.href) + ';end';
  }
  window.BolinhoNoChrome = noChrome;   // para os testes
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a.c-inst');
    if (!a) return;
    var destino = noChrome(a.href);
    if (destino !== a.href) { e.preventDefault(); location.href = destino; }
  }, true);
  // texto nos três idiomas: o elemento recebe um pedaço de cada (class pt / en / es) e o idioma.js mostra o escolhido
  function tri(el, pt, en, es) {
    el.textContent = '';
    [['pt', pt], ['en', en], ['es', es]].forEach(function (p) { var s = document.createElement('span'); s.className = p[0]; s.textContent = p[1]; el.appendChild(s); });
    return el;
  }
  function T(pt, en, es) { return window.BolinhoIdioma ? BolinhoIdioma.t(pt, en, es) : pt; }
  // título da aba com o nome da marca no idioma escolhido
  function titulo() { if (window.BolinhoIdioma) document.title = BolinhoIdioma.marca() + T(' — brincadeiras para a família · SolverONE', ' — games for the whole family · SolverONE', ' — juegos para toda la familia · SolverONE'); }
  titulo(); if (window.BolinhoIdioma) BolinhoIdioma.aoMudar(titulo);
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card[data-instalar], .card[data-so-online]'));
  if (!cards.length) return;
  var instalaveis = cards.filter(function (c) { return c.hasAttribute('data-instalar'); });
  var temSW = 'serviceWorker' in navigator;

  var css = '' +
    '.todos{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem;margin-top:1.4rem;padding:.9rem 1rem;border-radius:18px;background:rgba(34,27,77,.7);border:1px solid #3a2f73}' +
    '.todos[hidden]{display:none}' +
    '.todos b{flex-basis:100%;font-size:1rem}' +
    '.todos button{min-height:44px;padding:.5rem 1rem;border-radius:999px;font:inherit;font-weight:700;cursor:pointer;border:1px solid #3a2f73;background:#221b4d;color:#f3f0ff}' +
    '.todos button.forte{background:#c6ff3d;color:#1a1446;border-color:#c6ff3d}' +
    '.todos button:focus-visible{outline:3px solid #ffd166;outline-offset:2px}' +
    '.todos button:disabled{opacity:.6;cursor:default}' +
    '.todos .st{flex-basis:100%;color:#b3acd6;font-size:.9rem;line-height:1.4}' +
    '.todos .st.ok{color:#c6ff3d}';
  var estilo = document.createElement('style');
  estilo.textContent = css;
  document.head.appendChild(estilo);

  function nomeDe(card) { return ((card.querySelector('h2 .pt') || card.querySelector('h2') || {}).textContent || '').trim(); }
  function escopo(card) { return card.getAttribute('data-sw').replace(/[^\/]*$/, ''); }

  // ---------- guardar todos ----------
  function esperarAtivo(reg) {
    return new Promise(function (ok) {
      if (reg.active) return ok(true);
      var w = reg.installing || reg.waiting;
      if (!w) return ok(false);
      var fim = setTimeout(function () { ok(false); }, 45000);
      w.addEventListener('statechange', function () {
        if (w.state === 'activated') { clearTimeout(fim); ok(true); }
        if (w.state === 'redundant') { clearTimeout(fim); ok(false); }
      });
    });
  }
  function guardarTodos(aoAndar) {
    if (!temSW) return Promise.resolve(0);
    var feitos = 0;
    return instalaveis.reduce(function (fila, card, i) {
      return fila.then(function () {
        if (aoAndar) aoAndar(i, nomeDe(card), feitos);
        return navigator.serviceWorker.register(card.getAttribute('data-sw'), { scope: escopo(card) })
          .then(esperarAtivo).then(function (ok) { if (ok) { feitos++; marcar(card); } }).catch(function () {});
      });
    }, Promise.resolve()).then(function () { return feitos; });
  }
  // uma música favorita por jogo (e a da rádio), inteira no cache "bolinho-musicas": toca sem internet
  function guardarMusicas(aoAndar) {
    var O = window.Trilha && window.Trilha.offline;
    if (!O) return Promise.resolve({ feitas: 0, total: 0 });
    var ids = Object.keys(O.FAVORITAS);
    return O.guardar(ids, aoAndar).then(function (n) { return { feitas: n, total: ids.length }; });
  }
  function marcar(card) {
    card.setAttribute('data-guardado', '');
    if (window.BolinhoCatalogo && BolinhoCatalogo.rede) BolinhoCatalogo.rede();
  }

  // ---------- painel "Todos os jogos" ----------
  var painel = document.getElementById('todos');
  if (painel && temSW) {
    painel.hidden = false;
    tri(painel.appendChild(document.createElement('b')), '📦 Todos os jogos neste aparelho', '📦 All games on this device', '📦 Todos los juegos en este dispositivo');
    var bGuardar = document.createElement('button');
    bGuardar.type = 'button'; bGuardar.className = 'forte';
    tri(bGuardar, '⬇ Guardar todos (jogar sem internet)', '⬇ Save them all (play offline)', '⬇ Guardar todos (jugar sin internet)');
    var bFila = document.createElement('button');
    bFila.type = 'button';
    tri(bFila, '📲 Instalar os ícones um por um', '📲 Install the icons one by one', '📲 Instalar los iconos uno por uno');
    var st = document.createElement('p');
    st.className = 'st';
    st.setAttribute('aria-live', 'polite');
    tri(st, 'Guardar todos: cada jogo passa a abrir sem internet. Instalar um por um: cada jogo ganha o próprio ícone na tela inicial (o navegador só deixa instalar um de cada vez).',
      'Save them all: every game will open without the internet. Install one by one: each game gets its own icon on the home screen (the browser only lets you install one at a time).',
      'Guardar todos: cada juego se abre sin internet. Instalar uno por uno: cada juego tiene su propio icono en la pantalla de inicio (el navegador solo deja instalar uno a la vez).');
    painel.appendChild(bGuardar); painel.appendChild(bFila); painel.appendChild(st);

    bGuardar.addEventListener('click', function () {
      bGuardar.disabled = true;
      st.className = 'st';
      guardarTodos(function (i, nome) {
        tri(st, '⬇ Guardando ' + (i + 1) + ' de ' + instalaveis.length + ': ' + nome + '…', '⬇ Saving ' + (i + 1) + ' of ' + instalaveis.length + ': ' + nome + '…', '⬇ Guardando ' + (i + 1) + ' de ' + instalaveis.length + ': ' + nome + '…');
      }).then(function (n) {
        return guardarMusicas(function (i, total) {
          tri(st, '🎵 Guardando as músicas favoritas: ' + (i + 1) + ' de ' + total + '…', '🎵 Saving the favorite songs: ' + (i + 1) + ' of ' + total + '…', '🎵 Guardando las canciones favoritas: ' + (i + 1) + ' de ' + total + '…');
        }).then(function (m) { return { n: n, m: m }; });
      }).then(function (r) {
        var n = r.n, m = r.m;
        var musicas = m.total ? ' 🎵 ' + m.feitas + ' de ' + m.total + ' músicas favoritas guardadas: tocam até sem internet.' : '';
        var musicasEn = m.total ? ' 🎵 ' + m.feitas + ' of ' + m.total + ' favorite songs saved: they play even without the internet.' : '';
        var musicasEs = m.total ? ' 🎵 ' + m.feitas + ' de ' + m.total + ' canciones favoritas guardadas: suenan incluso sin internet.' : '';
        bGuardar.disabled = false;
        if (n === instalaveis.length && m.feitas === m.total) {
          st.className = 'st ok';
          tri(st, '✓ Pronto: os ' + n + ' jogos funcionam sem internet neste aparelho. As músicas e as partes pesadas terminam de baixar sozinhas no Wi-Fi.' + musicas,
            '✓ All done: the ' + n + ' games work without the internet on this device. The music and the bigger files finish downloading on their own over Wi-Fi.' + musicasEn,
            '✓ Listo: los ' + n + ' juegos funcionan sin internet en este dispositivo. La música y las partes pesadas terminan de bajar solas con el Wi-Fi.' + musicasEs);
          tri(bGuardar, '✓ Todos guardados', '✓ All saved', '✓ Todos guardados');
        } else {
          tri(st, n + ' de ' + instalaveis.length + ' guardados.' + musicas + ' Confira a internet e toque de novo para terminar.',
            n + ' of ' + instalaveis.length + ' saved.' + musicasEn + ' Check the internet and tap again to finish.',
            n + ' de ' + instalaveis.length + ' guardados.' + musicasEs + ' Comprueba la conexión a internet y toca otra vez para terminar.');
        }
      });
    });

    bFila.addEventListener('click', function () {
      var fila = instalaveis.map(function (c) { return { nome: nomeDe(c), url: c.getAttribute('data-instalar') }; });
      try { localStorage.setItem('bolinho:fila', JSON.stringify(fila.slice(1))); } catch (e) {}
      location.href = noChrome(fila[0].url + '?instalar=1&fila=1');
    });

    var fimFila = /[?&]fila=fim\b/.test(location.search);
    // já guardados antes? mostra sem precisar tocar
    navigator.serviceWorker.getRegistrations().then(function (regs) {
      var escopos = regs.map(function (r) { return new URL(r.scope).pathname; });
      var n = 0;
      instalaveis.forEach(function (c) { if (escopos.indexOf(escopo(c)) >= 0) { n++; marcar(c); } });
      if (n === instalaveis.length) {
        tri(bGuardar, '✓ Todos guardados', '✓ All saved', '✓ Todos guardados');
        if (fimFila) return;   // a mensagem do fim do "Instalar um por um" fica
        st.className = 'st ok';
        tri(st, '✓ Os ' + n + ' jogos já funcionam sem internet neste aparelho.', '✓ All ' + n + ' games already work without the internet on this device.', '✓ Los ' + n + ' juegos ya funcionan sin internet en este dispositivo.');
      }
    }).catch(function () {});

    // voltou do "Instalar um por um"
    if (fimFila) {
      st.className = 'st ok';
      tri(st, '✓ Pronto! Os ícones que você instalou estão na tela inicial do aparelho.', '✓ Done! The icons you installed are on your home screen.', '✓ ¡Listo! Los iconos que has instalado están en la pantalla de inicio.');
      try { history.replaceState(null, '', location.pathname); } catch (e) {}
    }
  }

  // com o Bolinho instalado, guarda todos sozinho
  var comoApp = (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)) || navigator.standalone === true;
  if (comoApp) window.addEventListener('load', function () { guardarTodos().then(function () { return guardarMusicas(); }); });
  window.addEventListener('appinstalled', function () { guardarTodos().then(function () { return guardarMusicas(); }); });
})();
