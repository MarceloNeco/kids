/* Quem é? — A Meleca Adivinha: HISTÓRIA, CIÊNCIA, ARTE, LIVROS, CONTOS e MITOS. Gente da história do Brasil e do
   mundo (já falecida), cientistas, inventores, exploradores, escritores, pintores e compositores; personagens de livros
   clássicos e do Sítio; contos de fadas e fábulas; mitologia grega, nórdica, egípcia e chinesa; criaturas de lenda;
   folclore brasileiro que faltava e figuras de festas.
   Formato igual ao de personagens/familia.js; perguntas em adivinha-perguntas.js. */
(function (raiz) {
  'use strict';
  var L = [
    ['dom-joao-6', 'Dom João VI', '🍗', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:q fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:s cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:n politico:p estrangeiro-eua:n europa:s rico:s casado:s barba:n chapeu:?'],
    ['leopoldina', 'Imperatriz Leopoldina', '👑', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:p fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:s cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:p pintor:n politico:n estrangeiro-eua:n europa:s rico:s casado:s familia-grande:s'],
    ['jose-bonifacio', 'José Bonifácio', '🏛️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:p pintor:n politico:s estrangeiro-eua:n europa:n cabelo-comprido:p barba:n'],
    ['anita-garibaldi', 'Anita Garibaldi', '⚔️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:n politico:n estrangeiro-eua:n europa:q arma:p casado:s cabelo-comprido:s'],
    ['maria-quiteria', 'Maria Quitéria', '🪖', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:n politico:n estrangeiro-eua:n europa:n arma:s chapeu:p cabelo-comprido:n casado:?'],
    ['deodoro', 'Marechal Deodoro da Fonseca', '🎖️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:n politico:s estrangeiro-eua:n europa:n barba:s careca:p arma:p'],
    ['rondon', 'Marechal Rondon', '🧭', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:s pintor:n politico:n estrangeiro-eua:n europa:n pirata:p barba:s chapeu:p selvagem:p'],
    ['carlos-chagas', 'Carlos Chagas', '🔬', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:s pintor:n politico:n estrangeiro-eua:n europa:n professor:s barba:s inseto:q'],
    ['vital-brazil', 'Vital Brazil', '🐍', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:s pintor:n politico:n estrangeiro-eua:n europa:n professor:s barba:s careca:p'],
    ['aleijadinho', 'Aleijadinho', '🗿', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:? brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:n chapeu:?'],
    ['portinari', 'Candido Portinari', '🎨', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:n barba:n oculos:?'],
    ['di-cavalcanti', 'Di Cavalcanti', '🖌️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:n barba:n casado:s'],
    ['anita-malfatti', 'Anita Malfatti', '🖼️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:? brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:n cabelo-comprido:q casado:n'],
    ['villa-lobos', 'Heitor Villa-Lobos', '🎻', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:n politico:n estrangeiro-eua:n europa:n careca:q'],
    ['clarice-lispector', 'Clarice Lispector', '📖', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:p fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:q cabelo-comprido:p'],
    ['cecilia-meireles', 'Cecília Meireles', '🌸', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:p brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:n professor:s escola:n'],
    ['drummond', 'Carlos Drummond de Andrade', '👓', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:n oculos:s careca:p'],
    ['jorge-amado', 'Jorge Amado', '🌴', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:s fala:s desenho:n ' +
      'filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:n casado:s barba:n'],
    ['ariano-suassuna', 'Ariano Suassuna', '🎭', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:s fala:s desenho:n ' +
      'filme:p serie:p livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:n ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:n professor:s'],
    ['jose-de-alencar', 'José de Alencar', '🪶', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:s politico:p estrangeiro-eua:n europa:n barba:s'],
    ['castro-alves', 'Castro Alves', '📜', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:n barba:s cabelo-comprido:q'],
    ['ziraldo', 'Ziraldo', '🖍️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:s fala:s desenho:? ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:n ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:n oculos:p barba:q'],
    ['chico-mendes', 'Chico Mendes', '🌳', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:n ' +
      'cientista:n pintor:n politico:n estrangeiro-eua:n europa:n selvagem:s barba:s'],
    ['ana-neri', 'Ana Néri', '🩺', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:p brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:n politico:n estrangeiro-eua:n europa:n professor:p chapeu:p familia-grande:p'],
    ['niemeyer', 'Oscar Niemeyer', '🏢', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:n ' +
      'cientista:n pintor:p politico:n estrangeiro-eua:n europa:n careca:p oculos:q'],
    ['luiz-gama', 'Luiz Gama', '⚖️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:p politico:n estrangeiro-eua:n europa:n barba:s professor:n'],
    ['carlos-gomes', 'Carlos Gomes', '🎶', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:n politico:n estrangeiro-eua:n europa:q barba:s cabelo-comprido:s'],
    ['marco-polo', 'Marco Polo', '🐫', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:p pintor:n politico:n estrangeiro-eua:n europa:s pirata:p barba:p chapeu:p rico:p'],
    ['joana-darc', 'Joana d\'Arc', '🛡️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:q idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:p serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:n politico:n estrangeiro-eua:n europa:s arma:s cabelo-comprido:n'],
    ['copernico', 'Nicolau Copérnico', '🪐', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:s pintor:n politico:n estrangeiro-eua:n europa:s espaco:q cabelo-comprido:p barba:n'],
    ['arquimedes', 'Arquimedes', '🛁', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:s pintor:n politico:n estrangeiro-eua:n europa:s barba:s professor:q agua:q'],
    ['pitagoras', 'Pitágoras', '📐', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:s pintor:n politico:n estrangeiro-eua:n europa:s professor:s barba:s escola:p'],
    ['aristoteles', 'Aristóteles', '🏺', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:p pintor:p politico:n estrangeiro-eua:n europa:s professor:s barba:s'],
    ['alexandre-o-grande', 'Alexandre, o Grande', '🐎', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:n ' +
      'magia:n voa:n engracado:n realeza:s cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:n politico:n estrangeiro-eua:n europa:s arma:s barba:n rico:s'],
    ['tutancamon', 'Tutancâmon', '⚱️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:s cor-azul:p cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:n politico:n estrangeiro-eua:n europa:n rico:s chapeu:s careca:?'],
    ['vasco-da-gama', 'Vasco da Gama', '⛵', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:p pintor:n politico:n estrangeiro-eua:n europa:s pirata:p barba:s veiculo:p chapeu:p'],
    ['fernao-de-magalhaes', 'Fernão de Magalhães', '🌐', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:p pintor:n politico:n estrangeiro-eua:n europa:s pirata:p barba:s veiculo:p'],
    ['graham-bell', 'Alexander Graham Bell', '☎️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:s pintor:n politico:n estrangeiro-eua:p europa:p barba:s professor:p'],
    ['irmaos-wright', 'Irmãos Wright', '🛩️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:p engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:s pintor:n politico:n estrangeiro-eua:s europa:n veiculo:s careca:p barba:p'],
    ['gutenberg', 'Johannes Gutenberg', '🖨️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:q videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:s pintor:n politico:n estrangeiro-eua:n europa:s barba:s chapeu:p'],
    ['pasteur', 'Louis Pasteur', '🧫', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:s pintor:n politico:n estrangeiro-eua:n europa:s professor:p barba:s'],
    ['fleming', 'Alexander Fleming', '💊', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:s pintor:n politico:n estrangeiro-eua:n europa:s professor:s barba:n'],
    ['hawking', 'Stephen Hawking', '🌌', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:p ' +
      'filme:q serie:p livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:n ' +
      'cientista:s pintor:n politico:n estrangeiro-eua:n europa:s professor:s espaco:p oculos:s veiculo:p'],
    ['ada-lovelace', 'Ada Lovelace', '💻', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:s pintor:n politico:n estrangeiro-eua:n europa:s robo:q cabelo-comprido:p vestido:s'],
    ['alan-turing', 'Alan Turing', '🧮', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:p serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:s pintor:n politico:n estrangeiro-eua:n europa:s professor:p robo:q corrida:p'],
    ['florence-nightingale', 'Florence Nightingale', '🏮', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:n politico:n estrangeiro-eua:n europa:s professor:p vestido:s chapeu:p'],
    ['amelia-earhart', 'Amelia Earhart', '✈️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:p engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:n politico:n estrangeiro-eua:s europa:n veiculo:s cabelo-comprido:n chapeu:p pirata:p'],
    ['laika', 'Laika (a cadela do espaço)', '🐕', 'FA',
      'real:s pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:n desenho:n ' +
      'filme:n serie:n livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:p engracado:n realeza:n cor-azul:n cor-vermelho:n cor-verde:n cor-amarelo:n cor-rosa:n ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p cachorro:s ' +
      'pelo:s rabo:s espaco:s veiculo:p europa:p estimacao:q selvagem:n'],
    ['helen-keller', 'Helen Keller', '🤟', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:p politico:n estrangeiro-eua:s europa:n professor:q'],
    ['rosa-parks', 'Rosa Parks', '🚌', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:n politico:n estrangeiro-eua:s europa:n veiculo:p oculos:p'],
    ['cervantes', 'Miguel de Cervantes', '🗡️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:s barba:s arma:p'],
    ['dickens', 'Charles Dickens', '🎄', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:s barba:s festa:p'],
    ['julio-verne', 'Júlio Verne', '🎈', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:s barba:s espaco:? pirata:q'],
    ['andersen', 'Hans Christian Andersen', '🦢', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:s chapeu:p barba:q'],
    ['irmaos-grimm', 'Irmãos Grimm', '📕', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:s professor:s folclore:p'],
    ['esopo', 'Esopo', '🦊', 'A',
      'real:p pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:? brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:s barba:s chapeu:n oculos:n careca:q folclore:p ' +
      'professor:n casado:?'],
    ['lewis-carroll', 'Lewis Carroll', '🫖', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:s professor:s barba:n'],
    ['tolkien', 'J. R. R. Tolkien', '💍', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:n ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:s professor:s barba:n'],
    ['agatha-christie', 'Agatha Christie', '🔎', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:s brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:n ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:s detetive:p'],
    ['homero', 'Homero', '🏛', 'A',
      'real:p pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:s barba:s cabelo-comprido:p'],
    ['camoes', 'Luís de Camões', '⚓', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:s barba:s pirata:p'],
    ['fernando-pessoa', 'Fernando Pessoa', '🎩', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:s oculos:s chapeu:s barba:s'],
    ['monet', 'Claude Monet', '🪷', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:s barba:s chapeu:p'],
    ['rembrandt', 'Rembrandt', '🕯️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:s barba:s chapeu:s rico:p'],
    ['dali', 'Salvador Dalí', '🕰️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:n ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:n europa:s barba:s'],
    ['andy-warhol', 'Andy Warhol', '🥫', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:p cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:n ' +
      'cientista:n pintor:s politico:n estrangeiro-eua:s europa:n oculos:p'],
    ['bach', 'Johann Sebastian Bach', '🎹', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:p cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:n politico:n estrangeiro-eua:n europa:s cabelo-comprido:p'],
    ['vivaldi', 'Antonio Vivaldi', '🍂', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:n politico:n estrangeiro-eua:n europa:s ruivo:s cabelo-comprido:p'],
    ['chopin', 'Frédéric Chopin', '🎼', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:s ' +
      'cientista:n pintor:n politico:n estrangeiro-eua:n europa:s barba:n'],
    ['tchaikovsky', 'Tchaikovsky', '🩰', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:p ' +
      'cientista:n pintor:n politico:n estrangeiro-eua:n europa:s barba:s dancar:p festa:p'],
    ['dom-quixote', 'Dom Quixote', '🛡', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n barba:s ' +
      'arma:s chapeu:s pirata:p europa:s historia:p'],
    ['sancho-panca', 'Sancho Pança', '🫏', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n barba:p ' +
      'chapeu:p europa:s historia:p'],
    ['pequeno-principe', 'O Pequeno Príncipe', '🌟', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:q serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:? realeza:s cor-azul:q cor-vermelho:q cor-verde:s cor-amarelo:p cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:s loiro:s ' +
      'europa:q capa:p'],
    ['rosa-pequeno-principe', 'Rosa (O Pequeno Príncipe)', '🌹', 'IFA',
      'real:n pessoa:n bicho:n coisa:p masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:q serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:s cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:s antigo:s recente:n robo:n espaco:s'],
    ['raposa-pequeno-principe', 'Raposa (O Pequeno Príncipe)', '🦊', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:q serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:s grande:n pequeno:n antigo:s recente:n robo:n espaco:q rabo:s ' +
      'pelo:s orelhas:p selvagem:p'],
    ['coelho-branco', 'Coelho Branco (Alice)', '⏱️', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:s serie:? livro:s videogame:n internet:n tv:n disney:s canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:p cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:s cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n orelhas:s ' +
      'rapido:p pelo:s europa:p'],
    ['rainha-de-copas', 'Rainha de Copas', '♥️', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:s serie:? livro:s videogame:n internet:n tv:n disney:s canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:n voa:n engracado:? realeza:s cor-azul:q cor-vermelho:s cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:p cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n chapeu:s ' +
      'vestido:s europa:p'],
    ['gato-de-cheshire', 'Gato de Cheshire (Gato Risonho)', '😸', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:s serie:? livro:s videogame:n internet:n tv:n disney:s canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:s voa:n engracado:s realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:s ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n gato:s ' +
      'rabo:s pelo:s'],
    ['wendy', 'Wendy (Peter Pan)', '🌙', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:s serie:? livro:s videogame:n internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:s engracado:? realeza:n cor-azul:s cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n vestido:s ' +
      'europa:s familia-grande:p cabelo-comprido:p'],
    ['rei-arthur', 'Rei Arthur', '🗡', 'FA',
      'real:q pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:s serie:? livro:s videogame:n internet:n tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:? realeza:s cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n arma:s ' +
      'chapeu:s barba:p casado:s europa:s folclore:s historia:p'],
    ['merlin', 'Mago Merlin', '🧙', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:s ' +
      'filme:p serie:? livro:s videogame:n internet:n tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:s voa:n engracado:? realeza:n cor-azul:p cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n barba:s ' +
      'chapeu:s chapeu-magico:s arma:p europa:s folclore:s'],
    ['dracula', 'Drácula', '🦇', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:s serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:s voa:p engracado:? realeza:n cor-azul:q cor-vermelho:p cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:s cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n capa:s ' +
      'rico:s europa:s monstro:p folclore:p festa:p'],
    ['frankenstein', 'Frankenstein (o monstro)', '🧟', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:p desenho:s ' +
      'filme:s serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:? ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:s cor-amarelo:q cor-rosa:q ' +
      'cor-preto:p cor-branco:q cor-marrom:q grande:s pequeno:n antigo:s recente:n robo:n espaco:n monstro:s ' +
      'forte:s europa:s festa:p'],
    ['robinson-crusoe', 'Robinson Crusoé', '🏝️', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n barba:s ' +
      'pirata:p selvagem:p chapeu:p europa:s historia:p'],
    ['gulliver', 'Gulliver', '🧭', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:? pequeno:n antigo:s recente:n robo:n espaco:n pirata:p ' +
      'europa:s historia:p'],
    ['gepeto', 'Gepeto', '🪚', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:s ' +
      'filme:s serie:? livro:s videogame:n internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n barba:s ' +
      'oculos:s europa:s'],
    ['capitu', 'Capitu (Dom Casmurro)', '👁️', 'A',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:p serie:p livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n casado:s ' +
      'cabelo-comprido:p historia:p'],
    ['macunaima', 'Macunaíma', '🦜', 'A',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:s serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:p voa:n engracado:s realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n selvagem:p ' +
      'folclore:p'],
    ['tom-sawyer', 'Tom Sawyer', '🎣', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n pirata:p ' +
      'chapeu:p estrangeiro-eua:s'],
    ['capitao-nemo', 'Capitão Nemo', '⚙️', 'A',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:s serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n barba:s ' +
      'pirata:p agua:p veiculo:s cientista:p europa:?'],
    ['dartagnan', 'D\'Artagnan (Os Três Mosqueteiros)', '🤺', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:s serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n arma:s ' +
      'chapeu:s barba:s europa:s historia:p'],
    ['scrooge', 'Ebenezer Scrooge', '💰', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:s ' +
      'filme:s serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n rico:s ' +
      'chapeu:p europa:s festa:s'],
    ['heidi', 'Heidi', '🏔️', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:s serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n ' +
      'cabelo-comprido:n europa:s fazenda:p'],
    ['pippi', 'Píppi Meialonga', '🧦', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:s serie:p livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n ruivo:s ' +
      'forte:s europa:s cabelo-comprido:p'],
    ['romeu', 'Romeu (Romeu e Julieta)', '🌹', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:s serie:? livro:p videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n casado:s ' +
      'europa:s historia:p'],
    ['julieta', 'Julieta (Romeu e Julieta)', '💌', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:s serie:? livro:p videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n casado:s ' +
      'vestido:s europa:s historia:p'],
    ['ali-baba', 'Ali Babá', '💎', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n rico:p ' +
      'barba:p chapeu:s historia:p'],
    ['simbad', 'Simbad, o Marujo', '⛵', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n pirata:s ' +
      'barba:p historia:p'],
    ['pedro-coelho', 'Pedro Coelho (Peter Rabbit)', '🥕', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:s serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:s cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n orelhas:s ' +
      'pelo:s rabo:s rapido:p europa:s'],
    ['watson', 'Dr. Watson', '🩺', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:s serie:s livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n detetive:s ' +
      'professor:s barba:s europa:s'],
    ['chapeuzinho-vermelho', 'Chapeuzinho Vermelho', '🧺', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:s cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n capa:s ' +
      'chapeu:s vestido:p selvagem:q folclore:p europa:p'],
    ['lobo-mau', 'Lobo Mau', '🐺', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:? livro:s videogame:n internet:n tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:p cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n pelo:s ' +
      'rabo:s orelhas:s cachorro:p selvagem:s folclore:p t-shrek:p'],
    ['tres-porquinhos', 'Os Três Porquinhos', '🐷', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:? livro:s videogame:n internet:n tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:s ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n fazenda:s ' +
      'rabo:p familia-grande:p folclore:p t-shrek:p'],
    ['joao-e-maria', 'João e Maria', '🍭', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:p feminino:p crianca:s idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n selvagem:p ' +
      'folclore:p europa:p comida:n familia-grande:p'],
    ['joao-pe-de-feijao', 'João (João e o Pé de Feijão)', '🌱', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n pirata:p ' +
      'folclore:p europa:p'],
    ['gigante-pe-de-feijao', 'Gigante (João e o Pé de Feijão)', '🦶', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:s pequeno:n antigo:s recente:n robo:n espaco:n forte:s ' +
      'monstro:p rico:s folclore:p'],
    ['patinho-feio', 'O Patinho Feio', '🦢', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:p feminino:? crianca:s idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:q serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:p cor-marrom:? grande:n pequeno:p antigo:s recente:n robo:n espaco:n passaro:s ' +
      'agua:p europa:p'],
    ['soldadinho-de-chumbo', 'O Soldadinho de Chumbo', '💂', 'IFA',
      'real:n pessoa:q bicho:n coisa:s masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:q serie:? livro:s videogame:n internet:n tv:n disney:p canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:p cor-vermelho:s cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:p cor-branco:q cor-marrom:q grande:n pequeno:s antigo:s recente:n robo:n espaco:n chapeu:s ' +
      'arma:p europa:p'],
    ['polegarzinha', 'Polegarzinha', '🌷', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:q serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:n voa:q engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:s antigo:s recente:n robo:n espaco:n ' +
      'cabelo-comprido:p vestido:p europa:p'],
    ['princesa-ervilha', 'A Princesa e a Ervilha', '🫛', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:q serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:? realeza:s cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n vestido:s ' +
      'chapeu:p casado:p europa:p'],
    ['principe-sapo', 'Príncipe Sapo', '🐸', 'IFA',
      'real:n pessoa:p bicho:p coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:p voa:n engracado:? realeza:s cor-azul:q cor-vermelho:q cor-verde:s cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n chapeu:s ' +
      'agua:p casado:p folclore:p'],
    ['cigarra', 'Cigarra (A Cigarra e a Formiga)', '🦗', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:n serie:? livro:s videogame:n internet:n tv:n disney:n canta:s musica:p esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:q cor-vermelho:q cor-verde:p cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:s antigo:s recente:n robo:n espaco:n inseto:s'],
    ['lebre', 'Lebre (A Lebre e a Tartaruga)', '🐇', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:n serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:q ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:p grande:n pequeno:n antigo:s recente:n robo:n espaco:n rapido:s ' +
      'orelhas:s pelo:s selvagem:p'],
    ['cachinhos-dourados', 'Cachinhos Dourados', '👧', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:s idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:q serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:p cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n loiro:s ' +
      'cabelo-comprido:s urso:q selvagem:p folclore:p'],
    ['flautista-de-hamelin', 'O Flautista de Hamelin', '🪈', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:s videogame:n internet:n tv:n disney:n canta:q musica:p esporte:n heroi:? vilao:? ' +
      'magia:p voa:n engracado:? realeza:n cor-azul:q cor-vermelho:p cor-verde:q cor-amarelo:p cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n chapeu:s ' +
      'rato:q europa:s folclore:s'],
    ['fada-madrinha', 'Fada Madrinha', '🪄', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:s brasileiro:n fala:s desenho:s ' +
      'filme:s serie:? livro:s videogame:n internet:n tv:n disney:s canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:s cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n ' +
      'chapeu-magico:s arma:s capa:p t-shrek:p'],
    ['vovo-chapeuzinho', 'Vovó da Chapeuzinho', '👵', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:s brasileiro:n fala:s desenho:p ' +
      'filme:q serie:? livro:s videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n robo:n espaco:n oculos:p ' +
      'chapeu:s folclore:p europa:p selvagem:p'],
    ['zeus', 'Zeus', '⚡', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:p videogame:? internet:n tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:q ' +
      'magia:s voa:p engracado:n realeza:s cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:p cor-marrom:q grande:p pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s barba:s arma:p forte:s casado:s familia-grande:s europa:s'],
    ['hera', 'Hera', '🦚', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:p canta:n musica:n esporte:n heroi:? vilao:? ' +
      'magia:s voa:n engracado:n realeza:s cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:p cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s casado:s chapeu:p vestido:s europa:s familia-grande:s'],
    ['poseidon', 'Poseidon', '🔱', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:? ' +
      'magia:s voa:n engracado:n realeza:p cor-azul:p cor-vermelho:q cor-verde:? cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s barba:s arma:s agua:s forte:s europa:s'],
    ['hades', 'Hades', '💀', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:p serie:? livro:p videogame:? internet:n tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:p ' +
      'magia:s voa:n engracado:n realeza:p cor-azul:p cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:p cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s europa:s'],
    ['atena', 'Atena', '🦉', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:s voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:p cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s arma:s chapeu:s vestido:s europa:s'],
    ['afrodite', 'Afrodite', '💗', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:q ' +
      'magia:s voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:p ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s cabelo-comprido:s vestido:s casado:s agua:q europa:s'],
    ['apolo', 'Apolo', '☀️', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:p esporte:n heroi:p vilao:q ' +
      'magia:s voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:p cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s loiro:p arma:p barba:n europa:s'],
    ['artemis', 'Ártemis', '🏹', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:q ' +
      'magia:s voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s arma:s selvagem:s rapido:p casado:n europa:s'],
    ['hermes', 'Hermes', '🪽', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:s voa:s engracado:p realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s rapido:s chapeu:s europa:s'],
    ['ares', 'Ares', '🪖', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p ' +
      'magia:s voa:n engracado:n realeza:n cor-azul:q cor-vermelho:p cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s arma:s chapeu:s forte:s europa:s'],
    ['medusa', 'Medusa', '🐍', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:s voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:s cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s monstro:s cabelo-comprido:? europa:s'],
    ['minotauro', 'Minotauro', '🐂', 'IFA',
      'real:n pessoa:p bicho:p coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:q desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:p grande:s pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s monstro:s forte:s europa:s'],
    ['pegaso', 'Pégaso', '🐴', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:p feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:s ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:p canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:s voa:s engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:s cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s rabo:s europa:s'],
    ['cupido', 'Cupido', '💘', 'IFA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:s voa:s engracado:p realeza:n cor-azul:q cor-vermelho:p cor-verde:q cor-amarelo:q cor-rosa:p ' +
      'cor-preto:q cor-branco:p cor-marrom:q grande:n pequeno:q antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s arma:s festa:p europa:s'],
    ['aquiles', 'Aquiles', '🦶', 'A',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:p voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:s robo:n espaco:n ' +
      'escola:n folclore:s arma:s forte:s europa:s'],
    ['perseu', 'Perseu', '🗡', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:s serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:p voa:p engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s arma:s europa:s'],
    ['prometeu', 'Prometeu', '🔥', 'A',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:p voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:s robo:n espaco:n ' +
      'escola:n folclore:s europa:s'],
    ['icaro', 'Ícaro', '🪶', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:q idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:n ' +
      'magia:n voa:s engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s europa:s'],
    ['pandora', 'Pandora', '📦', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:q ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s vestido:p europa:s'],
    ['cerbero', 'Cérbero', '🐕', 'FA',
      'real:n pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p ' +
      'magia:s voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:p cor-branco:q cor-marrom:q grande:s pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s monstro:s cachorro:s rabo:s pelo:p europa:s'],
    ['rei-midas', 'Rei Midas', '🪙', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:q vilao:q ' +
      'magia:p voa:n engracado:n realeza:s cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:s cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s rico:s chapeu:s barba:p europa:s'],
    ['odin', 'Odin', '🐦‍⬛', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:s voa:n engracado:n realeza:s cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:p cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s barba:s arma:s chapeu:s europa:s t-marvel:q'],
    ['thor-mitologia', 'Thor (mitologia nórdica)', '🌩️', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:n engracado:n realeza:q cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s barba:s ruivo:p arma:s forte:s veiculo:p europa:s t-marvel:q'],
    ['loki-mitologia', 'Loki (mitologia nórdica)', '🎭', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:q vilao:p ' +
      'magia:s voa:n engracado:p realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s europa:s t-marvel:q'],
    ['ra', 'Rá (deus do Sol)', '🌞', 'A',
      'real:n pessoa:p bicho:p coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:s voa:n engracado:n realeza:s cor-azul:q cor-vermelho:p cor-verde:q cor-amarelo:p cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:s robo:n espaco:n ' +
      'escola:n folclore:s chapeu:s passaro:p europa:n'],
    ['anubis', 'Anúbis', '🐺', 'FA',
      'real:n pessoa:p bicho:p coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:? ' +
      'magia:s voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:s cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:s robo:n espaco:n ' +
      'escola:n folclore:s cachorro:p orelhas:s europa:n'],
    ['isis', 'Ísis', '🪽', 'A',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:s voa:p engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:s robo:n espaco:n ' +
      'escola:n folclore:s chapeu:s vestido:s casado:s europa:n'],
    ['esfinge', 'Esfinge', '🦁', 'FA',
      'real:n pessoa:q bicho:p coisa:p masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:? ' +
      'magia:s voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:p cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:s grande:s pequeno:n antigo:s recente:n historia:s robo:n espaco:n ' +
      'escola:n folclore:s monstro:p gato:p europa:n'],
    ['sun-wukong', 'Sun Wukong (o Rei Macaco)', '🐒', 'FA',
      'real:n pessoa:q bicho:p coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:p internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:s voa:s engracado:s realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:p cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s arma:s chapeu:s rabo:s pelo:s rapido:s forte:s europa:n'],
    ['fenix', 'Fênix', '🐦‍🔥', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:p ' +
      'filme:p serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:s voa:s engracado:n realeza:n cor-azul:q cor-vermelho:s cor-verde:q cor-amarelo:p cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:p grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s passaro:s t-harry:p europa:?'],
    ['centauro', 'Centauro', '🏇', 'IFA',
      'real:n pessoa:p bicho:p coisa:n masculino:p feminino:? crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:? ' +
      'magia:q voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s arma:p rapido:s forte:p rabo:s monstro:p t-harry:p selvagem:p europa:s'],
    ['ciclope-mitologia', 'Ciclope (da mitologia)', '👁', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:p desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:s pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s monstro:s forte:s europa:s'],
    ['grifo', 'Grifo', '🦅', 'FA',
      'real:n pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:? ' +
      'magia:p voa:s engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:p grande:s pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s passaro:p gato:p monstro:s rabo:s europa:?'],
    ['monstro-lago-ness', 'Monstro do Lago Ness', '🦕', 'FA',
      'real:q pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:q ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:p cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:s pequeno:n antigo:s recente:n historia:n robo:n espaco:n ' +
      'escola:n folclore:s agua:s dinossauro:p monstro:s europa:s'],
    ['kraken', 'Kraken', '🦑', 'FA',
      'real:n pessoa:n bicho:s coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:p ' +
      'filme:s serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:s ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:s pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s agua:s monstro:s forte:s europa:p'],
    ['yeti', 'Yeti (Abominável Homem das Neves)', '🏔', 'FA',
      'real:q pessoa:q bicho:p coisa:n masculino:p feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:p canta:n musica:n esporte:n heroi:? vilao:q ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:s cor-marrom:q grande:s pequeno:n antigo:s recente:n historia:n robo:n espaco:n ' +
      'escola:n folclore:s monstro:p pelo:s forte:s selvagem:p europa:n'],
    ['mumia', 'Múmia', '🧻', 'IFA',
      'real:n pessoa:p bicho:n coisa:n masculino:p feminino:? crianca:n idoso:n brasileiro:n fala:q desenho:s ' +
      'filme:s serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p ' +
      'magia:p voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:s cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:p robo:n espaco:n ' +
      'escola:n folclore:s monstro:s europa:n festa:p'],
    ['negrinho-do-pastoreio', 'Negrinho do Pastoreio', '🐴', 'FA',
      'real:n pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:s idoso:n brasileiro:s fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:p voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:n robo:n espaco:n ' +
      'escola:n folclore:s europa:n'],
    ['caipora', 'Caipora', '🐗', 'FA',
      'real:n pessoa:p bicho:n coisa:n masculino:? feminino:? crianca:n idoso:n brasileiro:s fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:q ' +
      'magia:s voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:n robo:n espaco:n ' +
      'escola:n folclore:s europa:n selvagem:s rapido:p t-sitio:q'],
    ['mapinguari', 'Mapinguari', '🦍', 'FA',
      'real:n pessoa:q bicho:p coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:n desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p ' +
      'magia:s voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:p grande:s pequeno:n antigo:s recente:n historia:n robo:n espaco:n ' +
      'escola:n folclore:s europa:n monstro:s forte:s pelo:s selvagem:s'],
    ['matinta-pereira', 'Matinta Pereira', '🪶', 'A',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:s brasileiro:s fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:p ' +
      'magia:s voa:p engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:n robo:n espaco:n ' +
      'escola:n folclore:s europa:n passaro:p chapeu-magico:p'],
    ['comadre-fulozinha', 'Comadre Fulozinha', '🌿', 'A',
      'real:n pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:p idoso:n brasileiro:s fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:q ' +
      'magia:s voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:n robo:n espaco:n ' +
      'escola:n folclore:s europa:n selvagem:s cabelo-comprido:s rapido:p'],
    ['vitoria-regia', 'Vitória-régia (a lenda)', '🪷', 'FA',
      'real:n pessoa:p bicho:n coisa:p masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:n esporte:n heroi:? vilao:n ' +
      'magia:p voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:s cor-amarelo:q cor-rosa:p ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:n robo:n espaco:n ' +
      'escola:n folclore:s europa:n agua:s'],
    ['bumba-meu-boi', 'Bumba Meu Boi', '🐮', 'FA',
      'real:n pessoa:n bicho:p coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:n desenho:p ' +
      'filme:? serie:? livro:p videogame:? internet:n tv:n disney:n canta:n musica:p esporte:n heroi:? vilao:n ' +
      'magia:p voa:n engracado:n realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:p cor-branco:q cor-marrom:q grande:n pequeno:n antigo:s recente:n historia:n robo:n espaco:n ' +
      'escola:n folclore:s europa:n dancar:s festa:s fazenda:p'],
    ['rudolph', 'Rudolph, a Rena do Nariz Vermelho', '🦌', 'IFA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:p idoso:n brasileiro:n fala:s desenho:s ' +
      'filme:q serie:? livro:p videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:s vilao:n ' +
      'magia:p voa:s engracado:? realeza:n cor-azul:q cor-vermelho:p cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:s grande:n pequeno:n antigo:s recente:n robo:n espaco:n pelo:s ' +
      'rabo:p estrangeiro-eua:s festa:s'],
    ['abobora-halloween', 'Abóbora de Halloween', '🎃', 'IFA',
      'real:n pessoa:n bicho:n coisa:s masculino:? feminino:? crianca:n idoso:n brasileiro:n fala:n desenho:p ' +
      'filme:? serie:? livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:? voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:p cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:s grande:n pequeno:n antigo:s recente:n robo:n espaco:n comida:p ' +
      'festa:s monstro:p estrangeiro-eua:p'],
    ['ratoncito-perez', 'Ratoncito Pérez (o ratinho do dente)', '🐭', 'FA',
      'real:n pessoa:n bicho:s coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:p serie:? livro:p videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:p vilao:n ' +
      'magia:p voa:n engracado:? realeza:n cor-azul:q cor-vermelho:q cor-verde:q cor-amarelo:q cor-rosa:q ' +
      'cor-preto:q cor-branco:q cor-marrom:q grande:n pequeno:s antigo:s recente:n robo:n espaco:n rato:s ' +
      'europa:s festa:p chapeu:p']
  ];
  (raiz.QEPersonagens = raiz.QEPersonagens || {}).historia = L;
  if (typeof module === 'object' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
