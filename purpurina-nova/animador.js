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
  /* perfis de movimento (dono, 21/Nov/2026, especificação "motor biomecânico dual"): a menina continua como está; o
     menino (criança, adolescente ou adulto) anda com as pernas em trilhos paralelos (sem cruzar o pé na linha do meio),
     o quadril quase parado (só passa o peso de leve, sem rebolar), os braços balançando mais soltos e um pouco afastados
     do corpo, e parado fica plantado (sem quadril jogado para o lado, sem mão na cintura). Tudo aqui num lugar só. */
  var BIO = {
    feminino: { quadril: 1.25, parado: 1, cruza: 1, abre: 7, abreVai: 3, cotovelo: 30, frente: 0.12, quique: 1, cadencia: 1, troca: {} },
    masculino: { quadril: 0.2, parado: 0.2, cruza: 0, abre: 10, abreVai: 4, cotovelo: 24, frente: 0.18, quique: 1, cadencia: 1,
      troca: { cintura: 'bolsos', duasCintura: 'cruzados', cabeca: 'relax', beijo: 'tchau', maoCabelo: 'olhaD', carinha: 'relax' } },
    // menino pequeno anda mais rápido e quica mais; adolescente e adulto, passos mais compassados
    idadeMasculino: { pequena: { cadencia: 1.25, quique: 1.3 }, crianca: { cadencia: 1.25, quique: 1.3 }, adolescente: { cadencia: 0.95, quique: 1 }, adulta: { cadencia: 0.95, quique: 1 } }
  };
  function suave(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }

  function criar(caixa, op) {
    op = op || {};
    var atual = valores('relax'), de = atual, para = atual, ini = 0, dur = 900, vivo = true, quadro = 0, nomeAtual = 'relax';
    var lista = op.poses || ['relax'], i = 0, prox = performance.now() + (op.primeira || 1800);
    // amplitude do balanço (dono, 20/Nov/2026: maquiando, "zoom no olho, na boca, com um leve movimento"): 1 de corpo
    // inteiro; perto do rosto o quadril e as pernas quase param e sobra o sutil — cabeça, olhos, respiração
    var amp = 1, ampAlvo = 1, quadros = op.defasagem || 0;
    // o perfil vem do próprio desenho (boneca.js marca data-perfil e data-idade no <svg>)
    function perfil() {
      var s = caixa.querySelector('svg'), m = s && s.getAttribute('data-perfil') === 'masculino', b = m ? BIO.masculino : BIO.feminino;
      if (!m) return b;
      var ida = BIO.idadeMasculino[s.getAttribute('data-idade')] || {}, o = {};
      for (var k in b) o[k] = b[k];
      if (ida.cadencia) o.cadencia = ida.cadencia; if (ida.quique) o.quique = ida.quique;
      return o;
    }
    function trocar(nome, ms) { nome = perfil().troca[nome] || nome; nomeAtual = nome; de = atual; para = valores(nome); ini = performance.now(); dur = ms || 900; }
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
        // mão na nuca: o antebraço e a mão passam para trás da cabeça (a cópia de trás aparece e a da frente some)
        var atr = B.maoAtras(b[1], b[2]) ? '1' : '0';
        if (om.getAttribute('data-atras') !== atr) {
          om.setAttribute('data-atras', atr);
          Array.prototype.forEach.call(svg.querySelectorAll('.rig-atras-' + b[0]), function (g) { g.style.display = atr === '1' ? '' : 'none'; });
          Array.prototype.forEach.call(svg.querySelectorAll('.rig-frente-' + b[0]), function (g) { g.style.display = atr === '1' ? 'none' : ''; });
        }
        var tc = B.transformaCotovelo(b[0] === 'e' ? -b[2] : b[2], b[3], E);
        for (var q = 0; q < cos.length; q++) cos[q].setAttribute('transform', tc);   // contorno e preenchimento do antebraço
      });
      // rebolado: o quadril vai até ~12 px para o lado (e devagarinho sempre um pouco, para ela nunca ficar dura). Pernas
      // inclinam a partir dos pés; o tronco sai do quadril e volta um pouco nos ombros; a linha do quadril é a mesma nas
      // duas, então nada desencaixa (boneca.js, .pp-rebola)
      var rb = svg.querySelector('.pp-rebola'), tC = 0;
      // pulo: a personagem inteira sobe e desce (a sombra no chão fica no chão)
      if (rb) { if (v.pulo) rb.setAttribute('transform', 'translate(0 ' + (v.pulo * amp).toFixed(2) + ')'); else if (rb.hasAttribute('transform')) rb.removeAttribute('transform'); }
      if (rb) {
        var h = (v.q + (modo === 'andar' ? 0 : Math.sin(t / 1700) * 0.3 * (v.qParado == null ? 1 : v.qParado))) * amp * 12;
        var yJ = +rb.getAttribute('data-y'), yS = +rb.getAttribute('data-ombro'), yP = +rb.getAttribute('data-pe');
        // os ombros voltam com um pouquinho de atraso em relação ao quadril (v.qS, andando): nada chega junto ao mesmo tempo
        var sB = -h / (yP - yJ); tC = 0.25 * (v.qS != null ? v.qS * amp * 12 : h) / (yJ - yS);
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
      // a perna da frente vai por cima da outra (na passada as pernas se cruzam: a que vem para a frente passa na frente)
      if (v.frenteE != null) {
        var fr = v.frenteE ? 'e' : 'd', tr = v.frenteE ? 'd' : 'e';
        Array.prototype.forEach.call(svg.querySelectorAll('.pp-passo-' + fr), function (gf) {
          var gt = gf.parentNode && gf.parentNode.querySelector(':scope > .pp-passo-' + tr);
          if (gt && (gt.compareDocumentPosition(gf) & Node.DOCUMENT_POSITION_PRECEDING)) gf.parentNode.insertBefore(gt, gf);
        });
      }
      /* pé no chão de verdade (dono, 22/Nov/2026): o sapato não inclina nem estica junto com a perna — gira e estica ao
         contrário em volta do tornozelo, então fica reto no piso; e a sombrinha de cada pé fica no chão, embaixo dele,
         mais clara e menor quando o pé levanta */
      [['e', v.er || 0, v.esy || 1, v.ex || 0, v.sobeE || 0], ['d', v.dr || 0, v.dsy || 1, v.dx || 0, v.sobeD || 0]].forEach(function (pl) {
        var rr = pl[1] * amp, sy = 1 + (pl[2] - 1) * amp;
        Array.prototype.forEach.call(svg.querySelectorAll('.pp-passo-' + pl[0] + ' .pp-sapato-frente'), function (g) {
          var a = (g.getAttribute('data-a' + pl[0]) || '').split(',').map(Number); if (a.length < 2) return;
          g.setAttribute('transform', 'translate(' + a[0] + ' ' + a[1] + ') scale(1 ' + (1 / sy).toFixed(4) + ') rotate(' + (-rr).toFixed(2) + ') translate(' + (-a[0]) + ' ' + (-a[1]) + ')');
        });
        var sb = svg.querySelector('.pp-sombra-pe-' + pl[0]);
        if (sb) {
          var p = sb.getAttribute('data-p').split(',').map(Number), q = sb.getAttribute('data-q').split(',').map(Number), ra = rr * Math.PI / 180;
          var dx = p[0] - q[0], dy = (p[1] - q[1]) * sy;
          sb.setAttribute('cx', (q[0] + pl[3] * amp + Math.cos(ra) * dx - Math.sin(ra) * dy).toFixed(1));
          sb.setAttribute('cy', Math.min(670, q[1] + Math.sin(ra) * dx + Math.cos(ra) * dy).toFixed(1));
          var ar = v.noAr || 0;
          sb.setAttribute('rx', (20 * (1 - 0.35 * pl[4]) * (1 - 0.3 * ar)).toFixed(1)); sb.setAttribute('opacity', (0.28 * (1 - 0.6 * pl[4]) * (1 - 0.6 * ar)).toFixed(3));
        }
      });
      // vitrine dos sapatos: troca o sapato de frente pelo de lado só na perna que está levantada
      [['e', !!v.ladoE], ['d', !!v.ladoD]].forEach(function (pl) {
        var g = svg.querySelector('.pp-passo-' + pl[0]), lig = pl[1] ? '1' : '0'; if (!g || g.getAttribute('data-lado') === lig) return;
        Array.prototype.forEach.call(svg.querySelectorAll('.pp-passo-' + pl[0]), function (gg) {
          gg.setAttribute('data-lado', lig);
          Array.prototype.forEach.call(gg.querySelectorAll('.pp-sapato-lado-' + pl[0]), function (x) { x.style.display = pl[1] ? '' : 'none'; });
          Array.prototype.forEach.call(gg.querySelectorAll('.pp-sapato-frente'), function (x) { x.style.display = pl[1] ? 'none' : ''; });
        });
      });
      Array.prototype.forEach.call(svg.querySelectorAll('.pp-barra'), function (g) { g.style.transformBox = 'view-box'; g.style.transform = 'skewX(' + (v.s * amp).toFixed(2) + 'deg)'; });
    }
    /* andar de modelo (dono, 20/Nov/2026: "desfile realista"): ciclo de 2 passos. A perna de apoio fica embaixo do
       corpo e a que anda sobe (o joelho dobra) e pousa cruzando na linha do meio, um pé na frente do outro; o quadril vai
       para o lado da perna de apoio e inclina, o corpo sobe e desce um pouco, os braços balançam soltos ao contrário das
       pernas e a cabeça fica firme, olhando para a frente.
       dançar (Baladinha): no ritmo, o peso vai de uma perna para a outra, o joelho do outro lado dobra, o quadril
       balança e o corpo desce em cada batida — sem a boneca inteira pular. */
    var modo = op.modo || '', modoIni = performance.now();
    /* uma perna no ciclo (u: 0 → 1; 0 – 0,5 no chão, 0,5 – 1 no ar; lado -1 esquerda, 1 direita).
       De frente, "ir para a frente" é o pé descer na tela (fica mais perto de quem olha) e "ficar para trás" é subir:
       no chão, o pé fica parado no piso enquanto o corpo passa por cima dele, então, em relação ao corpo, ele vai da
       frente (embaixo) para trás (em cima); no ar, ele volta de trás para a frente, levantando, e pousa na frente.
       frente: +1 = pé da frente, -1 = pé de trás (a perna da frente é desenhada por cima da outra — animador ordena).
       (dono, 22/Nov/2026: "as pernas se sobrepondo incorretamente… parece flutuar e não caminhar") */
    function perna(u, lado, cruza) {
      var dentro = lado * 7 * cruza;   // pé na linha do meio (girar a perna para dentro, até o pé cruzar); menino: 0 (trilhos paralelos)
      var frente = u < 0.5 ? 1 - 4 * u : -1 + 4 * (u - 0.5);
      var compr = 1 + 0.05 * frente;   // pé da frente mais embaixo (perna "mais comprida" na tela), o de trás mais em cima
      /* linha única de passarela (dono, 22/Nov/2026, com o GIF do desfile: "as pernas abrem para fora, como montando a
         cavalo"): na menina as pernas SEMPRE fecham para a linha do meio — nunca abrem para fora do quadril. O pé da frente
         cruza por inteiro (pousa na frente do outro, na linha do meio); o de trás fica um pouco menos cruzado. No ar a perna
         vem reta para a frente, sem contornar por fora; a perna que está na frente é desenhada por cima (troca no meio da
         passada), então uma passa NA FRENTE da outra, não "por dentro". Menino: cruza = 0 (trilhos paralelos). */
      var cruzado = dentro * (0.62 + 0.38 * Math.max(0, frente));
      if (u < 0.5) return { x: 0, y: 0, r: cruzado, sy: compr, frente: frente };
      var w = (u - 0.5) / 0.5, sob = Math.sin(Math.PI * w);
      return { x: 0, y: -9 * sob, r: cruzado, sy: compr * (1 - 0.1 * sob), frente: frente, sobe: sob };
    }
    function mover(v, t) {
      if (modo === 'andar') {
        var pf = perfil(), P = (op.passoMs || 980) / pf.cadencia, f = ((t - modoIni) / P) % 1, W = 2 * Math.PI * f, a = Math.sin(W);
        // passo assimétrico: a perna sai do chão com impulso e desacelera antes de pousar (fase distorcida, não seno puro)
        function fase(x) { return (x + 0.22 * Math.sin(2 * Math.PI * x) / (2 * Math.PI) + 1) % 1; }
        var e = perna(fase(f), -1, pf.cruza), d = perna(fase((f + 0.5) % 1), 1, pf.cruza);
        v.ex = e.x; v.ey = e.y; v.er = e.r; v.esy = e.sy; v.dx = d.x; v.dy = d.y; v.dr = d.r; v.dsy = d.sy;
        v.frenteE = e.frente > d.frente;   // qual perna está na frente (desenhada por cima)
        v.sobeE = e.sobe || 0; v.sobeD = d.sobe || 0;   // quanto cada pé está no ar (sombra do pé)
        // o quadril vai para o lado da perna de apoio pelo rebolado (curva do corpo inteiro), sem arrastar pedaços
        // (dono, 21/Nov/2026, vídeo de mulheres andando: "jeito de andar"): quadril gingando bem para o lado da perna de
        // apoio, ombros firmes, cabeça parada olhando para a frente, o corpo descendo de leve em cada passo
        v.cx = 0; v.cr = 0; v.q = -pf.quadril * a; v.qS = -pf.quadril * Math.sin(W - 0.15); v.cy = (-3 * Math.abs(Math.sin(W)) + 1.5) * pf.quique; v.s = -3 * a * pf.quadril / 1.25;
        v.ey += v.cy; v.dy += v.cy;   // as pernas sobem e descem junto com o corpo
        // braços soltos e colados ao corpo, ao contrário das pernas: o que vai para a frente dobra o cotovelo, a mão sobe
        // e vem um pouco para o meio (o braço de cima "encurta" vindo para a frente); o que vai para trás fica quase reto,
        // com a mão um pouquinho para fora do quadril
        // (atrasos: o ombro vem 0,15 depois do quadril, o cotovelo 0,30 depois do ombro e a cabeça por último)
        var aO = Math.sin(W - 0.15), aC = Math.sin(W - 0.45), fa = Math.max(0, aO), fb = Math.max(0, -aO), ca = Math.max(0, aC), cb = Math.max(0, -aC);
        v.oE = pf.abre - pf.abreVai * aO; v.cE = 8 + pf.cotovelo * ca; v.fE = 1 - pf.frente * fa;
        v.oD = pf.abre + pf.abreVai * aO; v.cD = 8 + pf.cotovelo * cb; v.fD = 1 - pf.frente * fb;
        v.cab = -1 * Math.sin(W - 0.6); v.olho = 0;
      } else if (modo === 'vitrine') {
        /* vitrine dos sapatos (dono, 21/Nov/2026): um pé de cada vez sobe um pouco, vira para fora e mostra o sapato de
           lado; desce e volta de frente; depois o outro. O peso vai para a perna que fica no chão. Ciclo de 4,8 s. */
        var T = 4800, ph = ((t - modoIni) % T) / T, seg4 = Math.floor(ph * 4), u = ph * 4 - seg4, sobe = Math.sin(Math.PI * u);
        v.ladoE = false; v.ladoD = false;
        if (seg4 === 0) { v.ey += -12 * sobe; v.esy = 1 - 0.04 * sobe; v.er += 6 * sobe; v.q = 0.5 * sobe; v.ladoE = sobe > 0.35; }
        else if (seg4 === 2) { v.dy += -12 * sobe; v.dsy = 1 - 0.04 * sobe; v.dr += -6 * sobe; v.q = -0.5 * sobe; v.ladoD = sobe > 0.35; }
        else v.q = 0;
      } else if (modo === 'pular') {
        /* pulo de verdade (dono, 22/Nov/2026: "aquele pulinho sem movimentos de pulo… tá muito ruim"): agacha dobrando os
           joelhos (o corpo desce e os braços vão para trás), estica as pernas e sai do chão (braços sobem), no ar as
           pernas encolhem um pouco, pousa dobrando os joelhos para amortecer e volta a ficar em pé. Os pés só saem do
           chão no ar; a sombra no chão fica e diminui quando ela sobe. Ciclo de op.puloMs (1,1 s). */
        var TP = op.puloMs || 1100, up0 = ((t - modoIni) % TP) / TP, ag = 0, alto = 0, enc = 0, bra = 0;
        if (up0 < 0.28) { ag = Math.sin(up0 / 0.28 * Math.PI / 2); bra = -ag; }                       // agacha
        else if (up0 < 0.4) { var k1 = (up0 - 0.28) / 0.12; ag = 1 - k1; bra = -1 + 2 * k1; }          // impulso
        else if (up0 < 0.74) { var k2 = (up0 - 0.4) / 0.34; alto = Math.sin(Math.PI * k2); enc = alto; bra = 1; }   // no ar
        else if (up0 < 0.9) { var k3 = (up0 - 0.74) / 0.16; ag = 0.6 * Math.sin(Math.PI * k3); bra = 1 - k3; }  // pousa
        var syP = 1 - 0.065 * ag - 0.035 * enc;
        v.esy = syP; v.dsy = syP; v.ey = 0; v.dy = 0; v.er = 4 * ag - 3 * enc; v.dr = -4 * ag + 3 * enc; v.q = 0;   // agachada: joelhos abrem um pouco
        v.pulo = 23 * ag - 48 * alto; v.noAr = alto;   // agachado o corpo desce o mesmo tanto que a perna encolhe (pés no chão)
        var braco = Math.max(0, bra), atras = Math.max(0, -bra);
        v.oE = 22 + 128 * braco - 8 * atras; v.oD = v.oE; v.cE = 12 - 30 * braco + 18 * atras; v.cD = v.cE; v.fE = 1; v.fD = 1;
        v.cab = 0;
      } else if (modo === 'dancar') {
        var B2 = op.batida || 500, g = ((t - modoIni) / B2) % 2, lado = g < 1 ? 1 : -1, w = g % 1, bat = Math.sin(Math.PI * w);
        v.q += lado * bat * perfil().parado;   // o quadril rebola para o lado da batida (menino: só passa o peso de leve)
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
      // nunca 100% parada: duas ondas de ritmos diferentes somadas (não se repetem iguais) na cabeça, nos cotovelos e no
      // tronco; e o menino parado fica plantado (o quadril quase não vai para o lado)
      var pf0 = perfil(), seg = t / 1000, micro = Math.sin(seg * 1.7) * 0.6 + Math.cos(seg * 2.9) * 0.4;
      v.qParado = pf0.parado; v.q *= pf0.parado;
      if (modo !== 'andar') { v.cab += micro * 0.4; v.cE += micro * 0.6; v.cD -= micro * 0.6; v.q += micro * 0.04; }
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
