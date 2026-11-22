/* Meu Pequeno Amiguinho — os dados da oficina: a turma (bichinhos), cores, roupinhas, acessórios, vozes e as etapas.
   Tudo nos três idiomas: [português, inglês, espanhol]. Nada de desenho aqui (o desenho mora no arte.js);
   nada de tela (app.js). Roda no navegador (window.AmiguinhoDados) e no Node (require), para os testes.
   Nomes e personalidades da turma são deste jogo (originais). */
(function (raiz) {
  'use strict';

  // ---------- a jornada (7 etapas, cada uma com o seu selo oval numerado) ----------
  var ETAPAS = [
    { id: 'bicho', titulo: ['Me escolhe!', 'Pick me!', '¡Elígeme!'], sub: ['O bichinho', 'Your buddy', 'Tu amiguito'] },
    { id: 'pelo', titulo: ['Me dá cor!', 'Color me in!', '¡Dame color!'], sub: ['Pelo e olhinhos', 'Fur and eyes', 'Pelo y ojitos'] },
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
    'dourado': { hex: '#f2c14e', n: ['dourado', 'gold', 'dorado'] },
    'turquesa': { hex: '#2ec4c4', n: ['azul-turquesa', 'turquoise', 'turquesa'] },
    'cinza': { hex: '#9aa0aa', n: ['cinza', 'gray', 'gris'] },
    'caramelo': { hex: '#c98a4b', n: ['caramelo', 'caramel', 'caramelo'] },
    'holo': { hex: '#cfd8f0', n: ['holográfico', 'holographic', 'holográfico'] },
    'azul-cinza': { hex: '#a9b8cc', n: ['azul-acinzentado', 'blue-gray', 'gris azulado'] }
  };
  var PALETAS = {
    lacos: ['rosa', 'rosa-choque', 'vermelho', 'laranja', 'amarelo', 'lima', 'menta', 'azul-bebe', 'azul', 'azul-cinza', 'lilas', 'roxo', 'marrom', 'bege', 'branco', 'preto', 'prata', 'dourado'],
    glitter: ['preto', 'roxo', 'rosa', 'prata', 'dourado'],
    roupa: ['rosa', 'lilas', 'azul-bebe', 'menta', 'amarelo', 'laranja', 'vermelho', 'azul', 'marinho', 'roxo', 'verde', 'branco', 'preto'],
    oculos: ['vermelho', 'rosa', 'azul', 'roxo', 'preto', 'dourado'],
    sol: ['branco', 'preto', 'rosa-choque'],
    coracaoOc: ['vermelho', 'rosa'],
    geral: ['rosa', 'lilas', 'azul-bebe', 'menta', 'amarelo', 'vermelho', 'azul', 'roxo', 'preto', 'branco'],
    roupa2: ['branco', 'cinza', 'marinho', 'preto', 'azul-bebe', 'turquesa', 'rosa', 'lilas', 'amarelo', 'vermelho', 'verde'],
    tenis: ['rosa', 'rosa-choque', 'dourado', 'prata', 'holo', 'branco', 'preto'],
    strass: ['rosa', 'rosa-choque', 'lilas', 'prata', 'dourado'],
    sapatilha: ['rosa', 'lilas', 'azul-bebe', 'menta', 'amarelo', 'vermelho', 'azul', 'marinho', 'roxo', 'preto', 'branco', 'dourado', 'prata'],
    bale: ['rosa', 'branco', 'lilas', 'azul-bebe', 'preto'],
    cadarco: ['preto', 'holo', 'marrom', 'branco', 'rosa', 'marinho'],
    bota: ['rosa', 'amarelo', 'preto', 'caramelo', 'branco', 'lilas', 'vermelho'],
    linha: ['preto', 'rosa', 'azul', 'roxo', 'branco'],
    patins: ['azul', 'rosa', 'preto', 'lilas', 'menta', 'laranja', 'azul-bebe', 'holo'],
    skate: ['rosa-choque', 'azul', 'lima', 'roxo', 'preto'],
    coleira: ['vermelho', 'holo', 'azul-bebe', 'azul', 'preto', 'rosa'],
    bone: ['marinho', 'rosa', 'vermelho', 'azul', 'preto', 'lima'],
    vivas: ['rosa', 'rosa-choque', 'vermelho', 'laranja', 'amarelo', 'lima', 'menta', 'verde', 'turquesa', 'azul-bebe', 'azul', 'marinho', 'lilas', 'roxo', 'marrom', 'caramelo', 'bege', 'branco', 'cinza', 'preto'],
    paete: ['rosa', 'prata', 'lilas', 'dourado', 'azul-bebe', 'turquesa', 'holo'],
    metal: ['prata', 'dourado', 'rosa-choque', 'vermelho', 'rosa', 'holo'],
    presente: ['laranja', 'rosa'],
    verniz: ['lima', 'rosa-choque', 'azul', 'roxo', 'amarelo', 'preto']
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
    { id: 'marinho', cor: '#46557a', n: ['azul-noite', 'midnight blue', 'azul noche'] },
    { id: 'brilho-lilas', cor: '#cdb6ec', brilho: 1, n: ['lilás com brilho', 'sparkly lilac', 'lila con brillo'] },
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
    { id: 'braquio', g: 'm', corpos: ['q'], pelo: 'menta',
      esp: ['dinossaurinho pescoçudo', 'long-neck dino', 'dinosaurito cuellilargo'], apelido: ['Pescoção', 'Treetop', 'Copa'],
      frase: ['Come folhinha lá do alto da árvore e dá carona para os amigos nas costas.', 'Munches leaves from the treetops and gives friends rides on his back.', 'Come hojitas de lo alto del árbol y lleva a sus amigos a caballito.'] },
    { id: 'poodle', g: 'm', corpos: ['q', 'pe'], pelo: 'chocolate', familia: 'cachorro',
      esp: ['poodlezinho', 'little poodle', 'caniche'], apelido: ['Cachinho', 'Curly', 'Rizos'],
      frase: ['Vaidoso e dançarino: penteia os cachinhos antes de cada passeio.', 'A dapper dancer: brushes his curls before every walk.', 'Coqueto y bailarín: se peina los rizos antes de cada paseo.'] },
    { id: 'corgi', g: 'm', corpos: ['q', 'pe'], pelo: 'laranja', familia: 'raposa',
      esp: ['cãozinho laranja', 'orange pup', 'perrito naranja'], apelido: ['Mostarda', 'Biscotti', 'Mostaza'],
      frase: ['Perninhas curtas e coração gigante: corre atrás de bolinha o dia todo.', 'Short legs and a giant heart: chases balls all day long.', 'Patitas cortas y corazón gigante: persigue la pelota todo el día.'] },
    { id: 'lulu', g: 'f', corpos: ['q', 'pe'], pelo: 'branco', familia: 'gato',
      esp: ['lulu fofinha', 'fluffy pom', 'pomerania'], apelido: ['Neve', 'Snowball', 'Copito'],
      frase: ['Uma nuvem que late: adora colo, laço e um carinho atrás da orelha.', 'A cloud that barks: loves cuddles, bows and a scratch behind the ear.', 'Una nube que ladra: le encantan los mimos, los lazos y las caricias.'] },
    { id: 'husky', g: 'm', corpos: ['q', 'pe'], pelo: 'cinza', olhos: 'azul', familia: 'gato',
      esp: ['huskyzinho', 'little husky', 'huskito'], apelido: ['Flocão', 'Blizzard', 'Ventisca'],
      frase: ['Aventureiro da neve: uiva junto com a música e ama correr no frio.', 'A snow explorer: howls along with the music and loves running in the cold.', 'Aventurero de la nieve: aúlla con la música y adora correr en el frío.'] },
    { id: 'gato-rajado', g: 'm', corpos: ['q', 'pe'], pelo: 'cinza', olhos: 'verde', familia: 'gato',
      esp: ['gatinho rajado', 'tabby kitty', 'gatito atigrado'], apelido: ['Listrado', 'Stripes', 'Rayitas'],
      frase: ['Caçador de novelo: tem listrinhas e um ronrom que acalma todo mundo.', 'A yarn hunter: has little stripes and a purr that calms everyone down.', 'Cazador de ovillos: tiene rayitas y un ronroneo que calma a todos.'] },
    { id: 'ovelha-preta', g: 'f', corpos: ['q', 'pe'], pelo: 'branco', familia: 'ovelha',
      esp: ['ovelhinha de carinha preta', 'black-faced lamb', 'ovejita de cara negra'], apelido: ['Pimenta', 'Pepper', 'Pimienta'],
      frase: ['Fala pouco e ouve muito: é a melhor amiga para contar segredos.', 'Says little and listens a lot: the best friend to tell secrets to.', 'Habla poco y escucha mucho: la mejor amiga para contar secretos.'] },
    { id: 'robo', g: 'm', corpos: ['pe'], pelo: 'azul', facil: 1,
      esp: ['robozinho', 'little robot', 'robotito'], apelido: ['Bip', 'Beep', 'Bip'],
      frase: ['Inventor de pelúcia: a carinha é uma telinha que acende de alegria.', 'A plush inventor: his face is a little screen that lights up with joy.', 'Inventor de peluche: su carita es una pantallita que se ilumina de alegría.'] },
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
    { id: 'polo', n: ['Camisa polo', 'Polo shirt', 'Polo'], e: ['de camisa polo', 'in a polo shirt', 'con polo'], cores: 1, paleta: 'roupa2', padrao: { cor: 'preto' } },
    { id: 'camiseta-lisa', n: ['Camiseta lisa e bermuda jeans', 'Plain tee and denim shorts', 'Camiseta lisa y bermudas vaqueras'], e: ['de camiseta e bermuda jeans', 'in a tee and denim shorts', 'con camiseta y bermudas vaqueras'], cores: 1, paleta: 'roupa2', padrao: { cor: 'cinza' }, facil: 1 },
    { id: 'play', n: ['Camiseta PLAY', 'PLAY tee', 'Camiseta PLAY'], e: ['de camiseta PLAY', 'in a PLAY tee', 'con camiseta PLAY'], cores: 1, paleta: 'roupa2', padrao: { cor: 'branco' } },
    { id: 'corta-vento', n: ['Corta-vento com zíper', 'Zip windbreaker', 'Cortavientos con cremallera'], e: ['de corta-vento', 'in a windbreaker', 'con cortavientos'], cores: 1, paleta: 'roupa2', padrao: { cor: 'turquesa' } },
    { id: 'jardineira-curta', n: ['Jardineira jeans curta', 'Denim shortalls', 'Peto vaquero corto'], e: ['de jardineira curta', 'in denim shortalls', 'con peto corto'], cores: 1, padrao: { cor: 'branco' } },
    { id: 'skatista', n: ['Colete jeans de skatista', 'Skater denim vest', 'Chaleco vaquero de skater'], e: ['de colete jeans', 'in a denim vest', 'con chaleco vaquero'], cores: 1, paleta: 'roupa2', padrao: { cor: 'branco' } },
    { id: 'vestido-doces', n: ['Vestido de docinhos', 'Candy dress', 'Vestido de golosinas'], e: ['de vestido de docinhos', 'in a candy dress', 'con vestido de golosinas'], cores: 1, padrao: { cor: 'rosa' } },
    { id: 'neve', n: ['Macacão de neve', 'Snowsuit', 'Mono de nieve'], e: ['de macacão de neve', 'in a snowsuit', 'con mono de nieve'], cores: 1, padrao: { cor: 'azul' }, capuz: 1 },
    { id: 'heroi-raio', heroi: 1, n: ['Herói do Raio', 'Lightning Hero', 'Héroe del Rayo'], e: ['de Herói do Raio', 'as the Lightning Hero', 'de Héroe del Rayo'], facil: 1 },
    { id: 'heroi-estrela', heroi: 1, n: ['Heroína Estrela', 'Star Heroine', 'Heroína Estrella'], e: ['de Heroína Estrela', 'as the Star Heroine', 'de Heroína Estrella'], facil: 1 },
    { id: 'heroi-coracao', heroi: 1, n: ['Herói Coração', 'Heart Hero', 'Héroe Corazón'], e: ['de Herói Coração', 'as the Heart Hero', 'de Héroe Corazón'] },
    { id: 'heroi-gota', heroi: 1, n: ['Heroína Gota', 'Droplet Heroine', 'Heroína Gota'], e: ['de Heroína Gota', 'as the Droplet Heroine', 'de Heroína Gota'] },
    { id: 'heroi-folha', heroi: 1, n: ['Herói Folha', 'Leaf Hero', 'Héroe Hoja'], e: ['de Herói Folha', 'as the Leaf Hero', 'de Héroe Hoja'] },
    { id: 'heroi-lua', heroi: 1, n: ['Heroína Lua', 'Moon Heroine', 'Heroína Luna'], e: ['de Heroína Lua', 'as the Moon Heroine', 'de Heroína Luna'] },
    { id: 'duende', n: ['Roupa de duende de Natal', 'Holiday elf outfit', 'Traje de duende navideño'], e: ['de duende de Natal', 'as a holiday elf', 'de duende navideño'], capuz: 1 },
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
    { id: 'controle', n: ['Controle de videogame', 'Game controller', 'Mando de videojuego'] },
    { id: 'praia', n: ['Pranchas e coqueiros', 'Surfboards and palms', 'Tablas y palmeras'] },
    { id: 'bichinhos', n: ['Bichinhos', 'Little critters', 'Animalitos'] }
  ];
  // patches para colar no peito da roupa: as letras de A a Z (a inicial do amiguinho) e figurinhas
  var PATCHES = [{ id: 'nenhum', n: ['Sem', 'None', 'Sin'] }, { id: 'coracao', n: ['Coração', 'Heart', 'Corazón'] }, { id: 'arco-iris', n: ['Arco-íris', 'Rainbow', 'Arcoíris'] },
    { id: 'estrela', n: ['Estrela', 'Star', 'Estrella'] }, { id: 'capivara', n: ['Capivara', 'Capybara', 'Capibara'] }];
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (l) { PATCHES.push({ id: 'letra-' + l, letra: l, n: [l, l, l] }); });

  // ---------- acessórios: um por caixinha (lugar), vários ao mesmo tempo ----------
  var CAIXAS = [
    { id: 'laco', ico: '🎀', n: ['Laços', 'Bows', 'Lazos'] },
    { id: 'cabeca', ico: '👑', n: ['Tiaras e chapéus', 'Headbands & hats', 'Diademas y sombreros'] },
    { id: 'olhos', ico: '👓', n: ['Óculos', 'Glasses', 'Gafas'] },
    { id: 'pescoco', ico: '📿', n: ['Colares', 'Necklaces', 'Collares'] },
    { id: 'pulso', ico: '💎', n: ['Pulseiras', 'Bracelets', 'Pulseras'] },
    { id: 'costas', ico: '👜', n: ['Bolsas e mochilas', 'Bags & backpacks', 'Bolsos y mochilas'] },
    { id: 'asas', ico: '🧚', n: ['Asinhas', 'Little wings', 'Alitas'] },
    { id: 'mao', ico: '🪄', n: ['Na mãozinha', 'In the paw', 'En la manita'] },
    { id: 'colo', ico: '🧸', n: ['Filhotinho', 'Little baby', 'Bebé'] },
    { id: 'abraco', ico: '🦄', n: ['Abraçadinho', 'Cuddle buddy', 'Abrazadito'] },
    { id: 'pes', ico: '👟', n: ['Sapatos e patins', 'Shoes & skates', 'Zapatos y patines'] },
    { id: 'chao', ico: '🛹', n: ['Skate', 'Skateboard', 'Monopatín'] },
    { id: 'apoio', ico: '♿', n: ['Apoios', 'Mobility', 'Apoyos'] }
  ];
  // e = como aparece na encomenda ("com laço azul"); {c} = nome da cor
  var ACESS = [
    { id: 'laco', caixa: 'laco', n: ['Laço', 'Bow', 'Lazo'], e: ['laço {c}', '{c} bow', 'lazo {c}'], paleta: 'lacos', cor: 'rosa', facil: 1 },
    { id: 'lacos2', caixa: 'laco', n: ['Dois laços', 'Two bows', 'Dos lazos'], e: ['laço duplo {c}', '{c} double bows', 'lazo doble {c}'], paleta: 'lacos', cor: 'azul', facil: 1 },
    { id: 'laco-glitter', caixa: 'laco', n: ['Laço de glitter', 'Glitter bow', 'Lazo de purpurina'], e: ['laço de glitter {c}', '{c} glitter bow', 'lazo de purpurina {c}'], paleta: 'glitter', cor: 'roxo' },
    { id: 'laco-pedrinhas', caixa: 'laco', n: ['Laço com pedrinhas', 'Rhinestone bow', 'Lazo con brillantes'], e: ['laço com pedrinhas', 'rhinestone bow', 'lazo con brillantes'], paleta: 'lacos', cor: 'bege' },
    { id: 'laco-gigante', caixa: 'laco', n: ['Laço gigante', 'Giant bow', 'Lazo gigante'], e: ['laço gigante', 'giant bow', 'lazo gigante'], paleta: 'lacos', cor: 'lima', facil: 1 },
    { id: 'mini-lacos', caixa: 'laco', n: ['Mini laços arco-íris', 'Rainbow mini bows', 'Minilazos arcoíris'], e: ['mini laços arco-íris', 'rainbow mini bows', 'minilazos arcoíris'] },
    { id: 'laco-bolinhas', caixa: 'laco', n: ['Laço de bolinhas', 'Polka-dot bow', 'Lazo de lunares'], e: ['laço de bolinhas {c}', '{c} polka-dot bow', 'lazo de lunares {c}'], paleta: 'lacos', cor: 'vermelho', facil: 1 },
    { id: 'laco-xadrez', caixa: 'laco', n: ['Laço xadrez', 'Gingham bow', 'Lazo de cuadros'], e: ['laço xadrez {c}', '{c} gingham bow', 'lazo de cuadros {c}'], paleta: 'lacos', cor: 'azul' },
    { id: 'laco-perola', caixa: 'laco', n: ['Laço de cetim com pérola', 'Satin bow with a pearl', 'Lazo de satén con perla'], e: ['laço de cetim {c}', '{c} satin bow', 'lazo de satén {c}'], paleta: 'lacos', cor: 'lilas' },
    { id: 'laco-coracao', caixa: 'laco', n: ['Laço de coração', 'Heart bow', 'Lazo de corazón'], e: ['laço de coração {c}', '{c} heart bow', 'lazo de corazón {c}'], paleta: 'lacos', cor: 'vermelho' },
    { id: 'laco-topo', caixa: 'laco', n: ['Lacinho no topo', 'Tiny top bow', 'Lacito arriba'], e: ['lacinho no topo {c}', 'tiny {c} top bow', 'lacito arriba {c}'], paleta: 'lacos', cor: 'roxo', facil: 1 },
    { id: 'lacos-flor', caixa: 'laco', n: ['Dois laços com flor de strass', 'Two bows with a gem flower', 'Dos lazos con flor de brillantes'], e: ['laços com flor {c}', '{c} bows with gem flowers', 'lazos con flor {c}'], paleta: 'lacos', cor: 'prata' },
    { id: 'presilhas-estrela', caixa: 'laco', n: ['Presilhas de estrela', 'Star hair clips', 'Horquillas de estrella'], e: ['presilhas de estrela na cor {c}', '{c} star clips', 'horquillas de estrella de color {c}'], paleta: 'lacos', cor: 'amarelo', facil: 1 },
    { id: 'chuquinhas', caixa: 'laco', n: ['Chuquinhas com elástico', 'Pigtails with hair ties', 'Coletas con gomitas'], e: ['chuquinhas com elástico {c}', 'pigtails with {c} ties', 'coletas con gomitas de color {c}'], paleta: 'lacos', cor: 'rosa-choque' },
    { id: 'scrunchie', caixa: 'laco', n: ['Elástico de veludo', 'Velvet scrunchie', 'Coletero de terciopelo'], e: ['elástico de veludo {c}', '{c} velvet scrunchie', 'coletero de terciopelo {c}'], paleta: 'lacos', cor: 'preto' },
    { id: 'garra', caixa: 'laco', n: ['Piranha de cabelo', 'Hair claw clip', 'Pinza de pelo'], e: ['piranha de cabelo na cor {c}', '{c} hair claw', 'pinza de pelo de color {c}'], paleta: 'lacos', cor: 'preto' },
    { id: 'tiara-laco', caixa: 'laco', n: ['Tiara com laço grande', 'Big bow headband', 'Diadema con lazo grande'], e: ['tiara com laço {c}', '{c} big bow headband', 'diadema con lazo {c}'], paleta: 'lacos', cor: 'rosa', facil: 1 },
    { id: 'laco-fitas', caixa: 'laco', n: ['Laço de fitinhas', 'Ribbon bow', 'Lazo de cintas'], e: ['laço de fitinhas', 'ribbon bow', 'lazo de cintas'] },
    { id: 'tiara', caixa: 'cabeca', n: ['Tiara', 'Headband', 'Diadema'], e: ['tiara', 'headband', 'diadema'], paleta: 'geral', cor: 'rosa', facil: 1 },
    { id: 'coroa', caixa: 'cabeca', n: ['Coroa', 'Crown', 'Corona'], e: ['coroa', 'crown', 'corona'], facil: 1 },
    { id: 'coroa-flores', caixa: 'cabeca', n: ['Coroa de flores', 'Flower crown', 'Corona de flores'], e: ['coroa de flores', 'flower crown', 'corona de flores'] },
    { id: 'chapeu', caixa: 'cabeca', n: ['Chapéu de sol', 'Sun hat', 'Pamela'], e: ['chapéu de sol', 'sun hat', 'pamela'], paleta: 'geral', cor: 'amarelo' },
    { id: 'bone', caixa: 'cabeca', n: ['Boné', 'Cap', 'Gorra'], e: ['boné', 'cap', 'gorra'], paleta: 'geral', cor: 'vermelho', facil: 1 },
    { id: 'capacete', caixa: 'cabeca', n: ['Capacete', 'Helmet', 'Casco'], e: ['capacete {c}', '{c} helmet', 'casco {c}'], paleta: 'skate', cor: 'azul' },
    { id: 'viseira', caixa: 'cabeca', n: ['Viseira', 'Visor', 'Visera'], e: ['viseira', 'visor', 'visera'], paleta: 'bone', cor: 'rosa' },
    { id: 'tiara-sapinho', caixa: 'cabeca', n: ['Tiara de sapinho', 'Froggy headband', 'Diadema de ranita'], e: ['tiara de sapinho', 'froggy headband', 'diadema de ranita'] },
    { id: 'tiara-chifres', caixa: 'cabeca', n: ['Tiara de anteninhas', 'Antenna headband', 'Diadema de antenitas'], e: ['tiara de anteninhas', 'antenna headband', 'diadema de antenitas'] },
    { id: 'oculos', caixa: 'olhos', n: ['Óculos', 'Glasses', 'Gafas'], e: ['óculos {c}', '{c} glasses', 'gafas {c}'], paleta: 'oculos', cor: 'vermelho', facil: 1 },
    { id: 'oculos-sol', caixa: 'olhos', n: ['Óculos de sol', 'Sunglasses', 'Gafas de sol'], e: ['óculos de sol', 'sunglasses', 'gafas de sol'], paleta: 'sol', cor: 'preto', facil: 1 },
    { id: 'oculos-coracao', caixa: 'olhos', n: ['Óculos de coração', 'Heart glasses', 'Gafas de corazón'], e: ['óculos de coração', 'heart glasses', 'gafas de corazón'], paleta: 'coracaoOc', cor: 'rosa' },
    { id: 'colar-bolinhas', caixa: 'pescoco', n: ['Colar de bolinhas', 'Bead necklace', 'Collar de bolitas'], e: ['colar de bolinhas', 'bead necklace', 'collar de bolitas'], facil: 1 },
    { id: 'colar-coracao', caixa: 'pescoco', n: ['Colar de coração', 'Heart necklace', 'Collar de corazón'], e: ['colar de coração', 'heart necklace', 'collar de corazón'] },
    { id: 'lenco', caixa: 'pescoco', n: ['Bandana de florzinha', 'Flower bandana', 'Bandana de florecitas'], e: ['bandana {c}', '{c} bandana', 'bandana {c}'], paleta: 'geral', cor: 'rosa' },
    { id: 'coleira', caixa: 'pescoco', n: ['Coleira com guia', 'Collar and leash', 'Collar con correa'], e: ['coleira {c}', '{c} collar and leash', 'collar {c}'], paleta: 'coleira', cor: 'vermelho' },
    { id: 'coleira-pata', caixa: 'pescoco', n: ['Guia com controle de patinha', 'Leash with paw remote', 'Correa con mando de patita'], e: ['guia de patinha', 'paw remote leash', 'correa de patita'], paleta: 'coleira', cor: 'azul-bebe' },
    { id: 'pulseira-strass', caixa: 'pulso', n: ['Pulseira de strass', 'Rhinestone bracelet', 'Pulsera de brillantes'], e: ['pulseira de strass', 'rhinestone bracelet', 'pulsera de brillantes'] },
    { id: 'pulseira-bolinhas', caixa: 'pulso', n: ['Pulseira de bolinhas', 'Bead bracelet', 'Pulsera de bolitas'], e: ['pulseira de bolinhas', 'bead bracelet', 'pulsera de bolitas'] },
    { id: 'asas', caixa: 'costas', n: ['Asinhas de fada', 'Fairy wings', 'Alitas de hada'], e: ['asinhas de fada', 'fairy wings', 'alitas de hada'], facil: 1 },
    // bolsas e mochilas (dono, 22/Nov/2026: "não tem bolsas"; modelos e cores das fotos de referência)
    { id: 'bolsa-tiracolo', caixa: 'costas', n: ['Bolsa a tiracolo', 'Crossbody bag', 'Bolso bandolera'], e: ['bolsa a tiracolo', 'crossbody bag', 'bolso bandolera'], paleta: 'vivas', cor: 'rosa', facil: 1 },
    { id: 'bolsa-ombro', caixa: 'costas', n: ['Bolsa de ombro', 'Shoulder bag', 'Bolso de hombro'], e: ['bolsa de ombro', 'shoulder bag', 'bolso de hombro'], paleta: 'vivas', cor: 'lilas' },
    { id: 'bolsa-metal', caixa: 'costas', n: ['Bolsa metalizada de corrente', 'Shiny chain bag', 'Bolso metalizado de cadena'], e: ['bolsa metalizada', 'shiny chain bag', 'bolso metalizado'], paleta: 'metal', cor: 'rosa-choque' },
    { id: 'bolsa-coracao', caixa: 'costas', n: ['Bolsinha de coração', 'Heart purse', 'Bolsito de corazón'], e: ['bolsinha de coração', 'heart purse', 'bolsito de corazón'], paleta: 'metal', cor: 'prata', facil: 1 },
    { id: 'bolsa-estrela', caixa: 'costas', n: ['Bolsinha de estrela', 'Star purse', 'Bolsito de estrella'], e: ['bolsinha de estrela', 'star purse', 'bolsito de estrella'], paleta: 'vivas', cor: 'amarelo' },
    { id: 'bolsa-morango', caixa: 'costas', n: ['Bolsinha de morango', 'Strawberry purse', 'Bolsito de fresa'], e: ['bolsinha de morango', 'strawberry purse', 'bolsito de fresa'] },
    { id: 'bolsa-paete', caixa: 'costas', n: ['Bolsinha de paetê', 'Sequin purse', 'Bolsito de lentejuelas'], e: ['bolsinha de paetê', 'sequin purse', 'bolsito de lentejuelas'], paleta: 'paete', cor: 'lilas' },
    { id: 'bolsa-rena', caixa: 'costas', n: ['Bolsa de rena', 'Reindeer bag', 'Bolso de reno'], e: ['bolsa de rena', 'reindeer bag', 'bolso de reno'] },
    { id: 'bolsa-bicho', caixa: 'costas', n: ['Bolsa de gatinho', 'Kitty bag', 'Bolso de gatito'], e: ['bolsa de gatinho', 'kitty bag', 'bolso de gatito'] },
    { id: 'bolsa-palha', caixa: 'costas', n: ['Bolsa de praia de palha', 'Straw beach bag', 'Bolso de playa de paja'], e: ['bolsa de palha', 'straw beach bag', 'bolso de paja'], paleta: 'lacos', cor: 'rosa' },
    { id: 'lancheira', caixa: 'costas', n: ['Lancheira', 'Lunch box', 'Fiambrera'], e: ['lancheira', 'lunch box', 'fiambrera'], paleta: 'vivas', cor: 'azul' },
    { id: 'sacola-presente', caixa: 'costas', n: ['Sacola de presente', 'Gift bag', 'Bolsa de regalo'], e: ['sacola de presente', 'gift bag', 'bolsa de regalo'], paleta: 'presente', cor: 'laranja' },
    { id: 'pochete', caixa: 'costas', n: ['Pochete camuflada', 'Camo belt bag', 'Riñonera de camuflaje'], e: ['pochete', 'belt bag', 'riñonera'] },
    { id: 'mochila', caixa: 'costas', n: ['Mochila', 'Backpack', 'Mochila'], e: ['mochila', 'backpack', 'mochila'], paleta: 'vivas', cor: 'azul', facil: 1 },
    { id: 'mochila-paete', caixa: 'costas', n: ['Mochila de paetê', 'Sequin backpack', 'Mochila de lentejuelas'], e: ['mochila de paetê', 'sequin backpack', 'mochila de lentejuelas'], paleta: 'paete', cor: 'rosa' },
    { id: 'mochila-glitter', caixa: 'costas', n: ['Mochila de brilho', 'Glitter backpack', 'Mochila de purpurina'], e: ['mochila de brilho', 'glitter backpack', 'mochila de purpurina'], paleta: 'glitter', cor: 'preto' },
    { id: 'mochila-degrade', caixa: 'costas', n: ['Mochilinha degradê', 'Ombré mini backpack', 'Mochilita degradada'], e: ['mochilinha degradê', 'ombré mini backpack', 'mochilita degradada'] },
    { id: 'mochila-espaco', caixa: 'costas', n: ['Mochila de planetas', 'Space backpack', 'Mochila de planetas'], e: ['mochila de planetas', 'space backpack', 'mochila de planetas'] },
    { id: 'mochila-orelhas', caixa: 'costas', n: ['Mochila de orelhinhas', 'Bunny-ear backpack', 'Mochila con orejitas'], e: ['mochila de orelhinhas', 'bunny-ear backpack', 'mochila con orejitas'], paleta: 'vivas', cor: 'lilas' },
    { id: 'mochila-bicho', caixa: 'costas', n: ['Mochilinha de dino', 'Dino face backpack', 'Mochilita de dino'], e: ['mochilinha de dino', 'dino face backpack', 'mochilita de dino'], paleta: 'verniz', cor: 'lima' },
    { id: 'mochila-ursinho', caixa: 'costas', n: ['Mochila de ursinho', 'Teddy backpack', 'Mochila de osito'], e: ['mochila de ursinho', 'teddy backpack', 'mochila de osito'], facil: 1 },
    { id: 'mochila-ovelha', caixa: 'costas', n: ['Mochila de ovelhinha', 'Lamb backpack', 'Mochila de ovejita'], e: ['mochila de ovelhinha', 'lamb backpack', 'mochila de ovejita'] },
    { id: 'mochila-pug', caixa: 'costas', n: ['Mochila de cachorrinho', 'Pug backpack', 'Mochila de carlino'], e: ['mochila de cachorrinho', 'pug backpack', 'mochila de carlino'] },
    { id: 'mochila-unicornio', caixa: 'costas', n: ['Mochila de unicórnio', 'Unicorn backpack', 'Mochila de unicornio'], e: ['mochila de unicórnio', 'unicorn backpack', 'mochila de unicornio'], facil: 1 },
    { id: 'mochila-neve', caixa: 'costas', n: ['Mochilinha de boneco de neve', 'Snowman backpack', 'Mochilita de muñeco de nieve'], e: ['mochilinha de boneco de neve', 'snowman backpack', 'mochilita de muñeco de nieve'] },
    { id: 'mochila-pinguim', caixa: 'costas', n: ['Mochilinha de pinguim', 'Penguin backpack', 'Mochilita de pingüino'], e: ['mochilinha de pinguim', 'penguin backpack', 'mochilita de pingüino'] },
    // asinhas
    { id: 'asas', caixa: 'asas', n: ['Asinhas de fada', 'Fairy wings', 'Alitas de hada'], e: ['asinhas de fada', 'fairy wings', 'alitas de hada'], facil: 1 },
    { id: 'varinha', caixa: 'mao', n: ['Varinha de estrela', 'Star wand', 'Varita de estrella'], e: ['varinha', 'star wand', 'varita'], facil: 1 },
    { id: 'chaveiro', caixa: 'mao', n: ['Chaveirinho', 'Little keychain', 'Llaverito'], e: ['chaveirinho', 'little keychain', 'llaverito'] },
    { id: 'balao', caixa: 'mao', n: ['Balão de coração', 'Heart balloon', 'Globo de corazón'], e: ['balão', 'balloon', 'globo'], facil: 1 },
    { id: 'filhote', caixa: 'colo', n: ['Filhotinho no colo', 'Baby to cuddle', 'Bebé en brazos'], e: ['filhotinho no colo', 'a baby to cuddle', 'un bebé en brazos'], facil: 1 },
    { id: 'mini-urso', caixa: 'colo', n: ['Ursinho de bolso', 'Pocket teddy', 'Osito de bolsillo'], e: ['ursinho de bolso', 'pocket teddy', 'osito de bolsillo'] },
    { id: 'abracadinho-braco', caixa: 'abraco', n: ['Abraçado no braço', 'Hugging the arm', 'Abrazado al brazo'], e: ['unicorninho abraçado no braço', 'a little unicorn hugging the arm', 'un unicornito abrazado al brazo'] },
    { id: 'abracadinho-perna', caixa: 'abraco', n: ['Abraçado na perna', 'Hugging the leg', 'Abrazado a la pierna'], e: ['unicorninho abraçado na perna', 'a little unicorn hugging the leg', 'un unicornito abrazado a la pierna'] },
    { id: 'tenis', caixa: 'pes', n: ['Tênis branco', 'White sneakers', 'Zapatillas blancas'], e: ['tênis branco', 'white sneakers', 'zapatillas blancas'], facil: 1 },
    { id: 'tenis-brilho', caixa: 'pes', n: ['Tênis de cano alto', 'High-top sneakers', 'Zapatillas altas'], e: ['tênis de cano alto {c}', '{c} high-tops', 'zapatillas altas {c}'], paleta: 'tenis', cor: 'holo' },
    { id: 'tenis-strass', caixa: 'pes', n: ['Tênis com bico de strass', 'Rhinestone-toe sneakers', 'Zapatillas con puntera de brillantes'], e: ['tênis de strass', 'rhinestone sneakers', 'zapatillas de brillantes'], paleta: 'strass', cor: 'rosa' },
    { id: 'botinhas', caixa: 'pes', n: ['Botinhas pretas', 'Black boots', 'Botitas negras'], e: ['botinhas pretas', 'black boots', 'botitas negras'] },
    { id: 'coturno', caixa: 'pes', n: ['Coturno caramelo', 'Caramel lace-up boots', 'Botas caramelo'], e: ['coturno', 'lace-up boots', 'botas de cordones'] },
    { id: 'sandalia', caixa: 'pes', n: ['Sandália', 'Sandals', 'Sandalias'], e: ['sandália', 'sandals', 'sandalias'], paleta: 'vivas', cor: 'rosa', facil: 1 },
    { id: 'chinelo', caixa: 'pes', n: ['Chinelo', 'Flip-flops', 'Chanclas'], e: ['chinelo', 'flip-flops', 'chanclas'], paleta: 'vivas', cor: 'azul' },
    { id: 'galocha', caixa: 'pes', n: ['Galocha de chuva', 'Rain boots', 'Botas de agua'], e: ['galocha', 'rain boots', 'botas de agua'], paleta: 'vivas', cor: 'amarelo', facil: 1 },
    { id: 'bota-neve', caixa: 'pes', n: ['Bota de neve com pelinho', 'Fluffy snow boots', 'Botas de nieve con pelito'], e: ['botas de neve', 'snow boots', 'botas de nieve'], paleta: 'vivas', cor: 'lilas' },
    { id: 'sapatilha-bale', caixa: 'pes', n: ['Sapatilha de balé com fitinhas', 'Ballet slippers with ribbons', 'Zapatillas de ballet con cintas'], e: ['sapatilhas de balé', 'ballet slippers', 'zapatillas de ballet'], paleta: 'bale', cor: 'rosa', facil: 1 },
    { id: 'pantufa', caixa: 'pes', n: ['Pantufa de coelhinho', 'Bunny slippers', 'Zapatillas de conejito'], e: ['pantufas de coelhinho', 'bunny slippers', 'zapatillas de conejito'], paleta: 'vivas', cor: 'rosa' },
    { id: 'tenis-luz', caixa: 'pes', n: ['Tênis de luzinha', 'Light-up sneakers', 'Zapatillas con luces'], e: ['tênis de luzinha', 'light-up sneakers', 'zapatillas con luces'], paleta: 'vivas', cor: 'rosa-choque', facil: 1 },
    { id: 'sapato-boneca', caixa: 'pes', n: ['Sapato boneca com fivela', 'Mary Janes with a buckle', 'Merceditas con hebilla'], e: ['sapato boneca', 'Mary Janes', 'merceditas'], paleta: 'vivas', cor: 'vermelho' },
    { id: 'sapato-cadarco', caixa: 'pes', n: ['Sapato de cadarço', 'Lace-up shoes', 'Zapatos de cordones'], e: ['sapato de cadarço', 'lace-up shoes', 'zapatos de cordones'], paleta: 'cadarco', cor: 'holo' },
    { id: 'babuche', caixa: 'pes', n: ['Babuche de furinhos com enfeites', 'Clogs with charms', 'Zuecos con adornos'], e: ['babuche de furinhos', 'clogs with charms', 'zuecos con adornos'], paleta: 'vivas', cor: 'lima' },
    { id: 'bota-cadarco', caixa: 'pes', n: ['Bota de cadarço', 'Lace-up boots', 'Botas de cordones'], e: ['bota de cadarço', 'lace-up boots', 'botas de cordones'], paleta: 'bota', cor: 'rosa' },
    { id: 'bota-elfo', caixa: 'pes', n: ['Bota de duende', 'Elf boots', 'Botas de duende'], e: ['botas de duende', 'elf boots', 'botas de duende'] },
    { id: 'patins-linha', caixa: 'pes', n: ['Patins em linha', 'Inline skates', 'Patines en línea'], e: ['patins em linha', 'inline skates', 'patines en línea'], paleta: 'linha', cor: 'preto' },

    { id: 'sapatinho', caixa: 'pes', n: ['Sapatinho preto', 'Black Mary Janes', 'Merceditas negras'], e: ['sapatinho preto', 'black Mary Janes', 'merceditas negras'] },
    { id: 'sapatilhas', caixa: 'pes', n: ['Sapatilhas', 'Ballet flats', 'Bailarinas'], e: ['sapatilhas', 'ballet flats', 'bailarinas'], paleta: 'sapatilha', cor: 'rosa' },
    { id: 'patins', caixa: 'pes', n: ['Patins', 'Roller skates', 'Patines'], e: ['patins', 'roller skates', 'patines'], paleta: 'patins', cor: 'azul', facil: 1 },
    { id: 'skate', caixa: 'chao', n: ['Skate', 'Skateboard', 'Monopatín'], e: ['skate', 'skateboard', 'monopatín'], paleta: 'skate', cor: 'rosa-choque', facil: 1 },
    { id: 'muletas', caixa: 'apoio', n: ['Muletas', 'Crutches', 'Muletas'], e: ['muletas', 'crutches', 'muletas'], so: 'pe' },
    { id: 'cadeira', caixa: 'apoio', n: ['Cadeira de rodas', 'Wheelchair', 'Silla de ruedas'], e: ['cadeira de rodas', 'a wheelchair', 'silla de ruedas'], facil: 1 }
  ];
  // escolher um tira o outro (não dá para usar os dois ao mesmo tempo)
  var CONFLITOS = [['patins', 'skate'], ['cadeira', 'skate'], ['cadeira', 'patins'], ['muletas', 'skate'], ['muletas', 'patins'], ['patins-linha', 'skate'], ['cadeira', 'patins-linha'], ['muletas', 'patins-linha'], ['cadeira', 'abracadinho-perna'],
    ['tiara-laco', 'tiara'], ['tiara-laco', 'tiara-sapinho'], ['tiara-laco', 'tiara-chifres'], ['tiara-laco', 'coroa-flores'], ['tiara-laco', 'bone'], ['tiara-laco', 'viseira'], ['tiara-laco', 'capacete'], ['tiara-laco', 'chapeu'],
    ['chuquinhas', 'bone'], ['chuquinhas', 'capacete'], ['chuquinhas', 'chapeu']];

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
  // frases prontas (dono, 22/Nov/2026): {c} = o nome da criança (se ela quiser pôr)
  var FRASES = [
    { id: 'teamo', t: ['Eu te amo{, c}!', 'I love you{, c}!', '¡Te quiero mucho{, c}!'] },
    { id: 'abraco', t: ['Me dá um abraço{, c}?', 'Can I have a hug{, c}?', '¿Me das un abrazo{, c}?'] },
    { id: 'amigo', t: ['Você é meu melhor amigo{, c}!', 'You are my best friend{, c}!', '¡Eres mi mejor amigo{, c}!'] },
    { id: 'noite', t: ['Boa noite{, c}, durma bem!', 'Good night{, c}, sleep tight!', '¡Buenas noches{, c}, que duermas bien!'] },
    { id: 'brincar', t: ['Vamos brincar{, c}?', 'Let\'s play{, c}!', '¿Jugamos{, c}?'] },
    { id: 'beijo', t: ['Me dá um beijinho{, c}?', 'Can I have a little kiss{, c}?', '¿Me das un besito{, c}?'] }
  ];
  var NOMES = ['Biscoito', 'Fofura', 'Algodão', 'Bolinha', 'Pipoca', 'Docinho', 'Nuvem', 'Mel', 'Paçoca', 'Jujuba', 'Pingo', 'Pudinzinho',
    'Brigadeiro', 'Cocada', 'Estrela', 'Lua', 'Sol', 'Bombom', 'Cookie', 'Tutti', 'Lili', 'Fifi', 'Bibi', 'Teteu', 'Nina', 'Lulu', 'Tico', 'Malu'];

  // ---------- nível ----------
  // Fácil: menos opções por etapa (as marcadas com facil); Médio: todas; Difícil: todas + a Encomenda
  var NIVEIS = { facil: { todas: false, encomenda: false }, medio: { todas: true, encomenda: false }, dificil: { todas: true, encomenda: true } };

  var D = { ETAPAS: ETAPAS, CORES: CORES, PALETAS: PALETAS, PELOS: PELOS, OLHOS: OLHOS, ESTILOS_OLHO: ESTILOS_OLHO, BOCHECHAS: BOCHECHAS,
    CORACOES: CORACOES, BASES: BASES, ROUPAS: ROUPAS, ESTAMPAS: ESTAMPAS, CAIXAS: CAIXAS, ACESS: ACESS, CONFLITOS: CONFLITOS, VOZES: VOZES,
    NOMES: NOMES, NIVEIS: NIVEIS, PATCHES: PATCHES, FRASES: FRASES };
  function porId(lista) { var m = {}; lista.forEach(function (x) { m[x.id] = x; }); return m; }
  D.base = porId(BASES); D.pelo = porId(PELOS); D.olho = porId(OLHOS); D.coracao = porId(CORACOES); D.roupa = porId(ROUPAS);
  D.acess = porId(ACESS); D.caixa = porId(CAIXAS); D.voz = porId(VOZES); D.estampa = porId(ESTAMPAS); D.patch = porId(PATCHES); D.frase = porId(FRASES);
  raiz.AmiguinhoDados = D;
  if (typeof module === 'object' && module.exports) module.exports = D;
})(typeof window !== 'undefined' ? window : globalThis);
