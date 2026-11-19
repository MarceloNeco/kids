/* FRUTA PODRE — regras sem tela: frutas, pragas, materiais, níveis, dano, pontos, estrelas e a previsão da parábola.
   Usado pelo mundo (mundo.js), pela tela (app.js) e pelos testes no Node (teste/regras.test.js).
   Unidades do Matter.js: posição em pixels do mundo, velocidade em pixels por passo (1 passo = 1/60 s). */
(function (raiz, fabrica) {
  var R = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = R; else raiz.FrutaRegras = R;
})(this, function () {
  'use strict';
  var CHAO = 600;                         // y do chão (topo da calçada)
  var PASSO = 1000 / 60;                  // ms por passo da física
  var G = 1 * 0.001 * PASSO * PASSO;      // gravidade por passo² (gravity.y = 1, escala 0,001 do Matter.js) ≈ 0,278
  var VMAX = 22;                          // velocidade da fruta com o elástico todo esticado (px por passo)

  var FRUTAS = {
    maca_podre: { r: 22, densidade: 0.004, poder: 'grito', cor: '#d8342c', suco: '#f2c14e',
      nome: { pt: 'Maçã Podre', en: 'Rotten Apple', es: 'Manzana Podrida' },
      dica: { pt: 'O vermezinho grita e empurra o que é leve', en: 'The little worm yells and shoves light stuff', es: 'El gusanito grita y empuja lo que pesa poco' } },
    trio_uva: { r: 20, densidade: 0.0045, poder: 'divide', cor: '#7b3aa6', suco: '#b46bd6',
      nome: { pt: 'Trio Uva-Passa', en: 'Raisin Trio', es: 'Trío Pasas' },
      dica: { pt: 'Toque no ar: vira 3 uvas!', en: 'Tap in the air: it splits into 3 grapes!', es: 'Toca en el aire: ¡se divide en 3 uvas!' } },
    pimenta_jato: { r: 18, densidade: 0.0045, poder: 'jato', cor: '#e2261c', suco: '#ff7b2e',
      nome: { pt: 'Pimenta Malagueta', en: 'Hot Chili Pepper', es: 'Guindilla Picante' },
      dica: { pt: 'Toque no ar: jato reto que fura madeira!', en: 'Tap in the air: a straight jet that drills through wood!', es: 'Toca en el aire: ¡un chorro recto que atraviesa la madera!' } },
    melancia_passada: { r: 30, densidade: 0.005, poder: 'bigorna', cor: '#3f9a3a', suco: '#ff5d73',
      nome: { pt: 'Melancia Passada', en: 'Mushy Watermelon', es: 'Sandía Pasada' },
      dica: { pt: 'Toque no ar: despenca como uma bigorna!', en: 'Tap in the air: it drops like an anvil!', es: 'Toca en el aire: ¡cae como un yunque!' } },
    abacaxi_azedo: { r: 24, densidade: 0.004, poder: 'explode', cor: '#f0b429', suco: '#ffe066',
      nome: { pt: 'Abacaxi Azêdo', en: 'Sour Pineapple', es: 'Piña Agria' },
      dica: { pt: 'Toque no ar: KABUM! (ou explode 1 s depois de bater)', en: 'Tap in the air: KABOOM! (or it blows 1 s after it lands)', es: 'Toca en el aire: ¡BUUM! (o explota 1 s después del golpe)' } }
  };
  var ORDEM_FRUTAS = ['maca_podre', 'trio_uva', 'pimenta_jato', 'melancia_passada', 'abacaxi_azedo'];

  // golpe = dano que tira o capacete do rato (ou o nocauteia, sem capacete)
  var PRAGAS = {
    mosca_zumbidora: { r: 15, sensor: true, nome: { pt: 'Mosca Zumbidora', en: 'Buzzy Fly', es: 'Mosca Zumbona' } },
    barata_cascuda: { r: 18, densidade: 0.002, vida: 240, nome: { pt: 'Barata Cascuda', en: 'Crusty Roach', es: 'Cucaracha Acorazada' } },
    rato_ladrao: { r: 23, densidade: 0.002, golpe: 200, nome: { pt: 'Rato Ladrão', en: 'Robber Rat', es: 'Ratón Ladrón' } }
  };

  // mult = multiplicador do dano no material; vida = limiar de quebra de um bloco 20 × 120 (os maiores aguentam mais)
  var MATERIAIS = {
    glass: { mult: 2.4, vida: 260, densidade: 0.0012, atrito: 0.12, atritoParado: 0.35, quique: 0.15, pontos: 150,
      nome: { pt: 'vidro', en: 'glass', es: 'vidrio' } },
    wood: { mult: 1, vida: 500, densidade: 0.0016, atrito: 0.7, atritoParado: 0.9, quique: 0.12, pontos: 250,
      nome: { pt: 'madeira', en: 'wood', es: 'madera' } },
    stone: { mult: 0.3, vida: 800, densidade: 0.0042, atrito: 0.9, atritoParado: 1, quique: 0.1, pontos: 600,
      nome: { pt: 'pedra', en: 'stone', es: 'piedra' } }
  };
  var TIPOS_BLOCO = ['wood_plank', 'wood_crate', 'glass_jar', 'glass_pane', 'stone_slab', 'stone_block'];

  var NIVEIS = {
    facil: { linha: 1, frutaExtra: 1, vidaPraga: 1 },     // linha até o impacto e uma maçã a mais
    medio: { linha: 0.35, frutaExtra: 0, vidaPraga: 1 },
    dificil: { linha: 0.2, frutaExtra: 0, vidaPraga: 1.6 }  // pragas mais resistentes
  };

  var PONTOS_PRAGA = 5000, PONTOS_FRUTA = 10000;

  function material(tipo) { return tipo.split('_')[0]; }
  // vida de um bloco: cresce com o tamanho (raiz da área), entre 0,6 e 2 vezes a de uma tábua 20 × 120
  function vidaBloco(tipo, w, h) {
    var m = MATERIAIS[material(tipo)];
    return m.vida * Math.max(0.6, Math.min(2, Math.sqrt(w * h / 2400)));
  }
  // Dano = Massa × VelocidadeRelativa² × MultiplicadorDoMaterial
  function dano(massa, vrel, mat) { return massa * vrel * vrel * (MATERIAIS[mat] ? MATERIAIS[mat].mult : 1); }
  // pontos de cada pedaço quando o bloco quebra (+10 a +500 por pedaço)
  function pontosPedacos(tipo, w, h) {
    var area = w * h, n = area > 3000 ? 4 : 3, total = MATERIAIS[material(tipo)].pontos * area / 2400, cada = [];
    for (var i = 0; i < n; i++) cada.push(Math.max(10, Math.min(500, Math.round(total / n / 10) * 10)));
    return cada;
  }
  function bonusFrutas(n) { return Math.max(0, n) * PONTOS_FRUTA; }
  // 0 = não venceu; vencer já vale 1 estrela; as metas parScores dão a 2ª e a 3ª
  function estrelas(pontos, par, venceu) {
    if (!venceu) return 0;
    return pontos >= par.threeStars ? 3 : pontos >= par.twoStars ? 2 : 1;
  }
  function velocidade(anguloGraus, forca) {
    var a = anguloGraus * Math.PI / 180, v = VMAX * Math.max(0, Math.min(1, forca));
    return { vx: Math.cos(a) * v, vy: -Math.sin(a) * v };
  }
  // pontos da parábola como o Matter.js calcula (velocidade += gravidade; posição += velocidade), até bater no chão
  function prever(x, y, vx, vy, passos) {
    var p = [];
    for (var i = 0; i < (passos || 400); i++) {
      vy += G; x += vx; y += vy;
      p.push({ x: x, y: y });
      if (y > CHAO) break;
    }
    return p;
  }
  // fila de frutas da fase no nível escolhido (fácil = uma maçã a mais no fim)
  function fila(fase, nivel) {
    var f = fase.slingshot.ammoQueue.slice(), n = (NIVEIS[nivel] || NIVEIS.medio).frutaExtra;
    for (var i = 0; i < n; i++) f.push('maca_podre');
    return f;
  }
  function formatar(n, lingua) {
    var s = String(Math.round(n)), sep = lingua === 'en' ? ',' : '.';
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  }

  return { CHAO: CHAO, PASSO: PASSO, G: G, VMAX: VMAX, FRUTAS: FRUTAS, ORDEM_FRUTAS: ORDEM_FRUTAS, PRAGAS: PRAGAS, MATERIAIS: MATERIAIS,
    TIPOS_BLOCO: TIPOS_BLOCO, NIVEIS: NIVEIS, PONTOS_PRAGA: PONTOS_PRAGA, PONTOS_FRUTA: PONTOS_FRUTA,
    material: material, vidaBloco: vidaBloco, dano: dano, pontosPedacos: pontosPedacos, bonusFrutas: bonusFrutas, estrelas: estrelas,
    velocidade: velocidade, prever: prever, fila: fila, formatar: formatar };
});
