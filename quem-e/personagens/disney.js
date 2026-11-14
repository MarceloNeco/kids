/* Quem é? — A Meleca Adivinha: personagens dos desenhos da Disney e da Pixar (clássicos e novos), com os nomes
   como são conhecidos no Brasil. Formato: o mesmo de personagens/familia.js. */
(function (raiz) {
  'use strict';
  var L = [
    ['mickey', 'Mickey Mouse', '🐭', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:s livro:s videogame:p internet:n tv:n disney:s canta:p musica:n esporte:n heroi:s vilao:n magia:q voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:p cor-rosa:n cor-preto:s cor-branco:p ' +
      'cor-marrom:n grande:n pequeno:q chapeu:n oculos:n rabo:s pelo:p orelhas:s capa:n vestido:n rico:q rato:s ' +
      'estimacao:n antigo:s recente:n estrangeiro-eua:s casado:s t-mickey:s'],
    ['minnie', 'Minnie Mouse', '🎀', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:s livro:s videogame:p internet:n tv:n disney:s canta:p musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:s cor-preto:p cor-branco:p ' +
      'cor-marrom:n grande:n pequeno:q chapeu:s oculos:n rabo:s orelhas:s capa:n vestido:s rato:s antigo:s recente:n ' +
      'estrangeiro-eua:s casado:s t-mickey:s'],
    ['pato-donald', 'Pato Donald', '🦆', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:p desenho:s filme:n ' +
      'serie:s livro:s videogame:p internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:s ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s oculos:n rabo:p capa:n vestido:n passaro:s agua:p antigo:s recente:n ' +
      'estrangeiro-eua:s casado:s familia-grande:p t-mickey:s'],
    ['margarida', 'Margarida', '🌸', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:s livro:s videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:q vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:s cor-preto:n cor-branco:s ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s oculos:n capa:n vestido:p passaro:s antigo:s recente:n casado:s ' +
      't-mickey:s'],
    ['pateta', 'Pateta', '🐶', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:s livro:s videogame:p internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:p cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n ' +
      'cor-marrom:p grande:n pequeno:n chapeu:s oculos:n pelo:p orelhas:s capa:n rapido:n forte:n cachorro:s antigo:s ' +
      'recente:n t-mickey:s'],
    ['pluto', 'Pluto', '🐕', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:s filme:n ' +
      'serie:s livro:p videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:q vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:p grande:n pequeno:n chapeu:n rabo:s pelo:s orelhas:p cachorro:s estimacao:s antigo:s recente:n ' +
      't-mickey:s'],
    ['tio-patinhas', 'Tio Patinhas', '💰', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:s filme:n ' +
      'serie:s livro:s videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:p cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s oculos:s barba:p arma:n rico:s passaro:s antigo:s recente:n pirata:p ' +
      'familia-grande:p t-mickey:s'],
    ['huguinho-zezinho-luizinho', 'Huguinho, Zezinho e Luizinho', '🐥', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:s livro:s videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:p cor-vermelho:p cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s oculos:n passaro:s antigo:s recente:n escola:s familia-grande:s ' +
      't-mickey:s'],
    ['ze-carioca', 'Zé Carioca', '🦜', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:s filme:n ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:s musica:p esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:p ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s passaro:s selvagem:p antigo:s recente:n dancar:p futebol:p t-mickey:s'],
    ['bafo-de-onca', 'João Bafo de Onça', '😼', 'FA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:s livro:s videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n ' +
      'cor-marrom:n grande:s pequeno:n forte:p gato:s antigo:s recente:n t-mickey:s'],
    ['tico-e-teco', 'Tico e Teco', '🐿️', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:? idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:s livro:p videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:s grande:n pequeno:s rabo:s pelo:s selvagem:s antigo:s recente:n detetive:p t-mickey:s'],
    ['branca-de-neve', 'Branca de Neve', '🍎', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:p ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:s cor-azul:s cor-vermelho:p cor-verde:n cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s loiro:n ruivo:n cabelo-comprido:n vestido:s selvagem:p antigo:s ' +
      'recente:n europa:p casado:s folclore:p t-princesas:s'],
    ['cinderela', 'Cinderela', '👠', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n magia:p voa:n ' +
      'engracado:? realeza:s cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p ' +
      'cor-marrom:n grande:n pequeno:n chapeu:p loiro:s cabelo-comprido:p vestido:s antigo:s recente:n casado:s ' +
      'familia-grande:p folclore:p t-princesas:s'],
    ['aurora', 'Aurora', '👑', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:p ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:s cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s loiro:s cabelo-comprido:s vestido:s selvagem:p antigo:s recente:n ' +
      'casado:s folclore:p t-princesas:s'],
    ['ariel', 'Ariel', '🧜‍♀️', 'IFA',
      'real:n pessoa:p bicho:q coisa:n masculino:n feminino:s crianca:q idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:p livro:s videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n magia:p voa:n ' +
      'engracado:? realeza:s cor-azul:n cor-vermelho:p cor-verde:s cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n ruivo:s cabelo-comprido:s rabo:s vestido:p agua:s antigo:s recente:n casado:s ' +
      'familia-grande:s t-princesas:s'],
    ['bela', 'Bela', '📚', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:p cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n loiro:n ruivo:n cabelo-comprido:p vestido:s antigo:s recente:n europa:s ' +
      'casado:s folclore:p t-princesas:s'],
    ['jasmine', 'Jasmine', '🐯', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n magia:n voa:p ' +
      'engracado:? realeza:s cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n chapeu:p cabelo-comprido:s vestido:q rico:s antigo:s recente:n casado:s ' +
      't-princesas:s'],
    ['pocahontas', 'Pocahontas', '🍃', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:p cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:s grande:n pequeno:n chapeu:n cabelo-comprido:s vestido:s agua:p selvagem:s antigo:s recente:n ' +
      'historia:p t-princesas:s'],
    ['mulan', 'Mulan', '⚔️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:p cor-verde:p cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n cabelo-comprido:p vestido:p arma:s forte:s antigo:s recente:n historia:p ' +
      'familia-grande:p folclore:s t-princesas:s'],
    ['tiana', 'Tiana', '🐸', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n magia:p voa:n ' +
      'engracado:? realeza:s cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n chapeu:p cabelo-comprido:q vestido:s antigo:n recente:n casado:s t-princesas:s'],
    ['rapunzel', 'Rapunzel', '🌼', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:p livro:p videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n magia:s voa:n ' +
      'engracado:? realeza:s cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n loiro:s cabelo-comprido:s vestido:s arma:p antigo:n recente:p casado:s ' +
      'folclore:p t-princesas:s'],
    ['merida', 'Merida', '🏹', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:p voa:n ' +
      'engracado:? realeza:s cor-azul:p cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n ruivo:s cabelo-comprido:s vestido:s arma:s forte:p selvagem:p antigo:n ' +
      'recente:s europa:s familia-grande:s t-princesas:s'],
    ['moana', 'Moana', '🌊', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:p idoso:n brasileiro:n fala:s desenho:s filme:p ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n magia:q voa:n ' +
      'engracado:? realeza:p cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p ' +
      'cor-marrom:n grande:n pequeno:n cabelo-comprido:s vestido:p agua:p antigo:n recente:s pirata:p t-princesas:s'],
    ['raya', 'Raya', '🐉', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:p cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:p grande:n pequeno:n chapeu:s capa:s arma:s forte:p antigo:n recente:s pirata:p t-princesas:s'],
    ['elsa', 'Elsa', '❄️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:q magia:s voa:n ' +
      'engracado:? realeza:s cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p ' +
      'cor-marrom:n grande:n pequeno:n loiro:s cabelo-comprido:s capa:p vestido:s arma:n antigo:n recente:s casado:n ' +
      't-frozen:s'],
    ['anna', 'Anna', '🌷', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:p realeza:s cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p cor-preto:p cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n ruivo:s cabelo-comprido:p capa:p vestido:s antigo:n recente:s casado:p ' +
      't-frozen:s'],
    ['olaf', 'Olaf', '⛄', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:p vilao:n magia:p voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s ' +
      'cor-marrom:p grande:n pequeno:n monstro:p antigo:n recente:s festa:p t-frozen:s'],
    ['kristoff', 'Kristoff', '🏔️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:p musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:p grande:n pequeno:n chapeu:p loiro:s forte:s antigo:n recente:s veiculo:p casado:p t-frozen:s'],
    ['sven', 'Sven', '🦌', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:s grande:s pequeno:n rabo:p pelo:s selvagem:p estimacao:p antigo:n recente:s t-frozen:s'],
    ['mirabel', 'Mirabel', '🦋', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:p idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:p ' +
      'cor-marrom:n grande:n pequeno:n oculos:s cabelo-comprido:q vestido:s antigo:n recente:s familia-grande:s'],
    ['bruno', 'Bruno Madrigal', '🔮', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:p vilao:n magia:s voa:n ' +
      'engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n barba:p cabelo-comprido:q capa:s antigo:n recente:s familia-grande:s'],
    ['luisa', 'Luisa Madrigal', '💪', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:p vilao:n magia:s voa:n ' +
      'engracado:? realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p ' +
      'cor-marrom:n grande:p pequeno:n vestido:p forte:s antigo:n recente:s familia-grande:s'],
    ['isabela', 'Isabela Madrigal', '🌺', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:p vilao:q magia:s voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n cabelo-comprido:s vestido:s antigo:n recente:s familia-grande:s'],
    ['woody', 'Woody', '🤠', 'IFA',
      'real:n pessoa:q bicho:n coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:p grande:n pequeno:n chapeu:s antigo:s recente:n pirata:s t-toy-story:s'],
    ['buzz-lightyear', 'Buzz Lightyear', '🚀', 'IFA',
      'real:n pessoa:q bicho:n coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:p ' +
      'engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:s ' +
      'cor-marrom:n grande:n pequeno:n arma:p robo:q antigo:s recente:n espaco:s t-toy-story:s'],
    ['jessie', 'Jessie', '🐄', 'IFA',
      'real:n pessoa:q bicho:n coisa:p masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:p musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:p cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s ruivo:s cabelo-comprido:p antigo:p recente:n pirata:s t-toy-story:s'],
    ['sr-cabeca-de-batata', 'Sr. Cabeça de Batata', '🥔', 'IFA',
      'real:n pessoa:n bicho:n coisa:s masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:q vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:s grande:n pequeno:n chapeu:s oculos:p barba:s orelhas:p comida:p antigo:s recente:n casado:s ' +
      't-toy-story:s'],
    ['rex', 'Rex', '🦖', 'IFA',
      'real:n pessoa:n bicho:p coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n rabo:s dinossauro:s antigo:s recente:n t-toy-story:s'],
    ['porquinho', 'Porquinho', '🐷', 'IFA',
      'real:n pessoa:n bicho:p coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:q vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n rico:p fazenda:p antigo:s recente:n t-toy-story:s'],
    ['bala-no-alvo', 'Bala no Alvo', '🐴', 'IFA',
      'real:n pessoa:n bicho:p coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:s grande:n pequeno:n rabo:s pelo:p rapido:s fazenda:p antigo:p recente:n t-toy-story:s'],
    ['garfinho', 'Garfinho', '🍴', 'IFA',
      'real:n pessoa:n bicho:n coisa:s masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s ' +
      'cor-marrom:n grande:n pequeno:s antigo:n recente:s t-toy-story:s'],
    ['lotso', 'Lotso', '🧸', 'IFA',
      'real:n pessoa:n bicho:p coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n pelo:s urso:s antigo:n recente:p t-toy-story:s'],
    ['relampago-mcqueen', 'Relâmpago McQueen', '🏎️', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:s heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n rapido:s robo:p antigo:n recente:n corrida:s veiculo:s t-carros:s'],
    ['mate', 'Mate', '🚛', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:s grande:n pequeno:n robo:p antigo:n recente:n veiculo:s t-carros:s'],
    ['nemo', 'Nemo', '🐠', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p ' +
      'cor-marrom:s grande:n pequeno:s agua:s estimacao:p antigo:n recente:n escola:s t-nemo:s'],
    ['dory', 'Dory', '🐟', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:s agua:s antigo:n recente:n t-nemo:s'],
    ['marlin', 'Marlin', '🐡', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p ' +
      'cor-marrom:s grande:n pequeno:s agua:s antigo:n recente:n t-nemo:s'],
    ['alegria', 'Alegria', '😄', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n vestido:s antigo:n recente:s t-divertida:s'],
    ['tristeza', 'Tristeza', '😢', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:q realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n oculos:s antigo:n recente:s t-divertida:s'],
    ['raiva', 'Raiva', '😡', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:q vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n careca:p antigo:n recente:s t-divertida:s'],
    ['medo', 'Medo', '😱', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:q vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n antigo:n recente:s t-divertida:s'],
    ['nojinho', 'Nojinho', '🤢', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:q vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n cabelo-comprido:p antigo:n recente:s t-divertida:s'],
    ['ansiedade', 'Ansiedade', '😬', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:q vilao:q magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:s grande:n pequeno:n cabelo-comprido:p antigo:n recente:s t-divertida:s'],
    ['sulley', 'Sulley', '💙', 'IFA',
      'real:n pessoa:n bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:s pequeno:n rabo:s pelo:s forte:s monstro:s antigo:n recente:n'],
    ['mike-wazowski', 'Mike Wazowski', '👁️', 'IFA',
      'real:n pessoa:n bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n monstro:s antigo:n recente:n'],
    ['boo', 'Boo', '👧', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:q desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n antigo:n recente:n'],
    ['sr-incrivel', 'Sr. Incrível', '🦸', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n ' +
      'cor-marrom:n grande:p pequeno:n careca:p capa:s forte:s antigo:n recente:n casado:s familia-grande:s'],
    ['mulher-elastica', 'Mulher-Elástica', '🦸‍♀️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n capa:s antigo:n recente:n veiculo:p casado:s familia-grande:s'],
    ['flecha', 'Flecha', '⚡', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n loiro:s capa:s rapido:s antigo:n recente:n escola:s familia-grande:s'],
    ['violeta', 'Violeta', '🫥', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n cabelo-comprido:s capa:s antigo:n recente:n escola:s familia-grande:s'],
    ['zeze', 'Zezé', '👶', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:n desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:s voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n antigo:n recente:n familia-grande:s'],
    ['edna-moda', 'Edna Moda', '👓', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:p brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:q vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n oculos:s rico:p antigo:n recente:n pintor:p'],
    ['remy', 'Remy', '🐀', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:s chapeu:p rabo:s pelo:s rato:s antigo:n recente:n europa:s'],
    ['carl', 'Carl Fredricksen', '🎈', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:p ' +
      'engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:p grande:n pequeno:n oculos:s antigo:n recente:n pirata:p casado:p'],
    ['russell', 'Russell', '🧭', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:p grande:n pequeno:n chapeu:s antigo:n recente:n pirata:p escola:p'],
    ['wall-e', 'WALL-E', '🤖', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:q desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:p grande:n pequeno:n robo:s antigo:n recente:n espaco:p'],
    ['eva', 'Eva', '🛸', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:q desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:s ' +
      'engracado:? realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s ' +
      'cor-marrom:n grande:n pequeno:n arma:p robo:s antigo:n recente:n espaco:s'],
    ['miguel', 'Miguel', '🎸', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:s esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n antigo:n recente:s familia-grande:s festa:s'],
    ['lilo', 'Lilo', '🌺', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:p livro:q videogame:q internet:n tv:n disney:s canta:p musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n cabelo-comprido:s vestido:s agua:p antigo:n recente:n'],
    ['stitch', 'Stitch', '👽', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:s livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n pelo:p orelhas:s forte:s monstro:s estimacao:p antigo:n recente:n espaco:s'],
    ['simba', 'Simba', '🦁', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:s cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:p grande:n pequeno:n rabo:s pelo:s gato:s selvagem:s antigo:s recente:n t-rei-leao:s'],
    ['mufasa', 'Mufasa', '👑', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:s cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:p grande:s pequeno:n rabo:s pelo:s forte:s gato:s selvagem:s antigo:s recente:n t-rei-leao:s'],
    ['scar', 'Scar', '🦁', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:n vilao:s magia:n voa:n ' +
      'engracado:? realeza:p cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n ' +
      'cor-marrom:s grande:n pequeno:n rabo:s pelo:s gato:s selvagem:s antigo:s recente:n t-rei-leao:s'],
    ['timao', 'Timão', '🦦', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:s grande:n pequeno:p rabo:s orelhas:s selvagem:s antigo:s recente:n t-rei-leao:s'],
    ['pumba', 'Pumba', '🐗', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:s grande:n pequeno:n rabo:s selvagem:s antigo:s recente:n t-rei-leao:s'],
    ['rafiki', 'Rafiki', '🐒', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:p voa:n ' +
      'engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:p grande:n pequeno:n barba:s rabo:s arma:p selvagem:s antigo:s recente:n t-rei-leao:s'],
    ['nala', 'Nala', '🐾', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:? realeza:s cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n rabo:s pelo:s gato:s selvagem:s antigo:s recente:n casado:s t-rei-leao:s'],
    ['aladdin', 'Aladdin', '🪔', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n magia:n voa:p ' +
      'engracado:? realeza:p cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:p ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s antigo:s recente:n pirata:p casado:s'],
    ['genio', 'Gênio', '🧞', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:p vilao:n magia:s voa:s ' +
      'engracado:s realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:s pequeno:n careca:p barba:p antigo:s recente:n'],
    ['jafar', 'Jafar', '🐍', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s barba:s arma:s antigo:s recente:n chapeu-magico:s'],
    ['ursula', 'Úrsula', '🐙', 'IFA',
      'real:n pessoa:p bicho:p coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:n vilao:s magia:s voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s cor-preto:p cor-branco:n ' +
      'cor-marrom:n grande:s pequeno:n cabelo-comprido:n agua:s antigo:s recente:n chapeu-magico:s'],
    ['sebastiao', 'Sebastião', '🦀', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:p ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:p esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:s agua:s antigo:s recente:n'],
    ['linguado', 'Linguado', '🐡', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s filme:p ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:p agua:s antigo:s recente:n'],
    ['fera', 'Fera', '🌹', 'IFA',
      'real:n pessoa:p bicho:p coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:q magia:p voa:n ' +
      'engracado:? realeza:s cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:s grande:s pequeno:n rabo:p pelo:s forte:s monstro:p antigo:s recente:n casado:s'],
    ['lumiere', 'Lumière', '🕯️', 'IFA',
      'real:n pessoa:n bicho:n coisa:s masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:p vilao:n magia:p voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:p antigo:s recente:n europa:s'],
    ['gaston', 'Gaston', '🏹', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:n vilao:s magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n cabelo-comprido:p arma:s forte:s antigo:s recente:n europa:s'],
    ['peter-pan', 'Peter Pan', '🧒', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:p voa:s ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s ruivo:p arma:s antigo:s recente:n pirata:p'],
    ['sininho', 'Sininho', '🧚', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:n desenho:s filme:p ' +
      'serie:p livro:s videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:s voa:s ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:s loiro:s vestido:s antigo:s recente:n chapeu-magico:s'],
    ['capitao-gancho', 'Capitão Gancho', '🏴‍☠️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:p ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s barba:s cabelo-comprido:s arma:s rico:p antigo:s recente:n pirata:s'],
    ['rainha-ma', 'Rainha Má', '🪞', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:p brasileiro:n fala:s desenho:s filme:p ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n ' +
      'engracado:? realeza:s cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:p cor-preto:s cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s capa:s vestido:s antigo:s recente:n chapeu-magico:s'],
    ['malevola', 'Malévola', '🖤', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:p ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:p cor-preto:s cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s capa:s vestido:s arma:s dinossauro:p antigo:s recente:n ' +
      'chapeu-magico:s'],
    ['cruella', 'Cruella', '🧥', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:s ' +
      'cor-marrom:n grande:n pequeno:n rico:s antigo:s recente:n veiculo:s'],
    ['dumbo', 'Dumbo', '🐘', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:n desenho:s filme:s ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:s ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:p pequeno:n chapeu:p rabo:s orelhas:s antigo:s recente:n'],
    ['bambi', 'Bambi', '🦌', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:s grande:n pequeno:n rabo:p pelo:s orelhas:p selvagem:s antigo:s recente:n'],
    ['pinoquio', 'Pinóquio', '🤥', 'IFA',
      'real:n pessoa:p bicho:n coisa:p masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:p voa:n ' +
      'engracado:? realeza:n cor-azul:p cor-vermelho:p cor-verde:n cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s antigo:s recente:n europa:s escola:s'],
    ['grilo-falante', 'Grilo Falante', '🦗', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:s chapeu:s inseto:s antigo:s recente:n'],
    ['alice', 'Alice', '🐇', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p ' +
      'cor-marrom:n grande:n pequeno:n chapeu:p loiro:s cabelo-comprido:s vestido:s antigo:s recente:n europa:s'],
    ['chapeleiro-maluco', 'Chapeleiro Maluco', '🎩', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:q vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s antigo:s recente:n europa:s'],
    ['mogli', 'Mogli', '🐺', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:p musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n cabelo-comprido:p selvagem:s antigo:s recente:n'],
    ['baloo', 'Balu', '🐻', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:p ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:s pequeno:n pelo:s urso:s selvagem:s antigo:s recente:n'],
    ['hercules', 'Hércules', '⚡', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:p voa:p ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p ' +
      'cor-marrom:p grande:p pequeno:n ruivo:p arma:s forte:s antigo:s recente:n historia:p europa:s folclore:s'],
    ['tarzan', 'Tarzan', '🌴', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:s ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:p grande:n pequeno:n cabelo-comprido:s forte:s selvagem:s antigo:s recente:n'],
    ['os-sete-anoes', 'Os Sete Anões', '⛏️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:s videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:p grande:n pequeno:q chapeu:s barba:s antigo:s recente:n familia-grande:p'],
    ['judy-hopps', 'Judy Hopps', '🐰', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:p rabo:p pelo:s orelhas:s rapido:p antigo:n recente:s professor:s detetive:s'],
    ['nick-wilde', 'Nick Wilde', '🦊', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:s grande:n pequeno:n rabo:s pelo:s orelhas:p antigo:n recente:s detetive:p'],
    ['maui', 'Maui', '🏝️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:p ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:p vilao:n magia:s voa:p ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:p grande:s pequeno:n cabelo-comprido:s arma:s forte:s antigo:n recente:s folclore:s'],
    ['flynn', 'Flynn Rider', '🗝️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:p grande:n pequeno:n barba:p antigo:n recente:p pirata:p casado:s'],
    ['flik', 'Flik', '🐜', 'FA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:s inseto:s antigo:s recente:n cientista:p'],
    ['asha', 'Asha', '⭐', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:s musica:n esporte:n heroi:s vilao:n magia:p voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n cabelo-comprido:s vestido:p antigo:n recente:s'],
    ['faisca', 'Faísca', '🔥', 'FA',
      'real:n pessoa:p bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:p voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:p grande:n pequeno:n antigo:n recente:s'],
    ['gota', 'Gota', '💧', 'FA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n agua:s antigo:n recente:s'],
    ['luca', 'Luca', '🐟', 'IFA',
      'real:n pessoa:p bicho:p coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:p cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n rabo:p agua:s monstro:p antigo:n recente:s europa:s veiculo:p'],
    ['mei', 'Mei', '🐼', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:p voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n oculos:s pelo:p urso:p antigo:n recente:s escola:s'],
    ['joe-gardner', 'Joe Gardner', '🎹', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:q internet:n tv:n disney:s canta:n musica:s esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:n grande:n pequeno:n chapeu:s oculos:s antigo:n recente:s professor:s'],
    ['ralph', 'Detona Ralph', '🧱', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:q livro:q videogame:s internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:? realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n ' +
      'cor-marrom:p grande:s pequeno:n forte:s antigo:n recente:s'],
    ['baymax', 'Baymax', '🤍', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:p feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s filme:n ' +
      'serie:p livro:q videogame:q internet:n tv:n disney:s canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:p ' +
      'engracado:s realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s ' +
      'cor-marrom:n grande:s pequeno:n robo:s antigo:n recente:s professor:s']
  ];
  (raiz.QEPersonagens = raiz.QEPersonagens || {}).disney = L;
  if (typeof module === 'object' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
