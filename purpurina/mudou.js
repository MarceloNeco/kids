/* A Purpurina 80's mudou de pasta (dono, 24/Nov/2026): o cartão "Purpurina 80's" da estante agora abre a cópia congelada
   da Purpurina Nova Era em ../purpurina-80s/. Este endereço leva para lá (quem tem o ícone antigo no celular também).
   Os arquivos desta pasta continuam: outros jogos usam o desenho (boneca.js), as músicas (musicas/) e a personagem dela.
   O jogo antigo ainda abre com ?antiga (e com ?teste, para os testes). */
(function () {
  var q = location.search;
  if (/[?&](teste|antiga)\b/.test(q)) return;
  location.replace('../purpurina-80s/' + q + location.hash);
})();
