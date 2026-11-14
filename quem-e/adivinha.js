/* Quem é? — A Meleca Adivinha: o motor, sem tela (roda no Node para os testes).

   A pessoa pensa em alguém e responde: 's' Sim · 'p' Provavelmente sim · '?' Não sei · 'q' Provavelmente não · 'n' Não.
   Cada personagem guarda a resposta "certa" das perguntas que conhece (personagens/*.js); o que não tem guardado vale
   o padrão da pergunta (quase sempre '?', e 'n' nas perguntas de turma).

   COMO A MELECA PENSA:
   - Cada personagem tem uma chance. A cada resposta, a chance é multiplicada por quanto a resposta combina com a dele,
     SEMPRE com uma sobra: resposta errada da criança derruba, mas não elimina. "Não sei" não muda nada.
   - A próxima pergunta é a que mais divide os mais prováveis (ganho de informação), entre as perguntas do nível que
     ainda não foram feitas.
   - Chuta quando o primeiro está bem à frente (chance ≥ 85% e 3 vezes o segundo), ou ao chegar em 20, 30 e 40
     perguntas. Errou o chute: aquele sai da disputa e ela continua. Depois de 4 chutes errados (ou 50 perguntas),
     ela perde e pede para aprender ("Em quem você pensou?").

   QEAdivinha.carregar(listas, perguntas) → base { personagens, perguntas }   (listas = arrays no formato de personagens/)
   QEAdivinha.criar({ base, nivel: 'I'|'F'|'A', extras: [personagens aprendidos], rnd }) → jogo
     jogo.proxima() → { tipo: 'pergunta', id } | { tipo: 'chute', personagem } | { tipo: 'perdi' }
     jogo.responder(resposta) · jogo.chuteErrado() · jogo.desfazer() · jogo.historico() → [{ id, r }]
     jogo.estado() → { perguntas, chutes } · jogo.chances() (para os testes) */
(function (raiz) {
  'use strict';
  var VALOR = { s: 1, p: 0.75, '?': 0.5, q: 0.25, n: 0 };
  // só as 5 respostas valem (nada de "constructor", "toString"… que todo objeto tem escondido)
  function valor(x) { return Object.prototype.hasOwnProperty.call(VALOR, x) ? VALOR[x] : null; }
  var ORDEM = { I: 0, F: 1, A: 2 };
  var SOBRA = 0.12, TOPO = 90, CERTEZA = 0.85, FOLGA = 3, MAX_CHUTES = 4, MAX_PERGUNTAS = 50, MARCOS = [20, 30, 40];

  function respostas(txt) {
    var r = {};
    String(txt || '').trim().split(/\s+/).forEach(function (par) { var i = par.indexOf(':'); if (i > 0) r[par.slice(0, i)] = par.slice(i + 1); });
    return r;
  }
  function carregar(listas, perguntas) {
    var personagens = [];
    listas.forEach(function (l) { (l || []).forEach(function (e) { personagens.push({ id: e[0], nome: e[1], emoji: e[2], niveis: e[3], r: respostas(e[4]) }); }); });
    return { personagens: personagens, perguntas: perguntas };
  }

  // quanto a resposta u (0..1) combina com o valor v (0..1) do personagem
  function combina(u, v) { var d = 1 - Math.abs(u - v); return SOBRA + (1 - SOBRA) * d * d; }

  function criar(op) {
    var base = op.base, nivel = op.nivel || 'F', rnd = op.rnd || Math.random;
    var ps = base.perguntas.filter(function (p) { return ORDEM[p.n] <= ORDEM[nivel]; });
    var cand = base.personagens.concat(op.extras || []).filter(function (c) { return String(c.niveis).indexOf(nivel) >= 0; });
    var n = cand.length;
    // matriz de valores: val[i][k] = valor do personagem i na pergunta k
    var val = cand.map(function (c) { return ps.map(function (p) { var x = Object.prototype.hasOwnProperty.call(c.r, p.id) ? valor(c.r[p.id]) : null; return x === null ? VALOR[p.padrao] : x; }); });
    var log = []; for (var i = 0; i < n; i++) log.push(0);
    var fora = []; for (i = 0; i < n; i++) fora.push(false);
    var feitas = {}, hist = [], atual = null, chutes = 0, ultimoChute = 0, estadoSalvo = [];

    function probs() {
      var mx = -Infinity, i, out = [], soma = 0;
      for (i = 0; i < n; i++) if (!fora[i] && log[i] > mx) mx = log[i];
      for (i = 0; i < n; i++) { var x = fora[i] ? 0 : Math.exp(log[i] - mx); out.push(x); soma += x; }
      for (i = 0; i < n; i++) out[i] = soma ? out[i] / soma : 0;
      return out;
    }
    function ordenados(pr) { var idx = []; for (var i = 0; i < n; i++) if (!fora[i]) idx.push(i); idx.sort(function (a, b) { return pr[b] - pr[a]; }); return idx; }
    function entropia(ws) { var s = 0, h = 0, i; for (i = 0; i < ws.length; i++) s += ws[i]; if (!s) return 0; for (i = 0; i < ws.length; i++) if (ws[i] > 0) { var q = ws[i] / s; h -= q * Math.log(q); } return h; }

    function melhorPergunta(pr, topo) {
      var melhor = null, melhorG = -1, empates = [];
      for (var k = 0; k < ps.length; k++) {
        if (feitas[ps[k].id]) continue;
        var pSim = 0, tot = 0, wS = [], wN = [], w = [];
        for (var t = 0; t < topo.length; t++) { var i = topo[t], v = val[i][k]; w.push(pr[i]); tot += pr[i]; pSim += pr[i] * v; wS.push(pr[i] * combina(1, v)); wN.push(pr[i] * combina(0, v)); }
        if (!tot) continue;
        pSim /= tot;
        var g = entropia(w) - (pSim * entropia(wS) + (1 - pSim) * entropia(wN));
        if (g > melhorG + 1e-9) { melhorG = g; empates = [ps[k].id]; } else if (Math.abs(g - melhorG) <= 1e-9) empates.push(ps[k].id);
      }
      if (empates.length) melhor = empates[Math.floor(rnd() * empates.length)];
      return melhorG > 1e-6 ? melhor : null;
    }

    var jogo = {
      proxima: function () {
        if (atual) return atual;
        var pr = probs(), ord = ordenados(pr);
        if (!ord.length || chutes >= MAX_CHUTES || hist.length >= MAX_PERGUNTAS) return (atual = { tipo: 'perdi' });
        var p1 = pr[ord[0]], p2 = ord.length > 1 ? pr[ord[1]] : 0, q = hist.length;
        var marco = MARCOS.some(function (m) { return q >= m && ultimoChute < m; });
        var certo = p1 >= CERTEZA && p1 >= FOLGA * p2 && q - ultimoChute >= 1;
        var id = melhorPergunta(pr, ord.slice(0, TOPO));
        if (certo || marco || !id || ord.length === 1) {
          if (marco) ultimoChute = q; else ultimoChute = Math.max(ultimoChute, q);
          return (atual = { tipo: 'chute', personagem: cand[ord[0]], idx: ord[0] });
        }
        return (atual = { tipo: 'pergunta', id: id });
      },
      responder: function (r) {
        if (!atual || atual.tipo !== 'pergunta' || valor(r) === null) return false;
        var k = -1; for (var j = 0; j < ps.length; j++) if (ps[j].id === atual.id) k = j;
        estadoSalvo.push({ log: log.slice() });
        if (r !== '?') { var u = VALOR[r]; for (var i = 0; i < n; i++) log[i] += Math.log(combina(u, val[i][k])); }
        feitas[atual.id] = true; hist.push({ id: atual.id, r: r }); atual = null;
        return true;
      },
      chuteErrado: function () {
        if (!atual || atual.tipo !== 'chute') return false;
        fora[atual.idx] = true; chutes++; atual = null;
        return true;
      },
      desfazer: function () {
        if (!hist.length) return false;
        var h = hist.pop(), s = estadoSalvo.pop();
        // chute errado é um fato, não uma resposta: quem já foi chutado e errado continua fora, e o chute continua contado
        delete feitas[h.id]; log = s.log; atual = { tipo: 'pergunta', id: h.id };
        return true;
      },
      historico: function () { return hist.map(function (h) { return { id: h.id, r: h.r }; }); },
      estado: function () { return { perguntas: hist.length, chutes: chutes + (atual && atual.tipo === 'chute' ? 1 : 0) }; },
      chances: function () { return probs().map(function (x) { return Math.round(x * 1e6) / 1e6; }); },
      melhores: function (k) { var pr = probs(); return ordenados(pr).slice(0, k || 5).map(function (i) { return { personagem: cand[i], chance: pr[i] }; }); }
    };
    return jogo;
  }

  var API = { carregar: carregar, criar: criar, respostas: respostas, VALOR: VALOR };
  raiz.QEAdivinha = API;
  if (typeof module === 'object' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
