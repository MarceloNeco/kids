/* Purpurina 80's — Baladinha (dono, 20/Nov/2026, com vídeos de referência de uma sala de luzes: "fazer uma versão
   adicional de baladinha além do desfile… e com as amigas dançando"). Sala escura com a parede lavada de luz colorida
   (azul, rosa, amarelo), a flor de luz com o coração, o coração espelhado pendurado e o chão refletindo as cores. A
   personagem dança no meio e até 2 amigas dos lados (looks guardados; sem looks, combinações prontas); cada uma tem
   2 sombras coloridas na parede que fazem os mesmos passos (o animador.js mexe a dançarina e as sombras juntas).
   Tocar na tela troca a cor da luz e todas fazem o mesmo passo juntas. As pernas dançam no ritmo (animador.js, modo
   'dancar': o peso passa de uma perna para a outra e o joelho dobra), em vez de a boneca inteira pular.
   PurpurinaBalada.iniciar(palco, [estado, amiga1, amiga2], { enquanto, calmo }) → { parar(), trocarLuz() }
   PurpurinaBalada.sala() → o SVG da sala (desenhado largo: em tela deitada aparece mais parede, sem cortar ninguém) */
(function (raiz) {
  'use strict';
  var B = raiz.PurpurinaBoneca, A = raiz.PurpurinaAnim;
  var PASSOS = ['bracosCima', 'umCimaD', 'umCimaE', 'cotovelos', 'palminhas', 'apontaCima', 'olhaE', 'olhaD'];
  // cada dançarina: onde fica (x e pés na cena 400 × 720), altura da caixa do desenho e as cores das 2 sombras
  // sombras como no vídeo: cada luz colorida faz uma cópia da sombra, lado a lado (verde, rosa, azul)
  var LUGARES = [{ x: 200, pe: 668, alt: 470 }, { x: 78, pe: 628, alt: 420 }, { x: 322, pe: 628, alt: 420 }];
  var SOMBRAS = [{ cor: '#2ee86a', dx: 14 }, { cor: '#ff2fb0', dx: 30 }, { cor: '#2f6bff', dx: 46 }];
  var PAREDE_PE = 560;   // onde a parede encontra o chão
  var LUZES = 4;         // quantas combinações de luz (estilo.css: .bal-luz-0 … 3)

  // a sala em camadas: o que se mexe (luzes lavando a parede, flor de luz) fica em camada própria, que só desliza ou
  // gira (o celular não redesenha o borrado a cada quadro)
  function abre(cls) { return '<svg class="bal-camada ' + cls + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 720" preserveAspectRatio="xMidYMax meet" aria-hidden="true">'; }
  var BORRA = '<filter id="balBorra" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>' +
    '<filter id="balBorraG" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="38"/></filter>';
  function fundo() {
    var s = abre('bal-fundo') + '<defs><linearGradient id="balChao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2b6e"/><stop offset="1" stop-color="#14123a"/></linearGradient></defs>';
    // teto (lá em cima, aparece em tela comprida) e parede
    s += '<rect x="-1400" y="-900" width="3200" height="860" fill="#0c0b1d"/>';
    for (var x = -1400; x < 1800; x += 80) s += '<line x1="' + x + '" y1="-900" x2="' + x + '" y2="-40" stroke="#1d1b38" stroke-width="2"/>';
    for (var y = -860; y < -40; y += 80) s += '<line x1="-1400" y1="' + y + '" x2="1800" y2="' + y + '" stroke="#1d1b38" stroke-width="2"/>';
    s += '<rect class="bal-parede" x="-1400" y="-40" width="3200" height="' + (PAREDE_PE + 40) + '"/>';
    // refletores no alto, com a luzinha vermelha
    [70, 150, 250, 330].forEach(function (x) { s += '<rect x="' + (x - 9) + '" y="-34" width="18" height="16" rx="3" fill="#050410"/><circle cx="' + x + '" cy="-16" r="4" fill="#ff3b4a"/>'; });
    // chão
    s += '<rect x="-1400" y="' + PAREDE_PE + '" width="3200" height="700" fill="url(#balChao)"/>' +
      '<rect x="-1400" y="' + (PAREDE_PE - 2) + '" width="3200" height="4" fill="#000" opacity=".3"/>';
    return s + '</svg>';
  }
  // luzes coloridas lavando a parede e refletindo no chão (a camada desliza devagar: estilo.css .bal-lavar)
  function lavar() {
    return abre('bal-lavar') + '<defs>' + BORRA + '</defs><g filter="url(#balBorraG)">' +
      '<ellipse class="bal-l1" cx="10" cy="300" rx="120" ry="280"/><ellipse class="bal-l3" cx="390" cy="300" rx="120" ry="280"/>' +
      '<ellipse class="bal-l2" cx="-240" cy="300" rx="170" ry="280"/><ellipse class="bal-l2" cx="640" cy="300" rx="170" ry="280"/>' +
      '<ellipse class="bal-l3" cx="-560" cy="300" rx="170" ry="280"/><ellipse class="bal-l1" cx="960" cy="300" rx="170" ry="280"/></g>' +
      '<g filter="url(#balBorraG)" opacity=".4"><ellipse class="bal-l1" cx="60" cy="690" rx="170" ry="80"/><ellipse class="bal-l2" cx="200" cy="700" rx="120" ry="70"/><ellipse class="bal-l3" cx="340" cy="690" rx="170" ry="80"/></g></svg>';
  }
  // flor de luz: bolinhas brancas em volta do coração (a camada gira devagar em volta do centro da flor)
  var FLOR = [200, 130];
  function flor() {
    var s = abre('bal-flor') + '<defs>' + BORRA + '</defs><g filter="url(#balBorra)">';
    for (var k = 0; k < 8; k++) {
      var a = k / 8 * Math.PI * 2;
      s += '<circle cx="' + (FLOR[0] + Math.cos(a) * 64).toFixed(1) + '" cy="' + (FLOR[1] + Math.sin(a) * 64).toFixed(1) + '" r="27" fill="#fff" opacity=".85"/>';
    }
    return s + '</g></svg>';
  }
  // coração pendurado no meio da flor, por cima das sombras
  function pendente() {
    var x = FLOR[0], y = FLOR[1] + 10;
    var r = '';
    // silhuetas recortadas nas pontas da parede (aparecem em tela deitada), na frente da luz
    [-120, 520].forEach(function (x, i) {
      r += '<g transform="translate(' + x + ' 300)' + (i ? ' scale(-1 1)' : '') + '" fill="#141443" stroke="#ff4d6d" stroke-width="2">' +
        '<circle cx="0" cy="-150" r="22"/><path d="M-26,-120 L26,-120 L34,40 L14,40 L10,250 L-10,250 L-14,40 L-34,40Z"/><path d="M20,-115 L70,-210 L80,-200 L36,-100Z"/></g>';
    });
    return abre('bal-pendente') + r + '<defs><linearGradient id="balEspelho" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8b6ff"/><stop offset=".5" stop-color="#a04fd6"/><stop offset="1" stop-color="#6a2a9c"/></linearGradient></defs>' +
      '<line x1="' + x + '" y1="-900" x2="' + x + '" y2="' + (y - 26) + '" stroke="#d9d4f0" stroke-width="1.2"/>' +
      '<path d="M' + x + ',' + (y + 26) + ' C' + (x - 30) + ',' + (y + 6) + ' ' + (x - 32) + ',' + (y - 22) + ' ' + (x - 14) + ',' + (y - 26) + ' C' + (x - 6) + ',' + (y - 28) + ' ' + (x - 1) + ',' + (y - 22) + ' ' + x + ',' + (y - 16) +
      ' C' + (x + 1) + ',' + (y - 22) + ' ' + (x + 6) + ',' + (y - 28) + ' ' + (x + 14) + ',' + (y - 26) + ' C' + (x + 32) + ',' + (y - 22) + ' ' + (x + 30) + ',' + (y + 6) + ' ' + x + ',' + (y + 26) + 'Z" fill="url(#balEspelho)" opacity=".92"/>' +
      '<path class="bal-brilho" d="M' + (x - 12) + ',' + (y - 16) + ' l2,-6 l2,6 l6,2 l-6,2 l-2,6 l-2,-6 l-6,-2Z" fill="#fff"/></svg>';
  }
  function sala() { return fundo() + lavar() + flor(); }

  function iniciar(palco, estados, op) {
    op = op || {};
    var calmo = !!op.calmo, vivo = true, anims = [], caixas = [], luz = 0;
    palco.innerHTML = sala();
    var florEl = palco.querySelector('.bal-flor');
    var sombras = document.createElement('div'); sombras.className = 'bal-sombras'; palco.appendChild(sombras);
    palco.insertAdjacentHTML('beforeend', pendente());
    var gente = document.createElement('div'); gente.className = 'bal-gente'; palco.appendChild(gente);
    palco.className = palco.className.replace(/\bbal-luz-\d\b/g, '').trim() + ' bal-luz-0';
    // ordem: amigas atrás, a personagem na frente
    estados.slice(0, 3).map(function (e, i) { return { e: e, i: i }; }).reverse().forEach(function (d) {
      var L = LUGARES[d.i], minhas = [];
      SOMBRAS.forEach(function (sb, j) {
        var c = document.createElement('div'); c.className = 'bal-caixa bal-sombra'; c.style.color = sb.cor; c.setAttribute('data-de', 'bd' + d.i);   // (GIF: a sombra usa o desenho da dançarina)
        c.innerHTML = B.svg(d.e, { id: 'bs' + d.i + j, fundo: false, anim: false, realce: false, passos: !calmo, rig: !calmo, joelho: false });
        sombras.appendChild(c); minhas.push(c); caixas.push({ el: c, x: L.x + sb.dx, pe: PAREDE_PE + 6, alt: L.alt * 1.04 });
      });
      var c = document.createElement('div'); c.className = 'bal-caixa bal-dancarina'; c.setAttribute('data-id', 'bd' + d.i);
      c.innerHTML = B.svg(d.e, { id: 'bd' + d.i, fundo: false, anim: !calmo, realce: false, passos: !calmo, rig: !calmo, sorriso: true, joelho: false });
      gente.appendChild(c); caixas.push({ el: c, x: L.x, pe: L.pe, alt: L.alt });
      if (!calmo) anims.push(A.criar(c, { poses: [PASSOS[d.i * 2 % PASSOS.length]], copias: minhas, copiasCada: 3, defasagem: d.i, dur: 380, modo: 'dancar', batida: 500, segura: 1500 + d.i * 250, ritmo: 1000,
        enquanto: function () { return vivo && (!op.enquanto || op.enquanto()); },
        proxima: function (antes) { var l = PASSOS.filter(function (p) { return p !== antes; }); return l[Math.floor(Math.random() * l.length)]; } }));
    });
    // posição: a cena é "meet" pela base (xMidYMax), então a conta é a mesma em pé e deitado
    function lugar() {
      var W = palco.clientWidth, H = palco.clientHeight, s = Math.min(W / 400, H / 720), ox = (W - 400 * s) / 2, oy = H - 720 * s;
      if (florEl) florEl.style.transformOrigin = Math.round(ox + FLOR[0] * s) + 'px ' + Math.round(oy + FLOR[1] * s) + 'px';
      caixas.forEach(function (c) {
        var h = c.alt * s, w = h * 400 / 720;
        c.el.style.width = Math.round(w) + 'px'; c.el.style.height = Math.round(h) + 'px';
        c.el.style.left = Math.round(ox + c.x * s - w / 2) + 'px'; c.el.style.top = Math.round(oy + c.pe * s - 0.91 * h) + 'px';
      });
    }
    lugar();
    raiz.addEventListener('resize', lugar);
    function trocarLuz() {
      luz = (luz + 1) % LUZES;
      palco.className = palco.className.replace(/\bbal-luz-\d\b/g, '').trim() + ' bal-luz-' + luz;
      // todas juntas no mesmo passo (coreografia)
      var p = PASSOS[Math.floor(Math.random() * 6)];
      anims.forEach(function (a) { a.trocar(p, 380); });
    }
    return {
      trocarLuz: trocarLuz,
      parar: function () { vivo = false; anims.forEach(function (a) { a.parar(); }); raiz.removeEventListener('resize', lugar); }
    };
  }
  raiz.PurpurinaBalada = { iniciar: iniciar, sala: sala, PASSOS: PASSOS };
})(typeof window !== 'undefined' ? window : this);
