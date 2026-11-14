/* AQUA — o motor do jogo, sem tela (roda igual no navegador e no Node, para os testes).
   Um frasco é uma lista de cores (números 0, 1, 2...) do FUNDO para a BOCA. Todos os frascos de uma fase têm a
   mesma capacidade ("cap", quantas camadas cabem).

   Regra do despejo: sai do frasco "de" a cor de cima (todas as camadas iguais e à vista que estão juntas no topo),
   entra no frasco "para" se ele estiver vazio ou se a cor de cima dele for a mesma, e só o quanto couber.
   Frasco pronto = cheio e de uma cor só. Fase vencida = todo frasco vazio ou pronto.

   Frasco embaçado (médio e difícil): as camadas de baixo ficam escondidas ("vistos" = false) até virarem a de cima.
   O resolvedor enxerga as cores de verdade; como despejar só o pedaço à vista é sempre uma jogada permitida, toda
   solução dele também pode ser jogada com os frascos embaçados.

   TODA fase gerada tem solução: gerar() só devolve uma arrumação depois que resolver() achou o caminho inteiro.
   A fase N de um nível é sempre a mesma em qualquer aparelho (o sorteio sai do nível e do número da fase).

   AquaMotor.semente(n) · config(nivel, fase) · gerar(nivel, fase) · novoEstado(fase) · quantoDespeja(est, de, para)
   · despejar(est, de, para) · pronto(frasco, cap) · venceu(est) · temJogada(est) · resolver(frascos, cap, limite)
   · plano(est) · depois(frascos, cap, de, para) · escrito(frascos) · embaralhar(est, rng) · frascoExtra(est) · copiar(est) */
(function (raiz) {
  'use strict';
  var M = {};
  M.NIVEIS = ['facil', 'medio', 'dificil'];
  M.MAX_CORES = 12;

  // sorteio que se repete: a mesma semente dá sempre a mesma sequência (mulberry32)
  M.semente = function (n) {
    var a = n >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // ---------- a dificuldade de cada fase: mais cores, frascos maiores, menos espaço vazio, mais frascos embaçados ----------
  function degrau(fase, tabela) {   // tabela: [[até a fase, valor], ...]; depois da última, vale o último valor
    for (var i = 0; i < tabela.length; i++) if (fase <= tabela[i][0]) return tabela[i][1];
    return tabela[tabela.length - 1][1];
  }
  M.config = function (nivel, fase) {
    fase = Math.max(1, Math.floor(fase) || 1);
    if (nivel === 'facil') return {
      cores: degrau(fase, [[4, 3], [12, 4], [9999, 5]]),
      cap: degrau(fase, [[30, 3], [9999, 4]]), vazios: 2, cobertos: 0
    };
    if (nivel === 'medio') return {
      cores: degrau(fase, [[5, 5], [12, 6], [22, 7], [9999, 8]]),
      cap: 4, vazios: 2, cobertos: degrau(fase, [[6, 0], [18, 1], [9999, 2]])
    };
    // difícil: de 8 a 12 cores; depois da fase 18 os frascos passam a ter 5 camadas; a partir da fase 8, de 4 em 4
    // fases vem uma "fase aperto" com um frasco vazio só (enquanto os frascos têm 4 camadas)
    var cap = degrau(fase, [[18, 4], [9999, 5]]);
    return {
      cores: degrau(fase, [[4, 8], [10, 9], [18, 10], [26, 10], [36, 11], [9999, 12]]),
      cap: cap, vazios: (cap === 4 && fase >= 8 && fase % 4 === 0) ? 1 : 2,
      cobertos: degrau(fase, [[10, 2], [9999, 3]])
    };
  };

  // ---------- regras ----------
  M.pronto = function (f, cap) {
    if (f.length !== cap) return false;
    for (var i = 1; i < f.length; i++) if (f[i] !== f[0]) return false;
    return true;
  };
  function tudoPronto(frascos, cap) {
    for (var i = 0; i < frascos.length; i++) if (frascos[i].length && !M.pronto(frascos[i], cap)) return false;
    return true;
  }
  M.venceu = function (est) { return tudoPronto(est.frascos, est.cap); };

  // quantas camadas iguais (e à vista) estão juntas no topo
  function corrida(f, v) {
    var n = f.length; if (!n) return 0;
    var k = 1;
    while (k < n && f[n - 1 - k] === f[n - 1] && (!v || v[n - 1 - k])) k++;
    return k;
  }
  M.corrida = function (est, i) { return corrida(est.frascos[i], est.vistos && est.vistos[i]); };

  // quantas camadas passam de "de" para "para" (0 = a jogada não vale)
  M.quantoDespeja = function (est, de, para) {
    var a = est.frascos[de], b = est.frascos[para];
    if (de === para || !a || !b || !a.length || b.length >= est.cap) return 0;
    if (M.pronto(a, est.cap)) return 0;                       // frasco pronto está fechado com a rolha
    if (b.length && b[b.length - 1] !== a[a.length - 1]) return 0;
    return Math.min(corrida(a, est.vistos && est.vistos[de]), est.cap - b.length);
  };

  // faz a jogada no estado; devolve { q, cor, revelou, fechou } ou null se não vale
  M.despejar = function (est, de, para) {
    var q = M.quantoDespeja(est, de, para);
    if (!q) return null;
    var a = est.frascos[de], b = est.frascos[para], cor = a[a.length - 1], revelou = false;
    for (var i = 0; i < q; i++) { a.pop(); b.push(cor); }
    if (est.vistos) {
      var va = est.vistos[de], vb = est.vistos[para];
      va.length = a.length; while (vb.length < b.length) vb.push(true);
      if (a.length && !va[a.length - 1]) { va[a.length - 1] = true; revelou = true; }
    }
    return { q: q, cor: cor, revelou: revelou, fechou: M.pronto(b, est.cap) };
  };

  M.temJogada = function (est) {
    for (var i = 0; i < est.frascos.length; i++) for (var j = 0; j < est.frascos.length; j++) if (M.quantoDespeja(est, i, j)) return true;
    return false;
  };

  M.copiar = function (est) {
    return { cap: est.cap, frascos: est.frascos.map(function (f) { return f.slice(); }),
      vistos: est.vistos ? est.vistos.map(function (v) { return v.slice(); }) : null,
      cobertos: (est.cobertos || []).slice(), extras: est.extras || 0 };
  };

  // ---------- resolvedor ----------
  // Busca em profundidade com memória das arrumações já vistas (a ordem dos frascos não importa: a chave é ordenada).
  // Devolve { passos: [[de, para], ...] } quando acha a solução; { passos: null, esgotou: true } quando passou do
  // limite de arrumações sem decidir; { passos: null, esgotou: false } quando provou que não tem solução.
  function chave(frascos) {
    var p = [];
    for (var i = 0; i < frascos.length; i++) p.push(String.fromCharCode.apply(null, frascos[i].map(function (c) { return 65 + c; })));
    p.sort();
    return p.join('|');
  }
  function uniforme(f) { for (var i = 1; i < f.length; i++) if (f[i] !== f[0]) return false; return true; }
  function jogadas(frascos, cap) {
    var boas = [], medias = [], vazias = [], n = frascos.length, primeiroVazio = -1, i, j;
    for (i = 0; i < n; i++) if (!frascos[i].length) { primeiroVazio = i; break; }
    for (i = 0; i < n; i++) {
      var a = frascos[i];
      if (!a.length || (a.length === cap && uniforme(a))) continue;
      var cor = a[a.length - 1], k = corrida(a, null);
      for (j = 0; j < n; j++) {
        if (j === i) continue;
        var b = frascos[j];
        if (b.length >= cap) continue;
        if (!b.length) {
          if (j !== primeiroVazio) continue;          // todos os vazios são iguais: basta o primeiro
          if (k === a.length) continue;               // mudar um frasco de uma cor só para um vazio não adianta nada
          vazias.push([i, j]);
        } else if (b[b.length - 1] === cor) {
          var cabe = cap - b.length;
          if (cabe >= k && uniforme(b)) boas.push([i, j]);   // junta a cor inteira num frasco só daquela cor
          else medias.push([i, j]);
        }
      }
    }
    return boas.concat(medias, vazias);
  }
  function aplicar(frascos, cap, de, para) {
    var a = frascos[de], b = frascos[para], cor = a[a.length - 1], q = Math.min(corrida(a, null), cap - b.length);
    for (var i = 0; i < q; i++) { a.pop(); b.push(cor); }
    return q;
  }
  function desfazer(frascos, de, para, q) {
    var a = frascos[de], b = frascos[para];
    for (var i = 0; i < q; i++) a.push(b.pop());
  }
  M.resolver = function (frascosIni, cap, limite) {
    limite = limite || 60000;
    var frascos = frascosIni.map(function (f) { return f.slice(); });
    if (tudoPronto(frascos, cap)) return { passos: [], esgotou: false, vistas: 0 };
    var vistas = Object.create(null), contagem = 0, caminho = [], esgotou = false;
    vistas[chave(frascos)] = 1;
    // pilha explícita (sem recursão, para não estourar em fases compridas)
    var pilha = [{ js: jogadas(frascos, cap), i: 0, q: 0, de: -1, para: -1 }];
    while (pilha.length) {
      var topo = pilha[pilha.length - 1];
      if (topo.i >= topo.js.length) {
        pilha.pop();
        if (topo.de >= 0) { desfazer(frascos, topo.de, topo.para, topo.q); caminho.pop(); }
        continue;
      }
      var j = topo.js[topo.i++];
      var q = aplicar(frascos, cap, j[0], j[1]);
      var k = chave(frascos);
      if (vistas[k]) { desfazer(frascos, j[0], j[1], q); continue; }
      vistas[k] = 1; contagem++;
      caminho.push(j);
      if (tudoPronto(frascos, cap)) return { passos: caminho.slice(), esgotou: false, vistas: contagem };
      if (contagem >= limite) { esgotou = true; break; }
      pilha.push({ js: jogadas(frascos, cap), i: 0, q: q, de: j[0], para: j[1] });
    }
    return { passos: null, esgotou: esgotou, vistas: contagem };
  };

  // O caminho inteiro até o fim, a partir de agora: [[de, para], ...]; null se desta arrumação não dá mais para terminar.
  // A dica do jogo segue ESTE caminho, um passo de cada vez (o app.js guarda o caminho enquanto a pessoa o segue):
  // calcular um caminho novo a cada dica poderia mandar ir e voltar entre dois frascos para sempre.
  M.plano = function (est) {
    var r = M.resolver(est.frascos, est.cap, 40000);
    return r.passos && r.passos.length ? r.passos : null;
  };
  // como os frascos ficam depois da jogada inteira (a cor de cima toda, sem contar frasco embaçado)
  M.depois = function (frascos, cap, de, para) {
    var novo = frascos.map(function (f) { return f.slice(); });
    aplicar(novo, cap, de, para);
    return novo;
  };
  // os frascos escritos numa linha só, na ordem em que estão (para comparar duas arrumações)
  M.escrito = function (frascos) { return frascos.map(function (f) { return f.join(','); }).join('|'); };

  // ---------- gerador ----------
  function embaralha(lista, rng) {
    for (var i = lista.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = lista[i]; lista[i] = lista[j]; lista[j] = t; }
    return lista;
  }
  function arrumar(cores, cap, vazios, rng) {
    var gotas = [], frascos = [], i, c;
    for (c = 0; c < cores; c++) for (i = 0; i < cap; i++) gotas.push(c);
    embaralha(gotas, rng);
    for (i = 0; i < cores; i++) frascos.push(gotas.slice(i * cap, (i + 1) * cap));
    for (i = 0; i < vazios; i++) frascos.push([]);
    return frascos;
  }
  // uma fase boa: nenhum frasco já pronto, e nenhum com a cor quase toda junta logo de cara (ficaria fácil demais)
  function boa(frascos, cap) {
    for (var i = 0; i < frascos.length; i++) if (frascos[i].length && uniforme(frascos[i])) return false;
    return true;
  }
  var NUM = { facil: 1, medio: 2, dificil: 3 };
  M.gerar = function (nivel, fase) {
    var cfg = M.config(nivel, fase), rng = M.semente((NUM[nivel] || 1) * 1000003 + fase * 7919);
    for (var t = 1; t <= 8000; t++) {   // com um frasco vazio só, poucas arrumações têm solução: sorteia até achar
      var frascos = arrumar(cfg.cores, cfg.cap, cfg.vazios, rng);
      if (!boa(frascos, cfg.cap)) continue;
      var r = M.resolver(frascos, cfg.cap, 30000);
      if (!r.passos) continue;
      // frascos embaçados: sorteados entre os cheios
      var idx = [], cobertos = [], i;
      for (i = 0; i < cfg.cores; i++) idx.push(i);
      embaralha(idx, rng);
      cobertos = idx.slice(0, cfg.cobertos).sort(function (a, b) { return a - b; });
      return { nivel: nivel, fase: fase, cap: cfg.cap, cores: cfg.cores, vazios: cfg.vazios, frascos: frascos, cobertos: cobertos,
        tentativas: t, passos: r.passos.length };
    }
    // nunca deve chegar aqui (os testes passam por centenas de fases); se chegar, uma fase simples que tem solução
    return { nivel: nivel, fase: fase, cap: 3, cores: 2, vazios: 2, frascos: [[0, 1, 0], [1, 0, 1], [], []], cobertos: [], tentativas: 0, passos: 4 };
  };

  // o estado de jogo de uma fase gerada (cópia: a fase gerada não é mexida)
  M.novoEstado = function (g) {
    var est = { cap: g.cap, frascos: g.frascos.map(function (f) { return f.slice(); }), cobertos: g.cobertos.slice(), extras: 0, vistos: null };
    est.vistos = est.frascos.map(function (f, i) {
      var coberto = est.cobertos.indexOf(i) >= 0;
      return f.map(function (c, k) { return !coberto || k === f.length - 1; });
    });
    return est;
  };

  // ➕ frasco extra: um frasco vazio a mais (devolve o número dele)
  M.frascoExtra = function (est) {
    est.frascos.push([]); if (est.vistos) est.vistos.push([]);
    est.extras = (est.extras || 0) + 1;
    return est.frascos.length - 1;
  };

  // 🔀 embaralhar: mistura de novo o que ainda não está pronto, sempre de um jeito que tem solução.
  // Os frascos prontos ficam como estão; os embaçados continuam embaçados (só a camada de cima à vista).
  M.embaralhar = function (est, rng) {
    rng = rng || Math.random;
    var cap = est.cap, livres = [], gotas = [], i;
    for (i = 0; i < est.frascos.length; i++) if (!M.pronto(est.frascos[i], cap)) { livres.push(i); gotas = gotas.concat(est.frascos[i]); }
    if (!gotas.length) return false;
    var cheios = Math.ceil(gotas.length / cap), antes = chave(est.frascos);
    for (var t = 0; t < 300; t++) {
      var g = embaralha(gotas.slice(), rng), novo = est.frascos.map(function (f) { return f.slice(); });
      for (i = 0; i < livres.length; i++) novo[livres[i]] = i < cheios ? g.slice(i * cap, (i + 1) * cap) : [];
      var algumPronto = false;
      for (i = 0; i < livres.length; i++) if (novo[livres[i]].length && uniforme(novo[livres[i]])) algumPronto = true;
      if ((algumPronto && t < 200) || chave(novo) === antes) continue;
      if (!M.resolver(novo, cap, 30000).passos) continue;
      est.frascos = novo;
      est.vistos = novo.map(function (f, k) {
        var coberto = (est.cobertos || []).indexOf(k) >= 0;
        return f.map(function (c, n) { return !coberto || n === f.length - 1; });
      });
      return true;
    }
    return false;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = M; else raiz.AquaMotor = M;
})(typeof self !== 'undefined' ? self : this);
