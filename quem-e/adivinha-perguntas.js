/* Quem é? — A Meleca Adivinha: as perguntas que a meleca pode fazer.

   Cada pergunta: { id, n (nível mínimo: 'I' Infantil, 'F' Família, 'A' Adulto), g (grupo), pt, en, es, padrao, nucleo }
     - n: no Infantil só entram as perguntas 'I'; no Família, 'I' e 'F'; no Adulto, todas.
     - padrao: resposta de quem não tem resposta guardada para esta pergunta. '?' (não sei) na maioria; 'n' nas
       perguntas de "turma" (é de Toy Story? é do Sing?…), que só têm Sim para quem é de lá.
     - nucleo: true = TODO personagem da lista precisa ter esta resposta guardada (o teste confere).
   RESPOSTAS (as mesmas que a criança toca): 's' Sim · 'p' Provavelmente sim / em parte · '?' Não sei / depende ·
     'q' Provavelmente não · 'n' Não.

   COMO RESPONDER POR UM PERSONAGEM (vale para quem escreve a lista em personagens/*.js):
     - Responda como uma criança ou um adulto comum responderia olhando o personagem como ele é mais conhecido.
     - Cor "principal" = a cor que a pessoa lembra primeiro (Mickey: preto e vermelho → 'cor-preto' s, 'cor-vermelho' p).
     - Gente de verdade: cor = a roupa/marca mais lembrada ou '?' se não houver; não responda cor de pele.
     - Bicho de verdade (cachorro, leão…) não é "de desenho" nem "de filme": desenho 'n', filme 'n'.
     - Na dúvida, '?' é melhor que um chute errado. */
(function (raiz) {
  'use strict';
  function P(id, n, g, pt, en, es, extra) { var p = { id: id, n: n, g: g, pt: pt, en: en, es: es, padrao: '?', nucleo: false }; for (var k in extra || {}) p[k] = extra[k]; return p; }
  var N = { nucleo: true }, T = { padrao: 'n' };
  var PERGUNTAS = [
    // ---------- o que é (núcleo) ----------
    P('real', 'I', 'oque', 'Existe de verdade (não é de desenho, filme ou livro)?', 'Is it real (not from a cartoon, movie or book)?', '¿Existe de verdad (no es de dibujos animados, de una película ni de un libro)?', N),
    P('pessoa', 'I', 'oque', 'É uma pessoa?', 'Is it a person?', '¿Es una persona?', N),
    P('bicho', 'I', 'oque', 'É um bicho?', 'Is it an animal?', '¿Es un animal?', N),
    P('coisa', 'I', 'oque', 'É uma coisa (um objeto, uma comida, um lugar)?', 'Is it a thing (an object, a food, a place)?', '¿Es una cosa (un objeto, una comida, un lugar)?', N),
    P('masculino', 'I', 'oque', 'É menino ou homem?', 'Is it a boy or a man?', '¿Es un chico o un hombre?', N),
    P('feminino', 'I', 'oque', 'É menina ou mulher?', 'Is it a girl or a woman?', '¿Es una chica o una mujer?', N),
    P('crianca', 'I', 'oque', 'É criança (ou filhote)?', 'Is it a child (or a baby animal)?', '¿Es un niño o una niña (o una cría de animal)?', N),
    P('idoso', 'I', 'oque', 'É velhinho ou velhinha?', 'Is it old?', '¿Es un abuelito o una abuelita?', N),
    P('brasileiro', 'I', 'oque', 'É do Brasil?', 'Is it from Brazil?', '¿Es de Brasil?', N),
    P('fala', 'I', 'oque', 'Fala como gente?', 'Does it talk like people?', '¿Habla como las personas?', N),
    // ---------- de onde vem (núcleo) ----------
    P('desenho', 'I', 'onde', 'Aparece em desenho animado?', 'Is it in a cartoon?', '¿Sale en dibujos animados?', N),
    P('filme', 'I', 'onde', 'Aparece em filme de cinema com atores de verdade?', 'Is it in a live-action movie?', '¿Sale en una película de cine con actores de verdad?', N),
    P('serie', 'F', 'onde', 'Aparece em série ou novela de TV?', 'Is it in a TV series or soap opera?', '¿Sale en una serie o en una telenovela?', N),
    P('livro', 'I', 'onde', 'Veio de um livro ou gibi?', 'Did it come from a book or comic?', '¿Viene de un libro o de un cómic?', N),
    P('videogame', 'I', 'onde', 'É de videogame?', 'Is it from a video game?', '¿Es de un videojuego?', N),
    P('internet', 'F', 'onde', 'Ficou famoso na internet (YouTube, TikTok…)?', 'Did it get famous on the internet (YouTube, TikTok…)?', '¿Se hizo famoso en internet (YouTube, TikTok…)?', N),
    P('tv', 'F', 'onde', 'Apresenta ou apresentou programa de TV?', 'Does it host (or did it host) a TV show?', '¿Presenta o ha presentado un programa de televisión?', N),
    P('disney', 'I', 'onde', 'É da Disney ou da Pixar?', 'Is it from Disney or Pixar?', '¿Es de Disney o de Pixar?', N),
    // ---------- o que faz (núcleo) ----------
    P('canta', 'I', 'faz', 'Canta?', 'Does it sing?', '¿Canta?', N),
    P('musica', 'I', 'faz', 'É famoso por causa de música?', 'Is it famous for music?', '¿Es famoso por la música?', N),
    P('esporte', 'I', 'faz', 'É famoso por esporte?', 'Is it famous for sports?', '¿Es famoso por el deporte?', N),
    P('heroi', 'I', 'faz', 'É super-herói ou herói da história?', 'Is it a superhero or the hero of the story?', '¿Es un superhéroe o el héroe de la historia?', N),
    P('vilao', 'I', 'faz', 'É vilão (malvado)?', 'Is it a villain (bad guy)?', '¿Es un villano (un malo)?', N),
    P('magia', 'I', 'faz', 'Tem poderes mágicos ou superpoderes?', 'Does it have magic or superpowers?', '¿Tiene poderes mágicos o superpoderes?', N),
    P('voa', 'I', 'faz', 'Voa?', 'Does it fly?', '¿Vuela?', N),
    P('engracado', 'I', 'faz', 'É engraçado?', 'Is it funny?', '¿Es gracioso?', N),
    P('realeza', 'I', 'faz', 'É princesa, príncipe, rei ou rainha?', 'Is it a princess, prince, king or queen?', '¿Es una princesa, un príncipe, un rey o una reina?', N),
    // ---------- como é (núcleo: as cores) ----------
    P('cor-azul', 'I', 'cor', 'É azul (ou usa muito azul)?', 'Is it blue (or wears a lot of blue)?', '¿Es azul (o lleva mucho azul)?', N),
    P('cor-vermelho', 'I', 'cor', 'É vermelho (ou usa muito vermelho)?', 'Is it red (or wears a lot of red)?', '¿Es rojo (o lleva mucho rojo)?', N),
    P('cor-verde', 'I', 'cor', 'É verde (ou usa muito verde)?', 'Is it green (or wears a lot of green)?', '¿Es verde (o lleva mucho verde)?', N),
    P('cor-amarelo', 'I', 'cor', 'É amarelo (ou usa muito amarelo)?', 'Is it yellow (or wears a lot of yellow)?', '¿Es amarillo (o lleva mucho amarillo)?', N),
    P('cor-rosa', 'I', 'cor', 'É rosa ou roxo (ou usa muito rosa ou roxo)?', 'Is it pink or purple (or wears a lot of it)?', '¿Es rosa o morado (o lleva mucho rosa o morado)?', N),
    P('cor-preto', 'I', 'cor', 'É preto (ou usa muito preto)?', 'Is it black (or wears a lot of black)?', '¿Es negro (o lleva mucho negro)?', N),
    P('cor-branco', 'I', 'cor', 'É branco (ou usa muito branco)?', 'Is it white (or wears a lot of white)?', '¿Es blanco (o lleva mucho blanco)?', N),
    P('cor-marrom', 'I', 'cor', 'É marrom ou laranja?', 'Is it brown or orange?', '¿Es marrón o naranja?', N),
    P('grande', 'I', 'como', 'É maior que um adulto?', 'Is it bigger than a grown-up?', '¿Es más grande que un adulto?', N),
    P('pequeno', 'I', 'como', 'É bem pequeno (cabe na mão)?', 'Is it really small (fits in your hand)?', '¿Es muy pequeño (cabe en la mano)?', N),
    // ---------- como é (outros) ----------
    P('chapeu', 'I', 'como', 'Usa chapéu, boné, coroa ou algo na cabeça?', 'Does it wear a hat, cap, crown or something on its head?', '¿Lleva sombrero, gorra, corona o algo en la cabeza?'),
    P('oculos', 'I', 'como', 'Usa óculos?', 'Does it wear glasses?', '¿Lleva gafas?'),
    P('loiro', 'I', 'como', 'Tem cabelo loiro?', 'Does it have blond hair?', '¿Tiene el pelo rubio?'),
    P('ruivo', 'I', 'como', 'Tem cabelo ruivo ou laranja?', 'Does it have red or orange hair?', '¿Tiene el pelo rojizo o naranja?'),
    P('careca', 'I', 'como', 'É careca?', 'Is it bald?', '¿Es calvo?'),
    P('barba', 'F', 'como', 'Tem barba ou bigode?', 'Does it have a beard or a mustache?', '¿Tiene barba o bigote?'),
    P('cabelo-comprido', 'I', 'como', 'Tem cabelo comprido?', 'Does it have long hair?', '¿Tiene el pelo largo?'),
    P('rabo', 'I', 'como', 'Tem rabo?', 'Does it have a tail?', '¿Tiene cola?'),
    P('pelo', 'I', 'como', 'Tem pelo (é peludo)?', 'Is it furry?', '¿Tiene pelo por todo el cuerpo (es peludo)?'),
    P('orelhas', 'I', 'como', 'Tem orelhas grandes?', 'Does it have big ears?', '¿Tiene las orejas grandes?'),
    P('capa', 'I', 'como', 'Usa capa ou máscara?', 'Does it wear a cape or a mask?', '¿Lleva capa o máscara?'),
    P('vestido', 'I', 'como', 'Usa vestido?', 'Does it wear a dress?', '¿Lleva vestido?'),
    P('arma', 'F', 'como', 'Anda com espada, arma ou varinha?', 'Does it carry a sword, weapon or wand?', '¿Lleva espada, arma o varita?'),
    P('rapido', 'I', 'como', 'É muito rápido?', 'Is it really fast?', '¿Es muy rápido?'),
    P('forte', 'I', 'como', 'É muito forte?', 'Is it really strong?', '¿Es muy fuerte?'),
    P('rico', 'F', 'como', 'É rico?', 'Is it rich?', '¿Es rico?'),
    // ---------- que bicho ----------
    P('cachorro', 'I', 'bicho', 'É um cachorro?', 'Is it a dog?', '¿Es un perro?'),
    P('gato', 'I', 'bicho', 'É um gato (ou leão, tigre)?', 'Is it a cat (or lion, tiger)?', '¿Es un gato (o un león, un tigre)?'),
    P('rato', 'I', 'bicho', 'É um rato ou camundongo?', 'Is it a mouse or rat?', '¿Es un ratón o una rata?'),
    P('urso', 'I', 'bicho', 'É um urso?', 'Is it a bear?', '¿Es un oso?'),
    P('passaro', 'I', 'bicho', 'É um passarinho ou ave?', 'Is it a bird?', '¿Es un pájaro o un ave?'),
    P('agua', 'I', 'bicho', 'Vive na água (peixe, tubarão…)?', 'Does it live in water (fish, shark…)?', '¿Vive en el agua (pez, tiburón…)?'),
    P('inseto', 'I', 'bicho', 'É um inseto ou bichinho pequeno (abelha, joaninha…)?', 'Is it an insect or a bug?', '¿Es un insecto o un bichito (abeja, mariquita…)?'),
    P('dinossauro', 'I', 'bicho', 'É um dinossauro ou dragão?', 'Is it a dinosaur or a dragon?', '¿Es un dinosaurio o un dragón?'),
    P('monstro', 'I', 'bicho', 'É um monstro ou criatura inventada?', 'Is it a monster or a made-up creature?', '¿Es un monstruo o una criatura inventada?'),
    P('robo', 'I', 'bicho', 'É um robô ou máquina?', 'Is it a robot or a machine?', '¿Es un robot o una máquina?'),
    P('selvagem', 'I', 'bicho', 'Vive na floresta ou na selva?', 'Does it live in the forest or jungle?', '¿Vive en el bosque o en la selva?'),
    P('fazenda', 'I', 'bicho', 'É bicho de fazenda (vaca, porco, galinha…)?', 'Is it a farm animal (cow, pig, chicken…)?', '¿Es un animal de granja (vaca, cerdo, gallina…)?'),
    P('estimacao', 'I', 'bicho', 'É bicho de estimação (dá para ter em casa)?', 'Is it a pet you can have at home?', '¿Es una mascota (se puede tener en casa)?'),
    P('comida', 'I', 'bicho', 'É de comer?', 'Is it something you eat?', '¿Se come?'),
    // ---------- gente de verdade ----------
    P('vivo', 'A', 'gente', 'Ainda está vivo?', 'Is it still alive?', '¿Sigue vivo?'),
    P('antigo', 'F', 'gente', 'Ficou famoso antes do ano 2000?', 'Did it get famous before the year 2000?', '¿Se hizo famoso antes del año 2000?'),
    P('recente', 'F', 'gente', 'Ficou famoso depois de 2010?', 'Did it get famous after 2010?', '¿Se hizo famoso después de 2010?'),
    P('historia', 'F', 'gente', 'É de muito, muito tempo atrás (da história)?', 'Is it from long, long ago (history)?', '¿Es de hace muchísimo tiempo (de la historia)?'),
    P('ator', 'F', 'gente', 'É ator ou atriz?', 'Is it an actor or actress?', '¿Es actor o actriz?'),
    P('dancar', 'I', 'gente', 'É famoso por dançar?', 'Is it famous for dancing?', '¿Es famoso por bailar?'),
    P('futebol', 'I', 'gente', 'Joga ou jogou futebol?', 'Does it play (or did it play) soccer?', '¿Juega o ha jugado al fútbol?'),
    P('corrida', 'F', 'gente', 'É de corrida (carro, atletismo, cavalo…)?', 'Is it about racing (cars, running, horses…)?', '¿Es de carreras (de coches, de atletismo, de caballos…)?'),
    P('cientista', 'F', 'gente', 'É cientista, inventor ou explorador?', 'Is it a scientist, inventor or explorer?', '¿Es científico, inventor o explorador?'),
    P('pintor', 'F', 'gente', 'É pintor, escritor ou artista?', 'Is it a painter, writer or artist?', '¿Es pintor, escritor o artista?'),
    P('politico', 'A', 'gente', 'É ou foi presidente ou político?', 'Is it (or was it) a president or a politician?', '¿Es o ha sido presidente o político?'),
    P('oscar', 'A', 'gente', 'Ganhou um Oscar?', 'Did it win an Oscar?', '¿Ha ganado un Óscar?'),
    P('estrangeiro-eua', 'F', 'gente', 'É dos Estados Unidos?', 'Is it from the United States?', '¿Es de Estados Unidos?'),
    P('europa', 'F', 'gente', 'É da Europa?', 'Is it from Europe?', '¿Es de Europa?'),
    P('professor', 'I', 'gente', 'Trabalha como professor, médico, policial ou bombeiro?', 'Does it work as a teacher, doctor, police officer or firefighter?', '¿Trabaja de profesor, médico, policía o bombero?'),
    P('detetive', 'I', 'gente', 'É detetive, espião ou resolve mistérios?', 'Is it a detective, spy or mystery solver?', '¿Es detective, espía o resuelve misterios?'),
    P('pirata', 'I', 'gente', 'É pirata, cowboy ou aventureiro?', 'Is it a pirate, cowboy or adventurer?', '¿Es pirata, vaquero o aventurero?'),
    P('espaco', 'I', 'gente', 'Vai para o espaço ou é de outro planeta?', 'Does it go to space or come from another planet?', '¿Va al espacio o es de otro planeta?'),
    P('veiculo', 'I', 'gente', 'Anda de carro, nave, moto ou é um veículo?', 'Does it ride in a car, spaceship or motorbike, or is it a vehicle?', '¿Va en coche, nave o moto, o es un vehículo?'),
    P('escola', 'I', 'gente', 'Vai à escola?', 'Does it go to school?', '¿Va al colegio?'),
    P('casado', 'F', 'gente', 'É casado ou namora alguém famoso na história?', 'Is it married or dating someone in the story?', '¿Está casado o tiene novio o novia en la historia?'),
    P('familia-grande', 'F', 'gente', 'Tem uma família grande na história (irmãos, pais…)?', 'Does it have a big family in the story?', '¿Tiene una familia grande en la historia (hermanos, padres…)?'),
    P('chapeu-magico', 'F', 'gente', 'É feiticeiro, bruxo ou fada?', 'Is it a wizard, witch or fairy?', '¿Es mago, bruja o hada?'),
    P('folclore', 'I', 'gente', 'É do folclore ou de uma lenda?', 'Is it from folklore or a legend?', '¿Es del folclore o de una leyenda?'),
    P('festa', 'I', 'gente', 'Aparece em festa ou data especial (Natal, Páscoa…)?', 'Does it show up on a holiday (Christmas, Easter…)?', '¿Aparece en una fiesta o un día especial (Navidad, Pascua…)?'),
    P('casa', 'I', 'gente', 'É alguém da família ou da nossa casa?', 'Is it someone from our family or home?', '¿Es alguien de la familia o de nuestra casa?', { padrao: 'n' }),
    // ---------- de qual turma (padrão Não) ----------
    P('t-toy-story', 'I', 'turma', 'É de Toy Story?', 'Is it from Toy Story?', '¿Es de Toy Story?', T),
    P('t-frozen', 'I', 'turma', 'É de Frozen?', 'Is it from Frozen?', '¿Es de Frozen?', T),
    P('t-princesas', 'I', 'turma', 'É das Princesas Disney?', 'Is it a Disney Princess?', '¿Es una de las Princesas Disney?', T),
    P('t-mickey', 'I', 'turma', 'É da turma do Mickey?', 'Is it one of Mickey\'s friends?', '¿Es de la pandilla de Mickey?', T),
    P('t-carros', 'I', 'turma', 'É de Carros?', 'Is it from Cars?', '¿Es de Cars?', T),
    P('t-nemo', 'I', 'turma', 'É de Procurando Nemo ou Dory?', 'Is it from Finding Nemo or Dory?', '¿Es de Buscando a Nemo o Buscando a Dory?', T),
    P('t-divertida', 'I', 'turma', 'É de Divertida Mente?', 'Is it from Inside Out?', '¿Es de Del revés (Inside Out)?', T),
    P('t-rei-leao', 'I', 'turma', 'É de O Rei Leão?', 'Is it from The Lion King?', '¿Es de El Rey León?', T),
    P('t-sing', 'I', 'turma', 'É do Sing?', 'Is it from Sing?', '¿Es de ¡Canta!?', T),
    P('t-minions', 'I', 'turma', 'É de Meu Malvado Favorito ou dos Minions?', 'Is it from Despicable Me or Minions?', '¿Es de Gru, mi villano favorito o de los Minions?', T),
    P('t-shrek', 'I', 'turma', 'É do Shrek?', 'Is it from Shrek?', '¿Es de Shrek?', T),
    P('t-madagascar', 'I', 'turma', 'É de Madagascar?', 'Is it from Madagascar?', '¿Es de Madagascar?', T),
    P('t-kungfu', 'I', 'turma', 'É de Kung Fu Panda?', 'Is it from Kung Fu Panda?', '¿Es de Kung Fu Panda?', T),
    P('t-dragao', 'I', 'turma', 'É de Como Treinar o Seu Dragão?', 'Is it from How to Train Your Dragon?', '¿Es de Cómo entrenar a tu dragón?', T),
    P('t-trolls', 'I', 'turma', 'É dos Trolls?', 'Is it from Trolls?', '¿Es de Trolls?', T),
    P('t-pokemon', 'I', 'turma', 'É Pokémon?', 'Is it a Pokémon?', '¿Es un Pokémon?', T),
    P('t-mario', 'I', 'turma', 'É do Mario ou da Nintendo?', 'Is it from Mario or Nintendo?', '¿Es de Mario o de Nintendo?', T),
    P('t-marvel', 'I', 'turma', 'É da Marvel (Vingadores, Homem-Aranha…)?', 'Is it from Marvel (Avengers, Spider-Man…)?', '¿Es de Marvel (Los Vengadores, Spider-Man…)?', T),
    P('t-dc', 'I', 'turma', 'É da DC (Batman, Superman, Mulher-Maravilha…)?', 'Is it from DC (Batman, Superman…)?', '¿Es de DC (Batman, Superman, Wonder Woman…)?', T),
    P('t-harry', 'I', 'turma', 'É de Harry Potter?', 'Is it from Harry Potter?', '¿Es de Harry Potter?', T),
    P('t-star-wars', 'F', 'turma', 'É de Star Wars?', 'Is it from Star Wars?', '¿Es de Star Wars?', T),
    P('t-monica', 'I', 'turma', 'É da Turma da Mônica?', "Is it from Monica's Gang?", '¿Es de la pandilla de Mónica (Turma da Mônica)?', T),
    P('t-sitio', 'I', 'turma', 'É do Sítio do Picapau Amarelo?', 'Is it from Sítio do Picapau Amarelo?', '¿Es del Sítio do Picapau Amarelo?', T),
    P('t-patrulha', 'I', 'turma', 'É da Patrulha Canina?', 'Is it from Paw Patrol?', '¿Es de la Patrulla Canina?', T),
    P('t-peppa', 'I', 'turma', 'É da Peppa Pig ou da Bluey?', 'Is it from Peppa Pig or Bluey?', '¿Es de Peppa Pig o de Bluey?', T),
    P('t-simpsons', 'F', 'turma', 'É dos Simpsons?', 'Is it from The Simpsons?', '¿Es de Los Simpson?', T),
    P('t-bob', 'I', 'turma', 'É do Bob Esponja?', 'Is it from SpongeBob?', '¿Es de Bob Esponja?', T),
    P('t-chaves', 'F', 'turma', 'É do Chaves ou do Chapolin?', 'Is it from El Chavo or El Chapulín?', '¿Es del Chavo del Ocho o del Chapulín Colorado?', T),
    P('t-volta-futuro', 'F', 'turma', 'É de De Volta para o Futuro?', 'Is it from Back to the Future?', '¿Es de Regreso al futuro?', T),
    P('t-oitentas', 'F', 'turma', 'É de Os Goonies, E.T. ou Uma Noite de Aventuras?', 'Is it from The Goonies, E.T. or Adventures in Babysitting?', '¿Es de Los Goonies, E.T. o Aventuras en la gran ciudad?', T),
    P('t-acao', 'A', 'turma', 'É de filme de ação (Exterminador, John Wick, Velocidade Máxima…)?', 'Is it from an action movie (Terminator, John Wick, Speed…)?', '¿Es de una película de acción (Terminator, John Wick, Speed…)?', T),
    P('t-novela', 'A', 'turma', 'É de novela brasileira?', 'Is it from a Brazilian soap opera?', '¿Es de una telenovela brasileña?', T),
    P('t-scooby', 'I', 'turma', 'É do Scooby-Doo, Tom e Jerry, Pica-Pau ou Looney Tunes?', 'Is it from Scooby-Doo, Tom and Jerry, Woody Woodpecker or Looney Tunes?', '¿Es de Scooby-Doo, Tom y Jerry, el Pájaro Loco o los Looney Tunes?', T),
    P('t-jurassic', 'F', 'turma', 'É de Jurassic Park?', 'Is it from Jurassic Park?', '¿Es de Parque Jurásico?', T)
  ];

  var GRUPOS = { oque: '🧩', onde: '📺', faz: '⭐', cor: '🎨', como: '👀', bicho: '🐾', gente: '👤', turma: '🎬' };
  var POR_ID = {};
  PERGUNTAS.forEach(function (p) { POR_ID[p.id] = p; });
  var API = { PERGUNTAS: PERGUNTAS, GRUPOS: GRUPOS, POR_ID: POR_ID, RESPOSTAS: ['s', 'p', '?', 'q', 'n'], NIVEIS: ['I', 'F', 'A'] };
  raiz.QEPerguntasAdivinha = API;
  if (typeof module === 'object' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
