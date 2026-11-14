/* Quem é? — A Meleca Adivinha: personagens de filmes, séries e novelas com atores de verdade (o personagem, não o ator).

   FORMATO: o mesmo de personagens/familia.js — [ id, nome, emoji, níveis, respostas ]. Perguntas em adivinha-perguntas.js;
   as do núcleo são obrigatórias. Na dúvida, '?'. */
(function (raiz) {
  'use strict';
  var L = [
    ['marty-mcfly', 'Marty McFly', '🛹', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:p musica:q esporte:n heroi:s vilao:n magia:n voa:n engracado:p realeza:n cor-azul:p ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:q vestido:n veiculo:s escola:s ' +
      'rapido:p estrangeiro-eua:s europa:n antigo:s recente:n cientista:n chapeu:n oculos:n loiro:n barba:n careca:n ' +
      'casado:p arma:n t-volta-futuro:s'],
    ['doc-brown', 'Doc Brown', '⚡', 'FA',
      'real:n bicho:n coisa:n idoso:p brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n cientista:s veiculo:s ' +
      'cabelo-comprido:p oculos:p careca:n barba:n estrangeiro-eua:s europa:n antigo:s recente:n escola:n arma:n ' +
      'casado:q t-volta-futuro:s'],
    ['biff-tannen', 'Biff Tannen', '😠', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n forte:p rico:p veiculo:s ' +
      'escola:p loiro:p careca:n barba:n chapeu:q oculos:n estrangeiro-eua:s europa:n antigo:s recente:n cientista:n ' +
      'arma:q t-volta-futuro:s'],
    ['mikey-goonies', 'Mikey (Os Goonies)', '🗺️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n pirata:s ' +
      'familia-grande:p escola:s rico:n oculos:n loiro:n cabelo-comprido:n estrangeiro-eua:s europa:n antigo:s ' +
      'recente:n arma:n t-oitentas:s'],
    ['bocao-goonies', 'Bocão (Os Goonies)', '👄', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n pirata:s ' +
      'escola:s oculos:n loiro:n estrangeiro-eua:s europa:n antigo:s recente:n arma:n t-oitentas:s'],
    ['gordo-goonies', 'Gordo (Os Goonies)', '🍫', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:? cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n pirata:s ' +
      'escola:s oculos:n loiro:n estrangeiro-eua:s europa:n antigo:s recente:n arma:n t-oitentas:s'],
    ['sloth-goonies', 'Sloth (Os Goonies)', '💪', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:p desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n forte:s monstro:q careca:p ' +
      'barba:n chapeu:n oculos:n familia-grande:s estrangeiro-eua:s europa:n antigo:s recente:n escola:n arma:n ' +
      't-oitentas:s'],
    ['et', 'E.T.', '👽', 'IFA',
      'real:n bicho:q coisa:n idoso:n brasileiro:n fala:p desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:s voa:p engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n masculino:? feminino:? crianca:n espaco:s monstro:s careca:s ' +
      'orelhas:n chapeu:n oculos:n estimacao:q estrangeiro-eua:q antigo:s recente:n t-oitentas:s'],
    ['elliott', 'Elliott (E.T.)', '🚲', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:p engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n veiculo:s ' +
      'escola:s familia-grande:p loiro:n oculos:n chapeu:n espaco:n estrangeiro-eua:s europa:n antigo:s recente:n ' +
      't-oitentas:s'],
    ['chris-parker', 'Chris Parker (a babá)', '🧑‍🍼', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:q barba:n veiculo:p professor:q ' +
      'escola:p loiro:p cabelo-comprido:s oculos:n chapeu:n estrangeiro-eua:s europa:n antigo:s recente:n ' +
      't-oitentas:s'],
    ['sara-anderson', 'Sara (Uma Noite de Aventuras)', '⛑️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:s barba:n careca:n chapeu:s loiro:s ' +
      'escola:p estrangeiro-eua:s europa:n antigo:s recente:n t-oitentas:s'],
    ['forrest-gump', 'Forrest Gump', '🏃', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:p heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n rapido:s corrida:s rico:p ' +
      'casado:p oculos:n chapeu:n barba:p careca:n estrangeiro-eua:s europa:n antigo:s recente:n'],
    ['jenny-curran', 'Jenny (Forrest Gump)', '🌼', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:p musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n cabelo-comprido:s loiro:q ' +
      'casado:p oculos:n chapeu:n estrangeiro-eua:s europa:n antigo:s recente:n'],
    ['tenente-dan', 'Tenente Dan', '🎖️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:q vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n veiculo:p barba:p ' +
      'cabelo-comprido:p careca:n rico:p oculos:p estrangeiro-eua:s europa:n antigo:s recente:n'],
    ['exterminador-t800', 'O Exterminador (T-800)', '🕶️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:p magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:p pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:q masculino:s feminino:n crianca:n vestido:n robo:s forte:s arma:s ' +
      'veiculo:s oculos:s careca:n barba:n monstro:n estrangeiro-eua:p europa:n antigo:s recente:n t-acao:s'],
    ['t-1000', 'T-1000 (Exterminador do Futuro 2)', '💧', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:p voa:n engracado:n realeza:n cor-azul:p ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:q masculino:s feminino:n crianca:n vestido:n robo:s rapido:p forte:s ' +
      'professor:p arma:s veiculo:s oculos:n careca:n barba:n antigo:s recente:n estrangeiro-eua:p t-acao:s'],
    ['john-connor', 'John Connor', '🏍️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:p vestido:n barba:n careca:n veiculo:s ' +
      'rapido:p escola:p cabelo-comprido:p loiro:n oculos:n estrangeiro-eua:s europa:n antigo:s recente:n t-acao:s'],
    ['sarah-connor', 'Sarah Connor', '🔫', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n forte:s arma:s oculos:p ' +
      'cabelo-comprido:p loiro:n estrangeiro-eua:s europa:n antigo:s recente:n t-acao:s'],
    ['douglas-quaid', 'Douglas Quaid (O Vingador do Futuro)', '🔴', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:q videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n espaco:s arma:s forte:s ' +
      'detetive:p casado:s careca:n barba:n oculos:n estrangeiro-eua:p antigo:s recente:n t-acao:s'],
    ['jack-traven', 'Jack Traven (Velocidade Máxima)', '🚌', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n professor:s veiculo:s ' +
      'arma:s rapido:p forte:p careca:q barba:n oculos:n estrangeiro-eua:s europa:n antigo:s recente:n t-acao:s'],
    ['annie-porter', 'Annie (Velocidade Máxima)', '🚍', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n veiculo:s cabelo-comprido:p ' +
      'loiro:n oculos:n estrangeiro-eua:s europa:n antigo:s recente:n t-acao:s'],
    ['john-wick', 'John Wick', '🐶', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n arma:s forte:s rapido:p ' +
      'barba:s cabelo-comprido:p careca:n oculos:n veiculo:s casado:p detetive:q rico:p estrangeiro-eua:p europa:n ' +
      'antigo:n recente:p t-acao:s'],
    ['carminha', 'Carminha (Avenida Brasil)', '💅', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n rico:s casado:s loiro:s ' +
      'cabelo-comprido:s oculos:n antigo:n recente:p estrangeiro-eua:n europa:n t-novela:s'],
    ['nina-rita', 'Nina / Rita (Avenida Brasil)', '🍲', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n detetive:p cabelo-comprido:s ' +
      'loiro:n oculos:n antigo:n recente:p estrangeiro-eua:n europa:n t-novela:s'],
    ['tufao', 'Tufão (Avenida Brasil)', '⚽', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:s heroi:q vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n futebol:s rico:s casado:s ' +
      'familia-grande:s careca:n barba:n antigo:n recente:p estrangeiro-eua:n europa:n t-novela:s'],
    ['jorginho', 'Jorginho (Avenida Brasil)', '💔', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:? heroi:p vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n futebol:? casado:p ' +
      'familia-grande:s careca:n barba:n antigo:n recente:p estrangeiro-eua:n europa:n t-novela:s'],
    ['joao-grilo', 'João Grilo', '🦗', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:s serie:s livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n rico:n careca:n barba:n ' +
      'chapeu:p oculos:n antigo:p recente:q estrangeiro-eua:n europa:n'],
    ['chico', 'Chicó', '🙊', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:s serie:s livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n rico:n casado:p careca:n ' +
      'barba:n chapeu:p oculos:n antigo:p recente:q estrangeiro-eua:n europa:n'],
    ['kevin', 'Kevin (Esqueceram de Mim)', '🏠', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n ' +
      'familia-grande:s festa:s loiro:s oculos:n chapeu:n escola:p estrangeiro-eua:s europa:n antigo:s recente:n'],
    ['harry-potter', 'Harry Potter', '⚡', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:p heroi:s vilao:n magia:s voa:s engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n europa:s ' +
      'arma:s escola:s oculos:s chapeu-magico:s capa:p loiro:n ruivo:n antigo:n recente:n t-harry:s'],
    ['hermione', 'Hermione', '📚', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:q engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:s barba:n careca:n europa:s arma:s ' +
      'escola:s chapeu-magico:s cabelo-comprido:s oculos:n loiro:n ruivo:n antigo:n recente:n t-harry:s'],
    ['rony-weasley', 'Rony Weasley', '🐀', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:s voa:p engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n europa:s ' +
      'arma:s escola:s chapeu-magico:s ruivo:s familia-grande:s oculos:n antigo:n recente:n t-harry:s'],
    ['draco-malfoy', 'Draco Malfoy', '🐍', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p magia:s voa:p engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n europa:s ' +
      'arma:s escola:s chapeu-magico:s loiro:s rico:s oculos:n antigo:n recente:n t-harry:s'],
    ['dumbledore', 'Dumbledore', '🧙', 'IFA',
      'real:n bicho:n coisa:n idoso:s brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n europa:s arma:s barba:s ' +
      'cabelo-comprido:s professor:s chapeu-magico:s chapeu:p oculos:s careca:n antigo:n recente:n t-harry:s'],
    ['hagrid', 'Hagrid', '🧔', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:p voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:s pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n forte:s europa:s barba:s ' +
      'cabelo-comprido:s professor:p chapeu-magico:p careca:n oculos:n antigo:n recente:n t-harry:s'],
    ['voldemort', 'Voldemort', '🐍', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:p engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n europa:s arma:s careca:s ' +
      'chapeu-magico:s barba:n oculos:n antigo:n recente:n t-harry:s'],
    ['snape', 'Professor Snape', '🧪', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:p magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n europa:s arma:s ' +
      'cabelo-comprido:p professor:s chapeu-magico:s capa:p careca:n barba:n oculos:n antigo:n recente:n t-harry:s'],
    ['dobby', 'Dobby', '🧦', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:q ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n masculino:s feminino:n crianca:n europa:s monstro:s orelhas:s ' +
      'careca:s oculos:n chapeu:n antigo:n recente:n t-harry:s'],
    ['luke-skywalker', 'Luke Skywalker', '🗡️', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:q engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:p cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n arma:s espaco:s veiculo:s ' +
      'loiro:s barba:q careca:n oculos:n antigo:s recente:n t-star-wars:s'],
    ['darth-vader', 'Darth Vader', '⬛', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:p pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n arma:s espaco:s veiculo:s ' +
      'capa:s chapeu:s forte:s robo:p oculos:n antigo:s recente:n t-star-wars:s'],
    ['princesa-leia', 'Princesa Leia', '👸', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:s cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:p rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n arma:s espaco:s veiculo:p ' +
      'cabelo-comprido:s vestido:s casado:p oculos:n loiro:n antigo:s recente:n t-star-wars:s'],
    ['han-solo', 'Han Solo', '🚀', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:p cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n arma:s espaco:s veiculo:s ' +
      'pirata:s casado:p careca:n barba:n oculos:n antigo:s recente:n t-star-wars:s'],
    ['chewbacca', 'Chewbacca', '🐻', 'IFA',
      'real:n bicho:q coisa:n idoso:n brasileiro:n fala:n desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:s pequeno:n ' +
      'ator:n politico:n rabo:n pelo:s pessoa:n masculino:s feminino:n crianca:n monstro:s forte:s arma:s espaco:s ' +
      'veiculo:s urso:q antigo:s recente:n t-star-wars:s'],
    ['yoda', 'Mestre Yoda', '🟢', 'IFA',
      'real:n bicho:n coisa:n idoso:s brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:q ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n masculino:s feminino:n crianca:n monstro:s professor:s orelhas:s ' +
      'espaco:s arma:p careca:p antigo:s recente:n t-star-wars:s'],
    ['grogu', 'Grogu (Baby Yoda)', '🐸', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:n desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n masculino:s feminino:n crianca:s monstro:s orelhas:s espaco:s ' +
      'careca:p estimacao:q antigo:n recente:s t-star-wars:s'],
    ['r2-d2', 'R2-D2', '🤖', 'IFA',
      'real:n bicho:n coisa:p idoso:n brasileiro:n fala:n desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:s ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n masculino:? feminino:? crianca:n robo:s espaco:s antigo:s recente:n ' +
      't-star-wars:s'],
    ['c-3po', 'C-3PO', '🥇', 'IFA',
      'real:n bicho:n coisa:p idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:q vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:s cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n masculino:p feminino:? crianca:n robo:s espaco:s antigo:s recente:n ' +
      't-star-wars:s'],
    ['mandaloriano', 'O Mandaloriano', '🪖', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:p engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n arma:s espaco:s veiculo:s ' +
      'capa:s chapeu:s forte:p antigo:n recente:s t-star-wars:s'],
    ['homem-de-ferro', 'Homem de Ferro', '🦾', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:? voa:s engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n robo:p rico:s cientista:s ' +
      'barba:s capa:p forte:s careca:n oculos:p estrangeiro-eua:s antigo:q recente:p t-marvel:s'],
    ['capitao-america', 'Capitão América', '🛡️', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:? voa:n engracado:n realeza:n cor-azul:s ' +
      'cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n forte:s arma:p loiro:s ' +
      'capa:p chapeu:p careca:n barba:n historia:p estrangeiro-eua:s antigo:q recente:p t-marvel:s'],
    ['thor', 'Thor', '🔨', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:s engracado:n realeza:s cor-azul:n ' +
      'cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n folclore:p forte:s arma:s ' +
      'capa:s espaco:p loiro:s cabelo-comprido:s barba:p careca:n antigo:q recente:p t-marvel:s'],
    ['hulk', 'Hulk', '💚', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:p desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n forte:s cientista:p ' +
      'careca:n barba:n antigo:s recente:p t-marvel:s'],
    ['viuva-negra', 'Viúva Negra', '🕷️', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n detetive:s arma:s forte:p ' +
      'ruivo:s cabelo-comprido:p europa:p antigo:n recente:p t-marvel:s'],
    ['homem-aranha', 'Homem-Aranha', '🕸️', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:p realeza:n cor-azul:s ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:p vestido:n escola:s capa:s rapido:p ' +
      'forte:p inseto:p estrangeiro-eua:s antigo:s recente:p t-marvel:s'],
    ['pantera-negra', 'Pantera Negra', '🐆', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:? voa:n engracado:n realeza:s cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n forte:s rapido:p rico:s ' +
      'capa:s gato:q careca:n antigo:n recente:s t-marvel:s'],
    ['doutor-estranho', 'Doutor Estranho', '🔮', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:s engracado:n realeza:n cor-azul:p ' +
      'cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n chapeu-magico:s capa:s ' +
      'professor:p barba:s careca:n antigo:n recente:s t-marvel:s'],
    ['thanos', 'Thanos', '🧤', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:p cor-rosa:s cor-preto:n cor-branco:n cor-marrom:n grande:s pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n forte:s espaco:s careca:s ' +
      'barba:n antigo:n recente:s t-marvel:s'],
    ['loki', 'Loki', '🐍', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:s livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:n engracado:p realeza:s cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n folclore:p chapeu:s capa:p ' +
      'cabelo-comprido:s espaco:p careca:n barba:n antigo:n recente:s t-marvel:s'],
    ['groot', 'Groot', '🌳', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:p desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:p pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n masculino:p feminino:n crianca:n monstro:s forte:s espaco:s ' +
      'selvagem:p antigo:n recente:s t-marvel:s'],
    ['rocket', 'Rocket', '🦝', 'IFA',
      'real:n bicho:s coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:q ' +
      'ator:n politico:n rabo:s pelo:s pessoa:n masculino:s feminino:n crianca:n arma:s espaco:s veiculo:s antigo:n ' +
      'recente:s t-marvel:s'],
    ['homem-formiga', 'Homem-Formiga', '🐜', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:p pequeno:p ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n inseto:p capa:s careca:n ' +
      'antigo:n recente:s t-marvel:s'],
    ['wanda', 'Feiticeira Escarlate (Wanda)', '🔴', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:s livro:s videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:n magia:s voa:s engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n chapeu-magico:p chapeu:p ' +
      'ruivo:p cabelo-comprido:s europa:p antigo:n recente:s t-marvel:s'],
    ['batman', 'Batman', '🦇', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:? voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n detetive:s rico:s ' +
      'veiculo:s capa:s forte:s orelhas:p careca:n antigo:s recente:n estrangeiro-eua:s t-dc:s'],
    ['superman', 'Superman', '🦸', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:s engracado:n realeza:n cor-azul:s ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n forte:s rapido:s espaco:s ' +
      'capa:s careca:n oculos:p antigo:s recente:n estrangeiro-eua:s t-dc:s'],
    ['mulher-maravilha', 'Mulher-Maravilha', '🌟', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:n realeza:s cor-azul:p ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n forte:s arma:s chapeu:s ' +
      'cabelo-comprido:s historia:p folclore:p antigo:s recente:p t-dc:s'],
    ['coringa', 'Coringa', '🃏', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n careca:n barba:n antigo:s ' +
      'recente:n estrangeiro-eua:s t-dc:s'],
    ['flash', 'Flash', '⚡', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:s livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n rapido:s corrida:p capa:s ' +
      'cientista:p careca:n antigo:p recente:p estrangeiro-eua:s t-dc:s'],
    ['aquaman', 'Aquaman', '🔱', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:n realeza:s cor-azul:n ' +
      'cor-vermelho:n cor-verde:p cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n forte:s arma:s agua:s ' +
      'cabelo-comprido:s barba:s careca:n antigo:n recente:s t-dc:s'],
    ['t-rex', 'T-Rex (Jurassic Park)', '🦖', 'IFA',
      'real:n bicho:s coisa:n idoso:n brasileiro:n fala:n desenho:n filme:s serie:n livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:s pequeno:n ' +
      'ator:n politico:n rabo:s pelo:n pessoa:n masculino:q feminino:p crianca:n dinossauro:s forte:s rapido:p ' +
      'selvagem:s antigo:s recente:p t-jurassic:s'],
    ['blue-raptor', 'Blue (a velociraptor)', '🦕', 'FA',
      'real:n bicho:s coisa:n idoso:n brasileiro:n fala:n desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:n realeza:n cor-azul:p ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:q pequeno:n ' +
      'ator:n politico:n rabo:s pelo:n pessoa:n masculino:n feminino:s crianca:n dinossauro:s rapido:s selvagem:s ' +
      'antigo:n recente:s t-jurassic:s'],
    ['alan-grant', 'Dr. Alan Grant', '🦴', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:p ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n cientista:s chapeu:s ' +
      'barba:s careca:n oculos:n estrangeiro-eua:s antigo:s recente:n t-jurassic:s'],
    ['ian-malcolm', 'Dr. Ian Malcolm', '🕶️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n cientista:s oculos:p ' +
      'careca:n barba:n estrangeiro-eua:s antigo:s recente:n t-jurassic:s'],
    ['indiana-jones', 'Indiana Jones', '🤠', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:q canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n pirata:s professor:s ' +
      'cientista:s chapeu:s arma:s barba:p historia:p careca:n oculos:n estrangeiro-eua:s antigo:s recente:n'],
    ['chaves', 'Chaves', '🛢️', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n chapeu:s ' +
      'rico:n escola:s comida:n oculos:n antigo:s recente:n estrangeiro-eua:n europa:n t-chaves:s'],
    ['chiquinha', 'Chiquinha', '🎀', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:s barba:n careca:n oculos:s ruivo:p ' +
      'rico:n escola:s antigo:s recente:n estrangeiro-eua:n europa:n t-chaves:s'],
    ['quico', 'Quico', '⚓', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:p ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n chapeu:s ' +
      'rico:p escola:s oculos:n antigo:s recente:n estrangeiro-eua:n europa:n t-chaves:s'],
    ['nhonho', 'Nhonho', '🍔', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n rico:s ' +
      'escola:s chapeu:n oculos:n antigo:s recente:n estrangeiro-eua:n europa:n t-chaves:s'],
    ['seu-madruga', 'Seu Madruga', '🧢', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:p ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n chapeu:s barba:s rico:n ' +
      'careca:n oculos:n antigo:s recente:n estrangeiro-eua:n europa:n t-chaves:s'],
    ['dona-florinda', 'Dona Florinda', '🍳', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n chapeu:p rico:q casado:p ' +
      'oculos:n antigo:s recente:n estrangeiro-eua:n europa:n t-chaves:s'],
    ['professor-girafales', 'Professor Girafales', '🚬', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:p pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n professor:s chapeu:s ' +
      'barba:s casado:p careca:n oculos:n antigo:s recente:n estrangeiro-eua:n europa:n t-chaves:s'],
    ['seu-barriga', 'Seu Barriga', '💰', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n rico:s chapeu:p barba:p ' +
      'careca:p oculos:n antigo:s recente:n estrangeiro-eua:n europa:n t-chaves:s'],
    ['dona-clotilde', 'Dona Clotilde (Bruxa do 71)', '🧹', 'IFA',
      'real:n bicho:n coisa:n idoso:s brasileiro:n fala:s desenho:p filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n chapeu-magico:p rico:n ' +
      'oculos:n antigo:s recente:n estrangeiro-eua:n europa:n t-chaves:s'],
    ['chapolin', 'Chapolin Colorado', '🐞', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:q filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:p voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:s cor-verde:n cor-amarelo:p cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:q ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n arma:s chapeu:s inseto:q ' +
      'capa:n antigo:s recente:n estrangeiro-eua:n europa:n t-chaves:s'],
    ['eleven', 'Eleven (Stranger Things)', '🧇', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:s barba:n careca:p escola:p ' +
      'estrangeiro-eua:s antigo:n recente:s t-oitentas:n'],
    ['dustin', 'Dustin (Stranger Things)', '🧢', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n chapeu:s ' +
      'escola:s cientista:p estrangeiro-eua:s antigo:n recente:s'],
    ['demogorgon', 'Demogorgon', '👹', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:n desenho:n filme:n serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:p pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n masculino:? feminino:? crianca:n monstro:s forte:s selvagem:p ' +
      'antigo:n recente:s'],
    ['wandinha', 'Wandinha Addams', '🖤', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:p voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:p cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:p barba:n careca:n escola:s detetive:s ' +
      'dancar:p cabelo-comprido:s familia-grande:p rico:p estrangeiro-eua:s antigo:p recente:s'],
    ['mao-addams', 'Mãozinha (a mão da Wandinha)', '✋', 'IFA',
      'real:n bicho:n coisa:q idoso:n brasileiro:n fala:n desenho:p filme:s serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:p ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n masculino:? feminino:? crianca:n monstro:s estrangeiro-eua:? antigo:p ' +
      'recente:s'],
    ['matilda', 'Matilda', '📖', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:s barba:n careca:n escola:s ' +
      'cabelo-comprido:p oculos:n europa:p antigo:s recente:p'],
    ['trunchbull', 'Dona Trunchbull (Matilda)', '🔨', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:p heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:p pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n professor:s forte:s escola:n ' +
      'cabelo-comprido:n europa:p antigo:s recente:p'],
    ['willy-wonka', 'Willy Wonka', '🍫', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:s musica:n esporte:n heroi:n vilao:n magia:q voa:n engracado:p realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:s cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n rico:s cientista:p ' +
      'chapeu:s careca:n europa:? antigo:s recente:p'],
    ['oompa-loompa', 'Oompa-Loompa', '🟠', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:s musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:s grande:n pequeno:q ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n dancar:p selvagem:p ' +
      'antigo:s recente:p'],
    ['mary-poppins', 'Mary Poppins', '☂️', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:s canta:s musica:n esporte:n heroi:p vilao:n magia:s voa:s engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n dancar:p chapeu:s vestido:s ' +
      'professor:p europa:s antigo:s recente:n'],
    ['jack-sparrow', 'Capitão Jack Sparrow', '🏴‍☠️', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:q magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n pirata:s chapeu:s barba:s ' +
      'cabelo-comprido:s arma:s veiculo:s careca:n antigo:n recente:p'],
    ['dorothy', 'Dorothy (O Mágico de Oz)', '👠', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:s musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:s ' +
      'cor-vermelho:p cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:p barba:n careca:n vestido:s ' +
      'cabelo-comprido:p estrangeiro-eua:s antigo:s recente:n'],
    ['espantalho', 'Espantalho (O Mágico de Oz)', '🌾', 'FA',
      'real:n bicho:n coisa:p idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:s musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:p grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:q masculino:s feminino:n crianca:n vestido:n chapeu:s fazenda:p ' +
      'antigo:s recente:n'],
    ['homem-de-lata', 'Homem de Lata (O Mágico de Oz)', '🪓', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:s musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:q masculino:s feminino:n crianca:n vestido:n robo:p arma:s chapeu:s ' +
      'antigo:s recente:n'],
    ['leao-covarde', 'Leão Covarde (O Mágico de Oz)', '🦁', 'FA',
      'real:n bicho:s coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:s musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:q cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:s grande:n pequeno:n ' +
      'ator:n politico:n rabo:s pelo:s pessoa:n masculino:s feminino:n crianca:n gato:s selvagem:p antigo:s recente:n'],
    ['bruxa-ma-do-oeste', 'Bruxa Má do Oeste', '🧙‍♀️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:s voa:s engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n chapeu:s chapeu-magico:s ' +
      'vestido:s antigo:s recente:n'],
    ['king-kong', 'King Kong', '🦍', 'FA',
      'real:n bicho:s coisa:n idoso:n brasileiro:n fala:n desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:q vilao:q magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:s pequeno:n ' +
      'ator:n politico:n rabo:n pelo:s pessoa:n masculino:s feminino:n crianca:n forte:s selvagem:s antigo:s ' +
      'recente:p'],
    ['godzilla', 'Godzilla', '🦎', 'FA',
      'real:n bicho:p coisa:n idoso:n brasileiro:n fala:n desenho:q filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:p magia:p voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:s pequeno:n ' +
      'ator:n politico:n rabo:s pelo:n pessoa:n masculino:? feminino:? crianca:n monstro:s dinossauro:s forte:s ' +
      'agua:p antigo:s recente:p'],
    ['peter-venkman', 'Peter Venkman (Os Caça-Fantasmas)', '👻', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n cientista:s arma:p ' +
      'detetive:p careca:n barba:n estrangeiro-eua:s antigo:s recente:n'],
    ['geleia', 'Geleia (Os Caça-Fantasmas)', '🟩', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:n desenho:p filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:s engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n masculino:? feminino:? crianca:n monstro:s antigo:s recente:n'],
    ['homem-marshmallow', 'Homem de Marshmallow', '☁️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:n desenho:p filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:s cor-marrom:n grande:s pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n masculino:p feminino:n crianca:n monstro:s chapeu:s comida:p antigo:s ' +
      'recente:n'],
    ['rocky-balboa', 'Rocky Balboa', '🥊', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:s heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n forte:s casado:s careca:n ' +
      'barba:n estrangeiro-eua:s antigo:s recente:n'],
    ['tubarao-filme', 'Tubarão (o filme)', '🦈', 'FA',
      'real:n bicho:s coisa:n idoso:n brasileiro:n fala:n desenho:n filme:s serie:n livro:p videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:p cor-marrom:n grande:s pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:n masculino:? feminino:? crianca:n agua:s forte:s antigo:s recente:n'],
    ['ken', 'Ken (o filme da Barbie)', '🏄', 'IFA',
      'real:n bicho:n coisa:p idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:p musica:n esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:p ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:p cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:p masculino:s feminino:n crianca:n vestido:n dancar:p loiro:s casado:p ' +
      'careca:n antigo:n recente:s'],
    ['didi-moco', 'Didi Mocó (Os Trapalhões)', '🤪', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:s serie:s livro:n videogame:n internet:n ' +
      'tv:p disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n careca:n barba:n antigo:s ' +
      'recente:n'],
    ['mussum', 'Mussum (Os Trapalhões)', '🍺', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:s serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:p musica:p esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n careca:? barba:n antigo:s ' +
      'recente:n'],
    ['nino', 'Nino (Castelo Rá-Tim-Bum)', '🏰', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:s vestido:n barba:n careca:n ' +
      'chapeu-magico:s chapeu:? escola:n antigo:s recente:n'],
    ['morgana', 'Morgana (Castelo Rá-Tim-Bum)', '🔮', 'IFA',
      'real:n bicho:n coisa:n idoso:s brasileiro:s fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:s voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n chapeu-magico:s antigo:s ' +
      'recente:n'],
    ['doutor-victor', 'Dr. Victor (Castelo Rá-Tim-Bum)', '🧓', 'IFA',
      'real:n bicho:n coisa:n idoso:s brasileiro:s fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:p voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n chapeu-magico:p ' +
      'cientista:s barba:? antigo:s recente:n'],
    ['penelope', 'Penélope (Castelo Rá-Tim-Bum)', '🎙️', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:n feminino:s crianca:n barba:n antigo:s recente:n'],
    ['dr-abobrinha', 'Dr. Abobrinha (Castelo Rá-Tim-Bum)', '🎃', 'IFA',
      'real:n bicho:n coisa:n idoso:n brasileiro:s fala:s desenho:n filme:p serie:s livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s magia:n voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n antigo:s recente:n'],
    ['sherlock-holmes', 'Sherlock Holmes', '🔍', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:p livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n detetive:s chapeu:s ' +
      'europa:s antigo:s recente:p historia:p'],
    ['james-bond', 'James Bond (007)', '🍸', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:s videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n detetive:s arma:s ' +
      'veiculo:s rico:p europa:s antigo:s recente:p'],
    ['robin-hood', 'Robin Hood', '🏹', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:p videogame:n internet:n ' +
      'tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:s cor-amarelo:n cor-rosa:n cor-preto:n cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n folclore:s historia:p ' +
      'arma:s chapeu:s selvagem:p europa:s antigo:s recente:n'],
    ['edward-maos-de-tesoura', 'Edward Mãos de Tesoura', '✂️', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:n filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n engracado:n realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n cor-preto:s cor-branco:n cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n arma:p robo:p monstro:p ' +
      'cabelo-comprido:q estrangeiro-eua:s antigo:s recente:n'],
    ['beetlejuice', 'Beetlejuice', '🪲', 'FA',
      'real:n bicho:n coisa:n idoso:n brasileiro:n fala:s desenho:p filme:s serie:n livro:n videogame:n internet:n ' +
      'tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p magia:s voa:n engracado:s realeza:n cor-azul:n ' +
      'cor-vermelho:n cor-verde:p cor-amarelo:n cor-rosa:n cor-preto:p cor-branco:p cor-marrom:n grande:n pequeno:n ' +
      'ator:n politico:n rabo:n pelo:n pessoa:s masculino:s feminino:n crianca:n vestido:n monstro:p ' +
      'estrangeiro-eua:s antigo:s recente:p']
  ];
  (raiz.QEPersonagens = raiz.QEPersonagens || {}).filmes = L;
  if (typeof module === 'object' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
