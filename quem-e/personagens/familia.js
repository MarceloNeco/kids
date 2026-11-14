/* Quem é? — A Meleca Adivinha: personagens da casa (inventados pela família).

   FORMATO (igual em todo arquivo de personagens/):
     [ id, nome, emoji, níveis, respostas ]
       id        letras minúsculas, números e hífen; único na lista inteira
       nome      como aparece no chute ("Você pensou em… <nome>?")
       emoji     um emoji (nunca foto)
       níveis    'IFA' (Infantil, Família e Adulto), 'FA' ou 'A'
       respostas "pergunta:resposta" separados por espaço; resposta s (sim), p (provavelmente sim), ? (não sei),
                 q (provavelmente não), n (não). Perguntas em adivinha-perguntas.js; as do núcleo são obrigatórias.

   JOÃO ALVES, a lenda da casa: personagem das histórias que o pai inventa para as filhas. Começou como o taxista
   humilde de uma novela antiga do SBT ("João Alves Taxista", com o Fábio Júnior), que achou uma mala de dinheiro no
   carro; nas histórias do pai virou uma missão pelo mundo e depois o protagonista de tudo: João Wick Alves,
   João Grilo Alves, João Connor Alves, pai do Forrest Gump… As respostas abaixo saíram do que o dono contou em
   14/Nov/2026 e ESTÃO PARA O DONO CONFERIR (quem-e/PENDENCIAS.md). Aparência (dono, 14/Nov/2026): uma mistura do
   Arnold Schwarzenegger, do Keanu Reeves e do Ben Affleck: atlético e forte, uns 45 anos, herói de ação, cabelo escuro, sem barba, de óculos escuros (não usa óculos de grau). */
(function (raiz) {
  'use strict';
  var L = [
    ['joao-alves', 'João Alves', '🚕', 'IFA',
      'real:q pessoa:s bicho:n coisa:n masculino:s feminino:n crianca:n idoso:n brasileiro:s fala:s ' +
      'desenho:n filme:p serie:p livro:n videogame:n internet:n tv:n disney:n ' +
      'canta:q musica:n esporte:n heroi:s vilao:n magia:q voa:q engracado:s realeza:n ' +
      'cor-azul:? cor-vermelho:? cor-verde:? cor-amarelo:p cor-rosa:n cor-preto:p cor-branco:? cor-marrom:? grande:n pequeno:n ' +
      'veiculo:s rico:p pirata:s detetive:p forte:s rapido:s arma:s barba:n chapeu:q oculos:p careca:n loiro:n ruivo:n cabelo-comprido:? ' +
      'casa:s familia-grande:s casado:? antigo:p historia:n ator:n politico:n ' +
      't-acao:p t-novela:p t-volta-futuro:p']
  ];
  (raiz.QEPersonagens = raiz.QEPersonagens || {}).familia = L;
  if (typeof module === 'object' && module.exports) module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
