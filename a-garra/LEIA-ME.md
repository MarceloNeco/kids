# H-rraaa (pasta a-garra) — máquina de pegar bichinho em 3D

Brincadeira do Bolinho de Chuva (solverone.com.br/kids/a-garra/). Pedido do dono em 14/Nov/2026, com fotos de máquinas de
um fliperama como referência (e, na 0.3.0, imagens de um vídeo de filhotes de salsicha numa máquina). A 0.1.0 era em 2D e pegava sempre; o dono pediu (14/Nov/2026): **3D**, ver de cima com zoom,
controle ⬆⬇⬅➡ + botão de agarrar, **a garra não pega toda vez** (como as de verdade), mais fiel às fotos e **várias
máquinas**: hambúrgueres, bichinhos que mexem, insetos. Isso é a 0.2.0.

Idioma (0.4.0): português, inglês ou espanhol, o escolhido na estante (`../idioma.js`), sem botão de idioma no jogo. O
nome é **H-rraaa**, com o **H colorido** (arco-íris), igual nos três idiomas (desde a 0.4.1, pedido do dono: antes era A-GARRA · THE CLAW · LA GARRA), na tela, nos letreiros das máquinas, no adesivo do carrinho e no letreiro de LED;
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
  - **Festas do Ano** (0.5.0; dono, 19/Nov/2026, "muda de acordo com a época do ano"): a máquina se enfeita sozinha pela
    data (`festas.js`): **Natal** (1º/nov–6/jan), **Carnaval** (até a Quarta-feira de Cinzas), **Páscoa** (até uma semana
    depois do domingo de Páscoa, no mínimo 30/abr), **Festa Junina** (até 15/ago), **Dia das Crianças** (até 12/out) e
    **Dia das Bruxas** (13–31/out). Cada festa tem cor, parede, letreiro e 6 prêmios de pelúcia + 1 dourado; colunas de
    lâmpadas que trocam de cor (como no vídeo do dono) e três prêmios sentados em cima do letreiro. A coleção mostra os 42
    prêmios do ano. `?festa=pascoa` (etc.) na barra de endereço força uma festa, para testar.
  - **Gigantes** (0.5.1; dono, 19/Nov/2026, fotos da cabine de pelúcias gigantes): cabine maior (`Maquina.GIGANTE`: 8 × 6,5
    × 9, buraco de 2,7), poucas pelúcias enormes (ursão do coração, coelhona orelhuda, dinossauro, axolote, baleia, gatão,
    cachorrão; raro: ursão dourado), garra grande de **dois braços em arco**, céu com nuvens, letreiro de letras gordinhas
    e pelúcias sentadas em cima da cabine. As medidas de cada máquina ficam em `m.med` (maquina.js).
    Controle pequenininho no canto da frente à direita (0.5.4).
  - **Introdução das máquinas gigantes** (0.5.4; dono, 20/Nov/2026: "não dá a impressão que é gigante"): na Gigantes e no
    Boneco Gigante, a câmera começa de longe, na altura dos olhos de uma **menininha** de ~1,15 m (desenho próprio,
    `criarMenina` no cenario3d.js) de pé ao lado da cabine, nunca na frente do vidro. Ela acena, vira e aponta para cima;
    depois a câmera voa até a vista do jogo (4 s). O relógio espera; qualquer toque ou tecla pula. Nos testes só com `&intro`.
  - **Boneco Gigante** (0.5.2; dono, 19/Nov/2026, "aquele que só tem um boneco grande", foto da máquina da tesoura): cabine
    alta e preta com janela de neon verde de cantos redondos, **um boneco grande pendurado por um fio** e uma **tesoura**
    num trilho (`tesoura.js`, a regra; `montarTesoura` no cenario3d.js, o desenho). **Segurando** o botão (✂️ SEGURE,
    espaço no computador) a tesoura anda; **soltando**, corta ali. Em cima do fio, corta de vez quando chega a vez (a mesma
    regra da garra: fácil 2–3, médio 2–4, difícil 3–5, mais 15% de sorte); se não, corta só um fiapo e o fio afina. O fio
    balança (mais no difícil) e a folga para acertar diminui. Cortou: o alçapão abre, o boneco cai e aparece na portinha;
    vem outro boneco. Sem setas nessa máquina. Bonecos: ursa de vestido, coelha de macacão, leão jubudo, panda de gorro,
    sapo rei; raro: ursa dourada.
- **Controle**: ⬅ ➡ para os lados, ⬆ para o fundo, ⬇ para a frente (segurar), e **PEGAR**. Também dá para **tocar no
  prêmio** que você quer (a garra vai até ele). No computador: setas e espaço.
- **Sortido**: cada partida tem outra mistura (cada tipo pelo menos uma vez, o resto sorteado), outro total, outro formato de
  monte (um "pico" sorteado) e prêmios caídos de jeitos variados (de costas, de lado, de cabeça para baixo).
- **Som e tela** (0.4.3): o 🔊 do menu desliga tudo, música e efeitos (usa o botão do tocador comum, que guarda a
  escolha). Botão de tela cheia no menu e ao lado da câmera (a abinha da borda, peça comum, não respondia no celular do
  dono). Setas e PEGAR encolhem em tela estreita (até ~320 px); no jogo, o tocador aberto fica à direita do 🏠 Saída.
- **Câmera**: 🎥 troca entre de frente, de cima e bem de lado (as laterais são de vidro, para ver a profundidade da garra); 🔍 aproxima (perto, a câmera acompanha a garra); arrastar o dedo
  na máquina gira; dois dedos aproximam.
- **Regra da garra** (0.4.4, dono, 14/Nov/2026: "estava muito difícil, sem graça"): às vezes a garra fecha **fraca** e
  solta (logo ao subir, no tranco lá em cima ou no caminho). Depois de cada prêmio a máquina **sorteia em quantas
  tentativas** a garra vem **forte** de novo: fácil na 2ª ou 3ª, médio da 2ª à 4ª (mais ou menos 1 em 3), difícil da 3ª
  à 5ª; e ainda tem 15% de sorte em qualquer tentativa bem mirada. Mirar no meio continua importando. A contagem fica
  guardada no aparelho (`bolinho:a-garra:contador`). Antes da 0.4.4 era 1 em 4 / 7 / 10.
- **Nível**: fácil (12 fichas, prêmios grandes, anel de mira), médio (10 fichas, anel de mira), difícil (10 fichas, prêmios
  menores, sem anel). **1 minuto para mirar cada tentativa em todos os níveis** (0.4.6; antes da 0.4.2 eram 25 s e 15 s, e o
  fácil não tinha relógio). Nos **10 últimos segundos**, um número gordinho aparece pulando no canto de cima à direita
  (10, 9, 8… 0, vermelho do 3 para baixo, com tique-taque); acabou o tempo, a garra desce sozinha. Deitado, os botões da
  câmera ficam embaixo, à direita, para a contagem não encostar neles.

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

Interruptor no RootifyONE: app **Bolinho de Chuva** (`kids`) → **H-rraaa** (`a-garra`). A pasta, o endereço (`/kids/a-garra/`) e o que fica guardado no aparelho (`bolinho:a-garra:...`) continuam com o nome antigo, para ninguém perder a coleção nem o atalho instalado.
Com `?teste` aparece `window.GarraDebug`; `?semente=N` repete a mesma máquina.
