/* Meu Amiguinho — a pelúcia viva. Desenha o amiguinho (arte.js) numa caixa e anima as partes com pivô
   (corpo, cabeça, orelhas, braços, patas, rabo, olhos, a telinha do robozinho) com curvas suaves, sem saltos:
   - sempre: respira, pisca de vez em quando, balança de leve as orelhas e o rabo; dança no ritmo quando a música toca;
   - ao tocar: abraço (aperta e solta), acena, dá um pulinho, balança a cabeça; os de 4 patas andam (patas alternadas,
     corpo balançando, viram para voltar) e rolam; a preguiça pendurada balança no galho;
   - robozinho: a telinha de LED troca de expressão sozinha (a cada ~3,5 s), acende em onda, mexe a boca quando fala e
     faz ondinhas de equalizador com a música.
   Leve: ~30 quadros por segundo no aparelho fraco, nada quando a caixa está escondida; com "reduzir movimento" só pisca.
   Uso: var v = AmiguinhoVivo.criar(caixa, amigo, { id, pose }); v.tocar(); v.acao('pulinho'); v.falando(true); v.trocar(amigo); v.parar(). */
(function (raiz) {
  'use strict';
  var A = raiz.AmiguinhoArte;
  var calmo = !!(raiz.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var fraco = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 2;
  function suave(u) { return u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u); }
  function sino(u) { return Math.sin(Math.PI * Math.max(0, Math.min(1, u))); }
  function num(v) { return Math.round(v * 100) / 100; }

  // as ações: duração (s) e o que cada parte faz em u ∈ [0, 1]
  var ACOES = {
    abraco: { d: 0.9, f: function (u, P) { var s = Math.sin(Math.PI * 2 * u) * (1 - u) + sino(u) * 0.4; P.corpo.sy -= 0.11 * s; P.corpo.sx += 0.09 * s; P.b0 -= 28 * sino(u); P.b1 += 28 * sino(u); P.cab.r += 4 * Math.sin(u * 4 * Math.PI) * (1 - u); } },
    acenar: { d: 1.6, f: function (u, P) { var env = Math.pow(sino(u), 0.5); P.b1 += -115 * env + 20 * Math.sin(u * 7 * Math.PI) * env; P.cab.r += 6 * env; } },
    pulinho: { d: 0.8, f: function (u, P) { var y = sino(u); P.corpo.y -= 38 * y; var sq = u < 0.15 ? sino(u / 0.15) : u > 0.85 ? sino((u - 0.85) / 0.15) : 0; P.corpo.sy -= 0.12 * sq; P.corpo.sx += 0.08 * sq; P.corpo.sy += 0.05 * y * (u > 0.15 && u < 0.85 ? 1 : 0); P.b0 -= 40 * y; P.b1 += 40 * y; P.rabo += 20 * y; } },
    cabeca: { d: 1.0, f: function (u, P) { P.cab.r += 11 * Math.sin(u * 4 * Math.PI) * (1 - u); P.orelhas += 8 * Math.sin(u * 4 * Math.PI + 1) * (1 - u); } },
    rolar: { d: 1.4, f: function (u, P) { P.corpo.r += 360 * suave(u); P.corpo.y -= 30 * sino(u); } },
    andar: { d: 4.2, f: function (u, P) {
      // vai para a esquerda, vira, volta para a direita, vira de novo (a cabeça é de frente: virar é espelhar o corpo)
      var ida = u < 0.45, vira1 = u >= 0.45 && u < 0.55, volta = u >= 0.55 && u < 0.95, x;
      if (ida) x = -70 * suave(u / 0.45); else if (vira1) x = -70; else if (volta) x = -70 + 70 * suave((u - 0.55) / 0.4); else x = 0;
      P.corpo.x += x;
      var dir = u < 0.45 ? 1 : u < 0.55 ? Math.cos(Math.PI * (u - 0.45) / 0.1) : u < 0.95 ? -1 : -Math.cos(Math.PI * (u - 0.95) / 0.05);
      P.corpo.sx *= dir;
      var andando = ida || volta, fase = u * 2 * Math.PI * 9;
      if (andando) { P.p[0] += 20 * Math.sin(fase); P.p[3] += 20 * Math.sin(fase); P.p[1] += 20 * Math.sin(fase + Math.PI); P.p[2] += 20 * Math.sin(fase + Math.PI); P.corpo.y -= 3 * Math.abs(Math.sin(fase)); P.cab.r += 2 * Math.sin(fase); P.rabo += 14 * Math.sin(fase * 0.5); }
    } },
    balanco: { d: 2.6, f: function (u, P) { P.corpo.r += 9 * Math.sin(u * 4 * Math.PI) * (1 - u * 0.6); } }
  };

  function criar(caixa, amigo, op) {
    op = op || {};
    var v = { amigo: amigo, acoes: [], fim: false, falandoAgora: false }, partes = null, t0 = performance.now(), proxPisca = 2, piscaT = -1;
    var expr = 'feliz', proxExpr = 3.5, falaT = 0, eqT = 0, ultimo = 0, robo = false, geo = null, ultimaExpr = '';
    var DANCA = op.danca !== false;
    function montar() {
      caixa.innerHTML = A.svg(v.amigo, { id: op.id || 'viva', anim: true, pose: op.pose, rotulo: op.rotulo });
      var svg = caixa.querySelector('svg');
      var pega = function (sel) { return [].slice.call(svg.querySelectorAll(sel)); };
      partes = { svg: svg, corpo: pega('.ma-respira')[0], cab: pega('.ma-cabeca')[0], orelhas: pega('.ma-orelhas'), b: pega('.ma-braco'), p: pega('.ma-pata'), rabo: pega('.ma-rabo')[0], olhos: pega('.ma-olho'), tela: pega('.ma-tela')[0] };
      partes.olhosC = partes.olhos.map(function (o) { try { var b = o.getBBox(); return [b.x + b.width / 2, b.y + b.height / 2]; } catch (e) { return [150, 130]; } });
      robo = v.amigo.base === 'robo' && !!partes.tela;
      geo = A.geo(v.amigo.base, v.amigo.corpo, op.pose, v.amigo);
      ultimaExpr = '';
      if (robo) mostrarExpr(v.amigo.expressao || 'feliz', true);
    }
    function piv(el) { return [parseFloat(el.getAttribute('data-px')) || 150, parseFloat(el.getAttribute('data-py')) || 200]; }
    function aplicar(el, x, y, r, sx, sy) {
      if (!el) return;
      var p = piv(el), t = '';
      if (x || y) t += 'translate(' + num(x) + ' ' + num(y) + ') ';
      if (r) t += 'rotate(' + num(r) + ' ' + p[0] + ' ' + p[1] + ') ';
      if ((sx != null && sx !== 1) || (sy != null && sy !== 1)) t += 'translate(' + p[0] + ' ' + p[1] + ') scale(' + num(sx == null ? 1 : sx) + ' ' + num(sy == null ? 1 : sy) + ') translate(' + (-p[0]) + ' ' + (-p[1]) + ')';
      el.setAttribute('transform', t);
    }
    function mostrarExpr(e, onda) {
      if (!partes || !partes.tela || e === ultimaExpr) return;
      ultimaExpr = e;
      partes.tela.innerHTML = A.telaLed(e, geo, onda !== false && !calmo);
    }
    v.expressao = function (e) { expr = e; proxExpr = (performance.now() - t0) / 1000 + 4; mostrarExpr(e); };
    function quadro(agora) {
      if (v.fim) return;
      requestAnimationFrame(quadro);
      if (fraco && agora - ultimo < 32) return;
      if (!caixa.offsetParent && caixa.getClientRects().length === 0) return;   // escondida: não gasta nada
      ultimo = agora;
      var t = (agora - t0) / 1000;
      var P = { corpo: { x: 0, y: 0, r: 0, sx: 1, sy: 1 }, cab: { r: 0 }, orelhas: 0, b0: 0, b1: 0, p: [0, 0, 0, 0], rabo: 0, olho: 1 };
      if (!calmo) {
        var resp = Math.sin(t * 2 * Math.PI / 3.2);
        P.corpo.sy += 0.012 * resp; P.corpo.sx -= 0.006 * resp;
        P.cab.r += 1.6 * Math.sin(t * 2 * Math.PI / 5.3);
        P.orelhas += 2.2 * Math.sin(t * 2 * Math.PI / 2.7);
        P.rabo += 7 * Math.sin(t * 2 * Math.PI / 1.7);
        P.b0 += 1.5 * Math.sin(t * 2 * Math.PI / 3.2 + 0.4); P.b1 -= 1.5 * Math.sin(t * 2 * Math.PI / 3.2 + 0.4);
        if (DANCA && raiz.Trilha && Trilha.tocando && Trilha.tocando()) {   // dança no ritmo (~116 batidas por minuto)
          var b = t * 2 * Math.PI * (116 / 60) / 2;
          P.corpo.r += 3.5 * Math.sin(b); P.corpo.y -= 4 * Math.abs(Math.sin(b)); P.cab.r += 4 * Math.sin(b + 0.6); P.b0 -= 14 * Math.max(0, Math.sin(b)); P.b1 += 14 * Math.max(0, -Math.sin(b)); P.rabo += 14 * Math.sin(b * 2);
        }
      }
      // piscar (sempre, até com "reduzir movimento")
      if (t > proxPisca) { piscaT = t; proxPisca = t + 2.6 + Math.random() * 2.8; }
      if (piscaT >= 0) { var pu = (t - piscaT) / 0.2; if (pu >= 1) piscaT = -1; else P.olho = 1 - 0.9 * sino(pu); }
      // ações em andamento (somam: dá para abraçar e balançar a cabeça ao mesmo tempo)
      v.acoes = v.acoes.filter(function (a) { var u = (t - a.t) / a.d; if (u >= 1) return false; if (!calmo) ACOES[a.n].f(u, P); return true; });
      if (v.falandoAgora && !calmo) P.cab.r += 2.5 * Math.sin(t * 14);
      // aplica
      aplicar(partes.corpo, P.corpo.x, P.corpo.y, P.corpo.r, P.corpo.sx, P.corpo.sy);
      aplicar(partes.cab, 0, 0, P.cab.r);
      partes.orelhas.forEach(function (o) { aplicar(o, 0, 0, P.orelhas); });
      partes.b.forEach(function (b, k) { aplicar(b, 0, 0, k ? P.b1 : P.b0); });
      partes.p.forEach(function (p) { aplicar(p, 0, 0, P.p[+p.getAttribute('data-i')] || 0); });
      aplicar(partes.rabo, 0, 0, P.rabo);
      partes.olhos.forEach(function (o, i) { var c = partes.olhosC[i]; o.setAttribute('transform', P.olho < 0.999 ? 'translate(' + c[0] + ' ' + c[1] + ') scale(1 ' + num(P.olho) + ') translate(' + (-c[0]) + ' ' + (-c[1]) + ')' : ''); });
      // telinha de LED do robozinho
      if (robo) {
        if (v.falandoAgora) { if (t - falaT > 0.16) { falaT = t; mostrarExpr(ultimaExpr === 'fala' ? 'feliz' : 'fala', false); } }
        else if (!calmo && raiz.Trilha && Trilha.tocando && Trilha.tocando()) { if (t - eqT > 0.22) { eqT = t; mostrarExpr(['eq1', 'eq2', 'eq3'][Math.floor(t * 4.5) % 3], false); } }
        else if (t > proxExpr) {
          var seq = ['feliz', 'piscando', 'sorriso', 'estrela', 'feliz', 'girando1', 'girando2', 'coracao', 'surpresa', 'feliz'];
          expr = seq[(seq.indexOf(expr) + 1) % seq.length];
          proxExpr = t + (expr === 'girando1' ? 0.35 : expr === 'piscando' ? 0.5 : calmo ? 8 : 3.5);
          mostrarExpr(expr);
        }
      }
    }
    v.acao = function (n) {
      if (!ACOES[n]) return false;
      var t = (performance.now() - t0) / 1000;
      if (v.acoes.some(function (a) { return a.n === n; })) return false;
      v.acoes.push({ n: n, t: t, d: ACOES[n].d });
      return true;
    };
    var roda = 0;
    // o toque: cada toque, uma reação diferente
    v.tocar = function () {
      var q = v.amigo.corpo === 'q', lista = op.pose === 'pendurada' ? ['balanco', 'cabeca'] : q ? ['abraco', 'pulinho', 'andar', 'cabeca', 'rolar'] : ['abraco', 'acenar', 'pulinho', 'cabeca'];
      var n = lista[roda++ % lista.length];
      v.acao(n);
      if (robo) v.expressao(roda % 2 ? 'coracao' : 'estrela');
      return n;
    };
    v.falando = function (sim) { v.falandoAgora = !!sim; if (!sim && robo) mostrarExpr('feliz', false); };
    v.trocar = function (a, novoOp) { v.amigo = a; if (novoOp) op = Object.assign(op, novoOp); montar(); };
    v.parar = function () { v.fim = true; };
    v.emAcao = function () { return v.acoes.length > 0; };
    montar();
    requestAnimationFrame(quadro);
    return v;
  }
  raiz.AmiguinhoVivo = { criar: criar, ACOES: Object.keys(ACOES) };
})(typeof window !== 'undefined' ? window : globalThis);
