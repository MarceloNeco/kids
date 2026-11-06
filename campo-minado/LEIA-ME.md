# Campo Minado — o jardim dos ouriços dorminhocos

Brincadeira da família **Bolinho de Chuva** (SolverONE). O campo minado clássico com cara de jardim: embaixo da
grama dormem uns ouriços 🦔 e a criança abre o jardim todo sem acordar nenhum. Sem login, e **sem internet** depois
de aberto uma vez. Em inglês o nome na tela é **Garden Sweeper**.

Endereço: https://solverone.com.br/kids/campo-minado/

## Como brincar

- Escolha o nível. No celular em pé o jardim fica em pé; na tela deitada (tablet, computador) ele deita junto.

| Nível | Jardim | Ouriços | Ouriço por casa | O primeiro toque garante livre | Quanto o 1º toque abre (média) |
|---|---|---|---|---|---|
| 🌱 Fácil | 8 × 8 | 10 | 16% | a casa tocada **e as oito em volta** (abre um pedacinho) | ~39% do jardim |
| 🌷 Médio | 10 × 14 | 25 | 18% | só a casa tocada (regra clássica) | ~5% (em ~78% das vezes, só um número) |
| 🌳 Difícil | 12 × 20 | 50 | 21% (como o Expert do computador) | só a casa tocada (regra clássica) | ~3% (em ~81% das vezes, só um número) |

  As médias saem do teste `campo.test.js` (600 jogos por nível, tocando num lugar qualquer).
- **Toque** numa grama para abrir. O **primeiro toque nunca acorda um ouriço**. Casa sem número abre as vizinhas sozinha.
- O **número** conta quantos ouriços dormem nas oito casinhas em volta.
- **🚩 Bandeirinha** onde tem ouriço: ligue o botão **🚩** (modo bandeirinha: cada toque põe ou tira), ou **segure o
  dedo** na grama, ou **botão direito** do mouse. No teclado: setas andam, Enter abre, **B** (ou F) marca.
- **Acorde**: tocar num número que já tem todas as bandeirinhas em volta abre as outras casinhas de uma vez.
- **💡 Dica (só no Fácil)**: se a criança fica uns 4 segundos sem jogar, as gramas que com certeza não têm ouriço
  piscam devagar. "Com certeza" = o que dá para tirar só dos números abertos, com as duas regras de um número só
  (número que já tem todos os ouriços achados em volta → as outras gramas dele são seguras; número com tantas gramas
  fechadas quanto ele vale → todas são ouriço), repetidas até não mudar mais (`CampoMinado.deduzir`). As bandeirinhas
  da criança não entram na conta (podem estar erradas). Se nada é certo, nada pisca. Qualquer toque apaga. Com
  "reduzir movimento" ligado, as gramas ficam acesas paradas, sem piscar.
- Em cima, numa linha só (no celular deitado, em pé à esquerda): **←** volta aos níveis, **🦔** quantos faltam
  marcar, **🙂** começa de novo, **⏱** o tempo, **🚩** o modo bandeirinha e **🔍** chega perto (outro toque volta a
  mostrar o jardim todo). Dois dedos também aproximam; arrastar anda pelo jardim.
- **O jardim inteiro cabe na tela ao começar**, em qualquer nível e tela (celular em pé e deitado, tablet Fire em pé
  e deitado, computador): o tamanho da casa sai da largura e da altura que sobram depois da barra, da dica e de uma
  faixa de 72 px embaixo guardada para o tocador de música (canto de baixo à direita). Durante o jogo, a abinha comum
  "Tela inteira" desce para o canto de baixo à esquerda, nessa mesma faixa, para não cobrir o jardim. No Difícil do
  celular em pé as casas ficam com ~26 a 31 px.
- Ganhou: nascem flores no jardim, caem pétalas, e aparece o tempo (🏆 se for o melhor do nível). Perdeu: o ouriço
  acorda e treme, e os outros aparecem. "Tentar de novo" ou "Escolher nível".
- No menu: **EN/PT** troca a língua, **🔊** liga/desliga os sons do jogo, **❓** mostra como brincar. A música é do
  tocador comum dos jogos, no canto de baixo (🔇 desliga, ⏭ próxima).

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | As telas (menu com os níveis e o jogo) e a janela de fim. Sem script inline (CSP). |
| `campo.js` | **O motor**, sem tela: níveis, plantar os ouriços longe do primeiro toque, números, enchente, bandeirinha, acorde, vitória e derrota, e a dedução da dica (`deduzir`). Testado no Node. |
| `app.js` | A tela: toques (tocar, segurar, botão direito, dois dedos), tamanho das casas (jardim todo na tela), zoom, dica do Fácil, cronômetro, recordes, sons, fim, música e instalar. `APP_VERSION` fica aqui. |
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
