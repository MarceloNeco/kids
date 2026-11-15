# Backlog da Purpurina — para retomar depois de quinta-feira, 19/Nov/2026

Pedido do dono (15/Nov/2026): anotar tudo, com as mídias, num lugar fácil de achar (não perdido no histórico da
conversa). **Retomar depois de quinta-feira (19/Nov), quando os créditos renovarem.** Antes disso, nada de trabalho
pesado. Ordem sugerida: P1 primeiro.

## Onde estão as mídias (fotos, GIFs, prints)

- **Google Drive do dono, pasta "Purpurina - backlog e referencias"** (particular, só o dono vê):
  - `Purpurina - 2-capturas-do-app (ate 15-Nov-2026).zip`: 37 prints do jogo com o que estava errado. ✅ no Drive.
  - `Purpurina - 1-referencias-desfile (ate 15-Nov-2026).zip`: 53 GIFs, vetores e fotos de desfile (adulto, infantil,
    masculino). ⏳ falta subir (passa do limite de envio daqui; ver o fim deste arquivo).
  - `Purpurina - 3-fotos-pessoais-PRIVADO (ate 15-Nov-2026).zip`: 35 fotos da família, só referência de rosto, cabelo
    e traços. ⏳ falta subir. **Nunca no repositório**: o repositório é público.
- Cada .zip tem um `INDICE.txt` com a data e a hora de cada mídia.

## P1 — giro 3D com defeito (prioridade do dono)

- "Quando você gira o bonequinho, o 3D não tá legal, tem alguns defeitos. Se você tirar o frame ângulo por ângulo,
  você vai ver que o negócio distorce."
- Como fazer: gerar a volta inteira quadro a quadro (0° a 360°, de 10 em 10°) com vários cabelos, roupas e personagens,
  olhar cada quadro e corrigir todo pulo ou deformação. Depois, um teste que compara quadros vizinhos.
- Talvez precise do Higgsfield (créditos) para uma solução 3D de verdade; avaliar antes.

## P1 — rosto feminino natural (não "queixudo" nem "cabeçudo") e sem "barba"

- Nas personagens prontas, o rosto ficou masculino, com queixo grande e cabeça grande. "Tem que ser natural."
- Referência: as fotos da família (Drive, pasta 3): rosto oval e suave, queixo pequeno e arredondado, bochechas de
  criança, testa proporcional.
- Pode continuar havendo vários formatos de rosto, mas o feminino não pode ser queixudo.
- **A parte de baixo do rosto está escurecida e parece barba ("ficou horrível").** Provável causa: o degradê de volume
  do rosto (`volRosto` no `boneca.js`), que escurece as bordas. Tirar o escuro do queixo e da mandíbula, como já foi
  feito antes (pendência #5).
- Print do dono (Drive, pasta 2, 15/Nov ~11h58): a tela de estilos com a personagem de praia.

## P2 — combinações prontas dentro do estúdio (não só o look inteiro)

- Os estilos prontos (look completo) agradaram. Falta ter combinações prontas **dentro de cada parte**, enquanto ela
  está montando, sem desfazer o resto:
  - maquiagem: base + blush + sombra + delineado + cílios + batom combinando;
  - roupa: combinações de peças (blusa + saia, vestido + sapato…);
  - penteado com brincos e acessórios de cabelo;
  - acessórios combinando.
- Aplica só aquela parte por cima do que já está. O look completo continua existindo.

## P2 — celular primeiro, para crianças de 5 a 15 anos

- Funciona no computador e no tablet, mas tem que estar otimizado para celular: sem empilhar opções.
- Onde a lista continua para o lado, tem que ficar óbvio que tem mais: seta, a próxima opção aparecendo pela metade,
  um brilho na borda.
- Benchmark: **Poki (poki.com)**, uma excelente referência. Olhar os jogos de vestir e maquiar e trazer as melhores
  práticas de interface, de tamanho de botão e de "tem mais para o lado".

## P2 — roupas, looks e penteados mais caprichados (pendência #56)

- "Tem muita oportunidade para melhorar." Referências nas fotos de desfile (Drive, pasta 1): saias rodadas e
  assimétricas, babados em camadas, cropped, conjuntos, tranças, laços, tiaras.

## P3 — já na agenda (`AGENDA.md`)

- Músicas compostas no Higgsfield (14) e ícones 3D (42): esperam os créditos do Higgsfield. A checagem diária fica
  parada até sexta, 20/Nov (para não gastar), e volta depois.
- Ideia (#57): duas crianças desfilando juntas, de mãos dadas (fotos de referência). Perguntar antes.

## O que o dono já aprovou (não precisa perguntar de novo)

- Publicar (pull request + merge) depois de testar.
- Usar o Higgsfield (L40S, 71 créditos/h, até 3 h) quando houver créditos.
