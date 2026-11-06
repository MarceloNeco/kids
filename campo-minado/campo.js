/* Campo Minado — o motor do jogo (sem tela). Funciona no navegador (window.CampoMinado) e no Node (testes).
   O tabuleiro é uma lista de casas, da esquerda para a direita e de cima para baixo (índice = linha * colunas + coluna).
   Cada casa: { mina, n (quantos ouriços em volta), aberta, bandeira, errada (bandeira sem ouriço, no fim) }.
   As minas (ouriços dorminhocos) só são plantadas no primeiro toque, longe dele: o primeiro toque nunca acorda um
   ouriço e sempre abre um pedaço do jardim (a casa tocada e as oito em volta ficam livres). */
(function (raiz) {
  'use strict';
  var C = {};

  // curto x longo: o tabuleiro fica em pé no celular em pé e deitado na tela deitada (o app decide ao começar).
  C.NIVEIS = {
    facil: { curto: 8, longo: 8, minas: 8 },
    medio: { curto: 10, longo: 14, minas: 22 },
    dificil: { curto: 12, longo: 20, minas: 45 }
  };
  C.ORDEM = ['facil', 'medio', 'dificil'];

  C.criar = function (linhas, colunas, minas) {
    var cel = [];
    for (var i = 0; i < linhas * colunas; i++) cel.push({ mina: false, n: 0, aberta: false, bandeira: false, errada: false });
    return { linhas: linhas, colunas: colunas, minas: minas, cel: cel, plantado: false, abertas: 0, bandeiras: 0, fim: null, explodiu: -1 };
  };
  C.doNivel = function (nome, deitado) {
    var n = C.NIVEIS[nome]; if (!n) throw new Error('nível desconhecido: ' + nome);
    return deitado ? C.criar(n.curto, n.longo, n.minas) : C.criar(n.longo, n.curto, n.minas);
  };

  C.vizinhos = function (e, i) {
    var l = Math.floor(i / e.colunas), c = i % e.colunas, r = [];
    for (var dl = -1; dl <= 1; dl++) for (var dc = -1; dc <= 1; dc++) {
      if (!dl && !dc) continue;
      var nl = l + dl, nc = c + dc;
      if (nl >= 0 && nl < e.linhas && nc >= 0 && nc < e.colunas) r.push(nl * e.colunas + nc);
    }
    return r;
  };

  // rng: função que devolve um número em [0, 1) — nos testes, uma com semente fixa.
  C.plantar = function (e, inicio, rng) {
    rng = rng || Math.random;
    var livres = {}; livres[inicio] = true;
    var viz = C.vizinhos(e, inicio);
    // num tabuleiro apertado demais, guarda só a casa tocada
    if (e.cel.length - 1 - viz.length >= e.minas) viz.forEach(function (v) { livres[v] = true; });
    var pode = [];
    for (var i = 0; i < e.cel.length; i++) if (!livres[i]) pode.push(i);
    for (var k = 0; k < e.minas; k++) {       // sorteio sem repetir (Fisher-Yates parcial)
      var j = k + Math.floor(rng() * (pode.length - k));
      var t = pode[k]; pode[k] = pode[j]; pode[j] = t;
      e.cel[pode[k]].mina = true;
    }
    C.contar(e);
    e.plantado = true;
  };
  C.contar = function (e) {
    for (var i = 0; i < e.cel.length; i++) {
      var n = 0; C.vizinhos(e, i).forEach(function (v) { if (e.cel[v].mina) n++; });
      e.cel[i].n = n;
    }
  };

  // Abre uma casa. Casa sem número abre as vizinhas sozinha (enchente). Devolve as casas que abriram.
  C.abrir = function (e, i, rng) {
    if (e.fim) return { abertas: [], explodiu: false };
    var c = e.cel[i];
    if (c.aberta || c.bandeira) return { abertas: [], explodiu: false };
    if (!e.plantado) C.plantar(e, i, rng);
    if (c.mina) { c.aberta = true; e.explodiu = i; perder(e); return { abertas: [i], explodiu: true }; }
    var abertas = [], fila = [i];
    while (fila.length) {
      var k = fila.pop(), ck = e.cel[k];
      if (ck.aberta || ck.bandeira || ck.mina) continue;
      ck.aberta = true; e.abertas++; abertas.push(k);
      if (ck.n === 0) C.vizinhos(e, k).forEach(function (v) { if (!e.cel[v].aberta) fila.push(v); });
    }
    if (e.abertas === e.cel.length - e.minas) ganhar(e);
    return { abertas: abertas, explodiu: false };
  };

  // Toque num número já aberto com as bandeiras certas em volta: abre as outras vizinhas de uma vez.
  C.acorde = function (e, i) {
    var c = e.cel[i], r = { abertas: [], explodiu: false };
    if (e.fim || !c.aberta || !c.n) return r;
    var viz = C.vizinhos(e, i), band = 0;
    viz.forEach(function (v) { if (e.cel[v].bandeira) band++; });
    if (band !== c.n) return r;
    viz.forEach(function (v) {
      if (e.fim) return;
      var x = C.abrir(e, v);
      r.abertas = r.abertas.concat(x.abertas);
      if (x.explodiu) r.explodiu = true;
    });
    return r;
  };

  C.bandeira = function (e, i) {
    var c = e.cel[i];
    if (e.fim || c.aberta) return false;
    c.bandeira = !c.bandeira; e.bandeiras += c.bandeira ? 1 : -1;
    return true;
  };
  C.restantes = function (e) { return e.minas - e.bandeiras; };

  function perder(e) {
    e.fim = 'perdeu';
    e.cel.forEach(function (c) { if (c.bandeira && !c.mina) c.errada = true; });
  }
  function ganhar(e) {
    e.fim = 'ganhou';
    e.cel.forEach(function (c) { if (c.mina && !c.bandeira) { c.bandeira = true; e.bandeiras++; } });
  }

  // Semente fixa para os testes e para ?teste (mulberry32).
  C.semente = function (s) {
    s = s >>> 0;
    return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = C; else raiz.CampoMinado = C;
})(typeof self !== 'undefined' ? self : this);
