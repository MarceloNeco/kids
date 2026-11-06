# Batalha Naval — afundar a frota dos amigos

Brincadeira da família **Bolinho de Chuva** (SolverONE), em **solverone.com.br/kids/batalha-naval/**. Batalha naval
com visual, navios e sons próprios, para jogar com a família em **aparelhos diferentes** (celular, tablet, computador),
pela internet ou **pertinho, sem internet** (dois aparelhos no mesmo Wi-Fi), **contra o computador** ou **passando o aparelho**. Sem login, sem cadastro. O nome em inglês na tela é *Sea Battle*.

## Como jogar

1. **Arrumar a frota** (cada um no seu mar, sem ninguém ver): toque num navio embaixo e depois no mar; toque no navio do
   mar para **girar**; **arraste** para mudar de lugar; **🎲 Arrumar sozinho** sorteia tudo. **✅ Pronto!** só acende com
   todos os navios no mar. Navio não fica por cima de outro (encostar do lado pode).
2. **Atirar**: na sua vez (a faixa grande no alto fica **verde** e pisca: "🎯 Sua vez!"), toque num quadradinho do mar
   do adversário. Cada quadradinho tem nome: letra da coluna + número da linha (**E4**, **F2**…).
3. **Resposta**: 💦 **Água** (anel branco), 💥 **Acertou** (fogo), 🚢 **Afundou** (o navio inteiro aparece escuro com ✕).
   A vez passa para o próximo a cada tiro. Ganha quem sobrar com navio boiando.

Níveis (escolhidos por quem cria a partida): 🐟 **Fácil** 8×8 com 4 navios (4, 3, 2, 2) · 🐬 **Médio** 10×10 com 5 navios
(5, 4, 3, 3, 2) · 🦈 **Difícil** 12×12 com 7 navios (5, 4, 4, 3, 3, 2, 2). Contra o computador, o nível também é a
esperteza dele: no Fácil atira ao acaso; no Médio caça (depois de acertar, procura em volta e segue a linha); no Difícil
calcula onde é mais provável ter navio (em média ~95, ~53 e ~44 tiros para afundar tudo num mar 10×10).

## 👫 Com amigos (cada um no seu aparelho) — precisa de internet

1. Um toca em **👫 Jogar com amigos → ➕ Criar partida** e escolhe o nível. Aparece um **código de 4 letras** bem grande,
   o botão **📤 Mandar convite** (WhatsApp etc.) e **🔗 Copiar link** (`.../batalha-naval/?sala=CODIGO`).
2. Os outros abrem o link do convite **ou** entram em **👫 Jogar com amigos**, digitam o código e tocam **Entrar**.
3. Cada um toca **⚓ Arrumar minha frota** e **✅ Pronto!**. Quem criou toca **▶️ Começar a batalha!** (de 2 a 4 jogadores).
4. Com 3 ou 4, na sua vez aparecem botões **🎯 Nome** para escolher em quem atirar; quem tem a frota afundada sai
   (💀) e assiste; o último que boia ganha. No fim, quem criou pode tocar **🔁 Jogar de novo** na mesma sala.

A faixa de cima diz sempre de quem é a vez (verde = sua; colorida com a cor do jogador = vez de outro) e a fila embaixo
dela mostra a ordem (▶ = agora).

**Segredo de cada um:** a frota fica **só no aparelho do dono**. Quem atira manda só o tiro; o dono do mar responde
água/acerto/afundou. No fim, cada um mostra onde estava a frota que sobrou (clarinha no mar).

**Se algo acontecer no meio:**
- **Recarregou a página / fechou o navegador**: o endereço continua com `?sala=CODIGO` e a partida fica guardada no
  aparelho; ao abrir de novo, volta sozinho para a mesma partida (ou pelo botão **⚓ Voltar para a partida** no início).
- **Alguém caiu da conexão** (12 s sem notícia): aparece 📡 ao lado do nome; com 3 ou mais, a vez pula a pessoa e
  ninguém atira nela até voltar. Quem criou a sala ganha o botão **➡️ Continuar sem Fulano**.
- **Saiu pelo botão 🚪**: a vez pula a pessoa de vez; numa dupla, o outro ganha.
- **Quem criou a sala sumiu** (15 s): o próximo da lista passa a mandar, sozinho; se quem criou voltar, vira jogador.
  Quem criou e sai pelo botão passa o comando antes de sair.

## 📶 Jogar pertinho (sem internet) — 2 jogadores, cada um no seu aparelho

Para jogar sem internet nenhuma (no avião, na estrada): os dois aparelhos ficam no **mesmo Wi-Fi** e se falam direto,
sem servidor. A "apresentação" entre eles vai por **QR code**.

1. Um celular **Android** liga o **Roteador Wi-Fi** (Ponto de acesso / Hotspot) — no Galaxy S24 funciona mesmo em modo
   avião. O outro aparelho conecta nesse Wi-Fi (se ele perguntar "rede sem internet, manter conectado?", tocar em Sim).
   iPhone quase nunca liga o Roteador em modo avião: o Android é o roteador e o iPhone conecta nele.
2. Os dois abrem a Batalha Naval (precisa ter sido aberta com internet pelo menos uma vez, para ficar guardada) e tocam
   em **📶 Jogar pertinho (sem internet)**. A tela explica esses passos com desenhos.
3. Um toca **➕ Criar partida pertinho**, escolhe o nível e aparece um **QR code** grande. O outro toca **📷 Entrar
   pertinho** e aponta a câmera para ele; aparece o QR code de resposta. Quem criou toca **📷 Agora ler o código do outro
   celular** e lê esse. Pronto: os dois caem na sala, arrumam a frota e jogam como no jogo com amigos.
   Sem câmera: **Ver o código em texto** / **Colar o código em texto**.

- **Não ligou em ~20 s** depois da segunda leitura: o jogo explica o que costuma ser (não estão no mesmo Wi-Fi; Wi-Fi de
  avião/hotel/loja não deixa um aparelho ver o outro; código de uma tentativa anterior) e oferece **🔄 Tentar de novo**.
- **A ligação caiu no meio** (tela apagou, alguém saiu do Wi-Fi): os dois veem o aviso e **🔁 Ligar de novo** — quem criou
  mostra um código novo e o outro lê, e a partida **continua de onde parou**. Enquanto joga pertinho, a tela fica acesa.
- Recarregar a página no meio perde a partida pertinho (o canal direto não sobrevive à recarga).

Como funciona por dentro (`pertinho.js`): WebRTC com `iceServers: []` (só endereços da rede local) e um canal de dados
(RTCDataChannel). O QR leva só o essencial do SDP (ice-ufrag, ice-pwd, fingerprint, setup, mid e os endereços UDP),
em bytes, escrito num alfabeto de 43 letras do modo alfanumérico do QR: ~106 letras = QR versão 5 (37×37). O código
começa com `BN1O` (oferta) ou `BN1R` (resposta); `1` é a versão do formato (versão diferente = aviso amigável para
atualizar), e uma conferência no fim recusa código cortado ou mexido. A partida usa as **mesmas mensagens** do jogo pela
internet (`rede.js`: o transporte é trocável — Supabase, BroadcastChannel nos testes, ou o canal direto).
Para o QR: `qr.js` desenha com o qrcode-generator e lê com a câmera de trás (leitor do próprio Android quando existe,
senão jsQR), as duas bibliotecas em `libs/`, guardadas no aparelho pelo `sw.js`.

## Contra o computador e passar o aparelho — funcionam sem internet

- **🤖 Contra o computador**: você começa; o computador "mira" um pouquinho antes de atirar.
- **📱 Passar o aparelho**: dois no mesmo aparelho. Entre uma vez e outra aparece a tela **🙈 Passe o aparelho para…**,
  que cobre tudo; só quem vai jogar toca em **👀 Estou pronto**.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | As telas (início, nível, amigos, sala, arrumar, jogo, cortina). CSP sem script inline. |
| `estilo.css` | Visual (mar, navios de brinquedo, animações de água/explosão, celular em pé e tablet/computador deitado). |
| `logica.js` | Regras sem tela (roda no Node): níveis, coordenadas, posicionar, tiro, afundou, frota aleatória, a IA nos 3 jeitos. |
| `rede.js` | Jogo em rede sem tela: validação de toda mensagem, a partida (vez, diário de tiros, voltar, sair, anfitrião que some) e o canal, trocável: Supabase Realtime broadcast; `?teste` usa BroadcastChannel; o Jogar pertinho usa o canal direto. |
| `pertinho.js` | Jogar pertinho: os códigos curtos (SDP ↔ texto do QR, com versão e conferência) e a ligação WebRTC sem servidor. |
| `qr.js` | Desenhar o QR (`libs/qrcode.js`) e ler com a câmera (BarcodeDetector ou `libs/jsQR.js`), carregados só quando usa. |
| `libs/` | qrcode-generator 2.0.4 (MIT) e jsQR 1.4.0 (Apache-2.0), com as licenças ao lado. |
| `som.js` | Efeitos feitos na hora (Web Audio). |
| `app.js` | Telas, arrumar a frota (tocar/arrastar/girar), as partidas dos quatro modos (as telas do Jogar pertinho também) e a música (`../trilha.js`). `APP_VERSION`. |
| `sw.js`, `manifest.webmanifest`, `icone-192.png`, `icone-512.png`, `icone.svg` | Instalável e sem internet (cache `batalha-naval-v…`). Ícones gerados do `icone.svg` com o Playwright. |
| `versoes.json`, `PENDENCIAS.md`, `CREDITOS.md` | Versões (PT/EN), pendências e créditos. |
| `teste/` | `node --test batalha-naval/teste/*.test.js` (rodar da raiz do repositório kids). |

Peças compartilhadas usadas com `../`: `recursos.js` (interruptor `batalha-naval` do RootifyONE, no app "kids" (Bolinho de Chuva)
como os outros jogos), `atualizar.js`, `telacheia.js`, `trilha.js`, `instalar.js` (com `?instalar=1`),
`baguncolandia/libs/supabase.js`, `rabiscolandia/fontes/fredoka.woff2` e as músicas de `vruuum/musicas/`.

## O protocolo em rede (resumo; detalhe no topo do `rede.js`)

Canal `batalha-naval-<CÓDIGO>` (broadcast, sem banco). Quem criou é o **anfitrião**: guarda a lista de jogadores, de
quem é a vez e o **diário de tiros**, e manda o `estado` a cada mudança e a cada 3 s. Mensagens: `oi`, `pulso`, `pronto`,
`tiro {alvo, x, y, n}`, `resp {a, x, y, n, r, nv}`, `estado`, `tchau`, `frota` (no fim), `nao` (cheia / já começou).
O tiro é repetido a cada 1,5 s até virar diário; o dono do mar só responde com o diário em dia e calcula só por ele
(resposta repetida = mesma conta). Toda mensagem passa por `validar()`; nome de jogador vira texto puro (sem `<>`), até
16 letras, e a tela só usa `textContent`. Testado com 30% a 45% das mensagens perdidas, recargas e anfitrião caindo.

## Testes

`cd kids && node --test batalha-naval/teste/*.test.js`
- `logica.test.js`: níveis, coordenadas, posicionar, frota válida, água/acerto/afundou/fim, IA nunca repete casa e
  Difícil < Médio < Fácil em número de tiros.
- `rede.test.js`: validação (lixo, XSS no nome, números fora do mar…), partidas inteiras de 2, 3 e 4 aparelhos num canal
  falso com perdas, recarregar no meio, sair, anfitrião saindo e sumindo, sala cheia, jogar de novo.
- `navegador.test.js` (Chromium): sem erros no celular/tablet/computador, arrumar (tocar, girar, arrastar), partida inteira
  contra o computador, passar o aparelho, partidas inteiras com 2 e 3 abas (com recarga) e sair da sala.
- `pertinho.test.js` (Chromium): códigos de SDP de verdade vão e voltam (tamanho e versão do QR no relatório), versão
  errada e lixo recusados; o canal direto valida tudo; duas abas **sem internet** (página e bibliotecas pelo service
  worker) — o QR da tela é lido pelo jsQR e pela câmera falsa do Chromium mostrando o print —, ligam, jogam a partida
  inteira, a ligação cai e volta; e o aviso "não se acharam" com Tentar de novo. Detalhe: o "sem internet" do Chromium
  também trava o WebRTC (num celular de verdade não), então o teste o tira só nos segundos em que os dois se acham, com
  toda a internet bloqueada e conferindo que nada saiu do aparelho.
- `arquivos.test.js`: versão igual nos três lugares, tudo no `sw.js`, CSP, textos PT|EN, nenhum segredo.
