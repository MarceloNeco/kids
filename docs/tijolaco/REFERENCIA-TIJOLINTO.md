# TijoLinto — referência de jogabilidade (dono, 19/Nov/2026)

O dono mandou uma especificação feita no Gemini de um jogo de "fila de bolinhas num trilho, atirar para juntar 3 da
mesma cor", como **referência de jogabilidade** para o modo de fila do TIJOLAÇO (elemento **E6** da `PROPOSTA.md`).
Regra do dono: **mesma jogabilidade, nada de propriedade intelectual**. O nome não é o do jogo famoso: o modo se chama
**TijoLinto** (tijolo + labirinto, ideia do próprio dono em 17/Nov; EN **Brickrinth**, ES **Ladrilaberinto**) e tudo é
de **material de construção**.

## O que muda de tema (o que NÃO entra → o que entra)

| Na referência | No TijoLinto |
|---|---|
| Templo asteca/maia, selva, runas, ouro velho | **Canteiro de obra**: terra batida, tapumes, andaimes, fita zebrada, sol de fim de tarde |
| Ídolo de pedra / sapo giratório que cospe as bolinhas | **Betoneira-canhão** giratória (ou um guindastezinho), com o próximo tijolo visível no tambor |
| Bolinhas de mármore com runas | **Tijolos redondos de material**, cada cor com um **símbolo** (daltonismo): tijolo vermelho (🧱 tijolo), telha laranja (onda), azulejo azul (quadradinho), madeira marrom (veio), pedra cinza (bolinha), tinta verde (gota); roxo e branco nas fases avançadas |
| Trilho esculpido na pedra | **Canaleta de obra** num **labirinto** (o toque próprio: portões que você abre e fecha) |
| Crânio/abismo no fim do trilho | **Caçamba de entulho** com a tampa abrindo e luz giratória amarela de alerta |
| Túneis e pontes de pedra | **Manilhas** (canos de concreto) e **pontes de andaime** |
| "Barra Zuma" | **Barra da Obra** ("Obra pronta!" quando enche: para de entrar tijolo) |
| Moeda de ouro flutuante | **Capacete dourado** ou **chave de ouro** flutuando |
| Tambores tribais na zona de perigo | **Bate-estaca** e apito de obra acelerando |

## O que fica igual (jogabilidade, que é livre)

- **Controles:** mirar com o dedo ou o mouse (o lançador gira 360°); soltar dispara; tocar no lançador (ou Espaço) troca
  o tijolo atual com o próximo. Teclado e controle da TV: setas giram, OK dispara, outra tecla troca.
- **Inserção:** o tijolo atirado encaixa antes ou depois do tijolo atingido (pelo lado do impacto), empurrando a fila da
  frente para abrir espaço, com animação de ~120 ms.
- **Juntar 3 ou mais da mesma cor** estoura o grupo e abre um buraco na fila.
- **Ímã:** se as pontas do buraco forem da mesma cor, a parte da frente volta puxada e, se formar 3, estoura de novo:
  **combo x2, x3, x4…**, com som subindo de nota a cada combo.
- **Tijolos de poder** (piscam por ~15 s; valem quando o grupo deles estoura): **marreta** (bomba em área), **ré do rolo**
  (a fila volta 3–4 s), **sinal vermelho** (65 % mais devagar por 8 s), **fio de prumo** (mira completa e tiro rápido
  por 10 s), **balde de tinta** (ideia da proposta: pinta os vizinhos da mesma cor).
- **Bônus:** tiro que atravessa buracos da fila ("tiro na brecha": +100 × buracos atravessados); capacete dourado
  flutuante (+500 a +1.000 e enche a barra).
- **Fases:** trilho único (espirais, S, labirintos com cruzamentos e manilhas), **dois trilhos** com duas caçambas, e
  **lançador que anda** num trilho de andaime.
- **Vitória:** Barra da Obra cheia e o último tijolo estourado; bônus final de um "tijolo de ouro" que percorre o resto
  do caminho até a caçamba. **Derrota:** o primeiro tijolo chega na caçamba; a fila acelera e cai toda dentro.
- **Perigo:** nos últimos 15 % do caminho a caçamba abre, a luz gira e o apito acelera.

## Técnica (da referência, mantida)

- Sem física livre: o caminho é uma **curva paramétrica** (Catmull-Rom) pré-calculada numa tabela de pontos a cada 1 px
  (x, y, tangente), consultada pela distância `s` desde o começo.
- A fila é uma **lista de segmentos**, cada um com os tijolos em ordem; cada tijolo guarda só `s` (e o deslocamento do
  encaixe). Posição na tela = ponto da curva em `s`; o tijolo gira conforme anda (`s / raio`).
- Colisão do tiro: distância até os tijolos visíveis (os que estão dentro da manilha não contam); o lado do encaixe sai
  do produto escalar com a tangente do caminho.
- Fase em JSON: lançador (fixo ou móvel), trilhos com pontos do caminho, velocidade base, rajada inicial, zona de perigo
  (0,85), túneis/manilhas e **portões** (o toque do TijoLinto), cores disponíveis, meta da Barra da Obra, chance de poder
  e intervalo do capacete dourado.
- 3 níveis do Bolinho: fácil (4 cores, fila lenta, mira completa), médio (5 cores), difícil (6 cores, fila mais rápida,
  mira curta).
- Textos flutuantes ("+300", "COMBO x3!", "TIRO NA BRECHA +200!") e tremor leve (só sem "reduzir movimento").

**Fica de fora, sempre:** a palavra "Zuma", sapo, ídolo, templo, crânio, bolinhas de pedra com runas e qualquer arte,
som ou nome do jogo de referência.
