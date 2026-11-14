/* AQUA — Cubo d'Água: as regras do cubo 3×3, sem tela (roda igual no navegador e no Node, para os testes).
   (Nome nosso: "Cubo Mágico" é o nome popular do brinquedo de uma marca.)

   O cubo tem 54 pastilhas de cor (9 em cada face). Cada pastilha tem uma posição (x, y, z, cada um -1, 0 ou 1) e a
   direção para onde está virada (normal). Girar uma fatia = girar 90° todas as pastilhas daquela fatia em volta de um
   eixo. Assim a regra é uma conta só, igual para as 9 fatias, e o desenho 3D (cubo3d.js) usa exatamente o mesmo giro.

   Um giro: { eixo: 'x' | 'y' | 'z', camada: -1 | 0 | 1, dir: 1 | -1 }  (dir 1 = 90° no sentido da mão direita).
   Pronto = cada face com uma cor só.

   Toda fase tem solução: o cubo nasce montado e só então é embaralhado com giros de verdade. A solução é desfazer os
   giros do embaralhamento e os da criança, de trás para frente (a dica usa isso). A fase N de um nível é sempre a mesma.

   CuboMotor.CORES · novo() · girar(est, giro) · pronto(est) · faceInteira(est, normal) · config(nivel, fase)
   · gerar(nivel, fase) · inverso(giro) · simplificar(giros) · caminho(est) · dica(est) · semente(n) */
(function (raiz) {
  'use strict';
  var C = {};
  C.NIVEIS = ['facil', 'medio', 'dificil'];
  // as 6 cores das faces (líquidos do AQUA): para cima, para baixo, direita, esquerda, frente, trás
  C.FACES = [
    { normal: [0, 1, 0], cor: 0 }, { normal: [0, -1, 0], cor: 1 }, { normal: [1, 0, 0], cor: 2 },
    { normal: [-1, 0, 0], cor: 3 }, { normal: [0, 0, 1], cor: 4 }, { normal: [0, 0, -1], cor: 5 }
  ];
  var EIXO = { x: 0, y: 1, z: 2 };

  C.semente = function (n) {
    var a = n >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };

  // o cubo montado: 54 pastilhas, cada uma com id (que nunca muda), posição, normal e cor
  C.novo = function () {
    var p = [], id = 0;
    C.FACES.forEach(function (f) {
      var n = f.normal, k = n[0] ? 0 : n[1] ? 1 : 2, a = (k + 1) % 3, b = (k + 2) % 3;
      for (var i = -1; i <= 1; i++) for (var j = -1; j <= 1; j++) {
        var pos = [0, 0, 0]; pos[k] = n[k]; pos[a] = i; pos[b] = j;
        p.push({ id: id++, pos: pos, normal: n.slice(), cor: f.cor });
      }
    });
    return { pastilhas: p, giros: [], embaralho: [] };
  };

  // gira um vetor 90° em volta de um eixo (dir 1 = sentido da mão direita); números inteiros, sem erro de arredondamento
  function rodar(v, eixo, dir) {
    var x = v[0], y = v[1], z = v[2];
    if (eixo === 'x') return dir > 0 ? [x, -z, y] : [x, z, -y];
    if (eixo === 'y') return dir > 0 ? [z, y, -x] : [-z, y, x];
    return dir > 0 ? [-y, x, z] : [y, -x, z];
  }
  C.rodar = rodar;
  function mexe(est, g) {
    var k = EIXO[g.eixo];
    est.pastilhas.forEach(function (p) {
      if (p.pos[k] !== g.camada) return;
      p.pos = rodar(p.pos, g.eixo, g.dir); p.normal = rodar(p.normal, g.eixo, g.dir);
    });
  }
  C.valido = function (g) { return !!g && g.eixo in EIXO && (g.camada === -1 || g.camada === 0 || g.camada === 1) && (g.dir === 1 || g.dir === -1); };
  // um giro da criança (fica na lista, para o desfazer e a dica)
  C.girar = function (est, g) {
    if (!C.valido(g)) return false;
    mexe(est, g); est.giros.push({ eixo: g.eixo, camada: g.camada, dir: g.dir });
    return true;
  };
  // desfazer o último giro da criança
  C.desfazer = function (est) {
    var g = est.giros.pop(); if (!g) return null;
    var i = C.inverso(g); mexe(est, i); return i;
  };

  function igual(a, b) { return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]; }
  // a face virada para "normal" está de uma cor só?
  C.faceInteira = function (est, normal) {
    var cor = null, ok = true;
    est.pastilhas.forEach(function (p) { if (!igual(p.normal, normal)) return; if (cor === null) cor = p.cor; else if (p.cor !== cor) ok = false; });
    return ok;
  };
  C.pronto = function (est) { return C.FACES.every(function (f) { return C.faceInteira(est, f.normal); }); };
  C.facesProntas = function (est) { return C.FACES.filter(function (f) { return C.faceInteira(est, f.normal); }).length; };

  C.inverso = function (g) { return { eixo: g.eixo, camada: g.camada, dir: -g.dir }; };
  // junta giros seguidos da mesma fatia (ida e volta se cancelam; dois iguais viram meia volta; quatro, nada)
  C.simplificar = function (giros) {
    var out = [];
    giros.forEach(function (g) {
      var u = out[out.length - 1];
      if (u && u.eixo === g.eixo && u.camada === g.camada) {
        var soma = ((u.dir === 2 ? 2 : u.dir) + g.dir + 8) % 4;   // quartos de volta: 1, 2 (meia) ou 3 (= -1)
        out.pop();
        if (soma === 1) out.push({ eixo: g.eixo, camada: g.camada, dir: 1 });
        else if (soma === 3) out.push({ eixo: g.eixo, camada: g.camada, dir: -1 });
        else if (soma === 2) out.push({ eixo: g.eixo, camada: g.camada, dir: 2 });
      } else out.push({ eixo: g.eixo, camada: g.camada, dir: g.dir });
    });
    // a meia volta (dir 2) vira dois giros de verdade
    var r = [];
    out.forEach(function (g) { if (g.dir === 2) { r.push({ eixo: g.eixo, camada: g.camada, dir: 1 }, { eixo: g.eixo, camada: g.camada, dir: 1 }); } else r.push(g); });
    return r;
  };
  // o caminho até montar: tudo o que foi girado (embaralho + criança), de trás para frente, ao contrário, simplificado
  C.caminho = function (est) {
    var tudo = est.embaralho.concat(est.giros), volta = [];
    for (var i = tudo.length - 1; i >= 0; i--) volta.push(C.inverso(tudo[i]));
    return C.simplificar(volta);
  };
  C.dica = function (est) { var c = C.caminho(est); return c.length ? c[0] : null; };

  // ---------- fases: quantos giros embaralham ----------
  function degrau(fase, tabela) { for (var i = 0; i < tabela.length; i++) if (fase <= tabela[i][0]) return tabela[i][1]; return tabela[tabela.length - 1][1]; }
  C.config = function (nivel, fase) {
    fase = Math.max(1, Math.floor(fase) || 1);
    if (nivel === 'facil') return { giros: degrau(fase, [[4, 1], [12, 2], [9999, 3]]), meio: false };
    if (nivel === 'medio') return { giros: degrau(fase, [[5, 4], [12, 5], [20, 6], [30, 7], [9999, 8]]), meio: fase > 10 };
    return { giros: degrau(fase, [[5, 10], [12, 13], [20, 16], [30, 20], [9999, 25]]), meio: true };
  };
  var NUM = { facil: 1, medio: 2, dificil: 3 };
  C.gerar = function (nivel, fase) {
    var cfg = C.config(nivel, fase), rng = C.semente((NUM[nivel] || 1) * 7000003 + fase * 104729), camadas = cfg.meio ? [-1, 0, 1] : [-1, 1];
    for (var t = 0; t < 200; t++) {
      var est = C.novo(), lista = [], ant = null;
      while (lista.length < cfg.giros) {
        var g = { eixo: 'xyz'[Math.floor(rng() * 3)], camada: camadas[Math.floor(rng() * camadas.length)], dir: rng() < 0.5 ? 1 : -1 };
        // nada de desfazer o giro anterior nem de girar a mesma fatia duas vezes seguidas (seria embaralhar menos)
        if (ant && ant.eixo === g.eixo && ant.camada === g.camada) continue;
        lista.push(g); ant = g;
      }
      lista.forEach(function (g) { mexe(est, g); });
      // o embaralho de verdade tem o tamanho pedido (nada se cancelou) e o cubo não pode já estar pronto
      if (C.simplificar(lista).length === lista.length && !C.pronto(est)) { est.embaralho = lista; est.nivel = nivel; est.fase = fase; return est; }
    }
    return null;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = C; else raiz.CuboMotor = C;
})(typeof self !== 'undefined' ? self : this);
