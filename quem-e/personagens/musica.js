/* Quem é? — A Meleca Adivinha: gente da música (cantores, bandas e música para criança).
   Formato igual ao de personagens/familia.js: [ id, nome, emoji, níveis, respostas ].
   Banda ou dupla = uma entrada só, respondida pelo grupo. "vivo" conferido em 2025. */
(function (raiz) {
  'use strict';
  var L = [
    ['michael-jackson', 'Michael Jackson', '🕺', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:p serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:n realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:p cor-branco:p cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:q oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:s europa:n antigo:s recente:n dancar:s chapeu:p barba:n oculos:q loiro:n careca:n cabelo-comprido:p casado:p'],
    ['dua-lipa', 'Dua Lipa', '💃', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:q oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:n europa:s antigo:n recente:s dancar:p loiro:n ruivo:n careca:n cabelo-comprido:s oculos:n chapeu:n casado:p'],
    ['katy-perry', 'Katy Perry', '🍭', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:p ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:p realeza:n cor-azul:p cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:p cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:q oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:s europa:n antigo:n recente:n loiro:q cabelo-comprido:p dancar:q chapeu:? oculos:n careca:n casado:? espaco:p'],
    ['lady-gaga', 'Lady Gaga', '🎹', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:s serie:p livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:s oscar:s rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:s europa:n antigo:n recente:n loiro:p cabelo-comprido:p chapeu:p dancar:p oculos:? casado:p careca:n'],
    ['taylor-swift', 'Taylor Swift', '🎸', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:p cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:q oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:s europa:n antigo:n recente:n loiro:p cabelo-comprido:p dancar:q casado:s oculos:n chapeu:q careca:n ruivo:n'],
    ['beyonce', 'Beyoncé', '🐝', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:p serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:p canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:p oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:s europa:n antigo:p recente:n dancar:s loiro:p cabelo-comprido:s casado:s chapeu:? oculos:n careca:n t-rei-leao:n'],
    ['rihanna', 'Rihanna', '☂️', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:q oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:n europa:n antigo:n recente:n dancar:p loiro:n ruivo:q cabelo-comprido:p casado:p oculos:? careca:n'],
    ['madonna', 'Madonna', '💋', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:q fala:s desenho:n filme:p serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:p oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:s europa:n antigo:s recente:n dancar:s loiro:s cabelo-comprido:p casado:q oculos:? careca:n chapeu:?'],
    ['shakira', 'Shakira', '🪘', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:p canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:q politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:n europa:n antigo:p recente:n dancar:s loiro:p cabelo-comprido:s casado:? oculos:n careca:n chapeu:n'],
    ['bruno-mars', 'Bruno Mars', '🎤', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:q oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:s europa:n antigo:n recente:p dancar:p chapeu:p barba:p oculos:p careca:n loiro:n cabelo-comprido:n casado:?'],
    ['ed-sheeran', 'Ed Sheeran', '🎸', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:q tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:q oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:n europa:s antigo:n recente:s ruivo:s loiro:n barba:p oculos:q careca:n cabelo-comprido:n casado:p dancar:n ' +
      'chapeu:q'],
    ['billie-eilish', 'Billie Eilish', '💚', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:p tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:p cor-amarelo:? ' +
      'cor-rosa:? cor-preto:p cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:s rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:s europa:n antigo:n recente:s loiro:q cabelo-comprido:s dancar:n casado:? oculos:q careca:n chapeu:?'],
    ['justin-bieber', 'Justin Bieber', '🎤', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:q idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:s tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:q oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:n europa:n antigo:n recente:p loiro:q casado:s barba:q dancar:p chapeu:? oculos:q careca:n cabelo-comprido:n'],
    ['ariana-grande', 'Ariana Grande', '🎀', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:s serie:s livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:q voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:p cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:s oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:s europa:n antigo:n recente:s cabelo-comprido:s chapeu-magico:p dancar:q loiro:q casado:p oculos:n careca:n'],
    ['selena-gomez', 'Selena Gomez', '🎤', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:s livro:n videogame:n internet:n tv:n ' +
      'disney:s canta:s musica:s esporte:n heroi:n vilao:n magia:p voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:s oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:s europa:n antigo:n recente:n chapeu-magico:p cabelo-comprido:s casado:s loiro:n dancar:q oculos:n careca:n'],
    ['olivia-rodrigo', 'Olivia Rodrigo', '💜', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:s livro:n videogame:n internet:n tv:n ' +
      'disney:s canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:p cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:p oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:s europa:n antigo:n recente:s cabelo-comprido:s escola:p loiro:n dancar:n casado:? oculos:n careca:n'],
    ['sabrina-carpenter', 'Sabrina Carpenter', '💖', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:p livro:n videogame:n internet:n tv:n ' +
      'disney:s canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:p cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:p oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:s europa:n antigo:n recente:s loiro:s cabelo-comprido:s dancar:q casado:? oculos:n careca:n'],
    ['elvis-presley', 'Elvis Presley', '🕺', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:s serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:q cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:p cor-marrom:? grande:n pequeno:n vivo:n historia:q ator:p oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:s europa:n antigo:s recente:n dancar:s casado:s loiro:n oculos:q careca:n barba:q cabelo-comprido:n'],
    ['freddie-mercury', 'Freddie Mercury (Queen)', '👑', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:q cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p ' +
      'cor-rosa:? cor-preto:? cor-branco:p cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:n europa:s antigo:s recente:n barba:s cabelo-comprido:n casado:n careca:n oculos:n loiro:n dancar:p'],
    ['the-beatles', 'The Beatles', '🎸', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:p filme:p serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:p historia:q ator:n oscar:? rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:n europa:s antigo:s recente:n cabelo-comprido:p barba:p oculos:p casado:s loiro:n careca:n dancar:n'],
    ['john-lennon', 'John Lennon', '☮️', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:n oscar:? rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:n europa:s antigo:s recente:n oculos:s cabelo-comprido:p barba:p casado:s loiro:n careca:n dancar:n chapeu:q'],
    ['paul-mccartney', 'Paul McCartney', '🎸', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:p fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:? rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:n europa:s antigo:s recente:n casado:s barba:q oculos:n loiro:n careca:n cabelo-comprido:n dancar:n'],
    ['bob-marley', 'Bob Marley', '🇯🇲', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:p cor-verde:p cor-amarelo:p ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:n europa:n antigo:s recente:n cabelo-comprido:s barba:p chapeu:p casado:s loiro:n careca:n oculos:n dancar:q'],
    ['whitney-houston', 'Whitney Houston', '🎤', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:s serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:p oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:s europa:n antigo:s recente:n casado:s cabelo-comprido:p loiro:n dancar:q oculos:n careca:n'],
    ['mariah-carey', 'Mariah Carey', '🎄', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:s europa:n antigo:s recente:n festa:s loiro:s cabelo-comprido:s casado:q dancar:q oculos:n careca:n'],
    ['britney-spears', 'Britney Spears', '💃', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:p canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:s europa:n antigo:p recente:n dancar:s loiro:s cabelo-comprido:s escola:p casado:n oculos:n careca:n'],
    ['adele', 'Adele', '🎙️', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:s rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:n europa:s antigo:n recente:n loiro:p cabelo-comprido:s dancar:n casado:p oculos:n careca:n'],
    ['harry-styles', 'Harry Styles', '🎤', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:p serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:p oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:n europa:s antigo:n recente:s cabelo-comprido:q barba:q casado:n dancar:q loiro:n oculos:? careca:n'],
    ['bts', 'BTS', '💜', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:p tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:p cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:n europa:n antigo:n recente:s dancar:s cabelo-comprido:q loiro:? casado:n barba:n oculos:? careca:n'],
    ['blackpink', 'Blackpink', '🖤', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:p tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:s cor-preto:s cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:n europa:n antigo:n recente:s dancar:s cabelo-comprido:s loiro:q casado:n oculos:n careca:n'],
    ['stevie-wonder', 'Stevie Wonder', '🎹', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:q idoso:q fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:s rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:s europa:n antigo:s recente:n oculos:s cabelo-comprido:q barba:q casado:p loiro:n careca:n dancar:n'],
    ['frank-sinatra', 'Frank Sinatra', '🎩', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:q fala:s desenho:n filme:s serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:q ator:s oscar:s rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:s europa:n antigo:s recente:n chapeu:p casado:s barba:n oculos:n careca:q loiro:n dancar:q'],
    ['elton-john', 'Elton John', '🕶️', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:p fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:p canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:q cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:s rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:n europa:s antigo:s recente:n oculos:s t-rei-leao:n casado:s chapeu:? careca:q cabelo-comprido:n barba:n loiro:n ' +
      'dancar:n'],
    ['prince', 'Prince', '💜', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:p serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:s cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:n oscar:s rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:s europa:n antigo:s recente:n barba:p cabelo-comprido:p dancar:p casado:p loiro:n careca:n oculos:?'],
    ['tina-turner', 'Tina Turner', '💃', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:q fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:s europa:n antigo:s recente:n dancar:p cabelo-comprido:p loiro:p casado:s oculos:n careca:n'],
    ['cher', 'Cher', '✨', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:q fala:s desenho:n filme:s serie:q livro:n videogame:n internet:n tv:p ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:s oscar:s rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:s europa:n antigo:s recente:n cabelo-comprido:s casado:s loiro:n oculos:n careca:n dancar:q'],
    ['celine-dion', 'Celine Dion', '🚢', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:n estrangeiro-eua:n europa:n antigo:s recente:n casado:s loiro:q cabelo-comprido:p dancar:n oculos:n careca:n'],
    ['abba', 'ABBA', '🪩', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:p serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:p ' +
      'feminino:p brasileiro:n estrangeiro-eua:n europa:s antigo:s recente:n dancar:p casado:s loiro:p cabelo-comprido:p barba:p oculos:n careca:n'],
    ['daft-punk', 'Daft Punk', '🤖', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:q musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:p cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:n europa:s antigo:p recente:n robo:p capa:s chapeu:s espaco:p dancar:q barba:? oculos:n careca:? ' +
      'loiro:? cabelo-comprido:? casado:?'],
    ['coldplay', 'Coldplay', '🌈', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:n europa:s antigo:q recente:n casado:p barba:q oculos:n careca:n loiro:q cabelo-comprido:n dancar:n'],
    ['mozart', 'Mozart', '🎻', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:q idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:n musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:p cor-marrom:? grande:n pequeno:n vivo:n historia:s ator:n oscar:n rico:q futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:n europa:s antigo:s recente:n chapeu:q cabelo-comprido:p pintor:p casado:p barba:n oculos:n careca:n loiro:q ' +
      'dancar:n'],
    ['beethoven', 'Beethoven', '🎼', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:p fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:n musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:s ator:n oscar:n rico:q futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:n estrangeiro-eua:n europa:s antigo:s recente:n cabelo-comprido:p pintor:p casado:n chapeu:n barba:n oculos:n careca:n loiro:n ' +
      'dancar:n'],
    ['xuxa', 'Xuxa', '💋', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:s serie:q livro:n videogame:n internet:n tv:s ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:p realeza:q cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:p cor-preto:? cor-branco:p cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:p oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n loiro:s cabelo-comprido:s dancar:p casado:s chapeu:? oculos:n careca:n'],
    ['anitta', 'Anitta', '💃', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:q tv:p ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:n recente:s dancar:s cabelo-comprido:s loiro:q casado:q oculos:n careca:n'],
    ['ivete-sangalo', 'Ivete Sangalo', '🎉', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:s ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:p recente:n dancar:p cabelo-comprido:s casado:s festa:p loiro:q oculos:n careca:n'],
    ['claudia-leitte', 'Claudia Leitte', '🎉', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:p ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:n recente:n loiro:s cabelo-comprido:s dancar:p casado:s festa:p oculos:n careca:n'],
    ['daniela-mercury', 'Daniela Mercury', '🥁', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n dancar:s festa:p casado:s cabelo-comprido:p loiro:q oculos:n careca:n'],
    ['sandy', 'Sandy (Sandy & Junior)', '🎤', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:p idoso:n fala:s desenho:n filme:p serie:p livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:p oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n cabelo-comprido:s casado:? loiro:q dancar:q oculos:n careca:n'],
    ['roberto-carlos', 'Roberto Carlos', '🌹', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:p fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:p ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:q cor-azul:p cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:p cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n festa:p cabelo-comprido:p casado:s barba:n oculos:n careca:n loiro:n dancar:n'],
    ['tim-maia', 'Tim Maia', '🎷', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:n oscar:n rico:p futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n barba:p oculos:q casado:q cabelo-comprido:n careca:n loiro:n dancar:q'],
    ['rita-lee', 'Rita Lee', '🎸', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n ruivo:s cabelo-comprido:s oculos:p casado:s loiro:n careca:n dancar:q'],
    ['elis-regina', 'Elis Regina', '🎙️', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:p ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n cabelo-comprido:n casado:s loiro:n oculos:n careca:n dancar:n'],
    ['caetano-veloso', 'Caetano Veloso', '🎸', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:p fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n cabelo-comprido:p casado:s barba:q oculos:q careca:n loiro:n dancar:q'],
    ['gilberto-gil', 'Gilberto Gil', '🎸', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:p fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:s masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n cabelo-comprido:p barba:p chapeu:p casado:s careca:q oculos:q loiro:n dancar:q'],
    ['chico-buarque', 'Chico Buarque', '🎼', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:p fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:p politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n pintor:p casado:p barba:q oculos:n careca:n loiro:n cabelo-comprido:n dancar:n'],
    ['gal-costa', 'Gal Costa', '🎤', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n cabelo-comprido:s casado:? loiro:n oculos:n careca:n dancar:q'],
    ['cazuza', 'Cazuza', '🎤', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n casado:n barba:n oculos:q cabelo-comprido:q careca:n loiro:n dancar:q chapeu:p'],
    ['renato-russo', 'Renato Russo', '🎸', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n barba:p oculos:p casado:n cabelo-comprido:n careca:n loiro:n dancar:q'],
    ['raul-seixas', 'Raul Seixas', '🎸', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:n oscar:n rico:q futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n barba:s oculos:p cabelo-comprido:p espaco:q casado:p careca:n loiro:n dancar:n'],
    ['mamonas-assassinas', 'Mamonas Assassinas', '🤪', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:n oscar:n rico:p futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n chapeu:p veiculo:p casado:n barba:p oculos:q careca:n loiro:n cabelo-comprido:q ' +
      'dancar:q'],
    ['ney-matogrosso', 'Ney Matogrosso', '🪶', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:p fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n dancar:s chapeu:p capa:p casado:n barba:n oculos:n careca:n loiro:n ' +
      'cabelo-comprido:?'],
    ['djavan', 'Djavan', '🎸', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:q fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n barba:p cabelo-comprido:p casado:? oculos:n careca:n loiro:n dancar:n'],
    ['milton-nascimento', 'Milton Nascimento', '🎙️', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:p fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n barba:p oculos:p chapeu:p casado:n cabelo-comprido:q careca:n loiro:n dancar:n'],
    ['marisa-monte', 'Marisa Monte', '🎤', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n cabelo-comprido:s casado:? loiro:n oculos:n careca:n dancar:n'],
    ['maria-bethania', 'Maria Bethânia', '🎙️', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:p fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:p cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n cabelo-comprido:s casado:n loiro:n oculos:n careca:n dancar:n'],
    ['lulu-santos', 'Lulu Santos', '🎸', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:q fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:p ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n oculos:p barba:q casado:s cabelo-comprido:n careca:n loiro:q dancar:n'],
    ['luan-santana', 'Luan Santana', '🤠', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:p tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:n recente:s casado:s chapeu:? barba:q cabelo-comprido:n oculos:n careca:n loiro:n dancar:q'],
    ['gusttavo-lima', 'Gusttavo Lima', '🤠', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:p tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:n recente:s casado:s barba:p chapeu:? cabelo-comprido:n oculos:n careca:n loiro:n dancar:q'],
    ['marilia-mendonca', 'Marília Mendonça', '🎙️', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:n recente:s cabelo-comprido:s casado:p loiro:q oculos:n careca:n dancar:n'],
    ['jorge-e-mateus', 'Jorge & Mateus', '🎸', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:n recente:n barba:p casado:p chapeu:q cabelo-comprido:n oculos:n careca:n loiro:n dancar:n'],
    ['zeze-di-camargo-e-luciano', 'Zezé Di Camargo & Luciano', '🎸', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:p serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n casado:s cabelo-comprido:p chapeu:q barba:q oculos:n careca:n loiro:n dancar:n'],
    ['pabllo-vittar', 'Pabllo Vittar', '👠', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:s tv:p ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:? ' +
      'feminino:p brasileiro:s estrangeiro-eua:n europa:n antigo:n recente:s dancar:s cabelo-comprido:s vestido:s casado:? oculos:n careca:n loiro:?'],
    ['ludmilla', 'Ludmilla', '🎤', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:p tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:n recente:s dancar:p casado:s cabelo-comprido:s loiro:q oculos:n careca:n'],
    ['iza', 'Iza', '🎤', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:p tv:p ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:n recente:s dancar:p cabelo-comprido:s casado:? loiro:n oculos:n careca:n'],
    ['luisa-sonza', 'Luísa Sonza', '🎤', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:p tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:n recente:s loiro:s dancar:p cabelo-comprido:s casado:? oculos:n careca:n'],
    ['wesley-safadao', 'Wesley Safadão', '🎤', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:n recente:s barba:s cabelo-comprido:p casado:s festa:p dancar:q oculos:n careca:n loiro:n ' +
      'chapeu:q'],
    ['alcione', 'Alcione', '🎺', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:p fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n casado:n cabelo-comprido:q loiro:n oculos:n careca:n dancar:q'],
    ['zeca-pagodinho', 'Zeca Pagodinho', '🪕', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:q fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n barba:s chapeu:p casado:s oculos:n careca:n loiro:n cabelo-comprido:n dancar:n'],
    ['pericles', 'Péricles', '🎤', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:p recente:n careca:s barba:p casado:s oculos:q cabelo-comprido:n loiro:n dancar:n'],
    ['thiaguinho', 'Thiaguinho', '🎤', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:n recente:p casado:s barba:p chapeu:? careca:q cabelo-comprido:n oculos:q loiro:n dancar:q'],
    ['seu-jorge', 'Seu Jorge', '🎸', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:s serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:s oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:n recente:n barba:s casado:? chapeu:? careca:q cabelo-comprido:q oculos:q loiro:n dancar:n'],
    ['angelica', 'Angélica', '🌟', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:p serie:q livro:n videogame:n internet:n tv:s ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:p oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n loiro:s cabelo-comprido:s casado:s dancar:p oculos:n careca:n'],
    ['eliana', 'Eliana', '🖐️', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:s ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n loiro:s cabelo-comprido:s casado:s dancar:p oculos:n careca:n'],
    ['mara-maravilha', 'Mara Maravilha', '🌈', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:s ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n cabelo-comprido:s casado:q loiro:n dancar:q oculos:n careca:n'],
    ['balao-magico', 'Turma do Balão Mágico', '🎈', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:s idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:s ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:q engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:p ' +
      'feminino:p brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n dancar:p escola:p casado:n oculos:n careca:n loiro:? cabelo-comprido:?'],
    ['palavra-cantada', 'Palavra Cantada', '🎶', 'IFA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:p realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:? futebol:n politico:n masculino:p ' +
      'feminino:p brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n dancar:p escola:p casado:s cabelo-comprido:q oculos:p careca:q barba:q loiro:n'],
    ['patati-patata', 'Patati Patatá', '🤡', 'IFA',
      'real:p pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:p filme:q serie:q livro:n videogame:n internet:n tv:s ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:s realeza:n cor-azul:p cor-vermelho:p cor-verde:? cor-amarelo:p ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:p futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n chapeu:s dancar:p festa:p casado:n barba:n oculos:n careca:n loiro:n ' +
      'cabelo-comprido:n'],
    ['toquinho', 'Toquinho', '🎸', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:p fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:s historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n escola:p barba:? oculos:q casado:? careca:n loiro:n cabelo-comprido:n dancar:n'],
    ['vinicius-de-moraes', 'Vinicius de Moraes', '📜', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:p fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:q ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n pintor:s casado:s oculos:q barba:n careca:q loiro:n cabelo-comprido:n dancar:n'],
    ['tom-jobim', 'Tom Jobim', '🎹', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:q fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:p musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n chapeu:q casado:s passaro:n oculos:q barba:q careca:n loiro:n cabelo-comprido:n ' +
      'dancar:n'],
    ['carmen-miranda', 'Carmen Miranda', '🍌', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:n fala:s desenho:n filme:s serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:p ator:s oscar:n rico:s futebol:n politico:n masculino:n ' +
      'feminino:s brasileiro:p estrangeiro-eua:n europa:p antigo:s recente:n chapeu:s comida:n dancar:p casado:p cabelo-comprido:n oculos:n careca:n loiro:n'],
    ['luiz-gonzaga', 'Luiz Gonzaga', '🪗', 'FA',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:p fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:s grande:n pequeno:n vivo:n historia:q ator:n oscar:n rico:? futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n chapeu:s festa:s casado:? barba:n oculos:n careca:n loiro:n cabelo-comprido:n ' +
      'dancar:q'],
    ['pixinguinha', 'Pixinguinha', '🪈', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:p fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:n musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:p ator:n oscar:n rico:q futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n barba:p chapeu:? casado:? oculos:n careca:q loiro:n cabelo-comprido:n dancar:n'],
    ['joao-gilberto', 'João Gilberto', '🎸', 'A',
      'real:s pessoa:s bicho:n coisa:n crianca:n idoso:p fala:s desenho:n filme:q serie:q livro:n videogame:n internet:n tv:n ' +
      'disney:n canta:s musica:s esporte:n heroi:n vilao:n magia:n voa:n engracado:q realeza:n cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:? ' +
      'cor-rosa:? cor-preto:? cor-branco:? cor-marrom:? grande:n pequeno:n vivo:n historia:n ator:n oscar:n rico:s futebol:n politico:n masculino:s ' +
      'feminino:n brasileiro:s estrangeiro-eua:n europa:n antigo:s recente:n casado:s oculos:q barba:n careca:q loiro:n cabelo-comprido:n dancar:n chapeu:q']
  ];
  (raiz.QEPersonagens = raiz.QEPersonagens || {}).musica = L;
  if (typeof module === 'object' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
