/* Cozinha — dados do jogo: lugares da vila, ingredientes, utensílios, níveis e receitas (PT e EN).
   Receita nova = uma entrada em RECEITAS. Cada receita tem:
     ing    → ingredientes com a quantidade mínima nos níveis Médio e Difícil ({ id, q })
     facil  → os poucos ingredientes do nível Fácil ({ id: quantidade })
     passos → na ordem certa. Cada passo: id, a (ação), u (utensílio que a criança escolhe) e, se precisar:
              ing (ingredientes do passo), em (onde mexer/ligar), de (de onde despejar), min (nível mínimo: 2 = Médio,
              3 = Difícil), se (só entra se algum destes ingredientes estiver no nível), dep (passos que vêm antes;
              sem dep = o passo anterior; dep: [] = pode ser a qualquer hora, depois de lavar as mãos) e pt/en (texto próprio).
   Um passo cujos ingredientes não estão no nível sai sozinho (ex.: "pôr o fermento" não existe no Fácil).
   Carrega no navegador (window.CozinhaDados) e no Node (require), para os testes. */
(function (raiz) {
  'use strict';

  // Lugares da vila. "casa" é onde se cozinha.
  var LUGARES = [
    { id: 'rio', e: '🎣', pt: 'Rio', en: 'River', faz: ['Pescar', 'Fish'] },
    { id: 'pomar', e: '🌳', pt: 'Pomar', en: 'Orchard', faz: ['Colher frutas', 'Pick fruit'] },
    { id: 'horta', e: '🌱', pt: 'Horta', en: 'Vegetable garden', faz: ['Puxar legumes', 'Pull veggies'] },
    { id: 'galinheiro', e: '🐔', pt: 'Galinheiro', en: 'Hen house', faz: ['Pegar ovos', 'Collect eggs'] },
    { id: 'vaca', e: '🐄', pt: 'Fazendinha da Mimosa', en: "Mimosa's little farm", faz: ['Tirar leite', 'Get milk'] },
    { id: 'mercado', e: '🏪', pt: 'Mercadinho do Seu Zé', en: "Mr. Zé's shop", faz: ['Comprar', 'Buy'] },
    { id: 'vizinha', e: '👵', pt: 'Dona Cida, a vizinha', en: 'Mrs. Cida next door', faz: ['Pedir emprestado', 'Borrow'] },
    { id: 'casa', e: '🏠', pt: 'Casa', en: 'Home', faz: ['Cozinhar', 'Cook'] }
  ];

  // Ingredientes. de = lugar da natureza (grátis); preco = moedas no mercado (0 = o mercado não vende);
  // vizinha = a Dona Cida empresta. planta = onde nasce (PLANTAS); fato = frase que ensina de onde vem (PT, EN).
  // O que é feito pelas pessoas (farinha, açúcar, sal, manteiga, chocolate...) não tem "de": vem do mercadinho. e = emoji; s = desenho próprio (desenhos.js) quando não há emoji bom.
  var INGREDIENTES = [
    { id: 'peixe', e: '🐟', pt: ['peixe', 'peixes'], en: ['fish', 'fish'], de: 'rio', preco: 0,
      fato: ['O peixe vive na água do rio! 🐟', 'Fish live in the river water! 🐟'] },
    { id: 'laranja', e: '🍊', pt: ['laranja', 'laranjas'], en: ['orange', 'oranges'], de: 'pomar', preco: 1, planta: 'laranjeira',
      fato: ['A laranja nasce na laranjeira, uma árvore! 🍊', 'Oranges grow on the orange tree! 🍊'] },
    { id: 'banana', e: '🍌', pt: ['banana', 'bananas'], en: ['banana', 'bananas'], de: 'pomar', preco: 1, planta: 'bananeira',
      fato: ['A banana nasce em cachos na bananeira! 🍌', 'Bananas grow in bunches on the banana plant! 🍌'] },
    { id: 'maca', e: '🍎', pt: ['maçã', 'maçãs'], en: ['apple', 'apples'], de: 'pomar', preco: 1, planta: 'macieira',
      fato: ['A maçã nasce na macieira, uma árvore! 🍎', 'Apples grow on the apple tree! 🍎'] },
    { id: 'morango', e: '🍓', pt: ['morango', 'morangos'], en: ['strawberry', 'strawberries'], de: 'pomar', preco: 1, planta: 'morangueiro',
      fato: ['O morango nasce numa plantinha baixinha, pertinho do chão! 🍓', 'Strawberries grow on a small plant, close to the ground! 🍓'] },
    { id: 'uva', e: '🍇', pt: ['cacho de uva', 'cachos de uva'], en: ['bunch of grapes', 'bunches of grapes'], de: 'pomar', preco: 2, planta: 'parreira',
      fato: ['A uva nasce em cachos na parreira, uma planta que sobe e se enrola! 🍇', 'Grapes grow in bunches on a grapevine, a plant that climbs and curls! 🍇'] },
    { id: 'limao', e: '🍋', pt: ['limão', 'limões'], en: ['lemon', 'lemons'], de: 'pomar', preco: 1, planta: 'limoeiro',
      fato: ['O limão nasce no limoeiro, uma árvore com espinhos! 🍋', 'Lemons grow on the lemon tree, which has thorns! 🍋'] },
    { id: 'cenoura', e: '🥕', pt: ['cenoura', 'cenouras'], en: ['carrot', 'carrots'], de: 'horta', preco: 1, planta: 'pe-cenoura',
      fato: ['A cenoura cresce embaixo da terra; em cima só aparecem as folhas! 🥕', 'Carrots grow under the ground; only the leaves show on top! 🥕'] },
    { id: 'tomate', e: '🍅', pt: ['tomate', 'tomates'], en: ['tomato', 'tomatoes'], de: 'horta', preco: 1, planta: 'tomateiro',
      fato: ['O tomate nasce no tomateiro, amarrado numa estaca para ficar em pé! 🍅', 'Tomatoes grow on a tomato plant tied to a stake so it stands up! 🍅'] },
    { id: 'alface', e: '🥬', pt: ['pé de alface', 'pés de alface'], en: ['lettuce', 'lettuces'], de: 'horta', preco: 1, planta: 'pe-alface',
      fato: ['A alface cresce em cima da terra, como uma bola de folhas! 🥬', 'Lettuce grows on top of the soil, like a ball of leaves! 🥬'] },
    { id: 'batata', e: '🥔', pt: ['batata', 'batatas'], en: ['potato', 'potatoes'], de: 'horta', preco: 1, planta: 'pe-batata',
      fato: ['A batata cresce embaixo da terra, várias no mesmo pé! 🥔', 'Potatoes grow under the ground, many on one plant! 🥔'] },
    { id: 'cheiro', e: '🌿', pt: ['maço de cheiro-verde', 'maços de cheiro-verde'], en: ['bunch of herbs', 'bunches of herbs'], de: 'horta', preco: 1, planta: 'cheiro-verde',
      fato: ['Cheiro-verde é salsinha com cebolinha, folhas cheirosas da horta! 🌿', 'Cheiro-verde is parsley and chives, tasty leaves from the garden! 🌿'] },
    { id: 'ovo', e: '🥚', pt: ['ovo', 'ovos'], en: ['egg', 'eggs'], de: 'galinheiro', preco: 1, vizinha: true,
      fato: ['A galinha bota o ovo no ninho de palha! 🥚', 'The hen lays her egg in a straw nest! 🥚'] },
    { id: 'leite', e: '🥛', pt: ['xícara de leite', 'xícaras de leite'], en: ['cup of milk', 'cups of milk'], de: 'vaca', preco: 2, vizinha: true,
      fato: ['O leite vem da vaca! 🐄', 'Milk comes from the cow! 🐄'] },
    { id: 'farinha', e: '🌾', pt: ['xícara de farinha', 'xícaras de farinha'], en: ['cup of flour', 'cups of flour'], preco: 1, vizinha: true,
      fato: ['A farinha é feita de trigo moído no moinho! 🌾', 'Flour is made from wheat ground at the mill! 🌾'] },
    { id: 'acucar', s: 'acucar', pt: ['xícara de açúcar', 'xícaras de açúcar'], en: ['cup of sugar', 'cups of sugar'], preco: 1, vizinha: true,
      fato: ['O açúcar é feito da cana-de-açúcar!', 'Sugar is made from sugar cane!'] },
    { id: 'sal', e: '🧂', pt: ['pitada de sal', 'pitadas de sal'], en: ['pinch of salt', 'pinches of salt'], preco: 1, vizinha: true,
      fato: ['O sal vem da água do mar, que seca nas salinas! 🌊', 'Salt comes from sea water that dries in salt pans! 🌊'] },
    { id: 'oleo', s: 'oleo', pt: ['colher de óleo', 'colheres de óleo'], en: ['spoon of oil', 'spoons of oil'], preco: 2,
      fato: ['O óleo de cozinha é espremido de grãos, como a soja!', 'Cooking oil is pressed from seeds, like soybeans!'] },
    { id: 'fermento', s: 'fermento', pt: ['colher de fermento', 'colheres de fermento'], en: ['spoon of baking powder', 'spoons of baking powder'], preco: 1,
      fato: ['O fermento faz a massa crescer e ficar fofinha!', 'Baking powder makes the dough rise and get fluffy!'] },
    { id: 'manteiga', s: 'manteiga', pt: ['colher de manteiga', 'colheres de manteiga'], en: ['spoon of butter', 'spoons of butter'], preco: 1, vizinha: true,
      fato: ['A manteiga é feita da nata do leite, bem batida!', 'Butter is made by churning the cream from milk!'] },
    { id: 'chocolate', e: '🍫', pt: ['colher de chocolate', 'colheres de chocolate'], en: ['spoon of chocolate', 'spoons of chocolate'], preco: 2,
      fato: ['O chocolate é feito das sementes do cacau, que nasce no cacaueiro! 🍫', 'Chocolate is made from the seeds of the cacao tree! 🍫'] },
    { id: 'leitecond', s: 'leitecond', pt: ['lata de leite condensado', 'latas de leite condensado'], en: ['can of condensed milk', 'cans of condensed milk'], preco: 3,
      fato: ['O leite condensado é leite cozido com açúcar até engrossar!', 'Condensed milk is milk cooked with sugar until it gets thick!'] },
    { id: 'granulado', s: 'granulado', pt: ['colher de granulado', 'colheres de granulado'], en: ['spoon of sprinkles', 'spoons of sprinkles'], preco: 1,
      fato: ['O granulado é feito de chocolate e açúcar!', 'Sprinkles are made of chocolate and sugar!'] },
    { id: 'queijo', e: '🧀', pt: ['pedaço de queijo', 'pedaços de queijo'], en: ['piece of cheese', 'pieces of cheese'], preco: 2,
      fato: ['O queijo é feito de leite! 🧀', 'Cheese is made from milk! 🧀'] },
    { id: 'pao', e: '🍞', pt: ['fatia de pão', 'fatias de pão'], en: ['slice of bread', 'slices of bread'], preco: 1,
      fato: ['O pão é feito de farinha, água e fermento, assado no forno! 🍞', 'Bread is made of flour, water and yeast, baked in the oven! 🍞'] },
    { id: 'polvilho', s: 'polvilho', pt: ['xícara de polvilho', 'xícaras de polvilho'], en: ['cup of tapioca flour', 'cups of tapioca flour'], preco: 2,
      fato: ['O polvilho é feito da mandioca, uma raiz!', 'Tapioca flour is made from cassava, a root!'] },
    { id: 'mel', e: '🍯', pt: ['colher de mel', 'colheres de mel'], en: ['spoon of honey', 'spoons of honey'], preco: 2, vizinha: true,
      fato: ['O mel é feito pelas abelhas, com o néctar das flores! 🐝', 'Honey is made by bees from flower nectar! 🐝'] }
  ];

  // Plantas: onde cada fruta e cada legume nasce DE VERDADE (o jogo também ensina). Cada fruta só aparece na sua planta.
  // forma = como é desenhada (desenhos.js): arvore, bananeira (folhas compridas e cacho com o "coração" roxo),
  // rasteira (baixinha, no chão), parreira (trepadeira numa armação de madeira), raiz (o legume fica EMBAIXO da terra
  // e se arranca puxando), estaca (planta amarrada numa estaca), cabeca (bola de folhas em cima da terra), touceira (maço de folhas).
  var PLANTAS = [
    { id: 'macieira', lugar: 'pomar', forma: 'arvore', pt: 'macieira', en: 'apple tree' },
    { id: 'laranjeira', lugar: 'pomar', forma: 'arvore', pt: 'laranjeira', en: 'orange tree' },
    { id: 'limoeiro', lugar: 'pomar', forma: 'arvore', pt: 'limoeiro', en: 'lemon tree' },
    { id: 'bananeira', lugar: 'pomar', forma: 'bananeira', pt: 'bananeira', en: 'banana plant' },
    { id: 'morangueiro', lugar: 'pomar', forma: 'rasteira', pt: 'pé de morango', en: 'strawberry plant' },
    { id: 'parreira', lugar: 'pomar', forma: 'parreira', pt: 'parreira', en: 'grapevine' },
    { id: 'pe-cenoura', lugar: 'horta', forma: 'raiz', pt: 'pé de cenoura', en: 'carrot plant' },
    { id: 'pe-batata', lugar: 'horta', forma: 'raiz', pt: 'pé de batata', en: 'potato plant' },
    { id: 'tomateiro', lugar: 'horta', forma: 'estaca', pt: 'tomateiro', en: 'tomato plant' },
    { id: 'pe-alface', lugar: 'horta', forma: 'cabeca', pt: 'pé de alface', en: 'lettuce plant' },
    { id: 'cheiro-verde', lugar: 'horta', forma: 'touceira', pt: 'cheiro-verde', en: 'herb patch' }
  ];

  // Utensílios da cozinha. na = "na tigela" / "in the bowl" (para montar as frases). adulto = dica de segurança.
  var UTENSILIOS = [
    { id: 'pia', e: '🚰', pt: 'Pia', en: 'Sink', na: ['na pia', 'at the sink'] },
    { id: 'tabua', s: 'tabua', pt: 'Faca sem ponta e tábua', en: 'Safe knife and board', na: ['na tábua', 'on the board'], adulto: true },
    { id: 'tigela', e: '🥣', pt: 'Tigela', en: 'Bowl', na: ['na tigela', 'in the bowl'] },
    { id: 'colher', e: '🥄', pt: 'Colher', en: 'Spoon', na: ['com a colher', 'with the spoon'] },
    { id: 'batedeira', s: 'batedeira', pt: 'Batedeira', en: 'Mixer', na: ['na batedeira', 'in the mixer'], adulto: true },
    { id: 'liquidificador', s: 'liquidificador', pt: 'Liquidificador', en: 'Blender', na: ['no liquidificador', 'in the blender'], adulto: true },
    { id: 'espremedor', s: 'espremedor', pt: 'Espremedor', en: 'Juicer', na: ['no espremedor', 'in the juicer'] },
    { id: 'panela', s: 'panela', pt: 'Panela', en: 'Pot', na: ['na panela', 'in the pot'] },
    { id: 'frigideira', e: '🍳', pt: 'Frigideira', en: 'Frying pan', na: ['na frigideira', 'in the frying pan'] },
    { id: 'espatula', s: 'espatula', pt: 'Espátula', en: 'Spatula', na: ['com a espátula', 'with the spatula'] },
    { id: 'fogao', s: 'fogao', pt: 'Fogão', en: 'Stove', na: ['no fogão', 'on the stove'], adulto: true },
    { id: 'forma', s: 'forma', pt: 'Assadeira', en: 'Baking tray', na: ['na assadeira', 'on the baking tray'] },
    { id: 'forno', s: 'forno', pt: 'Forno', en: 'Oven', na: ['no forno', 'in the oven'], adulto: true },
    { id: 'geladeira', s: 'geladeira', pt: 'Geladeira', en: 'Fridge', na: ['na geladeira', 'in the fridge'] },
    { id: 'relogio', e: '⏰', pt: 'Relógio', en: 'Timer', na: ['no relógio', 'on the timer'] },
    { id: 'maos', e: '🤲', pt: 'Mãos', en: 'Hands', na: ['com as mãos', 'with your hands'] },
    { id: 'prato', e: '🍽️', pt: 'Prato', en: 'Plate', na: ['no prato', 'on the plate'] },
    { id: 'copo', e: '🥤', pt: 'Copo', en: 'Glass', na: ['no copo', 'in the glass'] }
  ];

  // Ações que a criança faz em cada passo (o app tem um jeitinho de brincar para cada uma).
  var ACOES = ['lavar', 'cortar', 'por', 'mexer', 'bater', 'ligar', 'desligar', 'despejar', 'virar', 'assar', 'gelar', 'esperar', 'maos', 'servir'];

  // Níveis. moedas: null = mercado grátis; margem = moedas a mais que o necessário. favores = empréstimos da vizinha.
  // dica: 'sempre' (utensílio certo brilha), 'metade' (metade dos passos brilha; os outros depois de um tempo ou de um erro),
  // 'erros' (só brilha depois de 2 erros). fichas: as fichas da receita vêm misturadas e a criança escolhe a ordem.
  // evento: alguma coisa acaba e precisa buscar de novo. tempo: o sol anda no céu (segundos); sem pressa de verdade.
  // zonaPeixe: metade da largura do círculo do anzol (fração do rio) — o peixe só é fisgado com o centro dentro dele;
  // velPeixe: velocidade média dos peixes (rio por segundo; cada peixe varia e muda de velocidade de vez em quando).
  var NIVEIS = [
    { id: 'facil', n: 1, e: '🌱', pt: 'Fácil', en: 'Easy', moedas: null, margem: 0, favores: 5, dica: 'sempre', fichas: false, distratores: 0, evento: false, tempo: 0, brilho: true, madura: 0.75, zonaPeixe: 0.14, velPeixe: 0.1,
      txt: ['Poucos ingredientes, tudo de graça e o passo certo brilhando.', 'Few ingredients, everything free and the right step glowing.'] },
    { id: 'medio', n: 2, e: '🌻', pt: 'Médio', en: 'Medium', moedas: true, margem: 4, favores: 3, dica: 'metade', fichas: false, distratores: 2, evento: false, tempo: 0, brilho: true, madura: 0.5, zonaPeixe: 0.08, velPeixe: 0.16,
      txt: ['Mais ingredientes, moedas para o mercado e menos ajuda.', 'More ingredients, coins for the shop and less help.'] },
    { id: 'dificil', n: 3, e: '🌳', pt: 'Difícil', en: 'Hard', moedas: true, margem: 1, favores: 2, dica: 'erros', fichas: true, distratores: 4, evento: true, tempo: 420, brilho: false, madura: 0.35, zonaPeixe: 0.05, velPeixe: 0.22,
      txt: ['Você escolhe a ordem dos passos, as moedas são contadas e o sol anda no céu.', 'You choose the order of the steps, coins are counted and the sun moves across the sky.'] }
  ];

  function P(id, a, u, o) { var p = { id: id, a: a, u: u }; if (o) for (var k in o) p[k] = o[k]; return p; }
  var LAVAR = function () { return P('lavar', 'lavar', 'pia'); };

  var RECEITAS = [
    { id: 'bolo-cenoura', e: '🍰', cor: '#ff9f43', pt: 'Bolo de cenoura', en: 'Carrot cake',
      ing: [{ id: 'cenoura', q: 3 }, { id: 'ovo', q: 3 }, { id: 'oleo', q: 1 }, { id: 'acucar', q: 2 }, { id: 'farinha', q: 2 }, { id: 'fermento', q: 1 }],
      facil: { cenoura: 2, ovo: 2, farinha: 2 },
      passos: [LAVAR(),
        P('cortar', 'cortar', 'tabua', { ing: ['cenoura'], dep: [] }),
        P('liq', 'por', 'liquidificador', { ing: ['cenoura', 'ovo', 'oleo'] }),
        P('bater', 'bater', 'liquidificador'),
        P('secos', 'por', 'tigela', { ing: ['farinha', 'acucar'], dep: [] }),
        P('juntar', 'despejar', 'tigela', { de: 'liquidificador', dep: ['bater', 'secos'] }),
        P('mexer', 'mexer', 'colher', { em: 'tigela' }),
        P('fermento', 'por', 'tigela', { ing: ['fermento'] }),
        P('mexer2', 'mexer', 'colher', { em: 'tigela', se: ['fermento'], pt: 'Mexa devagarinho para misturar o fermento', en: 'Stir gently to mix in the baking powder' }),
        P('forma', 'despejar', 'forma', { de: 'tigela' }),
        P('assar', 'assar', 'forno'),
        P('servir', 'servir', 'prato')] },

    { id: 'panqueca', e: '🥞', cor: '#f7b733', pt: 'Panqueca de banana', en: 'Banana pancakes',
      ing: [{ id: 'ovo', q: 2 }, { id: 'leite', q: 2 }, { id: 'farinha', q: 2 }, { id: 'oleo', q: 1 }, { id: 'sal', q: 1 }, { id: 'banana', q: 2 }, { id: 'mel', q: 1 }],
      facil: { ovo: 1, leite: 1, farinha: 1 },
      passos: [LAVAR(),
        P('liq', 'por', 'liquidificador', { ing: ['ovo', 'leite', 'farinha', 'oleo', 'sal'], dep: [] }),
        P('bater', 'bater', 'liquidificador'),
        P('cortarB', 'cortar', 'tabua', { ing: ['banana'], dep: [] }),
        P('ligar', 'ligar', 'fogao', { em: 'frigideira', dep: ['bater'] }),
        P('desp', 'despejar', 'frigideira', { de: 'liquidificador' }),
        P('virar', 'virar', 'espatula', { em: 'frigideira' }),
        P('desligar', 'desligar', 'fogao'),
        P('recheio', 'por', 'frigideira', { ing: ['banana', 'mel'], dep: ['desligar', 'cortarB'], pt: 'Enfeite a panqueca', en: 'Top the pancake' }),
        P('servir', 'servir', 'prato')] },

    { id: 'salada-frutas', e: '🍓', cor: '#ff5e7e', pt: 'Salada de frutas', en: 'Fruit salad',
      ing: [{ id: 'banana', q: 2 }, { id: 'maca', q: 2 }, { id: 'morango', q: 4 }, { id: 'uva', q: 1 }, { id: 'laranja', q: 2 }, { id: 'mel', q: 1 }],
      facil: { banana: 1, maca: 1, morango: 3 },
      passos: [LAVAR(),
        P('lavarF', 'lavar', 'pia', { ing: ['maca', 'morango', 'uva'] }),
        P('cortB', 'cortar', 'tabua', { ing: ['banana'], dep: [] }),
        P('cortM', 'cortar', 'tabua', { ing: ['maca'], dep: ['lavarF'] }),
        P('cortMo', 'cortar', 'tabua', { ing: ['morango'], dep: ['lavarF'] }),
        P('tigela', 'por', 'tigela', { ing: ['banana', 'maca', 'morango', 'uva'], dep: ['cortB', 'cortM', 'cortMo'] }),
        P('cortL', 'cortar', 'tabua', { ing: ['laranja'], dep: [] }),
        P('esprem', 'bater', 'espremedor', { ing: ['laranja'], pt: 'Esprema as laranjas no espremedor', en: 'Squeeze the oranges in the juicer' }),
        P('suco', 'despejar', 'tigela', { de: 'espremedor', se: ['laranja'], dep: ['tigela', 'esprem'] }),
        P('mel', 'por', 'tigela', { ing: ['mel'] }),
        P('mexer', 'mexer', 'colher', { em: 'tigela', pt: 'Mexa devagar para não amassar as frutas', en: 'Stir slowly so the fruit does not get squashed' }),
        P('gelar', 'gelar', 'geladeira', { min: 2 }),
        P('servir', 'servir', 'prato')] },

    { id: 'vitamina', e: '🍌', cor: '#ffd23f', pt: 'Vitamina de banana', en: 'Banana smoothie',
      ing: [{ id: 'banana', q: 2 }, { id: 'leite', q: 2 }, { id: 'mel', q: 1 }],
      facil: { banana: 1, leite: 1 },
      passos: [LAVAR(),
        P('gelarL', 'gelar', 'geladeira', { ing: ['leite'], min: 3, dep: [], pt: 'Deixe o leite gelar na geladeira', en: 'Let the milk get cold in the fridge' }),
        P('cortar', 'cortar', 'tabua', { ing: ['banana'], dep: [] }),
        P('liq', 'por', 'liquidificador', { ing: ['banana', 'leite', 'mel'], dep: ['cortar', 'gelarL'] }),
        P('bater', 'bater', 'liquidificador'),
        P('servir', 'servir', 'copo')] },

    { id: 'brigadeiro', e: '🍫', cor: '#8b5a3c', pt: 'Brigadeiro', en: 'Brigadeiro (chocolate truffles)',
      ing: [{ id: 'leitecond', q: 1 }, { id: 'chocolate', q: 2 }, { id: 'manteiga', q: 1 }, { id: 'granulado', q: 2 }],
      facil: { leitecond: 1, chocolate: 1 },
      passos: [LAVAR(),
        P('panela', 'por', 'panela', { ing: ['leitecond', 'chocolate', 'manteiga'] }),
        P('ligar', 'ligar', 'fogao', { em: 'panela' }),
        P('mexer', 'mexer', 'colher', { em: 'panela', pt: 'Mexa sem parar até desgrudar do fundo da panela', en: 'Keep stirring until it comes off the bottom of the pot' }),
        P('desligar', 'desligar', 'fogao'),
        P('esfriar', 'gelar', 'geladeira', { pt: 'Deixe esfriar na geladeira', en: 'Let it cool down in the fridge' }),
        P('bolinhas', 'maos', 'maos', { pt: 'Faça bolinhas com as mãos', en: 'Roll little balls with your hands' }),
        P('granulado', 'por', 'prato', { ing: ['granulado'], pt: 'Passe as bolinhas no granulado', en: 'Roll the balls in the sprinkles' }),
        P('servir', 'servir', 'prato')] },

    { id: 'pizza', e: '🍕', cor: '#e84a3c', pt: 'Pizza caseira', en: 'Homemade pizza',
      ing: [{ id: 'farinha', q: 3 }, { id: 'fermento', q: 1 }, { id: 'oleo', q: 1 }, { id: 'sal', q: 1 }, { id: 'tomate', q: 3 }, { id: 'queijo', q: 2 }, { id: 'cheiro', q: 1 }],
      facil: { farinha: 2, tomate: 2, queijo: 1 },
      passos: [LAVAR(),
        P('massa', 'por', 'tigela', { ing: ['farinha', 'fermento', 'sal', 'oleo'] }),
        P('sovar', 'maos', 'maos', { pt: 'Amasse bem a massa com as mãos', en: 'Knead the dough well with your hands' }),
        P('descansar', 'esperar', 'relogio', { min: 2, pt: 'Espere a massa descansar e crescer', en: 'Wait for the dough to rest and rise' }),
        P('abrir', 'maos', 'maos', { pt: 'Abra a massa na assadeira com as mãos', en: 'Spread the dough on the baking tray with your hands' }),
        P('cortT', 'cortar', 'tabua', { ing: ['tomate'], dep: [] }),
        P('cobrir', 'por', 'forma', { ing: ['tomate', 'queijo', 'cheiro'], dep: ['abrir', 'cortT'] }),
        P('assar', 'assar', 'forno'),
        P('servir', 'servir', 'prato')] },

    { id: 'sanduiche', e: '🥪', cor: '#7bc950', pt: 'Sanduíche natural', en: 'Fresh sandwich',
      ing: [{ id: 'pao', q: 2 }, { id: 'alface', q: 1 }, { id: 'tomate', q: 1 }, { id: 'cenoura', q: 1 }, { id: 'queijo', q: 1 }],
      facil: { pao: 2, alface: 1, queijo: 1 },
      passos: [LAVAR(),
        P('lavarV', 'lavar', 'pia', { ing: ['alface', 'tomate', 'cenoura'] }),
        P('cortT', 'cortar', 'tabua', { ing: ['tomate'], dep: ['lavarV'] }),
        P('ralar', 'cortar', 'tabua', { ing: ['cenoura'], dep: ['lavarV'], pt: 'Rale a cenoura bem fininha', en: 'Grate the carrot very thin' }),
        P('pao', 'por', 'prato', { ing: ['pao'], dep: [] }),
        P('recheio', 'por', 'prato', { ing: ['alface', 'tomate', 'cenoura', 'queijo'], dep: ['pao', 'cortT', 'ralar', 'lavarV'], pt: 'Coloque o recheio em cima do pão', en: 'Put the filling on the bread' }),
        P('fechar', 'maos', 'maos', { pt: 'Feche o sanduíche com a outra fatia de pão', en: 'Close the sandwich with the other slice of bread' }),
        P('metade', 'cortar', 'tabua', { ing: ['pao'], pt: 'Corte o sanduíche ao meio', en: 'Cut the sandwich in half' }),
        P('servir', 'servir', 'prato')] },

    { id: 'peixe-assado', e: '🥘', cor: '#3aa0e8', pt: 'Peixe assado com legumes', en: 'Baked fish with vegetables',
      ing: [{ id: 'peixe', q: 1 }, { id: 'batata', q: 3 }, { id: 'cenoura', q: 2 }, { id: 'tomate', q: 2 }, { id: 'limao', q: 1 }, { id: 'sal', q: 1 }, { id: 'oleo', q: 1 }],
      facil: { peixe: 1, batata: 2, tomate: 1 },
      passos: [LAVAR(),
        P('cortB', 'cortar', 'tabua', { ing: ['batata'], dep: [] }),
        P('cortC', 'cortar', 'tabua', { ing: ['cenoura'], dep: [] }),
        P('cortT', 'cortar', 'tabua', { ing: ['tomate'], dep: [] }),
        P('cortL', 'cortar', 'tabua', { ing: ['limao'], dep: [] }),
        P('temperar', 'por', 'forma', { ing: ['peixe', 'limao', 'sal'], dep: ['cortL'], pt: 'Coloque o peixe na assadeira e tempere', en: 'Put the fish on the baking tray and season it' }),
        P('legumes', 'por', 'forma', { ing: ['batata', 'cenoura', 'tomate', 'oleo'], dep: ['temperar', 'cortB', 'cortC', 'cortT'], pt: 'Coloque os legumes em volta do peixe', en: 'Put the vegetables around the fish' }),
        P('assar', 'assar', 'forno'),
        P('servir', 'servir', 'prato')] },

    { id: 'omelete', e: '🍳', cor: '#ffc93c', pt: 'Omelete', en: 'Omelette',
      ing: [{ id: 'ovo', q: 3 }, { id: 'sal', q: 1 }, { id: 'tomate', q: 1 }, { id: 'queijo', q: 1 }, { id: 'cheiro', q: 1 }, { id: 'oleo', q: 1 }],
      facil: { ovo: 2, tomate: 1 },
      passos: [LAVAR(),
        P('ovos', 'por', 'tigela', { ing: ['ovo', 'sal'], pt: 'Quebre os ovos na tigela', en: 'Crack the eggs into the bowl' }),
        P('bater', 'mexer', 'colher', { em: 'tigela', pt: 'Bata os ovos com a colher', en: 'Beat the eggs with the spoon' }),
        P('cortT', 'cortar', 'tabua', { ing: ['tomate'], dep: [] }),
        P('cortCh', 'cortar', 'tabua', { ing: ['cheiro'], dep: [] }),
        P('rech', 'por', 'tigela', { ing: ['tomate', 'queijo', 'cheiro'], dep: ['bater', 'cortT', 'cortCh'] }),
        P('ligar', 'ligar', 'fogao', { em: 'frigideira' }),
        P('oleoF', 'por', 'frigideira', { ing: ['oleo'] }),
        P('desp', 'despejar', 'frigideira', { de: 'tigela' }),
        P('virar', 'virar', 'espatula', { em: 'frigideira', min: 2 }),
        P('desligar', 'desligar', 'fogao'),
        P('servir', 'servir', 'prato')] },

    { id: 'suco-laranja', e: '🍊', cor: '#ff8c1a', pt: 'Suco de laranja', en: 'Orange juice',
      ing: [{ id: 'laranja', q: 4 }, { id: 'acucar', q: 1 }],
      facil: { laranja: 3 },
      passos: [LAVAR(),
        P('lavarL', 'lavar', 'pia', { ing: ['laranja'], min: 2 }),
        P('cortL', 'cortar', 'tabua', { ing: ['laranja'] }),
        P('esprem', 'bater', 'espremedor', { ing: ['laranja'], pt: 'Esprema as laranjas no espremedor', en: 'Squeeze the oranges in the juicer' }),
        P('desp', 'despejar', 'copo', { de: 'espremedor' }),
        P('acucar', 'por', 'copo', { ing: ['acucar'] }),
        P('mexer', 'mexer', 'colher', { em: 'copo', se: ['acucar'] }),
        P('gelar', 'gelar', 'geladeira', { min: 3, pt: 'Deixe o suco gelar um pouquinho', en: 'Let the juice chill for a little while' }),
        P('servir', 'servir', 'copo')] },

    { id: 'pao-queijo', e: '🧀', cor: '#f4c430', pt: 'Pão de queijo', en: 'Cheese bread',
      ing: [{ id: 'polvilho', q: 2 }, { id: 'leite', q: 1 }, { id: 'oleo', q: 1 }, { id: 'sal', q: 1 }, { id: 'ovo', q: 2 }, { id: 'queijo', q: 2 }],
      facil: { polvilho: 2, ovo: 1, queijo: 1 },
      passos: [LAVAR(),
        P('panela', 'por', 'panela', { ing: ['leite', 'oleo', 'sal'] }),
        P('ligar', 'ligar', 'fogao', { em: 'panela', se: ['leite', 'oleo', 'sal'] }),
        P('ferver', 'esperar', 'relogio', { se: ['leite', 'oleo', 'sal'], pt: 'Espere o leite ferver', en: 'Wait for the milk to boil' }),
        P('desligar', 'desligar', 'fogao', { se: ['leite', 'oleo', 'sal'] }),
        P('polv', 'por', 'tigela', { ing: ['polvilho'], dep: [] }),
        P('escaldar', 'despejar', 'tigela', { de: 'panela', se: ['leite', 'oleo', 'sal'], dep: ['desligar', 'polv'] }),
        P('mexer1', 'mexer', 'colher', { em: 'tigela', se: ['leite', 'oleo', 'sal'] }),
        P('resto', 'por', 'tigela', { ing: ['ovo', 'queijo'] }),
        P('mexer2', 'mexer', 'colher', { em: 'tigela', pt: 'Misture até a massa ficar lisinha', en: 'Mix until the dough is smooth' }),
        P('bolinhas', 'maos', 'maos', { pt: 'Faça bolinhas e coloque na assadeira', en: 'Roll little balls and put them on the baking tray' }),
        P('assar', 'assar', 'forno'),
        P('servir', 'servir', 'prato')] },

    { id: 'cookies', e: '🍪', cor: '#c68642', pt: 'Cookies de chocolate', en: 'Chocolate chip cookies',
      ing: [{ id: 'manteiga', q: 2 }, { id: 'acucar', q: 1 }, { id: 'ovo', q: 1 }, { id: 'farinha', q: 2 }, { id: 'chocolate', q: 2 }, { id: 'fermento', q: 1 }],
      facil: { ovo: 1, farinha: 1, chocolate: 2 },
      passos: [LAVAR(),
        P('creme', 'por', 'tigela', { ing: ['manteiga', 'acucar'] }),
        P('bater', 'bater', 'batedeira', { se: ['manteiga', 'acucar'], pt: 'Bata na batedeira até ficar cremoso', en: 'Mix in the mixer until creamy' }),
        P('ovo', 'por', 'tigela', { ing: ['ovo'] }),
        P('mexer1', 'mexer', 'colher', { em: 'tigela' }),
        P('secos', 'por', 'tigela', { ing: ['farinha', 'fermento'] }),
        P('mexer2', 'mexer', 'colher', { em: 'tigela' }),
        P('choc', 'por', 'tigela', { ing: ['chocolate'] }),
        P('bolinhas', 'maos', 'maos', { pt: 'Faça bolinhas e coloque na assadeira', en: 'Roll little balls and put them on the baking tray' }),
        P('assar', 'assar', 'forno'),
        P('servir', 'servir', 'prato')] }
  ];

  var D = { LUGARES: LUGARES, PLANTAS: PLANTAS, INGREDIENTES: INGREDIENTES, UTENSILIOS: UTENSILIOS, ACOES: ACOES, NIVEIS: NIVEIS, RECEITAS: RECEITAS };
  function porId(lista) { var m = {}; lista.forEach(function (x) { m[x.id] = x; }); return m; }
  D.lugar = porId(LUGARES); D.planta = porId(PLANTAS); D.ingrediente = porId(INGREDIENTES); D.utensilio = porId(UTENSILIOS); D.nivel = porId(NIVEIS); D.receita = porId(RECEITAS);
  if (typeof module !== 'undefined' && module.exports) module.exports = D; else raiz.CozinhaDados = D;
})(typeof self !== 'undefined' ? self : this);
