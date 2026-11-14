/* Quem é? — A Meleca Adivinha: mais personagens de CINEMA e SÉRIES com atores (o personagem, não o ator) e de gibi de
   super-herói: Harry Potter, Star Wars, O Senhor dos Anéis e O Hobbit, Marvel e DC (heróis e vilões), Jurassic Park,
   Indiana Jones, Matrix, Piratas do Caribe, Jogos Vorazes, Crepúsculo, Stranger Things, Família Addams, Friends, Chaves,
   A Grande Família, Os Trapalhões, Carrossel, Castelo Rá-Tim-Bum, novela mexicana, terror (só no nível Adulto) e outros
   filmes de família (Gremlins, Caça-Fantasmas, Karatê Kid, Uma Noite no Museu, Mr. Bean, Paddington…).

   FORMATO: o mesmo de personagens/familia.js — [ id, nome, emoji, níveis, respostas ]. Perguntas em adivinha-perguntas.js;
   as do núcleo são obrigatórias. Na dúvida, '?'. */
(function (raiz) {
  'use strict';
  var L = [
    ['gina-weasley', 'Gina Weasley', '🧹', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:p heroi:p vilao:n magia:s voa:p engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:p barba:n careca:n europa:s ' +
      'estrangeiro-eua:n antigo:n recente:n chapeu-magico:s arma:s t-harry:s ruivo:s cabelo-comprido:s escola:s ' +
      'familia-grande:s casado:p'],
    ['neville', 'Neville Longbottom', '🌱', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n europa:s ' +
      'estrangeiro-eua:n antigo:n recente:n chapeu-magico:s arma:s t-harry:s escola:s selvagem:q forte:q cientista:p'],
    ['luna-lovegood', 'Luna Lovegood', '🌙', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:s voa:n engracado:p realeza:n cor-azul:p ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:s barba:n careca:n europa:s ' +
      'estrangeiro-eua:n antigo:n recente:n chapeu-magico:s arma:s t-harry:s escola:s loiro:s cabelo-comprido:s ' +
      'oculos:p ruivo:n'],
    ['sirius-black', 'Sirius Black', '🐕', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:q magia:s voa:p engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n europa:s estrangeiro-eua:n ' +
      'antigo:n recente:n chapeu-magico:s arma:s t-harry:s cachorro:p cabelo-comprido:s barba:p careca:n escola:n ' +
      'veiculo:p'],
    ['mcgonagall', 'Professora Minerva McGonagall', '🐈', 'IFA',
      'real:n bicho:n coisa:n idoso:s brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n europa:s estrangeiro-eua:n ' +
      'antigo:n recente:n chapeu-magico:s arma:s t-harry:s professor:s escola:p chapeu:s vestido:s gato:p oculos:s'],
    ['bellatrix', 'Bellatrix Lestrange', '🖤', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n europa:s estrangeiro-eua:n ' +
      'antigo:n recente:n chapeu-magico:s arma:s t-harry:s cabelo-comprido:s escola:n casado:p chapeu:n loiro:n ' +
      'oculos:n'],
    ['edwiges', 'Edwiges (a coruja do Harry)', '🦉', 'IFA',
      'real:n bicho:s coisa:n idoso:n brasileiro:n fala:n desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:q voa:s engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:q ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n crianca:n vestido:n europa:s estrangeiro-eua:n antigo:n recente:n ' +
      'chapeu-magico:n arma:n t-harry:s masculino:n feminino:s passaro:s estimacao:s escola:p'],
    ['umbridge', 'Dolores Umbridge', '🎀', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:p rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n europa:s estrangeiro-eua:n ' +
      'antigo:n recente:n chapeu-magico:s arma:s t-harry:s professor:s escola:p chapeu:p vestido:s gato:n oculos:n'],
    ['fred-e-jorge', 'Fred e Jorge Weasley', '🎆', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:p heroi:p vilao:n magia:s voa:p engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:p vestido:n barba:n careca:n europa:s ' +
      'estrangeiro-eua:n antigo:n recente:n chapeu-magico:s arma:s t-harry:s ruivo:s familia-grande:s escola:s ' +
      'oculos:n'],
    ['molly-weasley', 'Molly Weasley', '🧶', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:s voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n europa:s estrangeiro-eua:n ' +
      'antigo:n recente:n chapeu-magico:s arma:p t-harry:s familia-grande:s casado:s ruivo:s escola:n oculos:n ' +
      'cabelo-comprido:n'],
    ['newt-scamander', 'Newt Scamander (Animais Fantásticos)', '🧳', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:n realeza:n cor-azul:p ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n europa:s estrangeiro-eua:n ' +
      'antigo:n recente:p chapeu-magico:s arma:s t-harry:p cientista:s selvagem:p barba:n careca:n escola:n ruivo:p'],
    ['bicuco', 'Bicuço (o hipogrifo)', '🦅', 'IFA',
      'real:n bicho:p coisa:n idoso:n brasileiro:n fala:n desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:p voa:s engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:q cor-marrom:p grande:s pequeno:n ' +
      'ator:n politico:n rabo:s pelo:p pessoa:n crianca:n europa:s estrangeiro-eua:n antigo:n recente:n ' +
      'chapeu-magico:n arma:n t-harry:s masculino:s feminino:n monstro:s passaro:p'],
    ['chapeu-seletor', 'Chapéu Seletor', '🎩', 'IFA',
      'real:n bicho:n coisa:s idoso:p brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:s musica:n esporte:n heroi:n vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:s grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n crianca:n europa:s estrangeiro-eua:n antigo:n recente:n ' +
      'chapeu-magico:p arma:n t-harry:s masculino:p feminino:n chapeu:s escola:p'],
    ['obi-wan', 'Obi-Wan Kenobi', '🧔', 'IFA',
      'real:n bicho:n coisa:n idoso:p brasileiro:n fala:s desenho:q filme:s serie:p livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n espaco:s veiculo:s ' +
      'estrangeiro-eua:? europa:n t-star-wars:s arma:s barba:s professor:p capa:p careca:n antigo:s recente:n'],
    ['rey-star-wars', 'Rey (Star Wars)', '🌵', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:p grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n espaco:s veiculo:s ' +
      'estrangeiro-eua:? europa:n t-star-wars:s arma:s cabelo-comprido:p loiro:n antigo:n recente:s'],
    ['kylo-ren', 'Kylo Ren', '🔴', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n espaco:s veiculo:s ' +
      'estrangeiro-eua:? europa:n t-star-wars:s arma:s capa:s cabelo-comprido:p careca:n barba:n antigo:n recente:s ' +
      'familia-grande:p'],
    ['finn-star-wars', 'Finn (Star Wars)', '🪖', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n espaco:s veiculo:s ' +
      'estrangeiro-eua:? europa:n t-star-wars:s arma:s careca:n barba:n antigo:n recente:s'],
    ['bb-8', 'BB-8', '⚪', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:n desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:p grande:n pequeno:q ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n crianca:n espaco:s veiculo:s estrangeiro-eua:? europa:n t-star-wars:s ' +
      'masculino:p feminino:n robo:s rapido:p antigo:n recente:s'],
    ['palpatine', 'Imperador Palpatine', '⚡', 'FA',
      'real:n bicho:n coisa:n idoso:s brasileiro:n fala:s desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n engracado:n realeza:p cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:p rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n espaco:s veiculo:s ' +
      'estrangeiro-eua:? europa:n t-star-wars:s capa:s careca:p barba:n arma:p antigo:s recente:p'],
    ['padme', 'Padmé Amidala', '👑', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:n realeza:s cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:p rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n espaco:s veiculo:s ' +
      'estrangeiro-eua:? europa:n t-star-wars:s casado:s vestido:s cabelo-comprido:s chapeu:p arma:p antigo:? ' +
      'recente:n'],
    ['anakin', 'Anakin Skywalker', '🛸', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:p magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:? vestido:n espaco:s veiculo:s ' +
      'estrangeiro-eua:? europa:n t-star-wars:s arma:s corrida:p casado:s loiro:p cabelo-comprido:p barba:n antigo:? ' +
      'recente:n'],
    ['jabba', 'Jabba, o Hutt', '🐌', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:p desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:s pequeno:n ' +
      'ator:n politico:n rabo:s pelo:n pessoa:n crianca:n espaco:s veiculo:n estrangeiro-eua:? europa:n t-star-wars:s ' +
      'masculino:s feminino:n monstro:s rico:s careca:s antigo:s recente:n'],
    ['boba-fett', 'Boba Fett', '🪖', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:p livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:q vilao:p magia:n voa:p engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n espaco:s veiculo:s ' +
      'estrangeiro-eua:? europa:n t-star-wars:s arma:s capa:s detetive:p antigo:s recente:n'],
    ['stormtrooper', 'Stormtrooper (soldado do Império)', '🤖', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:s cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:p feminino:n crianca:n vestido:n espaco:s veiculo:s ' +
      'estrangeiro-eua:? europa:n t-star-wars:s arma:s capa:s robo:q antigo:s recente:p'],
    ['ewok', 'Ewok (Wicket)', '🧸', 'IFA',
      'real:n bicho:p coisa:n idoso:n brasileiro:n fala:p desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:s pessoa:n crianca:n espaco:s veiculo:n estrangeiro-eua:? europa:n t-star-wars:s ' +
      'masculino:s feminino:n monstro:s urso:p selvagem:s arma:p chapeu:s antigo:s recente:n'],
    ['darth-maul', 'Darth Maul', '😈', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n espaco:s veiculo:s ' +
      'estrangeiro-eua:? europa:n t-star-wars:s arma:s monstro:p careca:p capa:p antigo:? recente:n'],
    ['jar-jar', 'Jar Jar Binks', '🐸', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n crianca:n espaco:s veiculo:s estrangeiro-eua:? europa:n t-star-wars:s ' +
      'masculino:s feminino:n orelhas:s monstro:p agua:p antigo:? recente:n'],
    ['ahsoka', 'Ahsoka Tano', '🗡️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:s filme:s serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:p grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n espaco:s veiculo:s ' +
      'estrangeiro-eua:? europa:n t-star-wars:s arma:s monstro:q careca:n antigo:n recente:p'],
    ['millennium-falcon', 'Millennium Falcon (a nave do Han Solo)', '🚀', 'FA',
      'real:n bicho:n coisa:s idoso:n brasileiro:n fala:n desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:s engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:s pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n crianca:n espaco:s veiculo:s estrangeiro-eua:? europa:n t-star-wars:s ' +
      'masculino:n feminino:n rapido:s antigo:s recente:n'],
    ['frodo', 'Frodo Bolseiro', '💍', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:q voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n europa:? estrangeiro-eua:n ' +
      'recente:n selvagem:p historia:q arma:p pirata:p careca:n barba:n antigo:p'],
    ['sam-gamgi', 'Sam Gamgi', '🥔', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n europa:? estrangeiro-eua:n ' +
      'recente:n selvagem:p historia:q pirata:p casado:p loiro:p arma:p careca:n barba:n antigo:p'],
    ['gandalf', 'Gandalf', '🧙', 'IFA',
      'real:n bicho:n coisa:n idoso:s brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n europa:? estrangeiro-eua:n ' +
      'recente:n selvagem:p historia:q barba:s chapeu:s chapeu-magico:s arma:s cabelo-comprido:s careca:n antigo:p'],
    ['gollum', 'Gollum (Sméagol)', '💍', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:q cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:q crianca:n europa:? estrangeiro-eua:n recente:n selvagem:p historia:q ' +
      'masculino:s feminino:n monstro:s careca:p orelhas:s agua:p antigo:p'],
    ['aragorn', 'Aragorn', '👑', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:s cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n europa:? estrangeiro-eua:n ' +
      'recente:n selvagem:p historia:q arma:s barba:s cabelo-comprido:s casado:p pirata:p careca:n antigo:p'],
    ['legolas', 'Legolas', '🏹', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:p cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n europa:? estrangeiro-eua:n ' +
      'recente:n selvagem:p historia:q loiro:s cabelo-comprido:s arma:s rapido:s orelhas:q barba:n careca:n antigo:p'],
    ['gimli', 'Gimli', '🪓', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n europa:? estrangeiro-eua:n ' +
      'recente:n selvagem:p historia:q barba:s arma:s forte:p chapeu:s ruivo:p careca:n antigo:p'],
    ['bilbo', 'Bilbo Bolseiro', '📖', 'FA',
      'real:n bicho:n coisa:n idoso:p brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:q voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n europa:? estrangeiro-eua:n ' +
      'recente:p selvagem:p historia:q pirata:s pintor:p arma:p careca:n barba:n antigo:p'],
    ['sauron', 'Sauron', '👁️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:q desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n engracado:n realeza:p cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:p grande:s pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:q crianca:n europa:? estrangeiro-eua:n recente:n selvagem:p historia:q ' +
      'masculino:s feminino:n monstro:p antigo:p'],
    ['saruman', 'Saruman', '🧙‍♂️', 'FA',
      'real:n bicho:n coisa:n idoso:s brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n europa:? estrangeiro-eua:n ' +
      'recente:n selvagem:p historia:q barba:s cabelo-comprido:s chapeu-magico:s arma:s careca:n antigo:p'],
    ['galadriel', 'Galadriel', '✨', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:p livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:s voa:n engracado:n realeza:s cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n europa:? estrangeiro-eua:n ' +
      'recente:n selvagem:p historia:q loiro:s cabelo-comprido:s vestido:s antigo:p'],
    ['smaug', 'Smaug (O Hobbit)', '🐉', 'FA',
      'real:n bicho:p coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:s engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:s pequeno:n ' +
      'ator:n politico:n rabo:s pelo:n pessoa:n crianca:n europa:? estrangeiro-eua:n recente:s selvagem:p historia:q ' +
      'masculino:s feminino:n dinossauro:s monstro:s rico:s antigo:q'],
    ['merry-e-pippin', 'Merry e Pippin', '🍄', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n europa:? estrangeiro-eua:n ' +
      'recente:n selvagem:p historia:q pirata:p comida:q barba:n careca:n antigo:p'],
    ['gaviao-arqueiro', 'Gavião Arqueiro', '🏹', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:p livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s arma:s casado:s familia-grande:p careca:n barba:n antigo:n recente:s'],
    ['capita-marvel', 'Capitã Marvel', '✴️', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:s engracado:n realeza:n cor-azul:s ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      't-marvel:s forte:s espaco:s loiro:s cabelo-comprido:p antigo:n recente:s'],
    ['deadpool', 'Deadpool', '🗡️', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:q canta:n musica:n esporte:n heroi:p vilao:n magia:p voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s capa:s arma:s careca:p antigo:n recente:s'],
    ['wolverine', 'Wolverine', '🐺', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:n realeza:n cor-azul:p ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s forte:s arma:p barba:s careca:n antigo:s recente:p'],
    ['professor-xavier', 'Professor Xavier', '🧠', 'FA',
      'real:n bicho:n coisa:n idoso:p brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s careca:s professor:s escola:p veiculo:s barba:n antigo:s recente:n'],
    ['magneto', 'Magneto', '🧲', 'FA',
      'real:n bicho:n coisa:n idoso:p brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:s engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s chapeu:s capa:s careca:n barba:n antigo:s recente:n'],
    ['tempestade', 'Tempestade', '⛈️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:s engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:p cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      't-marvel:s cabelo-comprido:s loiro:n antigo:s recente:n'],
    ['ciclope', 'Ciclope', '🕶️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:n realeza:n cor-azul:p ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s oculos:s casado:p careca:n barba:n antigo:s recente:n'],
    ['jean-grey', 'Jean Grey (Fênix)', '🔥', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:p magia:s voa:p engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      't-marvel:s ruivo:s cabelo-comprido:s casado:p antigo:s recente:n'],
    ['mistica', 'Mística', '💙', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:q vilao:p magia:s voa:n engracado:n realeza:n cor-azul:s ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      't-marvel:s ruivo:s detetive:p antigo:s recente:n'],
    ['fera-xmen', 'Fera (X-Men)', '🦍', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:s ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:s pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s forte:s cientista:s monstro:p oculos:p antigo:s recente:n'],
    ['visao', 'Visão', '💎', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:s livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:s engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:s cor-verde:p cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:q masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s robo:s capa:p casado:s careca:s antigo:n recente:s'],
    ['falcao-marvel', 'Falcão (Sam Wilson)', '🦅', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:s livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:s engracado:n realeza:n cor-azul:p ' +
      'cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s arma:s passaro:q careca:p barba:n antigo:n recente:s'],
    ['soldado-invernal', 'Soldado Invernal (Bucky)', '🦾', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:s livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:p magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s arma:s robo:p forte:s cabelo-comprido:s careca:n antigo:n recente:s'],
    ['star-lord', 'Senhor das Estrelas (Star-Lord)', '🎧', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:p esporte:n heroi:s vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s espaco:s veiculo:s arma:s dancar:p capa:p careca:n antigo:n recente:s'],
    ['gamora', 'Gamora', '💚', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      't-marvel:s arma:s espaco:s forte:p cabelo-comprido:s antigo:n recente:s'],
    ['drax', 'Drax', '💪', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:p cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:p pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s forte:s careca:s espaco:s arma:s barba:n antigo:n recente:s'],
    ['ultron', 'Ultron', '🤖', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:s engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:p pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n crianca:n estrangeiro-eua:s europa:n t-marvel:s masculino:p ' +
      'feminino:n robo:s forte:s antigo:n recente:s'],
    ['nick-fury', 'Nick Fury', '🏴‍☠️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s detetive:s careca:s arma:s capa:q barba:p antigo:n recente:s'],
    ['venom', 'Venom', '🖤', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:p magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:p cor-marrom:n grande:p pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n crianca:n estrangeiro-eua:s europa:n t-marvel:s masculino:s ' +
      'feminino:n monstro:s forte:s espaco:s antigo:n recente:p'],
    ['duende-verde', 'Duende Verde', '🎃', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:s engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s veiculo:s capa:s rico:s cientista:p antigo:s recente:n'],
    ['doutor-octopus', 'Doutor Octopus', '🐙', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s cientista:s oculos:s robo:p forte:p agua:n antigo:p recente:n'],
    ['mary-jane', 'Mary Jane', '🌹', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:q vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:p politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      't-marvel:s ruivo:s cabelo-comprido:s casado:p antigo:p recente:n'],
    ['shuri', 'Shuri', '💜', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:s cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:q barba:n estrangeiro-eua:s europa:n ' +
      't-marvel:s cientista:s antigo:n recente:s'],
    ['shang-chi', 'Shang-Chi', '🐉', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:p heroi:s vilao:n magia:p voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s forte:s rapido:s careca:n barba:n antigo:n recente:s'],
    ['demolidor', 'Demolidor', '😈', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:s livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-marvel:s capa:s detetive:p oculos:p forte:p careca:n antigo:p recente:p'],
    ['arlequina', 'Arlequina', '🃏', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:p magia:n voa:n engracado:s realeza:n cor-azul:p ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      't-dc:s loiro:s arma:s antigo:n recente:s'],
    ['lanterna-verde', 'Lanterna Verde', '💚', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:s engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-dc:s capa:s espaco:s antigo:s recente:n'],
    ['lex-luthor', 'Lex Luthor', '🧑‍💼', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:p rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-dc:s careca:s rico:s cientista:s antigo:s recente:n'],
    ['robin-dc', 'Robin (parceiro do Batman)', '🐦', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:s cor-verde:s cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:p vestido:n barba:n careca:n ' +
      'estrangeiro-eua:s europa:n t-dc:s capa:s arma:p antigo:s recente:n'],
    ['batgirl', 'Batgirl', '🦇', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      't-dc:s capa:s ruivo:s orelhas:p detetive:p antigo:s recente:n'],
    ['mulher-gato', 'Mulher-Gato', '🐈‍⬛', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:p magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      't-dc:s capa:s gato:p orelhas:p arma:p rapido:p antigo:s recente:n'],
    ['pinguim-batman', 'Pinguim (vilão do Batman)', '🐧', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-dc:s chapeu:s rico:s oculos:p passaro:q arma:p careca:p antigo:s recente:n'],
    ['charada', 'Charada', '❓', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-dc:s chapeu:s detetive:p capa:p cientista:p antigo:s recente:n'],
    ['hera-venenosa', 'Hera Venenosa', '🌿', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      't-dc:s ruivo:s cabelo-comprido:s cientista:p selvagem:p antigo:s recente:n'],
    ['bane', 'Bane', '💪', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:p pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-dc:s forte:s capa:s careca:s antigo:p recente:n'],
    ['alfred', 'Alfred (o mordomo do Batman)', '🎩', 'FA',
      'real:n bicho:n coisa:n idoso:s brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:n europa:s ' +
      't-dc:s barba:p careca:p rico:p antigo:s recente:n'],
    ['comissario-gordon', 'Comissário Gordon', '👮', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-dc:s professor:s detetive:s oculos:s barba:s arma:p antigo:s recente:n'],
    ['supergirl', 'Supergirl', '🦸‍♀️', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:s livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:s engracado:n realeza:n cor-azul:s ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      't-dc:s forte:s capa:s loiro:s espaco:s rapido:s antigo:n recente:p'],
    ['shazam', 'Shazam', '⚡', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:s engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:p vestido:n estrangeiro-eua:s europa:n ' +
      't-dc:s forte:s capa:s antigo:n recente:s'],
    ['lois-lane', 'Lois Lane', '📰', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:p livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      't-dc:s casado:s detetive:p pintor:p cabelo-comprido:p antigo:s recente:n'],
    ['john-hammond', 'John Hammond (Jurassic Park)', '🦖', 'FA',
      'real:n bicho:n coisa:n idoso:s brasileiro:n fala:s desenho:n filme:s serie:n livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-jurassic:s barba:s rico:s cientista:p chapeu:s careca:n antigo:s recente:n'],
    ['ellie-sattler', 'Dra. Ellie Sattler', '🌿', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      't-jurassic:s cientista:s loiro:s selvagem:p antigo:s recente:n'],
    ['owen-grady', 'Owen Grady (Jurassic World)', '🏍️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      't-jurassic:s veiculo:s selvagem:p arma:p careca:n barba:n antigo:n recente:s'],
    ['indominus-rex', 'Indominus Rex', '🦖', 'FA',
      'real:n bicho:s coisa:n idoso:n brasileiro:n fala:n desenho:n filme:s serie:n livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:s pequeno:n ' +
      'ator:n politico:n rabo:s pelo:n pessoa:n crianca:n vestido:n estrangeiro-eua:s europa:n t-jurassic:s ' +
      'masculino:n feminino:p dinossauro:s monstro:p forte:s antigo:n recente:s'],
    ['marion-ravenwood', 'Marion Ravenwood (Indiana Jones)', '🍸', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n pirata:s casado:p ' +
      'estrangeiro-eua:s europa:n antigo:s recente:n'],
    ['short-round', 'Short Round (Indiana Jones)', '🧢', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n pirata:s ' +
      'chapeu:s veiculo:p estrangeiro-eua:n europa:n antigo:s recente:n'],
    ['neo', 'Neo (Matrix)', '🕶️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:s engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:? europa:n ' +
      'antigo:s recente:n arma:s t-acao:p oculos:s rapido:p careca:n barba:n'],
    ['trinity', 'Trinity (Matrix)', '🕶️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:? europa:n ' +
      'antigo:s recente:n arma:s t-acao:p oculos:s veiculo:s casado:p'],
    ['morpheus', 'Morpheus (Matrix)', '💊', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:? europa:n ' +
      'antigo:s recente:n arma:s t-acao:p careca:s oculos:s professor:p barba:n'],
    ['agente-smith', 'Agente Smith (Matrix)', '🕴️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:? europa:n ' +
      'antigo:s recente:n arma:s t-acao:p oculos:s robo:p detetive:p careca:n barba:n'],
    ['barbossa', 'Capitão Barbossa', '🐒', 'FA',
      'real:n bicho:n coisa:n idoso:p brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:s canta:n musica:n esporte:n heroi:q vilao:p magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n pirata:s arma:s agua:p ' +
      'europa:p estrangeiro-eua:n antigo:n recente:n barba:s chapeu:s monstro:p cabelo-comprido:p veiculo:s'],
    ['will-turner', 'Will Turner', '⚔️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n pirata:s arma:s agua:p ' +
      'europa:p estrangeiro-eua:n antigo:n recente:n casado:s cabelo-comprido:p veiculo:s barba:p'],
    ['elizabeth-swann', 'Elizabeth Swann', '👒', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:p cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n pirata:s arma:s agua:p ' +
      'europa:p estrangeiro-eua:n antigo:n recente:n casado:s vestido:p rico:s loiro:p cabelo-comprido:s'],
    ['davy-jones', 'Davy Jones (Piratas do Caribe)', '🐙', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:s canta:n musica:p esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n crianca:n pirata:s arma:s agua:s europa:p estrangeiro-eua:n antigo:n ' +
      'recente:n masculino:s feminino:n monstro:s barba:p chapeu:s veiculo:s'],
    ['katniss', 'Katniss Everdeen', '🏹', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      'antigo:n recente:s arma:s cabelo-comprido:s selvagem:p passaro:q loiro:n'],
    ['peeta', 'Peeta Mellark', '🍞', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      'antigo:n recente:s loiro:s casado:p pintor:p forte:p barba:n careca:n'],
    ['effie-trinket', 'Effie Trinket', '🎀', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      'antigo:n recente:s chapeu:p vestido:s rico:p'],
    ['presidente-snow', 'Presidente Snow (Jogos Vorazes)', '🌹', 'FA',
      'real:n bicho:n coisa:n idoso:s brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:s rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      'antigo:n recente:s barba:s rico:s careca:n'],
    ['bella-swan', 'Bella Swan (Crepúsculo)', '🍎', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:p voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      'antigo:n recente:p casado:s escola:s cabelo-comprido:s'],
    ['edward-cullen', 'Edward Cullen (Crepúsculo)', '🧛', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      'antigo:n recente:p monstro:p rapido:s forte:s casado:s rico:s escola:s barba:n careca:n'],
    ['jacob-black', 'Jacob Black (Crepúsculo)', '🐺', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      'antigo:n recente:p monstro:p forte:s cachorro:p cabelo-comprido:p selvagem:p barba:n careca:n'],
    ['mike-wheeler', 'Mike Wheeler (Stranger Things)', '🚲', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n ' +
      'estrangeiro-eua:s europa:n antigo:n recente:s escola:s veiculo:s casado:p'],
    ['will-byers', 'Will Byers (Stranger Things)', '🎲', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:p voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n ' +
      'estrangeiro-eua:s europa:n antigo:n recente:s escola:s pintor:p'],
    ['lucas-sinclair', 'Lucas Sinclair (Stranger Things)', '🏹', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:p heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n ' +
      'estrangeiro-eua:s europa:n antigo:n recente:s escola:s veiculo:s arma:p casado:p'],
    ['max-mayfield', 'Max (Stranger Things)', '🛹', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:p esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:s barba:n careca:n estrangeiro-eua:s ' +
      'europa:n antigo:n recente:s ruivo:s cabelo-comprido:s escola:s veiculo:p rapido:p'],
    ['steve-harrington', 'Steve Harrington (Stranger Things)', '🏏', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      'antigo:n recente:s escola:p arma:p veiculo:s'],
    ['hopper', 'Delegado Hopper (Stranger Things)', '🚓', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      'antigo:n recente:s professor:s barba:s chapeu:s forte:p arma:s veiculo:s'],
    ['vecna', 'Vecna (Stranger Things)', '🕰️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n crianca:n estrangeiro-eua:s europa:n antigo:n recente:s masculino:s ' +
      'feminino:n monstro:s careca:s'],
    ['morticia', 'Mortícia Addams', '🕸️', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:s livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:p voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      'vestido:s cabelo-comprido:s casado:s familia-grande:s rico:s antigo:s recente:n'],
    ['gomez-addams', 'Gomez Addams', '🗡️', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:s livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      'casado:s familia-grande:s rico:s barba:s arma:p careca:n antigo:s recente:n'],
    ['tio-chico', 'Tio Chico (Família Addams)', '💡', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:s livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:p voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      'careca:s familia-grande:s antigo:s recente:n'],
    ['tropeco', 'Tropeço (o mordomo dos Addams)', '🧟', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:p desenho:p filme:s serie:s livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:p esporte:n heroi:n vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:s pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      'monstro:p forte:p antigo:s recente:n'],
    ['feioso', 'Feioso (Família Addams)', '💣', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:s livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n ' +
      'estrangeiro-eua:s europa:n familia-grande:s escola:p antigo:s recente:n'],
    ['enid-sinclair', 'Enid (Wandinha)', '🌈', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:s voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:p barba:n careca:n estrangeiro-eua:s ' +
      'europa:n loiro:s escola:s monstro:p antigo:n recente:s'],
    ['rachel-green', 'Rachel (Friends)', '☕', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      'antigo:s recente:n loiro:p cabelo-comprido:s casado:p'],
    ['ross-geller', 'Ross (Friends)', '🦕', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      'antigo:s recente:n cientista:s professor:p casado:p dinossauro:q'],
    ['monica-geller', 'Monica (Friends)', '🍳', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      'antigo:s recente:n casado:s comida:q'],
    ['chandler-bing', 'Chandler (Friends)', '😏', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      'antigo:s recente:n casado:s rico:p'],
    ['joey-tribbiani', 'Joey (Friends)', '🍕', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:s politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:s europa:n ' +
      'antigo:s recente:n comida:q'],
    ['phoebe-buffay', 'Phoebe (Friends)', '🎸', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:s musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:s europa:n ' +
      'antigo:s recente:n loiro:s cabelo-comprido:s casado:p'],
    ['popis', 'Pópis', '🪆', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:s barba:n careca:n estrangeiro-eua:n ' +
      'europa:n antigo:s recente:n t-chaves:s escola:s chapeu:s'],
    ['jaiminho', 'Seu Jaiminho, o carteiro', '✉️', 'IFA',
      'real:n bicho:n coisa:n idoso:p brasileiro:n fala:s desenho:p filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:? ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:n europa:n ' +
      'antigo:s recente:n t-chaves:s chapeu:s veiculo:s barba:n careca:n'],
    ['lineu', 'Lineu (A Grande Família)', '👓', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:n europa:n ' +
      'antigo:n recente:n t-novela:n oculos:s barba:s casado:s familia-grande:s professor:q careca:n'],
    ['nene', 'Dona Nenê (A Grande Família)', '🍲', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:n europa:n ' +
      'antigo:n recente:n t-novela:n casado:s familia-grande:s'],
    ['agostinho', 'Agostinho Carrara', '🚕', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:n europa:n ' +
      'antigo:n recente:n t-novela:n casado:s veiculo:s barba:s careca:n'],
    ['bebel', 'Bebel (A Grande Família)', '💄', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:n europa:n ' +
      'antigo:n recente:n t-novela:n casado:s familia-grande:s cabelo-comprido:s'],
    ['dede', 'Dedé (Os Trapalhões)', '🎩', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:s serie:s livro:n videogame:n internet:n ' +
      'tv:p disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:n europa:n ' +
      'antigo:s recente:n careca:n barba:n'],
    ['zacarias', 'Zacarias (Os Trapalhões)', '🤓', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:s serie:s livro:n videogame:n internet:n ' +
      'tv:p disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:n europa:n ' +
      'antigo:s recente:n careca:? barba:n oculos:q'],
    ['cirilo', 'Cirilo (Carrossel)', '💌', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:p filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n escola:s ' +
      'estrangeiro-eua:n europa:n antigo:n recente:s casado:p'],
    ['maria-joaquina', 'Maria Joaquina (Carrossel)', '👑', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:p filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:s barba:n careca:n escola:s ' +
      'estrangeiro-eua:n europa:n antigo:n recente:s rico:s loiro:s cabelo-comprido:s'],
    ['professora-helena', 'Professora Helena (Carrossel)', '🍎', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:p filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n escola:s estrangeiro-eua:n ' +
      'europa:n antigo:n recente:s professor:s'],
    ['celeste', 'Celeste, a cobra (Castelo Rá-Tim-Bum)', '🐍', 'IFA',
      'real:n bicho:s coisa:n idoso:n brasileiro:s fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:s musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:n realeza:n cor-azul:? ' +
      'cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n crianca:n vestido:n estrangeiro-eua:n europa:n antigo:s recente:n ' +
      'masculino:n feminino:s'],
    ['zequinha', 'Zequinha (Castelo Rá-Tim-Bum)', '❓', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n ' +
      'estrangeiro-eua:n europa:n antigo:s recente:n'],
    ['biba', 'Biba (Castelo Rá-Tim-Bum)', '👧', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:s barba:n careca:n estrangeiro-eua:n ' +
      'europa:n antigo:s recente:n'],
    ['pedro-castelo', 'Pedro (Castelo Rá-Tim-Bum)', '👦', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n ' +
      'estrangeiro-eua:n europa:n antigo:s recente:n'],
    ['etevaldo', 'Etevaldo (Castelo Rá-Tim-Bum)', '👽', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:p realeza:n cor-azul:? ' +
      'cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n crianca:n estrangeiro-eua:n europa:n antigo:s recente:n masculino:s ' +
      'feminino:n espaco:s monstro:p'],
    ['caipora-castelo', 'Caipora (Castelo Rá-Tim-Bum)', '🌳', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:s voa:n engracado:n realeza:n cor-azul:? ' +
      'cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:n europa:n ' +
      'antigo:s recente:n folclore:s selvagem:s'],
    ['gato-pintado', 'Gato Pintado (Castelo Rá-Tim-Bum)', '🐱', 'IFA',
      'real:n bicho:s coisa:n idoso:n brasileiro:s fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:n realeza:n cor-azul:? ' +
      'cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n ' +
      'ator:n politico:n rabo:s pelo:s pessoa:n crianca:n vestido:n estrangeiro-eua:n europa:n antigo:s recente:n ' +
      'masculino:s feminino:n gato:s'],
    ['soraya-montenegro', 'Soraya Montenegro (Maria do Bairro)', '😡', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:s ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n estrangeiro-eua:n europa:n ' +
      'antigo:s recente:n t-novela:n rico:s loiro:n'],
    ['freddy-krueger', 'Freddy Krueger', '🔪', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:s cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:p europa:n ' +
      'chapeu:s arma:p monstro:p antigo:s recente:n'],
    ['jason-voorhees', 'Jason (Sexta-Feira 13)', '🏒', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:n desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:p pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:p europa:n ' +
      'capa:s arma:s forte:s monstro:p antigo:s recente:n'],
    ['chucky', 'Chucky (Brinquedo Assassino)', '🪀', 'A',
      'real:n bicho:n coisa:p idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:p voa:n engracado:n realeza:n cor-azul:s ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:q ' +
      'ator:n politico:n rabo:n pelo:n pessoa:q crianca:p estrangeiro-eua:p europa:n masculino:s feminino:n ruivo:s ' +
      'arma:s antigo:s recente:n'],
    ['pennywise', 'Pennywise (It: A Coisa)', '🎈', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n engracado:q realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:q crianca:n estrangeiro-eua:p europa:n masculino:s feminino:n monstro:s ' +
      'ruivo:s antigo:p recente:p'],
    ['annabelle', 'Annabelle (a boneca)', '🎎', 'A',
      'real:n bicho:n coisa:s idoso:n brasileiro:n fala:n desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n crianca:n estrangeiro-eua:p europa:n masculino:n feminino:s vestido:s ' +
      'cabelo-comprido:s antigo:n recente:s'],
    ['ghostface', 'Ghostface (Pânico)', '👻', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:s cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n estrangeiro-eua:p europa:n ' +
      'capa:s arma:s detetive:q antigo:s recente:n'],
    ['samara', 'Samara (O Chamado)', '📼', 'A',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:q desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:s barba:n careca:n estrangeiro-eua:p ' +
      'europa:n cabelo-comprido:s vestido:s agua:p antigo:n recente:n'],
    ['mrs-doubtfire', 'Uma Babá Quase Perfeita (Mrs. Doubtfire)', '👵', 'FA',
      'real:n bicho:n coisa:n idoso:p brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:s politico:n rabo:n pelo:n pessoa:s crianca:n masculino:p feminino:p vestido:s oculos:s familia-grande:s ' +
      'casado:p estrangeiro-eua:s europa:q antigo:s recente:n'],
    ['daniel-larusso', 'Daniel San (Karatê Kid)', '🥋', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:p livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:s heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:p vestido:n barba:n careca:n forte:p ' +
      'chapeu:p escola:s estrangeiro-eua:s europa:n antigo:s recente:n'],
    ['sr-miyagi', 'Sr. Miyagi (Karatê Kid)', '🥢', 'FA',
      'real:n bicho:n coisa:n idoso:s brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:p heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n professor:s barba:p ' +
      'estrangeiro-eua:p europa:n antigo:s recente:n'],
    ['egon-spengler', 'Egon Spengler (Os Caça-Fantasmas)', '👓', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n cientista:s oculos:s ' +
      'arma:s veiculo:s detetive:p estrangeiro-eua:s europa:n antigo:s recente:n'],
    ['ray-stantz', 'Ray Stantz (Os Caça-Fantasmas)', '👻', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n cientista:s arma:s ' +
      'veiculo:s detetive:p oculos:n estrangeiro-eua:s europa:n antigo:s recente:n'],
    ['gizmo', 'Gizmo (Gremlins)', '🧸', 'IFA',
      'real:n bicho:p coisa:n idoso:n brasileiro:n fala:p desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:s musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:s grande:n pequeno:p ' +
      'ator:n politico:n rabo:n pelo:s pessoa:n crianca:n masculino:s feminino:n monstro:s orelhas:s estimacao:s ' +
      'festa:s estrangeiro-eua:s antigo:s recente:n'],
    ['stripe-gremlin', 'Gremlin (Gremlins)', '😈', 'FA',
      'real:n bicho:p coisa:n idoso:n brasileiro:n fala:p desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n crianca:n masculino:s feminino:n monstro:s orelhas:s festa:p agua:q ' +
      'estrangeiro-eua:s antigo:s recente:n'],
    ['larry-daley', 'Larry (Uma Noite no Museu)', '🔦', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n historia:p professor:q ' +
      'estrangeiro-eua:s europa:n antigo:n recente:n careca:n barba:n'],
    ['rexy-museu', 'Rexy, o esqueleto de T-Rex (Uma Noite no Museu)', '🦴', 'IFA',
      'real:n bicho:p coisa:n idoso:n brasileiro:n fala:n desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:p voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:p grande:s pequeno:n ' +
      'ator:n politico:n rabo:s pelo:n pessoa:n crianca:n masculino:? feminino:? dinossauro:s estimacao:p ' +
      'estrangeiro-eua:s antigo:n recente:n'],
    ['charlie-bucket', 'Charlie (A Fantástica Fábrica de Chocolate)', '🍫', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n ' +
      'familia-grande:s rico:p comida:n europa:? estrangeiro-eua:? antigo:p recente:n'],
    ['bert', 'Bert (Mary Poppins)', '🎨', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:p videogame:n internet:n ' +
      'tv:n disney:s canta:s musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n dancar:s chapeu:s pintor:s ' +
      'europa:s estrangeiro-eua:n antigo:s recente:n'],
    ['harry-e-marv', 'Harry e Marv (os ladrões de Esqueceram de Mim)', '🪤', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n chapeu:s festa:s ' +
      'estrangeiro-eua:s europa:n antigo:s recente:n'],
    ['bravestone', 'Dr. Bravestone (Jumanji)', '💪', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:p internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n forte:s careca:s ' +
      'selvagem:s pirata:s estrangeiro-eua:s europa:n antigo:n recente:s'],
    ['mascara', 'O Máskara', '🟢', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:s voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n chapeu:s capa:s dancar:p ' +
      'estrangeiro-eua:s europa:n antigo:s recente:n'],
    ['mr-bean', 'Mr. Bean', '🧸', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:q desenho:p filme:s serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n veiculo:s europa:s ' +
      'estrangeiro-eua:n antigo:s recente:n careca:n barba:n'],
    ['paddington', 'Paddington', '🧸', 'IFA',
      'real:n bicho:s coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:s ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:s pessoa:n crianca:n vestido:n masculino:s feminino:n urso:s chapeu:s comida:n ' +
      'europa:s estrangeiro-eua:n antigo:p recente:p'],
    ['beethoven-cao', 'Beethoven (o cachorrão do filme)', '🐕', 'IFA',
      'real:n bicho:s coisa:n idoso:n brasileiro:n fala:n desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:p grande:s pequeno:n ' +
      'ator:n politico:n rabo:s pelo:s pessoa:n crianca:n vestido:n masculino:s feminino:n cachorro:s estimacao:s ' +
      'orelhas:p estrangeiro-eua:s antigo:s recente:n'],
    ['aslam', 'Aslam (As Crônicas de Nárnia)', '🦁', 'IFA',
      'real:n bicho:s coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:n realeza:s cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:s pequeno:n ' +
      'ator:n politico:n rabo:s pelo:s pessoa:n crianca:n vestido:n masculino:s feminino:n gato:s selvagem:p europa:? ' +
      'antigo:n recente:n']
  ];
  (raiz.QEPersonagens = raiz.QEPersonagens || {}).cinema = L;
  if (typeof module === 'object' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
