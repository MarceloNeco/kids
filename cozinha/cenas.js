/* Mão na Massa — cenas animadas feitas em código (SVG e canvas), sem arquivo de imagem:
   - recipientes (tigela de vidro, copo, liquidificador, panela, frigideira, assadeira, prato) que enchem de verdade;
   - despejar: o liquidificador / a tigela / o espremedor / a panela inclina PARA O LADO do recipiente, com o bico em
     cima dele, e o jorro (leite, massa, suco, ovo...) cai lá dentro enquanto ele enche;
   - a pia com a torneira aberta, a água caindo, as duas mãos esfregando e a espuma;
   - o menininho comendo o prato pronto (garfo e faquinha, mastiga, lambe os lábios, "Hmm!") e a foto para guardar.
   Animação só com transform/atributos e requestAnimationFrame; com "reduzir movimento" fica tudo parado (pose bonita).
   Não sabe nada do jogo: o app.js passa cores, textos e tempos. window.CozinhaCenas. */
(function (raiz) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function q(n) { return Math.round(n * 10) / 10; }
  function mix(a, b, p) { return a + (b - a) * p; }
  function suave(p) { p = Math.max(0, Math.min(1, p)); return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  var uid = 0;

  // ---------- cor e jeito de cair de cada ingrediente ----------
  var COR = { peixe: '#a9c2d6', laranja: '#ff9f1a', banana: '#ffe27a', maca: '#f25c4a', morango: '#ff3b5c', uva: '#8e44ad', limao: '#e8e04a',
    cenoura: '#ff8a1a', tomate: '#e8432f', alface: '#7bc950', batata: '#e9c27a', cheiro: '#3fa34d', ovo: '#ffcf33', leite: '#ffffff',
    farinha: '#fbf3e4', acucar: '#ffffff', sal: '#f4f4f4', oleo: '#ffd84d', fermento: '#f3ead8', manteiga: '#ffe680', chocolate: '#6b3b1f',
    leitecond: '#fff1d0', granulado: '#ff4fa3', queijo: '#ffd84d', pao: '#e0a96d', mel: '#f2a900', polvilho: '#ffffff' };
  var JEITO = { farinha: 'po', acucar: 'po', sal: 'po', fermento: 'po', polvilho: 'po', leite: 'liquido', oleo: 'liquido', leitecond: 'liquido', mel: 'liquido', ovo: 'ovo', granulado: 'granulado' };
  function jeito(id) { return JEITO[id] || 'pedaco'; }
  function cor(id) { return COR[id] || '#f2c27a'; }
  // mistura de cores (média simples em RGB) para o que já está no recipiente
  function misturar(cores) {
    if (!cores.length) return null;
    var s = [0, 0, 0];
    cores.forEach(function (c) { var n = parseInt(c.slice(1), 16); s[0] += n >> 16; s[1] += (n >> 8) & 255; s[2] += n & 255; });
    return '#' + s.map(function (v) { var x = Math.round(v / cores.length).toString(16); return x.length < 2 ? '0' + x : x; }).join('');
  }

  // ---------- recipientes: origem (0,0) no meio do fundo; "vidro" mostra o nível pelo lado, "raso" mostra a mancha crescendo ----------
  // boca = centro da abertura (y); alt = altura útil para o nível (vidro); tipo.
  var RECIP = {
    tigela: { tipo: 'vidro', boca: -70, alt: 60, larg: 70,
      tras: '<ellipse cx="0" cy="-70" rx="70" ry="13" fill="#d6eefc" stroke="#5aa9d6" stroke-width="3"/>',
      corpo: 'M-70,-70 C-68,-22 -40,0 0,0 C40,0 68,-22 70,-70 Z',
      frente: '<path d="M-70,-70 C-68,-22 -40,0 0,0 C40,0 68,-22 70,-70" fill="rgba(200,236,255,.28)" stroke="#5aa9d6" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<path d="M-70,-70 A70,13 0 0 0 70,-70" fill="none" stroke="#5aa9d6" stroke-width="3.5"/><path d="M-52,-52 C-50,-30 -36,-16 -22,-11" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75"/>' +
        '<ellipse cx="0" cy="2" rx="26" ry="5" fill="#5aa9d6" opacity=".5"/>' },
    copo: { tipo: 'vidro', boca: -112, alt: 100, larg: 34,
      tras: '<ellipse cx="0" cy="-112" rx="34" ry="7" fill="#e6f5ff" stroke="#6bb6e0" stroke-width="3"/>',
      corpo: 'M-34,-112 L-27,0 L27,0 L34,-112 Z',
      frente: '<path d="M-34,-112 L-27,0 L27,0 L34,-112" fill="rgba(210,240,255,.25)" stroke="#6bb6e0" stroke-width="3.5" stroke-linejoin="round"/><path d="M-34,-112 A34,7 0 0 0 34,-112" fill="none" stroke="#6bb6e0" stroke-width="3.5"/>' +
        '<path d="M-24,-96 L-19,-12" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75"/><path d="M-6,-124 l8,-26" stroke="#ff5e9c" stroke-width="6" stroke-linecap="round"/>' },
    liquidificador: { tipo: 'vidro', boca: -132, alt: 84, larg: 36, fundo: -40,
      tras: '<ellipse cx="0" cy="-132" rx="36" ry="7" fill="#e6f5ff" stroke="#2c7fb8" stroke-width="3"/>',
      corpo: 'M-36,-132 L-26,-40 L26,-40 L36,-132 Z',
      frente: '<path d="M-36,-132 L-26,-40 L26,-40 L36,-132" fill="rgba(210,240,255,.3)" stroke="#2c7fb8" stroke-width="3.5" stroke-linejoin="round"/><path d="M-36,-132 A36,7 0 0 0 36,-132" fill="none" stroke="#2c7fb8" stroke-width="3.5"/>' +
        '<path d="M36,-118 h10 v40 h-14" fill="none" stroke="#2c7fb8" stroke-width="4" stroke-linejoin="round"/><path d="M-12,-48 l12,-7 l12,7" fill="none" stroke="#7d8a99" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M-26,-124 L-19,-50" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>' +
        '<path d="M-40,-40 h80 l6,40 h-92 z" fill="#e84a3c" stroke="#a62a1f" stroke-width="3" stroke-linejoin="round"/><circle cx="0" cy="-19" r="7" fill="#fff" stroke="#a62a1f" stroke-width="2.5"/>' },
    panela: { tipo: 'raso', boca: -84, cx: 0, cy: -84, rx: 54, ry: 11,
      tras: '<path d="M-60,-84 v62 a22,22 0 0 0 22,22 h76 a22,22 0 0 0 22,-22 v-62 z" fill="#8d99ae" stroke="#4a5568" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<path d="M-60,-62 h-16 M60,-62 h16" stroke="#4a5568" stroke-width="8" stroke-linecap="round"/><ellipse cx="0" cy="-84" rx="60" ry="14" fill="#3d4553" stroke="#4a5568" stroke-width="3.5"/>' +
        '<path d="M-48,-60 v34" stroke="#c3ccda" stroke-width="5" stroke-linecap="round" opacity=".7"/>' },
    frigideira: { tipo: 'raso', boca: -30, cx: -6, cy: -30, rx: 52, ry: 18,
      tras: '<path d="M58,-34 l64,-12" stroke="#5c3a1a" stroke-width="12" stroke-linecap="round"/><ellipse cx="-6" cy="-24" rx="70" ry="24" fill="#2d3748"/><ellipse cx="-6" cy="-30" rx="66" ry="22" fill="#4a5568" stroke="#2d3748" stroke-width="3"/>' +
        '<ellipse cx="-6" cy="-30" rx="58" ry="18" fill="#3a4250"/>' },
    forma: { tipo: 'raso', boca: -26, cx: 0, cy: -26, rx: 62, ry: 14, retangulo: true,
      tras: '<path d="M-82,-40 h164 l-12,36 h-140 z" fill="#9aa5b4" stroke="#4a5568" stroke-width="3.5" stroke-linejoin="round"/><path d="M-72,-37 h144 l-8,28 h-128 z" fill="#c9d3e0"/>' },
    prato: { tipo: 'raso', boca: -22, cx: 0, cy: -22, rx: 46, ry: 12,
      tras: '<ellipse cx="0" cy="-18" rx="78" ry="22" fill="#e9dfd2"/><ellipse cx="0" cy="-22" rx="76" ry="21" fill="#fff" stroke="#e0cdb5" stroke-width="3"/><ellipse cx="0" cy="-22" rx="52" ry="13" fill="#fbf6ee" stroke="#efe2d0" stroke-width="2"/>' }
  };
  // redemoinho da massa sendo mexida/batida (espiral redonda, achatada pela perspectiva do recipiente)
  var ESPIRAL = '<path class="redemoinho" d="M0,0 m-5,0 a5,5 0 1 1 10,0 a12,12 0 1 1 -24,0 a20,20 0 1 1 40,0 a28,28 0 1 1 -56,0" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="3.2" stroke-linecap="round"/>';
  function temRecipiente(id) { return !!RECIP[id]; }
  // devolve o <g> do recipiente (sem <svg> em volta), na posição x, y (fundo)
  function grupoRecipiente(id, x, y, esc) {
    var r = RECIP[id], n = ++uid, h = '<g class="recip r-' + id + '" data-recip="' + id + '" data-tipo="' + r.tipo + '" transform="translate(' + x + ' ' + y + ')' + (esc && esc !== 1 ? ' scale(' + esc + ')' : '') + '">';
    if (r.tipo === 'vidro') {
      var fundo = r.fundo || 0;
      h += '<clipPath id="cr' + n + '"><path d="' + r.corpo + '"/></clipPath>' + r.tras +
        '<g clip-path="url(#cr' + n + ')"><rect class="enche" data-nivel="0" data-fundo="' + fundo + '" data-alt="' + r.alt + '" x="-90" y="' + fundo + '" width="180" height="0" fill="#fff"/>' +
        '<ellipse class="enche-sup" cx="0" cy="' + fundo + '" rx="' + r.larg + '" ry="6" fill="#fff" opacity="0"/>' +
        '<g class="giro-sup" opacity="0" transform="translate(0 ' + (fundo - r.alt * 0.7) + ')"><g transform="scale(1 .32)">' + ESPIRAL + '</g></g></g>' +
        r.frente;
    } else {
      h += r.tras + '<g class="enche-raso" transform="translate(' + r.cx + ' ' + r.cy + ')">' +
        (r.retangulo ? '<rect class="enche" data-nivel="0" x="' + (-r.rx) + '" y="' + (-r.ry) + '" width="' + (2 * r.rx) + '" height="' + (2 * r.ry) + '" rx="8" fill="#fff" transform="scale(0)"/>'
          : '<ellipse class="enche" data-nivel="0" cx="0" cy="0" rx="' + r.rx + '" ry="' + r.ry + '" fill="#fff" transform="scale(0)"/>') +
        '<g class="giro-sup" opacity="0"><g transform="scale(1 .32)">' + ESPIRAL + '</g></g>' +
        '<g class="pilha"></g></g>';
    }
    h += '<circle class="boca" cx="' + (r.cx || 0) + '" cy="' + r.boca + '" r="1" fill="none"/></g>';
    return h;
  }
  // recipiente sozinho num <svg> (para pôr ingredientes, mexer, bater)
  function recipiente(id, classe) {
    var r = RECIP[id]; if (!r) return '';
    var alto = id === 'liquidificador' ? 150 : id === 'copo' ? 130 : id === 'panela' ? 104 : id === 'tigela' ? 90 : id === 'frigideira' ? 62 : 56;
    var largo = id === 'frigideira' ? 210 : id === 'forma' ? 180 : id === 'prato' ? 170 : id === 'panela' ? 170 : 150;
    var x0 = id === 'frigideira' ? -82 : -largo / 2;
    return '<svg class="recip-svg ' + (classe || '') + '" viewBox="' + x0 + ' ' + (-alto - 6) + ' ' + largo + ' ' + (alto + 10) + '" aria-hidden="true" focusable="false">' + grupoRecipiente(id, 0, 0) + '</svg>';
  }
  // nível de 0 a 1 e a cor do que está dentro
  function encher(raizEl, nivel, c) {
    var g = raizEl.querySelector('.recip'); if (!g) return;
    var e = g.querySelector('.enche'); nivel = Math.max(0, Math.min(1, nivel));
    e.setAttribute('data-nivel', nivel.toFixed(3)); if (c) e.setAttribute('fill', c);
    if (g.getAttribute('data-tipo') === 'vidro') {
      var fundo = +e.getAttribute('data-fundo'), alt = +e.getAttribute('data-alt'), h = alt * nivel;
      e.setAttribute('y', q(fundo - h)); e.setAttribute('height', q(h + 2));
      var s = g.querySelector('.enche-sup'); s.setAttribute('cy', q(fundo - h)); s.setAttribute('opacity', nivel > 0.02 ? '1' : '0'); if (c) s.setAttribute('fill', clarear(c));
      g.querySelector('.giro-sup').setAttribute('transform', 'translate(0 ' + q(fundo - h) + ')');
    } else e.setAttribute('transform', 'scale(' + q(0.15 + 0.85 * nivel) + ')' + (nivel <= 0 ? ' scale(0)' : ''));
  }
  function clarear(c) { var n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; function f(v) { var x = Math.round(v + (255 - v) * 0.35).toString(16); return x.length < 2 ? '0' + x : x; } return '#' + f(r) + f(g) + f(b); }
  // a altura (no desenho do recipiente) onde está a superfície agora
  function superficie(raizEl) {
    var g = raizEl.querySelector('.recip'), e = g.querySelector('.enche'), r = RECIP[g.getAttribute('data-recip')], n = +e.getAttribute('data-nivel');
    if (r.tipo === 'vidro') return (r.fundo || 0) - r.alt * n;
    return r.cy;
  }

  // ---------- de onde se despeja: o bico fica em cima e à DIREITA (o lado do recipiente); centro em (0,0) ----------
  var FONTE = {
    liquidificador: { bico: [38, -54], corpo: 'M-28,-48 L28,-48 L38,-55 L32,-40 L22,44 L-22,44 Z',
      fundo: '<path d="M-28,-34 C-50,-34 -50,18 -25,18" fill="none" stroke="#2c7fb8" stroke-width="6" stroke-linecap="round"/>',
      frente: '<path d="M-28,-48 L28,-48 L38,-55 L32,-40 L22,44 L-22,44 Z" fill="rgba(210,240,255,.3)" stroke="#2c7fb8" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<path d="M-10,36 l10,-6 l10,6" fill="none" stroke="#7d8a99" stroke-width="3" stroke-linecap="round"/><path d="M-18,-38 L-13,32" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>' },
    tigela: { bico: [50, -20], corpo: 'M-50,-20 C-48,16 -26,30 0,30 C26,30 48,16 50,-20 Z',
      fundo: '<ellipse cx="0" cy="-20" rx="50" ry="10" fill="#d6eefc" stroke="#5aa9d6" stroke-width="3"/>',
      frente: '<path d="M-50,-20 C-48,16 -26,30 0,30 C26,30 48,16 50,-20" fill="rgba(200,236,255,.3)" stroke="#5aa9d6" stroke-width="3.5"/><path d="M-50,-20 A50,10 0 0 0 50,-20" fill="none" stroke="#5aa9d6" stroke-width="3.5"/>' +
        '<path d="M-36,-6 C-34,8 -24,16 -14,18" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".75"/>' },
    espremedor: { bico: [38, -40], corpo: 'M-30,-34 L30,-34 L39,-41 L33,-26 L26,36 L-26,36 Z',
      fundo: '<path d="M-30,-20 C-48,-20 -48,22 -24,22" fill="none" stroke="#c99700" stroke-width="6" stroke-linecap="round"/>',
      frente: '<path d="M-30,-34 L30,-34 L39,-41 L33,-26 L26,36 L-26,36 Z" fill="rgba(255,240,180,.35)" stroke="#c99700" stroke-width="3.5" stroke-linejoin="round"/><path d="M-19,-24 L-15,28" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>' },
    panela: { bico: [46, -30], corpo: 'M-44,-30 L44,-30 L44,24 Q44,34 34,34 L-34,34 Q-44,34 -44,24 Z',
      fundo: '<path d="M-44,-20 L-92,-28" stroke="#3b2616" stroke-width="9" stroke-linecap="round"/>',
      frente: '<path d="M-44,-30 L44,-30 L44,24 Q44,34 34,34 L-34,34 Q-44,34 -44,24 Z" fill="#8d99ae" stroke="#4a5568" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<path d="M-34,-18 v40" stroke="#c3ccda" stroke-width="5" stroke-linecap="round" opacity=".7"/><ellipse cx="0" cy="-30" rx="44" ry="7" fill="none" stroke="#4a5568" stroke-width="3"/>', opaco: true }
  };
  var GIRO_DESP = 105;   // graus: positivo = horário = a boca vai para a DIREITA (onde está o recipiente)
  // cena inteira do despejo: a fonte à esquerda, o recipiente à direita, a bancada embaixo
  function cenaDespejo(deId, paraId) {
    var f = FONTE[deId] || FONTE.tigela, n = ++uid, para = RECIP[paraId] ? paraId : 'tigela';
    return '<svg class="cena-desp" viewBox="0 0 320 262" aria-hidden="true" focusable="false">' +
      '<rect x="0" y="252" width="320" height="10" rx="5" fill="#e2ad74"/>' +
      grupoRecipiente(para, 212, 252, para === 'frigideira' || para === 'forma' ? 0.9 : 1) +
      '<path class="jorro" d="M0,0" fill="none" stroke="#fff" stroke-width="0" stroke-linecap="round"/>' +
      '<path class="jorro-luz" d="M0,0" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="0" stroke-linecap="round" stroke-dasharray="6 10"/>' +
      '<g class="gotas"><circle r="2.6"/><circle r="2"/><circle r="2.4"/></g><g class="splash" opacity="0"><ellipse class="anel" rx="14" ry="4" fill="none" stroke-width="2.4"/></g>' +
      '<g class="fonte f-' + deId + '" data-giro="0"><clipPath id="cf' + n + '"><path d="' + f.corpo + '"/></clipPath>' + f.fundo +
      '<g clip-path="url(#cf' + n + ')"><g class="nivel-fonte"><rect x="-120" y="-20" width="240" height="200" fill="#fff"/></g></g>' + f.frente + '</g></svg>';
  }
  // anima o despejo dentro do elemento (que tem a .cena-desp). op: cor, grosso (massa), dur (ms), calmo, aoFim.
  // Devolve uma função que para tudo.
  function animarDespejo(el, op) {
    var svg = el.querySelector('.cena-desp'), fonte = svg.querySelector('.fonte'), deId = fonte.getAttribute('class').split(' f-')[1];
    var f = FONTE[deId] || FONTE.tigela, recip = svg.querySelector('.recip'), para = recip.getAttribute('data-recip'), R = RECIP[para];
    var jorro = svg.querySelector('.jorro'), luz = svg.querySelector('.jorro-luz'), gotas = svg.querySelectorAll('.gotas circle'), splash = svg.querySelector('.splash');
    var nivelF = svg.querySelector('.nivel-fonte rect'), c = op.cor || '#fff', esp = op.grosso ? 11 : 6.5;
    jorro.setAttribute('stroke', c); nivelF.setAttribute('fill', c);
    Array.prototype.forEach.call(gotas, function (g) { g.setAttribute('fill', c); });
    splash.querySelector('.anel').setAttribute('stroke', c === '#ffffff' || c === '#fff' ? '#cfe6f5' : c);
    var tr = /translate\(([-\d.]+) ([-\d.]+)\)(?: scale\(([-\d.]+)\))?/.exec(recip.getAttribute('transform')), RX = +tr[1], RY = +tr[2], RS = tr[3] ? +tr[3] : 1;
    var ESC = 0.85, CASA = [62, 252 - 44 * ESC], th = GIRO_DESP * Math.PI / 180;
    // onde o bico precisa ficar: em cima e um pouco à esquerda do meio do recipiente
    var alvoBico = [RX + (R.cx || 0) * RS - 6, RY + R.boca * RS - (R.tipo === 'vidro' ? 34 : 46)];
    function bicoEm(a) { var b = f.bico; return [ESC * (b[0] * Math.cos(a) - b[1] * Math.sin(a)), ESC * (b[0] * Math.sin(a) + b[1] * Math.cos(a))]; }
    var bo = bicoEm(th), DESP = [alvoBico[0] - bo[0], alvoBico[1] - bo[1]];
    var dur = op.dur || 2600, ini = null, raf = 0, vivo = true, acabou = false;
    function pose(t) {   // t de 0 a 1
      var p1 = suave(t / 0.3), p3 = suave((t - 0.82) / 0.18), sobe = t < 0.82 ? p1 : 1 - p3;
      var giroA = (t < 0.82 ? suave((t - 0.08) / 0.24) : 1 - p3) * GIRO_DESP;
      var x = mix(CASA[0], DESP[0], sobe), y = mix(CASA[1], DESP[1], sobe) - Math.sin(Math.PI * Math.min(1, t / 0.3)) * 10 * (t < 0.3 ? 1 : 0);
      fonte.setAttribute('transform', 'translate(' + q(x) + ' ' + q(y) + ') rotate(' + q(giroA) + ') scale(' + ESC + ')');
      fonte.setAttribute('data-giro', q(giroA));
      // o que está dentro da fonte fica com a superfície reta (gira ao contrário) e acaba no fim
      var a = giroA * Math.PI / 180, b = bicoEm(a), boca = b[1] / ESC;
      var vaza = Math.max(0, Math.min(1, (t - 0.3) / 0.52));
      var sup = Math.max(-18 + vaza * 70, boca + 2);
      nivelF.parentNode.setAttribute('transform', 'rotate(' + q(-giroA) + ')');
      nivelF.setAttribute('y', q(sup));
      // jorro: do bico até a superfície do que está no recipiente
      var corre = t >= 0.28 && t <= 0.86, forca = corre ? Math.min(1, (t - 0.28) / 0.06) * Math.min(1, (0.86 - t) / 0.06) : 0;
      var enche = Math.max(0, Math.min(1, (t - 0.32) / 0.5)), nivel = mix(N0, N1, enche);
      encher(svg, nivel, enche > 0 ? CA : null);
      var mx = x + b[0], my = y + b[1], ex = mx + 5, ey = RY + superficie(svg) * RS;
      if (R.tipo === 'raso') ey = RY + R.cy * RS;
      if (forca > 0.01) {
        var d = 'M' + q(mx) + ',' + q(my) + ' C' + q(mx + 7) + ',' + q(my + 4) + ' ' + q(ex) + ',' + q(mix(my, ey, 0.4)) + ' ' + q(ex) + ',' + q(ey);
        jorro.setAttribute('d', d); luz.setAttribute('d', d);
        jorro.setAttribute('stroke-width', q(esp * forca)); luz.setAttribute('stroke-width', q(esp * 0.35 * forca));
        luz.setAttribute('stroke-dashoffset', q(-(t * dur) / 12));
        Array.prototype.forEach.call(gotas, function (g, i) {
          var k = ((t * dur / 380) + i / 3) % 1;
          g.setAttribute('cx', q(ex + (i - 1) * 9 * k)); g.setAttribute('cy', q(ey - 14 * Math.sin(Math.PI * k))); g.setAttribute('opacity', op.calmo ? '0' : q(1 - k));
        });
        splash.setAttribute('opacity', '1'); splash.setAttribute('transform', 'translate(' + q(ex) + ' ' + q(ey) + ') scale(' + q(op.calmo ? 1 : 0.8 + 0.3 * Math.sin(t * dur / 70)) + ')');
        el.setAttribute('data-fase', 'despejando');
      } else {
        jorro.setAttribute('stroke-width', '0'); luz.setAttribute('stroke-width', '0'); splash.setAttribute('opacity', '0');
        Array.prototype.forEach.call(gotas, function (g) { g.setAttribute('opacity', '0'); });
        el.setAttribute('data-fase', t < 0.3 ? 'inclinando' : 'voltando');
      }
    }
    var N0 = op.n0 || 0, N1 = op.n1 || 0.82, CA = op.corAlvo || c;
    pose(0);
    if (op.calmo) {
      // movimento reduzido: aparece já inclinado, com o jorro e o recipiente cheio, sem mexer
      pose(0.6); encher(svg, N1, CA);
      var tm = setTimeout(function () { if (vivo) { acabou = true; if (op.aoFim) op.aoFim(); } }, Math.max(200, dur * 0.4));
      return function () { vivo = false; clearTimeout(tm); };
    }
    function quadro(ts) {
      if (!vivo) return;
      if (ini == null) ini = ts;
      var t = Math.min(1, (ts - ini) / dur);
      pose(t);
      if (t >= 1) { acabou = true; el.setAttribute('data-fase', 'pronto'); if (op.aoFim) op.aoFim(); return; }
      raf = requestAnimationFrame(quadro);
    }
    raf = requestAnimationFrame(quadro);
    return function () { vivo = false; cancelAnimationFrame(raf); return acabou; };
  }

  // ---------- pia: torneira aberta, água caindo, duas mãos (ou o que está sendo lavado) e espuma ----------
  var PELE = '#f6c49c', CONT = '#d98f63';
  function mao(espelho) {
    // mão aberta de lado, dedos para cima, polegar para dentro (desenhada para a esquerda; a outra é espelhada)
    var dedos = '';
    [[-14, -50, 22], [-5, -56, 25], [4, -54, 24], [12, -46, 20]].forEach(function (d) {
      dedos += '<rect x="' + (d[0] - 4.6) + '" y="' + d[1] + '" width="9.2" height="' + (d[2] + 14) + '" rx="4.6" fill="' + PELE + '" stroke="' + CONT + '" stroke-width="2.2"/>';
    });
    return '<g class="mao' + (espelho ? ' m-dir' : ' m-esq') + '"' + (espelho ? ' transform="scale(-1 1)"' : '') + '>' +
      '<rect x="-14" y="2" width="30" height="26" rx="6" fill="#3aa0e8" stroke="#1d6fb8" stroke-width="2.2"/><rect x="-15" y="0" width="32" height="8" rx="4" fill="#9ad4ff" stroke="#1d6fb8" stroke-width="2"/>' +
      dedos + '<path d="M-18,-30 C-20,-6 -14,4 0,4 C14,4 19,-6 18,-30 Z" fill="' + PELE + '" stroke="' + CONT + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M16,-24 C26,-28 32,-38 29,-44 C25,-48 18,-40 13,-34" fill="' + PELE + '" stroke="' + CONT + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M-9,-14 q4,3 9,0" fill="none" stroke="' + CONT + '" stroke-width="1.6" stroke-linecap="round" opacity=".6"/></g>';
  }
  var ESPUMA = [[-30, -42, 9], [32, -46, 8], [-8, -64, 10], [14, -70, 7], [-36, -18, 7], [36, -22, 9], [0, -36, 11], [-22, -76, 6], [26, -84, 6], [-16, -6, 8], [18, -10, 7], [-42, -54, 5], [44, -60, 6], [4, -90, 7], [-4, 2, 6], [30, 0, 5]];
  function cenaPia(comMaos) {
    var esp = ESPUMA.map(function (b, i) {
      return '<g transform="translate(' + b[0] + ' ' + b[1] + ')"><g class="bolha" data-i="' + i + '" style="--d:' + (i % 5) * 0.13 + 's"><circle r="' + b[2] + '" fill="rgba(255,255,255,.92)" stroke="#9fd3f5" stroke-width="1.6"/><circle cx="' + q(-b[2] * 0.35) + '" cy="' + q(-b[2] * 0.35) + '" r="' + q(b[2] * 0.25) + '" fill="#fff"/></g></g>';
    }).join('');
    return '<svg class="cena-pia" viewBox="0 0 240 230" aria-hidden="true" focusable="false">' +
      '<rect x="0" y="0" width="240" height="230" rx="22" fill="#e7f6ff"/><path d="M0,0 h240 v60 h-240z" fill="#d4eefc"/>' +
      '<g fill="#bfe3f7" opacity=".7"><rect x="14" y="10" width="34" height="34" rx="4"/><rect x="52" y="10" width="34" height="34" rx="4"/><rect x="154" y="10" width="34" height="34" rx="4"/><rect x="192" y="10" width="34" height="34" rx="4"/></g>' +
      // torneira
      '<rect x="106" y="0" width="28" height="18" rx="4" fill="#b9c3cc" stroke="#7d8a99" stroke-width="2.5"/><path d="M120,16 v10 q0,10 -10,10 h-2" fill="none" stroke="#7d8a99" stroke-width="13" stroke-linecap="round"/>' +
      '<path d="M120,16 v10 q0,10 -10,10 h-2" fill="none" stroke="#dde4ea" stroke-width="8" stroke-linecap="round"/><circle cx="146" cy="10" r="7" fill="#3aa0e8" stroke="#1d6fb8" stroke-width="2"/>' +
      // água
      '<path class="agua-cai" d="M106,42 C104,90 108,150 106,196" fill="none" stroke="#7cc8f5" stroke-width="12" stroke-linecap="round" opacity=".85"/>' +
      '<path class="agua-luz" d="M104,44 C102,90 106,150 104,194" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="10 14" opacity=".9"/>' +
      // pia
      '<path d="M18,186 h204 l-14,34 h-176 z" fill="#fff" stroke="#9fb3c4" stroke-width="3" stroke-linejoin="round"/><ellipse cx="120" cy="190" rx="96" ry="12" fill="#cfe9fa" stroke="#9fb3c4" stroke-width="3"/>' +
      '<ellipse cx="108" cy="192" rx="9" ry="3.5" fill="#7d8a99"/><g class="gotinhas"><circle cx="96" cy="188" r="3" fill="#7cc8f5"/><circle cx="118" cy="186" r="2.4" fill="#7cc8f5"/><circle cx="108" cy="184" r="2" fill="#7cc8f5"/></g>' +
      (comMaos ? '<g class="maos" transform="translate(110 150)"><g class="mao-e" transform="translate(-16 0) rotate(8)">' + mao(false) + '</g><g class="mao-d" transform="translate(16 0) rotate(-8)">' + mao(true) + '</g></g>' : '') +
      '<g class="espuma" transform="translate(110 150)">' + esp + '</g>' +
      '<g class="brilhos" opacity="0"><path d="M70,80 l4,10 l10,4 l-10,4 l-4,10 l-4,-10 l-10,-4 l10,-4z" fill="#ffd166"/><path d="M160,70 l3,8 l8,3 l-8,3 l-3,8 l-3,-8 l-8,-3 l8,-3z" fill="#ffd166"/>' +
      '<path d="M166,130 l3,7 l7,3 l-7,3 l-3,7 l-3,-7 l-7,-3 l7,-3z" fill="#fff"/><path d="M58,140 l3,7 l7,3 l-7,3 l-3,7 l-3,-7 l-7,-3 l7,-3z" fill="#fff"/></g></svg>';
  }
  // progresso de 0 a 1, ang = ângulo do dedo (as mãos esfregam junto com o dedo)
  function esfregar(el, prog, ang) {
    var me = el.querySelector('.mao-e'), md = el.querySelector('.mao-d');
    if (me) {
      me.setAttribute('transform', 'translate(' + q(-16 + 5 * Math.cos(ang)) + ' ' + q(7 * Math.sin(ang)) + ') rotate(' + q(8 + 4 * Math.sin(ang)) + ')');
      md.setAttribute('transform', 'translate(' + q(16 - 5 * Math.cos(ang)) + ' ' + q(-7 * Math.sin(ang)) + ') rotate(' + q(-8 - 4 * Math.sin(ang)) + ')');
    }
    var bs = el.querySelectorAll('.bolha'), n = Math.round(prog * bs.length);
    Array.prototype.forEach.call(bs, function (b, i) { b.classList.toggle('vis', i < n); });
  }

  // ---------- o menininho comendo ----------
  // Pose parada (sem animação, e a da foto): olhos felizes, a língua lambendo o lábio, garfo com um pedacinho, "Hmm!".
  function menino(op) {
    op = op || {};
    var c = op.cor || '#ff9f43', comida = op.prato || '🍰', hmm = op.hmm || 'Hmm!';
    var cam = '#ff8a3d', camEsc = '#d76b1f';
    return '<svg class="menino" xmlns="' + NS + '" viewBox="0 0 260 250" width="520" height="500" aria-hidden="true" focusable="false">' +
      '<circle cx="130" cy="112" r="104" fill="#fff3d6"/><circle cx="130" cy="112" r="104" fill="none" stroke="#ffd9a0" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round"/>' +
      // corpo e babador
      '<path d="M66,206 C66,164 92,148 130,148 C168,148 194,164 194,206 Z" fill="' + cam + '" stroke="' + camEsc + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M108,150 L130,186 L152,150 Z" fill="#fff" stroke="#e6d3bd" stroke-width="2.5" stroke-linejoin="round"/><circle cx="130" cy="166" r="4" fill="#ff5e9c"/>' +
      // braço da faquinha (parado)
      '<path class="braco-faca" d="M84,170 C76,186 78,196 92,200" fill="none" stroke="' + cam + '" stroke-width="16" stroke-linecap="round"/>' +
      '<g class="faquinha" transform="translate(94 200) rotate(-62)"><rect x="-2.6" y="-34" width="5.2" height="20" rx="2.6" fill="#ff8a3d" stroke="#b85a1a" stroke-width="1.6"/>' +
      '<path d="M-3,-14 h6 v22 q0,6 -3,8 q-3,-2 -3,-8 z" fill="#e6ecf2" stroke="#7d8a99" stroke-width="1.6" stroke-linejoin="round"/></g><circle cx="92" cy="200" r="8" fill="' + PELE + '" stroke="' + CONT + '" stroke-width="2"/>' +
      // cabeça
      '<g class="cabeca-m"><circle cx="84" cy="98" r="10" fill="' + PELE + '" stroke="' + CONT + '" stroke-width="2.5"/><circle cx="176" cy="98" r="10" fill="' + PELE + '" stroke="' + CONT + '" stroke-width="2.5"/>' +
      '<circle cx="130" cy="96" r="48" fill="' + PELE + '" stroke="' + CONT + '" stroke-width="3"/>' +
      '<path d="M86,82 C88,58 108,48 130,48 C152,48 172,58 174,82 C162,72 150,68 140,70 C134,62 120,62 112,70 C102,68 92,74 86,82 Z" fill="#6b3e1f"/>' +
      '<path d="M122,64 c-2,-8 6,-12 10,-6" fill="none" stroke="#6b3e1f" stroke-width="5" stroke-linecap="round"/>' +
      // chapéu de cozinheiro
      '<g class="chapeu"><circle cx="106" cy="34" r="16" fill="#fff" stroke="#e1d4c4" stroke-width="2.5"/><circle cx="154" cy="34" r="16" fill="#fff" stroke="#e1d4c4" stroke-width="2.5"/><circle cx="130" cy="24" r="20" fill="#fff" stroke="#e1d4c4" stroke-width="2.5"/>' +
      '<rect x="98" y="34" width="64" height="22" rx="7" fill="#fff" stroke="#e1d4c4" stroke-width="2.5"/><path d="M114,40 v10 M130,40 v10 M146,40 v10" stroke="#f1e6d6" stroke-width="3" stroke-linecap="round"/></g>' +
      // bochechas, olhos, sobrancelhas
      '<ellipse class="bochecha" cx="104" cy="114" rx="9" ry="6" fill="#ff8fa3" opacity=".55"/><ellipse class="bochecha" cx="156" cy="114" rx="9" ry="6" fill="#ff8fa3" opacity=".55"/>' +
      '<g class="olhos-abertos" opacity="0"><g class="olho" transform="translate(112 95)"><ellipse rx="6" ry="7.5" fill="#3b2412"/><circle cx="2" cy="-3" r="2.2" fill="#fff"/></g>' +
      '<g class="olho" transform="translate(148 95)"><ellipse rx="6" ry="7.5" fill="#3b2412"/><circle cx="2" cy="-3" r="2.2" fill="#fff"/></g></g>' +
      '<g class="olhos-felizes"><path d="M104,97 Q112,87 120,97" fill="none" stroke="#3b2412" stroke-width="3.6" stroke-linecap="round"/><path d="M140,97 Q148,87 156,97" fill="none" stroke="#3b2412" stroke-width="3.6" stroke-linecap="round"/></g>' +
      '<path d="M104,80 q8,-5 15,-1 M141,79 q7,-4 15,1" fill="none" stroke="#6b3e1f" stroke-width="2.6" stroke-linecap="round"/>' +
      // boca e língua
      '<g class="boca-g" transform="translate(130 120)"><path class="boca" d="M-11,0 Q0,4 11,0 Q0,13 -11,0 Z" fill="#9b2c3c" stroke="#6e1f2a" stroke-width="2" stroke-linejoin="round"/>' +
      '<ellipse class="lingua" cx="5" cy="-0.5" rx="5.5" ry="4.2" fill="#ff7b8a" stroke="#d94f63" stroke-width="1.4"/></g></g>' +
      // mesa, toalha, prato
      '<rect x="20" y="206" width="220" height="44" rx="8" fill="#fff" stroke="#f0c48a" stroke-width="3"/>' +
      '<path d="M20,206 h220 v10 h-220z" fill="#e84a3c" opacity=".85"/><path d="M40,206 v44 M80,206 v44 M120,206 v44 M160,206 v44 M200,206 v44" stroke="#e84a3c" stroke-width="10" opacity=".25"/>' +
      '<ellipse cx="130" cy="222" rx="64" ry="16" fill="#e9dfd2"/><ellipse cx="130" cy="218" rx="62" ry="15" fill="#fff" stroke="' + c + '" stroke-width="4"/>' +
      '<text class="comida" x="130" y="222" text-anchor="middle" font-size="46">' + comida + '</text>' +
      '<g class="vapor" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"><path class="v1" d="M108,180 c-6,-8 6,-12 0,-20"/><path class="v2" d="M130,174 c-6,-8 6,-12 0,-20"/><path class="v3" d="M152,180 c-6,-8 6,-12 0,-20"/></g>' +
      '<g class="faiscas-m" fill="#ffc93c"><path class="s1" d="M60,196 l3,7 l7,3 l-7,3 l-3,7 l-3,-7 l-7,-3 l7,-3z"/><path class="s2" d="M200,190 l2.5,6 l6,2.5 l-6,2.5 l-2.5,6 l-2.5,-6 l-6,-2.5 l6,-2.5z"/><path class="s3" d="M218,150 l2,5 l5,2 l-5,2 l-2,5 l-2,-5 l-5,-2 l5,-2z" fill="#ff5e9c"/></g>' +
      // braço do garfo (este se mexe)
      '<path class="braco-garfo" d="M176,170 C186,186 182,196 170,198" fill="none" stroke="' + cam + '" stroke-width="16" stroke-linecap="round"/>' +
      '<g class="garfo" transform="translate(170 198) rotate(-22)"><rect x="-2.8" y="-12" width="5.6" height="22" rx="2.8" fill="#3aa0e8" stroke="#1d6fb8" stroke-width="1.6"/>' +
      '<path d="M-6,-30 v10 q0,6 6,6 q6,0 6,-6 v-10 M0,-30 v14" fill="none" stroke="#9aa5b4" stroke-width="2.6" stroke-linecap="round"/><circle class="garfada" cx="0" cy="-30" r="6.5" fill="' + c + '" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/></g>' +
      '<circle class="mao-garfo" cx="170" cy="198" r="8" fill="' + PELE + '" stroke="' + CONT + '" stroke-width="2"/>' +
      // balão do "Hmm!"
      '<g class="hmm" transform="translate(206 44)"><path d="M-34,-18 h68 a10,10 0 0 1 10,10 v18 a10,10 0 0 1 -10,10 h-40 l-14,12 l2,-12 h-16 a10,10 0 0 1 -10,-10 v-18 a10,10 0 0 1 10,-10z" fill="#fff" stroke="#ff8a3d" stroke-width="3" stroke-linejoin="round"/>' +
      '<text x="0" y="8" text-anchor="middle" font-size="20" font-weight="700" fill="#e84a3c" font-family="Fredoka, system-ui, sans-serif">' + hmm + '</text></g></svg>';
  }
  // anima o menininho comendo (ciclo de 5 s): pega um pedacinho, leva à boca, morde, mastiga feliz,
  // lambe os lábios e diz "Hmm!". Devolve a função que para.
  function animarMenino(svg) {
    var g = function (s) { return svg.querySelector(s); };
    var braco = g('.braco-garfo'), garfo = g('.garfo'), maoG = g('.mao-garfo'), garfada = g('.garfada'), boca = g('.boca'), lingua = g('.lingua');
    var abertos = g('.olhos-abertos'), felizes = g('.olhos-felizes'), olhos = svg.querySelectorAll('.olho'), boch = svg.querySelectorAll('.bochecha'), hmm = g('.hmm'), cab = g('.cabeca-m'), faca = g('.faquinha');
    var CICLO = 5200, ini = null, raf = 0, vivo = true;
    var PRATO = [170, 198], BOCA = [146, 128], OMBRO = [176, 166];
    function janela(t, a, b) { return t >= a && t <= b; }
    function quadro(ts) {
      if (!vivo) return;
      if (ini == null) ini = ts;
      var t = ((ts - ini) % CICLO) / 1000;
      // mão do garfo: no prato (0–0.7), sobe (0.7–1.3), na boca (1.3–1.6), desce (1.6–2.2)
      var sobe = t < 0.7 ? 0 : t < 1.3 ? suave((t - 0.7) / 0.6) : t < 1.6 ? 1 : t < 2.2 ? 1 - suave((t - 1.6) / 0.6) : 0;
      var cava = t < 0.7 ? Math.sin(t / 0.7 * Math.PI) : 0;
      var hx = mix(PRATO[0], BOCA[0], sobe) - cava * 6, hy = mix(PRATO[1], BOCA[1], sobe) - Math.sin(sobe * Math.PI) * 8 + cava * 3;
      var giro = mix(-22, -96, sobe);
      braco.setAttribute('d', 'M' + OMBRO[0] + ',' + OMBRO[1] + ' C' + q(OMBRO[0] + 14 - sobe * 2) + ',' + q(OMBRO[1] + 18 - sobe * 30) + ' ' + q(hx + 14) + ',' + q(hy + 8 - sobe * 4) + ' ' + q(hx) + ',' + q(hy));
      garfo.setAttribute('transform', 'translate(' + q(hx) + ' ' + q(hy) + ') rotate(' + q(giro) + ')');
      maoG.setAttribute('cx', q(hx)); maoG.setAttribute('cy', q(hy));
      garfada.setAttribute('opacity', t > 0.45 && t < 1.42 ? '1' : '0');
      // a faquinha "corta" um pouquinho enquanto o garfo pega
      faca.setAttribute('transform', 'translate(' + q(94 + (t < 0.7 ? Math.sin(t * 18) * 3 : 0)) + ' 200) rotate(-62)');
      // boca: abre esperando o garfo, fecha, mastiga, lambe
      var abre = janela(t, 1.0, 1.4) ? Math.sin((t - 1.0) / 0.4 * Math.PI) : 0;
      var mastiga = janela(t, 1.5, 3.0) ? Math.abs(Math.sin((t - 1.5) * 2 * Math.PI * 2)) : 0;
      var lambe = janela(t, 3.05, 4.1) ? (t - 3.05) / 1.05 : -1;
      var aberta = Math.max(abre, lambe >= 0 ? 0.35 * Math.sin(Math.PI * lambe) : 0);
      var w = 11 - mastiga * 3, baixo = 4 + 9 + 14 * abre - mastiga * 7;
      boca.setAttribute('d', 'M' + (-w) + ',0 Q0,' + q(4 - aberta * 6 - mastiga * 2) + ' ' + w + ',0 Q0,' + q(baixo + aberta * 6) + ' ' + (-w) + ',0 Z');
      if (lambe >= 0) {
        var sai = Math.sin(Math.PI * lambe), lx = -9 * Math.cos(Math.PI * lambe * 1.6);
        lingua.setAttribute('opacity', '1'); lingua.setAttribute('cx', q(lx)); lingua.setAttribute('cy', q(-1 - 1.5 * sai)); lingua.setAttribute('rx', q(3 + 3 * sai)); lingua.setAttribute('ry', q(2.5 + 2 * sai));
      } else lingua.setAttribute('opacity', '0');
      // olhos: abertos olhando o garfo, felizes mastigando e lambendo, uma piscada no fim
      var feliz = janela(t, 1.4, 4.4);
      abertos.setAttribute('opacity', feliz ? '0' : '1'); felizes.setAttribute('opacity', feliz ? '1' : '0');
      var pisca = janela(t, 4.7, 4.85) ? 0.1 : 1;
      Array.prototype.forEach.call(olhos, function (o, i) { o.setAttribute('transform', 'translate(' + (i ? 148 : 112) + ' ' + q(95 - sobe * 2) + ') scale(1 ' + pisca + ')'); });
      var bo = 1 + mastiga * 0.18;
      Array.prototype.forEach.call(boch, function (b) { b.setAttribute('ry', q(6 * bo)); b.setAttribute('rx', q(9 * bo)); });
      cab.setAttribute('transform', 'translate(0 ' + q(mastiga * 1.6 - sobe * 1.5) + ') rotate(' + q(janela(t, 3.0, 4.4) ? Math.sin((t - 3) * 3) * 3 : 0) + ' 130 96)');
      // "Hmm!": aparece mastigando, cresce com um pulinho e some antes do próximo pedaço
      var hv = janela(t, 2.2, 4.6) ? Math.min(1, (t - 2.2) / 0.25) * Math.min(1, (4.6 - t) / 0.25) : 0;
      hmm.setAttribute('opacity', q(hv)); hmm.setAttribute('transform', 'translate(206 44) scale(' + q(0.6 + 0.4 * hv + (hv >= 1 ? Math.sin(t * 6) * 0.04 : 0)) + ')');
      raf = requestAnimationFrame(quadro);
    }
    svg.classList.add('animado');
    raf = requestAnimationFrame(quadro);
    return function () { vivo = false; cancelAnimationFrame(raf); };
  }

  // ---------- a foto do prato pronto (canvas 1080 × 1350, PNG) ----------
  // op: titulo (nome do jogo), receita, prato (emoji), cor, estrelas (0–3), linha (data e nível), rodape, hmm.
  function carregarSvg(texto) {
    return new Promise(function (ok, erro) {
      var img = new Image(), url = URL.createObjectURL(new Blob([texto], { type: 'image/svg+xml' }));
      img.onload = function () { ok(img); setTimeout(function () { URL.revokeObjectURL(url); }, 1000); };
      img.onerror = function () { URL.revokeObjectURL(url); erro(new Error('svg')); };
      img.src = url;
    });
  }
  function foto(op) {
    var W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var x = cv.getContext('2d'), F = "'Fredoka', system-ui, sans-serif";
    var fontes = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('700 80px Fredoka'), document.fonts.load('600 40px Fredoka')]).catch(function () {}) : Promise.resolve();
    return fontes.then(function () { return carregarSvg(menino({ cor: op.cor, prato: op.prato, hmm: op.hmm })).catch(function () { return null; }); }).then(function (img) {
      // fundo quentinho com confete
      var gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#fff7e6'); gr.addColorStop(1, '#ffd6a5'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
      var CONF = ['#e84a3c', '#ff8a3d', '#ffc93c', '#2bb673', '#3aa0e8', '#8e6bff', '#ff5e9c'], s = 7;
      for (var i = 0; i < 70; i++) { s = (s * 9301 + 49297) % 233280; var r1 = s / 233280; s = (s * 9301 + 49297) % 233280; var r2 = s / 233280; x.fillStyle = CONF[i % CONF.length]; x.globalAlpha = 0.5; x.beginPath(); x.arc(r1 * W, r2 * H, 6 + (i % 4) * 3, 0, 7); x.fill(); }
      x.globalAlpha = 1;
      // nome do jogo, letra por letra colorida
      x.font = '700 88px ' + F; x.textBaseline = 'alphabetic';
      var tit = op.titulo || 'Mão na Massa', larg = x.measureText(tit).width, px = (W - larg) / 2;
      tit.split('').forEach(function (ch, i) { x.fillStyle = 'rgba(120,60,20,.18)'; x.fillText(ch, px + 4, 128); x.fillStyle = CONF[i % CONF.length]; x.fillText(ch, px, 122); px += x.measureText(ch).width; });
      // moldura de foto
      x.save(); x.shadowColor = 'rgba(120,60,20,.25)'; x.shadowBlur = 30; x.shadowOffsetY = 12; x.fillStyle = '#fff';
      caixa(x, 80, 168, 920, 860, 36); x.fill(); x.restore();
      x.save(); x.translate(540, 598); x.rotate(-0.012); x.fillStyle = '#fff3d6'; caixa(x, -420, -400, 840, 790, 24); x.fill(); x.restore();
      if (img) x.drawImage(img, 120, 196, 840, 808);
      else { x.font = '360px ' + F; x.textAlign = 'center'; x.fillText(op.prato || '🍰', 540, 740); x.textAlign = 'start'; }
      // receita, estrelas, data
      x.textAlign = 'center'; x.fillStyle = '#4a2c17'; x.font = '700 78px ' + F; caber(x, op.receita || '', 960, 78, '700', F); x.fillText(op.receita || '', 540, 1118);
      x.font = '64px ' + F; x.fillText('⭐'.repeat(op.estrelas || 0) + '☆'.repeat(3 - (op.estrelas || 0)), 540, 1196);
      x.fillStyle = '#8a6447'; x.font = '600 40px ' + F; x.fillText(op.linha || '', 540, 1256);
      x.font = '500 30px ' + F; x.fillText(op.rodape || '', 540, 1316);
      return new Promise(function (ok, erro) {
        try { cv.toBlob(function (b) { if (b) ok(b); else erro(new Error('png')); }, 'image/png'); } catch (e) { erro(e); }
      });
    });
  }
  function caixa(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  function caber(x, txt, max, tam, peso, F) { while (tam > 40 && x.measureText(txt).width > max) { tam -= 4; x.font = peso + ' ' + tam + 'px ' + F; } }

  // ---------- partículas (faíscas, terra, pó, pedacinhos): spans fixos na tela, animados com a Web Animations API ----------
  function particula(html, cls, x, y, quadros, dur, atraso) {
    if (!document.body || !Element.prototype.animate) return null;
    var s = document.createElement('span'); s.className = 'particula ' + (cls || ''); s.innerHTML = html || '';
    s.style.left = x + 'px'; s.style.top = y + 'px';
    document.body.appendChild(s);
    var a = s.animate(quadros, { duration: dur, delay: atraso || 0, easing: 'cubic-bezier(.25,.6,.4,1)', fill: 'both' });
    a.onfinish = function () { s.remove(); }; a.oncancel = a.onfinish;
    setTimeout(function () { if (s.parentNode) s.remove(); }, dur + (atraso || 0) + 500);
    return s;
  }
  function faiscas(x, y, n) {
    n = n || 7;
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2 + Math.random() * 0.5, d = 26 + Math.random() * 22;
      particula(i % 3 ? '✦' : '✨', 'faisca', x, y, [{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 }, { transform: 'translate(calc(-50% + ' + q(Math.cos(a) * d) + 'px), calc(-50% + ' + q(Math.sin(a) * d) + 'px)) scale(1)', opacity: 0 }], 650);
    }
  }
  // migalhas: terra da horta, pó de farinha, pedacinhos picados... caem para baixo (cai = px)
  function migalhas(x, y, c, n, op) {
    op = op || {};
    for (var i = 0; i < n; i++) {
      var dx = (Math.random() - 0.5) * (op.abre || 60), up = op.sobe != null ? op.sobe * (0.5 + Math.random()) : 18 + Math.random() * 20, cai = op.cai != null ? op.cai : 50;
      var t = op.tam || (4 + Math.random() * 5);
      var s = particula(op.html || '', 'migalha', x, y, [
        { transform: 'translate(-50%,-50%)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + q(dx * 0.6) + 'px), calc(-50% - ' + q(up) + 'px)) rotate(' + q(dx * 3) + 'deg)', opacity: 1, offset: 0.35 },
        { transform: 'translate(calc(-50% + ' + q(dx) + 'px), calc(-50% + ' + q(cai) + 'px)) rotate(' + q(dx * 6) + 'deg)', opacity: 0 }], op.dur || 700, Math.random() * (op.espalha || 80));
      if (s && !op.html) { s.style.width = q(t) + 'px'; s.style.height = q(t) + 'px'; s.style.background = c; }
    }
  }
  function nuvem(x, y, c, n) {   // nuvenzinha de pó (farinha, açúcar) ou de frio (geladeira)
    for (var i = 0; i < (n || 6); i++) {
      var dx = (Math.random() - 0.5) * 70, dy = -10 - Math.random() * 30, t = 14 + Math.random() * 16;
      var s = particula('', 'nuvem', x + (Math.random() - 0.5) * 20, y, [{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0.9 }, { transform: 'translate(calc(-50% + ' + q(dx) + 'px), calc(-50% + ' + q(dy) + 'px)) scale(1.6)', opacity: 0 }], 900, i * 40);
      if (s) { s.style.width = q(t) + 'px'; s.style.height = q(t) + 'px'; s.style.background = c; }
    }
  }

  var API = { COR: COR, cor: cor, jeito: jeito, misturar: misturar, temRecipiente: temRecipiente, recipiente: recipiente, encher: encher, superficie: superficie,
    cenaDespejo: cenaDespejo, animarDespejo: animarDespejo, GIRO_DESP: GIRO_DESP, cenaPia: cenaPia, esfregar: esfregar, menino: menino, animarMenino: animarMenino,
    foto: foto, particula: particula, faiscas: faiscas, migalhas: migalhas, nuvem: nuvem };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else raiz.CozinhaCenas = API;
})(typeof self !== 'undefined' ? self : this);
