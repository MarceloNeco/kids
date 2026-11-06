/* Trilha comum dos jogos do Bolinho de Chuva (desde 06/Nov/2026).
   Um tocador pequeno, no canto da tela, com as músicas gravadas que o jogo escolher. As músicas já moram no
   repositório, nas pastas musicas/ de cada jogo, com as licenças em <pasta>/musicas/LICENCAS.md. O jogo novo aponta
   para elas com ../, sem copiar nenhum arquivo.

   Uso:
     <script src="../trilha.js"></script>
     Trilha.iniciar({ jogo: 'labirinto', musicas: [ { a: '../rabiscolandia/musicas/carefree.mp3', t: 'Carefree',
       au: 'Kevin MacLeod', lic: 'CC BY 4.0' }, ... ], creditos: 'CREDITOS.md' });
     Trilha.volume(0.3)         // abaixa a música enquanto acontece outra coisa (null volta ao normal)
     Trilha.tocando()           // true ou false

   Como funciona:
   - Toca uma música depois da outra, sem parar, e começa numa música aleatória.
   - Tenta tocar sozinha ao abrir. Se o navegador barrar, começa no primeiro toque em qualquer lugar da tela. Escuta o
     toque quando o dedo SOLTA (pointerup, touchend, click), que é o momento em que o navegador libera o som, e só para
     de escutar depois que a música começou de verdade.
   - 🔇 desliga, e o jogo lembra (bolinho:<jogo>:trilha-mudo). Os efeitos do jogo continuam.
   - Música que não abre (sem internet) é pulada. Se nenhuma abre, o tocador some, sem erro na tela.
   - Carrega no Node sem quebrar, para os testes: sem "document", não monta nada. */
(function (raiz) {
  'use strict';
  var T = {};
  function t(pt, en) { try { return /^en/i.test(document.documentElement.lang) ? en : pt; } catch (e) { return pt; } }
  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function gravar(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }

  T.iniciar = function (op) {
    if (typeof document === 'undefined' || !op || !op.musicas || !op.musicas.length) return T;
    var lista = op.musicas, CH_MUDO = 'bolinho:' + op.jogo + ':trilha-mudo';
    var atual = Math.floor(Math.random() * lista.length), falhas = 0, volBase = op.volume || 0.5, volFator = 1;
    var audio = new Audio(); audio.preload = 'none'; audio.volume = volBase;

    var st = document.createElement('style');
    st.textContent = '.trilha{position:fixed;right:.6rem;bottom:.6rem;z-index:40;display:flex;align-items:center;gap:.2rem;' +
      'padding:.25rem .5rem .25rem .25rem;border-radius:999px;background:rgba(20,16,58,.78);color:#fff;font:600 .8rem system-ui,sans-serif;' +
      'max-width:calc(100% - 1.2rem);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}' +
      '.trilha button{border:0;background:transparent;color:inherit;width:40px;height:40px;border-radius:50%;font-size:1.15rem;cursor:pointer}' +
      '.trilha button:focus-visible{outline:3px solid #ffd166}' +
      '.trilha .tr-nome{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:11rem}' +
      '.trilha .tr-nome a{color:#9ee7ff}' +
      '.trilha.mini .tr-nome{display:none}' +
      '@media (max-width:30rem){.trilha .tr-nome{max-width:7rem}}';
    document.head.appendChild(st);
    var bar = document.createElement('div');
    bar.className = 'trilha'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', t('Música', 'Music'));
    bar.innerHTML = '<button type="button" class="tr-som"></button><button type="button" class="tr-prox" aria-label="' +
      t('Próxima música', 'Next song') + '">⏭</button><span class="tr-nome" aria-live="polite"></span>';
    document.body.appendChild(bar);
    var bSom = bar.querySelector('.tr-som'), nome = bar.querySelector('.tr-nome');

    function mudo() { return ler(CH_MUDO) === '1'; }
    function pintar() {
      var tocando = !audio.paused;
      bSom.textContent = tocando ? '🔊' : '🔇';
      bSom.setAttribute('aria-label', tocando ? t('Desligar a música', 'Turn music off') : t('Ligar a música', 'Turn music on'));
      var m = lista[atual];
      nome.innerHTML = '';
      nome.appendChild(document.createTextNode('🎵 ' + m.t + ' · ' + m.au + ' · ' + m.lic + ' '));
      if (op.creditos) { var a = document.createElement('a'); a.href = op.creditos; a.target = '_blank'; a.rel = 'noopener'; a.textContent = t('créditos', 'credits'); nome.appendChild(a); }
    }
    function carregar(n) { atual = (n + lista.length) % lista.length; audio.src = lista[atual].a; pintar(); }
    function tocar() { var p = audio.play(); if (p && p.catch) p.catch(function () { pintar(); }); return p; }

    bSom.addEventListener('click', function () {
      if (audio.paused) { gravar(CH_MUDO, null); if (!audio.src) carregar(atual); tocar(); }
      else { gravar(CH_MUDO, '1'); audio.pause(); }
    });
    bar.querySelector('.tr-prox').addEventListener('click', function () { gravar(CH_MUDO, null); carregar(atual + 1); tocar(); });
    audio.addEventListener('play', pintar); audio.addEventListener('pause', pintar);
    audio.addEventListener('playing', function () { falhas = 0; });
    audio.addEventListener('ended', function () { carregar(atual + 1); tocar(); });
    audio.addEventListener('error', function () {
      if (!audio.src) return;
      falhas++;
      if (falhas < lista.length) { carregar(atual + 1); if (!mudo()) tocar(); }
      else { bar.hidden = true; }
    });

    carregar(atual);
    setTimeout(function () { bar.classList.add('mini'); }, 6000);
    bar.addEventListener('pointerenter', function () { bar.classList.remove('mini'); });

    if (!mudo()) {
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

    T.volume = function (v) { volFator = v == null ? 1 : v; audio.volume = Math.max(0, Math.min(1, volBase * volFator)); };
    T.tocando = function () { return !audio.paused; };
    T.parar = function () { audio.pause(); };
    T._audio = audio;
    return T;
  };
  T.volume = function () {}; T.tocando = function () { return false; }; T.parar = function () {};
  if (typeof module !== 'undefined' && module.exports) module.exports = T; else raiz.Trilha = T;
})(typeof self !== 'undefined' ? self : this);
