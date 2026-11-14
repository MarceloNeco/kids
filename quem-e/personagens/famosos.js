/* Quem é? — A Meleca Adivinha: gente famosa de verdade (esporte, TV, internet, cinema, história, ciência e,
   só no Adulto, política), sem quem é famoso principalmente por música (esses ficam em outro arquivo).
   Formato igual ao de personagens/familia.js. Respostas como uma pessoa comum responderia; "vivo" vale para 2025;
   cores só quando há uniforme ou roupa muito lembrada; na dúvida, '?'. Política com respostas neutras e factuais. */
(function (raiz) {
  'use strict';
  var L = [
    ['pele', 'Pelé', '⚽', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n filme:p ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:p vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:n oculos:n careca:n barba:n rapido:p rico:s vivo:n antigo:s recente:n ' +
      'historia:q ator:n dancar:n futebol:s corrida:n cientista:n pintor:n politico:q oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n casado:p t-monica:p'],
    ['neymar', 'Neymar', '🤸', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n oculos:n loiro:p careca:n barba:p cabelo-comprido:q rapido:p rico:s vivo:s ' +
      'antigo:n recente:s historia:n ator:n dancar:n futebol:s corrida:n cientista:n pintor:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n casado:p'],
    ['messi', 'Lionel Messi', '🐐', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:p cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:p ' +
      'cor-marrom:? grande:n pequeno:n oculos:n careca:n barba:s rapido:p rico:s vivo:s antigo:n recente:p historia:n ' +
      'ator:n dancar:n futebol:s corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'espaco:n casado:s'],
    ['cristiano-ronaldo', 'Cristiano Ronaldo', '💪', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:p cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:p ' +
      'cor-marrom:? grande:n pequeno:n oculos:n careca:n barba:n rapido:p forte:p rico:s vivo:s antigo:n recente:n ' +
      'historia:n ator:n dancar:n futebol:s corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s espaco:n casado:p'],
    ['marta', 'Marta', '👟', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n oculos:n cabelo-comprido:p rapido:p vivo:s antigo:n recente:n historia:n ' +
      'ator:n dancar:n futebol:s corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'espaco:n'],
    ['ronaldo-fenomeno', 'Ronaldo Fenômeno', '🥅', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n careca:s barba:n rapido:s rico:s vivo:s antigo:s recente:n historia:n ator:n ' +
      'dancar:n futebol:s corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n ' +
      'casado:p'],
    ['ronaldinho', 'Ronaldinho Gaúcho', '😁', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:p oculos:n careca:n cabelo-comprido:s rico:s vivo:s antigo:p recente:n ' +
      'historia:n ator:n dancar:n futebol:s corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n t-monica:p'],
    ['romario', 'Romário', '🏟️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n careca:q cabelo-comprido:n rico:s vivo:s antigo:s recente:n historia:n ator:n ' +
      'dancar:n futebol:s corrida:n cientista:n pintor:n politico:s oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['zico', 'Zico', '🔴', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:p cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:p cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n careca:n barba:n vivo:s antigo:s recente:n historia:n ator:n dancar:n ' +
      'futebol:s corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['vinicius-jr', 'Vinícius Jr.', '🕺', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:? cor-preto:? cor-branco:p ' +
      'cor-marrom:? grande:n pequeno:n oculos:n careca:n rapido:s rico:s vivo:s antigo:n recente:s historia:n ator:n ' +
      'dancar:p futebol:s corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['mbappe', 'Kylian Mbappé', '🇫🇷', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:p cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:p ' +
      'cor-marrom:? grande:n pequeno:n careca:q barba:n rapido:s rico:s vivo:s antigo:n recente:s historia:n ator:n ' +
      'dancar:n futebol:s corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:s espaco:n'],
    ['ayrton-senna', 'Ayrton Senna', '🏎️', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:p livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:p vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:p cor-verde:? cor-amarelo:p cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:s rapido:s rico:s vivo:n antigo:s recente:n historia:n ator:n dancar:n ' +
      'futebol:n corrida:s cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n veiculo:s ' +
      'casado:p'],
    ['lewis-hamilton', 'Lewis Hamilton', '🏁', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:p cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:p cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:s barba:p rapido:s rico:s vivo:s antigo:n recente:p historia:n ator:n ' +
      'dancar:n futebol:n corrida:s cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:s espaco:n ' +
      'veiculo:s'],
    ['rebeca-andrade', 'Rebeca Andrade', '🥇', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n cabelo-comprido:p forte:p vivo:s antigo:n recente:s historia:n ator:n dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['rayssa-leal', 'Rayssa Leal', '🛹', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:? idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:p tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n cabelo-comprido:s rapido:p vivo:s antigo:n recente:s historia:n ator:n ' +
      'dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n ' +
      'veiculo:p'],
    ['daiane-dos-santos', 'Daiane dos Santos', '🤾‍♀️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n cabelo-comprido:q forte:p vivo:s antigo:n recente:n historia:n ator:n dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['guga', 'Guga (Gustavo Kuerten)', '🎾', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:p cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n careca:n cabelo-comprido:p vivo:s antigo:s recente:n historia:n ator:n ' +
      'dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['usain-bolt', 'Usain Bolt', '⚡', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:p cor-amarelo:p cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n careca:n barba:n rapido:s rico:s vivo:s antigo:n recente:n historia:n ator:n ' +
      'dancar:n futebol:n corrida:s cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['serena-williams', 'Serena Williams', '🎾', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n forte:s rico:s vivo:s antigo:p recente:n historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s europa:n espaco:n casado:p'],
    ['michael-jordan', 'Michael Jordan', '🏀', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:p ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:p cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:p pequeno:n careca:s rico:s vivo:s antigo:s recente:n historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s europa:n espaco:n t-scooby:p'],
    ['lebron-james', 'LeBron James', '👑', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:p ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:p cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:p pequeno:n barba:s forte:s rico:s vivo:s antigo:n recente:n historia:n ator:n dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s europa:n espaco:n t-scooby:p'],
    ['muhammad-ali', 'Muhammad Ali', '🥊', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n careca:n barba:n rapido:p forte:s rico:p vivo:n antigo:s recente:n historia:n ' +
      'ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s europa:n ' +
      'espaco:n'],
    ['simone-biles', 'Simone Biles', '🤸‍♀️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n forte:p vivo:s antigo:n recente:s historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s europa:n espaco:n casado:p'],
    ['michael-phelps', 'Michael Phelps', '🏊', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:p pequeno:n rapido:p rico:s vivo:s antigo:n recente:n historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s europa:n espaco:n'],
    ['popo', 'Popó', '🥊', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n careca:s forte:s vivo:s antigo:p recente:n historia:n ator:n dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:n politico:p oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['anderson-silva', 'Anderson Silva', '🥋', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n careca:s barba:p forte:s vivo:s antigo:n recente:n historia:n ator:n dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['silvio-santos', 'Silvio Santos', '💸', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:s disney:n canta:? musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n oculos:n careca:n barba:n rico:s vivo:n antigo:s recente:n historia:n ator:n ' +
      'dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n ' +
      'casado:p familia-grande:s'],
    ['faustao', 'Faustão', '📺', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:n rico:s vivo:s antigo:s recente:n historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['ana-maria-braga', 'Ana Maria Braga', '🍳', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:p brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n loiro:s cabelo-comprido:n rico:s vivo:s antigo:s recente:n historia:n ator:n ' +
      'dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['luciano-huck', 'Luciano Huck', '🎬', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n careca:n barba:n rico:s vivo:s antigo:p recente:n historia:n ator:n dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n casado:s'],
    ['gugu', 'Gugu', '🎤', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:n rico:s vivo:n antigo:s recente:n historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['chacrinha', 'Chacrinha', '📯', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:s oculos:s vivo:n antigo:s recente:n historia:q ator:n dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['jo-soares', 'Jô Soares', '🎙️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n oculos:s barba:s vivo:n antigo:s recente:n historia:n ator:p dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:p politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['tata-werneck', 'Tatá Werneck', '🤪', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:s livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n cabelo-comprido:p vivo:s antigo:n recente:p historia:n ator:s dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n casado:s ' +
      't-novela:p'],
    ['whindersson', 'Whindersson Nunes', '😂', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:p ' +
      'serie:q livro:n videogame:n internet:s tv:n disney:n canta:p musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:p rico:s vivo:s antigo:n recente:s historia:n ator:p dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n casado:p'],
    ['felipe-neto', 'Felipe Neto', '📱', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:s tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:p rico:s vivo:s antigo:n recente:p historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n familia-grande:p'],
    ['luccas-neto', 'Luccas Neto', '🤩', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:p ' +
      'serie:q livro:n videogame:n internet:s tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n rico:s vivo:s antigo:n recente:s historia:n ator:p dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n familia-grande:p'],
    ['enaldinho', 'Enaldinho', '🎮', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:q idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:s tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:n vivo:s antigo:n recente:s historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['mrbeast', 'MrBeast', '🐯', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:s tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:s rico:s vivo:s antigo:n recente:s historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s europa:n espaco:n'],
    ['galvao-bueno', 'Galvão Bueno', '🗣️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:p disney:n canta:n musica:n esporte:p heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:n rico:s vivo:s antigo:s recente:n historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['didi', 'Didi (Renato Aragão)', '🤡', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:s fala:s desenho:n filme:s ' +
      'serie:p livro:n videogame:n internet:n tv:p disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n vivo:s antigo:s recente:n historia:n ator:s dancar:n futebol:n corrida:n ' +
      'cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['tony-ramos', 'Tony Ramos', '🎭', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n filme:q ' +
      'serie:s livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:p pelo:p vivo:s antigo:s recente:n historia:n ator:s dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n t-novela:p'],
    ['fernanda-montenegro', 'Fernanda Montenegro', '🎭', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:s brasileiro:s fala:s desenho:n filme:s ' +
      'serie:s livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n vivo:s antigo:s recente:n historia:n ator:s dancar:n futebol:n corrida:n ' +
      'cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n t-novela:p'],
    ['selton-mello', 'Selton Mello', '🎞️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:s ' +
      'serie:s livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:p vivo:s antigo:p recente:n historia:n ator:s dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n t-novela:p'],
    ['wagner-moura', 'Wagner Moura', '🎬', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:s ' +
      'serie:s livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:p vivo:s antigo:q recente:n historia:n ator:s dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n t-acao:p'],
    ['jim-carrey', 'Jim Carrey', '🤪', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:s ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n rico:s vivo:s antigo:s recente:n historia:n ator:s dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:q europa:n espaco:n'],
    ['tom-hanks', 'Tom Hanks', '🤠', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n filme:s ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n rico:s vivo:s antigo:s recente:n historia:n ator:s dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:s estrangeiro-eua:s europa:n espaco:n casado:s t-toy-story:p'],
    ['keanu-reeves', 'Keanu Reeves', '🕶️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:s ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:s cabelo-comprido:s rico:s vivo:s antigo:s recente:n historia:n ator:s ' +
      'dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:q europa:n espaco:n ' +
      't-acao:p'],
    ['arnold', 'Arnold Schwarzenegger', '🦾', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n filme:s ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n forte:s rico:s vivo:s antigo:s recente:n historia:n ator:s dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:p oscar:n estrangeiro-eua:p europa:p espaco:n t-acao:p'],
    ['stallone', 'Sylvester Stallone', '🥊', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n filme:s ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n forte:s rico:s vivo:s antigo:s recente:n historia:n ator:s dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s europa:n espaco:n t-acao:p'],
    ['will-smith', 'Will Smith', '🕴️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:s ' +
      'serie:s livro:n videogame:n internet:n tv:n disney:n canta:p musica:p esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n rico:s vivo:s antigo:s recente:n historia:n ator:s dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:s estrangeiro-eua:s europa:n espaco:n casado:s'],
    ['charlie-chaplin', 'Charlie Chaplin', '🎩', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:s ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:p cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:s barba:s vivo:n antigo:s recente:n historia:p ator:s dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:n politico:n oscar:s estrangeiro-eua:n europa:s espaco:n'],
    ['marilyn-monroe', 'Marilyn Monroe', '💋', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n filme:s ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:p musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:p ' +
      'cor-marrom:? grande:n pequeno:n loiro:s vestido:s vivo:n antigo:s recente:n historia:n ator:s dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s europa:n espaco:n casado:s'],
    ['audrey-hepburn', 'Audrey Hepburn', '👗', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n filme:s ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:p cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n vestido:s vivo:n antigo:s recente:n historia:n ator:s dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:s estrangeiro-eua:n europa:s espaco:n'],
    ['fabio-junior', 'Fábio Júnior', '🎶', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:s livro:n videogame:n internet:n tv:n disney:n canta:s musica:p esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n vivo:s antigo:s recente:n historia:n ator:s dancar:n futebol:n corrida:n ' +
      'cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n casado:p t-novela:p'],
    ['tiradentes', 'Tiradentes', '📜', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:p ' +
      'cor-marrom:? grande:n pequeno:n barba:s cabelo-comprido:s vivo:n antigo:s recente:n historia:s ator:n dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:n politico:q oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['dom-pedro-1', 'Dom Pedro I', '⚔️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:p fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:n realeza:s cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:p barba:p capa:p arma:p rico:s vivo:n antigo:s recente:n historia:s ' +
      'ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:p ' +
      'espaco:n casado:s'],
    ['dom-pedro-2', 'Dom Pedro II', '👴', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:s cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:s rico:s vivo:n antigo:s recente:n historia:s ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['princesa-isabel', 'Princesa Isabel', '👸', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:n realeza:s cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n vestido:s vivo:n antigo:s recente:n historia:s ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n casado:s'],
    ['cabral', 'Pedro Álvares Cabral', '⛵', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:s vivo:n antigo:s recente:n historia:s ator:n dancar:n futebol:n ' +
      'corrida:n cientista:p pintor:n politico:n oscar:n estrangeiro-eua:n europa:s pirata:p espaco:n veiculo:p'],
    ['zumbi', 'Zumbi dos Palmares', '✊', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n arma:p forte:p vivo:n antigo:s recente:n historia:s ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['santos-dumont', 'Santos Dumont', '✈️', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:p ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:s barba:s vivo:n antigo:s recente:n historia:s ator:n dancar:n ' +
      'futebol:n corrida:n cientista:s pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n veiculo:s'],
    ['oswaldo-cruz', 'Oswaldo Cruz', '💉', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:s vivo:n antigo:s recente:n historia:s ator:n dancar:n futebol:n ' +
      'corrida:n cientista:s pintor:n politico:n oscar:n estrangeiro-eua:n europa:n professor:s espaco:n'],
    ['getulio-vargas', 'Getúlio Vargas', '🏛️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n careca:p vivo:n antigo:s recente:n historia:p ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:s oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['jk', 'Juscelino Kubitschek (JK)', '🏙️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n careca:n vivo:n antigo:s recente:n historia:p ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:s oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['cleopatra', 'Cleópatra', '🐍', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n filme:p ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:s cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:s cabelo-comprido:s rico:s vivo:n antigo:s recente:n historia:s ator:n ' +
      'dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n ' +
      'casado:s'],
    ['julio-cesar', 'Júlio César', '🏛️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:p cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:p arma:p vivo:n antigo:s recente:n historia:s ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:s oscar:n estrangeiro-eua:n europa:s espaco:n'],
    ['napoleao', 'Napoleão', '🎖️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:p cor-azul:p cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:s arma:p vivo:n antigo:s recente:n historia:s ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:s oscar:n estrangeiro-eua:n europa:s espaco:n casado:s'],
    ['da-vinci', 'Leonardo da Vinci', '🖼️', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:s cabelo-comprido:s vivo:n antigo:s recente:n historia:s ator:n dancar:n ' +
      'futebol:n corrida:n cientista:s pintor:s politico:n oscar:n estrangeiro-eua:n europa:s espaco:n'],
    ['michelangelo', 'Michelangelo', '🗿', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:s vivo:n antigo:s recente:n historia:s ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:s politico:n oscar:n estrangeiro-eua:n europa:s espaco:n'],
    ['van-gogh', 'Van Gogh', '🌻', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:p ruivo:s barba:s rico:n vivo:n antigo:s recente:n historia:s ator:n ' +
      'dancar:n futebol:n corrida:n cientista:n pintor:s politico:n oscar:n estrangeiro-eua:n europa:s espaco:n'],
    ['frida-kahlo', 'Frida Kahlo', '🌺', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:s cabelo-comprido:s vestido:s vivo:n antigo:s recente:n historia:p ' +
      'ator:n dancar:n futebol:n corrida:n cientista:n pintor:s politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'espaco:n casado:s'],
    ['picasso', 'Pablo Picasso', '🎨', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n careca:p rico:s vivo:n antigo:s recente:n historia:p ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:s politico:n oscar:n estrangeiro-eua:n europa:s espaco:n'],
    ['tarsila', 'Tarsila do Amaral', '🖌️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ator:n dancar:n futebol:n corrida:n ' +
      'cientista:n pintor:s politico:n oscar:n estrangeiro-eua:n europa:n espaco:n casado:s'],
    ['monteiro-lobato', 'Monteiro Lobato', '📚', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:p videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:s vivo:n antigo:s recente:n historia:p ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:s politico:n oscar:n estrangeiro-eua:n europa:n espaco:n t-sitio:p'],
    ['machado-de-assis', 'Machado de Assis', '✒️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n oculos:s barba:s vivo:n antigo:s recente:n historia:s ator:n dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:s politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['einstein', 'Albert Einstein', '🧠', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:s cabelo-comprido:p vivo:n antigo:s recente:n historia:p ator:n dancar:n ' +
      'futebol:n corrida:n cientista:s pintor:n politico:n oscar:n estrangeiro-eua:n europa:s professor:p espaco:n'],
    ['newton', 'Isaac Newton', '🍎', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n cabelo-comprido:s vivo:n antigo:s recente:n historia:s ator:n dancar:n ' +
      'futebol:n corrida:n cientista:s pintor:n politico:n oscar:n estrangeiro-eua:n europa:s espaco:n'],
    ['galileu', 'Galileu Galilei', '🔭', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:s vivo:n antigo:s recente:n historia:s ator:n dancar:n futebol:n ' +
      'corrida:n cientista:s pintor:n politico:n oscar:n estrangeiro-eua:n europa:s espaco:n'],
    ['marie-curie', 'Marie Curie', '⚗️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ator:n dancar:n futebol:n corrida:n ' +
      'cientista:s pintor:n politico:n oscar:n estrangeiro-eua:n europa:s espaco:n casado:s'],
    ['darwin', 'Charles Darwin', '🐢', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n careca:p barba:s vivo:n antigo:s recente:n historia:s ator:n dancar:n ' +
      'futebol:n corrida:n cientista:s pintor:n politico:n oscar:n estrangeiro-eua:n europa:s espaco:n'],
    ['edison', 'Thomas Edison', '💡', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n rico:s vivo:n antigo:s recente:n historia:s ator:n dancar:n futebol:n ' +
      'corrida:n cientista:s pintor:n politico:n oscar:n estrangeiro-eua:s europa:n espaco:n'],
    ['tesla', 'Nikola Tesla', '🔌', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:s rico:n vivo:n antigo:s recente:n historia:s ator:n dancar:n futebol:n ' +
      'corrida:n cientista:s pintor:n politico:n oscar:n estrangeiro-eua:p europa:s espaco:n'],
    ['colombo', 'Cristóvão Colombo', '🧭', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n cabelo-comprido:p vivo:n antigo:s recente:n historia:s ator:n dancar:n ' +
      'futebol:n corrida:n cientista:p pintor:n politico:n oscar:n estrangeiro-eua:n europa:s pirata:p espaco:n ' +
      'veiculo:p'],
    ['neil-armstrong', 'Neil Armstrong', '🌕', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:p ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:s vivo:n antigo:s recente:n historia:q ator:n dancar:n futebol:n ' +
      'corrida:n cientista:p pintor:n politico:n oscar:n estrangeiro-eua:s europa:n espaco:s veiculo:s'],
    ['marcos-pontes', 'Marcos Pontes', '🚀', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:p ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:s barba:s vivo:s antigo:n recente:n historia:n ator:n dancar:n ' +
      'futebol:n corrida:n cientista:p pintor:n politico:s oscar:n estrangeiro-eua:n europa:n espaco:s veiculo:s'],
    ['gagarin', 'Yuri Gagarin', '🛰️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:p ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:s vivo:n antigo:s recente:n historia:p ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:p espaco:s veiculo:s'],
    ['walt-disney', 'Walt Disney', '🏰', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:s canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:s rico:s vivo:n antigo:s recente:n historia:p ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:s politico:n oscar:s estrangeiro-eua:s europa:n espaco:n t-mickey:p'],
    ['steve-jobs', 'Steve Jobs', '🍏', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:s cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n oculos:s careca:p barba:p rico:s vivo:n antigo:s recente:n historia:n ator:n ' +
      'dancar:n futebol:n corrida:n cientista:p pintor:n politico:n oscar:n estrangeiro-eua:s europa:n espaco:n'],
    ['bill-gates', 'Bill Gates', '💻', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n oculos:s rico:s vivo:s antigo:s recente:n historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:p pintor:n politico:n oscar:n estrangeiro-eua:s europa:n espaco:n'],
    ['elon-musk', 'Elon Musk', '🚗', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:p tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n rico:s vivo:s antigo:n recente:p historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:p pintor:n politico:p oscar:n estrangeiro-eua:p europa:n espaco:p veiculo:p ' +
      'familia-grande:s'],
    ['zuckerberg', 'Mark Zuckerberg', '👍', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:p tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n rico:s vivo:s antigo:n recente:n historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:p pintor:n politico:n oscar:n estrangeiro-eua:s europa:n espaco:n'],
    ['martin-luther-king', 'Martin Luther King', '🕊️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:s vivo:n antigo:s recente:n historia:p ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:p oscar:n estrangeiro-eua:s europa:n espaco:n'],
    ['mandela', 'Nelson Mandela', '🌍', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:n ator:n dancar:n futebol:n corrida:n ' +
      'cientista:n pintor:n politico:s oscar:n estrangeiro-eua:n europa:n espaco:n casado:s'],
    ['gandhi', 'Gandhi', '☮️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:p ' +
      'cor-marrom:? grande:n pequeno:n oculos:s careca:s rico:n vivo:n antigo:s recente:n historia:p ator:n dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:n politico:p oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['madre-teresa', 'Madre Teresa', '🙏', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:s brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:p cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:p ' +
      'cor-marrom:? grande:n pequeno:n chapeu:s rico:n vivo:n antigo:s recente:n historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:p espaco:n'],
    ['papa-francisco', 'Papa Francisco', '⛪', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:s ' +
      'cor-marrom:? grande:n pequeno:n chapeu:s rico:n vivo:n antigo:n recente:p historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['rainha-elizabeth', 'Rainha Elizabeth II', '👑', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:s brasileiro:n fala:s desenho:n filme:q ' +
      'serie:p livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:s cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:s vestido:p rico:s vivo:n antigo:s recente:n historia:n ator:n dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:s espaco:n casado:s ' +
      'familia-grande:p'],
    ['princesa-diana', 'Princesa Diana', '💐', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:p livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:s cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n loiro:s vestido:s vivo:n antigo:s recente:n historia:n ator:n dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:s espaco:n casado:s'],
    ['shakespeare', 'William Shakespeare', '🪶', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n careca:p barba:s vivo:n antigo:s recente:n historia:s ator:n dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:s politico:n oscar:n estrangeiro-eua:n europa:s espaco:n'],
    ['anne-frank', 'Anne Frank', '📔', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:n filme:p ' +
      'serie:q livro:p videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ator:n dancar:n futebol:n corrida:n ' +
      'cientista:n pintor:p politico:n oscar:n estrangeiro-eua:n europa:s espaco:n'],
    ['lula', 'Lula', '🗳️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:s vivo:s antigo:s recente:n historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:s oscar:n estrangeiro-eua:n europa:n espaco:n casado:s'],
    ['bolsonaro', 'Jair Bolsonaro', '🗳️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:n vivo:s antigo:n recente:p historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:s oscar:n estrangeiro-eua:n europa:n espaco:n casado:s ' +
      'familia-grande:p'],
    ['obama', 'Barack Obama', '🇺🇸', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n barba:n vivo:s antigo:n recente:n historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:s oscar:n estrangeiro-eua:s europa:n espaco:n casado:s'],
    ['trump', 'Donald Trump', '🏢', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:p disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n loiro:p rico:s vivo:s antigo:s recente:n historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:s oscar:n estrangeiro-eua:s europa:n espaco:n casado:s'],
    ['lincoln', 'Abraham Lincoln', '🎩', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:s barba:s vivo:n antigo:s recente:n historia:s ator:n dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:n politico:s oscar:n estrangeiro-eua:s europa:n espaco:n'],
    ['kennedy', 'John F. Kennedy', '🇺🇸', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ator:n dancar:n futebol:n corrida:n ' +
      'cientista:n pintor:n politico:s oscar:n estrangeiro-eua:s europa:n espaco:n casado:s familia-grande:s'],
    ['dilma', 'Dilma Rousseff', '🗳️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:p brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n vivo:s antigo:n recente:n historia:n ator:n dancar:n futebol:n corrida:n ' +
      'cientista:n pintor:n politico:s oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['fhc', 'Fernando Henrique Cardoso', '📖', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:s fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n oculos:p vivo:s antigo:s recente:n historia:n ator:n dancar:n futebol:n ' +
      'corrida:n cientista:n pintor:n politico:s oscar:n estrangeiro-eua:n europa:n professor:p espaco:n'],
    ['churchill', 'Winston Churchill', '🇬🇧', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:n filme:q ' +
      'serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n magia:n voa:n ' +
      'engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? cor-preto:? cor-branco:? ' +
      'cor-marrom:? grande:n pequeno:n chapeu:p careca:p vivo:n antigo:s recente:n historia:p ator:n dancar:n ' +
      'futebol:n corrida:n cientista:n pintor:n politico:s oscar:n estrangeiro-eua:n europa:s espaco:n']
  ];
  (raiz.QEPersonagens = raiz.QEPersonagens || {}).famosos = L;
  if (typeof module === 'object' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
