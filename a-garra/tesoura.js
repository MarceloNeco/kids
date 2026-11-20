/* H-rraaa (pasta a-garra) — a máquina da Tesoura (dono, 19/Nov/2026: "aquele que só tem um boneco grande"), como a da foto:
   um boneco grande pendurado por um fio; SEGURANDO o botão, a tesoura anda pelo trilho; SOLTANDO, ela corta ali. Se
   cortar em cima do fio, o boneco cai e a portinha abre. O fio balança um pouquinho (mais no difícil).
   A regra é a mesma da garra (maquina.js): bem em cima do fio, a tesoura só corta de vez quando chega a vez (sorteada:
   fácil 2–3 tentativas, médio 2–4, difícil 3–5) ou com 15% de sorte; nas outras ela corta só um fiapo ("Quase!").
   Sem desenho: roda no navegador (window.Tesoura) e no Node (teste/tesoura.test.js).

   Uso:
     var t = Tesoura.nova({ nivel: 'medio', tipos: ['ursa-vestido', ...], raro: '...', semente: 7, semGanhar: 0 });
     t.apertar()   segurou o botão (na fase 'mirar'): gasta a ficha e a tesoura anda   t.soltar()  soltou: corta
     t.passo(dt)   anda dt segundos
     t.fase        'mirar' 'andar' 'cortar' 'cair' 'voltar' 'fim'
     t.x           onde a tesoura está no trilho (TRILHO.x0 .. TRILHO.x1)    t.fioX()  onde o fio está agora
     t.premio      { tipo, y (altura; cai ao ganhar), fiapos (3 = fio inteiro) }    t.porta (0 fechada a 1 aberta)
     t.eventos     { tipo: 'ficha' | 'cortou' | 'quase' | 'errou' | 'ganhou' | 'tique' | 'tempoAcabou' | 'fim' } */
(function (raiz) {
  'use strict';
  var TRILHO = { x0: -1.7, x1: 1.7 }, ALTO = 3.75;   // o trilho da tesoura e a altura do boneco pendurado
  // tol: quão perto do fio é "em cima" (metade da largura das lâminas); vel: tesoura; balanco: o fio vai e volta
  var NIVEIS = {
    facil: { fichas: 10, tempo: 60, tol: 0.16, vel: 0.9, balanco: 0.08, cada: [2, 3] },
    medio: { fichas: 8, tempo: 60, tol: 0.11, vel: 1.2, balanco: 0.16, cada: [2, 4] },
    dificil: { fichas: 8, tempo: 60, tol: 0.07, vel: 1.5, balanco: 0.26, cada: [3, 5] }
  };
  function sorteador(semente) {   // mulberry32, igual ao da maquina.js
    var s = (semente >>> 0) || 1;
    return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function nova(op) {
    op = op || {};
    var nivel = NIVEIS[op.nivel] ? op.nivel : 'facil', cfg = Object.assign({}, NIVEIS[nivel], op.ajustes || {});
    var rnd = sorteador(op.semente != null ? op.semente : Math.floor(Math.random() * 1e9));
    var tipos = (op.tipos && op.tipos.length) ? op.tipos : ['boneco'];
    var t = { nivel: nivel, cfg: cfg, fase: 'mirar', fichas: cfg.fichas, tempo: cfg.tempo, t: 0, x: TRILHO.x0, ganhos: [], eventos: [], semGanhar: op.semGanhar || 0,
      porta: 0, premio: null, trilho: TRILHO, alto: ALTO, _rnd: rnd, _tique: -1, _f: 0, _segura: false };
    t._meta = sortear();
    function sortear() { var c = cfg.cada; return c[0] + Math.floor(rnd() * (c[1] - c[0] + 1)); }
    // um boneco novo pendurado, num lugar sorteado do trilho; o raro aparece de vez em quando
    function pendurar() {
      var tipo = op.raro && rnd() < 0.12 ? op.raro : tipos[Math.floor(rnd() * tipos.length)];
      t.premio = { tipo: tipo, y: ALTO, vy: 0, fiapos: 3, base: -0.9 + rnd() * 1.8, fase: rnd() * 6 };
    }
    pendurar();
    t.fioX = function () { var p = t.premio; return p.base + Math.sin(t.t * 1.7 + p.fase) * cfg.balanco; };
    t.apertar = function () {
      if (t.fase !== 'mirar') return false;
      t.fichas--; t.fase = 'andar'; t._segura = true; t.eventos.push({ tipo: 'ficha', fichas: t.fichas });
      return true;
    };
    t.soltar = function () { if (t.fase === 'andar') { t._segura = false; cortar(); } };
    function cortar() {
      t.fase = 'cortar'; t._f = 0; t.semGanhar++;
      var d = Math.abs(t.x - t.fioX()), p = t.premio;
      if (d <= cfg.tol) {
        var vez = t.semGanhar >= t._meta || rnd() < 0.15 || cfg.sempre;
        if (cfg.nunca) vez = false;
        if (vez) { p.fiapos = 0; t._resultado = 'cortou'; }
        else { p.fiapos = Math.max(1, p.fiapos - 1); t._resultado = 'quase'; }
      } else t._resultado = d <= cfg.tol * 2.5 ? 'raspou' : 'errou';
    }
    t.passo = function (dt) {
      dt = Math.min(dt, 0.05); t.t += dt;
      var p = t.premio;
      if (t.fase === 'mirar' && cfg.tempo) {
        t.tempo = Math.max(0, t.tempo - dt);
        var s = Math.ceil(t.tempo);
        if (s <= 10 && s !== t._tique && t.tempo > 0) { t._tique = s; t.eventos.push({ tipo: 'tique', s: s }); }
        if (t.tempo <= 0) { t.eventos.push({ tipo: 'tempoAcabou' }); t.apertar(); t._segura = false; cortar(); }   // o tempo acabou: corta onde está
      } else if (t.fase === 'andar') {
        t.x = Math.min(TRILHO.x1, t.x + cfg.vel * dt);
        if (t.x >= TRILHO.x1) { t._segura = false; cortar(); }   // chegou no fim do trilho: corta lá
      } else if (t.fase === 'cortar') {
        t._f += dt;
        if (t._f >= 0.45) {
          var r = t._resultado;
          t.eventos.push({ tipo: r === 'raspou' ? 'errou' : r, premio: p.tipo, perto: r === 'raspou' });
          if (r === 'cortou') { t.fase = 'cair'; t._f = 0; } else { t.fase = 'voltar'; t._f = 0; }
        }
      } else if (t.fase === 'cair') {
        t._f += dt;
        t.porta = Math.min(1, t._f / 0.5);
        p.vy -= 20 * dt; p.y += p.vy * dt;
        if (p.y < -2.6 && !p.ganho) {
          p.ganho = true; t.ganhos.push(p.tipo); t.semGanhar = 0; t._meta = sortear();
          t.eventos.push({ tipo: 'ganhou', premio: p.tipo, total: t.ganhos.length });
        }
        if (t._f > 2.2) { t.porta = 0; pendurar(); t.fase = 'voltar'; t._f = 0; }
      } else if (t.fase === 'voltar') {
        t._f += dt;
        t.x = Math.max(TRILHO.x0, t.x - 2.5 * dt);
        if (t.x <= TRILHO.x0 && t._f > 0.4) {
          if (!t.fichas) { t.fase = 'fim'; t.eventos.push({ tipo: 'fim', ganhos: t.ganhos.length }); }
          else { t.fase = 'mirar'; t.tempo = cfg.tempo; t._tique = -1; }
        }
      }
    };
    return t;
  }
  var T = { nova: nova, NIVEIS: NIVEIS, TRILHO: TRILHO, ALTO: ALTO };
  if (typeof module !== 'undefined' && module.exports) module.exports = T; else raiz.Tesoura = T;
})(typeof self !== 'undefined' ? self : this);
