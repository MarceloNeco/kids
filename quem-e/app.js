/* Quem é? — a tela do Duelo de Caras: escolher a meleca, o modo e o nível, escolher o segredo, perguntar, responder,
   descartar, dar o palpite, lupa, cortina do "passando o aparelho", fim, sons, voz e música.
   As regras ficam em partida.js e logica.js; os desenhos em caras.js e melecas.js.
   O idioma é o escolhido na estante (../idioma.js). Guarda só neste aparelho (localStorage "bolinho:quem-e:pref"): sons,
   voz e a meleca escolhida. */
(function () {
  'use strict';
  var APP_VERSION = '0.4.1';
  var APP_DATA = '14/Nov/2026', APP_DATA_EN = 'Nov/14/2026', APP_DATA_ES = '14/nov/2026';
  var L = window.QELogica, QP = window.QEPartida, CARAS = window.QECaras, MEL = window.QEMelecas, REDE = window.QERede;
  var $ = function (id) { return document.getElementById(id); };
  var CALMO = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var TESTE = /[?&]teste\b/.test(location.search);
  var ESPERA = TESTE ? { responder: 10, pensar: 10, falar: 10 } : { responder: 1100, pensar: 1600, falar: 1400 };

  function ler(k, padrao) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem espaço: segue sem guardar */ } }
  var pref = ler('bolinho:quem-e:pref', null) || {};
  var lingua = window.BolinhoIdioma ? BolinhoIdioma.atual() : 'pt';   // o idioma escolhido na estante (../idioma.js)
  delete pref.lingua;
  if (typeof pref.efeitos !== 'boolean') pref.efeitos = true;
  if (typeof pref.voz !== 'boolean') pref.voz = true;   // voz começa ligada (no Fácil ajuda quem ainda não lê)
  if (pref.meleca !== 'blue' && pref.meleca !== 'pink') pref.meleca = 'pink';
  function salvarPref() { gravar('bolinho:quem-e:pref', pref); }

  // ---------- idioma ----------
  function en() { return lingua === 'en'; }
  function t(pt, ingl, es) { return lingua === 'en' ? ingl : lingua === 'es' ? (es != null ? es : pt) : pt; }
  function parte(v) { var p = v.split('|'), i = { pt: 0, en: 1, es: 2 }[lingua]; return p[i] != null ? p[i] : p[0]; }
  function nomeMeleca() { return pref.meleca === 'blue' ? 'Melekento Blue' : 'Pink Honey'; }
  function traduzir() {
    document.documentElement.lang = { pt: 'pt-BR', en: 'en', es: 'es' }[lingua];
    Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (el) { el.textContent = parte(el.getAttribute('data-t')); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-rotulo]'), function (el) { var r = parte(el.getAttribute('data-rotulo')); el.setAttribute('aria-label', r); el.title = r; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-dica]'), function (el) { el.placeholder = parte(el.getAttribute('data-dica')); });
    $('versao').textContent = t('Versão ', 'Version ', 'Versión ') + APP_VERSION + ' · ' + t(APP_DATA, APP_DATA_EN, APP_DATA_ES);
    $('txtMeleca').textContent = t('Contra a ', 'Against ', 'Contra ') + nomeMeleca();
    $('balaoModos').textContent = t('Oba! Como vamos jogar?', 'Yay! How shall we play?', '¡Yupi! ¿Cómo vamos a jugar?');
    if (partida) pintar();
  }
  if (window.BolinhoIdioma) BolinhoIdioma.aoMudar(function (c) { lingua = c; traduzir(); });
  $('btAjuda').addEventListener('click', function () { var aj = $('ajuda'); aj.hidden = !aj.hidden; this.setAttribute('aria-expanded', String(!aj.hidden)); });

  // ---------- sons (feitos na hora, sem arquivo) ----------
  var ctxAudio = null;
  function bip(freq, dur, tipo, quando, vol, ate) {
    if (!pref.efeitos) return;
    try {
      if (!ctxAudio) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctxAudio = new AC(); }
      if (ctxAudio.state === 'suspended') ctxAudio.resume();
      var t0 = ctxAudio.currentTime + (quando || 0), o = ctxAudio.createOscillator(), g = ctxAudio.createGain();
      o.type = tipo || 'sine'; o.frequency.setValueAtTime(freq, t0); if (ate) o.frequency.exponentialRampToValueAtTime(ate, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.16, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(ctxAudio.destination); o.start(t0); o.stop(t0 + dur + 0.02);
    } catch (e) { /* sem som */ }
  }
  var Som = {
    virar: function () { bip(520, 0.12, 'sine', 0, 0.12, 260); },
    gosma: function () { bip(180, 0.18, 'sine', 0, 0.14, 420); bip(420, 0.12, 'triangle', 0.08, 0.08, 220); },
    sim: function () { bip(660, 0.1, 'triangle'); bip(990, 0.16, 'triangle', 0.08); },
    nao: function () { bip(392, 0.12, 'triangle'); bip(294, 0.2, 'triangle', 0.09); },
    erro: function () { bip(220, 0.25, 'sawtooth', 0, 0.06, 160); },
    ganhou: function () { [523, 659, 784, 1047, 784, 1047].forEach(function (f, k) { bip(f, 0.18, 'triangle', k * 0.12, 0.16); }); },
    perdeu: function () { [392, 349, 330, 262].forEach(function (f, k) { bip(f, 0.22, 'triangle', k * 0.16, 0.1); }); }
  };
  function pintarBotoes() {
    var b = $('btEfeitos'); b.textContent = pref.efeitos ? '🔊' : '🔈'; b.setAttribute('aria-pressed', String(pref.efeitos));
    var v = $('btVoz'); v.textContent = pref.voz ? '🗣️' : '🤐'; v.setAttribute('aria-pressed', String(pref.voz));
  }
  $('btEfeitos').addEventListener('click', function () { pref.efeitos = !pref.efeitos; salvarPref(); pintarBotoes(); Som.sim(); });
  $('btVoz').addEventListener('click', function () { pref.voz = !pref.voz; salvarPref(); pintarBotoes(); if (pref.voz) falar(t('Voz ligada!', 'Voice on!', '¡Voz encendida!')); else calar(); });

  // ---------- voz da meleca (voz.js: voz do aparelho ou, se a pessoa ligar, ElevenLabs com a chave do cofre) ----------
  // Melekento Blue fala mais grosso e borbulhante; Pink Honey mais fininho. Sem voz no aparelho, segue só com texto.
  // privado = nome que a família ensinou: nunca vai para a internet.
  var voz = window.QEVoz ? QEVoz.criar(QEVoz.ambienteDoNavegador(function () { return lingua; })) : null;
  if (voz) { voz.usarEleven(!!pref.eleven); if (pref.vozBlue) voz.definirVoz('blue', pref.vozBlue); if (pref.vozPink) voz.definirVoz('pink', pref.vozPink); }
  function falar(txt, privado) {
    if (!pref.voz || !voz) return;
    if (window.Trilha) Trilha.volume(0.3);
    voz.falar(txt, { meleca: pref.meleca, privado: !!privado }).then(function () { if (window.Trilha) Trilha.volume(null); });
  }
  function calar() { if (voz) voz.calar(); }

  // ---------- o jeito das melecas: as duas são SUPER bagunceiras (dono, 14/Nov/2026) ----------
  var ZOEIRA = {
    sim: [['Sim! Splash! 💦', 'Yes! Splash! 💦', '¡Sí! ¡Splash! 💦'], ['Siiim! Que bagunça boa! 🎉', 'Yesss! What a great mess! 🎉', '¡Síííí! ¡Qué lío más divertido! 🎉'], ['Sim! Ploft! 💥', 'Yes! Ploft! 💥', '¡Sí! ¡Ploft! 💥']],
    nao: [['Não! Ploft! 💥', 'No! Ploft! 💥', '¡No! ¡Ploft! 💥'], ['Nããão! 🙃', 'Nooo! 🙃', '¡Nooo! 🙃'], ['Não! Escorreguei de rir! 🫠', 'No! I slipped laughing! 🫠', '¡No! ¡Me he resbalado de la risa! 🫠']],
    sei: [['Ploft! Já sei! 🤩', 'Ploft! I know! 🤩', '¡Ploft! ¡Ya lo sé! 🤩'], ['Splash! Acho que descobri! 🤩', 'Splash! I think I got it! 🤩', '¡Splash! ¡Creo que lo he descubierto! 🤩'], ['Hihihi, já sei quem é! 🤩', "Hehehe, I know who it is! 🤩", '¡Jijiji, ya sé quién es! 🤩']],
    pensa: [['Hmm… deixa eu remexer a meleca… 🤔', 'Hmm… let me stir my goo… 🤔', 'Mmm… déjame remover mi slime… 🤔'], ['Hmm… pensando gosmento… 🤔', 'Hmm… gooey thinking… 🤔', 'Mmm… pensando pegajoso… 🤔'], ['Hmm… espera que eu tô escorregando nas ideias… 🤔', 'Hmm… hold on, my ideas are slippery… 🤔', 'Mmm… espera, que se me resbalan las ideas… 🤔']]
  };
  function zoeira(tipo) { var l = ZOEIRA[tipo], x = l[Math.floor(Math.random() * l.length)]; return t(x[0], x[1], x[2]); }
  function oiMeleca() { return pref.meleca === 'blue' ? t('Oi! Eu sou o Melekento Blue, o mais bagunceiro da casa! Splash!', "Hi! I'm Melekento Blue, the messiest one in the house! Splash!", '¡Hola! Soy Melekento Blue, ¡el más travieso de la casa! ¡Splash!') : t('Oi! Eu sou a Pink Honey, a mais bagunceira da casa! Ploft!', "Hi! I'm Pink Honey, the messiest one in the house! Ploft!", '¡Hola! Soy Pink Honey, ¡la más traviesa de la casa! ¡Ploft!'); }

  // ---------- melecas na tela ----------
  var nMel = 0;
  function melecaSvg(id, humor) { return MEL.svg(id, humor, { id: 'mx' + (nMel++) }); }
  function pintarMelecas() {
    $('btBlue').querySelector('.meleca-img').innerHTML = melecaSvg('blue', pref.meleca === 'blue' ? 'feliz' : 'parada');
    $('btPink').querySelector('.meleca-img').innerHTML = melecaSvg('pink', pref.meleca === 'pink' ? 'feliz' : 'parada');
    $('btBlue').setAttribute('aria-pressed', String(pref.meleca === 'blue'));
    $('btPink').setAttribute('aria-pressed', String(pref.meleca === 'pink'));
    Array.prototype.forEach.call(document.querySelectorAll('.meleca-mini'), function (el) { el.innerHTML = melecaSvg(pref.meleca, 'parada'); });
    document.documentElement.setAttribute('data-meleca', pref.meleca);
  }
  var humorAtual = 'parada';
  function humor(h) {
    if (h === humorAtual) return;
    humorAtual = h; $('melecaJogo').innerHTML = melecaSvg(pref.meleca, h);
  }

  // ---------- telas e o Voltar do celular ----------
  var atual = 'inicio', dentro = false;
  function mostrar(id) {
    Array.prototype.forEach.call(document.querySelectorAll('.tela'), function (s) { s.classList.toggle('ativa', s.id === id); });
    atual = id; window.scrollTo(0, 0);
    if (id !== 'inicio' && !dentro) { dentro = true; try { history.pushState({ quemE: 1 }, ''); } catch (e) { /* sem histórico */ } }
    setTimeout(ajustarTudo, 0);
  }
  function voltarInicio() { if (dentro) { try { history.back(); } catch (e) { aoVoltar(); } } else aoVoltar(); }
  function aoVoltar() {
    dentro = false; clearTimeout(timerMeleca); calar(); cancelarPertoQuieto(); sairDaSala(); partida = null; desligarLupa();
    if (window.QEAdivinhaTela) QEAdivinhaTela.parar(); fecharSobreposicoes(); mostrar('inicio');
    setTimeout(function () { $(pref.meleca === 'blue' ? 'btBlue' : 'btPink').focus(); }, 30);
  }
  window.addEventListener('popstate', function () { if (dentro) aoVoltar(); });
  if (window.BolinhoNav) BolinhoNav.iniciar({ jogo: 'quem-e', noInicio: function () { return atual === 'inicio'; }, irParaInicio: voltarInicio,
    emAndamento: function () { return (!!partida && partida.estado.fase === 'jogo') || (atual === 'adivinha' && !!window.QEAdivinhaTela && QEAdivinhaTela.jogando()); } });
  function fecharSobreposicoes() { $('fim').hidden = true; $('cortina').hidden = true; limparFesta(); }

  // ---------- começo: meleca, modo, nível ----------
  var modo = 'meleca', nivel = 'facil', partida = null;
  ['btBlue', 'btPink'].forEach(function (id) {
    $(id).addEventListener('click', function () {
      pref.meleca = $(id).getAttribute('data-meleca'); salvarPref(); pintarMelecas(); traduzir(); Som.gosma();
      falar(oiMeleca());
      mostrar('modos');
    });
  });
  // corpo inteiro (guardado nas preferências): cartas altas com roupa de baixo, sapato, mochila e o que segura
  function pintarCorpo() { $('btCorpo').setAttribute('aria-pressed', String(!!pref.corpo)); }
  $('btCorpo').addEventListener('click', function () { pref.corpo = !pref.corpo; salvarPref(); pintarCorpo(); Som.gosma(); });
  pintarCorpo();
  $('btMeleca').addEventListener('click', function () { modo = 'meleca'; mostrar('niveis'); });
  $('btPassar').addEventListener('click', function () { modo = 'passar'; mostrar('niveis'); });
  $('btRede').addEventListener('click', function () { modo = 'rede'; telaRede(); });
  Array.prototype.forEach.call(document.querySelectorAll('.nivel'), function (b) {
    b.addEventListener('click', function () {
      nivel = b.getAttribute('data-nivel');
      if (modo === 'rede') { if (pertoNivel) pertoCriar(nivel, null); else criarSala(); }
      else if (modo === 'passar') pedirNomes();
      else novaPartida();
      telaCheia();
    });
  });

  function telaCheia() {
    var d = document, el = d.documentElement, toque = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (!toque || TESTE) return;
    try { if (!(d.fullscreenElement || d.webkitFullscreenElement)) { var p = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : (el.webkitRequestFullscreen && el.webkitRequestFullscreen()); if (p && p.catch) p.catch(function () {}); } } catch (e) { /* sem tela cheia */ }
  }

  // ---------- as cartas ----------
  // o desenho de cada cara; cada SVG na página precisa de ids próprios (degradê de um SVG escondido não pinta os outros)
  var nSvg = 0;
  function desenhar(id) {
    // carta pequena: mostra um pouco mais de perto (a cabeça, sem tanto fundo)
    if (partida.tabuleiro.corpo) return CARAS.svg(partida.tabuleiro.caras[id], { id: 'q' + (nSvg++) + 'x', corpo: true }).replace('viewBox="0 0 300 620"', 'viewBox="22 40 256 556"');
    return CARAS.svg(partida.tabuleiro.caras[id], { id: 'q' + (nSvg++) + 'x' }).replace('viewBox="0 0 300 360"', 'viewBox="25 42 250 300"');
  }
  function montarGrade(el) {
    el.innerHTML = '';
    partida.tabuleiro.caras.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'carta'; b.setAttribute('data-id', c.id);
      b.innerHTML = '<span class="frente">' + desenhar(c.id) + '<span class="nome"></span></span><span class="verso" aria-hidden="true"></span>';
      b.querySelector('.nome').textContent = c.nome;
      ligarToques(b, c.id);
      el.appendChild(b);
    });
  }
  // segurar o dedo numa carta = lupa (o toque que vem depois não conta)
  var segurou = false;
  function ligarToques(b, id) {
    var timer = null;
    function parar() { clearTimeout(timer); timer = null; }
    b.addEventListener('pointerdown', function () { segurou = false; parar(); timer = setTimeout(function () { segurou = true; abrirLupa(id); }, 520); });
    b.addEventListener('pointerup', parar); b.addEventListener('pointerleave', parar); b.addEventListener('pointercancel', parar);
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    b.addEventListener('click', function (e) { if (segurou) { segurou = false; e.preventDefault(); return; } tocarCarta(b.parentNode.id, id); });
  }

  // cabe tudo sem rolar: escolhe o número de colunas que deixa a carta maior
  function ajustarGrade(el) {
    var area = el.parentNode; if (!area || !el.children.length || !area.clientWidth) return;
    var cs = getComputedStyle(area), pv = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom), ph = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    var W = area.clientWidth - ph - 4, H = area.clientHeight - pv - 4, n = el.children.length, gap = W < 420 ? 4 : 7, melhor = 0, colunas = 1;
    var prop = partida && partida.tabuleiro.corpo ? 2.36 : 1.38;   // corpo inteiro: carta alta
    el.style.setProperty('--prop', prop);
    for (var c = 1; c <= n; c++) {
      var lin = Math.ceil(n / c), w = Math.min((W - gap * (c - 1)) / c, ((H - gap * (lin - 1)) / lin) / prop);
      if (w > melhor) { melhor = w; colunas = c; }
    }
    melhor = Math.max(partida && partida.tabuleiro.corpo ? 26 : 30, Math.floor(melhor));
    el.style.setProperty('--colunas', colunas); el.style.setProperty('--carta', melhor + 'px'); el.style.setProperty('--gap', gap + 'px');
  }
  function ajustarTudo() { if (atual === 'jogo') ajustarGrade($('tabuleiro')); if (atual === 'segredo') ajustarGrade($('gradeSegredo')); }
  window.addEventListener('resize', ajustarTudo);
  if (window.ResizeObserver) { var ro = new ResizeObserver(ajustarTudo); ro.observe($('area')); ro.observe($('gradeSegredo').parentNode); }

  function caraMini(id, classe) {
    var c = partida.tabuleiro.caras[id];
    return '<span class="mini-cara ' + (classe || '') + '">' + desenhar(id) + '<span class="nome">' + escapar(c.nome) + '</span></span>';
  }
  function escapar(s) { return String(s).replace(/[&<>"]/g, function (x) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[x]; }); }

  // ---------- lupa ----------
  var lupa = false;
  $('meuSegredo').addEventListener('click', function () { var e = partida && partida.estado; if (e && e.segredos[quemVe()] !== null) abrirLupa(e.segredos[quemVe()]); });
  $('btLupa').addEventListener('click', function () { lupa = !lupa; this.setAttribute('aria-pressed', String(lupa)); $('tabuleiro').classList.toggle('com-lupa', lupa); });
  function abrirLupa(id) {
    if (!window.SolverJanela || !partida) return;
    var c = partida.tabuleiro.caras[id], caixa = document.createElement('div');
    caixa.className = 'lupa';
    caixa.innerHTML = CARAS.svg(c, { id: 'lupa', grande: true, corpo: !!partida.tabuleiro.corpo }) + '<p class="lupa-nome"></p><button type="button" class="grande lupa-fechar"></button>';
    caixa.querySelector('.lupa-nome').textContent = c.nome;
    var bt = caixa.querySelector('.lupa-fechar'); bt.textContent = t('Fechar', 'Close', 'Cerrar');
    var j = SolverJanela.abrir({ conteudo: caixa, classe: 'qe-janela' });
    bt.addEventListener('click', function () { j.fechar('ok'); });
  }

  // ---------- partida ----------
  var escolhido = null, quemSegura = 0, palpiteSel = null, autoDescartou = false, timerMeleca = null;
  function desligarLupa() { lupa = false; $('btLupa').setAttribute('aria-pressed', 'false'); $('tabuleiro').classList.remove('com-lupa'); }
  function novaPartida() {
    clearTimeout(timerMeleca); fecharSobreposicoes(); desligarLupa();
    var semente = TESTE ? 1234 : Math.floor(Math.random() * 1e9);
    partida = QP.criar({ modo: modo, nivel: nivel, semente: semente, corpo: !!pref.corpo, rnd: TESTE ? L.sorteio(5) : Math.random });
    montarGrade($('gradeSegredo')); montarGrade($('tabuleiro'));
    quemSegura = 0; humorAtual = ''; humor('parada'); $('meuSegredo').removeAttribute('data-chave');
    irParaSegredo(0);
  }
  // passando o aparelho: o nome de cada um (guardado só neste aparelho, nas preferências)
  function limparNome(s) { return String(s || '').replace(/[<>&"'`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16); }
  function pedirNomes() {
    var n = Array.isArray(pref.nomes) ? pref.nomes : [];
    $('nome1').value = n[0] || ''; $('nome2').value = n[1] || '';
    mostrar('nomes'); setTimeout(function () { $('nome1').focus(); }, 50);
  }
  $('btNomesOk').addEventListener('click', function () { pref.nomes = [limparNome($('nome1').value), limparNome($('nome2').value)]; salvarPref(); novaPartida(); });
  function nomeJogador(j) {
    if (modo === 'rede') return j === sala.eu ? t('Você', 'You', 'Tú') : t('A outra pessoa', 'The other player', 'La otra persona');
    if (modo === 'meleca') return j === 0 ? t('Você', 'You', 'Tú') : nomeMeleca();
    return (Array.isArray(pref.nomes) && pref.nomes[j]) || t('Jogador ', 'Player ', 'Jugador ') + (j + 1);
  }

  function irParaSegredo(j) {
    escolhido = null; quemSegura = j; $('btSortear').disabled = false;
    $('tituloSegredo').textContent = modo === 'passar' ? nomeJogador(j) + t(': escolha o seu personagem secreto 🤫', ': pick your secret character 🤫', ': elige tu personaje secreto 🤫') : t('Escolha o seu personagem secreto 🤫', 'Pick your secret character 🤫', 'Elige tu personaje secreto 🤫');
    pintarSegredo(); mostrar('segredo');
    if (modo === 'meleca') falar(t('Escolha o seu personagem secreto. Eu não vou olhar!', "Pick your secret character. I won't peek!", 'Elige tu personaje secreto. ¡Yo no voy a mirar!'));
  }
  function pintarSegredo() {
    Array.prototype.forEach.call($('gradeSegredo').children, function (b) { b.classList.toggle('escolhida', +b.getAttribute('data-id') === escolhido); });
    var bt = $('btConfirmarSegredo');
    bt.disabled = escolhido === null;
    bt.textContent = escolhido === null ? t('Escolha uma cara', 'Pick a face', 'Elige una cara') : t('🤫 Escolhi ', '🤫 I picked ', '🤫 He elegido a ') + partida.tabuleiro.caras[escolhido].nome;
  }
  $('btSortear').addEventListener('click', function () { escolhido = Math.floor(Math.random() * partida.tabuleiro.caras.length); Som.virar(); pintarSegredo(); });
  $('btConfirmarSegredo').addEventListener('click', function () {
    if (escolhido === null) return;
    Som.gosma();
    if (modo === 'rede') {
      sala.agir('segredo', { c: escolhido });
      if (partida.estado.fase === 'segredo') { esperarOutroSegredo(); return; }
      comecarJogo(); return;
    }
    partida.escolherSegredo(quemSegura, escolhido);
    if (partida.estado.fase === 'segredo') { cortina(1, function () { irParaSegredo(1); }); return; }
    comecarJogo();
  });
  function comecarJogo() {
    autoDescartou = false; palpiteSel = null; fecharPainelPerguntas(); mostrar('jogo');
    if (modo === 'meleca') { quemSegura = 0; falar(t('Pronto! Eu também escolhi o meu. Você começa!', 'Ready! I picked mine too. You go first!', '¡Listo! Yo también he elegido el mío. ¡Empiezas tú!')); }
    pintar();
  }

  function tocarCarta(grade, id) {
    if (grade === 'gradeSegredo') { escolhido = id; Som.virar(); pintarSegredo(); return; }
    if (!partida || partida.estado.fase !== 'jogo') return;
    var a = partida.aguardando(), eu = quemVe();
    if (lupa && !palpitando()) { abrirLupa(id); return; }
    if (palpitando()) {
      if (!partida.estado.dePe[eu][id]) partida.virar(eu, id);   // palpite numa virada: desvira e vale
      palpiteSel = id; Som.virar(); pintar(); return;
    }
    if (!humano(a)) return;
    partida.virar(eu, id); Som.virar(); pintar();
  }

  // quem está olhando a tela agora: contra a meleca é sempre o jogador 0; passando o aparelho, quem segura
  function quemVe() { return modo === 'meleca' ? 0 : modo === 'rede' ? sala.eu : quemSegura; }
  function humano(a) { return !!a && (modo === 'meleca' ? a.jogador === 0 : modo === 'rede' ? a.jogador === sala.eu : true); }
  function palpitando() { return !$('palpitando').hidden; }

  function textoPergunta(id) { var p = L.pergunta(id); return t(p.pt, p.en, p.es); }

  function pintar() {
    if (!partida || atual !== 'jogo') return;
    var e = partida.estado, a = partida.aguardando(), eu = quemVe();
    // cortina: no "passando o aparelho", quem precisa agir é outra pessoa
    if (modo === 'passar' && a && a.jogador !== undefined && a.jogador !== quemSegura) { cortina(a.jogador, function () { pintar(); }); return; }
    // cartas
    Array.prototype.forEach.call($('tabuleiro').children, function (b) {
      var id = +b.getAttribute('data-id');
      b.classList.toggle('virada', !e.dePe[eu][id]);
      b.classList.toggle('escolhida', palpitando() && palpiteSel === id);
    });
    var ms = $('meuSegredo'), chave = e.segredos[eu] + '|' + lingua;
    if (e.segredos[eu] !== null && ms.getAttribute('data-chave') !== chave) { ms.setAttribute('data-chave', chave); ms.innerHTML = caraMini(e.segredos[eu]) + '<span class="rotulo">' + escapar(t('Meu', 'Mine', 'Mío')) + '</span>';
      $('meuNome').textContent = t('Meu personagem: ', 'My character: ', 'Mi personaje: ') + partida.tabuleiro.caras[e.segredos[eu]].nome; }
    if (modo === 'rede' && sala) sala.guardarTabuleiro(e.dePe[eu]);
    // painel
    var seu = humano(a);
    $('acoes').hidden = !(seu && a.acao === 'perguntar') || !$('perguntas').hidden || palpitando();
    $('responder').hidden = !(seu && a.acao === 'responder');
    $('descartar').hidden = !(seu && a.acao === 'descartar');
    if (!(seu && a.acao === 'perguntar')) { fecharPainelPerguntas(); $('palpitando').hidden = true; }
    if (!$('responder').hidden) pintarResponder(a);
    else $('olhaDeNovo').hidden = true;
    if (!$('descartar').hidden) pintarDescartar(eu);
    if (palpitando()) {
      var bp = $('btConfirmarPalpite'); bp.disabled = palpiteSel === null;
      bp.textContent = palpiteSel === null ? t('Escolha a cara', 'Pick the face', 'Elige la cara') : t('É ', "It's ", '¡Es ') + partida.tabuleiro.caras[palpiteSel].nome + '!';
    }
    if (!$('perguntas').hidden) pintarPerguntas();
    pintarBalao(a);
    if (e.fase === 'fim') mostrarFim();
    setTimeout(ajustarTudo, 0);
  }

  // um recado que fica no balão por alguns segundos (passa na frente do texto normal)
  var recado = null;
  function dizer(txt, ms) { recado = { txt: txt, ate: Date.now() + (ms || 3500) }; $('balao').textContent = txt; setTimeout(function () { if (recado && Date.now() >= recado.ate) { recado = null; pintar(); } }, (ms || 3500) + 50); }
  function pintarBalao(a) {
    if (!a) return;
    var b = $('balao');
    if (recado && Date.now() < recado.ate) { b.textContent = recado.txt; return; }
    if (modo === 'rede') {
      if (!sala.outroAqui()) { b.textContent = t('📶 Esperando a outra pessoa voltar…', '📶 Waiting for the other player to come back…', '📶 Esperando a que vuelva la otra persona…'); return; }
      if (a.jogador !== sala.eu) {
        b.textContent = a.acao === 'responder' ? t('Esperando a resposta…', 'Waiting for the answer…', 'Esperando la respuesta…') : a.acao === 'veredito' ? b.textContent : t('Vez da outra pessoa. Espere um pouquinho…', "The other player's turn. Hang on…", 'Le toca a la otra persona. Espera un poquito…');
        humor('pensando'); return;
      }
    }
    if (modo === 'meleca' && a.jogador === 1) {
      if (a.acao === 'perguntar') { humor('pensando'); }
      return;
    }
    if (a.acao === 'perguntar') {
      b.textContent = modo === 'meleca' ? t('Sua vez! Pergunte ou dê o seu palpite.', 'Your turn! Ask or make your guess.', '¡Te toca! Pregunta o di quién crees que es.') : nomeJogador(a.jogador) + t(', sua vez!', ", it's your turn!", ', ¡te toca!');
      humor('parada');
    } else if (a.acao === 'descartar' && modo === 'passar') {
      b.textContent = nomeJogador(a.jogador) + t(', descarte quem não serve.', ', flip down who doesn\'t fit.', ', baja a los que no sirven.');
    }
  }

  var perguntaFalada = null;
  function pintarResponder(a) {
    var p = partida.estado.ultima.pergunta;
    // quem vai responder ouve a pergunta (ajuda quem ainda não lê); contra a meleca ela já falou a dela
    if (modo !== 'meleca' && perguntaFalada !== partida.estado.ultima) { perguntaFalada = partida.estado.ultima; falar(textoPergunta(p)); }
    var quem = modo !== 'meleca' ? nomeJogador(1 - a.jogador) + t(' quer saber:', ' wants to know:', ' quiere saber:')
      : pref.meleca === 'blue' ? t('O Melekento Blue quer saber:', 'Melekento Blue wants to know:', 'Melekento Blue quiere saber:') : t('A Pink Honey quer saber:', 'Pink Honey wants to know:', 'Pink Honey quiere saber:');
    $('pergFeita').innerHTML = '';
    var q = document.createElement('span'); q.className = 'quem'; q.textContent = quem;
    var tx = document.createElement('strong'); tx.textContent = L.pergunta(p).ico + ' ' + textoPergunta(p);
    $('pergFeita').appendChild(q); $('pergFeita').appendChild(tx);
  }

  function pintarDescartar(eu) {
    var e = partida.estado, p = L.pergunta(e.ultima.pergunta), r = e.ultima.resposta;
    $('respVeio').textContent = (r ? t('Resposta: Sim! 👍 ', 'Answer: Yes! 👍 ', 'Respuesta: ¡Sí! 👍 ') : t('Resposta: Não! 👎 ', 'Answer: No! 👎 ', 'Respuesta: ¡No! 👎 ')) + t(p.pt, p.en, p.es);
    var qtd = partida.quantasDescartar(eu), bt = $('btDescartar');
    if (nivel === 'facil' && !autoDescartou) {
      autoDescartou = true;
      if (qtd) { partida.descartarTodos(eu); Som.virar(); setTimeout(pintar, 0); return; }
    }
    if (nivel === 'facil') { bt.hidden = true; return; }
    bt.hidden = false;
    bt.disabled = !qtd;
    bt.textContent = qtd ? '🗑️ ' + textoDescarte(p, r) : t('Nenhuma para descartar', 'Nothing to flip down', 'No hay ninguna para bajar');
  }
  // "Descartar quem tem cabelo comprido" (a resposta foi Não) / "Descartar quem não tem cabelo comprido" (foi Sim)
  function textoDescarte(p, r) {
    var cor = /^roupa-/.test(p.id) ? p.pt.replace(/^A roupa é (.*)\?$/, 'está de roupa $1') : null;
    var pred = cor || (p.pt.charAt(0).toLowerCase() + p.pt.slice(1)).replace(/\?$/, '');
    return t((r ? 'Descartar quem não ' : 'Descartar quem ') + pred, 'Flip down everyone who doesn\'t fit', 'Bajar a todos los que no sirven');
  }

  // ---------- perguntar ----------
  var GRUPOS = [['quem', '👤 Quem é', '👤 Who', '👤 Quién es'], ['cabelo', '💇 Cabelo', '💇 Hair', '💇 Pelo'], ['rosto', '👀 Rosto', '👀 Face', '👀 Cara'], ['cabeca', '🎩 Na cabeça', '🎩 On the head', '🎩 En la cabeza'], ['joias', '💎 Joias', '💎 Jewelry', '💎 Joyas'], ['roupa', '👕 Roupa', '👕 Clothes', '👕 Ropa'], ['corpo', '🧍 Corpo inteiro', '🧍 Whole body', '🧍 Cuerpo entero']];
  $('btPerguntar').addEventListener('click', function () { $('perguntas').hidden = false; pintar(); $('listaPerguntas').scrollTop = 0; });
  $('btFecharPerguntas').addEventListener('click', function () { fecharPainelPerguntas(); pintar(); });
  function fecharPainelPerguntas() { $('perguntas').hidden = true; }
  function pintarPerguntas() {
    var eu = quemVe(), e = partida.estado, lista = $('listaPerguntas'), vivas = e.dePe[eu].filter(Boolean).length;
    lista.innerHTML = '';
    var mostradas = 0;
    GRUPOS.forEach(function (g) {
      var ps = L.PERGUNTAS.filter(function (p) { return p.grupo === g[0] && partida.tabuleiro.perguntas.indexOf(p.id) >= 0; });
      if (!ps.length) return;
      var h = document.createElement('h3'); h.textContent = t(g[1], g[2], g[3]); lista.appendChild(h);
      var antes = lista.children.length;
      ps.forEach(function (p) {
        var feita = e.feitas[eu].indexOf(p.id) >= 0, u = L.utilidade(partida.tabuleiro.caras, e.dePe[eu], p.id), inutil = !feita && (u === 0 || u === vivas);
        if (nivel === 'facil' && (inutil || feita)) return;
        var linha = document.createElement('div'); linha.className = 'perg';
        var b = document.createElement('button'); b.type = 'button'; b.className = 'pergunta' + (inutil ? ' inutil' : '') + (feita ? ' feita' : '');
        b.disabled = feita;
        if (!feita) b.setAttribute('data-p', p.id);
        b.innerHTML = '<span class="p-ico" aria-hidden="true"></span><span class="p-txt"></span>';
        b.querySelector('.p-ico').textContent = feita ? '✓' : p.ico;
        b.querySelector('.p-txt').textContent = t(p.pt, p.en, p.es) + (inutil ? t(' · essa não ajuda mais', " · won't help now", ' · esta ya no ayuda') : '');
        b.addEventListener('click', function () { perguntar(p.id); });
        var o = document.createElement('button'); o.type = 'button'; o.className = 'ouvir mini'; o.textContent = '🔊';
        o.setAttribute('aria-label', t('Ouvir: ', 'Listen: ', 'Escuchar: ') + t(p.pt, p.en, p.es));
        o.addEventListener('click', function () { var v = pref.voz; pref.voz = true; falar(t(p.pt, p.en, p.es)); pref.voz = v; });
        linha.appendChild(b); linha.appendChild(o); lista.appendChild(linha);
      });
      if (lista.children.length === antes) lista.removeChild(h); else mostradas += lista.children.length - antes;
    });
    if (!mostradas) {
      var v = document.createElement('p'); v.className = 'vazio';
      v.textContent = t('Nenhuma pergunta ajuda agora. Toque em ← e depois em 🎯 É este! para escolher a cara.', 'No question helps now. Tap ← and then 🎯 This one! to pick the face.', 'Ya ninguna pregunta ayuda. Toca ← y luego 🎯 ¡Es este! para elegir la cara.');
      lista.appendChild(v);
    }
  }
  function perguntar(id) {
    var eu = quemVe();
    if (modo === 'rede') sala.agir('pergunta', { p: id }); else partida.perguntar(eu, id);
    autoDescartou = false; fecharPainelPerguntas(); Som.gosma();
    falar(textoPergunta(id));
    $('balao').textContent = textoPergunta(id);
    pintar(); agendarMeleca();
  }

  // ---------- responder ----------
  function responder(r) {
    var a = partida.aguardando(); if (!humano(a) || a.acao !== 'responder') return;
    var res = modo === 'rede' ? sala.agir('resposta', { r: r }) : partida.responder(a.jogador, r);
    if (!res.ok) {
      var o = $('olhaDeNovo'); o.hidden = false;
      o.innerHTML = '';
      o.appendChild(document.createRange().createContextualFragment(caraMini(partida.estado.segredos[a.jogador], 'pisca')));
      var s = document.createElement('span'); s.textContent = t('Olha de novo o seu personagem com calma: ', 'Take another look at your character: ', 'Mira otra vez a tu personaje con calma: ') + textoPergunta(partida.estado.ultima.pergunta);
      o.appendChild(s);
      Som.erro(); humor('ops');
      falar(t('Olha de novo com calma!', 'Take another look!', '¡Mira otra vez con calma!'));
      return;
    }
    $('olhaDeNovo').hidden = true;
    if (r) Som.sim(); else Som.nao();
    if (modo === 'meleca') $('balao').textContent = r ? t('Sim! Anotado 📝', 'Yes! Got it 📝', '¡Sí! Anotado 📝') : t('Não! Anotado 📝', 'No! Got it 📝', '¡No! Anotado 📝');
    pintar(); agendarMeleca();
  }
  $('btSim').addEventListener('click', function () { responder(true); });
  $('btNao').addEventListener('click', function () { responder(false); });

  // ---------- descartar e passar a vez ----------
  $('btDescartar').addEventListener('click', function () { var ids = partida.descartarTodos(quemVe()); if (ids.length) Som.virar(); pintar(); });
  $('btPronto').addEventListener('click', function () {
    var a = partida.aguardando(); if (!humano(a) || a.acao !== 'descartar') return;
    if (modo === 'rede') sala.agir('fimvez'); else partida.pronto(a.jogador);
    pintar(); agendarMeleca();
  });

  // ---------- palpite ----------
  $('btPalpite').addEventListener('click', function () { palpiteSel = null; $('palpitando').hidden = false; pintar(); });
  $('btCancelarPalpite').addEventListener('click', function () { palpiteSel = null; $('palpitando').hidden = true; pintar(); });
  $('btConfirmarPalpite').addEventListener('click', function () {
    if (palpiteSel === null) return;
    var eu = quemVe(), id = palpiteSel, nome = partida.tabuleiro.caras[id].nome;
    palpiteSel = null; $('palpitando').hidden = true;
    if (modo === 'rede') palpiteMeu = nome;
    var r = modo === 'rede' ? (sala.agir('palpite', { c: id }), { pendente: true }) : partida.palpite(eu, id);
    if (r.pendente) { $('balao').textContent = t('Será que é ', 'Could it be ', '¿Será ') + nome + t('? Esperando a resposta…', '? Waiting for the answer…', '? Esperando la respuesta…'); falar(t('Será que é ', 'Could it be ', '¿Será ') + nome + '?'); }
    else if (!r.acertou) {
      Som.erro(); humor(modo === 'meleca' ? 'feliz' : 'ops');
      $('balao').textContent = t('Não é ', "It's not ", '¡No es ') + nome + '! 😅';
      falar(t('Não é ', "It's not ", '¡No es ') + nome + '!');
    }
    pintar(); agendarMeleca();
  });

  // ---------- a vez da meleca ----------
  function agendarMeleca() {
    clearTimeout(timerMeleca);
    if (modo !== 'meleca' || !partida || partida.estado.fase !== 'jogo') return;
    var a = partida.aguardando(); if (!a || a.jogador !== 1) return;
    timerMeleca = setTimeout(jogadaMeleca, a.acao === 'responder' ? ESPERA.responder : ESPERA.pensar);
    if (a.acao === 'perguntar') { $('balao').textContent = zoeira('pensa'); humor('pensando'); }
  }
  function jogadaMeleca() {
    if (!partida || atual !== 'jogo') return;
    var r = partida.vezDaMeleca(); if (!r) return;
    var b = $('balao');
    if (r.tipo === 'resposta') {
      var fala = zoeira(r.resposta ? 'sim' : 'nao');
      b.textContent = fala;
      humor('falando'); if (r.resposta) Som.sim(); else Som.nao();
      falar(fala);
    } else if (r.tipo === 'pergunta') {
      b.textContent = t('Minha vez! ', 'My turn! ', '¡Me toca! ') + textoPergunta(r.id);
      humor('falando'); Som.gosma(); falar(t('Minha vez! ', 'My turn! ', '¡Me toca! ') + textoPergunta(r.id));
    } else if (r.tipo === 'descartou') {
      var resta = partida.estado.dePe[1].filter(Boolean).length;
      b.textContent = t('Virei ', 'I flipped ', 'He bajado ') + r.ids.length + t(' no meu tabuleiro. Ainda tenho ', ' on my board. I still have ', ' en mi tablero. Todavía me quedan ') + resta + t(' de pé. Sua vez!', ' standing. Your turn!', ' de pie. ¡Te toca!');
      humor('parada');
    } else if (r.tipo === 'palpite') {
      var nome = partida.tabuleiro.caras[r.idCara].nome;
      if (!r.acertou) { b.textContent = t('Acho que é ', 'I think it\'s ', 'Creo que es ') + nome + t('… errei! 😅 Sua vez.', '… wrong! 😅 Your turn.', '… ¡me he equivocado! 😅 Te toca.'); humor('ops'); Som.erro(); falar(t('É o ', 'Is it ', '¿Es ') + nome + t('? Ah, errei!', '? Oh, wrong!', '? ¡Ay, me he equivocado!')); }
    }
    pintar(); agendarMeleca();
  }

  // ---------- cortina (passando o aparelho) ----------
  var depoisCortina = null;
  function cortina(j, depois) {
    quemSegura = -1; depoisCortina = function () { quemSegura = j; depois(); };
    $('cortinaTitulo').textContent = t('Passe o aparelho para ', 'Pass the device to ', 'Pásale el móvil a ') + nomeJogador(j);
    $('cortinaTexto').textContent = t('Sem espiar o tabuleiro do outro! 🙈', "No peeking at the other board! 🙈", '¡Sin espiar el tablero del otro! 🙈');
    falar(t('Passa o celular para ', 'Pass the phone to ', '¡Pásale el móvil a ') + nomeJogador(j) + t('! Sem espiar, hein?', '! No peeking!', '! Y sin espiar, ¿eh?'), true);
    $('cortina').hidden = false; $('btCortina').focus();
  }
  $('btCortina').addEventListener('click', function () { $('cortina').hidden = true; var f = depoisCortina; depoisCortina = null; if (f) f(); });

  // ---------- fim ----------
  var fimMostrado = false;
  function mostrarFim() {
    if (!$('fim').hidden && !(modo === 'rede' && sala && sala.revelado() !== null && $('fimCaras').querySelector('.oculta'))) return;
    var jaAberto = !$('fim').hidden;
    clearTimeout(timerMeleca);
    var e = partida.estado, v = e.vencedor, ganhouHumano = modo === 'meleca' ? v === 0 : modo === 'rede' ? v === sala.eu : true;
    var alvo = partida.tabuleiro.caras[e.ultima.palpite].nome;   // quem ganhou acertou o palpite: era o segredo do outro
    $('fimTitulo').textContent = modo === 'rede'
      ? (v === sala.eu ? t('Você acertou! 🎉 Era ', 'You got it! 🎉 It was ', '¡Has acertado! 🎉 ¡Era ') + alvo + '!' : t('A outra pessoa acertou! Era ', 'The other player got it! It was ', '¡La otra persona ha acertado! Era ') + alvo + '.')
      : modo === 'meleca'
      ? (v === 0 ? t('Você acertou! 🎉 Era ', 'You got it! 🎉 It was ', '¡Has acertado! 🎉 ¡Era ') + alvo + '!' : t('Eu acertei! Era ', 'I got it! It was ', '¡He acertado! ¡Era ') + alvo + t('! Quer a revanche?', '! Want a rematch?', '! ¿Quieres la revancha?'))
      : t('', '', '¡') + nomeJogador(v) + t(' ganhou! 🎉 Era ', ' wins! 🎉 It was ', ' ha ganado! 🎉 ¡Era ') + alvo + '!';
    $('fimMeleca').innerHTML = melecaSvg(pref.meleca, modo === 'meleca' && v === 0 ? 'triste' : 'feliz');
    var caras = $('fimCaras'); caras.innerHTML = '';
    [0, 1].forEach(function (j) {
      var d = document.createElement('div'); d.className = 'fim-cara';
      var seg = e.segredos[j];
      if (seg === null && modo === 'rede') seg = j === v ? null : e.ultima.palpite;   // o do perdedor é o palpite certo
      if (seg === null && modo === 'rede') seg = sala.revelado();
      d.innerHTML = (seg === null ? '<span class="mini-cara oculta">?</span>' : caraMini(seg)) + '<span class="dono"></span>';
      d.querySelector('.dono').textContent = nomeJogador(j);
      caras.appendChild(d);
    });
    $('fim').hidden = false; $('btDeNovo').focus(); fimMostrado = true;
    if (jaAberto) return;
    if (ganhouHumano) { Som.ganhou(); festa(); } else Som.perdeu();
    falar($('fimTitulo').textContent);
  }
  $('btDeNovo').addEventListener('click', function () { if (modo === 'rede') { $('fim').hidden = true; limparFesta(); sairDaSala(); telaRede(); return; } novaPartida(); });
  $('btOutroNivel').addEventListener('click', function () { $('fim').hidden = true; limparFesta(); partida = null; if (modo === 'rede') { telaRede(); return; } mostrar('niveis'); });

  function festa() {
    if (CALMO) return;
    var f = $('festa'), cores = ['#2e8bff', '#ff5fa8', '#ffb52e', '#36b26a', '#8e55d6'];
    for (var i = 0; i < 60; i++) {
      var p = document.createElement('i');
      p.style.left = (Math.random() * 100) + '%'; p.style.background = cores[i % cores.length];
      p.style.animationDelay = (Math.random() * 0.8) + 's'; p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      f.appendChild(p);
    }
    setTimeout(limparFesta, 3800);
  }
  function limparFesta() { $('festa').innerHTML = ''; }

  // ---------- cada um no seu celular (rede.js) ----------
  // a partida em rede fica guardada na ABA (sessionStorage): recarregar volta para ela; duas abas no mesmo aparelho
  // não se confundem. O endereço ganha ?sala=ABCD para recarregar voltar à mesma sala.
  var sala = null, canal = null, relogio = null, CH_REDE = 'bolinho:quem-e:rede', palpiteMeu = null, palpiteVisto = '';
  function lerSessao() { try { var v = sessionStorage.getItem(CH_REDE); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function gravarSessao(v) { try { if (v) sessionStorage.setItem(CH_REDE, JSON.stringify(v)); else sessionStorage.removeItem(CH_REDE); } catch (e) { /* sem espaço */ } }
  function enderecoSala(cod) {
    try { var u = new URL(location.href); if (cod) u.searchParams.set('sala', cod); else u.searchParams.delete('sala'); history.replaceState(history.state, '', u.pathname + u.search + u.hash); } catch (e) { /* ok */ }
  }
  function telaRede() {
    sairDaSala(); pertoNivel = false;
    $('redeInicio').hidden = false; $('redeSala').hidden = true; $('codigo').value = '';
    $('redeStatus').textContent = navigator.onLine === false ? t('📡 Sem internet agora. Sem internet, jogue 📶 pertinho, "Passando o aparelho" ou contra a meleca.', '📡 No internet right now. Offline, play 📶 nearby, "Pass the device" or against the slime.', '📡 Ahora no hay internet. Sin internet, juega 📶 de cerca, a "Pasando el móvil" o contra el slime.') : '';
    mostrar('rede');
  }
  $('btCriarSala').addEventListener('click', function () { pertoNivel = false; mostrar('niveis'); });
  $('btEntrarSala').addEventListener('click', function () { entrarSala($('codigo').value); });
  $('codigo').addEventListener('keydown', function (e) { if (e.key === 'Enter') entrarSala(this.value); });
  $('codigo').addEventListener('input', function () { this.value = this.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); });
  $('btConvidar').addEventListener('click', function () {
    var link = location.origin + location.pathname + '?sala=' + sala.codigo;
    var txt = t('Vamos jogar Quem é? Entre na partida ', "Let's play Who Is It? Join game ", '¡Juguemos a «¿Quién es?»! Entra en la partida ') + sala.codigo + ': ' + link;
    if (navigator.share) navigator.share({ title: t('Quem é?', 'Who Is It?', '¿Quién es?'), text: txt }).catch(function () {});
    else window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank', 'noopener');
  });

  function criarSala() {
    var codigo = REDE.codigoNovo(), semente = Math.floor(Math.random() * 4e9);
    conectar(codigo, { id: REDE.idNovo(), codigo: codigo, host: true, nivel: nivel, semente: semente, corpo: !!pref.corpo });
    $('redeInicio').hidden = true; $('redeSala').hidden = false; $('codigoSala').textContent = codigo;
    $('redeStatus').textContent = t('Esperando alguém entrar com o código…', 'Waiting for someone to join with the code…', 'Esperando a que alguien entre con el código…');
    mostrar('rede');
  }
  function entrarSala(cod) {
    cod = String(cod || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (cod.length !== 4) { $('redeStatus').textContent = t('O código tem 4 letras. Confira e tente de novo.', 'The code has 4 letters. Check it and try again.', 'El código tiene 4 letras. Revísalo e inténtalo otra vez.'); return; }
    modo = 'rede';
    var guardado = lerSessao(), volta = guardado && guardado.codigo === cod && guardado.dados;
    // primeiro a tela de espera; se a partida já existe, conectar() leva direto para ela
    if (volta && volta.host && !volta.outro) {
      $('redeInicio').hidden = true; $('redeSala').hidden = false; $('codigoSala').textContent = cod;
      $('redeStatus').textContent = t('Esperando alguém entrar com o código…', 'Waiting for someone to join with the code…', 'Esperando a que alguien entre con el código…');
    } else $('redeStatus').textContent = t('Procurando a partida ', 'Looking for game ', 'Buscando la partida ') + cod + '…';
    if (atual !== 'rede') mostrar('rede');
    conectar(cod, volta ? { dados: guardado.dados } : { id: REDE.idNovo(), codigo: cod, host: false });
  }
  // op.conexao (📶 Jogar pertinho): canal direto já aberto com o outro aparelho; nada fica guardado para recarregar
  function conectar(codigo, op) {
    var direto = op.conexao || null;
    sala = REDE.criar({
      id: op.id, codigo: codigo, host: op.host, nivel: op.nivel, semente: op.semente, corpo: op.corpo, dados: op.dados,
      mandar: function (m) { if (canal) canal.mandar(m); },
      salvar: function (d) { if (!direto) gravarSessao({ codigo: codigo, dados: d }); },
      aoMudar: redeMudou
    });
    sala.perto = !!direto;
    if (!direto) enderecoSala(codigo);
    abrirCanal(codigo, direto);
    clearInterval(relogio); relogio = setInterval(function () { if (sala) sala.tique(); }, 500);
    if (sala.partida) redeMudou();
  }
  function abrirCanal(codigo, direto) {
    var minha = sala;
    REDE.abrir(codigo, function (m) { if (sala === minha) minha.receber(m); }, function () {
      if (sala !== minha) return;
      if (direto) { caiuPerto(minha); return; }
      setTimeout(function () { if (sala === minha) abrirCanal(codigo); }, 2000);
    }, direto)
      .then(function (c) { if (sala !== minha) { c.fechar(); return; } canal = c; minha.tique(); })
      .catch(function () {
        if (sala !== minha) return;
        $('redeStatus').textContent = t('📡 Não deu para conectar. Confira a internet: vou tentar de novo.', "📡 Couldn't connect. Check the internet: trying again.", '📡 No se ha podido conectar. Revisa la conexión a internet: lo intento otra vez.');
        setTimeout(function () { if (sala === minha) abrirCanal(codigo); }, 4000);
      });
  }
  function sairDaSala() {
    if (!sala) return;
    try { sala.sair(); } catch (e) { /* ok */ }
    clearInterval(relogio); relogio = null; manterTelaAcesa(false);
    if (canal) { var c = canal; setTimeout(function () { c.fechar(); }, 300); }
    canal = null; sala = null;
    gravarSessao(null); enderecoSala(null);
  }
  function redeMudou() {
    if (!sala) return;
    if (sala.cheia()) { $('redeStatus').textContent = t('Essa partida já tem dois jogadores. Peça um código novo.', 'That game already has two players. Ask for a new code.', 'Esa partida ya tiene dos jugadores. Pide un código nuevo.'); return; }
    if (sala.partida && partida !== sala.partida && sala.temOutro()) {
      partida = sala.partida; nivel = partida.nivel; desligarLupa(); palpiteMeu = null; palpiteVisto = '';
      montarGrade($('gradeSegredo')); montarGrade($('tabuleiro'));
      humorAtual = ''; humor('parada'); $('meuSegredo').removeAttribute('data-chave'); fimMostrado = false;
      var e = partida.estado;
      if (e.segredos[sala.eu] === null) { irParaSegredo(sala.eu); return; }
      if (e.fase === 'segredo') { irParaSegredo(sala.eu); esperarOutroSegredo(); return; }
      comecarJogo(); return;
    }
    if (!partida) return;
    var e2 = partida.estado;
    // o veredito do meu palpite chegou: errei? (acertar abre a tela do fim)
    if (palpiteMeu && e2.passo !== 'veredito') {
      if (e2.fase === 'jogo') { dizer(t('Não é ', "It's not ", '¡No es ') + palpiteMeu + '! 😅'); Som.erro(); humor('ops'); falar(t('Não é ', "It's not ", '¡No es ') + palpiteMeu + '!'); }
      palpiteMeu = null;
    }
    // a outra pessoa chutou o meu e errou
    if (e2.ultima && e2.ultima.palpite !== undefined && e2.ultima.quem !== sala.eu && e2.fase === 'jogo') {
      var chave = e2.ultima.palpite + ':' + e2.feitas[1 - sala.eu].length + ':' + JSON.stringify(e2.dePe[sala.eu]).length;
      if (chave !== palpiteVisto) { palpiteVisto = chave; dizer(t('A outra pessoa achou que era ', 'The other player guessed ', 'La otra persona ha dicho que era ') + partida.tabuleiro.caras[e2.ultima.palpite].nome + t('. Errou! Sua vez 🎉', '. Wrong! Your turn 🎉', '. ¡Ha fallado! Te toca 🎉')); humor('feliz'); }
    }
    if (atual === 'segredo' && partida.estado.fase !== 'segredo') { comecarJogo(); return; }
    if (atual === 'jogo') pintar();
    if (partida.estado.fase === 'fim') mostrarFim();
  }
  function esperarOutroSegredo() {
    $('tituloSegredo').textContent = t('Pronto! Esperando a outra pessoa escolher… 🤫', 'Done! Waiting for the other player to pick… 🤫', '¡Listo! Esperando a que la otra persona elija… 🤫');
    $('btConfirmarSegredo').disabled = true; $('btSortear').disabled = true;
  }

  // ---------- 📶 Jogar pertinho (sem internet): dois celulares no mesmo Wi-Fi, ligados direto ----------
  // Peças da Batalha Naval, usadas como estão: ../batalha-naval/pertinho.js (a ligação direta e o código curto) e
  // ../batalha-naval/qr.js (desenhar e ler o QR, com as bibliotecas de ../batalha-naval/libs/). O código mostrado
  // ganha "QE" na frente: assim um código da Batalha Naval aqui (ou o nosso lá) avisa em vez de ligar errado.
  // Depois de ligados, a partida é a mesma do "cada um no seu celular" (rede.js com o canal direto).
  var P = window.BNPertinho, Q = window.BNQR, PREFIXO = 'QE', LIBS = '../batalha-naval/libs/';
  var perto = null, pertoNivel = false, trava = null;      // perto = { papel: 'criar' | 'entrar', nivel, religar, volta, ses, leitor, codigo, qr, etapa }
  var ESPERA_ABRIR = TESTE ? 4000 : 20000, ESPERA_DICA = TESTE ? 4000 : 45000;
  function libsQR() { return Promise.all([Q.carregar(LIBS + 'qrcode.js', 'qrcode'), Q.carregar(LIBS + 'jsQR.js', 'jsQR')]); }
  function manterTelaAcesa(liga) {    // tela apagada derruba a ligação direta: enquanto joga pertinho, a tela fica acesa
    if (!liga) { if (trava) { try { trava.release(); } catch (e) { /* ok */ } } trava = null; return; }
    if (trava || document.hidden || !navigator.wakeLock) return;
    navigator.wakeLock.request('screen').then(function (w) { trava = w; w.addEventListener('release', function () { if (trava === w) trava = null; }); }).catch(function () { /* sem trava */ });
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && sala && sala.perto) manterTelaAcesa(true); });
  function janelaAviso(op) {          // { titulo, texto, botoes: [{ t, fn }] }
    if (!window.SolverJanela) return;
    var caixa = document.createElement('div'), h = document.createElement('h2'), p = document.createElement('p'), j = null;
    caixa.className = 'qe-aviso'; h.textContent = op.titulo; p.textContent = op.texto; caixa.appendChild(h); caixa.appendChild(p);
    op.botoes.forEach(function (b, i) {
      var bt = document.createElement('button'); bt.type = 'button'; bt.className = i ? 'medio-bt' : 'grande'; bt.textContent = b.t;
      bt.addEventListener('click', function () { if (j) j.fechar('ok'); SolverJanela.quandoQuieto(b.fn); });
      caixa.appendChild(bt);
    });
    j = SolverJanela.abrir({ conteudo: caixa, classe: 'qe-janela' });
  }
  function semWebRTC() { return !P || !Q || !P.temWebRTC(); }
  $('btPerto').addEventListener('click', function () {
    modo = 'rede';
    $('pertoMsg').textContent = semWebRTC() ? t('😕 Este navegador não consegue ligar dois aparelhos direto. Use o Chrome (Android) ou o Safari (iPhone) atualizados.', "😕 This browser can't link two devices directly. Use an up-to-date Chrome (Android) or Safari (iPhone).", '😕 Este navegador no puede conectar dos aparatos directamente. Usa Chrome (Android) o Safari (iPhone) actualizados.') : '';
    mostrar('perto');
  });
  $('btPertoCriar').addEventListener('click', function () { if (semWebRTC()) return; modo = 'rede'; pertoNivel = true; mostrar('niveis'); });
  $('btPertoEntrar').addEventListener('click', function () { if (semWebRTC()) return; modo = 'rede'; pertoEntrar(null); });

  function limparPerto(s) {
    if (!s) return;
    clearTimeout(s.tempo); clearTimeout(s.dica);
    if (s.leitor) { s.leitor.parar(); s.leitor = null; }
    if (s.ses && !s.conectou) s.ses.fechar();
  }
  function cancelarPertoQuieto() { var s = perto; perto = null; limparPerto(s); }
  // cancelar: volta para onde estava (no meio de uma partida que caiu: para ela, com o aviso de novo)
  function cancelarPerto() {
    var s = perto; perto = null; limparPerto(s);
    if (s && s.religar && sala === s.religar) { mostrar(s.volta); if (s.volta === 'jogo') pintar(); caiuPerto(s.religar); return; }
    mostrar('perto');
  }
  $('btPertoCancelar1').addEventListener('click', cancelarPerto);
  $('btPertoCancelar2').addEventListener('click', cancelarPerto);
  $('btPertoDeNovo').addEventListener('click', function () { var s = perto; if (!s) return; if (s.papel === 'criar') pertoCriar(s.nivel, s.religar); else pertoEntrar(s.religar); });

  function telaCodigo(titulo, dica) {
    $('pertoCodTitulo').textContent = titulo; $('pertoCodDica').textContent = dica;
    $('pertoCodStatus').textContent = t('⏳ Preparando o código…', '⏳ Getting the code ready…', '⏳ Preparando el código…');
    $('pertoCodTexto').textContent = ''; $('btPertoLerResposta').hidden = true; $('btPertoDeNovo').hidden = true;
    var cv = $('pertoQR'); cv.width = cv.height = 1; cv.hidden = true;
    mostrar('pertoCodigo');
  }
  function mostrarQR(s, codigo, status) {
    s.codigo = PREFIXO + codigo; $('pertoCodTexto').textContent = s.codigo; $('pertoCodStatus').textContent = status;
    return libsQR().then(function () { return Q.desenhar($('pertoQR'), s.codigo); }).then(function (info) { if (perto !== s) return; s.qr = info; $('pertoQR').hidden = false; },
      function () { if (perto === s) $('pertoCodStatus').textContent = t('😕 Não consegui desenhar o QR. Use o código em texto aqui embaixo.', "😕 Couldn't draw the QR. Use the text code below.", '😕 No he podido dibujar el QR. Usa el código en texto de aquí abajo.'); });
  }
  $('btPertoCopiar').addEventListener('click', function () {
    var txt = $('pertoCodTexto').textContent; if (!txt) return;
    var marcar = function () { var sel = window.getSelection(), r = document.createRange(); r.selectNodeContents($('pertoCodTexto')); sel.removeAllRanges(); sel.addRange(r); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { $('pertoCodStatus').textContent = t('📋 Código copiado!', '📋 Code copied!', '📋 ¡Código copiado!'); }, marcar); else marcar();
  });

  // quem cria (religar = a sala que caiu: ligar de novo sem perder a partida)
  function pertoCriar(nv, religar) {
    limparPerto(perto);
    var s = perto = { papel: 'criar', nivel: nv, religar: religar || null, volta: religar ? atual : null, etapa: 'oferta' };
    telaCodigo(t('1️⃣ Mostre este código para o outro celular', '1️⃣ Show this code to the other phone', '1️⃣ Enseña este código al otro móvil'),
      religar ? t('No outro celular: toque em 🔁 Ligar de novo e aponte a câmera para este quadrado.', 'On the other phone: tap 🔁 Link again and point the camera at this square.', 'En el otro móvil: toca 🔁 Volver a conectar y apunta la cámara a este cuadrado.')
        : t('No outro celular: 📱 Cada um no seu celular → 📶 Jogar pertinho → 📷 Entrar pertinho, e aponte a câmera para este quadrado.', 'On the other phone: 📱 Each on their own phone → 📶 Play nearby → 📷 Join nearby, and point the camera at this square.', 'En el otro móvil: 📱 Cada uno con su móvil → 📶 Jugar de cerca → 📷 Entrar de cerca, y apunta la cámara a este cuadrado.'));
    $('pertoCodStatus').textContent = t('⏳ Preparando o código… (se pedir a câmera, toque em Permitir)', '⏳ Getting the code ready… (if it asks for the camera, tap Allow)', '⏳ Preparando el código… (si pide la cámara, toca Permitir)');
    P.criar({ camera: true }).then(function (ses) {
      if (perto !== s) { ses.fechar(); return; }
      s.ses = ses;
      ses.aberta.then(function (cx) { conectou(s, cx); }, function () { falhouPerto(s); });
      mostrarQR(s, ses.codigo, t('Quando o outro celular mostrar o código dele, toque no botão aqui embaixo.', 'When the other phone shows its code, tap the button below.', 'Cuando el otro móvil enseñe su código, toca el botón de aquí abajo.'));
      $('btPertoLerResposta').hidden = false;
    }, function (e) { erroPerto(s, e); });
  }
  $('btPertoLerResposta').addEventListener('click', function () {
    var s = perto; if (!s || s.papel !== 'criar' || !s.ses) return;
    s.etapa = 'lerResposta';
    abrirLeitor(s, t('3️⃣ Leia o código do outro celular', "3️⃣ Scan the other phone's code", '3️⃣ Lee el código del otro móvil'), t('Aponte a câmera para o quadrado que apareceu no outro celular.', 'Point the camera at the square on the other phone.', 'Apunta la cámara al cuadrado que ha salido en el otro móvil.'));
  });
  // quem entra
  function pertoEntrar(religar) {
    limparPerto(perto);
    var s = perto = { papel: 'entrar', religar: religar || null, volta: religar ? atual : null, etapa: 'lerOferta' };
    abrirLeitor(s, t('2️⃣ Leia o código de quem criou', '2️⃣ Scan the creator’s code', '2️⃣ Lee el código de quien ha creado la partida'), t('Aponte a câmera para o quadrado preto e branco na tela do outro celular.', 'Point the camera at the black and white square on the other phone.', 'Apunta la cámara al cuadrado blanco y negro de la pantalla del otro móvil.'));
  }
  function abrirLeitor(s, titulo, dica) {
    $('pertoLerTitulo').textContent = titulo; $('pertoLerDica').textContent = dica;
    $('pertoLerStatus').textContent = t('📷 Abrindo a câmera…', '📷 Opening the camera…', '📷 Abriendo la cámara…');
    $('pertoColar').value = ''; $('pertoVideo').hidden = false;
    mostrar('pertoLer');
    libsQR().then(function () { return Q.ler($('pertoVideo'), lerCodigo); }).then(function (leitor) {
      if (perto !== s) { leitor.parar(); return; }
      s.leitor = leitor; if (!s.avisou && (s.etapa === 'lerOferta' || s.etapa === 'lerResposta')) $('pertoLerStatus').textContent = t('🔎 Procurando o código…', '🔎 Looking for the code…', '🔎 Buscando el código…');
    }, function (e) {
      if (perto !== s) return;
      $('pertoLerStatus').textContent = e && e.codigo === 'negado'
        ? t('📷 A câmera não foi liberada. Libere a câmera para este site (no cadeado ao lado do endereço) ou cole o código em texto aqui embaixo.', '📷 The camera was not allowed. Allow the camera for this site (padlock next to the address) or paste the text code below.', '📷 No se ha permitido la cámara. Permite la cámara para esta web (en el candado junto a la dirección) o pega el código en texto aquí abajo.')
        : t('📷 Não achei a câmera. Cole o código em texto aqui embaixo.', "📷 Couldn't find a camera. Paste the text code below.", '📷 No he encontrado la cámara. Pega el código en texto aquí abajo.');
      $('pertoColarCaixa').open = true;
    });
  }
  $('btPertoUsar').addEventListener('click', function () { lerCodigo($('pertoColar').value); });

  // um código lido pela câmera (ou colado): o mesmo caminho para os dois
  function lerCodigo(texto) {
    var s = perto; if (!s || (s.etapa !== 'lerOferta' && s.etapa !== 'lerResposta')) return false;
    var bruto = String(texto || '').replace(/\s+/g, '').toUpperCase(), r;
    if (bruto.slice(0, PREFIXO.length) !== PREFIXO) { avisoCodigo(/^BN\d/.test(bruto) ? 'outro' : 'lixo'); return false; }
    bruto = bruto.slice(PREFIXO.length);
    try { r = P.deCodigo(bruto); } catch (e) { avisoCodigo(e.codigo); return false; }
    var quero = s.etapa === 'lerOferta' ? 'offer' : 'answer';
    if (r.type !== quero) { avisoCodigo(quero === 'offer' ? 'resposta' : 'oferta'); return false; }
    Som.gosma(); if (navigator.vibrate) try { navigator.vibrate(40); } catch (e) { /* ok */ }
    if (s.etapa === 'lerResposta') {
      s.etapa = 'conectando';
      if (s.leitor) { s.leitor.parar(); s.leitor = null; }
      $('pertoVideo').hidden = true;
      $('pertoLerStatus').textContent = t('🔗 Código lido! Ligando os dois celulares…', '🔗 Code scanned! Linking the two phones…', '🔗 ¡Código leído! Conectando los dos móviles…');
      s.ses.aceitar(bruto).then(function () {
        if (perto !== s) return;
        s.tempo = setTimeout(function () { if (perto === s && !s.conectou) falhouPerto(s); }, ESPERA_ABRIR);
      }, function () { if (perto === s) { s.etapa = 'lerResposta'; avisoCodigo('lixo'); } });
      return true;
    }
    s.etapa = 'resposta';
    $('pertoLerStatus').textContent = t('✅ Código lido! Preparando a resposta…', '✅ Code scanned! Getting the answer ready…', '✅ ¡Código leído! Preparando la respuesta…');
    // a câmera continua ligada enquanto o aparelho junta os endereços (assim ele mostra o endereço de verdade na rede)
    P.entrar(bruto, { camera: !s.leitor }).then(function (ses) {
      if (s.leitor) { s.leitor.parar(); s.leitor = null; }
      if (perto !== s) { ses.fechar(); return; }
      s.ses = ses;
      ses.aberta.then(function (cx) { conectou(s, cx); }, function () { falhouPerto(s); });
      telaCodigo(t('4️⃣ Agora mostre este código para quem criou', '4️⃣ Now show this code to the creator', '4️⃣ Ahora enseña este código a quien ha creado la partida'),
        t('Quem criou toca em "📷 Agora ler o código do outro celular" e aponta a câmera para cá.', 'The creator taps "📷 Now scan the other phone\'s code" and points the camera here.', 'Quien ha creado la partida toca "📷 Ahora leer el código del otro móvil" y apunta la cámara aquí.'));
      mostrarQR(s, ses.codigo, t('⏳ Esperando o outro celular ler este código…', '⏳ Waiting for the other phone to scan this code…', '⏳ Esperando a que el otro móvil lea este código…'));
      s.dica = setTimeout(function () {
        if (perto !== s || s.conectou) return;
        $('pertoCodStatus').textContent = t('🤔 Ainda não ligou. Os dois estão no MESMO Wi-Fi (o do celular-roteador)? Wi-Fi de avião, hotel ou loja costuma não deixar um aparelho ver o outro. Se quem criou já leu este código, toquem em Começar de novo nos dois.', "🤔 Not linked yet. Are both on the SAME Wi-Fi (the hotspot phone's)? Plane, hotel or shop Wi-Fi often doesn't let devices see each other. If the creator already scanned this code, tap Start over on both.", '🤔 Todavía no se han conectado. ¿Estáis los dos en la MISMA wifi (la del móvil que comparte conexión)? La wifi de un avión, un hotel o una tienda no suele dejar que un aparato vea al otro. Si quien ha creado la partida ya ha leído este código, tocad Empezar de nuevo en los dos.');
        $('btPertoDeNovo').hidden = false;
      }, ESPERA_DICA);
    }, function (e) { if (s.leitor) { s.leitor.parar(); s.leitor = null; } erroPerto(s, e); });
    return true;
  }
  function avisoCodigo(cod) {
    if (perto) perto.avisou = true;          // a câmera terminando de abrir não apaga este aviso
    $('pertoLerStatus').textContent = cod === 'versao' ? t('⚠️ Esse código é de outra versão do jogo. Abram o Quem é? com internet nos dois celulares para atualizar e tentem de novo.', '⚠️ That code is from another version of the game. Open Who Is It? with internet on both phones to update, then try again.', '⚠️ Ese código es de otra versión del juego. Abrid ¿Quién es? con internet en los dos móviles para actualizar y volved a intentarlo.')
      : cod === 'resposta' ? t('⚠️ Esse é o código de resposta. Leia o código que aparece no celular de quem criou a partida.', "⚠️ That's an answer code. Scan the code on the phone of whoever created the game.", '⚠️ Ese es el código de respuesta. Lee el código que sale en el móvil de quien ha creado la partida.')
      : cod === 'oferta' ? t('⚠️ Esse é o código de criar partida. Leia o código que o OUTRO celular mostra depois de ler o seu.', "⚠️ That's a create-game code. Scan the code the OTHER phone shows after scanning yours.", '⚠️ Ese es el código para crear la partida. Lee el código que enseña el OTRO móvil después de leer el tuyo.')
      : cod === 'outro' ? t('⚠️ Esse código é da Batalha Naval. Para o Quem é?, os dois abrem o Quem é?.', '⚠️ That code is from Sea Battle. For Who Is It?, both open Who Is It?.', '⚠️ Ese código es de Batalla Naval. Para jugar a ¿Quién es?, abrid ¿Quién es? en los dos.')
      : t('⚠️ Esse não é um código do Quem é?. Aponte para o quadrado preto e branco na tela do outro celular.', "⚠️ That's not a Who Is It? code. Point at the black and white square on the other phone.", '⚠️ Ese no es un código de ¿Quién es?. Apunta al cuadrado blanco y negro de la pantalla del otro móvil.');
  }
  function tentarDeNovo(s) { return function () { if (s.papel === 'criar') pertoCriar(s.nivel, s.religar); else pertoEntrar(s.religar); }; }
  function voltarDoPerto(s) { return function () { perto = s; cancelarPerto(); }; }
  function erroPerto(s, e) {
    if (perto !== s) return;
    perto = null; limparPerto(s);
    var semRede = e && e.codigo === 'semrede';
    janelaAviso({ titulo: semRede ? t('📶 Este celular não está em nenhum Wi-Fi', '📶 This phone is not on any Wi-Fi', '📶 Este móvil no está conectado a ninguna wifi') : t('😕 Não deu para preparar a ligação', "😕 Couldn't prepare the link", '😕 No se ha podido preparar la conexión'),
      texto: semRede ? t('Ligue o Roteador Wi-Fi (Ponto de acesso) neste celular, ou conecte no Wi-Fi do outro, e tente de novo.', "Turn on this phone's Wi-Fi hotspot, or join the other one's Wi-Fi, and try again.", 'Activa el punto de acceso wifi (compartir conexión) en este móvil, o conéctate a la wifi del otro, y vuelve a intentarlo.')
        : e && e.codigo === 'lixo' ? t('O código lido não funcionou. Tentem de novo do começo.', "The scanned code didn't work. Try again from the start.", 'El código leído no ha funcionado. Volved a intentarlo desde el principio.') : t('Tente de novo. Se continuar, feche e abra o jogo de novo.', 'Try again. If it keeps happening, close and reopen the game.', 'Vuelve a intentarlo. Si sigue pasando, cierra el juego y ábrelo otra vez.'),
      botoes: [{ t: t('🔄 Tentar de novo', '🔄 Try again', '🔄 Volver a intentarlo'), fn: tentarDeNovo(s) }, { t: t('Voltar', 'Back', 'Volver'), fn: voltarDoPerto(s) }] });
  }
  // não abriu a tempo (ou falhou): dizer o que costuma ser e deixar tentar de novo
  function falhouPerto(s) {
    if (perto !== s || s.conectou) return;
    perto = null; limparPerto(s);
    janelaAviso({ titulo: t('📡 Os celulares não se acharam', "📡 The phones couldn't find each other", '📡 Los móviles no se han encontrado'),
      texto: t('O que costuma ser: 1) os dois não estão no MESMO Wi-Fi: o outro precisa estar conectado no Roteador Wi-Fi deste celular (ou os dois no mesmo Wi-Fi); 2) Wi-Fi de avião, hotel, loja ou escola costuma não deixar um aparelho ver o outro: use o Roteador de um dos celulares; 3) o código lido era de uma tentativa anterior. Toquem em Tentar de novo nos dois.',
        "Usually: 1) the two are not on the SAME Wi-Fi: the other one must be joined to this phone's hotspot (or both on the same Wi-Fi); 2) plane, hotel, shop or school Wi-Fi often stops devices from seeing each other: use one phone's hotspot; 3) the scanned code was from an earlier try. Tap Try again on both.", 'Lo normal es que: 1) los dos no estén en la MISMA wifi: el otro tiene que estar conectado al punto de acceso de este móvil (o los dos a la misma wifi); 2) la wifi de un avión, un hotel, una tienda o un colegio no suele dejar que un aparato vea al otro: usad el punto de acceso de uno de los móviles; 3) el código leído era de un intento anterior. Tocad Volver a intentarlo en los dos.'),
      botoes: [{ t: t('🔄 Tentar de novo', '🔄 Try again', '🔄 Volver a intentarlo'), fn: tentarDeNovo(s) }, { t: t('Voltar', 'Back', 'Volver'), fn: voltarDoPerto(s) }] });
  }
  function conectou(s, cx) {
    if (perto !== s) { cx.fechar(); return; }
    s.conectou = true; perto = null; limparPerto(s);
    Som.gosma(); if (navigator.vibrate) try { navigator.vibrate([40, 40, 40]); } catch (e) { /* ok */ }
    manterTelaAcesa(true);
    if (s.religar && sala === s.religar) {          // ligou de novo: a mesma partida continua de onde parou
      abrirCanal('PERTO', cx);
      mostrar(s.volta); if (s.volta === 'jogo') { pintar(); dizer(t('📶 Ligados de novo!', '📶 Linked again!', '📶 ¡Conectados otra vez!')); }
      redeMudou();
      return;
    }
    modo = 'rede';
    conectar('PERTO', { id: REDE.idNovo(), codigo: 'PERTO', host: s.papel === 'criar', nivel: s.nivel, semente: Math.floor(Math.random() * 4e9), corpo: !!pref.corpo, conexao: cx });
    $('redeInicio').hidden = true; $('redeSala').hidden = true;
    $('redeStatus').textContent = t('🔗 Ligados! Começando…', '🔗 Linked! Starting…', '🔗 ¡Conectados! Empezando…');
    if (atual !== 'rede' && !(sala && sala.partida && sala.temOutro())) mostrar('rede');
  }
  // a ligação direta caiu no meio: avisar e oferecer ligar de novo (precisa trocar os códigos de novo)
  function caiuPerto(minha) {
    if (sala !== minha) return;
    var velho = canal; canal = null; if (velho) try { velho.fechar(); } catch (e) { /* ok */ }
    manterTelaAcesa(false);
    if ((partida && partida.estado.fase === 'fim') || perto) return;
    var criei = minha.host();
    janelaAviso({ titulo: t('📡 A ligação com o outro celular caiu', '📡 The link to the other phone dropped', '📡 Se ha cortado la conexión con el otro móvil'),
      texto: (criei ? t('Para continuar de onde parou, toque em Ligar de novo e mostre o código novo; no outro celular, tocar em Ligar de novo e ler o código.', 'To go on where you stopped, tap Link again and show the new code; on the other phone, tap Link again and scan it.', 'Para seguir donde lo habíais dejado, toca Volver a conectar y enseña el código nuevo; en el otro móvil, tocad Volver a conectar y leed el código.')
        : t('Para continuar de onde parou, toque em Ligar de novo e leia o código novo que vai aparecer no celular de quem criou a partida (lá também tocam em Ligar de novo).', "To go on where you stopped, tap Link again and scan the new code that will show on the creator's phone (they tap Link again too).", 'Para seguir donde lo habíais dejado, toca Volver a conectar y lee el código nuevo que saldrá en el móvil de quien ha creado la partida (allí también tocan Volver a conectar).'))
        + ' ' + t('Os dois precisam continuar no mesmo Wi-Fi.', 'Both need to stay on the same Wi-Fi.', 'Los dos tenéis que seguir en la misma wifi.'),
      botoes: [{ t: t('🔁 Ligar de novo', '🔁 Link again', '🔁 Volver a conectar'), fn: function () { if (sala !== minha) return; if (criei) pertoCriar(minha.nivel || nivel, minha); else pertoEntrar(minha); } },
        { t: t('🚪 Sair da partida', '🚪 Leave game', '🚪 Salir de la partida'), fn: voltarInicio }] });
  }

  // ---------- música (trilha comum dos jogos): instrumentos de verdade, nada de videogame ----------
  var MUSICAS = [
    { a: '../rabiscolandia/musicas/fluffing-a-duck.mp3', t: 'Fluffing a Duck', au: 'Kevin MacLeod', lic: 'CC BY 4.0' },
    { a: '../rabiscolandia/musicas/investigations.mp3', t: 'Investigations', au: 'Kevin MacLeod', lic: 'CC BY 4.0' },
    { a: '../rabiscolandia/musicas/music-to-delight.mp3', t: 'Music to Delight', au: 'Kevin MacLeod', lic: 'CC BY' },
    { a: '../rabiscolandia/musicas/life-of-riley.mp3', t: 'Life of Riley', au: 'Kevin MacLeod', lic: 'CC BY 4.0' },
    { a: '../rabiscolandia/musicas/sneaky-snitch.mp3', t: 'Sneaky Snitch', au: 'Kevin MacLeod', lic: 'CC BY' },
    { a: '../rabiscolandia/musicas/carefree.mp3', t: 'Carefree', au: 'Kevin MacLeod', lic: 'CC BY 4.0' },
    { a: '../rabiscolandia/musicas/batty-mcfaddin.mp3', t: 'Batty McFaddin', au: 'Kevin MacLeod', lic: 'CC BY' },
    { a: '../peluqueria/musicas/feelin-good.mp3', t: 'Feelin Good', au: 'Kevin MacLeod', lic: 'CC BY 4.0' },
    { a: '../peluqueria/musicas/stringed-disco.mp3', t: 'Stringed Disco', au: 'Kevin MacLeod', lic: 'CC BY 4.0' },
    { a: '../baguncolandia/musicas/ukulele-song.mp3', t: 'Ukulele Song', au: 'Rafael Krux', lic: 'CC0' },
    { a: '../baguncolandia/musicas/my-giant-bunny-friend.mp3', t: 'My Giant Bunny Friend', au: 'Bryan Teoh', lic: 'CC0' },
    { a: '../baguncolandia/musicas/happy-whistling-ukulele.mp3', t: 'Happy Whistling Ukulele', au: 'Rafael Krux', lic: 'CC0' }
  ];
  if (window.Trilha && !TESTE) window.Trilha.iniciar({ jogo: 'quem-e', musicas: MUSICAS, creditos: 'CREDITOS.md' });

  // ---------- instalar e service worker ----------
  var pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); pedidoInstalar = e; $('btInstalar').hidden = false; });
  $('btInstalar').addEventListener('click', function () { if (!pedidoInstalar) return; pedidoInstalar.prompt(); pedidoInstalar.userChoice.then(function () { pedidoInstalar = null; $('btInstalar').hidden = true; }); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !TESTE) navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });

  pintarMelecas(); pintarBotoes(); traduzir();
  // convite: ?sala=ABCD entra direto na partida
  (function () { var m = /[?&]sala=([A-Za-z]{4})\b/.exec(location.search); if (m) entrarSala(m[1]); })();

  // peças para a segunda brincadeira (adivinha-tela.js)
  window.QEApp = {
    t: t, en: en, pref: pref, salvarPref: salvarPref, mostrar: mostrar, falar: falar, calar: calar, Som: Som, festa: festa, limparFesta: limparFesta,
    melecaSvg: melecaSvg, nomeMeleca: nomeMeleca, zoeira: zoeira, oiMeleca: oiMeleca, voz: voz, telaCheia: telaCheia, atual: function () { return atual; }, TESTE: TESTE, CALMO: CALMO
  };
  $('btAdivinha').addEventListener('click', function () { mostrar('nivelAdivinha'); });

  // usado pelos testes
  window.QEDebug = {
    pronto: true, versao: APP_VERSION, MUSICAS: MUSICAS,
    aguardando: function () { return partida && partida.aguardando(); },
    estado: function () { return partida && partida.estado; },
    respostaCerta: function () { var a = partida.aguardando(); return L.responder(partida.tabuleiro.caras[partida.estado.segredos[a.jogador]], partida.estado.ultima.pergunta); },
    quantasDescartar: function () { return partida.quantasDescartar(quemVe()); },
    temSala: function () { return !!sala; },
    // Jogar pertinho: o mesmo caminho da câmera quando ela lê um código; e o que está na tela agora
    lerCodigo: function (txt) { return lerCodigo(txt); },
    perto: function () { return perto ? { papel: perto.papel, codigo: perto.codigo || null, qr: perto.qr || null, etapa: perto.etapa } : null; },
    sala: function () { return sala ? { perto: !!sala.perto, ligado: !!canal, host: sala.host(), eu: sala.eu } : null; }
  };
})();

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer jogar não baixa nada a mais. */
(function () {
  if (!/[?&]instalar\b/.test(location.search) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.src = '../instalar.js';
  document.body.appendChild(s);
})();
