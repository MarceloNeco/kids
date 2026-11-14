# A-GARRA — máquina de pegar bichinho em 3D

Brincadeira do Bolinho de Chuva (solverone.com.br/kids/a-garra/). Pedido do dono em 14/Nov/2026, com fotos de máquinas de
um fliperama como referência (e, na 0.3.0, imagens de um vídeo de filhotes de salsicha numa máquina). A 0.1.0 era em 2D e pegava sempre; o dono pediu (14/Nov/2026): **3D**, ver de cima com zoom,
controle ⬆⬇⬅➡ + botão de agarrar, **a garra não pega toda vez** (como as de verdade), mais fiel às fotos e **várias
máquinas**: hambúrgueres, bichinhos que mexem, insetos. Isso é a 0.2.0.

Idioma (0.4.0): português, inglês ou espanhol, o escolhido na estante (`../idioma.js`), sem botão de idioma no jogo. O
nome muda com o idioma: **A-GARRA** · **THE CLAW** · **LA GARRA** (na tela, nos letreiros das máquinas e no letreiro de LED);
o botão PEGAR vira GRAB · COGER.

## Como se brinca

- **Máquina** (cada uma é um jogo, com a sua coleção e um prêmio dourado raro):
  - **Cabine de Telefone** (vermelha, como a das fotos): pelúcias — ursinho, coelhinha, gatinho, cachorrinho, ovelhinha,
    pinguim, unicórnio, sapinho, porquinha, panda, patinho e girafinha.
  - **Neon** (preta, tubos de neon verde e amarelo, parede de tijolo, letreiro de LED que corre): **bichinhos que mexem** —
    balançam, respiram, piscam e, de vez em quando, os de cima dão um pulinho no monte.
  - **Estrelas** (azul, com hexágonos): **insetos** — joaninha, abelha, borboleta, besouro, lagarta, libélula, formiga e
    vaga-lume (que brilha); as asas batem.
  - **Lanchonete** (vermelha e creme, chão quadriculado, cardápio na parede): **hambúrgueres** (x-burguer, x-salada,
    x-bacon, duplo, x-frango, burguer verde, x-tudo), cachorro-quente, batata frita e milk-shake.
  - **Bichos de Verdade** (0.3.0; branca e prateada, cobertor fofinho no chão, como no vídeo de filhotes que o dono mandou):
    bichos com jeito de bicho de verdade — filhotes de **salsicha** (preto e caramelo, caramelo e malhado), labrador, gato
    rajado, coelho, porquinho-da-índia, pinguim-imperador, pato, jabuti e leãozinho. Ficam de pé, **andam pelo cobertor**,
    olham em volta, abanam o rabo e respiram; na garra, esperneiam. São menos e maiores (o desenho é maior que a bola da
    física, que continua cabendo no buraco). Raro: o salsicha dourado.
- **Controle**: ⬅ ➡ para os lados, ⬆ para o fundo, ⬇ para a frente (segurar), e **PEGAR**. Também dá para **tocar no
  prêmio** que você quer (a garra vai até ele). No computador: setas e espaço.
- **Sortido**: cada partida tem outra mistura (cada tipo pelo menos uma vez, o resto sorteado), outro total, outro formato de
  monte (um "pico" sorteado) e prêmios caídos de jeitos variados (de costas, de lado, de cabeça para baixo).
- **Câmera**: 🎥 troca entre de frente, de cima e bem de lado (as laterais são de vidro, para ver a profundidade da garra); 🔍 aproxima (perto, a câmera acompanha a garra); arrastar o dedo
  na máquina gira; dois dedos aproximam.
- **Regra da garra** (igual às máquinas de verdade): quase sempre ela fecha **fraca** e solta — logo ao subir, no tranco lá
  em cima ou no caminho. Só de vez em quando vem **forte**: mirando bem, mais ou menos **1 a cada 4** tentativas no fácil,
  **1 a cada 7** no médio e **1 a cada 10** no difícil. Depois de muitas tentativas sem prêmio, a próxima bem mirada vem
  forte (garantia). A máquina lembra a contagem entre partidas (`bolinho:a-garra:contador`), como uma máquina de verdade.
- **Nível**: fácil (12 fichas, sem relógio, prêmios grandes, anel de mira), médio (10 fichas, 25 s, anel de mira), difícil
  (10 fichas, 15 s, prêmios menores, sem anel).

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Telas: menu, jogo, coleção, fim, "sem 3D" e "descansando" (interruptor desligado). |
| `maquina.js` | A máquina por dentro, sem desenho (roda no Node para os testes): prêmios como bolas com física 3D (o que fica parado "dorme" para o monte não derreter), a garra (mirar → descer → fechar → subir → levar → soltar), a **regra de pagamento** (`NIVEIS`: `cada`, `tol`), fichas, relógio, pulos dos vivos. |
| `premios3d.js` | Os prêmios em 3D, montados com peças simples; uma geometria por tipo com as cores nos vértices; olhos que piscam e asas que batem. `MAQUINAS` lista as máquinas e os prêmios. |
| `cenario3d.js` | As quatro máquinas em 3D (gabinete, vidro, trilhos, carrinho, cabo enrolado, garra de 3 dedos, buraco de acrílico, painel com alavanca, botão e visor, letreiros e paredes desenhadas em canvas) e as luzes. |
| `app.js` | Telas, controles, câmera, coleção, recordes, fim. `APP_VERSION` aqui. Módulo (`type="module"`). |
| `som.js` | Efeitos feitos na hora (WebAudio). |
| `libs/` | Three.js r187 (MIT), sem mudança. |
| `estilo.css`, `sw.js`, `manifest.webmanifest`, `icone*`, `versoes.json` | Visual, sem internet, instalar, versões. |
| `teste/` | `node --test a-garra/teste/*.test.js` (da raiz do repositório). |

Guardado no aparelho (`localStorage`): `bolinho:a-garra:pref`, `bolinho:a-garra:colecao`, `bolinho:a-garra:recordes`,
`bolinho:a-garra:contador`. Nada sai do aparelho; sem login e sem banco.

Interruptor no RootifyONE: app **Bolinho de Chuva** (`kids`) → **A-GARRA** (`a-garra`).
Com `?teste` aparece `window.GarraDebug`; `?semente=N` repete a mesma máquina.
