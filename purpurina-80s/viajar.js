/* Purpurina 80's — a personagem viaja para os outros jogos (dono, 22/Nov/2026; peça comum ../personagens.js).
   A personagem do "brincar livre" (localStorage "purpurina80s.atual") vira "Purpurina 80's" nos outros jogos (ex.:
   pilota no Vruuum!): retrato 256×256 (rosto e busto) e corpo 384×512 (inteira), fundo transparente, desenhados pelo
   boneca.js. Sai ao deixar o estúdio, ao esconder/fechar a página e ao abrir o jogo, só quando ela mudou desde a última vez.
   Arquivo à parte, que se liga sozinho (não mexe no app.js): só olha a tela #estudio. Nada sai do aparelho.
   Escrito em JavaScript antigo (sem =>), como o resto do jogo. */
(function (raiz) {
  'use strict';
  var JOGO = 'purpurina-80s', ID = 'purpurina-80s:minha', NOME = "Purpurina 80's";
  var ATUAL = 'purpurina80s.atual', EXPORTADO = 'purpurina80s.exportado';
  function BP() { return raiz.BolinhoPersonagens; }
  function ler(k) { try { var v = raiz.localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
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
      // o rosto muda de lugar com a idade e o corpo: a área do zoom do rosto do próprio jogo, em quadrado e com folga
      var z = B.areaZoom && raiz.PurpurinaPecas ? B.areaZoom(raiz.PurpurinaPecas.ZOOM.rosto, e) : [72, 70, 256, 260], lado = Math.max(z[2], z[3]) * 1.15;
      var ret = B.svg(e, { id: 'expR', fundo: false, anim: false, realce: false, area: [z[0] + z[2] / 2 - lado / 2, z[1] + z[3] / 2 - lado / 2, lado, lado], largura: 256, altura: 256 });
      var corpo = B.svg(e, { id: 'expC', fundo: false, anim: false, realce: false, area: [-70, 0, 540, 720], largura: 384, altura: 512 });
      return Promise.all([png(ret, 256, 256), png(corpo, 384, 512)]).then(function (im) {
        return BP().salvar({ id: ID, jogo: JOGO, nome: NOME, tipo: 'pessoa', retrato: im[0], corpo: im[1] });
      }).then(function (r) { if (r) try { raiz.localStorage.setItem(EXPORTADO, JSON.stringify(marca)); } catch (x) { /* ok */ } return !!r; }, function () { return false; });
    } catch (e) { return Promise.resolve(false); }
  }
  var est = raiz.document.getElementById('estudio');
  if (est && raiz.MutationObserver) {
    var estava = est.classList.contains('ativa');
    new raiz.MutationObserver(function () { var agora = est.classList.contains('ativa'); if (estava && !agora) exportar(); estava = agora; }).observe(est, { attributes: true, attributeFilter: ['class'] });
  }
  raiz.addEventListener('pagehide', function () { exportar(); });
  raiz.document.addEventListener('visibilitychange', function () { if (raiz.document.hidden) exportar(); });
  setTimeout(exportar, 1500);
  raiz.PurpurinaViajar = { exportar: exportar };
})(this);
