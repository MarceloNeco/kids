/* Quem é? — A Meleca Adivinha: personagens de DESENHO ANIMADO e ANIME (só animação): Cartoon Network (Hora de
   Aventura, Apenas um Show, Ben 10, Meninas Superpoderosas, Coragem, Dexter, Billy e Mandy, Gumball, Steven Universo),
   Nickelodeon (Bob Esponja, Rugrats, Jimmy Nêutron, Avatar, Os Padrinhos Mágicos, Tartarugas Ninja, Dora), clássicos
   (Looney Tunes, Hanna-Barbera, Scooby-Doo, Flintstones, Jetsons, Smurfs, Snoopy, Garfield, Popeye, He-Man), adultos
   (Simpsons, Futurama, Uma Família da Pesada, South Park, Rick e Morty), animes (Dragon Ball, Naruto, One Piece,
   Cavaleiros do Zodíaco, Sailor Moon, Pokémon, Ghibli, Doraemon, Sanrio, Digimon, Yu-Gi-Oh!, Beyblade), brasileiros
   (Turma da Mônica, Galinha Pintadinha) e pré-escolares (Ursinho Pooh, Thomas, Barney,
   Teletubbies).
   Formato igual ao de personagens/familia.js; perguntas em adivinha-perguntas.js. */
(function (raiz) {
  'use strict';
  var L = [
    ['princesa-jujuba', 'Princesa Jujuba (Hora de Aventura)', '🍬', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:p realeza:s cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s ' +
      'cabelo-comprido:s vestido:s comida:q antigo:n recente:s cientista:s estrangeiro-eua:s'],
    ['marceline', 'Marceline (Hora de Aventura)', '🦇', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:s musica:p esporte:n ' +
      'heroi:p vilao:q magia:s voa:s engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n cabelo-comprido:s ' +
      'arma:p forte:p monstro:p antigo:n recente:s estrangeiro-eua:s'],
    ['rei-gelado', 'Rei Gelado (Hora de Aventura)', '🥶', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:p magia:s voa:s engracado:s realeza:s cor-azul:s cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n chapeu:s careca:n ' +
      'barba:s cabelo-comprido:s antigo:n recente:s estrangeiro-eua:s'],
    ['bmo', 'BMO (Hora de Aventura)', '🎮', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:? feminino:? crianca:? idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:p cor-vermelho:n cor-verde:s ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p robo:s antigo:n ' +
      'recente:s estrangeiro-eua:s'],
    ['mordecai', 'Mordecai (Apenas um Show)', '🐦', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:q engracado:s realeza:n cor-azul:s cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n rabo:p passaro:s ' +
      'antigo:n recente:s estrangeiro-eua:s casado:p'],
    ['rigby', 'Rigby (Apenas um Show)', '🦝', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:s grande:n pequeno:q rabo:s pelo:s ' +
      'rapido:p selvagem:q antigo:n recente:s estrangeiro-eua:s'],
    ['benson', 'Benson (Apenas um Show)', '🍬', 'IFA',
      'real:n pessoa:p bicho:n coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:q magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n robo:p antigo:n ' +
      'recente:s estrangeiro-eua:s professor:q'],
    ['pairulito', 'Pairulito (Apenas um Show)', '🍭', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:s cor-marrom:n grande:n pequeno:n chapeu:s careca:p ' +
      'rico:s comida:q antigo:n recente:s estrangeiro-eua:s'],
    ['gwen-tennyson', 'Gwen Tennyson (Ben 10)', '🔮', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ruivo:s antigo:n ' +
      'recente:q estrangeiro-eua:s espaco:p veiculo:p familia-grande:p chapeu-magico:p'],
    ['vovo-max', 'Vovô Max (Ben 10)', '👴', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n careca:n forte:p ' +
      'antigo:n recente:q estrangeiro-eua:s detetive:p espaco:p veiculo:s familia-grande:p'],
    ['vilgax', 'Vilgax (Ben 10)', '🦑', 'IFA',
      'real:n pessoa:q bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:s ' +
      'cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:s pequeno:n arma:p forte:s ' +
      'monstro:s antigo:n recente:q espaco:s'],
    ['macaco-louco', 'Macaco Louco (Meninas Superpoderosas)', '🐵', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:n vilao:s magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:s ' +
      'cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n chapeu:s capa:s ' +
      'antigo:s recente:n cientista:s estrangeiro-eua:s'],
    ['professor-utonio', 'Professor Utônio (Meninas Superpoderosas)', '🧪', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:s cor-marrom:n grande:n pequeno:n antigo:s recente:n ' +
      'cientista:s estrangeiro-eua:s familia-grande:p casa:n'],
    ['coragem', 'Coragem, o Cão Covarde', '🐕', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:p ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n pelo:s orelhas:p ' +
      'cachorro:s monstro:n fazenda:q estimacao:s antigo:s recente:n estrangeiro-eua:s'],
    ['muriel', 'Muriel (Coragem, o Cão Covarde)', '👵', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:s brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n oculos:s vestido:s ' +
      'antigo:s recente:n estrangeiro-eua:q europa:p casado:s'],
    ['dexter', 'Dexter (O Laboratório de Dexter)', '🔬', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n oculos:s ruivo:s ' +
      'robo:q antigo:s recente:n cientista:s estrangeiro-eua:s escola:s'],
    ['dee-dee', 'Dee Dee (O Laboratório de Dexter)', '🩰', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:q magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n loiro:s ' +
      'cabelo-comprido:p antigo:s recente:n dancar:p estrangeiro-eua:s escola:p'],
    ['billy', 'Billy (As Terríveis Aventuras de Billy e Mandy)', '🤪', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s ruivo:p ' +
      'antigo:q recente:n estrangeiro-eua:s escola:s'],
    ['mandy', 'Mandy (Billy e Mandy)', '😠', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:p magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n loiro:s vestido:s ' +
      'antigo:q recente:n estrangeiro-eua:s escola:s'],
    ['puro-osso', 'Puro Osso (Billy e Mandy)', '💀', 'FA',
      'real:n pessoa:q bicho:n coisa:n masculino:s feminino:n crianca:n idoso:? brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:q magia:s voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:s cor-marrom:n grande:n pequeno:n capa:s arma:s ' +
      'monstro:s antigo:q recente:n'],
    ['darwin-gumball', 'Darwin (O Incrível Mundo de Gumball)', '🐠', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n agua:s estimacao:p ' +
      'antigo:n recente:s estrangeiro-eua:s escola:s familia-grande:s'],
    ['anais', 'Anais (O Incrível Mundo de Gumball)', '🐰', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n orelhas:s antigo:n ' +
      'recente:s cientista:p estrangeiro-eua:s escola:s familia-grande:s'],
    ['garnet', 'Garnet (Steven Universo)', '🕶️', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:p pequeno:n oculos:s arma:s ' +
      'forte:s antigo:n recente:s estrangeiro-eua:s casado:p'],
    ['ametista', 'Ametista (Steven Universo)', '💜', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n cabelo-comprido:s ' +
      'arma:s antigo:n recente:s estrangeiro-eua:s'],
    ['perola-steven', 'Pérola (Steven Universo)', '🩰', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:n engracado:q realeza:n cor-azul:? cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:? grande:n pequeno:n arma:s antigo:n ' +
      'recente:s dancar:p estrangeiro-eua:s'],
    ['johnny-bravo', 'Johnny Bravo', '😎', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:p cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n oculos:s loiro:s ' +
      'forte:s antigo:s recente:n dancar:p estrangeiro-eua:s'],
    ['gary', 'Gary (Bob Esponja)', '🐌', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:q ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p agua:s inseto:p ' +
      'estimacao:s antigo:s recente:n t-bob:s'],
    ['plankton', 'Plankton (Bob Esponja)', '🦠', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:s magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:s ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s agua:s antigo:s ' +
      'recente:n cientista:s casado:s t-bob:s'],
    ['sra-puff', 'Sra. Puff (Bob Esponja)', '🐡', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:? cor-marrom:n grande:n pequeno:n agua:s antigo:q ' +
      'recente:n professor:s veiculo:s escola:p t-bob:s'],
    ['perola-bob', 'Pérola (Bob Esponja)', '🐋', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:? cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n rico:p agua:s ' +
      'antigo:q recente:n familia-grande:q t-bob:s'],
    ['tommy-pickles', 'Tommy Pickles (Rugrats)', '👶', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:p ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n careca:s antigo:s ' +
      'recente:n estrangeiro-eua:s familia-grande:p'],
    ['angelica-pickles', 'Angélica Pickles (Rugrats)', '🎀', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:p magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n loiro:s vestido:s ' +
      'rico:q antigo:s recente:n estrangeiro-eua:s'],
    ['chuckie', 'Chuckie (Rugrats)', '👓', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:p ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:n cor-verde:? ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n oculos:s ruivo:s ' +
      'antigo:s recente:n estrangeiro-eua:s'],
    ['jimmy-neutron', 'Jimmy Nêutron', '🚀', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n robo:q antigo:q ' +
      'recente:n cientista:s estrangeiro-eua:s espaco:p veiculo:p escola:s'],
    ['aang', 'Aang (Avatar: A Lenda de Aang)', '🌀', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:p engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n careca:s arma:p ' +
      'antigo:n recente:q'],
    ['katara', 'Katara (Avatar: A Lenda de Aang)', '💧', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n cabelo-comprido:s ' +
      'antigo:n recente:q familia-grande:p'],
    ['sokka', 'Sokka (Avatar: A Lenda de Aang)', '🪃', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:n voa:n engracado:s realeza:n cor-azul:s cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n arma:s antigo:n ' +
      'recente:q'],
    ['zuko', 'Zuko (Avatar: A Lenda de Aang)', '🔥', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:p magia:s voa:n engracado:p realeza:s cor-azul:n cor-vermelho:s cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n arma:p antigo:n ' +
      'recente:q'],
    ['timmy-turner', 'Timmy Turner (Os Padrinhos Mágicos)', '🧢', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:q serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:p voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s antigo:n ' +
      'recente:q estrangeiro-eua:s escola:s'],
    ['cosmo', 'Cosmo (Os Padrinhos Mágicos)', '🪄', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:s voa:s engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:s ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p chapeu:s arma:s ' +
      'antigo:n recente:q estrangeiro-eua:s casado:s chapeu-magico:s'],
    ['wanda-padrinhos', 'Wanda (Os Padrinhos Mágicos)', '🪄', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:s voa:s engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p chapeu:s arma:s ' +
      'antigo:n recente:q estrangeiro-eua:s casado:s chapeu-magico:s'],
    ['leonardo-tmnt', 'Leonardo (Tartarugas Ninja)', '🐢', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:s serie:p livro:s videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:n voa:n engracado:q realeza:n cor-azul:s cor-vermelho:n cor-verde:s ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:q capa:s ' +
      'arma:s forte:s agua:q antigo:s recente:n estrangeiro-eua:s t-scooby:n'],
    ['michelangelo-tmnt', 'Michelangelo (Tartarugas Ninja)', '🍕', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:s serie:p livro:s videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:s ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n rabo:q capa:s ' +
      'arma:s forte:s agua:q antigo:s recente:n estrangeiro-eua:s t-scooby:n'],
    ['donatello-tmnt', 'Donatello (Tartarugas Ninja)', '🔧', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:s serie:p livro:s videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s ' +
      'cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:q capa:s ' +
      'arma:s forte:s agua:q antigo:s recente:n cientista:s estrangeiro-eua:s t-scooby:n'],
    ['rafael-tmnt', 'Rafael (Tartarugas Ninja)', '🥷', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:s serie:p livro:s videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:q magia:n voa:n engracado:q realeza:n cor-azul:n cor-vermelho:p cor-verde:s ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:q capa:s ' +
      'arma:s forte:s agua:q antigo:s recente:n estrangeiro-eua:s t-scooby:n'],
    ['splinter', 'Mestre Splinter (Tartarugas Ninja)', '🐀', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s ' +
      'desenho:s filme:s serie:p livro:s videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n barba:s rabo:s ' +
      'arma:p rato:s antigo:s recente:n estrangeiro-eua:s professor:p'],
    ['arnold-hey', 'Arnold (Hey Arnold!)', '🏈', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:n voa:n engracado:p realeza:n cor-azul:p cor-vermelho:? cor-verde:p ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s loiro:s ' +
      'antigo:s recente:n estrangeiro-eua:s escola:s'],
    ['botas', 'Botas (Dora, a Aventureira)', '🐒', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:? cor-preto:n cor-branco:n cor-marrom:? grande:n pequeno:n rabo:s pelo:s ' +
      'selvagem:s antigo:n recente:q estrangeiro-eua:s pirata:p'],
    ['raposo', 'Raposo (Dora, a Aventureira)', '🦊', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:p magia:n voa:n engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n rabo:s pelo:s ' +
      'capa:s selvagem:s antigo:n recente:q estrangeiro-eua:s'],
    ['diego', 'Diego (Vai, Diego!)', '🐆', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n selvagem:p ' +
      'antigo:n recente:q cientista:p estrangeiro-eua:s pirata:s familia-grande:p'],
    ['gaguinho', 'Gaguinho (Looney Tunes)', '🐷', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:p cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:p fazenda:p ' +
      'antigo:s recente:n estrangeiro-eua:s t-scooby:s'],
    ['taz', 'Taz (Diabo da Tasmânia)', '🌪️', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:q ' +
      'desenho:s filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:q magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n rabo:s pelo:s ' +
      'rapido:s forte:s selvagem:s antigo:s recente:n estrangeiro-eua:s t-scooby:s'],
    ['eufrazino', 'Eufrazino Puxa-Briga (Looney Tunes)', '🤠', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:s magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s ruivo:s ' +
      'barba:s arma:s antigo:s recente:n estrangeiro-eua:s pirata:s t-scooby:s'],
    ['hortelino', 'Hortelino Troca-Letras (Looney Tunes)', '🔫', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:p magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:s careca:s ' +
      'arma:s selvagem:p antigo:s recente:n estrangeiro-eua:s t-scooby:s'],
    ['marvin-marciano', 'Marvin, o Marciano', '👽', 'IFA',
      'real:n pessoa:q bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:s magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:p cor-verde:p ' +
      'cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s arma:p ' +
      'monstro:p antigo:s recente:n estrangeiro-eua:s espaco:s t-scooby:s'],
    ['ligeirinho', 'Ligeirinho (Speedy Gonzales)', '🐭', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:p chapeu:s rapido:s ' +
      'rato:s antigo:s recente:n estrangeiro-eua:s t-scooby:s'],
    ['lola-bunny', 'Lola Bunny (Looney Tunes)', '🐰', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:p ' +
      'heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:p grande:n pequeno:n rabo:s orelhas:s ' +
      'antigo:p recente:n estrangeiro-eua:s casado:p t-scooby:s'],
    ['spike-tom-jerry', 'Spike (Tom e Jerry)', '🐶', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:p ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:? cor-marrom:? grande:n pequeno:n forte:s cachorro:s ' +
      'estimacao:p antigo:s recente:n estrangeiro-eua:s t-scooby:s'],
    ['zeca-urubu', 'Zeca Urubu (Pica-Pau)', '🦅', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:s magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:p grande:n pequeno:n passaro:s antigo:s ' +
      'recente:n estrangeiro-eua:s t-scooby:s'],
    ['pantera-cor-de-rosa', 'Pantera Cor-de-Rosa', '🩷', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:n ' +
      'desenho:s filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:p esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:s gato:s ' +
      'antigo:s recente:n estrangeiro-eua:s detetive:q'],
    ['ze-colmeia', 'Zé Colmeia', '🐻', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:p ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:s urso:s ' +
      'selvagem:s comida:n antigo:s recente:n estrangeiro-eua:s'],
    ['catatau', 'Catatau (Zé Colmeia)', '🐻', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:n urso:s ' +
      'selvagem:s antigo:s recente:n estrangeiro-eua:s'],
    ['manda-chuva', 'Manda-Chuva', '🐱', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:s cor-rosa:p cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s rabo:s ' +
      'gato:s antigo:s recente:n estrangeiro-eua:s'],
    ['penelope-charmosa', 'Penélope Charmosa (Corrida Maluca)', '💗', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:p loiro:s ' +
      'antigo:s recente:n corrida:s estrangeiro-eua:s veiculo:s'],
    ['dick-vigarista', 'Dick Vigarista (Corrida Maluca)', '🏎️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:s magia:n voa:p engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:p cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n barba:s antigo:s ' +
      'recente:n corrida:s estrangeiro-eua:s veiculo:s'],
    ['muttley', 'Muttley (Corrida Maluca)', '🐕', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:q ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:p magia:n voa:p engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n cachorro:s ' +
      'antigo:s recente:n corrida:s estrangeiro-eua:s veiculo:s'],
    ['fred-jones', 'Fred Jones (Scooby-Doo)', '🧣', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:s serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n loiro:s antigo:s ' +
      'recente:n estrangeiro-eua:s detetive:s veiculo:s t-scooby:s'],
    ['daphne', 'Daphne (Scooby-Doo)', '💜', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:s serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:p ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ruivo:s ' +
      'cabelo-comprido:s vestido:s antigo:s recente:n estrangeiro-eua:s detetive:s t-scooby:s'],
    ['wilma', 'Wilma Flintstone', '👩', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n ruivo:s vestido:s ' +
      'antigo:s recente:n historia:p estrangeiro-eua:s casado:s'],
    ['barney-rubble', 'Barney Rubble (Os Flintstones)', '🦴', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n loiro:s antigo:s ' +
      'recente:n historia:p estrangeiro-eua:s veiculo:p casado:s'],
    ['pedrita', 'Pedrita (Os Flintstones)', '🍼', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n chapeu:p ruivo:s ' +
      'antigo:s recente:n historia:p estrangeiro-eua:s'],
    ['dino-flintstones', 'Dino (Os Flintstones)', '🦖', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:q ' +
      'desenho:s filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n rabo:s ' +
      'dinossauro:s estimacao:s antigo:s recente:n historia:p estrangeiro-eua:s'],
    ['george-jetson', 'George Jetson (Os Jetsons)', '🛸', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:p engracado:s realeza:n cor-azul:? cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:? cor-marrom:n grande:n pequeno:n robo:n antigo:s ' +
      'recente:n estrangeiro-eua:s espaco:p veiculo:s casado:s familia-grande:s'],
    ['rosie-jetsons', 'Rosie (Os Jetsons)', '🤖', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n vestido:p robo:s ' +
      'antigo:s recente:n estrangeiro-eua:s'],
    ['astro-jetsons', 'Astro (Os Jetsons)', '🐕', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:p ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:? grande:n pequeno:n cachorro:s ' +
      'estimacao:s antigo:s recente:n estrangeiro-eua:s espaco:p'],
    ['gargamel', 'Gargamel (Smurfs)', '🧙', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:s serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:s magia:p voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n careca:p gato:n ' +
      'antigo:s recente:n europa:s chapeu-magico:s'],
    ['ranzinza', 'Smurf Ranzinza', '😤', 'IFA',
      'real:n pessoa:q bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:s chapeu:s monstro:p ' +
      'antigo:s recente:n europa:s'],
    ['lucy-snoopy', 'Lucy (Turma do Snoopy)', '💙', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:n livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:q magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n vestido:s antigo:s ' +
      'recente:n estrangeiro-eua:s escola:p'],
    ['linus', 'Linus (Turma do Snoopy)', '🧸', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:n livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:s recente:n ' +
      'estrangeiro-eua:s escola:p'],
    ['woodstock', 'Woodstock (Turma do Snoopy)', '🐤', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:n ' +
      'desenho:s filme:n serie:n livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:s engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s passaro:s antigo:s ' +
      'recente:n estrangeiro-eua:s'],
    ['odie', 'Odie (Garfield)', '🐶', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:n ' +
      'desenho:s filme:s serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n orelhas:s ' +
      'cachorro:s estimacao:s antigo:s recente:n estrangeiro-eua:s'],
    ['jon-arbuckle', 'Jon Arbuckle (Garfield)', '👔', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:s serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:s recente:n ' +
      'pintor:p estrangeiro-eua:s'],
    ['olivia-palito', 'Olívia Palito (Popeye)', '👩', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:s serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n cabelo-comprido:n ' +
      'antigo:s recente:n estrangeiro-eua:s casado:p'],
    ['brutus', 'Brutus (Popeye)', '🧔', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:s serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:s magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:? cor-branco:n cor-marrom:n grande:p pequeno:n barba:s forte:s ' +
      'antigo:s recente:n estrangeiro-eua:s pirata:p'],
    ['pinky', 'Pinky (Pinky e o Cérebro)', '🐭', 'FA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n rabo:s rato:s ' +
      'antigo:s recente:n cientista:n estrangeiro-eua:s'],
    ['cerebro', 'Cérebro (Pinky e o Cérebro)', '🧠', 'FA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:p magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n rabo:s rato:s ' +
      'antigo:s recente:n cientista:s estrangeiro-eua:s'],
    ['he-man', 'He-Man', '💪', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:s serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:n engracado:p realeza:s cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:p grande:n pequeno:n loiro:s arma:s ' +
      'forte:s antigo:s recente:n estrangeiro-eua:s'],
    ['esqueleto', 'Esqueleto (He-Man)', '💀', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:s serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:s magia:s voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:p cor-rosa:p cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n capa:s arma:s ' +
      'monstro:p antigo:s recente:n estrangeiro-eua:s'],
    ['mestre-dos-magos', 'Mestre dos Magos (Caverna do Dragão)', '🧙', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n careca:p barba:? ' +
      'arma:p antigo:s recente:n estrangeiro-eua:s chapeu-magico:s'],
    ['gasparzinho', 'Gasparzinho', '👻', 'IFA',
      'real:n pessoa:q bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:s serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:s engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n monstro:p antigo:s ' +
      'recente:n estrangeiro-eua:s'],
    ['inspetor-bugiganga', 'Inspetor Bugiganga', '🕵️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:s serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:p engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:s robo:p ' +
      'antigo:s recente:n estrangeiro-eua:s professor:p detetive:s'],
    ['maggie', 'Maggie Simpson', '🍼', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:n ' +
      'desenho:s filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:s recente:n ' +
      'estrangeiro-eua:s familia-grande:p t-simpsons:s'],
    ['sr-burns', 'Sr. Burns (Os Simpsons)', '💰', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s ' +
      'desenho:s filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:s magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:? ' +
      'cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n careca:p rico:s ' +
      'antigo:s recente:n estrangeiro-eua:s familia-grande:p t-simpsons:s'],
    ['ned-flanders', 'Ned Flanders (Os Simpsons)', '🧔', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:s ' +
      'cor-amarelo:p cor-rosa:p cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n oculos:s barba:s ' +
      'antigo:s recente:n estrangeiro-eua:s familia-grande:p t-simpsons:s'],
    ['milhouse', 'Milhouse (Os Simpsons)', '🤓', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:? cor-verde:n ' +
      'cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n oculos:s antigo:s ' +
      'recente:n estrangeiro-eua:s escola:s familia-grande:p t-simpsons:s'],
    ['krusty', 'Krusty, o Palhaço (Os Simpsons)', '🤡', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:s livro:n videogame:n internet:n tv:s disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:p cor-verde:s ' +
      'cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n rico:p antigo:s ' +
      'recente:n estrangeiro-eua:s familia-grande:p t-simpsons:s'],
    ['peter-griffin', 'Peter Griffin (Uma Família da Pesada)', '🍺', 'A',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:s ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n oculos:s antigo:q ' +
      'recente:n estrangeiro-eua:s casado:s familia-grande:s'],
    ['stewie', 'Stewie Griffin (Uma Família da Pesada)', '🍼', 'A',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:p magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n arma:p antigo:q ' +
      'recente:n cientista:s estrangeiro-eua:s familia-grande:s'],
    ['bender', 'Bender (Futurama)', '🤖', 'FA',
      'real:n pessoa:n bicho:n coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:p magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:? cor-branco:? cor-marrom:n grande:n pequeno:n robo:s antigo:q ' +
      'recente:n estrangeiro-eua:s espaco:s'],
    ['fry', 'Fry (Futurama)', '🍕', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:p cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n ruivo:s antigo:q ' +
      'recente:n estrangeiro-eua:s espaco:s veiculo:p'],
    ['cartman', 'Cartman (South Park)', '🧢', 'A',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:p magia:n voa:n engracado:s realeza:n cor-azul:p cor-vermelho:s cor-verde:n ' +
      'cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s antigo:s ' +
      'recente:n estrangeiro-eua:s escola:s'],
    ['rick-sanchez', 'Rick (Rick e Morty)', '🧪', 'A',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s ' +
      'desenho:s filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:p cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n arma:s antigo:n ' +
      'recente:s cientista:s estrangeiro-eua:s espaco:s veiculo:s'],
    ['morty', 'Morty (Rick e Morty)', '😰', 'A',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s ' +
      'estrangeiro-eua:s espaco:s escola:s'],
    ['goku', 'Goku (Dragon Ball)', '🐉', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:q serie:p livro:s videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:s engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n loiro:p rabo:p ' +
      'rapido:s forte:s antigo:s recente:n estrangeiro-eua:n europa:n espaco:s'],
    ['vegeta', 'Vegeta (Dragon Ball)', '👑', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:p magia:s voa:s engracado:p realeza:s cor-azul:s cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n forte:s antigo:s ' +
      'recente:n estrangeiro-eua:n europa:n espaco:s casado:s'],
    ['gohan', 'Gohan (Dragon Ball)', '📚', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:s engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n forte:s antigo:s ' +
      'recente:n estrangeiro-eua:n europa:n espaco:p escola:p'],
    ['bulma', 'Bulma (Dragon Ball)', '🔧', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rico:s antigo:s ' +
      'recente:n cientista:s estrangeiro-eua:n europa:n veiculo:s casado:s'],
    ['piccolo', 'Piccolo (Dragon Ball)', '🟢', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:p magia:s voa:s engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s ' +
      'cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:p cor-marrom:n grande:p pequeno:n chapeu:s capa:s ' +
      'forte:s antigo:s recente:n estrangeiro-eua:n europa:n espaco:s'],
    ['kuririn', 'Kuririn (Dragon Ball)', '🥋', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:p voa:s engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n careca:s forte:p ' +
      'antigo:s recente:n estrangeiro-eua:n europa:n casado:s'],
    ['mestre-kame', 'Mestre Kame (Dragon Ball)', '🐢', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:p voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n oculos:s careca:s ' +
      'barba:s forte:p antigo:s recente:n estrangeiro-eua:n europa:n'],
    ['freeza', 'Freeza (Dragon Ball)', '👿', 'IFA',
      'real:n pessoa:q bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:s magia:s voa:s engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n rabo:s forte:s ' +
      'monstro:p antigo:s recente:n estrangeiro-eua:n europa:n espaco:s'],
    ['shenlong', 'Shenlong (Dragon Ball)', '🐲', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:? feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:s voa:s engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n dinossauro:s ' +
      'monstro:p antigo:s recente:n estrangeiro-eua:n europa:n'],
    ['naruto', 'Naruto', '🍥', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:p loiro:s ' +
      'rapido:p antigo:q recente:p estrangeiro-eua:n europa:n'],
    ['sasuke', 'Sasuke (Naruto)', '⚡', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:p magia:s voa:n engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n arma:s antigo:q ' +
      'recente:p estrangeiro-eua:n europa:n'],
    ['sakura-naruto', 'Sakura (Naruto)', '🌸', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n forte:s antigo:q ' +
      'recente:p estrangeiro-eua:n europa:n professor:p'],
    ['kakashi', 'Kakashi (Naruto)', '📖', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:p ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n capa:s arma:p ' +
      'antigo:q recente:p estrangeiro-eua:n europa:n professor:s detetive:p'],
    ['luffy', 'Luffy (One Piece)', '👒', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:s livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:n engracado:s realeza:n cor-azul:p cor-vermelho:s cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s forte:s ' +
      'antigo:s recente:n estrangeiro-eua:n europa:n pirata:s'],
    ['zoro', 'Zoro (One Piece)', '⚔️', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:s livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n arma:s forte:s ' +
      'antigo:s recente:n estrangeiro-eua:n europa:n pirata:s'],
    ['seiya', 'Seiya de Pégaso (Cavaleiros do Zodíaco)', '🐴', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n arma:n forte:s ' +
      'antigo:s recente:n estrangeiro-eua:n europa:n'],
    ['shiryu', 'Shiryu de Dragão (Cavaleiros do Zodíaco)', '🐉', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n cabelo-comprido:s ' +
      'forte:s antigo:s recente:n estrangeiro-eua:n europa:n'],
    ['hyoga', 'Hyoga de Cisne (Cavaleiros do Zodíaco)', '🦢', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:n engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n loiro:s forte:s ' +
      'antigo:s recente:n estrangeiro-eua:n europa:?'],
    ['shun', 'Shun de Andrômeda (Cavaleiros do Zodíaco)', '⛓️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n arma:s antigo:s ' +
      'recente:n estrangeiro-eua:n europa:n'],
    ['ikki', 'Ikki de Fênix (Cavaleiros do Zodíaco)', '🔥', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:p magia:s voa:p engracado:p realeza:n cor-azul:? cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:? cor-preto:n cor-branco:n cor-marrom:? grande:n pequeno:n forte:s antigo:s ' +
      'recente:n estrangeiro-eua:n europa:n'],
    ['saori-kido', 'Saori Kido (Atena)', '🏛️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:s voa:n engracado:p realeza:p cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n cabelo-comprido:s ' +
      'vestido:s arma:p rico:s antigo:s recente:n estrangeiro-eua:n europa:n'],
    ['sailor-moon', 'Sailor Moon', '🌙', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:n engracado:p realeza:n cor-azul:s cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n loiro:s ' +
      'cabelo-comprido:s arma:p antigo:s recente:n estrangeiro-eua:n europa:n escola:s'],
    ['sailor-mercurio', 'Sailor Mercúrio (Sailor Moon)', '💧', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:s voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n loiro:n antigo:s ' +
      'recente:n cientista:p estrangeiro-eua:n europa:n escola:s'],
    ['misty', 'Misty (Pokémon)', '💧', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:p videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:p cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ruivo:s antigo:s ' +
      'recente:n estrangeiro-eua:n europa:n t-pokemon:p'],
    ['brock', 'Brock (Pokémon)', '🪨', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:p videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:p ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n antigo:s recente:n ' +
      'estrangeiro-eua:n europa:n t-pokemon:p'],
    ['equipe-rocket', 'Jessie e James (Equipe Rocket)', '🚀', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:p feminino:p crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:p videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:s magia:n voa:p engracado:s realeza:n cor-azul:n cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n cabelo-comprido:s ' +
      'antigo:s recente:n estrangeiro-eua:n europa:n t-pokemon:p'],
    ['totoro', 'Totoro (Meu Amigo Totoro)', '🌳', 'IFA',
      'real:n pessoa:q bicho:n coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n ' +
      'desenho:s filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:p voa:p engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:s pequeno:n pelo:s orelhas:s ' +
      'monstro:s selvagem:s antigo:s recente:n'],
    ['chihiro', 'Chihiro (A Viagem de Chihiro)', '🛁', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:q voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:n'],
    ['kiki', 'Kiki (O Serviço de Entregas da Kiki)', '🧹', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:n livro:p videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:s voa:s engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:p vestido:s ' +
      'arma:p antigo:s recente:n chapeu-magico:s'],
    ['ponyo', 'Ponyo', '🐟', 'IFA',
      'real:n pessoa:p bicho:p coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n agua:s antigo:n ' +
      'recente:q'],
    ['doraemon', 'Doraemon', '🔔', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:p voa:n engracado:p realeza:n cor-azul:s cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n rabo:s gato:p ' +
      'robo:s antigo:s recente:n estrangeiro-eua:n europa:n espaco:q'],
    ['nobita', 'Nobita (Doraemon)', '👓', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n oculos:s antigo:s ' +
      'recente:n estrangeiro-eua:n europa:n escola:s'],
    ['hello-kitty', 'Hello Kitty', '🎀', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:p ' +
      'desenho:p filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n gato:s estimacao:p ' +
      'antigo:s recente:n'],
    ['my-melody', 'My Melody (Sanrio)', '🐰', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:p filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n chapeu:s orelhas:s ' +
      'antigo:p recente:n'],
    ['kuromi', 'Kuromi (Sanrio)', '😈', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:p filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:p magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:p cor-preto:s cor-branco:p cor-marrom:n grande:n pequeno:n chapeu:s antigo:n ' +
      'recente:p'],
    ['agumon', 'Agumon (Digimon)', '🦖', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:p videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n dinossauro:p ' +
      'monstro:s antigo:s recente:n'],
    ['yugi', 'Yugi Muto (Yu-Gi-Oh!)', '🃏', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:p voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:p cor-rosa:p cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n antigo:s recente:n ' +
      'estrangeiro-eua:n europa:n escola:s'],
    ['tyson-beyblade', 'Tyson (Beyblade)', '🌀', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:n serie:p livro:p videogame:n internet:n tv:n disney:n canta:q musica:n esporte:p ' +
      'heroi:s vilao:n magia:n voa:n engracado:p realeza:n cor-azul:p cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s antigo:n ' +
      'recente:n'],
    ['franjinha', 'Franjinha', '🧪', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:s fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:? cor-marrom:n grande:n pequeno:n antigo:s recente:n ' +
      'cientista:s escola:p t-monica:s'],
    ['bidu', 'Bidu', '🐶', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n cachorro:s ' +
      'estimacao:s antigo:s recente:n t-monica:s'],
    ['floquinho', 'Floquinho', '🐕', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:n ' +
      'desenho:s filme:s serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n pelo:s cachorro:s ' +
      'estimacao:s antigo:s recente:n t-monica:s'],
    ['anjinho', 'Anjinho', '👼', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:s fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:p voa:s engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n chapeu:p loiro:s ' +
      'antigo:s recente:n t-monica:s'],
    ['penadinho', 'Penadinho', '👻', 'IFA',
      'real:n pessoa:q bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:p voa:s engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n monstro:p antigo:s ' +
      'recente:n t-monica:s'],
    ['rosinha', 'Rosinha (Turma da Mônica)', '🌹', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:s fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:? cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n cabelo-comprido:? ' +
      'vestido:p antigo:s recente:n casado:p t-monica:s'],
    ['horacio', 'Horácio (Turma da Mônica)', '🦖', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:s fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n dinossauro:s ' +
      'antigo:s recente:n historia:s t-monica:s'],
    ['piteco', 'Piteco (Turma da Mônica)', '🪨', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:? grande:n pequeno:n arma:p selvagem:p ' +
      'antigo:s recente:n historia:s t-monica:s'],
    ['astronauta', 'Astronauta (Turma da Mônica)', '👨‍🚀', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n chapeu:s antigo:s ' +
      'recente:n espaco:s veiculo:s t-monica:s'],
    ['papa-capim', 'Papa-Capim', '🏹', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:s fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:? grande:n pequeno:n arma:p selvagem:s ' +
      'antigo:s recente:n t-monica:s'],
    ['capitao-feio', 'Capitão Feio', '🦠', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s ' +
      'desenho:s filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:s magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:? ' +
      'cor-amarelo:n cor-rosa:n cor-preto:? cor-branco:n cor-marrom:? grande:n pequeno:n antigo:s recente:n ' +
      't-monica:s'],
    ['pintinho-amarelinho', 'Pintinho Amarelinho (Galinha Pintadinha)', '🐥', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:s fala:s ' +
      'desenho:s filme:n serie:p livro:n videogame:n internet:s tv:n disney:n canta:p musica:s esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s passaro:s ' +
      'fazenda:s antigo:n recente:p'],
    ['ursinho-pooh', 'Ursinho Pooh', '🍯', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:s videogame:n internet:n tv:n disney:s canta:q musica:n esporte:n ' +
      'heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n ' +
      'cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n pelo:s urso:s ' +
      'antigo:s recente:n europa:p'],
    ['tigrao', 'Tigrão (Ursinho Pooh)', '🐯', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:s videogame:n internet:n tv:n disney:s canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:s grande:n pequeno:n rabo:s gato:s ' +
      'antigo:s recente:n europa:p'],
    ['leitao', 'Leitão (Ursinho Pooh)', '🐖', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:s videogame:n internet:n tv:n disney:s canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p fazenda:q antigo:s ' +
      'recente:n europa:p'],
    ['bisonho', 'Bisonho (Ursinho Pooh)', '🫏', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:s videogame:n internet:n tv:n disney:s canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:q realeza:n cor-azul:p cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:s orelhas:s ' +
      'antigo:s recente:n europa:p'],
    ['thomas-trem', 'Thomas (Thomas e Seus Amigos)', '🚂', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:s filme:p serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:s vilao:n magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:p cor-verde:n ' +
      'cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n robo:s antigo:s ' +
      'recente:n europa:s veiculo:s'],
    ['barney', 'Barney (o dinossauro)', '🦖', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s ' +
      'desenho:n filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:s musica:p esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:p ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n dinossauro:s ' +
      'antigo:s recente:n estrangeiro-eua:s'],
    ['tinky-winky', 'Tinky Winky (Teletubbies)', '🟣', 'IFA',
      'real:n pessoa:q bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:q ' +
      'desenho:n filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:p monstro:p ' +
      'antigo:s recente:n europa:s'],
    ['laa-laa', 'Laa-Laa (Teletubbies)', '💛', 'IFA',
      'real:n pessoa:q bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:q ' +
      'desenho:n filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n ' +
      'heroi:q vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n ' +
      'cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:p monstro:p ' +
      'antigo:s recente:n europa:s']
  ];
  (raiz.QEPersonagens = raiz.QEPersonagens || {}).animacao = L;
  if (typeof module === 'object' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
