/* Carrossel em roda (dono, 20/Nov/2026), peça comum dos jogos que têm vários joguinhos dentro (Jogoteca, TIJOLAÇO).
   "Em pé, principalmente no celular, tem que ter movimento para a criança saber que tem vários joguinhos ali": os itens
   ficam numa roda em perspectiva — o da frente maior, os de trás menores e mais apagados — e a roda gira sozinha, um
   passo a cada 3 s, em rodízio (depois do último vem o primeiro). Para de girar sozinha no primeiro toque, tecla ou
   arraste; arrastar para o lado gira a roda; tocar num item de trás traz ele para a frente. "Reduzir movimento": sem
   giro sozinho e sem animação. Fora do modo (deitado, tela larga), os itens voltam ao lugar normal da página.

   Uso:  var roda = BolinhoCarrossel.criar({
           caixa: elemento onde os itens ficam (ganha a classe "roda-3d" enquanto o modo está ligado),
           itens: [elementos],
           ligado: function () { return true/false },   // quando usar a roda (ex.: em pé); conferido ao girar a tela
           inicial: índice do item da frente,
           aoMudar: function (i) {}                    // o item i chegou à frente (pelo giro sozinho ou pela pessoa)
         });
         roda.ir(i)      põe o item i na frente pelo caminho mais curto (sem chamar aoMudar)
         roda.parar()    para o giro sozinho
         roda.trocar(itens)  os mesmos itens refeitos (ex.: depois de trocar o idioma)
   O jogo dá a altura da caixa e o tamanho dos itens no CSS dele (.roda-3d e .roda-3d > item). */
(function () {
  'use strict';
  var calmo = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var PASSO_MS = 3000;

  function criar(o) {
    var itens = o.itens, n = itens.length, caixa = o.caixa;
    var pos = o.inicial || 0, alvo = pos, ativo = false, sozinho = !calmo, ultimoPasso = 0, rodando = false;
    var arrasto = null, arrastou = false;

    function frente() { return ((Math.round(alvo) % n) + n) % n; }
    function pintar() {
      var larg = caixa.clientWidth || 300, R = larg * 0.34;
      for (var i = 0; i < n; i++) {
        var d = i - pos; d = ((d % n) + n) % n; if (d > n / 2) d -= n;   // distância até a frente, na roda
        var a = d * 2 * Math.PI / n, z = Math.cos(a), x = Math.sin(a) * R;
        var esc = 0.5 + 0.5 * (z + 1) / 2;                                  // frente 1, fundo 0,5
        var el = itens[i];
        el.style.transform = 'translate(-50%, -50%) translateX(' + x.toFixed(1) + 'px) perspective(700px) rotateY(' + (-Math.sin(a) * 28).toFixed(1) + 'deg) scale(' + esc.toFixed(3) + ')';
        el.style.zIndex = String(Math.round((z + 1) * 50));
        el.style.opacity = String(Math.max(0.35, 0.35 + 0.65 * (z + 1) / 2).toFixed(2));
        el.style.filter = z > 0.98 ? '' : 'brightness(' + (0.55 + 0.45 * (z + 1) / 2).toFixed(2) + ')';
        el.setAttribute('aria-hidden', String(Math.abs(d) > 0.5));
        el.classList.toggle('roda-frente', Math.abs(d) < 0.5);
      }
    }
    function limpar() {
      itens.forEach(function (el) {
        el.style.transform = el.style.zIndex = el.style.opacity = el.style.filter = '';
        el.removeAttribute('aria-hidden'); el.classList.remove('roda-frente');
      });
    }
    function laco(t) {
      if (!ativo) { rodando = false; return; }
      if (sozinho && !arrasto && !document.hidden && caixa.offsetParent) {
        if (!ultimoPasso) ultimoPasso = t;
        if (t - ultimoPasso > PASSO_MS) { ultimoPasso = t; alvo = Math.round(alvo) + 1; avisar(); }
      } else ultimoPasso = t;
      if (!arrasto) pos += (alvo - pos) * (calmo ? 1 : 0.14);
      if (Math.abs(alvo - pos) < 0.001) pos = alvo;
      pintar();
      requestAnimationFrame(laco);
    }
    var ultimoAviso = -1;
    function avisar() { var f = frente(); if (f !== ultimoAviso) { ultimoAviso = f; if (o.aoMudar) o.aoMudar(f); } }
    function conferir() {
      var quer = !!o.ligado();
      if (quer === ativo) return;
      ativo = quer; caixa.classList.toggle('roda-3d', ativo);
      if (ativo) { pintar(); if (!rodando) { rodando = true; requestAnimationFrame(laco); } } else limpar();
    }
    function parar() { sozinho = false; }

    // arrastar para girar; tocar num item de trás traz ele para a frente
    caixa.addEventListener('pointerdown', function (e) {
      if (!ativo) return;
      parar(); arrastou = false;
      arrasto = { x: e.clientX, pos: pos, larg: caixa.clientWidth * 0.34 * 2 * Math.PI / n };
    });
    addEventListener('pointermove', function (e) {
      if (!arrasto) return;
      var dx = e.clientX - arrasto.x;
      if (Math.abs(dx) > 8) arrastou = true;
      if (arrastou) { pos = arrasto.pos - dx / arrasto.larg; alvo = pos; }
    });
    function soltar() {
      if (!arrasto) return;
      arrasto = null;
      if (arrastou) { alvo = Math.round(pos); avisar(); }
    }
    addEventListener('pointerup', soltar); addEventListener('pointercancel', soltar);
    // depois de arrastar, o toque não vale como clique; clique num item de trás só gira até ele
    caixa.addEventListener('click', function (e) {
      if (!ativo) return;
      if (arrastou) { e.stopPropagation(); e.preventDefault(); arrastou = false; return; }
      for (var i = 0; i < n; i++) if (itens[i].contains(e.target) && i !== frente()) {
        e.stopPropagation(); e.preventDefault(); ir(i); if (o.aoMudar) o.aoMudar(i); return;
      }
    }, true);
    addEventListener('keydown', function () { if (ativo) parar(); });
    addEventListener('resize', conferir);
    if (window.matchMedia) { var mq = matchMedia('(orientation: portrait)'); if (mq.addEventListener) mq.addEventListener('change', conferir); }

    function ir(i) {
      var d = i - frente(); d = ((d % n) + n) % n; if (d > n / 2) d -= n;
      alvo = Math.round(alvo) + d; ultimoAviso = i;
      if (!ativo) pos = alvo;
    }
    conferir();
    // os itens foram refeitos (ex.: troca de idioma): mesma roda, itens novos
    function trocar(novos) { if (ativo) limpar(); itens = novos; n = novos.length; if (ativo) pintar(); }
    return { ir: ir, parar: parar, frente: frente, trocar: trocar, ativo: function () { return ativo; }, conferir: conferir };
  }
  window.BolinhoCarrossel = { criar: criar };
})();
