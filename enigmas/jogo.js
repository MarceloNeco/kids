/* Enigmatic — regras do jogo, sem tela (funciona no navegador e no Node, para os testes).
   - Lê as rodadas escritas no rodadas.js ('emoji palavra|word = emoji palavra|word').
   - Escolhe a próxima rodada: nunca repete uma rodada antes de passar por todas do nível; sorteia entre as
     próximas JANELA ainda não feitas, na ordem do arquivo (então a dificuldade sobe aos poucos).
   - Partida: embaralha os dois lados (ninguém fica na frente do seu par) e confere cada ligação.
   Cada par tem um número (a ordem no rodadas.js); um item da esquerda combina com o da direita de mesmo número. */
(function (raiz) {
  'use strict';
  var J = {};
  J.JANELA = 4;

  // código curto e estável da rodada (para lembrar quais já foram feitas)
  function codigo(txt) {
    var h = 5381;
    for (var i = 0; i < txt.length; i++) h = ((h * 33) ^ txt.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  J.item = function (txt) {
    var s = String(txt).trim(), i = s.indexOf(' ');
    var e = s.slice(0, i), w = s.slice(i + 1).split('|');
    return { e: e === '_' ? '' : e, pt: (w[0] || '').trim(), en: (w[1] || '').trim() };
  };

  J.rodada = function (cru, nivel) {
    var d = cru[0], so = null, m = /^(pt|en):/.exec(d);
    if (m) { so = m[1]; d = d.slice(3); }
    var dd = d.split('|');
    var pares = cru.slice(1).map(function (p) {
      var lr = p.split(' = ');
      return [J.item(lr[0]), J.item(lr[1])];
    });
    return { id: nivel + '-' + codigo(cru.join('/')), nivel: nivel, so: so, dica: { pt: dd[0], en: dd[1] }, pares: pares };
  };

  // rodadas de um nível que valem nesta língua, na ordem do arquivo
  J.lista = function (R, nivel, lingua) {
    return (R[nivel] || []).map(function (c) { return J.rodada(c, nivel); })
      .filter(function (r) { return !r.so || r.so === lingua; });
  };

  // feitas: ids já jogados neste ciclo. Devolve { rodada, reiniciou } (reiniciou = já tinha feito todas)
  J.escolher = function (lista, feitas, rnd) {
    rnd = rnd || Math.random; feitas = feitas || [];
    var faltam = lista.filter(function (r) { return feitas.indexOf(r.id) < 0; }), reiniciou = false;
    if (!faltam.length) { faltam = lista.slice(); reiniciou = true; }
    var janela = Math.min(J.JANELA, faltam.length);
    return { rodada: faltam[Math.floor(rnd() * janela)], reiniciou: reiniciou };
  };

  J.embaralhar = function (a, rnd) {
    rnd = rnd || Math.random; a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };

  // estrelas da rodada: sem erro 3, até 2 erros 2, mais que isso 1 (sempre ganha pelo menos 1)
  J.estrelas = function (erros) { return erros === 0 ? 3 : erros <= 2 ? 2 : 1; };

  J.Partida = function (rodada, rnd) {
    rnd = rnd || Math.random;
    var n = rodada.pares.length, idx = [];
    for (var i = 0; i < n; i++) idx.push(i);
    var esq = J.embaralhar(idx, rnd), dir = J.embaralhar(idx, rnd), tentativas = 0;
    // ninguém exatamente na frente do seu par (senão fica fácil demais)
    function alinhado() { for (var k = 0; k < n; k++) if (esq[k] === dir[k]) return true; return false; }
    while (n > 1 && alinhado() && tentativas++ < 60) dir = J.embaralhar(idx, rnd);
    var P = { rodada: rodada, n: n, esquerda: esq, direita: dir, ligados: {}, acertos: 0, erros: 0 };
    // e = número do par do item da esquerda, d = do item da direita
    P.ligar = function (e, d) {
      if (P.ligados[e] || P.ligados['d' + d]) return 'ja';
      if (e !== d) { P.erros++; return 'errado'; }
      P.ligados[e] = true; P.ligados['d' + d] = true; P.acertos++;
      return P.acertos === n ? 'fim' : 'certo';
    };
    P.ligado = function (lado, i) { return !!P.ligados[lado === 'e' ? i : 'd' + i]; };
    P.completa = function () { return P.acertos === n; };
    P.estrelas = function () { return J.estrelas(P.erros); };
    return P;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = J; else raiz.Enigmas = J;
})(typeof self !== 'undefined' ? self : this);
