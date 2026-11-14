/* Cozinha — dados do jogo: lugares da vila, ingredientes, utensílios, níveis e receitas (PT, EN e ES).
   Receita nova = uma entrada em RECEITAS. Cada receita tem:
     ing    → ingredientes com a quantidade mínima nos níveis Médio e Difícil ({ id, q })
     facil  → os poucos ingredientes do nível Fácil ({ id: quantidade })
     passos → na ordem certa. Cada passo: id, a (ação), u (utensílio que a criança escolhe) e, se precisar:
              ing (ingredientes do passo), em (onde mexer/ligar), de (de onde despejar), min (nível mínimo: 2 = Médio,
              3 = Difícil), se (só entra se algum destes ingredientes estiver no nível), dep (passos que vêm antes;
              sem dep = o passo anterior; dep: [] = pode ser a qualquer hora, depois de lavar as mãos) e pt/en/es (texto próprio).
   Um passo cujos ingredientes não estão no nível sai sozinho (ex.: "pôr o fermento" não existe no Fácil).
   Carrega no navegador (window.CozinhaDados) e no Node (require), para os testes. */
(function (raiz) {
  'use strict';

  // Lugares da vila. "casa" é onde se cozinha.
  var LUGARES = [
    { id: 'rio', e: '🎣', pt: 'Rio', en: 'River', es: 'Río', faz: ['Pescar', 'Fish', 'Pescar'] },
    { id: 'pomar', e: '🌳', pt: 'Pomar', en: 'Orchard', es: 'Huerto frutal', faz: ['Colher frutas', 'Pick fruit', 'Coger fruta'] },
    { id: 'horta', e: '🌱', pt: 'Horta', en: 'Vegetable garden', es: 'Huerta', faz: ['Puxar legumes', 'Pull veggies', 'Sacar verduras'] },
    { id: 'galinheiro', e: '🐔', pt: 'Galinheiro', en: 'Hen house', es: 'Gallinero', faz: ['Pegar ovos', 'Collect eggs', 'Coger huevos'] },
    { id: 'vaca', e: '🐄', pt: 'Fazendinha da Mimosa', en: "Mimosa's little farm", es: 'Granjita de Mimosa', faz: ['Tirar leite', 'Get milk', 'Ordeñar'] },
    { id: 'mercado', e: '🏪', pt: 'Mercadinho do Seu Zé', en: "Mr. Zé's shop", es: 'Tienda de don Zé', faz: ['Comprar', 'Buy', 'Comprar'], dono: ['Seu Zé', 'Mr. Zé', 'don Zé'] },
    { id: 'vizinha', e: '👵', pt: 'Dona Cida, a vizinha', en: 'Mrs. Cida next door', es: 'Doña Cida, la vecina', faz: ['Pedir emprestado', 'Borrow', 'Pedir prestado'] },
    { id: 'padaria', e: '🥖', pt: 'Padaria do Seu Joaquim', en: "Mr. Joaquim's bakery", es: 'Panadería de don Joaquim', faz: ['Comprar pão', 'Buy bread', 'Comprar pan'], dono: ['Seu Joaquim', 'Mr. Joaquim', 'don Joaquim'] },
    { id: 'feira', e: '🍉', pt: 'Feira da Dona Rosa', en: "Mrs. Rosa's street market", es: 'Mercadillo de doña Rosa', faz: ['Frutas e legumes', 'Fruit and veg', 'Frutas y verduras'], dono: ['Dona Rosa', 'Mrs. Rosa', 'doña Rosa'] },
    { id: 'casa', e: '🏠', pt: 'Casa', en: 'Home', es: 'Casa', faz: ['Cozinhar', 'Cook', 'Cocinar'] }
  ];

  // Ingredientes. de = lugar da natureza (grátis); preco = moedas no mercado (0 = o mercado não vende);
  // vizinha = a Dona Cida empresta. planta = onde nasce (PLANTAS); fato = frase que ensina de onde vem (PT, EN, ES).
  // O que é feito pelas pessoas (farinha, açúcar, sal, manteiga, chocolate...) não tem "de": vem do mercadinho. e = emoji; s = desenho próprio (desenhos.js) quando não há emoji bom.
  var INGREDIENTES = [
    { id: 'peixe', e: '🐟', pt: ['peixe', 'peixes'], en: ['fish', 'fish'], es: ['pescado', 'pescados'], de: 'rio', preco: 0,
      fato: ['O peixe vive na água do rio! 🐟', 'Fish live in the river water! 🐟', '¡Los peces viven en el agua del río! 🐟'] },
    { id: 'laranja', e: '🍊', pt: ['laranja', 'laranjas'], en: ['orange', 'oranges'], es: ['naranja', 'naranjas'], de: 'pomar', preco: 1, planta: 'laranjeira',
      fato: ['A laranja nasce na laranjeira, uma árvore! 🍊', 'Oranges grow on the orange tree! 🍊', '¡La naranja crece en el naranjo, un árbol! 🍊'] },
    { id: 'banana', e: '🍌', pt: ['banana', 'bananas'], en: ['banana', 'bananas'], es: ['plátano', 'plátanos'], de: 'pomar', preco: 1, planta: 'bananeira',
      fato: ['A banana nasce em cachos na bananeira! 🍌', 'Bananas grow in bunches on the banana plant! 🍌', '¡El plátano crece en racimos en la platanera! 🍌'] },
    { id: 'maca', e: '🍎', pt: ['maçã', 'maçãs'], en: ['apple', 'apples'], es: ['manzana', 'manzanas'], de: 'pomar', preco: 1, planta: 'macieira',
      fato: ['A maçã nasce na macieira, uma árvore! 🍎', 'Apples grow on the apple tree! 🍎', '¡La manzana crece en el manzano, un árbol! 🍎'] },
    { id: 'morango', e: '🍓', pt: ['morango', 'morangos'], en: ['strawberry', 'strawberries'], es: ['fresa', 'fresas'], de: 'pomar', preco: 1, planta: 'morangueiro',
      fato: ['O morango nasce numa plantinha baixinha, pertinho do chão! 🍓', 'Strawberries grow on a small plant, close to the ground! 🍓', '¡La fresa crece en una plantita bajita, cerca del suelo! 🍓'] },
    { id: 'uva', e: '🍇', pt: ['cacho de uva', 'cachos de uva'], en: ['bunch of grapes', 'bunches of grapes'], es: ['racimo de uvas', 'racimos de uvas'], de: 'pomar', preco: 2, planta: 'parreira',
      fato: ['A uva nasce em cachos na parreira, uma planta que sobe e se enrola! 🍇', 'Grapes grow in bunches on a grapevine, a plant that climbs and curls! 🍇', '¡Las uvas crecen en racimos en la parra, que trepa y se enrosca! 🍇'] },
    { id: 'limao', e: '🍋', pt: ['limão', 'limões'], en: ['lemon', 'lemons'], es: ['limón', 'limones'], de: 'pomar', preco: 1, planta: 'limoeiro',
      fato: ['O limão nasce no limoeiro, uma árvore com espinhos! 🍋', 'Lemons grow on the lemon tree, which has thorns! 🍋', '¡El limón crece en el limonero, un árbol con espinas! 🍋'] },
    { id: 'jabuticaba', s: 'jabuticaba', pt: ['jabuticaba', 'jabuticabas'], en: ['jabuticaba', 'jabuticabas'], es: ['jabuticaba', 'jabuticabas'], de: 'pomar', preco: 1, planta: 'jaboticabeira',
      fato: ['A jabuticaba nasce grudadinha no tronco da jaboticabeira!', 'Jabuticabas grow stuck right on the trunk of the tree!', '¡La jabuticaba crece pegadita al tronco del árbol!'] },
    { id: 'cenoura', e: '🥕', pt: ['cenoura', 'cenouras'], en: ['carrot', 'carrots'], es: ['zanahoria', 'zanahorias'], de: 'horta', preco: 1, planta: 'pe-cenoura',
      fato: ['A cenoura cresce embaixo da terra; em cima só aparecem as folhas! 🥕', 'Carrots grow under the ground; only the leaves show on top! 🥕', '¡La zanahoria crece bajo la tierra; arriba solo se ven las hojas! 🥕'] },
    { id: 'tomate', e: '🍅', pt: ['tomate', 'tomates'], en: ['tomato', 'tomatoes'], es: ['tomate', 'tomates'], de: 'horta', preco: 1, planta: 'tomateiro',
      fato: ['O tomate nasce no tomateiro, amarrado numa estaca para ficar em pé! 🍅', 'Tomatoes grow on a tomato plant tied to a stake so it stands up! 🍅', '¡El tomate crece en la tomatera, atada a una estaca para estar de pie! 🍅'] },
    { id: 'alface', e: '🥬', pt: ['pé de alface', 'pés de alface'], en: ['lettuce', 'lettuces'], es: ['lechuga', 'lechugas'], de: 'horta', preco: 1, planta: 'pe-alface',
      fato: ['A alface cresce em cima da terra, como uma bola de folhas! 🥬', 'Lettuce grows on top of the soil, like a ball of leaves! 🥬', '¡La lechuga crece sobre la tierra, como una bola de hojas! 🥬'] },
    { id: 'batata', e: '🥔', pt: ['batata', 'batatas'], en: ['potato', 'potatoes'], es: ['patata', 'patatas'], de: 'horta', preco: 1, planta: 'pe-batata',
      fato: ['A batata cresce embaixo da terra, várias no mesmo pé! 🥔', 'Potatoes grow under the ground, many on one plant! 🥔', '¡La patata crece bajo la tierra, muchas en la misma planta! 🥔'] },
    { id: 'cheiro', e: '🌿', pt: ['maço de cheiro-verde', 'maços de cheiro-verde'], en: ['bunch of herbs', 'bunches of herbs'], es: ['manojo de hierbas', 'manojos de hierbas'], de: 'horta', preco: 1, planta: 'cheiro-verde',
      fato: ['Cheiro-verde é salsinha com cebolinha, folhas cheirosas da horta! 🌿', 'Cheiro-verde is parsley and chives, tasty leaves from the garden! 🌿', '¡Son perejil y cebollino, hojitas que huelen rico en la huerta! 🌿'] },
    { id: 'ovo', e: '🥚', pt: ['ovo', 'ovos'], en: ['egg', 'eggs'], es: ['huevo', 'huevos'], de: 'galinheiro', preco: 1, vizinha: true,
      fato: ['A galinha bota o ovo no ninho de palha! 🥚', 'The hen lays her egg in a straw nest! 🥚', '¡La gallina pone el huevo en un nido de paja! 🥚'] },
    { id: 'leite', e: '🥛', padaria: true, pt: ['xícara de leite', 'xícaras de leite'], en: ['cup of milk', 'cups of milk'], es: ['taza de leche', 'tazas de leche'], de: 'vaca', preco: 2, vizinha: true,
      fato: ['O leite vem da vaca! 🐄', 'Milk comes from the cow! 🐄', '¡La leche viene de la vaca! 🐄'] },
    { id: 'farinha', e: '🌾', pt: ['xícara de farinha', 'xícaras de farinha'], en: ['cup of flour', 'cups of flour'], es: ['taza de harina', 'tazas de harina'], preco: 1, vizinha: true,
      fato: ['A farinha é feita de trigo moído no moinho! 🌾', 'Flour is made from wheat ground at the mill! 🌾', '¡La harina se hace con trigo molido en el molino! 🌾'] },
    { id: 'acucar', s: 'acucar', pt: ['xícara de açúcar', 'xícaras de açúcar'], en: ['cup of sugar', 'cups of sugar'], es: ['taza de azúcar', 'tazas de azúcar'], preco: 1, vizinha: true,
      fato: ['O açúcar é feito da cana-de-açúcar!', 'Sugar is made from sugar cane!', '¡El azúcar se hace con la caña de azúcar!'] },
    { id: 'sal', e: '🧂', pt: ['pitada de sal', 'pitadas de sal'], en: ['pinch of salt', 'pinches of salt'], es: ['pizca de sal', 'pizcas de sal'], preco: 1, vizinha: true,
      fato: ['O sal vem da água do mar, que seca nas salinas! 🌊', 'Salt comes from sea water that dries in salt pans! 🌊', '¡La sal viene del agua del mar, que se seca en las salinas! 🌊'] },
    { id: 'oleo', s: 'oleo', pt: ['colher de óleo', 'colheres de óleo'], en: ['spoon of oil', 'spoons of oil'], es: ['cucharada de aceite', 'cucharadas de aceite'], preco: 2,
      fato: ['O óleo de cozinha é espremido de grãos, como a soja!', 'Cooking oil is pressed from seeds, like soybeans!', '¡El aceite de cocina se saca exprimiendo semillas, como las de girasol!'] },
    { id: 'fermento', s: 'fermento', pt: ['colher de fermento', 'colheres de fermento'], en: ['spoon of baking powder', 'spoons of baking powder'], es: ['cucharada de levadura', 'cucharadas de levadura'], preco: 1,
      fato: ['O fermento faz a massa crescer e ficar fofinha!', 'Baking powder makes the dough rise and get fluffy!', '¡La levadura hace que la masa crezca y quede esponjosita!'] },
    { id: 'manteiga', s: 'manteiga', padaria: true, pt: ['colher de manteiga', 'colheres de manteiga'], en: ['spoon of butter', 'spoons of butter'], es: ['cucharada de mantequilla', 'cucharadas de mantequilla'], preco: 1, vizinha: true,
      fato: ['A manteiga é feita da nata do leite, bem batida!', 'Butter is made by churning the cream from milk!', '¡La mantequilla se hace batiendo mucho la nata de la leche!'] },
    { id: 'chocolate', e: '🍫', pt: ['colher de chocolate', 'colheres de chocolate'], en: ['spoon of chocolate', 'spoons of chocolate'], es: ['cucharada de chocolate', 'cucharadas de chocolate'], preco: 2,
      fato: ['O chocolate é feito das sementes do cacau, que nasce no cacaueiro! 🍫', 'Chocolate is made from the seeds of the cacao tree! 🍫', '¡El chocolate se hace con las semillas del árbol de cacao! 🍫'] },
    { id: 'leitecond', s: 'leitecond', pt: ['lata de leite condensado', 'latas de leite condensado'], en: ['can of condensed milk', 'cans of condensed milk'], es: ['lata de leche condensada', 'latas de leche condensada'], preco: 3,
      fato: ['O leite condensado é leite cozido com açúcar até engrossar!', 'Condensed milk is milk cooked with sugar until it gets thick!', '¡La leche condensada es leche cocida con azúcar hasta que espesa!'] },
    { id: 'granulado', s: 'granulado', pt: ['colher de granulado', 'colheres de granulado'], en: ['spoon of sprinkles', 'spoons of sprinkles'], es: ['cucharada de fideos de chocolate', 'cucharadas de fideos de chocolate'], preco: 1,
      fato: ['O granulado é feito de chocolate e açúcar!', 'Sprinkles are made of chocolate and sugar!', '¡Los fideos de chocolate se hacen con chocolate y azúcar!'] },
    { id: 'queijo', e: '🧀', padaria: true, pt: ['pedaço de queijo', 'pedaços de queijo'], en: ['piece of cheese', 'pieces of cheese'], es: ['trozo de queso', 'trozos de queso'], preco: 2,
      fato: ['O queijo é feito de leite! 🧀', 'Cheese is made from milk! 🧀', '¡El queso se hace con leche! 🧀'] },
    { id: 'pao', e: '🍞', padaria: true, pt: ['fatia de pão', 'fatias de pão'], en: ['slice of bread', 'slices of bread'], es: ['rebanada de pan', 'rebanadas de pan'], preco: 1,
      fato: ['O padeiro assa o pão no forno da padaria, com farinha, água e fermento! 🍞', 'The baker bakes bread in the bakery oven, with flour, water and yeast! 🍞', '¡El panadero hornea el pan en la panadería, con harina, agua y levadura! 🍞'] },
    { id: 'gelatina-po', s: 'gelatina', pt: ['pacotinho de gelatina', 'pacotinhos de gelatina'], en: ['packet of jelly', 'packets of jelly'], es: ['sobrecito de gelatina', 'sobrecitos de gelatina'], preco: 2,
      fato: ['O pó some na água quente e, na geladeira, vira gelatina balançante!', 'The powder melts in hot water and turns wobbly in the fridge!', '¡El polvo se deshace en agua caliente y en la nevera se vuelve gelatina temblorosa!'] },
    { id: 'carne', e: '🥩', pt: ['pedaço de carne', 'pedaços de carne'], en: ['piece of meat', 'pieces of meat'], es: ['trozo de carne', 'trozos de carne'], preco: 3,
      fato: ['A carne vem do açougue, onde o açougueiro corta os pedaços! 🥩', 'Meat comes from the butcher, who cuts the pieces! 🥩', '¡La carne viene de la carnicería, donde el carnicero corta los trozos! 🥩'] },
    { id: 'polvilho', s: 'polvilho', pt: ['xícara de polvilho', 'xícaras de polvilho'], en: ['cup of tapioca flour', 'cups of tapioca flour'], es: ['taza de almidón de mandioca', 'tazas de almidón de mandioca'], preco: 2,
      fato: ['O polvilho é feito da mandioca, uma raiz!', 'Tapioca flour is made from cassava, a root!', '¡El almidón de mandioca se hace con la mandioca, una raíz!'] },
    { id: 'mel', e: '🍯', pt: ['colher de mel', 'colheres de mel'], en: ['spoon of honey', 'spoons of honey'], es: ['cucharada de miel', 'cucharadas de miel'], preco: 2, vizinha: true,
      fato: ['O mel é feito pelas abelhas, com o néctar das flores! 🐝', 'Honey is made by bees from flower nectar! 🐝', '¡Las abejas hacen la miel con el néctar de las flores! 🐝'] }
  ];

  // Plantas: onde cada fruta e cada legume nasce DE VERDADE (o jogo também ensina). Cada fruta só aparece na sua planta.
  // forma = como é desenhada (desenhos.js): arvore, bananeira (folhas compridas e cacho com o "coração" roxo),
  // rasteira (baixinha, no chão), parreira (trepadeira numa armação de madeira), tronco (a fruta nasce grudada no tronco: jaboticabeira), raiz (o legume fica EMBAIXO da terra
  // e se arranca puxando), estaca (planta amarrada numa estaca), cabeca (bola de folhas em cima da terra), touceira (maço de folhas).
  var PLANTAS = [
    { id: 'macieira', lugar: 'pomar', forma: 'arvore', pt: 'macieira', en: 'apple tree', es: 'manzano' },
    { id: 'laranjeira', lugar: 'pomar', forma: 'arvore', pt: 'laranjeira', en: 'orange tree', es: 'naranjo' },
    { id: 'limoeiro', lugar: 'pomar', forma: 'arvore', pt: 'limoeiro', en: 'lemon tree', es: 'limonero' },
    { id: 'bananeira', lugar: 'pomar', forma: 'bananeira', pt: 'bananeira', en: 'banana plant', es: 'platanera' },
    { id: 'morangueiro', lugar: 'pomar', forma: 'rasteira', pt: 'pé de morango', en: 'strawberry plant', es: 'planta de fresa' },
    { id: 'parreira', lugar: 'pomar', forma: 'parreira', pt: 'parreira', en: 'grapevine', es: 'parra' },
    { id: 'jaboticabeira', lugar: 'pomar', forma: 'tronco', pt: 'jaboticabeira', en: 'jabuticaba tree', es: 'árbol de jabuticaba' },
    { id: 'pe-cenoura', lugar: 'horta', forma: 'raiz', pt: 'pé de cenoura', en: 'carrot plant', es: 'planta de zanahoria' },
    { id: 'pe-batata', lugar: 'horta', forma: 'raiz', pt: 'pé de batata', en: 'potato plant', es: 'planta de patata' },
    { id: 'tomateiro', lugar: 'horta', forma: 'estaca', pt: 'tomateiro', en: 'tomato plant', es: 'tomatera' },
    { id: 'pe-alface', lugar: 'horta', forma: 'cabeca', pt: 'pé de alface', en: 'lettuce plant', es: 'planta de lechuga' },
    { id: 'cheiro-verde', lugar: 'horta', forma: 'touceira', pt: 'cheiro-verde', en: 'herb patch', es: 'matita de hierbas' }
  ];

  // Utensílios da cozinha. na = "na tigela" / "in the bowl" / "en el bol" (para montar as frases). adulto = dica de segurança.
  var UTENSILIOS = [
    { id: 'pia', e: '🚰', pt: 'Pia', en: 'Sink', es: 'Fregadero', na: ['na pia', 'at the sink', 'en el fregadero'] },
    { id: 'tabua', s: 'tabua', pt: 'Faca sem ponta e tábua', en: 'Safe knife and board', es: 'Cuchillo sin punta y tabla', na: ['na tábua', 'on the board', 'en la tabla'], adulto: true },
    { id: 'tigela', e: '🥣', pt: 'Tigela', en: 'Bowl', es: 'Bol', na: ['na tigela', 'in the bowl', 'en el bol'] },
    { id: 'colher', e: '🥄', pt: 'Colher', en: 'Spoon', es: 'Cuchara', na: ['com a colher', 'with the spoon', 'con la cuchara'] },
    { id: 'batedeira', s: 'batedeira', pt: 'Batedeira', en: 'Mixer', es: 'Batidora de varillas', na: ['na batedeira', 'in the mixer', 'en la batidora de varillas'], adulto: true },
    { id: 'liquidificador', s: 'liquidificador', pt: 'Liquidificador', en: 'Blender', es: 'Batidora de vaso', na: ['no liquidificador', 'in the blender', 'en la batidora de vaso'], adulto: true },
    { id: 'espremedor', s: 'espremedor', pt: 'Espremedor', en: 'Juicer', es: 'Exprimidor', na: ['no espremedor', 'in the juicer', 'en el exprimidor'] },
    { id: 'panela', s: 'panela', pt: 'Panela', en: 'Pot', es: 'Olla', na: ['na panela', 'in the pot', 'en la olla'] },
    { id: 'frigideira', e: '🍳', pt: 'Frigideira', en: 'Frying pan', es: 'Sartén', na: ['na frigideira', 'in the frying pan', 'en la sartén'] },
    { id: 'espatula', s: 'espatula', pt: 'Espátula', en: 'Spatula', es: 'Espátula', na: ['com a espátula', 'with the spatula', 'con la espátula'] },
    { id: 'fogao', s: 'fogao', pt: 'Fogão', en: 'Stove', es: 'Fogón', na: ['no fogão', 'on the stove', 'en el fogón'], adulto: true },
    { id: 'forma', s: 'forma', pt: 'Assadeira', en: 'Baking tray', es: 'Bandeja de horno', na: ['na assadeira', 'on the baking tray', 'en la bandeja'] },
    { id: 'forno', s: 'forno', pt: 'Forno', en: 'Oven', es: 'Horno', na: ['no forno', 'in the oven', 'en el horno'], adulto: true },
    { id: 'geladeira', s: 'geladeira', pt: 'Geladeira', en: 'Fridge', es: 'Nevera', na: ['na geladeira', 'in the fridge', 'en la nevera'] },
    { id: 'grelha', s: 'grelha', pt: 'Grelha', en: 'Grill', es: 'Parrilla', na: ['na grelha', 'on the grill', 'en la parrilla'] },
    { id: 'espeto', e: '🍢', pt: 'Espeto', en: 'Skewer', es: 'Brocheta', na: ['no espeto', 'on the skewer', 'en la brocheta'] },
    { id: 'relogio', e: '⏰', pt: 'Relógio', en: 'Timer', es: 'Reloj', na: ['no relógio', 'on the timer', 'en el reloj'] },
    { id: 'maos', e: '🤲', pt: 'Mãos', en: 'Hands', es: 'Manos', na: ['com as mãos', 'with your hands', 'con las manos'] },
    { id: 'prato', e: '🍽️', pt: 'Prato', en: 'Plate', es: 'Plato', na: ['no prato', 'on the plate', 'en el plato'] },
    { id: 'copo', e: '🥤', pt: 'Copo', en: 'Glass', es: 'Vaso', na: ['no copo', 'in the glass', 'en el vaso'] }
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
    { id: 'facil', n: 1, e: '🌱', pt: 'Fácil', en: 'Easy', es: 'Fácil', pessoas: 2, moedas: null, margem: 0, favores: 5, dica: 'sempre', fichas: false, distratores: 0, evento: false, tempo: 0, brilho: true, madura: 0.75, zonaPeixe: 0.14, velPeixe: 0.1,
      txt: ['Poucos ingredientes, tudo de graça e o passo certo brilhando.', 'Few ingredients, everything free and the right step glowing.', 'Pocos ingredientes, todo gratis y el paso correcto brillando.'] },
    { id: 'medio', n: 2, e: '🌻', pt: 'Médio', en: 'Medium', es: 'Medio', pessoas: 4, moedas: true, margem: 4, favores: 3, dica: 'metade', fichas: false, distratores: 2, evento: false, tempo: 0, brilho: true, madura: 0.5, zonaPeixe: 0.08, velPeixe: 0.16,
      txt: ['Mais ingredientes, moedas para o mercado e menos ajuda.', 'More ingredients, coins for the shop and less help.', 'Más ingredientes, monedas para la tienda y menos ayuda.'] },
    { id: 'dificil', n: 3, e: '🌳', pt: 'Difícil', en: 'Hard', es: 'Difícil', pessoas: 6, moedas: true, margem: 1, favores: 2, dica: 'erros', fichas: true, distratores: 4, evento: true, tempo: 420, brilho: false, madura: 0.35, zonaPeixe: 0.05, velPeixe: 0.22,
      txt: ['Você escolhe a ordem dos passos, as moedas são contadas e o sol anda no céu.', 'You choose the order of the steps, coins are counted and the sun moves across the sky.', 'Tú eliges el orden de los pasos, las monedas se cuentan y el sol se mueve en el cielo.'] }
  ];

  // Família à mesa (v0.8.0): quem pode comer a receita. "eu" (a criança) sempre come. A receita serve 2 pessoas; para
  // mais gente as quantidades crescem (logica.fatorDe). cor = roupa; cabelo = jeito do desenho (cenas.familia).
  var FAMILIA = [
    { id: 'eu', pt: 'Eu', en: 'Me', es: 'Yo', cor: '#ff8a3d', cabelo: 'chef' },
    { id: 'mamae', pt: 'Mamãe', en: 'Mom', es: 'Mamá', cor: '#ff5e9c', cabelo: 'longo' },
    { id: 'papai', pt: 'Papai', en: 'Dad', es: 'Papá', cor: '#3aa0e8', cabelo: 'curto' },
    { id: 'vovo-a', pt: 'Vovó', en: 'Grandma', es: 'Abuela', cor: '#8e6bff', cabelo: 'coque' },
    { id: 'vovo-o', pt: 'Vovô', en: 'Grandpa', es: 'Abuelo', cor: '#2bb673', cabelo: 'careca' },
    { id: 'irmao', pt: 'Irmão', en: 'Brother', es: 'Hermano', cor: '#e84a3c', cabelo: 'bone' },
    { id: 'irma', pt: 'Irmã', en: 'Sister', es: 'Hermana', cor: '#ffc93c', cabelo: 'chiquinhas' },
    { id: 'bebe', pt: 'Bebê', en: 'Baby', es: 'Bebé', cor: '#7fd3ff', cabelo: 'bebe' }
  ];

  function P(id, a, u, o) { var p = { id: id, a: a, u: u }; if (o) for (var k in o) p[k] = o[k]; return p; }
  var LAVAR = function () { return P('lavar', 'lavar', 'pia'); };

  var RECEITAS = [
    { id: 'bolo-cenoura', e: '🍰', cor: '#ff9f43', pt: 'Bolo de cenoura', en: 'Carrot cake', es: 'Tarta de zanahoria',
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
        P('mexer2', 'mexer', 'colher', { em: 'tigela', se: ['fermento'], pt: 'Mexa devagarinho para misturar o fermento', en: 'Stir gently to mix in the baking powder', es: 'Remueve despacito para que se una la levadura' }),
        P('forma', 'despejar', 'forma', { de: 'tigela' }),
        P('assar', 'assar', 'forno'),
        P('servir', 'servir', 'prato')] },

    { id: 'panqueca', e: '🥞', cor: '#f7b733', pt: 'Panqueca de banana', en: 'Banana pancakes', es: 'Tortitas de plátano',
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
        P('recheio', 'por', 'frigideira', { ing: ['banana', 'mel'], dep: ['desligar', 'cortarB'], pt: 'Enfeite a panqueca', en: 'Top the pancake', es: 'Decora la tortita' }),
        P('servir', 'servir', 'prato')] },

    { id: 'salada-frutas', e: '🍓', cor: '#ff5e7e', pt: 'Salada de frutas', en: 'Fruit salad', es: 'Ensalada de frutas',
      ing: [{ id: 'banana', q: 2 }, { id: 'maca', q: 2 }, { id: 'morango', q: 4 }, { id: 'uva', q: 1 }, { id: 'laranja', q: 2 }, { id: 'mel', q: 1 }],
      facil: { banana: 1, maca: 1, morango: 3 },
      passos: [LAVAR(),
        P('lavarF', 'lavar', 'pia', { ing: ['maca', 'morango', 'uva'] }),
        P('cortB', 'cortar', 'tabua', { ing: ['banana'], dep: [] }),
        P('cortM', 'cortar', 'tabua', { ing: ['maca'], dep: ['lavarF'] }),
        P('cortMo', 'cortar', 'tabua', { ing: ['morango'], dep: ['lavarF'] }),
        P('tigela', 'por', 'tigela', { ing: ['banana', 'maca', 'morango', 'uva'], dep: ['cortB', 'cortM', 'cortMo'] }),
        P('cortL', 'cortar', 'tabua', { ing: ['laranja'], dep: [] }),
        P('esprem', 'bater', 'espremedor', { ing: ['laranja'], pt: 'Esprema as laranjas no espremedor', en: 'Squeeze the oranges in the juicer', es: 'Exprime las naranjas en el exprimidor' }),
        P('suco', 'despejar', 'tigela', { de: 'espremedor', se: ['laranja'], dep: ['tigela', 'esprem'] }),
        P('mel', 'por', 'tigela', { ing: ['mel'] }),
        P('mexer', 'mexer', 'colher', { em: 'tigela', pt: 'Mexa devagar para não amassar as frutas', en: 'Stir slowly so the fruit does not get squashed', es: 'Remueve despacio para no aplastar las frutas' }),
        P('gelar', 'gelar', 'geladeira', { min: 2 }),
        P('servir', 'servir', 'prato')] },

    { id: 'vitamina', e: '🍌', cor: '#ffd23f', pt: 'Vitamina de banana', en: 'Banana smoothie', es: 'Batido de plátano',
      ing: [{ id: 'banana', q: 2 }, { id: 'leite', q: 2 }, { id: 'mel', q: 1 }],
      facil: { banana: 1, leite: 1 },
      passos: [LAVAR(),
        P('gelarL', 'gelar', 'geladeira', { ing: ['leite'], min: 3, dep: [], pt: 'Deixe o leite gelar na geladeira', en: 'Let the milk get cold in the fridge', es: 'Deja que la leche se enfríe en la nevera' }),
        P('cortar', 'cortar', 'tabua', { ing: ['banana'], dep: [] }),
        P('liq', 'por', 'liquidificador', { ing: ['banana', 'leite', 'mel'], dep: ['cortar', 'gelarL'] }),
        P('bater', 'bater', 'liquidificador'),
        P('servir', 'servir', 'copo')] },

    { id: 'brigadeiro', e: '🍫', cor: '#8b5a3c', pt: 'Brigadeiro', en: 'Brigadeiro (chocolate truffles)', es: 'Brigadeiro (trufas de chocolate)',
      ing: [{ id: 'leitecond', q: 1 }, { id: 'chocolate', q: 2 }, { id: 'manteiga', q: 1 }, { id: 'granulado', q: 2 }],
      facil: { leitecond: 1, chocolate: 1 },
      passos: [LAVAR(),
        P('panela', 'por', 'panela', { ing: ['leitecond', 'chocolate', 'manteiga'] }),
        P('ligar', 'ligar', 'fogao', { em: 'panela' }),
        P('mexer', 'mexer', 'colher', { em: 'panela', pt: 'Mexa sem parar até desgrudar do fundo da panela', en: 'Keep stirring until it comes off the bottom of the pot', es: 'Remueve sin parar hasta que se despegue del fondo de la olla' }),
        P('desligar', 'desligar', 'fogao'),
        P('esfriar', 'gelar', 'geladeira', { pt: 'Deixe esfriar na geladeira', en: 'Let it cool down in the fridge', es: 'Déjalo enfriar en la nevera' }),
        P('bolinhas', 'maos', 'maos', { pt: 'Faça bolinhas com as mãos', en: 'Roll little balls with your hands', es: 'Haz bolitas con las manos' }),
        P('granulado', 'por', 'prato', { ing: ['granulado'], pt: 'Passe as bolinhas no granulado', en: 'Roll the balls in the sprinkles', es: 'Pasa las bolitas por los fideos de chocolate' }),
        P('servir', 'servir', 'prato')] },

    { id: 'pizza', e: '🍕', cor: '#e84a3c', pt: 'Pizza caseira', en: 'Homemade pizza', es: 'Pizza casera',
      ing: [{ id: 'farinha', q: 3 }, { id: 'fermento', q: 1 }, { id: 'oleo', q: 1 }, { id: 'sal', q: 1 }, { id: 'tomate', q: 3 }, { id: 'queijo', q: 2 }, { id: 'cheiro', q: 1 }],
      facil: { farinha: 2, tomate: 2, queijo: 1 },
      passos: [LAVAR(),
        P('massa', 'por', 'tigela', { ing: ['farinha', 'fermento', 'sal', 'oleo'] }),
        P('sovar', 'maos', 'maos', { pt: 'Amasse bem a massa com as mãos', en: 'Knead the dough well with your hands', es: 'Amasa bien la masa con las manos' }),
        P('descansar', 'esperar', 'relogio', { min: 2, pt: 'Espere a massa descansar e crescer', en: 'Wait for the dough to rest and rise', es: 'Espera a que la masa repose y crezca' }),
        P('abrir', 'maos', 'maos', { pt: 'Abra a massa na assadeira com as mãos', en: 'Spread the dough on the baking tray with your hands', es: 'Extiende la masa en la bandeja con las manos' }),
        P('cortT', 'cortar', 'tabua', { ing: ['tomate'], dep: [] }),
        P('cobrir', 'por', 'forma', { ing: ['tomate', 'queijo', 'cheiro'], dep: ['abrir', 'cortT'] }),
        P('assar', 'assar', 'forno'),
        P('servir', 'servir', 'prato')] },

    { id: 'sanduiche', e: '🥪', cor: '#7bc950', pt: 'Sanduíche natural', en: 'Fresh sandwich', es: 'Sándwich vegetal',
      ing: [{ id: 'pao', q: 2 }, { id: 'alface', q: 1 }, { id: 'tomate', q: 1 }, { id: 'cenoura', q: 1 }, { id: 'queijo', q: 1 }],
      facil: { pao: 2, alface: 1, queijo: 1 },
      passos: [LAVAR(),
        P('lavarV', 'lavar', 'pia', { ing: ['alface', 'tomate', 'cenoura'] }),
        P('cortT', 'cortar', 'tabua', { ing: ['tomate'], dep: ['lavarV'] }),
        P('ralar', 'cortar', 'tabua', { ing: ['cenoura'], dep: ['lavarV'], pt: 'Rale a cenoura bem fininha', en: 'Grate the carrot very thin', es: 'Ralla la zanahoria bien finita' }),
        P('pao', 'por', 'prato', { ing: ['pao'], dep: [] }),
        P('recheio', 'por', 'prato', { ing: ['alface', 'tomate', 'cenoura', 'queijo'], dep: ['pao', 'cortT', 'ralar', 'lavarV'], pt: 'Coloque o recheio em cima do pão', en: 'Put the filling on the bread', es: 'Pon el relleno sobre el pan' }),
        P('fechar', 'maos', 'maos', { pt: 'Feche o sanduíche com a outra fatia de pão', en: 'Close the sandwich with the other slice of bread', es: 'Cierra el sándwich con la otra rebanada de pan' }),
        P('metade', 'cortar', 'tabua', { ing: ['pao'], pt: 'Corte o sanduíche ao meio', en: 'Cut the sandwich in half', es: 'Corta el sándwich por la mitad' }),
        P('servir', 'servir', 'prato')] },

    { id: 'peixe-assado', e: '🥘', cor: '#3aa0e8', pt: 'Peixe assado com legumes', en: 'Baked fish with vegetables', es: 'Pescado al horno con verduras',
      ing: [{ id: 'peixe', q: 1 }, { id: 'batata', q: 3 }, { id: 'cenoura', q: 2 }, { id: 'tomate', q: 2 }, { id: 'limao', q: 1 }, { id: 'sal', q: 1 }, { id: 'oleo', q: 1 }],
      facil: { peixe: 1, batata: 2, tomate: 1 },
      passos: [LAVAR(),
        P('cortB', 'cortar', 'tabua', { ing: ['batata'], dep: [] }),
        P('cortC', 'cortar', 'tabua', { ing: ['cenoura'], dep: [] }),
        P('cortT', 'cortar', 'tabua', { ing: ['tomate'], dep: [] }),
        P('cortL', 'cortar', 'tabua', { ing: ['limao'], dep: [] }),
        P('temperar', 'por', 'forma', { ing: ['peixe', 'limao', 'sal'], dep: ['cortL'], pt: 'Coloque o peixe na assadeira e tempere', en: 'Put the fish on the baking tray and season it', es: 'Pon el pescado en la bandeja y sazónalo' }),
        P('legumes', 'por', 'forma', { ing: ['batata', 'cenoura', 'tomate', 'oleo'], dep: ['temperar', 'cortB', 'cortC', 'cortT'], pt: 'Coloque os legumes em volta do peixe', en: 'Put the vegetables around the fish', es: 'Pon las verduras alrededor del pescado' }),
        P('assar', 'assar', 'forno'),
        P('servir', 'servir', 'prato')] },

    { id: 'omelete', e: '🍳', cor: '#ffc93c', pt: 'Omelete', en: 'Omelette', es: 'Tortilla francesa',
      ing: [{ id: 'ovo', q: 3 }, { id: 'sal', q: 1 }, { id: 'tomate', q: 1 }, { id: 'queijo', q: 1 }, { id: 'cheiro', q: 1 }, { id: 'oleo', q: 1 }],
      facil: { ovo: 2, tomate: 1 },
      passos: [LAVAR(),
        P('ovos', 'por', 'tigela', { ing: ['ovo', 'sal'], pt: 'Quebre os ovos na tigela', en: 'Crack the eggs into the bowl', es: 'Rompe los huevos en el bol' }),
        P('bater', 'mexer', 'colher', { em: 'tigela', pt: 'Bata os ovos com a colher', en: 'Beat the eggs with the spoon', es: 'Bate los huevos con la cuchara' }),
        P('cortT', 'cortar', 'tabua', { ing: ['tomate'], dep: [] }),
        P('cortCh', 'cortar', 'tabua', { ing: ['cheiro'], dep: [] }),
        P('rech', 'por', 'tigela', { ing: ['tomate', 'queijo', 'cheiro'], dep: ['bater', 'cortT', 'cortCh'] }),
        P('ligar', 'ligar', 'fogao', { em: 'frigideira' }),
        P('oleoF', 'por', 'frigideira', { ing: ['oleo'] }),
        P('desp', 'despejar', 'frigideira', { de: 'tigela' }),
        P('virar', 'virar', 'espatula', { em: 'frigideira', min: 2 }),
        P('desligar', 'desligar', 'fogao'),
        P('servir', 'servir', 'prato')] },

    { id: 'suco-laranja', e: '🍊', cor: '#ff8c1a', pt: 'Suco de laranja', en: 'Orange juice', es: 'Zumo de naranja',
      ing: [{ id: 'laranja', q: 4 }, { id: 'acucar', q: 1 }],
      facil: { laranja: 3 },
      passos: [LAVAR(),
        P('lavarL', 'lavar', 'pia', { ing: ['laranja'], min: 2 }),
        P('cortL', 'cortar', 'tabua', { ing: ['laranja'] }),
        P('esprem', 'bater', 'espremedor', { ing: ['laranja'], pt: 'Esprema as laranjas no espremedor', en: 'Squeeze the oranges in the juicer', es: 'Exprime las naranjas en el exprimidor' }),
        P('desp', 'despejar', 'copo', { de: 'espremedor' }),
        P('acucar', 'por', 'copo', { ing: ['acucar'] }),
        P('mexer', 'mexer', 'colher', { em: 'copo', se: ['acucar'] }),
        P('gelar', 'gelar', 'geladeira', { min: 3, pt: 'Deixe o suco gelar um pouquinho', en: 'Let the juice chill for a little while', es: 'Deja que el zumo se enfríe un ratito' }),
        P('servir', 'servir', 'copo')] },

    { id: 'pao-queijo', e: '🧀', cor: '#f4c430', pt: 'Pão de queijo', en: 'Cheese bread', es: 'Pan de queso',
      ing: [{ id: 'polvilho', q: 2 }, { id: 'leite', q: 1 }, { id: 'oleo', q: 1 }, { id: 'sal', q: 1 }, { id: 'ovo', q: 2 }, { id: 'queijo', q: 2 }],
      facil: { polvilho: 2, ovo: 1, queijo: 1 },
      passos: [LAVAR(),
        P('panela', 'por', 'panela', { ing: ['leite', 'oleo', 'sal'] }),
        P('ligar', 'ligar', 'fogao', { em: 'panela', se: ['leite', 'oleo', 'sal'] }),
        P('ferver', 'esperar', 'relogio', { se: ['leite', 'oleo', 'sal'], pt: 'Espere o leite ferver', en: 'Wait for the milk to boil', es: 'Espera a que la leche hierva' }),
        P('desligar', 'desligar', 'fogao', { se: ['leite', 'oleo', 'sal'] }),
        P('polv', 'por', 'tigela', { ing: ['polvilho'], dep: [] }),
        P('escaldar', 'despejar', 'tigela', { de: 'panela', se: ['leite', 'oleo', 'sal'], dep: ['desligar', 'polv'] }),
        P('mexer1', 'mexer', 'colher', { em: 'tigela', se: ['leite', 'oleo', 'sal'] }),
        P('resto', 'por', 'tigela', { ing: ['ovo', 'queijo'] }),
        P('mexer2', 'mexer', 'colher', { em: 'tigela', pt: 'Misture até a massa ficar lisinha', en: 'Mix until the dough is smooth', es: 'Mezcla hasta que la masa quede lisita' }),
        P('bolinhas', 'maos', 'maos', { pt: 'Faça bolinhas e coloque na assadeira', en: 'Roll little balls and put them on the baking tray', es: 'Haz bolitas y ponlas en la bandeja' }),
        P('assar', 'assar', 'forno'),
        P('servir', 'servir', 'prato')] },

    { id: 'cookies', e: '🍪', cor: '#c68642', pt: 'Cookies de chocolate', en: 'Chocolate chip cookies', es: 'Galletas de chocolate',
      ing: [{ id: 'manteiga', q: 2 }, { id: 'acucar', q: 1 }, { id: 'ovo', q: 1 }, { id: 'farinha', q: 2 }, { id: 'chocolate', q: 2 }, { id: 'fermento', q: 1 }],
      facil: { ovo: 1, farinha: 1, chocolate: 2 },
      passos: [LAVAR(),
        P('creme', 'por', 'tigela', { ing: ['manteiga', 'acucar'] }),
        P('bater', 'bater', 'batedeira', { se: ['manteiga', 'acucar'], pt: 'Bata na batedeira até ficar cremoso', en: 'Mix in the mixer until creamy', es: 'Bate en la batidora de varillas hasta que quede cremoso' }),
        P('ovo', 'por', 'tigela', { ing: ['ovo'] }),
        P('mexer1', 'mexer', 'colher', { em: 'tigela' }),
        P('secos', 'por', 'tigela', { ing: ['farinha', 'fermento'] }),
        P('mexer2', 'mexer', 'colher', { em: 'tigela' }),
        P('choc', 'por', 'tigela', { ing: ['chocolate'] }),
        P('bolinhas', 'maos', 'maos', { pt: 'Faça bolinhas e coloque na assadeira', en: 'Roll little balls and put them on the baking tray', es: 'Haz bolitas y ponlas en la bandeja' }),
        P('assar', 'assar', 'forno'),
        P('servir', 'servir', 'prato')] },

    { id: 'gelatina', e: '🍮', cor: '#e8344e', pt: 'Gelatina com frutas', en: 'Fruit jelly', es: 'Gelatina con frutas',
      ing: [{ id: 'gelatina-po', q: 1 }, { id: 'morango', q: 3 }, { id: 'uva', q: 1 }],
      facil: { 'gelatina-po': 1, morango: 2 },
      passos: [LAVAR(),
        P('ligar', 'ligar', 'fogao', { em: 'panela', pt: 'Esquente a água na panela', en: 'Heat the water in the pot', es: 'Calienta el agua en la olla' }),
        P('ferver', 'esperar', 'relogio', { pt: 'Espere a água ferver', en: 'Wait for the water to boil', es: 'Espera a que el agua hierva' }),
        P('desligar', 'desligar', 'fogao'),
        P('po', 'por', 'tigela', { ing: ['gelatina-po'], dep: [], pt: 'Coloque o pó de gelatina na tigela', en: 'Put the jelly powder in the bowl', es: 'Pon el polvo de gelatina en el bol' }),
        P('quente', 'despejar', 'tigela', { de: 'panela', dep: ['desligar', 'po'], pt: 'Despeje a água quente na tigela', en: 'Pour the hot water into the bowl', es: 'Vierte el agua caliente en el bol' }),
        P('mexer', 'mexer', 'colher', { em: 'tigela', pt: 'Mexa até o pó sumir', en: 'Stir until the powder disappears', es: 'Remueve hasta que el polvo desaparezca' }),
        P('lavarF', 'lavar', 'pia', { ing: ['morango', 'uva'], dep: [], min: 2 }),
        P('cortar', 'cortar', 'tabua', { ing: ['morango'], dep: ['lavarF'] }),
        P('tacas', 'despejar', 'copo', { de: 'tigela', dep: ['mexer'], pt: 'Despeje a gelatina nas tacinhas', en: 'Pour the jelly into the little cups', es: 'Vierte la gelatina en las copitas' }),
        P('frutas', 'por', 'copo', { ing: ['morango', 'uva'], dep: ['tacas', 'cortar'], pt: 'Coloque as frutinhas na gelatina', en: 'Put the fruit into the jelly', es: 'Pon las frutitas en la gelatina' }),
        P('gelar', 'gelar', 'geladeira', { pt: 'Leve à geladeira até ficar firme e balançante', en: 'Put it in the fridge until it is firm and wobbly', es: 'Llévala a la nevera hasta que quede firme y temblorosa' }),
        P('servir', 'servir', 'copo')] },

    { id: 'suco-jabuticaba', e: '🍇', cor: '#5b2160', pt: 'Suco de jabuticaba', en: 'Jabuticaba juice', es: 'Zumo de jabuticaba',
      ing: [{ id: 'jabuticaba', q: 6 }, { id: 'acucar', q: 1 }],
      facil: { jabuticaba: 4 },
      passos: [LAVAR(),
        P('lavarJ', 'lavar', 'pia', { ing: ['jabuticaba'] }),
        P('liq', 'por', 'liquidificador', { ing: ['jabuticaba', 'acucar'], pt: 'Coloque as jabuticabas e um copo de água no liquidificador', en: 'Put the jabuticabas and a glass of water in the blender', es: 'Pon las jabuticabas y un vaso de agua en la batidora de vaso' }),
        P('bater', 'bater', 'liquidificador'),
        P('coar', 'despejar', 'copo', { de: 'liquidificador', pt: 'Coe o suco e despeje no copo', en: 'Strain the juice and pour it into the glass', es: 'Cuela el zumo y viértelo en el vaso' }),
        P('gelar', 'gelar', 'geladeira', { min: 3, pt: 'Deixe o suco gelar um pouquinho', en: 'Let the juice chill for a little while', es: 'Deja que el zumo se enfríe un ratito' }),
        P('servir', 'servir', 'copo')] },

    { id: 'churrasco', e: '🍢', cor: '#c0392b', pt: 'Churrasquinho no espeto', en: 'BBQ skewers', es: 'Brochetas a la parrilla',
      ing: [{ id: 'carne', q: 2 }, { id: 'tomate', q: 2 }, { id: 'sal', q: 1 }, { id: 'pao', q: 2 }],
      facil: { carne: 2, tomate: 1 },
      passos: [LAVAR(),
        P('cortC', 'cortar', 'tabua', { ing: ['carne'], dep: [], pt: 'Corte a carne em cubinhos', en: 'Cut the meat into little cubes', es: 'Corta la carne en cubitos' }),
        P('lavarT', 'lavar', 'pia', { ing: ['tomate'], dep: [], min: 2 }),
        P('cortT', 'cortar', 'tabua', { ing: ['tomate'], dep: ['lavarT'] }),
        P('temperar', 'por', 'tigela', { ing: ['carne', 'sal'], dep: ['cortC'], pt: 'Coloque a carne na tigela para temperar', en: 'Put the meat in the bowl to season it', es: 'Pon la carne en el bol para sazonarla' }),
        P('montar', 'por', 'espeto', { ing: ['carne', 'tomate'], dep: ['temperar', 'cortT'], pt: 'Monte o espetinho: carne, tomate, carne...', en: 'Build the skewer: meat, tomato, meat...', es: 'Monta la brocheta: carne, tomate, carne...' }),
        P('ligar', 'ligar', 'fogao', { em: 'grelha' }),
        P('grelhar', 'esperar', 'relogio', { pt: 'Deixe o espetinho dourar na grelha', en: 'Let the skewer brown on the grill', es: 'Deja que la brocheta se dore en la parrilla' }),
        P('desligar', 'desligar', 'fogao'),
        P('pao', 'por', 'prato', { ing: ['pao'], dep: [], pt: 'Coloque o pãozinho no prato', en: 'Put the bread roll on the plate', es: 'Pon el panecillo en el plato' }),
        P('servir', 'servir', 'prato')] }
  ];

  var D = { FAMILIA: FAMILIA, LUGARES: LUGARES, PLANTAS: PLANTAS, INGREDIENTES: INGREDIENTES, UTENSILIOS: UTENSILIOS, ACOES: ACOES, NIVEIS: NIVEIS, RECEITAS: RECEITAS };
  function porId(lista) { var m = {}; lista.forEach(function (x) { m[x.id] = x; }); return m; }
  D.pessoa = porId(FAMILIA); D.lugar = porId(LUGARES); D.planta = porId(PLANTAS); D.ingrediente = porId(INGREDIENTES); D.utensilio = porId(UTENSILIOS); D.nivel = porId(NIVEIS); D.receita = porId(RECEITAS);
  if (typeof module !== 'undefined' && module.exports) module.exports = D; else raiz.CozinhaDados = D;
})(typeof self !== 'undefined' ? self : this);
