/* Purpurina Nova Era — animador do esqueleto (dono, 20/Nov/2026: "as poses precisam de movimento, não ficar trocando de
   foto… braços, olhos, rosto"). O desenho sai do boneca.js com opcoes.rig: braços em ombro → cotovelo → mão
   (.rig-ombro-*, .rig-cotovelo-*), cabeça (.rig-cabeca), íris (.rig-iris) e, com opcoes.passos, quadril e pernas
   (.pp-corpo, .pp-passo-*, .pp-barra). Aqui cada pose é só um punhado de ângulos; de uma para a outra tudo vai mudando
   aos poucos (0,9 s), e entre elas ela respira, balança de leve, pisca e olha em volta — sem redesenhar a personagem.
   Poses tiradas das fotos de referência do dono (ensaios de modelo infantil). */
(function (raiz) {
  'use strict';
  var B = raiz.PurpurinaBoneca;
  // o = abrir o braço para fora, c = dobrar o cotovelo para dentro (graus), f = braço de cima vindo para a frente (1 = não)
  // cab = inclinar a cabeça, olho = para onde os olhos vão (-1 esquerda … 1 direita), base = como estão as pernas
  var POSES = {
    relax: { oE: 6, cE: 8, oD: 6, cD: 8, cab: 0, olho: 0, base: 'reta' },
    cintura: { oE: 8, cE: 14, oD: 50, cD: 120, cab: -5, olho: 0.4, base: 'gingaD' },
    duasCintura: { oE: 50, cE: 120, oD: 50, cD: 120, cab: 4, olho: 0, base: 'aberta' },
    cabeca: { oE: 150, cE: -110, oD: 50, cD: 120, cab: 5, olho: -0.3, base: 'gingaD' },
    beijo: { oE: 8, cE: 14, oD: -10, cD: 172, fD: 0.45, cab: 6, olho: 0, base: 'cruzada' },
    queixo: { oE: 25, cE: 95, oD: -20, cD: 165, fD: 0.6, cab: -6, olho: 0.6, base: 'reta' },
    apontar: { oE: 78, cE: 5, oD: -5, cD: 150, fD: 0.6, cab: -8, olho: -1, base: 'gingaE' },
    bolsos: { oE: 12, cE: 30, oD: 12, cD: 30, cab: 3, olho: 0.5, base: 'cruzada' },
    tchau: { oE: 8, cE: 14, oD: 62, cD: -95, cab: 4, olho: 0, base: 'reta', aceno: true },
    cruzados: { oE: 18, cE: 112, fE: 0.8, oD: 18, cD: 108, fD: 0.8, cab: 3, olho: 0, base: 'aberta' },
    olhaE: { oE: 8, cE: 12, oD: 8, cD: 12, cab: -4, olho: -1, base: 'gingaE' },
    olhaD: { oE: 8, cE: 12, oD: 8, cD: 12, cab: 4, olho: 1, base: 'gingaD' }
  };
  // pernas: [x, y, giro] do quadril (corpo) e de cada perna, e a saia inclinando (px do desenho, graus)
  var BASES = {
    reta: { c: [0, 0, 0], e: [0, 0, 0], d: [0, 0, 0], s: 0 },
    gingaD: { c: [14, 0, -3], e: [14, 1.6, 11], d: [14, -1.6, 2], s: -2 },
    gingaE: { c: [-14, 0, 3], e: [-14, -1.6, -2], d: [-14, 1.6, -11], s: 2 },
    cruzada: { c: [0, 0, 0], e: [0, 0, -3], d: [0, 10, 12], s: 0 },
    aberta: { c: [0, 0, 0], e: [0, 0, 7], d: [0, 0, -7], s: 0 }
  };
  function valores(nome) {
    var p = POSES[nome] || POSES.relax, b = BASES[p.base] || BASES.reta;
    return { oE: p.oE, cE: p.cE, fE: p.fE || 1, oD: p.oD, cD: p.cD, fD: p.fD || 1, cab: p.cab, olho: p.olho,
      cx: b.c[0], cy: b.c[1], cr: b.c[2], ex: b.e[0], ey: b.e[1], er: b.e[2], dx: b.d[0], dy: b.d[1], dr: b.d[2], s: b.s, aceno: p.aceno ? 1 : 0 };
  }
  function suave(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }

  function criar(caixa, op) {
    op = op || {};
    var atual = valores('relax'), de = atual, para = atual, ini = 0, dur = 900, vivo = true, quadro = 0, nomeAtual = 'relax';
    var lista = op.poses || ['relax'], i = 0, prox = performance.now() + (op.primeira || 1800);
    // amplitude do balanço (dono, 20/Nov/2026: maquiando, "zoom no olho, na boca, com um leve movimento"): 1 de corpo
    // inteiro; perto do rosto o quadril e as pernas quase param e sobra o sutil — cabeça, olhos, respiração
    var amp = 1, ampAlvo = 1;
    function trocar(nome, ms) { nomeAtual = nome; de = atual; para = valores(nome); ini = performance.now(); dur = ms || 900; }
    function aplicar(v, t) {
      var svg = caixa.querySelector('svg'); if (!svg) return;
      var r = Math.sin(t / 650) * 1, ac = v.aceno * Math.sin(t / 95) * 16;   // respiração e o tchauzinho
      [['e', v.oE + r, v.cE, v.fE], ['d', v.oD + r, v.cD - ac, v.fD]].forEach(function (b) {
        var om = svg.querySelector('.rig-ombro-' + b[0]), co = svg.querySelector('.rig-cotovelo-' + b[0]); if (!om || !co) return;
        var S = [+om.getAttribute('data-x'), +om.getAttribute('data-y')], E = [+co.getAttribute('data-x'), +co.getAttribute('data-y')];
        om.setAttribute('transform', B.transformaOmbro(b[0] === 'e' ? b[1] : -b[1], b[3], S));
        co.setAttribute('transform', B.transformaCotovelo(b[0] === 'e' ? -b[2] : b[2], b[3], E));
      });
      var cab = svg.querySelector('.rig-cabeca');
      if (cab) cab.setAttribute('transform', 'rotate(' + (v.cab * (0.5 + amp / 2) + Math.sin(t / 1100) * 1.2).toFixed(2) + ' ' + cab.getAttribute('data-x') + ' ' + cab.getAttribute('data-y') + ')');
      Array.prototype.forEach.call(svg.querySelectorAll('.rig-iris'), function (g) { g.setAttribute('transform', 'translate(' + (v.olho * 5).toFixed(2) + ' 0)'); });
      function estilo(sel, x, y, rot, extra) { var g = svg.querySelector(sel); if (!g) return; g.style.transformBox = 'view-box'; g.style.transform = 'translate(' + x.toFixed(2) + 'px, ' + y.toFixed(2) + 'px) rotate(' + rot.toFixed(2) + 'deg)' + (extra || ''); }
      var resp = Math.sin(t / 650) * 1.1;
      estilo('.pp-corpo', v.cx * amp, v.cy * amp - resp, v.cr * amp);
      estilo('.pp-passo-e', v.ex * amp, v.ey * amp, v.er * amp); estilo('.pp-passo-d', v.dx * amp, v.dy * amp, v.dr * amp);
      Array.prototype.forEach.call(svg.querySelectorAll('.pp-barra'), function (g) { g.style.transformBox = 'view-box'; g.style.transform = 'skewX(' + (v.s * amp).toFixed(2) + 'deg)'; });
    }
    function passo(t) {
      if (!vivo) return;
      if (op.enquanto && !op.enquanto()) { vivo = false; return; }   // a tela acabou (ex.: saiu do desfile)
      if (lista.length > 1 && t > prox) { i = (i + 1) % lista.length; trocar(lista[i]); prox = t + (op.segura || 3200); if (op.aoTrocar) op.aoTrocar(lista[i], i); }
      var k = Math.min(1, (t - ini) / dur), e = suave(k), v = {};
      for (var c in para) v[c] = de[c] + (para[c] - de[c]) * e;
      v.aceno = para.aceno;
      amp += (ampAlvo - amp) * 0.06;   // muda de amplitude devagar, sem tranco
      atual = v; aplicar(v, t);
      quadro = requestAnimationFrame(passo);
    }
    trocar(lista[0], 10);
    quadro = requestAnimationFrame(passo);
    return {
      trocar: trocar,
      pose: function () { return nomeAtual; },
      amplitude: function (a) { ampAlvo = a; },
      parar: function () { vivo = false; cancelAnimationFrame(quadro); },
      lista: function (l) { lista = l; i = 0; prox = performance.now() + (op.segura || 3200); trocar(l[0]); }
    };
  }
  raiz.PurpurinaAnim = { criar: criar, POSES: POSES };
})(typeof window !== 'undefined' ? window : this);
