# Enigmas de Ligar — ligar o que combina, na lousa

Brincadeira da família **Bolinho de Chuva** (SolverONE). Duas colunas de desenhos com palavras: a criança liga cada
desenho da **esquerda** ao da **direita** que combina com ele, com um risco de **giz** numa **lousa verde**, como as
filhas do dono faziam no quadro. Sem login, sem internet depois de aberto uma vez, e dá para instalar.

Endereço: https://solverone.com.br/kids/enigmas/

## Como brincar

- Escolha o nível: **🐣 Fácil** (3 a 5 anos, 3 ou 4 pares, ligações óbvias: bicho e comida, onde mora, cores, barulhos),
  **🦊 Médio** (5 a 7 anos, 5 pares: opostos, mamãe e filhote, profissão e ferramenta, para que serve, de onde vem,
  quantos tem) ou **🦉 Difícil** (7 anos ou mais, 6 ou 7 pares com raciocínio: adivinhas, causa e efeito, como
  resolver, parte e todo, "qual dupla é do mesmo jeito" (analogias), o que vem depois (sequências), contas, metade e
  dobro, e **rimas** — em português no PT e em inglês no EN).
- **Arraste o dedo** (ou o mouse) de um desenho até o outro, de qualquer lado para qualquer lado. Ou **toque num e
  depois no outro**. No teclado ou no controle: setas ↑ ↓ andam na coluna, ← → trocam de lado, Enter escolhe.
- Acertou: o risco de giz fica colorido e toca um sininho. Errou: os dois desenhos balançam e o risco se apaga sozinho.
  Nada de castigo: só as estrelas da rodada (3 sem erro, 2 com até 2 erros, 1 com mais).
- **💡** mostra um par piscando (conta como um erro nas estrelas). **🗣️** liga/desliga a voz que lê a palavra tocada
  (ajuda quem ainda não lê; a música abaixa enquanto a voz fala). **🔔** liga/desliga os sons. **EN/PT** troca a língua.
- Ligou tudo: festa com estrelas e o **Próximo enigma**. Esc, o Voltar do celular ou tocar fora da janela também
  levam ao próximo; **🏠 Níveis** volta ao começo.

## Quantos enigmas

| Nível | Rodadas (PT) | Rodadas (EN) | Pares |
|---|---|---|---|
| Fácil | 36 | 36 | 19 com 3, 17 com 4 |
| Médio | 33 | 33 | 5 em todas |
| Difícil | 33 | 33 | 17 com 6, 16 com 7 (4 de rimas próprias de cada língua) |

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
| `app.js` | Tela: cartas, risco de giz (SVG), toque, arraste, teclado, sons (WebAudio), voz, festa, progresso, música, instalar. |
| `estilo.css` | Lousa, moldura de madeira, giz, cartas, festa. Tamanho das cartas segue o número de pares e a altura da tela. |
| `sw.js` + `manifest.webmanifest` + `icone-*.png` (de `icone.svg`) | Instalável e sem internet (cache `enigmas-v<versão>`). |
| `versoes.json` | Novidades de cada versão (PT/EN). |
| `fontes/` | Fredoka (OFL). |
| `teste/` | Testes: `node --test enigmas/teste/*.test.js` da raiz do repositório kids. |

Peças comuns da raiz usadas com `../`: `recursos.js` (interruptor `enigmas` do RootifyONE), `atualizar.js` (aviso de
versão nova), `telacheia.js` (tela inteira no tablet), `janela.js` (a janela da festa e a do "Começar do zero"),
`trilha.js` (música) e `instalar.js` (só com `?instalar=1`).

## Música

13 músicas alegres da Bagunçolândia (FreePD, domínio público), tocadas pelo `../trilha.js` com volume **0,22** (abaixo
do padrão 0,5: a criança está pensando). 🔇 no tocador desliga e o jogo lembra. As músicas não ficam guardadas para
usar sem internet (o service worker não mexe em áudio, como nos outros jogos); sem internet o tocador some e o jogo
segue com os efeitos. Créditos em `CREDITOS.md`.

## Testes

`node --test enigmas/teste/*.test.js` (da raiz do repositório kids):

- `conteudo.test.js`: pelo menos 30 rodadas por nível e por língua, pares certos por nível, dificuldade subindo,
  PT e EN em tudo, nenhum desenho/palavra repetido numa rodada (um só jeito de ligar), nenhuma rodada repetida,
  emojis só até o Unicode 11.
- `jogo.test.js`: ligar, errar, estrelas, embaralhar sem par alinhado, não repetir até acabar, progressão.
- `arquivos.test.js`: versão igual em `app.js`, `sw.js` e `versoes.json`; `sw.js` guarda tudo; CSP; ids; PT|EN;
  músicas existem e têm crédito; ícones; nenhum segredo.
- `pagina.test.js` (Chromium com Playwright e um servidorzinho local): completa rodadas tocando, arrastando com o
  mouse e com o dedo, só com o teclado, no celular em pé, deitado, em 320 px e no computador, em PT e EN, sem
  localStorage, e sem nenhum erro no console.

## Versão

A cada versão: subir `APP_VERSION` no `app.js`, `VERSAO` no `sw.js` e a entrada nova no topo do `versoes.json`
(PT/EN, data e hora) — o teste confere que os três são iguais. Arquivo novo entra no `ARQUIVOS` do `sw.js`.
