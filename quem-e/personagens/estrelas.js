/* Quem é? — A Meleca Adivinha: ESTRELAS — pessoas de verdade, famosas hoje e nas últimas décadas e bem conhecidas no
   Brasil: cantores e bandas (do Brasil e de fora, dos anos 70 até hoje), atletas (futebol, Fórmula 1, basquete, tênis,
   vôlei, skate, surfe, ginástica, judô, atletismo, natação, canoagem), apresentadores de TV, atores e atrizes (a pessoa,
   não o personagem), gente da internet de conteúdo para a família, chefs de TV, astronautas e aventureiros da TV.
   Só fatos públicos; na dúvida, '?'. Nada de político nem de gente envolvida em crime ou polêmica pesada; nenhuma
   criança. Formato igual ao de personagens/familia.js; perguntas em adivinha-perguntas.js. */
(function (raiz) {
  'use strict';
  var L = [
    ['titas', 'Titãs', '🎸', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:? cabelo-comprido:q rico:s vivo:p antigo:s ' +
      'recente:n historia:n ator:n dancar:n futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n casado:?'],
    ['jota-quest', 'Jota Quest', '🎶', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n cabelo-comprido:n rico:s vivo:s antigo:s ' +
      'recente:n historia:n ator:n dancar:p futebol:n corrida:n cientista:n pintor:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['pitty', 'Pitty', '🤘', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:p cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n loiro:n careca:n cabelo-comprido:p rico:s ' +
      'vivo:s antigo:n recente:n historia:n ator:n dancar:n futebol:n corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['chitaozinho-e-xororo', 'Chitãozinho & Xororó', '🤠', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:p barba:p cabelo-comprido:p rico:s vivo:s ' +
      'antigo:s recente:n historia:n ator:n dancar:n futebol:n corrida:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n casado:s'],
    ['henrique-e-juliano', 'Henrique & Juliano', '🎤', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:q loiro:n careca:n cabelo-comprido:n rico:s ' +
      'vivo:s antigo:n recente:s historia:n ator:n dancar:n futebol:n corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['simone-mendes', 'Simone Mendes', '🎙️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n cabelo-comprido:s rico:s vivo:s ' +
      'antigo:n recente:s historia:n ator:n dancar:n futebol:n corrida:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n casado:s'],
    ['maiara-e-maraisa', 'Maiara & Maraisa', '👯‍♀️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:q cabelo-comprido:s rico:s vivo:s antigo:n ' +
      'recente:s historia:n ator:n dancar:n futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n familia-grande:p'],
    ['ana-castela', 'Ana Castela', '🤠', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:s oculos:n careca:n cabelo-comprido:s rico:s ' +
      'fazenda:q vivo:s antigo:n recente:s historia:n ator:n dancar:p futebol:n corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n'],
    ['paula-fernandes', 'Paula Fernandes', '🎻', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:q oculos:n loiro:n careca:n ' +
      'cabelo-comprido:s rico:s vivo:s antigo:n recente:? historia:n ator:n dancar:n futebol:n corrida:n oscar:n ' +
      'estrangeiro-eua:n europa:n casado:?'],
    ['michel-telo', 'Michel Teló', '🪗', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:p disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n loiro:n careca:n barba:q cabelo-comprido:n ' +
      'rico:s vivo:s antigo:n recente:p historia:n ator:n dancar:p futebol:n corrida:n oscar:n estrangeiro-eua:n ' +
      'europa:n casado:s'],
    ['lexa', 'Lexa', '💃', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n cabelo-comprido:p rico:s vivo:s ' +
      'antigo:n recente:s historia:n ator:n dancar:s futebol:n corrida:n cientista:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['alok', 'Alok', '🎧', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:p internet:p tv:n disney:n canta:q musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n barba:s cabelo-comprido:p rico:s ' +
      'vivo:s antigo:n recente:s historia:n ator:n dancar:p futebol:n corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n casado:s'],
    ['melim', 'Melim', '🌼', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:p feminino:p crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n rico:s vivo:s antigo:n recente:s historia:n ator:n ' +
      'dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n ' +
      'familia-grande:p'],
    ['vitor-kley', 'Vitor Kley', '☀️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n loiro:s careca:n cabelo-comprido:p rico:s ' +
      'vivo:s antigo:n recente:s historia:n ator:n dancar:n futebol:n corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['joelma', 'Joelma (Calypso)', '🌺', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n loiro:? careca:n cabelo-comprido:s rico:s ' +
      'vivo:s antigo:? recente:n historia:n ator:n dancar:s futebol:n corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['elba-ramalho', 'Elba Ramalho', '🪘', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:s brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n cabelo-comprido:p rico:s vivo:s antigo:s ' +
      'recente:n historia:n ator:n dancar:p futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n festa:p'],
    ['alceu-valenca', 'Alceu Valença', '🎺', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:? careca:n barba:? cabelo-comprido:p rico:s ' +
      'vivo:s antigo:s recente:n historia:n ator:n dancar:n futebol:n corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n festa:p'],
    ['carlinhos-brown', 'Carlinhos Brown', '🥁', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:q brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:p disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:p rico:s vivo:s antigo:s recente:n ' +
      'historia:n ator:n dancar:p futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['erasmo-carlos', 'Erasmo Carlos', '🎸', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n barba:? cabelo-comprido:? rico:s vivo:n antigo:s ' +
      'recente:n historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['sidney-magal', 'Sidney Magal', '🕺', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n cabelo-comprido:p rico:s vivo:s antigo:s ' +
      'recente:n historia:n ator:n dancar:s futebol:n corrida:n cientista:n pintor:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['rouge', 'Rouge', '💄', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:q disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n cabelo-comprido:p rico:s vivo:s antigo:n recente:n ' +
      'historia:n ator:n dancar:s futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['kid-abelha', 'Kid Abelha', '🐝', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:p feminino:p crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n loiro:p rico:s vivo:s antigo:s recente:n historia:n ' +
      'ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'espaco:n'],
    ['larissa-manoela', 'Larissa Manoela', '🌟', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:p serie:s livro:n videogame:n internet:p tv:n disney:n canta:p musica:p esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n cabelo-comprido:s rico:s vivo:s ' +
      'antigo:n recente:s historia:n ator:s dancar:n futebol:n corrida:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n escola:q t-novela:p'],
    ['maisa', 'Maísa Silva', '🎤', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:p livro:n videogame:n internet:p tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n cabelo-comprido:p vivo:s antigo:n ' +
      'recente:? historia:n ator:p dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['shawn-mendes', 'Shawn Mendes', '🎸', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:p tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n barba:q cabelo-comprido:n rico:s ' +
      'vivo:s antigo:n recente:s historia:n ator:n dancar:n futebol:n corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['miley-cyrus', 'Miley Cyrus', '🎀', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:s livro:n videogame:n internet:n tv:n disney:p canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n loiro:p careca:n rico:s vivo:s antigo:n ' +
      'recente:n historia:n ator:p dancar:p futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:s ' +
      'europa:n espaco:n'],
    ['jonas-brothers', 'Jonas Brothers', '🎤', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:p livro:n videogame:n internet:n tv:n disney:p canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n barba:? rico:s vivo:s antigo:n recente:n historia:n ' +
      'ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s europa:n ' +
      'espaco:n familia-grande:p'],
    ['avril-lavigne', 'Avril Lavigne', '🛹', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:p cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n loiro:s careca:n cabelo-comprido:s rico:s ' +
      'vivo:s antigo:n recente:n historia:n ator:n dancar:n futebol:n corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['bon-jovi', 'Bon Jovi', '🎸', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:q brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n cabelo-comprido:p rico:s vivo:s antigo:s recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s ' +
      'europa:n espaco:n'],
    ['u2', 'U2', '🕶️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:q brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:p rico:s vivo:s antigo:s recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s espaco:n'],
    ['bee-gees', 'Bee Gees', '🪩', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n barba:p cabelo-comprido:p rico:s vivo:p antigo:s ' +
      'recente:n historia:n ator:n dancar:p futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n familia-grande:p'],
    ['spice-girls', 'Spice Girls', '🌶️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n cabelo-comprido:p rico:s vivo:s antigo:s recente:n ' +
      'historia:n ator:n dancar:p futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s espaco:n'],
    ['backstreet-boys', 'Backstreet Boys', '🕺', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n rico:s vivo:s antigo:s recente:n historia:n ator:n ' +
      'dancar:s futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s europa:n espaco:n'],
    ['one-direction', 'One Direction', '💙', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:q disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n rico:s vivo:p antigo:n recente:s historia:n ator:n ' +
      'dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:s espaco:n'],
    ['camila-cabello', 'Camila Cabello', '🌴', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n cabelo-comprido:s rico:s vivo:s ' +
      'antigo:n recente:s historia:n ator:n dancar:p futebol:n corrida:n cientista:n politico:n oscar:n ' +
      'estrangeiro-eua:p europa:n espaco:n'],
    ['luis-fonsi', 'Luis Fonsi', '🌶️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n barba:p cabelo-comprido:n rico:s ' +
      'vivo:s antigo:? recente:p historia:n ator:n dancar:p futebol:n corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:? europa:n espaco:n'],
    ['ricky-martin', 'Ricky Martin', '🕺', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n rico:s vivo:s antigo:s recente:n ' +
      'historia:n ator:p dancar:s futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:? ' +
      'europa:n espaco:n'],
    ['jennifer-lopez', 'Jennifer Lopez', '💃', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:s serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n cabelo-comprido:s rico:s vivo:s ' +
      'antigo:s recente:n historia:n ator:s dancar:s futebol:n corrida:n cientista:n politico:n oscar:n ' +
      'estrangeiro-eua:s europa:n espaco:n'],
    ['christina-aguilera', 'Christina Aguilera', '🎤', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:p disney:p canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n loiro:s careca:n rico:s vivo:s antigo:s ' +
      'recente:n historia:n ator:n dancar:p futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:s ' +
      'europa:n espaco:n'],
    ['sia', 'Sia', '🎀', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n loiro:p careca:n cabelo-comprido:? rico:s ' +
      'vivo:s antigo:n recente:s historia:n ator:n dancar:q futebol:n corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['psy', 'PSY (Gangnam Style)', '🐎', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:s tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:p careca:n cabelo-comprido:n rico:s vivo:s ' +
      'antigo:n recente:s historia:n ator:n dancar:s futebol:n corrida:n cientista:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['michael-buble', 'Michael Bublé', '🎄', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:p cor-branco:? cor-marrom:? grande:n pequeno:n careca:n rico:s vivo:s antigo:n recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n festa:p'],
    ['andrea-bocelli', 'Andrea Bocelli', '🎼', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n barba:p rico:s vivo:s antigo:s recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s espaco:n'],
    ['pavarotti', 'Luciano Pavarotti', '🎭', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:q pequeno:n careca:n barba:s rico:s vivo:n antigo:s recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s espaco:n'],
    ['marshmello', 'Marshmello', '🍡', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:p internet:p tv:n disney:n canta:n musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:s cor-marrom:? grande:n pequeno:n chapeu:p oculos:n careca:n capa:s rico:s vivo:s ' +
      'antigo:n recente:s historia:n ator:n dancar:p futebol:n corrida:n politico:n oscar:n estrangeiro-eua:s ' +
      'europa:n espaco:n'],
    ['david-guetta', 'David Guetta', '🎧', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:q musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n loiro:p careca:n cabelo-comprido:p rico:s ' +
      'vivo:s antigo:n recente:p historia:n ator:n dancar:p futebol:n corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:s espaco:n'],
    ['rbd', 'RBD (Rebelde)', '👔', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:p feminino:p crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:p serie:s livro:n videogame:n internet:n tv:n disney:n canta:s musica:s esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:p cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n rico:s vivo:s antigo:n recente:n historia:n ator:s ' +
      'dancar:p futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n ' +
      'escola:p t-novela:n'],
    ['kaka', 'Kaká', '⚽', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:p cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:p cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n loiro:n careca:n barba:q rapido:p rico:s ' +
      'vivo:s antigo:n recente:n historia:n ator:n dancar:n futebol:s corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n'],
    ['rivaldo', 'Rivaldo', '⚽', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n cabelo-comprido:n rapido:p rico:s ' +
      'vivo:s antigo:s recente:n historia:n ator:n dancar:n futebol:s corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['roberto-carlos-jogador', 'Roberto Carlos (jogador)', '🦵', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:? ' +
      'cor-preto:? cor-branco:p cor-marrom:? grande:n pequeno:n oculos:n careca:s barba:n rapido:p forte:s rico:s ' +
      'vivo:s antigo:s recente:n historia:n ator:n dancar:n futebol:s corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n'],
    ['cafu', 'Cafu', '🏆', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:? ' +
      'cor-preto:? cor-branco:q cor-marrom:? grande:n pequeno:n oculos:n careca:s rapido:p forte:? rico:s vivo:s ' +
      'antigo:s recente:n historia:n ator:n dancar:n futebol:s corrida:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['marcelo-jogador', 'Marcelo (lateral)', '⚽', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:n cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:s cor-marrom:? grande:n pequeno:n oculos:n careca:n rapido:p rico:s vivo:s antigo:n ' +
      'recente:p historia:n ator:n dancar:n futebol:s corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['casemiro', 'Casemiro', '🛡️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:p cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:p cor-marrom:? grande:n pequeno:n oculos:n loiro:n careca:n rapido:p rico:s vivo:s ' +
      'antigo:n recente:s historia:n ator:n dancar:n futebol:s corrida:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['alisson', 'Alisson (goleiro)', '🧤', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:p cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n barba:s rapido:p rico:s vivo:s ' +
      'antigo:n recente:s historia:n ator:n dancar:n futebol:s corrida:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['thiago-silva', 'Thiago Silva', '🛡️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:p cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n loiro:n careca:p barba:? rapido:p rico:s ' +
      'vivo:s antigo:n recente:p historia:n ator:n dancar:n futebol:s corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n'],
    ['richarlison', 'Richarlison (Pombo)', '🐦', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n rapido:p rico:s vivo:s antigo:n ' +
      'recente:s historia:n ator:n dancar:p futebol:s corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['endrick', 'Endrick', '⚽', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:q idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:p cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n barba:n rapido:p rico:s vivo:s ' +
      'antigo:n recente:s historia:n ator:n dancar:n futebol:s corrida:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n casado:s'],
    ['hulk-jogador', 'Hulk (jogador)', '💪', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:p cor-branco:p cor-marrom:? grande:n pequeno:n oculos:n careca:n rapido:p forte:s rico:s vivo:s ' +
      'antigo:n recente:p historia:n ator:n dancar:n futebol:s corrida:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['rogerio-ceni', 'Rogério Ceni', '🧤', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:p cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:p cor-branco:p cor-marrom:? grande:n pequeno:n oculos:n careca:n rapido:p rico:s vivo:s antigo:s ' +
      'recente:n historia:n ator:n dancar:n futebol:s corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['socrates', 'Sócrates (jogador)', '🩺', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:p cor-branco:p cor-marrom:? grande:n pequeno:n oculos:n careca:n barba:s rapido:p rico:s vivo:n ' +
      'antigo:s recente:n historia:n ator:n dancar:n futebol:s corrida:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n professor:p'],
    ['formiga-jogadora', 'Formiga (jogadora)', '🐜', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n rapido:p rico:? vivo:s antigo:s ' +
      'recente:n historia:n ator:n dancar:n futebol:s corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['zidane', 'Zinedine Zidane', '⚽', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:p cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:p cor-marrom:? grande:n pequeno:n oculos:n careca:s rapido:p rico:s vivo:s antigo:s ' +
      'recente:n historia:n ator:n dancar:n futebol:s corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s espaco:n'],
    ['beckham', 'David Beckham', '🎯', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:p cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n loiro:p careca:n barba:p rapido:p rico:s ' +
      'vivo:s antigo:s recente:n historia:n ator:n dancar:n futebol:s corrida:n oscar:n estrangeiro-eua:n europa:s ' +
      'casado:s'],
    ['haaland', 'Erling Haaland', '🤖', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:p cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n loiro:s careca:n cabelo-comprido:s ' +
      'rapido:p forte:s rico:s vivo:s antigo:n recente:s historia:n ator:n dancar:n futebol:s corrida:n oscar:n ' +
      'estrangeiro-eua:n europa:s'],
    ['salah', 'Mohamed Salah', '👑', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:p cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n loiro:n careca:n barba:s cabelo-comprido:p ' +
      'rapido:p rico:s vivo:s antigo:n recente:s historia:n ator:n dancar:n futebol:s corrida:n oscar:n ' +
      'estrangeiro-eua:n europa:n'],
    ['modric', 'Luka Modrić', '⚽', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:p cor-marrom:? grande:n pequeno:n oculos:n loiro:p careca:n cabelo-comprido:p ' +
      'rapido:p rico:s vivo:s antigo:n recente:n historia:n ator:n dancar:n futebol:s corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:s'],
    ['iniesta', 'Andrés Iniesta', '⚽', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:p cor-vermelho:p cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:p rapido:p rico:s vivo:s antigo:n ' +
      'recente:n historia:n ator:n dancar:n futebol:s corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s espaco:n'],
    ['buffon', 'Gianluigi Buffon', '🧤', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:p cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n cabelo-comprido:q rapido:p rico:s ' +
      'vivo:s antigo:s recente:n historia:n ator:n dancar:n futebol:s corrida:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:s espaco:n'],
    ['ibrahimovic', 'Zlatan Ibrahimović', '🦁', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n barba:s cabelo-comprido:s ' +
      'rapido:p forte:p rico:s vivo:s antigo:n recente:n historia:n ator:n dancar:n futebol:s corrida:n oscar:n ' +
      'estrangeiro-eua:n europa:s'],
    ['lamine-yamal', 'Lamine Yamal', '⚽', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:q idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:p cor-vermelho:p cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n barba:n rapido:p rico:s vivo:s ' +
      'antigo:n recente:s historia:n ator:n dancar:n futebol:s corrida:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s espaco:n'],
    ['bellingham', 'Jude Bellingham', '⚽', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:s cor-marrom:? grande:n pequeno:n oculos:n careca:n rapido:p rico:s vivo:s antigo:n ' +
      'recente:s historia:n ator:n dancar:q futebol:s corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s espaco:n'],
    ['thierry-henry', 'Thierry Henry', '⚽', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:p disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:p cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:s rapido:p rico:s vivo:s antigo:s ' +
      'recente:n historia:n ator:n dancar:n futebol:s corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s espaco:n'],
    ['max-verstappen', 'Max Verstappen', '🏎️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:p cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:s oculos:n loiro:q careca:n rapido:s rico:s ' +
      'vivo:s antigo:n recente:s historia:n ator:n dancar:n futebol:n corrida:s oscar:n estrangeiro-eua:n europa:s ' +
      'veiculo:s'],
    ['michael-schumacher', 'Michael Schumacher', '🏎️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:q brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:s cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:s oculos:n careca:n barba:n ' +
      'cabelo-comprido:n rapido:s rico:s vivo:s antigo:s recente:n historia:n ator:n dancar:n futebol:n corrida:s ' +
      'estrangeiro-eua:n europa:s veiculo:s'],
    ['fernando-alonso', 'Fernando Alonso', '🏎️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:p cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:s oculos:n loiro:n careca:n ' +
      'cabelo-comprido:n rapido:s rico:s vivo:s antigo:n recente:n historia:n ator:n dancar:n futebol:n corrida:s ' +
      'estrangeiro-eua:n europa:s veiculo:s'],
    ['rubens-barrichello', 'Rubens Barrichello', '🏎️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:p cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:s oculos:n rapido:s rico:s vivo:s antigo:s ' +
      'recente:n historia:n ator:n dancar:n futebol:n corrida:s politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'espaco:n veiculo:s'],
    ['felipe-massa', 'Felipe Massa', '🏎️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:p cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:s oculos:n careca:n rapido:s rico:s vivo:s ' +
      'antigo:n recente:n historia:n ator:n dancar:n futebol:n corrida:s politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n veiculo:s'],
    ['emerson-fittipaldi', 'Emerson Fittipaldi', '🏁', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:s rapido:s rico:s vivo:s antigo:s recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:s cientista:n politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'espaco:n veiculo:s'],
    ['charles-leclerc', 'Charles Leclerc', '🏎️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:s cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:s oculos:n loiro:n careca:n barba:n rapido:s ' +
      'rico:s vivo:s antigo:n recente:s historia:n ator:n dancar:n futebol:n corrida:s estrangeiro-eua:n europa:s ' +
      'veiculo:s'],
    ['gabriel-bortoleto', 'Gabriel Bortoleto', '🏎️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:s oculos:n careca:n rapido:s rico:s vivo:s ' +
      'antigo:n recente:s historia:n ator:n dancar:n futebol:n corrida:s politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n veiculo:s'],
    ['lando-norris', 'Lando Norris', '🏎️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:p grande:n pequeno:n chapeu:s oculos:n careca:n rapido:s rico:s vivo:s ' +
      'antigo:n recente:s historia:n ator:n dancar:n futebol:n corrida:s politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s veiculo:s'],
    ['stephen-curry', 'Stephen Curry', '🏀', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:p cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n rapido:p rico:s vivo:s antigo:n ' +
      'recente:p historia:n ator:n dancar:n futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:s ' +
      'europa:n espaco:n'],
    ['shaquille-oneal', 'Shaquille O\'Neal (Shaq)', '🏀', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:p serie:q livro:n videogame:n internet:n tv:p disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:p ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:p pequeno:n oculos:n careca:s forte:s rico:s vivo:s antigo:s ' +
      'recente:n historia:n ator:n dancar:n futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:s ' +
      'europa:n espaco:n'],
    ['oscar-schmidt', 'Oscar Schmidt (Mão Santa)', '🏀', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s antigo:s recente:n historia:n ator:n ' +
      'dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['wembanyama', 'Victor Wembanyama', '🏀', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:p cor-branco:? cor-marrom:? grande:s pequeno:n oculos:n careca:n rico:s vivo:s antigo:n recente:s ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s espaco:n'],
    ['hortencia', 'Hortência', '🏀', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:q brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n loiro:p careca:n vivo:s antigo:s recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['roger-federer', 'Roger Federer', '🎾', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:p cor-marrom:? grande:n pequeno:n chapeu:p oculos:n loiro:n careca:n barba:n ' +
      'cabelo-comprido:n rico:s vivo:s antigo:n recente:n historia:n ator:n dancar:n futebol:n corrida:n ' +
      'estrangeiro-eua:n europa:s casado:s'],
    ['rafael-nadal', 'Rafael Nadal', '🎾', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:s oculos:n loiro:n careca:n ' +
      'cabelo-comprido:p forte:p rico:s vivo:s antigo:n recente:n historia:n ator:n dancar:n futebol:n corrida:n ' +
      'estrangeiro-eua:n europa:s casado:s'],
    ['bia-haddad-maia', 'Bia Haddad Maia', '🎾', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n cabelo-comprido:p vivo:s antigo:n ' +
      'recente:s historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['joao-fonseca', 'João Fonseca (tênis)', '🎾', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:q idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n barba:n vivo:s antigo:n recente:s ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['sheilla-castro', 'Sheilla Castro (vôlei)', '🏐', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n vivo:s antigo:n recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['tony-hawk', 'Tony Hawk', '🛹', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:q brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:p internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:p oculos:n vivo:s antigo:s recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s ' +
      'europa:n espaco:n veiculo:q'],
    ['bob-burnquist', 'Bob Burnquist', '🛹', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:p oculos:n vivo:s antigo:s recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n veiculo:q'],
    ['gabriel-medina', 'Gabriel Medina', '🏄', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:q oculos:n loiro:n careca:n rico:s vivo:s ' +
      'antigo:n recente:s historia:n ator:n dancar:n futebol:n corrida:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['kelly-slater', 'Kelly Slater', '🏄', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:s vivo:s antigo:s recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s ' +
      'europa:n espaco:n'],
    ['arthur-zanetti', 'Arthur Zanetti', '🤸', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n forte:s vivo:s antigo:n recente:p ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['nadia-comaneci', 'Nadia Comăneci', '🤸', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n vivo:s antigo:s recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s espaco:n'],
    ['mayra-aguiar', 'Mayra Aguiar (judô)', '🥋', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n forte:s vivo:s antigo:n recente:p ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['alison-dos-santos', 'Alison dos Santos (Piu)', '🏃', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:s rapido:s vivo:s antigo:n ' +
      'recente:s historia:n ator:n dancar:n futebol:n corrida:s cientista:n pintor:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['maurren-maggi', 'Maurren Maggi', '🏃‍♀️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n vivo:s antigo:n recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:p cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['isaquias-queiroz', 'Isaquias Queiroz', '🛶', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:s heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n forte:s vivo:s antigo:n recente:s ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n veiculo:p'],
    ['marcos-mion', 'Marcos Mion', '📺', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n rico:s vivo:s antigo:n recente:n ' +
      'historia:n ator:p dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['rodrigo-faro', 'Rodrigo Faro', '🕺', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n rico:s vivo:s antigo:n recente:n ' +
      'historia:n ator:p dancar:p futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['fatima-bernardes', 'Fátima Bernardes', '📰', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n cabelo-comprido:q vivo:s antigo:s ' +
      'recente:n historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['william-bonner', 'William Bonner', '📰', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:q brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n barba:n vivo:s antigo:s recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['raul-gil', 'Raul Gil', '🎩', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:p musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:p vivo:p antigo:s recente:n historia:n ' +
      'ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'espaco:n'],
    ['hebe-camargo', 'Hebe Camargo', '💋', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:s brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n loiro:s careca:n vivo:n antigo:s recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['sergio-mallandro', 'Sérgio Mallandro', '🤪', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n vivo:s antigo:s recente:n historia:n ' +
      'ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'espaco:n'],
    ['patricia-abravanel', 'Patrícia Abravanel', '📺', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n cabelo-comprido:p rico:s vivo:s ' +
      'antigo:n recente:p historia:n ator:n dancar:n futebol:n corrida:n cientista:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['sabrina-sato', 'Sabrina Sato', '🥁', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n cabelo-comprido:p vivo:s antigo:n ' +
      'recente:n historia:n ator:n dancar:p futebol:n corrida:n cientista:n pintor:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['pedro-bial', 'Pedro Bial', '🎙️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:p brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n barba:n vivo:s antigo:s recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n casado:s'],
    ['tadeu-schmidt', 'Tadeu Schmidt', '🏟️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:p heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n vivo:s antigo:n recente:n historia:n ' +
      'ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'espaco:n'],
    ['gloria-maria', 'Glória Maria', '🌍', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n vivo:n antigo:s recente:n historia:n ' +
      'ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'pirata:p espaco:n'],
    ['cid-moreira', 'Cid Moreira', '🎙️', 'A',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n antigo:s recente:n historia:n ator:n ' +
      'dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['maju-coutinho', 'Maju Coutinho', '🌦️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n vivo:s antigo:n recente:s ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['fernanda-torres', 'Fernanda Torres', '🎬', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:s serie:s livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n rico:s vivo:s antigo:s recente:n ' +
      'historia:n ator:s dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:q estrangeiro-eua:n ' +
      'europa:n espaco:n t-novela:p'],
    ['lazaro-ramos', 'Lázaro Ramos', '🎭', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:s serie:s livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n rico:s vivo:s antigo:n recente:n ' +
      'historia:n ator:s dancar:n futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'espaco:n casado:s t-novela:p'],
    ['tais-araujo', 'Taís Araújo', '🎭', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:p serie:s livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n vivo:s antigo:p recente:n ' +
      'historia:n ator:s dancar:n futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'espaco:n casado:s t-novela:p'],
    ['rodrigo-santoro', 'Rodrigo Santoro', '🎬', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:s serie:s livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n barba:p rico:s vivo:s antigo:n ' +
      'recente:n historia:n ator:s dancar:n futebol:n corrida:n politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'espaco:n t-novela:p'],
    ['gloria-pires', 'Glória Pires', '🎭', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:p serie:s livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n vivo:s antigo:s recente:n historia:n ' +
      'ator:s dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'espaco:n t-novela:p'],
    ['paulo-gustavo', 'Paulo Gustavo', '😂', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:s serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n vestido:p rico:s vivo:n antigo:n ' +
      'recente:s historia:n ator:s dancar:n futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['leandro-hassum', 'Leandro Hassum', '😄', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:s serie:q livro:n videogame:n internet:n tv:p disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n rico:s vivo:s antigo:n recente:p historia:n ator:s ' +
      'dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n'],
    ['marcelo-adnet', 'Marcelo Adnet', '🎭', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:p musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n vivo:s antigo:n recente:p ' +
      'historia:n ator:p dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['ingrid-guimaraes', 'Ingrid Guimarães', '😂', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:s serie:p livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n rico:s vivo:s antigo:n recente:p ' +
      'historia:n ator:s dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['bruna-marquezine', 'Bruna Marquezine', '🎬', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:p serie:s livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n cabelo-comprido:p vivo:s antigo:n ' +
      'recente:p historia:n ator:s dancar:n futebol:n corrida:n politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'espaco:n t-dc:p t-novela:p'],
    ['regina-case', 'Regina Casé', '🎉', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:s serie:p livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n rico:s vivo:s antigo:s recente:n ' +
      'historia:n ator:s dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['antonio-fagundes', 'Antônio Fagundes', '🎭', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:s fala:s desenho:n ' +
      'filme:p serie:s livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s antigo:s recente:n historia:n ator:s ' +
      'dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:n espaco:n ' +
      't-novela:p'],
    ['rowan-atkinson', 'Rowan Atkinson (Mr. Bean)', '🧸', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:s serie:p livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:p grande:n pequeno:n oculos:n careca:n rico:s vivo:s antigo:s recente:n ' +
      'historia:n ator:s dancar:n futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n europa:s ' +
      'espaco:n veiculo:p'],
    ['dwayne-johnson', 'Dwayne Johnson (The Rock)', '💪', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:s serie:q livro:n videogame:n internet:n tv:n disney:p canta:n musica:n esporte:p heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:s forte:s rico:s vivo:s antigo:n ' +
      'recente:n historia:n ator:s dancar:n futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:s ' +
      'europa:n espaco:n'],
    ['jackie-chan', 'Jackie Chan', '🥋', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:s serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n rapido:p forte:p rico:s vivo:s ' +
      'antigo:s recente:n historia:n ator:s dancar:n futebol:n corrida:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n t-kungfu:p'],
    ['jack-black', 'Jack Black', '🎸', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:s serie:q livro:n videogame:p internet:n tv:n disney:n canta:s musica:p esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n rico:s vivo:s antigo:n recente:n ' +
      'historia:n ator:s dancar:n futebol:n corrida:n politico:n oscar:n estrangeiro-eua:s europa:n espaco:n ' +
      't-kungfu:p t-mario:p'],
    ['leonardo-dicaprio', 'Leonardo DiCaprio', '🚢', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:s serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n loiro:p careca:n rico:s vivo:s antigo:s ' +
      'recente:n historia:n ator:s dancar:n futebol:n corrida:n cientista:n politico:n oscar:s estrangeiro-eua:s ' +
      'europa:n espaco:n'],
    ['emma-watson', 'Emma Watson', '📚', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:s serie:q livro:n videogame:n internet:n tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n cabelo-comprido:p rico:s vivo:s ' +
      'antigo:n recente:n historia:n ator:s dancar:n futebol:n corrida:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s espaco:n t-harry:p'],
    ['daniel-radcliffe', 'Daniel Radcliffe', '⚡', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:s serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:p careca:n rico:s vivo:s antigo:n recente:n ' +
      'historia:n ator:s dancar:n futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n europa:s ' +
      'espaco:n t-harry:p'],
    ['zendaya', 'Zendaya', '🕸️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:s serie:s livro:n videogame:n internet:n tv:n disney:p canta:p musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n rico:s vivo:s antigo:n recente:s ' +
      'historia:n ator:s dancar:p futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:s europa:n ' +
      'espaco:n t-marvel:p'],
    ['tom-holland', 'Tom Holland', '🕷️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:s serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n barba:n rico:s vivo:s antigo:n ' +
      'recente:s historia:n ator:s dancar:p futebol:n corrida:n politico:n oscar:n estrangeiro-eua:n europa:s ' +
      'espaco:n t-marvel:p'],
    ['chris-hemsworth', 'Chris Hemsworth', '🔨', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:s serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n loiro:s careca:n barba:p forte:s rico:s ' +
      'vivo:s antigo:n recente:s historia:n ator:s dancar:n futebol:n corrida:n oscar:n estrangeiro-eua:n europa:n ' +
      't-marvel:p'],
    ['chris-pratt', 'Chris Pratt', '🦖', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:s serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n rico:s vivo:s antigo:n recente:s ' +
      'historia:n ator:s dancar:n futebol:n corrida:n politico:n oscar:n estrangeiro-eua:s europa:n t-mario:p ' +
      't-marvel:p t-jurassic:p'],
    ['morgan-freeman', 'Morgan Freeman', '🎙️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:n ' +
      'filme:s serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n rico:s vivo:p antigo:s recente:n ' +
      'historia:n ator:s dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:s estrangeiro-eua:s ' +
      'europa:n espaco:n'],
    ['meryl-streep', 'Meryl Streep', '🏆', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:s brasileiro:n fala:s desenho:n ' +
      'filme:s serie:q livro:n videogame:n internet:n tv:n disney:n canta:p musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n loiro:p careca:n rico:s vivo:s antigo:s recente:n ' +
      'historia:n ator:s dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:s estrangeiro-eua:s ' +
      'europa:n espaco:n'],
    ['adam-sandler', 'Adam Sandler', '🤪', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:s serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n rico:s vivo:s antigo:s recente:n ' +
      'historia:n ator:s dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s ' +
      'europa:n espaco:n'],
    ['eddie-murphy', 'Eddie Murphy', '🫏', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:p ' +
      'filme:s serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n rico:s vivo:s antigo:s recente:n ' +
      'historia:n ator:s dancar:n futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:s europa:n ' +
      'espaco:n t-shrek:p'],
    ['millie-bobby-brown', 'Millie Bobby Brown', '🧇', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:p serie:s livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n rico:s vivo:s antigo:n recente:s ' +
      'historia:n ator:s dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s espaco:n'],
    ['jenna-ortega', 'Jenna Ortega', '🖤', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:s serie:s livro:n videogame:n internet:n tv:n disney:p canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:p cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n rico:s vivo:s antigo:n recente:s ' +
      'historia:n ator:s dancar:p futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s ' +
      'europa:n espaco:n'],
    ['pedro-pascal', 'Pedro Pascal', '🪖', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:s serie:s livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n barba:s rico:s vivo:s antigo:n ' +
      'recente:s historia:n ator:s dancar:n futebol:n corrida:n politico:n oscar:n estrangeiro-eua:n europa:n ' +
      't-marvel:p t-star-wars:p'],
    ['vin-diesel', 'Vin Diesel', '🚗', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:s serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:s forte:s rico:s vivo:s antigo:n ' +
      'recente:n historia:n ator:s dancar:n futebol:n corrida:n oscar:n estrangeiro-eua:s europa:n veiculo:p ' +
      't-marvel:p t-acao:p'],
    ['blippi', 'Blippi', '🧢', 'IFA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:s tv:n disney:n canta:p musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:s cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:p grande:n pequeno:n chapeu:s oculos:s careca:n vivo:s antigo:n ' +
      'recente:s historia:n ator:n dancar:p futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:s ' +
      'europa:n professor:p espaco:n'],
    ['manual-do-mundo', 'Manual do Mundo (Iberê)', '🧪', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:p videogame:n internet:s tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n vivo:s antigo:n recente:s historia:n ' +
      'ator:n dancar:n futebol:n corrida:n cientista:s pintor:n politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'professor:p espaco:n'],
    ['felipe-castanhari', 'Felipe Castanhari', '🔎', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:p livro:n videogame:n internet:s tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n vivo:s antigo:n recente:s historia:n ' +
      'ator:n dancar:n futebol:n corrida:n cientista:p pintor:n politico:n oscar:n estrangeiro-eua:n europa:n ' +
      'detetive:p espaco:n'],
    ['ninja-streamer', 'Ninja (streamer de Fortnite)', '🎮', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:p internet:s tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:p cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n rico:s vivo:s antigo:n recente:s ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:s ' +
      'europa:n espaco:n'],
    ['erick-jacquin', 'Érick Jacquin', '🍳', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:p tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n comida:n vivo:s antigo:n recente:s historia:n ' +
      'ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n europa:s ' +
      'espaco:n'],
    ['paola-carosella', 'Paola Carosella', '🍝', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n comida:n vivo:s antigo:n ' +
      'recente:s historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['henrique-fogaca', 'Henrique Fogaça', '🔪', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:s comida:n vivo:s antigo:n ' +
      'recente:s historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n ' +
      'estrangeiro-eua:n europa:n espaco:n'],
    ['gordon-ramsay', 'Gordon Ramsay', '👨‍🍳', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:p cor-marrom:? grande:n pequeno:n oculos:n loiro:p careca:n vivo:s antigo:q recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s espaco:n'],
    ['palmirinha', 'Palmirinha', '🥘', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:s brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n careca:n comida:n vivo:n antigo:? recente:? ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:n'],
    ['buzz-aldrin', 'Buzz Aldrin', '🌕', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:s brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:p engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:p cor-marrom:? grande:n pequeno:n chapeu:p vivo:p antigo:s recente:n historia:n ' +
      'ator:n dancar:n futebol:n corrida:n cientista:p pintor:n politico:n oscar:n estrangeiro-eua:s europa:n ' +
      'espaco:s veiculo:s'],
    ['sally-ride', 'Sally Ride', '🚀', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:p engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:p careca:n vivo:n antigo:s recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:p pintor:n politico:n oscar:n estrangeiro-eua:s ' +
      'europa:n espaco:s veiculo:s'],
    ['chris-hadfield', 'Chris Hadfield', '🎸', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:p tv:n disney:n canta:p musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:p engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:p barba:s vivo:s antigo:n recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:p pintor:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n espaco:s veiculo:s'],
    ['sunita-williams', 'Sunita Williams', '🛰️', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:n feminino:s crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:n disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:p engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:p careca:n vivo:s antigo:n recente:p ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:p pintor:n politico:n oscar:n estrangeiro-eua:s ' +
      'europa:n espaco:s veiculo:s'],
    ['steve-irwin', 'Steve Irwin (Caçador de Crocodilos)', '🐊', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:p grande:n pequeno:n oculos:n careca:n selvagem:p vivo:n antigo:s ' +
      'recente:n historia:n ator:n dancar:n futebol:n corrida:n cientista:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n pirata:p espaco:n'],
    ['bear-grylls', 'Bear Grylls', '🧗', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n forte:p selvagem:p vivo:s ' +
      'antigo:n recente:n historia:n ator:n dancar:n futebol:n corrida:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:s pirata:s espaco:n'],
    ['richard-rasmussen', 'Richard Rasmussen', '🐍', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:n tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n chapeu:p oculos:n careca:n selvagem:p vivo:s ' +
      'antigo:n recente:n historia:n ator:n dancar:n futebol:n corrida:n politico:n oscar:n estrangeiro-eua:n ' +
      'europa:n pirata:p espaco:n'],
    ['bob-ross', 'Bob Ross', '🎨', 'FA',
      'real:s pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:n fala:s desenho:n ' +
      'filme:q serie:q livro:n videogame:n internet:p tv:s disney:n canta:n musica:n esporte:n heroi:n vilao:n ' +
      'magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? cor-rosa:? ' +
      'cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n oculos:n careca:n barba:s vivo:n antigo:s recente:n ' +
      'historia:n ator:n dancar:n futebol:n corrida:n cientista:n pintor:s politico:n oscar:n estrangeiro-eua:s ' +
      'europa:n espaco:n']
  ];
  (raiz.QEPersonagens = raiz.QEPersonagens || {}).estrelas = L;
  if (typeof module === 'object' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
