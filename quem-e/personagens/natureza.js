/* Quem é? — A Meleca Adivinha: a natureza e o dia a dia de verdade — bichos (de estimação, raças de cachorro e gato,
   fazenda, savana, bichos do Brasil, mar e rio, insetos, aves, répteis e dinossauros), coisas (comidas e doces
   brasileiros, frutas, brinquedos, casa e escola, veículos, céu e natureza, instrumentos) e profissões (genéricas).
   Formato igual ao de personagens/familia.js; perguntas em adivinha-perguntas.js. */
(function (raiz) {
  'use strict';
  var L = [
    ['vira-lata-caramelo', 'Vira-lata caramelo', '🐕', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:p tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:p cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:q ' +
      'capa:n vestido:n arma:n rapido:p forte:? rico:n cachorro:s gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:q estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n europa:n'],
    ['poodle', 'Poodle', '🐩', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:s cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:p ' +
      'capa:n vestido:n arma:n rapido:q forte:n rico:n cachorro:s gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:q estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n europa:s cabelo-comprido:q'],
    ['cachorro-salsicha', 'Cachorro salsicha (dachshund)', '🌭', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:p cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:s ' +
      'capa:n vestido:n arma:n rapido:q forte:n rico:n cachorro:s gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:q estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n europa:s'],
    ['golden-retriever', 'Golden retriever', '🦮', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:q pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:p ' +
      'capa:n vestido:n arma:n rapido:p forte:p rico:n cachorro:s gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:q estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n europa:s'],
    ['pug', 'Pug', '🐶', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:s cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:? cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n ' +
      'capa:n vestido:n arma:n rapido:n forte:n rico:n cachorro:s gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:q estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n europa:q estrangeiro-eua:n'],
    ['husky-siberiano', 'Husky siberiano', '🐺', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:q cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:s cor-marrom:n grande:q pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:q ' +
      'capa:n vestido:n arma:n rapido:s forte:s rico:n cachorro:s gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:q estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:? escola:n folclore:n festa:n europa:q'],
    ['dalmata', 'Dálmata', '🐕', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:s cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n ' +
      'capa:n vestido:n arma:n rapido:s forte:p rico:n cachorro:s gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:q estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n europa:s professor:?'],
    ['pastor-alemao', 'Pastor-alemão', '🐕‍🦺', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:s grande:q pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:p ' +
      'capa:n vestido:n arma:n rapido:s forte:s rico:n cachorro:s gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:q estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n europa:s professor:p detetive:p'],
    ['chihuahua', 'Chihuahua', '🐕', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:? cor-marrom:p grande:n pequeno:p chapeu:n oculos:n rabo:s pelo:s orelhas:s ' +
      'capa:n vestido:n arma:n rapido:? forte:n rico:n cachorro:s gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:q estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n europa:n estrangeiro-eua:n'],
    ['sao-bernardo', 'São-bernardo', '🐕', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:s grande:p pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:p ' +
      'capa:n vestido:n arma:n rapido:n forte:s rico:n cachorro:s gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:q estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n europa:s'],
    ['shih-tzu', 'Shih-tzu', '🐶', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:p grande:n pequeno:n chapeu:p oculos:n rabo:s pelo:s orelhas:n ' +
      'capa:n vestido:n arma:n rapido:n forte:n rico:n cachorro:s gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:q estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n cabelo-comprido:s europa:n'],
    ['gato-siames', 'Gato siamês', '🐈', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:q cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:p cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:p ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:s rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:q estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n europa:n'],
    ['gato-persa', 'Gato persa', '🐈', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:n rico:? cachorro:n gato:s rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:q estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n cabelo-comprido:p europa:n'],
    ['gato-preto', 'Gato preto', '🐈‍⬛', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n ' +
      'capa:n vestido:n arma:n rapido:s forte:n rico:n cachorro:n gato:s rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:q estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:p festa:p'],
    ['calopsita', 'Calopsita', '🐦', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:q desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:p musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:p grande:n pequeno:q chapeu:q oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['periquito', 'Periquito', '🐦', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:q desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:p musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s realeza:n engracado:? cor-azul:p cor-vermelho:n cor-verde:s cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['porquinho-da-india', 'Porquinho-da-índia', '🐹', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:p cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:? cor-branco:p cor-marrom:p grande:n pequeno:q chapeu:n oculos:n rabo:n pelo:s orelhas:n ' +
      'capa:n vestido:n arma:n rapido:n forte:n rico:n cachorro:n gato:n rato:q urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:s comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['galo', 'Galo', '🐓', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:p musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:q realeza:n engracado:? cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:p grande:n pequeno:n chapeu:q oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:s estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['pintinho', 'Pintinho', '🐥', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:s idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:p cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:s estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['peru', 'Peru', '🦃', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:q realeza:n engracado:? cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:n forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:s estimacao:n comida:p historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:s'],
    ['touro', 'Touro', '🐂', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:q heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:p grande:s pequeno:n chapeu:q oculos:n rabo:s pelo:p orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:s estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['ganso', 'Ganso', '🪿', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:p realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:p ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:s estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['ponei', 'Pônei', '🐴', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:? cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:p estimacao:p comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n cabelo-comprido:p'],
    ['guepardo', 'Guepardo (chita)', '🐆', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:q pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n ' +
      'capa:n vestido:n arma:n rapido:s forte:p rico:n cachorro:n gato:s rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['hiena', 'Hiena', '🐾', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:p cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:? cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:p ' +
      'capa:n vestido:n arma:n rapido:p forte:p rico:n cachorro:q gato:q rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['avestruz', 'Avestruz', '🦤', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:p cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:s forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:p fazenda:q estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['ema', 'Ema', '🪶', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:p grande:q pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:s forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['orangotango', 'Orangotango', '🦧', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:q pequeno:n chapeu:n oculos:n rabo:n pelo:s orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n ruivo:p cabelo-comprido:p'],
    ['rena', 'Rena', '🦌', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:s grande:n pequeno:n chapeu:q oculos:n rabo:q pelo:s orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:p fazenda:q estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:s'],
    ['veado', 'Veado (cervo)', '🦌', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:q oculos:n rabo:p pelo:s orelhas:p ' +
      'capa:n vestido:n arma:n rapido:s forte:q rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['suricato', 'Suricato', '🐾', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:p cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:q chapeu:n oculos:n rabo:s pelo:s orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['guaxinim', 'Guaxinim', '🦝', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:p cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:p cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n ' +
      'capa:p vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['mico-leao-dourado', 'Mico-leão-dourado', '🐒', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:q chapeu:n oculos:n rabo:s pelo:s orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n cabelo-comprido:p'],
    ['sagui', 'Sagui', '🐒', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:p cor-marrom:n grande:n pequeno:p chapeu:n oculos:n rabo:s pelo:s orelhas:p ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['quati', 'Quati', '🦝', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:p cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['ariranha', 'Ariranha', '🦦', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:s grande:q pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['lobo-guara', 'Lobo-guará', '🐺', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:s ' +
      'capa:n vestido:n arma:n rapido:p forte:p rico:n cachorro:p gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['jabuti', 'Jabuti', '🐢', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:q pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:n forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:p festa:n'],
    ['tatu-bola', 'Tatu-bola', '🐾', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:q heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['anta', 'Anta', '🐗', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:p grande:p pequeno:n chapeu:n oculos:n rabo:q pelo:q orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:p ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['jaguatirica', 'Jaguatirica', '🐆', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:p rico:n cachorro:n gato:s rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['sucuri', 'Sucuri', '🐍', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:p ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['tuiuiu', 'Tuiuiú', '🐦', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s realeza:n engracado:? cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:s cor-marrom:n grande:p pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:p ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['bem-te-vi', 'Bem-te-vi', '🐦', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:q desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:s musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:s cor-branco:p cor-marrom:n grande:n pequeno:p chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['joao-de-barro', 'João-de-barro', '🐦', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:p chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['peixe-boi', 'Peixe-boi', '🐋', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:p cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:n forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:q fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['piranha', 'Piranha', '🐟', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:q chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['pirarucu', 'Pirarucu', '🐟', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:? forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:p historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['orca', 'Orca', '🐋', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:s cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:s forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['foca', 'Foca', '🦭', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:q fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:p cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:p cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:q pelo:p orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['agua-viva', 'Água-viva', '🪼', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:? chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:n forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['lagosta', 'Lagosta', '🦞', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:p historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['camarao', 'Camarão', '🦐', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:s chapeu:n oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:s historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['peixe-palhaco', 'Peixe-palhaço', '🐠', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:s cor-marrom:s grande:n pequeno:p chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:p comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['baiacu', 'Baiacu', '🐡', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:s cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:n forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['tartaruga-marinha', 'Tartaruga-marinha', '🐢', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:p fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:q pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['mosquito', 'Mosquito (pernilongo)', '🦟', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:q ' +
      'magia:n voa:s realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:s dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['mosca', 'Mosca', '🪰', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:? cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:s forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:s dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['grilo', 'Grilo', '🦗', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:p musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:q realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:s dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['gafanhoto', 'Gafanhoto', '🦗', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:p realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:s dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['libelula', 'Libélula', '🪽', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s realeza:n engracado:? cor-azul:p cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:s forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:q ' +
      'inseto:s dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['vaga-lume', 'Vaga-lume', '✨', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:s dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['besouro', 'Besouro', '🪲', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:p realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:s dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['barata', 'Barata', '🪳', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:q ' +
      'magia:n voa:p realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:s forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:s dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['escorpiao', 'Escorpião', '🦂', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:p grande:n pequeno:p chapeu:n oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:? rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:p dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['lagarta', 'Lagarta', '🐛', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:p idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:? orelhas:n ' +
      'capa:n vestido:n arma:n rapido:n forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:s dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['caracol', 'Caracol', '🐌', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:s chapeu:n oculos:n rabo:? pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:n forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:q ' +
      'inseto:p dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:q comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['pombo', 'Pombo', '🕊️', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:p cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['pavao', 'Pavão', '🦚', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:q realeza:n engracado:? cor-azul:s cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:q pequeno:n chapeu:q oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:p estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['gaivota', 'Gaivota', '🐦', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:s cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:p ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['cisne', 'Cisne', '🦢', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:p realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:q cor-branco:s cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:p ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['urubu', 'Urubu', '🐦‍⬛', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:q ' +
      'magia:n voa:s realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n careca:p'],
    ['pelicano', 'Pelicano', '🐦', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:q pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:p ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['crocodilo', 'Crocodilo', '🐊', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:p ' +
      'inseto:n dinossauro:q monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['iguana', 'Iguana', '🦎', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:p fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:q forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:p comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['cascavel', 'Cascavel', '🐍', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:? rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['perereca', 'Perereca', '🐸', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:p ' +
      'inseto:n dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['dragao-de-komodo', 'Dragão-de-komodo', '🦎', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:? cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:p pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:q monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n'],
    ['triceratops', 'Tricerátops', '🦕', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:s pequeno:n chapeu:q oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:n forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:s monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:s espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n vivo:n'],
    ['velociraptor', 'Velocirraptor', '🦖', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:? cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:s forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:? agua:n ' +
      'inseto:n dinossauro:s monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:s espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n vivo:n t-jurassic:p'],
    ['pterodactilo', 'Pterodáctilo', '🦅', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:q agua:n ' +
      'inseto:n dinossauro:p monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:s espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n vivo:n'],
    ['braquiossauro', 'Braquiossauro', '🦕', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:n forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:s monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:s espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n vivo:n'],
    ['estegossauro', 'Estegossauro', '🦕', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:? cor-verde:p cor-amarelo:? cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:? grande:s pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:n forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:s monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:s espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n vivo:n'],
    ['espinossauro', 'Espinossauro', '🦖', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:? cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:s pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n ' +
      'capa:n vestido:n arma:n rapido:p forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:p ' +
      'inseto:n dinossauro:s monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:s espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n vivo:n'],
    ['mamute', 'Mamute', '🦣', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:s pequeno:n chapeu:n oculos:n rabo:p pelo:s orelhas:q ' +
      'capa:n vestido:n arma:n rapido:q forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n ' +
      'inseto:n dinossauro:q monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:s espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n vivo:n'],
    ['coxinha', 'Coxinha', '🍗', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:p'],
    ['pastel', 'Pastel', '🥟', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:q chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:?'],
    ['pipoca', 'Pipoca', '🍿', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:p'],
    ['feijoada', 'Feijoada', '🍲', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['acai', 'Açaí', '🫐', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:q cor-branco:n cor-marrom:n grande:n pequeno:? chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:q fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['cachorro-quente', 'Cachorro-quente', '🌭', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:q fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:p ' +
      'estrangeiro-eua:p'],
    ['hamburguer', 'Hambúrguer', '🍔', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:q fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:p cor-verde:p cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:n ' +
      'estrangeiro-eua:p'],
    ['batata-frita', 'Batata frita', '🍟', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:q fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:q cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:n europa:p'],
    ['pacoca', 'Paçoca', '🥜', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:s'],
    ['pudim', 'Pudim', '🍮', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:p'],
    ['morango', 'Morango', '🍓', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:s cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:?'],
    ['melancia', 'Melancia', '🍉', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:s cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['abacaxi', 'Abacaxi', '🍍', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:p fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:p oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['uva', 'Uva', '🍇', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['laranja', 'Laranja', '🍊', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:q chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['jabuticaba', 'Jabuticaba', '🫐', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['coco', 'Coco', '🥥', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['limao', 'Limão', '🍋', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['pipa', 'Pipa', '🪁', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s realeza:n engracado:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:q'],
    ['ioio', 'Ioiô', '🪀', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:? cor-vermelho:? cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n rapido:p'],
    ['peao', 'Pião', '🌀', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:? cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:? grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:q rapido:s'],
    ['bambole', 'Bambolê', '⭕', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:q heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['boneca', 'Boneca', '🪆', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:p crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:q chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n ' +
      'cabelo-comprido:p'],
    ['carrinho', 'Carrinho de brinquedo', '🏎️', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:? cor-vermelho:? cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:q selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:p escola:n folclore:n festa:n rapido:p'],
    ['cubo-magico', 'Cubo mágico', '🟩', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:s cor-vermelho:s cor-verde:s cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:s grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n europa:p'],
    ['videogame', 'Videogame', '🎮', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:s internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:? cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:p selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['quebra-cabeca', 'Quebra-cabeça', '🧩', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:? cor-vermelho:? cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:q chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:p folclore:n festa:n'],
    ['ursinho-de-pelucia', 'Ursinho de pelúcia', '🧸', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:q chapeu:n oculos:n rabo:q pelo:s orelhas:q ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:p passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['balao', 'Balão de festa (bexiga)', '🎈', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:p realeza:n engracado:n cor-azul:? cor-vermelho:p cor-verde:n cor-amarelo:? cor-rosa:? ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:q chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:s'],
    ['mochila', 'Mochila', '🎒', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:? cor-vermelho:? cor-verde:n cor-amarelo:n cor-rosa:? ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:s folclore:n festa:n'],
    ['escova-de-dentes', 'Escova de dentes', '🪥', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:? cor-vermelho:? cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:? cor-marrom:n grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['relogio', 'Relógio', '⏰', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:p selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:? folclore:n festa:n'],
    ['vassoura', 'Vassoura', '🧹', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n ' +
      'chapeu-magico:q'],
    ['helicoptero', 'Helicóptero', '🚁', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:p selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:s escola:n folclore:n festa:n rapido:s'],
    ['navio', 'Navio', '🚢', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:? cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s inseto:n dinossauro:n monstro:n ' +
      'robo:p selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:s escola:n folclore:n festa:n rapido:q ' +
      'forte:s'],
    ['skate', 'Skate', '🛹', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:p heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:p escola:n folclore:n festa:n rapido:p'],
    ['onibus', 'Ônibus', '🚌', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:p selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:s escola:p folclore:n festa:n rapido:q'],
    ['caminhao-de-bombeiro', 'Caminhão de bombeiro', '🚒', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:p selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:s escola:n folclore:n festa:n rapido:p ' +
      'forte:s professor:p'],
    ['ambulancia', 'Ambulância', '🚑', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:p selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:s escola:n folclore:n festa:n rapido:p ' +
      'professor:p'],
    ['moto', 'Moto', '🏍️', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:p selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:s escola:n folclore:n festa:n rapido:s ' +
      'corrida:p'],
    ['submarino', 'Submarino', '⚓', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:? cor-rosa:n ' +
      'cor-preto:? cor-branco:n cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s inseto:n dinossauro:n monstro:n ' +
      'robo:p selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:s escola:n folclore:n festa:n rapido:q'],
    ['trator', 'Trator', '🚜', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:p cor-verde:p cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:p selvagem:n fazenda:q estimacao:n comida:n espaco:n veiculo:s escola:n folclore:n festa:n forte:s ' +
      'rapido:n'],
    ['chuva', 'Chuva', '🌧️', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:? cor-marrom:n grande:? pequeno:? chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:p inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['raio', 'Raio (relâmpago)', '⚡', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n rapido:s ' +
      'forte:s'],
    ['vulcao', 'Vulcão', '🌋', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:s grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n forte:s'],
    ['planeta-terra', 'Planeta Terra', '🌍', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:s cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:s veiculo:n escola:n folclore:n festa:n'],
    ['marte', 'Marte', '🔴', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:s veiculo:n escola:n folclore:n festa:n'],
    ['saturno', 'Saturno', '🪐', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:q cor-marrom:p grande:s pequeno:n chapeu:q oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:s veiculo:n escola:n folclore:n festa:n'],
    ['jupiter-planeta', 'Júpiter (o planeta)', '🪐', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:s grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:s veiculo:n escola:n folclore:n festa:n'],
    ['boneco-de-neve', 'Boneco de neve', '⛄', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:s cor-marrom:p grande:n pequeno:n chapeu:p oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:p'],
    ['violao', 'Violão', '🎸', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['piano', 'Piano', '🎹', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:s cor-marrom:n grande:p pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['bateria', 'Bateria', '🥁', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:? cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:? cor-branco:? cor-marrom:n grande:? pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n forte:p'],
    ['flauta', 'Flauta', '🪈', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:p folclore:n festa:n'],
    ['sanfona', 'Sanfona', '🪗', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:p fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:? cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:? cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:p'],
    ['pandeiro', 'Pandeiro', '🪘', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:p grande:n pequeno:q chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:p'],
    ['violino', 'Violino', '🎻', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:q chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n europa:p'],
    ['berimbau', 'Berimbau', '🪕', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:s esporte:p heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n ' +
      'capa:n vestido:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n arma:q'],
    ['bombeiro', 'Bombeiro', '🧑‍🚒', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:p feminino:q crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:n pintor:n politico:n professor:s detetive:n pirata:n espaco:n veiculo:p ' +
      'escola:n folclore:n chapeu:s forte:s rapido:p'],
    ['medico', 'Médico', '🧑‍⚕️', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:p feminino:q crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:q pintor:n politico:n professor:s detetive:n pirata:n espaco:n veiculo:n ' +
      'escola:n folclore:n chapeu:n oculos:?'],
    ['enfermeira', 'Enfermeira', '👩‍⚕️', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:q feminino:p crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:? arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:n pintor:n politico:n professor:p detetive:n pirata:n espaco:n veiculo:n ' +
      'escola:n folclore:n chapeu:?'],
    ['professora', 'Professora', '👩‍🏫', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:q feminino:p crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:n pintor:n politico:n professor:s detetive:n pirata:n espaco:n veiculo:n ' +
      'escola:s folclore:n oculos:? chapeu:n'],
    ['policial', 'Policial', '👮', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:p ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:n pintor:n politico:n professor:s detetive:p pirata:n espaco:n veiculo:p ' +
      'escola:n folclore:n chapeu:p forte:p'],
    ['astronauta-de-verdade', 'Astronauta', '🧑‍🚀', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:n ' +
      'magia:n voa:p realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:p pintor:n politico:n professor:n detetive:n pirata:n espaco:s veiculo:s ' +
      'escola:n folclore:n chapeu:s forte:?'],
    ['cozinheiro', 'Cozinheiro', '🧑‍🍳', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:p feminino:q crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:n pintor:n politico:n professor:n detetive:n pirata:n espaco:n veiculo:n ' +
      'escola:n folclore:n chapeu:s barba:? rico:?'],
    ['palhaco', 'Palhaço', '🤡', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:p feminino:q crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:s cor-azul:p cor-vermelho:s cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:n pintor:n politico:n professor:n detetive:n pirata:n espaco:n veiculo:n ' +
      'escola:n folclore:n chapeu:p festa:p careca:? rapido:?'],
    ['magico', 'Mágico', '🎩', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:p feminino:q crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:p voa:n realeza:n engracado:? cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:p vestido:n arma:p ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:n pintor:n politico:n professor:n detetive:n pirata:n espaco:n veiculo:n ' +
      'escola:n folclore:n chapeu:s chapeu-magico:? festa:p barba:?'],
    ['pirata', 'Pirata', '🏴‍☠️', 'IFA',
      'real:p pessoa:s bicho:n coisa:n masculino:p feminino:q crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:s ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:? ator:n ' +
      'dancar:n futebol:n cientista:n pintor:n politico:n professor:n detetive:n pirata:s espaco:n veiculo:p ' +
      'escola:n folclore:n chapeu:s barba:p historia:p rico:p'],
    ['cientista', 'Cientista', '🧑‍🔬', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:s pintor:n politico:n professor:q detetive:n pirata:n espaco:n veiculo:n ' +
      'escola:n folclore:n oculos:p chapeu:n'],
    ['dentista', 'Dentista', '🦷', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:p vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:q pintor:n politico:n professor:p detetive:n pirata:n espaco:n veiculo:n ' +
      'escola:n folclore:n oculos:? chapeu:q'],
    ['carteiro', 'Carteiro', '📬', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:p feminino:q crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:n pintor:n politico:n professor:n detetive:n pirata:n espaco:n veiculo:p ' +
      'escola:n folclore:n chapeu:p rapido:p'],
    ['pintor', 'Pintor', '🧑‍🎨', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:p feminino:q crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:? cor-vermelho:? cor-verde:n cor-amarelo:? cor-rosa:n ' +
      'cor-preto:n cor-branco:? cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:n pintor:s politico:n professor:n detetive:n pirata:n espaco:n veiculo:n ' +
      'escola:n folclore:n chapeu:p'],
    ['piloto-de-aviao', 'Piloto de avião', '🧑‍✈️', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:p feminino:q crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:n ' +
      'magia:n voa:s realeza:n engracado:? cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:p cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:n pintor:n politico:n professor:n detetive:n pirata:n espaco:n veiculo:s ' +
      'escola:n folclore:n chapeu:s rapido:p'],
    ['fazendeiro', 'Fazendeiro', '🧑‍🌾', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:p feminino:q crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:? cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:n pintor:n politico:n professor:n detetive:n pirata:q espaco:n veiculo:p ' +
      'escola:n folclore:n chapeu:s forte:p barba:?'],
    ['mergulhador', 'Mergulhador', '🤿', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:? cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:s vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:? pintor:n politico:n professor:n detetive:n pirata:n espaco:n veiculo:n ' +
      'escola:n folclore:n chapeu:p agua:q'],
    ['bailarina', 'Bailarina', '🩰', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:? idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:p esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:s arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:s futebol:n cientista:n pintor:n politico:n professor:n detetive:n pirata:n espaco:n veiculo:n ' +
      'escola:n folclore:n cabelo-comprido:p chapeu:?'],
    ['jogador-de-futebol', 'Jogador de futebol', '⚽', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:p feminino:q crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:? vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:s cientista:n pintor:n politico:n professor:n detetive:n pirata:n espaco:n veiculo:n ' +
      'escola:n folclore:n rapido:p forte:p rico:?'],
    ['cantor', 'Cantor', '🎤', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:p feminino:q crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:n pintor:n politico:n professor:n detetive:n pirata:n espaco:n veiculo:n ' +
      'escola:n folclore:n rico:?'],
    ['veterinario', 'Veterinário', '🩺', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:q pintor:n politico:n professor:p detetive:n pirata:n espaco:n veiculo:n ' +
      'escola:n folclore:n chapeu:n oculos:q'],
    ['salva-vidas', 'Salva-vidas', '🛟', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:n pintor:n politico:n professor:p detetive:n pirata:n espaco:n veiculo:n ' +
      'escola:n folclore:n forte:s rapido:s agua:q chapeu:p'],
    ['pedreiro', 'Pedreiro', '👷', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:p feminino:q crianca:n idoso:n brasileiro:? fala:s desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n realeza:n engracado:? cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n rabo:n pelo:n orelhas:n capa:n vestido:n arma:n ' +
      'cachorro:n gato:n passaro:n dinossauro:n monstro:n robo:n fazenda:n estimacao:n comida:n vivo:s ator:n ' +
      'dancar:n futebol:n cientista:n pintor:n politico:n professor:n detetive:n pirata:n espaco:n veiculo:n ' +
      'escola:n folclore:n chapeu:s forte:s']
  ];
  (raiz.QEPersonagens = raiz.QEPersonagens || {}).natureza = L;
  if (typeof module === 'object' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
