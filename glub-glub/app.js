/* GLUB GLUB — telas (começo, jogo, fim, álbum), botões, placar, baldes, faixas e o laço do jogo.
   As regras ficam em regras.js (GlubRegras), o desenho em arte.js (GlubArte), os sons em som.js (GlubSom).
   Com ?teste aparece window.GlubDebug (usado pelos testes no navegador); ?vitrine põe todos os bichos no lago (prints).
   Versão: APP_VERSION aqui = VERSAO no sw.js = primeira entrada do versoes.json. */
(function () {
  'use strict';
  var APP_VERSION = '0.1.0', APP_DATA = '14/Nov/2026';
  var R = window.GlubRegras, A = window.GlubArte, Som = window.GlubSom;
  var $ = function (id) { return document.getElementById(id); };
  var BUSCA = location.search, TESTE = /[?&]teste\b/.test(BUSCA), VITRINE = /[?&]vitrine\b/.test(BUSCA);
  var calmo = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  // trilha: músicas alegres de sol e água, que já moram na Bagunçolândia, na Rabiscolândia e na Purpurina (créditos em CREDITOS.md)
  var KM = 'Kevin MacLeod', CC = 'CC BY 4.0', CC0 = 'CC0 1.0 (FreePD)', B = '../baguncolandia/musicas/', RB = '../rabiscolandia/musicas/';
  var MUSICAS = [
    { a: B + 'ukulele-song.mp3', t: 'Ukulele Song', au: 'Rafael Krux', lic: CC0 },
    { a: B + 'funshine.mp3', t: 'Funshine', au: KM, lic: CC0 },
    { a: B + 'city-sunshine.mp3', t: 'City Sunshine', au: KM, lic: CC0 },
    { a: B + 'llama-in-pajama.mp3', t: 'Llama in Pajama', au: 'Rafael Krux', lic: CC0 },
    { a: B + 'my-giant-bunny-friend.mp3', t: 'My Giant Bunny Friend', au: 'Bryan Teoh', lic: CC0 },
    { a: B + 'silly-boy.mp3', t: 'Silly Boy', au: 'Rafael Krux', lic: CC0 },
    { a: B + 'spring-chicken.mp3', t: 'Spring Chicken', au: 'Bryan Teoh', lic: CC0 },
    { a: RB + 'life-of-riley.mp3', t: 'Life of Riley', au: KM, lic: CC },
    { a: RB + 'carpe-diem.mp3', t: 'Carpe Diem', au: KM, lic: CC },
    { a: RB + 'sunflower-dance-party.mp3', t: 'Sunflower Dance Party', au: KM, lic: CC },
    { a: RB + 'music-to-delight.mp3', t: 'Music to Delight', au: KM, lic: CC },
    { a: '../purpurina/musicas/moonlight-beach.mp3', t: 'Moonlight Beach', au: KM, lic: CC }
  ];

  /* ---------- preferências e álbum (no aparelho) ---------- */
  var CH_PREF = 'bolinho:glub-glub:pref', CH_ALBUM = 'bolinho:glub-glub:album';
  function lerJSON(k, pad) { try { var v = JSON.parse(localStorage.getItem(k)); return v && typeof v === 'object' ? v : pad; } catch (e) { return pad; } }
  function gravarJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var pref = Object.assign({ modo: 'sozinho', quem: 'juca', niveis: ['facil', 'facil'], hora: 'auto', efeitos: true,
    lingua: /^en/i.test(navigator.language || '') ? 'en' : 'pt' }, lerJSON(CH_PREF, {}));
  if (!Array.isArray(pref.niveis) || pref.niveis.length !== 2) pref.niveis = ['facil', 'facil'];
  if (window.BolinhoIdioma && !BolinhoIdioma.ingles()) pref.lingua = 'pt';   // só português sem o interruptor "ingles" (../idioma.js)
  function salvarPref() { gravarJSON(CH_PREF, pref); }
  var album = lerJSON(CH_ALBUM, {});

  function t(pt, en) { return pref.lingua === 'en' ? en : pt; }
  function nomeBicho(id) { var d = R.POR_ID[id]; return d ? (pref.lingua === 'en' ? d.nome.en : d.nome.pt) : id; }
  function traduzir() {
    document.documentElement.lang = pref.lingua === 'en' ? 'en' : 'pt-BR';
    document.querySelectorAll('[data-t]').forEach(function (el) { var p = el.getAttribute('data-t').split('|'); el.textContent = pref.lingua === 'en' ? p[1] : p[0]; });
    $('btLingua').textContent = pref.lingua === 'en' ? 'PT' : 'EN';
    $('versao').textContent = t('Versão ', 'Version ') + APP_VERSION + ' · ' + APP_DATA;
    pintarMenu();
  }

  /* ---------- telas ---------- */
  var tela = 'menu', empurrado = false;
  function mostrar(id) {
    document.querySelectorAll('.tela').forEach(function (s) { s.classList.toggle('ativa', s.id === id); });
    tela = id;
    document.body.classList.toggle('jogando', id === 'jogo');
  }
  function entrar(id) { if (!empurrado) { try { history.pushState({ glub: id }, ''); empurrado = true; } catch (e) {} } mostrar(id); }
  function irMenu() {
    fecharFim(); E = null; humano = [];
    if (window.Trilha) Trilha.volume(null);
    mostrar('menu'); pintarMenu(); novoLagoDeEnfeite();
  }
  window.addEventListener('popstate', function () { empurrado = false; if (tela !== 'menu') irMenu(); });
  function voltarMenu() { if (empurrado) history.back(); else irMenu(); }
  if (window.BolinhoNav) BolinhoNav.iniciar({ jogo: 'glub-glub', noInicio: function () { return tela === 'menu'; }, irParaInicio: voltarMenu,
    emAndamento: function () { return tela === 'jogo' && !!E && !E.acabou; } });

  /* ---------- menu ---------- */
  function deitado() { return innerWidth > innerHeight; }
  function cabemDois() { return deitado() || innerWidth >= 700; }   // celular em pé: os botões dos dois não cabem
  function marcar(sel, attr, valor) { document.querySelectorAll(sel).forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute(attr) === valor)); }); }
  function pintarMenu() {
    marcar('[data-modo]', 'data-modo', pref.modo);
    marcar('[data-quem]', 'data-quem', pref.quem);
    marcar('[data-nivel-j="0"]', 'data-nivel', pref.niveis[0]);
    marcar('[data-nivel-j="1"]', 'data-nivel', pref.niveis[1]);
    var dois = pref.modo === 'dois';
    $('linhaSozinho').hidden = dois;
    $('linhaNivel1').hidden = !dois;
    $('rotuloNivel0').textContent = dois ? t('Nível do Juca', "Juca's level") : t('Nível', 'Level');
    var bloqueia = dois && !cabemDois();
    $('avisoDeitar').hidden = !bloqueia;
    $('btJogar').disabled = bloqueia;
    $('btHora').textContent = { auto: '🕒', dia: '☀️', tarde: '🌅', noite: '🌙' }[pref.hora] || '🕒';
    $('btHora').setAttribute('aria-label', t('Hora do dia: ', 'Time of day: ') + ({ auto: t('a do relógio', 'the clock'), dia: t('dia', 'day'), tarde: t('entardecer', 'sunset'), noite: t('noite', 'night') }[pref.hora]));
  }
  document.querySelectorAll('[data-modo]').forEach(function (b) { b.addEventListener('click', function () { pref.modo = b.getAttribute('data-modo'); salvarPref(); pintarMenu(); Som.toque(); }); });
  document.querySelectorAll('[data-quem]').forEach(function (b) { b.addEventListener('click', function () { pref.quem = b.getAttribute('data-quem'); salvarPref(); pintarMenu(); Som.toque(); }); });
  document.querySelectorAll('[data-nivel-j]').forEach(function (b) {
    b.addEventListener('click', function () { pref.niveis[+b.getAttribute('data-nivel-j')] = b.getAttribute('data-nivel'); salvarPref(); pintarMenu(); Som.toque(); });
  });
  $('btHora').addEventListener('click', function () { var o = ['auto', 'dia', 'tarde', 'noite']; pref.hora = o[(o.indexOf(pref.hora) + 1) % o.length]; salvarPref(); pintarMenu(); Som.toque(); montarTela(true); });
  $('btAjuda').addEventListener('click', function () { var a = $('ajuda'); a.hidden = !a.hidden; this.setAttribute('aria-expanded', String(!a.hidden)); });
  $('btLingua').addEventListener('click', function () { pref.lingua = pref.lingua === 'en' ? 'pt' : 'en'; salvarPref(); traduzir(); });
  function pintarEfeitos() { $('btEfeitos').textContent = pref.efeitos ? '🔊' : '🔈'; $('btEfeitos').setAttribute('aria-pressed', String(!!pref.efeitos)); Som.ligar(pref.efeitos); }
  $('btEfeitos').addEventListener('click', function () { pref.efeitos = !pref.efeitos; salvarPref(); pintarEfeitos(); Som.toque(); });
  $('btJogar').addEventListener('click', function () { Som.acordar(); novaPartida(); });
  $('btAlbum').addEventListener('click', function () { Som.toque(); abrirAlbum(); });
  $('btDeNovo').addEventListener('click', function () { fecharFim(); novaPartida(); });
  $('btFimMenu').addEventListener('click', voltarMenu);

  /* ---------- hora do dia e cenário ---------- */
  function periodo() {
    if (pref.hora !== 'auto') return pref.hora;
    var h = new Date().getHours();
    return h >= 6 && h < 17 ? 'dia' : h >= 17 && h < 19 ? 'tarde' : 'noite';
  }
  var cenario = 'roca';

  /* ---------- lago (canvas) ---------- */
  var cv = $('lago'), ctx = cv.getContext('2d'), E = null, enfeite = null, humano = [], efeitos = [], t0 = performance.now();
  function aspecto() { return innerWidth / Math.max(1, innerHeight); }
  function montarTela(trocouHora) {
    A.preparar(cv, innerWidth, innerHeight, Math.min(2, devicePixelRatio || 1), { periodo: periodo(), cenario: cenario });
    if (E) R.redimensionar(E, aspecto());
    if (enfeite) R.redimensionar(enfeite, aspecto());
    if (!trocouHora) pintarMenu();
  }
  var esperaResize = 0;
  addEventListener('resize', function () { clearTimeout(esperaResize); esperaResize = setTimeout(function () { montarTela(); }, 80); });
  // na tela de começo, o lago fica vivo atrás do painel, com os dois pescando sozinhos
  function novoLagoDeEnfeite() {
    enfeite = R.criar({ semente: Math.floor(Math.random() * 1e6), aspecto: aspecto(), jogadores: [{ lado: 'esq', nivel: 'medio', robo: true }, { lado: 'dir', nivel: 'medio', robo: true }] });
    enfeite.bonusFeito = true; enfeite.tempo = 1e9;
    if (VITRINE) vitrine(enfeite);
  }
  function vitrine(L) {   // ?vitrine: todos os bichos parados no lago, para os prints
    L.bichos = []; L.repor = false; L.proxBolha = Infinity; L.proxRaro = Infinity; L.j.forEach(function (J) { J.robo = false; });
    var porFaixa = {};
    R.BICHOS.forEach(function (b) { if (b.tipo !== 'lixo') (porFaixa[b.faixa] = porFaixa[b.faixa] || []).push(b.id); });
    Object.keys(porFaixa).forEach(function (f) {
      var ids = porFaixa[f], linhas = R.LINHAS[f];
      ids.forEach(function (id, i) { var o = R.colocar(L, id, (i + 0.5) / ids.length * L.W, L.sup + (R.H - L.sup) * linhas[i % linhas.length], { vel: 0 }); o.fy0 = o.fy; o.dir = i % 2 ? -1 : 1; });
    });
  }

  /* ---------- partida ---------- */
  function novaPartida() {
    var dois = pref.modo === 'dois' && cabemDois();
    var jogadores;
    if (dois) jogadores = [{ lado: 'esq', nivel: pref.niveis[0], robo: false }, { lado: 'dir', nivel: pref.niveis[1], robo: false }];
    else {
      var eu = pref.quem === 'lili' ? 1 : 0, nv = pref.niveis[0];
      jogadores = [{ lado: 'esq', nivel: nv, robo: eu !== 0 }, { lado: 'dir', nivel: nv, robo: eu !== 1 }];
    }
    humano = jogadores.map(function (j, i) { return j.robo ? -1 : i; }).filter(function (i) { return i >= 0; });
    cenario = ['roca', 'mar', 'serra'][Math.floor(Math.random() * 3)];
    E = R.criar({ semente: Math.floor(Math.random() * 1e9), aspecto: aspecto(), jogadores: jogadores });
    E.modoDois = dois;
    novasDaPartida = [];
    efeitos = []; ultimoT = 0; pausado = false;
    montarTela();
    document.body.classList.toggle('sozinho', !dois);
    $('placar0').classList.toggle('robo', !!E.j[0].robo); $('placar1').classList.toggle('robo', !!E.j[1].robo);
    // botões: no modo dois, os da esquerda são do Juca e os da direita da Lili; sozinho, só os da esquerda, de quem joga
    $('controles1').hidden = !dois;
    pintarHud(true);
    entrar('jogo');
    if (window.Trilha) Trilha.volume(0.55);
    faixa(t('Pesque! 🎣', 'Fish! 🎣'), 1200);
  }
  function jogadorDoBotao(n) { return E && E.modoDois ? n : humano[0]; }
  function pescar(n) { if (!E || tela !== 'jogo' || pausado) return; var j = jogadorDoBotao(n); if (j == null) return; if (R.pescar(E, j)) Som.mergulho(); }
  function subir(n, s) { if (!E || tela !== 'jogo') return; var j = jogadorDoBotao(n); if (j == null) return; R.subir(E, j, s); }
  ['0', '1'].forEach(function (n) {
    var bp = $('pescar' + n), bs = $('subir' + n);
    bp.addEventListener('pointerdown', function (e) { e.preventDefault(); pescar(+n); });
    bs.addEventListener('pointerdown', function (e) { e.preventDefault(); bs.classList.add('segurando'); subir(+n, true); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { bs.addEventListener(ev, function () { bs.classList.remove('segurando'); subir(+n, false); }); });
    bp.addEventListener('contextmenu', function (e) { e.preventDefault(); }); bs.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  });
  // tocar no lago também pesca: sozinho em qualquer lugar; em dois, cada um no seu lado da tela
  cv.addEventListener('pointerdown', function (e) {
    if (tela !== 'jogo' || !E) return;
    if (!E.modoDois) pescar(0); else pescar(e.clientX < innerWidth / 2 ? 0 : 1);
  });
  addEventListener('keydown', function (e) {
    if (tela !== 'jogo' || e.repeat) return;
    var k = e.key.toLowerCase();
    if (!E.modoDois) { if (k === ' ' || k === 'arrowdown' || k === 'enter') { e.preventDefault(); pescar(0); } else if (k === 'arrowup') subir(0, true); return; }
    if (k === 'a' || k === 's') pescar(0); else if (k === 'w') subir(0, true);
    else if (k === 'l' || k === 'arrowdown') pescar(1); else if (k === 'o' || k === 'arrowup') subir(1, true);
  });
  addEventListener('keyup', function (e) {
    if (tela !== 'jogo' || !E) return;
    var k = e.key.toLowerCase();
    if (!E.modoDois) { if (k === 'arrowup') subir(0, false); return; }
    if (k === 'w') subir(0, false); else if (k === 'o' || k === 'arrowup') subir(1, false);
  });

  /* ---------- HUD ---------- */
  var ultimoHud = '';
  function pintarHud(forcar) {
    if (!E) return;
    var seg = Math.ceil(E.tempo), chave = seg + '|' + E.j.map(function (J) { return J.pontos + ':' + J.balde.pedido.map(function (p) { return p.id + p.falta; }).join(','); }).join('|');
    if (!forcar && chave === ultimoHud) return;
    ultimoHud = chave;
    $('relogio').textContent = String(seg);
    $('relogio').classList.toggle('pouco', seg <= 10 && !E.acabou);
    E.j.forEach(function (J, j) {
      $('pontos' + j).textContent = String(J.pontos);
      var b = $('balde' + j); b.textContent = '';
      J.balde.pedido.forEach(function (p) {
        var it = document.createElement('span'); it.className = 'item' + (p.falta === 0 ? ' ok' : '');
        it.title = nomeBicho(p.id);
        var im = document.createElement('img'); im.src = 'img/' + p.id + '.webp'; im.alt = nomeBicho(p.id); it.appendChild(im);
        var n = document.createElement('i'); n.textContent = p.falta === 0 ? '✓' : String(p.falta); it.appendChild(n);
        b.appendChild(it);
      });
    });
  }
  var faixaT = 0;
  function faixa(texto, ms, ruim) {
    var f = $('faixa'); f.textContent = texto; f.hidden = false; f.classList.toggle('aviso-ruim', !!ruim);
    clearTimeout(faixaT); faixaT = setTimeout(function () { f.hidden = true; }, ms || 1600);
  }

  /* ---------- efeitos no lago: pontos que sobem, respingos ---------- */
  function efeito(tipo, x, y, texto, cor) { efeitos.push({ tipo: tipo, x: x, y: y, ini: agoraS(), texto: texto, cor: cor }); }
  function agoraS() { return (performance.now() - t0) / 1000; }
  function desenharEfeitos(tm) {
    var s = 15 / (innerHeight / 1000);
    for (var i = efeitos.length - 1; i >= 0; i--) {
      var f = efeitos[i], k = (tm - f.ini) / (f.tipo === 'pontos' ? 1.3 : 0.7);
      if (k >= 1) { efeitos.splice(i, 1); continue; }
      if (f.tipo === 'pontos') {
        ctx.globalAlpha = 1 - k * k; ctx.font = '700 ' + (s * 1.7).toFixed(1) + 'px Fredoka, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
        ctx.lineWidth = s * 0.45; ctx.strokeStyle = 'rgba(60,20,0,0.9)'; ctx.strokeText(f.texto, f.x, f.y - k * 90);
        ctx.fillStyle = f.cor || '#ffd23f'; ctx.fillText(f.texto, f.x, f.y - k * 90);
      } else {   // respingo na superfície
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = 'rgba(230,250,255,0.9)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(f.x, f.y, 10 + k * 60, 3 + k * 10, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(230,250,255,0.85)';
        for (var g = 0; g < 7; g++) { var a = -Math.PI * (0.15 + g / 8 * 0.7), d = k * 60; ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d * 1.4 + k * k * 60, 4 * (1 - k) + 1, 0, Math.PI * 2); ctx.fill(); }
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- eventos das regras ---------- */
  var novasDaPartida = [];
  function tratar(ev) {
    ev.forEach(function (e) {
      if (e.tipo === 'fisgou') { if (!e.n) Som.fisgou(); if (e.bicho.faixa === 6) Som.raro(); }
      else if (e.tipo === 'pegou') {
        var J = E.j[e.j], pt = R.ponta(E, e.j);
        efeito('respingo', J.anzol.x, E.sup);
        efeito('pontos', pt.x, E.sup - 40, '+' + e.pontos, e.j ? '#7ff0ff' : '#ffd23f');
        Som.ponto(e.pontos);
        if (e.bicho.tipo !== 'lixo') {
          if (!album[e.bicho.id]) novasDaPartida.push(e.bicho.id);
          album[e.bicho.id] = (album[e.bicho.id] || 0) + 1; gravarJSON(CH_ALBUM, album);
        }
        if (e.bicho.faixa === 6) faixa(t('🌟 Pirarucu Dourado! +500', '🌟 Golden Arapaima! +500'), 2200);
      }
      else if (e.tipo === 'vazio') Som.glub();
      else if (e.tipo === 'balde') { Som.balde(); faixa(t('🪣 Balde cheio! +10 segundos', '🪣 Bucket full! +10 seconds'), 1800); }
      else if (e.tipo === 'poder') { Som.poder(); faixa({ rede: t('🕸️ Rede da vovó!', "🕸️ Grandma's net!"), ligeiro: t('⚡ Anzol ligeiro!', '⚡ Quick hook!'), minhoca: t('🪱 Minhoca dourada!', '🪱 Golden worm!') }[e.poder], 1500); }
      else if (e.tipo === 'bonus') { Som.bonus(); faixa(t('♻️ Limpa o Rio! Pesque o lixo!', '♻️ Clean the River! Fish out the trash!'), 2400, true); }
      else if (e.tipo === 'bonusFim') { Som.rioLimpo(); faixa(t('Rio limpo! 🌿', 'Clean river! 🌿'), 2000); }
      else if (e.tipo === 'fim') { faixa(t('⏱ Acabou o tempo!', "⏱ Time's up!"), 1500); }
    });
  }
  function mostrarFim() {
    var P = R.placar(E), nomes = ['Juca', 'Lili'];
    $('fimTitulo').textContent = P.vencedor < 0 ? t('Empate! 🤝', "It's a tie! 🤝") : E.modoDois ? t(nomes[P.vencedor] + ' venceu! 🏆', nomes[P.vencedor] + ' wins! 🏆')
      : (humano[0] === P.vencedor ? t('Você venceu! 🏆', 'You win! 🏆') : t('Quase! 🎣', 'So close! 🎣'));
    var fp = $('fimPlacar'); fp.textContent = '';
    E.j.forEach(function (J, j) {
      var d = document.createElement('div'); d.className = 'lado' + (P.vencedor === j ? ' venceu' : '');
      var n = document.createElement('span'); n.textContent = nomes[j] + (J.robo ? ' 🤖' : ''); d.appendChild(n);
      var b = document.createElement('b'); b.textContent = String(J.pontos); d.appendChild(b);
      fp.appendChild(d);
    });
    $('fimTime').textContent = t('Juntos vocês pescaram ', 'Together you caught ') + P.time + t(' pontos!', ' points!');
    var nv = $('fimNovas'); nv.textContent = '';
    if (novasDaPartida.length) {
      var p = document.createElement('p'); p.textContent = t('Figurinhas novas no álbum:', 'New stickers in the album:'); p.style.margin = '4px 0'; p.style.width = '100%'; nv.appendChild(p);
      novasDaPartida.forEach(function (id) { var im = document.createElement('img'); im.src = 'img/' + id + '.webp'; im.alt = nomeBicho(id); im.title = nomeBicho(id); nv.appendChild(im); });
    }
    $('fim').hidden = false; document.body.classList.remove('jogando');   // a música volta para o canto, longe do título
    Som.fim();
  }
  function fecharFim() { $('fim').hidden = true; }

  /* ---------- álbum ---------- */
  function abrirAlbum() {
    var g = $('grade'); g.textContent = '';
    var ids = R.BICHOS.filter(function (b) { return b.tipo !== 'lixo'; }).sort(function (p, q) { return p.faixa - q.faixa || p.pontos - q.pontos; });
    var tem = 0;
    ids.forEach(function (b) {
      var n = album[b.id] || 0; if (n) tem++;
      var d = document.createElement('div'); d.className = 'figurinha' + (n ? ' tem' : ''); d.setAttribute('data-figurinha', b.id);
      var im = document.createElement('img'); im.src = 'img/' + b.id + '.webp'; im.alt = n ? nomeBicho(b.id) : '?'; d.appendChild(im);
      var nome = document.createElement('span'); nome.textContent = n ? nomeBicho(b.id) : '?'; d.appendChild(nome);
      var pts = document.createElement('b'); pts.textContent = b.pontos + (b.pontos === 1 ? t(' ponto', ' point') : t(' pontos', ' points')); d.appendChild(pts);
      if (n) { var q = document.createElement('small'); q.textContent = '×' + n; d.appendChild(q); }
      g.appendChild(d);
    });
    $('albumConta').textContent = tem + t(' de ', ' of ') + ids.length + t(' figurinhas', ' stickers');
    entrar('album');
  }

  /* ---------- laço ---------- */
  var ultimoT = 0, pausado = false, ultimaCarretilha = 0;
  document.addEventListener('visibilitychange', function () { pausado = document.hidden; ultimoT = 0; });
  function quadro(agora) {
    requestAnimationFrame(quadro);
    var tm = (agora - t0) / 1000, dt = ultimoT ? Math.min(0.05, (agora - ultimoT) / 1000) : 0;
    ultimoT = agora;
    if (pausado) dt = 0;
    var L = tela === 'jogo' && E ? E : enfeite;
    if (!L) return;
    if (dt) {
      var ev = R.passo(L, dt);
      if (L === E) {
        tratar(ev); pintarHud();
        if (E.encerrado && !E.fimMostrado) { E.fimMostrado = true; mostrarFim(); }   // depois da folga de 1,5 s do último peixe
        if (E.j.some(function (J) { return J.anzol.fase === 'sobe' && J.anzol.presos.length; }) && tm - ultimaCarretilha > 0.12) { ultimaCarretilha = tm; Som.carretilha(); }
      }
      if (L === enfeite && enfeite.acabou) novoLagoDeEnfeite();
    }
    A.quadro(ctx, L, calmo ? 0 : tm);
    desenharEfeitos(tm);
  }

  /* ---------- começo ---------- */
  var pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); pedidoInstalar = e; $('btInstalar').hidden = false; });
  $('btInstalar').addEventListener('click', function () { if (!pedidoInstalar) return; pedidoInstalar.prompt(); pedidoInstalar.userChoice.then(function () { pedidoInstalar = null; $('btInstalar').hidden = true; }); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !TESTE) navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });

  if (window.SolverRecursos && !SolverRecursos.ligado('glub-glub', true)) { document.querySelectorAll('.tela').forEach(function (s) { s.classList.remove('ativa'); }); $('desligado').hidden = false; traduzir(); return; }
  traduzir(); pintarEfeitos();
  montarTela(); novoLagoDeEnfeite();
  if (window.Trilha) Trilha.iniciar({ jogo: 'glub-glub', creditos: 'CREDITOS.md', volume: 0.4, musicas: MUSICAS });
  requestAnimationFrame(quadro);

  if (TESTE) window.GlubDebug = {
    pronto: true, versao: APP_VERSION,
    estado: function () {
      return { tela: tela, aspecto: aspecto(), album: album, fim: !$('fim').hidden,
        fases: E ? E.j.map(function (J) { return J.anzol.fase; }) : [], niveis: E ? E.j.map(function (J) { return J.nivel; }) : [],
        tempo: E ? E.tempo : null, pontos: E ? E.j.map(function (J) { return J.pontos; }) : [], bichos: E ? E.bichos.length : 0, bonus: E ? !!E.bonus : false };
    },
    pescar: function (j) { pescar(j); }, subir: function (j, s) { subir(j, s); }, irMenu: function () { irMenu(); },
    avancar: function (seg) { for (var s = 0; s < seg; s += 0.05) tratar(R.passo(E, 0.05)); pintarHud(true); },
    // põe um bicho bem embaixo do anzol de quem joga e pesca (para testar o álbum)
    pescarUm: function (id) {
      var j = humano[0], a = E.j[j].anzol, p = R.ponta(E, j), ang = 0;
      E.bichos = E.bichos.filter(function (o) { return o.preso != null; });
      R.colocar(E, id, p.x, E.sup + 200, { vel: 0 });
      a.ang = ang; R.pescar(E, j, ang);
    }
  };
})();

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer jogar não baixa nada a mais. */
(function () {
  if (!/[?&]instalar\b/.test(location.search) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.src = '../instalar.js';
  s.setAttribute('data-nome', 'GLUB GLUB'); s.setAttribute('data-icone', 'icone-192.png');
  s.setAttribute('data-so-com', 'instalar'); s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
  document.body.appendChild(s);
})();
