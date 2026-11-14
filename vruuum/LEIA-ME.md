# Vruuum! — a corrida de carrinho da família

Quarta brincadeira da família **Bolinho de Chuva** (Feature Tester · SolverONE), junto com a Bagunçolândia, a
Peluqueria e a Dança na Sala. Corrida de carrinho em 3D, com curvas e morros: o carro **acelera sozinho**, a
criança vira para a esquerda e para a direita e aperta **⬆ PULAR** para passar por cima dos obstáculos.
Funciona com o celular **deitado ou em pé**, sem login, e **sem internet** depois de aberto uma vez.

Endereço: https://solverone.com.br/kids/vruuum/ · também pelos cartões em
`solverone.com.br/bolinho-de-chuva` e `solverone.com.br/kids` (TV).

## Como jogar

- Toque em **🔑 Toque para ligar o motor!** (o navegador só deixa tocar som depois de um toque).
- Escolha **1 ou 2 jogadores** (o jogo sempre abre com 1; com 2, a tela divide e a garagem tem "✕ Só 1 jogador"), o **nível**, a **cor do carro** e o **bichinho piloto**, e toque em **🏁 Correr!**.
- Depois do 3‑2‑1‑VAI!, a corrida dura uns 2 minutos e passa por **4 mundos** (2 fantásticos — Cânion do Deserto, Templo na Selva, Vulcão de Lava, Ilhas Flutuantes — e 2 entre Praia, Floresta,
  Terra dos Doces, Montanha de Neve e Cidade Neon), com um portal na entrada de cada um.
- ⭐ **Estrela** = 1 ponto · 🌈 **Arco-íris** = TURBO por 2,5 s · rampa amarela = **pulão** (no ar dá para pegar as
  estrelas altas e passar por cima de tudo).
- **⬆ PULAR**: um pulinho de 0,75 s que passa por cima de cone, lama e carrinho; o anel verde em volta do botão
  mostra quando dá para pular de novo (1,3 s).
- **Cone**, **lama** e **carrinhos** deixam o carro mais lento; bater num carrinho faz rodopiar e derruba
  estrelas. **Ninguém perde a corrida.**
- No fim: estrelas, tempo, medalha (🥇 com 40% das estrelas da pista, 🥈 com 20%, 🥉 para todo mundo) e o
  recorde do nível (fica só neste aparelho). Com 2 jogadores, quem pegou mais estrelas ganha o 🏆.
- ⏸ no canto pausa. Se sair do app, pausa sozinho.

| Nível | Como é |
|---|---|
| 🐢 Criança | devagar, curvas suaves, pouco obstáculo; sem mexer no volante o carro volta sozinho para a estrada; bater derruba no máximo 1 estrela e cone não derruba |
| 🚗 Normal | mais rápido, curvas que puxam para fora, mais cones e carrinhos |
| 🚀 Turbo | o mais rápido, curvas fortes, muito trânsito |

## Visual: 🌃 Neon ou 🌈 Colorido

- **Neon** (padrão, escolhido no menu em "Visual"): os mesmos mundos à noite, com céu estrelado e lua, asfalto escuro,
  bordas da estrada em neon (cada mundo com suas cores), faixas acesas e postes de neon piscando. A paisagem fica no
  escuro, só com as luzes. Os veículos têm faróis iluminando a estrada, luz neon por baixo na cor do carro, lanternas
  brilhando e rastro de luz quando estão rápidos; o trânsito tem lanternas acesas. Os itens ficam mais sóbrios: estrela de
  luz sem carinha, portal de turbo em setas de neon e mancha de óleo (no lugar da lama).
- Ainda no Neon: grade de neon no chão dos dois lados, pórticos de neon por cima da estrada a cada ~50 pedaços (no céu,
  aros de luz na rota) e postes altos com braço de luz.
- **Tela**: horizonte a ~30% da altura e base do veículo a 90% (`geom` em `desenho.js`), deitado ou em pé; em pé, a
  estrada se estica para cima (escala de altura `KY` separada da de largura `K`). Durante a corrida a tela fica **travada**
  na posição em que começou (`screen.orientation.lock`, no Android em tela cheia ou instalado); destrava no menu.
- **🔀 Misto** (padrão desde a 1.0): alterna dia (colorido) e noite (neon) a cada 260 pedaços da pista (~8 s), com o céu
  escurecendo e clareando aos poucos (`noiteEm` em `desenho.js`).
- **Colorido**: o visual de dia, com as cores e personagens de antes. Os faróis só acendem dentro dos túneis.
- **Túneis** (nos dois visuais): de 2 a 4 por corrida (`pista.js`, longe dos portais, da largada e da chegada). No chão,
  paredes com faixas de luz correndo e contorno de luz na entrada; lá dentro as paredes seguram o carro na pista. No céu,
  um tubo de anéis de luz em volta da rota.

## Garagem e veículos

- O veículo escolhido fica **sempre à vista**: em pé, preso no topo da tela enquanto as opções rolam; deitado, de um
  lado, com as opções do outro. O botão 🏁 Correr fica preso embaixo. Com 2 jogadores, abas Jogador 1 e Jogador 2.
- **24 veículos**, todos à mostra (desenhados em código no `veiculos.js`, vistos de trás, sem marca nem logotipo):

| Grupo | Veículos |
|---|---|
| 🚗 Carros | Clássico, Conversível Rosa, GT Redondo (traseira redonda), Superesportivo (largo, aerofólio), Kart, Monstrão, Furgão de Surfe (degradê, prancha no teto), Ônibus Escolar (luzes piscando, placa de PARE), Caminhão de Pelúcias (máquina de pegar bichinho, pelúcias balançando e a garra passeando) |
| 🏍️ Moto, skate e montarias | Dinossauro verde (o mesmo esqueleto 3D do cavalo, com espinhos roxos e rabo grosso), Cavalo (galopando, montado em 3D em `cavalo.js`: de costas na reta, de lado nas curvas; quem monta acompanha macio), Moto (deita nas curvas) e Skate (menino de costas, um pé no shape e o outro empurrando a rua; quanto mais rápido, mais rema; deslizando fica de lado, pé esquerdo na frente; os braços seguem a curva: o de dentro desce, o de fora sobe) |
| ✈️ No céu | Aviãozinho (hélice), Jato (fogo azul no turbo), Helicóptero (rotor girando), Trenó do Papai Noel (renas puxando, a do nariz vermelho na frente, e o Papai Noel junto), Arara Gigante (batendo as asas) |

- Cada um tem um jeito (barrinhas de velocidade e curvas), com diferenças pequenas, de no máximo uns 10%.
- **Quem voa** segue um caminho de luzes no céu, com a estrada lá embaixo. Os obstáculos mudam: pássaros (no lugar dos
  cones), nuvem de tempestade (lama), anel dourado (turbo), corrente de ar (rampa), balões e aviões (trânsito). As
  regras são as mesmas; só o desenho muda. Com 2 jogadores dá para misturar um carro e um avião.

## O piloto e a selfie

- **Conversível Rosa** (1.9.0): carro bem rosa de capota abaixada (lanternas de coração, laço no porta-malas), desenho
  próprio sem marca; a cor escolhida vira o friso. Carro de marca (Barbie) e personagens de desenho (Penélope Charmosa)
  têm dono e não podem entrar.
- **Versão da página** (1.9.0): `index.html` tem `<meta name="versao">`; se não bater com `APP_VERSION` (aparelho
  juntou arquivos de versões diferentes), o `app.js` recarrega uma vez.
- **Corpo** (desde a 1.8.0): 👧 Menina ou 👦 Menino na garagem; no skate a menina usa saia rodada e blusinha com coração.
  Escolher um personagem já ajusta o corpo (`corpoDe` em `personagens.js`); bichinhos ficam com a escolha da criança.
- **Guia dos controles**: no 3-2-1 e nos 4 primeiros segundos, setas e botão de pular piscam com a explicação; com 2
  jogadores, cada metade mostra "Jogador 1/2, esta metade da tela é sua".
- **Túneis** (desde a 1.7.0): corredor em 3D com paredes e teto contínuos, boca em arco num morro do mundo e luz de
  fora clareando as pontas. **Troca dia/noite** (Misto) e **troca de mundo** são graduais em tudo: cor do chão e da pista,
  zebra e fios de neon, grade do chão, postes, pórticos, enfeites, itens, nuvens, lanternas e faróis.
- O piloto fica **de costas**, olhando a estrada: nuca, orelhas e pelo de cada bichinho (no kart e na moto, o capacete
  com listra). A cada ~7 s ele **vira para trás, olha e sorri** por 2 s, e volta. Na garagem vira mais vezes.
  O giro é em **3D**: a cabeça continua redonda e gira como uma bola e olha **por cima do ombro** (uns 130°, rosto de
  três quartos, como uma pessoa de verdade), uma vez por cada lado; no kart e na moto o capacete inteiro gira e o rosto aparece pela viseira. No skate, o piloto é
  a cabeça do menino. Desenhado ao vivo por `cabeca.js`, por cima do veículo, recortado pela janela.
- **📸 Selfie**: na garagem, o botão 📸 abre a janela da selfie. Ali dá para **🤳 Tirar selfie** (câmera da frente) ou
  **🖼️ Escolher foto**. O rosto é achado **sem internet** pelo MediaPipe Face Detector, que roda no aparelho: o motor
  fica em `../baguncolandia/libs/mediapipe/` (~14 MB, baixado na primeira selfie e guardado) e o modelo de rosto em
  `rosto.tflite` (229 KB). Um círculo marca o rosto e dá para arrastar e mudar de tamanho. **✅ Usar este rosto**
  recorta 256×256 e guarda. De costas aparece um cabelo da cor tirada da foto, e de frente, o rosto.
- **Privacidade**: a foto **nunca sai do aparelho**. Fica no `localStorage` (`vruuum.foto.0` e `.1`, ~17 KB cada) e se
  apaga em 📸 → **🗑️ Apagar minha foto**. Sem o detector (aparelho antigo ou arquivo baixado), o círculo começa no
  meio e a pessoa ajusta à mão.

## Rivais e personagens

- **Rivais** (menu "Rivais", ligado por padrão): 3 personagens correm junto (2 com 2 jogadores), sorteados entre os que
  ninguém escolheu, no chão ou no céu como o jogador 1. Eles aceleram, desviam de cone, lama e carrinho (às vezes erram:
  aí ficam mais lentos) e empurram quando encostam. Ficam por perto (quem dispara segura, quem fica para trás acelera),
  para a corrida ser sempre disputada (`moverRival` em `motor.js`). O placar mostra a posição (🏁 2º / 4) e o fim mostra
  a classificação; 1º/2º/3º lugar ganham +800/+400/+200 pontos.
- **Personagens** (`personagens.js`), 24, todos desenhados aqui. Original do jogo (1.9.0): **Faísca, a Pilota**. De **domínio público**: Emília, Visconde, Saci, Cuca,
  Curupira, Iara, Chapeuzinho, Pinóquio, Alice, Robin Hood, Sherlock, Papai Noel e, desde a 1.6.0, Branca de Neve,
  Cinderela, Rapunzel, Pequena Sereia, Peter Pan, Aladim, Dorothy e Espantalho (contos e O Mágico de Oz; desenhos
  próprios, sem copiar filme nenhum). De **licença livre com crédito**: Tux (mascote do Linux, Larry Ewing), Big Buck
  Bunny (Blender Foundation, CC BY 3.0) e Pepper (Pepper&Carrot, David Revoy, CC BY 4.0). Podem ser escolhidos como piloto na
  garagem (fileira "Personagens de histórias") e ficam de costas, virando para sorrir, como os bichinhos.
- Personagens de empresas (Mario, Sonic, Disney, DreamWorks, filmes) **não podem entrar**: têm dono.

## Pontos e checkpoints

Ninguém perde a corrida, mas o placar sobe e desce (`PONTOS` em `motor.js`): estrela **+100**, estrela no ar **+200**,
turbo e rampa **+50**, cone **−50**, batida **−150** (nunca abaixo de zero). Cada portal de mundo é um **CHECKPOINT**:
**+500** e mais um bônus de tempo (quanto mais rápido no trecho, mais pontos). Na chegada, **+1.000** com o mesmo bônus,
e mais **+500** para quem chegar primeiro com 2 jogadores. O placar mostra estrelas e pontos; o fim mostra pontos,
estrelas, batidas e tempo, e o **recorde é de pontos** (por nível, só neste aparelho).

## 🙌 Mãos na câmera (volante no ar)

No menu, em "Como dirigir", escolha **🙌 Mãos na câmera**. Ao correr, a câmera da frente liga e uma janelinha no canto
mostra as mãos e o volante (`maos.js`, MediaPipe Hand Landmarker no próprio aparelho; o vídeo não sai dele):

- **duas mãos**, como num volante: a direita mais baixa vira para a direita, a esquerda mais baixa vira para a esquerda;
- **as duas subindo rápido**: pula; **as duas lá embaixo**: freia; **uma mão só**: vale a posição dela para os lados;
- **2 jogadores**: a metade esquerda da câmera é do jogador 1 e a direita do jogador 2;
- **na TV**: ligue o celular, tablet ou notebook na TV (espelhar a tela ou cabo), com a câmera virada para quem joga. A TV
  em si não tem câmera; num próximo passo dá para fazer como a Bagunçolândia (o celular filma e a TV mostra).

## Controles

| Onde | Como |
|---|---|
| Celular / tablet | segurar o **lado esquerdo ou direito** da tela para virar; **⬆ PULAR** é o botão redondo acima da seta da direita (ou deslizar o dedo para cima). Com 2 jogadores, cada um usa o **seu pedaço** da tela (lado a lado com o aparelho deitado, um em cima do outro em pé). A corrida abre em **tela cheia**, e placar e botões ficam longe do recorte da câmera e dos cantos. |
| Celular como volante (acelerômetro) | sempre ligado com 1 jogador no celular/tablet: **inclinar** para um lado vira o carro; um **toquinho do celular para cima** faz pular. Vale deitado ou em pé, segurando como volante ou mais deitado no colo. O meio é o **reto de verdade** (celular retinho = carro reto), com folga de uns 5° para a mão tremendo; até a 0.3.0 o meio era o jeito de segurar no 3‑2‑1, e isso fazia o carro puxar para um lado. Funciona junto com o toque. No iPhone, ele pede permissão ao tocar em Correr. Com 2 jogadores no mesmo aparelho fica desligado (o celular é de todo mundo). |
| Teclado | 1 jogador: setas ou A/D para virar, ⬆ / W / espaço para pular. 2 jogadores: jogador 1 = **A, D e W**, jogador 2 = **setas e ⬆**. H = buzina, para baixo / S = freio, Esc ou P = pausa. |
| Controle da TV | setas viram, **OK** pula, **Voltar** pausa. No menu, as setas andam entre os botões. |
| Controle de videogame | alavanca ou setas viram; A pula; X buzina; B freia; Start pausa. Dois controles = dois jogadores. |

## Música

A "rádio" do jogo (`som.js`) toca dois tipos de rock, sem parar:

- **Gravadas** (`musicas/*.mp3`, 36 músicas, ~67 MB): rock de verdade, com bateria, baixo e guitarra. Na 1.4.0
  entraram mais 10 animados: 4 da banda **Anthem of Rain** (instrumentais, CC BY 4.0), Way of the Samurai do
  HoliznaCC0 e 5 do Kevin MacLeod (RetroFuture Clean, Zap Beat, El Magicia, Gearhead, Bet You Can ver 2). 18 do
  **Kevin MacLeod** (incompetech.com), licença **CC BY 4.0**: Volatile Reaction, Heroic Age, Unholy Knight e, desde a
  1.3.0, Metalmania, Ready Aim Fire, Summon the Rawk, Noise Attack, RetroFuture Nasty, Hotrock, Neolith, Iron Bacon,
  Take the Lead, Exhilarate, Cool Hard Facts, Bet You Can, Pump, Breakdown e What You Want; 5 do **HoliznaCC0**
  (álbum "Rock Montage": Jams, Punk, Americana, Grunge, Classic), **CC0** (domínio público); e 3 do jogo de kart
  **SuperTuxKart**: Kart Grand Prix (Weirwood), Lava (Kalsan) e Las Dunas Champions (ALBatross), licença **CC BY-SA**
  (quem copiar mantém a mesma licença). O menu mostra a música tocando com autor e licença. Detalhes em
  `musicas/LICENCAS.md`.
- **Feitas pelo jogo** (`rock.js`, WebAudio): banda de rock pesado com guitarra base distorcida dobrada, guitarra
  solo com eco, baixo com drive, bateria completa e coro de "Ei!", em 3 músicas próprias: Trovão na Pista
  (138 bpm), Pedal no Fundo (152 bpm) e Motor de Fogo (168 bpm).

A rádio sorteia a ordem das gravadas a cada vez que o jogo abre e põe uma feita pelo jogo a cada 8 gravadas, sem parar (menu, corrida, pausa e fim); cada corrida começa a próxima. Só silenciam com o app escondido
ou no 🔊. Sem internet: as gravadas ficam guardadas no aparelho depois da primeira abertura, uma por vez, em segundo plano
(no 4G ou com economia de dados, só 6; as outras na primeira vez que tocam; cache próprio `vruuum-musicas-v1`, que
não baixa de novo a cada versão); se uma não estiver guardada, a rádio pula para a próxima.
No arquivo baixado (📲 Guardar no celular) tocam só as feitas pelo jogo, para o arquivo continuar pequeno.

## Instalar, baixar e jogar sem internet

- Depois da primeira abertura com internet, o jogo funciona **sem internet** no mesmo endereço (o `sw.js` guarda a
  pasta toda no aparelho).
- **📲 Guardar no celular** (um botão só, no menu): se o navegador deixa instalar, instala com ícone na tela do
  celular; se não deixa (ou a pessoa recusou), baixa o `vruuum.html` com o jogo inteiro dentro (uns 200 KB), que
  vai para **Downloads** e abre direto, sem internet e sem login. O botão some quando o jogo já está instalado ou
  aberto pelo arquivo. Quem monta o arquivo é o `baixar.js`, aqui no aparelho, sempre na versão atual.

## Mapa dos arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | as telas (entrada, menu, corrida, pausa, fim). CSP sem script inline. |
| `estilo.css` | visual, paleta Bolinho de Chuva, fonte Fredoka. |
| `pista.js` | **puro**: monta a estrada com semente (retas, curvas, morros, mundos), espalha estrelas, cones, lama, turbos, rampas, enfeites e o trânsito. Níveis em `NIVEIS`. |
| `motor.js` | **puro**: regras da corrida (volante, curva, acelerar, grama, coisas da pista, batidas, chegada) e lista de eventos para som e efeitos. |
| `veiculos.js` | a garagem: os 24 veículos
| `modelos3d.js` | veículos em 3D de verdade (caixas, rodas cilíndricas, bolas, vidro transparente e desenhos nas faces): furgão, ônibus escolar, caminhão de pelúcias, pipoca, sorvete, hambúrguer, galinha e o Ovo Corredor; giram de lado na curva e inclinam no morro | (desenho, nome, grupo, velocidade e curva), testada no Node. |
| `cavalo.js` | o cavalo galopando com quem monta, montado em 3D com peças simples (gira de lado nas curvas); galope testado no Node. |
| `sprites.js` | todos os desenhos, feitos em código uma vez num canvas escondido. |
| `desenho.js` | a estrada em 3D (pseudo-3D por pedaços), céu, fundo, enfeites, carros, efeitos, placar e tela dividida. |
| `musicas/` | as 36 músicas gravadas (MP3: CC BY 4.0, CC BY-SA e CC0) e `LICENCAS.md`. |
| `rock.js` | a banda de rock e as 3 músicas (partitura em `MUSICAS`), testadas no Node. |
| `som.js` | motor, buzina e efeitos sintetizados (WebAudio); liga e desliga a música do `rock.js`. |
| `app.js` | menu, controles, tela cheia, bordas seguras, laço da corrida, pausa, resultado, recorde, instalar e baixar. `APP_VERSION` aqui. |
| `personagens.js` | os 24 personagens (domínio público, licença livre e a Faísca, original) (frente e costas) e o sorteio dos rivais, testados no Node. |
| `maos.js` | volante no ar: lê as mãos pela câmera (MediaPipe) e vira direção, pulo e freio; contas testadas no Node. |
| `movimento.js` | **puro**: acelerômetro → direção do volante e pulo pelo toquinho (com calibração no 3‑2‑1), testado no Node. |
| `cabeca.js` | o piloto animado (de costas, vira em 3D como uma bola e sorri; bichinho, selfie ou personagem), testado no Node. |
| `selfie.js` | a selfie: acha o rosto sem internet (MediaPipe + `rosto.tflite`), recorta e guarda só no aparelho. |
| `baixar.js` | monta o `vruuum.html` de arquivo único (genérico: serve para outro jogo do Bolinho de Chuva; scripts com `data-fora-do-arquivo` ficam de fora). |
| `sw.js` | cache `vruuum-v…` para funcionar sem internet. `VERSAO` aqui. |
| `versoes.json` | novidades de cada versão (PT e EN). |
| `teste/` | testes no Node: `node --test vruuum/teste/*.test.js` (rodar da raiz do repositório). |

A cada versão: subir `APP_VERSION` (`app.js`), `VERSAO` (`sw.js`) e a entrada nova do `versoes.json` (os testes
avisam se diferirem). Arquivo novo entra na lista do `sw.js`. Interruptor do RootifyONE: `data-recurso="vruuum"`.

## Testar no computador

Na raiz do repositório: `python3 -m http.server 8000` e abra http://localhost:8000/vruuum/ no navegador.

## 1.11.0 — inspirado nos fliperamas (vídeos do dono)

- **Apresentação**: atrás do logo animado (SVG) roda uma corrida de demonstração com cortes de câmera; o primeiro toque liga a música.
- **Largada** com semáforo de 3 luzes e a frase "Pronto pra sentir a velocidade?" chegando aos pedaços.
- **Loopings** (`pista.js` monta, `motor.js` segura o volante e dá +300; `desenho.js` desenha a fita em 3D de verdade: de longe é um arco
  na estrada; dentro, a câmera gira junto e céu e chão trocam de lugar). A saída fica `LOOP_DESVIO` ao lado da entrada.
- **Derrapagem**: numa curva forte, segurando para dentro, rápido; faíscas azul → laranja → roxa e marcas de pneu; ao soltar, mini-turbo.
- **Caixas ❓** em bolhas: a roleta gira e o poder vale sozinho — 🛡️ bolha (protege de cone, lama e trânsito), 🚀 foguete, 🟢 gosma (vai até o rival da frente).
- **Mais rivais** (5 com 1 jogador, 3 com 2), mais perto e com turbos para passar; **placar de fliperama** (rostinhos na ordem da corrida, poder no alto, velocímetro de ponteiro).
- **Turbo** com linhas de velocidade e fogo no escapamento; **fogos de artifício**; estrelas brilhando; **pódio** no fim (estádio, torcida, holofotes, pontos subindo).
- **Muitos barulhos** novos (`som.js`, inclusive o chiado do pneu) e o **aparelho tremendo** onde o navegador deixa (`navigator.vibrate`; iPhone não deixa).

## 1.12.0 — sons de verdade, galinha, Drácula, lanches e blocos

- **Sons gravados** (`sons/`, ~780 KB, créditos no `CREDITOS.md`): motor de carro (o ronco sobe com a velocidade), pneu cantando,
  batidas, turbo, buzina, largada, aplausos, fogos e a voz de cada bicho. O som feito na hora só toca enquanto a gravação não carregou.
  Bicho e skate não têm ronco de motor (`semMotor`); a buzina deles é a voz (`voz`: galo, cavalo, dino, arara, morcego).
- **Galinha branca**: pula e bate as asas (desenhadas ao vivo) com cocoricó; cacareja enquanto corre.
- **Morcego**: voa; perto de obstáculo vira o **Conde Drácula** (fumaça e risada) e depois volta; joga **abóboras** no rival da frente.
- **Carrinho de pipoca**, **carrinho de sorvete** e **carro-hambúrguer**.
- Mundos **Cidade do Lanche** (toalha xadrez, hambúrgueres gigantes, batata, milkshake) e **Mundo dos Blocos** (cubos; nada do Minecraft);
  chocolate, pudim e taça de sorvete também na Terra dos Doces; **balões de emoji** aparecem de vez em quando em todo mundo.

## 1.13.0 — veículos em 3D, volta de 360°, cenários à escolha

- **3D de verdade** (`modelos3d.js`): furgão de surfe, ônibus escolar, caminhão de pelúcias, carrinhos de pipoca e de sorvete,
  carro-hambúrguer e galinha. Na curva aparece a lateral; no morro e no pulo o veículo inclina (descendo dá para ver o teto).
  Janelas de vidro transparente: o piloto aparece lá dentro. Os quadros parados (rivais e garagem) saem do mesmo modelo.
- **Ovo Corredor**: o Humpty Dumpty da cantiga inglesa (domínio público), correndo sem carro; ele mesmo é o piloto.
- **Volta de 360°** (`vistaOrbita` em `desenho.js`): no 3-2-1 e logo depois da chegada a câmera gira em volta de quem joga
  e termina na câmera do jogo. Quem é 3D gira de verdade; os outros dão uma meia-volta curta.
- **Cenários à escolha** no menu (até 4, na ordem do toque; 🎲 Surpresa = sorteio). **Rivais sem repetição**: nenhum corre
  com o mesmo veículo de quem joga, nem com o mesmo de outro rival.
- Abertura mais clara e com turbo de vez em quando (linhas de velocidade).


## 1.14.0 — menu com a corrida atrás e música à escolha

- A corrida de demonstração da abertura (`#demo`, agora fixa no `<body>`) continua rodando atrás do menu, com um véu um
  pouco mais escuro e os botões meio transparentes (`body.com-demo` / `body.demo-menu`, ligados em `tela()` no `app.js`).
  Na corrida e no fim ela para.
- Grupo 🎵 Música no menu: ⏮ e ⏭ trocam; tocar no nome abre a lista inteira (na ordem em que vai tocar). A escolhida
  continua na corrida seguinte; sem escolha, cada corrida começa uma música nova, como antes. `som.js` ganhou
  `listaMusicas()`, `escolherMusica(k)` e `musicaAtual()`. Sem internet a regra da música não muda: toca só a favorita
  guardada, e o menu avisa.

## 1.15.0 — carros antigos e trenó em 3D

- Clássico, GT, Superesportivo, Kart, Monstrão, Moto, Conversível e Trenó saíram do desenho de costas e viraram modelos
  em `modelos3d.js` (entram em `veiculos.js` por `em3d(...)`, como os da 1.13.0). Peça nova: `tronco()` — caixa com o
  topo menor e empurrado, para cabines com vidro inclinado; a luz de cada face sai da inclinação de verdade.
- Kart e moto continuam com capacete: em 3D a cabeça vem do modelo (`onde`) e o `cabeca.js` desenha o capacete nela.
- `piloto(..., vies)`: em carro baixo (GT, Super) o piloto é pintado por último, para a tampa de trás não tapar.
- Ainda de costas: avião, jato, helicóptero, arara e morcego (e skate, cavalo e dinossauro, que já giram do seu jeito).

## 1.16.0 — conversível esportivo e os que voam em 3D

- Peças novas no `modelos3d.js`: `casco()` (carroceria arredondada feita de fatias, com brilho de verniz), `chapa()`
  (peça fina dos dois lados: asa, cauda, capa; `verso` = cor do outro lado) e `disco()` (hélice e rotor girando).
- Conversível Rosa refeito com `casco()`: baixo, comprido e arredondado, sem marca.
- Avião, jato, helicóptero, arara, morcego e Drácula em 3D. A hélice, o rotor e o fogo do jato agora são do modelo
  (saíram `extrasAntes`/`extrasDepois` do `desenho.js`); `morcegoDracula()` troca os dois modelos 3D com a fumaça.
- Ainda do jeito antigo: o skate (o skatista em quadros); cavalo e dinossauro já giram pelo `cavalo.js`.

## 1.17.0 — rio (vira barco) e mapinha (vídeo do dono, 14/Nov/2026)

- `pista.js`: `rios` (1 no Criança, 2 no Normal e no Turbo), trechos de 110 a 160 pedaços com `seg.agua`, longe dos
  túneis, loopings, portais, largada e chegada. A regra das coisas não muda; só o desenho: cone vira boia, lama vira
  redemoinho, turbo vira setas azuis e o trânsito vira lancha (`NA_AGUA`/`sprAgua` no `desenho.js`).
- `motor.js`: eventos `agua` e `terra` ao entrar e sair do rio (som de água, vibração e "🌊 Virou barco!").
- Veículo 3D no rio: as rodas recolhem e entram duas boias (`boias()` no `modelos3d.js`); todo veículo ganha esteira
  de espuma, borrifos e balanço (`esteira`/`borrifos` no `desenho.js`). Rivais boiam com espuma por baixo.
- Mapinha redondo no canto de cima (`miniMapa`): a pista calculada das curvas, rios em azul, chegada e as bolinhas.
