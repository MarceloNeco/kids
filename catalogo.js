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
    tag      texto do botão do cartão, "PT / EN / ES" (ex.: '▶ Brincar / Play / Jugar')
             Só aparece o idioma escolhido na estante (🇧🇷 PT · 🇺🇸 EN · 🇪🇸 ES, idioma.js).
    instalar true = pode ser instalado e funciona sem internet (o service worker fica em url + 'sw.js')
    soOnline true = precisa de internet (ex.: YouTube e TV); o cartão mostra "🌐 Só com internet"
    tv       { texto, tag, param } = abre na TV com este parâmetro; param vai no fim do endereço

  Como a página usa: <div class="grid" data-catalogo="estante"></div> (ou "tv") e, logo depois,
  <script src="catalogo.js"></script>. O script monta os cartões na hora (a página não pisca vazia).
*/
(function () {
  var JOGOS = [
    { id: 'baguncolandia', nomes: { en: "Mayhemland", es: "Alborotolandia" }, nome: 'Bagunçolândia', ico: '🐶', img: '/kids/baguncolandia/icone.svg', cor: '#c6ff3d', url: '/kids/baguncolandia/',
      texto: 'Frutas, doces e personagens voam na TV e você corta, pega, chuta, pula e abaixa com o corpo. 1 ou 2 pessoas, boneco personalizável, ou no dedo no celular.',
      en: "Fruit, sweets and funny characters fly across the TV, and you slice, catch, kick, jump and duck with your whole body. 1 or 2 players, a character you can dress up, or play with your finger on the phone.",
      es: "Frutas, dulces y personajes vuelan por la tele, y tú los cortas, los atrapas, les das patadas, saltas y te agachas con todo el cuerpo. 1 o 2 jugadores, un muñeco a tu gusto, o con el dedo en el móvil.",
      tag: '▶ Brincar / Play / Jugar', instalar: true,
      tv: { texto: 'Corte, pegue, chute, pule e abaixe com o corpo. A TV mostra o código; o celular filma.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'peluqueria', nome: 'Peluqueria', ico: '💇', cor: '#ffd166', url: '/kids/peluqueria/',
      texto: 'O provador maluco da família: uma coroa, um bigode ou uma peruca desce sobre o bicho e você toca na hora certa. Quanto mais perto, mais pontos. UHUL!',
      en: "The family's silly dressing room: a crown, a moustache or a wig comes down onto the animal and you tap at just the right moment. The closer you get, the more points. WOOHOO!",
      es: "El probador loco de la familia: una corona, un bigote o una peluca baja sobre el animalito y tú tocas justo a tiempo. Cuanto más cerca, más puntos. ¡YUJU!",
      tag: '▶ Brincar / Play / Jugar', instalar: true,
      tv: { texto: 'Um chapéu, um bigode ou uma peruca desce sobre o bicho: aperte OK na hora certa.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'danca-na-sala', nomes: { en: "Living Room Dance", es: "Baile en la Sala" }, nome: 'Dança na Sala', ico: '💃', cor: '#ff4fa3', url: '/kids/danca-na-sala.html',
      texto: 'A TV toca a música do YouTube e mostra quem está dançando, com neon, fogos e placar de energia. O celular filma e comanda.',
      en: "The TV plays music from YouTube and shows everyone who's dancing, with neon lights, fireworks and an energy score. The phone films and runs the show.",
      es: "La tele pone música de YouTube y muestra a todos los que bailan, con luces de neón, fuegos artificiales y un marcador de energía. El móvil graba y lo controla todo.",
      tag: '▶ Dançar / Dance / Bailar', soOnline: true,
      tv: { texto: 'Música do YouTube na TV e as câmeras dos celulares ao vivo, com neon e placar de energia.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'vruuum', nome: 'Vruuum!', ico: '🏎️', cor: '#ff9f1c', url: '/kids/vruuum/',
      texto: 'Corrida de carrinho: desvie dos cones e da lama, pegue estrelas, turbo de arco-íris e rampas, passando pela praia, floresta, doces, neve e cidade neon. 1 ou 2 jogadores na mesma tela.',
      en: "Go-kart racing: dodge the cones and the mud, grab stars, use the rainbow turbo and jump the ramps, racing through the beach, the forest, candy land, the snow and a neon city. 1 or 2 players on the same screen.",
      es: "Carreras de karts: esquiva los conos y el barro, atrapa estrellas, usa el turbo arcoíris y salta las rampas, pasando por la playa, el bosque, el mundo de dulces, la nieve y una ciudad de neón. 1 o 2 jugadores en la misma pantalla.",
      tag: '▶ Correr / Race / Correr', instalar: true,
      tv: { texto: 'Corrida de carrinho: setas do controle para virar, OK para buzinar. Pegue as estrelas!', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'purpurina', nome: 'Purpurina', ico: '💄', cor: '#cfa8ff', url: '/kids/purpurina/',
      texto: 'Maquiagem, roupas, joias e muito brilho: monte a personagem, faça a maquiagem com o pincel, vista roupas e acessórios, cumpra desafios e desfile com confete. Brinque na TV com o celular de controle e música do YouTube ou do Spotify.',
      en: "Makeup, clothes, jewellery and lots of sparkle: create your character, do the makeup with a brush, try on clothes and accessories, take on challenges and walk the runway with confetti. Play on the TV using the phone as a remote, with music from YouTube or Spotify.",
      es: "Maquillaje, ropa, joyas y mucho brillo: crea tu personaje, maquíllalo con el pincel, ponle ropa y accesorios, cumple retos y desfila con confeti. Juega en la tele con el móvil como mando y música de YouTube o Spotify.",
      tag: '▶ Brilhar / Sparkle / Brillar', instalar: true,
      tv: { texto: 'Maquiagem, roupas e desfile. A TV mostra um código: no celular, toque em 📺 Conectar na TV e brinque com o celular de controle. Música do YouTube e do Spotify.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'rabiscolandia', nome: 'Rabiscolândia', ico: '🎨', cor: '#c6ff3d', url: '/kids/rabiscolandia/',
      texto: 'Desenhar, livro de colorir e pintar por números, com pincéis que mexem, adesivos animados, paisagens e música. Desenhe com a mão na frente da câmera ou na TV com o celular de controle.',
      en: "Drawing, a colouring book and paint by numbers, with brushes that move, animated stickers, landscapes and music. Draw with your hand in front of the camera, or on the TV using the phone as a remote.",
      es: "Dibujar, un libro para colorear y pintar por números, con pinceles que se mueven, pegatinas animadas, paisajes y música. Dibuja con la mano frente a la cámara o en la tele con el móvil como mando.",
      tag: '▶ Desenhar / Draw / Dibujar', instalar: true,
      tv: { texto: 'Desenhar e colorir na TV. A TV mostra um código: no celular, toque em 📺 Na TV → 🎮 Controlar e desenhe com o dedo, mexendo o celular ou com a mão na câmera.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'campo-minado', nomes: { en: "Garden Sweeper", es: "Buscaminas del Jardín" }, nome: 'Campo Minado', ico: '🦔', img: '/kids/campo-minado/icone.svg', cor: '#7ee081', url: '/kids/campo-minado/',
      texto: 'Abra o jardim inteiro sem acordar os ouriços que dormem embaixo da grama. Os números contam quantos estão em volta; marque com 🚩. Fácil, médio e difícil.',
      en: "Open up the whole garden without waking the hedgehogs sleeping under the grass. The numbers tell you how many are nearby; mark them with 🚩. Easy, medium and hard.",
      es: "Abre todo el jardín sin despertar a los erizos que duermen bajo el césped. Los números te dicen cuántos hay alrededor; márcalos con 🚩. Fácil, medio y difícil.",
      tag: '▶ Jogar / Play / Jugar', instalar: true },
    { id: 'enigmas', nome: 'Enigmatic', ico: '🧩', img: '/kids/enigmas/icone.svg', cor: '#9ee37d', url: '/kids/enigmas/',
      texto: 'Enigmas na lousa: ligue com giz o que combina, o cachorro com o osso, a bola com o gol. Do fácil (3 anos) ao difícil, com charadas, sequências e rimas.',
      en: "Riddles on the chalkboard: draw a chalk line between the things that go together, the dog and the bone, the ball and the goal. From easy (age 3) to really tricky, with riddles, patterns and rhymes.",
      es: "Acertijos en la pizarra: une con tiza lo que va junto, el perro con el hueso, la pelota con la portería. De fácil (3 años) a difícil, con adivinanzas, secuencias y rimas.",
      tag: '▶ Ligar / Match / Unir', instalar: true },
    { id: 'labirinto', nomes: { en: "Maze", es: "Laberinto" }, nome: 'Labirinto', ico: '🐶', img: '/kids/labirinto/icone.svg', cor: '#ffd166', url: '/kids/labirinto/',
      texto: 'Um labirinto novo a cada vez, quadrado, redondo ou de colmeia, que nasce em 3D. Leve o cachorrinho ou risque o caminho com o dedo, pegue o osso do meio e ache a saída.',
      en: "A brand-new maze every time, square, round or honeycomb-shaped, that pops up in 3D. Walk the puppy or draw the path with your finger, grab the bone in the middle and find the way out.",
      es: "Un laberinto nuevo cada vez, cuadrado, redondo o de panal, que aparece en 3D. Lleva al perrito o traza el camino con el dedo, coge el hueso del centro y encuentra la salida.",
      tag: '▶ Explorar / Explore / Explorar', instalar: true },
    { id: 'cozinha', nomes: { en: "My Little Big Chef", es: "Manos a la Masa" }, nome: 'Mão na Massa', ico: '🍳', img: '/kids/cozinha/icone.svg', cor: '#ff9f6e', url: '/kids/cozinha/',
      texto: 'Escolha uma receita, saia pela vila para pescar, colher, comprar no mercado ou pedir emprestado à vizinha, e volte para cozinhar: misturar, bater, ligar o fogão e servir. 12 receitas.',
      en: "Pick a recipe, head out around the village to fish, pick fruit, shop at the market or borrow from the neighbour, then come back to cook: mix, whisk, turn on the stove and serve. 12 recipes.",
      es: "Elige una receta, sal por el pueblo a pescar, cosechar, comprar en el mercado o pedirle algo prestado a la vecina, y vuelve a cocinar: mezclar, batir, encender el fuego y servir. 12 recetas.",
      tag: '▶ Cozinhar / Cook / Cocinar', instalar: true },
    { id: 'aqua', nome: 'AQUA', ico: '💧', img: '/kids/aqua/icone.svg', cor: '#17c3c9', url: '/kids/aqua/',
      texto: 'Despeje os líquidos coloridos de um frasco no outro até cada frasco ficar de uma cor só. Fases sem fim, sempre com solução, frascos embaçados e uma lojinha de brincadeira. Fácil, médio e difícil.',
      en: "Pour the colourful liquids from one bottle into another until each bottle holds just one colour. Endless levels that can always be solved, foggy bottles and a pretend little shop. Easy, medium and hard.",
      es: "Vierte los líquidos de colores de un frasco a otro hasta que cada frasco tenga un solo color. Niveles sin fin, siempre con solución, frascos empañados y una tiendecita de juguete. Fácil, medio y difícil.",
      tag: '▶ Despejar / Pour / Verter', instalar: true },
    { id: 'batalha-naval', nomes: { en: "Sea Battle", es: "Batalla Naval" }, nome: 'Batalha Naval', ico: '⚓', img: '/kids/batalha-naval/icone.svg', cor: '#4fc3ff', url: '/kids/batalha-naval/',
      texto: 'Esconda seus navios e afunde os dos outros: E4, F2... Jogue em família, de 2 a 4 pessoas, cada uma no seu celular, com um código de 4 letras. Também contra o computador ou passando o aparelho.',
      en: "Hide your ships and sink everyone else's: E4, F2... Play as a family, 2 to 4 players, each on their own phone, with a 4-letter code. You can also play against the computer or pass the phone around.",
      es: "Esconde tus barcos y hunde los de los demás: E4, F2... Juega en familia, de 2 a 4 personas, cada una en su móvil, con un código de 4 letras. También contra el ordenador o pasando el móvil.",
      tag: '▶ Navegar / Sail / Navegar', instalar: true },
    { id: 'a-garra', nomes: { en: "THE CLAW", es: "LA GARRA" }, nome: 'A-GARRA', ico: '🧸', img: '/kids/a-garra/icone.svg', cor: '#39ff6a', url: '/kids/a-garra/',
      texto: 'A máquina de pegar bichinho em 3D, igual à do fliperama: leve a garra com as setas, aperte PEGAR e torça para ela não soltar! Pelúcias, bichinhos que mexem, insetos, hambúrgueres e filhotes de verdade que andam.',
      en: "The 3D claw machine, just like at the arcade: move the claw with the arrows, press GRAB and hope it doesn't let go! Plushies, wiggly critters, bugs, burgers and real-looking puppies that walk around.",
      es: "La máquina de garra en 3D, igual que la de la feria: mueve la garra con las flechas, pulsa COGER ¡y cruza los dedos para que no lo suelte! Peluches, bichitos que se mueven, insectos, hamburguesas y cachorritos que caminan.",
      tag: '▶ Pegar / Grab / Coger', instalar: true },
    { id: 'quem-e', nomes: { en: "Who Is It?", es: "¿Quién es?" }, nome: 'Quem é?', ico: '🫧', img: '/kids/quem-e/icone.svg', cor: '#ff5fa8', url: '/kids/quem-e/',
      texto: 'Pense em alguém e a meleca adivinha! Mais de 660 personagens, e ela aprende quem não conhece. E o Duelo de Caras: cada um escolhe uma cara em segredo e pergunta "usa óculos?", "tem coroa?" até descobrir a do outro. Com o Melekento Blue e a Pink Honey.',
      en: "Think of someone and the slime guesses who it is! More than 660 characters, and it learns the ones it doesn't know. Plus Face Duel: each player picks a secret face and asks \"glasses?\", \"a crown?\" until they find the other one's. With Melekento Blue and Pink Honey.",
      es: "¡Piensa en alguien y el slime adivina quién es! Más de 660 personajes, y aprende los que no conoce. Y el Duelo de Caras: cada uno elige una cara en secreto y pregunta \"¿lleva gafas?\", \"¿tiene corona?\" hasta descubrir la del otro. Con Melekento Blue y Pink Honey.",
      tag: '▶ Adivinhar / Guess / Adivinar', instalar: true },
    { id: 'contador-de-historias', nomes: { en: "Storyteller", es: "Cuentacuentos" }, nome: 'Contador de Histórias', ico: '📖', cor: '#3ee8ff', url: '/contador-de-historias/',
      texto: 'Histórias para dormir: um acervo para ler e ouvir, e a criação de histórias novas com os nomes da sua família.',
      en: "Bedtime stories: a library to read and listen to, and brand-new stories made up with your family's names.",
      es: "Cuentos para dormir: una biblioteca para leer y escuchar, y cuentos nuevos inventados con los nombres de tu familia.",
      tag: '▶ Ouvir / Listen / Escuchar', instalar: true,
      tv: { texto: 'Histórias para ler e ouvir na tela grande, antes de dormir.', tag: '▶ Abrir', param: '' } }
  ];
  // cartão final da estante (não é um jogo)
  var EM_BREVE = { url: '#', ico: '➕', nome: 'Próxima brincadeira', cor: '#ffd166', texto: 'Mais jogos de movimento, música e imaginação estão a caminho.', en: 'More games full of movement, music and imagination are on the way.', es: 'Vienen más juegos de movimiento, música e imaginación.', nomes: { en: 'Next game', es: 'Próximo juego' }, tag: '🚧 Em breve / Coming soon / Muy pronto' };

  window.BolinhoCatalogo = {
    jogos: JOGOS,
    instalaveis: function () { return JOGOS.filter(function (j) { return j.instalar; }); },
    sw: function (j) { return j.url.replace(/[^\/]*$/, '') + 'sw.js'; }
  };

  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }
  // Um cartão por jogo. A kids.js, numa TV de verdade,
  // adiciona ?tv=auto e cuida das setas do controle; no celular/tablet não muda nada.
  function cartao(j) {
    var a = el('a', 'card');
    a.style.setProperty('--c', j.cor);
    a.href = j.url;
    a.setAttribute('data-jogo', j.id);
    // interruptor do RootifyONE (Controle dos apps → Bolinho de Chuva): jogo desligado some da estante (recursos.js)
    if (/^\/kids\//.test(j.url)) a.setAttribute('data-recurso', j.id);
    if (j.tv) a.setAttribute('data-tv', j.tv.param || '?tv=auto');
    if (j.instalar) { a.setAttribute('data-instalar', j.url); a.setAttribute('data-sw', window.BolinhoCatalogo.sw(j)); }
    else if (j.soOnline) a.setAttribute('data-so-online', '');
    var ico = a.appendChild(el('div', 'ico', j.img ? null : j.ico));
    if (j.img) {
      var im = document.createElement('img');
      im.src = j.img; im.alt = ''; im.style.cssText = 'display:block;width:1em;height:1em;border-radius:.22em';
      ico.appendChild(im);
    }
    // os três idiomas ficam no cartão; o idioma.js mostra só o escolhido (class="pt" / "en" / "es")
    var nomes = j.nomes || {};
    var h2 = a.appendChild(el('h2'));
    h2.appendChild(el('span', 'pt', j.nome));
    h2.appendChild(el('span', 'en', nomes.en || j.nome));
    h2.appendChild(el('span', 'es', nomes.es || j.nome));
    a.appendChild(el('p', 'pt', j.texto));
    a.appendChild(el('p', 'en', j.en || j.texto));
    a.appendChild(el('p', 'es', j.es || j.texto));
    var tag = j.tag.split(' / ');
    var sp = a.appendChild(el('span', 'tag'));
    sp.appendChild(el('span', 'pt', tag[0]));
    sp.appendChild(el('span', 'en', tag[1] ? '▶ ' + tag[1].replace(/^▶\s*/, '') : tag[0]));
    sp.appendChild(el('span', 'es', tag[2] ? '▶ ' + tag[2].replace(/^▶\s*/, '') : tag[0]));
    return a;
  }

  // monta cada grade marcada com data-catalogo (o script vem logo depois dela)
  var grades = document.querySelectorAll('[data-catalogo]');
  for (var i = 0; i < grades.length; i++) {
    var g = grades[i];
    if (g.getAttribute('data-montado')) continue;
    JOGOS.forEach(function (j) { g.appendChild(cartao(j)); });
    var b = cartao(EM_BREVE);
    b.className = 'card breve'; b.href = '#'; b.setAttribute('aria-disabled', 'true'); b.tabIndex = -1;
    b.removeAttribute('data-jogo');
    g.appendChild(b);
    g.setAttribute('data-montado', '1');
  }
})();