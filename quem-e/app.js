/* Quem é? — a tela do Duelo de Caras: escolher a meleca, o modo e o nível, escolher o segredo, perguntar, responder,
   descartar, dar o palpite, lupa, cortina do "passando o aparelho", fim, sons, voz e música.
   As regras ficam em partida.js e logica.js; os desenhos em caras.js e melecas.js.
   Guarda só neste aparelho (localStorage "bolinho:quem-e:pref"): idioma, sons, voz e a meleca escolhida. */
(function () {
  'use strict';
  var APP_VERSION = '0.1.0';
  var APP_DATA = '14/Nov/2026', APP_DATA_EN = 'Nov/14/2026';
  var L = window.QELogica, QP = window.QEPartida, CARAS = window.QECaras, MEL = window.QEMelecas, REDE = window.QERede;
  var $ = function (id) { return document.getElementById(id); };
  var CALMO = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var TESTE = /[?&]teste\b/.test(location.search);
  var ESPERA = TESTE ? { responder: 10, pensar: 10, falar: 10 } : { responder: 1100, pensar: 1600, falar: 1400 };

  function ler(k, padrao) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem espaço: segue sem guardar */ } }
  var pref = ler('bolinho:quem-e:pref', null) || {};
  if (pref.lingua !== 'en' && pref.lingua !== 'pt') pref.lingua = (navigator.language || 'pt').slice(0, 2) === 'pt' ? 'pt' : 'en';
  if (window.BolinhoIdioma && !BolinhoIdioma.ingles()) pref.lingua = 'pt';   // só português sem o interruptor "ingles" (../idioma.js)
  if (typeof pref.efeitos !== 'boolean') pref.efeitos = true;
  if (typeof pref.voz !== 'boolean') pref.voz = true;   // voz começa ligada (no Fácil ajuda quem ainda não lê)
  if (pref.meleca !== 'blue' && pref.meleca !== 'pink') pref.meleca = 'pink';
  function salvarPref() { gravar('bolinho:quem-e:pref', pref); }

  // ---------- idioma ----------
  function en() { return pref.lingua === 'en'; }
  function t(pt, ingl) { return en() ? ingl : pt; }
  function nomeMeleca() { return pref.meleca === 'blue' ? 'Melekento Blue' : 'Pink Honey'; }
  function traduzir() {
    document.documentElement.lang = en() ? 'en' : 'pt-BR';
    Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (el) { var p = el.getAttribute('data-t').split('|'); el.textContent = en() ? p[1] : p[0]; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-rotulo]'), function (el) { var p = el.getAttribute('data-rotulo').split('|'); var r = en() ? p[1] : p[0]; el.setAttribute('aria-label', r); el.title = r; });
    $('btLingua').textContent = en() ? 'PT' : 'EN';
    $('versao').textContent = t('Versão ', 'Version ') + APP_VERSION + ' · ' + (en() ? APP_DATA_EN : APP_DATA);
    $('txtMeleca').textContent = t('Contra a ', 'Against ') + nomeMeleca();
    $('balaoModos').textContent = t('Oba! Como vamos jogar?', 'Yay! How shall we play?');
    if (partida) pintar();
  }
  $('btLingua').addEventListener('click', function () { pref.lingua = en() ? 'pt' : 'en'; salvarPref(); traduzir(); });
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
  $('btVoz').addEventListener('click', function () { pref.voz = !pref.voz; salvarPref(); pintarBotoes(); if (pref.voz) falar(t('Voz ligada!', 'Voice on!')); else calar(); });

  // ---------- voz do aparelho (a meleca fala) ----------
  // Melekento Blue fala mais grosso e borbulhante; Pink Honey mais fininho. Sem voz no aparelho, segue só com texto.
  function falar(txt) {
    if (!pref.voz || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    try {
      var limpo = String(txt).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').trim();
      if (!limpo) return;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(limpo);
      u.lang = en() ? 'en-US' : 'pt-BR';
      u.rate = pref.meleca === 'blue' ? 1.0 : 1.08; u.pitch = pref.meleca === 'blue' ? 0.75 : 1.5;
      if (window.Trilha) { Trilha.volume(0.3); u.onend = u.onerror = function () { setTimeout(function () { try { if (!speechSynthesis.speaking) Trilha.volume(null); } catch (e) { /* ok */ } }, 150); }; }
      setTimeout(function () { try { speechSynthesis.speak(u); } catch (e) { /* sem voz */ } }, 60);
    } catch (e) { /* sem voz */ }
  }
  function calar() { try { speechSynthesis.cancel(); } catch (e) { /* ok */ } }

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
    dentro = false; clearTimeout(timerMeleca); calar(); sairDaSala(); partida = null; fecharSobreposicoes(); mostrar('inicio');
    setTimeout(function () { $(pref.meleca === 'blue' ? 'btBlue' : 'btPink').focus(); }, 30);
  }
  window.addEventListener('popstate', function () { if (dentro) aoVoltar(); });
  if (window.BolinhoNav) BolinhoNav.iniciar({ jogo: 'quem-e', noInicio: function () { return atual === 'inicio'; }, irParaInicio: voltarInicio,
    emAndamento: function () { return !!partida && partida.estado.fase === 'jogo'; } });
  function fecharSobreposicoes() { $('fim').hidden = true; $('cortina').hidden = true; limparFesta(); }

  // ---------- começo: meleca, modo, nível ----------
  var modo = 'meleca', nivel = 'facil', partida = null;
  ['btBlue', 'btPink'].forEach(function (id) {
    $(id).addEventListener('click', function () {
      pref.meleca = $(id).getAttribute('data-meleca'); salvarPref(); pintarMelecas(); traduzir(); Som.gosma();
      falar(pref.meleca === 'blue' ? t('Oi! Eu sou o Melekento Blue!', "Hi! I'm Melekento Blue!") : t('Oi! Eu sou a Pink Honey!', "Hi! I'm Pink Honey!"));
      mostrar('modos');
    });
  });
  $('btMeleca').addEventListener('click', function () { modo = 'meleca'; mostrar('niveis'); });
  $('btPassar').addEventListener('click', function () { modo = 'passar'; mostrar('niveis'); });
  $('btRede').addEventListener('click', function () { modo = 'rede'; telaRede(); });
  Array.prototype.forEach.call(document.querySelectorAll('.nivel'), function (b) {
    b.addEventListener('click', function () { nivel = b.getAttribute('data-nivel'); if (modo === 'rede') criarSala(); else novaPartida(); telaCheia(); });
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
    for (var c = 1; c <= n; c++) {
      var lin = Math.ceil(n / c), w = Math.min((W - gap * (c - 1)) / c, ((H - gap * (lin - 1)) / lin) / 1.38);
      if (w > melhor) { melhor = w; colunas = c; }
    }
    melhor = Math.max(30, Math.floor(melhor));
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
    caixa.innerHTML = CARAS.svg(c, { id: 'lupa', grande: true }) + '<p class="lupa-nome"></p><button type="button" class="grande lupa-fechar"></button>';
    caixa.querySelector('.lupa-nome').textContent = c.nome;
    var bt = caixa.querySelector('.lupa-fechar'); bt.textContent = t('Fechar', 'Close');
    var j = SolverJanela.abrir({ conteudo: caixa, classe: 'qe-janela' });
    bt.addEventListener('click', function () { j.fechar('ok'); });
  }

  // ---------- partida ----------
  var escolhido = null, quemSegura = 0, palpiteSel = null, autoDescartou = false, timerMeleca = null;
  function novaPartida() {
    clearTimeout(timerMeleca); fecharSobreposicoes();
    var semente = TESTE ? 1234 : Math.floor(Math.random() * 1e9);
    partida = QP.criar({ modo: modo, nivel: nivel, semente: semente, rnd: TESTE ? L.sorteio(5) : Math.random });
    montarGrade($('gradeSegredo')); montarGrade($('tabuleiro'));
    quemSegura = 0; humorAtual = ''; humor('parada'); $('meuSegredo').removeAttribute('data-chave');
    irParaSegredo(0);
  }
  function nomeJogador(j) {
    if (modo === 'rede') return j === sala.eu ? t('Você', 'You') : t('A outra pessoa', 'The other player');
    if (modo === 'meleca') return j === 0 ? t('Você', 'You') : nomeMeleca();
    return t('Jogador ', 'Player ') + (j + 1);
  }

  function irParaSegredo(j) {
    escolhido = null; quemSegura = j; $('btSortear').disabled = false;
    $('tituloSegredo').textContent = modo === 'passar' ? nomeJogador(j) + t(': escolha o seu personagem secreto 🤫', ': pick your secret character 🤫') : t('Escolha o seu personagem secreto 🤫', 'Pick your secret character 🤫');
    pintarSegredo(); mostrar('segredo');
    if (modo === 'meleca') falar(t('Escolha o seu personagem secreto. Eu não vou olhar!', "Pick your secret character. I won't peek!"));
  }
  function pintarSegredo() {
    Array.prototype.forEach.call($('gradeSegredo').children, function (b) { b.classList.toggle('escolhida', +b.getAttribute('data-id') === escolhido); });
    var bt = $('btConfirmarSegredo');
    bt.disabled = escolhido === null;
    bt.textContent = escolhido === null ? t('Escolha uma cara', 'Pick a face') : t('🤫 Escolhi ', '🤫 I picked ') + partida.tabuleiro.caras[escolhido].nome;
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
    if (modo === 'meleca') { quemSegura = 0; falar(t('Pronto! Eu também escolhi o meu. Você começa!', 'Ready! I picked mine too. You go first!')); }
    pintar();
  }

  function tocarCarta(grade, id) {
    if (grade === 'gradeSegredo') { if (lupa) { abrirLupa(id); return; } escolhido = id; Som.virar(); pintarSegredo(); return; }
    if (!partida || partida.estado.fase !== 'jogo') return;
    if (lupa) { abrirLupa(id); return; }
    var a = partida.aguardando(), eu = quemVe();
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

  function textoPergunta(id) { var p = L.pergunta(id); return t(p.pt, p.en); }

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
    var ms = $('meuSegredo'), chave = e.segredos[eu] + '|' + pref.lingua;
    if (e.segredos[eu] !== null && ms.getAttribute('data-chave') !== chave) { ms.setAttribute('data-chave', chave); ms.innerHTML = caraMini(e.segredos[eu]) + '<span class="rotulo">' + escapar(t('Meu', 'Mine')) + '</span>';
      $('meuNome').textContent = t('Meu personagem: ', 'My character: ') + partida.tabuleiro.caras[e.segredos[eu]].nome; }
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
      bp.textContent = palpiteSel === null ? t('Escolha a cara', 'Pick the face') : t('É ', "It's ") + partida.tabuleiro.caras[palpiteSel].nome + '!';
    }
    if (!$('perguntas').hidden) pintarPerguntas();
    pintarBalao(a);
    if (e.fase === 'fim') mostrarFim();
    setTimeout(ajustarTudo, 0);
  }

  function pintarBalao(a) {
    if (!a) return;
    var b = $('balao');
    if (modo === 'rede') {
      if (!sala.outroAqui()) { b.textContent = t('📶 Esperando a outra pessoa voltar…', '📶 Waiting for the other player to come back…'); return; }
      if (a.jogador !== sala.eu) {
        b.textContent = a.acao === 'responder' ? t('Esperando a resposta…', 'Waiting for the answer…') : a.acao === 'veredito' ? b.textContent : t('Vez da outra pessoa. Espere um pouquinho…', "The other player's turn. Hang on…");
        humor('pensando'); return;
      }
    }
    if (modo === 'meleca' && a.jogador === 1) {
      if (a.acao === 'perguntar') { b.textContent = t('Hmm… deixa eu pensar 🤔', 'Hmm… let me think 🤔'); humor('pensando'); }
      return;
    }
    if (a.acao === 'perguntar') {
      b.textContent = modo === 'meleca' ? t('Sua vez! Pergunte ou dê o seu palpite.', 'Your turn! Ask or make your guess.') : nomeJogador(a.jogador) + t(', sua vez!', ", it's your turn!");
      humor('parada');
    } else if (a.acao === 'descartar' && modo === 'passar') {
      b.textContent = nomeJogador(a.jogador) + t(', descarte quem não serve.', ', flip down who doesn\'t fit.');
    }
  }

  function pintarResponder(a) {
    var p = partida.estado.ultima.pergunta;
    var quem = modo !== 'meleca' ? nomeJogador(1 - a.jogador) + t(' quer saber:', ' wants to know:')
      : pref.meleca === 'blue' ? t('O Melekento Blue quer saber:', 'Melekento Blue wants to know:') : t('A Pink Honey quer saber:', 'Pink Honey wants to know:');
    $('pergFeita').innerHTML = '';
    var q = document.createElement('span'); q.className = 'quem'; q.textContent = quem;
    var tx = document.createElement('strong'); tx.textContent = L.pergunta(p).ico + ' ' + textoPergunta(p);
    $('pergFeita').appendChild(q); $('pergFeita').appendChild(tx);
  }

  function pintarDescartar(eu) {
    var e = partida.estado, p = L.pergunta(e.ultima.pergunta), r = e.ultima.resposta;
    $('respVeio').textContent = (r ? t('Resposta: Sim! 👍 ', 'Answer: Yes! 👍 ') : t('Resposta: Não! 👎 ', 'Answer: No! 👎 ')) + t(p.pt, p.en);
    var qtd = partida.quantasDescartar(eu), bt = $('btDescartar');
    if (nivel === 'facil' && !autoDescartou) {
      autoDescartou = true;
      if (qtd) { partida.descartarTodos(eu); Som.virar(); setTimeout(pintar, 0); return; }
    }
    if (nivel === 'facil') { bt.hidden = true; return; }
    bt.hidden = false;
    bt.disabled = !qtd;
    bt.textContent = qtd ? '🗑️ ' + textoDescarte(p, r) : t('Nenhuma para descartar', 'Nothing to flip down');
  }
  // "Descartar quem tem cabelo comprido" (a resposta foi Não) / "Descartar quem não tem cabelo comprido" (foi Sim)
  function textoDescarte(p, r) {
    var cor = /^roupa-/.test(p.id) ? p.pt.replace(/^A roupa é (.*)\?$/, 'está de roupa $1') : null;
    var pred = cor || (p.pt.charAt(0).toLowerCase() + p.pt.slice(1)).replace(/\?$/, '');
    return t((r ? 'Descartar quem não ' : 'Descartar quem ') + pred, 'Flip down everyone who doesn\'t fit');
  }

  // ---------- perguntar ----------
  var GRUPOS = [['quem', '👤 Quem é', '👤 Who'], ['cabelo', '💇 Cabelo', '💇 Hair'], ['rosto', '👀 Rosto', '👀 Face'], ['cabeca', '🎩 Na cabeça', '🎩 On the head'], ['joias', '💎 Joias', '💎 Jewelry'], ['roupa', '👕 Roupa', '👕 Clothes']];
  $('btPerguntar').addEventListener('click', function () { $('perguntas').hidden = false; pintar(); $('listaPerguntas').scrollTop = 0; });
  $('btFecharPerguntas').addEventListener('click', function () { fecharPainelPerguntas(); pintar(); });
  function fecharPainelPerguntas() { $('perguntas').hidden = true; }
  function pintarPerguntas() {
    var eu = quemVe(), e = partida.estado, lista = $('listaPerguntas'), vivas = e.dePe[eu].filter(Boolean).length;
    lista.innerHTML = '';
    GRUPOS.forEach(function (g) {
      var ps = L.PERGUNTAS.filter(function (p) { return p.grupo === g[0] && partida.tabuleiro.perguntas.indexOf(p.id) >= 0; });
      if (!ps.length) return;
      var h = document.createElement('h3'); h.textContent = t(g[1], g[2]); lista.appendChild(h);
      ps.forEach(function (p) {
        var feita = e.feitas[eu].indexOf(p.id) >= 0, u = L.utilidade(partida.tabuleiro.caras, e.dePe[eu], p.id), inutil = !feita && (u === 0 || u === vivas);
        if (nivel === 'facil' && (inutil || feita)) return;
        var linha = document.createElement('div'); linha.className = 'perg';
        var b = document.createElement('button'); b.type = 'button'; b.className = 'pergunta' + (inutil ? ' inutil' : '') + (feita ? ' feita' : '');
        b.disabled = feita;
        if (!feita) b.setAttribute('data-p', p.id);
        b.innerHTML = '<span class="p-ico" aria-hidden="true"></span><span class="p-txt"></span>';
        b.querySelector('.p-ico').textContent = feita ? '✓' : p.ico;
        b.querySelector('.p-txt').textContent = t(p.pt, p.en) + (inutil ? t(' · essa não ajuda mais', " · won't help now") : '');
        b.addEventListener('click', function () { perguntar(p.id); });
        var o = document.createElement('button'); o.type = 'button'; o.className = 'ouvir mini'; o.textContent = '🔊';
        o.setAttribute('aria-label', t('Ouvir: ', 'Listen: ') + t(p.pt, p.en));
        o.addEventListener('click', function () { var v = pref.voz; pref.voz = true; falar(t(p.pt, p.en)); pref.voz = v; });
        linha.appendChild(b); linha.appendChild(o); lista.appendChild(linha);
      });
    });
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
      var s = document.createElement('span'); s.textContent = t('Olha de novo o seu personagem com calma: ', 'Take another look at your character: ') + textoPergunta(partida.estado.ultima.pergunta);
      o.appendChild(s);
      Som.erro(); humor('ops');
      falar(t('Olha de novo com calma!', 'Take another look!'));
      return;
    }
    $('olhaDeNovo').hidden = true;
    if (r) Som.sim(); else Som.nao();
    if (modo === 'meleca') $('balao').textContent = r ? t('Sim! Anotado 📝', 'Yes! Got it 📝') : t('Não! Anotado 📝', 'No! Got it 📝');
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
    var r = modo === 'rede' ? (sala.agir('palpite', { c: id }), { pendente: true }) : partida.palpite(eu, id);
    if (r.pendente) { $('balao').textContent = t('Será que é ', 'Could it be ') + nome + t('? Esperando a resposta…', '? Waiting for the answer…'); falar(t('Será que é ', 'Could it be ') + nome + '?'); }
    else if (!r.acertou) {
      Som.erro(); humor(modo === 'meleca' ? 'feliz' : 'ops');
      $('balao').textContent = t('Não é ', "It's not ") + nome + '! 😅';
      falar(t('Não é ', "It's not ") + nome + '!');
    }
    pintar(); agendarMeleca();
  });

  // ---------- a vez da meleca ----------
  function agendarMeleca() {
    clearTimeout(timerMeleca);
    if (modo !== 'meleca' || !partida || partida.estado.fase !== 'jogo') return;
    var a = partida.aguardando(); if (!a || a.jogador !== 1) return;
    timerMeleca = setTimeout(jogadaMeleca, a.acao === 'responder' ? ESPERA.responder : ESPERA.pensar);
    if (a.acao === 'perguntar') { $('balao').textContent = t('Hmm… deixa eu pensar 🤔', 'Hmm… let me think 🤔'); humor('pensando'); }
  }
  function jogadaMeleca() {
    if (!partida || atual !== 'jogo') return;
    var r = partida.vezDaMeleca(); if (!r) return;
    var b = $('balao');
    if (r.tipo === 'resposta') {
      b.textContent = r.resposta ? t('Sim! 👍', 'Yes! 👍') : t('Não! 👎', 'No! 👎');
      humor('falando'); if (r.resposta) Som.sim(); else Som.nao();
      falar(r.resposta ? t('Sim!', 'Yes!') : t('Não!', 'No!'));
    } else if (r.tipo === 'pergunta') {
      b.textContent = t('Minha vez! ', 'My turn! ') + textoPergunta(r.id);
      humor('falando'); Som.gosma(); falar(t('Minha vez! ', 'My turn! ') + textoPergunta(r.id));
    } else if (r.tipo === 'descartou') {
      var resta = partida.estado.dePe[1].filter(Boolean).length;
      b.textContent = t('Virei ', 'I flipped ') + r.ids.length + t(' no meu tabuleiro. Ainda tenho ', ' on my board. I still have ') + resta + t(' de pé. Sua vez!', ' standing. Your turn!');
      humor('parada');
    } else if (r.tipo === 'palpite') {
      var nome = partida.tabuleiro.caras[r.idCara].nome;
      if (!r.acertou) { b.textContent = t('Acho que é ', 'I think it\'s ') + nome + t('… errei! 😅 Sua vez.', '… wrong! 😅 Your turn.'); humor('ops'); Som.erro(); falar(t('É o ', 'Is it ') + nome + t('? Ah, errei!', '? Oh, wrong!')); }
    }
    pintar(); agendarMeleca();
  }

  // ---------- cortina (passando o aparelho) ----------
  var depoisCortina = null;
  function cortina(j, depois) {
    quemSegura = -1; depoisCortina = function () { quemSegura = j; depois(); };
    $('cortinaTitulo').textContent = t('Passe o aparelho para ', 'Pass the device to ') + nomeJogador(j);
    $('cortinaTexto').textContent = t('Sem espiar o tabuleiro do outro! 🙈', "No peeking at the other board! 🙈");
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
      ? (v === sala.eu ? t('Você acertou! 🎉 Era ', 'You got it! 🎉 It was ') + alvo + '!' : t('A outra pessoa acertou! Era ', 'The other player got it! It was ') + alvo + '.')
      : modo === 'meleca'
      ? (v === 0 ? t('Você acertou! 🎉 Era ', 'You got it! 🎉 It was ') + alvo + '!' : t('Eu acertei! Era ', 'I got it! It was ') + alvo + t('! Quer a revanche?', '! Want a rematch?'))
      : nomeJogador(v) + t(' ganhou! 🎉 Era ', ' wins! 🎉 It was ') + alvo + '!';
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
  $('btOutroNivel').addEventListener('click', function () { $('fim').hidden = true; limparFesta(); partida = null; mostrar('niveis'); });

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
  var sala = null, canal = null, relogio = null, CH_REDE = 'bolinho:quem-e:rede';
  function lerSessao() { try { var v = sessionStorage.getItem(CH_REDE); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function gravarSessao(v) { try { if (v) sessionStorage.setItem(CH_REDE, JSON.stringify(v)); else sessionStorage.removeItem(CH_REDE); } catch (e) { /* sem espaço */ } }
  function enderecoSala(cod) {
    try { var u = new URL(location.href); if (cod) u.searchParams.set('sala', cod); else u.searchParams.delete('sala'); history.replaceState(history.state, '', u.pathname + u.search + u.hash); } catch (e) { /* ok */ }
  }
  function telaRede() {
    sairDaSala();
    $('redeInicio').hidden = false; $('redeSala').hidden = true; $('codigo').value = '';
    $('redeStatus').textContent = navigator.onLine === false ? t('📡 Sem internet agora. Sem internet, jogue "Passando o aparelho" ou contra a meleca.', '📡 No internet right now. Offline, play "Pass the device" or against the slime.') : '';
    mostrar('rede');
  }
  $('btCriarSala').addEventListener('click', function () { mostrar('niveis'); });
  $('btEntrarSala').addEventListener('click', function () { entrarSala($('codigo').value); });
  $('codigo').addEventListener('keydown', function (e) { if (e.key === 'Enter') entrarSala(this.value); });
  $('codigo').addEventListener('input', function () { this.value = this.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); });
  $('btConvidar').addEventListener('click', function () {
    var link = location.origin + location.pathname + '?sala=' + sala.codigo;
    var txt = t('Vamos jogar Quem é? Entre na partida ', "Let's play Who Is It? Join game ") + sala.codigo + ': ' + link;
    if (navigator.share) navigator.share({ title: 'Quem é?', text: txt }).catch(function () {});
    else window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank', 'noopener');
  });

  function criarSala() {
    var codigo = REDE.codigoNovo(), semente = Math.floor(Math.random() * 4e9);
    conectar(codigo, { id: REDE.idNovo(), codigo: codigo, host: true, nivel: nivel, semente: semente });
    $('redeInicio').hidden = true; $('redeSala').hidden = false; $('codigoSala').textContent = codigo;
    $('redeStatus').textContent = t('Esperando alguém entrar com o código…', 'Waiting for someone to join with the code…');
    mostrar('rede');
  }
  function entrarSala(cod) {
    cod = String(cod || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (cod.length !== 4) { $('redeStatus').textContent = t('O código tem 4 letras. Confira e tente de novo.', 'The code has 4 letters. Check it and try again.'); return; }
    modo = 'rede';
    var guardado = lerSessao();
    conectar(cod, guardado && guardado.codigo === cod ? { dados: guardado.dados } : { id: REDE.idNovo(), codigo: cod, host: false });
    $('redeStatus').textContent = t('Procurando a partida ', 'Looking for game ') + cod + '…';
    if (atual !== 'rede') mostrar('rede');
  }
  function conectar(codigo, op) {
    sala = REDE.criar({
      id: op.id, codigo: codigo, host: op.host, nivel: op.nivel, semente: op.semente, dados: op.dados,
      mandar: function (m) { if (canal) canal.mandar(m); },
      salvar: function (d) { gravarSessao({ codigo: codigo, dados: d }); },
      aoMudar: redeMudou
    });
    enderecoSala(codigo);
    abrirCanal(codigo);
    clearInterval(relogio); relogio = setInterval(function () { if (sala) sala.tique(); }, 500);
    if (sala.partida) redeMudou();
  }
  function abrirCanal(codigo) {
    var minha = sala;
    REDE.abrir(codigo, function (m) { if (sala === minha) minha.receber(m); }, function () { if (sala === minha) setTimeout(function () { if (sala === minha) abrirCanal(codigo); }, 2000); })
      .then(function (c) { if (sala !== minha) { c.fechar(); return; } canal = c; minha.tique(); })
      .catch(function () {
        if (sala !== minha) return;
        $('redeStatus').textContent = t('📡 Não deu para conectar. Confira a internet: vou tentar de novo.', "📡 Couldn't connect. Check the internet: trying again.");
        setTimeout(function () { if (sala === minha) abrirCanal(codigo); }, 4000);
      });
  }
  function sairDaSala() {
    if (!sala) return;
    try { sala.sair(); } catch (e) { /* ok */ }
    clearInterval(relogio); relogio = null;
    if (canal) { var c = canal; setTimeout(function () { c.fechar(); }, 300); }
    canal = null; sala = null;
    gravarSessao(null); enderecoSala(null);
  }
  function redeMudou() {
    if (!sala) return;
    if (sala.cheia()) { $('redeStatus').textContent = t('Essa partida já tem dois jogadores. Peça um código novo.', 'That game already has two players. Ask for a new code.'); return; }
    if (sala.partida && partida !== sala.partida && sala.temOutro()) {
      partida = sala.partida; nivel = partida.nivel;
      montarGrade($('gradeSegredo')); montarGrade($('tabuleiro'));
      humorAtual = ''; humor('parada'); $('meuSegredo').removeAttribute('data-chave'); fimMostrado = false;
      var e = partida.estado;
      if (e.segredos[sala.eu] === null) { irParaSegredo(sala.eu); return; }
      if (e.fase === 'segredo') { irParaSegredo(sala.eu); esperarOutroSegredo(); return; }
      comecarJogo(); return;
    }
    if (!partida) return;
    if (atual === 'segredo' && partida.estado.fase !== 'segredo') { comecarJogo(); return; }
    if (atual === 'jogo') pintar();
    if (partida.estado.fase === 'fim') mostrarFim();
  }
  function esperarOutroSegredo() {
    $('tituloSegredo').textContent = t('Pronto! Esperando a outra pessoa escolher… 🤫', 'Done! Waiting for the other player to pick… 🤫');
    $('btConfirmarSegredo').disabled = true; $('btSortear').disabled = true;
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

  // usado pelos testes
  window.QEDebug = {
    pronto: true, versao: APP_VERSION, MUSICAS: MUSICAS,
    aguardando: function () { return partida && partida.aguardando(); },
    estado: function () { return partida && partida.estado; },
    respostaCerta: function () { var a = partida.aguardando(); return L.responder(partida.tabuleiro.caras[partida.estado.segredos[a.jogador]], partida.estado.ultima.pergunta); },
    quantasDescartar: function () { return partida.quantasDescartar(quemVe()); }
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
