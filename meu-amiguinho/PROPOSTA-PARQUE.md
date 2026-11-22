# Proposta: expansão "Parque do Amiguinho" (Meu Amiguinho)

Status: **proposta, nada implementado** (regra zero: o dono decide antes de qualquer código). Data: 22/Nov/2026.
Ideia: depois de montar a pelúcia, a criança leva o amiguinho para passear num parque de 6 áreas. Cada área tem 1 minijogo
simples (toque, arrastar, inclinar), 3 níveis, e dá **selos** num **passaporte do parque**. Jogo novo ao lado do Meu
Amiguinho (cartão próprio no `catalogo.js` quando existir; até lá, uma porta dentro do Meu Amiguinho).

## O que o parque faz e o que reaproveita

Regras comuns (todo o repositório já pede): PT/EN/ES, 🏠/🚪 pela `navegacao.js`, 3 níveis, Jogar sempre à vista, música
pela regra da música (`trilha.js`), interruptor no RootifyONE, `sw.js` pelo `sw-comum.js`, vigias de teste. Cada minijogo
é um **módulo pequeno** (`areas/<nome>.js`) que recebe `{ amiguinho, nivel }` e devolve `{ selo: 0..3 }`.
Fundos e bichinhos em desenho vetorial/canvas (sem foto); nada pesado: carrega só a área aberta.

## As 6 áreas (nomes próprios, originais)

**1. Pico Trepa-Trepa** (subida) | esforço **M**
- Tema: morro de agarras coloridas com 3 andares de nuvem; o amiguinho sobe até a bandeira.
- Minijogo: aparecem 2-3 agarras acesas; tocar a certa (a mais alta/da cor pedida) faz o amiguinho subir um degrau.
  Errou: escorrega meio andar, sem castigo. Nível 1: uma agarra por vez; 2: três, com cor pedida; 3: agarras que sacodem.
- Controle: toque. Selo: 1 por andar completo (3 selos).
- Reaproveita: `labirinto/` (caminho/andares), `fruta-podre/` (física leve opcional), cartões grandes da `a-garra/`.

**2. Carrossel de Bichinhos** (ritmo) | esforço **P**
- Tema: carrossel com bichos que giram e tocam uma melodia.
- Minijogo: o bicho brilha em sequência; a criança repete tocando na ordem (tipo "siga o mestre"), 3, 4, 5 notas.
  Acertou a rodada: o carrossel gira mais rápido e o amiguinho acena.
- Controle: toque (grande, sem tempo apertado no nível 1). Selo: por rodadas feitas (3, 6, 9).
- Reaproveita: `trilha.js`/sons do `baguncolandia/som.js`, `enigmas/` (sequências), `clipe.js` (bichinhos dançando).

**3. Estrelário** (espaço) | esforço **M**
- Tema: cúpula de estrelas e planetas de bolhas; o amiguinho vai numa naveta redonda e desce num escorregador de cometa.
- Minijogo: inclinar o aparelho (ou arrastar, ou setas na TV) para guiar a nave, pegar estrelinhas e desviar de pedras;
  no fim, o escorregador: arrastar para os lados para pegar o máximo de estrelas na descida.
- Controle: inclinar/arrastar. Selo: por estrelas (10, 20, 30).
- Reaproveita: `vruuum/` (direção por inclinação, `rec: incl`), `aqua/` (fundo animado), `tijolaco/` (colisão simples).

**4. Trilho do Pedal** (montanha-russa a pedal) | esforço **M**
- Tema: trilho de montanha com túnel e ponte; a energia vem da pedalada.
- Minijogo: tocar **esquerda-direita alternado** (os pés) para ganhar velocidade; nos morros é preciso pedalar mais, nas
  descidas, soltar e inclinar para pegar moedas-bolinha. Chegar à estação antes do fim da "energia".
- Controle: dois toques alternados (na TV: dois botões); em dupla, cada um pedala um lado (`rec: dois`). Selo: pelo tempo.
- Reaproveita: `vruuum/` (pista, fases, TV/`kids.js`), `fruta-podre/` (trajetória), `a-garra/` (dois jogadores).

**5. Sítio das Bolinhas** (fazendinha) | esforço **P**
- Tema: fazendinha com árvore de frutas e piscina rasa de bolinhas (para os pequenos).
- Minijogo: colher frutas arrastando-as para a cesta; achar o bichinho escondido sob as bolinhas (tocar nelas para afastar);
  alimentar o bichinho pedido. Nível 1: poucas frutas e sem tempo; 3: pedidos de cor e quantidade.
- Controle: toque e arrastar. Selo: por tarefas feitas (3).
- Reaproveita: bolas da `baguncolandia/` (física/abertura de bolas), `glub-glub/` (pegar e arrastar), `cozinha/` (frutas).

**6. Ateliê Pincel-Mágico** (arte) | esforço **P**
- Tema: bancada de tintas, glitter e "pintura de carinha" na pelúcia.
- Minijogo: a criança pinta uma faixa, estrela ou bochecha do **próprio amiguinho** seguindo um modelo (ou livre no nível 1);
  o modelo pontua só cobrir as áreas, sem exigir precisão. A arte vira um acessório guardado na coleção.
- Controle: arrastar o dedo. Selo: modelo completo (1), livre (1), combinar cores (1).
- Reaproveita: `rabiscolandia/` (pincéis e paleta), `purpurina/` (brilho), `peluqueria/`.

## Mapa do parque (como desenhar)

Uma única tela de céu aberto, desenhada em camadas SVG/canvas, que **rola de lado** com arrastar (sem rolar para baixo, no
celular em pé cabe uma região por vez; tablet/TV mostram tudo). Uma trilha sinuosa (caminho de pedrinhas) liga seis
"ilhotas", uma por área, cada uma com silhueta e cor própria (morro, carrossel, cúpula, trilho, sítio, tenda). No centro,
uma praça com fonte e a **cabine do passaporte**. Cada ilhota mostra seus 3 selos (cinza/colorido) e uma plaquinha com o nome.
O amiguinho caminha pela trilha até a ilhota tocada. Acessibilidade: tudo também por botões grandes; respeitar "reduzir movimento".

## Passaporte de selos

- Caderninho com 6 páginas (uma por área) e 3 selos por página = **18 selos**; ganha-se pelo desempenho do nível (1 por
  nível concluído, não por velocidade: nenhum nível trava a criança).
- Selos são desenhos próprios (carimbo redondo com o bichinho da pelúcia), guardados no aparelho (`localStorage`, como a
  coleção do Meu Amiguinho). Páginas completas ganham um **acessório novo** para a pelúcia (ex.: capacete de escalada,
  óculos estelares); passaporte cheio: certidão especial e pequeno desfile de confete.
- Sem pontuação pública, sem ranking, sem anúncio; nada sai do aparelho (LGPD, público infantil).
- Tem versão para imprimir/mostrar na TV, opcional e posterior.

## O amiguinho passeando com a roupa escolhida

O Meu Amiguinho já guarda a pelúcia como **dados** (bichinho, pelo, coração, fofura, roupa, acessórios) e a desenha por
uma função de desenho. O parque usa a **mesma função**, em 3 poses fixas reutilizadas por todas as áreas: andando (2
quadros), comemorando e escorregando/descendo. Roupa e acessórios entram como camadas, de modo que o que a criança escolheu
aparece em toda área (capacete só se ela quiser; nunca troca a roupa à força). Voz e "fofura" mudam só os gestos e falas
curtas ("Que alto!"). Pré-requisito: o Meu Amiguinho expor a função/dados da pelúcia numa peça comum (acordar com quem
o constrói, sem duplicar).

## Ordem de entrega sugerida

1. **MVP (2 áreas)**: mapa simples com 2 ilhotas + passaporte + amiguinho passeando. Áreas: **Carrossel de Bichinhos** (P) e
   **Sítio das Bolinhas** (P), as mais baratas e que mais reaproveitam. Valida mapa, selos e a ponte com a pelúcia.
2. **Ateliê Pincel-Mágico** (P): fecha o ciclo com os acessórios.
3. **Pico Trepa-Trepa** (M) e **Estrelário** (M): inclinação e subida.
4. **Trilho do Pedal** (M, em dupla/TV) por último: o mais trabalhoso.
5. Depois: premiação final, passaporte para imprimir, novas áreas.

## Riscos

- **Peso/escopo**: seis jogos em um. Mitigação: módulos independentes, só o que é aberto é baixado (gaveta compartilhada).
- **Inclinação** (Estrelário, Pedal): varia por aparelho e iOS pede permissão; sempre ter alternativa por arrastar/botões.
- **Pedal em dupla**: toques simultâneos no celular são irregulares; testar em TV e com 2 dedos cedo.
- **Dependência do Meu Amiguinho**: o formato da pelúcia ainda está nascendo; combinar o contrato de dados antes.
- **Idade**: pequenos (3-5) e maiores querem coisas diferentes; os 3 níveis devem cobrir isso sem texto necessário.
- **Música e voz**: seguir a regra da música (instrumentos de verdade; favorita em sem internet) em 3 idiomas.
- **Propriedade intelectual**: ver abaixo; revisar nomes e arte antes de publicar.

## O que não entra

Apenas a ideia geral (um parque com áreas temáticas e minijogos, checklist de atrações) é aproveitada. **Não** entram:
o nome da marca ou do parque de referência, os nomes das áreas e dos personagens do folheto, os personagens e seus
visuais, slogans, cores/arte/layout do mapa, a divisão por andares ou a ordem das atrações do folheto, nem textos copiados.
As fotos do folheto (que mostram pessoas) **não** são copiadas para o repositório; não há referência visual guardada aqui.
Nomes, bichinhos, mapa e selos desta proposta são originais e devem ser desenhados do zero.

## Decisões que dependem do dono

1. Parque como jogo separado (cartão próprio) ou como porta dentro do Meu Amiguinho?
2. Começar pelo MVP de 2 áreas (sugestão) ou por outras duas?
3. Passaporte imprimível: agora ou depois?
4. Os acessórios de prêmio do passaporte valem só no Meu Amiguinho?
