# Quem é? — especificação (14/Nov/2026)

Nome aprovado pelo dono em 14/Nov/2026: **Quem é?** (em inglês, escondido por enquanto: **Who Is It?**). A primeira
brincadeira se chama **Duelo de Caras** (EN: *Face Duel*).

Jogo novo da família **Bolinho de Chuva** (repositório `kids`), em **solverone.com.br/kids/quem-e/**. Aberto, sem login,
sem cadastro, sem banco próprio, sem anúncio. Segue o padrão dos outros jogos do repositório (`recursos.js`, `idioma.js`,
`navegacao.js`, `trilha.js`, `telacheia.js`, `atualizar.js`). Como nos outros jogos, o módulo comum `diretrizes.js`, o
AssistONE, o `Fundo` e o 💬 feedback ficam de fora (nenhum jogo do kids tem; entram só com a regra zero).

## 1. Por que existe

As filhas do dono adoram o jogo de adivinhação do site que ele mandou (pt.akinator.com): a pessoa pensa em alguém e o
jogo descobre com perguntas. O dono quer **uma versão da família**, que funcione o máximo possível **sem internet**,
para **criança e adulto**, com as duas massinhas das meninas como personagens: o **Melekento Blue** (espuma com
consistência de geleia azul) e a **Pink Honey** (melequinha rosa que se mexe). Durante a conversa ele percebeu que só a
adivinhação ficaria limitada (a lista de personagens vira o trabalho todo) e pediu para o mesmo jogo ter também um
**duelo de características**, no estilo dos jogos de tabuleiro de "adivinhar a cara" (peruca, cabelo, óculos, boné,
coroa, nariz de palhaço…), para jogar contra o computador, um contra o outro em celulares diferentes e na TV.

## 2. As duas brincadeiras e a ordem

| Brincadeira | O que é | Fase |
|---|---|---|
| 🎭 **Duelo de Caras** | Tabuleiro de personagens **desenhados pelo jogo**; cada um escolhe um em segredo e pergunta características até descobrir o do outro. | **Fase 1 — esta especificação** |
| 🔮 **A Meleca Adivinha** | A pessoa pensa em alguém (personagem, famoso, bicho, alguém da família) e a meleca adivinha com perguntas Sim / Não / Não sei / Provavelmente sim / Provavelmente não. Lista grande pronta + aprende quando erra + João Alves. | Fase 2 — resumida na seção 12; especificação própria antes de começar |

Ordem escolhida pelo dono (14/Nov/2026): **Duelo primeiro e, em seguida, a Meleca Adivinha** ("já sequencia"), porque reaproveita peças prontas (rede da Batalha Naval,
jeito de desenhar da Purpurina), funciona sem internet desde o começo e as meninas testam logo.

## 3. Metas, não-metas e anti-metas

**Metas (fase 1)**
- Partida inteira do Duelo **sem internet** contra a meleca e passando o aparelho.
- Duelo **cada um no seu celular** com código de 4 letras (pela internet) e **pertinho sem internet** (mesmo Wi-Fi), como
  a Batalha Naval.
- **Tabuleiro novo a cada partida**: personagens gerados pelo código, com combinações de características; nunca dois
  iguais no mesmo tabuleiro.
- **Quem responde Sim/Não é a pessoa**, e o jogo confere com a verdade: ninguém responde errado sem querer e ninguém trapaceia.
- 3 níveis (Fácil, Médio, Difícil), 10+ músicas, 🏠 e 🚪, PT agora e EN escondido.
- A meleca escolhida (Melekento Blue ou Pink Honey) é a anfitriã: aparece, reage, comemora e é a adversária no modo
  contra o computador.

**Não-metas (fase 1)**
- Personagens de **corpo inteiro** (sapato, saia, short, calça): o dono quer como próxima versão do Duelo (v0.2),
  com perguntas novas de roupa e sapato. O `caras.js` já nasce pensando nisso (mesmo personagem, desenho maior).
- A Meleca Adivinha (fase 2, logo em seguida; seção 12).
- Voz da ElevenLabs (fase 2; na fase 1 só a voz do aparelho, ligável, como na Cozinha e nos Enigmas).
- Modo de TV próprio com o celular de controle (fase 3). Na fase 1, TV = espelhar a tela do celular/tablet.
- Mais de 2 jogadores no Duelo (o formato clássico é 1 contra 1; rever depois de testar).
- Gente famosa no Duelo.

**Anti-metas (falha, mesmo funcionando)**
- Parecer o site de adivinhação: nada de gênio, turbante, lâmpada, fundo azul-lilás com losangos, logotipo dourado.
- Usar o nome "Cara a Cara" ou "Guess Who" (marcas de terceiros) ou copiar a arte desses tabuleiros.
- Desenhar ou mostrar foto de pessoa real (direito de imagem). As caras são inventadas, com primeiros nomes comuns.
- Precisar de internet para jogar sozinho ou passando o aparelho.
- Criança ficar presa: pergunta que ela não entende, tabuleiro pequeno demais no celular em pé, rodada sem saída.
- Melecas parecidas com o B.O.B. de "Monstros vs Alienígenas" (o dono citou como referência de "geleia azul", mas as
  melecas são as massinhas das filhas).

## 4. Onde mora

Pasta `quem-e/` (endereço curto `/kids/quem-e/`, serve para qualquer nome final). Arquivos (o construtor pode juntar ou
dividir, mantendo motor sem DOM testável no Node):

| Arquivo | O que faz |
|---|---|
| `index.html` | telas: início (escolher meleca), escolher modo e nível, sala (código), escolher o segredo, jogo, cortina, fim. Sem script inline (CSP). |
| `estilo.css` | visual (seção 9) |
| `app.js` | telas, toques, ligação entre motor, desenho, som, voz e rede; `APP_VERSION`; `BolinhoNav.iniciar` |
| `logica.js` | motor **puro**: gerar tabuleiro a partir de uma semente, características, perguntas, resposta automática, quem ainda serve, vez, palpite, fim; a meleca-computador (escolha de perguntas). Testado no Node. |
| `caras.js` | desenha um personagem (busto) em SVG a partir das características (seção 6) |
| `melecas.js` | desenha e anima as duas melecas em SVG (seção 8) |
| `rede.js`, `pertinho.js`, `qr.js` | jogo em dois aparelhos, adaptado da Batalha Naval (seção 7) |
| `som.js` | efeitos (virar carta, acertar, errar, vitória) |
| `sw.js`, `manifest.webmanifest`, `icone.svg`, `icone-192.png`, `icone-512.png` | instalar e funcionar sem internet |
| `versoes.json`, `LEIA-ME.md`, `PENDENCIAS.md`, `CREDITOS.md` | padrão do repositório |
| `teste/*.test.js` | testes (seção 11) |

Na raiz: entrada em `catalogo.js`, interruptor `quem-e` em `recursos-do-app.json`, `VERSAO` do `sw.js` da raiz,
`ARQUITETURA.md` e `PENDENCIAS.md` da raiz.

## 5. Como se joga o Duelo

1. **Início**: "Quem vai brincar com você?" — escolher **Melekento Blue** ou **Pink Honey** (lembrado no aparelho). Depois
   o modo: **🤖 Contra a meleca**, **📱 Cada um no seu celular**, **🔁 Passando o aparelho**. Depois o nível.
2. **Escolher o segredo**: o tabuleiro aparece; cada jogador toca no personagem que será o seu segredo (ou 🎲 sorteia).
   No "passando o aparelho", cortina entre um e outro ("Passe para a outra pessoa sem olhar").
**A vez (pedido do dono, 14/Nov/2026):** na sua vez você faz **uma coisa só**: **perguntar** ou **dar o palpite**.

3. **Perguntar**: escolher uma **pergunta** numa lista de botões grandes, agrupada, cada uma com **ícone + texto curto +
   🔊** (seção 6), por exemplo "Tem cabelo comprido?", "Usa óculos?", "Tem algo na cabeça?", "É criança?". Jogando
   juntos na mesma sala, a pessoa também pode só falar a pergunta em voz alta; o botão serve para registrar e para o jogo
   em rede.
4. **Quem responde é a outra pessoa**: no aparelho dela aparece a pergunta e dois botões grandes **👍 Sim** e **👎 Não**.
   O jogo **confere** com a verdade do segredo dela: resposta errada não passa, e aparece com carinho "Olha de novo: o
   seu personagem tem cabelo comprido?" com a cara dela ampliada (criança não estraga a partida sem querer). Contra a
   meleca, a meleca responde sozinha (sempre certo). Passando o aparelho: cortina "Passe para Fulano responder".
5. **Descartar**: com a resposta na tela, aparece **um botão só, já pronto**: "🗑️ Descartar todos **de** cabelo
   comprido" (resposta Não) ou "🗑️ Descartar todos **sem** cabelo comprido" (resposta Sim). Um toque e essas caras viram
   para baixo de uma vez. Se nenhuma cara de pé seria descartada, o botão diz "Nenhuma para descartar". Também dá para
   virar e desvirar **uma por uma** com o dedo (é o jogo).
   - Depois, **"✅ Pronto, passar a vez"** encerra a vez. Contra a meleca e em rede, a vez do outro só começa aí.
     Passando o aparelho, a **cortina** aparece a cada troca de vez.
6. **Palpite** (no lugar da pergunta): **"É este!"** + tocar numa cara + confirmar. Acertou: vitória, confete, a meleca
   comemora, as duas caras secretas aparecem. Errou: a carta vira, a meleca faz cara de "ops" e a vez passa (nos três
   níveis, para criança não perder de uma vez).
7. **Lupa**: tocar e segurar (ou o botão 🔍 da carta) abre a cara **grande**, com nome e todos os detalhes (brinco,
   estampa e cor da roupa, óculos), para conferir antes de perguntar ou descartar. Fecha com ✕, toque fora, Esc ou
   Voltar (`janela.js`).
8. **Fim**: "Jogar de novo" (tabuleiro novo, mesmo modo) e 🏠.

**Quem joga**: as filhas têm ~8 e ~10 anos e já leem (anotações da Rabiscolândia e da Purpurina). Mesmo assim, cada
pergunta tem ícone e 🔊, e no Fácil a voz começa **ligada** (dá para desligar), para irmão menor ou amigo que ainda não
lê conseguir brincar com ajuda.

**Contra a meleca**: a meleca também tem um segredo e também pergunta, na vez dela, mostrando a pergunta em balão; a
criança responde Sim/Não (conferido, como na seção 5). Esperteza por nível: Fácil = perguntas ao acaso entre as que ainda
dividem o tabuleiro, às vezes chuta cedo; Médio = boa pergunta na maioria das vezes; Difícil = sempre a pergunta que
divide o que sobrou mais perto da metade.

**Níveis**

| Nível | Caras | Perguntas em jogo |
|---|---|---|
| 🐣 Fácil | 12 | **gerais e fáceis de ver**: É criança? · É adulto? · É vovô ou vovó? · É menino/homem? · É menina/mulher? · Tem cabelo preto / castanho / loiro / ruivo / branco? · Usa óculos? · Tem algo na cabeça? |
| 🐥 Médio | 24 | tudo do Fácil + Cabelo comprido? · Cabelo curto? · É careca? · Está de peruca colorida? · Tem barba? · Tem bigode? · Usa brinco? · Usa colar? · Está de nariz de palhaço? · A roupa é vermelha / azul / verde / amarela / roxa / laranja? |
| 🦉 Difícil | 36 | tudo do Médio + **o tipo** do que está na cabeça (boné, chapéu, coroa, laço, tiara) · **o tipo** de óculos (de grau, escuros, coloridos) · Olhos azuis / verdes / castanhos? · Tem sardas? |

O que fica de fora de um nível **não varia** nas caras daquele nível (ex.: no Fácil ninguém usa peruca, brinco ou nariz
de palhaço, e "algo na cabeça" pode ser qualquer tipo, porque só se pergunta se tem ou não).

O tabuleiro deve caber sem rolar no celular em pé e deitado (do Fácil ao Difícil); se 36 não couber legível num
celular de 360 px em pé, o construtor reduz para o maior número que caiba (mínimo 30) e anota.

## 6. Os personagens desenhados

**Capricho (pedido do dono, 14/Nov/2026)**: o desenho é **bem detalhado e colorido**, nada simples estilo Atari: cabelo
com mechas e brilho, sombras e luz no rosto, olhos com íris e brilho, roupa com gola, botões, costura e estampa
(listras, bolinhas, xadrez, estrelas), acessórios com reflexo, fundo da carta com degradê. Não precisa ser realista, mas
tem que ser bonito de olhar ampliado na lupa. Desenho em SVG feito no código.

**Decisão do construtor-arquiteto (Claude), com motivo**: um desenhista novo e leve, `caras.js`, só de **busto** (cabeça,
ombros, roupa), em vez de usar o `purpurina/boneca.js` diretamente. Motivo: o `boneca.js` desenha corpo inteiro de
criança (400×720, ~1.800 linhas, glitter animado) e não tem adultos, idosos, barba, bigode, boné nem nariz de palhaço;
36 cartas pequenas precisam de SVG leve. O `caras.js` **copia o jeito** da Purpurina (ajudantes de desenho, paletas de
pele e cabelo, brilhos) para ficar com a mesma família visual.

**Características** (cada uma com valores; o gerador sorteia combinações e garante que todas as caras do tabuleiro sejam
diferentes **considerando só as características do nível**):

| Grupo | Característica | Valores |
|---|---|---|
| Quem | tipo | menino, menina, homem, mulher, vovô, vovó |
| Pele | tom | 6 tons (paleta da Purpurina) |
| Cabelo | cor | preto, castanho, loiro, ruivo, branco (a peruca colorida é a linha de baixo, a partir do Médio) |
| Cabelo | comprimento | careca, curto, médio, comprido |
| Cabelo | peruca | sim (cores fortes: azul, rosa, verde, arco-íris) / não |
| Rosto | olhos | castanhos, azuis, verdes |
| Rosto | óculos | nenhum, de grau, escuros, coloridos |
| Rosto | barba / bigode | nenhum, bigode, barba (só adultos e idosos) |
| Rosto | sardas | sim / não |
| Rosto | nariz de palhaço | sim / não |
| Cabeça | algo na cabeça | nada, boné, chapéu, coroa, laço, tiara (no Fácil só se pergunta "tem ou não") |
| Joias | brinco | sim / não |
| Joias | colar | sim / não |
| Roupa | cor | vermelho, azul, verde, amarelo, roxo, laranja |
| Roupa | estampa (só desenho, sem pergunta na v0.1) | lisa, listras, bolinhas, xadrez, estrelas |

Regras do gerador (decisões do Claude, para o gerador nunca travar):
- combinações sem sentido não saem (barba em criança, peruca em careca, cabelo branco só em vovô/vovó ou peruca);
- a regra vale **por pergunta**: cada pergunta do nível tem "Sim" em **pelo menos 2 caras e no máximo ~2/3** do
  tabuleiro. Valor que não cabe numa partida pode **ficar de fora dela** (ex.: num tabuleiro de 12, só 4 das 5 cores de
  cabelo aparecem); a pergunta de um valor ausente não aparece naquela partida;
- o gerador tenta várias sementes internas até cumprir as regras e, se não conseguir em um número fixo de tentativas,
  afrouxa o mínimo para 1 (nunca falha); o resultado depende só da semente (mesmo tabuleiro nos dois aparelhos);
- todas as caras do tabuleiro diferem em pelo menos uma pergunta do nível (ninguém fica impossível de descobrir).

**Nomes** (pedido do dono): cada cara ganha um **primeiro nome sorteado**, combinando com o tipo, de uma lista própria
bem sortida (pelo menos 80 de menino/homem e 80 de menina/mulher: comuns, antigos de vovô e vovó, modernos, curtos e
longos; sem sobrenome; sem nome de famoso). Nunca dois nomes iguais no tabuleiro. **Equilíbrio**: metade das caras de
menino/homem/vovô e metade de menina/mulher/vovó (diferença de no máximo 1). Serve para a criança dizer "é a Lia!".

**Perguntas**: geradas das características do nível, com texto PT/EN e ícone, agrupadas: 👤 Quem é · 💇 Cabelo · 👀 Rosto
· 🎩 Cabeça · 💎 Joias · 👕 Roupa. Exemplos: "É criança?", "É uma vovó?", "Tem cabelo ruivo?", "É careca?", "Usa óculos
escuros?", "Tem bigode?", "Está de nariz de palhaço?", "Está de coroa?", "Usa brinco?", "A roupa é azul?". Pergunta já
feita fica marcada. Pergunta que não divide mais nada (todas as caras de pé responderiam igual) fica apagadinha, com a
dica "essa não ajuda mais" (no Fácil some; nos outros aparece, para ensinar).

## 7. Cada um no seu celular

Reaproveitar a rede da **Batalha Naval** (`batalha-naval/rede.js`, `pertinho.js`, `qr.js`), adaptando o protocolo:
- Canal Supabase Realtime broadcast `quem-e-<código>` (mesma URL e chave publishable da Batalha Naval e da Rabiscolândia,
  públicas por desenho; `supabase-js` de `../baguncolandia/libs/supabase.js`, carregado só ao jogar em rede);
  `?teste` = BroadcastChannel; **📶 Jogar pertinho** = canal direto (QR), sem internet.
- Quem cria a partida escolhe o nível e manda a **semente** do tabuleiro; os dois montam o mesmo tabuleiro.
- **O segredo fica só no aparelho do dono.** Quem pergunta manda só o id da pergunta; no aparelho do dono a pessoa toca
  Sim/Não (conferido pelo jogo, seção 5) e o aparelho manda a resposta. Palpite: manda o id da cara; o dono responde acertou/errou. No fim, cada um mostra o seu.
- Toda mensagem passa por validação; tela só com `textContent` do que vem de fora; recarregar a página volta para a
  partida (como na Batalha Naval); o outro sumiu → aviso e "Esperar" / "Sair".
- 2 jogadores por sala (3º aparelho recebe "sala cheia").

## 8. As melecas

- **Melekento Blue**: geleia/espuma azul, translúcida, com bolhinhas dentro, balança como gelatina. **Pink Honey**:
  meleca rosa brilhante, escorrega e estica, com fio de "mel". Olhos e boca grandes e expressivos.
- Desenhadas em SVG no código e animadas com CSS (respirar/balançar parado; pular de alegria; "ops"; pensar; falar).
  Respeita `prefers-reduced-motion`.
- **A foto das massinhas reais** (o dono vai mandar) ajusta cor, textura e formato. Até lá, o construtor desenha a
  partir da descrição acima e anota em `PENDENCIAS.md` "ajustar as melecas pela foto".
- Onde aparecem: início (as duas, escolher), canto da tela do jogo (a escolhida, dizendo "Sim!"/"Não!", "Sua vez!",
  reagindo), fim (comemora ou chora de brincadeira). Contra a meleca, ela é a adversária.

## 9. Visual

Identidade própria, nada do site de adivinhação nem dos tabuleiros de marca: mundo **gosmento e brilhante**, cores das
duas melecas (azul geleia e rosa mel) sobre fundo claro e quente, cartas com cantos bem redondos e borda grossa, viradas
com giro 3D curto, gotinhas e respingos como enfeite. Letras grandes e arredondadas (fonte hospedada no repositório ou
fonte do sistema; nada de CDN). O construtor usa a skill **frontend-design** para definir tipografia, cores e
movimento, e a skill **humanizer-pt** para revisar todos os textos da tela (curtos, de criança, sem cara de robô).
Alvos de toque ≥ 44 px; contraste AA; em pé e deitado.

## 10. Som, música e voz

- **Música**: `trilha.js` com pelo menos **10 músicas gravadas com instrumentos de verdade** já existentes no repositório
  (pastas `musicas/` de outros jogos, apontadas com `../`), sem chiptune; favorita do jogo em `FAVORITAS` do `trilha.js`
  (animada, ≤ 2,5 MB); seguir a regra da música do `CLAUDE.md` e o vigia `teste/regra-musica.test.js`.
- **Efeitos** (`som.js`): virar carta, "sim", "não", palpite certo, errado, vitória; feitos no código (Web Audio) ou
  arquivos de licença livre registrados no `CREDITOS.md`.
- **Voz do aparelho** (ligar/desligar, lembrado), igual à Cozinha/Enigmas: a meleca lê a pergunta e diz "Sim!"/"Não!".
  Sem voz disponível, segue só com texto.

## 11. Testes e entrega

- `node --test quem-e/teste/*.test.js` e `node --test teste/*.test.js` (vigias da raiz: estante, idioma, navegação,
  música) passando.
- Motor: tabuleiros de várias sementes sem caras iguais; regra de 2..metade por característica; respostas automáticas
  certas; a meleca-computador no Difícil vence em média com menos perguntas que no Fácil; partida inteira simulada nos
  três níveis e nos três modos (rede com BroadcastChannel/duas abas, incluindo recarregar no meio).
- Página: carrega sem erro, 🏠 e 🚪, `idioma.js`, versão igual em `app.js`/`sw.js`/`versoes.json`, todos os arquivos no
  `ARQUIVOS` do `sw.js`, funciona sem internet depois da primeira visita.
- Prints em tamanho de celular (em pé e deitado) e tablet no resumo da entrega.
- Publicar: PR + merge sem perguntar (autorizado no `CLAUDE.md`), zip `QUEM-E v0.1.0 <data> <hora>.zip`, e no resumo o
  que o RootifyONE precisa saber (interruptor novo `quem-e`).

## 12. Fase 2 — A Meleca Adivinha (em seguida ao Duelo, pedido do dono)

**Como se joga.** Na tela inicial do Quem é?, a segunda brincadeira: **🔮 A Meleca Adivinha**. Escolher o nível (🧒
Infantil · 👨‍👩‍👧 Família · 🧑 Adulto; o dono pediu infantil e adulto, o Família no meio atende à regra dos 3 níveis).
"Pense em alguém: de desenho, de filme, famoso, um bicho ou alguém da sua casa." A meleca escolhida pergunta uma coisa
por vez; respostas em 5 botões grandes: **Sim · Provavelmente sim · Não sei · Provavelmente não · Não**, mais
"↩️ Voltar uma pergunta". Quando tiver certeza, ela chuta: "Você pensou em… **Lady Gaga**?" (com emoji ou desenho da
meleca fantasiada, **nunca foto**). Acertou: festa. Errou: ela continua perguntando; até 3 chutes (perto das perguntas
20, 30 e 40). Se perder: "Você me venceu! Em quem você pensou?" (ver Aprender).

**O motor (decisão do Claude).** Arquivo puro `adivinha.js`, testado no Node:
- Cada personagem guarda a resposta "certa" de cada pergunta que se aplica (sim, provavelmente sim, não sei/depende,
  provavelmente não, não); pergunta sem resposta guardada = "não sei".
- A cada resposta, a chance de cada personagem é multiplicada por quanto a resposta combina com a dele, **sempre com
  uma sobra** (resposta errada da criança derruba, mas não elimina), e normalizada.
- A próxima pergunta é a que mais divide os candidatos mais prováveis (ganho de informação), entre as perguntas do
  nível; nunca repete; evita perguntas muito parecidas seguidas.
- Chuta quando o primeiro tem chance alta e bem à frente do segundo, ou ao chegar no limite de perguntas.
- Funciona inteiro sem internet; rápido em celular simples (milhares de personagens × centenas de perguntas).

**A lista pronta (`personagens/*.js`, por assunto).** Meta da v0.1: **pelo menos 600 personagens** com respostas
conferidas, crescendo em versões seguintes. Prioridade do que a família conhece: músicas e cantores infantis, Xuxa,
Michael Jackson, Dua Lipa, Katy Perry, Lady Gaga; Sing, Disney, Pixar, DreamWorks (principais e secundários famosos);
De Volta para o Futuro, Uma Noite de Aventuras, Os Goonies, E.T.; Forrest Gump, O Exterminador do Futuro, O Vingador do
Futuro, Velocidade Máxima, Avenida Brasil, O Auto da Compadecida, John Wick; depois famosos do Brasil e do mundo
(atletas, apresentadores, youtubers, personagens de novela e de série), personagens históricos, super-heróis, bichos e
algumas coisas. Sem divisão Brasil × mundo. Cada personagem diz em que níveis aparece (Infantil, Família, Adulto).
Nenhum conteúdo impróprio na lista. **Perguntas**: de 150 a 250, cada uma com o nível mínimo (no Infantil só as
concretas: "É um bicho?", "Ele canta?", "É azul?"; no Adulto também "Ganhou um Oscar?", "Já morreu?", "Ficou famoso
antes do ano 2000?"). Testes conferem contradições (ex.: "é um bicho" e "é uma pessoa de verdade" juntos) e que todo
personagem é alcançável (o motor acerta cada um respondendo as respostas dele).

**João Alves, a lenda da casa.** Já vem na lista, nos três níveis, com as respostas tiradas do que o dono contou
(taxista humilde, achou uma mala de dinheiro no carro, rodou o mundo numa missão, pai do Forrest Gump, inventado pelo
pai, aparece em muitas histórias). Quando a meleca acerta, **festa especial** (diferente da normal) e a pergunta
"Qual João foi hoje? João Wick Alves · João Grilo Alves · João Connor Alves · o Taxista". A lista de respostas dele vai
num arquivo próprio (`joao-alves.js`) e **o dono confere** depois da entrega (pendência aberta).

**Aprender (só no aparelho).** Quando perde, a meleca pergunta o nome; se já existe na lista, corrige as respostas
daquele personagem **neste aparelho**; se não existe ("meu irmão"), cria um personagem novo com as respostas daquela
partida e o emoji que a pessoa escolher. Fica no `localStorage` (`bolinho:quem-e:aprendidos`), no nível em que foi
ensinado e nos de cima (ensinado no Infantil aparece em todos; no Adulto não aparece no Infantil). Mais:
- **✏️ Ensinar alguém**: responder as perguntas de uma vez sobre uma pessoa (para o pai cadastrar a família);
- **📤 Passar para outro celular**: gerar um arquivo (ou compartilhar) com o que a meleca aprendeu e **📥 receber** no
  outro aparelho, juntando sem duplicar. Sem servidor (dividir automático entre aparelhos exige servidor: fica fora);
- **🧹 Esquecer**: apagar um aprendido.
Nome digitado é conteúdo da família: nunca sai do aparelho, nunca vai para IA.

**Voz da meleca.**
- **Voz do aparelho** sempre disponível (grátis, sem internet), mais animada: tom e velocidade ajustados por meleca
  (Melekento Blue mais grave e "borbulhante", Pink Honey mais aguda), frases curtas e exclamativas.
- **ElevenLabs opcional**: a pessoa cola a chave dela no **cofre** (`cofre.js`, nome `ia:elevenlabs`, nunca em texto
  aberto) pelas ⚙ do jogo, com o passo a passo para leigo; escolhe a voz de cada meleca numa lista curta. Cada fala
  gerada fica **guardada no aparelho** (Cache Storage, chave = texto + voz) e repete sem gastar cota e sem internet.
  Sem chave, sem internet ou cota acabada → voz do aparelho, sem erro na tela. O texto que vai para a ElevenLabs são só
  as falas da meleca (perguntas e frases do jogo) e o nome do personagem chutado da lista pronta, **nunca** nome
  ensinado pela família (esse é falado pela voz do aparelho).

**Fora da fase 2**: IA para adivinhar personagens fora da lista (com internet), placar entre aparelhos, TV própria.

## 13. O que fica para o construtor

Tamanho exato das cartas por tela, número de caras do Difícil (30–36), nomes da lista, paletas, curvas de animação,
escolha das 10+ músicas e da favorita, sons, textos finais (revisados com humanizer-pt), como juntar/dividir arquivos.
