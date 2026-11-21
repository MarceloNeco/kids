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
    cintura: { oE: 8, cE: 14, oD: 40, cD: 105, cab: -5, olho: 0.4, base: 'gingaD' },
    duasCintura: { oE: 40, cE: 105, oD: 40, cD: 105, cab: 4, olho: 0, base: 'aberta' },
    cabeca: { oE: 150, cE: -110, oD: 40, cD: 105, cab: 5, olho: -0.3, base: 'gingaD' },
    beijo: { oE: 8, cE: 14, oD: -10, cD: 172, fD: 0.45, cab: 6, olho: 0, base: 'cruzada' },
    queixo: { oE: 25, cE: 95, oD: -20, cD: 165, fD: 0.6, cab: -6, olho: 0.6, base: 'reta' },
    apontar: { oE: 78, cE: 5, oD: -5, cD: 150, fD: 0.6, cab: -8, olho: -1, base: 'gingaE' },
    bolsos: { oE: 12, cE: 30, oD: 12, cD: 30, cab: 3, olho: 0.5, base: 'cruzada' },
    tchau: { oE: 8, cE: 14, oD: 62, cD: -95, cab: 4, olho: 0, base: 'reta', aceno: true },
    cruzados: { oE: 18, cE: 112, fE: 0.8, oD: 18, cD: 108, fD: 0.8, cab: 3, olho: 0, base: 'aberta' },
    olhaE: { oE: 8, cE: 12, oD: 8, cD: 12, cab: -4, olho: -1, base: 'gingaE' },
    olhaD: { oE: 8, cE: 12, oD: 8, cD: 12, cab: 4, olho: 1, base: 'gingaD' },
    // passos da baladinha (dono, 20/Nov/2026, vídeos da sala de luzes): braços para cima, um braço para cima de cada
    // lado, cotovelos dançando, palminhas e o dedo para cima da discoteca
    bracosCima: { oE: 150, cE: 25, oD: 150, cD: 25, cab: 0, olho: 0, base: 'aberta' },
    umCimaD: { oE: 30, cE: 60, oD: 160, cD: 10, cab: -6, olho: -0.6, base: 'gingaE' },
    umCimaE: { oE: 160, cE: 10, oD: 30, cD: 60, cab: 6, olho: 0.6, base: 'gingaD' },
    cotovelos: { oE: 70, cE: 115, oD: 70, cD: 115, cab: -4, olho: 0.5, base: 'gingaD' },
    palminhas: { oE: 28, cE: 135, fE: 0.6, oD: 28, cD: 135, fD: 0.6, cab: 4, olho: 0, base: 'reta' },
    apontaCima: { oE: 40, cE: 105, oD: 165, cD: 0, cab: -8, olho: -0.8, base: 'gingaE' },
    // pulando de braços abertos (placa da Baladinha)
    abracao: { oE: 100, cE: -25, oD: 100, cD: -25, cab: 6, olho: 0, base: 'aberta' }
  };
  // pernas: [x, y, giro] do quadril (corpo) e de cada perna, e a saia inclinando (px do desenho, graus)
  // q = rebolado: o quadril para a direita (1) ou para a esquerda (-1). Não mexe pedaços separados: o desenho inteiro
  // passa por uma curva só (boneca.js, .pp-rebola: duas cópias cortadas no quadril), com os pés parados e tudo ligado (dono, 21/Nov/2026)
  var BASES = {
    // (20/Nov/2026, dono: "aqueles quadrados da calça não acompanham"): corpo e pernas nunca se mexem separados parados
    reta: { c: [0, 0, 0], e: [0, 0, 0], d: [0, 0, 0], s: 0, q: 0 },
    gingaD: { c: [0, 0, 0], e: [0, 0, 0], d: [0, 0, 0], s: -2, q: 1 },
    gingaE: { c: [0, 0, 0], e: [0, 0, 0], d: [0, 0, 0], s: 2, q: -1 },
    cruzada: { c: [0, 0, 0], e: [0, 0, 0], d: [0, 0, 0], s: 0 },
    aberta: { c: [0, 0, 0], e: [0, 0, 0], d: [0, 0, 0], s: 0 }
  };
  function valores(nome) {
    var p = POSES[nome] || POSES.relax, b = BASES[p.base] || BASES.reta;
    return { oE: p.oE, cE: p.cE, fE: p.fE || 1, oD: p.oD, cD: p.cD, fD: p.fD || 1, cab: p.cab, olho: p.olho,
      cx: b.c[0], cy: b.c[1], cr: b.c[2], ex: b.e[0], ey: b.e[1], er: b.e[2], dx: b.d[0], dy: b.d[1], dr: b.d[2], s: b.s, q: b.q || 0, aceno: p.aceno ? 1 : 0 };
  }
  function suave(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }

  function criar(caixa, op) {
    op = op || {};
    var atual = valores('relax'), de = atual, para = atual, ini = 0, dur = 900, vivo = true, quadro = 0, nomeAtual = 'relax';
    var lista = op.poses || ['relax'], i = 0, prox = performance.now() + (op.primeira || 1800);
    // amplitude do balanço (dono, 20/Nov/2026: maquiando, "zoom no olho, na boca, com um leve movimento"): 1 de corpo
    // inteiro; perto do rosto o quadril e as pernas quase param e sobra o sutil — cabeça, olhos, respiração
    var amp = 1, ampAlvo = 1, quadros = op.defasagem || 0;
    function trocar(nome, ms) { nomeAtual = nome; de = atual; para = valores(nome); ini = performance.now(); dur = ms || 900; }
    // copias (baladinha): outras caixas com o mesmo desenho (as sombras coloridas na parede) fazem os mesmos passos
    // (as cópias andam a cada op.copiasCada quadros: desenhar 6 sombras todo quadro pesa no celular)
    function aplicar(v, t) {
      var svg = caixa.querySelector('svg'); if (svg) aplicarEm(svg, v, t);
      if (op.copias && quadros++ % (op.copiasCada || 1) === 0) op.copias.forEach(function (c) { var s2 = c.querySelector('svg'); if (s2) aplicarEm(s2, v, t); });
    }
    function aplicarEm(svg, v, t) {
      var r = Math.sin(t / 650) * 1, ac = v.aceno * Math.sin(t / 95) * 16;   // respiração e o tchauzinho
      [['e', v.oE + r, v.cE, v.fE], ['d', v.oD + r, v.cD - ac, v.fD]].forEach(function (b) {
        // (o desenho pode sair em duas cópias, para o rebolado: tudo com a mesma classe se mexe igual)
        var oms = svg.querySelectorAll('.rig-ombro-' + b[0]), om = oms[0], cos = svg.querySelectorAll('.rig-cotovelo-' + b[0]), co = cos[0]; if (!om || !co) return;
        var S = [+om.getAttribute('data-x'), +om.getAttribute('data-y')], E = [+co.getAttribute('data-x'), +co.getAttribute('data-y')];
        var to = B.transformaOmbro(b[0] === 'e' ? b[1] : -b[1], b[3], S);
        for (var m = 0; m < oms.length; m++) oms[m].setAttribute('transform', to);
        var tc = B.transformaCotovelo(b[0] === 'e' ? -b[2] : b[2], b[3], E);
        for (var q = 0; q < cos.length; q++) cos[q].setAttribute('transform', tc);   // contorno e preenchimento do antebraço
      });
      // rebolado: o quadril vai até ~12 px para o lado (e devagarinho sempre um pouco, para ela nunca ficar dura). Pernas
      // inclinam a partir dos pés; o tronco sai do quadril e volta um pouco nos ombros; a linha do quadril é a mesma nas
      // duas, então nada desencaixa (boneca.js, .pp-rebola)
      var rb = svg.querySelector('.pp-rebola'), tC = 0;
      if (rb) {
        var h = (v.q + (modo === 'andar' ? 0 : Math.sin(t / 1700) * 0.3)) * amp * 12;
        var yJ = +rb.getAttribute('data-y'), yS = +rb.getAttribute('data-ombro'), yP = +rb.getAttribute('data-pe');
        var sB = -h / (yP - yJ); tC = 0.25 * h / (yJ - yS);
        var mB = 'matrix(1 0 ' + sB.toFixed(5) + ' 1 ' + (-sB * yP).toFixed(3) + ' 0)', mC = 'matrix(1 0 ' + tC.toFixed(5) + ' 1 ' + (h - tC * yJ).toFixed(3) + ' 0)';
        Array.prototype.forEach.call(svg.querySelectorAll('.pp-banda-baixo'), function (g) { g.setAttribute('transform', mB); });
        Array.prototype.forEach.call(svg.querySelectorAll('.pp-banda-cima'), function (g) { g.setAttribute('transform', mC); });
      }
      var cabs = svg.querySelectorAll('.rig-cabeca'), cab = cabs[0];
      var bate = op.ritmo && modo !== 'andar' ? Math.sin(t / op.ritmo * Math.PI * 2) * 4 : 0;   // dançando, a cabeça vai no ritmo
      if (cab) {
        var cx0 = cab.getAttribute('data-x'), cy0 = +cab.getAttribute('data-y');
        // a cabeça não entorta com o tronco: desfaz a inclinação em volta do queixo (vai inteira junto com o pescoço)
        var tcab = (tC ? 'matrix(1 0 ' + (-tC).toFixed(5) + ' 1 ' + (tC * cy0).toFixed(3) + ' 0) ' : '') + 'rotate(' + (v.cab * (0.5 + amp / 2) + Math.sin(t / 1100) * 1.2 + bate).toFixed(2) + ' ' + cx0 + ' ' + cy0 + ')';
        for (var cc = 0; cc < cabs.length; cc++) cabs[cc].setAttribute('transform', tcab);
      }
      Array.prototype.forEach.call(svg.querySelectorAll('.rig-iris'), function (g) { g.setAttribute('transform', 'translate(' + (v.olho * 5).toFixed(2) + ' 0)'); });
      // todos os grupos com a classe (o corpo vem em mais de um pedaço: antes e depois das pernas) — antes só o primeiro se
      // mexia, e a blusa ficava parada enquanto as pernas iam para o lado (a calça desencontrava em degraus)
      function estilo(sel, x, y, rot, extra) {
        var t = 'translate(' + x.toFixed(2) + 'px, ' + y.toFixed(2) + 'px) rotate(' + rot.toFixed(2) + 'deg)' + (extra || '');
        Array.prototype.forEach.call(svg.querySelectorAll(sel), function (g) { g.style.transformBox = 'view-box'; g.style.transform = t; });
      }
      var resp = Math.sin(t / 650) * 1.1;
      estilo('.pp-corpo', v.cx * amp, v.cy * amp - resp, v.cr * amp);
      estilo('.pp-passo-e', v.ex * amp, v.ey * amp, v.er * amp, v.esy ? ' scaleY(' + v.esy.toFixed(3) + ')' : '');
      estilo('.pp-passo-d', v.dx * amp, v.dy * amp, v.dr * amp, v.dsy ? ' scaleY(' + v.dsy.toFixed(3) + ')' : '');
      Array.prototype.forEach.call(svg.querySelectorAll('.pp-barra'), function (g) { g.style.transformBox = 'view-box'; g.style.transform = 'skewX(' + (v.s * amp).toFixed(2) + 'deg)'; });
    }
    /* andar de modelo (dono, 20/Nov/2026: "desfile realista"): ciclo de 2 passos. A perna de apoio fica embaixo do
       corpo e a que anda sobe (o joelho dobra) e pousa cruzando na linha do meio, um pé na frente do outro; o quadril vai
       para o lado da perna de apoio e inclina, o corpo sobe e desce um pouco, os braços balançam soltos ao contrário das
       pernas e a cabeça fica firme, olhando para a frente.
       dançar (Baladinha): no ritmo, o peso vai de uma perna para a outra, o joelho do outro lado dobra, o quadril
       balança e o corpo desce em cada batida — sem a boneca inteira pular. */
    var modo = op.modo || '', modoIni = performance.now();
    function perna(u, lado) {   // u: 0 → 1 do ciclo desta perna (0 – 0,5 apoio; 0,5 – 1 no ar); lado -1 esquerda, 1 direita
      var dentro = lado * 7;   // pé na linha do meio (girar a perna para dentro, até o pé cruzar)
      if (u < 0.5) return { x: 0, y: 0, r: dentro, sy: 1 };
      var w = (u - 0.5) / 0.5, sob = Math.sin(Math.PI * w);
      return { x: 0, y: -10 * sob + 4 * w * w, r: dentro * (0.3 + 0.7 * w) + lado * 3 * sob + dentro * 0.25 * w, sy: 1 - 0.1 * sob };
    }
    function mover(v, t) {
      if (modo === 'andar') {
        var P = op.passoMs || 980, f = ((t - modoIni) / P) % 1, a = Math.sin(2 * Math.PI * f);
        var e = perna(f, -1), d = perna((f + 0.5) % 1, 1);
        v.ex = e.x; v.ey = e.y; v.er = e.r; v.esy = e.sy; v.dx = d.x; v.dy = d.y; v.dr = d.r; v.dsy = d.sy;
        // o quadril vai para o lado da perna de apoio pelo rebolado (curva do corpo inteiro), sem arrastar pedaços
        // (dono, 21/Nov/2026, vídeo de mulheres andando: "jeito de andar"): quadril gingando bem para o lado da perna de
        // apoio, ombros firmes, cabeça parada olhando para a frente, o corpo descendo de leve em cada passo
        v.cx = 0; v.cr = 0; v.q = -1.25 * a; v.cy = -3 * Math.abs(Math.sin(2 * Math.PI * f)) + 1.5; v.s = -3 * a;
        v.ey += v.cy; v.dy += v.cy;   // as pernas sobem e descem junto com o corpo
        // braços soltos e colados ao corpo, ao contrário das pernas: o que vai para a frente dobra o cotovelo, a mão sobe
        // e vem um pouco para o meio (o braço de cima "encurta" vindo para a frente); o que vai para trás fica quase reto,
        // com a mão um pouquinho para fora do quadril
        var fa = Math.max(0, a), fb = Math.max(0, -a);
        v.oE = 7 - 3 * a; v.cE = 8 + 30 * fa; v.fE = 1 - 0.12 * fa;
        v.oD = 7 + 3 * a; v.cD = 8 + 30 * fb; v.fD = 1 - 0.12 * fb;
        v.cab = -1 * a; v.olho = 0;
      } else if (modo === 'dancar') {
        var B2 = op.batida || 500, g = ((t - modoIni) / B2) % 2, lado = g < 1 ? 1 : -1, w = g % 1, bat = Math.sin(Math.PI * w);
        v.q += lado * bat;   // o quadril rebola para o lado da batida (curva do corpo inteiro; sem descer só o tronco)
        // a perna do lado contrário ao quadril dobra o joelho (sobe um pouco e encolhe)
        if (lado > 0) { v.esy = 1 - 0.07 * bat; v.ey += -6 * bat; v.er += 2 * bat; } else { v.dsy = 1 - 0.07 * bat; v.dy += -6 * bat; v.dr += -2 * bat; }
        v.oE += 4 * bat; v.oD += 4 * bat;
      }
    }
    function passo(t) {
      if (!vivo) return;
      if (op.enquanto && !op.enquanto()) { vivo = false; return; }   // a tela acabou (ex.: saiu do desfile)
      if (op.proxima && t > prox) { trocar(op.proxima(nomeAtual), op.dur); prox = t + (op.segura || 3200); }   // passo sorteado
      else if (lista.length > 1 && t > prox) { i = (i + 1) % lista.length; trocar(lista[i], op.dur); prox = t + (op.segura || 3200); if (op.aoTrocar) op.aoTrocar(lista[i], i); }
      var k = Math.min(1, (t - ini) / dur), e = suave(k), v = {};
      for (var c in para) v[c] = de[c] + (para[c] - de[c]) * e;
      v.aceno = para.aceno;
      if (modo) mover(v, t);
      amp += (ampAlvo - amp) * 0.06;   // muda de amplitude devagar, sem tranco
      atual = v; aplicar(v, t);
      quadro = requestAnimationFrame(passo);
    }
    trocar(lista[0], 10);
    quadro = requestAnimationFrame(passo);
    return {
      trocar: function (nome, ms) { trocar(nome, ms); prox = performance.now() + (op.segura || 3200); },
      pose: function () { return nomeAtual; },
      amplitude: function (a) { ampAlvo = a; },
      modo: function (m) { if (m !== modo) { modo = m || ''; modoIni = performance.now(); } },
      parar: function () { vivo = false; cancelAnimationFrame(quadro); },
      lista: function (l) { lista = l; i = 0; prox = performance.now() + (op.segura || 3200); trocar(l[0]); }
    };
  }
  raiz.PurpurinaAnim = { criar: criar, POSES: POSES };
})(typeof window !== 'undefined' ? window : this);
