/* Trilha comum dos jogos do Bolinho de Chuva (desde 06/Nov/2026).
   Um tocador pequeno, no canto da tela, com as músicas gravadas que o jogo escolher. As músicas já moram no
   repositório, nas pastas musicas/ de cada jogo, com as licenças em <pasta>/musicas/LICENCAS.md. O jogo novo aponta
   para elas com ../, sem copiar nenhum arquivo.

   Uso:
     <script src="../trilha.js"></script>
     Trilha.iniciar({ jogo: 'labirinto', musicas: [ { a: '../rabiscolandia/musicas/street-party.mp3', t: 'Street Party',
       au: 'Kevin MacLeod', lic: 'CC BY 4.0' }, ... ], creditos: 'CREDITOS.md' });
     Trilha.volume(0.3)         // abaixa a música enquanto acontece outra coisa (null volta ao normal)
     Trilha.tocando()           // true ou false

   Como funciona:
   - Toca uma música depois da outra, sem parar, em ordem sorteada (Trilha.embaralhar): a favorita do jogo (a que
     toca sem internet) nunca é a primeira — fica sempre no fim da volta. Regra do dono (06/Nov/2026).
   - Tenta tocar sozinha ao abrir. Se o navegador barrar, começa no primeiro toque em qualquer lugar da tela. Escuta o
     toque quando o dedo SOLTA (pointerup, touchend, click), que é o momento em que o navegador libera o som, e só para
     de escutar depois que a música começou de verdade.
   - 🔇 desliga, e o jogo lembra (bolinho:<jogo>:trilha-mudo). Os efeitos do jogo continuam.
   - Sem internet, ou se uma música não abre: toca em laço a música FAVORITA do jogo, guardada no aparelho
     (Trilha.offline, abaixo), com o nome dela no tocador; 🔇 e ⏭ continuam valendo. Com internet, depois que a
     primeira música começa, a favorita é guardada sozinha (uma vez só). Sem a favorita guardada, a música que não
     abre é pulada; se nenhuma abre, o tocador some, sem erro na tela.
   - Carrega no Node sem quebrar, para os testes: sem "document", não monta nada.

   Trilha.offline (desde 06/Nov/2026) — UMA música favorita por jogo que toca sem internet:
     Os service workers não guardam os MP3 (o <audio> pede pedaços com "Range" e alguns celulares travam com a cópia
     guardada). Então cada jogo tem uma favorita, baixada INTEIRA para o cache "bolinho-musicas" (um só para todos os
     jogos, uma cópia por arquivo) e tocada por um endereço blob: (o arquivo inteiro na memória, sem pedaços).
     Também serve para os jogos antigos, que têm tocador próprio: eles carregam este arquivo só por este ajudante.
       Trilha.offline.FAVORITAS              id do jogo (ou 'estante', a rádio da estante) → endereço completo do MP3
       Trilha.offline.guardar(ids, aoAndar)  baixa as favoritas desses jogos que ainda não estão guardadas (só com
                                             internet e sem "economia de dados"); aoAndar(i, total) a cada uma.
                                             Promise com quantas delas ficaram guardadas no aparelho.
       Trilha.offline.tocar(audio, url, falhou)  se a música está guardada E (sem internet, ou falhou = true, ou o
                                             <audio> deu erro), põe o blob: dela em audio.src. Promise<boolean>.
     Cada arquivo vira um blob: só uma vez por página e o mesmo endereço é reaproveitado (nenhum se acumula).

   Trilha.desligada(jogo, url) / Trilha.desligar(jogo, url, sim) — música tirada do repertório do jogo na 🎵 Biblioteca
   Trilha.embaralhar(lista, jogo, endereco) (desde 06/Nov/2026) — a ordem com internet, para todo tocador do Bolinho
     (este, o radio.js e os som.js dos jogos antigos): devolve uma cópia da lista em ordem sorteada, com a favorita
     do jogo (Trilha.offline.FAVORITAS[jogo]) no fim. endereco(item) dá o MP3 de cada item (sem ele: item.a). */
(function (raiz) {
  'use strict';
  var T = {};
  function t(pt, en, es) { try { var l = document.documentElement.lang || ''; return /^en/i.test(l) ? en : /^es/i.test(l) ? (es || pt) : pt; } catch (e) { return pt; } }
  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function gravar(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }

  // ---------- Trilha.offline: a favorita de cada jogo, guardada no aparelho ----------
  var O = T.offline = {}, CACHE_MUSICAS = 'bolinho-musicas', blobs = {};
  var BASE = (function () {   // a pasta deste arquivo (a raiz do Bolinho: /kids/)
    try { var s = document.currentScript; if (s && s.src) return s.src.replace(/[^\/]*$/, ''); } catch (e) {}
    try { return new URL('/kids/', location.href).href; } catch (e) { return '/kids/'; }
  })();
  function completo(u) { try { return new URL(u, BASE).href; } catch (e) { return BASE + u; } }
  // favoritas: instrumentos de verdade, animadas, até 2,5 MB, e que o próprio jogo toca (revistas em 06/Nov/2026)
  var FAV = {
    estante: 'musicas/cool-rock.mp3',
    baguncolandia: 'baguncolandia/musicas/going-bananas.mp3',
    peluqueria: 'peluqueria/musicas/funky-chunk.mp3',
    vruuum: 'vruuum/musicas/kart-grand-prix.mp3',
    purpurina: 'purpurina/musicas/funky-one.mp3',
    rabiscolandia: 'rabiscolandia/musicas/street-party.mp3',
    'campo-minado': 'rabiscolandia/musicas/scheming-weasel.mp3',
    'batalha-naval': 'vruuum/musicas/heroic-age.mp3',
    enigmas: 'baguncolandia/musicas/happy-whistling-ukulele.mp3',
    labirinto: 'peluqueria/musicas/beachfront-celebration.mp3',
    cozinha: 'rabiscolandia/musicas/mariachi-snooze.mp3',
    'a-garra': 'baguncolandia/musicas/my-giant-bunny-friend.mp3',
    aqua: 'purpurina/musicas/c-funk.mp3',
    'quem-e': 'rabiscolandia/musicas/fluffing-a-duck.mp3',
    'glub-glub': 'baguncolandia/musicas/spring-chicken.mp3'
  };
  O.FAVORITAS = {};
  Object.keys(FAV).forEach(function (k) { O.FAVORITAS[k] = completo(FAV[k]); });
  function semRede() { return typeof navigator !== 'undefined' && navigator.onLine === false; }
  O.guardar = function (ids, aoAndar) {
    var urls = [], feitas = 0;
    (ids || []).forEach(function (id) { var u = O.FAVORITAS[id]; if (u && urls.indexOf(u) < 0) urls.push(u); });
    if (typeof caches === 'undefined' || !urls.length) return Promise.resolve(0);
    var con = typeof navigator !== 'undefined' && navigator.connection, pode = !semRede() && !(con && con.saveData);
    return caches.open(CACHE_MUSICAS).then(function (c) {
      return urls.reduce(function (fila, u, i) {
        return fila.then(function () {
          if (aoAndar) try { aoAndar(i, urls.length); } catch (e) {}
          return c.match(u).then(function (r) {
            if (r) return true;
            if (!pode) return false;
            // a cópia inteira (200), uma de cada vez; o service worker não mexe em MP3
            return fetch(u).then(function (resp) { return resp.status === 200 && c.put(u, resp).then(function () { return true; }); });
          }).then(function (ok) { if (ok) feitas++; }, function () {});
        });
      }, Promise.resolve());
    }).then(function () { return feitas; }, function () { return feitas; });
  };
  O.tocar = function (audio, url, falhou) {
    if (!audio || !url || typeof caches === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) return Promise.resolve(false);
    if (!semRede() && !falhou && !audio.error) return Promise.resolve(false);
    var antes = audio.src;   // se o jogo trocar de música enquanto procura, não mexe
    var pronto = blobs[url] ? Promise.resolve(blobs[url]) : caches.open(CACHE_MUSICAS)
      .then(function (c) { return c.match(url); })
      .then(function (r) { return r ? r.blob() : null; })
      .then(function (b) { if (b && !blobs[url]) blobs[url] = URL.createObjectURL(b); return b ? blobs[url] : null; });
    return pronto.then(function (b) { if (!b || audio.src !== antes) return false; audio.src = b; return true; }, function () { return false; });
  };

  // ---------- músicas desligadas na 🎵 Biblioteca da estante (dono, 14/Nov/2026) ----------
  // localStorage "bolinho:musicas-desligadas" = { jogo: [endereço completo do mp3, …] }. Desligada = fora do repertório
  // daquele jogo neste aparelho. Nunca deixa um jogo mudo: se todas estiverem desligadas, toca a lista inteira.
  var CH_DESL = 'bolinho:musicas-desligadas';
  function lerDesl() { try { return JSON.parse(localStorage.getItem(CH_DESL) || '{}') || {}; } catch (e) { return {}; } }
  function absoluto(u) { try { return new URL(u, typeof location !== 'undefined' ? location.href : BASE).href; } catch (e) { return u; } }
  T.desligadas = function (jogo) { return (lerDesl()[jogo] || []).slice(); };
  T.desligada = function (jogo, url) { return T.desligadas(jogo).indexOf(absoluto(url)) >= 0; };
  T.desligar = function (jogo, url, desligar) {
    var d = lerDesl(), l = d[jogo] || [], u = absoluto(url), i = l.indexOf(u);
    if (desligar && i < 0) l.push(u); else if (!desligar && i >= 0) l.splice(i, 1);
    if (l.length) d[jogo] = l; else delete d[jogo];
    try { localStorage.setItem(CH_DESL, JSON.stringify(d)); } catch (e) {}
  };

  // ---------- a ordem com internet: sorteada, a favorita sempre por último (sem as desligadas) ----------
  T.embaralhar = function (lista, jogo, endereco) {
    var a = (lista || []).slice(), fav = O.FAVORITAS[jogo], fora = T.desligadas(jogo);
    if (fora.length) {
      var ligadas = a.filter(function (m) { return fora.indexOf(absoluto(endereco ? endereco(m) : m.a)) < 0; });
      if (ligadas.length) a = ligadas;
    }
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; }
    if (!fav) return a;
    function eFav(m) { try { return new URL(endereco ? endereco(m) : m.a, typeof location !== 'undefined' ? location.href : BASE).href === fav; } catch (e) { return false; } }
    return a.filter(function (m) { return !eFav(m); }).concat(a.filter(eFav));
  };

  T.iniciar = function (op) {
    if (typeof document === 'undefined' || !op || !op.musicas || !op.musicas.length) return T;
    var lista = T.embaralhar(op.musicas, op.jogo), CH_MUDO = 'bolinho:' + op.jogo + ':trilha-mudo';
    var atual = 0, falhas = 0, volBase = op.volume || 0.5, volFator = 1;
    var FAVORITA = O.FAVORITAS[op.jogo], naFavorita = false, guardou = false;
    var audio = new Audio(); audio.preload = 'none'; audio.volume = volBase;

    var st = document.createElement('style');
    st.textContent = '.trilha{position:fixed;right:.6rem;bottom:.6rem;z-index:40;display:flex;align-items:center;gap:.2rem;' +
      'padding:.25rem .5rem .25rem .25rem;border-radius:999px;background:rgba(20,16,58,.78);color:#fff;font:600 .8rem system-ui,sans-serif;' +
      'max-width:calc(100% - 1.2rem);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}' +
      '.trilha button{border:0;background:transparent;color:inherit;width:40px;height:40px;border-radius:50%;font-size:1.15rem;cursor:pointer}' +
      '.trilha button:focus-visible{outline:3px solid #ffd166}' +
      '.trilha .tr-nome{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:11rem}' +
      '.trilha .tr-nome a{color:#9ee7ff}' +
      // recolhido (06/Nov/2026, pedido do dono: o tocador cobria os botões do jogo): só uma bolinha 🎵 pequena e meio
      // transparente no canto; um toque abre por 5 s e ela volta a recolher sozinha
      '.trilha .tr-abrir{display:none}' +
      '.trilha.mini{padding:0;gap:0;background:rgba(20,16,58,.55);opacity:.8}' +
      '.trilha.mini .tr-som,.trilha.mini .tr-prox,.trilha.mini .tr-nome{display:none}' +
      '.trilha.mini .tr-abrir{display:block;width:36px;height:36px;font-size:1rem}' +
      '@media (max-width:30rem){.trilha .tr-nome{max-width:7rem}}';
    document.head.appendChild(st);
    var bar = document.createElement('div');
    bar.className = 'trilha'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', t('Música', 'Music', 'Música'));
    bar.innerHTML = '<button type="button" class="tr-abrir" aria-label="' + t('Música', 'Music', 'Música') + '">🎵</button>' +
      '<button type="button" class="tr-som"></button><button type="button" class="tr-prox" aria-label="' +
      t('Próxima música', 'Next song', 'Siguiente canción') + '">⏭</button><span class="tr-nome" aria-live="polite"></span>';
    document.body.appendChild(bar);
    var bSom = bar.querySelector('.tr-som'), nome = bar.querySelector('.tr-nome');

    function mudo() { return ler(CH_MUDO) === '1'; }
    function pintar() {
      var tocando = !audio.paused;
      bSom.textContent = tocando ? '🔊' : '🔇';
      bSom.setAttribute('aria-label', tocando ? t('Desligar a música', 'Turn the music off', 'Apagar la música') : t('Ligar a música', 'Turn the music on', 'Encender la música'));
      var m = naFavorita ? favoritaDaLista() : lista[atual];
      nome.innerHTML = '';
      nome.appendChild(document.createTextNode('🎵 ' + m.t + ' · ' + m.au + ' · ' + m.lic + ' '));
      if (op.creditos) { var a = document.createElement('a'); a.href = op.creditos; a.target = '_blank'; a.rel = 'noopener'; a.textContent = t('créditos', 'credits', 'créditos'); nome.appendChild(a); }
    }
    function carregar(n) { naFavorita = false; audio.loop = false; atual = (n + lista.length) % lista.length; audio.src = lista[atual].a; pintar(); }
    function favoritaDaLista() {
      for (var i = 0; i < lista.length; i++) if (new URL(lista[i].a, location.href).href === FAVORITA) return lista[i];
      return { t: FAVORITA.split('/').pop().replace(/\.mp3$/, ''), au: '', lic: '' };
    }
    // sem internet ou música que não abriu: a favorita guardada no aparelho, em laço
    function favorita() {
      if (!FAVORITA) return Promise.resolve(false);
      return O.tocar(audio, FAVORITA).then(function (ok) {
        if (ok) { naFavorita = true; audio.loop = true; bar.hidden = false; pintar(); }
        return ok;
      });
    }
    function pular() {
      falhas++;
      if (falhas < lista.length) { carregar(atual + 1); if (!mudo()) tocar(); }
      else { bar.hidden = true; }
    }
    function tocar() { var p = audio.play(); if (p && p.catch) p.catch(function () { pintar(); }); return p; }

    bSom.addEventListener('click', function () {
      if (audio.paused) { gravar(CH_MUDO, null); if (!audio.src) carregar(atual); tocar(); }
      else { gravar(CH_MUDO, '1'); audio.pause(); }
    });
    bar.querySelector('.tr-prox').addEventListener('click', function () {
      gravar(CH_MUDO, null);
      if (naFavorita && semRede()) { audio.currentTime = 0; tocar(); return; }   // sem internet só há a favorita: do começo
      carregar(atual + 1); tocar();
    });
    audio.addEventListener('play', pintar); audio.addEventListener('pause', pintar);
    audio.addEventListener('playing', function () {
      falhas = 0;
      if (!guardou && !naFavorita && !semRede()) { guardou = true; O.guardar([op.jogo]); }   // guarda a favorita, em silêncio
    });
    audio.addEventListener('ended', function () { carregar(atual + 1); tocar(); });
    audio.addEventListener('error', function () {
      if (!audio.src) return;
      if (naFavorita) { naFavorita = false; audio.loop = false; pular(); return; }   // nem a guardada abriu
      favorita().then(function (ok) { if (!ok) pular(); else if (!mudo()) tocar(); });
    });

    carregar(atual);
    var recolher = 0;
    function recolherDepois(ms) { clearTimeout(recolher); recolher = setTimeout(function () { bar.classList.add('mini'); }, ms); }
    recolherDepois(5000);
    bar.querySelector('.tr-abrir').addEventListener('click', function () { bar.classList.remove('mini'); recolherDepois(5000); });
    bar.addEventListener('click', function (e) { if (!bar.classList.contains('mini') && !e.target.closest('.tr-abrir')) recolherDepois(5000); });

    function comecar() {
      if (mudo()) return;
      var EVT = ['pointerup', 'touchend', 'click', 'keydown'];
      var esperar = function (e) {
        if (e && e.target && e.target.closest && e.target.closest('.trilha')) return;   // os botões do tocador cuidam de si
        if (mudo() || !audio.paused) { soltar(); return; }
        var p = tocar(); if (p && p.then) p.then(soltar, function () {}); else soltar();
      };
      var soltar = function () { EVT.forEach(function (k) { document.removeEventListener(k, esperar, true); }); };
      var p0 = tocar();
      if (p0 && p0.catch) p0.catch(function () { EVT.forEach(function (k) { document.addEventListener(k, esperar, true); }); });
    }
    // sem internet ao abrir: a favorita já fica pronta antes do primeiro toque (o toque só dá o play)
    if (FAVORITA && semRede()) favorita().then(comecar); else comecar();

    T.volume = function (v) { volFator = v == null ? 1 : v; audio.volume = Math.max(0, Math.min(1, volBase * volFator)); };
    T.tocando = function () { return !audio.paused; };
    T.parar = function () { audio.pause(); };
    T._audio = audio;
    return T;
  };
  T.volume = function () {}; T.tocando = function () { return false; }; T.parar = function () {};
  if (typeof module !== 'undefined' && module.exports) module.exports = T; else raiz.Trilha = T;
})(typeof self !== 'undefined' ? self : this);
