/* Cozinha — telas, vila (mini-jogos de cada lugar), cesta, cozinha passo a passo, receita pronta e progresso.
   Regras sem tela ficam em logica.js; receitas, lugares e níveis em dados.js; desenhos em desenhos.js.
   Guarda só neste aparelho: preferências ("bolinho:cozinha:pref") e receitas feitas com as estrelas
   ("bolinho:cozinha:progresso"), em localStorage, sempre com try/catch.
   ?teste no endereço: tempos de espera bem curtos e frutas já maduras (usado pelos testes automáticos). */
(function () {
  'use strict';
  var APP_VERSION = '0.2.0';
  var APP_UPDATED = '06/Nov/2026';
  var D = window.CozinhaDados, L = window.CozinhaLogica, ART = window.CozinhaDesenhos;
  var RAPIDO = /[?&]teste\b/.test(location.search);
  var V = RAPIDO ? 0.12 : 1;   // multiplica os tempos de espera
  function $(id) { return document.getElementById(id); }
  function qs(el, s) { return el.querySelector(s); }
  function qsa(el, s) { return Array.prototype.slice.call(el.querySelectorAll(s)); }
  function icone(id) { return ART.icone(id); }
  function emojiDe(id) { var x = D.ingrediente[id] || D.utensilio[id]; return x && x.e ? x.e + ' ' : ''; }
  function embaralhar(l) { var a = l.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }

  // ---------- preferências, idioma e progresso ----------
  var CH_PREF = 'bolinho:cozinha:pref', CH_PROG = 'bolinho:cozinha:progresso';
  function ler(k, padrao) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  var pref = ler(CH_PREF, {}) || {};
  if (pref.lingua !== 'en' && pref.lingua !== 'pt') pref.lingua = (navigator.language || 'pt').slice(0, 2) === 'en' ? 'en' : 'pt';
  if (typeof pref.voz !== 'boolean') pref.voz = true;
  if (typeof pref.efeitos !== 'boolean') pref.efeitos = true;
  if (!D.nivel[pref.nivel]) pref.nivel = 'facil';
  function salvarPref() { gravar(CH_PREF, pref); }
  var prog = ler(CH_PROG, null);
  if (!prog || typeof prog !== 'object' || !prog.r) prog = { r: {} };
  function estrelasDe(rec, nivel) { return (prog.r[rec] && prog.r[rec][nivel]) || 0; }
  function salvarProgresso(rec, nivel, est) {
    prog.r[rec] = prog.r[rec] || {};
    prog.r[rec][nivel] = Math.max(prog.r[rec][nivel] || 0, est);
    prog.feitas = (prog.feitas || 0) + 1;
    gravar(CH_PROG, prog);
  }

  function en() { return pref.lingua === 'en'; }
  function t(pt, ing) { return en() ? ing : pt; }
  function tx(o) { return en() ? o.en : o.pt; }
  function traduzir() {
    document.documentElement.lang = en() ? 'en' : 'pt-BR';
    qsa(document, '[data-t]').forEach(function (el) { var p = el.getAttribute('data-t').split('|'); el.textContent = en() ? p[1] : p[0]; });
    $('btLingua').textContent = en() ? 'PT' : 'EN';
    $('versao').textContent = t('Versão ', 'Version ') + APP_VERSION + ' · ' + (en() ? 'Nov/06/2026' : APP_UPDATED) +
      t(' · Músicas: Kevin MacLeod (incompetech.com), CC BY · ', ' · Music: Kevin MacLeod (incompetech.com), CC BY · ');
    var a = document.createElement('a'); a.href = 'CREDITOS.md'; a.target = '_blank'; a.rel = 'noopener'; a.textContent = t('créditos', 'credits'); $('versao').appendChild(a);
    $('btVoz').setAttribute('aria-pressed', String(pref.voz)); $('btEfeitos').setAttribute('aria-pressed', String(pref.efeitos));
    $('btEfeitos').textContent = pref.efeitos ? '🔔' : '🔕';
  }

  // ---------- sons (feitos na hora, sem arquivo) e voz ----------
  var Som = (function () {
    var ctx = null;
    function c() { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; }
    function nota(f, ini, dur, tipo, vol) {
      var a = c(); if (!a) return;
      var o = a.createOscillator(), g = a.createGain(), t0 = a.currentTime + ini;
      o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t0);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + dur + 0.05);
    }
    var SONS = {
      pega: function () { nota(660, 0, 0.12, 'triangle'); nota(990, 0.08, 0.16, 'triangle'); },
      ok: function () { nota(523, 0, 0.14); nota(659, 0.1, 0.14); nota(784, 0.2, 0.22); },
      erro: function () { nota(240, 0, 0.18, 'triangle', 0.12); nota(200, 0.14, 0.22, 'triangle', 0.1); },
      toque: function () { nota(880, 0, 0.06, 'square', 0.05); },
      moeda: function () { nota(1320, 0, 0.08, 'square', 0.06); nota(1760, 0.07, 0.12, 'square', 0.06); },
      fisgou: function () { for (var i = 0; i < 5; i++) nota(1400 - i * 90, i * 0.05, 0.04, 'square', 0.04); },
      agua: function () { nota(700, 0, 0.09, 'sine', 0.12); nota(420, 0.05, 0.16, 'sine', 0.1); },
      fim: function () { [523, 659, 784, 1047, 784, 1047].forEach(function (f, i) { nota(f, i * 0.12, 0.25, 'triangle', 0.16); }); }
    };
    return { toca: function (n) { if (pref.efeitos && SONS[n]) try { SONS[n](); } catch (e) { /* sem som */ } }, acordar: c };
  })();
  // jeito (opcional): rate, pitch, voz (uma voz do aparelho), fila (true = espera a fala anterior acabar).
  // Devolve a fala (SpeechSynthesisUtterance) ou null quando a voz está desligada ou o aparelho não fala.
  function falar(txt, jeito) {
    if (!pref.voz || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return null;
    try {
      var limpo = String(txt).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').trim();
      if (!limpo) return null;
      jeito = jeito || {};
      if (!jeito.fila) speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(limpo); u.lang = en() ? 'en-US' : 'pt-BR'; u.rate = jeito.rate || 0.95;
      if (jeito.pitch) u.pitch = jeito.pitch;
      if (jeito.voz) u.voice = jeito.voz;
      if (window.Trilha) { Trilha.volume(0.3); u.onend = u.onerror = soltarMusica; }
      speechSynthesis.speak(u);
      return u;
    } catch (e) { return null; /* sem voz */ }
  }
  // a música só volta ao normal quando ninguém mais está falando (as falas da vovó podem vir em fila)
  function soltarMusica() {
    setTimeout(function () { try { if (speechSynthesis.speaking || speechSynthesis.pending) return; } catch (e) { /* ok */ } Trilha.volume(null); }, 150);
  }
  // voz da Dona Cida (a vovozinha vizinha): uma voz feminina da língua do jogo, se o aparelho tiver; senão a voz padrão
  var vozes = [];
  function lerVozes() { try { vozes = speechSynthesis.getVoices() || []; } catch (e) { vozes = []; } }
  if (window.speechSynthesis) { lerVozes(); try { speechSynthesis.addEventListener('voiceschanged', lerVozes); } catch (e) { /* ok */ } }
  var FEMININA = /female|femin|mulher|woman|luciana|francisca|fernanda|vit[oó]ria|\bmaria\b|joana|raquel|helo[ií]sa|camila|thalita|leila|let[ií]cia|samantha|karen|victoria|zira|susan|serena|moira|tessa|fiona|allison|\bava\b|jenny|\baria\b|google portugu[eê]s|google us english|google uk english female/i;
  function vozDaVovo() {
    if (!vozes.length) lerVozes();
    var lg = en() ? 'en' : 'pt', certa = en() ? 'en-us' : 'pt-br';
    var norm = function (v) { return String(v.lang || '').toLowerCase().replace('_', '-'); };
    var daLingua = vozes.filter(function (v) { return norm(v).indexOf(lg) === 0; });
    var exatas = daLingua.filter(function (v) { return norm(v) === certa; });
    return (exatas.length ? exatas : daLingua).filter(function (v) { return FEMININA.test(v.name || ''); })[0] ||
      daLingua.filter(function (v) { return FEMININA.test(v.name || ''); })[0] || null;
  }
  var JEITO_VOVO = { rate: 0.9, pitch: 1.2 };

  // ---------- telas e o Voltar do celular ----------
  var atual = 'entrada', pilha = [];
  function mostrar(id) {
    if (atual === 'lugar' && id !== 'lugar') limparLugar();
    if (atual === 'cozinha' && id !== 'cozinha') limparCozinha();
    qsa(document, '.tela').forEach(function (s) { s.classList.toggle('ativa', s.id === id); });
    atual = id; window.scrollTo(0, 0);
    if (id === 'mapa') desenharMapa();
    if (id === 'cozinha' && jogo && jogo.cz) { if (jogo.cz.fase === 'feito') proximo(); else desenharCozinha(); }
    if (id === 'menu') desenharMenu();
  }
  function ir(id) { if (id === atual) return; pilha.push(atual); try { history.pushState({ cozinha: pilha.length }, ''); } catch (e) { /* sem histórico */ } mostrar(id); }
  function voltar() { if (pilha.length) history.back(); else mostrar('menu'); }
  window.addEventListener('popstate', function () {
    if (atual === 'pronto') { pilha = []; mostrar('menu'); return; }
    mostrar(pilha.length ? pilha.pop() : 'menu');
  });
  qsa(document, '.voltar').forEach(function (b) { b.addEventListener('click', voltar); });
  document.addEventListener('keydown', function (e) { if ((e.key === 'Escape' || e.key === 'GoBack') && atual !== 'entrada' && atual !== 'menu') { e.preventDefault(); voltar(); } });

  if (window.SolverRecursos && !SolverRecursos.ligado('cozinha', true)) { traduzir(); $('desligado').hidden = false; mostrar('desligado'); return; }

  // ---------- aviso rápido ----------
  var tAviso = null;
  function aviso(txt, ms, semVoz) {
    var a = $('aviso'); a.textContent = txt; a.hidden = false; a.classList.remove('entra'); void a.offsetWidth; a.classList.add('entra');
    clearTimeout(tAviso); tAviso = setTimeout(function () { a.hidden = true; }, ms || 2600);
    if (!semVoz && jogo && jogo.cfg.id === 'facil') falar(txt);
  }

  // ---------- entrada e menu ----------
  $('iconeEntrada').innerHTML = ART.S.app;
  $('btEntrar').addEventListener('click', function () {
    Som.acordar();
    try { if (window.matchMedia && matchMedia('(pointer: coarse)').matches && document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {}); } catch (e) { /* ok */ }
    ir('menu');
  });
  $('btLingua').addEventListener('click', function () { pref.lingua = en() ? 'pt' : 'en'; salvarPref(); traduzir(); desenharMenu(); });
  $('btVoz').addEventListener('click', function () { pref.voz = !pref.voz; salvarPref(); traduzir(); aviso(pref.voz ? t('🗣️ Voz ligada', '🗣️ Voice on') : t('🗣️ Voz desligada', '🗣️ Voice off'), 1500, true); if (!pref.voz && window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) { /* ok */ } });
  $('btEfeitos').addEventListener('click', function () { pref.efeitos = !pref.efeitos; salvarPref(); traduzir(); Som.toca('toque'); });
  $('btAjuda').addEventListener('click', function () { var a = $('ajuda'); a.hidden = !a.hidden; $('btAjuda').setAttribute('aria-expanded', String(!a.hidden)); });

  function desenharMenu() {
    $('niveis').innerHTML = D.NIVEIS.map(function (n) {
      return '<button type="button" class="nivel n-' + n.id + '" data-nivel="' + n.id + '" role="radio" aria-checked="' + (pref.nivel === n.id) + '">' +
        '<span class="nv-e">' + n.e + '</span><span class="nv-n">' + tx(n) + '</span><span class="nv-t">' + n.txt[en() ? 1 : 0] + '</span></button>';
    }).join('');
    $('receitas').innerHTML = D.RECEITAS.map(function (r) {
      var e = estrelasDe(r.id, pref.nivel);
      return '<button type="button" class="rec" data-rec="' + r.id + '" style="--c:' + r.cor + '">' +
        '<span class="rec-e" aria-hidden="true">' + r.e + '</span><span class="rec-n">' + tx(r) + '</span>' +
        '<span class="rec-est" aria-label="' + e + t(' estrelas', ' stars') + '">' + '⭐'.repeat(e) + '<span class="apagada">' + '☆'.repeat(3 - e) + '</span></span></button>';
    }).join('');
  }
  $('niveis').addEventListener('click', function (e) { var b = e.target.closest('[data-nivel]'); if (!b) return; pref.nivel = b.getAttribute('data-nivel'); salvarPref(); Som.toca('toque'); desenharMenu(); });
  $('receitas').addEventListener('click', function (e) { var b = e.target.closest('[data-rec]'); if (!b) return; Som.toca('toque'); abrirReceita(b.getAttribute('data-rec')); });

  // ---------- ficha da receita (antes de sair para buscar) ----------
  var recEscolhida = null;
  function abrirReceita(id) {
    var r = D.receita[id], nv = D.nivel[pref.nivel]; recEscolhida = id;
    $('recTitulo').textContent = r.e + ' ' + tx(r);
    $('recPrato').textContent = r.e; $('recPrato').style.setProperty('--c', r.cor);
    $('recNivel').textContent = nv.e + ' ' + t('Nível ', 'Level: ') + tx(nv);
    $('recIngredientes').innerHTML = L.ingredientesDoNivel(r, nv).map(function (x) {
      var onde = L.lugaresDe(x.id).map(function (l) { return D.lugar[l].e; }).join(' ');
      return '<li>' + icone(x.id) + '<span class="q">' + L.nomeQtd(x.id, x.q, en()) + '</span><span class="onde" title="' + t('onde achar', 'where to find') + '">' + onde + '</span></li>';
    }).join('');
    var bolsa = nv.moedas ? t('Você tem 💰 ' + L.moedasIniciais(r, nv) + ' moedas', 'You have 💰 ' + L.moedasIniciais(r, nv) + ' coins') : t('Hoje o mercadinho é de graça! 🎁', 'Today the shop is free! 🎁');
    bolsa += t(' e 💛 ' + nv.favores + ' favores da vizinha.', ' and 💛 ' + nv.favores + ' favours from the neighbour.');
    if (nv.tempo) bolsa += t(' ☀️ Tente terminar antes do sol se pôr.', ' ☀️ Try to finish before sunset.');
    $('recBolsa').textContent = bolsa;
    $('recPassos').textContent = t('👩‍🍳 ' + L.passosDoNivel(r, nv).length + ' passos na cozinha.', '👩‍🍳 ' + L.passosDoNivel(r, nv).length + ' steps in the kitchen.');
    ir('receita');
  }
  $('btBuscar').addEventListener('click', function () { novoJogo(recEscolhida, pref.nivel); ir('mapa'); });

  // ---------- partida ----------
  var jogo = null, tSol = null;
  function novoJogo(recId, nivel) {
    var r = D.receita[recId], nv = D.nivel[nivel];
    jogo = { rec: r, nivel: nivel, cfg: nv, precisa: L.ingredientesDoNivel(r, nv), passos: L.passosDoNivel(r, nv), cesta: {},
      moedas: L.moedasIniciais(r, nv), favores: nv.favores, pendente: null, erros: 0, inicio: Date.now(), imprevistoFeito: false, cz: null };
    clearInterval(tSol);
    $('sol').hidden = !nv.tempo;
    if (nv.tempo) tSol = setInterval(desenharCarteira, 1000);
    $('mapaTitulo').textContent = r.e + ' ' + tx(r);
    desenharCesta();
  }
  function tempoRestante() { if (!jogo || !jogo.cfg.tempo) return null; return Math.max(0, jogo.cfg.tempo - (Date.now() - jogo.inicio) / 1000); }
  function desenharCarteira() {
    if (!jogo) return;
    var h = '';
    if (jogo.cfg.moedas) h += '<span class="moedas" title="' + t('moedas', 'coins') + '">💰 ' + jogo.moedas + '</span>';
    h += '<span class="favores" title="' + t('favores da vizinha', 'favours from the neighbour') + '">💛 ' + jogo.favores + '</span>';
    var r = tempoRestante();
    if (r != null) {
      var m = Math.floor(r / 60), s = Math.floor(r % 60);
      h += '<span class="relogio">' + (r > 0 ? '☀️ ' + m + ':' + (s < 10 ? '0' : '') + s : '🌙') + '</span>';
      var p = 1 - r / jogo.cfg.tempo;
      $('solBola').style.left = (p * 100) + '%'; $('solBola').textContent = r > 0 ? '☀️' : '🌙'; $('sol').classList.toggle('noite', r <= 0);
    }
    $('carteiraMapa').innerHTML = h; $('carteiraLugar').innerHTML = h;
  }
  function desenharCesta() {
    if (!jogo) return;
    var h = '<span class="cesta-ic" aria-hidden="true">🧺</span>' + L.resumo(jogo.precisa, jogo.cesta).map(function (r) {
      return '<span class="item' + (r.falta ? '' : ' ok') + '" data-ing="' + r.id + '" aria-label="' + L.nomeIng(r.id, en(), 2) + ': ' + r.tem + t(' de ', ' of ') + r.precisa + '">' + icone(r.id) + '<b>' + r.tem + '/' + r.precisa + '</b></span>';
    }).join('');
    $('cestaMapa').innerHTML = h; $('cestaLugar').innerHTML = h;
    var completa = L.completa(jogo.precisa, jogo.cesta);
    $('cestaMapa').classList.toggle('completa', completa); $('cestaLugar').classList.toggle('completa', completa);
    desenharCarteira();
  }
  function textoFalta() {
    return L.faltando(jogo.precisa, jogo.cesta).map(function (r) { return emojiDe(r.id) + L.nomeQtd(r.id, r.falta, en()); }).join(', ');
  }

  // voa um ícone até a cesta (ou até outro elemento)
  function voar(html, de, para) {
    try {
      var alvo = para || qs(document, '.tela.ativa .cesta'); if (!alvo || !de) return;
      var a = de.getBoundingClientRect(), b = alvo.getBoundingClientRect();
      var v = document.createElement('div'); v.className = 'voando'; v.innerHTML = html;
      v.style.left = (a.left + a.width / 2) + 'px'; v.style.top = (a.top + a.height / 2) + 'px';
      document.body.appendChild(v);
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        v.style.transform = 'translate(' + (b.left + b.width / 2 - a.left - a.width / 2) + 'px,' + (b.top + b.height / 2 - a.top - a.height / 2) + 'px) scale(.45)';
        v.style.opacity = '0.2';
      }); });
      setTimeout(function () { v.remove(); }, 750);
    } catch (e) { /* só enfeite */ }
  }
  // chegou um ingrediente na cesta (já somado)
  function recebeu(id, de) {
    voar(icone(id), de); Som.toca('pega');
    var r = L.resumo(jogo.precisa, jogo.cesta).filter(function (x) { return x.id === id; })[0];
    var nome = emojiDe(id) + L.nomeIng(id, en());
    desenharCesta(); desenharPrecisa();
    if (L.completa(jogo.precisa, jogo.cesta)) aviso(t('🧺 Tudo na cesta! Volte para a vila e vá para 🏠 Casa cozinhar.', '🧺 Everything is in the basket! Go back to the village and head 🏠 Home to cook.'), 3600);
    else if (!r) aviso(t('A receita não pede ' + nome + ', mas fica na cesta.', 'The recipe does not need ' + nome + ', but it stays in the basket.'));
    else if (r.falta === 0) aviso(t('✅ Já tem ' + nome + ' que chega!', '✅ You have enough ' + nome + '!'));
    else aviso('+1 ' + nome + ' · ' + t('falta ', 'still need ') + r.falta, 1800, true);
  }
  function coletar(id, de) { L.por(jogo.cesta, id, 1); recebeu(id, de); }
  function erro() { if (jogo) jogo.erros++; Som.toca('erro'); }

  // ---------- vila ----------
  var CENAS = {
    rio: '<span class="c1">🐟</span><span class="c2">🎣</span>', pomar: '<span class="c1">🌳</span><span class="c2">🍊</span><span class="c3">🍎</span>',
    horta: '<span class="c1">🥕</span><span class="c2">🌱</span><span class="c3">🍅</span>', galinheiro: '<span class="c1">🐔</span><span class="c2">🥚</span>',
    vaca: '<span class="c1">🐄</span><span class="c2">🥛</span>', mercado: '<span class="c1">🏪</span><span class="c2">💰</span>',
    vizinha: '<span class="c1">🏡</span><span class="c2">👵</span>', casa: '<span class="c1">🏠</span><span class="c2">🍳</span>'
  };
  function desenharMapa() {
    if (!jogo) return;
    var uteis = L.lugaresUteis(jogo.precisa, jogo.cesta), completa = L.completa(jogo.precisa, jogo.cesta);
    $('vila').innerHTML = D.LUGARES.map(function (l) {
      var aqui = jogo.cfg.brilho && uteis[l.id] ? uteis[l.id] : null;
      var extra = '';
      if (l.id === 'casa') extra = completa ? '<span class="brilho">✨</span>' : '';
      else if (aqui) extra = '<span class="brilho">✨</span><span class="aqui">' + aqui.slice(0, 4).map(function (id) { return icone(id); }).join('') + '</span>';
      return '<button type="button" class="lugar l-' + l.id + (l.id === 'casa' && completa ? ' pronta' : '') + (aqui ? ' util' : '') + '" data-lugar="' + l.id + '">' +
        '<span class="cena" aria-hidden="true">' + CENAS[l.id] + '</span><span class="nome">' + tx(l) + '</span><span class="faz">' + l.faz[en() ? 1 : 0] + '</span>' + extra + '</button>';
    }).join('');
    desenharCesta();
  }
  $('vila').addEventListener('click', function (e) {
    var b = e.target.closest('[data-lugar]'); if (!b || !jogo) return;
    Som.toca('toque');
    var id = b.getAttribute('data-lugar');
    if (id === 'casa') irCasa(); else abrirLugar(id);
  });
  function irCasa() {
    if (!L.completa(jogo.precisa, jogo.cesta)) { aviso(t('Ainda falta: ', 'Still missing: ') + textoFalta(), 4200); return; }
    if (jogo.cfg.evento && !jogo.imprevistoFeito) {
      jogo.imprevistoFeito = true;
      var id = L.imprevisto(jogo.precisa, jogo.cesta);
      if (id) {
        L.tirar(jogo.cesta, id, 1); desenharMapa(); Som.toca('erro');
        aviso(t('Ops! 🐶 O Biscoito, o cachorrinho, pegou 1 ' + emojiDe(id) + L.nomeIng(id, false) + ' da cesta! Vá buscar mais.',
          'Oops! 🐶 Biscuit the puppy took 1 ' + emojiDe(id) + L.nomeIng(id, true) + ' from the basket! Go get another one.'), 5000);
        return;
      }
    }
    ir('cozinha'); iniciarCozinha();
  }

  // ---------- lugares (mini-jogos) ----------
  var lugarAtual = null, tLugar = [], fimLugar = [];
  function agendar(fn, ms) { var id = setTimeout(fn, ms); tLugar.push(function () { clearTimeout(id); }); return id; }
  function repetir(fn, ms) { var id = setInterval(fn, ms); tLugar.push(function () { clearInterval(id); }); return id; }
  function limparLugar() { tLugar.forEach(function (f) { f(); }); tLugar = []; fimLugar.forEach(function (f) { try { f(); } catch (e) { /* ok */ } }); fimLugar = []; lugarAtual = null; var j = document.getElementById('jogoLugar'); if (j) j.innerHTML = ''; }
  function desenharPrecisa() {
    if (!jogo || !lugarAtual) return;
    var u = L.lugaresUteis(jogo.precisa, jogo.cesta)[lugarAtual] || [];
    var falt = L.faltando(jogo.precisa, jogo.cesta);
    $('lugarPrecisa').innerHTML = u.length ? t('Daqui ainda falta: ', 'Still needed from here: ') + u.map(function (id) {
      var f = falt.filter(function (r) { return r.id === id; })[0]; return '<span class="pq">' + icone(id) + ' ' + f.falta + '</span>';
    }).join(' ') : (falt.length ? t('Daqui não falta nada. Tente outro lugar! 🗺️', 'Nothing needed from here. Try another place! 🗺️') : t('🧺 Tudo na cesta! Vá para 🏠 Casa.', '🧺 Everything is in the basket! Head 🏠 Home.'));
  }
  function abrirLugar(id) {
    limparLugar();
    lugarAtual = id;
    var l = D.lugar[id];
    $('lugarTitulo').textContent = l.e + ' ' + tx(l);
    var area = $('jogoLugar'); area.className = 'jogo-lugar j-' + id; area.innerHTML = '';
    ir('lugar');
    lugarAtual = id;
    MINI[id](area);
    desenharCesta(); desenharPrecisa();
  }
  // tipos que aparecem num lugar: primeiro o que falta, depois outros do mesmo lugar
  function tiposDe(lugar, minimo) {
    var todos = D.INGREDIENTES.filter(function (g) { return g.de === lugar; }).map(function (g) { return g.id; });
    var falta = L.faltando(jogo.precisa, jogo.cesta).map(function (r) { return r.id; }).filter(function (id) { return todos.indexOf(id) >= 0; });
    var outros = embaralhar(todos.filter(function (id) { return falta.indexOf(id) < 0; }));
    return falta.concat(outros).slice(0, Math.max(minimo, falta.length));
  }
  // segurar um botão: enche aos poucos enquanto o dedo fica em cima
  function segurar(el, dur, aoProg, aoFim) {
    var p = 0, ativo = false, ult = 0, raf = 0;
    function passo(ts) {
      if (!ativo) return;
      var dt = ult ? Math.min(100, ts - ult) : 16; ult = ts; p = Math.min(1, p + dt / dur); aoProg(p);
      if (p >= 1) { parar(); p = 0; aoFim(); return; }
      raf = requestAnimationFrame(passo);
    }
    function comecar(e) { if (e && e.preventDefault) e.preventDefault(); if (ativo || el.disabled) return; ativo = true; ult = 0; el.classList.add('segurando'); raf = requestAnimationFrame(passo); }
    function parar() { ativo = false; el.classList.remove('segurando'); cancelAnimationFrame(raf); }
    el.addEventListener('pointerdown', comecar);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (k) { el.addEventListener(k, parar); });
    el.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') comecar(e); });
    el.addEventListener('keyup', parar);
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    return parar;
  }

  var MINI = {};
  MINI.pomar = function (area) {
    var tipos = tiposDe('pomar', 3), nv = jogo.cfg;
    area.innerHTML = '<p class="instr">' + t('Toque nas frutas maduras e coloridas. As verdinhas ainda precisam esperar!', 'Tap the ripe, colourful fruit. The green ones still need to wait!') + '</p>' +
      '<div class="arvore"><div class="copa"></div><div class="tronco"></div><div class="grama"></div></div>';
    var copa = qs(area, '.copa');
    var POS = [[18, 30], [42, 16], [66, 24], [84, 44], [28, 56], [54, 46], [72, 68], [40, 76], [14, 70]];
    POS.forEach(function (pos, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'fruta';
      b.style.left = pos[0] + '%'; b.style.top = pos[1] + '%';
      copa.appendChild(b);
      function nascer(madura) {
        var tipo = tipos[i % tipos.length];
        b.setAttribute('data-ing', tipo); b.innerHTML = icone(tipo); b.disabled = false;
        b.classList.remove('caiu'); b.classList.toggle('madura', !!madura); b.classList.toggle('verde', !madura);
        b.setAttribute('aria-label', L.nomeIng(tipo, en()) + (madura ? t(' madura', ' ripe') : t(' verde', ' unripe')));
      }
      nascer(RAPIDO || Math.random() < nv.madura);
      b.addEventListener('click', function () {
        if (b.disabled) return;
        if (b.classList.contains('madura')) {
          coletar(b.getAttribute('data-ing'), b); b.classList.add('caiu'); b.disabled = true;
          agendar(function () { nascer(RAPIDO); }, 1600 * V);
        } else {
          b.classList.remove('balanca'); void b.offsetWidth; b.classList.add('balanca'); Som.toca('toque');
          aviso(t('Ainda está verde! Espere ficar madura. 🟢➜🟠', 'Still green! Wait until it is ripe. 🟢➜🟠'), 1800);
        }
      });
      b._nascer = nascer;
    });
    repetir(function () {
      var verdes = qsa(copa, '.fruta.verde:not(:disabled)');
      if (verdes.length) { var b = verdes[Math.floor(Math.random() * verdes.length)]; b.classList.remove('verde'); b.classList.add('madura'); b.setAttribute('aria-label', L.nomeIng(b.getAttribute('data-ing'), en()) + t(' madura', ' ripe')); }
    }, 1500 * V);
  };

  MINI.horta = function (area) {
    var tipos = tiposDe('horta', 3);
    area.innerHTML = '<p class="instr">' + t('Toque 3 vezes (ou puxe o dedo para cima) para tirar da terra.', 'Tap 3 times (or swipe up) to pull it out of the ground.') + '</p><div class="canteiro"></div>';
    var cant = qs(area, '.canteiro');
    for (var i = 0; i < 6; i++) (function (i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'planta';
      b.innerHTML = '<span class="folhas" aria-hidden="true">🌿</span><span class="legume"></span><span class="terra" aria-hidden="true"></span>';
      cant.appendChild(b);
      var puxou = 0, y0 = null;
      function nascer() {
        var tipo = tipos[i % tipos.length]; puxou = 0;
        b.setAttribute('data-ing', tipo); qs(b, '.legume').innerHTML = icone(tipo); b.disabled = false; b.classList.remove('saiu');
        b.style.setProperty('--sobe', '0'); b.setAttribute('aria-label', t('Puxar ', 'Pull ') + L.nomeIng(tipo, en()));
      }
      function puxar(n) {
        if (b.disabled) return;
        puxou = Math.min(3, puxou + n); b.style.setProperty('--sobe', String(puxou)); Som.toca('toque');
        if (puxou >= 3) { b.disabled = true; b.classList.add('saiu'); coletar(b.getAttribute('data-ing'), b); agendar(nascer, 1700 * V); }
      }
      b.addEventListener('pointerdown', function (e) { y0 = e.clientY; });
      b.addEventListener('pointerup', function (e) { var dy = y0 == null ? 0 : e.clientY - y0; y0 = null; puxar(dy < -30 ? 3 : 1); });
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); puxar(1); } });
      nascer();
    })(i);
  };

  MINI.galinheiro = function (area) {
    var n = jogo.cfg.id === 'facil' || RAPIDO ? 3 : jogo.cfg.id === 'medio' ? 2 : 1;
    area.innerHTML = '<p class="instr">' + t('Toque numa galinha para ela levantar. Se tiver ovo, pegue com cuidado!', 'Tap a hen so she stands up. If there is an egg, pick it up gently!') + '</p><div class="poleiro"></div>';
    var pol = qs(area, '.poleiro');
    var ordem = embaralhar([0, 1, 2]);
    [0, 1, 2].forEach(function (i) {
      var temOvo = ordem.indexOf(i) < n;
      var ninho = document.createElement('div'); ninho.className = 'ninho';
      ninho.innerHTML = '<button type="button" class="galinha" aria-label="' + t('Galinha', 'Hen') + ' ' + (i + 1) + '">🐔</button><button type="button" class="ovo" hidden aria-label="' + t('Pegar o ovo', 'Pick up the egg') + '">🥚</button><span class="palha" aria-hidden="true"></span>';
      pol.appendChild(ninho);
      var g = qs(ninho, '.galinha'), o = qs(ninho, '.ovo');
      g.addEventListener('click', function () {
        g.classList.remove('levanta'); void g.offsetWidth; g.classList.add('levanta'); Som.toca('toque');
        if (temOvo) { o.hidden = false; aviso(t('Có-có! Tem um ovo! 🥚', 'Cluck-cluck! There is an egg! 🥚'), 1600, true); }
        else aviso(t('Có-có... Essa galinha ainda não botou ovo. Tente outra ou volte daqui a pouco!', 'Cluck... This hen has not laid an egg yet. Try another one or come back soon!'), 2400);
      });
      o.addEventListener('click', function () {
        coletar('ovo', o); o.hidden = true; temOvo = false;
        agendar(function () { temOvo = true; }, 4000 * V);
      });
    });
  };

  MINI.vaca = function (area) {
    area.innerHTML = '<p class="instr">' + t('Faça carinho na Mimosa e segure o botão para encher a xícara de leite.', 'Pet Mimosa and hold the button to fill the cup with milk.') + '</p>' +
      '<div class="pasto"><button type="button" class="mimosa" aria-label="' + t('Fazer carinho na vaca', 'Pet the cow') + '">🐄</button>' +
      '<div class="jarra" aria-hidden="true"><div class="leite-nivel"></div></div></div>' +
      '<button type="button" class="grande bt-segurar" id="btOrdenhar">' + t('🥛 Segure para tirar o leite', '🥛 Hold to get the milk') + '<span class="barra"><span></span></span></button>';
    var vaca = qs(area, '.mimosa'), nivelEl = qs(area, '.leite-nivel'), bt = qs(area, '.bt-segurar'), barra = qs(bt, '.barra span');
    vaca.addEventListener('click', function () {
      var c = document.createElement('span'); c.className = 'coracao'; c.textContent = '❤️'; vaca.appendChild(c); setTimeout(function () { c.remove(); }, 900);
      aviso(t('Muuu! A Mimosa gostou do carinho. 💛', 'Mooo! Mimosa loved the petting. 💛'), 1500, true);
    });
    var parar = segurar(bt, 1700 * V, function (p) { nivelEl.style.height = (p * 100) + '%'; barra.style.width = (p * 100) + '%'; }, function () {
      coletar('leite', qs(area, '.jarra')); setTimeout(function () { nivelEl.style.height = '0%'; barra.style.width = '0%'; }, 300);
    });
    fimLugar.push(parar);
  };

  // Rio: 3 peixinhos nadam; o anzol fica parado no meio, dentro do círculo. Puxar com um peixe no círculo = fisgou:
  // o peixe nada até o anzol, a linha recolhe e ele sobe se mexendo, sai da água com respingo, a vara leva até o
  // balde e ele cai lá dentro. Os outros peixes continuam nadando, e um peixe novo entra pelo lado.
  // Tudo desenhado num quadro só (requestAnimationFrame, só transform e atributos do SVG). Movimento reduzido:
  // sobe reto, sem se mexer e sem respingo.
  MINI.rio = function (area) {
    var nv = jogo.cfg, zona = RAPIDO ? 0.5 : nv.zonaPeixe, vel = nv.id === 'facil' ? 0.12 : nv.id === 'medio' ? 0.17 : 0.23;
    var calmo = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    var SUP = 0.42, ANZOL_Y = 0.7, TIP0 = [0.5, 0.05], TIP_B = [0.6, 0.02], BASE = [0.05, 0.36], ESC = 1.3, RAIAS = [0.58, 0.71, 0.84];
    area.innerHTML = '<p class="instr">' + t('Toque em Puxar quando um peixinho passar dentro do círculo, perto do anzol. Ele fica preso no anzol e vai para o balde!', 'Tap Pull when a little fish swims inside the circle, near the hook. It gets hooked and goes into the bucket!') + '</p>' +
      '<div class="agua" data-fase="pronto"><div class="ondas"></div><div class="superficie"></div><div class="margem m-esq"></div><div class="margem m-dir"></div>' +
      '<div class="alvo" style="--z:' + (zona * 200) + '%"></div><div class="balde-boca"></div><div class="cardume"></div>' +
      '<svg class="pesca" aria-hidden="true"><path class="vara-sombra"/><path class="vara"/><path class="vara-luz"/><path class="cabo"/><circle class="carretilha" r="5"/>' +
      '<path class="fio-halo"/><path class="fio"/>' +
      '<g class="boia"><circle r="5.5" class="boia-b"/><path class="boia-v" d="M-5.5,0 A5.5,5.5 0 0 1 5.5,0 Z"/><path class="boia-pino" d="M0,-5.5 V-9"/></g>' +
      '<g class="anzol"><circle class="anzol-olho" r="2.2"/><path class="anzol-c" d="M0,2 V13 A4.5,4.5 0 0 1 -9,13 V9 L-6.5,11.5"/></g></svg>' +
      '<div class="balde"><span class="no-balde" hidden>🐟</span><span class="balde-alca"></span><span class="balde-corpo"></span></div></div>' +
      '<button type="button" class="grande" id="btPuxar">' + t('🎣 Puxar!', '🎣 Pull!') + '</button>';
    var agua = qs(area, '.agua'), cardume = qs(area, '.cardume'), svg = qs(area, '.pesca'), alvo = qs(area, '.alvo'), balde = qs(area, '.balde');
    var vara = qs(svg, '.vara'), varaS = qs(svg, '.vara-sombra'), varaL = qs(svg, '.vara-luz'), cabo = qs(svg, '.cabo'), carr = qs(svg, '.carretilha');
    var fio = qs(svg, '.fio'), fioH = qs(svg, '.fio-halo'), boia = qs(svg, '.boia'), anzol = qs(svg, '.anzol');
    var W = 1, H = 1, bocaY = 0, baldeX = 0.87;
    function medir() {
      W = agua.clientWidth || 1; H = agua.clientHeight || 1;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      bocaY = balde.offsetTop; baldeX = (balde.offsetLeft + balde.offsetWidth / 2) / W;
      peixes.forEach(function (p) { p.w = p.el.offsetWidth || 40; p.h = p.el.offsetHeight || 40; });
    }
    var peixes = [], relogio = 0;
    function novoPeixe(raia, x, dir) {
      var el = document.createElement('span'); el.className = 'peixe'; el.textContent = '🐟'; cardume.appendChild(el);
      var p = { el: el, y0: raia, x: x, dir: dir, v: vel * (0.75 + Math.random() * 0.5), fase: Math.random() * 6, virar: relogio + 3 + Math.random() * 4, w: el.offsetWidth || 40, h: el.offsetHeight || 40 };
      peixes.push(p); return p;
    }
    embaralhar(RAIAS).forEach(function (r, i) { novoPeixe(r, 0.15 + i * 0.35 + Math.random() * 0.08, Math.random() < 0.5 ? 1 : -1); });
    medir();
    window.addEventListener('resize', medir); fimLugar.push(function () { window.removeEventListener('resize', medir); });

    // estado da pescaria: pronto → vai (o peixe nada até o anzol) → sobe → balanca (até o balde) → solta → volta → pronto.
    // O anzol fica sempre pendurado na ponta da vara: comprimento da linha (l) e ângulo (fi, 0 = reto para baixo).
    var DUR = { treme: 0.35, vai: 0.18, sobe: calmo ? 0.8 : 1.1, balanca: calmo ? 0.5 : 0.85, solta: 0.45, volta: 0.8 };
    var fase = 'pronto', t0 = 0, preso = null, creditou = false, saiu = false, ult = 0, raf = 0, vivo = true;
    function mudar(f) { fase = f; t0 = relogio; agua.setAttribute('data-fase', f); }
    function suave(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
    function balanco(p) { var c = 1.1; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }   // passa um pouco e volta
    function mix(a, b, p) { return a + (b - a) * p; }
    function mover(el, x, y, rot, sx, op) { el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + rot.toFixed(1) + 'deg) scaleX(' + sx + ')'; if (op != null) el.style.opacity = op; }
    function respingo(x, y, forte) {
      if (calmo) return;
      var r = document.createElement('div'); r.className = 'respingo'; r.style.left = x + 'px'; r.style.top = y + 'px';
      var h = '<span class="anel"></span>';
      for (var i = 0; forte && i < 7; i++) { var a = -Math.PI * (0.15 + 0.7 * i / 6); h += '<span class="gota" style="--dx:' + Math.round(Math.cos(a) * 34) + 'px;--up:' + Math.round(14 + Math.random() * 22) + 'px"></span>'; }
      r.innerHTML = h; agua.appendChild(r); agendar(function () { r.remove(); }, 800);
    }
    function ponta(tip, carga) { return [tip[0] * W, (tip[1] + 0.025 * carga) * H]; }
    function quadro(ts) {
      if (!vivo) return;
      var dt = ult ? Math.min(0.1, (ts - ult) / 1000) : 0; ult = ts; relogio += dt;
      var p = Math.min(1, (relogio - t0) / (DUR[fase] || 1)), e = suave(p);
      // vara, linha e anzol
      var tipF = TIP0, carga = 0, lRest = (ANZOL_Y - TIP0[1]) * H, lSobe = 0.06 * H, l = lRest, fi = calmo ? 0 : 0.012 * Math.sin(relogio * 1.1);
      var tB = ponta(TIP_B, 1), alvoB = [baldeX * W - 2, bocaY - 22], lB = Math.hypot(alvoB[0] - tB[0], alvoB[1] - tB[1]), fiB = Math.atan2(alvoB[0] - tB[0], alvoB[1] - tB[1]);
      if (fase === 'treme') { l = lRest - 0.12 * H * Math.sin(Math.PI * p); }
      else if (fase === 'vai') carga = e;
      else if (fase === 'sobe') { carga = 1; l = mix(lRest, lSobe, e); fi = 0; }
      else if (fase === 'balanca') { carga = 1; tipF = [mix(TIP0[0], TIP_B[0], e), mix(TIP0[1], TIP_B[1], e)]; var b = calmo ? e : balanco(p); l = mix(lSobe, lB, e); fi = mix(0, fiB, b); }
      else if (fase === 'solta') { carga = 1; tipF = TIP_B; l = lB; fi = fiB; }
      else if (fase === 'volta') { carga = 1 - e; tipF = [mix(TIP_B[0], TIP0[0], e), mix(TIP_B[1], TIP0[1], e)]; l = mix(lB, lRest, e); fi = mix(fiB, 0, e); }
      var tp = ponta(tipF, carga), tx = tp[0], ty = tp[1], bx = BASE[0] * W, by = BASE[1] * H;
      if (fase === 'treme') ty -= 0.02 * H * Math.sin(Math.PI * p);
      var hx = tx + l * Math.sin(fi), hy = ty + l * Math.cos(fi);
      var dx = tx - bx, dy = ty - by, len = Math.sqrt(dx * dx + dy * dy), nx = dy / len, ny = -dx / len, curva = len * (0.03 + 0.09 * carga);
      var cx = (bx + tx) / 2 + nx * curva, cy = (by + ty) / 2 + ny * curva, dRod = 'M' + bx.toFixed(1) + ',' + by.toFixed(1) + ' Q' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' ' + tx.toFixed(1) + ',' + ty.toFixed(1);
      vara.setAttribute('d', dRod); varaS.setAttribute('d', dRod); varaL.setAttribute('d', dRod);
      cabo.setAttribute('d', 'M' + (bx - dx / len * 8).toFixed(1) + ',' + (by - dy / len * 8).toFixed(1) + ' L' + (bx + dx / len * 26).toFixed(1) + ',' + (by + dy / len * 26).toFixed(1));
      carr.setAttribute('cx', (bx + dx / len * 18 - nx * 6).toFixed(1)); carr.setAttribute('cy', (by + dy / len * 18 - ny * 6).toFixed(1));
      var dFio = 'M' + tx.toFixed(1) + ',' + ty.toFixed(1) + ' L' + hx.toFixed(1) + ',' + hy.toFixed(1);
      fio.setAttribute('d', dFio); fioH.setAttribute('d', dFio);
      var giro = -fi * 180 / Math.PI;
      anzol.setAttribute('transform', 'translate(' + hx.toFixed(1) + ',' + hy.toFixed(1) + ') rotate(' + giro.toFixed(1) + ') scale(' + ESC + ')');
      // peixes nadando
      var temPerto = false;
      peixes.forEach(function (f) {
        if (f === preso) return;
        f.x += f.dir * f.v * dt;
        if (f.x > 0.07 && f.x < 0.93) f.entrando = false;
        if (!f.entrando) {
          if (f.x >= 0.93 && f.dir > 0) f.dir = -1; else if (f.x <= 0.07 && f.dir < 0) f.dir = 1;
          else if (relogio > f.virar) { f.virar = relogio + 3 + Math.random() * 4; if (Math.random() < 0.35) f.dir = -f.dir; }
        }
        var y = (f.y0 + (calmo ? 0 : 0.02 * Math.sin(relogio * 1.3 + f.fase))) * H;
        mover(f.el, f.x * W - f.w / 2, y - f.h / 2, 0, f.dir > 0 ? -1 : 1);
        if (!f.entrando && Math.abs(f.x - 0.5) <= zona) temPerto = true;
      });
      if (nv.brilho) alvo.classList.toggle('tem-peixe', temPerto && fase === 'pronto');
      // boia: presa na linha, um pouco acima do anzol (na superfície quando o anzol está na água); belisca quando há peixe perto
      var dB = Math.min((ANZOL_Y - SUP) * H, l * 0.55), sB = (fase === 'pronto' && !calmo) ? Math.sin(relogio * 2.2) * 1.5 + (temPerto ? 3 + Math.sin(relogio * 24) * 1.5 : 0) : 0;
      boia.setAttribute('transform', 'translate(' + (hx - dB * Math.sin(fi)).toFixed(1) + ',' + (hy - dB * Math.cos(fi) + sB).toFixed(1) + ')');
      // o peixe fisgado: pendurado pela boca na curva do anzol, ao longo da linha, se mexendo
      if (preso) {
        var c = Math.cos(-fi), s = Math.sin(-fi), ox = -4.5 * ESC, oy = 15 * ESC;
        var mx = hx + ox * c - oy * s, my = hy + ox * s + oy * c;
        var fora = my + preso.w * 0.45 < SUP * H;
        var mexe = calmo ? 0 : (fora ? 22 * Math.sin(relogio * 20) : 14 * Math.sin(relogio * 14));
        var base = (preso.sx > 0 ? 90 : -90) + giro, op = 1;
        if (fase === 'vai') { mx = mix(preso.hx0, mx, e); my = mix(preso.hy0, my, e); base *= e; mexe *= e; }
        else if (fase === 'solta') { mx = mix(mx, baldeX * W, e); my = mix(my, bocaY + preso.w * 0.9, e * e); base = mix(base, preso.sx > 0 ? 90 : -90, e); mexe *= 1 - p; op = p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4; }
        if (fase === 'sobe' && !saiu && fora) { saiu = true; respingo(mx, SUP * H, true); Som.toca('agua'); }
        mover(preso.el, mx - preso.w * 0.1, my - preso.h / 2, base + mexe, preso.sx, op);
        if (fase === 'solta' && p >= 0.55 && !creditou) {
          creditou = true; qs(balde, '.no-balde').hidden = false;
          balde.classList.remove('pula'); void balde.offsetWidth; balde.classList.add('pula');
          coletar('peixe', balde);
          aviso(t('Fisgou! O peixinho foi para o balde. 🐟💦', 'Hooked it! The little fish went into the bucket. 🐟💦'), 1800, true);
        }
      }
      if (p >= 1) {
        if (fase === 'treme') mudar('pronto');
        else if (fase === 'vai') mudar('sobe');
        else if (fase === 'sobe') mudar('balanca');
        else if (fase === 'balanca') mudar('solta');
        else if (fase === 'solta') {
          preso.el.remove(); peixes.splice(peixes.indexOf(preso), 1);
          var lado = Math.random() < 0.5; novoPeixe(preso.y0, lado ? -0.1 : 1.1, lado ? 1 : -1).entrando = true;   // um peixe novo chega nadando pelo lado
          preso = null; mudar('volta');
        } else if (fase === 'volta') { mudar('pronto'); respingo(hx, SUP * H, false); }
      }
      raf = requestAnimationFrame(quadro);
    }
    raf = requestAnimationFrame(quadro);
    // saiu do rio no meio da pescaria: o peixe que já estava no anzol vai para a cesta do mesmo jeito
    fimLugar.push(function () { vivo = false; cancelAnimationFrame(raf); if (preso && !creditou) { creditou = true; L.por(jogo.cesta, 'peixe', 1); desenharCesta(); } });
    function puxar() {
      if (fase !== 'pronto') return;
      var perto = peixes.filter(function (f) { return !f.entrando && Math.abs(f.x - 0.5) <= zona; }).sort(function (a, b) { return Math.abs(a.x - 0.5) - Math.abs(b.x - 0.5); })[0];
      if (perto) {
        preso = perto; creditou = false; saiu = false; alvo.classList.remove('tem-peixe');
        preso.sx = preso.dir > 0 ? -1 : 1;
        var y = (preso.y0 + (calmo ? 0 : 0.02 * Math.sin(relogio * 1.3 + preso.fase))) * H;
        preso.hx0 = preso.x * W + (preso.sx > 0 ? -0.4 : 0.4) * preso.w; preso.hy0 = y;   // a cabeça do peixe
        preso.el.classList.add('fisgado'); preso.el.style.transformOrigin = '10% 50%';
        mudar('vai'); Som.toca('fisgou');
      } else {
        mudar('treme');
        agua.classList.remove('balanca'); void agua.offsetWidth; agua.classList.add('balanca'); Som.toca('toque');
        aviso(t('Escapou! Puxe quando um peixe estiver dentro do círculo ⭕', 'It got away! Pull when a fish is inside the circle ⭕'), 1600);
      }
    }
    qs(area, '#btPuxar').addEventListener('click', puxar);
    agua.addEventListener('click', puxar);
  };

  MINI.mercado = function (area) {
    var nv = jogo.cfg;
    var falta = L.faltando(jogo.precisa, jogo.cesta).map(function (r) { return r.id; });
    var itens = D.INGREDIENTES.filter(function (g) { return g.preco > 0; }).map(function (g) { return g.id; });
    itens.sort(function (a, b) { return (falta.indexOf(a) < 0) - (falta.indexOf(b) < 0); });
    area.innerHTML = '<div class="toldo" aria-hidden="true"></div><p class="instr">' + (nv.moedas ? t('Toque no que quer comprar e pague com as suas moedas. O Seu Zé dá o troco!', 'Tap what you want to buy and pay with your coins. Mr. Zé gives you the change!')
      : t('Hoje o Seu Zé está dando tudo de presente! Toque no que precisa. 🎁', 'Today Mr. Zé is giving everything away! Tap what you need. 🎁')) + '</p>' +
      '<div class="prateleira">' + itens.map(function (id) {
        var p = L.preco(id, nv);
        return '<button type="button" class="produto' + (falta.indexOf(id) >= 0 && nv.brilho ? ' precisa' : '') + '" data-ing="' + id + '">' + icone(id) +
          '<span class="pn">' + L.nomeIng(id, en()) + '</span><span class="preco">' + (p ? '💰 ' + p : t('grátis', 'free')) + '</span></button>';
      }).join('') + '</div><div class="caixa" hidden></div><div class="ajudar-zona"></div>';
    var caixa = qs(area, '.caixa');
    function mostrarAjudar() {
      var z = qs(area, '.ajudar-zona');
      z.innerHTML = L.precisaAjudar(jogo, jogo.precisa, nv) ? '<button type="button" class="medio verde" id="btAjudar">' + t('🧹 Ajudar o Seu Zé a arrumar (+2 💰)', '🧹 Help Mr. Zé tidy up (+2 💰)') + '</button>' : '';
      var b = qs(z, '#btAjudar'); if (b) b.addEventListener('click', ajudar);
    }
    function ajudar() {
      var z = qs(area, '.ajudar-zona');
      z.innerHTML = '<p class="instr">' + t('Toque nas caixas para guardar na prateleira.', 'Tap the boxes to put them on the shelf.') + '</p><div class="caixas"></div>';
      var cx = qs(z, '.caixas'), restam = 5;
      for (var i = 0; i < 5; i++) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'caixinha'; b.textContent = '📦';
        b.style.left = (8 + Math.random() * 78) + '%'; b.style.top = (Math.random() * 50) + '%'; b.setAttribute('aria-label', t('Caixa', 'Box'));
        b.addEventListener('click', function () {
          this.disabled = true; this.classList.add('guardou'); Som.toca('toque'); restam--;
          if (!restam) { jogo.moedas += 2; Som.toca('moeda'); desenharCarteira(); aviso(t('Obrigado pela ajuda! Tome 2 moedas. 💰💰', 'Thanks for helping! Here are 2 coins. 💰💰')); mostrarAjudar(); }
        });
        cx.appendChild(b);
      }
    }
    function abrirCaixa(id, de) {
      var p = L.preco(id, nv), naMao = [];
      var carteira = L.moedasPara(jogo.moedas);
      if (jogo.moedas < p) { Som.toca('erro'); aviso(t('Suas moedas não dão para isso. Tente outro lugar, peça para a vizinha ou ajude o Seu Zé.', 'Your coins are not enough for that. Try another place, ask the neighbour or help Mr. Zé.'), 3600); mostrarAjudar(); return; }
      caixa.hidden = false;
      function desenhar() {
        var soma = L.soma(naMao);
        caixa.innerHTML = '<p class="cx-item">' + icone(id) + ' <b>' + L.nomeIng(id, en()) + '</b> — ' + t('custa', 'costs') + ' <b>💰 ' + p + '</b></p>' +
          '<p class="cx-instr">' + t('Toque nas suas moedas para colocar no balcão:', 'Tap your coins to put them on the counter:') + '</p>' +
          '<div class="cx-carteira">' + carteira.map(function (m, i) { return '<button type="button" class="moeda m' + m + '" data-i="' + i + '" aria-label="' + t('moeda de ', 'coin of ') + m + '">' + m + '</button>'; }).join('') + '</div>' +
          '<div class="cx-balcao" aria-label="' + t('balcão', 'counter') + '">' + naMao.map(function (m, i) { return '<button type="button" class="moeda m' + m + '" data-b="' + i + '">' + m + '</button>'; }).join('') + '</div>' +
          '<p class="cx-soma">' + t('Você deu: ', 'You gave: ') + '<b>💰 ' + soma + '</b>' + (soma > p ? ' · ' + t('troco: ', 'change: ') + '<b>💰 ' + L.troco(soma, p) + '</b>' : '') + '</p>' +
          '<div class="linha-botoes"><button type="button" class="medio verde cx-pagar"' + (soma >= p ? '' : ' disabled') + '>' + t('✅ Pagar', '✅ Pay') + '</button><button type="button" class="medio cx-cancelar">' + t('Voltar', 'Back') + '</button></div>';
      }
      desenhar();
      caixa.onclick = function (e) {
        var b = e.target.closest('button'); if (!b) return;
        if (b.hasAttribute('data-i')) { var i = +b.getAttribute('data-i'); naMao.push(carteira[i]); carteira.splice(i, 1); Som.toca('moeda'); desenhar(); }
        else if (b.hasAttribute('data-b')) { var j = +b.getAttribute('data-b'); carteira.push(naMao[j]); carteira.sort(function (a, c) { return c - a; }); naMao.splice(j, 1); Som.toca('toque'); desenhar(); }
        else if (b.classList.contains('cx-cancelar')) { caixa.hidden = true; caixa.onclick = null; }
        else if (b.classList.contains('cx-pagar')) {
          var pago = L.soma(naMao), r = L.comprar(jogo, id, nv, pago);
          caixa.hidden = true; caixa.onclick = null;
          if (!r.ok) { erro(); aviso(t('Não deu certo. Tente de novo.', 'That did not work. Try again.')); return; }
          recebeu(id, de);
          aviso(r.troco > 0 ? t('Você deu 💰 ' + pago + ', custou 💰 ' + r.preco + '. Troco: 💰 ' + r.troco + '. Obrigado!', 'You gave 💰 ' + pago + ', it cost 💰 ' + r.preco + '. Change: 💰 ' + r.troco + '. Thank you!')
            : t('Pagou certinho: 💰 ' + r.preco + '. Obrigado!', 'Exact amount: 💰 ' + r.preco + '. Thank you!'), 3400);
          Som.toca('moeda'); desenharCarteira(); mostrarAjudar();
        }
      };
    }
    qs(area, '.prateleira').addEventListener('click', function (e) {
      var b = e.target.closest('.produto'); if (!b) return;
      var id = b.getAttribute('data-ing');
      if (!nv.moedas) { L.comprar(jogo, id, nv); recebeu(id, b); return; }
      abrirCaixa(id, b);
    });
    mostrarAjudar();
  };

  MINI.vizinha = function (area) {
    var falta = L.faltando(jogo.precisa, jogo.cesta).map(function (r) { return r.id; });
    var itens = D.INGREDIENTES.filter(function (g) { return g.vizinha; }).map(function (g) { return g.id; });
    itens.sort(function (a, b) { return (falta.indexOf(a) < 0) - (falta.indexOf(b) < 0); });
    area.innerHTML = '<div class="casinha"><div class="cida" aria-hidden="true">👵</div><div class="balao" aria-live="polite"></div><div class="na-mao" aria-hidden="true"></div></div>' +
      '<p class="favores-txt"></p><div class="pedidos">' + itens.map(function (id) {
        return '<button type="button" class="pedido' + (falta.indexOf(id) >= 0 && jogo.cfg.brilho ? ' precisa' : '') + '" data-ing="' + id + '">' + icone(id) + '<span>' + L.nomeIng(id, en()) + '</span></button>';
      }).join('') + '</div><button type="button" class="grande verde" id="btObrigado" hidden>' + t('💛 Obrigado, Dona Cida!', '💛 Thank you, Mrs. Cida!') + '</button>';
    var balao = qs(area, '.balao'), mao = qs(area, '.na-mao'), bt = qs(area, '#btObrigado'), cida = qs(area, '.cida'), falando = null;
    // a Dona Cida fala em voz alta (se a voz 🗣️ estiver ligada), com voz de vovó: mais devagar e mais fininha;
    // o balão mostra sempre o que ela disse. fila = espera o aviso anterior acabar de ser lido.
    function fala(pt, ing, fila) {
      var txt = t(pt, ing);
      balao.textContent = txt; balao.classList.remove('novo'); void balao.offsetWidth; balao.classList.add('novo');
      var u = falar(txt, { rate: JEITO_VOVO.rate, pitch: JEITO_VOVO.pitch, voz: vozDaVovo(), fila: fila });
      if (!u) return;
      falando = u; cida.classList.add('falando');
      var acabou = function () { if (falando === u) { falando = null; cida.classList.remove('falando'); } };
      try { u.addEventListener('end', acabou); u.addEventListener('error', acabou); } catch (e) { /* ok */ }
      agendar(acabou, 1500 + txt.length * 110);   // alguns aparelhos não avisam quando a fala acaba
    }
    function favores() { qs(area, '.favores-txt').textContent = t('💛 Favores hoje: ' + jogo.favores, '💛 Favours today: ' + jogo.favores); }
    if (jogo.favores > 0) fala('Oi, meu bem, que bom te ver! Precisa de alguma coisa emprestada? 😊', 'Hello, sweetie, how nice to see you! Do you need to borrow something? 😊');
    else fala('Oi, meu bem! Hoje eu já emprestei tudo o que podia. Tente o mercadinho! 😊', 'Hello, sweetie! I have already lent all I could today. Try the shop! 😊');
    favores();
    // saiu da casa no meio da fala: a vovó para de falar
    fimLugar.push(function () { if (falando && window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) { /* ok */ } });
    qs(area, '.pedidos').addEventListener('click', function (e) {
      var b = e.target.closest('.pedido'); if (!b) return;
      var id = b.getAttribute('data-ing'), r = L.pedirFavor(jogo, id);
      if (r.ok) {
        fala('Claro, meu bem! Aqui está 1 ' + L.nomeIng(id, false) + '. 😊', 'Of course, sweetie! Here is 1 ' + L.nomeIng(id, true) + '. 😊');
        mao.innerHTML = icone(id); bt.hidden = false; bt.focus(); Som.toca('toque');
        qsa(area, '.pedido').forEach(function (x) { x.disabled = true; });
        agendar(function () { if (jogo.pendente) fala('Como é que se diz? 😉', 'What do we say? 😉'); }, 4500 * V);
      } else if (r.motivo === 'sem-favor') {
        fala('Hoje eu já emprestei bastante! Tente o mercadinho ou outro lugar. 😊', 'I have lent a lot today! Try the shop or another place. 😊'); Som.toca('erro');
      }
    });
    bt.addEventListener('click', function () {
      var r = L.agradecer(jogo); if (!r.ok) return;
      bt.hidden = true; recebeu(r.id, mao); mao.innerHTML = '';
      if (jogo.favores > 0) fala('De nada, meu bem! Volte sempre. Tchau, tchau! 💛', 'You are welcome, sweetie! Come back any time. Bye-bye! 💛', true);
      else fala('De nada, meu bem! Agora acabaram os favores de hoje. Tchau, tchau! 💛', 'You are welcome, sweetie! That was my last favour for today. Bye-bye! 💛', true);
      favores();
      qsa(area, '.pedido').forEach(function (x) { x.disabled = false; });
      desenharCarteira();
    });
    fimLugar.push(function () { if (jogo.pendente) jogo.pendente = null; });
  };

  // ---------- cozinha ----------
  var tCz = [], fimCz = [];
  function agendarCz(fn, ms) { var id = setTimeout(fn, ms); tCz.push(function () { clearTimeout(id); }); }
  function limparCozinha() { tCz.forEach(function (f) { f(); }); tCz = []; fimCz.forEach(function (f) { try { f(); } catch (e) { /* ok */ } }); fimCz = []; }
  function passoAtual() { return jogo.cz.atual ? jogo.passos.filter(function (p) { return p.id === jogo.cz.atual; })[0] : null; }
  function texto(p) { return L.textoPasso(p, jogo.rec, jogo.nivel, en()); }
  function iniciarCozinha() {
    $('czTitulo').textContent = jogo.rec.e + ' ' + tx(jogo.rec);
    if (jogo.cz) { desenharCozinha(); return; }
    var usados = [];
    jogo.passos.forEach(function (p) { if (usados.indexOf(p.u) < 0) usados.push(p.u); });
    var extras = embaralhar(D.UTENSILIOS.map(function (u) { return u.id; }).filter(function (u) { return usados.indexOf(u) < 0; })).slice(0, jogo.cfg.distratores);
    jogo.cz = { feitos: [], atual: null, fase: null, errosPasso: 0, dicaTempo: false,
      utens: D.UTENSILIOS.map(function (u) { return u.id; }).filter(function (u) { return usados.indexOf(u) >= 0 || extras.indexOf(u) >= 0; }),
      fichas: embaralhar(jogo.passos.map(function (p) { return p.id; })) };
    proximo();
  }
  function proximo() {
    var cz = jogo.cz;
    limparCozinha();
    if (cz.feitos.length === jogo.passos.length) { terminar(); return; }
    cz.errosPasso = 0; cz.dicaTempo = false;
    if (jogo.cfg.fichas) { cz.fase = 'ficha'; cz.atual = null; }
    else { cz.atual = L.proximoNaOrdem(jogo.passos, cz.feitos); cz.fase = 'utensilio'; }
    desenharCozinha();
    if (cz.fase === 'utensilio' && jogo.cfg.id === 'facil') falar(texto(passoAtual()));
  }
  function deveBrilhar() {
    var cz = jogo.cz, p = passoAtual(); if (!p || cz.fase !== 'utensilio') return false;
    var d = jogo.cfg.dica;
    if (d === 'sempre') return true;
    if (d === 'metade') return jogo.passos.indexOf(p) % 2 === 0 || cz.errosPasso >= 1 || cz.dicaTempo;
    return cz.errosPasso >= 2;
  }
  function desenharCozinha() {
    limparCozinha();
    var cz = jogo.cz, p = passoAtual(), total = jogo.passos.length;
    // ficha da receita
    var lista = jogo.cfg.fichas ? cz.feitos.map(function (id) { return jogo.passos.filter(function (x) { return x.id === id; })[0]; }) : jogo.passos;
    $('ficha').innerHTML = lista.map(function (x) {
      var feito = cz.feitos.indexOf(x.id) >= 0;
      return '<li class="' + (feito ? 'feito' : '') + (p && x.id === p.id ? ' atual' : '') + '">' + icone(x.u) + '<span>' + texto(x) + '</span>' + (feito ? '<b aria-label="' + t('feito', 'done') + '">✔</b>' : '') + '</li>';
    }).join('') + (jogo.cfg.fichas && cz.feitos.length < total ? '<li class="misturadas">🃏 ' + t('Fichas misturadas: ', 'Mixed-up cards: ') + (total - cz.feitos.length) + '</li>' : '');
    var at = qs($('ficha'), '.atual'); if (at) $('ficha').scrollTop = Math.max(0, at.offsetTop - $('ficha').offsetTop - 8);
    var r = tempoRestante();
    $('passoNum').textContent = t('Passo ', 'Step ') + Math.min(total, cz.feitos.length + 1) + t(' de ', ' of ') + total + (r != null ? (r > 0 ? '  ·  ☀️' : '  ·  🌙') : '');
    $('passoTexto').textContent = p ? texto(p) : t('As fichas da receita se misturaram! Qual é o próximo passo?', 'The recipe cards got mixed up! What is the next step?');
    var u = p && D.utensilio[p.u];
    var adulto = p && (u.adulto || (p.em && D.utensilio[p.em] && D.utensilio[p.em].adulto));
    $('dicaAdulto').hidden = !adulto;
    if (adulto) $('dicaAdulto').textContent = t('🧑‍🍳 Na cozinha de verdade, ' + tx(u).toLowerCase() + ' só com um adulto junto!', '🧑‍🍳 In a real kitchen, use the ' + tx(u).toLowerCase() + ' only with a grown-up!');
    // utensílios
    var brilha = deveBrilhar();
    $('utensilios').innerHTML = cz.utens.map(function (id) {
      var x = D.utensilio[id];
      return '<button type="button" class="utensilio' + (brilha && p && id === p.u ? ' luz' : '') + (cz.fase === 'acao' && p && id === p.u ? ' usando' : '') + '" data-u="' + id + '"' + (cz.fase === 'utensilio' ? '' : ' aria-disabled="true"') + '>' + icone(id) + '<span>' + tx(x) + '</span></button>';
    }).join('');
    // palco
    var palco = $('palco'); palco.className = 'palco';
    if (cz.fase === 'ficha') {
      palco.innerHTML = '<div class="fichas">' + cz.fichas.filter(function (id) { return cz.feitos.indexOf(id) < 0; }).map(function (id) {
        var x = jogo.passos.filter(function (q) { return q.id === id; })[0];
        return '<button type="button" class="ficha-bt" data-passo="' + id + '">' + icone(x.u) + '<span>' + texto(x) + '</span></button>';
      }).join('') + '</div>';
    } else if (cz.fase === 'utensilio') {
      palco.innerHTML = '<div class="pergunta"><span class="seta" aria-hidden="true">👇</span><p>' + t('Qual utensílio usar? Escolha embaixo.', 'Which tool do we use? Pick one below.') + '</p></div>';
      if (jogo.cfg.dica === 'metade' && !brilha) agendarCz(function () { cz.dicaTempo = true; desenharCozinha(); }, 8000 * V);
    } else if (cz.fase === 'acao') montarAcao(p);
  }
  $('palco').addEventListener('click', function (e) {
    var b = e.target.closest('.ficha-bt'); if (!b || jogo.cz.fase !== 'ficha') return;
    var id = b.getAttribute('data-passo');
    if (L.podeFazer(jogo.passos, jogo.cz.feitos, id)) { Som.toca('toque'); jogo.cz.atual = id; jogo.cz.fase = 'utensilio'; desenharCozinha(); }
    else {
      erro(); b.classList.remove('treme'); void b.offsetWidth; b.classList.add('treme');
      var antes = L.faltamAntes(jogo.passos, jogo.cz.feitos, id).map(function (d) { return '“' + texto(jogo.passos.filter(function (q) { return q.id === d; })[0]) + '”'; });
      aviso(t('Ainda não! Antes precisa: ', 'Not yet! First you need: ') + antes.join(t(' e ', ' and ')), 4200);
    }
  });
  $('utensilios').addEventListener('click', function (e) {
    var b = e.target.closest('[data-u]'); if (!b) return;
    var cz = jogo.cz, p = passoAtual();
    if (cz.fase === 'ficha') { aviso(t('Primeiro escolha a ficha do próximo passo. 🃏', 'First pick the card for the next step. 🃏'), 2000); return; }
    if (cz.fase !== 'utensilio') return;
    var u = b.getAttribute('data-u');
    if (u === p.u) { Som.toca('toque'); cz.fase = 'acao'; limparCozinha(); desenharCozinha(); }
    else {
      erro(); cz.errosPasso++;
      b.classList.remove('treme'); void b.offsetWidth; b.classList.add('treme');
      aviso(t('Hmm, ' + tx(D.utensilio[u]).toLowerCase() + ' não serve para este passo. Tente outro!', 'Hmm, the ' + tx(D.utensilio[u]).toLowerCase() + ' is not for this step. Try another one!'), 2200);
      if (deveBrilhar()) desenharCozinha();
    }
  });
  $('btLer').addEventListener('click', function () { var p = jogo && jogo.cz && passoAtual(); var v = pref.voz; pref.voz = true; falar(p ? texto(p) : $('passoTexto').textContent); pref.voz = v; });

  function concluir() {
    var cz = jogo.cz; if (cz.fase !== 'acao') return;
    cz.fase = 'feito'; cz.feitos.push(cz.atual); Som.toca('ok');
    $('palco').classList.add('certo');
    agendarCz(proximo, 750 * V + 150);
  }
  // mexer em círculos com o dedo (ou tocando no botão)
  function giro(alvo, voltas, aoProg, aoFim) {
    var acc = 0, ant = null, fim = false, total = voltas * 2 * Math.PI;
    function ang(e) { var r = alvo.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); return Math.sqrt(dx * dx + dy * dy) < 8 ? null : Math.atan2(dy, dx); }
    function somar(v) { if (fim) return; acc += v; aoProg(Math.min(1, acc / total), acc); if (acc >= total) { fim = true; aoFim(); } }
    alvo.addEventListener('pointerdown', function (e) { e.preventDefault(); ant = ang(e); try { alvo.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } });
    alvo.addEventListener('pointermove', function (e) {
      if (ant == null) return; var a = ang(e); if (a == null) return;
      var d = a - ant; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; ant = a; somar(Math.abs(d));
    });
    ['pointerup', 'pointercancel'].forEach(function (k) { alvo.addEventListener(k, function () { ant = null; }); });
    return somar;
  }
  function montarAcao(p) {
    var palco = $('palco'), a = p.a, nv = jogo.cfg;
    palco.className = 'palco acao-' + a;
    var big = function (id) { return '<div class="grandao">' + icone(id) + '</div>'; };
    if (a === 'lavar' || a === 'mexer') {
      var onde = a === 'lavar' ? 'pia' : p.em;
      var itens = a === 'lavar' && p.ing.length ? '<div class="itens-lavar">' + p.ing.map(icone).join('') + '</div>' : (a === 'lavar' ? '<div class="itens-lavar"><span class="ic">🧼</span></div>' : '');
      palco.innerHTML = '<p class="instr">' + (a === 'lavar' ? t('Esfregue fazendo círculos com o dedo 🔄', 'Scrub by making circles with your finger 🔄') : t('Mexa fazendo círculos com o dedo 🔄', 'Stir by making circles with your finger 🔄')) + '</p>' +
        '<div class="alvo-giro" style="--p:0">' + big(onde) + itens + '<span class="colher-gira" aria-hidden="true">' + (a === 'lavar' ? '💧' : '🥄') + '</span></div>' +
        '<button type="button" class="medio bt-alt">' + (a === 'lavar' ? t('🧼 Esfregar', '🧼 Scrub') : t('🔄 Mexer', '🔄 Stir')) + '</button>';
      var alvo = qs(palco, '.alvo-giro'), col = qs(palco, '.colher-gira');
      var somar = giro(alvo, a === 'lavar' ? 1.5 : (nv.id === 'dificil' ? 3 : 2), function (pr, ang) {
        alvo.style.setProperty('--p', pr.toFixed(3)); col.style.transform = 'rotate(' + ang + 'rad) translateX(var(--raio)) rotate(' + (-ang) + 'rad)';
      }, concluir);
      qs(palco, '.bt-alt').addEventListener('click', function () { somar(Math.PI / 4); Som.toca('toque'); });
    } else if (a === 'cortar') {
      var fila = p.ing.slice(), cortes = 0, PRECISA = nv.id === 'facil' ? 3 : 4;
      palco.innerHTML = '<p class="instr">' + t('Deslize o dedo por cima para cortar ✋➡️ (ou toque)', 'Swipe your finger across to cut ✋➡️ (or tap)') + '</p>' +
        '<div class="tabua-alvo" tabindex="0" role="button"><div class="pedacos"></div><span class="faca-mov" aria-hidden="true">' + ART.S.faca + '</span></div><p class="contador"></p>';
      var tab = qs(palco, '.tabua-alvo'), ped = qs(palco, '.pedacos'), cont = qs(palco, '.contador'), faca = qs(palco, '.faca-mov'), x0 = null;
      tab.setAttribute('aria-label', t('Cortar', 'Cut'));
      function mostrarItem() { var id = fila[0]; ped.innerHTML = '<span class="inteiro">' + icone(id) + '</span>'; cont.textContent = L.nomeIng(id, en()) + ': 0/' + PRECISA; }
      function cortar() {
        if (!fila.length) return;
        cortes++; Som.toca('toque');
        var risco = document.createElement('span'); risco.className = 'risco'; risco.style.left = (20 + Math.random() * 60) + '%'; risco.style.transform = 'rotate(' + (60 + Math.random() * 60) + 'deg)'; tab.appendChild(risco); setTimeout(function () { risco.remove(); }, 500);
        var id = fila[0];
        ped.innerHTML = Array(cortes + 1).join('<span class="pedaco">' + icone(id) + '</span>');
        cont.textContent = L.nomeIng(id, en()) + ': ' + cortes + '/' + PRECISA;
        if (cortes >= PRECISA) { fila.shift(); cortes = 0; if (fila.length) agendarCz(mostrarItem, 450); else concluir(); }
      }
      tab.addEventListener('pointerdown', function (e) { e.preventDefault(); x0 = [e.clientX, e.clientY]; try { tab.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } });
      tab.addEventListener('pointermove', function (e) { var r = tab.getBoundingClientRect(); faca.style.left = (e.clientX - r.left) + 'px'; faca.style.top = (e.clientY - r.top) + 'px'; faca.classList.add('vis'); });
      tab.addEventListener('pointerup', function () { if (x0) { x0 = null; cortar(); } faca.classList.remove('vis'); });
      tab.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cortar(); } });
      mostrarItem();
    } else if (a === 'por') {
      var certos = p.ing.slice(), outros = jogo.precisa.map(function (x) { return x.id; }).filter(function (id) { return certos.indexOf(id) < 0; });
      var chips = certos.concat(nv.id === 'facil' ? [] : embaralhar(outros).slice(0, 2));
      chips = nv.id === 'facil' ? chips : embaralhar(chips);
      palco.innerHTML = '<p class="instr">' + t('Toque em cada ingrediente para colocar ', 'Tap each ingredient to put it ') + D.utensilio[p.u].na[en() ? 1 : 0] + '</p>' + big(p.u).replace('grandao', 'grandao destino') +
        '<div class="chips">' + chips.map(function (id) { return '<button type="button" class="chip-ing" data-ing="' + id + '">' + icone(id) + '<span>' + L.nomeQtd(id, L.quantidade(jogo.rec, jogo.nivel, id), en()) + '</span></button>'; }).join('') + '</div>';
      var faltam = certos.length, dest = qs(palco, '.destino');
      qs(palco, '.chips').addEventListener('click', function (e) {
        var b = e.target.closest('.chip-ing'); if (!b || b.disabled) return;
        var id = b.getAttribute('data-ing');
        if (certos.indexOf(id) >= 0) {
          b.disabled = true; b.classList.add('foi'); voar(icone(id), b, dest); Som.toca('pega');
          dest.classList.remove('pula'); void dest.offsetWidth; dest.classList.add('pula');
          if (!--faltam) concluir();
        } else { erro(); b.classList.remove('treme'); void b.offsetWidth; b.classList.add('treme'); aviso(t('Esse não é deste passo!', 'That one is not for this step!'), 1800); }
      });
    } else if (a === 'bater') {
      palco.innerHTML = '<p class="instr">' + t('Segure o botão até a barra encher ✋', 'Hold the button until the bar is full ✋') + '</p>' + big(p.u).replace('grandao', 'grandao maquina') +
        '<button type="button" class="grande bt-segurar">' + (p.u === 'espremedor' ? t('🍊 Segure para espremer', '🍊 Hold to squeeze') : t('✋ Segure para bater', '✋ Hold to blend')) + '<span class="barra"><span></span></span></button>';
      var maq = qs(palco, '.maquina'), bt = qs(palco, '.bt-segurar'), barra = qs(bt, '.barra span');
      bt.addEventListener('pointerdown', function () { maq.classList.add('treme-sem-fim'); });
      ['pointerup', 'pointerleave', 'pointercancel', 'keyup'].forEach(function (k) { bt.addEventListener(k, function () { maq.classList.remove('treme-sem-fim'); }); });
      fimCz.push(segurar(bt, 1800 * V, function (pr) { barra.style.width = (pr * 100) + '%'; }, function () { maq.classList.remove('treme-sem-fim'); bt.disabled = true; concluir(); }));
    } else if (a === 'ligar' || a === 'desligar') {
      var liga = a === 'ligar';
      palco.innerHTML = '<p class="instr">' + (liga ? t('Gire o botão do fogão para acender o fogo 🔥', 'Turn the stove knob to light the flame 🔥') : t('Gire o botão para apagar o fogo', 'Turn the knob to put out the flame')) + '</p>' +
        '<div class="fogao-cena">' + big('fogao') + (p.em ? '<div class="em-cima">' + icone(p.em) + '</div>' : '') + '<span class="chama' + (liga ? '' : ' acesa') + '" aria-hidden="true">🔥</span></div>' +
        '<button type="button" class="botao-fogao' + (liga ? '' : ' girado') + '" aria-label="' + (liga ? t('Ligar o fogo', 'Turn on the flame') : t('Desligar o fogo', 'Turn off the flame')) + '"><span></span></button>';
      qs(palco, '.botao-fogao').addEventListener('click', function () {
        this.classList.toggle('girado', liga); qs(palco, '.chama').classList.toggle('acesa', liga); this.disabled = true; Som.toca('toque'); agendarCz(concluir, 500 * V + 100);
      });
    } else if (a === 'despejar') {
      palco.innerHTML = '<p class="instr">' + t('Toque ' + D.utensilio[p.de].na[0], 'Tap the ' + D.utensilio[p.de].en.toLowerCase()) + t(' para despejar', ' to pour') + '</p>' +
        '<div class="despejo"><button type="button" class="origem" aria-label="' + t('Despejar', 'Pour') + '">' + icone(p.de) + '</button><span class="seta-desp" aria-hidden="true">➜</span>' + big(p.u).replace('grandao', 'grandao destino') + '</div>';
      qs(palco, '.origem').addEventListener('click', function () { this.disabled = true; this.classList.add('despeja'); Som.toca('pega'); agendarCz(concluir, 900 * V + 100); });
    } else if (a === 'virar') {
      palco.innerHTML = '<p class="instr">' + t('Espere dourar e toque em Virar!', 'Wait until it is golden and tap Flip!') + '</p><div class="frigideira-cena">' + big(p.em) + '<span class="massa" style="--d:0"></span></div>' +
        '<button type="button" class="grande bt-virar">' + t('🔄 Virar!', '🔄 Flip!') + '</button>';
      var massa = qs(palco, '.massa'), btv = qs(palco, '.bt-virar'), pr = 0;
      var tv = setInterval(function () { pr = Math.min(1, pr + 0.05 / (2.6 * V)); massa.style.setProperty('--d', pr.toFixed(2)); if (pr >= 0.6) btv.classList.add('luz'); }, 50);
      fimCz.push(function () { clearInterval(tv); });
      btv.addEventListener('click', function () {
        if (pr < 0.6) { aviso(t('Ainda não dourou! Espere mais um pouquinho.', 'Not golden yet! Wait a little bit more.'), 1800); return; }
        clearInterval(tv); btv.disabled = true; massa.classList.add('vira'); agendarCz(concluir, 700 * V + 100);
      });
    } else if (a === 'assar' || a === 'gelar' || a === 'esperar') {
      var cfgT = { assar: ['forno', t('🍽️ Pôr no forno', '🍽️ Put in the oven'), t('🧤 Tirar do forno', '🧤 Take it out'), 5], gelar: ['geladeira', t('❄️ Pôr na geladeira', '❄️ Put in the fridge'), t('Tirar da geladeira', 'Take it out of the fridge'), 4], esperar: ['relogio', t('⏰ Começar a esperar', '⏰ Start waiting'), t('✅ Pronto!', '✅ Ready!'), 4] }[a];
      palco.innerHTML = '<p class="instr">' + t('Coloque e espere o tempo passar', 'Put it in and wait for the time to pass') + '</p><div class="timer-cena">' + big(cfgT[0]) + '<div class="timer" style="--p:0"><span></span></div></div>' +
        '<button type="button" class="grande bt-timer">' + cfgT[1] + '</button>';
      var btt = qs(palco, '.bt-timer'), tim = qs(palco, '.timer'), fase = 0;
      btt.addEventListener('click', function () {
        if (fase === 0) {
          fase = 1; btt.disabled = true; Som.toca('toque'); palco.classList.add('ligado');
          var dur = cfgT[3] * 1000 * V, ini = Date.now();
          var iv = setInterval(function () {
            var pr2 = Math.min(1, (Date.now() - ini) / dur); tim.style.setProperty('--p', pr2.toFixed(3)); qs(tim, 'span').textContent = Math.ceil((1 - pr2) * cfgT[3]);
            if (pr2 >= 1) { clearInterval(iv); fase = 2; btt.disabled = false; btt.textContent = cfgT[2]; btt.classList.add('luz'); qs(tim, 'span').textContent = '✔'; Som.toca('pega'); }
          }, 100);
          fimCz.push(function () { clearInterval(iv); });
        } else if (fase === 2) { btt.disabled = true; concluir(); }
      });
    } else if (a === 'maos') {
      var toques = 0, N = 5;
      palco.innerHTML = '<p class="instr">' + t('Toque na massa para modelar com as mãos 🤲', 'Tap the dough to shape it with your hands 🤲') + '</p>' +
        '<button type="button" class="massa-mao" style="--c:' + jogo.rec.cor + '" aria-label="' + t('Massa', 'Dough') + '"></button><div class="bolinhas"></div><p class="contador">0/' + N + '</p>';
      var mm = qs(palco, '.massa-mao'), bol = qs(palco, '.bolinhas'), cn = qs(palco, '.contador');
      mm.addEventListener('click', function () {
        if (toques >= N) return; toques++; Som.toca('toque');
        mm.classList.remove('aperta'); void mm.offsetWidth; mm.classList.add('aperta');
        var s = document.createElement('span'); s.className = 'bolinha'; s.style.setProperty('--c', jogo.rec.cor); bol.appendChild(s); cn.textContent = toques + '/' + N;
        if (toques >= N) concluir();
      });
    } else if (a === 'servir') {
      palco.innerHTML = '<p class="instr">' + t('Toque para servir! 😋', 'Tap to serve! 😋') + '</p><button type="button" class="bt-servir" aria-label="' + t('Servir', 'Serve') + '">' + icone(p.u) + '<span class="comida" aria-hidden="true">' + jogo.rec.e + '</span></button>';
      qs(palco, '.bt-servir').addEventListener('click', function () { this.disabled = true; this.classList.add('servido'); agendarCz(concluir, 600 * V + 100); });
    }
  }

  // ---------- receita pronta ----------
  function terminar() {
    var r = tempoRestante(), atrasou = r != null && r <= 0;
    var est = L.estrelas({ erros: jogo.erros, atrasou: atrasou });
    clearInterval(tSol);
    salvarProgresso(jogo.rec.id, jogo.nivel, est);
    $('prontoPrato').textContent = jogo.rec.e; $('prontoPrato').style.setProperty('--c', jogo.rec.cor);
    $('prontoTitulo').textContent = t('🎉 Oba! Você fez: ', '🎉 Yay! You made: ') + tx(jogo.rec) + '!';
    $('prontoEstrelas').innerHTML = '<span aria-label="' + est + t(' estrelas', ' stars') + '">' + '⭐'.repeat(est) + '<span class="apagada">' + '☆'.repeat(3 - est) + '</span></span>';
    $('prontoNota').textContent = atrasou ? t('🌙 Ficou de noite, mas a comida ficou uma delícia!', '🌙 It got dark, but the food is delicious!')
      : jogo.erros ? t('Você acertou quase tudo! Errinhos: ' + jogo.erros, 'You got almost everything right! Little mistakes: ' + jogo.erros) : t('Perfeito, sem nenhum erro! 👏', 'Perfect, no mistakes at all! 👏');
    var nv = jogo.cfg, ordem = jogo.cz.feitos.map(function (id) { return jogo.passos.filter(function (p) { return p.id === id; })[0]; });
    $('cartao').innerHTML = '<h3>📜 ' + t('Receita da família', 'Family recipe') + '</h3><h4>' + jogo.rec.e + ' ' + tx(jogo.rec) + '</h4>' +
      '<p class="nivel-c">' + nv.e + ' ' + tx(nv) + ' · ' + hoje() + '</p><h5>' + t('Ingredientes', 'Ingredients') + '</h5><ul>' +
      jogo.precisa.map(function (x) { return '<li>' + icone(x.id) + ' ' + L.nomeQtd(x.id, x.q, en()) + '</li>'; }).join('') + '</ul><h5>' + t('Modo de fazer', 'How to make it') + '</h5><ol>' +
      ordem.map(function (p) { return '<li>' + texto(p) + '</li>'; }).join('') + '</ol><p class="dica-adulto">' + t('🧑‍🍳 Para fazer de verdade: chame um adulto para o fogão, o forno, a faca e o liquidificador. Bom apetite!', '🧑‍🍳 To make it for real: ask a grown-up for the stove, oven, knife and blender. Enjoy your meal!') + '</p>';
    var festa = qs($('pronto'), '.festa'); festa.innerHTML = '';
    ['🎉', '⭐', '💛', jogo.rec.e, '✨', '🎊'].forEach(function (e, i) { for (var k = 0; k < 3; k++) { var s = document.createElement('span'); s.textContent = e; s.style.left = (Math.random() * 96) + '%'; s.style.animationDelay = (Math.random() * 1.2) + 's'; festa.appendChild(s); } });
    Som.toca('fim');
    falar($('prontoTitulo').textContent);
    pilha = []; try { history.pushState({ cozinha: 'pronto' }, ''); } catch (e) { /* ok */ }
    mostrar('pronto');
  }
  function hoje() {
    var d = new Date(), M = en() ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] : ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    var dd = (d.getDate() < 10 ? '0' : '') + d.getDate();
    return en() ? M[d.getMonth()] + '/' + dd + '/' + d.getFullYear() : dd + '/' + M[d.getMonth()] + '/' + d.getFullYear();
  }
  $('btDeNovo').addEventListener('click', function () { var id = jogo.rec.id; novoJogo(id, jogo.nivel); pilha = ['menu']; mostrar('mapa'); });
  $('btOutra').addEventListener('click', function () { pilha = []; mostrar('menu'); });

  // ---------- música, service worker ----------
  if (window.Trilha) {
    var M = '../rabiscolandia/musicas/', au = 'Kevin MacLeod', lic = 'CC BY';
    Trilha.iniciar({ jogo: 'cozinha', creditos: 'CREDITOS.md', volume: 0.4, musicas: [
      { a: M + 'mariachi-snooze.mp3', t: 'Mariachi Snooze', au: au, lic: lic },
      { a: M + 'spazzmatica-polka.mp3', t: 'Spazzmatica Polka', au: au, lic: lic },
      { a: M + 'carpe-diem.mp3', t: 'Carpe Diem', au: au, lic: lic },
      { a: M + 'street-party.mp3', t: 'Street Party', au: au, lic: lic },
      { a: M + 'sunflower-dance-party.mp3', t: 'Sunflower Dance Party', au: au, lic: lic },
      { a: M + 'beachfront-celebration.mp3', t: 'Beachfront Celebration', au: au, lic: lic },
      { a: M + 'airport-lounge.mp3', t: 'Airport Lounge', au: au, lic: lic },
      { a: M + 'disco-lounge.mp3', t: 'Disco Lounge', au: au, lic: lic },
      { a: M + 'movement-proposition.mp3', t: 'Movement Proposition', au: au, lic: lic },
      { a: M + 'who-likes-to-party.mp3', t: 'Who Likes to Party', au: au, lic: lic },
      { a: M + 'gymnopedie-1.mp3', t: 'Gymnopédie nº 1 (Satie)', au: au, lic: lic }
    ] });
  }
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });

  traduzir(); desenharMenu();

  // para os testes e para quem quiser espiar no console
  window.Cozinha = { versao: APP_VERSION, jogo: function () { return jogo; }, atual: function () { return atual; }, ir: ir, mostrar: mostrar };
})();

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer jogar não baixa nada a mais. */
(function () {
  if (!/[?&]instalar\b/.test(location.search) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.src = '../instalar.js';
  s.setAttribute('data-nome', 'Cozinha'); s.setAttribute('data-icone', 'icone-192.png');
  s.setAttribute('data-so-com', 'instalar'); s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
  document.body.appendChild(s);
})();
