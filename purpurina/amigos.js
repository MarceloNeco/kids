/* Purpurina — personagens que viajam entre os jogos (dono, 22/Nov/2026; peça comum ../personagens.js).
   EXPORTA: a personagem do "brincar livre" (localStorage "purpurina.atual") vira "Purpurina 80's" para os outros jogos
   (ex.: pilota no Vruuum!): retrato 256×256 (rosto e busto) e corpo 384×512 (inteira), fundo transparente, desenhados
   pelo boneca.js. Sai ao deixar o estúdio, ao fechar/esconder a página e ao abrir o jogo (só se mudou desde a última vez).
   IMPORTA: o acessório "🧸 Amiguinho" (aba Acessórios): a personagem segura ao lado, na mão direita, um amiguinho
   montado no Meu Pequeno Amiguinho (o corpo inteiro dele; sem corpo, o retrato). A escolha fica em "purpurina.amigo"
   (vale para a personagem do palco e da foto; não entra nos looks guardados nem no desfile). Sem nenhum amiguinho,
   a janela leva ao Meu Pequeno Amiguinho.
     PurpurinaAmigos.iniciar({ redesenhar(inteira), abrirJanela, t })   (app.js)
     PurpurinaAmigos.botao()    o quadradinho "🧸 Amiguinho" para a aba Acessórios
     PurpurinaAmigos.svg()      o <image> do amiguinho (boneca.js, com opcoes.amigo), ou '' se não tem/está carregando
     PurpurinaAmigos.exportar() salva a personagem atual para os outros jogos (Promise)
   Nada sai do aparelho. Escrito em JavaScript antigo (sem =>), como o resto do jogo. */
(function (raiz) {
  'use strict';
  var JOGO = 'purpurina', ID = 'purpurina:minha', NOME = "Purpurina 80's";
  var ATUAL = 'purpurina.atual', AMIGO = 'purpurina.amigo', EXPORTADO = 'purpurina.exportado';
  var DE_ONDE = 'meu-amiguinho';
  var op = {}, carregado = null, pedindo = null;
  function BP() { return raiz.BolinhoPersonagens; }
  function t(pt, en, es) { return op.t ? op.t(pt, en, es) : pt; }
  function ler(k) { try { var v = raiz.localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function gravar(k, v) { try { if (v == null) raiz.localStorage.removeItem(k); else raiz.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem espaço: segue */ } }

  // ---------- exportar ----------
  function png(svg, w, h) {
    return new Promise(function (ok, erro) {
      var img = new raiz.Image(), url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      img.onload = function () {
        var cv = raiz.document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url); try { ok(cv.toDataURL('image/png')); } catch (e) { erro(e); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); erro(new Error('svg')); };
      img.src = url;
    });
  }
  function exportar() {
    try {
      var B = raiz.PurpurinaBoneca, V = raiz.PurpurinaVisual, bruto = ler(ATUAL);
      if (!BP() || !B || !V || !bruto) return Promise.resolve(false);   // ainda não brincou: nada para levar
      var e = V.limpar(bruto), marca = JSON.stringify(e);
      var ja = BP().listar({ jogo: JOGO }).some(function (p) { return p.id === ID; });
      if (ja && ler(EXPORTADO) === marca) return Promise.resolve(false);   // não mudou
      var ret = B.svg(e, { id: 'expR', fundo: false, anim: false, realce: false, area: [50, 40, 300, 300], largura: 256, altura: 256 });
      var corpo = B.svg(e, { id: 'expC', fundo: false, anim: false, realce: false, area: [-70, 0, 540, 720], largura: 384, altura: 512 });
      return Promise.all([png(ret, 256, 256), png(corpo, 384, 512)]).then(function (im) {
        return BP().salvar({ id: ID, jogo: JOGO, nome: NOME, tipo: 'pessoa', retrato: im[0], corpo: im[1] });
      }).then(function (r) { if (r) gravar(EXPORTADO, marca); return !!r; }, function () { return false; });
    } catch (e) { return Promise.resolve(false); }
  }

  // ---------- importar: o amiguinho na mão ----------
  function escolhido() { var id = ler(AMIGO); return id && BP() && BP().listar({ jogo: DE_ONDE }).some(function (p) { return p.id === id; }) ? id : null; }
  function carregar() {
    var id = escolhido();
    if (!id) { carregado = null; return; }
    if ((carregado && carregado.id === id) || pedindo === id) return;
    pedindo = id;
    BP().pegar(id).then(function (p) {
      var url = p && (p.corpo || p.retrato);
      if (!url) { pedindo = null; return; }
      var img = new raiz.Image();
      img.onload = function () {
        var r = recortar(img);
        pedindo = null; carregado = { id: id, url: r.url || url, w: r.w, h: r.h, nome: p.nome, fonte: p.corpo ? 'corpo' : 'retrato' };
        if (op.redesenhar) op.redesenhar();
      };
      img.onerror = function () { pedindo = null; };
      img.src = url;
    }, function () { pedindo = null; });
  }
  // tira a sobra transparente em volta (cada jogo exporta com uma margem diferente), para o tamanho na mão ficar certo
  function recortar(img) {
    var w = img.naturalWidth || 384, h = img.naturalHeight || 512;
    try {
      var cv = raiz.document.createElement('canvas'); cv.width = w; cv.height = h;
      var c = cv.getContext('2d'); c.drawImage(img, 0, 0);
      var d = c.getImageData(0, 0, w, h).data, x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (var y = 0; y < h; y += 2) for (var x = 0; x < w; x += 2) if (d[(y * w + x) * 4 + 3] > 12) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 < 0) return { w: w, h: h };
      x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2); x1 = Math.min(w - 1, x1 + 2); y1 = Math.min(h - 1, y1 + 2);
      var cw = x1 - x0 + 1, ch = y1 - y0 + 1, out = raiz.document.createElement('canvas'); out.width = cw; out.height = ch;
      out.getContext('2d').drawImage(cv, x0, y0, cw, ch, 0, 0, cw, ch);
      return { url: out.toDataURL('image/png'), w: cw, h: ch };
    } catch (e) { return { w: w, h: h }; }
  }
  // o amiguinho em pé ao lado da personagem, na altura do quadril, com a mão direita dela (282, 498) segurando
  function svg() {
    var id = escolhido();
    if (!id) return '';
    if (!carregado || carregado.id !== id) { carregar(); return ''; }
    // até 175 de altura (um quarto da personagem) e 165 de largura (os de quatro patas são mais largos); a mão dela fica
    // na altura do peito dele, e os pés dele perto do chão
    var h = 175, w = h * carregado.w / carregado.h;
    if (w > 165) { w = 165; h = w * carregado.h / carregado.w; }
    var x = Math.round(318 - w / 2), y = Math.round(640 - h);
    return '<image class="pp-amigo" data-fonte="' + carregado.fonte + '" href="' + carregado.url + '" x="' + x + '" y="' + y + '" width="' + Math.round(w) + '" height="' + Math.round(h) + '" preserveAspectRatio="xMidYMax meet"/>';
  }
  function escolher(id) {
    gravar(AMIGO, id || null); carregado = id && carregado && carregado.id === id ? carregado : null;
    carregar(); if (op.redesenhar) op.redesenhar(!!id);   // true: mostra a personagem inteira (o amiguinho fica embaixo)
  }
  function abrir() {
    if (!op.abrirJanela) return;
    var lista = BP() ? BP().listar({ jogo: DE_ONDE }) : [], atual = escolhido();
    var nomeJogo = t('Meu Pequeno Amiguinho', 'My Little Buddy', 'Mi Pequeño Amiguito');
    if (!lista.length) {
      op.abrirJanela({ titulo: t('🧸 Meu amiguinho no colo', '🧸 My buddy in my arms', '🧸 Mi amiguito en brazos'),
        texto: t('Monte um no ' + nomeJogo + ' e ele aparece aqui para ficar com a sua personagem.', 'Make one in ' + nomeJogo + ' and they will show up here to stay with your character.', 'Crea uno en ' + nomeJogo + ' y aparecerá aquí para quedarse con tu personaje.'),
        botoes: [{ t: t('🧸 Montar no ', '🧸 Make one in ', '🧸 Crear en ') + nomeJogo, classe: 'grande', fn: function () { raiz.location.href = '../meu-amiguinho/'; } }, { t: t('Fechar', 'Close', 'Cerrar') }] });
      return;
    }
    var botoes = lista.map(function (p) {
      return { t: (p.id === atual ? '✓ ' : '') + (p.nome || '🧸'), img: p.mini, classe: 'medio amigo-bt' + (p.id === atual ? ' escolhido' : ''), fn: function () { escolher(p.id); } };
    });
    botoes.push({ t: t('🚫 Sem amiguinho', '🚫 No buddy', '🚫 Sin amiguito'), classe: 'medio', fn: function () { escolher(null); } });
    op.abrirJanela({ titulo: t('🧸 Meu amiguinho no colo', '🧸 My buddy in my arms', '🧸 Mi amiguito en brazos'),
      texto: t('Quem fica com a sua personagem? (do ' + nomeJogo + ')', 'Who stays with your character? (from ' + nomeJogo + ')', '¿Quién se queda con tu personaje? (de ' + nomeJogo + ')'), botoes: botoes });
  }
  function botao() {
    var b = raiz.document.createElement('button'); b.type = 'button'; b.className = 'cat-bt bt-amigo';
    var ci = raiz.document.createElement('span'); ci.className = 'i'; ci.textContent = '🧸';
    var ct = raiz.document.createElement('span'); ct.textContent = t('Amiguinho', 'Buddy', 'Amiguito') + (escolhido() ? ' ✓' : '');
    b.appendChild(ci); b.appendChild(ct);
    b.addEventListener('click', abrir);
    return b;
  }

  function iniciar(o) {
    op = o || {};
    carregar();
    if (BP() && BP().aoMudar) BP().aoMudar(function (e) {
      if (!e || !e.id || (carregado && carregado.id === e.id)) carregado = null;   // o amiguinho pode ter mudado no outro jogo
      carregar(); if (op.redesenhar) op.redesenhar();
    });
    // exporta ao sair do estúdio, ao esconder a página e uma vez ao abrir (se mudou)
    var est = raiz.document.getElementById('estudio');
    if (est && raiz.MutationObserver) {
      var estava = est.classList.contains('ativa');
      new raiz.MutationObserver(function () { var agora = est.classList.contains('ativa'); if (estava && !agora) exportar(); estava = agora; }).observe(est, { attributes: true, attributeFilter: ['class'] });
    }
    raiz.addEventListener('pagehide', function () { exportar(); });
    raiz.document.addEventListener('visibilitychange', function () { if (raiz.document.hidden) exportar(); });
    setTimeout(exportar, 1500);
  }

  raiz.PurpurinaAmigos = { iniciar: iniciar, botao: botao, svg: svg, exportar: exportar, escolher: escolher, abrir: abrir };
})(this);
