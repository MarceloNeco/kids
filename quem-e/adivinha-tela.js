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
  var nivel = 'I', jogo = null, chuteAtual = null, ensino = null, emojiEscolhido = '🙂';
  var ENSINO = ['pessoa', 'bicho', 'real', 'masculino', 'feminino', 'crianca', 'idoso', 'brasileiro', 'fala', 'desenho', 'filme', 'canta', 'esporte',
    'heroi', 'engracado', 'magia', 'grande', 'pequeno', 'cor-azul', 'cor-vermelho', 'cor-verde', 'cor-amarelo', 'cor-rosa', 'cor-preto', 'cor-branco', 'cor-marrom',
    'oculos', 'loiro', 'cabelo-comprido', 'barba', 'chapeu', 'estimacao', 'escola'];

  function normal(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); }
  function texto(id) { var p = Q.POR_ID[id]; return t(p.pt, p.en); }
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
    dizer(t('Pensou em alguém? Então vamos lá!', 'Got someone in mind? Here we go!'));
    setTimeout(passo, A.TESTE ? 0 : 900);
  }
  function sorteio(s) { s = s >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function passo() {
    if (ensino) { passoEnsino(); return; }
    var a = jogo.proxima(), n = jogo.estado().perguntas;
    if (a.tipo === 'pergunta') {
      mostrarBloco('advRespostas'); humor('falando');
      $('advContador').textContent = t('Pergunta ', 'Question ') + (n + 1);
      $('btAdvVoltar').disabled = n === 0;
      dizer(texto(a.id));
    } else if (a.tipo === 'chute') {
      chuteAtual = a.personagem; mostrarBloco('advChute'); humor('feliz'); A.Som.gosma();
      $('advChuteEmoji').textContent = a.personagem.emoji; $('advChuteNome').textContent = a.personagem.nome;
      $('advContador').textContent = t('Hmm… já sei!', 'Hmm… I know!');
      A.falar(t('Você pensou em ', 'You thought of ') + a.personagem.nome + '?', /^apr-/.test(a.personagem.id));
      $('advPergunta').textContent = t('Já sei! 🤩', 'I know! 🤩');
      $('btAcertou').focus();
    } else perdi();
  }

  Array.prototype.forEach.call(document.querySelectorAll('#advRespostas .resp'), function (b) {
    b.addEventListener('click', function () {
      var r = b.getAttribute('data-r');
      if (ensino) { ensino.historico.push({ id: ENSINO[ensino.i], r: r }); ensino.i++; passo(); return; }
      if (!jogo || !jogo.responder(r)) return;
      humor('pensando'); setTimeout(passo, A.TESTE ? 0 : 350);
    });
  });
  $('btAdvVoltar').addEventListener('click', function () {
    if (ensino) { if (ensino.i > 0) { ensino.i--; ensino.historico.pop(); } passo(); return; }
    if (jogo && jogo.desfazer()) passo();
  });

  // ---------- o chute ----------
  $('btAcertou').addEventListener('click', function () {
    var p = chuteAtual; chuteAtual = null; A.Som.ganhou(); A.festa(); humor('feliz');
    if (p.id === 'joao-alves') {
      mostrarBloco('advJoao'); $('advContador').textContent = '🚕🚕🚕';
      dizer(t('É O JOÃO ALVES! A lenda da casa! Qual João foi hoje?', "IT'S JOÃO ALVES! The family legend! Which João was it today?"));
      return;
    }
    fim(t('Acertei! Era ', 'Got it! It was ') + p.nome + '! 🎉', /^apr-/.test(p.id));
  });
  $('btErrou').addEventListener('click', function () {
    jogo.chuteErrado(); chuteAtual = null; humor('ops'); A.Som.erro();
    dizer(t('Ah, não é? Então deixa eu perguntar mais um pouco…', 'Not it? Then let me ask a bit more…'));
    setTimeout(passo, A.TESTE ? 0 : 1300);
  });
  var JOAO = {
    taxista: ['O taxista que achou a mala de dinheiro no carro! Clássico!', 'The taxi driver who found a bag of money in his car! A classic!'],
    wick: ['João Wick Alves! Ninguém mexe com o cachorro dele!', 'João Wick Alves! Nobody messes with his dog!'],
    grilo: ['João Grilo Alves, o mais esperto do sertão!', 'João Grilo Alves, the smartest guy in the backlands!'],
    connor: ['João Connor Alves salvou o futuro de novo!', 'João Connor Alves saved the future again!']
  };
  Array.prototype.forEach.call(document.querySelectorAll('[data-joao]'), function (b) {
    b.addEventListener('click', function () { var j = JOAO[b.getAttribute('data-joao')]; fim(t(j[0], j[1]) + ' 🚕', false); });
  });

  // ---------- perdi: ensinar ----------
  function perdi() {
    mostrarBloco('advPerdi'); humor('triste'); A.Som.perdeu();
    $('advContador').textContent = '🏆';
    var txt = t('Você me venceu! 🏆 Me ensina quem era?', 'You beat me! 🏆 Will you teach me who it was?');
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
    $('btEnsinarSalvar').textContent = paraEnsino ? t('▶ Começar', '▶ Start') : t('🧠 Ensinar a meleca', '🧠 Teach the slime');
    setTimeout(function () { $('advNome').focus(); }, 50);
  }
  $('btEnsinarSalvar').addEventListener('click', function () {
    var nome = $('advNome').value.replace(/\s+/g, ' ').trim();
    if (!nome) { $('advNome').focus(); return; }
    if (ensino && ensino.fase === 'nome') { ensino.nome = nome; ensino.emoji = emojiEscolhido; ensino.fase = 'perguntas'; passo(); return; }
    var n = normal(nome), daLista = base.personagens.filter(function (p) { return normal(p.nome) === n; })[0];
    if (daLista) {
      ap.corrigir(daLista.id, jogo.historico());
      fim(t('Obrigada! Da próxima vez eu acerto ', 'Thanks! Next time I will get ') + daLista.nome + '. 💪', false);
    } else {
      var p = ap.ensinar({ nome: nome, emoji: emojiEscolhido, nivel: nivel, historico: jogo.historico() });
      fim(t('Aprendi! Agora eu conheço ', 'Learned it! Now I know ') + p.nome + '. 🧠', true);
    }
  });
  $('btEnsinarPular').addEventListener('click', function () { fim(t('Tudo bem! Vamos de novo?', 'No problem! Shall we play again?'), false); });

  function fim(txt, privado) {
    mostrarBloco('advFim'); $('advFimTxt').textContent = txt; dizer(txt, privado);
    $('btAdvDeNovo').focus();
  }
  $('btAdvDeNovo').addEventListener('click', function () { if (ensino) { comecarEnsino(); return; } novoJogo(); });
  $('btAdvNivel').addEventListener('click', function () { A.limparFesta(); A.mostrar('nivelAdivinha'); });

  // ---------- ensinar alguém do zero (o pai cadastra a família) ----------
  $('btEnsinar').addEventListener('click', comecarEnsino);
  function comecarEnsino() {
    ensino = { fase: 'nome', i: 0, historico: [] }; jogo = null; humorAgora = '';
    A.mostrar('adivinha'); mostrarBloco('advPerdi'); humor('parada'); $('advContador').textContent = '✏️';
    var txt = t('Quem você quer me ensinar? Pode ser alguém da família!', 'Who do you want to teach me? It can be someone from your family!');
    $('advPerdiTxt').textContent = txt; dizer(txt); montarForm(true);
  }
  function passoEnsino() {
    if (ensino.fase !== 'perguntas') return;
    if (ensino.i >= ENSINO.length) { terminarEnsino(); return; }
    mostrarBloco('advRespostas'); humor('falando');
    $('btJaChega').hidden = ensino.i < 6; $('btAdvVoltar').disabled = ensino.i === 0;
    $('advContador').textContent = ensino.emoji + ' ' + ensino.nome + ' · ' + (ensino.i + 1) + '/' + ENSINO.length;
    dizer(texto(ENSINO[ensino.i]));
  }
  function terminarEnsino() {
    var p = ap.ensinar({ nome: ensino.nome, emoji: ensino.emoji, nivel: 'I', historico: ensino.historico });
    $('btJaChega').hidden = true; A.Som.ganhou();
    fim(t('Pronto! Aprendi tudo sobre ', 'Done! I learned all about ') + p.nome + t('. Agora tente me fazer adivinhar!', '. Now try to make me guess!'), true);
    ensino = null;
  }
  var jaChega = document.createElement('button');
  jaChega.id = 'btJaChega'; jaChega.type = 'button'; jaChega.className = 'medio-bt'; jaChega.hidden = true;
  jaChega.textContent = t('✅ Já chega, pode guardar', '✅ That is enough, save it');
  jaChega.addEventListener('click', function () { if (ensino) terminarEnsino(); });
  $('advRespostas').appendChild(jaChega);

  // ---------- o que a meleca aprendeu ----------
  $('btAprendidos').addEventListener('click', function () { pintarAprendidos(); A.mostrar('aprendidos'); });
  function pintarAprendidos() {
    var ul = $('listaAprendidos'); ul.innerHTML = '';
    var l = ap.lista();
    if (!l.length) { var v = document.createElement('li'); v.className = 'vazio'; v.textContent = t('Ainda ninguém. Quando eu perder, me ensine quem era!', 'Nobody yet. When I lose, teach me who it was!'); ul.appendChild(v); }
    l.forEach(function (p) {
      var li = document.createElement('li');
      var nome = document.createElement('span'); nome.className = 'apr-nome'; nome.textContent = p.emoji + ' ' + p.nome;
      var niv = document.createElement('span'); niv.className = 'apr-nivel'; niv.textContent = p.niveis === 'IFA' ? t('todos os níveis', 'all levels') : p.niveis === 'FA' ? t('Família e Adulto', 'Family and Grown-ups') : t('só Adulto', 'Grown-ups only');
      var b = document.createElement('button'); b.type = 'button'; b.className = 'mini'; b.textContent = '🗑️'; b.setAttribute('aria-label', t('Esquecer ', 'Forget ') + p.nome);
      b.addEventListener('click', function () {
        if (b.getAttribute('data-certeza') !== '1') { b.setAttribute('data-certeza', '1'); b.textContent = t('Esquecer?', 'Forget?'); return; }
        ap.esquecer(p.id); pintarAprendidos();
      });
      li.appendChild(nome); li.appendChild(niv); li.appendChild(b); ul.appendChild(li);
    });
  }
  $('btExportar').addEventListener('click', function () {
    var txt = ap.exportar(), nome = 'quem-e-aprendidos.json';
    try {
      var arq = new File([txt], nome, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [arq] })) { navigator.share({ files: [arq], title: 'Quem é?' }).catch(function () {}); return; }
    } catch (e) { /* sem compartilhar: baixa */ }
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.download = nome;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    $('aprendidosStatus').textContent = t('Arquivo pronto. Abra no outro celular em 📥 Importar.', 'File ready. Open it on the other phone with 📥 Import.');
  });
  $('arqImportar').addEventListener('change', function () {
    var f = this.files && this.files[0]; if (!f) return;
    if (f.size > 2e6) { $('aprendidosStatus').textContent = t('Esse arquivo é grande demais.', 'That file is too big.'); return; }
    var leitor = new FileReader();
    leitor.onload = function () {
      try { var r = ap.importar(String(leitor.result)); $('aprendidosStatus').textContent = t('Pronto: ', 'Done: ') + r.novos + t(' novos, ', ' new, ') + r.juntados + t(' juntados.', ' merged.'); }
      catch (e) { $('aprendidosStatus').textContent = t('Esse arquivo não é do Quem é?. Use o que saiu em 📤 Exportar.', "That file isn't from Who Is It?. Use the one from 📤 Export."); }
      pintarAprendidos(); $('arqImportar').value = '';
    };
    leitor.readAsText(f);
  });

  // ---------- voz animada (ElevenLabs, opcional) ----------
  $('btVozAnimada').addEventListener('click', abrirVoz);
  function abrirVoz() {
    if (!window.SolverJanela) return;
    var C = window.SolverCofre, caixa = document.createElement('div'); caixa.className = 'voz-caixa';
    function linha(tag, txt, classe) { var e = document.createElement(tag); if (classe) e.className = classe; e.textContent = txt; caixa.appendChild(e); return e; }
    linha('h2', t('🎙️ Voz animada da meleca', '🎙️ Lively slime voice'));
    linha('p', t('É opcional. Sem ela, a meleca fala com a voz do celular, de graça e sem internet. Com ela, a voz fica mais animada (ElevenLabs). Cada fala fica guardada no aparelho e depois toca sem gastar nada.', 'Optional. Without it, the slime talks with the phone voice, free and offline. With it, the voice is livelier (ElevenLabs). Each line is saved on the device and replays for free.'));
    var rot = document.createElement('label'); rot.className = 'voz-liga';
    var cx = document.createElement('input'); cx.type = 'checkbox'; cx.checked = !!A.pref.eleven;
    rot.appendChild(cx); rot.appendChild(document.createTextNode(' ' + t('Usar a voz animada', 'Use the lively voice'))); caixa.appendChild(rot);
    var st = linha('p', '', 'status');
    function pintarSt() { st.textContent = C && C.tem('ia:elevenlabs') ? t('✓ Chave guardada no cofre deste aparelho.', '✓ Key saved in this device vault.') : t('Ainda sem chave. Siga os passos abaixo.', 'No key yet. Follow the steps below.'); }
    pintarSt();
    var ol = document.createElement('ol'); ol.className = 'passos';
    [t('Abra o site da ElevenLabs e crie uma conta grátis.', 'Open the ElevenLabs site and create a free account.'),
      t('No seu perfil, toque em "API Keys" e depois em "Create API Key". Copie a chave.', 'In your profile, tap "API Keys" and then "Create API Key". Copy the key.'),
      t('Volte aqui, cole a chave e toque em "Guardar a chave". O cofre pede um PIN para proteger.', 'Come back, paste the key and tap "Save the key". The vault asks for a PIN to protect it.')]
      .forEach(function (x) { var li = document.createElement('li'); li.textContent = x; ol.appendChild(li); });
    caixa.appendChild(ol);
    var site = document.createElement('a'); site.href = 'https://elevenlabs.io/'; site.target = '_blank'; site.rel = 'noopener'; site.className = 'medio-bt'; site.textContent = t('Abrir o site ↗', 'Open the site ↗'); caixa.appendChild(site);
    var campo = document.createElement('input'); campo.type = 'password'; campo.autocomplete = 'off'; campo.className = 'campo'; campo.placeholder = t('Cole a chave aqui', 'Paste the key here'); campo.setAttribute('aria-label', t('Chave da ElevenLabs', 'ElevenLabs key')); caixa.appendChild(campo);
    var bts = document.createElement('div'); bts.className = 'linha'; caixa.appendChild(bts);
    function bt(txt, fn, classe) { var b = document.createElement('button'); b.type = 'button'; b.className = classe || 'medio-bt'; b.textContent = txt; b.addEventListener('click', fn); bts.appendChild(b); return b; }
    bt(t('Guardar a chave', 'Save the key'), function () {
      var v = campo.value.trim(); if (!v || !C) { campo.focus(); return; }
      C.gravar('ia:elevenlabs', v).then(function () { campo.value = ''; pintarSt(); cx.checked = true; mudar(); }).catch(function () { st.textContent = t('O cofre ficou trancado. A chave não foi guardada.', 'The vault stayed locked. The key was not saved.'); });
    }, 'grande');
    bt(t('🔊 Testar', '🔊 Test'), function () { A.falar(A.pref.meleca === 'blue' ? t('Oi! Eu sou o Melekento Blue!', "Hi! I'm Melekento Blue!") : t('Oi! Eu sou a Pink Honey!', "Hi! I'm Pink Honey!")); });
    if (C && C.tem('ia:elevenlabs')) bt(t('Apagar a chave', 'Delete the key'), function () { C.apagar('ia:elevenlabs').then(function () { pintarSt(); cx.checked = false; mudar(); }).catch(function () {}); });
    var fechar = bt(t('Fechar', 'Close'), function () { j.fechar('ok'); });
    function mudar() { A.pref.eleven = cx.checked; A.salvarPref(); if (A.voz) A.voz.usarEleven(cx.checked); }
    cx.addEventListener('change', mudar);
    linha('p', t('A chave é uma senha: nunca mande no chat ou por e-mail. Fica só no cofre deste aparelho.', 'The key is a password: never send it in a chat or email. It stays only in this device vault.'), 'dica');
    var j = window.SolverJanela.abrir({ conteudo: caixa, classe: 'qe-janela', temTexto: function () { return !!campo.value; } });
    void fechar;
  }

  // usado pelos testes
  window.QEDebugAdv = {
    jogo: function () { return jogo; }, base: base, aprender: ap, chute: function () { return chuteAtual; },
    respostaDe: function (id, pergunta) { var p = base.personagens.filter(function (x) { return x.id === id; })[0]; var v = p && p.r[pergunta]; return v === undefined ? Q.POR_ID[pergunta].padrao : v; }
  };
})();
