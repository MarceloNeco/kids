/* Vruuum! — telas, menu, controles (toque, teclado, controle da TV, videogame, acelerômetro do celular)
   e o laço da corrida. As regras ficam em motor.js; o desenho em desenho.js; o som em som.js. */
(function () {
  'use strict';
  var APP_VERSION = '1.21.0';
  var $ = function (id) { return document.getElementById(id); };
  /* Página e código têm de ser da mesma versão. Com internet lenta, o aparelho pode juntar a página guardada de uma
     versão com o código de outra (a garagem perdia botões e o corpo escolhido não valia). Se acontecer, recarrega
     uma vez para pegar tudo da mesma versão. */
  (function () {
    var m = document.querySelector('meta[name="versao"]'), vp = m && m.getAttribute('content');
    try {
      if (vp !== APP_VERSION && sessionStorage.getItem('vruuum.recarregou') !== APP_VERSION && navigator.onLine !== false) {
        sessionStorage.setItem('vruuum.recarregou', APP_VERSION); location.reload(); return;
      }
    } catch (e) { /* sem sessionStorage: segue */ }
  })();
  var M = window.VruuumMotor, D = window.VruuumDesenho, Som = window.VruuumSom;
  var TV = /[?&]tv=auto\b/.test(location.search);
  if (TV) document.documentElement.classList.add('tv');
  var TOQUE = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
  var NIVEIS = ['crianca', 'normal', 'turbo'];

  function ler(k, padrao) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* aparelho sem espaço ou modo privado: segue sem gravar */ } }
  var pref = ler('vruuum.pref', null) || {};
  pref.jogadores = 1;   // sempre abre com 1 jogador (2 jogadores só quando alguém escolhe, nesta vez)
  if (NIVEIS.indexOf(pref.nivel) < 0) pref.nivel = 'crianca';
  if (pref.controle !== 'maos') pref.controle = 'toque';
  if (pref.rivais !== 'sem') pref.rivais = 'com';
  var PE = window.VruuumPersonagens;
  if (!Array.isArray(pref.mundos)) pref.mundos = [];   // cenários escolhidos (vazio = surpresa)
  if (['neon', 'colorido', 'misto'].indexOf(pref.visual) < 0 || !pref.visualV2) { pref.visual = 'misto'; pref.visualV2 = true; }   // misto: alterna dia e noite (padrão desde a 1.0)
  D.definirEstilo(pref.visual);
  delete pref.lingua;   // 1.17.0: o idioma não fica mais nas preferências do jogo; vem da estante (../idioma.js)
  if (!pref.carros || pref.carros.length !== 2) pref.carros = [{ cor: 0, piloto: 0 }, { cor: 2, piloto: 1 }];
  var VE = window.VruuumVeiculos, SE = window.VruuumSelfie;
  // a selfie do jogador k, se ele escolheu usar a foto (fica só neste aparelho: selfie.js)
  function fotoDe(k) { return k >= 0 && pref.carros[k] && pref.carros[k].foto && SE ? SE.carregar(k) : null; }
  pref.carros.forEach(function (c, k) { if (!VE.achar(c.veic)) c.veic = k ? 'gt' : 'classico'; if (c.corpo !== 'menino') c.corpo = 'menina'; });
  function salvar() { gravar('vruuum.pref', pref); }

  // ---------- idioma: escolhido na estante (🇧🇷 PT · 🇺🇸 EN · 🇪🇸 ES, ../idioma.js); o jogo não tem botão próprio ----------
  var lingua = window.BolinhoIdioma ? BolinhoIdioma.atual() : 'pt';
  function t(pt, en, es) { return lingua === 'en' ? en : lingua === 'es' && es != null ? es : pt; }
  function tn(nome) { return t(nome[0], nome[1], nome[2]); }   // nomes em lista [pt, en, es] (veículos, personagens, mundos)
  function traduzir() {
    var i = lingua === 'en' ? 1 : lingua === 'es' ? 2 : 0;
    document.documentElement.lang = lingua === 'en' ? 'en' : lingua === 'es' ? 'es' : 'pt-BR';
    Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (el) { var p = el.getAttribute('data-t').split('|'); el.textContent = p[i] != null ? p[i] : p[0]; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-aria]'), function (el) { var p = el.getAttribute('data-aria').split('|'); el.setAttribute('aria-label', p[i] != null ? p[i] : p[0]); });
  }

  function tela(id) {
    Array.prototype.forEach.call(document.querySelectorAll('.tela'), function (s) { s.classList.toggle('ativa', s.id === id); });
    estadoTela = id;
    // a corrida de demonstração fica atrás da apresentação e do menu (1.14.0); na corrida e no fim, some
    var comDemo = id === 'entrada' || id === 'menu';
    document.body.classList.toggle('com-demo', comDemo); document.body.classList.toggle('demo-menu', id === 'menu');
    if (comDemo && !demo) try { iniciarDemo(); } catch (e) { demo = null; }
  }
  var estadoTela = 'entrada';

  if (window.SolverRecursos && !SolverRecursos.ligado('vruuum', true)) { tela('desligado'); traduzir(); return; }

  // ---------- entrada: apresentação ----------
  /* Atrás do logo roda uma corrida de demonstração (como no fliperama): dois pilotos sorteados correndo sozinhos,
     com cortes de câmera a cada 5 s (um, o outro, e às vezes direto para um looping). O primeiro toque na tela já
     liga a música; o botão entra no menu. */
  var demo = null;
  function iniciarDemo() {
    var cv = $('demo'); if (!cv || demo || !PE || !M.novaCorrida) return;
    var noChao = VE.LISTA.filter(function (v) { return !VE.voa(v.id); }).map(function (v) { return v.id; });
    function sorteia(l) { return l[Math.floor(Math.random() * l.length)]; }
    var ps = PE.sortear(7, []), configs = ps.slice(2).map(function (p) { var v = VE.achar(sorteia(noChao)); return { id: p.id, veic: v.id, cor: p.cor, mod: { vel: v.vel, curva: v.curva } }; });
    var jd = ps.slice(0, 2).map(function (p, k) { return { cor: p.cor || D.CORES[k], piloto: D.PILOTOS[k], veic: sorteia(noChao), foto: null, personagem: p.id, corpo: PE.corpoDe(p.id) || 'menino' }; });
    var e = M.novaCorrida('normal', (Date.now() % 100000) | 0, 2, configs);
    e.jogadores.forEach(function (j, k) { var v = VE.achar(jd[k].veic); j.mod = { vel: v.vel, curva: v.curva }; j.x = k ? 0.66 : -0.66; });
    D.preparar(e, jd, lingua, pref.visual);
    demo = { e: e, jogs: jd, cena: 0, tCena: 0, ultimo: performance.now(), faixas: [-0.66, 0.66], pensa: 0 };
    requestAnimationFrame(passoDemo);
  }
  function pilotoDemo(e, j, k) {   // fica na faixa, foge de cone e lama, e às vezes troca de faixa (para ter curva e derrapagem)
    var i = Math.floor(j.z / window.VruuumPista.SEG), alvo = demo.faixas[k];
    var segs = e.pista.segs, ruim = function (fx) { for (var q = i + 2; q < i + 14 && q < segs.length; q++) for (var w = 0; w < segs[q].coisas.length; w++) { var co = segs[q].coisas[w]; if ((co.tipo === 'cone' || co.tipo === 'lama') && Math.abs(co.x - fx) < 0.35) return true; } return false; };
    if (ruim(alvo)) { var livres = [-0.66, 0, 0.66].filter(function (fx) { return !ruim(fx); }); if (livres.length) demo.faixas[k] = alvo = livres[0]; }
    var seg = segs[Math.min(segs.length - 1, i)];
    return { dir: Math.max(-1, Math.min(1, (alvo - j.x) * 4 + seg.curva * 0.25)), pular: Math.random() < 0.004 };
  }
  function passoDemo(agora) {
    if (!demo) return;
    if (estadoTela !== 'entrada' && estadoTela !== 'menu') { demo = null; return; }
    var cv = $('demo'), W2 = cv.clientWidth, H2 = cv.clientHeight, e = demo.e, dt = Math.min(0.05, Math.max(0, (agora - demo.ultimo) / 1000)); demo.ultimo = agora;
    if (cv.width !== W2 || cv.height !== H2) { cv.width = W2; cv.height = H2; }
    var ent = e.jogadores.map(function (j, k) { return pilotoDemo(e, j, k); });
    M.atualizar(e, ent, dt); e.eventos.forEach(function (ev) { D.evento(ev, e); }); D.passo(dt, e, ent);
    demo.tCena += dt;
    e.jogadores.forEach(function (j) { if (e.fase === 'corrida' && j.turbo <= 0 && Math.random() < dt * 0.25) j.turbo = 2.5; });   // turbo de vez em quando: linhas de velocidade e fogo
    if (demo.tCena > 5 && e.fase === 'corrida') {   // corte de câmera
      demo.tCena = 0; demo.cena++;
      var l = e.pista.loops && e.pista.loops[demo.cena % e.pista.loops.length];
      e.jogadores.forEach(function (j) { j.turbo = 2.5; });
      if (demo.cena % 3 === 2 && l) e.jogadores.forEach(function (j, k) { j.z = (l.ini - 45 - k * 6) * window.VruuumPista.SEG; j.vel = e.pista.cfg.velMax; j.x = k ? 0.3 : -0.3; });
      if (e.jogadores[0].z > e.pista.zChegada - 30000) { demo = null; iniciarDemo(); return; }
    }
    D.desenhar(cv.getContext('2d'), W2, H2, e, { toque: false, jogadores: demo.jogs, margem: {}, so: demo.cena % 2, semPlacar: true });
    requestAnimationFrame(passoDemo);
  }
  // o primeiro toque em qualquer lugar da apresentação já liga a música (o navegador só deixa tocar depois de um toque)
  $('entrada').addEventListener('pointerdown', function () { if (estadoTela === 'entrada') { Som.iniciar(); Som.musica(true); } });
  function entrar() {
    if (estadoTela !== 'entrada') return;
    Som.iniciar(); Som.tocar('whoosh'); Som.musica(true);
    $('entrada').classList.add('saindo');
    setTimeout(function () { $('entrada').classList.remove('saindo'); tela('menu'); montarMenu(); focarPrimeiro(); }, 380);
  }
  $('btEntrar').addEventListener('click', entrar);

  // ---------- menu e garagem ----------
  var montado = false, editando = 0, animPrevia = 0;
  // rotulo: texto, ou a lista [pt, en, es] (aí o traduzir() troca junto com o idioma)
  function botao(classe, rotulo, fn) { var b = document.createElement('button'); b.type = 'button'; b.className = classe; if (Array.isArray(rotulo)) { b.setAttribute('data-aria', rotulo.join('|')); rotulo = tn(rotulo); } b.setAttribute('aria-label', rotulo); b.addEventListener('click', fn); return b; }
  function montarMenu() {
    if (!montado) {
      montado = true;
      // todos os veículos à mostra, por grupo, cada um com miniatura e nome
      var caixa = $('veiculos');
      VE.GRUPOS.forEach(function (gr) {
        var g = document.createElement('div'); g.className = 'grupo-veic';
        var h3 = document.createElement('h3'); h3.setAttribute('data-t', gr.nome.join('|')); g.appendChild(h3);
        var lista = document.createElement('div'); lista.className = 'cartoes'; g.appendChild(lista);
        VE.LISTA.filter(function (v) { return v.grupo === gr.id; }).forEach(function (v) {
          var b = botao('cartao-veic' + (v.grupo === 'ar' ? ' ar' : ''), v.nome, function () { pref.carros[editando].veic = v.id; salvar(); Som.tocar('buzina', editando); marcar(); });
          b.setAttribute('data-veic', v.id);
          var cv = document.createElement('canvas'); cv.width = 192; cv.height = 128; b.appendChild(cv);
          var sp = document.createElement('span'); sp.setAttribute('data-t', v.nome.join('|')); b.appendChild(sp);
          lista.appendChild(b);
        });
        caixa.appendChild(g);
      });
      D.CORES.forEach(function (cor, k) {
        var b = botao('cor', ['Cor ' + (k + 1), 'Color ' + (k + 1), 'Color ' + (k + 1)], function () { pref.carros[editando].cor = k; salvar(); Som.tocar('clique'); marcar(); });
        b.style.background = cor; b.setAttribute('data-cor', k); $('cores').appendChild(b);
      });
      D.PILOTOS.forEach(function (emo, k) {
        var b = botao('bicho', emo, function () { pref.carros[editando].piloto = k; pref.carros[editando].foto = false; pref.carros[editando].personagem = null; salvar(); Som.tocar('buzina', editando); marcar(); });
        b.textContent = emo; b.setAttribute('data-piloto', k); $('bichos').appendChild(b);
      });
      if (SE) {
        // a própria foto (aparece depois de tirar) e o botão de tirar/trocar a selfie
        var bf = botao('bicho foto', ['Minha foto', 'My photo', 'Mi foto'], function () { pref.carros[editando].foto = true; pref.carros[editando].personagem = null; salvar(); Som.tocar('buzina', editando); marcar(); });
        bf.id = 'btFoto'; var cvf = document.createElement('canvas'); cvf.width = cvf.height = 76; bf.appendChild(cvf); $('bichos').appendChild(bf);
        var bc = botao('bicho camera', ['Tirar selfie', 'Take a selfie', 'Hacerte un selfie'], abrirSelfie); bc.textContent = '📸'; $('bichos').appendChild(bc);
      }
      if (PE) PE.LISTA.forEach(function (p) {   // personagens de domínio público como piloto
        var b = botao('bicho pers', p.nome, function () { var cc = pref.carros[editando]; cc.personagem = p.id; cc.foto = false; if (PE.corpoDe(p.id)) cc.corpo = PE.corpoDe(p.id); salvar(); Som.tocar('buzina', editando); marcar(); });
        b.setAttribute('data-personagem', p.id); b.title = tn(p.nome);
        var cv = document.createElement('canvas'); cv.width = cv.height = 80; p.frente(cv.getContext('2d'), 40, 46, 26); b.appendChild(cv);
        $('bichos').appendChild(b);
      });
      // cenários: toque para escolher (até 4, na ordem do toque); 🎲 Surpresa = o jogo sorteia
      [''].concat(window.VruuumPista.MUNDOS).forEach(function (m) {
        var tm = m && D.TEMAS[m], b = botao('opcao', m ? tm.nome : ['Surpresa', 'Surprise', 'Sorpresa'], function () {
          if (!m) pref.mundos = [];
          else if (pref.mundos.indexOf(m) >= 0) pref.mundos.splice(pref.mundos.indexOf(m), 1);
          else { pref.mundos.push(m); if (pref.mundos.length > 4) pref.mundos.shift(); }
          salvar(); Som.tocar('clique'); marcar();
        });
        b.setAttribute('data-mundo', m); b.setAttribute('data-t', m ? tm.nome.map(function (n) { return tm.emoji + ' ' + n; }).join('|') : '🎲 Surpresa|🎲 Surprise|🎲 Sorpresa');
        $('mundosEsc').appendChild(b);
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-aba]'), function (b) {
        b.addEventListener('click', function () { editando = +b.getAttribute('data-aba'); Som.tocar('clique'); marcar(); });
      });
      if ($('tirarJ2')) $('tirarJ2').addEventListener('click', function () { pref.jogadores = 1; editando = 0; salvar(); Som.tocar('clique'); marcar(); });
      Array.prototype.forEach.call(document.querySelectorAll('[data-corpo]'), function (b) {
        b.addEventListener('click', function () { pref.carros[editando].corpo = b.getAttribute('data-corpo'); salvar(); Som.tocar('clique'); marcar(); });
      });
      traduzir();
    }
    marcar();
    animarPrevia();
  }
  // a prévia fica sempre animada enquanto o menu está aberto (hélice, rotor, fogo, estrada andando)
  function animarPrevia() {
    if (animPrevia) return;
    var passo = function () {
      if (estadoTela !== 'menu') { animPrevia = 0; return; }
      var c = pref.carros[editando];
      D.previa($('previa'), D.CORES[c.cor], D.PILOTOS[c.piloto], c.veic, fotoDe(editando), c.personagem, c.corpo);
      animPrevia = requestAnimationFrame(passo);
    };
    animPrevia = requestAnimationFrame(passo);
  }
  // ---------- selfie: tirar, achar o rosto (sem internet), ajustar o círculo, recortar ----------
  var ed = { img: null, url: null, esc: 1, roda: null, arrasta: null };
  function abrirSelfie() {
    $('selfie').hidden = false; $('selfieEditor').hidden = true; $('selfieAviso').textContent = '';
    $('selfieApagar').hidden = !SE.tem(editando);
    SE.prepararDetector();   // já vai carregando o reconhecedor de rosto (só na primeira vez precisa de internet)
    try { $('selfieCamera').parentNode.querySelector('input').focus(); } catch (e) { /* ok */ }
  }
  function fecharSelfie() {
    $('selfie').hidden = true;
    if (ed.url) { URL.revokeObjectURL(ed.url); ed.url = null; }
    ed.img = null; $('selfieCamera').value = ''; $('selfieGaleria').value = '';
    marcar();
  }
  function desenharEditor() {
    var cv = $('selfieTela'), c = cv.getContext('2d'), r = ed.roda, k = ed.esc;
    if (!ed.img || !r) return;
    c.drawImage(ed.img, 0, 0, cv.width, cv.height);
    c.fillStyle = 'rgba(11,10,31,.62)'; c.beginPath(); c.rect(0, 0, cv.width, cv.height); c.arc(r.x * k, r.y * k, r.r * k, 0, Math.PI * 2, true); c.fill();
    c.strokeStyle = '#ffd166'; c.lineWidth = 3; if (c.setLineDash) c.setLineDash([10, 7]);
    c.beginPath(); c.arc(r.x * k, r.y * k, r.r * k, 0, Math.PI * 2); c.stroke(); if (c.setLineDash) c.setLineDash([]);
  }
  function abrirFoto(arquivo) {
    if (!arquivo) return;
    if (ed.url) URL.revokeObjectURL(ed.url);
    ed.url = URL.createObjectURL(arquivo);
    var img = new Image();
    img.onload = function () {
      ed.img = img;
      var cv = $('selfieTela'), deitado = window.innerWidth > window.innerHeight;
      var maxW = Math.min(window.innerWidth - 60, deitado ? 520 : 480), maxH = window.innerHeight * (deitado ? 0.62 : 0.5);
      ed.esc = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      cv.width = Math.round(img.naturalWidth * ed.esc); cv.height = Math.round(img.naturalHeight * ed.esc);
      var menor = Math.min(img.naturalWidth, img.naturalHeight);
      ed.roda = { x: img.naturalWidth / 2, y: img.naturalHeight * 0.42, r: menor * 0.3 };
      $('selfieTam').value = 30; $('selfieEditor').hidden = false;
      $('selfieAviso').textContent = t('🔎 Procurando o rosto…', '🔎 Looking for the face…', '🔎 Buscando la cara…');
      desenharEditor();
      SE.acharRosto(img).then(function (achou) {
        if (ed.img !== img) return;
        if (achou) { ed.roda = achou; $('selfieTam').value = Math.round(achou.r / menor * 100); $('selfieAviso').textContent = t('✅ Achei o rosto! Se precisar, arraste o círculo ou mude o tamanho.', '✅ Found the face! Drag the circle or change its size if needed.', '✅ ¡He encontrado la cara! Si hace falta, arrastra el círculo o cambia el tamaño.'); }
        else $('selfieAviso').textContent = t('🙂 Não achei o rosto sozinho. Arraste o círculo até ele.', "🙂 I couldn't find the face on my own. Drag the circle onto it.", '🙂 No he encontrado la cara. Arrastra el círculo hasta ella.');
        desenharEditor();
      });
    };
    img.src = ed.url;
  }
  if (SE) {
    $('selfieCamera').addEventListener('change', function (e) { abrirFoto(e.target.files && e.target.files[0]); });
    $('selfieGaleria').addEventListener('change', function (e) { abrirFoto(e.target.files && e.target.files[0]); });
    $('selfieTam').addEventListener('input', function () { if (!ed.img) return; ed.roda.r = +$('selfieTam').value / 100 * Math.min(ed.img.naturalWidth, ed.img.naturalHeight); desenharEditor(); });
    var telaSelfie = $('selfieTela');
    var ponto = function (e) { var b = telaSelfie.getBoundingClientRect(); return { x: (e.clientX - b.left) * telaSelfie.width / b.width / ed.esc, y: (e.clientY - b.top) * telaSelfie.height / b.height / ed.esc }; };
    telaSelfie.addEventListener('pointerdown', function (e) { if (!ed.img) return; e.preventDefault(); try { telaSelfie.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } var p = ponto(e); ed.arrasta = { dx: ed.roda.x - p.x, dy: ed.roda.y - p.y }; });
    telaSelfie.addEventListener('pointermove', function (e) {
      if (!ed.arrasta) return; e.preventDefault();
      var p = ponto(e), W = ed.img.naturalWidth, H = ed.img.naturalHeight;
      ed.roda.x = Math.max(0, Math.min(W, p.x + ed.arrasta.dx)); ed.roda.y = Math.max(0, Math.min(H, p.y + ed.arrasta.dy)); desenharEditor();
    });
    ['pointerup', 'pointercancel'].forEach(function (n) { telaSelfie.addEventListener(n, function () { ed.arrasta = null; }); });
    $('selfieUsar').addEventListener('click', function () {
      if (!ed.img) return;
      if (SE.salvar(editando, SE.recortar(ed.img, ed.roda))) { pref.carros[editando].foto = true; salvar(); Som.tocar('chegou'); fecharSelfie(); }
      else $('selfieAviso').textContent = t('Não deu para guardar a foto neste aparelho.', "Couldn't save the photo on this device.", 'No se ha podido guardar la foto en este aparato.');
    });
    $('selfieApagar').addEventListener('click', function () { SE.apagar(editando); pref.carros[editando].foto = false; salvar(); fecharSelfie(); });
    $('selfieFechar').addEventListener('click', fecharSelfie);
  }

  function nomePiloto(k) {
    var c = pref.carros[k], p = c.personagem && PE ? PE.achar(c.personagem) : null;
    return p ? tn(p.nome) : (c.foto && fotoDe(k) ? '📸' : D.PILOTOS[c.piloto]);
  }
  function barra(v) { return Math.max(25, Math.min(100, 30 + (v - 0.92) / 0.2 * 70)) + '%'; }
  function marcar() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-jogadores]'), function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-jogadores') === pref.jogadores)); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-nivel]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-nivel') === pref.nivel)); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-rivais]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-rivais') === pref.rivais)); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-controle]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-controle') === pref.controle)); });
    $('dicaMaos').hidden = pref.controle !== 'maos';
    Array.prototype.forEach.call(document.querySelectorAll('[data-visual]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-visual') === pref.visual)); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-mundo]'), function (b) { var m = b.getAttribute('data-mundo'); b.setAttribute('aria-pressed', String(m === '' ? !pref.mundos.length : pref.mundos.indexOf(m) >= 0)); });
    if (editando >= pref.jogadores) editando = 0;
    var c = pref.carros[editando], v = VE.achar(c.veic);
    $('abas').hidden = pref.jogadores < 2;
    Array.prototype.forEach.call(document.querySelectorAll('[data-aba]'), function (b) {
      var k = +b.getAttribute('data-aba'); b.setAttribute('aria-selected', String(k === editando));
      b.textContent = nomePiloto(k) + ' · ' + t('Jogador ', 'Player ', 'Jugador ') + (k + 1);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-veic]'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-veic') === c.veic));
      D.miniatura(b.querySelector('canvas'), D.CORES[c.cor], D.PILOTOS[c.piloto], b.getAttribute('data-veic'), fotoDe(editando), c.personagem, c.corpo);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-cor]'), function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-cor') === c.cor)); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-corpo]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-corpo') === c.corpo)); });
    $('btCorrer').textContent = pref.jogadores === 2 ? t('🏁 Correr! · 2 jogadores', '🏁 Race! · 2 players', '🏁 ¡A correr! · 2 jugadores') : t('🏁 Correr!', '🏁 Race!', '🏁 ¡A correr!');
    Array.prototype.forEach.call(document.querySelectorAll('[data-piloto]'), function (b) { b.setAttribute('aria-pressed', String(!c.foto && !c.personagem && +b.getAttribute('data-piloto') === c.piloto)); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-personagem]'), function (b) { b.setAttribute('aria-pressed', String(c.personagem === b.getAttribute('data-personagem'))); });
    var bf = $('btFoto'), fot = SE && SE.carregar(editando);
    if (bf) {
      bf.hidden = !fot; bf.setAttribute('aria-pressed', String(!!c.foto && !!fot));
      if (fot) { var desenhaFoto = function () { var x = bf.querySelector('canvas').getContext('2d'); x.clearRect(0, 0, 76, 76); x.save(); x.beginPath(); x.arc(38, 38, 37, 0, Math.PI * 2); x.clip(); x.drawImage(fot.img, 0, 0, 76, 76); x.restore(); }; if (fot.img.complete) desenhaFoto(); else fot.img.onload = function () { desenhaFoto(); marcar(); }; }
    }
    if (c.foto && !fot) c.foto = false;
    $('nomeVeic').textContent = (pref.jogadores === 2 || c.personagem ? nomePiloto(editando) + ' · ' : '') + tn(v.nome) + (VE.voa(v.id) ? t(' · voa no céu ✈️', ' · flies in the sky ✈️', ' · vuela por el cielo ✈️') : '');
    $('barraVel').style.width = barra(v.vel); $('barraCurva').style.width = barra(v.curva);
    var dica = $('dicaTecla'); dica.hidden = TOQUE || pref.jogadores < 2;
    dica.textContent = editando ? t('Teclado: setas e ⬆', 'Keyboard: arrows and ⬆', 'Teclado: flechas y ⬆') : t('Teclado: A, D e W', 'Keyboard: A, D and W', 'Teclado: A, D y W');
    $('recordeMenu').textContent = D.milhar(ler('vruuum.recordePts.' + pref.nivel, 0));
  }
  function opcao(atributo, fn) {
    Array.prototype.forEach.call(document.querySelectorAll('[' + atributo + ']'), function (b) {
      b.addEventListener('click', function () { fn(b.getAttribute(atributo)); salvar(); Som.tocar('clique'); marcar(); });
    });
  }
  opcao('data-jogadores', function (v) { pref.jogadores = +v; });
  opcao('data-nivel', function (v) { pref.nivel = v; });
  opcao('data-controle', function (v) { pref.controle = v; });
  opcao('data-rivais', function (v) { pref.rivais = v; });
  opcao('data-visual', function (v) { pref.visual = v; D.definirEstilo(v); });
  $('btSom').addEventListener('click', function () { Som.iniciar(); var lig = Som.alternar(); $('btSom').textContent = $('btSomJogo').textContent = lig ? '🔊' : '🔇'; });
  $('btAjuda').addEventListener('click', function () { var a = $('ajuda'); a.hidden = !a.hidden; $('btAjuda').setAttribute('aria-expanded', String(!a.hidden)); });
  $('btCorrer').addEventListener('click', function () { iniciarCorrida(); });

  // setas andam entre os botões visíveis (controle da TV e teclado)
  function botoesVisiveis() {
    var raiz = estadoTela === 'jogo' ? $('pausa') : $(estadoTela);
    if (!raiz) return [];
    return Array.prototype.filter.call(raiz.querySelectorAll('button, a[href]'), function (b) { return b.offsetParent !== null && !b.disabled; });
  }
  function focarPrimeiro() { var l = botoesVisiveis(), alvo = estadoTela === 'menu' ? $('btCorrer') : l[0]; if (alvo) try { alvo.focus({ preventScroll: false }); } catch (e) { alvo.focus(); } }
  function moverFoco(d) {
    var l = botoesVisiveis(); if (!l.length) return;
    var i = l.indexOf(document.activeElement), n = i < 0 ? 0 : (i + d + l.length) % l.length;
    l[n].focus(); if (l[n].scrollIntoView) l[n].scrollIntoView({ block: 'nearest' });
  }

  // ---------- corrida ----------
  var cv = $('tela'), ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1;
  var estado = null, jogs = [], rodando = false, pausado = false, ultimo = 0, trava = null;
  function redimensionar() {
    dpr = Math.min(window.devicePixelRatio || 1, TV ? 1 : 1.5);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', function () { if (rodando) redimensionar(); });

  function iniciarCorrida() {
    Som.iniciar();
    if (TOQUE && pref.jogadores === 1 && pref.controle !== 'maos') ligarMovimento();   // com as mãos na câmera, o celular fica parado (sem inclinar)
    mov.zerar(); mov.calibrar();
    jogs = pref.carros.slice(0, pref.jogadores).map(function (c) { return { cor: D.CORES[c.cor], piloto: D.PILOTOS[c.piloto], veic: c.veic, foto: fotoDe(pref.carros.indexOf(c)), personagem: c.personagem || null, corpo: c.corpo || 'menina' }; });
    // rivais: personagens sorteados (fora os escolhidos), no chão ou no céu como o jogador 1
    var configs = [];
    if (pref.rivais === 'com' && PE) {
      var voa1 = VE.voa(jogs[0].veic), opcoes = VE.LISTA.filter(function (v) { return VE.voa(v.id) === voa1; });
      // 1.13.0: ninguém repetido — nem o personagem, nem o veículo de quem joga (escolheu a galinha, não corre contra galinha)
      var livres = opcoes.filter(function (v) { return jogs.every(function (j) { return j.veic !== v.id; }); });
      for (var q = livres.length - 1; q > 0; q--) { var w = Math.floor(Math.random() * (q + 1)), tq = livres[q]; livres[q] = livres[w]; livres[w] = tq; }
      PE.sortear(pref.jogadores === 1 ? 5 : 3, jogs.map(function (j) { return j.personagem; })).forEach(function (p, k) {   // 1.11.0: mais rivais, disputa de perto
        var v = livres.length ? livres[k % livres.length] : opcoes[k % opcoes.length];
        configs.push({ id: p.id, veic: v.id, cor: p.cor || D.CORES[(k + 3) % D.CORES.length], mod: { vel: v.vel, curva: v.curva } });
      });
    }
    estado = M.novaCorrida(pref.nivel, (Date.now() % 1000000007) | 0, pref.jogadores, configs, pref.mundos);
    estado.jogadores.forEach(function (j, k) { var v = VE.achar(jogs[k].veic); j.mod = { vel: v.vel, curva: v.curva, voa: VE.voa(v.id) }; });
    D.preparar(estado, jogs, lingua, pref.visual);
    tela('jogo'); redimensionar();
    $('pausa').hidden = true; pausado = false; ponteiros = {}; pularPend = [false, false];
    lerBordas(); telaCheia(true);
    ligarMaos();
    // a música escolhida no menu continua na corrida; sem escolha, cada corrida começa uma música nova
    if (musicaEscolhida) musicaEscolhida = false; else Som.proxima();
    Som.musica(true);
    if (navigator.wakeLock && navigator.wakeLock.request) navigator.wakeLock.request('screen').then(function (l) { trava = l; }).catch(function () { /* sem trava de tela: segue normal */ });
    if (!rodando) { rodando = true; ultimo = performance.now(); requestAnimationFrame(quadro); }
  }
  // ---------- volante no ar (mãos na câmera) ----------
  var MA = window.VruuumMaos, ctrlMaos = [], maosLigadas = false;
  function ligarMaos() {
    if (pref.controle !== 'maos' || !MA) { pararMaos(); return; }
    ctrlMaos = [MA.criar(), MA.criar()];
    $('camMaos').hidden = false; $('maosAviso').textContent = t('Ligando a câmera…', 'Starting the camera…', 'Encendiendo la cámara…');
    if (maosLigadas) return;
    MA.iniciar($('videoMaos'), function (maos, agora) {
      var partes = MA.separar(maos, estado ? estado.jogadores.length : 1);
      partes.forEach(function (m, k) { if (ctrlMaos[k]) ctrlMaos[k].ler(m, agora); });
      desenharCamMaos(maos);
    }).then(function () { maosLigadas = true; $('maosAviso').textContent = ''; })
      .catch(function () { $('maosAviso').textContent = t('Sem câmera: use a tela ou o celular.', 'No camera: use the screen or the phone.', 'Sin cámara: usa la pantalla o el móvil.'); setTimeout(function () { $('camMaos').hidden = true; }, 4000); });
  }
  function pararMaos() { if (MA) MA.parar(); maosLigadas = false; $('camMaos').hidden = true; }
  // janelinha: a imagem espelhada, as mãos marcadas e o volante girando
  function desenharCamMaos(maos) {
    var cv = $('maosTela'), c = cv.getContext('2d'), v = $('videoMaos'), W = cv.width, H = cv.height;
    c.save(); c.translate(W, 0); c.scale(-1, 1); try { c.drawImage(v, 0, 0, W, H); } catch (e) { /* sem quadro ainda */ } c.restore();
    c.fillStyle = 'rgba(5,3,20,.35)'; c.fillRect(0, 0, W, H);
    if (estado && estado.jogadores.length === 2) { c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(W / 2 - 1, 0, 2, H); }
    maos.forEach(function (m) { c.fillStyle = '#c6ff3d'; c.beginPath(); c.arc(m.x * W, m.y * H, 9, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#1a1446'; c.lineWidth = 2; c.stroke(); });
    (estado ? estado.jogadores : []).forEach(function (j, k) {
      var cm = ctrlMaos[k]; if (!cm) return;
      var cx = estado.jogadores.length === 2 ? (k ? W * 0.75 : W * 0.25) : W / 2, cy = H - 26, r = 20;
      c.save(); c.translate(cx, cy); c.rotate(cm.direcao() * 0.9);
      c.strokeStyle = '#2bf4ff'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(-r, 0); c.lineTo(r, 0); c.moveTo(0, 0); c.lineTo(0, r); c.stroke(); c.restore();
      if (cm.maos() === 0) { c.fillStyle = '#fff'; c.font = '700 13px Fredoka, sans-serif'; c.textAlign = 'center'; c.fillText(t('mostre as mãos 🙌', 'show your hands 🙌', 'muestra las manos 🙌'), cx, 22); }
    });
  }

  function soltarTrava() { if (trava) { trava.release().catch(function () {}); trava = null; } }

  function quadro(agora) {
    if (!rodando) return;
    var dt = Math.min(0.05, Math.max(0, (agora - ultimo) / 1000)); ultimo = agora;
    if (!pausado) {
      var ent = lerEntradas();
      M.atualizar(estado, ent, dt);
      for (var i = 0; i < estado.eventos.length; i++) tratar(estado.eventos[i]);
      D.passo(dt, estado, ent);
      var max = estado.pista.cfg.velMax;
      Som.motor(estado.jogadores.map(function (j, k) { var v = VE.achar(jogs[k].veic); return v && v.semMotor ? null : estado.fase === 'contagem' ? 0.05 : Math.min(1.5, j.vel / max); }));   // bicho e skate não roncam
      estado.jogadores.forEach(function (j, k) {   // a galinha cacareja de vez em quando enquanto corre
        if (jogs[k].veic !== 'galinha' || estado.fase !== 'corrida') return;
        j.tCoco = (j.tCoco || 2) - dt; if (j.tCoco <= 0) { j.tCoco = 2.5 + Math.random() * 3; Som.tocar('galinha'); }
      });
      Som.chiado(estado.jogadores.map(function (j) { return j.derrapa > 0 ? Math.min(1, 0.5 + j.derrapa * 0.3) : 0; }));
    }
    D.desenhar(ctx, W, H, estado, { toque: TOQUE, jogadores: jogs, margem: bordas, botoes: $('btPausa').parentNode.offsetWidth || 0 });   // largura dos botões 🔄 🔊 ⏸ (a barra do caminho não passa por baixo)
    if (estado.fase === 'fim') { acabar(); return; }
    requestAnimationFrame(quadro);
  }

  var SONS = { estrela: 1, cone: 1, batida: 1, lama: 1, turbo: 1, pulo: 1, perdeu: 1, tum: 1, bip: 1, vai: 1, mundo: 1, chegou: 1, derrapa: 1, caixa: 1, poder: 1, escudoBate: 1, splat: 1, looping: 1, loopFeito: 1, turboRival: 1, agua: 1 };
  // o aparelho treme junto (celular e tablet que deixam; iPhone não deixa): milissegundos de vibração e de pausa
  var TREME = { batida: [90, 40, 90], cone: [50], lama: [40, 30, 40, 30, 40], turbo: [35], miniturbo: [30, 30, 60], caixa: [15], poder: [20, 40, 20], escudoBate: [60], splat: [25], looping: [40, 60, 40, 60, 40, 60, 80], loopFeito: [30, 40, 30], chegou: [100, 60, 100, 60, 200], tum: [30], pulo: [20], faisca: [15], vai: [120], agua: [40, 30, 40] };
  function tremer(p) { if (navigator.vibrate) try { navigator.vibrate(p); } catch (e) { /* sem vibrar */ } }
  function tratar(ev) {
    if (ev.tipo === 'vai') mov.fimCalibrar();   // no 3-2-1 só descobre o sinal do sensor; o meio é o reto de verdade
    var vj = ev.j != null && jogs[ev.j] ? VE.achar(jogs[ev.j].veic) : null;
    if (ev.tipo === 'vai') estado.jogadores.forEach(function (j, k) { var v = VE.achar(jogs[k].veic); if (v && v.voz) setTimeout(function () { Som.tocar(v.voz); }, 300 + k * 400); });   // cada bicho dá o seu grito na largada
    if (ev.tipo === 'pulo' && vj && vj.galinha) { Som.tocar('galo'); Som.tocar('asas'); D.evento(ev, estado); return; }
    if (ev.tipo === 'turbo' && vj && vj.id === 'dino') Som.tocar('dino');
    if (ev.tipo === 'vira') { Som.tocar(ev.dracula ? 'dracula' : 'morcego'); D.evento(ev, estado); return; }
    if (ev.tipo === 'abobora') { Som.tocar('plop'); return; }
    if (ev.tipo === 'splat' && ev.abobora) { Som.tocar('abobora'); tremer([25]); D.evento(ev, estado); return; }
    if (ev.tipo === 'estrela' && ev.ar) Som.tocar('estrelaAr');
    else if (ev.tipo === 'faisca' || ev.tipo === 'miniturbo') Som.tocar(ev.tipo, ev.nivel);
    else if (ev.tipo === 'poder' && ev.poder === 'gosma') Som.tocar('gosma');
    else if (SONS[ev.tipo]) Som.tocar(ev.tipo);
    if (TREME[ev.tipo] && (ev.j == null || ev.j === 0 || estado.jogadores.length === 1)) tremer(TREME[ev.tipo]);
    D.evento(ev, estado);
  }
  function buzinar(j) {
    if (!estado || pausado || estadoTela !== 'jogo' || j >= estado.jogadores.length) return;
    var v = VE.achar(jogs[j].veic);
    Som.tocar(v && v.voz ? v.voz : 'buzina', j); D.evento({ tipo: 'buzina', j: j }, estado);   // a buzina da galinha é o cocoricó, a do cavalo é o relincho...
  }

  function pausar() {
    if (!rodando || pausado || !estado || estado.fase === 'fim') return;
    pausado = true; $('pausa').hidden = false; Som.motor([]); Som.chiado([]); soltarTrava();
    try { $('btContinuar').focus(); } catch (e) { /* foco opcional */ }
  }
  function continuar() {
    if (!pausado) return;
    pausado = false; $('pausa').hidden = true; ultimo = performance.now(); ponteiros = {};
    if (navigator.wakeLock && navigator.wakeLock.request) navigator.wakeLock.request('screen').then(function (l) { trava = l; }).catch(function () {});
  }
  function irMenu() {
    rodando = false; pausado = false; Som.motor([]); Som.chiado([]); Som.musica(true); soltarTrava(); telaCheia(false); pararMaos();
    tela('menu'); montarMenu(); focarPrimeiro();
  }
  $('btPausa').addEventListener('click', pausar);
  // durante a corrida: som liga/desliga e virar a tela (deitado <-> em pé) sem precisar pausar
  $('btSomJogo').addEventListener('click', function () { Som.iniciar(); var lig = Som.alternar(); $('btSomJogo').textContent = $('btSom').textContent = lig ? '🔊' : '🔇'; });
  $('btGirar').hidden = !(TOQUE && screen.orientation && screen.orientation.lock);
  $('btGirar').addEventListener('click', function () {
    var o = screen.orientation, quer = o && o.type && o.type.indexOf('portrait') === 0 ? 'landscape' : 'portrait';
    Som.tocar('clique');
    try { var p = o.lock(quer); if (p && p.catch) p.catch(function () { /* este aparelho não deixa girar pelo botão */ }); } catch (e) { /* ok */ }
  });
  $('btContinuar').addEventListener('click', continuar);
  $('btRecomecar').addEventListener('click', function () { rodando = false; iniciarCorrida(); });
  $('btSair').addEventListener('click', irMenu);
  $('btMenu').addEventListener('click', irMenu);
  $('btDeNovo').addEventListener('click', function () { iniciarCorrida(); });
  // a música toca o tempo todo; só silencia quando o app fica escondido (outra aba, tela apagada)
  document.addEventListener('visibilitychange', function () { if (document.hidden) pausar(); Som.dormir(document.hidden); });

  // tela cheia no celular: a barra do navegador não tampa o jogo (deitado ou em pé)
  function telaCheia(liga) {
    if (!TOQUE) return;
    var d = document, el = d.documentElement;
    try {
      if (liga && !(d.fullscreenElement || d.webkitFullscreenElement)) {
        var p = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : (el.webkitRequestFullscreen && el.webkitRequestFullscreen());
        if (p && p.then) p.then(travarTela).catch(function () {}); else travarTela();
      } else if (liga) travarTela();
      else if (!liga) {
        destravarTela();
        if (d.fullscreenElement || d.webkitFullscreenElement) { var q = d.exitFullscreen ? d.exitFullscreen() : (d.webkitExitFullscreen && d.webkitExitFullscreen()); if (q && q.catch) q.catch(function () {}); }
      }
    } catch (e) { /* navegador sem tela cheia (iPhone): segue normal */ }
  }
  // durante a corrida a tela não gira: inclinar o celular para virar o carro não pode trocar deitado/em pé
  function travarTela() {
    try {
      var o = screen.orientation;
      if (o && o.lock && o.type) { var t2 = o.lock(o.type); if (t2 && t2.catch) t2.catch(function () {}); }
    } catch (e) { /* o navegador não deixa travar: segue normal */ }
  }
  function destravarTela() { try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) { /* ok */ } }
  // bordas seguras: recorte da câmera e cantos (principalmente com o celular deitado)
  var bordas = { t: 0, r: 0, b: 0, l: 0 };
  function lerBordas() {
    var s = getComputedStyle($('sondaBorda'));
    bordas = { t: parseFloat(s.paddingTop) || 0, r: parseFloat(s.paddingRight) || 0, b: parseFloat(s.paddingBottom) || 0, l: parseFloat(s.paddingLeft) || 0 };
  }
  window.addEventListener('resize', lerBordas);
  window.addEventListener('orientationchange', function () { setTimeout(function () { lerBordas(); if (rodando) { redimensionar(); mov.calibrar(); } }, 300); });   // girou (pelo botão 🔄): o "reto" do volante é o novo jeito de segurar

  function tempoTxt(s) { var m = Math.floor(s / 60), r = Math.floor(s % 60); return m + ':' + (r < 10 ? '0' : '') + r; }
  function acabar() {
    rodando = false; Som.motor([]); Som.chiado([]); soltarTrava(); destravarTela(); pararMaos();
    var total = 0;
    estado.pista.segs.forEach(function (s) { s.coisas.forEach(function (c) { if (c.tipo === 'estrela') total++; }); });
    var js = estado.jogadores, melhor = Math.max.apply(null, js.map(function (j) { return j.pontos || 0; }));
    var empate = js.length === 2 && js[0].pontos === js[1].pontos;
    var caixa = $('resultado'); caixa.innerHTML = '';
    js.forEach(function (j) {
      var p = total ? j.estrelas / total : 0;
      var medalha = p >= 0.4 ? t('🥇 Ouro', '🥇 Gold', '🥇 Oro') : p >= 0.2 ? t('🥈 Prata', '🥈 Silver', '🥈 Plata') : t('🥉 Bronze', '🥉 Bronze', '🥉 Bronce');
      var div = document.createElement('div'); div.className = 'cartao' + (js.length === 2 && j.pontos === melhor ? ' vencedor' : '');
      var linhas = [
        ['quem', jogs[j.n].piloto + (js.length === 2 ? ' ' + t('Jogador ', 'Player ', 'Jugador ') + (j.n + 1) : '')],
        ['estrelas', D.milhar(j.pontos || 0) + ' ' + t('pontos', 'points', 'puntos')],
        ['tempo', '⭐ ' + j.estrelas + ' · ' + t('batidas ', 'crashes ', 'choques ') + j.batidas],
        ['medalha', medalha],
        ['tempo', '⏱ ' + tempoTxt(j.tempo)]
      ];
      if (js.length === 2) linhas.push(['medalha', empate ? t('🤝 Empate!', '🤝 Tie!', '🤝 ¡Empate!') : j.pontos === melhor ? t('🏆 Mais pontos!', '🏆 Most points!', '🏆 ¡Más puntos!') : t('👏 Muito bem!', '👏 Well done!', '👏 ¡Muy bien!')]);
      linhas.forEach(function (l) { var el = document.createElement('div'); el.className = l[0]; el.textContent = l[1]; div.appendChild(el); });
      caixa.appendChild(div);
    });
    if (estado.rivais.length) {   // classificação com os rivais
      var todos = js.map(function (j) { return { nome: (jogs[j.n].personagem && PE ? tn(PE.achar(jogs[j.n].personagem).nome) : jogs[j.n].piloto) + (js.length === 2 ? ' (' + t('Jogador ', 'Player ', 'Jugador ') + (j.n + 1) + ')' : ' (' + t('você', 'you', 'tú') + ')'), fim: j.chegou ? j.tempo : Infinity, z: j.z, eu: true }; })
        .concat(estado.rivais.map(function (r) { var p = PE.achar(r.id); return { nome: tn(p.nome), fim: r.chegou ? r.tempo : Infinity, z: r.z, eu: false }; }));
      todos.sort(function (a, b) { return a.fim !== b.fim ? a.fim - b.fim : b.z - a.z; });
      var ol = document.createElement('ol'); ol.className = 'classificacao';
      todos.forEach(function (o, k) { var li = document.createElement('li'); if (o.eu) li.className = 'eu'; li.textContent = ['🥇', '🥈', '🥉'][k] || ((k + 1) + 'º'); var sp = document.createElement('span'); sp.textContent = o.nome; li.appendChild(sp); ol.appendChild(li); });
      caixa.appendChild(ol);
    }
    var chave = 'vruuum.recordePts.' + estado.pista.nivel, antes = ler(chave, 0);
    $('novoRecorde').hidden = !(melhor > antes);
    if (melhor > antes) gravar(chave, melhor);
    $('recordeFim').textContent = D.milhar(Math.max(antes, melhor));
    Som.musica(true);
    tela('fim'); traduzir(); focarPrimeiro();
    // pódio animado (estádio, torcida, fogos e os pontos subindo)
    Som.tocar('torcida');
    var t0 = performance.now();
    (function animar() { if (estadoTela !== 'fim') return; D.podio($('podio'), estado, (performance.now() - t0) / 1000); requestAnimationFrame(animar); })();
  }

  // ---------- controles ----------
  var pularPend = [false, false];
  function pular(j) { if (estado && j < estado.jogadores.length && !pausado) pularPend[j] = true; }
  var teclas = {}, ponteiros = {}, botoesAntes = [{}, {}];
  function nomeTecla(e) {
    var k = e.key || '', c = e.keyCode || e.which || 0;
    if (k === 'ArrowLeft' || k === 'Left' || c === 37) return 'esq';
    if (k === 'ArrowRight' || k === 'Right' || c === 39) return 'dir';
    if (k === 'ArrowUp' || k === 'Up' || c === 38) return 'cima';
    if (k === 'ArrowDown' || k === 'Down' || c === 40) return 'baixo';
    if (k === 'Enter' || k === 'OK' || c === 13) return 'ok';
    if (k === ' ' || c === 32) return 'espaco';
    if (k === 'Escape' || k === 'GoBack' || k === 'BrowserBack' || c === 27 || c === 461 || c === 10009) return 'voltar';
    var l = k.toLowerCase();
    if (l === 'a' || l === 'd' || l === 'w' || l === 's' || l === 'p' || l === 'h') return l;
    return '';
  }
  document.addEventListener('keydown', function (e) {
    var n = nomeTecla(e);
    if (!$('selfie').hidden) { if (n === 'voltar') { e.preventDefault(); fecharSelfie(); } return; }
    if (estadoTela === 'entrada') { if (n === 'ok' || n === 'espaco') { e.preventDefault(); entrar(); } return; }
    if (estadoTela !== 'jogo' || pausado) {
      if (n === 'esq' || n === 'cima') { e.preventDefault(); moverFoco(-1); }
      else if (n === 'dir' || n === 'baixo') { e.preventDefault(); moverFoco(1); }
      else if (n === 'voltar' && pausado) { e.preventDefault(); continuar(); }
      else if (n === 'voltar' && estadoTela === 'fim') { e.preventDefault(); irMenu(); }
      return;
    }
    if (!n) return;
    e.preventDefault();
    if (n === 'voltar' || n === 'p') { pausar(); return; }
    if (e.repeat) return;
    teclas[n] = true;
    var dois = estado && estado.jogadores.length === 2;
    if (n === 'cima' || n === 'ok' || n === 'espaco') pular(dois ? 1 : 0);
    if (n === 'w') pular(0);
    if (n === 'h') buzinar(0);
  });
  document.addEventListener('keyup', function (e) { var n = nomeTecla(e); if (n) teclas[n] = false; });
  window.addEventListener('blur', function () { teclas = {}; });

  // toque: segurar a metade esquerda ou direita do seu pedaço da tela
  function ondeToque(x, y) {
    if (!estado) return null;
    var vv = D.vistas(W, H, estado.jogadores.length);
    for (var k = 0; k < vv.length; k++) { var v = vv[k]; if (x >= v.x && x <= v.x + v.w && y >= v.y && y <= v.y + v.h) return { j: k, dir: x < v.x + v.w / 2 ? -1 : 1 }; }
    return null;
  }
  // botão ⬆ PULAR de cada vista
  function noBotaoPulo(x, y) {
    if (!estado) return -1;
    var vv = D.vistas(W, H, estado.jogadores.length);
    for (var k = 0; k < vv.length; k++) { var b = D.botaoPulo(vv[k], D.margemLocal(vv[k], W, H, bordas)); if (Math.pow(x - b.x, 2) + Math.pow(y - b.y, 2) <= Math.pow(b.r * 1.25, 2)) return k; }
    return -1;
  }
  var inicioToque = {};
  function tocou(e) {
    if (estadoTela !== 'jogo' || pausado) return;
    e.preventDefault();
    var p = ponteiros[e.pointerId];
    if (p && p.pulo) return;
    // deslizar o dedo para cima também pula
    var ini = inicioToque[e.pointerId];
    if (ini && !ini.pulou && ini.y - e.clientY > Math.min(W, H) * 0.09 && Date.now() - ini.t < 500) { ini.pulou = true; var rr = ondeToque(ini.x, ini.y); if (rr) pular(rr.j); }
    var r = ondeToque(e.clientX, e.clientY); if (r) ponteiros[e.pointerId] = r; else delete ponteiros[e.pointerId];
  }
  function soltou(e) { delete ponteiros[e.pointerId]; delete inicioToque[e.pointerId]; }
  if (window.PointerEvent) {
    cv.addEventListener('pointerdown', function (e) {
      try { cv.setPointerCapture(e.pointerId); } catch (x) { /* ok */ }
      if (estadoTela !== 'jogo' || pausado) return;
      var bj = noBotaoPulo(e.clientX, e.clientY);
      if (bj >= 0) { e.preventDefault(); pular(bj); ponteiros[e.pointerId] = { j: bj, dir: 0, pulo: true }; return; }
      inicioToque[e.pointerId] = { x: e.clientX, y: e.clientY, t: Date.now() };
      tocou(e);
    });
    cv.addEventListener('pointermove', function (e) { if (ponteiros[e.pointerId] || inicioToque[e.pointerId]) tocou(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { cv.addEventListener(t, soltou); });
  } else {
    var porToque = function (e) {
      e.preventDefault();
      if (e.type === 'touchstart') Array.prototype.forEach.call(e.changedTouches, function (tq) { var bj = noBotaoPulo(tq.clientX, tq.clientY); if (bj >= 0) pular(bj); });
      ponteiros = {}; Array.prototype.forEach.call(e.touches, function (tq) { if (noBotaoPulo(tq.clientX, tq.clientY) >= 0) return; var r = ondeToque(tq.clientX, tq.clientY); if (r) ponteiros[tq.identifier] = r; });
    };
    ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(function (t) { cv.addEventListener(t, porToque, { passive: false }); });
  }
  cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  // acelerômetro: inclinar o celular vira, toquinho para cima pula (1 jogador, celular/tablet)
  var mov = window.VruuumMovimento.criar(), movLigado = false;
  function aoMover(e) {
    var ang = (screen.orientation && typeof screen.orientation.angle === 'number') ? screen.orientation.angle : (window.orientation || 0);
    mov.ler(e.accelerationIncludingGravity, e.acceleration, ang, Date.now());
  }
  function ligarMovimento() {
    if (movLigado || !('DeviceMotionEvent' in window)) return;
    // escuta sempre; sem permissão os eventos só não chegam (e o toque continua valendo)
    movLigado = true; window.addEventListener('devicemotion', aoMover);
    // iPhone e Chrome novo pedem permissão (precisa vir do toque em "Correr")
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      try { var p = DeviceMotionEvent.requestPermission(); if (p && p.catch) p.catch(function () { /* sem permissão: fica no toque */ }); } catch (e) { /* idem */ }
    }
  }

  function lerEntradas() {
    var n = estado.jogadores.length, ent = [], k;
    for (k = 0; k < n; k++) ent.push({ dir: 0, freio: false });
    if (n === 1) {
      ent[0].dir = (teclas.esq || teclas.a ? -1 : 0) + (teclas.dir || teclas.d ? 1 : 0);
      ent[0].freio = !!(teclas.baixo || teclas.s);
    } else {
      ent[0].dir = (teclas.a ? -1 : 0) + (teclas.d ? 1 : 0); ent[0].freio = !!teclas.s;
      ent[1].dir = (teclas.esq ? -1 : 0) + (teclas.dir ? 1 : 0); ent[1].freio = !!teclas.baixo;
    }
    for (var id in ponteiros) { var p = ponteiros[id]; if (p.j < n) ent[p.j].dir += p.dir; }
    var usaMov = movLigado && n === 1 && estado.fase === 'corrida' && pref.controle !== 'maos';
    if (usaMov) ent[0].dir += mov.direcao();
    var pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (k = 0; k < Math.min(2, pads.length); k++) {
      var gp = pads[k]; if (!gp) continue;
      var alvo = n === 1 ? 0 : k, b = gp.buttons || [], eixo = gp.axes && gp.axes[0] || 0;
      if (Math.abs(eixo) > 0.2) ent[alvo].dir += eixo;
      if (b[14] && b[14].pressed) ent[alvo].dir -= 1;
      if (b[15] && b[15].pressed) ent[alvo].dir += 1;
      if ((b[13] && b[13].pressed) || (b[1] && b[1].pressed)) ent[alvo].freio = true;
      var pul = !!(b[0] && b[0].pressed), buz = !!(b[2] && b[2].pressed), pausa = !!(b[9] && b[9].pressed);
      if (pul && !botoesAntes[k].pul) pular(alvo);
      if (buz && !botoesAntes[k].buz) buzinar(alvo);
      if (pausa && !botoesAntes[k].pausa) setTimeout(pausar, 0);
      botoesAntes[k] = { pul: pul, buz: buz, pausa: pausa };
    }
    for (k = 0; k < n; k++) { ent[k].dir = Math.max(-1, Math.min(1, ent[k].dir)); ent[k].pular = pularPend[k]; pularPend[k] = false; }
    if (usaMov && mov.pulou()) ent[0].pular = true;
    if (maosLigadas && estado.fase === 'corrida') for (k = 0; k < n; k++) {
      var cm = ctrlMaos[k]; if (!cm) continue;
      ent[k].dir = Math.max(-1, Math.min(1, ent[k].dir + cm.direcao()));
      if (cm.freio()) ent[k].freio = true;
      if (cm.pulou()) ent[k].pular = true;
    }
    return ent;
  }

  // ---------- guardar no celular: UM botão só ----------
  // Se o navegador deixa instalar, instala (vira ícone na tela, abre sem internet). Senão, baixa o
  // arquivo vruuum.html com o jogo inteiro dentro (abre direto do celular, sem internet).
  var pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); pedidoInstalar = e; });
  var EM_ARQUIVO = !!window.JOGO_EM_ARQUIVO || location.protocol === 'file:' || location.protocol === 'content:';
  var INSTALADO = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  if (EM_ARQUIVO || INSTALADO || !window.BaixarJogo) $('guardar').hidden = true;
  window.addEventListener('appinstalled', function () { $('guardar').hidden = true; });
  $('btGuardar').addEventListener('click', function () {
    var aviso = $('guardarAviso');
    if (pedidoInstalar) {
      var p = pedidoInstalar; pedidoInstalar = null;
      p.prompt();
      p.userChoice.then(function (r) {
        aviso.textContent = r && r.outcome === 'accepted' ? t('Pronto! O Vruuum! ficou na tela do celular, com ícone. Abre até sem internet.', 'Done! Vruuum! is on your home screen. It opens even offline.', '¡Listo! Vruuum! ya está en la pantalla del móvil, con su icono. Se abre incluso sin internet.') : t('Tudo bem. Se mudar de ideia, toque de novo: aí baixa o arquivo do jogo.', 'No problem. Tap again to download the game file instead.', 'Está bien. Si cambias de idea, toca otra vez y se descarga el archivo del juego.');
      }).catch(function () {});
      return;
    }
    aviso.textContent = t('Preparando o arquivo…', 'Preparing the file…', 'Preparando el archivo…');
    BaixarJogo.baixar('vruuum.html').then(function () {
      aviso.textContent = t('Pronto! O arquivo vruuum.html foi para os Downloads. Toque nele para jogar, mesmo sem internet.', 'Done! vruuum.html is in your Downloads. Tap it to play, even offline.', '¡Listo! El archivo vruuum.html está en Descargas. Tócalo para jugar, incluso sin internet.');
    }).catch(function () {
      aviso.textContent = t('Não deu agora. Abra o jogo com internet e tente de novo.', "That didn't work this time. Open the game while online and try again.", 'Esta vez no ha funcionado. Abre el juego con internet y vuelve a intentarlo.');
    });
  });

  // ---------- música no menu (1.14.0): ⏮ ⏭ e a lista para escolher; na corrida continua a que estiver tocando ----------
  var musicaEscolhida = false;
  function pintarMusica(i) {
    $('musNome').textContent = '🎵 ' + (i ? i.nome : t('Toque para escolher', 'Tap to choose', 'Toca para elegir')) + ' ▾';
    $('musOff').hidden = navigator.onLine !== false;
    var at = Som.musicaAtual();
    Array.prototype.forEach.call($('musLista').children, function (b, k) { b.setAttribute('aria-pressed', k === at ? 'true' : 'false'); });
  }
  function escolherMusica(k) { Som.iniciar(); Som.escolherMusica(k); musicaEscolhida = true; }
  $('musAnt').addEventListener('click', function () { escolherMusica(Som.musicaAtual() - 1); });
  $('musProx').addEventListener('click', function () { escolherMusica(Som.musicaAtual() + 1); });
  $('musNome').addEventListener('click', function () {
    var l = $('musLista'), abrir = l.hidden;
    if (abrir && !l.children.length) Som.listaMusicas().forEach(function (m, k) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'mus-item';
      b.textContent = m.nome + ' · ' + m.autor.replace(/ \(.*\)$/, '');
      b.addEventListener('click', function () { escolherMusica(k); l.hidden = true; $('musNome').setAttribute('aria-expanded', 'false'); });
      l.appendChild(b);
    });
    l.hidden = !abrir; $('musNome').setAttribute('aria-expanded', abrir ? 'true' : 'false');
    pintarMusica(Som.listaMusicas()[Som.musicaAtual()]);
  });
  window.addEventListener('online', function () { pintarMusica(Som.listaMusicas()[Som.musicaAtual()]); });
  window.addEventListener('offline', function () { pintarMusica(Som.listaMusicas()[Som.musicaAtual()]); });

  // ---------- começo ----------
  $('ver').textContent = 'v' + APP_VERSION;
  // nome da música tocando, com autor e licença (as gravadas são CC BY-SA: o crédito aparece aqui)
  Som.aoTrocarMusica(function (i) { $('tocando').textContent = '🎵 ' + i.nome + ' — ' + i.autor + (i.licenca ? ' (' + i.licenca + ')' : ''); pintarMusica(i); });
  // navegação padrão (../navegacao.js): 🏠 Início volta ao menu (da corrida e do fim); o Voltar do celular faz o mesmo
  // (a barra cuida do histórico: este jogo não mexia nele); 🚪 Saída sai do jogo, perguntando antes no meio da corrida
  if (window.BolinhoNav) BolinhoNav.iniciar({ jogo: 'vruuum', cuidarDoVoltar: true,
    noInicio: function () { return estadoTela !== 'jogo' && estadoTela !== 'fim'; }, irParaInicio: irMenu,
    emAndamento: function () { return estadoTela === 'jogo' && rodando; } });
  // trocaram o idioma na estante (outra aba): o menu troca na hora; o que é desenhado na corrida, na próxima corrida
  if (window.BolinhoIdioma) BolinhoIdioma.aoMudar(function (c) { lingua = c; traduzir(); if (montado) marcar(); pintarMusica(Som.listaMusicas()[Som.musicaAtual()]); });
  lerBordas();
  $('btSom').textContent = $('btSomJogo').textContent = Som.ligado() ? '🔊' : '🔇';
  traduzir();
  pintarMusica(Som.listaMusicas()[Som.musicaAtual()]);
  try { iniciarDemo(); } catch (e) { demo = null; }   // apresentação: se algo falhar, fica a tela de entrada parada
  if (TV) setTimeout(function () { try { $('btEntrar').focus(); } catch (e) { /* ok */ } }, 200);
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });
})();

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer jogar não baixa nada a mais. */
(function () {
  if (!/[?&]instalar\b/.test(location.search) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.src = '../instalar.js';
  s.setAttribute('data-nome', 'Vruuum!'); s.setAttribute('data-icone', 'icone-192.png');
  s.setAttribute('data-so-com', 'instalar'); s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
  document.body.appendChild(s);
})();
