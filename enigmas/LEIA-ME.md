# Enigmatic — ligar o que combina, na lousa

Brincadeira da família **Bolinho de Chuva** (SolverONE). Até a v0.1.1 se chamava **Enigmas de Ligar**; desde a
v0.2.0 (06/Nov/2026) o nome é **Enigmatic**, igual em PT e EN. A pasta, o endereço, o id `enigmas` (estante,
interruptor) e as chaves do `localStorage` continuaram os mesmos, então quem instalou não perde nada.

Duas colunas de desenhos com palavras: a criança liga cada
desenho da **esquerda** ao da **direita** que combina com ele, com um risco de **giz** numa **lousa verde**, como as
filhas do dono faziam no quadro. Sem login, sem internet depois de aberto uma vez, e dá para instalar.

Endereço: https://solverone.com.br/kids/enigmas/

## Como brincar

- Escolha o nível: **🐣 Fácil** (3 a 5 anos, 3 ou 4 pares, ligações óbvias: bicho e comida, onde mora, cores, barulhos),
  **🦊 Médio** (5 a 9 anos, de 5 a 7 pares: primeiro opostos, mamãe e filhote, profissão e ferramenta, para que serve,
  de onde vem, quantos tem; depois, com 6 e 7 pares, as rodadas que até a v0.2.0 eram do Difícil: adivinhas, causa e
  efeito, como resolver, parte e todo, "qual dupla é do mesmo jeito", sequências, contas, metade e dobro, e **rimas** —
  em português no PT e em inglês no EN) ou **🦉 Difícil** (10 anos ou mais, e para adulto se divertir: só **4 pares**,
  mas de pensar — tabuada, divisão, frações, porcentagem, probleminhas, sequências, números romanos, horas, troco e
  medidas; planetas, corpo humano, plantas e fotossíntese, tipos de bicho, cadeia alimentar, ímãs e eletricidade,
  sólido/líquido/gás, instrumentos, inventores; coletivos, sinônimos e opostos difíceis, expressões como "chover
  canivete" (no EN, as expressões de lá: "raining cats and dogs"); "complete a dupla" (pena → pássaro; escama → ?) e
  adivinhas "o que é, o que é?").
- **Arraste o dedo** (ou o mouse) de um desenho até o outro, de qualquer lado para qualquer lado. Ou **toque num e
  depois no outro**. No teclado ou no controle: setas ↑ ↓ andam na coluna, ← → trocam de lado, Enter escolhe.
- Acertou: o risco de giz fica colorido e toca um sininho. Errou: os dois desenhos balançam e o risco se apaga sozinho.
  Nada de castigo: só as estrelas da rodada (3 sem erro, 2 com até 2 erros, 1 com mais).
- **💡** mostra um par piscando (conta como um erro nas estrelas). **🗣️** liga/desliga a voz que lê a palavra tocada
  (ajuda quem ainda não lê; a música abaixa enquanto a voz fala). **🔤** esconde as palavras e deixa só os desenhos:
  tocar (ou segurar, ou escolher) um desenho mostra a palavra num balão por 2 segundos e a 🗣️ lê; adivinha (carta só
  de texto) mostra sempre o texto. Começa com as palavras à vista e o jogo lembra a escolha. **🔔** liga/desliga os
  sons. O idioma (português, inglês ou espanhol da Espanha) é escolhido na estante do Bolinho de Chuva (`../idioma.js`);
  o jogo não tem botão de idioma próprio, e a voz lê no idioma escolhido.
- Ligou tudo: festa com estrelas e o **Próximo enigma**. Esc, o Voltar do celular ou tocar fora da janela também
  levam ao próximo; **🏠 Níveis** volta ao começo.

## Quantos enigmas

| Nível | Rodadas (PT) | Rodadas (EN) | Rodadas (ES) | Pares |
|---|---|---|---|---|
| Fácil | 36 | 36 | 36 | 19 com 3, 17 com 4 |
| Médio | 66 | 66 | 66 | 33 com 5, 17 com 6, 16 com 7 (as de 6 e 7 eram do Difícil até a v0.2.0; 4 de rimas próprias de cada língua — as do espanhol, da v0.3.4, foram escritas para rimar em espanhol) |
| Difícil | 54 | 54 | 54 | 4 em todas (desde a v0.3.0) |

Cada item tem as três línguas: `'emoji palavra|word|palabra'`. O código de cada rodada (o progresso guardado) sai só
do português e do inglês, então colocar ou mudar o espanhol não apaga o progresso de ninguém.

Na v0.3.0 o dono achou o Difícil fácil demais: as rodadas dele foram para o Médio (com o mesmo código, então quem já
tinha feito algumas não perde nada: o `J.migrar` do `jogo.js` leva as feitas e as estrelas do Difícil antigo para o
Médio, uma vez só) e o Difícil virou outro, com poucos pares e mais raciocínio. Toda carta de matemática do Difícil tem
a conta escrita no `R.CONTAS` (fim do `rodadas.js`), e o teste refaz cada conta.

Os enigmas vêm **misturados** e **não repetem** até a criança fazer todos do nível; aí recomeçam (a festa avisa). A
escolha sorteia entre os 4 próximos que faltam, na ordem do `rodadas.js`, então **dentro do nível a dificuldade sobe
aos poucos** (os de menos pares primeiro). As estrelas e quais já foram feitos ficam no aparelho
(`localStorage`, chaves `bolinho:enigmas:pref` e `bolinho:enigmas:progresso`); "↺ Começar do zero" apaga.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | As duas telas (níveis e lousa). Sem script inline (CSP). |
| `rodadas.js` | **Todo o conteúdo**. Para criar enigma novo, é só escrever mais uma linha lá (o formato está no topo do arquivo). |
| `jogo.js` | Regras sem tela: lê as rodadas, embaralha (ninguém fica na frente do seu par), confere ligação, estrelas e qual vem depois. |
| `app.js` | Tela: cartas, tamanho do desenho e das letras de cada carta (`ajustarCarta`), risco de giz (SVG), toque, arraste, teclado, sons (WebAudio), voz, 🔤 e balão, festa, progresso, música, instalar. |
| `estilo.css` | Lousa, moldura de madeira, giz, cartas, balão, festa. As cartas dividem a altura da lousa; deitado, o desenho fica ao lado da palavra. |
| `sw.js` + `manifest.webmanifest` + `icone-*.png` (de `icone.svg`) | Instalável e sem internet (cache `enigmas-v<versão>`). |
| `versoes.json` | Novidades de cada versão (PT/EN). |
| `fontes/` | Fredoka (OFL). |
| `teste/` | Testes: `node --test enigmas/teste/*.test.js` da raiz do repositório kids. |

Peças comuns da raiz usadas com `../`: `recursos.js` (interruptor `enigmas` do RootifyONE), `atualizar.js` (aviso de
versão nova), `telacheia.js` (tela inteira no tablet), `janela.js` (a janela da festa e a do "Começar do zero"),
`trilha.js` (música) e `instalar.js` (só com `?instalar=1`).

## Palavras nas cartas (v0.2.0)

O desenho fica grande em cima e a palavra embaixo, no meio (no celular deitado, lado a lado). Cada palavra vai num
`<span class="w">` que não quebra (`white-space: nowrap`), e o `.pal` usa `overflow-wrap: normal; hyphens: manual`:
a linha só pula nos espaços, **nunca no meio da palavra** (a v0.1.1 usava `overflow-wrap: anywhere; hyphens: auto` e
aparecia "fu- / maça"). O `ajustarCarta` do `app.js` mede cada carta: o desenho ocupa até ~metade da altura, a letra
começa em até 24 px e diminui (busca binária) até tudo caber, nunca abaixo de **12 px**; se nem assim couber, o
desenho encolhe um pouco. Mede de novo quando a tela muda de tamanho e quando a fonte termina de carregar. Em telas
de até 360 px a moldura e o vão do giz ficam mais finos (a palavra mais comprida, "cock-a-doodle-doo", precisa de
105 px). O teste confere todas as rodadas em 390, 320 e 844 px, em PT e EN.

## Riscos de giz (v0.3.0)

Cada ligação é uma **curva suave** (bezier cúbica, `C` no SVG) que sai da bolinha de giz de cada carta na horizontal,
como um S deitado, fina (4,5 px) e com a cor do par. Para não virar um emaranhado com quase tudo ligado ("uma
bagunça", disse o dono no celular de 412 px):

- **cada par tem a sua faixa** no vão entre as colunas (`faixaDe` no `app.js`): os riscos que descem ficam nas faixas da
  esquerda, os que sobem nas da direita, e dentro de cada grupo a ordem é a que não cria cruzamento a mais. Assim dois
  riscos "paralelos" nunca correm colados, e os cruzamentos se espalham em vez de cair todos no meio;
- embaixo de cada traço vai um **contorno escuro da cor da lousa** (halo): onde dois se cruzam, o de cima abre um
  vãozinho no de baixo e dá para ver qual passa por cima;
- os riscos **balançam bem devagar** (2,5 px, uma ida e volta a cada 6,5 s; as pontas ficam paradas). Com "reduzir
  movimento" ligado no aparelho, ficam parados;
- as 7 cores de giz (`CORES` no `app.js`) ficaram bem diferentes entre si (amarelo, rosa, azul, verde, laranja,
  lilás e branco; as de antes eram claras e parecidas);
- o vão entre as colunas ficou mais largo (20% da largura da tela em vez de 14%) para as curvas terem espaço;
- o risco que acompanha o dedo no arraste também é curva.

A curva nunca sai do vão (não cobre as palavras): o teste confere.

## Música

13 músicas alegres da Bagunçolândia (FreePD, domínio público), tocadas pelo `../trilha.js` com volume **0,22** (abaixo
do padrão 0,5: a criança está pensando). 🔇 no tocador desliga e o jogo lembra. As músicas não ficam guardadas para
usar sem internet (o service worker não mexe em áudio, como nos outros jogos); sem internet o tocador some e o jogo
segue com os efeitos. Créditos em `CREDITOS.md`.

## Testes

`node --test enigmas/teste/*.test.js` (da raiz do repositório kids):

- `conteudo.test.js`: pelo menos 30 rodadas por nível e por língua (40 no Difícil), pares certos por nível (Difícil
  sempre 4), dificuldade subindo, PT e EN em tudo, nenhum desenho/palavra repetido numa rodada (um só jeito de ligar),
  nenhuma rodada repetida, emojis só até o Unicode 11; o Médio tem todas as rodadas do Difícil antigo com o mesmo
  código; **toda conta do Difícil refeita** pelo teste (e o texto "7 × 8", "6²" ou "XIV" também), com o mesmo número
  em PT e EN; o Difícil mistura contas, ciências, palavras, adivinhas e "complete a dupla".
- `jogo.test.js`: ligar, errar, estrelas, embaralhar sem par alinhado, não repetir até acabar, progressão, e o
  progresso de antes da v0.3.0 indo do Difícil para o Médio uma vez só.
- `arquivos.test.js`: versão igual em `app.js`, `sw.js` e `versoes.json`; `sw.js` guarda tudo; CSP; ids; PT|EN;
  músicas existem e têm crédito; ícones; nenhum segredo.
- `pagina.test.js` (Chromium com Playwright e um servidorzinho local): completa rodadas tocando, arrastando com o
  mouse e com o dedo, só com o teclado, no celular em pé, deitado, em 320 px e no computador, em PT e EN, sem
  localStorage, e sem nenhum erro no console. Em todas as rodadas: nenhuma palavra quebra no meio nem sai da carta e a
  letra fica com 12 px ou mais; 🔤 esconde as palavras, tocar mostra o balão e a voz lê, e o jogo lembra. Os riscos
  são curvas (comando `C`) com halo, ficam no vão entre as colunas, cada par numa faixa, balançam devagar e ficam
  parados com "reduzir movimento"; o risco do arraste também é curva; quem tinha progresso no Difícil antigo vê as
  estrelas no Médio.

## Versão

A cada versão: subir `APP_VERSION` no `app.js`, `VERSAO` no `sw.js` e a entrada nova no topo do `versoes.json`
(PT/EN, data e hora) — o teste confere que os três são iguais. Arquivo novo entra no `ARQUIVOS` do `sw.js`.
