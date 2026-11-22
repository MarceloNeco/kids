/*
  Catálogo do Bolinho de Chuva — A LISTA ÚNICA dos jogos e apps para criança.
  Daqui saem os cartões da estante (/kids/), o botão "📲 Instalar" de cada cartão,
  o "Guardar todos neste aparelho" e o "Instalar um por um". Jogo novo = uma entrada nesta lista; nada mais.

  Campos de cada jogo:
    id       nome curto, sem espaço (identifica o jogo)
    nome     nome que aparece no cartão
    ico      emoji do cartão          cor   cor de destaque do cartão
    img      (opcional) imagem do cartão no lugar do emoji, ex.: '/kids/baguncolandia/icone.svg'
    url      endereço do jogo a partir da raiz do site (funciona em solverone.com.br e no endereço antigo)
    nomes    (opcional) { en, es }: o nome do jogo em inglês e em espanhol, quando muda (sem ele: o mesmo nome)
    texto    descrição em português   en    em inglês   es    em espanhol
    tag      verbo do jogo, "PT / EN / ES" (ex.: '▶ Brincar / Play / Jugar'). Desde 15/Nov/2026 o botão do cartão é
             sempre "Jogar / Play / Jugar" (igual em todos); este campo fica para quem quiser o verbo próprio.
    novo     data em que o jogo entrou na estante ('AAAA-MM-DD'). Por 7 dias o cartão ganha o selo "✨ Novo" e o jogo
             aparece na janela "✨ Novidades da semana" (novidades.js). Jogo novo = pôr a data do dia.
    atualizado (opcional) { data: 'AAAA-MM-DD', pt, en, es }: a última novidade que a pessoa nota num jogo que já
             existia (dono, 20/Nov/2026). Por 7 dias o jogo aparece em "Jogos atualizados" na mesma janela, com esta
             frase. Versão nova de jogo com algo que se vê = trocar a data e a frase (uma só, curta, nos três idiomas).
    instalar true = pode ser instalado e funciona sem internet (o service worker fica em url + 'sw.js')
    soOnline true = precisa de internet (ex.: YouTube e TV); o cartão mostra "🌐 Só com internet"
    tv       { texto, tag, param } = abre na TV com este parâmetro; param vai no fim do endereço
    rec      (opcional) ícones do cartão (dono, 15/Nov/2026): 'tv' joga na TV · 'cam' joga com o corpo (câmera) ·
             'incl' inclinar o celular · 'dois' dá para jogar em dois. "Funciona sem internet" vem de instalar e
             "Precisa de internet" de soOnline. Tocar num ícone explica o que é.

  Como a página usa: <div class="grid" data-catalogo="estante"></div> (ou "tv") e, logo depois,
  <script src="catalogo.js"></script>. O script monta os cartões na hora (a página não pisca vazia).
*/
(function () {
  var JOGOS = [
    { id: 'baguncolandia', rec: ['tv', 'cam', 'dois'], nomes: { en: "Mayhemland", es: "Alborotolandia" }, nome: 'Bagunçolândia', ico: '🐶', img: '/kids/baguncolandia/icone.svg', cor: '#c6ff3d', url: '/kids/baguncolandia/',
      texto: 'Frutas, doces e personagens voam na TV e você corta, pega, chuta, pula e abaixa com o corpo. 1 ou 2 pessoas, boneco personalizável, ou no dedo no celular.',
      en: "Fruit, sweets and funny characters fly across the TV, and you slice, catch, kick, jump and duck with your whole body. 1 or 2 players, a character you can dress up, or play with your finger on the phone.",
      es: "Frutas, dulces y personajes vuelan por la tele, y tú los cortas, los atrapas, les das patadas, saltas y te agachas con todo el cuerpo. 1 o 2 jugadores, un muñeco a tu gusto, o con el dedo en el móvil.",
      tag: '▶ Brincar / Play / Jugar', instalar: true,
      atualizado: { data: '2026-11-20', pt: 'Abertura nova: uma piscina de bolas gigantes com luz neon, e o seu boneco mergulha no meio delas. E cada modo agora aparece com o nome, em cartões grandes.', en: 'New opening: a giant ball pit with neon lights, and your character dives in among the balls. And every mode now shows its name, on big cards.', es: 'Nueva entrada: una piscina de bolas gigantes con luces de neón, y tu muñeco se zambulle entre ellas. Y cada modo ahora sale con su nombre, en tarjetas grandes.' },
      tv: { texto: 'Corte, pegue, chute, pule e abaixe com o corpo. A TV mostra o código; o celular filma.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'meu-amiguinho', novo: '2026-11-22', nomes: { en: 'My Little Buddy', es: 'Mi Pequeño Amiguito' }, nome: 'Meu Pequeno Amiguinho', ico: '🧸', img: '/kids/meu-amiguinho/icone.svg', cor: '#f7a8c8', url: '/kids/meu-amiguinho/',
      texto: 'Monte a sua pelúcia: escolha o bichinho (são 26, em pé ou de 4 patas), a cor do pelo, dê um beijinho no coração, encha de fofura na máquina, vista, enfeite, grave uma frase e ganhe a certidão de nascimento. Tudo fica guardado na sua coleção.',
      en: 'Build your own plush buddy: pick the animal (26 of them, standing or on 4 paws), the fur color, kiss the little heart, fill it with fluff in the machine, dress it up, add accessories, record a phrase and get its birth certificate. It all stays in your collection.',
      es: 'Arma tu propio peluche: elige el animalito (hay 26, de pie o a 4 patas), el color del pelo, dale un besito al corazón, rellénalo en la máquina, vístelo, ponle accesorios, graba una frase y recibe su certificado de nacimiento. Todo se queda en tu colección.',
      tag: '▶ Criar / Create / Crear', instalar: true },
    { id: 'contador-de-historias', rec: ['tv'], nomes: { en: "Storyteller", es: "Cuentacuentos" }, nome: 'Contador de Histórias', ico: '📖', cor: '#3ee8ff', url: '/contador-de-historias/',
      texto: 'Histórias para dormir: um acervo para ler e ouvir, e a criação de histórias novas com os nomes da sua família.',
      en: "Bedtime stories: a library to read and listen to, and brand-new stories made up with your family's names.",
      es: "Cuentos para dormir: una biblioteca para leer y escuchar, y cuentos nuevos inventados con los nombres de tu familia.",
      tag: '▶ Ouvir / Listen / Escuchar', instalar: true,
      tv: { texto: 'Histórias para ler e ouvir na tela grande, antes de dormir.', tag: '▶ Abrir', param: '' } },
    { id: 'peluqueria', rec: ['tv', 'cam', 'dois'], nome: 'Peluqueria', ico: '💇', cor: '#ffd166', url: '/kids/peluqueria/',
      texto: 'O provador maluco da família: uma coroa, um bigode ou uma peruca desce sobre o bicho e você toca na hora certa. Quanto mais perto, mais pontos. UHUL!',
      en: "The family's silly dressing room: a crown, a moustache or a wig comes down onto the animal and you tap at just the right moment. The closer you get, the more points. WOOHOO!",
      es: "El probador loco de la familia: una corona, un bigote o una peluca baja sobre el animalito y tú tocas justo a tiempo. Cuanto más cerca, más puntos. ¡YUJU!",
      tag: '▶ Brincar / Play / Jugar', instalar: true,
      tv: { texto: 'Um chapéu, um bigode ou uma peruca desce sobre o bicho: aperte OK na hora certa.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'danca-na-sala', rec: ['tv', 'cam', 'dois'], nomes: { en: "Living Room Dance", es: "Baile en la Sala" }, nome: 'Dança na Sala', ico: '💃', cor: '#ff4fa3', url: '/kids/danca-na-sala.html',
      texto: 'A TV toca a música do YouTube e mostra quem está dançando, com neon, fogos e placar de energia. O celular filma e comanda.',
      en: "The TV plays music from YouTube and shows everyone who's dancing, with neon lights, fireworks and an energy score. The phone films and runs the show.",
      es: "La tele pone música de YouTube y muestra a todos los que bailan, con luces de neón, fuegos artificiales y un marcador de energía. El móvil graba y lo controla todo.",
      tag: '▶ Dançar / Dance / Bailar', soOnline: true,
      tv: { texto: 'Música do YouTube na TV e as câmeras dos celulares ao vivo, com neon e placar de energia.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'vruuum',
      atualizado: { data: '2026-11-22', pt: 'Polícia na garagem (SUV e moto com sirene piscando), Van Verde de Passeio, Bolha Gigante transparente com gomos e um Palhaço de Bicicleta pedalando sem parar.', en: 'Police in the garage (SUV and motorbike with flashing sirens), Green Shuttle Van, see-through Giant Bubble Ball with panels and a Clown on a Bike pedaling nonstop.', es: 'La policía en el garaje (SUV y moto con sirena parpadeando), Furgoneta Verde de Paseo, Burbuja Gigante transparente con gajos y un Payaso en Bici pedaleando sin parar.' }, rec: ['tv', 'cam', 'incl', 'dois'], nome: 'Vruuum!', ico: '🏎️', cor: '#ff9f1c', url: '/kids/vruuum/',
      texto: 'Corrida de carrinho: desvie dos cones e da lama, pegue estrelas, turbo de arco-íris e rampas, passando pela praia, floresta, doces, neve e cidade neon. 1 ou 2 jogadores na mesma tela.',
      en: "Go-kart racing: dodge the cones and the mud, grab stars, use the rainbow turbo and jump the ramps, racing through the beach, the forest, candy land, the snow and a neon city. 1 or 2 players on the same screen.",
      es: "Carreras de karts: esquiva los conos y el barro, atrapa estrellas, usa el turbo arcoíris y salta las rampas, pasando por la playa, el bosque, el mundo de dulces, la nieve y una ciudad de neón. 1 o 2 jugadores en la misma pantalla.",
      tag: '▶ Correr / Race / Correr', instalar: true,
      tv: { texto: 'Corrida de carrinho: setas do controle para virar, OK para buzinar. Pegue as estrelas!', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'purpurina',
      atualizado: { data: '2026-11-22', pt: 'Meu amiguinho no colo: o amiguinho do Meu Pequeno Amiguinho fica de mãos dadas com ela. E ela pode pilotar no Vruuum!', en: 'My buddy in my arms: your My Little Buddy friend holds her hand. And she can drive in Vruuum!', es: 'Mi amiguito en brazos: tu amiguito de Mi Pequeño Amiguito le da la mano. ¡Y ella puede conducir en Vruuum!' }, rec: ['tv'], nome: "Purpurina 80's", ico: '💄', cor: '#cfa8ff', url: '/kids/purpurina/',
      texto: 'Maquiagem, roupas, joias e muito brilho: monte a personagem, faça a maquiagem com o pincel, vista roupas e acessórios, cumpra desafios e desfile com confete. Brinque na TV com o celular de controle e música do YouTube ou do Spotify.',
      en: "Makeup, clothes, jewelry and lots of sparkle: create your character, do the makeup with a brush, try on clothes and accessories, take on challenges and walk the runway with confetti. Play on the TV using the phone as a remote, with music from YouTube or Spotify.",
      es: "Maquillaje, ropa, joyas y mucho brillo: crea tu personaje, maquíllalo con el pincel, ponle ropa y accesorios, cumple retos y desfila con confeti. Juega en la tele con el móvil como mando y música de YouTube o Spotify.",
      tag: '▶ Brilhar / Sparkle / Brillar', instalar: true,
      tv: { texto: 'Maquiagem, roupas e desfile. A TV mostra um código: no celular, toque em 📺 Conectar na TV e brinque com o celular de controle. Música do YouTube e do Spotify.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'purpurina-nova', rec: ['tv'], nomes: { en: 'Purpurina New Age', es: 'Purpurina Nueva Era' }, nome: 'Purpurina Nova Era', ico: '💅', cor: '#ffb3e6', url: '/kids/purpurina-nova/', novo: '2026-11-19',
      atualizado: { data: '2026-11-22', pt: 'GIF do desfile e da Baladinha para o WhatsApp, andar de passarela de verdade e pose natural: braços caídos rentes ao corpo, mão de lado e o peso numa perna.', en: 'Runway and dance-party GIFs for WhatsApp, a real runway walk and a natural pose: arms hanging close to the body, hands turned sideways and her weight on one leg.', es: 'GIF del desfile y de la minidisco para WhatsApp, caminar de pasarela de verdad y una pose natural: brazos caídos junto al cuerpo, manos de lado y el peso en una pierna.' },
      texto: 'A nova Purpurina: o mesmo jogo de maquiagem, roupas e desfile, ganhando por etapas um rosto mais natural para cada idade, combinações prontas e jeito de celular. A Purpurina de antes continua aqui em cima.',
      en: "The new Purpurina: the same makeup, outfits and runway game, getting step by step a more natural face for each age, ready-made combos and a phone-first layout. The original Purpurina is still right above.",
      es: "La nueva Purpurina: el mismo juego de maquillaje, ropa y desfile, que va ganando por etapas una cara más natural para cada edad, combinaciones listas y un diseño pensado para el móvil. La Purpurina de antes sigue justo encima.",
      tag: '▶ Brilhar / Sparkle / Brillar', instalar: true,
      tv: { texto: 'Maquiagem, roupas e desfile. A TV mostra um código: no celular, toque em 📺 Conectar na TV e brinque com o celular de controle.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'rabiscolandia', atualizado: { data: '2026-11-20', pt: 'Livro de colorir com a Turminha: 10 personagens de roupinha para pintar.', en: 'Coloring book: Little friends, 10 characters in cute outfits to color.', es: 'Libro para colorear: la Pandilla, 10 personajes con ropita para pintar.' }, rec: ['tv', 'cam'], nome: 'Rabiscolândia', ico: '🎨', cor: '#c6ff3d', url: '/kids/rabiscolandia/',
      texto: 'Desenhar, livro de colorir e pintar por números, com pincéis que mexem, adesivos animados, paisagens e música. Desenhe com a mão na frente da câmera ou na TV com o celular de controle.',
      en: "Drawing, a coloring book and paint by numbers, with brushes that move, animated stickers, landscapes and music. Draw with your hand in front of the camera, or on the TV using the phone as a remote.",
      es: "Dibujar, un libro para colorear y pintar por números, con pinceles que se mueven, pegatinas animadas, paisajes y música. Dibuja con la mano frente a la cámara o en la tele con el móvil como mando.",
      tag: '▶ Desenhar / Draw / Dibujar', instalar: true,
      tv: { texto: 'Desenhar e colorir na TV. A TV mostra um código: no celular, toque em 📺 Na TV → 🎮 Controlar e desenhe com o dedo, mexendo o celular ou com a mão na câmera.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'campo-minado', novo: '2026-11-06', nomes: { en: "Garden Sweeper", es: "Buscaminas del Jardín" }, nome: 'Campo Minado', ico: '🦔', img: '/kids/campo-minado/icone.svg', cor: '#7ee081', url: '/kids/campo-minado/',
      texto: 'Abra o jardim inteiro sem acordar os ouriços que dormem embaixo da grama. Os números contam quantos estão em volta; marque com 🚩. Fácil, médio e difícil.',
      en: "Open up the whole garden without waking the hedgehogs sleeping under the grass. The numbers tell you how many are nearby; mark them with 🚩. Easy, medium and hard.",
      es: "Abre todo el jardín sin despertar a los erizos que duermen bajo el césped. Los números te dicen cuántos hay alrededor; márcalos con 🚩. Fácil, medio y difícil.",
      tag: '▶ Jogar / Play / Jugar', instalar: true },
    { id: 'enigmas', novo: '2026-11-06', nome: 'Enigmatic', ico: '🧩', img: '/kids/enigmas/icone.svg', cor: '#9ee37d', url: '/kids/enigmas/',
      texto: 'Enigmas na lousa: ligue com giz o que combina, o cachorro com o osso, a bola com o gol. Do fácil (3 anos) ao difícil, com charadas, sequências e rimas.',
      en: "Riddles on the chalkboard: draw a chalk line between the things that go together, the dog and the bone, the ball and the goal. From easy (age 3) to really tricky, with riddles, patterns and rhymes.",
      es: "Acertijos en la pizarra: une con tiza lo que va junto, el perro con el hueso, la pelota con la portería. De fácil (3 años) a difícil, con adivinanzas, secuencias y rimas.",
      tag: '▶ Ligar / Match / Unir', instalar: true },
    { id: 'labirinto', atualizado: { data: '2026-11-20', pt: 'Menu em duas etapas no celular, com o Jogar sempre à vista e o resumo do que você escolheu.', en: 'A two-step menu on phones, with Play always in sight and a summary of what you picked.', es: 'Un menú en dos pasos en el móvil, con Jugar siempre a la vista y un resumen de lo que elegiste.' }, novo: '2026-11-06', nomes: { en: "Maze", es: "Laberinto" }, nome: 'Labirinto', ico: '🐶', img: '/kids/labirinto/icone.svg', cor: '#ffd166', url: '/kids/labirinto/',
      texto: 'Um labirinto novo a cada vez, quadrado, redondo ou de colmeia, que nasce em 3D. Leve o cachorrinho ou risque o caminho com o dedo, pegue o osso do meio e ache a saída.',
      en: "A brand-new maze every time, square, round or honeycomb-shaped, that pops up in 3D. Walk the puppy or draw the path with your finger, grab the bone in the middle and find the way out.",
      es: "Un laberinto nuevo cada vez, cuadrado, redondo o de panal, que aparece en 3D. Lleva al perrito o traza el camino con el dedo, coge el hueso del centro y encuentra la salida.",
      tag: '▶ Explorar / Explore / Explorar', instalar: true },
    { id: 'cozinha',
      atualizado: { data: '2026-11-20', pt: 'O botão Cozinhar fica sempre à vista com a receita da última vez, e as receitas correm para o lado, sem rolar a tela.', en: 'The Cook button is always in sight with your last recipe, and the recipes slide sideways, with no scrolling.', es: 'El botón Cocinar siempre está a la vista con la última receta, y las recetas se deslizan hacia el lado, sin desplazar la pantalla.' }, novo: '2026-11-06', nomes: { en: "My Little Big Chef", es: "Manos a la Masa" }, nome: 'Mão na Massa', ico: '🍳', img: '/kids/cozinha/icone.svg', cor: '#ff9f6e', url: '/kids/cozinha/',
      texto: 'Escolha uma receita, saia pela vila para pescar, colher, comprar no mercado ou pedir emprestado à vizinha, e volte para cozinhar: misturar, bater, ligar o fogão e servir. 12 receitas.',
      en: "Pick a recipe, head out around the village to fish, pick fruit, shop at the market or borrow from the neighbor, then come back to cook: mix, whisk, turn on the stove and serve. 12 recipes.",
      es: "Elige una receta, sal por el pueblo a pescar, cosechar, comprar en el mercado o pedirle algo prestado a la vecina, y vuelve a cocinar: mezclar, batir, encender el fuego y servir. 12 recetas.",
      tag: '▶ Cozinhar / Cook / Cocinar', instalar: true },
    { id: 'aqua', novo: '2026-11-14', nome: 'AQUA', ico: '💧', img: '/kids/aqua/icone.svg', cor: '#17c3c9', url: '/kids/aqua/',
      texto: 'Despeje os líquidos coloridos de um frasco no outro até cada frasco ficar de uma cor só. Fases sem fim, sempre com solução, frascos embaçados e uma lojinha de brincadeira. E o Cubo d\'Água: um cubo 3×3 em 3D para montar. Fácil, médio e difícil.',
      en: "Pour the colorful liquids from one bottle into another until each bottle holds just one color. Endless levels that can always be solved, foggy bottles and a pretend little shop. Plus the Water Cube: a 3D 3×3 cube to solve. Easy, medium and hard.",
      es: "Vierte los líquidos de colores de un frasco a otro hasta que cada frasco tenga un solo color. Niveles sin fin, siempre con solución, frascos empañados y una tiendecita de juguete. Y el Cubo de Agua: un cubo 3×3 en 3D para resolver. Fácil, medio y difícil.",
      tag: '▶ Despejar / Pour / Verter', instalar: true },
    { id: 'glub-glub', novo: '2026-11-14', nome: 'GLUB GLUB', ico: '🎣', img: '/kids/glub-glub/icone-192.png', cor: '#4fc3f7', url: '/kids/glub-glub/',
      texto: 'Pescaria com o Juca e a Lili no lago encantado: o anzol balança, você solta na hora certa e pesca peixes, tartaruga, polvo, tubarões, baleia e a sereia. Quanto mais fundo, mais pontos! Sozinho ou em dois.',
      en: "Go fishing with Juca and Lili in the enchanted lake: the hook swings, you drop it at just the right moment and catch fish, a turtle, an octopus, sharks, a whale and the mermaid. The deeper you go, the more points! Play alone or with a friend.",
      es: "Ve de pesca con Juca y Lili al lago encantado: el anzuelo se balancea, lo sueltas justo a tiempo y pescas peces, una tortuga, un pulpo, tiburones, una ballena y la sirena. ¡Cuanto más hondo, más puntos! Solo o con otra persona.",
      tag: '▶ Pescar / Fish / Pescar', instalar: true },
    { id: 'batalha-naval', rec: ['dois'], novo: '2026-11-06', nomes: { en: "Sea Battle", es: "Batalla Naval" }, nome: 'Batalha Naval', ico: '⚓', img: '/kids/batalha-naval/icone.svg', cor: '#4fc3ff', url: '/kids/batalha-naval/',
      texto: 'Esconda seus navios e afunde os dos outros: E4, F2... Jogue em família, de 2 a 4 pessoas, cada uma no seu celular, com um código de 4 letras. Também contra o computador ou passando o aparelho.',
      en: "Hide your ships and sink everyone else's: E4, F2... Play as a family, 2 to 4 players, each on their own phone, with a 4-letter code. You can also play against the computer or pass the phone around.",
      es: "Esconde tus barcos y hunde los de los demás: E4, F2... Juega en familia, de 2 a 4 personas, cada una en su móvil, con un código de 4 letras. También contra el ordenador o pasando el móvil.",
      tag: '▶ Navegar / Sail / Navegar', instalar: true },
    { id: 'a-garra',
      atualizado: { data: '2026-11-20', pt: 'Máquinas novas (Festas do Ano, Gigantes e Boneco Gigante), uma menininha que mostra o tamanho das gigantes, a máquina escolhida brilhando e o Jogar sempre à vista.', en: 'New machines (Holidays, Giants and Giant Doll), a little girl who shows how big the giant ones are, the chosen machine glowing and Play always in sight.', es: 'Máquinas nuevas (Fiestas del Año, Gigantes y Muñeco Gigante), una niña que muestra lo grandes que son las gigantes, la máquina elegida brillando y Jugar siempre a la vista.' }, novo: '2026-11-14', nome: 'H-rraaa', ico: '🧸', img: '/kids/a-garra/icone.svg', cor: '#39ff6a', url: '/kids/a-garra/',
      texto: 'A máquina de pegar bichinho em 3D, igual à do fliperama: leve a garra com as setas, aperte PEGAR e torça para ela não soltar! Pelúcias, bichinhos que mexem, insetos, hambúrgueres, filhotes de verdade que andam, pelúcias gigantes, um boneco grande para cortar o fio com a tesoura e uma máquina de festas que muda com a época do ano.',
      en: "The 3D claw machine, just like at the arcade: move the claw with the arrows, press GRAB and hope it doesn't let go! Plushies, wiggly critters, bugs, burgers, real-looking puppies that walk around, giant plushies, a big doll whose string you cut with scissors and a holiday machine that changes through the year.",
      es: "La máquina de garra en 3D, igual que la de la feria: mueve la garra con las flechas, pulsa COGER ¡y cruza los dedos para que no lo suelte! Peluches, bichitos que se mueven, insectos, hamburguesas, cachorritos que caminan, peluches gigantes, un muñeco grande cuyo hilo cortas con tijeras y una máquina de fiestas que cambia según la época del año.",
      tag: '▶ Pegar / Grab / Coger', instalar: true },
    { id: 'quem-e', rec: ['dois'], novo: '2026-11-14', nomes: { en: "Who Is It?", es: "¿Quién es?" }, nome: 'Quem é?', ico: '🫧', img: '/kids/quem-e/icone.svg', cor: '#ff5fa8', url: '/kids/quem-e/',
      texto: 'Pense em alguém e a meleca adivinha! Mais de 1.600 personagens, e ela aprende quem não conhece. E o Duelo de Caras: cada um escolhe uma cara em segredo e pergunta "usa óculos?", "tem coroa?" até descobrir a do outro. Com o Melekento Blue e a Pink Honey.',
      en: "Think of someone and the slime guesses who it is! More than 1,600 characters, and it learns the ones it doesn't know. Plus Face Duel: each player picks a secret face and asks \"glasses?\", \"a crown?\" until they find the other one's. With Melekento Blue and Pink Honey.",
      es: "¡Piensa en alguien y el slime adivina quién es! Más de 1600 personajes, y aprende los que no conoce. Y el Duelo de Caras: cada uno elige una cara en secreto y pregunta \"¿lleva gafas?\", \"¿tiene corona?\" hasta descubrir la del otro. Con Melekento Blue y Pink Honey.",
      tag: '▶ Adivinhar / Guess / Adivinar', instalar: true },
    { id: 'jogoteca',
      atualizado: { data: '2026-11-21', pt: 'Bolinhas da Angústia com 325 perguntas de 15 temas, que ficam mais difíceis a cada degrau, e queda de bolinha sorteada de verdade.', en: 'Nail-Biter Drop with 325 questions on 15 topics that get harder at every step, and truly random ball drops.', es: 'Bolitas de la Angustia con 325 preguntas de 15 temas que se ponen más difíciles en cada peldaño, y caída de bolitas de verdad al azar.' }, rec: ['tv'], novo: '2026-11-19', nome: 'Jogoteca', ico: '📚', img: '/kids/jogoteca/icone.svg', cor: '#ffcf4a', url: '/kids/jogoteca/',
      texto: 'A biblioteca dos jogos clássicos para jogar em família: Paciência, Sudoku, Boliche, o game show Bolinhas da Angústia e o Jogo da Velha e o Xadrez de guerra, cada um com três níveis. E vem mais por aí: Milionário José Pobre e Bilhar.',
      en: 'The library of classic games for the whole family: Solitaire, Sudoku, Bowling, the Nail-Biter Drop game show and Tic-Tac-Toe and Chess at war, each with three levels. And more on the way: Millionaire Joe Broke and Pool.',
      es: 'La biblioteca de los juegos clásicos para jugar en familia: Solitario, Sudoku, Bolos, el concurso Bolitas de la Angustia y el Tres en Raya y el Ajedrez en guerra, cada uno con tres niveles. Y vienen más: Millonario José Pobre y Billar.',
      tag: '▶ Jogar / Play / Jugar', instalar: true },
    { id: 'fruta-podre', rec: ['tv'], novo: '2026-11-19', nomes: { en: 'Rotten Fruit', es: 'Fruta Podrida' }, nome: 'FRUTA PODRE', ico: '🍎', img: '/kids/fruta-podre/icone.svg', cor: '#ff6b3d', url: '/kids/fruta-podre/',
      texto: 'A turma da rua estica o estilingue gigante e arremessa frutas podres nas fortalezas de caixote onde as pragas esconderam os doces! Maçã com verme, uva que se divide em três, pimenta a jato, melancia-bigorna e abacaxi que explode. Derrube tudo e ganhe 3 estrelas.',
      en: 'The neighborhood kids stretch their giant slingshot and launch rotten fruit at the crate forts where the pests hid the candy! A wormy apple, grapes that split in three, a jet-powered pepper, an anvil watermelon and an exploding pineapple. Knock it all down and earn 3 stars.',
      es: '¡La pandilla del barrio estira el tirachinas gigante y lanza fruta podrida contra los fuertes de cajas donde las plagas escondieron las golosinas! Manzana con gusano, uvas que se dividen en tres, guindilla a reacción, sandía-yunque y piña que explota. Derríbalo todo y gana 3 estrellas.',
      tag: '▶ Jogar / Play / Jugar', instalar: true },
    { id: 'tijolaco', rec: ['tv'], novo: '2026-11-19', nomes: { en: 'BrickFreak', es: 'Ladrillolío' }, nome: 'TIJOLAÇO', ico: '🧱', img: '/kids/tijolaco/icone.svg', cor: '#ff8a3d', url: '/kids/tijolaco/',
      texto: 'O jogo da obra! No TijoLinto, a betoneira-canhão atira tijolos na fila que rola pelo labirinto do canteiro: junte 3 da mesma cor, faça combos e abra os portões antes que a fila chegue na caçamba. Em breve: Obra, Demolição, Canteiro e Mutirão.',
      en: 'The construction game! In Brickrinth, the cement-mixer cannon fires bricks at a line rolling through the building-site maze: match 3 of a color, chain combos and swing the gates before the line reaches the dumpster. Coming soon: Build, Wrecking, Yard and Team-Up.',
      es: '¡El juego de la obra! En Ladrilaberinto, la hormigonera-cañón dispara ladrillos a la fila que rueda por el laberinto de la obra: junta 3 del mismo color, encadena combos y abre las compuertas antes de que la fila llegue al contenedor. Muy pronto: Obra, Derribo, Almacén y Faena.',
      tag: '▶ Jogar / Play / Jugar', instalar: true }

  ];
  // cartão final da estante (não é um jogo)

  window.BolinhoCatalogo = {
    jogos: JOGOS,
    instalaveis: function () { return JOGOS.filter(function (j) { return j.instalar; }); },
    sw: function (j) { return j.url.replace(/[^\/]*$/, '') + 'sw.js'; },
    // entrou na estante há 7 dias ou menos (campo "novo")
    ehNovo: function (j, hoje) {
      if (!j.novo) return false;
      var dias = ((hoje || Date.now()) - Date.parse(j.novo + 'T00:00:00')) / 864e5;
      return dias >= 0 && dias < 7;
    },
    novos: function (hoje) { return JOGOS.filter(function (j) { return window.BolinhoCatalogo.ehNovo(j, hoje); }); },
    // ganhou novidade há 7 dias ou menos (campo "atualizado")
    atualizados: function (hoje) {
      return JOGOS.filter(function (j) { return j.atualizado && window.BolinhoCatalogo.ehNovo({ novo: j.atualizado.data }, hoje); });
    }
  };

  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }
  // texto nos três idiomas: um pedaço de cada (class pt / en / es); o idioma.js mostra só o escolhido
  function tri(e, pt, en, es) {
    [['pt', pt], ['en', en || pt], ['es', es || pt]].forEach(function (p) { e.appendChild(el('span', p[0], p[1])); });
    return e;
  }
  function T(pt, en, es) { return window.BolinhoIdioma ? BolinhoIdioma.t(pt, en, es) : pt; }
  // rótulo para leitor de tela no idioma escolhido (troca junto com o idioma: data-rot="pt|en|es")
  function rotulo(e, pt, en, es) { e.setAttribute('data-rot', pt + '|' + en + '|' + es); e.setAttribute('aria-label', T(pt, en, es)); return e; }

  // ---------- ícones do cartão (dono, 15/Nov/2026) ----------
  var SVG = {
    off: '<path d="M2.5 9.5a14 14 0 0 1 19 0M5.5 12.8a9.5 9.5 0 0 1 13 0M8.6 16a5 5 0 0 1 6.8 0"/><circle cx="12" cy="19.3" r="1.2" fill="currentColor" stroke="none"/><path d="M3 3l18 18" stroke-width="2.4"/>',
    net: '<path d="M2.5 9.5a14 14 0 0 1 19 0M5.5 12.8a9.5 9.5 0 0 1 13 0M8.6 16a5 5 0 0 1 6.8 0"/><circle cx="12" cy="19.3" r="1.2" fill="currentColor" stroke="none"/>',
    tv: '<rect x="2.5" y="7" width="19" height="13" rx="2.5"/><path d="M8 2.5l4 4 4-4"/><path d="M9 23h6"/>',
    cam: '<circle cx="13.5" cy="3.8" r="2.1" fill="currentColor" stroke="none"/><path d="M13 7.2l-1.6 6.3M12.6 8.6l4.6 1.6 1.8-3.6M12.6 8.6L8.2 7.4 5.6 9.6M11.4 13.5l3.9 3 1.2 4.6M11.4 13.5l-2.6 3.7-4.3.4"/><path d="M2.5 4.5h3.5M1.5 7.5h3" stroke-width="1.7"/>',
    incl: '<rect x="8.6" y="5.6" width="6.8" height="12.8" rx="1.6" transform="rotate(25 12 12)"/><path d="M3.3 9.7A9 9 0 0 1 8.9 3.5M7.4 5.7l1.5-2.1-2.5-.7M20.7 14.3a9 9 0 0 1-5.6 6.2M16.6 18.3l-1.5 2.1 2.5.7" stroke-width="1.9"/>',
    dois: '<circle cx="8" cy="7.5" r="3"/><circle cx="16.5" cy="7.5" r="3"/><path d="M2.5 20.5c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6"/><path d="M14.5 14.6c.6-.1 1.3-.1 2-.1 3 0 5.5 2.4 5.5 6"/>',
    baixar: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    feito: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    todos: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    seta: '<path d="M6 9l6 6 6-6"/>'
  };
  var INFO = {
    off: [['Funciona sem internet', 'Works offline', 'Funciona sin internet'],
      ['Depois de aberto uma vez com internet, o jogo fica guardado no aparelho e abre até no avião.', 'Once you open it with the internet, the game is saved on the device and works even on a plane.', 'Después de abrirlo una vez con internet, el juego se queda guardado y funciona hasta en el avión.']],
    net: [['Precisa de internet', 'Needs the internet', 'Necesita internet'],
      ['Este jogo usa a internet (vídeos e músicas do YouTube). Sem internet ele fica apagado.', 'This game uses the internet (YouTube videos and music). Without it, the game is greyed out.', 'Este juego usa internet (vídeos y música de YouTube). Sin internet, se queda apagado.']],
    tv: [['Joga na TV', 'Plays on the TV', 'Se juega en la tele'],
      ['Abre na televisão; o celular vira o controle.', 'Opens on the TV; the phone becomes the remote.', 'Se abre en la tele; el móvil hace de mando.']],
    cam: [['Joga com o corpo', 'Play with your body', 'Se juega con el cuerpo'],
      ['Usa a câmera: você mexe o corpo ou as mãos e o jogo acompanha. Nada é gravado.', 'Uses the camera: move your body or your hands and the game follows you. Nothing is recorded.', 'Usa la cámara: mueves el cuerpo o las manos y el juego te sigue. No se graba nada.']],
    incl: [['Inclinar o celular', 'Tilt the phone', 'Inclinar el móvil'],
      ['Vire o celular para os lados para controlar (usa o sensor de movimento).', 'Tilt the phone from side to side to steer (it uses the motion sensor).', 'Inclina el móvil hacia los lados para controlar (usa el sensor de movimiento).']],
    dois: [['Dá para jogar em dois', 'Two can play', 'Para jugar entre dos'],
      ['Duas pessoas juntas, na mesma tela ou cada uma no seu celular.', 'Two people together, on the same screen or each on their own phone.', 'Dos personas juntas, en la misma pantalla o cada una en su móvil.']]
  };
  function svg(k, classe) { return '<svg class="' + (classe || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + SVG[k] + '</svg>'; }
  function icone(k) {
    var b = el('button', 'ic ic-' + k); b.type = 'button'; b.setAttribute('data-ic', k);
    b.innerHTML = svg(k);
    var n = INFO[k][0]; return rotulo(b, n[0], n[1], n[2]);
  }
  function recursos(j) { return [j.soOnline ? 'net' : 'off'].concat(j.rec || []); }
  // o jogo já tem ícone na tela inicial deste aparelho? (marca do instalar.js / navegacao.js; dono, 22/Nov/2026)
  function naTela(url) { try { return !!localStorage.getItem('bolinho:instalado:' + url.replace(/index\.html$/, '')); } catch (e) { return false; } }

  // Um cartão por jogo (dono, 15/Nov/2026): ícone, nome inteiro, "? ⌄" que abre a explicação, os ícones do que o
  // jogo faz, ⬇ Instalar e ▶ Jogar sempre na ponta direita. A kids.js, numa TV de verdade, põe ?tv=auto no Jogar
  // e anda pelos botões Jogar com as setas.
  function cartao(j) {
    var c = el('div', 'card');
    c.style.setProperty('--c', j.cor);
    c.setAttribute('data-jogo', j.id);
    c.setAttribute('data-rec', recursos(j).join(' '));
    // interruptor do RootifyONE (Controle dos apps → Bolinho de Chuva): jogo desligado some da estante (recursos.js)
    if (/^\/kids\//.test(j.url)) c.setAttribute('data-recurso', j.id);
    if (j.tv) c.setAttribute('data-tv', j.tv.param || '?tv=auto');
    if (j.instalar) { c.setAttribute('data-instalar', j.url); c.setAttribute('data-sw', window.BolinhoCatalogo.sw(j)); }
    else if (j.soOnline) c.setAttribute('data-so-online', '');
    var nomes = j.nomes || {}, nm = [j.nome, nomes.en || j.nome, nomes.es || j.nome];

    var linha = c.appendChild(el('div', 'c-l'));
    var ico = linha.appendChild(el('span', 'c-ic', j.img ? null : j.ico));
    if (j.img) { var im = document.createElement('img'); im.src = j.img; im.alt = ''; ico.appendChild(im); }
    var meio = linha.appendChild(el('div', 'c-m'));
    var topo = meio.appendChild(el('div', 'c-n'));
    tri(topo.appendChild(el('h2')), nm[0], nm[1], nm[2]);
    var q = topo.appendChild(el('button', 'c-q')); q.type = 'button'; q.setAttribute('aria-expanded', 'false');
    q.innerHTML = '?' + svg('seta');
    rotulo(q, 'Saiba mais sobre ' + nm[0], 'More about ' + nm[1], 'Más sobre ' + nm[2]);
    if (j.novo && window.BolinhoCatalogo.ehNovo(j)) tri(topo.appendChild(el('span', 'novo-selo')), 'Novo', 'New', 'Nuevo');
    var baixo = meio.appendChild(el('div', 'c-r'));
    var ics = baixo.appendChild(el('div', 'c-ics'));
    recursos(j).forEach(function (k) { ics.appendChild(icone(k)); });
    var bts = baixo.appendChild(el('div', 'c-bts'));   // ⬇ e Jogar juntos, sempre na ponta direita
    if (j.instalar) {
      var inst = bts.appendChild(el('a', 'c-inst')); inst.href = j.url + '?instalar=1';
      if (naTela(j.url)) {   // ✓ discreto: o toque abre o jogo, que explica que o ícone já existe (instalar.js)
        inst.className += ' feito'; inst.innerHTML = svg('feito');
        rotulo(inst, nm[0] + ' já está na tela inicial', nm[1] + ' is already on your home screen', nm[2] + ' ya está en la pantalla de inicio');
      } else {
        inst.innerHTML = svg('baixar');
        rotulo(inst, 'Instalar ' + nm[0] + ' no aparelho', 'Install ' + nm[1] + ' on this device', 'Instalar ' + nm[2] + ' en el dispositivo');
      }
    }
    var jogar = bts.appendChild(el('a', 'c-jogar')); jogar.href = j.url;
    tri(jogar, 'Jogar', 'Play', 'Jugar');
    tri(meio.appendChild(el('div', 'c-aviso')), 'Precisa de internet', 'Needs the internet', 'Necesita internet');

    var det = c.appendChild(el('div', 'c-d'));
    det.appendChild(el('p', 'pt', j.texto)); det.appendChild(el('p', 'en', j.en || j.texto)); det.appendChild(el('p', 'es', j.es || j.texto));
    var ul = det.appendChild(el('ul'));
    recursos(j).forEach(function (k) { var li = ul.appendChild(el('li')); li.appendChild(icone(k)); var n = INFO[k][0]; tri(li, n[0], n[1], n[2]); });
    if (j.tv) {
      var tv = det.appendChild(el('a', 'c-tv')); tv.href = j.url + (j.tv.param || '?tv=auto');
      tri(tv, '📺 Abrir na TV', '📺 Open on the TV', '📺 Abrir en la tele');
    }
    return c;
  }

  // ---------- filtros da estante (dono, 20/Nov/2026) ----------
  // Uma fileira de botões em cima dos cartões: "Todos" (aceso de começo) e um por recurso. Tocar num recurso apaga o
  // "Todos" e mostra só os jogos que têm TODOS os recursos acesos (ex.: "Em dois" + "TV"); apagar todos, ou tocar em
  // "Todos", volta a mostrar tudo. No celular, só os ícones; no tablet e no computador, ícone + nome. O "?" explica.
  var FILTROS = [
    ['off', 'Sem internet', 'Offline', 'Sin internet'],
    ['dois', 'Em dois', 'Two players', 'Entre dos'],
    ['cam', 'Com o corpo', 'Body moves', 'Con el cuerpo'],
    ['tv', 'Na TV', 'On TV', 'En la tele'],
    ['incl', 'Inclinar', 'Tilt', 'Inclinar']
  ];
  function filtros(grade) {
    var barra = el('div', 'filtros'); barra.setAttribute('role', 'group');
    rotulo(barra, 'Filtrar os jogos', 'Filter the games', 'Filtrar los juegos');
    var todos = barra.appendChild(el('button', 'f-bt f-todos')); todos.type = 'button'; todos.setAttribute('aria-pressed', 'true');
    todos.innerHTML = svg('todos');
    tri(todos.appendChild(el('span', 'f-txt')), 'Todos', 'All', 'Todos');
    var bts = FILTROS.map(function (f) {
      var b = barra.appendChild(el('button', 'f-bt f-' + f[0])); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('data-f', f[0]);
      b.innerHTML = svg(f[0]);
      tri(b.appendChild(el('span', 'f-txt')), f[1], f[2], f[3]);
      rotulo(b, f[1], f[2], f[3]);
      return b;
    });
    var q = barra.appendChild(el('button', 'f-bt f-q', '?')); q.type = 'button';
    rotulo(q, 'Como funcionam os filtros', 'How the filters work', 'Cómo funcionan los filtros');
    var vazio = el('p', 'f-vazio'); vazio.hidden = true;
    tri(vazio, 'Nenhum jogo tem tudo isso junto. Tente tirar um filtro.', 'No game has all of these together. Try removing a filter.', 'Ningún juego tiene todo eso a la vez. Prueba a quitar un filtro.');
    grade.parentNode.insertBefore(barra, grade);
    grade.parentNode.insertBefore(vazio, grade.nextSibling);
    function aplicar() {
      var on = bts.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.getAttribute('data-f'); });
      todos.setAttribute('aria-pressed', String(!on.length));
      var cs = grade.querySelectorAll('.card'), vistos = 0;
      for (var k = 0; k < cs.length; k++) {
        var rec = ' ' + (cs[k].getAttribute('data-rec') || '') + ' ';
        var mostra = on.every(function (f) { return rec.indexOf(' ' + f + ' ') >= 0; });
        cs[k].classList.toggle('filtrado', !mostra);
        if (mostra && !cs[k].hidden) vistos++;
      }
      vazio.hidden = vistos > 0;
    }
    todos.addEventListener('click', function () { bts.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); aplicar(); });
    bts.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); aplicar(); }); });
    q.addEventListener('click', function (e) {
      e.stopPropagation();
      bal.innerHTML = '';
      var tx = bal.appendChild(el('div'));
      tx.appendChild(el('b', null, T('Filtros', 'Filters', 'Filtros')));
      tx.appendChild(el('span', null, T('Toque num ícone para ver só os jogos que têm aquilo (dá para juntar vários: em dois e na TV, por exemplo). "Todos" mostra tudo de novo.',
        'Tap an icon to see only the games that have it (you can combine several: two players and on TV, for example). "All" shows everything again.',
        'Toca un icono para ver solo los juegos que lo tienen (puedes juntar varios: entre dos y en la tele, por ejemplo). "Todos" lo muestra todo otra vez.')));
      bal.hidden = false;
    });
    window.BolinhoCatalogo.filtrar = function (lista) { bts.forEach(function (b) { b.setAttribute('aria-pressed', String((lista || []).indexOf(b.getAttribute('data-f')) >= 0)); }); aplicar(); };
  }
  var bal;   // balão de explicação (criado mais abaixo)

  // monta cada grade marcada com data-catalogo (o script vem logo depois dela)
  var grades = document.querySelectorAll('[data-catalogo]');
  for (var i = 0; i < grades.length; i++) {
    var g = grades[i];
    if (g.getAttribute('data-montado')) continue;
    JOGOS.forEach(function (j) { g.appendChild(cartao(j)); });
    g.setAttribute('data-montado', '1');
    if (g.getAttribute('data-catalogo') === 'estante') filtros(g);
  }
  if (!grades.length) return;

  // ---------- abrir o cartão, explicar um ícone ----------
  bal = el('div', 'c-bal'); bal.hidden = true; bal.setAttribute('role', 'status'); document.body.appendChild(bal);
  function explicar(k) {
    var n = INFO[k][0], t = INFO[k][1];
    bal.innerHTML = svg(k, 'c-bal-ic ic-' + k);
    var tx = bal.appendChild(el('div'));
    tx.appendChild(el('b', null, T(n[0], n[1], n[2])));
    tx.appendChild(el('span', null, T(t[0], t[1], t[2])));
    bal.hidden = false;
  }
  document.addEventListener('click', function (e) {
    var ic = e.target.closest && e.target.closest('.card .ic');
    if (ic) { e.preventDefault(); explicar(ic.getAttribute('data-ic')); return; }
    bal.hidden = true;
    if (!e.target.closest) return;
    var c = e.target.closest('.card');
    if (!c || e.target.closest('a, .c-d')) return;
    var aberto = c.classList.toggle('aberto');
    c.querySelector('.c-q').setAttribute('aria-expanded', String(aberto));
  });
  // sem internet: o jogo que precisa dela (e o que ainda não foi guardado no aparelho) fica apagado
  function rede() {
    var cs = document.querySelectorAll('.card[data-jogo]');
    for (var k = 0; k < cs.length; k++) {
      var c = cs[k], sem = navigator.onLine === false && (c.hasAttribute('data-so-online') || (c.hasAttribute('data-instalar') && !c.hasAttribute('data-guardado')));
      c.classList.toggle('sem', sem);
      var a = c.querySelector('.c-aviso .pt');
      if (a && sem && !c.hasAttribute('data-so-online')) { a.textContent = 'Ainda não guardado neste aparelho'; a.nextSibling.textContent = 'Not saved on this device yet'; a.nextSibling.nextSibling.textContent = 'Aún no está guardado en este dispositivo'; }
    }
  }
  window.BolinhoCatalogo.rede = rede;
  rede(); window.addEventListener('online', rede); window.addEventListener('offline', rede);
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.card.sem a')) e.preventDefault(); }, true);
  if (window.BolinhoIdioma) BolinhoIdioma.aoMudar(function () {
    var rs = document.querySelectorAll('[data-rot]');
    for (var k = 0; k < rs.length; k++) { var p = rs[k].getAttribute('data-rot').split('|'); rs[k].setAttribute('aria-label', T(p[0], p[1], p[2])); }
    bal.hidden = true;
  });
})();