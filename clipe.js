/*
  Clipe do Bolinho — peça comum (dono, 19/Nov/2026). Um "telão" por cima da página com bichinhos desenhados em código
  (canvas: sem vídeo, sem IA, sem nada baixado) dançando no ritmo da música que já está tocando.
  Quem usa: a rádio da estante (radio.js, botão "📺 Clipe" no tocador) e o H-rraaa (a-garra/, botão "📺 Clipe" no menu).

  Uso:
    estante:  <script src="/kids/clipe.js"></script>  (e 'clipe.js' no BASICO do sw.js da raiz)
    jogo:     <script src="../clipe.js" data-fora-do-arquivo></script>  (e '../clipe.js' no ARQUIVOS do sw.js do jogo;
              depois rode  node ferramentas/pecas-comuns.js)
    BolinhoClipe.abrir({ cenas: 'radio' | 'garra', audio: <o <audio> que já toca>,
                         musica: function () { return { t: 'Nome da música', au: 'Autor' }; } });
    BolinhoClipe.fechar();   BolinhoClipe.aberto();   BolinhoClipe.cena(n)  (vai para a cena n; usado nos testes e prints)
    BolinhoClipe.telinha(caixa, audio) -> { ligar(), desligar() }   (a TELINHA dos DJs em cima da rádio; ver "A TELINHA")

  Como funciona:
  - Cenas (arte própria): rádio = Festa na piscina (capivara DJ, coelhinha e guaxinim), Discoteca do Bolinho (globo
    espelhado) e Luau na praia (tartaruga no ukulele e caranguejos); H-rraaa = Pelúcias na balada (dentro da máquina,
    a garra balançando como DJ) e DJ Garra (a garra de fone na mesa de som em cima da máquina). Trocam a cada música
    (ou a cada 40 s). O nome da música e o autor ficam num letreiro embaixo.
  - Ritmo: lê o som do <audio> que já toca por audio.captureStream() + AnalyserNode (o som continua saindo direto do
    <audio>, sem passar pelo WebAudio: nada muda no volume nem na tela de bloqueio). Navegador sem captureStream:
    120 BPM com pequenas variações.
  - Reduzir movimento (sistema): balanço mínimo, sem passinho especial e sem luzes piscando.
  - Leve para o tablet Fire velho: o cenário fixo é pintado uma vez fora da tela; devicePixelRatio no máximo 2 (cai
    para 1 e 30 quadros por segundo se o aparelho não der conta); o laço para quando o telão fecha ou a aba some.
  - Sai por ✕, Esc, Voltar do celular e Voltar do controle da TV; ⛶ põe o telão em tela cheia.
  - Vídeo de IA no lugar do desenho: ver CLIPES_VIDEO logo abaixo.
  - Telinha dos DJs (dono, 20/Nov/2026): uma TV pequena presa em cima da rádio da estante, só enquanto a rádio toca
    (radio.js monta a caixa, o ✕ e o aparecer/sumir; aqui fica o desenho). Mostra de perto a Festa na piscina: a
    capivara DJ na mesa de som e a coelhinha dançando, no mesmo ritmo do telão. Tocar nela abre o telão.
  Escrito em JavaScript antigo (sem =>) de propósito: o tablet Fire mais velho também roda.
*/
(function (raiz) {
  'use strict';
  if (raiz.BolinhoClipe) return;

  // ---------- Vídeos de IA (quando o dono tiver) ----------
  // Ponha aqui o endereço de um vídeo .mp4 ou .webm guardado NO PRÓPRIO SITE (ex.: '/kids/clipes/festa-na-piscina.mp4';
  // o H-rraaa só aceita vídeo do mesmo site). Com internet, o telão toca o vídeo em laço e sem som (a música continua
  // a da rádio ou do jogo) por cima do desenho, um vídeo por música; se o vídeo não abrir, fica o desenho.
  // Lista vazia = só o desenho. O sw.js da estante já deixa .mp4/.webm passar direto, como faz com .mp3 (vídeo grande
  // não vai para a gaveta do aparelho); ao pôr o primeiro vídeo do H-rraaa, faça o mesmo no service worker do jogo.
  // telinha: a TV pequena em cima da rádio (só um vídeo, em laço, sem som). O vídeo de IA dos dois DJs vai assim:
  //   1. o arquivo em  clipes/radio-dj.mp4  (na raiz do repositório kids; 1920 × 1080, sem som, que emende em laço);
  //   2. aqui:  telinha: ['/kids/clipes/radio-dj.mp4'],  (e, se quiser o mesmo vídeo no telão grande, também em radio);
  //   3. suba a VERSAO do sw.js da raiz e o data-versao do index.html, e rode  node ferramentas/pecas-comuns.js .
  // Sem internet, ou se o vídeo não abrir, a telinha continua com o desenho.
  var CLIPES_VIDEO = {
    radio: [],
    garra: [],
    telinha: []
  };

  var d = raiz.document, TAU = Math.PI * 2;
  function T(pt, en, es) { return raiz.BolinhoIdioma && raiz.BolinhoIdioma.t ? raiz.BolinhoIdioma.t(pt, en, es) : pt; }
  var calmo = false;
  try { calmo = raiz.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* sem matchMedia */ }

  // ---------- cores ----------
  var RGB = {}, MIX = {};
  function rgb(h) {
    var c = RGB[h]; if (c) return c;
    var s = h.charAt(0) === '#' ? h.slice(1) : h;
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    var n = parseInt(s, 16); c = RGB[h] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return c;
  }
  function mix(a, b, t, al) {
    var k = a + b + t + '|' + al, r = MIX[k]; if (r) return r;
    var x = rgb(a), y = rgb(b);
    r = MIX[k] = 'rgba(' + Math.round(x[0] + (y[0] - x[0]) * t) + ',' + Math.round(x[1] + (y[1] - x[1]) * t) + ',' + Math.round(x[2] + (y[2] - x[2]) * t) + ',' + (al == null ? 1 : al) + ')';
    return r;
  }
  function claro(h, t) { return mix(h, '#ffffff', t); }
  function escuro(h, t) { return mix(h, '#2a1640', t); }
  function rgba(h, al) { return mix(h, h, 0, al); }
  function sorteio(semente) { var s = semente >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  if (!Math.imul) Math.imul = function (a, b) { return (a * b) | 0; };

  // ---------- formas com volume (o "3D fofo": luz de cima à esquerda, contorno suave, brilho) ----------
  var GC = {}, nGC = 0, gcDe = null;
  function grad(c, cor, x, y, rx, ry) {
    if (gcDe !== c) { GC = {}; nGC = 0; gcDe = c; }
    var k = cor + (x | 0) + ',' + (y | 0) + ',' + (rx | 0) + ',' + (ry | 0), g = GC[k];
    if (g) return g;
    var r = Math.max(rx, ry);
    g = c.createRadialGradient(x - rx * 0.35, y - ry * 0.45, r * 0.05, x - rx * 0.1, y - ry * 0.12, r * 1.2);
    g.addColorStop(0, claro(cor, 0.5)); g.addColorStop(0.32, claro(cor, 0.12)); g.addColorStop(0.72, cor); g.addColorStop(1, escuro(cor, 0.32));
    GC[k] = g; if (++nGC > 900) { GC = {}; nGC = 0; }
    return g;
  }
  function elipse(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, TAU); }
  function vol(c, cor, x, y, rx, ry, rot, semBorda) {
    elipse(c, x, y, rx, ry, rot);
    c.fillStyle = grad(c, cor, x, y, rx, ry); c.fill();
    if (!semBorda) { c.lineWidth = 3.2; c.strokeStyle = escuro(cor, 0.6); c.stroke(); }
  }
  function liso(c, cor, x, y, rx, ry, rot) { elipse(c, x, y, rx, ry, rot); c.fillStyle = cor; c.fill(); }
  function brilho(c, x, y, rx, ry, al) { elipse(c, x, y, rx, ry, -0.5); c.fillStyle = 'rgba(255,255,255,' + (al || 0.55) + ')'; c.fill(); }
  function sombra(c, x, y, rx, al) { elipse(c, x, y, rx, rx * 0.22); c.fillStyle = 'rgba(25,10,45,' + al + ')'; c.fill(); }
  function rr(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }
  function coracao(c, x, y, r) {
    c.beginPath(); c.moveTo(x, y + r * 0.9);
    c.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.75, y - r * 1.25, x, y - r * 0.45);
    c.bezierCurveTo(x + r * 0.75, y - r * 1.25, x + r * 1.5, y - r * 0.1, x, y + r * 0.9); c.closePath();
  }
  function estrela(c, x, y, r, pontas, dentro) {
    var n = pontas || 5, ri = r * (dentro || 0.48); c.beginPath();
    for (var i = 0; i < n * 2; i++) { var a = -Math.PI / 2 + i * Math.PI / n, rr2 = i % 2 ? ri : r; c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
    c.closePath();
  }
  function flor(c, x, y, r, cor, miolo) {
    for (var i = 0; i < 5; i++) { var a = i * TAU / 5 - Math.PI / 2; vol(c, cor, x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.52, r * 0.52, 0, true); }
    liso(c, miolo || '#ffd84a', x, y, r * 0.32, r * 0.32);
  }
  function halo(c, x, y, r, cor) {
    var g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, cor); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // ---------- rostos e acessórios ----------
  function olho(c, x, y, r, fechado) {
    if (fechado) {
      c.beginPath(); c.arc(x, y + r * 0.35, r * 0.75, Math.PI * 1.15, Math.PI * 1.85);
      c.lineWidth = r * 0.34; c.lineCap = 'round'; c.strokeStyle = '#2a1b3d'; c.stroke(); return;
    }
    liso(c, '#2a1b3d', x, y, r * 0.82, r);
    liso(c, 'rgba(140,110,230,.55)', x, y + r * 0.5, r * 0.5, r * 0.3);
    liso(c, '#ffffff', x - r * 0.28, y - r * 0.38, r * 0.34, r * 0.34);
    liso(c, '#ffffff', x + r * 0.3, y + r * 0.26, r * 0.14, r * 0.14);
  }
  function bochechas(c, dx, y, r) { liso(c, 'rgba(255,110,150,.42)', -dx, y, r, r * 0.62); liso(c, 'rgba(255,110,150,.42)', dx, y, r, r * 0.62); }
  function boca(c, y, w, aberta) {
    c.lineCap = 'round';
    if (aberta) {
      c.beginPath(); c.moveTo(-w, y); c.quadraticCurveTo(0, y + w * 1.9, w, y); c.closePath();
      c.fillStyle = '#5a1838'; c.fill(); liso(c, '#ff7f9f', 0, y + w * 0.62, w * 0.5, w * 0.3);
      c.lineWidth = 2.4; c.strokeStyle = '#3a1230'; c.stroke(); return;
    }
    c.beginPath(); c.moveTo(-w, y); c.quadraticCurveTo(-w * 0.5, y + w * 0.75, 0, y + w * 0.1); c.quadraticCurveTo(w * 0.5, y + w * 0.75, w, y);
    c.lineWidth = 3; c.strokeStyle = '#3a1f3f'; c.stroke();
  }
  var LENTES = {
    preto: ['#4a3a7a', '#0c0718', '#2b2140'],
    espelho: ['#7be3ff', '#3b55e6', '#ffffff'],
    rosa: ['#ffa3cf', '#d81b78', '#ffffff'],
    lima: ['#e6ff8a', '#3fae2a', '#1f3b10']
  };
  function oculos(c, y, dx, r, tipo, forma) {
    var L = LENTES[tipo] || LENTES.preto, aro = L[2];
    c.lineCap = 'round'; c.lineWidth = 4; c.strokeStyle = aro;
    c.beginPath(); c.moveTo(-dx + r * 0.75, y - r * 0.25); c.quadraticCurveTo(0, y - r * 0.7, dx - r * 0.75, y - r * 0.25); c.stroke();
    for (var s = -1; s <= 1; s += 2) {
      var cx = s * dx;
      if (forma === 'coracao') coracao(c, cx, y + r * 0.05, r * 0.95);
      else if (forma === 'estrela') estrela(c, cx, y, r * 1.2, 5, 0.55);
      else { rr(c, cx - r * 1.05, y - r * 0.8, r * 2.1, r * 1.6, r * 0.7); }
      var g = c.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, L[0]); g.addColorStop(1, L[1]);
      c.fillStyle = g; c.fill(); c.lineWidth = 3.5; c.strokeStyle = aro; c.stroke();
      c.save(); c.clip();
      c.beginPath(); c.moveTo(cx - r * 0.9, y + r * 0.2); c.lineTo(cx - r * 0.2, y - r); c.lineTo(cx + r * 0.15, y - r); c.lineTo(cx - r * 0.55, y + r * 0.35); c.closePath();
      c.fillStyle = 'rgba(255,255,255,.55)'; c.fill();
      c.restore();
    }
  }
  function fone(c, rx, ry, cor) {
    c.lineCap = 'round';
    c.beginPath(); c.ellipse(0, 4, rx * 1.04, ry * 1.12, 0, Math.PI * 1.06, Math.PI * 1.94);
    c.lineWidth = 12; c.strokeStyle = escuro(cor, 0.55); c.stroke(); c.lineWidth = 8; c.strokeStyle = cor; c.stroke();
    c.beginPath(); c.ellipse(0, 4, rx * 1.04, ry * 1.12, 0, Math.PI * 1.3, Math.PI * 1.55); c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,255,255,.65)'; c.stroke();
    for (var s = -1; s <= 1; s += 2) {
      vol(c, cor, s * rx * 1.02, 8, 15, 23);
      liso(c, claro(cor, 0.45), s * rx * 1.02 + s * 5, 8, 5, 13);
      brilho(c, s * rx * 1.02 - 5, -1, 4, 7, 0.6);
    }
  }
  function bone(c, ry, cor) {
    c.beginPath(); c.ellipse(0, -ry * 0.55, ry * 1.02, ry * 0.62, 0, Math.PI, TAU); c.closePath();
    c.fillStyle = grad(c, cor, 0, -ry * 0.7, ry, ry * 0.6); c.fill(); c.lineWidth = 3; c.strokeStyle = escuro(cor, 0.6); c.stroke();
    vol(c, cor, ry * 0.75, -ry * 0.52, ry * 0.62, ry * 0.16);
    liso(c, claro(cor, 0.6), 0, -ry * 1.15, 6, 4);
  }
  function laco(c, x, y, r, cor) {
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - r * 1.6, y - r * 1.3, x - r * 1.5, y); c.quadraticCurveTo(x - r * 1.6, y + r * 1.3, x, y); c.closePath();
    c.moveTo(x, y); c.quadraticCurveTo(x + r * 1.6, y - r * 1.3, x + r * 1.5, y); c.quadraticCurveTo(x + r * 1.6, y + r * 1.3, x, y); c.closePath();
    c.fillStyle = grad(c, cor, x, y, r * 1.5, r); c.fill(); c.lineWidth = 2.5; c.strokeStyle = escuro(cor, 0.55); c.stroke();
    vol(c, cor, x, y, r * 0.45, r * 0.5);
  }

  // ---------- os bichinhos ----------
  // Coordenadas do bichinho: o chão em y = 0, para cima negativo; corpo em (0, -70); cabeça em cima do corpo.
  var CAB = { capivara: [58, 46], coelha: [52, 48], guaxinim: [56, 46], urso: [56, 49], porquinha: [56, 47], sapo: [64, 44], unicornio: [53, 49], tartaruga: [47, 42] };

  function pose(p, R) {
    var amp = R.amp, f = R.fase + (p.atraso || 0), n = Math.floor(f), b = f - n;
    var pul = Math.pow(1 - b, 2.4), sobe = Math.sin(b * Math.PI), bal = Math.sin(f * Math.PI);
    var o = { dx: 0, hop: 0, inc: 0, sx: 1, sq: pul * 0.07 * amp, aE: 0.5, aD: 0.5, cab: bal * 0.11 * amp, cabY: pul * 5 * amp,
      orelha: Math.sin((f - 0.25) * Math.PI) * 0.22 * amp, n: n, b: b, f: f, bal: bal, sobe: sobe, pul: pul };
    var dan = p.danca || 'balanca';
    if (dan === 'balanca') { o.dx = bal * 12 * amp; o.inc = bal * 0.08 * amp; o.aE = 0.55 + amp * (1 + bal) * 0.95; o.aD = 0.55 + amp * (1 - bal) * 0.95; }
    else if (dan === 'pula') { o.hop = sobe * 18 * amp; o.aE = o.aD = 0.5 + 2 * sobe * amp; o.cab = bal * 0.06 * amp; }
    else if (dan === 'aponta') { o.dx = bal * 9 * amp; o.inc = bal * 0.06 * amp; o.aE = 0.35 + 0.25 * amp; o.aD = 0.75 + amp * (1.05 + 1.05 * Math.cos(f * Math.PI)); }
    else if (dan === 'remexe') { o.dx = Math.sin(f * TAU) * 7 * amp; o.inc = bal * 0.12 * amp; o.aE = 0.9 + 0.7 * sobe * amp; o.aD = 0.9 + 0.7 * (1 - sobe) * amp; o.sq = pul * 0.1 * amp; }
    o.boca = n % 4 === 0 && b < 0.55 && amp > 0.3;
    // passinho especial: a cada 16 tempos, 2 tempos de passinho (cada bichinho na sua vez)
    if (!R.calmo && R.tocando && p.esp) {
      var ciclo = ((n - (p.vez || 0)) % 16 + 16) % 16;
      if (ciclo < 2) {
        var e = (ciclo + b) / 2;
        if (p.esp === 'gira') { o.sx = Math.cos(e * TAU); o.aE = o.aD = 2.5; o.boca = true; }
        else if (p.esp === 'pulao') { o.hop = Math.sin(e * Math.PI) * 62; o.aE = o.aD = 2.8; o.boca = true; o.sq = -Math.sin(e * Math.PI) * 0.08; }
        else if (p.esp === 'disco') { o.aD = 2.75; o.aE = 0.3; o.inc = -0.13; o.dx = Math.sin(e * TAU) * 14; o.boca = true; }
        else if (p.esp === 'requebra') { o.dx = Math.sin(e * 6 * TAU) * 10; o.inc = Math.sin(e * 3 * TAU) * 0.16; o.aE = o.aD = 1.6; o.boca = true; }
      }
    }
    o.piscar = ((R.t + (p.atraso || 0) * 1.37 + (p.x || 0) * 0.01) % 3.9) < 0.13;
    return o;
  }

  function braco(c, x, y, a, lado, L, larg, cor, mao) {
    var ex = x + lado * Math.sin(a) * L, ey = y + Math.cos(a) * L;
    c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.lineTo(ex, ey);
    c.lineWidth = larg + 5; c.strokeStyle = escuro(cor, 0.6); c.stroke();
    c.lineWidth = larg; c.strokeStyle = cor; c.stroke();
    c.beginPath(); c.moveTo(x - 2, y - 2); c.lineTo(x + (ex - x) * 0.6 - 2, y + (ey - y) * 0.6 - 2);
    c.lineWidth = larg * 0.3; c.strokeStyle = mix(cor, '#ffffff', 0.5, 0.7); c.stroke();
    vol(c, mao || cor, ex, ey, larg * 0.74, larg * 0.68);
    return [ex, ey];
  }
  // braço até um ponto (DJ na mesa, tartaruga no ukulele)
  function bracoAte(c, x, y, ex, ey, larg, cor) {
    c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.lineTo(ex, ey);
    c.lineWidth = larg + 5; c.strokeStyle = escuro(cor, 0.6); c.stroke();
    c.lineWidth = larg; c.strokeStyle = cor; c.stroke();
    c.beginPath(); c.moveTo(x - 2, y - 2); c.lineTo(x + (ex - x) * 0.6 - 2, y + (ey - y) * 0.6 - 2);
    c.lineWidth = larg * 0.3; c.strokeStyle = mix(cor, '#ffffff', 0.5, 0.7); c.stroke();
    vol(c, cor, ex, ey, larg * 0.74, larg * 0.68);
  }

  function rabo(c, p, o) {
    if (p.tipo === 'guaxinim') {
      c.save(); c.translate(34, -40); c.rotate(1.05 + o.bal * 0.25);
      vol(c, p.cor, 0, -42, 17, 46);
      c.save(); elipse(c, 0, -42, 17, 46); c.clip();
      c.fillStyle = '#3d3550'; c.fillRect(-20, -92, 40, 14); c.fillRect(-20, -66, 40, 12); c.fillRect(-20, -42, 40, 12); c.fillRect(-20, -18, 40, 12);
      c.restore(); c.restore();
    } else if (p.tipo === 'porquinha') {
      c.beginPath(); c.moveTo(40, -52); c.bezierCurveTo(62, -66, 64, -40, 54, -42); c.bezierCurveTo(46, -44, 52, -58, 62, -56);
      c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = escuro(p.cor, 0.3); c.stroke();
    } else if (p.tipo === 'unicornio') {
      var cs = ['#ff7ab8', '#ffd84a', '#7be3ff', '#b78cff'];
      for (var i = 0; i < 4; i++) vol(c, cs[i], 40 + i * 6, -58 + i * 10 + o.bal * 3, 12 - i, 12 - i, 0, true);
    }
  }

  function roupa(c, p, o) {
    var r = p.roupa;
    if (!r) return;
    c.save(); elipse(c, 0, -70, 44, 52); c.clip();
    if (r === 'havaiana') {
      c.fillStyle = '#19b3a6'; c.fillRect(-50, -126, 100, 112);
      var pos = [[-26, -96], [14, -104], [-8, -66], [28, -70], [-30, -46], [10, -40]];
      for (var i = 0; i < pos.length; i++) flor(c, pos[i][0], pos[i][1], 9, i % 2 ? '#ffe066' : '#ffffff', i % 2 ? '#ff7a3d' : '#ff9fc6');
      c.beginPath(); c.moveTo(-16, -126); c.lineTo(0, -92); c.lineTo(16, -126); c.closePath(); c.fillStyle = p.barriga || '#f6e1c6'; c.fill();
      liso(c, '#ffffff', 0, -80, 2.6, 2.6); liso(c, '#ffffff', 0, -62, 2.6, 2.6); liso(c, '#ffffff', 0, -44, 2.6, 2.6);
    } else if (r === 'maio') {
      c.fillStyle = '#ff4fa3'; c.beginPath(); c.moveTo(-50, -84);
      c.quadraticCurveTo(-25, -98, 0, -86); c.quadraticCurveTo(25, -98, 50, -84); c.lineTo(50, -10); c.lineTo(-50, -10); c.closePath(); c.fill();
      for (var y = -78; y < -16; y += 14) for (var x = -42 + ((y / 14) % 2 ? 7 : 0); x < 46; x += 14) liso(c, '#ffffff', x, y, 3.2, 3.2);
      c.lineWidth = 5; c.strokeStyle = '#ff4fa3'; c.beginPath(); c.moveTo(-22, -92); c.lineTo(-28, -122); c.moveTo(22, -92); c.lineTo(28, -122); c.stroke();
      flor(c, -18, -86, 7, '#ffe066');
    } else if (r === 'sunga') {
      c.fillStyle = '#ff9f1c'; c.fillRect(-50, -46, 100, 40);
      c.fillStyle = '#ffffff'; c.fillRect(-50, -34, 100, 5); c.fillRect(-50, -22, 100, 5);
      c.fillStyle = '#e07b00'; c.fillRect(-50, -48, 100, 6);
    } else if (r === 'jaqueta') {
      c.fillStyle = '#ffc928'; c.fillRect(-50, -126, 36, 120); c.fillRect(14, -126, 36, 120);
      for (var k = 0; k < 18; k++) { var sx = (k * 37) % 30, sy = (k * 53) % 110; liso(c, '#fff6c2', (k % 2 ? 18 : -46) + sx, -122 + sy, 2.4, 2.4); }
      c.fillStyle = '#ff4fa3'; c.beginPath(); c.moveTo(-14, -126); c.lineTo(-30, -96); c.lineTo(-12, -100); c.closePath(); c.moveTo(14, -126); c.lineTo(30, -96); c.lineTo(12, -100); c.closePath(); c.fill();
    } else if (r === 'vestido') {
      c.fillStyle = '#b06cff'; c.fillRect(-50, -104, 100, 100);
      for (var q = 0; q < 16; q++) liso(c, '#f3e6ff', -40 + (q * 29) % 80, -98 + (q * 41) % 80, 2.2, 2.2);
    }
    // a sombra do corpo por cima da roupa (para a roupa não ficar "chapada")
    var g = GC['somb' + gcDe] || (GC['somb' + gcDe] = (function () { var x = c.createRadialGradient(-14, -92, 4, 0, -70, 60); x.addColorStop(0, 'rgba(255,255,255,.28)'); x.addColorStop(0.45, 'rgba(255,255,255,0)'); x.addColorStop(1, 'rgba(40,10,60,.38)'); return x; })());
    c.fillStyle = g; c.fillRect(-50, -126, 100, 120);
    c.restore();
    if (r === 'vestido') {   // saia de tule
      for (var j = 0; j < 3; j++) vol(c, ['#d9a6ff', '#c58cff', '#e9c8ff'][j], 0, -34 + j * 3, 58 - j * 6, 13, 0, j > 0);
    }
  }

  function boia(c, metade, cor) {
    c.save(); c.beginPath(); c.rect(-90, metade ? -46 : -100, 180, 54); c.clip();
    c.beginPath(); c.ellipse(0, -46, 64, 24, 0, 0, TAU); c.ellipse(0, -46, 40, 12, 0, 0, TAU);
    c.fillStyle = grad(c, cor, 0, -52, 64, 24); c.fill('evenodd'); c.lineWidth = 3; c.strokeStyle = escuro(cor, 0.6); c.stroke();
    c.restore();
    if (metade) {   // a cabecinha de patinho da boia
      vol(c, cor, -46, -60, 15, 14); liso(c, '#ff9f1c', -60, -58, 8, 4.5); liso(c, '#2a1b3d', -48, -64, 2.6, 3); brilho(c, -50, -68, 5, 3, 0.6);
      brilho(c, 18, -38, 16, 4, 0.55);
    }
  }

  function enfeite(c, p) {
    if (p.colar === 'gravata') {
      c.fillStyle = '#ff3b6b'; c.beginPath(); c.moveTo(0, -118); c.lineTo(-20, -128); c.lineTo(-20, -106); c.closePath(); c.moveTo(0, -118); c.lineTo(20, -128); c.lineTo(20, -106); c.closePath(); c.fill();
      c.lineWidth = 2.5; c.strokeStyle = '#a3123a'; c.stroke(); vol(c, '#ff3b6b', 0, -117, 6, 6);
    } else if (p.colar === 'corrente') {
      for (var i = 0; i <= 8; i++) { var a = Math.PI * (0.18 + 0.64 * i / 8); liso(c, i % 2 ? '#ffe17a' : '#f4b400', Math.cos(a) * 30, -122 + Math.sin(a) * 22, 3.6, 3.6); }
      // pingente: um bolinho de chuva dourado
      vol(c, '#ffc928', 0, -92, 10, 10); liso(c, escuro('#ffc928', 0.3), 0, -92, 3.5, 3.5);
    } else if (p.colar === 'flores') {
      var cs = ['#ff6fae', '#ffd84a', '#ffffff', '#ff9f1c', '#b78cff'];
      for (var j = 0; j <= 10; j++) { var b = Math.PI * (0.08 + 0.84 * j / 10); vol(c, cs[j % 5], Math.cos(b) * 38, -122 + Math.sin(b) * 26, 7, 7, 0, true); }
    }
  }

  function cabeca(c, p, o) {
    var tp = p.tipo, cor = p.cor, F = CAB[tp], rx = F[0], ry = F[1], A = p.acc || {}, olhosY = -4, fechado = o.piscar;
    // orelhas (atrás)
    if (tp === 'capivara') { vol(c, cor, -38, -38, 12, 11); vol(c, cor, 38, -38, 12, 11); liso(c, escuro(cor, 0.35), -38, -37, 5, 5); liso(c, escuro(cor, 0.35), 38, -37, 5, 5); }
    else if (tp === 'coelha') {
      for (var s = -1; s <= 1; s += 2) {
        c.save(); c.translate(s * 20, -34); c.rotate(s * 0.2 + (s < 0 ? o.orelha : -o.orelha * 0.6) + (s > 0 ? 0.25 : 0));
        vol(c, cor, 0, -46, 15, 50); liso(c, '#ffb3d1', 0, -42, 7, 36); brilho(c, -5, -70, 3, 10, 0.5);
        c.restore();
      }
    } else if (tp === 'guaxinim' || tp === 'unicornio') {
      for (var s2 = -1; s2 <= 1; s2 += 2) {
        c.beginPath(); c.moveTo(s2 * 18, -36); c.quadraticCurveTo(s2 * 46, -80, s2 * 50, -60); c.quadraticCurveTo(s2 * 54, -36, s2 * 44, -22); c.closePath();
        c.fillStyle = grad(c, cor, s2 * 38, -50, 20, 26); c.fill(); c.lineWidth = 3; c.strokeStyle = escuro(cor, 0.6); c.stroke();
        c.beginPath(); c.moveTo(s2 * 28, -40); c.quadraticCurveTo(s2 * 44, -66, s2 * 46, -54); c.quadraticCurveTo(s2 * 46, -40, s2 * 40, -32); c.closePath();
        c.fillStyle = tp === 'guaxinim' ? '#3d3550' : '#ffc2dd'; c.fill();
      }
    } else if (tp === 'urso') { vol(c, cor, -40, -38, 18, 17); vol(c, cor, 40, -38, 18, 17); liso(c, p.focinho, -40, -37, 9, 8); liso(c, p.focinho, 40, -37, 9, 8); }
    else if (tp === 'porquinha') {
      for (var s3 = -1; s3 <= 1; s3 += 2) {
        c.save(); c.translate(s3 * 34, -36); c.rotate(s3 * (0.5 + o.orelha * 0.8));
        c.beginPath(); c.moveTo(-12, 0); c.quadraticCurveTo(0, -36, 14, -28); c.quadraticCurveTo(14, -6, 12, 4); c.closePath();
        c.fillStyle = grad(c, cor, 0, -14, 16, 20); c.fill(); c.lineWidth = 3; c.strokeStyle = escuro(cor, 0.6); c.stroke();
        c.restore();
      }
    }
    if (tp === 'unicornio') {   // chifre dourado
      c.beginPath(); c.moveTo(-9, -42); c.lineTo(0, -96); c.lineTo(9, -42); c.closePath();
      c.fillStyle = grad(c, '#ffd23f', 0, -66, 10, 28); c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#c98a00'; c.stroke();
      c.lineWidth = 2; c.beginPath(); c.moveTo(-6, -56); c.lineTo(5, -62); c.moveTo(-4, -70); c.lineTo(4, -75); c.moveTo(-2, -83); c.lineTo(3, -86); c.stroke();
    }
    // a cabeça
    vol(c, cor, 0, 0, rx, ry);
    if (p.pelucia) { c.setLineDash([4, 5]); c.beginPath(); c.moveTo(0, -ry + 3); c.lineTo(0, -ry * 0.45); c.lineWidth = 2; c.strokeStyle = escuro(cor, 0.45); c.stroke(); c.setLineDash([]); }
    brilho(c, -rx * 0.45, -ry * 0.6, rx * 0.28, ry * 0.16, 0.5);
    if (tp === 'unicornio') {   // franja de arco-íris
      var cs = ['#ff7ab8', '#ffb347', '#ffe066', '#7be3ff', '#b78cff'];
      for (var m = 0; m < 5; m++) vol(c, cs[m], -30 + m * 13, -42 + Math.abs(m - 2) * 3, 14, 13, 0, true);
    }
    // rosto
    if (tp === 'capivara') {   // o focinho grande e quadradinho de capivara
      rr(c, -36, -4, 72, 50, 24); c.fillStyle = grad(c, p.focinho, 0, 14, 36, 25); c.fill(); c.lineWidth = 3; c.strokeStyle = escuro(cor, 0.5); c.stroke();
      brilho(c, -16, 4, 10, 4, 0.45);
      liso(c, escuro(cor, 0.6), -12, 10, 5.5, 3.6, 0.35); liso(c, escuro(cor, 0.6), 12, 10, 5.5, 3.6, -0.35);
      boca(c, 30, 8, o.boca); olhosY = -18;
      bochechas(c, 47, 4, 8);
      c.lineCap = 'round'; c.lineWidth = 3; c.strokeStyle = escuro(cor, 0.35);
      c.beginPath(); c.moveTo(-6, -44); c.lineTo(-10, -54); c.moveTo(0, -45); c.lineTo(1, -57); c.moveTo(6, -44); c.lineTo(11, -53); c.stroke();
    } else if (tp === 'guaxinim') {
      c.beginPath(); c.moveTo(-50, -8); c.bezierCurveTo(-40, -28, -10, -22, 0, -12); c.bezierCurveTo(10, -22, 40, -28, 50, -8);
      c.bezierCurveTo(44, 14, 14, 10, 0, 2); c.bezierCurveTo(-14, 10, -44, 14, -50, -8); c.closePath(); c.fillStyle = '#3d3550'; c.fill();
      liso(c, '#f4f1ff', -22, -26, 13, 4.5, 0.15); liso(c, '#f4f1ff', 22, -26, 13, 4.5, -0.15);
      vol(c, '#ece8f4', 0, 18, 22, 15, 0, true); liso(c, '#2a2238', 0, 11, 8, 5.5); brilho(c, -3, 9, 3, 1.6, 0.7);
      boca(c, 22, 7, o.boca);
    } else if (tp === 'urso' || tp === 'tartaruga' || tp === 'unicornio' || tp === 'coelha') {
      if (tp === 'urso') { vol(c, p.focinho, 0, 17, 24, 17, 0, true); liso(c, '#3a2230', 0, 9, 9, 6.5); brilho(c, -3, 7, 3.5, 2, 0.7); boca(c, 20, 7, o.boca); }
      else if (tp === 'coelha') { coracao(c, 0, 10, 5); c.fillStyle = '#ff7aa8'; c.fill(); boca(c, 17, 6, o.boca); if (!o.boca) { c.fillStyle = '#ffffff'; c.fillRect(-4, 18, 8, 6); } }
      else boca(c, 14, 8, o.boca);
      bochechas(c, rx * 0.6, 12, 8);
    } else if (tp === 'porquinha') {
      vol(c, '#ff8fbd', 0, 13, 18, 13); liso(c, '#c2457a', -6, 13, 3, 4.5); liso(c, '#c2457a', 6, 13, 3, 4.5);
      boca(c, 29, 7, o.boca); bochechas(c, 36, 12, 8);
    } else if (tp === 'sapo') {
      liso(c, escuro(cor, 0.2), -36, -14, 5, 4); liso(c, escuro(cor, 0.2), 30, -20, 4, 3); liso(c, escuro(cor, 0.2), 40, 4, 3.5, 3);
      if (o.boca) boca(c, 8, 18, true);
      else { c.beginPath(); c.moveTo(-30, 6); c.quadraticCurveTo(0, 30, 30, 6); c.lineWidth = 3.4; c.lineCap = 'round'; c.strokeStyle = '#1f4a1a'; c.stroke(); }
      bochechas(c, 44, 10, 9);
      for (var s4 = -1; s4 <= 1; s4 += 2) {   // olhos em cima
        vol(c, cor, s4 * 28, -36, 21, 20);
        liso(c, '#ffffff', s4 * 28, -38, 14, 14);
        if (!A.oculos) olho(c, s4 * 28, -37, 9, fechado);
      }
    }
    if (tp !== 'sapo') {
      if (A.oculos) oculos(c, olhosY - 2, tp === 'capivara' ? 26 : 22, tp === 'capivara' ? 15 : 13, A.oculos, A.forma);
      else olho(c, -20, olhosY, tp === 'capivara' ? 7 : 9.5, fechado), olho(c, 20, olhosY, tp === 'capivara' ? 7 : 9.5, fechado);
    } else if (A.oculos) oculos(c, -38, 28, 14, A.oculos, A.forma);
    if (A.fone) fone(c, rx, ry, A.fone);
    if (A.bone) bone(c, ry, A.bone);
    if (A.laco) laco(c, rx * 0.55, -ry * 0.78, 11, A.laco);
    if (A.flor) flor(c, rx * 0.72, -ry * 0.62, 11, A.flor);
  }

  function todos(c, lista, R) {   // de trás para a frente (em pé, a fila da frente por último)
    var l = lista.slice().sort(function (a, b) { return lugar(a)[1] - lugar(b)[1]; });
    for (var i = 0; i < l.length; i++) bicho(c, l[i], R);
  }
  // em pé (celular), quem tem "ret" vai para a fila da frente, maior: [x, y, escala]
  var RET = false;
  function lugar(p) { return RET && p.ret ? p.ret : [p.x, p.y, p.s || 1]; }
  // desenha um bichinho; devolve a pose e onde ficam os ombros (no mundo), para o DJ e o ukulele
  function bicho(c, p, R, semBracos) {
    var o = pose(p, R), L = lugar(p), s = L[2], cor = p.cor, mao = p.mao || cor;
    c.save(); c.translate(L[0], L[1]);
    if (!p.semSombra) sombra(c, 0, 0, 54 * s * (1 - o.hop / 150), 0.3 * (1 - o.hop / 170));
    c.translate(o.dx * s, -o.hop * s);
    c.scale(s * (1 + o.sq) * o.sx, s * (1 - o.sq));
    c.rotate(o.inc);
    rabo(c, p, o);
    if (p.boia) boia(c, false, p.boia);
    if (p.tipo === 'pinguim') {
      vol(c, '#ff9f1c', -20, -8, 20, 9); vol(c, '#ff9f1c', 20, -8, 20, 9);
      vol(c, cor, 0, -90, 56, 82);
      vol(c, '#f6f7ff', 0, -66, 38, 52, 0, true);
      if (p.colar) enfeite(c, p);
      if (!semBracos) {
        for (var w = -1; w <= 1; w += 2) {
          var a = w < 0 ? o.aE : o.aD;
          vol(c, cor, w * 44 + w * Math.sin(a) * 22, -102 + Math.cos(a) * 22, 13, 30, -w * a);
        }
      }
      c.save(); c.translate(0, -136 + o.cabY); c.rotate(o.cab);
      // máscara branca do rosto
      liso(c, '#f6f7ff', -16, 2, 20, 22); liso(c, '#f6f7ff', 16, 2, 20, 22);
      brilho(c, -26, -26, 14, 7, 0.45);
      olho(c, -16, 0, 8.5, o.piscar); olho(c, 16, 0, 8.5, o.piscar);
      bochechas(c, 28, 14, 7);
      c.beginPath(); c.moveTo(-9, 12); c.quadraticCurveTo(0, o.boca ? 30 : 24, 9, 12); c.closePath(); c.fillStyle = grad(c, '#ff9f1c', 0, 16, 9, 8); c.fill(); c.lineWidth = 2; c.strokeStyle = '#b55d00'; c.stroke();
      if (p.acc && p.acc.fone) fone(c, 46, 42, p.acc.fone);
      if (p.acc && p.acc.oculos) oculos(c, -2, 18, 12, p.acc.oculos, p.acc.forma);
      c.restore();
      c.restore();
      return o;
    }
    // pernas e pés
    vol(c, cor, -20, -22, 15, 20); vol(c, cor, 20, -22, 15, 20);
    vol(c, p.pe || cor, -21, -7, 20, 11); vol(c, p.pe || cor, 21, -7, 20, 11);
    // corpo e barriga
    vol(c, cor, 0, -70, 44, 52);
    if (p.barriga) vol(c, p.barriga, 0, -60, 29, 35, 0, true);
    if (p.pelucia) {
      coracao(c, 0, -62, 11); c.fillStyle = p.remendo || '#ff7ab8'; c.fill(); c.setLineDash([3, 3]); c.lineWidth = 1.8; c.strokeStyle = '#ffffff'; c.stroke(); c.setLineDash([]);
    }
    roupa(c, p, o);
    brilho(c, -20, -98, 12, 7, 0.4);
    if (p.boia) boia(c, true, p.boia);
    enfeite(c, p);
    var ombros = null;
    if (!semBracos) {
      braco(c, -36, -96, o.aE, -1, 44, 17, cor, mao);
      braco(c, 36, -96, o.aD, 1, 44, 17, cor, mao);
    }
    var F = CAB[p.tipo];
    c.save(); c.translate(0, -114 - F[1] * 0.92 + o.cabY); c.rotate(o.cab);
    cabeca(c, p, o);
    c.restore();
    c.restore();
    // ombros no mundo (sem a inclinação, que é pequena)
    ombros = [L[0] + (o.dx - 36 * o.sx) * s, L[1] + (-o.hop - 96) * s, L[0] + (o.dx + 36 * o.sx) * s];
    o.ombros = ombros;
    return o;
  }

  // ---------- caranguejo ----------
  function caranguejo(c, x, y, s, R, atraso) {
    var amp = R.amp, f = R.fase + atraso, n = Math.floor(f), b = f - n, pul = Math.pow(1 - b, 2.4), sobe = Math.sin(b * Math.PI);
    var dx = Math.sin(f * Math.PI / 2) * 26 * amp, hop = sobe * 6 * amp, cor = '#ff5a4f';
    c.save(); c.translate(x, y); sombra(c, dx * s, 0, 50 * s, 0.28);
    c.translate(dx * s, -hop * s); c.scale(s, s * (1 - pul * 0.06 * amp));
    // perninhas
    c.lineCap = 'round';
    for (var l = 0; l < 3; l++) for (var sd = -1; sd <= 1; sd += 2) {
      var pa = Math.sin(f * TAU + l * 1.3 + (sd > 0 ? Math.PI : 0)) * 0.25 * amp;
      c.beginPath(); c.moveTo(sd * (24 + l * 6), -26); c.lineTo(sd * (44 + l * 8), -30 + pa * 20); c.lineTo(sd * (52 + l * 8), -4 + pa * 8);
      c.lineWidth = 7; c.strokeStyle = escuro(cor, 0.45); c.stroke(); c.lineWidth = 4; c.strokeStyle = cor; c.stroke();
    }
    // garras (uma de cada vez para o alto; abrem e fecham no tempo)
    for (var g = -1; g <= 1; g += 2) {
      var vez = (n % 2 === 0) === (g < 0), alto = vez ? 0.6 + 0.4 * sobe : 0.15 * sobe;
      var gx = g * (64 + 6 * alto), gy = -58 - 44 * alto * amp - 6, abre = (vez ? 0.15 + 0.45 * pul : 0.12) * (R.calmo ? 0.3 : 1);
      bracoAte(c, g * 36, -36, gx, gy + 14, 10, cor);
      c.save(); c.translate(gx, gy); c.rotate(g * 0.25);
      vol(c, cor, 0, 0, 17, 21);
      c.save(); c.rotate(-g * abre); vol(c, cor, g * -2, -20, 8, 15); c.restore();
      brilho(c, -6, -6, 5, 8, 0.5);
      c.restore();
    }
    vol(c, cor, 0, -36, 48, 30); liso(c, claro(cor, 0.3), 0, -24, 30, 10); brilho(c, -18, -52, 14, 6, 0.5);
    // olhos em antenas
    for (var e = -1; e <= 1; e += 2) {
      c.beginPath(); c.moveTo(e * 12, -58); c.lineTo(e * 16, -82); c.lineWidth = 6; c.strokeStyle = escuro(cor, 0.4); c.stroke();
      liso(c, '#ffffff', e * 16, -88, 11, 11); c.lineWidth = 2.4; c.strokeStyle = escuro(cor, 0.5); c.stroke();
      var olhar = Math.sin(f * Math.PI / 4) * 3;
      if (((R.t + atraso) % 3.3) < 0.12) { c.beginPath(); c.moveTo(e * 16 - 7, -88); c.lineTo(e * 16 + 7, -88); c.lineWidth = 3; c.strokeStyle = '#2a1b3d'; c.stroke(); }
      else { liso(c, '#2a1b3d', e * 16 + olhar, -87, 5.5, 6.5); liso(c, '#ffffff', e * 16 + olhar - 2, -90, 2, 2); }
    }
    boca(c, -30, 9, b < 0.5 && n % 4 === 2 && amp > 0.3); bochechas(c, 28, -34, 7);
    c.restore();
  }

  // ---------- tartaruga do ukulele (sentada no tronco) ----------
  function tartaruga(c, x, y, s, R) {
    var p = { tipo: 'tartaruga', cor: '#8fd16a', x: x, y: y, danca: 'balanca', atraso: 0, acc: { flor: '#ff6fae' } };
    var o = pose(p, R), cor = p.cor;
    c.save(); c.translate(x, y); c.translate(o.dx * 0.4 * s, 0); c.scale(s, s * (1 - o.sq * 0.6)); c.rotate(o.inc * 0.6);
    // casco atrás
    vol(c, '#5f8f2e', 0, -66, 62, 64);
    c.save(); elipse(c, 0, -66, 62, 64); c.clip();
    c.lineWidth = 4; c.strokeStyle = '#3f6a1c';
    for (var i = 0; i < 6; i++) { var a = i * TAU / 6; c.beginPath(); c.moveTo(Math.cos(a) * 30, -66 + Math.sin(a) * 30); c.lineTo(Math.cos(a) * 64, -66 + Math.sin(a) * 64); c.stroke(); }
    c.restore();
    // pés para a frente, balançando
    vol(c, cor, -30, -6 + Math.sin(o.f * Math.PI) * 3 * R.amp, 18, 12); vol(c, cor, 30, -6 - Math.sin(o.f * Math.PI) * 3 * R.amp, 18, 12);
    // barriga (o casco de baixo)
    vol(c, '#f2d98a', 0, -62, 40, 48);
    c.lineWidth = 2.5; c.strokeStyle = '#c9a85a';
    c.beginPath(); c.moveTo(-36, -80); c.lineTo(36, -80); c.moveTo(-39, -56); c.lineTo(39, -56); c.moveTo(-32, -32); c.lineTo(32, -32); c.moveTo(0, -108); c.lineTo(0, -16); c.stroke();
    // colar de flores
    p.colar = 'flores'; enfeite(c, p);
    // ukulele atravessado
    c.save(); c.translate(4, -58); c.rotate(-0.5);
    rr(c, 10, -6, 74, 12, 4); c.fillStyle = '#8a5a2b'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#4e2f12'; c.stroke();
    rr(c, 80, -9, 16, 18, 4); c.fillStyle = '#6b4220'; c.fill();
    vol(c, '#e0a458', -18, 0, 30, 22); vol(c, '#e0a458', 12, 0, 20, 16, 0, true);
    liso(c, '#3b220c', -6, 0, 7, 7);
    c.lineWidth = 1; c.strokeStyle = 'rgba(255,255,255,.8)'; c.beginPath(); for (var k = -3; k <= 3; k += 2) { c.moveTo(-38, k); c.lineTo(92, k); } c.stroke();
    c.restore();
    // mão esquerda no braço do ukulele, a direita tocando (duas batidinhas por tempo)
    var toque = Math.sin(o.f * TAU) * 9 * (R.calmo ? 0.3 : 1) * (R.tocando ? 1 : 0.2);
    bracoAte(c, 36, -96, 62, -100, 16, cor);
    bracoAte(c, -36, -96, -20, -52 + toque, 16, cor);
    // cabeça
    c.save(); c.translate(0, -146 + o.cabY); c.rotate(o.cab);
    cabeca(c, p, o);
    c.restore();
    c.restore();
  }

  // ---------- a garra (H-rraaa) ----------
  function garra(c, x, y, s, abre, olhar, R, comFone) {
    c.save(); c.translate(x, y); c.scale(s, s);
    // as três pontas
    c.lineCap = 'round';
    for (var g = -1; g <= 1; g++) {
      var base = g * 24, ang = g * (0.35 + abre * 0.5);
      c.save(); c.translate(base * 0.6, 20); c.rotate(ang);
      var cor = g === 0 ? '#9aa6c4' : '#c7d0e6';
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 44); c.lineWidth = 12; c.strokeStyle = '#5b6584'; c.stroke(); c.lineWidth = 7; c.strokeStyle = cor; c.stroke();
      c.translate(0, 44); c.rotate(-g * (0.7 + abre * 0.2) - (g === 0 ? 0 : 0));
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(g * -4, 20, g * -14, 30); c.lineWidth = 11; c.strokeStyle = '#5b6584'; c.stroke(); c.lineWidth = 6; c.strokeStyle = cor; c.stroke();
      vol(c, '#ff4fa3', 0, 0, 7, 7);
      c.restore();
    }
    // o "chapéu" da garra com rostinho
    vol(c, '#d5dcef', 0, 0, 46, 32);
    c.fillStyle = '#ff4fa3'; c.fillRect(-45, 10, 90, 8);
    vol(c, '#8ea0c8', 0, -34, 10, 8);
    brilho(c, -20, -16, 14, 6, 0.6);
    olho(c, -15 + olhar, -2, 7, ((R.t * 1.1) % 3.5) < 0.12); olho(c, 15 + olhar, -2, 7, ((R.t * 1.1) % 3.5) < 0.12);
    bochechas(c, 28, 6, 6);
    boca(c, 3, 6, R.n % 4 === 0 && R.b < 0.5 && R.amp > 0.3);
    if (comFone) fone(c, 42, 30, '#3ee8ff');
    c.restore();
  }

  // ---------- mesa de DJ ----------
  function mesa(c, x, y, larg, R, prof) {
    var h = prof == null ? 92 : prof, e = R.e;
    // tampo
    rr(c, x - larg / 2, y - 16, larg, 26, 10); c.fillStyle = grad(c, '#4b3a8a', x, y - 10, larg / 2, 20); c.fill(); c.lineWidth = 3; c.strokeStyle = '#21184a'; c.stroke();
    // frente (com as barrinhas de som)
    if (h > 0) {
    rr(c, x - larg / 2 + 8, y + 6, larg - 16, h, 12);
    var g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2b1f63'); g.addColorStop(1, '#150f38'); c.fillStyle = g; c.fill();
    c.lineWidth = 3; c.strokeStyle = '#3ee8ff'; c.stroke();
    // barrinhas de som (sobem com a música)
    var nB = 9, bw = (larg - 60) / nB;
    for (var i = 0; i < nB; i++) {
      var alt = R.calmo ? 0.45 : Math.max(0.12, Math.min(1, e * (0.55 + 0.45 * Math.sin(R.t * 7 + i * 1.7)) + 0.3 * R.pul));
      var hh = (h - 22) * alt, cx = x - larg / 2 + 30 + i * bw;
      c.fillStyle = i % 3 === 0 ? '#ff4fa3' : i % 3 === 1 ? '#c6ff3d' : '#3ee8ff';
      rr(c, cx + 3, y + h - 8 - hh, bw - 6, hh, 3); c.fill();
    }
    }
    // toca-discos no tampo
    for (var s = -1; s <= 1; s += 2) {
      var tx = x + s * larg * 0.3;
      liso(c, '#1a1236', tx, y - 10, larg * 0.17, 11);
      liso(c, '#0b0818', tx, y - 11, larg * 0.14, 8.5);
      liso(c, s < 0 ? '#ff4fa3' : '#c6ff3d', tx, y - 11, larg * 0.04, 3);
      var a = R.t * (R.calmo ? 1.5 : 6) * (R.tocando ? 1 : 0.15);
      c.beginPath(); c.ellipse(tx, y - 11, larg * 0.11, 6.5, 0, a, a + 0.9); c.lineWidth = 1.6; c.strokeStyle = 'rgba(255,255,255,.55)'; c.stroke();
    }
    // mesa de mixagem no meio
    rr(c, x - larg * 0.09, y - 20, larg * 0.18, 12, 4); c.fillStyle = '#382a74'; c.fill();
    liso(c, '#ffd84a', x - larg * 0.05, y - 14, 3, 2); liso(c, '#3ee8ff', x, y - 14, 3, 2); liso(c, '#ff4fa3', x + larg * 0.05, y - 14, 3, 2);
  }

  // ---------- caixas de som ----------
  function caixaSom(c, x, y, w, h) {
    rr(c, x - w / 2, y - h, w, h, 10); var g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#2c2357'); g.addColorStop(1, '#14102e');
    c.fillStyle = g; c.fill(); c.lineWidth = 3; c.strokeStyle = '#0a0820'; c.stroke();
  }
  function cones(c, x, y, w, h, R) {
    var k = 1 + (R.calmo ? 0 : R.pul * 0.08 * R.amp);
    vol(c, '#3a3170', x, y - h * 0.68, w * 0.36 * k, w * 0.36 * k); liso(c, '#100c26', x, y - h * 0.68, w * 0.2 * k, w * 0.2 * k);
    vol(c, '#3a3170', x, y - h * 0.26, w * 0.24 * k, w * 0.24 * k); liso(c, '#100c26', x, y - h * 0.26, w * 0.12 * k, w * 0.12 * k);
  }

  // ---------- cenário: peças ----------
  function nuvem(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s);
    liso(c, 'rgba(120,170,220,.35)', 0, 18, 70, 12);
    var b = [[-40, 4, 26], [-12, -10, 34], [22, -4, 30], [48, 8, 22], [0, 10, 30]];
    for (var i = 0; i < b.length; i++) { var g = c.createRadialGradient(b[i][0] - 8, b[i][1] - 10, 2, b[i][0], b[i][1], b[i][2]); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#dcefff'); liso(c, g, b[i][0], b[i][1], b[i][2], b[i][2]); }
    c.restore();
  }
  function palmeira(c, x, y, s, curva, tronco, folha, sil) {
    c.save(); c.translate(x, y); c.scale(s, s);
    var px = 0, py = 0, pts = [], i;
    for (i = 0; i <= 12; i++) { var t = i / 12; pts.push([curva * 70 * t * t, -270 * t, 17 - t * 7]); }
    px = pts[12][0]; py = pts[12][1];
    c.beginPath();
    for (i = 0; i <= 12; i++) c.lineTo(pts[i][0] - pts[i][2], pts[i][1]);
    for (i = 12; i >= 0; i--) c.lineTo(pts[i][0] + pts[i][2], pts[i][1]);
    c.closePath(); c.fillStyle = sil || tronco; c.fill();
    if (!sil) {
      c.lineWidth = 2.5; c.strokeStyle = escuro(tronco, 0.45); c.stroke();
      c.lineCap = 'round'; c.lineWidth = 5; c.strokeStyle = mix(tronco, '#ffffff', 0.35, 0.45);
      c.beginPath(); for (i = 1; i <= 11; i++) c.lineTo(pts[i][0] - pts[i][2] * 0.45, pts[i][1]); c.stroke();
      c.lineWidth = 2.2; c.strokeStyle = escuro(tronco, 0.4);
      for (i = 1; i < 12; i++) { c.beginPath(); c.moveTo(pts[i][0] - pts[i][2], pts[i][1]); c.quadraticCurveTo(pts[i][0], pts[i][1] + 6, pts[i][0] + pts[i][2], pts[i][1] - 2); c.stroke(); }
    }
    for (var j = 0; j < 7; j++) {
      var a = -Math.PI + 0.25 + j * (Math.PI - 0.5) / 6;
      c.save(); c.translate(px, py); c.rotate(a);
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(60, -38, 128, 22); c.quadraticCurveTo(66, -6, 0, 6); c.closePath();
      if (sil) c.fillStyle = sil; else { var g = c.createLinearGradient(0, -30, 0, 20); g.addColorStop(0, claro(folha, 0.25)); g.addColorStop(1, escuro(folha, 0.2)); c.fillStyle = g; }
      c.fill();
      if (!sil) { c.beginPath(); c.moveTo(4, 2); c.quadraticCurveTo(62, -24, 124, 20); c.lineWidth = 2; c.strokeStyle = escuro(folha, 0.35); c.stroke(); }
      c.restore();
    }
    if (!sil) { vol(c, '#8a5a2b', px - 10, py + 10, 11, 11); vol(c, '#7a4b20', px + 10, py + 12, 11, 11); vol(c, '#8a5a2b', px, py + 20, 10, 10); }
    c.restore();
  }
  function guardaSol(c, x, y, s, c1, c2) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.lineWidth = 6; c.strokeStyle = '#e8e2d6'; c.beginPath(); c.moveTo(0, 0); c.lineTo(4, -170); c.stroke();
    var n = 8, W = 120, topo = -200, borda = -150;
    for (var i = 0; i < n; i++) {
      var x0 = -W + i * 2 * W / n, x1 = x0 + 2 * W / n;
      c.beginPath(); c.moveTo(4, topo); c.lineTo(x0, borda); c.quadraticCurveTo((x0 + x1) / 2, borda + 16, x1, borda); c.closePath();
      c.fillStyle = i % 2 ? c1 : c2; c.fill();
    }
    var g = c.createLinearGradient(-W, 0, W, 0); g.addColorStop(0, 'rgba(255,255,255,.25)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(40,10,60,.25)');
    c.beginPath(); c.moveTo(4, topo); c.lineTo(-W, borda); c.lineTo(W, borda); c.closePath(); c.fillStyle = g; c.fill();
    liso(c, '#e8e2d6', 4, topo - 4, 6, 6);
    c.restore();
  }
  function espreguicadeira(c, x, y, s, cor) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.lineWidth = 5; c.strokeStyle = '#ffffff'; c.beginPath(); c.moveTo(-60, 0); c.lineTo(-50, -18); c.lineTo(40, -18); c.lineTo(70, -60); c.moveTo(40, -18); c.lineTo(46, 0); c.stroke();
    c.lineWidth = 9; c.strokeStyle = cor; c.beginPath(); c.moveTo(-48, -22); c.lineTo(38, -22); c.lineTo(64, -58); c.stroke();
    c.restore();
  }
  function bolinhoBoia(c, x, y, s) {   // boia de bolinho (rosquinha) com confeitos
    c.save(); c.translate(x, y); c.scale(s, s);
    liso(c, 'rgba(255,255,255,.35)', 0, 10, 62, 10);
    c.beginPath(); c.ellipse(0, 0, 54, 22, 0, 0, TAU); c.ellipse(0, -2, 18, 7, 0, 0, TAU); c.fillStyle = grad(c, '#e8a35b', 0, 0, 54, 22); c.fill('evenodd'); c.lineWidth = 3; c.strokeStyle = '#9a5a22'; c.stroke();
    c.beginPath(); c.ellipse(0, -4, 48, 17, 0, Math.PI * 0.95, Math.PI * 2.05); c.quadraticCurveTo(30, 10, 0, 8); c.quadraticCurveTo(-30, 10, -48, -2); c.closePath();
    c.fillStyle = '#ff7ab8'; c.fill();
    liso(c, '#0f4f80', 0, -2, 18, 7);
    var cs = ['#ffffff', '#ffd84a', '#3ee8ff', '#c6ff3d'];
    for (var i = 0; i < 12; i++) { var a = i * TAU / 12 + 0.3, r = 32 + (i % 2) * 6; c.save(); c.translate(Math.cos(a) * r, -4 + Math.sin(a) * r * 0.36); c.rotate(i); c.fillStyle = cs[i % 4]; c.fillRect(-3.5, -1.2, 7, 2.4); c.restore(); }
    brilho(c, -26, -12, 12, 4, 0.6);
    c.restore();
  }
  function bolaPelucia(c, x, y, r, cor) { vol(c, cor, x, y, r, r * 0.92); liso(c, 'rgba(0,0,0,.18)', x - r * 0.3, y - r * 0.05, r * 0.1, r * 0.12); liso(c, 'rgba(0,0,0,.18)', x + r * 0.3, y - r * 0.05, r * 0.1, r * 0.12); }

  function letreiroH(c, x, y, tam) {   // "H-rraaa", o nome do jogo (igual nos três idiomas), com o H de arco-íris
    c.save(); c.font = '800 ' + tam + 'px "Fredoka", system-ui, sans-serif'; c.textBaseline = 'middle'; c.textAlign = 'left';
    var parte = ['H', '-', 'rraaa'], larg = 0, i;
    for (i = 0; i < 3; i++) larg += c.measureText(parte[i]).width;
    var px = x - larg / 2;
    for (i = 0; i < 3; i++) {
      var w = c.measureText(parte[i]).width;
      if (i === 0) { var g = c.createLinearGradient(px, y - tam / 2, px + w, y + tam / 2); g.addColorStop(0, '#ff4f6d'); g.addColorStop(0.3, '#ffd23f'); g.addColorStop(0.6, '#3ee8ff'); g.addColorStop(1, '#b78cff'); c.fillStyle = g; c.shadowColor = '#ff4fa3'; }
      else if (i === 1) { c.fillStyle = '#ffd400'; c.shadowColor = '#ffd400'; }
      else { c.fillStyle = '#39ff6a'; c.shadowColor = '#39ff6a'; }
      c.shadowBlur = tam * 0.4; c.fillText(parte[i], px, y); c.shadowBlur = 0; c.fillText(parte[i], px, y);
      px += w;
    }
    c.restore();
  }
  function neonTubo(c, pts, cor, larg) {
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(pts[0], pts[1]); for (var i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.shadowColor = cor; c.shadowBlur = larg * 3; c.lineWidth = larg; c.strokeStyle = cor; c.stroke();
    c.shadowBlur = 0; c.lineWidth = larg * 0.4; c.strokeStyle = 'rgba(255,255,255,.85)'; c.stroke();
    c.restore();
  }

  // ======================================================================
  // CENAS. Cada uma desenha numa área de 1000 × 600 (chão dos bichinhos perto de y = 545); V diz até onde a tela vai
  // além dela (V.L, V.R, V.T, V.B), para o fundo cobrir a tela toda, em pé ou deitada.
  // fundo(c, V): o que não mexe (pintado uma vez fora da tela); quadro(c, V, R): o que dança, a cada quadro.
  // ======================================================================
  var PISCINA = {
    nome: ['🏖️ Festa na piscina', '🏖️ Pool party', '🏖️ Fiesta en la piscina'],
    bichos: [
      { tipo: 'guaxinim', cor: '#a3a7bd', x: 248, y: 548, s: 0.95, ret: [312, 720, 1.25], danca: 'remexe', atraso: 0.12, vez: 4, esp: 'pulao', roupa: 'sunga', boia: '#ffd23f' },
      { tipo: 'coelha', cor: '#fbf4ff', barriga: '#ffffff', x: 756, y: 548, s: 0.95, ret: [688, 720, 1.25], danca: 'balanca', atraso: 0.06, vez: 12, esp: 'gira', roupa: 'maio', acc: { oculos: 'rosa', forma: 'coracao', flor: '#ffd84a' }, pe: '#ffe3f0' }
    ],
    dj: { tipo: 'capivara', cor: '#b98252', focinho: '#dcab79', barriga: '#d9a774', x: 500, y: 508, s: 1.04, danca: 'balanca', atraso: 0, acc: { oculos: 'preto', fone: '#3ee8ff' }, roupa: 'havaiana' },
    fundo: function (c, V) {
      var g = c.createLinearGradient(0, V.T, 0, 252); g.addColorStop(0, '#2f9cf0'); g.addColorStop(0.55, '#8fd6ff'); g.addColorStop(1, '#ffe4c2');
      c.fillStyle = g; c.fillRect(V.L, V.T, V.R - V.L, 252 - V.T);
      halo(c, 812, 92, 170, 'rgba(255,236,150,.85)');
      vol(c, '#ffd84a', 812, 92, 50, 50, 0, true);
      olho(c, 796, 86, 6, true); olho(c, 828, 86, 6, true); c.save(); c.translate(812, 92); boca(c, 12, 9, false); bochechas(c, 26, 8, 7); c.restore();
      nuvem(c, 200, 80, 1); nuvem(c, 560, 120, 0.7); nuvem(c, V.L + 60, 160, 0.8); nuvem(c, V.R - 40, 190, 0.6);
      // mar ao fundo
      g = c.createLinearGradient(0, 238, 0, 262); g.addColorStop(0, '#1e8fd6'); g.addColorStop(1, '#45b8ea'); c.fillStyle = g; c.fillRect(V.L, 238, V.R - V.L, 24);
      c.fillStyle = 'rgba(255,255,255,.6)'; for (var i = 0; i < 14; i++) c.fillRect(V.L + i * 97 % (V.R - V.L), 246 + (i % 3) * 5, 22, 2);
      // calçadão
      c.fillStyle = '#f6dfb4'; c.fillRect(V.L, 260, V.R - V.L, 44);
      palmeira(c, V.L + 70, 300, 0.95, 1, '#b07a43', '#3fbf5a'); palmeira(c, V.R - 60, 300, 1.05, -1, '#b07a43', '#2fae4f');
      palmeira(c, 640, 284, 0.6, 0.6, '#b07a43', '#46c463');
      espreguicadeira(c, 320, 298, 0.8, '#ff6fae'); guardaSol(c, 250, 298, 0.85, '#ff4f6d', '#ffffff');
      guardaSol(c, V.R - 210, 298, 0.8, '#3ee8ff', '#ffe066');
      // piscina
      c.fillStyle = '#f2fbff'; c.fillRect(V.L, 300, V.R - V.L, 14);
      c.fillStyle = 'rgba(120,180,210,.6)'; for (var x = Math.floor(V.L / 40) * 40; x < V.R; x += 40) c.fillRect(x, 300, 2, 14);
      g = c.createLinearGradient(0, 314, 0, 440); g.addColorStop(0, '#1fa4e6'); g.addColorStop(1, '#5fd6f7'); c.fillStyle = g; c.fillRect(V.L, 314, V.R - V.L, 126);
      c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 2.5;
      for (var r = 0; r < 5; r++) { c.beginPath(); for (var xx = V.L; xx < V.R; xx += 20) c.lineTo(xx, 330 + r * 22 + Math.sin(xx * 0.05 + r) * 4); c.stroke(); }
      // escadinha
      c.lineWidth = 5; c.strokeStyle = '#dfe9f2'; c.beginPath(); c.moveTo(880, 290); c.quadraticCurveTo(880, 270, 900, 272); c.lineTo(900, 330); c.moveTo(920, 290); c.quadraticCurveTo(920, 270, 940, 272); c.lineTo(940, 330); c.stroke();
      // borda da frente e o deck
      c.fillStyle = '#f2fbff'; c.fillRect(V.L, 438, V.R - V.L, 16);
      g = c.createLinearGradient(0, 454, 0, V.B); g.addColorStop(0, '#f7e3c0'); g.addColorStop(1, '#e8c99a'); c.fillStyle = g; c.fillRect(V.L, 454, V.R - V.L, V.B - 454);
      c.strokeStyle = 'rgba(170,120,70,.25)'; c.lineWidth = 2;
      for (var y = 474; y < V.B; y += 30) { c.beginPath(); c.moveTo(V.L, y); c.lineTo(V.R, y); c.stroke(); }
      for (var x2 = Math.floor(V.L / 90) * 90; x2 < V.R; x2 += 90) { c.beginPath(); c.moveTo(x2, 454); c.lineTo(x2 + (x2 - 500) * 0.4, V.B); c.stroke(); }
    },
    quadro: function (c, V, R) {
      // brilhos na água
      if (!R.calmo) for (var i = 0; i < 7; i++) { var a = (Math.sin(R.t * 1.7 + i * 2.1) + 1) / 2; c.fillStyle = 'rgba(255,255,255,' + (a * 0.7).toFixed(2) + ')'; estrela(c, 120 + i * 120 + (i % 2) * 30, 340 + (i % 3) * 30, 5 + a * 4, 4, 0.3); c.fill(); }
      bolinhoBoia(c, 300, 392 + Math.sin(R.t * 1.4) * 3, 0.85);
      bolinhoBoia(c, 700, 366 + Math.sin(R.t * 1.2 + 1) * 3, 0.6);
      if (!RET) { bicho(c, this.bichos[0], R); bicho(c, this.bichos[1], R); }
      djNaMesa(c, this.dj, R, 500, 452, 330);
      if (RET) { bicho(c, this.bichos[0], R); bicho(c, this.bichos[1], R); }
    }
  };

  function djNaMesa(c, p, R, mx, my, larg) {
    var o = bicho(c, p, R, true), s = p.s || 1;
    mesa(c, mx, my, larg, R, 76);
    // mão esquerda arranhando o disco; a direita mexe nos botões ou vai para o alto
    var arr = Math.sin(R.fase * TAU) * 14 * R.amp * (R.tocando ? 1 : 0.2);
    var cicl = ((o.n % 8) + 8) % 8, alto = !R.calmo && R.tocando && cicl >= 6;
    var oy = o.ombros[1] + 8 * s;
    bracoAte(c, o.ombros[0], oy, mx - larg * 0.3 + arr, my - 14, 17 * s, p.cor);
    if (alto) bracoAte(c, o.ombros[2], oy, o.ombros[2] + 30, oy - 70 - Math.sin(R.b * Math.PI) * 10, 17 * s, p.cor);
    else bracoAte(c, o.ombros[2], oy, mx + larg * 0.05 + Math.sin(R.fase * Math.PI) * 8 * R.amp, my - 18, 17 * s, p.cor);
  }

  var DISCO = {
    nome: ['🪩 Discoteca do Bolinho', '🪩 Rainy Day Disco', '🪩 Discoteca de Buñuelos'],
    bichos: [
      { tipo: 'urso', cor: '#c98a55', focinho: '#f0cfa0', barriga: '#f0cfa0', x: 232, y: 548, s: 0.86, ret: [312, 725, 1.15], danca: 'aponta', atraso: 0, vez: 2, esp: 'disco', roupa: 'jaqueta', acc: { oculos: 'espelho' } },
      { tipo: 'pinguim', cor: '#2c3454', x: 410, y: 548, s: 0.86, danca: 'balanca', atraso: 0.1, vez: 6, esp: 'gira', colar: 'gravata' },
      { tipo: 'porquinha', cor: '#ffb0d0', barriga: '#ffd2e5', x: 592, y: 548, s: 0.86, danca: 'pula', atraso: 0.05, vez: 10, esp: 'pulao', roupa: 'vestido', acc: { laco: '#b06cff' } },
      { tipo: 'sapo', cor: '#79cf62', barriga: '#d8f5b8', x: 768, y: 548, s: 0.86, ret: [688, 725, 1.15], danca: 'remexe', atraso: 0.15, vez: 14, esp: 'requebra', colar: 'corrente', acc: { oculos: 'lima', forma: 'estrela' } }
    ],
    fundo: function (c, V) {
      var g = c.createLinearGradient(0, V.T, 0, 420); g.addColorStop(0, '#120a35'); g.addColorStop(1, '#3a1670');
      c.fillStyle = g; c.fillRect(V.L, V.T, V.R - V.L, 420 - V.T);
      // cortinas
      for (var x = Math.floor(V.L / 60) * 60; x < V.R; x += 60) { var gc = c.createLinearGradient(x, 0, x + 60, 0); gc.addColorStop(0, 'rgba(0,0,0,.25)'); gc.addColorStop(0.5, 'rgba(255,255,255,.05)'); gc.addColorStop(1, 'rgba(0,0,0,.25)'); c.fillStyle = gc; c.fillRect(x, V.T, 60, 420 - V.T); }
      var rnd = sorteio(7);
      for (var i = 0; i < 60; i++) { c.fillStyle = 'rgba(255,255,255,' + (0.2 + rnd() * 0.5).toFixed(2) + ')'; estrela(c, V.L + rnd() * (V.R - V.L), V.T + rnd() * (400 - V.T), 1.5 + rnd() * 3, 4, 0.35); c.fill(); }
      // rosquinha de neon na parede
      c.save(); c.lineWidth = 9; c.shadowColor = '#ff4fa3'; c.shadowBlur = 26; c.strokeStyle = '#ff7ab8';
      c.beginPath(); c.arc(500, 300, 46, 0, TAU); c.stroke(); c.beginPath(); c.arc(500, 300, 16, 0, TAU); c.stroke();
      c.shadowBlur = 0; c.lineWidth = 3; c.strokeStyle = '#ffffff'; c.beginPath(); c.arc(500, 300, 46, 0, TAU); c.stroke(); c.restore();
      neonTubo(c, [300, 250, 300, 300, 330, 290], '#3ee8ff', 6); neonTubo(c, [330, 290, 330, 240, 300, 250], '#3ee8ff', 6);
      neonTubo(c, [690, 260, 690, 312], '#c6ff3d', 6); neonTubo(c, [690, 260, 720, 250, 720, 300], '#c6ff3d', 6);
      liso(c, '#c6ff3d', 682, 314, 10, 8); liso(c, '#c6ff3d', 712, 302, 10, 8);
      liso(c, '#3ee8ff', 292, 302, 10, 8); liso(c, '#3ee8ff', 322, 292, 10, 8);
      // chão quadriculado em perspectiva
      c.fillStyle = '#140d33'; c.fillRect(V.L, 420, V.R - V.L, V.B - 420);
      var lin = linhasPiso(V);
      for (var r = 0; r < lin.length - 1; r++) for (var k = 0; k < lin[r].length - 1; k++) {
        quad(c, lin, r, k); c.fillStyle = (r + k) % 2 ? '#2a1f63' : '#1c1447'; c.fill();
        c.lineWidth = 1.5; c.strokeStyle = 'rgba(190,170,255,.25)'; c.stroke();
      }
      // caixas de som
      caixaSom(c, V.L + 80, 556, 110, 210); caixaSom(c, V.R - 80, 556, 110, 210);
      // fio do globo
      c.lineWidth = 3; c.strokeStyle = '#9a8fd0'; c.beginPath(); c.moveTo(500, V.T); c.lineTo(500, 60); c.stroke();
    },
    quadro: function (c, V, R) {
      // luzes do chão: acendem no tempo (sem piscar com "reduzir movimento")
      var lin = this.lin || (this.lin = linhasPiso(V)); if (this.linV !== V) { this.lin = lin = linhasPiso(V); this.linV = V; }
      var CORES = ['#ff4fa3', '#3ee8ff', '#c6ff3d', '#ffd23f', '#b78cff'], nB = R.calmo ? 0 : R.n;
      c.save(); c.globalCompositeOperation = 'lighter';
      for (var r = 0; r < lin.length - 1; r++) for (var k = 0; k < lin[r].length - 1; k++) {
        if ((r + k + nB) % 3) continue;
        quad(c, lin, r, k); c.fillStyle = rgba(CORES[(r * 3 + k + nB) % 5], R.calmo ? 0.18 : (0.12 + 0.3 * R.pul * R.amp).toFixed(2)); c.fill();
      }
      // fachos do globo
      for (var i = 0; i < 6; i++) {
        var a = Math.PI / 2 + (i - 2.5) * 0.36 + (R.calmo ? 0 : Math.sin(R.t * 0.5 + i * 1.3) * 0.32);
        var L = 720, dx = Math.cos(a), dy = Math.sin(a), px = -dy, py = dx, w = 46;
        var g = c.createLinearGradient(500, 104, 500 + dx * L, 104 + dy * L); g.addColorStop(0, rgba(CORES[i % 5], R.calmo ? 0.16 : 0.2 + 0.12 * R.pul)); g.addColorStop(1, rgba(CORES[i % 5], 0));
        c.beginPath(); c.moveTo(500, 104); c.lineTo(500 + dx * L + px * w, 104 + dy * L + py * w); c.lineTo(500 + dx * L - px * w, 104 + dy * L - py * w); c.closePath(); c.fillStyle = g; c.fill();
      }
      c.restore();
      globo(c, 500, 104, 46, R);
      cones(c, V.L + 80, 556, 110, 210, R); cones(c, V.R - 80, 556, 110, 210, R);
      todos(c, this.bichos, R);
    }
  };
  function linhasPiso(V) {
    var rows = [], y0 = 420, y1 = V.B, vy = 150, n = 7;
    for (var r = 0; r <= n; r++) {
      var y = y0 + (y1 - y0) * Math.pow(r / n, 1.3), linha = [];
      for (var xb = -1500; xb <= 2500; xb += 120) linha.push([500 + (xb - 500) * (y - vy) / (y1 - vy), y]);
      rows.push(linha);
    }
    return rows;
  }
  function quad(c, lin, r, k) {
    var a = lin[r][k], b = lin[r][k + 1], d = lin[r + 1][k + 1], e = lin[r + 1][k];
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.closePath();
  }
  function globo(c, x, y, r, R) {
    vol(c, '#b7bfd9', x, y, r, r, 0, true);
    var rot = R.t * (R.calmo ? 0.2 : 0.9);
    for (var la = -3; la <= 3; la++) {
      var ph = la * 0.4, cy = y + Math.sin(ph) * r, rr2 = Math.cos(ph) * r;
      for (var lo = 0; lo < 16; lo++) {
        var th = lo * TAU / 16 + rot, z = Math.cos(th);
        if (z <= 0.05) continue;
        var cx = x + Math.sin(th) * rr2, w = 9 * z * Math.cos(ph) + 1, h = 8 * Math.cos(ph) + 1;
        var luz = (lo * 7 + la * 3 + Math.floor(R.calmo ? 0 : R.fase)) % 9 === 0;
        c.fillStyle = luz ? '#ffffff' : mix('#5a6390', '#e8ecff', Math.round((z * 0.7 + (la + 3) * 0.02 + (lo % 3) * 0.08) * 20) / 20, 1);
        c.fillRect(cx - w / 2, cy - h / 2, w * 0.86, h * 0.86);
      }
    }
    elipse(c, x, y, r, r); c.lineWidth = 2.5; c.strokeStyle = '#4a4f72'; c.stroke();
    brilho(c, x - r * 0.4, y - r * 0.45, r * 0.25, r * 0.14, 0.7);
    if (!R.calmo) { var s = (Math.sin(R.t * 3) + 1) / 2; c.fillStyle = 'rgba(255,255,255,' + (0.4 + s * 0.6).toFixed(2) + ')'; estrela(c, x - r * 0.55, y - r * 0.55, 6 + s * 10, 4, 0.18); c.fill(); }
  }

  var LUAU = {
    nome: ['🌙 Luau na praia', '🌙 Beach luau', '🌙 Luau en la playa'],
    fundo: function (c, V) {
      var g = c.createLinearGradient(0, V.T, 0, 290); g.addColorStop(0, '#0a0f3a'); g.addColorStop(0.6, '#25307a'); g.addColorStop(1, '#6a4fa0');
      c.fillStyle = g; c.fillRect(V.L, V.T, V.R - V.L, 290 - V.T);
      var rnd = sorteio(11);
      for (var i = 0; i < 90; i++) { c.fillStyle = 'rgba(255,255,240,' + (0.3 + rnd() * 0.6).toFixed(2) + ')'; var sx = V.L + rnd() * (V.R - V.L), sy = V.T + rnd() * (260 - V.T); liso(c, c.fillStyle, sx, sy, 0.8 + rnd() * 1.8, 0.8 + rnd() * 1.8); }
      halo(c, 770, 110, 190, 'rgba(255,245,200,.45)');
      vol(c, '#fff6d6', 770, 110, 54, 54, 0, true);
      liso(c, 'rgba(220,205,160,.6)', 752, 96, 10, 9); liso(c, 'rgba(220,205,160,.6)', 788, 126, 13, 11); liso(c, 'rgba(220,205,160,.5)', 784, 90, 6, 5);
      // mar
      g = c.createLinearGradient(0, 288, 0, 372); g.addColorStop(0, '#1b2a6e'); g.addColorStop(1, '#2d4c9a'); c.fillStyle = g; c.fillRect(V.L, 288, V.R - V.L, 84);
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(V.L, 300, V.R - V.L, 2);
      // areia
      g = c.createLinearGradient(0, 366, 0, V.B); g.addColorStop(0, '#d9b077'); g.addColorStop(1, '#b98b55'); c.fillStyle = g;
      c.beginPath(); c.moveTo(V.L, 380); for (var x = V.L; x <= V.R + 40; x += 40) c.lineTo(x, 372 + Math.sin(x * 0.02) * 6); c.lineTo(V.R, V.B); c.lineTo(V.L, V.B); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); for (var x3 = V.L; x3 <= V.R + 40; x3 += 40) c.lineTo(x3, 370 + Math.sin(x3 * 0.02) * 6); c.lineTo(V.R, 376); c.lineTo(V.L, 376); c.closePath(); c.fill();
      for (var k = 0; k < 40; k++) liso(c, 'rgba(120,80,40,.25)', V.L + rnd() * (V.R - V.L), 400 + rnd() * (V.B - 400), 2, 1.4);
      // estrela-do-mar e conchas
      c.fillStyle = '#ff9f6b'; estrela(c, 120, 572, 14, 5, 0.45); c.fill(); c.fillStyle = '#ffd0b0'; estrela(c, 900, 568, 10, 5, 0.45); c.fill();
      vol(c, '#ffe6f0', 330, 580, 9, 7);
      palmeira(c, V.L + 50, 420, 1.15, 1.3, null, null, '#141238'); palmeira(c, V.R - 40, 410, 1.2, -1.2, null, null, '#141238');
      // tronco onde a tartaruga senta
      vol(c, '#8a5a2b', 390, 520, 104, 24); vol(c, '#b98250', 292, 520, 10, 22, 0, false); liso(c, '#7a4b20', 292, 520, 5, 12);
      c.lineWidth = 2; c.strokeStyle = 'rgba(60,30,10,.5)'; c.beginPath(); c.moveTo(320, 512); c.lineTo(470, 512); c.moveTo(330, 528); c.lineTo(460, 528); c.stroke();
      // lenha da fogueira
      c.save(); c.translate(616, 548);
      c.rotate(0.35); rr(c, -54, -10, 108, 20, 10); c.fillStyle = '#6b4220'; c.fill(); c.rotate(-0.7); rr(c, -54, -10, 108, 20, 10); c.fill();
      c.restore();
      for (var p = 0; p < 7; p++) { var a = p * TAU / 7; vol(c, '#8d8aa0', 616 + Math.cos(a) * 64, 556 + Math.sin(a) * 14, 12, 9); }
    },
    quadro: function (c, V, R) {
      // reflexo da lua no mar
      for (var i = 0; i < 9; i++) {
        var w = 70 - i * 5 + (R.calmo ? 0 : Math.sin(R.t * 2 + i * 1.7) * 10), ox = R.calmo ? 0 : Math.sin(R.t * 1.3 + i) * 5;
        liso(c, 'rgba(255,245,200,' + (0.5 - i * 0.045).toFixed(2) + ')', 770 + ox, 304 + i * 7.5, w / 2, 1.8);
      }
      // varal de lampadinhas
      var cs = ['#ff4fa3', '#ffd23f', '#3ee8ff', '#c6ff3d', '#ff9f1c'];
      c.lineWidth = 2; c.strokeStyle = '#2a2450'; c.beginPath();
      for (var x = V.L; x <= V.R + 30; x += 30) c.lineTo(x, 70 + Math.pow((x - 500) / 500, 2) * -30 + 30);
      c.stroke();
      var k = 0;
      for (var x2 = Math.ceil(V.L / 70) * 70; x2 <= V.R; x2 += 70, k++) {
        var y2 = 70 + Math.pow((x2 - 500) / 500, 2) * -30 + 30 + 12, cor = cs[(k + 50) % 5];
        var acesa = R.calmo ? 0.75 : 0.5 + 0.5 * (((k + R.n) % 2) ? R.pul : 1 - R.pul);
        c.save(); c.globalCompositeOperation = 'lighter'; halo(c, x2, y2, 24, rgba(cor, (0.45 * acesa).toFixed(2))); c.restore();
        vol(c, cor, x2, y2, 7, 9, 0, true);
      }
      fogueira(c, 616, 540, R);
      tartaruga(c, 390, 508, 1, R);
      if (RET) { caranguejo(c, 520, 800, 0.75, R, 1.3); caranguejo(c, 300, 712, 1, R, 0.2); caranguejo(c, 700, 706, 1, R, 0.7); }
      else { caranguejo(c, 212, 556, 0.85, R, 0.2); caranguejo(c, 792, 560, 0.9, R, 0.7); caranguejo(c, 905, 520, 0.6, R, 1.3); }
    }
  };
  function fogueira(c, x, y, R) {
    var t = R.t, f = R.calmo ? 0 : 1, chama = 1 + (R.calmo ? 0 : 0.12 * R.pul * R.amp);
    c.save(); c.globalCompositeOperation = 'lighter'; halo(c, x, y - 30, 190, 'rgba(255,140,40,' + (0.32 + 0.06 * Math.sin(t * 9) * f).toFixed(2) + ')'); c.restore();
    var cs = [['#ff5a1f', 62, 1], ['#ff9f1c', 48, 0.8], ['#ffe066', 30, 0.6]];
    for (var i = 0; i < 3; i++) {
      var h = cs[i][1] * 1.6 * chama, w = cs[i][1] * 0.6, o = Math.sin(t * 7 + i) * 6 * f;
      c.beginPath(); c.moveTo(x - w, y); c.bezierCurveTo(x - w, y - h * 0.5, x - w * 0.2 + o, y - h * 0.7, x + o * 1.5, y - h);
      c.bezierCurveTo(x + w * 0.3 + o, y - h * 0.6, x + w, y - h * 0.45, x + w, y); c.closePath();
      c.fillStyle = cs[i][0]; c.fill();
    }
    if (!R.calmo) for (var j = 0; j < 6; j++) { var sp = (t * 0.7 + j / 6) % 1; liso(c, 'rgba(255,220,120,' + (1 - sp).toFixed(2) + ')', x + Math.sin(j * 2.3 + t) * 30 * sp, y - 60 - sp * 160, 2.4, 2.4); }
  }

  // ---------- H-rraaa ----------
  var PELUCIAS = {
    nome: ['🧸 Pelúcias na balada', '🧸 Plushie party', '🧸 Fiesta de peluches'],
    bichos: [
      { tipo: 'urso', cor: '#c98a55', focinho: '#f0cfa0', barriga: '#f0cfa0', x: 250, y: 528, s: 0.84, ret: [312, 710, 1.1], danca: 'pula', atraso: 0, vez: 1, esp: 'pulao', pelucia: true, acc: { laco: '#ff4fa3' } },
      { tipo: 'coelha', cor: '#e6d4ff', barriga: '#f7f0ff', x: 418, y: 528, s: 0.84, ret: [425, 528, 0.84], danca: 'balanca', atraso: 0.1, vez: 5, esp: 'gira', pelucia: true, remendo: '#3ee8ff' },
      { tipo: 'sapo', cor: '#79cf62', barriga: '#d8f5b8', x: 588, y: 528, s: 0.84, ret: [580, 528, 0.84], danca: 'remexe', atraso: 0.2, vez: 9, esp: 'requebra', pelucia: true, remendo: '#ffd23f' },
      { tipo: 'unicornio', cor: '#fff3fb', barriga: '#ffffff', x: 758, y: 528, s: 0.84, ret: [688, 710, 1.1], danca: 'aponta', atraso: 0.08, vez: 13, esp: 'disco', pelucia: true, remendo: '#b78cff', pe: '#ffd6ec' }
    ],
    fundo: function (c, V) {
      var g = c.createLinearGradient(0, V.T, 0, V.B); g.addColorStop(0, '#2a0f55'); g.addColorStop(0.7, '#170838'); g.addColorStop(1, '#0d0526');
      c.fillStyle = g; c.fillRect(V.L, V.T, V.R - V.L, V.B - V.T);
      // parede de furinhos
      for (var y = Math.ceil(V.T / 34) * 34; y < 480; y += 34) for (var x = Math.ceil(V.L / 34) * 34; x < V.R; x += 34) liso(c, 'rgba(0,0,0,.28)', x + ((y / 34) % 2 ? 17 : 0), y, 3.2, 3.2);
      halo(c, 500, 160, 420, 'rgba(255,79,163,.18)');
      // trilho da garra
      rr(c, V.L, 22, V.R - V.L, 22, 6); var gm = c.createLinearGradient(0, 22, 0, 44); gm.addColorStop(0, '#e8edf8'); gm.addColorStop(1, '#7d88a8'); c.fillStyle = gm; c.fill();
      // tubos de neon nas bordas
      neonTubo(c, [V.L + 26, 70, V.L + 26, 470], '#ff4fa3', 8); neonTubo(c, [V.R - 26, 70, V.R - 26, 470], '#3ee8ff', 8);
      neonTubo(c, [V.L + 60, 60, V.R - 60, 60], '#c6ff3d', 6);
      // montanha de pelúcias
      var rnd = sorteio(5), cs = ['#ffb0d0', '#9be7ff', '#ffe08a', '#c6f59a', '#d9c2ff', '#ffc89a', '#ffffff'];
      for (var k = 0; k < 70; k++) {
        var px = V.L + rnd() * (V.R - V.L), py = 490 + rnd() * (V.B - 470), r = 26 + rnd() * 18;
        bolaPelucia(c, px, py, r, cs[k % cs.length]);
      }
    },
    quadro: function (c, V, R) {
      // neon pulsando no tempo
      if (!R.calmo) {
        c.save(); c.globalCompositeOperation = 'lighter';
        var ge = c.createLinearGradient(V.L, 0, V.L + 220, 0); ge.addColorStop(0, rgba('#ff4fa3', (0.08 + 0.2 * R.pul * R.amp).toFixed(2))); ge.addColorStop(1, rgba('#ff4fa3', 0));
        c.fillStyle = ge; c.fillRect(V.L, V.T, 220, V.B - V.T);
        var gd = c.createLinearGradient(V.R, 0, V.R - 220, 0); gd.addColorStop(0, rgba('#3ee8ff', (0.08 + 0.2 * (1 - R.pul) * R.amp).toFixed(2))); gd.addColorStop(1, rgba('#3ee8ff', 0));
        c.fillStyle = gd; c.fillRect(V.R - 220, V.T, 220, V.B - V.T);
        c.restore();
      }
      // a garra: o carrinho anda no trilho, ela balança como DJ, abre e fecha no tempo
      var cx = 500 + Math.sin(R.fase * Math.PI / 4) * 70 * R.amp, ang = Math.sin(R.fase * Math.PI) * 0.2 * R.amp;
      rr(c, cx - 40, 16, 80, 34, 8); c.fillStyle = grad(c, '#8ea0c8', cx, 30, 40, 17); c.fill(); c.lineWidth = 3; c.strokeStyle = '#4a5578'; c.stroke();
      c.save(); c.translate(cx, 50); c.rotate(ang);
      var L = 132 + R.pul * 8 * R.amp;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, L - 30); c.lineWidth = 5; c.strokeStyle = '#3a3f5a'; c.stroke(); c.lineWidth = 2; c.strokeStyle = '#b7bfd9'; c.stroke();
      garra(c, 0, L, 0.95, 0.25 + 0.6 * Math.sin(R.b * Math.PI) * R.amp, Math.sin(R.fase * Math.PI / 2) * 3, R, true);
      c.restore();
      todos(c, this.bichos, R);
      vidro(c, V);
    }
  };
  function vidro(c, V) {
    c.fillStyle = 'rgba(255,255,255,.07)';
    c.beginPath(); c.moveTo(V.L + 120, V.T); c.lineTo(V.L + 260, V.T); c.lineTo(V.L + 40, V.B); c.lineTo(V.L - 100, V.B); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(V.L + 300, V.T); c.lineTo(V.L + 340, V.T); c.lineTo(V.L + 120, V.B); c.lineTo(V.L + 80, V.B); c.closePath(); c.fill();
  }

  var DJ_GARRA = {
    nome: ['🎧 DJ Garra', '🎧 DJ Claw', '🎧 DJ Garra'], ancora: 0.55,
    bichos: [
      { tipo: 'pinguim', cor: '#2c3454', x: 405, y: 456, s: 0.5, danca: 'pula', atraso: 0, vez: 3, esp: 'pulao', semSombra: false },
      { tipo: 'coelha', cor: '#ffd1e6', barriga: '#fff0f7', x: 500, y: 456, s: 0.5, danca: 'pula', atraso: 0.33, vez: 7, esp: 'gira', pelucia: true },
      { tipo: 'urso', cor: '#c98a55', focinho: '#f0cfa0', barriga: '#f0cfa0', x: 595, y: 456, s: 0.5, danca: 'pula', atraso: 0.66, vez: 11, esp: 'pulao', pelucia: true }
    ],
    fundo: function (c, V) {
      var g = c.createLinearGradient(0, V.T, 0, 520); g.addColorStop(0, '#0e0a2a'); g.addColorStop(1, '#2a1366');
      c.fillStyle = g; c.fillRect(V.L, V.T, V.R - V.L, 520 - V.T);
      var rnd = sorteio(3);
      for (var i = 0; i < 50; i++) { c.fillStyle = 'rgba(255,255,255,' + (0.15 + rnd() * 0.45).toFixed(2) + ')'; estrela(c, V.L + rnd() * (V.R - V.L), V.T + rnd() * (480 - V.T), 1.5 + rnd() * 3, 4, 0.35); c.fill(); }
      neonTubo(c, [V.L, 400, V.R, 400], '#b78cff', 4);
      // máquinas do lado, apagadinhas
      for (var s = -1; s <= 1; s += 2) {
        var mx = s < 0 ? Math.min(150, V.L + 120) : Math.max(850, V.R - 120);
        rr(c, mx - 90, 200, 180, 360, 16); c.fillStyle = s < 0 ? '#3d2a7a' : '#2a4a7a'; c.fill();
        rr(c, mx - 96, 180, 192, 44, 12); c.fillStyle = s < 0 ? '#7a3fa0' : '#2f7fa0'; c.fill();
        c.fillStyle = s < 0 ? '#ffd23f' : '#c6ff3d'; estrela(c, mx - 50, 202, 10, 5, 0.5); c.fill(); estrela(c, mx, 202, 12, 5, 0.5); c.fill(); estrela(c, mx + 50, 202, 10, 5, 0.5); c.fill();
        rr(c, mx - 70, 250, 140, 190, 10); c.fillStyle = 'rgba(120,200,255,.18)'; c.fill();
        for (var b = 0; b < 5; b++) bolaPelucia(c, mx - 50 + b * 25, 425, 14, ['#ffb0d0', '#9be7ff', '#ffe08a', '#c6f59a', '#d9c2ff'][b]);
        c.fillStyle = 'rgba(14,10,42,.4)'; c.fillRect(mx - 96, 180, 192, 380);
      }
      // carpete do fliperama
      g = c.createLinearGradient(0, 520, 0, V.B); g.addColorStop(0, '#24135a'); g.addColorStop(1, '#140a36'); c.fillStyle = g; c.fillRect(V.L, 520, V.R - V.L, V.B - 520);
      var cs = ['#ff4fa3', '#3ee8ff', '#c6ff3d', '#ffd23f'];
      for (var k = 0; k < 40; k++) { c.save(); c.translate(V.L + rnd() * (V.R - V.L), 530 + rnd() * (V.B - 530)); c.rotate(rnd() * 3); c.fillStyle = rgba(cs[k % 4], 0.55); c.fillRect(-7, -2, 14, 4); c.restore(); }
      // a máquina do meio
      sombra(c, 500, 576, 250, 0.4);
      rr(c, 290, 470, 420, 104, 14); var gb = c.createLinearGradient(0, 470, 0, 574); gb.addColorStop(0, '#ff5fb0'); gb.addColorStop(1, '#b51a72'); c.fillStyle = gb; c.fill(); c.lineWidth = 4; c.strokeStyle = '#7a0f4c'; c.stroke();
      rr(c, 330, 500, 92, 58, 10); c.fillStyle = '#2a0f3f'; c.fill(); rr(c, 336, 506, 80, 18, 6); c.fillStyle = '#4a1f6a'; c.fill();
      rr(c, 610, 502, 26, 40, 6); c.fillStyle = '#ffd23f'; c.fill(); c.fillStyle = '#2a0f3f'; c.fillRect(620, 508, 6, 28);
      rr(c, 280, 222, 440, 252, 18); c.fillStyle = '#ff4fa3'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#7a0f4c'; c.stroke();
      rr(c, 302, 240, 396, 220, 12); var gv = c.createLinearGradient(0, 240, 0, 460); gv.addColorStop(0, '#5a2a9a'); gv.addColorStop(1, '#2a0f55'); c.fillStyle = gv; c.fill();
      c.lineWidth = 3; c.strokeStyle = '#3ee8ff'; c.stroke();
      halo(c, 500, 250, 200, 'rgba(255,120,200,.25)');
      var rnd2 = sorteio(9), cs2 = ['#ffb0d0', '#9be7ff', '#ffe08a', '#c6f59a', '#d9c2ff', '#ffc89a'];
      c.save(); rr(c, 302, 240, 396, 220, 12); c.clip();
      for (var q = 0; q < 26; q++) bolaPelucia(c, 310 + rnd2() * 380, 452 + rnd2() * 20, 14 + rnd2() * 8, cs2[q % 6]);
      c.restore();
      // letreiro
      rr(c, 268, 148, 464, 82, 20); var gl = c.createLinearGradient(0, 148, 0, 230); gl.addColorStop(0, '#2b1f63'); gl.addColorStop(1, '#150f38'); c.fillStyle = gl; c.fill();
      c.lineWidth = 5; c.strokeStyle = '#ffd23f'; c.stroke();
      letreiroH(c, 500, 190, 50);
      // caixinhas de som em cima
      caixaSom(c, 312, 150, 56, 70); caixaSom(c, 688, 150, 56, 70);
    },
    quadro: function (c, V, R) {
      // lampadinhas do letreiro correndo no tempo
      for (var i = 0; i < 22; i++) {
        var px = 282 + i * 21, acesa = R.calmo ? (i % 2 === 0) : ((i + R.n) % 3 === 0);
        liso(c, acesa ? '#fff6c2' : '#b38a2a', px, 152, 4, 4); liso(c, acesa ? '#fff6c2' : '#b38a2a', px, 226, 4, 4);
      }
      cones(c, 312, 150, 56, 70, R); cones(c, 688, 150, 56, 70, R);
      // pelúcias pulando lá dentro
      c.save(); rr(c, 302, 240, 396, 220, 12); c.clip();
      for (var j = 0; j < this.bichos.length; j++) bicho(c, this.bichos[j], R);
      c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.moveTo(330, 240); c.lineTo(400, 240); c.lineTo(330, 460); c.lineTo(302, 460); c.closePath(); c.fill();
      c.restore();
      // alavanca e botão
      var ala = Math.sin(R.fase * Math.PI) * 0.35 * R.amp;
      c.save(); c.translate(520, 520); c.rotate(ala); c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = '#d5dcef'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -34); c.stroke(); vol(c, '#ff3b4f', 0, -38, 12, 12); c.restore();
      vol(c, '#c6ff3d', 568, 520, 14, 9 - (R.calmo ? 0 : R.pul * 3 * R.amp));
      // a garra DJ em cima da máquina, de fone
      var bob = R.pul * 6 * R.amp, sw = Math.sin(R.fase * Math.PI) * 0.06 * R.amp;
      c.lineWidth = 5; c.strokeStyle = '#3a3f5a'; c.beginPath(); c.moveTo(500, V.T); c.lineTo(500, 22 + bob); c.stroke();
      c.save(); c.translate(500, 0); c.rotate(sw); c.translate(-500, 0);
      garra(c, 500, 52 + bob, 0.9, 0.65 + 0.15 * Math.sin(R.b * Math.PI) * R.amp, Math.sin(R.fase * Math.PI / 2) * 3, R, true);
      c.restore();
      mesa(c, 500, 136, 260, R, 0);
      // os "dedos" da garra arranhando o disco
      var arr = Math.sin(R.fase * TAU) * 10 * R.amp * (R.tocando ? 1 : 0.2);
      vol(c, '#ff4fa3', 422 + arr, 124, 8, 7); vol(c, '#ff4fa3', 578 + Math.sin(R.fase * Math.PI) * 6 * R.amp, 124, 8, 7);
    }
  };

  var CENAS = { radio: [PISCINA, DISCO, LUAU], garra: [PELUCIAS, DJ_GARRA] };

  // ======================================================================
  // RITMO: o som do <audio> que já toca (captureStream + AnalyserNode) ou 120 BPM
  // ======================================================================
  var rit = { audio: null, ctx: null, an: null, src: null, fluxo: null, dados: null, analise: false,
    fase: 0, periodo: 0.5, media: 0, ultimo: -9, inter: [], energia: 0.5, amp: 0.6, pancada: 0 };
  function ligarRitmo(audio) {
    rit.audio = audio || null; rit.analise = false; rit.inter = []; rit.periodo = 0.5;
    var AC = raiz.AudioContext || raiz.webkitAudioContext;
    if (!audio || !AC || typeof audio.captureStream !== 'function') return;
    try {
      rit.ctx = new AC(); rit.an = rit.ctx.createAnalyser(); rit.an.fftSize = 1024; rit.an.smoothingTimeConstant = 0.55;
      rit.dados = new Uint8Array(rit.an.frequencyBinCount);
      if (rit.ctx.resume) { var p = rit.ctx.resume(); if (p && p.catch) p.catch(function () {}); }
    } catch (e) { rit.ctx = null; return; }
    audio.addEventListener('playing', conectar);
    conectar();
  }
  function conectar() {
    if (!rit.ctx || !rit.audio || rit.audio.paused) return;
    try {
      var s = rit.audio.captureStream();
      if (!s || !s.getAudioTracks().length) return;
      soltarFluxo();
      rit.fluxo = s; rit.src = rit.ctx.createMediaStreamSource(s); rit.src.connect(rit.an); rit.analise = true;
    } catch (e) { rit.analise = false; }
  }
  function soltarFluxo() {
    try { if (rit.src) rit.src.disconnect(); } catch (e) { /* já solto */ }
    try { if (rit.fluxo) rit.fluxo.getTracks().forEach(function (t) { t.stop(); }); } catch (e2) { /* ok */ }
    rit.src = rit.fluxo = null;
  }
  function desligarRitmo() {
    if (rit.audio) rit.audio.removeEventListener('playing', conectar);
    soltarFluxo();
    try { if (rit.ctx && rit.ctx.close) rit.ctx.close(); } catch (e) { /* ok */ }
    rit.ctx = rit.an = null; rit.analise = false; rit.audio = null;
  }
  function mediana(l) { var a = l.slice().sort(function (x, y) { return x - y; }); return a[a.length >> 1]; }
  function ritmoPasso(dt, t) {
    var tocando = !!(rit.audio && !rit.audio.paused), viu = false, i;
    if (rit.analise && tocando && rit.an) {
      rit.an.getByteFrequencyData(rit.dados);
      var grave = 0, total = 0;
      for (i = 1; i <= 4; i++) grave += rit.dados[i];
      grave /= 4;
      for (i = 0; i < 160; i++) total += rit.dados[i];
      total /= 160;
      viu = total > 1.5;
      if (viu) {
        rit.energia += (Math.min(1, total / 120) - rit.energia) * Math.min(1, dt * 4);
        var antes = rit.media; rit.media += (grave - rit.media) * Math.min(1, dt * 3);
        if (grave > antes * 1.12 + 5 && grave > 60 && t - rit.ultimo > 0.26) {   // o grave subiu de repente: uma batida
          var iv = t - rit.ultimo; rit.ultimo = t;
          if (iv > 0.25 && iv < 2.2) {
            while (iv < 0.4) iv *= 2;
            while (iv > 0.8) iv /= 2;
            rit.inter.push(iv); if (rit.inter.length > 10) rit.inter.shift();
            if (rit.inter.length >= 3) rit.periodo += (mediana(rit.inter) - rit.periodo) * 0.35;
          }
          var fr = rit.fase - Math.floor(rit.fase); rit.fase -= (fr > 0.5 ? fr - 1 : fr) * 0.5;   // a batida vira o começo de um tempo
        }
      }
    }
    if (!viu) {   // sem análise: 120 BPM com pequenas variações
      rit.periodo += (0.5 + 0.012 * Math.sin(t * 0.13) - rit.periodo) * Math.min(1, dt);
      rit.energia += ((tocando ? 0.62 + 0.22 * Math.sin(t * 0.37) * Math.sin(t * 0.11) : 0.12) - rit.energia) * Math.min(1, dt * 2);
    }
    rit.fase += dt / rit.periodo;
    var alvo = calmo ? 0.16 : tocando ? 0.5 + 0.5 * rit.energia : 0.28;
    rit.amp += (alvo - rit.amp) * Math.min(1, dt * 2);
    var n = Math.floor(rit.fase), b = rit.fase - n;
    return { t: t, fase: rit.fase, n: n, b: b, pul: Math.pow(1 - b, 2.4), e: rit.energia, amp: rit.amp, calmo: calmo, tocando: tocando };
  }

  // ======================================================================
  // O TELÃO
  // ======================================================================
  var tela = null, cv, ctx, bg, bgc, rotCena, rotMusica, btX, btCheia, video = null;
  var aberto = false, op = null, lista = null, iCena = 0, tCena = 0, fade = 0, raf = 0, ultimoT = 0, ultimoDesenho = 0;
  var V = null, dpr = 1, fundoPronto = false, lento = false, meia = false, medias = 0, nQuadros = 0, naHistoria = false, tMusica = 0, textoMusica = '';
  var quemAbriu = null, iVideo = 0;

  var CSS = '.clp{position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147483000;background:#0b0a1f;display:none;overflow:hidden;touch-action:none;' +
    'font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#f3f0ff}' +
    '.clp.aberto{display:block}' +
    '.clp canvas,.clp video{position:absolute;left:0;top:0;width:100%;height:100%;display:block}' +
    '.clp video{object-fit:cover;opacity:0;transition:opacity .4s}.clp.com-video video{opacity:1}' +
    '.clp-topo{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:.5rem;padding:max(.6rem,env(safe-area-inset-top)) max(.6rem,env(safe-area-inset-right)) .6rem max(.7rem,env(safe-area-inset-left));pointer-events:none}' +
    '.clp-cena{flex:0 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:.35rem .8rem;border-radius:999px;background:rgba(14,10,40,.62);' +
    'border:1.5px solid rgba(255,255,255,.22);font-weight:800;font-size:.9rem;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}' +
    '.clp-esp{flex:1}' +
    '.clp-topo button{pointer-events:auto;flex:none;width:48px;height:48px;border-radius:50%;border:2px solid rgba(255,255,255,.4);background:rgba(14,10,40,.62);color:#fff;' +
    'font:800 1.3rem/1 system-ui,sans-serif;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}' +
    '.clp-topo button:focus-visible{outline:3px solid #ffd166;outline-offset:2px}' +
    '.clp-topo svg{width:22px;height:22px}' +
    '.clp-letreiro{position:absolute;left:50%;bottom:max(.8rem,env(safe-area-inset-bottom));transform:translateX(-50%);max-width:calc(100% - 1.6rem);display:flex;align-items:center;gap:.5rem;' +
    'padding:.45rem 1.05rem .45rem .5rem;border-radius:999px;background:rgba(14,10,40,.7);border:1.5px solid rgba(255,255,255,.22);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);pointer-events:none}' +
    '.clp-nota{flex:none;width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#ff4fa3,#ff9f1c);color:#1a1446;font-weight:900}' +
    '.clp-musica{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.92rem}.clp-musica b{font-weight:800}.clp-musica span{color:#c9c2ee}' +
    '@media (max-width:30rem){.clp-cena{font-size:.8rem}.clp-musica{font-size:.82rem}}';

  var SVG_CHEIA = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9V3h6M15 3h6v6M21 15v6h-6M9 21H3v-6"/></svg>';
  var SVG_SAIR = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v6H3M15 3v6h6M21 15h-6v6M3 15h6v6"/></svg>';
  function temCheia() { var e = d.documentElement; return !!(e.requestFullscreen || e.webkitRequestFullscreen); }
  function cheia() { return !!(d.fullscreenElement || d.webkitFullscreenElement); }

  function montar() {
    if (tela) return;
    var st = d.createElement('style'); st.textContent = CSS; d.head.appendChild(st);
    tela = d.createElement('div'); tela.className = 'clp'; tela.setAttribute('role', 'dialog'); tela.setAttribute('aria-modal', 'true');
    tela.innerHTML = '<canvas aria-hidden="true"></canvas><div class="clp-topo"><span class="clp-cena"></span><span class="clp-esp"></span>' +
      '<button type="button" class="clp-cheia"></button><button type="button" class="clp-x">✕</button></div>' +
      '<div class="clp-letreiro" aria-live="polite"><span class="clp-nota" aria-hidden="true">♪</span><span class="clp-musica"></span></div>';
    d.body.appendChild(tela);
    cv = tela.querySelector('canvas'); ctx = cv.getContext('2d');
    bg = d.createElement('canvas'); bgc = bg.getContext('2d');
    rotCena = tela.querySelector('.clp-cena'); rotMusica = tela.querySelector('.clp-musica');
    btX = tela.querySelector('.clp-x'); btCheia = tela.querySelector('.clp-cheia');
    btX.addEventListener('click', function () { fechar(); });
    btCheia.addEventListener('click', alternarCheia);
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) { d.addEventListener(ev, function () { if (aberto) { pintarBotoes(); setTimeout(medir, 60); } }); });
    d.addEventListener('keydown', tecla, true);
    raiz.addEventListener('resize', function () { if (aberto) medir(); });
    d.addEventListener('visibilitychange', function () { if (!aberto) return; if (d.hidden) parar(); else comecar(); });
    raiz.addEventListener('popstate', function () { if (aberto && naHistoria) { naHistoria = false; fechar(true); } });
  }
  function pintarBotoes() {
    btX.setAttribute('aria-label', T('Fechar o clipe', 'Close the music video', 'Cerrar el videoclip'));
    btCheia.hidden = !temCheia();
    btCheia.innerHTML = cheia() ? SVG_SAIR : SVG_CHEIA;
    btCheia.setAttribute('aria-label', cheia() ? T('Sair da tela cheia', 'Exit full screen', 'Salir de pantalla completa') : T('Tela cheia', 'Full screen', 'Pantalla completa'));
    tela.setAttribute('aria-label', T('Clipe', 'Music video', 'Videoclip'));
  }
  function alternarCheia() {
    try {
      if (cheia()) { var s = d.exitFullscreen || d.webkitExitFullscreen; var p = s && s.call(d); if (p && p.catch) p.catch(function () {}); }
      else { var pedir = tela.requestFullscreen || tela.webkitRequestFullscreen; var p2 = pedir && pedir.call(tela); if (p2 && p2.catch) p2.catch(function () {}); }
    } catch (e) { /* o navegador recusou */ }
  }
  var VOLTAR = { Escape: 1, Esc: 1, Backspace: 1, GoBack: 1, BrowserBack: 1 };
  function tecla(e) {
    if (!aberto) return;
    var k = e.key || '', c = e.keyCode || 0;
    if (VOLTAR[k] || c === 27 || c === 8 || c === 461 || c === 10009) { e.preventDefault(); e.stopPropagation(); fechar(); return; }
    if (k === 'Tab' || c === 9) {   // o foco fica no telão
      e.preventDefault();
      var bts = [btCheia, btX].filter(function (b) { return !b.hidden; }), i = bts.indexOf(d.activeElement);
      bts[(i + (e.shiftKey ? -1 : 1) + bts.length) % bts.length].focus(); return;
    }
    if (/^Arrow|^(Left|Right|Up|Down)$/.test(k) || (c >= 37 && c <= 40)) {   // setas do controle: entre ⛶ e ✕
      e.preventDefault(); e.stopPropagation();
      if (!btCheia.hidden) (d.activeElement === btX ? btCheia : btX).focus(); else btX.focus();
    }
  }

  function medir() {
    if (!tela) return;
    var w = tela.clientWidth || raiz.innerWidth, h = tela.clientHeight || raiz.innerHeight;
    dpr = Math.min(raiz.devicePixelRatio || 1, lento ? 1 : 2);
    cv.width = bg.width = Math.max(1, Math.round(w * dpr)); cv.height = bg.height = Math.max(1, Math.round(h * dpr));
    RET = h > w * 1.15;
    var k = Math.min(h / 600, w / (RET ? 600 : 660)), ox = (w - 1000 * k) / 2, oy = (h - 600 * k) / 2;
    if (RET) oy = (h - 600 * k) * (lista && lista[iCena] && lista[iCena].ancora || 0.4);   // em pé: um pouco mais de céu do que de chão
    V = { w: w, h: h, k: k, ox: ox, oy: oy, L: -ox / k, R: (w - ox) / k, T: -oy / k, B: (h - oy) / k };
    fundoPronto = false; GC = {}; nGC = 0; gcDe = null;
  }
  function transformar(c) { c.setTransform(dpr * V.k, 0, 0, dpr * V.k, dpr * V.ox, dpr * V.oy); }
  function pintarFundo() {
    bgc.setTransform(1, 0, 0, 1, 0, 0); bgc.clearRect(0, 0, bg.width, bg.height);
    transformar(bgc); lista[iCena].fundo(bgc, V);
    gcDe = null; fundoPronto = true;
  }

  function trocar(n) {
    if (!lista) return;
    iCena = ((n % lista.length) + lista.length) % lista.length;
    if (RET) medir();   // em pé, cada cena fica numa altura
    fundoPronto = false; fade = 1; tCena = ultimoT;
    var nm = lista[iCena].nome; rotCena.textContent = T(nm[0], nm[1], nm[2]);
    if (video) proximoVideo();
  }
  function atualizarMusica() {
    var m = null;
    try { m = op && op.musica ? op.musica() : null; } catch (e) { m = null; }
    var txt = m && m.t ? m.t + '|' + (m.au || '') : '';
    if (txt === textoMusica) return;
    textoMusica = txt; rotMusica.innerHTML = '';
    if (!m || !m.t) { rotMusica.textContent = T('Música', 'Music', 'Música'); return; }
    var b = d.createElement('b'); b.textContent = m.t; rotMusica.appendChild(b);
    if (m.au) { var s = d.createElement('span'); s.textContent = ' · ' + m.au; rotMusica.appendChild(s); }
  }
  function novaMusica() { if (aberto && ultimoT - tCena > 6) trocar(iCena + 1); }

  // vídeo de IA por cima do desenho (CLIPES_VIDEO)
  function iniciarVideo() {
    var l = CLIPES_VIDEO[op.cenas];
    if (!l || !l.length || raiz.navigator.onLine === false) return;
    video = d.createElement('video'); video.muted = true; video.loop = true; video.autoplay = true; video.playsInline = true;
    video.setAttribute('muted', ''); video.setAttribute('playsinline', ''); video.setAttribute('aria-hidden', 'true');
    video.addEventListener('playing', function () { tela.classList.add('com-video'); });
    video.addEventListener('error', tirarVideo);
    tela.insertBefore(video, tela.querySelector('.clp-topo'));
    proximoVideo();
  }
  function proximoVideo() {
    var l = CLIPES_VIDEO[op.cenas]; if (!video || !l || !l.length) return;
    video.src = l[iVideo++ % l.length];
    var p = video.play(); if (p && p.catch) p.catch(function () {});
  }
  function tirarVideo() {
    if (!video) return;
    tela.classList.remove('com-video');
    try { video.pause(); video.removeAttribute('src'); video.load(); } catch (e) { /* ok */ }
    if (video.parentNode) video.parentNode.removeChild(video);
    video = null;
  }

  function quadro(agora) {
    raf = 0;
    if (!aberto || d.hidden) return;
    raf = raiz.requestAnimationFrame(quadro);
    if (meia && agora - ultimoDesenho < 31) return;   // aparelho lento: 30 quadros por segundo
    var t = agora / 1000, dt = ultimoT ? Math.min(0.1, Math.max(0.001, t - ultimoT)) : 0.016;
    ultimoT = t; ultimoDesenho = agora;
    var R = ritmoPasso(dt, t);
    if (tCena === 0) tCena = t;
    if (t - tCena > 40) trocar(iCena + 1);
    if (t - tMusica > 0.5) { tMusica = t; atualizarMusica(); }
    if (tela.classList.contains('com-video')) return;   // o vídeo está tocando: o desenho descansa
    var ini = raiz.performance ? performance.now() : 0;
    if (!fundoPronto) pintarFundo();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg, 0, 0);
    transformar(ctx);
    lista[iCena].quadro(ctx, V, R);
    if (fade > 0) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(11,10,31,' + fade.toFixed(2) + ')'; ctx.fillRect(0, 0, cv.width, cv.height);
      fade = Math.max(0, fade - dt * 2.2);
    }
    // aparelho que não dá conta (ex.: tablet Fire velho): menos pontos na tela e 30 quadros por segundo
    if (raiz.performance && !lento) {
      var gasto = performance.now() - ini; nQuadros++;
      medias += (gasto - medias) * 0.1;
      if (nQuadros > 45 && medias > 17) { lento = meia = true; medir(); }
    }
  }
  function comecar() { if (!raf && aberto && !d.hidden) { ultimoT = 0; raf = raiz.requestAnimationFrame(quadro); } }
  function parar() { if (raf) raiz.cancelAnimationFrame(raf); raf = 0; }

  function travar(sim) {   // a página de trás não rola (o mesmo contador da estante)
    var h = d.documentElement, n = Math.max(0, (+h.getAttribute('data-travas') || 0) + (sim ? 1 : -1));
    h.setAttribute('data-travas', n); h.classList.toggle('trava-fundo', n > 0);
  }

  function abrir(opcoes) {
    if (aberto) return;
    montar();
    op = opcoes || {}; lista = CENAS[op.cenas] || CENAS.radio; if (CENAS[op.cenas] === undefined) op.cenas = 'radio';
    aberto = true; textoMusica = '\u0000';
    tlAtualizar();   // a telinha descansa (e solta o ritmo) enquanto o telão está aberto
    tela.classList.add('aberto'); d.body.classList.add('clipe-aberto'); travar(true);
    pintarBotoes(); medir();
    quemAbriu = d.activeElement;
    try { btX.focus({ preventScroll: true }); } catch (e) { btX.focus(); }
    try { history.pushState({ bolinhoClipe: 1 }, ''); naHistoria = true; } catch (e2) { naHistoria = false; }
    ligarRitmo(op.audio);
    if (op.audio) op.audio.addEventListener('loadstart', novaMusica);
    tCena = 0; ultimoT = 0; iCena = iCena % lista.length; trocar(iCena); fade = 0.8;
    atualizarMusica();
    iniciarVideo();
    comecar();
  }
  function fechar(pelaHistoria) {
    if (!aberto) return;
    aberto = false; parar();
    if (op && op.audio) op.audio.removeEventListener('loadstart', novaMusica);
    desligarRitmo(); tirarVideo();
    if (cheia()) { try { var s = d.exitFullscreen || d.webkitExitFullscreen; var p = s && s.call(d); if (p && p.catch) p.catch(function () {}); } catch (e) { /* ok */ } }
    tela.classList.remove('aberto'); d.body.classList.remove('clipe-aberto'); travar(false);
    if (naHistoria && !pelaHistoria) { naHistoria = false; try { history.back(); } catch (e2) { /* ok */ } }
    naHistoria = false;
    iCena = (iCena + 1) % (lista ? lista.length : 1);   // a próxima vez começa na cena seguinte
    if (quemAbriu && quemAbriu.focus) { try { quemAbriu.focus({ preventScroll: true }); } catch (e3) { quemAbriu.focus(); } }
    quemAbriu = null;
    tlAtualizar();   // a telinha volta a dançar
  }

  // ======================================================================
  // A TELINHA (dono, 20/Nov/2026): a TV pequena (16:9) presa em cima da rádio da estante. O radio.js monta a caixa
  // (um <button> que abre o telão), o ✕ e o aparecer/sumir; aqui fica só o que passa nela:
  // - um pedaço da Festa na piscina visto de perto (a janela MINI do mundo de 1000 × 600): a capivara DJ de fone e
  //   óculos na mesa de som e a coelhinha dançando do lado, com notinhas subindo dos toca-discos;
  // - o mesmo ritmo do telão (ritmoPasso). Os dois nunca rodam juntos: com o telão aberto a telinha para e solta o som;
  // - nítida no celular e no tablet: pintada com devicePixelRatio até 2; no tablet Fire velho (ou aparelho fraco, ou
  //   se o desenho demorar) 30 quadros por segundo e devicePixelRatio 1;
  // - o laço só roda com a telinha ligada (rádio tocando), a aba à vista e o telão fechado;
  // - vídeo de IA: CLIPES_VIDEO.telinha (lá em cima). Com internet, toca por cima do desenho, sem som e em laço.
  // ======================================================================
  var nv = raiz.navigator || {};
  var LEVE = /Silk\/|; KF[A-Z]{2,6}\b|\bKF[A-Z]{2,6} Build/.test(nv.userAgent || '') || (nv.hardwareConcurrency > 0 && nv.hardwareConcurrency <= 2) ||
    (nv.deviceMemory > 0 && nv.deviceMemory <= 2) || /[?&]leve\b/.test(raiz.location.search);
  var MINI = { x: 296, y: 196, w: 630 };   // a janela (16:9) da Festa na piscina que a telinha mostra
  var MINI_COELHA = { tipo: 'coelha', cor: '#fbf4ff', barriga: '#ffffff', x: 742, y: 534, s: 0.92, danca: 'balanca', atraso: 0.06, vez: 12, esp: 'gira',
    roupa: 'maio', acc: { oculos: 'rosa', forma: 'coracao', flor: '#ffd84a' }, pe: '#ffe3f0' };
  var NOTAS = ['#c6ff3d', '#ff4fa3', '#3ee8ff', '#ffd84a'];
  var tl = null;

  function notinha(c, x, y, r, cor, al) {   // ♪ desenhada (sem depender de fonte)
    c.globalAlpha = al; c.lineCap = 'round';
    liso(c, cor, x, y, r, r * 0.78, -0.4);
    c.beginPath(); c.moveTo(x + r * 0.85, y - r * 0.2); c.lineTo(x + r * 0.85, y - r * 3.2); c.quadraticCurveTo(x + r * 2, y - r * 2.6, x + r * 2.1, y - r * 1.6);
    c.lineWidth = r * 0.5; c.strokeStyle = cor; c.stroke();
    c.globalAlpha = 1;
  }
  function telinhaCena(c, R) {
    if (!R.calmo) for (var i = 0; i < 4; i++) { var a = (Math.sin(R.t * 1.7 + i * 2.1) + 1) / 2; c.fillStyle = 'rgba(255,255,255,' + (a * 0.7).toFixed(2) + ')'; estrela(c, 360 + i * 150 + (i % 2) * 30, 340 + (i % 3) * 30, 5 + a * 4, 4, 0.3); c.fill(); }
    bolinhoBoia(c, 640, 372 + Math.sin(R.t * 1.2 + 1) * 3, 0.6);
    bicho(c, MINI_COELHA, R);
    djNaMesa(c, PISCINA.dj, R, 500, 452, 330);
    if (!R.calmo && R.tocando) for (var k = 0; k < 4; k++) {   // notinhas subindo dos toca-discos
      var f = (R.t * 0.45 + k / 4) % 1, lado = k % 2 ? 1 : -1;
      notinha(c, 500 + lado * 99 + Math.sin(f * 5 + k) * 14, 430 - f * 190, 8, NOTAS[k], Math.sin(f * Math.PI) * 0.9);
    }
  }
  function tlMedir() {
    var w = tl.caixa.clientWidth, h = tl.caixa.clientHeight;
    if (!w || !h) return false;
    tl.dpr = Math.min(raiz.devicePixelRatio || 1, tl.lento ? 1 : 2);
    tl.cv.width = tl.bg.width = Math.max(1, Math.round(w * tl.dpr)); tl.cv.height = tl.bg.height = Math.max(1, Math.round(h * tl.dpr));
    var k = w / MINI.w;
    tl.V = { w: w, h: h, k: k, L: MINI.x, R: MINI.x + MINI.w, T: MINI.y, B: MINI.y + h / k };
    tl.pronto = false; tl.mw = w; tl.mh = h;
    return true;
  }
  function tlTransformar(c) { var k = tl.V.k * tl.dpr; c.setTransform(k, 0, 0, k, -MINI.x * k, -MINI.y * k); }
  function tlQuadro(agora) {
    tl.raf = 0;
    if (!tl.rodando) return;
    tl.raf = raiz.requestAnimationFrame(tlQuadro);
    if (tl.meia && agora - tl.ultimoDesenho < 31) return;   // 30 quadros por segundo
    var t = agora / 1000, dt = tl.ultimoT ? Math.min(0.1, Math.max(0.001, t - tl.ultimoT)) : 0.016;
    tl.ultimoT = t; tl.ultimoDesenho = agora;
    var R = ritmoPasso(dt, t);
    if (tl.caixa.classList.contains('com-video')) return;   // o vídeo está tocando: o desenho descansa
    if (!tl.V || tl.caixa.clientWidth !== tl.mw || tl.caixa.clientHeight !== tl.mh) { if (!tlMedir()) return; }
    var ini = raiz.performance ? performance.now() : 0, ret = RET;
    RET = false;
    if (!tl.pronto) {
      tl.bgc.setTransform(1, 0, 0, 1, 0, 0); tl.bgc.clearRect(0, 0, tl.bg.width, tl.bg.height);
      tlTransformar(tl.bgc); PISCINA.fundo(tl.bgc, tl.V); gcDe = null; tl.pronto = true;
    }
    var c = tl.c;
    c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(tl.bg, 0, 0);
    tlTransformar(c); telinhaCena(c, R);
    RET = ret;
    if (raiz.performance && !tl.lento) {   // aparelho que não dá conta: 30 quadros por segundo e 1×
      var gasto = performance.now() - ini; tl.nQ++;
      tl.media += (gasto - tl.media) * 0.1;
      if (tl.nQ > 45 && tl.media > 9) { tl.lento = tl.meia = true; tlMedir(); }
    }
  }
  function tlVideo() {
    var l = CLIPES_VIDEO.telinha;
    if (tl.video || tl.semVideo || !l || !l.length || nv.onLine === false) return;
    var v = tl.video = d.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.addEventListener('playing', function () { tl.caixa.classList.add('com-video'); });
    v.addEventListener('error', function () {   // não abriu: fica o desenho (e não tenta de novo até recarregar a página)
      tl.semVideo = true; tl.caixa.classList.remove('com-video');
      try { v.removeAttribute('src'); v.load(); } catch (e) { /* ok */ }
      if (v.parentNode) v.parentNode.removeChild(v);
      tl.video = null;
    });
    v.src = l[0];
    tl.caixa.appendChild(v);
  }
  // liga ou para o laço conforme o momento: telinha ligada, aba à vista e telão fechado
  function tlAtualizar() {
    if (!tl) return;
    var deve = tl.ligada && !d.hidden && !aberto;
    if (deve === tl.rodando) return;
    tl.rodando = deve;
    if (deve) {
      ligarRitmo(tl.audio);
      tlVideo();
      if (tl.video) { var p = tl.video.play(); if (p && p.catch) p.catch(function () {}); }
      tl.ultimoT = 0; tl.raf = raiz.requestAnimationFrame(tlQuadro);
    } else {
      if (tl.raf) raiz.cancelAnimationFrame(tl.raf);
      tl.raf = 0;
      if (tl.video) try { tl.video.pause(); } catch (e) { /* ok */ }
      desligarRitmo();   // solta o som (o telão, ao abrir, liga o dele logo depois)
    }
  }
  function telinha(caixa, audio) {
    if (tl) return tl.api;
    var cv = d.createElement('canvas'), bg = d.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    caixa.appendChild(cv);
    tl = { caixa: caixa, audio: audio, cv: cv, c: cv.getContext('2d'), bg: bg, bgc: bg.getContext('2d'), video: null, semVideo: false,
      ligada: false, rodando: false, raf: 0, V: null, dpr: 1, pronto: false, mw: 0, mh: 0, ultimoT: 0, ultimoDesenho: 0,
      lento: LEVE, meia: LEVE, media: 0, nQ: 0 };
    d.addEventListener('visibilitychange', tlAtualizar);
    tl.api = {
      ligar: function () { tl.ligada = true; tlAtualizar(); },
      desligar: function () { tl.ligada = false; tlAtualizar(); }
    };
    return tl.api;
  }

  raiz.BolinhoClipe = {
    abrir: abrir,
    fechar: function () { fechar(); },
    aberto: function () { return aberto; },
    cena: function (n) { if (aberto) { trocar(n); fade = 0; } },
    telinha: telinha
  };
})(window);
