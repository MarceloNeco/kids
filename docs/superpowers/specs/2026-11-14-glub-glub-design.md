# GLUB GLUB — pescaria (jogo novo do Bolinho de Chuva)

Pedido do dono (13 e 14/Nov/2026), depois de uma entrevista no chat com vídeos e fotos de dois fliperamas de pescaria
(um de tela deitada, claro e alegre, com barcos piratas; outro de tela em pé, escuro e caprichado, com âncora, baús e
lagosta de 500). Os vídeos são **só inspiração**: nada de piratas, mapa do tesouro, nomes, desenhos ou sons copiados.

## Para que e para quem

- Jogo de pescaria para **crianças de 5 a 15 anos, e adultos**, para todas as idades e todos os gêneros. A filha mais nova do
  dono (quase 5 anos, lê alguns números e letras, já joga o fliperama) e a mais velha (quase 9, escreve livros, boa de
  matemática) precisam se divertir **juntas**.
- **Desenho primeiro, número junto**: o valor de cada bicho se entende pelo tamanho e pelo brilho, e o número dos pontos
  aparece junto, para quem já lê.
- Funciona com o celular **em pé e deitado**, no tablet e no computador. Sem internet depois da primeira visita.

## Nome e personagens

- Nome: **GLUB GLUB** (decisão do dono, 14/Nov). Pasta `glub-glub/`, id `glub-glub`, endereço `solverone.com.br/kids/glub-glub/`.
- Dois caipirinhas **originais** (lembram o jeito do interior, mas nada do Chico Bento ou de outro personagem conhecido:
  nem nome, nem roupa característica, nem rosto):
  - **menino** de chapéu de palha **num barquinho de madeira**, à **esquerda**;
  - **menina** caipira **numa ilhota** com um coqueiro, à **direita**.
- Nomes dos dois: proposta minha, **Juca e Lili**. O dono pode trocar.

## Como se pesca (o coração do jogo)

1. O anzol fica **pendurado na ponta da vara, balançando sozinho** de um lado para o outro (pêndulo). A criança não controla o balanço.
2. **🎣 Pescar**: o anzol **mergulha em linha reta na direção em que estava** naquele instante (pode ser reto para baixo ou
   bem inclinado) e **pega o primeiro bicho ou prêmio que encostar**.
3. Se não encostar em nada até o fundo (ou a borda da tela), **sobe sozinho, vazio**.
4. Com o bicho preso, a linha **recolhe sozinha**; quanto maior o bicho, mais devagar (minha proposta). **⬆️ Subir** puxa mais
   rápido. Na descida, o ⬆️ **desiste** e recolhe vazio (para quem viu que ia bater num peixinho de pouco valor).
5. Enquanto a linha está na água, o balanço para; com o anzol de volta à vara, o balanço recomeça.
6. Bicho pescado: brilha, sobe se debatendo, sai da água com respingo, os pontos saltam ("+20") e ele cai no balde do
   personagem (ideia aproveitada da pescaria pequena da Mão na Massa, sem mexer nela).

**O desafio**: soltar no ângulo certo, na hora em que o caminho até os bichos valiosos do fundo está livre dos peixinhos de cima.

## Lugar e bichos

Um lugar só: **o lago encantado sem fundo**. Em cima é uma represa da roça (céu, nuvens, coqueiros, morros); quanto mais
fundo, mais escura e mágica a água (raios de luz, bolhas, luzinhas), e lá embaixo moram os bichos do mar e os fantásticos.

| Faixa | Bichos (proposta) | Pontos (proposta) |
|---|---|---|
| 1. Superfície | lambari, piaba, tilápia, baiacu | 1 a 3 |
| 2. Meio de cima | traíra, pacu, bagre, tartaruga | 5 a 8 |
| 3. Fileira de prêmios | baú, garrafa com bilhete, bota velha | variado (bota velha vale 1, de brincadeira) |
| 4. Meio de baixo | polvo, lagosta, caranguejo gigante, tubarão (tradicional, martelo, tubarão-baleia) | 10 a 30 |
| 5. Fundo | baleia, sereia | 50 a 100 |
| 6. Raro | um bicho lendário (aparece de vez em quando) | 500 |

Os valores exatos, quantos de cada e a velocidade de cada um ficam para o construtor equilibrar. Regra: **mais fundo vale
mais**, e o bicho de cima nunca vale mais que o de baixo.

## Níveis

| | Fácil | Médio | Difícil |
|---|---|---|---|
| Peixes nas faixas de cima | poucos | médio | muitos |
| Velocidade | devagar | médio | rápida |
| Jeito de nadar | reto e previsível | um pouco de vai-e-vem | muda de velocidade e de direção sem aviso |
| Balanço do anzol | devagar | médio | mais rápido |
| Aparelho no modo sozinho | bobinho, erra bastante | razoável | esperto |

## Partida

- **Relógio**: cerca de 60 segundos por partida. No fim, o placar dos dois, as figurinhas novas e o botão **Jogar de novo**.
- **Missão do balde** (no lugar do "mapa" do fliperama, decisão do dono): cada personagem tem um balde com um **pedido
  desenhado** (ex.: 3 lambaris, 2 pacus, 1 caranguejo), com figuras e números. Bicho do pedido pula no balde e o pedido
  vai ticando. Balde cheio: **tempo extra** e um pedido novo, um pouco mais difícil.
- **Bolhas de poder** flutuando, pegas pelo anzol como um bicho:
  - **rede da vovó**: o próximo mergulho pega até 3 bichos perto do anzol;
  - **anzol ligeiro**: desce e sobe mais rápido por uns 10 s;
  - **minhoca dourada**: chama um bicho grande do fundo para subir até o meio por alguns segundos.
- **Rodada bônus "Limpa o Rio!"** (decisão do dono: poluição do rio, nada parecido com o navio do vídeo): uma vez por
  partida, perto da metade, a água fica turva e cai lixo (garrafa PET, lata, sacolinha, pneu velho, chinelo). Por uns
  15 s os dois pescam o lixo, que vale pontos. No fim a água fica limpinha, os peixes voltam felizes e aparece
  "Rio limpo! 🌿". Os peixes somem durante a rodada.
- **Álbum de figurinhas**: cada bicho já pescado vira figurinha (nome, desenho, pontos e quantas vezes foi pescado); os
  que faltam aparecem como sombra. Guardado no aparelho (`localStorage`), aberto pela tela de começo.

## Jeitos de jogar — em 3 entregas (decisão do dono, 14/Nov)

- **Entrega 1 (esta)**:
  - **Sozinho**: a criança escolhe o menino ou a menina; o outro pesca sozinho, jogado pelo aparelho (força pelo nível).
  - **Dois no mesmo aparelho**: tablet ou celular **deitado**, cada criança segura um lado, com 🎣 e ⬆️ embaixo do polegar.
    Celular em pé: só sozinho (os botões ficariam apertados). Tablet em pé com largura suficiente: o construtor decide.
- **Entrega 2**: **TV** com 1 ou 2 celulares/tablets de controle (só 🎣 e ⬆️), pela "sala" de código de 4 letras que a
  Peluqueria, a Purpurina e a Rabiscolândia já usam (Supabase Realtime broadcast, chave pública da plataforma).
- **Entrega 3**: **cada um no seu celular**, com código, como a Batalha Naval (`rede.js`).
- Nas entregas 2 e 3 o toque chega com atraso: cada aparelho manda "apertei com o anzol neste ângulo" e o jogo usa o ângulo
  mandado. Fica registrado aqui para a lógica da Entrega 1 já aceitar um ângulo de fora (sem construir a rede agora).

## Arte e som

- **Gráficos caprichados** (pedido do dono): bichos detalhados, não "de bebê": degradês, escamas, nadadeiras transparentes
  que mexem, olhos com reflexo, sombra, brilho; cenário com céu, nuvens, morros, coqueiro, água em camadas que escurece,
  raios de luz, bolhas, pedras e corais no fundo. Tudo **desenhado no código** (nenhuma imagem de fora). Honestidade
  combinada com o dono: fica bonito e detalhado, mas não igual a 3D de estúdio.
- **Amostra antes do resto** (combinado com o dono): primeiro uma tela com o cenário, os dois caipirinhas e uns 4 bichos
  nadando; prints do celular (em pé e deitado) no chat para ele aprovar o desenho. Só depois o jogo inteiro.
  A amostra fica só no ramo de trabalho (não vai para o site); catálogo, interruptor, `sw.js` e versão entram junto com
  o jogo inteiro, que é publicado de uma vez (minha decisão).
- Efeitos sonoros feitos no código (respingo, "glub glub" das bolhas, carretilha, "plim" dos pontos, festa do balde).
- Música: **pelo menos 10 gravações** de instrumentos de verdade pelo `trilha.js`, das pastas `musicas/` que já existem
  (sem copiar arquivo), seguindo a regra da música; uma **favorita nova** `glub-glub` no `FAVORITAS` (animada, até 2,5 MB).

## Mudança de rumo na arte (dono, 14/Nov/2026)

Depois de duas amostras desenhadas no código ("ainda bem simples"), o dono escolheu **imagens 3D geradas com IA**: o
modelo Qwen-Image (Apache-2.0), num computador alugado no Higgsfield (130 créditos ao todo, autorizados por ele), gerou
os 30 bichos, prêmios, lixo, mergulhador, Juca e Lili; o fundo verde foi recortado e as imagens viraram WebP leves
(`glub-glub/img/`, ~1,4 MB). O cenário (céu, serras, recife, raios de sol, bolhas) continua em código, com 3 lugares
(roça, mar aberto, serra) × 3 horas do dia (dia, entardecer, noite). Bichos novos pedidos no caminho: peixe-palhaço,
cirurgião-azul, água-viva, cavalo-marinho, morsa, orca, peixe-abissal e peixe-lanterna; alguns "fofos" (olhões).

## Padrões da casa (checklist "Jogo novo" do CLAUDE.md)

Pasta própria com `index.html`, `app.js`, `estilo.css`, `sw.js`, `manifest.webmanifest`, ícones, `versoes.json`,
`LEIA-ME.md`, `PENDENCIAS.md`, `CREDITOS.md` e `teste/`; entrada no `catalogo.js` e no `recursos-do-app.json`
(interruptor `glub-glub` no app `kids` do RootifyONE); `../recursos.js` com `data-app="kids"`, `../idioma.js` (só português,
inglês escrito e escondido), `../navegacao.js` (🏠 e 🚪); 3 níveis; sem internet (`sw.js`) e celular deitado; versão igual no
`app.js`, no `sw.js` e no `versoes.json` (começa em 0.1.0); testes do jogo e os vigias da raiz passando
(`node --test teste/*.test.js`); `VERSAO` do `sw.js` da raiz sobe; `ARQUITETURA.md` e `PENDENCIAS.md` da raiz atualizados
(entregas 2 e 3 viram pendências). O item 27 (jogo dos líquidos) **não** é tocado.

## Fora desta entrega (não fazer)

TV, dois celulares, loja de iscas, moedas, anúncios, login, banco, missão de mapa, navio, qualquer coisa de pirata.

## O que daria errado mesmo funcionando

- Personagens ou bichos parecidos com os de uma marca conhecida.
- Fácil difícil demais para a menina de 5 anos (no fácil, ela tem que pegar bicho do fundo com frequência).
- Jogo travando ou lento em celular simples por causa do desenho caprichado.
- Botões pequenos ou cobertos pela barra 🏠/🚪 ou pelo tocador de música no celular deitado.

## Definição de pronto (aviso de 13/Nov) — aplicabilidade

- Manual e orientações: `LEIA-ME.md` e uma ajuda curta na tela de começo (PT e EN escondido).
- Novidades da versão: `versoes.json`.
- Qualidade verificável: testes da lógica, da página e os vigias da raiz; prints do celular em pé e deitado.
- Registro: `PENDENCIAS.md` e `ARQUITETURA.md`.
- Retrocompatibilidade: jogo novo, nada a migrar; o álbum nasce com uma chave própria (`bolinho:glub-glub:*`).
- Segurança e LGPD: sem coleta, tudo no aparelho.
- RootifyONE: interruptor novo `glub-glub` (avisar no resumo). ArchONE: jogo novo no mapa. EaglePlanONE: entregas 2 e 3 no roadmap.
- AssistONE, termos, comunicações e e-mails: não aplicável hoje (o Bolinho não tem AssistONE, conta, termos nem e-mail).

## Dois jogadores: disputa e time ao mesmo tempo (dono aprovou, 14/Nov)

- **Cada jogador escolhe o próprio nível** (a pequena no fácil, a grande no difícil). O nível de cada um vale para o balanço
  e a velocidade do anzol dele e para o pedido do balde dele. Os peixes do lago são os mesmos para os dois e seguem o
  nível **mais fácil** dos dois.
- **Cada um tem o seu balde**; o tempo extra do balde cheio vale para a partida (o relógio é um só).
- No fim: os pontos de cada um, festa para quem ganhou e o **total do time** ("Juntas vocês pescaram 340!" / "Juntos…").

## Decisões minhas (o dono pode mudar)

- O lago inteiro cabe numa tela só, sem rolar: a criança vê o caminho todo até o fundo.
- A rodada "Limpa o Rio!" conta dentro do relógio da partida.
- Os dois anzóis no mesmo bicho: fica com quem encostou primeiro.
- ⬆️ funciona tocando ou segurando.

## Deixado para o construtor

Canvas ou SVG (o que der desempenho com a arte caprichada), valores e velocidades exatos, peso de cada bicho na subida,
posição exata dos botões em cada orientação, tamanho mínimo do tablet em pé para 2 jogadores, quais 10+ músicas e qual a
favorita, como a "inteligência" do aparelho escolhe a hora de soltar.
