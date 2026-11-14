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
    texto    descrição em português   en    descrição em inglês   tag   texto do botão do cartão ("PT / EN")
             (o inglês, o en e o " / EN" do tag, só aparece com o interruptor "ingles" ligado: idioma.js)
    instalar true = pode ser instalado e funciona sem internet (o service worker fica em url + 'sw.js')
    soOnline true = precisa de internet (ex.: YouTube e TV); o cartão mostra "🌐 Só com internet"
    tv       { texto, tag, param } = abre na TV com este parâmetro; param vai no fim do endereço

  Como a página usa: <div class="grid" data-catalogo="estante"></div> (ou "tv") e, logo depois,
  <script src="catalogo.js"></script>. O script monta os cartões na hora (a página não pisca vazia).
*/
(function () {
  var JOGOS = [
    { id: 'baguncolandia', nome: 'Bagunçolândia', ico: '🐶', img: '/kids/baguncolandia/icone.svg', cor: '#c6ff3d', url: '/kids/baguncolandia/',
      texto: 'Frutas, doces e personagens voam na TV e você corta, pega, chuta, pula e abaixa com o corpo. 1 ou 2 pessoas, boneco personalizável, ou no dedo no celular.',
      en: 'Slice, catch, kick, jump and duck with your body on the TV. Or by finger on the phone.',
      tag: '▶ Brincar / Play', instalar: true,
      tv: { texto: 'Corte, pegue, chute, pule e abaixe com o corpo. A TV mostra o código; o celular filma.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'peluqueria', nome: 'Peluqueria', ico: '💇', cor: '#ffd166', url: '/kids/peluqueria/',
      texto: 'O provador maluco da família: uma coroa, um bigode ou uma peruca desce sobre o bicho e você toca na hora certa. Quanto mais perto, mais pontos. UHUL!',
      en: "The family's crazy fitting room: tap at the right moment, points for precision.",
      tag: '▶ Brincar / Play', instalar: true,
      tv: { texto: 'Um chapéu, um bigode ou uma peruca desce sobre o bicho: aperte OK na hora certa.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'danca-na-sala', nome: 'Dança na Sala', ico: '💃', cor: '#ff4fa3', url: '/kids/danca-na-sala.html',
      texto: 'A TV toca a música do YouTube e mostra quem está dançando, com neon, fogos e placar de energia. O celular filma e comanda.',
      en: 'Living Room Dance: YouTube on the TV, phone cameras live, energy score.',
      tag: '▶ Dançar / Dance', soOnline: true,
      tv: { texto: 'Música do YouTube na TV e as câmeras dos celulares ao vivo, com neon e placar de energia.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'vruuum', nome: 'Vruuum!', ico: '🏎️', cor: '#ff9f1c', url: '/kids/vruuum/',
      texto: 'Corrida de carrinho: desvie dos cones e da lama, pegue estrelas, turbo de arco-íris e rampas, passando pela praia, floresta, doces, neve e cidade neon. 1 ou 2 jogadores na mesma tela.',
      en: 'Kart race: dodge, grab stars, rainbow turbo and ramps across 4 worlds. 1 or 2 players.',
      tag: '▶ Correr / Race', instalar: true,
      tv: { texto: 'Corrida de carrinho: setas do controle para virar, OK para buzinar. Pegue as estrelas!', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'purpurina', nome: 'Purpurina', ico: '💄', cor: '#cfa8ff', url: '/kids/purpurina/',
      texto: 'Maquiagem, roupas, joias e muito brilho: monte a personagem, faça a maquiagem com o pincel, vista roupas e acessórios, cumpra desafios e desfile com confete. Brinque na TV com o celular de controle e música do YouTube ou do Spotify.',
      en: 'Makeup, outfits and sparkle: style your character, take challenges and walk the runway.',
      tag: '▶ Brilhar / Sparkle', instalar: true,
      tv: { texto: 'Maquiagem, roupas e desfile. A TV mostra um código: no celular, toque em 📺 Conectar na TV e brinque com o celular de controle. Música do YouTube e do Spotify.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'rabiscolandia', nome: 'Rabiscolândia', ico: '🎨', cor: '#c6ff3d', url: '/kids/rabiscolandia/',
      texto: 'Desenhar, livro de colorir e pintar por números, com pincéis que mexem, adesivos animados, paisagens e música. Desenhe com a mão na frente da câmera ou na TV com o celular de controle.',
      en: 'Draw, color and paint by numbers with live brushes, animated stickers and your hand in the camera.',
      tag: '▶ Desenhar / Draw', instalar: true,
      tv: { texto: 'Desenhar e colorir na TV. A TV mostra um código: no celular, toque em 📺 Na TV → 🎮 Controlar e desenhe com o dedo, mexendo o celular ou com a mão na câmera.', tag: '▶ Abrir na TV', param: '?tv=auto' } },
    { id: 'campo-minado', nome: 'Campo Minado', ico: '🦔', img: '/kids/campo-minado/icone.svg', cor: '#7ee081', url: '/kids/campo-minado/',
      texto: 'Abra o jardim inteiro sem acordar os ouriços que dormem embaixo da grama. Os números contam quantos estão em volta; marque com 🚩. Fácil, médio e difícil.',
      en: 'Garden Sweeper: open the whole garden without waking the sleepy hedgehogs. Easy, medium and hard.',
      tag: '▶ Jogar / Play', instalar: true },
    { id: 'enigmas', nome: 'Enigmatic', ico: '🧩', img: '/kids/enigmas/icone.svg', cor: '#9ee37d', url: '/kids/enigmas/',
      texto: 'Enigmas na lousa: ligue com giz o que combina, o cachorro com o osso, a bola com o gol. Do fácil (3 anos) ao difícil, com charadas, sequências e rimas.',
      en: 'Chalkboard riddles: draw a chalk line between the things that go together. From easy to really tricky.',
      tag: '▶ Ligar / Play', instalar: true },
    { id: 'labirinto', nome: 'Labirinto', ico: '🐶', img: '/kids/labirinto/icone.svg', cor: '#ffd166', url: '/kids/labirinto/',
      texto: 'Um labirinto novo a cada vez, quadrado, redondo ou de colmeia, que nasce em 3D. Leve o cachorrinho ou risque o caminho com o dedo, pegue o osso do meio e ache a saída.',
      en: 'A new 3D maze every time: walk the puppy or draw the path, grab the bone in the middle and find the way out.',
      tag: '▶ Explorar / Play', instalar: true },
    { id: 'cozinha', nome: 'Mão na Massa', ico: '🍳', img: '/kids/cozinha/icone.svg', cor: '#ff9f6e', url: '/kids/cozinha/',
      texto: 'Escolha uma receita, saia pela vila para pescar, colher, comprar no mercado ou pedir emprestado à vizinha, e volte para cozinhar: misturar, bater, ligar o fogão e servir. 12 receitas.',
      en: 'My Little Big Chef: gather ingredients around the village (fish, pick, shop, borrow) and cook step by step.',
      tag: '▶ Cozinhar / Cook', instalar: true },
    { id: 'aqua', nome: 'AQUA', ico: '💧', img: '/kids/aqua/icone.svg', cor: '#17c3c9', url: '/kids/aqua/',
      texto: 'Despeje os líquidos coloridos de um frasco no outro até cada frasco ficar de uma cor só. Fases sem fim, sempre com solução, frascos embaçados e uma lojinha de brincadeira. Fácil, médio e difícil.',
      en: 'AQUA: pour the colorful liquids from bottle to bottle until each one holds a single color. Endless stages, always solvable.',
      tag: '▶ Despejar / Pour', instalar: true },
    { id: 'batalha-naval', nome: 'Batalha Naval', ico: '⚓', img: '/kids/batalha-naval/icone.svg', cor: '#4fc3ff', url: '/kids/batalha-naval/',
      texto: 'Esconda seus navios e afunde os dos outros: E4, F2... Jogue em família, de 2 a 4 pessoas, cada uma no seu celular, com um código de 4 letras. Também contra o computador ou passando o aparelho.',
      en: 'Sea Battle: 2 to 4 players on their own phones with a 4-letter code, or against the computer.',
      tag: '▶ Navegar / Play', instalar: true },
    { id: 'a-garra', nome: 'A Garra', ico: '🧸', img: '/kids/a-garra/icone.svg', cor: '#ff4f7b', url: '/kids/a-garra/',
      texto: 'A máquina de pegar bichinho de pelúcia: leve a garra, aperte PEGAR e leve o bichinho até o buraco. Três máquinas, fácil, médio e difícil, e uma coleção com uma estrela dourada rara.',
      en: 'The claw machine: move the claw, press GRAB and drop the plush in the hole. Collect them all!',
      tag: '▶ Pegar / Grab', instalar: true },
    { id: 'quem-e', nome: 'Quem é?', ico: '🫧', img: '/kids/quem-e/icone.svg', cor: '#ff5fa8', url: '/kids/quem-e/',
      texto: 'Duelo de Caras: cada um escolhe um personagem em segredo e pergunta "usa óculos?", "tem coroa?" até descobrir o do outro. Com o Melekento Blue e a Pink Honey, contra a meleca, passando o aparelho ou cada um no seu celular.',
      en: 'Face Duel: pick a secret character and ask questions until you find the other one. With Melekento Blue and Pink Honey.',
      tag: '▶ Adivinhar / Guess', instalar: true },
    { id: 'contador-de-historias', nome: 'Contador de Histórias', ico: '📖', cor: '#3ee8ff', url: '/contador-de-historias/',
      texto: 'Histórias para dormir: um acervo para ler e ouvir, e a criação de histórias novas com os nomes da sua família.',
      en: 'Storyteller: bedtime stories to read, listen to and create.',
      tag: '▶ Ouvir / Listen', instalar: true,
      tv: { texto: 'Histórias para ler e ouvir na tela grande, antes de dormir.', tag: '▶ Abrir', param: '' } }
  ];
  // cartão final da estante (não é um jogo)
  var EM_BREVE = { url: '#', ico: '➕', nome: 'Próxima brincadeira', cor: '#ffd166', texto: 'Mais jogos de movimento, música e imaginação estão a caminho.', en: 'More games on the way.', tag: '🚧 Em breve / Soon' };

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
    a.appendChild(el('h2', null, j.nome));
    a.appendChild(el('p', null, j.texto));
    if (j.en) a.appendChild(el('p', 'en', j.en));
    // "▶ Brincar / Play": o " / Play" vai num class="en" (some sem o interruptor "ingles", idioma.js)
    var tag = j.tag.split(' / ');
    var sp = a.appendChild(el('span', 'tag', tag[0]));
    if (tag[1]) sp.appendChild(el('span', 'en', ' / ' + tag.slice(1).join(' / ')));
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