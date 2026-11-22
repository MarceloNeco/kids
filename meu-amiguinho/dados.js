/* Meu Amiguinho — os dados da oficina: a turma (bichinhos), cores, roupinhas, acessórios, vozes e as etapas.
   Tudo nos três idiomas: [português, inglês, espanhol]. Nada de desenho aqui (o desenho mora no arte.js);
   nada de tela (app.js). Roda no navegador (window.AmiguinhoDados) e no Node (require), para os testes.
   Nomes e personalidades da turma são deste jogo (originais). */
(function (raiz) {
  'use strict';

  // ---------- a jornada (7 etapas, cada uma com o seu selo oval numerado) ----------
  var ETAPAS = [
    { id: 'bicho', titulo: ['Me escolhe!', 'Pick me!', '¡Elígeme!'], sub: ['O bichinho', 'Your buddy', 'Tu amiguito'] },
    { id: 'pelo', titulo: ['Me pinta de carinho!', 'Color me in!', '¡Píntame con cariño!'], sub: ['Pelo e olhinhos', 'Fur and eyes', 'Pelo y ojitos'] },
    { id: 'fofura', titulo: ['Me deixa fofinho!', 'Make me fluffy!', '¡Hazme blandito!'], sub: ['Coração e fofura', 'Heart and fluff', 'Corazón y relleno'] },
    { id: 'roupa', titulo: ['Me veste!', 'Dress me!', '¡Vísteme!'], sub: ['Roupinha', 'Outfit', 'Ropita'] },
    { id: 'acess', titulo: ['Me enfeita!', 'Deck me out!', '¡Ponme guapo!'], sub: ['Acessórios', 'Accessories', 'Accesorios'] },
    { id: 'voz', titulo: ['Me dá uma voz!', 'Give me a voice!', '¡Dame una voz!'], sub: ['A voz do amiguinho', 'Your buddy\'s voice', 'La voz de tu amiguito'] },
    { id: 'nome', titulo: ['Me dá um nome!', 'Name me!', '¡Ponme nombre!'], sub: ['Nome e certidão', 'Name and certificate', 'Nombre y certificado'] }
  ];

  // ---------- cores (forma masculina em PT e ES: "laço azul", "lazo rojo") ----------
  var CORES = {
    'rosa': { hex: '#f59ac0', n: ['rosa', 'pink', 'rosa'] },
    'rosa-choque': { hex: '#ff3d8b', n: ['rosa-choque', 'hot pink', 'fucsia'] },
    'vermelho': { hex: '#e5404f', n: ['vermelho', 'red', 'rojo'] },
    'laranja': { hex: '#ff9a4d', n: ['laranja', 'orange', 'naranja'] },
    'amarelo': { hex: '#ffd447', n: ['amarelo', 'yellow', 'amarillo'] },
    'lima': { hex: '#c3e63c', n: ['verde-limão', 'lime green', 'verde lima'] },
    'menta': { hex: '#8fdcc0', n: ['verde-menta', 'mint', 'verde menta'] },
    'verde': { hex: '#4fae6a', n: ['verde', 'green', 'verde'] },
    'azul-bebe': { hex: '#a9d2f5', n: ['azul-bebê', 'baby blue', 'azul bebé'] },
    'azul': { hex: '#4f8fe0', n: ['azul', 'blue', 'azul'] },
    'marinho': { hex: '#2f3f6e', n: ['azul-marinho', 'navy blue', 'azul marino'] },
    'lilas': { hex: '#c9a8f0', n: ['lilás', 'lilac', 'lila'] },
    'roxo': { hex: '#8a5cd6', n: ['roxo', 'purple', 'morado'] },
    'marrom': { hex: '#8a5a3c', n: ['marrom', 'brown', 'marrón'] },
    'bege': { hex: '#e6cfa9', n: ['bege', 'beige', 'beige'] },
    'branco': { hex: '#fbfaf7', n: ['branco', 'white', 'blanco'] },
    'preto': { hex: '#2e2a33', n: ['preto', 'black', 'negro'] },
    'prata': { hex: '#c9ced8', n: ['prateado', 'silver', 'plateado'] },
    'dourado': { hex: '#f2c14e', n: ['dourado', 'gold', 'dorado'] }
  };
  var PALETAS = {
    lacos: ['rosa', 'rosa-choque', 'vermelho', 'laranja', 'amarelo', 'lima', 'menta', 'azul-bebe', 'azul', 'lilas', 'roxo', 'marrom', 'bege', 'branco', 'preto', 'prata', 'dourado'],
    glitter: ['preto', 'roxo', 'rosa', 'prata', 'dourado'],
    roupa: ['rosa', 'lilas', 'azul-bebe', 'menta', 'amarelo', 'laranja', 'vermelho', 'azul', 'marinho', 'roxo', 'verde', 'branco', 'preto'],
    oculos: ['vermelho', 'rosa', 'azul', 'roxo', 'preto', 'dourado'],
    sol: ['branco', 'preto', 'rosa-choque'],
    coracaoOc: ['vermelho', 'rosa'],
    geral: ['rosa', 'lilas', 'azul-bebe', 'menta', 'amarelo', 'vermelho', 'azul', 'roxo', 'preto', 'branco']
  };

  // ---------- pelo (cores lisas e degradês tie-dye pastel) ----------
  var PELOS = [
    { id: 'caramelo', cor: '#d9a066', n: ['caramelo', 'caramel', 'caramelo'], facil: 1 },
    { id: 'creme', cor: '#f1e2c6', n: ['creme', 'cream', 'crema'], facil: 1 },
    { id: 'branco', cor: '#f8f6f1', n: ['branco', 'white', 'blanco'] },
    { id: 'rosa', cor: '#f6b8cf', n: ['rosa', 'pink', 'rosa'], facil: 1 },
    { id: 'lilas', cor: '#cdb6ec', n: ['lilás', 'lilac', 'lila'], facil: 1 },
    { id: 'azul', cor: '#b2d2f2', n: ['azul', 'blue', 'azul'], facil: 1 },
    { id: 'menta', cor: '#b5e5cd', n: ['verde-menta', 'mint', 'verde menta'], facil: 1 },
    { id: 'amarelo', cor: '#f7df8c', n: ['amarelo', 'yellow', 'amarillo'] },
    { id: 'pessego', cor: '#f8c6a6', n: ['pêssego', 'peach', 'melocotón'] },
    { id: 'cinza', cor: '#c2c6cf', n: ['cinza', 'gray', 'gris'] },
    { id: 'cinza-azul', cor: '#aab6c9', n: ['cinza-azulado', 'blue-gray', 'gris azulado'] },
    { id: 'avela', cor: '#b38b6d', n: ['avelã', 'hazel', 'avellana'] },
    { id: 'chocolate', cor: '#8a5a3c', n: ['chocolate', 'chocolate', 'chocolate'] },
    { id: 'laranja', cor: '#f0a060', n: ['laranja', 'orange', 'naranja'] },
    { id: 'preto', cor: '#3b3640', n: ['preto', 'black', 'negro'] },
    { id: 'algodao', grad: ['#f9b9d6', '#d9c2f2', '#a9d8f5'], n: ['algodão-doce', 'cotton candy', 'algodón de azúcar'], facil: 1 },
    { id: 'arco-iris', grad: ['#f9b4c4', '#fbd9a0', '#f6ef9e', '#b8ecc8', '#b0d4f6', '#d4b8f2'], n: ['arco-íris', 'rainbow', 'arcoíris'] },
    { id: 'por-do-sol', grad: ['#ffd8a8', '#f7a9c0', '#c9a6ea'], n: ['pôr do sol', 'sunset', 'atardecer'] },
    { id: 'sereia', grad: ['#a8ecd8', '#9fd0f4', '#c3b2ee'], n: ['sereia', 'mermaid', 'sirena'] },
    { id: 'morango', grad: ['#f6a3c2', '#f8d99a', '#f6a3c2'], n: ['morango com mel', 'strawberry honey', 'fresa con miel'] }
  ];
  var OLHOS = [
    { id: 'preto', cor: '#2a2230', n: ['pretos', 'black', 'negros'] },
    { id: 'castanho', cor: '#7a4a28', n: ['castanhos', 'brown', 'marrones'] },
    { id: 'avela', cor: '#7f8a3e', n: ['castanho-esverdeados', 'hazel', 'avellana'] },
    { id: 'azul', cor: '#3f82d6', n: ['azuis', 'blue', 'azules'] },
    { id: 'verde', cor: '#3a9a5c', n: ['verdes', 'green', 'verdes'] },
    { id: 'lilas', cor: '#9a6ad8', n: ['lilás', 'lilac', 'lilas'] },
    { id: 'rosa', cor: '#e0609a', n: ['cor-de-rosa', 'pink', 'rosas'] },
    { id: 'mel', cor: '#d9a020', n: ['cor de mel', 'honey', 'color miel'] }
  ];
  var ESTILOS_OLHO = [
    { id: 'brilho', n: ['Brilhantes', 'Shiny', 'Brillantes'] },
    { id: 'cilios', n: ['Com cílios', 'With lashes', 'Con pestañas'] },
    { id: 'bordado', n: ['Bordados', 'Stitched', 'Bordados'] }
  ];
  var BOCHECHAS = [
    { id: 'rosa', n: ['Rosinha', 'Rosy', 'Rosadas'] },
    { id: 'pessego', n: ['Pêssego', 'Peach', 'Melocotón'] },
    { id: 'coracao', n: ['Coraçõezinhos', 'Little hearts', 'Corazoncitos'] },
    { id: 'sardas', n: ['Sardinhas', 'Freckles', 'Pecas'] },
    { id: 'nenhuma', n: ['Sem', 'None', 'Sin'] }
  ];
  var CORACOES = [
    { id: 'vermelho', cor: '#e8475f', n: ['vermelho', 'red', 'rojo'], facil: 1 },
    { id: 'rosa', cor: '#f58cb5', n: ['rosa', 'pink', 'rosa'], facil: 1 },
    { id: 'roxo', cor: '#a77be0', n: ['roxo', 'purple', 'morado'], facil: 1 },
    { id: 'dourado', cor: '#f2c14e', n: ['dourado', 'golden', 'dorado'], facil: 1 },
    { id: 'azul', cor: '#6fb6f0', n: ['azul', 'blue', 'azul'] },
    { id: 'arco-iris', cor: '#f58cb5', grad: ['#f9707f', '#ffc04d', '#ffe45c', '#6fd68a', '#5fb0f0', '#b07be6'], n: ['arco-íris', 'rainbow', 'arcoíris'] }
  ];

  // ---------- a turma: cada bichinho tem nome e personalidade próprios ----------
  // corpo: 'pe' (em pé, duas patas) ou 'q' (quatro patas); corpos = os que ele aceita (o primeiro é o padrão).
  // g: gênero da espécie em português (para a encomenda: "um ursinho", "uma coelhinha").
  var BASES = [
    { id: 'urso', g: 'm', corpos: ['pe'], pelo: 'caramelo', facil: 1,
      esp: ['ursinho', 'teddy bear', 'osito'], apelido: ['Biscoito', 'Biscuit', 'Galleta'],
      frase: ['Adora bolo de cenoura com cobertura de chocolate e dividir o pedaço maior.', 'Loves carrot cake with chocolate frosting, and always shares the biggest slice.', 'Le encanta la tarta de zanahoria con chocolate y siempre comparte el trozo más grande.'] },
    { id: 'coelha', g: 'f', corpos: ['pe'], pelo: 'branco', facil: 1,
      esp: ['coelhinha', 'bunny', 'conejita'], apelido: ['Algodão', 'Cotton', 'Algodón'],
      frase: ['Pula de alegria por qualquer coisa e coleciona laços de todas as cores.', 'Hops for joy at the smallest thing and collects bows in every color.', 'Salta de alegría por cualquier cosa y colecciona lazos de todos los colores.'] },
    { id: 'cachorro', g: 'm', corpos: ['pe', 'q'], pelo: 'creme', olhos: 'lilas', facil: 1,
      esp: ['cachorrinho', 'puppy', 'perrito'], apelido: ['Pipoca', 'Popcorn', 'Palomita'],
      frase: ['Esportista: corre, chuta bola e nunca perde um jogo no parque.', 'A little athlete: runs, kicks the ball and never misses a game at the park.', 'Deportista: corre, chuta la pelota y nunca se pierde un partido en el parque.'] },
    { id: 'gato', g: 'm', corpos: ['pe', 'q'], pelo: 'cinza', facil: 1,
      esp: ['gatinho', 'kitty', 'gatito'], apelido: ['Bigode', 'Whiskers', 'Bigotes'],
      frase: ['Curioso, vive explorando caixas de papelão e dorme no sol da janela.', 'Curious, always exploring cardboard boxes, and naps in the sunny window.', 'Curioso, siempre explora cajas de cartón y duerme la siesta al sol.'] },
    { id: 'gata-preta', g: 'f', corpos: ['pe', 'q'], pelo: 'preto', olhos: 'mel',
      esp: ['gatinha preta', 'black kitty', 'gatita negra'], apelido: ['Jabuticaba', 'Blackberry', 'Mora'],
      frase: ['Misteriosa e gentil, ama noite estrelada e guardar segredos.', 'Mysterious and kind, loves starry nights and keeping secrets.', 'Misteriosa y amable, adora las noches estrelladas y guardar secretos.'] },
    { id: 'panda', g: 'f', corpos: ['pe'], pelo: 'branco', facil: 1,
      esp: ['pandinha', 'panda', 'pandita'], apelido: ['Mochi', 'Mochi', 'Mochi'],
      frase: ['Brincalhona: faz cócegas em todo mundo e dá a risada mais gostosa.', 'A big joker: tickles everyone and has the best giggle.', 'Muy juguetona: hace cosquillas a todos y tiene la risa más contagiosa.'] },
    { id: 'ovelha', g: 'f', corpos: ['q', 'pe'], pelo: 'creme', olhos: 'avela', facil: 1,
      esp: ['ovelhinha', 'little lamb', 'ovejita'], apelido: ['Nuvem', 'Cloud', 'Nube'],
      frase: ['Dorminhoca e carinhosa: abraça todo mundo antes da soneca.', 'Sleepy and cuddly: hugs everyone before naptime.', 'Dormilona y cariñosa: abraza a todos antes de la siesta.'] },
    { id: 'preguica', g: 'f', corpos: ['pe'], pelo: 'cinza', facil: 1,
      esp: ['preguicinha', 'sloth', 'perezosita'], apelido: ['Paçoca', 'Peanut', 'Cacahuete'],
      frase: ['Faz tudo devagarinho e dá os abraços mais compridos do mundo.', 'Does everything nice and slow, and gives the longest hugs in the world.', 'Lo hace todo despacito y da los abrazos más largos del mundo.'] },
    { id: 'dino', g: 'm', corpos: ['pe'], pelo: 'menta', facil: 1,
      esp: ['dinossaurinho', 'little dino', 'dinosaurito'], apelido: ['Cometa', 'Comet', 'Cometa'],
      frase: ['Cientista: tem um telescópio e sonha em visitar as estrelas.', 'A scientist: has a telescope and dreams of visiting the stars.', 'Científico: tiene un telescopio y sueña con visitar las estrellas.'] },
    { id: 'girafa', g: 'f', corpos: ['q', 'pe'], pelo: 'amarelo',
      esp: ['girafinha', 'giraffe', 'jirafita'], apelido: ['Girassol', 'Sunflower', 'Girasol'],
      frase: ['Vê tudo lá de cima e conta as histórias mais compridas.', 'Sees everything from up high and tells the longest stories.', 'Lo ve todo desde arriba y cuenta las historias más largas.'] },
    { id: 'elefante', g: 'm', corpos: ['q', 'pe'], pelo: 'cinza-azul',
      esp: ['elefantinho', 'little elephant', 'elefantito'], apelido: ['Botão', 'Button', 'Botón'],
      frase: ['Tem a memória do tamanho das orelhas: nunca esquece um aniversário.', 'His memory is as big as his ears: never forgets a birthday.', 'Tiene una memoria tan grande como sus orejas: nunca olvida un cumpleaños.'] },
    { id: 'unicornio', g: 'f', corpos: ['pe', 'q'], pelo: 'branco', facil: 1,
      esp: ['unicórnio', 'unicorn', 'unicornio'], apelido: ['Aurora', 'Aurora', 'Aurora'],
      frase: ['Ama brilho, moda e arco-íris, e inventa um penteado novo por dia.', 'Loves sparkle, fashion and rainbows, and invents a new hairdo every day.', 'Le encantan el brillo, la moda y los arcoíris, e inventa un peinado nuevo cada día.'] },
    { id: 'capivara', g: 'f', corpos: ['q', 'pe'], pelo: 'avela', facil: 1,
      esp: ['capivarinha', 'capybara', 'capibarita'], apelido: ['Tapioca', 'Tapioca', 'Tapioca'],
      frase: ['A mais tranquila da turma: todo bicho quer sentar pertinho dela.', 'The calmest of the gang: every critter wants to sit right next to her.', 'La más tranquila de la pandilla: todos quieren sentarse a su lado.'] },
    { id: 'coala', g: 'f', corpos: ['pe'], pelo: 'cinza-azul', olhos: 'azul',
      esp: ['coalinha', 'koala', 'koalita'], apelido: ['Eucalipta', 'Gumdrop', 'Eucalipta'],
      frase: ['Abraçadeira profissional: se agarra em quem ama e não solta mais.', 'A professional hugger: holds on to the ones she loves and never lets go.', 'Abrazadora profesional: se agarra a quien quiere y ya no lo suelta.'] },
    { id: 'raposa', g: 'f', corpos: ['pe', 'q'], pelo: 'laranja',
      esp: ['raposinha', 'little fox', 'zorrita'], apelido: ['Faísca', 'Sparky', 'Chispa'],
      frase: ['Esperta e aventureira: tem sempre um mapa do tesouro na mochila.', 'Clever and adventurous: always has a treasure map in her backpack.', 'Lista y aventurera: siempre lleva un mapa del tesoro en la mochila.'] },
    { id: 'pinguim', g: 'm', corpos: ['pe'], pelo: 'marinho',
      esp: ['pinguinzinho', 'little penguin', 'pingüinito'], apelido: ['Picolé', 'Popsicle', 'Polo'],
      frase: ['Dançarino de primeira: escorrega no gelo e faz passinho no chão da sala.', 'A top dancer: slides on the ice and busts a move on the living room floor.', 'Un bailarín de primera: patina en el hielo y baila en el salón.'] },
    { id: 'leao', g: 'm', corpos: ['pe', 'q'], pelo: 'amarelo',
      esp: ['leãozinho', 'little lion', 'leoncito'], apelido: ['Juba', 'Mane', 'Melena'],
      frase: ['Corajoso de coração mole: ruge bem alto, mas tem medo de cosquinha.', 'Brave with a soft heart: roars really loud, but is scared of tickles.', 'Valiente con corazón blandito: ruge muy fuerte, pero le dan miedo las cosquillas.'] },
    { id: 'porquinho', g: 'm', corpos: ['pe', 'q'], pelo: 'rosa', facil: 1,
      esp: ['porquinho', 'piglet', 'cerdito'], apelido: ['Torresmo', 'Muffin', 'Rosquilla'],
      frase: ['Cozinheiro de mão cheia: faz panqueca colorida e pula em poça de lama.', 'A great little cook: makes colorful pancakes and jumps in mud puddles.', 'Un gran cocinero: hace tortitas de colores y salta en los charcos.'] }
  ];
  // o pelo cinza mesclado da preguiça é a textura dela; a máscara marrom é do desenho

  // ---------- roupinhas ----------
  // cores: true = escolhe a cor (PALETAS.roupa); estampa: true = escolhe a estampa; padrao = cor/estampa ao vestir
  // capuz: cobre a cabeça (tira o chapéu/tiara do desenho enquanto estiver vestida)
  var ROUPAS = [
    { id: 'nenhuma', n: ['Sem roupa', 'No clothes', 'Sin ropa'], e: ['sem roupa', 'with no clothes', 'sin ropa'], facil: 1 },
    { id: 'pijama', n: ['Pijaminha', 'Pajamas', 'Pijama'], e: ['de pijaminha', 'in pajamas', 'en pijama'], cores: 1, estampa: 1, padrao: { cor: 'lilas', estampa: 'estrelas' }, facil: 1 },
    { id: 'macacao', n: ['Macacão com pezinho e touca', 'Footed onesie and beanie', 'Mono con patucos y gorro'], e: ['de macacão com pezinho', 'in a footed onesie', 'con mono de patucos'], cores: 1, estampa: 1, capuz: 1, padrao: { cor: 'azul-bebe', estampa: 'esportes' } },
    { id: 'vestido', n: ['Vestidinho', 'Little dress', 'Vestidito'], e: ['de vestidinho', 'in a little dress', 'con vestidito'], cores: 1, estampa: 1, padrao: { cor: 'rosa', estampa: 'bolinhas' }, facil: 1 },
    { id: 'vestido-unicornio', n: ['Vestido lilás de tutu', 'Lilac tutu dress', 'Vestido lila con tutú'], e: ['de vestido lilás de tutu', 'in a lilac tutu dress', 'con vestido lila de tutú'] },
    { id: 'vestido-nuvens', n: ['Vestido de nuvens arco-íris', 'Rainbow cloud dress', 'Vestido de nubes arcoíris'], e: ['de vestido de nuvens', 'in a rainbow cloud dress', 'con vestido de nubes'], facil: 1 },
    { id: 'tule', n: ['Vestido de tule arco-íris', 'Rainbow tulle dress', 'Vestido de tul arcoíris'], e: ['de vestido de tule', 'in a tulle dress', 'con vestido de tul'] },
    { id: 'jardineira-saia', n: ['Jardineira com sainha', 'Pinafore with ruffle skirt', 'Peto con falda de volantes'], e: ['de jardineira com sainha', 'in a ruffle-skirt pinafore', 'con peto de falda'], cores: 1, padrao: { cor: 'lilas' }, facil: 1 },
    { id: 'jardineira', n: ['Jardineira jeans', 'Denim overalls', 'Peto vaquero'], e: ['de jardineira jeans', 'in denim overalls', 'con peto vaquero'], cores: 1, padrao: { cor: 'amarelo' } },
    { id: 'camiseta', n: ['Camiseta Melhores Amigos', 'Best Buddies tee', 'Camiseta Mejores Amigos'], e: ['de camiseta e bermuda', 'in a tee and shorts', 'con camiseta y bermudas'], cores: 1, padrao: { cor: 'branco' }, facil: 1 },
    { id: 'moletom', n: ['Moletom com capuz', 'Hoodie', 'Sudadera con capucha'], e: ['de moletom', 'in a hoodie', 'con sudadera'], cores: 1, estampa: 1, padrao: { cor: 'azul-bebe', estampa: 'controle' }, facil: 1 },
    { id: 'jaqueta-prata', n: ['Jaqueta prateada', 'Silver jacket', 'Chaqueta plateada'], e: ['de jaqueta prateada', 'in a silver jacket', 'con chaqueta plateada'] },
    { id: 'jaqueta-couro', n: ['Jaqueta de couro', 'Leather jacket', 'Chaqueta de cuero'], e: ['de jaqueta de couro', 'in a leather jacket', 'con chaqueta de cuero'] },
    { id: 'social', n: ['Camisa social azul', 'Blue dress shirt', 'Camisa azul de vestir'], e: ['de camisa social', 'in a dress shirt', 'con camisa de vestir'] },
    { id: 'futebol', n: ['Uniforme de futebol', 'Soccer kit', 'Equipación de fútbol'], e: ['de uniforme de futebol', 'in a soccer kit', 'con equipación de fútbol'], cores: 1, padrao: { cor: 'amarelo' }, facil: 1 },
    { id: 'tutu', n: ['Tutu de bailarina', 'Ballerina tutu', 'Tutú de bailarina'], e: ['de tutu de bailarina', 'in a ballerina tutu', 'con tutú de bailarina'], cores: 1, padrao: { cor: 'rosa' }, facil: 1 },
    { id: 'dino', n: ['Fantasia de dinossauro', 'Dinosaur costume', 'Disfraz de dinosaurio'], e: ['fantasiado de dinossauro', 'dressed as a dinosaur', 'disfrazado de dinosaurio'], cores: 1, capuz: 1, padrao: { cor: 'verde' } },
    { id: 'noel', n: ['Casaco de Papai Noel', 'Santa coat', 'Abrigo de Papá Noel'], e: ['de casaco de Papai Noel', 'in a Santa coat', 'con abrigo de Papá Noel'], capuz: 1, facil: 1 },
    { id: 'abobora', n: ['Fantasia de abóbora', 'Pumpkin costume', 'Disfraz de calabaza'], e: ['fantasiado de abóbora', 'dressed as a pumpkin', 'disfrazado de calabaza'], capuz: 1 },
    { id: 'pinguim', n: ['Capa de pinguim', 'Penguin cape', 'Capa de pingüino'], e: ['de capa de pinguim', 'in a penguin cape', 'con capa de pingüino'], capuz: 1 },
    { id: 'boneco-neve', n: ['Capa de boneco de neve', 'Snowman cape', 'Capa de muñeco de nieve'], e: ['de capa de boneco de neve', 'in a snowman cape', 'con capa de muñeco de nieve'], capuz: 1 }
  ];
  var ESTAMPAS = [
    { id: 'lisa', n: ['Lisa', 'Plain', 'Lisa'] },
    { id: 'bolinhas', n: ['Bolinhas', 'Polka dots', 'Lunares'] },
    { id: 'listras', n: ['Listras', 'Stripes', 'Rayas'] },
    { id: 'estrelas', n: ['Estrelinhas', 'Little stars', 'Estrellitas'] },
    { id: 'coracoes', n: ['Coraçõezinhos', 'Little hearts', 'Corazoncitos'] },
    { id: 'esportes', n: ['Bolas de esporte', 'Sports balls', 'Balones'] },
    { id: 'nuvens', n: ['Nuvenzinhas', 'Little clouds', 'Nubecitas'] },
    { id: 'controle', n: ['Controle de videogame', 'Game controller', 'Mando de videojuego'] }
  ];

  // ---------- acessórios: um por caixinha (lugar), vários ao mesmo tempo ----------
  var CAIXAS = [
    { id: 'laco', n: ['Laços', 'Bows', 'Lazos'] },
    { id: 'cabeca', n: ['Tiaras e chapéus', 'Headbands & hats', 'Diademas y sombreros'] },
    { id: 'olhos', n: ['Óculos', 'Glasses', 'Gafas'] },
    { id: 'pescoco', n: ['Colares', 'Necklaces', 'Collares'] },
    { id: 'pulso', n: ['Pulseiras', 'Bracelets', 'Pulseras'] },
    { id: 'costas', n: ['Mochilas e asas', 'Backpacks & wings', 'Mochilas y alas'] },
    { id: 'mao', n: ['Na mãozinha', 'In the paw', 'En la manita'] },
    { id: 'colo', n: ['Filhotinho', 'Little baby', 'Bebé'] },
    { id: 'abraco', n: ['Abraçadinho', 'Cuddle buddy', 'Abrazadito'] },
    { id: 'pes', n: ['Sapatos e patins', 'Shoes & skates', 'Zapatos y patines'] },
    { id: 'chao', n: ['Skate', 'Skateboard', 'Monopatín'] },
    { id: 'apoio', n: ['Apoios', 'Mobility', 'Apoyos'] }
  ];
  // e = como aparece na encomenda ("com laço azul"); {c} = nome da cor
  var ACESS = [
    { id: 'laco', caixa: 'laco', n: ['Laço', 'Bow', 'Lazo'], e: ['laço {c}', '{c} bow', 'lazo {c}'], paleta: 'lacos', cor: 'rosa', facil: 1 },
    { id: 'lacos2', caixa: 'laco', n: ['Dois laços', 'Two bows', 'Dos lazos'], e: ['dois laços {c}', 'two {c} bows', 'dos lazos {c}'], paleta: 'lacos', cor: 'azul', facil: 1 },
    { id: 'laco-glitter', caixa: 'laco', n: ['Laço de glitter', 'Glitter bow', 'Lazo de purpurina'], e: ['laço de glitter {c}', '{c} glitter bow', 'lazo de purpurina {c}'], paleta: 'glitter', cor: 'roxo' },
    { id: 'laco-pedrinhas', caixa: 'laco', n: ['Laço com pedrinhas', 'Rhinestone bow', 'Lazo con brillantes'], e: ['laço com pedrinhas', 'rhinestone bow', 'lazo con brillantes'], paleta: 'lacos', cor: 'bege' },
    { id: 'laco-gigante', caixa: 'laco', n: ['Laço gigante', 'Giant bow', 'Lazo gigante'], e: ['laço gigante', 'giant bow', 'lazo gigante'], paleta: 'lacos', cor: 'lima', facil: 1 },
    { id: 'mini-lacos', caixa: 'laco', n: ['Mini laços arco-íris', 'Rainbow mini bows', 'Minilazos arcoíris'], e: ['mini laços arco-íris', 'rainbow mini bows', 'minilazos arcoíris'] },
    { id: 'laco-fitas', caixa: 'laco', n: ['Laço de fitinhas', 'Ribbon bow', 'Lazo de cintas'], e: ['laço de fitinhas', 'ribbon bow', 'lazo de cintas'] },
    { id: 'tiara', caixa: 'cabeca', n: ['Tiara', 'Headband', 'Diadema'], e: ['tiara', 'headband', 'diadema'], paleta: 'geral', cor: 'rosa', facil: 1 },
    { id: 'coroa', caixa: 'cabeca', n: ['Coroa', 'Crown', 'Corona'], e: ['coroa', 'crown', 'corona'], facil: 1 },
    { id: 'coroa-flores', caixa: 'cabeca', n: ['Coroa de flores', 'Flower crown', 'Corona de flores'], e: ['coroa de flores', 'flower crown', 'corona de flores'] },
    { id: 'chapeu', caixa: 'cabeca', n: ['Chapéu de sol', 'Sun hat', 'Pamela'], e: ['chapéu de sol', 'sun hat', 'pamela'], paleta: 'geral', cor: 'amarelo' },
    { id: 'bone', caixa: 'cabeca', n: ['Boné', 'Cap', 'Gorra'], e: ['boné', 'cap', 'gorra'], paleta: 'geral', cor: 'vermelho', facil: 1 },
    { id: 'oculos', caixa: 'olhos', n: ['Óculos', 'Glasses', 'Gafas'], e: ['óculos {c}', '{c} glasses', 'gafas {c}'], paleta: 'oculos', cor: 'vermelho', facil: 1 },
    { id: 'oculos-sol', caixa: 'olhos', n: ['Óculos de sol', 'Sunglasses', 'Gafas de sol'], e: ['óculos de sol', 'sunglasses', 'gafas de sol'], paleta: 'sol', cor: 'preto', facil: 1 },
    { id: 'oculos-coracao', caixa: 'olhos', n: ['Óculos de coração', 'Heart glasses', 'Gafas de corazón'], e: ['óculos de coração', 'heart glasses', 'gafas de corazón'], paleta: 'coracaoOc', cor: 'rosa' },
    { id: 'colar-bolinhas', caixa: 'pescoco', n: ['Colar de bolinhas', 'Bead necklace', 'Collar de bolitas'], e: ['colar de bolinhas', 'bead necklace', 'collar de bolitas'], facil: 1 },
    { id: 'colar-coracao', caixa: 'pescoco', n: ['Colar de coração', 'Heart necklace', 'Collar de corazón'], e: ['colar de coração', 'heart necklace', 'collar de corazón'] },
    { id: 'lenco', caixa: 'pescoco', n: ['Lencinho', 'Bandana', 'Pañuelo'], e: ['lencinho', 'bandana', 'pañuelo'], paleta: 'geral', cor: 'vermelho' },
    { id: 'pulseira-strass', caixa: 'pulso', n: ['Pulseira de strass', 'Rhinestone bracelet', 'Pulsera de brillantes'], e: ['pulseira de strass', 'rhinestone bracelet', 'pulsera de brillantes'] },
    { id: 'pulseira-bolinhas', caixa: 'pulso', n: ['Pulseira de bolinhas', 'Bead bracelet', 'Pulsera de bolitas'], e: ['pulseira de bolinhas', 'bead bracelet', 'pulsera de bolitas'] },
    { id: 'mochila', caixa: 'costas', n: ['Mochila', 'Backpack', 'Mochila'], e: ['mochila', 'backpack', 'mochila'], paleta: 'geral', cor: 'azul', facil: 1 },
    { id: 'mochila-paete', caixa: 'costas', n: ['Mochila de paetê', 'Sequin backpack', 'Mochila de lentejuelas'], e: ['mochila de paetê', 'sequin backpack', 'mochila de lentejuelas'] },
    { id: 'asas', caixa: 'costas', n: ['Asinhas de fada', 'Fairy wings', 'Alitas de hada'], e: ['asinhas de fada', 'fairy wings', 'alitas de hada'], facil: 1 },
    { id: 'varinha', caixa: 'mao', n: ['Varinha de estrela', 'Star wand', 'Varita de estrella'], e: ['varinha', 'star wand', 'varita'], facil: 1 },
    { id: 'bolsa-coracao', caixa: 'mao', n: ['Bolsinha de coração', 'Heart purse', 'Bolsito de corazón'], e: ['bolsinha de coração', 'heart purse', 'bolsito de corazón'] },
    { id: 'bolsa-bicho', caixa: 'mao', n: ['Bolsa de gatinho', 'Kitty bag', 'Bolso de gatito'], e: ['bolsa de gatinho', 'kitty bag', 'bolso de gatito'] },
    { id: 'chaveiro', caixa: 'mao', n: ['Chaveirinho', 'Little keychain', 'Llaverito'], e: ['chaveirinho', 'little keychain', 'llaverito'] },
    { id: 'balao', caixa: 'mao', n: ['Balão de coração', 'Heart balloon', 'Globo de corazón'], e: ['balão', 'balloon', 'globo'], facil: 1 },
    { id: 'filhote', caixa: 'colo', n: ['Filhotinho no colo', 'Baby to cuddle', 'Bebé en brazos'], e: ['filhotinho no colo', 'a baby to cuddle', 'un bebé en brazos'], facil: 1 },
    { id: 'mini-urso', caixa: 'colo', n: ['Ursinho de bolso', 'Pocket teddy', 'Osito de bolsillo'], e: ['ursinho de bolso', 'pocket teddy', 'osito de bolsillo'] },
    { id: 'abracadinho-braco', caixa: 'abraco', n: ['Abraçado no braço', 'Hugging the arm', 'Abrazado al brazo'], e: ['unicorninho abraçado no braço', 'a little unicorn hugging the arm', 'un unicornito abrazado al brazo'] },
    { id: 'abracadinho-perna', caixa: 'abraco', n: ['Abraçado na perna', 'Hugging the leg', 'Abrazado a la pierna'], e: ['unicorninho abraçado na perna', 'a little unicorn hugging the leg', 'un unicornito abrazado a la pierna'] },
    { id: 'tenis', caixa: 'pes', n: ['Tênis branco', 'White sneakers', 'Zapatillas blancas'], e: ['tênis branco', 'white sneakers', 'zapatillas blancas'], facil: 1 },
    { id: 'tenis-brilho', caixa: 'pes', n: ['Tênis holográfico', 'Holographic high-tops', 'Zapatillas holográficas'], e: ['tênis holográfico', 'holographic high-tops', 'zapatillas holográficas'] },
    { id: 'botinhas', caixa: 'pes', n: ['Botinhas pretas', 'Black boots', 'Botitas negras'], e: ['botinhas pretas', 'black boots', 'botitas negras'] },
    { id: 'sapatilhas', caixa: 'pes', n: ['Sapatilhas', 'Ballet flats', 'Bailarinas'], e: ['sapatilhas', 'ballet flats', 'bailarinas'], paleta: 'geral', cor: 'rosa' },
    { id: 'patins', caixa: 'pes', n: ['Patins', 'Roller skates', 'Patines'], e: ['patins', 'roller skates', 'patines'], paleta: 'geral', cor: 'lilas', facil: 1 },
    { id: 'skate', caixa: 'chao', n: ['Skate', 'Skateboard', 'Monopatín'], e: ['skate', 'skateboard', 'monopatín'], paleta: 'geral', cor: 'azul', facil: 1 },
    { id: 'muletas', caixa: 'apoio', n: ['Muletas', 'Crutches', 'Muletas'], e: ['muletas', 'crutches', 'muletas'], so: 'pe' },
    { id: 'cadeira', caixa: 'apoio', n: ['Cadeira de rodas', 'Wheelchair', 'Silla de ruedas'], e: ['cadeira de rodas', 'a wheelchair', 'silla de ruedas'], facil: 1 }
  ];
  // escolher um tira o outro (não dá para usar os dois ao mesmo tempo)
  var CONFLITOS = [['patins', 'skate'], ['cadeira', 'skate'], ['cadeira', 'patins'], ['muletas', 'skate'], ['muletas', 'patins'], ['cadeira', 'abracadinho-perna']];

  // ---------- vozes ----------
  // fala: voz do aparelho no idioma escolhido (fininha, de urso, devagarinho); sons: feitos no WebAudio; minha: gravada aqui
  var VOZES = [
    { id: 'fina', tipo: 'fala', tom: 1.9, ritmo: 1.05, n: ['Fala fininha', 'Squeaky voice', 'Voz fina'], ico: '🗣️', facil: 1 },
    { id: 'grossa', tipo: 'fala', tom: 0.45, ritmo: 0.85, n: ['Fala de urso', 'Big bear voice', 'Voz de oso'], ico: '🐻', facil: 1 },
    { id: 'devagar', tipo: 'fala', tom: 1.1, ritmo: 0.55, n: ['Fala devagarinho', 'Slow and sleepy', 'Voz despacito'], ico: '🦥' },
    { id: 'canto', tipo: 'som', n: ['Cantarolar', 'Humming', 'Tararear'], ico: '🎵', facil: 1 },
    { id: 'apito', tipo: 'som', n: ['Apitinho', 'Squeak', 'Pitidito'], ico: '🐭', facil: 1 },
    { id: 'ronrom', tipo: 'som', n: ['Ronronar', 'Purr', 'Ronroneo'], ico: '😺' },
    { id: 'risada', tipo: 'som', n: ['Risadinha', 'Giggle', 'Risita'], ico: '😄' },
    { id: 'beijo', tipo: 'som', n: ['Beijinho', 'Kisses', 'Besitos'], ico: '💋' },
    { id: 'minha', tipo: 'gravada', n: ['Minha voz', 'My own voice', 'Mi voz'], ico: '🎙️', facil: 1 }
  ];
  var NOMES = ['Biscoito', 'Fofura', 'Algodão', 'Bolinha', 'Pipoca', 'Docinho', 'Nuvem', 'Mel', 'Paçoca', 'Jujuba', 'Pingo', 'Pudinzinho',
    'Brigadeiro', 'Cocada', 'Estrela', 'Lua', 'Sol', 'Bombom', 'Cookie', 'Tutti', 'Lili', 'Fifi', 'Bibi', 'Teteu', 'Nina', 'Lulu', 'Tico', 'Malu'];

  // ---------- nível ----------
  // Fácil: menos opções por etapa (as marcadas com facil); Médio: todas; Difícil: todas + a Encomenda
  var NIVEIS = { facil: { todas: false, encomenda: false }, medio: { todas: true, encomenda: false }, dificil: { todas: true, encomenda: true } };

  var D = { ETAPAS: ETAPAS, CORES: CORES, PALETAS: PALETAS, PELOS: PELOS, OLHOS: OLHOS, ESTILOS_OLHO: ESTILOS_OLHO, BOCHECHAS: BOCHECHAS,
    CORACOES: CORACOES, BASES: BASES, ROUPAS: ROUPAS, ESTAMPAS: ESTAMPAS, CAIXAS: CAIXAS, ACESS: ACESS, CONFLITOS: CONFLITOS, VOZES: VOZES,
    NOMES: NOMES, NIVEIS: NIVEIS };
  function porId(lista) { var m = {}; lista.forEach(function (x) { m[x.id] = x; }); return m; }
  D.base = porId(BASES); D.pelo = porId(PELOS); D.olho = porId(OLHOS); D.coracao = porId(CORACOES); D.roupa = porId(ROUPAS);
  D.acess = porId(ACESS); D.caixa = porId(CAIXAS); D.voz = porId(VOZES); D.estampa = porId(ESTAMPAS);
  raiz.AmiguinhoDados = D;
  if (typeof module === 'object' && module.exports) module.exports = D;
})(typeof window !== 'undefined' ? window : globalThis);
