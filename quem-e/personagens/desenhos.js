/* Quem é? — A Meleca Adivinha: personagens de desenho animado que NÃO são da Disney nem da Pixar
   (filmes da DreamWorks e da Illumination, videogame, séries de TV e desenhos brasileiros).
   Formato igual ao de personagens/familia.js; perguntas em adivinha-perguntas.js. */
(function (raiz) {
  'use strict';
  var L = [
    ['buster-moon', 'Buster Moon', '🐨', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:p musica:p esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:? cor-branco:n cor-marrom:? grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:s orelhas:s rico:q ' +
      'cachorro:n gato:n urso:p robo:n antigo:n recente:s t-sing:s'],
    ['rosita', 'Rosita', '🐖', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n oculos:n rabo:s pelo:n robo:n fazenda:p antigo:n ' +
      'recente:s dancar:p casado:s familia-grande:s t-sing:s'],
    ['ash-sing', 'Ash (Sing)', '🎸', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:q idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n oculos:n rabo:q pelo:p robo:n selvagem:q ' +
      'antigo:n recente:s t-sing:s'],
    ['johnny', 'Johnny', '🦍', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:q idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:q grande:p pequeno:n rabo:n pelo:s forte:s robo:n selvagem:q antigo:n ' +
      'recente:s t-sing:s'],
    ['meena', 'Meena', '🐘', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:q realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:? ' +
      'cor-preto:q cor-branco:n cor-marrom:n grande:s pequeno:n pelo:n orelhas:s robo:n antigo:n recente:s ' +
      'familia-grande:p t-sing:s'],
    ['gunter', 'Gunter', '🕺', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:s pelo:n robo:n fazenda:p antigo:n ' +
      'recente:s dancar:s europa:s t-sing:s'],
    ['gru', 'Gru', '🦹', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:p ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:q cor-marrom:n grande:n pequeno:n oculos:n careca:s rabo:n pelo:n arma:p rico:p ' +
      'cachorro:n gato:n rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:n recente:s cientista:p ' +
      'europa:p espaco:p veiculo:s casado:s familia-grande:s t-minions:s'],
    ['minions', 'Minions', '🍌', 'IFA',
      'real:n pessoa:n bicho:n coisa:n masculino:p feminino:n crianca:n idoso:n brasileiro:n fala:q desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:p musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:q oculos:s careca:p rabo:n pelo:n cachorro:n ' +
      'gato:n rato:n urso:n passaro:n dinossauro:n monstro:s robo:n antigo:n recente:s t-minions:s'],
    ['agnes', 'Agnes', '🦄', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:q cor-branco:n cor-marrom:n grande:n pequeno:n oculos:n loiro:n cabelo-comprido:q rabo:n pelo:n ' +
      'cachorro:n gato:n rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:n recente:s escola:p ' +
      'familia-grande:s t-minions:s'],
    ['edith', 'Edith', '🥷', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s oculos:n loiro:s rabo:n pelo:n ' +
      'cachorro:n gato:n rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:n recente:s escola:p ' +
      'familia-grande:s t-minions:s'],
    ['dr-nefario', 'Dr. Nefário', '👴', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:q ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:? cor-marrom:? grande:n pequeno:n oculos:s careca:p rabo:n pelo:n cachorro:n ' +
      'gato:n rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:n recente:s cientista:s t-minions:s'],
    ['max-pets', 'Max (Pets)', '🦴', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:p grande:n pequeno:p rabo:s pelo:s cachorro:s gato:n robo:n ' +
      'estimacao:s antigo:n recente:s'],
    ['shrek', 'Shrek', '👹', 'IFA',
      'real:n pessoa:q bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:p videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:s realeza:q cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:s pequeno:n careca:s rabo:n pelo:n orelhas:p forte:s ' +
      'cachorro:n gato:n rato:n urso:n passaro:n dinossauro:n monstro:s robo:n selvagem:s antigo:n recente:n ' +
      'casado:s familia-grande:p t-shrek:s'],
    ['burro', 'Burro', '🫏', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:q videogame:n internet:n tv:n disney:n canta:s musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:q cor-branco:n cor-marrom:n grande:n pequeno:n rabo:s pelo:s orelhas:s robo:n fazenda:p ' +
      'antigo:n recente:n casado:s t-shrek:s'],
    ['fiona', 'Princesa Fiona', '👸', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:q videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:p voa:n engracado:p realeza:s cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:p ruivo:s cabelo-comprido:s rabo:n pelo:n ' +
      'vestido:s forte:s cachorro:n gato:n rato:n urso:n passaro:n dinossauro:n monstro:p robo:n antigo:n ' +
      'recente:n casado:s t-shrek:s'],
    ['gato-de-botas', 'Gato de Botas', '🐱', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:q videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:s rabo:s pelo:s arma:s rapido:p gato:s ' +
      'robo:n estimacao:q antigo:n recente:n europa:p pirata:p t-shrek:s'],
    ['biscoito', 'Biscoito', '🍪', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:q videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:s grande:n pequeno:s comida:s antigo:n recente:n t-shrek:s'],
    ['dragoa', 'Dragoa', '🐲', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:n serie:n livro:q videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:p ' +
      'magia:p voa:s engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n rabo:s dinossauro:s robo:n antigo:n recente:n ' +
      'casado:s t-shrek:s'],
    ['alex', 'Alex', '🦁', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:p pequeno:n cabelo-comprido:p rabo:s pelo:s forte:p gato:s ' +
      'robo:n selvagem:s antigo:n recente:n dancar:s t-madagascar:s'],
    ['marty', 'Marty', '🦓', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:s cor-marrom:n grande:n pequeno:n rabo:s pelo:p rapido:p robo:n selvagem:s ' +
      'antigo:n recente:n t-madagascar:s'],
    ['gloria', 'Glória', '🦛', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:? ' +
      'cor-preto:q cor-branco:n cor-marrom:n grande:s pequeno:n rabo:q pelo:n forte:p agua:p robo:n selvagem:s ' +
      'antigo:n recente:n casado:p t-madagascar:s'],
    ['melman', 'Melman', '🦒', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:s pequeno:n rabo:s pelo:p robo:n selvagem:s antigo:n ' +
      'recente:n t-madagascar:s'],
    ['rei-julien', 'Rei Julien', '👑', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:s musica:p esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:s cor-azul:n cor-vermelho:n cor-verde:q cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:p cor-marrom:n grande:n pequeno:q chapeu:s rabo:s pelo:s robo:n selvagem:s ' +
      'antigo:n recente:n dancar:s t-madagascar:s'],
    ['pinguins', 'Pinguins de Madagascar', '🐧', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:s cor-marrom:n grande:n pequeno:p rabo:q passaro:s agua:p robo:n selvagem:q ' +
      'antigo:n recente:n detetive:s t-madagascar:s'],
    ['po', 'Po', '🐼', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:p heroi:s vilao:n ' +
      'magia:p voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:s cor-marrom:n grande:p pequeno:n pelo:s forte:s urso:s robo:n selvagem:p antigo:n ' +
      't-kungfu:s'],
    ['tigresa', 'Tigresa', '🐯', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:p heroi:s vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:s grande:n pequeno:n rabo:s pelo:s rapido:s forte:s gato:s robo:n ' +
      'antigo:n t-kungfu:s'],
    ['mestre-shifu', 'Mestre Shifu', '🦝', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:p heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:s barba:p rabo:s pelo:s orelhas:s forte:s gato:n ' +
      'rato:n robo:n antigo:n professor:s t-kungfu:s'],
    ['mestre-oogway', 'Mestre Oogway', '🐢', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:p heroi:s vilao:n ' +
      'magia:s voa:n engracado:q realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n careca:s pelo:n arma:p rapido:n forte:p robo:n ' +
      'antigo:n professor:s t-kungfu:s'],
    ['soluco', 'Soluço', '🛡️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:n livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:p engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n ruivo:q rabo:n pelo:n arma:p cachorro:n gato:n ' +
      'rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:n cientista:p europa:p t-dragao:s'],
    ['banguela', 'Banguela', '🐉', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:p serie:n livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:s engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n rabo:s rapido:s dinossauro:s robo:n estimacao:p ' +
      'antigo:n europa:p t-dragao:s'],
    ['astrid', 'Astrid', '🪓', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:n livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:q realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n loiro:s cabelo-comprido:s rabo:n pelo:n arma:s ' +
      'forte:s cachorro:n gato:n rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:n europa:p ' +
      'casado:p t-dragao:s'],
    ['poppy', 'Poppy', '🌺', 'IFA',
      'real:n pessoa:n bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:s cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:p cabelo-comprido:s monstro:p recente:s ' +
      'dancar:s casado:p t-trolls:s'],
    ['tronco', 'Tronco', '🌿', 'IFA',
      'real:n pessoa:n bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:p musica:s esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s cabelo-comprido:q monstro:p recente:s dancar:s ' +
      'casado:p t-trolls:s'],
    ['poderoso-chefinho', 'O Poderoso Chefinho', '👶', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:p cor-marrom:n grande:n pequeno:n careca:p rabo:n pelo:n rico:p cachorro:n gato:n ' +
      'rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:n recente:s'],
    ['spirit', 'Spirit', '🐎', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n cabelo-comprido:p rabo:s pelo:s rapido:s robo:n ' +
      'selvagem:s antigo:n estrangeiro-eua:s'],
    ['ash-ketchum', 'Ash Ketchum', '🧢', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:p internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s rabo:n pelo:n cachorro:n gato:n rato:n ' +
      'urso:n passaro:n dinossauro:n monstro:n robo:n antigo:p pirata:p t-pokemon:p'],
    ['pikachu', 'Pikachu', '⚡', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:p feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:p serie:p livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:q cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p rabo:s pelo:s orelhas:s rapido:p rato:p ' +
      'monstro:s robo:n estimacao:p antigo:p t-pokemon:s'],
    ['charmander', 'Charmander', '🔥', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:n serie:p livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n rabo:s pelo:n dinossauro:p monstro:s robo:n ' +
      'antigo:p t-pokemon:s'],
    ['bulbasaur', 'Bulbasaur', '🌱', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:n serie:p livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n dinossauro:q monstro:s robo:n ' +
      'antigo:p t-pokemon:s'],
    ['squirtle', 'Squirtle', '💧', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:n serie:p livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:q grande:n pequeno:n rabo:s pelo:n agua:p monstro:s robo:n antigo:p ' +
      't-pokemon:s'],
    ['jigglypuff', 'Jigglypuff', '🎤', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:q feminino:p crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:n serie:p livro:n videogame:s internet:n tv:n disney:n canta:s musica:p esporte:n heroi:q vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p rabo:n pelo:p monstro:s robo:n antigo:p ' +
      't-pokemon:s'],
    ['mario', 'Mario', '👨‍🔧', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:q heroi:s vilao:n ' +
      'magia:p voa:n engracado:p realeza:n cor-azul:s cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s barba:s rabo:n pelo:n cachorro:n gato:n ' +
      'rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s veiculo:p t-mario:s'],
    ['luigi', 'Luigi', '🟩', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:p voa:n engracado:s realeza:n cor-azul:s cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s barba:s rabo:n pelo:n cachorro:n gato:n ' +
      'rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s veiculo:p t-mario:s'],
    ['peach', 'Princesa Peach', '🍑', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:q voa:n engracado:p realeza:s cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s loiro:s cabelo-comprido:s rabo:n pelo:n ' +
      'vestido:s cachorro:n gato:n rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s t-mario:s'],
    ['bowser', 'Bowser', '🐢', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:p musica:n esporte:n heroi:q vilao:s ' +
      'magia:p voa:n engracado:p realeza:s cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:s pequeno:n ruivo:s rabo:s pelo:n forte:s dinossauro:p ' +
      'monstro:s robo:n antigo:s t-mario:s'],
    ['yoshi', 'Yoshi', '🥚', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:q desenho:s ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n rabo:s pelo:n dinossauro:s robo:n antigo:s ' +
      'veiculo:p t-mario:s'],
    ['toad', 'Toad', '🍄', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:p cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n chapeu:s rabo:n pelo:n cachorro:n gato:n rato:n ' +
      'urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s t-mario:s'],
    ['donkey-kong', 'Donkey Kong', '🦍', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:p ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:s pequeno:n rabo:n pelo:s forte:s robo:n selvagem:s antigo:s ' +
      't-mario:s'],
    ['sonic', 'Sonic', '🦔', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:s serie:n livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:q cor-marrom:n grande:n pequeno:n rabo:p pelo:p orelhas:p rapido:s robo:n antigo:p ' +
      't-mario:n'],
    ['tails', 'Tails', '🦊', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:s serie:n livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:s engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n rabo:s pelo:s orelhas:s rapido:p robo:n antigo:p ' +
      'cientista:s veiculo:p t-mario:n'],
    ['knuckles', 'Knuckles', '👊', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:s serie:n livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:p ' +
      'magia:n voa:p engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:q pelo:p rapido:p forte:s robo:n antigo:p ' +
      't-mario:n'],
    ['kirby', 'Kirby', '🩷', 'IFA',
      'real:n pessoa:n bicho:q coisa:n masculino:p feminino:n crianca:n idoso:n brasileiro:n fala:q desenho:s ' +
      'filme:n serie:p livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:s engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p monstro:s robo:n antigo:s t-mario:s'],
    ['chase', 'Chase', '🐕‍🦺', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:s rabo:s pelo:s orelhas:p rapido:p ' +
      'cachorro:s robo:n estimacao:p antigo:n recente:s professor:s veiculo:s t-patrulha:s'],
    ['marshall', 'Marshall', '🚒', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:p cor-marrom:n grande:n pequeno:n chapeu:s rabo:s pelo:s cachorro:s robo:n ' +
      'estimacao:p antigo:n recente:s professor:s veiculo:s t-patrulha:s'],
    ['skye', 'Skye', '🚁', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:s engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:s rabo:s pelo:s cachorro:s robo:n ' +
      'estimacao:p antigo:n recente:s professor:q veiculo:s t-patrulha:s'],
    ['ryder', 'Ryder', '👦', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:p cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:p rabo:n pelo:n cachorro:n gato:n rato:n ' +
      'urso:n passaro:n dinossauro:n monstro:n robo:n estimacao:n antigo:n recente:s veiculo:s t-patrulha:s'],
    ['peppa', 'Peppa Pig', '🐷', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:s vestido:s robo:n fazenda:q antigo:n ' +
      'recente:n europa:s escola:p familia-grande:p t-peppa:s'],
    ['george-peppa', 'George', '🦖', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:q desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:q rabo:s robo:n antigo:n recente:n europa:s ' +
      'escola:p t-peppa:s'],
    ['bluey', 'Bluey', '🐾', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:s pelo:s orelhas:p cachorro:s robo:n ' +
      'antigo:n recente:s escola:p t-peppa:s'],
    ['bingo', 'Bingo', '🧡', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:q rabo:s pelo:s orelhas:p cachorro:s robo:n ' +
      'antigo:n recente:s escola:p t-peppa:s'],
    ['bob-esponja', 'Bob Esponja', '🧽', 'IFA',
      'real:n pessoa:n bicho:q coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:p musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n agua:s antigo:s t-bob:s'],
    ['patrick', 'Patrick Estrela', '⭐', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n agua:s robo:n antigo:s t-bob:s'],
    ['lula-molusco', 'Lula Molusco', '🐙', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:p esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n careca:s agua:s robo:n antigo:s pintor:p t-bob:s'],
    ['siriguejo', 'Sr. Siriguejo', '🦀', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:q ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rico:s agua:s robo:n antigo:s t-bob:s'],
    ['sandy-bochechas', 'Sandy Bochechas', '🐿️', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:s rabo:s pelo:s forte:p agua:p robo:n ' +
      'antigo:s cientista:s estrangeiro-eua:s t-bob:s'],
    ['homer', 'Homer Simpson', '🍩', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n careca:s barba:p rabo:n pelo:n cachorro:n gato:n ' +
      'rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s estrangeiro-eua:s casado:s ' +
      'familia-grande:s t-simpsons:s'],
    ['marge', 'Marge Simpson', '💙', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:s cor-vermelho:n cor-verde:s cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n cabelo-comprido:s rabo:n pelo:n vestido:s ' +
      'cachorro:n gato:n rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s estrangeiro-eua:s ' +
      'casado:s familia-grande:s t-simpsons:s'],
    ['bart', 'Bart Simpson', '🛹', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:s cor-vermelho:s cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n cachorro:n gato:n rato:n urso:n ' +
      'passaro:n dinossauro:n monstro:n robo:n antigo:s estrangeiro-eua:s escola:s familia-grande:s t-simpsons:s'],
    ['lisa', 'Lisa Simpson', '🎷', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:s livro:n videogame:n internet:n tv:n disney:n canta:q musica:p esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n rabo:n pelo:n vestido:s cachorro:n gato:n rato:n ' +
      'urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s estrangeiro-eua:s escola:s familia-grande:s ' +
      't-simpsons:s'],
    ['scooby-doo', 'Scooby-Doo', '🐕', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:p desenho:s ' +
      'filme:s serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:p pequeno:n rabo:s pelo:s orelhas:p cachorro:s robo:n ' +
      'estimacao:s antigo:s detetive:s veiculo:p t-scooby:s'],
    ['salsicha', 'Salsicha', '🥪', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:s serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n barba:p cabelo-comprido:q rabo:n pelo:n ' +
      'cachorro:n gato:n rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s detetive:s veiculo:p ' +
      't-scooby:s'],
    ['velma', 'Velma', '🔍', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:s serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n oculos:s rabo:n pelo:n cachorro:n gato:n rato:n ' +
      'urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s cientista:p detetive:s veiculo:p t-scooby:s'],
    ['tom', 'Tom', '🐈', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:p ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:q cor-branco:p cor-marrom:n grande:n pequeno:n rabo:s pelo:s gato:s robo:n estimacao:s antigo:s ' +
      't-scooby:s'],
    ['jerry', 'Jerry', '🧀', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:s rabo:s pelo:s orelhas:s rato:s robo:n antigo:s ' +
      't-scooby:s'],
    ['pica-pau', 'Pica-Pau', '🐦', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:s engracado:s realeza:n cor-azul:s cor-vermelho:s cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n passaro:s robo:n selvagem:p antigo:s t-scooby:s'],
    ['pernalonga', 'Pernalonga', '🥕', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:p heroi:p vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:q cor-branco:p cor-marrom:n grande:n pequeno:n rabo:p pelo:s orelhas:s gato:n rato:n robo:n ' +
      'antigo:s t-scooby:s'],
    ['patolino', 'Patolino', '🦆', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:q ' +
      'magia:n voa:q engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:s cor-branco:p cor-marrom:n grande:n pequeno:n passaro:s agua:p robo:n antigo:s t-scooby:s'],
    ['piu-piu', 'Piu-Piu', '🐤', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:p feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:p musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:p engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s passaro:s robo:n estimacao:s antigo:s t-scooby:s'],
    ['frajola', 'Frajola', '🐈‍⬛', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:p ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:p cor-marrom:n grande:n pequeno:n rabo:s pelo:s gato:s robo:n estimacao:p antigo:s ' +
      't-scooby:s'],
    ['papa-leguas', 'Papa-Léguas', '💨', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:q engracado:s realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rapido:s passaro:s robo:n antigo:s t-scooby:s'],
    ['coiote', 'Coiote', '🐺', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:p ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n rabo:s pelo:s orelhas:s arma:p cachorro:p robo:n ' +
      'antigo:s cientista:p t-scooby:s'],
    ['monica', 'Mônica', '🐰', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:s fala:s desenho:s ' +
      'filme:s serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n vestido:s forte:s cachorro:n ' +
      'gato:n rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s escola:p t-monica:s'],
    ['cebolinha', 'Cebolinha', '🧅', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:s fala:s desenho:s ' +
      'filme:s serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:q ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n careca:p rabo:n pelo:n cachorro:n gato:n rato:n ' +
      'urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s escola:p t-monica:s'],
    ['cascao', 'Cascão', '☔', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:s fala:s desenho:s ' +
      'filme:s serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n cachorro:n gato:n rato:n urso:n ' +
      'passaro:n agua:n dinossauro:n monstro:n robo:n antigo:s escola:p t-monica:s'],
    ['magali', 'Magali', '🍉', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:s fala:s desenho:s ' +
      'filme:s serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n vestido:s cachorro:n gato:n rato:n ' +
      'urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s escola:p t-monica:s'],
    ['chico-bento', 'Chico Bento', '🌾', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:s fala:s desenho:s ' +
      'filme:p serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s rabo:n pelo:n cachorro:n gato:n rato:n ' +
      'urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s escola:p t-monica:s'],
    ['sansao', 'Sansão', '🐇', 'IFA',
      'real:n pessoa:n bicho:q coisa:p masculino:p feminino:n crianca:n idoso:n brasileiro:s fala:n desenho:s ' +
      'filme:p serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p orelhas:s antigo:s escola:n t-monica:s'],
    ['emilia', 'Emília', '🪆', 'IFA',
      'real:n pessoa:q bicho:n coisa:p masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:p ' +
      'filme:n serie:s livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:p voa:n engracado:s realeza:n cor-azul:n cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p vestido:s antigo:s t-sitio:s'],
    ['pedrinho', 'Pedrinho', '🏹', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:s fala:s desenho:p ' +
      'filme:n serie:s livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:p rabo:n pelo:n arma:p cachorro:n gato:n ' +
      'rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s pirata:p t-sitio:s'],
    ['narizinho', 'Narizinho', '🌼', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:s fala:s desenho:p ' +
      'filme:n serie:s livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n vestido:s cachorro:n gato:n rato:n ' +
      'urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s t-sitio:s'],
    ['visconde', 'Visconde de Sabugosa', '🌽', 'IFA',
      'real:n pessoa:q bicho:n coisa:p masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:p ' +
      'filme:n serie:s livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s comida:p antigo:s cientista:s t-sitio:s'],
    ['dona-benta', 'Dona Benta', '👵', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:s brasileiro:s fala:s desenho:p ' +
      'filme:n serie:s livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:q realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n oculos:s rabo:n pelo:n cachorro:n gato:n rato:n ' +
      'urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s familia-grande:p t-sitio:s'],
    ['cuca', 'Cuca', '🐊', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:n feminino:s crianca:n idoso:p brasileiro:s fala:s desenho:p ' +
      'filme:n serie:s livro:s videogame:n internet:n tv:n disney:n canta:p musica:n esporte:n heroi:q vilao:s ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n loiro:s rabo:s monstro:s robo:n antigo:s ' +
      'chapeu-magico:s folclore:s t-sitio:s'],
    ['galinha-pintadinha', 'Galinha Pintadinha', '🐔', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:s tv:n disney:n canta:s musica:s esporte:n heroi:q vilao:n ' +
      'magia:n voa:q engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n passaro:s robo:n fazenda:s antigo:n recente:p'],
    ['bita', 'Bita', '🎩', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:s ' +
      'filme:n serie:n livro:n videogame:n internet:s tv:n disney:n canta:s musica:s esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:s ruivo:p barba:s rabo:n pelo:n ' +
      'cachorro:n gato:n rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:n recente:s'],
    ['luna', 'Luna', '🔭', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:s fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:p musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:n cor-amarelo:n cor-rosa:? ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n cachorro:n gato:n rato:n urso:n ' +
      'passaro:n dinossauro:n monstro:n robo:n antigo:n recente:s cientista:s espaco:p'],
    ['masha', 'Masha', '👧', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:p tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s loiro:s rabo:n pelo:n vestido:s ' +
      'cachorro:n gato:n rato:n urso:n passaro:n dinossauro:n monstro:n robo:n selvagem:p antigo:n recente:s ' +
      'europa:s'],
    ['urso-masha', 'Urso (Masha e o Urso)', '🐻', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:p tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:s pequeno:n pelo:s urso:s robo:n selvagem:s antigo:n ' +
      'recente:s europa:s'],
    ['ben-10', 'Ben 10', '⌚', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:p cor-marrom:n grande:n pequeno:n rabo:n pelo:n cachorro:n gato:n rato:n urso:n ' +
      'passaro:n dinossauro:n monstro:q robo:n antigo:n espaco:s'],
    ['florzinha', 'Florzinha', '🌸', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:s engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s ruivo:s cabelo-comprido:s rabo:n pelo:n ' +
      'rapido:s forte:s cachorro:n gato:n rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s ' +
      'escola:p familia-grande:p'],
    ['lindinha', 'Lindinha', '🫧', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:s engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n loiro:s rabo:n pelo:n rapido:s forte:s ' +
      'cachorro:n gato:n rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s escola:p ' +
      'familia-grande:p'],
    ['docinho', 'Docinho', '💚', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:s engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n rapido:s forte:s cachorro:n gato:n ' +
      'rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s escola:p familia-grande:p'],
    ['finn', 'Finn', '⚔️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n chapeu:s loiro:p rabo:n pelo:n arma:s cachorro:n ' +
      'gato:n rato:n urso:n passaro:n dinossauro:n monstro:n robo:n recente:s pirata:p'],
    ['jake', 'Jake', '🌭', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:p vilao:n ' +
      'magia:s voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n rabo:s pelo:q cachorro:s robo:n recente:s ' +
      'pirata:p'],
    ['snoopy', 'Snoopy', '🐶', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:n serie:n livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:q engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:s cor-marrom:n grande:n pequeno:n rabo:s orelhas:p cachorro:s robo:n estimacao:s ' +
      'antigo:s dancar:p'],
    ['charlie-brown', 'Charlie Brown', '⚾', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:n serie:n livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:p heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n careca:p rabo:n pelo:n cachorro:n gato:n rato:n ' +
      'urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s escola:s'],
    ['garfield', 'Garfield', '🍝', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:n livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:s grande:n pequeno:n rabo:s pelo:s gato:s robo:n estimacao:s antigo:s'],
    ['popeye', 'Popeye', '💪', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:q brasileiro:n fala:s desenho:s ' +
      'filme:p serie:n livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:p cor-marrom:n grande:n pequeno:n chapeu:s rabo:n pelo:n forte:s cachorro:n gato:n ' +
      'rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s pirata:p casado:p'],
    ['pac-man', 'Pac-Man', '🟡', 'IFA',
      'real:n pessoa:n bicho:n coisa:q masculino:p feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rapido:p monstro:p robo:n antigo:s'],
    ['barbie', 'Barbie', '💖', 'IFA',
      'real:n pessoa:p bicho:n coisa:p masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:s serie:n livro:n videogame:n internet:n tv:n disney:n canta:p musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:p cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n loiro:s cabelo-comprido:s rabo:n pelo:n ' +
      'vestido:s rico:p cachorro:n gato:n rato:n urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s'],
    ['dora', 'Dora, a Aventureira', '🎒', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n rabo:n pelo:n cachorro:n gato:n rato:n urso:n ' +
      'passaro:n dinossauro:n monstro:n robo:n antigo:n recente:n pirata:s'],
    ['smurfette', 'Smurfette', '👱‍♀️', 'IFA',
      'real:n pessoa:q bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:n livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:s chapeu:s loiro:s cabelo-comprido:s rabo:n pelo:n ' +
      'vestido:s cachorro:n gato:n rato:n urso:n passaro:n dinossauro:n monstro:p robo:n selvagem:s antigo:s'],
    ['papai-smurf', 'Papai Smurf', '🧔', 'IFA',
      'real:n pessoa:q bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:s ' +
      'filme:p serie:n livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:p voa:n engracado:p realeza:n cor-azul:s cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:s barba:s rabo:n pelo:n cachorro:n gato:n ' +
      'rato:n urso:n passaro:n dinossauro:n monstro:p robo:n selvagem:s antigo:s chapeu-magico:p'],
    ['fred-flintstone', 'Fred Flintstone', '🦕', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:s grande:n pequeno:n rabo:n pelo:n forte:p cachorro:n gato:n rato:n ' +
      'urso:n passaro:n dinossauro:n monstro:n robo:n antigo:s historia:p veiculo:s casado:s']
  ];
  (raiz.QEPersonagens = raiz.QEPersonagens || {}).desenhos = L;
  if (typeof module === 'object' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
