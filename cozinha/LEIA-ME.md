# Mão na Massa (My Little Big Chef) — juntar os ingredientes e cozinhar uma receita

Brincadeira da família **Bolinho de Chuva** (SolverONE). **Ideia da filha do dono.** A criança escolhe uma receita,
sai pela vila para juntar os ingredientes (pescando, colhendo, puxando da horta, pegando ovos, tirando leite, comprando
no mercadinho ou pedindo emprestado para a vizinha) e depois cozinha em casa, passo a passo, com os utensílios
certos. No fim aparece a **receita da família**, com estrelas. Sem login, e **sem internet** depois de aberto uma vez.

Endereço: https://solverone.com.br/kids/cozinha/

Versão atual: **0.8.0** (14/Nov/2026) — **família à mesa**: na ficha, "Quem vai comer?" com 8 pessoas (`dados.FAMILIA`:
eu, mamãe, papai, vovó, vovô, irmão, irmã, bebê; "eu" sempre); a receita serve 2 e cada 2 pessoas a mais multiplicam as
quantidades e as moedas (`logica.fatorDe`, `ingredientesDoNivel(rec, nível, fator)`); o nível limita (Fácil 2, Médio 4,
Difícil 6; a pessoa nova entra no lugar da mais antiga); a escolha fica guardada (`pref.familia`); no fim cada pessoa
aparece à mesa com o prato de verdade, mastigando e levando o garfo à boca (`cenas.familia`). Na 0.7.0 — **vila 3D em que se anda** (`vila.js`): cada lugar é um bloquinho isométrico
com a sua construção e animações (cata-vento, peixe pulando, fumaça, galinha bicando, rabo da vaca), ruas entre os
blocos com carrinho e nuvens; o **cozinheirinho** começa na porta de casa e anda pelas ruas até o lugar tocado (com
movimento reduzido, entra direto). **Faixa da missão** (`#missao`) com o que buscar agora e onde, e uma seta em cima do
lugar (Fácil e Médio; no Difícil só "Falta: ..."). **Missão fluida**: pegou tudo de um lugar, ele volta e segue sozinho
para o próximo (natureza primeiro, depois mercadinho e vizinha) e, com a cesta cheia, vai para casa cozinhar (Fácil e
Médio; no Difícil só volta à vila). Nos testes, o seguir sozinho só liga com `?teste&seguir`. Na 0.6.1 — a **Dona Cida fala com voz de mulher gravada** (`voz/cida-*.mp3`, voz livre "Dora" do Kokoro, Apache 2.0), igual em todo aparelho e sem internet; o 👵🔁 alterna entre a gravada e as vozes do aparelho. Na 0.6.0 — **comida de verdade**: cada receita e cada ingrediente aparece com uma **foto
de verdade** (fotos livres da Wikimedia Commons, em `fotos/`, guardadas para sem internet; créditos em `CREDITOS.md`):
o pão de queijo é um pão de queijo e o queijo é um queijo. O menininho do final come a foto do prato, e a foto guardada
também. Receitas novas: **gelatina com frutas** (a filha do dono adora) e **churrasquinho no espeto** (na grelha do
fogão, com um adulto). Mais movimento: telas que entram deslizando, cartões e ingredientes que aparecem um depois do
outro com pulinho, prato que gira na ficha, comidas da capa pulando em onda e o botão de começar com um anel de luz.
As frutas no pé e os legumes na terra continuam desenhados (`icone(id, true)`). Esta é a **parte 1 de 3** do pedido do
dono de 14/Nov/2026 (pendências 24 a 27). Na 0.5.0 — **tudo animado e mais de verdade**: despejar inclina PARA o recipiente
e o jorro (leite, massa, suco, ovo) cai dentro enquanto ele enche; ingredientes caem na tigela (pedacinhos, nuvem de
farinha, pacote que derrama, ovo que quebra); lavar as mãos com torneira, água, espuma e duas mãos esfregando; no fim
um **menininho come o prato** (garfo e faquinha, mastiga, lambe os lábios, "Hmm!") e o botão **📷 Guardar a foto**
faz um PNG do prato; colheita, horta, leite, mexer, bater, fogo, forno e geladeira com animação; a bolinha 🎵 da
música nunca cobre nada; o celular deitado cabe em todas as telas; a **voz da Dona Cida** escolhe voz de mulher (e
o 👵🔁 troca). Na 0.4.0: nome novo, **Mão na Massa** (em inglês, **My Little Big Chef**; a pasta, o
endereço e o progresso guardado continuam `cozinha`), e por enquanto só em português (o inglês volta com o interruptor
`ingles` do RootifyONE). Na 0.3.0: cada fruta e cada legume na sua planta de verdade (o jogo também ensina de
onde vem cada coisa), pescaria com hora certa e músicas só com instrumentos de verdade. Continua sendo uma
**primeira proposta**: o dono quer entrevistar a filha para ajustar as receitas, os lugares e os passos (pendência 2).

## Como brincar

1. **Escolha o nível e a receita.** A ficha mostra os ingredientes, quanto precisa de cada um (ex.: 3 ovos,
   2 xícaras de farinha) e os lugares onde achar cada um.
2. **Vila** (🧺 a cesta embaixo mostra o que já tem e o que falta; no Fácil e no Médio os lugares úteis brilham ✨):
   - 🎣 **Rio** — 3 peixinhos nadam, cada um na sua velocidade (e mudam de velocidade de vez em quando); a vara, a
     linha, a boia e o anzol ficam desenhados, com o anzol parado dentro do círculo. O círculo diminui com o nível
     (Fácil bem largo e peixes devagar; Médio no meio; Difícil estreito e peixes rápidos, precisa acertar a hora).
     Puxou cedo ou tarde com um peixe perto: ele se assusta, foge rápido com um respinguinho e aparece **"Quase!"**
     (cedo: "espere o peixe entrar no círculo"; tarde: "o peixe já tinha passado"); a cesta não muda.
     Toque em *Puxar* (ou na água) quando um peixe passar dentro do círculo (no Fácil e no Médio o círculo
     fica amarelo e a boia belisca quando tem peixe perto): ele fica **preso no anzol**, a linha recolhe e ele sobe se
     mexendo, sai da água com um respingo, a vara balança até o balde e ele cai lá dentro (som feliz, e vai para a
     cesta). Os outros peixes continuam nadando e um peixe novo chega nadando pelo lado. Com *movimento reduzido* no
     aparelho, o peixe sobe reto, sem se mexer e sem respingo. Se a criança sair no meio, o peixe já fisgado vai para a cesta.
   - Tudo o que a criança pega **voa para a cesta num arco** e chega com um "pop" e faíscas no item da cesta.
   - 🌳 **Pomar** — cada fruta **só na sua planta de verdade**, com o nome da planta embaixo (PT e EN): maçã na
     macieira, laranja na laranjeira (com flor branca), limão no limoeiro, banana em pencas no cacho da **bananeira**
     (folhas largas e compridas, folha seca no tronco e o coração roxo na ponta do cacho), uva em cachos na **parreira**
     (armação de madeira) e morango na plantinha baixinha do chão, no canteiro com palha. Aparecem só as plantas do
     que a receita pede (e mais uma, se for uma só). Toque nas frutas maduras e coloridas (ela balança, solta do galho
     com um pulinho e voa para a cesta); as verdinhas balançam e pedem para esperar (vão amadurecendo).
   - 🌱 **Horta** — corte da terra: **cenoura e batata crescem embaixo da terra** (dá para vê-las de leve através da
     terra; em cima só as folhas) e saem tocando 3 vezes ou puxando o dedo para cima; **tomate** no tomateiro amarrado
     numa estaca (um toque colhe o tomate vermelho; os verdes continuam crescendo), **alface** (bola de folhas em cima
     da terra) e **cheiro-verde** (cebolinha e salsinha) saem com um toque. Cada pé tem o nome embaixo. Nasce de novo.
     A cada puxão pulam pedacinhos de terra.
   - 💡 **O jogo também ensina**: ao pegar qualquer coisa aparece de onde ela vem ("A banana nasce em cachos na
     bananeira!", "A cenoura cresce embaixo da terra…", "A farinha é feita de trigo moído no moinho!"); no Fácil a voz
     lê na primeira vez. O que é feito pelas pessoas (farinha, açúcar, sal, óleo, manteiga, chocolate, queijo, pão...)
     só existe no mercadinho (ou emprestado da vizinha), nunca numa planta.
   - 🐔 **Galinheiro** — toque na galinha para ela levantar; se tiver ovo, pegue. Ovo novo aparece depois de um tempo.
   - 🐄 **Fazendinha da Mimosa** — carinho na vaca e *segure* o botão para encher a xícara de leite (o leite cai em jorro
     enquanto segura).
   - 🏪 **Mercadinho do Seu Zé** — no Fácil é tudo de presente; no Médio e no Difícil a criança toca nas moedas
     (de 5, 2 e 1) para pôr no balcão, paga e vê o **troco**. Se as moedas não dão para algo que só o mercado vende,
     aparece *Ajudar o Seu Zé a arrumar* (+2 moedas) — ninguém fica preso.
   - 👵 **Dona Cida, a vizinha** (a vovozinha) — empresta ovo, leite, farinha, açúcar, sal, manteiga e mel, com
     **favores contados**. O ingrediente só vai para a cesta depois de tocar em **💛 Obrigado**. Ela **fala em voz
     alta** (voz do próprio aparelho, funciona sem internet) quando a criança chega, quando empresta, quando pede o
     obrigado, quando se despede e quando acabam os favores, e o balão mostra o que ela disse. Voz de vovó
     (v0.5.0; no Samsung do dono ela falava com voz de homem): escolhe primeiro uma voz **feminina** do português do
     Brasil — **desde a v0.6.1 isso só vale quando a família escolhe uma voz do aparelho no 👵🔁; o padrão em português é a voz gravada** (nomes conhecidos como Luciana, Francisca, Maria, Vitória, Fernanda, Thalita, Leila, Raquel, Camila,
     "feminina", "female", Google português do Brasil; no Android os códigos `pt-br-x-afs` e `pt-br-x-pte`), depois
     uma desconhecida e por último as **masculinas** (Daniel, Antônio, Ricardo, Felipe, "masculina", "male",
     `pt-br-x-ptd`, `pt-br-x-ptz`). Voz feminina: um pouco mais devagar (0,9) e mais fininha (1,2); voz masculina ou
     desconhecida: 0,88 e bem mais fininha (1,45). **👵🔁 Trocar a voz da vovó** (no menu, ao lado do 🗣️, e na casa
     dela) passa para a próxima voz do aparelho, fala uma frase de exemplo e guarda a escolha
     (`bolinho:cozinha:voz-vovo`). A lista de vozes é lida de novo quando o aparelho avisa (`voiceschanged`) e 300 ms
     depois. Os códigos do Android vêm de listas da comunidade, não de um documento oficial (conferir no S24).
     Segue o botão 🗣️ (voz desligada = só o balão) e a língua do jogo; a música abaixa enquanto ela fala.
   - 🏠 **Casa** — com tudo na cesta, vai para a cozinha. Se falta algo, diz o quê.
3. **Cozinha**: a ficha da receita mostra os passos; os utensílios ficam numa **bandeja presa embaixo da tela**
   (no celular em pé, 2 fileiras que arrastam para o lado se tiver mais), com o canto da direita livre para a bolinha 🎵; para cada passo, escolha o **utensílio** certo e faça o
   movimento: lavar e mexer fazendo **círculos com o dedo** (ou o botão), **deslizar o dedo** para cortar com a faca
   sem ponta, tocar nos ingredientes para pôr na tigela, **segurar** para bater no liquidificador/batedeira/espremedor,
   girar o botão do fogão, esperar dourar e virar, forno/geladeira/relógio com contagem, tocar na massa para modelar e
   servir. Faca, fogão, forno, liquidificador e batedeira mostram a dica: **na cozinha de verdade, só com um adulto**.
   Animações (cenas.js, só transform/atributos e requestAnimationFrame; com *reduzir movimento* fica tudo parado):
   - **despejar**: o utensílio levanta, inclina no sentido do recipiente (o bico fica em cima dele), o jorro cai com a
     cor do que tem dentro (massa grossa, suco fino), espirra na superfície e o recipiente de vidro enche;
   - **pôr**: o ingrediente voa até em cima do recipiente — pedacinhos caem, pó (farinha, açúcar, sal, fermento,
     polvilho) cai como chuvinha e faz nuvem, pacote de líquido (leite, óleo, mel, leite condensado) inclina para o
     recipiente e derrama, o ovo quebra e a gema cai, o granulado cai colorido — e o recipiente fica mais cheio, com a
     cor da mistura (o jogo lembra o que já está em cada utensílio);
   - **lavar as mãos**: torneira aberta, água correndo, as duas mãos esfregam junto com o círculo do dedo, a espuma
     aparece aos poucos e no fim a água leva a espuma, brilha e aparece "Mãos limpinhas! ✨" (lavar frutas e legumes:
     eles balançam embaixo da água);
   - mexer (colher em roda dentro do recipiente e redemoinho), bater (máquina treme e gira por dentro; o espremedor
     pinga), cortar (pedacinhos pulam e caem na tábua), fogão (chama tremulando, vapor e óleo chiando), forno (janela
     acesa brilhando e calor), geladeira (porta abre com fumacinha gelada), relógio (tique-taque), servir (vapor e brilho).
4. **Pronto!** Um **menininho** com chapéu de cozinheiro come o prato: pega um pedacinho com o garfo (a faquinha
   corta), leva à boca, mastiga de olhos felizes, lambe os lábios e diz "Hmm!", com vapor e brilhos no prato.
   **📷 Guardar a foto** desenha num canvas (1080 × 1350) o menininho com o prato, o nome da receita, as estrelas, a
   data e o nível, e guarda como PNG (`mao-na-massa-<receita>-<aaaa-mm-dd>.png`): no celular abre o *compartilhar*
   (galeria, WhatsApp); no computador baixa o arquivo. Sem internet também. Depois vem a festa, estrelas (3 sem erros; menos com muitos erros ou se ficou de noite no Difícil) e a
   **📜 Receita da família** com os ingredientes e o modo de fazer na ordem em que a criança fez.

## Níveis

| | 🌱 Fácil | 🌻 Médio | 🌳 Difícil |
|---|---|---|---|
| Ingredientes | poucos (até 3), juntados em no máximo 2 lugares | a receita inteira, com as quantidades | a receita inteira |
| Mercadinho | de graça | moedas com folga (+4) | moedas contadas (+1) |
| Favores da vizinha | 5 | 3 | 2 |
| Ajuda na cozinha | o utensílio certo sempre brilha e a voz lê o passo | metade dos passos brilha; os outros depois de 8 s ou de um erro | só brilha depois de 2 erros |
| Ordem | na ordem da ficha | na ordem da ficha | **fichas misturadas**: a criança escolhe o próximo passo, e só vale o que faz sentido (não dá para servir antes de assar) |
| Extra | — | 2 utensílios a mais na bancada | 4 a mais, passos a mais, um **imprevisto** (o cachorrinho Biscoito pega 1 ingrediente da cesta ao chegar em casa) e o **sol andando no céu** (7 min; passou, vira noite e a criança perde só 1 estrela) |

## Receitas (14)

Bolo de cenoura · Panqueca de banana · Salada de frutas · Vitamina de banana · Brigadeiro · Pizza caseira ·
Sanduíche natural · Peixe assado com legumes · Omelete · Suco de laranja · Pão de queijo · Cookies de chocolate ·
Gelatina com frutas · Churrasquinho no espeto (v0.6.0; a carne vem do mercadinho, que é o açougue da vila por enquanto).
Toda receita começa lavando as mãos e termina servindo.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | As telas (entrada, menu, ficha, vila, lugar, cozinha, pronto). CSP sem script inline. |
| `dados.js` | **Receitas** (ingredientes, quantidades, passos), lugares, **plantas** (onde cada fruta e legume nasce de verdade), ingredientes (com a frase que ensina de onde vem), utensílios e níveis (incluindo o círculo e a velocidade dos peixes). Receita nova = uma entrada em `RECEITAS` (o comentário no topo explica os campos). |
| `logica.js` | Regras sem tela: cesta, moedas e troco, favores, passos de cada nível e a ordem, imprevisto, estrelas, texto de cada passo em PT/EN. |
| `cenas.js` | Cenas animadas em SVG/canvas, sem imagem: recipientes que enchem, a cena de despejar (inclina para o recipiente, jorro, nível), a pia com as mãos e a espuma, o menininho comendo (e a animação dele), a foto em PNG e as partículas (faíscas, terra, pó, pedacinhos). Não conhece as regras do jogo. |
| `fotos/` | **Fotos de verdade** (v0.6.0): `fotos/<id>.jpg`, uma por receita e por ingrediente (320 × 320, JPG), da Wikimedia Commons com licença livre. `ART.icone(id)` mostra a foto do ingrediente num círculo; `ART.icone(id, true)` mostra o desenho/emoji (frutas no pé, legumes na terra). Foto nova = arquivo aqui + linha no `CREDITOS.md` + `sw.js` (o teste confere). |
| `vila.js` | A vila "3D" (v0.7.0): o bloquinho isométrico de cada lugar (`bloco(id)`), o cozinheirinho que anda (`boneco()`), o carrinho e a nuvem, tudo em SVG feito no código. Classes com `v-` para não confundir com as peças dos mini-jogos. |
| `desenhos.js` | Desenhos em SVG feitos em código (utensílios, ingredientes sem emoji, faca sem ponta, ícone do app, as plantas do pomar e da horta e o lugar das frutas em cada planta). |
| `app.js` | Telas, mini-jogos da vila, cozinha, receita pronta, progresso, voz, sons, música, service worker. `APP_VERSION`. |
| `estilo.css` | Visual (fonte Fredoka da Rabiscolândia). |
| `sw.js` | Modo sem internet (cache `cozinha-v<VERSAO>`). Arquivo novo entra em `ARQUIVOS`. |
| `manifest.webmanifest`, `icone-192.png`, `icone-512.png`, `icone.svg` | Instalar como app. Os PNG saem do `icone.svg` (o mesmo desenho de `desenhos.js`). |
| `versoes.json` | Novidades de cada versão (PT/EN). |
| `CREDITOS.md`, `PENDENCIAS.md` | Créditos e licenças; lista de pendências. |
| `teste/` | Testes (ver abaixo). `teste/navegador.js` são os ajudantes do navegador (não é teste). |

Peças comuns usadas com `../`: `recursos.js` (interruptor `cozinha` do RootifyONE, app `kids` (Bolinho de Chuva)),
`atualizar.js` (aviso de versão nova), `telacheia.js`, `trilha.js` (música no canto, com 13 músicas animadas com
instrumentos de verdade: 9 da pasta `../rabiscolandia/musicas/` e 4 de `../baguncolandia/musicas/`; nada de som de
videogame antigo nem música calma demais) e `instalar.js` (só com `?instalar=1`).

## O que fica guardado (só neste aparelho)

`localStorage`: `bolinho:cozinha:pref` (língua, voz, sons, nível), `bolinho:cozinha:voz-vovo` (o nome da voz
escolhida para a Dona Cida, em PT e EN) e `bolinho:cozinha:progresso` (estrelas de cada
receita em cada nível e quantas receitas já foram feitas). A trilha guarda `bolinho:cozinha:trilha-mudo`.
Nenhum dado pessoal, nenhum nome de criança.

## Testes

Da raiz do repositório kids: `node --test cozinha/teste/*.test.js` (Node + Playwright com o Chromium do ambiente;
leva cerca de 4 minutos).

- `dados.test.js` — cada fruta/legume na planta e no lugar certos (o mapa esperado está escrito no teste; nada de
  farinha em árvore), frase que ensina de onde vem em PT/EN, desenho de cada planta, círculo do peixe menor e peixes mais
  rápidos a cada nível; 10+ receitas, PT/EN, todo ingrediente se consegue em algum lugar em todo nível, Fácil em até 2
  lugares, moedas suficientes, passos válidos (lavar primeiro, servir por último, ordem certa, nada buscado à toa).
- `logica.test.js` — cesta, quantidades, moedas e troco, ajudar o Seu Zé, favores e obrigado, imprevisto, ordem dos
  passos, estrelas.
- `arquivos.test.js` — versão igual em `app.js`, `sw.js` e `versoes.json`; o `sw.js` guarda tudo; CSP; textos PT|EN;
  13 músicas que existem (Rabiscolândia e Bagunçolândia), com crédito e licença de origem, sem Spazzmatica nem som
  de videogame, nenhum mp3 copiado; pendência da entrevista; nenhum segredo.
- `pagina.test.js` — joga a vitamina de banana do Fácil inteira no **celular** e no **computador** e o bolo de cenoura
  do Fácil no **tablet** (juntando na vila de verdade), o mercadinho com troco e a vizinha no Médio, o imprevisto e as
  fichas no Difícil, e o inglês; a **pescaria** no celular (o peixe preso no anzol sobe quadro a quadro, os outros
  continuam no rio, a cesta passa a 1/1, chega peixe novo) e com movimento reduzido (sobe sem balançar); e a **voz da
  Dona Cida** (com uma voz de mentira no lugar da do navegador: fala ao chegar, ao emprestar, no tchau e sem favores,
  com velocidade 0,9, tom 1,2 e voz feminina em PT e em EN; com a voz desligada não fala) — sem erro no console.
- `pagina.test.js` (v0.3.0) — o **pomar** mostra cada fruta só na sua planta com o nome (a banana no cacho da
  bananeira, com o coração roxo) e a frase que ensina; a **horta** com cenoura que precisa ser puxada 3 vezes e tomate
  colhido com um toque; a **pescaria com hora certa** (`?teste&pescareal` usa o círculo de verdade e o teste para os
  peixes): no Difícil puxar cedo e tarde dá "Quase!", o peixe foge com respingo e a cesta não muda; na hora certa
  fisga; no Fácil o mesmo puxão que erra no Difícil fisga.
- `receitas.test.js` — cozinha **todas** as receitas no Médio e no Difícil até o fim.
- `cenas.test.js` (v0.5.0, com movimento: `?teste&devagar` usa os tempos de verdade das animações) — **despejar**: a
  fonte começa em pé à esquerda do recipiente e, ao tocar, gira no sentido horário (para o recipiente), o jorro aparece
  do bico até dentro dele e o nível sobe (liquidificador → tigela em pé; espremedor → copo deitado; com movimento
  reduzido já aparece inclinado e cheio); **pôr**: o pacote de farinha fica à esquerda da tigela e inclina para a
  direita, e a tigela enche; **lavar as mãos**: torneira, água correndo, duas mãos, espuma que aparece aos poucos e
  mãos que se mexem com o dedo, "Mãos limpinhas!"; **pronto**: o menininho anima (garfo, boca, língua, olhos, "Hmm!",
  vapor) e fica parado com movimento reduzido; **📷 foto**: no celular o compartilhar recebe um PNG 1080 × 1350 de
  verdade; no computador baixa o PNG; **bolinha 🎵** em 390 × 844, 412 × 915 e 915 × 412: nenhum botão, item da cesta
  ou utensílio inteiro na tela fica embaixo dela (na cozinha, em todas as posições da rolagem); **celular deitado**
  915 × 412 e 844 × 390: entrada, menu, ficha, vila, os 7 lugares, cozinha e pronto cabem, sem rolar para o lado, com
  os botões principais na tela (acima da cesta).
- `familia.test.js` (v0.8.0) — no Médio, chamar 3 pessoas dobra as quantidades e as moedas, o 5º entra no lugar do 1º, a escolha fica guardada, o passo da cozinha fala as quantidades da família e no fim os 3 comem com a foto do prato; no Fácil cabem 2 e, sozinho, ninguém aparece à mesa.
- `vila.test.js` (v0.7.0) — cada lugar com o seu bloquinho; ruas; o cozinheirinho começa na porta de casa; faixa da missão e seta (Médio), sem seta no Difícil; ele anda com movimento (sai do lugar, pernas mexendo, entra) e entra direto com movimento reduzido; missão fluida no Fácil (segue sozinho para o próximo lugar e para casa) e no Difícil só volta à vila.
- `voz.test.js` (v0.5.0) — vozes de mentira como no Android: escolhe `pt-br-x-afs` (feminina) e nunca
  `pt-br-x-ptd`/Daniel; só voz de homem → tom 1,45 e 0,88; voz desconhecida antes da masculina; 👵🔁 troca, fala o
  exemplo, guarda e continua depois de recarregar.

`?teste` no endereço deixa as esperas bem curtas e as frutas maduras (só para os testes).
