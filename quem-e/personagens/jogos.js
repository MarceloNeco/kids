/* Quem é? — A Meleca Adivinha: personagens de VIDEOGAME e da INTERNET que as crianças (4 a 10 anos) e os pais
   lembram: Minecraft, Roblox, Among Us, Zelda, Angry Birds, Talking Tom, Pokémon, a turma do Mario e do Sonic,
   Plantas vs. Zumbis… e uns poucos criadores de conteúdo adultos. Formato igual ao de personagens/familia.js.
   Os mais assustadores ou de adolescente (Freddy Fazbear, Huggy Wuggy, Lara Croft) e os youtubers de público mais
   velho só entram nos níveis Família e Adulto ('FA'). */
(function (raiz) {
  'use strict';
  var L = [
    ['steve', 'Steve (Minecraft)', '⛏️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:p desenho:q ' +
      'filme:s serie:n livro:q videogame:s internet:? tv:n disney:n canta:p musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:n oculos:n loiro:n ruivo:n careca:n barba:? ' +
      'cabelo-comprido:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:s rapido:n forte:p rico:n monstro:n robo:n ' +
      'selvagem:p cientista:p pirata:p escola:n espaco:n veiculo:q antigo:n ator:n chapeu-magico:n folclore:n ' +
      't-mario:n t-pokemon:n'],
    ['creeper', 'Creeper', '💥', 'IFA',
      'real:n pessoa:n bicho:n coisa:n masculino:? feminino:q crianca:n idoso:n brasileiro:n fala:n desenho:q ' +
      'filme:s serie:n livro:q videogame:s internet:? tv:n disney:n canta:n musica:q esporte:n heroi:n vilao:s ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n monstro:s robo:n rabo:n pelo:n orelhas:n chapeu:n ' +
      'oculos:n capa:n arma:n rapido:n forte:q selvagem:p estimacao:n comida:n antigo:n t-mario:n'],
    ['enderman', 'Enderman', '⬛', 'IFA',
      'real:n pessoa:n bicho:n coisa:n masculino:p feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:q ' +
      'filme:? serie:n livro:q videogame:s internet:? tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p ' +
      'magia:p voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:s pequeno:n monstro:s robo:n rabo:n pelo:n orelhas:n chapeu:n ' +
      'capa:n arma:n rapido:p forte:p espaco:? antigo:n t-mario:n'],
    ['alex-minecraft', 'Alex (Minecraft)', '🪓', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:q desenho:q ' +
      'filme:n serie:n livro:q videogame:s internet:? tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:q realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n ruivo:s cabelo-comprido:s loiro:n careca:n chapeu:n ' +
      'oculos:n vestido:n arma:s rabo:n pelo:n monstro:n robo:n pirata:p selvagem:p antigo:n recente:s t-mario:n'],
    ['aldeao-minecraft', 'Aldeão do Minecraft', '🧑‍🌾', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:p feminino:n crianca:n idoso:n brasileiro:n fala:q desenho:q ' +
      'filme:p serie:n livro:n videogame:s internet:? tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:q cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n barba:n chapeu:n oculos:n arma:n rabo:n pelo:n ' +
      'monstro:n robo:n rapido:n antigo:n t-mario:n'],
    ['noob-roblox', 'Noob do Roblox', '🟨', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:p feminino:n crianca:? idoso:n brasileiro:n fala:q desenho:n ' +
      'filme:n serie:n livro:n videogame:s internet:p tv:n disney:n canta:n musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:s cor-vermelho:n cor-verde:s cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n careca:p chapeu:n oculos:n barba:n ' +
      'cabelo-comprido:n rabo:n pelo:n arma:n monstro:n robo:n antigo:n t-mario:n'],
    ['tripulante-among-us', 'Tripulante do Among Us', '🧑‍🚀', 'IFA',
      'real:n pessoa:q bicho:n coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:q ' +
      'filme:n serie:n livro:n videogame:s internet:s tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:? ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:s cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:? espaco:s detetive:s capa:n rabo:n pelo:n monstro:q ' +
      'robo:n veiculo:p recente:s antigo:n t-mario:n'],
    ['link', 'Link (Zelda)', '🗡️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:q idoso:n brasileiro:n fala:n desenho:? ' +
      'filme:q serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:q esporte:n heroi:s vilao:n ' +
      'magia:p voa:q engracado:q realeza:n cor-azul:q cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n loiro:s chapeu:s orelhas:p arma:s forte:p rapido:p ' +
      'capa:n vestido:n barba:n oculos:n careca:n ruivo:n cabelo-comprido:q rabo:n pelo:n monstro:n robo:n pirata:s ' +
      'selvagem:p antigo:s recente:n t-mario:s'],
    ['zelda', 'Princesa Zelda', '👸', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:q idoso:n brasileiro:n fala:p desenho:? ' +
      'filme:q serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:s voa:n engracado:n realeza:s cor-azul:? cor-vermelho:n cor-verde:n cor-amarelo:q cor-rosa:p ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n loiro:s cabelo-comprido:s vestido:s chapeu:s ' +
      'orelhas:p arma:p ruivo:n careca:n oculos:n barba:n capa:n rabo:n pelo:n monstro:n robo:n antigo:s recente:n ' +
      't-mario:s t-princesas:n'],
    ['ganondorf', 'Ganondorf', '😈', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:p desenho:? ' +
      'filme:q serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:s voa:q engracado:n realeza:s cor-azul:n cor-vermelho:q cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:q grande:p pequeno:n ruivo:s barba:s arma:s forte:s capa:s chapeu:p ' +
      'careca:n loiro:n oculos:n rabo:n pelo:n monstro:p robo:n antigo:s recente:n t-mario:s'],
    ['red-angry-birds', 'Red (Angry Birds)', '🐦', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:p desenho:s ' +
      'filme:n serie:p livro:n videogame:s internet:? tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:q engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:q cor-rosa:n ' +
      'cor-preto:p cor-branco:p cor-marrom:n grande:n pequeno:p passaro:s rabo:p pelo:n orelhas:n chapeu:n arma:n ' +
      'forte:p monstro:n robo:n estimacao:n antigo:n recente:p t-mario:n'],
    ['porco-verde', 'Porco Verde (Angry Birds)', '🐷', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:p feminino:n crianca:n idoso:n brasileiro:n fala:p desenho:s ' +
      'filme:n serie:p livro:n videogame:s internet:? tv:n disney:n canta:q musica:n esporte:n heroi:n vilao:s ' +
      'magia:n voa:n engracado:s realeza:q cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p passaro:n rabo:q pelo:n orelhas:q fazenda:q ' +
      'monstro:n robo:n estimacao:n comida:n antigo:n recente:p t-mario:n'],
    ['talking-tom', 'Talking Tom', '🐱', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:s internet:p tv:n disney:n canta:p musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:q cor-amarelo:n cor-rosa:n ' +
      'cor-preto:q cor-branco:q cor-marrom:n grande:n pequeno:q gato:s rabo:s pelo:s orelhas:p estimacao:s chapeu:n ' +
      'oculos:n vestido:n monstro:n robo:n antigo:n recente:s casado:p t-mario:n'],
    ['talking-angela', 'Talking Angela', '😺', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:s internet:p tv:n disney:n canta:s musica:p esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:q cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:q gato:s rabo:s pelo:s orelhas:p estimacao:s ' +
      'vestido:p dancar:p monstro:n robo:n antigo:n recente:s casado:p t-mario:n'],
    ['crash-bandicoot', 'Crash Bandicoot', '🌪️', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:q desenho:n ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:p cor-vermelho:q cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n rabo:p pelo:s orelhas:q rapido:p forte:q selvagem:s ' +
      'chapeu:n oculos:n monstro:n robo:n antigo:s recente:n t-mario:n'],
    ['spyro', 'Spyro', '🐲', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:q ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:p engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n dinossauro:s rabo:s pelo:n chapeu:n monstro:p ' +
      'robo:n rapido:p antigo:s recente:n t-mario:n'],
    ['lara-croft', 'Lara Croft', '🏺', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:s serie:n livro:q videogame:s internet:n tv:n disney:n canta:n musica:n esporte:q heroi:s vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:p grande:n pequeno:n cabelo-comprido:s arma:s forte:s rapido:p rico:s ' +
      'pirata:s cientista:s europa:s estrangeiro-eua:n oculos:q loiro:n ruivo:n careca:n vestido:n chapeu:n capa:n ' +
      'monstro:n robo:n selvagem:p antigo:s recente:n ator:n t-mario:n t-acao:p'],
    ['rayman', 'Rayman', '🖐️', 'IFA',
      'real:n pessoa:q bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:p desenho:q ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:p engracado:s realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:p cor-rosa:s ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n loiro:p barba:n chapeu:n oculos:n arma:n rabo:n ' +
      'pelo:n monstro:p robo:n antigo:s recente:n t-mario:n'],
    ['mega-man', 'Mega Man', '🤖', 'IFA',
      'real:n pessoa:q bicho:n coisa:q masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:p desenho:p ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:q realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n robo:s chapeu:s arma:s forte:p rapido:p capa:n ' +
      'rabo:n pelo:n monstro:n antigo:s recente:n t-mario:n'],
    ['fall-guy', 'Fall Guy (Fall Guys)', '🫘', 'IFA',
      'real:n pessoa:q bicho:n coisa:n masculino:? feminino:? crianca:? idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:s internet:p tv:n disney:n canta:n musica:n esporte:p heroi:? vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:s ' +
      'cor-preto:n cor-branco:q cor-marrom:n grande:n pequeno:n corrida:s rapido:q rabo:n pelo:n monstro:q robo:n ' +
      'recente:s antigo:n t-mario:n'],
    ['stumble-guys', 'Stumble Guys', '🏃', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:? feminino:? crianca:? idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:s internet:p tv:n disney:n canta:n musica:n esporte:p heroi:? vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n corrida:s rabo:n pelo:n monstro:n robo:n recente:s ' +
      'antigo:n t-mario:n'],
    ['cuphead', 'Cuphead', '☕', 'IFA',
      'real:n pessoa:q bicho:n coisa:p masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:p voa:q engracado:s realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:s cor-marrom:n grande:n pequeno:n chapeu:p rapido:p rabo:n pelo:n monstro:n robo:n ' +
      'antigo:n recente:s t-mario:n'],
    ['freddy-fazbear', 'Freddy Fazbear', '🐻', 'FA',
      'real:n pessoa:n bicho:p coisa:q masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:p desenho:n ' +
      'filme:s serie:n livro:p videogame:s internet:s tv:n disney:n canta:p musica:q esporte:n heroi:n vilao:s ' +
      'magia:q voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:s grande:s pequeno:n urso:s robo:s monstro:p chapeu:s orelhas:p pelo:q ' +
      'arma:n rabo:n antigo:n recente:s t-mario:n'],
    ['huggy-wuggy', 'Huggy Wuggy', '🧸', 'FA',
      'real:n pessoa:n bicho:q coisa:q masculino:p feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:q serie:n livro:n videogame:s internet:s tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:s cor-vermelho:p cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:s pequeno:n monstro:s pelo:s robo:n rabo:n orelhas:n chapeu:n ' +
      'rapido:p antigo:n recente:s t-mario:n'],
    ['wario', 'Wario', '🧄', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:q ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:q vilao:p ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:q cor-amarelo:s cor-rosa:p ' +
      'cor-preto:n cor-branco:q cor-marrom:n grande:n pequeno:n chapeu:s barba:s forte:p rico:p careca:n oculos:n ' +
      'rabo:n pelo:n monstro:n robo:n veiculo:p antigo:s t-mario:s'],
    ['waluigi', 'Waluigi', '🟪', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:s internet:p tv:n disney:n canta:n musica:n esporte:p heroi:n vilao:p ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:p cor-branco:q cor-marrom:q grande:n pequeno:n chapeu:s barba:s careca:n oculos:n rabo:n pelo:n ' +
      'monstro:n robo:n veiculo:p antigo:q recente:n t-mario:s'],
    ['rosalina', 'Rosalina', '⭐', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:s voa:p engracado:n realeza:s cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:q cor-rosa:n ' +
      'cor-preto:n cor-branco:q cor-marrom:n grande:n pequeno:n loiro:s cabelo-comprido:s vestido:s chapeu:s arma:p ' +
      'ruivo:n oculos:n rabo:n pelo:n espaco:s monstro:n robo:n antigo:n t-mario:s'],
    ['daisy', 'Princesa Daisy', '🌼', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:q ' +
      'filme:p serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:p heroi:p vilao:n ' +
      'magia:n voa:n engracado:p realeza:s cor-azul:q cor-vermelho:n cor-verde:q cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:q cor-marrom:p grande:n pequeno:n ruivo:p loiro:n vestido:s chapeu:s oculos:n rabo:n ' +
      'pelo:n monstro:n robo:n veiculo:p antigo:s t-mario:s'],
    ['isabelle', 'Isabelle (Animal Crossing)', '🐶', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:p desenho:q ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:p cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n cachorro:s rabo:s pelo:s orelhas:p estimacao:q ' +
      'professor:q oculos:n monstro:n robo:n antigo:n recente:s t-mario:s'],
    ['tom-nook', 'Tom Nook', '🦝', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:q brasileiro:n fala:p desenho:q ' +
      'filme:n serie:n livro:n videogame:s internet:q tv:n disney:n canta:n musica:n esporte:n heroi:q vilao:q ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:n cor-verde:? cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n rabo:s pelo:s orelhas:q rico:s selvagem:q oculos:n ' +
      'monstro:n robo:n antigo:n recente:n t-mario:s'],
    ['sackboy', 'Sackboy', '🧶', 'IFA',
      'real:n pessoa:q bicho:n coisa:p masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:p rabo:n pelo:n monstro:n robo:n europa:p antigo:n ' +
      't-mario:n'],
    ['bomberman', 'Bomberman', '💣', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:q desenho:q ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:p cor-vermelho:q cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n chapeu:s arma:p robo:? rabo:n pelo:n monstro:n ' +
      'antigo:s t-mario:n'],
    ['tetris', 'Tetris (as pecinhas)', '🧱', 'IFA',
      'real:q pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:q serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:q esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:p cor-vermelho:p cor-verde:p cor-amarelo:p cor-rosa:p ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:? rabo:n pelo:n monstro:n robo:n comida:n antigo:s'],
    ['pikmin', 'Pikmin', '🌱', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:? feminino:? crianca:? idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:q engracado:p realeza:n cor-azul:p cor-vermelho:p cor-verde:q cor-amarelo:p cor-rosa:q ' +
      'cor-preto:n cor-branco:q cor-marrom:n grande:n pequeno:s monstro:p selvagem:s robo:n rabo:n pelo:n antigo:n ' +
      't-mario:s'],
    ['pou', 'Pou', '🟤', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:? feminino:? crianca:? idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:s internet:p tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:p monstro:p estimacao:s espaco:p rabo:n pelo:n ' +
      'orelhas:n comida:n robo:n antigo:n recente:s t-mario:n'],
    ['jake-subway', 'Jake (Subway Surfers)', '🛹', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:q desenho:p ' +
      'filme:n serie:n livro:n videogame:s internet:? tv:n disney:n canta:n musica:n esporte:q heroi:p vilao:q ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:n ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:s rapido:s veiculo:p pintor:q rabo:n pelo:n ' +
      'monstro:n robo:n antigo:n recente:s t-mario:n'],
    ['explorador-temple-run', 'Explorador do Temple Run', '🏃‍♂️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:s internet:? tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:n ' +
      'cor-preto:? cor-branco:? cor-marrom:p grande:n pequeno:n rapido:s pirata:s cientista:p selvagem:s rabo:n ' +
      'pelo:n monstro:n robo:n antigo:n recente:s t-mario:n'],
    ['cubo-geometry-dash', 'Cubinho do Geometry Dash', '🟩', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:? feminino:? crianca:? idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:s internet:p tv:n disney:n canta:n musica:p esporte:n heroi:? vilao:n ' +
      'magia:n voa:p engracado:q realeza:n cor-azul:p cor-vermelho:n cor-verde:p cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:? rapido:s rabo:n pelo:n monstro:n robo:n veiculo:p ' +
      'antigo:n recente:s t-mario:n'],
    ['girassol-pvz', 'Girassol (Plantas vs. Zumbis)', '🌻', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:q voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:q rabo:n pelo:n monstro:n robo:n comida:n antigo:n ' +
      't-mario:n'],
    ['zumbi-pvz', 'Zumbi (Plantas vs. Zumbis)', '🧟', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:q desenho:n ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:p cor-verde:q cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:q cor-marrom:p grande:n pequeno:n monstro:s robo:n chapeu:? careca:p barba:n rabo:n ' +
      'pelo:n rapido:n antigo:n t-mario:n'],
    ['ervilha-pvz', 'Ervilha Atiradora (Plantas vs. Zumbis)', '🟢', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:q arma:p rabo:n pelo:n monstro:n robo:n antigo:n ' +
      't-mario:n'],
    ['diddy-kong', 'Diddy Kong', '🐒', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:q desenho:? ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:p engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:q cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:s rabo:s pelo:s selvagem:s rapido:p ' +
      'veiculo:p monstro:n robo:n antigo:s t-mario:s'],
    ['koopa-troopa', 'Koopa Troopa', '🐢', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:? feminino:n crianca:n idoso:n brasileiro:n fala:p desenho:s ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p ' +
      'magia:n voa:q engracado:p realeza:n cor-azul:n cor-vermelho:q cor-verde:s cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n rabo:p pelo:n monstro:q robo:n antigo:s t-mario:s'],
    ['goomba', 'Goomba', '🍄', 'IFA',
      'real:n pessoa:n bicho:q coisa:n masculino:? feminino:n crianca:n idoso:n brasileiro:n fala:q desenho:s ' +
      'filme:? serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:q cor-marrom:s grande:n pequeno:p monstro:s robo:n rabo:n pelo:n antigo:s t-mario:s'],
    ['boo-mario', 'Boo (fantasminha do Mario)', '👻', 'IFA',
      'real:n pessoa:n bicho:n coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:q desenho:p ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p ' +
      'magia:p voa:s engracado:p realeza:n cor-azul:n cor-vermelho:q cor-verde:n cor-amarelo:n cor-rosa:q ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n monstro:s robo:n rabo:n pelo:n antigo:s folclore:n ' +
      't-mario:s'],
    ['planta-piranha', 'Planta Piranha', '🌺', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:p ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:n voa:n engracado:q realeza:n cor-azul:n cor-vermelho:s cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n monstro:s robo:n rabo:n pelo:n comida:n antigo:s ' +
      't-mario:s'],
    ['bowser-jr', 'Bowser Jr.', '🐲', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:p voa:p engracado:p realeza:s cor-azul:n cor-vermelho:p cor-verde:s cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n ruivo:s rabo:s pelo:n dinossauro:p monstro:s robo:n ' +
      'veiculo:p antigo:n recente:n t-mario:s'],
    ['eevee', 'Eevee', '🦊', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:n serie:p livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:q vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:s grande:n pequeno:p rabo:s pelo:s orelhas:s estimacao:p monstro:s ' +
      'robo:n antigo:s t-pokemon:s'],
    ['snorlax', 'Snorlax', '😴', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:n serie:p livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:q vilao:n ' +
      'magia:p voa:n engracado:s realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:q cor-branco:p cor-marrom:n grande:s pequeno:n forte:s orelhas:p rabo:n pelo:q urso:q monstro:s ' +
      'robo:n antigo:s t-pokemon:s'],
    ['mewtwo', 'Mewtwo', '🧬', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:? feminino:n crianca:n idoso:n brasileiro:n fala:p desenho:s ' +
      'filme:p serie:p livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:q vilao:p ' +
      'magia:s voa:p engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:p pequeno:n rabo:s pelo:n forte:s monstro:s robo:n antigo:s ' +
      't-pokemon:s'],
    ['meowth', 'Meowth', '🪙', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:s internet:n tv:n disney:n canta:p musica:n esporte:n heroi:n vilao:s ' +
      'magia:p voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:q cor-rosa:n ' +
      'cor-preto:n cor-branco:q cor-marrom:q grande:n pequeno:n gato:s rabo:s pelo:s orelhas:p rico:q monstro:s ' +
      'robo:n antigo:s t-pokemon:s'],
    ['charizard', 'Charizard', '🐉', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:p serie:p livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:q vilao:n ' +
      'magia:s voa:s engracado:n realeza:n cor-azul:q cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:s pequeno:n rabo:s pelo:n forte:s dinossauro:s monstro:s robo:n ' +
      'antigo:s t-pokemon:s'],
    ['psyduck', 'Psyduck', '🦆', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:p serie:p livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:q vilao:n ' +
      'magia:s voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:q passaro:p agua:p rabo:q pelo:n monstro:s robo:n ' +
      'antigo:s t-pokemon:s'],
    ['dr-eggman', 'Dr. Eggman (Robotnik)', '🧪', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:q brasileiro:n fala:s desenho:s ' +
      'filme:s serie:q livro:n videogame:s internet:q tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:n voa:p engracado:s realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:q cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:q grande:p pequeno:n careca:s barba:s oculos:s cientista:s veiculo:s ' +
      'rico:p arma:p chapeu:n rabo:n pelo:n monstro:n robo:n antigo:s t-mario:n'],
    ['shadow', 'Shadow', '🖤', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:s serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:p ' +
      'magia:p voa:q engracado:n realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:q cor-marrom:n grande:n pequeno:n rabo:p pelo:p rapido:s forte:p monstro:n robo:n ' +
      'antigo:n recente:n t-mario:n'],
    ['amy-rose', 'Amy Rose', '🌸', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:q serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n vestido:s arma:s rabo:q pelo:p rapido:p monstro:n ' +
      'robo:n antigo:s t-mario:n'],
    ['fantasma-pac-man', 'Fantasma do Pac-Man', '👾', 'IFA',
      'real:n pessoa:n bicho:n coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:? ' +
      'filme:q serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:q voa:p engracado:p realeza:n cor-azul:p cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:q cor-marrom:p grande:n pequeno:n monstro:s robo:n rabo:n pelo:n rapido:p antigo:s ' +
      't-mario:n'],
    ['authentic-games', 'AuthenticGames', '🕹️', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:q ' +
      'filme:q serie:n livro:? videogame:p internet:s tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s antigo:n recente:s historia:n ator:n ' +
      'dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['casimiro', 'Casimiro (Cazé)', '🎙️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:q internet:s tv:q disney:n canta:n musica:n esporte:p heroi:n vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n barba:s careca:n rico:p vivo:s antigo:n recente:s ' +
      'historia:n ator:n dancar:n futebol:q corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['cellbit', 'Cellbit', '🔎', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:p internet:s tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s antigo:n recente:s historia:n ator:n ' +
      'dancar:n futebol:n corrida:n cientista:n pintor:p detetive:? politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'espaco:n']
  ];
  (raiz.QEPersonagens = raiz.QEPersonagens || {}).jogos = L;
  if (typeof module === 'object' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
