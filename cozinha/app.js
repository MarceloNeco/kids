/* Cozinha — telas, vila (mini-jogos de cada lugar), cesta, cozinha passo a passo, receita pronta e progresso.
   Regras sem tela ficam em logica.js; receitas, lugares e níveis em dados.js; desenhos em desenhos.js.
   Guarda só neste aparelho: preferências ("bolinho:cozinha:pref") e receitas feitas com as estrelas
   ("bolinho:cozinha:progresso"), em localStorage, sempre com try/catch.
   ?teste no endereço: tempos de espera bem curtos e frutas já maduras (usado pelos testes automáticos). */
(function () {
  'use strict';
  var APP_VERSION = '0.12.0';
  var APP_UPDATED = '14/Nov/2026';
  var D = window.CozinhaDados, L = window.CozinhaLogica, ART = window.CozinhaDesenhos, C = window.CozinhaCenas;
  var RAPIDO = /[?&]teste\b/.test(location.search);
  var V = RAPIDO ? 0.12 : 1;   // multiplica os tempos de espera
  var VA = RAPIDO && !/[?&]devagar\b/.test(location.search) ? 0.12 : 1;   // tempo das animações (?teste&devagar = de verdade)
  // "reduzir movimento" no aparelho: as cenas ficam paradas (sem voo, sem partícula, sem balanço)
  // movimento (v0.11.2): o botão 🎬 do jogo manda (pref.movimento); sem escolha, segue o aparelho ("remover animações")
  function calmo() {
    if (pref && pref.movimento === true) return false;
    if (pref && pref.movimento === false) return true;
    return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function aparelhoPedeCalma() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function aplicarMovimento() { document.documentElement.classList.toggle('parado', calmo()); var b = document.getElementById('btMovimento'); if (b) b.setAttribute('aria-pressed', String(!calmo())); }
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
  // o idioma é escolhido só na estante (🇧🇷 PT · 🇺🇸 EN · 🇪🇸 ES, ../idioma.js) e não fica mais guardado aqui
  var lingua = window.BolinhoIdioma ? BolinhoIdioma.atual() : 'pt';
  delete pref.lingua;
  if (typeof pref.voz !== 'boolean') pref.voz = true;
  if (typeof pref.efeitos !== 'boolean') pref.efeitos = true;
  if (!D.nivel[pref.nivel]) pref.nivel = 'facil';
  // família à mesa (v0.8.0): quem vai comer ("eu" sempre); fica guardado; o nível limita quantos (logica.maxPessoas)
  if (!Array.isArray(pref.familia)) pref.familia = ['eu'];
  pref.familia = ['eu'].concat(pref.familia.filter(function (x) { return x !== 'eu' && D.pessoa[x]; }));
  function familiaDoNivel(nivel) { var m = L.maxPessoas(nivel), l = pref.familia.slice(); while (l.length > m) l.splice(1, 1); return l; }
  function salvarPref() { gravar(CH_PREF, pref); }
  aplicarMovimento();
  var prog = ler(CH_PROG, null);
  if (!prog || typeof prog !== 'object' || !prog.r) prog = { r: {} };
  function estrelasDe(rec, nivel) { return (prog.r[rec] && prog.r[rec][nivel]) || 0; }
  function salvarProgresso(rec, nivel, est) {
    prog.r[rec] = prog.r[rec] || {};
    prog.r[rec][nivel] = Math.max(prog.r[rec][nivel] || 0, est);
    prog.feitas = (prog.feitas || 0) + 1;
    gravar(CH_PROG, prog);
  }

  function en() { return lingua === 'en'; }
  var IX = { pt: 0, en: 1, es: 2 };
  // texto no idioma escolhido: t('português', 'English', 'español'); sem o espanhol, cai no português
  function t(pt, ing, esp) { return lingua === 'en' ? ing : lingua === 'es' && esp != null ? esp : pt; }
  function tx(o) { return o[lingua] != null ? o[lingua] : o.pt; }
  function ix(lista) { var v = lista[IX[lingua]]; return v != null ? v : lista[0]; }   // listas [pt, en, es]
  function traduzir() {
    document.documentElement.lang = { pt: 'pt-BR', en: 'en', es: 'es' }[lingua];
    qsa(document, '[data-t]').forEach(function (el) { el.textContent = ix(el.getAttribute('data-t').split('|')); });
    qsa(document, '[data-rotulo]').forEach(function (el) { var r = ix(el.getAttribute('data-rotulo').split('|')); el.setAttribute('aria-label', r); if (el.hasAttribute('title')) el.title = r; });
    // nome do jogo letra por letra: Mão na Massa / My Little Big Chef / Manos a la Masa (cada palavra junta; quebra linha entre palavras)
    qsa(document, '.logo[data-logo]').forEach(function (el) {
      var nome = ix(el.getAttribute('data-logo').split('|'));
      el.setAttribute('aria-label', nome); el.textContent = '';
      nome.split(' ').forEach(function (w, i) {
        if (i) el.appendChild(document.createTextNode(' '));
        var p = el.appendChild(document.createElement('span')); p.className = 'palavra';
        w.split('').forEach(function (c) { p.appendChild(document.createElement('span')).textContent = c; });
      });
    });
    document.title = ix(qs(document, '.logo[data-logo]').getAttribute('data-logo').split('|')) + ' — Bolinho de Chuva · SolverONE';
    $('versao').textContent = t('Versão ', 'Version ', 'Versión ') + APP_VERSION + ' · ' + (en() ? 'Nov/14/2026' : lingua === 'es' ? APP_UPDATED.toLowerCase() : APP_UPDATED) +
      t(' · Músicas: Kevin MacLeod (incompetech.com), CC BY · ', ' · Music: Kevin MacLeod (incompetech.com), CC BY · ', ' · Música: Kevin MacLeod (incompetech.com), CC BY · ');
    var a = document.createElement('a'); a.href = 'CREDITOS.md'; a.target = '_blank'; a.rel = 'noopener'; a.textContent = t('créditos', 'credits', 'créditos'); $('versao').appendChild(a);
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
      var u = new SpeechSynthesisUtterance(limpo); u.lang = window.BolinhoIdioma ? BolinhoIdioma.voz() : 'pt-BR'; u.rate = jeito.rate || 0.95;
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
  // voz da Dona Cida (a vovozinha vizinha): a melhor voz FEMININA da língua do jogo (pt-BR, en-US ou es-ES primeiro;
  // nunca uma voz de outra língua: sem voz da língua, a fala vai só com u.lang). Nomes e códigos
  // conhecidos: femininas (Luciana, Francisca, Maria, Vitória, Fernanda, Thalita, Leila, Raquel, Camila, "feminina",
  // "female", Google português do Brasil no computador; no Android, pt-br-x-afs e pt-br-x-pte) e masculinas (Daniel,
  // Antônio, Ricardo, Felipe, "masculina", "male"; no Android, pt-br-x-ptd e pt-br-x-ptz), que só entram se não houver outra.
  // Voz masculina ou desconhecida (ex.: a voz padrão do Samsung): fala mais fininha (tom 1,45) e devagar (0,88) para
  // soar como uma vovó. A família pode trocar no 👵🔁 (gira entre as vozes do aparelho e fica guardada).
  var vozes = [], CH_VOZ = 'bolinho:cozinha:voz-vovo';
  function lerVozes() { try { vozes = speechSynthesis.getVoices() || []; } catch (e) { vozes = []; } }
  if (window.speechSynthesis) { lerVozes(); try { speechSynthesis.addEventListener('voiceschanged', lerVozes); } catch (e) { /* ok */ } setTimeout(lerVozes, 300); }
  var FEMININA = /female|femin|mulher|woman|luciana|francisca|fernanda|vit[oó]ria|\bmaria\b|joana|raquel|helo[ií]sa|camila|thalita|leila|let[ií]cia|samantha|karen|victoria|zira|susan|serena|moira|tessa|fiona|allison|\bava\b|jenny|\baria\b|google portugu[eê]s|google us english|pt-br-x-(afs|pte)\b|pt-pt-x-(sfs|jfb)\b|m[oó]nica|paulina|helena|\blaura\b|elvira|sabina|dalia|marisol|google espa[nñ]ol/i;
  var MASCULINA = /\bmale\b|mascul|homem|\bman\b|daniel|ant[oô]nio|ricardo|felipe|\bjo[aã]o\b|\bpaulo\b|duarte|cristiano|f[aá]bio|\bfred\b|\balex\b|\btom\b|\breed\b|\brocko\b|\beddy\b|grandpa|ralph|albert|bruce|\bdavid\b|\bmark\b|\bguy\b|pt-br-x-(ptd|ptz)\b|pt-pt-x-(jmn|pmj)\b|\bjorge\b|\bdiego\b|\bjuan\b|\bcarlos\b|\bpablo\b|\bra[uú]l\b|[aá]lvaro|enrique/i;
  function generoVoz(v) { var n = (v.name || '') + ' ' + (v.voiceURI || ''); return MASCULINA.test(n) ? 'm' : FEMININA.test(n) ? 'f' : '?'; }
  // as vozes da língua do jogo, da melhor para a vovó à pior: pt-BR antes de outro pt (en-US, es-ES); feminina, desconhecida, masculina
  function vozesDaLingua() {
    if (!vozes.length) lerVozes();
    var lg = lingua, certa = { pt: 'pt-br', en: 'en-us', es: 'es-es' }[lingua], NOTA = { f: 0, '?': 1, m: 2 };
    var norm = function (v) { return String(v.lang || '').toLowerCase().replace('_', '-'); };
    return vozes.filter(function (v) { return norm(v).indexOf(lg) === 0; }).map(function (v, i) { return { v: v, i: i, n: (norm(v) === certa ? 0 : 3) + NOTA[generoVoz(v)] }; })
      .sort(function (a, b) { return a.n - b.n || a.i - b.i; }).map(function (x) { return x.v; });
  }
  function vozGuardada() { var g = ler(CH_VOZ, {}) || {}; return g[lingua] || null; }
  function vozDaVovo() {
    var lista = vozesDaLingua(), nome = vozGuardada();
    return lista.filter(function (v) { return v.name === nome; })[0] || lista[0] || null;
  }
  // v0.6.1: em português a Dona Cida fala com a VOZ GRAVADA (voz/cida-*.mp3, voz feminina "Dora" do Kokoro, licença
  // Apache 2.0; CREDITOS.md): é sempre de mulher, em qualquer aparelho, e funciona sem internet. É o padrão; o 👵🔁 passa
  // para as vozes do aparelho e volta para a gravada. Em inglês e em espanhol: a voz de mulher do aparelho, daquela língua
  // (as gravações são em português).
  var GRAVADA = 'gravada';
  function usaGravada() { return lingua === 'pt' && (vozGuardada() || GRAVADA) === GRAVADA; }
  var somVovo = null, filaVovo = [];
  // toca a frase gravada (chave = voz/cida-<chave>.mp3). fila: espera a anterior acabar. aoFim: quando terminar.
  // Se o arquivo não tocar (aparelho sem suporte), devolve false e quem chamou usa a voz do aparelho.
  function tocarVovo(chave, fila, aoFim, seFalhar) {
    if (!window.Audio) return false;
    if (fila && somVovo && !somVovo.ended && !somVovo.paused) { filaVovo.push([chave, aoFim, seFalhar]); return true; }
    pararVovo();
    var a = new Audio('voz/cida-' + chave + '.mp3'); somVovo = a;
    if (window.Trilha) Trilha.volume(0.3);
    var fim = function () {
      if (somVovo !== a) return;
      somVovo = null; if (aoFim) aoFim();
      var prox = filaVovo.shift();
      if (prox) tocarVovo(prox[0], false, prox[1], prox[2]); else if (window.Trilha) Trilha.volume(null);
    };
    // não tocou (arquivo que não abriu, aparelho que não deixa): fala com a voz do aparelho
    var falhou = function () { if (somVovo !== a) return; if (seFalhar) { var f = seFalhar; seFalhar = null; f(); } fim(); };
    a.addEventListener('ended', fim); a.addEventListener('error', falhou);
    try { var pr = a.play(); if (pr && pr.catch) pr.catch(falhou); } catch (e) { falhou(); }
    return true;
  }
  function pararVovo() {
    filaVovo = [];
    if (somVovo) { var a = somVovo; somVovo = null; try { a.pause(); } catch (e) { /* ok */ } if (window.Trilha) Trilha.volume(null); }
  }
  function jeitoVovo(v) { return v && generoVoz(v) === 'f' ? { rate: 0.9, pitch: 1.2 } : { rate: 0.88, pitch: 1.45 }; }
  // 👵🔁 trocar a voz da vovó: passa para a próxima voz do aparelho (só as da língua escolhida), guarda e fala uma frase de exemplo
  function trocarVozVovo() {
    var lista = vozesDaLingua(), g = ler(CH_VOZ, {}) || {}, k = lingua;
    // em português a primeira opção é a voz gravada; depois cada voz do aparelho
    var opcoes = (lingua === 'pt' ? [GRAVADA] : []).concat(lista.map(function (v) { return v.name; }));
    if (!opcoes.length) { aviso(t('👵 Este aparelho não tem outra voz nesta língua.', '👵 This device has no other voice in this language.', '👵 Este dispositivo no tiene otra voz en este idioma.'), 2600, true); return; }
    var agora = usaGravada() ? GRAVADA : (vozDaVovo() || {}).name, i = opcoes.indexOf(agora);
    var nova = opcoes[(i + 1) % opcoes.length];
    g[k] = nova; gravar(CH_VOZ, g);
    if (opcoes.length < 2) aviso(t('👵 Este aparelho só tem esta voz. Ela fala mais fininha para parecer uma vovó.', '👵 This device only has this voice. It speaks a bit higher to sound like a grandma.', '👵 Este dispositivo solo tiene esta voz. Habla más agudito para parecer una abuelita.'), 3200, true);
    else aviso(t('👵 Voz da vovó: ', "👵 Grandma's voice: ", '👵 Voz de la abuelita: ') + (nova === GRAVADA ? t('gravada da Dona Cida', "Mrs. Cida's recorded voice", 'grabada de doña Cida') : nova) + ' (' + (opcoes.indexOf(nova) + 1) + '/' + opcoes.length + ')', 2600, true);
    if (nova === GRAVADA) { tocarVovo('exemplo'); return; }
    var vz = lista.filter(function (v) { return v.name === nova; })[0], j = jeitoVovo(vz), v = pref.voz; pref.voz = true;
    falar(t('Oi, meu bem! Assim está boa a minha voz de vovó?', 'Hello, sweetie! Does my grandma voice sound nice like this?', '¡Hola, cariño! ¿Te gusta así mi voz de abuelita?'), { rate: j.rate, pitch: j.pitch, voz: vz });
    pref.voz = v;
  }

  // ---------- telas e o Voltar do celular ----------
  var atual = 'entrada', pilha = [];
  function mostrar(id) {
    if (atual === 'lugar' && id !== 'lugar') limparLugar();
    if (atual === 'cozinha' && id !== 'cozinha') limparCozinha();
    if (atual === 'pronto' && id !== 'pronto') pararMenino();
    if (atual === 'mapa' && id !== 'mapa' && window.Cidade3D) Cidade3D.pausar();
    qsa(document, '.tela').forEach(function (s) { s.classList.toggle('ativa', s.id === id); });
    atual = id; window.scrollTo(0, 0);
    if (id === 'mapa') {
      desenharMapa();
      if (jogo && jogo.seguir) { var sg = jogo.seguir; jogo.seguir = null; setTimeout(function () { if (atual === 'mapa' && jogo) irPara(sg); }, 700); }
    }
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
  // navegação padrão (../navegacao.js): 🏠 Início volta à escolha da receita (tira do histórico as telas de dentro, para o
  // Voltar do celular sair do jogo a partir dali); o ← de cada tela continua voltando um passo; 🚪 Saída sai do jogo
  function irAoMenu() {
    if (atual === 'pronto') { history.back(); return; }
    var i = pilha.lastIndexOf('menu');
    if (i < 0) { pilha = []; mostrar('menu'); return; }
    var n = pilha.length - i; pilha.length = i + 1; history.go(-n);
  }
  if (window.BolinhoNav) BolinhoNav.iniciar({ jogo: 'cozinha', noInicio: function () { return atual === 'entrada' || atual === 'menu' || atual === 'desligado'; }, irParaInicio: irAoMenu,
    emAndamento: function () { return !!jogo && (atual === 'mapa' || atual === 'lugar' || atual === 'cozinha'); } });
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
  // capa: comidas de verdade (fotos) pulando em onda acima do ícone
  qs($('entrada'), '.enfeite').innerHTML = ['cenoura', 'morango', 'ovo', 'queijo', 'banana', 'tomate', 'peixe', 'leite'].map(function (id, i) { return ART.imgFoto(id, 'onda').replace('class="ic', 'style="--i:' + i + '" class="ic'); }).join('');
  $('btEntrar').addEventListener('click', function () {
    Som.acordar();
    try { if (window.matchMedia && matchMedia('(pointer: coarse)').matches && document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {}); } catch (e) { /* ok */ }
    mostrar('menu');   // a capa não fica no histórico: o Voltar do celular na escolha da receita sai do jogo
    // o aparelho pede menos movimento e a família ainda não escolheu: pergunta uma vez (nos testes, não)
    if (!RAPIDO && pref.movimento == null && aparelhoPedeCalma()) setTimeout(function () {
      abrirDialogo('<div class="ing-foto emoji" aria-hidden="true">🎬</div><h3 id="dialogoTitulo">' + t('Ligar as animações do jogo?', 'Turn on the game animations?', '¿Encender las animaciones del juego?') + '</h3>' +
        '<p>' + t('Este celular está pedindo menos movimento. No jogo, as animações ajudam a brincar: o cozinheirinho anda pela vila, os carros passam e a comida cai na tigela. Dá para mudar depois no botão 🎬.', 'This phone asks for less motion. In the game, animations help kids play: the little chef walks around the village, cars drive by and food drops into the bowl. You can change it later with the 🎬 button.', 'Este móvil pide menos movimiento. En el juego, las animaciones ayudan a jugar: el cocinerito camina por el pueblo, pasan los coches y la comida cae en el bol. Puedes cambiarlo luego con el botón 🎬.') + '</p>' +
        '<div class="linha-botoes"><button type="button" class="grande verde" data-acao="ligar">' + t('🎬 Ligar as animações', '🎬 Turn them on', '🎬 Encenderlas') + '</button><button type="button" class="medio" data-acao="parado">' + t('Deixar parado', 'Keep it still', 'Dejarlo quieto') + '</button></div>',
        function (a) { if (a === 'fora') return; pref.movimento = a === 'ligar'; salvarPref(); aplicarMovimento(); });
    }, 400);
  });
  $('btVoz').addEventListener('click', function () { pref.voz = !pref.voz; salvarPref(); traduzir(); aviso(pref.voz ? t('🗣️ Voz ligada', '🗣️ Voice on', '🗣️ Voz activada') : t('🗣️ Voz desligada', '🗣️ Voice off', '🗣️ Voz desactivada'), 1500, true); if (!pref.voz && window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) { /* ok */ } });
  $('btEfeitos').addEventListener('click', function () { pref.efeitos = !pref.efeitos; salvarPref(); traduzir(); Som.toca('toque'); });
  $('btVozVovo').addEventListener('click', trocarVozVovo);
  // 🎬 animações do jogo (v0.11.2): liga e desliga, e fica guardado
  $('btMovimento').addEventListener('click', function () {
    pref.movimento = calmo(); salvarPref(); aplicarMovimento(); Som.toca('toque');
    aviso(calmo() ? t('🎬 Animações desligadas', '🎬 Animations off', '🎬 Animaciones apagadas') : t('🎬 Animações ligadas!', '🎬 Animations on!', '🎬 ¡Animaciones encendidas!'), 1600, true);
  });

  // ---------- janela (diálogo) bonita: ingrediente tocado, pergunta das animações ----------
  var fecharDialogoCb = null;
  function abrirDialogo(html, aoFechar) {
    $('dialogoCorpo').innerHTML = html; $('dialogo').hidden = false; fecharDialogoCb = aoFechar || null;
    var c = qs($('dialogo'), '.dialogo-caixa'); c.classList.remove('entra'); void c.offsetWidth; c.classList.add('entra');
    var b = qs($('dialogo'), '[data-acao]'); if (b) b.focus();
  }
  function fecharDialogo(acao) {
    if ($('dialogo').hidden) return;
    $('dialogo').hidden = true; var cb = fecharDialogoCb; fecharDialogoCb = null; if (cb) cb(acao);
  }
  $('dialogo').addEventListener('click', function (e) {
    var b = e.target.closest('[data-acao]');
    if (b) { Som.toca('toque'); fecharDialogo(b.getAttribute('data-acao')); }
    else if (e.target === $('dialogo')) fecharDialogo('fora');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('dialogo').hidden) { e.stopPropagation(); fecharDialogo('fora'); } }, true);
  // o ingrediente tocado (cesta, ficha, "daqui ainda falta"): foto grande, nome, quanto já tem, onde achar e de onde vem
  function mostrarIngrediente(id) {
    var g = D.ingrediente[id]; if (!g) return;
    var r = jogo ? L.resumo(jogo.precisa, jogo.cesta).filter(function (x) { return x.id === id; })[0] : null;
    var onde = L.lugaresDe(id).map(function (l) { return '<li>' + D.lugar[l].e + ' ' + tx(D.lugar[l]) + '</li>'; }).join('');
    var conta = r ? (r.falta ? t('Você tem ' + r.tem + ' de ' + r.precisa + '. Falta ' + r.falta + '.', 'You have ' + r.tem + ' of ' + r.precisa + '. ' + r.falta + ' to go.', 'Tienes ' + r.tem + ' de ' + r.precisa + '. Falta' + (r.falta > 1 ? 'n ' : ' ') + r.falta + '.')
      : t('✅ Já tem tudo: ' + r.tem + ' de ' + r.precisa + '!', '✅ You have it all: ' + r.tem + ' of ' + r.precisa + '!', '✅ ¡Ya lo tienes todo: ' + r.tem + ' de ' + r.precisa + '!')) : '';
    abrirDialogo('<div class="ing-foto' + (ART.render(id) ? ' render' : '') + '"><img src="' + (ART.render(id) || ART.foto(id)) + '" alt=""></div><h3 id="dialogoTitulo">' + L.nomeIng(id, lingua) + '</h3>' +
      (conta ? '<p class="ing-conta' + (r && !r.falta ? ' ok' : '') + '">' + conta + '</p>' : '') +
      '<p class="ing-onde-t">' + t('Onde achar:', 'Where to find it:', 'Dónde encontrarlo:') + '</p><ul class="ing-onde">' + onde + '</ul>' +
      (g.fato ? '<p class="ing-fato">💡 ' + ix(g.fato) + '</p>' : '') +
      '<button type="button" class="grande verde" data-acao="ok">' + t('👍 Entendi', '👍 Got it', '👍 Entendido') + '</button>');
    falar(L.nomeIng(id, lingua));
  }
  ['cestaMapa', 'cestaLugar', 'recIngredientes', 'lugarPrecisa'].forEach(function (k) {
    $(k).addEventListener('click', function (e) {
      var el = e.target.closest('[data-ing]'); if (!el || !this.contains(el)) return;
      Som.toca('toque'); mostrarIngrediente(el.getAttribute('data-ing'));
    });
    $(k).addEventListener('keydown', function (e) {
      var el = e.target.closest('[data-ing]'); if (!el || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault(); mostrarIngrediente(el.getAttribute('data-ing'));
    });
  });
  $('btAjuda').addEventListener('click', function () { var a = $('ajuda'); a.hidden = !a.hidden; $('btAjuda').setAttribute('aria-expanded', String(!a.hidden)); });

  function desenharMenu() {
    $('niveis').innerHTML = D.NIVEIS.map(function (n) {
      return '<button type="button" class="nivel n-' + n.id + '" data-nivel="' + n.id + '" role="radio" aria-checked="' + (pref.nivel === n.id) + '">' +
        '<span class="nv-e">' + n.e + '</span><span class="nv-n">' + tx(n) + '</span><span class="nv-t">' + ix(n.txt) + '</span></button>';
    }).join('');
    $('receitas').innerHTML = D.RECEITAS.map(function (r) {
      var e = estrelasDe(r.id, pref.nivel);
      return '<button type="button" class="rec" data-rec="' + r.id + '" style="--c:' + r.cor + ';--i:' + D.RECEITAS.indexOf(r) + '">' +
        '<span class="rec-e rec-foto" aria-hidden="true"><img src="' + ART.foto(r.id) + '" alt="" draggable="false" decoding="async"></span><span class="rec-n">' + tx(r) + '</span>' +
        '<span class="rec-est" aria-label="' + e + t(' estrelas', ' stars', ' estrellas') + '">' + '⭐'.repeat(e) + '<span class="apagada">' + '☆'.repeat(3 - e) + '</span></span></button>';
    }).join('');
  }
  $('niveis').addEventListener('click', function (e) { var b = e.target.closest('[data-nivel]'); if (!b) return; pref.nivel = b.getAttribute('data-nivel'); salvarPref(); Som.toca('toque'); desenharMenu(); });
  $('receitas').addEventListener('click', function (e) { var b = e.target.closest('[data-rec]'); if (!b) return; Som.toca('toque'); abrirReceita(b.getAttribute('data-rec')); });

  // ---------- ficha da receita (antes de sair para buscar) ----------
  var recEscolhida = null;
  function abrirReceita(id) {
    var r = D.receita[id], nv = D.nivel[pref.nivel]; recEscolhida = id;
    $('recTitulo').textContent = tx(r);
    $('recPrato').innerHTML = '<img src="' + ART.foto(r.id) + '" alt="" draggable="false">'; $('recPrato').style.setProperty('--c', r.cor);
    $('recNivel').textContent = nv.e + ' ' + t('Nível ', 'Level: ', 'Nivel: ') + tx(nv);
    desenharFicha();
    ir('receita');
  }
  // o que depende de quem vai comer: rostos da família, porção, ingredientes (quantidades) e moedas
  function desenharFicha() {
    var r = D.receita[recEscolhida], nv = D.nivel[pref.nivel], fam = familiaDoNivel(nv), fator = L.fatorDe(fam.length), max = L.maxPessoas(nv);
    $('recFamilia').innerHTML = D.FAMILIA.map(function (f) {
      var on = fam.indexOf(f.id) >= 0;
      return '<button type="button" class="fam-bt' + (on ? ' on' : '') + '" data-pessoa="' + f.id + '" aria-pressed="' + on + '"' + (f.id === 'eu' ? ' disabled' : '') + '>' + C.pessoa(f, null, true) + '<span>' + tx(f) + '</span></button>';
    }).join('');
    var n = fam.length;
    $('recPorcao').textContent = t('🍽️ Para ' + n + (n > 1 ? ' pessoas' : ' pessoa') + (fator > 1 ? ' · receita x' + fator : '') + ' (até ' + max + ' neste nível)',
      '🍽️ For ' + n + (n > 1 ? ' people' : ' person') + (fator > 1 ? ' · recipe x' + fator : '') + ' (up to ' + max + ' on this level)',
      '🍽️ Para ' + n + (n > 1 ? ' personas' : ' persona') + (fator > 1 ? ' · receta x' + fator : '') + ' (hasta ' + max + ' en este nivel)');
    $('recIngredientes').innerHTML = L.ingredientesDoNivel(r, nv, fator).map(function (x, i) {
      var onde = L.lugaresDe(x.id).map(function (l) { return D.lugar[l].e; }).join(' ');
      return '<li style="--i:' + i + '" data-ing="' + x.id + '" role="button" tabindex="0">' + icone(x.id) + '<span class="q">' + L.nomeQtd(x.id, x.q, lingua) + '</span><span class="onde" title="' + t('onde achar', 'where to find', 'dónde encontrarlo') + '">' + onde + '</span></li>';
    }).join('');
    var m = L.moedasIniciais(r, nv, fator);
    var bolsa = nv.moedas ? t('Você tem 💰 ' + m + ' moedas', 'You have 💰 ' + m + ' coins', 'Tienes 💰 ' + m + ' monedas') : t('Hoje o mercadinho é de graça! 🎁', 'Today the shop is free! 🎁', '¡Hoy la tienda es gratis! 🎁');
    bolsa += t(' e 💛 ' + nv.favores + ' favores da vizinha.', ' and 💛 ' + nv.favores + ' favors from the neighbor.', ' y 💛 ' + nv.favores + ' favores de la vecina.');
    if (nv.tempo) bolsa += t(' ☀️ Tente terminar antes do sol se pôr.', ' ☀️ Try to finish before sunset.', ' ☀️ Intenta terminar antes de que se ponga el sol.');
    $('recBolsa').textContent = bolsa;
    $('recPassos').textContent = t('👩‍🍳 ' + L.passosDoNivel(r, nv).length + ' passos na cozinha.', '👩‍🍳 ' + L.passosDoNivel(r, nv).length + ' steps in the kitchen.', '👩‍🍳 ' + L.passosDoNivel(r, nv).length + ' pasos en la cocina.');
  }
  $('recFamilia').addEventListener('click', function (e) {
    var b = e.target.closest('[data-pessoa]'); if (!b || b.disabled) return;
    var antes = familiaDoNivel(pref.nivel).length;
    pref.familia = L.alternarPessoa(familiaDoNivel(pref.nivel), b.getAttribute('data-pessoa'), pref.nivel); salvarPref();
    Som.toca(familiaDoNivel(pref.nivel).length > antes ? 'pega' : 'toque');
    desenharFicha();
    var nb = qs($('recFamilia'), '[data-pessoa="' + b.getAttribute('data-pessoa') + '"]'); if (nb) { nb.classList.add('pulou'); nb.focus(); }
  });
  $('btBuscar').addEventListener('click', function () { novoJogo(recEscolhida, pref.nivel); ir('mapa'); });

  // ---------- partida ----------
  var jogo = null, tSol = null;
  function novoJogo(recId, nivel) {
    var r = D.receita[recId], nv = D.nivel[nivel];
    var fam = familiaDoNivel(nv), fator = L.fatorDe(fam.length);
    jogo = { rec: r, nivel: nivel, cfg: nv, familia: fam, fator: fator, precisa: L.ingredientesDoNivel(r, nv, fator), passos: L.passosDoNivel(r, nv), cesta: {},
      moedas: L.moedasIniciais(r, nv, fator), favores: nv.favores, pendente: null, erros: 0, inicio: Date.now(), imprevistoFeito: false, cz: null, pos: 'casa' };
    clearInterval(tSol);
    $('sol').hidden = !nv.tempo;
    if (nv.tempo) tSol = setInterval(desenharCarteira, 1000);
    $('mapaTitulo').innerHTML = ART.imgFoto(r.id, 'ic-titulo') + ' ' + tx(r);
    desenharCesta();
  }
  function tempoRestante() { if (!jogo || !jogo.cfg.tempo) return null; return Math.max(0, jogo.cfg.tempo - (Date.now() - jogo.inicio) / 1000); }
  function desenharCarteira() {
    if (!jogo) return;
    var h = '';
    if (jogo.cfg.moedas) h += '<span class="moedas" title="' + t('moedas', 'coins', 'monedas') + '">💰 ' + jogo.moedas + '</span>';
    h += '<span class="favores" title="' + t('favores da vizinha', 'favors from the neighbor', 'favores de la vecina') + '">💛 ' + jogo.favores + '</span>';
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
      return '<span class="item' + (r.falta ? '' : ' ok') + '" data-ing="' + r.id + '" role="button" tabindex="0" aria-label="' + L.nomeIng(r.id, lingua, 2) + ': ' + r.tem + t(' de ', ' of ', ' de ') + r.precisa + '">' + icone(r.id) + '<b>' + r.tem + '/' + r.precisa + '</b></span>';
    }).join('');
    $('cestaMapa').innerHTML = h; $('cestaLugar').innerHTML = h;
    var completa = L.completa(jogo.precisa, jogo.cesta);
    $('cestaMapa').classList.toggle('completa', completa); $('cestaLugar').classList.toggle('completa', completa);
    desenharCarteira();
  }
  function textoFalta() {
    return L.faltando(jogo.precisa, jogo.cesta).map(function (r) { return emojiDe(r.id) + L.nomeQtd(r.id, r.falta, lingua); }).join(', ');
  }

  // voa um ícone até a cesta (ou até outro elemento), num arco, e chega com um "pop" e faíscas no item da cesta.
  // op: id (o item da cesta que dá o pop), atraso (ms), arco (px para cima), gira (graus), dur (ms).
  function voar(html, de, para, op) {
    op = op || {};
    try {
      var alvo = para || qs(document, '.tela.ativa .cesta'); if (!alvo || !de) return;
      var achar = function () { return (!para && op.id && qs(alvo, '.item[data-ing="' + op.id + '"]')) || (!para && qs(alvo, '.cesta-ic')) || alvo; };
      var a = de.getBoundingClientRect(), b = achar().getBoundingClientRect();
      var ax = a.left + a.width / 2, ay = a.top + a.height / 2, bx = b.left + b.width / 2, by = b.top + b.height / 2;
      var chegou = function () { var d = achar(); d.classList.remove('pop'); void d.offsetWidth; d.classList.add('pop'); if (!calmo()) { var r = d.getBoundingClientRect(); C.faiscas(r.left + r.width / 2, r.top + r.height / 2, 6); } };
      if (calmo() || !Element.prototype.animate) { chegou(); return; }
      var v = document.createElement('div'); v.className = 'voando'; v.innerHTML = html;
      v.style.left = ax + 'px'; v.style.top = ay + 'px';
      document.body.appendChild(v);
      var dx = bx - ax, dy = by - ay, arco = op.arco != null ? op.arco : 90, gira = op.gira || 0, dur = op.dur || 820;
      var anim = v.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + (dx * 0.45).toFixed(1) + 'px), calc(-50% + ' + (Math.min(0, dy) * 0.45 - arco).toFixed(1) + 'px)) scale(1.15) rotate(' + (gira / 2) + 'deg)', opacity: 1, offset: 0.45 },
        { transform: 'translate(calc(-50% + ' + dx.toFixed(1) + 'px), calc(-50% + ' + dy.toFixed(1) + 'px)) scale(.5) rotate(' + gira + 'deg)', opacity: 0.9 }
      ], { duration: dur, delay: op.atraso || 0, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'both' });
      anim.onfinish = function () { v.remove(); chegou(); };
      setTimeout(function () { if (v.parentNode) v.remove(); }, dur + (op.atraso || 0) + 600);
    } catch (e) { /* só enfeite */ }
  }
  // chegou um ingrediente na cesta (já somado)
  function recebeu(id, de, op) {
    voar(icone(id), de, null, Object.assign({ id: id }, op || {})); Som.toca('pega');
    var r = L.resumo(jogo.precisa, jogo.cesta).filter(function (x) { return x.id === id; })[0];
    var nome = emojiDe(id) + L.nomeIng(id, lingua);
    desenharCesta(); desenharPrecisa();
    if (L.completa(jogo.precisa, jogo.cesta)) aviso(t('🧺 Tudo na cesta! Volte para a vila e vá para 🏠 Casa cozinhar.', '🧺 Everything is in the basket! Go back to the village and head 🏠 Home to cook.', '🧺 ¡Todo está en la cesta! Vuelve al pueblo y ve a 🏠 Casa a cocinar.'), 3600);
    else if (!r) aviso(t('A receita não pede ' + nome + ', mas fica na cesta.', 'The recipe doesn\'t need ' + nome + ', but you can keep it in the basket.', 'La receta no lleva ' + nome + ', pero se queda en la cesta.'));
    else if (r.falta === 0) aviso(t('✅ Já tem ' + nome + ' que chega!', '✅ You have enough ' + nome + '!', '✅ ' + nome + ': ¡ya tienes lo que hace falta!'));
    else aviso('+1 ' + nome + ' · ' + t('falta ', 'still need ', r.falta > 1 ? 'faltan ' : 'falta ') + r.falta, 1800, true);
    ensinar(id);
    seguirSePronto();
  }
  // 💡 o jogo também ensina: de onde vem cada coisa ("A banana nasce em cachos na bananeira!"). Fica escrito no
  // lugar; no Fácil, a voz lê na primeira vez de cada ingrediente (menos na casa da vizinha, onde quem fala é ela).
  function ensinar(id) {
    var g = D.ingrediente[id], el = document.querySelector('#jogoLugar .fato');
    if (!g || !g.fato || !el) return;
    el.textContent = '💡 ' + ix(g.fato); el.hidden = false;
    el.classList.remove('entra'); void el.offsetWidth; el.classList.add('entra');
    jogo.fatos = jogo.fatos || {};
    if (!jogo.fatos[id] && jogo.cfg.id === 'facil' && lugarAtual !== 'vizinha') falar(ix(g.fato), { fila: true });
    jogo.fatos[id] = true;
  }
  function coletar(id, de, op) { L.por(jogo.cesta, id, 1); recebeu(id, de, op); }
  function erro() { if (jogo) jogo.erros++; Som.toca('erro'); }

  // ---------- vila (v0.7.0): cidadezinha "3D" vista de cima, com ruas, e o cozinheirinho que anda até cada lugar ----------
  // Os lugares continuam botões (data-lugar) numa grade (2 colunas em pé, 4 deitado/tablet); cada um é um bloquinho
  // desenhado no vila.js. As ruas passam nos vãos: uma rua embaixo de cada fileira e ruas de cima a baixo entre as
  // colunas. O cozinheirinho começa na porta de casa e anda pelas ruas até a porta do lugar tocado; lá ele entra.
  // Missão: uma faixa diz o que buscar agora e onde (no Fácil e no Médio uma seta pula em cima do lugar). Depois de pegar
  // tudo de um lugar, no Fácil e no Médio ele segue sozinho para o próximo (e para casa, com a cesta cheia).
  var VI = window.CozinhaVila, andando = null;
  var NATUREZA = ['rio', 'pomar', 'horta', 'galinheiro', 'vaca'];
  // o próximo lugar da missão: primeiro a natureza (de graça, e o jogo ensina de onde vem), depois mercadinho e vizinha;
  // entre eles, o que tem mais coisas da lista
  function proximoLugar() {
    if (!jogo) return null;
    if (L.completa(jogo.precisa, jogo.cesta)) return 'casa';
    var u = L.lugaresUteis(jogo.precisa, jogo.cesta), ids = Object.keys(u);
    if (!jogo.cfg.moedas && u.mercado && !ids.some(function (l) { return NATUREZA.indexOf(l) >= 0; })) return 'mercado';
    ids.sort(function (a, b) {
      var na = NATUREZA.indexOf(a) >= 0 ? 0 : L.LOJAS.indexOf(a) >= 0 ? 1 : 2, nb = NATUREZA.indexOf(b) >= 0 ? 0 : L.LOJAS.indexOf(b) >= 0 ? 1 : 2;
      return na - nb || u[b].length - u[a].length || D.LUGARES.findIndex(function (l) { return l.id === a; }) - D.LUGARES.findIndex(function (l) { return l.id === b; });
    });
    if (jogo.favores <= 0) ids = ids.filter(function (l) { return l !== 'vizinha'; }).concat(ids.indexOf('vizinha') >= 0 ? ['vizinha'] : []);
    return ids[0] || null;
  }
  function textoMissao() {
    var prox = proximoLugar();
    if (prox === 'casa') return t('🧺 Tudo na cesta! Agora é ir para 🏠 Casa cozinhar!', '🧺 Everything is in the basket! Now head 🏠 Home to cook!', '🧺 ¡Todo está en la cesta! ¡Ahora ve a 🏠 Casa a cocinar!');
    if (!jogo.cfg.brilho || !prox) return t('📜 Falta: ', '📜 Still missing: ', '📜 Falta: ') + textoFalta();
    var u = L.lugaresUteis(jogo.precisa, jogo.cesta)[prox] || [], falt = L.faltando(jogo.precisa, jogo.cesta);
    var o = u.map(function (id) { var f = falt.filter(function (r) { return r.id === id; })[0]; return emojiDe(id) + L.nomeQtd(id, f.falta, lingua); }).join(', ');
    var l = D.lugar[prox];
    return t('👉 Agora: buscar ' + o + ' em ' + l.e + ' ' + l.pt, '👉 Now: get ' + o + ' at ' + l.e + ' ' + l.en, '👉 Ahora: busca ' + o + ' en ' + l.e + ' ' + l.es);
  }
  // cidade 3D de verdade (cidade3d.js, v0.12.0) quando o aparelho tem 3D; senão (ou com ?vila2d) a vila desenhada de antes
  // nos testes (?teste) fica a vila desenhada, para os testes antigos; ?teste&vila3d testa a cidade 3D
  function usa3D() { return !!(window.Cidade3D && Cidade3D.suportado() && !/[?&]vila2d\b/.test(location.search) && (!RAPIDO || /[?&]vila3d\b/.test(location.search))); }
  window.addEventListener('cidade3d-pronta', function () { if (atual === 'mapa' && jogo) desenharMapa(); });
  function desenharMapa() {
    if (!jogo) return;
    var uteis = L.lugaresUteis(jogo.precisa, jogo.cesta), completa = L.completa(jogo.precisa, jogo.cesta), prox = jogo.cfg.brilho ? proximoLugar() : null;
    $('missao').textContent = textoMissao();
    var botoes = D.LUGARES.map(function (l) {
      var aqui = jogo.cfg.brilho && uteis[l.id] ? uteis[l.id] : null;
      var extra = '';
      if (l.id === 'casa') extra = completa ? '<span class="brilho">✨</span>' : '';
      else if (aqui) extra = '<span class="brilho">✨</span><span class="aqui">' + aqui.slice(0, 4).map(function (id) { return icone(id); }).join('') + '</span>';
      if (prox === l.id) extra += '<span class="seta" aria-hidden="true">⬇️</span>';
      return '<button type="button" class="lugar l-' + l.id + (l.id === 'casa' && completa ? ' pronta' : '') + (aqui ? ' util' : '') + (prox === l.id ? ' proximo' : '') + '" data-lugar="' + l.id + '">' +
        '<span class="nome">' + tx(l) + '</span>' + extra + '</button>';
    }).join('');
    if (usa3D()) {
      var vila = $('vila');
      vila.classList.add('vila3d');
      if (!qs(vila, '.cidade3d')) vila.innerHTML = '<div class="cidade3d" aria-hidden="true"></div><div class="rotulos"></div>' +
        '<div class="girar"><button type="button" class="mini" data-girar="-1" aria-label="' + t('Girar a cidade', 'Turn the town', 'Girar el pueblo') + '">⟲</button><button type="button" class="mini" data-girar="1" aria-label="' + t('Girar a cidade', 'Turn the town', 'Girar el pueblo') + '">⟳</button></div>';
      qs(vila, '.rotulos').innerHTML = botoes;
      desenharCesta();
      Cidade3D.montar(vila, { pos: jogo.pos || 'casa', aoTocar: function (id) { if (!jogo) return; Som.toca('toque'); irPara(id); }, instantaneo: calmo() || VA < 1,
        placas: { mercado: t('MERCADO', 'MARKET', 'MERCADO'), padaria: t('PADARIA', 'BAKERY', 'PANADERÍA') } });
      return;
    }
    $('vila').classList.remove('vila3d');
    $('vila').innerHTML = '<svg class="ruas" aria-hidden="true" focusable="false"></svg>' + D.LUGARES.map(function (l) {
      var aqui = jogo.cfg.brilho && uteis[l.id] ? uteis[l.id] : null;
      var extra = '';
      if (l.id === 'casa') extra = completa ? '<span class="brilho">✨</span>' : '';
      else if (aqui) extra = '<span class="brilho">✨</span><span class="aqui">' + aqui.slice(0, 4).map(function (id) { return icone(id); }).join('') + '</span>';
      if (prox === l.id) extra += '<span class="seta" aria-hidden="true">⬇️</span>';
      return '<button type="button" class="lugar l-' + l.id + (l.id === 'casa' && completa ? ' pronta' : '') + (aqui ? ' util' : '') + (prox === l.id ? ' proximo' : '') + '" data-lugar="' + l.id + '">' +
        '<span class="cena" aria-hidden="true">' + VI.bloco(l.id) + '</span><span class="nome">' + tx(l) + '</span><span class="faz">' + ix(l.faz) + '</span>' + extra + '</button>';
    }).join('') +
      '<span class="nuvem n1" aria-hidden="true">' + VI.nuvem() + '</span><span class="nuvem n2" aria-hidden="true">' + VI.nuvem() + '</span>' +
      '<span class="carro" aria-hidden="true">' + VI.carro('#3aa0e8') + '</span><span class="boneco" aria-hidden="true">' + VI.boneco() + '</span>';
    desenharCesta();
    if (atual === 'mapa') { desenharRuas(); porNaPorta(jogo.pos || 'casa'); }   // na hora (a tela já está visível) e de novo no próximo quadro
    requestAnimationFrame(function () { if (atual === 'mapa' && jogo && !andando) { desenharRuas(); porNaPorta(jogo.pos || 'casa'); } });
  }
  // geometria da vila: porta de cada lugar (meio da rua embaixo dele) e as ruas de cima a baixo entre as colunas
  function geo() {
    var vila = $('vila'), bs = qsa(vila, '.lugar'), cs = getComputedStyle(vila), gapL = parseFloat(cs.rowGap) || 24, gapC = parseFloat(cs.columnGap) || 16;
    var portas = {}, xs = [], linhas = [];
    bs.forEach(function (b) {
      var x = b.offsetLeft + b.offsetWidth * 0.8, y = b.offsetTop + b.offsetHeight + gapL / 2;   // a porta fica à direita do nome
      portas[b.getAttribute('data-lugar')] = [x, y];
      if (linhas.indexOf(y) < 0) linhas.push(y);
      var dir = b.offsetLeft + b.offsetWidth + gapC / 2; if (xs.indexOf(dir) < 0) xs.push(dir);
    });
    xs.sort(function (a, b) { return a - b; }); xs.pop();   // a última coluna não tem rua à direita
    return { portas: portas, verticais: xs, linhas: linhas.sort(function (a, b) { return a - b; }), larg: vila.clientWidth, alt: vila.clientHeight, gapL: gapL };
  }
  function desenharRuas() {
    var vila = $('vila'), svg = qs(vila, '.ruas'); if (!svg || !qs(vila, '.lugar')) return;
    var g = geo(), w = g.larg, h = g.alt, rua = Math.max(12, g.gapL * 0.62), y0 = g.linhas[0], y1 = g.linhas[g.linhas.length - 1];
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); svg.setAttribute('width', w); svg.setAttribute('height', h);
    var d = g.linhas.map(function (y) { return 'M6 ' + y + ' H' + (w - 6); }).join(' ') + ' ' + g.verticais.map(function (x) { return 'M' + x + ' ' + (y0 - (g.linhas.length > 1 ? 0 : 0)) + ' V' + y1; }).join(' ');
    svg.innerHTML = '<path d="' + d + '" stroke="#b8b0a2" stroke-width="' + (rua + 4) + '" stroke-linecap="round" fill="none"/>' +
      '<path d="' + d + '" stroke="#d9d3c7" stroke-width="' + rua + '" stroke-linecap="round" fill="none"/>' +
      '<path d="' + d + '" stroke="#fff" stroke-width="1.6" stroke-dasharray="7 7" fill="none" opacity=".9"/>';
    var carro = qs(vila, '.carro'); if (carro) { carro.style.top = (y0 - 13) + 'px'; carro.style.setProperty('--larg', w + 'px'); }
  }
  window.addEventListener('resize', function () { if (atual === 'mapa' && jogo && !andando && !$('vila').classList.contains('vila3d')) { desenharRuas(); porNaPorta(jogo.pos || 'casa'); } });
  function porNaPorta(id) {
    var bon = qs($('vila'), '.boneco'), p = geo().portas[id]; if (!bon || !p) return;
    bon.style.transform = 'translate(' + p[0] + 'px,' + p[1] + 'px)'; bon.classList.remove('anda', 'entra');
  }
  // anda pelas ruas até a porta do lugar e chama aoChegar. Com "reduzir movimento" ou nos testes rápidos, chega na hora.
  function andarAte(id, aoChegar) {
    if (usa3D() && qs($('vila'), '.cidade3d')) {
      jogo.pos = id; andando = id;
      Cidade3D.andar(id, function () { andando = null; if (atual === 'mapa') aoChegar(); });
      return;
    }
    var vila = $('vila'), bon = qs(vila, '.boneco'), g = geo(), de = g.portas[jogo.pos || 'casa'], ate = g.portas[id];
    jogo.pos = id;
    if (!bon || !de || !ate || calmo() || VA < 1 || !Element.prototype.animate) { aoChegar(); return; }
    var cam = [de];
    if (Math.abs(de[1] - ate[1]) > 2) {
      var vx = g.verticais.slice().sort(function (a, b) { return (Math.abs(de[0] - a) + Math.abs(a - ate[0])) - (Math.abs(de[0] - b) + Math.abs(b - ate[0])); })[0];
      if (vx == null) vx = de[0];
      cam.push([vx, de[1]], [vx, ate[1]]);
    }
    cam.push(ate);
    var dist = [0]; for (var i = 1; i < cam.length; i++) dist.push(dist[i - 1] + Math.abs(cam[i][0] - cam[i - 1][0]) + Math.abs(cam[i][1] - cam[i - 1][1]));
    var tot = dist[dist.length - 1] || 1, quadros = [], lado = 1;
    for (var k = 0; k < cam.length; k++) {
      var nl = k < cam.length - 1 && cam[k + 1][0] !== cam[k][0] ? (cam[k + 1][0] < cam[k][0] ? -1 : 1) : lado;
      var tr = function (l) { return 'translate(' + cam[k][0] + 'px,' + cam[k][1] + 'px) scaleX(' + l + ')'; };
      quadros.push({ offset: dist[k] / tot, transform: tr(lado) });
      if (nl !== lado) { quadros.push({ offset: dist[k] / tot, transform: tr(nl) }); lado = nl; }
    }
    andando = id; bon.classList.add('anda'); Som.toca('toque');
    var anim = bon.animate(quadros, { duration: Math.min(2600, 260 + tot / 0.22), easing: 'linear', fill: 'forwards' });
    anim.onfinish = function () {
      bon.style.transform = quadros[quadros.length - 1].transform; anim.cancel();
      bon.classList.remove('anda'); bon.classList.add('entra');
      setTimeout(function () { andando = null; if (atual === 'mapa') aoChegar(); }, 280);
    };
  }
  function irPara(id) {
    if (andando) return;
    var faz = function () { if (id === 'casa') irCasa(); else abrirLugar(id); };
    // em casa sem a cesta cheia: avisa na hora (não precisa andar até lá para saber)
    if (id === 'casa' && !L.completa(jogo.precisa, jogo.cesta)) { faz(); return; }
    andarAte(id, faz);
  }
  $('vila').addEventListener('click', function (e) {
    var gi = e.target.closest('[data-girar]'); if (gi && window.Cidade3D) { Cidade3D.girar(+gi.getAttribute('data-girar')); Som.toca('toque'); return; }
    var b = e.target.closest('[data-lugar]'); if (!b || !jogo) return;
    Som.toca('toque');
    irPara(b.getAttribute('data-lugar'));
  });
  // depois de pegar tudo o que precisava de um lugar: no Fácil e no Médio volta à vila e segue sozinho para o próximo
  // lugar (ou para casa); no Difícil só volta à vila (a criança escolhe). Nos testes só com ?teste&seguir.
  var SEGUIR = !RAPIDO || /[?&]seguir\b/.test(location.search);
  function seguirSePronto() {
    if (!SEGUIR || !jogo || atual !== 'lugar' || !lugarAtual || jogo.saindo) return;
    if ((L.lugaresUteis(jogo.precisa, jogo.cesta)[lugarAtual] || []).length) return;
    var de = lugarAtual, prox = proximoLugar();
    jogo.saindo = true;
    agendar(function () {
      jogo.saindo = false;
      if (atual !== 'lugar' || lugarAtual !== de) return;
      jogo.seguir = jogo.cfg.brilho ? prox : null;
      if (prox) aviso(prox === 'casa' ? t('✔ Pronto aqui! Agora vamos para casa cozinhar! 🏠', '✔ Done here! Now let\'s go home to cook! 🏠', '✔ ¡Listo aquí! ¡Ahora vamos a casa a cocinar! 🏠')
        : t('✔ Pronto aqui! Agora: ', '✔ Done here! Next: ', '✔ ¡Listo aquí! Ahora: ') + D.lugar[prox].e + ' ' + tx(D.lugar[prox]), 2600, true);
      voltar();
    }, (de === 'vizinha' ? 3600 : de === 'mercado' ? 2400 : 1500) * V);
  }
  function irCasa() {
    if (!L.completa(jogo.precisa, jogo.cesta)) { aviso(t('Ainda falta: ', 'Still missing: ', 'Todavía falta: ') + textoFalta(), 4200); return; }
    if (jogo.cfg.evento && !jogo.imprevistoFeito) {
      jogo.imprevistoFeito = true;
      var id = L.imprevisto(jogo.precisa, jogo.cesta);
      if (id) {
        L.tirar(jogo.cesta, id, 1); desenharMapa(); Som.toca('erro');
        aviso(t('Ops! 🐶 O Biscoito, o cachorrinho, pegou 1 ' + emojiDe(id) + L.nomeIng(id, 'pt') + ' da cesta! Vá buscar mais.',
          'Oops! 🐶 Biscuit the puppy took 1 ' + emojiDe(id) + L.nomeIng(id, 'en') + ' from the basket! Go get another one.',
          '¡Uy! 🐶 Biscoito, el perrito, se ha llevado 1 ' + emojiDe(id) + L.nomeIng(id, 'es') + ' de la cesta. ¡Ve a buscar otro!'), 5000);
        return;
      }
    }
    ir('cozinha'); iniciarCozinha();
  }

  // ---------- lugares (mini-jogos) ----------
  var lugarAtual = null, tLugar = [], fimLugar = [];
  function agendar(fn, ms) { var id = setTimeout(fn, ms); tLugar.push(function () { clearTimeout(id); }); return id; }
  function repetir(fn, ms) { var id = setInterval(fn, ms); tLugar.push(function () { clearInterval(id); }); return id; }
  function limparLugar() { if (jogo) jogo.saindo = false; tLugar.forEach(function (f) { f(); }); tLugar = []; fimLugar.forEach(function (f) { try { f(); } catch (e) { /* ok */ } }); fimLugar = []; lugarAtual = null; var j = document.getElementById('jogoLugar'); if (j) j.innerHTML = ''; }
  function desenharPrecisa() {
    if (!jogo || !lugarAtual) return;
    var u = L.lugaresUteis(jogo.precisa, jogo.cesta)[lugarAtual] || [];
    var falt = L.faltando(jogo.precisa, jogo.cesta);
    $('lugarPrecisa').innerHTML = u.length ? t('Daqui ainda falta: ', 'Still needed from here: ', 'De aquí todavía falta: ') + u.map(function (id) {
      var f = falt.filter(function (r) { return r.id === id; })[0]; return '<span class="pq" data-ing="' + id + '" role="button" tabindex="0">' + icone(id) + ' ' + f.falta + '</span>';
    }).join(' ') : (falt.length ? t('Daqui não falta nada. Tente outro lugar! 🗺️', 'Nothing needed from here. Try another place! 🗺️', 'De aquí no falta nada. ¡Prueba en otro sitio! 🗺️') : t('🧺 Tudo na cesta! Vá para 🏠 Casa.', '🧺 Everything is in the basket! Head 🏠 Home.', '🧺 ¡Todo está en la cesta! Ve a 🏠 Casa.'));
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
    var fato = document.createElement('p'); fato.className = 'fato'; fato.hidden = true; fato.setAttribute('aria-live', 'polite'); area.appendChild(fato);
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
  // Pomar: cada fruta só nasce na sua planta de verdade (macieira, laranjeira, limoeiro, bananeira, pé de morango,
  // parreira), com o nome da planta embaixo. Aparecem só as plantas do que a receita pede (e mais uma, se for uma só).
  MINI.pomar = function (area) {
    var tipos = tiposDe('pomar', 2), nv = jogo.cfg;
    area.innerHTML = '<p class="instr">' + t('Cada fruta nasce na sua planta! Toque nas frutas maduras e coloridas. As verdinhas ainda precisam esperar.', 'Each fruit grows on its own plant! Tap the ripe, colorful fruit. The green ones still need to wait.', '¡Cada fruta crece en su planta! Toca las frutas maduras y de colores. Las verdes todavía tienen que esperar.') + '</p>' +
      '<div class="pomar"></div>';
    var pomar = qs(area, '.pomar');
    ajudante(pomar, '.pe');
    tipos.forEach(function (tipo) {
      var pid = D.ingrediente[tipo].planta, pl = D.planta[pid];
      var pe = document.createElement('div'); pe.className = 'pe p-' + pid; pe.setAttribute('data-planta', pid);
      pe.innerHTML = '<div class="pe-quadro">' + ART.planta(pid) + '</div><p class="pe-nome"><b>' + tx(pl) + '</b><span>' + (en() ? pl.pt : pl.en) + '</span></p>';
      var quadro = qs(pe, '.pe-quadro');
      ART.FRUTOS[pid].forEach(function (pos) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'fruta f-' + tipo;
        b.style.left = pos[0] + '%'; b.style.top = (pos[1] / 1.25) + '%';
        quadro.appendChild(b);
        function nascer(madura) {
          b.setAttribute('data-ing', tipo); b.innerHTML = ART.fruto(tipo) || ART.icone(tipo, true); b.disabled = false;
          b.classList.remove('caiu', 'colhe'); b.classList.toggle('madura', !!madura); b.classList.toggle('verde', !madura);
          b.setAttribute('aria-label', L.nomeIng(tipo, lingua) + (madura ? t(' madura', ' ripe', ' madura') : t(' verde', ' unripe', ' verde')) + ' — ' + tx(pl));
        }
        nascer(RAPIDO || Math.random() < nv.madura);
        b.addEventListener('click', function () {
          if (b.disabled) return;
          if (b.classList.contains('madura')) {
            // balança, solta do galho com um pulinho e voa para a cesta
            b.disabled = true; b.classList.add('colhe');
            coletar(tipo, b, { atraso: calmo() ? 0 : 300, arco: 110, gira: 30 });
            agendar(function () { b.classList.remove('colhe'); b.classList.add('caiu'); }, calmo() ? 0 : 320);
            agendar(function () { nascer(RAPIDO); }, 1600 * V);
          } else {
            b.classList.remove('balanca'); void b.offsetWidth; b.classList.add('balanca'); Som.toca('toque');
            aviso(t('Ainda está verde! Espere ficar madura. 🟢➜🟠', 'Still green! Wait until it\'s ripe. 🟢➜🟠', '¡Todavía está verde! Espera a que madure. 🟢➜🟠'), 1800);
          }
        });
      });
      pomar.appendChild(pe);
    });
    repetir(function () {
      var verdes = qsa(pomar, '.fruta.verde:not(:disabled)');
      if (verdes.length) { var b = verdes[Math.floor(Math.random() * verdes.length)]; b.classList.remove('verde'); b.classList.add('madura'); b.setAttribute('aria-label', L.nomeIng(b.getAttribute('data-ing'), lingua) + t(' madura', ' ripe', ' madura')); }
    }, 1500 * V);
  };

  // ajudante (v0.9.0): o bonequinho entra no lugar junto e anda até a planta, a árvore ou a galinha que a criança tocar
  // (só enfeite: a brincadeira não espera por ele). Com "reduzir movimento" ele chega na hora.
  function ajudante(caixa, seletor) {
    caixa.classList.add('tem-ajudante');
    var a = document.createElement('span'); a.className = 'ajudante'; a.setAttribute('aria-hidden', 'true'); a.innerHTML = VI.boneco(); caixa.appendChild(a);
    var x = 0, tAnda = 0;
    function por(nx, ny, dur) {
      a.style.setProperty('--dur', dur + 's'); a.classList.toggle('esq', nx < x); x = nx;
      a.style.left = nx + 'px'; a.style.top = ny + 'px';
    }
    requestAnimationFrame(function () { por(Math.min(40, caixa.clientWidth * 0.1), caixa.clientHeight - 4, 0); });
    caixa.addEventListener('pointerdown', function (e) {
      var el = e.target.closest(seletor); if (!el || !caixa.contains(el)) return;
      var cr = caixa.getBoundingClientRect(), r = el.getBoundingClientRect();
      var cx = r.left - cr.left + r.width / 2, nx = cx > caixa.clientWidth / 2 ? cx - r.width * 0.42 : cx + r.width * 0.42, ny = Math.min(caixa.clientHeight - 2, r.bottom - cr.top);
      var dist = Math.abs(nx - x) + Math.abs(ny - (parseFloat(a.style.top) || 0)), dur = calmo() || VA < 1 ? 0 : Math.min(0.9, 0.15 + dist / 420);
      a.classList.remove('puxa'); a.classList.add('anda'); por(nx, ny, dur);
      clearTimeout(tAnda); tAnda = setTimeout(function () { a.classList.remove('anda'); void a.offsetWidth; a.classList.add('puxa'); }, dur * 1000);
    });
  }

  // Horta: cenoura e batata crescem EMBAIXO da terra (dá para ver pela terra) e se arrancam puxando 3 vezes;
  // tomate no tomateiro com estaca, alface (bola de folhas) e cheiro-verde em cima da terra: um toque colhe.
  MINI.horta = function (area) {
    var tipos = tiposDe('horta', 3);
    var forma = function (id) { return D.planta[D.ingrediente[id].planta].forma; };
    var raiz = tipos.some(function (id) { return forma(id) === 'raiz'; }), cima = tipos.some(function (id) { return forma(id) !== 'raiz'; });
    area.innerHTML = '<p class="instr">' + (raiz ? t('O que cresce embaixo da terra: toque 3 vezes (ou puxe o dedo para cima) para arrancar. ', 'What grows under the ground: tap 3 times (or swipe up) to pull it out. ', 'Lo que crece bajo la tierra: toca 3 veces (o desliza el dedo hacia arriba) para arrancarlo. ') : '') +
      (cima ? t('O que cresce em cima da terra: um toque colhe.', 'What grows above the ground: one tap picks it.', 'Lo que crece sobre la tierra: con un toque lo coges.') : '') + '</p><div class="canteiro cercado"></div>';
    var cant = qs(area, '.canteiro');
    ajudante(cant, '.planta');
    for (var i = 0; i < 6; i++) (function (i) {
      var tipo = tipos[i % tipos.length], f = forma(tipo), pl = D.planta[D.ingrediente[tipo].planta], vezes = f === 'raiz' ? 3 : 1;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'planta f-' + f; b.setAttribute('data-ing', tipo);
      b.innerHTML = '<span class="puxa" aria-hidden="true">' + ART.horta(tipo) + '</span><span class="terra" aria-hidden="true"></span>' +
        (f === 'estaca' ? '<span class="legume" aria-hidden="true">' + ART.icone(tipo, true) + '</span>' : '') +
        '<span class="pe-nome" aria-hidden="true"><b>' + tx(pl) + '</b><span>' + (en() ? pl.pt : pl.en) + '</span></span>';
      cant.appendChild(b);
      var puxou = 0, y0 = null;
      function nascer() {
        puxou = 0; b.disabled = false; b.classList.remove('saiu');
        b.style.setProperty('--sobe', '0');
        b.setAttribute('aria-label', (vezes > 1 ? t('Puxar ', 'Pull ', 'Arrancar ') : t('Colher ', 'Pick ', 'Coger ')) + L.nomeIng(tipo, lingua) + ' — ' + tx(pl));
      }
      function puxar(n) {
        if (b.disabled) return;
        puxou = Math.min(vezes, puxou + n); b.style.setProperty('--sobe', String(puxou)); Som.toca('toque');
        terra(puxou >= vezes ? 12 : 5);
        if (puxou >= vezes) { b.disabled = true; b.classList.add('saiu'); coletar(tipo, b, { arco: 70, gira: -20 }); agendar(nascer, 1700 * V); }
      }
      // pedacinhos de terra pulando (só do que cresce embaixo da terra; o resto solta folhinhas)
      function terra(n) {
        if (calmo()) return;
        var r = b.getBoundingClientRect();
        if (f === 'raiz') C.migalhas(r.left + r.width * 0.47, r.top + r.height * 0.44, '#6e452c', n, { abre: 70, sobe: 26, cai: 34 });
        else C.migalhas(r.left + r.width * 0.47, r.top + r.height * 0.36, '#6cc65a', Math.ceil(n / 2), { abre: 50, sobe: 14, cai: 40 });
      }
      b.addEventListener('pointerdown', function (e) { y0 = e.clientY; });
      b.addEventListener('pointerup', function (e) { var dy = y0 == null ? 0 : e.clientY - y0; y0 = null; puxar(dy < -30 ? 3 : 1); });
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); puxar(1); } });
      nascer();
    })(i);
  };

  MINI.galinheiro = function (area) {
    var n = jogo.cfg.id === 'facil' || RAPIDO ? 3 : jogo.cfg.id === 'medio' ? 2 : 1;
    area.innerHTML = '<p class="instr">' + t('Toque numa galinha para ela levantar. Se tiver ovo, pegue com cuidado!', 'Tap a hen so she stands up. If there\'s an egg, pick it up gently!', 'Toca una gallina para que se levante. Si hay un huevo, ¡cógelo con cuidado!') + '</p><div class="poleiro casinha-galinha"></div>';
    var pol = qs(area, '.poleiro');
    ajudante(pol, '.ninho');
    var ordem = embaralhar([0, 1, 2]);
    [0, 1, 2].forEach(function (i) {
      var temOvo = ordem.indexOf(i) < n;
      var ninho = document.createElement('div'); ninho.className = 'ninho';
      ninho.innerHTML = '<button type="button" class="galinha" aria-label="' + t('Galinha', 'Hen', 'Gallina') + ' ' + (i + 1) + '">🐔</button><button type="button" class="ovo" hidden aria-label="' + t('Pegar o ovo', 'Pick up the egg', 'Coger el huevo') + '">🥚</button><span class="palha" aria-hidden="true"></span>';
      pol.appendChild(ninho);
      var g = qs(ninho, '.galinha'), o = qs(ninho, '.ovo');
      g.addEventListener('click', function () {
        g.classList.remove('levanta'); void g.offsetWidth; g.classList.add('levanta'); Som.toca('toque');
        if (temOvo) { o.hidden = false; aviso(t('Có-có! Tem um ovo! 🥚', 'Cluck-cluck! There\'s an egg! 🥚', '¡Coc-coc! ¡Hay un huevo! 🥚'), 1600, true); }
        else aviso(t('Có-có... Essa galinha ainda não botou ovo. Tente outra ou volte daqui a pouco!', 'Cluck... This hen hasn\'t laid an egg yet. Try another one or come back soon!', 'Coc... Esta gallina todavía no ha puesto ningún huevo. ¡Prueba otra o vuelve dentro de un ratito!'), 2400);
      });
      o.addEventListener('click', function () {
        coletar('ovo', o, { arco: 46, gira: 25, dur: 950 }); o.hidden = true; temOvo = false;
        agendar(function () { temOvo = true; }, 4000 * V);
      });
    });
  };

  MINI.vaca = function (area) {
    area.innerHTML = '<p class="instr">' + t('Faça carinho na Mimosa e segure o botão para tirar o leite no balde.', 'Pet Mimosa and hold the button to milk her into the bucket.', 'Acaricia a Mimosa y mantén pulsado el botón para ordeñarla en el cubo.') + '</p>' +
      // v0.9.0: a Mimosa desenhada grande e a criança sentada no banquinho, tirando o leite no balde
      '<div class="pasto pasto-v2"><button type="button" class="mimosa" aria-label="' + t('Fazer carinho na vaca', 'Pet the cow', 'Acariciar a la vaca') + '">' + VI.vacaGrande() + '</button>' +
      '<div class="jarra-zona" aria-hidden="true"><span class="jorro-leite"></span><div class="jarra balde"><div class="leite-nivel"></div></div></div>' +
      '<span class="ordenhador" aria-hidden="true">' + VI.ordenha() + '</span></div>' +
      '<button type="button" class="grande bt-segurar" id="btOrdenhar">' + t('🥛 Segure para tirar o leite', '🥛 Hold to get the milk', '🥛 Mantén pulsado para sacar la leche') + '<span class="barra"><span></span></span></button>';
    var vaca = qs(area, '.mimosa'), nivelEl = qs(area, '.leite-nivel'), bt = qs(area, '.bt-segurar'), barra = qs(bt, '.barra span'), pasto = qs(area, '.pasto');
    // o leite cai em jorro na xícara enquanto o dedo segura
    bt.addEventListener('pointerdown', function () { pasto.classList.add('ordenhando'); });
    ['pointerup', 'pointerleave', 'pointercancel', 'keyup'].forEach(function (k) { bt.addEventListener(k, function () { pasto.classList.remove('ordenhando'); }); });
    vaca.addEventListener('click', function () {
      var c = document.createElement('span'); c.className = 'coracao'; c.textContent = '❤️'; vaca.appendChild(c); setTimeout(function () { c.remove(); }, 900);
      aviso(t('Muuu! A Mimosa gostou do carinho. 💛', 'Mooo! Mimosa loved the petting. 💛', '¡Muuu! A Mimosa le han encantado las caricias. 💛'), 1500, true);
    });
    var parar = segurar(bt, 1700 * V, function (p) { nivelEl.style.height = (p * 100) + '%'; barra.style.width = (p * 100) + '%'; }, function () {
      pasto.classList.remove('ordenhando');
      coletar('leite', qs(area, '.jarra'), { arco: 60 }); setTimeout(function () { nivelEl.style.height = '0%'; barra.style.width = '0%'; }, 300);
    });
    fimLugar.push(parar);
  };

  // Rio: 3 peixinhos nadam; o anzol fica parado no meio, dentro do círculo. Puxar com um peixe no círculo = fisgou:
  // o peixe nada até o anzol, a linha recolhe e ele sobe se mexendo, sai da água com respingo, a vara leva até o
  // balde e ele cai lá dentro. Os outros peixes continuam nadando, e um peixe novo entra pelo lado.
  // Tudo desenhado num quadro só (requestAnimationFrame, só transform e atributos do SVG). Movimento reduzido:
  // sobe reto, sem se mexer e sem respingo.
  MINI.rio = function (area) {
    // ?teste deixa o círculo enorme (os testes pescam de primeira); ?teste&pescareal usa o círculo de verdade do nível
    var nv = jogo.cfg, zona = RAPIDO && !/[?&]pescareal\b/.test(location.search) ? 0.5 : nv.zonaPeixe, vel = nv.velPeixe;
    var varia = nv.id === 'dificil' ? 1.0 : 0.7, parado = false;   // cada peixe tem a sua velocidade (no Difícil, uns bem mais rápidos)
    function sortearVel() { return parado ? 0 : vel * (0.6 + Math.random() * varia); }
    var calmo = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    var SUP = 0.42, ANZOL_Y = 0.7, TIP0 = [0.5, 0.05], TIP_B = [0.6, 0.02], BASE = [0.05, 0.36], ESC = 1.3, RAIAS = [0.58, 0.71, 0.84];
    area.innerHTML = '<p class="instr">' + t('Toque em Puxar quando um peixinho passar dentro do círculo, perto do anzol. Ele fica preso no anzol e vai para o balde!', 'Tap Pull when a little fish swims inside the circle, near the hook. It gets hooked and goes into the bucket!', 'Toca Tirar cuando un pececito pase dentro del círculo, cerca del anzuelo. ¡Se queda en el anzuelo y va al cubo!') + '</p>' +
      '<div class="agua" data-fase="pronto"><div class="ondas"></div><div class="superficie"></div><div class="margem m-esq"></div><div class="margem m-dir"></div>' +
      '<div class="alvo" style="--z:' + (zona * 200) + '%"></div><div class="balde-boca"></div><div class="cardume"></div>' +
      '<svg class="pesca" aria-hidden="true"><path class="vara-sombra"/><path class="vara"/><path class="vara-luz"/><path class="cabo"/><circle class="carretilha" r="5"/>' +
      '<path class="fio-halo"/><path class="fio"/>' +
      '<g class="boia"><circle r="5.5" class="boia-b"/><path class="boia-v" d="M-5.5,0 A5.5,5.5 0 0 1 5.5,0 Z"/><path class="boia-pino" d="M0,-5.5 V-9"/></g>' +
      '<g class="anzol"><circle class="anzol-olho" r="2.2"/><path class="anzol-c" d="M0,2 V13 A4.5,4.5 0 0 1 -9,13 V9 L-6.5,11.5"/></g></svg>' +
      '<div class="balde"><span class="no-balde" hidden>🐟</span><span class="balde-alca"></span><span class="balde-corpo"></span></div></div>' +
      '<button type="button" class="grande" id="btPuxar">' + t('🎣 Puxar!', '🎣 Pull!', '🎣 ¡Tirar!') + '</button>';
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
      var p = { el: el, y0: raia, x: x, dir: dir, v: sortearVel(), fase: Math.random() * 6, virar: parado ? Infinity : relogio + 3 + Math.random() * 4, foge: 0, w: el.offsetWidth || 40, h: el.offsetHeight || 40 };
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
      var n = forte === true ? 7 : forte || 0;   // gotas: 7 no peixe que sai da água, 3 no peixe que foge
      for (var i = 0; i < n; i++) { var a = -Math.PI * (0.15 + 0.7 * i / Math.max(1, n - 1)); h += '<span class="gota" style="--dx:' + Math.round(Math.cos(a) * 34) + 'px;--up:' + Math.round(14 + Math.random() * 22) + 'px"></span>'; }
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
        var fugindo = f.foge > relogio;   // levou um susto: nada rápido para longe do anzol
        f.x += f.dir * (fugindo ? Math.max(vel, 0.1) * 3 : f.v) * dt;
        if (f.x > 0.07 && f.x < 0.93) f.entrando = false;
        if (!f.entrando) {
          if (f.x >= 0.93 && f.dir > 0) f.dir = -1; else if (f.x <= 0.07 && f.dir < 0) f.dir = 1;
          else if (relogio > f.virar) { f.virar = relogio + 3 + Math.random() * 4; f.v = sortearVel(); if (Math.random() < 0.35) f.dir = -f.dir; }
        }
        var y = (f.y0 + (calmo ? 0 : 0.02 * Math.sin(relogio * 1.3 + f.fase))) * H;
        mover(f.el, f.x * W - f.w / 2, y - f.h / 2, 0, f.dir > 0 ? -1 : 1);
        if (!f.entrando && !fugindo && Math.abs(f.x - 0.5) <= zona) temPerto = true;
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
          aviso(t('Fisgou! O peixinho foi para o balde. 🐟💦', 'Hooked it! The little fish went into the bucket. 🐟💦', '¡Lo has pescado! El pececito ha ido al cubo. 🐟💦'), 1800, true);
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
      var livres = peixes.filter(function (f) { return !f.entrando && !(f.foge > relogio); }).sort(function (a, b) { return Math.abs(a.x - 0.5) - Math.abs(b.x - 0.5); });
      var perto = livres.filter(function (f) { return Math.abs(f.x - 0.5) <= zona; })[0];
      var quase = !perto && livres.filter(function (f) { return Math.abs(f.x - 0.5) <= zona + 0.2; })[0];
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
        if (quase) {
          // puxou cedo (o peixe ainda vinha chegando) ou tarde (já tinha passado): ele se assusta e foge com um respingo
          var cedo = (0.5 - quase.x) * quase.dir > 0;
          quase.dir = quase.x < 0.5 ? -1 : 1; quase.foge = relogio + 1.4;
          respingo(quase.x * W, (quase.y0 + (calmo ? 0 : 0.02 * Math.sin(relogio * 1.3 + quase.fase))) * H, 3); Som.toca('agua');
          aviso(cedo ? t('Quase! Puxou cedo: espere o peixe entrar no círculo ⭕', 'Almost! Too early: wait for the fish to get inside the circle ⭕', '¡Casi! Has tirado demasiado pronto: espera a que el pez entre en el círculo ⭕')
            : t('Quase! Puxou tarde: o peixe já tinha passado ⭕', 'Almost! Too late: the fish had already swum past ⭕', '¡Casi! Has tirado demasiado tarde: el pez ya había pasado ⭕'), 2000);
        } else aviso(t('Escapou! Puxe quando um peixe estiver dentro do círculo ⭕', 'It got away! Pull when a fish is inside the circle ⭕', '¡Se ha escapado! Tira cuando un pez esté dentro del círculo ⭕'), 1600);
      }
    }
    qs(area, '#btPuxar').addEventListener('click', puxar);
    agua.addEventListener('click', puxar);
    // só nos testes (?teste): parar os peixes e pôr um peixe num lugar para conferir o "quase" e o fisgar na hora certa
    if (RAPIDO) window.Cozinha.rio = {
      zona: function () { return zona; },
      peixes: function () { return peixes.map(function (f) { return { x: f.x, dir: f.dir, foge: f.foge > relogio, preso: f === preso }; }); },
      parar: function () { parado = true; peixes.forEach(function (f) { f.v = 0; f.virar = Infinity; }); },
      por: function (i, x, dir) { var f = peixes[i]; f.x = x; f.dir = dir; f.entrando = false; f.foge = 0; }
    };
  };

  // lojas (v0.10.0): o mercadinho do Seu Zé, a padaria do Seu Joaquim e a feira da Dona Rosa funcionam do mesmo jeito
  // (de graça no Fácil; moedas e troco no Médio e no Difícil); cada uma vende as suas coisas (logica.vende)
  // o mercadinho por dentro (v0.11.0, "achar os setores no mercado"): hortifrúti nos caixotes, geladeira, açougue,
  // padaria e a mercearia nas prateleiras; o setor que tem algo da lista brilha (Fácil e Médio). Padaria e feira: uma
  // banca só.
  var SETORES = [
    { id: 'hortifruti', e: '🥕', pt: 'Hortifrúti', en: 'Fruit & veg', es: 'Frutas y verduras', tem: function (g) { return g.de === 'pomar' || g.de === 'horta'; } },
    { id: 'geladeira', e: '🧊', pt: 'Geladeira', en: 'Fridge', es: 'Nevera', tem: function (g) { return ['leite', 'manteiga', 'queijo', 'ovo'].indexOf(g.id) >= 0; } },
    { id: 'acougue', e: '🥩', pt: 'Açougue', en: 'Butcher', es: 'Carnicería', tem: function (g) { return g.id === 'carne'; } },
    { id: 'padaria', e: '🥖', pt: 'Padaria', en: 'Bakery', es: 'Panadería', tem: function (g) { return g.id === 'pao'; } },
    { id: 'mercearia', e: '🛒', pt: 'Mercearia', en: 'Pantry', es: 'Despensa', tem: function () { return true; } }
  ];
  function setorDe(id) { var g = D.ingrediente[id]; for (var i = 0; i < SETORES.length; i++) if (SETORES[i].tem(g)) return SETORES[i]; return SETORES[SETORES.length - 1]; }
  function prateleiraHtml(loja, itens, falta, nv) {
    var k = 0;
    function produto(id) {
      var p = L.preco(id, nv);
      return '<button type="button" class="produto' + (falta.indexOf(id) >= 0 && nv.brilho ? ' precisa' : '') + '" data-ing="' + id + '" style="--i:' + (k++) + '" aria-label="' + L.nomeIng(id, lingua) + ' — ' + (p ? p + t(' moedas', ' coins', ' monedas') : t('grátis', 'free', 'gratis')) + '">' + icone(id) +
        '<span class="pn">' + L.nomeIng(id, lingua) + '</span><span class="preco">' + (p ? '💰 ' + p : t('grátis', 'free', 'gratis')) + '</span></button>';
    }
    if (loja !== 'mercado') return '<div class="prateleira banca-' + loja + '">' + itens.map(produto).join('') + '</div>';
    return '<div class="prateleira mercado-setores">' + SETORES.map(function (st) {
      var aqui = itens.filter(function (id) { return setorDe(id) === st; });
      if (!aqui.length) return '';
      var temFalta = nv.brilho && aqui.some(function (id) { return falta.indexOf(id) >= 0; });
      return '<section class="setor s-' + st.id + (temFalta ? ' tem-falta' : '') + '" data-setor="' + st.id + '"><h4 class="placa">' + st.e + ' ' + tx(st) + (temFalta ? ' <span class="seta-setor" aria-hidden="true">⬇️</span>' : '') + '</h4>' +
        '<div class="itens">' + aqui.map(produto).join('') + '</div></section>';
    }).join('') + '</div>';
  }
  MINI.padaria = function (area) { MINI.mercado(area, 'padaria'); };
  MINI.feira = function (area) { MINI.mercado(area, 'feira'); };
  MINI.mercado = function (area, loja) {
    loja = loja || 'mercado';
    var nv = jogo.cfg, dono = D.lugar[loja].dono, ze = ix(dono);
    var falta = L.faltando(jogo.precisa, jogo.cesta).map(function (r) { return r.id; });
    var itens = D.INGREDIENTES.filter(function (g) { return L.vende(loja, g.id); }).map(function (g) { return g.id; });
    area.classList.add('loja-' + loja);
    itens.sort(function (a, b) { return (falta.indexOf(a) < 0) - (falta.indexOf(b) < 0); });
    area.innerHTML = '<div class="toldo" aria-hidden="true"></div><p class="instr">' + (nv.moedas ? t('Toque no que quer comprar e pague com as suas moedas. ' + ze + ' dá o troco!', 'Tap what you want to buy and pay with your coins. ' + ze + ' gives you the change!', 'Toca lo que quieres comprar y paga con tus monedas. ¡' + ze.charAt(0).toUpperCase() + ze.slice(1) + ' te da el cambio!')
      : t('Hoje ' + ze + ' está dando tudo de presente! Toque no que precisa. 🎁', 'Today ' + ze + ' is giving everything away! Tap what you need. 🎁', '¡Hoy ' + ze + ' lo regala todo! Toca lo que necesitas. 🎁')) + '</p>' +
      prateleiraHtml(loja, itens, falta, nv) + '<div class="caixa" hidden></div><div class="ajudar-zona"></div>';
    ajudante(qs(area, '.prateleira'), '.produto');
    var caixa = qs(area, '.caixa');
    function mostrarAjudar() {
      var z = qs(area, '.ajudar-zona');
      z.innerHTML = L.precisaAjudar(jogo, jogo.precisa, nv) ? '<button type="button" class="medio verde" id="btAjudar">' + t('🧹 Ajudar ' + (loja === 'feira' ? 'a ' : 'o ') + ze + ' a arrumar (+2 💰)', '🧹 Help ' + ze + ' tidy up (+2 💰)', '🧹 Ayudar a ' + ze + ' a ordenar (+2 💰)') + '</button>' : '';
      var b = qs(z, '#btAjudar'); if (b) b.addEventListener('click', ajudar);
    }
    function ajudar() {
      var z = qs(area, '.ajudar-zona');
      z.innerHTML = '<p class="instr">' + t('Toque nas caixas para guardar na prateleira.', 'Tap the boxes to put them on the shelf.', 'Toca las cajas para guardarlas en la estantería.') + '</p><div class="caixas"></div>';
      var cx = qs(z, '.caixas'), restam = 5;
      for (var i = 0; i < 5; i++) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'caixinha'; b.textContent = '📦';
        b.style.left = (8 + Math.random() * 78) + '%'; b.style.top = (Math.random() * 50) + '%'; b.setAttribute('aria-label', t('Caixa', 'Box', 'Caja'));
        b.addEventListener('click', function () {
          this.disabled = true; this.classList.add('guardou'); Som.toca('toque'); restam--;
          if (!restam) { jogo.moedas += 2; Som.toca('moeda'); desenharCarteira(); aviso(t('Obrigado pela ajuda! Tome 2 moedas. 💰💰', 'Thanks for helping! Here are 2 coins. 💰💰', '¡Gracias por ayudar! Toma 2 monedas. 💰💰')); mostrarAjudar(); }
        });
        cx.appendChild(b);
      }
    }
    function abrirCaixa(id, de) {
      var p = L.preco(id, nv), naMao = [];
      var carteira = L.moedasPara(jogo.moedas);
      if (jogo.moedas < p) { Som.toca('erro'); aviso(t('Suas moedas não dão para isso. Tente outro lugar, peça para a vizinha ou ajude ' + (loja === 'feira' ? 'a ' : 'o ') + ze + '.', 'You don\'t have enough coins for that. Try another place, ask the neighbor or help ' + ze + '.', 'No te llegan las monedas para eso. Prueba en otro sitio, pídeselo a la vecina o ayuda a ' + ze + '.'), 3600); mostrarAjudar(); return; }
      caixa.hidden = false;
      function desenhar() {
        var soma = L.soma(naMao);
        caixa.innerHTML = '<p class="cx-item">' + icone(id) + ' <b>' + L.nomeIng(id, lingua) + '</b> — ' + t('custa', 'costs', 'cuesta') + ' <b>💰 ' + p + '</b></p>' +
          '<p class="cx-instr">' + t('Toque nas suas moedas para colocar no balcão:', 'Tap your coins to put them on the counter:', 'Toca tus monedas para ponerlas en el mostrador:') + '</p>' +
          '<div class="cx-carteira">' + carteira.map(function (m, i) { return '<button type="button" class="moeda m' + m + '" data-i="' + i + '" aria-label="' + t('moeda de ', 'coin of ', 'moneda de ') + m + '">' + m + '</button>'; }).join('') + '</div>' +
          '<div class="cx-balcao" aria-label="' + t('balcão', 'counter', 'mostrador') + '">' + naMao.map(function (m, i) { return '<button type="button" class="moeda m' + m + '" data-b="' + i + '">' + m + '</button>'; }).join('') + '</div>' +
          '<p class="cx-soma">' + t('Você deu: ', 'You gave: ', 'Has dado: ') + '<b>💰 ' + soma + '</b>' + (soma > p ? ' · ' + t('troco: ', 'change: ', 'cambio: ') + '<b>💰 ' + L.troco(soma, p) + '</b>' : '') + '</p>' +
          '<div class="linha-botoes"><button type="button" class="medio verde cx-pagar"' + (soma >= p ? '' : ' disabled') + '>' + t('✅ Pagar', '✅ Pay', '✅ Pagar') + '</button><button type="button" class="medio cx-cancelar">' + t('Voltar', 'Back', 'Volver') + '</button></div>';
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
          if (!r.ok) { erro(); aviso(t('Não deu certo. Tente de novo.', 'That didn\'t work. Try again.', 'No ha funcionado. Inténtalo de nuevo.')); return; }
          recebeu(id, de);
          aviso(r.troco > 0 ? t('Você deu 💰 ' + pago + ', custou 💰 ' + r.preco + '. Troco: 💰 ' + r.troco + '. Obrigado!', 'You gave 💰 ' + pago + ', it cost 💰 ' + r.preco + '. Change: 💰 ' + r.troco + '. Thank you!', 'Has dado 💰 ' + pago + ' y ha costado 💰 ' + r.preco + '. Cambio: 💰 ' + r.troco + '. ¡Gracias!')
            : t('Pagou certinho: 💰 ' + r.preco + '. Obrigado!', 'Exact amount: 💰 ' + r.preco + '. Thank you!', 'Has pagado justo: 💰 ' + r.preco + '. ¡Gracias!'), 3400);
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
      '<p class="favores-txt"></p><button type="button" class="mini-link bt-voz-vovo">' + t('🔁 Trocar a voz da vovó', "🔁 Change grandma's voice", '🔁 Cambiar la voz de la abuelita') + '</button><div class="pedidos">' + itens.map(function (id, i) {
        return '<button type="button" class="pedido' + (falta.indexOf(id) >= 0 && jogo.cfg.brilho ? ' precisa' : '') + '" data-ing="' + id + '" style="--i:' + i + '">' + icone(id) + '<span>' + L.nomeIng(id, lingua) + '</span></button>';
      }).join('') + '</div><button type="button" class="grande verde" id="btObrigado" hidden>' + t('💛 Obrigado, Dona Cida!', '💛 Thank you, Mrs. Cida!', '💛 ¡Gracias, doña Cida!') + '</button>';
    var balao = qs(area, '.balao'), mao = qs(area, '.na-mao'), bt = qs(area, '#btObrigado'), cida = qs(area, '.cida'), falando = null;
    // a Dona Cida fala em voz alta (se a voz 🗣️ estiver ligada), com voz de vovó: mais devagar e mais fininha;
    // o balão mostra sempre o que ela disse. fila = espera o aviso anterior acabar de ser lido.
    function fala(pt, ing, esp, fila, chave) {
      var txt = t(pt, ing, esp);
      balao.textContent = txt; balao.classList.remove('novo'); void balao.offsetWidth; balao.classList.add('novo');
      if (chave && pref.voz && usaGravada()) {
        if (!fila && window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) { /* ok */ }
        var marca = {}; falando = marca; cida.classList.add('falando');
        if (tocarVovo(chave, fila, function () { if (falando === marca) { falando = null; cida.classList.remove('falando'); } }, function () { falarAparelho(); })) return;
      }
      falarAparelho(fila);
    }
    function falarAparelho(fila) {
      var txt = balao.textContent;
      var vv = vozDaVovo(), jv = jeitoVovo(vv);
      var u = falar(txt, { rate: jv.rate, pitch: jv.pitch, voz: vv, fila: fila });
      if (!u) return;
      falando = u; cida.classList.add('falando');
      var acabou = function () { if (falando === u) { falando = null; cida.classList.remove('falando'); } };
      try { u.addEventListener('end', acabou); u.addEventListener('error', acabou); } catch (e) { /* ok */ }
      agendar(acabou, 1500 + txt.length * 110);   // alguns aparelhos não avisam quando a fala acaba
    }
    function favores() { qs(area, '.favores-txt').textContent = t('💛 Favores hoje: ' + jogo.favores, '💛 Favors today: ' + jogo.favores, '💛 Favores de hoy: ' + jogo.favores); }
    if (jogo.favores > 0) fala('Oi, meu bem, que bom te ver! Precisa de alguma coisa emprestada? 😊', 'Hello, sweetie, how nice to see you! Do you need to borrow something? 😊', '¡Hola, cariño, qué alegría verte! ¿Necesitas que te preste algo? 😊', false, 'oi');
    else fala('Oi, meu bem! Hoje eu já emprestei tudo o que podia. Tente o mercadinho! 😊', 'Hello, sweetie! I have already lent all I could today. Try the shop! 😊', '¡Hola, cariño! Hoy ya he prestado todo lo que podía. ¡Prueba en la tienda! 😊', false, 'oi-sem');
    favores();
    qs(area, '.bt-voz-vovo').addEventListener('click', trocarVozVovo);
    // saiu da casa no meio da fala: a vovó para de falar
    fimLugar.push(function () { pararVovo(); if (falando && window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) { /* ok */ } });
    qs(area, '.pedidos').addEventListener('click', function (e) {
      var b = e.target.closest('.pedido'); if (!b) return;
      var id = b.getAttribute('data-ing'), r = L.pedirFavor(jogo, id);
      if (r.ok) {
        fala('Claro, meu bem! Aqui está 1 ' + L.nomeIng(id, 'pt') + '. 😊', 'Of course, sweetie! Here is 1 ' + L.nomeIng(id, 'en') + '. 😊', '¡Claro, cariño! Aquí tienes 1 ' + L.nomeIng(id, 'es') + '. 😊', false, 'aqui-' + id);
        mao.innerHTML = icone(id); bt.hidden = false; bt.focus(); Som.toca('toque');
        qsa(area, '.pedido').forEach(function (x) { x.disabled = true; });
        agendar(function () { if (jogo.pendente) fala('Como é que se diz? 😉', 'What do we say? 😉', '¿Cómo se dice? 😉', false, 'diz'); }, 4500 * V);
      } else if (r.motivo === 'sem-favor') {
        fala('Hoje eu já emprestei bastante! Tente o mercadinho ou outro lugar. 😊', 'I have lent a lot today! Try the shop or another place. 😊', '¡Hoy ya he prestado bastante! Prueba en la tienda o en otro sitio. 😊', false, 'bastante'); Som.toca('erro');
      }
    });
    bt.addEventListener('click', function () {
      var r = L.agradecer(jogo); if (!r.ok) return;
      bt.hidden = true; recebeu(r.id, mao); mao.innerHTML = '';
      if (jogo.favores > 0) fala('De nada, meu bem! Volte sempre. Tchau, tchau! 💛', 'You are welcome, sweetie! Come back any time. Bye-bye! 💛', '¡De nada, cariño! Vuelve cuando quieras. ¡Adiós, adiós! 💛', true, 'tchau');
      else fala('De nada, meu bem! Agora acabaram os favores de hoje. Tchau, tchau! 💛', 'You are welcome, sweetie! That was my last favor for today. Bye-bye! 💛', '¡De nada, cariño! Ya se han acabado los favores de hoy. ¡Adiós, adiós! 💛', true, 'tchau-fim');
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
  function texto(p) { return L.textoPasso(p, jogo.rec, jogo.nivel, lingua, jogo.fator); }
  function iniciarCozinha() {
    $('czTitulo').innerHTML = ART.imgFoto(jogo.rec.id, 'ic-titulo') + ' ' + tx(jogo.rec);
    if (jogo.cz) { desenharCozinha(); return; }
    var usados = [];
    jogo.passos.forEach(function (p) { if (usados.indexOf(p.u) < 0) usados.push(p.u); });
    var extras = embaralhar(D.UTENSILIOS.map(function (u) { return u.id; }).filter(function (u) { return usados.indexOf(u) < 0; })).slice(0, jogo.cfg.distratores);
    jogo.cz = { feitos: [], atual: null, fase: null, errosPasso: 0, dicaTempo: false, dentro: {},
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
    cz.indo = false;
    // ficha da receita
    var lista = jogo.cfg.fichas ? cz.feitos.map(function (id) { return jogo.passos.filter(function (x) { return x.id === id; })[0]; }) : jogo.passos;
    $('ficha').innerHTML = lista.map(function (x) {
      var feito = cz.feitos.indexOf(x.id) >= 0;
      return '<li class="' + (feito ? 'feito' : '') + (p && x.id === p.id ? ' atual' : '') + '">' + icone(x.u) + '<span>' + texto(x) + '</span>' + (feito ? '<b aria-label="' + t('feito', 'done', 'hecho') + '">✔</b>' : '') + '</li>';
    }).join('') + (jogo.cfg.fichas && cz.feitos.length < total ? '<li class="misturadas">🃏 ' + t('Fichas misturadas: ', 'Mixed-up cards: ', 'Fichas mezcladas: ') + (total - cz.feitos.length) + '</li>' : '');
    var at = qs($('ficha'), '.atual'); if (at) $('ficha').scrollTop = Math.max(0, at.offsetTop - $('ficha').offsetTop - 8);
    var r = tempoRestante();
    $('passoNum').textContent = t('Passo ', 'Step ', 'Paso ') + Math.min(total, cz.feitos.length + 1) + t(' de ', ' of ', ' de ') + total + (r != null ? (r > 0 ? '  ·  ☀️' : '  ·  🌙') : '');
    $('passoTexto').textContent = p ? texto(p) : t('As fichas da receita se misturaram! Qual é o próximo passo?', 'The recipe cards got mixed up! What\'s the next step?', '¡Las fichas de la receta se han mezclado! ¿Cuál es el siguiente paso?');
    var u = p && D.utensilio[p.u];
    var adulto = p && (u.adulto || (p.em && D.utensilio[p.em] && D.utensilio[p.em].adulto));
    $('dicaAdulto').hidden = !adulto;
    if (adulto) $('dicaAdulto').textContent = t('🧑‍🍳 Na cozinha de verdade, ' + tx(u).toLowerCase() + ' só com um adulto junto!', '🧑‍🍳 In a real kitchen, use the ' + tx(u).toLowerCase() + ' only with a grown-up!', '🧑‍🍳 ¡En una cocina de verdad, ' + tx(u).toLowerCase() + ' solo con un adulto al lado!');
    // utensílios
    var brilha = deveBrilhar();
    $('utensilios').innerHTML = '<div class="bandeja">' + cz.utens.map(function (id) {
      var x = D.utensilio[id];
      return '<button type="button" class="utensilio' + (brilha && p && id === p.u ? ' luz' : '') + (cz.fase === 'acao' && p && id === p.u ? ' usando' : '') + '" data-u="' + id + '"' + (cz.fase === 'utensilio' ? '' : ' aria-disabled="true"') + '>' + icone(id) + '<span>' + tx(x) + '</span></button>';
    }).join('') + '</div>';
    // palco
    var palco = $('palco'); palco.className = 'palco';
    if (cz.fase === 'ficha') {
      palco.innerHTML = '<div class="fichas">' + cz.fichas.filter(function (id) { return cz.feitos.indexOf(id) < 0; }).map(function (id) {
        var x = jogo.passos.filter(function (q) { return q.id === id; })[0];
        return '<button type="button" class="ficha-bt" data-passo="' + id + '">' + icone(x.u) + '<span>' + texto(x) + '</span></button>';
      }).join('') + '</div>';
    } else if (cz.fase === 'utensilio') {
      // v0.11.0: a cozinha "casinha cortada" com o cozinheirinho; ao acertar o utensílio ele anda até a estação
      var ep = VI.estacaoPos(cz.estacao || 'porta');
      palco.innerHTML = '<div class="diorama">' + VI.cozinhaDiorama() + '<span class="chef-cz" aria-hidden="true" style="left:' + ep[0] + '%;top:' + ep[1] + '%">' + VI.boneco() + '</span></div>' +
        '<div class="pergunta"><span class="seta" aria-hidden="true">👇</span><p>' + t('Qual utensílio usar? Escolha embaixo.', 'Which tool do we use? Pick one below.', '¿Qué utensilio usamos? Elige uno abajo.') + '</p></div>';
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
      aviso(t('Ainda não! Antes precisa: ', 'Not yet! First you need: ', '¡Todavía no! Antes hace falta: ') + antes.join(t(' e ', ' and ', ' y ')), 4200);
    }
  });
  $('utensilios').addEventListener('click', function (e) {
    var b = e.target.closest('[data-u]'); if (!b) return;
    var cz = jogo.cz, p = passoAtual();
    if (cz.fase === 'ficha') { aviso(t('Primeiro escolha a ficha do próximo passo. 🃏', 'First pick the card for the next step. 🃏', 'Primero elige la ficha del siguiente paso. 🃏'), 2000); return; }
    if (cz.fase !== 'utensilio') return;
    var u = b.getAttribute('data-u');
    if (u === p.u) {
      if (cz.indo) return;
      Som.toca('toque');
      var ir = function () { cz.indo = false; cz.fase = 'acao'; limparCozinha(); desenharCozinha(); };
      var ms = chefAte(estacaoDe(p.u));
      if (ms) { cz.indo = true; agendarCz(ir, ms); } else ir();
    }
    else {
      erro(); cz.errosPasso++;
      b.classList.remove('treme'); void b.offsetWidth; b.classList.add('treme');
      aviso(t('Hmm, ' + tx(D.utensilio[u]).toLowerCase() + ' não serve para este passo. Tente outro!', 'Hmm, the ' + tx(D.utensilio[u]).toLowerCase() + ' is not for this step. Try another one!', '¡Ups! Para este paso no se usa: ' + tx(D.utensilio[u]).toLowerCase() + '. ¡Prueba otro!'), 2200);
      if (deveBrilhar()) desenharCozinha();
    }
  });
  $('btLer').addEventListener('click', function () { var p = jogo && jogo.cz && passoAtual(); var v = pref.voz; pref.voz = true; falar(p ? texto(p) : $('passoTexto').textContent); pref.voz = v; });

  // estação da cozinha de cada utensílio (onde o cozinheirinho vai ficar de pé no desenho)
  function estacaoDe(u) {
    if (u === 'pia') return 'pia';
    if (['fogao', 'frigideira', 'panela', 'espatula', 'grelha', 'forno', 'forma'].indexOf(u) >= 0) return 'fogao';
    if (u === 'geladeira') return 'geladeira';
    if (u === 'prato' || u === 'copo') return 'mesa';
    return 'bancada';
  }
  // anda até a estação; devolve quanto tempo leva (0 = chegou na hora: movimento reduzido, testes ou já está lá)
  function chefAte(est) {
    var cz = jogo.cz, de = cz.estacao || 'porta', chef = qs($('palco'), '.chef-cz'), dio = qs($('palco'), '.diorama');
    cz.estacao = est;
    if (!chef || de === est || calmo() || VA < 1) return 0;
    var a = VI.estacaoPos(de), b = VI.estacaoPos(est), dist = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]), ms = Math.round(Math.min(1100, 300 + dist * 14));
    chef.style.setProperty('--dur', ms + 'ms'); chef.classList.toggle('esq', b[0] < a[0]); chef.classList.add('anda');
    chef.style.left = b[0] + '%'; chef.style.top = b[1] + '%';
    if (dio) dio.className = 'diorama em-' + est;
    return ms + 120;
  }
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
  // o que já está dentro de cada utensílio (para a cor da massa e o quanto está cheio)
  function dentroDe(u) { var cz = jogo.cz; cz.dentro = cz.dentro || {}; return (cz.dentro[u] = cz.dentro[u] || []); }
  function corDe(lista) { return C.misturar(lista.map(C.cor)) || jogo.rec.cor; }
  function nivelDe(lista) { return lista.length ? Math.min(0.85, 0.25 + 0.14 * lista.length) : 0; }
  function centroDe(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }
  // um ingrediente cai no recipiente: pedacinhos caem, o pó faz nuvenzinha, o pacote inclina PARA o recipiente e
  // derrama, o ovo quebra e a gema cai. Depois o recipiente fica mais cheio (com a cor da mistura).
  function cairNo(dest, id, de, depois) {
    var boca = qs(dest, '.boca') || dest, b = centroDe(boca), o = centroDe(de), j = C.jeito(id), cor = C.cor(id), dur = 1000 * VA;
    if (!qs(dest, '.boca')) b.y = centroDe(dest).y - centroDe(dest).h * 0.2;
    if (calmo() || !Element.prototype.animate) { depois(); dest.classList.remove('pula'); void dest.offsetWidth; dest.classList.add('pula'); return; }
    var px = b.x - 46, py = b.y - 74, dx = px - o.x, dy = py - o.y, tilt = j === 'po' || j === 'liquido' || j === 'granulado';
    // o ingrediente vai até em cima do recipiente; pacote: à esquerda, e inclina para a direita (para o recipiente)
    var fim = tilt ? 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) rotate(110deg)' : 'translate(calc(-50% + ' + (b.x - o.x) + 'px), calc(-50% + ' + (py - o.y) + 'px)) rotate(' + (j === 'ovo' ? 0 : 20) + 'deg)';
    var voa = C.particula(icone(id), 'ing-voa', o.x, o.y, [
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: (tilt ? 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))' : 'translate(calc(-50% + ' + (b.x - o.x) + 'px), calc(-50% + ' + (py - o.y) + 'px))') + ' rotate(0deg) scale(1.1)', opacity: 1, offset: 0.4 },
      { transform: fim + ' scale(1.1)', opacity: 1, offset: 0.62 },
      { transform: fim + ' scale(1.1)', opacity: 1, offset: 0.9 },
      { transform: fim + ' scale(.8)', opacity: 0 }], dur);
    if (voa) voa.setAttribute('data-inclina', tilt ? '110' : '0');
    var t1 = dur * 0.55;
    agendarCz(function () {
      if (j === 'pedaco') C.migalhas(b.x, py, null, 4, { html: icone(id), sobe: 0, abre: 46, cai: b.y - py + 6, dur: 520 * VA + 80, espalha: 140 * VA });
      else if (j === 'ovo') {
        C.migalhas(b.x, py, '#fff', 1, { html: '🥚', sobe: 6, abre: -70, cai: 20, dur: 450 }); C.migalhas(b.x, py, '#fff', 1, { html: '🥚', sobe: 6, abre: 70, cai: 20, dur: 450 });
        var gema = C.particula('', 'gema', b.x, py + 6, [{ transform: 'translate(-50%,-50%) scale(.6)', opacity: 1 }, { transform: 'translate(-50%, calc(-50% + ' + (b.y - py) + 'px)) scale(1, .7)', opacity: 1, offset: 0.85 }, { transform: 'translate(-50%, calc(-50% + ' + (b.y - py) + 'px)) scale(1.3, .4)', opacity: 0 }], 520 * VA + 60);
        if (gema) gema.style.setProperty('--c', cor);
      } else if (j === 'liquido') {
        var jr = C.particula('', 'jorrinho', b.x - 8, py + 14, [{ transform: 'translateX(-50%) scaleY(0)', opacity: 1 }, { transform: 'translateX(-50%) scaleY(1)', opacity: 1, offset: 0.3 }, { transform: 'translateX(-50%) scaleY(1)', opacity: 1, offset: 0.8 }, { transform: 'translateX(-50%) translateY(' + (b.y - py - 14) + 'px) scaleY(0)', opacity: 0.6 }], 600 * VA + 60);
        if (jr) { jr.style.height = Math.max(10, b.y - py - 14) + 'px'; jr.style.background = cor; }
      } else {   // pó e granulado: chuvinha e uma nuvenzinha quando chega
        var cores = j === 'granulado' ? ['#ff4fa3', '#3ee8ff', '#ffd166', '#7bc950', '#8b5a3c'] : [cor];
        for (var k = 0; k < 14; k++) C.migalhas(b.x - 8 + (Math.random() - 0.5) * 10, py + 14, cores[k % cores.length], 1, { sobe: 0, abre: 16, cai: b.y - py - 14, tam: j === 'granulado' ? 5 : 4, dur: 420 * VA + 60, espalha: 260 * VA });
        if (j === 'po') agendarCz(function () { C.nuvem(b.x, b.y, cor === '#ffffff' ? '#fffaf0' : cor, 7); }, 300 * VA);
      }
    }, t1);
    agendarCz(function () { depois(); dest.classList.remove('pula'); void dest.offsetWidth; dest.classList.add('pula'); }, t1 + 420 * VA);
  }
  function montarAcao(p) {
    var palco = $('palco'), a = p.a, nv = jogo.cfg;
    palco.className = 'palco acao-' + a;
    var big = function (id) { return '<div class="grandao">' + icone(id) + '</div>'; };
    if (a === 'lavar') {
      // pia com a torneira aberta: as duas mãos (ou o que está sendo lavado) esfregam junto com o dedo, a espuma
      // aparece aos poucos e, no fim, a água leva a espuma e brilha: "Mãos limpinhas!"
      var maos = !p.ing.length;
      palco.innerHTML = '<p class="instr">' + (maos ? t('Esfregue as mãos fazendo círculos com o dedo 🔄', 'Scrub your hands by making circles with your finger 🔄', 'Frótate las manos haciendo círculos con el dedo 🔄') : t('Esfregue fazendo círculos com o dedo 🔄', 'Scrub by making circles with your finger 🔄', 'Frota haciendo círculos con el dedo 🔄')) + '</p>' +
        '<div class="alvo-giro pia-giro' + (maos ? ' com-maos' : '') + '" style="--p:0">' + C.cenaPia(maos) + (maos ? '' : '<div class="itens-lavar">' + p.ing.map(icone).join('') + '</div>') +
        '<p class="limpinho" hidden>' + (maos ? t('Mãos limpinhas! ✨', 'Squeaky clean hands! ✨', '¡Manos limpiecitas! ✨') : t('Tudo limpinho! ✨', 'All clean! ✨', '¡Todo limpiecito! ✨')) + '</p><span class="barra-giro" aria-hidden="true"><span></span></span></div>' +
        '<button type="button" class="medio bt-alt">' + t('🧼 Esfregar', '🧼 Scrub', '🧼 Frotar') + '</button>';
      var pia = qs(palco, '.alvo-giro'), barraP = qs(palco, '.barra-giro span'), itensL = qs(palco, '.itens-lavar'), tEsf = 0;
      var somarL = giro(pia, 1.5, function (pr, ang) {
        barraP.style.width = (pr * 100) + '%'; C.esfregar(pia, pr, ang);
        if (itensL) itensL.style.transform = 'translate(calc(-50% + ' + (Math.cos(ang) * 6).toFixed(1) + 'px), ' + (Math.sin(ang) * 4).toFixed(1) + 'px) rotate(' + (Math.sin(ang) * 10).toFixed(1) + 'deg)';
        pia.classList.add('esfregando'); clearTimeout(tEsf); tEsf = setTimeout(function () { pia.classList.remove('esfregando'); }, 260);
      }, function () {
        pia.classList.add('limpo'); qs(pia, '.limpinho').hidden = false; Som.toca('pega');
        if (!calmo()) { var c0 = centroDe(pia); C.faiscas(c0.x, c0.y, 10); }
        agendarCz(concluir, 900 * VA + 100);
      });
      fimCz.push(function () { clearTimeout(tEsf); });
      qs(palco, '.bt-alt').addEventListener('click', function () { somarL(Math.PI / 4); Som.toca('toque'); });
    } else if (a === 'mexer') {
      // a colher gira dentro do recipiente com o dedo, e a massa faz um redemoinho
      var onde = p.em, temR = C.temRecipiente(onde), dentro = dentroDe(onde);
      palco.innerHTML = '<p class="instr">' + t('Mexa fazendo círculos com o dedo 🔄', 'Stir by making circles with your finger 🔄', 'Remueve haciendo círculos con el dedo 🔄') + '</p>' +
        '<div class="alvo-giro mexe-giro" style="--p:0">' + (temR ? '<div class="grandao com-recip">' + C.recipiente(onde) + '</div>' : big(onde)) + '<span class="colher-gira" aria-hidden="true">🥄</span></div>' +
        '<button type="button" class="medio bt-alt">' + t('🔄 Mexer', '🔄 Stir', '🔄 Remover') + '</button>';
      var alvo = qs(palco, '.alvo-giro'), col = qs(palco, '.colher-gira'), rede = qs(palco, '.redemoinho');
      if (temR) { C.encher(alvo, Math.max(0.55, nivelDe(dentro)), corDe(dentro)); qs(palco, '.giro-sup').setAttribute('opacity', '1'); }
      var somar = giro(alvo, nv.id === 'dificil' ? 3 : 2, function (pr, ang) {
        alvo.style.setProperty('--p', pr.toFixed(3));
        col.style.transform = 'translate(' + (Math.cos(ang) * 30).toFixed(1) + 'px, ' + (Math.sin(ang) * 11).toFixed(1) + 'px) rotate(' + (Math.cos(ang) * 14).toFixed(1) + 'deg)';
        if (rede) rede.style.transform = 'rotate(' + (ang * 180 / Math.PI).toFixed(1) + 'deg)';
      }, concluir);
      qs(palco, '.bt-alt').addEventListener('click', function () { somar(Math.PI / 4); Som.toca('toque'); });
    } else if (a === 'cortar') {
      var fila = p.ing.slice(), cortes = 0, PRECISA = nv.id === 'facil' ? 3 : 4;
      palco.innerHTML = '<p class="instr">' + t('Deslize o dedo por cima para cortar ✋➡️ (ou toque)', 'Swipe your finger across to cut ✋➡️ (or tap)', 'Desliza el dedo por encima para cortar ✋➡️ (o toca)') + '</p>' +
        '<div class="tabua-alvo" tabindex="0" role="button"><div class="pedacos"></div><span class="faca-mov" aria-hidden="true">' + ART.S.faca + '</span></div><p class="contador"></p>';
      var tab = qs(palco, '.tabua-alvo'), ped = qs(palco, '.pedacos'), cont = qs(palco, '.contador'), faca = qs(palco, '.faca-mov'), x0 = null;
      tab.setAttribute('aria-label', t('Cortar', 'Cut', 'Cortar'));
      function mostrarItem() { var id = fila[0]; ped.innerHTML = '<span class="inteiro">' + icone(id) + '</span>'; cont.textContent = L.nomeIng(id, lingua) + ': 0/' + PRECISA; }
      function cortar() {
        if (!fila.length) return;
        cortes++; Som.toca('toque');
        var rx = 20 + Math.random() * 60;
        var risco = document.createElement('span'); risco.className = 'risco'; risco.style.left = rx + '%'; risco.style.transform = 'rotate(' + (60 + Math.random() * 60) + 'deg)'; tab.appendChild(risco); setTimeout(function () { risco.remove(); }, 500);
        var id = fila[0];
        ped.innerHTML = Array(cortes + 1).join('<span class="pedaco">' + icone(id) + '</span>');
        var ult = ped.lastElementChild; if (ult) ult.classList.add('novo');
        // pedacinhos pulam do corte e caem na tábua
        if (!calmo()) { var r = tab.getBoundingClientRect(); C.migalhas(r.left + r.width * rx / 100, r.top + r.height * 0.45, C.cor(id), 6, { abre: 70, sobe: 22, cai: r.height * 0.3, tam: 7 }); }
        cont.textContent = L.nomeIng(id, lingua) + ': ' + cortes + '/' + PRECISA;
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
      var temRp = C.temRecipiente(p.u), dentroP = dentroDe(p.u);
      palco.innerHTML = '<p class="instr">' + t('Toque em cada ingrediente para colocar ', 'Tap each ingredient to put it ', 'Toca cada ingrediente para ponerlo ') + ix(D.utensilio[p.u].na) + '</p>' +
        '<div class="grandao destino' + (temRp ? ' com-recip' : '') + '">' + (temRp ? C.recipiente(p.u) : icone(p.u)) + '</div>' +
        '<div class="chips">' + chips.map(function (id) { return '<button type="button" class="chip-ing" data-ing="' + id + '">' + icone(id) + '<span>' + L.nomeQtd(id, L.quantidade(jogo.rec, jogo.nivel, id, jogo.fator), lingua) + '</span></button>'; }).join('') + '</div>';
      var faltam = certos.length, dest = qs(palco, '.destino');
      if (temRp) C.encher(dest, nivelDe(dentroP), corDe(dentroP));
      qs(palco, '.chips').addEventListener('click', function (e) {
        var b = e.target.closest('.chip-ing'); if (!b || b.disabled) return;
        var id = b.getAttribute('data-ing');
        if (certos.indexOf(id) >= 0) {
          b.disabled = true; b.classList.add('foi'); Som.toca('pega');
          dentroP.push(id);
          var n = nivelDe(dentroP), cor = corDe(dentroP);
          cairNo(dest, id, b, function () { if (temRp) C.encher(dest, n, cor); });
          if (!--faltam) agendarCz(concluir, 1500 * VA + 50);
        } else { erro(); b.classList.remove('treme'); void b.offsetWidth; b.classList.add('treme'); aviso(t('Esse não é deste passo!', 'That one isn\'t for this step!', '¡Ese no es de este paso!'), 1800); }
      });
    } else if (a === 'bater') {
      // a máquina treme e gira por dentro (redemoinho) enquanto o dedo segura
      var liq = p.u === 'liquidificador', dentroB = dentroDe(p.u);
      palco.innerHTML = '<p class="instr">' + t('Segure o botão até a barra encher ✋', 'Hold the button until the bar is full ✋', 'Mantén pulsado el botón hasta que se llene la barra ✋') + '</p>' +
        '<div class="grandao maquina m-' + p.u + (liq ? ' com-recip' : '') + '">' + (liq ? C.recipiente('liquidificador') : icone(p.u) + '<span class="turbilhao" aria-hidden="true"></span>') + '</div>' +
        '<button type="button" class="grande bt-segurar">' + (p.u === 'espremedor' ? t('🍊 Segure para espremer', '🍊 Hold to squeeze', '🍊 Mantén pulsado para exprimir') : t('✋ Segure para bater', '✋ Hold to blend', '✋ Mantén pulsado para batir')) + '<span class="barra"><span></span></span></button>';
      var maq = qs(palco, '.maquina'), bt = qs(palco, '.bt-segurar'), barra = qs(bt, '.barra span');
      if (liq) { C.encher(maq, Math.max(0.5, nivelDe(dentroB)), corDe(dentroB)); qs(maq, '.giro-sup').setAttribute('opacity', '1'); }
      var ligaM = function () { maq.classList.add('treme-sem-fim'); palco.classList.add('batendo'); };
      var paraM = function () { maq.classList.remove('treme-sem-fim'); palco.classList.remove('batendo'); };
      bt.addEventListener('pointerdown', ligaM);
      ['pointerup', 'pointerleave', 'pointercancel', 'keyup'].forEach(function (k) { bt.addEventListener(k, paraM); });
      fimCz.push(segurar(bt, 1800 * V, function (pr) {
        barra.style.width = (pr * 100) + '%';
        if (p.u === 'espremedor' && !calmo() && Math.random() < 0.18) { var c1 = centroDe(maq); C.migalhas(c1.x + (Math.random() - 0.5) * 30, c1.y, '#ffb21a', 1, { sobe: 10, abre: 40, cai: c1.h * 0.4, tam: 6 }); }
      }, function () {
        paraM(); bt.disabled = true;
        (p.ing || []).forEach(function (id) { if (dentroB.indexOf(id) < 0) dentroB.push(id); });
        concluir();
      }));
    } else if (a === 'ligar' || a === 'desligar') {
      // chama tremulando, a panela chiando e soltando vapor; desligar: a chama encolhe e o vapor some
      var liga = a === 'ligar';
      palco.innerHTML = '<p class="instr">' + (liga ? t('Gire o botão do fogão para acender o fogo 🔥', 'Turn the stove knob to light the flame 🔥', 'Gira el mando del fogón para encender el fuego 🔥') : t('Gire o botão para apagar o fogo', 'Turn the knob to put out the flame', 'Gira el mando para apagar el fuego')) + '</p>' +
        '<div class="fogao-cena' + (liga ? '' : ' quente') + '">' + big('fogao') + (p.em ? '<div class="em-cima">' + icone(p.em) + '</div>' : '') +
        '<span class="chama' + (liga ? '' : ' acesa') + '" aria-hidden="true"><i>🔥</i><i>🔥</i></span>' + vaporHtml() + '</div>' +
        '<button type="button" class="botao-fogao' + (liga ? '' : ' girado') + '" aria-label="' + (liga ? t('Ligar o fogo', 'Turn on the flame', 'Encender el fuego') : t('Desligar o fogo', 'Turn off the flame', 'Apagar el fuego')) + '"><span></span></button>';
      qs(palco, '.botao-fogao').addEventListener('click', function () {
        this.classList.toggle('girado', liga); qs(palco, '.chama').classList.toggle('acesa', liga); qs(palco, '.fogao-cena').classList.toggle('quente', liga);
        this.disabled = true; Som.toca('toque'); agendarCz(concluir, 900 * VA + 100);
      });
    } else if (a === 'despejar') {
      // o utensílio levanta, inclina PARA o lado do recipiente (bico em cima dele) e o jorro cai lá dentro, enchendo
      var de = p.de, dentroO = dentroDe(de), dentroA = dentroDe(p.u), corO = corDe(dentroO);
      var grosso = dentroO.some(function (id) { return ['farinha', 'polvilho', 'ovo', 'cenoura', 'banana', 'chocolate', 'leitecond'].indexOf(id) >= 0; });
      palco.innerHTML = '<p class="instr">' + t('Toque ' + D.utensilio[de].na[0], 'Tap the ' + D.utensilio[de].en.toLowerCase(), 'Toca ' + D.utensilio[de].na[2].replace(/^en /, '')) + t(' para despejar', ' to pour', ' para verter') + '</p>' +
        '<div class="despejo" data-fase="pronto">' + C.cenaDespejo(de, p.u) + '<button type="button" class="origem" aria-label="' + t('Despejar', 'Pour', 'Verter') + '"><span class="dedo" aria-hidden="true">👆</span></button></div>';
      var desp = qs(palco, '.despejo'), n0 = nivelDe(dentroA);
      C.encher(desp, n0, corDe(dentroA));
      qs(palco, '.origem').addEventListener('click', function () {
        if (this.disabled) return;
        this.disabled = true; desp.classList.add('despejando'); Som.toca('pega');
        var todos = dentroA.concat(dentroO.length ? dentroO : [jogo.rec.cor]);
        fimCz.push(C.animarDespejo(desp, { cor: corO, grosso: grosso, dur: 2600 * VA + 100, calmo: calmo(), n0: n0, n1: Math.max(0.6, Math.min(0.88, n0 + 0.45)), corAlvo: C.misturar(todos.filter(function (x) { return x.charAt(0) !== '#'; }).map(C.cor)) || corO,
          aoFim: function () { dentroO.forEach(function (id) { dentroA.push(id); }); dentroO.length = 0; agendarCz(concluir, 200 * VA + 50); } }));
      });
    } else if (a === 'virar') {
      palco.innerHTML = '<p class="instr">' + t('Espere dourar e toque em Virar!', 'Wait until it\'s golden and tap Flip!', '¡Espera a que se dore y luego dale la vuelta!') + '</p><div class="frigideira-cena quente">' + big(p.em) + '<span class="massa" style="--d:0"></span>' + vaporHtml() + '</div>' +
        '<button type="button" class="grande bt-virar">' + t('🔄 Virar!', '🔄 Flip!', '🔄 ¡Dale la vuelta!') + '</button>';
      var massa = qs(palco, '.massa'), btv = qs(palco, '.bt-virar'), pr = 0;
      var tv = setInterval(function () { pr = Math.min(1, pr + 0.05 / (2.6 * V)); massa.style.setProperty('--d', pr.toFixed(2)); if (pr >= 0.6) btv.classList.add('luz'); }, 50);
      fimCz.push(function () { clearInterval(tv); });
      btv.addEventListener('click', function () {
        if (pr < 0.6) { aviso(t('Ainda não dourou! Espere mais um pouquinho.', 'Not golden yet! Wait a little bit more.', '¡Todavía no se ha dorado! Espera un poquito más.'), 1800); return; }
        clearInterval(tv); btv.disabled = true; massa.classList.add('vira'); agendarCz(concluir, 700 * V + 100);
      });
    } else if (a === 'assar' || a === 'gelar' || a === 'esperar') {
      // forno: a janelinha acende e brilha, com calor subindo; geladeira: a porta abre e sai uma fumacinha gelada;
      // relógio: faz tique-taque. O relógio redondo conta o tempo.
      var cfgT = { assar: ['forno', t('🍽️ Pôr no forno', '🍽️ Put in the oven', '🍽️ Meter al horno'), t('🧤 Tirar do forno', '🧤 Take it out', '🧤 Sacar del horno'), 5], gelar: ['geladeira', t('❄️ Pôr na geladeira', '❄️ Put in the fridge', '❄️ Meter en la nevera'), t('Tirar da geladeira', 'Take it out of the fridge', 'Sacar de la nevera'), 4], esperar: ['relogio', t('⏰ Começar a esperar', '⏰ Start waiting', '⏰ Empezar a esperar'), t('✅ Pronto!', '✅ Ready!', '✅ ¡Listo!'), 4] }[a];
      var extra = a === 'assar' ? '<span class="brilho-forno" aria-hidden="true"></span><span class="calor" aria-hidden="true"><i></i><i></i><i></i></span>'
        : a === 'gelar' ? '<span class="dentro-gel" aria-hidden="true">' + ART.imgFoto(jogo.rec.id) + '</span><span class="porta-gel" aria-hidden="true"></span>' : '';
      palco.innerHTML = '<p class="instr">' + t('Coloque e espere o tempo passar', 'Put it in and wait for the time to pass', 'Mételo y espera a que pase el tiempo') + '</p><div class="timer-cena"><div class="aparelho a-' + cfgT[0] + '">' + big(cfgT[0]) + extra + '</div><div class="timer" style="--p:0"><span></span></div></div>' +
        '<button type="button" class="grande bt-timer">' + cfgT[1] + '</button>';
      var btt = qs(palco, '.bt-timer'), tim = qs(palco, '.timer'), apar = qs(palco, '.aparelho'), fase = 0;
      btt.addEventListener('click', function () {
        if (fase === 0) {
          fase = 1; btt.disabled = true; Som.toca('toque'); palco.classList.add('ligado');
          if (a === 'gelar') {
            apar.classList.add('aberta');
            if (!calmo()) [0, 260, 520].forEach(function (ms) { agendarCz(function () { var c2 = centroDe(apar); C.nuvem(c2.x + c2.w * 0.1, c2.y + c2.h * 0.15, '#e3f4ff', 5); }, ms * VA); });
            agendarCz(function () { apar.classList.remove('aberta'); }, 1100 * VA + 100);
          }
          var dur = cfgT[3] * 1000 * V, ini = Date.now();
          var iv = setInterval(function () {
            var pr2 = Math.min(1, (Date.now() - ini) / dur); tim.style.setProperty('--p', pr2.toFixed(3)); qs(tim, 'span').textContent = Math.ceil((1 - pr2) * cfgT[3]);
            if (pr2 >= 1) { clearInterval(iv); fase = 2; btt.disabled = false; btt.textContent = cfgT[2]; btt.classList.add('luz'); qs(tim, 'span').textContent = '✔'; Som.toca('pega'); palco.classList.add('pronto-t'); }
          }, 100);
          fimCz.push(function () { clearInterval(iv); });
        } else if (fase === 2) { btt.disabled = true; concluir(); }
      });
    } else if (a === 'maos') {
      var toques = 0, N = 5;
      palco.innerHTML = '<p class="instr">' + t('Toque na massa para modelar com as mãos 🤲', 'Tap the dough to shape it with your hands 🤲', 'Toca la masa para darle forma con las manos 🤲') + '</p>' +
        '<button type="button" class="massa-mao" style="--c:' + jogo.rec.cor + '" aria-label="' + t('Massa', 'Dough', 'Masa') + '"></button><div class="bolinhas"></div><p class="contador">0/' + N + '</p>';
      var mm = qs(palco, '.massa-mao'), bol = qs(palco, '.bolinhas'), cn = qs(palco, '.contador');
      mm.addEventListener('click', function () {
        if (toques >= N) return; toques++; Som.toca('toque');
        mm.classList.remove('aperta'); void mm.offsetWidth; mm.classList.add('aperta');
        if (!calmo()) { var c3 = centroDe(mm); C.nuvem(c3.x, c3.y - c3.h * 0.3, '#fff6e6', 3); }
        var s = document.createElement('span'); s.className = 'bolinha'; s.style.setProperty('--c', jogo.rec.cor); bol.appendChild(s); cn.textContent = toques + '/' + N;
        if (toques >= N) concluir();
      });
    } else if (a === 'servir') {
      palco.innerHTML = '<p class="instr">' + t('Toque para servir! 😋', 'Tap to serve! 😋', '¡Toca para servir! 😋') + '</p><button type="button" class="bt-servir" aria-label="' + t('Servir', 'Serve', 'Servir') + '">' + icone(p.u) + '<span class="comida" aria-hidden="true">' + ART.imgFoto(jogo.rec.id) + '</span>' + vaporHtml() + '</button>';
      qs(palco, '.bt-servir').addEventListener('click', function () {
        this.disabled = true; this.classList.add('servido');
        if (!calmo()) { var c4 = centroDe(this); C.faiscas(c4.x, c4.y - c4.h * 0.1, 9); }
        agendarCz(concluir, 600 * V + 100);
      });
    }
  }
  function vaporHtml() { return '<span class="vapores" aria-hidden="true"><i></i><i></i><i></i></span><span class="chiado" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'; }

  // ---------- receita pronta ----------
  function terminar() {
    var r = tempoRestante(), atrasou = r != null && r <= 0;
    var est = L.estrelas({ erros: jogo.erros, atrasou: atrasou }), nv = jogo.cfg;
    clearInterval(tSol);
    salvarProgresso(jogo.rec.id, jogo.nivel, est);
    // o menininho comendo o prato (garfo e faquinha, mastiga, lambe os lábios, "Hmm!"), com vapor e brilhos
    pararMenino();
    $('prontoPrato').innerHTML = C.menino({ cor: jogo.rec.cor, prato: jogo.rec.e, foto: ART.foto(jogo.rec.id), hmm: t('Hmm!', 'Yum!', '¡Mmm!') });
    if (!calmo()) pararMenino = C.animarMenino(qs($('prontoPrato'), 'svg'));
    // a família à mesa: cada um com o seu prato (a foto de verdade), comendo junto com o menininho
    var outros = jogo.familia.filter(function (x) { return x !== 'eu'; }).map(function (id) { return Object.assign({}, D.pessoa[id], { nome: tx(D.pessoa[id]) }); });
    $('prontoFamilia').innerHTML = outros.length ? C.familia(outros, ART.foto(jogo.rec.id)) : ''; $('prontoFamilia').hidden = !outros.length;
    foto = { rec: jogo.rec, est: est, nivel: nv.e + ' ' + tx(nv) };
    $('prontoTitulo').textContent = t('🎉 Oba! Você fez: ', '🎉 Yay! You made: ', '🎉 ¡Genial! Has hecho: ') + tx(jogo.rec) + '!';
    $('prontoEstrelas').innerHTML = '<span aria-label="' + est + t(' estrelas', ' stars', ' estrellas') + '">' + '⭐'.repeat(est) + '<span class="apagada">' + '☆'.repeat(3 - est) + '</span></span>';
    $('prontoNota').textContent = atrasou ? t('🌙 Ficou de noite, mas a comida ficou uma delícia!', '🌙 It got dark, but the food is delicious!', '🌙 Se ha hecho de noche, ¡pero la comida ha quedado riquísima!')
      : jogo.erros ? t('Você acertou quase tudo! Errinhos: ' + jogo.erros, 'You got almost everything right! Little mistakes: ' + jogo.erros, '¡Has acertado casi todo! Fallitos: ' + jogo.erros) : t('Perfeito, sem nenhum erro! 👏', 'Perfect, no mistakes at all! 👏', '¡Perfecto, sin ningún error! 👏');
    if (outros.length) {
      var nomes = outros.map(function (f) { return f.nome; }), lista = nomes.length > 1 ? nomes.slice(0, -1).join(', ') + t(' e ', ' and ', ' y ') + nomes[nomes.length - 1] : nomes[0];
      $('prontoNota').textContent += t(' 👨‍👩‍👧 ' + lista + (nomes.length > 1 ? ' comeram' : ' comeu') + ' junto com você!', ' 👨‍👩‍👧 ' + lista + ' ate with you!', ' 👨‍👩‍👧 ¡' + lista + (nomes.length > 1 ? ' han comido' : ' ha comido') + ' contigo!');
    }
    var ordem = jogo.cz.feitos.map(function (id) { return jogo.passos.filter(function (p) { return p.id === id; })[0]; });
    $('cartao').innerHTML = '<h3>📜 ' + t('Receita da família', 'Family recipe', 'Receta de la familia') + '</h3><h4>' + ART.imgFoto(jogo.rec.id, 'ic-titulo') + ' ' + tx(jogo.rec) + '</h4>' +
      '<p class="nivel-c">' + nv.e + ' ' + tx(nv) + ' · ' + hoje() + ' · 🍽️ ' + jogo.familia.length + t(jogo.familia.length > 1 ? ' pessoas' : ' pessoa', jogo.familia.length > 1 ? ' people' : ' person', jogo.familia.length > 1 ? ' personas' : ' persona') + '</p><h5>' + t('Ingredientes', 'Ingredients', 'Ingredientes') + '</h5><ul>' +
      jogo.precisa.map(function (x) { return '<li>' + icone(x.id) + ' ' + L.nomeQtd(x.id, x.q, lingua) + '</li>'; }).join('') + '</ul><h5>' + t('Modo de fazer', 'How to make it', 'Cómo se hace') + '</h5><ol>' +
      ordem.map(function (p) { return '<li>' + texto(p) + '</li>'; }).join('') + '</ol><p class="dica-adulto">' + t('🧑‍🍳 Para fazer de verdade: chame um adulto para o fogão, o forno, a faca e o liquidificador. Bom apetite!', '🧑‍🍳 To make it for real: ask a grown-up for the stove, oven, knife and blender. Enjoy your meal!', '🧑‍🍳 Para hacerla de verdad: pide ayuda a un adulto con el fogón, el horno, el cuchillo y la batidora. ¡Buen provecho!') + '</p>';
    var festa = qs($('pronto'), '.festa'); festa.innerHTML = '';
    ['🎉', '⭐', '💛', 'foto', '✨', '🎊'].forEach(function (e, i) { for (var k = 0; k < 3; k++) { var s = document.createElement('span'); if (e === 'foto') s.innerHTML = ART.imgFoto(jogo.rec.id); else s.textContent = e; s.style.left = (Math.random() * 96) + '%'; s.style.animationDelay = (Math.random() * 1.2) + 's'; festa.appendChild(s); } });
    Som.toca('fim');
    falar($('prontoTitulo').textContent);
    pilha = []; try { history.pushState({ cozinha: 'pronto' }, ''); } catch (e) { /* ok */ }
    mostrar('pronto');
  }
  function hoje() {
    var d = new Date(), M = ix([['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']]);
    var dd = (d.getDate() < 10 ? '0' : '') + d.getDate();
    return en() ? M[d.getMonth()] + '/' + dd + '/' + d.getFullYear() : dd + '/' + M[d.getMonth()] + '/' + d.getFullYear();
  }
  var pararMenino = function () {}, foto = null;
  // 📷 Guardar a foto: desenha o prato com o menininho, o nome da receita e a data num PNG; no celular abre o
  // "compartilhar" (galeria, WhatsApp), senão baixa o arquivo. Tudo no aparelho, funciona sem internet.
  function guardarFoto() {
    if (!foto) return;
    var bt = $('btFoto'); bt.disabled = true;
    var d = new Date(), dia = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    var nome = 'mao-na-massa-' + foto.rec.id + '-' + dia + '.png';
    C.foto({ titulo: t('Mão na Massa', 'My Little Big Chef', 'Manos a la Masa'), receita: tx(foto.rec), prato: foto.rec.e, foto: ART.foto(foto.rec.id), cor: foto.rec.cor, estrelas: foto.est, hmm: t('Hmm!', 'Yum!', '¡Mmm!'),
      linha: t('Feito em ', 'Made on ', 'Hecho el ') + hoje() + ' · ' + foto.nivel, rodape: 'solverone.com.br/kids · Bolinho de Chuva' }).then(function (blob) {
      var arq = null; try { arq = new File([blob], nome, { type: 'image/png' }); } catch (e) { arq = null; }
      var celular = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
      if (arq && celular && navigator.share && navigator.canShare && navigator.canShare({ files: [arq] })) {
        return navigator.share({ files: [arq], title: t('Mão na Massa', 'My Little Big Chef', 'Manos a la Masa'), text: tx(foto.rec) + ' 😋' }).then(function () {
          aviso(t('📷 Foto pronta!', '📷 Photo ready!', '📷 ¡Foto lista!'), 2000, true);
        }, function (e) { if (!e || e.name !== 'AbortError') baixar(blob, nome); });
      }
      baixar(blob, nome);
    }).catch(function () { aviso(t('Não deu para fazer a foto agora. Tente de novo!', 'Couldn\'t make the photo right now. Try again!', 'No se ha podido hacer la foto ahora. ¡Inténtalo de nuevo!'), 2600, true); })
      .then(function () { bt.disabled = false; });
  }
  function baixar(blob, nome) {
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = nome; a.hidden = true; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
    aviso(t('📷 Foto guardada no aparelho!', '📷 Photo saved on the device!', '📷 ¡Foto guardada en el dispositivo!'), 2400, true);
  }
  $('btFoto').addEventListener('click', guardarFoto);
  $('btDeNovo').addEventListener('click', function () { var id = jogo.rec.id; novoJogo(id, jogo.nivel); pilha = ['menu']; mostrar('mapa'); });
  $('btOutra').addEventListener('click', function () { pilha = []; mostrar('menu'); });

  // ---------- música, service worker ----------
  if (window.Trilha) {
    // só músicas animadas com instrumentos de verdade (ukulele, violão, metais, acordeão, cordas, marimba...), nada de
    // som de videogame antigo; tocadas direto das pastas da Rabiscolândia e da Bagunçolândia (nenhum arquivo copiado)
    var M = '../rabiscolandia/musicas/', B = '../baguncolandia/musicas/', au = 'Kevin MacLeod', lic = 'CC BY', cc0 = 'CC0';
    Trilha.iniciar({ jogo: 'cozinha', creditos: 'CREDITOS.md', volume: 0.4, musicas: [
      { a: M + 'fluffing-a-duck.mp3', t: 'Fluffing a Duck', au: au, lic: lic },
      { a: M + 'carefree.mp3', t: 'Carefree', au: au, lic: lic },
      { a: M + 'sneaky-snitch.mp3', t: 'Sneaky Snitch', au: au, lic: lic },
      { a: M + 'scheming-weasel.mp3', t: 'Scheming Weasel', au: au, lic: lic },
      { a: M + 'life-of-riley.mp3', t: 'Life of Riley', au: au, lic: lic },
      { a: M + 'mariachi-snooze.mp3', t: 'Mariachi Snooze', au: au, lic: lic },
      { a: M + 'carpe-diem.mp3', t: 'Carpe Diem', au: au, lic: lic },
      { a: M + 'street-party.mp3', t: 'Street Party', au: au, lic: lic },
      { a: M + 'beachfront-celebration.mp3', t: 'Beachfront Celebration', au: au, lic: lic },
      { a: B + 'happy-whistling-ukulele.mp3', t: 'Happy Whistling Ukulele', au: 'Rafael Krux', lic: cc0 },
      { a: B + 'ukulele-song.mp3', t: 'Ukulele Song', au: 'Rafael Krux', lic: cc0 },
      { a: B + 'city-sunshine.mp3', t: 'City Sunshine', au: au, lic: cc0 },
      { a: B + 'funshine.mp3', t: 'Funshine', au: au, lic: cc0 }
    ] });
  }
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });

  traduzir(); desenharMenu();
  // trocaram o idioma na estante (outra aba): os textos e o menu mudam na hora; as outras telas, ao abrir de novo
  if (window.BolinhoIdioma) BolinhoIdioma.aoMudar(function (c) { lingua = c; traduzir(); desenharMenu(); });

  // para os testes e para quem quiser espiar no console
  window.Cozinha = { versao: APP_VERSION, jogo: function () { return jogo; }, atual: function () { return atual; }, ir: ir, mostrar: mostrar };
})();

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer jogar não baixa nada a mais. */
(function () {
  if (!/[?&]instalar\b/.test(location.search) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.src = '../instalar.js';
  s.setAttribute('data-nome', 'Mão na Massa'); s.setAttribute('data-icone', 'icone-192.png');
  s.setAttribute('data-so-com', 'instalar'); s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
  document.body.appendChild(s);
})();
