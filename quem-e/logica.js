/* Quem é? — motor do Duelo de Caras, sem tela (roda no Node para os testes).

   O TABULEIRO: gerarTabuleiro(semente, nivel) sorteia as caras (tipo, pele, cabelo, óculos, chapéu, joias, roupa...) e
   dá um nome a cada uma. A mesma semente dá sempre o mesmo tabuleiro: é assim que dois celulares jogam com as mesmas
   caras (só a semente viaja pela rede).
   Regras do sorteio (spec, seção 6):
     - metade de menino/homem/vovô e metade de menina/mulher/vovó (diferença de no máximo 1);
     - nada sem sentido: barba em criança, peruca em careca, cabelo branco em quem não é vovô ou vovó;
     - o que o nível não pergunta não varia (no Fácil ninguém tem peruca, brinco, colar, nariz de palhaço, sardas ou
       barba, e os olhos são da mesma cor). Exceção de propósito: tom de pele, cor e estampa da roupa variam sempre,
       para o tabuleiro ficar bonito (a cor da roupa só vira pergunta do Médio para cima);
     - toda pergunta que aparece tem "Sim" em pelo menos 2 caras e no máximo 2/3 delas. Se o sorteio não consegue em
       200 tentativas, aceita o melhor com pelo menos 1 (nunca falha);
     - duas caras nunca respondem igual a todas as perguntas do nível (todo mundo pode ser descoberto).
   AS PERGUNTAS: PERGUNTAS (texto PT/EN/ES, ícone, grupo e o teste). perguntasDoNivel acumula: o Médio tem as do Fácil.
   A MELECA: escolherPerguntaMeleca decide a jogada do computador. Fácil pergunta ao acaso e chuta com 2 sobrando;
   Médio quase sempre faz a boa pergunta; Difícil sempre a pergunta que divide o que sobrou mais perto da metade. */
(function (raiz) {
  'use strict';
  var Nomes = raiz.QENomes || (typeof require === 'function' ? require('./nomes.js') : null);

  var NIVEIS = { facil: { caras: 12 }, medio: { caras: 24 }, dificil: { caras: 36 } };
  var ORDEM = { facil: 0, medio: 1, dificil: 2 };

  var CARACTERISTICAS = {
    tipo: ['menino', 'menina', 'homem', 'mulher', 'vovo', 'vova'],
    pele: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
    cabeloCor: ['preto', 'castanho', 'loiro', 'ruivo', 'branco'],
    cabeloComp: ['careca', 'curto', 'medio', 'comprido'],
    peruca: [null, 'azul', 'rosa', 'verde', 'arco'],
    olhos: ['castanhos', 'azuis', 'verdes'],
    oculos: ['nenhum', 'grau', 'escuros', 'coloridos'],
    pelos: ['nenhum', 'bigode', 'barba'],
    sardas: [false, true],
    nariz: [false, true],
    cabeca: ['nada', 'bone', 'chapeu', 'coroa', 'laco', 'tiara'],
    brinco: [false, true],
    colar: [false, true],
    roupaCor: ['vermelho', 'azul', 'verde', 'amarelo', 'roxo', 'laranja'],
    estampa: ['lisa', 'listras', 'bolinhas', 'xadrez', 'estrelas'],
    // só no corpo inteiro (dono, 14/Nov/2026)
    baixo: ['calca', 'short', 'saia', 'vestido'],
    calcado: ['tenis', 'bota', 'sapato', 'descalco'],
    mochila: [false, true],
    segura: [null, 'balao', 'bola', 'sorvete', 'livro', 'flor']
  };

  function ehMasc(c) { return c.tipo === 'menino' || c.tipo === 'homem' || c.tipo === 'vovo'; }
  function temCabelo(c) { return !c.peruca && c.cabeloComp !== 'careca'; }

  // ---------- as perguntas ----------
  function P(id, nivel, grupo, ico, pt, en, es, teste) { return { id: id, nivel: nivel, grupo: grupo, ico: ico, pt: pt, en: en, es: es, teste: teste }; }
  var CORES_CABELO = { preto: ['preto', 'black', 'negro'], castanho: ['castanho', 'brown', 'castaño'], loiro: ['loiro', 'blond', 'rubio'], ruivo: ['ruivo', 'red', 'rojo'], branco: ['branco', 'white', 'blanco'] };
  var CORES_ROUPA = { vermelho: ['vermelha', 'red', '❤️', 'roja'], azul: ['azul', 'blue', '💙', 'azul'], verde: ['verde', 'green', '💚', 'verde'], amarelo: ['amarela', 'yellow', '💛', 'amarilla'], roxo: ['roxa', 'purple', '💜', 'morada'], laranja: ['laranja', 'orange', '🧡', 'naranja'] };
  var CABECA = { bone: ['de boné', 'wearing a cap', '🧢', 'gorra'], chapeu: ['de chapéu', 'wearing a hat', '🎩', 'sombrero'], coroa: ['de coroa', 'wearing a crown', '👑', 'corona'], laco: ['de laço', 'wearing a bow', '🎀', 'un lazo'], tiara: ['de tiara', 'wearing a headband', '💫', 'diadema'] };
  var OCULOS = { grau: ['óculos de grau', 'regular glasses', '👓', 'gafas normales'], escuros: ['óculos escuros', 'sunglasses', '🕶️', 'gafas de sol'], coloridos: ['óculos coloridos', 'colorful glasses', '🌈', 'gafas de colores'] };
  var OLHOS = { castanhos: ['castanhos', 'brown', '🟤', 'marrones'], azuis: ['azuis', 'blue', '🔵', 'azules'], verdes: ['verdes', 'green', '🟢', 'verdes'] };

  var PERGUNTAS = [
    P('crianca', 'facil', 'quem', '🧒', 'É criança?', 'Is it a child?', '¿Es un niño o una niña?', function (c) { return c.tipo === 'menino' || c.tipo === 'menina'; }),
    P('adulto', 'facil', 'quem', '🧑', 'É adulto?', 'Is it a grown-up?', '¿Es una persona adulta?', function (c) { return c.tipo === 'homem' || c.tipo === 'mulher'; }),
    P('idoso', 'facil', 'quem', '👴', 'É vovô ou vovó?', 'Is it a grandpa or grandma?', '¿Es un abuelo o una abuela?', function (c) { return c.tipo === 'vovo' || c.tipo === 'vova'; }),
    P('masculino', 'facil', 'quem', '👦', 'É menino ou homem?', 'Is it a boy or a man?', '¿Es un chico o un hombre?', ehMasc),
    P('feminino', 'facil', 'quem', '👧', 'É menina ou mulher?', 'Is it a girl or a woman?', '¿Es una chica o una mujer?', function (c) { return !ehMasc(c); })
  ];
  Object.keys(CORES_CABELO).forEach(function (cor) {
    var t = CORES_CABELO[cor];
    PERGUNTAS.push(P('cabelo-' + cor, 'facil', 'cabelo', '💇', 'Tem cabelo ' + t[0] + '?', 'Does it have ' + t[1] + ' hair?', '¿Tiene el pelo ' + t[2] + '?', function (c) { return temCabelo(c) && c.cabeloCor === cor; }));
  });
  PERGUNTAS.push(
    P('oculos', 'facil', 'rosto', '👓', 'Usa óculos?', 'Is it wearing glasses?', '¿Lleva gafas?', function (c) { return c.oculos !== 'nenhum'; }),
    P('algo-cabeca', 'facil', 'cabeca', '🎩', 'Tem alguma coisa na cabeça?', 'Is there something on its head?', '¿Lleva algo en la cabeza?', function (c) { return c.cabeca !== 'nada'; }),
    P('comprido', 'medio', 'cabelo', '💁', 'Tem cabelo comprido?', 'Does it have long hair?', '¿Tiene el pelo largo?', function (c) { return temCabelo(c) && c.cabeloComp === 'comprido'; }),
    P('curto', 'medio', 'cabelo', '✂️', 'Tem cabelo curtinho?', 'Does it have short hair?', '¿Tiene el pelo cortito?', function (c) { return temCabelo(c) && c.cabeloComp === 'curto'; }),
    P('careca', 'medio', 'cabelo', '🥚', 'É careca?', 'Is it bald?', '¿Es calvo?', function (c) { return c.cabeloComp === 'careca'; }),
    P('peruca', 'medio', 'cabelo', '🌈', 'Está de peruca colorida?', 'Is it wearing a colorful wig?', '¿Lleva una peluca de colores?', function (c) { return !!c.peruca; }),
    P('barba', 'medio', 'rosto', '🧔', 'Tem barba?', 'Does it have a beard?', '¿Tiene barba?', function (c) { return c.pelos === 'barba'; }),
    P('bigode', 'medio', 'rosto', '🥸', 'Tem bigode?', 'Does it have a mustache?', '¿Tiene bigote?', function (c) { return c.pelos === 'bigode'; }),
    P('nariz', 'medio', 'rosto', '🤡', 'Está de nariz de palhaço?', 'Is it wearing a clown nose?', '¿Lleva nariz de payaso?', function (c) { return !!c.nariz; }),
    P('brinco', 'medio', 'joias', '💎', 'Usa brinco?', 'Is it wearing earrings?', '¿Lleva pendientes?', function (c) { return !!c.brinco; }),
    P('colar', 'medio', 'joias', '📿', 'Usa colar?', 'Is it wearing a necklace?', '¿Lleva collar?', function (c) { return !!c.colar; })
  );
  Object.keys(CORES_ROUPA).forEach(function (cor) {
    var t = CORES_ROUPA[cor];
    PERGUNTAS.push(P('roupa-' + cor, 'medio', 'roupa', t[2], 'A roupa é ' + t[0] + '?', 'Are its clothes ' + t[1] + '?', '¿La ropa es ' + t[3] + '?', function (c) { return c.roupaCor === cor; }));
  });
  Object.keys(CABECA).forEach(function (k) {
    var t = CABECA[k];
    PERGUNTAS.push(P(k, 'dificil', 'cabeca', t[2], 'Está ' + t[0] + '?', 'Is it ' + t[1] + '?', '¿Lleva ' + t[3] + '?', function (c) { return c.cabeca === k; }));
  });
  Object.keys(OCULOS).forEach(function (k) {
    var t = OCULOS[k];
    PERGUNTAS.push(P('oculos-' + k, 'dificil', 'rosto', t[2], 'Usa ' + t[0] + '?', 'Is it wearing ' + t[1] + '?', '¿Lleva ' + t[3] + '?', function (c) { return c.oculos === k; }));
  });
  Object.keys(OLHOS).forEach(function (k) {
    var t = OLHOS[k];
    PERGUNTAS.push(P('olhos-' + k, 'dificil', 'rosto', t[2], 'Tem olhos ' + t[0] + '?', 'Does it have ' + t[1] + ' eyes?', '¿Tiene los ojos ' + t[3] + '?', function (c) { return c.olhos === k; }));
  });
  PERGUNTAS.push(P('sardas', 'dificil', 'rosto', '🟠', 'Tem sardas?', 'Does it have freckles?', '¿Tiene pecas?', function (c) { return !!c.sardas; }));
  // corpo inteiro: só entram quando o tabuleiro é de corpo inteiro (perguntasDoNivel(nivel, true))
  function PC(id, nivel, ico, pt, en, es, teste) { var p = P(id, nivel, 'corpo', ico, pt, en, es, teste); p.corpo = true; return p; }
  PERGUNTAS.push(
    PC('calca', 'facil', '👖', 'Está de calça?', 'Is it wearing pants?', '¿Lleva pantalón largo?', function (c) { return c.baixo === 'calca'; }),
    PC('short', 'facil', '🩳', 'Está de short?', 'Is it wearing shorts?', '¿Lleva pantalón corto?', function (c) { return c.baixo === 'short'; }),
    PC('saia', 'facil', '👗', 'Está de saia?', 'Is it wearing a skirt?', '¿Lleva falda?', function (c) { return c.baixo === 'saia'; }),
    PC('vestido', 'facil', '👗', 'Está de vestido?', 'Is it wearing a dress?', '¿Lleva vestido?', function (c) { return c.baixo === 'vestido'; }),
    PC('descalco', 'facil', '🦶', 'Está descalço?', 'Is it barefoot?', '¿Va sin zapatos?', function (c) { return c.calcado === 'descalco'; }),
    PC('tenis', 'medio', '👟', 'Está de tênis?', 'Is it wearing sneakers?', '¿Lleva zapatillas de deporte?', function (c) { return c.calcado === 'tenis'; }),
    PC('bota', 'medio', '👢', 'Está de bota?', 'Is it wearing boots?', '¿Lleva botas?', function (c) { return c.calcado === 'bota'; }),
    PC('mochila', 'medio', '🎒', 'Está de mochila?', 'Is it carrying a backpack?', '¿Lleva mochila?', function (c) { return !!c.mochila; }),
    PC('segura', 'medio', '✋', 'Está segurando alguma coisa?', 'Is it holding something?', '¿Tiene algo en la mano?', function (c) { return !!c.segura; }),
    PC('segura-balao', 'dificil', '🎈', 'Está segurando um balão?', 'Is it holding a balloon?', '¿Tiene un globo en la mano?', function (c) { return c.segura === 'balao'; }),
    PC('segura-bola', 'dificil', '⚽', 'Está segurando uma bola?', 'Is it holding a ball?', '¿Tiene una pelota en la mano?', function (c) { return c.segura === 'bola'; }),
    PC('segura-sorvete', 'dificil', '🍦', 'Está segurando um sorvete?', 'Is it holding an ice cream?', '¿Tiene un helado en la mano?', function (c) { return c.segura === 'sorvete'; }),
    PC('segura-livro', 'dificil', '📕', 'Está segurando um livro?', 'Is it holding a book?', '¿Tiene un libro en la mano?', function (c) { return c.segura === 'livro'; }),
    PC('segura-flor', 'dificil', '🌷', 'Está segurando uma flor?', 'Is it holding a flower?', '¿Tiene una flor en la mano?', function (c) { return c.segura === 'flor'; })
  );

  var POR_ID = {};
  PERGUNTAS.forEach(function (p) { POR_ID[p.id] = p; });

  function perguntasDoNivel(nivel, corpo) { return PERGUNTAS.filter(function (p) { return ORDEM[p.nivel] <= ORDEM[nivel] && (!p.corpo || !!corpo); }); }
  function pergunta(id) { var p = POR_ID[id]; if (!p) throw new Error('pergunta desconhecida: ' + id); return p; }
  function responder(cara, id) { return !!pergunta(id).teste(cara); }
  function conferir(cara, id, resposta) { return responder(cara, id) === !!resposta; }

  // ---------- o sorteio ----------
  function sorteio(s) { s = s >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function um(r, lista) { return lista[Math.floor(r() * lista.length)]; }
  function embaralhar(r, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // os tipos: metade de cada gênero; dentro de cada gênero, criança, adulto e idoso o mais igual possível
  function tipos(r, n) {
    var lista = [], m = Math.floor(n / 2) + (n % 2 && r() < 0.5 ? 1 : 0), f = n - m;
    function gen(qtd, trio) { var base = embaralhar(r, trio.slice()); for (var i = 0; i < qtd; i++) lista.push(base[i % 3]); }
    gen(m, ['menino', 'homem', 'vovo']); gen(f, ['menina', 'mulher', 'vova']);
    return embaralhar(r, lista);
  }

  function sortearCara(r, tipo, nivel) {
    var med = ORDEM[nivel] >= 1, dif = ORDEM[nivel] >= 2;
    var idoso = tipo === 'vovo' || tipo === 'vova', masc = tipo === 'menino' || tipo === 'homem' || tipo === 'vovo';
    var c = { tipo: tipo, pele: um(r, CARACTERISTICAS.pele) };
    c.cabeloCor = idoso ? 'branco' : um(r, ['preto', 'castanho', 'loiro', 'ruivo']);
    if (med) {
      // comprimento que combina com cada um (vovô de cabelo comprido parecia vovó no tabuleiro)
      var COMP = { menino: ['curto', 'curto', 'medio'], menina: ['curto', 'medio', 'comprido', 'comprido'], homem: ['curto', 'curto', 'medio', 'careca', 'careca', 'comprido'],
        mulher: ['curto', 'medio', 'comprido', 'comprido'], vovo: ['curto', 'careca', 'careca'], vova: ['curto', 'medio', 'medio'] };
      c.cabeloComp = um(r, COMP[tipo]);
    } else {
      c.cabeloComp = masc ? 'curto' : 'comprido';
    }
    c.peruca = med && c.cabeloComp !== 'careca' && r() < 0.18 ? um(r, ['azul', 'rosa', 'verde', 'arco']) : null;
    c.olhos = dif ? um(r, CARACTERISTICAS.olhos) : 'castanhos';
    c.oculos = r() < (idoso ? 0.6 : 0.35) ? um(r, ['grau', 'escuros', 'coloridos']) : 'nenhum';
    c.pelos = med && (tipo === 'homem' || tipo === 'vovo') && r() < 0.6 ? um(r, ['bigode', 'barba']) : 'nenhum';
    c.sardas = dif && r() < 0.3;
    c.nariz = med && r() < 0.2;
    c.cabeca = r() < 0.55 ? um(r, masc ? ['bone', 'chapeu', 'coroa', 'bone', 'chapeu', 'tiara', 'laco'] : ['bone', 'chapeu', 'coroa', 'laco', 'tiara', 'laco', 'tiara']) : 'nada';
    c.brinco = med && r() < (masc ? 0.15 : 0.5);
    c.colar = med && r() < 0.35;
    c.roupaCor = um(r, CARACTERISTICAS.roupaCor);
    c.estampa = um(r, CARACTERISTICAS.estampa);
    return c;
  }
  // corpo inteiro: o que vai da cintura para baixo e nas mãos (sorteado DEPOIS, para o rosto continuar igual ao do busto)
  function sortearCorpo(r, c, nivel) {
    var med = ORDEM[nivel] >= 1, dif = ORDEM[nivel] >= 2, masc = c.tipo === 'menino' || c.tipo === 'homem' || c.tipo === 'vovo';
    c.baixo = um(r, masc ? ['calca', 'calca', 'short', 'short', 'saia'] : ['calca', 'short', 'saia', 'saia', 'vestido', 'vestido']);
    if (masc && c.baixo === 'saia' && r() < 0.7) c.baixo = 'short';
    c.calcado = r() < 0.15 ? 'descalco' : med ? um(r, ['tenis', 'bota', 'sapato']) : 'tenis';
    c.mochila = med && r() < 0.3;
    c.segura = med && r() < 0.5 ? (dif ? um(r, ['balao', 'bola', 'sorvete', 'livro', 'flor']) : 'balao') : null;
    return c;
  }

  function avaliar(caras, nivel, corpo) {
    var n = caras.length, max = Math.ceil(2 * n / 3), ps = perguntasDoNivel(nivel, corpo), presentes = [], ruins = 0, iguais = false;
    ps.forEach(function (p) {
      var sim = 0; caras.forEach(function (c) { if (p.teste(c)) sim++; });
      if (sim > 0 && sim < n) { presentes.push(p.id); if (sim < 2 || sim > max) ruins++; }
    });
    var vistos = {};
    caras.forEach(function (c) { var a = ps.map(function (p) { return p.teste(c) ? 1 : 0; }).join(''); if (vistos[a]) iguais = true; vistos[a] = 1; });
    return { presentes: presentes, ruins: ruins, iguais: iguais };
  }

  function gerarTabuleiro(semente, nivel, op) {
    if (!NIVEIS[nivel]) throw new Error('nível desconhecido: ' + nivel);
    var corpo = !!(op && op.corpo), n = NIVEIS[nivel].caras, melhor = null;
    for (var k = 0; k < 200; k++) {
      var r = sorteio((semente >>> 0) * 1000 + k + 1);
      var caras = tipos(r, n).map(function (t) { return sortearCara(r, t, nivel); });
      if (corpo) caras.forEach(function (c) { sortearCorpo(r, c, nivel); });
      var a = avaliar(caras, nivel, corpo);
      if (a.iguais) continue;
      if (!melhor || a.ruins < melhor.a.ruins) melhor = { caras: caras, a: a, r: r };
      if (a.ruins === 0) break;
    }
    if (!melhor) throw new Error('não deu para sortear o tabuleiro'); // não acontece: os testes cobrem 300 sementes
    var r2 = melhor.r, masc = embaralhar(r2, Nomes.MASCULINOS.slice()), fem = embaralhar(r2, Nomes.FEMININOS.slice());
    melhor.caras.forEach(function (c, i) { c.id = i; c.nome = ehMasc(c) ? masc.pop() : fem.pop(); });
    var ordem = ['id', 'nome', 'tipo', 'pele', 'cabeloCor', 'cabeloComp', 'peruca', 'olhos', 'oculos', 'pelos', 'sardas', 'nariz', 'cabeca', 'brinco', 'colar', 'roupaCor', 'estampa'];
    if (corpo) ordem = ordem.concat(['baixo', 'calcado', 'mochila', 'segura']);
    var caras2 = melhor.caras.map(function (c) { var o = {}; ordem.forEach(function (k) { o[k] = c[k]; }); return o; });
    var t = { semente: semente, nivel: nivel, caras: caras2, perguntas: melhor.a.presentes };
    if (corpo) t.corpo = true;
    return t;
  }

  // ---------- durante a partida ----------
  function descartaveis(caras, dePe, id, resposta) {
    var out = [];
    caras.forEach(function (c, i) { if (dePe[i] && responder(c, id) !== !!resposta) out.push(c.id); });
    return out;
  }
  function utilidade(caras, dePe, id) {
    var sim = 0; caras.forEach(function (c, i) { if (dePe[i] && responder(c, id)) sim++; }); return sim;
  }

  function escolherPerguntaMeleca(caras, candidatos, feitas, perguntas, nivel, rnd) {
    rnd = rnd || Math.random;
    var cand = [];
    caras.forEach(function (c, i) { if (candidatos[i]) cand.push(c.id); });
    if (cand.length <= 1) return { tipo: 'palpite', idCara: cand.length ? cand[0] : caras[0].id };
    var uteis = perguntas.filter(function (id) {
      if (feitas.indexOf(id) >= 0) return false;
      var s = utilidade(caras, candidatos, id); return s > 0 && s < cand.length;
    });
    if (!uteis.length || (nivel === 'facil' && cand.length <= 2)) return { tipo: 'palpite', idCara: um(rnd, cand) };
    if (nivel === 'facil' || (nivel === 'medio' && rnd() >= 0.75)) return { tipo: 'pergunta', id: um(rnd, uteis) };
    var meio = cand.length / 2, melhorD = Infinity, melhores = [];
    uteis.forEach(function (id) {
      var d = Math.abs(utilidade(caras, candidatos, id) - meio);
      if (d < melhorD - 1e-9) { melhorD = d; melhores = [id]; } else if (Math.abs(d - melhorD) < 1e-9) melhores.push(id);
    });
    return { tipo: 'pergunta', id: um(rnd, melhores) };
  }

  var L = {
    NIVEIS: NIVEIS, CARACTERISTICAS: CARACTERISTICAS, PERGUNTAS: PERGUNTAS,
    perguntasDoNivel: perguntasDoNivel, pergunta: pergunta, gerarTabuleiro: gerarTabuleiro,
    responder: responder, conferir: conferir, descartaveis: descartaveis, utilidade: utilidade,
    escolherPerguntaMeleca: escolherPerguntaMeleca, sorteio: sorteio
  };
  raiz.QELogica = L;
  if (typeof module === 'object' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
