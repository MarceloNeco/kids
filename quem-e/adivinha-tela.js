/* Quem é? — A Meleca Adivinha: a tela (níveis, a meleca perguntando, o chute, "você me venceu" e ensinar, ensinar
   alguém do zero, o que a meleca aprendeu, voz animada). O pensamento fica em adivinha.js, o aprender em aprender.js,
   a voz em voz.js e a lista pronta em personagens/*.js. Usa as peças da tela do Duelo (window.QEApp, de app.js). */
(function () {
  'use strict';
  var A = window.QEApp, Q = window.QEPerguntasAdivinha, M = window.QEAdivinha;
  if (!A || !Q || !M) return;
  var t = A.t, $ = function (id) { return document.getElementById(id); };
  var base = M.carregar(Object.keys(window.QEPersonagens || {}).map(function (k) { return window.QEPersonagens[k]; }), Q.PERGUNTAS);
  var armazem = { getItem: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, setItem: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sem espaço */ } } };
  var ap = window.QEAprender.criar({ armazenamento: armazem });
  var EMOJIS = ['🙂', '👦', '👧', '👨', '👩', '👴', '👵', '👶', '🐶', '🐱', '🦸', '👸', '🤖', '🦄', '⭐', '❤️'];
  var nivel = 'I', jogo = null, chuteAtual = null, ensino = null, emojiEscolhido = '🙂', timers = [];
  // toda espera passa por aqui, para o 🏠 conseguir parar tudo de uma vez
  function depois(fn, ms) { var id = setTimeout(function () { timers = timers.filter(function (x) { return x !== id; }); fn(); }, A.TESTE ? 0 : ms); timers.push(id); }
  function parar() { timers.forEach(clearTimeout); timers = []; jogo = null; ensino = null; chuteAtual = null; }
  var AP = window.QEAprender;

  function normal(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); }
  function texto(id) { var p = Q.POR_ID[id]; return t(p.pt, p.en, p.es); }
  function mostrarBloco(qual) { ['advRespostas', 'advChute', 'advJoao', 'advPerdi', 'advFim'].forEach(function (b) { $(b).hidden = b !== qual; }); }
  var nMeleca = 0, humorAgora = '';
  function humor(h) { if (h === humorAgora) return; humorAgora = h; $('advMeleca').innerHTML = A.melecaSvg(A.pref.meleca, h); nMeleca++; }
  function dizer(txt, privado) { $('advPergunta').textContent = txt; A.falar(txt, privado); }

  // a lista pronta com as correções deste aparelho
  function baseCorrigida() {
    var c = ap.correcoes();
    return { perguntas: base.perguntas, personagens: base.personagens.map(function (p) { return c[p.id] ? { id: p.id, nome: p.nome, emoji: p.emoji, niveis: p.niveis, r: Object.assign({}, p.r, c[p.id]) } : p; }) };
  }

  // ---------- começar ----------
  Array.prototype.forEach.call(document.querySelectorAll('[data-nivel-adv]'), function (b) {
    b.addEventListener('click', function () { nivel = b.getAttribute('data-nivel-adv'); novoJogo(); A.telaCheia(); });
  });
  function novoJogo() {
    ensino = null; chuteAtual = null; A.limparFesta();
    jogo = M.criar({ base: baseCorrigida(), nivel: nivel, extras: ap.lista(), rnd: A.TESTE ? sorteio(7) : Math.random });
    humorAgora = ''; A.mostrar('adivinha'); $('btJaChega') && ($('btJaChega').hidden = true);
    dizer(t('Pensou em alguém? Então segura que lá vem bagunça!', 'Got someone in mind? Hold on, here comes a mess!', '¿Ya has pensado en alguien? ¡Pues agárrate, que empieza el lío!'));
    depois(passo, 900);
  }
  function sorteio(s) { s = s >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function passo() {
    if (A.atual() !== 'adivinha') return;
    if (ensino) { passoEnsino(); return; }
    if (!jogo) return;
    var a = jogo.proxima(), n = jogo.estado().perguntas;
    if (a.tipo === 'pergunta') {
      mostrarBloco('advRespostas'); humor('falando');
      $('advContador').textContent = t('Pergunta ', 'Question ', 'Pregunta ') + (n + 1);
      $('btAdvVoltar').disabled = n === 0;
      dizer(texto(a.id));
    } else if (a.tipo === 'chute') {
      chuteAtual = a.personagem; mostrarBloco('advChute'); humor('feliz'); A.Som.gosma();
      $('advChuteEmoji').textContent = a.personagem.emoji; $('advChuteNome').textContent = a.personagem.nome;
      $('advContador').textContent = t('Hmm… já sei!', 'Hmm… I know!', 'Mmm… ¡ya lo sé!');
      A.falar(t('Você pensou em ', 'You thought of ', '¿Has pensado en ') + a.personagem.nome + '?', /^apr-/.test(a.personagem.id));
      $('advPergunta').textContent = A.zoeira('sei');
      $('btAcertou').focus();
    } else perdi();
  }

  Array.prototype.forEach.call(document.querySelectorAll('#advRespostas .resp'), function (b) {
    b.addEventListener('click', function () {
      var r = b.getAttribute('data-r');
      if (ensino) { if (ensino.fase !== 'perguntas' || !ensino.atual) return; ensino.historico.push({ id: ensino.atual, r: r }); passo(); return; }
      if (!jogo || !jogo.responder(r)) return;
      humor('pensando'); depois(passo, 350);
    });
  });
  $('btAdvVoltar').addEventListener('click', function () {
    if (ensino) { ensino.historico.pop(); passo(); return; }
    if (jogo && jogo.desfazer()) passo();
  });

  // ---------- o chute ----------
  $('btAcertou').addEventListener('click', function () {
    var p = chuteAtual; if (!p) return;
    chuteAtual = null; $('advChute').hidden = true; A.Som.ganhou(); A.festa(); humor('feliz');
    if (p.id === 'joao-alves') {
      mostrarBloco('advJoao'); $('advContador').textContent = '🚕🚕🚕';
      dizer(t('É O JOÃO ALVES! A lenda da casa! Qual João foi hoje?', "IT'S JOÃO ALVES! The family legend! Which João was it today?", '¡ES JOÃO ALVES! ¡La leyenda de la casa! ¿Qué João ha sido hoy?'));
      return;
    }
    // acertou alguém que aprendeu: guarda as respostas desta partida também (assim ela fica cada vez mais esperta)
    if (/^apr-/.test(p.id) && jogo) ap.ensinar({ nome: p.nome, emoji: '', nivel: nivel, historico: jogo.historico() });
    fim(t('Acertei! Era ', 'Got it! It was ', '¡He acertado! ¡Era ') + p.nome + '! 🎉', /^apr-/.test(p.id));
  });
  $('btErrou').addEventListener('click', function () {
    if (!chuteAtual || !jogo) return;
    jogo.chuteErrado(); chuteAtual = null; $('advChute').hidden = true; humor('ops'); A.Som.erro();
    if (jogo.proxima().tipo === 'perdi') { passo(); return; }   // era o último chute: nada de "deixa eu perguntar mais"
    dizer(t('Ah, não é? Então deixa eu perguntar mais um pouco…', 'Not it? Then let me ask a bit more…', '¿Ah, no es? Pues déjame preguntar un poco más…'));
    depois(passo, 1300);
  });
  var JOAO = {
    taxista: ['O taxista que achou a mala de dinheiro no carro! Clássico!', 'The taxi driver who found a bag of money in his car! A classic!', '¡El taxista que encontró una maleta llena de dinero en el coche! ¡Un clásico!'],
    wick: ['João Wick Alves! Ninguém mexe com o cachorro dele!', 'João Wick Alves! Nobody messes with his dog!', '¡João Wick Alves! ¡Que nadie se meta con su perro!'],
    grilo: ['João Grilo Alves, o mais esperto do sertão!', 'João Grilo Alves, the smartest guy in the backlands!', '¡João Grilo Alves, el más listo del sertón!'],
    connor: ['João Connor Alves salvou o futuro de novo!', 'João Connor Alves saved the future again!', '¡João Connor Alves ha vuelto a salvar el futuro!']
  };
  Array.prototype.forEach.call(document.querySelectorAll('[data-joao]'), function (b) {
    b.addEventListener('click', function () { var j = JOAO[b.getAttribute('data-joao')]; fim(t(j[0], j[1], j[2]) + ' 🚕', false); });
  });

  // ---------- perdi: ensinar ----------
  function perdi() {
    mostrarBloco('advPerdi'); humor('triste'); A.Som.perdeu();
    $('advContador').textContent = '🏆';
    var txt = t('Ploft! Você me venceu! 🏆 Me ensina quem era?', 'Ploft! You beat me! 🏆 Will you teach me who it was?', '¡Ploft! ¡Me has ganado! 🏆 ¿Me enseñas quién era?');
    $('advPerdiTxt').textContent = txt; dizer(txt);
    montarForm(false);
  }
  function montarForm(paraEnsino) {
    $('advNome').value = ''; emojiEscolhido = '🙂';
    var dl = $('advSugestoes'); dl.innerHTML = '';
    if (!paraEnsino) base.personagens.filter(function (p) { return p.niveis.indexOf(nivel) >= 0; }).concat(ap.lista()).forEach(function (p) { var o = document.createElement('option'); o.value = p.nome; dl.appendChild(o); });
    var box = $('advEmojis'); box.innerHTML = '';
    EMOJIS.forEach(function (e) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'emoji-bt'; b.textContent = e; b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(e === emojiEscolhido));
      b.addEventListener('click', function () { emojiEscolhido = e; Array.prototype.forEach.call(box.children, function (x) { x.setAttribute('aria-checked', String(x === b)); }); });
      box.appendChild(b);
    });
    $('advCriarMais').hidden = !paraEnsino;
    if (paraEnsino) pintarCriarOps();
    $('btEnsinarSalvar').textContent = paraEnsino ? t('▶ Começar', '▶ Start', '▶ Empezar') : t('🧠 Ensinar a meleca', '🧠 Teach the slime', '🧠 Enseñar al slime');
    setTimeout(function () { $('advNome').focus(); }, 50);
  }
  $('btEnsinarSalvar').addEventListener('click', function () {
    var nome = $('advNome').value.replace(/\s+/g, ' ').trim();
    if (!nome) { $('advNome').focus(); return; }
    if (ensino && ensino.fase === 'nome') {
      if (!/[0-9A-Za-zÀ-ÿ]/.test(nome)) { avisarNome(t('Escreva o nome com letras, por favor.', 'Please write the name with letters.', 'Escribe el nombre con letras, por favor.')); return; }
      ensino.nome = nome; ensino.emoji = emojiEscolhido; ensino.fase = 'perguntas'; $('advCriarMais').hidden = true; passo(); return;
    }
    if (!/[0-9A-Za-zÀ-ÿ]/.test(nome)) { avisarNome(t('Escreva o nome com letras, por favor.', 'Please write the name with letters.', 'Escribe el nombre con letras, por favor.')); return; }
    if (!jogo) return;
    var n = normal(nome), daLista = base.personagens.filter(function (p) { return normal(p.nome) === n; })[0];
    if (daLista) {
      if (ap.corrigir(daLista.id, jogo.historico()) === false) { avisarNome(CHEIO()); return; }
      fim(t('Obrigada! Da próxima vez eu acerto ', 'Thanks! Next time I\'ll get ', '¡Gracias! La próxima vez acierto con ') + daLista.nome + '. 💪', false);
    } else {
      var p = ap.ensinar({ nome: nome, emoji: emojiEscolhido, nivel: nivel, historico: jogo.historico() });
      if (!p) { avisarNome(t('Não deu para guardar: a meleca já aprendeu gente demais. Esqueça alguém em 📦 O que a meleca aprendeu.', 'Couldn\'t save it: the slime has already learned too many. Forget someone in 📦 What the slime learned.', 'No se ha podido guardar: el slime ya ha aprendido demasiada gente. Olvida a alguien en 📦 Lo que ha aprendido el slime.')); return; }
      if (p.guardado === false) { avisarNome(CHEIO()); return; }
      fim(t('Aprendi! Agora eu conheço ', 'Learned it! Now I know ', '¡Aprendido! Ahora ya conozco a ') + p.nome + '. 🧠', true);
    }
  });
  function CHEIO() { return t('Não coube no aparelho (memória cheia). Esqueça alguém em 📦 O que a meleca aprendeu.', "It didn't fit on the device (storage full). Forget someone in 📦 What the slime learned.", 'No ha cabido en el aparato (memoria llena). Olvida a alguien en 📦 Lo que ha aprendido el slime.'); }
  function avisarNome(txt) { $('advPerdiTxt').textContent = txt; A.Som.erro(); $('advNome').focus(); }
  $('btEnsinarPular').addEventListener('click', function () { fim(t('Tudo bem! Vamos de novo?', 'No problem! Shall we play again?', '¡Vale! ¿Jugamos otra vez?'), false); });

  function fim(txt, privado) {
    mostrarBloco('advFim'); $('advFimTxt').textContent = txt; dizer(txt, privado);
    $('btAdvDeNovo').focus();
  }
  $('btAdvDeNovo').addEventListener('click', function () { if (ensino) { comecarEnsino(); return; } novoJogo(); });
  $('btAdvNivel').addEventListener('click', function () { A.limparFesta(); A.mostrar('nivelAdivinha'); });

  // ---------- criar personagem (área de adulto): a meleca escolhe as perguntas ----------
  // Primeiro as do núcleo; depois só as que separam dos "parecidos" (quem ainda responde igual a tudo), até não
  // sobrar nenhum. "Já chega" guarda antes. Família (🏠) fica só no aparelho; 🌎 pode ir para o jogo de todo mundo.
  $('btEnsinar').addEventListener('click', comecarEnsino);
  function comecarEnsino() {
    ensino = { fase: 'nome', historico: [], familia: true, nivel: 'I', atual: null }; jogo = null; humorAgora = '';
    A.mostrar('adivinha'); mostrarBloco('advPerdi'); humor('parada'); $('advContador').textContent = '✏️';
    var txt = t('Quem você quer me ensinar? Pode ser alguém da família ou um personagem que eu não conheço!', 'Who do you want to teach me? It can be someone from your family or a character I don\'t know!', '¿A quién quieres enseñarme? ¡Puede ser alguien de tu familia o un personaje que no conozco!');
    $('advPerdiTxt').textContent = txt; dizer(txt); montarForm(true);
  }
  function pintarCriarOps() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-familia]'), function (b) { b.setAttribute('aria-checked', String((b.getAttribute('data-familia') === '1') === ensino.familia)); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-criar-nivel]'), function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-criar-nivel') === ensino.nivel)); });
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-familia]'), function (b) { b.addEventListener('click', function () { if (!ensino) return; ensino.familia = b.getAttribute('data-familia') === '1'; pintarCriarOps(); }); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-criar-nivel]'), function (b) { b.addEventListener('click', function () { if (!ensino) return; ensino.nivel = b.getAttribute('data-criar-nivel'); pintarCriarOps(); }); });
  // todo mundo que a meleca conhece (menos ele mesmo, se já foi ensinado antes)
  function conhecidos(nome) { var n = normal(nome); return baseCorrigida().personagens.concat(ap.lista()).filter(function (p) { return normal(p.nome) !== n; }); }
  function passoEnsino() {
    if (ensino.fase !== 'perguntas') return;
    var resp = {}; ensino.historico.forEach(function (x) { resp[x.id] = x.r; });
    var x = AP.proximaParaCriar({ personagens: conhecidos(ensino.nome), nivel: ensino.nivel, respostas: resp });
    if (x.fim) { terminarEnsino(); return; }
    ensino.atual = x.id; ensino.parecidos = x.parecidos.length;
    mostrarBloco('advRespostas'); humor('falando');
    $('btJaChega').hidden = !!Q.POR_ID[x.id].nucleo; $('btAdvVoltar').disabled = ensino.historico.length === 0;
    $('advContador').textContent = ensino.emoji + ' ' + ensino.nome + ' · ' + (ensino.historico.length + 1) +
      (Q.POR_ID[x.id].nucleo ? '' : ' · ' + t('parecidos: ', 'look-alikes: ', 'parecidos: ') + x.parecidos.length);
    dizer(texto(x.id), true);
  }
  function terminarEnsino() {
    var p = ap.ensinar({ nome: ensino.nome, emoji: ensino.emoji, nivel: ensino.nivel, historico: ensino.historico, todos: !ensino.familia });
    $('btJaChega').hidden = true;
    if (!p || p.guardado === false) { ensino = null; fim(CHEIO(), false); return; }
    A.Som.ganhou();
    fim(t('Pronto! Aprendi tudo sobre ', 'Done! I learned all about ', '¡Listo! Ya lo sé todo sobre ') + p.nome + '. ' +
      (p.todos ? t('🌎 Ele pode ir para o jogo de todo mundo (área de adulto). ', '🌎 They can go to everyone\'s game (grown-ups area). ', '🌎 Puede ir al juego de todo el mundo (zona de adultos). ') : '') +
      t('Agora tente me fazer adivinhar!', 'Now try to make me guess!', '¡Ahora intenta que lo adivine!'), true);
    ensino = null;
  }
  var jaChega = document.createElement('button');
  jaChega.id = 'btJaChega'; jaChega.type = 'button'; jaChega.className = 'medio-bt'; jaChega.hidden = true;
  jaChega.textContent = t('✅ Já chega, pode guardar', '✅ That\'s enough, save it', '✅ Ya basta, puedes guardar');
  jaChega.addEventListener('click', function () { if (ensino) terminarEnsino(); });
  $('advRespostas').appendChild(jaChega);

  // ---------- o que a meleca aprendeu ----------
  $('btAprendidos').addEventListener('click', function () { pintarAprendidos(); A.mostrar('aprendidos'); });
  function pintarAprendidos() {
    var ul = $('listaAprendidos'); ul.innerHTML = '';
    var l = ap.lista();
    if (!l.length) { var v = document.createElement('li'); v.className = 'vazio'; v.textContent = t('Ainda ninguém. Quando eu perder, me ensine quem era!', 'Nobody yet. When I lose, teach me who it was!', 'Todavía nadie. Cuando pierda, ¡enséñame quién era!'); ul.appendChild(v); }
    l.forEach(function (p) {
      var li = document.createElement('li');
      var nome = document.createElement('span'); nome.className = 'apr-nome'; nome.textContent = p.emoji + ' ' + p.nome;
      var niv = document.createElement('span'); niv.className = 'apr-nivel'; niv.textContent = p.niveis === 'IFA' ? t('todos os níveis', 'all levels', 'todos los niveles') : p.niveis === 'FA' ? t('Família e Adulto', 'Family and Grown-ups', 'Familia y Adultos') : t('só Adulto', 'Grown-ups only', 'solo Adultos');
      var b = document.createElement('button'); b.type = 'button'; b.className = 'mini'; b.textContent = '🗑️'; b.setAttribute('aria-label', t('Esquecer ', 'Forget ', 'Olvidar a ') + p.nome);
      b.addEventListener('click', function () {
        if (b.getAttribute('data-certeza') !== '1') { b.setAttribute('data-certeza', '1'); b.textContent = t('Esquecer?', 'Forget?', '¿Olvidar?'); return; }
        ap.esquecer(p.id); pintarAprendidos();
      });
      var f = document.createElement('button'); f.type = 'button'; f.className = 'mini apr-quem';
      f.textContent = p.todos ? '🌎' : '🏠';
      f.setAttribute('aria-label', p.todos ? t('Não é da família (pode ir para todos). Tocar: é da família', 'Not family (can go to everyone). Tap: family', 'No es de la familia (puede ir a todos). Tocar: es de la familia') : t('É da família (fica só aqui). Tocar: não é da família', 'Family (stays here). Tap: not family', 'Es de la familia (se queda aquí). Tocar: no es de la familia'));
      f.title = f.getAttribute('aria-label');
      f.addEventListener('click', function () { ap.marcarTodos(p.id, !p.todos); pintarAprendidos(); });
      li.appendChild(nome); li.appendChild(niv); li.appendChild(f); li.appendChild(b); ul.appendChild(li);
    });
  }
  $('btExportar').addEventListener('click', function () {
    var txt = ap.exportar(), nome = 'quem-e-aprendidos.json';
    try {
      var arq = new File([txt], nome, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [arq] })) {
        navigator.share({ files: [arq], title: t('Quem é?', 'Who Is It?', '¿Quién es?') }).then(function () { $('aprendidosStatus').textContent = t('Enviado. No outro celular, abra em 📥 Importar.', 'Sent. On the other phone, open it with 📥 Import.', 'Enviado. En el otro móvil, ábrelo en 📥 Importar.'); }).catch(function () {});
        return;
      }
    } catch (e) { /* sem compartilhar: baixa */ }
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.download = nome;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    $('aprendidosStatus').textContent = t('Arquivo pronto. Abra no outro celular em 📥 Importar.', 'File ready. Open it on the other phone with 📥 Import.', 'Archivo listo. Ábrelo en el otro móvil en 📥 Importar.');
  });
  $('arqImportar').addEventListener('change', function () {
    var f = this.files && this.files[0]; if (!f) return;
    if (f.size > 2e6) { $('aprendidosStatus').textContent = t('Esse arquivo é grande demais.', 'That file is too big.', 'Ese archivo es demasiado grande.'); return; }
    var leitor = new FileReader();
    leitor.onload = function () {
      try {
        var r = ap.importar(String(leitor.result));
        $('aprendidosStatus').textContent = r.guardado === false ? CHEIO() : t('Pronto: ', 'Done: ', 'Listo: ') + r.novos + t(' novos, ', ' new, ', ' nuevos, ') + r.juntados + t(' juntados e ', ' merged and ', ' juntados y ') + r.correcoes + t(' correções.', ' corrections.', ' correcciones.');
      }
      catch (e) { $('aprendidosStatus').textContent = t('Esse arquivo não é do Quem é?. Use o que saiu em 📤 Exportar.', "That file isn't from Who Is It?. Use the one from 📤 Export.", 'Ese archivo no es de ¿Quién es?. Usa el que ha salido en 📤 Exportar.'); }
      pintarAprendidos(); $('arqImportar').value = '';
    };
    leitor.readAsText(f);
  });

  // ---------- área de adulto: segurar ⚙️ por 3 segundos e acertar uma conta escrita por extenso ----------
  // Não guarda senha nenhuma: é só para criança pequena não entrar sem querer (padrão de app infantil).
  var segurar = null, SEGURAR = A.TESTE ? 300 : 3000;
  function soltar() { clearTimeout(segurar); segurar = null; $('btAreaAdulto').classList.remove('segurando'); }
  function apertar(e) {
    if (e && e.type === 'keydown' && (e.repeat || (e.key !== 'Enter' && e.key !== ' '))) return;
    if (e && e.preventDefault && e.type !== 'pointerdown') e.preventDefault();
    soltar(); $('btAreaAdulto').classList.add('segurando');
    segurar = setTimeout(function () { soltar(); perguntarConta(); }, SEGURAR);
  }
  $('btAreaAdulto').addEventListener('pointerdown', apertar);
  $('btAreaAdulto').addEventListener('keydown', apertar);
  ['pointerup', 'pointerleave', 'pointercancel', 'keyup', 'blur'].forEach(function (ev) { $('btAreaAdulto').addEventListener(ev, function () { if (segurar) { soltar(); $('adultoDica').hidden = false; } }); });
  $('btAreaAdulto').addEventListener('contextmenu', function (e) { e.preventDefault(); });
  var NUM = {
    pt: ['', '', '', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'],
    en: ['', '', '', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
    es: ['', '', '', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve']
  };
  var contaCerta = null;
  function perguntarConta() {
    if (!window.SolverJanela) return;
    var a = 11 + Math.floor(Math.random() * 9), b = 3 + Math.floor(Math.random() * 7);
    if (A.TESTE) { a = 12; b = 7; }
    contaCerta = a * b;
    var L = window.BolinhoIdioma && BolinhoIdioma.atual ? BolinhoIdioma.atual() : 'pt'; if (!NUM[L]) L = 'pt';
    var caixa = document.createElement('div'); caixa.className = 'qe-aviso';
    var h = document.createElement('h2'); h.textContent = t('⚙️ Área de adulto', '⚙️ Grown-ups area', '⚙️ Zona de adultos');
    var p = document.createElement('p'); p.textContent = t('Quanto é ', 'What is ', '¿Cuánto es ') + NUM[L][a] + t(' vezes ', ' times ', ' por ') + NUM[L][b] + '?';
    var campo = document.createElement('input'); campo.id = 'contaAdulto'; campo.type = 'text'; campo.inputMode = 'numeric'; campo.autocomplete = 'off'; campo.className = 'campo'; campo.setAttribute('aria-label', p.textContent);
    var ok = document.createElement('button'); ok.type = 'button'; ok.className = 'grande'; ok.textContent = t('Entrar', 'Enter', 'Entrar');
    var nao = document.createElement('button'); nao.type = 'button'; nao.className = 'medio-bt'; nao.textContent = t('Cancelar', 'Cancel', 'Cancelar');
    var st = document.createElement('p'); st.className = 'status'; st.setAttribute('aria-live', 'polite');
    [h, p, campo, ok, nao, st].forEach(function (x) { caixa.appendChild(x); });
    var j = window.SolverJanela.abrir({ conteudo: caixa, classe: 'qe-janela' });
    function conferir() {
      if (parseInt(campo.value.replace(/\D/g, ''), 10) === contaCerta) { j.fechar('ok'); window.SolverJanela.quandoQuieto(function () { $('adultoStatus').textContent = ''; A.mostrar('adulto'); }); return; }
      st.textContent = t('Hmm, não é. Essa área é para os adultos da casa. 🙂', "Hmm, that's not it. This area is for the grown-ups at home. 🙂", 'Mmm, no es. Esta zona es para los adultos de la casa. 🙂');
      campo.value = ''; campo.focus();
    }
    ok.addEventListener('click', conferir);
    campo.addEventListener('keydown', function (e) { if (e.key === 'Enter') conferir(); });
    nao.addEventListener('click', function () { j.fechar('cancelar'); });
    setTimeout(function () { campo.focus(); }, 50);
  }
  // 🌎 o arquivo com quem não é da família, para o responsável pelo Bolinho de Chuva pôr na lista de todo mundo
  $('btParaTodos').addEventListener('click', function () {
    var txt = ap.exportarParaTodos();
    if (!txt) { $('adultoStatus').textContent = t('Ainda não há ninguém para todo mundo. Crie um personagem e marque 🌎 Não é da família (ou toque em 🏠 na lista do que a meleca aprendeu).', "Nobody for everyone yet. Create a character and choose 🌎 Not family (or tap 🏠 in the list of what the slime learned).", 'Todavía no hay nadie para todo el mundo. Crea un personaje y marca 🌎 No es de la familia (o toca 🏠 en la lista de lo que ha aprendido el slime).'); return; }
    var d = new Date(), nome = 'quem-e-para-todos-' + d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + '.json';
    var pronto = t('📤 Arquivo pronto. Para entrar no jogo de todo mundo, mande este arquivo para o responsável pelo Bolinho de Chuva.', "📤 File ready. To get into everyone's game, send this file to whoever looks after Rainy Day Donuts.", '📤 Archivo listo. Para que entre en el juego de todo el mundo, manda este archivo al responsable de Buñuelos de Lluvia.');
    entregarArquivo(txt, nome, function () { $('adultoStatus').textContent = pronto; });
  });
  function entregarArquivo(txt, nome, aoTerminar) {
    try {
      var arq = new File([txt], nome, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [arq] })) {
        navigator.share({ files: [arq], title: t('Quem é?', 'Who Is It?', '¿Quién es?') }).then(aoTerminar).catch(function () {});
        return;
      }
    } catch (e) { /* sem compartilhar: baixa */ }
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.download = nome;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    aoTerminar();
  }

  // ---------- voz animada (ElevenLabs, opcional) ----------
  $('btVozAnimada').addEventListener('click', abrirVoz);
  function abrirVoz() {
    if (!window.SolverJanela) return;
    var C = window.SolverCofre, caixa = document.createElement('div'); caixa.className = 'voz-caixa';
    function linha(tag, txt, classe) { var e = document.createElement(tag); if (classe) e.className = classe; e.textContent = txt; caixa.appendChild(e); return e; }
    linha('h2', t('🎙️ Voz animada da meleca', '🎙️ Lively slime voice', '🎙️ Voz animada del slime'));
    linha('p', t('É opcional. Sem ela, a meleca fala com a voz do celular, de graça e sem internet. Com ela, a voz fica mais animada (ElevenLabs). Cada fala fica guardada no aparelho e depois toca sem gastar nada.', 'Optional. Without it, the slime talks with the phone voice, free and offline. With it, the voice is livelier (ElevenLabs). Each line is saved on the device and replays for free.', 'Es opcional. Sin ella, el slime habla con la voz del móvil, gratis y sin internet. Con ella, la voz es más animada (ElevenLabs). Cada frase se guarda en el aparato y luego suena sin gastar nada.'));
    var rot = document.createElement('label'); rot.className = 'voz-liga';
    var cx = document.createElement('input'); cx.type = 'checkbox'; cx.checked = !!A.pref.eleven;
    rot.appendChild(cx); rot.appendChild(document.createTextNode(' ' + t('Usar a voz animada', 'Use the lively voice', 'Usar la voz animada'))); caixa.appendChild(rot);
    var st = linha('p', '', 'status');
    function pintarSt() { st.textContent = C && C.tem('ia:elevenlabs') ? t('✓ Chave guardada no cofre deste aparelho.', '✓ Key saved in this device\'s vault.', '✓ Clave guardada en la caja fuerte de este aparato.') : t('Ainda sem chave. Siga os passos abaixo.', 'No key yet. Follow the steps below.', 'Todavía no hay clave. Sigue los pasos de abajo.'); }
    pintarSt();
    var ol = document.createElement('ol'); ol.className = 'passos';
    [t('Abra o site da ElevenLabs e crie uma conta grátis.', 'Open the ElevenLabs site and create a free account.', 'Abre la web de ElevenLabs y crea una cuenta gratis.'),
      t('No seu perfil, toque em "API Keys" e depois em "Create API Key". Copie a chave.', 'In your profile, tap "API Keys" and then "Create API Key". Copy the key.', 'En tu perfil, toca "API Keys" y luego "Create API Key". Copia la clave.'),
      t('Volte aqui, cole a chave e toque em "Guardar a chave". O cofre pede um PIN para proteger.', 'Come back, paste the key and tap "Save the key". The vault asks for a PIN to protect it.', 'Vuelve aquí, pega la clave y toca "Guardar la clave". La caja fuerte te pide un PIN para protegerla.')]
      .forEach(function (x) { var li = document.createElement('li'); li.textContent = x; ol.appendChild(li); });
    caixa.appendChild(ol);
    var site = document.createElement('a'); site.href = 'https://elevenlabs.io/'; site.target = '_blank'; site.rel = 'noopener'; site.className = 'medio-bt'; site.textContent = t('Abrir o site ↗', 'Open the site ↗', 'Abrir la web ↗'); caixa.appendChild(site);
    var campo = document.createElement('input'); campo.type = 'password'; campo.autocomplete = 'off'; campo.className = 'campo'; campo.placeholder = t('Cole a chave aqui', 'Paste the key here', 'Pega la clave aquí'); campo.setAttribute('aria-label', t('Chave da ElevenLabs', 'ElevenLabs key', 'Clave de ElevenLabs')); caixa.appendChild(campo);
    var bts = document.createElement('div'); bts.className = 'linha'; caixa.appendChild(bts);
    function bt(txt, fn, classe) { var b = document.createElement('button'); b.type = 'button'; b.className = classe || 'medio-bt'; b.textContent = txt; b.addEventListener('click', fn); bts.appendChild(b); return b; }
    bt(t('Guardar a chave', 'Save the key', 'Guardar la clave'), function () {
      var v = campo.value.trim(); if (!v || !C) { campo.focus(); return; }
      C.gravar('ia:elevenlabs', v).then(function () { campo.value = ''; pintarSt(); cx.checked = true; mudar(); }).catch(function () { st.textContent = t('O cofre ficou trancado. A chave não foi guardada.', 'The vault stayed locked. The key was not saved.', 'La caja fuerte se ha quedado cerrada. La clave no se ha guardado.'); });
    }, 'grande');
    // o PIN do cofre só é pedido aqui (no jogo, cofre trancado = voz do aparelho)
    function abrirCofre() { return C && C.tem('ia:elevenlabs') ? C.ler('ia:elevenlabs').catch(function () { return ''; }) : Promise.resolve(''); }
    bt(t('🔊 Testar', '🔊 Test', '🔊 Probar'), function () { abrirCofre().then(function () { A.falar(A.pref.meleca === 'blue' ? t('Oi! Eu sou o Melekento Blue!', "Hi! I'm Melekento Blue!", '¡Hola! ¡Soy Melekento Blue!') : t('Oi! Eu sou a Pink Honey!', "Hi! I'm Pink Honey!", '¡Hola! ¡Soy Pink Honey!')); }); });
    if (C && C.tem('ia:elevenlabs')) bt(t('Apagar a chave', 'Delete the key', 'Borrar la clave'), function () { C.apagar('ia:elevenlabs').then(function () { pintarSt(); cx.checked = false; mudar(); }).catch(function () {}); });
    var fechar = bt(t('Fechar', 'Close', 'Cerrar'), function () { j.fechar('ok'); });
    function mudar() { A.pref.eleven = cx.checked; A.salvarPref(); if (A.voz) A.voz.usarEleven(cx.checked); }
    cx.addEventListener('change', function () { mudar(); if (cx.checked) abrirCofre(); });
    linha('p', t('A chave é uma senha: nunca mande no chat ou por e-mail. Fica só no cofre deste aparelho.', 'The key is a password: never send it in a chat or email. It stays only in this device\'s vault.', 'La clave es una contraseña: nunca la mandes por chat ni por correo. Se queda solo en la caja fuerte de este aparato.'), 'dica');
    var j = window.SolverJanela.abrir({ conteudo: caixa, classe: 'qe-janela', temTexto: function () { return !!campo.value; } });
    void fechar;
  }

  window.QEAdivinhaTela = { parar: parar, jogando: function () { return !!(jogo || ensino); } };
  // usado pelos testes
  window.QEDebugAdv = {
    jogo: function () { return jogo; }, base: base, aprender: ap, chute: function () { return chuteAtual; },
    ensino: function () { return ensino ? { fase: ensino.fase, atual: ensino.atual, n: ensino.historico.length, parecidos: ensino.parecidos } : null; },
    respostaDe: function (id, pergunta) { var p = base.personagens.filter(function (x) { return x.id === id; })[0]; var v = p && p.r[pergunta]; return v === undefined ? Q.POR_ID[pergunta].padrao : v; }
  };
})();
