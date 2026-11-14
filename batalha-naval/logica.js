/* Batalha Naval — regras do jogo, sem tela (roda no navegador e no Node, para os testes).
   Tabuleiro n×n. Coordenada (x, y): x = coluna (letra A, B, C…), y = linha (número 1, 2, 3…). "E4" = coluna E, linha 4.
   Navio: { x, y, tam, h } — h = true deitado (para a direita), false em pé (para baixo). Navios não podem se encostar
   por cima um do outro (sobrepor); encostar do lado pode (fica mais fácil para criança arrumar).
   Resultado de um tiro: 'agua' | 'acerto' | 'afundou'.
   Três níveis (também a esperteza do computador):
     facil   8×8, 4 navios  → computador atira ao acaso
     medio  10×10, 5 navios → computador caça: depois de acertar, procura em volta e segue a linha
     dificil 12×12, 7 navios → computador calcula onde é mais provável ter navio (mapa de probabilidade) */
(function (raiz) {
  'use strict';
  var LETRAS = 'ABCDEFGHIJKL';
  var NIVEIS = {
    facil: { id: 'facil', n: 8, frota: [4, 3, 2, 2], pt: 'Fácil', en: 'Easy', es: 'Fácil' },
    medio: { id: 'medio', n: 10, frota: [5, 4, 3, 3, 2], pt: 'Médio', en: 'Medium', es: 'Medio' },
    dificil: { id: 'dificil', n: 12, frota: [5, 4, 4, 3, 3, 2, 2], pt: 'Difícil', en: 'Hard', es: 'Difícil' }
  };
  // nome principal de cada tamanho (o 2º navio do mesmo tamanho tem outro nome: veja TIPOS em navios.js)
  var NOMES = {
    5: { pt: 'Porta-aviões', en: 'Aircraft carrier', es: 'Portaaviones' },
    4: { pt: 'Encouraçado', en: 'Battleship', es: 'Acorazado' },
    3: { pt: 'Submarino', en: 'Submarine', es: 'Submarino' },
    2: { pt: 'Destróier', en: 'Destroyer', es: 'Destructor' }
  };
  var R = { agua: 0, acerto: 1, afundou: 2 };
  var RN = ['agua', 'acerto', 'afundou'];

  function coord(x, y) { return LETRAS.charAt(x) + (y + 1); }
  function chave(x, y) { return x + ',' + y; }
  function celulas(nv) { var c = []; for (var i = 0; i < nv.tam; i++) c.push(nv.h ? [nv.x + i, nv.y] : [nv.x, nv.y + i]); return c; }
  function dentro(nv, n) { return nv.x >= 0 && nv.y >= 0 && (nv.h ? nv.x + nv.tam <= n && nv.y < n : nv.y + nv.tam <= n && nv.x < n); }
  function inteiro(v, min, max) { return typeof v === 'number' && Math.floor(v) === v && v >= min && v <= max; }

  // cabe(frota, n, navio, ignorar) → o navio cabe no tabuleiro sem ficar por cima de outro (ignorar = índice do próprio navio)
  function cabe(frota, n, nv, ignorar) {
    if (!dentro(nv, n)) return false;
    var ocup = {};
    frota.forEach(function (o, i) { if (i !== ignorar && o) celulas(o).forEach(function (c) { ocup[chave(c[0], c[1])] = 1; }); });
    return celulas(nv).every(function (c) { return !ocup[chave(c[0], c[1])]; });
  }

  // frota completa e certinha para o nível: mesmos tamanhos, tudo dentro, ninguém por cima de ninguém
  function frotaValida(frota, nivel) {
    var cfg = NIVEIS[nivel];
    if (!cfg || !Array.isArray(frota) || frota.length !== cfg.frota.length) return false;
    var tams = frota.map(function (nv) { return nv && nv.tam; }).sort().join(), esperado = cfg.frota.slice().sort().join();
    if (tams !== esperado) return false;
    var ocup = {};
    for (var i = 0; i < frota.length; i++) {
      var nv = frota[i];
      if (!inteiro(nv.x, 0, cfg.n - 1) || !inteiro(nv.y, 0, cfg.n - 1) || typeof nv.h !== 'boolean' || !dentro(nv, cfg.n)) return false;
      var cs = celulas(nv);
      for (var k = 0; k < cs.length; k++) { var ch = chave(cs[k][0], cs[k][1]); if (ocup[ch]) return false; ocup[ch] = 1; }
    }
    return true;
  }

  function aleatoria(nivel, rnd) {
    rnd = rnd || Math.random;
    var cfg = NIVEIS[nivel], n = cfg.n;
    for (var tentativa = 0; tentativa < 200; tentativa++) {
      var frota = [], ok = true;
      for (var i = 0; i < cfg.frota.length && ok; i++) {
        var tam = cfg.frota[i], posto = false;
        for (var t = 0; t < 300 && !posto; t++) {
          var h = rnd() < 0.5, nv = { x: Math.floor(rnd() * (h ? n - tam + 1 : n)), y: Math.floor(rnd() * (h ? n : n - tam + 1)), tam: tam, h: h };
          if (cabe(frota, n, nv)) { frota.push(nv); posto = true; }
        }
        if (!posto) ok = false;
      }
      if (ok) return frota;
    }
    throw new Error('não coube a frota');
  }

  // resolver(frota, tiros, x, y): tiros = { "x,y": 1 } já recebidos ANTES deste (o deste entra aqui)
  // → { r: 'agua'|'acerto'|'afundou', navio (se afundou), fim (true se a frota toda afundou) }
  function resolver(frota, tiros, x, y) {
    var t = {}; Object.keys(tiros || {}).forEach(function (k) { t[k] = 1; }); t[chave(x, y)] = 1;
    var alvo = null;
    frota.forEach(function (nv) { celulas(nv).forEach(function (c) { if (c[0] === x && c[1] === y) alvo = nv; }); });
    if (!alvo) return { r: 'agua' };
    var afundou = celulas(alvo).every(function (c) { return t[chave(c[0], c[1])]; });
    if (!afundou) return { r: 'acerto' };
    var fim = frota.every(function (nv) { return celulas(nv).every(function (c) { return t[chave(c[0], c[1])]; }); });
    return { r: 'afundou', navio: { x: alvo.x, y: alvo.y, tam: alvo.tam, h: alvo.h }, fim: fim };
  }

  // navio <-> lista curta para mandar pela rede: [x, y, tam, h]
  function paraLista(nv) { return [nv.x, nv.y, nv.tam, nv.h ? 1 : 0]; }
  function deLista(a) { return { x: a[0], y: a[1], tam: a[2], h: a[3] === 1 }; }

  // vista(log, b, n): o mar do jogador b como todos veem — 0 não atirado, 1 água, 2 acerto, 3 afundado — e os navios afundados.
  // log = diário de tiros [atirador, alvo, x, y, resultado (0 água, 1 acerto, 2 afundou), e no afundou: x, y, tam, h]
  function vista(log, b, n) {
    var v = [], afund = [];
    for (var y = 0; y < n; y++) { v.push([]); for (var x = 0; x < n; x++) v[y].push(0); }
    log.forEach(function (e) { if (e[1] !== b) return; v[e[3]][e[2]] = e[4] + 1; if (e[4] === 2) afund.push(deLista(e.slice(5))); });
    afund.forEach(function (nv) { celulas(nv).forEach(function (c) { v[c[1]][c[0]] = 3; }); });
    return { v: v, afundados: afund };
  }

  // ======================= o computador =======================
  // vista: 0 não sei, 1 água, 2 acertei (navio ainda boiando), 3 afundado
  // IA(nivel, rnd, jeito): jeito ('facil' | 'medio' | 'dificil') é a esperteza; sem ele, a do próprio nível
  function IA(nivel, rnd, jeito) {
    rnd = rnd || Math.random; jeito = jeito || nivel;
    var cfg = NIVEIS[nivel], n = cfg.n, restantes = cfg.frota.slice(), vista = [];
    for (var y = 0; y < n; y++) { vista.push([]); for (var x = 0; x < n; x++) vista[y].push(0); }
    function livres() { var l = []; for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (!vista[y][x]) l.push([x, y]); return l; }
    function sortear(l) { return l[Math.floor(rnd() * l.length)]; }
    function acertos() { var l = []; for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (vista[y][x] === 2) l.push([x, y]); return l; }
    function livre(x, y) { return x >= 0 && y >= 0 && x < n && y < n && !vista[y][x]; }

    function aoAcaso() { return sortear(livres()); }

    function cacador() {
      var hs = acertos();
      if (hs.length) {
        var linha = [], volta = [];
        hs.forEach(function (a) {
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
            var x = a[0] + d[0], y = a[1] + d[1];
            if (!livre(x, y)) return;
            // seguir a linha: o vizinho do outro lado também é acerto
            var ox = a[0] - d[0], oy = a[1] - d[1];
            if (ox >= 0 && oy >= 0 && ox < n && oy < n && vista[oy][ox] === 2) linha.push([x, y]); else volta.push([x, y]);
          });
        });
        if (linha.length) return sortear(linha);
        if (volta.length) return sortear(volta);
      }
      var l = livres(), xadrez = l.filter(function (c) { return (c[0] + c[1]) % 2 === 0; });
      return sortear(xadrez.length ? xadrez : l);
    }

    function probabilidade() {
      var peso = [], y, x, temAcerto = acertos().length > 0;
      for (y = 0; y < n; y++) { peso.push([]); for (x = 0; x < n; x++) peso[y].push(0); }
      restantes.forEach(function (tam) {
        [true, false].forEach(function (h) {
          for (var y0 = 0; y0 < n; y0++) for (var x0 = 0; x0 < n; x0++) {
            var nv = { x: x0, y: y0, tam: tam, h: h };
            if (!dentro(nv, n)) continue;
            var cs = celulas(nv), bloqueado = false, nAc = 0;
            for (var i = 0; i < cs.length; i++) { var v = vista[cs[i][1]][cs[i][0]]; if (v === 1 || v === 3) { bloqueado = true; break; } if (v === 2) nAc++; }
            if (bloqueado || (temAcerto && !nAc)) continue;
            var w = temAcerto ? 1 + nAc * nAc * 10 : 1;
            cs.forEach(function (c) { if (!vista[c[1]][c[0]]) peso[c[1]][c[0]] += w; });
          }
        });
      });
      var melhor = -1, lista = [];
      for (y = 0; y < n; y++) for (x = 0; x < n; x++) {
        if (vista[y][x]) continue;
        if (peso[y][x] > melhor) { melhor = peso[y][x]; lista = [[x, y]]; } else if (peso[y][x] === melhor) lista.push([x, y]);
      }
      return melhor > 0 ? sortear(lista) : aoAcaso();
    }

    return {
      nivel: nivel,
      escolher: function () { return jeito === 'facil' ? aoAcaso() : jeito === 'medio' ? cacador() : probabilidade(); },
      anotar: function (x, y, r, navio) {
        if (r === 'agua') vista[y][x] = 1;
        else if (r === 'acerto') vista[y][x] = 2;
        else { vista[y][x] = 2; if (navio) { celulas(navio).forEach(function (c) { vista[c[1]][c[0]] = 3; }); var i = restantes.indexOf(navio.tam); if (i >= 0) restantes.splice(i, 1); } }
      },
      vista: vista
    };
  }

  var API = { LETRAS: LETRAS, NIVEIS: NIVEIS, NOMES: NOMES, R: R, RN: RN, coord: coord, chave: chave, celulas: celulas, dentro: dentro, cabe: cabe,
    frotaValida: frotaValida, aleatoria: aleatoria, resolver: resolver, paraLista: paraLista, deLista: deLista, vista: vista, IA: IA, inteiro: inteiro };
  raiz.BNLogica = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : this);
