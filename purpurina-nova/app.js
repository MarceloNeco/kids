/* Purpurina — telas, estúdio, desafios, desfile, foto e looks favoritos.
   As peças ficam em pecas.js, as regras em visual.js, o desenho em boneca.js e o som em som.js.
   Guarda só neste aparelho (localStorage, chaves "purpurinaNova.*"): preferências, o visual do "brincar
   livre", os looks favoritos e as estrelas de cada desafio. Nada vai para a internet. */
(function () {
  'use strict';
  var APP_VERSION = '0.9.10';
  var $ = function (id) { return document.getElementById(id); };
  var P = window.PurpurinaPecas, V = window.PurpurinaVisual, B = window.PurpurinaBoneca, Som = window.PurpurinaSom;
  var TOQUE = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
  /* modo TV: ?tv=auto (cartão da página Kids, solverone.com.br/tv/purpurina). Tablet ou celular de toque que abriu
     esse endereço (ex.: tablet Amazon Fire) não é TV: abre a brincadeira normal. ?tv=sim força o modo TV. */
  var TELEVISAO = /AFT|SMART-?TV|SmartTV|Tizen|Web0S|webOS|NetCast|BRAVIA|Android TV|GoogleTV|CrKey|HbbTV|AppleTV|Roku|Viera|Philips|Hisense|VIDAA/i.test(navigator.userAgent || '');
  var TV = /[?&]tv=sim\b/.test(location.search) || (/[?&]tv=auto\b/.test(location.search) && (!TOQUE || TELEVISAO));
  if (TV) document.documentElement.classList.add('tv');
  var CALMO = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  /* chegada dos quadradinhos: ao abrir uma parte, trocar de aba ou de tela, os botões entram um atrás do outro,
     rápido e suave (classe .chega no estilo.css). Só na navegação; tocar numa opção não faz tudo pular de novo. */
  function chegar() {
    if (CALMO) return;
    Array.prototype.forEach.call(arguments, function (caixa) {
      if (!caixa || caixa.hidden || !caixa.getClientRects().length) return;   // escondida: não anima
      var k = 0;
      Array.prototype.forEach.call(caixa.children, function (el) {
        if (el.hidden) return;
        el.classList.remove('chega'); void el.offsetWidth;
        el.style.setProperty('--i', Math.min(k++, 14)); el.classList.add('chega');
        el.addEventListener('animationend', function fim() { el.classList.remove('chega'); el.removeEventListener('animationend', fim); });
      });
    });
  }
  var MAX_LOOKS = 30;

  function ler(k, padrao) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; /* aparelho sem espaço ou modo privado: segue sem gravar */ } }
  // ---------- idioma ----------
  // português, inglês ou espanhol: escolhido só na estante (../idioma.js); o jogo não tem botão de idioma próprio
  var lingua = window.BolinhoIdioma ? BolinhoIdioma.atual() : 'pt';
  function t(pt, en, es) { return lingua === 'en' ? en : lingua === 'es' ? (es != null ? es : pt) : pt; }
  function N(x) { return lingua === 'en' ? x.en : lingua === 'es' ? (x.es != null ? x.es : x.pt) : x.pt; }
  function traduzir() {
    document.documentElement.lang = lingua === 'en' ? 'en' : lingua === 'es' ? 'es' : 'pt-BR';
    Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (el) { var p = el.getAttribute('data-t').split('|'); el.textContent = t(p[0], p[1], p[2]); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-rotulo]'), function (el) { var p = el.getAttribute('data-rotulo').split('|'); el.setAttribute('aria-label', t(p[0], p[1], p[2])); });
  }

  // ---------- telas e o botão Voltar do celular ----------
  /* Cada tela nova entra no histórico do navegador; o Voltar do celular volta uma tela (ou fecha a
     janela aberta) em vez de sair do jogo. Fechar pelo botão da tela também tira a entrada (history.back). */
  var atual = 'entrada', pilha = [], ignorar = 0, janelaAberta = false, parteNoHist = false;
  function mostrar(id) {
    Array.prototype.forEach.call(document.querySelectorAll('.tela'), function (s) { s.classList.toggle('ativa', s.id === id); });
    atual = id; window.scrollTo(0, 0);
    if (id !== 'desfile') pararConfete();
    if (balada) { balada.parar(); balada = null; }
    var placa = document.querySelector('.bal-placa'); if (placa) placa.remove();
    if (id === 'balada') baladinha();
    if (id === 'menu') desenharMenu();
    if (id === 'desafios') listaDesafios();
    if (id === 'looks') listaLooks();
    if (id === 'estudio') desenharTudo();
    if (window.PurpurinaTV && PurpurinaTV.aoMostrar) PurpurinaTV.aoMostrar(id);
    var tela = $(id);
    if (tela) chegar.apply(null, Array.prototype.slice.call(tela.querySelectorAll('.botoes-menu, .linha-menu, #listaDesafios, #listaLooks, .fontes, .controles-musica, #cats:not([hidden]), #estilos:not([hidden]), #cores:not([hidden])')));
    setTimeout(focarPrimeiro, 30);
  }
  function ir(id) { if (id === atual) return; pilha.push(atual); try { history.pushState({ purpurina: pilha.length }, ''); } catch (e) { /* sem histórico: segue */ } mostrar(id); }
  function voltar() { if (pilha.length) history.back(); }
  function irMenu() {
    var i = pilha.lastIndexOf('menu');
    if (i < 0) { mostrar('menu'); return; }
    var passos = pilha.length - i + (parteNoHist ? 1 : 0); pilha = pilha.slice(0, i); parteNoHist = false; naParte = false;
    ignorar++; history.go(-passos); mostrar('menu');
  }
  window.addEventListener('popstate', function () {
    if (ignorar) { ignorar--; if (aposFechar) { var fn = aposFechar; aposFechar = null; fn(); } return; }
    if (janelaAberta) { fecharJanela(); return; }
    if (parteNoHist && atual === 'estudio') { parteNoHist = false; mostrarPartes(); return; }   // Voltar do celular: das opções volta para as partes
    if (pilha.length) mostrar(pilha.pop());
  });
  Array.prototype.forEach.call(document.querySelectorAll('.voltar'), function (b) { b.addEventListener('click', voltar); });
  // navegação padrão (../navegacao.js): 🏠 Início volta ao menu de qualquer tela (o ⬅ da Música e da TV continua voltando
  // um passo, porque elas também abrem do estúdio); 🚪 Saída sai do jogo, perguntando antes no estúdio e no desfile
  if (window.BolinhoNav) BolinhoNav.iniciar({ jogo: 'purpurina-nova',
    noInicio: function () { return atual === 'entrada' || atual === 'menu' || atual === 'desligado' || atual === 'tv'; },
    irParaInicio: function () { Som.tocar('clique'); if (janelaAberta) fecharPeloBotao(irMenu); else irMenu(); },
    emAndamento: function () { return atual === 'estudio' || atual === 'desfile' || atual === 'balada'; },
    esconder: function () { return TV; } });

  if (window.SolverRecursos && !SolverRecursos.ligado('purpurina-nova', true)) { mostrar('desligado'); traduzir(); return; }

  // ---------- janela (foto, confirmar) ----------
  var aposFechar = null;
  function abrirJanela(o, mesma) {
    $('janelaTitulo').textContent = o.titulo || ''; $('janelaTexto').textContent = o.texto || ''; $('janelaTexto').hidden = !o.texto;
    var img = $('janelaImg'); img.hidden = !o.img; if (o.img) { img.src = o.img; img.alt = o.alt || ''; }
    var caixa = $('janelaBotoes'); caixa.innerHTML = '';
    o.botoes.forEach(function (b) {
      var bt = document.createElement('button'); bt.type = 'button'; bt.className = b.classe || 'medio'; bt.textContent = b.t;
      bt.addEventListener('click', function () { if (b.ficar) { b.fn(); return; } fecharPeloBotao(b.fn); });
      caixa.appendChild(bt);
    });
    var vid = $('janelaVideo'); vid.hidden = !o.video; if (o.video) { vid.src = o.video; try { vid.play(); } catch (e) { /* ok */ } } else vid.removeAttribute('src');
    $('janela').hidden = false; chegar(caixa);
    if (!(mesma && janelaAberta)) { janelaAberta = true; try { history.pushState({ janela: 1 }, ''); } catch (e) { /* ok */ } }
    setTimeout(function () { var p = caixa.querySelector('button'); if (p) p.focus(); }, 30);
  }
  function fecharJanela() { $('janela').hidden = true; janelaAberta = false; var v = $('janelaVideo'); try { v.pause(); } catch (e) { /* ok */ } if (v.src && v.src.indexOf('blob:') === 0) URL.revokeObjectURL(v.src); v.removeAttribute('src'); var img = $('janelaImg'); if (img.src && img.src.indexOf('blob:') === 0) URL.revokeObjectURL(img.src); img.removeAttribute('src'); }
  // fecha a janela e só depois (quando o navegador terminar de voltar no histórico) faz a ação escolhida
  function fecharPeloBotao(depois) { if (!janelaAberta) return; fecharJanela(); ignorar++; aposFechar = depois || null; history.back(); }
  $('janela').addEventListener('click', function (e) { if (e.target === $('janela')) fecharPeloBotao(); });

  var tRecado = 0;
  function recado(msg) { var r = $('recado'); r.textContent = msg; r.hidden = false; clearTimeout(tRecado); tRecado = setTimeout(function () { r.hidden = true; }, 2600); }

  // quem escolheu 🔕 sem música não ouve música ao entrar (os efeitos continuam); o ⏭ ou o 🎵 ligam de novo
  function semMusica() { try { return localStorage.getItem('purpurinaNova.semMusica') === '1'; } catch (e) { return false; } }

  // ---------- entrada e menu ----------
  var livre = V.limpar(ler('purpurinaNova.atual', null));
  function entrar() {
    if (atual !== 'entrada') return;
    Som.iniciar(); if (!semMusica()) Som.musica(true); Som.tocar('brilho');
    telaCheia();
    try { history.replaceState({ inicio: 1 }, ''); } catch (e) { /* ok */ }
    mostrar('menu');
  }
  if (window.Trilha && Trilha.podeTocarJa && Trilha.podeTocarJa() && !semMusica()) { Som.iniciar(); Som.musica(true); }   // aberto pelo Bolinho, já começa com música (dono, 20/Nov/2026); senão, no primeiro toque, como antes
  $('btEntrar').addEventListener('click', entrar);
  function desenharMenu() {
    abertura($('menuBoneca'), 'menu');
    $('qtdLooks').textContent = ler('purpurinaNova.looks', []).length;
  }
  $('btSom').addEventListener('click', function () { Som.iniciar(); var lig = Som.alternar(); $('btSom').textContent = lig ? '🔊' : '🔇'; });
  $('btAjuda').addEventListener('click', function () { var a = $('ajuda'); a.hidden = !a.hidden; $('btAjuda').setAttribute('aria-expanded', String(!a.hidden)); });
  $('btLivre').addEventListener('click', function () {
    Som.tocar('aba');
    if (V.iguais(livre, V.novo())) { comecar(null); return; }
    abrirJanela({ titulo: t('🎨 Brincar livre', '🎨 Free play', '🎨 Juego libre'), texto: t('Quer continuar o visual de antes ou começar tudo do zero?', 'Do you want to keep your last look or start from scratch?', '¿Quieres seguir con el look de antes o empezar desde cero?'), botoes: [
      { t: t('✨ Começar do zero', '✨ Start from scratch', '✨ Empezar desde cero'), classe: 'grande', fn: function () { hist.limpar(); livre = V.novo(); gravar('purpurinaNova.atual', livre); comecar(null); } },
      { t: t('👗 Continuar o visual', '👗 Keep my look', '👗 Seguir con mi look'), fn: function () { comecar(null); } },
      { t: t('✨ Escolher um estilo pronto', '✨ Pick a ready-made style', '✨ Elegir un estilo listo'), fn: function () { ir('looks'); } }
    ] });
  });
  $('btDesafios').addEventListener('click', function () { Som.tocar('aba'); ir('desafios'); });
  $('btTV').addEventListener('click', function () { Som.tocar('aba'); ir('conectar'); });
  $('btMusica').addEventListener('click', function () { Som.tocar('aba'); ir('musica'); });
  $('btMusicaPalco').addEventListener('click', function () { Som.tocar('aba'); ir('musica'); });
  // ⋯ abre e fecha a caixinha das ferramentas; escolher uma ferramenta (menos desfazer) ou tocar fora fecha
  function ferramentas(abrir) { $('ferramentas').hidden = !abrir; $('btFerramentas').setAttribute('aria-expanded', String(!!abrir)); }
  $('btFerramentas').addEventListener('click', function (ev) { ev.stopPropagation(); Som.tocar('aba'); ferramentas($('ferramentas').hidden); });
  $('ferramentas').addEventListener('click', function (ev) { if (ev.target.closest('button') && ev.target.closest('button').id !== 'btDesfazer') ferramentas(false); });
  document.addEventListener('click', function (ev) { if (!$('ferramentas').hidden && !ev.target.closest('#ferramentas') && !ev.target.closest('#btFerramentas')) ferramentas(false); });
  // ponte com a TV (tv.js): quando o celular está conectado, cada mudança vai para a TV
  function ponte(tipo, extra) { if (window.PurpurinaTV && PurpurinaTV.conectado()) PurpurinaTV.mandar(tipo, extra); }
  $('btLooks').addEventListener('click', function () { Som.tocar('aba'); ir('looks'); });

  // tela cheia no celular: a barra do navegador não tampa nada (deitado ou em pé). No iPhone não existe.
  function telaCheia() {
    if (!TOQUE || TV) return;
    var d = document, el = d.documentElement;
    try {
      if (!(d.fullscreenElement || d.webkitFullscreenElement)) { var p = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : (el.webkitRequestFullscreen && el.webkitRequestFullscreen()); if (p && p.catch) p.catch(function () {}); }
    } catch (e) { /* navegador sem tela cheia: segue normal */ }
  }

  // ---------- desafios ----------
  function estrelasTxt(n) { return n ? '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n) : '☆☆☆'; }
  function listaDesafios() {
    var caixa = $('listaDesafios'); caixa.innerHTML = '';
    P.DESAFIOS.forEach(function (d) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'desafio';
      var est = ler('purpurinaNova.estrelas.' + d.id, 0);
      var ico = document.createElement('span'); ico.className = 'ico'; ico.textContent = d.ico;
      var txt = document.createElement('span'), nome = document.createElement('span'), e = document.createElement('span');
      nome.className = 'nome'; nome.textContent = N(d); e.className = 'est'; e.textContent = estrelasTxt(est);
      e.setAttribute('aria-label', est + ' ' + t('de 3 estrelas', 'of 3 stars', 'de 3 estrellas'));
      txt.appendChild(nome); txt.appendChild(e); b.appendChild(ico); b.appendChild(txt);
      b.addEventListener('click', function () { Som.tocar('aba'); comecar(d.id); });
      caixa.appendChild(b);
    });
  }

  // ---------- estúdio ----------
  var modo = null, estado = livre, hist = new V.Historico(), grupoAtual = 'eu', catPorGrupo = {}, dicasAntes = [];
  function desafioAtual() { return modo ? V.desafio(modo) : null; }
  // desafio começa limpinho, com a personagem dela (pele, cabelo, olhos) e o cenário do tema
  function baseDesafio(d) {
    var e = V.novo();
    ['personagem', 'pele', 'rosto', 'nariz', 'testa', 'formaOlho', 'distOlhos', 'formaBoca', 'cabelo', 'cabeloCor', 'olhos'].forEach(function (k) { e[k] = livre[k]; });
    if (e.personagem === 'menino') e.cilios = 'nenhum';
    e.cenario = d.cenario; return e;
  }
  function comecar(desafioId) {
    modo = desafioId; hist.limpar(); naParte = false;
    var d = desafioAtual();
    if (d) { estado = baseDesafio(d); grupoAtual = 'roupa'; Som.proxima(); }
    else { estado = livre; grupoAtual = grupoAtual || 'eu'; }
    dicasAntes = d ? V.avaliar(estado, d).dicas : [];
    vista = INTEIRA.slice(); zoomLigado = false;
    ir('estudio'); ponte('visual');
  }
  function mudar(novo, catId) {
    if (V.iguais(novo, estado)) return;
    hist.guardar(estado); estado = novo; aposMudar(); efeito(catId);
    // roupa sem zoom próprio (vestido, blusa, saia, calça, capa…): se estava de perto, afasta para mostrar a roupa inteira
    var cm = catId && P.categoria(catId); if (cm && cm.grupo === 'roupa' && !cm.zoom && zoomLigado) zoom(false, true);
  }
  function aposMudar() {
    if (!modo) { livre = estado; gravar('purpurinaNova.atual', estado); }
    ponte('visual');
    desenharBoneca(); desenharOpcoes(); desenharDicas(true);
    $('btDesfazer').disabled = !hist.tem();
  }
  function desenharTudo() {
    var d = desafioAtual();
    $('titulo').textContent = d ? d.ico + ' ' + N(d) : t('🎨 Brincar livre', '🎨 Free play', '🎨 Juego libre');
    desenharGrupos(); desenharBoneca(); desenharOpcoes(); desenharDicas(false); zoom(zoomLigado, false);
    $('btDesfazer').disabled = !hist.tem();
  }
  function desenharBoneca() {
    var el = $('boneca');
    // trocando de vista: sem desfoque e sombra, para ficar liso
    var mexendo = girando;
    // viva no estúdio (dono, 20/Nov/2026: "não precisa ser estático"): de frente ela respira, passa o peso de uma perna
    // para a outra e balança os braços (classe .parada, estilo.css); de tempos em tempos dá tchauzinho (tchauAte)
    // viva no estúdio: o esqueleto (opcoes.rig) e o animador.js — ela passa o peso de uma perna para a outra, olha em
    // volta, põe a mão na cintura e dá tchauzinho, tudo aos poucos (sem redesenhar)
    var viva = !CALMO && !angulo;
    el.innerHTML = B.svg(estado, { id: 'palco', anim: viva, area: vista, angulo: angulo, realce: !mexendo, passos: viva, rig: viva, piscadinha: viva && Date.now() < piscaAte });
    if (viva && !animEstudio) { animEstudio = PurpurinaAnim.criar(el, { poses: POSES_INTEIRA, segura: 3600 }); posesVista = POSES_INTEIRA; movimentoDaVista(); }
    if (!viva && animEstudio) { animEstudio.parar(); animEstudio = null; }
    if (angulo !== angMandado) { angMandado = angulo; ponte('giro'); }
    el.setAttribute('aria-label', V.resumo(estado, lingua));
  }
  // tchauzinho de vez em quando no estúdio (a cada ~9 s, por 2,6 s), só de corpo inteiro e de frente
  // piscadinha de vez em quando no estúdio (os movimentos ficam com o animador.js)
  var animEstudio = null, piscaAte = 0;
  setInterval(function () {
    if (CALMO || atual !== 'estudio' || angulo || document.hidden) return;
    piscaAte = Date.now() + 450; desenharBoneca(); setTimeout(function () { if (atual === 'estudio') desenharBoneca(); }, 500);
  }, 9000);
  /* barras de ajuste (dono, 20/Nov/2026: "uma barra de rolar… arrasta de um lado para o outro… mais claro, mais escuro,
     até mais intensidade da maquiagem"): embaixo das bolinhas, "☀️ claro ↔ escuro 🌙" em toda cor e "intensidade" na
     maquiagem. Arrastando, a personagem muda na hora; ao soltar, entra no ↩ desfazer. */
  var tomDaCat = null;   // parte em que a barra de tom está aberta (abre ao tocar numa cor)
  function desenharBarras(cat) {
    // a barra de tom só aparece depois de tocar numa cor (menos botão, mais roupa — dono, 21/Nov/2026)
    var caixa = $('barras'); caixa.innerHTML = ''; caixa.hidden = !cat.cores; caixa.classList.toggle('escondida', tomDaCat !== cat.id);
    if (!cat.cores) return;
    var base = B.corAjustada(Object.assign({}, estado, (function () { var o = {}; o[cat.id + 'Tom'] = 0; o[cat.id + 'Forca'] = 1; return o; })()), cat.id).hex;
    var pele = B.corAjustada(estado, 'pele').hex;
    function barra(campo, rot, esq, dir, min, max, padrao, fundo) {
      var lin = document.createElement('label'); lin.className = 'barra';
      var e1 = document.createElement('span'); e1.className = 'barra-ponta'; e1.textContent = esq;
      var r = document.createElement('input'); r.type = 'range'; r.min = min; r.max = max; r.step = 1;
      r.value = Math.round((estado[cat.id + campo] == null ? padrao : estado[cat.id + campo]) * 100);
      r.setAttribute('aria-label', rot + ' — ' + N(cat)); r.style.background = fundo;
      var e2 = document.createElement('span'); e2.className = 'barra-ponta'; e2.textContent = dir;
      var antes = null;
      function valor() { var v = +r.value / 100, nv = V.copiar(estado); if (Math.abs(v - padrao) < 0.03) delete nv[cat.id + campo]; else nv[cat.id + campo] = v; return nv; }
      r.addEventListener('input', function () { if (!antes) antes = estado; estado = valor(); desenharBoneca(); });
      r.addEventListener('change', function () { var nv = valor(), velho = antes || estado; antes = null; estado = velho; if (!V.iguais(nv, velho)) { hist.guardar(velho); estado = nv; aposMudar(); } });
      lin.appendChild(e1); lin.appendChild(r); lin.appendChild(e2); caixa.appendChild(lin);
    }
    var claro = 'linear-gradient(90deg, ' + B.corAjustada(Object.assign({}, estado, (function () { var o = {}; o[cat.id + 'Tom'] = -1; o[cat.id + 'Forca'] = 1; return o; })()), cat.id).hex + ', ' + base + ', ' +
      B.corAjustada(Object.assign({}, estado, (function () { var o = {}; o[cat.id + 'Tom'] = 1; o[cat.id + 'Forca'] = 1; return o; })()), cat.id).hex + ')';
    barra('Tom', t('Mais claro ou mais escuro', 'Lighter or darker', 'Más claro o más oscuro'), '☀️', '🌙', -100, 100, 0, claro);
    if (B.MAQUIAGEM.indexOf(cat.id) >= 0) barra('Forca', t('Intensidade', 'Intensity', 'Intensidad'), t('Leve', 'Soft', 'Suave'), t('Forte', 'Bold', 'Intenso'), 15, 100, 1, 'linear-gradient(90deg, ' + pele + ', ' + base + ')');
  }
  function desenharDicas(comSom) {
    var d = desafioAtual(), ul = $('dicas');
    $('dicasCaixa').hidden = !d; if (!d) return;
    var r = V.avaliar(estado, d); ul.innerHTML = '';
    $('dicasTitulo').textContent = '💡 ' + r.cumpridas + '/3';
    $('dicasCaixa').setAttribute('aria-label', t('Dicas do desafio', 'Challenge tips', 'Pistas del desafío') + ': ' + r.cumpridas + '/3');
    d.dicas.forEach(function (x, i) {
      var li = document.createElement('li'), m = document.createElement('span'), s = document.createElement('span');
      li.className = r.dicas[i] ? 'ok' : ''; m.className = 'marca'; m.textContent = r.dicas[i] ? '✅' : '⚪'; s.textContent = N(x);
      if (r.dicas[i] && !dicasAntes[i] && comSom) { Som.tocar('dica'); li.classList.add('novo'); }
      else m.style.animation = 'none';
      li.appendChild(m); li.appendChild(s); ul.appendChild(li);
    });
    dicasAntes = r.dicas;
  }

  /* ---------- zoom ----------
     O palco mostra a personagem inteira ou chega perto (rosto, busto, mãos ou cabeça). Liga sozinho ao escolher
     uma parte que tem zoom (maquiagem, joias, olhos…) e desliga nas roupas e no cenário; o 🔍 liga e desliga na mão.
     A animação só muda o viewBox do SVG (barato, sem redesenhar). */
  // corpo inteiro (dono, 20/Nov/2026: a personagem ocupa a altura toda do palco, sem sobra em cima e embaixo)
  var INTEIRA = [40, 30, 320, 650], vista = INTEIRA.slice(), zoomLigado = false, animZoom = 0;
  function catAtual() { return P.categoria(catPorGrupo[grupoAtual] || catsDoGrupo(grupoAtual)[0].id); }
  // corpo de ilustração de moda: a área de zoom vai para o lugar novo do rosto, das mãos ou dos pés (muda com a idade)
  function alvoZoom() { var c = catAtual(), z = (c && c.zoom) || 'rosto'; return B.areaZoom(P.ZOOM[z], estado, z === 'olho' || z === 'boca' ? 50 : 90); }
  /* movimento conforme a vista (dono, 20/Nov/2026: "durante a montagem… movimento bem sutil, olhando para os lados… de
     roupa, para ver como fica com o movimento do corpo… maquiando, zoom no olho, na boca, com um leve movimento"):
     de corpo inteiro ela troca de pose e dá tchau; perto do rosto só olha para os lados, inclina a cabeça e respira;
     no olho e na boca, mais sutil ainda (o quadril quase para, senão o olho sai do quadro) */
  var POSES_INTEIRA = ['relax', 'olhaE', 'relax', 'cintura', 'olhaD', 'relax', 'tchau'], POSES_PERTO = ['relax', 'olhaE', 'relax', 'olhaD'], posesVista = POSES_INTEIRA;
  function movimentoDaVista(para) {
    if (!animEstudio) return;
    var w = (para || vista)[2], perto = w < 300, lista = perto ? POSES_PERTO : POSES_INTEIRA;
    animEstudio.amplitude(w >= 300 ? 1 : w >= 170 ? 0.3 : 0.1);
    if (lista !== posesVista) { posesVista = lista; animEstudio.lista(lista); }
  }
  function zoom(liga, animar) {
    zoomLigado = !!liga;
    var b = $('btZoom'); b.setAttribute('aria-pressed', String(zoomLigado)); b.textContent = zoomLigado ? '👗' : '🔍';   // 👗 (e não 🧍, que o Fire antigo mostra como um quadrado vazio)
    b.setAttribute('aria-label', zoomLigado ? t('Ver a personagem inteira', 'See the whole character', 'Ver al personaje entero') : t('Chegar perto (zoom)', 'Zoom in', 'Acercar (zoom)'));
    var de = vista.slice(), para = zoomLigado ? alvoZoom().slice() : INTEIRA.slice(), id = ++animZoom;
    movimentoDaVista(para);
    if (de.join() === para.join()) return;
    var svg = $('boneca').querySelector('svg');
    if (!animar || CALMO || !svg) { vista = para; if (svg) svg.setAttribute('viewBox', vista.join(' ')); return; }
    var ini = performance.now(), dur = 380;
    (function passo(agora) {
      if (id !== animZoom) return;
      var k = Math.min(1, (agora - ini) / dur), e = 1 - Math.pow(1 - k, 3);
      vista = de.map(function (v, i) { return v + (para[i] - v) * e; });
      var s = $('boneca').querySelector('svg'); if (s) s.setAttribute('viewBox', vista.map(function (v) { return Math.round(v * 10) / 10; }).join(' '));
      if (k < 1) requestAnimationFrame(passo); else vista = para;
    })(ini);
  }
  // ao trocar de parte: zoom automático conforme a parte
  // sapatos: os pés fazem a vitrine (um de cada vez sobe e vira de lado para mostrar o sapato); nas outras partes, normal
  function zoomDaParte() { var c = catAtual(); zoom(!!(c && c.zoom), true); if (animEstudio) animEstudio.modo(c && c.id === 'sapatos' && naParte ? 'vitrine' : ''); }
  $('btZoom').addEventListener('click', function () { Som.tocar('clique'); zoom(!zoomLigado, true); });


 // "⬇ mais": aparece quando há opções escondidas embaixo; um toque rola para baixo
  // a lista que está à vista: as partes (passo 1) ou as opções da parte (passo 2)
  function listaAVista() { return $('opcoes').hidden ? $('cats') : $('opcoes'); }
  function conferirMais() {
    var o = listaAVista(), tem = !o.hidden && o.scrollHeight - o.scrollTop - o.clientHeight > 24;
    $('btMais').hidden = !tem;
  }
  $('opcoes').addEventListener('scroll', conferirMais, { passive: true });
  $('cats').addEventListener('scroll', conferirMais, { passive: true });
  window.addEventListener('resize', function () { if (atual === 'estudio') conferirMais(); });
  $('btMais').addEventListener('click', function () { var o = listaAVista(); Som.tocar('clique'); try { o.scrollBy({ top: o.clientHeight * 0.75, behavior: 'smooth' }); } catch (e) { o.scrollTop += o.clientHeight * 0.75; } });

  // qual opção é "sem nada" (a bolinha com a diagonal) em cada parte; null = não dá para ficar sem (ex.: pele)
  function semNada(cat) { if (!cat.opcoes) return null; if (cat.opcoes[0].id === 'nenhum') return 'nenhum'; if (cat.id === 'estampa') return 'liso'; return null; }
  var TIRAR_TUDO = { make: { pt: 'Tirar toda a maquiagem', en: 'Remove all makeup', es: 'Quitar todo el maquillaje' }, joias: { pt: 'Tirar todas as joias', en: 'Remove all jewelry', es: 'Quitar todas las joyas' }, acess: { pt: 'Tirar todos os acessórios', en: 'Remove all accessories', es: 'Quitar todos los accesorios' } };

  // abas (grupos), partes (categorias) e opções
  // parte só de menino (bigode) não aparece para a menina
  function catsDoGrupo(g) { return P.CATEGORIAS.filter(function (c) { return c.grupo === g && !(c.menino && estado.personagem !== 'menino'); }); }
  // tela estreita: o nome comprido da aba que não cabe troca pelo nome curto (Maquiagem → Make)
  function encaixarAbas() {
    Array.prototype.forEach.call(document.querySelectorAll('.grupo-bt .t'), function (t) {
      var b = t.parentNode; t.textContent = b.getAttribute('aria-label');
      if (t.getAttribute('data-curto') && t.scrollWidth > t.clientWidth) t.textContent = t.getAttribute('data-curto');
    });
  }
  window.addEventListener('resize', encaixarAbas);
  var naParte = false;
  function entrarNaParte() {
    if (!naParte && !parteNoHist) { parteNoHist = true; try { history.pushState({ parte: 1 }, ''); } catch (e) { parteNoHist = false; } }
    naParte = true;
  }
  // volta da lista de opções para as partes (pelo botão ⬅ ou pelo Voltar do celular)
  function mostrarPartes() { naParte = false; desenharGrupos(); zoomDaParte(); chegar($('cats')); }
  function sairDaParte() { if (parteNoHist) { parteNoHist = false; ignorar++; history.back(); } }
  $('btPartes').addEventListener('click', function () { Som.tocar('clique'); if (parteNoHist) history.back(); else mostrarPartes(); });
  function desenharGrupos() {
    var caixa = $('grupos'); caixa.innerHTML = '';
    P.GRUPOS.forEach(function (g) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'grupo-bt'; b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(g.id === grupoAtual)); b.setAttribute('aria-label', N(g));
      var i = document.createElement('span'); i.className = 'i'; i.textContent = g.ico;
      var tx = document.createElement('span'); tx.className = 't'; tx.textContent = N(g); tx.setAttribute('data-curto', g.curto ? N(g.curto) : '');
      b.appendChild(i); b.appendChild(tx);
      b.addEventListener('click', function () { grupoAtual = g.id; Som.tocar('aba'); sairDaParte(); naParte = false; desenharGrupos(); desenharOpcoes(); zoomDaParte(); chegar($('cats'), $('cores'), $('estilos')); });
      caixa.appendChild(b);
    });
    encaixarAbas();
    var cats = catsDoGrupo(grupoAtual), cc = $('cats'); cc.innerHTML = '';
    if (!catPorGrupo[grupoAtual]) catPorGrupo[grupoAtual] = cats[0].id;
    /* dois passos, para caber no celular: primeiro as partes da aba (Base, Blush, Batom…), grandes; tocou numa,
       as partes recolhem num botão "⬅ Partes", o palco diminui um pouco e as opções ganham o espaço todo */
    var soUma = cats.length < 2, mostrandoOpcoes = soUma || naParte, atualC = P.categoria(catPorGrupo[grupoAtual]);
    cc.hidden = mostrandoOpcoes;
    $('opcoes').hidden = !mostrandoOpcoes;
    $('parteBar').hidden = soUma || !naParte;
    $('parteNome').textContent = atualC.ico + ' ' + N(atualC);
    $('estudio').classList.toggle('escolhendo', mostrandoOpcoes && !soUma);
    setTimeout(conferirMais, 30);
    combinacoes(cc);
    cats.forEach(function (c) {
      // botão quadradinho (desenho em cima, nome embaixo): todas as partes ficam à vista, nada escondido para o lado
      var b = document.createElement('button'); b.type = 'button'; b.className = 'cat-bt';
      var ci = document.createElement('span'); ci.className = 'i'; ci.textContent = c.ico; var ct = document.createElement('span'); ct.textContent = N(c);
      b.appendChild(ci); b.appendChild(ct);
      b.setAttribute('aria-pressed', String(c.id === catPorGrupo[grupoAtual]));
      b.addEventListener('click', function () { catPorGrupo[grupoAtual] = c.id; Som.tocar('clique'); entrarNaParte(); desenharGrupos(); desenharOpcoes(); $('opcoes').scrollTop = 0; zoomDaParte(); chegar($('cores'), $('estilos')); });
      cc.appendChild(b);
    });
  }
  /* combinações prontas da aba (pecas.js, COMBOS): uma fileira que rola para o lado, em cima das partes. Mudam só as
     partes desta aba (o resto do visual continua). Quando tem mais para o lado, a borda esmaece e aparece a setinha ›,
     que também rola (celular primeiro: dá para ver que tem mais). */
  function combinacoes(cc) {
    var menino = estado.personagem === 'menino';
    var lista = (P.COMBOS[grupoAtual] || []).filter(function (cb) { return menino ? !cb.menina : !cb.menino; });
    if (!lista.length) return;
    var caixa = document.createElement('div'); caixa.className = 'combos';
    var tit = document.createElement('p'); tit.className = 'combos-tit'; tit.textContent = t('✨ Combinações prontas', '✨ Ready-made combos', '✨ Combinaciones listas');
    var fila = document.createElement('div'); fila.className = 'combos-fila';
    lista.forEach(function (cb) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'combo-bt';
      b.innerHTML = '<span class="i"></span><span class="t"></span>'; b.firstChild.textContent = cb.ico; b.lastChild.textContent = N(cb);
      b.addEventListener('click', function () {
        var e = V.copiar(estado); Object.keys(cb.e).forEach(function (k) { e[k] = cb.e[k]; });
        mudar(V.limpar(e), null); Som.tocar('brilho'); recado(cb.ico + ' ' + N(cb));
      });
      fila.appendChild(b);
    });
    var seta = document.createElement('button'); seta.type = 'button'; seta.className = 'combos-seta'; seta.textContent = '›';
    seta.setAttribute('aria-label', t('Mais combinações', 'More combos', 'Más combinaciones'));
    seta.addEventListener('click', function () { Som.tocar('clique'); try { fila.scrollBy({ left: fila.clientWidth * 0.7, behavior: 'smooth' }); } catch (e) { fila.scrollLeft += fila.clientWidth * 0.7; } });
    function conferir() { var mais = fila.scrollWidth - fila.scrollLeft - fila.clientWidth > 8; caixa.classList.toggle('tem-mais', mais); seta.hidden = !mais; }
    fila.addEventListener('scroll', conferir, { passive: true });
    caixa.appendChild(tit); caixa.appendChild(fila); caixa.appendChild(seta); cc.appendChild(caixa);
    setTimeout(conferir, 30);
  }
  function desenharOpcoes() {
    var cat = P.categoria(catPorGrupo[grupoAtual] || catsDoGrupo(grupoAtual)[0].id);
    var cores = $('cores'), estilos = $('estilos'); cores.innerHTML = ''; estilos.innerHTML = '';
    cores.hidden = !cat.cores; estilos.hidden = !cat.opcoes;
    // ✕ Tirar: aparece sempre que a peça está colocada e dá para ficar sem ela
    var sem = semNada(cat), podeTirar = !!(sem && estado[cat.id] !== sem), tb = $('btTirar');
    tb.hidden = !podeTirar;
    if (podeTirar) { var opAtual = P.opcao(cat.id, estado[cat.id]); tb.textContent = '🚫 ' + t('Tirar: ', 'Remove: ', 'Quitar: ') + N(opAtual); tb.onclick = function () { mudar(V.aplicar(estado, cat.id, sem), cat.id); Som.tocar('desfazer'); }; }
    // 🚫 Tirar todos (maquiagem, joias ou acessórios inteiros de uma vez)
    var tt = $('btTirarTudo'), daAba = TIRAR_TUDO[grupoAtual], postas = daAba ? catsDoGrupo(grupoAtual).filter(function (c) { var s0 = semNada(c); return s0 && estado[c.id] !== s0; }) : [];
    tt.hidden = postas.length < 2;
    if (!tt.hidden) { tt.textContent = '🚫 ' + N(daAba); tt.onclick = function () { var e = estado; postas.forEach(function (c) { e = V.aplicar(e, c.id, semNada(c)); }); mudar(e, null); Som.tocar('desfazer'); recado(N(daAba) + ' ✓'); }; }
    cores.setAttribute('aria-label', t('Cores', 'Colors', 'Colores') + ' — ' + N(cat));
    estilos.setAttribute('aria-label', N(cat));
    if (cat.cores) {
      var chave = cat.opcoes ? cat.id + 'Cor' : cat.id;
      P.CORES[cat.cores].forEach(function (c) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'cor-bt' + (cat.opcoes ? '' : ' grande-cor') + (c.brilho ? ' metal' : '');
        b.style.backgroundColor = c.hex;
        if (c.id === 'arco' && cat.id === 'glitter') b.style.background = 'conic-gradient(#ff7cc8, #ffd76a, #7ee8ff, #b892ff, #ff7cc8)';
        b.setAttribute('aria-label', N(c)); b.title = N(c);
        b.setAttribute('aria-pressed', String(estado[chave] === c.id && (!cat.opcoes || estado[cat.id] !== 'nenhum')));
        // escolher outra bolinha volta o tom ao normal (a cor aparece como ela é; depois ajusta na barra)
        b.addEventListener('click', function () { tomDaCat = cat.id; var nv = V.aplicar(estado, cat.id, c.id, true); delete nv[cat.id + 'Tom']; mudar(nv, cat.id); desenharBarras(cat); });
        cores.appendChild(b);
      });
    }
    desenharBarras(cat);
    if (cat.opcoes) {
      cat.opcoes.forEach(function (op, k) {
        var ehNada = op.id === semNada(cat);
        var b = document.createElement('button'); b.type = 'button'; b.className = 'op-bt' + (ehNada ? ' nenhum' : '') + (cat.id === 'cenario' ? ' fundo' : '');
        var vis = document.createElement('span'); vis.className = 'mini-svg';
        if (ehNada) vis.textContent = '🚫';
        else if (op.emoji) { vis.textContent = op.emoji; vis.className += ' mini-emoji'; }   // idade: o desenho não muda, vai o emoji
        else {
          var e = V.aplicar(estado, cat.id, op.id);
          if (cat.id === 'sapatos' || cat.id === 'unhas') e = Object.assign({}, e, { vestido: 'nenhum', saia: 'nenhum', calca: 'shorts' });   // para o sapato aparecer inteiro
          vis.innerHTML = cat.id === 'cenario' ? B.svg(e, { id: 'm' + k, soFundo: true, cortar: true }) : B.svg(e, { id: 'm' + k, fundo: false, area: cat.area ? B.areaZoom(cat.area, e) : undefined });   // miniatura no lugar certo do corpo novo
        }
        var nome = document.createElement('span'); nome.textContent = N(op);
        b.appendChild(vis); b.appendChild(nome);
        b.setAttribute('aria-pressed', String(estado[cat.id] === op.id && V.visivel(estado, cat.id) || (op.id === 'nenhum' && estado[cat.id] === 'nenhum')));
        // tocar de novo na peça que já está colocada tira a peça (quando dá para ficar sem ela)
        b.addEventListener('click', function () {
          var sem0 = semNada(cat), tirar = !!sem0 && op.id !== sem0 && estado[cat.id] === op.id && V.visivel(estado, cat.id);
          mudar(V.aplicar(estado, cat.id, tirar ? sem0 : op.id), cat.id);
          if (tirar) recado(t('Tirou: ', 'Removed: ', 'Has quitado: ') + N(op));
        });
        estilos.appendChild(b);
      });
    }
    setTimeout(conferirMais, 30);
  }

  // ---------- efeitos na personagem: pincel, faíscas, giro ----------
  var ALVO = { base: [200, 200, 1], blush: [250, 252, 1], sombra: [236, 192, 1], delineado: [236, 205, 1], cilios: [236, 195, 1], batom: [200, 272, 1], glitter: [200, 180, 1], adesivo: [266, 250, 1],
    pele: [200, 205, 1], cabelo: [200, 130, 1], olhos: [200, 214, 1], vestido: [200, 480], blusa: [200, 400], saia: [200, 490], calca: [200, 540], estampa: [200, 400], sapatos: [200, 646],
    cabeca: [200, 110, 1], laco: [250, 130, 1], brincos: [284, 236, 1], colar: [200, 350], oculos: [200, 214, 1], bolsa: [290, 515], cenario: [200, 360],
    mechas: [200, 140, 1], pulseira: [120, 487], anel: [111, 508], broche: [174, 388] };
  var PINCEL = { base: '🧽', blush: '🖌️', sombra: '🖌️', delineado: '✏️', cilios: '🖌️', batom: '💄', glitter: '✨', adesivo: '💟' };
  function naTela(x, y, cabeca) {
    if (cabeca) { x = 200 + (x - 200) * 1.12; y = 297 + (y - 297) * 1.12 + 14; }   // mesma conta do grupo da cabeça em boneca.js
    var r = $('boneca').getBoundingClientRect(), v = vista, s = Math.min(r.width / v[2], r.height / v[3]);
    return [(r.width - v[2] * s) / 2 + (x - v[0]) * s, (r.height - v[3] * s) / 2 + (y - v[1]) * s];
  }
  function faiscas(x, y, qtd, emojis) {
    if (CALMO) return;
    var caixa = $('efeitos'), lista = emojis || ['✨', '💖', '⭐', '✨'];
    for (var i = 0; i < qtd; i++) {
      var f = document.createElement('span'), a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 50;
      f.className = 'faisca'; f.textContent = lista[i % lista.length];
      f.style.setProperty('--x0', (x - 10) + 'px'); f.style.setProperty('--y0', (y - 10) + 'px');
      f.style.setProperty('--x1', (x - 10 + Math.cos(a) * d) + 'px'); f.style.setProperty('--y1', (y - 10 + Math.sin(a) * d) + 'px');
      caixa.appendChild(f);
      setTimeout(function (n) { return function () { n.remove(); }; }(f), 850);
    }
  }
  function efeito(catId) {
    var cat = P.categoria(catId); if (!cat) return;
    var a = ALVO[catId] || [200, 360], q = naTela(a[0], a[1], a[2]);
    if (cat.grupo === 'make' && !CALMO) {
      Som.tocar('pincel');
      var p = document.createElement('span'), r = $('boneca').getBoundingClientRect();
      p.className = 'pincel'; p.textContent = PINCEL[catId] || '🖌️';
      p.style.setProperty('--x0', (r.width - 40) + 'px'); p.style.setProperty('--y0', (r.height - 40) + 'px');
      p.style.setProperty('--x1', (q[0] - 8) + 'px'); p.style.setProperty('--y1', (q[1] - 30) + 'px');
      $('efeitos').appendChild(p);
      setTimeout(function () { p.remove(); faiscas(q[0], q[1], 6); Som.tocar('brilho'); }, 650);
      return;
    }
    Som.tocar(cat.grupo === 'roupa' ? 'roupa' : cat.grupo === 'eu' ? 'clique' : 'brilho');
    faiscas(q[0], q[1], cat.grupo === 'fundo' ? 12 : 7);
  }
  /* ---------- vistas da personagem (Nova Era, 19/Nov/2026: sem giro de 360°) ----------
     O desenho agora é de ilustração, bonito de frente; ela não dá mais a volta inteira. Um toque nela (ou no 👀) mostra
     a próxima vista: três-quartos e de lado, para um lado e para o outro, e volta de frente. O 🙂 volta de frente. */
  /* sem vistas de lado (dono, 20/Nov/2026: "não precisa olhar pro lado, porque não será 3D"): ela fica sempre de frente;
     o ângulo continua 0 (o desenho e a TV ainda sabem desenhar de lado, mas o jogo não usa) */
  var angulo = 0, angMandado = 0, girando = false;

  // ---------- botões do estúdio ----------
  $('btDesfazer').addEventListener('click', function () {
    var e = hist.voltar(); if (!e) return;
    estado = e; Som.tocar('desfazer'); aposMudar();
  });
  $('btSurpresa').addEventListener('click', function () {
    var novo = V.surpresa(estado); var d = desafioAtual(); if (d) novo.cenario = d.cenario;
    mudar(novo, null); Som.tocar('surpresa');
    var q = naTela(200, 360); faiscas(q[0], q[1], 16, ['✨', '🎲', '💖', '⭐']);
  });
  // 🔄 Reiniciar: tirar maquiagem, roupa e acessórios (a personagem continua) ou tudo do zero. Dá para desfazer (↩).
  $('btRecomecar').addEventListener('click', function () {
    var d = desafioAtual();
    function limpo(tudo) {
      var e = d ? baseDesafio(d) : V.novo();
      if (!tudo) ['personagem', 'pele', 'rosto', 'nariz', 'testa', 'formaOlho', 'distOlhos', 'formaBoca', 'cabelo', 'cabeloCor', 'mechas', 'mechasCor', 'olhos'].forEach(function (k) { e[k] = estado[k]; });
      else ['personagem', 'pele', 'rosto', 'nariz', 'testa', 'formaOlho', 'distOlhos', 'formaBoca', 'cabelo', 'cabeloCor', 'mechas', 'mechasCor', 'olhos'].forEach(function (k) { e[k] = P.PADRAO[k]; });
      e.cenario = d ? d.cenario : (tudo ? P.PADRAO.cenario : estado.cenario);
      mudar(e, null); Som.tocar('desfazer');
      recado(t('Pronto, começou de novo! ↩ desfaz.', 'Done, starting over! ↩ undoes.', '¡Listo, empiezas de nuevo! ↩ deshace.'));
    }
    abrirJanela({ titulo: t('🔄 Reiniciar', '🔄 Start over', '🔄 Reiniciar'), texto: t('O que você quer tirar?', 'What do you want to reset?', '¿Qué quieres quitar?'), botoes: [
      { t: t('🧼 Maquiagem, roupas e acessórios', '🧼 Makeup, clothes and accessories', '🧼 Maquillaje, ropa y accesorios'), classe: 'grande', fn: function () { limpo(false); } },
      { t: t('✨ Tudo do zero (personagem também)', '✨ Everything (character too)', '✨ Todo desde cero (el personaje también)'), fn: function () { limpo(true); } },
      { t: t('Cancelar', 'Cancel', 'Cancelar') }
    ] });
  });
  $('btGuardar').addEventListener('click', guardarLook);
  $('btGuardarDesfile').addEventListener('click', guardarLook);
  $('btFoto').addEventListener('click', foto);
  $('btFotoDesfile').addEventListener('click', foto);
  $('btDesfilar').addEventListener('click', desfilar);

  /* ---------- baladinha (dono, 20/Nov/2026, com vídeos de uma sala de luzes: "versão adicional de baladinha além do
     desfile… e com as amigas dançando") ----------
     A personagem dança no meio e 2 amigas dos lados: looks guardados (sorteados) e, faltando, combinações prontas.
     Cada uma com sombras coloridas na parede (balada.js). Tocar na tela troca a luz e todas fazem o mesmo passo. */
  var balada = null;
  function baladinha() {
    var amigas = ler('purpurinaNova.looks', []).map(function (l) { return V.limpar(l.e); }).filter(function (e) { return !V.iguais(e, estado); })
      .sort(function () { return Math.random() - 0.5; }).slice(0, 2);
    P.PRONTAS.slice().sort(function () { return Math.random() - 0.5; }).forEach(function (p) {
      var e = V.limpar(p.e); if (amigas.length < 2 && !V.iguais(e, estado)) amigas.push(e);
    });
    balada = PurpurinaBalada.iniciar($('palcoBalada'), [estado].concat(amigas), { calmo: CALMO, enquanto: function () { return atual === 'balada'; } });
    placaBalada();
  }
  /* placa de entrada (dono, 20/Nov/2026, com a foto de uma placa de balada infantil como inspiração): fundo roxo,
     letreiro brilhando, estrelinhas e a personagem pulando de braços abertos e piscando. Some sozinha ou num toque. */
  function placaBalada() {
    var velha = document.querySelector('.bal-placa'); if (velha) velha.remove();
    var pl = document.createElement('div'); pl.className = 'bal-placa'; pl.setAttribute('role', 'button');
    pl.setAttribute('aria-label', t('Baladinha da Purpurina — toque para começar', 'Purpurina’s Dance Party — tap to start', 'Minidisco de Purpurina — toca para empezar'));
    pl.innerHTML = '<span class="bal-estrela e1">✦</span><span class="bal-estrela e2">✦</span><span class="bal-estrela e3">✦</span><span class="bal-estrela e4">✦</span>' +
      '<p class="bal-letreiro"><span class="bal-l1">' + t('Baladinha', 'Dance Party', 'Minidisco') + '</span><span class="bal-l2">' + t('da Purpurina', 'with Purpurina', 'de Purpurina') + '</span></p>' +
      '<div class="bal-placa-boneca"><div class="bal-placa-pulo">' + B.svg(estado, { id: 'placa', fundo: false, anim: !CALMO, realce: false, rig: !CALMO, passos: !CALMO, sorriso: true, piscadinha: true }) + '</div></div>';
    $('balada').appendChild(pl);
    var anim = CALMO ? null : PurpurinaAnim.criar(pl.querySelector('.bal-placa-pulo'), { poses: ['abracao'], enquanto: function () { return pl.isConnected; } });
    function tirar() { if (!pl.isConnected) return; pl.classList.add('saindo'); if (anim) anim.parar(); setTimeout(function () { pl.remove(); }, 450); }
    pl.addEventListener('click', tirar);
    setTimeout(tirar, CALMO ? 1800 : 3200);
  }
  $('btBalada').addEventListener('click', function () { Som.tocar('brilho'); ir('balada'); });
  function trocarLuz() { if (balada) { balada.trocarLuz(); Som.tocar('brilho'); } }
  $('palcoBalada').addEventListener('click', trocarLuz);
  $('palcoBalada').addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); trocarLuz(); } });
  $('btBaladaVoltar').addEventListener('click', function () { Som.tocar('aba'); voltar(); });
  $('btBaladaDesfile').addEventListener('click', desfilar);

  // ---------- looks favoritos ----------
  function guardarLook() {
    var looks = ler('purpurinaNova.looks', []);
    if (looks.some(function (l) { return V.iguais(V.limpar(l.e), estado); })) { recado(t('Esse look já está guardado 💖', 'This look is already saved 💖', 'Este look ya está guardado 💖')); return; }
    if (looks.length >= MAX_LOOKS) { recado(t('Já tem ' + MAX_LOOKS + ' looks guardados. Apague um em 💖 Meus looks.', 'You already have ' + MAX_LOOKS + ' looks. Delete one in 💖 My looks.', 'Ya tienes ' + MAX_LOOKS + ' looks guardados. Borra uno en 💖 Mis looks.')); return; }
    looks.unshift({ id: Date.now(), quando: new Date().toISOString(), e: V.copiar(estado) });
    if (!gravar('purpurinaNova.looks', looks)) { recado(t('Não deu para guardar: o aparelho está sem espaço.', "Couldn't save: the device is out of space.", "No se ha podido guardar: el dispositivo no tiene espacio.")); return; }
    Som.tocar('coracao'); recado(t('Guardado em 💖 Meus looks!', 'Saved to 💖 My looks!', '¡Guardado en 💖 Mis looks!'));
    if (atual === 'estudio') { var q = naTela(200, 360); faiscas(q[0], q[1], 10, ['💖', '💕', '💗']); }
  }
  /* estilos prontos (pecas.js, ESTILOS): vestem a personagem do brincar livre com a produção inteira — roupa, maquiagem,
     acessórios, chapéu e cenário — e ela continua editando no estúdio. O corpo (pele, rosto, olhos, cabelo, idade) é dela.
     O que o estilo não diz fica sem nada (🚫); menino fica sem saia, vestido e maquiagem (o vestido vira camiseta). */
  var CORPO = ['pele', 'personagem', 'idade', 'rosto', 'nariz', 'testa', 'formaOlho', 'distOlhos', 'formaBoca', 'cabelo', 'cabeloCor', 'mechas', 'mechasCor', 'olhos', 'bigode'];
  var MAKE = ['base', 'blush', 'sombra', 'delineado', 'cilios', 'batom', 'glitter', 'adesivo', 'unhas'];
  function vestirEstilo(st, base) {
    var e = {};
    Object.keys(P.PADRAO).forEach(function (k) {
      if (CORPO.indexOf(k) >= 0) { e[k] = base[k]; return; }
      var cat = P.categoria(k);
      e[k] = cat && cat.opcoes && cat.opcoes.some(function (o) { return o.id === 'nenhum'; }) ? 'nenhum' : P.PADRAO[k];
    });
    Object.assign(e, st.e);
    if (e.personagem === 'menino') {
      if (e.vestido !== 'nenhum') { e.blusa = 'camiseta'; e.blusaCor = e.vestidoCor; e.vestido = 'nenhum'; }
      e.saia = 'nenhum'; if (e.calca === 'nenhum' || e.calca === 'legging') e.calca = st.id === 'praia' ? 'bermuda' : 'jeans';
      MAKE.forEach(function (k) { if (k !== 'unhas' || e.unhas !== 'nenhum') e[k] = 'nenhum'; });
      if (['scarpin', 'plataforma', 'princesa', 'ponta', 'salto'].indexOf(e.sapatos) >= 0) e.sapatos = 'social';
    }
    return V.limpar(e);
  }
  // cada cartão numa pose natural diferente (dono, 20/Nov/2026: "as poses são sempre as mesmas"), com o esqueleto
  var POSES_CARTAO = ['cintura', 'bolsos', 'queixo', 'relax', 'duasCintura', 'cruzados', 'olhaE'];
  function poseCartao(k) {
    var q = PurpurinaAnim.POSES[POSES_CARTAO[k % POSES_CARTAO.length]];
    return { oE: q.oE, cE: q.cE, fE: q.fE || 1, oD: q.oD, cD: q.cD, fD: q.fD || 1 };
  }
  function listaEstilos() {
    var caixa = $('listaEstilos'); caixa.innerHTML = '';
    P.ESTILOS.forEach(function (st, k) {
      var card = document.createElement('div'); card.className = 'look';
      var mini = document.createElement('div'); mini.className = 'mini-boneca';
      var e = vestirEstilo(st, livre);
      mini.innerHTML = B.svg(e, { id: 'estilo' + k, area: [0, 60, 400, 600], cortar: true, poseRig: poseCartao(k) });
      var nome = document.createElement('p'); nome.className = 'nome-pronta'; nome.textContent = st.ico + ' ' + N(st);
      var linha = document.createElement('div'); linha.className = 'linha';
      var vestir = document.createElement('button'); vestir.type = 'button'; vestir.textContent = t('✨ Vestir e editar', '✨ Wear and edit', '✨ Ponérmelo y editar');
      vestir.addEventListener('click', function () { hist.limpar(); livre = vestirEstilo(st, livre); gravar('purpurinaNova.atual', livre); Som.tocar('brilho'); comecar(null); });
      linha.appendChild(vestir); card.appendChild(mini); card.appendChild(nome); card.appendChild(linha); caixa.appendChild(card);
    });
  }
  // personagens prontas (pecas.js, PRONTAS): só vestir, não dá para apagar
  function listaProntas() {
    var caixa = $('listaProntas'); caixa.innerHTML = '';
    P.PRONTAS.forEach(function (pr, k) {
      var card = document.createElement('div'); card.className = 'look';
      var mini = document.createElement('div'); mini.className = 'mini-boneca';
      var e = V.limpar(Object.assign({}, P.PADRAO, pr.e));
      mini.innerHTML = B.svg(e, { id: 'pronta' + k, area: [0, 60, 400, 600], cortar: true, poseRig: poseCartao(k + 3) });
      var nome = document.createElement('p'); nome.className = 'nome-pronta'; nome.textContent = pr.ico + ' ' + N(pr);
      var linha = document.createElement('div'); linha.className = 'linha';
      var vestir = document.createElement('button'); vestir.type = 'button'; vestir.textContent = pr.e.personagem === 'menino' ? t('✨ Brincar com ele', '✨ Play with him', '✨ Jugar con él') : t('✨ Brincar com ela', '✨ Play with her', '✨ Jugar con ella');
      vestir.addEventListener('click', function () { livre = e; gravar('purpurinaNova.atual', livre); Som.tocar('brilho'); comecar(null); });
      linha.appendChild(vestir); card.appendChild(mini); card.appendChild(nome); card.appendChild(linha); caixa.appendChild(card);
    });
  }
  function listaLooks() {
    listaEstilos();
    listaProntas();
    var looks = ler('purpurinaNova.looks', []), caixa = $('listaLooks'); caixa.innerHTML = '';
    $('semLooks').hidden = looks.length > 0;
    looks.forEach(function (l, k) {
      var card = document.createElement('div'); card.className = 'look';
      var mini = document.createElement('div'); mini.className = 'mini-boneca';
      mini.innerHTML = B.svg(V.limpar(l.e), { id: 'look' + k, area: [0, 60, 400, 600], cortar: true, poseRig: poseCartao(k + 1) });
      var linha = document.createElement('div'); linha.className = 'linha';
      var vestir = document.createElement('button'); vestir.type = 'button'; vestir.textContent = t('👗 Vestir', '👗 Wear', '👗 Ponérmelo');
      vestir.addEventListener('click', function () { livre = V.limpar(l.e); gravar('purpurinaNova.atual', livre); Som.tocar('brilho'); comecar(null); });
      var apagar = document.createElement('button'); apagar.type = 'button'; apagar.textContent = '🗑'; apagar.setAttribute('aria-label', t('Apagar este look', 'Delete this look', 'Borrar este look'));
      apagar.addEventListener('click', function () {
        abrirJanela({ titulo: t('Apagar este look?', 'Delete this look?', '¿Borrar este look?'), texto: t('Ele sai dos seus looks guardados.', 'It will be removed from your saved looks.', 'Va a salir de tus looks guardados.'), botoes: [
          { t: t('🗑 Apagar', '🗑 Delete', '🗑 Borrar'), classe: 'grande', fn: function () { var ls = ler('purpurinaNova.looks', []).filter(function (x) { return x.id !== l.id; }); gravar('purpurinaNova.looks', ls); listaLooks(); } },
          { t: t('Não, deixa', 'No, keep it', 'No, déjalo') }
        ] });
      });
      linha.appendChild(vestir); linha.appendChild(apagar); card.appendChild(mini); card.appendChild(linha); caixa.appendChild(card);
    });
  }

  // ---------- foto do visual ----------
  function carimbo() { var d = new Date(), z = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + '-' + z(d.getHours()) + 'h' + z(d.getMinutes()); }
  /* ---------- foto de estúdio (renderizada) ----------
     Monta a foto em camadas, como uma câmera de verdade: o cenário bem desfocado atrás (profundidade), a personagem
     nítida com sombra macia, luz de estúdio, um brilho suave em volta (o glitter brilha), granulado fino de câmera e
     cantos levemente escuros. Navegador sem filtro de canvas (Safari antigo): sai sem o desfoque, mas sai. */
  function imagemDe(svg) {
    return new Promise(function (ok, erro) { var img = new Image(); img.onload = function () { ok(img); }; img.onerror = erro; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
  }
  var graoCache = null;
  function grao() {
    if (graoCache) return graoCache;
    var g = document.createElement('canvas'); g.width = g.height = 160; var gc = g.getContext('2d'), d = gc.createImageData(160, 160);
    for (var i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 22; }
    gc.putImageData(d, 0, 0); graoCache = g; return g;
  }
  // desfoque rápido: desenha pequeno (com um desfoque leve) e amplia — ampliar já espalha, e fica muito mais leve
  function borrado(img, W, H, fator, raio) {
    var p = document.createElement('canvas'); p.width = Math.max(1, Math.round(W / fator)); p.height = Math.max(1, Math.round(H / fator));
    var pc = p.getContext('2d'); if ('filter' in pc) pc.filter = 'blur(' + raio + 'px)'; pc.drawImage(img, 0, 0, p.width, p.height); return p;
  }
  function comporEstudio(c, W, H, fundo, boneca) {
    var temFiltro = 'filter' in c;
    c.save(); c.imageSmoothingQuality = 'high'; c.drawImage(borrado(fundo, W, H, 6, 1.6), -W * 0.03, -H * 0.03, W * 1.06, H * 1.06); c.restore();
    var luz = c.createRadialGradient(W * 0.38, H * 0.25, W * 0.05, W * 0.5, H * 0.45, H * 0.8); luz.addColorStop(0, 'rgba(255,246,225,0.30)'); luz.addColorStop(0.5, 'rgba(255,255,255,0)'); luz.addColorStop(1, 'rgba(30,8,50,0.38)');
    c.fillStyle = luz; c.fillRect(0, 0, W, H);
    c.save(); c.shadowColor = 'rgba(40,10,60,0.45)'; c.shadowBlur = W / 22; c.shadowOffsetX = W / 120; c.shadowOffsetY = W / 60; c.drawImage(boneca, 0, 0, W, H); c.restore();
    if (temFiltro) { c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = 0.22; c.drawImage(borrado(boneca, W, H, 8, 2), 0, 0, W, H); c.restore(); }
    c.save(); c.globalCompositeOperation = 'overlay'; c.fillStyle = c.createPattern(grao(), 'repeat'); c.fillRect(0, 0, W, H); c.restore();
    var v = c.createRadialGradient(W / 2, H * 0.48, H * 0.32, W / 2, H * 0.5, H * 0.78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,4,36,0.35)');
    c.fillStyle = v; c.fillRect(0, 0, W, H);
  }
  function fazerFoto() {
    var Wf = 1080, Hf = 1944, faixa = 150;
    var fonte = document.fonts && document.fonts.load ? document.fonts.load('700 56px Fredoka').catch(function () {}) : Promise.resolve();
    return fonte.then(function () {
      return Promise.all([imagemDe(B.svg(estado, { id: 'fotoF', soFundo: true, largura: Wf, altura: Hf })), imagemDe(B.svg(estado, { id: 'fotoB', fundo: false, realce: false, largura: Wf, altura: Hf }))]);
    }).then(function (imgs) {
      return new Promise(function (ok, erro) {
        var cv = document.createElement('canvas'); cv.width = Wf; cv.height = Hf + faixa;
        var c = cv.getContext('2d');
        comporEstudio(c, Wf, Hf, imgs[0], imgs[1]);
        var g = c.createLinearGradient(0, Hf, Wf, Hf + faixa); g.addColorStop(0, '#ff5fb4'); g.addColorStop(1, '#8a4fe0');
        c.fillStyle = g; c.fillRect(0, Hf, Wf, faixa);
        c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 72px Fredoka, sans-serif';
        var d = desafioAtual();
        c.fillText('✨ Purpurina ✨', Wf / 2, Hf + 58);
        c.font = '500 38px Fredoka, sans-serif';
        c.fillText(d ? N(d) : t('Meu visual', 'My look', 'Mi look'), Wf / 2, Hf + 118);
        cv.toBlob(function (b) { if (b) ok(b); else erro(new Error('sem imagem')); }, 'image/png');
      });
    });
  }
  function foto() {
    Som.tocar('foto');
    abrirJanela({ titulo: t('📸 Preparando a foto…', '📸 Getting the photo ready…', '📸 Preparando la foto…'), botoes: [] });
    var flash = document.createElement('div'); flash.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:70;opacity:.9;transition:opacity .4s;pointer-events:none';
    document.body.appendChild(flash); setTimeout(function () { flash.style.opacity = '0'; setTimeout(function () { flash.remove(); }, 450); }, 60);
    fazerFoto().then(function (blob) {
      var url = URL.createObjectURL(blob), nome = 'purpurina-' + carimbo() + '.png';
      var arquivo = null; try { arquivo = new File([blob], nome, { type: 'image/png' }); } catch (e) { /* navegador antigo */ }
      var podeCompartilhar = !!(arquivo && navigator.canShare && navigator.canShare({ files: [arquivo] }));
      var botoes = [{ t: t('💾 Salvar no celular', '💾 Save to device', '💾 Guardar en el móvil'), classe: 'grande', ficar: true, fn: function () {
        var a = document.createElement('a'); a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
        recado(t('A foto foi para a pasta Downloads (ou Arquivos).', 'The photo went to your Downloads (or Files).', 'La foto se ha guardado en la carpeta Descargas (o Archivos).'));
      } }];
      if (podeCompartilhar) botoes.push({ t: t('📤 Compartilhar', '📤 Share', '📤 Compartir'), ficar: true, fn: function () { navigator.share({ files: [arquivo], title: 'Purpurina' }).catch(function () { /* cancelou */ }); } });
      if (VIDEO_OK) botoes.push({ t: t('🎬 Vídeo girando', '🎬 Spinning video', '🎬 Vídeo girando'), ficar: true, fn: video });
      if (iaLigada()) botoes.push({ t: t('✨ Foto de cinema (IA)', '✨ Movie-style photo (AI)', '✨ Foto de cine (IA)'), fn: fotoIA });
      botoes.push({ t: t('Fechar', 'Close', 'Cerrar') });
      abrirJanela({ titulo: t('📸 Que foto linda!', '📸 What a lovely photo!', '📸 ¡Qué foto tan bonita!'), img: url, alt: V.resumo(estado, lingua), botoes: botoes }, true);
    }).catch(function () { abrirJanela({ titulo: t('📸 Foto', '📸 Photo', '📸 Foto'), texto: t('Não deu para tirar a foto agora. Tente de novo.', "Couldn't take the photo now. Try again.", "No se ha podido hacer la foto ahora. Inténtalo otra vez."), botoes: [{ t: t('Fechar', 'Close', 'Cerrar') }] }, true); });
  }

  /* ---------- ✨ foto de cinema com IA (escondida: ver ia-foto.js) ----------
     Para a IA vai só o desenho (personagem + cenário, 832×1248) e uma descrição em inglês do visual. */
  function iaLigada() { return !EM_ARQUIVO && !!(window.PurpurinaIA && window.SolverCofre && window.SolverJanela && PurpurinaIA.ligada()); }
  function imagemParaIA() {
    var W2 = 832, H2 = 1248;
    return Promise.all([imagemDe(B.svg(estado, { id: 'iaF', soFundo: true, largura: W2, altura: H2 })), imagemDe(B.svg(estado, { id: 'iaB', fundo: false, realce: false, largura: W2, altura: H2 }))])
      .then(function (imgs) {
        return new Promise(function (ok, erro) {
          var cv = document.createElement('canvas'); cv.width = W2; cv.height = H2;
          comporEstudio(cv.getContext('2d'), W2, H2, imgs[0], imgs[1]);
          cv.toBlob(function (b) { if (b) ok(b); else erro(new Error('sem imagem')); }, 'image/png');
        });
      });
  }
  function mostrarFotoIA(blob) {
    var url = URL.createObjectURL(blob), nome = 'purpurina-cinema-' + carimbo() + '.png';
    var arquivo = null; try { arquivo = new File([blob], nome, { type: blob.type || 'image/png' }); } catch (e) { /* navegador antigo */ }
    var botoes = [{ t: t('💾 Salvar no celular', '💾 Save to device', '💾 Guardar en el móvil'), classe: 'grande', ficar: true, fn: function () {
      var a = document.createElement('a'); a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
      recado(t('A foto foi para a pasta Downloads (ou Arquivos).', 'The photo went to your Downloads (or Files).', 'La foto se ha guardado en la carpeta Descargas (o Archivos).'));
    } }];
    if (arquivo && navigator.canShare && navigator.canShare({ files: [arquivo] })) botoes.push({ t: t('📤 Compartilhar', '📤 Share', '📤 Compartir'), ficar: true, fn: function () { navigator.share({ files: [arquivo], title: 'Purpurina' }).catch(function () { /* cancelou */ }); } });
    botoes.push({ t: t('✨ Fazer outra', '✨ Make another', '✨ Hacer otra'), fn: fotoIA }, { t: t('Fechar', 'Close', 'Cerrar') });
    Som.tocar('tada');
    abrirJanela({ titulo: t('✨ Foto de cinema!', '✨ Movie-style photo!', '✨ ¡Foto de cine!'), texto: t('Feita por IA a partir do seu desenho.', 'Made by AI from your drawing.', 'Hecha por IA a partir de tu dibujo.'), img: url, alt: V.resumo(estado, lingua), botoes: botoes });
  }
  function fotoIA() {
    PurpurinaIA.abrir({ t: t, imagem: imagemParaIA, descricao: function () { return V.resumo(estado, 'en'); }, mostrarFoto: mostrarFotoIA, recado: recado });
  }

  /* ---------- vídeo da personagem ----------
     Desenha 48 quadros (ela vira de três-quartos para um lado e para o outro, sem dar a volta) num canvas e grava com o MediaRecorder do próprio navegador: duas vezes e
     uma paradinha de frente, uns 4 segundos. Tudo no aparelho; nada vai para a internet. MP4 quando o navegador
     sabe gravar (melhor para o WhatsApp), senão WebM. */
  var VIDEO_OK = !!(window.MediaRecorder && window.HTMLCanvasElement && HTMLCanvasElement.prototype.captureStream);
  function tipoVideo() {
    var l = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    for (var i = 0; i < l.length; i++) if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(l[i])) return l[i];
    return '';
  }
  function fazerVideo(andamento) {
    var Wv = 540, Hv = 972, faixa = 76, QUADROS = 48, e = V.copiar(estado), imgs = [], d = desafioAtual();
    function carregar(i) { return imagemDe(B.svg(e, { id: 'v' + i, fundo: false, realce: false, largura: Wv, altura: Hv, poseRig: (function (q) { return { oE: 8, cE: 14, oD: 8 + 42 * q, cD: 12 + 108 * q }; })((1 - Math.cos(i * 2 * Math.PI / QUADROS)) / 2) })); }
    var fundoImg = null, cadeia = imagemDe(B.svg(e, { id: 'vF', soFundo: true, largura: Wv, altura: Hv })).then(function (img) { fundoImg = img; });
    for (var i = 0; i < QUADROS; i++) (function (k) { cadeia = cadeia.then(function () { return carregar(k); }).then(function (img) { imgs[k] = img; andamento(Math.round((k + 1) / QUADROS * 70)); }); })(i);
    return cadeia.then(function () {
      return new Promise(function (ok, erro) {
        var cv = document.createElement('canvas'); cv.width = Wv; cv.height = Hv + faixa;
        var c = cv.getContext('2d'), mime = tipoVideo(), partes = [];
        var rec = new MediaRecorder(cv.captureStream(30), mime ? { mimeType: mime, videoBitsPerSecond: 2500000 } : undefined);
        rec.ondataavailable = function (ev) { if (ev.data && ev.data.size) partes.push(ev.data); };
        rec.onstop = function () { var tipo = (rec.mimeType || mime || 'video/webm').split(';')[0]; ok({ blob: new Blob(partes, { type: tipo }), ext: tipo.indexOf('mp4') >= 0 ? 'mp4' : 'webm', tipo: tipo }); };
        rec.onerror = erro;
        function quadro(k) {
          comporEstudio(c, Wv, Hv, fundoImg, imgs[k % QUADROS]);
          var g = c.createLinearGradient(0, Hv, Wv, Hv + faixa); g.addColorStop(0, '#ff5fb4'); g.addColorStop(1, '#8a4fe0');
          c.fillStyle = g; c.fillRect(0, Hv, Wv, faixa);
          c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 34px Fredoka, sans-serif';
          c.fillText('✨ Purpurina ✨' + (d ? '  ' + d.ico : ''), Wv / 2, Hv + faixa / 2);
        }
        quadro(0); rec.start(200);
        var total = QUADROS * 2 + 24, k = 0;
        var tempo = setInterval(function () {
          quadro(k < QUADROS * 2 ? k : 0); k++; andamento(70 + Math.round(k / total * 30));
          if (k >= total) { clearInterval(tempo); setTimeout(function () { rec.stop(); }, 150); }
        }, 1000 / 30);
      });
    });
  }
  function video() {
    abrirJanela({ titulo: t('🎬 Preparando o vídeo…', '🎬 Making the video…', '🎬 Preparando el vídeo…'), texto: '0%', botoes: [] }, true);
    fazerVideo(function (pct) { $('janelaTexto').textContent = pct + '%'; }).then(function (r) {
      var url = URL.createObjectURL(r.blob), nome = 'purpurina-giro-' + carimbo() + '.' + r.ext, arq = null;
      try { arq = new File([r.blob], nome, { type: r.tipo }); } catch (x) { /* navegador antigo */ }
      var botoes = [{ t: t('💾 Salvar o vídeo', '💾 Save the video', '💾 Guardar el vídeo'), classe: 'grande', ficar: true, fn: function () {
        var a = document.createElement('a'); a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
        recado(t('O vídeo foi para a pasta Downloads (ou Arquivos).', 'The video went to your Downloads (or Files).', 'El vídeo se ha guardado en la carpeta Descargas (o Archivos).'));
      } }];
      if (arq && navigator.canShare && navigator.canShare({ files: [arq] })) botoes.push({ t: t('📤 Compartilhar', '📤 Share', '📤 Compartir'), ficar: true, fn: function () { navigator.share({ files: [arq], title: 'Purpurina' }).catch(function () { /* cancelou */ }); } });
      botoes.push({ t: t('Fechar', 'Close', 'Cerrar') });
      abrirJanela({ titulo: t('🎬 Seu vídeo girando!', '🎬 Your spinning video!', '🎬 ¡Tu vídeo girando!'), video: url, botoes: botoes }, true);
      Som.tocar('tada');
    }).catch(function () {
      abrirJanela({ titulo: t('🎬 Vídeo', '🎬 Video', '🎬 Vídeo'), texto: t('Este navegador não conseguiu gravar o vídeo. A foto continua funcionando.', "This browser couldn't record the video. Photos still work.", "Este navegador no ha podido grabar el vídeo. La foto sigue funcionando."), botoes: [{ t: t('Fechar', 'Close', 'Cerrar') }] }, true);
    });
  }

  /* ---------- GIF do desfile e da Baladinha (dono, 22/Nov/2026: "gerar um GIF… e compartilhar, por exemplo
     WhatsApp") ----------
     Grava a cena que está na tela (gif.js), monta o GIF no próprio aparelho e abre com Compartilhar (WhatsApp e os outros
     apps do celular) e Salvar. No desfile ela entra de novo pela passarela enquanto grava; na Baladinha, grava a dança. */
  var gravandoGif = false;
  function gifDe(palco, ms, nome) {
    if (gravandoGif || !window.PurpurinaGif) return;
    gravandoGif = true; Som.tocar('clique');
    recado(t('🔴 Gravando o GIF…', '🔴 Recording the GIF…', '🔴 Grabando el GIF…'));
    PurpurinaGif.gravar(palco, { ms: ms, fps: 10, largura: 360, andamento: function (p) {
      if (p >= 0.4 && $('janela').hidden) abrirJanela({ titulo: t('🎞️ Preparando o GIF…', '🎞️ Making the GIF…', '🎞️ Preparando el GIF…'), texto: '0%', botoes: [] }, true);
      if (p >= 0.4) $('janelaTexto').textContent = Math.round((p - 0.4) / 0.6 * 100) + '%';
    } }).then(function (blob) {
      gravandoGif = false;
      var url = URL.createObjectURL(blob), arq = null, nomeArq = 'purpurina-' + nome + '-' + carimbo() + '.gif';
      try { arq = new File([blob], nomeArq, { type: 'image/gif' }); } catch (x) { /* navegador antigo */ }
      var botoes = [];
      if (arq && navigator.canShare && navigator.canShare({ files: [arq] })) botoes.push({ t: t('📤 Compartilhar', '📤 Share', '📤 Compartir'), classe: 'grande', ficar: true, fn: function () { navigator.share({ files: [arq], title: 'Purpurina' }).catch(function () { /* cancelou */ }); } });
      botoes.push({ t: t('💾 Salvar o GIF', '💾 Save the GIF', '💾 Guardar el GIF'), classe: botoes.length ? 'medio' : 'grande', ficar: true, fn: function () {
        var a = document.createElement('a'); a.href = url; a.download = nomeArq; document.body.appendChild(a); a.click(); a.remove();
        recado(t('O GIF foi para a pasta Downloads (ou Arquivos).', 'The GIF went to your Downloads (or Files).', 'El GIF se ha guardado en la carpeta Descargas (o Archivos).'));
      } });
      botoes.push({ t: t('Fechar', 'Close', 'Cerrar') });
      abrirJanela({ titulo: t('🎞️ Seu GIF!', '🎞️ Your GIF!', '🎞️ ¡Tu GIF!'), img: url, alt: 'GIF', botoes: botoes }, true);
      Som.tocar('tada');
    }).catch(function () {
      gravandoGif = false;
      abrirJanela({ titulo: '🎞️ GIF', texto: t('Este navegador não conseguiu fazer o GIF. A foto continua funcionando.', "This browser couldn't make the GIF. Photos still work.", 'Este navegador no ha podido hacer el GIF. La foto sigue funcionando.'), botoes: [{ t: t('Fechar', 'Close', 'Cerrar') }] }, true);
    });
  }
  $('btGifDesfile').addEventListener('click', function () { if (gravandoGif) return; desfilar(); setTimeout(function () { gifDe($('palcoDesfile'), 5400, 'desfile'); }, 150); });
  $('btGifBalada').addEventListener('click', function () { gifDe($('palcoBalada'), 3200, 'baladinha'); });

  // ---------- desfile ----------
  var FRASES = {
    3: [['Arrasou!', 'Amazing!', '¡Lo has bordado!'], ['Perfeito!', 'Perfect!', '¡Perfecto!'], ['Uau, que brilho!', 'Wow, so sparkly!', '¡Hala, cuánto brillo!']],
    2: [['Que lindo!', 'So pretty!', '¡Qué bonito!'], ['Muito estilo!', 'Great style!', '¡Mucho estilo!'], ['Quase 3!', 'Almost 3!', '¡Casi 3!']],
    1: [['Que fofo!', 'So cute!', '¡Qué mono!'], ['Gostei!', 'I like it!', '¡Me gusta!'], ['Veja as dicas!', 'Check the tips!', '¡Mira las pistas!']],
    0: [['Lindo!', 'Gorgeous!', '¡Precioso!'], ['Que estilo!', 'What style!', '¡Qué estilo!'], ['Brilhou!', 'You shine!', '¡Has brillado!']]
  };
  var JURADOS = ['🐱', '🦄', '🐰'];
  /* ---------- o desfile ----------
     Passarela de show (boneca.js → passarela): a personagem entra lá do fundo e vem andando, rebolando, até a
     frente; para, sorri e dá tchauzinho; olha para um lado e para o outro; vira de três-quartos para um lado e para o outro; e
     fica posando, sorrindo e acenando de vez em quando. Fogos de artifício e flashes da plateia o tempo todo.
     As estrelas e os jurados aparecem quando ela chega na frente. Quem pediu menos movimento vê ela parada,
     sorrindo, sem fogos. */
  var desfileSeq = 0, desfileK = 1, desfileLugar = null;
  window.addEventListener('resize', function () { if (atual === 'desfile' && desfileLugar) desfileLugar(desfileK); });
  function desfilar() {
    var d = desafioAtual(), r = d ? V.avaliar(estado, d) : null;
    ir('desfile');
    var seq = ++desfileSeq, pas = $('passarela'), mod = $('modelo'), palco = $('palcoDesfile');
    $('cenaDesfile').innerHTML = B.passarela('pas') + B.tetoShow();   // teto com refletores: camada presa no alto
    function vale() { return seq === desfileSeq && atual === 'desfile'; }
    function depois(ms, fn) { setTimeout(function () { if (vale()) fn(); }, ms); }
    function pose(op) { pas.innerHTML = B.svg(estado, Object.assign({ id: 'desfile', fundo: false, anim: !CALMO, realce: false, passos: true }, op || {})); }   // passos: as pernas andam enquanto ela anda (estilo.css)
    // posição na passarela: k = 0 (lá no fundo) até 1 (na frente); a cena é cortada por baixo (slice), como no boneca.js
    function lugar(k) { desfileK = k; desfileLugar = lugar; lugarDe(mod, k, 0, ALTURA); }
    // k: 0 (lá no fundo) até 1 (na frente); lado: deslocamento para o lado, em fração da largura (a turma fica dos lados)
    function lugarDe(el, k, lado, altura) {
      var W = palco.clientWidth, H = palco.clientHeight, s = Math.max(W / 400, H / 720), h = el.clientHeight;
      var longe = Math.min(290 * s, H * 0.55), perto = 26 * s, escala = (0.24 + 0.76 * k) * altura, pe = longe + (perto - longe) * k;
      el.style.transform = 'translateX(calc(-50% + ' + Math.round(lado * W) + 'px)) translateY(' + Math.round(-(pe - 0.09 * h * escala)) + 'px) scale(' + escala.toFixed(3) + ')';
    }
    /* desfile com a turma (dono, 15/Nov/2026: "pegar todos os que estão salvos na galeria e fazer um desfile mútuo com o
       principal"): depois da voltinha, até 4 looks guardados entram lá do fundo, um depois do outro, andando, e ficam
       posando dos lados, atrás da personagem principal, que continua na frente */
    function limparTurma() { Array.prototype.forEach.call(document.querySelectorAll('#cameraDesfile .figurante'), function (x) { x.remove(); }); }
    function entrarTurma() {
      var LADOS = [-0.3, 0.3, -0.16, 0.16], ALT = { pequena: 0.8, crianca: 0.9, adolescente: 0.96 };
      ler('purpurinaNova.looks', []).map(function (l) { return V.limpar(l.e); }).filter(function (e) { return !V.iguais(e, estado); }).slice(0, 4).forEach(function (e, i) {
        depois(i * 900, function () {
          var f = document.createElement('div'), alt = ALT[e.idade] || 1, menino2 = e.personagem === 'menino';
          f.className = 'modelo figurante idade-' + (e.idade || 'adulta');
          f.innerHTML = '<div class="passarela-boneca">' + B.svg(e, { id: 'fig' + i, fundo: false, anim: false, realce: false, passos: true, rig: !CALMO, sorriso: true }) + '</div>';
          // a amiga também entra andando de modelo (andar do animador.js) e depois troca de pose sem trocar de "foto"
          var animF = CALMO ? null : PurpurinaAnim.criar(f.firstChild, { poses: ['relax'], enquanto: vale, modo: 'andar', passoMs: PASSO_MS[e.idade] || 980 });
          $('cameraDesfile').insertBefore(f, mod);
          var POSES_F = menino2 ? ['cruzados', 'bolsos', 'joinha'] : ['cintura', 'duasCintura', 'maoCabelo', 'carinha'];
          function posarF() {
            var pz = POSES_F[Math.floor(Math.random() * POSES_F.length)];
            if (animF) { animF.modo(''); animF.trocar(NOME_RIG[pz] || 'relax'); return; }
            f.classList.remove('ginga-esq', 'ginga-dir'); f.classList.add(pz === 'cintura' ? 'ginga-dir' : pz === 'maoCabelo' ? 'ginga-esq' : (Math.random() < 0.5 ? 'ginga-esq' : 'ginga-dir'));
            f.firstChild.innerHTML = B.svg(e, { id: 'fig' + i, fundo: false, anim: false, realce: false, passos: true, sorriso: true, pose: pz });
          }
          function trocarF() { depois(3400 + i * 500, function () { posarF(); trocarF(); }); }
          if (CALMO) { lugarDe(f, 0.42, LADOS[i], alt); posarF(); return; }
          var ini = performance.now(), dur = 2600;
          (function andar(agora) {
            if (!vale()) return;
            var k = Math.min(1, (agora - ini) / dur), e2 = 1 - Math.pow(1 - k, 1.5);
            lugarDe(f, 0.42 * e2, LADOS[i] * e2, alt);
            if (k < 1) requestAnimationFrame(andar); else { posarF(); trocarF(); }
          })(ini);
        });
      });
    }
    limparTurma();
    // poses do fim da passarela, sorteadas sem repetir a anterior (boneca.js, opcoes.pose); lado = para onde inclina
    // e conforme a idade (dono, 14/Nov/2026): até 5 anos, poses de criancinha (tchau, mãos na cintura) sem inclinar; 6 a
    // 10, de criança; 11 a 15 e 16+, de modelo (menina: mão na cintura, no cabelo; menino: braços cruzados, mãos no bolso)
    var idade = estado.idade || 'adulta', menino = estado.personagem === 'menino';
    // Nova Era: o corpo novo já tem a altura de cada idade (a criancinha é mais baixa no próprio desenho); 0,8 deixa ela
    // inteira na tela quando chega na frente (dono, 20/Nov/2026: "sai do quadro")
    var ALTURA = 0.8;
    var PASSO_MS = { pequena: 800, crianca: 1000, adolescente: 1150, adulta: 1250 };   // dois passos, sem pressa (vídeo de referência do dono); mais rápido nas pequenas
    $('modelo').className = 'modelo idade-' + idade;
    var POSES_DESFILE = ({
      pequena: menino ? [{ tchau: true, lado: '' }, { pose: 'duasCintura', lado: '' }, { pose: 'joinha', lado: '' }] : [{ tchau: true, lado: '' }, { pose: 'duasCintura', lado: '' }, { pose: 'carinha', lado: '' }],
      crianca: menino ? [{ tchau: true, lado: '' }, { pose: 'duasCintura', lado: '' }, { pose: 'bolsos', lado: '' }, { pose: 'joinha', lado: '' }] : [{ tchau: true, lado: '' }, { pose: 'duasCintura', lado: '' }, { pose: 'cintura', lado: '' }, { pose: 'carinha', lado: '' }, { pose: 'maosCabeca', lado: '' }],
      adolescente: menino ? [{ pose: 'cruzados', lado: '' }, { pose: 'bolsos', lado: 'dir' }, { pose: 'joinha', lado: '' }, { tchau: true, lado: '' }] : [{ pose: 'cintura', lado: 'esq' }, { pose: 'duasCintura', lado: '' }, { pose: 'maoCabelo', lado: '' }, { pose: 'carinha', lado: '' }, { pose: 'maosCabeca', lado: '' }, { tchau: true, lado: '' }]
    })[idade] || (menino ? [{ pose: 'cruzados', lado: 'esq' }, { pose: 'bolsos', lado: 'dir' }, { pose: 'cruzados', lado: 'dir' }, { pose: 'bolsos', lado: '' }] :
      [{ pose: 'cintura', lado: 'esq' }, { pose: 'duasCintura', lado: 'dir' }, { pose: 'maoCabelo', lado: 'esq' }, { pose: 'beijo', lado: '' }, { pose: 'carinha', lado: '' }, { pose: 'joinha', lado: '' }, { tchau: true, lado: '' }]);
    var poseAtual = POSES_DESFILE[0];
    function sortear() { var l = POSES_DESFILE.filter(function (x) { return x !== poseAtual; }); return l[Math.floor(Math.random() * l.length)]; }
    function opPose(x) { return x.tchau ? { tchau: true } : { pose: x.pose }; }
    function semPose() { mod.classList.remove('pose-esq', 'pose-dir', 'ginga-esq', 'ginga-dir', 'perna-cruzada', 'perna-aberta'); }
    /* poses com movimento (dono, 20/Nov/2026): a personagem é desenhada uma vez com o esqueleto e o animador.js leva
       braços, cabeça, olhos e pernas de uma pose para a outra, aos poucos (sem trocar de "foto") */
    var NOME_RIG = { cintura: 'cintura', duasCintura: 'duasCintura', maoCabelo: 'cabeca', maosCabeca: 'cabeca', carinha: 'queixo', joinha: 'apontar', cruzados: 'cruzados', bolsos: 'bolsos', beijo: 'beijo' };
    var animD = null;
    function posar(x) {
      poseAtual = x; semPose();
      if (CALMO) { pose(Object.assign({ sorriso: true }, opPose(x))); return; }
      if (!pas.querySelector('.rig-ombro-e')) pose({ sorriso: true, rig: true });
      if (!animD) animD = PurpurinaAnim.criar(pas, { poses: ['relax'], enquanto: vale });
      animD.trocar(x.tchau ? 'tchau' : (NOME_RIG[x.pose] || 'relax'));
    }
    var camera = $('cameraDesfile'), corte = $('corteDesfile');
    camera.style.transform = '';
    function cortar(take) {
      corte.classList.remove('flash'); void corte.offsetWidth; corte.classList.add('flash');
      // de perto: a câmera enquadra do rosto até a cintura (antes cortava, só aparecia a cabeça)
      if (take === 'perto') {
        var z = B.areaZoom(P.ZOOM.busto, estado), rm = mod.getBoundingClientRect(), rc = camera.getBoundingClientRect();
        var px = rm.left + rm.width * (z[0] + z[2] / 2) / 400 - rc.left, py = rm.top + rm.height * (z[1] + z[3] * 0.35) / 720 - rc.top;
        camera.style.transformOrigin = px + 'px ' + py + 'px';
        camera.style.transform = 'translate(' + Math.round(rc.width / 2 - px) + 'px, ' + Math.round(rc.height * 0.42 - py) + 'px) scale(1.7)';
      } else camera.style.transform = '';
      posar(sortear());
    }
    var titulo = $('desfileTitulo'), jur = $('jurados');
    if (CALMO) { lugar(1); posar(POSES_DESFILE[0]); entrarTurma(); }
    else {
      titulo.classList.add('esperando'); jur.classList.add('esperando');
      // andar de modelo (dono, 20/Nov/2026: "desfile realista"): o esqueleto anda — pé cruzando na linha do meio, quadril
      // para o lado da perna de apoio, braços soltos e cabeça firme (animador.js, modo 'andar'), sem o andar de CSS
      lugar(0); pose({ rig: true });
      animD = PurpurinaAnim.criar(pas, { poses: ['relax'], enquanto: vale, modo: 'andar', passoMs: PASSO_MS[idade] || 980 });
      fogos(seq, 9000);
      // anda um número inteiro de passadas, em velocidade constante (o corpo avança no mesmo ritmo dos passos, sem
      // escorregar); só a primeira e a última passada aceleram e freiam de leve
      var ini = performance.now(), passada = PASSO_MS[idade] || 980, dur = Math.max(2, Math.round(3600 / passada)) * passada;
      (function andar(agora) {
        if (!vale()) return;
        var k = Math.min(1, (agora - ini) / dur), b0 = 0.12, e = k < b0 ? k * k / (2 * b0 * (1 - b0)) : k > 1 - b0 ? 1 - (1 - k) * (1 - k) / (2 * b0 * (1 - b0)) : (k - b0 / 2) / (1 - b0);
        lugar(e);
        if (k < 1) requestAnimationFrame(andar);
        else {
          // chegou na frente (dono, 14/Nov/2026, com fotos de referência): para numa pose sorteada — menina: mão na
          // cintura, as duas mãos na cintura, mão no cabelo ou tchauzinho; menino: braços cruzados ou mãos nos bolsos — com a
          // "inclinadinha"; olha para um lado e para o outro e fica trocando de pose, sorteada, de tempos em tempos
          // (Nova Era: sempre de frente, sem vistas de lado)
          // chegou: para numa pose de modelo, sorrindo (o esqueleto sai do andar devagar, sem pulo)
          pose({ sorriso: true, rig: true }); if (animD) animD.modo(''); posar(sortear());
          titulo.classList.remove('esperando'); jur.classList.remove('esperando');
          Som.tocar('tada'); setTimeout(function () { Som.tocar('aplausos'); }, 400); confete();
          depois(1600, function () { posar(sortear()); depois(1400, function () { posar(sortear()); depois(1400, function () { posar(poseAtual);   /* sempre olhando para a frente, para a plateia (dono, 20/Nov/2026: "nem no desfile") */ depois(900, function () {
            depois(500, function () {
              semPose();
              (function () {
                  if (!vale()) return;
                  posar(sortear()); entrarTurma();
                  // takes: de 3 em 3 s um corte — corpo inteiro numa pose nova ou de perto (sempre de frente)
                  var takeAntes = 'inteira';
                  (function trocar() { depois(3200, function () {
                    var opcoes = ['inteira', 'perto', 'inteira'].filter(function (x) { return x !== takeAntes; });
                    cortar(takeAntes = opcoes[Math.floor(Math.random() * opcoes.length)]); trocar();
                  }); })();
                })();
            });
          }); }); }); });
        }
      })(ini);
    }
    $('desfileTitulo').textContent = d ? d.ico + ' ' + N(d) : t('💖 Que visual incrível!', '💖 What an amazing look!', '💖 ¡Qué look tan increíble!');
    var est = $('desfileEstrelas'); est.innerHTML = '';
    var n = r ? r.estrelas : 0;
    est.setAttribute('aria-label', r ? n + ' ' + t('de 3 estrelas', 'of 3 stars', 'de 3 estrellas') : '');
    for (var i = 0; i < 3; i++) {
      var s = document.createElement('span'); s.className = 'e' + (r && i >= n ? ' apagada' : ''); s.textContent = r ? '⭐' : '💖';
      var atraso = (CALMO ? 0.9 : 4.1) + i * 0.35;
      s.style.animationDelay = atraso + 's'; est.appendChild(s);
      if (!r || i < n) setTimeout(function () { Som.tocar('estrela'); }, atraso * 1000);
    }
    jur.innerHTML = '';
    JURADOS.forEach(function (bicho, k) {
      var f = FRASES[r ? n : 0][k], j = document.createElement('div'); j.className = 'jurado';
      var b = document.createElement('span'); b.className = 'b'; b.textContent = bicho;
      j.appendChild(b); j.appendChild(document.createTextNode(t(f[0], f[1], f[2]))); jur.appendChild(j);
    });
    var ul = $('desfileDicas'); ul.innerHTML = ''; ul.hidden = !d;
    if (d) d.dicas.forEach(function (x, i) { var li = document.createElement('li'); li.className = r.dicas[i] ? 'ok' : 'nao'; li.textContent = (r.dicas[i] ? '✅ ' : '💡 ') + N(x); ul.appendChild(li); });
    var recorde = false;
    if (d) { var antes = ler('purpurinaNova.estrelas.' + d.id, 0); if (n > antes) { gravar('purpurinaNova.estrelas.' + d.id, n); recorde = antes > 0; } }
    $('desfileRecorde').hidden = !recorde;
    $('btProximo').textContent = d ? t('▶ Próximo desafio', '▶ Next challenge', '▶ Siguiente desafío') : t('🎨 Continuar brincando', '🎨 Keep playing', '🎨 Seguir jugando');
    $('btMaisUm').hidden = !d;
    Som.desfile();
    if (CALMO) { Som.tocar('tada'); setTimeout(function () { Som.tocar('aplausos'); }, 500); }
    ponte('desfile', { d: modo || '', est: r ? r.estrelas : 0 });
  }
  // fogos de artifício por cima da passarela (canvas): foguetes sobem e estouram em bolinhas coloridas
  function fogos(seq, dur) {
    var cv = $('fogos'), c = cv.getContext('2d'), w = cv.width = cv.clientWidth, h = cv.height = cv.clientHeight, fim = performance.now() + dur, bolas = [], foguetes = [], prox = 0;
    var cores = ['#ff5fb4', '#ffd166', '#86ecc8', '#cfa8ff', '#7ee8ff', '#ffffff', '#ff8a5c'];
    function quadro(agora) {
      if (seq !== desfileSeq || atual !== 'desfile') { c.clearRect(0, 0, w, h); return; }
      if (agora < fim && agora > prox) { prox = agora + 380 + Math.random() * 520; foguetes.push({ x: w * (0.15 + Math.random() * 0.7), y: h, vy: -(h * 0.018 + Math.random() * h * 0.008), alvo: h * (0.1 + Math.random() * 0.32), cor: cores[Math.floor(Math.random() * cores.length)] }); }
      c.clearRect(0, 0, w, h);
      foguetes = foguetes.filter(function (f) {
        f.y += f.vy; c.fillStyle = '#fff6c8'; c.beginPath(); c.arc(f.x, f.y, 2, 0, 7); c.fill();
        if (f.y > f.alvo) return true;
        Som.tocar('fogo');
        for (var i = 0; i < 64; i++) { var a = Math.PI * 2 * i / 64, v = (1.6 + Math.random() * 2.6) * Math.max(1, w / 400); bolas.push({ x: f.x, y: f.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 1, cor: i % 5 ? f.cor : '#fff' }); }
        return false;
      });
      bolas = bolas.filter(function (b) {
        var x0 = b.x, y0 = b.y;
        b.x += b.vx; b.y += b.vy; b.vy += 0.045; b.vx *= 0.985; b.vida -= 0.014;
        if (b.vida <= 0) return false;
        // cada faísca deixa um risquinho de luz atrás
        c.globalAlpha = Math.max(0, b.vida); c.strokeStyle = b.cor; c.lineWidth = 2.6; c.lineCap = 'round';
        c.beginPath(); c.moveTo(x0 - b.vx * 2, y0 - b.vy * 2); c.lineTo(b.x, b.y); c.stroke();
        return true;
      });
      c.globalAlpha = 1;
      if (agora < fim || bolas.length || foguetes.length) requestAnimationFrame(quadro); else c.clearRect(0, 0, w, h);
    }
    requestAnimationFrame(quadro);
  }
  $('btProximo').addEventListener('click', function () {
    var d = desafioAtual();
    if (d) {
      var i = P.DESAFIOS.indexOf(d), prox = P.DESAFIOS[(i + 1) % P.DESAFIOS.length];
      modo = prox.id; hist.limpar(); estado = baseDesafio(prox); grupoAtual = 'roupa'; dicasAntes = V.avaliar(estado, prox).dicas;
    }
    Som.tocar('aba'); voltar();
  });
  $('btMaisUm').addEventListener('click', function () { Som.tocar('aba'); voltar(); });
  $('btMenuDesfile').addEventListener('click', function () { Som.tocar('clique'); irMenu(); });

  // confete na tela inteira (canvas por cima, sem pegar toque)
  var confeteAtivo = 0;
  function pararConfete() { confeteAtivo++; var cv = $('festa'); if (cv.width) cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); }
  function confete() {
    if (CALMO) return;
    var cv = $('festa'), c = cv.getContext('2d'), w = cv.width = window.innerWidth, h = cv.height = window.innerHeight, pecas = [], fim = performance.now() + 3800, id = ++confeteAtivo;
    var cores = ['#ff5fb4', '#ffd166', '#86ecc8', '#cfa8ff', '#7ee8ff', '#fff'];
    for (var i = 0; i < 150; i++) pecas.push({ x: Math.random() * w, y: -20 - Math.random() * h * 0.6, vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 3.5, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3, t: 5 + Math.random() * 7, cor: cores[i % cores.length], estrela: i % 7 === 0 });
    function quadro(agora) {
      if (id !== confeteAtivo) return;
      c.clearRect(0, 0, w, h);
      pecas.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vx += Math.sin(agora / 300 + p.t) * 0.02;
        c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.cor;
        if (p.estrela) { c.font = (p.t * 2.4) + 'px sans-serif'; c.fillText('✨', 0, 0); } else c.fillRect(-p.t / 2, -p.t / 4, p.t, p.t / 2);
        c.restore();
      });
      if (agora < fim) requestAnimationFrame(quadro); else c.clearRect(0, 0, w, h);
    }
    requestAnimationFrame(quadro);
  }

  // ---------- teclado e controle da TV: setas andam entre os botões ----------
  function focaveis() {
    var raiz = janelaAberta ? $('janela') : $(atual); if (!raiz) return [];
    return Array.prototype.filter.call(raiz.querySelectorAll('button, a[href]'), function (b) { return b.offsetParent !== null && !b.disabled; });
  }
  function focarPrimeiro() {
    if (!TV) return;
    var alvo = atual === 'entrada' ? $('btEntrar') : atual === 'menu' ? $('btLivre') : focaveis()[0];
    if (alvo) try { alvo.focus(); } catch (e) { /* ok */ }
  }
  function moverFoco(dx, dy) {
    var l = focaveis(); if (!l.length) return;
    var at = document.activeElement;
    if (l.indexOf(at) < 0) { l[0].focus(); return; }
    var a = at.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2, melhor = null, nota = Infinity;
    l.forEach(function (b) {
      if (b === at) return;
      var r = b.getBoundingClientRect(), x = r.left + r.width / 2 - ax, y = r.top + r.height / 2 - ay;
      var principal = dx ? x * dx : y * dy, lado = dx ? Math.abs(y) : Math.abs(x);
      if (principal <= 2) return;
      var v = principal + lado * 2.2; if (v < nota) { nota = v; melhor = b; }
    });
    if (melhor) { melhor.focus(); if (melhor.scrollIntoView) melhor.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  }
  document.addEventListener('keydown', function (e) {
    var k = e.key || '', c = e.keyCode || 0;
    if (atual === 'entrada' && (k === 'Enter' || k === ' ' || c === 13)) { e.preventDefault(); entrar(); return; }
    if (k === 'ArrowLeft' || c === 37) { e.preventDefault(); moverFoco(-1, 0); }
    else if (k === 'ArrowRight' || c === 39) { e.preventDefault(); moverFoco(1, 0); }
    else if (k === 'ArrowUp' || c === 38) { e.preventDefault(); moverFoco(0, -1); }
    else if (k === 'ArrowDown' || c === 40) { e.preventDefault(); moverFoco(0, 1); }
    else if (k === 'Escape' || k === 'GoBack' || k === 'BrowserBack' || c === 27 || c === 461 || c === 10009) {
      if (janelaAberta) { e.preventDefault(); fecharPeloBotao(); } else if (pilha.length) { e.preventDefault(); voltar(); }
    }
  });

  // a música toca o tempo todo; só silencia quando o app fica escondido (outra aba, tela apagada)
  document.addEventListener('visibilitychange', function () { Som.dormir(document.hidden); });

  // ---------- guardar no celular: instalar (com ícone) ----------
  // (o botão de baixar um arquivo .html saiu na 0.21.0, dono, 14/Nov/2026: confundia com instalar e não criava ícone)
  /* 📲 Instalar (dono, 14/Nov/2026: "não instalou um ícone no celular e agora eu não acho ele"): o botão fica sempre à vista
     no navegador. Com a janela de instalar do Chrome, o toque instala na hora; sem ela (já instalado, iPhone, Samsung,
     link de outro app), abre o passo a passo comum do Bolinho (../instalar.js), que ensina a achar o ícone na lista de apps.
     Aberta pelo ícone (janela de app), o botão some. */
  var pedidoInstalar = null;
  var JANELA_APP = !!(window.matchMedia && (matchMedia('(display-mode: standalone)').matches || (matchMedia('(display-mode: fullscreen)').matches && !document.fullscreenElement))) || navigator.standalone === true;
  function rotuloInstalar(ja) {
    $('btInstalar').setAttribute('data-t', ja ? '✓ Já instalado: onde está o ícone?|✓ Already installed: where is the icon?|✓ Ya instalada: ¿dónde está el icono?' : '📲 Instalar no celular (com ícone)|📲 Install on the phone (with icon)|📲 Instalar en el móvil (con icono)');
    $('btInstalar').textContent = t.apply(null, $('btInstalar').getAttribute('data-t').split('|'));
  }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); pedidoInstalar = e; rotuloInstalar(false); });
  window.addEventListener('appinstalled', function () { pedidoInstalar = null; rotuloInstalar(true); });
  // o Chrome do Android diz se a Purpurina já está instalada aqui (related_applications no manifest)
  if (navigator.getInstalledRelatedApps) {
    try { navigator.getInstalledRelatedApps().then(function (a) { if (a && a.length && !pedidoInstalar) rotuloInstalar(true); }).catch(function () {}); } catch (e) { /* sem a pergunta */ }
  }
  function passoAPasso() {
    var abre = function () { var b = document.querySelector('.bc-inst .bc-btn'); if (b) b.click(); };
    if (document.querySelector('.bc-inst')) return abre();
    var s = document.createElement('script');
    s.src = '../instalar.js';
    s.setAttribute('data-nome', 'Purpurina'); s.setAttribute('data-icone', 'icone-192.png');
    s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
    s.onload = function () { var bar = document.querySelector('.bc-inst'); if (bar) bar.hidden = true; abre(); };
    document.body.appendChild(s);
  }
  $('btInstalar').hidden = JANELA_APP;
  $('btInstalar').addEventListener('click', function () {
    if (!pedidoInstalar) return passoAPasso();
    var p = pedidoInstalar; pedidoInstalar = null;   // a janela do navegador só pode ser usada uma vez
    p.prompt();
    p.userChoice.then(function (r) { if (r && r.outcome === 'accepted') rotuloInstalar(true); }).catch(function () {});
  });
  var EM_ARQUIVO = !!window.JOGO_EM_ARQUIVO || location.protocol === 'file:' || location.protocol === 'content:';
  if (EM_ARQUIVO) $('guardar').hidden = true;   // arquivo baixado nas versões antigas: sem instalar
  // no arquivo baixado não há TV nem YouTube/Spotify (precisam do site e da internet)
  if (EM_ARQUIVO) Array.prototype.forEach.call(document.querySelectorAll('[data-so-site]'), function (el) { el.hidden = true; });

  /* ---------- versão nova ----------
     Uma aba que ficou aberta continua com a versão antiga na memória. Ao abrir e ao voltar para o jogo (no máximo a cada
     5 min), confere o versoes.json no site; se a versão de lá for mais nova, mostra "✨ Versão nova! Toque para atualizar". */
  function maisNova(a, b) { var x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (var i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; }
  var ultimaConferida = 0;
  function conferirVersao() {
    // o aviso comum dos jogos (../atualizar.js) já cuida disso: um aviso só na tela
    if (window.SolverAtualizar || EM_ARQUIVO || !window.fetch || Date.now() - ultimaConferida < 5 * 60000) return;
    ultimaConferida = Date.now();
    fetch('versoes.json?v=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      var nova = j && j.versoes && j.versoes[0] && j.versoes[0].versao;
      if (!nova || !maisNova(nova, APP_VERSION)) return;
      var b = $('btNovaVersao'); b.textContent = t('✨ Versão nova (v', '✨ New version (v', '✨ ¡Versión nueva (v') + nova + t(')! Toque para atualizar', ')! Tap to update', ')! Toca para actualizar'); b.hidden = false;
    }).catch(function () { /* sem internet: tenta da próxima vez */ });
  }
  $('btNovaVersao').addEventListener('click', function () {
    var b = $('btNovaVersao'); b.textContent = t('Atualizando…', 'Updating…', 'Actualizando…');
    // pede ao navegador para conferir os arquivos novos, mas recarrega de qualquer jeito em no máximo 1,5 s
    var feito = false, rec = function () { if (feito) return; feito = true; location.reload(); };
    setTimeout(rec, 1500);
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) navigator.serviceWorker.getRegistration().then(function (r) { return r && r.update(); }).then(rec, rec);
    else rec();
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) conferirVersao(); });
  setTimeout(conferirVersao, 3000);

  // ---------- começo ----------
  $('ver').textContent = 'v' + APP_VERSION;
  $('btSom').textContent = Som.ligado() ? '🔊' : '🔇';
  /* abertura e menu (dono, 20/Nov/2026: "na própria abertura tem que ter movimento… poses de modelo, mandando beijinho"):
     a personagem troca de pose a cada 2,8 s, com a troca suave (duas camadas que se cruzam), e entre uma e outra respira e
     passa o peso de uma perna para a outra. Quem pediu menos movimento vê ela parada. */
  var POSES_ABERTURA = ['maoCabelo', 'beijo', 'tchau', 'duasCintura', 'carinha', 'cintura'];
  /* abertura e menu com movimento de verdade (dono, 20/Nov/2026: "as poses precisam de movimento, não ficar trocando de
     foto"): a personagem é desenhada uma vez com o esqueleto (opcoes.rig) e o animador.js leva os braços, a cabeça, os
     olhos e as pernas de uma pose para a outra, devagar, respirando no meio. De tempos em tempos a câmera chega no rosto,
     ela dá uma piscadinha e a câmera volta. Quem pediu menos movimento vê ela parada. */
  var POSES_ABERTURA = ['cintura', 'olhaE', 'cabeca', 'beijo', 'apontar', 'tchau', 'duasCintura', 'queixo', 'bolsos'];
  function abertura(el, nome) {
    var menino = livre.personagem === 'menino', lista = menino ? ['bolsos', 'olhaD', 'apontar', 'tchau', 'queixo', 'olhaE'] : POSES_ABERTURA;
    function desenho(extra) { return B.svg(livre, Object.assign({ id: nome, fundo: false, area: [40, 30, 320, 650], anim: !CALMO, passos: true, rig: true, sorriso: true }, extra || {})); }
    if (el._anim) el._anim.parar(); clearTimeout(el._zoom);
    if (CALMO) { el.innerHTML = B.svg(livre, { id: nome, fundo: false, area: [40, 30, 320, 650] }); return; }
    el.classList.add('ab-rig');
    el.innerHTML = '<div class="ab-camada ativa">' + desenho() + '</div>';
    var cam = el.firstChild;
    var z = B.areaZoom(P.ZOOM.rosto, livre), fx = (z[0] + z[2] / 2 - 40) / 320 * 100, fy = (z[1] + z[3] / 2 - 30) / 620 * 100;
    cam.style.transformOrigin = fx.toFixed(1) + '% ' + fy.toFixed(1) + '%';
    var perto = 'translate(' + (50 - fx).toFixed(1) + '%, ' + (45 - fy).toFixed(1) + '%) scale(3)';
    el._anim = PurpurinaAnim.criar(cam, { poses: lista, segura: 3400, aoTrocar: function (pz, i) {
      if (i % 4 !== 3 || document.hidden || !el.offsetParent) return;
      // a câmera vai ao rosto, piscadinha, e volta
      cam.style.transform = perto;
      el._zoom = setTimeout(function () {
        cam.innerHTML = desenho({ piscadinha: true });
        el._zoom = setTimeout(function () { cam.innerHTML = desenho(); el._zoom = setTimeout(function () { cam.style.transform = ''; }, 600); }, 700);
      }, 1300);
    } });
  }
  abertura($('entradaBoneca'), 'entrada');
  traduzir();
  // trocaram o idioma na estante aberta noutra aba: os textos da tela trocam na hora
  if (window.BolinhoIdioma) BolinhoIdioma.aoMudar(function (c) {
    lingua = c; traduzir();
    if (atual === 'menu') desenharMenu(); else if (atual === 'desafios') listaDesafios(); else if (atual === 'looks') listaLooks(); else if (atual === 'estudio') desenharTudo();
  });
  if (TV) setTimeout(focarPrimeiro, 200);
  // o que o tv.js (TV, celular-controle e 🎵 Música) usa do app
  window.PurpurinaApp = {
    t: t, N: N, TV: TV && !EM_ARQUIVO, mostrar: mostrar, ir: ir, recado: recado, confete: confete,
    estado: function () { return V.copiar(estado); }, angulo: function () { return angulo; }, telaAtual: function () { return atual; },
    // depois de conectar: volta para o estúdio se veio de lá; senão abre o brincar livre
    irEstudio: function () { if (atual === 'estudio') return; if (pilha[pilha.length - 1] === 'estudio') voltar(); else comecar(null); }
  };
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });
})();

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer jogar não baixa nada a mais. */
(function () {
  if (!/[?&]instalar\b/.test(location.search) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.src = '../instalar.js';
  s.setAttribute('data-nome', 'Purpurina'); s.setAttribute('data-icone', 'icone-192.png');
  s.setAttribute('data-so-com', 'instalar'); s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
  document.body.appendChild(s);
})();
