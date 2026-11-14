/* Quem é? — A Meleca Adivinha: o mundo (bichos de verdade, folclore, lendas e datas, e coisas do dia a dia).
   Formato e regras de resposta: ver o começo de personagens/familia.js e de adivinha-perguntas.js. */
(function (raiz) {
  'use strict';
  var L = [
    // ---------- bichos de verdade ----------
    ['cachorro', 'Cachorro', '🐶', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:? cor-branco:? cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:? capa:n ' +
      'vestido:n arma:n rapido:p forte:? rico:n cachorro:s gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:n fazenda:p estimacao:s comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['gato', 'Gato', '🐱', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:? cor-rosa:n ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n capa:n ' +
      'vestido:n arma:n rapido:s forte:n rico:n cachorro:n gato:s rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:n fazenda:q estimacao:s comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['cavalo', 'Cavalo', '🐴', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:p cor-marrom:s grande:s pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n capa:n ' +
      'vestido:n arma:n rapido:s forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:q fazenda:s estimacao:q comida:n historia:n corrida:p espaco:n ' +
      'veiculo:? escola:n folclore:n festa:n'],
    ['vaca', 'Vaca', '🐄', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:n feminino:p crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:s cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:s pelo:p orelhas:n capa:n ' +
      'vestido:n arma:n rapido:n forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:n fazenda:s estimacao:n comida:p historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['porco', 'Porco', '🐷', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:? capa:n ' +
      'vestido:n arma:n rapido:n forte:q rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:n fazenda:s estimacao:q comida:p historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['galinha', 'Galinha', '🐔', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:q feminino:p crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:q engracado:? realeza:n cor-azul:n cor-vermelho:q cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:n forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:n fazenda:s estimacao:n comida:p historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['pato', 'Pato', '🦆', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:p engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:n forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:p inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:q fazenda:s estimacao:? comida:? historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['ovelha', 'Ovelha', '🐑', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:p pelo:s orelhas:n capa:n ' +
      'vestido:n arma:n rapido:n forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:n fazenda:s estimacao:q comida:q historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['cabra', 'Cabra', '🐐', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:p grande:n pequeno:n chapeu:n oculos:n barba:p rabo:p pelo:s ' +
      'orelhas:n capa:n vestido:n arma:n rapido:q forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n ' +
      'agua:n inseto:n dinossauro:n monstro:n robo:n selvagem:q fazenda:s estimacao:q comida:q historia:n ' +
      'espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['coelho', 'Coelho', '🐰', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:p grande:n pequeno:? chapeu:n oculos:n rabo:p pelo:s orelhas:s capa:n ' +
      'vestido:n arma:n rapido:s forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:p fazenda:p estimacao:s comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['hamster', 'Hamster', '🐹', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:s grande:n pequeno:s chapeu:n oculos:n rabo:q pelo:s orelhas:n capa:n ' +
      'vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:p urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:s comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['peixinho-dourado', 'Peixinho dourado', '🐟', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:s chapeu:n oculos:n rabo:p pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:q forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:s comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['papagaio', 'Papagaio', '🦜', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:p desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:p musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s engracado:p realeza:n cor-azul:q cor-vermelho:p cor-verde:s cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:? forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:p comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['arara', 'Arara', '🦜', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:q desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s engracado:? realeza:n cor-azul:s cor-vermelho:s cor-verde:p cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:p forte:q rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:q comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['tucano', 'Tucano', '🐦', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:s cor-branco:p cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:? forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['coruja', 'Coruja', '🦉', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:q pelo:n orelhas:q capa:n ' +
      'vestido:n arma:n rapido:? forte:q rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['aguia', 'Águia', '🦅', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:q fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:s forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['pinguim', 'Pinguim', '🐧', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:q cor-rosa:n ' +
      'cor-preto:s cor-branco:s cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:q pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:q forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:s inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['flamingo', 'Flamingo', '🦩', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:q fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:p engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:q pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:q forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:p inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:? fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['beija-flor', 'Beija-flor', '🐦', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s engracado:? realeza:n cor-azul:p cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:p pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:s forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:s agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['leao', 'Leão', '🦁', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:p cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:s pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n capa:n ' +
      'vestido:n arma:n rapido:s forte:s rico:n cachorro:n gato:s rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['tigre', 'Tigre', '🐯', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:p cor-marrom:s grande:s pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n capa:n ' +
      'vestido:n arma:n rapido:s forte:s rico:n cachorro:n gato:s rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['onca-pintada', 'Onça-pintada', '🐆', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:p grande:p pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n capa:n ' +
      'vestido:n arma:n rapido:s forte:s rico:n cachorro:n gato:s rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['elefante', 'Elefante', '🐘', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:s capa:n ' +
      'vestido:n arma:n rapido:n forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:q inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['girafa', 'Girafa', '🦒', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:s pequeno:n chapeu:n oculos:n rabo:s pelo:p orelhas:n capa:n ' +
      'vestido:n arma:n rapido:p forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['zebra', 'Zebra', '🦓', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:s cor-marrom:n grande:p pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n capa:n ' +
      'vestido:n arma:n rapido:s forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['hipopotamo', 'Hipopótamo', '🦛', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:q ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:n forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:p inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['rinoceronte', 'Rinoceronte', '🦏', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:p forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['macaco', 'Macaco', '🐒', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:p fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:p capa:n ' +
      'vestido:n arma:n rapido:p forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['gorila', 'Gorila', '🦍', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:s orelhas:n capa:n ' +
      'vestido:n arma:n rapido:q forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['urso', 'Urso', '🐻', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:s pequeno:n chapeu:n oculos:n rabo:q pelo:s orelhas:n capa:n ' +
      'vestido:n arma:n rapido:p forte:s rico:n cachorro:n gato:n rato:n urso:s passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['urso-polar', 'Urso polar', '🐻‍❄️', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:q pelo:s orelhas:n capa:n ' +
      'vestido:n arma:n rapido:p forte:s rico:n cachorro:n gato:n rato:n urso:s passaro:n agua:p inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:q fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['panda', 'Panda', '🐼', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:s cor-marrom:n grande:p pequeno:n chapeu:n oculos:n rabo:q pelo:s orelhas:n capa:n ' +
      'vestido:n arma:n rapido:n forte:p rico:n cachorro:n gato:n rato:n urso:s passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['coala', 'Coala', '🐨', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:s orelhas:p capa:n ' +
      'vestido:n arma:n rapido:n forte:n rico:n cachorro:n gato:n rato:n urso:p passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['canguru', 'Canguru', '🦘', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:p pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:p capa:n ' +
      'vestido:n arma:n rapido:s forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['preguica', 'Preguiça', '🦥', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:q pelo:s orelhas:n capa:n ' +
      'vestido:n arma:n rapido:n forte:q rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['capivara', 'Capivara', '🦫', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:p tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:q pequeno:n chapeu:n oculos:n rabo:n pelo:s orelhas:n capa:n ' +
      'vestido:n arma:n rapido:q forte:q rico:n cachorro:n gato:n rato:q urso:n passaro:n agua:p inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['tamandua', 'Tamanduá', '🦡', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:n capa:n ' +
      'vestido:n arma:n rapido:q forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['lobo', 'Lobo', '🐺', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:q fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:? cor-branco:? cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:p capa:n ' +
      'vestido:n arma:n rapido:s forte:p rico:n cachorro:p gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['raposa', 'Raposa', '🦊', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:q fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:s grande:n pequeno:n chapeu:n oculos:n rabo:s pelo:s orelhas:p capa:n ' +
      'vestido:n arma:n rapido:s forte:q rico:n cachorro:p gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['esquilo', 'Esquilo', '🐿️', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:p chapeu:n oculos:n rabo:s pelo:s orelhas:n capa:n ' +
      'vestido:n arma:n rapido:s forte:n rico:n cachorro:n gato:n rato:p urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['cobra', 'Cobra', '🐍', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:? pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:p forte:? rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['jacare', 'Jacaré', '🐊', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:p forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s inseto:n ' +
      'dinossauro:q monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['tartaruga', 'Tartaruga', '🐢', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n chapeu:n oculos:n rabo:q pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:n forte:q rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:p inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:p comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['sapo', 'Sapo', '🐸', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:q forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:p inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['camaleao', 'Camaleão', '🦎', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:q voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p chapeu:n oculos:n rabo:s pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:n forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:s fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['tubarao', 'Tubarão', '🦈', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:s forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['baleia', 'Baleia', '🐋', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:p musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:q forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['golfinho', 'Golfinho', '🐬', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:p pequeno:n chapeu:n oculos:n rabo:p pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:s forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['polvo', 'Polvo', '🐙', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:? forte:? rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:? historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['cavalo-marinho', 'Cavalo-marinho', '🌊', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:s chapeu:n oculos:n rabo:s pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:n forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['estrela-do-mar', 'Estrela-do-mar', '⭐', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:n forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['caranguejo', 'Caranguejo', '🦀', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:? forte:q rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:s inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:p historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['abelha', 'Abelha', '🐝', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:q orelhas:n capa:n ' +
      'vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:s ' +
      'dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['borboleta', 'Borboleta', '🦋', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s engracado:? realeza:n cor-azul:p cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:p ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:q forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:s ' +
      'dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['formiga', 'Formiga', '🐜', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:p grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:? forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:s ' +
      'dinossauro:n monstro:n robo:n selvagem:? fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['joaninha', 'Joaninha', '🐞', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:p engracado:? realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:n forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:s ' +
      'dinossauro:n monstro:n robo:n selvagem:? fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['aranha', 'Aranha', '🕷️', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:? orelhas:n capa:n ' +
      'vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:p ' +
      'dinossauro:n monstro:n robo:n selvagem:? fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['minhoca', 'Minhoca', '🪱', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:n forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:p ' +
      'dinossauro:n monstro:n robo:n selvagem:? fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['camelo', 'Camelo', '🐫', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:s pequeno:n chapeu:n oculos:n rabo:p pelo:p orelhas:n capa:n ' +
      'vestido:n arma:n rapido:q forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:q fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['morcego', 'Morcego', '🦇', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:p chapeu:n oculos:n rabo:q pelo:p orelhas:s capa:n ' +
      'vestido:n arma:n rapido:p forte:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:q'],
    ['lhama', 'Lhama', '🦙', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:p grande:p pequeno:n chapeu:n oculos:n rabo:p pelo:s orelhas:p capa:n ' +
      'vestido:n arma:n rapido:q forte:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:n selvagem:q fazenda:p estimacao:n comida:n historia:n espaco:n veiculo:n ' +
      'escola:n folclore:n festa:n'],
    ['tiranossauro', 'Tiranossauro', '🦖', 'IFA',
      'real:s pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:? idoso:? brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:s pequeno:n chapeu:n oculos:n rabo:s pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:p forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:s monstro:n robo:n selvagem:p fazenda:n estimacao:n comida:n vivo:n historia:s espaco:n ' +
      'veiculo:n escola:n folclore:n festa:n t-jurassic:p'],
    // ---------- folclore, lendas e datas ----------
    ['saci-perere', 'Saci-Pererê', '🌪️', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:s fala:s desenho:p ' +
      'filme:q serie:p livro:s videogame:n internet:n tv:n disney:n canta:q musica:n esporte:n heroi:q vilao:q ' +
      'magia:s voa:q engracado:s realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s rapido:s robo:n selvagem:s espaco:n ' +
      'escola:n folclore:s festa:p t-sitio:s'],
    ['curupira', 'Curupira', '🔥', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:? idoso:n brasileiro:s fala:p desenho:? ' +
      'filme:? serie:? livro:p videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:q ' +
      'magia:s voa:n engracado:? realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ruivo:s rapido:s forte:p robo:n selvagem:s ' +
      'espaco:n escola:n folclore:s t-sitio:p'],
    ['iara', 'Iara', '🧜‍♀️', 'IFA',
      'real:n pessoa:p bicho:q coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:? ' +
      'filme:? serie:? livro:p videogame:n internet:n tv:n disney:n canta:s musica:n esporte:n heroi:q vilao:p ' +
      'magia:s voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n cabelo-comprido:s agua:s robo:n espaco:n ' +
      'escola:n folclore:s t-sitio:p'],
    ['mula-sem-cabeca', 'Mula Sem Cabeça', '🐴', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:n feminino:p crianca:n idoso:n brasileiro:s fala:n desenho:? ' +
      'filme:? serie:? livro:? videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p ' +
      'magia:s voa:n engracado:? realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:s pequeno:n rabo:s pelo:p rapido:s forte:p monstro:s robo:n ' +
      'espaco:n escola:n folclore:s t-sitio:p'],
    ['boitata', 'Boitatá', '🐍', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:s fala:n desenho:? ' +
      'filme:? serie:? livro:? videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:q ' +
      'magia:s voa:n engracado:? realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n rabo:s rapido:p monstro:s robo:n selvagem:s ' +
      'espaco:n escola:n folclore:s t-sitio:p'],
    ['boto-cor-de-rosa', 'Boto Cor-de-Rosa', '🐬', 'IFA',
      'real:n pessoa:p bicho:p coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:p desenho:? ' +
      'filme:? serie:? livro:? videogame:n internet:n tv:n disney:n canta:? musica:n esporte:n heroi:q vilao:? ' +
      'magia:s voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n chapeu:s agua:s robo:n dancar:p espaco:n ' +
      'escola:n folclore:s'],
    ['cuca-do-folclore', 'Cuca do folclore', '🐊', 'IFA',
      'real:n pessoa:p bicho:p coisa:n masculino:n feminino:s crianca:n idoso:p brasileiro:s fala:s desenho:p ' +
      'filme:? serie:s livro:s videogame:n internet:n tv:n disney:n canta:p musica:n esporte:n heroi:n vilao:s ' +
      'magia:s voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n loiro:p cabelo-comprido:p rabo:p dinossauro:q ' +
      'robo:n espaco:n escola:n chapeu-magico:s folclore:s t-sitio:s'],
    ['lobisomem', 'Lobisomem', '🐺', 'IFA',
      'real:n pessoa:p bicho:p coisa:n masculino:s feminino:n crianca:n idoso:? brasileiro:p fala:q desenho:? ' +
      'filme:p serie:? livro:? videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p ' +
      'magia:s voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:p pequeno:n rabo:p pelo:s rapido:p forte:s cachorro:p ' +
      'monstro:s robo:n espaco:n escola:n folclore:s festa:p'],
    ['papai-noel', 'Papai Noel', '🎅', 'IFA',
      'real:? pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:s ' +
      'filme:s serie:? livro:? videogame:n internet:n tv:n disney:n canta:? musica:n esporte:n heroi:p vilao:n ' +
      'magia:p voa:p engracado:p realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:q pequeno:n chapeu:s barba:s rapido:? forte:? robo:n ' +
      'espaco:n veiculo:s escola:n casado:s folclore:s festa:s'],
    ['mamae-noel', 'Mamãe Noel', '🤶', 'IFA',
      'real:? pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:s brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:? videogame:n internet:n tv:n disney:n canta:? musica:n esporte:n heroi:? vilao:n ' +
      'magia:p voa:q engracado:? realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n chapeu:p oculos:p vestido:p robo:n espaco:n ' +
      'escola:n casado:s folclore:s festa:s'],
    ['coelhinho-da-pascoa', 'Coelhinho da Páscoa', '🐰', 'IFA',
      'real:? pessoa:n bicho:s coisa:n masculino:p feminino:q crianca:? idoso:n brasileiro:? fala:p desenho:p ' +
      'filme:? serie:? livro:? videogame:n internet:n tv:n disney:n canta:? musica:n esporte:n heroi:p vilao:n ' +
      'magia:p voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n rabo:p pelo:s orelhas:s rapido:p robo:n espaco:n ' +
      'escola:n folclore:p festa:s'],
    ['fada-do-dente', 'Fada do Dente', '🧚', 'IFA',
      'real:? pessoa:q bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:p desenho:? ' +
      'filme:? serie:? livro:? videogame:n internet:n tv:n disney:n canta:? musica:n esporte:n heroi:p vilao:n ' +
      'magia:s voa:s engracado:? realeza:n cor-azul:? cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p arma:p robo:n espaco:n escola:n chapeu-magico:s ' +
      'folclore:p festa:n'],
    ['bicho-papao', 'Bicho-Papão', '👹', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:p feminino:q crianca:n idoso:n brasileiro:? fala:? desenho:? ' +
      'filme:? serie:? livro:? videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:p voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:p pequeno:n monstro:s robo:n espaco:n escola:n folclore:s'],
    ['unicornio', 'Unicórnio', '🦄', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:q desenho:s ' +
      'filme:? serie:? livro:? videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:n ' +
      'magia:s voa:q engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n cabelo-comprido:p rabo:s pelo:s rapido:p ' +
      'monstro:p robo:n espaco:n escola:n folclore:p'],
    ['sereia', 'Sereia', '🧜', 'IFA',
      'real:n pessoa:p bicho:q coisa:n masculino:n feminino:s crianca:? idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:? serie:? livro:? videogame:n internet:n tv:n disney:n canta:s musica:n esporte:n heroi:? vilao:q ' +
      'magia:p voa:n engracado:? realeza:? cor-azul:p cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n cabelo-comprido:s agua:s robo:n espaco:n ' +
      'escola:n folclore:p'],
    ['dragao', 'Dragão', '🐉', 'IFA',
      'real:n pessoa:n bicho:p coisa:n masculino:? feminino:? crianca:n idoso:? brasileiro:n fala:? desenho:s ' +
      'filme:s serie:? livro:? videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:? ' +
      'magia:p voa:s engracado:? realeza:n cor-azul:n cor-vermelho:p cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n rabo:s forte:s dinossauro:s monstro:s robo:n ' +
      'espaco:n escola:n folclore:s'],
    ['fantasma', 'Fantasma', '👻', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:? feminino:? crianca:n idoso:? brasileiro:? fala:? desenho:s ' +
      'filme:s serie:? livro:? videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:q vilao:? ' +
      'magia:p voa:s engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n monstro:p robo:n espaco:n escola:n folclore:s ' +
      'festa:p'],
    ['vampiro', 'Vampiro', '🧛', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:n idoso:? brasileiro:n fala:s desenho:s ' +
      'filme:s serie:? livro:? videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:q vilao:p ' +
      'magia:s voa:p engracado:? realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n capa:s monstro:p robo:n europa:p espaco:n ' +
      'escola:n folclore:s festa:p'],
    ['bruxa', 'Bruxa', '🧙‍♀️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:p brasileiro:? fala:s desenho:s ' +
      'filme:s serie:? livro:s videogame:n internet:n tv:n disney:n canta:? musica:n esporte:n heroi:q vilao:p ' +
      'magia:s voa:s engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:s arma:p robo:n espaco:n escola:n ' +
      'chapeu-magico:s folclore:s festa:p'],
    ['duende', 'Duende', '🧝', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:p feminino:q crianca:n idoso:? brasileiro:n fala:s desenho:? ' +
      'filme:? serie:? livro:? videogame:n internet:n tv:n disney:n canta:? musica:n esporte:n heroi:? vilao:? ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:s barba:p orelhas:s robo:n europa:s ' +
      'espaco:n escola:n folclore:s festa:p'],
    ['gnomo', 'Gnomo', '🍄', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:p feminino:q crianca:n idoso:p brasileiro:n fala:p desenho:? ' +
      'filme:? serie:? livro:? videogame:n internet:n tv:n disney:n canta:? musica:n esporte:n heroi:? vilao:n ' +
      'magia:s voa:n engracado:? realeza:n cor-azul:n cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:s chapeu:s barba:s robo:n selvagem:p europa:s ' +
      'espaco:n escola:n folclore:s'],
    ['pe-grande', 'Pé Grande', '👣', 'IFA',
      'real:q pessoa:q bicho:p coisa:n masculino:p feminino:q crianca:n idoso:? brasileiro:n fala:n desenho:? ' +
      'filme:p serie:? livro:? videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:q ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:s grande:s pequeno:n pelo:s forte:s monstro:p robo:n selvagem:s ' +
      'estrangeiro-eua:p espaco:n escola:n folclore:s'],
    ['alienigena', 'Alienígena', '👽', 'IFA',
      'real:? pessoa:q bicho:q coisa:n masculino:? feminino:? crianca:n idoso:? brasileiro:n fala:? desenho:s ' +
      'filme:s serie:? livro:? videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:? ' +
      'magia:p voa:n engracado:? realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n orelhas:? monstro:p robo:n espaco:s veiculo:p ' +
      'escola:n folclore:q'],
    // ---------- coisas ----------
    ['pizza', 'Pizza', '🍕', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:q fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s europa:p espaco:n veiculo:n escola:n folclore:n festa:?'],
    ['brigadeiro', 'Brigadeiro', '🍬', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:s grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:s'],
    ['sorvete', 'Sorvete', '🍦', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:? ' +
      'cor-preto:n cor-branco:? cor-marrom:? grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:?'],
    ['banana', 'Banana', '🍌', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:p fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['maca', 'Maçã', '🍎', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:s cor-verde:p cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['pao-de-queijo', 'Pão de queijo', '🧀', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:s fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['chocolate', 'Chocolate', '🍫', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:s grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:p'],
    ['bolo-de-aniversario', 'Bolo de aniversário', '🎂', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:? ' +
      'cor-preto:n cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:s espaco:n veiculo:n escola:n folclore:n festa:s'],
    ['sol', 'Sol', '☀️', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:s veiculo:n escola:n folclore:n festa:n'],
    ['lua', 'Lua', '🌙', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:s veiculo:n escola:n folclore:n festa:n'],
    ['estrela', 'Estrela', '⭐', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:? pequeno:? chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:s veiculo:n escola:n folclore:n festa:n'],
    ['arco-iris', 'Arco-íris', '🌈', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:s cor-vermelho:s cor-verde:s cor-amarelo:s cor-rosa:s ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['nuvem', 'Nuvem', '☁️', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:p engracado:n realeza:n cor-azul:q cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:s cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['celular', 'Celular', '📱', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:? desenho:n ' +
      'filme:n serie:n livro:n videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:p selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['televisao', 'Televisão', '📺', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:? ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:? disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:n cor-marrom:n grande:q pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:p selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['computador', 'Computador', '💻', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:p internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:p selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['bola-de-futebol', 'Bola de futebol', '⚽', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:s cor-branco:s cor-marrom:n grande:n pequeno:q chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n futebol:s espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['carro', 'Carro', '🚗', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:? cor-branco:? cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n ' +
      'monstro:n robo:p selvagem:n fazenda:n estimacao:n comida:n corrida:p espaco:n veiculo:s escola:n ' +
      'folclore:n festa:n'],
    ['aviao', 'Avião', '✈️', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n ' +
      'monstro:n robo:p selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:s escola:n folclore:n festa:n'],
    ['foguete', 'Foguete', '🚀', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:s engracado:n realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:p cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n ' +
      'monstro:n robo:p selvagem:n fazenda:n estimacao:n comida:n espaco:s veiculo:s escola:n folclore:n festa:n'],
    ['trem', 'Trem', '🚂', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:p forte:s rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n ' +
      'dinossauro:n monstro:n robo:p selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:s escola:n ' +
      'folclore:n festa:n'],
    ['bicicleta', 'Bicicleta', '🚲', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:p heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:q pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rapido:p rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n ' +
      'monstro:n robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:s escola:n folclore:n festa:n'],
    ['livro', 'Livro', '📚', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:? videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:p folclore:n festa:n'],
    ['lapis', 'Lápis', '✏️', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:s chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:p folclore:n festa:n'],
    ['guarda-chuva', 'Guarda-chuva', '☂️', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:q inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:n fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['arvore', 'Árvore', '🌳', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n ' +
      'cor-preto:n cor-branco:n cor-marrom:p grande:s pequeno:n chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:s fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n'],
    ['flor', 'Flor', '🌸', 'IFA',
      'real:s pessoa:n bicho:n coisa:s masculino:n feminino:n crianca:n idoso:n brasileiro:? fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:n cor-vermelho:p cor-verde:n cor-amarelo:p cor-rosa:p ' +
      'cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p chapeu:n oculos:n rabo:n pelo:n orelhas:n capa:n ' +
      'vestido:n arma:n rico:n cachorro:n gato:n rato:n urso:n passaro:n agua:n inseto:n dinossauro:n monstro:n ' +
      'robo:n selvagem:p fazenda:n estimacao:n comida:n espaco:n veiculo:n escola:n folclore:n festa:n']
  ];
  (raiz.QEPersonagens = raiz.QEPersonagens || {}).mundo = L;
  if (typeof module === 'object' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
