/* Bagunçolândia — desenha o jogo no canvas da TV (1280×720 lógico, esticado para a tela).
   Entrada: o estado do motor (jogo.js) e os eventos drenados naquele quadro. Por baixo do canvas
   fica a câmera da pessoa (vídeo no DOM); por isso o fundo aqui é semitransparente com vinheta.
   Regras: nada de innerHTML; respeita prefers-reduced-motion (menos partículas, sem piscar). */
(function (root) {
  'use strict';
  var W = 1280, H = 720;
  var CORES = { j: ['#c6ff3d', '#ff4fa3'], ouro: '#ffd166', ciano: '#3ee8ff', fundo1: '#0b0a1f', fundo2: '#1a1446', texto: '#fff' };
  var D = { ctx: null, canvas: null, parts: [], textos: [], metades: [], estrelas: [], ultimo: 0, menos: false, figs: {}, legenda: null, contagem: null, pops: {}, flash: 0, chuva: 0, nomes: ['', ''], modoAviso: null, fonte: 'Fredoka, system-ui, sans-serif', ambiente: 'camera', cena: null, cenaImg: null, av: [{}, {}], avatares: [{}, {}], aviso: null, reac: [null, null], dedo: false };
  var PELE = '#ffd9b3', SAPATO = '#2b2250';
  /* modo leve (TV e aparelho fraco): sem sombras/brilhos, menos partículas, resolução interna 960×540,
     fundo pré-desenhado. Liga sozinho em TV (webOS, Tizen, etc.) ou quando o quadro demora mais de 40 ms. */
  D.leve = false; D.escala = 1; D.fundoImg = null; D.medidas = []; D.pulaQuadro = false;
  function sombra(ctx, cor, blur, offY) { if (D.leve) { ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; return; } ctx.shadowColor = cor; ctx.shadowBlur = blur; if (offY != null) ctx.shadowOffsetY = offY; }
  function leve(v) {
    D.leve = !!v; D.escala = D.leve ? 0.75 : nitidez();
    if (D.canvas) { D.canvas.width = Math.round(W * D.escala); D.canvas.height = Math.round(H * D.escala); }
    if (root.Boneco) root.Boneco.leve = D.leve;
    D.estrelas = D.estrelas.slice(0, D.leve ? 25 : 60);
  }
  /* roda uma parte do desenho protegida: se der erro (ex.: recurso que o navegador da TV não tem), registra,
     desfaz o estado do canvas e segue para a próxima parte, para o quadro sempre fechar inteiro */
  D.erros = [];
  function seguro(nome, fn) {
    var ctx = D.ctx; ctx.save();
    try { fn(); ctx.restore(); }
    catch (e) {
      for (var k = 0; k < 12; k++) ctx.restore();
      ctx.setTransform(D.escala, 0, 0, D.escala, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
      var msg = nome + ': ' + (e && e.message || e); if (D.erros[D.erros.length - 1] !== msg) D.erros.push(msg); if (D.erros.length > 8) D.erros.shift();
    }
  }
  function ehTV() { var ua = (root.navigator && navigator.userAgent) || ''; return /Web0S|webOS|SMART-TV|SmartTV|Tizen|BRAVIA|VIDAA|NetCast|HbbTV|AppleTV|CrKey|AFT[A-Z]/i.test(ua); }
  // o idioma da estante (../idioma.js), lido a cada quadro: pt, en ou es
  function T(pt, en, es) { var l = root.BolinhoIdioma ? root.BolinhoIdioma.atual() : 'pt'; return l === 'en' ? en : l === 'es' ? (es != null ? es : pt) : pt; }

  function iniciar(canvas, opts) {
    D.canvas = canvas; canvas.width = W; canvas.height = H; D.ctx = canvas.getContext('2d');
    leve((opts && opts.leve != null) ? opts.leve : ehTV());
    D.menos = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
    D.parts = []; D.textos = []; D.metades = []; D.pops = {};
    for (var i = 0; i < (D.menos ? 20 : 60); i++) D.estrelas.push({ x: Math.random() * W, y: Math.random() * H, r: 0.6 + Math.random() * 1.8, v: 4 + Math.random() * 10, a: Math.random() * 6.28 });
    if (opts && opts.nomes) D.nomes = opts.nomes;
    if (root.document && root.document.fonts && root.document.fonts.load) root.document.fonts.load('700 40px Fredoka').catch(function () {});
    if (root.addEventListener) root.addEventListener('resize', function () { if (D.leve) return; var e = nitidez(); if (Math.abs(e - D.escala) < 0.01) return; leve(false); rasterizarCena(); });   // girou a tela ou mudou o tamanho
  }
  function nomes(n) { D.nomes = n; }
  /* ambiente: 'camera' (vídeo atrás, fundo translúcido) ou 'paisagem' (cena desenhada + boneco) */
  function ambiente(amb, cenaId, comBichos) {   // comBichos: sorteia só cenários onde bicho combina (Pega-pega)
    D.ambiente = amb === 'paisagem' ? 'paisagem' : 'camera';
    var cena = null;
    if (D.ambiente === 'paisagem' && root.Cenas) {
      cena = (cenaId && cenaId !== 'aleatoria' && root.Cenas.porId(cenaId)) || root.Cenas.sortear(D.cena && D.cena.id, comBichos ? function (c) { return c.bichos; } : null);
      D.cena = cena; rasterizarCena();
    }
    D.av = [{}, {}];
    return cena;
  }
  function rasterizarCena() {   // na nitidez da tela (tablet e TV grandes não ficam borrados)
    var cena = D.cena; if (!cena || !root.Cenas) return; D.cenaImg = null;
    root.Cenas.rasterizar(cena, Math.round(W * D.escala), Math.round(H * D.escala)).then(function (c) { if (D.cena === cena) D.cenaImg = c; });
  }
  /* nitidez: desenha na resolução de verdade da tela (até 1,5×), para não ficar borrado em tablet grande e TV */
  function nitidez() { var c = D.canvas, cw = (c && c.clientWidth) || W, dpr = root.devicePixelRatio || 1; return Math.max(1, Math.min(1.5, Math.round(cw * dpr / W * 4) / 4)); }
  function avatares(lista) { if (lista && lista.length) D.avatares = lista; }

  /* figura rasterizada (cache); enquanto não pronta, bolinha da cor do suco */
  function imagem(fig, raio) {
    var px = Math.min(320, Math.round(raio * 2.3 * Math.max(1, D.escala))), k = fig.id + '@' + px;
    if (D.figs[k]) return D.figs[k].pronta ? D.figs[k].c : null;
    D.figs[k] = { pronta: false, c: null };
    root.Figuras.rasterizar(fig, px).then(function (c) { D.figs[k] = { pronta: true, c: c }; });
    return null;
  }

  /* 🐰 bicho do Pega-pega: corpo em SVG + pernas que andam e asas que batem (desenhadas aqui); olha para onde vai */
  function bicho(ctx, c, fig, ts) {
    var B = c.b, T = c.tam, u = T / 100, px = Math.min(512, Math.round(T)), k = fig.id + '@b' + px, cache = D.figs[k];
    if (!cache) { D.figs[k] = cache = { pronta: false }; root.Figuras.rasterizar(fig, px).then(function (cv) { D.figs[k] = { pronta: true, c: cv }; }); }
    var img = cache.pronta ? cache.c : null, voa = c.anda === 'voa', pula = c.anda === 'pula' && B.anda, buraco = c.anda === 'buraco' && B.k < 1;
    var hop = pula ? -Math.abs(Math.sin(B.passo * 0.5)) * T * 0.28 : 0, saida = buraco ? (1 - B.k) * T * 0.95 : 0;
    ctx.save(); ctx.translate(c.x, c.y);
    if (!voa) { ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(0, T / 2 - 2, T * 0.32 * (hop ? 0.7 : 1), T * 0.05, 0, 0, 6.2832); ctx.fill(); }
    if (c.anda === 'buraco' && !c.pego) { ctx.fillStyle = '#6d4c2f'; ctx.beginPath(); ctx.ellipse(0, T / 2 - 4, T * 0.48, T * 0.12, 0, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#2b1a10'; ctx.beginPath(); ctx.ellipse(0, T / 2 - 4, T * 0.34, T * 0.07, 0, 0, 6.2832); ctx.fill(); }   // o montinho e o buraco
    if (buraco) { ctx.beginPath(); ctx.rect(-T, -T * 2, T * 2, T * 2 + T / 2 - 4); ctx.clip(); }   // só aparece o que já saiu da terra
    ctx.translate(0, hop + saida); if (B.dir < 0) ctx.scale(-1, 1);
    if (c.fig === 'minhoca') ctx.transform(1, 0, Math.sin(ts / 160) * 0.12, 1, 0, 0);   // minhoca rebola
    var P = function (x) { return (x - 50) * u; };
    // pernas: pares alternados; pulando, encolhidas; voando, penduradas
    (fig.pernas || []).forEach(function (pn, i) {
      var ang = voa ? 0.35 : pula ? (hop < -T * 0.05 ? 0.7 : -0.2) : B.anda ? Math.sin(B.passo + (i % 2) * Math.PI) * 0.55 : 0;
      ctx.strokeStyle = pn[4]; ctx.lineWidth = pn[3] * u; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(P(pn[0]), P(pn[1])); ctx.lineTo(P(pn[0]) + Math.sin(ang) * pn[2] * u, P(pn[1]) + Math.cos(ang) * pn[2] * u); ctx.stroke();
    });
    var asas = function () { (fig.asas || []).forEach(function (a) {   // asas: batem voando (e um pouquinho quando a ave anda)
      var f = voa ? 0.2 + 0.8 * Math.abs(Math.sin(B.passo)) : B.anda ? 0.85 + 0.15 * Math.sin(B.passo * 2) : 1;
      ctx.fillStyle = a[4]; ctx.beginPath();
      if (fig.asaEixo === 'x') ctx.ellipse(P(a[0]) + (a[0] < 50 ? 1 : -1) * a[2] * u * (1 - f) * 0.8, P(a[1]), a[2] * u * f, a[3] * u, 0, 0, 6.2832);
      else ctx.ellipse(P(a[0]), P(a[1]) - a[3] * u * (1 - f) * 0.6, a[2] * u, a[3] * u * f, -0.25, 0, 6.2832);
      ctx.fill();
    }); };
    if (fig.asaEixo === 'x') asas();   // borboleta: asas atrás do corpo
    if (img) ctx.drawImage(img, -T / 2, -T / 2, T, T);
    if (fig.asaEixo !== 'x') asas();
    ctx.restore();
  }
  function desenharFigura(ctx, c, fig, alpha) {
    var img = imagem(fig, c.raio), s = c.raio * 2.3;
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot || 0); ctx.globalAlpha = alpha == null ? 1 : alpha;
    // sombra macia
    sombra(ctx, 'rgba(0,0,0,.45)', 18, 8);
    if (img) ctx.drawImage(img, -s / 2, -s / 2, s, s);
    else { ctx.fillStyle = fig.suco || '#fff'; ctx.beginPath(); ctx.arc(0, 0, c.raio, 0, 6.2832); ctx.fill(); }
    ctx.restore();
  }
  function balao(ctx, c) {   // balão + fio por cima da figura que desce
    ctx.save(); ctx.translate(c.x, c.y - c.raio - 6);
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -34); ctx.stroke();
    var g = ctx.createRadialGradient(-8, -62, 4, 0, -56, 30); g.addColorStop(0, '#fff'); g.addColorStop(0.3, c.cor || CORES.ciano); g.addColorStop(1, '#2a1a5e');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -58, 24, 28, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = c.cor || CORES.ciano; ctx.beginPath(); ctx.moveTo(-5, -32); ctx.lineTo(5, -32); ctx.lineTo(0, -26); ctx.fill();
    ctx.restore();
  }
  function asas(ctx, c, ts) {   // voando: duas asinhas batendo
    var b = Math.sin(ts / 60) * 0.5;
    ctx.save(); ctx.translate(c.x, c.y); ctx.fillStyle = 'rgba(255,255,255,.75)';
    [-1, 1].forEach(function (s) { ctx.save(); ctx.scale(s, 1); ctx.rotate(-0.4 + b); ctx.beginPath(); ctx.ellipse(-c.raio - 10, -8, 22, 10, 0.3, 0, 6.2832); ctx.fill(); ctx.restore(); });
    ctx.restore();
  }

  /* eventos → partículas, textos, metades, pops */
  function reagir(ev, estado) {
    var cor = CORES.j[ev.j] || CORES.ouro, fig = ev.fig && root.Figuras.porId(ev.fig);
    // o boneco reage: acertou = festa (pula, braços para cima e, no dedo, salta até onde acertou); coisa ruim = dor
    var jr = ev.j || 0, atual = D.reac[jr];
    if ((/^(corte|pegou|chutou|gol|tocou|desviou)$/.test(ev.t) || (ev.t === 'casa' && ev.festa)) && !(atual && atual.tipo === 'dor' && D.ultimo < atual.ate)) D.reac[jr] = { tipo: 'festa', desde: D.ultimo, ate: D.ultimo + 800, x: ev.x, y: ev.y };
    else if (ev.t === 'vilao' || ev.t === 'bateu') D.reac[jr] = { tipo: 'dor', desde: D.ultimo, ate: D.ultimo + 1300 };
    if (ev.t === 'corte') {
      var coisa = estado.coisas.filter(function (c) { return c.id === ev.id; })[0], raio = coisa ? coisa.raio : 44, suco = (fig && fig.suco) || '#fff';
      var ang = Math.random() * Math.PI;
      D.metades.push({ fig: fig, x: ev.x, y: ev.y, raio: raio, rot: coisa ? coisa.rot : 0, ang: ang, vida: 900, vx: -Math.sin(ang) * 140, vy: -200, lado: -1 });
      D.metades.push({ fig: fig, x: ev.x, y: ev.y, raio: raio, rot: coisa ? coisa.rot : 0, ang: ang, vida: 900, vx: Math.sin(ang) * 140, vy: -200, lado: 1 });
      splash(ev.x, ev.y, suco, D.menos ? 8 : 26);
      rastroCorte(ev.x, ev.y, ang, raio);
      texto('+' + ev.pontos, ev.x, ev.y - raio, cor, 34);
      pop(ev.j);
    } else if (ev.t === 'pegou') { estrelas(ev.x, ev.y, ev.mascote ? CORES.ouro : cor, ev.mascote ? 30 : 14); texto((ev.mascote ? '★ ' : '') + '+' + ev.pontos, ev.x, ev.y - 50, ev.mascote ? CORES.ouro : cor, ev.mascote ? 44 : 34); pop(ev.j); }
    else if (ev.t === 'chutou') { estrelas(ev.x, ev.y, '#fff', 10); texto(T('Chutou! +', 'Kick! +', '¡Chutazo! +') + ev.pontos, ev.x, ev.y - 60, cor, 32); pop(ev.j); }
    else if (ev.t === 'tanque') { for (var bi = 0; bi < 34; bi++) D.parts.push({ x: ev.px + (Math.random() - 0.5) * 200, y: 548, vx: (Math.random() - 0.5) * 760, vy: -280 - Math.random() * 560, g: 1300, r: 7 + Math.random() * 5, cor: CORES_BOLINHAS[bi % CORES_BOLINHAS.length], vida: 1400 }); texto(T('TCHIBUM! +', 'SPLASH! +', '¡CHAPUZÓN! +') + ev.pontos, ev.px, 420, CORES.ouro, 46); pop(ev.j); }   // 🎉 caiu na piscina: bolinhas para todo lado
    else if (ev.t === 'gol') { D.flash = 0.6; estrelas(ev.x, ev.y, CORES.ouro, 40); texto(T('GOOOL! +', 'GOAL! +', '¡GOOOL! +') + ev.pontos, W / 2, 300, CORES.ouro, 72); pop(ev.j); }
    else if (ev.t === 'vilao') { fumaca(ev.x, ev.y); texto(ev.vida ? T('Ai! −1 vida', 'Ouch! −1 life', '¡Ay! −1 vida') : (ev.pontos + ''), ev.x, ev.y - 50, '#ff5252', 36); if (ev.fig === 'chuvisco') D.chuva = 2500; if (ev.vida) D.flash = 0.35; }
    else if (ev.t === 'combo') { texto('COMBO ×' + ev.n + '  +' + ev.pontos, ev.x || W / 2, (ev.y || 300) - 110, CORES.ouro, 48, true); }
    else if (ev.t === 'poder') { if (ev.poder) texto({ x2: '✖2!', lento: T('🐌 Lento!', '🐌 Slow!', '🐌 ¡Lento!'), chuva: T('🌧 Chuva de frutas!', '🌧 Fruit rain!', '🌧 ¡Lluvia de frutas!') }[ev.poder] || '', ev.x || W / 2, (ev.y || 200) - 60, CORES.ciano, 44, true); estrelas(ev.x || W / 2, ev.y || 200, CORES.ciano, 24); }
    else if (ev.t === 'troca') { D.modoAviso = { modo: ev.modo, ate: D.ultimo + 2200 }; }
    else if (ev.t === 'tocou') { estrelas(ev.x, ev.y, cor, 8); texto('+' + ev.pontos, ev.x, ev.y - 40, cor, 28); pop(ev.j); }
    else if (ev.t === 'desviou') { texto('+' + ev.pontos + (ev.tipo === 'baixo' ? ' 🦘' : ' 🙇'), ev.x, ev.y - 60, cor, 34); estrelas(ev.x, ev.y, cor, 10); pop(ev.j); }
    else if (ev.t === 'bateu') { fumaca(ev.x, ev.y); D.flash = 0.3; texto(T('Ai! −1 vida', 'Ouch! −1 life', '¡Ay! −1 vida'), ev.x, ev.y - 60, '#ff5252', 36); }
    else if (ev.t === 'aviso') { D.aviso = { tipo: ev.tipo, j: ev.j, ate: D.ultimo + 1000 }; }
    else if (ev.t === 'fim') { confete(); }
    else if (ev.t === 'casa') { if (ev.texto) texto(T(ev.texto, ev.textoEn || ev.texto, ev.textoEs || ev.texto), ev.x, ev.y - 40, ev.texto === '+10' ? CORES.ouro : cor, ev.texto === '+10' ? 30 : 36); if (ev.festa) estrelas(ev.x, ev.y, cor, 6); if (ev.pontos > 0) pop(ev.j || 0); }
    else if (ev.t === 'arrumado') { confete(); D.flash = 0.4; texto(T('TUDO ARRUMADO! 🌟 Que capricho!', 'ALL TIDY! 🌟 Great job!', '¡TODO ORDENADO! 🌟 ¡Qué bien te ha quedado!'), W / 2, 320, CORES.ouro, 60, true); }
    else if (ev.t === 'bagunca100') { confete(); D.flash = 0.5; texto(T('BAGUNÇA TOTAL! 🎉 +100', 'TOTAL MAYHEM! 🎉 +100', '¡ALBOROTO TOTAL! 🎉 +100'), W / 2, 320, CORES.ouro, 66, true); }
  }
  function pop(j) { D.pops[j] = D.ultimo; }
  function texto(t, x, y, cor, tam, grande) { D.textos.push({ t: t, x: x, y: y, cor: cor, tam: tam, vida: grande ? 1600 : 1000, grande: grande }); }
  function splash(x, y, cor, n) {
    for (var i = 0; i < (D.leve ? Math.ceil(n / 3) : n); i++) { var a = Math.random() * 6.2832, v = 120 + Math.random() * 380; D.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, g: 900, r: 3 + Math.random() * 7, cor: cor, vida: 600 + Math.random() * 500, tipo: 'gota' }); }
  }
  function estrelas(x, y, cor, n) {
    for (var i = 0; i < ((D.menos || D.leve) ? n / 2 : n); i++) { var a = Math.random() * 6.2832, v = 80 + Math.random() * 300; D.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, g: 300, r: 4 + Math.random() * 6, cor: cor, vida: 700 + Math.random() * 500, tipo: 'estrela', rot: Math.random() * 6 }); }
  }
  function fumaca(x, y) {
    for (var i = 0; i < (D.menos ? 6 : 16); i++) { var a = Math.random() * 6.2832, v = 30 + Math.random() * 90; D.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, g: -40, r: 14 + Math.random() * 20, cor: 'rgba(90,90,110,.6)', vida: 900 + Math.random() * 400, tipo: 'fumo' }); }
  }
  function rastroCorte(x, y, ang, raio) { D.parts.push({ x: x, y: y, ang: ang, len: raio * 2.6, vida: 220, tipo: 'corte' }); }
  function confete() { for (var i = 0; i < (D.menos ? 60 : 220); i++) D.parts.push({ x: Math.random() * W, y: -20 - Math.random() * 400, vx: (Math.random() - 0.5) * 80, vy: 80 + Math.random() * 160, g: 20, r: 5 + Math.random() * 6, cor: 'hsl(' + Math.random() * 360 + ',100%,60%)', vida: 5000, tipo: 'confete', rot: Math.random() * 6 }); }
  function pulso() { D.pulsoAte = D.ultimo + 160; }
  function mostrarBoneco(v) { D.mostrarBoneco = v !== false; }
  /* começo de rodada: tira textos, partículas, legenda e avisos da rodada anterior */
  function limpar() { D.parts = []; D.textos = []; D.metades = []; D.legenda = null; D.aviso = null; D.modoAviso = null; D.flash = 0; D.chuva = 0; D.pops = {}; D.av = [{}, {}]; D.reac = [null, null]; }
  function legenda(txt, cor, pisca) { D.legenda = txt ? { t: txt, cor: cor || '#fff', pisca: !!pisca, desde: D.ultimo } : null; }
  function contagem(n) { D.contagem = n == null ? null : { n: n, desde: D.ultimo }; }

  function quadro(estado, eventos, ts) {
    var ctx = D.ctx; if (!ctx) return;
    var dtMs = Math.min(100, ts - (D.ultimo || ts)); D.ultimo = ts; var dt = dtMs / 1000;
    (eventos || []).forEach(function (e) { reagir(e, estado); });
    // mede quanto o desenho demora; se passar de 40 ms em média, liga o modo leve sozinho
    var t0 = (root.performance && performance.now) ? performance.now() : 0;
    ctx.setTransform(D.escala, 0, 0, D.escala, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var paisagem = D.ambiente === 'paisagem';
    if (paisagem) {
      // cena desenhada (opaca); enquanto a imagem não está pronta, só a cor do céu
      if (D.cenaImg) ctx.drawImage(D.cenaImg, 0, 0, W, H); else { ctx.fillStyle = (D.cena && D.cena.ceu) || CORES.fundo2; ctx.fillRect(0, 0, W, H); }
    } else {
      // fundo: gradiente noturno semitransparente + vinheta (a câmera aparece por trás), desenhado uma vez e reaproveitado
      if (!D.fundoImg) { var fc = document.createElement('canvas'); fc.width = 640; fc.height = 360; var fx = fc.getContext('2d'); var g = fx.createLinearGradient(0, 0, 0, 360); g.addColorStop(0, 'rgba(11,10,31,.62)'); g.addColorStop(1, 'rgba(26,20,70,.62)'); fx.fillStyle = g; fx.fillRect(0, 0, 640, 360); var v = fx.createRadialGradient(320, 180, 126, 320, 180, 342); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)'); fx.fillStyle = v; fx.fillRect(0, 0, 640, 360); D.fundoImg = fc; }
      ctx.drawImage(D.fundoImg, 0, 0, W, H);
    }
    if (!paisagem || (D.cena && D.cena.id === 'espaco')) {
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      D.estrelas.forEach(function (s) { s.y -= s.v * dt; s.a += dt; if (s.y < -4) { s.y = H + 4; s.x = Math.random() * W; } ctx.globalAlpha = 0.25 + 0.35 * Math.abs(Math.sin(s.a)); ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill(); });
      ctx.globalAlpha = 1;
    }
    if (!estado) { camadaTexto(ctx, ts, dtMs); return; }
    var jogs = estado.jogadores, dois = jogs.length === 2, modo = estado.modo, casa = !!(estado.casa && root.Casa);
    D.casaM = casa ? estado.casa : null;
    if (casa) seguro('casa', function () { root.Casa.desenhar(ctx, estado.casa, ts, D.leve); });   // 🧸 Bagunça: a sala, o quarto ou o jardim
    // raias dos jogadores: borda neon na cor de cada um e divisória luminosa
    jogs.forEach(function (jg, j) {
      var r = jg.raia, pulsando = D.pulsoAte && ts < D.pulsoAte; ctx.save(); ctx.strokeStyle = pulsando ? '#fff' : CORES.j[j]; ctx.lineWidth = (paisagem ? 4 : 6) + (pulsando ? 6 : 0); sombra(ctx, CORES.j[j], pulsando ? 40 : 24); ctx.globalAlpha = paisagem ? 0.6 : 0.9;
      ctx.strokeRect(r.x + 4, r.y + 4, r.w - 8, r.h - 8); ctx.restore();
    });
    // zona de chute
    if (modo === 'chuta') {
      jogs.forEach(function (jg) { var r = jg.raia, y = r.y + r.h * jg.zonaChute; var zg = ctx.createLinearGradient(0, y, 0, r.y + r.h); zg.addColorStop(0, 'rgba(62,232,255,.0)'); zg.addColorStop(1, 'rgba(62,232,255,.28)'); ctx.fillStyle = zg; ctx.fillRect(r.x, y, r.w, r.h - (y - r.y)); ctx.setLineDash([14, 10]); ctx.strokeStyle = 'rgba(62,232,255,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(r.x, y); ctx.lineTo(r.x + r.w, y); ctx.stroke(); ctx.setLineDash([]); });
      trave(ctx, estado.trave, ts);
    }
    if (estado.tanques) seguro('tanques', function () { tanques(ctx, estado.tanques, ts); });
    if (estado.parente) seguro('parente', function () { parenteCampo(ctx, estado.parente, jogs, ts, dt); });
    // rastro de luz onde a pessoa se mexe
    jogs.forEach(function (jg, j) {
      var pts = jg.rastro; if (!pts || pts.length < 1) return;
      ctx.save(); ctx.strokeStyle = CORES.j[j]; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; sombra(ctx, CORES.j[j], 22);
      for (var i = 1; i < pts.length; i++) { var a = pts[i - 1], b = pts[i]; if (b.ts - a.ts > 350 || Math.hypot(b.x - a.x, b.y - a.y) > 560) continue; ctx.globalAlpha = 0.25 + 0.7 * (i / pts.length); ctx.lineWidth = 6 + b.f / 8; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      var u = pts[pts.length - 1]; ctx.globalAlpha = 0.9; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(u.x, u.y, 6 + u.f / 10, 0, 6.2832); ctx.fill();
      ctx.restore();
    });
    // boneco de cada jogador (ambiente paisagem)
    if ((paisagem || casa) && (D.mostrarBoneco !== false || estado.modo === 'pula')) jogs.forEach(function (jg, j) { seguro('boneco', function () { boneco(ctx, jg, j, ts, dt); }); });   // no modo do dedo a pessoa pode esconder o boneco (menos no Pula e abaixa)
    if (casa && estado.casa.arrumando) seguro('guias', function () { root.Casa.guias(ctx, estado.casa, ts); });   // 🧹 dicas e o que está na mão: por cima do boneco
    // as coisas
    var ordem = estado.coisas.some(function (c) { return c.estilo === 'bicho'; }) ? estado.coisas.slice().sort(function (a, b) { return (b.estilo === 'bicho' ? b.tam : 0) - (a.estilo === 'bicho' ? a.tam : 0); }) : estado.coisas;   // 🐰 bicho grande atrás (o cavalo não esconde o resto)
    seguro('coisas', function () { ordem.forEach(function (c) {
      if (c.morta) return;
      if (c.papel === 'obstaculo') { obstaculo(ctx, c, ts); return; }
      var fig = root.Figuras.porId(c.fig); if (!fig) return;
      if (c.estilo === 'bicho') { bicho(ctx, c, fig, ts); return; }
      if (c.estilo === 'quica') { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(c.x, jg0chao(jg0(c, jogs)), c.raio * 0.9, c.raio * 0.3, 0, 0, 6.2832); ctx.fill(); ctx.restore(); }
      c.cor = CORES.j[c.j];
      if (c.estilo === 'balao') balao(ctx, c);
      if (c.estilo === 'voa') asas(ctx, c, ts);
      if (c.papel === 'vilao') { ctx.save(); sombra(ctx, '#ff1744', 30); ctx.fillStyle = 'rgba(255,23,68,.18)'; ctx.beginPath(); ctx.arc(c.x, c.y, c.raio * 1.15, 0, 6.2832); ctx.fill(); ctx.restore(); }
      if (c.papel === 'poder' || (fig.mascote)) { ctx.save(); sombra(ctx, fig.mascote ? CORES.ouro : CORES.ciano, 36 + 10 * Math.sin(ts / 150)); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.arc(c.x, c.y, c.raio * 1.2, 0, 6.2832); ctx.fill(); ctx.restore(); }
      desenharFigura(ctx, c, fig);
    }); });
    // metades cortadas caindo
    seguro('metades', function () { for (var m = D.metades.length - 1; m >= 0; m--) {
      var h = D.metades[m]; h.vida -= dtMs; if (h.vida <= 0) { D.metades.splice(m, 1); continue; }
      h.vy += 900 * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.rot += h.lado * 3 * dt;
      var img = h.fig && imagem(h.fig, h.raio), s = h.raio * 2.3;
      ctx.save(); ctx.globalAlpha = Math.min(1, h.vida / 400); ctx.translate(h.x, h.y); ctx.rotate(h.rot);
      ctx.beginPath(); var ca = Math.cos(h.ang), sa = Math.sin(h.ang), L = s;   // meia-lua: metade do quadrado de um lado da linha de corte
      ctx.moveTo(-ca * L - sa * L * h.lado, -sa * L + ca * L * h.lado); ctx.lineTo(ca * L - sa * L * h.lado, sa * L + ca * L * h.lado); ctx.lineTo(ca * L, sa * L); ctx.lineTo(-ca * L, -sa * L); ctx.closePath(); ctx.clip();
      var off = 6 * h.lado; ctx.translate(-sa * off, ca * off);
      if (img) ctx.drawImage(img, -s / 2, -s / 2, s, s); else { ctx.fillStyle = (h.fig && h.fig.suco) || '#fff'; ctx.beginPath(); ctx.arc(0, 0, h.raio, 0, 6.2832); ctx.fill(); }
      ctx.restore();
    } });
    seguro('particulas', function () { particulas(ctx, dt, dtMs); });
    // clarão
    if (D.flash > 0) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.5, D.flash) + ')'; ctx.fillRect(0, 0, W, H); D.flash -= dt * 1.5; }
    // chuva do Chuvisco: a tela molha
    if (D.chuva > 0) { D.chuva -= dtMs; ctx.fillStyle = 'rgba(79,195,247,' + Math.min(0.35, D.chuva / 4000) + ')'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(200,235,255,.7)'; for (var q = 0; q < (D.menos ? 10 : 40); q++) { var rx = (q * 173 + ts / 3) % W, ry = (q * 97 + ts / 1.5) % H; ctx.fillRect(rx, ry, 2, 14); } }
    if (casa) { seguro('luz', function () { root.Casa.luz(ctx, estado.casa, ts); }); seguro('medidor', function () { root.Casa.medidor(ctx, estado.bagunca || 0, ts, estado.arrumando); }); }
    seguro('placar', function () { hud(ctx, estado, ts); });
    seguro('legenda', function () { camadaTexto(ctx, ts, dtMs); });
    if (t0 && !D.leve) { D.medidas.push(performance.now() - t0); if (D.medidas.length >= 60) { var soma = 0; D.medidas.forEach(function (m) { soma += m; }); if (soma / D.medidas.length > 40) leve(true); D.medidas = []; } }
  }

  function jg0(c, jogs) { return jogs[c.j] || jogs[0]; }
  function jg0chao(jg) { return jg.raia.y + jg.raia.h - 10; }

  /* ---------- boneco personalizável: o desenho mora em boneco.js; aqui só a animação e a posição ---------- */
  function avatarCfg(j) { return root.Boneco.normalizar(D.avatares[j] || D.avatares[0] || {}, j); }
  function boneco(ctx, jg, j, ts, dt) {
    if (jg.esqueleto) { marionete(ctx, jg, j, ts); return; }
    var cs = D.casaM, r = jg.raia, V = jg.vai, A = V ? V.A : cs ? 175 : r.h * (jg.raia.w < W ? 0.36 : 0.42), chao = cs ? cs.chao + 4 : r.y + r.h * (root.Cenas ? root.Cenas.CHAO : 0.86),   // 🧸 na casa: tamanho de criança perto dos móveis (e menor que a mamãe)
      cfg = avatarCfg(j), cor = cfg.cor, corpo = jg.corpo || { x: 0.5 }, av = D.av[j] || (D.av[j] = {});
    var x = r.x + corpo.x * r.w;
    if (av.x == null) av.x = x; av.vx = (x - av.x) / Math.max(dt, 0.001); av.x = x;
    var rc = D.reac[j]; if (rc && ts >= rc.ate) rc = D.reac[j] = null;
    var pose = rc ? rc.tipo : null, k = rc ? Math.min(1, (ts - rc.desde) / (rc.ate - rc.desde)) : 0, pulo = 0, xd = x;
    if (pose === 'festa') {
      pulo = -A * 0.32 * Math.sin(k * Math.PI);                                   // pulinho de comemoração
    } else if (pose === 'dor') xd = x + Math.sin(ts / 35) * A * 0.02 * (1 - k);
    var alvoY = corpo.pulando ? -A * 0.5 : 0; av.y = V ? V.y : av.y == null ? 0 : av.y + (alvoY - av.y) * Math.min(1, dt * 12);   // 🧍 vai até lá: o pulo é o do motor
    var alvoAg = corpo.abaixado ? 0.6 : (V && V.agacha > 0) ? 0.9 : 1; av.ag = av.ag == null ? 1 : av.ag + (alvoAg - av.ag) * Math.min(1, dt * 10);
    av.passo = (av.passo || 0) + Math.min(14, Math.abs(av.vx) / 40) * dt * 8;
    av.vxs = (av.vxs || 0) + (av.vx - (av.vxs || 0)) * Math.min(1, dt * 10);   // velocidade suavizada (câmera e dedo)
    var vel = V ? V.vx : av.vxs;
    av.fase = (av.fase || 0) + Math.abs(vel) / (A * 0.55) * 6.2832 * dt;   // de lado: um ciclo de passo a cada ~meia altura andada (passada de criança)
    var andando = Math.abs(av.vx) > 30, balanco = andando ? Math.sin(av.passo) : 0;
    var bracoE = false, bracoD = false, ombroY = chao + av.y - A * 0.62 * av.ag;
    (jg.rastro || []).slice(-4).forEach(function (p) { if (ts - p.ts > 400) return; if (p.y < ombroY + A * 0.1) { if (p.x < x - A * 0.05) bracoE = true; else if (p.x > x + A * 0.05) bracoD = true; } });
    if (pose === 'festa' || (V && V.cima)) { bracoE = bracoD = true; }
    // parado um tempinho: acena e conversa com as mãos (gesticula)
    av.parado = andando || pose || (V && (V.cima || V.costas)) ? 0 : (av.parado || 0) + dt;
    var gesto = av.parado > 2.5 ? (av.parado - 2.5) % 6 : -1;
    if (gesto >= 0 && gesto < 1.4) bracoD = true; else if (gesto >= 3 && gesto < 3.8) bracoE = true;
    av.bE = av.bE == null ? 0 : av.bE + ((bracoE ? 1 : 0) - av.bE) * Math.min(1, dt * (pose ? 18 : 10));
    av.bD = av.bD == null ? 0 : av.bD + ((bracoD ? 1 : 0) - av.bD) * Math.min(1, dt * (pose ? 18 : 10));
    var y = av.y + pulo;
    if (V && V.alvo) { ctx.save(); var pul = 0.5 + 0.5 * Math.sin(ts / 120); ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 + 0.4 * pul) + ')'; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.arc(V.alvo.x, V.alvo.y, 26 + pul * 6, 0, 6.2832); ctx.stroke(); ctx.restore(); }   // onde o dedo mandou ir
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(xd, chao + 4, A * 0.22 * Math.max(0.3, 1 + y / A * 0.6), A * 0.06, 0, 0, 6.2832); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(xd, chao + y); ctx.scale(1 + (1 - av.ag) * 0.35, av.ag);
    if (jg.invencivel && !pose && Math.floor(ts / 90) % 2) ctx.globalAlpha = 0.45;
    var lado = pose !== 'dor' && !(V && V.costas) && (Math.abs(vel) > 40 || (y < -5 && Math.abs(vel) > 10));   // andando (dedo, câmera ou teclado): de perfil   // andando a festa não vira de frente: sorri de lado   // andando (ou pulando para o lado): de perfil
    if (lado) { var dir = vel < 0 ? -1 : 1; av.dir = dir; ctx.scale(dir, 1); root.Boneco.corpoLado(ctx, cfg, A, { fase: av.fase, andando: Math.abs(vel) > 40, agacha: V && V.agacha > 0 ? 1 : 0, noAr: y < -5, cima: (V && V.cima) || pose === 'festa' || av.bE > 0.6 || av.bD > 0.6, ts: ts, expr: pose }); }
    else root.Boneco.corpoEmPe(ctx, cfg, A, { balanco: pose ? 0 : balanco, andando: andando && !pose, bE: av.bE, bD: gesto >= 0 && gesto < 1.4 ? 0.55 + 0.45 * Math.sin(ts / 110) : av.bD, pulando: corpo.pulando || pulo < -A * 0.05, ts: ts, pose: pose, costas: !!(V && V.costas && !pose), agacha: V && V.agacha > 0 ? 1 : 0 });
    ctx.restore();
    ctx.save(); ctx.font = '600 22px ' + D.fonte; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillStyle = cor; sombra(ctx, 'rgba(0,0,0,.8)', 6);
    ctx.fillText(D.nomes[j] || '', xd, chao + y - A * 1.02 * av.ag - 6); ctx.restore();
  }
  /* prévia no celular: um boneco parado, acenando, num canvas pequeno */
  function previa(canvas, cfg, ts) {
    var ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.save(); ctx.translate(w / 2, h * 0.94);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 4, w * 0.2, 8, 0, 0, 6.2832); ctx.fill();
    root.Boneco.corpoEmPe(ctx, cfg, h * 0.82, { balanco: 0, andando: false, bE: 0, bD: 0.5 + 0.5 * Math.sin((ts || 0) / 300), pulando: false, ts: ts || 0 });
    ctx.restore();
  }
  function previaCabeca(canvas, cfg) {
    var ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h); ctx.save(); ctx.translate(w / 2, h * 0.56); root.Boneco.cabeca(ctx, cfg, w * 0.62, 0); ctx.restore();
  }
  function marionete(ctx, jg, j, ts) {
    var r = jg.raia, k = jg.esqueleto, cfg = avatarCfg(j);
    var P = k.map(function (q) { return { x: r.x + q[0] * r.w, y: r.y + q[1] * r.h }; });
    ctx.save(); if (jg.invencivel && Math.floor(ts / 90) % 2) ctx.globalAlpha = 0.45;
    root.Boneco.marionete(ctx, cfg, P, ts); ctx.restore();
    var hs = Math.max(70, Math.min(230, Math.hypot(P[2].x - P[1].x, P[2].y - P[1].y) * 1.4));
    ctx.save(); ctx.font = '600 22px ' + D.fonte; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillStyle = cfg.cor; sombra(ctx, 'rgba(0,0,0,.8)', 6);
    ctx.fillText(D.nomes[j] || '', P[0].x, P[0].y - hs * 0.7); ctx.restore();
  }

  /* ---------- obstáculos do Pula e abaixa: tronco (chão) e galho (alto) ---------- */
  function obstaculo(ctx, c, ts) {
    var jg = null; // o chão é o da cena
    var chao = H * (root.Cenas ? root.Cenas.CHAO : 0.86);
    ctx.save();
    if (c.tipo === 'baixo') {
      ctx.translate(c.x, chao - c.h / 2 + 6); ctx.rotate(c.rot * 0.15);
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, c.h / 2 + 2, c.w * 0.6, 10, 0, 0, 6.2832); ctx.fill();
      var g = ctx.createLinearGradient(0, -c.h / 2, 0, c.h / 2); g.addColorStop(0, '#a0683d'); g.addColorStop(1, '#5d3a16');
      ctx.fillStyle = g; arred(ctx, -c.w / 2, -c.h / 2, c.w, c.h, 18); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 3; arred(ctx, -c.w / 2, -c.h / 2, c.w, c.h, 18); ctx.stroke();
      ctx.fillStyle = '#e0b48a'; ctx.beginPath(); ctx.ellipse(c.w / 2 - 4, 0, 12, c.h / 2 - 6, 0, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = '#a0683d'; ctx.lineWidth = 2; for (var i = 1; i < 4; i++) { ctx.beginPath(); ctx.ellipse(c.w / 2 - 4, 0, 12 * i / 4, (c.h / 2 - 6) * i / 4, 0, 0, 6.2832); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-c.w / 2 + 14, -8); ctx.lineTo(c.w / 2 - 20, -8); ctx.moveTo(-c.w / 2 + 20, 10); ctx.lineTo(c.w / 2 - 26, 10); ctx.stroke();
    } else {
      // galho pendurado do alto: a parte baixa fica na altura da cabeça do boneco em pé
      var baixo = chao - H * 0.42 * 0.62, topo = 0;
      ctx.translate(c.x, 0);
      ctx.strokeStyle = '#6d4c1e'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, topo); ctx.quadraticCurveTo(14 + Math.sin(ts / 300) * 8, baixo * 0.5, 0, baixo - 10); ctx.stroke();
      ctx.strokeStyle = '#8d5524'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, baixo * 0.35); ctx.lineTo(-50, baixo * 0.55); ctx.moveTo(0, baixo * 0.6); ctx.lineTo(48, baixo * 0.78); ctx.stroke();
      ctx.fillStyle = '#3f9b3f';
      [[-56, baixo * 0.55], [48, baixo * 0.78], [0, baixo - 4], [-20, baixo * 0.8], [26, baixo * 0.5]].forEach(function (f, i) { ctx.save(); ctx.translate(f[0], f[1]); ctx.rotate(Math.sin(ts / 400 + i) * 0.2); ctx.beginPath(); ctx.ellipse(0, 0, 34, 18, 0.4, 0, 6.2832); ctx.fill(); ctx.restore(); });
      ctx.fillStyle = '#c6ff3d'; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.ellipse(-50, baixo * 0.53, 14, 7, 0.4, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function trave(ctx, t, ts) {
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; sombra(ctx, CORES.ouro, 20 + 8 * Math.sin(ts / 200)); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(t.x, t.y + t.h); ctx.lineTo(t.x, t.y); ctx.lineTo(t.x + t.w, t.y); ctx.lineTo(t.x + t.w, t.y + t.h); ctx.stroke();
    ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5;
    for (var i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(t.x + t.w * i / 8, t.y); ctx.lineTo(t.x + t.w * i / 8, t.y + t.h); ctx.stroke(); }
    for (var k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(t.x, t.y + t.h * k / 5); ctx.lineTo(t.x + t.w, t.y + t.h * k / 5); ctx.stroke(); }
    ctx.restore();
  }

  /* ⚽ piscina de bolinhas dos lados do gol: torre com escadinha, cadeirinha que dobra, alvo no braço, papai e mamãe */
  var PAI = { cabeca: 'menino', cabelo: 'curto', corCabelo: '#3e2723', cor: '#1e88e5', roupa: 'camiseta', acessorio: 'nenhum', sapato: '#37474f', pele: '#f1c27d' };
  var MAE = { cabeca: 'menina', cabelo: 'coque', corCabelo: '#5d4037', cor: '#8e24aa', roupa: 'vestido', acessorio: 'nenhum', sapato: '#37474f', pele: '#ffd9b3' };
  var CORES_BOLINHAS = ['#ff5252', '#ffd166', '#3ee8ff', '#c6ff3d', '#ff4fa3', '#8e5bff', '#ff9800'];
  function tanques(ctx, lista, ts) {
    lista.forEach(function (k) {
      var L = k.lado, cx = k.x, topoP = 548, fundoP = 652, assento = 330, poste = cx - L * 105, escada = cx + L * 118, A = 250, cfg = k.quem === 'pai' ? PAI : MAE, B = root.Boneco;
      var u = k.t, dobra = k.fase === 'caindo' ? Math.min(1, u / 0.25) : k.fase === 'piscina' ? 1 : k.fase === 'subindo' ? Math.max(0, 1 - u / 1.9 * 1.4) : 0;
      ctx.save(); ctx.lineCap = 'round';
      // poste, braço do alvo e o alvo (vira um pouquinho quando acertam)
      ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(poste, fundoP - 10); ctx.lineTo(poste, assento - 70); ctx.lineTo(k.alvo.x, k.alvo.y); ctx.stroke();
      var a = k.alvo, bate = k.fase === 'caindo' ? Math.sin(u * 30) * 0.25 * (1 - u / 0.55) : 0;
      ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(bate); [[1, '#ff5252'], [0.72, '#fff'], [0.46, '#ff5252'], [0.2, '#ffd166']].forEach(function (c) { ctx.fillStyle = c[1]; ctx.beginPath(); ctx.arc(0, 0, a.r * c[0], 0, 6.2832); ctx.fill(); }); ctx.restore();
      if (k.fase === 'sentado') { ctx.strokeStyle = 'rgba(255,209,102,' + (0.4 + 0.3 * Math.sin(ts / 200)) + ')'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(a.x, a.y, a.r + 10, 0, 6.2832); ctx.stroke(); }   // pisca: "acerte aqui!"
      // escadinha
      ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 7; [-14, 14].forEach(function (d) { ctx.beginPath(); ctx.moveTo(escada + d, topoP); ctx.lineTo(escada + d, assento - 10); ctx.stroke(); });
      ctx.lineWidth = 5; for (var y = topoP - 26; y > assento; y -= 30) { ctx.beginPath(); ctx.moveTo(escada - 14, y); ctx.lineTo(escada + 14, y); ctx.stroke(); }
      // fundo da piscina (as bolinhas de trás)
      ctx.fillStyle = '#29b6f6'; arred(ctx, cx - 130, topoP - 18, 260, fundoP - topoP + 18, 18); ctx.fill();
      for (var i = 0; i < 26; i++) { ctx.fillStyle = CORES_BOLINHAS[i % CORES_BOLINHAS.length]; ctx.beginPath(); ctx.arc(cx - 118 + (i * 37) % 236, topoP - 6 + ((i * 13) % 3) * 9, 11, 0, 6.2832); ctx.fill(); }
      // a cadeirinha (dobra para baixo, presa no poste)
      ctx.save(); ctx.translate(poste, assento); ctx.rotate(L * dobra * 1.35); ctx.fillStyle = '#ffd166'; arred(ctx, L < 0 ? -175 : 25, -8, 150, 16, 6); ctx.fill(); ctx.fillStyle = '#f9a825'; arred(ctx, L < 0 ? -175 : 25, 6, 150, 8, 4); ctx.fill(); ctx.restore();   // a cadeirinha fica embaixo de quem senta e dobra para baixo
      // quem está lá
      if (B) {
        var px, py, op = {}, sentX = (poste + escada) / 2 + L * 8;
        if (k.fase === 'sentado') { px = sentX; py = assento + A * 0.22; op = { bE: 0.15, bD: 0.55 + 0.45 * Math.sin(ts / (k.quem === 'pai' ? 130 : 110)), balanco: 0 }; }   // sentado, dando tchauzinho
        else if (k.fase === 'caindo') { var q = Math.min(1, u / 0.55); px = sentX; py = assento + A * 0.22 + (topoP + A * 0.55 - assento - A * 0.22) * q * q; op = { pose: 'dor' }; }
        else if (k.fase === 'piscina') { px = sentX + Math.sin(u * 6) * 6; py = topoP + A * 0.55; op = { pose: 'festa', bE: 1, bD: 1 }; }   // rindo no meio das bolinhas
        else { var s2 = Math.min(1, u / 1.6), s3 = Math.max(0, (u - 1.6) / 0.3); px = escada + (sentX - escada) * s3; py = topoP + (assento + A * 0.22 - topoP) * s2; op = { costas: s3 < 0.5, bE: 0.5 + 0.5 * Math.sin(u * 9), bD: 0.5 - 0.5 * Math.sin(u * 9) }; }   // sobe a escadinha
        op.ts = ts; ctx.save(); ctx.translate(px, py); B.corpoEmPe(ctx, cfg, A, op); ctx.restore();
      }
      // frente da piscina (cobre quem caiu) + bolinhas da frente
      ctx.fillStyle = 'rgba(41,182,246,.92)'; arred(ctx, cx - 135, topoP + 8, 270, fundoP - topoP - 8, 18); ctx.fill();
      ctx.strokeStyle = '#0288d1'; ctx.lineWidth = 5; ctx.stroke();
      for (var f = 0; f < 18; f++) { ctx.fillStyle = CORES_BOLINHAS[(f + 3) % CORES_BOLINHAS.length]; ctx.beginPath(); ctx.arc(cx - 115 + (f * 29) % 230, topoP + 6 + (f % 2) * 6, 12, Math.PI, 0); ctx.fill(); }
      ctx.fillStyle = '#fff'; ctx.font = '700 22px ' + D.fonte; ctx.textAlign = 'center'; ctx.fillText(k.quem === 'pai' ? T('Papai', 'Dad', 'Papá') : T('Mamãe', 'Mom', 'Mamá'), cx, fundoP - 22);
      ctx.restore();
    });
  }

  /* 👨👩 quem joga junto: o papai na 🎳 Bagunça de bolas (corre de lado, bate na bola, acena pedindo) e a mamãe no 🎈
     Pega-pega (corre atrás dos bichos e pega um de vez em quando); os dois comemoram com a criança */
  function parenteCampo(ctx, P, jogs, ts, dt) {
    var B = root.Boneco, jg = jogs[0]; if (!B || !jg) return;
    var r = jg.raia, Ac = jg.vai ? jg.vai.A : r.h * 0.42, A = Math.min(420, Ac * 1.3), chao = r.y + r.h * 0.86, anda = Math.abs(P.vx) > 40;
    var cfg = P.quem === 'mae' ? MAE : PAI;
    D.parenteFase = (D.parenteFase || 0) + Math.abs(P.vx) / (A * 0.6) * 6.2832 * dt;
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(P.x, chao + 4, A * 0.2, A * 0.05, 0, 0, 6.2832); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(P.x, chao);
    if (P.fase === 'bate' && !P.alto && P.quem === 'pai') { ctx.scale(P.dir, 1); B.corpoLado(ctx, cfg, A, { chute: Math.min(1, P.t / 0.18), ts: ts }); }   // bola baixa: devolve com o pé
    else if (P.fase === 'bate') B.corpoEmPe(ctx, cfg, A, { bE: 1, bD: 1, balanco: 0, ts: ts });   // bola alta / bicho: pega com as mãos para cima
    else if (anda && P.fase !== 'festa') { ctx.scale(P.vx < 0 ? -1 : 1, 1); B.corpoLado(ctx, cfg, A, { fase: D.parenteFase, andando: true, ts: ts }); }
    else B.corpoEmPe(ctx, cfg, A, { bE: P.fase === 'festa' ? 1 : 0.12, bD: P.fase === 'festa' ? 1 : P.chama ? 0.6 + 0.4 * Math.sin(ts / 120) : 0.2, pose: P.fase === 'festa' ? 'festa' : null, balanco: 0, ts: ts });   // parado: acena pedindo a bola
    ctx.restore();
    if (P.fala) {   // balão de fala em cima da cabeça
      var txt = T(P.fala[0], P.fala[1], P.fala[2]); ctx.save(); ctx.font = '700 26px ' + D.fonte; var tw = ctx.measureText(txt).width + 32, bx = Math.max(10, Math.min(W - tw - 10, P.x - tw / 2)), by = chao - A - 70;
      ctx.fillStyle = 'rgba(255,255,255,.96)'; ctx.beginPath(); ctx.moveTo(bx + 20, by); ctx.arcTo(bx + tw, by, bx + tw, by + 48, 22); ctx.arcTo(bx + tw, by + 48, bx, by + 48, 22); ctx.arcTo(bx, by + 48, bx, by, 22); ctx.arcTo(bx, by, bx + tw, by, 22); ctx.fill();
      ctx.beginPath(); ctx.moveTo(P.x - 10, by + 46); ctx.lineTo(P.x, by + 66); ctx.lineTo(P.x + 12, by + 46); ctx.fill();
      ctx.fillStyle = '#0d47a1'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, bx + tw / 2, by + 25); ctx.restore();
    }
  }
  function particulas(ctx, dt, dtMs) {
    for (var i = D.parts.length - 1; i >= 0; i--) {
      var p = D.parts[i]; p.vida -= dtMs; if (p.vida <= 0) { D.parts.splice(i, 1); continue; }
      if (p.tipo === 'corte') { ctx.save(); ctx.globalAlpha = p.vida / 220; ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.lineCap = 'round'; sombra(ctx, '#fff', 18); ctx.beginPath(); ctx.moveTo(p.x - Math.cos(p.ang) * p.len, p.y - Math.sin(p.ang) * p.len); ctx.lineTo(p.x + Math.cos(p.ang) * p.len, p.y + Math.sin(p.ang) * p.len); ctx.stroke(); ctx.restore(); continue; }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.rot != null) p.rot += dt * 4;
      ctx.globalAlpha = Math.min(1, p.vida / 400); ctx.fillStyle = p.cor;
      if (p.tipo === 'estrela') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.beginPath(); for (var k = 0; k < 10; k++) { var rr = k % 2 ? p.r * 0.45 : p.r, a = k * Math.PI / 5; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.restore(); }
      else if (p.tipo === 'confete') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); }
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }

  function hud(ctx, estado, ts) {
    var jogs = estado.jogadores, dois = jogs.length === 2;
    ctx.save(); ctx.textBaseline = 'top';
    jogs.forEach(function (jg, j) {
      // jogador 1 encostado à esquerda; jogador 2 encostado à direita (o relógio fica no meio, livre)
      // no celular/tablet a coluna de botões (✕ ⏸ 🧍 🔊 🎵) fica na direita: o placar da direita anda para fora dela
      var margem = D.icones && D.canvas && D.canvas.clientWidth ? 64 * W / D.canvas.clientWidth : 0;
      var r = jg.raia, dir = j === 1, x = dir ? r.x + r.w - 26 - margem : r.x + 26, y = 18, cor = CORES.j[j], s = dir ? -1 : 1;
      var pop = D.pops[j] ? Math.max(0, 1 - (ts - D.pops[j]) / 300) : 0, esc = 1 + pop * 0.35;
      ctx.textAlign = dir ? 'right' : 'left';
      // nome
      ctx.font = '600 26px ' + D.fonte; ctx.fillStyle = cor; sombra(ctx, 'rgba(0,0,0,.8)', 8);
      ctx.fillText(D.nomes[j] || (T('Jogador ', 'Player ', 'Jugador ') + (j + 1)), x, y);
      // pontos
      ctx.save(); ctx.translate(x, y + 30); ctx.scale(esc, esc); ctx.font = '700 64px ' + D.fonte; ctx.fillStyle = CORES.ouro; ctx.fillText(String(jg.pontos), 0, 0); ctx.restore();
      // vidas
      if (!estado.casa) { ctx.font = '28px system-ui'; var vs = ''; for (var i = 0; i < 3; i++) vs += i < jg.vidas ? '❤️' : '🖤'; ctx.fillText(vs, x, y + 104); }   // na Bagunça ninguém perde vida
      // poder / lento
      if (jg.poder === 'x2') { ctx.font = '700 30px ' + D.fonte; ctx.fillStyle = CORES.ciano; ctx.fillText('✖2 ' + Math.max(0, Math.ceil((jg.poderAte - estado.tempo) / 1000)) + 's', x + s * 120, y + 104); }
      if (jg.lento) { ctx.font = '30px system-ui'; ctx.fillText('🐌', x + s * 220, y + 104); }
      // combo
      if (jg.combo >= 2) { ctx.textAlign = 'center'; ctx.font = '700 40px ' + D.fonte; ctx.fillStyle = CORES.ouro; ctx.fillText('COMBO ×' + jg.combo, r.x + r.w / 2, 150); }
    });
    // tempo (no meio do topo)
    if (estado.restante != null) {
      ctx.textAlign = 'center'; ctx.font = '700 54px ' + D.fonte; ctx.fillStyle = estado.restante <= 10 && estado.fase === 'jogando' ? '#ff5252' : '#fff';
      var s = estado.restante, mm = Math.floor(s / 60), ss = s % 60; ctx.fillText(mm + ':' + (ss < 10 ? '0' : '') + ss, W / 2, 16);
    }
    // modo atual (pequeno)
    var nomeModo = { corta: T('🍉 Corta-corta', '🍉 Slice', '🍉 Corta-corta'), pega: T('🎈 Pega-pega', '🎈 Catch', '🎈 Pilla-pilla'), chuta: T('⚽ Chuta-chuta', '⚽ Kick', '⚽ Chuta-chuta'), pula: T('🪵 Pula e abaixa', '🪵 Jump and duck', '🪵 Salta y agáchate'), bolas: T('🎳 Bagunça de bolas', '🎳 Ball mayhem', '🎳 Alboroto de pelotas'), bagunca: estado.casa ? { sala: T('🧸 Bagunça na sala', '🧸 Living-room mayhem', '🧸 Alboroto en el salón'), quarto: T('🧸 Bagunça no quarto', '🧸 Bedroom mayhem', '🧸 Alboroto en el dormitorio'), jardim: T('🧸 Bagunça no jardim', '🧸 Garden mayhem', '🧸 Alboroto en el jardín'), cozinha: T('🧸 Bagunça na cozinha', '🧸 Kitchen mayhem', '🧸 Alboroto en la cocina'), banheiro: T('🧸 Bagunça no banheiro', '🧸 Bathroom mayhem', '🧸 Alboroto en el baño'), parquinho: T('🧸 Bagunça no parquinho', '🧸 Playground mayhem', '🧸 Alboroto en el parque') }[estado.casa.cena] : '' }[estado.modo] || '';
    if (estado.arrumando && estado.casa) nomeModo = { sala: T('🧹 Arrumando a sala', '🧹 Tidying the living room', '🧹 Ordenando el salón'), quarto: T('🧹 Arrumando o quarto', '🧹 Tidying the bedroom', '🧹 Ordenando el dormitorio'), jardim: T('🧹 Arrumando o jardim', '🧹 Tidying the garden', '🧹 Ordenando el jardín'), cozinha: T('🧹 Arrumando a cozinha', '🧹 Tidying the kitchen', '🧹 Ordenando la cocina'), banheiro: T('🧹 Arrumando o banheiro', '🧹 Tidying the bathroom', '🧹 Ordenando el baño'), parquinho: T('🧹 Arrumando o parquinho', '🧹 Tidying the playground', '🧹 Ordenando el parque') }[estado.casa.cena] || nomeModo;
    ctx.textAlign = 'center'; ctx.font = '600 24px ' + D.fonte; ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillText(nomeModo, W / 2, 76);
    if (D.modoAviso && ts < D.modoAviso.ate) { var a = Math.min(1, (D.modoAviso.ate - ts) / 500); ctx.globalAlpha = a; ctx.font = '700 80px ' + D.fonte; ctx.fillStyle = CORES.ciano; sombra(ctx, CORES.ciano, 30); ctx.fillText({ corta: T('🍉 Corta!', '🍉 Slice!', '🍉 ¡Corta!'), pega: T('🎈 Pega!', '🎈 Catch!', '🎈 ¡Coge!'), chuta: T('⚽ Chuta!', '⚽ Kick!', '⚽ ¡Chuta!'), pula: T('🪵 Pula e abaixa!', '🪵 Jump and duck!', '🪵 ¡Salta y agáchate!'), bolas: T('🎳 Bagunça de bolas!', '🎳 Ball mayhem!', '🎳 ¡Alboroto de pelotas!') }[D.modoAviso.modo], W / 2, 280); ctx.globalAlpha = 1; }
    if (D.aviso && ts < D.aviso.ate) { var rj = jogs[D.aviso.j] ? jogs[D.aviso.j].raia : jogs[0].raia, pisc = Math.floor(ts / 120) % 2 === 0 || D.menos; ctx.textAlign = 'center'; ctx.font = '700 96px ' + D.fonte; ctx.fillStyle = pisc ? (D.aviso.tipo === 'baixo' ? CORES.ouro : CORES.ciano) : '#fff'; sombra(ctx, ctx.fillStyle, 30); ctx.fillText(D.aviso.tipo === 'baixo' ? T('⬆ PULA!', '⬆ JUMP!', '⬆ ¡SALTA!') : T('⬇ ABAIXA!', '⬇ DUCK!', '⬇ ¡AGÁCHATE!'), rj.x + rj.w / 2, 230); ctx.shadowBlur = 0; }
    if (estado.fase === 'pausa') { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, W, H); ctx.font = '700 90px ' + D.fonte; ctx.fillStyle = '#fff'; ctx.fillText(T('⏸ Pausa', '⏸ Paused', '⏸ Pausa'), W / 2, 300); }
    ctx.restore();
  }

  function camadaTexto(ctx, ts, dtMs) {
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var i = D.textos.length - 1; i >= 0; i--) {
      var t = D.textos[i]; t.vida -= dtMs; if (t.vida <= 0) { D.textos.splice(i, 1); continue; }
      t.y -= (t.grande ? 20 : 60) * dtMs / 1000;
      ctx.globalAlpha = Math.min(1, t.vida / 300); ctx.font = '700 ' + t.tam + 'px ' + D.fonte; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.fillStyle = t.cor;
      ctx.strokeText(t.t, t.x, t.y); ctx.fillText(t.t, t.x, t.y);
    }
    ctx.globalAlpha = 1;
    if (D.legenda) {
      var L = D.legenda, vis = true, pulso = (L.pisca && !D.menos) ? 0.65 + 0.35 * Math.sin((ts - L.desde) / 160) : 1;
      ctx.font = '700 46px ' + D.fonte; var w = Math.min(W - 60, ctx.measureText(L.t).width + 70);
      ctx.fillStyle = 'rgba(0,0,0,.72)'; arred(ctx, W / 2 - w / 2, H - 150, w, 90, 24); ctx.fill();
      ctx.lineWidth = 5; ctx.globalAlpha = pulso; ctx.strokeStyle = L.cor; sombra(ctx, L.cor, 24); arred(ctx, W / 2 - w / 2, H - 150, w, 90, 24); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = L.cor; ctx.fillText(L.t, W / 2, H - 105, W - 100); ctx.globalAlpha = 1;
    }
    if (D.contagem) { var c = D.contagem, e = (ts - c.desde) / 1000, esc2 = 1.6 - Math.min(0.6, e); ctx.globalAlpha = Math.max(0, 1 - e); ctx.font = '700 ' + Math.round(220 * esc2) + 'px ' + D.fonte; ctx.fillStyle = CORES.ouro; sombra(ctx, CORES.ouro, 40); ctx.fillText(String(c.n), W / 2, H / 2); ctx.globalAlpha = 1; }
    ctx.restore();
  }
  function arred(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  /* pódio no fim: desenha sobre o palco escurecido */
  function podio(ctx, ordem, nomesJ, ts) {
    ctx = ctx || D.ctx; ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '700 96px ' + D.fonte; ctx.fillStyle = CORES.ouro; sombra(ctx, CORES.ouro, 40); ctx.fillText('🏆', W / 2, 150);
    ctx.shadowBlur = 0; var med = ['🥇', '🥈'];
    ordem.forEach(function (o, i) { ctx.font = '700 ' + (i ? 48 : 64) + 'px ' + D.fonte; ctx.fillStyle = i ? '#fff' : CORES.ouro; ctx.fillText((ordem.length > 1 ? med[i] + ' ' : '') + (nomesJ[o.j] || (T('Jogador ', 'Player ', 'Jugador ') + (o.j + 1))) + '  ' + o.pontos, W / 2, 290 + i * 90); });
    ctx.font = '600 32px ' + D.fonte; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillText(T('Jogar de novo: toque em ▶ no celular (ou OK no controle)', 'Play again: tap ▶ on the phone (or OK on the remote)', 'Jugar otra vez: toca ▶ en el móvil (u OK en el mando)'), W / 2, 560, W - 80);
    ctx.restore();
  }

  root.Desenho = { iniciar: iniciar, quadro: quadro, legenda: legenda, contagem: contagem, confete: confete, podio: podio, nomes: nomes, texto: texto, ambiente: ambiente, avatares: avatares, avatar: function (j) { return avatarCfg(j); }, previa: previa, previaCabeca: previaCabeca, imagem: imagem, pulso: pulso, mostrarBoneco: mostrarBoneco, dedo: function (v) { D.dedo = !!v; }, iconesDireita: function (v) { D.icones = !!v; }, leve: leve, estaLeve: function () { return D.leve; }, erros: function () { return D.erros; }, ehTV: ehTV, limpar: limpar, CORES: CORES, W: W, H: H };
})(typeof self !== 'undefined' ? self : this);
