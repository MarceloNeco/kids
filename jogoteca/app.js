/* Jogoteca — a casca: menu de capas com prévia ao lado (como a tela de jogos do avião), nível, ▶ Jogar, a tela do jogo
   com barra (nome, nível, ❓, 🔄) e a janela de vitória. Cada jogo mora em jogos/<id>.js e se registra assim:

     (window.JogotecaJogos = window.JogotecaJogos || []).push({
       id: 'paciencia',
       ajuda: function (t) { return '<p>' + t('…pt', '…en', '…es') + '</p>'; },   // texto do ❓ (HTML simples)
       iniciar: function (palco, ctx) { …; return { parar: function () {…} }; }
     });

   ctx = { nivel: 'facil'|'medio'|'dificil', lingua: 'pt'|'en'|'es', t(pt, en, es), calmo (reduzir movimento),
           som(nome) ('toque' | 'carta' | 'certo' | 'erro' | 'pino' | 'vitoria'), somLigado() (o 🔊 do menu, para o jogo com WebAudio próprio),
           ler(chave), gravar(chave, valor) (no aparelho),
           venceu(textoPt, textoEn, textoEs) (abre a janela 🎉), teste (true com ?teste) }.
   O jogo desenha tudo dentro de "palco" (um div que ocupa a tela embaixo da barra) e, no parar(), solta o que prendeu
   (laços de animação, eventos na janela). Nomes, textos e capas ficam aqui e em capas.js (a vitrine é da casca).
   Versão: APP_VERSION aqui = VERSAO no sw.js = primeira entrada do versoes.json. */
(function () {
  'use strict';
  var APP_VERSION = '0.2.1', APP_DATA = '19/Nov/2026';
  var $ = function (id) { return document.getElementById(id); };
  var BUSCA = location.search, TESTE = /[?&]teste\b/.test(BUSCA);
  var calmo = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  // trilha: lounge, jazz e piano, gravações com instrumentos de verdade que já moram no Bolinho (créditos em CREDITOS.md)
  var KM = 'Kevin MacLeod', CC = 'CC BY 4.0', RB = '../rabiscolandia/musicas/', PP = '../purpurina/musicas/';
  var MUSICAS = [
    { a: RB + 'disco-lounge.mp3', t: 'Disco Lounge', au: KM, lic: CC },
    { a: RB + 'airport-lounge.mp3', t: 'Airport Lounge', au: KM, lic: CC },
    { a: RB + 'carefree.mp3', t: 'Carefree', au: KM, lic: CC },
    { a: RB + 'wallpaper.mp3', t: 'Wallpaper', au: KM, lic: CC },
    { a: RB + 'local-forecast-elevator.mp3', t: 'Local Forecast - Elevator', au: KM, lic: CC },
    { a: RB + 'investigations.mp3', t: 'Investigations', au: KM, lic: CC },
    { a: RB + 'movement-proposition.mp3', t: 'Movement Proposition', au: KM, lic: CC },
    { a: RB + 'gymnopedie-1.mp3', t: 'Gymnopédie nº 1 (Erik Satie)', au: KM, lic: CC },
    { a: RB + 'life-of-riley.mp3', t: 'Life of Riley', au: KM, lic: CC },
    { a: PP + 'late-night-radio.mp3', t: 'Late Night Radio', au: KM, lic: CC },
    { a: PP + 'club-seamus.mp3', t: 'Club Seamus', au: KM, lic: CC },
    { a: PP + 'island-meet-and-greet.mp3', t: 'Island Meet and Greet', au: KM, lic: CC }
  ];

  // a vitrine: os prontos primeiro; os "em construção" aparecem com a fita e sem ▶ Jogar (dono: "publicar como tem e ir ampliando")
  var LISTA = [
    { id: 'paciencia', nome: ['Paciência', 'Solitaire', 'Solitario'],
      texto: ['O jogo de cartas clássico: monte as quatro pilhas de cada naipe, do Ás ao Rei. Vire 1 carta por vez (mais fácil) ou 3 (o desafio de verdade).',
        'The classic card game: build the four piles of each suit, from Ace to King. Turn 1 card at a time (easier) or 3 (the real challenge).',
        'El juego de cartas clásico: forma las cuatro pilas de cada palo, del As al Rey. Gira 1 carta cada vez (más fácil) o 3 (el reto de verdad).'] },
    { id: 'sudoku', nome: ['Sudoku', 'Sudoku', 'Sudoku'],
      texto: ['Complete a grade com os números de 1 a 9 sem repetir em nenhuma linha, coluna ou quadradinho. Paciência e lógica, sem pressa.',
        'Fill the grid with the numbers 1 to 9 without repeating any in a row, column or box. Patience and logic, no rush.',
        'Completa la cuadrícula con los números del 1 al 9 sin repetir en ninguna fila, columna ni cuadro. Paciencia y lógica, sin prisa.'] },
    { id: 'boliche', nome: ['Boliche', 'Bowling', 'Bolos'],
      texto: ['Arraste o dedo para lançar a bola e derrube os 10 pinos. Uma partida de 10 jogadas, com strike, spare e placar de verdade.',
        'Swipe to throw the ball and knock down all 10 pins. A 10-frame game with strikes, spares and a real scoreboard.',
        'Desliza el dedo para lanzar la bola y derriba los 10 bolos. Una partida de 10 tiradas, con pleno, semipleno y marcador de verdad.'] },
    { id: 'bolinhas', nome: ['Bolinhas da Angústia', 'Nail-Biter Drop', 'Bolitas de la Angustia'],
      texto: ['O game show da parede gigante: responda, escolha de onde a bolinha cai e torça enquanto ela quica entre os pinos até o último segundo. Com um parceiro virtual ou em dois, passando o aparelho.',
        'The giant-wall game show: answer, pick where the ball drops and hold your breath as it bounces through the pegs until the very last second. With a virtual partner or as two, passing the device.',
        'El concurso de la pared gigante: responde, elige desde dónde cae la bolita y cruza los dedos mientras rebota entre los clavos hasta el último segundo. Con un compañero virtual o entre dos, pasándoos el aparato.'] },
    { id: 'milionario', breve: true, nome: ['Milionário José Pobre', 'Millionaire Joe Broke', 'Millonario José Pobre'],
      texto: ['Perguntas de cultura geral com prêmio que sobe a cada acerto e ajudas para os apertos. Será que o José fica milionário?',
        'General-knowledge questions with a prize that grows with every right answer, and lifelines for tight spots. Will Joe get rich?',
        'Preguntas de cultura general con un premio que sube con cada acierto y comodines para los apuros. ¿Se hará rico José?'] },
    { id: 'bilhar', breve: true, nome: ['Bilhar', 'Pool', 'Billar'],
      texto: ['Mire, escolha a força e encaçape as bolas na mesa verde. Para jogar sozinho ou em dois.',
        'Aim, pick your power and pot the balls on the green table. Play alone or with two.',
        'Apunta, elige la fuerza y mete las bolas en la mesa verde. Para jugar solo o entre dos.'] }
  ];
  var NIVEL_TXT = {
    paciencia: [['Vira 1 carta por vez e pode desfazer sempre.', 'Turn 1 card at a time and undo as much as you like.', 'Gira 1 carta cada vez y deshaz siempre que quieras.'],
      ['Vira 3 cartas por vez e pode desfazer.', 'Turn 3 cards at a time, with undo.', 'Gira 3 cartas cada vez y puedes deshacer.'],
      ['Vira 3 cartas por vez e sem desfazer.', 'Turn 3 cards at a time, no undo.', 'Gira 3 cartas cada vez, sin deshacer.']],
    sudoku: [['Muitos números já no lugar, para aprender.', 'Lots of numbers already in place, to learn.', 'Muchos números ya colocados, para aprender.'],
      ['O sudoku do jornal de domingo.', 'The Sunday-paper sudoku.', 'El sudoku del periódico del domingo.'],
      ['Poucas pistas: para quem já é bom.', 'Few clues: for the experts.', 'Pocas pistas: para los que ya son buenos.']],
    boliche: [['Pista com proteção nas canaletas: a bola nunca cai.', 'Bumpers on the gutters: the ball never falls in.', 'Barreras en los canales: la bola nunca cae.'],
      ['Pista normal, sem proteção.', 'Regular lane, no bumpers.', 'Pista normal, sin barreras.'],
      ['A bola faz curva e os pinos são mais teimosos.', 'The ball curves and the pins are more stubborn.', 'La bola hace curva y los bolos son más tozudos.']],
    bolinhas: [['Perguntas mais fáceis e parceiro virtual mais forte.', 'Easier questions and a stronger virtual partner.', 'Preguntas más fáciles y un compañero virtual más fuerte.'],
      ['Perguntas variadas e parceiro equilibrado.', 'Mixed questions and a balanced partner.', 'Preguntas variadas y un compañero equilibrado.'],
      ['Perguntas difíceis e parceiro virtual mais fraco.', 'Hard questions and a weaker virtual partner.', 'Preguntas difíciles y un compañero virtual más flojo.']]
  };

  /* ---------- preferências (no aparelho) ---------- */
  var CH_PREF = 'bolinho:jogoteca:pref';
  function lerJSON(k, pad) { try { var v = JSON.parse(localStorage.getItem(k)); return v && typeof v === 'object' ? v : pad; } catch (e) { return pad; } }
  function gravarJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var pref = Object.assign({ jogo: 'paciencia', niveis: {}, efeitos: true }, lerJSON(CH_PREF, {}));
  if (!pref.niveis || typeof pref.niveis !== 'object') pref.niveis = {};
  function salvarPref() { gravarJSON(CH_PREF, pref); }
  var lingua = window.BolinhoIdioma ? BolinhoIdioma.atual() : 'pt';
  var IDX = { pt: 0, en: 1, es: 2 };
  function t(pt, en, es) { return lingua === 'en' ? en : lingua === 'es' ? es : pt; }
  function tri(a) { return a[IDX[lingua]] != null ? a[IDX[lingua]] : a[0]; }
  function porId(id) { for (var i = 0; i < LISTA.length; i++) if (LISTA[i].id === id) return LISTA[i]; return null; }
  function modulo(id) { var l = window.JogotecaJogos || []; for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function nivelDe(id) { var n = pref.niveis[id]; return n === 'medio' || n === 'dificil' ? n : 'facil'; }
  function nomeNivel(n) { return n === 'dificil' ? t('Difícil', 'Hard', 'Difícil') : n === 'medio' ? t('Médio', 'Medium', 'Medio') : t('Fácil', 'Easy', 'Fácil'); }
  if (!porId(pref.jogo) || porId(pref.jogo).breve) pref.jogo = 'paciencia';

  /* ---------- sons curtinhos (WebAudio, sem arquivo) ---------- */
  var actx = null;
  function som(nome) {
    if (!pref.efeitos) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      var n = actx.currentTime;
      var notas = { toque: [[660, 0, .05]], carta: [[420, 0, .04], [300, .03, .04]], certo: [[660, 0, .08], [880, .08, .1]],
        erro: [[220, 0, .12], [180, .1, .14]], pino: [[140, 0, .09], [95, .04, .12]], vitoria: [[523, 0, .12], [659, .12, .12], [784, .24, .12], [1047, .36, .3]] }[nome] || [[500, 0, .05]];
      notas.forEach(function (q) {
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = nome === 'pino' ? 'triangle' : 'sine'; o.frequency.value = q[0];
        g.gain.setValueAtTime(.0001, n + q[1]); g.gain.exponentialRampToValueAtTime(.18, n + q[1] + .01); g.gain.exponentialRampToValueAtTime(.0001, n + q[1] + q[2]);
        o.connect(g); g.connect(actx.destination); o.start(n + q[1]); o.stop(n + q[1] + q[2] + .02);
      });
    } catch (e) { /* sem som neste aparelho */ }
  }

  /* ---------- telas ---------- */
  var tela = 'menu', empurrado = false, rodando = null, atual = null;
  function mostrar(id) {
    document.querySelectorAll('.tela').forEach(function (s) { s.classList.toggle('ativa', s.id === id); });
    tela = id; document.body.classList.toggle('jogando', id === 'jogo');
  }
  function pararJogo() { if (rodando && rodando.parar) { try { rodando.parar(); } catch (e) {} } rodando = null; $('palco').innerHTML = ''; }
  function irMenu() { pararJogo(); fecharFim(); $('ajuda').hidden = true; mostrar('menu'); pintarMenu(); }
  window.addEventListener('popstate', function () { empurrado = false; if (tela !== 'menu') irMenu(); });
  function voltarMenu() { if (empurrado) history.back(); else irMenu(); }

  function jogar() {
    var j = porId(pref.jogo), m = modulo(pref.jogo);
    if (!j || j.breve || !m) return;
    som('toque');
    if (!empurrado) { try { history.pushState({ jogoteca: j.id }, ''); empurrado = true; } catch (e) {} }
    atual = j; mostrar('jogo'); comecar();
  }
  function comecar() {
    pararJogo(); fecharFim();
    var j = atual, m = modulo(j.id), nivel = nivelDe(j.id);
    $('jogoNome').textContent = tri(j.nome); $('jogoNivel').textContent = nomeNivel(nivel);
    $('jogoNivel').className = 'barra-nivel ' + nivel;
    var ctx = {
      nivel: nivel, lingua: lingua, t: t, calmo: calmo, som: som, teste: TESTE, somLigado: function () { return !!pref.efeitos; },
      ler: function (k) { try { return JSON.parse(localStorage.getItem('bolinho:jogoteca:' + j.id + ':' + k)); } catch (e) { return null; } },
      gravar: function (k, v) { try { localStorage.setItem('bolinho:jogoteca:' + j.id + ':' + k, JSON.stringify(v)); } catch (e) {} },
      venceu: function (pt, en, es) { abrirFim(t(pt || '', en || pt || '', es || pt || '')); }
    };
    rodando = m.iniciar($('palco'), ctx) || null;
  }
  function abrirFim(texto) {
    som('vitoria');
    $('fimTitulo').textContent = t('Você conseguiu!', 'You did it!', '¡Lo has conseguido!');
    $('fimTexto').textContent = texto; $('fim').hidden = false;
    setTimeout(function () { $('btDeNovo').focus(); }, 50);
  }
  function fecharFim() { $('fim').hidden = true; }
  $('btJogar').addEventListener('click', jogar);
  $('btRecomecar').addEventListener('click', function () { som('toque'); comecar(); });
  $('btDeNovo').addEventListener('click', function () { comecar(); });
  $('btOutro').addEventListener('click', function () { voltarMenu(); });
  $('btAjuda').addEventListener('click', function () {
    var m = atual && modulo(atual.id);
    $('ajudaTexto').innerHTML = m && m.ajuda ? m.ajuda(t) : '';
    $('ajuda').hidden = false; $('btAjuda').setAttribute('aria-expanded', 'true'); $('btAjudaOk').focus();
  });
  $('btAjudaOk').addEventListener('click', function () { $('ajuda').hidden = true; $('btAjuda').setAttribute('aria-expanded', 'false'); });
  $('btEfeitos').addEventListener('click', function () {
    pref.efeitos = !pref.efeitos; salvarPref(); pintarEfeitos(); som('toque');
  });
  function pintarEfeitos() { $('btEfeitos').textContent = pref.efeitos ? '🔊' : '🔇'; $('btEfeitos').setAttribute('aria-pressed', String(pref.efeitos)); }

  /* ---------- menu: capas e prévia ---------- */
  function capaHTML(j) {
    var arte = window.JogotecaCapas && JogotecaCapas[j.id] ? JogotecaCapas[j.id]() : '';
    return '<span class="capa-arte">' + arte + '</span><span class="capa-nome">' + tri(j.nome) + '</span>' +
      (j.breve ? '<span class="fita">' + t('Em breve', 'Coming soon', 'Muy pronto') + '</span>' : '');
  }
  function montarCapas() {
    var c = $('capas'); c.innerHTML = '';
    LISTA.forEach(function (j) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'capa' + (j.breve ? ' breve' : ''); b.setAttribute('role', 'option');
      b.setAttribute('data-jogo', j.id); b.innerHTML = capaHTML(j);
      b.addEventListener('click', function () {
        if (pref.jogo === j.id && !j.breve && innerWidth < 760) { jogar(); return; }   // 2º toque na mesma capa (celular): joga
        pref.jogo = j.id; salvarPref(); som('toque'); pintarMenu();
        if (innerWidth < 760) $('previa').scrollIntoView({ block: 'nearest', behavior: calmo ? 'auto' : 'smooth' });
      });
      c.appendChild(b);
    });
  }
  function pintarMenu() {
    var j = porId(pref.jogo) || LISTA[0], nivel = nivelDe(j.id);
    document.querySelectorAll('.capa').forEach(function (b) {
      var sim = b.getAttribute('data-jogo') === j.id;
      b.classList.toggle('escolhida', sim); b.setAttribute('aria-selected', String(sim));
    });
    $('previaCapa').innerHTML = window.JogotecaCapas && JogotecaCapas[j.id] ? JogotecaCapas[j.id]() : '';
    $('previaNome').textContent = tri(j.nome); $('previaTexto').textContent = tri(j.texto);
    $('linhaNivel').hidden = !!j.breve; $('btJogar').hidden = !!j.breve; $('emBreve').hidden = !j.breve;
    document.querySelectorAll('#linhaNivel .chip').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-nivel') === nivel)); });
    var nt = NIVEL_TXT[j.id]; $('previaNivel').textContent = nt && !j.breve ? tri(nt[nivel === 'dificil' ? 2 : nivel === 'medio' ? 1 : 0]) : '';
  }
  document.querySelectorAll('#linhaNivel .chip').forEach(function (b) {
    b.addEventListener('click', function () { pref.niveis[pref.jogo] = b.getAttribute('data-nivel'); salvarPref(); som('toque'); pintarMenu(); });
  });
  // teclado e controle da TV: setas andam pelas capas no menu
  document.addEventListener('keydown', function (e) {
    if (tela !== 'menu' || !e.key) return;
    var i = LISTA.indexOf(porId(pref.jogo));
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      var foco = document.activeElement;
      if (foco && foco.closest && (foco.closest('#linhaNivel') || foco.id === 'btJogar')) return;
      i = (i + (e.key === 'ArrowRight' ? 1 : LISTA.length - 1)) % LISTA.length;
      pref.jogo = LISTA[i].id; salvarPref(); pintarMenu();
      var b = document.querySelector('.capa[data-jogo="' + pref.jogo + '"]'); if (b) b.focus();
      e.preventDefault();
    }
  });

  /* ---------- idioma ---------- */
  function dataVersao() {   // PT 19/Nov/2026 · EN Nov/19/2026 · ES 19/nov/2026
    var p = APP_DATA.split('/');
    return t(APP_DATA, p[1] + '/' + p[0] + '/' + p[2], p[0] + '/' + p[1].toLowerCase() + '/' + p[2]);
  }
  function traduzir() {
    document.documentElement.lang = t('pt-BR', 'en-US', 'es-ES');
    function parte(el, at) { var p = el.getAttribute(at).split('|'); return p[IDX[lingua]] != null ? p[IDX[lingua]] : p[0]; }
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = parte(el, 'data-t'); });
    document.querySelectorAll('[data-rotulo]').forEach(function (el) { el.setAttribute('aria-label', parte(el, 'data-rotulo')); });
    $('versao').textContent = 'Jogoteca · ' + t('Versão ', 'Version ', 'Versión ') + APP_VERSION + ' · ' + dataVersao();
    montarCapas(); pintarMenu();
    if (tela === 'jogo' && atual) { $('jogoNome').textContent = tri(atual.nome); $('jogoNivel').textContent = nomeNivel(nivelDe(atual.id)); }
  }
  if (window.BolinhoIdioma) BolinhoIdioma.aoMudar(function (c) { lingua = c; traduzir(); });

  /* ---------- começo ---------- */
  if (window.BolinhoNav) BolinhoNav.iniciar({ jogo: 'jogoteca', noInicio: function () { return tela === 'menu'; }, irParaInicio: voltarMenu,
    emAndamento: function () { return tela === 'jogo' && !!rodando && $('fim').hidden; } });
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !TESTE) navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });
  pintarEfeitos();
  if (window.SolverRecursos && !SolverRecursos.ligado('jogoteca', true)) {
    document.querySelectorAll('.tela').forEach(function (s) { s.classList.remove('ativa'); }); $('desligado').hidden = false; traduzir(); return;
  }
  traduzir();
  if (window.Trilha && !TESTE) window.Trilha.iniciar({ jogo: 'jogoteca', musicas: MUSICAS, creditos: 'CREDITOS.md' });

  // para os testes no navegador (?teste)
  if (TESTE) window.JogotecaDebug = { versao: APP_VERSION, MUSICAS: MUSICAS, LISTA: LISTA, jogar: function (id, nivel) {
    pref.jogo = id; if (nivel) pref.niveis[id] = nivel; pintarMenu(); jogar(); }, tela: function () { return tela; }, rodando: function () { return rodando; } };
})();

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer jogar não baixa nada a mais. */
(function () {
  if (!/[?&]instalar\b/.test(location.search) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.src = '../instalar.js';
  s.setAttribute('data-nome', 'Jogoteca'); s.setAttribute('data-icone', 'icone-192.png');
  s.setAttribute('data-so-com', 'instalar'); s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
  document.body.appendChild(s);
})();
