# Campo Minado — o jardim dos ouriços dorminhocos

Brincadeira da família **Bolinho de Chuva** (SolverONE). O campo minado clássico com cara de jardim: embaixo da
grama dormem uns ouriços 🦔 e a criança abre o jardim todo sem acordar nenhum. Sem login, e **sem internet** depois
de aberto uma vez. Em inglês o nome na tela é **Garden Sweeper**.

Endereço: https://solverone.com.br/kids/campo-minado/

## Como brincar

- Escolha o nível: **🌱 Fácil** (8 × 8, 8 ouriços), **🌷 Médio** (10 × 14, 22) ou **🌳 Difícil** (12 × 20, 45).
  No celular em pé o jardim fica em pé; na tela deitada (tablet, computador) ele deita junto.
- **Toque** numa grama para abrir. O **primeiro toque é sempre seguro** e abre um pedaço grande (a casa tocada e as
  oito em volta nunca têm ouriço). Casa sem número abre as vizinhas sozinha.
- O **número** conta quantos ouriços dormem nas oito casinhas em volta.
- **🚩 Bandeirinha** onde tem ouriço: ligue o botão **🚩** (modo bandeirinha: cada toque põe ou tira), ou **segure o
  dedo** na grama, ou **botão direito** do mouse. No teclado: setas andam, Enter abre, **B** (ou F) marca.
- **Acorde**: tocar num número que já tem todas as bandeirinhas em volta abre as outras casinhas de uma vez.
- Em cima: **←** volta aos níveis, **🦔** quantos faltam marcar, **🙂** começa de novo, **⏱** o tempo, **🚩** o modo
  bandeirinha e **➖ ➕** o zoom. Dois dedos também aproximam; arrastar anda pelo jardim.
- Ganhou: nascem flores no jardim, caem pétalas, e aparece o tempo (🏆 se for o melhor do nível). Perdeu: o ouriço
  acorda e treme, e os outros aparecem. "Tentar de novo" ou "Escolher nível".
- No menu: **EN/PT** troca a língua, **🔊** liga/desliga os sons do jogo, **❓** mostra como brincar. A música é do
  tocador comum dos jogos, no canto de baixo (🔇 desliga, ⏭ próxima).

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | As telas (menu com os níveis e o jogo) e a janela de fim. Sem script inline (CSP). |
| `campo.js` | **O motor**, sem tela: níveis, plantar os ouriços longe do primeiro toque, números, enchente, bandeirinha, acorde, vitória e derrota. Testado no Node. |
| `app.js` | A tela: toques (tocar, segurar, botão direito, dois dedos), zoom, cronômetro, recordes, sons, fim, música e instalar. `APP_VERSION` fica aqui. |
| `estilo.css` | Visual (grama, terra, animações). Respeita "reduzir movimento". |
| `ourico.svg`, `flor.svg`, `icone.svg`, `icone-192.png`, `icone-512.png` | Desenhos originais. |
| `sw.js` | Guarda a pasta no aparelho (cache `campo-minado-v…`). Subir `VERSAO` a cada versão. |
| `manifest.webmanifest` | Para instalar como aplicativo. |
| `versoes.json` | O que cada versão trouxe (PT/EN). |
| `CREDITOS.md` | Músicas e fonte, com as licenças. |
| `teste/` | Testes: `node --test campo-minado/teste/*.test.js` (rodar da raiz do repositório kids). |

Peças comuns usadas com `../`: `recursos.js` (interruptor `campo-minado` do RootifyONE), `atualizar.js` (aviso de
versão nova), `telacheia.js`, `trilha.js` (música), `instalar.js` (só com `?instalar=1`) e a fonte da Rabiscolândia.

Guarda só no aparelho, em `localStorage` (`campo-minado.pref`): idioma, sons e o melhor tempo de cada nível.
Com `?teste` na barra de endereço os ouriços ficam sempre no mesmo lugar (semente fixa), para os testes.

## A cada versão

Subir `APP_VERSION` no `app.js`, `VERSAO` no `sw.js` e a entrada nova no topo do `versoes.json` (PT/EN, data e hora)
— o teste confere que os três são iguais. Arquivo novo entra no `ARQUIVOS` do `sw.js` (o teste também confere).
