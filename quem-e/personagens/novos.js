/* Quem é? — A Meleca Adivinha: personagens NOVOS de desenho e de programa infantil (2012–2025) que as crianças do
   Brasil conhecem: A Casa Mágica da Gabby, Miraculous, Pocoyo, Cocomelon, PJ Masks, Super Wings, Robocar Poli, Disney
   Junior, mais da Patrulha Canina, da Peppa e da Bluey, desenhos brasileiros (Irmão do Jorel, Peixonauta, O Show da
   Luna), Guerreiras do K-Pop e filmes de cinema recentes.
   Formato igual ao de personagens/familia.js; perguntas em adivinha-perguntas.js. */
(function (raiz) {
  'use strict';
  var L = [
    ['gabby', 'Gabby (A Casa Mágica da Gabby)', '🎀', 'IFA',
      'real:q pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:s livro:n videogame:n internet:? tv:n disney:n canta:p musica:n esporte:n heroi:s vilao:n ' +
      'magia:p voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s chapeu:p gato:q ' +
      'estrangeiro-eua:s'],
    ['pandy-paws', 'Pandy Paws', '🐼', 'IFA',
      'real:n pessoa:n bicho:p coisa:q masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:q serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:s cor-marrom:n grande:n pequeno:? antigo:n recente:s urso:p pelo:s'],
    ['ladybug', 'Ladybug', '🐞', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:q internet:n tv:n disney:q canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:q engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s capa:s arma:p rapido:p ' +
      'forte:p cabelo-comprido:n inseto:p escola:s europa:s detetive:p'],
    ['cat-noir', 'Cat Noir', '🐈‍⬛', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:q internet:n tv:n disney:q canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:q cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s loiro:s capa:s arma:s ' +
      'rapido:p forte:p gato:p orelhas:p rabo:p rico:s escola:s europa:s'],
    ['hawk-moth', 'Hawk Moth', '🦋', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:q canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:s voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s capa:s arma:p rico:s ' +
      'inseto:p europa:s pintor:p casado:p'],
    ['pocoyo', 'Pocoyo', '🧢', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:q desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:p tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:n chapeu:s dancar:p europa:s'],
    ['pato-pocoyo', 'Pato (Pocoyo)', '🦆', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:q desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:q engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:n chapeu:s passaro:s europa:s'],
    ['elly', 'Elly', '🐘', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:? idoso:n brasileiro:n fala:q desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:n orelhas:s dancar:p europa:s'],
    ['jj-cocomelon', 'JJ (Cocomelon)', '👶', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:s tv:n disney:n canta:s musica:s esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:n ' +
      'cor-preto:n cor-branco:? cor-marrom:n grande:n pequeno:n antigo:n recente:s careca:p escola:p ' +
      'familia-grande:s estrangeiro-eua:s'],
    ['menino-gato', 'Menino Gato', '🐱', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:p canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s capa:s rapido:s gato:p ' +
      'orelhas:p rabo:p escola:s veiculo:p'],
    ['corujita', 'Corujita', '🦉', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:p canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:s engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s capa:s passaro:p escola:s ' +
      'veiculo:p'],
    ['lagartixo', 'Lagartixo', '🦎', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:p canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s capa:s forte:s escola:s ' +
      'veiculo:p'],
    ['romeo-pj-masks', 'Romeo (PJ Masks)', '🧪', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:p canta:q musica:n esporte:n heroi:n vilao:s ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n antigo:n recente:s robo:q cientista:s veiculo:p'],
    ['jett', 'Jett (Super Wings)', '✈️', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:s engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n antigo:n recente:s robo:s rapido:s veiculo:s'],
    ['poli', 'Poli (Robocar Poli)', '🚓', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n antigo:n recente:s robo:s rapido:p veiculo:s ' +
      'professor:s'],
    ['amber-robocar', 'Amber (Robocar Poli)', '🚑', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n antigo:n recente:s robo:s veiculo:s professor:s'],
    ['tayo', 'Tayo, o Pequeno Ônibus', '🚌', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:p robo:p veiculo:s'],
    ['duggee', 'Duggee', '🐕', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:? pequeno:n antigo:n recente:s cachorro:s pelo:s rabo:s ' +
      'professor:p europa:s'],
    ['daniel-tigre', 'Daniel Tigre', '🐯', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:s musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n antigo:n recente:s gato:s rabo:s pelo:s ' +
      'escola:p estrangeiro-eua:s'],
    ['polly-pocket', 'Polly Pocket', '💖', 'IFA',
      'real:n pessoa:s bicho:n coisa:q masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:p voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p antigo:p recente:p loiro:s'],
    ['baby-shark', 'Baby Shark', '🦈', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:p feminino:n crianca:s idoso:n brasileiro:n fala:p desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:s tv:n disney:n canta:s musica:s esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:q antigo:n recente:s agua:s dancar:p ' +
      'familia-grande:s'],
    ['pinkfong', 'Pinkfong', '🦊', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:s tv:n disney:n canta:s musica:s esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s orelhas:s rabo:s pelo:p ' +
      'dancar:p'],
    ['blaze', 'Blaze (Blaze e os Monster Machines)', '🛻', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n antigo:n recente:s rapido:s robo:p veiculo:s ' +
      'corrida:s estrangeiro-eua:p'],
    ['lloyd-ninjago', 'Lloyd (Ninjago)', '🥷', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:q antigo:n recente:s loiro:s capa:s arma:s ' +
      'forte:p'],
    ['kai-ninjago', 'Kai (Ninjago)', '🔥', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:q idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:q antigo:n recente:s capa:s arma:s forte:p'],
    ['gumball', 'Gumball', '😼', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s gato:s rabo:s escola:s ' +
      'familia-grande:s'],
    ['steven-universo', 'Steven Universo', '⭐', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:s musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s arma:p estrangeiro-eua:s'],
    ['princesinha-sofia', 'Princesinha Sofia', '👑', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n ' +
      'magia:p voa:n engracado:p realeza:s cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s chapeu:s vestido:s ' +
      'cabelo-comprido:p rico:s escola:s familia-grande:p t-princesas:q'],
    ['doutora-brinquedos', 'Doutora Brinquedos', '🩺', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:s canta:p musica:n esporte:n heroi:s vilao:n ' +
      'magia:p voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n antigo:n recente:s professor:s ' +
      'estrangeiro-eua:s'],
    ['vampirina', 'Vampirina', '🦇', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:s canta:p musica:n esporte:n heroi:p vilao:n ' +
      'magia:s voa:p engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s vestido:s monstro:p escola:s ' +
      'europa:p'],
    ['elena-de-avalor', 'Elena de Avalor', '🗡️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:q idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:s canta:p musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:n engracado:p realeza:s cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s chapeu:p vestido:s ' +
      'cabelo-comprido:s arma:p t-princesas:q'],
    ['rubble', 'Rubble', '🚧', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n antigo:n recente:s chapeu:s rabo:s pelo:s ' +
      'forte:p cachorro:s estimacao:p veiculo:s t-patrulha:s'],
    ['rocky-patrulha', 'Rocky (Patrulha Canina)', '♻️', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n antigo:n recente:s chapeu:s rabo:s pelo:s ' +
      'cachorro:s estimacao:p veiculo:s t-patrulha:s'],
    ['zuma', 'Zuma', '🌊', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n antigo:n recente:s chapeu:s rabo:s pelo:s ' +
      'cachorro:s agua:p estimacao:p veiculo:s t-patrulha:s'],
    ['everest', 'Everest', '🏔️', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n antigo:n recente:s chapeu:s rabo:s pelo:s ' +
      'cachorro:s estimacao:p veiculo:s t-patrulha:s'],
    ['papai-pig', 'Papai Pig', '🐷', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:n cor-verde:? cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:n oculos:s barba:s rabo:s ' +
      'fazenda:q casado:s europa:s t-peppa:s'],
    ['mamae-pig', 'Mamãe Pig', '🐖', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n antigo:n recente:n vestido:s rabo:s fazenda:q ' +
      'casado:s europa:s t-peppa:s'],
    ['bandit', 'Bandit', '🐕', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s rabo:s pelo:s cachorro:s ' +
      'casado:s t-peppa:s'],
    ['chilli', 'Chilli', '🐕', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n antigo:n recente:s rabo:s pelo:s cachorro:s ' +
      'casado:s t-peppa:s'],
    ['irmao-do-jorel', 'Irmão do Jorel', '👦', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:s fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:n ' +
      'cor-preto:n cor-branco:? cor-marrom:n grande:n pequeno:n antigo:n recente:s escola:s familia-grande:s'],
    ['jorel', 'Jorel', '💇', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:s fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:n ' +
      'cor-preto:n cor-branco:? cor-marrom:n grande:n pequeno:n antigo:n recente:s cabelo-comprido:p escola:s ' +
      'familia-grande:s'],
    ['vovo-juju', 'Vovó Juju', '👵', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:s brasileiro:s fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:n cor-branco:? cor-marrom:n grande:n pequeno:n antigo:n recente:s familia-grande:s'],
    ['peixonauta', 'Peixonauta', '🐟', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:? grande:n pequeno:n antigo:n recente:q chapeu:p agua:p detetive:s ' +
      'cientista:p'],
    ['jupiter-luna', 'Júpiter (O Show da Luna)', '👦', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:s fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:p musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s familia-grande:p cientista:p'],
    ['claudio-luna', 'Cláudio (O Show da Luna)', '🦦', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:n desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:? cor-marrom:? grande:n pequeno:q antigo:n recente:s rabo:s pelo:s estimacao:s'],
    ['rumi', 'Rumi', '🗡️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:s vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s cabelo-comprido:s arma:s ' +
      'forte:p rapido:p monstro:p dancar:s'],
    ['mira-kpop', 'Mira', '💃', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:s vilao:n ' +
      'magia:s voa:n engracado:q realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:? ' +
      'cor-preto:? cor-branco:n cor-marrom:n grande:q pequeno:n antigo:n recente:s cabelo-comprido:s arma:s ' +
      'forte:p dancar:s'],
    ['zoey-kpop', 'Zoey', '🎤', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:s vilao:n ' +
      'magia:s voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:? cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s arma:s dancar:s ' +
      'estrangeiro-eua:p'],
    ['huntrix', 'HUNTR/X', '✨', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:s vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s cabelo-comprido:p arma:s ' +
      'dancar:s'],
    ['jinu', 'Jinu', '🎙️', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:q vilao:p ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s monstro:s dancar:p'],
    ['saja-boys', 'Saja Boys', '🖤', 'IFA',
      'real:n pessoa:q bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:s ' +
      'magia:s voa:n engracado:q realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s chapeu:p monstro:s dancar:s'],
    ['derpy', 'Derpy (o tigre)', '🐯', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:p voa:n engracado:s realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:? cor-marrom:n grande:n pequeno:n antigo:n recente:s rabo:s gato:s monstro:p'],
    ['sussie', 'Sussie (a pega)', '🐦‍⬛', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:p voa:s engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:p cor-marrom:n grande:n pequeno:n antigo:n recente:s chapeu:s passaro:s monstro:p'],
    ['sr-lobo', 'Sr. Lobo (Os Caras Malvados)', '🐺', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:p ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s rabo:s pelo:s orelhas:p ' +
      'rapido:p selvagem:q veiculo:s detetive:q'],
    ['gidget', 'Gidget', '🐩', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:p antigo:n recente:s rabo:s pelo:s forte:p ' +
      'cachorro:s estimacao:s casado:p'],
    ['bola-de-neve', 'Bola de Neve', '🐰', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:p ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:p antigo:n recente:s rabo:p pelo:s orelhas:s ' +
      'capa:p estimacao:s'],
    ['roz', 'Roz (O Robô Selvagem)', '🤖', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:n feminino:p crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:n cor-verde:? cor-amarelo:n cor-rosa:n ' +
      'cor-preto:? cor-branco:? cor-marrom:n grande:p pequeno:n antigo:n recente:s robo:s forte:p selvagem:s'],
    ['bico-fino', 'Bico-Fino', '🪿', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:s engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:? cor-rosa:n ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n antigo:n recente:s passaro:s selvagem:s'],
    ['perrito', 'Perrito', '🐶', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:? cor-marrom:? grande:n pequeno:p antigo:n recente:s rabo:s pelo:s cachorro:s ' +
      't-shrek:p'],
    ['inveja', 'Inveja', '🤩', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:q livro:n videogame:n internet:n tv:n disney:s canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p antigo:n recente:s t-divertida:s'],
    ['tedio', 'Tédio', '📱', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:q livro:n videogame:n internet:n tv:n disney:s canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s europa:p t-divertida:s'],
    ['vergonha', 'Vergonha', '🫣', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:q livro:n videogame:n internet:n tv:n disney:s canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:q pequeno:n antigo:n recente:s chapeu:p t-divertida:s'],
    ['sisu', 'Sisu', '🐉', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:s canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:s engracado:s realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n antigo:n recente:s agua:p dinossauro:s'],
    ['miles-morales', 'Miles Morales', '🕷️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:s videogame:n internet:n tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n antigo:n recente:s capa:s rapido:p forte:p ' +
      'inseto:p escola:s estrangeiro-eua:s t-marvel:s'],
    ['spider-gwen', 'Spider-Gwen (Gwen Stacy)', '🩰', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:s videogame:n internet:n tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:p cor-branco:s cor-marrom:n grande:n pequeno:n antigo:n recente:s loiro:s capa:s rapido:p ' +
      'inseto:p escola:s estrangeiro-eua:s t-marvel:s']
  ];
  (raiz.QEPersonagens = raiz.QEPersonagens || {}).novos = L;
  if (typeof module === 'object' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
